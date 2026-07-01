export function metricForDocumentY(metrics, documentY) {
  if (!Array.isArray(metrics) || !metrics.length) return null;
  const y = numberOrNull(documentY);
  if (y == null) return null;
  let low = 0;
  let high = metrics.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const metric = metrics[mid];
    const top = numberOrNull(metric?.top);
    const bottom = numberOrNull(metric?.bottom);
    if (top == null || bottom == null) return null;
    if (y < top) {
      high = mid - 1;
    } else if (y > bottom) {
      low = mid + 1;
    } else {
      return metric;
    }
  }
  const previous = metrics[Math.max(0, high)] || null;
  const next = metrics[Math.min(metrics.length - 1, low)] || null;
  if (!previous) return next;
  if (!next) return previous;
  return distanceToMetric(previous, y) <= distanceToMetric(next, y) ? previous : next;
}

export function pageRatioForMetric(metric, documentY) {
  const y = numberOrNull(documentY);
  const top = numberOrNull(metric?.top);
  const height = numberOrNull(metric?.height);
  if (y == null || top == null || height == null || height <= 0) return 0;
  return clamp((y - top) / height, 0, 1);
}

export function scrollYForPageMetric(metric, ratio, viewportHeight, viewportRatio = 0.35) {
  const top = numberOrNull(metric?.top);
  const height = numberOrNull(metric?.height);
  const viewHeight = numberOrNull(viewportHeight);
  if (top == null || height == null || viewHeight == null) return null;
  return Math.max(0, top + height * clamp(Number(ratio) || 0, 0, 1) - viewHeight * clamp(Number(viewportRatio) || 0, 0, 1));
}

export function normalizedScrollMetric(input) {
  const top = numberOrNull(input?.top);
  const height = numberOrNull(input?.height);
  const bottom = numberOrNull(input?.bottom);
  if (top == null) return null;
  const resolvedHeight = height != null && height >= 0
    ? height
    : bottom != null
      ? Math.max(0, bottom - top)
      : null;
  if (resolvedHeight == null) return null;
  return {
    ...input,
    top,
    height: resolvedHeight,
    bottom: top + resolvedHeight
  };
}

export function sortedScrollMetrics(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizedScrollMetric)
    .filter(Boolean)
    .sort((a, b) => a.top - b.top);
}

function distanceToMetric(metric, y) {
  const top = Number(metric?.top);
  const bottom = Number(metric?.bottom);
  if (y < top) return top - y;
  if (y > bottom) return y - bottom;
  return 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
