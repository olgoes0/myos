// === SERVICE WORKER: działanie offline ===
// Strategia "najpierw sieć, potem cache" – po każdej zmianie w kodzie apka od razu pobiera nową wersję,
// a offline korzysta z ostatniej zapamiętanej.
const CACHE = 'lifeos-v18';
const FILES = ['./', './index.html', './app.js', './produkty.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './firebase-config.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
