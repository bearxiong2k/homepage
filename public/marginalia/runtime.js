export function currentStorageMode() {
  return 'indexeddb';
}

export function storageQueryPart(_mode = currentStorageMode()) {
  return '';
}

export function urlWithStorage(path, params = {}, mode = currentStorageMode()) {
  const search = new URLSearchParams(params);
  const query = search.toString();
  return `${path}${query ? `?${query}` : ''}`;
}

export function appBasePath() {
  const base = document.querySelector('base')?.getAttribute('href') || './';
  return new URL(base, location.href).pathname;
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    await navigator.serviceWorker.register(new URL('./service-worker.js', location.href), {
      scope: appBasePath()
    });
    return true;
  } catch (error) {
    console.warn('Service worker registration failed.', error);
    return false;
  }
}

export async function updateAppFromNetwork(options = {}) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('App updates require service worker support in this browser.');
  }
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 12000;
  const registration = await navigator.serviceWorker.getRegistration(appBasePath())
    || await navigator.serviceWorker.register(new URL('./service-worker.js', location.href), {
      scope: appBasePath()
    });
  const watcher = createServiceWorkerActivationWatcher(registration, timeoutMs);
  await registration.update();
  requestWaitingWorkerActivation(registration);
  if (!watcher.hasUpdate() && !registration.installing && !registration.waiting) {
    watcher.stop();
    return { updated: false };
  }
  return watcher.promise;
}

function createServiceWorkerActivationWatcher(registration, timeoutMs) {
  let settled = false;
  let timeoutId = 0;
  let updateSeen = false;
  let resolvePromise = null;
  const finish = (result) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timeoutId);
    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    registration.removeEventListener?.('updatefound', onUpdateFound);
    resolvePromise?.(result);
  };
  const watchWorker = (worker) => {
    if (!worker) return;
    updateSeen = true;
    if (worker.state === 'activated') {
      finish({ updated: true });
      return;
    }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') requestWaitingWorkerActivation(registration);
      if (worker.state === 'activated') finish({ updated: true });
    });
  };
  const onControllerChange = () => finish({ updated: true });
  const onUpdateFound = () => watchWorker(registration.installing);
  const promise = new Promise((resolve) => {
    resolvePromise = resolve;
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    registration.addEventListener?.('updatefound', onUpdateFound);
    watchWorker(registration.installing);
    watchWorker(registration.waiting);
    timeoutId = window.setTimeout(() => finish({ updated: false }), timeoutMs);
  });
  return {
    promise,
    hasUpdate: () => updateSeen,
    stop: () => finish({ updated: false })
  };
}

function requestWaitingWorkerActivation(registration) {
  registration.waiting?.postMessage?.({ type: 'MARGINALIA_SKIP_WAITING' });
}
