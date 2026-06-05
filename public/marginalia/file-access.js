export const ANNOTATOR_BUNDLE_TYPES = [{
  description: 'Annotator source or library',
  accept: {
    'text/html': ['.html', '.htm'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip']
  }
}];

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
  const name = directoryHandle.name || '';
  const entries = [];
  if (!(await ensureFileHandlePermission(directoryHandle, 'readwrite'))) {
    throw new Error('Permission to write the package folder was not granted.');
  }
  for await (const [entryName] of directoryHandle.entries()) entries.push(entryName);
  if (name.endsWith(expectedSuffix) || entries.length === 0) return true;
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
