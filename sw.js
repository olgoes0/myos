// === SERVICE WORKER: offline cache + Firebase push ===
// Sieć ma pierwszeństwo, cache pozwala otworzyć aplikację offline.
const CACHE = 'lifeos-v37';
const FILES = ['./', './index.html', './app.js?v=20261121-foods-favorites-6', './produkty.js', './manifest.json', './icon.svg', './icon-192.png', './icon-512.png', './firebase-config.js'];

// Firebase Messaging działa w tym samym workerze co cache/offline.
// Konfiguracja klienta Firebase jest publiczna; nigdy nie umieszczaj tu klucza Admin SDK.
try {
  importScripts(
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js'
  );
  const firebaseConfig = {
    apiKey: 'AIzaSyBP6hR00EcDnnC0CJRA6aSQqV3LE3UXlk0',
    authDomain: 'my-os-2c0bf.firebaseapp.com',
    projectId: 'my-os-2c0bf',
    storageBucket: 'my-os-2c0bf.firebasestorage.app',
    messagingSenderId: '755770625728',
    appId: '1:755770625728:web:04fe72b298a72811a1a725',
    measurementId: 'G-Y5HNVY2SF7'
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  firebase.messaging().onBackgroundMessage(payload => {
    const n = payload.notification || {};
    return self.registration.showNotification(payload.data?.title || n.title || 'Life OS', {
      body: n.body || payload.data?.body || 'Masz zaplanowane przypomnienie.',
      icon: new URL('./icon-192.png', self.registration.scope).href,
      badge: new URL('./icon-192.png', self.registration.scope).href,
      tag: payload.data?.reminderId || 'lifeos-reminder',
      data: { url: payload.data?.url || self.registration.scope }
    });
  });
} catch (e) {
  // Brak sieci/SDK nie blokuje instalacji aplikacji ani działania offline.
  console.warn('Firebase Messaging niedostępny w service workerze:', e);
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const requested = new URL(e.notification.data && e.notification.data.url || self.registration.scope, self.registration.scope);
  const target = requested.origin === self.location.origin ? requested.href : self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => client.url.startsWith(self.registration.scope));
    if (existing && 'focus' in existing) return existing.focus();
    return self.clients.openWindow(target);
  }));
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
