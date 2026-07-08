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
  scrollRaf: 0,
  suppressScrollUntil: 0
};

const els = {
  scroller: document.querySelector('#splitNotesScroller'),
  canvas: document.querySelector('#splitNotesCanvas'),
  status: document.querySelector('#status'),
  noteList: document.querySelector('#noteList'),
  noteCount: document.querySelector('#noteCount'),
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
  els.noteList.addEventListener('click', onNavigatorClick);
  els.canvas.addEventListener('click', onSideNoteClick);
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
  for (const annotation of state.annotations) {
    const metric = state.metricsById.get(annotation.id);
    const note = document.createElement('article');
    note.className = [
      'split-side-note',
      annotation.id === state.activeAnnotationId ? 'is-active' : '',
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
  const status = metric?.status === 'pending'
    ? '<p class="split-side-note-status">Loading target...</p>'
    : metric?.status === 'unresolved'
      ? '<p class="split-side-note-status">Target unresolved</p>'
      : '';
  return `
    <div class="split-side-note-card">
      <div class="split-side-note-tools">
        <button type="button" data-split-note-action="goto">Go to</button>
        <button type="button" data-split-note-action="add-text">Text</button>
        <button type="button" data-split-note-action="add-ink">Draw</button>
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
    if (block?.type === 'ink') {
      const height = normalizeInkHeight(block.ink?.height);
      return `
        <div class="split-side-note-ink-wrap" style="height:${height}px">
          <canvas class="split-side-note-ink" data-block-index="${index}"></canvas>
          <div class="split-side-note-ink-tools">
            <button type="button" data-split-note-action="ink-tool-pen">Pen</button>
            <button type="button" data-split-note-action="clear-ink" data-block-index="${index}">Clear</button>
          </div>
        </div>
      `;
    }
    const text = block?.type === 'text' ? block.markdown || '' : '';
    return `<p class="split-side-note-body" contenteditable="plaintext-only" data-block-index="${index}" data-placeholder="Note">${escapeHtml(text)}</p>`;
  }).join('');
}

function renderNavigator() {
  const count = state.annotations.length;
  els.noteCount.textContent = `${count} annotation${count === 1 ? '' : 's'} in this document.`;
  els.noteList.textContent = '';
  if (!count) {
    const empty = document.createElement('p');
    empty.className = 'small';
    empty.textContent = 'No annotations yet.';
    els.noteList.append(empty);
    return;
  }
  for (const annotation of state.annotations) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `split-note-list-item ${annotation.id === state.activeAnnotationId ? 'is-active' : ''}`;
    button.dataset.annotationId = annotation.id;
    button.innerHTML = `
      <span>${escapeHtml(sideNoteTitle(annotation) || 'Empty note')}</span>
      <small>${escapeHtml(sideNoteText(annotation) || 'No text yet.')}</small>
    `;
    els.noteList.append(button);
  }
}

function onSideNoteClick(event) {
  const note = event.target?.closest?.('.split-side-note');
  if (!note) return;
  const annotationId = note.dataset.annotationId;
  if (!annotationId) return;
  const actionButton = event.target?.closest?.('[data-split-note-action]');
  const action = actionButton?.dataset?.splitNoteAction || '';
  if (action === 'goto') {
    state.channel?.post('jump-to-annotation', { annotationId });
    return;
  }
  if (action === 'add-text' || action === 'add-ink') {
    state.channel?.post('insert-note-block', {
      annotationId,
      blockType: action === 'add-ink' ? 'ink' : 'text'
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
  const item = event.target?.closest?.('.split-note-list-item');
  if (!item) return;
  state.channel?.post('jump-to-annotation', { annotationId: item.dataset.annotationId });
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
  const arrow = els.toggleNotesBtn.querySelector('.notes-tab-arrow');
  if (arrow) arrow.textContent = collapsed ? '‹' : '›';
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
