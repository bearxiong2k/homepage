const NOTE_MATH_DELIMITERS = Object.freeze([
  Object.freeze({ open: '$$', close: '$$', displayMode: true, multiline: true }),
  Object.freeze({ open: '\\[', close: '\\]', displayMode: true, multiline: true }),
  Object.freeze({ open: '\\(', close: '\\)', displayMode: false, multiline: false }),
  Object.freeze({ open: '$', close: '$', displayMode: false, multiline: false })
]);

export const NOTE_MATH_RENDER_OPTIONS = Object.freeze({
  throwOnError: false,
  trust: false,
  output: 'htmlAndMathml',
  strict: 'ignore',
  maxExpand: 1000,
  maxSize: 20,
  errorColor: '#b42318'
});

export function installNoteMath(md, { katex } = {}) {
  if (!md?.inline?.ruler || !md?.renderer?.rules) {
    throw new TypeError('A markdown-it instance is required.');
  }
  if (!katex || typeof katex.renderToString !== 'function') {
    throw new TypeError('A KaTeX runtime with renderToString() is required.');
  }

  md.inline.ruler.before('escape', 'note_math', noteMathInlineRule);
  md.renderer.rules.note_math_inline = (tokens, index) => renderNoteMathToken(
    tokens[index],
    katex,
    md.utils.escapeHtml
  );
  md.renderer.rules.note_math_display = md.renderer.rules.note_math_inline;
  return md;
}

export function noteMathMatchAt(source, startIndex = 0) {
  const text = String(source ?? '');
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= text.length) return null;
  if (isEscaped(text, startIndex)) return null;

  for (const delimiter of NOTE_MATH_DELIMITERS) {
    if (!text.startsWith(delimiter.open, startIndex)) continue;
    if (delimiter.open === '$' && !isLikelyInlineDollarOpen(text, startIndex)) continue;
    const closeStart = findMathClose(text, delimiter, startIndex + delimiter.open.length);
    if (closeStart < 0) continue;
    const end = closeStart + delimiter.close.length;
    const raw = text.slice(startIndex, end);
    const tex = text.slice(startIndex + delimiter.open.length, closeStart);
    if (!tex.trim()) continue;
    return {
      start: startIndex,
      end,
      raw,
      tex,
      displayMode: delimiter.displayMode,
      open: delimiter.open,
      close: delimiter.close
    };
  }
  return null;
}

function noteMathInlineRule(state, silent) {
  const match = noteMathMatchAt(state.src, state.pos);
  if (!match || match.end > state.posMax) return false;
  if (silent) return true;

  const token = state.push(match.displayMode ? 'note_math_display' : 'note_math_inline', '', 0);
  token.content = match.tex;
  token.markup = match.open;
  token.meta = {
    raw: match.raw,
    displayMode: match.displayMode
  };
  state.pos = match.end;
  return true;
}

function findMathClose(text, delimiter, fromIndex) {
  let index = fromIndex;
  while (index < text.length) {
    index = text.indexOf(delimiter.close, index);
    if (index < 0) return -1;
    if (!delimiter.multiline && text.slice(fromIndex, index).includes('\n')) return -1;
    if (!isEscaped(text, index) && (
      delimiter.close !== '$' ||
      delimiter.open === '$$' ||
      isLikelyInlineDollarClose(text, index)
    )) {
      return index;
    }
    index += delimiter.close.length;
  }
  return -1;
}

function isLikelyInlineDollarOpen(text, index) {
  const next = text[index + 1];
  return Boolean(next && !/[\s\d$]/.test(next));
}

function isLikelyInlineDollarClose(text, index) {
  const previous = text[index - 1];
  const next = text[index + 1];
  return Boolean(previous && !/\s/.test(previous) && (
    !next ||
    /[\s.,;:!?)}\]]/.test(next) ||
    /[^\x00-\x7f]/.test(next)
  ));
}

function isEscaped(text, index) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && text[cursor] === '\\'; cursor -= 1) slashCount += 1;
  return slashCount % 2 === 1;
}

function renderNoteMathToken(token, katex, escapeHtml) {
  const displayMode = Boolean(token.meta?.displayMode);
  const raw = String(token.meta?.raw ?? token.content ?? '');
  const className = displayMode
    ? 'note-markdown-math note-markdown-math-display'
    : 'note-markdown-math note-markdown-math-inline';

  try {
    const rendered = katex.renderToString(String(token.content ?? ''), {
      ...NOTE_MATH_RENDER_OPTIONS,
      displayMode
    });
    if (/\bclass=["'][^"']*\bkatex-error\b/.test(rendered)) {
      return renderMathError(raw, className, escapeHtml);
    }
    return `<span class="${className}">${rendered}</span>`;
  } catch {
    return renderMathError(raw, className, escapeHtml);
  }
}

function renderMathError(raw, className, escapeHtml) {
  return `<span class="${className} note-markdown-math-error" title="Math could not be rendered">${escapeHtml(raw)}</span>`;
}
