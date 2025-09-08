// Service Worker for Webspind - Offline functionality and caching
const CACHE_NAME = 'webspind-v1.1.0';
const STATIC_CACHE = 'webspind-static-v1.1.0';
const DYNAMIC_CACHE = 'webspind-dynamic-v1.1.0';

const urlsToCache = [
  '/',
  '/index.html',
  '/privacy.html',
  '/pricing.html',
  '/manifest.json',
  '/js/freemium.js',
  '/js/tool-template.js'
];

const externalResources = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static resources');
        return cache.addAll(urlsToCache);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Caching external resources');
        return cache.addAll(externalResources);
      })
    ])
  );
  self.skipWaiting();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Fetch from network and cache
        return fetch(request)
          .then(fetchResponse => {
            // Don't cache if not a valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone the response
            const responseToCache = fetchResponse.clone();

            // Determine which cache to use
            const cacheName = externalResources.some(resource => request.url.includes(resource)) 
              ? DYNAMIC_CACHE 
              : STATIC_CACHE;

            caches.open(cacheName)
              .then(cache => {
                cache.put(request, responseToCache);
              });

            return fetchResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
