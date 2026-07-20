export const SPLIT_PAGE_ZOOM_DEFAULT = 1;

export const SPLIT_PAGE_ZOOM_STEPS = Object.freeze([
  0.5,
  0.67,
  0.8,
  0.9,
  1,
  1.1,
  1.25,
  1.5,
  1.75,
  2
]);

export function splitPageZoomAction(event) {
  if (!(event?.metaKey || event?.ctrlKey) || event?.altKey) return null;
  const key = String(event.key || '');
  const code = String(event.code || '');
  if (key === '+' || key === '=' || code === 'NumpadAdd') return 'in';
  if (key === '-' || key === '_' || code === 'NumpadSubtract') return 'out';
  if (key === '0' || code === 'Numpad0') return 'reset';
  return null;
}

export function nextSplitPageZoom(currentZoom, action) {
  if (action === 'reset') return SPLIT_PAGE_ZOOM_DEFAULT;
  const current = normalizeSplitPageZoom(currentZoom);
  if (action === 'in') {
    return SPLIT_PAGE_ZOOM_STEPS.find((step) => step > current + 0.001)
      ?? SPLIT_PAGE_ZOOM_STEPS.at(-1);
  }
  if (action === 'out') {
    return SPLIT_PAGE_ZOOM_STEPS.findLast((step) => step < current - 0.001)
      ?? SPLIT_PAGE_ZOOM_STEPS[0];
  }
  return current;
}

export function normalizeSplitPageZoom(value) {
  const zoom = Number(value);
  if (!Number.isFinite(zoom)) return SPLIT_PAGE_ZOOM_DEFAULT;
  return Math.min(
    SPLIT_PAGE_ZOOM_STEPS.at(-1),
    Math.max(SPLIT_PAGE_ZOOM_STEPS[0], zoom)
  );
}

export function splitPageZoomViewport(viewport, zoom) {
  const scale = normalizeSplitPageZoom(zoom);
  const width = Math.max(1, Number(viewport?.width) || 1);
  const height = Math.max(1, Number(viewport?.height) || 1);
  return {
    scale,
    width: width / scale,
    height: height / scale
  };
}

export function applySplitPageZoomSurface(doc, view, zoom, active = true) {
  const body = doc?.body;
  const root = doc?.documentElement;
  if (!body || !root?.style) return SPLIT_PAGE_ZOOM_DEFAULT;
  body.classList.toggle('split-page-zoom-active', Boolean(active));
  if (!active) {
    root.removeAttribute('data-split-page-zoom');
    root.style.removeProperty('--split-page-zoom');
    root.style.removeProperty('--split-page-viewport-width');
    root.style.removeProperty('--split-page-viewport-height');
    return SPLIT_PAGE_ZOOM_DEFAULT;
  }
  const viewport = splitPageZoomViewport({
    width: view?.innerWidth,
    height: view?.innerHeight
  }, zoom);
  root.dataset.splitPageZoom = String(viewport.scale);
  root.style.setProperty('--split-page-zoom', String(viewport.scale));
  root.style.setProperty('--split-page-viewport-width', `${viewport.width}px`);
  root.style.setProperty('--split-page-viewport-height', `${viewport.height}px`);
  return viewport.scale;
}
