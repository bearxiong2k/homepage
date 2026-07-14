import {
  PACKAGE_LOCK_PATH as FOLDER_PACKAGE_LOCK_PATH,
  bundleArchiveBytesFromFolderFiles,
  bundleFolderFilesFromArchiveBytes,
  libraryArchiveBytesFromFolderFiles,
  libraryFolderFilesFromArchiveBytes,
  readBundleFolderFiles,
  readLibraryFolderFiles
} from './folder-package.js';

export const ANNOTATOR_BUNDLE_TYPES = [{
  description: 'Annotator source or library',
  accept: {
    'text/html': ['.html', '.htm'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip']
  }
}];
export const PACKAGE_LOCK_PATH = FOLDER_PACKAGE_LOCK_PATH;
const PACKAGE_LOCK_FORMAT = 'marginalia-package-lock';
const PACKAGE_LOCK_VERSION = 2;
const LEGACY_PACKAGE_LOCK_VERSION = 1;
const PACKAGE_TRANSACTION_PATH = '.marginalia-package-transaction.json';
const PACKAGE_TRANSACTION_FORMAT = 'marginalia-package-transaction';
const PACKAGE_TRANSACTION_VERSION = 1;
const PACKAGE_STAGE_PREFIX = '.marginalia-package-stage-';
const PACKAGE_STAGE_MARKER_PATH = '.marginalia-package-stage.json';
const MAX_DIRECTORY_FILES = 4096;
const MAX_DIRECTORY_TOTAL_BYTES = 1024 * 1024 * 1024;
const MAX_DIRECTORY_DEPTH = 32;
const MAX_PACKAGE_PATH_LENGTH = 1024;
const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder('utf-8', { fatal: true });

export function canUseFileSystemAccess() {
  return typeof window !== 'undefined'
    && typeof window.showOpenFilePicker === 'function'
    && typeof window.showSaveFilePicker === 'function';
}

export function canUseDirectoryAccess() {
  return typeof window !== 'undefined'
    && typeof window.showDirectoryPicker === 'function';
}

export async function pickAnnotatorBundleFile() {
  if (!canUseFileSystemAccess()) return null;
  const [handle] = await window.showOpenFilePicker({
    id: 'annotator-bundle-open',
    multiple: false,
    types: ANNOTATOR_BUNDLE_TYPES
  });
  return {
    file: await handle.getFile(),
    handle
  };
}

export async function pickAnnotatorBundleSaveHandle(suggestedName) {
  if (!canUseFileSystemAccess()) return null;
  return window.showSaveFilePicker({
    id: 'annotator-bundle-save',
    suggestedName,
    types: ANNOTATOR_BUNDLE_TYPES
  });
}

export async function pickAnnotatorPackageDirectory(id = 'annotator-package-open') {
  if (!canUseDirectoryAccess()) return null;
  return window.showDirectoryPicker({ id, mode: 'readwrite' });
}

export async function readFilesFromDirectoryHandle(directoryHandle) {
  return (await readValidatedPackageDirectory(directoryHandle)).files;
}

export async function readParsedPackageFromDirectoryHandle(directoryHandle, packageKind) {
  if (packageKind !== 'bundle' && packageKind !== 'library') {
    throw new Error(`Unsupported package kind: ${packageKind || '(missing)'}.`);
  }
  return (await readValidatedPackageDirectory(directoryHandle, packageKind)).parsed;
}

async function readValidatedPackageDirectory(directoryHandle, expectedKind = null) {
  if (!directoryHandle) throw new Error('No package folder was selected.');
  if (!(await ensureFileHandlePermission(directoryHandle, 'read'))) {
    throw new Error('Permission to read the selected folder was not granted.');
  }
  const pending = await readPackageTransaction(directoryHandle, true);
  const detectedKind = pending?.packageKind || await detectPackageKind(directoryHandle);
  if (expectedKind && detectedKind && detectedKind !== expectedKind) {
    throw new Error(`Selected folder is a ${detectedKind} package, not ${expectedKind}.`);
  }
  if (pending) {
    const files = await readableFilesForPendingTransaction(directoryHandle, pending);
    return {
      files,
      packageKind: detectedKind,
      parsed: await validatePackageFiles(files, detectedKind)
    };
  }
  if (!detectedKind) {
    const files = await readDirectoryFilesBounded(directoryHandle);
    if (!files.length) throw new Error('Selected folder is empty.');
    return {
      files,
      packageKind: expectedKind,
      parsed: expectedKind ? await validatePackageFiles(files, expectedKind) : null
    };
  }
  const lock = await readPackageLock(directoryHandle, true);
  const files = lock && Number(lock.formatVersion) === PACKAGE_LOCK_VERSION
    ? await readCurrentPackageFiles(directoryHandle, detectedKind)
    : await readDirectoryFilesBounded(directoryHandle);
  return {
    files,
    packageKind: detectedKind,
    parsed: await validatePackageFiles(files, detectedKind)
  };
}

export async function writeFilesToDirectoryHandle(directoryHandle, files) {
  if (!directoryHandle) throw new Error('No package folder is available.');
  if (!(await ensureFileHandlePermission(directoryHandle, 'readwrite'))) {
    throw new Error('Permission to write the package folder was not granted.');
  }
  await recoverPendingPackageTransaction(directoryHandle);
  const incomingFiles = normalizePackageFiles(files);
  const incomingLock = lockFromFiles(incomingFiles);
  if (Number(incomingLock.formatVersion) !== PACKAGE_LOCK_VERSION) {
    throw new Error('New package folder writes require the current package lock format.');
  }
  const packageKind = incomingLock.packageKind;
  await validatePackageFiles(incomingFiles, packageKind);
  assertIncomingManagedPaths(incomingFiles, incomingLock);
  const existing = await inspectWritablePackageDirectory(directoryHandle, packageKind);
  const oldManagedPaths = existing?.managedPaths || [];
  const transactionId = createTransactionId();
  const stageName = `${PACKAGE_STAGE_PREFIX}${transactionId}`;
  let stageHandle = null;
  try {
    stageHandle = await directoryHandle.getDirectoryHandle(stageName, { create: true });
    await writeJsonFileToDirectoryHandle(stageHandle, PACKAGE_STAGE_MARKER_PATH, {
      format: 'marginalia-package-stage',
      formatVersion: 1,
      transactionId
    });
    for (const file of incomingFiles) {
      await writeFileToDirectoryHandle(stageHandle, file.path, file.data);
    }
    const stagedFiles = await readStageFiles(directoryHandle, { transactionId, stageName, packageKind });
    assertSamePackageFiles(incomingFiles, stagedFiles);
    await validatePackageFiles(stagedFiles, packageKind);
  } catch (error) {
    if (stageHandle) await removeVerifiedStageDirectory(directoryHandle, stageName, transactionId).catch(() => {});
    throw error;
  }
  const transaction = {
    format: PACKAGE_TRANSACTION_FORMAT,
    formatVersion: PACKAGE_TRANSACTION_VERSION,
    transactionId,
    stageName,
    packageKind,
    oldManagedPaths,
    oldSourcePath: existing?.sourcePath || null,
    newManagedPaths: incomingFiles.map((file) => file.path),
    createdAt: new Date().toISOString()
  };
  try {
    await writeJsonFileToDirectoryHandle(directoryHandle, PACKAGE_TRANSACTION_PATH, transaction);
  } catch (error) {
    await removeVerifiedStageDirectory(directoryHandle, stageName, transactionId).catch(() => {});
    throw error;
  }
  try {
    await commitStagedPackage(directoryHandle, transaction, incomingFiles);
  } catch (error) {
    throw new Error('Package folder save was interrupted; the complete staged package will be recovered on the next open or save.', { cause: error });
  }
}

export async function assertWritablePackageDirectory(directoryHandle, packageKind) {
  if (!directoryHandle) throw new Error('No package folder is available.');
  const expectedSuffix = packageKind === 'library' ? '.annotator-library' : '.annotator-bundle';
  if (!(await ensureFileHandlePermission(directoryHandle, 'readwrite'))) {
    throw new Error('Permission to write the package folder was not granted.');
  }
  await recoverPendingPackageTransaction(directoryHandle);
  const entryNames = await rootEntryNames(directoryHandle);
  if (entryNames.every((name) => ignoredRootEntry(name))) return true;
  const existing = await inspectWritablePackageDirectory(directoryHandle, packageKind, true);
  if (existing) return true;
  throw new Error(`Choose an empty folder or an existing ${expectedSuffix} package folder, not a parent folder.`);
}

export function packageHandleNameMatches(handle, expectedName) {
  if (!handle?.name || !expectedName) return true;
  return handle.name === expectedName;
}

export async function archiveBytesFromPackageFiles(files, packageKind) {
  if (packageKind === 'library') return libraryArchiveBytesFromFolderFiles(files);
  if (packageKind === 'bundle') return bundleArchiveBytesFromFolderFiles(files);
  throw new Error(`Unsupported package kind: ${packageKind || '(missing)'}.`);
}

export async function packageFilesFromArchiveBytes(bytes, packageKind) {
  if (packageKind === 'library') return libraryFolderFilesFromArchiveBytes(bytes);
  if (packageKind === 'bundle') return bundleFolderFilesFromArchiveBytes(bytes);
  throw new Error(`Unsupported package kind: ${packageKind || '(missing)'}.`);
}

export async function readArchiveBytesFromPackageDirectory(directoryHandle, packageKind) {
  return archiveBytesFromPackageFiles(await readFilesFromDirectoryHandle(directoryHandle), packageKind);
}

export async function writeArchiveBytesToPackageDirectory(directoryHandle, bytes, packageKind) {
  const files = await packageFilesFromArchiveBytes(bytes, packageKind);
  await assertWritablePackageDirectory(directoryHandle, packageKind);
  await writeFilesToDirectoryHandle(directoryHandle, files);
  return files;
}

export async function writeBytesToFileHandle(handle, bytes, mimeType = 'application/zip') {
  if (!handle) throw new Error('No current file is available.');
  if (!(await ensureFileHandlePermission(handle, 'readwrite'))) {
    throw new Error('Permission to write the current file was not granted.');
  }
  const writable = await handle.createWritable();
  try {
    await writable.write(new Blob([bytes], { type: mimeType }));
  } finally {
    await writable.close();
  }
}

export async function ensureFileHandlePermission(handle, mode = 'readwrite') {
  if (!handle?.queryPermission || !handle?.requestPermission) return true;
  const options = { mode };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
}

export async function queryFileHandlePermissionState(handle, mode = 'readwrite') {
  if (!handle) return 'missing';
  if (!handle.queryPermission) return 'unknown';
  try {
    return await handle.queryPermission({ mode });
  } catch {
    return 'unknown';
  }
}

async function inspectWritablePackageDirectory(directoryHandle, expectedKind, requireExisting = false) {
  const names = await rootEntryNames(directoryHandle);
  if (names.every((name) => ignoredRootEntry(name))) return null;
  const detectedKind = await detectPackageKind(directoryHandle);
  if (!detectedKind) {
    if (requireExisting) return null;
    throw new Error('Selected folder is not an empty or valid Marginalia package folder.');
  }
  if (detectedKind !== expectedKind) {
    throw new Error(`Selected folder is a ${detectedKind} package, not ${expectedKind}.`);
  }
  const lock = await readPackageLock(directoryHandle, true);
  if (lock?.packageKind && lock.packageKind !== expectedKind) {
    throw new Error(`Selected folder is locked as a ${lock.packageKind} package, not ${expectedKind}.`);
  }
  const files = lock && Number(lock.formatVersion) === PACKAGE_LOCK_VERSION
    ? await readCurrentPackageFiles(directoryHandle, expectedKind)
    : await readDirectoryFilesBounded(directoryHandle);
  await validatePackageFiles(files, expectedKind);
  const manifest = jsonFromFile(files, expectedKind === 'library' ? 'library.json' : 'manifest.json');
  const sourcePath = expectedKind === 'bundle' ? normalizePackagePath(manifest.document?.sourcePath) : null;
  const provenPaths = files
    .map((file) => file.path)
    .filter((path) => path !== PACKAGE_LOCK_PATH && isPackageOwnedPath(path, expectedKind, sourcePath));
  const inventoriedPaths = lock && Number(lock.formatVersion) === PACKAGE_LOCK_VERSION
    ? normalizeManagedPaths(lock.managedPaths).filter((path) => isPackageOwnedPath(path, expectedKind, sourcePath))
    : [];
  return {
    packageKind: expectedKind,
    files,
    sourcePath,
    managedPaths: [...new Set([...provenPaths, ...inventoriedPaths, PACKAGE_LOCK_PATH])].sort()
  };
}

async function validatePackageFiles(files, packageKind) {
  if (packageKind === 'bundle') {
    return readBundleFolderFiles(files);
  }
  if (packageKind === 'library') {
    return readLibraryFolderFiles(files);
  }
  throw new Error(`Unsupported package kind: ${packageKind || '(missing)'}.`);
}

async function detectPackageKind(directoryHandle) {
  const names = new Set(await rootEntryNames(directoryHandle));
  const hasBundleMarker = names.has('manifest.json');
  const hasLibraryMarker = names.has('library.json');
  if (hasBundleMarker && hasLibraryMarker) throw new Error('Selected folder contains conflicting package markers.');
  const lock = names.has(PACKAGE_LOCK_PATH) ? await readPackageLock(directoryHandle) : null;
  const markerKind = hasLibraryMarker ? 'library' : hasBundleMarker ? 'bundle' : null;
  if (lock && markerKind && lock.packageKind !== markerKind) {
    throw new Error('Selected folder package lock does not match its package marker.');
  }
  return lock?.packageKind || markerKind;
}

async function readPackageLock(directoryHandle, optional = false) {
  let bytes = null;
  try {
    bytes = await readFileBytesAtPath(directoryHandle, PACKAGE_LOCK_PATH);
  } catch (error) {
    if (optional && isMissingHandleError(error)) return null;
    throw new Error('Selected folder package lock could not be opened.', { cause: error });
  }
  const lock = parseJsonBytes(bytes, 'Selected folder package lock');
  const version = Number(lock?.formatVersion);
  if (lock?.format !== PACKAGE_LOCK_FORMAT
    || (version !== LEGACY_PACKAGE_LOCK_VERSION && version !== PACKAGE_LOCK_VERSION)
    || (lock.packageKind !== 'bundle' && lock.packageKind !== 'library')) {
    throw new Error('Selected folder package lock is unsupported.');
  }
  if (version === PACKAGE_LOCK_VERSION) {
    const expectedFormat = lock.packageKind === 'library' ? 'annotator-library' : 'annotator-bundle';
    if (lock.packageFormat !== expectedFormat
      || !String(lock.packageId || '').trim()
      || !Array.isArray(lock.managedPaths)) {
      throw new Error('Selected folder package lock is incomplete.');
    }
    normalizeManagedPaths(lock.managedPaths);
  }
  return lock;
}

async function readCurrentPackageFiles(directoryHandle, packageKind) {
  const files = [];
  const state = { count: 0, totalBytes: 0 };
  await appendFileAtPath(directoryHandle, PACKAGE_LOCK_PATH, files, state, true);
  if (packageKind === 'library') {
    await appendFileAtPath(directoryHandle, 'library.json', files, state);
    await appendDirectoryAtPath(directoryHandle, 'bundles', files, state, true);
    return normalizePackageFiles(files);
  }
  await appendFileAtPath(directoryHandle, 'manifest.json', files, state);
  const manifest = jsonFromFile(files, 'manifest.json');
  const sourcePath = normalizePackagePath(manifest.document?.sourcePath);
  if (!sourcePath || sourcePath.includes('/')) throw new Error('Bundle folder marker has an invalid source path.');
  await appendFileAtPath(directoryHandle, 'annotations.json', files, state);
  await appendFileAtPath(directoryHandle, sourcePath, files, state);
  await appendFileAtPath(directoryHandle, 'quick-marks.json', files, state, true);
  await appendFileAtPath(directoryHandle, 'source-bookmarks.json', files, state, true);
  await appendDirectoryAtPath(directoryHandle, 'notes', files, state, true);
  await appendDirectoryAtPath(directoryHandle, 'assets', files, state, true);
  return normalizePackageFiles(files);
}

async function appendFileAtPath(directoryHandle, path, files, state, optional = false) {
  try {
    const fileHandle = await getFileHandleAtPath(directoryHandle, path);
    const file = await fileHandle.getFile();
    files.push(await fileRecord(path, file, state));
  } catch (error) {
    if (optional && isMissingHandleError(error)) return;
    throw error;
  }
}

async function appendDirectoryAtPath(directoryHandle, path, files, state, optional = false) {
  let handle = null;
  try {
    handle = await getDirectoryHandleAtPath(directoryHandle, path);
  } catch (error) {
    if (optional && isMissingHandleError(error)) return;
    throw error;
  }
  await readDirectoryIntoFiles(handle, path, files, state, 1);
}

async function readDirectoryFilesBounded(directoryHandle) {
  const files = [];
  await readDirectoryIntoFiles(directoryHandle, '', files, { count: 0, totalBytes: 0 }, 0);
  return normalizePackageFiles(files);
}

async function readDirectoryIntoFiles(directoryHandle, prefix, files, state, depth) {
  if (depth > MAX_DIRECTORY_DEPTH) throw new Error(`Package folder nesting exceeds ${MAX_DIRECTORY_DEPTH} levels.`);
  for await (const [name, handle] of directoryHandle.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (!normalizePackagePath(path)) throw new Error(`Invalid package path: ${path}.`);
    if (handle.kind === 'directory') {
      await readDirectoryIntoFiles(handle, path, files, state, depth + 1);
      continue;
    }
    if (handle.kind !== 'file') continue;
    const file = await handle.getFile();
    files.push(await fileRecord(path, file, state));
  }
}

async function fileRecord(path, file, state) {
  state.count += 1;
  if (state.count > MAX_DIRECTORY_FILES) throw new Error(`Package folder contains too many files (maximum ${MAX_DIRECTORY_FILES}).`);
  const declaredSize = Number(file.size);
  if (Number.isFinite(declaredSize) && declaredSize >= 0
    && state.totalBytes + declaredSize > MAX_DIRECTORY_TOTAL_BYTES) {
    throw new Error('Package folder data exceeds the supported size limit.');
  }
  const data = new Uint8Array(await file.arrayBuffer());
  state.totalBytes += data.length;
  if (state.totalBytes > MAX_DIRECTORY_TOTAL_BYTES) throw new Error('Package folder data exceeds the supported size limit.');
  return {
    path,
    data,
    lastModified: new Date(file.lastModified || Date.now())
  };
}

function normalizePackageFiles(files) {
  if (!Array.isArray(files)) throw new Error('Package files must be an array.');
  if (files.length > MAX_DIRECTORY_FILES) throw new Error(`Package folder contains too many files (maximum ${MAX_DIRECTORY_FILES}).`);
  const seen = new Set();
  let totalBytes = 0;
  return files.map((file) => {
    const path = normalizePackagePath(file?.path);
    if (!path || path !== file?.path) throw new Error(`Invalid package path: ${file?.path || '(missing)'}.`);
    const key = path.normalize('NFC');
    if (seen.has(key)) throw new Error(`Package folder contains duplicate file: ${path}.`);
    seen.add(key);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data || []);
    totalBytes += data.length;
    if (totalBytes > MAX_DIRECTORY_TOTAL_BYTES) throw new Error('Package folder data exceeds the supported size limit.');
    return { path, data, lastModified: file.lastModified || new Date() };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function normalizePackagePath(value) {
  if (typeof value !== 'string'
    || !value
    || value.length > MAX_PACKAGE_PATH_LENGTH
    || value.includes('\\')
    || value.startsWith('/')
    || value.endsWith('/')) return '';
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..' || /[\u0000-\u001f\u007f]/.test(part))) return '';
  return value;
}

function normalizeManagedPaths(paths) {
  if (!Array.isArray(paths)) throw new Error('Package lock managed paths must be an array.');
  const seen = new Set();
  const normalized = paths.map((value) => {
    const path = normalizePackagePath(value);
    if (!path || path !== value || path === PACKAGE_LOCK_PATH) throw new Error('Package lock contains an invalid managed path.');
    const key = path.normalize('NFC');
    if (seen.has(key)) throw new Error(`Package lock contains duplicate managed path: ${path}.`);
    seen.add(key);
    return path;
  });
  return normalized.sort();
}

function lockFromFiles(files) {
  const file = files.find((entry) => entry.path === PACKAGE_LOCK_PATH);
  if (!file) throw new Error(`Package files are missing ${PACKAGE_LOCK_PATH}.`);
  const lock = parseJsonBytes(file.data, 'Package lock');
  if (lock?.format !== PACKAGE_LOCK_FORMAT
    || (lock.packageKind !== 'bundle' && lock.packageKind !== 'library')) {
    throw new Error('Package files contain an unsupported package lock.');
  }
  return lock;
}

function assertIncomingManagedPaths(files, lock) {
  const expected = files.filter((file) => file.path !== PACKAGE_LOCK_PATH).map((file) => file.path).sort();
  const actual = normalizeManagedPaths(lock.managedPaths);
  if (actual.length !== expected.length || actual.some((path, index) => path !== expected[index])) {
    throw new Error('Package lock managed-path inventory does not match the files being written.');
  }
}

function isPackageOwnedPath(path, packageKind, sourcePath = null) {
  if (path === PACKAGE_LOCK_PATH) return true;
  if (packageKind === 'library') return path === 'library.json' || path.startsWith('bundles/');
  return path === 'manifest.json'
    || path === 'annotations.json'
    || path === 'quick-marks.json'
    || path === 'source-bookmarks.json'
    || path === sourcePath
    || /^notes\/[^/]+\.note\.json$/.test(path)
    || path.startsWith('assets/');
}

async function readableFilesForPendingTransaction(directoryHandle, transaction) {
  if (await directoryExists(directoryHandle, transaction.stageName)) {
    return readStageFiles(directoryHandle, transaction);
  }
  return readCurrentPackageFiles(directoryHandle, transaction.packageKind);
}

async function recoverPendingPackageTransaction(directoryHandle) {
  const transaction = await readPackageTransaction(directoryHandle, true);
  if (!transaction) return false;
  if (await directoryExists(directoryHandle, transaction.stageName)) {
    const stagedFiles = await readStageFiles(directoryHandle, transaction);
    await validatePackageFiles(stagedFiles, transaction.packageKind);
    await commitStagedPackage(directoryHandle, transaction, stagedFiles);
    return true;
  }
  const files = await readCurrentPackageFiles(directoryHandle, transaction.packageKind);
  await validatePackageFiles(files, transaction.packageKind);
  await removeFileAtPath(directoryHandle, PACKAGE_TRANSACTION_PATH);
  return true;
}

async function readPackageTransaction(directoryHandle, optional = false) {
  let bytes = null;
  try {
    bytes = await readFileBytesAtPath(directoryHandle, PACKAGE_TRANSACTION_PATH);
  } catch (error) {
    if (optional && isMissingHandleError(error)) return null;
    throw error;
  }
  const transaction = parseJsonBytes(bytes, 'Package transaction');
  if (transaction?.format !== PACKAGE_TRANSACTION_FORMAT
    || Number(transaction.formatVersion) !== PACKAGE_TRANSACTION_VERSION
    || !/^[a-zA-Z0-9_-]+$/.test(String(transaction.transactionId || ''))
    || transaction.stageName !== `${PACKAGE_STAGE_PREFIX}${transaction.transactionId}`
    || (transaction.packageKind !== 'bundle' && transaction.packageKind !== 'library')
    || !Array.isArray(transaction.oldManagedPaths)
    || !Array.isArray(transaction.newManagedPaths)) {
    throw new Error('Package folder transaction marker is invalid.');
  }
  transaction.oldManagedPaths = transaction.oldManagedPaths
    .map((path) => normalizePackagePath(path))
    .filter((path) => path && isPackageOwnedPath(path, transaction.packageKind, transaction.oldSourcePath || null));
  transaction.newManagedPaths = transaction.newManagedPaths.map((path) => {
    const normalized = normalizePackagePath(path);
    if (!normalized || normalized !== path) throw new Error('Package transaction contains an invalid new path.');
    return normalized;
  });
  return transaction;
}

async function readStageFiles(directoryHandle, transaction) {
  const stageHandle = await directoryHandle.getDirectoryHandle(transaction.stageName);
  const marker = parseJsonBytes(
    await readFileBytesAtPath(stageHandle, PACKAGE_STAGE_MARKER_PATH),
    'Package stage marker'
  );
  if (marker?.format !== 'marginalia-package-stage'
    || Number(marker.formatVersion) !== 1
    || marker.transactionId !== transaction.transactionId) {
    throw new Error('Package stage marker does not match its transaction.');
  }
  const files = (await readDirectoryFilesBounded(stageHandle))
    .filter((file) => file.path !== PACKAGE_STAGE_MARKER_PATH);
  return normalizePackageFiles(files);
}

async function commitStagedPackage(directoryHandle, transaction, incomingFiles) {
  const markerPath = transaction.packageKind === 'library' ? 'library.json' : 'manifest.json';
  const incomingByPath = new Map(incomingFiles.map((file) => [file.path, file]));
  for (const file of incomingFiles) {
    if (file.path === markerPath || file.path === PACKAGE_LOCK_PATH) continue;
    await writeFileToDirectoryHandle(directoryHandle, file.path, file.data);
  }
  for (const stalePath of transaction.oldManagedPaths) {
    if (incomingByPath.has(stalePath) || stalePath === markerPath || stalePath === PACKAGE_LOCK_PATH) continue;
    await removeFileAtPath(directoryHandle, stalePath);
  }
  const marker = incomingByPath.get(markerPath);
  const lock = incomingByPath.get(PACKAGE_LOCK_PATH);
  if (!marker || !lock) throw new Error('Staged package is missing its commit markers.');
  await writeFileToDirectoryHandle(directoryHandle, marker.path, marker.data);
  await writeFileToDirectoryHandle(directoryHandle, lock.path, lock.data);
  const writtenFiles = [];
  for (const file of incomingFiles) {
    writtenFiles.push({ path: file.path, data: await readFileBytesAtPath(directoryHandle, file.path) });
  }
  assertSamePackageFiles(incomingFiles, writtenFiles);
  await removeVerifiedStageDirectory(directoryHandle, transaction.stageName, transaction.transactionId);
  await removeFileAtPath(directoryHandle, PACKAGE_TRANSACTION_PATH);
}

async function removeVerifiedStageDirectory(directoryHandle, stageName, transactionId) {
  const stageHandle = await directoryHandle.getDirectoryHandle(stageName);
  const marker = parseJsonBytes(await readFileBytesAtPath(stageHandle, PACKAGE_STAGE_MARKER_PATH), 'Package stage marker');
  if (marker?.format !== 'marginalia-package-stage' || marker.transactionId !== transactionId) {
    throw new Error('Refusing to remove an unverified staging directory.');
  }
  await directoryHandle.removeEntry(stageName, { recursive: true });
}

function assertSamePackageFiles(expectedFiles, actualFiles) {
  const expected = normalizePackageFiles(expectedFiles);
  const actual = normalizePackageFiles(actualFiles);
  if (expected.length !== actual.length) throw new Error('Staged package file count does not match.');
  for (let index = 0; index < expected.length; index += 1) {
    if (expected[index].path !== actual[index].path || !equalBytes(expected[index].data, actual[index].data)) {
      throw new Error(`Staged package verification failed for ${expected[index].path}.`);
    }
  }
}

async function writeFileToDirectoryHandle(directoryHandle, path, data) {
  const normalizedPath = normalizePackagePath(path);
  if (!normalizedPath || normalizedPath !== path) throw new Error(`Invalid package path: ${path}.`);
  const parts = normalizedPath.split('/');
  const filename = parts.pop();
  let current = directoryHandle;
  for (const part of parts) current = await current.getDirectoryHandle(part, { create: true });
  const fileHandle = await current.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(new Blob([data instanceof Uint8Array ? data : new Uint8Array(data || [])]));
  } finally {
    await writable.close();
  }
}

async function writeJsonFileToDirectoryHandle(directoryHandle, path, value) {
  await writeFileToDirectoryHandle(directoryHandle, path, TEXT_ENCODER.encode(`${JSON.stringify(value, null, 2)}\n`));
}

async function getFileHandleAtPath(directoryHandle, path) {
  const parts = normalizePackagePath(path).split('/');
  if (!parts[0]) throw new Error(`Invalid package path: ${path}.`);
  const filename = parts.pop();
  let current = directoryHandle;
  for (const part of parts) current = await current.getDirectoryHandle(part);
  return current.getFileHandle(filename);
}

async function getDirectoryHandleAtPath(directoryHandle, path) {
  const parts = normalizePackagePath(path).split('/');
  if (!parts[0]) throw new Error(`Invalid package path: ${path}.`);
  let current = directoryHandle;
  for (const part of parts) current = await current.getDirectoryHandle(part);
  return current;
}

async function readFileBytesAtPath(directoryHandle, path) {
  const handle = await getFileHandleAtPath(directoryHandle, path);
  return new Uint8Array(await (await handle.getFile()).arrayBuffer());
}

async function removeFileAtPath(directoryHandle, path) {
  const normalizedPath = normalizePackagePath(path);
  if (!normalizedPath || normalizedPath !== path) throw new Error(`Invalid package path: ${path}.`);
  const parts = normalizedPath.split('/');
  const filename = parts.pop();
  let current = directoryHandle;
  try {
    for (const part of parts) current = await current.getDirectoryHandle(part);
    await current.removeEntry(filename);
  } catch (error) {
    if (!isMissingHandleError(error)) throw error;
  }
}

async function directoryExists(directoryHandle, name) {
  try {
    await directoryHandle.getDirectoryHandle(name);
    return true;
  } catch (error) {
    if (isMissingHandleError(error)) return false;
    throw error;
  }
}

async function rootEntryNames(directoryHandle) {
  const names = [];
  for await (const [name] of directoryHandle.entries()) names.push(name);
  return names;
}

function ignoredRootEntry(name) {
  return name === '.DS_Store';
}

function jsonFromFile(files, path) {
  const file = files.find((entry) => entry.path === path);
  if (!file) throw new Error(`Package folder is missing ${path}.`);
  return parseJsonBytes(file.data, path);
}

function parseJsonBytes(bytes, label) {
  try {
    return JSON.parse(TEXT_DECODER.decode(bytes));
  } catch (error) {
    throw new Error(`${label} is not valid JSON.`, { cause: error });
  }
}

function isMissingHandleError(error) {
  return error?.name === 'NotFoundError' || /not found/i.test(String(error?.message || ''));
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] !== b[index]) return false;
  }
  return true;
}

function createTransactionId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replaceAll('-', '');
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}
