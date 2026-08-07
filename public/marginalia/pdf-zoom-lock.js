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

export function horizontalOffsetForCenteredZoom(options = {}) {
  const previousContentWidth = positiveNumber(options.previousContentWidth, 1);
  const nextContentWidth = positiveNumber(options.nextContentWidth, previousContentWidth);
  const viewportWidth = Math.max(0, finiteNumber(options.viewportWidth, 0));
  const left = Math.max(0, finiteNumber(options.left, 0));
  const centerRatio = (left + viewportWidth / 2) / previousContentWidth;
  const nextLeft = centerRatio * nextContentWidth - viewportWidth / 2;
  const maxOffset = Math.max(0, nextContentWidth - viewportWidth);
  return Math.min(maxOffset, Math.max(0, nextLeft));
}

export function pdfWheelVerticalDelta(options = {}) {
  const deltaMode = Math.round(finiteNumber(options.deltaMode, 0));
  const deltaUnit = deltaMode === 1
    ? positiveNumber(options.linePixels, 16)
    : deltaMode === 2
      ? positiveNumber(options.pagePixels, 1)
      : 1;
  const deltaX = finiteNumber(options.deltaX, 0) * deltaUnit;
  const deltaY = finiteNumber(options.deltaY, 0) * deltaUnit;
  const maxLeft = Math.max(0, finiteNumber(options.maxLeft, 0));
  const currentLeft = clampPosition(options.left, maxLeft);
  const nextLeft = clampPosition(currentLeft + deltaX, maxLeft);
  const consumedX = nextLeft - currentLeft;
  if (Math.abs(deltaY) > 0.001) return Math.abs(consumedX) > 0.001 ? deltaY : 0;
  return deltaX - consumedX;
}

export function previewScaleFactor(previewScale, committedScale) {
  return positiveNumber(previewScale, 1) / positiveNumber(committedScale, 1);
}

export function normalizePdfViewState(value) {
  if (!value || typeof value !== 'object') return null;
  const zoomScale = positiveNumber(value.zoomScale, NaN);
  const zoomRatio = positiveNumber(value.zoomRatio, NaN);
  const horizontalLeft = Math.max(0, finiteNumber(value.horizontalLeft, 0));
  const horizontalRatio = Math.min(1, Math.max(0, finiteNumber(value.horizontalRatio, 0)));
  if (!Number.isFinite(zoomScale) && !Number.isFinite(zoomRatio)
    && typeof value.zoomLocked !== 'boolean'
    && typeof value.horizontalPanLocked !== 'boolean') return null;
  return {
    version: 1,
    zoomLocked: value.zoomLocked !== false,
    horizontalPanLocked: value.horizontalPanLocked === true,
    ...(Number.isFinite(zoomScale) ? { zoomScale } : {}),
    ...(Number.isFinite(zoomRatio) ? { zoomRatio } : {}),
    horizontalLeft,
    horizontalRatio
  };
}

function clampScale(value, options) {
  const minimum = positiveNumber(options.minScale, 0.35);
  const maximum = Math.max(minimum, positiveNumber(options.maxScale, 10));
  return Math.min(maximum, Math.max(minimum, value));
}

function clampPosition(value, maximum) {
  return Math.min(maximum, Math.max(0, finiteNumber(value, 0)));
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function finiteNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
