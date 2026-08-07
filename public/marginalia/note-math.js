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
  if (!md?.block?.ruler || !md?.core?.ruler || !md?.inline?.ruler || !md?.renderer?.rules) {
    throw new TypeError('A markdown-it instance is required.');
  }
  if (!katex || typeof katex.renderToString !== 'function') {
    throw new TypeError('A KaTeX runtime with renderToString() is required.');
  }

  md.block.ruler.before('fence', 'note_math_display_block', noteMathDisplayBlockRule, {
    alt: ['paragraph', 'reference', 'blockquote', 'list']
  });
  md.inline.ruler.before('escape', 'note_math', noteMathInlineRule);
  md.core.ruler.after('text_join', 'note_copied_inline_math', noteCopiedInlineMathCoreRule);
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

function noteCopiedInlineMathCoreRule(state) {
  if (!state.env?.noteCopiedMath) return;
  for (const blockToken of state.tokens || []) {
    if (!Array.isArray(blockToken.children)) continue;
    blockToken.children = blockToken.children.flatMap((token) => (
      token.type === 'text' ? splitCopiedInlineMathToken(state, token) : [token]
    ));
  }
}

function splitCopiedInlineMathToken(state, token) {
  const source = String(token.content || '');
  const tokens = [];
  let sourceStart = 0;
  let searchFrom = 0;
  while (searchFrom < source.length) {
    const opening = source.indexOf('(', searchFrom);
    if (opening < 0) break;
    const match = copiedInlineMathMatchAt(source, opening);
    if (!match) {
      searchFrom = opening + 1;
      continue;
    }
    if (opening > sourceStart) tokens.push(copiedTextToken(state, token, source.slice(sourceStart, opening)));
    const math = new state.Token('note_math_inline', '', 0);
    math.content = match.tex;
    math.markup = match.open;
    math.level = token.level;
    math.meta = { raw: match.raw, displayMode: false, copied: true };
    tokens.push(math);
    sourceStart = match.end;
    searchFrom = match.end;
  }
  if (!tokens.length) return [token];
  if (sourceStart < source.length) tokens.push(copiedTextToken(state, token, source.slice(sourceStart)));
  return tokens;
}

function copiedTextToken(state, original, content) {
  const token = new state.Token('text', '', 0);
  token.content = content;
  token.level = original.level;
  return token;
}

function noteMathDisplayBlockRule(state, startLine, endLine, silent) {
  const opening = blockLine(state, startLine);
  const copied = opening === '[';
  const closing = copied ? ']' : (opening === '\\[' ? '\\]' : (opening === '$$' ? '$$' : ''));
  if (!closing) return false;

  let closeLine = startLine + 1;
  while (closeLine < endLine && blockLine(state, closeLine) !== closing) closeLine += 1;
  if (closeLine >= endLine) return false;
  if (silent) return true;

  const originalTex = state.getLines(startLine + 1, closeLine, state.blkIndent, false).trim();
  if (!originalTex) return false;
  if (copied) {
    state.env ||= {};
    state.env.noteCopiedMath = true;
  }

  const token = state.push('note_math_display', 'math', 0);
  token.block = true;
  token.content = copied ? normalizeCopiedDisplayMath(originalTex) : originalTex;
  token.markup = opening;
  token.map = [startLine, closeLine + 1];
  token.meta = {
    raw: `${opening}\n${originalTex}\n${closing}`,
    displayMode: true,
    copied
  };
  state.line = closeLine + 1;
  return true;
}

function blockLine(state, line) {
  const start = state.bMarks[line] + state.tShift[line];
  return state.src.slice(start, state.eMarks[line]).trim();
}

function copiedInlineMathMatchAt(source, startIndex) {
  const text = String(source ?? '');
  if (text[startIndex] !== '(' || isEscaped(text, startIndex)) return null;

  let depth = 0;
  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\n') return null;
    if (isEscaped(text, index)) continue;
    if (character === '(') depth += 1;
    if (character !== ')') continue;
    depth -= 1;
    if (depth > 0) continue;

    const end = index + 1;
    const tex = text.slice(startIndex + 1, index);
    if (!isLikelyCopiedInlineMath(tex)) return null;
    return {
      start: startIndex,
      end,
      raw: text.slice(startIndex, end),
      tex,
      displayMode: false,
      open: '(',
      close: ')'
    };
  }
  return null;
}

function isLikelyCopiedInlineMath(value) {
  const tex = String(value || '').trim();
  if (!tex || tex !== value) return false;
  if (/\\[A-Za-z]+/.test(tex)) return true;
  return /^(?:[A-Za-z]|\d+)(?:_(?:[A-Za-z0-9]|\{[A-Za-z0-9]+\}))?$/.test(tex);
}

function normalizeCopiedDisplayMath(source) {
  return String(source || '').split('\n').map((line) => {
    if (/^\s*={3,}\s*$/.test(line)) return line.replace(/={3,}/, '=');

    const spacing = line.match(/\[(\d*\.?\d+(?:em|ex|mu|mm|cm|in|pt|pc|px))\]\s*$/);
    if (spacing && line[spacing.index - 1] !== '\\') {
      return `${line.slice(0, spacing.index)}\\\\${line.slice(spacing.index)}`;
    }

    const trailing = line.match(/(\\+)\s*$/);
    if (trailing && trailing[1].length % 2 === 1) {
      return `${line.slice(0, trailing.index + trailing[1].length)}\\${line.slice(trailing.index + trailing[1].length)}`;
    }
    return line;
  }).join('\n');
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
    const sourceLines = token.block && Array.isArray(token.map)
      ? ` data-note-source-start-line="${token.map[0]}" data-note-source-end-line="${token.map[1]}"`
      : '';
    return `<span class="${className}"${sourceLines}>${rendered}</span>`;
  } catch {
    return renderMathError(raw, className, escapeHtml);
  }
}

function renderMathError(raw, className, escapeHtml) {
  return `<span class="${className} note-markdown-math-error" title="Math could not be rendered">${escapeHtml(raw)}</span>`;
}
