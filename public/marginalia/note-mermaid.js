export const NOTE_MERMAID_VERSION = '11.16.0';
export const NOTE_MERMAID_CONFIG = Object.freeze({
  startOnLoad: false,
  securityLevel: 'strict',
  htmlLabels: false,
  suppressErrorRendering: true,
  maxTextSize: 10_000,
  maxEdges: 100,
  theme: 'neutral',
  logLevel: 'fatal'
});

const MERMAID_SCRIPT_URL = new URL('./vendor/mermaid/mermaid.min.js', import.meta.url).href;
let sharedRuntimePromise = null;
let renderQueue = Promise.resolve();
let renderId = 0;

export function noteMermaidPlaceholder(index) {
  return `<figure class="note-markdown-mermaid" data-note-mermaid-index="${Number(index)}" aria-label="Mermaid diagram"><div class="note-markdown-mermaid-status">Rendering diagram…</div></figure>`;
}

export async function renderNoteMermaidDiagrams(rendered, { document: runtimeDocument, mermaid: suppliedRuntime } = {}) {
  const diagrams = Array.isArray(rendered?.mermaidDiagrams) ? rendered.mermaidDiagrams : [];
  if (!diagrams.length) return rendered;

  const doc = runtimeDocument || globalThis.document;
  let runtime = suppliedRuntime;
  if (!runtime) {
    try {
      runtime = await loadNoteMermaidRuntime({ document: doc });
    } catch {
      return replaceAllDiagrams(rendered, (source) => renderDiagramError(source, 'Diagram renderer could not be loaded.'));
    }
  }

  let html = rendered.html;
  for (const [index, source] of diagrams.entries()) {
    let replacement;
    try {
      const svg = await enqueueRender(() => runtime.render(`note-mermaid-${++renderId}`, source));
      replacement = renderDiagramFigure(sanitizeMermaidSvg(svg?.svg, doc));
    } catch {
      replacement = renderDiagramError(source, 'Diagram could not be rendered.');
    }
    html = html.replace(noteMermaidPlaceholder(index), replacement);
  }
  return { ...rendered, html };
}

export async function loadNoteMermaidRuntime({ document: runtimeDocument } = {}) {
  if (sharedRuntimePromise) return sharedRuntimePromise;
  const doc = runtimeDocument || globalThis.document;
  if (!doc?.head) throw new Error('A browser document is required to load the Mermaid renderer.');

  sharedRuntimePromise = loadBrowserRuntime(doc).then((mermaid) => {
    mermaid.initialize(NOTE_MERMAID_CONFIG);
    return mermaid;
  });
  try {
    return await sharedRuntimePromise;
  } catch (error) {
    sharedRuntimePromise = null;
    throw error;
  }
}

function replaceAllDiagrams(rendered, createReplacement) {
  let html = rendered.html;
  for (const [index, source] of rendered.mermaidDiagrams.entries()) {
    html = html.replace(noteMermaidPlaceholder(index), createReplacement(source));
  }
  return { ...rendered, html };
}

function enqueueRender(task) {
  const current = renderQueue.then(task, task);
  renderQueue = current.catch(() => {});
  return current;
}

function renderDiagramFigure(svg) {
  return `<figure class="note-markdown-mermaid" aria-label="Mermaid diagram">${svg}</figure>`;
}

function renderDiagramError(source, message) {
  return `<figure class="note-markdown-mermaid note-markdown-mermaid-error" aria-label="Mermaid diagram error"><div class="note-markdown-mermaid-status" role="status">${escapeHtml(message)}</div><pre><code class="language-mermaid">${escapeHtml(source)}</code></pre></figure>`;
}

function sanitizeMermaidSvg(source, doc) {
  const template = doc?.createElement?.('template');
  if (!template) throw new Error('A browser document is required to sanitize Mermaid output.');
  template.innerHTML = String(source || '').trim();
  const svg = template.content.firstElementChild;
  if (!svg || svg.localName !== 'svg' || template.content.childElementCount !== 1) {
    throw new Error('Mermaid returned invalid SVG output.');
  }
  for (const element of svg.querySelectorAll('script, foreignObject, iframe, object, embed, audio, video')) {
    element.remove();
  }
  for (const element of [svg, ...svg.querySelectorAll('*')]) {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith('on') || ((name === 'href' || name === 'xlink:href') && !value.startsWith('#'))) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return svg.outerHTML;
}

function loadBrowserRuntime(doc) {
  const globalObject = doc.defaultView || globalThis;
  if (globalObject.mermaid) return Promise.resolve(globalObject.mermaid);

  let script = doc.getElementById('note-markdown-mermaid-script');
  if (script?.dataset.noteRuntimeState === 'error') {
    script.remove();
    script = null;
  }
  if (!script) {
    script = doc.createElement('script');
    script.id = 'note-markdown-mermaid-script';
    script.src = MERMAID_SCRIPT_URL;
    script.defer = true;
    doc.head.append(script);
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      script.dataset.noteRuntimeState = 'loaded';
      const runtime = globalObject.mermaid;
      if (runtime?.initialize && runtime?.render) resolve(runtime);
      else reject(new Error('Local Mermaid runtime loaded without exposing its browser API.'));
    };
    const fail = () => {
      script.dataset.noteRuntimeState = 'error';
      reject(new Error('Could not load the local Mermaid runtime.'));
    };
    if (script.dataset.noteRuntimeState === 'loaded') {
      finish();
      return;
    }
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
