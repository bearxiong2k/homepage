export const MAX_SOURCE_BOOKMARKS = 100;

export function normalizeSourceBookmarkRecord(value, docId = '') {
  const source = Array.isArray(value) ? { bookmarks: value } : value || {};
  const seen = new Set();
  const bookmarks = [];
  for (const [index, item] of (Array.isArray(source.bookmarks) ? source.bookmarks : []).entries()) {
    const bookmark = normalizeSourceBookmark(item, index);
    if (!bookmark || seen.has(bookmark.id)) continue;
    seen.add(bookmark.id);
    bookmarks.push(bookmark);
    if (bookmarks.length >= MAX_SOURCE_BOOKMARKS) break;
  }
  return {
    docId: String(docId || source.docId || ''),
    bookmarks,
    updatedAt: source.updatedAt || ''
  };
}

export function normalizeSourceBookmark(value, index = 0) {
  if (!value || typeof value !== 'object') return null;
  const target = value.target && typeof value.target === 'object' && !Array.isArray(value.target)
    ? {
        ...value.target,
        ...(value.target.clientHint && typeof value.target.clientHint === 'object'
          ? { clientHint: { ...value.target.clientHint } }
          : {})
      }
    : null;
  return {
    id: String(value.id || `bookmark-${index + 1}`),
    label: normalizedBookmarkText(value.label, `Bookmark ${index + 1}`, 120),
    target,
    locationLabel: normalizedBookmarkText(value.locationLabel, target ? 'Saved location' : 'Not placed', 160)
  };
}

function normalizedBookmarkText(value, fallback, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return (text || fallback).slice(0, maxLength);
}
