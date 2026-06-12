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
const DB_VERSION = 2;
const APP_META_LAST_OPEN_DOCUMENT = 'lastOpenDocument';
const APP_META_CURRENT_LIBRARY = 'currentLibrary';
const APP_META_LOCAL_PROFILE = 'localProfile';
const ANCHORABLE_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'li', 'figure', 'figcaption', 'td', 'th', 'section', 'article']);
const TEXT_ANCHOR_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'li', 'figcaption', 'td', 'th']);
let dbPromise = null;

export function createStorageAdapter(options = {}) {
  return new IndexedDbStorageAdapter(options);
}

export class IndexedDbStorageAdapter {
  mode = 'indexeddb';
  blobUrls = new Map();

  async listDocuments() {
    const db = await openDb();
    const documents = await readAll(db, 'documents');
    return documents.map(normalizeStoredDocument);
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

  async getDocumentHtmlUrl(docId) {
    const db = await openDb();
    const doc = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!doc) throw new Error(`Document not found: ${docId}`);
    const oldUrl = this.blobUrls.get(docId);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    if (doc.sourceType === 'pdf') {
      const pdfUrl = URL.createObjectURL(new Blob([doc.sourceBytes || new Uint8Array()], { type: 'application/pdf' }));
      const viewerUrl = new URL('pdf-viewer.html', location.href);
      viewerUrl.searchParams.set('file', pdfUrl);
      viewerUrl.searchParams.set('embedded', 'reader');
      this.blobUrls.set(docId, pdfUrl);
      return viewerUrl.href;
    }
    const html = doc.sourceHtml || '';
    if (looksLikePdfText(html)) {
      const url = URL.createObjectURL(new Blob([corruptPdfImportHtml(doc)], { type: 'text/html' }));
      this.blobUrls.set(docId, url);
      return url;
    }
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    this.blobUrls.set(docId, url);
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
    const annotations = await this.getAnnotations(docId);
    return annotations.find((annotation) => annotation.id === annotationId) || null;
  }

  async getDocumentNoteStats(docIds = null) {
    const db = await openDb();
    const [annotations, bodies] = await Promise.all([
      readAll(db, 'annotations'),
      readAll(db, 'annotationBodies')
    ]);
    const allowedDocIds = Array.isArray(docIds) && docIds.length
      ? new Set(docIds.map((docId) => String(docId)))
      : null;
    const bodiesById = new Map(bodies.map((body) => [body.id, body]));
    const statsByDocId = new Map();
    for (const annotation of annotations) {
      const docId = String(annotation?.docId || '');
      if (!docId || (allowedDocIds && !allowedDocIds.has(docId))) continue;
      const note = normalizeNoteForStorage(bodiesById.get(annotation.id)?.note);
      const stats = statsByDocId.get(docId) || {
        notes: 0,
        highlights: 0,
        ink: 0,
        lastEditAt: ''
      };
      if (annotation.highlight?.enabled) stats.highlights += 1;
      if (noteHasContent(note)) stats.notes += 1;
      if (noteHasInk(note)) stats.ink += 1;
      stats.lastEditAt = maxIsoDate(stats.lastEditAt, annotation.updatedAt || annotation.createdAt || '');
      statsByDocId.set(docId, stats);
    }
    return statsByDocId;
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

  async deleteAnnotation(_docId, annotationId) {
    const db = await openDb();
    await writeTransaction(db, ['annotations', 'annotationBodies'], (stores) => {
      stores.annotations.delete(annotationId);
      stores.annotationBodies.delete(annotationId);
    });
    return true;
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
      'annotations',
      'annotationBodies',
      'documentAssets',
      'appMeta',
      'documentFileHandles'
    ], (stores) => {
      for (const store of Object.values(stores)) store.clear();
    });
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
    await writeTransaction(db, ['documents'], (stores) => {
      stores.documents.put(updated);
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
    await writeTransaction(db, ['documents'], (stores) => {
      stores.documents.put(updated);
    });
    return updated;
  }

  async exportDocumentBundle(docId) {
    const db = await openDb();
    const document = normalizeStoredDocument(await readOne(db, 'documents', docId));
    if (!document) throw new Error(`Document not found: ${docId}`);
    const annotations = await this.getAnnotations(docId);
    const assets = await readIndexAll(db, 'documentAssets', 'docId', docId);
    return createAnnotatorBundleArchive({
      document,
      sourceHtml: document.sourceHtml || '',
      sourceBytes: document.sourceBytes || null,
      annotations,
      assets
    });
  }

  async importDocument(file) {
    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    if (isPdfFile(file) || looksLikePdfBytes(sourceBytes)) return this.importPdfDocument(file, sourceBytes);
    const library = await this.getCurrentLibraryContext();
    const sourceHtml = new TextDecoder().decode(sourceBytes);
    const normalized = await normalizeHtmlForBrowserImport(sourceHtml, {
      filename: file.name || 'document.html',
      title: file.name ? file.name.replace(/\.html?$/i, '') : ''
    });
    const db = await openDb();
    const documents = await readAll(db, 'documents');
    const now = new Date().toISOString();
    const document = {
      id: uniqueDocumentId(normalized.id, documents),
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
    await writeTransaction(db, ['documents'], (stores) => {
      stores.documents.put(document);
    });
    if (library) await this.addDocumentToLibraryContext(library, document);
    return document;
  }

  async importDocumentBundle(file) {
    const bundle = await readAnnotatorBundleArchive(file);
    const library = await this.getCurrentLibraryContext();
    const document = await this.importBundleData(bundle);
    if (library) await this.addDocumentToLibraryContext(library, document);
    return document;
  }

  async importDocumentLibrary(file, options = {}) {
    if (isAnnotatorLibraryFilename(file?.name)) {
      const existing = await this.getCurrentLibraryContext();
      if (existing && !options.replaceCurrent) {
        throw new Error('Close or replace the current library before importing another library package.');
      }
    }
    const library = await readAnnotatorLibraryArchive(file);
    const entries = [];
    for (const entry of library.entries) {
      const bundle = await readAnnotatorBundleArchive(entry.data);
      const document = await this.importBundleData(bundle);
      entries.push({
        id: entry.id || document.id,
        docId: document.id,
        title: entry.title || document.title,
        folderId: entry.folderId || null,
        order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : entries.length,
        lastOpenedAt: entry.lastOpenedAt || ''
      });
    }
    const activeEntryId = library.manifest.activeEntryId && entries.some((entry) => entry.id === library.manifest.activeEntryId)
      ? library.manifest.activeEntryId
      : entries[0]?.id || null;
    const context = {
      id: library.manifest.id || `library-${crypto.randomUUID()}`,
      title: library.manifest.title || 'Annotator library',
      createdAt: library.manifest.createdAt || new Date().toISOString(),
      packageUpdatedAt: library.manifest.updatedAt || library.manifest.createdAt || '',
      activeEntryId,
      folders: library.manifest.folders || [],
      entries,
      updatedAt: new Date().toISOString()
    };
    await this.writeCurrentLibraryContext(context);
    const activeEntry = entries.find((entry) => entry.id === activeEntryId) || entries[0];
    return {
      document: activeEntry ? await this.getDocument(activeEntry.docId) : null,
      library: context
    };
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
      'annotations',
      'annotationBodies',
      'documentAssets',
      'documentFileHandles',
      'appMeta'
    ], (stores) => {
      stores.documents.delete(docId);
      stores.documentFileHandles.delete(docId);
      for (const annotation of annotations) stores.annotations.delete(annotation.id);
      for (const body of bodies) stores.annotationBodies.delete(body.id);
      for (const asset of assets) stores.documentAssets.delete(asset.id);
      if (lastOpen?.docId === docId) stores.appMeta.delete(APP_META_LAST_OPEN_DOCUMENT);
    });
    clearBrowserStateKeys(localStorage, [`reader-quick-marks:${docId}`, `reader-layout:${docId}`]);
    clearBrowserStateKeys(sessionStorage, [`reader-scroll:${docId}`]);
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

  async addDocumentToLibraryContext(library, document) {
    const entries = [...(library.entries || [])];
    const id = uniqueLibraryEntryId(document.id, entries);
    entries.push({
      id,
      docId: document.id,
      title: document.title || document.id,
      folderId: null,
      order: entries.length
    });
    await this.writeCurrentLibraryContext({
      ...library,
      activeEntryId: id,
      entries
    });
  }

  async importBundleData(bundle) {
    const document = normalizeDocumentFromBundle(bundle.document, bundle.sourceHtml, bundle.sourceBytes);
    const annotations = hydratedAnnotationsFromBundle(bundle).map((annotation) => normalizeHydratedAnnotation({
      ...annotation,
      docId: document.id
    }));
    const assets = (bundle.assets || []).map((asset) => ({
      id: `${document.id}:${asset.path}`,
      docId: document.id,
      path: asset.path,
      data: asset.data,
      mimeType: asset.mimeType || 'application/octet-stream'
    }));
    const db = await openDb();
    await writeTransaction(db, ['documents', 'annotations', 'annotationBodies', 'documentAssets'], (stores) => {
      stores.documents.put(document);
      for (const annotation of annotations) {
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
          docId: document.id,
          note: normalizeNoteForStorage(note),
          updatedAt: annotation.updatedAt || new Date().toISOString()
        });
      }
      for (const asset of assets) stores.documentAssets.put(asset);
    });
    return document;
  }

  async writeHydratedAnnotation(annotation) {
    const db = await openDb();
    const { note, ...metadata } = annotation;
    await writeTransaction(db, ['annotations', 'annotationBodies'], (stores) => {
      stores.annotations.put({
        ...metadata,
        noteRef: {
          storage: 'indexeddb',
          version: 1
        }
      });
      stores.annotationBodies.put({
        id: annotation.id,
        docId: annotation.docId,
        note: normalizeNoteForStorage(note),
        updatedAt: annotation.updatedAt || new Date().toISOString()
      });
    });
  }

  async importPdfDocument(file, bytes = null) {
    const library = await this.getCurrentLibraryContext();
    const sourceBytes = bytes || new Uint8Array(await file.arrayBuffer());
    const metadata = await pdfMetadataFromBytes(sourceBytes);
    const documents = await this.listDocuments();
    const now = new Date().toISOString();
    const title = file.name ? file.name.replace(/\.pdf$/i, '') : 'Imported PDF';
    const document = {
      id: uniqueDocumentId(safeId(title), documents),
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
    await writeTransaction(db, ['documents'], (stores) => {
      stores.documents.put(document);
    });
    if (library) await this.addDocumentToLibraryContext(library, document);
    return document;
  }
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

function normalizeDocumentFromBundle(document, sourceHtml, sourceBytes = null) {
  const now = new Date().toISOString();
  const sourceType = document?.sourceType || 'html';
  const compatibility = sourceType === 'pdf'
    ? normalizePdfCompatibility(document?.compatibility, document?.pages)
    : document?.compatibility || null;
  return {
    id: safeId(document?.id || document?.title || 'document'),
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
  let index = 0;
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
        if (!element.id || element.id !== unique) element.id = unique;
        anchorCount += 1;
        if (TEXT_ANCHOR_TAGS.has(tagName)) textAnchorCount += 1;
      }
      continue;
    }
    if (!ANCHORABLE_TAGS.has(tagName)) continue;
    const text = element.textContent.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    index += 1;
    const anchorId = uniqueAnchorId(`${baseId}-${tagName}-${safeId(text).slice(0, 48) || 'block'}-${shortHash(`${tagName}\n${text}\n${index}`)}`, seen);
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
  const used = new Set((documents || []).map((doc) => doc.id));
  let candidate = safeId(baseId);
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${safeId(baseId)}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function uniqueAnchorId(base, seen) {
  let candidate = safeId(base);
  let suffix = 2;
  while (seen.has(candidate)) {
    candidate = `${safeId(base)}-${suffix}`;
    suffix += 1;
  }
  seen.add(candidate);
  return candidate;
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

function normalizeNoteForStorage(note) {
  const blocks = Array.isArray(note?.blocks) ? note.blocks.map(normalizeNoteBlockForStorage).filter(Boolean) : [];
  const firstText = blocks.find((block) => block.type === 'text');
  const firstInk = blocks.find((block) => block.type === 'ink');
  return {
    title: note?.title || '',
    markdown: note?.markdown || firstText?.markdown || '',
    ink: firstInk?.ink || encodeInkForStorage(note?.ink),
    blocks
  };
}

function normalizeNoteBlockForStorage(block) {
  if (block?.type === 'text') return { type: 'text', markdown: block.markdown || '' };
  if (block?.type === 'ink') return { type: 'ink', ink: encodeInkForStorage(block.ink) };
  if (block?.type === 'blank') return { type: 'blank' };
  return null;
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
      if (!db.objectStoreNames.contains('annotations')) {
        const store = db.createObjectStore('annotations', { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
      }
      if (!db.objectStoreNames.contains('annotationBodies')) {
        const store = db.createObjectStore('annotationBodies', { keyPath: 'id' });
        store.createIndex('docId', 'docId', { unique: false });
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

function writeTransaction(db, storeNames, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, 'readwrite');
    const stores = Object.fromEntries(storeNames.map((name) => [name, tx.objectStore(name)]));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
    tx.oncomplete = () => resolve();
    callback(stores);
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
