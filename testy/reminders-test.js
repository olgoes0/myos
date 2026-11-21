// Testy formularza i ekranu Przypomnienia (uruchom: node testy/reminders-test.js)
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const elements = {};
const makeElement = id => {
  const classes = new Set();
  return {
    id, value: '', checked: false, innerHTML: '', textContent: '', dataset: {}, style: {},
    classList: {
      toggle(name, force) { if (force === undefined ? !classes.has(name) : force) classes.add(name); else classes.delete(name); },
      add(name) { classes.add(name); }, remove(name) { classes.delete(name); }, contains(name) { return classes.has(name); }
    },
    addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null,
    focus() {}, click() {}, setAttribute() {}, select() {}, scrollIntoView() {}, remove() {}
  };
};
const getElement = id => (elements[id] = elements[id] || makeElement(id));
const storage = new Map();
const ctx = {
  console,
  localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
  alert: () => {}, confirm: () => true,
  navigator: { userAgent: 'Android', serviceWorker: {} },
  Notification: { permission: 'default' },
  document: {
    documentElement: { style: { setProperty() {} }, dataset: {} },
    getElementById: getElement, querySelectorAll: () => [], querySelector: () => null,
    addEventListener() {}, createElement: () => makeElement('x'), body: makeElement('body')
  },
  window: { addEventListener() {}, scrollTo() {} },
  setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
  fetch: async () => ({ json: async () => ({ products: [] }) }),
  URL: { createObjectURL() { return 'blob:test'; } }, Blob: function () {}, FileReader: function () {}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8') +
  '\n;globalThis.X={data,ACT,CHG,state,render,DEFAULTS,screenPrzypomnienia,reminderRepeatLabel,reminderExpired,openReminder,readReminderForm};', ctx);
const X = ctx.X;
const pageHtml = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8');
const appSource = fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
let fails = 0;
const assert = (condition, message) => { console.log((condition ? 'PASS ' : 'FAIL ') + message); if (!condition) fails++; };

assert(Array.isArray(X.data.reminders), 'eski i nowe dane dostają listę przypomnień');
assert(pageHtml.includes('id="mainNav"') && pageHtml.includes('data-to="przypomnienia"') && pageHtml.includes('>Przypomnienia</span>'), 'Przypomnienia mają widoczny przycisk na stałym pasku nawigacji');
assert(pageHtml.includes('<strong class="top-motto-title">Trust The Process.</strong>') && pageHtml.includes('<strong class="top-motto-quote">“One missed shot isn’t the end of the world.”</strong>'), 'oba pogrubione hasła są w stałym nagłówku wspólnym dla podstron');
assert(appSource.includes("['dzis', 'tydzien', 'przypomnienia']") && pageHtml.includes('app.js?v=20261121-foods-favorites-6'), 'odnośnik jest też w menu, a skrypt ma wymuszone odświeżenie cache');
X.data.reminders = [];
let html = X.screenPrzypomnienia();
assert(html.includes('Moje przypomnienia') && html.includes('Dodaj przypomnienie'), 'ekran listy przypomnień renderuje pusty stan');
assert(html.includes('Otwórz Life OS w Chrome na Androidzie') === false, 'Android nie dostaje komunikatu o wersji desktopowej');

X.openReminder();
html = getElement('sheetBox').innerHTML;
assert(html.includes('Jednorazowo') && html.includes('Codziennie') && html.includes('Wybrane dni'), 'formularz oferuje trzy tryby powtarzania');
assert(html.includes('name="remDate"') && html.includes('name="remDays"') && html.includes('type="time"'), 'formularz zawiera datę, dni i godzinę');

const current = new Date();
const today = [current.getFullYear(), String(current.getMonth() + 1).padStart(2, '0'), String(current.getDate()).padStart(2, '0')].join('-');
X.data.reminders = [{ id: 'once-test', title: 'Test', time: '09:00', repeat: 'once', date: today, enabled: true }];
assert(X.reminderRepeatLabel(X.data.reminders[0]).includes('jednorazowo'), 'etykieta jednorazowego przypomnienia jest czytelna');
assert(X.screenPrzypomnienia().includes('Test'), 'lista pokazuje zapisane przypomnienie');

const inputs = {
  remTitle: { value: 'Pić wodę' }, remBody: { value: 'Szklanka wody' }, remTime: { value: '10:15' },
  repeat: { value: 'weekly' }, remDate: { value: '' }
};
ctx.document.querySelector = selector => {
  const match = selector.match(/name="([^"]+)"/);
  return match ? (inputs[match[1]] || null) : null;
};
ctx.document.querySelectorAll = selector => selector.includes('remDays') ? [{ value: '0' }, { value: '4' }] : [];
X.ACT.reminderSave({ dataset: { id: '' } });
const saved = X.data.reminders[X.data.reminders.length - 1];
assert(saved && saved.title === 'Pić wodę' && saved.time === '10:15', 'zapisuje tytuł i godzinę');
assert(saved && saved.repeat === 'weekly' && saved.days.length === 2 && saved.timeZone, 'zapisuje cykl, wybrane dni i strefę czasową');
assert(getElement('sheet').classList.contains('hidden'), 'formularz jest zamykany po zapisie');

X.data.reminders = [{ id: 'daily-test', title: 'Codziennie', time: '08:00', repeat: 'daily', enabled: true }];
assert(X.reminderRepeatLabel(X.data.reminders[0]) === 'codziennie', 'etykieta codziennych przypomnień działa');

if (fails) process.exitCode = 1;
else console.log('\nREMINDERS ALL PASS');
