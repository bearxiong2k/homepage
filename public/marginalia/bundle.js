const BUNDLE_FORMAT = 'annotator-bundle';
const BUNDLE_VERSION = 1;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();
const STRICT_TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });
const CRC_TABLE = makeCrcTable();
const ZIP_UTF8_FLAG = 0x0800;
const MAX_ZIP_ENTRIES = 4096;
const MAX_ZIP_TOTAL_BYTES = 1024 * 1024 * 1024;
const MAX_ZIP_PATH_BYTES = 1024;
const QUICK_MARK_FORMAT = 'annotator-quick-marks';
const QUICK_MARK_VERSION = 1;
const MAX_QUICK_MARKS = 8;
const QUICK_MARK_COLOR_COUNT = 5;

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
  validateBundleManifest(manifest);
  const sourcePath = normalizeArchivePath(manifest.document.sourcePath);
  const sourceFile = readFile(files, sourcePath);
  const isBinarySource = manifest.document.sourceType === 'pdf';
  if (isBinarySource && !looksLikePdfBytes(sourceFile.data)) {
    throw new Error('Bundle PDF source does not start with the expected PDF signature.');
  }
  if (!isBinarySource && looksLikePdfBytes(sourceFile.data)) {
    throw new Error('Bundle HTML source contains PDF bytes.');
  }
  const sourceHtml = isBinarySource ? '' : decodeUtf8(sourceFile.data, sourcePath);
  const sourceBytes = isBinarySource ? sourceFile.data : null;
  const annotationsSidecar = readJsonFile(files, 'annotations.json');
  if (!isPlainObject(annotationsSidecar) || !Array.isArray(annotationsSidecar.annotations)) {
    throw new Error('Bundle annotations.json must contain an annotations array.');
  }
  const annotationIds = new Set();
  const annotations = annotationsSidecar.annotations.map((annotation, index) => {
    if (!isPlainObject(annotation) || !nonEmptyString(annotation.id)) {
      throw new Error(`Bundle annotation ${index + 1} is missing a valid id.`);
    }
    validateBundleAnnotation(annotation, index);
    const id = String(annotation.id);
    if (annotationIds.has(id)) throw new Error(`Bundle contains duplicate annotation id: ${id}.`);
    annotationIds.add(id);
    return annotation;
  });
  const noteFiles = new Map();
  for (const entry of files) {
    if (!entry.path.startsWith('notes/') || !entry.path.endsWith('.note.json')) continue;
    const parsed = parseJsonBytes(entry.data, entry.path);
    if (!isPlainObject(parsed)) throw new Error(`Bundle note ${entry.path} must be a JSON object.`);
    const note = Object.hasOwn(parsed, 'note') ? parsed.note : parsed;
    if (!isPlainObject(note)) throw new Error(`Bundle note ${entry.path} has an invalid note body.`);
    noteFiles.set(entry.path, note);
  }
  const notes = {};
  const referencedNotePaths = new Set();
  for (const annotation of annotations) {
    const notePath = notePathForAnnotation(annotation);
    if (referencedNotePaths.has(notePath)) {
      throw new Error(`Bundle annotations collide at note path: ${notePath}.`);
    }
    referencedNotePaths.add(notePath);
    if (!noteFiles.has(notePath)) throw new Error(`Bundle is missing ${notePath}.`);
    notes[annotation.id] = noteFiles.get(notePath);
  }
  for (const notePath of noteFiles.keys()) {
    if (!referencedNotePaths.has(notePath)) throw new Error(`Bundle contains an unreferenced note sidecar: ${notePath}.`);
  }
  const quickMarks = files.some((entry) => entry.path === 'quick-marks.json')
    ? readQuickMarksSidecar(readJsonFile(files, 'quick-marks.json'))
    : emptyQuickMarks();
  const assets = files
    .filter((entry) => entry.path.startsWith('assets/') && !entry.path.endsWith('/'))
    .map((entry) => ({
      path: entry.path.slice('assets/'.length),
      data: entry.data,
      mimeType: mimeTypeForPath(entry.path)
    }));
  const allowedFixedPaths = new Set(['manifest.json', 'annotations.json', 'quick-marks.json', sourcePath]);
  for (const entry of files) {
    if (allowedFixedPaths.has(entry.path)) continue;
    if (/^notes\/[^/]+\.note\.json$/.test(entry.path)) continue;
    if (/^assets\/.+/.test(entry.path)) continue;
    throw new Error(`Bundle contains unsupported file: ${entry.path}.`);
  }
  return {
    manifest,
    document: manifest.document,
    sourceHtml,
    sourceBytes,
    annotations,
    notes,
    assets,
    quickMarks
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
  if (!isPlainObject(bundleData) || !isPlainObject(bundleData.document)) {
    throw new Error('Bundle data must contain a document object.');
  }
  const sourceType = bundleData.document.sourceType || 'html';
  if (sourceType !== 'html' && sourceType !== 'pdf') throw new Error('Bundle data has an unsupported source type.');
  if (bundleData.annotations !== undefined && !Array.isArray(bundleData.annotations)) {
    throw new Error('Bundle annotations must be an array.');
  }
  const documentMeta = {
    id: bundleData.document?.id || 'document',
    title: bundleData.document?.title || bundleData.document?.id || 'Untitled document',
    sourceType,
    sourcePath: safeSourcePath(bundleData.document?.sourcePath, sourceType),
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
  const annotationIds = new Set();
  const notePaths = new Set();
  for (const annotation of bundleData.annotations || []) {
    if (!isPlainObject(annotation) || !nonEmptyString(annotation.id)) {
      throw new Error('Bundle annotations must each have a valid id.');
    }
    validateBundleAnnotation(annotation, annotations.length, false);
    const annotationId = String(annotation.id);
    if (annotationIds.has(annotationId)) throw new Error(`Bundle contains duplicate annotation id: ${annotationId}.`);
    annotationIds.add(annotationId);
    const notePath = `notes/${safeBundleName(annotationId)}.note.json`;
    if (notePaths.has(notePath)) throw new Error(`Bundle annotation ids collide at note path: ${notePath}.`);
    notePaths.add(notePath);
    const { note, ...metadata } = annotation;
    annotations.push({
      ...metadata,
      noteRef: {
        storage: 'bundle-note',
        version: 1,
        path: notePath
      }
    });
    files.push(textFile(notePath, JSON.stringify({
      note: note || defaultNote(),
      updatedAt: annotation.updatedAt || now
    }, null, 2) + '\n'));
  }
  files.push(textFile('annotations.json', JSON.stringify({ annotations }, null, 2) + '\n'));
  if (bundleData.quickMarks !== undefined) {
    const quickMarks = normalizeQuickMarks(bundleData.quickMarks);
    files.push(textFile('quick-marks.json', JSON.stringify({
      format: QUICK_MARK_FORMAT,
      formatVersion: QUICK_MARK_VERSION,
      marks: quickMarks.marks,
      colorIndex: quickMarks.colorIndex
    }, null, 2) + '\n'));
  }
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
  const normalizedFiles = normalizeZipFilesForWrite(files);
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of normalizedFiles) {
    const pathBytes = TEXT_ENCODER.encode(file.path);
    const data = file.data instanceof Uint8Array ? file.data : TEXT_ENCODER.encode(String(file.data || ''));
    const crc = crc32(data);
    const { date, time } = dosDateTime(file.lastModified || new Date());
    const localHeader = concatBytes(
      u32(0x04034b50),
      u16(20),
      u16(ZIP_UTF8_FLAG),
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
      u16(ZIP_UTF8_FLAG),
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
    u16(normalizedFiles.length),
    u16(normalizedFiles.length),
    u32(centralDirectory.length),
    u32(localData.length),
    u16(0)
  );
  return concatBytes(localData, centralDirectory, endRecord);
}

export function readStoredZip(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('Invalid ZIP: expected bytes.');
  if (bytes.length < 22) throw new Error('Invalid ZIP: file is truncated.');
  const endOffset = findEndOfCentralDirectory(bytes);
  ensureRange(bytes, endOffset, 22, 'ZIP end record');
  const diskNumber = readU16(bytes, endOffset + 4);
  const centralDisk = readU16(bytes, endOffset + 6);
  const diskFileCount = readU16(bytes, endOffset + 8);
  const fileCount = readU16(bytes, endOffset + 10);
  const centralSize = readU32(bytes, endOffset + 12);
  const centralOffset = readU32(bytes, endOffset + 16);
  const commentLength = readU16(bytes, endOffset + 20);
  if (endOffset + 22 + commentLength !== bytes.length) throw new Error('Invalid ZIP: trailing or truncated data.');
  if (diskNumber !== 0 || centralDisk !== 0 || diskFileCount !== fileCount) {
    throw new Error('Multi-disk ZIP archives are not supported.');
  }
  if (fileCount > MAX_ZIP_ENTRIES) throw new Error(`ZIP contains too many files (maximum ${MAX_ZIP_ENTRIES}).`);
  if (centralOffset > endOffset || centralSize > endOffset - centralOffset || centralOffset + centralSize !== endOffset) {
    throw new Error('Invalid ZIP central directory bounds.');
  }
  let cursor = centralOffset;
  const files = [];
  const seenPaths = new Set();
  const localRanges = [];
  let totalBytes = 0;
  for (let index = 0; index < fileCount; index += 1) {
    ensureRange(bytes, cursor, 46, 'ZIP central directory entry');
    if (readU32(bytes, cursor) !== 0x02014b50) throw new Error('Invalid ZIP central directory.');
    const flags = readU16(bytes, cursor + 8);
    const compression = readU16(bytes, cursor + 10);
    if (flags !== ZIP_UTF8_FLAG) throw new Error('Unsupported ZIP flags.');
    if (compression !== 0) throw new Error('Only uncompressed annotator bundles are supported.');
    const centralCrc = readU32(bytes, cursor + 16);
    const compressedSize = readU32(bytes, cursor + 20);
    const uncompressedSize = readU32(bytes, cursor + 24);
    const pathLength = readU16(bytes, cursor + 28);
    const extraLength = readU16(bytes, cursor + 30);
    const commentLength = readU16(bytes, cursor + 32);
    const diskStart = readU16(bytes, cursor + 34);
    const localOffset = readU32(bytes, cursor + 42);
    if (diskStart !== 0) throw new Error('Multi-disk ZIP archives are not supported.');
    if (compressedSize !== uncompressedSize) throw new Error('Invalid stored ZIP entry size.');
    if (!pathLength || pathLength > MAX_ZIP_PATH_BYTES) throw new Error('Invalid ZIP entry path length.');
    const centralEntryLength = 46 + pathLength + extraLength + commentLength;
    ensureRange(bytes, cursor, centralEntryLength, 'ZIP central directory entry');
    if (cursor + centralEntryLength > endOffset) throw new Error('Invalid ZIP central directory bounds.');
    const centralPathBytes = bytes.slice(cursor + 46, cursor + 46 + pathLength);
    const path = normalizeArchivePath(decodeUtf8(centralPathBytes, 'ZIP entry path'));
    const pathKey = path.normalize('NFC');
    if (seenPaths.has(pathKey)) throw new Error(`ZIP contains duplicate file path: ${path}.`);
    seenPaths.add(pathKey);
    totalBytes += uncompressedSize;
    if (totalBytes > MAX_ZIP_TOTAL_BYTES) throw new Error('ZIP uncompressed data exceeds the supported size limit.');

    ensureRange(bytes, localOffset, 30, 'ZIP local entry');
    if (localOffset >= centralOffset || readU32(bytes, localOffset) !== 0x04034b50) {
      throw new Error(`Invalid ZIP local header for ${path}.`);
    }
    const localFlags = readU16(bytes, localOffset + 6);
    const localCompression = readU16(bytes, localOffset + 8);
    const localCrc = readU32(bytes, localOffset + 14);
    const localCompressedSize = readU32(bytes, localOffset + 18);
    const localUncompressedSize = readU32(bytes, localOffset + 22);
    const localPathLength = readU16(bytes, localOffset + 26);
    const localExtraLength = readU16(bytes, localOffset + 28);
    if (!localPathLength || localPathLength > MAX_ZIP_PATH_BYTES) throw new Error(`Invalid ZIP local path for ${path}.`);
    const localHeaderLength = 30 + localPathLength + localExtraLength;
    ensureRange(bytes, localOffset, localHeaderLength, 'ZIP local entry');
    const dataStart = localOffset + 30 + localPathLength + localExtraLength;
    if (compressedSize > centralOffset - dataStart) throw new Error(`ZIP entry ${path} is truncated or overlaps metadata.`);
    const dataEnd = dataStart + compressedSize;
    const localPathBytes = bytes.slice(localOffset + 30, localOffset + 30 + localPathLength);
    const localPath = normalizeArchivePath(decodeUtf8(localPathBytes, 'ZIP local entry path'));
    if (localFlags !== flags
      || localCompression !== compression
      || localCrc !== centralCrc
      || localCompressedSize !== compressedSize
      || localUncompressedSize !== uncompressedSize
      || localPath !== path
      || !equalBytes(localPathBytes, centralPathBytes)) {
      throw new Error(`ZIP local and central headers disagree for ${path}.`);
    }
    const data = bytes.slice(dataStart, dataEnd);
    if (crc32(data) !== centralCrc) throw new Error(`ZIP CRC check failed for ${path}.`);
    localRanges.push({ start: localOffset, end: dataEnd, path });
    files.push({
      path,
      data
    });
    cursor += centralEntryLength;
  }
  if (cursor !== endOffset) throw new Error('Invalid ZIP central directory size or file count.');
  localRanges.sort((a, b) => a.start - b.start);
  for (let index = 1; index < localRanges.length; index += 1) {
    if (localRanges[index].start < localRanges[index - 1].end) {
      throw new Error(`ZIP local entries overlap at ${localRanges[index].path}.`);
    }
  }
  return files;
}

function readJsonFile(files, path) {
  return parseJsonBytes(readFile(files, path).data, path);
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
  try {
    return normalizeArchivePath(value);
  } catch {
    return '';
  }
}

function normalizeZipFilesForWrite(files) {
  if (!Array.isArray(files)) throw new Error('ZIP files must be an array.');
  if (files.length > MAX_ZIP_ENTRIES) throw new Error(`ZIP contains too many files (maximum ${MAX_ZIP_ENTRIES}).`);
  const seen = new Set();
  const normalized = [];
  let totalBytes = 0;
  for (const [index, file] of files.entries()) {
    const path = normalizeArchivePath(file?.path);
    const pathBytes = TEXT_ENCODER.encode(path);
    if (pathBytes.length > MAX_ZIP_PATH_BYTES || pathBytes.length > 0xffff) {
      throw new Error(`ZIP file ${index + 1} has a path that is too long.`);
    }
    const pathKey = path.normalize('NFC');
    if (seen.has(pathKey)) throw new Error(`ZIP contains duplicate file path: ${path}.`);
    seen.add(pathKey);
    const data = file?.data instanceof Uint8Array
      ? file.data
      : TEXT_ENCODER.encode(String(file?.data || ''));
    totalBytes += data.length;
    if (totalBytes > MAX_ZIP_TOTAL_BYTES) throw new Error('ZIP uncompressed data exceeds the supported size limit.');
    normalized.push({
      ...file,
      path,
      data
    });
  }
  return normalized;
}

function normalizeArchivePath(value) {
  if (typeof value !== 'string') throw new Error('ZIP entry path must be a string.');
  const path = value.replaceAll('\\', '/');
  if (!path || path.length > MAX_ZIP_PATH_BYTES || path.startsWith('/') || path.endsWith('/')) {
    throw new Error(`Invalid ZIP entry path: ${value || '(empty)'}.`);
  }
  const parts = path.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || /[\u0000-\u001f\u007f]/.test(part))) {
    throw new Error(`Invalid ZIP entry path: ${value}.`);
  }
  return path;
}

function validateBundleManifest(manifest) {
  if (!isPlainObject(manifest) || !isPlainObject(manifest.document)) {
    throw new Error('Bundle manifest must contain a document object.');
  }
  const documentMeta = manifest.document;
  if (!nonEmptyString(documentMeta.id) || !nonEmptyString(documentMeta.title)) {
    throw new Error('Bundle manifest document must have an id and title.');
  }
  if (documentMeta.sourceType !== 'html' && documentMeta.sourceType !== 'pdf') {
    throw new Error('Bundle manifest has an unsupported source type.');
  }
  const sourcePath = normalizeArchivePath(documentMeta.sourcePath);
  if (sourcePath.includes('/')) throw new Error('Bundle source must be stored at the package root.');
  if (documentMeta.sourceType === 'pdf' && !/\.pdf$/i.test(sourcePath)) {
    throw new Error('Bundle PDF source path must end in .pdf.');
  }
  if (documentMeta.sourceType === 'html' && !/\.html?$/i.test(sourcePath)) {
    throw new Error('Bundle HTML source path must end in .html or .htm.');
  }
}

function readQuickMarksSidecar(sidecar) {
  if (!isPlainObject(sidecar)
    || sidecar.format !== QUICK_MARK_FORMAT
    || Number(sidecar.formatVersion) !== QUICK_MARK_VERSION) {
    throw new Error('Unsupported bundle quick-mark format.');
  }
  return normalizeQuickMarks(sidecar);
}

function normalizeQuickMarks(value) {
  const record = Array.isArray(value) ? { marks: value } : value;
  if (!isPlainObject(record) || !Array.isArray(record.marks)) {
    throw new Error('Bundle quick marks must contain a marks array.');
  }
  if (record.marks.length > MAX_QUICK_MARKS) {
    throw new Error(`Bundle contains too many quick marks (maximum ${MAX_QUICK_MARKS}).`);
  }
  const ids = new Set();
  const marks = record.marks.map((mark, index) => {
    if (!isPlainObject(mark) || !nonEmptyString(mark.id) || !isPlainObject(mark.target)) {
      throw new Error(`Bundle quick mark ${index + 1} is invalid.`);
    }
    const id = String(mark.id);
    if (ids.has(id)) throw new Error(`Bundle contains duplicate quick-mark id: ${id}.`);
    ids.add(id);
    const color = Number(mark.colorIndex);
    return {
      id,
      target: mark.target,
      colorIndex: Number.isInteger(color) && color >= 0 ? color % QUICK_MARK_COLOR_COUNT : 0,
      label: String(mark.label || 'Quick mark').slice(0, 90)
    };
  });
  const color = Number(record.colorIndex);
  return {
    marks,
    colorIndex: Number.isInteger(color) && color >= 0 ? color % QUICK_MARK_COLOR_COUNT : 0
  };
}

function emptyQuickMarks() {
  return { marks: [], colorIndex: 0 };
}

function notePathForAnnotation(annotation) {
  const declared = annotation?.noteRef?.path;
  const path = declared == null || declared === ''
    ? `notes/${safeBundleName(annotation.id)}.note.json`
    : normalizeArchivePath(String(declared));
  if (!/^notes\/[^/]+\.note\.json$/.test(path)) {
    throw new Error(`Bundle annotation ${annotation.id} has an invalid note path.`);
  }
  return path;
}

function validateBundleAnnotation(annotation, index, validateNoteReference = true) {
  if (!validAnnotationTarget(annotation.target)) {
    throw new Error(`Bundle annotation ${index + 1} has an invalid target.`);
  }
  if (annotation.targets !== undefined) {
    if (!Array.isArray(annotation.targets) || annotation.targets.some((target) => !validAnnotationTarget(target))) {
      throw new Error(`Bundle annotation ${index + 1} has invalid attached targets.`);
    }
  }
  if (validateNoteReference && annotation.noteRef !== undefined && annotation.noteRef !== null) {
    const noteRef = annotation.noteRef;
    if (!isPlainObject(noteRef)
      || noteRef.storage !== 'bundle-note'
      || Number(noteRef.version) !== 1) {
      throw new Error(`Bundle annotation ${index + 1} has an invalid note reference.`);
    }
    if (noteRef.path !== undefined) notePathForAnnotation(annotation);
  }
}

function validAnnotationTarget(target) {
  if (!isPlainObject(target) || !['block', 'text', 'pdf-page-point', 'pdf-rect'].includes(target.type)) return false;
  const hasAnchor = nonEmptyString(target.anchorId) || nonEmptyString(target.domPath);
  const pageIndex = Number(target.pageIndex);
  const hasPage = Number.isInteger(pageIndex) && pageIndex >= 0;
  if (target.type === 'block') return hasAnchor;
  if (target.type === 'text') return hasAnchor || hasPage;
  if (!hasPage) return false;
  if (target.type === 'pdf-page-point') {
    return unitNumber(target.x) && unitNumber(target.y);
  }
  return isPlainObject(target.rect)
    && unitNumber(target.rect.x)
    && unitNumber(target.rect.y)
    && unitNumber(target.rect.width)
    && unitNumber(target.rect.height);
}

function unitNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 1;
}

function looksLikePdfBytes(bytes) {
  return bytes?.[0] === 0x25
    && bytes?.[1] === 0x50
    && bytes?.[2] === 0x44
    && bytes?.[3] === 0x46
    && bytes?.[4] === 0x2d;
}

function parseJsonBytes(bytes, path) {
  try {
    return JSON.parse(decodeUtf8(bytes, path));
  } catch (error) {
    if (error?.message?.startsWith('Invalid UTF-8')) throw error;
    throw new Error(`${path} is not valid JSON.`, { cause: error });
  }
}

function decodeUtf8(bytes, label) {
  try {
    return STRICT_TEXT_DECODER.decode(bytes);
  } catch (error) {
    throw new Error(`Invalid UTF-8 in ${label}.`, { cause: error });
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && Boolean(value.trim());
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
    if (readU32(bytes, offset) !== 0x06054b50) continue;
    const commentLength = readU16(bytes, offset + 20);
    if (offset + 22 + commentLength === bytes.length) return offset;
  }
  throw new Error('Invalid ZIP: end of central directory not found.');
}

function ensureRange(bytes, offset, length, label) {
  if (!Number.isSafeInteger(offset)
    || !Number.isSafeInteger(length)
    || offset < 0
    || length < 0
    || offset > bytes.length
    || length > bytes.length - offset) {
    throw new Error(`Invalid or truncated ${label}.`);
  }
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
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
