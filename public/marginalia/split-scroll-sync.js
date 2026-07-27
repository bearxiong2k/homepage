export const SPLIT_SCROLL_FOLLOW_FACTOR = 0.82;
export const SPLIT_SCROLL_SETTLE_DISTANCE = 0.75;
export const SPLIT_SCROLL_MIN_SNAP_DISTANCE = 240;
export const SPLIT_SCROLL_SNAP_VIEWPORT_RATIO = 0.55;

export function clampSplitScrollPosition(scrollPosition, scrollHeight, viewportHeight) {
  const position = Math.max(0, finiteNumber(scrollPosition, 0));
  const height = Math.max(0, finiteNumber(scrollHeight, 0));
  const viewport = Math.max(0, finiteNumber(viewportHeight, 0));
  return Math.min(position, Math.max(0, height - viewport));
}

export function nextSplitScrollPosition(currentPosition, targetPosition, viewportHeight) {
  const current = Math.max(0, finiteNumber(currentPosition, 0));
  const target = Math.max(0, finiteNumber(targetPosition, current));
  const delta = target - current;
  const distance = Math.abs(delta);
  if (distance <= SPLIT_SCROLL_SETTLE_DISTANCE) return target;
  const snapDistance = Math.max(
    SPLIT_SCROLL_MIN_SNAP_DISTANCE,
    Math.max(0, finiteNumber(viewportHeight, 0)) * SPLIT_SCROLL_SNAP_VIEWPORT_RATIO
  );
  if (distance >= snapDistance) return target;
  const next = current + delta * SPLIT_SCROLL_FOLLOW_FACTOR;
  return Math.abs(target - next) <= SPLIT_SCROLL_SETTLE_DISTANCE ? target : next;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
