import { buildTextTargetSelectors, normalizePdfRectFromPoints, resolveTextOffsets } from './target-resolution.js';
import { createStorageAdapter } from './storage-adapter.js';
import { bundleFilenameForDocument, downloadBytes } from './bundle.js';
import { isAnnotatorLibraryFilename, libraryFilenameForTitle } from './library-package.js';
import {
  canUseDirectoryAccess,
  canUseFileSystemAccess,
  pickAnnotatorBundleFile,
  pickAnnotatorBundleSaveHandle,
  pickAnnotatorPackageDirectory,
  readParsedPackageFromDirectoryHandle,
  writeArchiveBytesToPackageDirectory,
  writeBytesToFileHandle
} from './file-access.js';
import {
  bundleFolderNameForDocument,
  libraryFolderNameForTitle
} from './folder-package.js';
import { decodeInkForRuntime, encodeInkForStorage } from './ink-codec.js';
import {
  buildInkEraserStrokeIndex,
  collectPendingEraseStrokes,
  commitPendingEraseStrokes
} from './ink-eraser.js';
import {
  annotationPdfPageIndexes,
  annotationPrimaryPdfPageNumber,
  pdfPageIndexFromTarget
} from './pdf-targets.js';
import { normalizePdfViewState } from './pdf-zoom-lock.js';
import {
  metricForDocumentY,
  sortedScrollMetrics
} from './scroll-position.js';
import { buildReaderDocumentNotice } from './reader-notice.js';
import { createReaderSessionChannel, randomSessionId } from './reader-session-channel.js';
import { currentStorageMode, registerServiceWorker, urlWithStorage } from './runtime.js';
import { APP_VERSION_LABEL, APP_VERSION_SHORT } from './app-version.js';
import { analyzeNoteMarkdown, ensureNoteMarkdownStyles, renderNoteMarkdown } from './note-markdown.js';
import { marginaliaPerformanceTrace } from './performance-trace.js';
import { MAX_SOURCE_BOOKMARKS, normalizeSourceBookmarkRecord } from './source-bookmarks.js';

const storageMode = currentStorageMode();
const storage = createStorageAdapter({ mode: storageMode });
const readerPerformance = marginaliaPerformanceTrace('reader');

const state = {
  documents: [],
  currentDocument: null,
  docId: null,
  storageMode: storage.mode,
  annotations: [],
  currentTarget: null,
  activeAnnotationId: null,
  focusModeAnnotationId: null,
  focusModeNoteTop: null,
  focusModeAnchorTop: null,
  focusModeNoteViewportTop: null,
  focusModeAnchorViewportTop: null,
  mode: 'select',
  iframeLoaded: false,
  attachTargetAnnotationId: null,
  removeTargetAnnotationId: null,
  layoutDragSession: null,
  layoutWidths: null,
  notesPanelWidth: null,
  notesPanelResizeSession: null,
  notesTabDragSession: null,
  suppressNotesTabClick: false,
  readingMode: false,
  readingShowHighlights: true,
  pinnedAnnotationId: null,
  pendingHighlightNavigatorJump: null,
  inkTool: 'pen',
  inkColor: '#1c1712',
  inkWidth: 3,
  inkPressureEnabled: true,
  sideInkSession: null,
  sideInkResizeSession: null,
  sideInkResizeLayoutRaf: 0,
  sideInkHistory: new Map(),
  pendingSideInkRenders: new Set(),
  sideInkRenderRaf: 0,
  sideInkSaveTimers: new Map(),
  noteMarkdownAnalysisTimers: new WeakMap(),
  noteMarkdownSources: new WeakMap(),
  noteMarkdownRenderRevision: 0,
  annotationBlockSaveQueues: new Map(),
  annotationBlockSaveRevisions: new Map(),
  noteNavigatorExpandAll: false,
  expandedNavigatorNoteIds: new Set(),
  collapsedSideNoteIds: new Set(),
  libraryChooser: null,
  pdfHighlightSession: null,
  pdfFrameRefreshRaf: 0,
  pdfDirtyPageIndexes: new Set(),
  pdfNeedsFullRefresh: false,
  pdfDeferredRefreshEffects: false,
  pendingPdfAnnotationJump: null,
  pdfPendingJumpNotice: null,
  pdfPendingJumpNoticeTimer: 0,
  pdfPendingJumpStatusUntil: 0,
  frameScrolling: false,
  frameScrollRaf: 0,
  frameScrollIdleTimer: 0,
  frameScrollDoc: null,
  highlightNavigatorScrollRaf: 0,
  highlightNavigatorScrollDoc: null,
  readerPositionCaptureTimer: 0,
  readerPositionCaptureDoc: null,
  htmlAnchorMetrics: [],
  htmlAnchorMetricsDirty: true,
  htmlAnchorMetricsRaf: 0,
  quickMarkStackLastSyncAt: 0,
  sideNoteLayoutRaf: 0,
  sideNoteLayoutDoc: null,
  selectionCaptureTimer: 0,
  suppressPdfHighlightClick: false,
  undoStack: [],
  redoStack: [],
  isApplyingHistory: false,
  quickMarks: [],
  quickMarkColorIndex: 0,
  quickMarkSavePromise: Promise.resolve(),
  quickMarkDragSession: null,
  quickMarkDragRenderRaf: 0,
  suppressQuickMarkClickId: null,
  quickMarkLimitReminderTimer: 0,
  pendingQuickMarkJumpId: null,
  sourceBookmarks: [],
  selectedSourceBookmarkId: null,
  sourceBookmarkRenameId: null,
  sourceBookmarkSavePromise: Promise.resolve(),
  pendingSourceBookmarkJumpId: null,
  sourceNavigatorExpanded: false,
  tooltipTimer: null,
  tooltip: null,
  tooltipTarget: null,
  saveToastTimer: 0,
  restoringScroll: false,
  pendingReaderPosition: null,
  lastReaderPosition: null,
  readerPositionSaveTimer: 0,
  annotationResolution: new Map(),
  dismissedNoticeKey: '',
  appDialog: null,
  pendingImportKind: null,
  navigatorInkPreviewRenderRaf: 0,
  noteDrawerResizeObserver: null,
  splitSessionId: null,
  splitChannel: null,
  splitNotesWindow: null,
  splitNotesActive: false,
  splitStateRaf: 0,
  splitStateDoc: null,
  splitScrollRaf: 0,
  splitPendingScrollY: 0,
  splitLastLocalScrollSentAt: 0,
  splitRemoteScrollTargetY: null,
  splitRemoteScrollTargetUntil: 0,
  splitWindowMonitorTimer: 0,
  splitSourceWindowTarget: null,
  splitSourceFallbackTimer: 0,
  splitSourceFallbackResizeReadyAt: 0,
  lifecycleGeneration: 0,
  lifecycleSuspended: document.visibilityState === 'hidden',
  hiddenAt: 0
};

const els = {
  docList: document.querySelector('#docList'),
  frame: document.querySelector('#readerFrame'),
  status: document.querySelector('#status'),
  reloadBtn: document.querySelector('#reloadBtn'),
  undoBtn: document.querySelector('#undoBtn'),
  redoBtn: document.querySelector('#redoBtn'),
  clipToolBtn: document.querySelector('#clipToolBtn'),
  splitNotesBtn: document.querySelector('#splitNotesBtn'),
  quickMarkStack: document.querySelector('#quickMarkStack'),
  sourceNavigatorToggleBtn: document.querySelector('#sourceNavigatorToggleBtn'),
  sourceNavigatorPanel: document.querySelector('#sourceNavigatorPanel'),
  sourceBookmarkList: document.querySelector('#sourceBookmarkList'),
  sourceBookmarkEmpty: document.querySelector('#sourceBookmarkEmpty'),
  addSourceBookmarkBtn: document.querySelector('#addSourceBookmarkBtn'),
  removeSourceBookmarkBtn: document.querySelector('#removeSourceBookmarkBtn'),
  renameSourceBookmarkBtn: document.querySelector('#renameSourceBookmarkBtn'),
  insertSourceBookmarkBtn: document.querySelector('#insertSourceBookmarkBtn'),
  cancelModeBtn: document.querySelector('#cancelModeBtn'),
  readingModeBtn: document.querySelector('#readingModeBtn'),
  readingHighlightBtn: document.querySelector('#readingHighlightBtn'),
  highlightSelectionBtn: document.querySelector('#highlightSelectionBtn'),
  noteList: document.querySelector('#noteList'),
  noteCount: document.querySelector('#noteCount'),
  expandAllNotesBtn: document.querySelector('#expandAllNotesBtn'),
  noteDrawerBody: document.querySelector('#noteDrawerBody'),
  rightPanel: document.querySelector('#rightPanel'),
  toggleNotesBtn: document.querySelector('#toggleNotesBtn'),
  notesPanelResizer: document.querySelector('#notesPanelResizer'),
  sourceStartPanel: document.querySelector('#sourceStartPanel'),
  importSourceBtn: document.querySelector('#importSourceBtn'),
  quickStartBtn: document.querySelector('#quickStartBtn'),
  sourceFileInput: document.querySelector('#sourceFileInput'),
  appVersion: document.querySelector('#appVersion'),
  libraryChooserPanel: document.querySelector('#libraryChooserPanel'),
  libraryChooserTitle: document.querySelector('#libraryChooserTitle'),
  libraryChooserList: document.querySelector('#libraryChooserList'),
  libraryChooserCloseBtn: document.querySelector('#libraryChooserCloseBtn'),
  appDialog: document.querySelector('#appDialog'),
  appDialogTitle: document.querySelector('#appDialogTitle'),
  appDialogBody: document.querySelector('#appDialogBody'),
  appDialogActions: document.querySelector('#appDialogActions'),
  saveToast: document.querySelector('#saveToast'),
  saveToastTitle: document.querySelector('#saveToastTitle'),
  saveToastClose: document.querySelector('#saveToastClose'),
  saveToastBody: document.querySelector('#saveToastBody'),
  readerNotice: document.querySelector('#readerNotice'),
  readerNoticeTitle: document.querySelector('#readerNoticeTitle'),
  readerNoticeBody: document.querySelector('#readerNoticeBody'),
  readerNoticeClose: document.querySelector('#readerNoticeClose'),
  readerNoticeRetry: document.querySelector('#readerNoticeRetry'),
  readerNoticeImport: document.querySelector('#readerNoticeImport'),
  readerNoticeLibrary: document.querySelector('#readerNoticeLibrary')
};

els.importBundleBtn = document.querySelector('#importBundleBtn');
els.exportBundleBtn = document.querySelector('#exportBundleBtn');
els.bundleFileInput = document.querySelector('#bundleFileInput');

const ANCHOR_SELECTOR = '[data-anchor-id], h1[id], h2[id], h3[id], h4[id], h5[id], h6[id], p[id], li[id], blockquote[id], figure[id], figcaption[id], td[id], th[id], section[id], article[id]';
const ATOMIC_HIGHLIGHT_SELECTOR = 'table[data-anchor-id], table[id], .formula[data-anchor-id], .formula[id], [data-reader-math-rendered="true"][data-anchor-id], [data-math-source="tex"][data-anchor-id]';
const HIGHLIGHT_ROOT_SELECTOR = `${ATOMIC_HIGHLIGHT_SELECTOR}, ${ANCHOR_SELECTOR}`;
const QUOTE_REPAIR_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, figcaption, td, th';
const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
const INK_SPACE = { width: 1000, height: 562.5 };
const INK_BACKING_SCALE = { min: 2, max: 3, multiplier: 1.5 };
const INK_PREVIEW_BACKING_RATIO = Math.min(3, Math.max(2, Number(globalThis.devicePixelRatio) || 1));
const INK_INACTIVE_BACKING_RATIO = 1;
const INK_SAVE_IDLE_DELAY_MS = 260;
const PRESSURE_WIDTH = { min: 0.58, max: 1.45, curve: 0.68 };
const inkLogicalBottomCache = new WeakMap();
const inkSurfaceCache = new WeakMap();
const pdfSideNotePositionCache = new WeakMap();
const pendingInactiveInkLayoutRedraws = new WeakSet();
let annotationIndexSource = null;
let annotationIndexCache = new Map();
const TOOLTIP_DELAY = 500;
const MIN_VISIBLE_NOTE_WIDTH = 48;
const QUICK_MARK_COLORS = ['clip-color-0', 'clip-color-1', 'clip-color-2', 'clip-color-3', 'clip-color-4'];
const QUICK_MARK_COLOR_VALUES = ['#f2d48d', '#b7d8ff', '#b9e4c4', '#ffc2c7', '#d8c6ff'];
const QUICK_MARK_ASSET_URLS = QUICK_MARK_COLORS.map((_, index) => new URL(`assets/binder-clip-${index}.png`, location.href).href);
const MAX_QUICK_MARKS = 8;
const READER_FRAME_PROGRESS_TIMEOUT_MS = 15000;
const READER_FRAME_HARD_TIMEOUT_MS = 120000;
const PDF_READY_TIMEOUT_MS = 120000;
const PDF_POSITION_READY_TIMEOUT_MS = 12000;
const READER_POSITION_SAVE_DELAY_MS = 350;
const READER_POSITION_PRECISE_CAPTURE_DELAY_MS = 160;
const QUICK_MARK_SCROLL_SYNC_INTERVAL_MS = 120;
const SAVE_SUCCESS_VISIBLE_MS = 3600;
const INK_CANVAS_HEIGHT = { min: 96, default: 420, max: 1800, padding: 18 };
const NOTES_PANEL_WIDTH = { min: 260, default: 360 };
const NOTES_TAB_TOP = { min: 8, default: 10 };
const NOTE_JUMP_VIEWPORT_OFFSET_RATIO = 0.2;
const MATH_DELIMITERS = [
  { open: '\\[', close: '\\]', displayMode: true },
  { open: '$$', close: '$$', displayMode: true },
  { open: '\\(', close: '\\)', displayMode: false },
  { open: '$', close: '$', displayMode: false }
];
const BLANK_NOTE_BLOCK = { type: 'blank' };
let serviceWorkerRegistrationScheduled = false;

init().catch((error) => {
  setStatus(error.message, true);
  scheduleServiceWorkerRegistration();
});

async function init() {
  if (els.appVersion) {
    els.appVersion.textContent = APP_VERSION_SHORT;
    els.appVersion.title = APP_VERSION_LABEL;
  }
  bindChromeEvents();
  renderSourceNavigator();
  const requestedDoc = new URLSearchParams(location.search).get('doc');
  const documentsPromise = loadDocuments();
  if (requestedDoc) {
    await loadDocument(requestedDoc);
    await documentsPromise;
    if (state.currentDocument?.id === requestedDoc) return;
  } else {
    await documentsPromise;
  }
  const rememberedDoc = requestedDoc ? null : await rememberedDocumentId();
  const firstDoc = state.documents[0]?.id;
  const docId = rememberedDoc || firstDoc;
  if (!docId) {
    showSourceStartPanel();
    setStatus('Import a source to begin.');
    scheduleServiceWorkerRegistration();
    return;
  }
  if (state.currentDocument?.id === docId && state.docId === docId) return;
  await loadDocument(docId);
}

function scheduleServiceWorkerRegistration() {
  if (serviceWorkerRegistrationScheduled) return;
  serviceWorkerRegistrationScheduled = true;
  const register = () => registerServiceWorker().catch(() => {});
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(register, { timeout: 3000 });
    return;
  }
  window.setTimeout(register, 800);
}

function bindChromeEvents() {
  const libraryLink = document.querySelector('.left-rail a[href="library.html"]');
  if (libraryLink) {
    libraryLink.href = urlWithStorage('library.html', {}, state.storageMode);
    libraryLink.addEventListener('click', () => readerPerformance.mark('library-navigation-click'));
  }
  els.reloadBtn.addEventListener('click', () => loadDocument(state.docId));
  els.cancelModeBtn.addEventListener('click', () => setMode('select'));
  els.readingModeBtn.addEventListener('click', toggleReadingMode);
  els.readingHighlightBtn.addEventListener('click', toggleReadingHighlights);
  els.highlightSelectionBtn.addEventListener('click', () => createHighlightFromCurrentTarget().catch((error) => setStatus(error.message, true)));
  els.undoBtn.addEventListener('click', () => undoHistoryCommand().catch((error) => setStatus(error.message, true)));
  els.redoBtn.addEventListener('click', () => redoHistoryCommand().catch((error) => setStatus(error.message, true)));
  els.clipToolBtn.addEventListener('pointerdown', startQuickMarkToolDrag);
  els.clipToolBtn.addEventListener('keydown', onQuickMarkToolKeyDown);
  els.sourceNavigatorToggleBtn?.addEventListener('click', toggleSourceNavigator);
  els.addSourceBookmarkBtn?.addEventListener('click', addSourceBookmark);
  els.removeSourceBookmarkBtn?.addEventListener('click', removeSelectedSourceBookmark);
  els.renameSourceBookmarkBtn?.addEventListener('click', beginSelectedSourceBookmarkRename);
  els.insertSourceBookmarkBtn?.addEventListener('click', insertSelectedSourceBookmark);
  els.sourceBookmarkList?.addEventListener('click', handleSourceBookmarkListClick);
  els.splitNotesBtn?.addEventListener('click', () => toggleSplitNotesWindow().catch((error) => setStatus(error.message, true)));
  els.toggleNotesBtn.addEventListener('pointerdown', onNotesTabPointerDown);
  els.toggleNotesBtn.addEventListener('click', onNotesTabClick);
  els.notesPanelResizer?.addEventListener('pointerdown', onNotesPanelResizerPointerDown);
  els.notesPanelResizer?.addEventListener('keydown', onNotesPanelResizerKeyDown);
  els.expandAllNotesBtn?.addEventListener('click', toggleExpandAllNotes);
  els.importSourceBtn?.addEventListener('click', () => startSourceImport().catch((error) => setStatus(error.message, true)));
  els.quickStartBtn?.addEventListener('click', () => startQuickStartImport().catch((error) => setStatus(error.message, true)));
  els.sourceFileInput?.addEventListener('change', () => importSelectedSourceFile(els.sourceFileInput).catch((error) => setStatus(error.message, true)));
  els.libraryChooserCloseBtn?.addEventListener('click', () => finishLibrarySourceChoice(null).catch((error) => setStatus(error.message, true)));
  els.libraryChooserList?.addEventListener('click', (event) => {
    const button = event.target?.closest?.('[data-library-doc-id]');
    if (!button) return;
    finishLibrarySourceChoice(button.dataset.libraryDocId).catch((error) => setStatus(error.message, true));
  });
  els.importBundleBtn?.addEventListener('click', () => startSourceImport().catch((error) => setStatus(error.message, true)));
  els.bundleFileInput?.addEventListener('change', () => importSelectedSourceFile(els.bundleFileInput).catch((error) => setStatus(error.message, true)));
  els.exportBundleBtn?.addEventListener('click', () => exportCurrentBundle().catch((error) => setSaveFailure(error)));
  els.saveToastClose?.addEventListener('click', hideSaveToast);
  els.readerNoticeClose?.addEventListener('click', dismissReaderNotice);
  els.readerNoticeRetry?.addEventListener('click', () => loadDocument(state.docId).catch((error) => showReaderLoadFailure(error)));
  els.readerNoticeImport?.addEventListener('click', () => startSourceImport().catch((error) => setStatus(error.message, true)));
  installFileDropImport();
  installTooltipController(document);
  installNoteDrawerResizeObserver();
  applyNotesTabTop(loadNotesTabTop());
  syncNotesPanelControls();
  syncHistoryControls();
  syncReadingModeControls();
  window.addEventListener('resize', () => {
    applyNotesTabTop(currentNotesTabTop());
    maybeReleaseSplitSourceWidthFallback();
  });
  window.addEventListener('message', (event) => {
    if (event.source !== els.frame?.contentWindow) return;
    if (event.data?.type === 'annotation-saved') {
      reloadAnnotationsAndRender(event.data.annotationId).catch((error) => setStatus(error.message, true));
      return;
    }
    if (event.data?.type === 'reader-highlight-click') {
      activateAnnotationFromHighlightClick(event.data.annotationId);
    }
  });
  window.addEventListener('beforeunload', () => {
    void flushAllPendingAnnotationBlockSaves();
    flushReaderScrollPosition();
    closeSplitNotesSession({ notify: true });
    storage.revokeAllNoteImageUrls?.();
  });
  if (els.readerNoticeLibrary) els.readerNoticeLibrary.href = urlWithStorage('library.html', {}, state.storageMode);
  window.addEventListener('pagehide', () => {
    suspendReaderLifecycle('pagehide');
    void flushAllPendingAnnotationBlockSaves();
    flushReaderScrollPosition();
  });
  document.addEventListener('visibilitychange', handleReaderVisibilityChange);
  document.addEventListener('keydown', handleDocumentKeyDown);
}

function handleReaderVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    suspendReaderLifecycle('hidden');
    void flushAllPendingAnnotationBlockSaves();
    flushReaderScrollPosition();
    return;
  }
  resumeReaderLifecycle('visible');
}

function suspendReaderLifecycle(reason = 'hidden') {
  if (state.lifecycleSuspended) return;
  state.lifecycleSuspended = true;
  state.lifecycleGeneration += 1;
  state.hiddenAt = Date.now();
  window.clearTimeout(state.frameScrollIdleTimer);
  state.frameScrollIdleTimer = 0;
  state.frameScrolling = false;
  const rafStateKeys = [
    'frameScrollRaf',
    'highlightNavigatorScrollRaf',
    'pdfFrameRefreshRaf',
    'sideNoteLayoutRaf',
    'sideInkRenderRaf',
    'navigatorInkPreviewRenderRaf',
    'quickMarkDragRenderRaf',
    'htmlAnchorMetricsRaf'
  ];
  for (const key of rafStateKeys) {
    if (state[key]) cancelAnimationFrame(state[key]);
    state[key] = 0;
  }
  state.pendingSideInkRenders.clear();
  postReaderLifecycleToFrame('hidden');
  readerPerformance.mark('suspended', { reason, generation: state.lifecycleGeneration });
}

function resumeReaderLifecycle(reason = 'visible') {
  if (!state.lifecycleSuspended) return;
  const hiddenDuration = state.hiddenAt ? Date.now() - state.hiddenAt : 0;
  state.lifecycleSuspended = false;
  state.lifecycleGeneration += 1;
  const generation = state.lifecycleGeneration;
  state.hiddenAt = 0;
  readerPerformance.mark('resume-start', { reason, generation, hiddenDuration });
  postReaderLifecycleToFrame('visible');
  requestAnimationFrame(() => {
    if (state.lifecycleSuspended || generation !== state.lifecycleGeneration || !state.iframeLoaded) return;
    const doc = getFrameDoc();
    if (state.currentDocument?.sourceType === 'pdf') schedulePdfFrameRefresh(doc);
    requestSideNoteLayout(doc);
    requestNavigatorInkPreviewRedraw();
    readerPerformance.mark('resume-ui-scheduled', { generation, hiddenDuration });
  });
}

function postReaderLifecycleToFrame(lifecycleState) {
  try {
    els.frame?.contentWindow?.postMessage?.({
      type: 'marginalia-reader-lifecycle',
      state: lifecycleState,
      generation: state.lifecycleGeneration
    }, location.origin);
  } catch {
    // A navigating or replaced iframe may not accept lifecycle messages.
  }
}

async function loadDocuments() {
  state.documents = await storage.listDocuments();
  renderDocumentList();
  syncBundleControls();
}

async function rememberedDocumentId() {
  const docId = await storage.getLastOpenDocumentId?.();
  if (!docId) return null;
  return state.documents.some((doc) => doc.id === docId) ? docId : null;
}

function renderDocumentList() {
  if (!els.docList || els.docList.getAttribute('aria-hidden') === 'true') return;
  els.docList.innerHTML = state.documents.map((doc) => `
    <button class="doc-card ${doc.id === state.docId ? 'is-active' : ''}" type="button" data-doc-id="${escapeAttr(doc.id)}">
      <span class="doc-title">${escapeHtml(doc.title)}</span>
      <span class="doc-id">${escapeHtml(doc.id)}</span>
    </button>
  `).join('');
  els.docList.querySelectorAll('[data-doc-id]').forEach((button) => {
    button.addEventListener('click', () => loadDocument(button.dataset.docId));
  });
}

function showSourceStartPanel() {
  if (els.sourceStartPanel) els.sourceStartPanel.hidden = false;
  if (els.frame) els.frame.hidden = true;
  state.iframeLoaded = false;
  syncBundleControls();
}

function hideSourceStartPanel() {
  if (els.sourceStartPanel) els.sourceStartPanel.hidden = true;
  if (els.frame) els.frame.hidden = false;
}

async function startSourceImport() {
  const importKind = await chooseImportKind();
  if (!importKind) {
    setStatus('Import cancelled.');
    return;
  }
  if (importKind === 'quick-start') {
    await startQuickStartImport();
    return;
  }
  await startImportFilePick(importKind);
}

async function chooseImportKind() {
  return showAppDialog({
    title: 'Import',
    body: 'Choose what you want to open.',
    actions: [
      { value: 'source', label: 'Source HTML/PDF', className: 'primary' },
      { value: 'bundle', label: 'Single bundle' },
      { value: 'library', label: 'Library package' },
      { value: null, label: 'Cancel' }
    ],
    cancelValue: null
  });
}

async function startQuickStartImport() {
  const response = await fetch(new URL('quick-start.html', location.href), { cache: 'no-cache' });
  if (!response.ok) throw new Error('Quick start could not be loaded.');
  const sourceHtml = await response.text();
  const file = new File([sourceHtml], 'quick-start.html', { type: 'text/html' });
  if (!(await shouldProceedWithImport(file, 'source'))) {
    setStatus('Import cancelled.');
    return;
  }
  const existingLibrary = await storage.getCurrentLibraryContext?.();
  setStatus('Starting quick start...');
  const doc = await storage.importDocument(file);
  if (!existingLibrary) await storage.createCurrentLibraryFromDocument?.(doc.id, 'Marginalia library');
  await loadDocuments();
  if (doc?.id) await loadDocument(doc.id);
  setStatus('Started with quick-start.html.');
}

async function startImportFilePick(importKind) {
  if ((importKind === 'bundle' || importKind === 'library') && canUseDirectoryAccess()) {
    const packageMode = await choosePackageOpenMode(importKind);
    if (packageMode === 'cancel') {
      setStatus('Import cancelled.');
      return;
    }
    if (packageMode === 'folder') {
      await importPackageFolder(importKind);
      return;
    }
  }
  if (state.storageMode === 'indexeddb' && canUseFileSystemAccess()) {
    let picked = null;
    try {
      picked = await pickAnnotatorBundleFile();
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatus('Import cancelled.');
        return;
      }
      throw error;
    }
    if (picked) {
      await validateImportKind(picked.file, importKind);
      if (await shouldProceedWithImport(picked.file, importKind)) {
        await importSourceFile(picked.file, picked.handle, importKind);
      }
    }
    return;
  }
  const input = els.sourceFileInput || els.bundleFileInput;
  if (!input) return;
  state.pendingImportKind = importKind;
  input.accept = acceptForImportKind(importKind);
  input.click();
}

async function choosePackageOpenMode(importKind) {
  const label = importKind === 'library' ? 'library' : 'bundle';
  return showAppDialog({
    title: `Import ${label}`,
    body: `Choose a ${label} folder, or open an older zip package.`,
    actions: [
      { value: 'folder', label: `${capitalize(label)} folder`, className: 'primary' },
      { value: 'zip', label: 'Zip package' },
      { value: 'cancel', label: 'Cancel' }
    ],
    cancelValue: 'cancel'
  });
}

async function importPackageFolder(importKind) {
  let handle = null;
  try {
    handle = await pickAnnotatorPackageDirectory(importKind === 'library' ? 'annotator-library-open' : 'annotator-bundle-open');
  } catch (error) {
    if (error.name === 'AbortError') {
      setStatus('Import cancelled.');
      return;
    }
    throw error;
  }
  if (!handle) return;
  const filename = importKind === 'library'
    ? `${handle.name || 'library'}.annotator-library.zip`
    : `${handle.name || 'bundle'}.annotator.zip`;
  const fileLike = { name: filename };
  if (!(await shouldProceedWithImport(fileLike, importKind))) return;
  const importOptions = importKind === 'library' ? await confirmLibraryImportOptions() : null;
  if (importKind === 'library' && !importOptions) {
    setStatus('Import cancelled.');
    return;
  }
  setStatus(`Importing ${importKind} folder...`);
  const parsed = await readParsedPackageFromDirectoryHandle(handle, importKind);
  if (importKind === 'library') {
    const result = await storage.importLibraryData(parsed, importOptions);
    await rememberCurrentLibraryHandle(handle);
    await loadDocuments();
    setStatus(`Imported library "${result.library?.title || handle.name || 'library'}".`);
    location.href = urlWithStorage('library.html', {}, state.storageMode);
    return;
  }
  const doc = await storage.importBundleData(parsed, { addToCurrentLibrary: true });
  await rememberDocumentHandle(doc.id, handle);
  await loadDocuments();
  await loadDocument(doc.id);
  setStatus(`Imported "${doc.title || handle.name || 'bundle'}".`);
}

async function importSelectedSourceFile(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const importKind = state.pendingImportKind || 'source';
  try {
    await validateImportKind(file, importKind);
    if (await shouldProceedWithImport(file, importKind)) await importSourceFile(file, null, importKind);
  } finally {
    state.pendingImportKind = null;
    if (input) input.value = '';
  }
}

async function shouldProceedWithImport(file, importKind = 'source') {
  if (!file) return false;
  if (importKind === 'library') return true;
  const currentLibrary = await storage.getCurrentLibraryContext?.();
  if (currentLibrary) return true;
  return confirmReplaceCurrentSource();
}

async function importSourceFile(file, fileHandle = null, importKind = 'source') {
  const name = file?.name || '';
  const lowerName = name.toLowerCase();
  setStatus('Importing source...');
  let doc = null;
  let library = null;
  if (importKind === 'library' || isAnnotatorLibraryFilename(name)) {
    const importOptions = await confirmLibraryImportOptions();
    if (!importOptions) {
      setStatus('Import cancelled.');
      return;
    }
    const result = await storage.importDocumentLibrary(file, importOptions);
    library = result.library;
    if (fileHandle) await rememberCurrentLibraryHandle(fileHandle);
    await loadDocuments();
    setStatus(`Imported library "${library?.title || name}".`);
    location.href = urlWithStorage('library.html', {}, state.storageMode);
    return;
  } else if (/\.pdf$/i.test(lowerName) || file.type === 'application/pdf') {
    doc = await storage.importDocument(file);
  } else if (/\.html?$/.test(lowerName) || file.type === 'text/html') {
    doc = await storage.importDocument(file);
  } else {
    doc = await storage.importDocumentBundle(file);
    if (fileHandle) await rememberDocumentHandle(doc.id, fileHandle);
  }
  await loadDocuments();
  if (doc?.id) await loadDocument(doc.id);
  setStatus(library ? `Opened library "${library.title}".` : `Imported "${doc?.title || name}".`);
}

function installFileDropImport() {
  const dropCatcher = document.createElement('div');
  dropCatcher.className = 'file-drop-catcher';
  dropCatcher.setAttribute('aria-hidden', 'true');
  document.body.append(dropCatcher);

  let dragDepth = 0;
  document.addEventListener('dragenter', (event) => {
    if (!isFileDragEvent(event)) return;
    dragDepth += 1;
    event.preventDefault();
    document.body.classList.add('is-file-dragging');
  });
  document.addEventListener('dragover', (event) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  document.addEventListener('dragleave', (event) => {
    if (!isFileDragEvent(event)) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0 || event.clientX <= 0 || event.clientY <= 0) {
      document.body.classList.remove('is-file-dragging');
    }
  });
  document.addEventListener('drop', (event) => {
    if (!isFileDragEvent(event)) return;
    event.preventDefault();
    dragDepth = 0;
    document.body.classList.remove('is-file-dragging');
    importDroppedFile(event).catch((error) => setStatus(error.message, true));
  });
}

function isFileDragEvent(event) {
  return Array.from(event.dataTransfer?.types || []).includes('Files');
}

async function importDroppedFile(event) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  const importKind = await droppedFileImportKind(file);
  await validateImportKind(file, importKind);
  if (await shouldProceedWithImport(file, importKind)) await importSourceFile(file, null, importKind);
}

async function droppedFileImportKind(file) {
  const name = file?.name || '';
  const lowerName = name.toLowerCase();
  if (isAnnotatorLibraryFilename(name)) return 'library';
  if (/\.pdf$/i.test(lowerName) || file.type === 'application/pdf') return 'source';
  if (await fileStartsWithPdfMagic(file)) return 'source';
  if (/\.html?$/.test(lowerName) || file.type === 'text/html') return 'source';
  if (/\.annotator\.zip$/i.test(lowerName) || /\.zip$/i.test(lowerName) || file.type === 'application/zip') return 'bundle';
  throw new Error('Drop an HTML or PDF source file, .annotator.zip bundle, or .annotator-library.zip library.');
}

async function validateImportKind(file, importKind) {
  const name = file?.name || '';
  const lowerName = name.toLowerCase();
  if (importKind === 'source') {
    if (/\.pdf$/i.test(lowerName) || file.type === 'application/pdf') return;
    if (await fileStartsWithPdfMagic(file)) return;
    if (/\.html?$/i.test(lowerName) || file.type === 'text/html') return;
    throw new Error('Choose an HTML or PDF source file.');
  }
  if (importKind === 'bundle') {
    if (isAnnotatorLibraryFilename(name)) throw new Error('Use Import library for .annotator-library.zip files.');
    if (/\.annotator\.zip$/i.test(lowerName) || /\.zip$/i.test(lowerName) || file.type === 'application/zip') return;
    throw new Error('Choose a .annotator.zip bundle file.');
  }
  if (importKind === 'library') {
    if (isAnnotatorLibraryFilename(name)) return;
    throw new Error('Choose a .annotator-library.zip file.');
  }
}

async function fileStartsWithPdfMagic(file) {
  if (!file?.slice) return false;
  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}

function acceptForImportKind(importKind) {
  if (importKind === 'source') return '.html,.htm,text/html,.pdf,application/pdf';
  if (importKind === 'bundle') return '.annotator.zip,.zip,application/zip';
  if (importKind === 'library') return '.annotator-library.zip,.zip,application/zip';
  return '.html,.htm,text/html,.pdf,application/pdf,.annotator.zip,.annotator-library.zip,.zip,application/zip';
}

async function chooseLibraryDocument(defaultDocument, library) {
  const entries = library?.entries || [];
  if (!entries.length) return defaultDocument;
  return new Promise((resolve) => {
    state.libraryChooser = {
      defaultDocument,
      library,
      resolve
    };
    renderLibrarySourceChooser(defaultDocument, library);
  });
}

function renderLibrarySourceChooser(defaultDocument, library) {
  if (!els.libraryChooserPanel || !els.libraryChooserList) {
    finishLibrarySourceChoice(defaultDocument?.id).catch((error) => setStatus(error.message, true));
    return;
  }
  const entries = [...(library?.entries || [])].sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  const activeDocId = defaultDocument?.id || entries.find((entry) => entry.id === library?.activeEntryId)?.docId || entries[0]?.docId || '';
  if (els.libraryChooserTitle) els.libraryChooserTitle.textContent = library?.title || 'Choose a source';
  els.libraryChooserList.innerHTML = entries.map((entry, index) => {
    const title = entry.title || entry.docId || `Source ${index + 1}`;
    const active = entry.docId === activeDocId;
    return `
      <button class="library-source-button ${active ? 'is-active' : ''}" type="button" data-library-doc-id="${escapeAttr(entry.docId)}">
        <span class="library-source-title">${escapeHtml(title)}</span>
        <span class="library-source-meta">${active ? 'Active' : `Source ${index + 1}`}</span>
      </button>
    `;
  }).join('');
  els.libraryChooserPanel.hidden = false;
  requestAnimationFrame(() => {
    const activeButton = els.libraryChooserList.querySelector('.library-source-button.is-active')
      || els.libraryChooserList.querySelector('.library-source-button');
    activeButton?.focus?.();
  });
}

async function finishLibrarySourceChoice(docId) {
  const chooser = state.libraryChooser;
  if (!chooser) return;
  state.libraryChooser = null;
  if (els.libraryChooserPanel) els.libraryChooserPanel.hidden = true;
  const selectedDocId = docId || chooser.defaultDocument?.id || chooser.library?.entries?.[0]?.docId || null;
  if (selectedDocId) await storage.rememberDocumentOpen?.(selectedDocId);
  const document = selectedDocId ? await storage.getDocument(selectedDocId) : chooser.defaultDocument;
  chooser.resolve(document || chooser.defaultDocument || null);
}

async function confirmReplaceCurrentSource() {
  if (!state.docId) return true;
  const annotations = state.annotations?.length ? state.annotations : await storage.getAnnotations(state.docId);
  const hasAnnotations = annotations.some(annotationHasUserContent);
  const hasQuickMarks = state.quickMarks.length > 0;
  const hasSourceBookmarks = state.sourceBookmarks.length > 0;
  if (!hasAnnotations && !hasQuickMarks && !hasSourceBookmarks) return true;
  return showAppDialog({
    title: 'Replace current source?',
    body: 'The current source has notes, highlights, ink, quick marks, or bookmarks. Save first, or discard the current working source and import another one.',
    actions: [
      { value: true, label: 'Discard and import', className: 'primary', destructive: true },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
}

async function confirmLibraryImportOptions() {
  const currentLibrary = await storage.getCurrentLibraryContext?.();
  if (!currentLibrary) return {};
  const choice = await showAppDialog({
    title: 'Replace current library?',
    body: `Importing this library package will close "${currentLibrary.title || 'the current library'}" and make the imported package the current library.`,
    actions: [
      { value: 'replace', label: 'Replace library', className: 'primary', destructive: true },
      { value: 'cancel', label: 'Cancel' }
    ],
    cancelValue: 'cancel'
  });
  return choice === 'replace' ? { replaceCurrent: true } : null;
}

function annotationHasUserContent(annotation) {
  if (!annotation) return false;
  if (annotation.highlight?.enabled) return true;
  const note = annotation.note || {};
  if (String(note.title || '').trim()) return true;
  if (String(note.markdown || '').trim()) return true;
  if (Array.isArray(note.ink?.strokes) && note.ink.strokes.length) return true;
  return (note.blocks || []).some((block) => {
    if (block?.type === 'text') return Boolean(String(block.markdown || '').trim());
    if (block?.type === 'ink') return Array.isArray(block.ink?.strokes) && block.ink.strokes.length > 0;
    if (block?.type === 'image') return Boolean(String(block.assetPath || '').trim());
    return block?.type === 'blank';
  });
}

async function exportCurrentBundle() {
  if (!state.docId) {
    setSaveNotice('No source is open.', { title: 'Save unavailable', state: 'error', autoHide: false });
    return;
  }
  await flushQuickMarkSave();
  await flushSourceBookmarkSave();
  await flushAllPendingAnnotationBlockSaves();
  setSaveProgress('Preparing save...');
  const doc = state.documents.find((item) => item.id === state.docId) || await storage.getDocument(state.docId);
  const library = await storage.getCurrentLibraryContext?.();
  if (library) {
    setSaveProgress(`Saving library "${library.title || 'Annotator library'}"...`);
    const bytes = await storage.exportCurrentLibraryPackage();
    const filename = libraryFilenameForTitle(library.title || 'annotator-library');
    const saved = await saveCurrentLibraryPackage(bytes, filename, library.title || filename);
    if (saved?.cancelled) setSaveCancelled('Save cancelled.');
    return;
  }
  setSaveProgress(`Packaging "${doc?.title || state.docId}"...`);
  const bytes = await storage.exportDocumentBundle(state.docId);
  const filename = bundleFilenameForDocument(doc);
  const currentHandle = await storage.getDocumentFileHandle?.(state.docId);
  if (!currentHandle) {
    setSaveProgress('Choose a save format.');
    const saveMode = await showAppDialog({
      title: 'Save current source',
      body: 'Choose whether to save this source as one portable bundle or save all browser-local sources as a new local library package.',
      actions: [
        { value: 'bundle', label: 'Single bundle', className: 'primary' },
        { value: 'library', label: 'New library package' },
        { value: 'cancel', label: 'Cancel' }
      ],
      cancelValue: 'cancel'
    });
    if (saveMode === 'cancel') {
      setSaveCancelled('Save cancelled.');
      return;
    }
    if (saveMode === 'library') {
      setSaveProgress('Creating library package...');
      const context = await storage.createCurrentLibraryFromDocuments?.(state.docId);
      const libraryBytes = await storage.exportCurrentLibraryPackage();
      const libraryName = libraryFilenameForTitle(context?.title || 'annotator-library');
      setSaveProgress(`Saving library "${context?.title || 'Annotator library'}"...`);
      const saved = await saveNewLibraryPackage(libraryBytes, libraryName);
      if (saved?.cancelled) {
        await storage.clearCurrentLibraryContext?.();
        setSaveCancelled('Save cancelled.');
        return;
      }
      if (saved?.handle) await rememberCurrentLibraryHandle(saved.handle);
      const message = saved?.name && !saved.downloaded
        ? `Saved library "${context?.title || 'Annotator library'}" to ${saved.name}.`
        : `Downloaded library "${libraryName}".`;
      setSaveSuccess(message);
      await loadDocuments();
      return;
    }
  }
  if (state.storageMode === 'indexeddb' && canUseFileSystemAccess()) {
    let saved = null;
    try {
      setSaveProgress(`Saving "${doc?.title || state.docId}"...`);
      saved = await saveBundleWithFileSystemAccess(bytes, filename);
    } catch (error) {
      setSaveProgress(`File save picker failed (${error.message}). Downloading a copy...`);
    }
    if (saved?.cancelled) {
      setSaveCancelled('Save cancelled.');
      return;
    }
    if (saved?.name) {
      setSaveSuccess(`Saved "${doc?.title || state.docId}" to ${saved.name}.`);
      return;
    }
  }
  setSaveProgress(`Downloading "${filename}"...`);
  downloadBytes(bytes, filename);
  setSaveSuccess(`Downloaded "${doc?.title || state.docId}".`);
}

async function saveBundleWithFileSystemAccess(bytes, filename) {
  const existingHandle = await storage.getDocumentFileHandle?.(state.docId);
  const doc = state.currentDocument || await storage.getDocument(state.docId);
  const folderName = bundleFolderNameForDocument(doc || { id: state.docId });
  if (existingHandle) {
    try {
      if (existingHandle.kind === 'directory') {
        await writeArchiveBytesToPackageDirectory(existingHandle, bytes, 'bundle');
        return { name: existingHandle.name || folderName, handle: existingHandle, folder: true };
      }
      await writeBytesToFileHandle(existingHandle, bytes);
      return { name: existingHandle.name || filename };
    } catch (error) {
      await storage.clearDocumentFileHandle?.(state.docId);
      setSaveProgress(`Current file could not be written (${error.message}). Choose a save location...`);
    }
  }
  if (canUseDirectoryAccess()) {
    try {
      const saved = await saveArchiveBytesAsPackageFolder(bytes, folderName, 'bundle', 'annotator-bundle-save');
      if (saved?.handle) await rememberDocumentHandle(state.docId, saved.handle);
      return saved;
    } catch (error) {
      if (error.name === 'AbortError') {
        setSaveCancelled('Save cancelled.');
        return { cancelled: true };
      }
      setSaveProgress(`Folder save failed (${error.message}). Choose a zip save location...`);
    }
  }
  try {
    const handle = await pickAnnotatorBundleSaveHandle(filename);
    if (!handle) return null;
    await writeBytesToFileHandle(handle, bytes);
    await rememberDocumentHandle(state.docId, handle);
    return { name: handle.name || filename };
  } catch (error) {
    if (error.name === 'AbortError') {
      setSaveCancelled('Save cancelled.');
      return { cancelled: true };
    }
    throw error;
  }
}

async function saveCurrentLibraryPackage(bytes, filename, title) {
  const library = await storage.getCurrentLibraryContext?.();
  if (state.storageMode === 'indexeddb' && (canUseDirectoryAccess() || canUseFileSystemAccess())) {
    let saved = null;
    try {
      setSaveProgress(`Saving library "${title}"...`);
      saved = await saveLibraryBytesWithLocalAccess(bytes, filename, library, 'Current library file could not be written');
    } catch (error) {
      setSaveProgress(`Library save picker failed (${error.message}). Downloading a copy...`);
    }
    if (saved?.cancelled) return saved;
    if (saved?.handle) await rememberCurrentLibraryHandle(saved.handle);
    if (saved?.name) {
      const reminder = libraryFolderNameReminder(saved, library);
      setSaveSuccess(`Saved library "${title}" to ${saved.name}.${reminder ? ` ${reminder}` : ''}`);
      return saved;
    }
  }
  setSaveProgress(`Downloading "${filename}"...`);
  downloadBytes(bytes, filename);
  setSaveSuccess(`Downloaded library "${title}".`);
  return { downloaded: true, name: filename };
}

async function saveNewLibraryPackage(bytes, filename) {
  if (state.storageMode !== 'indexeddb' || (!canUseDirectoryAccess() && !canUseFileSystemAccess())) {
    setSaveProgress(`Downloading "${filename}"...`);
    downloadBytes(bytes, filename);
    return { downloaded: true, name: filename };
  }
  try {
    setSaveProgress('Choose a library save location...');
    const saved = await saveLibraryBytesWithLocalAccess(bytes, filename, null);
    if (saved?.cancelled) return saved;
    if (saved?.name) return saved;
  } catch (error) {
    setSaveProgress(`Library save picker failed (${error.message}). Downloading a copy...`);
  }
  setSaveProgress(`Downloading "${filename}"...`);
  downloadBytes(bytes, filename);
  return { downloaded: true, name: filename };
}

async function rememberDocumentHandle(docId, handle) {
  if (!docId || !handle) return false;
  try {
    return await storage.setDocumentFileHandle?.(docId, handle);
  } catch (error) {
    setStatus(`Imported, but the folder handle could not be remembered (${error.message}). Save will ask again.`, true);
    return false;
  }
}

async function rememberCurrentLibraryHandle(handle) {
  if (!handle) return false;
  try {
    return await storage.setCurrentLibraryFileHandle?.(handle);
  } catch (error) {
    setStatus(`Imported, but the library folder handle could not be remembered (${error.message}). Save will ask again.`, true);
    return false;
  }
}

async function saveLibraryBytesWithLocalAccess(bytes, filename, library = null, retryPrefix = 'Current file could not be written') {
  const existingHandle = library?.fileHandle || null;
  const folderName = libraryFolderNameForTitle(library?.title || filename.replace(/\.annotator-library\.zip$/i, ''));
  if (existingHandle) {
    try {
      if (existingHandle.kind === 'directory') {
        await writeArchiveBytesToPackageDirectory(existingHandle, bytes, 'library');
        return { name: existingHandle.name || folderName, handle: existingHandle, folder: true };
      }
      await writeBytesToFileHandle(existingHandle, bytes);
      return { name: existingHandle.name || filename, handle: existingHandle };
    } catch (error) {
      setSaveProgress(`${retryPrefix} (${error.message}). Choose a save location...`);
    }
  }
  if (canUseDirectoryAccess()) {
    try {
      return await saveArchiveBytesAsPackageFolder(bytes, folderName, 'library', 'annotator-library-save');
    } catch (error) {
      if (error.name === 'AbortError') {
        setSaveCancelled('Save cancelled.');
        return { cancelled: true };
      }
      setSaveProgress(`Folder save failed (${error.message}). Choose a zip save location...`);
    }
  }
  return saveBytesWithFileSystemAccess(bytes, filename, null, retryPrefix);
}

async function saveArchiveBytesAsPackageFolder(bytes, folderName, packageKind, pickerId) {
  setSaveProgress(`Choose or create the package folder "${folderName}". Do not choose its parent folder.`);
  const handle = await pickAnnotatorPackageDirectory(pickerId);
  if (!handle) return null;
  await writeArchiveBytesToPackageDirectory(handle, bytes, packageKind);
  return { name: handle.name || folderName, handle, folder: true };
}

async function saveBytesWithFileSystemAccess(bytes, filename, existingHandle = null, retryPrefix = 'Current file could not be written') {
  if (existingHandle) {
    try {
      await writeBytesToFileHandle(existingHandle, bytes);
      return { name: existingHandle.name || filename, handle: existingHandle };
    } catch (error) {
      setSaveProgress(`${retryPrefix} (${error.message}). Choose a save location...`);
    }
  }
  try {
    const handle = await pickAnnotatorBundleSaveHandle(filename);
    if (!handle) return null;
    await writeBytesToFileHandle(handle, bytes);
    return { name: handle.name || filename, handle };
  } catch (error) {
    if (error.name === 'AbortError') {
      setSaveCancelled('Save cancelled.');
      return { cancelled: true };
    }
    throw error;
  }
}

function syncBundleControls() {
  if (els.exportBundleBtn) els.exportBundleBtn.disabled = !state.docId;
  if (els.importBundleBtn) {
    els.importBundleBtn.title = state.storageMode === 'indexeddb'
      ? 'Import source HTML/PDF, .annotator.zip, or .annotator-library.zip'
      : 'Import source HTML/PDF or .annotator.zip into the local library';
  }
}

function readerUrlForDoc(docId) {
  return urlWithStorage('reader.html', { doc: docId }, state.storageMode);
}

async function loadDocument(docId) {
  if (!docId) return;
  const loadStartedAt = readerPerformance.now();
  readerPerformance.mark('document-load-start');
  if (state.docId) await flushAllPendingAnnotationBlockSaves();
  if (state.docId && state.docId !== docId) storage.revokeNoteImageUrl?.(state.docId);
  if (state.docId && state.docId !== docId) closeSplitNotesSession({ notify: true });
  if (state.docId && state.docId !== docId) await flushQuickMarkSave();
  if (state.docId && state.docId !== docId) await flushSourceBookmarkSave();
  if (state.iframeLoaded && state.docId) {
    await flushReaderScrollPosition();
  }
  state.docId = docId;
  const currentDocument = state.documents.find((item) => item.id === docId) || await storage.getDocument(docId);
  state.currentDocument = currentDocument;
  if (!currentDocument) {
    setStatus(`Document not found: ${docId}`, true);
    return;
  }
  readerPerformance.mark('document-metadata-ready', { sourceType: currentDocument.sourceType });
  hideSourceStartPanel();
  syncBundleControls();
  state.currentTarget = null;
  state.activeAnnotationId = null;
  state.focusModeAnnotationId = null;
  state.focusModeNoteTop = null;
  state.focusModeAnchorTop = null;
  state.focusModeNoteViewportTop = null;
  state.focusModeAnchorViewportTop = null;
  state.pinnedAnnotationId = null;
  state.pendingHighlightNavigatorJump = null;
  state.pdfDirtyPageIndexes.clear();
  state.pdfNeedsFullRefresh = false;
  state.pdfDeferredRefreshEffects = false;
  state.pendingPdfAnnotationJump = null;
  state.pendingQuickMarkJumpId = null;
  state.pendingSourceBookmarkJumpId = null;
  state.sourceBookmarkRenameId = null;
  state.pdfPendingJumpNotice = null;
  state.pdfPendingJumpStatusUntil = 0;
  if (state.pdfPendingJumpNoticeTimer) {
    window.clearTimeout(state.pdfPendingJumpNoticeTimer);
    state.pdfPendingJumpNoticeTimer = 0;
  }
  state.frameScrolling = false;
  state.frameScrollDoc = null;
  state.highlightNavigatorScrollDoc = null;
  state.sideNoteLayoutDoc = null;
  state.readerPositionCaptureDoc = null;
  state.htmlAnchorMetrics = [];
  state.htmlAnchorMetricsDirty = true;
  state.quickMarkStackLastSyncAt = 0;
  if (state.pdfFrameRefreshRaf) {
    cancelAnimationFrame(state.pdfFrameRefreshRaf);
    state.pdfFrameRefreshRaf = 0;
  }
  if (state.frameScrollRaf) {
    cancelAnimationFrame(state.frameScrollRaf);
    state.frameScrollRaf = 0;
  }
  if (state.highlightNavigatorScrollRaf) {
    cancelAnimationFrame(state.highlightNavigatorScrollRaf);
    state.highlightNavigatorScrollRaf = 0;
  }
  if (state.frameScrollIdleTimer) {
    window.clearTimeout(state.frameScrollIdleTimer);
    state.frameScrollIdleTimer = 0;
  }
  if (state.sideNoteLayoutRaf) {
    cancelAnimationFrame(state.sideNoteLayoutRaf);
    state.sideNoteLayoutRaf = 0;
  }
  if (state.htmlAnchorMetricsRaf) {
    cancelAnimationFrame(state.htmlAnchorMetricsRaf);
    state.htmlAnchorMetricsRaf = 0;
  }
  if (state.readerPositionCaptureTimer) {
    window.clearTimeout(state.readerPositionCaptureTimer);
    state.readerPositionCaptureTimer = 0;
  }
  state.layoutWidths = loadLayoutWidths(docId);
  state.notesPanelWidth = loadNotesPanelWidth(docId);
  applyNotesPanelWidth();
  state.iframeLoaded = false;
  state.undoStack = [];
  state.redoStack = [];
  syncHistoryControls();
  syncCompatibilityControls();
  const quickMarksPromise = loadQuickMarks(docId);
  const sourceBookmarksPromise = loadSourceBookmarks(docId);
  const readerPositionPromise = loadSavedReaderPosition(docId);
  const annotationsPromise = fetchAnnotations(docId);
  const frameSrcPromise = documentRenderUrl(currentDocument);
  // These operations may finish before the UI setup awaits them. Attach handlers
  // immediately so a fast failure is still owned by this load attempt.
  void quickMarksPromise.catch(() => {});
  void sourceBookmarksPromise.catch(() => {});
  void readerPositionPromise.catch(() => {});
  void annotationsPromise.catch(() => {});
  void frameSrcPromise.catch(() => {});
  hideSelectionHighlightButton();
  state.lastReaderPosition = null;
  setMode('select');
  renderDocumentList();
  setStatus('Loading document…');
  try {
    state.pendingReaderPosition = await readerPositionPromise;
    readerPerformance.mark('saved-position-ready');
    const shouldHideFrameUntilRestored = hasSavedReaderScrollPosition(state.pendingReaderPosition);
    setReaderFrameRestoring(shouldHideFrameUntilRestored);
    const frameSrc = await frameSrcPromise;
    configureReaderFrameSandbox(currentDocument.sourceType);
    await loadReaderFrame(frameSrc);
    readerPerformance.mark('iframe-loaded');
    await quickMarksPromise;
    syncClipToolColor();
    renderQuickMarkStack();
    await sourceBookmarksPromise;
    renderSourceNavigator();
    state.annotations = await annotationsPromise;
    readerPerformance.mark('annotations-ready', { annotations: state.annotations.length });
    storage.sweepUnreferencedNoteImages?.(docId).catch(() => {});
    state.iframeLoaded = true;
    renderSourceNavigator();
    await instrumentIframe();
    await waitForFramePdfReadyIfNeeded();
    readerPerformance.mark('source-ready', { sourceType: currentDocument.sourceType });
    renderAnnotations();
    renderNoteList();
    requestAnimationFrame(() => {
      restoreReaderScrollPosition(getFrameDoc(), state.pendingReaderPosition)
        .finally(() => requestAnimationFrame(() => setReaderFrameRestoring(false)));
    });
    if (!state.pendingPdfAnnotationJump && performance.now() >= state.pdfPendingJumpStatusUntil) {
      setStatus('Ready. Select text in the document to highlight it.');
    }
    hideReaderNotice();
    syncReaderDocumentNotice();
    history.replaceState(null, '', readerUrlForDoc(docId));
    scheduleDocumentOpenRemember(docId);
    scheduleServiceWorkerRegistration();
    readerPerformance.measure('document-usable', loadStartedAt, {
      sourceType: currentDocument.sourceType,
      annotations: state.annotations.length
    });
  } catch (error) {
    await Promise.allSettled([
      quickMarksPromise,
      sourceBookmarksPromise,
      readerPositionPromise,
      annotationsPromise,
      frameSrcPromise
    ]);
    state.iframeLoaded = false;
    renderSourceNavigator();
    setReaderFrameRestoring(false);
    showReaderLoadFailure(error);
  }
}

function scheduleDocumentOpenRemember(docId) {
  if (!storage.rememberDocumentOpen) return;
  const remember = () => {
    if (state.docId !== docId || !state.iframeLoaded) return;
    storage.rememberDocumentOpen(docId).catch(() => {});
  };
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(remember, { timeout: 2000 });
    return;
  }
  window.setTimeout(remember, 0);
}

async function documentRenderUrl(documentRecord) {
  return storage.getDocumentHtmlUrl(documentRecord.id, documentRecord);
}

function configureReaderFrameSandbox(sourceType) {
  const tokens = sourceType === 'pdf'
    ? ['allow-same-origin', 'allow-scripts']
    : ['allow-same-origin'];
  els.frame.setAttribute('sandbox', tokens.join(' '));
  els.frame.title = sourceType === 'pdf' ? 'PDF source reader' : 'Static HTML source reader';
}

async function fetchAnnotations(docId) {
  const annotations = await storage.getAnnotations(docId);
  return Promise.all((annotations || []).map((annotation) => backfillAnnotationInkHeights(docId, annotation)));
}

async function backfillAnnotationInkHeights(docId, annotation) {
  if (!annotationNeedsInkHeightBackfill(annotation)) return annotation;
  const blocks = sideNoteContentBlocks(annotation);
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const payload = {
    ...annotation,
    note: {
      ...(annotation.note || {}),
      ...legacy,
      blocks
    }
  };
  try {
    return annotationWithRuntimeInk(await storage.updateAnnotation(docId, annotation.id, annotationForStorage(payload)));
  } catch {
    return payload;
  }
}

function annotationNeedsInkHeightBackfill(annotation) {
  const blocks = Array.isArray(annotation.note?.blocks) ? annotation.note.blocks : [];
  if (blocks.some((block) => block?.type === 'ink' && !hasStoredInkHeight(block.ink))) return true;
  return Array.isArray(annotation.note?.ink?.strokes)
    && annotation.note.ink.strokes.length > 0
    && !hasStoredInkHeight(annotation.note.ink);
}

function hasStoredInkHeight(ink) {
  return ink?.height != null && ink.height !== '' && Number.isFinite(Number(ink.height));
}

async function reloadAnnotationsAndRender(activeAnnotationId = null) {
  state.annotations = await fetchAnnotations(state.docId);
  state.activeAnnotationId = activeAnnotationId || state.activeAnnotationId;
  if (state.focusModeAnnotationId && !state.annotations.some((annotation) => annotation.id === state.focusModeAnnotationId)) {
    state.focusModeAnnotationId = null;
    state.focusModeNoteTop = null;
    state.focusModeAnchorTop = null;
    state.focusModeNoteViewportTop = null;
    state.focusModeAnchorViewportTop = null;
  }
  renderAnnotations();
  renderNoteList();
}

async function reloadFrameOnly() {
  const documentRecord = state.currentDocument || await storage.getDocument(state.docId);
  await loadReaderFrame(await documentRenderUrl(documentRecord));
  await instrumentIframe();
  renderAnnotations();
}

function loadReaderFrame(src) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const progressTimeout = window.setTimeout(() => {
      if (!settled) setStatus('Still opening this large document…');
    }, READER_FRAME_PROGRESS_TIMEOUT_MS);
    const hardTimeout = window.setTimeout(() => {
      finish(new Error('Document iframe did not finish loading after two minutes.'));
    }, READER_FRAME_HARD_TIMEOUT_MS);
    const interval = window.setInterval(() => {
      if (readerFrameReady(src)) finish();
    }, 50);
    const cleanup = () => {
      els.frame.removeEventListener('load', onLoad);
      window.clearTimeout(progressTimeout);
      window.clearTimeout(hardTimeout);
      window.clearInterval(interval);
    };
    const finish = (error = null) => {
      if (settled) return;
      if (!error && !readerFrameReady(src)) return;
      settled = true;
      cleanup();
      if (error) reject(error);
      else resolve();
    };
    const onLoad = () => finish();
    els.frame.addEventListener('load', onLoad);
    els.frame.src = src;
    requestAnimationFrame(() => finish());
  });
}

function readerFrameReady(expectedSrc) {
  const doc = els.frame.contentDocument;
  if (!doc || doc.readyState === 'loading') return false;
  const expected = new URL(expectedSrc, window.location.href);
  try {
    return doc.location.href === expected.href;
  } catch {
    return false;
  }
}

function waitForFramePdfReadyIfNeeded() {
  if (state.currentDocument?.sourceType !== 'pdf') return Promise.resolve();
  const doc = getFrameDoc();
  if (doc.documentElement.dataset.pdfReady === 'true') return Promise.resolve();
  setStatus('Rendering PDF source...');
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const error = doc.documentElement.dataset.pdfError;
      if (error) {
        window.clearInterval(interval);
        reject(new Error(error));
        return;
      }
      if (doc.documentElement.dataset.pdfReady === 'true') {
        window.clearInterval(interval);
        resolve();
        return;
      }
      if (Date.now() - startedAt > PDF_READY_TIMEOUT_MS) {
        window.clearInterval(interval);
        reject(new Error('PDF viewer did not finish rendering.'));
      }
    }, 100);
  });
}

async function instrumentIframe() {
  const doc = getFrameDoc();
  injectReaderStyles(doc);
  if (state.currentDocument?.sourceType !== 'pdf') installStaticHtmlSourceBehavior(doc);
  installSourcePageNavResizer(doc);
  installTooltipController(doc);
  doc.addEventListener('mouseup', onFrameMouseUp);
  doc.addEventListener('keydown', onFrameKeyDown);
  doc.addEventListener('keyup', onFrameKeyUp);
  doc.addEventListener('pointerdown', onFramePointerDown, true);
  doc.addEventListener('pointermove', onFramePointerMove, true);
  doc.addEventListener('pointerup', onFramePointerUp, true);
  doc.addEventListener('pointercancel', onFramePointerCancel, true);
  doc.addEventListener('click', onFrameClick, true);
  doc.addEventListener('dblclick', onFrameDoubleClick, true);
  doc.defaultView.addEventListener('resize', () => {
    layoutSideNotes(doc);
    renderQuickMarks(doc);
    renderLayoutResizers(doc);
    syncJumpToNoteButton(doc);
    updateSelectionHighlightButton();
    scheduleHtmlAnchorMetricsRefresh(doc);
    scheduleSplitNotesStateBroadcast(doc);
  });
  doc.defaultView.addEventListener('scroll', () => {
    broadcastSplitSourceScroll(doc);
    scheduleFrameScrollWork(doc);
  }, { passive: true });
  if (state.currentDocument?.sourceType === 'pdf') {
    doc.addEventListener('pdf-page-ready', (event) => handlePdfPageReady(doc, event));
    doc.addEventListener('pdf-view-state-change', () => {
      saveReaderScrollPosition(doc, { precise: true });
    });
  }
  syncFrameModeClass(doc);
  await renderLatexMath(doc);
  rebuildHtmlAnchorMetrics(doc);
}

function installStaticHtmlSourceBehavior(doc) {
  if (doc.documentElement.dataset.readerStaticBehavior === 'true') return;
  doc.documentElement.dataset.readerStaticBehavior = 'true';
  doc.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setStatus('Forms are disabled in static reading mode.', true);
  }, true);
  doc.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const rawHref = link.getAttribute('href') || '';
    if (rawHref.startsWith('#')) {
      const id = decodeURIComponent(rawHref.slice(1));
      const target = id ? doc.getElementById(id) || doc.querySelector(`[data-anchor-id="${cssEscape(id)}"]`) : null;
      target?.scrollIntoView?.({ block: 'start' });
      if (!target) setStatus('The linked section is not available in this source.', true);
      return;
    }
    let url;
    try {
      url = new URL(rawHref, link.baseURI);
    } catch {
      setStatus('This source link is invalid.', true);
      return;
    }
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
      setStatus('This source link type is disabled in static reading mode.', true);
      return;
    }
    const opened = window.open(url.href, '_blank', 'noopener,noreferrer');
    if (!opened) setStatus('The browser blocked the source link. Allow a new tab and try again.', true);
  }, true);
}

function scheduleFrameScrollWork(doc = getFrameDoc()) {
  if (state.lifecycleSuspended) return;
  state.frameScrollDoc = doc;
  state.frameScrolling = true;
  schedulePinnedHighlightNavigatorScrollSync(doc);
  window.clearTimeout(state.frameScrollIdleTimer);
  state.frameScrollIdleTimer = window.setTimeout(() => {
    state.frameScrollIdleTimer = 0;
    state.frameScrolling = false;
    if (state.pdfDeferredRefreshEffects && state.currentDocument?.sourceType === 'pdf') {
      schedulePdfFrameRefresh(doc);
    }
  }, 160);
  if (state.frameScrollRaf) return;
  state.frameScrollRaf = requestAnimationFrame(() => {
    const frameDoc = state.frameScrollDoc;
    state.frameScrollRaf = 0;
    state.frameScrollDoc = null;
    if (!frameDoc || frameDoc !== getFrameDoc()) return;
    saveReaderScrollPosition(frameDoc, { precise: false });
    if (state.activeAnnotationId) syncJumpToNoteButton(frameDoc);
    if (state.quickMarks.length) {
      const now = performance.now();
      if (now - state.quickMarkStackLastSyncAt >= QUICK_MARK_SCROLL_SYNC_INTERVAL_MS) {
        state.quickMarkStackLastSyncAt = now;
        syncQuickMarkStack(frameDoc);
      }
    }
    if (state.currentTarget?.type === 'text' && els.highlightSelectionBtn && !els.highlightSelectionBtn.hidden) {
      updateSelectionHighlightButton();
    }
  });
}

function schedulePinnedHighlightNavigatorScrollSync(doc = getFrameDoc()) {
  if (!doc || !state.pinnedAnnotationId || state.lifecycleSuspended) return;
  state.highlightNavigatorScrollDoc = doc;
  if (state.highlightNavigatorScrollRaf) return;
  const tick = () => {
    state.highlightNavigatorScrollRaf = 0;
    const frameDoc = state.highlightNavigatorScrollDoc;
    if (!frameDoc || frameDoc !== getFrameDoc() || state.lifecycleSuspended || !state.pinnedAnnotationId) {
      state.highlightNavigatorScrollDoc = null;
      return;
    }
    syncPinnedHighlightNavigator(frameDoc);
    if (state.frameScrolling) {
      state.highlightNavigatorScrollRaf = requestAnimationFrame(tick);
    } else {
      state.highlightNavigatorScrollDoc = null;
    }
  };
  state.highlightNavigatorScrollRaf = requestAnimationFrame(tick);
}

function handlePdfPageReady(doc, event) {
  const phase = event.detail?.phase || 'shell';
  if (phase === 'all-pages') {
    state.pdfNeedsFullRefresh = true;
    schedulePdfFrameRefresh(doc);
    return;
  }
  if (!['shell', 'canvas', 'text', 'released', 'evicted'].includes(phase)) return;
  const pageIndex = Number(event.detail?.pageIndex);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return;
  if (phase === 'evicted') {
    for (const annotation of state.annotations) {
      if (!annotationPdfPageIndexes(annotation).includes(pageIndex)) continue;
      clearRenderedAnnotation(doc, annotation.id);
      state.annotationResolution.set(annotation.id, buildAnnotationResolution(doc, annotation));
      const note = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotation.id)}"]`);
      if (annotation.id !== state.pinnedAnnotationId) note?.remove();
    }
    requestSideNoteLayout(doc);
    syncPinnedHighlightNavigator(doc);
    renderQuickMarks(doc);
    return;
  }
  state.pdfDirtyPageIndexes.add(pageIndex);
  schedulePdfFrameRefresh(doc);
}

function schedulePdfFrameRefresh(doc = getFrameDoc()) {
  if (state.lifecycleSuspended || state.pdfFrameRefreshRaf) return;
  state.pdfFrameRefreshRaf = requestAnimationFrame(() => {
    state.pdfFrameRefreshRaf = 0;
    flushPdfFrameRefresh(doc);
  });
}

function flushPdfFrameRefresh(doc = getFrameDoc()) {
  if (!doc || doc !== getFrameDoc()) return;
  const dirtyPageIndexes = new Set(state.pdfDirtyPageIndexes);
  state.pdfDirtyPageIndexes.clear();
  const deferNonessential = state.frameScrolling;
  if (dirtyPageIndexes.size) {
    renderAnnotationsForPdfPageIndexes(doc, dirtyPageIndexes, { deferNonessential });
  }
  if (state.pdfNeedsFullRefresh && !sideNoteEditingActive(doc)) {
    state.pdfNeedsFullRefresh = false;
    state.pdfDeferredRefreshEffects = false;
    renderAnnotations();
    renderNoteList();
    retryPendingPdfAnnotationJump(getFrameDoc());
    return;
  }
  if (deferNonessential) {
    state.pdfDeferredRefreshEffects = true;
  } else {
    if (state.pdfDeferredRefreshEffects) {
      state.pdfDeferredRefreshEffects = false;
      if (!sideNoteEditingActive(doc)) layoutSideNotes(doc);
      renderNoteList();
    }
    state.pdfDeferredRefreshEffects = false;
    renderQuickMarks(doc);
    syncQuickMarkStack(doc);
    syncJumpToNoteButton(doc);
  }
  retryPendingPdfAnnotationJump(doc, dirtyPageIndexes);
  retryPendingHighlightNavigatorJump(doc);
  retryPendingQuickMarkJump(doc);
  retryPendingSourceBookmarkJump(doc);
  scheduleSplitNotesStateBroadcast(doc);
}

function flushDeferredPdfFullRefresh(doc = getFrameDoc()) {
  if (!state.pdfNeedsFullRefresh || sideNoteEditingActive(doc)) return false;
  state.pdfNeedsFullRefresh = false;
  state.pdfDeferredRefreshEffects = false;
  renderAnnotations();
  renderNoteList();
  return true;
}

function onFrameMouseUp(event) {
  if (isSideNoteEditableTarget(event?.target)) return;
  if (state.currentDocument?.sourceType === 'pdf') {
    scheduleFrameSelectionCapture(event);
    return;
  }
  captureFrameSelectionTarget(event?.target || null);
}

function onFramePointerDown(event) {
  if (state.mode !== 'pdf-highlight') return;
  if (!compatibilityFeatureEnabled('pdfRectHighlights')) return;
  const page = event.target?.closest?.('.pdf-page');
  if (!page) return;
  event.preventDefault();
  event.stopPropagation();
  const pageRect = page.getBoundingClientRect();
  const start = pdfLocalPointFromEvent(event, pageRect);
  const overlay = page.ownerDocument.createElement('div');
  overlay.className = 'reader-pdf-highlight-draft';
  (page.querySelector(':scope > .pdf-page-surface') || page).append(overlay);
  state.pdfHighlightSession = {
    page,
    overlay,
    pointerId: event.pointerId,
    start,
    current: start
  };
  page.setPointerCapture?.(event.pointerId);
  updatePdfHighlightDraft();
}

function onFramePointerMove(event) {
  const session = state.pdfHighlightSession;
  if (!session || session.pointerId !== event.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  session.current = pdfLocalPointFromEvent(event, session.page.getBoundingClientRect());
  updatePdfHighlightDraft();
}

function onFramePointerUp(event) {
  const session = state.pdfHighlightSession;
  if (!session || session.pointerId !== event.pointerId) {
    if (isFrameInteractiveControl(event?.target)) return;
    if (state.currentDocument?.sourceType === 'pdf') scheduleFrameSelectionCapture(event);
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  finishPdfHighlightDraft(true).catch((error) => setStatus(error.message, true));
}

function onFramePointerCancel(event) {
  const session = state.pdfHighlightSession;
  if (!session || session.pointerId !== event.pointerId) return;
  finishPdfHighlightDraft(false).catch((error) => setStatus(error.message, true));
}

function scheduleFrameSelectionCapture(event) {
  if (isFrameInteractiveControl(event?.target)) return;
  if (state.readingMode) return;
  if (!['select', 'attach-highlight'].includes(state.mode)) return;
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) return;
  if (isFocusModeActive() && state.mode !== 'attach-highlight') return;
  const eventTarget = event?.target || null;
  window.clearTimeout(state.selectionCaptureTimer);
  state.selectionCaptureTimer = window.setTimeout(() => {
    state.selectionCaptureTimer = 0;
    captureFrameSelectionTarget(eventTarget);
  }, 0);
}

function captureFrameSelectionTarget(eventTarget = null) {
  const target = captureSelectionTarget() || captureAtomicPointerTarget({ target: eventTarget });
  if (!target) return false;
  if (state.mode === 'attach-highlight') {
    attachTargetToActiveAnnotation(target).catch((error) => setStatus(error.message, true));
    return true;
  }
  state.currentTarget = target;
  showSelectionHighlightButton(target.clientRect);
  return true;
}

function pdfLocalPointFromEvent(event, pageRect) {
  return {
    x: clampNumber(event.clientX - pageRect.left, 0, pageRect.width, 0),
    y: clampNumber(event.clientY - pageRect.top, 0, pageRect.height, 0)
  };
}

function updatePdfHighlightDraft() {
  const session = state.pdfHighlightSession;
  if (!session) return;
  const left = Math.min(session.start.x, session.current.x);
  const top = Math.min(session.start.y, session.current.y);
  const width = Math.abs(session.current.x - session.start.x);
  const height = Math.abs(session.current.y - session.start.y);
  Object.assign(session.overlay.style, {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  });
}

async function finishPdfHighlightDraft(commit) {
  const session = state.pdfHighlightSession;
  if (!session) return;
  state.pdfHighlightSession = null;
  session.page.releasePointerCapture?.(session.pointerId);
  session.overlay.remove();
  if (!commit) return;
  const pageRect = session.page.getBoundingClientRect();
  const rect = normalizePdfRectFromPoints(session.start, session.current, {
    width: pageRect.width,
    height: pageRect.height
  });
  if (!rect || rect.width < 0.004 || rect.height < 0.004) {
    setStatus('PDF highlight is too small.', true);
    return;
  }
  await createPdfRectHighlight(session.page, rect);
}

async function createPdfRectHighlight(page, rect) {
  const pageIndex = Number(page.dataset.pdfPageIndex);
  if (!Number.isFinite(pageIndex)) return;
  const target = {
    type: 'pdf-rect',
    pageId: pageIdForElement(page) || page.dataset.pageId || page.id || null,
    anchorId: getAnchorId(page),
    domPath: null,
    pageIndex,
    pageLabel: page.dataset.pdfPageLabel || String(pageIndex + 1),
    rect,
    exact: ''
  };
  const annotation = await createAnnotationFromTarget(target, {
    highlight: { enabled: true, color: 'yellow', kind: 'pdf-rect' },
    note: defaultBlankNote()
  });
  recordAnnotationHistory('PDF highlight creation', null, annotation, annotation.id);
  await reloadAnnotationsAndRender(annotation.id);
  setMode('select');
  state.suppressPdfHighlightClick = true;
  window.setTimeout(() => {
    state.suppressPdfHighlightClick = false;
  }, 0);
  setStatus('PDF highlight created.');
}

function onFrameKeyDown(event) {
  if (handleSideNoteKeyboardAction(event)) return;
  if (handleReaderPositionShortcut(event)) return;
  if (isFrameInteractiveControl(event?.target)) return;
  if (handleSaveBundleHotkey(event)) return;
  if (handleInkToolHotkey(event)) return;
  if (handleHistoryHotkey(event)) return;
  if (event.key !== 'Escape') return;
  if (event.target?.closest?.('[contenteditable="plaintext-only"]')) return;
  handleEscapeKey(event);
}

function handleDocumentKeyDown(event) {
  if (handleReaderPositionShortcut(event)) return;
  if (handleSaveBundleHotkey(event)) return;
  if (handleInkToolHotkey(event)) return;
  if (handleHistoryHotkey(event)) return;
  if (event.key === 'Escape') handleEscapeKey(event);
}

function handleSideNoteKeyboardAction(event) {
  const target = event.target;
  const note = target?.closest?.('.reader-side-note');
  if (!note || target?.isContentEditable) return false;
  const annotationId = note.dataset.annotationId;
  const blank = target.closest?.('.reader-side-note-blank');
  if (blank && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
    convertBlankBlockToText(annotationId, blank.dataset.blockId, { target: blank })
      .catch((error) => setStatus(error.message, true));
    return true;
  }
  const field = target.closest?.('.reader-side-note-title, .reader-side-note-body');
  if (field && ['Enter', 'F2'].includes(event.key)) {
    if (field.classList.contains('is-rendered')) return false;
    event.preventDefault();
    event.stopPropagation();
    beginInlineTextEdit(
      annotationId,
      note,
      field.classList.contains('reader-side-note-title') ? 'title' : 'body',
      null,
      field.dataset.blockId || ''
    );
    return true;
  }
  return false;
}

function handleReaderPositionShortcut(event) {
  if (!event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return false;
  if (event.target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return false;
  const key = event.key?.toLowerCase?.();
  if (key !== 'n' && key !== 'm') return false;
  event.preventDefault();
  event.stopPropagation();
  if (key === 'n') {
    createNoteAtReadingPosition().catch((error) => setStatus(error.message, true));
  } else {
    placeQuickMarkAtReadingPosition();
  }
  return true;
}

function handleSaveBundleHotkey(event) {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return false;
  if (event.key?.toLowerCase?.() !== 's') return false;
  event.preventDefault();
  event.stopPropagation();
  exportCurrentBundle().catch((error) => setStatus(error.message, true));
  return true;
}

function handleHistoryHotkey(event) {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return false;
  if (event.target?.closest?.('[contenteditable="plaintext-only"], textarea, input, select')) return false;
  const key = event.key?.toLowerCase?.();
  if (key !== 'z' && key !== 'y') return false;
  event.preventDefault();
  event.stopPropagation();
  const redo = key === 'y' || event.shiftKey;
  (redo ? redoHistoryCommand() : undoHistoryCommand()).catch((error) => setStatus(error.message, true));
  return true;
}

function handleInkToolHotkey(event) {
  if (event.key?.toLowerCase?.() !== 'e' || !event.shiftKey || !event.metaKey) return false;
  event.preventDefault();
  event.stopPropagation();
  state.inkTool = state.inkTool === 'eraser' ? 'pen' : 'eraser';
  syncInkToolUi();
  setStatus(`Ink tool: ${state.inkTool === 'eraser' ? 'eraser' : 'pen'}.`);
  return true;
}

function onFrameKeyUp(event) {
  if (isFrameInteractiveControl(event?.target)) return;
  if (isSideNoteEditableTarget(event?.target)) return;
  if (state.readingMode) return;
  if (!['select', 'attach-highlight'].includes(state.mode)) return;
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) return;
  if (isFocusModeActive() && state.mode !== 'attach-highlight') return;
  if (!event.shiftKey && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
  const target = captureSelectionTarget();
  if (!target) return;
  if (state.mode === 'attach-highlight') {
    attachTargetToActiveAnnotation(target).catch((error) => setStatus(error.message, true));
    return;
  }
  state.currentTarget = target;
  showSelectionHighlightButton(target.clientRect);
}

function isSideNoteEditableTarget(target) {
  return Boolean(target?.closest?.('.reader-side-note-title, .reader-side-note-body'));
}

function isFrameInteractiveControl(target) {
  if (target?.closest?.('.reader-side-note, .reader-jump-note-button')) return false;
  return Boolean(target?.closest?.('#pdfToolbar, input, textarea, select, button, [contenteditable]:not([contenteditable="false"])'));
}

function editableSelectionActive(element) {
  if (!element) return false;
  const selection = element.ownerDocument?.getSelection?.();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  return element.contains(range.commonAncestorContainer)
    || element.contains(range.startContainer)
    || element.contains(range.endContainer);
}

function onFrameClick(event) {
  const frameDoc = getFrameDoc();
  const sideNoteAction = event.target?.closest?.('.reader-side-note [data-side-note-action]');
  const noteLink = event.target?.closest?.('.reader-side-note-body.is-rendered a[href]');
  if (noteLink) {
    openRenderedSideNoteLink(noteLink, frameDoc, event);
    return;
  }
  if (isFrameInteractiveControl(event.target)) return;
  if (
    state.currentDocument?.sourceType === 'pdf'
    && event.target?.closest?.('.textLayer')
    && frameTextSelectionActive(frameDoc)
  ) {
    return;
  }
  if (!sideNoteAction
    && event.target?.closest?.('.reader-side-note-body.is-rendered')
    && frameTextSelectionActive(frameDoc)) return;
  if (state.suppressPdfHighlightClick) {
    state.suppressPdfHighlightClick = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (!sideNoteAction && state.currentDocument?.sourceType !== 'pdf' && frameTextSelectionActive(frameDoc)) {
    return;
  }
  if (event.target?.closest?.('.reader-layout-resizer')) {
    event.stopPropagation();
    return;
  }
  const jumpButton = event.target?.closest?.('.reader-jump-note-button');
  if (jumpButton) {
    event.preventDefault();
    event.stopPropagation();
    if (state.activeAnnotationId) jumpToAnnotation(state.activeAnnotationId);
    return;
  }
  const sideNote = event.target?.closest?.('.reader-side-note');
  if (sideNote) {
    const annotationId = sideNote.dataset.annotationId;
    const action = event.target?.closest?.('[data-side-note-action]')?.dataset.sideNoteAction;
    const editableTarget = event.target?.closest?.('.reader-side-note-title, .reader-side-note-body');
    if (annotationId === state.activeAnnotationId && editableTarget && !editableTarget.classList.contains('is-rendered') && !action) {
      hideSelectionHighlightButton();
      event.stopPropagation();
      beginInlineTextEdit(annotationId, sideNote, editableTarget.classList.contains('reader-side-note-title') ? 'title' : 'body', event, editableTarget.dataset.blockId || '');
      return;
    }
    hideSelectionHighlightButton();
    frameDoc.getSelection()?.removeAllRanges();
    if (action === 'image-alt') {
      activateAnnotation(annotationId, false);
      event.stopPropagation();
      return;
    }
    if (!['ink-color', 'ink-width', 'ink-pressure'].includes(action)) event.preventDefault();
    event.stopPropagation();
    if (action === 'pin') {
      togglePinnedNote(annotationId);
      return;
    }
    if (action === 'toggle-collapse') {
      toggleSideNoteCollapse(annotationId);
      return;
    }
    if (action === 'edit-text') {
      beginInlineTextEdit(annotationId, sideNote, 'body', null, event.target?.dataset?.blockId || '');
      return;
    }
    if (action === 'render-text') {
      tryRenderInlineTextBlock(annotationId, sideNote, event.target)
        .catch((error) => setStatus(error.message, true));
      return;
    }
    if (action === 'insert-text' || action === 'insert-ink' || action === 'insert-image' || action === 'remove-block') {
      handlePinnedNoteBlockAction(annotationId, action, event.target).catch((error) => setStatus(error.message, true));
      return;
    }
    if (action === 'attach') {
      startAttachHighlightMode(annotationId);
      return;
    }
    if (action === 'remove-highlight') {
      startRemoveHighlightMode(annotationId);
      return;
    }
    if (action?.startsWith('ink-')) {
      handleSideInkAction(event, annotationId, action).catch((error) => setStatus(error.message, true));
      return;
    }
    if (action === 'focus') {
      toggleFocusMode(annotationId);
      return;
    }
    if (action === 'delete') {
      requestDeleteAnnotation(annotationId, event.target);
      return;
    }
    const blankTarget = event.target?.closest?.('.reader-side-note-blank');
    if (blankTarget) {
      convertBlankBlockToText(annotationId, blankTarget.dataset.blockId, event).catch((error) => setStatus(error.message, true));
      return;
    }
    activateAnnotation(annotationId, false);
    return;
  }
  if (event.target?.classList?.contains('reader-side-note-layer')) {
    if (state.focusModeAnnotationId) return;
    clearFrameSelection(frameDoc);
    clearActiveAnnotation();
    return;
  }
  if (state.mode === 'attach-highlight') return;
  const highlight = event.target?.closest?.('.reader-highlight');
  if (state.readingMode) {
    hideSelectionHighlightButton();
    clearFrameSelection(frameDoc);
    return;
  }
  if (state.mode === 'remove-highlight') {
    event.preventDefault();
    event.stopPropagation();
    if (highlight) {
      removeHighlightFromActiveAnnotation(highlight).catch((error) => setStatus(error.message, true));
    }
    return;
  }
  if (highlight) {
    clearFrameSelection(frameDoc);
    activateAnnotation(highlight.dataset.annotationId, false);
    return;
  }
  if (state.mode !== 'blank-note') {
    if (state.focusModeAnnotationId) return;
    hideSelectionHighlightButton();
    clearFrameSelection(frameDoc);
    clearActiveAnnotation();
    return;
  }
  if (isFocusModeActive()) {
    setStatus('Disable focus mode before creating a new note.', true);
    return;
  }
  if (!compatibilityFeatureEnabled('blockNotes')) {
    setStatus('This document is display-only; stable note anchors were not found during import.', true);
    setMode('select');
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (state.currentDocument?.sourceType === 'pdf') {
    createBlankSideNoteAt(event).catch((error) => setStatus(error.message, true));
    frameDoc.getSelection()?.removeAllRanges();
    return;
  }
  const block = closestAnchorElement(event.target);
  if (!block) {
    setStatus('No anchorable block was found at that click position.', true);
    return;
  }
  const anchorId = getAnchorId(block);
  const target = {
    type: 'block',
    pageId: pageIdForElement(block),
    anchorId,
    domPath: anchorId ? null : domPathFor(block),
    exact: '',
    clientHint: { x: event.clientX, y: event.clientY }
  };
  createBlockSideNote(target).catch((error) => setStatus(error.message, true));
  frameDoc.getSelection()?.removeAllRanges();
}

function openRenderedSideNoteLink(link, doc, event) {
  const href = link.getAttribute('href') || '';
  event.preventDefault();
  event.stopPropagation();
  if (href.startsWith('#')) {
    const target = doc.getElementById(decodeURIComponent(href.slice(1)));
    target?.scrollIntoView?.({ block: 'start' });
    return;
  }
  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return;
  }
  if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return;
  window.open(url.href, '_blank', 'noopener,noreferrer');
}

function onFrameDoubleClick(event) {
  if (isFrameInteractiveControl(event.target)) return;
  const sideNote = event.target?.closest?.('.reader-side-note');
  if (!sideNote) {
    if (isSideNoteBlankAreaEvent(event)) {
      event.preventDefault();
      event.stopPropagation();
      if (isFocusModeActive()) {
        setStatus('Disable focus mode before creating a new note.', true);
        return;
      }
      createBlankSideNoteAt(event).catch((error) => setStatus(error.message, true));
    }
    return;
  }
  const renderedBody = event.target?.closest?.('.reader-side-note-body.is-rendered');
  if (renderedBody) {
    event.preventDefault();
    event.stopPropagation();
    beginInlineTextEdit(
      sideNote.dataset.annotationId,
      sideNote,
      'body',
      event,
      renderedBody.dataset.blockId || ''
    );
    return;
  }
  event.preventDefault();
  event.stopPropagation();
}

function isSideNoteBlankAreaEvent(event) {
  if (event.target?.classList?.contains('reader-side-note-layer')) return true;
  if (event.target?.closest?.('.reader-side-note, .reader-layout-resizer, .reader-jump-note-button')) return false;
  const layer = event.currentTarget?.querySelector?.('.reader-side-note-layer')
    || getFrameDoc()?.querySelector?.('.reader-side-note-layer');
  if (!layer) return false;
  const rect = layer.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
}

function captureSelectionTarget() {
  const doc = getFrameDoc();
  const selection = doc.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  const targets = highlightTargetsForSelectionRange(doc, range);
  if (!targets.length) return null;
  const [primary, ...attachedTargets] = targets;
  primary.targets = attachedTargets;
  primary.clientRect = rectForSelectionTarget(range, targets);
  return primary;
}

function showSelectionHighlightButton(rect) {
  if (!rect || !rect.width) return;
  positionSelectionHighlightButton(rect);
  els.highlightSelectionBtn.hidden = false;
}

function positionSelectionHighlightButton(rect) {
  const padding = 12;
  const left = Math.max(padding, Math.min(rect.left - 42, window.innerWidth - 46));
  const top = Math.max(padding, Math.min(rect.top, window.innerHeight - 46));
  els.highlightSelectionBtn.style.left = `${left}px`;
  els.highlightSelectionBtn.style.top = `${top}px`;
}

function updateSelectionHighlightButton() {
  if (!state.currentTarget || !els.highlightSelectionBtn || state.currentTarget.type !== 'text') return;
  const rect = rectForTextTarget(state.currentTarget);
  if (!rect || rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth) {
    els.highlightSelectionBtn.hidden = true;
    return;
  }
  positionSelectionHighlightButton(rect);
  els.highlightSelectionBtn.hidden = false;
}

function rectForTextTarget(target) {
  const doc = getFrameDoc();
  const block = resolveTargetElement(doc, target);
  if (!block) return target.clientRect || null;
  const range = rangeFromOffsets(block, target.startOffset, target.endOffset);
  if (!range) return target.clientRect || null;
  try {
    const rect = range.getBoundingClientRect();
    return rect && rect.width ? rectInParent(rect) : target.clientRect || null;
  } finally {
    range.detach?.();
  }
}

function hideSelectionHighlightButton() {
  if (els.highlightSelectionBtn) els.highlightSelectionBtn.hidden = true;
  state.currentTarget = null;
}

function clearFrameSelection(doc = getFrameDoc()) {
  doc?.getSelection?.()?.removeAllRanges();
  doc?.querySelectorAll?.('.pdf-selection-layer').forEach((layer) => {
    layer.replaceChildren();
  });
}

function toggleReadingMode() {
  setReadingMode(!state.readingMode);
}

function setReadingMode(enabled) {
  state.readingMode = Boolean(enabled);
  if (state.readingMode) {
    hideSelectionHighlightButton();
    getFrameDoc()?.getSelection()?.removeAllRanges();
    state.activeAnnotationId = null;
    state.pinnedAnnotationId = null;
    syncPinnedNoteChrome();
    state.focusModeAnnotationId = null;
    state.focusModeNoteTop = null;
    state.focusModeAnchorTop = null;
    state.focusModeNoteViewportTop = null;
    state.focusModeAnchorViewportTop = null;
    setMode('select');
    setNotesPanelCollapsed(true);
  }
  syncReadingModeControls();
  renderAnnotations();
  renderNoteList();
  setStatus(state.readingMode ? 'Pure reading mode enabled.' : 'Pure reading mode disabled.');
}

function toggleReadingHighlights() {
  state.readingShowHighlights = !state.readingShowHighlights;
  syncReadingModeControls();
  renderAnnotations();
  setStatus(state.readingShowHighlights ? 'Reading highlights shown.' : 'Reading highlights hidden.');
}

function syncReadingModeControls() {
  document.body.classList.toggle('is-reading-mode', state.readingMode);
  els.readingModeBtn.classList.toggle('is-active', state.readingMode);
  els.readingModeBtn.setAttribute('aria-pressed', String(state.readingMode));
  els.readingModeBtn.setAttribute('aria-label', state.readingMode ? 'Exit pure reading mode' : 'Enter pure reading mode');
  els.readingModeBtn.title = state.readingMode ? 'Exit pure reading mode' : 'Enter pure reading mode';
  els.readingHighlightBtn.hidden = !state.readingMode;
  els.readingHighlightBtn.classList.toggle('is-active', state.readingMode && state.readingShowHighlights);
  els.readingHighlightBtn.setAttribute('aria-pressed', String(state.readingShowHighlights));
  els.readingHighlightBtn.title = state.readingShowHighlights ? 'Hide highlights while reading' : 'Show highlights while reading';
  els.readingHighlightBtn.setAttribute('aria-label', els.readingHighlightBtn.title);
  if (els.clipToolBtn) els.clipToolBtn.disabled = state.readingMode;
  if (state.iframeLoaded) syncFrameReadingMode(getFrameDoc());
  syncCompatibilityControls();
}

function compatibilityFeatureEnabled(feature, fallback = true) {
  if (state.currentDocument?.sourceType === 'pdf' && feature === 'singleBlockTextHighlights') return true;
  const features = state.currentDocument?.compatibility?.features;
  if (!features || !Object.hasOwn(features, feature)) return fallback;
  return Boolean(features[feature]);
}

function compatibilityWarningSummary() {
  const warnings = state.currentDocument?.compatibility?.warnings || [];
  return warnings.length ? warnings[0] : '';
}

function syncCompatibilityControls() {
  const blockNotes = compatibilityFeatureEnabled('blockNotes');
  const textHighlights = compatibilityFeatureEnabled('singleBlockTextHighlights');
  if (els.clipToolBtn) {
    els.clipToolBtn.disabled = state.readingMode || !blockNotes;
    const label = blockNotes ? 'Drag quick mark or press Enter to place it at the reading position' : 'Quick marks unavailable for this document';
    els.clipToolBtn.title = label;
    els.clipToolBtn.setAttribute('aria-label', label);
  }
  if (els.highlightSelectionBtn && !textHighlights) hideSelectionHighlightButton();
}

function syncPinnedNoteChrome() {
  document.body.classList.toggle('has-pinned-note', Boolean(state.pinnedAnnotationId));
}

function syncFrameReadingMode(doc) {
  if (!doc?.body) return;
  const previous = doc.body.classList.contains('reader-reading-mode');
  doc.body.classList.toggle('reader-reading-mode', state.readingMode);
  if (previous === state.readingMode) return;
  const FrameCustomEvent = doc.defaultView?.CustomEvent || CustomEvent;
  doc.dispatchEvent(new FrameCustomEvent('reader-reading-mode-change', {
    detail: { readingMode: state.readingMode }
  }));
}

function toggleNotesPanel() {
  if (state.readingMode) return;
  setNotesPanelCollapsed(!els.rightPanel.classList.contains('is-collapsed'));
}

function setNotesPanelCollapsed(collapsed) {
  if (!collapsed) applyNotesPanelWidth();
  els.rightPanel.classList.toggle('is-collapsed', collapsed);
  syncNotesPanelControls();
  requestNavigatorInkPreviewRedraw();
  if (state.iframeLoaded) syncFrameNotesPanelOverlayState(getFrameDoc());
}

function syncNotesPanelControls() {
  const collapsed = els.rightPanel.classList.contains('is-collapsed');
  els.toggleNotesBtn.setAttribute('aria-expanded', String(!collapsed));
  const label = collapsed ? 'Open notes navigator' : 'Close notes navigator';
  els.toggleNotesBtn.title = label;
  els.toggleNotesBtn.setAttribute('aria-label', label);
  const arrow = els.toggleNotesBtn.querySelector('.notes-tab-arrow');
  if (arrow) arrow.textContent = collapsed ? '‹' : '›';
}

async function openSplitNotesWindow() {
  if (!state.docId) {
    setStatus('Open a source before splitting notes.', true);
    return;
  }
  const splitWindowTarget = measureSplitSourceWindowTarget();
  ensureSplitNotesChannel();
  const url = urlWithStorage('reader-notes.html', {
    doc: state.docId,
    session: state.splitSessionId
  }, state.storageMode);
  const notesWindow = window.open(url, `marginalia-notes-${state.splitSessionId}`, splitNotesWindowFeatures(splitWindowTarget));
  if (!notesWindow) {
    closeSplitNotesSession({ notify: false });
    setStatus('Browser blocked the split notes window.', true);
    return;
  }
  state.splitNotesWindow = notesWindow;
  state.splitSourceWindowTarget = splitWindowTarget;
  startSplitNotesWindowMonitor();
  setSplitNotesActive(true);
  resizeSourceWindowForSplit(splitWindowTarget);
  state.splitChannel.post('source-state', buildSplitNotesSourceState());
  setStatus('Split notes window opened.');
}

async function toggleSplitNotesWindow() {
  if (state.splitNotesActive) {
    closeSplitNotesSession({ notify: true, closeWindow: true });
    setStatus('Split notes window closed.');
    return;
  }
  await openSplitNotesWindow();
}

function measureSplitSourceWindowTarget(doc = state.iframeLoaded ? getFrameDoc() : null) {
  const frameView = doc?.defaultView;
  if (!frameView) return null;
  const metrics = layoutMetrics(doc, { splitSourceOnly: false });
  const noteWidth = Math.max(0, Math.round(metrics.viewportWidth - metrics.sourceWidth));
  const parentChromeWidth = Math.max(0, window.outerWidth - window.innerWidth);
  const parentFrameGap = Math.max(0, window.innerWidth - frameView.innerWidth);
  const targetInnerWidth = Math.max(420, Math.round(parentFrameGap + metrics.sourceWidth));
  const targetOuterWidth = Math.max(420, Math.round(targetInnerWidth + parentChromeWidth));
  const popupWidth = Math.round(normalizeNotesPanelWidth(state.notesPanelWidth || NOTES_PANEL_WIDTH.default));
  const popupHeight = Math.max(420, Math.round(window.outerHeight || window.innerHeight || 900));
  const screenLeft = Number.isFinite(window.screenX) ? window.screenX : window.screenLeft;
  const screenTop = Number.isFinite(window.screenY) ? window.screenY : window.screenTop;
  return {
    noteWidth,
    sourceWidth: Math.round(metrics.sourceWidth),
    targetInnerWidth,
    targetOuterWidth,
    popupWidth,
    popupHeight,
    popupLeft: Number.isFinite(screenLeft) ? Math.round(screenLeft + targetOuterWidth) : null,
    popupTop: Number.isFinite(screenTop) ? Math.round(screenTop) : null
  };
}

function splitNotesWindowFeatures(target) {
  const width = Math.round(target?.popupWidth || normalizeNotesPanelWidth(state.notesPanelWidth || NOTES_PANEL_WIDTH.default));
  const height = Math.round(target?.popupHeight || 900);
  const features = ['popup', `width=${width}`, `height=${height}`];
  if (Number.isFinite(target?.popupLeft)) features.push(`left=${target.popupLeft}`);
  if (Number.isFinite(target?.popupTop)) features.push(`top=${target.popupTop}`);
  return features.join(',');
}

function resizeSourceWindowForSplit(target) {
  if (!target || target.noteWidth < 24) return;
  document.documentElement.style.setProperty('--reader-split-source-window-width', `${target.targetInnerWidth}px`);
  state.splitSourceFallbackResizeReadyAt = performance.now() + 700;
  if (state.splitSourceFallbackTimer) window.clearTimeout(state.splitSourceFallbackTimer);
  state.splitSourceFallbackTimer = window.setTimeout(() => {
    state.splitSourceFallbackTimer = 0;
    if (!state.splitNotesActive || state.splitSourceWindowTarget !== target) return;
    const resizeBlocked = Math.abs(window.innerWidth - target.targetInnerWidth) > 24;
    setSplitSourceWidthFallback(resizeBlocked);
  }, 220);
  try {
    window.resizeTo(target.targetOuterWidth, window.outerHeight || window.innerHeight);
  } catch {
    // Browser tabs often reject script-driven resizing; split layout still removes the note column.
  }
}

function setSplitSourceWidthFallback(active) {
  document.body.classList.toggle('reader-split-source-width-fallback', Boolean(active));
  if (!active) document.documentElement.style.removeProperty('--reader-split-source-window-width');
}

function maybeReleaseSplitSourceWidthFallback() {
  if (!state.splitNotesActive || !document.body.classList.contains('reader-split-source-width-fallback')) return;
  if (performance.now() < state.splitSourceFallbackResizeReadyAt) return;
  setSplitSourceWidthFallback(false);
  if (state.iframeLoaded) {
    const doc = getFrameDoc();
    updateResponsiveReaderLayout(doc);
    renderLayoutResizers(doc);
    scheduleSplitNotesStateBroadcast(doc);
  }
}

function ensureSplitNotesChannel() {
  if (state.splitChannel && state.splitSessionId) return state.splitChannel;
  state.splitSessionId = randomSessionId();
  state.splitChannel = createReaderSessionChannel({
    docId: state.docId,
    sessionId: state.splitSessionId,
    role: 'source',
    onMessage: handleSplitNotesMessage
  });
  return state.splitChannel;
}

function handleSplitNotesMessage(envelope) {
  const { type, payload = {} } = envelope;
  if (type === 'notes-ready' || type === 'request-state') {
    setSplitNotesActive(true, { render: false });
    scheduleSplitNotesStateBroadcast();
    return;
  }
  if (type === 'notes-scroll') {
    applySplitNotesScroll(payload.scrollY, envelope.sentAt);
    return;
  }
  if (type === 'activate-annotation') {
    if (payload.annotationId) activateAnnotation(payload.annotationId, false);
    return;
  }
  if (type === 'jump-to-annotation') {
    if (payload.annotationId) activateAnnotation(payload.annotationId, true);
    return;
  }
  if (type === 'save-note-text') {
    saveSplitNoteText(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'append-ink-stroke') {
    appendSplitInkStroke(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'insert-note-block') {
    insertSplitNoteBlock(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'insert-note-image') {
    insertSplitNoteImage(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'save-note-image-alt') {
    saveSideNoteImageAlt(payload.annotationId, payload.blockId, payload.alt).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'remove-note-block') {
    removeSplitNoteBlock(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'delete-annotation') {
    deleteSplitAnnotation(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'set-ink-tool') {
    setSplitInkTool(payload);
    return;
  }
  if (type === 'clear-ink-block') {
    clearSplitInkBlock(payload).catch((error) => setStatus(error.message, true));
    return;
  }
  if (type === 'close-notes') {
    closeSplitNotesSession({ notify: false });
  }
}

function setSplitNotesActive(active, options = {}) {
  const next = Boolean(active);
  const changed = state.splitNotesActive !== next;
  state.splitNotesActive = next;
  document.body.classList.toggle('reader-split-notes-source', next);
  els.splitNotesBtn?.classList.toggle('is-active', next);
  els.splitNotesBtn?.setAttribute('aria-pressed', String(next));
  if (els.splitNotesBtn) {
    els.splitNotesBtn.title = next ? 'Close split notes window' : 'Open split notes window';
    els.splitNotesBtn.setAttribute('aria-label', next ? 'Close split notes window' : 'Open split notes window');
  }
  if (state.iframeLoaded) {
    const doc = getFrameDoc();
    doc?.body?.classList.toggle('reader-split-notes-source', next);
    syncFrameNotesPanelOverlayState(doc);
  }
  if (changed && options.render !== false) renderAnnotations();
}

function closeSplitNotesSession(options = {}) {
  const channel = state.splitChannel;
  const notesWindow = state.splitNotesWindow;
  if (options.notify && channel) channel.post('close-source');
  if (options.closeWindow && notesWindow && !notesWindow.closed) {
    try {
      notesWindow.close();
    } catch {
      // Some browsers may reject scripted window closing; the channel message is the fallback.
    }
  }
  if (state.splitStateRaf) {
    cancelAnimationFrame(state.splitStateRaf);
    state.splitStateRaf = 0;
  }
  if (state.splitScrollRaf) {
    cancelAnimationFrame(state.splitScrollRaf);
    state.splitScrollRaf = 0;
  }
  if (state.splitSourceFallbackTimer) {
    window.clearTimeout(state.splitSourceFallbackTimer);
    state.splitSourceFallbackTimer = 0;
  }
  channel?.close();
  state.splitChannel = null;
  state.splitSessionId = null;
  state.splitNotesWindow = null;
  state.splitSourceWindowTarget = null;
  state.splitSourceFallbackResizeReadyAt = 0;
  setSplitSourceWidthFallback(false);
  if (state.splitWindowMonitorTimer) {
    window.clearInterval(state.splitWindowMonitorTimer);
    state.splitWindowMonitorTimer = 0;
  }
  setSplitNotesActive(false);
}

function startSplitNotesWindowMonitor() {
  if (state.splitWindowMonitorTimer) window.clearInterval(state.splitWindowMonitorTimer);
  state.splitWindowMonitorTimer = window.setInterval(() => {
    if (!state.splitNotesWindow || state.splitNotesWindow.closed) {
      closeSplitNotesSession({ notify: false });
    }
  }, 1000);
}

function scheduleSplitNotesStateBroadcast(doc = state.iframeLoaded ? getFrameDoc() : null) {
  if (!state.splitNotesActive || !state.splitChannel) return;
  state.splitStateDoc = doc;
  if (state.splitStateRaf) return;
  state.splitStateRaf = requestAnimationFrame(() => {
    state.splitStateRaf = 0;
    if (!state.splitNotesActive || !state.splitChannel) return;
    state.splitChannel.post('source-state', buildSplitNotesSourceState(state.splitStateDoc || getFrameDoc()));
    state.splitStateDoc = null;
  });
}

function broadcastSplitSourceScroll(doc = getFrameDoc()) {
  if (!state.splitNotesActive || !state.splitChannel || !doc?.defaultView) return;
  const y = Math.max(0, doc.defaultView.scrollY || 0);
  if (consumeSplitRemoteScrollEcho(y)) return;
  state.splitPendingScrollY = y;
  if (state.splitScrollRaf) return;
  state.splitScrollRaf = requestAnimationFrame(() => {
    state.splitScrollRaf = 0;
    if (!state.splitNotesActive || !state.splitChannel || !doc?.defaultView) return;
    const currentScrollY = Number(doc.defaultView.scrollY);
    const scrollY = Math.max(0, Number.isFinite(currentScrollY) ? currentScrollY : state.splitPendingScrollY || 0);
    state.splitPendingScrollY = scrollY;
    state.splitLastLocalScrollSentAt = Date.now();
    state.splitChannel.post('source-scroll', {
      scrollY
    });
  });
}

function applySplitNotesScroll(scrollY, sentAt = 0) {
  if (Number(sentAt) && Number(sentAt) < state.splitLastLocalScrollSentAt) return;
  if (!state.iframeLoaded) return;
  const doc = getFrameDoc();
  const view = doc?.defaultView;
  if (!view) return;
  const y = Math.max(0, Number(scrollY) || 0);
  if (Math.abs((view.scrollY || 0) - y) < 1) return;
  markSplitRemoteScrollTarget(y);
  view.scrollTo(0, y);
}

function markSplitRemoteScrollTarget(scrollY) {
  state.splitRemoteScrollTargetY = Math.max(0, Number(scrollY) || 0);
  state.splitRemoteScrollTargetUntil = performance.now() + 350;
}

function consumeSplitRemoteScrollEcho(scrollY) {
  if (state.splitRemoteScrollTargetY == null) return false;
  if (performance.now() > state.splitRemoteScrollTargetUntil) {
    clearSplitRemoteScrollTarget();
    return false;
  }
  if (Math.abs(scrollY - state.splitRemoteScrollTargetY) <= 1.5) {
    clearSplitRemoteScrollTarget();
    return true;
  }
  clearSplitRemoteScrollTarget();
  return false;
}

function clearSplitRemoteScrollTarget() {
  state.splitRemoteScrollTargetY = null;
  state.splitRemoteScrollTargetUntil = 0;
}

function buildSplitNotesSourceState(doc = state.iframeLoaded ? getFrameDoc() : null) {
  const view = doc?.defaultView;
  const scrollHeight = doc
    ? Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0, view?.innerHeight || 0)
    : 0;
  return {
    docId: state.docId,
    documentTitle: state.currentDocument?.title || state.docId || '',
    sourceType: state.currentDocument?.sourceType || 'html',
    activeAnnotationId: state.activeAnnotationId || null,
    scrollY: Math.max(0, view?.scrollY || 0),
    scrollHeight,
    viewportHeight: Math.max(0, view?.innerHeight || 0),
    inkTool: state.inkTool,
    inkColor: state.inkColor,
    inkWidth: state.inkWidth,
    inkPressureEnabled: state.inkPressureEnabled,
    annotations: state.annotations.map(cloneAnnotation),
    noteMetrics: doc ? splitNoteMetrics(doc) : []
  };
}

function splitNoteMetrics(doc) {
  return state.annotations.map((annotation) => {
    const resolution = state.annotationResolution.get(annotation.id) || buildAnnotationResolution(doc, annotation);
    const position = sideNotePosition(doc, annotation);
    const hintedY = Number(annotation?.target?.clientHint?.documentY);
    return {
      id: annotation.id,
      top: Number.isFinite(position?.top)
        ? position.top
        : Number.isFinite(hintedY)
          ? hintedY
          : 24,
      status: resolution.status || 'resolved',
      pageNumber: annotationPrimaryPdfPageNumber(annotation) || null,
      locationLabel: annotationSectionLabel(annotation)
    };
  });
}

async function saveSplitNoteText(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  await flushPendingAnnotationBlockSave(annotationId);
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  if (payload.blockId) {
    const block = blocks.find((item) => item.id === payload.blockId);
    if (block?.type !== 'text') return;
    block.markdown = String(payload.markdown || '');
  }
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const nextAnnotation = {
    ...annotation,
    note: {
      ...(annotation.note || {}),
      title: payload.title === undefined ? annotation.note?.title || '' : String(payload.title || ''),
      schemaVersion: 2,
      ...legacy,
      blocks
    }
  };
  const updated = await storage.updateAnnotation(state.docId, annotationId, annotationForStorage(nextAnnotation));
  const runtimeUpdated = annotationWithRuntimeInk(updated);
  recordAnnotationHistory('note edit', before, runtimeUpdated, annotationId);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? runtimeUpdated : item);
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
  setStatus('Annotation saved.');
}

async function appendSplitInkStroke(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  const blockId = String(payload.blockId || '');
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId) return;
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type !== 'ink') return;
  const stroke = normalizeSplitInkStroke(payload.stroke);
  if (!stroke || stroke.points.length < 2) return;
  block.ink.strokes.push(stroke);
  updateInkLogicalBottomForStroke(block.ink, stroke);
  const history = sideInkHistory(annotationId, blockId);
  history.undo.push({ type: 'add', stroke });
  history.redo = [];
  const updated = await saveAnnotationBlocks(annotation, blocks, { render: false });
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
  return updated;
}

async function insertSplitNoteBlock(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  const blockType = payload.blockType === 'ink' ? 'ink' : 'text';
  const beforeBlockId = String(payload.beforeBlockId || '');
  const afterBlockId = String(payload.afterBlockId || '');
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const blocks = sideNoteContentBlocks(annotation);
  const block = newSideNoteBlock(blockType);
  if (blocks.length === 1 && blocks[0]?.type === 'blank') blocks[0] = block;
  else {
    const beforeIndex = beforeBlockId ? blocks.findIndex((item) => item.id === beforeBlockId) : -1;
    const afterIndex = afterBlockId ? blocks.findIndex((item) => item.id === afterBlockId) : -1;
    blocks.splice(beforeIndex >= 0 ? beforeIndex : afterIndex >= 0 ? afterIndex + 1 : blocks.length, 0, block);
  }
  const before = cloneAnnotation(annotation);
  const updated = await saveAnnotationBlocks(annotation, blocks, { render: false });
  recordAnnotationHistory('note block insertion', before, updated, annotationId);
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
}

async function removeSplitNoteBlock(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  const blockId = String(payload.blockId || '');
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId) return;
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  const blockIndex = blocks.findIndex((block) => block.id === blockId);
  if (blockIndex >= blocks.length) return;
  if (blockIndex < 0) return;
  if (blocks.length <= 1) blocks.splice(0, blocks.length, newSideNoteBlock('blank'));
  else blocks.splice(blockIndex, 1);
  const updated = await saveAnnotationBlocks(annotation, blocks, { render: false });
  recordAnnotationHistory('note block deletion', before, updated, annotationId);
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
}

async function deleteSplitAnnotation(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  if (!annotationId) return;
  await deleteAnnotation(annotationId);
  scheduleSplitNotesStateBroadcast();
}

function setSplitInkTool(payload = {}) {
  const tool = payload.tool === 'eraser' ? 'eraser' : 'pen';
  state.inkTool = tool;
  if (typeof payload.color === 'string') state.inkColor = payload.color;
  const width = Number(payload.width);
  if (Number.isFinite(width)) state.inkWidth = clampNumber(width, 1, 24, state.inkWidth);
  if (typeof payload.pressureEnabled === 'boolean') state.inkPressureEnabled = payload.pressureEnabled;
  syncInkToolUi();
  scheduleSplitNotesStateBroadcast();
}

async function clearSplitInkBlock(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  const blockId = String(payload.blockId || '');
  await clearSideInk(annotationId, blockId);
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
}

async function insertSplitNoteImage(payload = {}) {
  const annotationId = String(payload.annotationId || '');
  if (!payload.file || typeof payload.file.arrayBuffer !== 'function') throw new Error('Choose a PNG, JPEG, or WebP picture.');
  await insertNoteImageAtBoundary(annotationId, payload.file, {
    beforeBlockId: String(payload.beforeBlockId || ''),
    afterBlockId: String(payload.afterBlockId || '')
  });
}

function normalizeSplitInkStroke(stroke) {
  if (!stroke || typeof stroke !== 'object') return null;
  const points = Array.isArray(stroke.points)
    ? stroke.points.map((point) => {
      const x = Number(point?.x);
      const y = Number(point?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      const pressure = clampNumber(point?.pressure, 0, 1, 0.5);
      return {
        x,
        y,
        pressure,
        t: Number.isFinite(Number(point?.t)) ? Number(point.t) : 0,
        pointerType: point?.pointerType || 'pen'
      };
    }).filter(Boolean)
    : [];
  return {
    color: typeof stroke.color === 'string' ? stroke.color : state.inkColor,
    width: clampNumber(stroke.width, 1, 24, state.inkWidth),
    pressureEnabled: stroke.pressureEnabled === true,
    points
  };
}

function onNotesTabClick(event) {
  if (state.suppressNotesTabClick) {
    state.suppressNotesTabClick = false;
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  toggleNotesPanel();
}

function onNotesTabPointerDown(event) {
  if (event.button != null && event.button !== 0) return;
  if (state.readingMode) return;
  state.notesTabDragSession = {
    pointerId: event.pointerId,
    startY: event.clientY,
    startTop: currentNotesTabTop(),
    moved: false
  };
  try {
    els.toggleNotesBtn.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture is best effort for synthetic events and older browsers.
  }
  document.addEventListener('pointermove', onNotesTabPointerMove);
  document.addEventListener('pointerup', finishNotesTabDrag);
  document.addEventListener('pointercancel', finishNotesTabDrag);
}

function onNotesTabPointerMove(event) {
  const session = state.notesTabDragSession;
  if (!session || event.pointerId !== session.pointerId) return;
  const delta = event.clientY - session.startY;
  if (!session.moved && Math.abs(delta) < 4) return;
  session.moved = true;
  event.preventDefault();
  applyNotesTabTop(session.startTop + delta);
}

function finishNotesTabDrag(event) {
  const session = state.notesTabDragSession;
  if (!session || event?.pointerId !== session.pointerId) return;
  state.notesTabDragSession = null;
  document.removeEventListener('pointermove', onNotesTabPointerMove);
  document.removeEventListener('pointerup', finishNotesTabDrag);
  document.removeEventListener('pointercancel', finishNotesTabDrag);
  if (!session.moved) return;
  event.preventDefault();
  event.stopPropagation();
  state.suppressNotesTabClick = true;
  saveNotesTabTop(currentNotesTabTop());
}

function onNotesPanelResizerPointerDown(event) {
  if (state.splitNotesActive) return;
  if (event.button != null && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  applyNotesPanelWidth();
  const startWidth = currentNotesPanelWidth();
  const session = {
    startX: event.clientX,
    startWidth,
    handle: event.currentTarget
  };
  state.notesPanelResizeSession = session;
  session.handle.classList.add('is-dragging');
  try {
    session.handle.setPointerCapture?.(event.pointerId);
  } catch {
    // Synthetic pointer events may not support capture.
  }
  document.addEventListener('pointermove', onNotesPanelResizeMove);
  document.addEventListener('pointerup', finishNotesPanelResize);
  document.addEventListener('pointercancel', finishNotesPanelResize);
}

function onNotesPanelResizerKeyDown(event) {
  if (state.splitNotesActive) return;
  const step = event.shiftKey ? 48 : 12;
  const current = currentNotesPanelWidth();
  const max = notesPanelMaximumWidth();
  let next = null;
  if (event.key === 'ArrowLeft') next = current + step;
  if (event.key === 'ArrowRight') next = current - step;
  if (event.key === 'Home') next = NOTES_PANEL_WIDTH.min;
  if (event.key === 'End') next = max;
  if (event.key === '0') next = NOTES_PANEL_WIDTH.default;
  if (next == null) return;
  event.preventDefault();
  event.stopPropagation();
  state.notesPanelWidth = normalizeNotesPanelWidth(next);
  applyNotesPanelWidth();
  saveNotesPanelWidth();
  requestNavigatorInkPreviewRedraw();
  setStatus(`Notes navigator width ${Math.round(state.notesPanelWidth)} pixels.`);
}

function onNotesPanelResizeMove(event) {
  const session = state.notesPanelResizeSession;
  if (!session) return;
  if (state.splitNotesActive) {
    finishNotesPanelResize(event);
    return;
  }
  event.preventDefault();
  const requestedWidth = session.startWidth + session.startX - event.clientX;
  state.notesPanelWidth = normalizeNotesPanelWidth(requestedWidth);
  applyNotesPanelWidth();
  requestNavigatorInkPreviewRedraw();
}

function finishNotesPanelResize(event) {
  if (!state.notesPanelResizeSession) return;
  event?.preventDefault?.();
  const session = state.notesPanelResizeSession;
  session.handle?.classList.remove('is-dragging');
  document.removeEventListener('pointermove', onNotesPanelResizeMove);
  document.removeEventListener('pointerup', finishNotesPanelResize);
  document.removeEventListener('pointercancel', finishNotesPanelResize);
  state.notesPanelResizeSession = null;
  saveNotesPanelWidth();
}

function applyNotesPanelWidth() {
  const width = normalizeNotesPanelWidth(state.notesPanelWidth);
  state.notesPanelWidth = width;
  document.documentElement.style.setProperty('--reader-notes-panel-width', `${Math.round(width)}px`);
  if (els.notesPanelResizer) {
    els.notesPanelResizer.setAttribute('aria-valuemin', String(NOTES_PANEL_WIDTH.min));
    els.notesPanelResizer.setAttribute('aria-valuemax', String(Math.round(notesPanelMaximumWidth())));
    els.notesPanelResizer.setAttribute('aria-valuenow', String(Math.round(width)));
    els.notesPanelResizer.setAttribute('aria-valuetext', `${Math.round(width)} pixels wide`);
  }
}

function notesPanelMaximumWidth() {
  return Math.max(NOTES_PANEL_WIDTH.min, window.innerWidth - 52);
}

function currentNotesPanelWidth() {
  const width = els.rightPanel?.getBoundingClientRect?.().width;
  return normalizeNotesPanelWidth(Number.isFinite(width) && width > 0 ? width : state.notesPanelWidth);
}

function isNotesPanelExpanded() {
  return Boolean(els.rightPanel && !els.rightPanel.classList.contains('is-collapsed'));
}

function sideNotesVisibleForMetrics(metrics) {
  return !state.splitNotesActive && !state.readingMode && Boolean(metrics?.noteVisible);
}

function syncFrameNotesPanelOverlayState(doc) {
  if (!doc?.body) return;
  doc.body.classList.toggle('reader-split-notes-source', state.splitNotesActive);
  doc.body.classList.toggle('reader-notes-overlay-open', isNotesPanelExpanded());
  renderLayoutResizers(doc);
}

function handleEscapeKey(event) {
  let handled = false;
  if (state.appDialog) {
    closeAppDialog(state.appDialog.cancelValue);
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (state.pdfHighlightSession) {
    finishPdfHighlightDraft(false).catch((error) => setStatus(error.message, true));
    handled = true;
  }
  if (state.libraryChooser) {
    finishLibrarySourceChoice(null).catch((error) => setStatus(error.message, true));
    handled = true;
  }
  if (els.highlightSelectionBtn && !els.highlightSelectionBtn.hidden) {
    hideSelectionHighlightButton();
    handled = true;
  }
  if (state.sourceBookmarkRenameId) {
    state.sourceBookmarkRenameId = null;
    renderSourceNavigator();
    handled = true;
  } else if (state.sourceNavigatorExpanded) {
    state.sourceNavigatorExpanded = false;
    renderSourceNavigator();
    handled = true;
  }
  closeTooltip();
  if (closeDeleteConfirmPopovers()) handled = true;
  if (state.readingMode) {
    toggleReadingMode();
    handled = true;
  }
  if (state.focusModeAnnotationId) {
    clearFocusModeState();
    renderAnnotations();
    renderNoteList();
    handled = true;
  }
  if (state.pinnedAnnotationId) {
    state.pinnedAnnotationId = null;
    syncPinnedNoteChrome();
    renderAnnotations();
    renderNoteList();
    handled = true;
  }
  if (state.mode !== 'select') {
    setMode('select');
    handled = true;
  }
  if (state.activeAnnotationId) {
    clearActiveAnnotation();
    handled = true;
  }
  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function showAppDialog({ title, body, actions, cancelValue = null }) {
  if (!els.appDialog || !els.appDialogTitle || !els.appDialogBody || !els.appDialogActions) {
    return Promise.resolve(cancelValue);
  }
  const previousFocus = state.appDialog?.previousFocus || document.activeElement;
  if (state.appDialog) closeAppDialog(state.appDialog.cancelValue, { restoreFocus: false });
  return new Promise((resolve) => {
    const inertSiblings = Array.from(document.body.children)
      .filter((element) => element !== els.appDialog)
      .map((element) => ({ element, inert: element.inert }));
    inertSiblings.forEach(({ element }) => { element.inert = true; });
    state.appDialog = { resolve, cancelValue, previousFocus, inertSiblings };
    els.appDialogTitle.textContent = title || '';
    els.appDialogBody.textContent = body || '';
    els.appDialogActions.innerHTML = '';
    for (const action of actions || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      if (action.className) button.className = action.className;
      if (action.initialFocus) button.dataset.initialFocus = 'true';
      if (action.destructive) button.dataset.destructive = 'true';
      if (Object.is(action.value, cancelValue)) button.dataset.cancelAction = 'true';
      button.addEventListener('click', () => closeAppDialog(action.value));
      els.appDialogActions.append(button);
    }
    els.appDialog.hidden = false;
    els.appDialog.addEventListener('pointerdown', handleAppDialogBackdropPointerDown);
    els.appDialog.addEventListener('keydown', handleAppDialogKeyDown);
    requestAnimationFrame(() => safeDialogInitialFocus(els.appDialogActions)?.focus());
  });
}

function closeAppDialog(value, options = {}) {
  if (!state.appDialog) return;
  const dialog = state.appDialog;
  state.appDialog = null;
  if (els.appDialog) {
    els.appDialog.hidden = true;
    els.appDialog.removeEventListener('pointerdown', handleAppDialogBackdropPointerDown);
    els.appDialog.removeEventListener('keydown', handleAppDialogKeyDown);
  }
  dialog.inertSiblings?.forEach(({ element, inert }) => { element.inert = inert; });
  if (els.appDialogActions) els.appDialogActions.innerHTML = '';
  dialog.resolve(value);
  if (options.restoreFocus !== false && isUsableFocusTarget(dialog.previousFocus)) {
    dialog.previousFocus.focus({ preventScroll: true });
  }
}

function handleAppDialogBackdropPointerDown(event) {
  if (event.target === els.appDialog && state.appDialog) closeAppDialog(state.appDialog.cancelValue);
}

function safeDialogInitialFocus(actionsElement) {
  const buttons = Array.from(actionsElement?.querySelectorAll?.('button:not(:disabled)') || []);
  const explicit = buttons.find((button) => button.dataset.initialFocus === 'true');
  if (explicit) return explicit;
  const hasDestructive = buttons.some((button) => button.classList.contains('danger') || button.dataset.destructive === 'true');
  if (hasDestructive) return buttons.find((button) => button.dataset.cancelAction === 'true') || buttons.find((button) => !button.classList.contains('danger')) || buttons[0] || null;
  return buttons[0] || null;
}

function handleAppDialogKeyDown(event) {
  if (!state.appDialog) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeAppDialog(state.appDialog.cancelValue);
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = dialogFocusableElements(els.appDialog);
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || !els.appDialog.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function dialogFocusableElements(root) {
  return Array.from(root?.querySelectorAll?.('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])') || [])
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
}

function isUsableFocusTarget(element) {
  return Boolean(element?.isConnected && !element.disabled && !element.inert && element.getAttribute?.('aria-hidden') !== 'true');
}

function installTooltipController(rootDoc) {
  if (rootDoc.defaultView.__readerTooltipInstalled) return;
  rootDoc.defaultView.__readerTooltipInstalled = true;
  rootDoc.addEventListener('pointerover', (event) => scheduleTooltip(event.target));
  rootDoc.addEventListener('pointerout', (event) => {
    if (!state.tooltipTarget) return;
    const nextTarget = event.relatedTarget;
    if (nextTarget && state.tooltipTarget.contains?.(nextTarget)) return;
    closeTooltip();
  });
  rootDoc.addEventListener('focusin', (event) => scheduleTooltip(event.target));
  rootDoc.addEventListener('focusout', closeTooltip);
}

function scheduleTooltip(target) {
  const trigger = tooltipTrigger(target);
  if (!trigger) return;
  const text = tooltipText(trigger);
  if (!text) return;
  closeTooltip();
  state.tooltipTarget = trigger;
  state.tooltipTimer = window.setTimeout(() => showTooltip(trigger, text), TOOLTIP_DELAY);
}

function tooltipTrigger(target) {
  const trigger = target?.closest?.('[data-reader-tooltip], [title]');
  if (!trigger) return null;
  if (trigger.matches('iframe')) return null;
  return trigger;
}

function tooltipText(trigger) {
  if (trigger.hasAttribute('title')) {
    const title = trigger.getAttribute('title') || '';
    trigger.dataset.readerTooltip = title;
    if (title
      && !trigger.hasAttribute('aria-label')
      && !trigger.hasAttribute('aria-labelledby')
      && !String(trigger.textContent || '').trim()) {
      trigger.setAttribute('aria-label', title);
    }
    trigger.removeAttribute('title');
  }
  return trigger.dataset.readerTooltip || '';
}

function showTooltip(trigger, text) {
  if (!trigger.isConnected) return;
  const doc = trigger.ownerDocument;
  const tooltip = doc.createElement('div');
  tooltip.className = 'reader-tooltip';
  tooltip.id = `reader-tooltip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = text;
  doc.body.append(tooltip);
  const descriptions = new Set((trigger.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  descriptions.add(tooltip.id);
  trigger.setAttribute('aria-describedby', [...descriptions].join(' '));
  positionTooltip(doc, tooltip, trigger);
  state.tooltip = tooltip;
  renderTooltipMath(doc, tooltip, text, trigger).catch(() => {
    if (tooltip.isConnected) tooltip.textContent = text;
  });
}

async function renderTooltipMath(doc, tooltip, text, trigger) {
  const segments = mathSegments(text);
  if (!segments.some((segment) => segment.type === 'math')) return;
  const katex = await ensureKatex(doc);
  if (!katex || state.tooltip !== tooltip || !tooltip.isConnected) return;
  tooltip.textContent = '';
  for (const segment of segments) {
    if (segment.type === 'text') {
      tooltip.append(doc.createTextNode(segment.value));
      continue;
    }
    const rendered = doc.createElement(segment.displayMode ? 'div' : 'span');
    rendered.className = segment.displayMode ? 'reader-tooltip-math-display' : 'reader-tooltip-math-inline';
    renderKatex(katex, segment.tex, rendered, segment.displayMode);
    tooltip.append(rendered);
  }
  if (trigger.isConnected) positionTooltip(doc, tooltip, trigger);
}

function positionTooltip(doc, tooltip, trigger) {
  const view = doc.defaultView;
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const left = Math.min(
    Math.max(8, triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2),
    Math.max(8, view.innerWidth - tooltipRect.width - 8)
  );
  const preferredTop = triggerRect.bottom + 8;
  const top = preferredTop + tooltipRect.height <= view.innerHeight - 8
    ? preferredTop
    : Math.max(8, triggerRect.top - tooltipRect.height - 8);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function closeTooltip() {
  if (state.tooltipTimer) {
    window.clearTimeout(state.tooltipTimer);
    state.tooltipTimer = null;
  }
  const tooltipId = state.tooltip?.id;
  if (tooltipId && state.tooltipTarget?.isConnected) {
    const descriptions = (state.tooltipTarget.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== tooltipId);
    if (descriptions.length) state.tooltipTarget.setAttribute('aria-describedby', descriptions.join(' '));
    else state.tooltipTarget.removeAttribute('aria-describedby');
  }
  state.tooltip?.remove();
  state.tooltip = null;
  state.tooltipTarget = null;
}

function cloneAnnotation(annotation) {
  return annotation ? structuredClone(annotation) : null;
}

function recordAnnotationHistory(label, beforeAnnotation, afterAnnotation, activeAnnotationId = afterAnnotation?.id || beforeAnnotation?.id || null) {
  if (state.isApplyingHistory) return;
  const before = cloneAnnotation(beforeAnnotation);
  const after = cloneAnnotation(afterAnnotation);
  if (!before && !after) return;
  state.undoStack.push({ label, before, after, activeAnnotationId });
  state.redoStack = [];
  syncHistoryControls();
}

function syncHistoryControls() {
  if (els.undoBtn) {
    els.undoBtn.disabled = !state.undoStack.length;
    const label = state.undoStack.at(-1)?.label;
    els.undoBtn.title = label ? `Undo ${label}` : 'Undo';
  }
  if (els.redoBtn) {
    els.redoBtn.disabled = !state.redoStack.length;
    const label = state.redoStack.at(-1)?.label;
    els.redoBtn.title = label ? `Redo ${label}` : 'Redo';
  }
}

async function undoHistoryCommand() {
  const command = state.undoStack.at(-1);
  if (!command) return;
  const annotationId = command.before?.id || command.after?.id || '';
  if (annotationId) await flushPendingAnnotationBlockSave(annotationId);
  state.undoStack.pop();
  state.isApplyingHistory = true;
  try {
    await applyHistorySnapshot(command.before, command.after, command.activeAnnotationId);
    state.redoStack.push(command);
    syncHistoryControls();
    setStatus(`Undid ${command.label}.`);
  } finally {
    state.isApplyingHistory = false;
  }
}

async function redoHistoryCommand() {
  const command = state.redoStack.at(-1);
  if (!command) return;
  const annotationId = command.before?.id || command.after?.id || '';
  if (annotationId) await flushPendingAnnotationBlockSave(annotationId);
  state.redoStack.pop();
  state.isApplyingHistory = true;
  try {
    await applyHistorySnapshot(command.after, command.before, command.activeAnnotationId);
    state.undoStack.push(command);
    syncHistoryControls();
    setStatus(`Redid ${command.label}.`);
  } finally {
    state.isApplyingHistory = false;
  }
}

async function applyHistorySnapshot(targetSnapshot, oppositeSnapshot, activeAnnotationId) {
  const affectedAnnotationId = targetSnapshot?.id || oppositeSnapshot?.id || null;
  if (targetSnapshot) {
    const restored = await upsertAnnotationSnapshot(targetSnapshot);
    state.activeAnnotationId = restored?.id || activeAnnotationId || targetSnapshot.id;
  } else if (oppositeSnapshot?.id) {
    await deleteAnnotationSnapshot(oppositeSnapshot.id);
    state.activeAnnotationId = null;
  }
  if (oppositeSnapshot?.id && state.pinnedAnnotationId === oppositeSnapshot.id && !targetSnapshot) {
    state.pinnedAnnotationId = null;
    syncPinnedNoteChrome();
  }
  if (oppositeSnapshot?.id && state.focusModeAnnotationId === oppositeSnapshot.id && !targetSnapshot) {
    clearFocusModeState();
  }
  if (affectedAnnotationId) clearSideInkHistoryForAnnotation(affectedAnnotationId);
  await reloadAnnotationsAndRender(state.activeAnnotationId);
}

function clearSideInkHistoryForAnnotation(annotationId) {
  for (const key of state.sideInkHistory.keys()) {
    if (key.startsWith(`${annotationId}:`)) state.sideInkHistory.delete(key);
  }
}

async function upsertAnnotationSnapshot(annotation) {
  const existing = state.annotations.some((item) => item.id === annotation.id);
  return storage.upsertAnnotation(state.docId, annotation, existing);
}

async function deleteAnnotationSnapshot(annotationId) {
  if (!state.annotations.some((item) => item.id === annotationId)) return;
  await storage.deleteAnnotation(state.docId, annotationId);
}

function quickMarkStorageKey(docId = state.docId) {
  return `reader-quick-marks:${docId || 'default'}`;
}

async function loadQuickMarks(docId) {
  try {
    const stored = await storage.getQuickMarks?.(docId);
    const legacy = JSON.parse(localStorage.getItem(quickMarkStorageKey(docId)) || 'null');
    const parsed = stored && Array.isArray(stored.marks) ? stored : legacy;
    state.quickMarks = Array.isArray(parsed?.marks)
      ? parsed.marks.map(normalizeQuickMark).filter(Boolean).slice(0, MAX_QUICK_MARKS)
      : [];
    state.quickMarkColorIndex = normalizeQuickMarkColorIndex(parsed?.colorIndex);
    mirrorQuickMarksToLocalStorage(docId);
    if (!stored && parsed) await storage.setQuickMarks?.(docId, parsed);
  } catch {
    state.quickMarks = [];
    state.quickMarkColorIndex = 0;
  }
}

function saveQuickMarks() {
  if (!state.docId) return;
  const docId = state.docId;
  const record = {
    marks: state.quickMarks,
    colorIndex: state.quickMarkColorIndex
  };
  localStorage.setItem(quickMarkStorageKey(docId), JSON.stringify(record));
  state.quickMarkSavePromise = state.quickMarkSavePromise
    .catch(() => {})
    .then(() => storage.setQuickMarks?.(docId, record))
    .catch((error) => {
      setStatus(`Quick marks are visible, but could not be saved (${error.message}).`, true);
    });
}

function mirrorQuickMarksToLocalStorage(docId = state.docId) {
  if (!docId) return;
  localStorage.setItem(quickMarkStorageKey(docId), JSON.stringify({
    marks: state.quickMarks,
    colorIndex: state.quickMarkColorIndex
  }));
}

async function flushQuickMarkSave() {
  await state.quickMarkSavePromise.catch(() => {});
  if (!state.docId) return;
  await storage.setQuickMarks?.(state.docId, {
    marks: state.quickMarks,
    colorIndex: state.quickMarkColorIndex
  });
}

function sourceBookmarkStorageKey(docId = state.docId) {
  return `reader-source-bookmarks:${docId || 'default'}`;
}

async function loadSourceBookmarks(docId) {
  try {
    const stored = await storage.getSourceBookmarks?.(docId);
    const legacy = JSON.parse(localStorage.getItem(sourceBookmarkStorageKey(docId)) || 'null');
    const parsed = stored?.bookmarks?.length ? stored : legacy || stored;
    const record = normalizeSourceBookmarkRecord(parsed, docId);
    state.sourceBookmarks = record.bookmarks;
    state.selectedSourceBookmarkId = state.sourceBookmarks.some((item) => item.id === state.selectedSourceBookmarkId)
      ? state.selectedSourceBookmarkId
      : null;
    mirrorSourceBookmarksToLocalStorage(docId);
    if ((!stored || !Array.isArray(stored.bookmarks)) && parsed) {
      await storage.setSourceBookmarks?.(docId, record);
    }
  } catch {
    state.sourceBookmarks = [];
    state.selectedSourceBookmarkId = null;
  }
}

function saveSourceBookmarks() {
  if (!state.docId) return;
  const docId = state.docId;
  const record = { bookmarks: state.sourceBookmarks };
  localStorage.setItem(sourceBookmarkStorageKey(docId), JSON.stringify(record));
  state.sourceBookmarkSavePromise = state.sourceBookmarkSavePromise
    .catch(() => {})
    .then(() => storage.setSourceBookmarks?.(docId, record))
    .catch((error) => {
      setStatus(`Source bookmarks are visible, but could not be saved (${error.message}).`, true);
    });
}

function mirrorSourceBookmarksToLocalStorage(docId = state.docId) {
  if (!docId) return;
  localStorage.setItem(sourceBookmarkStorageKey(docId), JSON.stringify({
    bookmarks: state.sourceBookmarks
  }));
}

async function flushSourceBookmarkSave() {
  await state.sourceBookmarkSavePromise.catch(() => {});
  if (!state.docId) return;
  await storage.setSourceBookmarks?.(state.docId, {
    bookmarks: state.sourceBookmarks
  });
}

function toggleSourceNavigator() {
  state.sourceNavigatorExpanded = !state.sourceNavigatorExpanded;
  renderSourceNavigator();
}

function renderSourceNavigator() {
  const expanded = state.sourceNavigatorExpanded;
  const selected = selectedSourceBookmark();
  if (els.sourceNavigatorToggleBtn) {
    els.sourceNavigatorToggleBtn.disabled = !state.docId;
    els.sourceNavigatorToggleBtn.classList.toggle('is-active', expanded);
    els.sourceNavigatorToggleBtn.setAttribute('aria-expanded', String(expanded));
    const label = expanded ? 'Close source bookmarks' : 'Open source bookmarks';
    els.sourceNavigatorToggleBtn.title = label;
    els.sourceNavigatorToggleBtn.setAttribute('aria-label', label);
  }
  if (els.sourceNavigatorPanel) els.sourceNavigatorPanel.hidden = !expanded;
  if (els.removeSourceBookmarkBtn) els.removeSourceBookmarkBtn.disabled = !selected;
  if (els.renameSourceBookmarkBtn) els.renameSourceBookmarkBtn.disabled = !selected;
  if (els.insertSourceBookmarkBtn) els.insertSourceBookmarkBtn.disabled = !selected || !state.iframeLoaded;
  if (els.addSourceBookmarkBtn) els.addSourceBookmarkBtn.disabled = !state.docId || state.sourceBookmarks.length >= MAX_SOURCE_BOOKMARKS;
  if (!els.sourceBookmarkList) return;
  els.sourceBookmarkList.replaceChildren();
  for (const bookmark of state.sourceBookmarks) {
    els.sourceBookmarkList.append(sourceBookmarkListItem(bookmark));
  }
  if (els.sourceBookmarkEmpty) els.sourceBookmarkEmpty.hidden = state.sourceBookmarks.length > 0;
  if (expanded && state.sourceBookmarkRenameId) {
    requestAnimationFrame(() => {
      const input = els.sourceBookmarkList?.querySelector?.('.source-bookmark-rename-input');
      input?.focus?.();
      input?.select?.();
    });
  }
}

function sourceBookmarkListItem(bookmark) {
  const selected = bookmark.id === state.selectedSourceBookmarkId;
  const renaming = bookmark.id === state.sourceBookmarkRenameId;
  if (renaming) {
    const wrapper = document.createElement('div');
    wrapper.className = `source-bookmark-item is-selected ${bookmark.target ? '' : 'is-unbound'}`.trim();
    wrapper.dataset.sourceBookmarkId = bookmark.id;
    wrapper.setAttribute('role', 'option');
    wrapper.setAttribute('aria-selected', 'true');
    const input = document.createElement('input');
    input.className = 'source-bookmark-rename-input';
    input.type = 'text';
    input.maxLength = 120;
    input.value = bookmark.label;
    input.setAttribute('aria-label', 'Bookmark description');
    input.addEventListener('keydown', (event) => handleSourceBookmarkRenameKeyDown(event, bookmark.id));
    input.addEventListener('blur', () => commitSourceBookmarkRename(bookmark.id, input.value));
    wrapper.append(input, sourceBookmarkLocationElement(bookmark));
    return wrapper;
  }
  const button = document.createElement('button');
  button.type = 'button';
  button.className = [
    'source-bookmark-item',
    selected ? 'is-selected' : '',
    bookmark.target ? '' : 'is-unbound'
  ].filter(Boolean).join(' ');
  button.dataset.sourceBookmarkId = bookmark.id;
  button.setAttribute('role', 'option');
  button.setAttribute('aria-selected', String(selected));
  button.title = bookmark.target
    ? `${bookmark.label} — ${bookmark.locationLabel}`
    : `${bookmark.label} — not placed`;
  const label = document.createElement('span');
  label.className = 'source-bookmark-label';
  label.textContent = bookmark.label;
  button.append(label, sourceBookmarkLocationElement(bookmark));
  return button;
}

function sourceBookmarkLocationElement(bookmark) {
  const location = document.createElement('span');
  location.className = 'source-bookmark-location';
  location.textContent = bookmark.target ? bookmark.locationLabel : 'Not placed';
  return location;
}

function handleSourceBookmarkListClick(event) {
  const item = event.target?.closest?.('.source-bookmark-item[data-source-bookmark-id]');
  if (!item || item.querySelector?.('input')) return;
  const bookmark = state.sourceBookmarks.find((entry) => entry.id === item.dataset.sourceBookmarkId);
  if (!bookmark) return;
  state.selectedSourceBookmarkId = bookmark.id;
  state.sourceBookmarkRenameId = null;
  renderSourceNavigator();
  if (bookmark.target) jumpToSourceBookmark(bookmark.id);
  else setStatus('Bookmark selected. Use Insert to bind it to the current reading position.');
}

function selectedSourceBookmark() {
  return state.sourceBookmarks.find((item) => item.id === state.selectedSourceBookmarkId) || null;
}

function addSourceBookmark() {
  if (!state.docId) return;
  if (state.sourceBookmarks.length >= MAX_SOURCE_BOOKMARKS) {
    setStatus(`Source bookmark limit reached (${MAX_SOURCE_BOOKMARKS}).`, true);
    return;
  }
  const bookmark = {
    id: `bookmark_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    label: `Bookmark ${state.sourceBookmarks.length + 1}`,
    target: null,
    locationLabel: 'Not placed'
  };
  state.sourceBookmarks.push(bookmark);
  state.selectedSourceBookmarkId = bookmark.id;
  state.sourceBookmarkRenameId = null;
  saveSourceBookmarks();
  renderSourceNavigator();
  setStatus('Bookmark added. Rename it or use Insert to bind the current reading position.');
}

function removeSelectedSourceBookmark() {
  const selected = selectedSourceBookmark();
  if (!selected) return;
  state.sourceBookmarks = state.sourceBookmarks.filter((item) => item.id !== selected.id);
  state.selectedSourceBookmarkId = null;
  state.sourceBookmarkRenameId = null;
  if (state.pendingSourceBookmarkJumpId === selected.id) state.pendingSourceBookmarkJumpId = null;
  saveSourceBookmarks();
  renderSourceNavigator();
  setStatus('Bookmark deleted.');
}

function beginSelectedSourceBookmarkRename() {
  const selected = selectedSourceBookmark();
  if (!selected) return;
  state.sourceBookmarkRenameId = selected.id;
  renderSourceNavigator();
}

function handleSourceBookmarkRenameKeyDown(event, bookmarkId) {
  if (event.key === 'Escape') {
    event.preventDefault();
    state.sourceBookmarkRenameId = null;
    renderSourceNavigator();
    return;
  }
  if (event.key !== 'Enter') return;
  event.preventDefault();
  commitSourceBookmarkRename(bookmarkId, event.currentTarget.value);
}

function commitSourceBookmarkRename(bookmarkId, value) {
  if (state.sourceBookmarkRenameId !== bookmarkId) return;
  const bookmark = state.sourceBookmarks.find((item) => item.id === bookmarkId);
  if (!bookmark) return;
  const label = readableSnippet(value, 120);
  if (label) bookmark.label = label;
  state.sourceBookmarkRenameId = null;
  saveSourceBookmarks();
  renderSourceNavigator();
  setStatus(label ? 'Bookmark renamed.' : 'Bookmark name unchanged.');
}

function insertSelectedSourceBookmark() {
  const bookmark = selectedSourceBookmark();
  if (!bookmark || !state.iframeLoaded) return;
  const target = quickMarkTargetAtReadingPosition();
  if (!target) {
    setStatus('No anchorable content is visible at the current reading position.', true);
    return;
  }
  bookmark.target = target.target;
  bookmark.locationLabel = sourceBookmarkLocationLabel(target);
  saveSourceBookmarks();
  renderSourceNavigator();
  setStatus(`Bookmark inserted at ${bookmark.locationLabel}.`);
}

function sourceBookmarkLocationLabel(target) {
  const pageIndex = pdfPageIndexFromTarget(target?.target);
  const snippet = readableSnippet(target?.label, 90);
  if (Number.isInteger(pageIndex) && pageIndex >= 0) {
    return snippet ? `Page ${pageIndex + 1} · ${snippet}` : `Page ${pageIndex + 1}`;
  }
  return snippet || target?.target?.anchorId || 'Saved location';
}

function normalizeQuickMark(mark) {
  if (!mark?.id || !mark.target) return null;
  return {
    id: String(mark.id),
    target: mark.target,
    colorIndex: normalizeQuickMarkColorIndex(mark.colorIndex),
    label: readableSnippet(mark.label || 'Quick mark', 90)
  };
}

function normalizeQuickMarkColorIndex(value) {
  const index = Number(value);
  return Number.isInteger(index) && index >= 0 ? index % QUICK_MARK_COLORS.length : 0;
}

function quickMarkColorClass(colorIndex) {
  return QUICK_MARK_COLORS[normalizeQuickMarkColorIndex(colorIndex)];
}

function quickMarkColorValue(colorIndex) {
  return QUICK_MARK_COLOR_VALUES[normalizeQuickMarkColorIndex(colorIndex)];
}

function syncClipToolColor() {
  if (!els.clipToolBtn) return;
  els.clipToolBtn.classList.remove(...QUICK_MARK_COLORS);
  els.clipToolBtn.classList.add(quickMarkColorClass(state.quickMarkColorIndex));
}

function setQuickMarkColorIndex(colorIndex) {
  state.quickMarkColorIndex = normalizeQuickMarkColorIndex(colorIndex);
  syncClipToolColor();
  saveQuickMarks();
}

function advanceQuickMarkColor() {
  setQuickMarkColorIndex(state.quickMarkColorIndex + 1);
}

function onQuickMarkToolKeyDown(event) {
  if (!['Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  placeQuickMarkAtReadingPosition();
}

function placeQuickMarkAtReadingPosition() {
  if (state.readingMode || !state.iframeLoaded) return;
  if (!compatibilityFeatureEnabled('blockNotes')) {
    setStatus('Quick marks are unavailable because this document has no stable block anchors.', true);
    return;
  }
  if (state.quickMarks.length >= MAX_QUICK_MARKS) {
    showQuickMarkLimitReminder();
    setStatus(`Quick mark limit reached (${MAX_QUICK_MARKS}). Delete or recycle a clip first.`, true);
    return;
  }
  const target = quickMarkTargetAtReadingPosition();
  if (!target) {
    setStatus('No anchorable content is visible at the current reading position.', true);
    return;
  }
  const colorIndex = state.quickMarkColorIndex;
  advanceQuickMarkColor();
  addQuickMark(target, colorIndex);
}

function quickMarkTargetAtReadingPosition() {
  const doc = getFrameDoc();
  if (!doc) return null;
  const documentY = doc.defaultView.scrollY + doc.defaultView.innerHeight * 0.34;
  const anchor = nearestAnchorForDocumentY(doc, documentY);
  return anchor ? quickMarkTargetForAnchor(doc, anchor, documentY) : null;
}

async function createNoteAtReadingPosition() {
  if (!state.iframeLoaded) {
    setStatus('Open a source before adding a note.', true);
    return;
  }
  const doc = getFrameDoc();
  const clientY = doc.defaultView.innerHeight * 0.34;
  const clientX = Math.min(doc.defaultView.innerWidth * 0.5, Math.max(24, layoutMetrics(doc).sourceWidth * 0.5));
  await createBlankSideNoteAt({ clientX, clientY });
}

function recycleQuickMarkColor(colorIndex) {
  setQuickMarkColorIndex(colorIndex);
}

function startQuickMarkToolDrag(event) {
  if (state.readingMode || !state.iframeLoaded) return;
  if (!compatibilityFeatureEnabled('blockNotes')) {
    setStatus('Quick marks are unavailable because this document has no stable block anchors.', true);
    return;
  }
  event.preventDefault();
  if (state.quickMarks.length >= MAX_QUICK_MARKS) {
    showQuickMarkLimitReminder();
    setStatus(`Quick mark limit reached (${MAX_QUICK_MARKS}). Delete or recycle a clip first.`, true);
    return;
  }
  const colorIndex = state.quickMarkColorIndex;
  advanceQuickMarkColor();
  startQuickMarkDrag({
    pointerId: event.pointerId,
    source: 'tool',
    colorIndex,
    startX: event.clientX,
    startY: event.clientY
  });
}

function startQuickMarkRailDrag(event, markId) {
  event.preventDefault();
  event.stopPropagation();
  const mark = state.quickMarks.find((item) => item.id === markId);
  if (!mark) return;
  const dragSource = event.currentTarget;
  startQuickMarkDrag({
    pointerId: event.pointerId,
    source: 'rail',
    markId,
    colorIndex: mark.colorIndex,
    startX: event.clientX,
    startY: event.clientY
  });
  bindQuickMarkDragSource(dragSource);
}

function startQuickMarkInlineDrag(event, markId) {
  event.preventDefault();
  event.stopPropagation();
  const mark = state.quickMarks.find((item) => item.id === markId);
  if (!mark) return;
  const frameRect = els.frame.getBoundingClientRect();
  const dragSource = event.currentTarget;
  startQuickMarkDrag({
    pointerId: event.pointerId,
    source: 'inline',
    markId,
    colorIndex: mark.colorIndex,
    startX: frameRect.left + event.clientX,
    startY: frameRect.top + event.clientY
  });
  bindInlineQuickMarkDragSource(dragSource, event.pointerId);
}

function bindInlineQuickMarkDragSource(dragSource, pointerId) {
  const session = state.quickMarkDragSession;
  const view = dragSource?.ownerDocument?.defaultView;
  if (!session || !dragSource || !view) return;
  bindQuickMarkDragSource(dragSource);
  const frameRect = els.frame.getBoundingClientRect();
  const normalizeFrameEvent = (frameEvent) => {
    return {
      pointerId: frameEvent.pointerId,
      clientX: frameRect.left + frameEvent.clientX,
      clientY: frameRect.top + frameEvent.clientY,
      preventDefault: () => frameEvent.preventDefault()
    };
  };
  const move = (frameEvent) => onQuickMarkDragMove(normalizeFrameEvent(frameEvent));
  const end = (frameEvent) => onQuickMarkDragEnd(normalizeFrameEvent(frameEvent));
  const cancel = () => onQuickMarkDragCancel();
  const moveType = 'onpointerrawupdate' in view ? 'pointerrawupdate' : 'pointermove';
  dragSource.addEventListener(moveType, move, { passive: false });
  dragSource.addEventListener('pointerup', end, { once: true });
  dragSource.addEventListener('pointercancel', cancel, { once: true });
  view.addEventListener(moveType, move, { passive: false });
  view.addEventListener('pointerup', end, { once: true });
  view.addEventListener('pointercancel', cancel, { once: true });
  try {
    dragSource.setPointerCapture(pointerId);
  } catch {
    // Pointer capture is best effort across browser/iframe implementations.
  }
  session.inlineCleanup = () => {
    dragSource.removeEventListener(moveType, move);
    dragSource.removeEventListener('pointerup', end);
    dragSource.removeEventListener('pointercancel', cancel);
    view.removeEventListener(moveType, move);
    view.removeEventListener('pointerup', end);
    view.removeEventListener('pointercancel', cancel);
    try {
      if (dragSource.hasPointerCapture?.(pointerId)) dragSource.releasePointerCapture(pointerId);
    } catch {
      // The pointer may already be released after a normal pointerup.
    }
  };
}

function bindQuickMarkDragSource(dragSource) {
  const session = state.quickMarkDragSession;
  if (!session || !dragSource) return;
  dragSource.classList.add('is-dragging');
  const previousCleanup = session.sourceCleanup;
  session.sourceCleanup = () => {
    previousCleanup?.();
    dragSource.classList.remove('is-dragging');
  };
}

function startQuickMarkDrag(options) {
  const overlay = document.createElement('div');
  overlay.className = 'quick-mark-drag-overlay';
  document.body.append(overlay);
  const ghost = document.createElement('div');
  ghost.className = `quick-mark-ghost ${quickMarkColorClass(options.colorIndex)}`;
  document.body.append(ghost);
  state.quickMarkDragSession = {
    ...options,
    overlay,
    ghost,
    moved: false,
    lastX: options.startX,
    lastY: options.startY,
    renderedX: null,
    renderedY: null
  };
  renderQuickMarkGhost();
  const moveType = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';
  state.quickMarkDragSession.moveType = moveType;
  overlay.addEventListener(moveType, onQuickMarkDragMove, { passive: false });
  overlay.addEventListener('pointerup', onQuickMarkDragEnd, { once: true });
  overlay.addEventListener('pointercancel', onQuickMarkDragCancel, { once: true });
  try {
    overlay.setPointerCapture(options.pointerId);
  } catch {
    // Pointer capture is best effort; the overlay still catches iframe drags.
  }
}

function onQuickMarkDragMove(event) {
  const session = state.quickMarkDragSession;
  if (!session || event.pointerId !== session.pointerId) return;
  event.preventDefault();
  const point = latestQuickMarkPointerPoint(event);
  if (Math.abs(point.clientX - session.startX) > 3 || Math.abs(point.clientY - session.startY) > 3) {
    session.moved = true;
  }
  session.lastX = point.clientX;
  session.lastY = point.clientY;
  requestQuickMarkGhostRender();
}

function onQuickMarkDragEnd(event) {
  const session = state.quickMarkDragSession;
  cleanupQuickMarkDrag();
  if (!session || event.pointerId !== session.pointerId) return;
  const dropX = session.moved ? session.lastX : event.clientX;
  const dropY = session.moved ? session.lastY : event.clientY;
  if (session.source === 'rail' || session.source === 'inline') {
    if (isPointOverElement(dropX, dropY, els.clipToolBtn)) {
      removeQuickMark(session.markId, { recycleColorIndex: session.colorIndex });
      return;
    }
    if (!session.moved) jumpToQuickMark(session.markId);
    if (session.moved) {
      state.suppressQuickMarkClickId = session.markId;
      const target = quickMarkTargetFromPoint(dropX, dropY);
      if (target) {
        moveQuickMark(session.markId, target);
      } else {
        setStatus('Drop the clip on the source text to move the quick mark.', true);
      }
    }
    return;
  }
  if (session.source === 'tool' && isPointOverElement(dropX, dropY, els.clipToolBtn)) {
    recycleQuickMarkColor(session.colorIndex);
    setStatus('Quick mark recycled.');
    return;
  }
  const target = quickMarkTargetFromPoint(dropX, dropY);
  if (!target) {
    if (session.source === 'tool') recycleQuickMarkColor(session.colorIndex);
    setStatus('Drop the clip on the source text to create a quick mark.', true);
    return;
  }
  addQuickMark(target, session.colorIndex);
}

function onQuickMarkDragCancel() {
  const session = state.quickMarkDragSession;
  cleanupQuickMarkDrag();
  if (session?.source === 'tool') recycleQuickMarkColor(session.colorIndex);
}

function cleanupQuickMarkDrag() {
  const session = state.quickMarkDragSession;
  state.quickMarkDragSession = null;
  session?.sourceCleanup?.();
  session?.inlineCleanup?.();
  session?.overlay?.remove();
  session?.ghost?.remove();
  if (state.quickMarkDragRenderRaf) {
    cancelAnimationFrame(state.quickMarkDragRenderRaf);
    state.quickMarkDragRenderRaf = 0;
  }
  session?.overlay?.removeEventListener(session.moveType || 'pointermove', onQuickMarkDragMove);
  session?.overlay?.removeEventListener('pointerup', onQuickMarkDragEnd);
  session?.overlay?.removeEventListener('pointercancel', onQuickMarkDragCancel);
}

function latestQuickMarkPointerPoint(event) {
  const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : null;
  const latest = samples?.length ? samples[samples.length - 1] : event;
  return {
    clientX: latest.clientX,
    clientY: latest.clientY
  };
}

function requestQuickMarkGhostRender() {
  if (state.quickMarkDragRenderRaf) return;
  state.quickMarkDragRenderRaf = requestAnimationFrame(() => {
    state.quickMarkDragRenderRaf = 0;
    renderQuickMarkGhost();
  });
}

function renderQuickMarkGhost() {
  const session = state.quickMarkDragSession;
  const ghost = session?.ghost;
  if (!session || !ghost) return;
  const nextX = Math.round(session.lastX);
  const nextY = Math.round(session.lastY);
  if (session.renderedX === nextX && session.renderedY === nextY) return;
  session.renderedX = nextX;
  session.renderedY = nextY;
  ghost.style.setProperty('--quick-mark-ghost-x', `${nextX}px`);
  ghost.style.setProperty('--quick-mark-ghost-y', `${nextY}px`);
}

function isPointOverElement(clientX, clientY, element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
}

function quickMarkTargetFromPoint(clientX, clientY) {
  const frameRect = els.frame.getBoundingClientRect();
  if (clientX < frameRect.left || clientX > frameRect.right || clientY < frameRect.top || clientY > frameRect.bottom) return null;
  const doc = getFrameDoc();
  const frameX = clientX - frameRect.left;
  const frameY = clientY - frameRect.top;
  const element = doc.elementFromPoint(frameX, frameY);
  if (!element || element.closest?.('.reader-side-note-layer, .reader-layout-resizer, .reader-quick-clip-layer')) return null;
  const main = element.closest?.('main') || doc.querySelector('main') || doc.body;
  const anchor = quickMarkAnchorAtPoint(doc, main, element, frameX, frameY);
  if (!anchor || anchor.closest?.('.reader-side-note-layer')) return null;
  return quickMarkTargetForAnchor(doc, anchor, doc.defaultView.scrollY + frameY, doc.defaultView.scrollX + frameX);
}

function quickMarkTargetForAnchor(doc, anchor, documentY = null, documentX = null) {
  const anchorRect = anchor.getBoundingClientRect();
  const resolvedDocumentY = Number.isFinite(documentY)
    ? documentY
    : doc.defaultView.scrollY + anchorRect.top + Math.min(16, anchorRect.height / 2);
  const resolvedDocumentX = Number.isFinite(documentX)
    ? documentX
    : doc.defaultView.scrollX + anchorRect.left + Math.min(16, anchorRect.width / 2);
  const pdfPage = anchor.closest?.('.pdf-page');
  const pdfPageRect = pdfPage?.getBoundingClientRect?.();
  const pdfPageHint = pdfPageRect?.width > 0 && pdfPageRect?.height > 0
    ? {
        pageX: clampNumber(
          (resolvedDocumentX - doc.defaultView.scrollX - pdfPageRect.left) / pdfPageRect.width,
          0,
          1,
          0
        ),
        pageY: clampNumber(
          (resolvedDocumentY - doc.defaultView.scrollY - pdfPageRect.top) / pdfPageRect.height,
          0,
          1,
          0
        )
      }
    : {};
  return {
    target: {
      type: 'block',
      pageId: pageIdForElement(anchor),
      anchorId: getAnchorId(anchor),
      domPath: getAnchorId(anchor) ? null : domPathFor(anchor),
      exact: '',
      clientHint: {
        documentX: resolvedDocumentX,
        documentY: resolvedDocumentY,
        anchorOffsetX: resolvedDocumentX - (doc.defaultView.scrollX + anchorRect.left),
        anchorOffsetY: resolvedDocumentY - (doc.defaultView.scrollY + anchorRect.top),
        ...pdfPageHint
      }
    },
    label: readableSnippet(textContent(anchor), 90)
  };
}

function handleQuickMarkKeyDown(event, markId) {
  if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    event.stopPropagation();
    removeQuickMark(markId);
    return;
  }
  if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  const mark = state.quickMarks.find((item) => item.id === markId);
  const doc = getFrameDoc();
  const current = mark ? resolveTargetElement(doc, mark.target) : null;
  if (!current) return;
  const anchors = Array.from(doc.querySelectorAll(ANCHOR_SELECTOR))
    .filter((anchor) => !anchor.closest('.reader-side-note-layer'));
  const index = anchors.indexOf(current);
  const nextIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
  const nextAnchor = anchors[nextIndex];
  if (!nextAnchor) {
    setStatus('Quick mark is already at the first or last anchor.');
    return;
  }
  moveQuickMark(markId, quickMarkTargetForAnchor(doc, nextAnchor));
  requestAnimationFrame(() => {
    const escaped = cssEscape(markId);
    doc.querySelector(`.reader-quick-clip[data-quick-mark-id="${escaped}"]`)?.focus?.({ preventScroll: true });
    document.querySelector(`.quick-mark-rail[data-quick-mark-id="${escaped}"]`)?.focus?.({ preventScroll: true });
  });
}

function quickMarkAnchorAtPoint(doc, main, element, frameX, frameY) {
  if (main?.contains?.(element)) {
    const direct = closestAnchorElement(element);
    if (direct) return direct;
  }
  const candidates = Array.from(main?.querySelectorAll?.(HIGHLIGHT_ROOT_SELECTOR) || [])
    .filter((candidate) => !candidate.closest?.('.reader-side-note-layer'))
    .filter((candidate) => rectContainsPoint(candidate.getBoundingClientRect(), frameX, frameY, 3))
    .sort((a, b) => rectArea(a.getBoundingClientRect()) - rectArea(b.getBoundingClientRect()));
  return candidates.find((candidate) => !candidate.matches('section, article')) || candidates[0] || null;
}

function rectContainsPoint(rect, x, y, padding = 0) {
  return x >= rect.left - padding
    && x <= rect.right + padding
    && y >= rect.top - padding
    && y <= rect.bottom + padding;
}

function rectArea(rect) {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

function addQuickMark(target, colorIndex) {
  if (state.quickMarks.length >= MAX_QUICK_MARKS) {
    showQuickMarkLimitReminder();
    setStatus(`Quick mark limit reached (${MAX_QUICK_MARKS}). Delete or recycle a clip first.`, true);
    return;
  }
  const mark = {
    id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    target: target.target,
    label: target.label,
    colorIndex: normalizeQuickMarkColorIndex(colorIndex)
  };
  state.quickMarks.push(mark);
  saveQuickMarks();
  renderQuickMarks(getFrameDoc());
  setStatus('Quick mark added.');
}

function showQuickMarkLimitReminder() {
  let reminder = document.querySelector('.quick-mark-limit-reminder');
  if (!reminder) {
    reminder = document.createElement('div');
    reminder.className = 'quick-mark-limit-reminder';
    reminder.setAttribute('role', 'status');
    document.body.append(reminder);
  }
  reminder.textContent = `Maximum ${MAX_QUICK_MARKS} clips. Delete or recycle one first.`;
  const rect = els.clipToolBtn?.getBoundingClientRect();
  if (rect) {
    reminder.style.left = `${Math.round(rect.right + 10)}px`;
    reminder.style.top = `${Math.round(rect.top + rect.height / 2)}px`;
  }
  reminder.classList.add('is-visible');
  clearTimeout(state.quickMarkLimitReminderTimer);
  state.quickMarkLimitReminderTimer = setTimeout(() => {
    reminder.classList.remove('is-visible');
  }, 2200);
}

function removeQuickMark(markId, options = {}) {
  const before = state.quickMarks.length;
  state.quickMarks = state.quickMarks.filter((mark) => mark.id !== markId);
  if (state.quickMarks.length === before) return;
  if (state.pendingQuickMarkJumpId === markId) state.pendingQuickMarkJumpId = null;
  if (Number.isInteger(Number(options.recycleColorIndex))) {
    state.quickMarkColorIndex = normalizeQuickMarkColorIndex(options.recycleColorIndex);
    syncClipToolColor();
  }
  saveQuickMarks();
  renderQuickMarks(getFrameDoc());
  setStatus('Quick mark removed.');
}

function moveQuickMark(markId, target) {
  const mark = state.quickMarks.find((item) => item.id === markId);
  if (!mark) return;
  mark.target = target.target;
  mark.label = target.label;
  saveQuickMarks();
  renderQuickMarks(getFrameDoc());
  setStatus('Quick mark moved.');
}

function renderQuickMarks(doc = getFrameDoc()) {
  if (!doc) return;
  doc.querySelectorAll('.reader-quick-clip-layer').forEach((layer) => layer.remove());
  if (state.readingMode || !state.quickMarks.length) {
    renderQuickMarkStack(doc);
    return;
  }
  let documentLayer = null;
  const pageLayers = new Map();
  for (const mark of state.quickMarks) {
    const position = quickMarkPosition(doc, mark);
    if (!position) continue;
    let layer = documentLayer;
    let left = position.left;
    let top = position.top;
    if (position.pageSurface) {
      layer = pageLayers.get(position.pageSurface);
      if (!layer) {
        layer = doc.createElement('div');
        layer.className = 'reader-quick-clip-layer is-pdf-page-layer';
        position.pageSurface.append(layer);
        pageLayers.set(position.pageSurface, layer);
      }
      left = position.surfaceLeft;
      top = position.surfaceTop;
    } else if (!layer) {
      layer = doc.createElement('div');
      layer.className = 'reader-quick-clip-layer';
      doc.body.append(layer);
      documentLayer = layer;
    }
    const button = doc.createElement('button');
    const label = quickMarkLabel(doc, mark);
    button.type = 'button';
    button.className = `reader-quick-clip ${quickMarkColorClass(mark.colorIndex)}`;
    button.dataset.quickMarkId = mark.id;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.style.setProperty('--clip-color', quickMarkColorValue(mark.colorIndex));
    button.style.left = `${Math.round(left)}px`;
    button.style.top = `${Math.round(top)}px`;
    button.addEventListener('click', (event) => {
      if (state.suppressQuickMarkClickId === mark.id) {
        state.suppressQuickMarkClickId = null;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      jumpToQuickMark(mark.id);
    });
    button.addEventListener('pointerdown', (event) => startQuickMarkInlineDrag(event, mark.id));
    button.addEventListener('keydown', (event) => handleQuickMarkKeyDown(event, mark.id));
    layer.append(button);
  }
  syncQuickMarkStack(doc);
}

function renderQuickMarkStack(doc = state.iframeLoaded ? getFrameDoc() : null) {
  if (!els.quickMarkStack) return;
  els.quickMarkStack.textContent = '';
  if (state.readingMode) return;
  const offscreenMarks = quickMarksForRail(doc);
  for (const item of offscreenMarks) {
    const button = document.createElement('button');
    const label = quickMarkLabel(doc, item.mark);
    button.type = 'button';
    button.className = [
      'quick-mark-rail',
      quickMarkColorClass(item.mark.colorIndex),
      item.detached ? 'is-detached' : '',
      item.direction ? `is-${item.direction}` : '',
      state.pendingQuickMarkJumpId === item.mark.id ? 'is-pending' : ''
    ].filter(Boolean).join(' ');
    button.dataset.quickMarkId = item.mark.id;
    const location = item.pageNumber ? `Page ${item.pageNumber}` : '';
    const direction = item.direction ? `, ${item.direction}` : '';
    button.title = [label, location].filter(Boolean).join(' — ');
    button.setAttribute('aria-label', `${label}${location ? `, ${location}` : ''}${direction}`);
    button.addEventListener('click', (event) => {
      if (state.suppressQuickMarkClickId === item.mark.id) {
        state.suppressQuickMarkClickId = null;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      jumpToQuickMark(item.mark.id);
    });
    button.addEventListener('pointerdown', (event) => startQuickMarkRailDrag(event, item.mark.id));
    button.addEventListener('keydown', (event) => handleQuickMarkKeyDown(event, item.mark.id));
    els.quickMarkStack.append(button);
  }
}

function syncQuickMarkStack(doc = getFrameDoc()) {
  renderQuickMarkStack(doc);
}

function quickMarkLabel(doc, mark) {
  const anchor = doc && mark?.target ? resolveTargetElement(doc, mark.target) : null;
  const liveLabel = anchor ? readableSnippet(textContent(anchor), 90) : '';
  return liveLabel || mark?.label || 'Quick mark';
}

function quickMarksForRail(doc) {
  if (!doc || !state.quickMarks.length) return [];
  const view = doc.defaultView;
  const currentPdfPage = Number(doc.documentElement.dataset.pdfCurrentPage);
  return state.quickMarks
    .map((mark) => {
      const position = quickMarkPosition(doc, mark);
      const pageIndex = pdfPageIndexFromTarget(mark.target);
      const pageNumber = Number.isInteger(pageIndex) && pageIndex >= 0 ? pageIndex + 1 : null;
      const detached = !position && state.currentDocument?.sourceType === 'pdf' && pageNumber != null;
      const direction = detached && Number.isFinite(currentPdfPage)
        ? pageNumber < currentPdfPage ? 'above' : 'below'
        : null;
      return { mark, position, pageNumber, detached, direction };
    })
    .filter((item) => item.detached
      || item.position?.viewportTop < -4
      || item.position?.viewportTop > view.innerHeight + 4)
    .sort((a, b) => {
      const aTop = a.position?.top ?? ((a.pageNumber || 0) * 100000);
      const bTop = b.position?.top ?? ((b.pageNumber || 0) * 100000);
      return aTop - bTop;
    });
}

function quickMarkPosition(doc, mark) {
  const anchor = resolveTargetElement(doc, mark.target);
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const hint = mark.target?.clientHint || {};
  const page = anchor.closest?.('.pdf-page');
  const pageSurface = page?.querySelector?.(':scope > .pdf-page-surface') || null;
  const pageRect = page?.getBoundingClientRect?.();
  const pageX = Number(hint.pageX);
  const pageY = Number(hint.pageY);
  if (pageSurface && pageRect?.width > 0 && pageRect?.height > 0
    && Number.isFinite(pageX) && Number.isFinite(pageY)) {
    const xRatio = clampNumber(pageX, 0, 1, 0);
    const yRatio = clampNumber(pageY, 0, 1, 0);
    const viewportLeft = pageRect.left + pageRect.width * xRatio;
    const viewportTop = pageRect.top + pageRect.height * yRatio;
    return {
      left: doc.defaultView.scrollX + viewportLeft,
      top: doc.defaultView.scrollY + viewportTop,
      viewportTop,
      pageSurface,
      surfaceLeft: pageSurface.offsetWidth * xRatio,
      surfaceTop: pageSurface.offsetHeight * yRatio
    };
  }
  const offsetX = Number.isFinite(Number(hint.anchorOffsetX)) ? Number(hint.anchorOffsetX) : Math.min(16, rect.width / 2);
  const offsetY = Number.isFinite(Number(hint.anchorOffsetY)) ? Number(hint.anchorOffsetY) : Math.min(16, rect.height / 2);
  if (pageSurface && pageRect?.width > 0 && pageRect?.height > 0) {
    const previewScaleX = pageSurface.offsetWidth > 0 ? pageRect.width / pageSurface.offsetWidth : 1;
    const previewScaleY = pageSurface.offsetHeight > 0 ? pageRect.height / pageSurface.offsetHeight : 1;
    const viewportLeft = rect.left + offsetX * previewScaleX;
    const viewportTop = rect.top + offsetY * previewScaleY;
    const xRatio = clampNumber((viewportLeft - pageRect.left) / pageRect.width, 0, 1, 0);
    const yRatio = clampNumber((viewportTop - pageRect.top) / pageRect.height, 0, 1, 0);
    return {
      left: doc.defaultView.scrollX + viewportLeft,
      top: doc.defaultView.scrollY + viewportTop,
      viewportTop,
      pageSurface,
      surfaceLeft: pageSurface.offsetWidth * xRatio,
      surfaceTop: pageSurface.offsetHeight * yRatio
    };
  }
  const left = doc.defaultView.scrollX + rect.left + offsetX;
  const top = doc.defaultView.scrollY + rect.top + offsetY;
  return {
    left,
    top,
    viewportTop: top - doc.defaultView.scrollY
  };
}

function jumpToQuickMark(markId) {
  const mark = state.quickMarks.find((item) => item.id === markId);
  if (!mark || !state.iframeLoaded) return;
  const doc = getFrameDoc();
  if (requestPdfPageForNavigationTarget(doc, mark.target, { quickMarkId: mark.id })) {
    state.pendingQuickMarkJumpId = mark.id;
    const pageIndex = pdfPageIndexFromTarget(mark.target);
    setStatus(`Loading page ${pageIndex + 1} for quick mark...`);
    syncQuickMarkStack(doc);
    return;
  }
  const position = quickMarkPosition(doc, mark);
  if (!position) {
    setStatus('This quick mark is not currently resolvable.', true);
    return;
  }
  state.pendingQuickMarkJumpId = null;
  doc.defaultView.scrollTo(0, Math.max(0, position.top - doc.defaultView.innerHeight * 0.34));
  syncQuickMarkStack(doc);
}

function retryPendingQuickMarkJump(doc = getFrameDoc()) {
  const markId = state.pendingQuickMarkJumpId;
  if (!markId || !doc) return false;
  const mark = state.quickMarks.find((item) => item.id === markId);
  if (!mark || !resolveTargetElement(doc, mark.target)) return false;
  state.pendingQuickMarkJumpId = null;
  renderQuickMarks(doc);
  jumpToQuickMark(markId);
  return true;
}

function jumpToSourceBookmark(bookmarkId) {
  const bookmark = state.sourceBookmarks.find((item) => item.id === bookmarkId);
  if (!bookmark?.target || !state.iframeLoaded) return;
  const doc = getFrameDoc();
  if (requestPdfPageForNavigationTarget(doc, bookmark.target, { sourceBookmarkId: bookmark.id })) {
    state.pendingSourceBookmarkJumpId = bookmark.id;
    const pageIndex = pdfPageIndexFromTarget(bookmark.target);
    setStatus(`Loading page ${pageIndex + 1} for bookmark “${bookmark.label}”...`);
    return;
  }
  const position = quickMarkPosition(doc, bookmark);
  if (!position) {
    setStatus('This bookmark is not currently resolvable.', true);
    return;
  }
  state.pendingSourceBookmarkJumpId = null;
  doc.defaultView.scrollTo(0, Math.max(0, position.top - doc.defaultView.innerHeight * 0.34));
  setStatus(`Moved to bookmark “${bookmark.label}”.`);
}

function retryPendingSourceBookmarkJump(doc = getFrameDoc()) {
  const bookmarkId = state.pendingSourceBookmarkJumpId;
  if (!bookmarkId || !doc) return false;
  const bookmark = state.sourceBookmarks.find((item) => item.id === bookmarkId);
  if (!bookmark?.target || !resolveTargetElement(doc, bookmark.target)) return false;
  state.pendingSourceBookmarkJumpId = null;
  jumpToSourceBookmark(bookmarkId);
  return true;
}

function requestPdfPageForNavigationTarget(doc, target, detail = {}) {
  if (state.currentDocument?.sourceType !== 'pdf' || !doc || !target) return false;
  const pageIndex = pdfPageIndexFromTarget(target);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return false;
  if (readerPositionPdfPageElementNow(doc, { pageIndex, pageNumber: pageIndex + 1 })) return false;
  doc.dispatchEvent(new doc.defaultView.CustomEvent('reader-pdf-ensure-page', {
    detail: {
      ...detail,
      pageIndex,
      pageNumber: pageIndex + 1
    }
  }));
  return true;
}

async function createHighlightFromCurrentTarget() {
  if (isFocusModeActive()) {
    setStatus('Disable focus mode before creating a new note.', true);
    hideSelectionHighlightButton();
    return;
  }
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) {
    setStatus('Text highlights are unavailable for this document.', true);
    hideSelectionHighlightButton();
    return;
  }
  if (!state.currentTarget || state.currentTarget.type !== 'text') {
    setStatus('No selected target to save.', true);
    return;
  }
  const annotation = await createAnnotationFromTarget(state.currentTarget, {
    highlight: { enabled: true, color: 'yellow' },
    note: defaultBlankNote()
  });
  recordAnnotationHistory('highlight creation', null, annotation, annotation.id);
  hideSelectionHighlightButton();
  getFrameDoc().getSelection()?.removeAllRanges();
  await reloadAnnotationsAndRender(annotation.id);
  setStatus('Highlight created. Edit the side note directly.');
}

async function createBlockSideNote(target) {
  if (isFocusModeActive()) {
    setStatus('Disable focus mode before creating a new note.', true);
    return;
  }
  if (!compatibilityFeatureEnabled('blockNotes')) {
    setStatus('Block notes are unavailable for this document.', true);
    return;
  }
  const annotation = await createAnnotationFromTarget(target, {
    highlight: { enabled: false, color: 'yellow' },
    note: defaultBlankNote()
  });
  recordAnnotationHistory('note creation', null, annotation, annotation.id);
  await reloadAnnotationsAndRender(annotation.id);
  setStatus('Side note created.');
}

function defaultBlankNote() {
  return {
    title: '',
    schemaVersion: 2,
    markdown: '',
    ink: { strokes: [], height: INK_CANVAS_HEIGHT.default },
    blocks: [newSideNoteBlock('blank')]
  };
}

async function createAnnotationFromTarget(sourceTarget, options = {}) {
  const target = { ...sourceTarget };
  const attachedTargets = Array.isArray(target.targets)
    ? target.targets.map((attachedTarget) => {
      const normalizedTarget = { ...attachedTarget };
      delete normalizedTarget.clientRect;
      delete normalizedTarget.targets;
      return normalizedTarget;
    })
    : [];
  delete target.clientRect;
  delete target.targets;
  const payload = {
    target,
    targets: attachedTargets,
    highlight: options.highlight || { enabled: target.type === 'text', color: 'yellow' },
    note: options.note || defaultBlankNote(),
    display: {
      mode: options.displayMode || 'side',
      collapsed: true
    }
  };
  return storage.createAnnotation(state.docId, payload);
}

function renderAnnotations() {
  if (!state.iframeLoaded) return;
  const doc = getFrameDoc();
  const focusSnapshot = captureFrameNoteFocus(doc);
  state.pdfDirtyPageIndexes.clear();
  state.pdfNeedsFullRefresh = false;
  state.pdfDeferredRefreshEffects = false;
  const metrics = layoutMetrics(doc);
  const sideNotesVisible = sideNotesVisibleForMetrics(metrics);
  syncPinnedNoteChrome();
  injectReaderStyles(doc);
  clearRenderedAnnotations(doc);
  syncFrameReadingMode(doc);
  state.annotationResolution = buildAnnotationResolutionMap(doc, state.annotations);

  if (!state.readingMode || state.readingShowHighlights) {
    for (const annotation of state.annotations) {
      for (const { target, index } of annotationHighlightTargets(annotation)) {
        if (target.type === 'pdf-rect') {
          applyPdfRectHighlight(doc, annotation, target, index);
        } else {
          applyTextHighlight(doc, annotation, target, index);
        }
      }
    }
  }

  if (sideNotesVisible) {
    for (const annotation of annotationsInResolvedDocumentOrder(doc)) {
      attachMarker(doc, annotation);
    }
  }
  if (sideNotesVisible) applyFocusModeDisplay(doc);
  if (sideNotesVisible) layoutSideNotes(doc);
  syncJumpToNoteButton(doc);
  renderLayoutEditor(doc);
  retryPendingHighlightNavigatorJump(doc);
  syncFrameNotesPanelOverlayState(doc);
  renderQuickMarks(doc);
  scheduleSplitNotesStateBroadcast(doc);
  restoreFrameNoteFocus(doc, focusSnapshot);
  syncReaderDocumentNotice();
}

function annotationsInResolvedDocumentOrder(doc) {
  const storedIndex = new Map(state.annotations.map((annotation, index) => [annotation.id, index]));
  return state.annotations.slice().sort((a, b) => {
    const aTop = resolvedAnnotationDocumentTop(doc, a);
    const bTop = resolvedAnnotationDocumentTop(doc, b);
    const aResolved = Number.isFinite(aTop);
    const bResolved = Number.isFinite(bTop);
    if (aResolved !== bResolved) return aResolved ? -1 : 1;
    if (aResolved && Math.abs(aTop - bTop) > 0.5) return aTop - bTop;
    return (storedIndex.get(a.id) || 0) - (storedIndex.get(b.id) || 0)
      || String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  });
}

function resolvedAnnotationDocumentTop(doc, annotation) {
  const primary = annotationResolution(annotation)?.targets?.find((target) => target.primary)
    || annotationResolution(annotation)?.targets?.[0];
  const element = primary?.element || primary?.anchorElement;
  if (!element || primary?.status !== 'resolved') return NaN;
  const rect = element.getBoundingClientRect();
  const pointRatio = Number(annotation?.target?.y);
  return doc.defaultView.scrollY + rect.top + (Number.isFinite(pointRatio) ? rect.height * pointRatio : 0);
}

function captureFrameNoteFocus(doc) {
  const active = doc?.activeElement;
  const note = active?.closest?.('.reader-side-note');
  if (!note) return null;
  const snapshot = {
    annotationId: note.dataset.annotationId,
    action: active.dataset?.sideNoteAction || '',
    blockId: active.dataset?.blockId || active.closest?.('[data-block-id]')?.dataset?.blockId || '',
    field: active.classList?.contains('reader-side-note-title') ? 'title'
      : active.classList?.contains('reader-side-note-body') ? 'body'
        : active.classList?.contains('reader-side-note-blank') ? 'blank'
          : active.classList?.contains('reader-side-note-ink-resize-handle') ? 'ink-resize'
            : ''
  };
  return snapshot.annotationId ? snapshot : null;
}

function restoreFrameNoteFocus(doc, snapshot) {
  if (!snapshot?.annotationId) return;
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(snapshot.annotationId)}"]`);
  if (!note) return;
  let target = null;
  if (snapshot.action) target = note.querySelector(`[data-side-note-action="${cssEscape(snapshot.action)}"][data-block-id="${cssEscape(snapshot.blockId)}"], [data-side-note-action="${cssEscape(snapshot.action)}"]`);
  if (!target && snapshot.field === 'title') target = note.querySelector('.reader-side-note-title');
  if (!target && snapshot.field === 'body') target = note.querySelector(`.reader-side-note-body[data-block-id="${cssEscape(snapshot.blockId)}"]`);
  if (!target && snapshot.field === 'blank') target = note.querySelector(`.reader-side-note-blank[data-block-id="${cssEscape(snapshot.blockId)}"]`);
  if (!target && snapshot.field === 'ink-resize') target = note.querySelector(`.reader-side-note-ink-resize-handle[data-block-id="${cssEscape(snapshot.blockId)}"]`);
  target?.focus?.({ preventScroll: true });
}

function renderAnnotationsForPdfPageIndexes(doc, pageIndexes, options = {}) {
  if (!state.iframeLoaded || state.currentDocument?.sourceType !== 'pdf') return;
  const targets = new Set([...pageIndexes].filter((index) => Number.isInteger(index) && index >= 0));
  if (!targets.size) return;
  const annotations = state.annotations.filter((annotation) => (
    annotationPdfPageIndexes(annotation).some((pageIndex) => targets.has(pageIndex))
  ));
  if (!annotations.length) return;
  const metrics = layoutMetrics(doc);
  const sideNotesVisible = sideNotesVisibleForMetrics(metrics);
  syncPinnedNoteChrome();
  injectReaderStyles(doc);
  syncFrameReadingMode(doc);

  for (const annotation of annotations) {
    state.annotationResolution.set(annotation.id, buildAnnotationResolution(doc, annotation));
    clearRenderedAnnotation(doc, annotation.id);
    if (!state.readingMode || state.readingShowHighlights) {
      for (const { target, index } of annotationHighlightTargets(annotation)) {
        if (target.type === 'pdf-rect') {
          applyPdfRectHighlight(doc, annotation, target, index);
        } else {
          applyTextHighlight(doc, annotation, target, index);
        }
      }
    }
    if (sideNotesVisible) upsertSideNoteForAnnotation(doc, annotation);
  }
  if (sideNotesVisible && !options.deferNonessential) {
    requestSideNoteLayout(doc);
  } else if (sideNotesVisible) {
    state.pdfDeferredRefreshEffects = true;
  }
  if (!options.deferNonessential) {
    renderNavigatorNoteCards(annotations.map((annotation) => annotation.id));
  } else {
    state.pdfDeferredRefreshEffects = true;
  }
  scheduleSplitNotesStateBroadcast(doc);
}

function buildAnnotationResolution(doc, annotation) {
  const targets = [
    { target: annotation.target, index: 0, primary: true },
    ...(annotation.targets || []).map((target, index) => ({ target, index: index + 1, primary: false }))
  ];
  const resolvedTargets = targets.map(({ target, index, primary }) => resolveAnnotationTarget(doc, target, index, primary));
  const unresolvedTargets = resolvedTargets.filter((target) => target.status === 'unresolved');
  const pendingTargets = resolvedTargets.filter((target) => target.status === 'pending');
  return {
    status: unresolvedTargets.length ? 'unresolved' : pendingTargets.length ? 'pending' : 'resolved',
    unresolvedReason: unresolvedTargets[0]?.unresolvedReason || null,
    targets: resolvedTargets
  };
}

function upsertSideNoteForAnnotation(doc, annotation) {
  const escaped = cssEscape(annotation.id);
  const existing = doc.querySelector(`.reader-side-note[data-annotation-id="${escaped}"]`);
  if (existing?.classList.contains('is-editing')) return;
  if (existing) {
    syncExistingSideNote(existing, annotation);
    return;
  }
  attachMarker(doc, annotation);
}

function syncExistingSideNote(note, annotation) {
  const isPinned = annotation.id === state.pinnedAnnotationId;
  const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
  note.className = [
    'reader-side-note',
    annotation.id === state.activeAnnotationId ? 'is-active' : '',
    isPinned ? 'is-pinned' : '',
    isCollapsed ? 'is-collapsed' : '',
    annotationResolution(annotation)?.status === 'unresolved' ? 'is-unresolved' : ''
  ].filter(Boolean).join(' ');
  if (annotation.id === state.activeAnnotationId) note.dataset.inkTool = state.inkTool;
  else delete note.dataset.inkTool;
}

function applyTextHighlight(doc, annotation, target = annotation.target, targetIndex = 0) {
  const resolved = resolvedTargetForAnnotation(annotation.id, targetIndex);
  if (!resolved || resolved.status !== 'resolved' || !resolved.element) return;
  const range = rangeFromOffsets(resolved.element, resolved.startOffset, resolved.endOffset);
  if (!range) return;
  const classes = [
    'reader-highlight',
    `reader-highlight-${annotation.highlight.color || 'yellow'}`,
    targetIndex > 0 ? 'reader-highlight-attached' : 'reader-highlight-primary',
    annotation.id === state.activeAnnotationId ? 'is-active' : ''
  ].filter(Boolean).join(' ');
  if (isAtomicHighlightRoot(resolved.element)) {
    highlightAtomicRoot(resolved.element, classes, annotation.id, targetIndex);
    return;
  }
  wrapRangeTextNodesInRoot(resolved.element, range, classes, annotation.id, targetIndex);
}

function applyPdfRectHighlight(doc, annotation, target = annotation.target, targetIndex = 0) {
  const page = resolveTargetElement(doc, target);
  if (!page || target?.type !== 'pdf-rect' || !target.rect) return;
  const rect = target.rect;
  const highlight = doc.createElement('button');
  highlight.type = 'button';
  highlight.className = [
    'reader-highlight',
    'reader-pdf-highlight-rect',
    `reader-highlight-${annotation.highlight?.color || 'yellow'}`,
    annotation.id === state.activeAnnotationId ? 'is-active' : ''
  ].filter(Boolean).join(' ');
  highlight.dataset.annotationId = annotation.id;
  highlight.dataset.targetIndex = String(targetIndex);
  highlight.title = 'PDF highlight';
  highlight.setAttribute('aria-label', 'PDF highlight. Activate to open its note');
  highlight.style.left = `${clampNumber(rect.x, 0, 1, 0) * 100}%`;
  highlight.style.top = `${clampNumber(rect.y, 0, 1, 0) * 100}%`;
  highlight.style.width = `${clampNumber(rect.width, 0, 1, 0) * 100}%`;
  highlight.style.height = `${clampNumber(rect.height, 0, 1, 0) * 100}%`;
  (page.querySelector(':scope > .pdf-page-surface') || page).append(highlight);
}

function buildAnnotationResolutionMap(doc, annotations) {
  const map = new Map();
  for (const annotation of annotations) {
    map.set(annotation.id, buildAnnotationResolution(doc, annotation));
  }
  return map;
}

function resolveAnnotationTarget(doc, target, targetIndex = 0, primary = false) {
  if (!target) return unresolvedTarget(targetIndex, primary, 'missing-target');
  if (isPendingPdfTargetPage(doc, target)) return pendingTarget(targetIndex, primary, null, target);
  let element = resolveTargetElement(doc, target);
  const quoteRepair = !element && target.type === 'text'
    ? uniqueQuoteRepairMatch(doc, target)
    : null;
  if (quoteRepair) element = quoteRepair.element;
  if (!element) return unresolvedTarget(targetIndex, primary, 'anchor-not-found');
  if (target.type !== 'text') {
    return {
      status: 'resolved',
      strategy: 'block',
      targetIndex,
      primary,
      element,
      target,
      startOffset: null,
      endOffset: null,
      unresolvedReason: null
    };
  }
  if (isPendingPdfTextTarget(element, target)) {
    return pendingTarget(targetIndex, primary, element, target);
  }
  const text = annotationTextContent(element);
  const offsets = quoteRepair || resolveTextOffsets(text, target);
  return {
    ...offsets,
    targetIndex,
    primary,
    element: offsets.status === 'resolved' ? element : null,
    anchorElement: element,
    target
  };
}

function isPendingPdfTargetPage(doc, target) {
  if (state.currentDocument?.sourceType !== 'pdf'
    || !['text', 'pdf-page-point', 'pdf-rect'].includes(target?.type)) return false;
  const pageIndex = pdfPageIndexFromTarget(target);
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return false;
  const pageCount = Number(doc?.documentElement?.dataset?.pdfPageCount);
  if (Number.isFinite(pageCount) && pageCount > 0 && pageIndex >= pageCount) return false;
  if (doc.querySelector(`[data-pdf-page-index="${cssEscape(String(pageIndex))}"]`)) return false;
  return doc?.documentElement?.dataset?.pdfPagesReady !== 'true';
}

function uniqueQuoteRepairMatch(doc, target) {
  const quote = targetQuoteParts(target);
  if (!quote.exact) return null;
  const page = target.pageId
    ? doc.querySelector(`[data-page-id="${cssEscape(target.pageId)}"]`)
    : null;
  const scope = page || doc;
  const candidates = Array.from(scope.querySelectorAll(QUOTE_REPAIR_SELECTOR))
    .filter((element) => !element.closest('.reader-side-note-layer'));
  const occurrences = [];
  for (const element of candidates) {
    const text = annotationTextContent(element);
    let startOffset = text.indexOf(quote.exact);
    while (startOffset !== -1) {
      const endOffset = startOffset + quote.exact.length;
      const prefixMatch = quote.prefix ? text.slice(0, startOffset).endsWith(quote.prefix) : false;
      const suffixMatch = quote.suffix ? text.slice(endOffset).startsWith(quote.suffix) : false;
      const contextScore = Number(prefixMatch) + Number(suffixMatch);
      if ((!quote.prefix && !quote.suffix) || contextScore > 0) {
        occurrences.push({
          element,
          startOffset,
          endOffset,
          contextScore,
          status: 'resolved',
          strategy: contextScore ? 'quote-block-repair-context' : 'quote-block-repair',
          unresolvedReason: null
        });
      }
      startOffset = text.indexOf(quote.exact, startOffset + Math.max(1, quote.exact.length));
    }
  }
  const deepest = occurrences.filter((candidate) => !occurrences.some((other) => (
    other !== candidate
    && other.element !== candidate.element
    && candidate.element.contains(other.element)
    && other.startOffset >= 0
  )));
  if (!deepest.length) return null;
  const bestScore = Math.max(...deepest.map((candidate) => candidate.contextScore));
  const best = deepest.filter((candidate) => candidate.contextScore === bestScore);
  if (best.length !== 1) return null;
  if ((quote.prefix || quote.suffix) && bestScore < 1) return null;
  return best[0];
}

function targetQuoteParts(target) {
  const selector = Array.isArray(target?.selectors)
    ? target.selectors.find((item) => item?.type === 'TextQuoteSelector')
    : null;
  return {
    exact: String(target?.exact ?? selector?.exact ?? ''),
    prefix: String(target?.prefix ?? selector?.prefix ?? ''),
    suffix: String(target?.suffix ?? selector?.suffix ?? '')
  };
}

function unresolvedTarget(targetIndex, primary, unresolvedReason) {
  return {
    status: 'unresolved',
    strategy: null,
    targetIndex,
    primary,
    element: null,
    anchorElement: null,
    target: null,
    startOffset: null,
    endOffset: null,
    unresolvedReason
  };
}

function pendingTarget(targetIndex, primary, element, target) {
  return {
    status: 'pending',
    strategy: null,
    targetIndex,
    primary,
    element: null,
    anchorElement: element,
    target,
    startOffset: null,
    endOffset: null,
    unresolvedReason: null
  };
}

function isPendingPdfTextTarget(element, target) {
  if (state.currentDocument?.sourceType !== 'pdf' || target?.type !== 'text') return false;
  const page = element?.closest?.('.pdf-page') || (element?.classList?.contains('pdf-page') ? element : null);
  if (!page) return false;
  if (page.dataset.textLayer === 'ready' || page.dataset.textLayer === 'empty' || page.dataset.textLayer === 'failed') return false;
  return !page.querySelector('.pdf-page-text-layer span');
}

function resolvedTargetForAnnotation(annotationId, targetIndex = 0) {
  const resolution = state.annotationResolution.get(annotationId);
  return resolution?.targets?.find((target) => target.targetIndex === targetIndex) || null;
}

function annotationResolution(annotation) {
  return annotation?.id ? state.annotationResolution.get(annotation.id) : null;
}

function attachMarker(doc, annotation) {
  const isPinned = annotation.id === state.pinnedAnnotationId;
  const block = resolveTargetElement(doc, annotation.target);
  if (!block && !isPinned) return;
  if (block) block.dataset.readerHasNotes = 'true';

  const layer = getSideNoteLayer(doc);
  const note = doc.createElement('aside');
  const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
  note.className = [
    'reader-side-note',
    annotation.id === state.activeAnnotationId ? 'is-active' : '',
    isPinned ? 'is-pinned' : '',
    isCollapsed ? 'is-collapsed' : '',
    annotationResolution(annotation)?.status === 'unresolved' ? 'is-unresolved' : ''
  ].filter(Boolean).join(' ');
  note.dataset.annotationId = annotation.id;
  if (annotation.id === state.activeAnnotationId) note.dataset.inkTool = state.inkTool;

  const card = doc.createElement('div');
  card.className = 'reader-side-note-card';

  const collapseButton = doc.createElement('button');
  collapseButton.type = 'button';
  collapseButton.className = 'reader-side-note-tool reader-side-note-collapse';
  collapseButton.dataset.sideNoteAction = 'toggle-collapse';
  collapseButton.title = isCollapsed ? 'Expand note' : 'Collapse note';
  collapseButton.setAttribute('aria-label', isCollapsed ? 'Expand note' : 'Collapse note');
  collapseButton.setAttribute('aria-expanded', String(!isCollapsed));
  collapseButton.textContent = isCollapsed ? '▼' : '▲';

  const title = doc.createElement('span');
  title.className = 'reader-side-note-title';
  title.dataset.placeholder = 'Title';
  title.textContent = sideNoteTitle(annotation);
  title.tabIndex = 0;
  title.setAttribute('aria-label', title.textContent ? `Note title: ${readableSnippet(title.textContent, 80)}` : 'Empty note title. Press Enter to edit');

  const tools = doc.createElement('div');
  tools.className = 'reader-side-note-tools';
  tools.addEventListener('pointerdown', preserveSideNoteActionClick);
  const hasHighlights = annotationHighlightTargets(annotation).length > 0;
  const canUseTextHighlights = compatibilityFeatureEnabled('singleBlockTextHighlights');
  if (compatibilityFeatureEnabled('focusMode')) {
    const focusButton = doc.createElement('button');
    focusButton.type = 'button';
    focusButton.className = `reader-side-note-tool ${annotation.id === state.focusModeAnnotationId ? 'is-active' : ''}`;
    focusButton.dataset.sideNoteAction = 'focus';
    focusButton.title = 'Focus mode';
    focusButton.setAttribute('aria-label', annotation.id === state.focusModeAnnotationId ? 'Exit focus mode' : 'Enter focus mode');
    focusButton.setAttribute('aria-pressed', String(annotation.id === state.focusModeAnnotationId));
    focusButton.textContent = 'F';
    tools.append(focusButton);
  }
  const attachButton = canUseTextHighlights ? doc.createElement('button') : null;
  if (attachButton) {
    attachButton.type = 'button';
    const isAttachingToNote = state.mode === 'attach-highlight' && state.attachTargetAnnotationId === annotation.id;
    attachButton.className = `reader-side-note-tool ${isAttachingToNote ? 'is-active' : ''}`;
    attachButton.dataset.sideNoteAction = 'attach';
    attachButton.title = isAttachingToNote ? 'Adding highlights to this note' : 'Add highlight';
    attachButton.setAttribute('aria-label', isAttachingToNote ? 'Finish adding highlights' : 'Add highlight to note');
    attachButton.setAttribute('aria-pressed', String(isAttachingToNote));
    attachButton.textContent = '+';
  }
  const removeHighlightButton = canUseTextHighlights && hasHighlights ? doc.createElement('button') : null;
  if (removeHighlightButton) {
    removeHighlightButton.type = 'button';
    const isRemovingFromNote = state.mode === 'remove-highlight' && state.removeTargetAnnotationId === annotation.id;
    removeHighlightButton.className = `reader-side-note-tool ${isRemovingFromNote ? 'is-active' : ''}`;
    removeHighlightButton.dataset.sideNoteAction = 'remove-highlight';
    removeHighlightButton.title = isRemovingFromNote ? 'Click a highlight to remove it' : 'Remove highlight';
    removeHighlightButton.setAttribute('aria-label', isRemovingFromNote ? 'Finish removing highlights' : 'Remove highlight from note');
    removeHighlightButton.setAttribute('aria-pressed', String(isRemovingFromNote));
    removeHighlightButton.textContent = '−';
  }
  const fullButton = doc.createElement('button');
  fullButton.type = 'button';
  fullButton.className = `reader-side-note-tool ${isPinned ? 'is-active' : ''}`;
  fullButton.dataset.sideNoteAction = 'pin';
  fullButton.title = isPinned ? 'Unpin note editor' : 'Pin note editor';
  fullButton.setAttribute('aria-label', isPinned ? 'Unpin note editor' : 'Pin note editor');
  fullButton.setAttribute('aria-pressed', String(isPinned));
  fullButton.textContent = '「」';
  const deleteButton = doc.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'reader-side-note-tool reader-side-note-delete';
  deleteButton.dataset.sideNoteAction = 'delete';
  deleteButton.title = 'Delete note';
  deleteButton.setAttribute('aria-label', 'Delete note');
  deleteButton.textContent = '×';
  tools.append(collapseButton);
  if (attachButton) tools.append(attachButton);
  if (removeHighlightButton) tools.append(removeHighlightButton);
  tools.append(fullButton, deleteButton);

  card.append(tools, title);
  if (annotationResolution(annotation)?.status === 'unresolved') {
    const warning = doc.createElement('span');
    warning.className = 'reader-side-note-warning';
    warning.textContent = unresolvedAnnotationLabel(annotation);
    card.append(warning);
  }
  const blocks = sideNoteContentBlocks(annotation);
  const soleBlank = blocks.length === 1 && blocks[0]?.type === 'blank';
  if (isPinned) card.append(createPinnedInsertionBoundary(doc, annotation.id, {
    beforeBlockId: soleBlank ? '' : blocks[0]?.id || ''
  }));
  blocks.forEach((block, index) => {
    if (isPinned && soleBlank) return;
    if (block.type === 'blank') {
      const blank = doc.createElement('span');
      blank.className = 'reader-side-note-blank';
      blank.dataset.blockId = block.id;
      blank.setAttribute('role', 'button');
      blank.setAttribute('aria-label', 'Empty note block. Press Enter to add text');
      blank.tabIndex = 0;
      blank.addEventListener('pointerdown', onSideNoteBlankPointerDown);
      card.append(blank);
      if (isPinned) card.append(createPinnedInsertionBoundary(doc, annotation.id, { afterBlockId: block.id }, block.id));
      return;
    }
    if (block.type === 'ink') {
      const inkWrap = doc.createElement('div');
      inkWrap.className = 'reader-side-note-ink-wrap';
      inkWrap.dataset.blockId = block.id;
      inkWrap.style.height = `${normalizeInkHeight(block.ink?.height)}px`;
      const canvas = doc.createElement('canvas');
      canvas.className = 'reader-side-note-ink';
      canvas.dataset.blockId = block.id;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', drawingCanvasLabel(annotation, block));
      if (doc.defaultView?.PointerEvent) {
        canvas.addEventListener('pointerdown', onSideInkPointerDown);
        canvas.addEventListener('onpointerrawupdate' in doc.defaultView ? 'pointerrawupdate' : 'pointermove', onSideInkPointerMove);
        canvas.addEventListener('pointerup', onSideInkPointerUp);
        canvas.addEventListener('pointercancel', onSideInkPointerUp);
        canvas.addEventListener('pointerleave', onSideInkPointerUp);
      } else {
        canvas.addEventListener('mousedown', onSideInkPointerDown);
        canvas.addEventListener('mousemove', onSideInkPointerMove);
        canvas.addEventListener('mouseup', onSideInkPointerUp);
        canvas.addEventListener('mouseleave', onSideInkPointerUp);
      }
      canvas.addEventListener('contextmenu', (event) => event.preventDefault());
      const resizeHandle = createSideInkResizeHandle(doc, annotation.id, block.id, inkWrap);
      inkWrap.append(canvas, resizeHandle);
      requestAnimationFrame(() => drawSideInkCanvas(canvas, annotation.id, block.id));
      card.append(inkWrap);
      if (annotation.id === state.activeAnnotationId) {
        const toolbar = createSideInkToolbar(doc, annotation.id, block.id);
        inkWrap.append(toolbar);
      }
      if (isPinned) card.append(createPinnedInsertionBoundary(doc, annotation.id, { afterBlockId: block.id }, block.id));
      return;
    }
    if (block.type === 'image') {
      card.append(createSideNoteImageBlock(doc, annotation, block, { editable: isPinned }));
    } else {
      card.append(createSideNoteTextBlock(doc, annotation, block, index));
    }
    if (isPinned) card.append(createPinnedInsertionBoundary(doc, annotation.id, { afterBlockId: block.id }, block.id));
  });
  note.append(card);
  layer.append(note);
}

function createSideNoteTextBlock(doc, annotation, block, index) {
  const wrapper = doc.createElement('div');
  wrapper.className = 'reader-side-note-text-block';
  wrapper.dataset.blockId = block.id;
  const body = doc.createElement('div');
  body.className = 'reader-side-note-body';
  body.dataset.blockId = block.id;
  body.dataset.placeholder = index === 0 ? 'Note' : 'Continue note';
  body.textContent = block.markdown;
  body.tabIndex = 0;
  body.setAttribute('aria-label', block.markdown?.trim()
    ? `Note text: ${readableSnippet(block.markdown, 100)}`
    : 'Empty note text. Press Enter to edit');
  const modeButton = doc.createElement('button');
  modeButton.type = 'button';
  modeButton.className = 'reader-side-note-text-mode';
  modeButton.dataset.sideNoteAction = 'edit-text';
  modeButton.dataset.blockId = block.id;
  modeButton.textContent = 'Edit';
  modeButton.hidden = true;
  modeButton.addEventListener('pointerdown', preserveSideNoteActionClick);
  const actions = doc.createElement('div');
  actions.className = 'reader-side-note-text-actions';
  const feedback = doc.createElement('span');
  feedback.className = 'reader-side-note-render-feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.hidden = true;
  actions.append(feedback, modeButton);
  wrapper.append(body, actions);
  renderSideNoteMarkdownBlock(body, modeButton, block.id, block.markdown, doc);
  return wrapper;
}

async function renderSideNoteMarkdownBlock(body, modeButton, blockId, source, doc = body?.ownerDocument) {
  if (!body || !modeButton) return;
  const revision = String(++state.noteMarkdownRenderRevision);
  body.dataset.markdownRevision = revision;
  state.noteMarkdownSources.set(body, source);
  try {
    const rendered = await renderNoteMarkdown(source);
    if (!body.isConnected
      || body.dataset.blockId !== blockId
      || body.dataset.markdownRevision !== revision
      || state.noteMarkdownSources.get(body) !== source
      || body.isContentEditable) return;
    if (!rendered.hasRenderableSyntax) {
      body.classList.remove('is-rendered', 'note-markdown');
      body.textContent = source;
      body.tabIndex = 0;
      modeButton.hidden = true;
      setSideNoteRenderFeedback(modeButton, '');
      delete body.dataset.hasRenderableSyntax;
      return;
    }
    ensureNoteMarkdownStyles(doc);
    body.classList.add('is-rendered', 'note-markdown');
    body.innerHTML = rendered.html;
    body.tabIndex = -1;
    body.dataset.hasRenderableSyntax = 'true';
    modeButton.dataset.sideNoteAction = 'edit-text';
    modeButton.textContent = 'Edit';
    modeButton.hidden = false;
    setSideNoteRenderFeedback(modeButton, '');
    requestSideNoteLayout(doc);
  } catch {
    if (!body.isConnected || body.dataset.markdownRevision !== revision) return;
    body.classList.remove('is-rendered', 'note-markdown');
    body.textContent = source;
    body.tabIndex = 0;
    modeButton.hidden = true;
    setSideNoteRenderFeedback(modeButton, '');
  }
}

function setSideNoteRenderFeedback(modeButton, message = '') {
  const feedback = modeButton?.closest?.('.reader-side-note-text-actions')
    ?.querySelector?.('.reader-side-note-render-feedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.hidden = !message;
}

function createSideNoteImageBlock(doc, annotation, block, options = {}) {
  const wrapper = doc.createElement('div');
  wrapper.className = 'reader-side-note-image-block';
  wrapper.dataset.blockId = block.id;
  const frame = doc.createElement('div');
  frame.className = 'reader-side-note-image-frame';
  frame.style.aspectRatio = `${block.intrinsicWidth} / ${block.intrinsicHeight}`;
  frame.style.maxWidth = `${block.intrinsicWidth}px`;
  const image = doc.createElement('img');
  image.className = 'reader-side-note-image';
  image.alt = block.alt || '';
  image.loading = 'eager';
  image.decoding = 'async';
  image.hidden = true;
  image.dataset.assetPath = block.assetPath;
  const placeholder = doc.createElement('span');
  placeholder.className = 'reader-side-note-image-placeholder';
  placeholder.textContent = `Loading ${block.originalName || block.alt || 'picture'}…`;
  frame.append(image, placeholder);
  wrapper.append(frame);
  if (options.editable) {
    const tools = doc.createElement('div');
    tools.className = 'reader-side-note-image-tools';
    const label = doc.createElement('label');
    label.textContent = 'Alt text';
    const input = doc.createElement('input');
    input.type = 'text';
    input.value = block.alt || '';
    input.dataset.sideNoteAction = 'image-alt';
    input.dataset.blockId = block.id;
    input.maxLength = 500;
    input.addEventListener('pointerdown', (event) => event.stopPropagation());
    input.addEventListener('change', () => {
      saveSideNoteImageAlt(annotation.id, block.id, input.value).catch((error) => setStatus(error.message, true));
    });
    label.append(input);
    tools.append(label);
    wrapper.append(tools);
  }
  hydrateSideNoteImage(image, placeholder, block, doc);
  return wrapper;
}

async function hydrateSideNoteImage(image, placeholder, block, doc = image?.ownerDocument) {
  const assetPath = block.assetPath;
  try {
    const url = await storage.getNoteImageUrl(state.docId, assetPath);
    if (!image.isConnected || image.dataset.assetPath !== assetPath) return;
    image.addEventListener('load', () => {
      if (!image.isConnected) return;
      image.hidden = false;
      placeholder.hidden = true;
      requestSideNoteLayout(doc);
    }, { once: true });
    image.src = url;
    image.addEventListener('error', () => {
      image.hidden = true;
      placeholder.hidden = false;
      placeholder.textContent = `Picture unavailable: ${block.originalName || block.alt || 'image'}`;
      requestSideNoteLayout(doc);
    }, { once: true });
  } catch {
    if (!image.isConnected || image.dataset.assetPath !== assetPath) return;
    image.hidden = true;
    placeholder.hidden = false;
    placeholder.textContent = `Picture unavailable: ${block.originalName || block.alt || 'image'}`;
    requestSideNoteLayout(doc);
  }
}

async function saveSideNoteImageAlt(annotationId, blockId, alt) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type !== 'image' || block.alt === alt) return;
  block.alt = String(alt || '');
  const updated = await saveAnnotationBlocks(annotation, blocks);
  recordAnnotationHistory('picture alt text edit', before, updated, annotationId);
}

function createSideInkToolbar(doc, annotationId, blockId) {
  const toolbar = doc.createElement('div');
  toolbar.className = 'reader-side-note-ink-toolbar';
  toolbar.dataset.blockId = blockId;
  toolbar.innerHTML = `
    <button type="button" data-side-note-action="ink-tool-pen" class="${state.inkTool === 'pen' ? 'is-active' : ''}" title="Pen" aria-pressed="${state.inkTool === 'pen'}">Pen</button>
    <button type="button" data-side-note-action="ink-tool-eraser" class="${state.inkTool === 'eraser' ? 'is-active' : ''}" title="Eraser" aria-pressed="${state.inkTool === 'eraser'}">Eraser</button>
    <label title="Line color"><span>Color</span><input type="color" value="${escapeAttr(state.inkColor)}" data-side-note-action="ink-color"></label>
    <label title="Line width"><span>Width</span><select data-side-note-action="ink-width">${inkWidthOptions(state.inkWidth)}</select></label>
    <label title="Pressure sensitivity"><input type="checkbox" ${state.inkPressureEnabled ? 'checked' : ''} data-side-note-action="ink-pressure"><span>Pressure</span></label>
    <button type="button" data-side-note-action="ink-undo" title="Undo">Undo</button>
    <button type="button" data-side-note-action="ink-redo" title="Redo">Redo</button>
    <button type="button" data-side-note-action="ink-clear" title="Clear canvas">Clear</button>
  `;
  toolbar.addEventListener('pointerdown', (event) => event.stopPropagation());
  const updateInkControl = (event) => {
    const action = event.target?.dataset?.sideNoteAction;
    if (action === 'ink-color') state.inkColor = event.target.value;
    if (action === 'ink-width') state.inkWidth = Number(event.target.value) || 3;
  };
  toolbar.addEventListener('input', updateInkControl);
  toolbar.addEventListener('change', updateInkControl);
  toolbar.dataset.annotationId = annotationId;
  return toolbar;
}

function drawingCanvasLabel(annotation, block) {
  const strokeCount = Array.isArray(block?.ink?.strokes) ? block.ink.strokes.length : 0;
  const noteLabel = readableSnippet(sideNoteTitle(annotation) || 'Untitled note', 72);
  return `${noteLabel} drawing, ${strokeCount} stroke${strokeCount === 1 ? '' : 's'}. Use the drawing toolbar to choose pen or eraser.`;
}

function createSideInkResizeHandle(doc, annotationId, blockId, inkWrap) {
  const handle = doc.createElement('button');
  handle.type = 'button';
  handle.className = 'reader-side-note-ink-resize-handle';
  handle.title = 'Resize drawing';
  handle.setAttribute('aria-label', 'Resize drawing');
  handle.dataset.blockId = blockId;
  handle.setAttribute('role', 'slider');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-valuemin', String(INK_CANVAS_HEIGHT.min));
  handle.setAttribute('aria-valuemax', String(INK_CANVAS_HEIGHT.max));
  handle.setAttribute('aria-valuenow', String(Math.round(inkWrap.getBoundingClientRect().height || normalizeInkHeight(inkWrap.style.height))));
  handle.addEventListener('pointerdown', (event) => beginSideInkCanvasResize(event, annotationId, blockId, inkWrap));
  handle.addEventListener('keydown', (event) => resizeSideInkCanvasFromKeyboard(event, annotationId, blockId, inkWrap));
  handle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  return handle;
}

function beginSideInkCanvasResize(event, annotationId, blockId, inkWrap) {
  if (event.button != null && event.button !== 0) return;
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId || !inkWrap) return;
  event.preventDefault();
  event.stopPropagation();
  const blocks = sideNoteContentBlocks(annotation);
  const blockIndex = blocks.findIndex((item) => item.id === blockId);
  const block = blocks[blockIndex];
  if (block?.type !== 'ink') return;
  const doc = inkWrap.ownerDocument;
  const startHeight = inkWrap.getBoundingClientRect().height || inkWrap.offsetHeight;
  const minHeight = minimumInkCanvasHeight(block.ink, inkWrap, { refresh: true });
  state.sideInkResizeSession = {
    annotationId,
    blockId,
    blocks,
    inkWrap,
    startY: event.clientY,
    startHeight,
    minHeight
  };
  inkWrap.classList.add('is-resizing');
  try {
    inkWrap.setPointerCapture?.(event.pointerId);
  } catch {
    // Some synthetic pointer events do not support capture.
  }
  doc.addEventListener('pointermove', onSideInkCanvasResizeMove);
  doc.addEventListener('pointerup', finishSideInkCanvasResize);
  doc.addEventListener('pointercancel', finishSideInkCanvasResize);
}

function onSideInkCanvasResizeMove(event) {
  const session = state.sideInkResizeSession;
  if (!session) return;
  event.preventDefault();
  const requestedHeight = session.startHeight + event.clientY - session.startY;
  const height = normalizeInkHeight(Math.max(session.minHeight, requestedHeight));
  session.inkWrap.style.height = `${height}px`;
  const block = session.blocks.find((item) => item.id === session.blockId);
  if (block?.type === 'ink') block.ink.height = height;
  const canvas = session.inkWrap.querySelector('.reader-side-note-ink');
  if (canvas) drawSideInkCanvas(canvas, session.annotationId, session.blockId);
  const handle = session.inkWrap.querySelector('.reader-side-note-ink-resize-handle');
  handle?.setAttribute('aria-valuemin', String(Math.round(session.minHeight)));
  handle?.setAttribute('aria-valuenow', String(Math.round(height)));
  requestSideInkResizeLayout();
}

function requestSideInkResizeLayout() {
  if (state.sideInkResizeLayoutRaf) return;
  state.sideInkResizeLayoutRaf = requestAnimationFrame(() => {
    state.sideInkResizeLayoutRaf = 0;
    layoutSideNotes(getFrameDoc());
  });
}

function finishSideInkCanvasResize(event) {
  const session = state.sideInkResizeSession;
  if (!session) return;
  event?.preventDefault?.();
  const doc = session.inkWrap?.ownerDocument;
  session.inkWrap?.classList.remove('is-resizing');
  doc?.removeEventListener('pointermove', onSideInkCanvasResizeMove);
  doc?.removeEventListener('pointerup', finishSideInkCanvasResize);
  doc?.removeEventListener('pointercancel', finishSideInkCanvasResize);
  state.sideInkResizeSession = null;
  const annotation = state.annotations.find((item) => item.id === session.annotationId);
  if (!annotation) return;
  queueSaveAnnotationBlocks(annotation, session.blocks, { render: false }).catch((error) => setStatus(error.message, true));
  requestAnimationFrame(() => layoutSideNotes(getFrameDoc()));
}

function resizeSideInkCanvasFromKeyboard(event, annotationId, blockId, inkWrap) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId || !inkWrap) return;
  const blocks = sideNoteContentBlocks(annotation);
  const blockIndex = blocks.findIndex((item) => item.id === blockId);
  const block = blocks[blockIndex];
  if (block?.type !== 'ink') return;
  const minHeight = minimumInkCanvasHeight(block.ink, inkWrap, { refresh: true });
  const current = normalizeInkHeight(inkWrap.getBoundingClientRect().height || block.ink?.height);
  const step = event.shiftKey ? 48 : 12;
  let next = null;
  if (event.key === 'ArrowUp') next = current - step;
  if (event.key === 'ArrowDown') next = current + step;
  if (event.key === 'Home') next = minHeight;
  if (event.key === 'End') next = INK_CANVAS_HEIGHT.max;
  if (event.key === '0') next = INK_CANVAS_HEIGHT.default;
  if (next == null) return;
  event.preventDefault();
  event.stopPropagation();
  const height = normalizeInkHeight(Math.max(minHeight, next));
  inkWrap.style.height = `${height}px`;
  block.ink.height = height;
  event.currentTarget.setAttribute('aria-valuemin', String(Math.round(minHeight)));
  event.currentTarget.setAttribute('aria-valuenow', String(height));
  const canvas = inkWrap.querySelector('.reader-side-note-ink');
  if (canvas) drawSideInkCanvas(canvas, annotationId, blockId);
  queueSaveAnnotationBlocks(annotation, blocks, { render: false }).catch((error) => setStatus(error.message, true));
  requestSideInkResizeLayout();
  setStatus(`Drawing height ${height} pixels.`);
}

function toggleSideNoteCollapse(annotationId) {
  if (!annotationId) return;
  if (state.collapsedSideNoteIds.has(annotationId)) {
    state.collapsedSideNoteIds.delete(annotationId);
  } else {
    state.collapsedSideNoteIds.add(annotationId);
  }
  renderAnnotations();
}

function onSideNoteBlankPointerDown(event) {
  if (event.pointerType !== 'pen') return;
  const blank = event.currentTarget;
  const note = blank.closest('.reader-side-note');
  const annotationId = note?.dataset?.annotationId;
  const blockId = blank.dataset.blockId;
  if (!annotationId || !blockId) return;
  event.preventDefault();
  event.stopPropagation();
  convertBlankBlockToInk(annotationId, blockId, event).catch((error) => setStatus(error.message, true));
}

async function convertBlankBlockToText(annotationId, blockId, pointerEvent = null) {
  const note = pointerEvent?.target?.closest?.('.reader-side-note');
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId) return;
  const blocks = sideNoteContentBlocks(annotation);
  const blockIndex = blocks.findIndex((block) => block.id === blockId);
  if (blocks[blockIndex]?.type !== 'blank') return;
  blocks[blockIndex] = { id: blockId, type: 'text', markdown: '' };
  queueSaveAnnotationBlocks(annotation, blocks, { render: false }).catch((error) => setStatus(error.message, true));
  renderAnnotations();
  renderNoteList();
  const doc = note?.ownerDocument || getFrameDoc();
  const editedNote = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  if (editedNote) beginInlineTextEdit(annotationId, editedNote, 'body', pointerEvent, blockId);
}

async function convertBlankBlockToInk(annotationId, blockId, pointerEvent = null) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId) return;
  const blocks = sideNoteContentBlocks(annotation);
  const blockIndex = blocks.findIndex((block) => block.id === blockId);
  if (blocks[blockIndex]?.type !== 'blank') return;
  const startPoint = pointerEvent ? normalizedPointInElement(pointerEvent.currentTarget || pointerEvent.target, pointerEvent) : null;
  blocks[blockIndex] = { id: blockId, type: 'ink', ink: { strokes: [], height: INK_CANVAS_HEIGHT.default } };
  queueSaveAnnotationBlocks(annotation, blocks, { render: false }).catch((error) => setStatus(error.message, true));
  renderAnnotations();
  renderNoteList();
  const doc = getFrameDoc();
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  const canvas = note?.querySelector?.(`.reader-side-note-ink[data-block-id="${cssEscape(blockId)}"]`);
  const remappedEvent = canvas && pointerEvent && startPoint
    ? remappedPointerEventForCanvas(canvas, pointerEvent, startPoint)
    : null;
  if (canvas && remappedEvent) beginSideInkPointerDown(canvas, remappedEvent);
}

function normalizedPointInElement(element, event) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect || !Number.isFinite(event?.clientX) || !Number.isFinite(event?.clientY) || rect.width <= 0 || rect.height <= 0) {
    return null;
  }
  return {
    x: clampNumber((event.clientX - rect.left) / rect.width, 0, 1, 0),
    y: clampNumber((event.clientY - rect.top) / rect.height, 0, 1, 0)
  };
}

function remappedPointerEventForCanvas(canvas, sourceEvent, normalizedPoint) {
  const rect = canvas.getBoundingClientRect();
  const view = canvas.ownerDocument.defaultView || window;
  return {
    type: sourceEvent.type?.startsWith?.('pointer') ? 'pointerdown' : 'mousedown',
    pointerId: sourceEvent.pointerId ?? 'mouse',
    pointerType: sourceEvent.pointerType || 'mouse',
    button: sourceEvent.button ?? 0,
    buttons: sourceEvent.buttons || 1,
    clientX: rect.left + rect.width * normalizedPoint.x,
    clientY: rect.top + rect.height * normalizedPoint.y,
    pressure: Number(sourceEvent.pressure) || 0.5,
    timeStamp: Number.isFinite(sourceEvent.timeStamp) ? sourceEvent.timeStamp : performance.now(),
    view,
    preventDefault() {},
    stopPropagation() {}
  };
}

function createPinnedInsertionBoundary(doc, annotationId, boundary = {}, removableBlockId = '') {
  const row = doc.createElement('div');
  row.className = 'reader-side-note-insertion-row';
  row.dataset.annotationId = annotationId;
  if (boundary.beforeBlockId) row.dataset.beforeBlockId = boundary.beforeBlockId;
  if (boundary.afterBlockId) row.dataset.afterBlockId = boundary.afterBlockId;
  row.addEventListener('pointerdown', preserveSideNoteActionClick);
  row.innerHTML = `
    ${removableBlockId ? `<button class="danger reader-side-note-remove-block" type="button" data-side-note-action="remove-block" data-block-id="${escapeAttr(removableBlockId)}">Remove</button>` : ''}
    <span>Add here:</span>
    <button type="button" data-side-note-action="insert-text">Text</button>
    <button type="button" data-side-note-action="insert-ink">Draw</button>
    <button type="button" data-side-note-action="insert-image">Picture</button>
  `;
  return row;
}

function preserveSideNoteActionClick(event) {
  if (event.target?.closest?.('[data-side-note-action]')) event.preventDefault();
}

function inkWidthOptions(currentWidth) {
  const widths = [2, 3, 5, 8, 12, 16, 24];
  const current = Number(currentWidth) || 3;
  return widths
    .map((width) => `<option value="${width}" ${width === current ? 'selected' : ''}>${width}px</option>`)
    .join('');
}

function injectReaderStyles(doc) {
  if (doc.getElementById('html-annotation-reader-style')) return;
  const style = doc.createElement('style');
  style.id = 'html-annotation-reader-style';
  style.textContent = `
    html, body { overscroll-behavior: none; overflow-x: clip; }
    html.pdf-viewer-document.reader-embedded, html.pdf-viewer-document.reader-embedded body { overflow-x: clip !important; }
    .reader-highlight { border-radius: .12em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .reader-highlight-yellow { background: rgba(255, 224, 88, .56); }
    .reader-highlight-blue { background: rgba(255, 224, 88, .56); }
    .reader-highlight-green { background: rgba(255, 224, 88, .56); }
    .reader-highlight-pink { background: rgba(255, 224, 88, .56); }
    .reader-highlight.is-active { background: rgba(255, 197, 76, .50); outline: none; box-shadow: none; border: 0; }
    html.pdf-viewer-document .reader-highlight-yellow,
    html.pdf-viewer-document .reader-highlight-blue,
    html.pdf-viewer-document .reader-highlight-green,
    html.pdf-viewer-document .reader-highlight-pink { background: rgba(255, 224, 88, .34); }
    html.pdf-viewer-document .reader-highlight.is-active { background: rgba(255, 197, 76, .34); outline: none; box-shadow: none; border: 0; }
    .reader-pdf-highlight-rect, .reader-pdf-highlight-draft { position: absolute; z-index: 8; display: block; border: 1px solid rgba(168, 94, 0, .58); border-radius: 2px; pointer-events: auto; }
    .reader-pdf-highlight-rect { padding: 0; cursor: pointer; background: rgba(255, 224, 88, .26); box-shadow: none; }
    .reader-pdf-highlight-rect.is-active { border-color: transparent; background: rgba(255, 197, 76, .28); outline: none; box-shadow: none; }
    .reader-pdf-highlight-draft { z-index: 9; border-style: dashed; background: rgba(255, 224, 88, .32); box-shadow: inset 0 0 0 1px rgba(255, 253, 248, .34); pointer-events: none; }
    .annotator-pdf-highlight-mode .textLayer { pointer-events: none !important; user-select: none !important; }
    table.reader-highlight-yellow, table.reader-highlight-yellow th, table.reader-highlight-yellow td { background: rgba(255, 224, 88, .42); }
    table.reader-highlight.is-active, table.reader-highlight.is-active th, table.reader-highlight.is-active td { background: rgba(255, 197, 76, .40); outline: none; box-shadow: none; border: 0; }
    .formula.reader-highlight, .reader-math-display.reader-highlight { background: rgba(255, 224, 88, .42); border-radius: inherit; }
    .formula.reader-highlight.is-active, .reader-math-display.reader-highlight.is-active { background: rgba(255, 197, 76, .40); outline: none; box-shadow: none; border: 0; }
    .reader-math-inline.reader-highlight { background: transparent; box-shadow: inset 0 -1.12em 0 rgba(255, 224, 88, .56); border-radius: 0; }
    .reader-math-inline.reader-highlight.is-active { background: transparent; box-shadow: inset 0 -1.12em 0 rgba(255, 197, 76, .50); outline: none; border: 0; }
    .reader-focus-suppressed, .reader-focus-gap-hidden { display: none !important; }
    .reader-focus-hidden-text { display: none !important; }
    .reader-math-source { position: absolute !important; width: 1px !important; height: 1px !important; margin: -1px !important; padding: 0 !important; overflow: hidden !important; clip-path: inset(50%) !important; white-space: pre !important; }
    .reader-math-inline { display: inline; }
    .reader-math-rendered { display: inline; user-select: none; -webkit-user-select: none; }
    .reader-math-rendered * { user-select: none; -webkit-user-select: none; }
    .reader-math-display { display: block; overflow-x: auto; overflow-y: hidden; max-width: 100%; margin: .35rem 0; }
    .reader-math-display .katex-display { margin: .2rem 0; }
    [data-reader-math-rendered="true"].formula { white-space: normal; }
    .reader-focus-mode .reader-highlight.is-active { background: rgba(255, 197, 76, .52); outline: none; box-shadow: none; border: 0; }
    .reader-focus-mode .reader-side-note:not(.is-active) { display: none !important; }
    :root { --reader-side-note-layer-width: clamp(240px, 28vw, min(520px, 46vw)); --reader-side-note-gap: 0px; }
    body:not(.reader-reading-mode):not(.reader-notes-hidden) { padding-right: calc(var(--reader-side-note-layer-width) + var(--reader-side-note-gap)) !important; }
    html.pdf-viewer-document body:not(.reader-reading-mode):not(.reader-notes-hidden) { padding-right: 0 !important; }
    body.reader-notes-hidden .reader-side-note-layer { display: none !important; }
    body.reader-notes-overlay-open .reader-side-note-layer,
    body.reader-notes-overlay-open .reader-side-note-layer * { pointer-events: none !important; }
    body.reader-notes-overlay-open .reader-layout-resizer,
    body.reader-split-notes-source .reader-layout-resizer { display: none !important; }
    .reader-focus-before-marker { margin-bottom: 0 !important; }
    .reader-focus-after-marker { margin-top: 0 !important; }
    .reader-focus-contraction-marker { display: grid; place-items: center; width: 100%; height: 1.05rem; margin: .28rem 0; color: #9a6a15; opacity: .55; pointer-events: none; }
    .reader-focus-contraction-icon { display: flex; flex-direction: column; justify-content: center; gap: 3px; width: 100%; }
    .reader-focus-contraction-icon::before, .reader-focus-contraction-icon::after { content: ""; display: block; width: 100%; border-top: 1px solid currentColor; }
    .reader-focus-contraction-marker-inline { display: inline-grid; place-items: center; width: 1.6rem; height: .65em; margin: 0 .18rem; vertical-align: middle; color: #9a6a15; opacity: .55; pointer-events: none; }
    .reader-focus-contraction-marker-inline .reader-focus-contraction-icon { gap: 2px; }
    .reader-focus-footnote-excerpt { display: inline; margin-left: .35rem; padding: .12rem .24rem; border-radius: 3px; background: rgba(122, 61, 0, .08); color: #5b4d38; font-size: .92em; line-height: inherit; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
    .reader-focus-footnote-number { color: #7a3d00; font-weight: 700; }
    .reader-focus-footnote-highlight { background: rgba(255, 224, 88, .36); outline-color: rgba(122, 61, 0, .32); }
    .reader-tooltip { position: fixed; z-index: 160; max-width: min(220px, calc(100vw - 16px)); padding: .28rem .46rem; border: 1px solid #d8c7a8; border-radius: 5px; background: #2f2a24; color: #fffdf8; box-shadow: 0 8px 20px rgba(52, 38, 18, .18); font: 11px/1.3 ui-sans-serif, system-ui, sans-serif; overflow-wrap: anywhere; pointer-events: none; }
    .reader-tooltip-math-inline { display: inline; white-space: nowrap; }
    .reader-tooltip-math-display { display: block; max-width: 100%; margin: .25rem 0; overflow: visible; }
    .reader-tooltip .katex { color: inherit; font-size: 1em; }
    .reader-tooltip .katex-display { margin: .2rem 0; }
    .reader-jump-note-button { position: fixed; z-index: 40; border: 1px solid #b98b3d; border-radius: 999px; padding: .42rem .62rem; background: #fff5bd; color: #5d3700; font: 12px/1.2 ui-sans-serif, system-ui, sans-serif; box-shadow: 0 8px 22px rgba(52, 38, 18, .18); cursor: pointer; }
    .reader-jump-note-button[hidden] { display: none !important; }
    .reader-quick-clip-layer { position: absolute; z-index: 17; inset: 0 auto auto 0; width: 0; height: 0; pointer-events: none; }
    .reader-quick-clip-layer.is-pdf-page-layer { inset: 0; width: 100%; height: 100%; }
    .reader-quick-clip { position: absolute; display: grid; place-items: center; width: 40px; height: 40px; border: 0; border-radius: 0; background: transparent; box-shadow: none; transform: translate(-50%, -50%); pointer-events: auto; cursor: grab; }
    .reader-quick-clip:active { cursor: grabbing; }
    .reader-quick-clip.is-dragging { opacity: 0; pointer-events: none; }
    .reader-quick-clip::before { content: ""; display: block; width: 40px; height: 40px; background: var(--clip-image, url("${cssString(QUICK_MARK_ASSET_URLS[0])}")) center / contain no-repeat; filter: drop-shadow(0 2px 3px rgba(15, 23, 42, .26)); }
    .clip-color-0 { --clip-color: #f2d48d; --clip-image: url("${cssString(QUICK_MARK_ASSET_URLS[0])}"); }
    .clip-color-1 { --clip-color: #b7d8ff; --clip-image: url("${cssString(QUICK_MARK_ASSET_URLS[1])}"); }
    .clip-color-2 { --clip-color: #b9e4c4; --clip-image: url("${cssString(QUICK_MARK_ASSET_URLS[2])}"); }
    .clip-color-3 { --clip-color: #ffc2c7; --clip-image: url("${cssString(QUICK_MARK_ASSET_URLS[3])}"); }
    .clip-color-4 { --clip-color: #d8c6ff; --clip-image: url("${cssString(QUICK_MARK_ASSET_URLS[4])}"); }
    .reader-side-note-layer { position: absolute; top: 0; bottom: 0; z-index: 18; width: var(--reader-side-note-layer-width); min-height: 100%; border-left: 1px solid rgba(216, 199, 168, .66); background: rgba(248, 246, 240, .96); pointer-events: auto; }
    .reader-side-note-layer:empty { pointer-events: none; }
    .reader-side-note { position: absolute; width: 100%; pointer-events: auto; }
    .reader-side-note.is-pinned { position: fixed !important; top: 14px !important; right: 14px !important; bottom: 14px !important; left: var(--reader-text-note-edge) !important; z-index: 92 !important; width: auto; min-width: 220px; overflow: auto; overscroll-behavior: none; }
    .reader-side-note-card { position: relative; border-left: 2px solid #d8c7a8; padding: 0 0 0 .58rem; color: #151515; background: transparent; font-family: Georgia, 'Times New Roman', serif; font-size: 1.03rem; line-height: 1.45; cursor: text; overflow: visible; }
    .reader-side-note.is-overlapping .reader-side-note-card, .reader-side-note.is-active .reader-side-note-card, .reader-side-note.is-editing .reader-side-note-card { padding: .36rem .44rem .42rem .58rem; background: rgba(255, 253, 248, .84); box-shadow: 0 8px 22px rgba(52, 38, 18, .12); backdrop-filter: blur(1.5px); }
    .reader-side-note.is-pinned .reader-side-note-card { min-height: 100%; padding: .78rem .8rem 1rem; background: rgba(255, 253, 248, .96); box-shadow: 0 14px 34px rgba(52, 38, 18, .18); cursor: default; }
    .reader-side-note.is-active .reader-side-note-card { border-left-color: #7a3d00; }
    .reader-side-note.is-unresolved .reader-side-note-card { border-left-color: #9b2f23; }
    .reader-side-note-collapse { min-width: 1.3rem; }
    .reader-side-note-title { display: block; min-height: 1.2em; margin: 0 0 .18rem; font-weight: 700; line-height: 1.25; white-space: pre-wrap; overflow-wrap: break-word; }
    .reader-side-note-warning { display: block; margin: 0 0 .3rem; color: #9b2f23; font: 11px/1.3 ui-sans-serif, system-ui, sans-serif; }
    .reader-side-note-title:empty::before, .reader-side-note-body:empty::before { content: attr(data-placeholder); color: rgba(21, 21, 21, .34); pointer-events: none; }
    .reader-side-note-body { display: block; min-height: 1.45em; margin-top: .18rem; white-space: pre-wrap; overflow-wrap: break-word; }
    .reader-side-note-body.is-rendered { min-height: 0; white-space: normal; cursor: text; user-select: text; }
    .reader-side-note-body.is-rendered > :first-child { margin-top: 0; }
    .reader-side-note-body.is-rendered > :last-child { margin-bottom: 0; }
    .reader-side-note.is-collapsed .reader-side-note-body, .reader-side-note.is-collapsed .reader-side-note-blank, .reader-side-note.is-collapsed .reader-side-note-ink-wrap, .reader-side-note.is-collapsed .reader-side-note-text-block, .reader-side-note.is-collapsed .reader-side-note-image-block, .reader-side-note.is-collapsed .reader-side-note-insertion-row { display: none !important; }
    .reader-side-note-blank { display: block; width: 100%; aspect-ratio: 16 / 9; margin-top: .35rem; border: 1px solid transparent; border-radius: 4px; cursor: text; }
    .reader-side-note.is-active .reader-side-note-blank:hover, .reader-side-note-blank:focus-visible { border-color: rgba(216, 199, 168, .72); background: rgba(122, 61, 0, .04); outline: none; }
    .reader-side-note-title[contenteditable], .reader-side-note-body[contenteditable] { outline: 0; }
    .reader-side-note.is-constrained .reader-side-note-body { overflow: hidden; }
    .reader-side-note-text-block { position: relative; }
    .reader-side-note-text-actions { display: flex; align-items: center; justify-content: flex-end; gap: .4rem; margin: .18rem 0 .3rem; }
    .reader-side-note-render-feedback { color: #7b6a55; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; }
    .reader-side-note-text-mode { display: block; margin: 0; border: 1px solid #d8c7a8; border-radius: 4px; padding: .16rem .38rem; background: #fffdf8; color: #7a3d00; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; cursor: pointer; }
    .reader-side-note-text-mode[hidden] { display: none; }
    .reader-side-note-insertion-row { display: flex; align-items: center; justify-content: flex-end; flex-wrap: nowrap; gap: .28rem; margin: .38rem 0; color: #7b6a55; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; }
    .reader-side-note-insertion-row button { border: 1px solid #d8c7a8; border-radius: 4px; padding: .18rem .38rem; background: #fffdf8; color: #7a3d00; font: inherit; cursor: pointer; }
    .reader-side-note-insertion-row .reader-side-note-remove-block { margin-right: auto; color: #8f1f12; border-color: #e1b6ad; }
    .reader-side-note-image-block { width: 100%; margin: .38rem 0; }
    .reader-side-note-image-frame { display: grid; place-items: center; width: 100%; margin-inline: auto; overflow: hidden; border: 1px solid #e2d5bd; border-radius: 4px; background: rgba(255,253,248,.72); }
    .reader-side-note-image { display: block; width: 100%; max-width: 100%; height: auto; object-fit: contain; }
    .reader-side-note-image-placeholder { box-sizing: border-box; max-width: 100%; padding: .65rem; color: #7b6a55; font: 12px/1.35 ui-sans-serif, system-ui, sans-serif; text-align: center; overflow-wrap: anywhere; }
    .reader-side-note-image-tools { margin-top: .24rem; color: #7b6a55; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; }
    .reader-side-note-image-tools label { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: .35rem; }
    .reader-side-note-image-tools input { min-width: 0; border: 1px solid #d8c7a8; border-radius: 4px; padding: .18rem .3rem; background: #fffdf8; color: #151515; }
    .note-markdown-math-display { display: block; max-width: 100%; overflow-x: auto; overflow-y: hidden; }
    .note-markdown-math-error { display: inline-block; max-width: 100%; color: #9b2f23; overflow-wrap: anywhere; }
    .note-markdown pre { max-width: 100%; overflow: auto; padding: .45rem; border-radius: 4px; background: rgba(52,38,18,.06); }
    .note-markdown code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .88em; overflow-wrap: anywhere; }
    .note-markdown a { color: #7a3d00; text-decoration-thickness: .08em; text-underline-offset: .14em; }
    .reader-side-note-tools { position: sticky; z-index: 4; top: .2rem; left: 0; display: flex; flex-wrap: wrap; width: fit-content; max-width: 100%; gap: 3px; margin: 0 0 .35rem 0; padding: .16rem; border: 1px solid rgba(216, 199, 168, .88); border-radius: 5px; background: rgba(255, 253, 248, .94); box-shadow: 0 6px 16px rgba(52, 38, 18, .12); opacity: 1; transition: opacity 120ms ease; }
    .reader-side-note:not(.is-active):not(.is-editing) .reader-side-note-tools { opacity: .78; }
    .reader-side-note-card:hover .reader-side-note-tools, .reader-side-note.is-active .reader-side-note-tools, .reader-side-note.is-editing .reader-side-note-tools { opacity: 1; }
    .reader-side-note-tool { border: 1px solid #d8c7a8; border-radius: 3px; padding: 0 .22rem; background: #fffdf8; color: #7a3d00; font: 12px/1.35 ui-sans-serif, system-ui, sans-serif; cursor: pointer; }
    .reader-side-note-tool.is-active { border-color: #7a3d00; background: #f2d48d; color: #2e1a00; }
    .reader-side-note-delete { color: #8f1f12; }
    .reader-delete-confirm-popover { position: fixed; z-index: 120; box-sizing: border-box; width: min(214px, calc(100vw - 16px)); padding: .64rem; border: 1px solid #d8c7a8; border-radius: 8px; background: #fffdf8; box-shadow: 0 10px 26px rgba(52, 38, 18, .18); color: #2f2a24; font: 12px/1.35 ui-sans-serif, system-ui, sans-serif; overflow-wrap: anywhere; }
    .reader-delete-confirm-popover p { margin: 0 0 .55rem; overflow-wrap: anywhere; }
    .reader-delete-confirm-actions { display: flex; justify-content: flex-end; gap: .35rem; }
    .reader-delete-confirm-actions button { border: 1px solid #d8c7a8; border-radius: 4px; padding: .18rem .44rem; background: #fffdf8; color: #2f2a24; font: inherit; cursor: pointer; }
    .reader-delete-confirm-actions .danger { border-color: #e1b6ad; color: #8f1f12; }
    .reader-side-note-ink-wrap { position: relative; width: 100%; aspect-ratio: 16 / 9; min-height: 96px; max-height: 1800px; margin-top: .35rem; }
    .reader-side-note-ink-wrap::before { content: ""; position: absolute; z-index: 1; left: 0; right: 0; bottom: 100%; height: .55rem; }
    .reader-side-note-ink { position: absolute; inset: 0; display: block; box-sizing: border-box; width: 100%; height: 100%; border: 1px solid #e2d5bd; background: rgba(255,253,248,.72); touch-action: none; cursor: auto; }
    .reader-side-note-ink-resize-handle { position: absolute; z-index: 3; left: 50%; bottom: 0; width: 48px; height: 13px; padding: 0; border: 0; border-radius: 7px 7px 0 0; background: rgba(255,253,248,.9); cursor: ns-resize; transform: translateX(-50%); }
    .reader-side-note-ink-resize-handle::before { content: ""; position: absolute; left: 11px; right: 11px; top: 6px; border-top: 2px solid rgba(122, 61, 0, .52); }
    .reader-side-note-ink-wrap.is-resizing .reader-side-note-ink-resize-handle, .reader-side-note-ink-resize-handle:hover { background: rgba(242, 212, 141, .96); }
    .reader-side-note.is-active[data-ink-tool="pen"] .reader-side-note-ink { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M4 20l4.8-1.2L20 7.6 16.4 4 5.2 15.2z' fill='%232f2a24'/%3E%3Cpath d='M14.8 5.6l3.6 3.6' stroke='%23fffdf8' stroke-width='1.5'/%3E%3C/svg%3E") 3 21, crosshair; }
    .reader-side-note.is-active[data-ink-tool="eraser"] .reader-side-note-ink { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M5.2 6.2l1.1-1.1a2 2 0 012.8 0l9.7 9.7-4.3 4.3-9.7-9.7a2 2 0 010-2.8z' fill='%23fffdf8' stroke='%232f2a24' stroke-width='1.6'/%3E%3Cpath d='M10.7 6.7l-4 4' stroke='%232f2a24' stroke-width='1.4'/%3E%3C/svg%3E") 5 6, cell; }
    .reader-side-note-ink-toolbar { position: absolute; z-index: 2; left: .35rem; right: .35rem; bottom: calc(100% + .35rem); display: flex; align-items: center; justify-content: flex-start; flex-wrap: wrap; max-width: calc(100% - .7rem); gap: .3rem; padding: .22rem .28rem; border: 1px solid rgba(216, 199, 168, .88); border-radius: 5px; background: rgba(255,253,248,.94); box-shadow: 0 6px 16px rgba(52, 38, 18, .12); color: #7a3d00; font: 11px/1.2 ui-sans-serif, system-ui, sans-serif; opacity: 0; visibility: hidden; pointer-events: auto; transform: translateY(3px); transition: opacity 120ms ease 220ms, transform 120ms ease 220ms, visibility 0s linear 340ms; }
    .reader-side-note-ink-wrap:hover .reader-side-note-ink-toolbar, .reader-side-note-ink-wrap:focus-within .reader-side-note-ink-toolbar, .reader-side-note-ink-wrap.is-inking .reader-side-note-ink-toolbar { opacity: 1; visibility: visible; pointer-events: auto; transform: translateY(0); transition-delay: 0s; }
    .reader-side-note-ink-toolbar button { border: 1px solid #d8c7a8; border-radius: 3px; padding: .14rem .28rem; background: #fffdf8; color: #7a3d00; font: inherit; cursor: pointer; }
    .reader-side-note-ink-toolbar button.is-active { border-color: #7a3d00; background: #f2d48d; color: #2e1a00; }
    .reader-side-note-ink-toolbar label { display: inline-flex; align-items: center; gap: .2rem; }
    .reader-side-note-ink-toolbar input[type="color"] { width: 1.55rem; height: 1.35rem; padding: 0; border: 0; background: transparent; }
    .reader-side-note-ink-toolbar select { border: 1px solid #d8c7a8; border-radius: 3px; padding: .12rem .2rem; background: #fffdf8; color: #7a3d00; font: inherit; }
    .reader-layout-resizer { position: fixed; z-index: 79; top: 0; bottom: 0; width: 10px; margin-left: -5px; cursor: col-resize; user-select: none; touch-action: none; }
    .reader-layout-resizer::after { content: ""; position: absolute; top: 0; bottom: 0; left: 5px; border-left: 1px solid rgba(122, 61, 0, .42); }
    .reader-layout-resizer:hover::after, .reader-layout-resizer:focus-visible::after, .reader-layout-resizer.is-dragging::after { left: 4px; border-left-width: 3px; border-left-color: rgba(122, 61, 0, .76); }
    .reader-highlight-navigator { position: fixed; z-index: 81; top: 0; bottom: 0; width: 22px; margin-left: -11px; pointer-events: none; }
    .reader-highlight-navigator-marker { --reader-highlight-marker-y: 0px; position: absolute; top: 0; left: 50%; box-sizing: border-box; width: 20px; height: 11px; margin: 0; padding: 0; border: 0; border-radius: 3px; background: transparent; opacity: .64; transform: translate3d(-50%, calc(var(--reader-highlight-marker-y) - 50%), 0); will-change: transform; pointer-events: auto; cursor: pointer; transition: transform 52ms linear, opacity 90ms ease; }
    .reader-highlight-navigator-marker::before { content: ""; position: absolute; top: 50%; left: 50%; box-sizing: border-box; width: 16px; height: 7px; border: 1px solid rgba(122, 61, 0, .58); border-radius: 2px; background: rgba(242, 212, 141, .78); box-shadow: 0 1px 2px rgba(52, 38, 18, .14); transform: translate(-50%, -50%); transition: background-color 90ms ease, box-shadow 90ms ease, transform 90ms ease; }
    .reader-highlight-navigator-marker:hover, .reader-highlight-navigator-marker:focus-visible { opacity: 1; outline: none; }
    .reader-highlight-navigator-marker:hover::before, .reader-highlight-navigator-marker:focus-visible::before { border-color: #7a3d00; background: #ffd75e; box-shadow: 0 0 0 2px rgba(255, 215, 94, .36), 0 2px 7px rgba(122, 61, 0, .32); transform: translate(-50%, -50%) scale(1.18); }
  `;
  doc.head.append(style);
}

function cssString(value) {
  return String(value).replace(/["\\\n\r\f]/g, '\\$&');
}

async function renderLatexMath(doc) {
  if (!documentHasLatexMath(doc)) return;
  const katex = await ensureKatex(doc);
  if (!katex) return;
  renderMathSourceElements(doc, katex);
  renderDelimitedTextMath(doc, katex);
}

function documentHasLatexMath(doc) {
  if (doc.querySelector('[data-math-source="tex"], .formula')) return true;
  return /\\\(|\\\[|\$\$|\$[^$\s]/.test(doc.body?.textContent || '');
}

async function ensureKatex(doc) {
  if (!doc.getElementById('reader-katex-css')) {
    const link = doc.createElement('link');
    link.id = 'reader-katex-css';
    link.rel = 'stylesheet';
    link.href = new URL('vendor/katex/katex.min.css', location.href).href;
    doc.head.append(link);
  }
  if (window.katex) return window.katex;
  let script = document.getElementById('reader-katex-script');
  if (!script) {
    script = document.createElement('script');
    script.id = 'reader-katex-script';
    script.src = new URL('vendor/katex/katex.min.js', location.href).href;
    script.defer = true;
    document.head.append(script);
  }
  if (!window.katex) {
    await new Promise((resolve, reject) => {
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error('Could not load local KaTeX renderer.')), { once: true });
    });
  }
  return window.katex || null;
}

function renderMathSourceElements(doc, katex) {
  doc.querySelectorAll('[data-math-source="tex"], .formula').forEach((element) => {
    if (element.dataset.readerMathRendered === 'true') return;
    if (element.closest('.reader-side-note-layer, .reader-math-inline, .reader-math-display')) return;
    const raw = element.textContent || '';
    const defaultDisplayMode = element.classList.contains('formula') || element.dataset.mathSource === 'tex';
    const segments = mathSegments(raw);
    const mathParts = segments.filter((segment) => segment.type === 'math');
    const parsed = mathParts.length ? null : parseMathText(raw, defaultDisplayMode);
    const hasRenderableMath = mathParts.length || parsed?.tex.trim();
    if (!hasRenderableMath) return;
    element.dataset.readerMathRendered = 'true';
    element.textContent = '';
    element.append(createMathSourceNode(doc, raw));
    if (mathParts.length) {
      for (const part of mathParts) {
        const rendered = createMathRenderedNode(doc, part.displayMode || defaultDisplayMode);
        element.append(rendered);
        renderKatex(katex, part.tex, rendered, part.displayMode || defaultDisplayMode);
      }
    } else {
      const rendered = createMathRenderedNode(doc, parsed.displayMode);
      element.append(rendered);
      renderKatex(katex, parsed.tex, rendered, parsed.displayMode);
    }
  });
}

function renderDelimitedTextMath(doc, katex) {
  const textNodes = [];
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.reader-side-note-layer, .reader-math-source, .reader-math-rendered, .katex, [data-math-source="tex"], .formula, script, style, textarea, pre, code')) {
        return NodeFilter.FILTER_REJECT;
      }
      return mathSegments(node.nodeValue).some((segment) => segment.type === 'math')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    }
  });
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  for (const textNode of textNodes) replaceTextNodeMath(textNode, katex);
}

function replaceTextNodeMath(textNode, katex) {
  const segments = mathSegments(textNode.nodeValue);
  if (!segments.some((segment) => segment.type === 'math')) return;
  const doc = textNode.ownerDocument;
  const fragment = doc.createDocumentFragment();
  for (const segment of segments) {
    if (segment.type === 'text') {
      fragment.append(doc.createTextNode(segment.value));
      continue;
    }
    const wrapper = doc.createElement('span');
    wrapper.className = segment.displayMode ? 'reader-math-display' : 'reader-math-inline';
    wrapper.dataset.readerMathRendered = 'true';
    wrapper.append(createMathSourceNode(doc, segment.raw));
    const rendered = createMathRenderedNode(doc, segment.displayMode);
    wrapper.append(rendered);
    renderKatex(katex, segment.tex, rendered, segment.displayMode);
    fragment.append(wrapper);
  }
  textNode.parentNode.replaceChild(fragment, textNode);
}

function createMathSourceNode(doc, source) {
  const span = doc.createElement('span');
  span.className = 'reader-math-source';
  span.dataset.mathSource = 'tex';
  span.textContent = source;
  return span;
}

function createMathRenderedNode(doc, displayMode) {
  const node = doc.createElement(displayMode ? 'div' : 'span');
  node.className = 'reader-math-rendered';
  node.setAttribute('aria-hidden', 'true');
  return node;
}

function renderKatex(katex, tex, target, displayMode) {
  try {
    katex.render(tex, target, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      output: 'htmlAndMathml'
    });
  } catch {
    target.textContent = tex;
  }
}

function parseMathText(raw, defaultDisplayMode = false) {
  const text = raw.trim();
  const delimiter = mathDelimiterForWholeText(text);
  if (!delimiter) return { tex: text, displayMode: defaultDisplayMode };
  return {
    tex: text.slice(delimiter.open.length, text.length - delimiter.close.length).trim(),
    displayMode: delimiter.displayMode
  };
}

function mathDelimiterForWholeText(text) {
  return MATH_DELIMITERS.find((delimiter) => text.startsWith(delimiter.open) && text.endsWith(delimiter.close));
}

function mathSegments(text) {
  const segments = [];
  let index = 0;
  while (index < text.length) {
    const match = nextMathMatch(text, index);
    if (!match) {
      segments.push({ type: 'text', value: text.slice(index) });
      break;
    }
    if (match.start > index) segments.push({ type: 'text', value: text.slice(index, match.start) });
    segments.push({
      type: 'math',
      raw: text.slice(match.start, match.end),
      tex: text.slice(match.start + match.delimiter.open.length, match.end - match.delimiter.close.length),
      displayMode: match.delimiter.displayMode
    });
    index = match.end;
  }
  return segments.filter((segment) => segment.value !== '' || segment.raw !== '');
}

function nextMathMatch(text, startIndex) {
  let best = null;
  for (let index = startIndex; index < text.length; index += 1) {
    for (const delimiter of MATH_DELIMITERS) {
      if (!text.startsWith(delimiter.open, index)) continue;
      if (delimiter.open === '$' && !isLikelyInlineDollarOpen(text, index)) continue;
      const closeStart = findMathClose(text, delimiter, index + delimiter.open.length);
      if (closeStart === -1) continue;
      const end = closeStart + delimiter.close.length;
      if (!best || index < best.start || (index === best.start && delimiter.open.length > best.delimiter.open.length)) {
        best = { start: index, end, delimiter };
      }
    }
    if (best && best.start === index) return best;
  }
  return best;
}

function findMathClose(text, delimiter, fromIndex) {
  let index = fromIndex;
  while (index < text.length) {
    index = text.indexOf(delimiter.close, index);
    if (index === -1) return -1;
    if (!isEscaped(text, index) && (delimiter.close !== '$' || isLikelyInlineDollarClose(text, index))) return index;
    index += delimiter.close.length;
  }
  return -1;
}

function isLikelyInlineDollarOpen(text, index) {
  const next = text[index + 1];
  return Boolean(next && !/\s|\d/.test(next));
}

function isLikelyInlineDollarClose(text, index) {
  const previous = text[index - 1];
  const next = text[index + 1];
  return Boolean(previous && !/\s/.test(previous) && (!next || /[\s.,;:!?)]/.test(next)));
}

function isEscaped(text, index) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) slashCount += 1;
  return slashCount % 2 === 1;
}

function clearRenderedAnnotations(doc) {
  clearFocusModeDisplay(doc);
  doc.querySelectorAll('.reader-side-note-layer').forEach((layer) => layer.remove());
  doc.querySelectorAll('.reader-jump-note-button').forEach((button) => button.remove());
  doc.querySelectorAll('.reader-pdf-highlight-rect, .reader-pdf-highlight-draft').forEach((highlight) => highlight.remove());
  doc.querySelectorAll('.reader-focus-contraction-marker, .reader-focus-contraction-marker-inline').forEach((marker) => marker.remove());
  doc.querySelectorAll('[data-reader-has-notes]').forEach((block) => {
    delete block.dataset.readerHasNotes;
  });
  clearAtomicHighlightSurfaces(doc);
  const highlights = Array.from(doc.querySelectorAll('.reader-highlight[data-annotation-id]'));
  for (const highlight of highlights) {
    const parent = highlight.parentNode;
    while (highlight.firstChild) parent.insertBefore(highlight.firstChild, highlight);
    highlight.remove();
    parent.normalize();
  }
}

function clearRenderedAnnotation(doc, annotationId) {
  const escaped = cssEscape(annotationId);
  doc.querySelectorAll(`.reader-pdf-highlight-rect[data-annotation-id="${escaped}"], .reader-pdf-highlight-draft[data-annotation-id="${escaped}"]`)
    .forEach((highlight) => highlight.remove());
  doc.querySelectorAll(`.reader-highlight[data-annotation-id="${escaped}"]`).forEach((highlight) => {
    if (highlight.matches('span.reader-highlight')) {
      const parent = highlight.parentNode;
      while (highlight.firstChild) parent.insertBefore(highlight.firstChild, highlight);
      highlight.remove();
      parent.normalize();
      return;
    }
    clearAtomicHighlightSurface(highlight);
  });
}

function clearAtomicHighlightSurfaces(doc) {
  const atomicHighlights = doc.querySelectorAll('table.reader-highlight, .reader-math-inline.reader-highlight, .reader-math-display.reader-highlight, .formula.reader-highlight, [data-reader-math-rendered="true"].reader-highlight, [data-math-source="tex"].reader-highlight');
  for (const element of atomicHighlights) {
    clearAtomicHighlightSurface(element);
  }
}

function clearAtomicHighlightSurface(element) {
  element.classList.remove(
    'reader-highlight',
    'reader-highlight-yellow',
    'reader-highlight-blue',
    'reader-highlight-green',
    'reader-highlight-pink',
    'reader-highlight-attached',
    'reader-highlight-primary',
    'is-active'
  );
  delete element.dataset.annotationId;
  delete element.dataset.targetIndex;
}

function applyFocusModeDisplay(doc) {
  clearFocusModeDisplay(doc);
  const annotation = state.annotations.find((item) => item.id === state.focusModeAnnotationId);
  if (!annotation) return;
  doc.body.classList.add('reader-focus-mode');
  const targets = annotationHighlightTargets(annotation);
  if (targets.length < 2) return;

  renderFocusFootnoteHighlights(doc, annotation);
  const highlights = targets
    .map(({ index }) => focusHighlightForTarget(doc, annotation.id, index))
    .filter(Boolean)
    .sort((a, b) => documentOrder(a, b));
  if (highlights.length < 2) return;

  for (let index = 0; index < highlights.length - 1; index += 1) {
    const hidden = hideGapBetweenHighlights(highlights[index], highlights[index + 1]);
    if (hidden && !isInlineFootnoteContinuation(highlights[index], highlights[index + 1])) {
      insertFocusContractionIndicator(highlights[index], highlights[index + 1]);
    }
  }
  restoreFocusViewportAnchors(doc, annotation);
}

function clearFocusModeDisplay(doc) {
  doc.body.classList.remove('reader-focus-mode');
  doc.querySelectorAll('.reader-focus-suppressed, .reader-focus-gap-hidden, .reader-focus-before-marker, .reader-focus-after-marker').forEach((element) => {
    element.classList.remove('reader-focus-suppressed', 'reader-focus-gap-hidden', 'reader-focus-before-marker', 'reader-focus-after-marker');
  });
  doc.querySelectorAll('.reader-focus-hidden-text').forEach((span) => {
    const parent = span.parentNode;
    while (span.firstChild) parent.insertBefore(span.firstChild, span);
    span.remove();
    parent.normalize();
  });
  doc.querySelectorAll('.reader-focus-contraction-marker, .reader-focus-contraction-marker-inline').forEach((marker) => marker.remove());
  doc.querySelectorAll('.reader-focus-footnote-excerpt').forEach((excerpt) => excerpt.remove());
}

function restoreFocusViewportAnchors(doc, annotation) {
  if (!Number.isFinite(state.focusModeAnchorViewportTop)) return;
  const anchor = annotationAnchorElement(doc, annotation);
  if (!anchor) return;
  const currentTop = anchor.getBoundingClientRect().top;
  const scrollDelta = currentTop - state.focusModeAnchorViewportTop;
  if (Math.abs(scrollDelta) > 1) {
    doc.defaultView.scrollBy(0, scrollDelta);
  }
  if (Number.isFinite(state.focusModeNoteViewportTop)) {
    state.focusModeNoteTop = doc.defaultView.scrollY + state.focusModeNoteViewportTop;
  }
}

function documentOrder(a, b) {
  if (a === b) return 0;
  return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}

function renderFocusFootnoteHighlights(doc, annotation) {
  const selector = `.floating-note .reader-highlight[data-annotation-id="${cssEscape(annotation.id)}"]`;
  const footnoteHighlights = Array.from(doc.querySelectorAll(selector));
  for (const highlight of footnoteHighlights) {
    const popover = highlight.closest('.footnote-popover');
    const floatingNote = highlight.closest('.floating-note');
    if (!popover || !floatingNote) continue;
    const targetIndex = highlight.dataset.targetIndex;
    if (popover.querySelector(`.reader-focus-footnote-excerpt[data-target-index="${cssEscape(targetIndex)}"]`)) continue;
    const excerpt = doc.createElement('span');
    excerpt.className = 'reader-focus-footnote-excerpt';
    excerpt.dataset.annotationId = annotation.id;
    excerpt.dataset.targetIndex = targetIndex;

    const number = floatingNote.querySelector('.floating-note-number')?.textContent?.trim()
      || popover.querySelector('.note-ref')?.textContent?.trim()
      || '';
    if (number) {
      const numberSpan = doc.createElement('span');
      numberSpan.className = 'reader-focus-footnote-number';
      numberSpan.textContent = `${number}. `;
      excerpt.append(numberSpan);
    }

    const clone = highlight.cloneNode(true);
    clone.classList.add('reader-focus-footnote-highlight');
    excerpt.append(clone);
    popover.after(excerpt);
  }
}

function focusHighlightForTarget(doc, annotationId, targetIndex) {
  const escapedAnnotation = cssEscape(annotationId);
  const escapedIndex = cssEscape(targetIndex);
  return doc.querySelector(`.reader-focus-footnote-highlight[data-annotation-id="${escapedAnnotation}"][data-target-index="${escapedIndex}"]`)
    || doc.querySelector(`.reader-highlight[data-annotation-id="${escapedAnnotation}"][data-target-index="${escapedIndex}"]`);
}

function hideGapBetweenHighlights(startHighlight, endHighlight) {
  const doc = startHighlight.ownerDocument;
  const startBlock = focusBlockElement(startHighlight);
  const endBlock = focusBlockElement(endHighlight);
  if (!startBlock || !endBlock) return false;

  if (startBlock === endBlock && isAtomicHighlightRoot(startBlock)) return false;

  if (startBlock === endBlock) {
    return hideTextRange(doc, startHighlight, endHighlight);
  }

  const hiddenStart = hideTextRange(doc, startHighlight, null, startBlock);
  const hiddenMiddle = hideIntermediateBlocks(doc, startBlock, endBlock);
  const hiddenEnd = hideTextRange(doc, null, endHighlight, endBlock);
  return hiddenStart || hiddenMiddle || hiddenEnd;
}

function isInlineFootnoteContinuation(startHighlight, endHighlight) {
  if (!endHighlight.closest('.reader-focus-footnote-excerpt')) return false;
  return focusBlockElement(startHighlight) === focusBlockElement(endHighlight);
}

function insertFocusContractionIndicator(startHighlight, endHighlight) {
  const doc = startHighlight.ownerDocument;
  const startBlock = focusBlockElement(startHighlight);
  const endBlock = focusBlockElement(endHighlight);
  if (!startBlock || !endBlock) return;

  const marker = doc.createElement(startBlock === endBlock ? 'span' : 'div');
  marker.className = startBlock === endBlock
    ? 'reader-focus-contraction-marker-inline'
    : 'reader-focus-contraction-marker';
  marker.setAttribute('aria-hidden', 'true');
  const icon = doc.createElement('span');
  icon.className = 'reader-focus-contraction-icon';
  marker.append(icon);

  if (startBlock === endBlock) {
    startHighlight.after(marker);
    return;
  }
  startBlock.classList.add('reader-focus-before-marker');
  endBlock.classList.add('reader-focus-after-marker');
  startBlock.after(marker);
}

function hideIntermediateBlocks(doc, startBlock, endBlock) {
  const blocks = focusCandidateBlocks(doc);
  const startIndex = blocks.indexOf(startBlock);
  const endIndex = blocks.indexOf(endBlock);
  if (startIndex < 0 || endIndex < 0) return false;
  const first = Math.min(startIndex, endIndex) + 1;
  const last = Math.max(startIndex, endIndex);
  let hidden = false;
  for (let index = first; index < last; index += 1) {
    const block = blocks[index];
    if (!block.matches(HEADING_SELECTOR)) {
      block.classList.add('reader-focus-suppressed');
      hidden = true;
    }
  }
  return hidden;
}

function focusCandidateBlocks(doc) {
  return Array.from(doc.querySelectorAll(ANCHOR_SELECTOR))
    .filter((block) => !['SECTION', 'ARTICLE'].includes(block.tagName))
    .filter((block) => !closestAtomicHighlightRoot(block.parentElement));
}

function hideTextRange(doc, startAfter, endBefore, root = null) {
  const range = doc.createRange();
  const scope = root || lowestCommonElement(startAfter, endBefore);
  if (!scope) return false;
  if (startAfter) {
    range.setStartAfter(startAfter);
  } else {
    range.setStart(scope, 0);
  }
  if (endBefore) {
    range.setEndBefore(endBefore);
  } else {
    range.setEnd(scope, scope.childNodes.length);
  }
  return hideTextNodesInRange(scope, range);
}

function lowestCommonElement(a, b) {
  const node = a && b ? a.ownerDocument.createRange() : null;
  if (!node) return a?.parentElement || b?.parentElement || null;
  node.setStartBefore(a);
  node.setEndAfter(b);
  const container = node.commonAncestorContainer;
  return container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
}

function hideTextNodesInRange(scope, range) {
  const doc = scope.ownerDocument;
  const textNodes = [];
  const walker = doc.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
      const element = node.parentElement;
      if (!element || element.closest('.reader-side-note-layer')) return NodeFilter.FILTER_REJECT;
      if (element.closest('.reader-highlight, .reader-math-rendered, .katex')) return NodeFilter.FILTER_REJECT;
      if (element.closest(HEADING_SELECTOR)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);
  let hidden = false;
  for (const textNode of textNodes) {
    hidden = hideTextNodeRange(textNode, range) || hidden;
  }
  return hidden;
}

function hideTextNodeRange(textNode, range) {
  if (!textNode.nodeValue || !range.intersectsNode(textNode)) return false;
  let nodeToHide = textNode;
  let start = 0;
  let end = textNode.nodeValue.length;
  if (textNode === range.startContainer) start = range.startOffset;
  if (textNode === range.endContainer) end = range.endOffset;
  if (start >= end) return false;
  if (end < nodeToHide.nodeValue.length) nodeToHide.splitText(end);
  if (start > 0) nodeToHide = nodeToHide.splitText(start);
  if (!nodeToHide.nodeValue.trim()) return false;
  return hideTextNodeByVisualLine(nodeToHide);
}

function hideTextNodeByVisualLine(textNode) {
  const doc = textNode.ownerDocument;
  const parts = textNode.nodeValue.match(/\s+|\S+/g);
  if (!parts?.length) return false;
  const fragment = doc.createDocumentFragment();
  const spans = parts.map((part) => {
    const span = doc.createElement('span');
    span.className = 'reader-focus-token';
    span.textContent = part;
    fragment.append(span);
    return span;
  });
  textNode.parentNode.insertBefore(fragment, textNode);
  textNode.remove();

  const highlightLines = activeHighlightLineRects(doc);
  let hidden = false;
  for (const span of spans) {
    if (span.textContent.trim() && !elementOverlapsAnyLine(span, highlightLines)) {
      span.className = 'reader-focus-hidden-text';
      hidden = true;
    } else {
      unwrapElement(span);
    }
  }
  return hidden;
}

function activeHighlightLineRects(doc) {
  return Array.from(doc.querySelectorAll('.reader-highlight.is-active'))
    .flatMap((highlight) => Array.from(highlight.getClientRects()))
    .map((rect) => ({ top: rect.top, bottom: rect.bottom }));
}

function elementOverlapsAnyLine(element, lines) {
  const rects = Array.from(element.getClientRects());
  return rects.some((rect) => lines.some((line) => rect.bottom > line.top + 1 && rect.top < line.bottom - 1));
}

function unwrapElement(element) {
  const parent = element.parentNode;
  while (element.firstChild) parent.insertBefore(element.firstChild, element);
  element.remove();
  parent.normalize();
}

function getSideNoteLayer(doc) {
  let layer = doc.querySelector('.reader-side-note-layer');
  if (!layer) {
    layer = doc.createElement('div');
    layer.className = 'reader-side-note-layer';
    doc.body.append(layer);
  }
  positionSideNoteLayer(doc, layer);
  return layer;
}

function positionSideNoteLayer(doc, layer = doc.querySelector('.reader-side-note-layer')) {
  if (!layer) return;
  updateResponsiveReaderLayout(doc);
  const scrollX = doc.defaultView.scrollX;
  const layerWidth = layer.getBoundingClientRect().width || 278;
  const left = scrollX + Math.max(0, doc.defaultView.innerWidth - layerWidth);
  layer.style.left = `${left}px`;
  layer.style.height = `${Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)}px`;
}

function updateResponsiveReaderLayout(doc, options = {}) {
  const metrics = layoutMetrics(doc);
  const sideNotesVisible = sideNotesVisibleForMetrics(metrics);
  const noteLayerWidth = `${Math.round(metrics.noteLayerWidth)}px`;
  const previousNoteLayerWidth = doc.documentElement.style.getPropertyValue('--reader-side-note-layer-width');
  const previousNotesHidden = doc.body.classList.contains('reader-notes-hidden');
  state.layoutWidths = metrics.layout;
  doc.documentElement.style.setProperty('--annotator-source-panel-width', `${Math.round(metrics.sourceWidth)}px`);
  doc.documentElement.style.setProperty('--annotator-note-panel-width', noteLayerWidth);
  doc.documentElement.style.setProperty('--annotator-panel-gap', `${sideNotesVisible ? metrics.gap : 0}px`);
  doc.documentElement.style.setProperty('--reader-side-note-layer-width', noteLayerWidth);
  doc.documentElement.style.setProperty('--reader-side-note-gap', `${sideNotesVisible ? metrics.gap : 0}px`);
  doc.documentElement.style.setProperty('--reader-text-note-edge', `${Math.round(metrics.sourceNoteX)}px`);
  document.documentElement.style.setProperty('--reader-side-note-layer-width', noteLayerWidth);
  doc.body.classList.toggle('reader-notes-hidden', !sideNotesVisible);
  const layoutChanged = previousNoteLayerWidth !== noteLayerWidth || previousNotesHidden !== !sideNotesVisible;
  if (layoutChanged && options.notify !== false) {
    dispatchSideNoteLayoutChange(doc, metrics, {
      phase: options.phase || 'layout',
      reason: options.reason || 'responsive-layout'
    });
  }
}

function dispatchSideNoteLayoutChange(doc, metrics = layoutMetrics(doc), detail = {}) {
  const FrameCustomEvent = doc.defaultView?.CustomEvent || CustomEvent;
  doc.dispatchEvent(new FrameCustomEvent('reader-side-note-layout-change', {
    detail: {
      noteLayerWidth: metrics.noteLayerWidth,
      notesHidden: !sideNotesVisibleForMetrics(metrics),
      ...detail
    }
  }));
}

function layoutMetrics(doc, options = {}) {
  const layout = constrainLayoutForViewport(doc, state.layoutWidths);
  const viewportWidth = Math.max(320, doc.defaultView.innerWidth);
  const gap = 0;
  if (options.splitSourceOnly ?? state.splitNotesActive) {
    return {
      layout,
      viewportWidth,
      gap,
      rawNoteWidth: 0,
      noteVisible: false,
      sourceWidth: viewportWidth,
      noteLayerWidth: 0,
      sourceNoteX: viewportWidth
    };
  }
  const rawNoteWidth = viewportWidth * layout.noteFraction;
  const noteVisible = rawNoteWidth >= MIN_VISIBLE_NOTE_WIDTH;
  const sourceWidth = noteVisible ? viewportWidth - rawNoteWidth : viewportWidth;
  const noteLayerWidth = noteVisible ? Math.max(0, rawNoteWidth - gap) : 0;
  return {
    layout,
    viewportWidth,
    gap,
    rawNoteWidth,
    noteVisible,
    sourceWidth,
    noteLayerWidth,
    sourceNoteX: sourceWidth
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  const base = Number.isFinite(number) ? number : fallback;
  return Math.min(Math.max(base, min), Math.max(min, max));
}

function normalizeLayoutFractions(layout = null) {
  const defaults = { sourceFraction: 0.72, noteFraction: 0.28 };
  const source = layout && typeof layout === 'object' ? layout : defaults;
  if ([source.sourceFraction, source.noteFraction].some((value) => value !== undefined)) {
    return normalizeSplitFractions({
      sourceFraction: source.sourceFraction,
      noteFraction: source.noteFraction
    }, defaults);
  }
  if ([source.navFraction, source.textFraction, source.noteFraction].some((value) => value !== undefined)) {
    return normalizeSplitFractions({
      sourceFraction: (Number(source.navFraction) || 0) + (Number(source.textFraction) || 0),
      noteFraction: source.noteFraction
    }, defaults);
  }
  if ([source.sourceWidth, source.navWidth, source.mainWidth, source.noteWidth].some((value) => value !== undefined)) {
    const sourceWidth = Math.max(0, Number(source.sourceWidth) || (Number(source.navWidth) || 0) + (Number(source.mainWidth) || 0));
    const noteWidth = Math.max(0, Number(source.noteWidth) || 0);
    const total = sourceWidth + noteWidth;
    if (total > 0) {
      return normalizeSplitFractions({
        sourceFraction: sourceWidth / total,
        noteFraction: noteWidth / total
      }, defaults);
    }
  }
  return defaults;
}

function constrainLayoutForViewport(doc, layout = null) {
  const normalized = normalizeLayoutFractions(layout);
  const minNoteFraction = minimumNoteFraction(doc);
  if (normalized.noteFraction >= minNoteFraction) return normalized;
  return {
    sourceFraction: Math.max(0, 1 - minNoteFraction),
    noteFraction: minNoteFraction
  };
}

function minimumNoteFraction(doc) {
  const viewportWidth = Math.max(320, doc.defaultView.innerWidth);
  const gap = 0;
  const minRawNoteWidth = Math.min(viewportWidth, MIN_VISIBLE_NOTE_WIDTH + gap);
  return clampNumber(minRawNoteWidth / viewportWidth, 0, 1, 0);
}

function normalizeSplitFractions(values, fallback) {
  const fractions = {
    sourceFraction: clampNumber(values.sourceFraction, 0, 1, fallback.sourceFraction),
    noteFraction: clampNumber(values.noteFraction, 0, 1, fallback.noteFraction)
  };
  const total = fractions.sourceFraction + fractions.noteFraction;
  if (total <= 0) return { sourceFraction: 1, noteFraction: 0 };
  return {
    sourceFraction: fractions.sourceFraction / total,
    noteFraction: fractions.noteFraction / total
  };
}

function renderLayoutEditor(doc) {
  updateResponsiveReaderLayout(doc);
  renderLayoutResizers(doc);
}

function renderLayoutResizers(doc) {
  doc.querySelectorAll('.reader-layout-resizer, .reader-highlight-navigator').forEach((element) => element.remove());
  const metrics = layoutMetrics(doc);
  if (state.splitNotesActive) return;
  if (state.readingMode && metrics.layout.noteFraction > 0) return;
  if (isNotesPanelExpanded()) return;
  if (!metrics.noteVisible) return;
  const handle = doc.createElement('div');
  handle.className = 'reader-layout-resizer';
  handle.dataset.layoutHandle = 'source-notes';
  handle.style.left = `${Math.round(metrics.sourceNoteX)}px`;
  handle.title = 'Resize source and side notes';
  handle.setAttribute('role', 'separator');
  handle.setAttribute('aria-label', 'Resize source and side notes');
  handle.setAttribute('aria-orientation', 'vertical');
  handle.setAttribute('aria-valuemin', '0');
  handle.setAttribute('aria-valuemax', String(Math.round((1 - minimumNoteFraction(doc)) * 100)));
  handle.setAttribute('aria-valuenow', String(Math.round(metrics.layout.sourceFraction * 100)));
  handle.setAttribute('aria-valuetext', `${Math.round(metrics.layout.sourceFraction * 100)} percent source width`);
  handle.tabIndex = 0;
  handle.addEventListener('pointerdown', onLayoutResizerPointerDown);
  handle.addEventListener('keydown', onLayoutResizerKeyDown);
  doc.body.append(handle);
  renderPinnedHighlightNavigator(doc, metrics);
}

function renderPinnedHighlightNavigator(doc, metrics = layoutMetrics(doc)) {
  if (!state.pinnedAnnotationId) return;
  const annotation = state.annotations.find((item) => item.id === state.pinnedAnnotationId);
  if (!annotation || !annotationHighlightTargets(annotation).length) return;
  const navigator = doc.createElement('nav');
  navigator.className = 'reader-highlight-navigator';
  navigator.dataset.annotationId = annotation.id;
  navigator.style.left = `${Math.round(metrics.sourceNoteX)}px`;
  navigator.setAttribute('aria-label', 'Pinned note highlights');
  doc.body.append(navigator);
  syncPinnedHighlightNavigator(doc);
}

function syncPinnedHighlightNavigator(doc = getFrameDoc()) {
  const navigator = doc?.querySelector?.('.reader-highlight-navigator');
  if (!navigator || !state.pinnedAnnotationId || navigator.dataset.annotationId !== state.pinnedAnnotationId) return;
  const annotation = state.annotations.find((item) => item.id === state.pinnedAnnotationId);
  if (!annotation) {
    navigator.remove();
    return;
  }
  const entries = pinnedHighlightNavigatorEntries(doc, annotation);
  const projected = projectPinnedHighlightMarkers(
    entries,
    (doc.defaultView.scrollY || 0) + doc.defaultView.innerHeight / 2,
    doc.defaultView.innerHeight
  );
  const existing = new Map(Array.from(navigator.querySelectorAll('.reader-highlight-navigator-marker'))
    .map((marker) => [Number(marker.dataset.targetIndex), marker]));
  const total = projected.length;
  for (const [ordinal, entry] of projected.entries()) {
    let marker = existing.get(entry.targetIndex);
    if (!marker) {
      marker = doc.createElement('button');
      marker.type = 'button';
      marker.className = 'reader-highlight-navigator-marker';
      marker.dataset.targetIndex = String(entry.targetIndex);
      marker.addEventListener('pointerdown', (event) => event.stopPropagation());
      marker.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        jumpToAnnotationHighlight(annotation.id, entry.targetIndex);
      });
      navigator.append(marker);
    }
    existing.delete(entry.targetIndex);
    marker.style.setProperty('--reader-highlight-marker-y', `${entry.top.toFixed(2)}px`);
    marker.title = `Highlight ${ordinal + 1} of ${total}`;
    marker.setAttribute('aria-label', `Go to highlight ${ordinal + 1} of ${total}`);
  }
  existing.forEach((marker) => marker.remove());
}

function pinnedHighlightNavigatorEntries(doc, annotation) {
  const view = doc.defaultView;
  const currentPageIndex = Number(doc.documentElement.dataset.pdfCurrentPageIndex);
  return annotationHighlightTargets(annotation).map(({ target, index }) => {
    const selector = `.reader-highlight[data-annotation-id="${cssEscape(annotation.id)}"][data-target-index="${cssEscape(String(index))}"]`;
    const rendered = Array.from(doc.querySelectorAll(selector));
    if (rendered.length) {
      const rects = rendered.flatMap((element) => {
        const clientRects = Array.from(element.getClientRects?.() || []);
        return clientRects.length ? clientRects : [element.getBoundingClientRect()];
      });
      const top = Math.min(...rects.map((rect) => rect.top));
      const bottom = Math.max(...rects.map((rect) => rect.bottom));
      if (Number.isFinite(top) && Number.isFinite(bottom)) {
        return { targetIndex: index, documentY: (view.scrollY || 0) + (top + bottom) / 2 };
      }
    }
    const resolved = resolvedTargetForAnnotation(annotation.id, index);
    const rect = resolved?.element?.getBoundingClientRect?.() || resolved?.anchorElement?.getBoundingClientRect?.();
    if (rect && Number.isFinite(rect.top)) {
      return { targetIndex: index, documentY: (view.scrollY || 0) + rect.top + rect.height / 2 };
    }
    const pageIndex = pdfPageIndexFromTarget(target);
    if (state.currentDocument?.sourceType === 'pdf' && Number.isInteger(pageIndex)) {
      const pageDelta = pageIndex - (Number.isInteger(currentPageIndex) ? currentPageIndex : pageIndex);
      const ratio = target.type === 'pdf-rect'
        ? clampNumber(Number(target.rect?.y) + Number(target.rect?.height || 0) / 2, 0, 1, 0.5)
        : clampNumber(target.pageY, 0, 1, 0.5);
      return {
        targetIndex: index,
        documentY: (view.scrollY || 0) + view.innerHeight / 2 + pageDelta * view.innerHeight + (ratio - 0.5) * view.innerHeight
      };
    }
    return null;
  }).filter(Boolean);
}

function projectPinnedHighlightMarkers(entries, viewportCenter, viewportHeight, options) {
  options ||= {};
  const height = Math.max(1, Number(viewportHeight) || 1);
  const edgePadding = clampNumber(options.edgePadding, 0, height / 2, 12);
  const minTop = edgePadding;
  const maxTop = Math.max(minTop, height - edgePadding);
  const center = (minTop + maxTop) / 2;
  const halfHeight = Math.max(1, (maxTop - minTop) / 2);
  const scale = Math.max(1, Number(options.scale) || halfHeight);
  const sorted = (entries || []).filter((entry) => Number.isFinite(Number(entry?.documentY)))
    .slice()
    .sort((first, second) => Number(first.documentY) - Number(second.documentY)
      || Number(first.targetIndex) - Number(second.targetIndex));
  if (!sorted.length) return [];
  const basePositions = sorted.map((entry) => {
    const distance = Number(entry.documentY) - Number(viewportCenter || 0);
    const direction = Math.sign(distance);
    return center + direction * (1 - Math.exp(-Math.abs(distance) / scale)) * halfHeight;
  });
  if (basePositions.length === 1) return [{ ...sorted[0], top: basePositions[0] }];
  const available = Math.max(0, maxTop - minTop);
  const minimumGap = Math.min(clampNumber(options.minimumGap, 0, available, 8), available / (basePositions.length - 1));
  const corrected = basePositions.slice();
  for (let index = 1; index < corrected.length; index += 1) {
    corrected[index] = Math.max(corrected[index], corrected[index - 1] + minimumGap);
  }
  if (corrected.at(-1) > maxTop) {
    corrected[corrected.length - 1] = maxTop;
    for (let index = corrected.length - 2; index >= 0; index -= 1) {
      corrected[index] = Math.min(corrected[index], corrected[index + 1] - minimumGap);
    }
  }
  if (corrected[0] < minTop) {
    corrected[0] = minTop;
    for (let index = 1; index < corrected.length; index += 1) {
      corrected[index] = Math.max(corrected[index], corrected[index - 1] + minimumGap);
    }
  }
  return sorted.map((entry, index) => ({ ...entry, top: corrected[index] }));
}

function onLayoutResizerKeyDown(event) {
  const doc = event.currentTarget.ownerDocument;
  const previousLayout = layoutMetrics(doc).layout;
  const current = previousLayout.sourceFraction;
  const step = event.shiftKey ? 0.05 : 0.01;
  let next = null;
  if (event.key === 'ArrowLeft') next = current - step;
  if (event.key === 'ArrowRight') next = current + step;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = 1 - minimumNoteFraction(doc);
  if (event.key === '0') next = 0.72;
  if (next == null) return;
  event.preventDefault();
  event.stopPropagation();
  const anchor = captureViewportAnchor(doc);
  dispatchSideNoteLayoutChange(doc, layoutMetrics(doc), {
    phase: 'start',
    reason: 'layout-resizer',
    input: 'keyboard'
  });
  updateLayoutFromDrag(doc, 'source-notes', Math.max(320, doc.defaultView.innerWidth) * next, anchor);
  const committed = commitLayoutResize(doc, previousLayout, 'keyboard');
  if (!committed) {
    dispatchSideNoteLayoutChange(doc, layoutMetrics(doc), {
      phase: 'cancel',
      reason: 'layout-resizer',
      input: 'keyboard'
    });
  }
  const metrics = layoutMetrics(doc);
  event.currentTarget.style.left = `${Math.round(metrics.sourceNoteX)}px`;
  event.currentTarget.setAttribute('aria-valuenow', String(Math.round(metrics.layout.sourceFraction * 100)));
  event.currentTarget.setAttribute('aria-valuetext', `${Math.round(metrics.layout.sourceFraction * 100)} percent source width`);
  setStatus(`Source width ${Math.round(metrics.layout.sourceFraction * 100)} percent.`);
}

function onLayoutResizerPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const doc = event.currentTarget.ownerDocument;
  const handle = event.currentTarget.dataset.layoutHandle;
  const anchor = captureViewportAnchor(doc);
  const view = doc.defaultView || window;
  event.currentTarget.classList.add('is-dragging');
  doc.body.classList.add('is-resizing-layout');
  try {
    event.currentTarget.setPointerCapture(event.pointerId);
  } catch {
    // Some synthetic events do not support capture.
  }
  const session = {
    handle,
    anchor,
    handleElement: event.currentTarget,
    pointerId: event.pointerId,
    initialLayout: layoutMetrics(doc).layout,
    pendingClientX: null,
    previewRaf: 0
  };
  state.layoutDragSession = session;
  cancelPendingSideNoteLayout(doc);
  dispatchSideNoteLayoutChange(doc, layoutMetrics(doc), {
    phase: 'start',
    reason: 'layout-resizer',
    input: 'pointer'
  });

  const flushPreview = () => {
    if (session.previewRaf) {
      view.cancelAnimationFrame(session.previewRaf);
      session.previewRaf = 0;
    }
    const clientX = session.pendingClientX;
    session.pendingClientX = null;
    if (!Number.isFinite(clientX) || state.layoutDragSession !== session) return;
    updateLayoutFromDrag(doc, handle, clientX, anchor);
  };
  const onMove = (moveEvent) => {
    if (moveEvent.pointerId !== undefined && moveEvent.pointerId !== session.pointerId) return;
    if (state.layoutDragSession !== session || !Number.isFinite(moveEvent.clientX)) return;
    moveEvent.preventDefault();
    session.pendingClientX = moveEvent.clientX;
    if (session.previewRaf) return;
    session.previewRaf = view.requestAnimationFrame(() => {
      session.previewRaf = 0;
      const clientX = session.pendingClientX;
      session.pendingClientX = null;
      if (!Number.isFinite(clientX) || state.layoutDragSession !== session) return;
      updateLayoutFromDrag(doc, handle, clientX, anchor);
    });
  };
  const onUp = (upEvent) => {
    if (upEvent?.pointerId !== undefined && upEvent.pointerId !== session.pointerId) return;
    if (state.layoutDragSession !== session) return;
    flushPreview();
    doc.removeEventListener('pointermove', onMove);
    doc.removeEventListener('pointerup', onUp);
    doc.removeEventListener('pointercancel', onUp);
    session.handleElement.classList.remove('is-dragging');
    doc.body.classList.remove('is-resizing-layout');
    try {
      session.handleElement.releasePointerCapture?.(session.pointerId);
    } catch {
      // Pointer capture may already be released after pointerup or pointercancel.
    }
    state.layoutDragSession = null;
    const committed = commitLayoutResize(doc, session.initialLayout, 'pointer');
    if (!committed) {
      dispatchSideNoteLayoutChange(doc, layoutMetrics(doc), {
        phase: 'cancel',
        reason: 'layout-resizer',
        input: 'pointer'
      });
    }
    renderLayoutResizers(doc);
  };
  doc.addEventListener('pointermove', onMove);
  doc.addEventListener('pointerup', onUp);
  doc.addEventListener('pointercancel', onUp);
}

function updateLayoutFromDrag(doc, handle, clientX, anchor) {
  if (handle !== 'source-notes') return false;
  const width = Math.max(320, doc.defaultView.innerWidth);
  const minNoteFraction = minimumNoteFraction(doc);
  const sourceFraction = clampNumber(clientX / width, 0, 1 - minNoteFraction, 1 - minNoteFraction);
  const previousLayout = layoutMetrics(doc).layout;
  const nextLayout = constrainLayoutForViewport(doc, {
    sourceFraction,
    noteFraction: 1 - sourceFraction
  });
  if (!layoutFractionsDiffer(previousLayout, nextLayout)) return false;
  state.layoutWidths = nextLayout;
  updateResponsiveReaderLayout(doc, { notify: false });
  restoreViewportAnchor(doc, anchor);
  const metrics = layoutMetrics(doc);
  dispatchSideNoteLayoutChange(doc, metrics, {
    phase: 'preview',
    reason: 'layout-resizer'
  });
  if (!state.readingMode) previewSideNoteLayout(doc);
  const handleElement = state.layoutDragSession?.handleElement;
  if (handleElement?.isConnected) {
    handleElement.style.left = `${Math.round(metrics.sourceNoteX)}px`;
    handleElement.setAttribute('aria-valuenow', String(Math.round(metrics.layout.sourceFraction * 100)));
    handleElement.setAttribute('aria-valuetext', `${Math.round(metrics.layout.sourceFraction * 100)} percent source width`);
  }
  const highlightNavigator = doc.querySelector('.reader-highlight-navigator');
  if (highlightNavigator) highlightNavigator.style.left = `${Math.round(metrics.sourceNoteX)}px`;
  syncJumpToNoteButton(doc);
  return true;
}

function commitLayoutResize(doc, previousLayout, input) {
  const metrics = layoutMetrics(doc);
  if (!layoutFractionsDiffer(previousLayout, metrics.layout)) return false;
  state.layoutWidths = metrics.layout;
  saveLayoutWidths();
  dispatchSideNoteLayoutChange(doc, metrics, {
    phase: 'commit',
    reason: 'layout-resizer',
    input
  });
  if (!state.readingMode) requestSideNoteLayout(doc);
  return true;
}

function layoutFractionsDiffer(first, second) {
  return Math.abs(Number(first?.sourceFraction) - Number(second?.sourceFraction)) > 0.000001
    || Math.abs(Number(first?.noteFraction) - Number(second?.noteFraction)) > 0.000001;
}

function installSourcePageNavResizer(doc) {
  const nav = doc.querySelector('.page-nav');
  const handle = doc.querySelector('.page-nav-resizer');
  if (!nav || !handle || handle.dataset.annotatorResizerInstalled === 'true') return;
  handle.dataset.annotatorResizerInstalled = 'true';
  const root = doc.documentElement;
  const view = doc.defaultView;
  const storageKey = `source-page-nav-layout:${state.docId || root.dataset.resourceId || 'default'}`;
  const collapseThreshold = 80;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const layoutFor = (rawNavWidth) => {
    const viewport = Math.max(320, view.innerWidth || 0);
    const navMax = Math.min(420, Math.max(220, viewport * 0.42));
    const collapsed = rawNavWidth <= collapseThreshold;
    const navWidth = collapsed ? 0 : clamp(rawNavWidth, 180, navMax);
    const mainWidth = clamp(viewport - navWidth - 96, 560, 980);
    doc.body.classList.toggle('is-nav-collapsed', collapsed);
    root.style.setProperty('--page-nav-width', `${Math.round(navWidth)}px`);
    root.style.setProperty('--main-text-width', `${Math.round(mainWidth)}px`);
  };
  const readStoredWidth = () => {
    try {
      return Number(view.localStorage.getItem(storageKey));
    } catch {
      return NaN;
    }
  };
  const currentWidth = () => {
    const stored = readStoredWidth();
    if (Number.isFinite(stored)) return stored;
    return nav.getBoundingClientRect().width || 260;
  };
  const save = (navWidth) => {
    try {
      view.localStorage.setItem(storageKey, String(Math.round(navWidth)));
    } catch {
      // Layout resizing still works for the current page if storage is unavailable.
    }
  };
  const applyStored = () => layoutFor(currentWidth());
  applyStored();
  view.addEventListener('resize', applyStored);
  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    handle.classList.add('is-dragging');
    doc.body.classList.add('is-resizing-layout');
    try {
      handle.setPointerCapture?.(event.pointerId);
    } catch {
      // Pointer capture is best effort; document-level listeners finish the drag.
    }
    const onMove = (moveEvent) => {
      moveEvent.preventDefault();
      const width = clamp(moveEvent.clientX, 0, Math.min(420, view.innerWidth * 0.42));
      layoutFor(width);
      save(width);
    };
    const onUp = () => {
      handle.classList.remove('is-dragging');
      doc.body.classList.remove('is-resizing-layout');
      doc.removeEventListener('pointermove', onMove);
      doc.removeEventListener('pointerup', onUp);
      doc.removeEventListener('pointercancel', onUp);
    };
    doc.addEventListener('pointermove', onMove);
    doc.addEventListener('pointerup', onUp);
    doc.addEventListener('pointercancel', onUp);
    onMove(event);
  });
}

function captureViewportAnchor(doc) {
  const view = doc.defaultView;
  const probeY = Math.min(Math.max(120, view.innerHeight * 0.38), Math.max(120, view.innerHeight - 80));
  const selectors = [
    '[data-anchor-id]',
    'main h1, main h2, main h3, main h4, main h5, main h6',
    'main p, main li, main blockquote, main figure'
  ].join(', ');
  const candidates = Array.from(doc.querySelectorAll(selectors))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < view.innerHeight && rect.height > 0;
    })
    .sort((a, b) => Math.abs(a.getBoundingClientRect().top - probeY) - Math.abs(b.getBoundingClientRect().top - probeY));
  const element = candidates[0] || doc.elementFromPoint(view.innerWidth / 2, probeY)?.closest?.(selectors);
  if (!element) return null;
  return {
    element,
    top: element.getBoundingClientRect().top
  };
}

function restoreViewportAnchor(doc, anchor) {
  if (!anchor?.element?.isConnected) return;
  const delta = anchor.element.getBoundingClientRect().top - anchor.top;
  if (Math.abs(delta) > 0.5) doc.defaultView.scrollBy(0, delta);
}

function layoutStorageKey(docId = state.docId) {
  return `reader-layout:${docId || 'default'}`;
}

function loadLayoutWidths(docId) {
  try {
    const parsed = JSON.parse(localStorage.getItem(layoutStorageKey(docId)) || 'null');
    if (!parsed || typeof parsed !== 'object') return null;
    return normalizeLayoutFractions(parsed);
  } catch {
    return null;
  }
}

function saveLayoutWidths() {
  if (!state.docId || !state.layoutWidths) return;
  localStorage.setItem(layoutStorageKey(), JSON.stringify(state.layoutWidths));
}

function notesPanelWidthStorageKey(docId = state.docId) {
  return `reader-notes-panel-width:${docId || 'default'}`;
}

function loadNotesPanelWidth(docId = state.docId) {
  try {
    return normalizeNotesPanelWidth(JSON.parse(localStorage.getItem(notesPanelWidthStorageKey(docId)) || 'null'));
  } catch {
    return NOTES_PANEL_WIDTH.default;
  }
}

function saveNotesPanelWidth() {
  if (!state.docId) return;
  localStorage.setItem(notesPanelWidthStorageKey(), JSON.stringify(normalizeNotesPanelWidth(state.notesPanelWidth)));
}

function normalizeNotesPanelWidth(value) {
  const max = notesPanelMaximumWidth();
  return clampNumber(value, NOTES_PANEL_WIDTH.min, max, Math.min(NOTES_PANEL_WIDTH.default, max));
}

function notesTabTopStorageKey() {
  return 'reader-notes-tab-top';
}

function loadNotesTabTop() {
  try {
    return normalizeNotesTabTop(JSON.parse(localStorage.getItem(notesTabTopStorageKey()) || 'null'));
  } catch {
    return NOTES_TAB_TOP.default;
  }
}

function saveNotesTabTop(value) {
  localStorage.setItem(notesTabTopStorageKey(), JSON.stringify(normalizeNotesTabTop(value)));
}

function currentNotesTabTop() {
  const rect = els.toggleNotesBtn?.getBoundingClientRect?.();
  return normalizeNotesTabTop(Number.isFinite(rect?.top) ? rect.top : loadNotesTabTop());
}

function applyNotesTabTop(value) {
  els.toggleNotesBtn?.style?.setProperty('top', `${Math.round(normalizeNotesTabTop(value))}px`);
}

function normalizeNotesTabTop(value) {
  const tabHeight = els.toggleNotesBtn?.getBoundingClientRect?.().height || 92;
  const max = Math.max(NOTES_TAB_TOP.min, window.innerHeight - tabHeight - 8);
  return clampNumber(value, NOTES_TAB_TOP.min, max, Math.min(NOTES_TAB_TOP.default, max));
}

function normalizeSaveSuccessMessage(message) {
  const text = String(message || 'Saved.').trim();
  if (/^save success\b/i.test(text)) return text;
  return `Save success: ${text}`;
}

function setSaveProgress(message) {
  setSaveNotice(message, { title: 'Saving', state: 'processing', autoHide: false });
}

function setSaveSuccess(message) {
  const successMessage = normalizeSaveSuccessMessage(message);
  setSaveNotice(successMessage, { title: 'Save success', state: 'success', autoHide: true });
}

function setSaveFailure(error) {
  const message = error?.message || String(error || 'Save failed.');
  setSaveNotice(`Save failed: ${message}`, { title: 'Save failed', state: 'error', autoHide: false });
}

function setSaveCancelled(message = 'Save cancelled.') {
  setSaveNotice(message, { title: 'Save cancelled', state: 'cancelled', autoHide: false });
}

function setSaveNotice(message, options = {}) {
  const text = String(message || 'Save status unavailable.').trim();
  const title = options.title || 'Save status';
  const noticeState = options.state || 'info';
  setStatus(text, noticeState === 'error', { visibleNotice: false });
  if (!els.saveToast || !els.saveToastBody || !els.saveToastTitle) return;
  window.clearTimeout(state.saveToastTimer);
  state.saveToastTimer = 0;
  els.saveToastTitle.textContent = title;
  els.saveToastBody.textContent = text;
  els.saveToast.dataset.saveState = noticeState;
  els.saveToast.hidden = false;
  if (options.autoHide) {
    state.saveToastTimer = window.setTimeout(() => hideSaveToast(), SAVE_SUCCESS_VISIBLE_MS);
  }
}

function hideSaveToast() {
  if (!els.saveToast || !els.saveToastBody || !els.saveToastTitle) return;
  window.clearTimeout(state.saveToastTimer);
  state.saveToastTimer = 0;
  els.saveToast.hidden = true;
  els.saveToastTitle.textContent = 'Save status';
  els.saveToastBody.textContent = '';
  delete els.saveToast.dataset.saveState;
}

function setReaderFrameRestoring(restoring) {
  els.frame.classList.toggle('is-restoring-position', Boolean(restoring));
}

async function loadSavedReaderPosition(docId) {
  try {
    return await storage.getReaderPosition?.(docId) || null;
  } catch {
    return null;
  }
}

function hasSavedReaderScrollPosition(position) {
  return Boolean(
    position
    && (
      Number(position.scrollY) > 0
      || position.anchorId
      || position.id
      || Number.isFinite(Number(position.pageNumber))
      || Number.isFinite(Number(position.pageIndex))
      || position.viewState
    )
  );
}

function saveReaderScrollPosition(doc, options = {}) {
  if (!state.docId || state.restoringScroll || !doc?.defaultView) return;
  const precise = options.precise !== false;
  const position = captureReaderPosition(doc, { precise });
  if (!position) return;
  state.lastReaderPosition = position;
  if (!precise) schedulePreciseReaderPositionCapture(doc);
  window.clearTimeout(state.readerPositionSaveTimer);
  state.readerPositionSaveTimer = 0;
  if (options.immediate) {
    persistReaderPosition(position);
    return;
  }
  state.readerPositionSaveTimer = window.setTimeout(() => {
    state.readerPositionSaveTimer = 0;
    persistReaderPosition(position);
  }, READER_POSITION_SAVE_DELAY_MS);
}

function flushReaderScrollPosition(doc = state.iframeLoaded ? getFrameDoc() : null) {
  if (state.readerPositionCaptureTimer) {
    window.clearTimeout(state.readerPositionCaptureTimer);
    state.readerPositionCaptureTimer = 0;
  }
  if (doc?.defaultView && !state.restoringScroll) {
    const position = captureReaderPosition(doc, { precise: true });
    if (position) state.lastReaderPosition = position;
  }
  window.clearTimeout(state.readerPositionSaveTimer);
  state.readerPositionSaveTimer = 0;
  if (!state.lastReaderPosition) return Promise.resolve(false);
  return persistReaderPosition(state.lastReaderPosition);
}

async function persistReaderPosition(position) {
  if (!position?.docId || !storage.setReaderPosition) return false;
  try {
    await storage.setReaderPosition(position.docId, position);
    return true;
  } catch {
    return false;
  }
}

function schedulePreciseReaderPositionCapture(doc) {
  state.readerPositionCaptureDoc = doc;
  window.clearTimeout(state.readerPositionCaptureTimer);
  state.readerPositionCaptureTimer = window.setTimeout(() => {
    const frameDoc = state.readerPositionCaptureDoc;
    state.readerPositionCaptureTimer = 0;
    state.readerPositionCaptureDoc = null;
    if (!frameDoc || frameDoc !== getFrameDoc()) return;
    saveReaderScrollPosition(frameDoc, { precise: true });
  }, READER_POSITION_PRECISE_CAPTURE_DELAY_MS);
}

function captureReaderPosition(doc, options = {}) {
  const win = doc?.defaultView;
  if (!state.docId || !win) return null;
  const base = {
    version: 1,
    docId: state.docId,
    sourceType: state.currentDocument?.sourceType === 'pdf' ? 'pdf' : 'html',
    scrollY: Math.max(0, win.scrollY || 0),
    updatedAt: new Date().toISOString()
  };
  if (options.precise === false) return base;
  return base.sourceType === 'pdf'
    ? capturePdfReaderPosition(doc, base)
    : captureHtmlReaderPosition(doc, base);
}

function captureHtmlReaderPosition(doc, base) {
  const anchor = readerPositionAnchor(doc);
  if (!anchor) return base;
  return {
    ...base,
    ...anchor
  };
}

function readerPositionAnchor(doc) {
  const win = doc.defaultView;
  const viewportY = win.innerHeight * 0.34;
  return readerPositionAnchorFromProbe(doc, viewportY)
    || readerPositionAnchorFromMetrics(doc, win.scrollY + viewportY);
}

function readerPositionAnchorFromProbe(doc, viewportY) {
  const win = doc.defaultView;
  if (!doc.elementsFromPoint || !win?.innerWidth) return null;
  const y = clampNumber(viewportY, 1, Math.max(1, win.innerHeight - 1), 1);
  const sampleXs = [
    win.innerWidth * 0.38,
    win.innerWidth * 0.5,
    win.innerWidth * 0.62,
    Math.min(win.innerWidth - 1, 24)
  ];
  for (const rawX of sampleXs) {
    const x = clampNumber(rawX, 1, Math.max(1, win.innerWidth - 1), 1);
    for (const element of doc.elementsFromPoint(x, y)) {
      if (element.closest?.('.reader-side-note-layer, .reader-layout-resizer, .reader-quick-clip-layer')) continue;
      const anchor = closestAnchorElement(element);
      if (!anchor || anchor.closest?.('.reader-side-note-layer')) continue;
      const captured = readerPositionForAnchorElement(doc, anchor);
      if (captured) return captured;
    }
  }
  return null;
}

function readerPositionAnchorFromMetrics(doc, documentY) {
  if (state.htmlAnchorMetricsDirty) rebuildHtmlAnchorMetrics(doc);
  const metric = metricForDocumentY(state.htmlAnchorMetrics, documentY);
  if (!metric?.element?.isConnected) return null;
  return readerPositionForAnchorElement(doc, metric.element);
}

function readerPositionForAnchorElement(doc, element) {
  if (!element || element.closest?.('.reader-side-note-layer')) return null;
  const rect = element.getBoundingClientRect();
  if (!rect.height && !rect.width) return null;
  const top = doc.defaultView.scrollY + rect.top;
  return {
    anchorId: element.dataset.anchorId || '',
    id: element.id || '',
    offset: doc.defaultView.scrollY - top
  };
}

function scheduleHtmlAnchorMetricsRefresh(doc = getFrameDoc()) {
  if (state.currentDocument?.sourceType === 'pdf') return;
  state.htmlAnchorMetricsDirty = true;
  if (state.htmlAnchorMetricsRaf) return;
  state.htmlAnchorMetricsRaf = requestAnimationFrame(() => {
    state.htmlAnchorMetricsRaf = 0;
    if (!doc || doc !== getFrameDoc()) return;
    rebuildHtmlAnchorMetrics(doc);
  });
}

function rebuildHtmlAnchorMetrics(doc = getFrameDoc()) {
  if (!doc || state.currentDocument?.sourceType === 'pdf') {
    state.htmlAnchorMetrics = [];
    state.htmlAnchorMetricsDirty = false;
    return;
  }
  const scrollY = doc.defaultView?.scrollY || 0;
  state.htmlAnchorMetrics = sortedScrollMetrics(Array.from(doc.querySelectorAll(ANCHOR_SELECTOR))
    .filter((element) => !element.closest?.('.reader-side-note-layer'))
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        anchorId: element.dataset.anchorId || '',
        id: element.id || '',
        top: scrollY + rect.top,
        height: rect.height || 0
      };
    }));
  state.htmlAnchorMetricsDirty = false;
}

function capturePdfReaderPosition(doc, base) {
  const pageNumber = Number(doc.documentElement.dataset.pdfCurrentPage);
  const pageIndex = Number(doc.documentElement.dataset.pdfCurrentPageIndex);
  const ratio = Number(doc.documentElement.dataset.pdfCurrentPageRatio);
  const viewState = normalizePdfViewState({
    zoomLocked: doc.documentElement.dataset.pdfZoomLock !== 'unlocked',
    horizontalPanLocked: doc.documentElement.dataset.pdfHorizontalPan === 'locked',
    zoomScale: doc.documentElement.dataset.pdfZoom,
    zoomRatio: doc.documentElement.dataset.pdfZoomRatio,
    horizontalLeft: doc.documentElement.dataset.pdfHorizontalOffset,
    horizontalRatio: doc.documentElement.dataset.pdfHorizontalRatio
  });
  if (!Number.isFinite(pageNumber) || pageNumber <= 0) {
    return viewState ? { ...base, version: 2, viewState } : base;
  }
  return {
    ...base,
    version: 2,
    pageIndex: Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : pageNumber - 1,
    pageNumber,
    ratio: Number.isFinite(ratio) ? clampNumber(ratio, 0, 1, 0) : 0,
    ...(viewState ? { viewState } : {})
  };
}

async function restoreReaderScrollPosition(doc, position = state.pendingReaderPosition) {
  if (!state.docId || !doc?.defaultView || !position) return;
  state.pendingReaderPosition = null;
  state.restoringScroll = true;
  let scrollY = null;
  if (state.currentDocument?.sourceType === 'pdf') {
    await restorePdfViewState(doc, position.viewState);
    scrollY = await restoredPdfScrollY(doc, position);
  } else {
    scrollY = restoredHtmlScrollY(doc, position);
  }
  if (!Number.isFinite(scrollY)) scrollY = Number(position.scrollY);
  if (Number.isFinite(scrollY) && scrollY > 0) {
    doc.defaultView.scrollTo(0, Math.max(0, scrollY));
  }
  window.setTimeout(() => {
    state.restoringScroll = false;
  }, 100);
}

function restorePdfViewState(doc, value) {
  const viewState = normalizePdfViewState(value);
  if (!viewState) return Promise.resolve(false);
  doc.dispatchEvent(new doc.defaultView.CustomEvent('reader-pdf-restore-view-state', {
    detail: { viewState }
  }));
  return new Promise((resolve) => {
    doc.defaultView.requestAnimationFrame(() => resolve(true));
  });
}

function restoredHtmlScrollY(doc, position) {
  const target = readerPositionAnchorElement(doc, position);
  if (!target) return null;
  const offset = Number(position.offset);
  return doc.defaultView.scrollY + target.getBoundingClientRect().top + (Number.isFinite(offset) ? offset : 0);
}

function readerPositionAnchorElement(doc, position) {
  if (position.anchorId) {
    const anchored = doc.querySelector(`[data-anchor-id="${cssEscape(String(position.anchorId))}"]`);
    if (anchored) return anchored;
  }
  if (position.id) return doc.getElementById(String(position.id));
  return null;
}

async function restoredPdfScrollY(doc, position) {
  const page = await readerPositionPdfPageElement(doc, position);
  if (!page) return null;
  const ratio = Number.isFinite(Number(position.ratio)) ? Number(position.ratio) : 0;
  const rect = page.getBoundingClientRect();
  return doc.defaultView.scrollY + rect.top + rect.height * clampNumber(ratio, 0, 1, 0) - doc.defaultView.innerHeight * 0.35;
}

function readerPositionPdfPageElementNow(doc, position) {
  const pageIndex = Number(position.pageIndex);
  if (Number.isFinite(pageIndex) && pageIndex >= 0) {
    const page = doc.querySelector(`.pdf-page[data-pdf-page-index="${cssEscape(String(Math.round(pageIndex)))}"]`);
    if (page) return page;
  }
  const pageNumber = Number(position.pageNumber);
  if (Number.isFinite(pageNumber) && pageNumber > 0) {
    return doc.querySelector(`#pdf-page-${cssEscape(String(Math.round(pageNumber)))}`);
  }
  return null;
}

function readerPositionPdfPageElement(doc, position) {
  const found = readerPositionPdfPageElementNow(doc, position);
  if (found || doc.documentElement.dataset.pdfPagesReady === 'true') return Promise.resolve(found);
  const pageIndex = Number(position?.pageIndex);
  const pageNumber = Number.isFinite(pageIndex) && pageIndex >= 0
    ? Math.round(pageIndex) + 1
    : Math.round(Number(position?.pageNumber));
  if (Number.isInteger(pageNumber) && pageNumber > 0) {
    doc.dispatchEvent(new doc.defaultView.CustomEvent('reader-pdf-ensure-page', {
      detail: { pageNumber, pageIndex: pageNumber - 1 }
    }));
  }
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const page = readerPositionPdfPageElementNow(doc, position);
      if (page || doc.documentElement.dataset.pdfPagesReady === 'true' || Date.now() - startedAt > PDF_POSITION_READY_TIMEOUT_MS) {
        window.clearInterval(interval);
        resolve(page || readerPositionPdfPageElementNow(doc, position));
      }
    }, 100);
  });
}

function layoutSideNotes(doc) {
  if (!doc) return;
  if (!sideNotesVisibleForMetrics(layoutMetrics(doc))) {
    updateResponsiveReaderLayout(doc);
    doc.querySelectorAll('.reader-side-note-layer').forEach((layer) => layer.remove());
    return;
  }
  getSideNoteLayer(doc);
  const annotationsById = annotationIndexById();
  const notes = Array.from(doc.querySelectorAll('.reader-side-note'))
    .map((note) => {
      if (note.classList.contains('is-pinned')) {
        note.style.left = '';
        note.style.top = '';
        note.style.maxHeight = '';
        note.style.zIndex = '';
        return null;
      }
      const annotation = annotationsById.get(note.dataset.annotationId);
      if (!annotation) return null;
      const position = sideNotePosition(doc, annotation);
      if (!position) return null;
      note.style.left = '0px';
      note.style.top = `${position.top}px`;
      note.style.maxHeight = '';
      const body = note.querySelector('.reader-side-note-body');
      if (body) body.style.maxHeight = '';
      note.classList.remove('is-constrained', 'is-overlapping');
      return { note, top: position.top };
    })
    .filter(Boolean)
    .sort((a, b) => a.top - b.top);

  const gap = 12;
  let highestBottom = -Infinity;
  notes.forEach((entry, index) => {
    entry.note.style.zIndex = String(index + 1);
    if (!state.activeAnnotationId && entry.top < highestBottom + gap) {
      entry.note.classList.add('is-overlapping');
    }
    highestBottom = Math.max(highestBottom, entry.top + entry.note.getBoundingClientRect().height);
  });
  if (state.activeAnnotationId) {
    const activeNote = notes.find((entry) => entry.note.dataset.annotationId === state.activeAnnotationId);
    if (activeNote) activeNote.note.style.zIndex = String(notes.length + 10);
  }
  requestAnimationFrame(() => redrawSideInkCanvases(doc));
}

function previewSideNoteLayout(doc) {
  if (!doc) return;
  const metrics = layoutMetrics(doc);
  if (!sideNotesVisibleForMetrics(metrics)) return;
  const layer = doc.querySelector('.reader-side-note-layer');
  if (!layer) return;
  layer.style.left = `${doc.defaultView.scrollX + Math.max(0, metrics.viewportWidth - metrics.noteLayerWidth)}px`;
  const annotationsById = annotationIndexById();
  for (const note of doc.querySelectorAll('.reader-side-note:not(.is-pinned)')) {
    const annotation = annotationsById.get(note.dataset.annotationId);
    if (!annotation) continue;
    const position = sideNotePosition(doc, annotation);
    if (!position) continue;
    note.style.left = '0px';
    note.style.top = `${position.top}px`;
  }
}

function cancelPendingSideNoteLayout(doc) {
  if (!state.sideNoteLayoutRaf || state.sideNoteLayoutDoc !== doc) return;
  cancelAnimationFrame(state.sideNoteLayoutRaf);
  state.sideNoteLayoutRaf = 0;
  state.sideNoteLayoutDoc = null;
}

function requestSideNoteLayout(doc = getFrameDoc()) {
  if (state.lifecycleSuspended) return;
  state.sideNoteLayoutDoc = doc;
  if (state.sideNoteLayoutRaf) return;
  state.sideNoteLayoutRaf = requestAnimationFrame(() => {
    const frameDoc = state.sideNoteLayoutDoc;
    state.sideNoteLayoutRaf = 0;
    state.sideNoteLayoutDoc = null;
    if (!frameDoc || frameDoc !== getFrameDoc()) return;
    layoutSideNotes(frameDoc);
  });
}

function sideNoteEditingActive(doc = getFrameDoc()) {
  return Boolean(doc?.querySelector?.('.reader-side-note.is-editing'));
}

function redrawSideInkCanvases(doc) {
  if (!doc || state.lifecycleSuspended || doc.visibilityState === 'hidden') return;
  const entries = Array.from(doc.querySelectorAll('.reader-side-note-ink'))
    .map((canvas) => {
      const note = canvas.closest('.reader-side-note');
      const annotationId = note?.dataset.annotationId;
      const blockId = canvas.dataset.blockId;
      if (!annotationId || !blockId) return null;
      return { canvas, annotationId, blockId };
    })
    .filter(Boolean);
  const liveEntries = entries.filter((entry) => isLiveSideInkCanvas(entry.annotationId, entry.blockId));
  const inactiveEntries = entries.filter((entry) => (
    !isLiveSideInkCanvas(entry.annotationId, entry.blockId)
    && elementNearViewport(entry.canvas, doc.defaultView, 500)
  ));
  for (const { canvas, annotationId, blockId } of liveEntries) {
    drawSideInkCanvas(canvas, annotationId, blockId);
  }
  if (state.sideInkSession) return;
  if (state.layoutDragSession) {
    deferInactiveSideInkRedrawUntilLayoutDragEnd(doc);
    return;
  }
  for (const { canvas, annotationId, blockId } of inactiveEntries) {
    drawSideInkCanvas(canvas, annotationId, blockId);
  }
}

function elementNearViewport(element, view, margin = 0) {
  const rect = element?.getBoundingClientRect?.();
  if (!rect || !view) return false;
  return rect.bottom >= -margin && rect.top <= view.innerHeight + margin;
}

function deferInactiveSideInkRedrawUntilLayoutDragEnd(doc) {
  if (pendingInactiveInkLayoutRedraws.has(doc)) return;
  pendingInactiveInkLayoutRedraws.add(doc);
  const finish = () => {
    doc.removeEventListener('pointerup', finish);
    doc.removeEventListener('pointercancel', finish);
    requestAnimationFrame(() => {
      pendingInactiveInkLayoutRedraws.delete(doc);
      if (doc !== getFrameDoc()) return;
      if (state.layoutDragSession) {
        deferInactiveSideInkRedrawUntilLayoutDragEnd(doc);
        return;
      }
      redrawSideInkCanvases(doc);
    });
  };
  doc.addEventListener('pointerup', finish, { once: true });
  doc.addEventListener('pointercancel', finish, { once: true });
}

function annotationIndexById() {
  if (annotationIndexSource === state.annotations) return annotationIndexCache;
  annotationIndexSource = state.annotations;
  annotationIndexCache = new Map(state.annotations.map((annotation) => [annotation.id, annotation]));
  return annotationIndexCache;
}

function installNoteDrawerResizeObserver() {
  if (!els.noteDrawerBody || typeof ResizeObserver !== 'function' || state.noteDrawerResizeObserver) return;
  state.noteDrawerResizeObserver = new ResizeObserver(() => {
    requestNavigatorInkPreviewRedraw();
  });
  state.noteDrawerResizeObserver.observe(els.noteDrawerBody);
}

function sideNotePosition(doc, annotation) {
  if (annotation?.id === state.focusModeAnnotationId && Number.isFinite(state.focusModeNoteTop)) {
    return { top: state.focusModeNoteTop };
  }
  const anchor = annotationAnchorElement(doc, annotation);
  if (!anchor) {
    const documentY = Number(annotation?.target?.clientHint?.documentY);
    return Number.isFinite(documentY) ? { top: documentY } : null;
  }
  const rect = anchor.getBoundingClientRect();
  const scrollY = doc.defaultView.scrollY;
  if (state.currentDocument?.sourceType === 'pdf' && annotation?.target?.type === 'text') {
    if (anchor.matches?.('.reader-highlight')) {
      rememberResolvedPdfSideNoteTop(doc, annotation, anchor, rect, scrollY);
    } else {
      const cachedPosition = cachedPendingPdfSideNotePosition(doc, annotation, anchor, scrollY);
      if (cachedPosition) return cachedPosition;
    }
  }
  if (annotation?.target?.type === 'pdf-page-point' || annotation?.target?.type === 'pdf-rect') {
    const y = annotation.target.type === 'pdf-rect'
      ? clampNumber(annotation.target.rect?.y, 0, 1, 0)
      : clampNumber(annotation.target.y, 0, 1, 0);
    return {
      top: scrollY + rect.top + rect.height * y
    };
  }
  const anchorOffsetY = Number(annotation?.target?.clientHint?.anchorOffsetY);
  if (Number.isFinite(anchorOffsetY)) {
    return {
      top: scrollY + rect.top + anchorOffsetY
    };
  }
  return {
    top: scrollY + rect.top
  };
}

function rememberResolvedPdfSideNoteTop(doc, annotation, anchor, anchorRect, scrollY) {
  const page = anchor.closest?.('.pdf-page');
  if (!page) return;
  const pageRect = page.getBoundingClientRect();
  let cache = pdfSideNotePositionCache.get(doc);
  if (!cache) {
    cache = new Map();
    pdfSideNotePositionCache.set(doc, cache);
  }
  cache.set(annotation.id, {
    pageIndex: pdfPageIndexForElement(page),
    pageRatio: pageRect.height > 0
      ? clampNumber((anchorRect.top - pageRect.top) / pageRect.height, 0, 1, 0)
      : null,
    documentTop: scrollY + anchorRect.top
  });
}

function cachedPendingPdfSideNotePosition(doc, annotation, anchor, scrollY) {
  const resolution = annotationResolution(annotation);
  const primaryResolution = resolution?.targets?.find((target) => target.primary)
    || resolution?.targets?.[0];
  if (primaryResolution?.status !== 'pending') return null;
  const page = anchor.closest?.('.pdf-page') || (anchor.matches?.('.pdf-page') ? anchor : null);
  if (!page) return null;
  const cached = pdfSideNotePositionCache.get(doc)?.get(annotation.id);
  const pageIndex = pdfPageIndexForElement(page);
  if (cached) {
    if (cached.pageIndex != null && pageIndex != null && cached.pageIndex !== pageIndex) return null;
    return { top: pdfSideNoteTopFromCache(cached, page.getBoundingClientRect(), scrollY) };
  }
  const persistedPageY = Number(annotation?.target?.pageY);
  if (!Number.isFinite(persistedPageY)) return null;
  const pageRect = page.getBoundingClientRect();
  return {
    top: scrollY + pageRect.top + pageRect.height * clampNumber(persistedPageY, 0, 1, 0)
  };
}

function pdfSideNoteTopFromCache(cached, pageRect, scrollY) {
  if (Number.isFinite(cached?.pageRatio) && pageRect.height > 0) {
    return scrollY + pageRect.top + pageRect.height * cached.pageRatio;
  }
  return Number.isFinite(cached?.documentTop) ? cached.documentTop : scrollY + pageRect.top;
}

function annotationAnchorElement(doc, annotation) {
  if (!annotation) return null;
  if (annotation.target?.type === 'text' && annotation.highlight?.enabled) {
    const highlight = doc.querySelector(`.reader-highlight[data-annotation-id="${cssEscape(annotation.id)}"][data-target-index="0"]`);
    if (highlight) return highlight;
  }
  return resolveTargetElement(doc, annotation.target);
}

function sideNoteText(annotation) {
  return sideNoteContentBlocks(annotation)
    .filter((block) => block.type === 'text')
    .map((block) => block.markdown)
    .filter(Boolean)
    .join('\n\n');
}

function sideNoteTitle(annotation) {
  return annotation.note?.title || '';
}

function sideNoteContentBlocks(annotation) {
  const rawBlocks = Array.isArray(annotation.note?.blocks) ? annotation.note.blocks : [];
  if (rawBlocks.length && rawBlocks.every(isRuntimeSideNoteBlock)) return rawBlocks;
  const blocks = rawBlocks.map((block, index) => normalizeSideNoteBlock(block, annotation, index)).filter(Boolean);
  if (blocks.length) return blocks;
  const legacyBlocks = [];
  const markdown = annotation.note?.markdown || '';
  const ink = normalizeSideNoteInk(annotation.note?.ink);
  if (markdown || !ink.strokes.length) legacyBlocks.push({
    id: deterministicLegacyBlockId(annotation, legacyBlocks.length, 'text'),
    type: 'text',
    markdown
  });
  if (ink.strokes.length) legacyBlocks.push({
    id: deterministicLegacyBlockId(annotation, legacyBlocks.length, 'ink'),
    type: 'ink',
    ink
  });
  return legacyBlocks;
}

function isRuntimeSideNoteBlock(block) {
  if (!isSideNoteBlockId(block?.id)) return false;
  if (block?.type === 'blank') return true;
  if (block?.type === 'text') return typeof block.markdown === 'string';
  if (block?.type === 'image') {
    return typeof block.assetPath === 'string'
      && typeof block.mimeType === 'string'
      && Number.isFinite(Number(block.intrinsicWidth))
      && Number.isFinite(Number(block.intrinsicHeight));
  }
  if (block?.type !== 'ink') return false;
  const ink = block.ink;
  if (!ink || ink.v != null || !Array.isArray(ink.strokes)) return false;
  return ink.strokes.every(isRuntimeInkStroke);
}

function isRuntimeInkStroke(stroke) {
  if (!stroke || typeof stroke !== 'object' || !Array.isArray(stroke.points)) return false;
  return stroke.points.every((point) => (
    point
    && typeof point === 'object'
    && !Array.isArray(point)
    && Number.isFinite(point.x)
    && Number.isFinite(point.y)
  ));
}

function normalizeSideNoteBlock(block, annotation, index) {
  const id = isSideNoteBlockId(block?.id)
    ? block.id
    : deterministicLegacyBlockId(annotation, index, block?.type || 'blank');
  if (block?.type === 'blank') return { id, type: 'blank' };
  if (block?.type === 'text') return { id, type: 'text', markdown: String(block.markdown || '') };
  if (block?.type === 'ink') return { id, type: 'ink', ink: normalizeSideNoteInk(block.ink) };
  if (block?.type === 'image') {
    return {
      id,
      type: 'image',
      assetPath: String(block.assetPath || ''),
      mimeType: String(block.mimeType || ''),
      intrinsicWidth: Number(block.intrinsicWidth),
      intrinsicHeight: Number(block.intrinsicHeight),
      alt: String(block.alt || ''),
      originalName: String(block.originalName || '')
    };
  }
  return null;
}

function isSideNoteBlockId(value) {
  return typeof value === 'string' && /^blk_[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function deterministicLegacyBlockId(annotation, index, type) {
  const input = `${annotation?.id || 'note'}:${Number(index) || 0}:${type || 'block'}`;
  let hash = 2166136261;
  for (let cursor = 0; cursor < input.length; cursor += 1) {
    hash ^= input.charCodeAt(cursor);
    hash = Math.imul(hash, 16777619);
  }
  return `blk_legacy_${(hash >>> 0).toString(36)}`;
}

function newSideNoteBlockId() {
  const value = globalThis.crypto?.randomUUID?.()
    || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return `blk_${String(value).replace(/[^A-Za-z0-9_-]/g, '_')}`;
}

function newSideNoteBlock(type) {
  if (type === 'ink') {
    return { id: newSideNoteBlockId(), type: 'ink', ink: { strokes: [], height: INK_CANVAS_HEIGHT.default } };
  }
  if (type === 'blank') return { id: newSideNoteBlockId(), type: 'blank' };
  return { id: newSideNoteBlockId(), type: 'text', markdown: '' };
}

function sideNoteBlockIndex(annotation, blockId) {
  if (!blockId) return -1;
  return sideNoteContentBlocks(annotation).findIndex((block) => block.id === blockId);
}

function sideNoteBlockById(annotation, blockId) {
  const index = sideNoteBlockIndex(annotation, blockId);
  return index >= 0 ? sideNoteContentBlocks(annotation)[index] : null;
}

function normalizeSideNoteInk(ink) {
  const decoded = decodeInkForRuntime(ink);
  const height = normalizeInkHeight(ink?.height);
  return {
    strokes: decoded.strokes,
    height
  };
}

function normalizeInkHeight(value, fallback = INK_CANVAS_HEIGHT.default) {
  if (value == null || value === '') return fallback;
  const height = Number(value);
  if (!Number.isFinite(height)) return fallback;
  return Math.round(clampNumber(height, INK_CANVAS_HEIGHT.min, INK_CANVAS_HEIGHT.max, INK_CANVAS_HEIGHT.min));
}

function legacyNoteFieldsFromBlocks(blocks) {
  const firstText = blocks.find((block) => block.type === 'text');
  const firstInk = blocks.find((block) => block.type === 'ink');
  return {
    markdown: firstText?.markdown || '',
    ink: firstInk?.ink || { strokes: [] }
  };
}

async function handleSideInkAction(event, annotationId, action) {
  const toolbar = event.target?.closest?.('.reader-side-note-ink-toolbar');
  const blockId = toolbar?.dataset?.blockId || '';
  if (action === 'ink-tool-pen') {
    state.inkTool = 'pen';
    syncInkToolUi();
    return;
  }
  if (action === 'ink-tool-eraser') {
    state.inkTool = 'eraser';
    syncInkToolUi();
    return;
  }
  if (action === 'ink-color') {
    state.inkColor = event.target.value;
    return;
  }
  if (action === 'ink-width') {
    state.inkWidth = Number(event.target.value) || 3;
    return;
  }
  if (action === 'ink-pressure') {
    state.inkPressureEnabled = event.target.checked;
    syncInkToolUi();
    return;
  }
  if (!blockId) return;
  if (action === 'ink-undo') await undoSideInk(annotationId, blockId);
  if (action === 'ink-redo') await redoSideInk(annotationId, blockId);
  if (action === 'ink-clear') requestClearSideInk(annotationId, blockId, event.target);
}

function sideInkHistoryKey(annotationId, blockId) {
  return `${annotationId}:${blockId}`;
}

function syncInkToolUi(doc = getFrameDoc()) {
  if (!doc) return;
  doc.querySelectorAll('.reader-side-note').forEach((note) => {
    if (note.dataset.annotationId === state.activeAnnotationId) {
      note.dataset.inkTool = state.inkTool;
    }
  });
  doc.querySelectorAll('.reader-side-note-ink-toolbar').forEach((toolbar) => {
    toolbar.querySelectorAll('[data-side-note-action="ink-tool-pen"]').forEach((button) => {
      button.classList.toggle('is-active', state.inkTool === 'pen');
    });
    toolbar.querySelectorAll('[data-side-note-action="ink-tool-eraser"]').forEach((button) => {
      button.classList.toggle('is-active', state.inkTool === 'eraser');
    });
    toolbar.querySelectorAll('[data-side-note-action="ink-pressure"]').forEach((input) => {
      input.checked = state.inkPressureEnabled;
    });
  });
}

function sideInkHistory(annotationId, blockId) {
  const key = sideInkHistoryKey(annotationId, blockId);
  if (!state.sideInkHistory.has(key)) state.sideInkHistory.set(key, { undo: [], redo: [] });
  return state.sideInkHistory.get(key);
}

async function undoSideInk(annotationId, blockId) {
  const history = sideInkHistory(annotationId, blockId);
  const action = history.undo.pop();
  if (!action) return;
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type !== 'ink') return;
  if (action.type === 'add') {
    block.ink.strokes.pop();
  } else if (action.type === 'erase') {
    block.ink.strokes.push(...action.strokes);
  }
  history.redo.push(action);
  redrawSideInkCanvases(getFrameDoc());
  await saveAnnotationBlocks(annotation, blocks, { render: false });
}

async function redoSideInk(annotationId, blockId) {
  const history = sideInkHistory(annotationId, blockId);
  const action = history.redo.pop();
  if (!action) return;
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type !== 'ink') return;
  if (action.type === 'add') {
    block.ink.strokes.push(action.stroke);
  } else if (action.type === 'erase') {
    block.ink.strokes = block.ink.strokes.filter((stroke) => !action.strokes.includes(stroke));
  }
  history.undo.push(action);
  redrawSideInkCanvases(getFrameDoc());
  await saveAnnotationBlocks(annotation, blocks, { render: false });
}

async function clearSideInk(annotationId, blockId) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId) return;
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type !== 'ink' || !block.ink.strokes.length) return;
  const removed = block.ink.strokes.slice();
  block.ink.strokes = [];
  const history = sideInkHistory(annotationId, blockId);
  history.undo.push({ type: 'erase', strokes: removed });
  history.redo = [];
  redrawSideInkCanvases(getFrameDoc());
  const updated = await saveAnnotationBlocks(annotation, blocks, { render: false });
  recordAnnotationHistory('drawing clear', before, updated, annotationId);
}

function requestClearSideInk(annotationId, blockId, anchorElement) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !blockId || !anchorElement) return;
  const block = sideNoteBlockById(annotation, blockId);
  if (block?.type !== 'ink' || !block.ink.strokes.length) return;
  closeDeleteConfirmPopovers();
  const doc = anchorElement.ownerDocument;
  const popover = doc.createElement('div');
  popover.className = 'reader-delete-confirm-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Clear drawing');

  const message = doc.createElement('p');
  message.textContent = 'Clear this drawing?';
  const actions = doc.createElement('div');
  actions.className = 'reader-delete-confirm-actions';
  const cancel = doc.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.title = 'Cancel clear';
  const confirmButton = doc.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'danger';
  confirmButton.textContent = 'Clear';
  confirmButton.title = 'Clear drawing';
  actions.append(cancel, confirmButton);
  popover.append(message, actions);
  doc.body.append(popover);
  positionDeleteConfirmPopover(doc, popover, anchorElement);

  installInlineConfirmPopover(popover, anchorElement, {
    cancelButton: cancel,
    confirmButton,
    onConfirm: () => clearSideInk(annotationId, blockId)
  });
}

async function saveAnnotationBlocks(annotation, blocks, options = {}) {
  await flushPendingAnnotationBlockSave(annotation.id);
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const payload = applyAnnotationBlocksLocally(annotation, blocks, legacy);
  return persistAnnotationBlocks(payload, options);
}

async function persistAnnotationBlocks(annotation, options = {}, revision = null, docId = state.docId) {
  const updated = annotationWithRuntimeInk(await storage.updateAnnotation(docId, annotation.id, annotationForStorage(annotation)));
  if (state.docId === docId && (revision === null || state.annotationBlockSaveRevisions.get(annotation.id) === revision)) {
    state.annotations = state.annotations.map((item) => item.id === annotation.id ? updated : item);
    state.activeAnnotationId = annotation.id;
  }
  if (options.render === false) return updated;
  renderAnnotations();
  renderNoteList();
  return updated;
}

function applyAnnotationBlocksLocally(annotation, blocks, legacy = legacyNoteFieldsFromBlocks(blocks)) {
  const updated = {
    ...annotation,
    note: {
      ...(annotation.note || {}),
      schemaVersion: 2,
      ...legacy,
      blocks
    }
  };
  state.annotations = state.annotations.map((item) => item.id === annotation.id ? updated : item);
  state.activeAnnotationId = annotation.id;
  return updated;
}

function annotationForStorage(annotation) {
  if (!annotation?.note) return annotation;
  const blocks = Array.isArray(annotation.note.blocks) ? blocksForStorage(annotation.note.blocks) : [];
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  return {
    ...annotation,
    note: {
      ...annotation.note,
      schemaVersion: 2,
      ...legacy,
      blocks
    }
  };
}

function annotationWithRuntimeInk(annotation) {
  if (!annotation?.note) return annotation;
  const blocks = sideNoteContentBlocks(annotation);
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  return {
    ...annotation,
    note: {
      ...annotation.note,
      schemaVersion: 2,
      ...legacy,
      blocks
    }
  };
}

function blocksForStorage(blocks) {
  return blocks.map((block) => {
    if (block?.type === 'ink') return { id: block.id, type: 'ink', ink: encodeInkForStorage(block.ink) };
    if (block?.type === 'text') return { id: block.id, type: 'text', markdown: block.markdown || '' };
    if (block?.type === 'blank') return { id: block.id, type: 'blank' };
    if (block?.type === 'image') return { ...block };
    return block;
  }).filter(Boolean);
}

function queueSaveAnnotationBlocks(annotation, blocks, options = {}) {
  const key = annotation.id;
  const docId = state.docId;
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const payload = applyAnnotationBlocksLocally(annotation, blocks, legacy);
  const revision = (state.annotationBlockSaveRevisions.get(key) || 0) + 1;
  state.annotationBlockSaveRevisions.set(key, revision);
  const delayMs = Math.max(0, Number(options.delayMs) || 0);
  const waitForInkIdle = options.waitForInkIdle === true;
  return new Promise((resolve, reject) => {
    const existingTimer = state.sideInkSaveTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer.timer);
      existingTimer.resolve?.(payload);
    }
    let enqueued = false;
    const enqueue = (force = false) => {
      if (enqueued) return;
      if (!force && waitForInkIdle && state.sideInkSession) {
        const timer = setTimeout(enqueue, delayMs || INK_SAVE_IDLE_DELAY_MS);
        state.sideInkSaveTimers.set(key, { timer, resolve, reject, flush: () => enqueue(true) });
        return;
      }
      enqueued = true;
      state.sideInkSaveTimers.delete(key);
      const previous = state.annotationBlockSaveQueues.get(key) || Promise.resolve();
      const next = previous
        .catch(() => {})
        .then(() => persistAnnotationBlocks(payload, options, revision, docId));
      const queued = next.finally(() => {
        if (state.annotationBlockSaveQueues.get(key) === queued) {
          state.annotationBlockSaveQueues.delete(key);
        }
      });
      state.annotationBlockSaveQueues.set(key, queued);
      queued.then(resolve, reject);
    };
    if (delayMs || waitForInkIdle) {
      const timer = setTimeout(enqueue, delayMs || INK_SAVE_IDLE_DELAY_MS);
      state.sideInkSaveTimers.set(key, { timer, resolve, reject, flush: () => enqueue(true) });
    } else {
      enqueue();
    }
  });
}

async function flushPendingAnnotationBlockSave(annotationId) {
  const pendingTimer = state.sideInkSaveTimers.get(annotationId);
  if (pendingTimer) {
    clearTimeout(pendingTimer.timer);
    pendingTimer.flush?.();
  }
  const pending = state.annotationBlockSaveQueues.get(annotationId);
  if (pending) await pending;
}

async function flushAllPendingAnnotationBlockSaves() {
  const ids = new Set([
    ...state.sideInkSaveTimers.keys(),
    ...state.annotationBlockSaveQueues.keys()
  ]);
  await Promise.all([...ids].map((annotationId) => flushPendingAnnotationBlockSave(annotationId)));
}

function annotationHighlightTargets(annotation) {
  const targets = [];
  if (annotation.highlight?.enabled && ['text', 'pdf-rect'].includes(annotation.target?.type)) {
    targets.push({ target: annotation.target, index: 0 });
  }
  for (const [index, target] of (annotation.targets || []).entries()) {
    if (['text', 'pdf-rect'].includes(target?.type)) {
      targets.push({ target, index: index + 1 });
    }
  }
  return targets;
}

function toggleFocusMode(annotationId) {
  if (!compatibilityFeatureEnabled('focusMode')) {
    setStatus('Focus mode is unavailable for this document.', true);
    return;
  }
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const pinned = state.pinnedAnnotationId === annotationId;
  if (state.focusModeAnnotationId === annotationId) {
    clearFocusModeState();
  } else {
    const doc = getFrameDoc();
    const anchor = annotationAnchorElement(doc, annotation);
    const noteTop = pinned ? null : currentSideNoteTop(annotationId) ?? sideNotePosition(doc, annotation)?.top ?? null;
    const noteViewportTop = Number.isFinite(noteTop) ? noteTop - doc.defaultView.scrollY : null;
    state.focusModeAnnotationId = annotationId;
    state.focusModeNoteTop = noteTop;
    state.focusModeAnchorTop = anchor ? doc.defaultView.scrollY + anchor.getBoundingClientRect().top : null;
    state.focusModeNoteViewportTop = noteViewportTop;
    state.focusModeAnchorViewportTop = anchor ? anchor.getBoundingClientRect().top : null;
    hideSelectionHighlightButton();
    if (state.mode === 'blank-note') setMode('select');
    if (state.mode === 'remove-highlight') setMode('select');
  }
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  setStatus(state.focusModeAnnotationId ? 'Focus mode enabled.' : 'Focus mode disabled.');
}

function clearFocusModeState() {
  state.focusModeAnnotationId = null;
  state.focusModeNoteTop = null;
  state.focusModeAnchorTop = null;
  state.focusModeNoteViewportTop = null;
  state.focusModeAnchorViewportTop = null;
}

function currentSideNoteTop(annotationId) {
  if (!state.iframeLoaded) return null;
  const doc = getFrameDoc();
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  if (!note) return null;
  return doc.defaultView.scrollY + note.getBoundingClientRect().top;
}

async function attachTargetToActiveAnnotation(target) {
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) return;
  const annotationId = state.attachTargetAnnotationId || state.activeAnnotationId;
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || target.type !== 'text') return;
  const newTarget = { ...target };
  delete newTarget.clientRect;
  const before = cloneAnnotation(annotation);
  const payload = {
    ...annotation,
    targets: [...(annotation.targets || []), newTarget]
  };
  const updated = await storage.updateAnnotation(state.docId, annotationId, payload);
  recordAnnotationHistory('highlight attachment', before, updated, annotationId);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? updated : item);
  state.activeAnnotationId = annotationId;
  state.attachTargetAnnotationId = annotationId;
  state.removeTargetAnnotationId = null;
  getFrameDoc().getSelection()?.removeAllRanges();
  renderAnnotations();
  renderNoteList();
  setStatus('Highlight attached. Select more text, or press Escape to finish.');
}

function startAttachHighlightMode(annotationId) {
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) {
    setStatus('Text highlights are unavailable for this document.', true);
    return;
  }
  if (state.mode === 'attach-highlight' && state.attachTargetAnnotationId === annotationId) {
    setMode('select');
    syncActiveAnnotationState();
    renderNoteList();
    return;
  }
  state.activeAnnotationId = annotationId;
  state.attachTargetAnnotationId = annotationId;
  state.removeTargetAnnotationId = null;
  hideSelectionHighlightButton();
  setMode('attach-highlight');
  renderAnnotations();
  renderNoteList();
  syncActiveAnnotationState();
  setStatus('Select text to attach it to this note. Press Escape to finish.');
}

function startRemoveHighlightMode(annotationId) {
  if (!compatibilityFeatureEnabled('singleBlockTextHighlights')) {
    setStatus('Text highlights are unavailable for this document.', true);
    return;
  }
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !annotationHighlightTargets(annotation).length) return;
  if (state.mode === 'remove-highlight' && state.removeTargetAnnotationId === annotationId) {
    setMode('select');
    syncActiveAnnotationState();
    renderNoteList();
    return;
  }
  state.activeAnnotationId = annotationId;
  state.removeTargetAnnotationId = annotationId;
  state.attachTargetAnnotationId = null;
  hideSelectionHighlightButton();
  setMode('remove-highlight');
  renderAnnotations();
  renderNoteList();
  syncActiveAnnotationState();
  setStatus('Click one of this note’s highlighted passages to remove it. Press Escape to finish.');
}

async function removeHighlightFromActiveAnnotation(highlightElement) {
  const annotationId = state.removeTargetAnnotationId || state.activeAnnotationId;
  const clickedAnnotationId = highlightElement?.dataset?.annotationId;
  if (!annotationId || clickedAnnotationId !== annotationId) {
    setStatus('Click a highlight attached to the selected note.', true);
    return;
  }
  const targetIndex = Number(highlightElement.dataset.targetIndex || 0);
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !Number.isInteger(targetIndex)) return;
  const before = cloneAnnotation(annotation);
  const payload = annotationWithRemovedHighlight(annotation, targetIndex);
  const updated = await storage.updateAnnotation(state.docId, annotationId, payload);
  recordAnnotationHistory('highlight removal', before, updated, annotationId);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? updated : item);
  state.activeAnnotationId = annotationId;
  const remainingHighlights = annotationHighlightTargets(updated);
  if (!remainingHighlights.length) {
    if (state.focusModeAnnotationId === annotationId) {
      state.focusModeAnnotationId = null;
      state.focusModeNoteTop = null;
      state.focusModeAnchorTop = null;
      state.focusModeNoteViewportTop = null;
      state.focusModeAnchorViewportTop = null;
    }
    setMode('select');
  }
  getFrameDoc().getSelection()?.removeAllRanges();
  renderAnnotations();
  renderNoteList();
  setStatus(remainingHighlights.length ? 'Highlight removed. Click another highlight, or press Escape to finish.' : 'Highlight removed.');
}

function annotationWithRemovedHighlight(annotation, targetIndex) {
  const payload = structuredClone(annotation);
  if (targetIndex === 0) {
    const attachedTargets = payload.targets || [];
    if (attachedTargets.length) {
      payload.target = attachedTargets[0];
      payload.targets = attachedTargets.slice(1);
      payload.highlight = { ...(payload.highlight || {}), enabled: true };
    } else {
      payload.highlight = { ...(payload.highlight || {}), enabled: false };
    }
    return payload;
  }
  payload.targets = (payload.targets || []).filter((_, index) => index + 1 !== targetIndex);
  return payload;
}

async function createBlankSideNoteAt(event) {
  if (isFocusModeActive()) {
    setStatus('Disable focus mode before creating a new note.', true);
    return;
  }
  if (!compatibilityFeatureEnabled('blockNotes')) {
    setStatus('Block notes are unavailable for this document.', true);
    return;
  }
  const doc = getFrameDoc();
  const documentY = doc.defaultView.scrollY + event.clientY;
  const block = nearestAnchorForDocumentY(doc, documentY);
  if (!block) return;
  const anchorId = getAnchorId(block);
  const blockRect = block.getBoundingClientRect();
  const anchorTop = doc.defaultView.scrollY + blockRect.top;
  const isPdf = state.currentDocument?.sourceType === 'pdf';
  const pageIndex = Number(block.dataset.pdfPageIndex);
  const normalizedX = blockRect.width ? clampNumber((event.clientX - blockRect.left) / blockRect.width, 0, 1, 0) : 0;
  const normalizedY = blockRect.height ? clampNumber((event.clientY - blockRect.top) / blockRect.height, 0, 1, 0) : 0;
  const payload = {
    target: {
      type: isPdf ? 'pdf-page-point' : 'block',
      pageId: pageIdForElement(block),
      anchorId,
      domPath: anchorId ? null : domPathFor(block),
      pageIndex: isPdf && Number.isFinite(pageIndex) ? pageIndex : null,
      pageLabel: isPdf ? block.dataset.pdfPageLabel || String((Number.isFinite(pageIndex) ? pageIndex : 0) + 1) : null,
      x: isPdf ? Number(normalizedX.toFixed(6)) : null,
      y: isPdf ? Number(normalizedY.toFixed(6)) : null,
      exact: '',
      clientHint: {
        x: event.clientX,
        y: event.clientY,
        documentY,
        anchorOffsetY: documentY - anchorTop
      }
    },
    highlight: { enabled: false, color: 'yellow' },
    note: defaultBlankNote(),
    display: { mode: 'side', collapsed: true }
  };
  const annotation = await storage.createAnnotation(state.docId, payload);
  state.annotations = [...state.annotations, annotation];
  state.activeAnnotationId = annotation.id;
  recordAnnotationHistory('note creation', null, annotation, annotation.id);
  renderAnnotations();
  renderNoteList();
  editAnnotationInline(annotation.id, false);
}

function nearestAnchorForDocumentY(doc, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const block of doc.querySelectorAll(ANCHOR_SELECTOR)) {
    const rect = block.getBoundingClientRect();
    const top = doc.defaultView.scrollY + rect.top;
    const bottom = doc.defaultView.scrollY + rect.bottom;
    const distance = y < top ? top - y : y > bottom ? y - bottom : 0;
    if (distance < bestDistance) {
      best = block;
      bestDistance = distance;
    }
  }
  return best;
}

function beginInlineTextEdit(annotationId, note, focusField = 'body', pointerEvent = null, requestedBlockId = '') {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const title = note.querySelector('.reader-side-note-title');
  const bodies = Array.from(note.querySelectorAll('.reader-side-note-body'));
  const clickedBody = pointerEvent?.target?.closest?.('.reader-side-note-body');
  const body = bodies.includes(clickedBody)
    ? clickedBody
    : bodies.find((item) => item.dataset.blockId === requestedBlockId) || bodies[0] || null;
  if (!body && focusField !== 'title') return;
  const field = focusField === 'title' && title ? title : body;
  if (!field) return;
  const existing = note.querySelector('.reader-side-note-title[contenteditable], .reader-side-note-body[contenteditable]');
  if (existing && existing !== field) {
    finishInlineTextEdit(annotationId, note)
      .then(() => {
        const rerendered = getFrameDoc().querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
        if (rerendered) beginInlineTextEdit(annotationId, rerendered, focusField, pointerEvent, requestedBlockId);
      })
      .catch((error) => setStatus(error.message, true));
    return;
  }
  if (field.isContentEditable) {
    field.focus({ preventScroll: true });
    if (!editableSelectionActive(field)) placeCaretFromPoint(field, pointerEvent);
    return;
  }
  note.classList.add('is-editing');
  let modeButton = null;
  if (field === body) {
    const block = sideNoteBlockById(annotation, body.dataset.blockId);
    if (block?.type !== 'text') return;
    body.textContent = block.markdown;
    body.classList.remove('is-rendered', 'note-markdown');
    body.tabIndex = 0;
    modeButton = body.closest('.reader-side-note-text-block')?.querySelector('.reader-side-note-text-mode') || null;
    if (modeButton) {
      modeButton.dataset.sideNoteAction = 'render-text';
      modeButton.textContent = 'Render';
      modeButton.hidden = false;
      setSideNoteRenderFeedback(modeButton, '');
    }
  }
  field.contentEditable = 'plaintext-only';
  field.dataset.originalText = editablePlainText(field);
  field.focus({ preventScroll: true });
  placeCaretFromPoint(field, pointerEvent);

  const onInput = () => {
    requestSideNoteLayout(note.ownerDocument);
    if (field !== body || !modeButton) return;
    setSideNoteRenderFeedback(modeButton, '');
    const previousTimer = state.noteMarkdownAnalysisTimers.get(body);
    if (previousTimer) clearTimeout(previousTimer);
    const timer = setTimeout(async () => {
      const source = editablePlainText(body);
      try {
        const analysis = await analyzeNoteMarkdown(source);
        if (!body.isConnected || !body.isContentEditable || editablePlainText(body) !== source) return;
        modeButton.hidden = false;
        body.dataset.hasRenderableSyntax = analysis.hasRenderableSyntax ? 'true' : 'false';
      } catch {
        modeButton.hidden = false;
      }
    }, 120);
    state.noteMarkdownAnalysisTimers.set(body, timer);
  };
  const onKeyDown = (event) => {
    if (field === body && event.key === 'Tab' && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      insertTextAtEditableSelection(field, '\t');
      return;
    }
    if (event.key === 'Escape') {
      field.textContent = field.dataset.originalText || '';
      note.dataset.cancelInlineSave = 'true';
      event.preventDefault();
      event.currentTarget.blur();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };
  const onBlur = () => {
    window.setTimeout(() => {
      if (field === note.ownerDocument.activeElement) return;
      finishInlineTextEdit(annotationId, note).catch((error) => setStatus(error.message, true));
    }, 0);
  };
  field.addEventListener('input', onInput);
  field.addEventListener('keydown', onKeyDown);
  field.addEventListener('blur', onBlur, { once: true });
}

function insertTextAtEditableSelection(element, text) {
  const doc = element?.ownerDocument;
  const selection = doc?.getSelection?.();
  if (!doc || !selection) return false;
  let range = selection.rangeCount ? selection.getRangeAt(0) : null;
  if (!range || !element.contains(range.commonAncestorContainer)) {
    range = doc.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
  }
  range.deleteContents();
  const textNode = doc.createTextNode(String(text || ''));
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  const InputEventCtor = doc.defaultView?.InputEvent || doc.defaultView?.Event;
  if (InputEventCtor) {
    element.dispatchEvent(new InputEventCtor('input', {
      bubbles: true,
      inputType: 'insertText',
      data: String(text || '')
    }));
  }
  return true;
}

async function tryRenderInlineTextBlock(annotationId, note, modeButton) {
  const blockId = modeButton?.dataset?.blockId || '';
  const body = note?.querySelector?.(`.reader-side-note-body[data-block-id="${cssEscape(blockId)}"]`);
  if (!body?.isContentEditable) return;
  const source = editablePlainText(body);
  const rendered = await renderNoteMarkdown(source);
  if (!body.isConnected || !body.isContentEditable || editablePlainText(body) !== source) return;
  body.dataset.hasRenderableSyntax = rendered.hasRenderableSyntax ? 'true' : 'false';
  if (!rendered.hasRenderableSyntax) {
    setSideNoteRenderFeedback(modeButton, 'No markdown to render');
    body.focus({ preventScroll: true });
    return;
  }
  setSideNoteRenderFeedback(modeButton, '');
  await finishInlineTextEdit(annotationId, note);
}

async function finishInlineTextEdit(annotationId, note) {
  const field = note.querySelector('.reader-side-note-title[contenteditable], .reader-side-note-body[contenteditable]');
  if (!field) return;
  const isTitle = field.classList.contains('reader-side-note-title');
  const blockId = field.dataset.blockId || '';
  const value = editablePlainText(field);
  field.removeAttribute('contenteditable');
  note.classList.remove('is-editing');
  if (note.dataset.cancelInlineSave === 'true') {
    delete note.dataset.cancelInlineSave;
    renderAnnotations();
    flushDeferredPdfFullRefresh(note.ownerDocument);
    return;
  }
  await saveInlineNoteField(annotationId, { title: isTitle ? value : undefined, blockId, markdown: isTitle ? undefined : value });
}

async function saveInlineNoteField(annotationId, update = {}) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  await flushPendingAnnotationBlockSave(annotationId);
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  if (update.blockId) {
    const block = blocks.find((item) => item.id === update.blockId);
    if (block?.type !== 'text') return;
    block.markdown = String(update.markdown || '');
  }
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const payload = {
    ...annotation,
    note: {
      ...annotation.note,
      title: update.title === undefined ? annotation.note?.title || '' : String(update.title || ''),
      schemaVersion: 2,
      ...legacy,
      blocks
    }
  };
  const updated = await storage.updateAnnotation(state.docId, annotationId, payload);
  recordAnnotationHistory('note edit', before, updated, annotationId);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? updated : item);
  state.activeAnnotationId = annotationId;
  renderAnnotations();
  renderNoteList();
  setStatus('Annotation saved.');
}

function renderNoteList(options = {}) {
  const scrollAnchor = captureNavigatorScrollAnchor(options.anchorAnnotationId);
  const focusSnapshot = captureNavigatorFocus();
  els.noteCount.textContent = `${state.annotations.length} annotation${state.annotations.length === 1 ? '' : 's'} in this document.`;
  if (els.expandAllNotesBtn) {
    els.expandAllNotesBtn.textContent = state.noteNavigatorExpandAll ? 'Collapse all' : 'Expand all';
    els.expandAllNotesBtn.disabled = !state.annotations.length;
    els.expandAllNotesBtn.setAttribute('aria-expanded', String(state.noteNavigatorExpandAll));
  }
  if (!state.annotations.length) {
    els.noteList.innerHTML = '<p class="small">No annotations yet.</p>';
    return;
  }
  els.noteList.textContent = '';
  const sortedAnnotations = state.annotations
    .slice()
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  for (const annotation of sortedAnnotations) {
    els.noteList.append(createNavigatorNoteCard(annotation));
  }
  restoreNavigatorScrollAnchor(scrollAnchor);
  restoreNavigatorFocus(focusSnapshot);
  requestNavigatorInkPreviewRedraw();
}

function renderNavigatorNoteCards(annotationIds) {
  if (!els.noteList || !state.annotations.length) return;
  const ids = [...new Set(annotationIds || [])].filter(Boolean);
  if (!ids.length) return;
  for (const annotationId of ids) {
    const annotation = state.annotations.find((item) => item.id === annotationId);
    if (!annotation) continue;
    const existing = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(annotationId)}"]`);
    if (!existing) {
      renderNoteList({ anchorAnnotationId: annotationId });
      return;
    }
    if (existing.querySelector('.note-card-title.is-editing')) continue;
    existing.replaceWith(createNavigatorNoteCard(annotation));
  }
  requestNavigatorInkPreviewRedraw();
}

function createNavigatorNoteCard(annotation) {
  const card = document.createElement('article');
  const resolution = annotationResolution(annotation);
  const pendingNotice = state.pdfPendingJumpNotice?.annotationId === annotation.id
    && performance.now() < state.pdfPendingJumpNotice.until
    ? state.pdfPendingJumpNotice
    : null;
  const pendingJump = state.pendingPdfAnnotationJump?.annotationId === annotation.id
    ? state.pendingPdfAnnotationJump
    : pendingNotice;
  card.className = [
    'note-card',
    annotation.id === state.activeAnnotationId ? 'is-active' : '',
    resolution?.status === 'unresolved' ? 'is-unresolved' : '',
    pendingJump ? 'is-target-pending' : ''
  ].filter(Boolean).join(' ');
  card.dataset.annotationId = annotation.id;
  if (pendingJump) card.dataset.targetPendingPage = String(pendingJump.pageNumber);
  if (isNavigatorNoteExpanded(annotation.id)) card.classList.add('is-expanded');

  const header = document.createElement('div');
  header.className = 'note-card-header';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'note-card-heading';
  const title = document.createElement('p');
  title.className = 'note-card-title';
  title.textContent = annotationTitle(annotation);
  title.tabIndex = 0;
  title.title = 'Edit title';
  title.addEventListener('keydown', (event) => {
    if (!['Enter', 'F2'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    beginNavigatorTitleEdit(annotation.id, title);
  });
  const meta = document.createElement('div');
  meta.className = 'note-card-meta';
  meta.textContent = pendingJump
    ? `Loading page ${pendingJump.pageNumber}...`
    : resolution?.status === 'unresolved'
    ? unresolvedAnnotationLabel(annotation)
    : annotationSectionLabel(annotation);
  titleWrap.append(title, meta);

  const expandButton = document.createElement('button');
  expandButton.type = 'button';
  expandButton.className = 'note-card-expand';
  expandButton.dataset.action = 'toggle-expand';
  expandButton.textContent = navigatorExpandButtonLabel(annotation.id);
  expandButton.title = expandButton.textContent;
  expandButton.setAttribute('aria-expanded', String(isNavigatorNoteExpanded(annotation.id)));
  expandButton.setAttribute('aria-controls', navigatorContentId(annotation.id));

  const actions = document.createElement('div');
  actions.className = 'note-card-actions';
  actions.append(
    expandButton,
    createNoteCardButton('goto', 'Go to', 'Jump to note'),
    createNoteCardButton('delete', 'Delete', 'Delete note', 'danger')
  );
  header.append(titleWrap, actions);
  card.append(header);

  if (isNavigatorNoteExpanded(annotation.id)) {
    const content = createNavigatorNoteContent(annotation);
    if (content) card.append(content);
  }

  card.addEventListener('click', (event) => {
    const action = event.target?.closest?.('[data-action]')?.dataset.action;
    const titleTarget = event.target?.closest?.('.note-card-title');
    if (titleTarget) {
      event.stopPropagation();
      beginNavigatorTitleEdit(annotation.id, titleTarget, event);
      return;
    }
    if (!action) {
      return;
    }
    event.stopPropagation();
    if (action === 'toggle-expand') toggleNavigatorNoteExpansion(annotation.id);
    if (action === 'goto') activateAnnotation(annotation.id, true);
    if (action === 'delete') requestDeleteAnnotation(annotation.id, event.target);
  });

  return card;
}

function createNoteCardButton(action, label, title, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.action = action;
  button.title = title;
  button.textContent = label;
  if (className) button.className = className;
  return button;
}

function beginNavigatorTitleEdit(annotationId, titleElement, pointerEvent = null) {
  if (!annotationId || !titleElement || titleElement.isContentEditable) return;
  titleElement.contentEditable = 'plaintext-only';
  titleElement.dataset.originalText = titleElement.textContent;
  titleElement.classList.add('is-editing');
  titleElement.focus({ preventScroll: true });
  placeCaretFromPoint(titleElement, pointerEvent);

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      titleElement.textContent = titleElement.dataset.originalText || '';
      titleElement.dataset.cancelTitleSave = 'true';
      event.preventDefault();
      titleElement.blur();
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      titleElement.blur();
    }
  };
  const onBlur = () => {
    titleElement.removeEventListener('keydown', onKeyDown);
    titleElement.removeEventListener('blur', onBlur);
    finishNavigatorTitleEdit(annotationId, titleElement).catch((error) => setStatus(error.message, true));
  };
  titleElement.addEventListener('keydown', onKeyDown);
  titleElement.addEventListener('blur', onBlur);
}

async function finishNavigatorTitleEdit(annotationId, titleElement) {
  const cancelled = titleElement.dataset.cancelTitleSave === 'true';
  delete titleElement.dataset.cancelTitleSave;
  delete titleElement.dataset.originalText;
  titleElement.removeAttribute('contenteditable');
  titleElement.classList.remove('is-editing');
  if (cancelled) return;
  await saveNavigatorNoteTitle(annotationId, titleElement.textContent || '');
}

async function saveNavigatorNoteTitle(annotationId, title) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  await flushPendingAnnotationBlockSave(annotationId);
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  const legacy = legacyNoteFieldsFromBlocks(blocks);
  const payload = {
    ...annotation,
    note: {
      ...annotation.note,
      title,
      ...legacy,
      blocks
    }
  };
  const updated = await storage.updateAnnotation(state.docId, annotationId, payload);
  recordAnnotationHistory('title edit', before, updated, annotationId);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? updated : item);
  renderAnnotations();
  renderNoteList({ anchorAnnotationId: annotationId });
  setStatus('Annotation title saved.');
}

function createNavigatorNoteContent(annotation) {
  const content = document.createElement('div');
  content.className = 'note-card-content';
  content.id = navigatorContentId(annotation.id);
  const blocks = sideNoteContentBlocks(annotation);
  let hasContent = false;
  for (const [index, block] of blocks.entries()) {
    if (block.type === 'text') {
      if (!block.markdown?.trim()) continue;
      const text = document.createElement('div');
      text.className = 'note-card-content-text note-markdown';
      text.dataset.blockId = block.id;
      text.textContent = block.markdown || '';
      content.append(text);
      renderNavigatorMarkdownBlock(text, block.id, block.markdown || '');
      hasContent = true;
      continue;
    }
    if (block.type === 'ink') {
      if (!block.ink?.strokes?.length) continue;
      const wrap = document.createElement('div');
      wrap.className = 'note-card-ink-wrap';
      const canvas = document.createElement('canvas');
      canvas.className = 'note-card-ink';
      canvas.dataset.annotationId = annotation.id;
      canvas.dataset.blockId = block.id;
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', drawingCanvasLabel(annotation, block));
      wrap.append(canvas);
      content.append(wrap);
      requestAnimationFrame(() => drawInkPreview(canvas, block.ink));
      hasContent = true;
      continue;
    }
    if (block.type === 'image') {
      const imageBlock = createSideNoteImageBlock(document, annotation, block);
      imageBlock.classList.add('note-card-image-block');
      content.append(imageBlock);
      hasContent = true;
      continue;
    }
  }
  if (!hasContent) {
    const empty = document.createElement('div');
    empty.className = 'note-card-content-empty';
    empty.textContent = sideNoteTitle(annotation).trim() ? 'No note body.' : 'Empty note';
    content.append(empty);
  }
  return content;
}

async function renderNavigatorMarkdownBlock(element, blockId, source) {
  try {
    const rendered = await renderNoteMarkdown(source);
    if (!element.isConnected || element.dataset.blockId !== blockId) return;
    ensureNoteMarkdownStyles(element.ownerDocument);
    element.innerHTML = rendered.html;
  } catch {
    if (element.isConnected) element.textContent = source;
  }
}

function navigatorContentId(annotationId) {
  return `note-card-content-${String(annotationId || '').replace(/[^\w.-]+/g, '-')}`;
}

function captureNavigatorFocus() {
  const active = document.activeElement;
  const card = active?.closest?.('.note-card[data-annotation-id]');
  if (!card || !els.noteList.contains(active)) return null;
  return {
    annotationId: card.dataset.annotationId,
    action: active.dataset?.action || '',
    title: active.classList?.contains('note-card-title') || false
  };
}

function restoreNavigatorFocus(snapshot) {
  if (!snapshot?.annotationId) return;
  const card = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(snapshot.annotationId)}"]`);
  const target = snapshot.title
    ? card?.querySelector('.note-card-title')
    : snapshot.action
      ? card?.querySelector(`[data-action="${cssEscape(snapshot.action)}"]`)
      : null;
  target?.focus?.({ preventScroll: true });
}

function isNavigatorNoteExpanded(annotationId) {
  return state.noteNavigatorExpandAll || state.expandedNavigatorNoteIds.has(annotationId);
}

function navigatorExpandButtonLabel(annotationId) {
  if (state.noteNavigatorExpandAll) return 'Collapse others';
  return state.expandedNavigatorNoteIds.has(annotationId) ? 'Collapse' : 'Expand';
}

function toggleExpandAllNotes() {
  state.noteNavigatorExpandAll = !state.noteNavigatorExpandAll;
  if (state.noteNavigatorExpandAll) {
    state.expandedNavigatorNoteIds.clear();
  }
  renderNoteList();
}

function toggleNavigatorNoteExpansion(annotationId) {
  if (state.noteNavigatorExpandAll) {
    state.noteNavigatorExpandAll = false;
    state.expandedNavigatorNoteIds = new Set([annotationId]);
    renderNoteList({ anchorAnnotationId: annotationId });
    return;
  }
  if (state.expandedNavigatorNoteIds.has(annotationId)) {
    state.expandedNavigatorNoteIds.delete(annotationId);
  } else {
    state.expandedNavigatorNoteIds.add(annotationId);
  }
  renderNoteList({ anchorAnnotationId: annotationId });
}

function captureNavigatorScrollAnchor(annotationId) {
  if (!annotationId || !els.noteDrawerBody) return null;
  const card = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(annotationId)}"]`);
  if (!card) return null;
  return {
    annotationId,
    top: card.getBoundingClientRect().top,
    scroller: els.noteDrawerBody
  };
}

function restoreNavigatorScrollAnchor(anchor) {
  if (!anchor?.scroller || !anchor.annotationId) return;
  const card = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(anchor.annotationId)}"]`);
  if (!card) return;
  const delta = card.getBoundingClientRect().top - anchor.top;
  if (Math.abs(delta) > 0.5) anchor.scroller.scrollTop += delta;
}

function annotationTitle(annotation) {
  if (annotation.note?.title) return annotation.note.title;
  const markdown = sideNoteText(annotation).trim();
  if (markdown) return readableSnippet(markdown, 240);
  const strokes = sideNoteContentBlocks(annotation)
    .filter((block) => block.type === 'ink')
    .reduce((count, block) => count + block.ink.strokes.length, 0);
  if (strokes) return `Drawing note (${strokes} stroke${strokes === 1 ? '' : 's'})`;
  const picture = sideNoteContentBlocks(annotation).find((block) => block.type === 'image');
  if (picture) return picture.alt?.trim() || picture.originalName?.trim() || 'Picture note';
  return 'Empty side note';
}

function annotationSectionLabel(annotation) {
  const doc = state.iframeLoaded ? getFrameDoc() : null;
  if (!doc) return 'Document';
  const sourceElement = annotationSourceElement(doc, annotation);
  if (state.currentDocument?.sourceType === 'pdf') return pdfAnnotationLocationLabel(annotation, sourceElement);
  return documentLocationLabel(sourceElement || doc.body);
}

function pdfAnnotationLocationLabel(annotation, sourceElement) {
  const target = primaryAnnotationTarget(annotation);
  const pageLabel = target?.pageLabel || sourceElement?.dataset?.pdfPageLabel || '';
  if (pageLabel) return `Page ${pageLabel}`;
  const pageIndex = Number(target?.pageIndex ?? sourceElement?.dataset?.pdfPageIndex);
  if (Number.isFinite(pageIndex)) return `Page ${pageIndex + 1}`;
  return 'PDF';
}

function unresolvedAnnotationLabel(annotation) {
  const reason = annotationResolution(annotation)?.unresolvedReason;
  if (reason === 'anchor-not-found') return 'Unresolved target: anchor not found';
  if (reason === 'quote-mismatch') return 'Unresolved highlight: text changed';
  if (reason === 'quote-not-found') return 'Unresolved highlight: quoted text not found';
  if (reason === 'invalid-position') return 'Unresolved highlight: stored offsets are invalid';
  return 'Unresolved target';
}

function annotationSourceElement(doc, annotation) {
  const anchor = annotationAnchorElement(doc, annotation);
  if (anchor) return closestAnchorElement(anchor) || anchor;
  const target = primaryAnnotationTarget(annotation);
  const targetElement = resolveTargetElement(doc, target);
  return targetElement ? closestAnchorElement(targetElement) || targetElement : null;
}

function primaryAnnotationTarget(annotation) {
  return annotation?.target || annotation?.targets?.[0] || null;
}

function nearestSectionHeading(element) {
  const doc = element.ownerDocument;
  let cursor = closestAnchorElement(element) || element;
  const containingSection = cursor.closest?.('section, article');
  if (containingSection) {
    const sectionHeading = containingSection.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');
    if (sectionHeading) return sectionHeading;
  }
  while (cursor && cursor !== doc.body) {
    let sibling = cursor.previousElementSibling;
    while (sibling) {
      if (sibling.matches?.(HEADING_SELECTOR)) return sibling;
      const nestedHeadings = sibling.querySelectorAll?.(HEADING_SELECTOR);
      if (nestedHeadings?.length) return nestedHeadings[nestedHeadings.length - 1];
      sibling = sibling.previousElementSibling;
    }
    cursor = cursor.parentElement;
    if (cursor?.matches?.(HEADING_SELECTOR)) return cursor;
  }
  return doc.querySelector(HEADING_SELECTOR);
}

function documentStructureLabel(element) {
  const navLabel = documentNavigationLabel(element);
  if (navLabel) return navLabel;
  const doc = element.ownerDocument;
  const scope = element.closest?.('main') || doc.body;
  const headings = Array.from(scope.querySelectorAll(HEADING_SELECTOR))
    .filter((heading) => heading === element || (heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING));
  const path = [];
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    const label = readableSnippet(heading.innerText || textContent(heading), 80);
    if (!label) continue;
    path[level - 1] = label;
    path.length = level;
  }
  if (!path.length) {
    const nearest = nearestSectionHeading(element);
    const label = readableSnippet(textContent(nearest), 120);
    return label || 'Untitled section';
  }
  return readableSnippet(path.join(' / '), 160);
}

function documentLocationLabel(element) {
  const sectionLabel = documentStructureLabel(element);
  const pageLabel = documentPageLabel(element);
  if (!pageLabel) return sectionLabel;
  if (!sectionLabel || sectionLabel === 'Document') return pageLabel;
  if (labelsEquivalent(pageLabel, sectionLabel)) return pageLabel;
  return readableSnippet(`${pageLabel} / ${sectionLabel}`, 180);
}

function documentPageLabel(element) {
  const doc = element?.ownerDocument;
  if (!doc) return '';
  const pageElement = element.closest?.('[data-page-id]') || element.closest?.('.annotator-page');
  const pages = currentDocumentPages();
  const hasMultiplePages = pages.length > 1 || doc.querySelectorAll('.annotator-page[data-page-id], article[data-page-id]').length > 1;
  if (!hasMultiplePages || !pageElement) return '';
  const pageId = pageElement.dataset.pageId || pageElement.id?.replace(/^annotator-page-/, '') || '';
  const pageMeta = pages.find((page) => page.id === pageId);
  const title = pageMeta?.title
    || pageElement.querySelector(':scope > .annotator-page-heading h1, :scope > header h1, :scope > h1')?.textContent
    || pageId;
  return normalizeStructureLabel(title);
}

function currentDocumentPages() {
  const documentMeta = state.documents.find((doc) => doc.id === state.docId);
  if (Array.isArray(documentMeta?.pages)) return documentMeta.pages;
  return Array.isArray(state.currentDocument?.pages) ? state.currentDocument.pages : [];
}

function labelsEquivalent(a, b) {
  return normalizeStructureLabel(a).toLowerCase() === normalizeStructureLabel(b).toLowerCase();
}

function documentNavigationLabel(element) {
  const heading = nearestPrecedingHeading(element);
  const headingId = getAnchorId(heading);
  if (!headingId) return '';
  const doc = element.ownerDocument;
  const navLink = doc.querySelector(`.page-nav a[href="#${cssEscape(headingId)}"]`);
  if (!navLink) return '';
  const labels = [];
  let cursor = navLink;
  while (cursor && cursor !== doc.body) {
    if (cursor.matches?.('details')) {
      const summary = cursor.querySelector(':scope > summary');
      if (summary) labels.unshift(normalizeStructureLabel(summary.innerText || textContent(summary)));
    }
    cursor = cursor.parentElement;
  }
  labels.push(normalizeStructureLabel(navLink.innerText || textContent(navLink)));
  const uniqueLabels = labels.filter((label, index) => label && label !== labels[index - 1]);
  return readableSnippet(uniqueLabels.join(' / '), 160);
}

function nearestPrecedingHeading(element) {
  const doc = element.ownerDocument;
  const scope = element.closest?.('main') || doc.body;
  return Array.from(scope.querySelectorAll(HEADING_SELECTOR))
    .filter((heading) => heading === element || (heading.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING))
    .pop() || nearestSectionHeading(element);
}

function normalizeStructureLabel(value) {
  const label = String(value || '').replace(/\s+/g, ' ').trim();
  const partMatch = label.match(/^Part\s+([ivxlcdm]+|\d+)\b/i);
  if (partMatch) {
    const rawPart = partMatch[1];
    const partNumber = /^\d+$/.test(rawPart) ? rawPart : romanToInteger(rawPart.toUpperCase());
    return partNumber ? `Part ${partNumber}` : label;
  }
  return label.replace(/^\d+\.\s*/, '');
}

function romanToInteger(value) {
  const numerals = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let index = 0; index < value.length; index += 1) {
    const current = numerals[value[index]] || 0;
    const next = numerals[value[index + 1]] || 0;
    total += current < next ? -current : current;
  }
  return total || null;
}

function editablePlainText(element) {
  if (!element) return '';
  if (typeof element.innerText === 'string') return element.innerText.replace(/\r\n?/g, '\n');

  const blockTags = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DIV', 'FIGCAPTION', 'FIGURE',
    'FOOTER', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'LI', 'MAIN',
    'NAV', 'OL', 'P', 'PRE', 'SECTION', 'UL'
  ]);
  let output = '';
  const walk = (parent) => {
    const children = Array.from(parent?.childNodes || []);
    children.forEach((child, index) => {
      if (child?.nodeType === 3) {
        output += child.nodeValue || '';
        return;
      }
      if (child?.nodeType !== 1) return;
      const tagName = String(child.tagName || child.nodeName || '').toUpperCase();
      if (tagName === 'BR') {
        output += '\n';
        return;
      }
      const isBlock = blockTags.has(tagName);
      if (isBlock && output && !output.endsWith('\n')) output += '\n';
      walk(child);
      if (isBlock && index < children.length - 1 && !output.endsWith('\n')) output += '\n';
    });
  };
  walk(element);
  return output.replace(/\r\n?/g, '\n');
}

function readableSnippet(value, maxLength) {
  const snippet = String(value || '').replace(/\s+/g, ' ').trim();
  if (snippet.length <= maxLength) return snippet;
  return `${snippet.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function activateAnnotation(annotationId, scrollIntoView) {
  state.activeAnnotationId = annotationId;
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  const doc = getFrameDoc();
  syncActiveAnnotationState();
  if (scrollIntoView) {
    jumpToAnnotation(annotationId);
  }
  renderNoteList({ anchorAnnotationId: annotationId });
  syncJumpToNoteButton(doc);
}

function activateAnnotationFromHighlightClick(annotationId) {
  if (!annotationId || state.readingMode || state.mode === 'attach-highlight') return;
  clearFrameSelection(getFrameDoc());
  activateAnnotation(annotationId, false);
}

function clearActiveAnnotation() {
  state.activeAnnotationId = null;
  state.attachTargetAnnotationId = null;
  state.removeTargetAnnotationId = null;
  state.pendingPdfAnnotationJump = null;
  state.pdfPendingJumpNotice = null;
  if (state.mode === 'attach-highlight') setMode('select');
  if (state.mode === 'remove-highlight') setMode('select');
  if (state.mode === 'pdf-highlight') setMode('select');
  syncActiveAnnotationState();
  renderNoteList();
  syncJumpToNoteButton();
}

function syncActiveAnnotationState() {
  const doc = getFrameDoc();
  doc.querySelectorAll('.reader-side-note').forEach((note) => {
    const isActive = note.dataset.annotationId === state.activeAnnotationId;
    note.classList.toggle('is-active', isActive);
    if (isActive) {
      note.dataset.inkTool = state.inkTool;
    } else {
      delete note.dataset.inkTool;
    }
  });
  syncSideInkToolbars(doc);
  doc.querySelectorAll('.reader-highlight').forEach((highlight) => {
    highlight.classList.toggle('is-active', highlight.dataset.annotationId === state.activeAnnotationId);
  });
  layoutSideNotes(doc);
  scheduleSplitNotesStateBroadcast(doc);
}

function syncSideInkToolbars(doc) {
  doc.querySelectorAll('.reader-side-note').forEach((note) => {
    const annotationId = note.dataset.annotationId;
    note.querySelectorAll('.reader-side-note-ink-toolbar').forEach((toolbar) => toolbar.remove());
    if (annotationId !== state.activeAnnotationId) return;
    note.querySelectorAll('.reader-side-note-ink').forEach((canvas) => {
      const blockId = canvas.dataset.blockId;
      if (!blockId) return;
      const toolbar = createSideInkToolbar(doc, annotationId, blockId);
      const wrap = canvas.closest('.reader-side-note-ink-wrap') || canvas.parentElement;
      wrap.append(toolbar);
    });
  });
}

function getJumpToNoteButton(doc) {
  let button = doc.querySelector('.reader-jump-note-button');
  if (!button) {
    button = doc.createElement('button');
    button.type = 'button';
    button.className = 'reader-jump-note-button';
    button.textContent = 'Back to selected';
    button.title = 'Back to selected note';
    button.hidden = true;
    button.addEventListener('click', () => {
      if (state.activeAnnotationId) jumpToAnnotation(state.activeAnnotationId);
    });
    doc.body.append(button);
    positionJumpToNoteButton(doc, button);
  }
  return button;
}

function syncJumpToNoteButton(doc = getFrameDoc()) {
  const button = getJumpToNoteButton(doc);
  if (!state.activeAnnotationId) {
    button.hidden = true;
    return;
  }
  const escaped = cssEscape(state.activeAnnotationId);
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${escaped}"]`);
  if (!note) {
    const annotation = state.annotations.find((item) => item.id === state.activeAnnotationId);
    const direction = detachedPdfSelectionJumpDirection(doc, annotation);
    button.hidden = !direction;
    if (direction) positionJumpToNoteButton(doc, button, direction);
    return;
  }
  const rect = note.getBoundingClientRect();
  button.hidden = rect.bottom >= 0 && rect.top <= doc.defaultView.innerHeight;
  if (!button.hidden) positionJumpToNoteButton(doc, button, rect.top < 0 ? 'above' : 'below');
}

function detachedPdfSelectionJumpDirection(doc, annotation) {
  if (state.currentDocument?.sourceType !== 'pdf' || !annotation) return null;
  const pageNumber = annotationPrimaryPdfPageNumber(annotation);
  if (!pageNumber) return null;
  const pageIndex = pageNumber - 1;
  if (readerPositionPdfPageElementNow(doc, { pageIndex, pageNumber })) return null;
  const currentPage = Number(doc.documentElement.dataset.pdfCurrentPage);
  return Number.isFinite(currentPage) && pageNumber < currentPage ? 'above' : 'below';
}

function positionJumpToNoteButton(doc, button, direction = 'below') {
  const buttonWidth = button.offsetWidth || 132;
  button.style.left = `${jumpToNoteButtonLeft(doc, buttonWidth)}px`;
  if (direction === 'above') {
    button.style.top = '18px';
    button.style.bottom = 'auto';
  } else {
    button.style.top = 'auto';
    button.style.bottom = '18px';
  }
}

function jumpToNoteButtonLeft(doc, buttonWidth = 132) {
  const view = doc.defaultView;
  const viewportWidth = Math.max(320, view.innerWidth);
  const metrics = layoutMetrics(doc);
  const layer = doc.querySelector('.reader-side-note-layer');
  const layerRect = layer?.getBoundingClientRect?.();
  const layerLeft = Number.isFinite(layerRect?.left) && layerRect.width > 0
    ? layerRect.left
    : metrics.sourceNoteX;
  const separatorRight = metrics.sourceNoteX + 6;
  const desired = Math.max(layerLeft + 14, separatorRight + 12, 12);
  const maxLeft = Math.max(12, viewportWidth - buttonWidth - 12);
  return Math.round(clampNumber(desired, 12, maxLeft, 12));
}

function jumpToAnnotation(annotationId) {
  const doc = getFrameDoc();
  const escaped = cssEscape(annotationId);
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${escaped}"]`);
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (requestPdfPageForAnnotationJump(doc, annotation)) {
    syncJumpToNoteButton(doc);
    return;
  }
  const targetTop = note
    ? doc.defaultView.scrollY + note.getBoundingClientRect().top
    : annotationTop(doc, annotation);
  if (Number.isFinite(targetTop)) {
    doc.defaultView.scrollTo(0, Math.max(0, targetTop - doc.defaultView.innerHeight * NOTE_JUMP_VIEWPORT_OFFSET_RATIO));
  }
  syncJumpToNoteButton(doc);
}

function jumpToAnnotationHighlight(annotationId, targetIndex) {
  const doc = getFrameDoc();
  const annotation = state.annotations.find((item) => item.id === annotationId);
  const target = targetIndex === 0 ? annotation?.target : annotation?.targets?.[targetIndex - 1];
  if (!annotation || !target) return false;
  activateAnnotation(annotationId, false);
  if (scrollToRenderedAnnotationHighlight(doc, annotationId, targetIndex)) {
    state.pendingHighlightNavigatorJump = null;
    setStatus(`Moved to highlight ${targetIndex + 1}.`);
    return true;
  }
  const pageIndex = pdfPageIndexFromTarget(target);
  if (state.currentDocument?.sourceType === 'pdf' && Number.isInteger(pageIndex) && pageIndex >= 0) {
    state.pendingHighlightNavigatorJump = { annotationId, targetIndex, pageIndex };
    doc.dispatchEvent(new doc.defaultView.CustomEvent('reader-pdf-ensure-page', {
      detail: { annotationId, targetIndex, pageIndex, pageNumber: pageIndex + 1 }
    }));
    setStatus(`Loading page ${pageIndex + 1} for highlight ${targetIndex + 1}...`);
    return false;
  }
  setStatus('This highlight is not currently resolvable.', true);
  return false;
}

function scrollToRenderedAnnotationHighlight(doc, annotationId, targetIndex) {
  const selector = `.reader-highlight[data-annotation-id="${cssEscape(annotationId)}"][data-target-index="${cssEscape(String(targetIndex))}"]`;
  const elements = Array.from(doc.querySelectorAll(selector));
  if (!elements.length) return false;
  const rects = elements.flatMap((element) => {
    const clientRects = Array.from(element.getClientRects?.() || []);
    return clientRects.length ? clientRects : [element.getBoundingClientRect()];
  });
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  if (!Number.isFinite(top) || !Number.isFinite(bottom)) return false;
  const destination = (doc.defaultView.scrollY || 0) + (top + bottom) / 2 - doc.defaultView.innerHeight / 2;
  doc.defaultView.scrollTo(0, Math.max(0, destination));
  requestAnimationFrame(() => syncPinnedHighlightNavigator(doc));
  return true;
}

function retryPendingHighlightNavigatorJump(doc = getFrameDoc()) {
  const pending = state.pendingHighlightNavigatorJump;
  if (!pending || !doc || doc !== getFrameDoc()) return false;
  if (!scrollToRenderedAnnotationHighlight(doc, pending.annotationId, pending.targetIndex)) return false;
  state.pendingHighlightNavigatorJump = null;
  setStatus(`Moved to highlight ${pending.targetIndex + 1}.`);
  return true;
}

function requestPdfPageForAnnotationJump(doc, annotation) {
  if (state.currentDocument?.sourceType !== 'pdf' || !annotation) return false;
  const pageNumber = annotationPrimaryPdfPageNumber(annotation);
  if (!pageNumber) return false;
  const pageIndex = pageNumber - 1;
  if (readerPositionPdfPageElementNow(doc, { pageIndex, pageNumber }) && pdfPageShellsReadyThrough(doc, pageIndex)) {
    return false;
  }
  state.pendingPdfAnnotationJump = {
    annotationId: annotation.id,
    pageIndex,
    pageNumber
  };
  state.pdfPendingJumpStatusUntil = performance.now() + 1500;
  state.pdfPendingJumpNotice = {
    annotationId: annotation.id,
    pageNumber,
    until: state.pdfPendingJumpStatusUntil
  };
  schedulePdfPendingJumpNoticeClear(annotation.id);
  doc.dispatchEvent(new doc.defaultView.CustomEvent('reader-pdf-ensure-page', {
    detail: {
      annotationId: annotation.id,
      pageIndex,
      pageNumber
    }
  }));
  setStatus(`Loading page ${pageNumber} for selected note...`);
  renderNavigatorNoteCards([annotation.id]);
  return true;
}

function retryPendingPdfAnnotationJump(doc) {
  const pending = state.pendingPdfAnnotationJump;
  if (!pending || !state.activeAnnotationId || pending.annotationId !== state.activeAnnotationId) return;
  if (!pdfPageShellsReadyThrough(doc, pending.pageIndex)) return;
  const escaped = cssEscape(pending.annotationId);
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${escaped}"]`);
  if (!note) return;
  layoutSideNotes(doc);
  state.pendingPdfAnnotationJump = null;
  renderNavigatorNoteCards([pending.annotationId]);
  jumpToAnnotation(pending.annotationId);
}

function schedulePdfPendingJumpNoticeClear(annotationId) {
  if (state.pdfPendingJumpNoticeTimer) {
    window.clearTimeout(state.pdfPendingJumpNoticeTimer);
    state.pdfPendingJumpNoticeTimer = 0;
  }
  const delay = Math.max(0, (state.pdfPendingJumpNotice?.until || 0) - performance.now());
  state.pdfPendingJumpNoticeTimer = window.setTimeout(() => {
    state.pdfPendingJumpNoticeTimer = 0;
    if (state.pendingPdfAnnotationJump?.annotationId === annotationId) return;
    if (state.pdfPendingJumpNotice?.annotationId !== annotationId) return;
    if (performance.now() < state.pdfPendingJumpNotice.until) {
      schedulePdfPendingJumpNoticeClear(annotationId);
      return;
    }
    state.pdfPendingJumpNotice = null;
    renderNavigatorNoteCards([annotationId]);
  }, delay);
}

function pdfPageShellsReadyThrough(doc, pageIndex) {
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return true;
  return Boolean(doc.querySelector(`[data-pdf-page-index="${cssEscape(String(pageIndex))}"]`));
}

function annotationTop(doc, annotation) {
  if (!annotation) return null;
  const target = annotationAnchorElement(doc, annotation);
  if (!target) return null;
  return doc.defaultView.scrollY + target.getBoundingClientRect().top;
}

function editAnnotationInline(annotationId, scrollIntoView = false) {
  activateAnnotation(annotationId, scrollIntoView);
  const doc = getFrameDoc();
  const escaped = cssEscape(annotationId);
  const note = doc.querySelector(`.reader-side-note[data-annotation-id="${escaped}"]`);
  if (note) beginInlineTextEdit(annotationId, note);
}

function requestDeleteAnnotation(annotationId, anchorElement) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !anchorElement) return;
  closeDeleteConfirmPopovers();
  const doc = anchorElement.ownerDocument;
  const popover = doc.createElement('div');
  popover.className = 'reader-delete-confirm-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Delete note');

  const message = doc.createElement('p');
  message.textContent = `Delete "${readableSnippet(annotationTitle(annotation), 72)}"?`;
  const actions = doc.createElement('div');
  actions.className = 'reader-delete-confirm-actions';
  const cancel = doc.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.title = 'Cancel delete';
  const confirmButton = doc.createElement('button');
  confirmButton.type = 'button';
  confirmButton.className = 'danger';
  confirmButton.textContent = 'Delete';
  confirmButton.title = 'Delete note';
  actions.append(cancel, confirmButton);
  popover.append(message, actions);
  doc.body.append(popover);
  positionDeleteConfirmPopover(doc, popover, anchorElement);
  const fallbackAnnotationId = neighboringAnnotationId(annotationId, doc);
  installInlineConfirmPopover(popover, anchorElement, {
    cancelButton: cancel,
    confirmButton,
    onConfirm: async () => {
      await deleteAnnotation(annotationId);
      focusSideNoteAfterDeletion(fallbackAnnotationId, doc);
    }
  });
}

function positionDeleteConfirmPopover(doc, popover, anchorElement) {
  const view = doc.defaultView;
  const rect = anchorElement.getBoundingClientRect();
  const width = popover.offsetWidth || 214;
  const height = popover.offsetHeight || 86;
  const left = Math.min(Math.max(8, rect.right - width), Math.max(8, view.innerWidth - width - 8));
  const preferredTop = rect.bottom + 6;
  const top = preferredTop + height <= view.innerHeight - 8
    ? preferredTop
    : Math.max(8, rect.top - height - 6);
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function installInlineConfirmPopover(popover, trigger, options = {}) {
  const doc = popover.ownerDocument;
  const cancelButton = options.cancelButton || popover.querySelector('[data-delete-choice="cancel"]');
  const confirmButton = options.confirmButton || popover.querySelector('[data-delete-choice="confirm"]');
  let closed = false;
  const onPointerDown = (event) => {
    if (!popover.contains(event.target)) close({ restoreFocus: true });
  };
  const close = ({ restoreFocus = true } = {}) => {
    if (closed) return;
    closed = true;
    doc.removeEventListener('pointerdown', onPointerDown, true);
    popover.remove();
    if (restoreFocus && isUsableFocusTarget(trigger)) trigger.focus({ preventScroll: true });
  };
  popover._closeConfirmPopover = close;
  cancelButton?.addEventListener('click', () => close({ restoreFocus: true }));
  confirmButton?.addEventListener('click', async () => {
    close({ restoreFocus: false });
    try {
      await options.onConfirm?.();
    } catch (error) {
      setStatus(error.message, true);
    }
  });
  popover.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close({ restoreFocus: true });
      return;
    }
    if (event.key !== 'Tab') return;
    const buttons = Array.from(popover.querySelectorAll('button:not(:disabled)'));
    if (!buttons.length) return;
    const active = doc.activeElement;
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
  window.setTimeout(() => {
    if (!closed) {
      doc.addEventListener('pointerdown', onPointerDown, true);
      cancelButton?.focus?.({ preventScroll: true });
    }
  }, 0);
}

function neighboringAnnotationId(annotationId, doc) {
  const ordered = annotationsInResolvedDocumentOrder(doc);
  const index = ordered.findIndex((annotation) => annotation.id === annotationId);
  if (index < 0) return null;
  return ordered[index + 1]?.id || ordered[index - 1]?.id || null;
}

function focusSideNoteAfterDeletion(annotationId, doc) {
  if (!annotationId) return;
  requestAnimationFrame(() => {
    const note = doc.querySelector(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
    (note?.querySelector('.reader-side-note-title') || note?.querySelector('button'))?.focus?.({ preventScroll: true });
  });
}

function closeDeleteConfirmPopovers() {
  let closed = false;
  document.querySelectorAll('.reader-delete-confirm-popover').forEach((popover) => {
    if (typeof popover._closeConfirmPopover === 'function') popover._closeConfirmPopover({ restoreFocus: true });
    else popover.remove();
    closed = true;
  });
  if (state.iframeLoaded) {
    getFrameDoc()?.querySelectorAll('.reader-delete-confirm-popover').forEach((popover) => {
      if (typeof popover._closeConfirmPopover === 'function') popover._closeConfirmPopover({ restoreFocus: true });
      else popover.remove();
      closed = true;
    });
  }
  return closed;
}

async function deleteAnnotation(annotationId) {
  let annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation) return;
  await flushPendingAnnotationBlockSave(annotationId);
  annotation = state.annotations.find((item) => item.id === annotationId) || annotation;
  const before = cloneAnnotation(annotation);
  await storage.deleteAnnotation(state.docId, annotationId);
  state.activeAnnotationId = null;
  if (state.pinnedAnnotationId === annotationId) {
    state.pinnedAnnotationId = null;
    syncPinnedNoteChrome();
  }
  if (state.pendingHighlightNavigatorJump?.annotationId === annotationId) {
    state.pendingHighlightNavigatorJump = null;
  }
  if (state.focusModeAnnotationId === annotationId) {
    state.focusModeAnnotationId = null;
    state.focusModeNoteTop = null;
    state.focusModeAnchorTop = null;
    state.focusModeNoteViewportTop = null;
    state.focusModeAnchorViewportTop = null;
  }
  await reloadAnnotationsAndRender();
  recordAnnotationHistory('note deletion', before, null, null);
  setStatus('Annotation deleted.');
}

function togglePinnedNote(annotationId) {
  state.pinnedAnnotationId = state.pinnedAnnotationId === annotationId ? null : annotationId;
  if (!state.pinnedAnnotationId) state.pendingHighlightNavigatorJump = null;
  state.activeAnnotationId = annotationId;
  syncPinnedNoteChrome();
  hideSelectionHighlightButton();
  if (state.mode === 'blank-note') setMode('select');
  renderAnnotations();
  renderNoteList();
  setStatus(state.pinnedAnnotationId ? 'Note pinned.' : 'Note unpinned.');
}

async function handlePinnedNoteBlockAction(annotationId, action, target) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || state.pinnedAnnotationId !== annotationId) return;
  const boundary = target?.closest?.('.reader-side-note-insertion-row');
  const beforeBlockId = boundary?.dataset?.beforeBlockId || '';
  const afterBlockId = boundary?.dataset?.afterBlockId || '';
  if (action === 'insert-image') {
    pickSideNoteImageForBoundary(annotationId, { beforeBlockId, afterBlockId }, target?.ownerDocument || getFrameDoc());
    return;
  }
  const before = cloneAnnotation(annotation);
  const blocks = sideNoteContentBlocks(annotation);
  const blockId = target?.dataset?.blockId || '';
  const beforeIndex = beforeBlockId ? blocks.findIndex((block) => block.id === beforeBlockId) : -1;
  const afterIndex = afterBlockId ? blocks.findIndex((block) => block.id === afterBlockId) : -1;
  const insertAt = beforeIndex >= 0 ? beforeIndex : afterIndex >= 0 ? afterIndex + 1 : blocks.length;
  let insertedBlock = null;
  if (action === 'insert-text') {
    insertedBlock = newSideNoteBlock('text');
    if (blocks.length === 1 && blocks[0]?.type === 'blank') blocks[0] = insertedBlock;
    else blocks.splice(insertAt, 0, insertedBlock);
  } else if (action === 'insert-ink') {
    insertedBlock = newSideNoteBlock('ink');
    if (blocks.length === 1 && blocks[0]?.type === 'blank') blocks[0] = insertedBlock;
    else blocks.splice(insertAt, 0, insertedBlock);
  } else if (action === 'remove-block') {
    const blockIndex = blocks.findIndex((block) => block.id === blockId);
    if (blockIndex < 0) return;
    if (blocks.length <= 1) {
      blocks.splice(0, blocks.length, newSideNoteBlock('blank'));
    } else {
      blocks.splice(blockIndex, 1);
    }
  } else return;
  const updated = await saveAnnotationBlocks(annotation, blocks);
  const label = action === 'remove-block' ? 'note block deletion' : 'note block insertion';
  recordAnnotationHistory(label, before, updated, annotationId);
  if (insertedBlock) focusInsertedSideNoteBlock(annotationId, insertedBlock);
}

function pickSideNoteImageForBoundary(annotationId, boundary = {}, doc = getFrameDoc()) {
  const input = doc.createElement('input');
  input.type = 'file';
  input.accept = '.jpg,.jpeg,image/jpeg,.png,image/png,.webp,image/webp';
  input.hidden = true;
  doc.body.append(input);
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    insertNoteImageAtBoundary(annotationId, file, boundary).catch((error) => setStatus(error.message, true));
  }, { once: true });
  input.addEventListener('cancel', () => input.remove(), { once: true });
  input.click();
}

export async function insertNoteImageAtBoundary(annotationId, file, boundary = {}) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !file || typeof file.arrayBuffer !== 'function') return null;
  await flushPendingAnnotationBlockSave(annotationId);
  const before = cloneAnnotation(annotation);
  const options = {};
  if (boundary.beforeBlockId) options.beforeBlockId = boundary.beforeBlockId;
  else if (boundary.afterBlockId) options.afterBlockId = boundary.afterBlockId;
  const result = await storage.insertNoteImage(state.docId, annotationId, file, options);
  const updated = annotationWithRuntimeInk(result.annotation);
  state.annotations = state.annotations.map((item) => item.id === annotationId ? updated : item);
  state.activeAnnotationId = annotationId;
  recordAnnotationHistory('picture insertion', before, updated, annotationId);
  renderAnnotations();
  renderNoteList();
  scheduleSplitNotesStateBroadcast();
  focusInsertedSideNoteBlock(annotationId, result.block);
  setStatus('Picture added to note.');
  return result;
}

function focusInsertedSideNoteBlock(annotationId, block) {
  requestAnimationFrame(() => {
    const note = getFrameDoc()?.querySelector?.(`.reader-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
    if (!note || !block?.id) return;
    if (block.type === 'text') {
      beginInlineTextEdit(annotationId, note, 'body', null, block.id);
      return;
    }
    const target = note.querySelector(`[data-block-id="${cssEscape(block.id)}"]`);
    target?.focus?.({ preventScroll: true });
  });
}

function setMode(mode) {
  if (mode === 'pdf-highlight' && !compatibilityFeatureEnabled('pdfRectHighlights')) {
    state.mode = 'select';
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
    syncCompatibilityControls();
    setStatus('PDF rectangle highlights are unavailable for this document.', true);
    return;
  }
  if (mode === 'blank-note' && !compatibilityFeatureEnabled('blockNotes')) {
    state.mode = 'select';
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
    syncCompatibilityControls();
    setStatus(`Block notes are unavailable for this document. ${compatibilityWarningSummary()}`.trim(), true);
    return;
  }
  if (mode === 'attach-highlight' && !compatibilityFeatureEnabled('singleBlockTextHighlights')) {
    state.mode = 'select';
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
    syncCompatibilityControls();
    setStatus('Text highlights are unavailable for this document.', true);
    return;
  }
  if (mode === 'blank-note' && isFocusModeActive()) {
    state.mode = 'select';
    els.cancelModeBtn.disabled = true;
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
    syncCompatibilityControls();
    setStatus('Disable focus mode before creating a new note.', true);
    return;
  }
  const previousMode = state.mode;
  if (previousMode === 'pdf-highlight' && mode !== 'pdf-highlight' && state.pdfHighlightSession) {
    finishPdfHighlightDraft(false).catch((error) => setStatus(error.message, true));
  }
  state.mode = mode;
  els.cancelModeBtn.disabled = mode === 'select';
  syncCompatibilityControls();
  if (mode === 'blank-note' || mode === 'pdf-highlight') {
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
  }
  if (mode === 'pdf-highlight') {
    setStatus('PDF highlight mode: drag a rectangle on a PDF page.');
  } else if (mode === 'blank-note') {
    setStatus(state.currentDocument?.sourceType === 'pdf'
      ? 'Blank-note mode: click a PDF page.'
      : 'Blank-note mode: click a paragraph, heading, figure, or list item in the document.');
  } else if (mode === 'attach-highlight') {
    state.removeTargetAnnotationId = null;
    setStatus('Select text to attach it to the focused note.');
  } else if (mode === 'remove-highlight') {
    state.attachTargetAnnotationId = null;
    setStatus('Click one of the focused note’s highlights to remove it.');
  } else {
    state.attachTargetAnnotationId = null;
    state.removeTargetAnnotationId = null;
    setStatus('Selection mode: select text in the document.');
  }
  if (state.iframeLoaded && previousMode !== mode && ['attach-highlight', 'remove-highlight'].includes(previousMode)) {
    renderAnnotations();
    renderNoteList();
  }
  if (state.iframeLoaded) syncFrameModeClass();
}

function syncFrameModeClass(doc = getFrameDoc()) {
  doc?.documentElement?.classList?.toggle('annotator-pdf-highlight-mode', state.mode === 'pdf-highlight');
}

function isFocusModeActive() {
  return Boolean(state.focusModeAnnotationId);
}

function getFrameDoc() {
  return els.frame.contentDocument || els.frame.contentWindow.document;
}

function closestAnchorElement(node) {
  if (!node) return null;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  return element?.closest?.(ANCHOR_SELECTOR) || null;
}

function closestHighlightRoot(node) {
  return closestAtomicHighlightRoot(node) || closestAnchorElement(node);
}

function closestAtomicHighlightRoot(node) {
  if (!node) return null;
  const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
  const atomic = element?.closest?.('table[data-anchor-id], table[id], .formula[data-anchor-id], .formula[id], [data-reader-math-rendered="true"][data-anchor-id], [data-math-source="tex"][data-anchor-id]');
  return atomic || null;
}

function isAtomicHighlightRoot(element) {
  return Boolean(element?.matches?.('table, .formula, [data-reader-math-rendered="true"][data-anchor-id], [data-math-source="tex"][data-anchor-id]'));
}

function focusBlockElement(node) {
  return closestAtomicHighlightRoot(node) || closestAnchorElement(node);
}

function captureAtomicPointerTarget(event) {
  const root = closestAtomicHighlightRoot(event?.target);
  if (!root) return null;
  return targetForWholeHighlightRoot(root);
}

function highlightTargetsForSelectionRange(doc, range) {
  if (state.currentDocument?.sourceType === 'pdf') return pdfTextTargetsForSelectionRange(doc, range);
  return highlightRootsForRange(doc, range)
    .map((root) => targetForSelectionRoot(root, range))
    .filter(Boolean);
}

function pdfTextTargetsForSelectionRange(doc, range) {
  return Array.from(doc.querySelectorAll('.pdf-page'))
    .filter((page) => safeRangeIntersectsNode(range, page))
    .map((page) => targetForSelectionRoot(page, range))
    .filter(Boolean)
    .sort((a, b) => Number(a.pageIndex ?? 0) - Number(b.pageIndex ?? 0));
}

function highlightRootsForRange(doc, range) {
  const roots = [];
  for (const element of doc.querySelectorAll(HIGHLIGHT_ROOT_SELECTOR)) {
    const root = closestHighlightRoot(element);
    if (!root || roots.includes(root)) continue;
    if (root.matches('section, article')) continue;
    if (!isAtomicHighlightRoot(root) && closestAtomicHighlightRoot(root.parentElement)) continue;
    if (!safeRangeIntersectsNode(range, root)) continue;
    roots.push(root);
  }
  return roots
    .filter((root) => isAtomicHighlightRoot(root) || !roots.some((other) => other !== root && root.contains(other)))
    .sort(documentOrder);
}

function targetForSelectionRoot(root, selectionRange) {
  if (isAtomicHighlightRoot(root)) return targetForWholeHighlightRoot(root);
  const clippedRange = clippedRangeForRoot(root, selectionRange);
  if (!clippedRange) return null;
  try {
    return targetForRangeInRoot(root, clippedRange);
  } finally {
    clippedRange.detach?.();
  }
}

function targetForWholeHighlightRoot(root) {
  const sourceText = annotationTextContent(root);
  if (!sourceText.trim()) return null;
  const anchorId = getAnchorId(root);
  const targetRect = root.getBoundingClientRect();
  const pageY = pdfTextTargetPageY(root, targetRect);
  const target = {
    type: 'text',
    pageId: pageIdForElement(root),
    anchorId,
    domPath: anchorId ? null : domPathFor(root),
    pageIndex: pdfPageIndexForElement(root),
    pageLabel: pdfPageLabelForElement(root),
    startOffset: 0,
    endOffset: sourceText.length,
    exact: sourceText,
    prefix: '',
    suffix: '',
    ...(pageY == null ? {} : { pageY }),
    clientRect: rectInParent(targetRect)
  };
  return {
    ...target,
    selectors: buildTextTargetSelectors(target, sourceText)
  };
}

function targetForRangeInRoot(root, range) {
  const startOffset = offsetWithin(root, range.startContainer, range.startOffset);
  const endOffset = offsetWithin(root, range.endContainer, range.endOffset);
  if (startOffset === endOffset) return null;
  const start = Math.min(startOffset, endOffset);
  const end = Math.max(startOffset, endOffset);
  const sourceText = annotationTextContent(root);
  const exact = sourceText.slice(start, end);
  if (!exact.trim()) return null;
  const anchorId = getAnchorId(root);
  const targetRect = range.getBoundingClientRect();
  const pageY = pdfTextTargetPageY(root, targetRect);
  const target = {
    type: 'text',
    pageId: pageIdForElement(root),
    anchorId,
    domPath: anchorId ? null : domPathFor(root),
    pageIndex: pdfPageIndexForElement(root),
    pageLabel: pdfPageLabelForElement(root),
    startOffset: start,
    endOffset: end,
    exact,
    prefix: sourceText.slice(Math.max(0, start - 80), start),
    suffix: sourceText.slice(end, Math.min(sourceText.length, end + 80)),
    ...(pageY == null ? {} : { pageY }),
    clientRect: rectInParent(targetRect)
  };
  return {
    ...target,
    selectors: buildTextTargetSelectors(target, sourceText)
  };
}

function pdfTextTargetPageY(root, targetRect) {
  const page = root?.closest?.('.pdf-page') || (root?.matches?.('.pdf-page') ? root : null);
  if (!page || !targetRect) return null;
  const pageRect = page.getBoundingClientRect();
  if (!(pageRect.height > 0)) return null;
  return Number(clampNumber((targetRect.top - pageRect.top) / pageRect.height, 0, 1, 0).toFixed(6));
}

function rectForSelectionTarget(range, targets) {
  const rect = range.getBoundingClientRect();
  if (rect?.width || rect?.height) return rectInParent(rect);
  return targets.find((target) => target.clientRect?.width || target.clientRect?.height)?.clientRect || null;
}

function clippedRangeForRoot(root, selectionRange) {
  if (!safeRangeIntersectsNode(selectionRange, root)) return null;
  const doc = root.ownerDocument;
  const rootRange = doc.createRange();
  const clippedRange = doc.createRange();
  rootRange.selectNodeContents(root);
  if (selectionRange.compareBoundaryPoints(Range.START_TO_START, rootRange) > 0) {
    clippedRange.setStart(selectionRange.startContainer, selectionRange.startOffset);
  } else {
    clippedRange.setStart(rootRange.startContainer, rootRange.startOffset);
  }
  if (selectionRange.compareBoundaryPoints(Range.END_TO_END, rootRange) < 0) {
    clippedRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);
  } else {
    clippedRange.setEnd(rootRange.endContainer, rootRange.endOffset);
  }
  rootRange.detach?.();
  if (clippedRange.collapsed) {
    clippedRange.detach?.();
    return null;
  }
  return clippedRange;
}

function safeRangeIntersectsNode(range, node) {
  try {
    return range.intersectsNode(node);
  } catch {
    return false;
  }
}

function frameTextSelectionActive(doc = getFrameDoc()) {
  const selection = doc?.getSelection?.();
  return Boolean(selection && selection.rangeCount > 0 && !selection.isCollapsed && selection.toString().trim());
}

function getAnchorId(element) {
  return element?.dataset?.anchorId || element?.id || null;
}

function pageIdForElement(element) {
  return element?.closest?.('[data-page-id]')?.dataset?.pageId || null;
}

function pdfPageIndexForElement(element) {
  const value = element?.closest?.('[data-pdf-page-index]')?.dataset?.pdfPageIndex;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function pdfPageLabelForElement(element) {
  return element?.closest?.('[data-pdf-page-label]')?.dataset?.pdfPageLabel || null;
}

function resolveTargetElement(doc, target) {
  if (!target) return null;
  if (state.currentDocument?.sourceType === 'pdf' && ['text', 'pdf-page-point', 'pdf-rect'].includes(target.type)) {
    const pageIndex = pdfPageIndexFromTarget(target);
    if (pageIndex != null) {
      const page = doc.querySelector(`[data-pdf-page-index="${cssEscape(String(pageIndex))}"]`);
      if (page) return page;
    }
  }
  if (target.anchorId) {
    const escaped = cssEscape(target.anchorId);
    if (target.pageId) {
      const page = doc.querySelector(`[data-page-id="${cssEscape(target.pageId)}"]`);
      const scoped = page?.querySelector?.(`[data-anchor-id="${escaped}"], #${escaped}`);
      if (scoped) return scoped;
    }
    return doc.querySelector(`[data-anchor-id="${escaped}"], #${escaped}`);
  }
  if (target.domPath) {
    return doc.querySelector(target.domPath);
  }
  return null;
}

function offsetWithin(root, container, offset) {
  const doc = root.ownerDocument;
  const normalized = normalizedAnnotationBoundary(container, offset);
  if (normalized) {
    container = normalized.container;
    offset = normalized.offset;
  }
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isAnnotationTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let total = 0;
  let node;
  const boundary = doc.createRange();
  try {
    boundary.setStart(container, offset);
    boundary.collapse(true);
  } catch {
    boundary.detach?.();
    return 0;
  }
  while ((node = walker.nextNode())) {
    if (node === container) return total + offset;
    const nodeRange = doc.createRange();
    nodeRange.selectNodeContents(node);
    const beforeBoundary = nodeRange.compareBoundaryPoints(Range.END_TO_START, boundary) <= 0;
    nodeRange.detach?.();
    if (!beforeBoundary) break;
    total += node.nodeValue.length;
  }
  boundary.detach?.();
  return total;
}

function rangeFromOffsets(root, start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return null;
  const doc = root.ownerDocument;
  const range = doc.createRange();
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!isAnnotationTextNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let offset = 0;
  let startSet = false;
  let endSet = false;
  let node;
  while ((node = walker.nextNode())) {
    const textLength = node.nodeValue.length;
    const nodeStart = offset;
    const nodeEnd = offset + textLength;
    if (!startSet && start >= nodeStart && start <= nodeEnd) {
      range.setStart(node, Math.max(0, start - nodeStart));
      startSet = true;
    }
    if (!endSet && end >= nodeStart && end <= nodeEnd) {
      range.setEnd(node, Math.max(0, end - nodeStart));
      endSet = true;
      break;
    }
    offset = nodeEnd;
  }
  if (!startSet || !endSet) return null;
  return range;
}

function wrapRangeTextNodesInRoot(root, range, className, annotationId, targetIndex = 0) {
  const doc = root.ownerDocument;
  const textNodes = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (!isAnnotationTextNode(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  for (const originalNode of textNodes) {
    if (originalNode.parentElement?.closest('.reader-math-source')) {
      highlightRenderedMathSource(originalNode, className, annotationId, targetIndex);
      continue;
    }
    let nodeToWrap = originalNode;
    let start = 0;
    let end = originalNode.nodeValue.length;
    if (originalNode === range.startContainer) start = range.startOffset;
    if (originalNode === range.endContainer) end = range.endOffset;
    if (start >= end) continue;
    if (end < nodeToWrap.nodeValue.length) nodeToWrap.splitText(end);
    if (start > 0) nodeToWrap = nodeToWrap.splitText(start);
    const span = doc.createElement('span');
    span.className = className;
    span.dataset.annotationId = annotationId;
    span.dataset.targetIndex = String(targetIndex);
    nodeToWrap.parentNode.insertBefore(span, nodeToWrap);
    span.append(nodeToWrap);
  }
}

function highlightAtomicRoot(element, className, annotationId, targetIndex) {
  element.classList.add(...className.split(/\s+/).filter(Boolean));
  element.dataset.annotationId = annotationId;
  element.dataset.targetIndex = String(targetIndex);
}

function highlightRenderedMathSource(textNode, className, annotationId, targetIndex) {
  const source = textNode.parentElement?.closest('.reader-math-source');
  const renderedMath = source?.closest('.reader-math-inline, .reader-math-display, .formula, [data-reader-math-rendered="true"]');
  if (!renderedMath) return;
  highlightAtomicRoot(renderedMath, className, annotationId, targetIndex);
}

function normalizedAnnotationBoundary(container, offset) {
  const element = container?.nodeType === Node.ELEMENT_NODE ? container : container?.parentElement;
  const renderedMath = element?.closest?.('.reader-math-rendered, .katex');
  if (!renderedMath) return null;
  const mathWrapper = renderedMath.closest('.reader-math-inline, .reader-math-display, .formula, [data-reader-math-rendered="true"]');
  const sourceText = mathWrapper?.querySelector?.('.reader-math-source')?.firstChild;
  if (!sourceText) return null;
  const useEnd = isEndLikeBoundary(container, offset, renderedMath);
  return {
    container: sourceText,
    offset: useEnd ? sourceText.nodeValue.length : 0
  };
}

function isEndLikeBoundary(container, offset, renderedMath) {
  if (container.nodeType === Node.TEXT_NODE) {
    return offset >= Math.max(1, container.nodeValue.length / 2);
  }
  if (container.nodeType === Node.ELEMENT_NODE) {
    return offset >= container.childNodes.length / 2 || container === renderedMath;
  }
  return false;
}

function isAnnotationTextNode(node) {
  const parent = node?.parentElement;
  if (!parent) return false;
  if (parent.closest('.reader-side-note-layer, .reader-math-rendered, .katex')) return false;
  return true;
}

function annotationTextContent(element) {
  if (!element) return '';
  const doc = element.ownerDocument;
  const parts = [];
  const walker = doc.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isAnnotationTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let node;
  while ((node = walker.nextNode())) parts.push(node.nodeValue);
  return parts.join('');
}

function rectInParent(rect) {
  const frameRect = els.frame.getBoundingClientRect();
  return {
    left: frameRect.left + rect.left,
    right: frameRect.left + rect.right,
    top: frameRect.top + rect.top,
    bottom: frameRect.top + rect.bottom,
    width: rect.width,
    height: rect.height
  };
}

function textContent(element) {
  return annotationTextContent(element);
}

function domPathFor(element) {
  const parts = [];
  let node = element;
  while (node && node.nodeType === Node.ELEMENT_NODE && node !== node.ownerDocument.body) {
    let selector = node.localName;
    if (node.id) {
      selector += `#${cssEscape(node.id)}`;
      parts.unshift(selector);
      break;
    }
    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child) => child.localName === node.localName);
      if (siblings.length > 1) selector += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    }
    parts.unshift(selector);
    node = parent;
  }
  return parts.join(' > ');
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

function onSideInkPointerDown(event) {
  beginSideInkPointerDown(event.currentTarget, event);
}

function beginSideInkPointerDown(canvas, event) {
  if (isIgnoredInkPointerEvent(event)) return;
  if (state.sideInkSession) {
    finishSideInkSession(null, state.sideInkSession.canvas || canvas, { includeEventPoint: false });
  }
  const note = canvas.closest('.reader-side-note');
  const annotationId = note?.dataset?.annotationId;
  const blockId = canvas.dataset.blockId;
  if (!annotationId || !blockId || annotationId !== state.activeAnnotationId) return;
  const pointerId = event.pointerId ?? 'mouse';
  event.preventDefault();
  event.stopPropagation();
  canvas.closest('.reader-side-note-ink-wrap')?.classList.add('is-inking');
  try {
    canvas.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic/test pointer events and some tablet drivers may not support capture.
  }
  const tool = effectiveInkTool(event);
  const point = inkPointFromEvent(canvas, event);
  if (tool === 'eraser') {
    const annotation = state.annotations.find((item) => item.id === annotationId);
    if (!annotation) return;
    const blocks = sideNoteContentBlocks(annotation);
    const block = blocks.find((item) => item.id === blockId);
    if (block?.type !== 'ink') return;
    state.sideInkSession = {
      tool,
      annotationId,
      blockId,
      pointerId,
      canvas,
      blocks,
      strokeIndex: buildInkEraserStrokeIndex(block.ink.strokes),
      pendingEraseStrokes: new Set(),
      lastPoint: point,
      eraserWidth: currentInkLineWidth()
    };
    bindSideInkSessionEvents(canvas, state.sideInkSession, event);
    collectPendingEraseStrokes(
      state.sideInkSession.strokeIndex,
      state.sideInkSession.pendingEraseStrokes,
      point,
      state.sideInkSession.eraserWidth
    );
    requestSideInkRender(canvas);
    return;
  }
  state.sideInkSession = {
    tool,
    annotationId,
    blockId,
    pointerId,
    canvas,
    startedAt: Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now(),
    lastRawPoint: null,
    lastPoint: null,
    lastPressure: null,
    stroke: {
      color: state.inkColor,
      width: state.inkWidth,
      pressureEnabled: state.inkPressureEnabled,
      points: []
    }
  };
  bindSideInkSessionEvents(canvas, state.sideInkSession, event);
  addSidePointerEventPoints(event, { force: true });
  requestSideInkRender(canvas);
}

function bindSideInkSessionEvents(canvas, session, event) {
  const doc = canvas.ownerDocument;
  const parentDoc = doc.defaultView?.parent?.document;
  const inputType = event.type?.startsWith('pointer') ? 'pointer' : 'mouse';
  const pointerId = inputType === 'pointer' ? event.pointerId : null;
  const onMove = (moveEvent) => {
    if (moveEvent.target === canvas) return;
    if (pointerId != null && moveEvent.pointerId !== pointerId) return;
    onSideInkPointerMove(moveEvent, canvas);
  };
  const onUp = (upEvent) => {
    if (upEvent.target === canvas) return;
    if (pointerId != null && upEvent.pointerId !== pointerId) return;
    onSideInkPointerUp(upEvent, canvas);
  };
  const onParentUp = (upEvent) => {
    if (pointerId != null && upEvent.pointerId !== pointerId) return;
    onSideInkPointerUp(upEvent, canvas, { includeEventPoint: false });
  };
  const moveType = inputType === 'pointer' && 'onpointerrawupdate' in doc.defaultView ? 'pointerrawupdate' : inputType === 'pointer' ? 'pointermove' : 'mousemove';
  const upType = inputType === 'pointer' ? 'pointerup' : 'mouseup';
  doc.addEventListener(moveType, onMove);
  doc.addEventListener(upType, onUp);
  if (inputType === 'pointer') doc.addEventListener('pointercancel', onUp);
  if (parentDoc && parentDoc !== doc) {
    parentDoc.addEventListener(upType, onParentUp);
    if (inputType === 'pointer') parentDoc.addEventListener('pointercancel', onParentUp);
  }
  session.cleanup = () => {
    doc.removeEventListener(moveType, onMove);
    doc.removeEventListener(upType, onUp);
    if (inputType === 'pointer') doc.removeEventListener('pointercancel', onUp);
    if (parentDoc && parentDoc !== doc) {
      parentDoc.removeEventListener(upType, onParentUp);
      if (inputType === 'pointer') parentDoc.removeEventListener('pointercancel', onParentUp);
    }
  };
}

function cleanupSideInkSession(session) {
  session?.cleanup?.();
}

function onSideInkPointerMove(event, sessionCanvas = null) {
  const canvas = sessionCanvas || event.currentTarget;
  const session = state.sideInkSession;
  if (!session || isIgnoredInkPointerEvent(event) || !isActiveSideInkPointer(event)) return;
  event.preventDefault();
  event.stopPropagation();
  if (session.tool === 'eraser') {
    const events = pointerSamples(event);
    for (const item of events) {
      const point = inkPointFromEvent(canvas, item);
      collectPendingEraseStrokes(
        session.strokeIndex,
        session.pendingEraseStrokes,
        point,
        session.eraserWidth,
        session.lastPoint
      );
      session.lastPoint = point;
    }
    requestSideInkRender(canvas);
    return;
  }
  addSidePointerEventPoints(event);
  requestSideInkRender(canvas);
}

function onSideInkPointerUp(event, sessionCanvas = null, options = {}) {
  const session = state.sideInkSession;
  if (!session || (event && !isActiveSideInkPointer(event))) return;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  const canvas = sessionCanvas || event.currentTarget;
  canvas?.closest?.('.reader-side-note-ink-wrap')?.classList.remove('is-inking');
  cleanupSideInkSession(session);
  if (session.tool === 'eraser') {
    if (options.includeEventPoint !== false && hasClientPoint(event)) {
      const point = inkPointFromEvent(canvas, event);
      collectPendingEraseStrokes(
        session.strokeIndex,
        session.pendingEraseStrokes,
        point,
        session.eraserWidth,
        session.lastPoint
      );
      session.lastPoint = point;
    }
    state.sideInkSession = null;
    const annotation = state.annotations.find((item) => item.id === session.annotationId);
    if (!annotation) return;
    const blocks = session.blocks;
    const block = blocks.find((item) => item.id === session.blockId);
    if (block?.type !== 'ink') return;
    const { kept, removed } = commitPendingEraseStrokes(block.ink.strokes, session.pendingEraseStrokes);
    if (!removed.length) {
      requestSideInkRender(canvas);
      return;
    }
    block.ink.strokes = kept;
    applyAnnotationBlocksLocally(annotation, blocks);
    const history = sideInkHistory(session.annotationId, session.blockId);
    history.undo.push({ type: 'erase', strokes: removed });
    history.redo = [];
    queueSaveAnnotationBlocks(annotation, blocks, {
      render: false,
      delayMs: INK_SAVE_IDLE_DELAY_MS,
      waitForInkIdle: true
    }).catch((error) => setStatus(error.message, true));
    requestSideInkRender(canvas);
    return;
  }
  if (options.includeEventPoint !== false && hasClientPoint(event)) {
    addSidePointerEventPoints(event);
  }
  state.sideInkSession = null;
  const finalizedStroke = compactStroke(session.stroke);
  if (finalizedStroke.points.length < 2) return;
  const annotation = state.annotations.find((item) => item.id === session.annotationId);
  if (!annotation) return;
  const blocks = sideNoteContentBlocks(annotation);
  const block = blocks.find((item) => item.id === session.blockId);
  if (block?.type !== 'ink') return;
  block.ink.strokes.push(finalizedStroke);
  updateInkLogicalBottomForStroke(block.ink, finalizedStroke);
  const wrap = canvas.closest?.('.reader-side-note-ink-wrap');
  if (wrap) applyInkCanvasHeight(block.ink, wrap);
  const history = sideInkHistory(session.annotationId, session.blockId);
  history.undo.push({ type: 'add', stroke: finalizedStroke });
  history.redo = [];
  applyAnnotationBlocksLocally(annotation, blocks);
  commitSideInkStrokeToRenderCache(canvas, block.ink.strokes, finalizedStroke);
  queueSaveAnnotationBlocks(annotation, blocks, {
    render: false,
    delayMs: INK_SAVE_IDLE_DELAY_MS,
    waitForInkIdle: true
  }).catch((error) => setStatus(error.message, true));
}

function finishSideInkSession(event, canvas, options = {}) {
  onSideInkPointerUp(event, canvas, options);
}

function currentInkLineWidth() {
  return clampNumber(state.inkWidth, 1, 24, 3);
}

function drawSideInkCanvas(canvas, annotationId, blockId, activeStroke = null) {
  const sessionBlock = activeSideInkSessionBlock(annotationId, blockId);
  const resizeBlock = activeSideInkResizeSessionBlock(annotationId, blockId);
  const annotation = annotationIndexById().get(annotationId);
  const block = sessionBlock || resizeBlock || sideNoteBlockById(annotation, blockId);
  const wrap = canvas.closest('.reader-side-note-ink-wrap');
  const active = activeStroke || (
    state.sideInkSession?.tool === 'pen'
      && state.sideInkSession.annotationId === annotationId
      && state.sideInkSession.blockId === blockId
      ? state.sideInkSession.stroke
      : null
  );
  if (block?.type === 'ink' && wrap && !active) applyInkCanvasHeight(block.ink, wrap);
  const renderOptions = {
    pendingEraseStrokes: sideInkPendingEraseStrokes(annotationId, blockId),
    useCommittedCache: true
  };
  if (!isLiveSideInkCanvas(annotationId, blockId)) {
    renderOptions.backingRatio = INK_INACTIVE_BACKING_RATIO;
  }
  drawInkSurface(canvas, block?.ink?.strokes || [], active, renderOptions);
}

function isLiveSideInkCanvas(annotationId, blockId) {
  if (!annotationId || !blockId) return false;
  if (annotationId === state.activeAnnotationId) return true;
  if (
    state.sideInkSession
    && state.sideInkSession.annotationId === annotationId
    && state.sideInkSession.blockId === blockId
  ) {
    return true;
  }
  if (
    state.sideInkResizeSession
    && state.sideInkResizeSession.annotationId === annotationId
    && state.sideInkResizeSession.blockId === blockId
  ) {
    return true;
  }
  return false;
}

function activeSideInkSessionBlock(annotationId, blockId) {
  const session = state.sideInkSession;
  if (!session || session.tool !== 'eraser') return null;
  if (session.annotationId !== annotationId || session.blockId !== blockId) return null;
  const block = session.blocks?.find((item) => item.id === blockId);
  return block?.type === 'ink' ? block : null;
}

function activeSideInkResizeSessionBlock(annotationId, blockId) {
  const session = state.sideInkResizeSession;
  if (!session || session.annotationId !== annotationId || session.blockId !== blockId) return null;
  const block = session.blocks?.find((item) => item.id === blockId);
  return block?.type === 'ink' ? block : null;
}

function sideInkPendingEraseStrokes(annotationId, blockId) {
  const session = state.sideInkSession;
  if (!session || session.tool !== 'eraser') return null;
  if (session.annotationId !== annotationId || session.blockId !== blockId) return null;
  return session.pendingEraseStrokes || null;
}

function isIgnoredInkPointerEvent(event) {
  if (event?.type?.startsWith?.('pointer') && event.pointerType === 'touch') return true;
  if (event?.type === 'pointerdown' && event.button !== 0) return true;
  if (event?.type === 'mousedown' && event.button !== 0) return true;
  return false;
}

function isActiveSideInkPointer(event) {
  if (!state.sideInkSession || !event) return false;
  return (event.pointerId ?? 'mouse') === state.sideInkSession.pointerId;
}

function effectiveInkTool(event) {
  if (state.inkTool === 'eraser') return 'eraser';
  return 'pen';
}

function pointerSamples(event) {
  const events = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [];
  return events.length ? events : [event];
}

function addSidePointerEventPoints(event, options = {}) {
  const session = state.sideInkSession;
  if (!session || session.tool !== 'pen') return;
  for (const item of pointerSamples(event)) addSidePoint(item, options);
}

function addSidePoint(event, options = {}) {
  const point = filteredSidePointFromEvent(event, options);
  if (point) state.sideInkSession?.stroke?.points.push(point);
}

function filteredSidePointFromEvent(event, options = {}) {
  const session = state.sideInkSession;
  if (!session?.canvas) return null;
  const raw = inkPointFromEvent(session.canvas, event, session.lastPressure);
  if (!isInkPointNearCanvas(raw, session.canvas)) return null;
  const previous = session.lastPoint;

  if (!previous || options.force) {
    if (!options.preview) {
      session.lastRawPoint = raw;
      session.lastPoint = raw;
      session.lastPressure = raw.pressure;
    }
    return raw;
  }

  const rawDistance = distance(raw, session.lastRawPoint || previous);
  const pressureDelta = Math.abs(raw.pressure - (session.lastPressure ?? raw.pressure));
  const elapsed = raw.t - (session.startedAt || raw.t);
  if (!options.preview && session.stroke.points.length === 1 && elapsed < 180 && rawDistance > 24) {
    session.stroke.points[0] = raw;
    session.lastRawPoint = raw;
    session.lastPoint = raw;
    session.lastPressure = raw.pressure;
    return null;
  }
  if (!options.preview && rawDistance < 0.24 && pressureDelta < 0.015) return null;

  const point = {
    x: raw.x,
    y: raw.y,
    pressure: raw.pressure,
    t: raw.t,
    pointerType: raw.pointerType,
    ...stylusPointProperties(raw)
  };

  if (!options.preview) {
    session.lastRawPoint = raw;
    session.lastPoint = point;
    session.lastPressure = point.pressure;
  }
  return point;
}

function isInkPointNearCanvas(point, canvas) {
  const bounds = inkCanvasLogicalBounds(canvas);
  const margin = 36;
  return point.x >= -margin
    && point.x <= bounds.width + margin
    && point.y >= -margin
    && point.y <= bounds.height + margin;
}

function inkCanvasLogicalBounds(canvas) {
  const metrics = inkCanvasMetrics(canvas);
  const scale = inkCanvasLogicalScale(metrics);
  return {
    width: metrics.width / scale,
    height: metrics.height / scale
  };
}

function inkPointFromEvent(canvas, event, fallbackPressure = 0.5) {
  const metrics = inkCanvasMetrics(canvas);
  const clientPoint = eventClientPointForCanvas(canvas, event);
  const pointerType = event.pointerType || 'mouse';
  const scale = inkCanvasLogicalScale(metrics);
  return {
    x: (clientPoint.x - metrics.left) / scale,
    y: (clientPoint.y - metrics.top) / scale,
    pressure: normalizedInkPressure(event, pointerType, fallbackPressure),
    t: Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now(),
    pointerType,
    ...(pointerType === 'pen' ? stylusPointProperties({
      tiltX: event.tiltX,
      tiltY: event.tiltY,
      twist: event.twist,
      tangentialPressure: event.tangentialPressure,
      altitudeAngle: event.altitudeAngle,
      azimuthAngle: event.azimuthAngle,
      contactWidth: event.width,
      contactHeight: event.height
    }) : {})
  };
}

function inkCanvasMetrics(canvas) {
  const rect = canvas.getBoundingClientRect();
  const view = canvas.ownerDocument.defaultView || window;
  const style = view.getComputedStyle(canvas);
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const borderRight = parseFloat(style.borderRightWidth) || 0;
  const borderBottom = parseFloat(style.borderBottomWidth) || 0;
  return {
    left: rect.left + borderLeft,
    top: rect.top + borderTop,
    width: Math.max(1, rect.width - borderLeft - borderRight),
    height: Math.max(1, rect.height - borderTop - borderBottom)
  };
}

function eventClientPointForCanvas(canvas, event) {
  const view = canvas.ownerDocument.defaultView || window;
  let x = Number(event?.clientX);
  let y = Number(event?.clientY);
  const sourceView = event?.view;
  if (sourceView && sourceView !== view) {
    const frame = view.frameElement;
    const frameRect = frame?.getBoundingClientRect?.();
    if (frameRect) {
      x -= frameRect.left;
      y -= frameRect.top;
    }
  }
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0
  };
}

function normalizedInkPressure(event, pointerType, fallbackPressure = 0.5) {
  const session = state.sideInkSession;
  const pressureEnabled = session?.tool === 'pen' ? session.stroke?.pressureEnabled !== false : state.inkPressureEnabled;
  if (!pressureEnabled || pointerType !== 'pen') return 0.5;
  const raw = Number(event.pressure);
  const pressure = raw > 0 ? raw : fallbackPressure;
  return clampNumber(Math.pow(clampNumber(pressure, 0.03, 1, 0.5), 0.72), 0, 1, 0.5);
}

function hasClientPoint(event) {
  return Number.isFinite(event?.clientX) && Number.isFinite(event?.clientY);
}

function distance(a, b) {
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
}

function drawInkToCanvas(canvas, strokes, activeStroke) {
  drawInkSurface(canvas, strokes, activeStroke);
}

function requestSideInkRender(canvas) {
  if (!canvas || state.lifecycleSuspended) return;
  state.pendingSideInkRenders.add(canvas);
  if (state.sideInkRenderRaf) return;
  state.sideInkRenderRaf = requestAnimationFrame(() => {
    const canvases = [...state.pendingSideInkRenders];
    state.pendingSideInkRenders.clear();
    state.sideInkRenderRaf = 0;
    for (const item of canvases) {
      const note = item.closest('.reader-side-note');
      const annotationId = note?.dataset?.annotationId;
      const blockId = item.dataset.blockId;
      if (annotationId && blockId) drawSideInkCanvas(item, annotationId, blockId);
    }
  });
}

function drawInkSurface(canvas, strokes, activeStroke = null, options = {}) {
  const ctx = canvas.getContext('2d');
  const ratio = Number.isFinite(Number(options.backingRatio))
    ? Number(options.backingRatio)
    : inkBackingRatio(canvas.ownerDocument.defaultView || window);
  const metrics = inkCanvasMetrics(canvas);
  const targetWidth = Math.max(1, Math.round(metrics.width * ratio));
  const targetHeight = Math.max(1, Math.round(metrics.height * ratio));
  if (canvas.width !== targetWidth) canvas.width = targetWidth;
  if (canvas.height !== targetHeight) canvas.height = targetHeight;
  const active = strokeForRender(activeStroke);
  const pendingEraseStrokes = options.pendingEraseStrokes instanceof Set ? options.pendingEraseStrokes : null;
  const pendingEraseStrokeKeys = pendingEraseStrokes?.size
    ? new Set([...pendingEraseStrokes].map(inkStrokeRenderKey))
    : null;
  const isPendingEraseStroke = (stroke) => pendingEraseStrokes?.has(stroke) || pendingEraseStrokeKeys?.has(inkStrokeRenderKey(stroke));

  if (options.useCommittedCache && !pendingEraseStrokes?.size) {
    const cache = committedInkSurfaceCache(canvas, strokes, metrics, ratio, targetWidth, targetHeight);
    prepareInkCanvasContext(ctx, ratio, metrics);
    ctx.drawImage(cache.canvas, 0, 0, targetWidth, targetHeight, 0, 0, metrics.width, metrics.height);
    if (active) drawInkStrokes(ctx, metrics, [active]);
    return;
  }

  prepareInkCanvasContext(ctx, ratio, metrics);
  drawInkStrokes(ctx, metrics, [...strokes, active].filter((stroke) => stroke && !isPendingEraseStroke(stroke)));
  if (pendingEraseStrokes?.size) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    drawInkStrokes(ctx, metrics, strokes.filter((stroke) => isPendingEraseStroke(stroke)));
    ctx.restore();
  }
}

function prepareInkCanvasContext(ctx, ratio, metrics) {
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, metrics.width, metrics.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

function drawInkStrokes(ctx, metrics, strokes) {
  if (!strokes.length) return;
  ctx.save();
  ctx.scale(inkCanvasLogicalScale(metrics), inkCanvasLogicalScale(metrics));
  for (const stroke of strokes) drawStroke(ctx, stroke);
  ctx.restore();
}

function committedInkSurfaceCache(canvas, strokes, metrics, ratio, targetWidth, targetHeight) {
  const signature = committedInkSurfaceSignature(strokes);
  const existing = inkSurfaceCache.get(canvas);
  if (
    existing
    && existing.strokes === strokes
    && existing.signature === signature
    && existing.width === targetWidth
    && existing.height === targetHeight
    && existing.ratio === ratio
  ) {
    return existing;
  }
  const layer = existing?.canvas || canvas.ownerDocument.createElement('canvas');
  if (layer.width !== targetWidth) layer.width = targetWidth;
  if (layer.height !== targetHeight) layer.height = targetHeight;
  const layerCtx = layer.getContext('2d');
  prepareInkCanvasContext(layerCtx, ratio, metrics);
  drawInkStrokes(layerCtx, metrics, strokes);
  const cache = { canvas: layer, strokes, signature, width: targetWidth, height: targetHeight, ratio };
  inkSurfaceCache.set(canvas, cache);
  return cache;
}

function committedInkSurfaceSignature(strokes) {
  const last = strokes.at(-1);
  const pointCount = strokes.reduce((total, stroke) => total + (stroke.points?.length || 0), 0);
  return `${strokes.length}:${pointCount}:${inkStrokeEndpointKey(last)}`;
}

function inkStrokeEndpointKey(stroke) {
  const points = stroke?.points || [];
  const first = points[0];
  const last = points.at(-1);
  return [
    stroke?.color || '',
    clampNumber(stroke?.width, 1, 24, 3),
    stroke?.pressureEnabled === false ? '0' : '1',
    points.length,
    roundInkKeyValue(first?.x),
    roundInkKeyValue(first?.y),
    roundInkKeyValue(last?.x),
    roundInkKeyValue(last?.y)
  ].join('|');
}

function commitSideInkStrokeToRenderCache(canvas, strokes, stroke) {
  if (!canvas || !stroke) return;
  const metrics = inkCanvasMetrics(canvas);
  const ratio = inkBackingRatio(canvas.ownerDocument.defaultView || window);
  const targetWidth = Math.max(1, Math.round(metrics.width * ratio));
  const targetHeight = Math.max(1, Math.round(metrics.height * ratio));
  const previous = inkSurfaceCache.get(canvas);
  if (
    previous
    && previous.strokes === strokes
    && previous.width === targetWidth
    && previous.height === targetHeight
    && previous.ratio === ratio
  ) {
    const layerCtx = previous.canvas.getContext('2d');
    layerCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    layerCtx.lineCap = 'round';
    layerCtx.lineJoin = 'round';
    layerCtx.imageSmoothingEnabled = true;
    layerCtx.imageSmoothingQuality = 'high';
    drawInkStrokes(layerCtx, metrics, [stroke]);
    previous.signature = committedInkSurfaceSignature(strokes);
    const ctx = canvas.getContext('2d');
    prepareInkCanvasContext(ctx, ratio, metrics);
    ctx.drawImage(previous.canvas, 0, 0, targetWidth, targetHeight, 0, 0, metrics.width, metrics.height);
    return;
  }
  drawInkSurface(canvas, strokes, null, { useCommittedCache: true });
}

function inkStrokeRenderKey(stroke) {
  const points = Array.isArray(stroke?.points) ? stroke.points : [];
  return [
    stroke?.color || '',
    clampNumber(stroke?.width, 1, 24, 3),
    stroke?.pressureEnabled === false ? '0' : '1',
    points.map((point) => {
      const x = Number.isFinite(point?.x) ? point.x : point?.[0];
      const y = Number.isFinite(point?.y) ? point.y : point?.[1];
      const pressure = Number.isFinite(point?.pressure) ? point.pressure : point?.[2];
      return `${roundInkKeyValue(x)},${roundInkKeyValue(y)},${roundInkKeyValue(pressure)}`;
    }).join(';')
  ].join('|');
}

function roundInkKeyValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 1000) / 1000 : '';
}

function inkCanvasLogicalScale(metrics) {
  return Math.max(1, metrics?.width || 0) / INK_SPACE.width;
}

function applyInkCanvasHeight(ink, canvasWrap) {
  const height = resolvedInkCanvasHeight(ink, canvasWrap);
  ink.height = height;
  canvasWrap.style.height = `${height}px`;
  return height;
}

function resolvedInkCanvasHeight(ink, canvasWrap) {
  return normalizeInkHeight(Math.max(
    normalizeInkHeight(ink?.height),
    minimumInkCanvasHeight(ink, canvasWrap)
  ));
}

function minimumInkCanvasHeight(ink, canvasWrap, options = {}) {
  const rect = canvasWrap?.getBoundingClientRect?.();
  const width = rect?.width || canvasWrap?.clientWidth || 0;
  const scale = Math.max(1, width) / INK_SPACE.width;
  const bottom = ensureInkLogicalDrawingBottom(ink, options);
  if (!bottom) return INK_CANVAS_HEIGHT.min;
  return normalizeInkHeight(Math.ceil(bottom * scale + INK_CANVAS_HEIGHT.padding), INK_CANVAS_HEIGHT.min);
}

function ensureInkLogicalDrawingBottom(ink, options = {}) {
  const key = inkLogicalBottomCacheKey(ink);
  if (!key) return 0;
  if (!options.refresh && inkLogicalBottomCache.has(key)) return inkLogicalBottomCache.get(key) || 0;
  const bottom = inkLogicalDrawingBottom(ink);
  inkLogicalBottomCache.set(key, bottom);
  return bottom;
}

function updateInkLogicalBottomForStroke(ink, stroke) {
  const key = inkLogicalBottomCacheKey(ink);
  if (!key) return;
  const previous = inkLogicalBottomCache.has(key) ? inkLogicalBottomCache.get(key) || 0 : ensureInkLogicalDrawingBottom(ink);
  inkLogicalBottomCache.set(key, Math.max(previous, strokeLogicalBottom(stroke)));
}

function inkLogicalBottomCacheKey(ink) {
  return Array.isArray(ink?.strokes) ? ink.strokes : null;
}

function inkLogicalDrawingBottom(ink) {
  let bottom = 0;
  for (const stroke of ink?.strokes || []) {
    bottom = Math.max(bottom, strokeLogicalBottom(stroke));
  }
  return bottom;
}

function strokeLogicalBottom(stroke) {
  let bottom = 0;
  const width = clampNumber(stroke?.width, 1, 24, 3);
  for (const point of stroke?.points || []) {
    if (!Number.isFinite(point?.y)) continue;
    bottom = Math.max(bottom, point.y + pointWidth(stroke, point, width) / 2);
  }
  return bottom;
}

function placeCaretAtEnd(element) {
  const doc = element.ownerDocument;
  const range = doc.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = doc.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function placeCaretFromPoint(element, pointerEvent) {
  if (!pointerEvent || !Number.isFinite(pointerEvent.clientX) || !Number.isFinite(pointerEvent.clientY)) {
    placeCaretAtEnd(element);
    return;
  }
  const doc = element.ownerDocument;
  let range = null;
  if (doc.caretRangeFromPoint) {
    range = doc.caretRangeFromPoint(pointerEvent.clientX, pointerEvent.clientY);
  } else if (doc.caretPositionFromPoint) {
    const position = doc.caretPositionFromPoint(pointerEvent.clientX, pointerEvent.clientY);
    if (position) {
      range = doc.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }
  if (!range || !element.contains(range.startContainer)) {
    placeCaretAtEnd(element);
    return;
  }
  const selection = doc.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function drawInkPreview(canvas, ink) {
  if (!canvas?.isConnected) return;
  const wrap = canvas.closest?.('.note-card-ink-wrap') || canvas.parentElement;
  if (wrap) wrap.style.height = `${navigatorInkPreviewHeight(ink, wrap)}px`;
  drawInkSurface(canvas, ink?.strokes || [], null, { backingRatio: INK_PREVIEW_BACKING_RATIO });
}

function requestNavigatorInkPreviewRedraw() {
  if (state.lifecycleSuspended || state.navigatorInkPreviewRenderRaf) return;
  state.navigatorInkPreviewRenderRaf = requestAnimationFrame(() => {
    state.navigatorInkPreviewRenderRaf = 0;
    redrawNavigatorInkPreviews();
  });
}

function redrawNavigatorInkPreviews() {
  if (state.lifecycleSuspended || !els.noteList || !isNotesPanelExpanded()) return;
  els.noteList.querySelectorAll('.note-card-ink').forEach((canvas) => {
    if (!elementNearViewport(canvas, window, 320)) return;
    const annotationId = canvas.dataset.annotationId;
    const blockId = canvas.dataset.blockId;
    if (!annotationId || !blockId) return;
    const annotation = state.annotations.find((item) => item.id === annotationId);
    const block = sideNoteBlockById(annotation, blockId);
    if (block?.type === 'ink') drawInkPreview(canvas, block.ink);
  });
}

function navigatorInkPreviewHeight(ink, wrap) {
  const width = wrap?.getBoundingClientRect?.().width || wrap?.clientWidth || 240;
  const scale = Math.max(1, width) / INK_SPACE.width;
  const bottom = ensureInkLogicalDrawingBottom(ink, { refresh: true });
  const logicalHeight = bottom || INK_SPACE.height;
  return clampNumber(Math.ceil(logicalHeight * scale + 14), 72, 520, 126);
}

function drawStroke(ctx, stroke) {
  const points = stroke.points || [];
  ctx.strokeStyle = stroke.color || '#1c1712';
  ctx.fillStyle = stroke.color || '#1c1712';
  const width = clampNumber(stroke.width, 1, 24, 3);
  if (!points.length) return;
  if (points.length === 1) {
    const radius = pointWidth(stroke, points[0], width) / 2;
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (stroke.pressureEnabled) drawVariableWidthStroke(ctx, stroke, width);
  else drawFixedWidthStroke(ctx, stroke, width);
}

function strokeForRender(stroke) {
  return stroke;
}

function drawFixedWidthStroke(ctx, stroke, width) {
  const points = stroke.points || [];
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineWidth = width;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const previous = points[index - 1];
    const midX = (previous.x + point.x) / 2;
    const midY = (previous.y + point.y) / 2;
    ctx.quadraticCurveTo(previous.x, previous.y, midX, midY);
  }
  ctx.stroke();
}

function drawVariableWidthStroke(ctx, stroke, width) {
  const points = stroke.points || [];
  let previous = points[0];
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    ctx.lineWidth = (pointWidth(stroke, previous, width) + pointWidth(stroke, point, width)) / 2;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    previous = point;
  }
}

function pointWidth(stroke, point, baseWidth) {
  if (!stroke.pressureEnabled) return baseWidth;
  const pressure = clampNumber(point?.pressure, 0, 1, 0.5);
  const factor = PRESSURE_WIDTH.min + (PRESSURE_WIDTH.max - PRESSURE_WIDTH.min) * Math.pow(pressure, PRESSURE_WIDTH.curve);
  return baseWidth * factor * stylusTiltWidthFactor(point);
}

function compactStroke(stroke) {
  return {
    color: stroke.color || '#1c1712',
    width: clampNumber(stroke.width, 1, 24, 3),
    pressureEnabled: stroke.pressureEnabled === true,
    points: (stroke.points || []).map(compactPoint)
  };
}

function compactPoint(point) {
  return {
    x: roundNumber(point.x, 2),
    y: roundNumber(point.y, 2),
    pressure: roundNumber(clampNumber(point.pressure, 0, 1, 0.5), 3),
    t: Math.round(point.t || 0),
    pointerType: point.pointerType || 'pen',
    ...stylusPointProperties(point, 3)
  };
}

function inkBackingRatio(view = window) {
  const deviceRatio = Number(view?.devicePixelRatio) || 1;
  return clampNumber(
    deviceRatio * INK_BACKING_SCALE.multiplier,
    INK_BACKING_SCALE.min,
    INK_BACKING_SCALE.max,
    INK_BACKING_SCALE.min
  );
}

function stylusPointProperties(point, decimals = null) {
  const properties = {};
  addStylusProperty(properties, 'tiltX', point?.tiltX, -90, 90, decimals);
  addStylusProperty(properties, 'tiltY', point?.tiltY, -90, 90, decimals);
  addStylusProperty(properties, 'twist', point?.twist, 0, 359, decimals);
  addStylusProperty(properties, 'tangentialPressure', point?.tangentialPressure, -1, 1, decimals);
  addStylusProperty(properties, 'altitudeAngle', point?.altitudeAngle, 0, Math.PI / 2, decimals);
  addStylusProperty(properties, 'azimuthAngle', point?.azimuthAngle, 0, Math.PI * 2, decimals);
  addStylusProperty(properties, 'contactWidth', point?.contactWidth, 0, 256, decimals);
  addStylusProperty(properties, 'contactHeight', point?.contactHeight, 0, 256, decimals);
  return properties;
}

function addStylusProperty(properties, key, value, min, max, decimals) {
  const number = Number(value);
  if (!Number.isFinite(number)) return;
  const clamped = clampNumber(number, min, max, min);
  properties[key] = decimals == null ? clamped : roundNumber(clamped, decimals);
}

function stylusTiltWidthFactor(point) {
  const altitude = Number(point?.altitudeAngle);
  if (Number.isFinite(altitude)) {
    const tilt = 1 - clampNumber(altitude, 0, Math.PI / 2, Math.PI / 2) / (Math.PI / 2);
    return 1 + tilt * 0.16;
  }
  const tiltX = Number(point?.tiltX);
  const tiltY = Number(point?.tiltY);
  if (!Number.isFinite(tiltX) && !Number.isFinite(tiltY)) return 1;
  const magnitude = Math.hypot(Number.isFinite(tiltX) ? tiltX : 0, Number.isFinite(tiltY) ? tiltY : 0);
  return 1 + clampNumber(magnitude / 90, 0, 1, 0) * 0.16;
}

function roundNumber(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function capitalize(value) {
  const text = String(value || '');
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

function libraryFolderNameReminder(saved, library) {
  const expectedName = libraryFolderNameForTitle(library?.title || 'annotator-library');
  if (!saved?.folder || !saved?.name || saved.name === expectedName) return '';
  return 'Folder name is unchanged because the browser cannot rename the selected local folder automatically.';
}

function setStatus(message, isError = false, options = {}) {
  els.status.textContent = message || '';
  els.status.style.color = isError ? '#8f1f12' : '';
  if (isError && options.visibleNotice !== false) {
    showReaderNotice({
      key: `error:${String(message || '')}`,
      kind: 'error',
      title: options.title || 'Reader needs attention',
      body: message || 'An unknown reader error occurred.',
      retry: Boolean(options.retry)
    });
  }
}

function showReaderLoadFailure(error) {
  const message = error?.message || String(error || 'The source could not be opened.');
  setReaderFrameRestoring(false);
  setStatus(`Could not open this source: ${message}`, true, { visibleNotice: false });
  showReaderNotice({
    key: `load:${state.docId || ''}:${message}`,
    kind: 'error',
    title: 'Source could not be opened',
    body: `${message}\nRetry the browser-local copy, reimport the source, or return to the library.`,
    retry: true,
    force: true
  });
  scheduleServiceWorkerRegistration();
}

function syncReaderDocumentNotice() {
  if (!state.currentDocument || !state.iframeLoaded) return;
  const unresolvedCount = [...state.annotationResolution.values()]
    .filter((resolution) => resolution?.status === 'unresolved').length;
  const notice = buildReaderDocumentNotice({
    docId: state.docId,
    projectionWarnings: readerProjectionWarnings(),
    unresolvedCount
  });
  if (!notice) {
    if (els.readerNotice?.dataset.noticeKind === 'warning') hideReaderNotice();
    return;
  }
  showReaderNotice(notice);
}

function readerProjectionWarnings() {
  const content = getFrameDoc()?.querySelector?.('meta[name="marginalia-projection-warnings"]')?.getAttribute('content');
  if (!content) return [];
  try {
    const values = JSON.parse(content);
    return Array.isArray(values) ? values.map(String).filter(Boolean).slice(0, 20) : [];
  } catch {
    return [];
  }
}

function showReaderNotice({ key, kind = 'error', title, body, retry = false, force = false }) {
  if (!els.readerNotice || !els.readerNoticeTitle || !els.readerNoticeBody) return;
  const noticeKey = String(key || `${kind}:${title}:${body}`);
  if (!force && state.dismissedNoticeKey === noticeKey) return;
  els.readerNotice.dataset.noticeKey = noticeKey;
  els.readerNotice.dataset.noticeKind = kind;
  els.readerNoticeTitle.textContent = title || 'Reader notice';
  els.readerNoticeBody.textContent = body || '';
  if (els.readerNoticeRetry) els.readerNoticeRetry.hidden = !retry;
  if (els.readerNoticeImport) els.readerNoticeImport.hidden = false;
  if (els.readerNoticeLibrary) els.readerNoticeLibrary.hidden = false;
  els.readerNotice.hidden = false;
}

function dismissReaderNotice() {
  if (!els.readerNotice) return;
  state.dismissedNoticeKey = els.readerNotice.dataset.noticeKey || '';
  hideReaderNotice();
}

function hideReaderNotice() {
  if (!els.readerNotice) return;
  els.readerNotice.hidden = true;
}
