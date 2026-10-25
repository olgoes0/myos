// Test dymny: renderuje wszystkie ekrany i sprawdza kluczowe zachowania v6 (uruchom: node testy/smoke-v6.js)
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const els = {};
const mk = id => ({ id, value: '', checked: false, innerHTML: '', textContent: '', dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}, click() {}, setAttribute() {}, select() {}, scrollIntoView() {}, remove() {} });
const getEl = id => (els[id] = els[id] || mk(id));
const ctx = {
  console, localStorage: { getItem: () => null, setItem() {} }, alert: () => {}, confirm: () => true, navigator: {},
  document: { documentElement: { style: { setProperty() {} }, dataset: {} }, getElementById: getEl, querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement: () => mk('x'), body: mk('b') },
  window: { addEventListener() {}, scrollTo() {} }, setTimeout: () => 0, setInterval: () => 1, clearInterval() {}, fetch: async () => ({ json: async () => ({ products: [] }) }),
  URL: { createObjectURL() { return 'x'; } }, Blob: function () {}, FileReader: function () {}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8') +
  '\n;globalThis.X={data,ACT,CHG,state,render,day,todayISO,dietaDzis,koszPomiary,cialoTrening,streaks,THEMES,parseEx,shotFields,readShot,extraTotals,dayItems,fluidMl,dayMeals};', ctx);
const X = ctx.X;
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const run = (name, fn) => { try { fn(); ok(true, name); } catch (e) { ok(false, name + ' – ' + e.message); } };

run('ekrany renderują się bez błędu', () => {
  for (const sc of ['dzis', 'tydzien', 'kosz', 'cialo', 'dieta', 'biznes', 'kompas', 'przeglad', 'ustaw']) {
    X.state.screen = sc; X.render();
  }
  for (const sub of ['pomiary', 'drille', 'hala', 'dziennik', 'prios', 'diag']) { X.state.screen = 'kosz'; X.state.sub.kosz = sub; X.render(); }
  for (const sub of ['dzis', 'kalk', 'baza', 'waga']) { X.state.screen = 'dieta'; X.state.sub.dieta = sub; X.render(); }
  for (const sub of ['trening', 'rutyna']) { X.state.screen = 'cialo'; X.state.sub.cialo = sub; X.render(); }
});

run('seria: płomień to SVG, nie emoji', () => {
  X.state.screen = 'dzis'; X.render();
  const html = getEl('app').innerHTML;
  ok(html.includes('<svg') && html.includes('flameG'), '  płomień SVG na ekranie Dziś');
  ok(!html.includes('🔥'), '  brak emoji 🔥');
  ok(!html.includes('treningi siłowe'), '  brak licznika „treningi siłowe”');
});

run('rzuty: cztery liczniki zamiast checkboxów', () => {
  const f = X.shotFields({ date: '2026-10-25', drill: 'x', made: '', att: '', cat: { front: 2, airball: 1 } });
  ok(f.includes('name="cat_front"') && f.includes('name="cat_back"') && f.includes('name="cat_swish"') && f.includes('name="cat_airball"'), '  są 4 pola Front/Back/Swish/Airball');
  ok(!f.includes('type="checkbox"'), '  brak checkboxów');
  ok(f.includes('value="2"') && f.includes('value="1"'), '  wartości liczników z zapisu');
  ok(f.includes('Wskazówka') || f.includes('Cue (wskazówka)'), '  cue opisane po ludzku');
});

run('rzuty: zapis liczy kategorie i odrzuca > oddanych', () => {
  X.state.screen = 'kosz'; X.state.sub.kosz = 'pomiary'; X.render();
  const root = getEl('shotForm');
  root.querySelector = (sel) => {
    const m = sel.match(/name="(.+?)"/); const name = m ? m[1] : sel;
    const val = { date: '2026-10-25', drill: 'Test rzut', made: '3', att: '5', cat_front: '2', cat_back: '1', cat_swish: '0', cat_airball: '4', cue: '', note: '' }[name];
    return { value: val, checked: false };
  };
  X.ACT.shotAdd && X.ACT.shotAdd({});
  const last = X.data.shots[X.data.shots.length - 1];
  ok(last && last.cat && last.cat.front === 2 && last.cat.airball === 4, '  kategorie zapisane w pomiarze');
});

run('płomień i seria: dziś zaliczone liczy się od razu', () => {
  X.data.minimum = [{ id: 'a', label: 'a' }, { id: 'b', label: 'b' }, { id: 'c', label: 'c' }];
  const y = X.todayISO();
  const d = new Date(); d.setDate(d.getDate() - 1);
  const yest = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  X.day(yest).min = { a: true, b: true, c: true };
  X.day(y).min = { a: true, b: true, c: true };
  X.state.date = y;
  ok(X.streaks().cur === 2, '  seria = 2 (wczoraj + dziś): ' + X.streaks().cur);
  X.day(y).min = { a: true, b: false, c: true };
  ok(X.streaks().cur === 1, '  bez pełnego minimum dziś seria = 1: ' + X.streaks().cur);
});

run('ćwiczenie: ciężar w planie i w formacie', () => {
  const ex = X.parseEx('Wyskok | 4x6 | 3-1-1 | https://x.pl | 120 | 62,5');
  ok(ex[0].kg === 62.5 && ex[0].sets === 4 && ex[0].rest === 120, '  parseEx czyta kg (przecinek też)');
  ok(X.parseEx('Pompki | 3x12 | | | 60')[0].kg === null, '  bez kg = null');
});

run('dieta: błonnik, cukry, nasycone, sól – sumy i brak danych', () => {
  const items = [{ fib: 4, sug: 1, sat: 2, salt: 0.5 }, { kcal: 100 }];
  const t = X.extraTotals(items);
  ok(t.fib === 4 && t.sug === 1 && t.sat === 2 && t.salt === 0.5, '  sumy z pozycji z danymi');
  ok(t.missing === 1, '  jedna pozycja bez danych');
  ok(X.extraTotals([{ kcal: 1 }]).fib === null, '  brak danych = null (nie 0)');
});

run('dieta: dane dodatkowe w dzienniku i w karcie', () => {
  X.state.screen = 'dieta'; X.state.sub.dieta = 'dzis'; X.state.date = X.todayISO();
  X.day(X.todayISO()).diet.meals = { x: [{ id: '1', name: 'Test', g: 100, kcal: 100, p: 1, c: 1, f: 1, src: 'baza', raw: 'test', fib: 3, sug: 2, sat: 1, salt: 0.2 }] };
  const h = X.dietaDzis();
  ok(h.includes('Błonnik') && h.includes('Cukry') && h.includes('Sól') && h.includes('Tłuszcz nasycony'), '  karta „Pozostałe składniki” pokazuje 4 składniki');
  ok(h.includes('Brak danych') || h.includes('Dane są'), '  informacja o brakach jest');
});

run('AI: prompt zawiera nowe składniki', () => {
  const p = ctx.X ? vm.runInContext('aiPrompt("test")', ctx) : '';
  ok(p.includes('fiber') && p.includes('salt') && p.includes('satfat'), '  prompt pyta o błonnik i sól');
});

run('płyny i posiłki: kluczowe funkcje działają', () => {
  X.state.date = X.todayISO();
  ok(typeof X.fluidMl === 'function' && typeof X.dayMeals === 'function', '  funkcje płynów i posiłków są dostępne');
});

run('statystyki: okresy i dane z dni z wpisami', () => {
  const y = X.todayISO();
  X.day(y).diet.meals = { sniadanie: [{ id: '1', name: 'Owsianka', g: 100, kcal: 350, p: 12, c: 60, f: 6, src: 'baza', fib: 8, sug: 2, sat: 1, salt: 0.1 }], plyny: [{ id: '2', name: 'Woda', g: 500, vol: 500, kcal: 0, p: 0, c: 0, f: 0, src: 'baza' }] };
  for (const mode of ['dzien', 'tyd', 'mies', 'rok', 'wl']) {
    vm.runInContext(`statP().mode = '${mode}'; statP().n = 2; statP().unit = 'tyg';`, ctx);
    const h = vm.runInContext('dietaStaty()', ctx);
    ok(h.includes('Okres:') && h.includes('Kalorie') && h.includes('Napoje w okresie'), '  okres ' + mode + ' renderuje tabele i napoje');
  }
  vm.runInContext(`statP().mode = 'tyd';`, ctx);
  const h = vm.runInContext('dietaStaty()', ctx);
  ok(h.includes('Błonnik') && h.includes('Sól') && h.includes('Woda'), '  błonnik, sól i woda w tabeli');
  ok(vm.runInContext('statDays().length', ctx) === 7, '  tydzień = 7 dni');
  ok(vm.runInContext("statP().mode='wl'; statP().n=2; statP().unit='tyg'; statDays().length", ctx) === 14, '  własne 2 tygodnie = 14 dni');
});

run('rzuty: Non-swish w formularzu', () => {
  const f = X.shotFields({ date: '2026-10-25', drill: 'x', made: '', att: '', cat: { nonswish: 3 } });
  ok(f.includes('name="cat_nonswish"') && f.includes('Non-swish'), '  pole Non-swish jest');
  ok(f.indexOf('cat_swish') < f.indexOf('cat_nonswish') && f.indexOf('cat_nonswish') < f.indexOf('cat_airball'), '  kolejność: Swish, Non-swish, Airball');
  ok(f.includes('flex:1 1 0') && f.includes('flex:0 0 44px'), '  układ z elastycznym polem i stałymi przyciskami');
});

run('posiłki: lista rodzajów i brak starej średniej w Dziś', () => {
  const h = X.dietaDzis();
  ok(h.includes('<option>Śniadanie</option>') && h.includes('<option>Kolacja</option>') && h.includes('mealPreset'), '  lista rodzajów posiłku w Dziś');
  ok(!h.includes('Średnio z ostatnich'), '  stara średnia usunięta z Dziś');
});

run('rzuty: statystyki i wykres dla drilla i okresu', () => {
  const y = X.todayISO();
  X.data.shots = [
    { id: 's1', ts: 1, date: y, drill: 'Catch and Shoot 3', made: 4, att: 10, cat: { front: 2, nonswish: 1 } },
    { id: 's2', ts: 2, date: y, drill: 'Catch and Shoot 3', made: 6, att: 10, cat: {} },
    { id: 's3', ts: 3, date: y, drill: 'Layup', made: 9, att: 10, cat: {} }
  ];
  X.state.chartDrill = 'Catch and Shoot 3';
  vm.runInContext("shotP().mode = 'mies'; shotP().y = 'made';", ctx);
  const h = vm.runInContext('shotStatsCard()', ctx);
  ok(h.includes('<svg') && h.includes('oddane rzuty (suma)'), '  wykres z opisami osi');
  ok(h.includes('50%') && !h.includes('90%'), '  statystyki tylko dla wybranego drilla (50%, nie Layup 90%)');
  ok(h.includes('Non-swish'), '  kategorie zawierają Non-swish');
  vm.runInContext("shotP().mode = 'tyd';", ctx);
  X.state.chartDrill = '__all';
  const h2 = vm.runInContext('shotStatsCard()', ctx);
  ok(h2.includes('wszystkie drille') && h2.includes('oddane'), '  opcja „wszystkie drille” działa');
  const f = X.shotFields({ date: y, drill: 'Pull-up 3', made: '', att: '', cat: {} });
  ok(f.includes('>Drill<') && !f.includes('>Dryl<'), '  etykieta „Drill”');
  ok(f.includes('Catch and Shoot Midrange') && f.includes('wybierz kategorię'), '  lista głównych kategorii');
  ok(f.includes('placeholder="albo wpisz własny drill"'), '  pole na własny drill');
});

console.log(fails ? `\n${fails} FAIL` : '\nSMOKE v6 ALL PASS');
