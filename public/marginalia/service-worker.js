const CACHE_PREFIX = 'marginalia-static-';
const CACHE_NAME = `${CACHE_PREFIX}v68`;
const STATIC_ASSETS = [
  './',
  './index.html',
  './library.html',
  './reader.html',
  './quick-start.html',
  './pdf-viewer.html',
  './styles.css',
  './app.js',
  './reader.js',
  './pdf-viewer.js',
  './runtime.js',
  './storage-adapter.js',
  './bundle.js',
  './file-access.js',
  './folder-package.js',
  './library-package.js',
  './target-resolution.js',
  './manifest.webmanifest',
  './assets/annotator-icon.svg',
  './assets/binder-clip-0.png',
  './assets/binder-clip-1.png',
  './assets/binder-clip-2.png',
  './assets/binder-clip-3.png',
  './assets/binder-clip-4.png',
  './assets/padlock-lock.png',
  './vendor/katex/katex.min.css',
  './vendor/katex/katex.min.js',
  './vendor/pdfjs/pdf.mjs',
  './vendor/pdfjs/pdf.worker.mjs'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS.map((asset) => new URL(asset, self.registration.scope))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, fallbackForNavigation(url)));
    return;
  }

  event.respondWith(shouldRefreshFromNetwork(url) ? networkFirst(event.request, url) : cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(fallbackUrl) || caches.match(new URL('./index.html', self.registration.scope));
  }
}

function fallbackForNavigation(url) {
  const path = url.pathname.endsWith('/') ? 'index.html' : url.pathname.split('/').pop();
  if (path === 'reader.html') return new URL('./reader.html', self.registration.scope);
  return new URL('./index.html', self.registration.scope);
}

function shouldRefreshFromNetwork(url) {
  return /\.(?:html|js|css|webmanifest)$/i.test(url.pathname);
}
