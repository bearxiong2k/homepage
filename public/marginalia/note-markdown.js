import { installNoteMath } from './note-math.js';

export const NOTE_MARKDOWN_RENDERER_VERSION = '1:markdown-it-14.3.0:katex-0.17.0';

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
    const entry = {
      tokens,
      hasRenderableSyntax: tokensHaveRenderableSyntax(tokens),
      html: null
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
      if (entry.html === null) entry.html = md.renderer.render(entry.tokens, md.options, {});
      return {
        html: entry.html,
        hasRenderableSyntax: entry.hasRenderableSyntax
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
  return renderer.render(source);
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
