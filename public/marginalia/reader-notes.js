import { createReaderSessionChannel } from './reader-session-channel.js';
import { createStorageAdapter } from './storage-adapter.js';
import { analyzeNoteMarkdown, ensureNoteMarkdownStyles, renderNoteMarkdown } from './note-markdown.js';
import { currentStorageMode } from './runtime.js';
import {
  SPLIT_PAGE_ZOOM_DEFAULT,
  applySplitPageZoomSurface,
  nextSplitPageZoom,
  splitPageZoomAction,
  splitPageZoomViewport
} from './split-page-zoom.js';

const params = new URLSearchParams(location.search);
const docId = params.get('doc') || '';
const sessionId = params.get('session') || '';
const INK_SPACE = { width: 1000, height: 562.5 };
const INK_CANVAS_HEIGHT = { min: 96, default: 420, max: 1800 };
const NOTES_PANEL_WIDTH = { min: 260, default: 360 };
const SPLIT_NOTES_DRAWER_MARGIN = 42;
const storage = createStorageAdapter({ mode: currentStorageMode() });

const state = {
  channel: null,
  annotations: [],
  metricsById: new Map(),
  activeAnnotationId: null,
  sourceScrollY: 0,
  sourceScrollHeight: 0,
  sourceViewportHeight: 0,
  inkTool: 'pen',
  inkColor: '#1c1712',
  inkWidth: 3,
  inkPressureEnabled: true,
  inkSession: null,
  textEditSessions: new Map(),
  markdownSources: new WeakMap(),
  markdownAnalysisTimers: new WeakMap(),
  markdownRevision: 0,
  collapsedSideNoteIds: new Set(),
  pinnedAnnotationId: null,
  focusModeAnnotationId: null,
  mode: 'select',
  attachTargetAnnotationId: null,
  removeTargetAnnotationId: null,
  features: {
    focusMode: true,
    singleBlockTextHighlights: true
  },
  expandedNavigatorNoteIds: new Set(),
  noteNavigatorExpandAll: false,
  scrollRaf: 0,
  pendingScrollY: 0,
  lastLocalScrollSentAt: 0,
  remoteScrollTargetY: null,
  remoteScrollTargetUntil: 0,
  notesPanelWidth: null,
  notesPanelResizeSession: null,
  splitPageZoom: SPLIT_PAGE_ZOOM_DEFAULT
};

const els = {
  scroller: document.querySelector('#splitNotesScroller'),
  canvas: document.querySelector('#splitNotesCanvas'),
  status: document.querySelector('#status'),
  noteList: document.querySelector('#noteList'),
  noteCount: document.querySelector('#noteCount'),
  expandAllNotesBtn: document.querySelector('#expandAllNotesBtn'),
  rightPanel: document.querySelector('#rightPanel'),
  toggleNotesBtn: document.querySelector('#toggleNotesBtn'),
  notesPanelResizer: document.querySelector('#notesPanelResizer')
};

init();

function init() {
  if (!docId || !sessionId) {
    setStatus('Open split notes from the reader window.', true);
    renderEmptyState('Open split notes from the reader window.');
    return;
  }
  try {
    state.channel = createReaderSessionChannel({
      docId,
      sessionId,
      role: 'notes',
      onMessage: handleSessionMessage
    });
  } catch (error) {
    setStatus(error.message, true);
    renderEmptyState(error.message);
    return;
  }
  els.scroller.addEventListener('scroll', onNotesScroll, { passive: true });
  els.toggleNotesBtn.addEventListener('click', toggleNavigator);
  els.notesPanelResizer?.addEventListener('pointerdown', onNotesPanelResizerPointerDown);
  els.notesPanelResizer?.addEventListener('keydown', onNotesPanelResizerKeyDown);
  els.expandAllNotesBtn?.addEventListener('click', toggleExpandAllNotes);
  els.noteList.addEventListener('click', onNavigatorClick);
  els.canvas.addEventListener('click', onSideNoteClick);
  els.canvas.addEventListener('dblclick', onSideNoteDoubleClick);
  els.canvas.addEventListener('pointerdown', (event) => {
    if (event.target?.closest?.('.split-side-note-text-mode')) event.preventDefault();
  });
  els.canvas.addEventListener('input', onSideNoteInput);
  els.canvas.addEventListener('change', onSideNoteInput);
  els.canvas.addEventListener('focusout', onSideNoteFocusOut);
  els.canvas.addEventListener('keydown', onSideNoteKeyDown);
  els.canvas.addEventListener('paste', onSideNotePaste);
  document.addEventListener('keydown', handleSplitPageZoomShortcut);
  state.notesPanelWidth = loadNotesPanelWidth();
  applyNotesSplitPageZoom();
  applyNotesPanelWidth();
  window.addEventListener('resize', handleSplitNotesWindowResize);
  window.addEventListener('beforeunload', () => {
    state.channel?.post('close-notes');
    storage.revokeAllNoteImageUrls?.();
  });
  state.channel.post('notes-ready');
  state.channel.post('request-state');
  setStatus('Waiting for reader window.');
}

function handleSessionMessage(envelope) {
  const { type, payload = {} } = envelope;
  if (type === 'source-state') {
    applySourceState(payload);
    return;
  }
  if (type === 'source-scroll') {
    applySourceScroll(payload.scrollY, envelope.sentAt);
    return;
  }
  if (type === 'close-source') {
    setStatus('Reader window closed the split session.');
    state.channel?.close();
    state.channel = null;
    window.close();
  }
}

function applySourceState(payload) {
  state.annotations = Array.isArray(payload.annotations) ? payload.annotations : [];
  state.metricsById = new Map((payload.noteMetrics || []).map((metric) => [metric.id, metric]));
  state.activeAnnotationId = payload.activeAnnotationId || null;
  state.pinnedAnnotationId = payload.pinnedAnnotationId || null;
  state.focusModeAnnotationId = payload.focusModeAnnotationId || null;
  state.collapsedSideNoteIds = new Set(Array.isArray(payload.collapsedSideNoteIds) ? payload.collapsedSideNoteIds : []);
  state.mode = typeof payload.mode === 'string' ? payload.mode : 'select';
  state.attachTargetAnnotationId = payload.attachTargetAnnotationId || null;
  state.removeTargetAnnotationId = payload.removeTargetAnnotationId || null;
  state.features = {
    focusMode: payload.features?.focusMode !== false,
    singleBlockTextHighlights: payload.features?.singleBlockTextHighlights !== false
  };
  state.sourceScrollY = Math.max(0, Number(payload.scrollY) || 0);
  state.sourceScrollHeight = Math.max(splitNotesViewport().height, Number(payload.scrollHeight) || 0);
  state.sourceViewportHeight = Math.max(0, Number(payload.viewportHeight) || 0);
  state.inkTool = payload.inkTool === 'eraser' ? 'eraser' : 'pen';
  state.inkColor = typeof payload.inkColor === 'string' ? payload.inkColor : state.inkColor;
  state.inkWidth = Number.isFinite(Number(payload.inkWidth)) ? Number(payload.inkWidth) : state.inkWidth;
  state.inkPressureEnabled = payload.inkPressureEnabled !== false;
  document.body.classList.toggle('has-pinned-note', Boolean(state.pinnedAnnotationId));
  document.body.classList.toggle('split-focus-mode', Boolean(state.focusModeAnnotationId));
  document.title = payload.documentTitle ? `${payload.documentTitle} - Split Notes` : 'Split Notes - Marginalia';
  renderSideNotes();
  renderNavigator();
  applySourceScroll(state.sourceScrollY);
  setStatus(state.annotations.length ? 'Split notes synced.' : 'No notes in this source.');
}

function renderSideNotes() {
  const focusSnapshot = captureSplitSideNoteFocus();
  const viewportHeight = splitNotesViewport().height;
  els.canvas.style.height = `${Math.max(viewportHeight, Math.ceil(state.sourceScrollHeight || viewportHeight))}px`;
  els.canvas.textContent = '';
  if (!state.annotations.length) {
    renderEmptyState('No notes in this source.');
    return;
  }
  const currentIds = new Set(state.annotations.map((annotation) => annotation.id));
  state.collapsedSideNoteIds = new Set([...state.collapsedSideNoteIds].filter((id) => currentIds.has(id)));
  for (const annotation of orderedSplitAnnotations()) {
    const metric = state.metricsById.get(annotation.id);
    const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
    const note = document.createElement('article');
    note.className = [
      'split-side-note',
      annotation.id === state.activeAnnotationId ? 'is-active' : '',
      annotation.id === state.pinnedAnnotationId ? 'is-pinned' : '',
      isCollapsed ? 'is-collapsed' : '',
      metric?.status === 'unresolved' ? 'is-unresolved' : '',
      metric?.status === 'pending' ? 'is-target-pending' : ''
    ].filter(Boolean).join(' ');
    note.dataset.annotationId = annotation.id;
    note.style.top = `${Math.max(0, Math.round(metric?.top ?? 24))}px`;
    note.innerHTML = sideNoteHtml(annotation, metric);
    els.canvas.append(note);
    hydrateSplitNoteBlocks(note, annotation);
    renderSplitInkCanvases(note, annotation);
  }
  restoreSplitSideNoteFocus(focusSnapshot);
}

function handleSplitPageZoomShortcut(event) {
  const action = splitPageZoomAction(event);
  if (!action) return false;
  event.preventDefault();
  event.stopPropagation();
  const scrollY = Math.max(0, els.scroller?.scrollTop || 0);
  state.splitPageZoom = nextSplitPageZoom(state.splitPageZoom, action);
  applyNotesSplitPageZoom();
  constrainNotesPanelWidthToViewport();
  renderSideNotes();
  els.scroller.scrollTop = scrollY;
  state.lastLocalScrollSentAt = Date.now();
  state.channel?.post('notes-scroll', { scrollY });
  setStatus(`Split notes page zoom: ${Math.round(state.splitPageZoom * 100)}%.`);
  return true;
}

function applyNotesSplitPageZoom() {
  state.splitPageZoom = applySplitPageZoomSurface(document, window, state.splitPageZoom, true);
}

function splitNotesViewport() {
  return splitPageZoomViewport({ width: window.innerWidth, height: window.innerHeight }, state.splitPageZoom);
}

function handleSplitNotesWindowResize() {
  applyNotesSplitPageZoom();
  constrainNotesPanelWidthToViewport();
  renderSideNotes();
}

function orderedSplitAnnotations() {
  const storedIndex = new Map(state.annotations.map((annotation, index) => [annotation.id, index]));
  return state.annotations.slice().sort((a, b) => {
    const aTop = Number(state.metricsById.get(a.id)?.top);
    const bTop = Number(state.metricsById.get(b.id)?.top);
    const aResolved = Number.isFinite(aTop);
    const bResolved = Number.isFinite(bTop);
    if (aResolved !== bResolved) return aResolved ? -1 : 1;
    if (aResolved && Math.abs(aTop - bTop) > 0.5) return aTop - bTop;
    return (storedIndex.get(a.id) || 0) - (storedIndex.get(b.id) || 0);
  });
}

function renderEmptyState(message) {
  els.canvas.style.height = `${Math.max(splitNotesViewport().height, Math.ceil(state.sourceScrollHeight || 0))}px`;
  els.canvas.textContent = '';
  const empty = document.createElement('p');
  empty.className = 'split-notes-empty';
  empty.textContent = message;
  els.canvas.append(empty);
}

function sideNoteHtml(annotation, metric) {
  const title = escapeHtml(sideNoteTitle(annotation));
  const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
  const isPinned = state.pinnedAnnotationId === annotation.id;
  const isFocused = state.focusModeAnnotationId === annotation.id;
  const isAttaching = state.mode === 'attach-highlight' && state.attachTargetAnnotationId === annotation.id;
  const isRemoving = state.mode === 'remove-highlight' && state.removeTargetAnnotationId === annotation.id;
  const hasHighlights = splitAnnotationHasHighlights(annotation);
  const status = metric?.status === 'pending'
    ? '<p class="split-side-note-status">Loading target...</p>'
    : metric?.status === 'unresolved'
      ? '<p class="split-side-note-status">Target unresolved</p>'
      : '';
  return `
    <div class="split-side-note-card">
      <div class="split-side-note-tools">
        ${state.features.focusMode ? `<button type="button" class="split-side-note-tool ${isFocused ? 'is-active' : ''}" data-split-note-action="focus" title="Focus mode" aria-label="${isFocused ? 'Exit focus mode' : 'Enter focus mode'}" aria-pressed="${String(isFocused)}">F</button>` : ''}
        <button type="button" class="split-side-note-tool" data-split-note-action="toggle-collapse" title="${isCollapsed ? 'Expand note' : 'Collapse note'}" aria-label="${isCollapsed ? 'Expand note' : 'Collapse note'}" aria-expanded="${String(!isCollapsed)}">${isCollapsed ? '▼' : '▲'}</button>
        ${state.features.singleBlockTextHighlights ? `<button type="button" class="split-side-note-tool ${isAttaching ? 'is-active' : ''}" data-split-note-action="attach" title="${isAttaching ? 'Adding highlights to this note' : 'Add highlight'}" aria-label="${isAttaching ? 'Finish adding highlights' : 'Add highlight to note'}" aria-pressed="${String(isAttaching)}">+</button>` : ''}
        ${state.features.singleBlockTextHighlights && hasHighlights ? `<button type="button" class="split-side-note-tool ${isRemoving ? 'is-active' : ''}" data-split-note-action="remove-highlight" title="${isRemoving ? 'Click a highlight to remove it' : 'Remove highlight'}" aria-label="${isRemoving ? 'Finish removing highlights' : 'Remove highlight from note'}" aria-pressed="${String(isRemoving)}">−</button>` : ''}
        <button type="button" class="split-side-note-tool ${isPinned ? 'is-active' : ''}" data-split-note-action="pin" title="${isPinned ? 'Unpin note editor' : 'Pin note editor'}" aria-label="${isPinned ? 'Unpin note editor' : 'Pin note editor'}" aria-pressed="${String(isPinned)}">「」</button>
        <button type="button" class="split-side-note-tool danger" data-split-note-action="delete-note" title="Delete note" aria-label="Delete note">×</button>
      </div>
      <h3 class="split-side-note-title" contenteditable="plaintext-only" data-split-note-field="title" data-placeholder="Title">${title}</h3>
      ${status}
      ${sideNoteBlocksHtml(annotation)}
    </div>
  `;
}

function splitAnnotationHasHighlights(annotation) {
  if (annotation?.highlight?.enabled && ['text', 'pdf-rect'].includes(annotation?.target?.type)) return true;
  return (annotation?.targets || []).some((target) => ['text', 'pdf-rect'].includes(target?.type));
}

function sideNoteBlocksHtml(annotation) {
  const blocks = sideNoteBlocks(annotation);
  if (blocks.length === 1 && blocks[0]?.type === 'blank') return insertionBoundaryHtml({});
  const parts = [insertionBoundaryHtml({ beforeBlockId: blocks[0]?.id })];
  blocks.forEach((block) => {
    if (block?.type === 'ink') {
      const height = normalizeInkHeight(block.ink?.height);
      parts.push(`
        <div class="split-side-note-ink-wrap" data-block-id="${escapeHtml(block.id)}" style="height:${height}px">
          <canvas class="split-side-note-ink" data-block-id="${escapeHtml(block.id)}" role="img" aria-label="${escapeHtml(splitDrawingLabel(annotation, block))}"></canvas>
          <div class="split-side-note-ink-tools">
            <button type="button" data-split-note-action="ink-tool-pen" class="${state.inkTool === 'pen' ? 'is-active' : ''}" aria-pressed="${state.inkTool === 'pen'}">Pen</button>
            <label title="Line color"><span>Color</span><input type="color" value="${escapeHtml(state.inkColor)}" data-split-note-action="ink-color"></label>
            <label title="Line width"><span>Width</span><select data-split-note-action="ink-width">${inkWidthOptions(state.inkWidth)}</select></label>
            <label title="Pressure sensitivity"><input type="checkbox" ${state.inkPressureEnabled ? 'checked' : ''} data-split-note-action="ink-pressure"><span>Pressure</span></label>
            <button type="button" data-split-note-action="clear-ink" data-block-id="${escapeHtml(block.id)}">Clear</button>
          </div>
        </div>
      `);
    } else if (block?.type === 'image') {
      parts.push(`
        <div class="split-side-note-image-block" data-block-id="${escapeHtml(block.id)}">
          <div class="split-side-note-image-frame" style="aspect-ratio:${Number(block.intrinsicWidth)} / ${Number(block.intrinsicHeight)};max-width:${Number(block.intrinsicWidth)}px">
            <img class="split-side-note-image" data-asset-path="${escapeHtml(block.assetPath)}" alt="${escapeHtml(block.alt || '')}" loading="eager" decoding="async" hidden>
            <span class="split-side-note-image-placeholder">Loading ${escapeHtml(block.originalName || block.alt || 'picture')}…</span>
          </div>
          <label class="split-side-note-image-alt">Alt text<input type="text" maxlength="500" value="${escapeHtml(block.alt || '')}" data-split-note-action="image-alt" data-block-id="${escapeHtml(block.id)}"></label>
        </div>
      `);
    } else {
      const text = block?.type === 'text' ? block.markdown || '' : '';
      parts.push(`
        <div class="split-side-note-text-block" data-block-id="${escapeHtml(block.id)}">
          <div class="split-side-note-body" tabindex="0" data-block-id="${escapeHtml(block.id)}" data-placeholder="Note">${escapeHtml(text)}</div>
          <div class="split-side-note-text-actions">
            <span class="split-side-note-render-feedback" aria-live="polite" hidden></span>
            <button type="button" class="split-side-note-text-mode" data-split-note-action="edit-text" data-block-id="${escapeHtml(block.id)}" hidden>Edit</button>
          </div>
        </div>
      `);
    }
    parts.push(insertionBoundaryHtml({ afterBlockId: block.id }, block.id));
  });
  return parts.join('');
}

function insertionBoundaryHtml(boundary = {}, removableBlockId = '') {
  return `
    <div class="split-note-insertion-row" ${boundary.beforeBlockId ? `data-before-block-id="${escapeHtml(boundary.beforeBlockId)}"` : ''} ${boundary.afterBlockId ? `data-after-block-id="${escapeHtml(boundary.afterBlockId)}"` : ''}>
      ${removableBlockId ? `<button type="button" class="danger split-note-remove-block" data-split-note-action="remove-block" data-block-id="${escapeHtml(removableBlockId)}">Remove</button>` : ''}
      <span>Add here:</span>
      <button type="button" data-split-note-action="insert-text">Text</button>
      <button type="button" data-split-note-action="insert-ink">Draw</button>
      <button type="button" data-split-note-action="insert-image">Picture</button>
    </div>
  `;
}

function hydrateSplitNoteBlocks(note, annotation) {
  const blocks = sideNoteBlocks(annotation);
  for (const block of blocks) {
    if (block?.type === 'text') {
      const body = note.querySelector(`.split-side-note-body[data-block-id="${cssEscape(block.id)}"]`);
      const button = note.querySelector(`.split-side-note-text-mode[data-block-id="${cssEscape(block.id)}"]`);
      renderSplitMarkdownBlock(body, button, block.id, block.markdown || '');
    }
    if (block?.type === 'image') {
      const image = note.querySelector(`.split-side-note-image[data-asset-path="${cssEscape(block.assetPath)}"]`);
      const placeholder = image?.parentElement?.querySelector('.split-side-note-image-placeholder');
      hydrateSplitImage(image, placeholder, block);
    }
  }
}

async function renderSplitMarkdownBlock(body, button, blockId, source) {
  if (!body || !button) return;
  const revision = ++state.markdownRevision;
  body.dataset.markdownRevision = String(revision);
  state.markdownSources.set(body, source);
  try {
    const rendered = await renderNoteMarkdown(source);
    if (!body.isConnected
      || body.dataset.blockId !== blockId
      || Number(body.dataset.markdownRevision) !== revision
      || state.markdownSources.get(body) !== source
      || body.isContentEditable) return;
    if (!rendered.hasRenderableSyntax) {
      body.textContent = source;
      body.classList.remove('is-rendered', 'note-markdown');
      body.tabIndex = 0;
      button.hidden = true;
      setSplitRenderFeedback(button, '');
      return;
    }
    ensureNoteMarkdownStyles(document);
    body.innerHTML = rendered.html;
    body.classList.add('is-rendered', 'note-markdown');
    body.tabIndex = -1;
    body.dataset.hasRenderableSyntax = 'true';
    button.hidden = false;
    button.textContent = 'Edit';
    button.dataset.splitNoteAction = 'edit-text';
    setSplitRenderFeedback(button, '');
  } catch {
    if (body.isConnected) body.textContent = source;
  }
}

function setSplitRenderFeedback(button, message = '') {
  const feedback = button?.closest?.('.split-side-note-text-actions')
    ?.querySelector?.('.split-side-note-render-feedback');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.hidden = !message;
}

async function hydrateSplitImage(image, placeholder, block) {
  if (!image || !placeholder) return;
  try {
    const url = await storage.getNoteImageUrl(docId, block.assetPath);
    if (!image.isConnected || image.dataset.assetPath !== block.assetPath) return;
    image.addEventListener('load', () => {
      image.hidden = false;
      placeholder.hidden = true;
    }, { once: true });
    image.addEventListener('error', () => {
      image.hidden = true;
      placeholder.hidden = false;
      placeholder.textContent = `Picture unavailable: ${block.originalName || block.alt || 'image'}`;
    }, { once: true });
    image.src = url;
  } catch {
    if (!image.isConnected) return;
    placeholder.textContent = `Picture unavailable: ${block.originalName || block.alt || 'image'}`;
  }
}

function splitDrawingLabel(annotation, block) {
  const count = Array.isArray(block?.ink?.strokes) ? block.ink.strokes.length : 0;
  const title = readableSnippet(sideNoteTitle(annotation) || 'Untitled note', 72);
  return `${title} drawing, ${count} stroke${count === 1 ? '' : 's'}.`;
}

function captureSplitSideNoteFocus() {
  const active = document.activeElement;
  const note = active?.closest?.('.split-side-note[data-annotation-id]');
  if (!note || !els.canvas.contains(active)) return null;
  return {
    annotationId: note.dataset.annotationId,
    action: active.dataset?.splitNoteAction || '',
    field: active.dataset?.splitNoteField || '',
    blockId: active.dataset?.blockId || active.closest?.('[data-block-id]')?.dataset.blockId || ''
  };
}

function restoreSplitSideNoteFocus(snapshot) {
  if (!snapshot?.annotationId) return;
  const note = els.canvas.querySelector(`.split-side-note[data-annotation-id="${cssEscape(snapshot.annotationId)}"]`);
  let target = null;
  if (snapshot.action) target = note?.querySelector(`[data-split-note-action="${cssEscape(snapshot.action)}"][data-block-id="${cssEscape(snapshot.blockId)}"], [data-split-note-action="${cssEscape(snapshot.action)}"]`);
  if (!target && snapshot.field) target = note?.querySelector(`[data-split-note-field="${cssEscape(snapshot.field)}"]`);
  if (!target && snapshot.blockId) target = note?.querySelector(`[data-block-id="${cssEscape(snapshot.blockId)}"]`);
  target?.focus?.({ preventScroll: true });
}

function renderNavigator() {
  const focusSnapshot = captureSplitNavigatorFocus();
  const count = state.annotations.length;
  els.noteCount.textContent = `${count} annotation${count === 1 ? '' : 's'} in this document.`;
  if (els.expandAllNotesBtn) {
    els.expandAllNotesBtn.textContent = state.noteNavigatorExpandAll ? 'Collapse all' : 'Expand all';
    els.expandAllNotesBtn.disabled = !count;
    els.expandAllNotesBtn.setAttribute('aria-expanded', String(state.noteNavigatorExpandAll));
  }
  els.noteList.textContent = '';
  if (!count) {
    const empty = document.createElement('p');
    empty.className = 'small';
    empty.textContent = 'No annotations yet.';
    els.noteList.append(empty);
    return;
  }
  const currentIds = new Set(state.annotations.map((annotation) => annotation.id));
  state.expandedNavigatorNoteIds = new Set([...state.expandedNavigatorNoteIds].filter((id) => currentIds.has(id)));
  for (const annotation of state.annotations) {
    els.noteList.append(createNavigatorCard(annotation));
  }
  restoreSplitNavigatorFocus(focusSnapshot);
}

function createNavigatorCard(annotation) {
  const metric = state.metricsById.get(annotation.id);
  const expanded = isNavigatorNoteExpanded(annotation.id);
  const card = document.createElement('article');
  card.tabIndex = -1;
  card.className = [
    'note-card',
    annotation.id === state.activeAnnotationId ? 'is-active' : '',
    metric?.status === 'unresolved' ? 'is-unresolved' : '',
    metric?.status === 'pending' ? 'is-target-pending' : '',
    expanded ? 'is-expanded' : ''
  ].filter(Boolean).join(' ');
  card.dataset.annotationId = annotation.id;
  card.innerHTML = `
    <div class="note-card-header">
      <div class="note-card-heading">
        <p class="note-card-title">${escapeHtml(navigatorTitle(annotation))}</p>
        <div class="note-card-meta">${escapeHtml(navigatorMeta(metric))}</div>
      </div>
      <div class="note-card-actions">
        <button type="button" class="note-card-expand" data-action="toggle-expand" aria-expanded="${expanded}" aria-controls="${splitNavigatorContentId(annotation.id)}">${escapeHtml(navigatorExpandButtonLabel(annotation.id))}</button>
        <button type="button" data-action="goto">Go to</button>
        <button type="button" class="danger" data-action="delete">Delete</button>
      </div>
    </div>
    ${expanded ? navigatorContentHtml(annotation) : ''}
  `;
  hydrateSplitNavigatorCard(card, annotation);
  return card;
}

function navigatorContentHtml(annotation) {
  const blocks = sideNoteBlocks(annotation);
  const parts = [];
  for (const block of blocks) {
    if (block?.type === 'text' && block.markdown?.trim()) {
      parts.push(`<div class="note-card-content-text note-markdown" data-block-id="${escapeHtml(block.id)}">${escapeHtml(block.markdown)}</div>`);
      continue;
    }
    if (block?.type === 'ink' && Array.isArray(block.ink?.strokes) && block.ink.strokes.length) {
      parts.push('<div class="note-card-content-empty">Drawing</div>');
    }
    if (block?.type === 'image') {
      parts.push(`<div class="note-card-image-block"><div class="split-side-note-image-frame" style="aspect-ratio:${Number(block.intrinsicWidth)} / ${Number(block.intrinsicHeight)};max-width:${Number(block.intrinsicWidth)}px"><img class="split-side-note-image" data-asset-path="${escapeHtml(block.assetPath)}" alt="${escapeHtml(block.alt || '')}" loading="eager" decoding="async" hidden><span class="split-side-note-image-placeholder">Loading ${escapeHtml(block.originalName || block.alt || 'picture')}…</span></div></div>`);
    }
  }
  if (!parts.length && !sideNoteTitle(annotation).trim()) parts.push('<div class="note-card-content-empty">Empty note</div>');
  if (!parts.length) parts.push('<div class="note-card-content-empty">No note body.</div>');
  return `<div id="${splitNavigatorContentId(annotation.id)}" class="note-card-content">${parts.join('')}</div>`;
}

function hydrateSplitNavigatorCard(card, annotation) {
  for (const block of sideNoteBlocks(annotation)) {
    if (block?.type === 'text' && block.markdown?.trim()) {
      const element = card.querySelector(`.note-card-content-text[data-block-id="${cssEscape(block.id)}"]`);
      if (element) renderNoteMarkdown(block.markdown).then((rendered) => {
        if (!element.isConnected) return;
        ensureNoteMarkdownStyles(document);
        element.innerHTML = rendered.html;
      }).catch(() => {});
    }
    if (block?.type === 'image') {
      const image = card.querySelector(`.split-side-note-image[data-asset-path="${cssEscape(block.assetPath)}"]`);
      if (image) hydrateSplitImage(image, image.parentElement.querySelector('.split-side-note-image-placeholder'), block);
    }
  }
}

function splitNavigatorContentId(annotationId) {
  return `split-note-card-content-${String(annotationId || '').replace(/[^\w.-]+/g, '-')}`;
}

function captureSplitNavigatorFocus() {
  const active = document.activeElement;
  const card = active?.closest?.('.note-card[data-annotation-id]');
  if (!card || !els.noteList.contains(active)) return null;
  return { annotationId: card.dataset.annotationId, action: active.dataset?.action || '' };
}

function restoreSplitNavigatorFocus(snapshot) {
  if (!snapshot?.annotationId) return;
  const card = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(snapshot.annotationId)}"]`);
  const target = snapshot.action
    ? card?.querySelector(`[data-action="${cssEscape(snapshot.action)}"]`)
    : card;
  target?.focus?.({ preventScroll: true });
}

function navigatorTitle(annotation) {
  const title = sideNoteTitle(annotation);
  if (title) return title;
  const text = sideNoteText(annotation);
  if (text) return readableSnippet(text, 240);
  const strokes = sideNoteBlocks(annotation)
    .filter((block) => block?.type === 'ink')
    .reduce((count, block) => count + (Array.isArray(block.ink?.strokes) ? block.ink.strokes.length : 0), 0);
  if (strokes) return `Drawing note (${strokes} stroke${strokes === 1 ? '' : 's'})`;
  const picture = sideNoteBlocks(annotation).find((block) => block?.type === 'image');
  if (picture) return picture.alt?.trim() || picture.originalName?.trim() || 'Picture note';
  return 'Empty side note';
}

function navigatorMeta(metric) {
  if (metric?.status === 'pending') return metric.pageNumber ? `Loading page ${metric.pageNumber}...` : 'Loading target...';
  if (metric?.status === 'unresolved') return 'Target unresolved';
  if (metric?.locationLabel) return metric.locationLabel;
  return metric?.pageNumber ? `Page ${metric.pageNumber}` : 'Document';
}

function onSideNoteClick(event) {
  const note = event.target?.closest?.('.split-side-note');
  if (!note) return;
  const link = event.target?.closest?.('.split-side-note-body.is-rendered a[href]');
  if (link) {
    event.preventDefault();
    event.stopPropagation();
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView?.({ block: 'start' });
    else {
      try {
        const url = new URL(href, location.href);
        if (['http:', 'https:', 'mailto:'].includes(url.protocol)) window.open(url.href, '_blank', 'noopener,noreferrer');
      } catch {
        // Invalid links remain inert.
      }
    }
    return;
  }
  const annotationId = note.dataset.annotationId;
  if (!annotationId) return;
  const actionButton = event.target?.closest?.('[data-split-note-action]');
  const action = actionButton?.dataset?.splitNoteAction || '';
  if (action === 'toggle-collapse') {
    state.channel?.post('toggle-note-collapse', { annotationId });
    return;
  }
  if (action === 'pin') {
    state.channel?.post('toggle-pin-note', { annotationId });
    return;
  }
  if (action === 'focus') {
    state.channel?.post('toggle-focus-note', { annotationId });
    return;
  }
  if (action === 'attach') {
    state.channel?.post('toggle-attach-highlight', { annotationId });
    return;
  }
  if (action === 'remove-highlight') {
    state.channel?.post('toggle-remove-highlight', { annotationId });
    return;
  }
  if (action === 'delete-note') {
    requestDeleteAnnotation(annotationId, actionButton);
    return;
  }
  if (action === 'edit-text') {
    beginSplitTextEdit(annotationId, actionButton.dataset.blockId);
    return;
  }
  if (action === 'render-text') {
    tryRenderSplitTextBlock(annotationId, actionButton.dataset.blockId)
      .catch((error) => setStatus(error.message, true));
    return;
  }
  if (action === 'insert-text' || action === 'insert-ink' || action === 'insert-image') {
    const boundary = actionButton.closest('.split-note-insertion-row');
    const location = {
      beforeBlockId: boundary?.dataset.beforeBlockId || '',
      afterBlockId: boundary?.dataset.afterBlockId || ''
    };
    if (action === 'insert-image') {
      pickSplitNoteImage(annotationId, location);
      return;
    }
    state.channel?.post('insert-note-block', {
      annotationId,
      blockType: action === 'insert-ink' ? 'ink' : 'text',
      ...location
    });
    return;
  }
  if (action === 'remove-block') {
    state.channel?.post('remove-note-block', {
      annotationId,
      blockId: actionButton.dataset.blockId
    });
    return;
  }
  if (action === 'clear-ink') {
    state.channel?.post('clear-ink-block', {
      annotationId,
      blockId: actionButton.dataset.blockId
    });
    return;
  }
  if (['ink-color', 'ink-width', 'ink-pressure'].includes(action)) {
    updateInkToolFromControl(actionButton);
    return;
  }
  if (action === 'ink-tool-pen') {
    state.inkTool = 'pen';
    state.channel?.post('set-ink-tool', {
      tool: 'pen',
      color: state.inkColor,
      width: state.inkWidth,
      pressureEnabled: state.inkPressureEnabled
    });
    return;
  }
  const plainBody = event.target?.closest?.('.split-side-note-body:not(.is-rendered)');
  if (plainBody) {
    beginSplitTextEdit(annotationId, plainBody.dataset.blockId);
    return;
  }
  if (event.target?.closest?.('[contenteditable], input, canvas, .split-side-note-ink-tools, .is-rendered')) return;
  state.channel?.post('activate-annotation', { annotationId });
}

function onSideNoteDoubleClick(event) {
  const body = event.target?.closest?.('.split-side-note-body.is-rendered');
  const note = body?.closest?.('.split-side-note');
  if (!body || !note) return;
  event.preventDefault();
  event.stopPropagation();
  beginSplitTextEdit(note.dataset.annotationId, body.dataset.blockId);
}

function onSideNoteInput(event) {
  const body = event.target?.closest?.('.split-side-note-body[contenteditable]');
  if (body) {
    scheduleSplitMarkdownAnalysis(body);
    return;
  }
  const control = event.target?.closest?.('[data-split-note-action]');
  if (!control) return;
  const action = control.dataset.splitNoteAction;
  if (['ink-color', 'ink-width', 'ink-pressure'].includes(action)) updateInkToolFromControl(control);
  if (action === 'image-alt' && event.type === 'change') {
    const note = control.closest('.split-side-note');
    state.channel?.post('save-note-image-alt', {
      annotationId: note?.dataset.annotationId,
      blockId: control.dataset.blockId,
      alt: control.value || ''
    });
  }
}

function onSideNoteFocusOut(event) {
  const note = event.target?.closest?.('.split-side-note');
  if (!note || !event.target?.closest?.('[contenteditable]')) return;
  if (event.target.matches('[data-split-note-field="title"]')) {
    state.channel?.post('save-note-text', { annotationId: note.dataset.annotationId, title: editablePlainText(event.target) });
    return;
  }
  const body = event.target.closest('.split-side-note-body');
  if (body) finishSplitTextEdit(note.dataset.annotationId, body.dataset.blockId, { save: true });
}

function onSideNoteKeyDown(event) {
  const body = event.target?.closest?.('.split-side-note-body');
  const note = event.target?.closest?.('.split-side-note');
  if (body && !body.isContentEditable && !body.classList.contains('is-rendered') && ['Enter', 'F2'].includes(event.key)) {
    event.preventDefault();
    beginSplitTextEdit(note?.dataset.annotationId, body.dataset.blockId);
    return;
  }
  if (!event.target?.closest?.('[contenteditable]')) return;
  if (body && event.key === 'Tab' && !event.shiftKey && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    insertTextAtEditableSelection(body, '\t');
    return;
  }
  if (body && event.key === 'Escape') {
    event.preventDefault();
    finishSplitTextEdit(note?.dataset.annotationId, body.dataset.blockId, { save: false });
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    if (body) finishSplitTextEdit(note?.dataset.annotationId, body.dataset.blockId, { save: true });
    else event.target.blur();
  }
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

function onSideNotePaste(event) {
  if (!event.target?.closest?.('[contenteditable]')) return;
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain') || '';
  document.execCommand?.('insertText', false, text);
}

function beginSplitTextEdit(annotationId, blockId) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  const block = sideNoteBlocks(annotation).find((item) => item.id === blockId);
  const note = els.canvas.querySelector(`.split-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  const body = note?.querySelector(`.split-side-note-body[data-block-id="${cssEscape(blockId)}"]`);
  const button = note?.querySelector(`.split-side-note-text-mode[data-block-id="${cssEscape(blockId)}"]`);
  if (block?.type !== 'text' || !body || !button) return;
  const key = `${annotationId}:${blockId}`;
  state.textEditSessions.set(key, { original: block.markdown || '' });
  body.textContent = block.markdown || '';
  body.classList.remove('is-rendered', 'note-markdown');
  body.contentEditable = 'plaintext-only';
  body.tabIndex = 0;
  button.dataset.splitNoteAction = 'render-text';
  button.textContent = 'Render';
  button.hidden = false;
  setSplitRenderFeedback(button, '');
  body.focus({ preventScroll: true });
  placeCaretAtEnd(body);
}

async function tryRenderSplitTextBlock(annotationId, blockId) {
  const note = els.canvas.querySelector(`.split-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  const body = note?.querySelector(`.split-side-note-body[data-block-id="${cssEscape(blockId)}"]`);
  const button = note?.querySelector(`.split-side-note-text-mode[data-block-id="${cssEscape(blockId)}"]`);
  if (!body?.isContentEditable || !button) return;
  const source = editablePlainText(body);
  const rendered = await renderNoteMarkdown(source);
  if (!body.isConnected || !body.isContentEditable || editablePlainText(body) !== source) return;
  body.dataset.hasRenderableSyntax = rendered.hasRenderableSyntax ? 'true' : 'false';
  if (!rendered.hasRenderableSyntax) {
    setSplitRenderFeedback(button, 'No markdown to render');
    body.focus({ preventScroll: true });
    return;
  }
  setSplitRenderFeedback(button, '');
  finishSplitTextEdit(annotationId, blockId, { save: true });
}

function finishSplitTextEdit(annotationId, blockId, options = {}) {
  const key = `${annotationId}:${blockId}`;
  const session = state.textEditSessions.get(key);
  if (!session) return;
  const note = els.canvas.querySelector(`.split-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
  const body = note?.querySelector(`.split-side-note-body[data-block-id="${cssEscape(blockId)}"]`);
  const markdown = options.save === false ? session.original : editablePlainText(body);
  state.textEditSessions.delete(key);
  const annotation = state.annotations.find((item) => item.id === annotationId);
  const blocks = sideNoteBlocks(annotation);
  const block = blocks.find((item) => item.id === blockId);
  if (block?.type === 'text') block.markdown = markdown;
  if (annotation?.note && block?.type === 'text') annotation.note.blocks = blocks;
  if (options.save !== false) {
    state.channel?.post('save-note-text', { annotationId, blockId, markdown });
    setStatus('Saving note...');
  }
  renderSideNotes();
  renderNavigator();
}

function scheduleSplitMarkdownAnalysis(body) {
  const previous = state.markdownAnalysisTimers.get(body);
  if (previous) clearTimeout(previous);
  const timer = setTimeout(async () => {
    const source = editablePlainText(body);
    const button = body.closest('.split-side-note-text-block')?.querySelector('.split-side-note-text-mode');
    if (!button) return;
    try {
      const result = await analyzeNoteMarkdown(source);
      if (!body.isConnected || !body.isContentEditable || editablePlainText(body) !== source) return;
      button.hidden = false;
      body.dataset.hasRenderableSyntax = result.hasRenderableSyntax ? 'true' : 'false';
    } catch {
      button.hidden = false;
    }
  }, 120);
  state.markdownAnalysisTimers.set(body, timer);
}

function pickSplitNoteImage(annotationId, boundary = {}) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.jpg,.jpeg,image/jpeg,.png,image/png,.webp,image/webp';
  input.hidden = true;
  document.body.append(input);
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    state.channel?.post('insert-note-image', { annotationId, file, ...boundary });
    setStatus('Adding picture...');
  }, { once: true });
  input.addEventListener('cancel', () => input.remove(), { once: true });
  input.click();
}

function onNavigatorClick(event) {
  const card = event.target?.closest?.('.note-card');
  if (!card) return;
  const annotationId = card.dataset.annotationId;
  const action = event.target?.closest?.('[data-action]')?.dataset?.action;
  if (action === 'toggle-expand') {
    toggleNavigatorNoteExpansion(annotationId);
    return;
  }
  if (action === 'delete') {
    requestDeleteAnnotation(annotationId, event.target);
    return;
  }
  if (action === 'goto') alignSplitNoteToTop(annotationId);
}

function alignSplitNoteToTop(annotationId) {
  state.channel?.post('jump-to-annotation', { annotationId });
}

function onNotesScroll() {
  const y = Math.max(0, els.scroller.scrollTop || 0);
  if (consumeRemoteScrollEcho(y)) return;
  state.pendingScrollY = y;
  if (state.scrollRaf) return;
  state.scrollRaf = requestAnimationFrame(() => {
    state.scrollRaf = 0;
    const currentScrollY = Number(els.scroller.scrollTop);
    const scrollY = Math.max(0, Number.isFinite(currentScrollY) ? currentScrollY : state.pendingScrollY || 0);
    state.pendingScrollY = scrollY;
    state.lastLocalScrollSentAt = Date.now();
    state.channel?.post('notes-scroll', { scrollY });
  });
}

function applySourceScroll(scrollY, sentAt = 0) {
  if (Number(sentAt) && Number(sentAt) < state.lastLocalScrollSentAt) return;
  const y = Math.max(0, Number(scrollY) || 0);
  if (Math.abs((els.scroller.scrollTop || 0) - y) < 1) return;
  markRemoteScrollTarget(y);
  els.scroller.scrollTop = y;
}

function markRemoteScrollTarget(scrollY) {
  state.remoteScrollTargetY = Math.max(0, Number(scrollY) || 0);
  state.remoteScrollTargetUntil = performance.now() + 350;
}

function consumeRemoteScrollEcho(scrollY) {
  if (state.remoteScrollTargetY == null) return false;
  if (performance.now() > state.remoteScrollTargetUntil) {
    clearRemoteScrollTarget();
    return false;
  }
  if (Math.abs(scrollY - state.remoteScrollTargetY) <= 1.5) {
    clearRemoteScrollTarget();
    return true;
  }
  clearRemoteScrollTarget();
  return false;
}

function clearRemoteScrollTarget() {
  state.remoteScrollTargetY = null;
  state.remoteScrollTargetUntil = 0;
}

function toggleNavigator() {
  const collapsed = !els.rightPanel.classList.contains('is-collapsed');
  els.rightPanel.classList.toggle('is-collapsed', collapsed);
  if (els.notesPanelResizer) els.notesPanelResizer.tabIndex = collapsed ? -1 : 0;
  els.toggleNotesBtn.setAttribute('aria-expanded', String(!collapsed));
  const label = collapsed ? 'Open notes navigator' : 'Close notes navigator';
  els.toggleNotesBtn.title = label;
  els.toggleNotesBtn.setAttribute('aria-label', label);
  const arrow = els.toggleNotesBtn.querySelector('.notes-tab-arrow');
  if (arrow) arrow.textContent = collapsed ? '‹' : '›';
  if (!collapsed) requestAnimationFrame(focusActiveSplitNavigatorCard);
}

function focusActiveSplitNavigatorCard() {
  if (!state.activeAnnotationId || els.rightPanel.classList.contains('is-collapsed')) return;
  const card = els.noteList.querySelector(`.note-card[data-annotation-id="${cssEscape(state.activeAnnotationId)}"]`);
  if (!card) return;
  card.focus({ preventScroll: true });
  card.scrollIntoView({ block: 'center', inline: 'nearest' });
}

function onNotesPanelResizerPointerDown(event) {
  if (event.button != null && event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const session = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startWidth: currentNotesPanelWidth(),
    handle: event.currentTarget
  };
  state.notesPanelResizeSession = session;
  session.handle.classList.add('is-dragging');
  try {
    session.handle.setPointerCapture?.(event.pointerId);
  } catch {
    // Pointer capture is best effort for synthetic events and older browsers.
  }
  document.addEventListener('pointermove', onNotesPanelResizeMove);
  document.addEventListener('pointerup', finishNotesPanelResize);
  document.addEventListener('pointercancel', finishNotesPanelResize);
}

function onNotesPanelResizeMove(event) {
  const session = state.notesPanelResizeSession;
  if (!session || event.pointerId !== session.pointerId) return;
  event.preventDefault();
  state.notesPanelWidth = normalizeNotesPanelWidth(
    session.startWidth + (session.startX - event.clientX) / state.splitPageZoom
  );
  applyNotesPanelWidth();
}

function finishNotesPanelResize(event) {
  const session = state.notesPanelResizeSession;
  if (!session || (event?.pointerId != null && event.pointerId !== session.pointerId)) return;
  event?.preventDefault?.();
  session.handle?.classList.remove('is-dragging');
  document.removeEventListener('pointermove', onNotesPanelResizeMove);
  document.removeEventListener('pointerup', finishNotesPanelResize);
  document.removeEventListener('pointercancel', finishNotesPanelResize);
  state.notesPanelResizeSession = null;
  saveNotesPanelWidth();
  setStatus(`Notes navigator width ${Math.round(state.notesPanelWidth)} pixels.`);
}

function onNotesPanelResizerKeyDown(event) {
  const step = event.shiftKey ? 48 : 12;
  const bounds = notesPanelWidthBounds();
  const current = currentNotesPanelWidth();
  let next = null;
  if (event.key === 'ArrowLeft') next = current + step;
  if (event.key === 'ArrowRight') next = current - step;
  if (event.key === 'Home') next = bounds.min;
  if (event.key === 'End') next = bounds.max;
  if (event.key === '0') next = NOTES_PANEL_WIDTH.default;
  if (next == null) return;
  event.preventDefault();
  event.stopPropagation();
  state.notesPanelWidth = normalizeNotesPanelWidth(next);
  applyNotesPanelWidth();
  saveNotesPanelWidth();
  setStatus(`Notes navigator width ${Math.round(state.notesPanelWidth)} pixels.`);
}

function constrainNotesPanelWidthToViewport() {
  const previous = state.notesPanelWidth;
  applyNotesPanelWidth();
  if (previous !== state.notesPanelWidth) saveNotesPanelWidth();
}

function applyNotesPanelWidth() {
  const bounds = notesPanelWidthBounds();
  const width = normalizeNotesPanelWidth(state.notesPanelWidth);
  state.notesPanelWidth = width;
  document.body.style.setProperty('--reader-notes-panel-width', `${Math.round(width)}px`);
  if (!els.notesPanelResizer) return;
  els.notesPanelResizer.setAttribute('aria-valuemin', String(Math.round(bounds.min)));
  els.notesPanelResizer.setAttribute('aria-valuemax', String(Math.round(bounds.max)));
  els.notesPanelResizer.setAttribute('aria-valuenow', String(Math.round(width)));
  els.notesPanelResizer.setAttribute('aria-valuetext', `${Math.round(width)} pixels wide`);
}

function currentNotesPanelWidth() {
  const width = Number.parseFloat(getComputedStyle(els.rightPanel).width);
  return normalizeNotesPanelWidth(Number.isFinite(width) && width > 0 ? width : state.notesPanelWidth);
}

function notesPanelWidthBounds() {
  const max = Math.max(1, splitNotesViewport().width - SPLIT_NOTES_DRAWER_MARGIN);
  return { min: Math.min(NOTES_PANEL_WIDTH.min, max), max };
}

function normalizeNotesPanelWidth(value) {
  const bounds = notesPanelWidthBounds();
  const fallback = Math.min(NOTES_PANEL_WIDTH.default, bounds.max);
  return Math.min(bounds.max, Math.max(bounds.min, Number.isFinite(value) ? value : fallback));
}

function notesPanelWidthStorageKey() {
  return `reader-split-notes-panel-width:${docId || 'default'}`;
}

function loadNotesPanelWidth() {
  try {
    return normalizeNotesPanelWidth(JSON.parse(localStorage.getItem(notesPanelWidthStorageKey()) || 'null'));
  } catch {
    return normalizeNotesPanelWidth(null);
  }
}

function saveNotesPanelWidth() {
  localStorage.setItem(notesPanelWidthStorageKey(), JSON.stringify(normalizeNotesPanelWidth(state.notesPanelWidth)));
}

function toggleExpandAllNotes() {
  state.noteNavigatorExpandAll = !state.noteNavigatorExpandAll;
  if (state.noteNavigatorExpandAll) state.expandedNavigatorNoteIds.clear();
  renderNavigator();
}

function isNavigatorNoteExpanded(annotationId) {
  return state.noteNavigatorExpandAll || state.expandedNavigatorNoteIds.has(annotationId);
}

function navigatorExpandButtonLabel(annotationId) {
  if (state.noteNavigatorExpandAll) return 'Collapse others';
  return state.expandedNavigatorNoteIds.has(annotationId) ? 'Collapse' : 'Expand';
}

function toggleNavigatorNoteExpansion(annotationId) {
  if (!annotationId) return;
  if (state.noteNavigatorExpandAll) {
    state.noteNavigatorExpandAll = false;
    state.expandedNavigatorNoteIds = new Set([annotationId]);
    renderNavigator();
    return;
  }
  if (state.expandedNavigatorNoteIds.has(annotationId)) state.expandedNavigatorNoteIds.delete(annotationId);
  else state.expandedNavigatorNoteIds.add(annotationId);
  renderNavigator();
}

function requestDeleteAnnotation(annotationId, anchorElement) {
  const annotation = state.annotations.find((item) => item.id === annotationId);
  if (!annotation || !anchorElement) return;
  closeDeleteConfirmPopovers();
  const popover = document.createElement('div');
  popover.className = 'reader-delete-confirm-popover split-delete-confirm-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-label', 'Delete note');
  popover.innerHTML = `
    <p>Delete "${escapeHtml(readableSnippet(sideNoteTitle(annotation) || sideNoteText(annotation) || 'Empty note', 72))}"?</p>
    <div class="reader-delete-confirm-actions">
      <button type="button" data-delete-choice="cancel">Cancel</button>
      <button type="button" class="danger" data-delete-choice="confirm">Delete</button>
    </div>
  `;
  document.body.append(popover);
  positionDeleteConfirmPopover(popover, anchorElement);
  const cancel = popover.querySelector('[data-delete-choice="cancel"]');
  const confirm = popover.querySelector('[data-delete-choice="confirm"]');
  const fallbackId = neighboringSplitAnnotationId(annotationId);
  let closed = false;
  const onPointerDown = (event) => {
    if (!popover.contains(event.target)) close(true);
  };
  const close = (restoreFocus = true) => {
    if (closed) return;
    closed = true;
    document.removeEventListener('pointerdown', onPointerDown, true);
    popover.remove();
    if (restoreFocus && anchorElement.isConnected) anchorElement.focus({ preventScroll: true });
  };
  popover._closeConfirmPopover = close;
  cancel?.addEventListener('click', () => close(true));
  confirm?.addEventListener('click', () => {
    close(false);
    focusSplitSideNote(fallbackId);
    state.channel?.post('delete-annotation', { annotationId });
  });
  popover.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key !== 'Tab') return;
    const buttons = Array.from(popover.querySelectorAll('button:not(:disabled)'));
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  setTimeout(() => {
    if (closed) return;
    document.addEventListener('pointerdown', onPointerDown, true);
    cancel?.focus?.({ preventScroll: true });
  }, 0);
}

function closeDeleteConfirmPopovers() {
  document.querySelectorAll('.split-delete-confirm-popover').forEach((popover) => {
    if (typeof popover._closeConfirmPopover === 'function') popover._closeConfirmPopover(true);
    else popover.remove();
  });
}

function neighboringSplitAnnotationId(annotationId) {
  const ordered = orderedSplitAnnotations();
  const index = ordered.findIndex((annotation) => annotation.id === annotationId);
  return index < 0 ? null : ordered[index + 1]?.id || ordered[index - 1]?.id || null;
}

function focusSplitSideNote(annotationId) {
  if (!annotationId) return;
  requestAnimationFrame(() => {
    const note = els.canvas.querySelector(`.split-side-note[data-annotation-id="${cssEscape(annotationId)}"]`);
    (note?.querySelector('[data-split-note-action="toggle-collapse"]') || note?.querySelector('[contenteditable]'))?.focus?.({ preventScroll: true });
  });
}

function positionDeleteConfirmPopover(popover, anchorElement) {
  const rect = anchorElement.getBoundingClientRect();
  const width = popover.offsetWidth || 214;
  const height = popover.offsetHeight || 86;
  const left = Math.min(Math.max(8, rect.right - width), Math.max(8, window.innerWidth - width - 8));
  const preferredTop = rect.bottom + 6;
  const top = preferredTop + height <= window.innerHeight - 8
    ? preferredTop
    : Math.max(8, rect.top - height - 6);
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function updateInkToolFromControl(control) {
  const action = control?.dataset?.splitNoteAction;
  if (action === 'ink-color') state.inkColor = control.value || state.inkColor;
  if (action === 'ink-width') state.inkWidth = Number(control.value) || state.inkWidth;
  if (action === 'ink-pressure') state.inkPressureEnabled = Boolean(control.checked);
  state.channel?.post('set-ink-tool', {
    tool: state.inkTool,
    color: state.inkColor,
    width: state.inkWidth,
    pressureEnabled: state.inkPressureEnabled
  });
}

function renderSplitInkCanvases(note, annotation) {
  const blocks = sideNoteBlocks(annotation);
  note.querySelectorAll('.split-side-note-ink').forEach((canvas) => {
    const blockId = canvas.dataset.blockId;
    const block = blocks.find((item) => item.id === blockId);
    drawSplitInkCanvas(canvas, block?.ink?.strokes || []);
    canvas.addEventListener('pointerdown', (event) => beginSplitInkStroke(event, annotation.id, blockId));
  });
}

function beginSplitInkStroke(event, annotationId, blockId) {
  if (event.button !== 0) return;
  const canvas = event.currentTarget;
  const stroke = {
    color: state.inkColor,
    width: state.inkWidth,
    pressureEnabled: state.inkPressureEnabled,
    points: []
  };
  state.inkSession = {
    annotationId,
    blockId,
    canvas,
    pointerId: event.pointerId,
    stroke
  };
  event.preventDefault();
  event.stopPropagation();
  canvas.setPointerCapture?.(event.pointerId);
  addSplitInkPoint(event, { force: true });
  const moveType = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';
  const onMove = (moveEvent) => {
    if (moveEvent.pointerId !== state.inkSession?.pointerId) return;
    moveEvent.preventDefault();
    addSplitInkPoint(moveEvent);
    drawSplitInkCanvas(canvas, inkStrokesForCanvas(canvas), state.inkSession?.stroke);
  };
  const onUp = (upEvent) => {
    if (upEvent.pointerId !== state.inkSession?.pointerId) return;
    upEvent.preventDefault();
    window.removeEventListener(moveType, onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    addSplitInkPoint(upEvent);
    finishSplitInkStroke();
  };
  window.addEventListener(moveType, onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);
}

function addSplitInkPoint(event, options = {}) {
  const session = state.inkSession;
  if (!session) return;
  const point = splitInkPointFromEvent(session.canvas, event);
  const previous = session.stroke.points.at(-1);
  if (!options.force && previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 0.24) return;
  session.stroke.points.push(point);
}

function finishSplitInkStroke() {
  const session = state.inkSession;
  state.inkSession = null;
  if (!session || session.stroke.points.length < 2) return;
  state.channel?.post('append-ink-stroke', {
    annotationId: session.annotationId,
    blockId: session.blockId,
    stroke: session.stroke
  });
  drawSplitInkCanvas(session.canvas, [...inkStrokesForCanvas(session.canvas), session.stroke]);
}

function splitInkPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.max(1, rect.width) / INK_SPACE.width;
  const pointerType = event.pointerType || 'mouse';
  const rawPressure = Number(event.pressure);
  const pressure = state.inkPressureEnabled && pointerType === 'pen' && rawPressure > 0 ? rawPressure : 0.5;
  return {
    x: clampNumber((event.clientX - rect.left) / scale, -36, INK_SPACE.width + 36, 0),
    y: clampNumber((event.clientY - rect.top) / scale, -36, Math.max(INK_SPACE.height, rect.height / scale) + 36, 0),
    pressure,
    t: Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now(),
    pointerType
  };
}

function inkStrokesForCanvas(canvas) {
  const note = canvas.closest('.split-side-note');
  const annotation = state.annotations.find((item) => item.id === note?.dataset.annotationId);
  const block = sideNoteBlocks(annotation).find((item) => item.id === canvas.dataset.blockId);
  return block?.type === 'ink' ? block.ink.strokes || [] : [];
}

function drawSplitInkCanvas(canvas, strokes, activeStroke = null) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = Math.max(1, Math.round(rect.width * ratio));
  const height = Math.max(1, Math.round(rect.height * ratio));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const scale = Math.max(1, rect.width) / INK_SPACE.width;
  ctx.save();
  ctx.scale(scale, scale);
  for (const stroke of [...strokes, activeStroke].filter(Boolean)) drawSplitStroke(ctx, stroke);
  ctx.restore();
}

function drawSplitStroke(ctx, stroke) {
  const points = Array.isArray(stroke?.points) ? stroke.points : [];
  if (!points.length) return;
  ctx.strokeStyle = stroke.color || '#1c1712';
  ctx.lineWidth = Math.max(1, Number(stroke.width) || 3);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.01, points[0].y + 0.01);
  } else {
    for (let index = 1; index < points.length; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      if (next) ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
      else ctx.lineTo(current.x, current.y);
    }
  }
  ctx.stroke();
}

function sideNoteTitle(annotation) {
  return String(annotation?.note?.title || '').trim();
}

function sideNoteBlocks(annotation) {
  const blocks = Array.isArray(annotation?.note?.blocks) ? annotation.note.blocks : [];
  if (blocks.length) return blocks.map((block, index) => ({
    ...block,
    id: typeof block?.id === 'string' && block.id ? block.id : splitLegacyBlockId(annotation, index, block?.type)
  }));
  const markdown = String(annotation?.note?.markdown || '');
  const ink = annotation?.note?.ink;
  if (markdown) return [{ id: splitLegacyBlockId(annotation, 0, 'text'), type: 'text', markdown }];
  if (Array.isArray(ink?.strokes) && ink.strokes.length) return [{ id: splitLegacyBlockId(annotation, 0, 'ink'), type: 'ink', ink }];
  return [{ id: splitLegacyBlockId(annotation, 0, 'blank'), type: 'blank' }];
}

function splitLegacyBlockId(annotation, index, type) {
  let hash = 2166136261;
  const input = `${annotation?.id || 'note'}:${index}:${type || 'blank'}`;
  for (let cursor = 0; cursor < input.length; cursor += 1) {
    hash ^= input.charCodeAt(cursor);
    hash = Math.imul(hash, 16777619);
  }
  return `blk_legacy_${(hash >>> 0).toString(36)}`;
}

function sideNoteText(annotation) {
  const blocks = sideNoteBlocks(annotation);
  const text = blocks
    .filter((block) => block?.type === 'text')
    .map((block) => block.markdown || '')
    .join('\n')
    .trim();
  return text || String(annotation?.note?.markdown || '').trim();
}

function normalizeInkHeight(value) {
  const height = Number(value);
  if (!Number.isFinite(height)) return INK_CANVAS_HEIGHT.default;
  return Math.round(clampNumber(height, INK_CANVAS_HEIGHT.min, INK_CANVAS_HEIGHT.max, INK_CANVAS_HEIGHT.default));
}

function inkWidthOptions(currentWidth) {
  const widths = [2, 3, 5, 8, 12, 16, 24];
  const current = Number(currentWidth) || 3;
  return widths
    .map((width) => `<option value="${width}" ${width === current ? 'selected' : ''}>${width}px</option>`)
    .join('');
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

function readableSnippet(value, maxLength = 160) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function placeCaretAtEnd(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function setStatus(message, isError = false) {
  if (!els.status) return;
  els.status.textContent = message;
  els.status.dataset.state = isError ? 'error' : 'ok';
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) return globalThis.CSS.escape(String(value));
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char.codePointAt(0).toString(16)} `);
}
