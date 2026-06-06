import * as pdfjsLib from './vendor/pdfjs/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', location.href).href;
const PDFJS_ASSETS = {
  cMapUrl: new URL('./vendor/pdfjs/cmaps/', location.href).href,
  cMapPacked: true,
  standardFontDataUrl: new URL('./vendor/pdfjs/standard_fonts/', location.href).href,
  wasmUrl: new URL('./vendor/pdfjs/wasm/', location.href).href,
  iccUrl: new URL('./vendor/pdfjs/iccs/', location.href).href
};

const params = new URLSearchParams(location.search);
const fileUrl = params.get('file');
const pdfViewport = document.querySelector('#pdfViewport');
const root = document.querySelector('#pdfRoot');
const statusEl = document.querySelector('#pdfStatus');
const zoomOutBtn = document.querySelector('#zoomOutBtn');
const zoomInBtn = document.querySelector('#zoomInBtn');
const zoomSelect = document.querySelector('#zoomSelect');
const fitWidthBtn = document.querySelector('#fitWidthBtn');
const horizontalPanLockBtn = document.querySelector('#horizontalPanLockBtn');
const toolbar = document.querySelector('#pdfToolbar');
const toolbarToggleBtn = document.querySelector('#toolbarToggleBtn');
const pageRecords = new Map();
const renderQueue = [];
const renderingPages = new Set();
const renderedPages = new Set();
const MAX_RENDER_CONCURRENCY = 2;
const MAX_DEVICE_SCALE = 2.5;
const MIN_PAGE_SCALE = 0.35;
const MAX_PAGE_SCALE = 10;
const ZOOM_PRESETS = [
  0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3
];
let activeRenderCount = 0;
let observer = null;
let pdfDocument = null;
let zoomRatio = 1;
let zoomGeneration = 0;
let selectionOverlayRaf = 0;
let textSelectionDrag = null;
let horizontalPanLocked = false;
let lastHorizontalScroll = pdfViewport?.scrollLeft || 0;
let lastNonReadingViewportWidth = 0;

if (params.get('embedded') === 'reader') {
  document.documentElement.classList.add('reader-embedded');
}

zoomOutBtn?.addEventListener('click', () => stepZoom(-1));
zoomInBtn?.addEventListener('click', () => stepZoom(1));
fitWidthBtn?.addEventListener('click', () => setZoomMode('fit-width'));
horizontalPanLockBtn?.addEventListener('click', toggleHorizontalPanLock);
toolbarToggleBtn?.addEventListener('click', toggleToolbarCollapsed);
zoomSelect?.addEventListener('change', () => {
  setExplicitZoom(Number(zoomSelect.value));
});
document.addEventListener('wheel', handlePdfWheel, { passive: false });
document.addEventListener('selectionchange', scheduleSelectionOverlayUpdate);
document.addEventListener('pointerdown', beginTextSelectionDrag, true);
document.addEventListener('pointermove', updateTextSelectionDrag, true);
document.addEventListener('pointerup', finishTextSelectionDrag, true);
document.addEventListener('pointercancel', finishTextSelectionDrag, true);
document.addEventListener('reader-reading-mode-change', scheduleZoomRefresh);
window.addEventListener('resize', scheduleZoomRefresh);
pdfViewport?.addEventListener('scroll', handlePdfViewportScroll, { passive: true });

syncHorizontalPanLock();

renderPdf().catch((error) => {
  document.documentElement.dataset.pdfError = error.message || 'PDF render failed.';
  if (statusEl) statusEl.textContent = error.message;
});

async function renderPdf() {
  if (!fileUrl) throw new Error('Missing PDF source.');
  status('Loading PDF...');
  const loadingTask = pdfjsLib.getDocument({ url: fileUrl, ...PDFJS_ASSETS });
  pdfDocument = await loadingTask.promise;
  document.documentElement.dataset.pdfPageCount = String(pdfDocument.numPages);
  status(`Preparing ${pdfDocument.numPages} pages...`);
  syncZoomControls();

  observer = new IntersectionObserver(handlePageIntersections, {
    root: null,
    rootMargin: '900px 0px',
    threshold: 0.01
  });

  await createPageShell(pdfDocument, 1);
  await renderPageNumber(1, { priority: true });
  document.documentElement.dataset.pdfReady = 'true';
  status('');
  queueInitialVisiblePages();
  createRemainingPageShells(pdfDocument).catch((error) => {
    document.documentElement.dataset.pdfError = error.message || 'PDF page preparation failed.';
    status(error.message || 'PDF page preparation failed.');
  });
}

async function createRemainingPageShells(pdf) {
  for (let pageNumber = 2; pageNumber <= pdf.numPages; pageNumber += 1) {
    await createPageShell(pdf, pageNumber);
    if (pageNumber % 8 === 0) await nextFrame();
  }
  document.documentElement.dataset.pdfPagesReady = 'true';
  queueInitialVisiblePages();
}

async function createPageShell(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const pageEl = document.createElement('section');
  pageEl.className = 'pdf-page';
  pageEl.id = `pdf-page-${pageNumber}`;
  pageEl.dataset.anchorId = `pdf-page-${pageNumber}`;
  pageEl.dataset.pageId = `pdf-page-${pageNumber}`;
  pageEl.dataset.pdfPageIndex = String(pageNumber - 1);
  pageEl.dataset.pdfPageLabel = String(pageNumber);
  pageEl.dataset.renderState = 'pending';

  const placeholder = document.createElement('div');
  placeholder.className = 'pdf-page-placeholder';
  placeholder.textContent = `Page ${pageNumber}`;
  pageEl.append(placeholder);
  root.append(pageEl);
  pageRecords.set(pageNumber, {
    page,
    pageEl,
    baseViewport,
    cssScale: 1,
    renderTask: null,
    textLayer: null
  });
  updatePageGeometry(pageRecords.get(pageNumber));
  syncZoomControls();
  observer?.observe(pageEl);
  notifyPageChanged(pageNumber);
}

function handlePageIntersections(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const pageNumber = pageNumberFromElement(entry.target);
    if (!pageNumber) continue;
    queuePageRender(pageNumber);
  }
  drainRenderQueue();
}

function queueInitialVisiblePages() {
  for (const { pageNumber } of visiblePageRecords(900)) {
    queuePageRender(pageNumber);
  }
  drainRenderQueue();
}

function visiblePageRecords(margin = 0) {
  const visible = [];
  const topLimit = -margin;
  const bottomLimit = window.innerHeight + margin;
  for (const [pageNumber, record] of pageRecords) {
    const rect = record.pageEl.getBoundingClientRect();
    if (rect.bottom < topLimit) continue;
    if (rect.top > bottomLimit) break;
    visible.push({ pageNumber, record });
  }
  return visible;
}

async function renderPageNumber(pageNumber, options = {}) {
  if (renderedPages.has(pageNumber) || renderingPages.has(pageNumber)) return;
  const record = pageRecords.get(pageNumber);
  if (!record) return;
  const generation = zoomGeneration;
  const renderToken = Symbol(`render-${pageNumber}`);
  record.renderToken = renderToken;
  renderingPages.add(pageNumber);
  record.pageEl.dataset.renderState = 'rendering';
  try {
    await renderPage(record, generation, renderToken);
    if (record.renderToken === renderToken && generation === zoomGeneration) {
      renderedPages.add(pageNumber);
      record.pageEl.dataset.renderState = 'rendered';
      observer?.unobserve(record.pageEl);
    }
  } catch (error) {
    if (!isRenderCancelled(error)) throw error;
  } finally {
    renderingPages.delete(pageNumber);
    if (!options.priority) {
      activeRenderCount = Math.max(0, activeRenderCount - 1);
      drainRenderQueue();
    }
  }
}

function queuePageRender(pageNumber) {
  if (renderedPages.has(pageNumber) || renderingPages.has(pageNumber) || renderQueue.includes(pageNumber)) return;
  renderQueue.push(pageNumber);
}

function drainRenderQueue() {
  while (activeRenderCount < MAX_RENDER_CONCURRENCY && renderQueue.length) {
    const pageNumber = renderQueue.shift();
    activeRenderCount += 1;
    renderPageNumber(pageNumber).catch((error) => {
      document.documentElement.dataset.pdfError = error.message || 'PDF page render failed.';
      status(error.message || 'PDF page render failed.');
    });
  }
}

async function renderPage(record, generation, renderToken) {
  const { page, pageEl, cssScale } = record;
  const outputScale = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_SCALE);
  const canvas = document.createElement('canvas');
  canvas.className = 'pdf-page-canvas';
  const context = canvas.getContext('2d', { alpha: false });
  const cssViewport = page.getViewport({ scale: cssScale });
  const outputViewport = page.getViewport({ scale: cssScale * outputScale });
  const textLayerEl = document.createElement('div');
  textLayerEl.className = 'textLayer pdf-page-text-layer';
  textLayerEl.setAttribute('aria-label', `Page ${pageNumberFromElement(pageEl)} text`);
  textLayerEl.style.setProperty('--total-scale-factor', String(cssScale));
  canvas.width = Math.ceil(outputViewport.width);
  canvas.height = Math.ceil(outputViewport.height);
  canvas.style.width = `${Math.ceil(cssViewport.width)}px`;
  canvas.style.height = `${Math.ceil(cssViewport.height)}px`;
  pageEl.style.width = `${Math.ceil(cssViewport.width)}px`;
  pageEl.style.height = `${Math.ceil(cssViewport.height)}px`;
  pageEl.style.minHeight = `${Math.ceil(cssViewport.height)}px`;

  record.renderTask?.cancel();
  record.textLayer?.cancel();
  record.renderTask = page.render({
    canvasContext: context,
    viewport: outputViewport,
    transform: null
  });
  await record.renderTask.promise;
  record.renderTask = null;
  if (record.renderToken !== renderToken || generation !== zoomGeneration) return;

  pageEl.querySelector('.pdf-page-placeholder')?.remove();
  const oldCanvas = pageEl.querySelector('.pdf-page-canvas');
  const oldTextLayer = pageEl.querySelector('.pdf-page-text-layer');
  if (oldCanvas) oldCanvas.replaceWith(canvas);
  else pageEl.prepend(canvas);
  oldTextLayer?.remove();
  canvas.after(textLayerEl);
  notifyPageChanged(pageNumberFromElement(pageEl));
  await renderTextLayer(record, textLayerEl, cssViewport, generation, renderToken);
}

async function renderTextLayer(record, textLayerEl, viewport, generation, renderToken) {
  try {
    const textContent = await record.page.getTextContent();
    if (record.renderToken !== renderToken || generation !== zoomGeneration) return;
    record.textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerEl,
      viewport
    });
    await record.textLayer.render();
    if (record.renderToken !== renderToken || generation !== zoomGeneration) return;
    record.pageEl.dataset.textLayer = textLayerEl.childElementCount ? 'ready' : 'empty';
    notifyPageChanged(pageNumberFromElement(record.pageEl));
    scheduleSelectionOverlayUpdate();
  } catch (error) {
    if (!isRenderCancelled(error)) {
      record.pageEl.dataset.textLayer = 'failed';
      console.warn('PDF text layer failed', error);
    }
  }
}

function updatePageGeometry(record) {
  if (!record) return;
  record.cssScale = pageCssScale(record.baseViewport);
  const viewport = record.page.getViewport({ scale: record.cssScale });
  record.pageEl.style.width = `${Math.ceil(viewport.width)}px`;
  record.pageEl.style.height = `${Math.ceil(viewport.height)}px`;
  record.pageEl.style.minHeight = `${Math.ceil(viewport.height)}px`;
  record.pageEl.dataset.zoom = String(Number(record.cssScale.toFixed(4)));
}

function pageCssScale(viewport) {
  return clamp(fitScaleForViewport(viewport) * zoomRatio, MIN_PAGE_SCALE, MAX_PAGE_SCALE);
}

function fitScaleForViewport(viewport) {
  return Math.max(1, availablePdfWidth()) / Math.max(1, viewport.width);
}

function availablePdfWidth() {
  const embedded = document.documentElement.classList.contains('reader-embedded');
  const readingMode = document.body?.classList.contains('reader-reading-mode');
  const viewportWidth = pdfViewport?.clientWidth;
  if (embedded && readingMode && lastNonReadingViewportWidth > 0) return lastNonReadingViewportWidth;
  if (Number.isFinite(viewportWidth) && viewportWidth > 0) {
    if (embedded && !readingMode) lastNonReadingViewportWidth = viewportWidth;
    return viewportWidth;
  }
  if (!embedded) return window.innerWidth;
  if (readingMode && lastNonReadingViewportWidth > 0) return lastNonReadingViewportWidth;
  const sideNoteWidth = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reader-side-note-layer-width'));
  const availableWidth = window.innerWidth - (Number.isFinite(sideNoteWidth) ? sideNoteWidth : 0);
  if (!readingMode) lastNonReadingViewportWidth = availableWidth;
  return availableWidth;
}

function setZoomMode(mode) {
  if (mode !== 'fit-width') return;
  zoomRatio = 1;
  refreshZoomedPages();
}

function setExplicitZoom(ratio) {
  if (!Number.isFinite(ratio)) return;
  zoomRatio = clamp(ratio, ZOOM_PRESETS[0], ZOOM_PRESETS[ZOOM_PRESETS.length - 1]);
  refreshZoomedPages();
}

let zoomRefreshRaf = 0;
function scheduleZoomRefresh() {
  if (zoomRefreshRaf) return;
  zoomRefreshRaf = requestAnimationFrame(() => {
    zoomRefreshRaf = 0;
    refreshZoomedPages();
  });
}

function refreshZoomedPages() {
  if (!pdfDocument) return;
  const anchor = captureScrollAnchor();
  const horizontalPan = captureHorizontalPan();
  zoomGeneration += 1;
  renderQueue.length = 0;
  activeRenderCount = 0;
  renderedPages.clear();
  for (const [pageNumber, record] of pageRecords) {
    record.renderTask?.cancel();
    record.textLayer?.cancel();
    record.renderTask = null;
    record.textLayer = null;
    renderingPages.delete(pageNumber);
    updatePageGeometry(record);
    record.pageEl.dataset.renderState = 'pending';
    observer?.observe(record.pageEl);
    notifyPageChanged(pageNumber);
  }
  syncZoomControls();
  restoreScrollAnchor(anchor);
  restoreHorizontalPan(horizontalPan);
  queueInitialVisiblePages();
}

function captureHorizontalPan() {
  if (!pdfViewport) return null;
  const maxScroll = Math.max(0, pdfViewport.scrollWidth - pdfViewport.clientWidth);
  return {
    left: pdfViewport.scrollLeft,
    ratio: maxScroll > 0 ? pdfViewport.scrollLeft / maxScroll : 0
  };
}

function restoreHorizontalPan(pan) {
  if (!pdfViewport || !pan) return;
  requestAnimationFrame(() => {
    const maxScroll = Math.max(0, pdfViewport.scrollWidth - pdfViewport.clientWidth);
    pdfViewport.scrollLeft = maxScroll > 0
      ? clamp(pan.ratio * maxScroll, 0, maxScroll)
      : 0;
    lastHorizontalScroll = pdfViewport.scrollLeft;
  });
}

function stepZoom(direction) {
  const current = currentRepresentativeZoomRatio();
  const sorted = ZOOM_PRESETS;
  const index = sorted.findIndex((item) => item >= current - 0.001);
  const nextIndex = direction > 0
    ? Math.min(sorted.length - 1, index < 0 ? 0 : index + (sorted[index] <= current + 0.001 ? 1 : 0))
    : Math.max(0, (index < 0 ? sorted.length : index) - 1);
  setExplicitZoom(sorted[nextIndex]);
}

function currentRepresentativeScale() {
  const firstRecord = pageRecords.values().next().value;
  return firstRecord?.cssScale || 1;
}

function currentRepresentativeZoomRatio() {
  return zoomRatio;
}

function syncZoomControls() {
  document.documentElement.dataset.pdfZoomMode = zoomRatio === 1 ? 'fit-width' : 'relative';
  document.documentElement.dataset.pdfZoom = String(Number(currentRepresentativeScale().toFixed(4)));
  document.documentElement.dataset.pdfZoomRatio = String(Number(zoomRatio.toFixed(4)));
  if (!zoomSelect) return;
  const closest = ZOOM_PRESETS.reduce((best, item) => (
    Math.abs(item - zoomRatio) < Math.abs(best - zoomRatio) ? item : best
  ), ZOOM_PRESETS[0]);
  zoomSelect.value = String(closest);
}

function captureScrollAnchor() {
  const viewportY = window.innerHeight * 0.35;
  let fallback = null;
  for (const [pageNumber, record] of pageRecords) {
    const rect = record.pageEl.getBoundingClientRect();
    if (!fallback && rect.bottom >= 0) fallback = { pageNumber, ratio: 0 };
    if (rect.top <= viewportY && rect.bottom >= viewportY) {
      return {
        pageNumber,
        ratio: rect.height ? (viewportY - rect.top) / rect.height : 0
      };
    }
    if (rect.top > viewportY) break;
  }
  return fallback;
}

function restoreScrollAnchor(anchor) {
  if (!anchor) return;
  const record = pageRecords.get(anchor.pageNumber);
  if (!record) return;
  const rect = record.pageEl.getBoundingClientRect();
  const targetTop = window.scrollY + rect.top + rect.height * clamp(anchor.ratio, 0, 1);
  window.scrollTo(window.scrollX, Math.max(0, targetTop - window.innerHeight * 0.35));
}

function beginTextSelectionDrag(event) {
  if (event.button !== 0 || event.pointerType === 'touch') return;
  const highlight = event.target?.closest?.('.reader-highlight[data-annotation-id]');
  if (highlight) {
    clearNativeSelection();
    notifyReaderHighlightClick(highlight.dataset.annotationId);
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const textLayer = event.target?.closest?.('.pdf-page-text-layer');
  if (!textLayer) return;
  const start = textPositionFromPoint(event.clientX, event.clientY);
  if (!start) return;
  textSelectionDrag = {
    pointerId: event.pointerId,
    start,
    startX: event.clientX,
    startY: event.clientY,
    selecting: false,
    layer: textLayer,
    annotationId: event.target?.closest?.('.reader-highlight[data-annotation-id]')?.dataset?.annotationId || ''
  };
  event.preventDefault();
  event.stopPropagation();
  try {
    textLayer.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture is best effort; document-level listeners still finish the drag.
  }
}

function updateTextSelectionDrag(event) {
  if (!textSelectionDrag || event.pointerId !== textSelectionDrag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  const distance = Math.hypot(event.clientX - textSelectionDrag.startX, event.clientY - textSelectionDrag.startY);
  if (!textSelectionDrag.selecting && distance < 3) return;
  textSelectionDrag.selecting = true;
  updateNativeSelectionFromPoints(textSelectionDrag.start, event.clientX, event.clientY);
}

function finishTextSelectionDrag(event) {
  if (!textSelectionDrag || event.pointerId !== textSelectionDrag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  if (textSelectionDrag.selecting) {
    updateNativeSelectionFromPoints(textSelectionDrag.start, event.clientX, event.clientY);
  } else {
    clearNativeSelection();
    notifyReaderHighlightClick(textSelectionDrag.annotationId);
  }
  try {
    textSelectionDrag.layer?.releasePointerCapture?.(event.pointerId);
  } catch {
    // The pointer may already be released after a normal pointerup.
  }
  textSelectionDrag = null;
  scheduleSelectionOverlayUpdate();
}

function notifyReaderHighlightClick(annotationId) {
  if (!annotationId || window.parent === window) return;
  window.parent.postMessage({
    type: 'reader-highlight-click',
    annotationId
  }, location.origin);
}

function clearNativeSelection() {
  document.getSelection()?.removeAllRanges();
  clearSelectionOverlay();
}

function updateNativeSelectionFromPoints(start, clientX, clientY) {
  const end = textPositionFromPoint(clientX, clientY);
  if (!start || !end) return;
  const [from, to] = compareTextPositions(start, end) <= 0 ? [start, end] : [end, start];
  if (from.node === to.node && from.offset === to.offset) return;
  const range = document.createRange();
  range.setStart(from.node, from.offset);
  range.setEnd(to.node, to.offset);
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function textPositionFromPoint(clientX, clientY) {
  const pageEl = pageFromPoint(clientX, clientY);
  const textLayer = pageEl?.querySelector?.('.pdf-page-text-layer');
  if (!textLayer?.childElementCount) return null;
  const lines = textLayerLines(textLayer);
  if (!lines.length) return null;
  const line = nearestTextLine(lines, clientY);
  return textPositionInLine(line, clientX);
}

function pageFromPoint(clientX, clientY) {
  const direct = document.elementFromPoint(clientX, clientY)?.closest?.('.pdf-page');
  if (direct) return direct;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const record of pageRecords.values()) {
    const rect = record.pageEl.getBoundingClientRect();
    const distance = clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
    if (distance < nearestDistance) {
      nearest = record.pageEl;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function textLayerLines(textLayer) {
  const spans = Array.from(textLayer.querySelectorAll('span'))
    .map((span) => {
      const node = span.firstChild;
      const text = node?.nodeType === Node.TEXT_NODE ? node.nodeValue || '' : '';
      const rect = span.getBoundingClientRect();
      if (!text || rect.width <= 0 || rect.height <= 0) return null;
      return {
        span,
        node,
        text,
        rect,
        mid: (rect.top + rect.bottom) / 2,
        height: rect.height
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
  const lines = [];
  for (const item of spans) {
    const line = lines.find((candidate) => Math.abs(item.mid - candidate.mid) <= Math.max(3, candidate.height * 0.72));
    if (!line) {
      lines.push({
        mid: item.mid,
        top: item.rect.top,
        bottom: item.rect.bottom,
        height: item.height,
        items: [item]
      });
      continue;
    }
    line.items.push(item);
    line.top = Math.min(line.top, item.rect.top);
    line.bottom = Math.max(line.bottom, item.rect.bottom);
    line.height = line.bottom - line.top;
    line.mid = (line.top + line.bottom) / 2;
  }
  for (const line of lines) {
    line.items.sort((a, b) => a.rect.left - b.rect.left);
  }
  return lines;
}

function nearestTextLine(lines, clientY) {
  return lines.reduce((best, line) => {
    const distance = clientY < line.top ? line.top - clientY : clientY > line.bottom ? clientY - line.bottom : 0;
    if (!best) return { line, distance };
    if (distance < best.distance) return { line, distance };
    const midDistance = Math.abs(clientY - line.mid);
    const bestMidDistance = Math.abs(clientY - best.line.mid);
    return distance === best.distance && midDistance < bestMidDistance ? { line, distance } : best;
  }, null)?.line || lines[0];
}

function textPositionInLine(line, clientX) {
  const items = line.items;
  const first = items[0];
  const last = items[items.length - 1];
  if (clientX <= first.rect.left) return { node: first.node, offset: 0 };
  if (clientX >= last.rect.right) return { node: last.node, offset: last.text.length };
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (clientX >= item.rect.left && clientX <= item.rect.right) {
      return { node: item.node, offset: offsetForSpanX(item, clientX) };
    }
    const next = items[index + 1];
    if (next && clientX > item.rect.right && clientX < next.rect.left) {
      const midpoint = item.rect.right + (next.rect.left - item.rect.right) / 2;
      return clientX < midpoint
        ? { node: item.node, offset: item.text.length }
        : { node: next.node, offset: 0 };
    }
  }
  return { node: last.node, offset: last.text.length };
}

function offsetForSpanX(item, clientX) {
  const textLength = item.text.length;
  if (textLength <= 1 || item.rect.width <= 0) return clientX < (item.rect.left + item.rect.right) / 2 ? 0 : textLength;
  const ratio = clamp((clientX - item.rect.left) / item.rect.width, 0, 1);
  return clamp(Math.round(ratio * textLength), 0, textLength);
}

function compareTextPositions(a, b) {
  if (a.node === b.node) return a.offset - b.offset;
  const first = document.createRange();
  const second = document.createRange();
  first.setStart(a.node, a.offset);
  first.collapse(true);
  second.setStart(b.node, b.offset);
  second.collapse(true);
  const result = first.compareBoundaryPoints(Range.START_TO_START, second);
  first.detach?.();
  second.detach?.();
  return result;
}

function scheduleSelectionOverlayUpdate() {
  if (selectionOverlayRaf) return;
  selectionOverlayRaf = requestAnimationFrame(() => {
    selectionOverlayRaf = 0;
    renderSelectionOverlay();
  });
}

function renderSelectionOverlay() {
  clearSelectionOverlay();
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
  const ranges = [];
  for (let index = 0; index < selection.rangeCount; index += 1) {
    const range = selection.getRangeAt(index);
    if (!range.collapsed) ranges.push(range);
  }
  if (!ranges.length) return;
  for (const record of pageRecords.values()) {
    const textLayer = record.pageEl.querySelector('.pdf-page-text-layer');
    if (!textLayer?.childElementCount) continue;
    const pageRects = [];
    for (const range of ranges) {
      if (!safeRangeIntersectsNode(range, textLayer)) continue;
      pageRects.push(...selectionRectsForPage(range, record.pageEl));
    }
    const rows = selectionRows(pageRects);
    if (!rows.length) continue;
    const layer = getSelectionLayer(record.pageEl);
    for (const row of rows) {
      const rect = document.createElement('div');
      rect.className = 'pdf-selection-rect';
      Object.assign(rect.style, {
        left: `${row.left}px`,
        top: `${row.top}px`,
        width: `${row.right - row.left}px`,
        height: `${row.bottom - row.top}px`
      });
      layer.append(rect);
    }
  }
}

function selectionRectsForPage(range, pageEl) {
  const pageRect = pageEl.getBoundingClientRect();
  return Array.from(range.getClientRects())
    .filter((rect) => rect.width > 0 && rect.height > 0 && rectIntersects(rect, pageRect))
    .map((rect) => ({
      left: clamp(rect.left - pageRect.left, 0, pageRect.width),
      top: clamp(rect.top - pageRect.top, 0, pageRect.height),
      right: clamp(rect.right - pageRect.left, 0, pageRect.width),
      bottom: clamp(rect.bottom - pageRect.top, 0, pageRect.height)
    }))
    .filter((rect) => rect.right - rect.left > 0 && rect.bottom - rect.top > 0);
}

function selectionRows(rects) {
  const rows = [];
  for (const rect of rects.sort((a, b) => a.top - b.top || a.left - b.left)) {
    const mid = (rect.top + rect.bottom) / 2;
    const row = rows.find((candidate) => Math.abs(mid - candidate.mid) <= Math.max(3, candidate.height * 0.7));
    if (!row) {
      rows.push({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        mid,
        height: rect.bottom - rect.top
      });
      continue;
    }
    row.left = Math.min(row.left, rect.left);
    row.right = Math.max(row.right, rect.right);
    row.top = Math.min(row.top, rect.top);
    row.bottom = Math.max(row.bottom, rect.bottom);
    row.height = row.bottom - row.top;
    row.mid = (row.top + row.bottom) / 2;
  }
  return rows;
}

function clearSelectionOverlay() {
  document.querySelectorAll('.pdf-selection-layer').forEach((layer) => {
    layer.replaceChildren();
  });
}

function getSelectionLayer(pageEl) {
  let layer = pageEl.querySelector(':scope > .pdf-selection-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'pdf-selection-layer';
    pageEl.append(layer);
  }
  return layer;
}

function safeRangeIntersectsNode(range, node) {
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

function rectIntersects(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function handlePdfWheel(event) {
  if (event.ctrlKey || event.metaKey) return;
  const left = horizontalPanLocked ? 0 : wheelDelta(event.deltaX, event.deltaMode);
  const top = wheelDelta(event.deltaY, event.deltaMode);
  if (!left && !top) return;
  event.preventDefault();
  if (left && pdfViewport) {
    pdfViewport.scrollBy({ left, behavior: 'auto' });
  }
  if (top) {
    window.scrollBy({
      left: 0,
      top,
      behavior: 'auto'
    });
  }
  scheduleSelectionOverlayUpdate();
}

function handlePdfViewportScroll() {
  if (!pdfViewport) return;
  if (Math.round(pdfViewport.scrollLeft) === Math.round(lastHorizontalScroll)) return;
  lastHorizontalScroll = pdfViewport.scrollLeft;
  scheduleSelectionOverlayUpdate();
}

function toggleHorizontalPanLock() {
  horizontalPanLocked = !horizontalPanLocked;
  syncHorizontalPanLock();
}

function syncHorizontalPanLock() {
  document.documentElement.dataset.pdfHorizontalPan = horizontalPanLocked ? 'locked' : 'unlocked';
  if (!horizontalPanLockBtn) return;
  horizontalPanLockBtn.classList.toggle('is-active', horizontalPanLocked);
  horizontalPanLockBtn.setAttribute('aria-pressed', String(horizontalPanLocked));
  horizontalPanLockBtn.title = horizontalPanLocked ? 'Unlock horizontal movement' : 'Lock horizontal movement';
  horizontalPanLockBtn.setAttribute('aria-label', horizontalPanLocked ? 'Unlock horizontal movement' : 'Lock horizontal movement');
}

function toggleToolbarCollapsed() {
  const collapsed = !toolbar?.classList.contains('is-collapsed');
  toolbar?.classList.toggle('is-collapsed', collapsed);
  if (!toolbarToggleBtn) return;
  toolbarToggleBtn.textContent = collapsed ? '▶' : '◀';
  toolbarToggleBtn.title = collapsed ? 'Expand PDF controls' : 'Collapse PDF controls';
  toolbarToggleBtn.setAttribute('aria-label', collapsed ? 'Expand PDF controls' : 'Collapse PDF controls');
  toolbarToggleBtn.setAttribute('aria-expanded', String(!collapsed));
}

function wheelDelta(value, mode) {
  if (mode === WheelEvent.DOM_DELTA_LINE) return value * 16;
  if (mode === WheelEvent.DOM_DELTA_PAGE) return value * window.innerHeight;
  return value;
}

function isRenderCancelled(error) {
  return error?.name === 'RenderingCancelledException'
    || error?.name === 'AbortException'
    || /cancel/i.test(error?.message || '');
}

function pageNumberFromElement(element) {
  const pageIndex = Number(element?.dataset?.pdfPageIndex);
  return Number.isFinite(pageIndex) ? pageIndex + 1 : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function status(message) {
  if (statusEl) statusEl.textContent = message;
}

function notifyPageChanged(pageNumber) {
  document.dispatchEvent(new CustomEvent('pdf-page-ready', {
    detail: { pageNumber }
  }));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
