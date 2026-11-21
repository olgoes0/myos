'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { dueOccurrence, parseDateTime, zonedDateTimeToUtc } = require('../scheduler-core');

test('rejects invalid dates and times', () => {
  assert.equal(parseDateTime('2026-02-30', '09:30'), null);
  assert.equal(parseDateTime('2026-11-21', '24:00'), null);
  assert.equal(zonedDateTimeToUtc('2026-11-21', '09:30', 'No/Such_Zone'), null);
});

test('sends a one-time reminder only in the five-minute window', () => {
  const at = zonedDateTimeToUtc('2026-11-21', '09:30', 'UTC');
  const reminder = { id: 'once-1', repeat: 'once', date: '2026-11-21', time: '09:30', timeZone: 'UTC' };
  assert.equal(dueOccurrence(reminder, at - 1), null);
  assert.equal(dueOccurrence(reminder, at + 4 * 60 * 1000).occurrenceKey, 'once:2026-11-21');
  assert.equal(dueOccurrence(reminder, at + 5 * 60 * 1000 + 1), null);
});

test('daily reminders use the selected IANA timezone', () => {
  const at = zonedDateTimeToUtc('2026-11-21', '09:30', 'Europe/Warsaw');
  const reminder = { id: 'daily-1', repeat: 'daily', time: '09:30', timeZone: 'Europe/Warsaw' };
  assert.equal(dueOccurrence(reminder, at).occurrenceKey, 'daily:2026-11-21');
  assert.equal(dueOccurrence(reminder, at + 6 * 60 * 1000), null);
});

test('weekly reminders use Monday-based day numbers', () => {
  const at = zonedDateTimeToUtc('2026-11-23', '08:00', 'Europe/Warsaw'); // Monday
  const reminder = { id: 'weekly-1', repeat: 'weekly', days: [0], time: '08:00', timeZone: 'Europe/Warsaw' };
  assert.equal(dueOccurrence(reminder, at).occurrenceKey, 'weekly:2026-11-23');
  assert.equal(dueOccurrence({ ...reminder, days: [1] }, at), null);
});

test('disabled reminders and nonexistent spring-forward times do not fire', () => {
  const at = zonedDateTimeToUtc('2026-11-21', '09:30', 'UTC');
  assert.equal(dueOccurrence({ id: 'off', enabled: false, repeat: 'daily', time: '09:30', timeZone: 'UTC' }, at), null);
  assert.equal(zonedDateTimeToUtc('2026-03-29', '02:30', 'Europe/Warsaw'), null);
});
