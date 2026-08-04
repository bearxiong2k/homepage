export function pdfPageIndexFromTarget(target) {
  if (!target) return null;
  const directIndex = integerOrNull(target.pageIndex);
  if (directIndex != null && directIndex >= 0) return directIndex;
  const pageNumber = pdfPageNumberFromTargetId(target.pageId)
    ?? pdfPageNumberFromTargetId(target.anchorId)
    ?? pdfPageNumberFromTargetId(target.id);
  return pageNumber != null ? pageNumber - 1 : null;
}

export function pdfPageNumberFromTarget(target) {
  const pageIndex = pdfPageIndexFromTarget(target);
  return pageIndex != null ? pageIndex + 1 : null;
}

export function annotationPdfPageIndexes(annotation) {
  const indexes = new Set();
  for (const target of annotationPdfTargets(annotation)) {
    const pageIndex = pdfPageIndexFromTarget(target);
    if (pageIndex != null) indexes.add(pageIndex);
  }
  return [...indexes].sort((a, b) => a - b);
}

export function annotationPrimaryPdfPageNumber(annotation) {
  const primaryPageNumber = pdfPageNumberFromTarget(annotation?.target);
  if (primaryPageNumber != null) return primaryPageNumber;
  const [firstPageIndex] = annotationPdfPageIndexes(annotation);
  return firstPageIndex != null ? firstPageIndex + 1 : null;
}

function annotationPdfTargets(annotation) {
  return [
    annotation?.target,
    ...(Array.isArray(annotation?.targets) ? annotation.targets : []),
    annotation?.display?.noteAnchor
  ].filter((target) => target && ['text', 'pdf-page-point', 'pdf-rect'].includes(target.type));
}

function pdfPageNumberFromTargetId(value) {
  const match = /^pdf-page-(\d+)$/.exec(String(value || ''));
  if (!match) return null;
  const number = Number(match[1]);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function integerOrNull(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}
