import { createReaderSessionChannel } from './reader-session-channel.js';

const params = new URLSearchParams(location.search);
const docId = params.get('doc') || '';
const sessionId = params.get('session') || '';
const INK_SPACE = { width: 1000, height: 562.5 };
const INK_CANVAS_HEIGHT = { min: 96, default: 420, max: 1800 };

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
  collapsedSideNoteIds: new Set(),
  expandedNavigatorNoteIds: new Set(),
  noteNavigatorExpandAll: false,
  scrollRaf: 0,
  suppressScrollUntil: 0
};

const els = {
  scroller: document.querySelector('#splitNotesScroller'),
  canvas: document.querySelector('#splitNotesCanvas'),
  status: document.querySelector('#status'),
  noteList: document.querySelector('#noteList'),
  noteCount: document.querySelector('#noteCount'),
  expandAllNotesBtn: document.querySelector('#expandAllNotesBtn'),
  rightPanel: document.querySelector('#rightPanel'),
  toggleNotesBtn: document.querySelector('#toggleNotesBtn')
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
  els.expandAllNotesBtn?.addEventListener('click', toggleExpandAllNotes);
  els.noteList.addEventListener('click', onNavigatorClick);
  els.canvas.addEventListener('click', onSideNoteClick);
  els.canvas.addEventListener('input', onSideNoteInput);
  els.canvas.addEventListener('change', onSideNoteInput);
  els.canvas.addEventListener('focusout', onSideNoteFocusOut);
  els.canvas.addEventListener('keydown', onSideNoteKeyDown);
  els.canvas.addEventListener('paste', onSideNotePaste);
  window.addEventListener('beforeunload', () => state.channel?.post('close-notes'));
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
    applySourceScroll(payload.scrollY);
    return;
  }
  if (type === 'close-source') {
    setStatus('Reader window closed the split session.');
  }
}

function applySourceState(payload) {
  state.annotations = Array.isArray(payload.annotations) ? payload.annotations : [];
  state.metricsById = new Map((payload.noteMetrics || []).map((metric) => [metric.id, metric]));
  state.activeAnnotationId = payload.activeAnnotationId || null;
  state.sourceScrollY = Math.max(0, Number(payload.scrollY) || 0);
  state.sourceScrollHeight = Math.max(window.innerHeight, Number(payload.scrollHeight) || 0);
  state.sourceViewportHeight = Math.max(0, Number(payload.viewportHeight) || 0);
  state.inkTool = payload.inkTool === 'eraser' ? 'eraser' : 'pen';
  state.inkColor = typeof payload.inkColor === 'string' ? payload.inkColor : state.inkColor;
  state.inkWidth = Number.isFinite(Number(payload.inkWidth)) ? Number(payload.inkWidth) : state.inkWidth;
  state.inkPressureEnabled = payload.inkPressureEnabled !== false;
  document.title = payload.documentTitle ? `${payload.documentTitle} - Split Notes` : 'Split Notes - Marginalia';
  renderSideNotes();
  renderNavigator();
  applySourceScroll(state.sourceScrollY);
  setStatus(state.annotations.length ? 'Split notes synced.' : 'No notes in this source.');
}

function renderSideNotes() {
  els.canvas.style.height = `${Math.max(window.innerHeight, Math.ceil(state.sourceScrollHeight || window.innerHeight))}px`;
  els.canvas.textContent = '';
  if (!state.annotations.length) {
    renderEmptyState('No notes in this source.');
    return;
  }
  const currentIds = new Set(state.annotations.map((annotation) => annotation.id));
  state.collapsedSideNoteIds = new Set([...state.collapsedSideNoteIds].filter((id) => currentIds.has(id)));
  for (const annotation of state.annotations) {
    const metric = state.metricsById.get(annotation.id);
    const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
    const note = document.createElement('article');
    note.className = [
      'split-side-note',
      annotation.id === state.activeAnnotationId ? 'is-active' : '',
      isCollapsed ? 'is-collapsed' : '',
      metric?.status === 'unresolved' ? 'is-unresolved' : '',
      metric?.status === 'pending' ? 'is-target-pending' : ''
    ].filter(Boolean).join(' ');
    note.dataset.annotationId = annotation.id;
    note.style.top = `${Math.max(0, Math.round(metric?.top ?? 24))}px`;
    note.innerHTML = sideNoteHtml(annotation, metric);
    els.canvas.append(note);
    renderSplitInkCanvases(note, annotation);
  }
}

function renderEmptyState(message) {
  els.canvas.style.height = `${window.innerHeight}px`;
  els.canvas.textContent = '';
  const empty = document.createElement('p');
  empty.className = 'split-notes-empty';
  empty.textContent = message;
  els.canvas.append(empty);
}

function sideNoteHtml(annotation, metric) {
  const title = escapeHtml(sideNoteTitle(annotation));
  const isCollapsed = state.collapsedSideNoteIds.has(annotation.id);
  const status = metric?.status === 'pending'
    ? '<p class="split-side-note-status">Loading target...</p>'
    : metric?.status === 'unresolved'
      ? '<p class="split-side-note-status">Target unresolved</p>'
      : '';
  return `
    <div class="split-side-note-card">
      <div class="split-side-note-tools">
        <button type="button" class="split-side-note-tool" data-split-note-action="toggle-collapse" title="${isCollapsed ? 'Expand note' : 'Collapse note'}" aria-expanded="${String(!isCollapsed)}">${isCollapsed ? '▼' : '▲'}</button>
        <button type="button" data-split-note-action="goto">Go to</button>
        <button type="button" data-split-note-action="add-text">Text</button>
        <button type="button" data-split-note-action="add-ink">Draw</button>
        <button type="button" class="danger" data-split-note-action="delete-note" title="Delete note">Delete</button>
      </div>
      <h3 class="split-side-note-title" contenteditable="plaintext-only" data-split-note-field="title" data-placeholder="Title">${title}</h3>
      ${status}
      ${sideNoteBlocksHtml(annotation)}
    </div>
  `;
}

function sideNoteBlocksHtml(annotation) {
  const blocks = sideNoteBlocks(annotation);
  return blocks.map((block, index) => {
    const blockControls = blockControlHtml(index);
    if (block?.type === 'ink') {
      const height = normalizeInkHeight(block.ink?.height);
      return `
        <div class="split-side-note-ink-wrap" style="height:${height}px">
          <canvas class="split-side-note-ink" data-block-index="${index}"></canvas>
          <div class="split-side-note-ink-tools">
            <button type="button" data-split-note-action="ink-tool-pen" class="${state.inkTool === 'pen' ? 'is-active' : ''}">Pen</button>
            <label title="Line color"><span>Color</span><input type="color" value="${escapeHtml(state.inkColor)}" data-split-note-action="ink-color"></label>
            <label title="Line width"><span>Width</span><select data-split-note-action="ink-width">${inkWidthOptions(state.inkWidth)}</select></label>
            <label title="Pressure sensitivity"><input type="checkbox" ${state.inkPressureEnabled ? 'checked' : ''} data-split-note-action="ink-pressure"><span>Pressure</span></label>
            <button type="button" data-split-note-action="clear-ink" data-block-index="${index}">Clear</button>
          </div>
        </div>
        ${blockControls}
      `;
    }
    const text = block?.type === 'text' ? block.markdown || '' : '';
    return `
      <p class="split-side-note-body" contenteditable="plaintext-only" data-block-index="${index}" data-placeholder="${index === 0 ? 'Note' : 'Continue note'}">${escapeHtml(text)}</p>
      ${blockControls}
    `;
  }).join('');
}

function blockControlHtml(index) {
  return `
    <div class="split-note-block-tools">
      <button type="button" data-split-note-action="insert-text-after" data-block-index="${index}">Text below</button>
      <button type="button" data-split-note-action="insert-ink-after" data-block-index="${index}">Draw below</button>
      <button type="button" class="danger" data-split-note-action="remove-block" data-block-index="${index}">Remove</button>
    </div>
  `;
}

function renderNavigator() {
  const count = state.annotations.length;
  els.noteCount.textContent = `${count} annotation${count === 1 ? '' : 's'} in this document.`;
  if (els.expandAllNotesBtn) {
    els.expandAllNotesBtn.textContent = state.noteNavigatorExpandAll ? 'Collapse all' : 'Expand all';
    els.expandAllNotesBtn.disabled = !count;
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
}

function createNavigatorCard(annotation) {
  const metric = state.metricsById.get(annotation.id);
  const expanded = isNavigatorNoteExpanded(annotation.id);
  const card = document.createElement('article');
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
      <div class="note-card-actions">
        <button type="button" class="note-card-expand" data-action="toggle-expand">${escapeHtml(navigatorExpandButtonLabel(annotation.id))}</button>
        <button type="button" data-action="goto">Go to</button>
        <button type="button" class="danger" data-action="delete">Delete</button>
      </div>
      <div class="note-card-heading">
        <p class="note-card-title">${escapeHtml(sideNoteTitle(annotation) || sideNoteText(annotation) || 'Empty note')}</p>
        <div class="note-card-meta">${escapeHtml(navigatorMeta(annotation, metric))}</div>
      </div>
    </div>
    ${expanded ? navigatorContentHtml(annotation) : ''}
  `;
  return card;
}

function navigatorContentHtml(annotation) {
  const blocks = sideNoteBlocks(annotation);
  const parts = [];
  for (const block of blocks) {
    if (block?.type === 'text' && block.markdown?.trim()) {
      parts.push(`<div class="note-card-content-text">${escapeHtml(block.markdown)}</div>`);
      continue;
    }
    if (block?.type === 'ink' && Array.isArray(block.ink?.strokes) && block.ink.strokes.length) {
      parts.push('<div class="note-card-content-empty">Drawing</div>');
    }
  }
  if (!parts.length && !sideNoteTitle(annotation).trim()) parts.push('<div class="note-card-content-empty">Empty note</div>');
  return parts.length ? `<div class="note-card-content">${parts.join('')}</div>` : '';
}

function navigatorMeta(annotation, metric) {
  if (metric?.status === 'pending') return metric.pageNumber ? `Loading page ${metric.pageNumber}...` : 'Loading target...';
  if (metric?.status === 'unresolved') return 'Target unresolved';
  return sideNoteText(annotation) || 'No text yet.';
}

function onSideNoteClick(event) {
  const note = event.target?.closest?.('.split-side-note');
  if (!note) return;
  const annotationId = note.dataset.annotationId;
  if (!annotationId) return;
  const actionButton = event.target?.closest?.('[data-split-note-action]');
  const action = actionButton?.dataset?.splitNoteAction || '';
  if (action === 'toggle-collapse') {
    toggleSideNoteCollapse(annotationId);
    return;
  }
  if (action === 'goto') {
    state.channel?.post('jump-to-annotation', { annotationId });
    return;
  }
  if (action === 'delete-note') {
    requestDeleteAnnotation(annotationId, actionButton);
    return;
  }
  if (action === 'add-text' || action === 'add-ink') {
    state.channel?.post('insert-note-block', {
      annotationId,
      blockType: action === 'add-ink' ? 'ink' : 'text'
    });
    return;
  }
  if (action === 'insert-text-after' || action === 'insert-ink-after') {
    state.channel?.post('insert-note-block', {
      annotationId,
      blockType: action === 'insert-ink-after' ? 'ink' : 'text',
      afterBlockIndex: Number(actionButton.dataset.blockIndex)
    });
    return;
  }
  if (action === 'remove-block') {
    state.channel?.post('remove-note-block', {
      annotationId,
      blockIndex: Number(actionButton.dataset.blockIndex)
    });
    return;
  }
  if (action === 'clear-ink') {
    state.channel?.post('clear-ink-block', {
      annotationId,
      blockIndex: Number(actionButton.dataset.blockIndex)
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
  if (event.target?.closest?.('[contenteditable], canvas, .split-side-note-ink-tools')) return;
  state.channel?.post('activate-annotation', { annotationId });
}

function onSideNoteInput(event) {
  const control = event.target?.closest?.('[data-split-note-action]');
  if (!control) return;
  const action = control.dataset.splitNoteAction;
  if (['ink-color', 'ink-width', 'ink-pressure'].includes(action)) updateInkToolFromControl(control);
}

function onSideNoteFocusOut(event) {
  const note = event.target?.closest?.('.split-side-note');
  if (!note || !event.target?.closest?.('[contenteditable]')) return;
  window.setTimeout(() => {
    if (note.contains(document.activeElement)) return;
    saveSplitNoteEdits(note);
  }, 0);
}

function onSideNoteKeyDown(event) {
  if (!event.target?.closest?.('[contenteditable]')) return;
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
    event.preventDefault();
    saveSplitNoteEdits(event.target.closest('.split-side-note'));
    event.target.blur();
  }
}

function onSideNotePaste(event) {
  if (!event.target?.closest?.('[contenteditable]')) return;
  event.preventDefault();
  const text = event.clipboardData?.getData('text/plain') || '';
  document.execCommand?.('insertText', false, text);
}

function saveSplitNoteEdits(note) {
  const annotationId = note?.dataset?.annotationId;
  if (!annotationId) return;
  const title = note.querySelector('[data-split-note-field="title"]')?.textContent || '';
  const textBlocks = Array.from(note.querySelectorAll('.split-side-note-body')).map((body) => ({
    blockIndex: Number(body.dataset.blockIndex),
    markdown: body.textContent || ''
  }));
  state.channel?.post('save-note-text', { annotationId, title, textBlocks });
  setStatus('Saving note...');
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
  state.channel?.post(action === 'goto' || !action ? 'jump-to-annotation' : 'activate-annotation', { annotationId });
}

function onNotesScroll() {
  if (performance.now() < state.suppressScrollUntil) return;
  if (state.scrollRaf) return;
  state.scrollRaf = requestAnimationFrame(() => {
    state.scrollRaf = 0;
    state.channel?.post('notes-scroll', { scrollY: Math.max(0, els.scroller.scrollTop || 0) });
  });
}

function applySourceScroll(scrollY) {
  const y = Math.max(0, Number(scrollY) || 0);
  if (Math.abs((els.scroller.scrollTop || 0) - y) < 1) return;
  state.suppressScrollUntil = performance.now() + 80;
  els.scroller.scrollTo({ top: y, behavior: 'auto' });
}

function toggleNavigator() {
  const collapsed = !els.rightPanel.classList.contains('is-collapsed');
  els.rightPanel.classList.toggle('is-collapsed', collapsed);
  els.toggleNotesBtn.setAttribute('aria-expanded', String(!collapsed));
  els.toggleNotesBtn.title = collapsed ? 'Open notes navigator' : 'Close notes navigator';
  const arrow = els.toggleNotesBtn.querySelector('.notes-tab-arrow');
  if (arrow) arrow.textContent = collapsed ? '‹' : '›';
}

function toggleSideNoteCollapse(annotationId) {
  if (state.collapsedSideNoteIds.has(annotationId)) state.collapsedSideNoteIds.delete(annotationId);
  else state.collapsedSideNoteIds.add(annotationId);
  renderSideNotes();
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
  popover.addEventListener('click', (event) => {
    const choice = event.target?.closest?.('[data-delete-choice]')?.dataset?.deleteChoice;
    if (choice === 'cancel') popover.remove();
    if (choice === 'confirm') {
      popover.remove();
      state.channel?.post('delete-annotation', { annotationId });
    }
  });
  setTimeout(() => {
    document.addEventListener('pointerdown', function onPointerDown(event) {
      if (!popover.contains(event.target)) {
        popover.remove();
        document.removeEventListener('pointerdown', onPointerDown, true);
      }
    }, true);
  }, 0);
}

function closeDeleteConfirmPopovers() {
  document.querySelectorAll('.split-delete-confirm-popover').forEach((popover) => popover.remove());
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
    const blockIndex = Number(canvas.dataset.blockIndex);
    const block = blocks[blockIndex];
    drawSplitInkCanvas(canvas, block?.ink?.strokes || []);
    canvas.addEventListener('pointerdown', (event) => beginSplitInkStroke(event, annotation.id, blockIndex));
  });
}

function beginSplitInkStroke(event, annotationId, blockIndex) {
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
    blockIndex,
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
    blockIndex: session.blockIndex,
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
  const block = sideNoteBlocks(annotation)[Number(canvas.dataset.blockIndex)];
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
  if (blocks.length) return blocks;
  const markdown = String(annotation?.note?.markdown || '');
  const ink = annotation?.note?.ink;
  if (markdown) return [{ type: 'text', markdown }];
  if (Array.isArray(ink?.strokes) && ink.strokes.length) return [{ type: 'ink', ink }];
  return [{ type: 'blank' }];
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
