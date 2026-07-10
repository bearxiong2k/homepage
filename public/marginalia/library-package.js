import { createStoredZip, readAnnotatorBundleArchive, readStoredZip } from './bundle.js';

const LIBRARY_FORMAT = 'annotator-library';
const LIBRARY_VERSION = 1;
const LIBRARY_BUNDLE_ROOT = 'bundles';
const TEXT_ENCODER = new TextEncoder();
const STRICT_TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });

export async function createAnnotatorLibraryArchive(libraryData = {}) {
  const now = new Date().toISOString();
  const folders = normalizeLibraryFolders(libraryData.folders || []);
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderPathById = libraryFolderPathMap(folders);
  const preparedEntries = [];
  const usedEntryIds = new Set();
  for (const [index, entry] of (libraryData.entries || []).entries()) {
    const bytes = bytesFromBundleEntry(entry);
    if (!bytes.length) continue;
    await readAnnotatorBundleArchive(bytes);
    const id = safeName(entry.id || entry.document?.id || `source-${index + 1}`);
    if (usedEntryIds.has(id)) throw new Error(`Library contains duplicate entry id: ${id}.`);
    usedEntryIds.add(id);
    const bundleName = safeName(entry.title || entry.document?.title || entry.id || entry.document?.id || `source-${index + 1}`);
    const folderId = folderIds.has(entry.folderId) ? entry.folderId : null;
    const folderPath = folderId ? folderPathById.get(folderId) : '';
    const candidatePath = [LIBRARY_BUNDLE_ROOT, folderPath, safeZipFilename(entry.filename || `${bundleName}.annotator.zip`)]
      .filter(Boolean)
      .join('/');
    preparedEntries.push({ entry, index, bytes, id, folderId, candidatePath });
  }
  const allocatedPaths = allocateLibraryBundlePaths(preparedEntries);
  const entries = [];
  const files = [];
  for (const prepared of preparedEntries) {
    const { entry, index, bytes, id, folderId } = prepared;
    const path = allocatedPaths.get(prepared);
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
  const requestedActiveId = libraryData.activeEntryId ? safeName(libraryData.activeEntryId) : null;
  const manifest = {
    format: LIBRARY_FORMAT,
    formatVersion: LIBRARY_VERSION,
    id: safeName(libraryData.id || libraryData.title || 'library'),
    title: libraryData.title || 'Annotator library',
    activeEntryId: entries.some((entry) => entry.id === requestedActiveId) ? requestedActiveId : entries[0]?.id || null,
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
  validateLibraryManifest(manifest);
  const seenEntryIds = new Set();
  const seenEntryPaths = new Set();
  const preliminaryEntries = manifest.entries.map((entry, index) => {
    const id = String(entry.id);
    if (seenEntryIds.has(id)) throw new Error(`Library contains duplicate entry id: ${id}.`);
    seenEntryIds.add(id);
    const filename = normalizePackagePath(entry.filename || '');
    if (!filename || filename !== entry.filename || !isLibraryBundlePath(filename)) {
      throw new Error(`Library entry ${entry.id || index + 1} has an invalid filename.`);
    }
    const pathKey = filename.normalize('NFC');
    if (seenEntryPaths.has(pathKey)) throw new Error(`Library contains duplicate entry path: ${filename}.`);
    seenEntryPaths.add(pathKey);
    return { ...entry, filename };
  });
  const folders = foldersWithEntryPaths(
    normalizeLibraryFolders(manifest.folders || []),
    preliminaryEntries
  );
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderIdByPath = invertMap(libraryFolderPathMap(folders));
  const manifestEntries = preliminaryEntries.map((entry, index) => {
    const filename = entry.filename;
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
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const allowedFiles = new Set(['library.json', ...manifestEntries.map((entry) => entry.filename)]);
  for (const file of files) {
    if (!allowedFiles.has(file.path)) throw new Error(`Library package contains unsupported file: ${file.path}.`);
  }
  const entries = [];
  for (const entry of manifestEntries) {
    const file = filesByPath.get(entry.filename);
    if (!file) throw new Error(`Library package is missing ${entry.filename}.`);
    await readAnnotatorBundleArchive(file.data);
    entries.push({
      ...entry,
      data: file.data
    });
  }
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
  try {
    return JSON.parse(STRICT_TEXT_DECODER.decode(file.data));
  } catch (error) {
    throw new Error(`${path} is not valid JSON.`, { cause: error });
  }
}

function textFile(path, text) {
  return { path, data: TEXT_ENCODER.encode(text), lastModified: new Date() };
}

function bytesFromBundleEntry(entry) {
  if (entry?.data instanceof Uint8Array) return entry.data;
  if (entry?.bytes instanceof Uint8Array) return entry.bytes;
  return new Uint8Array();
}

function allocateLibraryBundlePaths(preparedEntries) {
  const candidateCounts = new Map();
  for (const item of preparedEntries) {
    const key = item.candidatePath.normalize('NFC');
    candidateCounts.set(key, (candidateCounts.get(key) || 0) + 1);
  }
  const allocated = new Map();
  const used = new Set();
  const ordered = [...preparedEntries].sort((a, b) => a.candidatePath.localeCompare(b.candidatePath)
    || a.id.localeCompare(b.id)
    || a.index - b.index);
  for (const item of ordered) {
    const collides = candidateCounts.get(item.candidatePath.normalize('NFC')) > 1;
    let path = collides ? bundlePathWithSuffix(item.candidatePath, item.id) : item.candidatePath;
    let suffix = 2;
    while (used.has(path.normalize('NFC'))) {
      path = bundlePathWithSuffix(item.candidatePath, `${item.id}-${suffix}`);
      suffix += 1;
    }
    used.add(path.normalize('NFC'));
    allocated.set(item, path);
  }
  return allocated;
}

function bundlePathWithSuffix(path, suffix) {
  const safeSuffix = safeName(suffix || 'entry');
  return path.replace(/\.annotator\.zip$/i, `--${safeSuffix}.annotator.zip`);
}

function validateLibraryManifest(manifest) {
  if (!isPlainObject(manifest)
    || !nonEmptyString(manifest.id)
    || !nonEmptyString(manifest.title)
    || !Array.isArray(manifest.entries)
    || (manifest.folders !== undefined && !Array.isArray(manifest.folders))) {
    throw new Error('Library manifest has an invalid schema.');
  }
  const normalizedEntryIds = new Set();
  for (const [index, entry] of manifest.entries.entries()) {
    if (!isPlainObject(entry) || !nonEmptyString(entry.id) || !nonEmptyString(entry.filename)) {
      throw new Error(`Library entry ${index + 1} has an invalid schema.`);
    }
    const normalizedId = safeName(entry.id);
    if (normalizedEntryIds.has(normalizedId)) {
      throw new Error(`Library contains colliding entry id: ${entry.id}.`);
    }
    normalizedEntryIds.add(normalizedId);
  }
  const folderIds = new Set();
  for (const [index, folder] of (manifest.folders || []).entries()) {
    if (!isPlainObject(folder) || !nonEmptyString(folder.id) || !nonEmptyString(folder.title)) {
      throw new Error(`Library folder ${index + 1} has an invalid schema.`);
    }
    const normalizedId = safeName(folder.id);
    if (folderIds.has(normalizedId)) throw new Error(`Library contains duplicate folder id: ${folder.id}.`);
    folderIds.add(normalizedId);
  }
  if (manifest.activeEntryId !== null
    && manifest.activeEntryId !== undefined
    && !manifest.entries.some((entry) => entry.id === manifest.activeEntryId)) {
    throw new Error('Library activeEntryId does not identify a manifest entry.');
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
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

function isLibraryBundlePath(filename) {
  const parts = filename.split('/');
  return parts[0] === LIBRARY_BUNDLE_ROOT
    && parts.length >= 2
    && /\.annotator\.zip$/i.test(parts.at(-1));
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
