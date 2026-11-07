// Offline-Cache: Die App besteht nur aus wenigen statischen Dateien.
// Strategie „Netzwerk zuerst, sonst Cache“: Updates kommen automatisch an, und ohne Server/Internet startet die App aus dem Cache.
// Deine Finanzdaten liegen NICHT hier, sondern in IndexedDB – ein Cache-Update berührt sie nie.
const CACHE = 'finanz-tracker-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((m) => m || caches.match('./index.html')))
  );
});
