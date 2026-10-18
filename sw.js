// تحكم البيت: الصفحة network-first (آخر نسخة تتخزن للأوفلاين)، والأيقونات cache-first
const CACHE = 'home-remote-v1';
const SHELL = ['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(ch => ch.put('./', c)); } return res; })
        .catch(() => caches.match('./').then(m => m || new Response('مفيش نسخة محفوظة. افتح الصفحة مرة وانت متصل بالنت.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })))
    );
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(ch => ch.put(r, c)); } return res; })));
});
