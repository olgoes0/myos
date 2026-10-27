// Test minimum dnia z zakresami (v20): tylko dziś / ten tydzień / na zawsze.
// Sprawdza, że zmiana dziś nie psuje serii za wcześniejsze dni.
// Uruchom: node testy/minimum-test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const APP_SRC = fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

function device() {
  const st = {};
  const mk = id => ({ id, value: '', checked: false, innerHTML: '', dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}, setAttribute() {}, select() {}, remove() {} });
  const els = {};
  const ctx = {
    console, localStorage: { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } },
    alert: () => {}, confirm: () => true, navigator: { onLine: true },
    document: { documentElement: { style: { setProperty() {} }, dataset: {} }, getElementById: id => (els[id] = els[id] || mk(id)), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement: () => mk('x'), body: mk('b') },
    window: { addEventListener() {}, scrollTo() {} },
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 1, clearInterval() {}, fetch: async () => ({ json: async () => ({ products: [] }) }),
    URL: { createObjectURL() { return 'x'; } }, Blob: function () {}, FileReader: function () {}
  };
  vm.createContext(ctx);
  vm.runInContext(APP_SRC, ctx);
  return { run: code => vm.runInContext(code, ctx) };
}

const D = device();
const T = D.run('todayISO()'), Y = D.run('addDays(todayISO(), -1)'), TOM = D.run('addDays(todayISO(), 1)');
const SUN = D.run('weekEnd(todayISO())');
const NEXT_MON = D.run('addDays(weekEnd(todayISO()), 1)');
const base = D.run('data.minimum.map(m => m.id)');   // 3 domyślne punkty (bez dat)

// Wczoraj: wszystkie 3 punkty zrobione → dzień zaliczony
D.run(`day('${Y}').min = {${base.map(id => `'${id}': true`).join(',')}}`);
ok(D.run(`dayComplete('${Y}')`) === true, 'start: wczoraj zaliczony (3/3)');

// 1) Dodanie „na zawsze” z Ustawień nie psuje wczoraj
D.run("minAddScoped('nowy na zawsze', 'all')");
ok(D.run(`dayComplete('${Y}')`) === true, 'na zawsze: dodanie punktu NIE psuje serii za wczoraj');
ok(D.run(`minFor('${T}').length`) === 4, 'na zawsze: dziś widzi 4 punkty');
ok(D.run(`minFor('${Y}').length`) === 3, 'na zawsze: wczoraj nadal 3 punkty');

// 2) Dziś: nowy punkt nie jest zrobiony → dzień niezaliczony, ale wczoraj zostaje
ok(D.run(`dayComplete('${T}')`) === false, 'dziś: bez odhaczenia nowego punktu dzień niezaliczony');
const newId = D.run(`data.minimum.find(m => m.label === 'nowy na zawsze').id`);
D.run(`day('${T}').min = {${[...base, newId].map(id => `'${id}': true`).join(',')}}`);
ok(D.run(`dayComplete('${T}')`) === true, 'dziś: po odhaczeniu 4/4 dzień zaliczony');

// 3) „Tylko ten dzień” – punkt na dziś, nie wpływa na jutro
D.run(`minDayAdd('${T}', 'jednorazowy')`);
ok(D.run(`minFor('${T}').length`) === 5, 'tylko dziś: dzisiaj jest 5 punktów');
ok(D.run(`minFor('${TOM}').length`) === 4, 'tylko dziś: jutro nadal 4 punkty');

// 4) Ukrycie domyślnego punktu tylko na dziś
D.run(`minDayOff('${T}', '${base[0]}')`);
ok(D.run(`minFor('${T}').some(m => m.id === '${base[0]}')`) === false, 'ukrycie: dziś bez punktu');
ok(D.run(`minFor('${TOM}').some(m => m.id === '${base[0]}')`) === true, 'ukrycie: jutro punkt jest');
D.run(`delete day('${T}').minOff`);
ok(D.run(`minFor('${T}').some(m => m.id === '${base[0]}')`) === true, 'przywróć: punkt wraca na dziś');

// 5) „Ten tydzień” – usunięcie domyślnego punktu do niedzieli, potem wraca
D.run(`minRemoveScoped('${base[1]}', 'week')`);
ok(D.run(`minFor('${T}').some(m => m.id === '${base[1]}')`) === false, 'tydzień: dziś bez punktu');
ok(D.run(`minFor('${SUN}').some(m => m.id === '${base[1]}')`) === false, 'tydzień: w niedzielę nadal bez punktu');
ok(D.run(`minFor('${NEXT_MON}').some(m => m.id === '${base[1]}')`) === true, 'tydzień: od poniedziałku punkt wraca');

// 6) „Na zawsze” – usunięcie domyślnego punktu od dziś, wczoraj zostaje
D.run(`minRemoveScoped('${base[2]}', 'all')`);
ok(D.run(`minFor('${T}').some(m => m.id === '${base[2]}')`) === false, 'na zawsze (usuń): dziś bez punktu');
ok(D.run(`minFor('${Y}').some(m => m.id === '${base[2]}')`) === true, 'na zawsze (usuń): wczoraj punkt zostaje w historii');
ok(D.run(`dayComplete('${Y}')`) === true, 'na zawsze (usuń): seria za wczoraj zaliczona nadal');

// 7) Punkt dodany dziś i od razu usunięty na zawsze znika całkiem
D.run("minAddScoped('krótki', 'all')");
const shortId = D.run(`data.minimum.find(m => m.label === 'krótki').id`);
D.run(`minRemoveScoped('${shortId}', 'all')`);
ok(D.run(`data.minimum.some(m => m.id === '${shortId}')`) === false, 'dodany i od razu usunięty: znika z listy');

// 7b) Ustawienia pokazują tylko punkty aktywne od dziś (usunięty „na zawsze” znika z listy)
const settingsHtml = D.run('screenUstaw()');
ok(!settingsHtml.includes(`data-id="${base[2]}"`), 'Ustawienia: punkt usunięty „na zawsze” nie jest już na liście');
ok(settingsHtml.includes(`data-id="${base[0]}"`), 'Ustawienia: punkt nadal aktywny jest na liście');
ok(D.run(`(data.minimum.find(m => m.id === '${base[2]}') || {}).until`) === Y, 'Ustawienia: punkt „na zawsze” ma koniec wczoraj (historia zostaje)');

// 7c) Dopisanie do wybranego tygodnia (od poniedziałku do niedzieli)
const NEXT_WEEK_MON = D.run('addDays(mondayOf(todayISO()), 7)');
const NEXT_WEEK_SUN = D.run('weekEnd(addDays(mondayOf(todayISO()), 7))');
D.run(`minAddWeek('tydzień B', '${NEXT_WEEK_MON}', false)`);
const wbId = D.run(`data.minimum.find(m => m.label === 'tydzień B').id`);
ok(D.run(`minFor('${NEXT_WEEK_MON}').some(m => m.id === '${wbId}')`) === true, 'tydzień: punkt widoczny w poniedziałek wybranego tygodnia');
ok(D.run(`minFor('${NEXT_WEEK_SUN}').some(m => m.id === '${wbId}')`) === true, 'tydzień: punkt widoczny w niedzielę wybranego tygodnia');
ok(D.run(`minFor('${D.run(`addDays('${NEXT_WEEK_SUN}', 1)`)}').some(m => m.id === '${wbId}')`) === false, 'tydzień: po niedzieli punkt znika');
ok(D.run(`minFor('${T}').some(m => m.id === '${wbId}')`) === false, 'tydzień: w tym tygodniu punktu nie ma');

// 7d) Usunięcie jednego dnia w wybranym tygodniu (z Ustawień)
D.run(`minHideDay('${wbId}', '${NEXT_WEEK_MON}')`);
ok(D.run(`minFor('${NEXT_WEEK_MON}').some(m => m.id === '${wbId}')`) === false, 'jeden dzień: w wybrany dzień punkt znika');
ok(D.run(`minFor('${D.run(`addDays('${NEXT_WEEK_MON}', 1)`)}').some(m => m.id === '${wbId}')`) === true, 'jeden dzień: w inne dni tygodnia punkt zostaje');
ok(D.run(`(data.minimum.find(m => m.id === '${wbId}'))`) !== undefined, 'jeden dzień: punkt nadal istnieje w tygodniu');
D.run(`minRestoreWeek('${wbId}', '${NEXT_WEEK_MON}')`);
ok(D.run(`minFor('${NEXT_WEEK_MON}').some(m => m.id === '${wbId}')`) === true, 'przywróć dni: punkt wraca w poniedziałek');

// 7e) Cały tydzień
D.run(`minHideWeek('${wbId}', '${NEXT_WEEK_MON}')`);
ok(D.run(`minFor('${NEXT_WEEK_SUN}').some(m => m.id === '${wbId}')`) === false, 'cały tydzień: w żaden dzień tygodnia punktu nie ma');
D.run(`minRestoreWeek('${wbId}', '${NEXT_WEEK_MON}')`);

// 7f) Całkowite usunięcie: z listy i z historii (także zaliczenia)
D.run(`day('${Y}').min['${base[0]}'] = true`);
D.run(`minDeleteAll('${base[0]}')`);
ok(D.run(`data.minimum.some(m => m.id === '${base[0]}')`) === false, 'całkowicie: punkt zniknął z listy');
ok(D.run(`Object.values(data.days).every(d => !(d.min && d.min['${base[0]}']) && !(d.minOff && d.minOff['${base[0]}']))`) === true, 'całkowicie: zniknął też z historii dni');
ok(D.run(`screenUstaw().includes('data-id="${base[0]}"')`) === false, 'całkowicie: nie ma go w Ustawieniach');

// 7g) Widok tygodnia w Ustawieniach
D.run(`state.minWeek = '${NEXT_WEEK_MON}'`);
ok(D.run('screenUstaw()').includes('tydzień B'), 'widok tygodnia: w przyszłym tygodniu widać jego punkty');
D.run(`state.minWeek = null`);

// 8) Stare dane bez dat dalej działają jak dawniej (punkty bez from/until)
ok(D.run(`data.minimum.filter(m => !m.from && !m.until).length`) >= 1, 'stare punkty bez dat nadal obowiązują');

console.log(fails ? `\nMINIMUM TEST: ${fails} FAIL` : '\nMINIMUM TEST ALL PASS');
process.exit(fails ? 1 : 0);
