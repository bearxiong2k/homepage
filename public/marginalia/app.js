import { APP_VERSION, APP_VERSION_LABEL } from './app-version.js';
import { currentStorageMode, fetchNetworkAppVersion, registerServiceWorker, updateAppFromNetwork, urlWithStorage } from './runtime.js';
import { createStorageAdapter } from './storage-adapter.js';
import { downloadBytes } from './bundle.js';
import {
  assertWritablePackageDirectory,
  canUseDirectoryAccess,
  canUseFileSystemAccess,
  pickAnnotatorBundleFile,
  pickAnnotatorBundleSaveHandle,
  pickAnnotatorPackageDirectory,
  queryFileHandlePermissionState,
  readFilesFromDirectoryHandle,
  writeFilesToDirectoryHandle,
  writeBytesToFileHandle
} from './file-access.js';
import {
  bundleArchiveBytesFromFolderFiles,
  bundleFolderFilesFromArchiveBytes,
  libraryArchiveBytesFromFolderFiles,
  libraryFolderFilesFromArchiveBytes,
  libraryFolderNameForTitle
} from './folder-package.js';
import { isAnnotatorLibraryFilename, libraryFilenameForTitle } from './library-package.js';

const storageMode = currentStorageMode();
const storage = createStorageAdapter({ mode: storageMode });

const documentsEl = document.querySelector('#documents');
const appVersionEl = document.querySelector('#appVersion');
const openReaderLink = document.querySelector('#openReaderLink');
const importHtmlBtn = document.querySelector('#importHtmlBtn');
const importBundleBtn = document.querySelector('#importBundleBtn');
const importLibraryBtn = document.querySelector('#importLibraryBtn');
const saveLibraryBtn = document.querySelector('#saveLibraryBtn');
const updateAppBtn = document.querySelector('#updateAppBtn');
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
let activeDialog = null;
let pendingReplaceSourceDocId = null;
let availableNetworkVersion = null;
let appUpdateCheckState = 'idle';
let libraryViewMode = loadLibraryViewMode();
let libraryCollapsedFolderIds = loadLibraryCollapsedFolderIds();
let libraryRenderModel = null;
let selectedTreeEntryId = '';

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
  saveLibraryBtn?.addEventListener('click', () => saveCurrentLibrary().catch(showError));
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
    if (event.target?.matches?.('[data-library-folder-title]')) {
      renameLibraryFolderFromInput(event.target).catch(showError);
    }
    if (event.target?.matches?.('[data-source-title]')) {
      renameSourceFromInput(event.target).catch(showError);
    }
  });
  documentsEl?.addEventListener('submit', (event) => {
    const form = event.target?.closest?.('[data-create-library-folder]');
    if (!form) return;
    event.preventDefault();
    createLibraryFolderFromForm(form).catch(showError);
  });
  documentsEl?.addEventListener('click', (event) => {
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
      selectLibraryTreeBundle(treeBundleButton.dataset.selectTreeBundle);
      return;
    }
    if (selectedTreeEntryId && !event.target?.closest?.('.library-bundle-popover')) {
      selectLibraryTreeBundle('');
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
  registerServiceWorker()
    .then(() => checkForAvailableAppUpdate())
    .catch(() => {});
  await loadDocuments();
}

async function checkForAvailableAppUpdate(options = {}) {
  appUpdateCheckState = 'checking';
  syncAppUpdateUi();
  try {
    const networkVersion = await fetchNetworkAppVersion();
    availableNetworkVersion = networkVersion && !networkVersion.isCurrent ? networkVersion : null;
    if (options.log) {
      appendLibraryLog(availableNetworkVersion
        ? `Update available: ${availableNetworkVersion.label}.`
        : `Marginalia is already using ${networkVersion?.label || APP_VERSION_LABEL}.`);
    }
    return networkVersion;
  } finally {
    appUpdateCheckState = 'idle';
    syncAppUpdateUi();
  }
}

function syncAppUpdateUi() {
  const hasAvailableUpdate = Boolean(availableNetworkVersion);
  if (appVersionEl) {
    if (appUpdateCheckState === 'checking') {
      appVersionEl.textContent = `${APP_VERSION_LABEL} · Checking for updates...`;
    } else if (hasAvailableUpdate) {
      appVersionEl.textContent = `${APP_VERSION_LABEL} · Update available: ${availableNetworkVersion.label}`;
    } else {
      appVersionEl.textContent = APP_VERSION_LABEL;
    }
  }
  if (updateAppBtn) {
    updateAppBtn.textContent = hasAvailableUpdate ? 'Update app' : 'Check for updates';
    updateAppBtn.title = hasAvailableUpdate
      ? `Update to ${availableNetworkVersion.label}`
      : 'Check the hosted Marginalia app version';
    if (appUpdateCheckState === 'checking') updateAppBtn.textContent = 'Checking...';
  }
}

async function loadDocuments(options = {}) {
  if (options.showLoading !== false) {
    documentsEl.innerHTML = '<p class="small">Loading documents...</p>';
  }
  const model = await buildLibraryRenderModel();
  libraryRenderModel = model;
  documentsEl.innerHTML = libraryDashboardMarkup(model);
}

async function buildLibraryRenderModel() {
  const [documents, library, profile] = await Promise.all([
    storage.listDocuments(),
    storage.getCurrentLibraryContext?.(),
    storage.ensureLocalProfile?.()
  ]);
  const handleStatus = await currentLibraryHandleStatus(library);
  if (saveLibraryBtn) saveLibraryBtn.disabled = false;
  if (!documents.length && !library) {
    return {
      documents,
      library,
      profile,
      handleStatus,
      empty: true,
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
  const orderedItems = library?.entries?.length
    ? library.entries
      .slice()
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map((entry) => ({
        entry,
        doc: documents.find((doc) => doc.id === entry.docId)
      }))
      .filter((item) => item.doc)
    : documents.map((doc) => ({ entry: null, doc }));
  const precomputedStats = storage.getDocumentNoteStats
    ? await storage.getDocumentNoteStats(orderedItems.map(({ doc }) => doc.id))
    : null;
  const rows = precomputedStats
    ? orderedItems.map(({ doc, entry }) => ({
      doc,
      entry,
      stats: documentNoteStatsFromRecord(doc, precomputedStats.get(doc.id))
    }))
    : await Promise.all(orderedItems.map(async ({ doc, entry }) => ({
      doc,
      entry,
      stats: await documentNoteStats(doc)
    })));
  const sourceCount = rows.length;
  const libraryTitle = library?.title || 'Annotator library';
  const folders = library?.folders || [];
  const folderPathById = libraryFolderPathMap(folders);
  const displayRows = rows.map((row) => ({
    ...row,
    folderPath: row.entry?.folderId ? folderPathById.get(row.entry.folderId) || '' : ''
  }));
  const listRows = displayRows.slice().sort(compareRowsByRecentOpen);
  if (selectedTreeEntryId && !displayRows.some((row) => row.entry?.id === selectedTreeEntryId)) selectedTreeEntryId = '';
  const activeViewMode = library ? libraryViewMode : 'list';
  const libraryStats = summarizeLibraryStats(rows, library);
  return {
    documents,
    library,
    profile,
    handleStatus,
    empty: false,
    orderedItems,
    rows,
    displayRows,
    listRows,
    folders,
    sourceCount,
    libraryTitle,
    activeViewMode,
    libraryStats
  };
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
          ${libraryActivityLogSectionMarkup()}
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
              <dd>${escapeHtml(formatDateTime(libraryStats.lastEditAt))}</dd>
            </div>
            <div>
              <dt>Snapshot</dt>
              <dd>${escapeHtml(libraryStats.snapshot)}</dd>
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
      ${libraryActivityLogSectionMarkup()}
    </div>
  `;
}

function libraryViewMarkup(model) {
  const viewMode = model.activeViewMode || (model.library ? libraryViewMode : 'list');
  return `
    ${!model.rows.length ? '<p class="small">This local library has no bundles yet. Import a source or bundle, then save again to update the same library folder.</p>' : ''}
    ${viewMode === 'tree'
      ? libraryTreeMarkup(model.displayRows, model.folders)
      : libraryListMarkup(model.listRows)}
  `;
}

async function refreshLibraryViewFromStorage(options = {}) {
  const model = await buildLibraryRenderModel();
  libraryRenderModel = model;
  if (!documentsEl.querySelector('[data-library-view-region]') || model.empty) {
    documentsEl.innerHTML = libraryDashboardMarkup(model);
    return model;
  }
  syncLibraryShellFromModel(model);
  renderLibraryViewRegion(model, options);
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

function libraryListMarkup(rows) {
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
        <span class="library-entry-stats">${escapeHtml(stats.summary)} · Last edit ${escapeHtml(formatDateTime(stats.lastEditAt))} · Opened ${escapeHtml(formatDateTime(entry?.lastOpenedAt))}</span>
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

function libraryTreeMarkup(rows, folders) {
  const childrenByParent = libraryFoldersByParent(folders);
  const entriesByFolder = libraryRowsByFolder(rows);
  const body = libraryTreeChildrenMarkup('', 0, childrenByParent, entriesByFolder, folders);
  return `
    <div class="library-tree library-finder" role="tree" aria-label="Library folder tree">
      <div class="library-finder-root-shell" data-library-node-kind="root" data-library-node-id="" data-library-node-key="root">
        <div class="library-finder-row library-finder-root" role="treeitem" data-library-drop-folder="" style="--library-tree-depth: 0">
          <span class="library-finder-indent" aria-hidden="true"></span>
          <span class="library-folder-disclosure-spacer" aria-hidden="true"></span>
          <span class="library-finder-icon library-finder-icon-root" aria-hidden="true"></span>
          <span class="library-finder-name">Library root</span>
          <span class="library-finder-meta">${rows.length} bundle${rows.length === 1 ? '' : 's'}</span>
        </div>
        <div class="library-finder-children" data-library-children-for="">
          ${body || '<p class="small library-tree-empty">No folders or bundles yet.</p>'}
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
  return `${folderMarkup}${entryMarkup}`;
}

function libraryTreeFolderMarkup(folder, depth, childrenByParent, entriesByFolder, folders) {
  const childMarkup = libraryTreeChildrenMarkup(folder.id, depth + 1, childrenByParent, entriesByFolder, folders);
  const title = folder.title || folder.id;
  const collapsed = libraryCollapsedFolderIds.has(folder.id);
  return `
    <div class="library-finder-folder ${collapsed ? 'is-collapsed' : ''}" data-library-node-kind="folder" data-library-node-id="${escapeAttr(folder.id)}" data-library-node-key="folder:${escapeAttr(folder.id)}">
      <div
        class="library-finder-row library-finder-folder-row"
        role="treeitem"
        aria-expanded="${!collapsed}"
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
        <input class="library-finder-name-input" type="text" value="${escapeAttr(title)}" data-original-title="${escapeAttr(title)}" data-library-folder-title="${escapeAttr(folder.id)}" aria-label="Folder name">
        <button class="library-folder-delete" type="button" data-delete-library-folder="${escapeAttr(folder.id)}" data-folder-label="${escapeAttr(title)}" title="Delete folder">Delete</button>
      </div>
      <div class="library-finder-children" data-library-children-for="${escapeAttr(folder.id)}" ${collapsed ? 'hidden' : ''}>
        ${childMarkup || ''}
      </div>
    </div>
  `;
}

function libraryTreeBundleMarkup({ doc, entry, stats, folderPath }, depth) {
  if (!entry) return '';
  const entryTitle = entry.title || doc.title || doc.id;
  const sourceTitle = doc.sourcePath || (doc.sourceType === 'pdf' ? 'source.pdf' : 'source.html');
  const selected = selectedTreeEntryId === entry.id;
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
    >
      <button
        class="library-finder-row library-finder-bundle ${selected ? 'is-selected' : ''}"
        type="button"
        draggable="true"
        data-library-drag-kind="bundle"
        data-library-drag-id="${escapeAttr(entry.id)}"
        data-select-tree-bundle="${escapeAttr(entry.id)}"
        role="treeitem"
        aria-selected="${selected}"
      >
        <span class="library-finder-indent" aria-hidden="true"></span>
        <span class="library-folder-disclosure-spacer" aria-hidden="true"></span>
        <span class="library-finder-icon library-finder-icon-bundle" aria-hidden="true"></span>
        <span class="library-tree-bundle-title">${escapeHtml(entryTitle)}</span>
        <span class="library-tree-bundle-meta">${escapeHtml(folderPath || 'Library root')} · ${escapeHtml(stats.summary)}</span>
      </button>
      ${selected ? libraryBundlePopoverMarkup({ doc, entry, entryTitle, sourceTitle }) : ''}
    </div>
  `;
}

function libraryBundlePopoverMarkup({ doc, entry, entryTitle, sourceTitle }) {
  return `
    <div class="library-bundle-popover" role="dialog" aria-label="Bundle actions">
      <label class="library-popover-field">
        <span class="library-field-label">Bundle</span>
        <input type="text" value="${escapeAttr(entryTitle)}" data-original-title="${escapeAttr(entryTitle)}" data-library-bundle-title="${escapeAttr(entry.id)}" aria-label="Bundle name">
      </label>
      <span>${escapeHtml(sourceTitle)}</span>
      <div class="library-popover-actions">
        <a class="home-doc-open" href="${escapeAttr(urlWithStorage('reader.html', { doc: doc.id }, storageMode))}">Open -&gt;</a>
        <button class="library-entry-replace" type="button" data-replace-source="${escapeAttr(doc.id)}" data-source-label="${escapeAttr(sourceTitle)}">Replace</button>
        <button class="library-entry-delete" type="button" data-delete-library-bundle="${escapeAttr(entry.id)}" data-entry-label="${escapeAttr(entryTitle)}">Delete</button>
      </div>
    </div>
  `;
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
  selectedTreeEntryId = '';
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
    return;
  }
  loadDocuments({ showLoading: false }).catch(showError);
}

function selectLibraryTreeBundle(entryId) {
  const nextEntryId = selectedTreeEntryId === entryId ? '' : entryId;
  clearLibraryBundleSelection();
  selectedTreeEntryId = nextEntryId;
  if (!selectedTreeEntryId) return;
  const shell = findLibraryNode('bundle', selectedTreeEntryId);
  const button = shell?.querySelector('[data-select-tree-bundle]');
  if (!shell || !button) {
    selectedTreeEntryId = '';
    return;
  }
  shell.classList.add('is-selected');
  button.classList.add('is-selected');
  button.setAttribute('aria-selected', 'true');
  shell.insertAdjacentHTML('beforeend', libraryBundlePopoverMarkup(libraryBundleDataFromShell(shell)));
}

function clearLibraryBundleSelection() {
  documentsEl?.querySelectorAll?.('.library-tree-bundle-shell.is-selected').forEach((shell) => {
    shell.classList.remove('is-selected');
    shell.querySelector('.library-bundle-popover')?.remove();
  });
  documentsEl?.querySelectorAll?.('[data-select-tree-bundle].is-selected').forEach((button) => {
    button.classList.remove('is-selected');
    button.setAttribute('aria-selected', 'false');
  });
}

function libraryBundleDataFromShell(shell) {
  const entryId = shell?.dataset?.libraryNodeId || '';
  const docId = shell?.dataset?.libraryDocId || '';
  const entryTitle = shell?.dataset?.libraryEntryTitle || 'Untitled bundle';
  const sourceTitle = shell?.dataset?.librarySourceTitle || 'source.html';
  return {
    doc: { id: docId },
    entry: { id: entryId },
    entryTitle,
    sourceTitle
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
  row?.setAttribute('aria-expanded', String(!collapsed));
  toggle?.setAttribute('aria-expanded', String(!collapsed));
  if (toggle) {
    const title = row?.querySelector('[data-library-folder-title]')?.value || 'folder';
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
  selectedTreeEntryId = '';
  clearLibraryBundleSelection();
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
    throw new Error('Library name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameCurrentLibrary?.(nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    appendLibraryLog(`Renamed library to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
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
    throw new Error('Bundle name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    const renameBundle = storage.renameLibraryBundle || storage.renameLibraryEntry;
    await renameBundle?.call(storage, entryId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    syncLibraryBundleTitleInDom(entryId, nextTitle);
    syncLibraryBundleTitleInModel(entryId, nextTitle);
    appendLibraryLog(`Renamed bundle to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
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
  if (!title) throw new Error('Folder name cannot be empty.');
  const parentId = select?.value || null;
  await storage.createLibraryFolder?.(title, parentId);
  if (input) input.value = '';
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
    throw new Error('Folder name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameLibraryFolder?.(folderId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    await refreshLibraryViewFromStorage({ animateTree: libraryViewMode === 'tree' });
    appendLibraryLog(`Renamed folder to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
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
    throw new Error('Source name cannot be empty.');
  }
  if (nextTitle === previousTitle) return;
  input.disabled = true;
  try {
    await storage.renameDocumentSource?.(docId, nextTitle);
    input.dataset.originalTitle = nextTitle;
    input.value = nextTitle;
    appendLibraryLog(`Renamed source to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
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
  if (!updateAppBtn) return;
  updateAppBtn.disabled = true;
  appendLibraryLog(`Checking homepage for the latest Marginalia app. Current ${APP_VERSION_LABEL}.`);
  try {
    const networkVersion = availableNetworkVersion || await checkForAvailableAppUpdate();
    if (networkVersion?.isCurrent) {
      availableNetworkVersion = null;
      syncAppUpdateUi();
      appendLibraryLog(successMessage('Update', `Marginalia is already using ${networkVersion.label || APP_VERSION_LABEL}.`));
      return;
    }
    const result = await updateAppFromNetwork();
    if (result.updated) {
      appendLibraryLog(successMessage('Update', `Updated Marginalia${networkVersion?.label ? ` to ${networkVersion.label}` : ''}. Reloading the app...`));
      window.setTimeout(() => location.reload(), 120);
      return;
    }
    if (networkVersion && networkVersion.version !== APP_VERSION) {
      appendLibraryLog(successMessage('Update', `Homepage has ${networkVersion.label}. Reloading this tab to refresh Marginalia.`));
      window.setTimeout(() => location.reload(), 120);
      return;
    }
    const latest = networkVersion?.label || 'the latest app version available from the homepage';
    appendLibraryLog(successMessage('Update', `Marginalia is already using ${latest}.`));
  } finally {
    updateAppBtn.disabled = false;
    syncAppUpdateUi();
  }
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
    <div>
      <dt>Package access</dt>
      <dd>
        ${escapeHtml(handleStatus.label)}
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
  const bytes = await bundleArchiveBytesFromFolderFiles(await readFilesFromDirectoryHandle(handle));
  const file = new File([bytes], `${handle.name || 'bundle'}.annotator.zip`, { type: 'application/zip' });
  await importBundleFile(file, handle);
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
  documentsEl.innerHTML = '<p class="small">Importing library folder...</p>';
  const bytes = await libraryArchiveBytesFromFolderFiles(await readFilesFromDirectoryHandle(handle));
  const file = new File([bytes], `${handle.name || 'library'}.annotator-library.zip`, { type: 'application/zip' });
  await importLibraryFile(file, handle);
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
  documentsEl.innerHTML = '<p class="small">Importing library...</p>';
  try {
    const result = await storage.importDocumentLibrary(file, { replaceCurrent: true });
    if (fileHandle) await rememberCurrentLibraryHandle(fileHandle);
    await loadDocuments();
    appendLibraryLog(`Imported "${result.library?.title || file.name}".`);
  } finally {
    if (libraryFileInput) libraryFileInput.value = '';
  }
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

async function saveCurrentLibrary() {
  let library = await storage.getCurrentLibraryContext?.();
  const createdLibraryForSave = !library;
  if (!library) library = await storage.createCurrentLibraryFromDocuments?.();
  documentsEl.innerHTML = '<p class="small">Saving library...</p>';
  const bytes = await storage.exportCurrentLibraryPackage();
  const filename = libraryFilenameForTitle(library.title || 'annotator-library');
  const saved = await saveLibraryBytes(bytes, filename, library);
  await loadDocuments();
  if (saved?.cancelled) {
    if (createdLibraryForSave) await storage.clearCurrentLibraryContext?.();
    await loadDocuments();
    return;
  }
  appendLibraryLog(librarySaveMessage(saved, filename, library));
}

async function saveLibraryBytes(bytes, filename, library) {
  if (storageMode === 'indexeddb' && (canUseDirectoryAccess() || canUseFileSystemAccess())) {
    let saved = null;
    try {
      saved = await saveLibraryBytesWithLocalAccess(bytes, filename, library);
    } catch (error) {
      appendLibraryLog(`Library save picker failed (${error.message}). Downloading a copy...`, true);
    }
    if (saved?.cancelled) return saved;
    if (saved?.handle) await rememberCurrentLibraryHandle(saved.handle);
    if (saved?.name) return saved;
  }
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

async function saveLibraryBytesWithLocalAccess(bytes, filename, library = null) {
  const existingHandle = library?.fileHandle || null;
  const folderName = libraryFolderNameForTitle(library?.title || filename.replace(/\.annotator-library\.zip$/i, ''));
  if (existingHandle) {
    try {
      if (existingHandle.kind === 'directory') {
        await writeArchiveBytesToPackageFolder(existingHandle, bytes, 'library');
        return { name: existingHandle.name || folderName, handle: existingHandle, folder: true };
      }
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
      await writeArchiveBytesToPackageFolder(handle, bytes, 'library');
      return { name: handle.name || folderName, handle, folder: true };
    } catch (error) {
      if (error.name === 'AbortError') return { cancelled: true };
      appendLibraryLog(`Folder save failed (${error.message}). Choose a zip save location...`, true);
    }
  }
  return saveBytesWithFileSystemAccess(bytes, filename, null);
}

async function writeArchiveBytesToPackageFolder(handle, bytes, packageKind) {
  await assertWritablePackageDirectory(handle, packageKind);
  const files = packageKind === 'library'
    ? await libraryFolderFilesFromArchiveBytes(bytes)
    : await bundleFolderFilesFromArchiveBytes(bytes);
  await writeFilesToDirectoryHandle(handle, files);
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
  if (activeDialog) closeAppDialog(activeDialog.cancelValue);
  const previousFocus = document.activeElement;
  return new Promise((resolve) => {
    activeDialog = { resolve, cancelValue, previousFocus };
    appDialogTitle.textContent = title || '';
    appDialogBody.textContent = body || '';
    appDialogActions.innerHTML = '';
    for (const action of actions || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      if (action.className) button.className = action.className;
      button.addEventListener('click', () => closeAppDialog(action.value));
      appDialogActions.append(button);
    }
    appDialog.hidden = false;
    appDialog.addEventListener('pointerdown', handleAppDialogBackdropPointerDown);
    requestAnimationFrame(() => appDialogActions.querySelector('button')?.focus());
  });
}

function closeAppDialog(value) {
  if (!activeDialog) return;
  const dialog = activeDialog;
  activeDialog = null;
  appDialog.hidden = true;
  appDialog.removeEventListener('pointerdown', handleAppDialogBackdropPointerDown);
  appDialogActions.innerHTML = '';
  dialog.resolve(value);
  dialog.previousFocus?.focus?.();
}

function handleAppDialogBackdropPointerDown(event) {
  if (event.target === appDialog && activeDialog) closeAppDialog(activeDialog.cancelValue);
}

function showError(error) {
  appendLibraryLog(error?.message || String(error), true);
}

function appendLibraryLog(message, isError = false) {
  libraryLogEntries.unshift({
    id: `${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    message: String(message || '').trim() || 'Unknown event.',
    isError,
    createdAt: new Date().toISOString()
  });
  if (libraryLogEntries.length > MAX_LIBRARY_LOG_ENTRIES) libraryLogEntries.length = MAX_LIBRARY_LOG_ENTRIES;
  renderLibraryActivityLog();
}

function libraryActivityLogSectionMarkup() {
  return `
    <section class="library-activity-window" aria-label="Latest activity">
      <div class="library-activity-window-head">
        <h2>Latest</h2>
        <p class="small">Newest on top.</p>
      </div>
      <div id="libraryActivityLog" class="library-activity-log">${libraryActivityLogMarkup()}</div>
    </section>
  `;
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
  const handleType = library.fileHandle?.kind === 'directory' ? 'folder'
    : library.fileHandle?.kind === 'file' ? 'zip file'
      : 'package handle';
  const name = library.fileHandleName || library.fileHandle?.name || 'remembered package';
  const permission = await queryFileHandlePermissionState(library.fileHandle, 'readwrite');
  if (permission === 'granted') return { label: `Remembered ${handleType}: ${name}`, canForget: true };
  if (permission === 'prompt') return { label: `Remembered ${handleType}: ${name}; permission will be requested on save`, canForget: true };
  if (permission === 'denied') return { label: `Remembered ${handleType}: ${name}; permission denied`, canForget: true };
  return { label: `Remembered ${handleType}: ${name}`, canForget: true };
}

async function documentNoteStats(doc) {
  const annotations = doc?.id ? await storage.getAnnotations(doc.id) : [];
  let notes = 0;
  let highlights = 0;
  let ink = 0;
  let lastEditAt = doc?.updatedAt || doc?.createdAt || '';
  for (const annotation of annotations) {
    if (annotation.highlight?.enabled) highlights += 1;
    if (noteHasContent(annotation.note)) notes += 1;
    if (noteHasInk(annotation.note)) ink += 1;
    lastEditAt = maxIsoDate(lastEditAt, annotation.updatedAt || annotation.createdAt || '');
  }
  return documentNoteStatsFromRecord(doc, { notes, highlights, ink, lastEditAt });
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
  return {
    lastEditAt: totals.lastEditAt,
    snapshot: `${rows.length} bundle${rows.length === 1 ? '' : 's'}, ${totals.notes} note${totals.notes === 1 ? '' : 's'}, ${totals.highlights} highlight${totals.highlights === 1 ? '' : 's'}`
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
