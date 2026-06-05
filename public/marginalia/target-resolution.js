const DEFAULT_CONTEXT_LENGTH = 80;

export function buildTextTargetSelectors(target, sourceText, contextLength = DEFAULT_CONTEXT_LENGTH) {
  const startOffset = finiteNumber(target?.startOffset);
  const endOffset = finiteNumber(target?.endOffset);
  if (!Number.isFinite(startOffset) || !Number.isFinite(endOffset) || startOffset >= endOffset) return [];

  const exact = String(target?.exact ?? sourceText.slice(startOffset, endOffset));
  const prefix = String(target?.prefix ?? sourceText.slice(Math.max(0, startOffset - contextLength), startOffset));
  const suffix = String(target?.suffix ?? sourceText.slice(endOffset, Math.min(sourceText.length, endOffset + contextLength)));
  const selectors = [];
  if (target?.anchorId) selectors.push({ type: 'BlockIdSelector', value: String(target.anchorId) });
  if (target?.domPath) selectors.push({ type: 'DomPathSelector', value: String(target.domPath) });
  selectors.push({ type: 'TextPositionSelector', start: startOffset, end: endOffset });
  selectors.push({ type: 'TextQuoteSelector', exact, prefix, suffix });
  return selectors;
}

export function resolveTextOffsets(sourceText, target) {
  const text = String(sourceText ?? '');
  const startOffset = finiteNumber(target?.startOffset);
  const endOffset = finiteNumber(target?.endOffset);
  const exact = textQuoteValue(target, 'exact');

  if (!exact) {
    if (validOffsetRange(text, startOffset, endOffset)) {
      return resolvedOffsets(startOffset, endOffset, 'position');
    }
    return unresolvedOffsets('invalid-position');
  }

  if (validOffsetRange(text, startOffset, endOffset) && text.slice(startOffset, endOffset) === exact) {
    return resolvedOffsets(startOffset, endOffset, 'position');
  }

  const quoteMatch = bestQuoteMatch(text, target, startOffset);
  if (quoteMatch) return quoteMatch;

  if (validOffsetRange(text, startOffset, endOffset)) {
    return unresolvedOffsets('quote-mismatch', { startOffset, endOffset });
  }
  return unresolvedOffsets('quote-not-found');
}

export function targetResolutionStatus(sourceText, target) {
  if (!target) return unresolvedOffsets('missing-target');
  if (target.type !== 'text') return { status: 'resolved', strategy: 'block' };
  return resolveTextOffsets(sourceText, target);
}

export function normalizePdfRectFromPoints(start, end, pageSize) {
  const width = positiveNumber(pageSize?.width);
  const height = positiveNumber(pageSize?.height);
  if (!width || !height) return null;
  const x1 = clampUnit(Number(start?.x) / width);
  const y1 = clampUnit(Number(start?.y) / height);
  const x2 = clampUnit(Number(end?.x) / width);
  const y2 = clampUnit(Number(end?.y) / height);
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const rectWidth = Math.abs(x2 - x1);
  const rectHeight = Math.abs(y2 - y1);
  if (rectWidth <= 0 || rectHeight <= 0) return null;
  return {
    x: roundUnit(left),
    y: roundUnit(top),
    width: roundUnit(rectWidth),
    height: roundUnit(rectHeight)
  };
}

function bestQuoteMatch(sourceText, target, expectedStart) {
  const exact = textQuoteValue(target, 'exact');
  if (!exact) return null;
  const prefix = textQuoteValue(target, 'prefix');
  const suffix = textQuoteValue(target, 'suffix');
  let best = null;
  let index = sourceText.indexOf(exact);
  while (index !== -1) {
    const candidate = quoteCandidate(sourceText, exact, prefix, suffix, index, expectedStart);
    if (!best || candidate.score > best.score || (candidate.score === best.score && candidate.distance < best.distance)) {
      best = candidate;
    }
    index = sourceText.indexOf(exact, index + Math.max(1, exact.length));
  }
  if (!best) return null;
  if ((prefix || suffix) && best.score <= 0) return null;
  return resolvedOffsets(best.startOffset, best.endOffset, best.strategy);
}

function quoteCandidate(sourceText, exact, prefix, suffix, startOffset, expectedStart) {
  const endOffset = startOffset + exact.length;
  const before = sourceText.slice(0, startOffset);
  const after = sourceText.slice(endOffset);
  const prefixMatch = prefix ? before.endsWith(prefix) : false;
  const suffixMatch = suffix ? after.startsWith(suffix) : false;
  const distance = Number.isFinite(expectedStart) ? Math.abs(startOffset - expectedStart) : 0;
  let score = 0;
  if (prefixMatch) score += 4;
  if (suffixMatch) score += 4;
  if (!prefix && !suffix) score += 1;
  score -= Math.min(distance / 100000, 0.5);
  return {
    status: 'resolved',
    strategy: prefixMatch || suffixMatch ? 'quote-context' : 'quote',
    startOffset,
    endOffset,
    score,
    distance
  };
}

function textQuoteValue(target, key) {
  if (target?.[key] != null) return String(target[key]);
  const quote = Array.isArray(target?.selectors)
    ? target.selectors.find((selector) => selector?.type === 'TextQuoteSelector')
    : null;
  return quote?.[key] != null ? String(quote[key]) : '';
}

function validOffsetRange(sourceText, startOffset, endOffset) {
  return Number.isFinite(startOffset)
    && Number.isFinite(endOffset)
    && startOffset >= 0
    && endOffset > startOffset
    && endOffset <= sourceText.length;
}

function resolvedOffsets(startOffset, endOffset, strategy) {
  return {
    status: 'resolved',
    strategy,
    startOffset,
    endOffset,
    unresolvedReason: null
  };
}

function unresolvedOffsets(unresolvedReason, offsets = {}) {
  return {
    status: 'unresolved',
    strategy: null,
    startOffset: offsets.startOffset ?? null,
    endOffset: offsets.endOffset ?? null,
    unresolvedReason
  };
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function clampUnit(value) {
  const number = Number.isFinite(value) ? value : 0;
  return Math.min(Math.max(number, 0), 1);
}

function roundUnit(value) {
  return Number(value.toFixed(6));
}
