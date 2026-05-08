const CACHE = "radball-v1";
const FILES = ["/RadballEuropa/index.html", "/RadballEuropa/manifest.json", "/RadballEuropa/icons/icon-192.png", "/RadballEuropa/icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});