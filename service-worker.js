const VERSION = 'v2026-04-10-01';
const CACHE_PREFIX = 'ebd-fiel';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-${VERSION}`;
const HTML_CACHE = `${CACHE_PREFIX}-html-${VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './licao.html',
  './manifest.json',
  './ebdfiel.png?v=2',
  './img/fundo.png',
  './img/logo-adultos.png?v=2',
  './img/logo-jovens.png?v=2',
  './img/2trimestreadultos.png',
  './img/2trimestrejovens.png',
  './podcasts/capa-adultos.png?v=1',
  './podcasts/capa-jovens.png?v=1',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)).catch(() => null)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE, HTML_CACHE].includes(key))
        .map(key => caches.delete(key))
    );

    if ('navigationPreload' in self.registration) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {}
    }

    await self.clients.claim();

    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientList.forEach(client => {
      client.postMessage({ type: 'SW_UPDATED', version: VERSION });
    });
  })());
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'CLEAR_OLD_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)));
    })());
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (
    url.origin !== self.location.origin &&
    !url.hostname.includes('fonts.googleapis.com') &&
    !url.hostname.includes('cdnjs.cloudflare.com') &&
    !url.hostname.includes('fonts.gstatic.com')
  ) {
    return;
  }

  if (
    url.pathname.includes('/admin-panel') ||
    url.pathname.includes('/admin') ||
    url.pathname.includes('/__/') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
    return;
  }

  const destination = request.destination;

  if (destination === 'style' || destination === 'script' || destination === 'worker' || destination === 'font') {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (destination === 'document') {
    event.respondWith(networkFirst(request, HTML_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

async function handleNavigation(event) {
  const preload = await event.preloadResponse;
  if (preload) {
    const cache = await caches.open(HTML_CACHE);
    cache.put(event.request, preload.clone());
    return preload;
  }

  try {
    const fresh = await fetch(event.request, { cache: 'no-store' });
    const cache = await caches.open(HTML_CACHE);
    cache.put(event.request, fresh.clone());
    return fresh;
  } catch (_) {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    return caches.match('./index.html');
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request, { cache: 'no-store' });
    if (isCacheable(fresh, request)) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (_) {
    const cached =
      await cache.match(request, { ignoreSearch: false }) ||
      await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    throw _;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request, { ignoreSearch: false });

  const networkPromise = fetch(request)
    .then(response => {
      if (isCacheable(response, request)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || fetch(request);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached =
    await cache.match(request, { ignoreSearch: false }) ||
    await caches.match(request, { ignoreSearch: true });

  if (cached) return cached;

  const fresh = await fetch(request);
  if (isCacheable(fresh, request)) {
    cache.put(request, fresh.clone());
  }
  return fresh;
}

function isCacheable(response, request) {
  if (!response || response.status !== 200) return false;
  if (response.type === 'opaque') return false;

  const url = new URL(request.url);
  if (url.pathname.includes('/admin-panel') || url.pathname.includes('/admin')) return false;

  return true;
}