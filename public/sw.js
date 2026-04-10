
/**
 * Basic Service Worker for PWA functionality.
 * Handles fetch events and basic caching strategy.
 */
const CACHE_NAME = 'wisely-v1';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Simple network-first or bypass strategy for prototyping
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
