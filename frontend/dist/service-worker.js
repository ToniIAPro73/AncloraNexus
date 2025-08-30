const CACHE_NAME = 'Nexus-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/index.css',
  '/icono-Nexus.png',
  '/anclora_Nexus_logo.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
    return;
  }

  if (request.method === 'POST' && request.url.includes('/conversion/convert')) {
    event.respondWith(
      fetch(request.clone()).catch(() => {
        event.waitUntil(storeRequest(request.clone()));
        return new Response(JSON.stringify({ offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'retry-conversions') {
    event.waitUntil(sendStoredRequests());
  }
});

async function storeRequest(request) {
  const body = await request.formData();
  const entries = Array.from(body.entries());
  const db = await openDb();
  const tx = db.transaction('requests', 'readwrite');
  tx.objectStore('requests').add({ url: request.url, body: entries });
  await tx.done;
  await self.registration.sync.register('retry-conversions');
}

async function sendStoredRequests() {
  const db = await openDb();
  const tx = db.transaction('requests', 'readwrite');
  const store = tx.objectStore('requests');
  const all = await store.getAll();
  for (const req of all) {
    const formData = new FormData();
    req.body.forEach(([k, v]) => formData.append(k, v));
    try {
      await fetch(req.url, { method: 'POST', body: formData });
    } catch (e) {
      // keep for next retry
      continue;
    }
    store.delete(req.id);
  }
  await tx.done;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('conversion-requests', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

