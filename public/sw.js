const CACHE_NAME = 'solarscan-cache-v3';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => cache.add(url).catch((err) => console.warn('PWA Cache item skipped:', url, err)))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER intercept non-GET requests (e.g. POST /api/scan, /api/auth)
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. NEVER intercept API calls
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // 3. NEVER intercept Vite development modules, HMR, or source files
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.search.includes('t=') ||
    url.search.includes('import')
  ) {
    return;
  }

  // 4. Disable caching on local network / dev ports to prevent Safari script caching bugs
  const isDevPort = url.port === '5173' || url.port === '3000' || url.port === '8000';
  const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.startsWith('192.168.') || url.hostname.startsWith('10.');
  if (isDevPort || isLocalHost) {
    return;
  }

  // 5. Cache-first strategy for production assets, with safe fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    }).catch(() => {
      // ONLY return index.html fallback for HTML navigation requests, NEVER for JS/CSS!
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html') || caches.match('/');
      }
      return new Response('Network error', { status: 503, statusText: 'Offline' });
    })
  );
});
