// Testy nowego Kosza: migracja, linki do drillów, plany na daty, dziennik i film lokalny.
const fs = require('fs'), path = require('path'), vm = require('vm');
const assert = require('assert');
const DIR = path.join(__dirname, '..');
const oldStore = new Map();
const videoStore = new Map();
const later = (fn, ms = 0) => setTimeout(fn, ms);
const fakeIndexedDB = {
  open() {
    const req = {};
    later(() => {
      req.result = {
        objectStoreNames: { contains: () => true },
        transaction() {
          const tx = { objectStore() {
            return {
              put(row) { videoStore.set(row.id, row); later(() => tx.oncomplete && tx.oncomplete()); },
              get(id) { const r = {}; later(() => { r.result = videoStore.get(id) || null; r.onsuccess && r.onsuccess(); }); return r; },
              delete(id) { videoStore.delete(id); later(() => tx.oncomplete && tx.oncomplete()); },
              getAll() { const r = {}; later(() => { r.result = [...videoStore.values()]; r.onsuccess && r.onsuccess(); }); return r; }
            };
          } };
          return tx;
        }
      };
      req.onsuccess && req.onsuccess();
    });
    return req;
  }
};
const URLShim = class extends URL {};
URLShim.createObjectURL = () => 'blob:test-video';
URLShim.revokeObjectURL = () => {};
const elements = {};
const makeElement = id => ({
  id, value: '', checked: false, innerHTML: '', textContent: '', dataset: {}, files: [], style: {},
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  appendChild() {}, click() {}, remove() {}, focus() {}, setAttribute() {},
  querySelector() { return null; }, querySelectorAll() { return []; }
});
const getElement = id => (elements[id] = elements[id] || makeElement(id));
const legacyData = {
  v: 6,
  days: { '2026-01-05': { done: { hallTemplate: { done: true }, normalTemplate: { done: true } } } },
  template: [
    { id: 'hallTemplate', name: 'Stara hala', hallId: 'old-hall', days: [0] },
    { id: 'normalTemplate', name: 'Szkoła', days: [0] }
  ],
  shots: [{ id: 'shot-old', date: '2026-01-05', drill: 'rzut', made: 2, att: 5 }],
  drills: [{ id: 'drill-old', name: 'Stary drill', block: 'rzut' }],
  hala: [{ id: 'old-hall', name: 'Stary plan', dow: 0 }],
  logs: [{ id: 'old-log', date: '2026-01-05', type: 'hala' }],
  prios: [{ id: 'old-prio', name: 'Stary priorytet' }],
  skills: [],
  diag: [{ id: 'old-diag', date: '2026-01-05', s: {} }]
};
oldStore.set('lifeos.v1', JSON.stringify(legacyData));
const ctx = {
  console,
  localStorage: {
    getItem: key => oldStore.has(key) ? oldStore.get(key) : null,
    setItem: (key, value) => oldStore.set(key, String(value)),
    removeItem: key => oldStore.delete(key)
  },
  alert: message => { ctx.lastAlert = message; }, confirm: () => true, navigator: { onLine: false, userAgent: 'Android' },
  document: {
    documentElement: { style: { setProperty() {} }, dataset: {} },
    getElementById: getElement, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
    createElement: () => makeElement('download-link'), body: { appendChild() {} }
  },
  window: { addEventListener() {}, scrollTo() {}, indexedDB: fakeIndexedDB },
  setTimeout: (fn, ms) => ms > 10 ? 0 : later(fn, ms), clearTimeout() {}, setInterval: () => 1, clearInterval() {},
  fetch: async () => ({ json: async () => ({ products: [] }) }), URL: URLShim, Blob, FileReader: function () {}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(DIR, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(DIR, 'app.js'), 'utf8') +
  '\n;globalThis.X={data,state,render,screenKosz,koszDrille,koszHala,koszDziennik,drillDetailHtml,normalizeExternalUrl,activeDrills,openDrillEditor,openHallPlan,openTrainingJournal,openDrillJournal,openDrillVideoDb,storeDrillVideo,readDrillVideo,removeDrillVideo,koszLegacyExport,koszLegacyClear,saveDrill,saveHallPlan,saveTrainingJournal,saveDrillJournal};', ctx);
const X = ctx.X;
let count = 0;
function ok(condition, message) {
  count++;
  if (!condition) throw new Error('FAIL ' + message);
  console.log('PASS ' + message);
}
async function main() {
  ok(X.data.koszMigrationPending === true, 'stare dane wymagają eksportu przed wyczyszczeniem');
  ok(X.data.shots.length === 1 && X.data.drills.some(d => d.id === 'drill-old'), 'stare wpisy są zachowane przed eksportem');
  X.state.screen = 'kosz'; X.state.sub.kosz = 'drille'; X.render();
  ok(getElement('app').innerHTML.includes('1. Pobierz kopię JSON'), 'Kosz pokazuje jednoznaczny, dwuetapowy ekran migracji');

  X.data.drillCategories = [{ id: 'shooting', name: 'Shooting' }, { id: 'handle', name: 'Handle' }];
  const newDrill = { id: 'new-drill', name: 'Crossover i layup', description: 'Prawa ręka, potem lewa.', categoryIds: ['handle', 'shooting'], link: 'https://www.youtube.com/watch?v=demo', videoId: '' };
  X.data.drills.push(newDrill);
  X.data.hallPlans = [{ id: 'hp1', date: '2026-11-24', title: 'Hala po szkole', note: 'Skup się na lewej ręce.', drillIds: ['new-drill'], drillSnapshots: [{ id: 'new-drill', name: newDrill.name }] }];
  X.data.trainingJournal = [{ id: 'tj1', date: '2026-11-24', title: 'Trening techniczny', note: 'Dobre tempo.', drillIds: ['new-drill'], drillSnapshots: [{ id: 'new-drill', name: newDrill.name }] }];
  X.data.drillJournal = [{ id: 'dj1', date: '2026-11-24', drillId: 'new-drill', drillName: newDrill.name, result: '8/10', note: 'Lewa ręka do poprawy.' }];
  X.state.drillCategoryId = 'handle';
  let html = X.koszDrille();
  ok(html.includes('Crossover i layup') && !html.includes('Stary drill'), 'nowa biblioteka ukrywa stare drille i filtruje kategorię');
  ok(newDrill.categoryIds.length === 2, 'jeden drill może mieć wiele kategorii');
  const detail = X.drillDetailHtml(newDrill);
  ok(detail.includes('Prawa ręka, potem lewa.') && detail.includes('target="_blank"') && detail.includes('Otwórz film / link'), 'szczegóły pokazują opis i klikalny link zewnętrzny');
  ok(X.normalizeExternalUrl('tiktok.com/@player/video/123').startsWith('https://') && X.normalizeExternalUrl('javascript:alert(1)') === '', 'linki są normalizowane do HTTPS, a javascript odrzucany');
  ok(X.koszHala().includes('data-act="drillOpen"') && X.koszHala().includes('Hala po szkole'), 'plan na konkretną datę ma klikalny odnośnik do drilla');
  ok(X.koszDziennik().includes('data-act="drillOpen"') && X.koszDziennik().includes('Lewa ręka do poprawy.'), 'dziennik pokazuje notatki oraz klikalne drill-referencje');

  const file = { name: 'crossover.mp4', type: 'video/mp4', size: 2048 };
  await X.storeDrillVideo('new-drill', file);
  const saved = await X.readDrillVideo('new-drill');
  ok(saved && saved.blob === file && saved.name === 'crossover.mp4', 'plik jest zapisywany jako lokalny film do odtworzenia');
  await X.removeDrillVideo('new-drill');
  ok(await X.readDrillVideo('new-drill') === null, 'lokalny film można usunąć z magazynu urządzenia');

  X.koszLegacyExport();
  ok(!!X.data.koszMigrationExportedAt && X.data.koszMigrationPending, 'eksport odblokowuje usunięcie, nie kasując jeszcze danych');
  const backups = JSON.parse(oldStore.get('lifeos.backups') || '[]');
  ok(backups.some(b => b.json.includes('shot-old')), 'przed czyszczeniem powstaje kopia bezpieczeństwa');
  X.koszLegacyClear();
  ok(!X.data.koszMigrationPending && X.data.koszSchemaVersion === 1, 'potwierdzenie kończy migrację Kosza');
  ok(X.data.shots.length === 0 && X.data.hala.length === 0 && X.data.logs.length === 0 && X.data.prios.length === 0 && X.data.diag.length === 0, 'stare pomiary, plany, dzienniki i priorytety są wyczyszczone');
  ok(X.data.drills.length === 1 && X.data.drills[0].id === 'new-drill' && X.data.hallPlans.length === 1 && X.data.trainingJournal.length === 1, 'nowe drille, plany i wpisy utworzone przed migracją zostają zachowane');
  ok(!X.data.template.some(t => t.hallId) && X.data.template.some(t => t.id === 'normalTemplate'), 'stary blok hali znika z tygodnia, inne bloki pozostają');

  X.openDrillEditor();
  ok(getElement('sheetBox').innerHTML.includes('accept="video/*"') && getElement('sheetBox').innerHTML.includes('Opis / wskazówki'), 'formularz drilla ma opis, link i wybór filmu z telefonu');
  const fields = {};
  const checked = {};
  const root = getElement('sheetBox');
  root.querySelector = selector => {
    const match = selector.match(/name="([^"]+)"/);
    return match && fields[match[1]] !== undefined ? { value: fields[match[1]], checked: !!fields[match[1]] } : null;
  };
  root.querySelectorAll = selector => {
    const match = selector.match(/name="([^"]+)"/);
    return (match && checked[match[1]] || []).map(value => ({ value, checked: true }));
  };
  fields.drillName = 'Euro step'; fields.drillDescription = 'Dwa kroki i wykończenie.'; fields.drillLink = 'youtu.be/euro';
  checked.drillCategoryIds = ['handle', 'shooting'];
  X.saveDrill({ dataset: { id: '' } });
  const savedDrill = X.data.drills.find(d => d.name === 'Euro step');
  ok(savedDrill && savedDrill.categoryIds.length === 2 && savedDrill.link.startsWith('https://'), 'formularz zapisuje drill z wieloma kategoriami i poprawionym linkiem');

  fields.planDate = '2026-11-25'; fields.planTitle = 'Środowa hala'; fields.planNote = 'Krótki trening.'; checked.drillIds = ['new-drill'];
  X.saveHallPlan({ dataset: { id: '' } });
  ok(X.data.hallPlans.some(p => p.title === 'Środowa hala' && p.drillIds.includes('new-drill')), 'formularz planu zapisuje wybraną datę i odnośnik do drilla');
  fields.journalDate = '2026-11-25'; fields.journalTitle = 'Trening po szkole'; fields.journalNote = 'Dobre tempo.';
  X.saveTrainingJournal({ dataset: { id: '' } });
  ok(X.data.trainingJournal.some(j => j.title === 'Trening po szkole' && j.drillIds.includes('new-drill')), 'dziennik zapisuje trening z klikalnym drill-referencem');
  fields.drillJournalDate = '2026-11-25'; fields.drillJournalId = 'new-drill'; fields.drillJournalResult = '7/10'; fields.drillJournalNote = 'Poprawić lewą rękę.';
  X.saveDrillJournal({ dataset: { id: '' } });
  ok(X.data.drillJournal.some(j => j.drillId === 'new-drill' && j.result === '7/10'), 'osobny wpis zapisuje wynik i notatkę do konkretnego drilla');
  console.log(`KOSZ TEST ALL PASS (${count} checks)`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
