// ============================================================
// LIFE OS – v6
// Sekcje oznaczone "// === NAZWA ===" – po nazwie możesz prosić o zmiany.
// Ekrany: DZIŚ · TYDZIEŃ · KOSZ · CIAŁO · DIETA/SEN · BIZNES · KOMPAS · PRZEGLĄD · USTAWIENIA
// ============================================================

// === STAŁE ===
const KEY = 'lifeos.v1';                       // ten sam klucz – dane z v1/v2 zostają
const AREAS = {
  kosz:    { label: 'Kosz',        color: '#f97316' },
  cialo:   { label: 'Ciało',       color: '#ef4444' },
  biznes:  { label: 'Biznes',      color: '#3b82f6' },
  szkola:  { label: 'Szkoła',      color: '#9ca3af' },
  mindset: { label: 'Mindset',     color: '#a855f7' },
  regen:   { label: 'Regeneracja', color: '#22c55e' },
  inne:    { label: 'Inne',        color: '#eab308' }
};
const DNI = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];                  // 0 = poniedziałek
const DNI_LONG = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const BLOCKS_DRILL = ['rzut', 'finishing', 'drybling', 'passing', 'rozgrzewka', 'inne'];
const DEFAULT_MIN = ['Bark 5 min', '50 rzutów w górę', 'Ghost 5 min'];
const OLD_DEFAULT_DRILLS = ['25 pull-up po 1 koźle', '25 C&S 5 miejsc', '10 FT', '10 fadeaway'];
const SKILLS = ['Rzut C&S', 'Rzut z kroku', 'Rzut za 3', 'Fadeaway', 'Łuk rzutu', 'Finishing z kontaktem', 'Handle P/L',
  'Balans', 'Nogi', 'Core', 'Bark', 'Obrona 1v1', 'Kondycja', 'Pewność'];
const WORKOUTS = ['Siła A', 'Siła B', 'GOAT', 'Plyo/COD', 'Izometrie'];
const ROUTINE = [['Framuga 2×30 s', 30], ['Wall slides 15', 0], ['Bear crawl 30 s', 30]];
const PHYS_METRICS = [
  ['vert', 'Wyskok z miejsca (cm)'], ['broad', 'Broad jump (cm)'], ['sprint', 'Sprint 10 m (s)'], ['agil', '5-10-5 (s)'],
  ['pullups', 'Podciąganie (szt.)'], ['pushups', 'Pompki (szt.)'], ['plank', 'Plank (s)'], ['wallsit', 'Wall sit (s)'],
  ['ankle', 'Test kostki (cm)'], ['waist', 'Obwód talii (cm)'], ['weight', 'Waga (kg)']
];

// === NARZĘDZIA ===
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const dow = s => (parseISO(s).getDay() + 6) % 7;
const mondayOf = s => addDays(s, -dow(s));
const todayISO = () => iso(new Date());
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtDate = s => `${DNI[dow(s)]} ${s.slice(8)}.${s.slice(5, 7)}.${s.slice(0, 4)}`;
const shortDate = s => `${s.slice(8)}.${s.slice(5, 7)}`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const areaColor = a => (AREAS[a] || AREAS.inne).color;
const areaLabel = a => (AREAS[a] || AREAS.inne).label;
const pct = p => Math.round(p.made / p.att * 100);
const fmtN = v => Number.isInteger(v) ? String(v) : (Math.round(v * 10) / 10).toString();
const fmtT = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const sleepH = (bed, wake) => {
  if (!bed || !wake) return null;
  const [a, b] = bed.split(':').map(Number), [c, d] = wake.split(':').map(Number);
  let m = (c * 60 + d) - (a * 60 + b);
  if (m < 0) m += 1440;
  return Math.round(m / 6) / 10;
};
const byId = (arr, id) => (arr || []).find(x => x.id === id);

// === DANE ===
// data.template = bloki stałe · data.days[YYYY-MM-DD] = {min, goals, done, extra, ev, routine, diet, health, biz}
// kolekcje: drills, hala, workouts, sessions, routine, phys, injuries, logs, prios, skills, diag,
//           ideas, lessons, books, plan90, wins, fears, weight, reviews
function DEFAULTS() {
  return {
    v: 6,
    template: [],
    ui: { theme: 'jasny', acc: null, bg: null },
    foods: DEFAULT_FOODS,
    foodsV: 7,
    profile: { sex: 'm', age: null, height: null, weight: null, activity: 1.55, surplus: 300, protG: 2, fatG: 0.9, waterMlKg: 35 },
    draft: null,
    days: {},
    minimum: DEFAULT_MIN.map(label => ({ id: uid(), label })),
    shots: [],
    drills: [],
    hala: [],
    workouts: WORKOUTS.map(name => ({ id: uid(), name, ex: '' })),
    sessions: [],
    routine: ROUTINE.map(([name, sec]) => ({ id: uid(), name, sec })),
    phys: [],
    injuries: [],
    logs: [],
    prios: [],
    skills: SKILLS.map(name => ({ id: uid(), name })),
    diag: [],
    ideas: [],
    lessons: [],
    books: [],
    plan90: [],
    wins: [],
    fears: [],
    weight: [],
    reviews: {},
    texts: { why: '', anti: '', coach: '', rule: '', vision5: '', vision1: '', goal90: '', values: '', rules: '', reddish: '',
             arsenal: ['', '', '', '', '', '', ''] }
  };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS();
    const obj = JSON.parse(raw);
    const d = Object.assign(DEFAULTS(), obj);
    // migracja: stare domyślne dryle -> pusta lista
    if (Array.isArray(obj.drills) && JSON.stringify(obj.drills) === JSON.stringify(OLD_DEFAULT_DRILLS)) d.drills = [];
    // migracja: dryle jako tekst -> obiekty
    d.drills = (d.drills || []).map(x => typeof x === 'string'
      ? { id: uid(), name: x, block: '', time: null, reps: '', link: '', works: '', note: '' } : x);
    d.texts = Object.assign(DEFAULTS().texts, obj.texts || {});
    // migracja: dopisz do bazy produkty z nowszej wersji (bez ruszania Twoich własnych)
    if ((obj.foodsV || 0) < 7) {
      const have = new Set((d.foods || []).map(f => f.name.toLowerCase()));
      d.foods = [...(d.foods || []), ...FOOD_BASE.filter(f => !have.has(f[0].toLowerCase())).map(foodFrom)];
      d.foodsV = 7;
    }
    d.v = 6;
    d.ui = Object.assign(DEFAULTS().ui, obj.ui || {});
    d.profile = Object.assign(DEFAULTS().profile, obj.profile || {});
    return d;
  } catch (e) { return DEFAULTS(); }
}
// Zapis lokalny (od razu) + zaznaczenie zmiany do wysłania do chmury
function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  setMeta({ dirty: true, localTs: Date.now() });
  bkAuto();
  schedulePush();
}

// Rekord dnia; migracja top -> goals
function day(s) {
  const d = data.days[s] || (data.days[s] = {});
  d.min = d.min || {};
  d.done = d.done || {};
  d.extra = d.extra || [];
  d.ev = d.ev || {};
  d.routine = d.routine || {};
  d.diet = d.diet || {};
  d.health = d.health || {};
  d.biz = d.biz || {};
  if (!d.goals) d.goals = (d.top || []).filter(x => x && x.t).map(x => ({ id: uid(), t: x.t, done: !!x.done }));
  delete d.top;
  return d;
}

// Bloki dnia = bloki stałe (z nadpisaniami dnia) + jednorazowe
function blocksFor(s) {
  const d = data.days[s] || {};
  const done = d.done || {};
  const out = [];
  for (const t of data.template) {
    if (!t.days.includes(dow(s))) continue;
    if (t.start && s < t.start) continue;          // seria zaczyna się później
    if (t.until && s > t.until) continue;          // seria już się skończyła
    const o = done[t.id] || {};
    if (o.hidden) continue;
    // nadpisania „tylko ten dzień” (nazwa, obszar, godziny) – szablon zostaje bez zmian
    out.push({ id: t.id, kind: 't', name: o.name || t.name, area: o.area || t.area,
               from: o.from ?? t.from ?? '', to: o.to ?? t.to ?? '',
               done: !!o.done, rating: o.rating || 0, note: o.note || '' });
  }
  for (const e of (d.extra || [])) {
    out.push({ id: e.id, kind: 'x', name: e.name, area: e.area, from: e.from || '', to: e.to || '',
               done: !!e.done, rating: e.rating || 0, note: e.note || '' });
  }
  return out.sort((a, b) => (a.from || '').localeCompare(b.from || ''));
}
// Zakres godzin; puste pola = bez godziny (bez domyślnych wartości)
const tm = b => (b.from || b.to) ? `${b.from || '??:??'}–${b.to || '??:??'}` : 'bez godziny';
function setBlock(s, k, id, patch) {
  const d = day(s);
  if (k === 'x') Object.assign(d.extra.find(x => x.id === id) || {}, patch);
  else d.done[id] = Object.assign(d.done[id] || {}, patch);
  save();
}

// === STREAK ===
// Płomień jako grafika SVG (zamiast emoji, która wygląda różnie w systemach)
function flameIcon(size = 30) {
  return `<svg width="${size}" height="${Math.round(size * 1.25)}" viewBox="0 0 24 30" aria-hidden="true" style="flex:none"><defs><linearGradient id="flameG" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1f"/><stop offset="0.6" stop-color="#ff9f1c"/><stop offset="1" stop-color="#ffd166"/></linearGradient></defs><path d="M12 1c1.2 4.2 6.5 7.4 6.5 14.2A6.5 6.5 0 0 1 5.5 15.2c0-3.2 1.7-5.2 3.1-6.8.3 2.1 1 3.5 2.3 4.2C10.4 7.6 10.9 4 12 1z" fill="url(#flameG)"/></svg>`;
}
// === MINIMUM DNIA (zakresy: tylko dziś / ten tydzień / na zawsze) ===
// Punkt może mieć daty od–do (from/until). Bez dat = obowiązuje zawsze (stare dane zostają bez zmian).
// Dzień może ukryć punkt (day.minOff) albo mieć punkt tylko na siebie (day.minExtra).
// Zmiany w Ustawieniach działają od dziś, więc nie psują serii za wcześniejsze dni.
const minActive = (m, s) => (!m.from || s >= m.from) && (!m.until || s <= m.until);
const weekEnd = s => addDays(mondayOf(s), 6);
function minFor(s) {
  const d = data.days[s] || {}, off = d.minOff || {};
  return data.minimum.filter(m => minActive(m, s) && !off[m.id]).concat(d.minExtra || []);
}
function dayComplete(s) {
  const d = data.days[s], list = minFor(s);
  return !!d && list.length > 0 && list.every(m => d.min && d.min[m.id]);
}
// Dodanie z Ustawień: sc = 'day' | 'week' | 'all'
function minAddScoped(label, sc) {
  const t = todayISO();
  if (sc === 'day') { const d = day(t); d.minExtra = (d.minExtra || []).concat([{ id: uid(), label }]); }
  else if (sc === 'week') data.minimum.push({ id: uid(), label, from: t, until: weekEnd(t) });
  else data.minimum.push({ id: uid(), label, from: t });
  save(); render();
}
// Usunięcie z Ustawień: sc = 'day' | 'week' | 'all'. Historia dni przed dziś zostaje.
function minRemoveScoped(id, sc) {
  const t = todayISO(), d = day(t);
  const extra = (d.minExtra || []).some(x => x.id === id);
  if (extra) { d.minExtra = d.minExtra.filter(x => x.id !== id); }
  else if (sc === 'day') { d.minOff = d.minOff || {}; d.minOff[id] = true; }
  else if (sc === 'week') {
    for (let x = t; x <= weekEnd(t); x = addDays(x, 1)) { const dd = day(x); dd.minOff = dd.minOff || {}; dd.minOff[id] = true; }
  } else {
    const m = byId(data.minimum, id);
    if (m) {
      if (m.from && m.from >= t) data.minimum = data.minimum.filter(x => x.id !== id);   // zaczynał się dziś – po prostu znika
      else m.until = addDays(t, -1);                                                    // wcześniejsze dni zostają
    }
  }
  save(); render();
}
// Ukrycie punktu na jeden dzień (z Ustawień – wybrany dzień tygodnia)
function minHideDay(id, s) {
  const d = day(s);
  if ((d.minExtra || []).some(x => x.id === id)) d.minExtra = d.minExtra.filter(x => x.id !== id);
  else { d.minOff = d.minOff || {}; d.minOff[id] = true; }
  save(); render();
}
// Ukrycie punktu na cały tydzień (od poniedziałku mon)
function minHideWeek(id, mon) {
  for (let i = 0; i < 7; i++) {
    const x = addDays(mon, i), d = day(x);
    if ((d.minExtra || []).some(e => e.id === id)) d.minExtra = d.minExtra.filter(e => e.id !== id);
    else { d.minOff = d.minOff || {}; d.minOff[id] = true; }
  }
  save(); render();
}
// Przywrócenie punktu na jeden dzień (drugie kliknięcie w przycisk dnia)
function minRestoreDay(id, s) {
  const d = data.days[s];
  if (d && d.minOff) { delete d.minOff[id]; if (!Object.keys(d.minOff).length) delete d.minOff; }
  save(); render();
}
// Przywrócenie ukrytych dni tygodnia dla punktu
function minRestoreWeek(id, mon) {
  for (let i = 0; i < 7; i++) {
    const d = data.days[addDays(mon, i)];
    if (d && d.minOff) { delete d.minOff[id]; if (!Object.keys(d.minOff).length) delete d.minOff; }
  }
  save(); render();
}
// Całkowite usunięcie: z listy i z całej historii (wszystkie dni, także przyszłe)
function minDeleteAll(id) {
  data.minimum = data.minimum.filter(x => x.id !== id);
  for (const k of Object.keys(data.days)) {
    const d = data.days[k];
    if (d.min) delete d.min[id];
    if (d.minOff) delete d.minOff[id];
    if (d.minExtra) d.minExtra = d.minExtra.filter(x => x.id !== id);
  }
  save(); render();
}
// Dopisanie punktu do wybranego tygodnia (perm = true → od tego tygodnia na stałe)
function minAddWeek(label, mon, perm) {
  const m = { id: uid(), label, from: mon };
  if (!perm) m.until = addDays(mon, 6);
  data.minimum.push(m);
  save(); render();
}
// Przyciski dni dla punktu (Ustawienia i okno ✕): kliknięcie wyłącza, drugie kliknięcie włącza z powrotem
function minChips(m, mon) {
  return [0, 1, 2, 3, 4, 5, 6].map(i => {
    const x = addDays(mon, i), rec = data.days[x] || {};
    const off = !!(rec.minOff || {})[m.id], act = minActive(m, x), on = act && !off;
    return `<button data-act="minDayToggle" data-id="${m.id}" data-s="${x}" ${act ? '' : 'disabled'}
      style="min-width:44px;padding:6px 8px;border-radius:999px;border:1px solid var(--line2);cursor:${act ? 'pointer' : 'default'};
      background:${on ? 'var(--acc)' : 'var(--card2)'};color:${on ? 'var(--accTxt)' : 'var(--mut)'};
      ${on ? '' : 'text-decoration:line-through;opacity:.6;'}">${DNI[i]}</button>`;
  }).join(' ');
}
// Dopisanie punktu do kilku tygodni naraz (wybrane poniedziałki)
function minAddMulti(label, mons) {
  for (const mon of mons) data.minimum.push({ id: uid(), label, from: mon, until: addDays(mon, 6) });
  save(); render();
}
// Karta „Minimum dnia” w Ustawieniach – widok tygodnia z przełącznikiem ‹ ›
function minSettingsCard() {
  const mon = state.minWeek || mondayOf(todayISO()), sun = addDays(mon, 6);
  const isNow = mon === mondayOf(todayISO());
  // W bieżącym tygodniu pokazujemy punkty aktywne od dziś; w minionych – historię tygodnia
  const t0 = todayISO(), lo = sun < t0 ? mon : (mon > t0 ? mon : t0);
  const list = data.minimum.filter(m => (!m.from || m.from <= sun) && (!m.until || m.until >= lo));
  const items = list.map(m => `<div class="item" style="flex-wrap:wrap">
      <input class="gtxt grow" value="${esc(m.label)}" data-chg="minLabel" data-id="${m.id}" aria-label="punkt minimum">
      <button class="x" data-act="minDel" data-id="${m.id}" aria-label="usuń">✕</button>
      <div class="row keep" style="gap:6px;flex-wrap:wrap;width:100%;margin-top:6px">${minChips(m, mon)}</div></div>`).join('');
  return `<div class="sec"><h2>✅ Minimum dnia</h2><small>punkty do streaka</small></div>
  <div class="card">
    <div class="datebar">
      <button class="ic" data-act="minWeekShift" data-n="-1" aria-label="poprzedni tydzień">‹</button>
      <div style="text-align:center"><div class="dname">Tydzień</div>
        <div class="mut">${shortDate(mon)} – ${shortDate(sun)}.${sun.slice(0, 4)}${isNow ? ' · ten tydzień' : ''}</div>
        ${isNow ? '' : '<button class="link" data-act="minWeekToday">↩ ten tydzień</button>'}</div>
      <button class="ic" data-act="minWeekShift" data-n="1" aria-label="następny tydzień">›</button>
    </div>
    ${items || '<div class="hint">Na ten tydzień nie ma punktów minimum.</div>'}
    <div class="pills" style="margin:8px 0">
      <label class="pill"><input type="radio" name="minScope" value="week" checked> tylko ten tydzień</label>
      <label class="pill"><input type="radio" name="minScope" value="perm"> od tego tygodnia na stałe</label>
      <label class="pill"><input type="radio" name="minScope" value="multi"> w zaznaczonych tygodniach</label></div>
    <div class="row keep" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => {
      const w = addDays(mon, 7 * k);
      return `<label class="pill"><input type="checkbox" name="minWk" value="${w}" ${k === 0 ? 'checked' : ''}> ${shortDate(w)}–${shortDate(addDays(w, 6))}</label>`; }).join('')}</div>
    <div class="addrow"><input id="newMin" placeholder="+ nowy punkt minimum"><button class="pri" data-act="minAdd">Dodaj</button></div>
    <div class="hint">Punkty dopisujesz do wybranego tygodnia (np. pod koniec tygodnia na następny). Pojedyncze dni usuwasz w ✕.</div>
  </div>`;
}

// Punkt tylko na jeden dzień (z ekranu Dziś)
function minDayAdd(s, label) {
  const d = day(s); d.minExtra = (d.minExtra || []).concat([{ id: uid(), label }]); save(); render();
}
// Ukrycie punktu tylko na ten dzień (z ekranu Dziś)
function minDayOff(s, id) {
  const d = day(s);
  if ((d.minExtra || []).some(x => x.id === id)) d.minExtra = d.minExtra.filter(x => x.id !== id);
  else { d.minOff = d.minOff || {}; d.minOff[id] = true; }
  save(); render();
}
function streaks() {
  let cur = 0;
  const d = parseISO(todayISO());
  if (!dayComplete(iso(d))) d.setDate(d.getDate() - 1);
  while (dayComplete(iso(d))) { cur++; d.setDate(d.getDate() - 1); }
  let best = 0, run = 0, prev = null;
  for (const k of Object.keys(data.days).sort()) {
    if (!dayComplete(k)) { run = 0; prev = null; continue; }
    run = (prev && daysBetween(prev, k) === 1) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return { cur, best: Math.max(best, cur) };
}

// === TIMER (globalny pasek) ===
const timer = { end: 0, label: '', tick: null };
function startTimer(sec, label) {
  if (!sec || sec <= 0) return;
  timer.end = Date.now() + sec * 1000;
  timer.label = label || 'Timer';
  clearInterval(timer.tick);
  timer.tick = setInterval(tickTimer, 250);
  tickTimer();
}
function stopTimer() { clearInterval(timer.tick); timer.end = 0; renderTimer(); }
function tickTimer() {
  const left = Math.ceil((timer.end - Date.now()) / 1000);
  if (timer.end && left <= 0) {
    clearInterval(timer.tick);
    timer.end = 0;
    alarm();
  }
  renderTimer();
}
function renderTimer() {
  const bar = document.getElementById('timerbar');
  if (!bar) return;
  if (!timer.end) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
  const left = Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
  bar.classList.remove('hidden');
  bar.innerHTML = `<span>⏱ <b>${fmtT(left)}</b> · ${esc(timer.label)}</span><button class="x" data-act="timerStop">■ stop</button>`;
}
function alarm() {
  try {
    const A = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach(t => {
      const o = A.createOscillator(), g = A.createGain();
      o.connect(g); g.connect(A.destination);
      o.frequency.value = 880; g.gain.value = 0.2;
      o.start(A.currentTime + t); o.stop(A.currentTime + t + 0.2);
    });
  } catch (e) { /* brak dźwięku */ }
  if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]);
  setTimeout(() => alert('⏱ Koniec: ' + timer.label), 50);
}

// === UI POMOCNICZE ===
function rateSelect(v) {
  return `<select name="rating">${[0, 1, 2, 3, 4, 5].map(n =>
    `<option value="${n}" ${n == v ? 'selected' : ''}>${n ? n + ' / 5' : 'bez oceny'}</option>`).join('')}</select>`;
}
function areaSelect(a) {
  return `<select name="area">${Object.entries(AREAS).map(([k, v]) =>
    `<option value="${k}" ${k === (a || 'inne') ? 'selected' : ''}>${v.label}</option>`).join('')}</select>`;
}
function blockRow(s, b) {
  return `<div class="blk ${b.done ? 'done' : ''}" style="border-left-color:${areaColor(b.area)}">
    <input type="checkbox" data-chg="bdone" data-s="${s}" data-k="${b.kind}" data-id="${b.id}" ${b.done ? 'checked' : ''} aria-label="zrobione">
    <div class="grow" data-act="blockOpen" data-s="${s}" data-k="${b.kind}" data-id="${b.id}" style="cursor:pointer">
      <div class="meta">${tm(b)} · ${areaLabel(b.area)}</div>
      <div class="name">${esc(b.name)}</div>
    </div>
    <select data-chg="brate" data-s="${s}" data-k="${b.kind}" data-id="${b.id}" aria-label="ocena">
      ${[0, 1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n == b.rating ? 'selected' : ''}>${n ? n + '★' : '—'}</option>`).join('')}
    </select>
  </div>`;
}
function openSheet(html) {
  document.getElementById('sheetBox').innerHTML = html;
  document.getElementById('sheet').classList.remove('hidden');
}
function closeSheet() { document.getElementById('sheet').classList.add('hidden'); }
function tabs(screen, list) {
  const cur = state.sub[screen];
  return `<div class="tabs">${list.map(([v, l]) =>
    `<button class="${cur === v ? 'on' : ''}" data-act="sub" data-s="${screen}" data-v="${v}">${l}</button>`).join('')}</div>`;
}
// Wykres liniowy: pts = [{l: etykieta, v: liczba}]
function svgLine(pts) {
  pts = pts.filter(p => p.v !== null && p.v !== undefined && !isNaN(p.v));
  if (pts.length < 1) return '<div class="hint">Za mało danych na wykres. Dodaj pierwszy wpis.</div>';
  const W = 320, H = 150, P = 26, n = pts.length;
  const vs = pts.map(p => p.v);
  let mn = Math.min(...vs), mx = Math.max(...vs);
  if (mn === mx) { mn -= 1; mx += 1; }
  const xy = pts.map((p, i) => ({
    x: n === 1 ? W / 2 : P + i * (W - 2 * P) / (n - 1),
    y: H - P - (p.v - mn) / (mx - mn) * (H - 2 * P), p
  }));
  return `<svg viewBox="0 0 ${W} ${H}" width="100%">
    <line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" style="stroke:var(--line2)"/>
    ${n > 1 ? `<polyline points="${xy.map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ')}" fill="none" style="stroke:var(--acc)" stroke-width="2.5"/>` : ''}
    ${xy.map(q => `<circle cx="${q.x}" cy="${q.y}" r="4" style="fill:var(--acc)"></circle>
      <text x="${q.x}" y="${q.y - 9}" style="fill:var(--txt)" font-size="11" text-anchor="middle">${fmtN(q.p.v)}</text>`).join('')}
  </svg>
  <div class="mut">${esc(pts[0].l)} → ${esc(pts[n - 1].l)}</div>`;
}

// === REKORDY (generyczne formularze i listy) ===
// Każda kolekcja: nazwa, pola formularza, opcjonalny limit
const SPEC = {
  drills: { one: 'dryl', f: [
    { k: 'name', l: 'Nazwa', req: 1 },
    { k: 'block', l: 'Blok', t: 'select', o: BLOCKS_DRILL.map(b => [b, b]) },
    { k: 'time', l: 'Czas (min)', t: 'num' },
    { k: 'reps', l: 'Powtórzenia / opis (np. 25 po 1 koźle)' },
    { k: 'link', l: 'Link (YT / IG / TT)' },
    { k: 'works', l: 'Na co działa' },
    { k: 'note', l: 'Notatka', t: 'textarea' }] },
  hala: { one: 'blok hali', f: [
    { k: 'dow', l: 'Dzień', t: 'select', n: 1, o: DNI.map((n, i) => [i, DNI_LONG[i]]) },
    { k: 'from', l: 'Godzina od', t: 'time' },
    { k: 'min', l: 'Długość (min)', t: 'num', d: 60 },
    { k: 'name', l: 'Nazwa bloku', req: 1 },
    { k: 'drills', l: 'Drille / co robię', t: 'textarea' }] },
  workouts: { one: 'trening', f: [
    { k: 'name', l: 'Nazwa (np. Siła A)', req: 1 },
    { k: 'ex', l: 'Ćwiczenia – jedno w linii: Nazwa | 3x8 | tempo | link | odpoczynek (s) | ciężar (kg)', t: 'textarea' }] },
  routine: { one: 'punkt rutyny', f: [
    { k: 'name', l: 'Nazwa (np. Framuga 2×30 s)', req: 1 },
    { k: 'sec', l: 'Timer w sekundach (0 = bez timera)', t: 'num', d: 0 }] },
  phys: { one: 'pomiar fizyczny', f: [
    { k: 'date', l: 'Data', t: 'date', d: 'today' },
    ...PHYS_METRICS.map(([k, l]) => ({ k, l, t: 'num' })),
    { k: 'bark', l: 'Test barku przy ścianie', t: 'select', o: [['', '—'], ['ok', 'ok'], ['nie', 'nie']] },
    { k: 'note', l: 'Notatka', t: 'textarea' }] },
  injuries: { one: 'ból / kontuzja', f: [
    { k: 'date', l: 'Data', t: 'date', d: 'today' },
    { k: 'where', l: 'Gdzie', req: 1 },
    { k: 'pain', l: 'Ból 1–10', t: 'num' },
    { k: 'helped', l: 'Co pomogło', t: 'textarea' }] },
  logs: { one: 'wpis dziennika', f: [
    { k: 'date', l: 'Data', t: 'date', d: 'today' },
    { k: 'type', l: 'Typ', t: 'select', o: [['dom', 'dom'], ['hala', 'hala'], ['klub', 'klub'], ['mecz', 'mecz']] },
    { k: 'q', l: 'Jakość 1–5', t: 'select', n: 1, o: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']] },
    { k: 'good', l: '1 rzecz dobra' },
    { k: 'improve', l: '1 rzecz do poprawy' },
    { k: 'cue', l: '1 lekcja / cue' }] },
  prios: { one: 'priorytet 90 dni', max: 3, f: [
    { k: 'name', l: 'Nazwa', req: 1 },
    { k: 'metric', l: 'Miara (np. % rzutu z 3)' },
    { k: 'start', l: 'Start', t: 'num' },
    { k: 'current', l: 'Obecnie', t: 'num' },
    { k: 'goal', l: 'Cel', t: 'num' },
    { k: 'deadline', l: 'Deadline', t: 'date' }] },
  skills: { one: 'umiejętność', f: [{ k: 'name', l: 'Nazwa', req: 1 }] },
  ideas: { one: 'pomysł biznesowy', f: [
    { k: 'name', l: 'Nazwa', req: 1 },
    { k: 'problem', l: 'Problem', t: 'textarea' },
    { k: 'who', l: 'Dla kogo' },
    { k: 'how', l: 'Jak zarabia', t: 'textarea' },
    { k: 'why', l: 'Dlaczego ja', t: 'textarea' },
    { k: 'cost', l: 'Koszt startu' },
    { k: 'sc_rynek', l: 'Rynek 1–5', t: 'num', s: 1 },
    { k: 'sc_fit', l: 'Fit 1–5', t: 'num', s: 1 },
    { k: 'sc_latwosc', l: 'Łatwość 1–5', t: 'num', s: 1 },
    { k: 'sc_skal', l: 'Skalowalność 1–5', t: 'num', s: 1 },
    { k: 'sc_jaranie', l: 'Jaranie 1–5', t: 'num', s: 1 },
    { k: 'status', l: 'Status', t: 'select', o: [['pomysl', 'pomysł'], ['zbadac', 'do zbadania'], ['testuje', 'testuję'], ['odrzucony', 'odrzucone']] },
    { k: 'why_no', l: 'Dlaczego odrzucone (jeśli dotyczy)', t: 'textarea' }] },
  lessons: { one: 'wpis', f: [
    { k: 'date', l: 'Data', t: 'date', d: 'today' },
    { k: 'type', l: 'Typ', t: 'select', o: [['lekcja', 'lekcja'], ['porazka', 'porażka']] },
    { k: 'text', l: 'Treść', t: 'textarea', req: 1 }] },
  books: { one: 'pozycja nauki', f: [
    { k: 'title', l: 'Tytuł', req: 1 },
    { k: 'type', l: 'Typ', t: 'select', o: [['ksiazka', 'książka'], ['kurs', 'kurs']] },
    { k: 'status', l: 'Status', t: 'select', o: [['do', 'do przeczytania'], ['w', 'w trakcie'], ['ok', 'skończone']] },
    { k: 'insights', l: '5 wniosków – każdy w nowej linii', t: 'textarea' },
    { k: 'action', l: '1 akcja' }] },
  plan90: { one: 'krok planu 90 dni', f: [
    { k: 'title', l: 'Krok', req: 1 },
    { k: 'week', l: 'Tydzień (nr)', t: 'num', d: 1 },
    { k: 'done', l: 'Zrobione', t: 'check' }] },
  wins: { one: 'wygraną', f: [{ k: 'text', l: 'Wygrana', t: 'textarea', req: 1 }, { k: 'date', l: 'Data', t: 'date', d: 'today' }] },
  fears: { one: 'strach', f: [{ k: 'text', l: 'Strach', t: 'textarea', req: 1 }] },
  foods: { one: 'produkt (wartości na 100 g)', f: [
    { k: 'name', l: 'Nazwa', req: 1 },
    { k: 'kcal', l: 'kcal / 100 g', t: 'num', req: 1 },
    { k: 'p', l: 'Białko / 100 g', t: 'num', d: 0 },
    { k: 'c', l: 'Węglowodany / 100 g', t: 'num', d: 0 },
    { k: 'f', l: 'Tłuszcz / 100 g', t: 'num', d: 0 },
    { k: 'fib', l: 'Błonnik / 100 g (g, puste = brak danych)', t: 'num' },
    { k: 'sug', l: 'Cukry / 100 g (g, puste = brak danych)', t: 'num' },
    { k: 'sat', l: 'Tłuszcz nasycony / 100 g (g, puste = brak danych)', t: 'num' },
    { k: 'salt', l: 'Sól / 100 g (g, puste = brak danych)', t: 'num' },
    { k: 'piece', l: 'Waga 1 porcji / talerza / sztuki (g, puste = brak)', t: 'num' }] },
  weight: { one: 'pomiar wagi', f: [
    { k: 'date', l: 'Data', t: 'date', d: 'today' },
    { k: 'kg', l: 'Waga (kg)', t: 'num', req: 1, s: 0.1 }] }
};

function fieldHTML(f, v) {
  const val = v === undefined || v === null ? '' : v;
  if (f.t === 'check') return `<label class="pill" style="margin-top:12px"><input type="checkbox" name="${f.k}" ${val ? 'checked' : ''}> ${esc(f.l)}</label>`;
  if (f.t === 'textarea') return `<label>${esc(f.l)}</label><textarea name="${f.k}">${esc(val)}</textarea>`;
  if (f.t === 'select') return `<label>${esc(f.l)}</label><select name="${f.k}">${f.o.map(([a, b]) =>
    `<option value="${esc(a)}" ${String(a) === String(val) ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>`;
  if (f.t === 'num') return `<label>${esc(f.l)}</label><input type="number" step="${f.s || 'any'}" inputmode="decimal" name="${f.k}" value="${esc(val)}">`;
  return `<label>${esc(f.l)}</label><input type="${f.t || 'text'}" name="${f.k}" value="${esc(val)}">`;
}
// Czyta pola z formularza (root = element, w którym szukamy)
function readFields(fields, root) {
  const o = {};
  for (const f of fields) {
    const e = root.querySelector(`[name="${f.k}"]`);
    if (!e) continue;
    let v;
    if (f.t === 'check') v = e.checked;
    else if (f.t === 'num') v = e.value === '' ? null : +e.value;
    else if (f.t === 'select' && f.n) v = +e.value;
    else v = typeof e.value === 'string' ? e.value.trim() : e.value;
    o[f.k] = v;
  }
  return o;
}
function openRec(coll, id, pre) {
  const S = SPEC[coll];
  const r = id ? (byId(data[coll], id) || {}) : { ...(pre || {}) };
  const val = f => r[f.k] !== undefined ? r[f.k] : (f.d === 'today' ? todayISO() : f.d);
  openSheet(`<h2>${id ? 'Edytuj' : 'Dodaj'}: ${S.one}</h2>
    ${S.f.map(f => fieldHTML(f, val(f))).join('')}
    <div class="foot">
      <button class="pri full" data-act="recSave" data-c="${coll}" data-id="${id || ''}">Zapisz</button>
      ${id ? `<button class="danger full" data-act="recDel" data-c="${coll}" data-id="${id}">Usuń</button>` : ''}
      <button class="full" data-act="sheetClose">Anuluj</button>
    </div>`);
}
// === PLAN HALI ↔ GRAFIK: każdy blok hali ma powiązany blok stały w Tygodniu (hallId) ===
function hallEnd(h) {
  if (!h.from) return '';
  const [hh, mm] = h.from.split(':').map(Number), t = hh * 60 + mm + (parseInt(h.min, 10) || 0);
  const pad = x => String(x).padStart(2, '0');
  return `${pad(Math.floor(t / 60) % 24)}:${pad(t % 60)}`;
}
function syncHall(h) {
  let t = data.template.find(x => x.hallId === h.id);
  if (!t) { t = { id: uid(), hallId: h.id, area: 'kosz', days: [] }; data.template.push(t); }
  Object.assign(t, { name: h.name || 'Hala', from: h.from || '', to: hallEnd(h), days: [parseInt(h.dow, 10) || 0] });
}
function unsyncHall(hid) { data.template = data.template.filter(x => x.hallId !== hid); }

function recSave(el) {
  const { c, id } = el.dataset, S = SPEC[c], root = document.getElementById('sheetBox');
  const o = readFields(S.f, root);
  const req = S.f.find(f => f.req);
  if (req && (o[req.k] === '' || o[req.k] === null || o[req.k] === undefined)) return alert('Uzupełnij: ' + req.l);
  data[c] = data[c] || [];
  if (id) Object.assign(byId(data[c], id) || {}, o);
  else {
    if (S.max && data[c].length >= S.max) return alert(`Maksymalnie ${S.max} – usuń albo zakończ jeden.`);
    data[c].push({ id: uid(), ts: Date.now(), ...o });
  }
  if (c === 'hala') syncHall(byId(data.hala, id || data.hala[data.hala.length - 1].id));
  save(); closeSheet(); render();
}
function recDel(el) {
  if (!confirm('Na pewno usunąć?')) return;
  const { c, id } = el.dataset;
  data[c] = data[c].filter(x => x.id !== id);
  if (c === 'hala') unsyncHall(id);
  save(); closeSheet(); render();
}
// Karty listy z edycją (tap = edytuj) i przyciskiem dodaj
function listCards(coll, opt = {}) {
  let arr = [...(data[coll] || [])];
  if (opt.filter) arr = arr.filter(opt.filter);
  if (opt.sort) arr.sort(opt.sort);
  const rows = arr.map(r => `<div class="item">
      <div class="grow" data-act="recEdit" data-c="${coll}" data-id="${r.id}" style="cursor:pointer">${opt.sum(r)}</div>
      ${opt.extra ? opt.extra(r) : ''}
    </div>`).join('');
  return `<div class="card">${rows || `<div class="hint">${opt.empty || 'Brak wpisów.'}</div>`}
    <button class="pri full" data-act="recNew" data-c="${coll}" style="margin-top:12px">+ ${opt.add || 'Dodaj'}</button></div>`;
}

// === EKRAN: DZIŚ ===
function goalsCard(s) {
  const goals = day(s).goals;
  return `<div class="card">
    ${goals.length ? goals.map(g => `<div class="item ${g.done ? 'done' : ''}">
      <input type="checkbox" data-chg="goalDone" data-s="${s}" data-id="${g.id}" ${g.done ? 'checked' : ''} aria-label="zrobione">
      <input class="gtxt grow t" data-chg="goalTxt" data-s="${s}" data-id="${g.id}" value="${esc(g.t)}" aria-label="treść celu">
      <button class="x" data-act="goalDel" data-s="${s}" data-id="${g.id}" aria-label="usuń cel">✕</button>
    </div>`).join('') : '<div class="hint">Brak celów. Dodaj pierwszy poniżej.</div>'}
    <div class="addrow">
      <input id="ga-${s}" placeholder="+ nowy cel (Enter aby dodać)" data-enter="goalAdd" data-s="${s}">
      <button class="pri" data-act="goalAdd" data-s="${s}">Dodaj</button>
    </div>
  </div>`;
}
function screenDzis() {
  const s = state.date, d = day(s), bl = blocksFor(s), st = streaks();
  const isToday = s === todayISO();
  const mins = minFor(s);
  const cnt = mins.filter(m => d.min[m.id]).length;
  const minDone = mins.length > 0 && cnt === mins.length;
  const gDone = d.goals.filter(g => g.done).length;
  const hidden = Object.values(d.done).filter(o => o.hidden).length;
  const T = data.texts, ev = d.ev, tom = addDays(s, 1);
  return `
  <div class="datebar">
    <button class="ic" data-act="dayShift" data-n="-1" aria-label="poprzedni dzień">‹</button>
    <div style="text-align:center">
      <div class="dname">${DNI_LONG[dow(s)]}</div>
      <div class="mut">${fmtDate(s)}${isToday ? ' · dziś' : ''}</div>
      ${isToday ? '' : '<button class="link" data-act="dayToday">↩ wróć do dziś</button>'}
    </div>
    <button class="ic" data-act="dayShift" data-n="1" aria-label="następny dzień">›</button>
  </div>

  <div class="hero">
    <div><div class="mut">Seria dni z rzędu</div>
      <div class="row keep" style="gap:10px;align-items:center">${flameIcon(34)}<span class="streak" style="font-size:44px">${st.cur}</span></div>
      <div class="mut">${minDone ? 'dziś zaliczone ✔' : (mins.length ? `dziś brakuje ${mins.length - cnt} do +1` : 'dodaj punkty minimum w Ustawieniach')} · najdłuższa: ${st.best}</div></div>
    <div class="minbox ${minDone ? 'ok' : ''}"><div class="mut">Minimum</div><div class="big">${cnt} / ${mins.length}</div>
      <div class="mut">${minDone ? '✔ dzień zaliczony' : 'zrób wszystko, żeby zaliczyć'}</div></div>
  </div>

  <div class="sec"><h2>🎯 Cele na dziś</h2><small>${gDone}/${d.goals.length} zrobione</small></div>
  ${goalsCard(s)}

  <div class="sec"><h2>✅ Minimum dnia</h2><small>edycja: Ustawienia</small></div>
  <div class="card">
    ${mins.map(m => `<div class="item ${d.min[m.id] ? 'done' : ''}">
      <label class="grow" style="cursor:pointer;display:flex;align-items:center;gap:10px">
        <input type="checkbox" data-chg="min" data-id="${m.id}" ${d.min[m.id] ? 'checked' : ''}>
        <span class="t grow" style="font-size:18px">${esc(m.label)}${(d.minExtra || []).some(x => x.id === m.id) ? ' <small class="mut">(tylko ten dzień)</small>' : ''}</span></label>
      <button class="x" data-act="minOffDay" data-s="${s}" data-id="${m.id}" aria-label="usuń na ten dzień">✕</button></div>`).join('') || '<div class="hint">Brak punktów minimum na ten dzień.</div>'}
    <div class="addrow"><input id="dayMin" placeholder="+ punkt tylko na ten dzień"><button class="pri" data-act="minAddDay" data-s="${s}">Dodaj</button></div>
    ${Object.keys(d.minOff || {}).length ? `<div class="row keep" style="margin-top:8px"><button class="link" data-act="minRestore" data-s="${s}">↩ przywróć ukryte punkty na ten dzień</button></div>` : ''}
  </div>

  <div class="sec"><h2>📋 Plan dnia</h2><small>${bl.filter(b => b.done).length}/${bl.length}</small></div>
  <div class="card">
    ${bl.length ? bl.map(b => blockRow(s, b)).join('') : '<div class="hint">Brak bloków na ten dzień. Dodaj stałe w TYDZIEŃ albo jednorazowy poniżej.</div>'}
    <div class="row keep" style="margin-top:10px;flex-wrap:wrap;gap:8px">
      <button data-act="extraNew" data-s="${s}">+ Blok jednorazowy</button>
      ${hidden ? `<button class="link" data-act="unhide" data-s="${s}">przywróć ukryte (${hidden})</button>` : ''}
    </div>
  </div>

  <div class="sec"><h2>☀ Poranek</h2></div>
  <details class="card">
    <summary>Pokaż kartę PORANEK</summary>
    <div class="kv"><div class="k">Dlaczego</div><div>${T.why ? esc(T.why) : '<span class="mut">uzupełnij w KOMPAS</span>'}</div></div>
    <div class="kv"><div class="k">Antywizja</div><div>${T.anti ? esc(T.anti) : '<span class="mut">uzupełnij w KOMPAS</span>'}</div></div>
    <div class="kv"><div class="k">Od trenera</div><div>${T.coach ? esc(T.coach) : '<span class="mut">uzupełnij w KOMPAS</span>'}</div></div>
    <div class="kv"><div class="k">Zasada dnia</div><div>${T.rule ? esc(T.rule) : '<span class="mut">uzupełnij w KOMPAS</span>'}</div></div>
  </details>

  <div class="sec"><h2>🌙 Wieczór</h2><small>${s}</small></div>
  <div class="card">
    <label>Minimum zrobione?</label>
    <div class="row keep" style="gap:8px">
      <button class="${ev.ok === 1 ? 'pri' : ''}" data-act="evOk" data-v="1">1 – tak</button>
      <button class="${ev.ok === 0 ? 'pri' : ''}" data-act="evOk" data-v="0">0 – nie</button>
    </div>
    <label>Kosz – 2 zdania</label>
    <textarea data-chg="ev" data-f="kosz">${esc(ev.kosz)}</textarea>
    <label>Biznes – 2 zdania</label>
    <textarea data-chg="ev" data-f="biznes">${esc(ev.biznes)}</textarea>
    <label>Co ukradło czas</label>
    <input data-chg="ev" data-f="czas" value="${esc(ev.czas)}">
  </div>
  <div class="sec"><h2>🎯 Cele na jutro</h2><small>${fmtDate(tom)}</small></div>
  ${goalsCard(tom)}`;
}

// === EKRAN: TYDZIEŃ ===
function screenTydzien() {
  const mon = state.week, today = todayISO();
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i));
  const sum = weekSummary(mon);
  const cols = days.map(s => {
    const bl = blocksFor(s);
    return `<div class="col">
      <div class="colh ${s === today ? 'on' : ''}">${DNI[dow(s)]} ${shortDate(s)}</div>
      ${bl.map(b => `<div class="cblk ${b.done ? 'done' : ''}" style="border-left-color:${areaColor(b.area)}" data-act="blockToggle" data-s="${s}" data-k="${b.kind}" data-id="${b.id}" role="button" aria-pressed="${b.done ? 'true' : 'false'}">
        <div class="ctop"><span class="tm">${tm(b)}</span><button class="cedit" data-act="blockOpen" data-s="${s}" data-k="${b.kind}" data-id="${b.id}" aria-label="edytuj blok">✎</button></div>
        <div class="cname">${b.done ? '✔ ' : ''}${esc(b.name)}</div>
        <div class="cstate">${b.done ? 'wykonane · dotknij, żeby cofnąć' : 'dotknij, żeby oznaczyć jako zrobione'}</div></div>`).join('') || '<div class="mut" style="text-align:center;padding:10px">—</div>'}
      <button class="full" data-act="extraNew" data-s="${s}" style="margin-top:6px;min-height:40px;font-size:14px">+ dodaj</button>
    </div>`;
  }).join('');
  const tpl = [...data.template].sort((a, b) => a.from.localeCompare(b.from));
  return `
  <div class="wk">
    <button class="ic" data-act="weekShift" data-n="-1" aria-label="poprzedni tydzień">‹</button>
    <div style="text-align:center"><div class="big">${shortDate(mon)} – ${shortDate(addDays(mon, 6))}</div>
      ${mon !== mondayOf(today) ? '<button class="link" data-act="weekToday">↩ ten tydzień</button>' : ''}</div>
    <button class="ic" data-act="weekShift" data-n="1" aria-label="następny tydzień">›</button>
  </div>
  <div class="card"><div class="stats">
    <div><div class="big">${sum.p}%</div><div class="mut">wykonanie</div></div>
    <div><div class="big">${sum.ok}/7</div><div class="mut">dni ze streakiem</div></div>
    <div><div class="big">${sum.sess}</div><div class="mut">treningi w tygodniu</div></div>
  </div></div>
  <div class="week-wrap"><div class="week">${cols}</div></div>
  <div class="sec"><h2>Bloki stałe</h2><small>${tpl.length} szt.</small></div>
  <div class="card">${tpl.map(t => `<div class="item" data-act="blockOpen" data-s="${today}" data-k="t" data-id="${t.id}" style="cursor:pointer">
      <div class="grow"><div><b>${tm(t)}</b> · ${esc(t.name)}</div>
      <div class="mut">${t.days.map(i => DNI[i]).join(' ')} · ${areaLabel(t.area)}</div></div><span class="mut">✎</span></div>`).join('') || '<div class="hint">Brak bloków stałych.</div>'}
    <button class="pri full" data-act="tplNew" style="margin-top:12px">+ Dodaj blok stały</button></div>
  <div class="hint">Kliknij blok w kalendarzu, żeby zmienić go tylko na dziś albo na stałe.</div>`;
}
function weekSummary(mon) {
  const days = [0, 1, 2, 3, 4, 5, 6].map(i => addDays(mon, i));
  let tot = 0, dn = 0, ok = 0;
  days.forEach(s => {
    const bl = blocksFor(s);
    tot += bl.length; dn += bl.filter(b => b.done).length;
    if (dayComplete(s)) ok++;
  });
  const sess = data.sessions.filter(x => days.includes(x.date)).length;
  const sleeps = days.map(s => data.days[s] && data.days[s].diet ? sleepH(data.days[s].diet.bed, data.days[s].diet.wake) : null).filter(x => x != null);
  const shots = data.shots.filter(p => days.includes(p.date)).length;
  return { p: tot ? Math.round(dn / tot * 100) : 0, ok, sess, shots,
           sleep: sleeps.length ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1) : '—' };
}
function openExtra(s) {
  openSheet(`<h2>Blok jednorazowy</h2><div class="hint">${fmtDate(s)} · tylko ten dzień</div>
    ${blockFields({ name: '', from: '', to: '', area: 'kosz', done: false, rating: 0, note: '' }, null)}
    <div class="foot"><button class="pri full" data-act="extraAdd" data-s="${s}">Dodaj</button><button class="full" data-act="sheetClose">Anuluj</button></div>`);
}
function openTpl() {
  openSheet(`<h2>Nowy blok stały</h2><div class="hint">Będzie się powtarzał w wybrane dni.</div>
    ${blockFields({ name: '', from: '', to: '', area: 'kosz', done: false, rating: 0, note: '' }, [])}
    <div class="foot"><button class="pri full" data-act="tplAdd">Dodaj do tygodnia</button><button class="full" data-act="sheetClose">Anuluj</button></div>`);
}
function blockFields(b, days) {
  return `<label>Nazwa</label><input name="name" value="${esc(b.name)}">
  <div class="grid2">
    <div><label>Od</label><input type="time" name="from" value="${b.from}"></div>
    <div><label>Do</label><input type="time" name="to" value="${b.to}"></div>
  </div>
  <label>Obszar</label>${areaSelect(b.area)}
  ${days ? `<label>Dni tygodnia (dla bloku stałego)</label>
  <div class="pills">${DNI.map((n, i) => `<label class="pill"><input type="checkbox" name="days" value="${i}" ${days.includes(i) ? 'checked' : ''}> ${n}</label>`).join('')}</div>` : ''}
  <label class="pill" style="margin-top:14px"><input type="checkbox" name="done" ${b.done ? 'checked' : ''}> Zrobione</label>
  <label>Ocena</label>${rateSelect(b.rating)}
  <label>Notatka</label><textarea name="note">${esc(b.note)}</textarea>`;
}
function openBlock(s, k, id) {
  const t = k === 't' ? byId(data.template, id) : null;
  let b;
  if (k === 'x') {
    b = byId(day(s).extra, id);
    if (!b) return;
  } else {
    if (!t) return;
    b = blocksFor(s).find(x => x.id === id) || { name: t.name, from: t.from, to: t.to, area: t.area, done: false, rating: 0, note: '' };
  }
  const ds = `data-s="${s}" data-k="${k}" data-id="${id}"`;
  const scope = t ? `<label>Czego dotyczy zmiana?</label>
    <div class="pills">
      <label class="pill"><input type="radio" name="scope" value="day" checked> tylko ten dzień</label>
      <label class="pill"><input type="radio" name="scope" value="next"> ten i kolejne</label>
      <label class="pill"><input type="radio" name="scope" value="all"> cała seria</label>
    </div>` : '';
  openSheet(`<h2>${k === 'x' ? 'Blok jednorazowy' : 'Blok stały'}</h2>
    <div class="hint">${k === 'x' ? 'Dotyczy tylko tego dnia.' : 'Wybierz zakres zmiany. Pola czasu mogą zostać puste.'}</div>
    ${blockFields(b, t ? t.days : null)}
    ${scope}
    <div class="foot">
      <button class="pri full" data-act="blockSave" ${ds}>Zapisz</button>
      <button class="danger full" data-act="blockDel" ${ds}>${k === 'x' ? 'Usuń' : 'Usuń (wybrany zakres)'}</button>
      <button class="full" data-act="sheetClose">Anuluj</button>
    </div>`);
}


// === EKRAN: KOSZ ===
function screenKosz() {
  const sub = state.sub.kosz;
  const body = {
    pomiary: koszPomiary, drille: koszDrille, hala: koszHala,
    dziennik: koszDziennik, prios: koszPrios, diag: koszDiag
  }[sub]();
  return `<h1 style="margin:6px 0 4px">🏀 Kosz</h1>
  ${tabs('kosz', [['pomiary', 'Pomiary'], ['drille', 'Drille'], ['hala', 'Plan hali'], ['dziennik', 'Dziennik'], ['prios', 'Priorytety'], ['diag', 'Diagnoza']])}
  ${body}`;
}
// === RZUTY: statystyki i wykres dla wybranego dryla i okresu ===
const SHOT_MODES = [['tyd', 'Tydzień'], ['mies', 'Miesiąc'], ['rok', 'Rok'], ['wl', 'Własne'], ['all', 'Wszystko']];
const SHOT_CAT_KEYS = [['front', 'Front rim'], ['back', 'Back rim'], ['swish', 'Swish'], ['nonswish', 'Non-swish'], ['airball', 'Airball']];
function shotP() { state.shotP = state.shotP || { mode: 'mies', n: 2, unit: 'tyg', y: 'made' }; return state.shotP; }
function shotFilter() {
  const p = shotP(), end = todayISO();
  const len = { tyd: 7, mies: 30, rok: 365 }[p.mode] || (Math.max(1, Math.min(730, parseInt(p.n, 10) || 1)) * ({ dni: 1, tyg: 7, mies: 30 }[p.unit] || 1));
  const from = p.mode === 'all' ? '0000-00-00' : addDays(end, -(len - 1));
  const names = [...new Set(data.shots.map(x => x.drill))].sort();
  const sel = state.chartDrill;
  const drill = sel === '__all' ? '' : (sel && names.includes(sel) ? sel : (names[0] || ''));
  const shots = data.shots.filter(x => x.att > 0 && x.date >= from && x.date <= end && (!drill || x.drill === drill))
    .sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts);
  return { p, names, drill, from, end, shots };
}
// Wykres: oś X = oddane rzuty (suma), oś Y = trafione (suma) albo skuteczność (%)
function shotChart(shots, y) {
  if (!shots.length) return '<div class="hint">Brak pomiarów w tym okresie.</div>';
  let ca = 0, cm = 0;
  const pts = shots.map(s => { ca += s.att; cm += s.made; return { x: ca, made: cm, att: ca, s, v: y === 'pct' ? cm / ca * 100 : cm }; });
  const W = 340, H = 250, L = 46, R = 14, T = 18, B = 44;
  const maxX = Math.max(1, ...pts.map(p => p.x));
  const ymax = y === 'pct' ? 100 : Math.max(4, Math.ceil(Math.max(...pts.map(p => p.v)) * 1.15));
  const X = v => L + (v / maxX) * (W - L - R), Y = v => H - B - (v / ymax) * (H - B - T);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const grid = ticks.map(t => { const v = Math.round(ymax * t); return `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="rgba(120,100,90,.22)"/>
    <text x="${L - 6}" y="${Y(v) + 4}" font-size="11" text-anchor="end" fill="#777">${v}${y === 'pct' ? '%' : ''}</text>`; }).join('');
  const xt = [0, 0.5, 1].map(t => { const v = Math.round(maxX * t); return `<text x="${X(v)}" y="${H - B + 16}" font-size="11" text-anchor="middle" fill="#777">${v}</text>`; }).join('');
  const line = pts.length > 1 ? `<polyline points="${pts.map(p => X(p.x).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}" fill="none" stroke="#ff7a1a" stroke-width="3" stroke-linejoin="round"/>` : '';
  const dots = pts.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="5" fill="#ff7a1a" stroke="#fff" stroke-width="2"><title>${p.s.date} · ${p.s.made}/${p.s.att} (${pct(p.s)}%)</title></circle>`).join('');
  const labels = pts.map(p => `<text x="${X(p.x).toFixed(1)}" y="${(Y(p.v) - 9).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="#2a2a2a">${y === 'pct' ? r0(p.v) + '%' : p.made}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="wykres rzutów">
    ${grid}${xt}
    <line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" stroke="#999"/>
    <line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" stroke="#999"/>
    <text x="${(L + W - R) / 2}" y="${H - 6}" font-size="12" text-anchor="middle" fill="#555">oddane rzuty (suma)</text>
    <text x="12" y="${(T + H - B) / 2}" font-size="12" text-anchor="middle" fill="#555" transform="rotate(-90 12 ${(T + H - B) / 2})">${y === 'pct' ? 'skuteczność %' : 'trafione (suma)'}</text>
    ${line}${dots}${labels}</svg>`;
}
function shotStatsCard() {
  const f = shotFilter(), p = f.p, sh = f.shots, n = sh.length;
  const att = sh.reduce((a, x) => a + x.att, 0), made = sh.reduce((a, x) => a + x.made, 0);
  const catN = k => sh.reduce((a, x) => a + ((x.cat && x.cat[k]) || 0), 0);
  const best = n ? sh.reduce((b, x) => (pct(x) > pct(b) ? x : b)) : null;
  const sel = f.drill === '' ? '__all' : f.drill;
  const names = f.names.map(d => `<option value="${esc(d)}" ${d === sel ? 'selected' : ''}>${esc(d)}</option>`).join('');
  const modes = `<div class="pills">${SHOT_MODES.map(([v, l]) => `<button class="${p.mode === v ? 'pri' : ''}" data-act="shotMode" data-v="${v}">${l}</button>`).join('')}</div>`;
  const own = p.mode !== 'wl' ? '' : `<div class="grid2" style="margin-top:8px"><div><label>Ile</label><input type="number" min="1" max="730" value="${p.n}" data-chg="shotP" data-f="n"></div>
    <div><label>Jednostka</label><select data-chg="shotP" data-f="unit">${[['dni', 'dni'], ['tyg', 'tygodni'], ['mies', 'miesięcy']].map(([v, l]) => `<option value="${v}" ${p.unit === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>`;
  const cell = (l, v) => `<div><div class="big" style="font-size:20px">${v}</div><div class="mut" style="font-size:12px">${l}</div></div>`;
  const stats = n ? `<div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:12px">
      ${cell('oddane', att)}${cell('trafione', made)}${cell('skuteczność', att ? Math.round(made / att * 100) + '%' : '—')}
      ${cell('sesje', n)}${cell('najlepsza sesja', best ? pct(best) + '% (' + best.made + '/' + best.att + ')' : '—')}${cell('ostatnia', pct(sh[n - 1]) + '%')}
    </div>
    <div class="mut" style="margin:12px 0 4px">Rodzaje rzutów (ile z oddanych):</div>
    <div class="stats" style="grid-template-columns:repeat(3,1fr)">${SHOT_CAT_KEYS.map(([k, l]) => cell(l, catN(k) + (att ? ' · ' + Math.round(catN(k) / att * 100) + '%' : ''))).join('')}</div>`
    : '<div class="hint" style="margin-top:12px">Brak pomiarów dla tego drilla w wybranym okresie.</div>';
  const yPick = `<select data-chg="shotY" style="margin-top:10px"><option value="made" ${p.y !== 'pct' ? 'selected' : ''}>Y = trafione (suma)</option><option value="pct" ${p.y === 'pct' ? 'selected' : ''}>Y = skuteczność (%)</option></select>`;
  return `<div class="sec"><h2>📊 Statystyki i wykres</h2></div>
  <div class="card">
    <label>Drill</label>
    <select data-chg="chartDrill">${names ? `<option value="__all" ${sel === '__all' ? 'selected' : ''}>wszystkie drille</option>` + names : '<option>brak pomiarów</option>'}</select>
    <div style="margin-top:10px">${modes}${own}</div>
    <div class="mut" style="margin-top:8px">Okres: ${fmtDate(f.from === '0000-00-00' ? (sh[0] ? sh[0].date : f.end) : f.from)} – ${fmtDate(f.end)}</div>
    ${stats}
    ${n ? `<div class="card2" style="margin-top:12px">${yPick}${shotChart(sh, p.y)}
      <div class="hint">Każdy punkt to jeden pomiar. Oś X: ile rzutów oddałeś łącznie, oś Y: ile trafiłeś (albo jaki procent).</div></div>` : ''}
  </div>`;
}
function koszPomiary() {
  const names = data.drills.map(d => d.name);
  const cd = state.chartDrill && names.includes(state.chartDrill) ? state.chartDrill : (names[0] || '');
  const recent = [...data.shots].sort((a, b) => b.ts - a.ts).slice(0, 20);
  const pts = data.shots.filter(x => x.drill === cd && x.att > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts)
    .map(p => ({ l: p.date, v: pct(p) }));
  return `
  <datalist id="drillList">${names.map(d => `<option value="${esc(d)}">`).join('')}</datalist>
  <div class="card" id="shotForm">
    <div class="sec" style="margin:0 0 6px"><h2>Nowy pomiar rzutu</h2></div>
    ${shotFields({ date: todayISO(), drill: cd, made: '', att: '', cat: {}, cue: '', note: '' })}
    <button class="pri full" data-act="shotAdd" style="margin-top:14px">Zapisz pomiar</button>
  </div>
  ${shotStatsCard()}
  <div class="sec"><h2>Ostatnie pomiary</h2><small>kliknij, żeby edytować</small></div>
  <div class="card">
    ${recent.length ? recent.map(p => `<div class="item" data-act="shotEdit" data-id="${p.id}" style="cursor:pointer">
      <div class="grow"><div><b style="font-size:18px">${pct(p)}%</b> · ${p.made}/${p.att} · ${esc(p.drill)}</div>
        <div class="mut">${p.date}${catTxt(p)}${p.cue ? ' · cue: ' + esc(p.cue) : ''}${p.note ? ' · ' + esc(p.note) : ''}</div>
      </div><span class="mut">✎</span></div>`).join('') : '<div class="hint">Brak pomiarów.</div>'}
  </div>`;
}
// === RZUTY: główne kategorie (do wyboru przy pomiarze) + drille rzutowe z zakładki Drille ===
const SHOT_CATS = ['Catch and Shoot 3', 'Catch and Shoot Midrange', 'Off the Dribble 3', 'Off the Dribble Midrange', 'Pull-up 3', 'Pull-up Midrange', 'Step-back 3', 'Fadeaway', 'Floater', 'Hook shot', 'Layup', 'Rzut wolny'];
function shotDrillOpts(cur) {
  const own = data.drills.filter(d => d.block === 'rzut').map(d => d.name).filter(n => !SHOT_CATS.includes(n));
  const grp = (label, list) => list.length ? `<optgroup label="${label}">${list.map(n => `<option value="${esc(n)}" ${n === cur ? 'selected' : ''}>${esc(n)}</option>`).join('')}</optgroup>` : '';
  return `<option value="">— wybierz kategorię —</option>` + grp('Główne kategorie rzutów', SHOT_CATS) + grp('Twoje drille rzutowe', own);
}
// Własny wpis: tylko gdy bieżący drill nie jest na liście
function shotOwn(cur) {
  const known = SHOT_CATS.includes(cur) || data.drills.some(d => d.block === 'rzut' && d.name === cur);
  return known ? '' : (cur || '');
}

// Licznik rodzaju rzutu: [−] [liczba] [+] w jednym rzędzie (liczba rozciąga się, przyciski mają stały rozmiar)
function cntField(key, label, cat) {
  const v = (cat && cat[key]) || 0;
  return `<div><label>${label}</label><div style="display:flex;align-items:center;gap:6px;width:100%">
    <button type="button" data-act="cnt" data-n="-1" aria-label="mniej" style="flex:0 0 44px;width:44px;padding:0">−</button>
    <input type="number" name="cat_${key}" min="0" inputmode="numeric" value="${v}" style="flex:1 1 0;min-width:0;width:100%;text-align:center">
    <button type="button" data-act="cnt" data-n="1" aria-label="więcej" style="flex:0 0 44px;width:44px;padding:0">+</button></div></div>`;
}
const catN = (root, key) => Math.max(0, parseInt(root.querySelector(`[name="cat_${key}"]`).value, 10) || 0);
// Podpis przy pomiarze w liście: tylko niezerowe rodzaje
function catTxt(p) {
  if (!p.cat) return '';
  return Object.entries({ front: 'front rim', back: 'back rim', swish: 'swish', nonswish: 'non-swish', airball: 'airball' })
    .filter(([k]) => p.cat[k]).map(([k, l]) => ` · ${l} ${p.cat[k]}`).join('');
}
function shotFields(p) {
  return `
  <div class="grid2">
    <div><label>Data</label><input type="date" name="date" value="${p.date}"></div>
    <div><label>Drill</label>
      <select name="drillSel" style="width:100%">${shotDrillOpts(p.drill)}</select>
      <input name="drill" value="${esc(shotOwn(p.drill))}" placeholder="albo wpisz własny drill" style="margin-top:6px"></div>
  </div>
  <div class="grid2">
    <div><label>Trafione</label><input type="number" name="made" min="0" inputmode="numeric" value="${p.made ?? ''}"></div>
    <div><label>Oddane</label><input type="number" name="att" min="1" inputmode="numeric" value="${p.att ?? ''}"></div>
  </div>
  <div class="sec" style="margin:14px 0 6px"><h2 style="font-size:15px">Rodzaje rzutów – ile z oddanych</h2></div>
  <div class="grid2">
    ${cntField('front', 'Front rim', p.cat)}
    ${cntField('back', 'Back rim', p.cat)}
    ${cntField('swish', 'Swish', p.cat)}
    ${cntField('nonswish', 'Non-swish (trafione, bez swisha)', p.cat)}
    ${cntField('airball', 'Airball', p.cat)}
  </div>
  <label>Cue (wskazówka), której używasz przy rzucie – nieobowiązkowe</label>
  <input name="cue" value="${esc(p.cue)}" placeholder="np. „łokieć pod piłką”, „dotknij kosza”">
  <div class="hint">Cue to krótka myśl, którą powtarzasz w głowie przy rzucie. Zapisuje się przy pomiarze, żeby wiedzieć, co działało.</div>
  <label>Uwaga</label><input name="note" value="${esc(p.note)}">`;
}
function readShot(root) {
  const q = n => root.querySelector(`[name="${n}"]`);
  return {
    date: q('date').value || todayISO(), drill: q('drill').value.trim() || (q('drillSel').value || ''),
    made: parseInt(q('made').value, 10), att: parseInt(q('att').value, 10),
    cat: { front: catN(root, 'front'), back: catN(root, 'back'), swish: catN(root, 'swish'), nonswish: catN(root, 'nonswish'), airball: catN(root, 'airball') },
    cue: q('cue').value.trim(), note: q('note').value.trim()
  };
}
function checkShot(f) {
  if (!f.drill) { alert('Wpisz albo wybierz dryl.'); return false; }
  if (!(f.att > 0) || isNaN(f.made) || f.made < 0 || f.made > f.att) {
    alert('Sprawdź liczby: oddane > 0, a trafione nie więcej niż oddane.'); return false;
  }
  if (Object.values(f.cat || {}).some(v => v > f.att)) { alert('Żaden rodzaj rzutu nie może być większy niż liczba oddanych rzutów.'); return false; }
  return true;
}
function shotAdd() {
  const f = readShot(document.getElementById('shotForm'));
  if (!checkShot(f)) return;
  if (!data.drills.some(d => d.name === f.drill)) data.drills.push({ id: uid(), name: f.drill, block: '', time: null, reps: '', link: '', works: '', note: '' });
  data.shots.push({ id: uid(), ts: Date.now(), ...f });
  state.chartDrill = f.drill;
  save(); render();
}
function shotEdit(id) {
  const p = byId(data.shots, id);
  if (!p) return;
  openSheet(`<h2>Edytuj pomiar</h2>
    <datalist id="drillList">${data.drills.map(d => `<option value="${esc(d.name)}">`).join('')}</datalist>
    ${shotFields(p)}
    <div class="foot">
      <button class="pri full" data-act="shotSave" data-id="${id}">Zapisz zmiany</button>
      <button class="danger full" data-act="shotDel" data-id="${id}">Usuń pomiar</button>
      <button class="full" data-act="sheetClose">Anuluj</button>
    </div>`);
}
function koszDrille() {
  const bl = state.drillBlock || '';
  return `<div class="row" style="margin-bottom:8px"><select data-chg="drillBlock">
      <option value="">wszystkie bloki</option>${BLOCKS_DRILL.map(b => `<option value="${b}" ${b === bl ? 'selected' : ''}>${b}</option>`).join('')}</select></div>
    ${listCards('drills', {
      add: 'dryl', empty: 'Brak drilli. Dodaj swoje – np. „25 pull-up po 1 koźle”.',
      filter: d => !bl || d.block === bl,
      sort: (a, b) => (a.block || '').localeCompare(b.block || '') || a.name.localeCompare(b.name),
      sum: d => `<div><b>${esc(d.name)}</b> ${d.block ? `<span class="mut">· ${esc(d.block)}</span>` : ''}</div>
        <div class="mut">${d.time ? d.time + ' min · ' : ''}${esc(d.reps)}${d.works ? ' · działa na: ' + esc(d.works) : ''}</div>
        ${d.link ? `<div class="mut">${esc(d.link)}</div>` : ''}`
    })}`;
}
function koszHala() {
  if (data.hala.some(h => !data.template.some(t => t.hallId === h.id))) { data.hala.forEach(syncHall); save(); }
  return listCards('hala', {
    add: 'blok hali', empty: 'Brak bloków hali. Dodaj np. Pn 15:00 – 65 min.',
    sort: (a, b) => a.dow - b.dow || (a.from || '').localeCompare(b.from || ''),
    sum: b => `<div><b>${DNI[b.dow] || '?'} ${esc(b.from || '')}</b> · ${esc(b.name)} <span class="mut">· ${b.min || 0} min</span></div>
      <div class="mut">${esc(b.drills || '')}</div>`,
    extra: b => b.min ? `<button class="soft" data-act="timerStart" data-sec="${b.min * 60}" data-label="${esc(b.name)}">▶ start</button>` : ''
  });
}
function koszDziennik() {
  return listCards('logs', {
    add: 'wpis', empty: 'Brak wpisów. Zapisuj treningi i mecze.',
    sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    sum: l => `<div><b>${esc(l.date)}</b> · ${esc(l.type)} · ${'★'.repeat(l.q || 0)}</div>
      ${l.good ? `<div class="mut">+ ${esc(l.good)}</div>` : ''}${l.improve ? `<div class="mut">− ${esc(l.improve)}</div>` : ''}${l.cue ? `<div class="mut">cue: ${esc(l.cue)}</div>` : ''}`
  });
}
function koszPrios() {
  const list = data.prios || [];
  return `<div class="hint">Maksymalnie 3 priorytety na 90 dni.</div>` + listCards('prios', {
    add: 'priorytet', empty: 'Brak priorytetów. Wpisz najwyżej 3.',
    sum: p => {
      const span = (p.goal ?? 0) - (p.start ?? 0);
      const prog = span ? Math.max(0, Math.min(100, Math.round(((p.current ?? p.start ?? 0) - (p.start ?? 0)) / span * 100))) : 0;
      return `<div><b>${esc(p.name)}</b> ${p.metric ? `<span class="mut">· ${esc(p.metric)}</span>` : ''}</div>
        <div class="mut">start ${p.start ?? '—'} → obecnie ${p.current ?? '—'} → cel ${p.goal ?? '—'}${p.deadline ? ' · do ' + p.deadline : ''}</div>
        <div class="bar"><i style="width:${prog}%"></i></div><div class="mut">${prog}%</div>`;
    }
  }).replace('<button class="pri full"', list.length >= 3 ? '<button class="pri full" disabled style="opacity:.5"' : '<button class="pri full"');
}
function koszDiag() {
  const sk = data.skills;
  const recs = [...data.diag].sort((a, b) => a.date.localeCompare(b.date));
  const a = recs[recs.length - 2], b = recs[recs.length - 1];
  const cmp = b ? `<table class="cmp"><tr><th>Umiejętność</th><th>${a ? shortDate(a.date) : '—'}</th><th>${shortDate(b.date)}</th><th>zmiana</th></tr>
    ${sk.map(s => { const pv = a ? a.s[s.id] : undefined, nv = b.s[s.id]; const dv = (pv != null && nv != null) ? nv - pv : null;
      return `<tr><td>${esc(s.name)}</td><td>${pv ?? '—'}</td><td>${nv ?? '—'}</td><td class="${dv > 0 ? 'good' : dv < 0 ? 'bad' : ''}">${dv == null ? '—' : (dv > 0 ? '+' : '') + dv}</td></tr>`; }).join('')}</table>`
    : '<div class="hint">Zrób pierwszą diagnozę (1–10 przy każdej umiejętności).</div>';
  return `
  <div class="card"><button class="pri full" data-act="diagNew">+ Nowa diagnoza (1–10)</button>
    <div style="margin-top:12px">${cmp}</div></div>
  <div class="sec"><h2>Umiejętności</h2><small>edytuj listę</small></div>
  ${listCards('skills', { add: 'umiejętność', empty: 'Brak umiejętności.', sum: s => `<b>${esc(s.name)}</b>` })}`;
}
function openDiag() {
  openSheet(`<h2>Nowa diagnoza</h2>
    <label>Data</label><input type="date" name="ddate" value="${todayISO()}">
    ${data.skills.map(s => `<div class="item"><span class="grow">${esc(s.name)}</span>
      <input type="number" min="1" max="10" name="s_${s.id}" style="width:90px;flex:0 0 90px" inputmode="numeric"></div>`).join('') || '<div class="hint">Najpierw dodaj umiejętności.</div>'}
    <div class="foot"><button class="pri full" data-act="diagSave">Zapisz diagnozę</button><button class="full" data-act="sheetClose">Anuluj</button></div>`);
}
function diagSave() {
  const root = document.getElementById('sheetBox');
  const s = {};
  data.skills.forEach(sk => {
    const v = parseInt(root.querySelector(`[name="s_${sk.id}"]`).value, 10);
    if (!isNaN(v)) s[sk.id] = Math.max(1, Math.min(10, v));
  });
  if (!Object.keys(s).length) return alert('Wpisz przynajmniej jedną ocenę.');
  data.diag.push({ id: uid(), date: root.querySelector('[name="ddate"]').value || todayISO(), s });
  save(); closeSheet(); render();
}

// === EKRAN: CIAŁO ===
function screenCialo() {
  const sub = state.sub.cialo;
  const body = { trening: cialoTrening, rutyna: cialoRutyna, pomiary: cialoPomiary, zdrowie: cialoZdrowie }[sub]();
  return `<h1>Ciało</h1><div class="sub">Trening, rutyna, pomiary i sygnały zmęczenia</div>
  ${tabs('cialo', [['trening', 'Trening'], ['rutyna', 'Rutyna'], ['pomiary', 'Pomiary'], ['zdrowie', 'Zdrowie']])}
  ${body}`;
}

// Format w edytorze treningu (jedno ćwiczenie w linii):
// Nazwa | 3x8 | tempo | link | odpoczynek w sekundach
function parseEx(text) {
  return (text || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split('|').map(x => x.trim());
    const m = (p[1] || '').match(/(\d+)\s*[x×]\s*(\d+)/i);
    const rest = parseInt((p[4] || '').replace(/\D/g, ''), 10);
    return { name: p[0], sets: m ? +m[1] : 3, reps: m ? +m[2] : 10, tempo: p[2] || '', link: p[3] || '',
             rest: isNaN(rest) ? 90 : rest,
             kg: (p[5] && !isNaN(parseFloat(p[5].replace(',', '.')))) ? parseFloat(p[5].replace(',', '.')) : null };
  });
}
// Ciężar: plan + ostatni wynik z sesji (najcięższa seria z ostatniej sesji z tym ćwiczeniem)
function kgInfo(name) {
  const last = lastEntry(name);
  if (!last) return '';
  const kgs = last.sets.map(x => +x.kg).filter(x => x > 0);
  if (!kgs.length) return '';
  return ` · ostatnio ${Math.max(...kgs)} kg (${shortDate(last.date)})`;
}
// Ostatnie wyniki danego ćwiczenia (najnowsza sesja z tym ćwiczeniem)
function lastEntry(name) {
  for (let i = data.sessions.length - 1; i >= 0; i--) {
    const e = data.sessions[i].entries.find(x => x.name === name);
    if (e) return { date: data.sessions[i].date, sets: e.sets };
  }
  return null;
}
const e1rm = (kg, reps) => kg * (1 + reps / 30);      // wzór Epleya

// === TRENING: wybór treningu, jego ćwiczenia (tabelka + dodawanie), start / dodaj / usuń ===
let exIdx = null; // numer edytowanego ćwiczenia (null = dodajemy nowe)
function exLines(w) { return (w.ex || '').split('\n').map(l => l.trim()).filter(Boolean); }
function exEditor(w) {
  const ex = parseEx(w.ex);
  const cur = exIdx != null ? ex[exIdx] : null;
  const val = (x, d) => (x == null || x === '') ? d : esc(String(x));
  return `<div class="card2" style="margin-top:12px">
    ${ex.map((x, i) => `<div class="item ${exIdx === i ? 'done' : ''}"><div class="grow"><b>${esc(x.name)}</b>
      <div class="mut">${x.sets}×${x.reps}${x.tempo ? ' · tempo ' + esc(x.tempo) : ''} · odpoczynek ${x.rest} s${x.kg != null ? ' · plan ' + x.kg + ' kg' : ''}${kgInfo(x.name)}${x.link ? ' · <a href="' + esc(x.link) + '" target="_blank" rel="noopener">link</a>' : ''}</div></div>
      <button class="soft" data-act="trEdit" data-i="${i}" aria-label="edytuj ćwiczenie">✏️</button>
      <button class="x" data-act="trDel" data-i="${i}" aria-label="usuń ćwiczenie">✕</button></div>`).join('') || '<div class="hint">Ten trening nie ma ćwiczeń. Dodaj pierwsze poniżej.</div>'}
    <div class="card2" style="margin-top:12px">
      <div class="mut" style="margin-bottom:8px">${cur ? 'Edytujesz: ' + esc(cur.name) : 'Dodaj ćwiczenie do: ' + esc(w.name)}</div>
      <label class="mut">Nazwa ćwiczenia</label>
      <input id="ex-name" value="${val(cur && cur.name, '')}" placeholder="np. Wyskok z półobrotem">
      <div class="row keep" style="gap:8px;margin-top:8px">
        <div class="grow"><label class="mut">Serie</label><input id="ex-sets" type="number" min="1" value="${val(cur && cur.sets, 3)}"></div>
        <div class="grow"><label class="mut">Powtórzenia</label><input id="ex-reps" type="number" min="1" value="${val(cur && cur.reps, 10)}"></div>
        <div class="grow"><label class="mut">Odpoczynek (s)</label><input id="ex-rest" type="number" min="0" value="${val(cur && cur.rest, 90)}"></div>
      </div>
      <label class="mut" style="display:block;margin-top:8px">Ciężar (kg, puste = bez ciężaru) – zwiększaj z czasem</label>
      <input id="ex-kg" type="number" min="0" step="0.5" inputmode="decimal" value="${val(cur && cur.kg, '')}">
      <label class="mut" style="display:block;margin-top:8px">Tempo (np. 3-1-1, opcjonalnie)</label>
      <input id="ex-tempo" value="${val(cur && cur.tempo, '')}">
      <label class="mut" style="display:block;margin-top:8px">Link (opcjonalnie)</label>
      <input id="ex-link" value="${val(cur && cur.link, '')}" placeholder="https://…">
      <div class="row keep" style="gap:8px;margin-top:12px">
        <button class="pri grow" data-act="trSave">${cur ? 'Zapisz zmiany' : '+ Dodaj ćwiczenie'}</button>
        ${cur ? '<button class="grow" data-act="trCancel">Anuluj</button>' : ''}
      </div>
    </div>
  </div>`;
}
function cialoTrening() {
  if (data.draft) return sessionView();
  const wk = data.workouts;
  const cur = byId(wk, state.wk) || wk[0];
  return `
  <div class="card" id="trCard">
    <div class="mut">Wybrany trening</div>
    ${wk.length ? `<select data-chg="wkpick" style="margin-top:6px">${wk.map(w => `<option value="${w.id}" ${cur && w.id === cur.id ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select>` : '<div class="hint">Dodaj trening na dole.</div>'}
    ${cur ? exEditor(cur) : ''}
    <button class="pri full" data-act="sessStart" data-id="${cur ? cur.id : ''}" style="margin-top:14px" ${cur ? '' : 'disabled'}>▶ Rozpocznij trening</button>
    <div class="row keep" style="gap:8px;margin-top:8px">
      <button class="grow" data-act="recNew" data-c="workouts">+ Dodaj nowy</button>
      ${cur ? `<button class="grow danger" data-act="recDel" data-c="workouts" data-id="${cur.id}">Usuń</button>` : ''}
    </div>
  </div>
  ${historyCard()}
  ${progressCard()}
  <div class="sec"><h2>Treningi – edycja</h2><small>kliknij „wybierz”, żeby trening był zaznaczony na górze</small></div>
  ${workoutsList()}`;
}
// Widok aktywnego treningu. Ćwiczenia kopiowane są do szkicu (dr.ex), więc można je dowolnie dodawać,
// zmieniać i usuwać w trakcie – nie tylko z gotowego szablonu.
function sessionView() {
  const dr = data.draft;
  dr.ex = dr.ex || [];
  const elapsed = Math.floor((Date.now() - dr.start) / 1000);
  const lib = [...new Set([...data.sessions.flatMap(s => s.entries.map(e => e.name)),
    ...data.workouts.flatMap(w => parseEx(w.ex).map(e => e.name))])].sort();
  return `
  <div class="hero-live">
    <div class="row keep" style="justify-content:space-between;align-items:flex-start">
      <div class="grow"><div class="mut">Trwa trening</div>
        <input value="${esc(dr.name)}" data-chg="draftf" data-f="name" style="font-size:20px;font-weight:800;background:transparent;border-color:transparent;padding:4px 0;min-height:0" aria-label="nazwa treningu"></div>
      <div class="big" id="elapsed" style="font-variant-numeric:tabular-nums;font-size:30px">${fmtT(elapsed)}</div>
    </div>
  </div>
  ${dr.ex.map((e, ei) => {
    const last = lastEntry(e.name);
    const lastTxt = last ? last.sets.filter(s => s.kg != null).map(s => `${s.kg}×${s.reps ?? '?'}`).join(', ') : '';
    return `<div class="card">
      <div class="row keep" style="justify-content:space-between;align-items:flex-start">
        <div class="grow"><div class="exname">${esc(e.name)}</div>
        <div class="mut">cel: ${e.sets}×${e.reps}${e.tempo ? ' · ' + esc(e.tempo) : ''} · odpoczynek ${e.rest} s</div></div>
        <button class="x" data-act="exDel" data-ei="${ei}" aria-label="usuń ćwiczenie">🗑</button>
      </div>
      ${lastTxt ? `<div class="lasttxt">ostatnio (${shortDate(last.date)}): ${esc(lastTxt)}</div>` : '<div class="mut" style="margin-top:6px">pierwszy raz – wpisz wynik</div>'}
      ${e.link ? `<div class="mut">${esc(e.link)}</div>` : ''}
      <div class="setrow" style="margin-top:12px"><span></span><span class="mut" style="font-size:12px">KG</span><span class="mut" style="font-size:12px">POWT.</span><span></span></div>
      ${Array.from({ length: e.sets }, (_, si) => {
        const k = `${ei}-${si}`, v = dr.sets[k] || {};
        const prev = last && last.sets[si] ? last.sets[si] : null;
        return `<div class="setrow ${v.done ? 'donerow' : ''}">
          <span class="snum">${si + 1}</span>
          <input type="number" inputmode="decimal" step="0.5" value="${v.kg ?? ''}" placeholder="${prev && prev.kg != null ? prev.kg : 'kg'}" data-chg="setf" data-k="${k}" data-f="kg">
          <input type="number" inputmode="numeric" value="${v.reps ?? ''}" placeholder="${prev && prev.reps != null ? prev.reps : e.reps}" data-chg="setf" data-k="${k}" data-f="reps">
          <input type="checkbox" ${v.done ? 'checked' : ''} data-chg="setdone" data-k="${k}" data-rest="${e.rest}" data-label="Odpoczynek · ${esc(e.name)}" aria-label="seria zrobiona"></div>`;
      }).join('')}
      <div class="row keep" style="gap:8px;margin-top:10px">
        <button data-act="setAdd" data-ei="${ei}">+ seria</button>
        ${e.sets > 1 ? `<button class="x" data-act="setDel" data-ei="${ei}">− usuń ostatnią</button>` : ''}
      </div>
    </div>`;
  }).join('') || '<div class="hint">Nie ma jeszcze ćwiczeń. Dodaj je poniżej.</div>'}
  <div class="card">
    <div class="exname" style="margin-bottom:4px">+ Dodaj ćwiczenie</div>
    <input id="exNew" list="exlib" placeholder="np. Wyskok z półprzysiadu">
    <datalist id="exlib">${lib.map(n => `<option value="${esc(n)}">`).join('')}</datalist>
    <div class="grid3" style="margin-top:8px">
      <div><label>Serie</label><input id="exSets" type="number" inputmode="numeric" value="3"></div>
      <div><label>Powtórz.</label><input id="exReps" type="number" inputmode="numeric" value="10"></div>
      <div><label>Odpoczynek (s)</label><input id="exRest" type="number" inputmode="numeric" value="90"></div>
    </div>
    <button class="full" data-act="exAdd" style="margin-top:10px">+ dodaj do treningu</button>
  </div>
  <div class="card">
    <label>Jak ciężko (RPE 1–10)</label>
    <select data-chg="draftf" data-f="rpe" data-num="1">${[0, 5, 6, 7, 8, 9, 10].map(x => `<option value="${x}" ${dr.rpe == x ? 'selected' : ''}>${x || '—'}</option>`).join('')}</select>
    <label>Notatka do treningu</label>
    <textarea data-chg="draftf" data-f="notes">${esc(dr.notes)}</textarea>
    <div class="foot">
      <button class="pri full" data-act="sessFinish">✔ Zakończ i zapisz</button>
      <button class="danger full" data-act="sessCancel">Odrzuć trening</button>
    </div>
  </div>`;
}
function historyCard() {
  const recent = [...data.sessions].reverse().slice(0, 10);
  return `<div class="sec"><h2>Historia treningów</h2><small>${data.sessions.length} sesji</small></div>
  <div class="card">${recent.length ? recent.map(s => {
      const sets = s.entries.flatMap(e => e.sets).filter(x => x.kg != null).length;
      return `<div class="item"><div class="grow"><b>${shortDate(s.date)}</b> · ${esc(s.tpl)}
        <div class="mut">${s.duration ?? '—'} min · objętość ${s.volume ?? 0} kg · ${sets} serii${s.rpe ? ' · RPE ' + s.rpe : ''}</div>
        ${s.notes ? `<div class="mut">${esc(s.notes)}</div>` : ''}</div>
        <button class="x" data-act="sessDel" data-id="${s.id}">✕</button></div>`; }).join('')
      : '<div class="hint">Brak zapisanych treningów.</div>'}</div>`;
}
function progressCard() {
  const names = [...new Set(data.sessions.flatMap(s => s.entries.map(e => e.name)))];
  if (!names.length) return '';
  const ex = names.includes(state.exName) ? state.exName : names[0];
  const sorted = [...data.sessions].sort((a, b) => a.date.localeCompare(b.date));
  const pts = sorted.map(s => {
    const e = s.entries.find(x => x.name === ex);
    const vals = e ? e.sets.filter(x => x.kg != null && x.reps).map(x => e1rm(x.kg, x.reps)) : [];
    return vals.length ? { l: shortDate(s.date), v: Math.round(Math.max(...vals) * 10) / 10 } : null;
  }).filter(Boolean);
  const best = pts.length ? Math.max(...pts.map(p => p.v)) : null;
  return `<div class="sec"><h2>📈 Progresja</h2><small>szacowane 1RM</small></div>
    <div class="card"><select data-chg="exPick">${names.map(n => `<option ${n === ex ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
    <div class="card2" style="margin-top:10px">${svgLine(pts)}</div>
    <div class="hint">Szacowane 1RM ze wzoru Epleya: kg × (1 + powt/30). ${best != null ? 'Najlepsze: ' + fmtN(best) + ' kg.' : ''}</div></div>`;
}
function workoutsList() {
  return listCards('workouts', { add: 'trening', extra: w => `<button class="soft" data-act="wkSelect" data-id="${w.id}">✓ wybierz</button>`, sum: w => `<b>${esc(w.name)}</b> <span class="mut">· ${parseEx(w.ex).length} ćw.</span>` });
}
function cialoRutyna() {
  const d = day(state.date);
  const isToday = state.date === todayISO();
  return `<div class="datebar"><button class="ic" data-act="dayShift" data-n="-1">‹</button>
      <div style="text-align:center"><div class="big">Rutyna</div><div class="mut">${fmtDate(state.date)}</div>
      ${isToday ? '' : '<button class="link" data-act="dayToday">↩ dziś</button>'}</div>
      <button class="ic" data-act="dayShift" data-n="1">›</button></div>
    <div class="card">${data.routine.map(r => `<div class="item ${d.routine[r.id] ? 'done' : ''}">
        <input type="checkbox" data-chg="rout" data-id="${r.id}" ${d.routine[r.id] ? 'checked' : ''} aria-label="zrobione">
        <span class="t grow" style="font-size:18px">${esc(r.name)}</span>
        ${r.sec ? `<button data-act="timerStart" data-sec="${r.sec}" data-label="${esc(r.name)}">⏱ ${r.sec}s</button>` : ''}
      </div>`).join('') || '<div class="hint">Brak punktów rutyny.</div>'}</div>
    <div class="sec"><h2>Punkty rutyny – edycja</h2><small>stuknij, żeby zmienić</small></div>
    ${listCards('routine', { add: 'punkt rutyny', sum: r => `<b>${esc(r.name)}</b> <span class="mut">${r.sec ? '· timer ' + r.sec + ' s' : ''}</span>` })}`;
}
function nextPhysDate() {
  const last = [...data.phys].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!last) return { next: todayISO(), days: 0, last: null };
  const next = addDays(last.date, 28);
  return { next, days: daysBetween(todayISO(), next), last: last.date };
}
function cialoPomiary() {
  const m = state.physM || 'vert';
  const pts = [...data.phys].filter(p => p[m] != null).sort((a, b) => a.date.localeCompare(b.date)).map(p => ({ l: p.date, v: p[m] }));
  const np = nextPhysDate();
  return `<div class="card">
      <div class="big">${np.days > 0 ? `Następny pomiar za ${np.days} dni` : '⚠ Czas na pomiar (co 4 tygodnie)'}</div>
      <div class="mut">${np.last ? 'ostatni: ' + np.last : 'Jeszcze nie było pomiaru'} · następny: ${np.next}</div>
    </div>
    <div class="card"><label>Wykres</label>
      <select data-chg="physPick">${PHYS_METRICS.map(([k, l]) => `<option value="${k}" ${k === m ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <div class="card2" style="margin-top:10px">${svgLine(pts)}</div></div>
    ${listCards('phys', { add: 'pomiar fizyczny', sort: (a, b) => b.date.localeCompare(a.date),
      sum: p => `<div><b>${p.date}</b> ${p.bark ? '· bark: ' + esc(p.bark) : ''}</div>
        <div class="mut">${PHYS_METRICS.filter(([k]) => p[k] != null).map(([k, l]) => l.split(' (')[0] + ': ' + p[k]).join(' · ') || '—'}</div>` })}`;
}
function cialoZdrowie() {
  const h = day(state.date).health;
  const isToday = state.date === todayISO();
  return `${healthWarnings().map(w => `<div class="warn">${esc(w)}</div>`).join('')}
    <div class="datebar"><button class="ic" data-act="dayShift" data-n="-1">‹</button>
      <div style="text-align:center"><div class="big">Sygnały</div><div class="mut">${fmtDate(state.date)}</div>
      ${isToday ? '' : '<button class="link" data-act="dayToday">↩ dziś</button>'}</div>
      <button class="ic" data-act="dayShift" data-n="1">›</button></div>
    <div class="card"><div class="grid2">
        <div><label>Sen (h)</label><input type="number" step="0.5" inputmode="decimal" data-chg="dayf" data-sec="health" data-f="sleep" data-num="1" value="${h.sleep ?? ''}"></div>
        <div><label>Zmęczenie 1–5</label><select data-chg="dayf" data-sec="health" data-f="fatigue" data-num="1">${[0, 1, 2, 3, 4, 5].map(n => `<option value="${n}" ${h.fatigue == n ? 'selected' : ''}>${n || '—'}</option>`).join('')}</select></div>
        <div><label>Nastrój 1–5</label><select data-chg="dayf" data-sec="health" data-f="mood" data-num="1">${[0, 1, 2, 3, 4, 5].map(n => `<option value="${n}" ${h.mood == n ? 'selected' : ''}>${n || '—'}</option>`).join('')}</select></div>
        <div><label>Ból – gdzie</label><input data-chg="dayf" data-sec="health" data-f="pain" value="${esc(h.pain)}"></div>
      </div></div>
    <div class="sec"><h2>Kontuzje i ból</h2></div>
    ${listCards('injuries', { add: 'wpis bólu', sort: (a, b) => b.date.localeCompare(a.date),
      sum: i => `<div><b>${esc(i.where)}</b> · ${i.pain ?? '—'}/10 · ${i.date}</div>${i.helped ? `<div class="mut">pomogło: ${esc(i.helped)}</div>` : ''}` })}`;
}
function healthWarnings() {
  const out = [];
  const t = todayISO();
  const last3 = [0, 1, 2].map(i => data.days[addDays(t, -i)] && data.days[addDays(t, -i)].health).reverse();
  if (last3.every(h => h && ((h.fatigue || 0) >= 4 || (h.mood || 9) <= 2))) out.push('3 dni z rzędu źle (zmęczenie ≥4 albo nastrój ≤2). Zmniejsz obciążenie.');
  const shots = data.shots.filter(p => p.att > 0);
  const avg = (from, to) => { const xs = shots.filter(p => p.date >= from && p.date <= to).map(pct); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
  const recent = avg(addDays(t, -13), t), prev = avg(addDays(t, -27), addDays(t, -14));
  if (recent != null && prev != null && prev - recent >= 3) out.push(`% trafień spadł z ${Math.round(prev)}% do ${Math.round(recent)}% w ostatnich 2 tygodniach.`);
  return out;
}

// === EKRAN: DIETA / SEN ===
// Kalkulator (BMR → TDEE → cele), dziennik posiłków z makro, baza produktów, import z AI, waga.
const MEALS = [['sniadanie', 'Śniadanie'], ['obiad', 'Obiad'], ['przekaska', 'Przekąska'], ['kolacja', 'Kolacja'], ['trening', 'Po treningu']];
const ACTIVITY = [[1.2, 'siedzący (mało ruchu)'], [1.375, 'lekko aktywny (1–3 tr./tydz.)'], [1.55, 'umiarkowanie (3–5 tr./tydz.)'],
  [1.725, 'bardzo aktywny (6–7 tr./tydz.)'], [1.9, 'ekstremalnie (2× dziennie)']];
const SURPLUS = [[0, 'utrzymanie'], [200, 'wolny wzrost (+200)'], [300, 'lean bulk (+300)'], [400, 'szybszy wzrost (+400)']];

function latestWeight() {
  const w = [...data.weight].sort((a, b) => a.date.localeCompare(b.date));
  return w.length ? w[w.length - 1].kg : null;
}
// Mifflin-St Jeor → TDEE → kcal celu; białko i tłuszcz w g/kg, węglowodany z reszty kcal
// Zwraca null, dopóki nie uzupełnisz wieku, wzrostu i wagi (nic nie jest zakodowane na sztywno)
function calcTargets() {
  const p = data.profile;
  const w = p.weight || latestWeight();
  if (!w || !p.height || !p.age) return null;
  const bmr = 10 * w + 6.25 * p.height - 5 * p.age + (p.sex === 'm' ? 5 : -161);
  const tdee = bmr * p.activity;
  const kcal = Math.round((tdee + (p.surplus || 0)) / 10) * 10;
  const prot = Math.round(p.protG * w), fat = Math.round(p.fatG * w);
  const carb = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { w, bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, p: prot, c: carb, f: fat };
}
// Cel wody = waga × ml na kg (domyślnie 35 ml/kg; edytowalne w Kalkulatorze). Zwraca litry albo null.
function waterTargetL() {
  const w = data.profile.weight || latestWeight();
  if (!w) return null;
  return Math.round(w * (data.profile.waterMlKg || 35) / 100) / 10;
}
const fmtL = v => (Math.round(v * 100) / 100).toFixed(2).replace('.', ',') + ' l';
// Dane produktów: nazwa, kcal / 100 g, białko, węgle, tłuszcz, waga 1 szt. (g) – wartości orientacyjne
// Domyślna baza z pliku produkty.js (FOOD_BASE). Nowe pozycje z aktualizacji dopisują się same.
const foodFrom = ([name, kcal, p, c, f, piece]) => ({ id: uid(), name, kcal, p, c, f, piece });
const DEFAULT_FOODS = FOOD_BASE.map(foodFrom);

// Szukanie produktu w bazie. Odmiana jest obcinana („ryżu” → „ryż”), a słowa-wypełniacze są pomijane.
const SYN = [[/^sznycl/, 'kotlet schabowy'], [/^kotlecik/, 'kotlet'], [/^frytk/, 'frytki']];
const STOP = new Set(['każdy', 'każda', 'każde', 'po', 'oraz', 'lub', 'około', 'gram', 'gramy', 'gramów', 'sztuki', 'sztuk', 'talerz', 'talerze']);
function queryWords(q) {
  const out = [];
  for (const raw of (q || '').toLowerCase().split(/\s+/)) {
    const w = raw.replace(/[^a-ząćęłńóśźż0-9%]/g, '');
    if (w.length < 3 || STOP.has(w) || /^\d/.test(w)) continue;
    const syn = SYN.find(([re]) => re.test(w));
    if (syn) syn[1].split(' ').forEach(x => out.push(x));
    else out.push(w.slice(0, Math.max(3, w.length - 3))); // odcięcie końcówki: „czerwonego” → „czerwon”
  }
  return out;
}
// Ranking: najpierw liczba pasujących słów, potem czy słowo jest na początku nazwy
function rankFoods(q) {
  const words = queryWords(q);
  if (!words.length) return [];
  return (data.foods || []).map(f => {
    const fn = f.name.toLowerCase();
    let sc = 0, hit = 0;
    for (const w of words) if (fn.includes(w)) { hit++; sc += 10 + (fn.startsWith(w) ? 5 : 0); }
    return { f, sc, hit };
  }).filter(x => x.hit > 0).sort((a, b) => b.hit - a.hit || b.sc - a.sc);
}
// Zwraca produkt TYLKO wtedy, gdy pasują wszystkie znaczące słowa (inaczej null = „nie znam”)
function findFood(q) {
  const n = (q || '').toLowerCase().trim();
  if (!n) return null;
  const exact = (data.foods || []).find(f => f.name.toLowerCase() === n);
  if (exact) return exact;
  const words = queryWords(n);
  const top = rankFoods(n)[0];
  return top && words.length && top.hit === words.length ? top.f : null;
}
// Propozycje dla nieznanego wpisu (nawet jeśli nie wszystkie słowa pasują)
const suggestFoods = (q, n = 3) => rankFoods(q).slice(0, n).map(x => x.f.name);

// Jednostki rozpoznawane w wpisie (odmiany też): g, ml, szt, talerz, miska, szklanka, kubek, kromka, łyżka, kawałek, porcja…
const LET = 'a-ząćęłńóśźż';
const UNIT_SRC = 'litrów|litra|litry|litr|l|dl|decylitr[a-ząćęłńóśźż]*|filiżank[aięi]|filiżanek|butelk[aięi]|butelek|puszk[aięi]|puszek|gramów|gram|gr|g|ml|sztuk[aiy]?|szt|talerz[a-zęó]*|miseczk[aięi]|miska|miski|misek|szklank[aięi]|szklanek|kubk[aięi]|kubek|kromk[aięi]|łyżk[aięą]|łyżeczk[aięą]|kawałk[aięi]|kawałków|plasterk[aięi]|plastr[aey]|porcj[aęi]|kulk[aięi]';
// 1) „200 g kurczaka”, „2 talerze zupy…”, „2 jajka”
const RE_LEAD = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(?:(${UNIT_SRC})(?![${LET}]))?\\.?\\s*(.*)$`, 'i');
// 2) „zupa z buraków 2 talerze”, „pizza salami 2 kawałki” (liczba i jednostka na końcu)
const RE_TRAIL = new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${UNIT_SRC})(?![${LET}])\\.?$`, 'i');
// 3) „łyżka masła orzechowego”, „talerz zupy”
const RE_UNIT_FIRST = new RegExp(`^(${UNIT_SRC})(?![${LET}])\\s+(.+)$`, 'i');
const num = x => parseFloat(String(x).replace(',', '.'));
const lc = x => (x || '').toLowerCase();
// Wzorce „po X g”: „3 sznycle każdy po 80 gram” = 240 g; „3 x 80 g kotlet” = 240 g
const RE_EACH = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(?:szt\\.?\\s*)?(.+?)\\s+(?:każd\\w*\\s+)?po\\s+(\\d+(?:[.,]\\d+)?)\\s*(gramów|gram\\w*|gr|g|ml)(?![${LET}])`, 'i');
const RE_TIMES = new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*[x×]\\s*(\\d+(?:[.,]\\d+)?)\\s*(gramów|gram\\w*|gr|g|ml)(?![${LET}])\\s+(.+)$`, 'i');
function parsePart(part) {
  part = part.replace(/^pół\s+/i, '0.5 ').replace(/^ćwierć\s+/i, '0.25 ');
  let m = part.match(RE_EACH);
  if (m) return { qty: num(m[1]) * num(m[3]), unit: 'g', name: m[2].trim() };
  m = part.match(RE_TIMES);
  if (m) return { qty: num(m[1]) * num(m[2]), unit: 'g', name: m[4].trim() };
  m = part.match(RE_LEAD);
  if (m) return { qty: num(m[1]), unit: lc(m[2]), name: m[3].trim() || part };
  m = part.match(RE_TRAIL);
  if (m) return { qty: num(m[2]), unit: lc(m[3]), name: m[1].trim() };
  m = part.match(RE_UNIT_FIRST);
  if (m) return { qty: 1, unit: lc(m[1]), name: m[2].trim() };
  return { qty: null, unit: '', name: part };
}
// Ile gramów to wpis: np. 2 talerze zupy z buraków = 2 × 300 g
// Dodatkowe składniki (opcjonalne): z wartości na 100 g wylicza wartość dla gramatury k = g / 100
const EXTRA_KEYS = ['fib', 'sug', 'sat', 'salt'];
function extrasOf(src, k) {
  const o = {};
  for (const key of EXTRA_KEYS) {
    const v = src[key];
    if (v != null && v !== '' && !isNaN(+v)) o[key] = Math.round(+v * k * 10) / 10;
  }
  return o;
}
// Jednostki objętości: w dzienniku pokazujemy ml zamiast g (dla napojów 1 ml ≈ 1 g)
const VOL_RE = /^(ml|l|litr|dl|decyl|szklank|szklanek|kubk|kubek|filiżank|butelk|puszk)/;
function gramsFor(food, qty, unit) {
  const piece = food.piece;
  if (!unit) {
    if (qty == null) return piece || 100;
    return piece && qty <= 12 ? qty * piece : qty;   // „2 jajka” = 2 szt.; „150” = 150 g
  }
  const q = qty ?? 1;
  if (/^(g|gr|gram|gramów|ml)$/.test(unit)) return q;
  if (unit === 'l' || unit.startsWith('litr')) return q * 1000;   // 1 l = 1000 ml
  if (unit === 'dl' || unit.startsWith('decyl')) return q * 100;
  if (unit.startsWith('filiżank')) return q * 150;
  if (unit.startsWith('butelk')) return q * (piece || 500);
  if (unit.startsWith('puszk')) return q * (piece || 330);
  if (/^(szt|sztuk)/.test(unit)) return q * (piece || 100);
  if (/^(talerz|miska|misek|miski|miseczk)/.test(unit)) return q * (piece || 300);
  if (/^(szklank|szklanek|kubk|kubek)/.test(unit)) return q * 250;
  if (unit.startsWith('łyżk')) return q * 15;
  if (unit.startsWith('łyżeczk')) return q * 5;
  if (unit.startsWith('kromk')) return q * (piece || 30);
  if (unit.startsWith('kawałk')) return q * (piece || 100);
  if (unit.startsWith('plast')) return q * (piece || 20);
  if (unit.startsWith('porcj')) return q * (piece || 300);
  if (unit.startsWith('kulk')) return q * (piece || 60);
  return q * (piece || 100);
}
function parseMeal(text) {
  return (text || '').split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).map(part => {
    const p = parsePart(part);
    const food = findFood(p.name);
    const vol = VOL_RE.test(lc(p.unit));
    if (!food) { const gu = Math.round(gramsFor({ piece: 100 }, p.qty, p.unit)); return { id: uid(), name: p.name, raw: part, g: gu, vol: vol ? gu : null, kcal: 0, p: 0, c: 0, f: 0, src: '?', sugg: suggestFoods(p.name) }; }
    const g = Math.round(gramsFor(food, p.qty, p.unit));
    const k = g / 100;   // wartości w bazie są na 100 g
    return { id: uid(), name: food.name, raw: part, g, vol: vol ? g : null, kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k, ...extrasOf(food, k), src: 'baza' };
  });
}
const sumMacros = items => items.reduce((a, i) => ({ kcal: a.kcal + i.kcal, p: a.p + i.p, c: a.c + i.c, f: a.f + i.f }), { kcal: 0, p: 0, c: 0, f: 0 });
const dayItems = s => Object.values((data.days[s] && data.days[s].diet && data.days[s].diet.meals) || {}).flat();
const r0 = v => Math.round(v);
const r1 = v => Math.round(v * 10) / 10;

// Wpisuje do pozycji posiłku wartości na 100 g, przeliczone na jej gramaturę
function fillItem(it, name, per, src) {
  const k = it.g / 100;
  Object.assign(it, { name, kcal: per.kcal * k, p: per.p * k, c: per.c * k, f: per.f * k, src }, extrasOf(per, k));
}
function findMealItem(s, m, id) { return ((day(s).diet.meals || {})[m] || []).find(x => x.id === id); }
let NET_RESULTS = [];
// Szukanie w Open Food Facts (darmowa baza, bez klucza). Działa tylko z internetem.
async function netSearch(el) {
  const { s, m, id } = el.dataset;
  const item = findMealItem(s, m, id);
  if (!item) return;
  openSheet(`<h2>Szukam w internecie…</h2><div class="hint">„${esc(item.name)}” – baza Open Food Facts (darmowa, bez konta i klucza).</div>`);
  try {
    const url = 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments&search_terms=' + encodeURIComponent(item.name);
    const r = await fetch(url);
    const j = await r.json();
    NET_RESULTS = (j.products || []).filter(p => p.product_name && p.nutriments && p.nutriments['energy-kcal_100g'] != null).slice(0, 6);
    if (!NET_RESULTS.length) {
      return openSheet(`<h2>Nic nie znalazłem</h2><div class="hint">Spróbuj prostszej nazwy (np. „twaróg”) albo dodaj produkt ręcznie.</div>
        <div class="foot"><button class="full" data-act="sheetClose">Zamknij</button></div>`);
    }
    openSheet(`<h2>Wyniki z internetu</h2><div class="hint">Wartości na 100 g. Wybierz produkt – pozycja przeliczy się na ${item.g} g.</div>` +
      NET_RESULTS.map((p, i) => {
        const n = p.nutriments;
        return `<div class="item"><div class="grow"><b>${esc(p.product_name)}</b>${p.brands ? ` <span class="mut">${esc(p.brands)}</span>` : ''}
          <div class="mut">${Math.round(n['energy-kcal_100g'])} kcal · B ${r1(n.proteins_100g || 0)} · W ${r1(n.carbohydrates_100g || 0)} · T ${r1(n.fat_100g || 0)}</div></div>
          <button class="pri" data-act="netUse" data-s="${s}" data-m="${m}" data-id="${id}" data-i="${i}">Użyj</button></div>`;
      }).join('') + `<div class="foot"><button class="full" data-act="sheetClose">Anuluj</button></div>`);
  } catch (e) {
    openSheet(`<h2>Nie udało się połączyć</h2><div class="hint">Sprawdź internet i spróbuj ponownie. Możesz też wybrać propozycję z bazy albo dodać produkt ręcznie.</div>
      <div class="foot"><button class="full" data-act="sheetClose">Zamknij</button></div>`);
  }
}
function netUse(el) {
  const { s, m, id, i } = el.dataset;
  const p = NET_RESULTS[+i], it = findMealItem(s, m, id);
  if (!p || !it) return;
  const n = p.nutriments;
  dropRaw(s, m, it.raw);
  fillItem(it, p.product_name, { kcal: n['energy-kcal_100g'], p: n.proteins_100g || 0, c: n.carbohydrates_100g || 0, f: n.fat_100g || 0, fib: n.fiber_100g, sug: n.sugars_100g, sat: n['saturated-fat_100g'], salt: n.salt_100g }, 'web');
  save(); closeSheet(); render();
}

// === STATYSTYKI: okres (dzień / tydzień / miesiąc / rok / własne), dieta i płyny ===
const STAT_MODES = [['dzien', 'Dzień'], ['tyd', 'Tydzień'], ['mies', 'Miesiąc'], ['rok', 'Rok'], ['wl', 'Własne']];
const STAT_UNITS = [['dni', 'dni'], ['tyg', 'tygodni'], ['mies', 'miesięcy']];
const STAT_EX = [['fib', 'Błonnik'], ['sug', 'Cukry'], ['sat', 'Tłuszcz nasycony'], ['salt', 'Sól']];
function statP() { state.statP = state.statP || { mode: 'tyd', n: 2, unit: 'tyg' }; return state.statP; }
// Dni okresu, najnowszy pierwszy; koniec okresu = wybrany dzień
function statDays() {
  const p = statP(), end = state.date || todayISO();
  const fixed = { dzien: 1, tyd: 7, mies: 30, rok: 365 }[p.mode];
  const len = fixed || Math.max(1, Math.min(730, parseInt(p.n, 10) || 1)) * ({ dni: 1, tyg: 7, mies: 30 }[p.unit] || 1);
  return Array.from({ length: len }, (_, i) => addDays(end, -i));
}
// Wiersze dla dni z wpisami (jedzenie + płyny)
function statRows(days) {
  const out = [];
  for (const x of days) {
    const meals = (data.days[x] && data.days[x].diet && data.days[x].diet.meals) || {};
    const food = Object.entries(meals).filter(([k]) => k !== DRINK_ID).flatMap(([, v]) => v || []);
    const drinks = meals[DRINK_ID] || [];
    if (!food.length && !drinks.length) continue;
    const m = sumMacros(food.concat(drinks));
    out.push({ date: x, kcal: m.kcal, p: m.p, c: m.c, f: m.f, ml: fluidMl(drinks), ex: extraTotals(food.concat(drinks)), drinks });
  }
  return out;
}
// Wykres słupkowy (wartości od najstarszego dnia)
function svgBars(vals, labels, unit, color) {
  if (!vals.length) return '<div class="hint">Brak danych do wykresu.</div>';
  const W = 600, H = 160, max = Math.max(1, ...vals), bw = W / vals.length;
  const bars = vals.map((v, i) => { const h = (v / max) * (H - 24);
    return `<rect x="${(i * bw + bw * 0.12).toFixed(1)}" y="${(H - 20 - h).toFixed(1)}" width="${(bw * 0.76).toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="${color}"><title>${labels[i]}: ${r0(v)} ${unit}</title></rect>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="wykres">${bars}
    <text x="2" y="${H - 4}" font-size="13" fill="#888">${labels[0]}</text>
    <text x="${W - 2}" y="${H - 4}" font-size="13" text-anchor="end" fill="#888">${labels[labels.length - 1]}</text></svg>`;
}
function dietaStaty() {
  const p = statP(), days = statDays(), rows = statRows(days), n = rows.length;
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  const avg = k => (n ? sum(k) / n : 0);
  const exN = k => rows.filter(r => r.ex[k] != null).length;
  const exSum = k => rows.reduce((a, r) => a + (r.ex[k] || 0), 0);
  const name = p.mode === 'dzien' ? 'dzień' : p.mode === 'tyd' ? 'tydzień' : p.mode === 'mies' ? 'miesiąc' : p.mode === 'rok' ? 'rok' : `${p.n} ${({ dni: 'dni', tyg: 'tyg.', mies: 'mies.' })[p.unit] || 'dni'}`;
  const period = `${name} · ${fmtDate(days[days.length - 1])} – ${fmtDate(days[0])}`;
  const modes = `<div class="pills">${STAT_MODES.map(([v, l]) => `<button class="${p.mode === v ? 'pri' : ''}" data-act="statSet" data-v="${v}">${l}</button>`).join('')}</div>`;
  const own = p.mode !== 'wl' ? '' : `<div class="grid2" style="margin-top:8px"><div><label>Ile</label><input type="number" min="1" max="730" value="${p.n}" data-chg="statP" data-f="n"></div>
    <div><label>Jednostka</label><select data-chg="statP" data-f="unit">${STAT_UNITS.map(([v, l]) => `<option value="${v}" ${p.unit === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>`;
  const head = `<div class="card">${modes}${own}
    <div class="mut" style="margin-top:10px">Okres: ${period}</div>
    <div class="mut">Dni z wpisami: <b>${n}</b> z ${days.length}. Średnie liczę tylko z dni, które mają wpisy.</div></div>`;
  if (!n) return head + '<div class="card hint">Brak wpisów w tym okresie. Dodaj posiłki i płyny w zakładce Dziś.</div>';
  const fmt = (v, u) => `${r1(v)} ${u}`;
  const tbl = `<style>.stbl{width:100%;border-collapse:collapse;font-size:14px}.stbl th,.stbl td{padding:7px 4px;border-bottom:1px solid rgba(0,0,0,.08);text-align:right}.stbl th:first-child,.stbl td:first-child{text-align:left}</style>`;
  const macroRows = [
    ['Kalorie', `${r0(sum('kcal'))} kcal`, `${r0(avg('kcal'))} kcal`],
    ['Białko', fmt(sum('p'), 'g'), fmt(avg('p'), 'g')],
    ['Węglowodany', fmt(sum('c'), 'g'), fmt(avg('c'), 'g')],
    ['Tłuszcz', fmt(sum('f'), 'g'), fmt(avg('f'), 'g')],
    ['Płyny', `${r0(sum('ml'))} ml`, `${r0(avg('ml'))} ml`],
    ...STAT_EX.map(([k, l]) => [l, exN(k) ? fmt(exSum(k), 'g') : 'brak danych', exN(k) ? `${fmt(exSum(k) / exN(k), 'g')} (z ${exN(k)} dni)` : '—'])
  ];
  const table = `<div class="card"><div class="mut" style="margin-bottom:6px">Składniki w okresie</div>${tbl}
    <table class="stbl"><tr><th>Składnik</th><th>Razem</th><th>Średnio / dzień</th></tr>
    ${macroRows.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`).join('')}</table></div>`;
  const chrono = rows.slice().reverse(), labs = chrono.map(r => r.date.slice(5));
  const charts = `<div class="card"><div class="mut">Kalorie każdego dnia</div>${svgBars(chrono.map(r => r.kcal), labs, 'kcal', '#ff9f1c')}</div>
    <div class="card"><div class="mut">Płyny każdego dnia (ml)</div>${svgBars(chrono.map(r => r.ml), labs, 'ml', '#4da3ff')}</div>`;
  const drinkMap = {};
  rows.forEach(r => r.drinks.forEach(d => { const e = drinkMap[d.name] || (drinkMap[d.name] = { ml: 0, n: 0 }); e.ml += d.vol != null ? d.vol : d.g; e.n++; }));
  const drinkList = Object.entries(drinkMap).sort((a, b) => b[1].ml - a[1].ml);
  const drinks = `<div class="card"><div class="mut" style="margin-bottom:6px">Napoje w okresie</div>${tbl}
    ${drinkList.length ? `<table class="stbl"><tr><th>Napój</th><th>Ile razy</th><th>Łącznie</th></tr>
      ${drinkList.map(([k, e]) => `<tr><td>${esc(k)}</td><td>${e.n}</td><td>${r0(e.ml)} ml</td></tr>`).join('')}</table>` : '<div class="hint">Brak płynów w tym okresie.</div>'}</div>`;
  const daily = `<div class="card"><div class="mut" style="margin-bottom:6px">Dzień po dniu (najnowszy na górze)</div>${tbl}
    <table class="stbl"><tr><th>Dzień</th><th>kcal</th><th>B</th><th>W</th><th>T</th><th>ml</th></tr>
    ${rows.map(r => `<tr><td>${r.date.slice(5)}</td><td>${r0(r.kcal)}</td><td>${r1(r.p)}</td><td>${r1(r.c)}</td><td>${r1(r.f)}</td><td>${r0(r.ml)}</td></tr>`).join('')}</table></div>`;
  return head + table + charts + drinks + daily;
}

function screenDieta() {
  const sub = state.sub.dieta;
  const body = { dzis: dietaDzis, kalk: dietaKalk, baza: dietaBaza, waga: dietaWaga, staty: dietaStaty }[sub]();
  return `<h1>Dieta / Sen</h1><div class="sub">Posiłki, makro i cele</div>
  ${tabs('dieta', [['dzis', 'Dziś'], ['kalk', 'Kalkulator'], ['baza', 'Produkty'], ['staty', 'Statystyki'], ['waga', 'Waga']])}${body}`;
}
function macroBar(label, val, target, unit, cls) {
  const p = target ? Math.min(100, Math.round(val / target * 100)) : 0;
  const left = target ? Math.round(target - val) : 0;
  return `<div style="margin:12px 0 4px"><div class="row keep" style="justify-content:space-between"><span><b>${label}</b></span>
    <span class="mut">${r0(val)} / ${target} ${unit}${left >= 0 ? ' · zostało ' + left : ' · +' + (-left)}</span></div>
    <div class="bar"><i style="width:${p}%;background:${cls}"></i></div></div>`;
}
function dietaDzis() {
  const s = state.date, d = day(s), di = d.diet, isToday = s === todayISO();
  const t = calcTargets() || { kcal: 0, p: 0, c: 0, f: 0 };
  const noCalc = !calcTargets();
  const tot = sumMacros(dayItems(s));
  const sl = sleepH(di.bed, di.wake);
  const water = di.waterL || 0;
  const wTarget = waterTargetL();
  // średnia z ostatnich 7 dni z danymi
  return `<div class="datebar"><button class="ic" data-act="dayShift" data-n="-1">‹</button>
      <div style="text-align:center"><div class="big">${fmtDate(s)}</div>${isToday ? '<div class="mut">dziś</div>' : '<button class="link" data-act="dayToday">↩ dziś</button>'}</div>
      <button class="ic" data-act="dayShift" data-n="1">›</button></div>

    ${noCalc ? '<div class="warn">Uzupełnij wiek, wzrost i wagę w zakładce Kalkulator – wtedy pokażę cele.</div>' : ''}
    <div class="card">
      <div class="row keep" style="justify-content:space-between;align-items:flex-end">
        <div><div class="mut">Zjedzone</div><div class="streak" style="font-size:40px">${r0(tot.kcal)} <span style="font-size:18px;color:var(--mut)">kcal</span></div></div>
        <div style="text-align:right"><div class="mut">Cel</div><div class="big">${t.kcal} kcal</div></div>
      </div>
      ${macroBar('Białko', tot.p, t.p, 'g', 'linear-gradient(90deg,#4da3ff,#8ec5ff)')}
      ${macroBar('Węglowodany', tot.c, t.c, 'g', 'linear-gradient(90deg,#ffb347,#ffd98a)')}
      ${macroBar('Tłuszcz', tot.f, t.f, 'g', 'linear-gradient(90deg,#ff7a1a,#ff5a5a)')}
      <div class="hint">Cele wyliczone w zakładce Kalkulator. Węglowodany i tłuszcz liczą się z kcal.</div>
    </div>

    ${extrasCard(s)}
    <div class="sec"><h2>Posiłki</h2><small>wpisz co i ile – liczę sam</small></div>
    ${dayMeals(s).map(x => mealCard(s, x.id, x.name)).join('')}
    <div class="card">
      <div class="grid2">
        <div><label>Rodzaj posiłku</label><select id="mealPreset">${MEAL_PRESETS.map(x => `<option>${x}</option>`).join('')}</select></div>
        <div><label>Albo własna nazwa (ma pierwszeństwo)</label><input id="mealNewName" placeholder="np. Kolacja 2"></div>
      </div>
      <button class="pri full" data-act="mealNew" style="margin-top:10px">+ Dodaj posiłek</button>
    </div>
    ${drinkCard(s)}

    <div class="sec"><h2>Dzień</h2></div>
    <div class="card">
      <div class="pills">
        <label class="pill ${di.creatine ? 'on' : ''}"><input type="checkbox" data-chg="dayf" data-sec="diet" data-f="creatine" ${di.creatine ? 'checked' : ''}> Kreatyna</label>
        <label class="pill ${di.shake ? 'on' : ''}"><input type="checkbox" data-chg="dayf" data-sec="diet" data-f="shake" ${di.shake ? 'checked' : ''}> Shake rano</label>
      </div>
      <div class="grid2" style="margin-top:8px">
        <div><label>Położyłem się</label><input type="time" data-chg="dayf" data-sec="diet" data-f="bed" value="${di.bed || ''}"></div>
        <div><label>Wstałem</label><input type="time" data-chg="dayf" data-sec="diet" data-f="wake" value="${di.wake || ''}"></div>
      </div>
      <div class="big" style="margin-top:10px">Sen: ${sl != null ? sl + ' h' : '—'}</div>
      <label>Jak zjadłem dzień (1–5)</label>
      <select data-chg="dayf" data-sec="diet" data-f="rate" data-num="1">${[0, 1, 2, 3, 4, 5].map(n => `<option value="${n}" ${di.rate == n ? 'selected' : ''}>${n || '—'}</option>`).join('')}</select>
      <label>Uwaga</label><textarea data-chg="dayf" data-sec="diet" data-f="note">${esc(di.note)}</textarea>
    </div>
    <div class="hint" style="margin-top:8px">Średnie i sumy kcal, makro, płynów i składników: zakładka Dieta → Statystyki.</div>`;
}
// === POSIŁKI DNIA: dowolne (dodajesz, nazywasz, usuwasz). Stare dni z wpisami pokazują swoje dawne nazwy ===
const DRINK_ID = 'plyny';
const MEAL_PRESETS = ['Śniadanie', 'Drugie śniadanie', 'Obiad', 'Podwieczorek', 'Kolacja', 'Przekąska', 'Przed treningiem', 'Po treningu', 'Przekąska wieczorna'];
function dayMeals(s) {
  const d = day(s);
  if (d.diet.mealList) return d.diet.mealList;
  // stare dni bez własnej listy: pokaż dawne posiłki, które mają wpisy (lista nie jest zapisywana)
  const meals = d.diet.meals || {}, texts = d.diet.mealText || {};
  return MEALS.filter(([id]) => (meals[id] || []).length || texts[id]).map(([id, name]) => ({ id, name }));
}
// Płyny: objętość w ml (dla jednostek objętości i nieznanych napojów liczona z ilości)
const fluidMl = items => items.reduce((a, i) => a + (i.vol != null ? i.vol : i.g), 0);
function mealCard(s, id, label, drink) {
  const items = ((day(s).diet.meals || {})[id]) || [];
  const txt = (day(s).diet.mealText || {})[id] || '';
  const m = sumMacros(items);
  const unknown = items.filter(i => i.src === '?');
  const ml = fluidMl(items), t = waterTargetL();
  const head = drink
    ? `<div class="big" style="font-size:18px">${label}</div>
       <div class="mut">${fmtL(ml / 1000)}${t != null ? ' / ' + fmtL(t) : ''}</div>`
    : `<input class="big" value="${esc(label)}" data-chg="mealRename" data-s="${s}" data-m="${id}" aria-label="nazwa posiłku"
         style="font-size:18px;font-weight:800;background:transparent;border-color:transparent;padding:4px 0;min-height:0;flex:1">
       <div class="mut">${r0(m.kcal)} kcal · B ${r1(m.p)} · W ${r1(m.c)} · T ${r1(m.f)}</div>`;
  const bar = drink
    ? (t ? `<div class="bar"><i style="width:${Math.min(100, Math.round(ml / (t * 1000) * 100))}%;background:linear-gradient(90deg,#4da3ff,#8ec5ff)"></i></div>`
         : '<div class="hint">Wpisz wagę w Kalkulatorze, a policzę cel płynów.</div>')
    : '';
  return `<div class="card">
    <div class="row keep" style="justify-content:space-between;align-items:baseline;gap:8px">${head}</div>
    ${bar}
    ${items.map(it => `<div class="item">
        <div class="grow"><div><b>${esc(it.name)}</b> <span class="mut">${it.vol ? it.vol + ' ml' : it.g + ' g'}</span>${it.src === '?' ? ' <span class="bad">brak w bazie</span>' : it.src === 'ai' ? ' <span class="mut">· AI</span>' : ''}</div>
        <div class="mut">${r0(it.kcal)} kcal · B ${r1(it.p)} · W ${r1(it.c)} · T ${r1(it.f)}</div></div>
        <button class="x" data-act="mealDel" data-s="${s}" data-m="${id}" data-id="${it.id}" aria-label="usuń">✕</button></div>`).join('')
      || `<div class="hint">${drink ? 'Nic jeszcze. Wpisz poniżej, co wypiłeś.' : 'Nic jeszcze. Wpisz poniżej, co zjadłeś.'}</div>`}
    ${unknown.map(u => `<div class="warn">Nie znam: <b>${esc(u.name)}</b> (${u.vol ? u.vol + ' ml' : u.g + ' g'})${drink ? ' – objętość liczę, kalorie 0 do uzupełnienia' : ''}
      ${u.sugg && u.sugg.length ? `<div class="mut" style="margin-top:6px">Czy chodziło o:</div>
      <div class="pills">${u.sugg.map(n => `<button data-act="mealPick" data-s="${s}" data-m="${id}" data-id="${u.id}" data-food="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
      <div class="row keep" style="gap:8px;margin-top:10px;flex-wrap:wrap">
        <button data-act="netSearch" data-s="${s}" data-m="${id}" data-id="${u.id}">🌐 Szukaj w internecie</button>
        <button data-act="aiItem" data-s="${s}" data-m="${id}" data-id="${u.id}" data-raw="${esc(u.raw)}">✨ Dodaj z AI</button>
        <button data-act="foodFromUnknown" data-name="${esc(u.name)}">+ dodaj do bazy</button>
        <button data-act="mealRecalc" data-s="${s}" data-m="${id}">↻ przelicz</button></div></div>`).join('')}
    ${drink ? drinkForm(s, id) : mealForm(s, id, txt)}
  </div>`;
}
// Posiłek: wpisujesz tekstem „co i ile” naraz
function mealForm(s, id, txt) {
  return `<label>Co i ile zjadłem</label>
    <textarea id="mt-${s}-${id}" data-s="${s}" data-m="${id}" placeholder="np. 200 g kurczaka, 100 g ryżu, 2 jajka, 1 banan">${esc(txt)}</textarea>
    <div id="sg-${s}-${id}"></div>
    <div class="row keep" style="gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="pri" data-act="mealAdd" data-s="${s}" data-m="${id}">Oblicz i dodaj</button>
      <button data-act="aiOpen" data-s="${s}" data-m="${id}">🤖 Przez AI</button>
      <button class="danger" data-act="mealRemove" data-s="${s}" data-m="${id}">Usuń posiłek</button>
    </div>`;
}
// Płyn: jeden wpis naraz – nazwa, ilość, jednostka (dopisujesz w ciągu dnia)
function drinkForm(s, id) {
  const units = [['ml', 'ml'], ['l', 'litry'], ['szklanka', 'szklanka (250 ml)'], ['kubek', 'kubek (250 ml)'], ['butelka', 'butelka'], ['puszka', 'puszka']];
  return `<label>Co wypiłem</label>
    <input id="dk-name" data-s="${s}" data-m="${id}" placeholder="np. Muszynianka, herbata, woda" autocomplete="off">
    <div id="sg-${s}-${id}"></div>
    <div class="grid2" style="margin-top:8px">
      <div><label>Ile</label><input id="dk-qty" type="number" min="0" step="0.1" value="250"></div>
      <div><label>Jednostka</label><select id="dk-unit">${units.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></div>
    </div>
    <button class="pri full" data-act="drinkAdd" data-s="${s}" data-m="${id}" style="margin-top:10px">+ Dodaj płyn</button>`;
}
function drinkCard(s) { return mealCard(s, DRINK_ID, 'Płyny', true); }
// Pomocnicze: rozbicie pola na pozycje, usunięcie rozwiązanej pozycji z pola
function splitParts(text) { return (text || '').split(/[,;\n]+/).map(x => x.trim()).filter(Boolean); }
function dropRaw(s, m, raw) {
  if (!raw) return;
  const d = day(s);
  d.diet.mealText = d.diet.mealText || {};
  d.diet.mealText[m] = splitParts(d.diet.mealText[m]).filter(p => p !== String(raw).trim()).join(', ');
}
// Dodaj: znane pozycje idą do posiłku, nieznane zostają w polu (i na liście „Nie znam”)
function mealAdd(el) {
  const { s, m } = el.dataset;
  const parts = splitParts(document.getElementById(`mt-${s}-${m}`).value);
  if (!parts.length) return alert('Wpisz, co zjadłeś, np. „200 g kurczaka, 100 g ryżu”.');
  const d = day(s);
  d.diet.meals = d.diet.meals || {};
  const drink = m === DRINK_ID;   // płyny: nieznany napój zostaje w dzienniku i w sumie
  const list = (d.diet.meals[m] || []).filter(x => drink || x.src !== '?');   // w posiłkach poprzednie nieznane zastępujemy aktualnymi
  const keep = [];
  for (const part of parts) {
    const it = parseMeal(part)[0];
    if (it.src === '?' && !drink) keep.push(part);
    list.push(it);
  }
  d.diet.meals[m] = list;
  d.diet.mealText = d.diet.mealText || {};
  d.diet.mealText[m] = keep.join(', ');
  save(); render();
}
function mealRecalc(el) {
  const { s, m } = el.dataset;
  const items = (day(s).diet.meals || {})[m] || [];
  items.forEach((it, i) => {
    if (it.src !== '?') return;
    const n = parseMeal(it.raw)[0];
    if (n && n.src === 'baza') { items[i] = { ...n, id: it.id }; dropRaw(s, m, it.raw); }
  });
  save(); render();
}
// Dodanie produktu do bazy z nieznanego wpisu
function foodFromUnknown(el) { openRec('foods', null, { name: el.dataset.name }); }

// Import z AI: JSON [{name, grams, kcal, protein, carbs, fat}]
function aiPrompt(text) {
  return `Jesteś dietetykiem sportowym. Podaj wartości odżywcze dla tego posiłku: ${text}
Zwróć WYŁĄCZNIE tablicę JSON bez komentarza, w formie:
[{\"name\":\"nazwa produktu\",\"grams\":liczba_gramów,\"kcal\":liczba,\"protein\":liczba_g,\"carbs\":liczba_g,\"fat\":liczba_g,\"fiber\":liczba_g,\"sugar\":liczba_g,\"satfat\":liczba_g,\"salt\":liczba_g}]
Wartości mają dotyczyć podanej gramatury (dla każdego produktu osobno).`;
}
function aiOpen(el) {
  const { s, m } = el.dataset;
  const text = document.getElementById(`mt-${s}-${m}`).value.trim();
  if (!text) return alert('Najpierw wpisz w polu, co zjadłeś.');
  aiSheet(text, s, m, '', '');
}
// Dodaj z AI dla jednej nieznanej pozycji (po zaimportowaniu zastępuje ją)
function aiItem(el) {
  const { s, m, id, raw } = el.dataset;
  aiSheet(raw, s, m, id, raw);
}
function aiSheet(text, s, m, pid, raw) {
  openSheet(`<h2>Policz przez AI</h2>
    <div class="hint">Apka nie ma połączenia z AI, więc robimy to w dwóch krokach:<br>1) skopiuj prompt i wklej w dowolny czat AI (np. ChatGPT, Gemini, Claude),<br>2) wklej odpowiedź JSON poniżej.</div>
    <label>Prompt</label><textarea id="aiPromptTxt" rows="7" readonly>${esc(aiPrompt(text))}</textarea>
    <button class="full" data-act="aiCopy" style="margin-top:8px">📋 Kopiuj prompt</button>
    <label>Odpowiedź AI (JSON)</label><textarea id="aiJson" rows="6" placeholder='[{"name":"...","grams":200,"kcal":330,"protein":46,"carbs":0,"fat":4}]'></textarea>
    <div class="foot"><button class="pri full" data-act="aiImport" data-s="${s}" data-m="${m}" data-pid="${pid}" data-raw="${esc(raw)}">Dodaj do posiłku</button>
      <button class="full" data-act="sheetClose">Anuluj</button></div>`);
}
function aiCopy() {
  const t = document.getElementById('aiPromptTxt');
  t.select();
  const done = () => alert('Skopiowano prompt. Wklej go w czacie AI.');
  if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(done, () => { document.execCommand('copy'); done(); });
  else { document.execCommand('copy'); done(); }
}
function aiImport(el) {
  const { s, m, pid, raw } = el.dataset;
  let arr;
  try {
    const txt = document.getElementById('aiJson').value.trim();
    arr = JSON.parse(txt.slice(txt.indexOf('['), txt.lastIndexOf(']') + 1));
    if (!Array.isArray(arr) || !arr.length) throw new Error('pusta lista');
  } catch (e) { return alert('Nie mogę odczytać JSON. Wklej samą tablicę [ … ] z odpowiedzi AI.'); }
  const n = x => Math.max(0, +x || 0);
  const items = arr.map(x => ({ id: uid(), name: String(x.name || 'produkt'), raw: '', g: Math.round(n(x.grams)),
    kcal: n(x.kcal), p: n(x.protein), c: n(x.carbs), f: n(x.fat), fib: n(x.fiber), sug: n(x.sugar), sat: n(x.satfat), salt: n(x.salt), src: 'ai' }));
  const d = day(s);
  d.diet.meals = d.diet.meals || {};
  // pozycja nieznana zostaje zastąpiona wynikiem AI i znika z pola; przy całym polu – pole się czyści
  d.diet.meals[m] = (d.diet.meals[m] || []).filter(x => !(pid && x.id === pid)).concat(items);
  if (pid) dropRaw(s, m, raw);
  else { d.diet.mealText = d.diet.mealText || {}; d.diet.mealText[m] = ''; }
  save(); closeSheet(); render();
}

// Suma dodatkowych składników dnia; brak danych = pozycje bez wartości
function extraTotals(items) {
  const out = { missing: items.filter(i => EXTRA_KEYS.every(k => i[k] == null)).length };
  for (const k of EXTRA_KEYS) {
    const vals = items.map(i => i[k]).filter(v => v != null);
    out[k] = vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  }
  return out;
}
function extrasCard(s) {
  const items = dayItems(s), x = extraTotals(items);
  const row = (label, v, lim) => `<div><div class="big">${v == null ? '—' : r1(v) + ' g'}</div><div class="mut">${label}</div><div class="mut" style="font-size:12px">${lim}</div></div>`;
  return `<div class="card"><div class="mut" style="margin-bottom:8px">Pozostałe składniki (suma z wpisów)</div>
    <div class="stats" style="grid-template-columns:1fr 1fr">
      ${row('Błonnik', x.fib, 'orientacyjnie ≥ 25 g')}
      ${row('Cukry', x.sug, 'orientacyjnie ≤ 50 g')}
      ${row('Tłuszcz nasycony', x.sat, 'orientacyjnie ≤ 20 g')}
      ${row('Sól', x.salt, 'orientacyjnie ≤ 5 g')}
    </div>
    <div class="hint">${x.missing ? `Brak danych dla ${x.missing} z ${items.length} pozycji. Uzupełnij je w edycji produktu, przez „Szukaj w internecie” albo „Dodaj z AI”.` : 'Dane są dla wszystkich pozycji dnia.'}</div></div>`;
}

// Kalkulator
function dietaKalk() {
  const p = data.profile, t = calcTargets() || { bmr: '—', tdee: '—', kcal: '—', p: '—', c: '—', f: '—' };
  return `
  <div class="card">
    <div class="grid2">
      <div><label>Płeć</label><select data-chg="profile" data-f="sex"><option value="m" ${p.sex === 'm' ? 'selected' : ''}>mężczyzna</option><option value="f" ${p.sex === 'f' ? 'selected' : ''}>kobieta</option></select></div>
      <div><label>Wiek (lata)</label><input type="number" data-chg="profile" data-f="age" data-num="1" value="${p.age}"></div>
      <div><label>Wzrost (cm)</label><input type="number" data-chg="profile" data-f="height" data-num="1" value="${p.height}"></div>
      <div><label>Waga (kg, puste = ostatni pomiar)</label><input type="number" step="0.1" data-chg="profile" data-f="weight" data-num="1" value="${p.weight ?? ''}" placeholder="${latestWeight() ?? '—'}"></div>
    </div>
    <label>Aktywność</label>
    <select data-chg="profile" data-f="activity" data-num="1">${ACTIVITY.map(([v, l]) => `<option value="${v}" ${p.activity == v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <label>Cel</label>
    <select data-chg="profile" data-f="surplus" data-num="1">${SURPLUS.map(([v, l]) => `<option value="${v}" ${p.surplus == v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <div class="grid2">
      <div><label>Białko (g/kg)</label><input type="number" step="0.1" data-chg="profile" data-f="protG" data-num="1" value="${p.protG}"></div>
      <div><label>Tłuszcz (g/kg)</label><input type="number" step="0.1" data-chg="profile" data-f="fatG" data-num="1" value="${p.fatG}"></div>
      <div><label>Woda (ml na kg wagi)</label><input type="number" step="1" data-chg="profile" data-f="waterMlKg" data-num="1" value="${p.waterMlKg}"></div>
    </div>
  </div>
  <div class="sec"><h2>Twoje cele dzienne</h2><small>policzone z danych wyżej</small></div>
  <div class="card">
    <div class="stats" style="grid-template-columns:1fr 1fr">
      <div><div class="mut">BMR (spoczynek)</div><div class="big">${t.bmr} ${t.bmr === '—' ? '' : 'kcal'}</div></div>
      <div><div class="mut">TDEE (z aktywnością)</div><div class="big">${t.tdee} ${t.tdee === '—' ? '' : 'kcal'}</div></div>
    </div>
    <div class="card2" style="margin-top:14px;text-align:center">
      <div class="mut">Cel kcal</div><div class="streak" style="font-size:44px">${t.kcal}</div>
      <div class="pills" style="justify-content:center;margin-top:10px">
        <span class="pill">Białko ${t.p} g</span><span class="pill">Węgle ${t.c} g</span><span class="pill">Tłuszcz ${t.f} g</span></div>
    </div>
    ${calcTargets() ? '' : '<div class="warn">Wpisz wiek, wzrost i wagę (albo zrób pomiar wagi), żeby zobaczyć cele.</div>'}
    <div class="hint">Wzór Mifflin-St Jeor (BMR) × aktywność + korekta celu. Białko 2 g/kg i tłuszcz 0,9 g/kg mieszczą się w zakresach 1,6–2,2 i 0,6–1,0 g/kg, a węglowodany to reszta kalorii. Wynik jest orientacyjny: co tydzień patrz na wagę i koryguj cel o ~100–200 kcal.</div>
  </div>`;
}

// Baza produktów (edytowalna)
function dietaBaza() {
  const q = (state.foodQ || '').toLowerCase();
  return `<input placeholder="🔍 szukaj produktu" value="${esc(state.foodQ || '')}" data-chg="foodQ" style="margin-bottom:8px">
  ${listCards('foods', {
    add: 'produkt', empty: 'Brak produktów. Dodaj swoje albo użyj „+ dodaj do bazy” przy nieznanym wpisie.',
    filter: f => !q || f.name.toLowerCase().includes(q),
    sort: (a, b) => a.name.localeCompare(b.name),
    sum: f => `<div><b>${esc(f.name)}</b></div><div class="mut">na 100 g: ${f.kcal} kcal · B ${f.p} · W ${f.c} · T ${f.f}${f.piece ? ' · 1 szt. ≈ ' + f.piece + ' g' : ''}</div>`
  })}`;
}

// Waga
function dietaWaga() {
  const w = [...data.weight].sort((a, b) => a.date.localeCompare(b.date));
  let trend = '';
  if (w.length >= 2) {
    const weeks = Math.max(1, daysBetween(w[0].date, w[w.length - 1].date) / 7);
    const per = (w[w.length - 1].kg - w[0].kg) / weeks;
    trend = `<div class="big ${per >= 0.25 && per <= 0.5 ? 'good' : ''}">${per >= 0 ? '+' : ''}${per.toFixed(2)} kg / tydz.</div>
      <div class="mut">cel lean bulk: +0,25–0,5 kg / tydz.</div>`;
  }
  const last = w[w.length - 1];
  const due = !last || daysBetween(last.date, todayISO()) >= 7;
  return `${due ? '<div class="warn">Dawno nie ważyłeś się – zrób pomiar w tym tygodniu (raz w tygodniu).</div>' : ''}
    <div class="card">${trend || '<div class="hint">Dodaj minimum 2 pomiary, żeby zobaczyć trend.</div>'}
      <div class="card2" style="margin-top:10px">${svgLine(w.map(x => ({ l: x.date, v: x.kg })))}</div></div>
    ${listCards('weight', { add: 'pomiar wagi', sort: (a, b) => b.date.localeCompare(a.date), sum: x => `<b>${x.kg} kg</b> <span class="mut">· ${x.date}</span>` })}`;
}

// === EKRAN: BIZNES ===
function screenBiznes() {
  const sub = state.sub.biznes;
  const body = { pomysly: bizPomysly, dzis: bizDzis, plan: bizPlan, lekcje: bizLekcje, nauka: bizNauka }[sub]();
  return `<h1 style="margin:6px 0 4px">💼 Biznes</h1>
  ${tabs('biznes', [['dzis', 'Dziś'], ['pomysly', 'Pomysły'], ['plan', 'Plan 90 dni'], ['lekcje', 'Lekcje'], ['nauka', 'Nauka']])}${body}`;
}
const ideaSum = i => ['sc_rynek', 'sc_fit', 'sc_latwosc', 'sc_skal', 'sc_jaranie'].reduce((a, k) => a + (i[k] || 0), 0);
function bizPomysly() {
  return listCards('ideas', {
    add: 'pomysł', empty: 'Bank pomysłów jest pusty. Dodaj pierwszy.',
    sort: (a, b) => ideaSum(b) - ideaSum(a),
    sum: i => `<div><b>${esc(i.name)}</b> <span class="good">· ${ideaSum(i)}/25</span></div>
      <div class="mut">${esc({ pomysl: 'pomysł', zbadac: 'do zbadania', testuje: 'testuję', odrzucony: 'odrzucone' }[i.status] || '')}${i.who ? ' · dla: ' + esc(i.who) : ''}</div>`
  });
}
function bizDzis() {
  const b = day(state.date).biz;
  const isToday = state.date === todayISO();
  return `<div class="datebar"><button class="ic" data-act="dayShift" data-n="-1">‹</button>
      <div style="text-align:center"><div class="big">Zadanie dnia</div><div class="mut">${fmtDate(state.date)}</div>
      ${isToday ? '' : '<button class="link" data-act="dayToday">↩ dziś</button>'}</div>
      <button class="ic" data-act="dayShift" data-n="1">›</button></div>
    <div class="card">
      <label>Co dziś robię na biznes (30 min)</label>
      <input data-chg="dayf" data-sec="biz" data-f="task" value="${esc(b.task)}" placeholder="np. rozmowa z 3 osobami o problemie">
      <label class="pill" style="margin-top:12px"><input type="checkbox" data-chg="dayf" data-sec="biz" data-f="done" ${b.done ? 'checked' : ''}> Zrobione</label>
      <button class="pri full" style="margin-top:14px" data-act="timerStart" data-sec="1800" data-label="Biznes 30 min">⏱ Start 30 min</button>
    </div>`;
}
function bizPlan() {
  return listCards('plan90', {
    add: 'krok', empty: 'Brak kroków. Rozpisz plan na 90 dni po tygodniach.',
    sort: (a, b) => (a.week || 0) - (b.week || 0),
    sum: p => `<div class="${p.done ? 'strike' : ''}"><b>Tydz. ${p.week ?? '?'}</b> · ${esc(p.title)}</div>`,
    extra: p => `<input type="checkbox" data-chg="plan90done" data-id="${p.id}" ${p.done ? 'checked' : ''} aria-label="zrobione">`
  });
}
function bizLekcje() {
  return listCards('lessons', { add: 'wpis', empty: 'Brak wpisów. Zapisuj lekcje i porażki.',
    sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    sum: l => `<div><span class="pill" style="padding:2px 10px;font-size:13px">${l.type === 'porazka' ? 'porażka' : 'lekcja'}</span> <span class="mut">${l.date}</span></div><div>${esc(l.text)}</div>` });
}
function bizNauka() {
  return listCards('books', { add: 'pozycja', empty: 'Brak pozycji. Dodaj książkę albo kurs.',
    sum: b => `<div><b>${esc(b.title)}</b> <span class="mut">· ${esc({ do: 'do przeczytania', w: 'w trakcie', ok: 'skończone' }[b.status] || '')}</span></div>
      ${b.action ? `<div class="mut">Akcja: ${esc(b.action)}</div>` : ''}
      ${b.insights ? `<div class="mut" style="white-space:pre-line">${esc(b.insights)}</div>` : ''}` });
}

// === EKRAN: KOMPAS ===
function screenKompas() {
  const T = data.texts;
  const field = (f, label, rows) => `<label>${label}</label><textarea data-chg="txt" data-f="${f}" rows="${rows}">${esc(T[f])}</textarea>`;
  return `
  <h1 style="margin:6px 0 4px">🧭 Kompas</h1>
  <div class="sec"><h2>Kim chcę być</h2><small>zapisuje się samo</small></div>
  <div class="card">
    ${field('vision5', 'Za 5 lat', 3)}
    ${field('vision1', 'Za 1 rok', 3)}
    ${field('goal90', 'Za 90 dni', 3)}
    ${field('why', 'Dlaczego (moje „dlaczego”)', 4)}
    ${field('values', 'Wartości', 2)}
    ${field('rules', 'Zasady', 3)}
    ${field('anti', 'Antywizja – kim NIE chcę być', 3)}
    ${field('coach', '1 zdanie od trenera do mnie', 2)}
    ${field('rule', 'Zasada dnia', 2)}
    ${field('reddish', 'Karta Cam Reddish', 3)}
  </div>
  <div class="sec"><h2>⚡ Arsenał dopalaczy</h2><small>7 miejsc</small></div>
  <div class="card">
    ${T.arsenal.map((a, i) => `<input style="margin-bottom:8px" data-chg="arsenal" data-i="${i}" value="${esc(a)}" placeholder="Dopalacz ${i + 1}">`).join('')}
    <button class="pri full" data-act="dop" style="margin-top:6px">🎲 Losowy dopalacz</button>
    ${state.dop ? `<div class="big" style="margin-top:14px;line-height:1.35">${esc(state.dop)}</div>` : ''}
  </div>
  <div class="sec"><h2>🏆 Wygrane</h2><small>lista rośnie</small></div>
  ${listCards('wins', { add: 'wygraną', sort: (a, b) => (b.date || '').localeCompare(a.date || ''), sum: w => `<div>${esc(w.text)}</div><div class="mut">${w.date}</div>` })}
  <div class="sec"><h2>😨 Strachy</h2></div>
  ${listCards('fears', { add: 'strach', sum: f => `<div>${esc(f.text)}</div>` })}`;
}

// === EKRAN: PRZEGLĄD ===
const REV_F = [
  { k: 'wins', l: '3 wygrane tygodnia', t: 'textarea' },
  { k: 'nope', l: 'Co nie wyszło', t: 'textarea' },
  { k: 'kosz', l: 'Kosz – % i wnioski', t: 'textarea' },
  { k: 'biz', l: 'Biznes', t: 'textarea' },
  { k: 'zdr', l: 'Zdrowie (sen, treningi)', t: 'textarea' },
  { k: 'kasa', l: 'Kasa', t: 'textarea' },
  { k: 'lesson', l: '1 lekcja', t: 'textarea' },
  { k: 'prios', l: '3 priorytety na następny tydzień (każdy w nowej linii)', t: 'textarea' }
];
function screenPrzeglad() {
  const sub = state.sub.przeglad;
  const body = { tydzien: revTydzien, miesiac: revMiesiac, historia: revHistoria }[sub]();
  return `<h1 style="margin:6px 0 4px">📊 Przegląd</h1>
  ${tabs('przeglad', [['tydzien', 'Tydzień'], ['miesiac', 'Miesiąc'], ['historia', 'Historia']])}${body}`;
}
function revTydzien() {
  const mon = mondayOf(state.week);
  const sm = weekSummary(mon);
  const rv = data.reviews[mon] || {};
  return `<div class="card">
      <div class="big">Tydzień ${shortDate(mon)} – ${shortDate(addDays(mon, 6))}</div>
      <div class="stats" style="margin-top:12px">
        <div><div class="big">${sm.p}%</div><div class="mut">wykonanie</div></div>
        <div><div class="big">${sm.ok}/7</div><div class="mut">dni ze streakiem</div></div>
        <div><div class="big">${sm.sess}</div><div class="mut">treningi</div></div>
        <div><div class="big">${sm.shots}</div><div class="mut">pomiary rzutu</div></div>
        <div><div class="big">${sm.sleep}</div><div class="mut">śr. sen (h)</div></div>
      </div>
      <div class="row keep" style="margin-top:12px"><button data-act="weekShift" data-n="-1">‹ poprzedni</button><button data-act="weekToday">ten</button><button data-act="weekShift" data-n="1">następny ›</button></div>
    </div>
    <div class="card" id="revForm">
      ${REV_F.map(f => fieldHTML(f, rv[f.k])).join('')}
      <button class="pri full" data-act="revSave" data-mon="${mon}" style="margin-top:14px">Zapisz przegląd</button>
      ${rv.savedAt ? `<div class="mut" style="margin-top:6px">zapisano: ${esc(rv.savedAt)}</div>` : ''}
    </div>`;
}
function revSave(el) {
  const root = document.getElementById('revForm');
  const o = readFields(REV_F, root);
  o.savedAt = new Date().toLocaleString('pl-PL');
  data.reviews[el.dataset.mon] = o;
  save(); render();
  alert('Przegląd zapisany.');
}
function revMiesiac() {
  const m = state.month || todayISO().slice(0, 7);
  const from = m + '-01', to = addDays(from, 31).slice(0, 7) + '-01';
  const inM = s => s >= from && s < to;
  const dl = Object.keys(data.days).filter(inM).filter(dayComplete).length;
  const tr = data.sessions.filter(x => inM(x.date)).length;
  const sh = data.shots.filter(x => inM(x.date));
  const avgP = sh.length ? Math.round(sh.reduce((a, p) => a + pct(p), 0) / sh.length) : null;
  const diags = data.diag.filter(x => inM(x.date)).sort((a, b) => a.date.localeCompare(b.date));
  const df = diags[0], dl2 = diags[diags.length - 1];
  const phys = data.phys.filter(x => inM(x.date)).sort((a, b) => a.date.localeCompare(b.date));
  const pf = phys[0], pl = phys[phys.length - 1];
  return `<div class="card">
      <label>Miesiąc</label><input type="month" data-chg="monthPick" value="${m}">
      <div class="stats" style="margin-top:12px">
        <div><div class="big">${dl}</div><div class="mut">dni ze streakiem</div></div>
        <div><div class="big">${tr}</div><div class="mut">treningi</div></div>
        <div><div class="big">${avgP != null ? avgP + '%' : '—'}</div><div class="mut">śr. % rzutu</div></div>
      </div>
    </div>
    <div class="sec"><h2>Diagnoza: początek vs koniec</h2></div>
    <div class="card">${df && dl2 && df !== dl2 ? `<table class="cmp"><tr><th>Umiejętność</th><th>${shortDate(df.date)}</th><th>${shortDate(dl2.date)}</th></tr>
      ${data.skills.map(s => `<tr><td>${esc(s.name)}</td><td>${df.s[s.id] ?? '—'}</td><td>${dl2.s[s.id] ?? '—'}</td></tr>`).join('')}</table>`
      : '<div class="hint">Potrzebujesz co najmniej 2 diagnoz w tym miesiącu.</div>'}</div>
    <div class="sec"><h2>Pomiary fizyczne: początek vs koniec</h2></div>
    <div class="card">${pf && pl && pf !== pl ? `<table class="cmp"><tr><th>Test</th><th>${shortDate(pf.date)}</th><th>${shortDate(pl.date)}</th></tr>
      ${PHYS_METRICS.filter(([k]) => pf[k] != null || pl[k] != null).map(([k, l]) => `<tr><td>${esc(l)}</td><td>${pf[k] ?? '—'}</td><td>${pl[k] ?? '—'}</td></tr>`).join('')}</table>`
      : '<div class="hint">Potrzebujesz co najmniej 2 pomiarów fizycznych w tym miesiącu.</div>'}</div>`;
}
function revHistoria() {
  const keys = Object.keys(data.reviews).sort().reverse();
  if (!keys.length) return '<div class="hint">Brak przeglądów. Zrób pierwszy w zakładce „Tydzień”.</div>';
  return keys.map(k => { const r = data.reviews[k]; return `<div class="card" data-act="revOpen" data-mon="${k}" style="cursor:pointer">
      <div class="big">Tydzień od ${shortDate(k)}</div>
      ${r.wins ? `<div class="mut">🏆 ${esc(r.wins).split('\n').join(' · ')}</div>` : ''}
      ${r.lesson ? `<div class="mut">💡 ${esc(r.lesson)}</div>` : ''}</div>`; }).join('');
}

// === EKRAN: USTAWIENIA ===
// === SYNC: konto Firebase + kopia w chmurze. Dane nadal zapisują się lokalnie (localStorage) ===
const SYNC_KEY = 'lifeos.sync';          // meta: { dirty, localTs, syncedTs, uid }
let syncS = { st: 'local', msg: '' };    // local | checking | pending | synced | offline | error | nofb
const SYNC_LABEL = {
  local: 'tylko to urządzenie (zaloguj się, żeby synchronizować)', checking: 'sprawdzam chmurę…',
  pending: 'czekam na wysłanie…', synced: 'zsynchronizowano', offline: 'offline · zmiany czekają w kolejce',
  error: 'błąd synchronizacji', nofb: 'brak Firebase – tryb lokalny'
};
const FB_ERR = {
  'auth/invalid-credential': 'Zły e-mail albo hasło.', 'auth/invalid-email': 'Nieprawidłowy e-mail.',
  'auth/email-already-in-use': 'Ten e-mail ma już konto – zaloguj się.', 'auth/weak-password': 'Hasło musi mieć co najmniej 6 znaków.',
  'auth/network-request-failed': 'Brak internetu.', 'auth/too-many-requests': 'Za dużo prób – odczekaj chwilę.'
};
const syncMeta = () => JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
const setMeta = p => localStorage.setItem(SYNC_KEY, JSON.stringify({ ...syncMeta(), ...p }));
function syncSet(st, msg = '') { syncS = { st, msg }; renderSyncBadge(); }
function renderSyncBadge() {
  const el = document.getElementById('syncBadge');
  if (!el) return;
  el.className = 'sync-' + syncS.st;
  el.innerHTML = `<span class="dot"></span>${SYNC_LABEL[syncS.st] || ''}${syncS.msg ? ' · ' + esc(syncS.msg) : ''}`;
}
// Decyzja po zalogowaniu (czysta funkcja – testowana osobno)
function syncDecision(remoteTs, meta, hasRemote) {
  if (!hasRemote) return 'push';                       // w chmurze pusto → wyślij lokalne
  const seen = meta.syncedTs || 0, dirty = !!meta.dirty;
  const remoteNew = remoteTs > seen;
  if (remoteNew && dirty) return 'conflict';           // obie strony mają zmiany
  if (remoteNew) return 'pull';                        // w chmurze nowsze → pobierz
  if (dirty) return 'push';                            // lokalnie nowsze → wyślij
  return 'none';
}
let pushTimer = null;
function schedulePush() { clearTimeout(pushTimer); pushTimer = setTimeout(pushNow, 700); }
// Wysyłka: jeden dokument users/{uid}/app/data. Zmiany offline zostają oznaczone (dirty) i wyślą się po powrocie sieci.
async function pushNow() {
  const fb = window.FB;
  if (!fb) return syncSet(window.FB_ERROR ? 'nofb' : 'local');
  const u = fb.auth.currentUser;
  if (!u) return syncSet('local');
  if (!navigator.onLine) return syncSet('offline');
  const json = JSON.stringify(data);
  if (json.length > 900000) return syncSet('error', 'dane za duże (ponad 1 MB) – zrób eksport JSON');
  syncSet('pending');
  const ts = Date.now(), snapLocal = syncMeta().localTs || 0;
  try {
    await fb.setDoc(fb.doc(fb.db, 'users', u.uid, 'app', 'data'), { json, updatedAt: ts });
    await shareWrite(json, ts);
    const now = syncMeta();
    if ((now.localTs || 0) === snapLocal) {
      setMeta({ dirty: false, syncedTs: ts, uid: u.uid });
      syncSet('synced');
    } else {                                           // w trakcie wysyłki była nowa zmiana
      setMeta({ syncedTs: ts, uid: u.uid });
      schedulePush();
      syncSet('pending');
    }
  } catch (e) {
    syncSet(navigator.onLine ? 'error' : 'offline', e.code || e.message);
  }
}
// Pobranie z chmury: podmienia dane lokalne
function applyRemote(remote) {
  data = JSON.parse(remote.json);
  localStorage.setItem(KEY, remote.json);
  setMeta({ dirty: false, syncedTs: remote.updatedAt || 0, uid: window.FB.auth.currentUser.uid, localTs: Date.now() });
  syncSet('synced');
  render();
}
async function pullNow(u) {
  const fb = window.FB;
  syncSet('checking');
  try {
    const snap = await fb.getDoc(fb.doc(fb.db, 'users', u.uid, 'app', 'data'));
    const remote = snap.exists() ? snap.data() : null;
    let meta = syncMeta();
    if (meta.uid && meta.uid !== u.uid) meta = { ...meta, syncedTs: 0, dirty: true };   // inne konto na tym urządzeniu
    const act = syncDecision(remote ? remote.updatedAt || 0 : 0, meta, !!remote);
    if (act === 'conflict') {
      const useCloud = confirm('Na tym urządzeniu są zmiany, których nie wysłano, a w chmurze są nowsze dane.\n\nOK = użyj danych z chmury (zmiany z tego urządzenia zostaną zastąpione).\nAnuluj = wyślij dane z tego urządzenia (nadpisze chmurę).');
      return useCloud ? applyRemote(remote) : pushNow();
    }
    if (act === 'pull') return applyRemote(remote);
    setMeta({ uid: u.uid, syncedTs: meta.syncedTs || 0, dirty: !!meta.dirty });
    if (act === 'push') return pushNow();
    syncSet('synced');
  } catch (e) {
    syncSet(navigator.onLine ? 'error' : 'offline', e.code || e.message);
  }
}
function syncInit() {
  if (!window.FB) { syncSet(window.FB_ERROR ? 'nofb' : 'local'); return; }
  window.FB.onUser(u => {
    if (u) { shareLoad(u.uid); bkCloudRefresh(true); pullNow(u); }
    else { shareS = { on: false, key: null }; bkCloud = []; syncSet('local'); render(); }
  });
  window.addEventListener('online', () => { if (syncMeta().dirty && window.FB && window.FB.auth.currentUser) pushNow(); });
  window.addEventListener('offline', () => syncSet('offline'));
}
async function syncAuth(mode) {
  if (!window.FB) return alert('Brak połączenia z Firebase – aplikacja działa lokalnie.');
  const e = document.getElementById('syncEmail').value.trim(), p = document.getElementById('syncPass').value;
  if (!e || !p) return alert('Wpisz e-mail i hasło.');
  try {
    if (mode === 'login') await window.FB.signIn(e, p); else await window.FB.register(e, p);
  } catch (err) {
    alert(FB_ERR[err.code] || ('Nie udało się: ' + (err.code || err.message)));
  }
}
function syncCard() {
  const fb = window.FB, u = fb && fb.auth.currentUser;
  if (!fb) return `<div class="card"><div class="mut">Konto i synchronizacja</div>
    <div class="hint">Brak połączenia z Firebase (konfiguracja albo internet). Dane zapisują się tylko na tym urządzeniu.</div></div>`;
  if (u) return `<div class="card"><div class="mut">Konto i synchronizacja</div>
    <div style="margin:6px 0"><b>${esc(u.email || 'zalogowano')}</b></div>
    <div class="mut">Status: ${esc(SYNC_LABEL[syncS.st] || '')}${syncS.msg ? ' · ' + esc(syncS.msg) : ''}</div>
    <div class="row keep" style="gap:8px;margin-top:10px;flex-wrap:wrap">
      <button data-act="syncNow">↻ Synchronizuj teraz</button>
      <button class="danger" data-act="syncLogout">Wyloguj</button></div>
    <div class="hint">Wylogowanie nie kasuje danych z tego urządzenia.</div></div>`;
  return `<div class="card"><div class="mut">Konto i synchronizacja</div>
    <div class="hint">Zaloguj się tym samym kontem na telefonie i komputerze. Hasło min. 6 znaków.</div>
    <label>E-mail</label><input id="syncEmail" type="email" autocomplete="username">
    <label>Hasło</label><input id="syncPass" type="password" autocomplete="current-password">
    <div class="row keep" style="gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="pri" data-act="syncLogin">Zaloguj</button>
      <button data-act="syncRegister">Załóż konto</button></div></div>`;
}

// === KOPIE ZAPASOWE I COFANIE ===
// Lokalnie: ostatnie 3 kopie w przeglądarce (mały limit). W chmurze: ostatnie 20 (users/{uid}/backups).
// Kopia robi się automatycznie co godzinę przy zmianie, ręcznie i zawsze przed importem/wyczyszczeniem.
// Cofnięcie najpierw zapisuje obecne dane jako kopię, więc też da się je przywrócić.
const BK_KEY = 'lifeos.backups', BK_MAX_LOCAL = 3, BK_MAX_CLOUD = 20, BK_EVERY = 60 * 60 * 1000;
let bkCloud = [];   // kopie z chmury: [{ ts, label, json }] – odświeżane po zalogowaniu
const fmtStamp = ts => new Date(ts).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const bkLocal = () => { try { return JSON.parse(localStorage.getItem(BK_KEY) || '[]'); } catch (e) { return []; } };
function bkMake(label) {
  const json = JSON.stringify(data);
  const list = [{ ts: Date.now(), label, json }, ...bkLocal()].slice(0, BK_MAX_LOCAL);
  try { localStorage.setItem(BK_KEY, JSON.stringify(list)); }
  catch (e) { try { localStorage.setItem(BK_KEY, JSON.stringify(list.slice(0, 1))); } catch (e2) { /* brak miejsca w przeglądarce */ } }
  bkCloudPut(json, label);
}
// Automatyczna kopia – najwyżej raz na godzinę
function bkAuto() {
  const last = bkLocal()[0];
  if (!last || Date.now() - last.ts > BK_EVERY) bkMake('auto');
}
async function bkCloudPut(json, label) {
  const fb = window.FB, u = fb && fb.auth.currentUser;
  if (!u || !navigator.onLine) return;
  try {
    const ts = Date.now();
    await fb.setDoc(fb.doc(fb.db, 'users', u.uid, 'backups', String(ts)), { json, label, ts });
    await bkCloudRefresh(true);
  } catch (e) { /* kopia w chmurze nie wyszła – lokalna zostaje */ }
}
async function bkCloudRefresh(prune) {
  const fb = window.FB, u = fb && fb.auth.currentUser;
  if (!u) { bkCloud = []; return; }
  try {
    const snap = await fb.getDocs(fb.query(fb.collection(fb.db, 'users', u.uid, 'backups'), fb.orderBy('ts', 'desc')));
    const docs = snap.docs.map(d => d.data());
    if (prune && docs.length > BK_MAX_CLOUD) {
      await Promise.all(docs.slice(BK_MAX_CLOUD).map(d => fb.deleteDoc(fb.doc(fb.db, 'users', u.uid, 'backups', String(d.ts)))));
    }
    bkCloud = docs.slice(0, BK_MAX_CLOUD);
  } catch (e) { /* offline – zostaje poprzednia lista */ }
  if (state.screen === 'ustaw') render();
}
function bkRestore(src, ts) {
  const it = (src === 'cloud' ? bkCloud : bkLocal()).find(x => x.ts === ts);
  if (!it || !it.json) return alert('Nie znaleziono tej kopii.');
  let obj;
  try { obj = JSON.parse(it.json); } catch (e) { return alert('Ta kopia jest uszkodzona.'); }
  if (!obj || !obj.days) return alert('Ta kopia nie wygląda na dane Life OS.');
  if (!confirm(`Cofnąć dane do kopii z ${fmtStamp(ts)} (${it.label})?\n\nObecne dane zostaną najpierw zapisane jako kopia „przed cofnięciem”.`)) return;
  bkMake('przed cofnięciem');
  localStorage.setItem(KEY, JSON.stringify(obj));
  data = load();
  save(); render();
  alert('Cofnięto do wybranej kopii.');
}
function bkCard() {
  const loc = bkLocal(), cloudOn = !!(window.FB && window.FB.auth.currentUser);
  const row = (src, x) => `<div class="item"><div class="grow"><div><b>${fmtStamp(x.ts)}</b> · ${esc(x.label)}</div>
    <div class="mut">${src === 'cloud' ? 'w chmurze' : 'na tym urządzeniu'}</div></div>
    <button data-act="bkRestore" data-src="${src}" data-ts="${x.ts}">Cofnij do tej</button></div>`;
  return `<div class="sec"><h2>🕘 Kopie i cofanie</h2><small>auto co godzinę</small></div>
  <div class="card">
    <div class="hint" style="margin-top:0">Cofnięcie zapisuje obecne dane jako kopię, więc też można je przywrócić.</div>
    <div class="row keep" style="margin-top:8px"><button class="pri" data-act="bkNow">Zrób kopię teraz</button></div>
    ${cloudOn
      ? (bkCloud.length ? '<div class="mut" style="margin-top:10px">W chmurze</div>' + bkCloud.map(x => row('cloud', x)).join('')
                        : '<div class="hint">Kopii w chmurze jeszcze nie ma.</div>')
      : '<div class="hint">Zaloguj się, żeby kopie szły też do chmury.</div>'}
    ${loc.length ? '<div class="mut" style="margin-top:10px">Na tym urządzeniu</div>' + loc.map(x => row('local', x)).join('') : ''}
  </div>`;
}

// === PODGLĄD DLA AGENTÓW (tylko odczyt, bez logowania) ===
// Po włączeniu aplikacja zapisuje kopię danych pod losowym kluczem: dokument shares/{klucz}.
// Kto zna klucz, widzi dane, ale nic nie może zmienić (reguły Firebase). Klucz można zmienić, co odcina stary link.
let shareS = { on: false, key: null };
const shareUrl = () => `https://firestore.googleapis.com/v1/projects/${window.FB.projectId}/databases/(default)/documents/shares/${shareS.key}`;
function shareMakeKey() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(36).padStart(2, '0')).join('').slice(0, 32);
}
async function shareLoad(uid) {
  const fb = window.FB;
  try {
    const s = await fb.getDoc(fb.doc(fb.db, 'users', uid, 'app', 'share'));
    const v = s.exists() ? s.data() : {};
    shareS = { on: !!(v.on && v.key), key: v.key || null };
  } catch (e) { shareS = { on: false, key: null }; }
  if (state.screen === 'ustaw') render();
}
async function shareSaveCfg() {
  const fb = window.FB, u = fb.auth.currentUser;
  try { await fb.setDoc(fb.doc(fb.db, 'users', u.uid, 'app', 'share'), { on: shareS.on, key: shareS.key }); }
  catch (e) { alert('Nie udało się zapisać ustawień podglądu: ' + (e.code || e.message)); }
}
// Wysyłka kopii dla agentów (wołane po każdej udanej wysyłce danych)
async function shareWrite(json, ts) {
  const fb = window.FB, u = fb && fb.auth.currentUser;
  if (!u || !shareS.on || !shareS.key) return;
  try { await fb.setDoc(fb.doc(fb.db, 'shares', shareS.key), { owner: u.uid, json, updatedAt: ts }); }
  catch (e) { /* podgląd nie wyszedł – spróbuje przy następnej wysyłce */ }
}
async function shareOn() {
  const u = window.FB && window.FB.auth.currentUser;
  if (!u) return alert('Najpierw zaloguj się.');
  if (!confirm('Włączyć podgląd dla agentów?\n\nKto dostanie link, zobaczy wszystkie Twoje dane (w tym zdrowotne), ale nie będzie mógł ich zmieniać.')) return;
  shareS = { on: true, key: shareMakeKey() };
  await shareSaveCfg();
  setMeta({ dirty: true, localTs: Date.now() });
  await pushNow();
  render();
}
async function shareStop(newKey) {
  const fb = window.FB, u = fb && fb.auth.currentUser;
  if (!u) return;
  if (shareS.key) { try { await fb.deleteDoc(fb.doc(fb.db, 'shares', shareS.key)); } catch (e) { /* może już nie istnieć */ } }
  shareS = newKey ? { on: true, key: shareMakeKey() } : { on: false, key: null };
  await shareSaveCfg();
  if (shareS.on) { setMeta({ dirty: true, localTs: Date.now() }); await pushNow(); }
  render();
}
function shareCard() {
  const u = window.FB && window.FB.auth.currentUser;
  const head = '<div class="sec"><h2>👀 Podgląd dla agentów</h2><small>tylko odczyt</small></div>';
  if (!u) return `${head}<div class="card"><div class="hint" style="margin-top:0">Podgląd działa dla zalogowanego konta. Najpierw się zaloguj (karta na górze Ustawień).</div></div>`;
  if (!shareS.on) return `${head}<div class="card">
    <div class="hint" style="margin-top:0">Agent dostanie link i zobaczy Twoje dane, bez logowania i bez możliwości zmian. Ty dalej wszystko edytujesz w aplikacji.</div>
    <div class="row keep" style="margin-top:8px"><button class="pri" data-act="shareOn">Włącz podgląd</button></div></div>`;
  return `${head}<div class="card">
    <div class="mut">Link dla agenta (wklej mu go i napisz, że ma tylko go odczytać):</div>
    <div class="item" style="word-break:break-all;font-size:12px"><code>${esc(shareUrl())}</code></div>
    <div class="hint">Dane są w polu <b>fields → json → stringValue</b>. Zmiany pojawiają się kilka sekund po zapisie w aplikacji.</div>
    <div class="row keep" style="flex-wrap:wrap;gap:8px;margin-top:8px">
      <button class="pri" data-act="shareCopy">Kopiuj link</button>
      <button data-act="shareNewKey">Nowy klucz (odcina stary link)</button>
      <button class="danger" data-act="shareOff">Wyłącz podgląd</button></div>
    <div class="hint" style="color:#b45309">Uwaga: każdy z tym linkiem zobaczy WSZYSTKIE Twoje dane, także zdrowotne. Nie wysyłaj go publicznie.</div></div>`;
}

function screenUstaw() {
  return `
  <h1 style="margin:6px 0 4px">⚙️ Ustawienia</h1>
  ${syncCard()}
  ${minSettingsCard()}
  <div class="sec"><h2>📅 Bloki stałe tygodnia</h2><small>${data.template.length} szt.</small></div>
  <div class="card">
    ${[...data.template].sort((a, b) => a.from.localeCompare(b.from)).map(t => `<div class="item" data-act="blockOpen" data-s="${todayISO()}" data-k="t" data-id="${t.id}" style="cursor:pointer">
      <div class="grow"><div><b>${tm(t)}</b> · ${esc(t.name)}</div>
      <div class="mut">${t.days.map(i => DNI[i]).join(' ')} · ${areaLabel(t.area)}</div></div><span class="mut">✎</span></div>`).join('') || '<div class="hint">Brak bloków stałych.</div>'}
    <button class="full" data-act="tplNew" style="margin-top:10px">+ Dodaj blok stały</button>
  </div>

  <div class="sec"><h2>Gdzie co edytować</h2></div>
  <div class="card"><div class="hint" style="margin-top:0">
    Drille i ich lista → KOSZ › Drille · Plan hali → KOSZ › Plan hali · Skille (diagnoza) → KOSZ › Diagnoza ·
    Treningi i punkty rutyny → CIAŁO · Wagę, dietę, kalkulator i produkty → DIETA/SEN · Cele, plan dnia → DZIŚ · Kompas → KOMPAS.
  </div></div>

  ${themeSection()}
  ${shareCard()}
  ${bkCard()}
  <div class="sec"><h2>💾 Dane</h2></div>
  <div class="card">
    <div class="hint" style="margin-top:0">Dane są na razie tylko w tej przeglądarce. Zrób backup, zanim cokolwiek zmienisz.</div>
    <div class="row keep" style="flex-wrap:wrap;gap:8px;margin-top:8px">
      <button class="pri" data-act="exportJSON">Eksport JSON (backup)</button>
      <button data-act="importPick">Import JSON</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" data-chg="importFile" style="display:none">
    <div class="row keep" style="margin-top:8px"><button data-act="exportCSV">Eksport CSV pomiarów rzutu</button></div>
    <div class="row keep" style="margin-top:14px"><button class="danger" data-act="reset">Wyczyść wszystkie dane</button></div>
  </div>`;
}

// === MOTYW (kolory) ===
// Gotowe motywy: wartości trafiają do zmiennych CSS (--bg, --acc…). Wybór i własne kolory są w USTAWIENIA.
const THEMES = {
  jasny: { name: 'Jasny ciepły', bg: '#fbf7f2', acc: '#ff7a3d', glow1: 'rgba(255,179,107,.22)', glow2: 'rgba(74,158,255,.10)', card: '#ffffff', card2: '#fff8f1', field: '#fffdfa', line: '#efe7dc', line2: '#e2d7c8', txt: '#2b2836', mut: '#8a8496', acc2: '#ffb36b', accTxt: '#ffffff', ok: '#22b573', okSoft: '#e9f9f1', bad: '#ef5350', badSoft: '#fff0ec', blue: '#4a9eff', blueSoft: '#eaf4ff', warnBg: '#fff0ec', warnTxt: '#9b3a24', warnLine: '#ffc7b8', heroA: '#ffe7d2', heroB: '#ffffff', chipBg: '#ffe9d6', chipTxt: '#9a4a10', panel: '#fffdf9', overlay: 'rgba(43,40,54,.4)', shadow: 'rgba(120,80,40,.22)', dark: false },
  pustynia: { name: 'Pustynia (terakota)', bg: '#f4ebe0', acc: '#c2410c', glow1: 'rgba(194,65,12,.12)', glow2: 'rgba(202,138,4,.10)', card: '#fffaf3', card2: '#faf1e4', field: '#fffdf8', line: '#e6d6bf', line2: '#d6c1a2', txt: '#3b2a1e', mut: '#8c7360', acc2: '#ea7a3c', accTxt: '#ffffff', ok: '#3f8f5f', okSoft: '#e6f3ea', bad: '#b91c1c', badSoft: '#fbe5e1', blue: '#2f6fb3', blueSoft: '#e3eefb', warnBg: '#fbe7d6', warnTxt: '#7c2d12', warnLine: '#efc6a4', heroA: '#f8dcc0', heroB: '#fffaf3', chipBg: '#f5d8bd', chipTxt: '#7c2d12', panel: '#fbf5ec', overlay: 'rgba(59,42,30,.35)', shadow: 'rgba(90,60,30,.22)', dark: false },
  nocny: { name: 'Nocny granat', bg: '#0f1420', acc: '#ff8a4c', glow1: 'rgba(255,138,76,.12)', glow2: 'rgba(96,165,250,.12)', card: '#171e2d', card2: '#1d2639', field: '#111828', line: '#26304a', line2: '#34405e', txt: '#eef1f8', mut: '#8e98b3', acc2: '#ffc078', accTxt: '#1a0e04', ok: '#34d399', okSoft: '#13332a', bad: '#f87171', badSoft: '#3a1a1f', blue: '#60a5fa', blueSoft: '#13263f', warnBg: '#3a1f1c', warnTxt: '#ffc4b8', warnLine: '#6b2f25', heroA: '#2b2140', heroB: '#171e2d', chipBg: '#3a2414', chipTxt: '#ffc58a', panel: '#141a28', overlay: 'rgba(3,5,10,.6)', shadow: 'rgba(0,0,0,.5)', dark: true },
  ocean: { name: 'Ocean (morski)', bg: '#0a1622', acc: '#38bdf8', glow1: 'rgba(56,189,248,.14)', glow2: 'rgba(167,139,250,.08)', card: '#112436', card2: '#173049', field: '#0c1d2c', line: '#1f3b55', line2: '#2d4f70', txt: '#e8f4fc', mut: '#8fb0c9', acc2: '#7dd3fc', accTxt: '#03141f', ok: '#34d399', okSoft: '#10322a', bad: '#f87171', badSoft: '#3a1c22', blue: '#38bdf8', blueSoft: '#0f2d40', warnBg: '#3a2a16', warnTxt: '#fcd9a8', warnLine: '#6b4a22', heroA: '#173f5c', heroB: '#112436', chipBg: '#173f5c', chipTxt: '#bfe9ff', panel: '#0e1d2c', overlay: 'rgba(2,8,14,.6)', shadow: 'rgba(0,0,0,.5)', dark: true },
  las: { name: 'Las (zieleń)', bg: '#0d1812', acc: '#3ddc97', glow1: 'rgba(61,220,151,.12)', glow2: 'rgba(250,204,21,.06)', card: '#142a20', card2: '#1a3429', field: '#0f2119', line: '#24432f', line2: '#315a40', txt: '#ebfbf2', mut: '#93b8a3', acc2: '#a3f5c9', accTxt: '#03160d', ok: '#4ade80', okSoft: '#14331f', bad: '#fb7185', badSoft: '#3a1d24', blue: '#7dd3fc', blueSoft: '#12303c', warnBg: '#3a301a', warnTxt: '#fde68a', warnLine: '#6b5a24', heroA: '#1d4531', heroB: '#142a20', chipBg: '#1d4531', chipTxt: '#b9f6d4', panel: '#112219', overlay: 'rgba(2,10,6,.6)', shadow: 'rgba(0,0,0,.5)', dark: true },
  wino: { name: 'Wino (bordo)', bg: '#1c1116', acc: '#ff6b8a', glow1: 'rgba(255,107,138,.12)', glow2: 'rgba(255,179,71,.08)', card: '#281820', card2: '#32202a', field: '#1f1219', line: '#442a37', line2: '#5a3646', txt: '#fbeef2', mut: '#b89aa6', acc2: '#ffa3b8', accTxt: '#2a0812', ok: '#6ee7b7', okSoft: '#163329', bad: '#ff7b7b', badSoft: '#3d1d22', blue: '#8ab4ff', blueSoft: '#1d2740', warnBg: '#3d1c25', warnTxt: '#ffc9d4', warnLine: '#7a3446', heroA: '#4a1f2e', heroB: '#281820', chipBg: '#4a1f2e', chipTxt: '#ffc2d0', panel: '#22141a', overlay: 'rgba(12,4,8,.6)', shadow: 'rgba(0,0,0,.5)', dark: true },
  sliwka: { name: 'Śliwka (fiolet)', bg: '#15101e', acc: '#a78bfa', glow1: 'rgba(167,139,250,.14)', glow2: 'rgba(244,114,182,.08)', card: '#211a31', card2: '#2a2140', field: '#1a1427', line: '#3a2f54', line2: '#4d3f6c', txt: '#f3eefc', mut: '#a79cc2', acc2: '#f0abfc', accTxt: '#1b0a2e', ok: '#4ade80', okSoft: '#13301f', bad: '#fb7185', badSoft: '#3a1d2a', blue: '#93c5fd', blueSoft: '#1c2a4a', warnBg: '#3a2232', warnTxt: '#fbcfe8', warnLine: '#6b3a5a', heroA: '#3a2a5c', heroB: '#211a31', chipBg: '#3a2a5c', chipTxt: '#e9d5ff', panel: '#1a1428', overlay: 'rgba(8,4,16,.6)', shadow: 'rgba(0,0,0,.5)', dark: true }
};
// Kolor z wyboru (akcent / tło) – reszta kolorów wylicza się z niego sama
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
const lumHex = h => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
function themeVars() {
  const u = data.ui || {};
  const v = { ...(THEMES[u.theme] || THEMES.jasny) };
  if (u.acc) {
    v.acc = u.acc; v.acc2 = mixHex(u.acc, '#ffffff', .35);
    v.accTxt = lumHex(u.acc) > .6 ? '#2b1400' : '#ffffff';
    v.heroA = mixHex(u.acc, v.card, .82); v.chipBg = mixHex(u.acc, v.card, .8); v.chipTxt = mixHex(u.acc, '#000000', .35);
  }
  if (u.bg) {
    const dark = lumHex(u.bg) < .5;
    v.bg = u.bg; v.dark = dark;
    v.card = dark ? mixHex(u.bg, '#ffffff', .07) : '#ffffff';
    v.card2 = dark ? mixHex(u.bg, '#ffffff', .12) : mixHex(u.bg, '#ffffff', .5);
    v.field = dark ? mixHex(u.bg, '#000000', .25) : mixHex(u.bg, '#ffffff', .85);
    v.line = dark ? mixHex(u.bg, '#ffffff', .14) : mixHex(u.bg, '#000000', .09);
    v.line2 = dark ? mixHex(u.bg, '#ffffff', .22) : mixHex(u.bg, '#000000', .18);
    v.txt = dark ? '#f4f4f8' : '#25212c'; v.mut = dark ? '#9ca3b4' : '#7a7486';
    v.panel = dark ? mixHex(u.bg, '#ffffff', .04) : mixHex(u.bg, '#ffffff', .7);
    v.heroB = v.card; v.overlay = dark ? 'rgba(0,0,0,.6)' : 'rgba(40,30,20,.35)';
    v.shadow = dark ? 'rgba(0,0,0,.5)' : 'rgba(120,80,40,.22)';
    v.heroA = u.acc ? mixHex(u.acc, v.card, .82) : mixHex(v.acc, v.card, .82);
  }
  return v;
}
// Wstawia kolory do strony (wywoływane przy każdym odświeżeniu ekranu)
function applyTheme() {
  const v = themeVars(), root = document.documentElement;
  for (const [k, val] of Object.entries(v)) if (k !== 'name' && k !== 'dark') root.style.setProperty('--' + k.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), val);
  root.style.colorScheme = v.dark ? 'dark' : 'light';
}
function themeSection() {
  const u = data.ui, base = THEMES[u.theme] || THEMES.jasny;
  const custom = !!(u.acc || u.bg);
  return `<div class="sec"><h2>🎨 Motyw kolorów</h2><small>zmienia się od razu</small></div>
  <div class="card">
    <div class="themes">${Object.entries(THEMES).map(([id, t]) => `<button class="theme ${id === u.theme && !custom ? 'on' : ''}" data-act="theme" data-id="${id}">
      <span class="sw" style="background:linear-gradient(135deg,${t.bg} 52%,${t.acc} 52%)"></span><span>${t.name}</span></button>`).join('')}</div>
    <div class="sec" style="margin:18px 0 0"><h2>Własne kolory</h2></div>
    <label>Kolor akcentu (przyciski, zakładki, wykresy)</label>
    <div class="row keep"><input type="color" value="${u.acc || base.acc}" data-chg="uiColor" data-k="acc" class="colorpick" aria-label="kolor akcentu">
      <span class="mut">${u.acc ? esc(u.acc) : 'z motywu'}</span></div>
    <label>Kolor tła</label>
    <div class="row keep"><input type="color" value="${u.bg || base.bg}" data-chg="uiColor" data-k="bg" class="colorpick" aria-label="kolor tła">
      <span class="mut">${u.bg ? esc(u.bg) : 'z motywu'}</span></div>
    <div class="hint">Tło jasne albo ciemne – reszta kolorów (karty, tekst) dopasuje się sama.</div>
    ${custom ? '<button class="full" data-act="uiReset" style="margin-top:12px">↺ Przywróć kolory motywu</button>' : ''}
  </div>`;
}

// === EKRAN – ROUTING I RENDER ===
const state = {
  screen: 'dzis', date: todayISO(), week: mondayOf(todayISO()),
  chartDrill: null, foodQ: '', drillBlock: '', dop: null, wk: null, exName: null, physM: 'vert', month: null,
  sub: { kosz: 'pomiary', cialo: 'trening', dieta: 'dzis', biznes: 'dzis', przeglad: 'tydzien' }
};
let data = load();
const SCREENS = { dzis: screenDzis, tydzien: screenTydzien, kosz: screenKosz, cialo: screenCialo, dieta: screenDieta,
  biznes: screenBiznes, kompas: screenKompas, przeglad: screenPrzeglad, ustaw: screenUstaw };
const TITLES = { dzis: 'Dziś', tydzien: 'Tydzień', kosz: 'Kosz', cialo: 'Ciało', dieta: 'Dieta / Sen', biznes: 'Biznes',
  kompas: 'Kompas', przeglad: 'Przegląd', ustaw: 'Ustawienia' };
const DRAWER_GROUPS = [
  ['Codziennie', ['dzis', 'tydzien']],
  ['Trening', ['kosz', 'cialo']],
  ['Życie', ['dieta', 'biznes', 'kompas', 'przeglad']],
  ['Reszta', ['ustaw']]
];

function render() {
  applyTheme();
  document.getElementById('app').innerHTML = SCREENS[state.screen]();
  // Tydzień używa całej szerokości strony (7 kolumn bez przewijania)
  document.getElementById('app').classList.toggle('wide', state.screen === 'tydzien');
  document.getElementById('chip').innerHTML = flameIcon(16) + ' ' + streaks().cur;
  renderTimer();
  if (!document.getElementById('drawer').classList.contains('hidden')) renderDrawer();
}
function renderDrawer() {
  document.getElementById('drawerBox').innerHTML = `
    <div class="dhead"><div class="dbrand"><div class="logo">Life <b>OS</b></div></div><button class="x" data-act="drawer" aria-label="zamknij">✕</button></div>
    ${DRAWER_GROUPS.map(([g, ids]) => `<div class="dgroup">${g}</div>${ids.map(id =>
      `<button class="dlink ${state.screen === id ? 'on' : ''}" data-act="go" data-to="${id}"><span class="ico">${ICON[id]}</span>${TITLES[id]}</button>`).join('')}`).join('')}`;
}
const ICON = { dzis: '🏠', tydzien: '📅', kosz: '🏀', cialo: '💪', dieta: '🥗', biznes: '💼', kompas: '🧭', przeglad: '📊', ustaw: '⚙️' };
function toggleDrawer(open) {
  const dr = document.getElementById('drawer');
  const show = open ?? dr.classList.contains('hidden');
  if (show) renderDrawer();
  dr.classList.toggle('hidden', !show);
}

// === AKCJE (kliknięcia) ===
const ACT = {
  go: el => { state.screen = el.dataset.to; toggleDrawer(false); window.scrollTo(0, 0); render(); },
  drawer: () => toggleDrawer(),
  theme: el => { data.ui.theme = el.dataset.id; data.ui.acc = null; data.ui.bg = null; save(); render(); },
  uiReset: () => { data.ui.acc = null; data.ui.bg = null; save(); render(); },

  // --- Trening: aktywna sesja ---
  sessStart: el => {
    const w = byId(data.workouts, el.dataset.id);
    if (el.dataset.id && !w) return;
    data.draft = { wid: w ? w.id : null, name: w ? w.name : 'Trening dowolny', ex: w ? parseEx(w.ex) : [],
                   start: Date.now(), sets: {}, rpe: 0, notes: '' };
    save(); render();
  },
  setAdd: el => {
    const e = data.draft.ex[+el.dataset.ei];
    if (e) { e.sets += 1; save(); render(); }
  },
  setDel: el => {
    const ei = +el.dataset.ei, e = data.draft.ex[ei];
    if (!e || e.sets <= 1) return;
    delete data.draft.sets[`${ei}-${e.sets - 1}`];
    e.sets -= 1;
    save(); render();
  },
  exAdd: () => {
    const name = document.getElementById('exNew').value.trim();
    if (!name) return alert('Wpisz nazwę ćwiczenia.');
    const sets = Math.max(1, parseInt(document.getElementById('exSets').value, 10) || 3);
    const reps = Math.max(1, parseInt(document.getElementById('exReps').value, 10) || 10);
    const rest = Math.max(0, parseInt(document.getElementById('exRest').value, 10) || 0);
    data.draft.ex.push({ name, sets, reps, rest, tempo: '', link: '' });
    save(); render();
  },
  exDel: el => {
    const ei = +el.dataset.ei, d = data.draft;
    if (!confirm('Usunąć to ćwiczenie z treningu? Wpisane serie też znikną.')) return;
    d.ex.splice(ei, 1);
    const ns = {};
    for (const [k, v] of Object.entries(d.sets)) {
      const [a, b] = k.split('-').map(Number);
      if (a === ei) continue;
      ns[a > ei ? `${a - 1}-${b}` : k] = v;
    }
    d.sets = ns;
    save(); render();
  },
  sessCancel: () => {
    if (!confirm('Odrzucić trening? Zapisane serie znikną.')) return;
    data.draft = null; save(); render();
  },
  sessFinish: () => {
    const d = data.draft;
    if (!d) return;
    const entries = d.ex.map((e, ei) => ({ name: e.name, sets: Array.from({ length: e.sets }, (_, si) => {
        const v = d.sets[`${ei}-${si}`] || {};
        return { kg: v.kg ?? null, reps: v.reps ?? null, done: !!v.done };
      }) }));
    const all = entries.flatMap(e => e.sets);
    if (!all.some(s => s.kg != null || s.reps != null || s.done)) return alert('Wpisz przynajmniej jedną serię (kg / powtórzenia albo zaznacz zrobioną).');
    const volume = Math.round(all.reduce((a, s) => a + (s.kg || 0) * (s.reps || 0), 0));
    data.sessions.push({ id: uid(), date: todayISO(), tpl: d.name, wid: d.wid, entries,
      duration: Math.max(1, Math.round((Date.now() - d.start) / 60000)), volume,
      rpe: d.rpe || null, notes: d.notes || '' });
    data.draft = null; stopTimer(); save(); render();
  },
  // --- Dieta: posiłki ---
  mealAdd: el => mealAdd(el),
  mealDel: el => {
    const { s, m, id } = el.dataset, d = day(s);
    const gone = (d.diet.meals[m] || []).find(x => x.id === id);
    d.diet.meals[m] = (d.diet.meals[m] || []).filter(x => x.id !== id);
    if (gone && gone.src === '?') dropRaw(s, m, gone.raw);
    save(); render();
  },
  mealRecalc: el => mealRecalc(el),
  aiItem: el => aiItem(el),
  cnt: el => {
    const inp = el.parentElement.querySelector('input');
    inp.value = Math.max(0, (parseInt(inp.value, 10) || 0) + +el.dataset.n);
  },
  drinkAdd: el => {
    const { s, m } = el.dataset;
    const name = (document.getElementById('dk-name')?.value || '').trim();
    if (!name) return alert('Wpisz, co wypiłeś, np. Muszynianka.');
    const qty = (document.getElementById('dk-qty')?.value || '').toString().replace(',', '.') || '250';
    if (!(+qty > 0)) return alert('Ilość musi być większa od zera.');
    const unit = document.getElementById('dk-unit')?.value || 'ml';
    const it = parseMeal(`${qty} ${unit} ${name}`)[0];
    const d = day(s);
    d.diet.meals = d.diet.meals || {};
    d.diet.meals[m] = (d.diet.meals[m] || []).concat([it]);
    save(); render();
  },
  statSet: el => { statP().mode = el.dataset.v; render(); },
  shotMode: el => { shotP().mode = el.dataset.v; render(); },
  mealNew: () => {
    const s = state.date, inp = document.getElementById('mealNewName'), sel = document.getElementById('mealPreset');
    const list = dayMeals(s).map(x => ({ ...x }));
    let name = ((inp && inp.value) || '').trim() || (sel && sel.value) || `Posiłek ${list.length + 1}`;
    // ta sama nazwa drugi raz → numerujemy (Obiad 2, Obiad 3)
    const same = list.filter(x => x.name === name || x.name.startsWith(name + ' ')).length;
    if (same) name = `${name} ${same + 1}`;
    day(s).diet.mealList = list.concat([{ id: uid(), name }]);
    save(); render();
  },
  mealRemove: el => {
    const { s, m } = el.dataset, d = day(s);
    if (!confirm('Usunąć ten posiłek razem z wpisami?')) return;
    d.diet.mealList = dayMeals(s).filter(x => x.id !== m).map(x => ({ ...x }));
    if (d.diet.meals) delete d.diet.meals[m];
    if (d.diet.mealText) delete d.diet.mealText[m];
    save(); render();
  },
  hintPick: el => {
    const { s, m } = el.dataset;
    if (el.dataset.k) {   // podpowiedź dla nazwy płynu
      document.getElementById('dk-name').value = el.dataset.v;
      document.getElementById(`sg-${s}-${m}`).innerHTML = '';
      return;
    }
    const ta = document.getElementById(`mt-${s}-${m}`);
    const v = ta.value, idx = Math.max(v.lastIndexOf(','), v.lastIndexOf(';'), v.lastIndexOf('\n'));
    const lead = idx >= 0 ? v.slice(0, idx + 1) + ' ' : '';
    const seg = v.slice(idx + 1);
    const qty = ((seg.match(/^\s*\d+([.,]\d+)?\s*(g|gr|gram\w*|ml|l|dl|szt\.?|kg)?\s*/i) || [''])[0]).trimStart();
    ta.value = lead + qty + el.dataset.v + ', ';
    document.getElementById(`sg-${s}-${m}`).innerHTML = '';
    ta.focus();
  },
  mealPick: el => {
    const it = findMealItem(el.dataset.s, el.dataset.m, el.dataset.id), f = data.foods.find(x => x.name === el.dataset.food);
    if (!it || !f) return;
    fillItem(it, f.name, f, 'baza'); dropRaw(el.dataset.s, el.dataset.m, it.raw); save(); render();
  },
  netSearch: el => netSearch(el),
  netUse: el => netUse(el),
  foodFromUnknown: el => foodFromUnknown(el),
  aiOpen: el => aiOpen(el),
  aiCopy: () => aiCopy(),
  aiImport: el => aiImport(el),
  sub: el => { state.sub[el.dataset.s] = el.dataset.v; render(); },
  dayShift: el => { state.date = addDays(state.date, +el.dataset.n); render(); },
  dayToday: () => { state.date = todayISO(); render(); },
  weekShift: el => { state.week = addDays(state.week, 7 * +el.dataset.n); render(); },
  weekToday: () => { state.week = mondayOf(todayISO()); render(); },
  evOk: el => { day(state.date).ev.ok = +el.dataset.v; save(); render(); },
  unhide: el => { Object.values(day(el.dataset.s).done).forEach(o => delete o.hidden); save(); render(); },
  water: el => { const d = day(state.date); d.diet.waterL = Math.max(0, Math.round(((d.diet.waterL || 0) + +el.dataset.n) * 100) / 100); save(); render(); },

  goalAdd: el => {
    const v = document.getElementById('ga-' + el.dataset.s).value.trim();
    if (!v) return;
    day(el.dataset.s).goals.push({ id: uid(), t: v, done: false });
    save(); render();
  },
  goalDel: el => { const d = day(el.dataset.s); d.goals = d.goals.filter(g => g.id !== el.dataset.id); save(); render(); },

  blockToggle: el => {
    const { s, k, id } = el.dataset, d = day(s);
    const cur = blocksFor(s).find(b => b.id === id && b.kind === k);
    const now = !(cur && cur.done);
    if (k === 'x') { const e = byId(d.extra, id); if (e) e.done = now; }
    else d.done[id] = Object.assign(d.done[id] || {}, { done: now });
    save(); render();
  },
  blockOpen: el => openBlock(el.dataset.s, el.dataset.k, el.dataset.id),
  blockSave: el => blockSave(el),
  blockDel: el => blockDel(el),
  extraNew: el => openExtra(el.dataset.s || state.date),
  extraAdd: el => {
    const f = readForm();
    if (!f.name) return alert('Wpisz nazwę bloku.');
    day(el.dataset.s).extra.push({ id: uid(), name: f.name, from: f.from, to: f.to, area: f.area, done: false, rating: 0, note: '' });
    save(); closeSheet(); render();
  },
  tplNew: () => openTpl(),
  tplAdd: () => {
    const f = readForm();
    if (!f.name) return alert('Wpisz nazwę bloku.');
    if (!f.days.length) return alert('Zaznacz co najmniej jeden dzień tygodnia.');
    data.template.push({ id: uid(), name: f.name, from: f.from, to: f.to, area: f.area, days: f.days });
    save(); closeSheet(); render();
  },
  syncLogin: () => syncAuth('login'),
  syncRegister: () => syncAuth('register'),
  syncLogout: async () => { if (window.FB) await window.FB.signOut(); syncSet('local'); render(); },
  syncNow: () => { const u = window.FB && window.FB.auth.currentUser; if (u) pullNow(u); },
  sheetClose: () => closeSheet(),

  recNew: el => openRec(el.dataset.c, null),
  recEdit: el => openRec(el.dataset.c, el.dataset.id),
  recSave: el => recSave(el),
  recDel: el => recDel(el),
  // --- Trening: wybór i ćwiczenia wybranego treningu ---
  wkSelect: el => { state.wk = el.dataset.id; exIdx = null; save(); render(); window.scrollTo(0, 0); },
  trEdit: el => { exIdx = +el.dataset.i; render(); },
  trCancel: () => { exIdx = null; render(); },
  trSave: () => {
    const w = byId(data.workouts, state.wk || (data.workouts[0] && data.workouts[0].id));
    if (!w) return;
    const g = id => (document.getElementById(id)?.value ?? '').toString().trim();
    const clean = t => t.replace(/\|/g, '/');
    const name = clean(g('ex-name'));
    if (!name) return alert('Podaj nazwę ćwiczenia');
    const sets = Math.max(1, parseInt(g('ex-sets'), 10) || 3);
    const reps = Math.max(1, parseInt(g('ex-reps'), 10) || 10);
    const rest = Math.max(0, parseInt(g('ex-rest'), 10) || 0);
    const kgRaw = parseFloat(g('ex-kg').replace(',', '.'));
    const kgTxt = kgRaw > 0 ? String(kgRaw) : '';
    const line = [name, `${sets}x${reps}`, clean(g('ex-tempo')), g('ex-link').replace(/\|/g, ''), String(rest), kgTxt].join(' | ');
    const lines = exLines(w);
    if (exIdx != null && lines[exIdx] != null) lines[exIdx] = line; else lines.push(line);
    w.ex = lines.join('\n');
    exIdx = null; save(); render();
  },
  trDel: el => {
    const i = +el.dataset.i, w = byId(data.workouts, state.wk);
    if (!w) return;
    const lines = exLines(w);
    if (!lines[i] || !confirm('Usunąć to ćwiczenie z treningu?')) return;
    lines.splice(i, 1); w.ex = lines.join('\n');
    if (exIdx === i) exIdx = null; else if (exIdx > i) exIdx--;
    save(); render();
  },

  shotAdd: () => shotAdd(),
  shotEdit: el => shotEdit(el.dataset.id),
  shotSave: el => {
    const p = byId(data.shots, el.dataset.id);
    if (!p) return;
    const f = readShot(document.getElementById('sheetBox'));
    if (!checkShot(f)) return;
    if (!data.drills.some(d => d.name === f.drill)) data.drills.push({ id: uid(), name: f.drill, block: '', time: null, reps: '', link: '', works: '', note: '' });
    Object.assign(p, f);
    save(); closeSheet(); render();
  },
  shotDel: el => {
    if (!confirm('Usunąć ten pomiar?')) return;
    data.shots = data.shots.filter(p => p.id !== el.dataset.id);
    save(); closeSheet(); render();
  },

  diagNew: () => openDiag(),
  diagSave: () => diagSave(),

  sessDel: el => { if (confirm('Usunąć trening z historii?')) { data.sessions = data.sessions.filter(s => s.id !== el.dataset.id); save(); render(); } },

  revSave: el => revSave(el),
  revOpen: el => { state.week = el.dataset.mon; state.sub.przeglad = 'tydzien'; state.screen = 'przeglad'; render(); },

  timerStart: el => startTimer(+el.dataset.sec, el.dataset.label),
  timerStop: () => stopTimer(),

  dop: () => {
    const a = data.texts.arsenal.filter(Boolean);
    state.dop = a.length ? a[Math.floor(Math.random() * a.length)] : 'Uzupełnij dopalacze poniżej.';
    render();
  },

  minAdd: () => {
    const v = document.getElementById('newMin').value.trim();
    if (!v) return;
    const r = document.querySelector('input[name="minScope"]:checked');
    const sc = r ? r.value : 'week';
    const mon = state.minWeek || mondayOf(todayISO());
    if (sc === 'multi') {
      const ws = [...document.querySelectorAll('input[name="minWk"]:checked')].map(x => x.value);
      if (!ws.length) return alert('Zaznacz co najmniej jeden tydzień.');
      return minAddMulti(v, ws);
    }
    minAddWeek(v, mon, sc === 'perm');
  },
  minWeekShift: el => { state.minWeek = addDays(state.minWeek || mondayOf(todayISO()), 7 * +el.dataset.n); render(); },
  minWeekToday: () => { state.minWeek = mondayOf(todayISO()); render(); },
  minDel: el => {
    const id = el.dataset.id, mon = state.minWeek || mondayOf(todayISO());
    const m = byId(data.minimum, id) || { id, label: '' };
    state.minSheet = id;
    const past = mon < mondayOf(todayISO());
    openSheet(`<h2>${esc(m.label)}</h2>
      ${past ? '<div class="hint" style="color:#b45309">Ten tydzień już minął. Zmiana wpłynie na serie z tych dni.</div>' : ''}
      <label>Dni tego tygodnia – kliknij, żeby wyłączyć; kliknij ponownie, żeby włączyć</label>
      <div class="row keep" style="gap:6px;flex-wrap:wrap;margin:8px 0">${minChips(m, mon)}</div>
      <div class="foot">
        <button class="full" data-act="minDelWeek" data-id="${id}" data-s="${mon}">Wyłącz cały ten tydzień</button>
        <button class="full" data-act="minRestoreWeek" data-id="${id}" data-s="${mon}">Włącz wszystkie dni tego tygodnia</button>
        <button class="danger full" data-act="minDelScope" data-id="${id}">Usuń od dziś na zawsze (historia zostaje)</button>
        <button class="danger full" data-act="minDelAll" data-id="${id}">Usuń całkowicie (cała przeszłość i przyszłość)</button>
        <button class="full" data-act="sheetClose">Zamknij</button>
      </div>`);
  },
  minDayToggle: el => {
    const { id, s: d } = el.dataset, rec = data.days[d] || {};
    if ((rec.minOff || {})[id]) minRestoreDay(id, d); else minHideDay(id, d);
    // okno ✕ zostaje otwarte i pokazuje nowy stan
    const sheetOpen = !document.getElementById('sheet').classList.contains('hidden');
    if (sheetOpen && state.minSheet === id) ACT.minDel({ dataset: { id } });
  },
  minDelDay: el => { closeSheet(); minHideDay(el.dataset.id, el.dataset.s); },
  minDelWeek: el => { closeSheet(); minHideWeek(el.dataset.id, el.dataset.s); },
  minRestoreWeek: el => { closeSheet(); minRestoreWeek(el.dataset.id, el.dataset.s); },
  minDelScope: el => { closeSheet(); minRemoveScoped(el.dataset.id, 'all'); },
  minDelAll: el => {
    if (!confirm('Usunąć CAŁKOWICIE? Punkt zniknie z całej historii i przyszłości. Serie dni, w których był, mogą się zmienić. Tego nie da się cofnąć.')) return;
    closeSheet(); minDeleteAll(el.dataset.id);
  },
  bkNow: () => { bkMake('ręczna'); render(); alert('Zrobiono kopię.'); },
  bkRestore: el => bkRestore(el.dataset.src, +el.dataset.ts),
  shareOn: () => shareOn(),
  shareCopy: () => { navigator.clipboard.writeText(shareUrl()).then(() => alert('Skopiowano link.'), () => alert('Nie udało się skopiować. Zaznacz link i skopiuj ręcznie.')); },
  shareNewKey: () => { if (confirm('Wygenerować nowy klucz? Stary link przestanie działać.')) shareStop(true); },
  shareOff: () => { if (confirm('Wyłączyć podgląd? Link przestanie działać.')) shareStop(false); },
  exportJSON: () => download(`life-os-backup-${todayISO()}.json`, JSON.stringify(data, null, 2), 'application/json'),
  exportCSV: () => exportCSV(),
  importPick: () => document.getElementById('importFile').click(),
  reset: () => {
    if (confirm('Na pewno usunąć WSZYSTKIE dane? Najpierw zrób eksport JSON.')) { bkMake('przed wyczyszczeniem'); data = DEFAULTS(); save(); render(); }
  }
};

// === AKCJE (zmiany w polach) ===
const CHG = {
  shotP: (el) => { const p = shotP(); if (el.dataset.f === 'n') p.n = Math.max(1, parseInt(el.value, 10) || 1); else p.unit = el.value; render(); },
  shotY: (el) => { shotP().y = el.value; render(); },
  statP: (el) => { const p = statP(); if (el.dataset.f === 'n') p.n = Math.max(1, parseInt(el.value, 10) || 1); else p.unit = el.value; render(); },
  min: el => { day(state.date).min[el.dataset.id] = el.checked; save(); render(); },
  bdone: el => { setBlock(el.dataset.s, el.dataset.k, el.dataset.id, { done: el.checked }); render(); },
  brate: el => { setBlock(el.dataset.s, el.dataset.k, el.dataset.id, { rating: +el.value }); render(); },
  ev: el => { day(state.date).ev[el.dataset.f] = el.value; save(); },
  goalDone: el => { const g = byId(day(el.dataset.s).goals, el.dataset.id); if (g) { g.done = el.checked; save(); render(); } },
  goalTxt: el => { const g = byId(day(el.dataset.s).goals, el.dataset.id); if (g) { g.t = el.value.trim() || g.t; save(); render(); } },
  dayf: el => {
    const d = day(state.date), sec = el.dataset.sec, f = el.dataset.f;
    d[sec] = d[sec] || {};
    if (el.type === 'checkbox') d[sec][f] = el.checked;
    else if (el.dataset.num) d[sec][f] = el.value === '' ? null : +el.value;
    else d[sec][f] = el.value;
    save(); render();
  },
  rout: el => { day(state.date).routine[el.dataset.id] = el.checked; save(); render(); },
  plan90done: el => { const p = byId(data.plan90, el.dataset.id); if (p) { p.done = el.checked; save(); render(); } },
  txt: el => { data.texts[el.dataset.f] = el.value; save(); },
  arsenal: el => { data.texts.arsenal[+el.dataset.i] = el.value.trim(); save(); },
  minLabel: el => { const m = byId(data.minimum, el.dataset.id); if (m) { m.label = el.value.trim() || m.label; save(); render(); } },
  chartDrill: el => { state.chartDrill = el.value; render(); },
  drillBlock: el => { state.drillBlock = el.value; render(); },
  wkpick: el => { state.wk = el.value; render(); },
  mealRename: el => {
    const { s, m } = el.dataset, list = dayMeals(s).map(y => ({ ...y })), x = list.find(y => y.id === m);
    if (!x) return;
    x.name = el.value.trim() || x.name; day(s).diet.mealList = list; save(); render();
  },
  exPick: el => { state.exName = el.value; render(); },
  physPick: el => { state.physM = el.value; render(); },
  monthPick: el => { state.month = el.value; render(); },
  importFile: el => importFile(el),
  // --- Trening: zmiany w aktywnej sesji (bez przerysowania, żeby nie gubić kursora) ---
  setf: el => {
    const d = data.draft, k = el.dataset.k, f = el.dataset.f;
    d.sets[k] = d.sets[k] || {};
    d.sets[k][f] = el.value === '' ? null : +el.value;
    save();   // bez przerysowania ekranu – kursor zostaje w polu
  },
  setdone: el => {
    const d = data.draft, k = el.dataset.k;
    d.sets[k] = d.sets[k] || {};
    d.sets[k].done = el.checked;
    save();
    if (el.checked) startTimer(+el.dataset.rest, el.dataset.label);
    render();
  },
  draftf: el => {
    const d = data.draft, f = el.dataset.f;
    d[f] = el.dataset.num ? +el.value : el.value;
    save();   // bez przerysowania – nazwa i notatka zostają w polu
  },
  // --- Dieta: kalkulator i baza ---
  profile: el => {
    const f = el.dataset.f, p = data.profile;
    if (el.dataset.num) p[f] = el.value === '' ? null : +el.value;
    else p[f] = el.value;
    save(); render();
  },
  foodQ: el => { state.foodQ = el.value; render(); },
  uiColor: el => { data.ui[el.dataset.k] = el.value; save(); render(); }
};

// Enter w polach z data-enter (np. dodanie celu)
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.dataset || !e.target.dataset.enter) return;
  e.preventDefault();
  const fn = ACT[e.target.dataset.enter];
  if (fn) fn(e.target, e);
});

// Zapis edycji bloku: dzień lub na stałe
function readForm() {
  const q = n => document.querySelector(`#sheet [name="${n}"]`);
  return {
    name: q('name') ? q('name').value.trim() : '',
    from: q('from') ? q('from').value : '',
    to: q('to') ? q('to').value : '',
    area: q('area') ? q('area').value : 'inne',
    days: [...document.querySelectorAll('#sheet [name="days"]:checked')].map(x => +x.value),
    done: !!(q('done') && q('done').checked),
    rating: q('rating') ? +q('rating').value : 0,
    note: q('note') ? q('note').value : ''
  };
}
function pickScope(el) {
  const r = document.querySelector('#sheet [name="scope"]:checked');
  return el.dataset.scope || (r ? r.value : 'day');
}
// Zapis edycji bloku. Zakres: day = tylko ten dzień, next = ten i kolejne, all = cała seria.
function blockSave(el) {
  const { s, k, id } = el.dataset, scope = pickScope(el);
  const f = readForm(), d = day(s);
  const common = { done: f.done, rating: f.rating, note: f.note };
  if (k === 'x') {
    const e = byId(d.extra, id);
    if (e) Object.assign(e, { name: f.name || e.name, from: f.from, to: f.to, area: f.area }, common);
  } else {
    const t = byId(data.template, id);
    if (!t) return;
    if (scope !== 'day' && !f.days.length) return alert('Zaznacz co najmniej jeden dzień tygodnia.');
    d.done[id] = d.done[id] || {};
    if (scope === 'day') {
      // tylko ten dzień: nadpisania w dniu, szablon nietknięty
      Object.assign(d.done[id], { name: f.name || t.name, area: f.area, from: f.from, to: f.to }, common);
    } else if (scope === 'all' || (t.start && s <= t.start)) {
      // cała seria: zmiana szablonu, nadpisania dni czyścimy (zostają tylko zrobione/ocena/notatka)
      Object.assign(t, { name: f.name || t.name, from: f.from, to: f.to, area: f.area, days: f.days });
      for (const key of Object.keys(data.days)) {
        const o = data.days[key].done && data.days[key].done[id];
        if (o) { delete o.name; delete o.area; delete o.from; delete o.to; }
      }
      Object.assign(d.done[id], common);
    } else {
      // ten i kolejne: stara seria kończy się dzień wcześniej, nowa zaczyna się od s
      const nt = { id: uid(), name: f.name || t.name, from: f.from, to: f.to, area: f.area, days: f.days, start: s, until: t.until };
      t.until = addDays(s, -1);
      for (const key of Object.keys(data.days)) {
        if (key < s) continue;
        const dd = data.days[key];
        if (dd.done && dd.done[id]) {
          const moved = dd.done[id]; delete dd.done[id];
          delete moved.name; delete moved.area; delete moved.from; delete moved.to;
          dd.done[nt.id] = moved;
        }
      }
      data.template.push(nt);
      d.done[nt.id] = Object.assign(d.done[nt.id] || {}, common);
    }
  }
  save(); closeSheet(); render();
}
function blockDel(el) {
  const { s, k, id } = el.dataset, scope = pickScope(el), d = day(s);
  if (k === 'x') {
    d.extra = d.extra.filter(x => x.id !== id);
  } else {
    const t = byId(data.template, id);
    if (scope === 'day' || !t) {
      d.done[id] = Object.assign(d.done[id] || {}, { hidden: true });
    } else if (scope === 'all' || (t.start && s <= t.start)) {
      if (!confirm('Usunąć ten blok ze WSZYSTKICH dni? Historia zostaje.')) return;
      data.template = data.template.filter(x => x.id !== id);
    } else {
      // ten i kolejne: seria kończy się dzień wcześniej
      t.until = addDays(s, -1);
    }
  }
  save(); closeSheet(); render();
}

// === EKSPORT / IMPORT ===
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function exportCSV() {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = 'data,dryl,trafione,oddane,procent,front_rim,back_rim,swish,non_swish,airball,cue,uwaga';
  const rows = [...data.shots].sort((a, b) => a.date.localeCompare(b.date)).map(p =>
    [p.date, p.drill, p.made, p.att, pct(p), (p.cat || {}).front || 0, (p.cat || {}).back || 0, (p.cat || {}).swish || 0, (p.cat || {}).nonswish || 0, (p.cat || {}).airball || 0, p.cue, p.note].map(q).join(','));
  download(`life-os-pomiary-${todayISO()}.csv`, '\uFEFF' + [head, ...rows].join('\n'), 'text/csv');
}
function importFile(el) {
  const f = el.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const obj = JSON.parse(r.result);
      if (!obj || ![1, 2, 3, 4, 5, 6].includes(obj.v)) throw new Error('to nie jest backup Life OS');
      if (!confirm('Zaimportować i NADPISAĆ obecne dane?')) return;
      bkMake('przed importem');
      localStorage.setItem(KEY, JSON.stringify(obj));
      data = load();
      save(); render();
      alert('Import OK.');
    } catch (err) {
      alert('Import nieudany: ' + err.message);
    }
  };
  r.readAsText(f);
}

// === PODPOWIEDZI DAŃ podczas pisania w polu „Co i ile zjadłem” ===
function foodHints(q, n = 12) {
  const w = (q || '').toLowerCase().trim();
  if (!w) return [];
  const names = (data.foods || []).map(f => f.name).sort((a, b) => a.localeCompare(b, 'pl'));
  const starts = names.filter(x => x.toLowerCase().startsWith(w));
  const inside = names.filter(x => !x.toLowerCase().startsWith(w) && x.toLowerCase().includes(w));
  return [...starts, ...inside].slice(0, n);
}
// Fragment po ostatnim przecinku bez ilości („200 g ros” → „ros”)
function hintQuery(seg) {
  return /^\s*\d/.test(seg) ? seg.replace(/^\s*\d+([.,]\d+)?\s*(g|gr|gram\w*|ml|l|dl|szt\.?|kg)?\s*/i, '').trim() : seg.trim();
}
document.addEventListener('input', e => {
  const el = e.target;
  if (!el || !el.id) return;
  // płyn: podpowiedzi dla całej nazwy
  if (el.id === 'dk-name') {
    const box = document.getElementById(`sg-${el.dataset.s}-${el.dataset.m}`);
    if (!box) return;
    const list = foodHints(el.value.trim());
    box.innerHTML = list.length ? `<div class="mut" style="margin:6px 0 4px">Podpowiedzi (kliknij, żeby wstawić):</div><div class="pills">${list.map(n => `<button data-act="hintPick" data-k="1" data-s="${el.dataset.s}" data-m="${el.dataset.m}" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : '';
    return;
  }
  // posiłek: podpowiedzi dla ostatniego fragmentu pola „Co i ile zjadłem”
  if (el.tagName !== 'TEXTAREA' || !el.id.startsWith('mt-')) return;
  const box = document.getElementById(`sg-${el.dataset.s}-${el.dataset.m}`);
  if (!box) return;
  const v = el.value, idx = Math.max(v.lastIndexOf(','), v.lastIndexOf(';'), v.lastIndexOf('\n'));
  const q = hintQuery(v.slice(idx + 1));
  const list = q ? foodHints(q) : [];
  box.innerHTML = list.length ? `<div class="mut" style="margin:6px 0 4px">Podpowiedzi (kliknij, żeby wstawić):</div><div class="pills">${list.map(n => `<button data-act="hintPick" data-s="${el.dataset.s}" data-m="${el.dataset.m}" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : '';
});

// === ZDARZENIA (delegacja) ===
document.addEventListener('click', e => {
  if (e.target.id === 'sheet') return closeSheet();
  if (e.target.id === 'drawer') return toggleDrawer(false);
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act] && !el.disabled) ACT[el.dataset.act](el, e);
});
document.addEventListener('change', e => {
  const el = e.target.closest ? e.target.closest('[data-chg]') : null;
  if (el && CHG[el.dataset.chg]) CHG[el.dataset.chg](el, e);
});
// Licznik czasu treningu – odświeża tylko liczbę (bez przerysowania ekranu)
setInterval(() => {
  const e = document.getElementById('elapsed');
  if (e && data.draft) e.textContent = fmtT(Math.floor((Date.now() - data.draft.start) / 1000));
}, 1000);
render();
// Start synchronizacji: gdy moduł Firebase już działa albo po zdarzeniu fb-ready
if (window.FB || window.FB_ERROR) syncInit(); else document.addEventListener('fb-ready', syncInit, { once: true });
renderSyncBadge();
