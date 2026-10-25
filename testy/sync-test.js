// Test synchronizacji: dwa urządzenia, wspólna „chmura” (atrapa Firebase), zapis offline, konflikt, odświeżenie.
// UWAGA: to test logiki na atrapie. Prawdziwą synchronizację trzeba sprawdzić na dwóch telefonach/komputerach z Firebase.
// Uruchom: node testy/sync-test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const DIR = path.join(__dirname, '..');
const APP_SRC = fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8') +
  '\n;globalThis.X={data,pushNow,pullNow,syncDecision,syncMeta,syncS:()=>syncS,day,todayISO,save};';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Atrapa Firebase: wspólny obiekt „chmury” (klucz = ścieżka dokumentu)
function fakeFB(cloud, uid) {
  return {
    auth: { currentUser: { uid, email: uid + '@test' } }, db: {},
    doc: (db, ...p) => p.join('/'),
    getDoc: async p => ({ exists: () => p in cloud, data: () => JSON.parse(JSON.stringify(cloud[p])) }),
    setDoc: async (p, v) => { cloud[p] = JSON.parse(JSON.stringify(v)); },
    onUser: () => {}, signIn: async () => {}, register: async () => {}, signOut: async () => {}
  };
}
// Jedno „urządzenie”: osobny localStorage (store), wspólna chmura
function device(cloud, uid, store) {
  const st = store || {};
  const mk = id => ({ id, value: '', checked: false, innerHTML: '', dataset: {}, style: {}, classList: { toggle() {}, add() {}, remove() {}, contains: () => false }, addEventListener() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null, focus() {}, setAttribute() {}, select() {}, remove() {} });
  const els = {};
  const ctx = {
    console, localStorage: { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); } },
    alert: () => {}, confirm: () => true, navigator: { onLine: true },
    document: { documentElement: { style: { setProperty() {} }, dataset: {} }, getElementById: id => (els[id] = els[id] || mk(id)), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, createElement: () => mk('x'), body: mk('b') },
    window: { addEventListener() {}, scrollTo() {}, FB: fakeFB(cloud, uid) },
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 1, clearInterval() {}, fetch: async () => ({ json: async () => ({ products: [] }) }),
    URL: { createObjectURL() { return 'x'; } }, Blob: function () {}, FileReader: function () {}
  };
  vm.createContext(ctx);
  vm.runInContext(APP_SRC, ctx);
  return { ctx, st, run: code => vm.runInContext(code, ctx) };
}
const cloudDoc = cloud => cloud['users/u1/app/data'];

(async () => {
  // --- czysta logika decyzji ---
  const D = device({}, 'u1', {});
  ok(D.run("syncDecision(0, {}, false)") === 'push', 'decyzja: w chmurze pusto → wyślij');
  ok(D.run("syncDecision(100, {syncedTs:50, dirty:true}, true)") === 'conflict', 'decyzja: obie strony zmienione → konflikt');
  ok(D.run("syncDecision(100, {syncedTs:50, dirty:false}, true)") === 'pull', 'decyzja: w chmurze nowsze → pobierz');
  ok(D.run("syncDecision(100, {syncedTs:100, dirty:true}, true)") === 'push', 'decyzja: lokalnie nowsze → wyślij');
  ok(D.run("syncDecision(50, {syncedTs:50, dirty:false}, true)") === 'none', 'decyzja: bez zmian → nic');

  const cloud = {};
  // --- Urządzenie A: zapis offline trafia do kolejki ---
  const A = device(cloud, 'u1', {});
  A.run("day(todayISO()).diet.waterL = 1; save();");
  A.ctx.navigator.onLine = false;
  await A.run('pushNow()');
  ok(A.run('syncS.st') === 'offline', 'offline: status „offline”');
  ok(JSON.parse(A.st['lifeos.sync']).dirty === true, 'offline: zmiana zostaje w kolejce (dirty)');
  ok(!cloudDoc(cloud), 'offline: nic nie trafiło do chmury');

  // --- powrót internetu: wysyłka z kolejki ---
  A.ctx.navigator.onLine = true;
  await A.run('pushNow()');
  ok(!!cloudDoc(cloud) && cloudDoc(cloud).json.includes('"waterL":1'), 'online: kolejka wysłana do chmury');
  ok(JSON.parse(A.st['lifeos.sync']).dirty === false, 'online: po wysłaniu nie ma zaległości');
  ok(A.run('syncS.st') === 'synced', 'online: status „zsynchronizowano”');

  // --- Urządzenie B: pobranie po zalogowaniu ---
  const bStore = {};
  const B = device(cloud, 'u1', bStore);
  await B.run("pullNow({uid:'u1'})");
  ok(B.run("data.days[todayISO()].diet.waterL") === 1, 'dwa urządzenia: dane z A są na B');
  ok(B.run('syncS.st') === 'synced', 'dwa urządzenia: B zsynchronizowany');

  // --- odświeżenie strony na B: dane zostają lokalnie ---
  const B2 = device(cloud, 'u1', bStore);
  ok(B2.run("data.days[todayISO()].diet.waterL") === 1, 'odświeżenie: dane wczytane z localStorage');

  // --- konflikt: A i B zmieniły dane ---
  await sleep(5);
  A.run("day(todayISO()).diet.waterL = 2; save();");
  await A.run('pushNow()');                       // chmura = 2
  await sleep(5);
  B.run("day(todayISO()).diet.waterL = 5; save();"); // B ma niewysłaną zmianę (dirty)
  B.ctx.confirm = () => false;                    // „Anuluj” = wyślij z tego urządzenia
  await B.run("pullNow({uid:'u1'})");
  ok(cloudDoc(cloud).json.includes('"waterL":5'), 'konflikt „wyślij z tego urządzenia”: chmura = 5');

  // --- konflikt: wybór „użyj danych z chmury” ---
  await sleep(5);
  A.run("day(todayISO()).diet.waterL = 7; save();");
  await A.run('pushNow()');                       // chmura = 7
  await sleep(5);
  B.run("day(todayISO()).diet.waterL = 9; save();");
  B.ctx.confirm = () => true;                     // „OK” = użyj chmury
  await B.run("pullNow({uid:'u1'})");
  ok(B.run("data.days[todayISO()].diet.waterL") === 7, 'konflikt „użyj chmury”: B ma wartość z chmury (7)');

  // --- bez zmian po stronie A: pobranie nowszych danych z chmury ---
  await sleep(5);
  B.run("day(todayISO()).diet.waterL = 3; save();");
  await B.run('pushNow()');                       // chmura = 3 (nowsza)
  await A.run("pullNow({uid:'u1'})");
  ok(A.run("data.days[todayISO()].diet.waterL") === 3, 'pobranie: A dostał nowsze dane z chmury');

  // --- brak Firebase: aplikacja działa lokalnie ---
  const L = device(cloud, 'u1', {});
  L.ctx.window.FB = undefined;
  L.run("syncInit()");
  ok(L.run('syncS.st') === 'local', 'bez Firebase: status „tylko to urządzenie”');

  console.log(fails ? `\n${fails} FAIL` : '\nSYNC ALL PASS (na atrapie – nie zastępuje testu na prawdziwym Firebase)');
})().catch(e => { console.log('FAIL wyjątek: ' + e.message); process.exit(1); });
