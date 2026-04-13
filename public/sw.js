const CACHE_NAME = 'wisely-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/transactions',
  '/groups',
  '/profile',
  '/globals.css',
  '/wallet.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache new static assets
        if (response.status === 200 && (
          event.request.url.includes('.js') || 
          event.request.url.includes('.css') ||
          event.request.url.includes('/fonts/')
        )) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // If fetch fails (offline) and not in cache, fallback to main page for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
