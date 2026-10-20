// Keeps the guide and any saved audio available when the signal drops.
const CACHE = 'salt-iron-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'index.html'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Audio is requested in byte ranges; answer them from the saved full file.
async function ranged(req, res) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range'));
  const len = buf.byteLength;
  let start = m[1] ? +m[1] : 0;
  let end = m[2] ? Math.min(+m[2], len - 1) : len - 1;
  if (!m[1] && m[2]) { start = Math.max(0, len - +m[2]); end = len - 1; }
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${len}`,
      'Content-Length': String(end - start + 1)
    }
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;

  if (url.pathname.includes('/audio/')) {
    e.respondWith(
      caches.match(url.href).then((hit) => {
        if (!hit) return fetch(req);
        return req.headers.has('range') ? ranged(req, hit) : hit;
      })
    );
    return;
  }

  // Page: show the saved copy at once, refresh it in the background.
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
      if (hit) { net.catch(() => {}); return hit; }
      return net.catch(() => c.match('index.html'));
    })
  );
});
