export const SPLIT_SCROLL_FOLLOW_DELAY_MS = 48;
export const SPLIT_SCROLL_FOLLOW_RESPONSE_MS = 58;
export const SPLIT_SCROLL_STREAM_IDLE_MS = 96;
export const SPLIT_SCROLL_SETTLE_DISTANCE = 0.75;

const SPLIT_SCROLL_NOMINAL_FRAME_MS = 1000 / 60;

export function clampSplitScrollPosition(scrollPosition, scrollHeight, viewportHeight) {
  const position = Math.max(0, finiteNumber(scrollPosition, 0));
  const height = Math.max(0, finiteNumber(scrollHeight, 0));
  const viewport = Math.max(0, finiteNumber(viewportHeight, 0));
  return Math.min(position, Math.max(0, height - viewport));
}

export function nextSplitScrollPosition(
  currentPosition,
  targetPosition,
  elapsedMs = SPLIT_SCROLL_NOMINAL_FRAME_MS
) {
  const current = Math.max(0, finiteNumber(currentPosition, 0));
  const target = Math.max(0, finiteNumber(targetPosition, current));
  const delta = target - current;
  const distance = Math.abs(delta);
  if (distance <= SPLIT_SCROLL_SETTLE_DISTANCE) return target;

  const frameMs = Math.max(1, finiteNumber(elapsedMs, SPLIT_SCROLL_NOMINAL_FRAME_MS));
  const response = 1 - Math.exp(-frameMs / SPLIT_SCROLL_FOLLOW_RESPONSE_MS);
  const responsiveStep = Math.max(1, distance * response);
  const step = Math.sign(delta) * Math.min(distance, responsiveStep);
  const next = current + step;
  return Math.abs(target - next) <= SPLIT_SCROLL_SETTLE_DISTANCE ? target : next;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
