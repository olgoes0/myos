// Test kopii zapasowych, cofania i podglądu dla agentów (atrapa Firebase).
// UWAGA: to test logiki na atrapie. Reguły Firebase i odczyt linku trzeba sprawdzić na prawdziwym projekcie.
// Uruchom: node testy/backup-test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const APP_SRC = fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8');
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Atrapa Firebase z kolekcjami i usuwaniem (klucz = ścieżka dokumentu, np. "users/u1/backups/123")
function fakeFB(cloud, uid) {
  const clone = v => JSON.parse(JSON.stringify(v));
  return {
    auth: { currentUser: { uid, email: uid + '@test' } }, db: {}, projectId: 'my-os-2c0bf',
    doc: (db, ...p) => p.join('/'),
    collection: (db, ...p) => ({ col: p.join('/') }),
    query: col => col,
    orderBy: (f, d) => ({ f, d }),
    getDoc: async p => ({ exists: () => p in cloud, data: () => clone(cloud[p]) }),
    setDoc: async (p, v) => { cloud[p] = clone(v); },
    deleteDoc: async p => { delete cloud[p]; },
    getDocs: async q => {
      const pre = q.col + '/';
      const docs = Object.keys(cloud).filter(k => k.startsWith(pre) && !k.slice(pre.length).includes('/'))
        .map(k => ({ data: () => clone(cloud[k]) }))
        .sort((a, b) => b.data().ts - a.data().ts);
      return { docs };
    },
    onUser: () => {}, signIn: async () => {}, register: async () => {}, signOut: async () => {}
  };
}
function device(cloud, uid, store) {
  const st = store || {};
  const mk = id => ({ id, value: '', checked: false, innerHTML: '', dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}, setAttribute() {}, select() {}, remove() {} });
  const els = {};
  const ctx = {
    console, localStorage: { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } },
    alert: () => {}, confirm: () => true, navigator: { onLine: true, clipboard: { writeText: async () => {} } },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); return a; } },
    document: { documentElement: { style: { setProperty() {} }, dataset: {} }, getElementById: id => (els[id] = els[id] || mk(id)), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement: () => mk('x'), body: mk('b') },
    window: { addEventListener() {}, scrollTo() {}, FB: fakeFB(cloud, uid) },
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 1, clearInterval() {}, fetch: async () => ({ json: async () => ({ products: [] }) }),
    URL: { createObjectURL() { return 'x'; } }, Blob: function () {}, FileReader: function () {}
  };
  vm.createContext(ctx);
  vm.runInContext(APP_SRC, ctx);
  return { ctx, st, run: code => vm.runInContext(code, ctx) };
}

(async () => {
  const cloud = {};
  const D = device(cloud, 'u1', {});

  // --- kopia lokalna i automatyczna ---
  D.run("day(todayISO()).diet.waterL = 1; save();");
  const n1 = D.run("bkLocal().length");
  ok(n1 >= 1, 'auto: po zapisie powstała kopia lokalna');
  D.run("day(todayISO()).diet.waterL = 1.5; save();");
  ok(D.run("bkLocal().length") === n1, 'auto: druga zmiana w tej samej godzinie nie tworzy nowej kopii');

  // --- ręczna kopia trafia do chmury ---
  D.run("bkMake('test-reczna')");
  await sleep(20);
  const bkDocs = Object.keys(cloud).filter(k => k.startsWith('users/u1/backups/'));
  ok(bkDocs.length >= 1, 'chmura: kopia zapisana w users/u1/backups');
  ok(D.run("bkCloud.length") >= 1, 'chmura: lista kopii odświeżona w aplikacji');

  // --- cofanie do kopii lokalnej ---
  D.run("day(todayISO()).diet.waterL = 1; bkMake('punkt-A');");
  const tsA = D.run("bkLocal()[0].ts");
  D.run("day(todayISO()).diet.waterL = 2.5; save();");
  ok(D.run("day(todayISO()).diet.waterL") === 2.5, 'cofnięcie: przed cofnięciem dane mają 2.5 l');
  D.run(`bkRestore('local', ${tsA})`);
  ok(D.run("day(todayISO()).diet.waterL") === 1, 'cofnięcie: dane wróciły do wartości z kopii (1 l)');
  ok(D.run("bkLocal().some(x => x.label === 'przed cofnięciem')"), 'cofnięcie: obecne dane zostały zapisane jako kopia (można je odzyskać)');

  // --- cofanie do kopii z chmury ---
  const cloudTs = Number(bkDocs[0].split('/').pop());
  D.run("day(todayISO()).diet.waterL = 9; save();");
  D.run(`bkRestore('cloud', ${cloudTs})`);
  ok(D.run("day(todayISO()).diet.waterL") !== 9, 'cofnięcie z chmury: dane nie są już 9 l');

  // --- podgląd dla agentów ---
  ok(D.run("shareS.on") === false, 'podgląd: domyślnie wyłączony');
  await D.run("shareOn()");
  await sleep(20);
  const key = D.run("shareS.key");
  ok(!!key && key.length >= 24, 'podgląd: klucz wygenerowany (długi, losowy)');
  ok(D.run("shareUrl()").includes('/documents/shares/' + key), 'podgląd: adres zawiera klucz');
  const sh = cloud['shares/' + key];
  ok(!!sh && sh.owner === 'u1', 'podgląd: dokument shares/{klucz} z właścicielem');
  ok(!!sh && JSON.parse(sh.json).days, 'podgląd: w dokumencie jest pełna kopia danych');
  ok(cloud['users/u1/app/share'] && cloud['users/u1/app/share'].on === true, 'podgląd: ustawienie zapisane na koncie');

  // zmiana danych trafia też do podglądu
  D.run("day(todayISO()).diet.waterL = 3; save();");
  await D.run("pushNow()");   // w atrapie setTimeout nic nie robi, więc wysyłkę odpalamy ręcznie
  await sleep(20);
  const sh2 = cloud['shares/' + key];
  ok(sh2 && JSON.parse(sh2.json).days[D.run('todayISO()')].diet.waterL === 3, 'podgląd: nowa wartość pojawia się po zapisie');

  // nowy klucz odcina stary link
  const oldKey = key;
  await D.run("shareStop(true)");
  await sleep(20);
  ok(!cloud['shares/' + oldKey], 'nowy klucz: stary dokument podglądu usunięty');
  ok(D.run("shareS.key") !== oldKey && D.run("shareS.on") === true, 'nowy klucz: podgląd nadal włączony, z nowym kluczem');

  // wyłączenie
  const k2 = D.run("shareS.key");
  await D.run("shareStop(false)");
  await sleep(20);
  ok(!cloud['shares/' + k2], 'wyłączenie: dokument podglądu usunięty');
  ok(D.run("shareS.on") === false, 'wyłączenie: podgląd wyłączony');

  // --- wylogowanie czyści stan podglądu i listę kopii ---
  ok(typeof D.run("bkCard()") === 'string' && typeof D.run("shareCard()") === 'string', 'karty kopii i podglądu się renderują');

  console.log(fails ? `\nBACKUP TEST: ${fails} FAIL` : '\nBACKUP TEST ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('CRASH', e); process.exit(1); });
