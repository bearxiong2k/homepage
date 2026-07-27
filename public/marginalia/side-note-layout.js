export const SIDE_NOTE_STACK_GAP = 12;

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
