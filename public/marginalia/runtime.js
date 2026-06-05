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
