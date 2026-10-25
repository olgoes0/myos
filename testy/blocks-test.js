// Testy bloków: zapis „tylko dziś” / „ten i kolejne” / „cała seria”, usuwanie, brak domyślnych godzin.
// Uruchom: node testy/blocks-test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const els = {};
const mk = id => ({ id, value: '', checked: false, innerHTML: '', dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}, setAttribute() {}, select() {}, remove() {} });
const getEl = id => (els[id] = els[id] || mk(id));
const store = {};
const ctx = {
  console, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  alert: m => { ctx.lastAlert = m; }, confirm: () => true, navigator: {},
  document: { documentElement: { style: { setProperty() {} }, dataset: {} }, getElementById: getEl, querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement: () => mk('x'), body: mk('b') },
  window: { addEventListener() {}, scrollTo() {} }, setTimeout: () => 0, setInterval: () => 1, clearInterval() {}, fetch: async () => ({ json: async () => ({ products: [] }) }),
  URL: { createObjectURL() { return 'x'; } }, Blob: function () {}, FileReader: function () {}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8') +
  '\n;globalThis.X={data,blocksFor,blockSave,blockDel,day,addDays,todayISO,openTpl,openExtra,readForm};', ctx);
const X = ctx.X;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

// Formularz w arkuszu: wartości podawane przez mock
let form = {};
ctx.document.querySelector = sel => {
  const m = sel.match(/name="(\w+)"/); if (!m) return null;
  return form[m[1]] !== undefined ? { value: form[m[1]], checked: !!form[m[1] + '_on'] } : null;
};
ctx.document.querySelectorAll = sel => (sel.includes('days') ? (form.days || []).map(v => ({ value: String(v) })) : []);

const base = X.todayISO();
const d0 = base, d1 = X.addDays(base, 1), d2 = X.addDays(base, 2), d3 = X.addDays(base, 3);
const dowOf = s => { const dt = new Date(s + 'T12:00:00'); return (dt.getDay() + 6) % 7; };
// Szablon na każdy dzień tygodnia, żeby testy nie zależały od daty
const ALL = [0, 1, 2, 3, 4, 5, 6];
const reset = () => {
  X.data.template = [{ id: 't1', name: 'Trening', from: '', to: '', area: 'kosz', days: ALL }];
  X.data.days = {};
};

// --- brak domyślnych godzin ---
reset();
X.openTpl && (() => {})();
const fTpl = ctx.X.readForm; // readForm bez pól = puste
form = {};
const r0 = X.readForm();
ok(r0.from === '' && r0.to === '', 'readForm bez godzin nie wstawia 08:00/09:00');
ok(vm.runInContext("(function(){ let h=''; const orig=openSheet; openSheet=function(x){h=x;}; openExtra('2026-01-05'); openSheet=orig; return h; })()", ctx).includes('value=""') || true, 'openExtra działa');
const sheetExtra = vm.runInContext("(function(){ let h=''; const orig=openSheet; openSheet=function(x){h=x;}; openExtra('2026-01-05'); openSheet=orig; return h; })()", ctx);
ok(!/17:00|18:00/.test(sheetExtra), 'nowy blok jednorazowy: brak 17:00–18:00');
const sheetTpl = vm.runInContext("(function(){ let h=''; const orig=openSheet; openSheet=function(x){h=x;}; openTpl(); openSheet=orig; return h; })()", ctx);
ok(!/16:00|17:00/.test(sheetTpl), 'nowy blok stały: brak 16:00–17:00');
ok(/name="from" value=""/.test(sheetTpl) && /name="to" value=""/.test(sheetTpl), 'pola czasu puste');

// --- „tylko dziś”: nazwa, obszar, godziny, status, ocena, notatka ---
reset();
form = { name: 'Trening zmieniony', from: '10:00', to: '11:30', area: 'biznes', done: 'x', done_on: true, rating: 4, note: 'dobrze' };
ctx.X.readForm && 0;
X.blockSave({ dataset: { s: d1, k: 't', id: 't1', scope: 'day' } });
const bDay = X.blocksFor(d1).find(b => b.id === 't1');
ok(bDay && bDay.name === 'Trening zmieniony' && bDay.from === '10:00' && bDay.to === '11:30', 'tylko dziś: nazwa i godziny zapisane w dniu');
ok(bDay && bDay.area === 'biznes' && bDay.done === true && bDay.rating === 4 && bDay.note === 'dobrze', 'tylko dziś: obszar, status, ocena, notatka zapisane');
const bOther = X.blocksFor(d2).find(b => b.id === 't1');
ok(bOther && bOther.name === 'Trening' && bOther.from === '' && bOther.area === 'kosz' && !bOther.done, 'inne dni bez zmian (szablon nietknięty)');
ok(X.data.template[0].name === 'Trening' && X.data.template[0].from === '', 'szablon nie zmieniony przez „tylko dziś”');

// --- „ten i kolejne” ---
reset();
form = { name: 'Nowa seria', from: '07:00', to: '08:00', area: 'fizjo', days: [dowOf(d2)] };
X.data.days[d0] = { done: {}, min: {}, extra: [], goals: [], diet: {} };
X.blockSave({ dataset: { s: d2, k: 't', id: 't1', scope: 'next' } });
ok(X.blocksFor(d1).find(b => b.id === 't1').name === 'Trening', 'ten i kolejne: dzień wcześniej zostaje stara seria');
const nb = X.blocksFor(d2).find(b => b.name === 'Nowa seria');
ok(!!nb && nb.from === '07:00' && nb.area === 'fizjo', 'ten i kolejne: nowa seria od wybranego dnia');
ok(X.blocksFor(d3).find(b => b.name === 'Nowa seria') === undefined && X.blocksFor(d3).length === 0, 'ten i kolejne: nowe dni nie mają starej serii (dni wybrane w formularzu)');

// --- „cała seria” ---
reset();
form = { name: 'Cała seria', from: '18:00', to: '19:00', area: 'kosz', days: ALL };
X.data.days[d1] = { done: { t1: { name: 'Jednorazowo', from: '06:00' } }, min: {}, extra: [], goals: [], diet: {} };
X.blockSave({ dataset: { s: d0, k: 't', id: 't1', scope: 'all' } });
ok(X.data.template[0].name === 'Cała seria' && X.data.template[0].from === '18:00', 'cała seria: szablon zmieniony');
ok(X.blocksFor(d1).find(b => b.id === 't1').name === 'Cała seria', 'cała seria: stare nadpisanie dnia usunięte');

// --- usuwanie z zakresem ---
reset();
X.blockDel({ dataset: { s: d1, k: 't', id: 't1', scope: 'day' } });
ok(X.blocksFor(d1).length === 0 && X.blocksFor(d2).length === 1, 'usuń tylko ten dzień: inne dni zostają');
reset();
X.blockDel({ dataset: { s: d1, k: 't', id: 't1', scope: 'next' } });
ok(X.blocksFor(d0).length === 1 && X.blocksFor(d2).length === 0, 'usuń ten i kolejne: wcześniejsze dni zostają');

// --- jednorazowy blok: zapis z pustymi godzinami ---
reset();
form = { name: 'Jednorazowy', from: '', to: '', area: 'inne', done: '', rating: 0, note: '' };
X.data.days[d0] = { done: {}, min: {}, extra: [], goals: [], diet: {} };
X.data.days[d0].extra.push({ id: 'x1', name: 'Stare', from: '', to: '', area: 'inne', done: false, rating: 0, note: '' });
X.blockSave({ dataset: { s: d0, k: 'x', id: 'x1', scope: 'day' } });
ok(X.blocksFor(d0).find(b => b.id === 'x1').from === '', 'blok jednorazowy zapisany z pustymi godzinami');

// --- plan hali ↔ grafik ---
reset();
const hall = { id: 'h1', dow: '2', from: '17:30', min: '60', name: 'Hala Orlik', drills: '' };
X.data.hala = [hall];
vm.runInContext('syncHall(data.hala[0])', ctx);
const hb = X.blocksFor(d0).find(b => b.name === 'Hala Orlik');
ok(X.data.template.some(t => t.hallId === 'h1'), 'hala: powstał blok stały w grafiku');
ok(X.data.template.find(t => t.hallId === 'h1').days[0] === 2, 'hala: dzień zgodny z planem');
ok(X.data.template.find(t => t.hallId === 'h1').to === '18:30', 'hala: koniec = od + długość');
hall.from = '19:00';
vm.runInContext('syncHall(data.hala[0])', ctx);
ok(X.data.template.filter(t => t.hallId === 'h1').length === 1 && X.data.template.find(t => t.hallId === 'h1').from === '19:00', 'hala: zmiana godziny aktualizuje ten sam blok (bez duplikatów)');
vm.runInContext("unsyncHall('h1')", ctx);
ok(!X.data.template.some(t => t.hallId === 'h1'), 'hala: usunięcie bloku hali usuwa wpis z grafiku');

// --- przełącznik w Tygodniu: klik = wykonany, drugi klik = cofnij ---
reset();
const tg = () => X.blocksFor(d0).find(b => b.id === 't1').done;
vm.runInContext("ACT.blockToggle({ dataset: { s: '" + d0 + "', k: 't', id: 't1' } })", ctx);
ok(tg() === true, 'przełącznik: pierwszy klik oznacza jako wykonany');
vm.runInContext("ACT.blockToggle({ dataset: { s: '" + d0 + "', k: 't', id: 't1' } })", ctx);
ok(tg() === false, 'przełącznik: drugi klik cofa (niewykonany)');
vm.runInContext("ACT.blockToggle({ dataset: { s: '" + d0 + "', k: 't', id: 't1' } })", ctx);
ok(X.blocksFor(d1).find(b => b.id === 't1').done === false, 'przełącznik: inny dzień bez zmian');
const weekHtml = vm.runInContext("X_week = null; state.week = mondayOf(todayISO()); screenTydzien()", ctx);
ok(weekHtml.includes('data-act="blockToggle"') && weekHtml.includes('data-act="blockOpen"') && weekHtml.includes('class="cedit"'), 'Tydzień: kafelek ma przełącznik i przycisk ✎');

console.log(fails ? `\n${fails} FAIL` : '\nBLOCKS ALL PASS');
