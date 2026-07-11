const TRACE_KEY = '__marginaliaPerformance';
const DEFAULT_LIMIT = 160;

export function marginaliaPerformanceTrace(scope, options = {}) {
  const host = options.host || globalThis;
  const root = host[TRACE_KEY] || createTraceRoot(host, options.limit);
  if (!host[TRACE_KEY]) {
    Object.defineProperty(host, TRACE_KEY, {
      configurable: true,
      enumerable: false,
      value: root
    });
  }
  return scopedTrace(root, scope);
}

function createTraceRoot(host, configuredLimit) {
  const entries = [];
  const limit = Math.max(20, Math.round(Number(configuredLimit) || DEFAULT_LIMIT));
  return {
    entries,
    now: () => now(host),
    mark(scope, name, detail = {}) {
      const at = now(host);
      const entry = { type: 'mark', scope, name, at, detail: safeDetail(detail) };
      entries.push(entry);
      trim(entries, limit);
      try {
        host.performance?.mark?.(`marginalia:${scope}:${name}`);
      } catch {
        // Performance marks are supplementary; the bounded trace remains available.
      }
      return entry;
    },
    measure(scope, name, startedAt, detail = {}) {
      const at = now(host);
      const start = Number(startedAt);
      const duration = Number.isFinite(start) ? Math.max(0, at - start) : null;
      const entry = { type: 'measure', scope, name, at, duration, detail: safeDetail(detail) };
      entries.push(entry);
      trim(entries, limit);
      return entry;
    },
    snapshot() {
      return entries.map((entry) => ({ ...entry, detail: { ...entry.detail } }));
    },
    clear() {
      entries.length = 0;
    }
  };
}

function scopedTrace(root, scope) {
  const normalizedScope = String(scope || 'app');
  return {
    now: () => root.now(),
    mark: (name, detail) => root.mark(normalizedScope, String(name), detail),
    measure: (name, startedAt, detail) => root.measure(normalizedScope, String(name), startedAt, detail),
    snapshot: () => root.snapshot(),
    clear: () => root.clear()
  };
}

function safeDetail(detail) {
  if (!detail || typeof detail !== 'object') return {};
  const safe = {};
  for (const [key, value] of Object.entries(detail)) {
    if (typeof value === 'string') safe[key] = value.slice(0, 120);
    else if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value;
    else if (typeof value === 'boolean' || value == null) safe[key] = value;
  }
  return safe;
}

function now(host) {
  return host.performance?.now?.() ?? Date.now();
}

function trim(entries, limit) {
  if (entries.length > limit) entries.splice(0, entries.length - limit);
}
