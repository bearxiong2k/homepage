const DEFAULT_INK_WIDTH = 3;
const PRESSURE_WIDTH = { min: 0.58, max: 1.45, curve: 0.68 };

export function buildInkEraserStrokeIndex(strokes = []) {
  return strokes.map((stroke) => ({
    stroke,
    bounds: strokeBounds(stroke)
  })).filter((entry) => entry.bounds);
}

export function collectPendingEraseStrokes(index, pending, point, eraserWidth, fromPoint = null) {
  if (!isFiniteInkPoint(point)) return pending;
  const target = pending instanceof Set ? pending : new Set();
  const eraseBounds = eraserSegmentBounds(point, eraserWidth, fromPoint);
  for (const entry of index || []) {
    if (!entry?.stroke || target.has(entry.stroke)) continue;
    if (!boundsIntersect(eraseBounds, entry.bounds)) continue;
    if (strokeNearEraserPath(entry.stroke, point, eraserWidth, fromPoint)) target.add(entry.stroke);
  }
  return target;
}

export function commitPendingEraseStrokes(strokes = [], pending = new Set()) {
  if (!pending?.size) return { kept: strokes, removed: [] };
  const kept = [];
  const removed = [];
  for (const stroke of strokes) {
    if (pending.has(stroke)) removed.push(stroke);
    else kept.push(stroke);
  }
  return { kept, removed };
}

export function strokeBounds(stroke) {
  const points = Array.isArray(stroke?.points) ? stroke.points : [];
  if (!points.length) return null;
  const baseWidth = clampNumber(stroke?.width, 1, 24, DEFAULT_INK_WIDTH);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    if (!isFiniteInkPoint(point)) continue;
    const radius = pointWidth(stroke, point, baseWidth) / 2;
    minX = Math.min(minX, point.x - radius);
    minY = Math.min(minY, point.y - radius);
    maxX = Math.max(maxX, point.x + radius);
    maxY = Math.max(maxY, point.y + radius);
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null;
  return { minX, minY, maxX, maxY };
}

export function eraserSegmentBounds(point, eraserWidth, fromPoint = null) {
  const radius = clampNumber(eraserWidth, 1, 64, DEFAULT_INK_WIDTH) / 2;
  const points = isFiniteInkPoint(fromPoint) ? [fromPoint, point] : [point];
  return {
    minX: Math.min(...points.map((item) => item.x)) - radius,
    minY: Math.min(...points.map((item) => item.y)) - radius,
    maxX: Math.max(...points.map((item) => item.x)) + radius,
    maxY: Math.max(...points.map((item) => item.y)) + radius
  };
}

export function boundsIntersect(left, right) {
  if (!left || !right) return false;
  return left.minX <= right.maxX
    && left.maxX >= right.minX
    && left.minY <= right.maxY
    && left.maxY >= right.minY;
}

export function strokeNearEraserPath(stroke, point, eraserWidth, fromPoint = null) {
  const points = Array.isArray(stroke?.points) ? stroke.points : [];
  const baseWidth = clampNumber(stroke?.width, 1, 24, DEFAULT_INK_WIDTH);
  const hitRadius = (candidate) => (eraserWidth + pointWidth(stroke, candidate, baseWidth)) / 2;
  return points.some((candidate, index) => {
    if (!isFiniteInkPoint(candidate)) return false;
    const threshold = hitRadius(candidate);
    if (distance(candidate, point) <= threshold) return true;
    if (isFiniteInkPoint(fromPoint) && distanceToSegment(candidate, fromPoint, point) <= threshold) return true;
    const previous = points[index - 1];
    if (!isFiniteInkPoint(previous)) return false;
    const segmentThreshold = Math.max(threshold, hitRadius(previous));
    if (distanceToSegment(point, previous, candidate) <= segmentThreshold) return true;
    return isFiniteInkPoint(fromPoint) && segmentDistance(fromPoint, point, previous, candidate) <= segmentThreshold;
  });
}

function pointWidth(stroke, point, baseWidth) {
  if (!stroke?.pressureEnabled) return baseWidth;
  const pressure = clampNumber(point?.pressure, 0, 1, 0.5);
  const factor = PRESSURE_WIDTH.min + (PRESSURE_WIDTH.max - PRESSURE_WIDTH.min) * Math.pow(pressure, PRESSURE_WIDTH.curve);
  return baseWidth * factor * stylusTiltWidthFactor(point);
}

function stylusTiltWidthFactor(point) {
  const altitude = Number(point?.altitudeAngle);
  if (Number.isFinite(altitude)) {
    const tilt = 1 - clampNumber(altitude, 0, Math.PI / 2, Math.PI / 2) / (Math.PI / 2);
    return 1 + tilt * 0.16;
  }
  const tiltX = Number(point?.tiltX);
  const tiltY = Number(point?.tiltY);
  if (!Number.isFinite(tiltX) && !Number.isFinite(tiltY)) return 1;
  const magnitude = Math.hypot(Number.isFinite(tiltX) ? tiltX : 0, Number.isFinite(tiltY) ? tiltY : 0);
  return 1 + Math.min(magnitude, 90) / 90 * 0.12;
}

function distance(a, b) {
  return Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));
}

function distanceToSegment(point, a, b) {
  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const lengthSquared = abX * abX + abY * abY;
  if (!lengthSquared) return distance(point, a);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * abX + (point.y - a.y) * abY) / lengthSquared));
  return distance(point, { x: a.x + abX * t, y: a.y + abY * t });
}

function segmentDistance(a, b, c, d) {
  if (segmentsIntersect(a, b, c, d)) return 0;
  return Math.min(
    distanceToSegment(a, c, d),
    distanceToSegment(b, c, d),
    distanceToSegment(c, a, b),
    distanceToSegment(d, a, b)
  );
}

function segmentsIntersect(a, b, c, d) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  if (!abC && pointOnSegment(c, a, b)) return true;
  if (!abD && pointOnSegment(d, a, b)) return true;
  if (!cdA && pointOnSegment(a, c, d)) return true;
  if (!cdB && pointOnSegment(b, c, d)) return true;
  return abC !== abD && cdA !== cdB;
}

function orientation(a, b, c) {
  const value = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
  if (Math.abs(value) < 1e-9) return 0;
  return value > 0 ? 1 : 2;
}

function pointOnSegment(point, a, b) {
  return point.x <= Math.max(a.x, b.x) + 1e-9
    && point.x >= Math.min(a.x, b.x) - 1e-9
    && point.y <= Math.max(a.y, b.y) + 1e-9
    && point.y >= Math.min(a.y, b.y) - 1e-9;
}

function isFiniteInkPoint(point) {
  return Number.isFinite(point?.x) && Number.isFinite(point?.y);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
