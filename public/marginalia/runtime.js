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
  const currentVersion = normalizeAppVersion(options.currentVersion || APP_VERSION);
  if (!serviceWorkerContainer) {
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'unsupported',
      error: 'App updates require service worker support in this browser.'
    });
  }
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Math.max(0, Number(options.timeoutMs)) : 60000;
  const deadline = Date.now() + timeoutMs;
  const remainingMs = () => Math.max(0, deadline - Date.now());
  let registration;
  try {
    registration = options.registration
      || await waitForAppUpdatePromise(
        serviceWorkerContainer.getRegistration(appBasePath()),
        remainingMs(),
        'registration-timeout'
      )
      || await waitForAppUpdatePromise(
        serviceWorkerContainer.register(new URL('./service-worker.js', location.href), serviceWorkerOptions()),
        remainingMs(),
        'registration-timeout'
      );
  } catch (error) {
    if (isAppUpdateTimeout(error)) {
      return serviceWorkerUpdateResult('timed-out', {
        expectedVersion,
        reason: error.reason,
        error: 'The browser took too long to prepare app updates. Try again.'
      });
    }
    return serviceWorkerUpdateResult('failed', {
      expectedVersion,
      reason: 'registration-failed',
      error
    });
  }

  const initialWorker = registration.installing || registration.waiting || null;
  let observedWorker = null;
  const onUpdateFound = () => {
    observedWorker = registration.installing || observedWorker;
  };
  registration.addEventListener?.('updatefound', onUpdateFound);
  try {
    await waitForAppUpdatePromise(registration.update(), remainingMs(), 'update-check-timeout');
  } catch (error) {
    if (isAppUpdateTimeout(error)) {
      return serviceWorkerUpdateResult('timed-out', {
        expectedVersion,
        reason: error.reason,
        error: 'The browser is still checking for the update. Try Update app again in a moment.'
      });
    }
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
      candidate: observedWorker || registration.installing || registration.waiting || initialWorker,
      currentVersion,
      expectedVersion,
      timeoutMs: remainingMs(),
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
  const result = await checkNetworkAppVersion(options);
  return ['available', 'current'].includes(result.status) ? result : null;
}

export async function checkNetworkAppVersion(options = {}) {
  const timeoutMs = Number.isFinite(Number(options.timeoutMs)) ? Math.max(0, Number(options.timeoutMs)) : 12000;
  const controller = new AbortController();
  const currentVersion = normalizeAppVersion(options.currentVersion || APP_VERSION);
  const currentLabel = options.currentLabel || APP_VERSION_LABEL;
  const fetchAppVersion = options.fetch || globalThis.fetch;
  let timedOut = false;
  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const url = new URL(options.url || './app-version.js', options.baseUrl || location.href);
    url.searchParams.set('version-check', String(Date.now()));
    const response = await fetchAppVersion(url, { cache: 'no-store', signal: controller.signal });
    if (!response.ok) {
      return networkVersionCheckResult('failed', {
        reason: 'http-error',
        error: `The update check returned HTTP ${response.status}. Try again.`
      });
    }
    const source = await response.text();
    const parsed = parseAppVersionModuleSource(source, currentVersion, currentLabel);
    if (!parsed) {
      return networkVersionCheckResult('failed', {
        reason: 'invalid-response',
        error: 'The hosted update information could not be read. Try again in a moment.'
      });
    }
    const status = compareAppVersions(parsed.version, currentVersion) > 0 ? 'available' : 'current';
    return networkVersionCheckResult(status, parsed);
  } catch (error) {
    if (timedOut || error?.name === 'AbortError') {
      return networkVersionCheckResult('timed-out', {
        reason: 'check-timeout',
        error: 'The update check took too long. Check the connection and try again.'
      });
    }
    return networkVersionCheckResult('failed', {
      reason: 'network-error',
      error: 'Could not reach the update server. Check the connection and try again.'
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export async function coordinateServiceWorkerActivation(registration, options = {}) {
  const expectedVersion = normalizeAppVersion(options.expectedVersion);
  const currentVersion = normalizeAppVersion(options.currentVersion);
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
        error: 'The installed app update could not be verified. Check for updates again.'
      });
    }
    if (expectedVersion && activeVersion !== expectedVersion) {
      if (currentVersion && compareAppVersions(activeVersion, currentVersion) > 0) {
        return serviceWorkerUpdateResult('already-current', { version: activeVersion, expectedVersion });
      }
      return serviceWorkerUpdateResult('failed', {
        version: activeVersion,
        expectedVersion,
        reason: 'update-not-ready',
        error: 'The checked update is not ready yet. Try Update app again.'
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
      error: 'The downloaded app update could not be verified. Check for updates again.'
    });
  }
  if (currentVersion && compareAppVersions(candidateVersion, currentVersion) <= 0) {
    return serviceWorkerUpdateResult('failed', {
      version: candidateVersion,
      expectedVersion,
      reason: 'worker-not-newer',
      error: 'The browser did not download a newer app build. Check for updates again.'
    });
  }
  if (expectedVersion && candidateVersion !== expectedVersion) {
    if (!currentVersion) {
      return serviceWorkerUpdateResult('failed', {
        version: candidateVersion,
        expectedVersion,
        reason: 'candidate-version-mismatch',
        error: 'The hosted update changed while it was being prepared. Check for updates again.'
      });
    }
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
  if (currentVersion && compareAppVersions(activeVersion, currentVersion) <= 0) {
    return serviceWorkerUpdateResult('failed', {
      version: activeVersion,
      expectedVersion,
      reason: 'activated-version-not-newer',
      error: 'The activated app build was not newer than the current one. Check for updates again.'
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

function waitForAppUpdatePromise(promise, timeoutMs, reason) {
  if (timeoutMs <= 0) return Promise.reject(appUpdateTimeout(reason));
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      globalThis.clearTimeout(timeoutId);
      callback(value);
    };
    const timeoutId = globalThis.setTimeout(() => finish(reject, appUpdateTimeout(reason)), timeoutMs);
    Promise.resolve(promise).then(
      (value) => finish(resolve, value),
      (error) => finish(reject, error)
    );
  });
}

function appUpdateTimeout(reason) {
  const error = new Error('App update timed out.');
  error.name = 'MarginaliaAppUpdateTimeout';
  error.reason = reason;
  return error;
}

function isAppUpdateTimeout(error) {
  return error?.name === 'MarginaliaAppUpdateTimeout';
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

export function compareAppVersions(left, right) {
  const normalizedLeft = normalizeAppVersion(left);
  const normalizedRight = normalizeAppVersion(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 0;
  return normalizedLeft > normalizedRight ? 1 : -1;
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
  const label = appVersionLabel(version);
  return { version, label, isCurrent: version === currentVersion, currentLabel };
}

function appVersionLabel(version) {
  const match = /^(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/.exec(version);
  if (!match) return `Version ${version}`;
  const [, year, month, day, hour, minute, second] = match;
  return `Version ${year}-${month}-${day} ${hour}:${minute}:${second} CST`;
}

function networkVersionCheckResult(status, options = {}) {
  return {
    status,
    ...(options.version ? { version: options.version } : {}),
    ...(options.label ? { label: options.label } : {}),
    ...(typeof options.isCurrent === 'boolean' ? { isCurrent: options.isCurrent } : {}),
    ...(options.currentLabel ? { currentLabel: options.currentLabel } : {}),
    ...(options.reason ? { reason: options.reason } : {}),
    ...(options.error ? { error: String(options.error) } : {})
  };
}

function moduleStringExport(source, exportName) {
  const pattern = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*(['"])(.*?)\\1`);
  return pattern.exec(String(source || ''))?.[2] || '';
}
