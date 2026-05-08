// ── Radball Europa – Service Worker ──────────────────────────
const CACHE = 'radball-v1';
const OFFLINE_FILES = [
  '/',
  '/RadballEuropa/index.html',
  '/RadballEuropa/manifest.json',
  '/RadballEuropa/icons/icon-192.png',
  '/RadballEuropa/icons/icon-512.png'
];

// Installation: Dateien cachen
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

// Aktivierung: alten Cache löschen
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first für Assets, Network-first für API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Supabase API immer aus dem Netz laden
  if (url.hostname.includes('supabase.co')) {
    e.respondWith(
      fetch(e.request).catch(() => new Response('{}', { headers: { 'Content-Type': 'application/json' } }))
    );
    return;
  }

  // Alles andere: Cache-first mit Netz-Fallback
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Nur GET-Antworten cachen
        if (e.request.method !== 'GET' || !response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      }).catch(() => caches.match('/RadballEuropa/index.html'));
    })
  );
});