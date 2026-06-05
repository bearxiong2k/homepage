import { createStoredZip, readStoredZip } from './bundle.js';

const LIBRARY_FORMAT = 'annotator-library';
const LIBRARY_VERSION = 1;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export async function createAnnotatorLibraryArchive(libraryData = {}) {
  const now = new Date().toISOString();
  const entries = [];
  const files = [];
  for (const [index, entry] of (libraryData.entries || []).entries()) {
    const bytes = bytesFromBundleEntry(entry);
    if (!bytes.length) continue;
    const id = safeName(entry.id || entry.document?.id || `source-${index + 1}`);
    const bundleName = safeName(entry.title || entry.document?.title || entry.id || entry.document?.id || `source-${index + 1}`);
    const path = `bundles/${safeZipFilename(entry.filename || `${bundleName}.annotator.zip`)}`;
    entries.push({
      id,
      title: entry.title || entry.document?.title || id,
      filename: path,
      order: Number.isFinite(Number(entry.order)) ? Number(entry.order) : index
    });
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
  const entries = (manifest.entries || []).map((entry) => {
    const file = files.find((item) => item.path === entry.filename);
    if (!file) throw new Error(`Library package is missing ${entry.filename}.`);
    return {
      ...entry,
      data: file.data
    };
  });
  return {
    manifest,
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
