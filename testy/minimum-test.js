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

// 7f2) Przełącznik dnia w Ustawieniach: pierwsze kliknięcie wyłącza, drugie włącza z powrotem
D.run(`ACT.minDayToggle({dataset:{id:'${wbId}', s:'${NEXT_WEEK_MON}'}})`);
ok(D.run(`minFor('${NEXT_WEEK_MON}').some(m => m.id === '${wbId}')`) === false, 'przełącznik: pierwsze kliknięcie wyłącza dzień');
D.run(`ACT.minDayToggle({dataset:{id:'${wbId}', s:'${NEXT_WEEK_MON}'}})`);
ok(D.run(`minFor('${NEXT_WEEK_MON}').some(m => m.id === '${wbId}')`) === true, 'przełącznik: drugie kliknięcie włącza dzień z powrotem');
ok(D.run(`screenUstaw().includes('data-act="minDayToggle"')`) === true, 'przełącznik: przyciski dni są w Ustawieniach');

// 7h) Dodanie do kilku wybranych tygodni naraz
const W3 = D.run('addDays(mondayOf(todayISO()), 21)'), W4 = D.run('addDays(mondayOf(todayISO()), 28)');
D.run(`minAddMulti('wielotygodniowy', ['${W3}', '${W4}'])`);
const mId = D.run(`data.minimum.find(m => m.label === 'wielotygodniowy').id`);
ok(D.run(`minFor('${W3}').some(m => m.label === 'wielotygodniowy')`) === true, 'wiele tygodni: jest w 1. wybranym tygodniu');
ok(D.run(`minFor('${W4}').some(m => m.label === 'wielotygodniowy')`) === true, 'wiele tygodni: jest w 2. wybranym tygodniu');
ok(D.run(`minFor('${D.run(`addDays('${W3}', -7)`)}').some(m => m.label === 'wielotygodniowy')`) === false, 'wiele tygodni: w tygodniu nie wybranym punktu nie ma');

// 7i) Okno ✕ zostaje otwarte po kliknięciu dnia i pokazuje stan
D.run(`ACT.minDel({dataset:{id:'${mId}'}})`);
ok(D.run(`document.getElementById('sheetBox').innerHTML.includes('minDayToggle')`) === true, 'okno ✕: pokazuje przyciski dni');
D.run(`ACT.minDayToggle({dataset:{id:'${mId}', s:'${W3}'}})`);
ok(D.run(`minFor('${W3}').some(m => m.id === '${mId}')`) === false, 'okno ✕: klik wyłącza dzień');
ok(D.run(`document.getElementById('sheetBox').innerHTML.includes('minDayToggle')`) === true, 'okno ✕: po kliknięciu nadal otwarte');
D.run(`ACT.minDayToggle({dataset:{id:'${mId}', s:'${W3}'}})`);
ok(D.run(`minFor('${W3}').some(m => m.id === '${mId}')`) === true, 'okno ✕: drugi klik włącza dzień z powrotem');

// 7g) Widok tygodnia w Ustawieniach
D.run(`state.minWeek = '${NEXT_WEEK_MON}'`);
ok(D.run('screenUstaw()').includes('tydzień B'), 'widok tygodnia: w przyszłym tygodniu widać jego punkty');
D.run(`state.minWeek = null`);

// 7j) Wybór tygodni: rok → miesiąc → tygodnie Pn–Nd
const oct = D.run(`weeksOfMonth(2026, 10)`);
ok(oct[0] === '2026-09-28' && oct.includes('2026-10-26') && !oct.includes('2026-11-02'), 'tygodnie: październik 2026 zaczyna się od 28.09 i kończy na 26.10 (tydzień 26.10–01.11 w środku)');
ok(D.run(`weekLabel('2026-10-26')`) === '26.10 – 01.11.2026', 'tygodnie: etykieta 26.10 – 01.11.2026');
ok(oct.every(w => D.run(`new Date('${w}T12:00').getDay()`) === 1), 'tygodnie: każdy start to poniedziałek');
D.run(`state.minPick = []; state.minPickY = 2026; state.minPickM = 10`);
D.run(`ACT.minPickToggle({dataset:{w:'2026-10-26'}})`);
D.run(`ACT.minPickToggle({dataset:{w:'2026-11-02'}})`);
ok(D.run(`state.minPick.length`) === 2, 'wybór: zaznaczone 2 tygodnie');
D.run(`ACT.minPickToggle({dataset:{w:'2026-10-26'}})`);
ok(D.run(`state.minPick.length`) === 1 && D.run(`state.minPick[0]`) === '2026-11-02', 'wybór: drugi klik odznacza tydzień');
ok(D.run(`document.getElementById('sheetBox').innerHTML.includes('Tygodnie')`) === true, 'wybór: okno z tygodniami jest otwarte');
D.run(`minAddMulti('z wyboru', state.minPick)`);
ok(D.run(`minFor('2026-11-02').some(m => m.label === 'z wyboru')`) === true, 'wybór: punkt trafia do zaznaczonego tygodnia');
ok(D.run(`minFor('2026-10-26').some(m => m.label === 'z wyboru')`) === false, 'wybór: punkt nie trafia do odznaczonego tygodnia');
D.run(`state.minPick = []`);

// 8) Stare dane bez dat dalej działają jak dawniej (punkty bez from/until)
ok(D.run(`data.minimum.filter(m => !m.from && !m.until).length`) >= 1, 'stare punkty bez dat nadal obowiązują');

// 9) Każdy przycisk z data-act ma swoją akcję (inaczej kliknięcie nic nie robi)
{
  const used = [...new Set([...APP_SRC.matchAll(/data-act=\\?"(\w+)\\?"/g)].map(m => m[1]))];
  const keys = D.run('Object.keys(ACT)');
  const missing = used.filter(k => !keys.includes(k));
  ok(missing.length === 0, 'wszystkie przyciski mają akcję' + (missing.length ? ' – brakuje: ' + missing.join(', ') : ''));
}

// 10) Regresja v21: drugie kliknięcie dnia włącza z powrotem, okno zostaje otwarte;
//     Dziś: dodaj na dzień, ✕ usuwa, przywróć działa
{
  const D2 = device();
  D2.run(`minAddWeek('Woda', mondayOf(todayISO()), true)`);
  const id = D2.run('data.minimum[0].id');
  const s = D2.run('addDays(mondayOf(todayISO()),2)');
  D2.run(`ACT.minDel({dataset:{id:'${id}'}})`);
  D2.run(`ACT.minDayToggle({dataset:{id:'${id}',s:'${s}'}})`);
  ok(D2.run(`JSON.stringify(data.days['${s}'].minOff||{})`).includes(id), 'dzień: 1. kliknięcie wyłącza');
  ok(D2.run(`!document.getElementById('sheet').classList.contains('hidden')`) === true, 'dzień: okno zostaje otwarte po kliknięciu');
  D2.run(`ACT.minDayToggle({dataset:{id:'${id}',s:'${s}'}})`);
  ok(D2.run(`data.days['${s}'].minOff`) === undefined, 'dzień: 2. kliknięcie włącza z powrotem');
  // Dziś: bez przycisków „Dodaj” i ✕ przy punktach minimum (usunięte na prośbę użytkownika)
  const dziś = D2.run(`(function(){ state.screen='dzis'; return typeof screenDzis==='function' ? screenDzis() : ''; })()`) || '';
  ok(!String(dziś).includes('minAddDay') && !String(dziś).includes('minOffDay') && !String(dziś).includes('dayMin'), 'Dziś: brak przycisków „Dodaj” i ✕ przy punktach minimum');
}

// 11) Okno wyboru tygodni: lata 2026–2030, daty Pn–Nd zgodne z kalendarzem
{
  const D3 = device();
  D3.run('minPickOpen()');
  const html = D3.run(`document.getElementById('sheetBox').innerHTML`);
  const yrs = [...html.matchAll(/data-act="minPickYear" data-y="(\d+)"/g)].map(m => +m[1]);
  ok(JSON.stringify(yrs) === JSON.stringify([2026, 2027, 2028, 2029, 2030]), 'wybór roku: lata 2026–2030');
  const lab = D3.run(`weeksOfMonth(2027,2).map(weekLabel)`);
  ok(lab[0] === '01.02 – 07.02.2027', 'luty 2027: pierwszy tydzień 01.02–07.02 (1.02.2027 to poniedziałek)');
  const lab2 = D3.run(`weeksOfMonth(2026,2).map(weekLabel)`);
  ok(lab2[0] === '26.01 – 01.02.2026' && lab2[4] === '23.02 – 01.03.2026', 'luty 2026: 26.01–01.02 (1.02.2026 to niedziela) … 23.02–01.03');
}

// 12) Punkt dodany w kilku tygodniach jest jedną grupą: „całkowicie” i „od dziś” działają na wszystkie tygodnie
{
  const D4 = device();
  const mon = D4.run('mondayOf(todayISO())');
  const mons = [mon, D4.run(`addDays('${mon}', 7)`), D4.run(`addDays('${mon}', 14)`)];
  D4.run(`minAddMulti('Grupa', ${JSON.stringify(mons)})`);
  const first = D4.run(`data.minimum.find(x => x.label === 'Grupa').id`);
  ok(D4.run(`minGroup('${first}').length`) === 3, 'grupa: 3 tygodnie = 3 wpisy w jednej grupie');
  D4.run(`ACT.minDelAll({dataset:{id:'${first}'}})`);
  ok(D4.run(`data.minimum.filter(x => x.label === 'Grupa').length`) === 0, 'Usuń całkowicie: znikają wszystkie tygodnie, nie tylko bieżący');

  const D5 = device();
  const mon5 = D5.run('mondayOf(todayISO())');
  const m5 = [mon5, D5.run(`addDays('${mon5}', 7)`), D5.run(`addDays('${mon5}', 14)`)];
  D5.run(`minAddMulti('Od teraz', ${JSON.stringify(m5)})`);
  const id5 = D5.run(`data.minimum.find(x => x.label === 'Od teraz').id`);
  D5.run(`ACT.minDelScope({dataset:{id:'${id5}'}})`);
  const t5 = D5.run('todayISO()');
  ok(D5.run(`data.minimum.filter(x => x.label === 'Od teraz' && x.from > todayISO()).length`) === 0, 'Usuń od dziś: znikają przyszłe tygodnie');
  ok(D5.run(`data.minimum.filter(x => x.label === 'Od teraz' && (!x.until || x.until >= todayISO())).length`) === 0, 'Usuń od dziś: nic nie obowiązuje od dziś');
  ok(D5.run(`data.minimum.filter(x => x.label === 'Od teraz').length`) <= 1, 'Usuń od dziś: dni przed dziś zostają w historii');
}

console.log(fails ? `\nMINIMUM TEST: ${fails} FAIL` : '\nMINIMUM TEST ALL PASS');
process.exit(fails ? 1 : 0);
