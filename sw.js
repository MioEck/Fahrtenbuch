// Offline-Fähigkeit: nur die App selbst wird zwischengespeichert, nie die Fahrtenbuch-Daten.
const VERSION = 'fahrtenbuch-v1';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // GitHub-API nie über den Cache
  // Netz zuerst (damit Updates der App sofort ankommen), sonst Cache
  e.respondWith(fetch(e.request).then(r => {
    const kopie = r.clone();
    caches.open(VERSION).then(c => c.put(e.request, kopie));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
