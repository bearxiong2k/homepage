import { installNoteMath } from './note-math.js';
import { noteMermaidPlaceholder, renderNoteMermaidDiagrams } from './note-mermaid.js';

export const NOTE_MARKDOWN_RENDERER_VERSION = '3:markdown-it-14.3.0:katex-0.17.0:mermaid-11.16.0';

const DEFAULT_CACHE_SIZE = 128;
const MARKDOWN_IT_SCRIPT_URL = new URL('./vendor/markdown-it/markdown-it.min.js', import.meta.url).href;
const KATEX_SCRIPT_URL = new URL('./vendor/katex/katex.min.js', import.meta.url).href;
const KATEX_STYLESHEET_URL = new URL('./vendor/katex/katex.min.css', import.meta.url).href;
const RENDERABLE_TOKEN_TYPES = new Set([
  'blockquote_open',
  'bullet_list_open',
  'code_block',
  'code_inline',
  'em_open',
  'fence',
  'hardbreak',
  'heading_open',
  'hr',
  'link_open',
  'note_math_display',
  'note_math_inline',
  'ordered_list_open',
  's_open',
  'softbreak',
  'strong_open'
]);

let sharedRendererPromise = null;

export function createNoteMarkdownRenderer({ markdownIt, katex, cacheSize = DEFAULT_CACHE_SIZE } = {}) {
  if (typeof markdownIt !== 'function') {
    throw new TypeError('A markdown-it factory is required.');
  }
  if (!katex || typeof katex.renderToString !== 'function') {
    throw new TypeError('A KaTeX runtime with renderToString() is required.');
  }

  const md = markdownIt({
    html: false,
    linkify: false,
    typographer: false,
    breaks: true,
    maxNesting: 20
  });
  md.disable('table');
  md.validateLink = isSafeNoteLink;
  installRestrictedRenderRules(md);
  installNoteMermaidFence(md);
  installNoteMath(md, { katex });

  const cache = new Map();
  const capacity = normalizeCacheSize(cacheSize);

  function parse(source) {
    const normalizedSource = String(source ?? '');
    const key = `${NOTE_MARKDOWN_RENDERER_VERSION}\0${normalizedSource}`;
    const cached = cache.get(key);
    if (cached) {
      cache.delete(key);
      cache.set(key, cached);
      return cached;
    }

    const tokens = md.parse(normalizedSource, {});
    annotateNoteMarkdownSourceLines(tokens);
    const entry = {
      tokens,
      hasRenderableSyntax: tokensHaveRenderableSyntax(tokens),
      html: null,
      mermaidDiagrams: null
    };
    if (capacity > 0) {
      cache.set(key, entry);
      while (cache.size > capacity) cache.delete(cache.keys().next().value);
    }
    return entry;
  }

  return Object.freeze({
    version: NOTE_MARKDOWN_RENDERER_VERSION,
    analyze(source) {
      const entry = parse(source);
      return { hasRenderableSyntax: entry.hasRenderableSyntax };
    },
    render(source) {
      const entry = parse(source);
      if (entry.html === null) {
        const env = { mermaidDiagrams: [] };
        entry.html = md.renderer.render(entry.tokens, md.options, env);
        entry.mermaidDiagrams = env.mermaidDiagrams;
      }
      return {
        html: entry.html,
        hasRenderableSyntax: entry.hasRenderableSyntax,
        mermaidDiagrams: [...entry.mermaidDiagrams]
      };
    },
    clearCache() {
      cache.clear();
    }
  });
}

export async function loadNoteMarkdownRenderer({ document: runtimeDocument } = {}) {
  if (sharedRendererPromise) return sharedRendererPromise;
  const doc = runtimeDocument || globalThis.document;
  if (!doc?.head) throw new Error('A browser document is required to load the note renderer.');

  sharedRendererPromise = Promise.all([
    loadBrowserRuntime(doc, {
      id: 'note-markdown-it-script',
      url: MARKDOWN_IT_SCRIPT_URL,
      globalName: 'markdownit'
    }),
    loadBrowserRuntime(doc, {
      id: 'note-markdown-katex-script',
      url: KATEX_SCRIPT_URL,
      globalName: 'katex'
    })
  ]).then(([markdownIt, katex]) => createNoteMarkdownRenderer({ markdownIt, katex }));

  try {
    return await sharedRendererPromise;
  } catch (error) {
    sharedRendererPromise = null;
    throw error;
  }
}

export async function analyzeNoteMarkdown(source, options) {
  const renderer = await loadNoteMarkdownRenderer(options);
  return renderer.analyze(source);
}

export async function renderNoteMarkdown(source, options) {
  const renderer = await loadNoteMarkdownRenderer(options);
  return renderNoteMermaidDiagrams(renderer.render(source), options);
}

export function ensureNoteMarkdownStyles(targetDocument = globalThis.document) {
  if (!targetDocument?.head) return null;
  const existing = Array.from(targetDocument.querySelectorAll('link[rel="stylesheet"]'))
    .find((link) => link.href === KATEX_STYLESHEET_URL);
  if (existing) return existing;

  const link = targetDocument.createElement('link');
  link.id = 'note-markdown-katex-css';
  link.rel = 'stylesheet';
  link.href = KATEX_STYLESHEET_URL;
  targetDocument.head.append(link);
  return link;
}

export function isSafeNoteLink(value) {
  const href = String(value ?? '').trim();
  if (/^#[^\s]*$/.test(href)) return true;
  return /^(?:https?:|mailto:)/i.test(href);
}

export function noteMarkdownSourceOffset(source, lineIndex) {
  const value = String(source ?? '');
  const targetLine = Math.max(0, Math.trunc(Number(lineIndex) || 0));
  let offset = 0;
  for (let line = 0; line < targetLine; line += 1) {
    const nextBreak = value.indexOf('\n', offset);
    if (nextBreak < 0) return value.length;
    offset = nextBreak + 1;
  }
  return offset;
}

export function captureNoteMarkdownEditAnchor(body, pointerEvent, source) {
  if (!body || !pointerEvent?.target?.closest) return null;
  const sourceElement = pointerEvent.target.closest('[data-note-source-start-line]');
  if (!sourceElement || !body.contains?.(sourceElement)) return null;
  const startLine = Math.max(0, Math.trunc(Number(sourceElement.dataset.noteSourceStartLine) || 0));
  const endLine = Math.max(startLine + 1, Math.trunc(Number(sourceElement.dataset.noteSourceEndLine) || startLine + 1));
  const rect = sourceElement.getBoundingClientRect?.();
  const height = Math.max(0, Number(rect?.height) || 0);
  const ratio = height > 0 && Number.isFinite(pointerEvent.clientY)
    ? Math.min(0.999999, Math.max(0, (pointerEvent.clientY - rect.top) / height))
    : 0;
  const line = startLine + Math.min(endLine - startLine - 1, Math.floor(ratio * (endLine - startLine)));
  return {
    line,
    sourceOffset: noteMarkdownSourceOffset(source, line)
  };
}

export function placeNoteMarkdownCaret(element, anchor) {
  const requestedOffset = Number(anchor?.sourceOffset);
  const doc = element?.ownerDocument;
  const selection = doc?.getSelection?.();
  if (!doc?.createRange || !selection || !Number.isFinite(requestedOffset)) return false;
  const textNodes = [];
  collectTextNodes(element, textNodes);
  let remaining = Math.max(0, Math.trunc(requestedOffset));
  let targetNode = null;
  let targetOffset = 0;
  for (const node of textNodes) {
    const length = String(node.nodeValue || '').length;
    if (remaining <= length) {
      targetNode = node;
      targetOffset = remaining;
      break;
    }
    remaining -= length;
  }
  const range = doc.createRange();
  if (targetNode) {
    range.setStart(targetNode, targetOffset);
  } else {
    range.selectNodeContents(element);
    range.collapse(false);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

export function centerNoteMarkdownCaret(element, scrollSurface = null) {
  const doc = element?.ownerDocument;
  const selection = doc?.getSelection?.();
  if (!selection?.rangeCount) return false;
  const selectedRange = selection.getRangeAt(0);
  if (!element.contains?.(selectedRange.startContainer)) return false;
  const range = selectedRange.cloneRange();
  range.collapse(true);
  const rect = range.getClientRects?.()[0] || range.getBoundingClientRect?.();
  if (!rect || !Number.isFinite(rect.top)) return false;
  const caretCenter = rect.top + (Number(rect.height) || 0) / 2;
  if (scrollSurface?.getBoundingClientRect && Number.isFinite(scrollSurface.scrollTop)) {
    const surfaceRect = scrollSurface.getBoundingClientRect();
    const surfaceCenter = surfaceRect.top + surfaceRect.height / 2;
    const visualScale = surfaceRect.height > 0 && scrollSurface.clientHeight > 0
      ? surfaceRect.height / scrollSurface.clientHeight
      : 1;
    scrollSurface.scrollTop = Math.max(0, scrollSurface.scrollTop + (caretCenter - surfaceCenter) / visualScale);
    return true;
  }
  const view = doc.defaultView;
  if (!view?.scrollTo || !Number.isFinite(view.innerHeight)) return false;
  const scrollY = Math.max(0, Number(view.scrollY) || 0);
  view.scrollTo(Number(view.scrollX) || 0, Math.max(0, scrollY + caretCenter - view.innerHeight / 2));
  return true;
}

function annotateNoteMarkdownSourceLines(tokens) {
  for (const token of tokens || []) {
    if (!Array.isArray(token?.map) || token.map.length < 2 || typeof token.attrSet !== 'function') continue;
    if (token.nesting !== 1 && !['code_block', 'hr'].includes(token.type)) continue;
    const startLine = Math.max(0, Math.trunc(Number(token.map[0]) || 0));
    const endLine = Math.max(startLine + 1, Math.trunc(Number(token.map[1]) || startLine + 1));
    token.attrSet('data-note-source-start-line', String(startLine));
    token.attrSet('data-note-source-end-line', String(endLine));
  }
}

function collectTextNodes(node, output) {
  for (const child of node?.childNodes || []) {
    if (child?.nodeType === 3) {
      output.push(child);
      continue;
    }
    if (child?.nodeType === 1) collectTextNodes(child, output);
  }
}

function installRestrictedRenderRules(md) {
  const defaultLinkOpen = md.renderer.rules.link_open || ((tokens, index, options, env, renderer) => (
    renderer.renderToken(tokens, index, options)
  ));
  md.renderer.rules.link_open = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const href = token.attrGet('href') || '';
    if (!href.startsWith('#')) {
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener noreferrer');
    }
    return defaultLinkOpen(tokens, index, options, env, renderer);
  };

  md.renderer.rules.image = (tokens, index) => {
    const token = tokens[index];
    const alt = String(token.content || token.attrGet('alt') || '');
    const source = String(token.attrGet('src') || '');
    return md.utils.escapeHtml(`![${alt}](${source})`);
  };
}

function installNoteMermaidFence(md) {
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, index, options, env, renderer) => {
    const token = tokens[index];
    const language = String(token.info || '').trim().split(/\s+/, 1)[0].toLowerCase();
    if (language !== 'mermaid') return defaultFence(tokens, index, options, env, renderer);
    const diagrams = Array.isArray(env.mermaidDiagrams) ? env.mermaidDiagrams : (env.mermaidDiagrams = []);
    const diagramIndex = diagrams.length;
    diagrams.push(String(token.content || ''));
    return noteMermaidPlaceholder(diagramIndex);
  };
}

function tokensHaveRenderableSyntax(tokens) {
  let paragraphCount = 0;
  const pending = [...tokens];
  while (pending.length) {
    const token = pending.shift();
    if (token.type === 'paragraph_open') paragraphCount += 1;
    if (RENDERABLE_TOKEN_TYPES.has(token.type)) return true;
    if (Array.isArray(token.children)) pending.unshift(...token.children);
  }
  return paragraphCount > 1;
}

function normalizeCacheSize(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_CACHE_SIZE;
  return Math.max(0, Math.min(512, Math.trunc(number)));
}

function loadBrowserRuntime(doc, { id, url, globalName }) {
  const globalObject = doc.defaultView || globalThis;
  if (globalObject[globalName]) return Promise.resolve(globalObject[globalName]);

  let script = doc.getElementById(id);
  if (script?.dataset.noteRuntimeState === 'error') {
    script.remove();
    script = null;
  }
  if (!script) {
    script = doc.createElement('script');
    script.id = id;
    script.src = url;
    script.defer = true;
    doc.head.append(script);
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      script.dataset.noteRuntimeState = 'loaded';
      const runtime = globalObject[globalName];
      if (runtime) resolve(runtime);
      else reject(new Error(`Local ${globalName} runtime loaded without exposing its browser API.`));
    };
    const fail = () => {
      script.dataset.noteRuntimeState = 'error';
      reject(new Error(`Could not load the local ${globalName} runtime.`));
    };
    if (script.dataset.noteRuntimeState === 'loaded') {
      finish();
      return;
    }
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });
  });
}
