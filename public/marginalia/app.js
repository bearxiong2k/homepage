import { APP_VERSION, APP_VERSION_LABEL } from './app-version.js';
import { marginaliaPerformanceTrace } from './performance-trace.js';
import { checkNetworkAppVersion, currentStorageMode, registerServiceWorker, updateAppFromNetwork, urlWithStorage } from './runtime.js';
import { createStorageAdapter } from './storage-adapter.js';
import { downloadBytes } from './bundle.js';
import {
  canUseDirectoryAccess,
  canUseFileSystemAccess,
  pickAnnotatorBundleFile,
  pickAnnotatorBundleSaveHandle,
  pickAnnotatorPackageDirectory,
  queryFileHandlePermissionState,
  readParsedPackageFromDirectoryHandle,
  writeBytesToFileHandle,
  writeFilesToDirectoryHandle
} from './file-access.js';
import {
  libraryFolderNameForTitle
} from './folder-package.js';
import { isAnnotatorLibraryFilename, libraryFilenameForTitle } from './library-package.js';

const storageMode = currentStorageMode();
const storage = createStorageAdapter({ mode: storageMode });
const libraryPerformance = marginaliaPerformanceTrace('library');

const documentsEl = document.querySelector('#documents');
const appVersionEl = document.querySelector('#appVersion');
const openReaderLink = document.querySelector('#openReaderLink');
const importHtmlBtn = document.querySelector('#importHtmlBtn');
const importBundleBtn = document.querySelector('#importBundleBtn');
const importLibraryBtn = document.querySelector('#importLibraryBtn');
const saveLibraryBtn = document.querySelector('#saveLibraryBtn');
const checkForUpdatesBtn = document.querySelector('#checkForUpdatesBtn');
const updateAppBtn = document.querySelector('#updateAppBtn');
const appUpdateStatus = document.querySelector('#appUpdateStatus');
const clearLibraryBtn = document.querySelector('#clearLibraryBtn');
const htmlFileInput = document.querySelector('#htmlFileInput');
const replaceSourceFileInput = document.querySelector('#replaceSourceFileInput');
const bundleFileInput = document.querySelector('#bundleFileInput');
const libraryFileInput = document.querySelector('#libraryFileInput');
const appDialog = document.querySelector('#appDialog');
const appDialogTitle = document.querySelector('#appDialogTitle');
const appDialogBody = document.querySelector('#appDialogBody');
const appDialogActions = document.querySelector('#appDialogActions');
const libraryLogEntries = [];
const MAX_LIBRARY_LOG_ENTRIES = 200;
const LIBRARY_VIEW_MODE_KEY = 'marginalia-library-view-mode';
const LIBRARY_COLLAPSED_FOLDERS_KEY = 'marginalia-library-collapsed-folders';
const LIBRARY_DRAG_MIME = 'application/x-marginalia-library-item';
const LIBRARY_SORT_ANIMATION_MS = 220;
const LIBRARY_POPOVER_VIEWPORT_MARGIN = 16;
const APP_UPDATE_RECHECK_REASONS = new Set([
  'activated-version-not-newer',
  'candidate-version-mismatch',
  'update-not-ready',
  'version-unavailable',
  'worker-not-newer'
]);
let activeDialog = null;
let pendingReplaceSourceDocId = null;
let availableNetworkVersion = null;
let appUpdateState = 'idle';
let appUpdateMessage = 'Check for updates before updating the app.';
let libraryViewMode = loadLibraryViewMode();
let libraryCollapsedFolderIds = loadLibraryCollapsedFolderIds();
let libraryRenderModel = null;
let selectedTreeItemKind = '';
let selectedTreeItemId = '';
let libraryRenderGeneration = 0;
let librarySavePromise = null;

init().catch((error) => {
  documentsEl.innerHTML = `<p class="small">${escapeHtml(error.message)}</p>`;
});

async function init() {
  syncAppUpdateUi();
  openReaderLink.href = urlWithStorage('reader.html', {}, storageMode);
  importHtmlBtn?.addEventListener('click', () => startHtmlImport());
  htmlFileInput?.addEventListener('change', () => importSelectedHtml().catch(showError));
  replaceSourceFileInput?.addEventListener('change', () => importSelectedReplacementSource().catch(showError));
  importBundleBtn?.addEventListener('click', () => startBundleImport().catch(showError));
  bundleFileInput?.addEventListener('change', () => importSelectedBundle().catch(showError));
  importLibraryBtn?.addEventListener('click', () => startLibraryImport().catch(showError));
  libraryFileInput?.addEventListener('change', () => importSelectedLibrary().catch(showError));
  saveLibraryBtn?.addEventListener('click', () => requestLibrarySave().catch(showError));
  checkForUpdatesBtn?.addEventListener('click', () => checkForAvailableAppUpdate({ log: true }).catch(showError));
  updateAppBtn?.addEventListener('click', () => updateInstalledApp().catch(showError));
  clearLibraryBtn?.addEventListener('click', () => clearBrowserLibrary().catch(showError));
  installFileDropImport();
  documentsEl?.addEventListener('change', (event) => {
    if (event.target?.matches?.('[data-library-title]')) {
      renameCurrentLibraryFromInput(event.target).catch(showError);
    }
    if (event.target?.matches?.('[data-library-bundle-title]')) {
      renameLibraryBundleFromInput(event.target).catch(showError);
    }
    if (event.target?.matches?.('[data-source-title]')) {
      renameSourceFromInput(event.target).catch(showError);
    }
  });
  documentsEl?.addEventListener('focusout', (event) => {
    if (event.target?.matches?.('[data-library-folder-title]')) {
      renameLibraryFolderFromInput(event.target).catch(showError);
    }
  });
  documentsEl?.addEventListener('submit', (event) => {
    const moveForm = event.target?.closest?.('[data-move-library-item]');
    if (moveForm) {
      event.preventDefault();
      moveLibraryItemFromForm(moveForm).catch(showError);
      return;
    }
    const form = event.target?.closest?.('[data-create-library-folder]');
    if (!form) return;
    event.preventDefault();
    createLibraryFolderFromForm(form).catch(showError);
  });
  documentsEl?.addEventListener('click', (event) => {
    const moveDirectionButton = event.target?.closest?.('[data-library-move-direction]');
    if (moveDirectionButton) {
      moveLibraryItemByDirection(moveDirectionButton).catch(showError);
      return;
    }
    const viewButton = event.target?.closest?.('[data-library-view-mode]');
    if (viewButton) {
      setLibraryViewMode(viewButton.dataset.libraryViewMode);
      return;
    }
    const folderToggle = event.target?.closest?.('[data-toggle-library-folder]');
    if (folderToggle) {
      toggleLibraryFolder(folderToggle.dataset.toggleLibraryFolder);
      return;
    }
    const treeBundleButton = event.target?.closest?.('[data-select-tree-bundle]');
    if (treeBundleButton) {
      selectLibraryTreeItem('bundle', treeBundleButton.dataset.selectTreeBundle);
      return;
    }
    const treeFolderButton = event.target?.closest?.('[data-select-tree-folder]');
    if (treeFolderButton) {
      selectLibraryTreeItem('folder', treeFolderButton.dataset.selectTreeFolder);
      return;
    }
    if (selectedTreeItemId && !event.target?.closest?.('.library-item-popover')) {
      clearLibraryTreeSelection();
    }
    const deleteFolderButton = event.target?.closest?.('[data-delete-library-folder]');
    if (deleteFolderButton) {
      deleteLibraryFolderFromButton(deleteFolderButton).catch(showError);
      return;
    }
    const replaceButton = event.target?.closest?.('[data-replace-source]');
    if (replaceButton) {
      startSourceReplacementFromButton(replaceButton).catch(showError);
      return;
    }
    const deleteButton = event.target?.closest?.('[data-delete-library-bundle]');
    if (deleteButton) {
      deleteLibraryBundleFromButton(deleteButton).catch(showError);
      return;
    }
    const documentDeleteButton = event.target?.closest?.('[data-delete-document]');
    if (documentDeleteButton) {
      deleteStandaloneDocumentFromButton(documentDeleteButton).catch(showError);
      return;
    }
    const forgetButton = event.target?.closest?.('[data-forget-library-handle]');
    if (forgetButton) {
      forgetCurrentLibraryHandle().catch(showError);
    }
  });
  documentsEl?.addEventListener('dragstart', handleLibraryDragStart);
  documentsEl?.addEventListener('dragover', handleLibraryDragOver);
  documentsEl?.addEventListener('dragleave', handleLibraryDragLeave);
  documentsEl?.addEventListener('drop', (event) => {
    handleLibraryDrop(event).catch(showError);
  });
  documentsEl?.addEventListener('dragend', clearLibraryDragState);
  documentsEl?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && event.target?.closest?.('.library-item-popover') && selectedTreeItemId) {
      event.preventDefault();
      const kind = selectedTreeItemKind;
      const id = selectedTreeItemId;
      const trigger = findLibraryNode(kind, id)?.querySelector(libraryTreeItemTriggerSelector(kind));
      clearLibraryTreeSelection();
      trigger?.focus?.({ preventScroll: true });
      return;
    }
    if (!event.target?.matches?.('[data-library-title], [data-library-bundle-title], [data-library-folder-title], [data-source-title]')) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.target.value = event.target.dataset.originalTitle || '';
      event.target.blur();
    }
  });
  documentsEl?.addEventListener('input', (event) => clearFieldError(event.target));
  await loadDocuments();
  scheduleServiceWorkerStartup();
}

function scheduleServiceWorkerStartup() {
  const start = () => {
    registerServiceWorker()
      .catch(() => {});
  };
  window.setTimeout(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 2000 });
      return;
    }
    start();
  }, 500);
}

async function checkForAvailableAppUpdate(options = {}) {
  if (['checking', 'updating'].includes(appUpdateState)) return null;
  appUpdateState = 'checking';
  appUpdateMessage = 'Checking for an available update...';
  syncAppUpdateUi();
  if (options.log) appendLibraryLog(`Checking for updates. Current ${APP_VERSION_LABEL}.`);
  try {
    const result = await checkNetworkAppVersion();
    if (result.status === 'available') {
      availableNetworkVersion = result;
      appUpdateState = 'available';
      appUpdateMessage = `Update available: ${result.label}.`;
      if (options.log) appendLibraryLog(appUpdateMessage);
      return result;
    }
    if (result.status === 'current') {
      availableNetworkVersion = null;
      appUpdateState = 'current';
      appUpdateMessage = `${APP_VERSION_LABEL} is up to date.`;
      if (options.log) appendLibraryLog(appUpdateMessage);
      return result;
    }
    appUpdateState = 'check-error';
    appUpdateMessage = result.error || 'Could not check for updates. Try again.';
    if (options.log) appendLibraryLog(appUpdateMessage, true);
    return result;
  } catch (error) {
    appUpdateState = 'check-error';
    appUpdateMessage = 'Could not check for updates. Check the connection and try again.';
    if (options.log) appendLibraryLog(appUpdateMessage, true);
    throw error;
  } finally {
    syncAppUpdateUi();
  }
}

function syncAppUpdateUi() {
  const hasAvailableUpdate = Boolean(availableNetworkVersion);
  const isBusy = ['checking', 'updating'].includes(appUpdateState);
  if (appVersionEl) appVersionEl.textContent = APP_VERSION_LABEL;
  if (checkForUpdatesBtn) {
    checkForUpdatesBtn.disabled = isBusy;
    checkForUpdatesBtn.textContent = appUpdateState === 'checking' ? 'Checking...' : 'Check for updates';
  }
  if (updateAppBtn) {
    updateAppBtn.disabled = isBusy || !hasAvailableUpdate;
    updateAppBtn.textContent = appUpdateState === 'updating' ? 'Updating...' : 'Update app';
    updateAppBtn.title = hasAvailableUpdate
      ? `Update to ${availableNetworkVersion.label}`
      : 'Check for an available update first';
  }
  if (appUpdateStatus) {
    appUpdateStatus.textContent = appUpdateMessage;
    appUpdateStatus.dataset.state = appUpdateState;
  }
}

function reloadForAppUpdate(version = '') {
  const url = new URL(location.href);
  url.searchParams.set('app-update', version || String(Date.now()));
  window.setTimeout(() => location.replace(url.href), 120);
}

async function loadDocuments(options = {}) {
  const startedAt = libraryPerformance.now();
  libraryPerformance.mark('load-start');
  const generation = ++libraryRenderGeneration;
  if (options.showLoading !== false) {
    documentsEl.innerHTML = '<p class="small">Loading documents...</p>';
  }
  const model = await buildLibraryRenderModel();
  if (generation !== libraryRenderGeneration) return model;
  libraryRenderModel = model;
  documentsEl.innerHTML = libraryDashboardMarkup(model);
  libraryPerformance.measure('usable', startedAt, { documents: model.documents?.length || 0 });
  scheduleLibraryRenderModelEnrichment(model, generation);
  return model;
}

async function buildLibraryRenderModel() {
  const [documents, library, profile] = await Promise.all([
    storage.listDocuments(),
    storage.getCurrentLibraryContext?.(),
    storage.ensureLocalProfile?.()
  ]);
  const handleStatus = initialLibraryHandleStatus(library);
  if (saveLibraryBtn) saveLibraryBtn.disabled = false;
  if (!documents.length && !library) {
    return {
      documents,
      library,
      profile,
      handleStatus,
      empty: true,
      orderedItems: [],
      activeViewMode: 'list',
      rows: [],
      displayRows: [],
      listRows: [],
      folders: [],
      sourceCount: 0,
      libraryStats: summarizeLibraryStats([], library),
      libraryTitle: 'Annotator library'
    };
  }
  const documentsById = new Map(documents.map((doc) => [doc.id, doc]));
  const orderedItems = library?.entries?.length
    ? library.entries
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((entry) => ({
        entry,
        doc: documentsById.get(entry.docId)
      }))
      .filter((item) => item.doc)
    : documents.map((doc) => ({ entry: null, doc }));
  const libraryTitle = library?.title || 'Annotator library';
  const folders = library?.folders || [];
  const activeViewMode = library ? libraryViewMode : 'list';
  const rows = orderedItems.map(({ doc, entry }) => ({
    doc,
    entry,
    stats: pendingDocumentNoteStats(doc)
  }));
  return libraryRenderModelWithRows({
    documents,
    library,
    profile,
    handleStatus,
    empty: false,
    orderedItems,
    folders,
    libraryTitle,
    activeViewMode
  }, rows);
}

function libraryRenderModelWithRows(model, rows) {
  const folderPathById = libraryFolderPathMap(model.folders);
  const displayRows = rows.map((row) => ({
    ...row,
    folderPath: row.entry?.folderId ? folderPathById.get(row.entry.folderId) || '' : ''
  }));
  const listRows = displayRows.slice().sort(compareRowsByRecentOpen);
  if (selectedTreeItemKind === 'bundle' && !displayRows.some((row) => row.entry?.id === selectedTreeItemId)) {
    selectedTreeItemKind = '';
    selectedTreeItemId = '';
  }
  if (selectedTreeItemKind === 'folder' && !model.folders.some((folder) => folder.id === selectedTreeItemId)) {
    selectedTreeItemKind = '';
    selectedTreeItemId = '';
  }
  return {
    ...model,
    rows,
    displayRows,
    listRows,
    sourceCount: rows.length,
    libraryStats: summarizeLibraryStats(rows, model.library)
  };
}

function scheduleLibraryRenderModelEnrichment(model, generation) {
  const start = () => {
    if (generation !== libraryRenderGeneration) return;
    enrichLibraryRenderModel(model, generation).catch((error) => {
      console.warn('Library details could not be loaded.', error);
    });
  };
  const startWhenIdle = () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 1000 });
      return;
    }
    window.setTimeout(start, 0);
  };
  if ('requestAnimationFrame' in window) {
    window.requestAnimationFrame(startWhenIdle);
    return;
  }
  startWhenIdle();
}

async function enrichLibraryRenderModel(model, generation) {
  const startedAt = libraryPerformance.now();
  const [handleResult, rowsResult] = await Promise.allSettled([
    currentLibraryHandleStatus(model.library),
    loadLibraryRowsWithStats(model.orderedItems)
  ]);
  if (generation !== libraryRenderGeneration) return;
  const currentModel = libraryRenderModel;
  if (!currentModel || currentModel.empty !== model.empty) return;
  const handleStatus = handleResult.status === 'fulfilled'
    ? handleResult.value
    : unavailableLibraryHandleStatus(model.library);
  const rows = rowsResult.status === 'fulfilled'
    ? rowsResult.value
    : currentModel.rows.map(({ doc, entry }) => ({
      doc,
      entry,
      stats: unavailableDocumentNoteStats(doc)
    }));
  if (handleResult.status === 'rejected') console.warn('Library package permission could not be checked.', handleResult.reason);
  if (rowsResult.status === 'rejected') console.warn('Library note totals could not be loaded.', rowsResult.reason);
  const enrichedModel = libraryRenderModelWithRows({
    ...currentModel,
    handleStatus
  }, rows);
  libraryRenderModel = enrichedModel;
  patchLibraryRenderModelEnrichment(enrichedModel);
  libraryPerformance.measure('enriched', startedAt, { documents: rows.length });
}

async function loadLibraryRowsWithStats(orderedItems) {
  if (!orderedItems.length) return [];
  if (storage.getDocumentNoteStats) {
    const statsByDocId = await storage.getDocumentNoteStats(orderedItems.map(({ doc }) => doc.id));
    return orderedItems.map(({ doc, entry }) => ({
      doc,
      entry,
      stats: documentNoteStatsFromRecord(doc, statsByDocId.get(doc.id))
    }));
  }
  return Promise.all(orderedItems.map(async ({ doc, entry }) => ({
    doc,
    entry,
    stats: await documentNoteStats(doc)
  })));
}

function patchLibraryRenderModelEnrichment(model) {
  const lastEditEl = documentsEl.querySelector('[data-library-last-edit]');
  if (lastEditEl) lastEditEl.textContent = formatDateTime(model.libraryStats.lastEditAt);
  const snapshotEl = documentsEl.querySelector('[data-library-snapshot]');
  if (snapshotEl) snapshotEl.textContent = model.libraryStats.snapshot;
  const rowsByRenderKey = new Map(model.displayRows.map((row) => [libraryRowRenderKey(row), row]));
  for (const element of documentsEl.querySelectorAll('[data-library-entry-stats]')) {
    const row = rowsByRenderKey.get(element.dataset.libraryEntryStats);
    if (row) element.textContent = libraryListStatsText(row);
  }
  for (const element of documentsEl.querySelectorAll('[data-library-entry-summary]')) {
    const row = rowsByRenderKey.get(element.dataset.libraryEntrySummary);
    if (row) element.textContent = row.stats.summary;
  }
  for (const element of documentsEl.querySelectorAll('[data-library-package-access]')) {
    const forgetButton = element.querySelector('[data-forget-library-handle]');
    if (Boolean(forgetButton) !== Boolean(model.handleStatus.canForget)) {
      element.outerHTML = localPackageAccessMarkup(model.handleStatus);
      continue;
    }
    const label = element.querySelector('[data-library-package-access-label]');
    if (label) label.textContent = model.handleStatus.label;
  }
}

function initialLibraryHandleStatus(library) {
  if (!library?.fileHandle && !library?.fileHandleName) {
    return { label: 'No remembered local package handle', canForget: false, pending: false };
  }
  const { handleType, name } = libraryHandleDescription(library);
  return { label: `Remembered ${handleType}: ${name}; checking permission...`, canForget: true, pending: true };
}

function unavailableLibraryHandleStatus(library) {
  if (!library?.fileHandle && !library?.fileHandleName) {
    return { label: 'No remembered local package handle', canForget: false, pending: false };
  }
  const { handleType, name } = libraryHandleDescription(library);
  return { label: `Remembered ${handleType}: ${name}; permission status unavailable`, canForget: true, pending: false };
}

function libraryDashboardMarkup(model) {
  const {
    library,
    profile,
    handleStatus,
    empty,
    rows,
    folders,
    sourceCount,
    libraryTitle,
    activeViewMode,
    libraryStats
  } = model;
  if (empty) {
    return storageMode === 'indexeddb'
      ? `
        <div class="library-dashboard-shell">
          <div class="library-dashboard">
            <aside class="library-history" aria-label="Local profile">
              <h2>Local profile</h2>
              ${localProfileStatusMarkup(profile, handleStatus)}
            </aside>
            <section class="library-main">
              <p class="small">No browser-local sources yet. Save library can initialize an empty local library folder, or import a source, bundle, or library package to begin.</p>
            </section>
          </div>
        </div>
      `
      : '<p class="small">No documents in the local library yet.</p>';
  }
  return `
    <div class="library-dashboard-shell">
      <div class="library-dashboard">
        <aside class="library-history" aria-label="Library profile">
          <h2>History</h2>
          <dl>
            <div>
              <dt>Last edit</dt>
              <dd data-library-last-edit>${escapeHtml(formatDateTime(libraryStats.lastEditAt))}</dd>
            </div>
            <div>
              <dt>Snapshot</dt>
              <dd data-library-snapshot>${escapeHtml(libraryStats.snapshot)}</dd>
            </div>
            ${library?.fileHandleName ? `
              <div>
                <dt>Local folder</dt>
                <dd>${escapeHtml(library.fileHandleName)}</dd>
              </div>
            ` : ''}
            <div>
              <dt>Profile</dt>
              <dd>${escapeHtml(profile?.name || 'Local profile')}</dd>
            </div>
            ${localPackageAccessMarkup(handleStatus)}
          </dl>
        </aside>
        <section class="library-main">
          <label class="library-title-field">
            <span class="library-field-label">Library</span>
            <input type="text" value="${escapeAttr(libraryTitle)}" data-original-title="${escapeAttr(libraryTitle)}" data-library-title="current" ${library ? '' : 'disabled'}>
            <span class="small" data-library-source-count>${sourceCount} source${sourceCount === 1 ? '' : 's'}</span>
          </label>
          ${library ? libraryViewToolbarMarkup(activeViewMode, folders, sourceCount) : ''}
          <div class="library-view-region" data-library-view-region>
            ${libraryViewMarkup(model)}
          </div>
        </section>
      </div>
    </div>
  `;
}

function libraryViewMarkup(model) {
  const viewMode = model.activeViewMode || (model.library ? libraryViewMode : 'list');
  return `
    ${!model.rows.length ? '<p class="small">This local library has no bundles yet. Import a source or bundle, then save again to update the same library folder.</p>' : ''}
    ${viewMode === 'tree'
      ? libraryTreeMarkup(model.displayRows, model.folders)
      : model.library
        ? libraryListMarkup(model.listRows, model.folders)
        : standaloneDocumentListMarkup(model.listRows)}
  `;
}

async function refreshLibraryViewFromStorage(options = {}) {
  const generation = ++libraryRenderGeneration;
  const focusSnapshot = captureLibraryFocus();
  const model = await buildLibraryRenderModel();
  if (generation !== libraryRenderGeneration) return model;
  libraryRenderModel = model;
  if (!documentsEl.querySelector('[data-library-view-region]') || model.empty) {
    documentsEl.innerHTML = libraryDashboardMarkup(model);
    restoreLibraryFocus(focusSnapshot);
    scheduleSelectedLibraryItemPopoverReveal();
    scheduleLibraryRenderModelEnrichment(model, generation);
    return model;
  }
  syncLibraryShellFromModel(model);
  renderLibraryViewRegion(model, options);
  restoreLibraryFocus(focusSnapshot);
  scheduleSelectedLibraryItemPopoverReveal();
  scheduleLibraryRenderModelEnrichment(model, generation);
  return model;
}

function syncLibraryShellFromModel(model) {
  const sourceCountEl = documentsEl.querySelector('[data-library-source-count]');
  if (sourceCountEl) {
    sourceCountEl.textContent = `${model.sourceCount} source${model.sourceCount === 1 ? '' : 's'}`;
  }
  const toolbar = documentsEl.querySelector('[data-library-view-toolbar]');
  if (toolbar && model.library) {
    toolbar.outerHTML = libraryViewToolbarMarkup(model.activeViewMode, model.folders, model.sourceCount);
  }
}

function renderLibraryViewRegion(model, options = {}) {
  const region = documentsEl.querySelector('[data-library-view-region]');
  if (!region) return;
  if (options.animateTree && model.activeViewMode === 'tree') {
    renderLibraryViewRegionWithAnimation(region, model);
    return;
  }
  region.innerHTML = libraryViewMarkup(model);
}

function renderLibraryViewRegionWithAnimation(region, model) {
  const firstPositions = measureLibraryTreeItems(region);
  region.innerHTML = libraryViewMarkup(model);
  const lastPositions = measureLibraryTreeItems(region);
  animateLibraryTreeItems(region, firstPositions, lastPositions);
}

function libraryViewToolbarMarkup(activeViewMode, folders, sourceCount) {
  return `
    <div class="library-view-toolbar" data-library-view-toolbar aria-label="Library view controls">
      <div class="library-view-toggle" role="group" aria-label="Library display mode">
        <button type="button" data-library-view-mode="list" class="${activeViewMode === 'list' ? 'is-active' : ''}" aria-pressed="${activeViewMode === 'list'}">List</button>
        <button type="button" data-library-view-mode="tree" class="${activeViewMode === 'tree' ? 'is-active' : ''}" aria-pressed="${activeViewMode === 'tree'}">Tree</button>
      </div>
      <form class="library-folder-create" data-create-library-folder="current">
        <input type="text" name="folderTitle" placeholder="New folder" aria-label="New folder name" autocomplete="off">
        <select name="parentFolder" aria-label="Parent folder">
          ${folderOptionsMarkup(folders, '')}
        </select>
        <button type="submit">Create folder</button>
      </form>
      <span class="small">${folders.length} folder${folders.length === 1 ? '' : 's'}, ${sourceCount} bundle${sourceCount === 1 ? '' : 's'}</span>
    </div>
  `;
}

function libraryListMarkup(rows, folders) {
  if (!rows.length) return '';
  return `
    <div class="library-tree library-finder library-flat-list" role="list" aria-label="Library bundles">
      ${rows.map((row) => libraryTreeBundleMarkup(row, -1, folders)).join('')}
    </div>
  `;
}

function standaloneDocumentListMarkup(rows) {
  if (!rows.length) return '';
  return rows.map((row) => libraryListRowMarkup(row)).join('');
}

function libraryListRowMarkup({ doc, entry, stats, folderPath }) {
  const entryTitle = entry?.title || doc.title || doc.id;
  const sourceTitle = doc.sourcePath || (doc.sourceType === 'pdf' ? 'source.pdf' : 'source.html');
  return `
    <article class="home-doc">
      <span class="home-doc-main">
        ${entry ? `
          <label class="library-level-field">
            <span class="sr-only">Bundle name</span>
            <span class="library-field-label">Bundle</span>
            <input type="text" value="${escapeAttr(entryTitle)}" data-original-title="${escapeAttr(entryTitle)}" data-library-bundle-title="${escapeAttr(entry.id)}">
          </label>
        ` : ''}
        <label class="library-level-field">
          <span class="sr-only">Source name</span>
          <span class="library-field-label">Source</span>
          <input type="text" value="${escapeAttr(sourceTitle)}" data-original-title="${escapeAttr(sourceTitle)}" data-source-title="${escapeAttr(doc.id)}">
        </label>
        <span class="library-entry-stats" data-library-entry-stats="${escapeAttr(libraryRowRenderKey({ doc, entry }))}">${escapeHtml(libraryListStatsText({ doc, entry, stats }))}</span>
        ${entry ? `
          <span class="library-folder-path">Folder ${escapeHtml(folderPath || 'Library root')}</span>
        ` : ''}
      </span>
      <span class="home-doc-actions">
        <button class="library-entry-replace" type="button" data-replace-source="${escapeAttr(doc.id)}" data-source-label="${escapeAttr(sourceTitle)}">Replace</button>
        ${entry ? `<button class="library-entry-delete" type="button" data-delete-library-bundle="${escapeAttr(entry.id)}" data-entry-label="${escapeAttr(entryTitle)}">Delete</button>` : ''}
        ${!entry ? `<button class="library-entry-delete" type="button" data-delete-document="${escapeAttr(doc.id)}" data-source-label="${escapeAttr(sourceTitle)}">Delete</button>` : ''}
        <a class="home-doc-open" href="${escapeAttr(urlWithStorage('reader.html', { doc: doc.id }, storageMode))}">Open -&gt;</a>
      </span>
    </article>
  `;
}

function libraryListStatsText({ entry, stats }) {
  return `${stats.summary} · Last edit ${formatDateTime(stats.lastEditAt)} · Opened ${formatDateTime(entry?.lastOpenedAt)}`;
}

function libraryRowRenderKey({ doc, entry }) {
  return String(entry?.id || doc?.id || '');
}

function libraryTreeMarkup(rows, folders) {
  const childrenByParent = libraryFoldersByParent(folders);
  const entriesByFolder = libraryRowsByFolder(rows);
  const body = libraryTreeChildrenMarkup('', 0, childrenByParent, entriesByFolder, folders);
  return `
    <div class="library-tree library-finder" role="list" aria-label="Library folders and bundles">
      <div class="library-finder-root-shell" role="listitem" data-library-node-kind="root" data-library-node-id="" data-library-node-key="root">
        <div class="library-finder-row library-finder-root" data-library-drop-folder="" style="--library-tree-depth: 0">
          <span class="library-finder-indent" aria-hidden="true"></span>
          <span class="library-folder-disclosure-spacer" aria-hidden="true"></span>
          <span class="library-finder-icon library-finder-icon-root" aria-hidden="true"></span>
          <span class="library-finder-name">Library root</span>
          <span class="library-finder-meta">${rows.length} bundle${rows.length === 1 ? '' : 's'}</span>
        </div>
        <div class="library-finder-children" role="list" data-library-children-for="">
          ${body || '<p class="small library-tree-empty" role="listitem">No folders or bundles yet.</p>'}
        </div>
      </div>
    </div>
  `;
}

function libraryTreeChildrenMarkup(parentId, depth, childrenByParent, entriesByFolder, folders) {
  const folderMarkup = (childrenByParent.get(parentId) || [])
    .map((folder) => libraryTreeFolderMarkup(folder, depth, childrenByParent, entriesByFolder, folders))
    .join('');
  const entryMarkup = (entriesByFolder.get(parentId) || [])
    .map((row) => libraryTreeBundleMarkup(row, depth, folders))
    .join('');
  return `${entryMarkup}${folderMarkup}`;
}

function libraryTreeFolderMarkup(folder, depth, childrenByParent, entriesByFolder, folders) {
  const childMarkup = libraryTreeChildrenMarkup(folder.id, depth + 1, childrenByParent, entriesByFolder, folders);
  const title = folder.title || folder.id;
  const collapsed = libraryCollapsedFolderIds.has(folder.id);
  const selected = selectedTreeItemKind === 'folder' && selectedTreeItemId === folder.id;
  const childCount = (childrenByParent.get(folder.id) || []).length + (entriesByFolder.get(folder.id) || []).length;
  return `
    <div
      class="library-finder-folder ${collapsed ? 'is-collapsed' : ''} ${selected ? 'is-selected' : ''}"
      role="listitem"
      data-library-node-kind="folder"
      data-library-node-id="${escapeAttr(folder.id)}"
      data-library-node-key="folder:${escapeAttr(folder.id)}"
      data-library-folder-title="${escapeAttr(title)}"
      data-library-parent-id="${escapeAttr(folder.parentId || '')}"
    >
      <div class="library-finder-row-shell">
        <div
          class="library-finder-row library-finder-folder-row ${selected ? 'is-selected' : ''}"
          draggable="true"
          data-library-drag-kind="folder"
          data-library-drag-id="${escapeAttr(folder.id)}"
          data-library-drop-folder="${escapeAttr(folder.id)}"
          style="--library-tree-depth: ${depth + 1}"
        >
          <span class="library-finder-indent" aria-hidden="true"></span>
          <button
            class="library-folder-disclosure"
            type="button"
            data-toggle-library-folder="${escapeAttr(folder.id)}"
            aria-label="${collapsed ? 'Expand' : 'Collapse'} ${escapeAttr(title)}"
            aria-expanded="${!collapsed}"
          >
            <span aria-hidden="true"></span>
          </button>
          <span class="library-finder-icon library-finder-icon-folder" aria-hidden="true"></span>
          <button
            class="library-finder-name-button"
            type="button"
            data-select-tree-folder="${escapeAttr(folder.id)}"
            aria-pressed="${selected}"
            aria-expanded="${selected}"
            ${selected ? `aria-controls="${libraryItemPopoverId('folder', folder.id)}"` : ''}
          >${escapeHtml(title)}</button>
          <span class="library-finder-meta">${childCount} item${childCount === 1 ? '' : 's'}</span>
        </div>
        ${selected ? libraryFolderPopoverMarkup({ folder, title, folders }) : ''}
      </div>
      <div class="library-finder-children" role="list" data-library-children-for="${escapeAttr(folder.id)}" ${collapsed ? 'hidden' : ''}>
        ${childMarkup || ''}
      </div>
    </div>
  `;
}

function libraryTreeBundleMarkup({ doc, entry, stats, folderPath }, depth, folders = []) {
  if (!entry) return '';
  const entryTitle = entry.title || doc.title || doc.id;
  const sourceTitle = doc.sourcePath || (doc.sourceType === 'pdf' ? 'source.pdf' : 'source.html');
  const selected = selectedTreeItemKind === 'bundle' && selectedTreeItemId === entry.id;
  return `
    <div
      class="library-tree-bundle-shell ${selected ? 'is-selected' : ''}"
      style="--library-tree-depth: ${depth + 1}"
      data-library-node-kind="bundle"
      data-library-node-id="${escapeAttr(entry.id)}"
      data-library-node-key="bundle:${escapeAttr(entry.id)}"
      data-library-doc-id="${escapeAttr(doc.id)}"
      data-library-entry-title="${escapeAttr(entryTitle)}"
      data-library-source-title="${escapeAttr(sourceTitle)}"
      data-library-folder-id="${escapeAttr(entry.folderId || '')}"
      role="listitem"
    >
      <button
        class="library-finder-row library-finder-bundle ${selected ? 'is-selected' : ''}"
        type="button"
        draggable="true"
        data-library-drag-kind="bundle"
        data-library-drag-id="${escapeAttr(entry.id)}"
        data-select-tree-bundle="${escapeAttr(entry.id)}"
        aria-pressed="${selected}"
        aria-expanded="${selected}"
        ${selected ? `aria-controls="${libraryItemPopoverId('bundle', entry.id)}"` : ''}
      >
        <span class="library-finder-indent" aria-hidden="true"></span>
        <span class="library-folder-disclosure-spacer" aria-hidden="true"></span>
        <span class="library-finder-icon library-finder-icon-bundle" aria-hidden="true"></span>
        <span class="library-tree-bundle-title">${escapeHtml(entryTitle)}</span>
        <span class="library-tree-bundle-meta">${escapeHtml(folderPath || 'Library root')} · <span data-library-entry-summary="${escapeAttr(libraryRowRenderKey({ doc, entry }))}">${escapeHtml(stats.summary)}</span></span>
      </button>
      ${selected ? libraryItemPopoverMarkup({
        kind: 'bundle',
        id: entry.id,
        title: entryTitle,
        moveOptions: folderOptionsMarkup(folders, entry.folderId || ''),
        doc,
        sourceTitle
      }) : ''}
    </div>
  `;
}

function libraryFolderPopoverMarkup({ folder, title, folders = libraryRenderModel?.folders || [] }) {
  return libraryItemPopoverMarkup({
    kind: 'folder',
    id: folder.id,
    title,
    moveOptions: folderMoveOptionsMarkup(folders, folder)
  });
}

function libraryItemPopoverMarkup({ kind, id, title, moveOptions, doc = null, sourceTitle = '' }) {
  const isBundle = kind === 'bundle';
  const itemLabel = isBundle ? 'Bundle' : 'Folder';
  const renameData = isBundle
    ? `data-library-bundle-title="${escapeAttr(id)}"`
    : `data-library-folder-title="${escapeAttr(id)}"`;
  const orderState = libraryItemOrderState(kind, id);
  const deleteAction = isBundle
    ? `<button class="library-entry-delete" type="button" data-delete-library-bundle="${escapeAttr(id)}" data-entry-label="${escapeAttr(title)}">Delete</button>`
    : `<button class="library-entry-delete" type="button" data-delete-library-folder="${escapeAttr(id)}" data-folder-label="${escapeAttr(title)}">Delete</button>`;
  return `
    <div id="${libraryItemPopoverId(kind, id)}" class="library-item-popover" role="dialog" aria-label="${itemLabel} actions">
      <label class="library-popover-field">
        <span class="library-field-label">${itemLabel}</span>
        <input type="text" value="${escapeAttr(title)}" data-original-title="${escapeAttr(title)}" ${renameData} aria-label="${itemLabel} name">
      </label>
      ${isBundle ? `<p class="library-popover-source" title="${escapeAttr(sourceTitle)}">${escapeHtml(sourceTitle)}</p>` : ''}
      <div class="library-popover-organize">
        <form class="library-popover-move" data-move-library-item="${kind}" data-library-item-id="${escapeAttr(id)}">
          <label><span class="library-field-label">Location</span><select name="destination">${moveOptions}</select></label>
          <button type="submit">Move</button>
        </form>
        <div class="library-popover-order-row">
          <span class="library-field-label">Order</span>
          <div class="library-order-actions" aria-label="${itemLabel} order">
            <button type="button" data-library-move-direction="up" data-library-item-kind="${kind}" data-library-item-id="${escapeAttr(id)}" ${orderState.canMoveUp ? '' : 'disabled title="Already first in this location"'}>Move up</button>
            <button type="button" data-library-move-direction="down" data-library-item-kind="${kind}" data-library-item-id="${escapeAttr(id)}" ${orderState.canMoveDown ? '' : 'disabled title="Already last in this location"'}>Move down</button>
          </div>
        </div>
      </div>
      <div class="library-popover-actions ${isBundle ? '' : 'is-folder'}">
        ${isBundle ? `
          <a class="home-doc-open" href="${escapeAttr(urlWithStorage('reader.html', { doc: doc.id }, storageMode))}">Open</a>
          <button class="library-entry-replace" type="button" data-replace-source="${escapeAttr(doc.id)}" data-source-label="${escapeAttr(sourceTitle)}">Replace</button>
        ` : ''}
        ${deleteAction}
      </div>
    </div>
  `;
}

function libraryItemOrderState(kind, id) {
  const parentKey = kind === 'folder' ? 'parentId' : 'folderId';
  const items = kind === 'folder'
    ? libraryRenderModel?.folders || []
    : (libraryRenderModel?.displayRows || []).map((row) => row.entry).filter(Boolean);
  const current = items.find((item) => item.id === id);
  if (!current) return { canMoveUp: false, canMoveDown: false };
  const parentId = current[parentKey] || null;
  const siblings = items
    .filter((item) => (item[parentKey] || null) === parentId)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.id).localeCompare(String(b.id)));
  const index = siblings.findIndex((item) => item.id === id);
  return {
    canMoveUp: index > 0,
    canMoveDown: index >= 0 && index < siblings.length - 1
  };
}

function libraryItemPopoverId(kind, id) {
  return `library-${kind}-actions-${String(id || '').replace(/[^\w.-]+/g, '-')}`;
}

function folderMoveOptionsMarkup(folders, movedFolder) {
  const disallowed = new Set([movedFolder.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const folder of folders || []) {
      if (folder.parentId && disallowed.has(folder.parentId) && !disallowed.has(folder.id)) {
        disallowed.add(folder.id);
        changed = true;
      }
    }
  }
  return folderOptionsMarkup((folders || []).filter((folder) => !disallowed.has(folder.id)), movedFolder.parentId || '');
}

function folderOptionsMarkup(folders, selectedId = '') {
  const flattened = flattenLibraryFolders(folders);
  return `
    <option value="" ${selectedId ? '' : 'selected'}>Library root</option>
    ${flattened.map(({ folder, depth, path }) => `
      <option value="${escapeAttr(folder.id)}" ${folder.id === selectedId ? 'selected' : ''}>${escapeHtml(folderOptionLabel(path, depth))}</option>
    `).join('')}
  `;
}

function folderOptionLabel(path, depth) {
  return `${'-- '.repeat(depth)}${path}`;
}

function flattenLibraryFolders(folders) {
  const childrenByParent = libraryFoldersByParent(folders);
  const rows = [];
  const visit = (parentId, depth, parentPath) => {
    for (const folder of childrenByParent.get(parentId) || []) {
      const title = folder.title || folder.id;
      const path = parentPath ? `${parentPath}/${title}` : title;
      rows.push({ folder, depth, path });
      visit(folder.id, depth + 1, path);
    }
  };
  visit('', 0, '');
  return rows;
}

function libraryFoldersByParent(folders) {
  const childrenByParent = new Map();
  for (const folder of folders || []) {
    const key = folder.parentId || '';
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(folder);
  }
  for (const children of childrenByParent.values()) {
    children.sort(compareLibraryFolders);
  }
  return childrenByParent;
}

function libraryRowsByFolder(rows) {
  const rowsByFolder = new Map();
  for (const row of rows || []) {
    const key = row.entry?.folderId || '';
    if (!rowsByFolder.has(key)) rowsByFolder.set(key, []);
    rowsByFolder.get(key).push(row);
  }
  for (const folderRows of rowsByFolder.values()) {
    folderRows.sort(compareRowsByTreeOrder);
  }
  return rowsByFolder;
}

function libraryFolderPathMap(folders) {
  const paths = new Map();
  for (const { folder, path } of flattenLibraryFolders(folders)) {
    paths.set(folder.id, path);
  }
  return paths;
}

function compareLibraryFolders(a, b) {
  return Number(a.order || 0) - Number(b.order || 0)
    || String(a.title || a.id || '').localeCompare(String(b.title || b.id || ''));
}

function compareRowsByTreeOrder(a, b) {
  return Number(a.entry?.order || 0) - Number(b.entry?.order || 0)
    || String(a.entry?.title || a.doc?.title || '').localeCompare(String(b.entry?.title || b.doc?.title || ''));
}

function compareRowsByRecentOpen(a, b) {
  const opened = String(b.entry?.lastOpenedAt || '').localeCompare(String(a.entry?.lastOpenedAt || ''));
  if (opened) return opened;
  return compareRowsByTreeOrder(a, b);
}

function loadLibraryViewMode() {
  try {
    const mode = localStorage.getItem(LIBRARY_VIEW_MODE_KEY);
    return mode === 'tree' ? 'tree' : 'list';
  } catch {
    return 'list';
  }
}

function setLibraryViewMode(mode) {
  if (mode !== 'list' && mode !== 'tree') return;
  libraryViewMode = mode;
  selectedTreeItemKind = '';
  selectedTreeItemId = '';
  try {
    localStorage.setItem(LIBRARY_VIEW_MODE_KEY, mode);
  } catch {
    // Ignore private-mode storage failures; the in-memory mode still updates.
  }
  if (libraryRenderModel?.library && documentsEl.querySelector('[data-library-view-region]')) {
    libraryRenderModel = {
      ...libraryRenderModel,
      activeViewMode: mode
    };
    syncLibraryShellFromModel(libraryRenderModel);
    renderLibraryViewRegion(libraryRenderModel);
    documentsEl.querySelector(`[data-library-view-mode="${mode}"]`)?.focus?.({ preventScroll: true });
    return;
  }
  loadDocuments({ showLoading: false }).catch(showError);
}

function captureLibraryFocus() {
  const active = document.activeElement;
  if (!active || !documentsEl?.contains(active)) return null;
  const node = active.closest?.('[data-library-node-kind]');
  return {
    kind: node?.dataset?.libraryNodeKind || '',
    id: node?.dataset?.libraryNodeId || '',
    viewMode: active.dataset?.libraryViewMode || '',
    toggleFolder: active.dataset?.toggleLibraryFolder || '',
    selectBundle: active.dataset?.selectTreeBundle || '',
    selectFolder: active.dataset?.selectTreeFolder || '',
    folderTitle: active.dataset?.libraryFolderTitle || '',
    bundleTitle: active.dataset?.libraryBundleTitle || '',
    sourceTitle: active.dataset?.sourceTitle || '',
    moveDirection: active.dataset?.libraryMoveDirection || '',
    itemKind: active.dataset?.libraryItemKind || '',
    name: active.getAttribute?.('name') || '',
    tagName: active.tagName || ''
  };
}

function restoreLibraryFocus(snapshot) {
  if (!snapshot) return;
  let scope = documentsEl;
  if (snapshot.kind) scope = findLibraryNode(snapshot.kind, snapshot.id) || documentsEl;
  let target = null;
  if (snapshot.viewMode) target = documentsEl.querySelector(`[data-library-view-mode="${snapshot.viewMode}"]`);
  if (!target && snapshot.toggleFolder) target = scope.querySelector?.(`[data-toggle-library-folder="${snapshot.toggleFolder}"]`);
  if (!target && snapshot.selectBundle) target = scope.querySelector?.(`[data-select-tree-bundle="${snapshot.selectBundle}"]`);
  if (!target && snapshot.selectFolder) target = scope.querySelector?.(`[data-select-tree-folder="${snapshot.selectFolder}"]`);
  if (!target && snapshot.folderTitle) target = scope.querySelector?.(`[data-library-folder-title="${snapshot.folderTitle}"]`);
  if (!target && snapshot.bundleTitle) target = scope.querySelector?.(`[data-library-bundle-title="${snapshot.bundleTitle}"]`);
  if (!target && snapshot.sourceTitle) target = scope.querySelector?.(`[data-source-title="${snapshot.sourceTitle}"]`);
  if (!target && snapshot.moveDirection) {
    target = scope.querySelector?.(`[data-library-move-direction="${snapshot.moveDirection}"][data-library-item-kind="${snapshot.itemKind}"]`);
  }
  if (!target && snapshot.name) target = scope.querySelector?.(`[name="${snapshot.name}"]`);
  target?.focus?.({ preventScroll: true });
}

function selectLibraryTreeItem(kind, id) {
  if (!['folder', 'bundle'].includes(kind) || !id) return;
  const wasSelected = selectedTreeItemKind === kind && selectedTreeItemId === id;
  clearLibraryTreeSelection();
  if (wasSelected) return;
  selectedTreeItemKind = kind;
  selectedTreeItemId = id;
  const shell = findLibraryNode(kind, id);
  const button = shell?.querySelector(libraryTreeItemTriggerSelector(kind));
  const row = shell?.querySelector('.library-finder-row');
  if (!shell || !button || !row) {
    selectedTreeItemKind = '';
    selectedTreeItemId = '';
    return;
  }
  shell.classList.add('is-selected');
  row.classList.add('is-selected');
  button.setAttribute('aria-pressed', 'true');
  button.setAttribute('aria-expanded', 'true');
  button.setAttribute('aria-controls', libraryItemPopoverId(kind, id));
  const markup = kind === 'bundle'
    ? libraryItemPopoverMarkup(libraryBundleDataFromShell(shell))
    : libraryFolderPopoverMarkup(libraryFolderDataFromShell(shell));
  row.insertAdjacentHTML('afterend', markup);
  scheduleLibraryItemPopoverReveal(kind, id);
}

function scheduleSelectedLibraryItemPopoverReveal() {
  if (!selectedTreeItemKind || !selectedTreeItemId) return;
  scheduleLibraryItemPopoverReveal(selectedTreeItemKind, selectedTreeItemId);
}

function scheduleLibraryItemPopoverReveal(kind, id) {
  window.requestAnimationFrame(() => {
    if (selectedTreeItemKind !== kind || selectedTreeItemId !== id) return;
    const popup = document.getElementById(libraryItemPopoverId(kind, id));
    if (!popup) return;
    const scrollDelta = libraryPopoverScrollDelta(
      popup.getBoundingClientRect(),
      window.innerHeight,
      LIBRARY_POPOVER_VIEWPORT_MARGIN
    );
    if (Math.abs(scrollDelta) < 1) return;
    window.scrollBy({ top: scrollDelta, left: 0, behavior: 'auto' });
  });
}

function libraryPopoverScrollDelta(rect, viewportHeight, margin = LIBRARY_POPOVER_VIEWPORT_MARGIN) {
  const availableHeight = Math.max(0, viewportHeight - (margin * 2));
  if (rect.height > availableHeight) return rect.top - margin;
  const bottomLimit = viewportHeight - margin;
  if (rect.bottom > bottomLimit) return rect.bottom - bottomLimit;
  if (rect.top < margin) return rect.top - margin;
  return 0;
}

function clearLibraryTreeSelection() {
  selectedTreeItemKind = '';
  selectedTreeItemId = '';
  documentsEl?.querySelectorAll?.('.library-tree-bundle-shell.is-selected, .library-finder-folder.is-selected').forEach((shell) => {
    shell.classList.remove('is-selected');
    shell.querySelector('.library-item-popover')?.remove();
    shell.querySelector('.library-finder-row')?.classList.remove('is-selected');
  });
  documentsEl?.querySelectorAll?.('[data-select-tree-bundle], [data-select-tree-folder]').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-controls');
  });
}

function libraryTreeItemTriggerSelector(kind) {
  return kind === 'folder' ? '[data-select-tree-folder]' : '[data-select-tree-bundle]';
}

function libraryBundleDataFromShell(shell) {
  const entryId = shell?.dataset?.libraryNodeId || '';
  const docId = shell?.dataset?.libraryDocId || '';
  const entryTitle = shell?.dataset?.libraryEntryTitle || 'Untitled bundle';
  const sourceTitle = shell?.dataset?.librarySourceTitle || 'source.html';
  return {
    kind: 'bundle',
    id: entryId,
    title: entryTitle,
    moveOptions: folderOptionsMarkup(libraryRenderModel?.folders || [], shell?.dataset?.libraryFolderId || ''),
    doc: { id: docId },
    sourceTitle
  };
}

function libraryFolderDataFromShell(shell) {
  const id = shell?.dataset?.libraryNodeId || '';
  const folder = {
    id,
    parentId: shell?.dataset?.libraryParentId || null
  };
  return {
    folder,
    title: shell?.dataset?.libraryFolderTitle || 'Untitled folder',
    folders: libraryRenderModel?.folders || []
  };
}

function loadLibraryCollapsedFolderIds() {
  try {
    const raw = localStorage.getItem(LIBRARY_COLLAPSED_FOLDERS_KEY);
    const ids = JSON.parse(raw || '[]');
    return new Set(Array.isArray(ids) ? ids.filter(Boolean).map(String) : []);
  } catch {
    return new Set();
  }
}

function saveLibraryCollapsedFolderIds() {
  try {
    localStorage.setItem(LIBRARY_COLLAPSED_FOLDERS_KEY, JSON.stringify([...libraryCollapsedFolderIds]));
  } catch {
    // Ignore private-mode storage failures; the in-memory folded state still works.
  }
}

function toggleLibraryFolder(folderId) {
  if (!folderId) return;
  setLibraryFolderCollapsed(folderId, !libraryCollapsedFolderIds.has(folderId));
}

function setLibraryFolderCollapsed(folderId, collapsed) {
  if (!folderId) return;
  if (collapsed) {
    libraryCollapsedFolderIds.add(folderId);
  } else {
    libraryCollapsedFolderIds.delete(folderId);
  }
  saveLibraryCollapsedFolderIds();
  const folder = findLibraryNode('folder', folderId);
  const row = folder?.querySelector('.library-finder-folder-row');
  const toggle = folder?.querySelector('[data-toggle-library-folder]');
  const children = findLibraryChildrenContainer(folderId);
  folder?.classList.toggle('is-collapsed', collapsed);
  toggle?.setAttribute('aria-expanded', String(!collapsed));
  if (toggle) {
    const title = folder?.dataset?.libraryFolderTitle || row?.querySelector('.library-finder-name-button')?.textContent || 'folder';
    toggle.setAttribute('aria-label', `${collapsed ? 'Expand' : 'Collapse'} ${title}`);
  }
  if (children) children.hidden = collapsed;
}

function handleLibraryDragStart(event) {
  const item = event.target?.closest?.('[data-library-drag-kind]');
  if (!item || !event.dataTransfer) return;
  const payload = {
    kind: item.dataset.libraryDragKind,
    id: item.dataset.libraryDragId
  };
  if (!payload.id || (payload.kind !== 'folder' && payload.kind !== 'bundle')) return;
  clearLibraryTreeSelection();
  const serialized = JSON.stringify(payload);
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(LIBRARY_DRAG_MIME, serialized);
  event.dataTransfer.setData('text/plain', serialized);
  item.classList.add('is-dragging');
}

function handleLibraryDragOver(event) {
  const target = event.target?.closest?.('[data-library-drop-folder]');
  if (!target || !documentsEl?.contains(target)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  clearLibraryDropTargets();
  target.classList.add('is-drop-target');
}

function handleLibraryDragLeave(event) {
  const target = event.target?.closest?.('[data-library-drop-folder]');
  if (!target || target.contains(event.relatedTarget)) return;
  target.classList.remove('is-drop-target');
}

async function handleLibraryDrop(event) {
  const target = event.target?.closest?.('[data-library-drop-folder]');
  if (!target || !documentsEl?.contains(target)) return;
  event.preventDefault();
  const payload = libraryDragPayload(event);
  clearLibraryDragState();
  if (!payload?.id) return;
  const folderId = target.dataset.libraryDropFolder || null;
  const previewed = previewLibraryDrop(payload, target, folderId);
  try {
    if (payload.kind === 'folder') {
      await storage.moveLibraryFolder?.(payload.id, folderId);
      appendLibraryLog('Moved folder.');
    } else if (payload.kind === 'bundle') {
      await storage.moveLibraryBundle?.(payload.id, folderId);
      appendLibraryLog('Moved bundle.');
    }
  } catch (error) {
    if (previewed) await refreshLibraryViewFromStorage();
    throw error;
  }
  await refreshLibraryViewFromStorage({ animateTree: previewed });
}

function libraryDragPayload(event) {
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) return null;
  const raw = dataTransfer.getData(LIBRARY_DRAG_MIME) || dataTransfer.getData('text/plain');
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw);
    if ((payload.kind === 'folder' || payload.kind === 'bundle') && payload.id) return payload;
  } catch {
    return null;
  }
  return null;
}

function clearLibraryDropTargets() {
  documentsEl?.querySelectorAll?.('.is-drop-target').forEach((item) => item.classList.remove('is-drop-target'));
}

function clearLibraryDragState() {
  clearLibraryDropTargets();
  documentsEl?.querySelectorAll?.('.is-dragging').forEach((item) => item.classList.remove('is-dragging'));
  documentsEl?.querySelectorAll?.('.is-dropped-preview').forEach((item) => item.classList.remove('is-dropped-preview'));
}

function previewLibraryDrop(payload, target, folderId) {
  if (!payload?.id || libraryViewMode !== 'tree') return false;
  const node = findLibraryNode(payload.kind, payload.id);
  const targetFolderId = folderId || '';
  const targetChildren = findLibraryChildrenContainer(targetFolderId);
  if (!node || !targetChildren) return false;
  if (payload.kind === 'folder' && (targetFolderId === payload.id || node.contains(targetChildren))) return false;
  if (targetFolderId) setLibraryFolderCollapsed(targetFolderId, false);
  targetChildren.prepend(node);
  const targetDepth = libraryTreeDepthFromElement(target);
  updateLibraryNodeDepth(node, targetDepth + 1);
  node.classList.add('is-dropped-preview');
  return true;
}

async function moveLibraryItemFromForm(form) {
  const kind = form?.dataset?.moveLibraryItem;
  const id = form?.dataset?.libraryItemId;
  const destination = form?.querySelector?.('[name="destination"]')?.value || null;
  if (!id || !['folder', 'bundle'].includes(kind)) return;
  if (kind === 'folder') await storage.moveLibraryFolder?.(id, destination);
  else await storage.moveLibraryBundle?.(id, destination);
  selectedTreeItemKind = kind;
  selectedTreeItemId = id;
  await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
  focusLibraryNode(kind, id);
  appendLibraryLog(`Moved ${kind} with keyboard-accessible controls.`);
}

async function moveLibraryItemByDirection(button) {
  const direction = button?.dataset?.libraryMoveDirection;
  const kind = button?.dataset?.libraryItemKind;
  const id = button?.dataset?.libraryItemId;
  if (!id || !['folder', 'bundle'].includes(kind) || !['up', 'down'].includes(direction)) return;
  const context = await storage.getCurrentLibraryContext?.();
  if (!context) throw new Error('No current library is open.');
  const collectionKey = kind === 'folder' ? 'folders' : 'entries';
  const parentKey = kind === 'folder' ? 'parentId' : 'folderId';
  const items = (context[collectionKey] || []).map((item) => ({ ...item }));
  const current = items.find((item) => item.id === id);
  if (!current) throw new Error(`${capitalize(kind)} not found.`);
  const parentId = current[parentKey] || null;
  const siblings = items
    .filter((item) => (item[parentKey] || null) === parentId)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0) || String(a.id).localeCompare(String(b.id)));
  const index = siblings.findIndex((item) => item.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    appendLibraryLog(`${capitalize(kind)} is already ${direction === 'up' ? 'first' : 'last'} in this location.`);
    button.focus({ preventScroll: true });
    return;
  }
  [siblings[index], siblings[swapIndex]] = [siblings[swapIndex], siblings[index]];
  const orderById = new Map(siblings.map((item, order) => [item.id, order]));
  const nextContext = {
    ...context,
    [collectionKey]: items.map((item) => orderById.has(item.id) ? { ...item, order: orderById.get(item.id) } : item)
  };
  await storage.writeCurrentLibraryContext?.(nextContext);
  selectedTreeItemKind = kind;
  selectedTreeItemId = id;
  await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
  focusLibraryNode(kind, id, direction);
  appendLibraryLog(`Moved ${kind} ${direction}.`);
}

function focusLibraryNode(kind, id, direction = '') {
  const node = findLibraryNode(kind, id);
  const target = direction
    ? node?.querySelector(`[data-library-move-direction="${direction}"]`)
    : node?.querySelector(libraryTreeItemTriggerSelector(kind));
  target?.focus?.({ preventScroll: true });
}

function findLibraryNode(kind, id) {
  for (const node of documentsEl?.querySelectorAll?.('[data-library-node-kind][data-library-node-id]') || []) {
    if (node.dataset.libraryNodeKind === kind && node.dataset.libraryNodeId === String(id || '')) return node;
  }
  return null;
}

function findLibraryChildrenContainer(folderId) {
  const targetId = String(folderId || '');
  for (const container of documentsEl?.querySelectorAll?.('[data-library-children-for]') || []) {
    if ((container.dataset.libraryChildrenFor || '') === targetId) return container;
  }
  return null;
}

function libraryTreeDepthFromElement(element) {
  const raw = element?.style?.getPropertyValue('--library-tree-depth') || element?.closest?.('[style*="--library-tree-depth"]')?.style?.getPropertyValue('--library-tree-depth');
  const depth = Number.parseInt(raw, 10);
  return Number.isFinite(depth) ? depth : 0;
}

function updateLibraryNodeDepth(node, depth) {
  if (!node) return;
  node.style?.setProperty?.('--library-tree-depth', String(depth));
  const row = node.matches?.('.library-finder-folder')
    ? node.querySelector('.library-finder-folder-row')
    : node.querySelector('.library-finder-row');
  row?.style?.setProperty?.('--library-tree-depth', String(depth));
  if (!node.matches?.('.library-finder-folder')) return;
  const childNodes = node.querySelectorAll(':scope > .library-finder-children > [data-library-node-kind]');
  childNodes.forEach((child) => updateLibraryNodeDepth(child, depth + 1));
}

function measureLibraryTreeItems(container) {
  const positions = new Map();
  container.querySelectorAll('[data-library-node-key]').forEach((node) => {
    const rect = node.getBoundingClientRect();
    positions.set(node.dataset.libraryNodeKey, { top: rect.top, left: rect.left });
  });
  return positions;
}

function animateLibraryTreeItems(container, firstPositions, lastPositions) {
  const animated = [];
  container.querySelectorAll('[data-library-node-key]').forEach((node) => {
    const first = firstPositions.get(node.dataset.libraryNodeKey);
    const last = lastPositions.get(node.dataset.libraryNodeKey);
    if (!first || !last) return;
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (!dx && !dy) return;
    node.style.transform = `translate(${dx}px, ${dy}px)`;
    node.style.transition = 'transform 0s';
    animated.push(node);
  });
  if (!animated.length) return;
  requestAnimationFrame(() => {
    animated.forEach((node) => {
      node.classList.add('is-sorting');
      node.style.transition = `transform ${LIBRARY_SORT_ANIMATION_MS}ms ease`;
      node.style.transform = '';
    });
  });
  window.setTimeout(() => {
    animated.forEach((node) => {
      node.classList.remove('is-sorting');
      node.style.transition = '';
      node.style.transform = '';
    });
  }, LIBRARY_SORT_ANIMATION_MS + 40);
}

async function renameCurrentLibraryFromInput(input) {
  const previousTitle = input.dataset.originalTitle || '';
  const nextTitle = input.value.trim();
  if (!nextTitle) {
    input.value = previousTitle;
    reportFieldError(input, 'Library name cannot be empty.');
    throw new Error('Library name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameCurrentLibrary?.(nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    clearFieldError(input);
    appendLibraryLog(`Renamed library to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
    reportFieldError(input, error.message);
    throw error;
  } finally {
    input.disabled = false;
  }
}

async function renameLibraryBundleFromInput(input) {
  const entryId = input?.dataset?.libraryBundleTitle;
  if (!entryId) return;
  const previousTitle = input.dataset.originalTitle || '';
  const nextTitle = input.value.trim();
  if (!nextTitle) {
    input.value = previousTitle;
    reportFieldError(input, 'Bundle name cannot be empty.');
    throw new Error('Bundle name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    const renameBundle = storage.renameLibraryBundle || storage.renameLibraryEntry;
    await renameBundle?.call(storage, entryId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    clearFieldError(input);
    syncLibraryBundleTitleInDom(entryId, nextTitle);
    syncLibraryBundleTitleInModel(entryId, nextTitle);
    appendLibraryLog(`Renamed bundle to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
    reportFieldError(input, error.message);
    throw error;
  } finally {
    input.disabled = false;
  }
}

function syncLibraryBundleTitleInDom(entryId, title) {
  for (const input of documentsEl?.querySelectorAll?.('[data-library-bundle-title]') || []) {
    if (input.dataset.libraryBundleTitle === entryId) {
      input.dataset.originalTitle = title;
      input.value = title;
    }
  }
  const shell = findLibraryNode('bundle', entryId);
  if (!shell) return;
  shell.dataset.libraryEntryTitle = title;
  const titleEl = shell.querySelector('.library-tree-bundle-title');
  if (titleEl) titleEl.textContent = title;
  const deleteButton = shell.querySelector('[data-delete-library-bundle]');
  if (deleteButton) {
    deleteButton.dataset.entryLabel = title;
  }
}

function syncLibraryBundleTitleInModel(entryId, title) {
  if (!libraryRenderModel?.library?.entries) return;
  const updateRow = (row) => row.entry?.id === entryId
    ? { ...row, entry: { ...row.entry, title } }
    : row;
  const library = {
    ...libraryRenderModel.library,
    entries: libraryRenderModel.library.entries.map((entry) => entry.id === entryId
      ? { ...entry, title }
      : entry)
  };
  const rows = libraryRenderModel.rows.map(updateRow);
  const displayRows = libraryRenderModel.displayRows.map(updateRow);
  const listRows = libraryRenderModel.listRows.map(updateRow).sort(compareRowsByRecentOpen);
  libraryRenderModel = {
    ...libraryRenderModel,
    library,
    rows,
    displayRows,
    listRows
  };
}

async function createLibraryFolderFromForm(form) {
  const input = form.querySelector('input[name="folderTitle"]');
  const select = form.querySelector('select[name="parentFolder"]');
  const title = input?.value?.trim() || '';
  if (!title) {
    reportFieldError(input, 'Folder name cannot be empty.');
    throw new Error('Folder name cannot be empty.');
  }
  const parentId = select?.value || null;
  await storage.createLibraryFolder?.(title, parentId);
  if (input) input.value = '';
  clearFieldError(input);
  await refreshLibraryViewFromStorage();
  appendLibraryLog(`Created folder "${title}".`);
}

async function renameLibraryFolderFromInput(input) {
  const folderId = input?.dataset?.libraryFolderTitle;
  if (!folderId) return;
  const previousTitle = input.dataset.originalTitle || '';
  const nextTitle = input.value.trim();
  if (!nextTitle) {
    input.value = previousTitle;
    reportFieldError(input, 'Folder name cannot be empty.');
    throw new Error('Folder name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameLibraryFolder?.(folderId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    clearFieldError(input);
    await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
    appendLibraryLog(`Renamed folder to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
    reportFieldError(input, error.message);
    throw error;
  } finally {
    input.disabled = false;
  }
}

async function deleteLibraryFolderFromButton(button) {
  const folderId = button?.dataset?.deleteLibraryFolder;
  if (!folderId) return;
  const label = button.dataset.folderLabel || 'this folder';
  const confirmed = await showAppDialog({
    title: 'Delete folder?',
    body: `Delete "${label}" from the current local library. The folder must be empty; saved package folders on your computer are not touched until you save again.`,
    actions: [
      { value: true, label: 'Delete folder', className: 'danger' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  await storage.deleteLibraryFolder?.(folderId);
  await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
  appendLibraryLog(`Deleted folder "${label}". Save the library to update the local package folder.`);
}

async function renameSourceFromInput(input) {
  const docId = input?.dataset?.sourceTitle;
  if (!docId) return;
  const previousTitle = input.dataset.originalTitle || '';
  const nextTitle = input.value.trim();
  if (!nextTitle) {
    input.value = previousTitle;
    reportFieldError(input, 'Source name cannot be empty.');
    throw new Error('Source name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameDocumentSource?.(docId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    clearFieldError(input);
    appendLibraryLog(`Renamed source to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
    reportFieldError(input, error.message);
    throw error;
  } finally {
    input.disabled = false;
  }
}

async function deleteLibraryBundleFromButton(button) {
  const entryId = button?.dataset?.deleteLibraryBundle;
  if (!entryId) return;
  const label = button.dataset.entryLabel
    || button.closest('.home-doc')?.querySelector('[data-library-bundle-title]')?.value
    || 'this bundle';
  const confirmed = await showAppDialog({
    title: 'Delete bundle?',
    body: `Delete "${label}" from the current local library. This removes its source and notes from browser-local storage; saved package folders on your computer are not touched until you save again.`,
    actions: [
      { value: true, label: 'Delete bundle', className: 'danger' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  await storage.deleteLibraryBundle?.(entryId);
  await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
  appendLibraryLog(`Deleted "${label}". Save the library to update the local package folder.`);
}

async function startSourceReplacementFromButton(button) {
  const docId = button?.dataset?.replaceSource;
  if (!docId) return;
  const label = button.dataset.sourceLabel
    || button.closest('.home-doc')?.querySelector('[data-source-title]')?.value
    || 'this source';
  const confirmed = await showAppDialog({
    title: 'Replace source?',
    body: `Choose an updated source file for "${label}". Existing notes and highlights stay in this library entry, so use a file that keeps the same stable anchors.`,
    actions: [
      { value: true, label: 'Choose file', className: 'primary' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  pendingReplaceSourceDocId = docId;
  replaceSourceFileInput?.click();
}

async function importSelectedReplacementSource() {
  const docId = pendingReplaceSourceDocId;
  const file = replaceSourceFileInput?.files?.[0];
  if (!docId || !file) return;
  documentsEl.innerHTML = '<p class="small">Replacing source...</p>';
  try {
    const updated = await storage.replaceDocumentSource?.(docId, file);
    await loadDocuments();
    appendLibraryLog(`Replaced source with "${updated?.sourcePath || file.name}". Existing notes and highlights were kept.`);
  } finally {
    pendingReplaceSourceDocId = null;
    if (replaceSourceFileInput) replaceSourceFileInput.value = '';
  }
}

async function deleteStandaloneDocumentFromButton(button) {
  const docId = button?.dataset?.deleteDocument;
  if (!docId) return;
  const label = button.dataset.sourceLabel
    || button.closest('.home-doc')?.querySelector('[data-source-title]')?.value
    || 'this source';
  const confirmed = await showAppDialog({
    title: 'Delete source?',
    body: `Delete "${label}" from browser-local storage. Saved package folders or zip files on your computer are not touched.`,
    actions: [
      { value: true, label: 'Delete source', className: 'danger' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  await storage.deleteDocumentData?.(docId);
  await loadDocuments();
  appendLibraryLog(`Deleted "${label}".`);
}

async function forgetCurrentLibraryHandle() {
  const library = await storage.getCurrentLibraryContext?.();
  if (!library?.fileHandle && !library?.fileHandleName) return;
  const confirmed = await showAppDialog({
    title: 'Forget local handle?',
    body: `Forget the remembered local package location "${library.fileHandleName || 'current library'}". Browser-local sources and notes stay in Marginalia; the next save will ask where to write the library package.`,
    actions: [
      { value: true, label: 'Forget handle', className: 'primary' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  await storage.clearCurrentLibraryFileHandle?.();
  await refreshLibraryViewFromStorage();
  appendLibraryLog('Forgot the remembered local package handle. Save will ask for a location next time.');
}

async function updateInstalledApp() {
  if (!updateAppBtn || !availableNetworkVersion || ['checking', 'updating'].includes(appUpdateState)) return;
  const networkVersion = availableNetworkVersion;
  appUpdateState = 'updating';
  appUpdateMessage = 'Downloading and installing the update. This can take up to a minute...';
  syncAppUpdateUi();
  appendLibraryLog(`Updating Marginalia to ${networkVersion.label}.`);
  try {
    const result = await updateAppFromNetwork({
      currentVersion: APP_VERSION,
      expectedVersion: networkVersion.version
    });
    if (result.status === 'activated') {
      appUpdateMessage = 'Update installed. Reloading this tab...';
      appendLibraryLog(successMessage('Update', appUpdateMessage));
      syncAppUpdateUi();
      reloadForAppUpdate(result.version || networkVersion.version);
      return;
    }
    if (result.status === 'already-current'
      && APP_VERSION !== networkVersion.version) {
      appUpdateMessage = 'The update is active. Reloading this tab...';
      appendLibraryLog(successMessage('Update', appUpdateMessage));
      syncAppUpdateUi();
      reloadForAppUpdate(result.version || networkVersion.version);
      return;
    }
    if (result.status === 'timed-out' || result.status === 'failed') {
      if (APP_UPDATE_RECHECK_REASONS.has(result.reason)) availableNetworkVersion = null;
      appUpdateState = 'update-error';
      appUpdateMessage = appUpdateErrorMessage(result);
      appendLibraryLog(appUpdateMessage, true);
      return;
    }
    availableNetworkVersion = null;
    appUpdateState = 'current';
    appUpdateMessage = `${APP_VERSION_LABEL} is up to date.`;
    appendLibraryLog(successMessage('Update', appUpdateMessage));
  } finally {
    syncAppUpdateUi();
  }
}

function appUpdateErrorMessage(result) {
  if (['registration-timeout', 'update-check-timeout'].includes(result.reason)) {
    return 'The browser is still preparing the update. Try Update app again in a moment.';
  }
  if (result.reason === 'installation-timeout') {
    return 'The update is still downloading. Wait a moment, then choose Update app again.';
  }
  if (result.reason === 'activation-timeout') {
    return 'The update downloaded but did not finish activating. Try Update app again.';
  }
  if (APP_UPDATE_RECHECK_REASONS.has(result.reason)) {
    return 'The hosted update changed while it was being prepared. Check for updates again.';
  }
  return result.error || 'The update could not be installed. Try again.';
}

function localProfileStatusMarkup(profile, handleStatus) {
  return `
    <dl>
      <div>
        <dt>Profile</dt>
        <dd>${escapeHtml(profile?.name || 'Local profile')}</dd>
      </div>
      ${localPackageAccessMarkup(handleStatus)}
    </dl>
  `;
}

function localPackageAccessMarkup(handleStatus) {
  return `
    <div data-library-package-access>
      <dt>Package access</dt>
      <dd>
        <span data-library-package-access-label>${escapeHtml(handleStatus.label)}</span>
        ${handleStatus.canForget ? '<br><button class="library-handle-forget" type="button" data-forget-library-handle="current">Forget local handle</button>' : ''}
      </dd>
    </div>
  `;
}

function startHtmlImport() {
  htmlFileInput?.click();
}

async function importSelectedHtml() {
  const file = htmlFileInput?.files?.[0];
  if (!file) return;
  documentsEl.innerHTML = '<p class="small">Importing source...</p>';
  try {
    const doc = await storage.importDocument(file);
    location.href = urlWithStorage('reader.html', { doc: doc.id }, storageMode);
  } finally {
    if (htmlFileInput) htmlFileInput.value = '';
  }
}

async function importSelectedBundle() {
  const file = bundleFileInput?.files?.[0];
  if (!file) return;
  await importBundleFile(file);
}

async function startBundleImport() {
  if (storageMode === 'indexeddb' && canUseDirectoryAccess()) {
    const mode = await choosePackageOpenMode('bundle');
    if (mode === 'cancel') return;
    if (mode === 'folder') {
      const handle = await pickAnnotatorPackageDirectory('annotator-bundle-open');
      if (handle) await importBundleFolder(handle);
      return;
    }
  }
  if (storageMode === 'indexeddb' && canUseFileSystemAccess()) {
    let picked = null;
    try {
      picked = await pickAnnotatorBundleFile();
    } catch (error) {
      if (error.name === 'AbortError') return;
      throw error;
    }
    if (picked) await importBundleFile(picked.file, picked.handle);
    return;
  }
  bundleFileInput?.click();
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

async function importBundleFolder(handle) {
  documentsEl.innerHTML = '<p class="small">Importing bundle folder...</p>';
  const bundle = await readParsedPackageFromDirectoryHandle(handle, 'bundle');
  const doc = await storage.importBundleData(bundle, { addToCurrentLibrary: true });
  await rememberDocumentHandle(doc.id, handle);
  location.href = urlWithStorage('reader.html', { doc: doc.id }, storageMode);
}

async function importBundleFile(file, fileHandle = null) {
  documentsEl.innerHTML = '<p class="small">Importing bundle...</p>';
  try {
    const doc = await storage.importDocumentBundle(file);
    if (fileHandle) await rememberDocumentHandle(doc.id, fileHandle);
    location.href = urlWithStorage('reader.html', { doc: doc.id }, storageMode);
  } finally {
    if (bundleFileInput) bundleFileInput.value = '';
  }
}

async function startLibraryImport() {
  if (storageMode === 'indexeddb' && canUseDirectoryAccess()) {
    const mode = await choosePackageOpenMode('library');
    if (mode === 'cancel') return;
    if (mode === 'folder') {
      const handle = await pickAnnotatorPackageDirectory('annotator-library-open');
      if (handle) await importLibraryFolder(handle);
      return;
    }
  }
  if (storageMode === 'indexeddb' && canUseFileSystemAccess()) {
    let picked = null;
    try {
      picked = await pickAnnotatorBundleFile();
    } catch (error) {
      if (error.name === 'AbortError') return;
      throw error;
    }
    if (picked) await importLibraryFile(picked.file, picked.handle);
    return;
  }
  libraryFileInput?.click();
}

async function importLibraryFolder(handle) {
  const importOptions = await confirmLibraryReplacement();
  if (!importOptions) return;
  documentsEl.innerHTML = '<p class="small">Importing library folder...</p>';
  const library = await readParsedPackageFromDirectoryHandle(handle, 'library');
  const result = await storage.importLibraryData(library, importOptions);
  await rememberCurrentLibraryHandle(handle);
  await loadDocuments();
  appendLibraryLog(`Imported "${result.library?.title || handle.name || 'library'}".`);
}

async function importSelectedLibrary() {
  const file = libraryFileInput?.files?.[0];
  if (!file) return;
  await importLibraryFile(file);
}

async function importLibraryFile(file, fileHandle = null) {
  if (!isAnnotatorLibraryFilename(file?.name)) {
    throw new Error('Choose a .annotator-library.zip file.');
  }
  try {
    const importOptions = await confirmLibraryReplacement();
    if (!importOptions) return;
    documentsEl.innerHTML = '<p class="small">Importing library...</p>';
    const result = await storage.importDocumentLibrary(file, importOptions);
    if (fileHandle) await rememberCurrentLibraryHandle(fileHandle);
    await loadDocuments();
    appendLibraryLog(`Imported "${result.library?.title || file.name}".`);
  } finally {
    if (libraryFileInput) libraryFileInput.value = '';
  }
}

async function confirmLibraryReplacement() {
  const currentLibrary = await storage.getCurrentLibraryContext?.();
  if (!currentLibrary) return { replaceCurrent: true };
  const confirmed = await showAppDialog({
    title: 'Replace current library?',
    body: `Importing a library package will close "${currentLibrary.title || 'the current library'}" and make the imported package current. Save first if you need a portable copy of unsaved browser-local changes.`,
    actions: [
      { value: false, label: 'Cancel', initialFocus: true },
      { value: true, label: 'Replace library', className: 'danger' }
    ],
    cancelValue: false
  });
  return confirmed ? { replaceCurrent: true } : null;
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
    importDroppedFile(event).catch(showError);
  });
}

function isFileDragEvent(event) {
  return Array.from(event.dataTransfer?.types || []).includes('Files');
}

async function importDroppedFile(event) {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  const importKind = await droppedFileImportKind(file);
  if (importKind === 'library') {
    await importLibraryFile(file);
    return;
  }
  if (importKind === 'bundle') {
    await importBundleFile(file);
    return;
  }
  documentsEl.innerHTML = '<p class="small">Importing source...</p>';
  const doc = await storage.importDocument(file);
  location.href = urlWithStorage('reader.html', { doc: doc.id }, storageMode);
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

async function fileStartsWithPdfMagic(file) {
  if (!file?.slice) return false;
  const bytes = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return bytes[0] === 0x25
    && bytes[1] === 0x50
    && bytes[2] === 0x44
    && bytes[3] === 0x46
    && bytes[4] === 0x2d;
}

function requestLibrarySave() {
  if (librarySavePromise) return librarySavePromise;
  if (saveLibraryBtn) saveLibraryBtn.disabled = true;
  const pending = saveCurrentLibrary().finally(() => {
    if (librarySavePromise !== pending) return;
    librarySavePromise = null;
    if (saveLibraryBtn) saveLibraryBtn.disabled = false;
  });
  librarySavePromise = pending;
  return pending;
}

async function saveCurrentLibrary() {
  let library = await storage.getCurrentLibraryContext?.();
  const createdLibraryForSave = !library;
  if (!library) library = await storage.createCurrentLibraryFromDocuments?.();
  documentsEl.innerHTML = '<p class="small">Saving library...</p>';
  const filename = libraryFilenameForTitle(library.title || 'annotator-library');
  const saved = await saveLibraryPackage(filename, library);
  await loadDocuments();
  if (saved?.cancelled) {
    if (createdLibraryForSave) await storage.clearCurrentLibraryContext?.();
    await loadDocuments();
    return;
  }
  appendLibraryLog(librarySaveMessage(saved, filename, library));
}

async function saveLibraryPackage(filename, library) {
  if (storageMode === 'indexeddb' && (canUseDirectoryAccess() || canUseFileSystemAccess())) {
    let saved = null;
    try {
      saved = await saveLibraryWithLocalAccess(filename, library);
    } catch (error) {
      appendLibraryLog(`Library save picker failed (${error.message}). Downloading a copy...`, true);
    }
    if (saved?.cancelled) return saved;
    if (saved?.handle) await rememberCurrentLibraryHandle(saved.handle);
    if (saved?.name) return saved;
  }
  const bytes = await storage.exportCurrentLibraryPackage();
  downloadBytes(bytes, filename);
  return { downloaded: true, name: filename };
}

async function rememberDocumentHandle(docId, handle) {
  if (!docId || !handle) return false;
  try {
    return await storage.setDocumentFileHandle?.(docId, handle);
  } catch (error) {
    appendLibraryLog(`Imported, but the bundle folder handle could not be remembered (${error.message}). Save will ask again.`, true);
    return false;
  }
}

async function rememberCurrentLibraryHandle(handle) {
  if (!handle) return false;
  try {
    return await storage.setCurrentLibraryFileHandle?.(handle);
  } catch (error) {
    appendLibraryLog(`Imported, but the library folder handle could not be remembered (${error.message}). Save will ask again.`, true);
    return false;
  }
}

async function saveLibraryWithLocalAccess(filename, library = null) {
  const existingHandle = library?.fileHandle || null;
  const folderName = libraryFolderNameForTitle(library?.title || filename.replace(/\.annotator-library\.zip$/i, ''));
  if (existingHandle) {
    try {
      if (existingHandle.kind === 'directory') {
        const files = await storage.exportCurrentLibraryFolderFiles();
        await writeFilesToDirectoryHandle(existingHandle, files);
        return { name: existingHandle.name || folderName, handle: existingHandle, folder: true };
      }
      const bytes = await storage.exportCurrentLibraryPackage();
      await writeBytesToFileHandle(existingHandle, bytes);
      return { name: existingHandle.name || filename, handle: existingHandle };
    } catch {
      // Fall through to a fresh save location if the remembered handle is stale.
    }
  }
  if (canUseDirectoryAccess()) {
    try {
      appendLibraryLog(`Choose or create the package folder "${folderName}". Do not choose its parent folder.`);
      const handle = await pickAnnotatorPackageDirectory('annotator-library-save');
      if (!handle) return null;
      const files = await storage.exportCurrentLibraryFolderFiles();
      await writeFilesToDirectoryHandle(handle, files);
      return { name: handle.name || folderName, handle, folder: true };
    } catch (error) {
      if (error.name === 'AbortError') return { cancelled: true };
      appendLibraryLog(`Folder save failed (${error.message}). Choose a zip save location...`, true);
    }
  }
  const bytes = await storage.exportCurrentLibraryPackage();
  return saveBytesWithFileSystemAccess(bytes, filename, null);
}

async function saveBytesWithFileSystemAccess(bytes, filename, existingHandle = null) {
  if (existingHandle) {
    try {
      await writeBytesToFileHandle(existingHandle, bytes);
      return { name: existingHandle.name || filename, handle: existingHandle };
    } catch {
      // Fall through to a fresh save picker if the remembered handle is stale.
    }
  }
  try {
    const handle = await pickAnnotatorBundleSaveHandle(filename);
    if (!handle) return null;
    await writeBytesToFileHandle(handle, bytes);
    return { name: handle.name || filename, handle };
  } catch (error) {
    if (error.name === 'AbortError') return { cancelled: true };
    throw error;
  }
}

async function clearBrowserLibrary() {
  const confirmed = await showAppDialog({
    title: 'Clear local library?',
    body: 'This removes the browser-local library, imported sources, notes, quick marks, file handles, and last-open state. Saved bundle files on your computer are not touched.',
    actions: [
      { value: true, label: 'Clear local data', className: 'danger' },
      { value: false, label: 'Cancel' }
    ],
    cancelValue: false
  });
  if (!confirmed) return;
  await storage.clearBrowserLocalData?.();
  await loadDocuments();
}

function showAppDialog({ title, body, actions, cancelValue = null }) {
  if (!appDialog || !appDialogTitle || !appDialogBody || !appDialogActions) return Promise.resolve(cancelValue);
  const previousFocus = activeDialog?.previousFocus || document.activeElement;
  if (activeDialog) closeAppDialog(activeDialog.cancelValue, { restoreFocus: false });
  return new Promise((resolve) => {
    const inertSiblings = Array.from(document.body.children)
      .filter((element) => element !== appDialog)
      .map((element) => ({ element, inert: element.inert }));
    inertSiblings.forEach(({ element }) => { element.inert = true; });
    activeDialog = { resolve, cancelValue, previousFocus, inertSiblings };
    appDialogTitle.textContent = title || '';
    appDialogBody.textContent = body || '';
    appDialogActions.innerHTML = '';
    for (const action of actions || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      if (action.className) button.className = action.className;
      if (action.initialFocus) button.dataset.initialFocus = 'true';
      if (Object.is(action.value, cancelValue)) button.dataset.cancelAction = 'true';
      button.addEventListener('click', () => closeAppDialog(action.value));
      appDialogActions.append(button);
    }
    appDialog.hidden = false;
    appDialog.addEventListener('pointerdown', handleAppDialogBackdropPointerDown);
    appDialog.addEventListener('keydown', handleAppDialogKeyDown);
    requestAnimationFrame(() => safeDialogInitialFocus(appDialogActions)?.focus());
  });
}

function closeAppDialog(value, options = {}) {
  if (!activeDialog) return;
  const dialog = activeDialog;
  activeDialog = null;
  appDialog.hidden = true;
  appDialog.removeEventListener('pointerdown', handleAppDialogBackdropPointerDown);
  appDialog.removeEventListener('keydown', handleAppDialogKeyDown);
  dialog.inertSiblings?.forEach(({ element, inert }) => { element.inert = inert; });
  appDialogActions.innerHTML = '';
  dialog.resolve(value);
  if (options.restoreFocus !== false && isUsableFocusTarget(dialog.previousFocus)) {
    dialog.previousFocus.focus({ preventScroll: true });
  }
}

function handleAppDialogBackdropPointerDown(event) {
  if (event.target === appDialog && activeDialog) closeAppDialog(activeDialog.cancelValue);
}

function safeDialogInitialFocus(actionsElement) {
  const buttons = Array.from(actionsElement?.querySelectorAll?.('button:not(:disabled)') || []);
  const explicit = buttons.find((button) => button.dataset.initialFocus === 'true');
  if (explicit) return explicit;
  if (buttons.some((button) => button.classList.contains('danger'))) {
    return buttons.find((button) => button.dataset.cancelAction === 'true')
      || buttons.find((button) => !button.classList.contains('danger'))
      || buttons[0]
      || null;
  }
  return buttons[0] || null;
}

function handleAppDialogKeyDown(event) {
  if (!activeDialog) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    closeAppDialog(activeDialog.cancelValue);
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = Array.from(appDialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'))
    .filter((element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true');
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && (document.activeElement === first || !appDialog.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function isUsableFocusTarget(element) {
  return Boolean(element?.isConnected && !element.disabled && !element.inert && element.getAttribute?.('aria-hidden') !== 'true');
}

function showError(error) {
  appendLibraryLog(error?.message || String(error), true);
}

function reportFieldError(field, message) {
  if (!field) return;
  clearFieldError(field);
  const container = field.closest('label, form') || field.parentElement;
  if (!container) return;
  const error = document.createElement('span');
  const id = `library-field-error-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  error.id = id;
  error.className = 'library-field-error';
  error.setAttribute('role', 'alert');
  error.textContent = message || 'This value is invalid.';
  container.append(error);
  const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
  descriptions.add(id);
  field.setAttribute('aria-describedby', [...descriptions].join(' '));
  field.setAttribute('aria-errormessage', id);
  field.setAttribute('aria-invalid', 'true');
}

function clearFieldError(target) {
  const field = target?.closest?.('input, select, textarea') || target;
  if (!field?.getAttribute) return;
  const errorId = field.getAttribute('aria-errormessage');
  if (errorId) document.getElementById(errorId)?.remove();
  const descriptions = (field.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter((id) => id && id !== errorId);
  if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
  else field.removeAttribute('aria-describedby');
  field.removeAttribute('aria-errormessage');
  field.removeAttribute('aria-invalid');
}

function appendLibraryLog(message, isError = false) {
  libraryLogEntries.push({
    id: `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    message: String(message || '').trim() || 'Unknown event.',
    isError,
    createdAt: new Date().toISOString()
  });
  if (libraryLogEntries.length > MAX_LIBRARY_LOG_ENTRIES) {
    libraryLogEntries.splice(0, libraryLogEntries.length - MAX_LIBRARY_LOG_ENTRIES);
  }
  renderLibraryActivityLog();
}

function libraryActivityLogMarkup() {
  if (!libraryLogEntries.length) return '<p class="small library-log-empty">No activity yet.</p>';
  return `
    <ol class="library-log-list">
      ${libraryLogEntries.map((entry) => `
        <li class="library-log-entry ${entry.isError ? 'is-error' : ''}">
          <time class="library-log-time" datetime="${escapeAttr(entry.createdAt)}">${escapeHtml(formatActivityTimestamp(entry.createdAt))}</time>
          <span class="library-log-message">${escapeHtml(entry.message)}</span>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderLibraryActivityLog() {
  const container = document.querySelector('#libraryActivityLog');
  if (!container) return;
  container.innerHTML = libraryActivityLogMarkup();
  container.scrollTop = container.scrollHeight;
}

function librarySaveMessage(saved, filename, library) {
  if (saved?.downloaded) return successMessage('Save', `Downloaded ${filename}.`);
  const name = saved?.name || filename;
  const reminder = folderNameReminder(saved, library);
  const detail = reminder ? `Saved to ${name}. ${reminder}` : `Saved to ${name}.`;
  return successMessage('Save', detail);
}

function successMessage(action, detail) {
  return `${action} success: ${detail}`;
}

function folderNameReminder(saved, library) {
  const expectedName = libraryFolderNameForTitle(library?.title || 'annotator-library');
  if (!saved?.folder || !saved?.name || saved.name === expectedName) return '';
  return 'Folder name is unchanged because the browser cannot rename the selected local folder automatically.';
}

async function currentLibraryHandleStatus(library) {
  if (!library?.fileHandle && !library?.fileHandleName) {
    return { label: 'No remembered local package handle', canForget: false };
  }
  const { handleType, name } = libraryHandleDescription(library);
  const permission = await queryFileHandlePermissionState(library.fileHandle, 'readwrite');
  if (permission === 'granted') return { label: `Remembered ${handleType}: ${name}`, canForget: true };
  if (permission === 'prompt') return { label: `Remembered ${handleType}: ${name}; permission will be requested on save`, canForget: true };
  if (permission === 'denied') return { label: `Remembered ${handleType}: ${name}; permission denied`, canForget: true };
  return { label: `Remembered ${handleType}: ${name}`, canForget: true };
}

function libraryHandleDescription(library) {
  const handleType = library?.fileHandle?.kind === 'directory' ? 'folder'
    : library?.fileHandle?.kind === 'file' ? 'zip file'
      : 'package handle';
  const name = library?.fileHandleName || library?.fileHandle?.name || 'remembered package';
  return { handleType, name };
}

async function documentNoteStats(doc) {
  const annotations = doc?.id ? await storage.getAnnotations(doc.id) : [];
  let notes = 0;
  let highlights = 0;
  let ink = 0;
  let lastEditAt = doc?.updatedAt || doc?.createdAt || '';
  for (const annotation of annotations) {
    if (annotation.highlight?.enabled) highlights += 1;
    if (annotation.display?.mode !== 'highlight' && noteHasContent(annotation.note)) notes += 1;
    if (annotation.display?.mode !== 'highlight' && noteHasInk(annotation.note)) ink += 1;
    lastEditAt = maxIsoDate(lastEditAt, annotation.updatedAt || annotation.createdAt || '');
  }
  return documentNoteStatsFromRecord(doc, { notes, highlights, ink, lastEditAt });
}

function pendingDocumentNoteStats(doc) {
  return {
    notes: 0,
    highlights: 0,
    ink: 0,
    lastEditAt: doc?.updatedAt || doc?.createdAt || '',
    summary: 'Loading note totals...',
    pending: true
  };
}

function unavailableDocumentNoteStats(doc) {
  return {
    notes: 0,
    highlights: 0,
    ink: 0,
    lastEditAt: doc?.updatedAt || doc?.createdAt || '',
    summary: 'Note totals unavailable',
    unavailable: true
  };
}

function documentNoteStatsFromRecord(doc, stats = null) {
  const notes = Number(stats?.notes) || 0;
  const highlights = Number(stats?.highlights) || 0;
  const ink = Number(stats?.ink) || 0;
  const lastEditAt = stats?.lastEditAt || doc?.updatedAt || doc?.createdAt || '';
  return {
    notes,
    highlights,
    ink,
    lastEditAt,
    summary: `${notes} note${notes === 1 ? '' : 's'}, ${highlights} highlight${highlights === 1 ? '' : 's'}${ink ? `, ${ink} ink` : ''}`
  };
}

function summarizeLibraryStats(rows, library) {
  const noteTotalsPending = rows.some((row) => row.stats.pending);
  const noteTotalsUnavailable = rows.some((row) => row.stats.unavailable);
  const totals = rows.reduce((acc, row) => ({
    notes: acc.notes + row.stats.notes,
    highlights: acc.highlights + row.stats.highlights,
    ink: acc.ink + row.stats.ink,
    lastEditAt: maxIsoDate(acc.lastEditAt, row.stats.lastEditAt)
  }), {
    notes: 0,
    highlights: 0,
    ink: 0,
    lastEditAt: maxIsoDate(library?.packageUpdatedAt || library?.createdAt || '', library?.updatedAt || '')
  });
  let snapshot = `${rows.length} bundle${rows.length === 1 ? '' : 's'}, ${totals.notes} note${totals.notes === 1 ? '' : 's'}, ${totals.highlights} highlight${totals.highlights === 1 ? '' : 's'}`;
  if (noteTotalsPending) snapshot = `${rows.length} bundle${rows.length === 1 ? '' : 's'}, loading note totals...`;
  if (noteTotalsUnavailable) snapshot = `${rows.length} bundle${rows.length === 1 ? '' : 's'}, note totals unavailable`;
  return {
    lastEditAt: totals.lastEditAt,
    snapshot
  };
}

function noteHasContent(note) {
  if (!note) return false;
  if (String(note.title || '').trim()) return true;
  if (String(note.markdown || '').trim()) return true;
  if (noteHasInk(note)) return true;
  return (note.blocks || []).some((block) => {
    if (block?.type === 'text') return Boolean(String(block.markdown || '').trim());
    if (block?.type === 'ink') return noteHasInk({ ink: block.ink });
    if (block?.type === 'image') return Boolean(String(block.assetPath || '').trim());
    return block?.type === 'blank';
  });
}

function noteHasInk(note) {
  return Array.isArray(note?.ink?.strokes) && note.ink.strokes.length > 0;
}

function maxIsoDate(a, b) {
  if (!a) return b || '';
  if (!b) return a || '';
  return String(a) > String(b) ? a : b;
}

function formatDateTime(value) {
  if (!value) return 'No edits yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatActivityTimestamp(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
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
