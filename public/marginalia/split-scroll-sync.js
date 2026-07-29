export const SPLIT_SCROLL_FOLLOW_DELAY_MS = 48;
export const SPLIT_SCROLL_FOLLOW_RESPONSE_MS = 58;
export const SPLIT_SCROLL_MAX_STEP_VIEWPORT_RATIO = 0.16;
export const SPLIT_SCROLL_SETTLE_DISTANCE = 0.75;

const SPLIT_SCROLL_NOMINAL_FRAME_MS = 1000 / 60;
const SPLIT_SCROLL_MAX_MOTION_FRAME_MS = 24;

export function clampSplitScrollPosition(scrollPosition, scrollHeight, viewportHeight) {
  const position = Math.max(0, finiteNumber(scrollPosition, 0));
  const height = Math.max(0, finiteNumber(scrollHeight, 0));
  const viewport = Math.max(0, finiteNumber(viewportHeight, 0));
  return Math.min(position, Math.max(0, height - viewport));
}

export function nextSplitScrollPosition(
  currentPosition,
  targetPosition,
  viewportHeight,
  elapsedMs = SPLIT_SCROLL_NOMINAL_FRAME_MS
) {
  const current = Math.max(0, finiteNumber(currentPosition, 0));
  const target = Math.max(0, finiteNumber(targetPosition, current));
  const delta = target - current;
  const distance = Math.abs(delta);
  if (distance <= SPLIT_SCROLL_SETTLE_DISTANCE) return target;

  const frameMs = Math.min(
    SPLIT_SCROLL_MAX_MOTION_FRAME_MS,
    Math.max(1, finiteNumber(elapsedMs, SPLIT_SCROLL_NOMINAL_FRAME_MS))
  );
  const response = 1 - Math.exp(-frameMs / SPLIT_SCROLL_FOLLOW_RESPONSE_MS);
  const viewport = Math.max(0, finiteNumber(viewportHeight, 0));
  const frameScale = Math.min(1, frameMs / SPLIT_SCROLL_NOMINAL_FRAME_MS);
  const maxStep = Math.max(1, viewport * SPLIT_SCROLL_MAX_STEP_VIEWPORT_RATIO * frameScale);
  const responsiveStep = Math.max(1, distance * response);
  const step = Math.sign(delta) * Math.min(distance, responsiveStep, maxStep);
  const next = current + step;
  return Math.abs(target - next) <= SPLIT_SCROLL_SETTLE_DISTANCE ? target : next;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
