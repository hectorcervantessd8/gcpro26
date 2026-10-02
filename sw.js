/* GuavaComanda PRO · service worker (guava-pro-caja-v20)
   Guarda la app en el teléfono para que abra al instante y sin internet.
   Los datos (mesas, cobros) SIEMPRE se piden al servidor: nunca se cachean. */
var CACHE = 'guava-pro-caja-v20';
var ARCHIVOS = ['./', './index.html', './manifest.webmanifest',
                './icono-192.png', './icono-512.png', './icono-apple-180.png'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (r) {
      var copia = r.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copia); });
      return r;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
