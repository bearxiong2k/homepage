#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (error) {
    fail(`${relativePath}: invalid JSON (${error.message})`);
    return null;
  }
}

function countPaperFiles() {
  const dir = path.join(root, 'src/content/papers');
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).filter((file) => file.endsWith('.md')).length;
}

const requiredPaths = [
  ['package.json', 'root package manifest'],
  ['src/content.config.ts', 'Astro content schema'],
  ['src/content/papers', 'paper content directory'],
  ['src/data/taxonomy.json', 'taxonomy vocabulary'],
  ['src/pages/library.astro', 'atlas route'],
  ['src/pages/papers/[slug].astro', 'paper detail route'],
  ['scripts/export-atlas-manifest.mjs', 'atlas manifest exporter'],
  ['docs/website-integration/README.md', 'website integration guide'],
  ['docs/website-integration/plan.md', 'website integration plan']
];

for (const [relativePath, label] of requiredPaths) {
  if (!exists(relativePath)) fail(`missing ${label}: ${relativePath}`);
}

if (exists('package.json')) {
  const pkg = readJson('package.json');
  const requiredScripts = ['qa', 'validate', 'check', 'build', 'export:atlas', 'contract:website', 'smoke:website'];
  for (const script of requiredScripts) {
    if (!pkg?.scripts?.[script]) fail(`package.json missing script: ${script}`);
  }
}

if (!exists('src/pages/index.astro')) {
  warn('src/pages/index.astro not found. Add or polish this when building the personal homepage.');
}

if (!exists('src/pages/projects/index.astro')) {
  warn('src/pages/projects/index.astro not found. Add this for the project index milestone.');
}

if (!exists('src/pages/projects/cim-library.astro') && !exists('src/pages/projects/cim-library/index.astro')) {
  warn('CIM Library project landing route not found yet. Target: /projects/cim-library/.');
}

if (exists('src/data/project-registry.json')) {
  const registry = readJson('src/data/project-registry.json');
  if (registry && !Array.isArray(registry)) {
    fail('src/data/project-registry.json must be an array');
  }
  if (Array.isArray(registry)) {
    const ids = new Set();
    for (const [index, entry] of registry.entries()) {
      const prefix = `project-registry[${index}]`;
      for (const key of ['id', 'title', 'kind', 'status', 'summary', 'route']) {
        if (!entry?.[key]) fail(`${prefix} missing ${key}`);
      }
      if (entry?.id) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) fail(`${prefix} invalid id: ${entry.id}`);
        if (ids.has(entry.id)) fail(`${prefix} duplicate id: ${entry.id}`);
        ids.add(entry.id);
      }
      if (entry?.route && !String(entry.route).startsWith('/')) fail(`${prefix} route must start with /`);
      if (entry?.source_manifest && !String(entry.source_manifest).startsWith('/')) {
        fail(`${prefix} source_manifest must start with /`);
      }
    }
    if (!registry.some((entry) => entry.id === 'cim-library')) {
      warn('project registry has no cim-library entry');
    }
  }
} else {
  warn('src/data/project-registry.json not found. Run node scripts/install-website-devkit.mjs.');
}

const manifestPath = 'public/cim-library.manifest.json';
if (exists(manifestPath)) {
  const manifest = readJson(manifestPath);
  if (manifest) {
    for (const key of ['schema_version', 'id', 'title', 'kind', 'route', 'generated_at', 'source', 'stats', 'papers']) {
      if (manifest[key] === undefined || manifest[key] === null || manifest[key] === '') {
        fail(`${manifestPath} missing ${key}`);
      }
    }
    if (manifest.id !== 'cim-library') fail(`${manifestPath} id should be cim-library`);
    if (manifest.route !== '/library/') fail(`${manifestPath} route should be /library/`);
    if (!Array.isArray(manifest.papers)) fail(`${manifestPath} papers must be an array`);
    const paperFiles = countPaperFiles();
    if (Array.isArray(manifest.papers) && manifest.papers.length !== paperFiles) {
      fail(`${manifestPath} papers length (${manifest.papers.length}) does not match src/content/papers count (${paperFiles})`);
    }
    if (manifest.stats?.paper_count !== paperFiles) {
      fail(`${manifestPath} stats.paper_count (${manifest.stats?.paper_count}) does not match src/content/papers count (${paperFiles})`);
    }
    if (!manifest.stats?.axis_A_counts || !manifest.stats?.axis_B_counts) {
      fail(`${manifestPath} missing axis count summaries`);
    }
  }
} else {
  fail(`${manifestPath} not found. Run npm run export:atlas first.`);
}

console.log('[website-contract] checked static website integration contract');
for (const message of warnings) console.warn(`[website-contract] WARN: ${message}`);

if (failures.length) {
  for (const message of failures) console.error(`[website-contract] ERROR: ${message}`);
  process.exit(1);
}

console.log('[website-contract] OK');
