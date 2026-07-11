import {
  createAnnotatorBundleArchive,
  readAnnotatorBundleArchive,
  hydratedAnnotationsFromBundle
} from './bundle.js';
import {
  createAnnotatorLibraryArchive,
  isAnnotatorLibraryFilename,
  readAnnotatorLibraryArchive
} from './library-package.js';
import { encodeInkForStorage } from './ink-codec.js';

const DB_NAME = 'annotator-reader';
const DB_VERSION = 5;
const DOCUMENT_NOTE_STATS_VERSION = 1;
const NOTE_SCHEMA_VERSION = 2;
const NOTE_IMAGE_KIND = 'note-image';
const NOTE_IMAGE_MAX_BYTES = 20 * 1024 * 1024;
const NOTE_IMAGE_MAX_PIXELS = 40 * 1000 * 1000;
const APP_META_LAST_OPEN_DOCUMENT = 'lastOpenDocument';
const APP_META_CURRENT_LIBRARY = 'currentLibrary';
const APP_META_LOCAL_PROFILE = 'localProfile';
const APP_META_READER_POSITION_PREFIX = 'readerPosition:';
const APP_META_QUICK_MARKS_PREFIX = 'quickMarks:';
const IMPORT_PREFIX_QUERY_LIMIT = 32;
const ANCHORABLE_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'li', 'figure', 'figcaption', 'td', 'th', 'section', 'article']);
const TEXT_ANCHOR_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'li', 'figcaption', 'td', 'th']);
let dbPromise = null;

export function createStorageAdapter(options = {}) {
  return new IndexedDbStorageAdapter(options);
}

export class IndexedDbStorageAdapter {
  mode = 'indexeddb';
  blobUrls = new Map();
  noteImageUrls = new Map();
  noteImageUrlLoads = new Map();
  noteImageUrlGeneration = 0;
  noteImageUrlInvalidations = new Map();

  async listDocuments() {
    const db = await openDb();
    const documents = await readAll(db, 'documentMetadata');
    if (documents.length) return documents.map(normalizeStoredDocument);
    return this.rebuildDocumentMetadata();
  }

  async getDocument(docId) {
    const db = await openDb();
    return normalizeStoredDocument(await readOne(db, 'documents', docId));
  }

  async getDocumentHtml(docId) {
    const db = await openDb();
    const doc = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!doc) throw new Error(`Document not found: ${docId}`);
    if (doc.sourceType === 'pdf') return '';
    return doc.sourceHtml || '';
  }

  async getQuickMarks(docId) {
    if (!docId) return normalizeQuickMarkRecord(null, docId);
    const db = await openDb();
    const stored = await readOne(db, 'appMeta', quickMarksKey(docId));
    if (stored?.quickMarks) return normalizeQuickMarkRecord(stored.quickMarks, docId);
    const legacy = readLegacyQuickMarks(docId);
    if (!legacy) return normalizeQuickMarkRecord(null, docId);
    await this.setQuickMarks(docId, legacy);
    return normalizeQuickMarkRecord(legacy, docId);
  }

  async setQuickMarks(docId, value) {
    if (!docId) return false;
    const db = await openDb();
    const record = normalizeQuickMarkRecord(value, docId);
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.put({
        key: quickMarksKey(docId),
        quickMarks: {
          ...record,
          docId,
          updatedAt: new Date().toISOString()
        }
      });
    });
    return true;
  }

  async getDocumentHtmlUrl(docId, documentRecord = null) {
    const db = await openDb();
    const doc = await resolveDocumentRenderRecord(
      docId,
      documentRecord,
      (id) => readOne(db, 'documents', id)
    );
    if (!doc) throw new Error(`Document not found: ${docId}`);
    for (const urls of this.blobUrls.values()) revokeBlobUrls(urls);
    this.blobUrls.clear();
    this.revokeAllNoteImageUrls();
    const urls = [];
    if (doc.sourceType === 'pdf') {
      const pdfUrl = URL.createObjectURL(new Blob([doc.sourceBytes || new Uint8Array()], { type: 'application/pdf' }));
      urls.push(pdfUrl);
      const viewerUrl = new URL('pdf-viewer.html', location.href);
      viewerUrl.searchParams.set('file', pdfUrl);
      viewerUrl.searchParams.set('embedded', 'reader');
      this.blobUrls.set(docId, urls);
      return viewerUrl.href;
    }
    const html = doc.sourceHtml || '';
    if (looksLikePdfText(html)) {
      const url = URL.createObjectURL(new Blob([corruptPdfImportHtml(doc)], { type: 'text/html' }));
      urls.push(url);
      this.blobUrls.set(docId, urls);
      return url;
    }
    const assets = (await readIndexAll(db, 'documentAssets', 'docId', docId))
      .filter((asset) => asset?.kind !== NOTE_IMAGE_KIND);
    const renderedHtml = htmlWithResolvedAssets(html, doc.sourcePath, assets, urls);
    const url = URL.createObjectURL(new Blob([renderedHtml], { type: 'text/html' }));
    urls.push(url);
    this.blobUrls.set(docId, urls);
    return url;
  }

  async getAnnotations(docId) {
    const db = await openDb();
    const [annotations, bodies] = await Promise.all([
      readIndexAll(db, 'annotations', 'docId', docId),
      readIndexAll(db, 'annotationBodies', 'docId', docId)
    ]);
    const bodiesById = new Map(bodies.map((body) => [body.id, body]));
    return annotations
      .map((annotation) => ({
        ...annotation,
        note: normalizeNoteForStorage(bodiesById.get(annotation.id)?.note)
      }))
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  }

  async getAnnotation(docId, annotationId) {
    const db = await openDb();
    const [annotation, body] = await Promise.all([
      readOne(db, 'annotations', annotationId),
      readOne(db, 'annotationBodies', annotationId)
    ]);
    if (!annotation || String(annotation.docId || '') !== String(docId || '')) return null;
    const note = body && String(body.docId || '') === String(docId || '') ? body.note : null;
    return normalizeHydratedAnnotation({
      ...annotation,
      note: normalizeNoteForStorage(note)
    });
  }

  async getDocumentNoteStats(docIds = null) {
    const db = await openDb();
    const requestedDocIds = Array.isArray(docIds)
      ? [...new Set(docIds.map(String).filter(Boolean))]
      : null;
    return readAndBackfillDocumentNoteStats(db, requestedDocIds);
  }

  async createAnnotation(docId, payload) {
    const now = new Date().toISOString();
    const annotation = normalizeHydratedAnnotation({
      ...payload,
      id: payload.id || `ann_${crypto.randomUUID()}`,
      docId,
      createdAt: payload.createdAt || now,
      updatedAt: now
    });
    await this.writeHydratedAnnotation(annotation);
    return annotation;
  }

  async updateAnnotation(docId, annotationId, payload) {
    const existing = await this.getAnnotation(docId, annotationId);
    if (!existing) throw new Error(`Annotation not found: ${annotationId}`);
    const annotation = normalizeHydratedAnnotation({
      ...existing,
      ...payload,
      id: annotationId,
      docId,
      updatedAt: new Date().toISOString()
    });
    await this.writeHydratedAnnotation(annotation);
    return annotation;
  }

  async insertNoteImage(docId, annotationId, file, options = {}) {
    const validated = await validateNoteImageFile(file);
    const assetPath = noteImageAssetPath(validated.extension);
    const block = normalizeNoteBlockForStorage({
      id: options.blockId || newNoteBlockId(),
      type: 'image',
      assetPath,
      mimeType: validated.mimeType,
      intrinsicWidth: validated.intrinsicWidth,
      intrinsicHeight: validated.intrinsicHeight,
      alt: options.alt == null ? validated.alt : String(options.alt),
      originalName: validated.originalName
    });
    const db = await openDb();
    const annotation = await insertNoteImageTransaction(db, {
      docId: String(docId || ''),
      annotationId: String(annotationId || ''),
      block,
      beforeBlockId: options.beforeBlockId,
      afterBlockId: options.afterBlockId,
      asset: {
        id: `${docId}:${assetPath}`,
        docId: String(docId || ''),
        path: assetPath,
        kind: NOTE_IMAGE_KIND,
        mimeType: validated.mimeType,
        data: validated.data,
        byteLength: validated.byteLength,
        updatedAt: new Date().toISOString()
      }
    });
    return { annotation, block };
  }

  async getNoteImageUrl(docId, assetPath) {
    const normalizedDocId = String(docId || '');
    const normalizedPath = normalizeNoteImagePath(assetPath);
    if (!normalizedDocId || !normalizedPath) throw new Error('Invalid note image reference.');
    const cacheKey = noteImageCacheKey(normalizedDocId, normalizedPath);
    const cached = this.noteImageUrls.get(cacheKey);
    if (cached) {
      return cached.url;
    }
    const existingLoad = this.noteImageUrlLoads.get(cacheKey);
    if (existingLoad) return existingLoad;
    const generation = this.noteImageUrlGeneration;
    const keyGeneration = this.noteImageUrlInvalidations.get(cacheKey) || 0;
    const load = (async () => {
      const db = await openDb();
      const asset = await readOne(db, 'documentAssets', `${normalizedDocId}:${normalizedPath}`);
      if (generation !== this.noteImageUrlGeneration
        || keyGeneration !== (this.noteImageUrlInvalidations.get(cacheKey) || 0)) {
        throw new Error('The note picture request is stale.');
      }
      if (!asset
        || String(asset.docId || '') !== normalizedDocId
        || asset.path !== normalizedPath
        || asset.kind !== NOTE_IMAGE_KIND) {
        throw new Error('This note picture is missing from browser storage.');
      }
      const mimeType = noteImageMimeTypeForPath(normalizedPath);
      if (!mimeType || asset.mimeType !== mimeType) throw new Error('This note picture has invalid stored metadata.');
      const url = URL.createObjectURL(new Blob([asset.data], { type: mimeType }));
      if (generation !== this.noteImageUrlGeneration
        || keyGeneration !== (this.noteImageUrlInvalidations.get(cacheKey) || 0)) {
        revokeBlobUrls(url);
        throw new Error('The note picture request is stale.');
      }
      this.noteImageUrls.set(cacheKey, { url, docId: normalizedDocId, assetPath: normalizedPath });
      return url;
    })();
    this.noteImageUrlLoads.set(cacheKey, load);
    try {
      return await load;
    } finally {
      if (this.noteImageUrlLoads.get(cacheKey) === load) this.noteImageUrlLoads.delete(cacheKey);
    }
  }

  revokeNoteImageUrl(docId, assetPath = null) {
    const normalizedDocId = String(docId || '');
    const normalizedPath = assetPath == null ? '' : normalizeNoteImagePath(assetPath);
    if (normalizedPath) {
      const cacheKey = noteImageCacheKey(normalizedDocId, normalizedPath);
      this.noteImageUrlInvalidations.set(cacheKey, (this.noteImageUrlInvalidations.get(cacheKey) || 0) + 1);
    } else {
      this.noteImageUrlGeneration += 1;
    }
    if (assetPath != null && !normalizedPath) return 0;
    let revoked = 0;
    for (const [key, entry] of this.noteImageUrls) {
      if (entry.docId !== normalizedDocId || (normalizedPath && entry.assetPath !== normalizedPath)) continue;
      revokeBlobUrls(entry.url);
      this.noteImageUrls.delete(key);
      revoked += 1;
    }
    return revoked;
  }

  revokeAllNoteImageUrls() {
    this.noteImageUrlGeneration += 1;
    this.noteImageUrlInvalidations.clear();
    const count = this.noteImageUrls.size;
    for (const entry of this.noteImageUrls.values()) revokeBlobUrls(entry.url);
    this.noteImageUrls.clear();
    return count;
  }

  async sweepUnreferencedNoteImages(docId) {
    const normalizedDocId = String(docId || '');
    if (!normalizedDocId) return 0;
    const db = await openDb();
    const deletedPaths = await sweepUnreferencedNoteImagesTransaction(db, normalizedDocId);
    for (const path of deletedPaths) this.revokeNoteImageUrl(normalizedDocId, path);
    return deletedPaths.length;
  }

  async deleteAnnotation(docId, annotationId) {
    const db = await openDb();
    return mutateHydratedAnnotation(db, {
      docId: String(docId || ''),
      annotationId: String(annotationId || ''),
      nextAnnotation: null
    });
  }

  async upsertAnnotation(docId, annotation, exists) {
    return exists
      ? this.updateAnnotation(docId, annotation.id, annotation)
      : this.createAnnotation(docId, annotation);
  }

  async getLastOpenDocumentId() {
    const db = await openDb();
    const record = await readOne(db, 'appMeta', APP_META_LAST_OPEN_DOCUMENT);
    return record?.docId || null;
  }

  async rememberDocumentOpen(docId) {
    if (!docId) return false;
    const now = new Date().toISOString();
    const db = await openDb();
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.put({
        key: APP_META_LAST_OPEN_DOCUMENT,
        docId,
        updatedAt: now
      });
    });
    const library = await this.getCurrentLibraryContext();
    if (library?.entries?.some((entry) => entry.docId === docId)) {
      const activeEntryId = library.entries.find((entry) => entry.docId === docId)?.id || library.activeEntryId;
      await this.writeCurrentLibraryContext({
        ...library,
        activeEntryId,
        entries: library.entries.map((entry) => entry.docId === docId
          ? { ...entry, lastOpenedAt: now }
          : entry)
      });
    }
    return true;
  }

  async getReaderPosition(docId) {
    if (!docId) return null;
    const db = await openDb();
    const record = await readOne(db, 'appMeta', readerPositionKey(docId));
    return normalizeReaderPosition(record?.position);
  }

  async setReaderPosition(docId, position) {
    if (!docId) return false;
    const normalized = normalizeReaderPosition({ ...(position || {}), docId });
    if (!normalized) return this.clearReaderPosition(docId);
    const now = new Date().toISOString();
    const db = await openDb();
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.put({
        key: readerPositionKey(docId),
        docId,
        position: {
          ...normalized,
          updatedAt: now
        },
        updatedAt: now
      });
    });
    return true;
  }

  async clearReaderPosition(docId) {
    if (!docId) return false;
    const db = await openDb();
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.delete(readerPositionKey(docId));
    });
    return true;
  }

  async getDocumentFileHandle(docId) {
    if (!docId) return null;
    const db = await openDb();
    const record = await readOne(db, 'documentFileHandles', docId);
    return record?.handle || null;
  }

  async setDocumentFileHandle(docId, handle) {
    if (!docId || !handle) return false;
    const db = await openDb();
    await writeTransaction(db, ['documentFileHandles'], (stores) => {
      stores.documentFileHandles.put({
        docId,
        handle,
        name: handle.name || '',
        updatedAt: new Date().toISOString()
      });
    });
    return true;
  }

  async clearDocumentFileHandle(docId) {
    if (!docId) return false;
    const db = await openDb();
    await writeTransaction(db, ['documentFileHandles'], (stores) => {
      stores.documentFileHandles.delete(docId);
    });
    return true;
  }

  async getCurrentLibraryContext() {
    const db = await openDb();
    const record = await readOne(db, 'appMeta', APP_META_CURRENT_LIBRARY);
    return normalizeCurrentLibraryContext(record?.library);
  }

  async getLocalProfile() {
    const db = await openDb();
    const record = await readOne(db, 'appMeta', APP_META_LOCAL_PROFILE);
    return record?.profile || null;
  }

  async ensureLocalProfile() {
    const existing = await this.getLocalProfile();
    if (existing) return existing;
    const now = new Date().toISOString();
    const profile = {
      id: 'local',
      name: 'Local profile',
      createdAt: now,
      updatedAt: now,
      preferredSaveMode: 'folder',
      lastLibraryHandleName: ''
    };
    await this.writeLocalProfile(profile);
    return profile;
  }

  async writeLocalProfile(profile) {
    const db = await openDb();
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.put({
        key: APP_META_LOCAL_PROFILE,
        profile: {
          ...profile,
          updatedAt: new Date().toISOString()
        }
      });
    });
    return profile;
  }

  async clearCurrentLibraryContext() {
    const db = await openDb();
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.delete(APP_META_CURRENT_LIBRARY);
    });
    return true;
  }

  async clearBrowserLocalData() {
    const db = await openDb();
    await writeTransaction(db, [
      'documents',
      'documentMetadata',
      'annotations',
      'annotationBodies',
      'documentNoteStats',
      'documentAssets',
      'appMeta',
      'documentFileHandles'
    ], (stores) => {
      for (const store of Object.values(stores)) store.clear();
    });
    for (const urls of this.blobUrls.values()) revokeBlobUrls(urls);
    this.blobUrls.clear();
    clearBrowserStateKeys(localStorage, ['reader-quick-marks:', 'reader-layout:']);
    clearBrowserStateKeys(sessionStorage, ['reader-scroll:']);
    return true;
  }

  async setCurrentLibraryFileHandle(handle) {
    const context = await this.getCurrentLibraryContext();
    if (!context || !handle) return false;
    const fileHandleName = handle.name || context.fileHandleName || '';
    await this.writeCurrentLibraryContext({
      ...context,
      fileHandle: handle,
      fileHandleName
    });
    const profile = await this.ensureLocalProfile();
    await this.writeLocalProfile({
      ...profile,
      lastLibraryHandleName: fileHandleName
    });
    return true;
  }

  async clearCurrentLibraryFileHandle() {
    const context = await this.getCurrentLibraryContext();
    if (!context) return false;
    const { fileHandle, fileHandleName, ...rest } = context;
    await this.writeCurrentLibraryContext(rest);
    const profile = await this.ensureLocalProfile();
    await this.writeLocalProfile({
      ...profile,
      lastLibraryHandleName: ''
    });
    return true;
  }

  async renameCurrentLibrary(title) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) throw new Error('Library name cannot be empty.');
    const nextContext = {
      ...context,
      title: normalizedTitle
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async renameLibraryEntry(entryId, title) {
    return this.renameLibraryBundle(entryId, title);
  }

  async renameLibraryBundle(entryId, title) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) throw new Error('Bundle name cannot be empty.');
    let found = false;
    const entries = (context.entries || []).map((entry) => {
      if (entry.id !== entryId) return entry;
      found = true;
      return {
        ...entry,
        title: normalizedTitle
      };
    });
    if (!found) throw new Error('Bundle not found.');
    const nextContext = {
      ...context,
      entries
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async createLibraryFolder(title, parentId = null) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) throw new Error('Folder name cannot be empty.');
    const folders = context.folders || [];
    const targetParentId = folders.some((folder) => folder.id === parentId) ? parentId : null;
    const nextFolder = {
      id: uniqueLibraryFolderId(normalizedTitle, folders),
      title: normalizedTitle,
      parentId: targetParentId,
      order: folders.filter((folder) => (folder.parentId || null) === targetParentId).length
    };
    const nextContext = {
      ...context,
      folders: [...folders, nextFolder]
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async renameLibraryFolder(folderId, title) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const normalizedTitle = String(title || '').trim();
    if (!normalizedTitle) throw new Error('Folder name cannot be empty.');
    let found = false;
    const folders = (context.folders || []).map((folder) => {
      if (folder.id !== folderId) return folder;
      found = true;
      return { ...folder, title: normalizedTitle };
    });
    if (!found) throw new Error('Folder not found.');
    const nextContext = { ...context, folders };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async moveLibraryFolder(folderId, parentId = null) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const folders = context.folders || [];
    const targetParentId = parentId && folders.some((folder) => folder.id === parentId) ? parentId : null;
    const folder = folders.find((item) => item.id === folderId);
    if (!folder) throw new Error('Folder not found.');
    if (targetParentId === folderId || libraryFolderHasAncestor(folders, targetParentId, folderId)) {
      throw new Error('A folder cannot be moved inside itself.');
    }
    const siblingOrder = folders.filter((item) => item.id !== folderId && (item.parentId || null) === targetParentId).length;
    const nextContext = {
      ...context,
      folders: folders.map((item) => item.id === folderId
        ? { ...item, parentId: targetParentId, order: siblingOrder }
        : item)
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async deleteLibraryFolder(folderId) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const folders = context.folders || [];
    if (!folders.some((folder) => folder.id === folderId)) throw new Error('Folder not found.');
    if (folders.some((folder) => folder.parentId === folderId)) {
      throw new Error('Delete or move child folders before deleting this folder.');
    }
    if ((context.entries || []).some((entry) => entry.folderId === folderId)) {
      throw new Error('Move bundles out of this folder before deleting it.');
    }
    const nextContext = {
      ...context,
      folders: folders.filter((folder) => folder.id !== folderId)
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async moveLibraryBundle(entryId, folderId = null) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const folders = context.folders || [];
    const targetFolderId = folderId && folders.some((folder) => folder.id === folderId) ? folderId : null;
    let found = false;
    const siblingOrder = (context.entries || [])
      .filter((entry) => entry.id !== entryId && (entry.folderId || null) === targetFolderId)
      .length;
    const entries = (context.entries || []).map((entry) => {
      if (entry.id !== entryId) return entry;
      found = true;
      return {
        ...entry,
        folderId: targetFolderId,
        order: siblingOrder
      };
    });
    if (!found) throw new Error('Bundle not found.');
    const nextContext = { ...context, entries };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async renameDocumentSource(docId, sourceName) {
    if (!docId) throw new Error('Document id is required.');
    const db = await openDb();
    const document = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!document) throw new Error(`Document not found: ${docId}`);
    const normalizedSourceName = sourceFilename(sourceName, document.sourceType || 'html');
    const updated = {
      ...document,
      sourcePath: normalizedSourceName,
      sourcePathEdited: true,
      updatedAt: new Date().toISOString()
    };
    await writeTransaction(db, ['documents', 'documentMetadata'], (stores) => {
      putDocumentRecord(stores, updated);
    });
    return updated;
  }

  async replaceDocumentSource(docId, file) {
    if (!docId) throw new Error('Document id is required.');
    if (!file) throw new Error('Choose an updated source file.');
    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const incomingType = replacementSourceType(file, sourceBytes);
    const db = await openDb();
    const document = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!document) throw new Error(`Document not found: ${docId}`);
    const currentType = document.sourceType || 'html';
    if (incomingType !== currentType) {
      throw new Error(`Choose a replacement ${sourceTypeLabel(currentType)} file for this source.`);
    }
    const now = new Date().toISOString();
    let updated = null;
    if (currentType === 'pdf') {
      const metadata = await pdfMetadataFromBytes(sourceBytes);
      updated = {
        ...document,
        title: file.name ? file.name.replace(/\.pdf$/i, '') : document.title,
        sourcePath: sourceFilename(file.name || document.sourcePath || 'source.pdf', 'pdf'),
        sourcePathEdited: true,
        sourceBytes,
        sourceHtml: '',
        pageCount: metadata.pageCount,
        pages: metadata.pages || null,
        compatibility: pdfCompatibilityReport(metadata),
        updatedAt: now
      };
    } else {
      const sourceHtml = new TextDecoder().decode(sourceBytes);
      const normalized = await normalizeHtmlForBrowserImport(sourceHtml, {
        filename: file.name || document.sourcePath || 'source.html',
        title: document.title || (file.name ? file.name.replace(/\.html?$/i, '') : '')
      });
      updated = {
        ...document,
        title: normalized.title || document.title,
        sourceType: 'html',
        sourcePath: sourceFilename(file.name || document.sourcePath || 'source.html', 'html'),
        sourcePathEdited: true,
        sourceHtml: normalized.sourceHtml,
        sourceBytes: null,
        pageCount: null,
        pages: null,
        compatibility: normalized.compatibility,
        updatedAt: now
      };
    }
    await writeTransaction(db, ['documents', 'documentMetadata'], (stores) => {
      putDocumentRecord(stores, updated);
    });
    return updated;
  }

  async exportDocumentBundle(docId) {
    const db = await openDb();
    const document = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!document) throw new Error(`Document not found: ${docId}`);
    const annotations = await this.getAnnotations(docId);
    const referencedNoteImages = referencedNoteImagePaths(annotations);
    const assets = (await readIndexAll(db, 'documentAssets', 'docId', docId)).filter((asset) => (
      asset?.kind !== NOTE_IMAGE_KIND || referencedNoteImages.has(asset.path)
    ));
    const quickMarks = await this.getQuickMarks(docId);
    return createAnnotatorBundleArchive({
      document,
      sourceHtml: document.sourceHtml || '',
      sourceBytes: document.sourceBytes || null,
      annotations,
      assets,
      quickMarks
    });
  }

  async importDocument(file) {
    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    if (isPdfFile(file) || looksLikePdfBytes(sourceBytes)) return this.importPdfDocument(file, sourceBytes);
    const sourceHtml = new TextDecoder().decode(sourceBytes);
    const normalized = await normalizeHtmlForBrowserImport(sourceHtml, {
      filename: file.name || 'document.html',
      title: file.name ? file.name.replace(/\.html?$/i, '') : ''
    });
    const db = await openDb();
    const now = new Date().toISOString();
    const document = {
      id: normalized.id,
      title: normalized.title,
      sourceType: 'html',
      sourcePath: sourceFilename(file.name || 'source.html', 'html'),
      sourcePathEdited: true,
      sourceHtml: normalized.sourceHtml,
      pages: null,
      compatibility: normalized.compatibility,
      createdAt: now,
      updatedAt: now
    };
    return writeImportTransaction(db, ({ stores, storedDocumentIds, currentLibrary }) => {
      const imported = { ...document, id: uniqueDocumentId(document.id, storedDocumentIds) };
      putDocumentRecord(stores, imported);
      addImportedDocumentToCurrentLibrary(stores, currentLibrary, imported);
      return imported;
    }, { documentIds: [document.id] });
  }

  async importDocumentBundle(file) {
    const bundle = await readAnnotatorBundleArchive(file);
    return this.importBundleData(bundle, { addToCurrentLibrary: true });
  }

  async importDocumentLibrary(file, options = {}) {
    if (isAnnotatorLibraryFilename(file?.name)) {
      const existing = await this.getCurrentLibraryContext();
      if (existing && !options.replaceCurrent) {
        throw new Error('Close or replace the current library before importing another library package.');
      }
    }
    const library = await readAnnotatorLibraryArchive(file, {
      retainParsedBundles: true,
      retainBundleBytes: false
    });
    return this.importLibraryData(library, options);
  }

  async importLibraryData(library, options = {}) {
    if (!library?.manifest || !Array.isArray(library.entries)) {
      throw new Error('Parsed library data has an invalid schema.');
    }
    const parsedBundles = library.entries.map((entry) => ({ entry, bundle: entry.bundle }));
    if (parsedBundles.some(({ bundle }) => !bundle?.document)) {
      throw new Error('Parsed library data is missing a validated bundle.');
    }
    const db = await openDb();
    return writeImportTransaction(db, ({ stores, storedDocumentIds, storedAnnotationIds, currentLibrary }) => {
      if (currentLibrary && !options.replaceCurrent) {
        throw new Error('Close or replace the current library before importing another library package.');
      }
      const usedDocumentIds = new Set(storedDocumentIds.map(String));
      const usedAnnotationIds = new Set(storedAnnotationIds.map(String));
      const plans = parsedBundles.map(({ bundle }) => planBundleImport(bundle, usedDocumentIds, usedAnnotationIds));
      const entries = [];
      const importedEntryIds = new Map();
      for (let index = 0; index < parsedBundles.length; index += 1) {
        const entry = parsedBundles[index].entry;
        const document = plans[index].document;
        const entryId = uniqueLibraryEntryId(entry.id || document.id, entries);
        importedEntryIds.set(String(entry.id || ''), entryId);
        entries.push({
          id: entryId,
          docId: document.id,
          title: entry.title || document.title,
          folderId: entry.folderId || null,
          order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : entries.length,
          lastOpenedAt: entry.lastOpenedAt || ''
        });
      }
      const requestedActiveEntryId = importedEntryIds.get(String(library.manifest.activeEntryId || '')) || '';
      const activeEntryId = requestedActiveEntryId && entries.some((entry) => entry.id === requestedActiveEntryId)
        ? requestedActiveEntryId
        : entries[0]?.id || null;
      const normalizedContext = normalizeCurrentLibraryContext({
        id: library.manifest.id || `library-${crypto.randomUUID()}`,
        title: library.manifest.title || 'Annotator library',
        createdAt: library.manifest.createdAt || new Date().toISOString(),
        packageUpdatedAt: library.manifest.updatedAt || library.manifest.createdAt || '',
        activeEntryId,
        folders: library.manifest.folders || [],
        entries,
        updatedAt: new Date().toISOString()
      });
      for (const plan of plans) writeBundleImportPlan(stores, plan);
      stores.appMeta.put({
        key: APP_META_CURRENT_LIBRARY,
        library: {
          ...normalizedContext,
          updatedAt: new Date().toISOString()
        }
      });
      const activeEntry = entries.find((entry) => entry.id === activeEntryId) || entries[0];
      const activePlan = plans.find((plan) => plan.document.id === activeEntry?.docId) || null;
      return {
        document: activePlan?.document || null,
        library: normalizedContext
      };
    }, bundleImportIdentityHints(parsedBundles.map(({ bundle }) => bundle)));
  }

  async exportCurrentLibraryPackage() {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library package is open.');
    const entries = [];
    for (const entry of context.entries || []) {
      const document = await this.getDocument(entry.docId);
      if (!document) continue;
      entries.push({
        id: entry.id || document.id,
        title: entry.title || document.title,
        folderId: entry.folderId || null,
        order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : entries.length,
        lastOpenedAt: entry.lastOpenedAt || '',
        data: await this.exportDocumentBundle(document.id)
      });
    }
    return createAnnotatorLibraryArchive({
      id: context.id,
      title: context.title,
      activeEntryId: context.activeEntryId,
      folders: context.folders || [],
      entries
    });
  }

  async createCurrentLibraryFromDocument(docId, title = null) {
    const document = await this.getDocument(docId);
    if (!document) throw new Error(`Document not found: ${docId}`);
    const context = {
      id: document.id,
      title: title || document.title || document.id,
      activeEntryId: document.id,
      folders: [],
      entries: [{
        id: document.id,
        docId: document.id,
        title: document.title || document.id,
        order: 0,
        lastOpenedAt: new Date().toISOString()
      }],
      updatedAt: new Date().toISOString()
    };
    await this.writeCurrentLibraryContext(context);
    return context;
  }

  async createCurrentLibraryFromDocuments(activeDocId = null, title = 'Annotator library') {
    const documents = (await this.listDocuments())
      .slice()
      .sort(compareDocumentsForLibrary);
    const entries = documents.map((document, index) => ({
      id: document.id,
      docId: document.id,
      title: document.title || document.id,
      order: index,
      lastOpenedAt: document.id === activeDocId ? new Date().toISOString() : ''
    }));
    const activeEntryId = entries.find((entry) => entry.docId === activeDocId)?.id || entries[0]?.id || null;
    const context = {
      id: activeEntryId || safeId(title || 'annotator-library'),
      title: title || (documents.length === 1 ? documents[0].title || documents[0].id : 'Annotator library'),
      activeEntryId,
      folders: [],
      entries,
      updatedAt: new Date().toISOString()
    };
    await this.writeCurrentLibraryContext(context);
    return context;
  }

  async deleteLibraryBundle(entryId) {
    const context = await this.getCurrentLibraryContext();
    if (!context) throw new Error('No current library is open.');
    const entry = (context.entries || []).find((item) => item.id === entryId);
    if (!entry) throw new Error('Bundle not found.');
    const remainingEntries = (context.entries || [])
      .filter((item) => item.id !== entryId)
      .map((item, index) => ({ ...item, order: index }));
    await this.deleteDocumentData(entry.docId);
    const nextContext = {
      ...context,
      activeEntryId: remainingEntries.some((item) => item.id === context.activeEntryId)
        ? context.activeEntryId
        : remainingEntries[0]?.id || null,
      entries: remainingEntries
    };
    await this.writeCurrentLibraryContext(nextContext);
    return nextContext;
  }

  async deleteDocumentData(docId) {
    if (!docId) return false;
    const db = await openDb();
    const annotations = await readIndexAll(db, 'annotations', 'docId', docId);
    const bodies = await readIndexAll(db, 'annotationBodies', 'docId', docId);
    const assets = await readIndexAll(db, 'documentAssets', 'docId', docId);
    const lastOpen = await readOne(db, 'appMeta', APP_META_LAST_OPEN_DOCUMENT);
    await writeTransaction(db, [
      'documents',
      'documentMetadata',
      'annotations',
      'annotationBodies',
      'documentNoteStats',
      'documentAssets',
      'documentFileHandles',
      'appMeta'
    ], (stores) => {
      deleteDocumentRecord(stores, docId);
      stores.documentNoteStats.delete(docId);
      stores.documentFileHandles.delete(docId);
      for (const annotation of annotations) stores.annotations.delete(annotation.id);
      for (const body of bodies) stores.annotationBodies.delete(body.id);
      for (const asset of assets) stores.documentAssets.delete(asset.id);
      stores.appMeta.delete(quickMarksKey(docId));
      if (lastOpen?.docId === docId) stores.appMeta.delete(APP_META_LAST_OPEN_DOCUMENT);
      stores.appMeta.delete(readerPositionKey(docId));
    });
    clearBrowserStateKeys(localStorage, [`reader-quick-marks:${docId}`, `reader-layout:${docId}`]);
    clearBrowserStateKeys(sessionStorage, [`reader-scroll:${docId}`]);
    revokeBlobUrls(this.blobUrls.get(docId));
    this.blobUrls.delete(docId);
    this.revokeNoteImageUrl(docId);
    return true;
  }

  async writeCurrentLibraryContext(context) {
    const db = await openDb();
    const library = normalizeCurrentLibraryContext(context);
    await writeTransaction(db, ['appMeta'], (stores) => {
      stores.appMeta.put({
        key: APP_META_CURRENT_LIBRARY,
        library: {
          ...library,
          updatedAt: new Date().toISOString()
        }
      });
    });
  }

  async importBundleData(bundle, options = {}) {
    const db = await openDb();
    return writeImportTransaction(db, ({ stores, storedDocumentIds, storedAnnotationIds, currentLibrary }) => {
      const plan = planBundleImport(
        bundle,
        new Set(storedDocumentIds.map(String)),
        new Set(storedAnnotationIds.map(String))
      );
      writeBundleImportPlan(stores, plan);
      if (options.addToCurrentLibrary && currentLibrary) {
        const entries = [...(currentLibrary.entries || [])];
        const id = uniqueLibraryEntryId(plan.document.id, entries);
        entries.push({
          id,
          docId: plan.document.id,
          title: plan.document.title || plan.document.id,
          folderId: null,
          order: entries.length
        });
        const nextLibrary = normalizeCurrentLibraryContext({
          ...currentLibrary,
          activeEntryId: id,
          entries,
          updatedAt: new Date().toISOString()
        });
        stores.appMeta.put({ key: APP_META_CURRENT_LIBRARY, library: nextLibrary });
      }
      return plan.document;
    }, bundleImportIdentityHints([bundle]));
  }

  async writeHydratedAnnotation(annotation) {
    const db = await openDb();
    await mutateHydratedAnnotation(db, {
      docId: annotation.docId,
      annotationId: annotation.id,
      nextAnnotation: annotation
    });
  }

  async importPdfDocument(file, bytes = null) {
    const sourceBytes = bytes || new Uint8Array(await file.arrayBuffer());
    const metadata = await pdfMetadataFromBytes(sourceBytes);
    const now = new Date().toISOString();
    const title = file.name ? file.name.replace(/\.pdf$/i, '') : 'Imported PDF';
    const document = {
      id: safeId(title),
      title,
      sourceType: 'pdf',
      sourcePath: sourceFilename(file.name || 'source.pdf', 'pdf'),
      sourcePathEdited: true,
      sourceBytes,
      sourceHtml: '',
      pageCount: metadata.pageCount,
      pages: metadata.pages || null,
      compatibility: pdfCompatibilityReport(metadata),
      createdAt: now,
      updatedAt: now
    };
    const db = await openDb();
    return writeImportTransaction(db, ({ stores, storedDocumentIds, currentLibrary }) => {
      const imported = { ...document, id: uniqueDocumentId(document.id, storedDocumentIds) };
      putDocumentRecord(stores, imported);
      addImportedDocumentToCurrentLibrary(stores, currentLibrary, imported);
      return imported;
    }, { documentIds: [document.id] });
  }

  async rebuildDocumentMetadata() {
    const db = await openDb();
    const documents = await readAll(db, 'documents');
    const metadata = documents.map(documentMetadataFromStoredDocument).filter(Boolean);
    if (metadata.length) {
      await writeTransaction(db, ['documentMetadata'], (stores) => {
        for (const document of metadata) stores.documentMetadata.put(document);
      });
    }
    return metadata.map(normalizeStoredDocument);
  }
}

export function planBundleImport(bundle, usedDocumentIds = new Set(), usedAnnotationIds = new Set()) {
  const documentIds = usedDocumentIds instanceof Set ? usedDocumentIds : new Set(usedDocumentIds || []);
  const annotationIds = usedAnnotationIds instanceof Set ? usedAnnotationIds : new Set(usedAnnotationIds || []);
  const portableDocumentId = safeId(bundle?.document?.id || bundle?.document?.title || 'document');
  const documentId = uniqueIdFromSet(portableDocumentId, documentIds, safeId);
  const document = normalizeDocumentFromBundle(bundle?.document, bundle?.sourceHtml, bundle?.sourceBytes, documentId);
  const annotations = hydratedAnnotationsFromBundle(bundle || {}).map((annotation, index) => {
    const baseId = String(annotation?.id || `annotation-${index + 1}`);
    const id = uniqueIdFromSet(baseId, annotationIds, importedAnnotationId);
    return normalizeHydratedAnnotation({
      ...annotation,
      id,
      docId: document.id
    });
  });
  const noteImagePaths = referencedNoteImagePaths(annotations);
  const assets = (bundle?.assets || []).map((asset) => ({
    id: `${document.id}:${asset.path}`,
    docId: document.id,
    path: asset.path,
    ...(noteImagePaths.has(asset.path) ? { kind: NOTE_IMAGE_KIND } : {}),
    data: asset.data,
    mimeType: asset.mimeType || 'application/octet-stream',
    byteLength: asset.data?.byteLength ?? asset.data?.length ?? 0
  }));
  return {
    document,
    annotations,
    assets,
    quickMarks: normalizeQuickMarkRecord(bundle?.quickMarks, document.id)
  };
}

export function bundleImportIdentityHints(bundles = []) {
  const documentIds = new Set();
  const annotationIds = new Set();
  for (const bundle of bundles || []) {
    documentIds.add(safeId(bundle?.document?.id || bundle?.document?.title || 'document'));
    for (const [index, annotation] of (bundle?.annotations || []).entries()) {
      annotationIds.add(importedAnnotationId(annotation?.id || `annotation-${index + 1}`));
    }
  }
  return {
    documentIds: [...documentIds],
    annotationIds: [...annotationIds]
  };
}

export function documentNoteStatsFromStoredRecords(docId, annotations = [], bodies = []) {
  const normalizedDocId = String(docId || '');
  const bodiesById = new Map((bodies || []).map((body) => [String(body?.id || ''), body]));
  const stats = emptyDocumentNoteStats(normalizedDocId);
  for (const annotation of annotations || []) {
    if (String(annotation?.docId || '') !== normalizedDocId) continue;
    const body = bodiesById.get(String(annotation?.id || ''));
    const note = Object.hasOwn(annotation || {}, 'note') ? annotation.note : body?.note;
    addAnnotationStatsContribution(stats, annotation, note, 1);
  }
  return stats;
}

export function documentNoteStatsAfterReplacement(current, previous = null, next = null) {
  const docId = String(next?.docId || previous?.docId || current?.docId || '');
  const stats = normalizeDocumentNoteStats(current, docId);
  if (previous) addAnnotationStatsContribution(stats, previous, previous.note, -1);
  if (next) addAnnotationStatsContribution(stats, next, next.note, 1);
  stats.notes = Math.max(0, stats.notes);
  stats.highlights = Math.max(0, stats.highlights);
  stats.ink = Math.max(0, stats.ink);
  return stats;
}

function writeBundleImportPlan(stores, plan) {
  putDocumentRecord(stores, plan.document);
  for (const annotation of plan.annotations) {
    const { note, ...metadata } = annotation;
    stores.annotations.put({
      ...metadata,
      noteRef: {
        storage: 'indexeddb',
        version: 1
      }
    });
    stores.annotationBodies.put({
      id: annotation.id,
      docId: plan.document.id,
      note: normalizeNoteForStorage(note),
      updatedAt: annotation.updatedAt || new Date().toISOString()
    });
  }
  stores.documentNoteStats.put(documentNoteStatsFromStoredRecords(
    plan.document.id,
    plan.annotations
  ));
  for (const asset of plan.assets) stores.documentAssets.put(asset);
  stores.appMeta.put({
    key: quickMarksKey(plan.document.id),
    quickMarks: {
      ...plan.quickMarks,
      docId: plan.document.id,
      updatedAt: new Date().toISOString()
    }
  });
}

function uniqueIdFromSet(value, used, normalize) {
  const base = normalize(value);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function importedAnnotationId(value) {
  const normalized = String(value || 'annotation').trim();
  return normalized || 'annotation';
}

function normalizeCurrentLibraryContext(context) {
  if (!context) return null;
  const folders = normalizeLibraryFoldersForStorage(context.folders || []);
  const folderIds = new Set(folders.map((folder) => folder.id));
  const entries = (context.entries || []).map((entry, index) => {
    const folderId = folderIds.has(entry.folderId) ? entry.folderId : null;
    return {
      ...entry,
      id: String(entry.id || entry.docId || `entry-${index + 1}`),
      docId: String(entry.docId || entry.id || ''),
      title: entry.title || entry.docId || entry.id || `Bundle ${index + 1}`,
      folderId,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index,
      lastOpenedAt: entry.lastOpenedAt || ''
    };
  });
  const entryIds = new Set(entries.map((entry) => entry.id));
  return {
    ...context,
    folders,
    entries,
    activeEntryId: entryIds.has(context.activeEntryId) ? context.activeEntryId : entries[0]?.id || null
  };
}

function normalizeLibraryFoldersForStorage(rawFolders = []) {
  const prepared = [];
  const aliases = new Map();
  for (const [index, folder] of rawFolders.entries()) {
    const rawId = String(folder?.id || folder?.title || `folder-${index + 1}`);
    const id = uniqueLibraryFolderId(rawId, prepared);
    aliases.set(rawId, id);
    prepared.push({
      id,
      title: String(folder?.title || rawId || id).trim() || id,
      parentId: folder?.parentId ? String(folder.parentId) : null,
      order: Number.isFinite(Number(folder?.order)) ? Number(folder.order) : index
    });
  }
  const foldersById = new Map(prepared.map((folder) => [folder.id, folder]));
  return prepared.map((folder) => {
    const parentId = aliases.get(folder.parentId) || folder.parentId;
    return {
      ...folder,
      parentId: parentId && foldersById.has(parentId) && !libraryFolderHasAncestor(prepared, parentId, folder.id)
        ? parentId
        : null
    };
  });
}

function libraryFolderHasAncestor(folders, folderId, ancestorId) {
  let current = folderId || null;
  const byId = new Map((folders || []).map((folder) => [folder.id, folder]));
  const seen = new Set();
  while (current) {
    if (current === ancestorId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    current = byId.get(current)?.parentId || null;
  }
  return false;
}

function uniqueLibraryFolderId(value, folders = []) {
  const used = new Set((folders || []).map((folder) => folder.id));
  const base = safeLibraryId(value || 'folder', 'folder');
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function safeLibraryId(value, fallback = 'item') {
  return String(value || fallback)
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || fallback;
}

function normalizeDocumentFromBundle(document, sourceHtml, sourceBytes = null, localId = null) {
  const now = new Date().toISOString();
  const sourceType = document?.sourceType || 'html';
  const compatibility = sourceType === 'pdf'
    ? normalizePdfCompatibility(document?.compatibility, document?.pages)
    : document?.compatibility || null;
  return {
    id: localId || safeId(document?.id || document?.title || 'document'),
    title: document?.title || document?.id || 'Untitled document',
    sourceType,
    sourcePath: sourcePathForDocument(document, sourceType),
    sourcePathEdited: Boolean(document?.sourcePathEdited),
    sourceHtml: sourceType === 'pdf' ? '' : sourceHtml,
    sourceBytes: sourceType === 'pdf' ? sourceBytes : null,
    pageCount: sourceType === 'pdf' ? document?.pageCount || document?.pages?.length || null : null,
    pages: document?.pages || null,
    compatibility,
    createdAt: document?.createdAt || now,
    updatedAt: document?.updatedAt || now
  };
}

function normalizeStoredDocument(document) {
  if (!document) return document;
  const normalized = {
    ...document,
    sourcePath: sourcePathForDocument(document, document.sourceType || 'html'),
    pageCount: document.sourceType === 'pdf' ? document.pageCount || document.pages?.length || null : null
  };
  if (document.sourceType !== 'pdf') return normalized;
  return {
    ...normalized,
    compatibility: normalizePdfCompatibility(normalized.compatibility, normalized.pages)
  };
}

export async function resolveDocumentRenderRecord(docId, documentRecord, loadDocument) {
  const expectedId = String(docId || '');
  const suppliedRecord = documentRecord
    && String(documentRecord.id || '') === expectedId
    && storedDocumentHasSourcePayload(documentRecord)
    ? documentRecord
    : null;
  const record = suppliedRecord || await loadDocument(expectedId);
  return normalizeStoredDocument(record);
}

function storedDocumentHasSourcePayload(document) {
  if (!document || typeof document !== 'object') return false;
  return document.sourceType === 'pdf'
    ? Object.hasOwn(document, 'sourceBytes')
    : Object.hasOwn(document, 'sourceHtml');
}

export function documentMetadataFromStoredDocument(document) {
  if (!document?.id) return null;
  const normalized = normalizeStoredDocument(document);
  return {
    id: normalized.id,
    title: normalized.title || normalized.id,
    sourceType: normalized.sourceType || 'html',
    sourcePath: normalized.sourcePath,
    sourcePathEdited: Boolean(normalized.sourcePathEdited),
    pageCount: normalized.pageCount || null,
    pages: normalized.pages || null,
    compatibility: normalized.compatibility || null,
    createdAt: normalized.createdAt || '',
    updatedAt: normalized.updatedAt || ''
  };
}

function putDocumentRecord(stores, document) {
  stores.documents.put(document);
  stores.documentMetadata?.put(documentMetadataFromStoredDocument(document));
  stores.documentNoteStats?.put(emptyDocumentNoteStats(document.id));
}

function addImportedDocumentToCurrentLibrary(stores, currentLibrary, document) {
  if (!currentLibrary) return null;
  const entries = [...(currentLibrary.entries || [])];
  const id = uniqueLibraryEntryId(document.id, entries);
  entries.push({
    id,
    docId: document.id,
    title: document.title || document.id,
    folderId: null,
    order: entries.length
  });
  const library = normalizeCurrentLibraryContext({
    ...currentLibrary,
    activeEntryId: id,
    entries,
    updatedAt: new Date().toISOString()
  });
  stores.appMeta.put({ key: APP_META_CURRENT_LIBRARY, library });
  return library;
}

function deleteDocumentRecord(stores, docId) {
  stores.documents.delete(docId);
  stores.documentMetadata?.delete(docId);
}

function readerPositionKey(docId) {
  return `${APP_META_READER_POSITION_PREFIX}${docId}`;
}

function quickMarksKey(docId) {
  return `${APP_META_QUICK_MARKS_PREFIX}${docId}`;
}

function normalizeReaderPosition(position) {
  if (!position || typeof position !== 'object') return null;
  const docId = position.docId ? String(position.docId) : '';
  const sourceType = position.sourceType === 'pdf' ? 'pdf' : 'html';
  const scrollY = Number(position.scrollY);
  const normalized = {
    version: 1,
    docId,
    sourceType,
    scrollY: Number.isFinite(scrollY) && scrollY > 0 ? scrollY : 0,
    updatedAt: position.updatedAt || ''
  };
  if (sourceType === 'pdf') {
    const pageNumber = position.pageNumber == null ? NaN : Number(position.pageNumber);
    const pageIndex = position.pageIndex == null ? NaN : Number(position.pageIndex);
    const ratio = Number(position.ratio);
    if (Number.isFinite(pageNumber) && pageNumber > 0) normalized.pageNumber = Math.round(pageNumber);
    if (Number.isFinite(pageIndex) && pageIndex >= 0) normalized.pageIndex = Math.round(pageIndex);
    if (Number.isFinite(ratio)) normalized.ratio = Math.max(0, Math.min(1, ratio));
  } else {
    if (position.anchorId) normalized.anchorId = String(position.anchorId);
    if (position.id) normalized.id = String(position.id);
    const offset = Number(position.offset);
    if (Number.isFinite(offset)) normalized.offset = offset;
  }
  if (!normalized.docId) return null;
  if (normalized.sourceType === 'pdf') {
    return normalized.scrollY > 0 || Number.isFinite(normalized.pageNumber) || Number.isFinite(normalized.pageIndex)
      ? normalized
      : null;
  }
  return normalized.scrollY > 0 || normalized.anchorId || normalized.id ? normalized : null;
}

async function pdfMetadataFromBytes(bytes) {
  const pdfjs = await import('./vendor/pdfjs/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.mjs', location.href).href;
  const loadingTask = pdfjs.getDocument({
    data: bytes.slice(),
    ...pdfAssetOptions()
  });
  let pdf = null;
  try {
    pdf = await loadingTask.promise;
    return { pageCount: pdf.numPages, pages: null };
  } finally {
    await pdf?.destroy?.();
  }
}

function pdfAssetOptions() {
  return {
    cMapUrl: new URL('./vendor/pdfjs/cmaps/', location.href).href,
    cMapPacked: true,
    standardFontDataUrl: new URL('./vendor/pdfjs/standard_fonts/', location.href).href,
    wasmUrl: new URL('./vendor/pdfjs/wasm/', location.href).href,
    iccUrl: new URL('./vendor/pdfjs/iccs/', location.href).href
  };
}

function pdfCompatibilityReport(metadata) {
  return {
    contractVersion: 1,
    level: 'PDF',
    features: {
      display: true,
      blockNotes: true,
      pdfPagePointNotes: true,
      pdfRectHighlights: true,
      singleBlockTextHighlights: true,
      crossBlockTextHighlights: false,
      sideNotes: true,
      focusMode: false,
      sourceNavigation: true,
      latexMath: false,
      inlineMedia: false,
      interactiveSource: false
    },
    warnings: ['PDF text and page geometry are prepared lazily while reading; notes use page-coordinate anchors.']
  };
}

function normalizePdfCompatibility(compatibility, pages = null) {
  const base = pdfCompatibilityReport({ pages: pages || [], pageCount: pages?.length || 0 });
  return {
    ...base,
    ...(compatibility || {}),
    features: {
      ...base.features,
      ...(compatibility?.features || {}),
      singleBlockTextHighlights: true
    }
  };
}

function isPdfFile(file) {
  return file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name || '');
}

function replacementSourceType(file, bytes) {
  if (isPdfFile(file) || looksLikePdfBytes(bytes)) return 'pdf';
  if (file?.type === 'text/html' || /\.html?$/i.test(file?.name || '')) return 'html';
  throw new Error('Choose an HTML or PDF source file.');
}

function sourceTypeLabel(sourceType) {
  return sourceType === 'pdf' ? 'PDF' : 'HTML';
}

function sourceFilename(value, sourceType = 'html') {
  const fallback = sourceType === 'pdf' ? 'source.pdf' : 'source.html';
  const basename = String(value || fallback)
    .replaceAll('\\', '/')
    .split('/')
    .pop()
    .trim();
  let safe = basename
    .replace(/[^\p{L}\p{N}._ -]+/gu, '-')
    .replace(/\s+/g, ' ')
    .replace(/^-+|-+$/g, '')
    .trim();
  if (!safe || safe === '.' || safe === '..') safe = fallback;
  if (sourceType === 'pdf' && !/\.pdf$/i.test(safe)) safe += '.pdf';
  if (sourceType !== 'pdf' && !/\.html?$/i.test(safe)) safe += '.html';
  return safe;
}

function sourcePathForDocument(document, sourceType = 'html') {
  const fallback = sourceType === 'pdf' ? 'source.pdf' : 'source.html';
  const current = sourceFilename(document?.sourcePath || fallback, sourceType);
  if (document?.sourcePathEdited || !isGenericSourcePath(current, sourceType)) return current;
  const inferred = sourceFilename(document?.id || document?.title || current, sourceType);
  return isGenericSourcePath(inferred, sourceType) ? current : inferred;
}

function isGenericSourcePath(value, sourceType = 'html') {
  const normalized = String(value || '').toLowerCase();
  return sourceType === 'pdf'
    ? normalized === 'source.pdf'
    : normalized === 'source.html' || normalized === 'source.htm';
}

function looksLikePdfBytes(bytes) {
  return bytes?.[0] === 0x25
    && bytes?.[1] === 0x50
    && bytes?.[2] === 0x44
    && bytes?.[3] === 0x46
    && bytes?.[4] === 0x2d;
}

function looksLikePdfText(text) {
  return /^\s*%PDF-/i.test(text || '');
}

function corruptPdfImportHtml(document) {
  const title = escapeHtml(document?.title || 'PDF import needs repair');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f4f1eb; color: #211b16; font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; }
    main { width: min(680px, calc(100vw - 48px)); }
    h1 { margin: 0 0 .7rem; font-size: 1.35rem; }
    p { margin: .45rem 0; color: #5f5549; }
  </style>
</head>
<body>
  <main data-anchor-id="pdf-import-repair">
    <h1>This PDF needs to be re-imported</h1>
    <p>This browser record contains PDF bytes that were previously imported as HTML text, so the original binary PDF cannot be recovered from IndexedDB.</p>
    <p>Clear this broken entry from the library and import the PDF file again. New PDF imports are detected by file content and will open in the PDF viewer.</p>
  </main>
</body>
</html>
`;
}

function normalizeQuickMarkRecord(value, docId = '') {
  const source = Array.isArray(value) ? { marks: value } : value || {};
  const marks = Array.isArray(source.marks)
    ? source.marks.map((mark, index) => normalizeStoredQuickMark(mark, index)).filter(Boolean).slice(0, 8)
    : [];
  const colorIndex = Number(source.colorIndex);
  return {
    docId: String(docId || source.docId || ''),
    marks,
    colorIndex: Number.isInteger(colorIndex) && colorIndex >= 0 ? colorIndex % 5 : 0,
    updatedAt: source.updatedAt || ''
  };
}

function normalizeStoredQuickMark(mark, index) {
  if (!mark?.target || typeof mark.target !== 'object') return null;
  const colorIndex = Number(mark.colorIndex);
  return {
    id: String(mark.id || `mark-${index + 1}`),
    target: { ...mark.target },
    colorIndex: Number.isInteger(colorIndex) && colorIndex >= 0 ? colorIndex % 5 : 0,
    label: String(mark.label || 'Quick mark').slice(0, 240)
  };
}

function readLegacyQuickMarks(docId) {
  try {
    const raw = globalThis.localStorage?.getItem?.(`reader-quick-marks:${docId}`);
    if (!raw) return null;
    return normalizeQuickMarkRecord(JSON.parse(raw), docId);
  } catch {
    return null;
  }
}

export async function validateNoteImageFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new Error('Choose a PNG, JPEG, or WebP picture.');
  const declaredSize = Number(file.size);
  if (Number.isFinite(declaredSize) && declaredSize > NOTE_IMAGE_MAX_BYTES) {
    throw new Error('Pictures must be 20 MiB or smaller.');
  }
  const data = new Uint8Array(await file.arrayBuffer());
  if (!data.byteLength) throw new Error('The selected picture is empty.');
  if (data.byteLength > NOTE_IMAGE_MAX_BYTES) {
    throw new Error('Pictures must be 20 MiB or smaller.');
  }
  const metadata = noteImageMetadataFromBytes(data);
  const declaredType = normalizeNoteImageMimeType(file.type);
  if (declaredType && declaredType !== metadata.mimeType) {
    throw new Error(`The picture contents do not match its declared ${declaredType} type.`);
  }
  const pixels = metadata.intrinsicWidth * metadata.intrinsicHeight;
  if (!Number.isSafeInteger(pixels) || pixels > NOTE_IMAGE_MAX_PIXELS) {
    throw new Error('Pictures must contain no more than 40 megapixels.');
  }
  await verifyNoteImageDecode(file, data, metadata);
  const originalName = sanitizeNoteImageFilename(file.name, metadata.mimeType);
  return {
    data,
    byteLength: data.byteLength,
    mimeType: metadata.mimeType,
    extension: metadata.extension,
    intrinsicWidth: metadata.intrinsicWidth,
    intrinsicHeight: metadata.intrinsicHeight,
    originalName,
    alt: defaultNoteImageAlt(originalName)
  };
}

function normalizeNoteImageMimeType(value) {
  const mimeType = String(value || '').toLowerCase();
  return mimeType === 'image/jpg' || mimeType === 'image/pjpeg' ? 'image/jpeg' : mimeType;
}

export function noteImageMetadataFromBytes(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input || []);
  if (isPngBytes(bytes)) return pngMetadata(bytes);
  if (isJpegBytes(bytes)) return jpegMetadata(bytes);
  if (isWebpBytes(bytes)) return webpMetadata(bytes);
  throw new Error('Only PNG, JPEG, and WebP pictures are supported.');
}

function isPngBytes(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return bytes.length >= 24 && signature.every((byte, index) => bytes[index] === byte);
}

function pngMetadata(bytes) {
  if (asciiAt(bytes, 12, 4) !== 'IHDR') throw new Error('The PNG picture has an invalid header.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return checkedNoteImageMetadata('image/png', 'png', view.getUint32(16), view.getUint32(20));
}

function isJpegBytes(bytes) {
  return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
}

function jpegMetadata(bytes) {
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  let orientation = 1;
  let dimensions = null;
  while (offset + 4 <= bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) break;
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) break;
    if (marker === 0xe1) orientation = jpegExifOrientation(bytes, offset + 2, offset + length) || orientation;
    if (sofMarkers.has(marker)) {
      if (length < 7) break;
      const height = (bytes[offset + 3] << 8) | bytes[offset + 4];
      const width = (bytes[offset + 5] << 8) | bytes[offset + 6];
      dimensions = { width, height };
    }
    offset += length;
  }
  if (dimensions) {
    const swapsAxes = orientation >= 5 && orientation <= 8;
    return checkedNoteImageMetadata(
      'image/jpeg',
      'jpg',
      swapsAxes ? dimensions.height : dimensions.width,
      swapsAxes ? dimensions.width : dimensions.height
    );
  }
  throw new Error('The JPEG picture has no valid size header.');
}

function jpegExifOrientation(bytes, start, end) {
  if (end - start < 14 || asciiAt(bytes, start, 6) !== 'Exif\u0000\u0000') return 0;
  const tiff = start + 6;
  const byteOrder = asciiAt(bytes, tiff, 2);
  const littleEndian = byteOrder === 'II';
  if (!littleEndian && byteOrder !== 'MM') return 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const read16 = (offset) => offset >= tiff && offset + 2 <= end ? view.getUint16(offset, littleEndian) : NaN;
  const read32 = (offset) => offset >= tiff && offset + 4 <= end ? view.getUint32(offset, littleEndian) : NaN;
  if (read16(tiff + 2) !== 42) return 0;
  const ifd = tiff + read32(tiff + 4);
  const count = read16(ifd);
  if (!Number.isSafeInteger(count) || count > 4096) return 0;
  for (let index = 0; index < count; index += 1) {
    const entry = ifd + 2 + index * 12;
    if (entry + 12 > end) return 0;
    if (read16(entry) !== 0x0112 || read16(entry + 2) !== 3 || read32(entry + 4) !== 1) continue;
    const orientation = read16(entry + 8);
    return orientation >= 1 && orientation <= 8 ? orientation : 0;
  }
  return 0;
}

function isWebpBytes(bytes) {
  return bytes.length >= 30 && asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP';
}

function webpMetadata(bytes) {
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = asciiAt(bytes, offset, 4);
    const length = readLe32At(bytes, offset + 4);
    const payload = offset + 8;
    if (!Number.isSafeInteger(length) || payload + length > bytes.length) break;
    if (type === 'VP8X' && length >= 10) {
      return checkedNoteImageMetadata(
        'image/webp',
        'webp',
        1 + readLe24At(bytes, payload + 4),
        1 + readLe24At(bytes, payload + 7)
      );
    }
    if (type === 'VP8 ' && length >= 10
      && bytes[payload + 3] === 0x9d && bytes[payload + 4] === 0x01 && bytes[payload + 5] === 0x2a) {
      const width = (bytes[payload + 6] | (bytes[payload + 7] << 8)) & 0x3fff;
      const height = (bytes[payload + 8] | (bytes[payload + 9] << 8)) & 0x3fff;
      return checkedNoteImageMetadata('image/webp', 'webp', width, height);
    }
    if (type === 'VP8L' && length >= 5 && bytes[payload] === 0x2f) {
      const bits = readLe32At(bytes, payload + 1);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >>> 14) & 0x3fff) + 1;
      return checkedNoteImageMetadata('image/webp', 'webp', width, height);
    }
    offset = payload + length + (length % 2);
  }
  throw new Error('The WebP picture has no valid size header.');
}

function checkedNoteImageMetadata(mimeType, extension, intrinsicWidth, intrinsicHeight) {
  const width = positiveInteger(intrinsicWidth);
  const height = positiveInteger(intrinsicHeight);
  if (!width || !height) throw new Error('The picture has invalid intrinsic dimensions.');
  return { mimeType, extension, intrinsicWidth: width, intrinsicHeight: height };
}

async function verifyNoteImageDecode(file, bytes, expected) {
  const blob = typeof Blob === 'function' && file instanceof Blob
    ? file
    : new Blob([bytes], { type: expected.mimeType });
  if (typeof createImageBitmap === 'function') {
    let bitmap = null;
    try {
      bitmap = await createImageBitmap(blob);
      if (bitmap.width !== expected.intrinsicWidth || bitmap.height !== expected.intrinsicHeight) {
        throw new Error('The decoded picture dimensions do not match its header.');
      }
      return;
    } catch (error) {
      if (/dimensions do not match/.test(error?.message || '')) throw error;
      throw new Error('The selected picture could not be decoded.', { cause: error });
    } finally {
      bitmap?.close?.();
    }
  }
  if (typeof Image !== 'function' || typeof URL?.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(blob);
  try {
    const dimensions = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('decode failed'));
      image.src = url;
    });
    if (dimensions.width !== expected.intrinsicWidth || dimensions.height !== expected.intrinsicHeight) {
      throw new Error('The decoded picture dimensions do not match its header.');
    }
  } catch (error) {
    if (/dimensions do not match/.test(error?.message || '')) throw error;
    throw new Error('The selected picture could not be decoded.', { cause: error });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function noteImageAssetPath(extension) {
  return `note-images/img_${crypto.randomUUID().toLowerCase()}.${extension}`;
}

function normalizeNoteImagePath(value) {
  const path = String(value || '');
  return /^note-images\/img_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:png|jpg|webp)$/.test(path)
    ? path
    : '';
}

function noteImageMimeTypeForPath(path) {
  if (/\.png$/.test(path || '')) return 'image/png';
  if (/\.jpg$/.test(path || '')) return 'image/jpeg';
  if (/\.webp$/.test(path || '')) return 'image/webp';
  return '';
}

function sanitizeNoteImageFilename(value, mimeType = '') {
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fallback = `image.${extension}`;
  const basename = String(value || fallback).replaceAll('\\', '/').split('/').pop() || fallback;
  const safe = basename
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
  return safe && safe !== '.' && safe !== '..' ? safe : fallback;
}

function defaultNoteImageAlt(filename) {
  return String(filename || 'Image')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240) || 'Image';
}

function referencedNoteImagePaths(annotations) {
  const paths = new Set();
  for (const annotation of annotations || []) {
    for (const block of annotation?.note?.blocks || []) {
      if (block?.type !== 'image') continue;
      const path = normalizeNoteImagePath(block.assetPath);
      if (path) paths.add(path);
    }
  }
  return paths;
}

function noteImageCacheKey(docId, assetPath) {
  return `${docId}\u0000${assetPath}`;
}

function asciiAt(bytes, offset, length) {
  if (offset < 0 || offset + length > bytes.length) return '';
  let value = '';
  for (let index = 0; index < length; index += 1) value += String.fromCharCode(bytes[offset + index]);
  return value;
}

function readLe24At(bytes, offset) {
  if (offset < 0 || offset + 3 > bytes.length) return NaN;
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readLe32At(bytes, offset) {
  if (offset < 0 || offset + 4 > bytes.length) return NaN;
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true);
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function revokeBlobUrls(urls) {
  for (const url of Array.isArray(urls) ? urls : urls ? [urls] : []) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Blob URL cleanup is best effort during page teardown.
    }
  }
}

function htmlWithResolvedAssets(sourceHtml, sourcePath, assets, createdUrls) {
  if (typeof DOMParser !== 'function') return sourceHtml;
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml || '<!doctype html><html><head></head><body></body></html>', 'text/html');
  const projectionWarnings = [];
  prepareStaticReaderDocument(doc, projectionWarnings);
  const assetUrls = new Map();
  const preparedAssets = (Array.isArray(assets) ? assets : [])
    .map((asset) => ({ ...asset, normalizedPath: normalizeAssetPath(asset.path) }))
    .filter((asset) => asset.normalizedPath && !isScriptAsset(asset));

  for (const asset of preparedAssets.filter((item) => !isCssAsset(item))) {
    registerAssetBlobUrl(assetUrls, asset, asset.data, createdUrls);
  }
  prepareCssAssetUrls(preparedAssets.filter(isCssAsset), assetUrls, projectionWarnings);

  const htmlBasePath = normalizeAssetPath(sourcePath || 'source.html');
  for (const element of doc.querySelectorAll('[src], [href], [poster]')) {
    for (const attribute of ['src', 'href', 'poster']) {
      if (!element.hasAttribute(attribute)) continue;
      if (element.localName === 'script' && attribute === 'src') continue;
      const value = element.getAttribute(attribute);
      const resolved = resolvedAssetUrl(value, htmlBasePath, assetUrls);
      if (resolved) element.setAttribute(attribute, resolved);
      else if (isAutomaticResourceAttribute(element, attribute) && shouldReportResourceReference(value)) {
        recordProjectionWarning(projectionWarnings, value);
        element.removeAttribute(attribute);
      }
    }
  }
  for (const element of doc.querySelectorAll('[srcset]')) {
    const rewritten = String(element.getAttribute('srcset') || '')
      .split(',')
      .map((candidate) => {
        const match = /^\s*(\S+)([\s\S]*)$/.exec(candidate);
        if (!match) return candidate;
        const resolved = resolvedAssetUrl(match[1], htmlBasePath, assetUrls);
        if (resolved) return `${resolved}${match[2]}`;
        if (shouldReportResourceReference(match[1])) {
          recordProjectionWarning(projectionWarnings, match[1]);
          return '';
        }
        return candidate;
      })
      .filter(Boolean)
      .join(',');
    if (rewritten) element.setAttribute('srcset', rewritten);
    else element.removeAttribute('srcset');
  }
  for (const element of doc.querySelectorAll('[style]')) {
    element.setAttribute('style', rewriteCssAssetUrls(
      element.getAttribute('style') || '',
      htmlBasePath,
      assetUrls,
      null,
      (value) => recordProjectionWarning(projectionWarnings, value)
    ));
  }
  for (const style of doc.querySelectorAll('style')) {
    style.textContent = rewriteCssAssetUrls(
      style.textContent || '',
      htmlBasePath,
      assetUrls,
      null,
      (value) => recordProjectionWarning(projectionWarnings, value)
    );
  }
  if (projectionWarnings.length) {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'marginalia-projection-warnings');
    meta.setAttribute('content', JSON.stringify([...new Set(projectionWarnings)].slice(0, 20)));
    doc.head.append(meta);
  }
  return `<!doctype html>\n${doc.documentElement.outerHTML}\n`;
}

function prepareStaticReaderDocument(doc, projectionWarnings = []) {
  for (const meta of doc.querySelectorAll('meta[http-equiv]')) {
    const directive = String(meta.getAttribute('http-equiv') || '').toLowerCase();
    if (directive === 'content-security-policy' || directive === 'refresh') meta.remove();
  }
  doc.querySelectorAll('script').forEach((script) => script.remove());
  for (const element of doc.querySelectorAll('*')) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (/^on/.test(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (['href', 'src', 'action', 'formaction', 'poster', 'xlink:href'].includes(name)
        && /^\s*(?:javascript|vbscript):/i.test(attribute.value)) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (isAutomaticResourceAttribute(element, name) && isBlockedSourceResource(attribute.value)) {
        recordProjectionWarning(projectionWarnings, attribute.value);
        element.removeAttribute(attribute.name);
      }
    }
  }
  const csp = doc.createElement('meta');
  csp.setAttribute('http-equiv', 'Content-Security-Policy');
  csp.setAttribute('content', [
    "default-src 'none'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline' data: blob:",
    "font-src 'self' data: blob:",
    "frame-src 'none'",
    "script-src 'none'",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'"
  ].join('; '));
  doc.head.prepend(csp);
}

function registerAssetBlobUrl(assetUrls, asset, data, createdUrls, mimeType = null) {
  const url = URL.createObjectURL(new Blob([data], { type: mimeType || asset.mimeType || 'application/octet-stream' }));
  createdUrls.push(url);
  registerAssetUrl(assetUrls, asset.normalizedPath, url);
}

function registerAssetUrl(assetUrls, path, url) {
  assetUrls.set(path, url);
  assetUrls.set(`assets/${path}`, url);
}

function prepareCssAssetUrls(cssAssets, assetUrls, projectionWarnings = []) {
  const assetsByPath = new Map();
  for (const asset of cssAssets) {
    assetsByPath.set(asset.normalizedPath, asset);
    assetsByPath.set(`assets/${asset.normalizedPath}`, asset);
  }
  const resolving = new Set();
  const ensureCssUrl = (asset) => {
    const existing = assetUrls.get(asset.normalizedPath);
    if (existing) return existing;
    if (resolving.has(asset.normalizedPath)) return '';
    resolving.add(asset.normalizedPath);
    const css = new TextDecoder().decode(asset.data instanceof Uint8Array ? asset.data : new Uint8Array(asset.data || []));
    const rewritten = rewriteCssAssetUrls(
      css,
      asset.normalizedPath,
      assetUrls,
      (path) => {
        const dependency = assetsByPath.get(path) || assetsByPath.get(path.replace(/^assets\//, ''));
        return dependency ? ensureCssUrl(dependency) : '';
      },
      (value) => recordProjectionWarning(projectionWarnings, value)
    );
    const url = `data:text/css;charset=utf-8,${encodeURIComponent(rewritten)}`;
    registerAssetUrl(assetUrls, asset.normalizedPath, url);
    resolving.delete(asset.normalizedPath);
    return url;
  };
  for (const asset of cssAssets) ensureCssUrl(asset);
}

function isCssAsset(asset) {
  return asset.mimeType === 'text/css' || /\.css$/i.test(asset.normalizedPath || asset.path || '');
}

function isScriptAsset(asset) {
  return /(?:javascript|ecmascript)/i.test(asset.mimeType || '') || /\.(?:m?js|cjs)$/i.test(asset.normalizedPath || asset.path || '');
}

export function rewriteCssAssetUrls(css, basePath, assetUrls, resolveMissing = null, onUnresolved = null) {
  const rewriteReference = (value) => {
    const resolved = resolvedAssetUrl(value, basePath, assetUrls, resolveMissing);
    if (resolved) return `url("${resolved}")`;
    if (shouldReportResourceReference(value)) {
      onUnresolved?.(value);
      return 'url("data:,")';
    }
    return '';
  };
  return String(css || '')
    .replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi, (match, doubleQuoted, singleQuoted, unquoted) => {
      const value = doubleQuoted ?? singleQuoted ?? String(unquoted || '').trim();
      return rewriteReference(value) || match;
    })
    .replace(/@import\s+(["'])([^"']+)\1/gi, (match, quote, value) => {
      const rewritten = rewriteReference(value);
      return rewritten ? `@import ${rewritten}` : match;
    });
}

function resolvedAssetUrl(reference, basePath, assetUrls, resolveMissing = null) {
  const value = String(reference || '').trim();
  if (!isRelativeAssetUrl(value)) return '';
  const suffixIndex = value.search(/[?#]/);
  let pathPart = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
  const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : '';
  try {
    pathPart = decodeURIComponent(pathPart);
  } catch {
    return '';
  }
  const normalized = resolveRelativeAssetPath(basePath, pathPart);
  if (!normalized) return '';
  const direct = assetUrls.get(normalized)
    || assetUrls.get(normalized.replace(/^assets\//, ''))
    || resolveMissing?.(normalized)
    || resolveMissing?.(normalized.replace(/^assets\//, ''));
  return direct ? `${direct}${suffix.startsWith('#') ? suffix : ''}` : '';
}

function isAutomaticResourceAttribute(element, attribute) {
  const name = String(attribute || '').toLowerCase();
  if (name === 'src' || name === 'poster' || name === 'srcset' || name === 'xlink:href') return true;
  return name === 'href' && ['link', 'image', 'use'].includes(element?.localName);
}

function isBlockedSourceResource(value) {
  const reference = String(value || '').trim();
  if (!reference || reference.startsWith('#') || /^(?:data|blob):/i.test(reference)) return false;
  return !isRelativeAssetUrl(reference);
}

function shouldReportResourceReference(value) {
  const reference = String(value || '').trim();
  return Boolean(reference && !reference.startsWith('#') && !/^(?:data|blob):/i.test(reference));
}

function recordProjectionWarning(warnings, value) {
  const label = String(value || '').trim().replace(/\s+/g, ' ').slice(0, 160);
  if (label) warnings.push(label);
}

export function resolveRelativeAssetPath(basePath, reference) {
  const referencePath = String(reference || '').replaceAll('\\', '/');
  const base = normalizeAssetPath(basePath);
  const baseParts = base ? base.split('/').slice(0, -1) : [];
  const parts = referencePath.startsWith('/') ? [] : baseParts;
  for (const part of referencePath.replace(/^\/+/, '').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) return '';
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return normalizeAssetPath(parts.join('/'));
}

function normalizeAssetPath(value) {
  const path = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
  if (!path || path.split('/').some((part) => !part || part === '.' || part === '..')) return '';
  return path;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function normalizeHtmlForBrowserImport(sourceHtml, options = {}) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(sourceHtml || '<!doctype html><html><head></head><body></body></html>', 'text/html');
  const warnings = [];
  const title = doc.querySelector('title')?.textContent?.trim() || options.title || 'Imported document';
  const baseId = safeId(title || options.filename || 'document');
  doc.documentElement.dataset.resourceId = baseId;
  ensureBrowserMeta(doc);
  if (!doc.querySelector('title')) {
    const titleEl = doc.createElement('title');
    titleEl.textContent = title;
    doc.head.append(titleEl);
  }
  const scriptCount = doc.querySelectorAll('script').length;
  let handlerCount = 0;
  doc.querySelectorAll('*').forEach((element) => {
    for (const attr of Array.from(element.attributes)) {
      if (/^on/i.test(attr.name)) {
        handlerCount += 1;
      } else if ((attr.name === 'href' || attr.name === 'src') && /^\s*javascript:/i.test(attr.value)) {
        element.setAttribute(attr.name, '#');
        warnings.push(`Unsafe ${attr.name} URL was removed.`);
      } else if ((attr.name === 'href' || attr.name === 'src' || attr.name === 'poster') && isRelativeAssetUrl(attr.value)) {
        warnings.push(`Relative asset may need an .annotator.zip bundle to travel: ${attr.value}`);
      }
    }
  });
  const anchorReport = ensureBrowserAnchors(doc, baseId);
  warnings.push(...anchorReport.warnings);
  return {
    id: baseId,
    title,
    sourceHtml: `<!doctype html>\n${doc.documentElement.outerHTML}\n`,
    compatibility: browserCompatibilityReport(anchorReport, warnings, {
      interactiveSource: scriptCount > 0 || handlerCount > 0
    })
  };
}

function ensureBrowserMeta(doc) {
  if (!doc.querySelector('meta[charset]')) {
    const meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    doc.head.prepend(meta);
  }
  if (!doc.querySelector('meta[name="viewport"]')) {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1');
    doc.head.append(meta);
  }
  if (!doc.querySelector('meta[name="annotator-contract-version"]')) {
    const meta = doc.createElement('meta');
    meta.setAttribute('name', 'annotator-contract-version');
    meta.setAttribute('content', '1');
    doc.head.append(meta);
  }
}

function ensureBrowserAnchors(doc, baseId) {
  const seen = new Set();
  const warnings = [];
  let anchorCount = 0;
  let textAnchorCount = 0;
  for (const element of doc.querySelectorAll('*')) {
    const tagName = element.localName;
    const existing = element.getAttribute('data-anchor-id') || element.id;
    if (existing) {
      const unique = uniqueAnchorId(existing, seen);
      if (unique !== existing) warnings.push(`Duplicate anchor "${existing}" was renamed to "${unique}".`);
      if (ANCHORABLE_TAGS.has(tagName)) {
        element.setAttribute('data-anchor-id', unique);
        anchorCount += 1;
        if (TEXT_ANCHOR_TAGS.has(tagName)) textAnchorCount += 1;
      }
      continue;
    }
    if (!ANCHORABLE_TAGS.has(tagName)) continue;
    const text = element.textContent.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    const anchorId = uniqueAnchorId(`${baseId}-${tagName}-${safeAnchorSlug(text).slice(0, 48) || 'block'}-${shortHash(`${tagName}\n${text}`)}`, seen);
    element.setAttribute('data-anchor-id', anchorId);
    element.id = anchorId;
    anchorCount += 1;
    if (TEXT_ANCHOR_TAGS.has(tagName)) textAnchorCount += 1;
  }
  if (!anchorCount) warnings.push('No stable annotation anchors could be inferred.');
  return { anchorCount, textAnchorCount, warnings };
}

function browserCompatibilityReport(anchorReport, warnings, options = {}) {
  const hasBlocks = anchorReport.anchorCount > 0;
  const hasText = anchorReport.textAnchorCount > 0;
  return {
    contractVersion: 1,
    level: hasText ? 'L3' : hasBlocks ? 'L2' : 'L1',
    features: {
      display: true,
      blockNotes: hasBlocks,
      singleBlockTextHighlights: hasText,
      crossBlockTextHighlights: false,
      sideNotes: hasBlocks,
      focusMode: hasText,
      sourceNavigation: true,
      latexMath: true,
      inlineMedia: true,
      interactiveSource: Boolean(options.interactiveSource)
    },
    warnings: [...new Set(warnings)]
  };
}

function uniqueDocumentId(baseId, documents) {
  const used = new Set((documents || []).map((doc) => typeof doc === 'string' ? doc : doc.id));
  let candidate = safeId(baseId);
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${safeId(baseId)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function uniqueAnchorId(base, seen) {
  const normalized = String(base || 'anchor').trim() || 'anchor';
  let candidate = normalized;
  let suffix = 2;
  while (seen.has(candidate)) {
    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
  seen.add(candidate);
  return candidate;
}

function safeAnchorSlug(value) {
  return String(value || 'block')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || 'block';
}

function uniqueLibraryEntryId(base, entries) {
  const used = new Set((entries || []).map((entry) => entry.id));
  let candidate = safeId(base);
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${safeId(base)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function compareDocumentsForLibrary(a, b) {
  const created = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
  if (created) return created;
  return String(a.id || '').localeCompare(String(b.id || ''));
}

function shortHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0').slice(0, 8);
}

function isRelativeAssetUrl(value) {
  if (!value || value.startsWith('#')) return false;
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|data:|blob:)/i.test(value)) return false;
  return !value.startsWith('/');
}

function normalizeHydratedAnnotation(input) {
  return {
    id: String(input.id),
    docId: String(input.docId),
    target: input.target || { type: 'block' },
    targets: Array.isArray(input.targets) ? input.targets.map((target) => ({ ...target })) : [],
    highlight: {
      enabled: Boolean(input.highlight?.enabled),
      color: input.highlight?.color || 'yellow'
    },
    note: normalizeNoteForStorage(input.note),
    noteRef: input.noteRef || null,
    display: {
      mode: input.display?.mode || 'side',
      collapsed: input.display?.collapsed !== false
    },
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

export function normalizeNoteForStorage(note) {
  const inputBlocks = Array.isArray(note?.blocks) ? note.blocks : [];
  let blocks = inputBlocks.map(normalizeNoteBlockForStorage).filter(Boolean);
  if (!inputBlocks.length) {
    const legacyInk = encodeInkForStorage(note?.ink);
    if (String(note?.markdown || '') || !legacyInk.strokes?.length) {
      blocks.push({ type: 'text', markdown: String(note?.markdown || '') });
    }
    if (legacyInk.strokes?.length) blocks.push({ type: 'ink', ink: legacyInk });
  }
  blocks = assignStableNoteBlockIds(blocks);
  const firstText = blocks.find((block) => block.type === 'text');
  const firstInk = blocks.find((block) => block.type === 'ink');
  return {
    title: String(note?.title || ''),
    schemaVersion: NOTE_SCHEMA_VERSION,
    markdown: firstText?.markdown || '',
    ink: firstInk?.ink || encodeInkForStorage(inputBlocks.length ? null : note?.ink),
    blocks
  };
}

function normalizeNoteBlockForStorage(block) {
  const id = validNoteBlockId(block?.id) ? String(block.id) : '';
  if (block?.type === 'text') return { ...(id ? { id } : {}), type: 'text', markdown: String(block.markdown || '') };
  if (block?.type === 'ink') return { ...(id ? { id } : {}), type: 'ink', ink: encodeInkForStorage(block.ink) };
  if (block?.type === 'blank') return { ...(id ? { id } : {}), type: 'blank' };
  if (block?.type === 'image') {
    const assetPath = normalizeNoteImagePath(block.assetPath);
    const mimeType = noteImageMimeTypeForPath(assetPath);
    const intrinsicWidth = positiveInteger(block.intrinsicWidth);
    const intrinsicHeight = positiveInteger(block.intrinsicHeight);
    if (!assetPath
      || !mimeType
      || block.mimeType !== mimeType
      || !intrinsicWidth
      || !intrinsicHeight
      || intrinsicWidth * intrinsicHeight > NOTE_IMAGE_MAX_PIXELS) return null;
    return {
      ...(id ? { id } : {}),
      type: 'image',
      assetPath,
      mimeType,
      intrinsicWidth,
      intrinsicHeight,
      alt: String(block.alt || ''),
      originalName: sanitizeNoteImageFilename(block.originalName, mimeType)
    };
  }
  return null;
}

function assignStableNoteBlockIds(blocks) {
  const used = new Set();
  return blocks.map((block, index) => {
    let id = validNoteBlockId(block.id)
      ? String(block.id)
      : `blk_${shortHash(`${index}:${JSON.stringify(block)}`)}`;
    const base = id;
    let suffix = 2;
    while (used.has(id)) {
      id = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(id);
    return { ...block, id };
  });
}

function validNoteBlockId(value) {
  return typeof value === 'string'
    && /^blk_[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
}

function newNoteBlockId() {
  return `blk_${crypto.randomUUID()}`;
}

function safeId(value) {
  return String(value || 'document')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'document';
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('documentMetadata')) {
        const metadataStore = db.createObjectStore('documentMetadata', { keyPath: 'id' });
        if (db.objectStoreNames.contains('documents')) {
          const sourceStore = request.transaction.objectStore('documents');
          sourceStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (!cursor) return;
            const metadata = documentMetadataFromStoredDocument(cursor.value);
            if (metadata) metadataStore.put(metadata);
            cursor.continue();
          };
        }
      }
      if (!db.objectStoreNames.contains('annotations')) {
        const store = db.createObjectStore('annotations', { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
      }
      if (!db.objectStoreNames.contains('annotationBodies')) {
        const store = db.createObjectStore('annotationBodies', { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
      }
      if (!db.objectStoreNames.contains('documentNoteStats')) {
        db.createObjectStore('documentNoteStats', { keyPath: 'docId' });
      }
      if (!db.objectStoreNames.contains('documentAssets')) {
        const store = db.createObjectStore('documentAssets', { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
      }
      if (!db.objectStoreNames.contains('appMeta')) {
        db.createObjectStore('appMeta', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('documentFileHandles')) {
        db.createObjectStore('documentFileHandles', { keyPath: 'docId' });
      }
    };
    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
  });
  return dbPromise;
}

function readOne(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).get(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

function readAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

function readIndexAll(db, storeName, indexName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).index(indexName).getAll(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function readAndBackfillDocumentNoteStats(db, requestedDocIds = null) {
  const docIds = requestedDocIds
    ? [...new Set(requestedDocIds.map(String).filter(Boolean))]
    : (await readStoreKeys(db, 'documents')).map(String).filter(Boolean);
  if (!docIds.length) return new Map();

  // Warm Library enrichment is a readonly lookup against one small store. It
  // must not take write locks on Reader source or annotation data.
  const statsByDocId = await readCachedDocumentNoteStats(db, docIds);
  const missingDocIds = docIds.filter((docId) => !statsByDocId.has(docId));
  if (!missingDocIds.length) return statsByDocId;

  // A v3 -> v4 migration scans bodies only for cache misses, after first paint.
  // Keep that one-time write transaction scoped to annotation data and stats.
  const backfilled = await backfillDocumentNoteStats(db, missingDocIds);
  for (const [docId, stats] of backfilled) statsByDocId.set(docId, stats);
  return statsByDocId;
}

function readStoreKeys(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const request = tx.objectStore(storeName).getAllKeys();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

function readCachedDocumentNoteStats(db, docIds) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documentNoteStats', 'readonly');
    const store = tx.objectStore('documentNoteStats');
    const statsByDocId = new Map();
    for (const docId of docIds) {
      const request = store.get(docId);
      request.onsuccess = () => {
        if (isCurrentDocumentNoteStats(request.result, docId)) {
          statsByDocId.set(docId, normalizeDocumentNoteStats(request.result, docId));
        }
      };
    }
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.oncomplete = () => resolve(statsByDocId);
  });
}

function backfillDocumentNoteStats(db, docIds) {
  const storeNames = ['annotations', 'annotationBodies', 'documentNoteStats'];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    const statsByDocId = new Map();
    let callbackError = null;
    try {
      for (const docId of docIds) {
        queueDocumentNoteStatsBackfill(stores, docId, (stats) => {
          statsByDocId.set(docId, stats);
        });
      }
    } catch (error) {
      callbackError = error;
      try {
        tx.abort();
      } catch {
        reject(error);
      }
    }
    tx.onerror = () => reject(callbackError || tx.error);
    tx.onabort = () => reject(callbackError || tx.error);
    tx.oncomplete = () => resolve(statsByDocId);
  });
}

function mutateHydratedAnnotation(db, { docId, annotationId, nextAnnotation }) {
  const normalizedDocId = String(docId || '');
  const normalizedAnnotationId = String(annotationId || '');
  const storeNames = ['annotations', 'annotationBodies', 'documentNoteStats'];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    const annotationRequest = stores.annotations.get(normalizedAnnotationId);
    const bodyRequest = stores.annotationBodies.get(normalizedAnnotationId);
    const statsRequest = stores.documentNoteStats.get(normalizedDocId);
    const requests = [annotationRequest, bodyRequest, statsRequest];
    let pending = requests.length;
    let result = nextAnnotation ? undefined : false;
    let callbackError = null;
    let settled = false;

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error || new Error('The annotation transaction failed.'));
    };
    const abortWith = (error) => {
      callbackError = error;
      try {
        tx.abort();
      } catch {
        rejectOnce(error);
      }
    };
    const planAndWrite = () => {
      const previousMetadata = annotationRequest.result || null;
      const previousDocId = String(previousMetadata?.docId || '');
      if (previousMetadata && previousDocId !== normalizedDocId) {
        if (!nextAnnotation) return;
        throw new Error(`Annotation id already belongs to another document: ${normalizedAnnotationId}`);
      }
      if (!nextAnnotation && !previousMetadata) return;

      const previousBody = bodyRequest.result;
      const previous = previousMetadata
        ? {
          ...previousMetadata,
          note: String(previousBody?.docId || '') === normalizedDocId ? previousBody.note : null
        }
        : null;
      let next = null;
      if (nextAnnotation) {
        const { note, ...metadata } = nextAnnotation;
        const normalizedNote = normalizeNoteForStorage(note);
        next = { ...metadata, note: normalizedNote };
        stores.annotations.put({
          ...metadata,
          noteRef: {
            storage: 'indexeddb',
            version: 1
          }
        });
        stores.annotationBodies.put({
          id: normalizedAnnotationId,
          docId: normalizedDocId,
          note: normalizedNote,
          updatedAt: nextAnnotation.updatedAt || new Date().toISOString()
        });
      } else {
        stores.annotations.delete(normalizedAnnotationId);
        stores.annotationBodies.delete(normalizedAnnotationId);
        result = true;
      }

      if (!isCurrentDocumentNoteStats(statsRequest.result, normalizedDocId)) {
        queueDocumentNoteStatsBackfill(stores, normalizedDocId);
        return;
      }
      const stats = documentNoteStatsAfterReplacement(statsRequest.result, previous, next);
      if (documentNoteStatsNeedsLastEditRefresh(statsRequest.result, previous, next)) {
        const annotationsRequest = stores.annotations.index('docId').getAll(normalizedDocId);
        annotationsRequest.onsuccess = () => {
          stats.lastEditAt = latestAnnotationEditAt(annotationsRequest.result || []);
          stores.documentNoteStats.put(stats);
        };
        return;
      }
      stores.documentNoteStats.put(stats);
    };

    for (const request of requests) {
      request.onsuccess = () => {
        pending -= 1;
        if (pending !== 0) return;
        try {
          planAndWrite();
        } catch (error) {
          abortWith(error);
        }
      };
    }
    tx.onerror = () => rejectOnce(callbackError || tx.error);
    tx.onabort = () => rejectOnce(callbackError || tx.error);
    tx.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
  });
}

function insertNoteImageTransaction(db, {
  docId,
  annotationId,
  block,
  beforeBlockId = null,
  afterBlockId = null,
  asset
}) {
  if (!docId || !annotationId) return Promise.reject(new Error('Document and annotation ids are required.'));
  if (beforeBlockId && afterBlockId) return Promise.reject(new Error('Choose either a before or after picture boundary.'));
  const storeNames = ['annotations', 'annotationBodies', 'documentNoteStats', 'documentAssets'];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    const annotationRequest = stores.annotations.get(annotationId);
    const bodyRequest = stores.annotationBodies.get(annotationId);
    const statsRequest = stores.documentNoteStats.get(docId);
    const requests = [annotationRequest, bodyRequest, statsRequest];
    let pending = requests.length;
    let result = null;
    let callbackError = null;
    let settled = false;

    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error || new Error('The note picture transaction failed.'));
    };
    const abortWith = (error) => {
      callbackError = error;
      try {
        tx.abort();
      } catch {
        rejectOnce(error);
      }
    };
    const planAndWrite = () => {
      const metadata = annotationRequest.result;
      const body = bodyRequest.result;
      if (!metadata || String(metadata.docId || '') !== docId) {
        throw new Error(`Annotation not found: ${annotationId}`);
      }
      if (!body || String(body.docId || '') !== docId) {
        throw new Error(`Annotation body not found: ${annotationId}`);
      }
      const previous = normalizeHydratedAnnotation({ ...metadata, note: body.note });
      const blocks = insertNoteImageBlock(previous.note.blocks, block, { beforeBlockId, afterBlockId });
      const updatedAt = new Date().toISOString();
      const next = normalizeHydratedAnnotation({
        ...previous,
        note: { ...previous.note, schemaVersion: NOTE_SCHEMA_VERSION, blocks },
        updatedAt
      });
      const { note, ...nextMetadata } = next;
      stores.annotations.put({
        ...nextMetadata,
        noteRef: { storage: 'indexeddb', version: 1 }
      });
      stores.annotationBodies.put({
        id: annotationId,
        docId,
        note,
        updatedAt
      });
      stores.documentAssets.add(asset);
      result = next;

      if (!isCurrentDocumentNoteStats(statsRequest.result, docId)) {
        queueDocumentNoteStatsBackfill(stores, docId);
        return;
      }
      stores.documentNoteStats.put(documentNoteStatsAfterReplacement(statsRequest.result, previous, next));
    };

    for (const request of requests) {
      request.onsuccess = () => {
        pending -= 1;
        if (pending !== 0) return;
        try {
          planAndWrite();
        } catch (error) {
          abortWith(error);
        }
      };
    }
    tx.onerror = () => rejectOnce(callbackError || tx.error);
    tx.onabort = () => rejectOnce(callbackError || tx.error);
    tx.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
  });
}

function insertNoteImageBlock(blocks, block, { beforeBlockId = null, afterBlockId = null } = {}) {
  const current = Array.isArray(blocks) ? blocks.map((item) => ({ ...item })) : [];
  if (current.some((item) => item.id === block.id)) throw new Error(`Duplicate note block id: ${block.id}`);
  if (current.length === 1 && current[0].type === 'blank') return [block];
  let index = current.length;
  if (beforeBlockId) index = current.findIndex((item) => item.id === beforeBlockId);
  if (afterBlockId) {
    const neighborIndex = current.findIndex((item) => item.id === afterBlockId);
    index = neighborIndex < 0 ? -1 : neighborIndex + 1;
  }
  if (index < 0) throw new Error('The requested note insertion boundary no longer exists.');
  current.splice(index, 0, block);
  return current;
}

function sweepUnreferencedNoteImagesTransaction(db, docId) {
  const storeNames = ['annotationBodies', 'documentAssets'];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const bodiesRequest = tx.objectStore('annotationBodies').index('docId').getAll(docId);
    const assetsStore = tx.objectStore('documentAssets');
    const assetsRequest = assetsStore.index('docId').getAll(docId);
    let pending = 2;
    let deletedPaths = [];
    let callbackError = null;
    const finish = () => {
      pending -= 1;
      if (pending) return;
      try {
        const referenced = referencedNoteImagePaths((bodiesRequest.result || []).map((body) => ({ note: body.note })));
        deletedPaths = (assetsRequest.result || [])
          .filter((asset) => asset?.kind === NOTE_IMAGE_KIND && !referenced.has(asset.path))
          .map((asset) => asset.path);
        for (const path of deletedPaths) assetsStore.delete(`${docId}:${path}`);
      } catch (error) {
        callbackError = error;
        tx.abort();
      }
    };
    bodiesRequest.onsuccess = finish;
    assetsRequest.onsuccess = finish;
    tx.onerror = () => reject(callbackError || tx.error);
    tx.onabort = () => reject(callbackError || tx.error);
    tx.oncomplete = () => resolve(deletedPaths);
  });
}

function queueDocumentNoteStatsBackfill(stores, docId, onComplete = null) {
  const annotationsRequest = stores.annotations.index('docId').getAll(docId);
  const bodiesRequest = stores.annotationBodies.index('docId').getAll(docId);
  let pending = 2;
  const finish = () => {
    pending -= 1;
    if (pending) return;
    const stats = documentNoteStatsFromStoredRecords(
      docId,
      annotationsRequest.result || [],
      bodiesRequest.result || []
    );
    stores.documentNoteStats.put(stats);
    onComplete?.(stats);
  };
  annotationsRequest.onsuccess = finish;
  bodiesRequest.onsuccess = finish;
}

function writeImportTransaction(db, callback, identityHints = {}) {
  const storeNames = [
    'documents',
    'documentMetadata',
    'annotations',
    'annotationBodies',
    'documentNoteStats',
    'documentAssets',
    'appMeta'
  ];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    const libraryRequest = stores.appMeta.get(APP_META_CURRENT_LIBRARY);
    const storedDocumentIds = new Set();
    const storedAnnotationIds = new Set();
    const requests = [
      { request: libraryRequest },
      ...importIdentityRequests(stores.documents, identityHints.documentIds, storedDocumentIds),
      ...importIdentityRequests(stores.annotations, identityHints.annotationIds, storedAnnotationIds)
    ];
    let pending = requests.length;
    let result;
    let callbackError = null;
    let settled = false;
    const rejectOnce = (error) => {
      if (settled) return;
      settled = true;
      reject(error || new Error('The import transaction failed.'));
    };
    const planAndWrite = () => {
      try {
        result = callback({
          stores,
          storedDocumentIds: [...storedDocumentIds],
          storedAnnotationIds: [...storedAnnotationIds],
          currentLibrary: libraryRequest.result?.library || null
        });
      } catch (error) {
        callbackError = error;
        try {
          tx.abort();
        } catch {
          rejectOnce(error);
        }
      }
    };
    for (const { request, collect = null } of requests) {
      request.onsuccess = () => {
        collect?.(request.result || []);
        pending -= 1;
        if (pending === 0) planAndWrite();
      };
    }
    tx.onerror = () => rejectOnce(callbackError || tx.error);
    tx.onabort = () => rejectOnce(callbackError || tx.error);
    tx.oncomplete = () => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
  });
}

function importIdentityRequests(store, ids = [], collectedIds = new Set()) {
  const normalizedIds = [...new Set((ids || []).map(String).filter(Boolean))];
  if (normalizedIds.length > IMPORT_PREFIX_QUERY_LIMIT) {
    return [{
      request: store.getAllKeys(),
      collect(keys) {
        for (const key of keys || []) collectedIds.add(String(key));
      }
    }];
  }
  const requests = [];
  for (const id of normalizedIds) {
    const range = IDBKeyRange.bound(id, `${id}\uffff`);
    requests.push({
      request: store.getAllKeys(range),
      collect(keys) {
        for (const key of keys || []) collectedIds.add(String(key));
      }
    });
  }
  return requests;
}

function writeTransaction(db, storeNames, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.oncomplete = () => resolve();
    try {
      callback(stores);
    } catch (error) {
      try {
        tx.abort();
      } catch {
        // The transaction may already have failed; reject with the original cause.
      }
      reject(error);
    }
  });
}

function clearBrowserStateKeys(store, prefixes) {
  if (!store) return;
  const keys = [];
  for (let index = 0; index < store.length; index += 1) {
    const key = store.key(index);
    if (prefixes.some((prefix) => key?.startsWith(prefix))) keys.push(key);
  }
  for (const key of keys) store.removeItem(key);
}

function emptyDocumentNoteStats(docId) {
  return {
    docId: String(docId || ''),
    version: DOCUMENT_NOTE_STATS_VERSION,
    notes: 0,
    highlights: 0,
    ink: 0,
    lastEditAt: ''
  };
}

function normalizeDocumentNoteStats(record, docId = '') {
  const stats = emptyDocumentNoteStats(docId || record?.docId);
  stats.notes = nonnegativeInteger(record?.notes);
  stats.highlights = nonnegativeInteger(record?.highlights);
  stats.ink = nonnegativeInteger(record?.ink);
  stats.lastEditAt = String(record?.lastEditAt || '');
  return stats;
}

function isCurrentDocumentNoteStats(record, docId) {
  return String(record?.docId || '') === String(docId || '')
    && record?.version === DOCUMENT_NOTE_STATS_VERSION
    && Number.isInteger(record?.notes)
    && record.notes >= 0
    && Number.isInteger(record?.highlights)
    && record.highlights >= 0
    && Number.isInteger(record?.ink)
    && record.ink >= 0
    && typeof record?.lastEditAt === 'string';
}

function addAnnotationStatsContribution(stats, annotation, note, direction) {
  if (!annotation) return stats;
  if (annotation.highlight?.enabled) stats.highlights += direction;
  if (noteHasContent(note)) stats.notes += direction;
  if (noteHasInk(note)) stats.ink += direction;
  if (direction > 0) {
    stats.lastEditAt = maxIsoDate(stats.lastEditAt, annotationEditAt(annotation));
  }
  return stats;
}

function documentNoteStatsNeedsLastEditRefresh(current, previous, next) {
  if (!previous) return false;
  const previousEditAt = annotationEditAt(previous);
  if (!previousEditAt || previousEditAt !== String(current?.lastEditAt || '')) return false;
  return !next || annotationEditAt(next) < previousEditAt;
}

function annotationEditAt(annotation) {
  return String(annotation?.updatedAt || annotation?.createdAt || '');
}

function latestAnnotationEditAt(annotations) {
  let latest = '';
  for (const annotation of annotations || []) latest = maxIsoDate(latest, annotationEditAt(annotation));
  return latest;
}

function nonnegativeInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : 0;
}

function noteHasContent(note) {
  if (!note) return false;
  if (String(note.title || '').trim()) return true;
  if (String(note.markdown || '').trim()) return true;
  if (noteHasInk(note)) return true;
  return (note.blocks || []).some((block) => {
    if (block?.type === 'text') return Boolean(String(block.markdown || '').trim());
    if (block?.type === 'ink') return noteHasInk({ ink: block.ink });
    if (block?.type === 'image') return Boolean(normalizeNoteImagePath(block.assetPath));
    return block?.type === 'blank';
  });
}

function noteHasInk(note) {
  if (Array.isArray(note?.ink?.strokes) && note.ink.strokes.length > 0) return true;
  return (note?.blocks || []).some((block) => (
    block?.type === 'ink'
      && Array.isArray(block.ink?.strokes)
      && block.ink.strokes.length > 0
  ));
}

function maxIsoDate(a, b) {
  if (!a) return b || '';
  if (!b) return a || '';
  return String(a) > String(b) ? a : b;
}
