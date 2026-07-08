import { createReaderSessionChannel } from './reader-session-channel.js';

const params = new URLSearchParams(location.search);
const docId = params.get('doc') || '';
const sessionId = params.get('session') || '';

const state = {
  channel: null,
  annotations: [],
  metricsById: new Map(),
  activeAnnotationId: null,
  sourceScrollY: 0,
  sourceScrollHeight: 0,
  sourceViewportHeight: 0,
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
  const text = escapeHtml(sideNoteText(annotation));
  const status = metric?.status === 'pending'
    ? '<p class="split-side-note-status">Loading target...</p>'
    : metric?.status === 'unresolved'
      ? '<p class="split-side-note-status">Target unresolved</p>'
      : '';
  return `
    <div class="split-side-note-card">
      <div class="split-side-note-tools">
        <button type="button" data-split-note-action="goto">Go to</button>
      </div>
      ${title ? `<h3>${title}</h3>` : '<h3>Empty note</h3>'}
      ${status}
      ${text ? `<p>${text}</p>` : '<p class="split-side-note-muted">No text yet.</p>'}
    </div>
  `;
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
  state.channel?.post(event.target?.closest?.('[data-split-note-action="goto"]') ? 'jump-to-annotation' : 'activate-annotation', {
    annotationId
  });
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

function sideNoteTitle(annotation) {
  return String(annotation?.note?.title || '').trim();
}

function sideNoteText(annotation) {
  const blocks = Array.isArray(annotation?.note?.blocks) ? annotation.note.blocks : [];
  const text = blocks
    .filter((block) => block?.type === 'text')
    .map((block) => block.markdown || '')
    .join('\n')
    .trim();
  return text || String(annotation?.note?.markdown || '').trim();
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
