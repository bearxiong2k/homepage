export function clampSplitScrollPosition(scrollPosition, scrollHeight, viewportHeight) {
  const position = Math.max(0, finiteNumber(scrollPosition, 0));
  const height = Math.max(0, finiteNumber(scrollHeight, 0));
  const viewport = Math.max(0, finiteNumber(viewportHeight, 0));
  return Math.min(position, Math.max(0, height - viewport));
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
