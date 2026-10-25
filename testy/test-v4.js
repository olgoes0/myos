// Test logiki LIFE OS v4 (Dieta + Trening). Uruchom z katalogu lifeos:  node testy/test-v4.js
// Nie wymaga przeglądarki – sprawdza obliczenia, parser posiłków, zapis treningu i import z AI.
const fs = require('fs'), vm = require('vm'), path = require('path');
const APP = path.join(__dirname, '..', 'app.js');
const store = { 'lifeos.v1': JSON.stringify({ v: 3, template: [], days: {}, minimum: [{ id: 'm1', label: 'Bark' }],
  shots: [], drills: [], workouts: [{ id: 'w1', name: 'Siła A', ex: 'Przysiad | 3x5 | | | 120\nWyciskanie | 2x8 | | | 60' }], sessions: [],
  weight: [{ id: 'k1', date: '2026-10-01', kg: 78 }], texts: {} }) };
const vals = {}, els = {};
const mk = () => ({ innerHTML: '', classList: { toggle() {}, add() {}, remove() {}, contains: () => true }, style: {}, dataset: {}, click() {}, remove() {}, appendChild() {}, value: '', textContent: '' });
const doc = { documentElement: { style: { setProperty() {}, colorScheme: '' }, dataset: {} }, getElementById: id => vals[id] || (els[id] || (els[id] = mk())), querySelectorAll: () => [], querySelector: () => null,
  addEventListener() {}, createElement: () => mk(), body: { appendChild() {} } };
const alerts = [];
const ctx = { console: { log() {}, error: console.error }, alert: m => alerts.push(m), confirm: () => true,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => store[k] = v }, document: doc,
  window: { scrollTo() {} }, URL: { createObjectURL: () => 'x' }, Blob: function () {}, FileReader: function () {},
  setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => 1, clearInterval() {}, navigator: { onLine: true } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'produkty.js'), 'utf8') + ';' + fs.readFileSync(APP, 'utf8') + `;globalThis.T={data:()=>data,day,save,ACT,CHG,parseMeal,calcTargets,parseEx,timer,e1rm,state,sumMacros,findFood,DEFAULTS,waterTargetL,themeVars,THEMES,render,lastEntry,todayISO,addDays};`, ctx);
const T = ctx.T;
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;

// --- 1. Migracja danych v3 → v4 ---
let D = T.data();
ok(D.v === 6, 'wersja danych 6');
ok(Array.isArray(D.foods) && D.foods.length >= 25, 'baza produktów domyślnie wypełniona');
ok(D.profile.protG === 2 && D.profile.fatG === 0.9, 'domyślne g/kg: białko 2, tłuszcz 0,9');
ok(D.profile.age === null && D.profile.height === null, 'wiek i wzrost puste (nic nie zakodowane)');
ok(D.draft === null, 'brak aktywnego treningu na starcie');

// --- 2. Kalkulator ---
ok(T.calcTargets() === null, 'bez wieku/wzrostu kalkulator nie liczy celu (brak wartości na sztywno)');
D.profile.age = 16; D.profile.height = 190;
let t = T.calcTargets();
ok(t && t.w === 78, 'waga z ostatniego pomiaru, gdy pole puste');
// dla 78 kg: BMR = 780 + 1187.5 − 80 + 5 = 1892.5
ok(near(t.bmr, 1893, 1), `BMR Mifflin-St Jeor (dla 78 kg, 190 cm, 16 lat) = ${t.bmr}`);
ok(near(t.tdee, 1893 * 1.55, 2), `TDEE = BMR × 1,55 = ${t.tdee}`);
ok(t.p === 156 && t.f === 70, `białko 2 g/kg = ${t.p} g, tłuszcz 0,9 g/kg = ${t.f} g`);
ok(near(t.kcal, Math.round((t.tdee + 300) / 10) * 10, 0), `cel kcal = TDEE + 300 = ${t.kcal}`);
ok(near(t.kcal, t.p * 4 + t.c * 4 + t.f * 9, 12), 'makra (4/4/9 kcal/g) zgadzają się z kcal celu');
D.profile.weight = 80; t = T.calcTargets();
ok(t.w === 80 && t.p === 160, 'pole wagi w kalkulatorze ma pierwszeństwo nad pomiarem');
D.profile.weight = null;

// --- 3. Parser posiłków ---
const P = T.parseMeal("200 g kurczaka, 100 g ryżu, 2 jajka, 1 banan, łyżka masła orzechowego, 1 łyżka oliwy, 2 kromki chleba, xyz");
const byName = n => P.find(x => x.raw.includes(n));
ok(byName('kurczaka').g === 200 && near(byName('kurczaka').kcal, 240, 0.5), '200 g kurczaka = 240 kcal (120 kcal/100 g)');
ok(byName('ryżu').name === 'Ryż biały (gotowany)', 'odmiana „ryżu” → Ryż biały (gotowany)');
ok(byName('jajka').g === 120, '2 jajka = 120 g (60 g na szt.)');
ok(byName('banan').g === 120, '1 banan = 120 g');
ok(byName('masła').g === 15, 'łyżka = 15 g');
ok(byName('oliwy').g === 15 && near(byName('oliwy').kcal, 133, 0.5), '1 łyżka oliwy = 15 g = 133 kcal');
ok(byName('kromki').g === 60, '2 kromki chleba = 60 g');
ok(byName('xyz').src === '?', 'nieznany produkt oznaczony jako „brak w bazie”');
const sm = T.sumMacros(P.filter(x => x.src === 'baza'));
ok(sm.kcal > 0 && sm.p > 0, 'suma makro z pozycji rozpoznanych');
ok(T.parseMeal('').length === 0, 'pusty wpis = brak pozycji');

// --- 4. Dodawanie posiłku (przez przycisk) ---
const today = T.todayISO();
vals['mt-' + today + '-obiad'] = { value: '150 g kurczaka, 200 g ryżu' };
T.ACT.mealAdd({ dataset: { s: today, m: 'obiad' } });
const obiad = T.day(today).diet.meals.obiad;
ok(obiad.length === 2, 'posiłek „obiad”: 2 pozycje dodane');
ok(T.day(today).diet.mealText.obiad === '', 'pole tekstu wyczyszczone po dodaniu');
T.ACT.mealDel({ dataset: { s: today, m: 'obiad', id: obiad[0].id } });
ok(T.day(today).diet.meals.obiad.length === 1, 'usunięcie pozycji posiłku');

// --- 5. Import z AI ---
vals['aiJson'] = { value: 'Oto wynik:\n[{"name":"Pizza margherita","grams":300,"kcal":700,"protein":28,"carbs":90,"fat":24}]' };
T.ACT.aiImport({ dataset: { s: today, m: 'kolacja' } });
const ai = T.day(today).diet.meals.kolacja;
ok(ai && ai[0].src === 'ai' && ai[0].kcal === 700 && ai[0].p === 28, 'import JSON z AI (z tekstem wokół) dodaje wartości');
vals['aiJson'] = { value: 'to nie json' };
const nAlerts = alerts.length;
T.ACT.aiImport({ dataset: { s: today, m: 'kolacja' } });
ok(alerts.length > nAlerts, 'błędny JSON z AI – komunikat zamiast zapisu');

// --- 6. Trening: szablon i zapis sesji ---
const ex = T.parseEx('Przysiad | 3x5 | 2-0-1 | https://x | 120\nWyciskanie | 2x8');
ok(ex.length === 2 && ex[0].sets === 3 && ex[0].reps === 5 && ex[0].rest === 120, 'format szablonu: serie, powtórzenia, odpoczynek (5. pole)');
ok(ex[1].rest === 90, 'brak 5. pola = odpoczynek domyślnie 90 s');
ok(near(T.e1rm(100, 5), 116.67, 0.01), 'szacowane 1RM (Epley): 100 kg × 5 = 116,7');

T.ACT.sessStart({ dataset: { id: 'w1' } });
ok(T.data().draft && T.data().draft.wid === 'w1' && T.data().draft.ex.length === 2, 'start treningu kopiuje ćwiczenia do szkicu');
T.CHG.setf({ dataset: { k: '0-0', f: 'kg' }, value: '100' });
T.CHG.setf({ dataset: { k: '0-0', f: 'reps' }, value: '5' });
T.CHG.setf({ dataset: { k: '0-1', f: 'kg' }, value: '105' });
T.CHG.setf({ dataset: { k: '0-1', f: 'reps' }, value: '4' });
T.CHG.setdone({ dataset: { k: '0-0', rest: '120', label: 'Odpoczynek · Przysiad' }, checked: true });
ok(T.timer.end > Date.now() + 110000 && T.timer.label.includes('Przysiad'), 'zaznaczenie serii uruchamia timer odpoczynku (120 s)');
ok(T.data().draft.sets['0-0'].done === true, 'seria zaznaczona w szkicu');
T.ACT.setAdd({ dataset: { ei: '1' } });
ok(T.data().draft.ex[1].sets === 3, '+ seria dodaje serię');
// ćwiczenie dowolne dodane w trakcie treningu
vals['exNew'] = { value: 'Wyskok z półprzysiadu' }; vals['exSets'] = { value: '2' }; vals['exReps'] = { value: '8' }; vals['exRest'] = { value: '60' };
T.ACT.exAdd({});
ok(T.data().draft.ex.length === 3 && T.data().draft.ex[2].name === 'Wyskok z półprzysiadu' && T.data().draft.ex[2].sets === 2, 'dowolne ćwiczenie dodane w trakcie treningu');
T.CHG.setf({ dataset: { k: '2-0', f: 'kg' }, value: '0' });
T.CHG.setf({ dataset: { k: '2-0', f: 'reps' }, value: '8' });
// usunięcie ćwiczenia 1 – serie ćwiczenia 2 przesuwają się na indeks 1
T.ACT.exDel({ dataset: { ei: '1' } });
ok(T.data().draft.ex.length === 2 && T.data().draft.sets['1-0'] && T.data().draft.sets['1-0'].reps === 8, 'usunięcie ćwiczenia przenumerowuje serie');
T.ACT.sessFinish();
const s1 = T.data().sessions.at(-1);
ok(T.data().draft === null, 'po zakończeniu szkic usunięty');
ok(s1 && s1.volume === 100 * 5 + 105 * 4, `objętość = Σ kg×powt. = ${s1 && s1.volume} kg`);
ok(s1 && s1.entries[0].sets[0].done === true, 'zrobione serie zapisane w sesji');

const last = T.lastEntry('Przysiad');
ok(last && last.sets[0].kg === 100, 'podpowiedź „ostatnio”: najnowsze wyniki danego ćwiczenia');

// trening dowolny: start bez szablonu
T.ACT.sessStart({ dataset: { id: '' } });
ok(T.data().draft && T.data().draft.wid === null && T.data().draft.ex.length === 0, 'trening dowolny startuje pusty');
const nS = T.data().sessions.length;
T.ACT.sessFinish();
ok(T.data().sessions.length === nS && T.data().draft !== null, 'pusta sesja nie jest zapisywana (szkic zostaje)');
T.ACT.sessCancel();
ok(T.data().draft === null, 'odrzucenie treningu czyści szkic');

// --- Woda w litrach ---
T.ACT.water({ dataset: { n: '0.25' } }); T.ACT.water({ dataset: { n: '0.25' } }); T.ACT.water({ dataset: { n: '0.5' } });
ok(T.day(today).diet.waterL === 1, 'woda: +0,25 +0,25 +0,5 = 1,00 l');
ok(T.waterTargetL() === 2.7, `cel wody = 78 kg × 35 ml = ${T.waterTargetL()} l`);
T.ACT.water({ dataset: { n: '-0.25' } });
ok(T.day(today).diet.waterL === 0.75, 'woda: cofnięcie o 0,25 l');

// --- Baza produktów ---
ok(T.data().foods.length >= 150, `baza ma co najmniej 150 pozycji (jest ${T.data().foods.length})`);
ok(T.findFood('pizza margherita') && T.findFood('pizza margherita').piece === 110, 'pizza margherita (kawałek) w bazie');
ok(!!T.findFood('pierogi ruskie'), 'pierogi ruskie w bazie');
ok(!!T.findFood('kebab w pita'), 'kebab w bazie');

// --- 7. Zgodność wsteczna ---
ok(T.findFood('kurczak') && T.findFood('kurczak').name.includes('kurczaka'), 'wyszukiwanie produktu po nazwie');
ok(T.DEFAULTS().profile.surplus === 300, 'domyślna nadwyżka +300 kcal (edytowalna)');


// --- v6: porcje i talerze ---
const z = T.parseMeal('zupa z buraków 2 talerze')[0];
ok(z.src === 'baza' && z.g === 600, `„zupa z buraków 2 talerze” = 600 g (jest ${z.g} g)`);
ok(near(z.kcal, 210, 0.5), `2 talerze zupy z buraków = ${Math.round(z.kcal)} kcal (35 kcal/100 g)`);
const z2 = T.parseMeal('2 talerze zupy pomidorowej')[0];
ok(z2.g === 600, `„2 talerze zupy pomidorowej” = 600 g (jest ${z2.g})`);
ok(T.parseMeal('1 szklanka mleka')[0].g === 250, '1 szklanka = 250 g');
ok(T.parseMeal('300 ml kefiru')[0].g === 300, '300 ml = 300 g');
ok(T.parseMeal('1 miska owsianki')[0].g === 300, '1 miska owsianki = 300 g');
ok(T.parseMeal('3 kawałki pizzy margherita')[0].g === 330, '3 kawałki pizzy = 330 g');
ok(T.parseMeal('talerz barszczu czerwonego')[0].g === 300, 'talerz barszczu (na początku) = 300 g');
// v7: zgłoszony błąd – „3 Sznycle każdy po 80 gram” nie może dać granoli
{
  const r7 = T.parseMeal('3 Sznycle każdy po 80 gram');
  ok(r7.length === 1 && r7[0].name === 'Kotlet schabowy (smażony)', '3 sznycle każdy po 80 gram → kotlet schabowy');
  ok(r7[0].g === 240, '3 sznycle po 80 g = 240 g');
  ok(Math.round(r7[0].kcal) === 696, '3 sznycle = ok. 696 kcal');
  ok(!/granol/i.test(r7[0].name), 'sznycle nie daje granoli');
  ok(T.parseMeal('3 x 80 g sznycla')[0].g === 240, 'wariant „3 x 80 g sznycla” = 240 g');
  ok(T.parseMeal('gram')[0].name.toLowerCase() !== 'granola', '„gram” nie daje granoli');
  ok(T.findFood('gram') === null, 'findFood(gram) = null (nie zgaduje)');
  ok(T.findFood('Kotlet schabowy (smażony)') !== null, 'pełna nazwa kotleta jest w bazie');
  ok(T.parseMeal('zupa z buraków 2 talerze')[0].g === 600, 'zupa z buraków 2 talerze = 600 g');
  ok(T.parseMeal('ryżu')[0].name === 'Ryż biały (gotowany)', '„ryżu” → Ryż biały (gotowany)');
  ok(T.parseMeal('kurczaka')[0].name === 'Pierś z kurczaka (surowa)', '„kurczaka” → Pierś z kurczaka (surowa)');
  ok(T.parseMeal('talerz barszczu czerwonego')[0].g === 300, 'odmiana „czerwonego” trafia w „czerwony”');
// v7b: płyny i jednostki objętości, większa baza
{
  const sh = T.parseMeal('shake proteinowy 500ml')[0];
  ok(sh.name === 'Shake proteinowy (z wodą)' && sh.g === 500 && sh.vol === 500, 'shake proteinowy 500 ml = shake 500 ml (nie 500 g czegoś innego)');
  ok(T.parseMeal('1 l wody')[0].g === 1000 && T.parseMeal('1 l wody')[0].vol === 1000, '1 l = 1000 ml');
  ok(T.parseMeal('pół litra mleka')[0].g === 500, 'pół litra = 500 ml');
  ok(T.parseMeal('dl mleka')[0].g === 100, '1 dl = 100 ml');
  ok(T.parseMeal('2 butelki coli')[0].g === 660, '2 butelki coli = 660 ml');
  ok(T.parseMeal('szklanka soku pomarańczowego')[0].vol === 250, 'szklanka = 250 ml, pokazana w ml');
  ok(T.parseMeal('150 g kurczaka')[0].vol === null, 'gramy nie są pokazywane jako ml');
  ok(T.data().foodsV === 7 && T.findFood('Curry z kurczakiem i ryżem') !== null, 'baza: wersja 7 i nowe danie');
  ok(T.parseMeal('kurczaka')[0].name === 'Pierś z kurczaka (surowa)', 'nowe dania nie psują „kurczaka”');
}
}
ok(T.parseMeal('2 jajka')[0].g === 120, 'bez zmian: 2 jajka = 120 g');
ok(T.parseMeal('150 g kurczaka')[0].g === 150, 'bez zmian: 150 g kurczaka');
ok(T.data().foods.length >= 400, `baza ma co najmniej 400 pozycji (jest ${T.data().foods.length})`);
ok(T.findFood('zupa z buraków') && T.findFood('zupa z buraków').piece === 300, 'zupy mają wagę talerza 300 g');
ok(T.data().foodsV === 7, 'migracja bazy: wersja 7');

// --- v6: motywy ---
ok(Object.keys(T.THEMES).length >= 6, `motywów: ${Object.keys(T.THEMES).length}`);
const sv = T.themeVars();
ok(sv.acc === T.THEMES.jasny.acc, 'domyślny motyw = jasny');
T.data().ui.theme = 'nocny';
ok(T.themeVars().dark === true, 'motyw nocny jest ciemny');
T.data().ui.acc = '#00ff00';
ok(T.themeVars().acc === '#00ff00' && T.themeVars().acc2 && T.themeVars().accTxt, 'własny kolor akcentu');
T.data().ui.bg = '#fafafa';
ok(T.themeVars().dark === false && T.themeVars().txt !== T.THEMES.nocny.txt, 'własne jasne tło przełącza na jasne napisy');
T.data().ui.bg = '#101010';
ok(T.themeVars().dark === true, 'własne ciemne tło = ciemny motyw');
T.data().ui.acc = null; T.data().ui.bg = null; T.data().ui.theme = 'jasny';

console.log(fails ? `\n${fails} FAIL` : '\nALL PASS');
process.exit(fails ? 1 : 0);
