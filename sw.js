// تحكم البيت: الصفحة من الكاش فوراً + تحديث في الخلفية، والأيقونات cache-first
const CACHE = 'home-remote-v6';
const SHELL = ['./', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
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
    // الصفحة بتفتح فوراً من الكاش، وبتتحدّث في الخلفية (التحديث بيظهر في الفتحة اللي بعدها)
    e.respondWith(caches.open(CACHE).then(ch => ch.match('./').then(cached => {
      const net = fetch(r).then(res => { if (res.ok) ch.put('./', res.clone()); return res; });
      if (cached) { net.catch(() => {}); return cached; }
      return net.catch(() => new Response('مفيش نسخة محفوظة. افتح الصفحة مرة وانت متصل بالنت.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
    })));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(ch => ch.put(r, c)); } return res; })));
});
