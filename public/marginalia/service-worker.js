const CACHE_PREFIX = 'marginalia-static-';
const APP_VERSION = '20260713-000022';
const CACHE_NAME = `${CACHE_PREFIX}${APP_VERSION}`;
const PDFJS_CMAP_ASSETS = [
  '78-EUC-H.bcmap',
  '78-EUC-V.bcmap',
  '78-H.bcmap',
  '78-RKSJ-H.bcmap',
  '78-RKSJ-V.bcmap',
  '78-V.bcmap',
  '78ms-RKSJ-H.bcmap',
  '78ms-RKSJ-V.bcmap',
  '83pv-RKSJ-H.bcmap',
  '90ms-RKSJ-H.bcmap',
  '90ms-RKSJ-V.bcmap',
  '90msp-RKSJ-H.bcmap',
  '90msp-RKSJ-V.bcmap',
  '90pv-RKSJ-H.bcmap',
  '90pv-RKSJ-V.bcmap',
  'Add-H.bcmap',
  'Add-RKSJ-H.bcmap',
  'Add-RKSJ-V.bcmap',
  'Add-V.bcmap',
  'Adobe-CNS1-0.bcmap',
  'Adobe-CNS1-1.bcmap',
  'Adobe-CNS1-2.bcmap',
  'Adobe-CNS1-3.bcmap',
  'Adobe-CNS1-4.bcmap',
  'Adobe-CNS1-5.bcmap',
  'Adobe-CNS1-6.bcmap',
  'Adobe-CNS1-UCS2.bcmap',
  'Adobe-GB1-0.bcmap',
  'Adobe-GB1-1.bcmap',
  'Adobe-GB1-2.bcmap',
  'Adobe-GB1-3.bcmap',
  'Adobe-GB1-4.bcmap',
  'Adobe-GB1-5.bcmap',
  'Adobe-GB1-UCS2.bcmap',
  'Adobe-Japan1-0.bcmap',
  'Adobe-Japan1-1.bcmap',
  'Adobe-Japan1-2.bcmap',
  'Adobe-Japan1-3.bcmap',
  'Adobe-Japan1-4.bcmap',
  'Adobe-Japan1-5.bcmap',
  'Adobe-Japan1-6.bcmap',
  'Adobe-Japan1-UCS2.bcmap',
  'Adobe-Korea1-0.bcmap',
  'Adobe-Korea1-1.bcmap',
  'Adobe-Korea1-2.bcmap',
  'Adobe-Korea1-UCS2.bcmap',
  'B5-H.bcmap',
  'B5-V.bcmap',
  'B5pc-H.bcmap',
  'B5pc-V.bcmap',
  'CNS-EUC-H.bcmap',
  'CNS-EUC-V.bcmap',
  'CNS1-H.bcmap',
  'CNS1-V.bcmap',
  'CNS2-H.bcmap',
  'CNS2-V.bcmap',
  'ETHK-B5-H.bcmap',
  'ETHK-B5-V.bcmap',
  'ETen-B5-H.bcmap',
  'ETen-B5-V.bcmap',
  'ETenms-B5-H.bcmap',
  'ETenms-B5-V.bcmap',
  'EUC-H.bcmap',
  'EUC-V.bcmap',
  'Ext-H.bcmap',
  'Ext-RKSJ-H.bcmap',
  'Ext-RKSJ-V.bcmap',
  'Ext-V.bcmap',
  'GB-EUC-H.bcmap',
  'GB-EUC-V.bcmap',
  'GB-H.bcmap',
  'GB-V.bcmap',
  'GBK-EUC-H.bcmap',
  'GBK-EUC-V.bcmap',
  'GBK2K-H.bcmap',
  'GBK2K-V.bcmap',
  'GBKp-EUC-H.bcmap',
  'GBKp-EUC-V.bcmap',
  'GBT-EUC-H.bcmap',
  'GBT-EUC-V.bcmap',
  'GBT-H.bcmap',
  'GBT-V.bcmap',
  'GBTpc-EUC-H.bcmap',
  'GBTpc-EUC-V.bcmap',
  'GBpc-EUC-H.bcmap',
  'GBpc-EUC-V.bcmap',
  'H.bcmap',
  'HKdla-B5-H.bcmap',
  'HKdla-B5-V.bcmap',
  'HKdlb-B5-H.bcmap',
  'HKdlb-B5-V.bcmap',
  'HKgccs-B5-H.bcmap',
  'HKgccs-B5-V.bcmap',
  'HKm314-B5-H.bcmap',
  'HKm314-B5-V.bcmap',
  'HKm471-B5-H.bcmap',
  'HKm471-B5-V.bcmap',
  'HKscs-B5-H.bcmap',
  'HKscs-B5-V.bcmap',
  'Hankaku.bcmap',
  'Hiragana.bcmap',
  'KSC-EUC-H.bcmap',
  'KSC-EUC-V.bcmap',
  'KSC-H.bcmap',
  'KSC-Johab-H.bcmap',
  'KSC-Johab-V.bcmap',
  'KSC-V.bcmap',
  'KSCms-UHC-H.bcmap',
  'KSCms-UHC-HW-H.bcmap',
  'KSCms-UHC-HW-V.bcmap',
  'KSCms-UHC-V.bcmap',
  'KSCpc-EUC-H.bcmap',
  'KSCpc-EUC-V.bcmap',
  'Katakana.bcmap',
  'LICENSE',
  'NWP-H.bcmap',
  'NWP-V.bcmap',
  'RKSJ-H.bcmap',
  'RKSJ-V.bcmap',
  'Roman.bcmap',
  'UniCNS-UCS2-H.bcmap',
  'UniCNS-UCS2-V.bcmap',
  'UniCNS-UTF16-H.bcmap',
  'UniCNS-UTF16-V.bcmap',
  'UniCNS-UTF32-H.bcmap',
  'UniCNS-UTF32-V.bcmap',
  'UniCNS-UTF8-H.bcmap',
  'UniCNS-UTF8-V.bcmap',
  'UniGB-UCS2-H.bcmap',
  'UniGB-UCS2-V.bcmap',
  'UniGB-UTF16-H.bcmap',
  'UniGB-UTF16-V.bcmap',
  'UniGB-UTF32-H.bcmap',
  'UniGB-UTF32-V.bcmap',
  'UniGB-UTF8-H.bcmap',
  'UniGB-UTF8-V.bcmap',
  'UniJIS-UCS2-H.bcmap',
  'UniJIS-UCS2-HW-H.bcmap',
  'UniJIS-UCS2-HW-V.bcmap',
  'UniJIS-UCS2-V.bcmap',
  'UniJIS-UTF16-H.bcmap',
  'UniJIS-UTF16-V.bcmap',
  'UniJIS-UTF32-H.bcmap',
  'UniJIS-UTF32-V.bcmap',
  'UniJIS-UTF8-H.bcmap',
  'UniJIS-UTF8-V.bcmap',
  'UniJIS2004-UTF16-H.bcmap',
  'UniJIS2004-UTF16-V.bcmap',
  'UniJIS2004-UTF32-H.bcmap',
  'UniJIS2004-UTF32-V.bcmap',
  'UniJIS2004-UTF8-H.bcmap',
  'UniJIS2004-UTF8-V.bcmap',
  'UniJISPro-UCS2-HW-V.bcmap',
  'UniJISPro-UCS2-V.bcmap',
  'UniJISPro-UTF8-V.bcmap',
  'UniJISX0213-UTF32-H.bcmap',
  'UniJISX0213-UTF32-V.bcmap',
  'UniJISX02132004-UTF32-H.bcmap',
  'UniJISX02132004-UTF32-V.bcmap',
  'UniKS-UCS2-H.bcmap',
  'UniKS-UCS2-V.bcmap',
  'UniKS-UTF16-H.bcmap',
  'UniKS-UTF16-V.bcmap',
  'UniKS-UTF32-H.bcmap',
  'UniKS-UTF32-V.bcmap',
  'UniKS-UTF8-H.bcmap',
  'UniKS-UTF8-V.bcmap',
  'V.bcmap',
  'WP-Symbol.bcmap'
];
const PDFJS_STANDARD_FONT_ASSETS = [
  'FoxitDingbats.pfb',
  'FoxitFixed.pfb',
  'FoxitFixedBold.pfb',
  'FoxitFixedBoldItalic.pfb',
  'FoxitFixedItalic.pfb',
  'FoxitSerif.pfb',
  'FoxitSerifBold.pfb',
  'FoxitSerifBoldItalic.pfb',
  'FoxitSerifItalic.pfb',
  'FoxitSymbol.pfb',
  'LICENSE_FOXIT',
  'LICENSE_LIBERATION',
  'LiberationSans-Bold.ttf',
  'LiberationSans-BoldItalic.ttf',
  'LiberationSans-Italic.ttf',
  'LiberationSans-Regular.ttf'
];
const PDFJS_ICC_ASSETS = [
  'CGATS001Compat-v2-micro.icc',
  'LICENSE'
];
const KATEX_FONT_ASSETS = [
  'KaTeX_AMS-Regular.woff2',
  'KaTeX_Caligraphic-Bold.woff2',
  'KaTeX_Caligraphic-Regular.woff2',
  'KaTeX_Fraktur-Bold.woff2',
  'KaTeX_Fraktur-Regular.woff2',
  'KaTeX_Main-Bold.woff2',
  'KaTeX_Main-BoldItalic.woff2',
  'KaTeX_Main-Italic.woff2',
  'KaTeX_Main-Regular.woff2',
  'KaTeX_Math-BoldItalic.woff2',
  'KaTeX_Math-Italic.woff2',
  'KaTeX_SansSerif-Bold.woff2',
  'KaTeX_SansSerif-Italic.woff2',
  'KaTeX_SansSerif-Regular.woff2',
  'KaTeX_Script-Regular.woff2',
  'KaTeX_Size1-Regular.woff2',
  'KaTeX_Size2-Regular.woff2',
  'KaTeX_Size3-Regular.woff2',
  'KaTeX_Size4-Regular.woff2',
  'KaTeX_Typewriter-Regular.woff2'
];
const APP_SHELLS = new Set([
  'index.html',
  'library.html',
  'reader.html',
  'reader-notes.html',
  'pdf-viewer.html',
  'quick-start.html'
]);
const STATIC_ASSETS = [
  './index.html',
  './library.html',
  './reader.html',
  './reader-notes.html',
  './quick-start.html',
  './pdf-viewer.html',
  './styles.css',
  './app.js',
  './app-version.js',
  './reader.js',
  './reader-notice.js',
  './reader-notes.js',
  './reader-session-channel.js',
  './note-markdown.js',
  './note-math.js',
  './pdf-viewer.js',
  './runtime.js',
  './storage-adapter.js',
  './bundle.js',
  './file-access.js',
  './folder-package.js',
  './library-package.js',
  './pdf-targets.js',
  './scroll-position.js',
  './pdf-page-window.js',
  './pdf-zoom-lock.js',
  './performance-trace.js',
  './ink-codec.js',
  './ink-eraser.js',
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
  ...KATEX_FONT_ASSETS.map((name) => `./vendor/katex/fonts/${name}`),
  './vendor/markdown-it/markdown-it.min.js',
  './vendor/pdfjs/pdf.mjs',
  './vendor/pdfjs/pdf.worker.mjs',
  './vendor/pdfjs/wasm/jbig2.wasm',
  './vendor/pdfjs/wasm/jbig2_nowasm_fallback.js',
  './vendor/pdfjs/wasm/openjpeg.wasm',
  './vendor/pdfjs/wasm/openjpeg_nowasm_fallback.js',
  './vendor/pdfjs/wasm/qcms_bg.wasm',
  ...PDFJS_CMAP_ASSETS.map((name) => `./vendor/pdfjs/cmaps/${name}`),
  ...PDFJS_STANDARD_FONT_ASSETS.map((name) => `./vendor/pdfjs/standard_fonts/${name}`),
  ...PDFJS_ICC_ASSETS.map((name) => `./vendor/pdfjs/iccs/${name}`)
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS.map((asset) => new URL(asset, self.registration.scope))))
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
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'MARGINALIA_GET_VERSION') {
    event.ports?.[0]?.postMessage?.({ type: 'MARGINALIA_VERSION', version: APP_VERSION });
    return;
  }
  if (event.data?.type === 'MARGINALIA_SKIP_WAITING') {
    const activation = self.skipWaiting();
    event.waitUntil?.(activation);
  }
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  if (isVersionCheck(url)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // CACHE_NAME is app-versioned. Keep cached version-N shells and modules immutable
  // so an active worker cannot mix version-N and version-N+1 resources.
  if (event.request.mode === 'navigate') {
    const shellKey = canonicalShellUrl(url);
    respondWithCacheFirst(event, event.request, {
      cacheKey: shellKey,
      fallbackKey: shellKey || fallbackForNavigation(url)
    });
    return;
  }

  const cacheKey = canonicalAssetUrl(url);
  respondWithCacheFirst(event, event.request, { cacheKey });
});

function respondWithCacheFirst(event, request, options = {}) {
  let cachePersistence = Promise.resolve();
  const responsePromise = cacheFirst(request, options.cacheKey, {
    fallbackKey: options.fallbackKey,
    deferCacheWrite: (promise) => {
      cachePersistence = Promise.resolve(promise).catch(() => {});
    }
  });
  event.respondWith(responsePromise);
  event.waitUntil?.(
    responsePromise
      .then(() => cachePersistence)
      .catch(() => {})
  );
}

async function cacheFirst(request, cacheKey = canonicalAssetUrl(new URL(request.url)), options = {}) {
  const cache = await caches.open(CACHE_NAME);
  const cached = cacheKey ? await cache.match(cacheKey) : null;
  if (cached) return cached;
  try {
    const response = await fetch(request, { cache: 'reload' });
    if (response.ok && cacheKey) {
      const cacheWrite = cache.put(cacheKey, response.clone());
      if (options.deferCacheWrite) options.deferCacheWrite(cacheWrite);
      else cacheWrite.catch(() => {});
    }
    if (response.ok) return response;
    return (options.fallbackKey ? await cache.match(options.fallbackKey) : null) || response;
  } catch (error) {
    const fallback = options.fallbackKey ? await cache.match(options.fallbackKey) : null;
    if (fallback) return fallback;
    throw error;
  }
}

function fallbackForNavigation(url) {
  return canonicalShellUrl(url) || new URL('./index.html', self.registration.scope).href;
}

function canonicalShellUrl(url) {
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return null;
  const relativePath = url.pathname.slice(scope.pathname.length);
  const shell = relativePath === '' ? 'index.html' : relativePath;
  if (!APP_SHELLS.has(shell)) return null;
  return new URL(`./${shell}`, scope).href;
}

function canonicalAssetUrl(url) {
  const canonical = new URL(url.href);
  canonical.search = '';
  canonical.hash = '';
  return canonical.href;
}

function isVersionCheck(url) {
  return url.pathname.endsWith('/app-version.js') && url.searchParams.has('version-check');
}
