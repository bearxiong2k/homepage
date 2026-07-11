import * as pdfjsLib from './vendor/pdfjs/pdf.mjs';
import {
  metricForDocumentY,
  pageRatioForMetric,
  readAheadPageNumbers,
  scrollYForPageMetric
} from './scroll-position.js';
import {
  DEFAULT_LIVE_PAGE_LIMIT,
  DEFAULT_RENDERED_SURFACE_LIMIT,
  estimatedPageMetrics,
  evictionOrder,
  pageWindowNumbers,
  virtualGapHeight
} from './pdf-page-window.js';
import { marginaliaPerformanceTrace } from './performance-trace.js';

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
const zoomInput = document.querySelector('#zoomInput');
const fitWidthBtn = document.querySelector('#fitWidthBtn');
const pageNumberInput = document.querySelector('#pageNumberInput');
const pageTotalLabel = document.querySelector('#pageTotalLabel');
const pageIndicator = document.querySelector('#pageIndicator');
const horizontalPanLockBtn = document.querySelector('#horizontalPanLockBtn');
const toolbar = document.querySelector('#pdfToolbar');
const toolbarToggleBtn = document.querySelector('#toolbarToggleBtn');
const pageRecords = new Map();
const orderedPageRecordEntries = [];
const pageShellPromises = new Map();
const renderQueue = [];
const textLayerQueue = [];
const renderingPages = new Map();
const renderedPages = new Set();
const renderingTextLayers = new Map();
const renderedTextLayers = new Set();
let pageMetrics = [];
const MAX_RENDER_CONCURRENCY = 2;
const MAX_SCROLL_RENDER_CONCURRENCY = 1;
const MAX_TEXT_LAYER_CONCURRENCY = 1;
const MAX_DEVICE_SCALE = 2.5;
const MIN_PAGE_SCALE = 0.35;
const MAX_PAGE_SCALE = 10;
const ZOOM_STEP_RATIO = 0.1;
const PDF_READ_AHEAD_PREVIOUS = 1;
const PDF_READ_AHEAD_NEXT = 2;
const PDF_PAGE_GAP = 18;
const pdfPerformance = marginaliaPerformanceTrace('pdf');
let activeRenderCount = 0;
let activeTextLayerRenderCount = 0;
let observer = null;
let pdfDocument = null;
let zoomScale = null;
let zoomRatio = 1;
let zoomGeneration = 0;
let selectionOverlayRaf = 0;
let pageMetricsRaf = 0;
let pageControlsRaf = 0;
let textSelectionDrag = null;
let horizontalPanLocked = false;
let pdfWindowScrolling = false;
let pdfWindowScrollIdleTimer = 0;
let readAheadRequestId = 0;
let lockedHorizontalScrollLeft = 0;
let lastNonReadingViewportWidth = 0;
let currentPageNumber = 1;
let lastDispatchedCurrentPageNumber = null;
let viewerSuspended = document.visibilityState === 'hidden';
let pageWindowGeneration = 0;
let pageBaseHeights = [];
let fallbackBaseHeight = 1;
let lifecycleGeneration = 0;
let pdfLoadingTask = null;

if (params.get('embedded') === 'reader') {
  document.documentElement.classList.add('reader-embedded');
}

zoomOutBtn?.addEventListener('click', () => stepZoom(-1));
zoomInBtn?.addEventListener('click', () => stepZoom(1));
fitWidthBtn?.addEventListener('click', () => setZoomMode('fit-width'));
horizontalPanLockBtn?.addEventListener('click', toggleHorizontalPanLock);
toolbarToggleBtn?.addEventListener('click', toggleToolbarCollapsed);
zoomInput?.addEventListener('change', commitZoomInput);
zoomInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    clearPdfInputError(zoomInput);
    syncZoomControls({ force: true });
    zoomInput.blur();
    return;
  }
  if (event.key !== 'Enter') return;
  event.preventDefault();
  zoomInput.blur();
});
pageNumberInput?.addEventListener('change', commitPageNumberInput);
pageNumberInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    clearPdfInputError(pageNumberInput);
    syncPageControls({ force: true });
    pageNumberInput.blur();
    return;
  }
  if (event.key !== 'Enter') return;
  event.preventDefault();
  commitPageNumberInput();
  pageNumberInput.blur();
});
document.addEventListener('selectionchange', scheduleSelectionOverlayUpdate);
document.addEventListener('pointerdown', beginTextSelectionDrag, true);
document.addEventListener('pointermove', updateTextSelectionDrag, true);
document.addEventListener('pointerup', finishTextSelectionDrag, true);
document.addEventListener('pointercancel', finishTextSelectionDrag, true);
document.addEventListener('reader-reading-mode-change', scheduleZoomRefresh);
document.addEventListener('reader-side-note-layout-change', handleReaderSideNoteLayoutChange);
document.addEventListener('reader-pdf-ensure-page', handleReaderPdfEnsurePage);
document.addEventListener('visibilitychange', handleViewerVisibilityChange);
window.addEventListener('pagehide', () => suspendPdfViewer('pagehide'));
window.addEventListener('beforeunload', teardownPdfViewer);
window.addEventListener('message', handleReaderLifecycleMessage);
window.addEventListener('resize', scheduleZoomRefresh);
window.addEventListener('scroll', handlePdfWindowScroll, { passive: true });
pdfViewport?.addEventListener('scroll', handlePdfViewportScroll, { passive: true });

syncHorizontalPanLock();
installPdfLongTaskObserver();

renderPdf().catch((error) => {
  document.documentElement.dataset.pdfError = error.message || 'PDF render failed.';
  if (statusEl) statusEl.textContent = error.message;
});

async function renderPdf() {
  if (!fileUrl) throw new Error('Missing PDF source.');
  const startedAt = pdfPerformance.now();
  pdfPerformance.mark('load-start');
  status('Loading PDF...');
  pdfLoadingTask = pdfjsLib.getDocument({ url: fileUrl, ...PDFJS_ASSETS });
  pdfDocument = await pdfLoadingTask.promise;
  pdfPerformance.measure('worker-ready', startedAt, { pages: pdfDocument.numPages });
  document.documentElement.dataset.pdfPageCount = String(pdfDocument.numPages);
  if (pageTotalLabel) pageTotalLabel.textContent = `/ ${pdfDocument.numPages}`;
  status(`Preparing ${pdfDocument.numPages} pages...`);
  syncZoomControls();
  syncPageControls();

  observer = new IntersectionObserver(handlePageIntersections, {
    root: null,
    rootMargin: '900px 0px',
    threshold: 0.01
  });

  await updatePageWindow(1);
  await renderPageNumber(1);
  await queueReadAheadPages(1, { forceDrain: true });
  document.documentElement.dataset.pdfReady = 'true';
  document.documentElement.dataset.pdfVirtualized = 'true';
  status('');
  queueInitialVisiblePages({ priority: true });
  updatePdfDiagnostics('ready');
  pdfPerformance.measure('usable', startedAt, livePdfCounts());
}

async function createPageShell(pdf, pageNumber) {
  if (pageRecords.has(pageNumber)) return pageRecords.get(pageNumber);
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  pageBaseHeights[pageNumber - 1] = baseViewport.height;
  if (pageNumber === 1 || fallbackBaseHeight <= 1) fallbackBaseHeight = Math.max(1, baseViewport.height);
  const pageEl = document.createElement('section');
  pageEl.className = 'pdf-page';
  pageEl.id = `pdf-page-${pageNumber}`;
  pageEl.dataset.anchorId = `pdf-page-${pageNumber}`;
  pageEl.dataset.pageId = `pdf-page-${pageNumber}`;
  pageEl.dataset.pdfPageIndex = String(pageNumber - 1);
  pageEl.dataset.pdfPageLabel = String(pageNumber);
  pageEl.dataset.renderState = 'pending';
  pageEl.setAttribute('aria-label', `PDF page ${pageNumber}`);

  const placeholder = document.createElement('div');
  placeholder.className = 'pdf-page-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.textContent = `Page ${pageNumber}`;
  pageEl.append(placeholder);
  const record = {
    page,
    pageEl,
    baseViewport,
    cssScale: 1,
    renderTask: null,
    textLayer: null,
    textLayerEl: null,
    lastVisibleAt: performance.now(),
    shellNotified: false
  };
  pageRecords.set(pageNumber, record);
  insertOrderedPageRecord(pageNumber, record);
  updatePageGeometry(record);
  syncZoomControls();
  return record;
}

async function ensurePageShell(pageNumber) {
  const normalized = normalizedPageNumber(pageNumber);
  if (!pdfDocument || !normalized) return null;
  if (pageRecords.has(normalized)) return pageRecords.get(normalized);
  if (pageShellPromises.has(normalized)) return pageShellPromises.get(normalized);
  const promise = createPageShell(pdfDocument, normalized)
    .finally(() => pageShellPromises.delete(normalized));
  pageShellPromises.set(normalized, promise);
  return promise;
}

async function updatePageWindow(centerPage = currentPageNumber, options = {}) {
  if (!pdfDocument || (viewerSuspended && !options.allowWhileSuspended)) return;
  const normalized = normalizedPageNumber(centerPage);
  if (!normalized) return;
  const generation = ++pageWindowGeneration;
  const anchor = visiblePageState();
  const desiredPages = pageWindowNumbers(normalized, pdfDocument.numPages, {
    limit: DEFAULT_LIVE_PAGE_LIMIT
  });
  await Promise.all(desiredPages.map((pageNumber) => ensurePageShell(pageNumber)));
  if (generation !== pageWindowGeneration || !pdfDocument) return;
  const desired = new Set(desiredPages);
  for (const [pageNumber] of [...orderedPageRecords()]) {
    if (!desired.has(pageNumber)) evictPageRecord(pageNumber);
  }
  rebuildPageMetrics();
  rebuildVirtualPageLayout();
  restoreVirtualScrollAnchor(anchor);
  updatePdfDiagnostics('window');
}

function rebuildVirtualPageLayout() {
  if (!pdfDocument || !root) return;
  observer?.disconnect();
  const nodes = [];
  let previousPage = 0;
  for (const [pageNumber, record] of orderedPageRecords()) {
    if (pageNumber > previousPage + 1) nodes.push(createVirtualGap(previousPage + 1, pageNumber - 1));
    nodes.push(record.pageEl);
    previousPage = pageNumber;
  }
  if (previousPage < pdfDocument.numPages) nodes.push(createVirtualGap(previousPage + 1, pdfDocument.numPages));
  root.replaceChildren(...nodes);
  for (const [pageNumber, record] of orderedPageRecords()) {
    observer?.observe(record.pageEl);
    if (!record.shellNotified) {
      record.shellNotified = true;
      notifyPageChanged(pageNumber, 'shell');
    }
  }
}

function createVirtualGap(startPage, endPage) {
  const gap = document.createElement('div');
  gap.className = 'pdf-page-gap';
  gap.dataset.startPage = String(startPage);
  gap.dataset.endPage = String(endPage);
  gap.setAttribute('aria-hidden', 'true');
  gap.style.height = `${Math.max(1, virtualGapHeight(pageMetrics, startPage, endPage, PDF_PAGE_GAP))}px`;
  return gap;
}

function evictPageRecord(pageNumber) {
  const record = pageRecords.get(pageNumber);
  if (!record) return;
  record.renderToken = Symbol(`evicted-${pageNumber}`);
  record.renderTask?.cancel?.();
  record.textLayer?.cancel?.();
  observer?.unobserve(record.pageEl);
  releasePageSurface(pageNumber, record, { keepPlaceholder: false });
  record.page?.cleanup?.();
  record.pageEl.remove();
  pageRecords.delete(pageNumber);
  pageShellPromises.delete(pageNumber);
  const orderedIndex = orderedPageRecordEntries.findIndex(([existing]) => existing === pageNumber);
  if (orderedIndex >= 0) orderedPageRecordEntries.splice(orderedIndex, 1);
  removeQueuedPage(pageNumber);
  notifyPageChanged(pageNumber, 'evicted');
}

function removeQueuedPage(pageNumber) {
  for (let index = renderQueue.length - 1; index >= 0; index -= 1) {
    if (renderQueue[index].pageNumber === pageNumber) renderQueue.splice(index, 1);
  }
  for (let index = textLayerQueue.length - 1; index >= 0; index -= 1) {
    if (textLayerQueue[index] === pageNumber) textLayerQueue.splice(index, 1);
  }
  renderedPages.delete(pageNumber);
  renderedTextLayers.delete(pageNumber);
  renderingPages.delete(pageNumber);
  renderingTextLayers.delete(pageNumber);
}

function restoreVirtualScrollAnchor(anchor) {
  if (!anchor) return;
  const metric = pageMetrics[anchor.pageNumber - 1];
  const nextY = scrollYForPageMetric(metric, anchor.ratio, window.innerHeight);
  if (Number.isFinite(nextY) && Math.abs(nextY - window.scrollY) > 0.5) {
    window.scrollTo(window.scrollX, nextY);
  }
}

function orderedPageRecords() {
  return orderedPageRecordEntries;
}

function insertOrderedPageRecord(pageNumber, record) {
  let low = 0;
  let high = orderedPageRecordEntries.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (orderedPageRecordEntries[middle][0] < pageNumber) low = middle + 1;
    else high = middle;
  }
  orderedPageRecordEntries.splice(low, 0, [pageNumber, record]);
}

function normalizedPageNumber(value) {
  const pageNumber = Number(value);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) return null;
  if (pdfDocument && pageNumber > pdfDocument.numPages) return null;
  return pageNumber;
}

function handleReaderPdfEnsurePage(event) {
  const pageNumber = normalizedPageNumber(event.detail?.pageNumber)
    || normalizedPageNumber(Number(event.detail?.pageIndex) + 1);
  if (!pageNumber) return;
  queueReadAheadPages(pageNumber, { forceDrain: true, scrollToPage: Boolean(event.detail?.scrollToPage) })
    .catch((error) => {
      document.documentElement.dataset.pdfError = error.message || 'PDF page preparation failed.';
      status(error.message || 'PDF page preparation failed.');
    });
}

function handlePageIntersections(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const pageNumber = pageNumberFromElement(entry.target);
    if (!pageNumber) continue;
    const record = pageRecords.get(pageNumber);
    if (record) record.lastVisibleAt = performance.now();
    queuePageRender(pageNumber, { priority: true });
  }
  drainRenderQueue();
}

function queueInitialVisiblePages(options = {}) {
  if (viewerSuspended) return;
  for (const { pageNumber } of visiblePageRecords(900)) {
    queuePageRender(pageNumber, options);
  }
  drainRenderQueue();
}

function visiblePageRecords(margin = 0) {
  const visible = [];
  const topLimit = -margin;
  const bottomLimit = window.innerHeight + margin;
  for (const [pageNumber, record] of orderedPageRecords()) {
    const rect = record.pageEl.getBoundingClientRect();
    if (rect.bottom < topLimit) continue;
    if (rect.top > bottomLimit) break;
    visible.push({ pageNumber, record });
  }
  return visible;
}

async function queueReadAheadPages(pageNumber = currentPageNumber, options = {}) {
  if (!pdfDocument || viewerSuspended) return;
  const targetPage = normalizedPageNumber(pageNumber);
  if (!targetPage) return;
  const requestId = ++readAheadRequestId;
  await updatePageWindow(targetPage);
  if (!pdfDocument || viewerSuspended || (requestId !== readAheadRequestId && !options.forceDrain)) return;
  const pages = readAheadPageNumbers(targetPage, pdfDocument.numPages, {
    previousCount: PDF_READ_AHEAD_PREVIOUS,
    nextCount: PDF_READ_AHEAD_NEXT
  });
  await Promise.all(pages.map((page) => ensurePageShell(page)));
  if (!pdfDocument || viewerSuspended || (requestId !== readAheadRequestId && !options.forceDrain)) return;
  queuePriorityPageRenders(pages);
  if (options.scrollToPage) scrollToPageNumber(targetPage);
  if (options.forceDrain) forceDrainRenderQueue();
  else drainRenderQueue();
}

function requestReadAheadPages(pageNumber = currentPageNumber, options = {}) {
  queueReadAheadPages(pageNumber, options).catch((error) => {
    document.documentElement.dataset.pdfError = error.message || 'PDF page preparation failed.';
    status(error.message || 'PDF page preparation failed.');
  });
}

async function renderPageNumber(pageNumber) {
  if (renderedPages.has(pageNumber) || renderingPages.has(pageNumber)) return;
  const record = pageRecords.get(pageNumber);
  if (!record) return;
  const generation = zoomGeneration;
  const renderToken = Symbol(`render-${pageNumber}`);
  record.renderToken = renderToken;
  renderingPages.set(pageNumber, renderToken);
  record.pageEl.dataset.renderState = 'rendering';
  try {
    await renderPage(record, generation, renderToken);
    if (record.renderToken === renderToken && generation === zoomGeneration) {
      record.lastVisibleAt = performance.now();
      renderedPages.add(pageNumber);
      record.pageEl.dataset.renderState = 'rendered';
      observer?.unobserve(record.pageEl);
      evictRenderedSurfaces();
      updatePdfDiagnostics('render');
    }
  } catch (error) {
    if (!isRenderCancelled(error)) throw error;
  } finally {
    if (renderingPages.get(pageNumber) === renderToken) renderingPages.delete(pageNumber);
  }
}

function queuePageRender(pageNumber, options = {}) {
  if (viewerSuspended) return;
  const normalized = normalizedPageNumber(pageNumber);
  if (!normalized || renderedPages.has(normalized) || renderingPages.has(normalized)) return;
  const existingIndex = renderQueue.findIndex((entry) => entry.pageNumber === normalized);
  if (existingIndex >= 0) {
    if (options.priority) {
      renderQueue[existingIndex].priority = true;
      const [entry] = renderQueue.splice(existingIndex, 1);
      renderQueue.unshift(entry);
    }
    return;
  }
  const entry = { pageNumber: normalized, priority: Boolean(options.priority) };
  if (entry.priority) renderQueue.unshift(entry);
  else renderQueue.push(entry);
}

function queuePriorityPageRenders(pageNumbers) {
  const entries = [];
  for (const pageNumber of pageNumbers) {
    const normalized = normalizedPageNumber(pageNumber);
    if (!normalized || renderedPages.has(normalized) || renderingPages.has(normalized)) continue;
    const existingIndex = renderQueue.findIndex((entry) => entry.pageNumber === normalized);
    if (existingIndex >= 0) renderQueue.splice(existingIndex, 1);
    entries.push({ pageNumber: normalized, priority: true });
  }
  if (entries.length) renderQueue.unshift(...entries);
}

function drainRenderQueue() {
  if (viewerSuspended) return;
  const maxConcurrency = pdfWindowScrolling ? MAX_SCROLL_RENDER_CONCURRENCY : MAX_RENDER_CONCURRENCY;
  while (activeRenderCount < maxConcurrency && renderQueue.length) {
    const entry = nextRenderQueueEntry();
    if (!entry) break;
    startQueuedPageRender(entry.pageNumber);
  }
}

function nextRenderQueueEntry() {
  if (!pdfWindowScrolling) return renderQueue.shift() || null;
  const priorityIndex = renderQueue.findIndex((entry) => entry.priority);
  if (priorityIndex < 0) return null;
  const [entry] = renderQueue.splice(priorityIndex, 1);
  return entry;
}

function startQueuedPageRender(pageNumber) {
  activeRenderCount += 1;
  renderPageNumber(pageNumber)
    .catch((error) => {
      document.documentElement.dataset.pdfError = error.message || 'PDF page render failed.';
      status(error.message || 'PDF page render failed.');
    })
    .finally(() => {
      activeRenderCount = Math.max(0, activeRenderCount - 1);
      drainRenderQueue();
      drainTextLayerQueue();
    });
}

function forceDrainRenderQueue() {
  const wasScrolling = pdfWindowScrolling;
  pdfWindowScrolling = false;
  drainRenderQueue();
  pdfWindowScrolling = wasScrolling;
}

async function renderPage(record, generation, renderToken) {
  const { page, pageEl, cssScale } = record;
  const outputScale = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_SCALE);
  const canvas = document.createElement('canvas');
  canvas.className = 'pdf-page-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `Rendered image of PDF page ${pageNumberFromElement(pageEl)}`);
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
  const renderTask = page.render({
    canvasContext: context,
    viewport: outputViewport,
    transform: null
  });
  record.renderTask = renderTask;
  await renderTask.promise;
  if (record.renderTask === renderTask) record.renderTask = null;
  if (record.renderToken !== renderToken || generation !== zoomGeneration) return;

  pageEl.querySelector('.pdf-page-placeholder')?.remove();
  const oldCanvas = pageEl.querySelector('.pdf-page-canvas');
  const oldTextLayer = pageEl.querySelector('.pdf-page-text-layer');
  if (oldCanvas) oldCanvas.replaceWith(canvas);
  else pageEl.prepend(canvas);
  oldTextLayer?.remove();
  canvas.after(textLayerEl);
  record.textLayerEl = textLayerEl;
  record.pageEl.dataset.textLayer = 'pending';
  notifyPageChanged(pageNumberFromElement(pageEl), 'canvas');
  queueTextLayerRender(pageNumberFromElement(pageEl));
  drainTextLayerQueue();
}

function evictRenderedSurfaces(limit = DEFAULT_RENDERED_SURFACE_LIMIT) {
  if (renderedPages.size <= limit) return;
  const protectedPages = new Set(readAheadPageNumbers(currentPageNumber, pdfDocument?.numPages || currentPageNumber, {
    previousCount: PDF_READ_AHEAD_PREVIOUS,
    nextCount: PDF_READ_AHEAD_NEXT
  }));
  const candidates = evictionOrder([...renderedPages], protectedPages, currentPageNumber)
    .sort((a, b) => (
      Number(pageRecords.get(a)?.lastVisibleAt || 0) - Number(pageRecords.get(b)?.lastVisibleAt || 0)
      || Math.abs(b - currentPageNumber) - Math.abs(a - currentPageNumber)
    ));
  while (renderedPages.size > limit && candidates.length) {
    const pageNumber = candidates.shift();
    const record = pageRecords.get(pageNumber);
    if (record) releasePageSurface(pageNumber, record);
  }
}

function releasePageSurface(pageNumber, record, options = {}) {
  if (!record) return;
  record.renderToken = Symbol(`released-${pageNumber}`);
  record.renderTask?.cancel?.();
  record.textLayer?.cancel?.();
  record.renderTask = null;
  record.textLayer = null;
  record.textLayerEl = null;
  const canvas = record.pageEl.querySelector('.pdf-page-canvas');
  if (canvas) {
    canvas.width = 1;
    canvas.height = 1;
    canvas.remove();
  }
  record.pageEl.querySelector('.pdf-page-text-layer')?.remove();
  record.pageEl.querySelector('.pdf-selection-layer')?.remove();
  if (options.keepPlaceholder !== false && !record.pageEl.querySelector('.pdf-page-placeholder')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'pdf-page-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.textContent = `Page ${pageNumber}`;
    record.pageEl.append(placeholder);
  }
  record.pageEl.dataset.renderState = 'pending';
  record.pageEl.dataset.textLayer = 'pending';
  renderedPages.delete(pageNumber);
  renderedTextLayers.delete(pageNumber);
  renderingPages.delete(pageNumber);
  renderingTextLayers.delete(pageNumber);
  removeQueuedPage(pageNumber);
  observer?.observe(record.pageEl);
  notifyPageChanged(pageNumber, 'released');
}

function queueTextLayerRender(pageNumber, options = {}) {
  const normalized = normalizedPageNumber(pageNumber);
  if (!normalized || renderedTextLayers.has(normalized) || renderingTextLayers.has(normalized)) return;
  if (!pageRecords.get(normalized)?.textLayerEl) return;
  const existingIndex = textLayerQueue.indexOf(normalized);
  if (existingIndex >= 0) {
    if (options.priority) {
      textLayerQueue.splice(existingIndex, 1);
      textLayerQueue.unshift(normalized);
    }
    return;
  }
  if (options.priority) textLayerQueue.unshift(normalized);
  else textLayerQueue.push(normalized);
}

function drainTextLayerQueue() {
  if (viewerSuspended || pdfWindowScrolling) return;
  while (activeTextLayerRenderCount < MAX_TEXT_LAYER_CONCURRENCY && textLayerQueue.length) {
    const pageNumber = textLayerQueue.shift();
    startTextLayerRender(pageNumber);
  }
}

function startTextLayerRender(pageNumber) {
  const record = pageRecords.get(pageNumber);
  if (!record?.textLayerEl || renderedTextLayers.has(pageNumber) || renderingTextLayers.has(pageNumber)) return;
  const textLayerToken = record.renderToken;
  activeTextLayerRenderCount += 1;
  renderingTextLayers.set(pageNumber, textLayerToken);
  renderTextLayerForPage(pageNumber, record)
    .catch((error) => {
      if (!isRenderCancelled(error)
        && record.renderToken === textLayerToken
        && renderingTextLayers.get(pageNumber) === textLayerToken) {
        record.pageEl.dataset.textLayer = 'failed';
        syncPdfPageAccessibility(record);
        console.warn('PDF text layer failed', error);
      }
    })
    .finally(() => {
      if (renderingTextLayers.get(pageNumber) === textLayerToken) renderingTextLayers.delete(pageNumber);
      activeTextLayerRenderCount = Math.max(0, activeTextLayerRenderCount - 1);
      drainTextLayerQueue();
    });
}

async function renderTextLayerForPage(pageNumber, record) {
  const generation = zoomGeneration;
  const renderToken = record.renderToken;
  const textLayerEl = record.textLayerEl;
  if (!textLayerEl) return;
  record.pageEl.dataset.textLayer = 'rendering';
  const viewport = record.page.getViewport({ scale: record.cssScale });
  const rendered = await renderTextLayer(record, textLayerEl, viewport, generation, renderToken);
  if (rendered && record.renderToken === renderToken && generation === zoomGeneration) renderedTextLayers.add(pageNumber);
}

async function renderTextLayer(record, textLayerEl, viewport, generation, renderToken) {
  try {
    const textContent = await record.page.getTextContent();
    if (record.renderToken !== renderToken || generation !== zoomGeneration) return false;
    record.textLayer = new pdfjsLib.TextLayer({
      textContentSource: textContent,
      container: textLayerEl,
      viewport
    });
    await record.textLayer.render();
    if (record.renderToken !== renderToken || generation !== zoomGeneration) return false;
    record.pageEl.dataset.textLayer = textLayerEl.childElementCount ? 'ready' : 'empty';
    syncPdfPageAccessibility(record);
    notifyPageChanged(pageNumberFromElement(record.pageEl), 'text');
    scheduleSelectionOverlayUpdate();
    return true;
  } catch (error) {
    if (!isRenderCancelled(error)) {
      record.pageEl.dataset.textLayer = 'failed';
      syncPdfPageAccessibility(record);
      console.warn('PDF text layer failed', error);
    }
    return false;
  }
}

function syncPdfPageAccessibility(record) {
  const canvas = record?.pageEl?.querySelector?.('.pdf-page-canvas');
  const textLayer = record?.textLayerEl;
  if (!canvas) return;
  const hasText = record.pageEl.dataset.textLayer === 'ready' && Boolean(textLayer?.textContent?.trim());
  if (hasText) {
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    textLayer?.removeAttribute('aria-hidden');
    return;
  }
  canvas.removeAttribute('aria-hidden');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `Rendered image of PDF page ${pageNumberFromElement(record.pageEl)}`);
  if (textLayer && record.pageEl.dataset.textLayer !== 'pending' && record.pageEl.dataset.textLayer !== 'rendering') {
    textLayer.setAttribute('aria-hidden', 'true');
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
  schedulePageMetricsRefresh();
}

function schedulePageMetricsRefresh() {
  if (viewerSuspended || pageMetricsRaf) return;
  pageMetricsRaf = requestAnimationFrame(() => {
    pageMetricsRaf = 0;
    const anchor = visiblePageState();
    rebuildPageMetrics();
    rebuildVirtualPageLayout();
    restoreVirtualScrollAnchor(anchor);
    syncPageControls();
  });
}

function rebuildPageMetrics() {
  if (!pdfDocument) {
    pageMetrics = [];
    return;
  }
  const rootRect = root.getBoundingClientRect();
  const rootStyle = getComputedStyle(root);
  const paddingTop = Number.parseFloat(rootStyle.paddingTop) || 0;
  const gap = Number.parseFloat(rootStyle.rowGap || rootStyle.gap) || PDF_PAGE_GAP;
  pageMetrics = estimatedPageMetrics({
    pageCount: pdfDocument.numPages,
    rootTop: window.scrollY + rootRect.top,
    paddingTop,
    gap,
    zoomScale: Number.isFinite(zoomScale) ? zoomScale : 1,
    fallbackBaseHeight,
    baseHeights: pageBaseHeights
  });
}

function schedulePageControlsSync() {
  if (viewerSuspended || pageControlsRaf) return;
  pageControlsRaf = requestAnimationFrame(() => {
    pageControlsRaf = 0;
    syncPageControls();
  });
}

function pageCssScale(viewport) {
  if (!Number.isFinite(zoomScale)) zoomScale = fitScaleForViewport(viewport) * zoomRatio;
  return clamp(zoomScale, MIN_PAGE_SCALE, MAX_PAGE_SCALE);
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
  zoomScale = representativeFitScale() * zoomRatio;
  refreshZoomedPages();
}

function setExplicitZoomRatio(ratio) {
  if (!Number.isFinite(ratio)) return;
  zoomRatio = ratio;
  zoomScale = clamp(representativeFitScale() * zoomRatio, MIN_PAGE_SCALE, MAX_PAGE_SCALE);
  refreshZoomedPages();
}

function commitZoomInput() {
  const ratio = parseZoomInputValue(zoomInput?.value);
  if (!Number.isFinite(ratio)) {
    setPdfInputError(zoomInput, 'Enter a zoom percentage greater than 0, such as 100%.');
    syncZoomControls({ force: true });
    return;
  }
  clearPdfInputError(zoomInput);
  setExplicitZoomRatio(ratio);
}

let zoomRefreshRaf = 0;
function scheduleZoomRefresh() {
  if (viewerSuspended || zoomRefreshRaf) return;
  zoomRefreshRaf = requestAnimationFrame(() => {
    zoomRefreshRaf = 0;
    if (!pdfDocument || !pageRecords.size) return;
    const nextScale = clamp(representativeFitScale() * zoomRatio, MIN_PAGE_SCALE, MAX_PAGE_SCALE);
    if (Number.isFinite(zoomScale) && Math.abs(nextScale - zoomScale) < 0.0001) {
      syncZoomControls();
      return;
    }
    zoomScale = nextScale;
    refreshZoomedPages();
  });
}

function handleReaderSideNoteLayoutChange(event) {
  if (event.detail?.phase !== 'commit') return;
  scheduleZoomRefresh();
}

function refreshZoomedPages() {
  if (!pdfDocument) return;
  const anchor = captureScrollAnchor();
  const horizontalPan = captureHorizontalPan();
  zoomGeneration += 1;
  renderQueue.length = 0;
  textLayerQueue.length = 0;
  renderedPages.clear();
  renderedTextLayers.clear();
  renderingTextLayers.clear();
  renderingPages.clear();
  for (const [pageNumber, record] of orderedPageRecords()) {
    record.renderTask?.cancel();
    record.textLayer?.cancel();
    record.renderTask = null;
    record.textLayer = null;
    record.textLayerEl = null;
    updatePageGeometry(record);
    record.pageEl.dataset.renderState = 'pending';
    record.pageEl.dataset.textLayer = 'pending';
    observer?.observe(record.pageEl);
    notifyPageChanged(pageNumber, 'shell');
  }
  syncZoomControls();
  restoreScrollAnchor(anchor);
  restoreHorizontalPan(horizontalPan);
  requestReadAheadPages(anchor?.pageNumber || currentPageNumber, { forceDrain: true });
  queueInitialVisiblePages({ priority: true });
}

function captureHorizontalPan() {
  if (!pdfViewport) return null;
  const maxScroll = maxHorizontalPanOffset();
  const left = horizontalPanLocked ? lockedHorizontalScrollLeft : pdfViewport.scrollLeft;
  return {
    left,
    ratio: maxScroll > 0 ? left / maxScroll : 0
  };
}

function restoreHorizontalPan(pan) {
  if (!pdfViewport || !pan) return;
  requestAnimationFrame(() => {
    const maxScroll = maxHorizontalPanOffset();
    const restoredLeft = horizontalPanLocked
      ? clamp(pan.left, 0, maxScroll)
      : maxScroll > 0
        ? clamp(pan.ratio * maxScroll, 0, maxScroll)
        : 0;
    if (horizontalPanLocked) setLockedHorizontalPanOffset(restoredLeft);
    else setHorizontalScrollLeft(restoredLeft);
  });
}

function stepZoom(direction) {
  const current = currentRepresentativeZoomRatio();
  setExplicitZoomRatio(current + (direction > 0 ? ZOOM_STEP_RATIO : -ZOOM_STEP_RATIO));
}

function currentRepresentativeScale() {
  const firstRecord = pageRecords.get(1) || pageRecords.values().next().value;
  return firstRecord?.cssScale || 1;
}

function currentRepresentativeZoomRatio() {
  return currentRepresentativeScale() / representativeFitScale();
}

function representativeFitScale() {
  const firstRecord = pageRecords.get(1) || pageRecords.values().next().value;
  return firstRecord?.baseViewport ? fitScaleForViewport(firstRecord.baseViewport) : 1;
}

function parseZoomInputValue(value) {
  const normalized = String(value || '').trim().replace(/%$/, '');
  if (!normalized) return NaN;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed / 100 : NaN;
}

function syncZoomControls(options = {}) {
  const zoomRatio = currentRepresentativeZoomRatio();
  document.documentElement.dataset.pdfZoomMode = Math.abs(zoomRatio - 1) < 0.001 ? 'fit-width' : 'relative';
  document.documentElement.dataset.pdfZoom = String(Number(currentRepresentativeScale().toFixed(4)));
  document.documentElement.dataset.pdfZoomRatio = String(Number(zoomRatio.toFixed(4)));
  if (!zoomInput || (!options.force && document.activeElement === zoomInput)) return;
  zoomInput.value = `${Math.round(zoomRatio * 100)}%`;
}

function captureScrollAnchor() {
  const state = visiblePageState();
  return state ? { pageNumber: state.pageNumber, ratio: state.ratio } : null;
}

function restoreScrollAnchor(anchor) {
  restoreVirtualScrollAnchor(anchor);
}

function beginTextSelectionDrag(event) {
  if (event.button !== 0 || event.pointerType === 'touch') return;
  if (event.target?.closest?.('#pdfToolbar, input, textarea, select, button')) return;
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
  for (const [, record] of orderedPageRecords()) {
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
  for (const [, record] of orderedPageRecords()) {
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

function handlePdfWindowScroll() {
  if (viewerSuspended) return;
  pdfWindowScrolling = true;
  window.clearTimeout(pdfWindowScrollIdleTimer);
  pdfWindowScrollIdleTimer = window.setTimeout(() => {
    pdfWindowScrolling = false;
    drainRenderQueue();
    drainTextLayerQueue();
  }, 140);
  schedulePageControlsSync();
}

function handlePdfViewportScroll() {
  if (!pdfViewport) return;
  if (horizontalPanLocked) {
    if (Math.abs(pdfViewport.scrollLeft) > 0.5) pdfViewport.scrollLeft = 0;
    return;
  } else {
    lockedHorizontalScrollLeft = pdfViewport.scrollLeft;
  }
  scheduleSelectionOverlayUpdate();
  schedulePageControlsSync();
}

function commitPageNumberInput() {
  const pageNumber = Number.parseInt(String(pageNumberInput?.value || '').trim(), 10);
  if (!Number.isFinite(pageNumber) || !pdfDocument) {
    setPdfInputError(pageNumberInput, 'Enter a valid PDF page number.');
    syncPageControls({ force: true });
    return;
  }
  if (pageNumber < 1 || pageNumber > pdfDocument.numPages) {
    setPdfInputError(pageNumberInput, `Enter a page number from 1 to ${pdfDocument.numPages}.`);
    syncPageControls({ force: true });
    return;
  }
  clearPdfInputError(pageNumberInput);
  scrollToPageNumber(pageNumber).catch((error) => {
    document.documentElement.dataset.pdfError = error.message || 'PDF page navigation failed.';
    status(error.message || 'PDF page navigation failed.');
  });
}

async function scrollToPageNumber(pageNumber) {
  await updatePageWindow(pageNumber);
  const record = pageRecords.get(pageNumber);
  if (!record) return;
  const metric = pageMetrics[pageNumber - 1];
  window.scrollTo({
    left: window.scrollX,
    top: Math.max(0, (metric?.top ?? window.scrollY + record.pageEl.getBoundingClientRect().top) - 12),
    behavior: 'auto'
  });
  currentPageNumber = pageNumber;
  syncPageControls();
  queuePriorityPageRenders(readAheadPageNumbers(pageNumber, pdfDocument.numPages, {
    previousCount: PDF_READ_AHEAD_PREVIOUS,
    nextCount: PDF_READ_AHEAD_NEXT
  }));
  forceDrainRenderQueue();
}

function syncPageControls(options = {}) {
  if (!pdfDocument) return;
  const pageState = visiblePageState();
  currentPageNumber = clamp(pageState?.pageNumber || currentPageNumber || 1, 1, pdfDocument.numPages);
  const pageIndex = pageState?.pageIndex ?? currentPageNumber - 1;
  const ratio = Number.isFinite(pageState?.ratio) ? pageState.ratio : 0;
  document.documentElement.dataset.pdfCurrentPage = String(currentPageNumber);
  document.documentElement.dataset.pdfCurrentPageIndex = String(pageIndex);
  document.documentElement.dataset.pdfCurrentPageRatio = String(Number(ratio.toFixed(5)));
  if (pageNumberInput && (options.force || document.activeElement !== pageNumberInput)) pageNumberInput.value = String(currentPageNumber);
  if (pageTotalLabel) pageTotalLabel.textContent = `/ ${pdfDocument.numPages}`;
  if (pageIndicator) pageIndicator.textContent = `Page ${currentPageNumber} / ${pdfDocument.numPages}`;
  if (currentPageNumber !== lastDispatchedCurrentPageNumber) {
    lastDispatchedCurrentPageNumber = currentPageNumber;
    document.dispatchEvent(new CustomEvent('pdf-current-page-change', {
      detail: {
        pageNumber: currentPageNumber,
        pageIndex,
        ratio
      }
    }));
    if (pageRecords.size) requestReadAheadPages(currentPageNumber);
  }
}

function visiblePageState() {
  const probeDocumentY = window.scrollY + window.innerHeight * 0.38;
  const metric = metricForDocumentY(pageMetrics, probeDocumentY);
  if (!metric) return null;
  return {
    pageNumber: metric.pageNumber,
    pageIndex: metric.pageIndex,
    ratio: pageRatioForMetric(metric, probeDocumentY)
  };
}

function toggleHorizontalPanLock() {
  if (!horizontalPanLocked) {
    lockedHorizontalScrollLeft = clamp(pdfViewport?.scrollLeft || 0, 0, maxHorizontalPanOffset());
    horizontalPanLocked = true;
    syncHorizontalPanLock();
    requestAnimationFrame(() => {
      if (horizontalPanLocked && pdfViewport) pdfViewport.scrollLeft = 0;
    });
    return;
  }
  const restoreLeft = lockedHorizontalScrollLeft;
  horizontalPanLocked = false;
  syncHorizontalPanLock();
  requestAnimationFrame(() => setHorizontalScrollLeft(restoreLeft));
}

function syncHorizontalPanLock() {
  document.documentElement.dataset.pdfHorizontalPan = horizontalPanLocked ? 'locked' : 'unlocked';
  syncLockedHorizontalPanOffset();
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

function maxHorizontalPanOffset() {
  if (!pdfViewport) return 0;
  return Math.max(0, pdfViewport.scrollWidth - pdfViewport.clientWidth);
}

function setHorizontalScrollLeft(offset) {
  if (!pdfViewport) return;
  const nextOffset = clamp(Number(offset) || 0, 0, maxHorizontalPanOffset());
  if (Math.round(nextOffset) === Math.round(pdfViewport.scrollLeft)) return;
  pdfViewport.scrollLeft = nextOffset;
  lockedHorizontalScrollLeft = nextOffset;
  scheduleSelectionOverlayUpdate();
}

function setLockedHorizontalPanOffset(offset) {
  lockedHorizontalScrollLeft = clamp(Number(offset) || 0, 0, maxHorizontalPanOffset());
  syncLockedHorizontalPanOffset();
  scheduleSelectionOverlayUpdate();
}

function syncLockedHorizontalPanOffset() {
  if (!pdfViewport) return;
  const offset = horizontalPanLocked ? clamp(lockedHorizontalScrollLeft, 0, maxHorizontalPanOffset()) : 0;
  pdfViewport.style.setProperty('--pdf-horizontal-lock-offset', `${offset}px`);
}

function status(message) {
  if (statusEl) statusEl.textContent = message;
}

function handleViewerVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    suspendPdfViewer('hidden');
    return;
  }
  resumePdfViewer('visible');
}

function handleReaderLifecycleMessage(event) {
  if (event.origin !== location.origin || event.source !== window.parent) return;
  if (event.data?.type !== 'marginalia-reader-lifecycle') return;
  if (event.data.state === 'hidden') suspendPdfViewer('parent-hidden');
  if (event.data.state === 'visible') resumePdfViewer('parent-visible');
}

function suspendPdfViewer(reason = 'hidden') {
  if (viewerSuspended && document.documentElement.dataset.pdfLifecycle === 'suspended') return;
  viewerSuspended = true;
  lifecycleGeneration += 1;
  pageWindowGeneration += 1;
  readAheadRequestId += 1;
  renderQueue.length = 0;
  textLayerQueue.length = 0;
  window.clearTimeout(pdfWindowScrollIdleTimer);
  pdfWindowScrolling = false;
  for (const rafId of [selectionOverlayRaf, pageMetricsRaf, pageControlsRaf, zoomRefreshRaf]) {
    if (rafId) cancelAnimationFrame(rafId);
  }
  selectionOverlayRaf = 0;
  pageMetricsRaf = 0;
  pageControlsRaf = 0;
  zoomRefreshRaf = 0;
  for (const [pageNumber, record] of orderedPageRecords()) {
    record.renderTask?.cancel?.();
    record.textLayer?.cancel?.();
    if (pageNumber !== currentPageNumber) releasePageSurface(pageNumber, record);
  }
  document.documentElement.dataset.pdfLifecycle = 'suspended';
  updatePdfDiagnostics(reason);
  pdfPerformance.mark('suspended', { reason, ...livePdfCounts() });
  window.parent?.postMessage?.({
    type: 'marginalia-pdf-lifecycle',
    state: 'suspended',
    generation: lifecycleGeneration,
    counts: livePdfCounts()
  }, location.origin);
}

function resumePdfViewer(reason = 'visible') {
  if (!viewerSuspended) return;
  viewerSuspended = false;
  lifecycleGeneration += 1;
  const generation = lifecycleGeneration;
  document.documentElement.dataset.pdfLifecycle = 'resuming';
  pdfPerformance.mark('resume-start', { reason, generation });
  requestAnimationFrame(() => {
    if (viewerSuspended || generation !== lifecycleGeneration || !pdfDocument) return;
    updatePageWindow(currentPageNumber)
      .then(() => {
        if (viewerSuspended || generation !== lifecycleGeneration) return;
        requestReadAheadPages(currentPageNumber, { forceDrain: true });
        document.documentElement.dataset.pdfLifecycle = 'active';
        updatePdfDiagnostics('resumed');
        pdfPerformance.mark('resumed', livePdfCounts());
      })
      .catch((error) => {
        document.documentElement.dataset.pdfError = error.message || 'PDF resume failed.';
        status(error.message || 'PDF resume failed.');
      });
  });
}

function teardownPdfViewer() {
  suspendPdfViewer('teardown');
  observer?.disconnect();
  for (const [pageNumber] of [...orderedPageRecords()]) evictPageRecord(pageNumber);
  pdfLoadingTask?.destroy?.();
  pdfDocument?.destroy?.();
  pdfLoadingTask = null;
  pdfDocument = null;
}

function livePdfCounts() {
  return {
    livePages: pageRecords.size,
    renderedPages: renderedPages.size,
    textLayers: renderedTextLayers.size,
    renderQueue: renderQueue.length,
    textQueue: textLayerQueue.length
  };
}

function updatePdfDiagnostics(phase) {
  const counts = livePdfCounts();
  document.documentElement.dataset.pdfPerformancePhase = String(phase || '');
  document.documentElement.dataset.pdfLivePages = String(counts.livePages);
  document.documentElement.dataset.pdfRenderedPages = String(counts.renderedPages);
  document.documentElement.dataset.pdfTextLayers = String(counts.textLayers);
  document.documentElement.dataset.pdfRenderQueue = String(counts.renderQueue);
  document.documentElement.dataset.pdfTextQueue = String(counts.textQueue);
}

function installPdfLongTaskObserver() {
  if (typeof PerformanceObserver !== 'function') return;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration >= 100) pdfPerformance.mark('long-task', { duration: entry.duration });
      }
    });
    observer.observe({ type: 'longtask', buffered: true });
  } catch {
    // Long-task timing is not available in every browser context.
  }
}

function setPdfInputError(input, message) {
  if (!input) return;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-errormessage', 'pdfStatus');
  status(message);
}

function clearPdfInputError(input) {
  if (!input) return;
  input.removeAttribute('aria-invalid');
  input.setAttribute('aria-errormessage', 'pdfStatus');
  if (statusEl && !zoomInput?.matches?.('[aria-invalid="true"]') && !pageNumberInput?.matches?.('[aria-invalid="true"]')) {
    status('');
  }
}

function notifyPageChanged(pageNumber, phase = 'shell') {
  const normalized = normalizedPageNumber(pageNumber);
  document.dispatchEvent(new CustomEvent('pdf-page-ready', {
    detail: {
      pageNumber: normalized,
      pageIndex: normalized != null ? normalized - 1 : null,
      phase
    }
  }));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
