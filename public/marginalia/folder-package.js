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

export function bundleFolderNameForDocument(documentMeta) {
  return `${safeName(documentMeta?.title || documentMeta?.id || 'document')}${BUNDLE_FOLDER_SUFFIX}`;
}

export function libraryFolderNameForTitle(value) {
  return `${safeName(value || 'annotator-library')}${LIBRARY_FOLDER_SUFFIX}`;
}

export async function bundleFolderFilesFromArchiveBytes(bytes) {
  return validateBundleFolderFiles(readStoredZip(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)));
}

export async function libraryFolderFilesFromArchiveBytes(bytes) {
  const library = await readAnnotatorLibraryArchive(bytes);
  const entries = [];
  const files = [];
  for (const [index, entry] of library.entries.entries()) {
    const id = safeName(entry.id || `bundle-${index + 1}`);
    const folderName = safeBundleFolderName(entry.filename || entry.title || id);
    const filename = `bundles/${folderName}`;
    entries.push({
      id,
      title: entry.title || id,
      filename,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    });
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
    entries,
    activeEntryId: library.manifest.activeEntryId || entries[0]?.id || null,
    updatedAt: new Date().toISOString()
  };
  files.unshift(textFile('library.json', JSON.stringify(manifest, null, 2) + '\n'));
  return files;
}

export async function bundleArchiveBytesFromFolderFiles(files) {
  return createStoredZip(await validateBundleFolderFiles(files));
}

export async function libraryArchiveBytesFromFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  for (const file of cleanFiles) {
    if (file.path === 'library.json') continue;
    if (file.path.startsWith('bundles/')) continue;
    throw new Error(`Library folder contains unsupported file: ${file.path}`);
  }
  const manifest = readJsonFile(cleanFiles, 'library.json');
  if (manifest?.format !== 'annotator-library' || Number(manifest.formatVersion) !== 1) {
    throw new Error('Unsupported annotator library folder format.');
  }
  const groups = groupBundleDirectories(cleanFiles);
  const manifestEntries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const orderedDirectories = [];
  const seenDirectories = new Set();
  for (const entry of manifestEntries) {
    const directory = normalizePackagePath(entry.filename || '');
    if (!directory.startsWith('bundles/') || !directory.endsWith(BUNDLE_FOLDER_SUFFIX)) {
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
    entries.push({
      id,
      title: item.entry?.title || bundle.document?.title || id,
      order: Number.isFinite(Number(item.entry?.order)) ? Number(item.entry.order) : index,
      data: bundleBytes
    });
  }
  return createAnnotatorLibraryArchive({
    id: manifest.id || 'library',
    title: manifest.title || 'Annotator library',
    activeEntryId: entries.some((entry) => entry.id === manifest.activeEntryId) ? manifest.activeEntryId : entries[0]?.id,
    createdAt: manifest.createdAt,
    entries
  });
}

async function validateBundleFolderFiles(files) {
  const cleanFiles = normalizeFolderFiles(files);
  const manifest = readJsonFile(cleanFiles, 'manifest.json');
  if (manifest?.format !== 'annotator-bundle' || Number(manifest.formatVersion) !== 1) {
    throw new Error('Unsupported annotator bundle folder format.');
  }
  const sourcePath = normalizePackagePath(manifest.document?.sourcePath || 'source.html');
  const allowedFixed = new Set(['manifest.json', 'annotations.json', sourcePath]);
  for (const file of cleanFiles) {
    if (allowedFixed.has(file.path)) continue;
    if (/^notes\/[^/]+\.note\.json$/.test(file.path)) continue;
    if (/^assets\/.+/.test(file.path)) continue;
    throw new Error(`Bundle folder contains unsupported file: ${file.path}`);
  }
  await readAnnotatorBundleArchive(createStoredZip(cleanFiles));
  return cleanFiles;
}

function groupBundleDirectories(files) {
  const groups = new Map();
  for (const file of files) {
    if (file.path === 'library.json') continue;
    const match = file.path.match(/^bundles\/([^/]+\.annotator-bundle)\/(.+)$/);
    if (!match) throw new Error(`Library folder contains unsupported file: ${file.path}`);
    const directory = `bundles/${match[1]}`;
    const relativePath = match[2];
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

function safeName(value) {
  return String(value || 'package')
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || 'package';
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
