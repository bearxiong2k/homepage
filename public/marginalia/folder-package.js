import {
  createStoredZip,
  readAnnotatorBundleArchive,
  readStoredZip
} from './bundle.js';
import {
  createAnnotatorLibraryArchive,
  readAnnotatorLibraryArchive
} from './library-package.js';

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const BUNDLE_FOLDER_SUFFIX = '.annotator-bundle';
const LIBRARY_FOLDER_SUFFIX = '.annotator-library';
export const PACKAGE_LOCK_PATH = '.marginalia-package-lock.json';
const PACKAGE_LOCK_FORMAT = 'marginalia-package-lock';
const PACKAGE_LOCK_VERSION = 1;

export function bundleFolderNameForDocument(documentMeta) {
  return `${safeName(documentMeta?.title || documentMeta?.id || 'document')}${BUNDLE_FOLDER_SUFFIX}`;
}

export function libraryFolderNameForTitle(value) {
  return `${safeName(value || 'annotator-library')}${LIBRARY_FOLDER_SUFFIX}`;
}

export async function bundleFolderFilesFromArchiveBytes(bytes) {
  return withPackageLock(
    await validateBundleFolderFiles(readStoredZip(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))),
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
  return createStoredZip(await validateBundleFolderFiles(files));
}

export async function libraryArchiveBytesFromFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  validatePackageLock(cleanFiles, 'library');
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
  for (const entry of manifestEntries) {
    const directory = normalizeLibraryBundleDirectory(entry.filename || '');
    if (!directory) {
      throw new Error(`Library entry points to an unsupported bundle folder: ${entry.filename || ''}`);
    }
    if (!groups.has(directory)) throw new Error(`Library folder is missing ${directory}.`);
    orderedDirectories.push({ entry, directory });
    seenDirectories.add(directory);
  }
  for (const directory of [...groups.keys()].sort()) {
    if (!seenDirectories.has(directory)) orderedDirectories.push({ entry: null, directory });
  }
  const entries = [];
  for (const [index, item] of orderedDirectories.entries()) {
    const bundleBytes = await bundleArchiveBytesFromFolderFiles(groups.get(item.directory));
    const bundle = await readAnnotatorBundleArchive(bundleBytes);
    const id = safeName(item.entry?.id || bundle.document?.id || item.directory.split('/').pop()?.replace(new RegExp(`${escapeRegExp(BUNDLE_FOLDER_SUFFIX)}$`), '') || `bundle-${index + 1}`);
    const folderId = folderIds.has(item.entry?.folderId)
      ? item.entry.folderId
      : folderIdByPath.get(folderPathFromBundleDirectory(item.directory)) || null;
    const manifestEntry = {
      id,
      title: item.entry?.title || bundle.document?.title || id,
      order: Number.isFinite(Number(item.entry?.order)) ? Number(item.entry.order) : index,
      data: bundleBytes
    };
    if (folderId) manifestEntry.folderId = folderId;
    if (item.entry?.lastOpenedAt) manifestEntry.lastOpenedAt = String(item.entry.lastOpenedAt);
    entries.push(manifestEntry);
  }
  return createAnnotatorLibraryArchive({
    id: manifest.id || 'library',
    title: manifest.title || 'Annotator library',
    activeEntryId: entries.some((entry) => entry.id === manifest.activeEntryId) ? manifest.activeEntryId : entries[0]?.id,
    createdAt: manifest.createdAt,
    folders,
    entries
  });
}

async function validateBundleFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  validatePackageLock(cleanFiles, 'bundle');
  const packageFiles = cleanFiles.filter((file) => file.path !== PACKAGE_LOCK_PATH);
  const manifest = readJsonFile(packageFiles, 'manifest.json');
  if (manifest?.format !== 'annotator-bundle' || Number(manifest.formatVersion) !== 1) {
    throw new Error('Unsupported annotator bundle folder format.');
  }
  const sourcePath = normalizePackagePath(manifest.document?.sourcePath || 'source.html');
  const allowedFixed = new Set(['manifest.json', 'annotations.json', sourcePath]);
  for (const file of packageFiles) {
    if (allowedFixed.has(file.path)) continue;
    if (/^notes\/[^/]+\.note\.json$/.test(file.path)) continue;
    if (/^assets\/.+/.test(file.path)) continue;
    throw new Error(`Bundle folder contains unsupported file: ${file.path}`);
  }
  await readAnnotatorBundleArchive(createStoredZip(packageFiles));
  return packageFiles;
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
  const seen = new Set();
  const cleanFiles = [];
  for (const file of files || []) {
    const path = normalizePackagePath(file.path);
    if (!path || ignoredPath(path)) continue;
    if (seen.has(path)) throw new Error(`Package folder contains duplicate file: ${path}`);
    seen.add(path);
    cleanFiles.push({
      path,
      data: file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data || []),
      lastModified: file.lastModified || new Date()
    });
  }
  return cleanFiles.sort((a, b) => a.path.localeCompare(b.path));
}

function normalizePackagePath(value) {
  const path = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '').replace(/\/+/g, '/');
  if (!path || path === '.' || path.includes('/../') || path.startsWith('../') || path.endsWith('/..')) return '';
  if (path.split('/').some((part) => !part || part === '.' || part === '..')) return '';
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
  return JSON.parse(TEXT_DECODER.decode(file.data));
}

function validatePackageLock(files, packageKind) {
  const file = files.find((entry) => entry.path === PACKAGE_LOCK_PATH);
  if (!file) return;
  let lock = null;
  try {
    lock = JSON.parse(TEXT_DECODER.decode(file.data));
  } catch {
    throw new Error('Package folder lock file is not valid JSON.');
  }
  if (lock?.format !== PACKAGE_LOCK_FORMAT || Number(lock.formatVersion) !== PACKAGE_LOCK_VERSION) {
    throw new Error('Package folder lock file is unsupported.');
  }
  if (lock.packageKind !== packageKind) {
    throw new Error(`Package folder lock is for ${lock.packageKind || 'another package kind'}, not ${packageKind}.`);
  }
}

function withPackageLock(files, packageKind) {
  const cleanFiles = files.filter((file) => file.path !== PACKAGE_LOCK_PATH);
  return [
    textFile(PACKAGE_LOCK_PATH, JSON.stringify({
      format: PACKAGE_LOCK_FORMAT,
      formatVersion: PACKAGE_LOCK_VERSION,
      packageKind,
      packageFormat: packageKind === 'library' ? 'annotator-library' : 'annotator-bundle',
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
