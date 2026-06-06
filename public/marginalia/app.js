import { currentStorageMode, registerServiceWorker, updateAppFromNetwork, urlWithStorage } from './runtime.js';
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
let activeDialog = null;
let pendingReplaceSourceDocId = null;

init().catch((error) => {
  documentsEl.innerHTML = `<p class="small">${escapeHtml(error.message)}</p>`;
});

async function init() {
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
    if (event.target?.matches?.('[data-source-title]')) {
      renameSourceFromInput(event.target).catch(showError);
    }
  });
  documentsEl?.addEventListener('click', (event) => {
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
  documentsEl?.addEventListener('keydown', (event) => {
    if (!event.target?.matches?.('[data-library-title], [data-library-bundle-title], [data-source-title]')) return;
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
  await registerServiceWorker();
  await loadDocuments();
}

async function loadDocuments() {
  documentsEl.innerHTML = '<p class="small">Loading documents...</p>';
  const documents = await storage.listDocuments();
  const library = await storage.getCurrentLibraryContext?.();
  const profile = await storage.ensureLocalProfile?.();
  const handleStatus = await currentLibraryHandleStatus(library);
  if (saveLibraryBtn) saveLibraryBtn.disabled = false;
  if (!documents.length && !library) {
    documentsEl.innerHTML = storageMode === 'indexeddb'
      ? `
        <div class="library-dashboard">
          <aside class="library-history" aria-label="Local profile">
            <h2>Local profile</h2>
            ${localProfileStatusMarkup(profile, handleStatus)}
          </aside>
          <section class="library-main">
            <p class="small">No browser-local sources yet. Save library can initialize an empty local library folder, or import a source, bundle, or library package to begin.</p>
          </section>
        </div>
      `
      : '<p class="small">No documents in the local library yet.</p>';
    return;
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
  const rows = await Promise.all(orderedItems.map(async ({ doc, entry }) => ({
    doc,
    entry,
    stats: await documentNoteStats(doc)
  })));
  const sourceCount = rows.length;
  const libraryTitle = library?.title || 'Annotator library';
  const libraryStats = summarizeLibraryStats(rows, library);
  documentsEl.innerHTML = `
    <div class="library-dashboard">
      <aside class="library-history" aria-label="Library activity">
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
          <span class="small">${sourceCount} source${sourceCount === 1 ? '' : 's'}</span>
        </label>
        ${!rows.length ? '<p class="small">This local library has no bundles yet. Import a source or bundle, then save again to update the same library folder.</p>' : ''}
        ${rows.map(({ doc, entry, stats }) => {
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
            <span class="library-entry-stats">${escapeHtml(stats.summary)} · Last edit ${escapeHtml(formatDateTime(stats.lastEditAt))}</span>
          </span>
          <span class="home-doc-actions">
            <button class="library-entry-replace" type="button" data-replace-source="${escapeAttr(doc.id)}">Replace</button>
            ${entry ? `<button class="library-entry-delete" type="button" data-delete-library-bundle="${escapeAttr(entry.id)}">Delete</button>` : ''}
            ${!entry ? `<button class="library-entry-delete" type="button" data-delete-document="${escapeAttr(doc.id)}">Delete</button>` : ''}
            <a class="home-doc-open" href="${escapeAttr(urlWithStorage('reader.html', { doc: doc.id }, storageMode))}">Open -&gt;</a>
          </span>
        </article>
      `;
        }).join('')}
      </section>
    </div>
  `;
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
    appendLibraryLog(`Renamed bundle to "${nextTitle}".`);
  } catch (error) {
    input.value = previousTitle;
    throw error;
  } finally {
    input.disabled = false;
  }
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
  const label = button.closest('.home-doc')?.querySelector('[data-library-bundle-title]')?.value || 'this bundle';
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
  await loadDocuments();
  appendLibraryLog(`Deleted "${label}". Save the library to update the local package folder.`);
}

async function startSourceReplacementFromButton(button) {
  const docId = button?.dataset?.replaceSource;
  if (!docId) return;
  const label = button.closest('.home-doc')?.querySelector('[data-source-title]')?.value || 'this source';
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
  const label = button.closest('.home-doc')?.querySelector('[data-source-title]')?.value || 'this source';
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
  await loadDocuments();
  appendLibraryLog('Forgot the remembered local package handle. Save will ask for a location next time.');
}

async function updateInstalledApp() {
  if (!updateAppBtn) return;
  updateAppBtn.disabled = true;
  appendLibraryLog('Checking homepage for the latest Marginalia app...');
  try {
    const result = await updateAppFromNetwork();
    if (result.updated) {
      appendLibraryLog('Updated Marginalia. Reloading the app...');
      window.setTimeout(() => location.reload(), 120);
      return;
    }
    appendLibraryLog('Marginalia is already using the latest app version available from the homepage.');
  } finally {
    updateAppBtn.disabled = false;
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
  appendLibraryLog(error.message, true);
}

function appendLibraryLog(message, isError = false) {
  const className = isError ? 'small library-log is-error' : 'small library-log';
  documentsEl.insertAdjacentHTML('beforeend', `<p class="${className}">${escapeHtml(message)}</p>`);
}

function librarySaveMessage(saved, filename, library) {
  if (saved?.downloaded) return `Downloaded ${filename}.`;
  const name = saved?.name || filename;
  const reminder = folderNameReminder(saved, library);
  return reminder ? `Saved to ${name}. ${reminder}` : `Saved to ${name}.`;
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
