export const DEFAULT_LIVE_PAGE_LIMIT = 12;
export const DEFAULT_RENDERED_SURFACE_LIMIT = 8;

export function pageWindowNumbers(centerPage, pageCount, options = {}) {
  const total = positiveInteger(pageCount);
  if (!total) return [];
  const center = clamp(positiveInteger(centerPage) || 1, 1, total);
  const limit = clamp(positiveInteger(options.limit) || DEFAULT_LIVE_PAGE_LIMIT, 1, total);
  const preferredBefore = Math.max(0, Math.round(Number(options.before ?? Math.floor((limit - 1) / 2))) || 0);
  let start = Math.max(1, center - preferredBefore);
  let end = Math.min(total, start + limit - 1);
  start = Math.max(1, end - limit + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function estimatedPageMetrics(options = {}) {
  const pageCount = positiveInteger(options.pageCount);
  if (!pageCount) return [];
  const rootTop = finiteNumber(options.rootTop, 0);
  const paddingTop = Math.max(0, finiteNumber(options.paddingTop, 0));
  const gap = Math.max(0, finiteNumber(options.gap, 0));
  const zoomScale = Math.max(0.0001, finiteNumber(options.zoomScale, 1));
  const fallbackBaseHeight = Math.max(1, finiteNumber(options.fallbackBaseHeight, 1));
  const baseHeights = options.baseHeights || [];
  let top = rootTop + paddingTop;
  const metrics = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const baseHeight = Math.max(1, finiteNumber(baseHeights[pageNumber - 1], fallbackBaseHeight));
    const height = Math.max(1, Math.ceil(baseHeight * zoomScale));
    metrics.push({
      pageNumber,
      pageIndex: pageNumber - 1,
      top,
      height,
      bottom: top + height
    });
    top += height + gap;
  }
  return metrics;
}

export function virtualGapHeight(metrics, startPage, endPage, gap = 0) {
  const start = positiveInteger(startPage);
  const end = positiveInteger(endPage);
  if (!start || !end || end < start || !Array.isArray(metrics)) return 0;
  let height = 0;
  let count = 0;
  for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
    const pageHeight = Number(metrics[pageNumber - 1]?.height);
    if (!Number.isFinite(pageHeight) || pageHeight < 0) continue;
    height += pageHeight;
    count += 1;
  }
  return height + Math.max(0, count - 1) * Math.max(0, finiteNumber(gap, 0));
}

export function evictionOrder(pageNumbers, protectedPages, currentPage) {
  const protectedSet = protectedPages instanceof Set ? protectedPages : new Set(protectedPages || []);
  const current = positiveInteger(currentPage) || 1;
  return [...new Set(pageNumbers || [])]
    .filter((pageNumber) => positiveInteger(pageNumber) && !protectedSet.has(pageNumber))
    .sort((a, b) => Math.abs(b - current) - Math.abs(a - current) || b - a);
}

function positiveInteger(value) {
  const number = Math.round(Number(value));
  return Number.isInteger(number) && number > 0 ? number : null;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
