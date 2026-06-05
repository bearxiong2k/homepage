const BUNDLE_FORMAT = 'annotator-bundle';
const BUNDLE_VERSION = 1;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const CRC_TABLE = makeCrcTable();

export async function createAnnotatorBundleArchive(bundleData) {
  const files = bundleFiles(bundleData);
  return createStoredZip(files);
}

export async function readAnnotatorBundleArchive(input) {
  const bytes = input instanceof Uint8Array
    ? input
    : new Uint8Array(await input.arrayBuffer());
  const files = readStoredZip(bytes);
  const manifest = readJsonFile(files, 'manifest.json');
  if (manifest?.format !== BUNDLE_FORMAT || Number(manifest.formatVersion) !== BUNDLE_VERSION) {
    throw new Error('Unsupported annotator bundle format.');
  }
  const sourcePath = manifest.document?.sourcePath || 'source.html';
  const sourceFile = readFile(files, sourcePath);
  const isBinarySource = manifest.document?.sourceType === 'pdf' || /\.pdf$/i.test(sourcePath);
  const sourceHtml = isBinarySource ? '' : TEXT_DECODER.decode(sourceFile.data);
  const sourceBytes = isBinarySource ? sourceFile.data : null;
  const annotationsSidecar = readJsonFile(files, 'annotations.json');
  const annotations = Array.isArray(annotationsSidecar.annotations) ? annotationsSidecar.annotations : [];
  const notes = {};
  for (const entry of files) {
    if (!entry.path.startsWith('notes/') || !entry.path.endsWith('.note.json')) continue;
    const parsed = JSON.parse(TEXT_DECODER.decode(entry.data));
    const id = entry.path.slice('notes/'.length, -'.note.json'.length);
    notes[id] = parsed.note || parsed;
  }
  const assets = files
    .filter((entry) => entry.path.startsWith('assets/') && !entry.path.endsWith('/'))
    .map((entry) => ({
      path: entry.path.slice('assets/'.length),
      data: entry.data,
      mimeType: mimeTypeForPath(entry.path)
    }));
  return {
    manifest,
    document: manifest.document,
    sourceHtml,
    sourceBytes,
    annotations,
    notes,
    assets
  };
}

export function downloadBytes(bytes, filename, mimeType = 'application/zip') {
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function bundleFilenameForDocument(documentMeta) {
  const id = safeBundleName(documentMeta?.id || documentMeta?.title || 'document');
  return `${id}.annotator.zip`;
}

export function hydratedAnnotationsFromBundle(bundle) {
  const notes = bundle.notes || {};
  return (bundle.annotations || []).map((annotation) => ({
    ...annotation,
    note: notes[annotation.id] || annotation.note || defaultNote()
  }));
}

export function bundleFiles(bundleData) {
  const now = new Date().toISOString();
  const documentMeta = {
    id: bundleData.document?.id || 'document',
    title: bundleData.document?.title || bundleData.document?.id || 'Untitled document',
    sourceType: bundleData.document?.sourceType || 'html',
    sourcePath: safeSourcePath(bundleData.document?.sourcePath, bundleData.document?.sourceType || 'html'),
    sourcePathEdited: Boolean(bundleData.document?.sourcePathEdited),
    pages: bundleData.document?.pages || null,
    compatibility: bundleData.document?.compatibility || null,
    createdAt: bundleData.document?.createdAt || now,
    updatedAt: bundleData.document?.updatedAt || now
  };
  const manifest = {
    format: BUNDLE_FORMAT,
    formatVersion: BUNDLE_VERSION,
    document: documentMeta,
    createdAt: bundleData.createdAt || now,
    exportedAt: now
  };
  const files = [
    textFile('manifest.json', JSON.stringify(manifest, null, 2) + '\n')
  ];
  if (documentMeta.sourceType === 'pdf') {
    files.push({
      path: documentMeta.sourcePath,
      data: bytesFromAsset({ data: bundleData.sourceBytes || bundleData.sourceData }),
      lastModified: new Date()
    });
  } else {
    files.push(textFile(documentMeta.sourcePath, bundleData.sourceHtml || ''));
  }
  const annotations = [];
  for (const annotation of bundleData.annotations || []) {
    const { note, ...metadata } = annotation;
    annotations.push({
      ...metadata,
      noteRef: {
        storage: 'bundle-note',
        version: 1
      }
    });
    files.push(textFile(`notes/${safeBundleName(annotation.id)}.note.json`, JSON.stringify({
      note: note || defaultNote(),
      updatedAt: annotation.updatedAt || now
    }, null, 2) + '\n'));
  }
  files.push(textFile('annotations.json', JSON.stringify({ annotations }, null, 2) + '\n'));
  for (const asset of bundleData.assets || []) {
    const path = normalizeBundlePath(asset.path);
    if (!path) continue;
    files.push({
      path: `assets/${path}`,
      data: bytesFromAsset(asset),
      lastModified: asset.updatedAt ? new Date(asset.updatedAt) : new Date()
    });
  }
  return files;
}

export function createStoredZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const pathBytes = TEXT_ENCODER.encode(file.path);
    const data = file.data instanceof Uint8Array ? file.data : TEXT_ENCODER.encode(String(file.data || ''));
    const crc = crc32(data);
    const { date, time } = dosDateTime(file.lastModified || new Date());
    const localHeader = concatBytes(
      u32(0x04034b50),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(pathBytes.length),
      u16(0),
      pathBytes
    );
    localParts.push(localHeader, data);
    const centralHeader = concatBytes(
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(time),
      u16(date),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(pathBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      pathBytes
    );
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }
  const centralDirectory = concatBytes(...centralParts);
  const localData = concatBytes(...localParts);
  const endRecord = concatBytes(
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDirectory.length),
    u32(localData.length),
    u16(0)
  );
  return concatBytes(localData, centralDirectory, endRecord);
}

export function readStoredZip(bytes) {
  const endOffset = findEndOfCentralDirectory(bytes);
  const fileCount = readU16(bytes, endOffset + 10);
  let cursor = readU32(bytes, endOffset + 16);
  const files = [];
  for (let index = 0; index < fileCount; index += 1) {
    if (readU32(bytes, cursor) !== 0x02014b50) throw new Error('Invalid ZIP central directory.');
    const compression = readU16(bytes, cursor + 10);
    if (compression !== 0) throw new Error('Only uncompressed annotator bundles are supported.');
    const compressedSize = readU32(bytes, cursor + 20);
    const pathLength = readU16(bytes, cursor + 28);
    const extraLength = readU16(bytes, cursor + 30);
    const commentLength = readU16(bytes, cursor + 32);
    const localOffset = readU32(bytes, cursor + 42);
    const path = TEXT_DECODER.decode(bytes.slice(cursor + 46, cursor + 46 + pathLength));
    const localPathLength = readU16(bytes, localOffset + 26);
    const localExtraLength = readU16(bytes, localOffset + 28);
    const dataStart = localOffset + 30 + localPathLength + localExtraLength;
    files.push({
      path,
      data: bytes.slice(dataStart, dataStart + compressedSize)
    });
    cursor += 46 + pathLength + extraLength + commentLength;
  }
  return files;
}

function readJsonFile(files, path) {
  return JSON.parse(readTextFile(files, path));
}

function readTextFile(files, path) {
  return TEXT_DECODER.decode(readFile(files, path).data);
}

function readFile(files, path) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`Bundle is missing ${path}.`);
  return file;
}

function textFile(path, text) {
  return { path, data: TEXT_ENCODER.encode(text), lastModified: new Date() };
}

function bytesFromAsset(asset) {
  if (asset.data instanceof Uint8Array) return asset.data;
  if (asset.contentBase64) return base64ToBytes(asset.contentBase64);
  if (typeof asset.content === 'string') return TEXT_ENCODER.encode(asset.content);
  return new Uint8Array();
}

function base64ToBytes(value) {
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(value, 'base64'));
}

function normalizeBundlePath(value) {
  const path = String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');
  if (!path || path.includes('..') || path.startsWith('.')) return '';
  return path;
}

function safeSourcePath(value, sourceType = 'html') {
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

function safeBundleName(value) {
  return String(value || 'document')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'document';
}

function defaultNote() {
  return { title: '', markdown: '', ink: { strokes: [] }, blocks: [] };
}

function mimeTypeForPath(path) {
  if (/\.png$/i.test(path)) return 'image/png';
  if (/\.jpe?g$/i.test(path)) return 'image/jpeg';
  if (/\.gif$/i.test(path)) return 'image/gif';
  if (/\.svg$/i.test(path)) return 'image/svg+xml';
  if (/\.css$/i.test(path)) return 'text/css';
  if (/\.js$/i.test(path)) return 'text/javascript';
  return 'application/octet-stream';
}

function findEndOfCentralDirectory(bytes) {
  const min = Math.max(0, bytes.length - 65557);
  for (let offset = bytes.length - 22; offset >= min; offset -= 1) {
    if (readU32(bytes, offset) === 0x06054b50) return offset;
  }
  throw new Error('Invalid ZIP: end of central directory not found.');
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function concatBytes(...parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function u16(value) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function u32(value) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value >>> 0, true);
  return bytes;
}

function readU16(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 2).getUint16(0, true);
}

function readU32(bytes, offset) {
  return new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0, true);
}
