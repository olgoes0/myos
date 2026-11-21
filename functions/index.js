'use strict';

const crypto = require('node:crypto');
const { initializeApp } = require('firebase-admin/app');
const { FieldValue, Timestamp, getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { dueOccurrence } = require('./scheduler-core');

initializeApp();
const db = getFirestore();
const LEASE_MS = 4 * 60 * 1000;
const GRACE_MS = 5 * 60 * 1000;
const MAX_BATCH = 500;

function stateDocumentId(reminderId) {
  return crypto.createHash('sha256').update(String(reminderId)).digest('hex');
}

function chunks(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

async function claimDelivery(stateRef, reminderId, occurrenceKey, now) {
  return db.runTransaction(async tx => {
    const snap = await tx.get(stateRef);
    const state = snap.exists ? snap.data() : {};
    if (state.lastSentKey === occurrenceKey) return { claimed: false, successTokenIds: [] };
    if (state.status === 'sending' && state.leaseUntil && state.leaseUntil.toMillis() > now) {
      return { claimed: false, successTokenIds: [] };
    }
    const successTokenIds = state.sendingOccurrence === occurrenceKey && Array.isArray(state.successTokenIds)
      ? state.successTokenIds : [];
    tx.set(stateRef, {
      reminderId,
      status: 'sending',
      sendingOccurrence: occurrenceKey,
      successTokenIds,
      leaseUntil: Timestamp.fromMillis(now + LEASE_MS),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    return { claimed: true, successTokenIds };
  });
}

async function storeBatchSuccesses(stateRef, occurrenceKey, successes) {
  if (!successes.length) return;
  await db.runTransaction(async tx => {
    const snap = await tx.get(stateRef);
    const state = snap.exists ? snap.data() : {};
    if (state.sendingOccurrence !== occurrenceKey) return;
    const ids = new Set(Array.isArray(state.successTokenIds) ? state.successTokenIds : []);
    successes.forEach(id => ids.add(id));
    tx.set(stateRef, { successTokenIds: [...ids], updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  });
}

async function releaseDelivery(stateRef, occurrenceKey, { sent = false, error = '' } = {}) {
  await db.runTransaction(async tx => {
    const snap = await tx.get(stateRef);
    const state = snap.exists ? snap.data() : {};
    if (state.sendingOccurrence !== occurrenceKey) return;
    const fields = {
      status: sent ? 'sent' : 'retry',
      leaseUntil: Timestamp.fromMillis(0),
      updatedAt: FieldValue.serverTimestamp()
    };
    if (sent) fields.lastSentKey = occurrenceKey;
    if (error) fields.lastError = String(error).slice(0, 500);
    else fields.lastError = FieldValue.delete();
    tx.set(stateRef, fields, { merge: true });
  });
}

async function removeInvalidTokens(tokenDocs, response) {
  const invalidCodes = new Set([
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered'
  ]);
  const deletes = [];
  response.responses.forEach((result, index) => {
    if (!result.success && result.error && invalidCodes.has(result.error.code)) deletes.push(tokenDocs[index].ref.delete());
  });
  if (deletes.length) await Promise.allSettled(deletes);
}

async function sendReminder(userRef, reminder, occurrence, tokenDocs) {
  const stateRef = userRef.collection('reminderDeliveryState').doc(stateDocumentId(reminder.id));
  const now = Date.now();
  const claim = await claimDelivery(stateRef, reminder.id, occurrence.occurrenceKey, now);
  if (!claim.claimed) return { sent: 0, skipped: true };

  const available = tokenDocs.filter(snapshot => {
    const value = snapshot.data();
    return value && value.platform === 'android' && typeof value.token === 'string' && value.token.length > 0;
  });
  const alreadySent = new Set(claim.successTokenIds);
  const pending = available.filter(snapshot => !alreadySent.has(snapshot.id));
  if (!pending.length) {
    const complete = available.length > 0 && available.every(snapshot => alreadySent.has(snapshot.id));
    await releaseDelivery(stateRef, occurrence.occurrenceKey, { sent: complete });
    return { sent: 0, skipped: true };
  }

  const messaging = getMessaging();
  const body = typeof reminder.body === 'string' && reminder.body.trim()
    ? reminder.body.trim()
    : `Czas: ${reminder.title}`;
  const title = String(reminder.title || 'Przypomnienie').slice(0, 80);
  let sent = 0, errors = 0;
  try {
    for (const group of chunks(pending, MAX_BATCH)) {
      const message = {
        tokens: group.map(snapshot => snapshot.data().token),
        data: {
          title,
          body: body.slice(0, 180),
          reminderId: String(reminder.id).slice(0, 180),
          url: group.map(snapshot => snapshot.data().scope).find(value => typeof value === 'string' && value) || ''
        },
        webpush: { headers: { TTL: '3600', Urgency: 'high' } }
      };
      const response = await messaging.sendEachForMulticast(message);
      const succeededIds = group.filter((snapshot, index) => response.responses[index].success).map(snapshot => snapshot.id);
      sent += response.successCount;
      errors += response.failureCount;
      await storeBatchSuccesses(stateRef, occurrence.occurrenceKey, succeededIds);
      await removeInvalidTokens(group, response);
    }
    const latest = await stateRef.get();
    const successfulIds = new Set(latest.exists && Array.isArray(latest.data().successTokenIds) ? latest.data().successTokenIds : []);
    const currentTokens = await userRef.collection('pushTokens').get();
    const remainingAndroidTokens = currentTokens.docs.filter(snapshot => {
      const value = snapshot.data();
      return value && value.platform === 'android' && typeof value.token === 'string' && value.token.length > 0;
    });
    const complete = remainingAndroidTokens.length > 0 && remainingAndroidTokens.every(snapshot => successfulIds.has(snapshot.id));
    await releaseDelivery(stateRef, occurrence.occurrenceKey, { sent: complete });
    return { sent, errors, complete };
  } catch (error) {
    await releaseDelivery(stateRef, occurrence.occurrenceKey, { error: error.message || error });
    throw error;
  }
}

exports.dispatchReminders = onSchedule({
  schedule: 'every 1 minutes',
  timeZone: 'UTC',
  region: 'europe-west1',
  maxInstances: 1,
  memory: '256MiB',
  timeoutSeconds: 120
}, async event => {
  const now = Date.now();
  const users = await db.collection('users').get();
  let dueCount = 0, sentCount = 0, userErrors = 0;

  for (const userSnapshot of users.docs) {
    try {
      const userRef = userSnapshot.ref;
      const appSnapshot = await userRef.collection('app').doc('data').get();
      if (!appSnapshot.exists || typeof appSnapshot.data().json !== 'string') continue;
      let data;
      try { data = JSON.parse(appSnapshot.data().json); } catch (error) { continue; }
      if (!data || !Array.isArray(data.reminders) || !data.reminders.length) continue;

      const due = data.reminders
        .map(reminder => ({ reminder, occurrence: dueOccurrence(reminder, now, GRACE_MS) }))
        .filter(item => item.occurrence);
      if (!due.length) continue;
      dueCount += due.length;

      const tokenSnapshot = await userRef.collection('pushTokens').get();
      const tokens = tokenSnapshot.docs.filter(snapshot => {
        const value = snapshot.data();
        return value && value.platform === 'android' && typeof value.token === 'string' && value.token.length > 0;
      });
      if (!tokens.length) continue;

      for (const { reminder, occurrence } of due) {
        try {
          const result = await sendReminder(userRef, reminder, occurrence, tokens);
          sentCount += result.sent || 0;
        } catch (error) {
          userErrors++;
          console.error('Nie udało się wysłać przypomnienia.', { uid: userSnapshot.id, reminderId: reminder.id, error: error.message });
        }
      }
    } catch (error) {
      userErrors++;
      console.error('Błąd sprawdzania przypomnień użytkownika.', { uid: userSnapshot.id, error: error.message });
    }
  }

  console.info('Sprawdzanie przypomnień zakończone.', { users: users.size, dueCount, sentCount, userErrors });
});
