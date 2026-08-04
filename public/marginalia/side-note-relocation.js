export function createSideNoteRelocation(annotationId, viewportTop, viewportHeight) {
  const id = String(annotationId || '');
  const height = positiveNumber(viewportHeight, 1);
  if (!id) return null;
  return {
    annotationId: id,
    viewportRatio: clampNumber((Number(viewportTop) || 0) / height, 0, 1)
  };
}

export function sideNoteRelocationDocumentTop(relocation, scrollTop, viewportHeight) {
  if (!relocation?.annotationId) return null;
  const ratio = clampNumber(relocation.viewportRatio, 0, 1);
  const scrollY = Math.max(0, Number(scrollTop) || 0);
  const height = positiveNumber(viewportHeight, 1);
  return scrollY + height * ratio;
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}
