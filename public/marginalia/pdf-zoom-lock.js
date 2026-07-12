export function zoomStateForPanelResize(options = {}) {
  const fitScale = positiveNumber(options.fitScale, 1);
  const committedScale = positiveNumber(options.committedScale, fitScale);
  if (options.locked) {
    const relativeRatio = positiveNumber(options.relativeRatio, committedScale / fitScale);
    return {
      scale: clampScale(fitScale * relativeRatio, options),
      relativeRatio
    };
  }
  return {
    scale: clampScale(committedScale, options),
    relativeRatio: committedScale / fitScale
  };
}

export function horizontalOffsetForPanelResize(options = {}) {
  const maxOffset = Math.max(0, finiteNumber(options.maxOffset, 0));
  const value = options.relative
    ? finiteNumber(options.ratio, 0) * maxOffset
    : finiteNumber(options.left, 0);
  return Math.min(maxOffset, Math.max(0, value));
}

export function previewScaleFactor(previewScale, committedScale) {
  return positiveNumber(previewScale, 1) / positiveNumber(committedScale, 1);
}

function clampScale(value, options) {
  const minimum = positiveNumber(options.minScale, 0.35);
  const maximum = Math.max(minimum, positiveNumber(options.maxScale, 10));
  return Math.min(maximum, Math.max(minimum, value));
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
