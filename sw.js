/**
 * HackSkill PWA Service Worker
 * Offline Cache Coordinator
 */

const CACHE_NAME = 'hackskill-cache-v3'; // Cache version bump to clear v2
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/style.css',
  '/src/styles/theme.css',
  '/src/styles/layout.css',
  '/src/styles/components.css',
  '/src/app.js',
  '/src/store/store.js',
  '/src/store/actions.js',
  '/src/services/AIClient.js',
  '/src/services/SpeechEngine.js',
  '/src/components/search/CommandPalette.js',
  '/server.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker]: Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker]: Deleting old cache storage', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isHTML = event.request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-First for HTML: fetch from network, update cache, fallback to cache on offline failure
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              if (event.request.url.startsWith('http')) {
                cache.put(event.request, responseToCache);
              }
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match('/index.html');
          });
        })
    );
  } else {
    // Cache-First for static assets
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        });
      })
    );
  }
});
