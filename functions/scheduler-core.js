'use strict';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HH_MM = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

function parseDateTime(date, time) {
  if (typeof date !== 'string' || !ISO_DATE.test(date) || typeof time !== 'string' || !HH_MM.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const normalized = new Date(Date.UTC(year, month - 1, day));
  if (normalized.getUTCFullYear() !== year || normalized.getUTCMonth() !== month - 1 || normalized.getUTCDate() !== day) return null;
  return { year, month, day, hour, minute };
}

function zonedParts(timestamp, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    calendar: 'gregory',
    numberingSystem: 'latn',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(timestamp));
  const out = {};
  for (const part of parts) if (part.type !== 'literal') out[part.type] = Number(part.value);
  return out;
}

function dateKey({ year, month, day }) {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Convert a wall-clock time in an IANA zone to UTC, including DST transitions.
// Nonexistent wall-clock times (for example 02:30 during a spring-forward gap) are skipped.
function zonedDateTimeToUtc(date, time, timeZone) {
  const desired = parseDateTime(date, time);
  if (!desired) return null;
  try {
    let guess = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
    const desiredAsUtc = guess;
    for (let i = 0; i < 5; i++) {
      const got = zonedParts(guess, timeZone);
      const gotAsUtc = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute);
      const correction = desiredAsUtc - gotAsUtc;
      if (correction === 0) break;
      guess += correction;
    }
    const resolved = zonedParts(guess, timeZone);
    if (resolved.year !== desired.year || resolved.month !== desired.month || resolved.day !== desired.day ||
        resolved.hour !== desired.hour || resolved.minute !== desired.minute) return null;
    return guess;
  } catch (error) {
    return null;
  }
}

function dueOccurrence(reminder, nowMs, graceMs = 5 * 60 * 1000) {
  if (!reminder || reminder.enabled === false || typeof reminder.id !== 'string' || !reminder.id || !HH_MM.test(reminder.time || '')) return null;
  const repeat = reminder.repeat || 'once';
  if (!['once', 'daily', 'weekly'].includes(repeat)) return null;
  const timeZone = typeof reminder.timeZone === 'string' && reminder.timeZone ? reminder.timeZone : 'Europe/Warsaw';
  let date;
  try { date = dateKey(zonedParts(nowMs, timeZone)); } catch (error) { return null; }

  if (repeat === 'once') {
    date = reminder.date;
    if (!ISO_DATE.test(date || '')) return null;
  } else if (repeat === 'weekly') {
    if (!Array.isArray(reminder.days) || !reminder.days.length) return null;
    const [year, month, day] = date.split('-').map(Number);
    const mondayIndex = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
    if (!reminder.days.some(value => Number.isInteger(value) && value === mondayIndex)) return null;
  }

  const scheduledAt = zonedDateTimeToUtc(date, reminder.time, timeZone);
  if (scheduledAt === null) return null;
  const lateness = nowMs - scheduledAt;
  if (lateness < 0 || lateness > graceMs) return null;
  return {
    occurrenceKey: `${repeat}:${date}`,
    scheduledAt,
    date,
    lateness
  };
}

module.exports = { dateKey, dueOccurrence, parseDateTime, zonedDateTimeToUtc };
