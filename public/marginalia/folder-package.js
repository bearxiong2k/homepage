import {
  createStoredZip,
  readAnnotatorBundleFiles,
  readStoredZip
} from './bundle.js';
import {
  createAnnotatorLibraryArchive,
  readAnnotatorLibraryArchive
} from './library-package.js';

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });
const BUNDLE_FOLDER_SUFFIX = '.annotator-bundle';
const LIBRARY_FOLDER_SUFFIX = '.annotator-library';
export const PACKAGE_LOCK_PATH = '.marginalia-package-lock.json';
const PACKAGE_LOCK_FORMAT = 'marginalia-package-lock';
const PACKAGE_LOCK_VERSION = 2;
const LEGACY_PACKAGE_LOCK_VERSION = 1;
const MAX_FOLDER_FILES = 4096;
const MAX_FOLDER_TOTAL_BYTES = 1024 * 1024 * 1024;
const MAX_FOLDER_PATH_BYTES = 1024;

export function bundleFolderNameForDocument(documentMeta) {
  return `${safeName(documentMeta?.title || documentMeta?.id || 'document')}${BUNDLE_FOLDER_SUFFIX}`;
}

export function libraryFolderNameForTitle(value) {
  return `${safeName(value || 'annotator-library')}${LIBRARY_FOLDER_SUFFIX}`;
}

export async function bundleFolderFilesFromArchiveBytes(bytes) {
  return withPackageLock(
    parseBundleFolderFiles(readStoredZip(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))).files,
    'bundle'
  );
}

export async function libraryFolderFilesFromArchiveBytes(bytes) {
  const library = await readAnnotatorLibraryArchive(bytes);
  const folders = Array.isArray(library.manifest.folders) ? library.manifest.folders : [];
  const entries = [];
  const files = [];
  for (const [index, entry] of library.entries.entries()) {
    const id = safeName(entry.id || `bundle-${index + 1}`);
    const filename = libraryFolderEntryPath(entry, id);
    const manifestEntry = {
      id,
      title: entry.title || id,
      filename,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    };
    if (entry.folderId) manifestEntry.folderId = entry.folderId;
    if (entry.lastOpenedAt) manifestEntry.lastOpenedAt = String(entry.lastOpenedAt);
    entries.push(manifestEntry);
    const bundleFiles = await bundleFolderFilesFromArchiveBytes(entry.data);
    for (const file of bundleFiles) {
      files.push({
        path: `${filename}/${file.path}`,
        data: file.data,
        lastModified: file.lastModified || new Date()
      });
    }
  }
  const manifest = {
    ...library.manifest,
    folders,
    entries,
    activeEntryId: library.manifest.activeEntryId || entries[0]?.id || null,
    updatedAt: new Date().toISOString()
  };
  files.unshift(textFile('library.json', JSON.stringify(manifest, null, 2) + '\n'));
  return withPackageLock(files, 'library');
}

export async function bundleArchiveBytesFromFolderFiles(files) {
  return createStoredZip(parseBundleFolderFiles(files).files);
}

export function readBundleFolderFiles(files) {
  return parseBundleFolderFiles(files).bundle;
}

export function readLibraryFolderFiles(files) {
  return parseLibraryFolderFiles(files).library;
}

export async function libraryArchiveBytesFromFolderFiles(files) {
  const parsed = parseLibraryFolderFiles(files);
  const entries = parsed.library.entries.map(({ bundle, filename, ...entry }) => ({
    ...entry,
    data: createStoredZip(parsed.bundleFilesByDirectory.get(filename))
  }));
  return createAnnotatorLibraryArchive({
    id: parsed.library.manifest.id,
    title: parsed.library.manifest.title,
    activeEntryId: parsed.library.manifest.activeEntryId,
    createdAt: parsed.library.manifest.createdAt,
    folders: parsed.library.manifest.folders,
    entries
  });
}

function parseLibraryFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  const packageFiles = cleanFiles.filter((file) => file.path !== PACKAGE_LOCK_PATH);
  for (const file of packageFiles) {
    if (file.path === 'library.json') continue;
    if (file.path.startsWith('bundles/')) continue;
    throw new Error(`Library folder contains unsupported file: ${file.path}`);
  }
  const manifest = readJsonFile(packageFiles, 'library.json');
  if (manifest?.format !== 'annotator-library' || Number(manifest.formatVersion) !== 1) {
    throw new Error('Unsupported annotator library folder format.');
  }
  if (!Array.isArray(manifest.entries) || (manifest.folders !== undefined && !Array.isArray(manifest.folders))) {
    throw new Error('Library folder manifest has an invalid schema.');
  }
  validatePackageLock(cleanFiles, 'library', manifest);
  const groups = groupBundleDirectories(packageFiles);
  const folders = foldersWithBundleDirectories(
    normalizeLibraryFolders(manifest.folders || []),
    [...groups.keys()]
  );
  const folderIds = new Set(folders.map((folder) => folder.id));
  const folderIdByPath = invertMap(libraryFolderPathMap(folders));
  const manifestEntries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const orderedDirectories = [];
  const seenDirectories = new Set();
  const seenEntryIds = new Set();
  for (const entry of manifestEntries) {
    if (!entry || typeof entry !== 'object' || !String(entry.id || '').trim()) {
      throw new Error('Library folder contains an entry without a valid id.');
    }
    const id = String(entry.id);
    if (seenEntryIds.has(id)) throw new Error(`Library folder contains duplicate entry id: ${id}.`);
    seenEntryIds.add(id);
    const directory = normalizeLibraryBundleDirectory(entry.filename || '');
    if (!directory) {
      throw new Error(`Library entry points to an unsupported bundle folder: ${entry.filename || ''}`);
    }
    if (!groups.has(directory)) throw new Error(`Library folder is missing ${directory}.`);
    if (seenDirectories.has(directory)) throw new Error(`Library folder contains duplicate entry path: ${directory}.`);
    orderedDirectories.push({ entry, directory });
    seenDirectories.add(directory);
  }
  for (const directory of [...groups.keys()].sort()) {
    if (!seenDirectories.has(directory)) orderedDirectories.push({ entry: null, directory });
  }
  const entries = [];
  const bundleFilesByDirectory = new Map();
  const normalizedEntryIds = new Set();
  for (const [index, item] of orderedDirectories.entries()) {
    const parsedBundle = parseBundleFolderFiles(groups.get(item.directory));
    const bundle = parsedBundle.bundle;
    bundleFilesByDirectory.set(item.directory, parsedBundle.files);
    const id = safeName(item.entry?.id || bundle.document?.id || item.directory.split('/').pop()?.replace(new RegExp(`${escapeRegExp(BUNDLE_FOLDER_SUFFIX)}$`), '') || `bundle-${index + 1}`);
    if (normalizedEntryIds.has(id)) throw new Error(`Library folder contains colliding entry id: ${id}.`);
    normalizedEntryIds.add(id);
    const folderId = folderIds.has(item.entry?.folderId)
      ? item.entry.folderId
      : folderIdByPath.get(folderPathFromBundleDirectory(item.directory)) || null;
    const manifestEntry = {
      id,
      title: item.entry?.title || bundle.document?.title || id,
      order: Number.isFinite(Number(item.entry?.order)) ? Number(item.entry.order) : index,
      filename: item.directory,
      bundle
    };
    if (folderId) manifestEntry.folderId = folderId;
    if (item.entry?.lastOpenedAt) manifestEntry.lastOpenedAt = String(item.entry.lastOpenedAt);
    entries.push(manifestEntry);
  }
  const activeEntryId = entries.some((entry) => entry.id === manifest.activeEntryId)
    ? manifest.activeEntryId
    : entries[0]?.id || null;
  const normalizedManifest = {
    ...manifest,
    id: manifest.id || 'library',
    title: manifest.title || 'Annotator library',
    activeEntryId,
    folders,
    entries: entries.map(({ bundle, ...entry }) => entry)
  };
  return {
    bundleFilesByDirectory,
    library: {
      manifest: normalizedManifest,
      entries
    }
  };
}

function parseBundleFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  const packageFiles = cleanFiles.filter((file) => file.path !== PACKAGE_LOCK_PATH);
  const manifest = readJsonFile(packageFiles, 'manifest.json');
  if (manifest?.format !== 'annotator-bundle' || Number(manifest.formatVersion) !== 1) {
    throw new Error('Unsupported annotator bundle folder format.');
  }
  validatePackageLock(cleanFiles, 'bundle', manifest);
  const sourcePath = normalizePackagePath(manifest.document?.sourcePath || 'source.html');
  const allowedFixed = new Set(['manifest.json', 'annotations.json', 'quick-marks.json', sourcePath]);
  for (const file of packageFiles) {
    if (allowedFixed.has(file.path)) continue;
    if (/^notes\/[^/]+\.note\.json$/.test(file.path)) continue;
    if (/^assets\/.+/.test(file.path)) continue;
    throw new Error(`Bundle folder contains unsupported file: ${file.path}`);
  }
  return {
    files: packageFiles,
    bundle: readAnnotatorBundleFiles(packageFiles)
  };
}

function groupBundleDirectories(files) {
  const groups = new Map();
  for (const file of files) {
    if (file.path === 'library.json') continue;
    const parts = file.path.split('/');
    if (parts[0] !== 'bundles') throw new Error(`Library folder contains unsupported file: ${file.path}`);
    const bundleIndex = parts.findIndex((part, index) => index > 0 && part.endsWith(BUNDLE_FOLDER_SUFFIX));
    if (bundleIndex < 1 || bundleIndex >= parts.length - 1) {
      throw new Error(`Library folder contains unsupported file: ${file.path}`);
    }
    const directory = parts.slice(0, bundleIndex + 1).join('/');
    const relativePath = parts.slice(bundleIndex + 1).join('/');
    if (!groups.has(directory)) groups.set(directory, []);
    groups.get(directory).push({
      ...file,
      path: relativePath
    });
  }
  return groups;
}

function normalizeFolderFiles(files) {
  if (!Array.isArray(files)) throw new Error('Package folder files must be an array.');
  if (files.length > MAX_FOLDER_FILES) throw new Error(`Package folder contains too many files (maximum ${MAX_FOLDER_FILES}).`);
  const seen = new Set();
  const cleanFiles = [];
  let totalBytes = 0;
  for (const file of files || []) {
    const path = normalizePackagePath(file.path);
    if (!path || ignoredPath(path)) continue;
    if (TEXT_ENCODER.encode(path).length > MAX_FOLDER_PATH_BYTES) {
      throw new Error(`Package folder path is too long: ${path}.`);
    }
    const pathKey = path.normalize('NFC');
    if (seen.has(pathKey)) throw new Error(`Package folder contains duplicate file: ${path}`);
    seen.add(pathKey);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data || []);
    totalBytes += data.length;
    if (totalBytes > MAX_FOLDER_TOTAL_BYTES) throw new Error('Package folder data exceeds the supported size limit.');
    cleanFiles.push({
      path,
      data,
      lastModified: file.lastModified || new Date()
    });
  }
  return cleanFiles.sort((a, b) => a.path.localeCompare(b.path));
}

function normalizePackagePath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.startsWith('/') || value.endsWith('/')) return '';
  const path = value;
  if (path === '.' || path.includes('/../') || path.startsWith('../') || path.endsWith('/..')) return '';
  if (path.split('/').some((part) => !part || part === '.' || part === '..' || /[\u0000-\u001f\u007f]/.test(part))) return '';
  return path;
}

function ignoredPath(path) {
  return path === '.DS_Store'
    || path.endsWith('/.DS_Store')
    || path.startsWith('__MACOSX/');
}

function readJsonFile(files, path) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`Package folder is missing ${path}.`);
  try {
    return JSON.parse(TEXT_DECODER.decode(file.data));
  } catch (error) {
    throw new Error(`${path} is not valid JSON.`, { cause: error });
  }
}

function validatePackageLock(files, packageKind, manifest) {
  const file = files.find((entry) => entry.path === PACKAGE_LOCK_PATH);
  if (!file) return;
  let lock = null;
  try {
    lock = JSON.parse(TEXT_DECODER.decode(file.data));
  } catch {
    throw new Error('Package folder lock file is not valid JSON.');
  }
  const version = Number(lock?.formatVersion);
  if (lock?.format !== PACKAGE_LOCK_FORMAT
    || (version !== LEGACY_PACKAGE_LOCK_VERSION && version !== PACKAGE_LOCK_VERSION)) {
    throw new Error('Package folder lock file is unsupported.');
  }
  if (lock.packageKind !== packageKind) {
    throw new Error(`Package folder lock is for ${lock.packageKind || 'another package kind'}, not ${packageKind}.`);
  }
  if (version === LEGACY_PACKAGE_LOCK_VERSION) return;
  const expectedFormat = packageKind === 'library' ? 'annotator-library' : 'annotator-bundle';
  const packageId = packageIdFromManifest(manifest, packageKind);
  if (lock.packageFormat !== expectedFormat
    || !String(lock.packageId || '').trim()
    || String(lock.packageId) !== packageId
    || !Array.isArray(lock.managedPaths)) {
    throw new Error('Package folder lock does not match its package marker.');
  }
  const managedPaths = normalizeManagedPaths(lock.managedPaths);
  const markerPath = packageKind === 'library' ? 'library.json' : 'manifest.json';
  if (!managedPaths.includes(markerPath)) {
    throw new Error('Package folder lock does not manage its package marker.');
  }
}

function normalizeManagedPaths(paths) {
  const seen = new Set();
  const normalized = [];
  for (const value of paths) {
    const path = normalizePackagePath(value);
    if (!path || path !== value || path === PACKAGE_LOCK_PATH) {
      throw new Error('Package folder lock contains an invalid managed path.');
    }
    const key = path.normalize('NFC');
    if (seen.has(key)) throw new Error(`Package folder lock contains duplicate managed path: ${path}.`);
    seen.add(key);
    normalized.push(path);
  }
  return normalized.sort();
}

function packageIdFromManifest(manifest, packageKind) {
  const value = packageKind === 'library' ? manifest?.id : manifest?.document?.id;
  if (!String(value || '').trim()) throw new Error('Package marker is missing a stable package id.');
  return String(value);
}

function withPackageLock(files, packageKind) {
  const cleanFiles = normalizeFolderFiles(files.filter((file) => file.path !== PACKAGE_LOCK_PATH));
  const markerPath = packageKind === 'library' ? 'library.json' : 'manifest.json';
  const manifest = readJsonFile(cleanFiles, markerPath);
  return [
    textFile(PACKAGE_LOCK_PATH, JSON.stringify({
      format: PACKAGE_LOCK_FORMAT,
      formatVersion: PACKAGE_LOCK_VERSION,
      packageKind,
      packageFormat: packageKind === 'library' ? 'annotator-library' : 'annotator-bundle',
      packageId: packageIdFromManifest(manifest, packageKind),
      managedPaths: cleanFiles.map((file) => file.path),
      createdBy: 'Marginalia',
      updatedAt: new Date().toISOString()
    }, null, 2) + '\n'),
    ...cleanFiles
  ];
}

function textFile(path, text) {
  return { path, data: TEXT_ENCODER.encode(text), lastModified: new Date() };
}

function safeBundleFolderName(value) {
  const basename = String(value || 'bundle')
    .replaceAll('\\', '/')
    .split('/')
    .pop()
    .replace(/\.annotator\.zip$/i, '')
    .replace(/\.annotator-bundle$/i, '');
  return `${safeName(basename)}${BUNDLE_FOLDER_SUFFIX}`;
}

function libraryFolderEntryPath(entry, fallbackId) {
  const filename = normalizeLibraryBundleDirectory(entry?.filename || '');
  if (filename) return filename;
  return `bundles/${safeBundleFolderName(entry?.title || fallbackId || 'bundle')}`;
}

function normalizeLibraryBundleDirectory(value) {
  const path = normalizePackagePath(String(value || '').replace(/\.annotator\.zip$/i, BUNDLE_FOLDER_SUFFIX));
  if (!path.startsWith('bundles/') || !path.endsWith(BUNDLE_FOLDER_SUFFIX)) return '';
  return path;
}

function normalizeLibraryFolders(rawFolders = []) {
  const folders = [];
  const usedIds = new Set();
  const aliases = new Map();
  for (const [index, folder] of rawFolders.entries()) {
    const rawId = String(folder?.id || folder?.title || `folder-${index + 1}`);
    const id = uniqueSafeName(rawId, usedIds, 'folder');
    aliases.set(rawId, id);
    folders.push({
      id,
      title: String(folder?.title || rawId || id).trim() || id,
      parentId: folder?.parentId ? String(folder.parentId) : null,
      order: Number.isFinite(Number(folder?.order)) ? Number(folder.order) : index
    });
  }
  const ids = new Set(folders.map((folder) => folder.id));
  return folders.map((folder) => {
    const parentId = aliases.get(folder.parentId) || folder.parentId;
    return {
      ...folder,
      parentId: parentId && ids.has(parentId) && parentId !== folder.id ? parentId : null
    };
  });
}

function foldersWithBundleDirectories(baseFolders, directories) {
  const folders = [...baseFolders];
  const usedIds = new Set(folders.map((folder) => folder.id));
  const folderByPath = invertMap(libraryFolderPathMap(folders));
  for (const directory of directories.sort()) {
    const parts = folderPathFromBundleDirectory(directory).split('/').filter(Boolean);
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
    children.sort((a, b) => Number(a.order || 0) - Number(b.order || 0)
      || String(a.title || a.id || '').localeCompare(String(b.title || b.id || '')));
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

function folderPathFromBundleDirectory(directory) {
  const parts = normalizePackagePath(directory).split('/');
  if (parts[0] !== 'bundles' || parts.length <= 2) return '';
  return parts.slice(1, -1).join('/');
}

function safeName(value) {
  return String(value || 'package')
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || 'package';
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
