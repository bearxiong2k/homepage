#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const outputPath = outIndex >= 0 && args[outIndex + 1]
  ? args[outIndex + 1]
  : 'public/cim-library.manifest.json';

const taxonomyPath = path.join(root, 'src/data/taxonomy.json');
const clustersPath = path.join(root, 'src/data/clusters.json');
const papersDir = path.join(root, 'src/content/papers');
const outputAbs = path.resolve(root, outputPath);
const paperListOutputAbs = path.resolve(root, 'public/cim-library-paper-list.md');

function fail(message) {
  console.error(`[export-atlas-manifest] ERROR: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`[export-atlas-manifest] WARN: ${message}`);
}

function stripQuotes(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed === '~' || trimmed === 'null') return '';
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function splitInlineList(value) {
  const source = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  const items = [];
  let current = '';
  let quote = null;
  for (const char of source) {
    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      current += char;
      continue;
    }
    if (char === quote) {
      quote = null;
      current += char;
      continue;
    }
    if (char === ',' && quote === null) {
      const cleaned = stripQuotes(current);
      if (cleaned) items.push(cleaned);
      current = '';
      continue;
    }
    current += char;
  }
  const cleaned = stripQuotes(current);
  if (cleaned) items.push(cleaned);
  return items;
}

function extractFrontmatter(markdown, file) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) fail(`${file}: missing YAML frontmatter`);
  return match[1];
}

function linesOf(frontmatter) {
  return frontmatter.split(/\r?\n/);
}

function findTopLevel(lines, key) {
  const pattern = new RegExp(`^${key}:\\s*(.*)$`);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(pattern);
    if (match) return { index, value: match[1] ?? '' };
  }
  return null;
}

function collectIndented(lines, startIndex) {
  const block = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(' ') && !line.startsWith('\t')) break;
    block.push(line);
  }
  return block;
}

function scalar(frontmatter, key) {
  const lines = linesOf(frontmatter);
  const hit = findTopLevel(lines, key);
  if (!hit) return '';
  const raw = hit.value.trim();
  if (/^[>|]/.test(raw)) {
    return collectIndented(lines, hit.index)
      .map((line) => line.replace(/^\s+/, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return stripQuotes(raw);
}

function list(frontmatter, key) {
  const lines = linesOf(frontmatter);
  const hit = findTopLevel(lines, key);
  if (!hit) return [];
  const raw = hit.value.trim();
  if (raw.startsWith('[') && raw.endsWith(']')) return splitInlineList(raw);
  if (raw) return [stripQuotes(raw)].filter(Boolean);
  return collectIndented(lines, hit.index)
    .map((line) => line.match(/^\s*-\s*(.*)$/)?.[1] ?? '')
    .map(stripQuotes)
    .filter(Boolean);
}

function nestedBlock(frontmatter, blockKey) {
  const lines = linesOf(frontmatter);
  const hit = findTopLevel(lines, blockKey);
  if (!hit) return [];
  return collectIndented(lines, hit.index);
}

function nestedScalar(frontmatter, blockKey, key) {
  const block = nestedBlock(frontmatter, blockKey);
  const pattern = new RegExp(`^\\s+${key}:\\s*(.*)$`);
  for (let index = 0; index < block.length; index += 1) {
    const match = block[index].match(pattern);
    if (match) return stripQuotes(match[1]);
  }
  return '';
}

function nestedList(frontmatter, blockKey, key) {
  const block = nestedBlock(frontmatter, blockKey);
  const pattern = new RegExp(`^\\s+${key}:\\s*(.*)$`);
  for (let index = 0; index < block.length; index += 1) {
    const match = block[index].match(pattern);
    if (!match) continue;
    const raw = match[1].trim();
    if (raw.startsWith('[') && raw.endsWith(']')) return splitInlineList(raw);
    if (raw) return [stripQuotes(raw)].filter(Boolean);
    const nested = [];
    for (let child = index + 1; child < block.length; child += 1) {
      const line = block[child];
      if (/^\s+\S/.test(line) && !/^\s+-\s+/.test(line)) break;
      const item = line.match(/^\s+-\s*(.*)$/)?.[1] ?? '';
      if (item) nested.push(stripQuotes(item));
    }
    return nested.filter(Boolean);
  }
  return [];
}

function asYear(value) {
  const cleaned = stripQuotes(value);
  if (!cleaned) return null;
  const number = Number.parseInt(cleaned, 10);
  return Number.isFinite(number) ? number : null;
}

function inc(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

function topEntries(map, limit = 12) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function markdownCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function markdownLink(label, url) {
  if (!url) return 'Not recorded';
  return `[${markdownCell(label)}](${url})`;
}

const FALLBACK_OBJECT = 'Uncategorized object';
const FALLBACK_REWRITE = 'Uncategorized rewrite';

const objectRules = [
  ['macro template', /\b(macro|template|rtl|netlist|verilog|subcircuit|eda|apr|lef|lib)\b|\b(physical layout|macro layout|layout generation|layout artifact)\b/],
  ['hardware hierarchy', /\b(chip|tile|core|bank|subarray|mat|node|hierarchy|level|dpu|mram|wram|alu|interconnect|buffer|noc|h tree|memory hierarchy)\b/],
  ['crossbar / array', /\b(crossbar|array|xb|mvmu|ou|rram|reram|pcm|sram|bitcell|1t1r|wordline|bitline|compute lookup)\b/],
  ['operator graph', /\b(graph|operator|op|dag|onnx|torch|layer|conv|matmul|gemm|gemv)\b|\b(model graph|neural network|network topology)\b/],
  ['loop / tensor schedule', /\b(loop|tensor|schedule|tiling|partition|linalg|affine|polyhedral|dataflow|scatter|gather|einsum)\b|\b(loop tile|tensor tile)\b/],
  ['instruction stream', /\b(instruction|command|isa|microprogram|u program|meta op)\b|\b(trace|program|kernel|launch|code)\s+(stream|sequence|file|artifact|generation|queue)\b/],
  ['numeric format', /\b(bit|precision|quant|numeric|fixed|float|bf16|int\d*|format|shift|compressor|approx|exponent|fraction|significance|cell precision)\b/],
  ['ADC / DAC / peripherals', /\b(adc|dac|peripheral|sense|sensing|mux|driver|accumulator|adder|shift add|post processing|reduction path)\b/],
  ['nonideality / faults', /\b(nonideality|fault|variation|drift|noise|error|accuracy|calibration|bist|test vector|ir drop)\b/],
  ['runtime state', /\b(runtime|request|batch|cache|kv|tasklet|thread|host|device state|launch state)\b/],
  ['sparsity / masks', /\b(sparse|sparsity|mask|prun|zero|block diagonal|monarch)\b/],
  ['benchmark API', /\b(benchmark|api|workload|baseline|harness|iterator|programming interface)\b/],
  ['chip / emulator address', /\b(address|coordinate|emulator|chip in loop|array coordinate)\b/],
  ['memory service properties', /\b(memory service|cache|consistency|bandwidth|latency|capacity|mram|wram|global memory|local memory)\b/]
];

const rewriteRules = [
  ['hardware-template', /\b(template|macro|architecture|hardware configuration|eda|rtl|netlist|subcircuit|design candidate|generated backend flow)\b|\b(physical layout|macro layout|layout generation|layout artifact)\b/],
  ['graph', /\b(graph|operator|fusion|split|segmentation|conv|matmul|edge|boolean)\b|\bgraph topology\b/],
  ['loop', /\b(loop|tensor|schedule|tiling|dataflow|affine|polyhedral|partition)\b|\b(loop tile|tensor tile)\b/],
  ['mapping', /\b(mapping|placement|allocation|binding|layout|resource|array|core|memory layout|data placement|replication)\b/],
  ['mode', /\b(mode|compute memory|access mode|buffering|analog digital|device mode)\b/],
  ['instruction', /\b(instruction|command|trace|microprogram|code generation|api sequence|meta op|backend api)\b/],
  ['numeric', /\b(numeric|precision|bit width|quant|approx|fixed point|compression|encoding|fraction|exponent|format)\b/],
  ['runtime', /\b(runtime|batch|data movement|copy|communication|cache|tasklet|host|device|spilling)\b/],
  ['accuracy', /\b(accuracy|fault|variation|calibration|nonideality|remap|bist|test vector|error)\b/],
  ['benchmark', /\b(benchmark|workload|baseline|harness|porting|api command)\b/]
];

function normalizeTerm(term) {
  return String(term ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[_/.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function classify(terms, rules, allowed, fallback) {
  const matches = [];
  for (const raw of terms) {
    const term = normalizeTerm(raw);
    for (const [category, pattern] of rules) {
      if (allowed.has(category) && pattern.test(term)) matches.push(category);
    }
  }
  return matches.length ? unique(matches) : [fallback];
}

if (!fs.existsSync(taxonomyPath)) fail(`missing ${path.relative(root, taxonomyPath)}`);
if (!fs.existsSync(papersDir)) fail(`missing ${path.relative(root, papersDir)}`);

const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const clustersData = fs.existsSync(clustersPath)
  ? JSON.parse(fs.readFileSync(clustersPath, 'utf8'))
  : null;
const objectAllowed = new Set([...(taxonomy.objects_vocab || []), FALLBACK_OBJECT]);
const rewriteLabels = taxonomy.rewrite_types || {};
const rewriteAllowed = new Set([...Object.keys(rewriteLabels), FALLBACK_REWRITE]);

const files = fs.readdirSync(papersDir).filter((file) => file.endsWith('.md')).sort();
if (!files.length) fail('no paper Markdown files found');

const axisACounts = {};
const axisBCounts = {};
const objectCounts = {};
const rewriteCounts = {};
const technologyCounts = {};
const workloadCounts = {};
const tagCounts = {};
const years = [];
const papers = [];

for (const file of files) {
  const markdown = fs.readFileSync(path.join(papersDir, file), 'utf8');
  const frontmatter = extractFrontmatter(markdown, file);
  const slug = scalar(frontmatter, 'slug');
  const title = scalar(frontmatter, 'title');
  if (!slug || !title) fail(`${file}: missing slug or title`);

  const year = asYear(scalar(frontmatter, 'year'));
  if (year) years.push(year);

  const axisA = {
    primary: nestedScalar(frontmatter, 'axis_A', 'primary'),
    secondary: nestedList(frontmatter, 'axis_A', 'secondary')
  };
  const axisB = list(frontmatter, 'axis_B');
  const axisCObjects = list(frontmatter, 'axis_C_first_class_objects');
  const axisDRewrites = list(frontmatter, 'axis_D_rewrite_objects');
  const normalizedObjects = classify(axisCObjects, objectRules, objectAllowed, FALLBACK_OBJECT);
  const normalizedRewriteCodes = classify(axisDRewrites, rewriteRules, rewriteAllowed, FALLBACK_REWRITE);
  const normalizedRewrites = normalizedRewriteCodes.map((code) => rewriteLabels[code] || code);
  const technology = list(frontmatter, 'technology');
  const workloads = list(frontmatter, 'workloads');
  const tags = list(frontmatter, 'tags');
  const links = {
    paper: nestedScalar(frontmatter, 'links', 'paper'),
    artifact: nestedScalar(frontmatter, 'links', 'artifact'),
    docs: nestedScalar(frontmatter, 'links', 'docs'),
    code: nestedScalar(frontmatter, 'links', 'code')
  };

  inc(axisACounts, axisA.primary);
  axisA.secondary.forEach((code) => inc(axisACounts, code));
  axisB.forEach((code) => inc(axisBCounts, code));
  normalizedObjects.forEach((item) => inc(objectCounts, item));
  normalizedRewrites.forEach((item) => inc(rewriteCounts, item));
  technology.forEach((item) => inc(technologyCounts, item));
  workloads.forEach((item) => inc(workloadCounts, item));
  tags.forEach((item) => inc(tagCounts, item));

  papers.push({
    slug,
    title,
    subtitle: scalar(frontmatter, 'subtitle') || null,
    year,
    venue: scalar(frontmatter, 'venue') || null,
    authors_or_group: scalar(frontmatter, 'authors_or_group') || null,
    summary: scalar(frontmatter, 'summary'),
    route: `/papers/${slug}/`,
    links,
    technology,
    workloads,
    tags,
    baselines: list(frontmatter, 'baselines'),
    axis_A: axisA,
    axis_B: axisB,
    axis_C_first_class_objects: axisCObjects,
    axis_C_object_vocab: normalizedObjects,
    axis_D_rewrite_objects: axisDRewrites,
    axis_D_rewrite_types: normalizedRewrites,
    artifact_status: nestedScalar(frontmatter, 'artifact', 'status') || 'unknown',
    artifact_url: nestedScalar(frontmatter, 'artifact', 'url') || null,
    reproducibility_level: scalar(frontmatter, 'reproducibility_level') || 'unknown'
  });
}

const clusterPapers = new Set();
const clusterLayer = clustersData ? {
  route: clustersData.route || '/clusters/',
  source_path: 'src/data/clusters.json',
  methodology: clustersData.methodology || [],
  stats: {
    cluster_count: clustersData.clusters.length,
    linked_paper_count: 0,
    working_group_count: clustersData.clusters.reduce((sum, cluster) => sum + (cluster.working_groups?.length || 0), 0),
    investigation_count: clustersData.clusters.reduce((sum, cluster) => sum + (cluster.working_group_investigations?.length || 0), 0)
  },
  clusters: clustersData.clusters.map((cluster) => {
    [...cluster.representative_papers, ...cluster.supporting_papers].forEach((slug) => clusterPapers.add(slug));
    return {
      id: cluster.id,
      label: cluster.label,
      short_label: cluster.short_label,
      status: cluster.status,
      route: `${clustersData.route || '/clusters/'}#${cluster.id}`,
      analysis: cluster.analysis || null,
      representative_papers: cluster.representative_papers,
      supporting_papers: cluster.supporting_papers,
      object_flow: cluster.object_flow || [],
      working_group_count: cluster.working_groups?.length || 0,
      investigation_count: cluster.working_group_investigations?.length || 0,
      atlas_query: cluster.atlas_query
    };
  })
} : null;

if (clusterLayer) clusterLayer.stats.linked_paper_count = clusterPapers.size;

const manifest = {
  schema_version: '0.2.0',
  id: 'cim-library',
  title: 'CIM Compiler/IR Paper Library',
  kind: 'research-atlas',
  route: '/library/',
  generated_at: new Date().toISOString(),
  source: {
    content_root: 'src/content/papers',
    taxonomy_path: 'src/data/taxonomy.json',
    clusters_path: clustersData ? 'src/data/clusters.json' : null,
    paper_count: files.length
  },
  routes: {
    home: '/',
    project_index: '/projects/',
    project: '/projects/cim-library/',
    methodology: '/projects/cim-library/methodology/',
    atlas: '/library/',
    clusters: clustersData?.route || '/clusters/',
    paper_list_markdown: '/cim-library-paper-list.md',
    paper_index: '/papers/',
    paper_detail_pattern: '/papers/[slug]/'
  },
  views: [
    {
      id: 'axis-ab-atlas',
      route: '/library/',
      label: 'Axis A x Axis B atlas',
      description: 'Interactive stack-role by middle-layer atlas over all paper entries.'
    },
    {
      id: 'axis-cd-atlas',
      route: '/library/?layout=cd',
      label: 'Axis C x Axis D atlas',
      description: 'Normalized first-class object by rewrite-object atlas view.'
    },
    {
      id: 'cluster-notes',
      route: clustersData?.route || '/clusters/',
      label: 'Cluster and working-group notes',
      description: 'Hand-authored cluster hypotheses and coarse investigation notes over the corpus.'
    },
    {
      id: 'paper-notes',
      route: '/papers/',
      label: 'Paper notes',
      description: 'Plain listing of all recorded paper notes in the CIM Library.'
    },
    {
      id: 'methodology',
      route: '/projects/cim-library/methodology/',
      label: 'Methodology',
      description: 'Under-construction notes on AI-assisted scoped corpus methodology.'
    }
  ],
  taxonomy: {
    schema_version: taxonomy.schema_version || null,
    axis_A: taxonomy.families || {},
    axis_B: taxonomy.middles || {},
    objects_vocab: taxonomy.objects_vocab || [],
    rewrite_types: taxonomy.rewrite_types || {}
  },
  stats: {
    paper_count: papers.length,
    year_min: years.length ? Math.min(...years) : null,
    year_max: years.length ? Math.max(...years) : null,
    axis_A_counts: axisACounts,
    axis_B_counts: axisBCounts,
    axis_C_object_vocab_counts: objectCounts,
    axis_D_rewrite_type_counts: rewriteCounts,
    top_technologies: topEntries(technologyCounts),
    top_workloads: topEntries(workloadCounts),
    top_tags: topEntries(tagCounts)
  },
  cluster_layer: clusterLayer,
  papers: papers.sort((a, b) => a.title.localeCompare(b.title))
};

if (papers.length !== files.length) {
  warn(`paper count mismatch: files=${files.length}, parsed=${papers.length}`);
}

fs.mkdirSync(path.dirname(outputAbs), { recursive: true });
fs.writeFileSync(outputAbs, `${JSON.stringify(manifest, null, 2)}\n`);
const paperListMarkdown = [
  '# CIM Library Paper List',
  '',
  `Generated from src/content/papers. Paper count: ${manifest.papers.length}.`,
  '',
  '| Title | Year | Library note | Paper link |',
  '|---|---:|---|---|',
  ...manifest.papers.map((paper) => [
    markdownCell(paper.title),
    paper.year ?? '',
    markdownLink('note', paper.route),
    markdownLink('paper', paper.links?.paper)
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')),
  ''
].join('\n');
fs.writeFileSync(paperListOutputAbs, paperListMarkdown);
console.log(`[export-atlas-manifest] wrote ${path.relative(root, outputAbs)} with ${papers.length} papers`);
console.log(`[export-atlas-manifest] wrote ${path.relative(root, paperListOutputAbs)}`);
