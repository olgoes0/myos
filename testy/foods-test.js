// Test bazy produktów, migracji v7→v8 oraz gwiazdek/filtra „Moje”. Uruchom: node testy/foods-test.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..');
const oldFood = (id, name, [kcal, p, c, f, piece], favorite = false) => ({ id, name, kcal, p, c, f, piece, ...(favorite ? { favorite: true } : {}) });
const legacyFoods = [
  oldFood('old-granola', 'Granola', [470, 10, 64, 19, 40], true),
  oldFood('old-dates', 'Daktyle suszone', [280, 2.5, 75, 0.4, 8]),
  oldFood('old-yogurt', 'Jogurt grecki 2%', [60, 4, 4, 2, 150]),
  oldFood('old-isotonic', 'Napój izotoniczny', [25, 0, 6, 0, 500]),
  oldFood('old-homogenized', 'Serek homogenizowany', [140, 7, 13, 6, 150]),
  oldFood('old-protein-powder', 'Odżywka białkowa (proszek, 1 miarka 30 g)', [380, 78, 8, 5, 30]),
  oldFood('old-breakfast-bun', 'Bułka pszenna (zwykła)', [280, 9, 55, 2, 60]),
  oldFood('old-rye-bread', 'Chleb żytni', [230, 6, 45, 1.5, 30]),
  oldFood('old-protein-bar', 'Batonik proteinowy', [380, 30, 35, 12, 60]),
  oldFood('old-graham', 'Bułka grahamka', [240, 9, 46, 2.5, 60]),
  oldFood('old-baguette', 'Bagietka', [270, 9, 55, 1, 60]),
  oldFood('old-kopytka', 'Kopytka', [150, 4, 30, 1, null]),
  oldFood('old-silesian-dumpling', 'Kluski śląskie', [120, 3, 26, 0.5, null]),
  oldFood('old-potato-pancake', 'Placki ziemniaczane', [210, 3, 22, 12, 80]),
  oldFood('old-fruit-muesli', 'Musli owocowe', [380, 10, 68, 6, 50]),
  oldFood('old-cereal-bar', 'Batonik zbożowy', [400, 7, 60, 14, 25]),
  oldFood('old-dried-apricots', 'Suszone morele', [240, 3.4, 63, 0.5, 20]),
  oldFood('old-fish-sticks', 'Paluszki rybne (panierowane)', [240, 12, 20, 12, 20]),
  oldFood('old-cola', 'Cola', [42, 0, 10.6, 0, 330]),
  oldFood('old-energy', 'Napój energetyczny', [45, 0, 11, 0, 250]),
  oldFood('old-orange-juice', 'Sok pomarańczowy', [45, 0.7, 10, 0.2, 250]),
  oldFood('old-ketchup', 'Ketchup', [110, 1.3, 25, 0.1, 15]),
  oldFood('old-mayo', 'Majonez', [680, 1, 2, 75, 15]),
  oldFood('old-rapeseed-oil', 'Olej rzepakowy', [884, 0, 0, 100, 10]),
  oldFood('old-butter', 'Masło', [740, 0.6, 0.6, 82, 10]),
  oldFood('old-mustard', 'Musztarda', [66, 4, 6, 3, 5]),
  oldFood('chicken-roast', 'Pierś z kurczaka (pieczona)', [165, 31, 0, 3.6, null]),
  oldFood('chicken-raw', 'Pierś z kurczaka (surowa)', [120, 22.5, 0, 2.6, null]),
  oldFood('turkey', 'Filet z indyka (pieczony)', [110, 24, 0, 1.5, null]),
  oldFood('pork', 'Schab pieczony', [170, 26, 0, 7, null]),
  oldFood('beef-5', 'Mięso mielone wołowe 5%', [137, 21, 0, 5, null]),
  oldFood('pork-mince', 'Mięso mielone wieprzowe', [250, 17, 0, 20, null]),
  oldFood('mixed-mince', 'Mięso mielone mieszane', [230, 18, 0, 17, null]),
  oldFood('salmon', 'Łosoś (pieczony)', [206, 22, 0, 12, null]),
  oldFood('cod', 'Dorsz (gotowany)', [80, 17, 0, 1, null]),
  oldFood('pollock', 'Mintaj (pieczony)', [90, 19, 0, 1.5, null]),
  oldFood('rice-white', 'Ryż biały (gotowany)', [130, 2.7, 28, 0.3, null]),
  oldFood('rice-brown', 'Ryż brązowy (gotowany)', [110, 2.6, 23, 0.9, null]),
  oldFood('pasta-white', 'Makaron pszenny (gotowany)', [158, 5.8, 31, 0.9, null]),
  oldFood('pasta-whole', 'Makaron pełnoziarnisty (gotowany)', [124, 5, 25, 0.6, null]),
  oldFood('oats', 'Płatki owsiane (suche)', [370, 13, 66, 7, null]),
  oldFood('potatoes', 'Ziemniaki (gotowane)', [87, 1.9, 20, 0.1, 150]),
  oldFood('millet', 'Kasza jaglana gotowana', [120, 3.5, 24, 1.5, 200]),
  oldFood('apple', 'Jabłko', [52, 0.3, 14, 0.2, 180]),
  oldFood('orange', 'Pomarańcza', [47, 0.9, 12, 0.1, 150]),
  oldFood('own-food', 'Mój produkt', [123, 4, 20, 2, 75])
];
const store = { 'lifeos.v1': JSON.stringify({ v: 7, foodsV: 7, foods: legacyFoods, template: [], days: {}, minimum: [], categories: [], reminders: [] }) };
const els = {}, vals = {};
const mk = () => ({ innerHTML: '', classList: { toggle() {}, add() {}, remove() {}, contains: () => true }, style: {}, dataset: {}, click() {}, remove() {}, appendChild() {}, value: '', textContent: '', setAttribute() {}, querySelectorAll: () => [], querySelector: () => null, scrollIntoView() {} });
const doc = { documentElement: { style: { setProperty() {}, colorScheme: '' }, dataset: {} }, getElementById: id => vals[id] || (els[id] || (els[id] = mk())), querySelectorAll: () => [], querySelector: () => null,
  addEventListener() {}, createElement: () => mk(), body: { appendChild() {} } };
const ctx = { console: { log() {}, error: console.error }, alert() {}, confirm: () => true,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => store[k] = v }, document: doc,
  window: { scrollTo() {} }, URL: { createObjectURL: () => 'blob:test' }, Blob: function () {}, FileReader: function () {},
  setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {}, navigator: { onLine: true, userAgent: 'node' } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'produkty.js'), 'utf8') + '\n' + fs.readFileSync(path.join(dir, 'app.js'), 'utf8') +
  '\n;globalThis.T={data:()=>data,DEFAULTS,FOOD_BASE,FOOD_SCHEMA_VERSION,migrateFoods,applyRemote,dietaBaza,ACT,state};', ctx);
const T = ctx.T;
let fails = 0;
const ok = (condition, message) => { console.log((condition ? 'PASS ' : 'FAIL ') + message); if (!condition) fails++; };
const food = name => T.data().foods.find(x => x.name === name);

const expectedProducts = [
  ['Polędwica sopocka', 130, 21, 1, 5, 20],
  ['Kabanos drobiowy', 330, 25, 2, 25, 12],
  ['Serek wiejski lekki', 90, 11, 3, 3, 150],
  ['Mleko w proszku odtłuszczone', 360, 36, 52, 1, 25],
  ['Odżywka białkowa — 1 porcja 30 g', 380, 75, 8, 5, 30],
  ['Gainer (1 porcja 100 g)', 380, 25, 65, 4, 100],
  ['Baton proteinowy', 350, 30, 35, 10, 60],
  ['Kiełbasa biała (pieczona)', 260, 13, 2, 23, 80],
  ['Mięso mielone wołowe 15%', 250, 26, 0, 15, 150],
  ['Mięso mielone z indyka', 150, 20, 0, 7, 150],
  ['Udo z kurczaka pieczone (ze skórą)', 210, 25, 0, 12, 120],
  ['Podudzie z kurczaka pieczone', 185, 24, 0, 9, 130],
  ['Kurczak pieczony (cały, mięso ze skórą)', 215, 25, 0, 13, 150],
  ['Pierś z kurczaka (grillowana)', 165, 31, 0, 3.6, 150],
  ['Bułka śniadaniowa', 275, 8, 52, 2.5, 50],
  ['Bułka grahamka (średnia)', 240, 9, 46, 2.5, 60],
  ['Chałka (kromka)', 300, 8, 52, 7, 40],
  ['Chleb żytni na zakwasie', 235, 7, 45, 1.5, 35],
  ['Bagietka (kawałek)', 290, 9, 55, 2, 50],
  ['Kopytka (gotowane)', 180, 4, 35, 2, 200],
  ['Kluski śląskie (gotowane)', 170, 3, 38, 0.5, 200],
  ['Knedle ze śliwką (1 szt.)', 200, 3, 40, 3, 70],
  ['Placki ziemniaczane (1 szt.)', 230, 3, 28, 12, 80],
  ['Płatki czekoladowe (kulki)', 390, 6.5, 76, 4.5, 30],
  ['Musli z owocami', 370, 9, 65, 6, 60],
  ['Granola', 430, 10, 60, 17, 50],
  ['Baton zbożowy', 400, 6, 65, 13, 40],
  ['Kakao naturalne (łyżka)', 230, 20, 14, 11, 5],
  ['Morela suszona', 240, 3, 63, 0.5, 10],
  ['Daktyle suszone', 280, 2, 75, 0.4, 8],
  ['Pestki słonecznika', 584, 21, 20, 51, 15],
  ['Panga (pieczona)', 95, 18, 0, 2.5, 150],
  ['Ryba panierowana (paluszki rybne)', 200, 14, 18, 9, 30],
  ['Herbatniki (1 szt.)', 440, 7, 72, 14, 8],
  ['Wafelek (1 szt.)', 500, 5, 65, 25, 20],
  ['Krakersy', 480, 10, 60, 22, 10],
  ['Krówki (1 szt.)', 400, 2, 80, 8, 8],
  ['Cola (puszka 330 ml)', 42, 0, 10.6, 0, 330],
  ['Napój gazowany owocowy', 40, 0, 10, 0, 330],
  ['Napój energetyczny (puszka)', 45, 0, 11, 0, 250],
  ['Sok 100% pomarańczowy (szklanka)', 45, 0.7, 10, 0.2, 250],
  ['Napój izotoniczny', 25, 0, 6, 0, 500],
  ['Ketchup (łyżka)', 110, 1.5, 24, 0.1, 15],
  ['Majonez (łyżka)', 720, 1, 3, 79, 15],
  ['Olej rzepakowy (łyżka)', 884, 0, 0, 100, 10],
  ['Masło (łyżka)', 735, 0.7, 0.6, 81, 10],
  ['Smalec (łyżka)', 900, 0, 0, 100, 10],
  ['Musztarda stołowa (łyżka)', 120, 5, 8, 6, 15],
  ['Serek homogenizowany', 140, 7, 13, 6, 150]
];
const mergedProductNames = {
  'Odżywka białkowa — 1 porcja 30 g': 'Odżywka białkowa (proszek, 1 miarka 30 g)',
  'Bułka śniadaniowa': 'Bułka pszenna (zwykła)',
  'Chleb żytni na zakwasie': 'Chleb żytni',
  'Baton proteinowy': 'Batonik proteinowy',
  'Bułka grahamka (średnia)': 'Bułka grahamka',
  'Bagietka (kawałek)': 'Bagietka',
  'Kopytka (gotowane)': 'Kopytka',
  'Kluski śląskie (gotowane)': 'Kluski śląskie',
  'Placki ziemniaczane (1 szt.)': 'Placki ziemniaczane',
  'Musli z owocami': 'Musli owocowe',
  'Baton zbożowy': 'Batonik zbożowy',
  'Morela suszona': 'Suszone morele',
  'Ryba panierowana (paluszki rybne)': 'Paluszki rybne (panierowane)',
  'Cola (puszka 330 ml)': 'Cola',
  'Napój energetyczny (puszka)': 'Napój energetyczny',
  'Sok 100% pomarańczowy (szklanka)': 'Sok pomarańczowy',
  'Ketchup (łyżka)': 'Ketchup',
  'Majonez (łyżka)': 'Majonez',
  'Olej rzepakowy (łyżka)': 'Olej rzepakowy',
  'Masło (łyżka)': 'Masło',
  'Musztarda stołowa (łyżka)': 'Musztarda'
};
const expectedPortions = {
  'Pierś z kurczaka (pieczona)': 150, 'Pierś z kurczaka (surowa)': 150, 'Filet z indyka (pieczony)': 150,
  'Schab pieczony': 150, 'Mięso mielone wołowe 5%': 150, 'Mięso mielone wieprzowe': 150,
  'Mięso mielone mieszane': 150, 'Łosoś (pieczony)': 150, 'Dorsz (gotowany)': 150, 'Mintaj (pieczony)': 150,
  'Ryż biały (gotowany)': 200, 'Ryż brązowy (gotowany)': 200, 'Makaron pszenny (gotowany)': 200,
  'Makaron pełnoziarnisty (gotowany)': 200, 'Kasza jaglana gotowana': 200, 'Płatki owsiane (suche)': 80,
  'Ziemniaki (gotowane)': 200, 'Jabłko': 180, 'Pomarańcza': 150
};

ok(T.FOOD_SCHEMA_VERSION === 10 && T.data().foodsV === 10, 'wersja bazy podniesiona do 10');
ok(T.FOOD_BASE.length === 541, `baza ma 541 unikalnych pozycji po scaleniu odpowiedników (jest ${T.FOOD_BASE.length})`);
ok(expectedProducts.length === 49, 'lista specyfikacji zawiera 49 pozycji');
for (const [name, ...values] of expectedProducts) {
  const canonical = mergedProductNames[name] || name;
  const matches = T.FOOD_BASE.filter(row => row[0] === canonical);
  ok(matches.length === 1 && JSON.stringify(matches[0].slice(1)) === JSON.stringify(values), `wartości ze specyfikacji: ${name} → ${canonical}`);
}
const baseKeys = T.FOOD_BASE.map(row => row[0].trim().toLowerCase());
ok(new Set(baseKeys).size === baseKeys.length, 'FOOD_BASE nie zawiera powtórzonych nazw');
for (const [name, grams] of Object.entries(expectedPortions)) ok(food(name)?.piece === grams, `porcja ${name}: ${grams} g`);
ok(food('Kasza jaglana gotowana')?.piece === 200 && food('Jabłko')?.piece === 180 && food('Pomarańcza')?.piece === 150,
  'trzy poprawne gramatury z listy pozostają bez zmian');

const liveFoods = T.data().foods;
ok(T.data().foods.length === T.FOOD_BASE.length + 1, 'migracja dodaje tylko brakujące produkty i zachowuje produkt własny');
ok(new Set(liveFoods.map(f => f.name.trim().toLowerCase())).size === liveFoods.length, 'migracja nie tworzy duplikatów nazw');
for (const [name] of expectedProducts) {
  const canonical = mergedProductNames[name] || name;
  ok(liveFoods.filter(f => f.name === canonical).length === 1, `dokładnie jeden wpis po migracji: ${name} → ${canonical}`);
}
for (const alias of Object.keys(mergedProductNames)) ok(!liveFoods.some(f => f.name === alias), `scalony odpowiednik nie tworzy drugiego wpisu: ${alias}`);
ok(food('Granola')?.kcal === 430 && food('Granola')?.p === 10 && food('Granola')?.c === 60 && food('Granola')?.f === 17 && food('Granola')?.piece === 50,
  'Granola aktualizuje się ze starych wartości bez utraty ID');
ok(food('Granola')?.id === 'old-granola' && food('Granola')?.favorite === true, 'migracja zachowuje ID i gwiazdkę produktu');
ok(food('Daktyle suszone')?.p === 2, 'Daktyle suszone otrzymują wartości ze specyfikacji');
ok(food('Jogurt grecki 2%')?.kcal === 59 && food('Jogurt grecki 2%')?.p === 9 && food('Jogurt grecki 2%')?.c === 3.6 && food('Jogurt grecki 2%')?.f === 2 && food('Jogurt grecki 2%')?.piece === 150,
  'Jogurt grecki 2% otrzymuje poprawione makro');
ok(food('Napój izotoniczny')?.piece === 500 && food('Serek homogenizowany')?.piece === 150, 'dwa istniejące zgodne wpisy nie są duplikowane ani zmieniane');
ok(food('Odżywka białkowa (proszek, 1 miarka 30 g)')?.p === 75 && food('Batonik proteinowy')?.kcal === 350 && food('Batonik proteinowy')?.f === 10, 'scalone odpowiedniki dostają wartości z listy');
ok(food('Kopytka')?.piece === 200 && food('Kluski śląskie')?.piece === 200 && food('Bagietka')?.piece === 50, 'scalone odpowiedniki zachowują istniejące nazwy i otrzymują porcje');
ok(food('Bułka pszenna (zwykła)')?.piece === 50 && food('Bułka pszenna (zwykła)')?.kcal === 275
  && food('Chleb żytni')?.piece === 35 && food('Chleb żytni')?.kcal === 235, 'bułka śniadaniowa i chleb na zakwasie scalają się z bazowymi odpowiednikami');
ok(food('Mój produkt')?.id === 'own-food' && food('Mój produkt')?.kcal === 123 && food('Mój produkt')?.favorite === undefined,
  'własny produkt użytkownika zostaje zachowany');

const customizedGranola = { id: 'custom-granola', name: 'Granola', kcal: 499, p: 10, c: 64, f: 19, piece: 40 };
const guarded = { foods: [customizedGranola], foodsV: 7 };
T.migrateFoods(guarded, 7);
ok(customizedGranola.kcal === 499 && customizedGranola.c === 60 && customizedGranola.piece === 50,
  'migracja nie nadpisuje indywidualnie zmienionego pola produktu');
const draftAliasData = { foods: [
  { id: 'canonical-kopytka', name: 'Kopytka', kcal: 150, p: 4, c: 30, f: 1, piece: null },
  { id: 'draft-kopytka-alias', name: 'Kopytka (gotowane)', kcal: 180, p: 4, c: 35, f: 2, piece: 200, favorite: true, fib: 3 },
  { id: 'canonical-bun', name: 'Bułka pszenna (zwykła)', kcal: 280, p: 9, c: 55, f: 2, piece: 60 },
  { id: 'draft-bun-alias', name: 'Bułka śniadaniowa', kcal: 275, p: 8, c: 52, f: 2.5, piece: 50 },
  { id: 'canonical-rye', name: 'Chleb żytni', kcal: 230, p: 6, c: 45, f: 1.5, piece: 30 },
  { id: 'draft-rye-alias', name: 'Chleb żytni na zakwasie', kcal: 235, p: 7, c: 45, f: 1.5, piece: 35 }
], foodsV: 9 };
T.migrateFoods(draftAliasData, 9);
const mergedKopytka = draftAliasData.foods.filter(f => f.name === 'Kopytka');
const mergedBun = draftAliasData.foods.find(f => f.name === 'Bułka pszenna (zwykła)');
const mergedBread = draftAliasData.foods.find(f => f.name === 'Chleb żytni');
ok(mergedKopytka.length === 1 && mergedKopytka[0].id === 'canonical-kopytka' && mergedKopytka[0].piece === 200 && mergedKopytka[0].favorite === true && mergedKopytka[0].fib === 3
  && !draftAliasData.foods.some(f => f.name === 'Kopytka (gotowane)'), 'migracja scala wcześniejszy alias, zachowując ID i gwiazdkę');
ok(mergedBun?.id === 'canonical-bun' && mergedBun?.kcal === 275 && mergedBun?.piece === 50
  && !draftAliasData.foods.some(f => f.name === 'Bułka śniadaniowa'), 'migracja foodsV 9 scala nazwę bułki z nowymi wartościami');
ok(mergedBread?.id === 'canonical-rye' && mergedBread?.p === 7 && mergedBread?.piece === 35
  && !draftAliasData.foods.some(f => f.name === 'Chleb żytni na zakwasie'), 'migracja foodsV 9 scala nazwę chleba na zakwasie');
const afterFirstMigration = T.data().foods.length;
ok(T.migrateFoods(T.data(), 10) === false && T.data().foods.length === afterFirstMigration, 'migracja v10 jest idempotentna');

T.state.foodQ = '';
T.state.foodFilter = 'all';
let html = T.dietaBaza();
ok(html.includes('★ Moje (1)') && html.includes('data-act="foodFavorite"') && html.includes('aria-pressed="true"'),
  'baza pokazuje licznik „Moje” i dostępne gwiazdki');
ok(html.indexOf('<b>Granola</b>') < html.indexOf('<b>Bagietka</b>'), 'ulubione produkty pojawiają się na górze listy');
T.ACT.foodFilter({ dataset: { v: 'favorites' } });
html = T.dietaBaza();
ok(html.includes('<b>Granola</b>') && !html.includes('<b>Serek homogenizowany</b>'), 'filtr „Moje” pokazuje tylko ulubione');
T.ACT.foodFavorite({ dataset: { id: 'old-homogenized' } });
html = T.dietaBaza();
ok(food('Serek homogenizowany')?.favorite === true && html.includes('<b>Serek homogenizowany</b>'), 'gwiazdka dodaje produkt do „Moich”');
ok(JSON.parse(store['lifeos.v1']).foods.find(f => f.id === 'old-homogenized').favorite === true, 'gwiazdka zapisuje się w danych użytkownika');
T.ACT.foodFavorite({ dataset: { id: 'old-homogenized' } });
ok(food('Serek homogenizowany')?.favorite === false, 'drugie kliknięcie usuwa gwiazdkę');
T.ACT.foodFilter({ dataset: { v: 'all' } });

// Zalogowane urządzenie również dostaje migrację po pobraniu starszego rekordu Firebase.
ctx.window.FB = { auth: { currentUser: { uid: 'test-user' } } };
const remote = T.DEFAULTS();
remote.foods = JSON.parse(JSON.stringify(legacyFoods));
remote.foodsV = 7;
T.applyRemote({ json: JSON.stringify(remote), updatedAt: 123 });
ok(T.data().foodsV === 10 && T.data().foods.some(f => f.name === 'Polędwica sopocka'), 'migracja obejmuje dane pobrane z Firebase');
ok(JSON.parse(store['lifeos.v1']).foodsV === 10, 'zmigrowana kopia z Firebase jest zapisana lokalnie');

console.log(fails ? `\n${fails} FAIL` : '\nALL PASS');
process.exit(fails ? 1 : 0);
