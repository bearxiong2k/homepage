export const SIDE_NOTE_STACK_GAP = 12;

export function orderAnnotationsByLinkedPosition(annotations = [], positionForAnnotation = () => NaN) {
  return annotations
    .map((annotation, sourceIndex) => {
      const rawPosition = positionForAnnotation(annotation);
      return {
        annotation,
        sourceIndex,
        position: rawPosition === null || rawPosition === '' ? NaN : Number(rawPosition)
      };
    })
    .sort((left, right) => {
      const leftResolved = Number.isFinite(left.position);
      const rightResolved = Number.isFinite(right.position);
      if (leftResolved !== rightResolved) return leftResolved ? -1 : 1;
      if (leftResolved && Math.abs(left.position - right.position) > 0.5) {
        return left.position - right.position;
      }
      return left.sourceIndex - right.sourceIndex;
    })
    .map((entry) => entry.annotation);
}

export function planSideNoteStack(entries = [], activeAnnotationId = null, gap = SIDE_NOTE_STACK_GAP) {
  const ordered = entries
    .map((entry, sourceIndex) => ({
      ...entry,
      sourceIndex,
      top: finiteNumber(entry?.top, 0),
      height: Math.max(0, finiteNumber(entry?.height, 0))
    }))
    .sort((left, right) => left.top - right.top || left.sourceIndex - right.sourceIndex);
  const overlaps = ordered.map(() => false);
  let highestBottom = -Infinity;
  let highestBottomIndex = -1;
  ordered.forEach((entry, index) => {
    if (entry.top < highestBottom + gap) {
      overlaps[index] = true;
      if (highestBottomIndex >= 0) overlaps[highestBottomIndex] = true;
    }
    const bottom = entry.top + entry.height;
    if (bottom > highestBottom) {
      highestBottom = bottom;
      highestBottomIndex = index;
    }
  });
  const stack = ordered.map((entry, index) => ({
    ...entry,
    overlapping: overlaps[index],
    zIndex: index + 1
  }));
  const active = activeAnnotationId
    ? stack.find((entry) => entry.annotationId === activeAnnotationId)
    : null;
  if (active) active.zIndex = stack.length + 10;
  return stack;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
