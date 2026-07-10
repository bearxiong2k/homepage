import { APP_VERSION, APP_VERSION_LABEL } from './app-version.js';

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
    await navigator.serviceWorker.register(new URL('./service-worker.js', location.href), serviceWorkerOptions());
    return true;
  } catch (error) {
    console.warn('Service worker registration failed.', error);
    return false;
  }
}

export async function updateAppFromNetwork(options = {}) {
  const serviceWorkerContainer = options.serviceWorkerContainer
    || (typeof navigator !== 'undefined' ? navigator.serviceWorker : null);
  const expectedVersion = normalizeAppVersion(options.expectedVersion);
  if (!serviceWorkerContainer) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'unsupported',
      error: 'App updates require service worker support in this browser.'
    });
  }
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 12000;
  let registration;
  try {
    registration = options.registration
      || await serviceWorkerContainer.getRegistration(appBasePath())
      || await serviceWorkerContainer.register(new URL('./service-worker.js', location.href), serviceWorkerOptions());
  } catch (error) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'registration-failed',
      error
    });
  }

  let observedWorker = registration.waiting || registration.installing || null;
  const onUpdateFound = () => {
    observedWorker = registration.installing || registration.waiting || observedWorker;
  };
  registration.addEventListener?.('updatefound', onUpdateFound);
  try {
    await registration.update();
  } catch (error) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'update-check-failed',
      error
    });
  } finally {
    registration.removeEventListener?.('updatefound', onUpdateFound);
  }

  try {
    return await coordinateServiceWorkerActivation(registration, {
      candidate: registration.waiting || registration.installing || observedWorker,
      expectedVersion,
      timeoutMs,
      readWorkerVersion: options.readWorkerVersion
    });
  } catch (error) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'activation-check-failed',
      error
    });
  }
}

export async function fetchNetworkAppVersion(options = {}) {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Number(options.timeoutMs) : 5000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL('./app-version.js', location.href);
    url.searchParams.set('version-check', String(Date.now()));
    const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) return null;
    const source = await response.text();
    return parseAppVersionModuleSource(source);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function coordinateServiceWorkerActivation(registration, options = {}) {
  const expectedVersion = normalizeAppVersion(options.expectedVersion);
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Math.max(0, Number(options.timeoutMs)) : 12000;
  const deadline = Date.now() + timeoutMs;
  const remainingMs = () => Math.max(0, deadline - Date.now());
  const readWorkerVersion = options.readWorkerVersion || requestServiceWorkerVersion;
  const reportedVersion = async (worker) => {
    try {
      return normalizeAppVersion(await readWorkerVersion(worker, remainingMs()));
    } catch {
      return null;
    }
  };
  const candidate = options.candidate || registration.waiting || registration.installing || null;

  if (!candidate) {
    if (!registration.active) {
      return serviceWorkerUpdateResult('failed', {
        expectedVersion,
        reason: 'no-active-worker',
        error: 'The service worker update check completed without an active or installable worker.'
      });
    }
    const activeVersion = await reportedVersion(registration.active);
    if (!activeVersion) {
      return serviceWorkerUpdateResult('failed', {
        expectedVersion,
        reason: 'version-unavailable',
        error: 'The active service worker did not report its app version.'
      });
    }
    if (expectedVersion && activeVersion !== expectedVersion) {
      return serviceWorkerUpdateResult('failed', {
        version: activeVersion,
        expectedVersion,
        reason: 'active-version-mismatch',
        error: `The active service worker is ${activeVersion}, not ${expectedVersion}.`
      });
    }
    return serviceWorkerUpdateResult('already-current', { version: activeVersion, expectedVersion });
  }

  let state = candidate.state;
  if (!['installed', 'activated', 'redundant'].includes(state)) {
    state = await waitForServiceWorkerState(candidate, ['installed', 'activated', 'redundant'], remainingMs());
  }
  if (state === 'timed-out') {
    return serviceWorkerUpdateResult('timed-out', {
      expectedVersion,
      reason: 'installation-timeout',
      error: 'The service worker did not finish installing before the update timed out.'
    });
  }
  if (state === 'redundant') {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'installation-failed',
      error: 'The new service worker became redundant before it could activate.'
    });
  }

  const candidateVersion = await reportedVersion(candidate);
  if (!candidateVersion) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'version-unavailable',
      error: 'The new service worker did not report its app version.'
    });
  }
  if (expectedVersion && candidateVersion !== expectedVersion) {
    return serviceWorkerUpdateResult('failed', {
      version: candidateVersion,
      expectedVersion,
      reason: 'candidate-version-mismatch',
      error: `The installed service worker is ${candidateVersion}, not ${expectedVersion}.`
    });
  }

  if (state !== 'activated') {
    try {
      requestServiceWorkerActivation(candidate);
    } catch (error) {
      return serviceWorkerUpdateResult('failed', {
        version: candidateVersion,
        expectedVersion,
        reason: 'activation-request-failed',
        error
      });
    }
    state = await waitForServiceWorkerState(candidate, ['activated', 'redundant'], remainingMs());
  }
  if (state === 'timed-out') {
    return serviceWorkerUpdateResult('timed-out', {
      version: candidateVersion,
      expectedVersion,
      reason: 'activation-timeout',
      error: 'The service worker did not activate before the update timed out.'
    });
  }
  if (state !== 'activated') {
    return serviceWorkerUpdateResult('failed', {
      version: candidateVersion,
      expectedVersion,
      reason: 'activation-failed',
      error: 'The new service worker could not be activated.'
    });
  }

  const activeVersion = await reportedVersion(candidate) || candidateVersion;
  if (expectedVersion && activeVersion !== expectedVersion) {
    return serviceWorkerUpdateResult('failed', {
      version: activeVersion,
      expectedVersion,
      reason: 'activated-version-mismatch',
      error: `The activated service worker is ${activeVersion}, not ${expectedVersion}.`
    });
  }
  return serviceWorkerUpdateResult('activated', { version: activeVersion, expectedVersion });
}

export function waitForServiceWorkerState(worker, desiredStates, timeoutMs) {
  const desired = new Set(desiredStates);
  if (desired.has(worker?.state)) return Promise.resolve(worker.state);
  if (!worker?.addEventListener || timeoutMs <= 0) return Promise.resolve('timed-out');

  return new Promise((resolve) => {
    let settled = false;
    const finish = (state) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeoutId);
      worker.removeEventListener?.('statechange', onStateChange);
      resolve(state);
    };
    const onStateChange = () => {
      if (desired.has(worker.state)) finish(worker.state);
    };
    const timeoutId = globalThis.setTimeout(() => finish('timed-out'), timeoutMs);
    worker.addEventListener('statechange', onStateChange);
    onStateChange();
  });
}

export function requestServiceWorkerVersion(worker, timeoutMs = 2000) {
  if (!worker?.postMessage || typeof MessageChannel === 'undefined' || timeoutMs <= 0) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    let settled = false;
    const finish = (version) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeoutId);
      channel.port1.close?.();
      channel.port2.close?.();
      resolve(normalizeAppVersion(version));
    };
    const timeoutId = globalThis.setTimeout(() => finish(null), Math.min(timeoutMs, 2000));
    channel.port1.onmessage = (event) => {
      if (event.data?.type === 'MARGINALIA_VERSION') finish(event.data.version);
    };
    channel.port1.start?.();
    try {
      worker.postMessage({ type: 'MARGINALIA_GET_VERSION' }, [channel.port2]);
    } catch {
      finish(null);
    }
  });
}

function requestServiceWorkerActivation(worker) {
  worker?.postMessage?.({ type: 'MARGINALIA_SKIP_WAITING' });
}

function serviceWorkerUpdateResult(status, options = {}) {
  const result = {
    status,
    updated: status === 'activated',
    version: normalizeAppVersion(options.version),
    expectedVersion: normalizeAppVersion(options.expectedVersion)
  };
  if (options.reason) result.reason = options.reason;
  if (options.error) result.error = options.error instanceof Error ? options.error.message : String(options.error);
  return result;
}

function normalizeAppVersion(value) {
  const version = String(value || '').trim();
  return /^\d{8}-\d{6}$/.test(version) ? version : null;
}

function serviceWorkerOptions() {
  return {
    scope: appBasePath(),
    updateViaCache: 'none'
  };
}

export function parseAppVersionModuleSource(source, currentVersion = APP_VERSION, currentLabel = APP_VERSION_LABEL) {
  const version = normalizeAppVersion(moduleStringExport(source, 'APP_VERSION'));
  if (!version) return null;
  const label = moduleStringExport(source, 'APP_VERSION_LABEL') || `Version ${version}`;
  return { version, label, isCurrent: version === currentVersion, currentLabel };
}

function moduleStringExport(source, exportName) {
  const pattern = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*(['"])(.*?)\\1`);
  return pattern.exec(String(source || ''))?.[2] || '';
}
