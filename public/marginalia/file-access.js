export const ANNOTATOR_BUNDLE_TYPES = [{
  description: 'Annotator source or library',
  accept: {
    'text/html': ['.html', '.htm'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip']
  }
}];
export const PACKAGE_LOCK_PATH = '.marginalia-package-lock.json';
const PACKAGE_LOCK_FORMAT = 'marginalia-package-lock';
const PACKAGE_LOCK_VERSION = 1;

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
  if (!directoryHandle) throw new Error('No package folder was selected.');
  if (!(await ensureFileHandlePermission(directoryHandle, 'read'))) {
    throw new Error('Permission to read the selected folder was not granted.');
  }
  const files = [];
  await readDirectoryIntoFiles(directoryHandle, '', files);
  return files;
}

export async function writeFilesToDirectoryHandle(directoryHandle, files) {
  if (!directoryHandle) throw new Error('No package folder is available.');
  if (!(await ensureFileHandlePermission(directoryHandle, 'readwrite'))) {
    throw new Error('Permission to write the package folder was not granted.');
  }
  await clearDirectoryHandle(directoryHandle);
  for (const file of files || []) {
    await writeFileToDirectoryHandle(directoryHandle, file.path, file.data);
  }
}

export async function assertWritablePackageDirectory(directoryHandle, packageKind) {
  if (!directoryHandle) throw new Error('No package folder is available.');
  const expectedSuffix = packageKind === 'library' ? '.annotator-library' : '.annotator-bundle';
  const entries = [];
  if (!(await ensureFileHandlePermission(directoryHandle, 'readwrite'))) {
    throw new Error('Permission to write the package folder was not granted.');
  }
  for await (const [entryName] of directoryHandle.entries()) entries.push(entryName);
  if (entries.length === 0) return true;
  if (entries.includes(PACKAGE_LOCK_PATH)) {
    const lock = await readPackageLock(directoryHandle);
    if (lock.packageKind !== packageKind) {
      throw new Error(`Selected folder is locked as a ${lock.packageKind || 'different'} package, not ${packageKind}.`);
    }
    return true;
  }
  const expectedMarker = packageKind === 'library' ? 'library.json' : 'manifest.json';
  if (entries.includes(expectedMarker)) return true;
  throw new Error(`Choose an empty folder or an existing ${expectedSuffix} package folder, not a parent folder.`);
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

async function readPackageLock(directoryHandle) {
  if (!directoryHandle?.getFileHandle) {
    throw new Error('Selected folder has a package lock that cannot be read.');
  }
  let fileHandle = null;
  try {
    fileHandle = await directoryHandle.getFileHandle(PACKAGE_LOCK_PATH);
  } catch {
    throw new Error('Selected folder package lock could not be opened.');
  }
  const file = await fileHandle.getFile();
  const text = typeof file.text === 'function'
    ? await file.text()
    : new TextDecoder().decode(new Uint8Array(await file.arrayBuffer()));
  let lock = null;
  try {
    lock = JSON.parse(text);
  } catch {
    throw new Error('Selected folder package lock is not valid JSON.');
  }
  if (lock?.format !== PACKAGE_LOCK_FORMAT || Number(lock.formatVersion) !== PACKAGE_LOCK_VERSION) {
    throw new Error('Selected folder package lock is unsupported.');
  }
  return lock;
}

async function readDirectoryIntoFiles(directoryHandle, prefix, files) {
  for await (const [name, handle] of directoryHandle.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === 'directory') {
      await readDirectoryIntoFiles(handle, path, files);
      continue;
    }
    if (handle.kind !== 'file') continue;
    const file = await handle.getFile();
    files.push({
      path,
      data: new Uint8Array(await file.arrayBuffer()),
      lastModified: new Date(file.lastModified || Date.now())
    });
  }
}

async function writeFileToDirectoryHandle(directoryHandle, path, data) {
  const parts = String(path || '').replaceAll('\\', '/').split('/').filter(Boolean);
  if (!parts.length || parts.some((part) => part === '.' || part === '..')) {
    throw new Error(`Invalid package path: ${path}`);
  }
  const filename = parts.pop();
  let current = directoryHandle;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part, { create: true });
  }
  const fileHandle = await current.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  try {
    await writable.write(new Blob([data instanceof Uint8Array ? data : new Uint8Array(data || [])]));
  } finally {
    await writable.close();
  }
}

async function clearDirectoryHandle(directoryHandle) {
  for await (const [name, handle] of directoryHandle.entries()) {
    await directoryHandle.removeEntry(name, { recursive: handle.kind === 'directory' });
  }
}
