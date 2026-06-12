import { createStoredZip, readStoredZip } from './bundle.js';

const LIBRARY_FORMAT = 'annotator-library';
const LIBRARY_VERSION = 1;
const LIBRARY_BUNDLE_ROOT = 'bundles';
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export async function createAnnotatorLibraryArchive(libraryData = {}) {
  const now = new Date().toISOString();
  const folders = normalizeLibraryFolders(libraryData.folders || []);
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderPathById = libraryFolderPathMap(folders);
  const entries = [];
  const files = [];
  for (const [index, entry] of (libraryData.entries || []).entries()) {
    const bytes = bytesFromBundleEntry(entry);
    if (!bytes.length) continue;
    const id = safeName(entry.id || entry.document?.id || `source-${index + 1}`);
    const bundleName = safeName(entry.title || entry.document?.title || entry.id || entry.document?.id || `source-${index + 1}`);
    const folderId = folderIds.has(entry.folderId) ? entry.folderId : null;
    const folderPath = folderId ? folderPathById.get(folderId) : '';
    const path = [LIBRARY_BUNDLE_ROOT, folderPath, safeZipFilename(entry.filename || `${bundleName}.annotator.zip`)]
      .filter(Boolean)
      .join('/');
    const manifestEntry = {
      id,
      title: entry.title || entry.document?.title || id,
      filename: path,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    };
    if (folderId) manifestEntry.folderId = folderId;
    if (entry.lastOpenedAt) manifestEntry.lastOpenedAt = String(entry.lastOpenedAt);
    entries.push(manifestEntry);
    files.push({ path, data: bytes, lastModified: new Date() });
  }
  const manifest = {
    format: LIBRARY_FORMAT,
    formatVersion: LIBRARY_VERSION,
    id: safeName(libraryData.id || libraryData.title || 'library'),
    title: libraryData.title || 'Annotator library',
    activeEntryId: libraryData.activeEntryId || entries[0]?.id || null,
    createdAt: libraryData.createdAt || now,
    updatedAt: now,
    folders,
    entries
  };
  files.unshift(textFile('library.json', JSON.stringify(manifest, null, 2) + '\n'));
  return createStoredZip(files);
}

export async function readAnnotatorLibraryArchive(input) {
  const bytes = input instanceof Uint8Array
    ? input
    : new Uint8Array(await input.arrayBuffer());
  const files = readStoredZip(bytes);
  const manifest = readJsonFile(files, 'library.json');
  if (manifest?.format !== LIBRARY_FORMAT || Number(manifest.formatVersion) !== LIBRARY_VERSION) {
    throw new Error('Unsupported annotator library format.');
  }
  const folders = foldersWithEntryPaths(
    normalizeLibraryFolders(manifest.folders || []),
    manifest.entries || []
  );
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderIdByPath = invertMap(libraryFolderPathMap(folders));
  const manifestEntries = (manifest.entries || []).map((entry, index) => {
    const filename = normalizePackagePath(entry.filename || '');
    if (!filename) throw new Error(`Library entry ${entry.id || index + 1} has an invalid filename.`);
    const inferredFolderId = folderIdByPath.get(entryFolderPath(filename)) || null;
    const folderId = folderIds.has(entry.folderId) ? entry.folderId : inferredFolderId;
    const normalizedEntry = {
      ...entry,
      filename,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    };
    if (folderId) normalizedEntry.folderId = folderId;
    if (entry.lastOpenedAt) normalizedEntry.lastOpenedAt = String(entry.lastOpenedAt);
    return normalizedEntry;
  });
  const normalizedManifest = {
    ...manifest,
    folders,
    entries: manifestEntries
  };
  const entries = manifestEntries.map((entry) => {
    const file = files.find((item) => item.path === entry.filename);
    if (!file) throw new Error(`Library package is missing ${entry.filename}.`);
    return {
      ...entry,
      data: file.data
    };
  });
  return {
    manifest: normalizedManifest,
    entries
  };
}

export function isAnnotatorLibraryFilename(name) {
  return /(?:\.|-)annotator-library\.zip$/i.test(String(name || ''));
}

export function libraryFilenameForTitle(value) {
  return `${safeName(value || 'annotator-library')}.annotator-library.zip`;
}

function readJsonFile(files, path) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`Library package is missing ${path}.`);
  return JSON.parse(TEXT_DECODER.decode(file.data));
}

function textFile(path, text) {
  return { path, data: TEXT_ENCODER.encode(text), lastModified: new Date() };
}

function bytesFromBundleEntry(entry) {
  if (entry?.data instanceof Uint8Array) return entry.data;
  if (entry?.bytes instanceof Uint8Array) return entry.bytes;
  return new Uint8Array();
}

function normalizeLibraryFolders(rawFolders = []) {
  const prepared = [];
  const idAliases = new Map();
  const usedIds = new Set();
  for (const [index, folder] of rawFolders.entries()) {
    const rawId = String(folder?.id || folder?.title || `folder-${index + 1}`);
    const id = uniqueSafeName(rawId, usedIds, 'folder');
    idAliases.set(rawId, id);
    prepared.push({
      id,
      title: String(folder?.title || rawId || id).trim() || id,
      parentId: folder?.parentId ? String(folder.parentId) : null,
      order: Number.isFinite(Number(folder?.order)) ? Number(folder.order) : index
    });
  }
  const foldersById = new Map(prepared.map((folder) => [folder.id, folder]));
  return prepared.map((folder) => {
    const parentId = idAliases.get(folder.parentId) || folder.parentId;
    return {
      ...folder,
      parentId: parentId && foldersById.has(parentId) && !folderCreatesCycle(folder.id, parentId, foldersById)
        ? parentId
        : null
    };
  });
}

function foldersWithEntryPaths(baseFolders = [], entries = []) {
  const folders = [...baseFolders];
  const usedIds = new Set(folders.map((folder) => folder.id));
  const folderByPath = invertMap(libraryFolderPathMap(folders));
  for (const entry of entries) {
    const parts = entryFolderPath(entry?.filename || '').split('/').filter(Boolean);
    let parentId = null;
    let path = '';
    for (const part of parts) {
      path = path ? `${path}/${part}` : part;
      if (!folderByPath.has(path)) {
        const id = uniqueSafeName(`folder-${path}`, usedIds, 'folder');
        folderByPath.set(path, id);
        folders.push({
          id,
          title: part,
          parentId,
          order: folders.filter((folder) => (folder.parentId || '') === (parentId || '')).length
        });
      }
      parentId = folderByPath.get(path);
    }
  }
  return folders;
}

function libraryFolderPathMap(folders = []) {
  const childrenByParent = new Map();
  for (const folder of folders) {
    const key = folder.parentId || '';
    if (!childrenByParent.has(key)) childrenByParent.set(key, []);
    childrenByParent.get(key).push(folder);
  }
  for (const children of childrenByParent.values()) {
    children.sort(compareFolderOrder);
  }
  const paths = new Map();
  const assignChildren = (parentId, parentPath) => {
    const usedSegments = new Set();
    for (const folder of childrenByParent.get(parentId || '') || []) {
      const segment = uniquePathSegment(folder.title || folder.id, usedSegments);
      const path = parentPath ? `${parentPath}/${segment}` : segment;
      paths.set(folder.id, path);
      assignChildren(folder.id, path);
    }
  };
  assignChildren(null, '');
  return paths;
}

function folderCreatesCycle(folderId, parentId, foldersById) {
  let current = parentId;
  const seen = new Set();
  while (current) {
    if (current === folderId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    current = foldersById.get(current)?.parentId || null;
  }
  return false;
}

function compareFolderOrder(a, b) {
  const order = Number(a.order || 0) - Number(b.order || 0);
  if (order) return order;
  return String(a.title || a.id || '').localeCompare(String(b.title || b.id || ''));
}

function entryFolderPath(filename) {
  const path = normalizePackagePath(filename);
  const parts = path.split('/');
  if (parts[0] !== LIBRARY_BUNDLE_ROOT || parts.length <= 2) return '';
  return parts.slice(1, -1).join('/');
}

function normalizePackagePath(value) {
  const path = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
  if (!path || path === '.' || path.includes('/../') || path.startsWith('../') || path.endsWith('/..')) return '';
  if (path.split('/').some((part) => !part || part === '.' || part === '..')) return '';
  return path;
}

function safeZipFilename(value) {
  const basename = String(value || 'bundle.annotator.zip')
    .replaceAll('\\', '/')
    .split('/')
    .pop()
    .replace(/\.annotator-bundle$/i, '.annotator.zip');
  const filename = safeName(basename);
  return /\.annotator\.zip$/i.test(filename) ? filename : `${filename}.annotator.zip`;
}

function safeName(value) {
  return String(value || 'library')
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || 'library';
}

function uniqueSafeName(value, used, fallback) {
  const base = safeName(value || fallback);
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function uniquePathSegment(value, used) {
  const base = safeName(value || 'folder');
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
}

function invertMap(map) {
  return new Map([...map.entries()].map(([key, value]) => [value, key]));
}
