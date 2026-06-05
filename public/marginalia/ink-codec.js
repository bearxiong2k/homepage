export const INK_STORAGE_VERSION = 2;

const DEFAULT_INK_COLOR = '#1c1712';
const DEFAULT_INK_WIDTH = 3;
const DEFAULT_PRESSURE = 0.5;

export function decodeInkForRuntime(ink) {
  const decoded = {
    strokes: Array.isArray(ink?.strokes) ? ink.strokes.map(decodeStrokeForRuntime).filter(Boolean) : []
  };
  const height = finiteNumber(ink?.height);
  if (height != null) decoded.height = Math.round(height);
  return decoded;
}

export function decodeStrokeForRuntime(stroke) {
  if (!stroke || typeof stroke !== 'object') return null;
  const rawPoints = Array.isArray(stroke.points) ? stroke.points : [];
  const points = rawPoints.map(decodePointForRuntime).filter(Boolean);
  const tuplePressure = rawPoints.some((point) => Array.isArray(point) && finiteNumber(point[2]) != null);
  return {
    color: typeof stroke.color === 'string' ? stroke.color : DEFAULT_INK_COLOR,
    width: clampNumber(stroke.width, 1, 24, DEFAULT_INK_WIDTH),
    pressureEnabled: stroke.pressureEnabled === true || (stroke.pressureEnabled !== false && tuplePressure),
    points
  };
}

export function encodeInkForStorage(ink) {
  const encoded = {
    v: INK_STORAGE_VERSION,
    strokes: Array.isArray(ink?.strokes) ? ink.strokes.map(encodeStrokeForStorage).filter(Boolean) : []
  };
  const height = finiteNumber(ink?.height);
  if (height != null) encoded.height = Math.round(height);
  return encoded;
}

export function encodeStrokeForStorage(stroke) {
  const decoded = decodeStrokeForRuntime(stroke);
  if (!decoded) return null;
  const points = [];
  for (const point of decoded.points) {
    const tuple = encodedPointTuple(point, decoded.pressureEnabled);
    if (!tuple || tupleMatches(points[points.length - 1], tuple)) continue;
    points.push(tuple);
  }
  return {
    color: decoded.color,
    width: roundNumber(decoded.width, 2),
    pressureEnabled: decoded.pressureEnabled,
    points
  };
}

export function finalizeStrokeForRuntime(stroke) {
  return decodeStrokeForRuntime(encodeStrokeForStorage(stroke)) || {
    color: DEFAULT_INK_COLOR,
    width: DEFAULT_INK_WIDTH,
    pressureEnabled: false,
    points: []
  };
}

function decodePointForRuntime(point) {
  if (Array.isArray(point)) {
    const x = finiteNumber(point[0]);
    const y = finiteNumber(point[1]);
    if (x == null || y == null) return null;
    const pressure = finiteNumber(point[2]);
    return {
      x,
      y,
      pressure: clampNumber(pressure, 0, 1, DEFAULT_PRESSURE),
      t: 0,
      pointerType: 'pen'
    };
  }
  if (!point || typeof point !== 'object') return null;
  const x = finiteNumber(point.x);
  const y = finiteNumber(point.y);
  if (x == null || y == null) return null;
  return {
    x,
    y,
    pressure: clampNumber(point.pressure, 0, 1, DEFAULT_PRESSURE),
    t: finiteNumber(point.t) ?? 0,
    pointerType: point.pointerType || 'pen',
    ...stylusPointProperties(point)
  };
}

function encodedPointTuple(point, pressureEnabled) {
  const x = finiteNumber(point?.x);
  const y = finiteNumber(point?.y);
  if (x == null || y == null) return null;
  const tuple = [roundNumber(x, 2), roundNumber(y, 2)];
  if (pressureEnabled) tuple.push(roundNumber(clampNumber(point.pressure, 0, 1, DEFAULT_PRESSURE), 3));
  return tuple;
}

function tupleMatches(left, right) {
  if (!left || left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function stylusPointProperties(point) {
  const properties = {};
  addStylusProperty(properties, 'tiltX', point?.tiltX, -90, 90);
  addStylusProperty(properties, 'tiltY', point?.tiltY, -90, 90);
  addStylusProperty(properties, 'twist', point?.twist, 0, 359);
  addStylusProperty(properties, 'tangentialPressure', point?.tangentialPressure, -1, 1);
  addStylusProperty(properties, 'altitudeAngle', point?.altitudeAngle, 0, Math.PI / 2);
  addStylusProperty(properties, 'azimuthAngle', point?.azimuthAngle, 0, Math.PI * 2);
  addStylusProperty(properties, 'contactWidth', point?.contactWidth, 0, 256);
  addStylusProperty(properties, 'contactHeight', point?.contactHeight, 0, 256);
  return properties;
}

function addStylusProperty(properties, key, value, min, max) {
  const number = finiteNumber(value);
  if (number == null) return;
  properties[key] = Math.min(max, Math.max(min, number));
}

function roundNumber(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(Number(value || 0) * factor) / factor;
}

function clampNumber(value, min, max, fallback) {
  const number = finiteNumber(value);
  if (number == null) return fallback;
  return Math.min(max, Math.max(min, number));
}

function finiteNumber(value) {
  if (value == null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
