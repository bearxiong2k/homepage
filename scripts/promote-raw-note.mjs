#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const papersDir = path.join(root, 'src/content/papers');
const dryRun = process.argv.includes('--dry-run');
const inputs = process.argv.slice(2).filter((arg) => arg !== '--dry-run');

if (!inputs.length) {
  console.error('Usage: node scripts/promote-raw-note.mjs [--dry-run] <paper-note.md> [...]');
  process.exit(1);
}

function quote(value) {
  if (value === null || value === undefined || value === '') return '';
  const escaped = String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return `"${escaped}"`;
}

function blockScalar(value, indent = '  ') {
  const text = String(value || '').trim();
  if (!text) return '""';
  return `>-\n${text.split(/\r?\n/).map((line) => `${indent}${line.trim()}`).join('\n')}`;
}

function normalizeSlug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function schemaAxis(value) {
  const match = String(value || '').match(/A([1-6])/i);
  return match ? `A${match[1]}` : null;
}

function schemaMiddle(value) {
  const match = String(value || '').match(/B([1-7])/i);
  return match ? `B${match[1]}` : null;
}

function schemaYear(value) {
  if (value === null || value === undefined || value === '') return '';
  if (Number.isInteger(value)) return value;
  const match = String(value).trim().match(/^(\d{4})(?:\b|$)/);
  return match ? Number(match[1]) : '';
}

function schemaUrl(value) {
  if (value === null || value === undefined || value === '') return '';
  try {
    const url = new URL(String(value).trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function warn(file, message) {
  console.error(`warning: ${file}: ${message}`);
}

function parseScalar(raw) {
  const value = String(raw || '').trim();
  if (value === 'null' || value === '~') return null;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  const number = Number(value);
  if (/^\d+$/.test(value) && Number.isFinite(number)) return number;
  return value;
}

function parseSuggestedYaml(yaml) {
  const result = {};
  const lines = yaml.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const top = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!top) {
      i += 1;
      continue;
    }

    const key = top[1];
    const rest = top[2] || '';
    if (rest.trim()) {
      result[key] = parseScalar(rest);
      i += 1;
      continue;
    }

    const block = [];
    i += 1;
    while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
      block.push(lines[i]);
      i += 1;
    }

    const hasList = block.some((entry) => entry.match(/^\s+-\s+/));
    const hasMap = block.some((entry) => entry.match(/^\s+[A-Za-z0-9_]+:/));
    if (hasList && !hasMap) {
      result[key] = block
        .map((entry) => entry.match(/^\s+-\s+(.*)$/))
        .filter(Boolean)
        .map((match) => parseScalar(match[1]));
    } else {
      const object = {};
      let currentListKey = null;
      for (const entry of block) {
        const mapEntry = entry.match(/^\s{2}([A-Za-z0-9_]+):(?:\s*(.*))?$/);
        const listEntry = entry.match(/^\s{4}-\s+(.*)$/);
        if (mapEntry) {
          currentListKey = null;
          const childKey = mapEntry[1];
          const childRest = mapEntry[2] || '';
          if (childRest.trim()) {
            object[childKey] = parseScalar(childRest);
          } else {
            object[childKey] = [];
            currentListKey = childKey;
          }
        } else if (listEntry && currentListKey) {
          object[currentListKey].push(parseScalar(listEntry[1]));
        }
      }
      result[key] = object;
    }
  }
  return result;
}

function extractSummary(body, file) {
  const match = body.match(/## 2\. One-paragraph public summary\s*\n([\s\S]*?)(?=\n## 3\.)/);
  if (!match) throw new Error(`${file}: cannot find section 2 summary`);
  return match[1].trim().replace(/\n+/g, ' ');
}

function extractSuggested(markdown, file) {
  const section = markdown.match(/\n## 12\. Suggested metadata entry[\s\S]*?```yaml\s*\n([\s\S]*?)\n```[\s\S]*$/);
  if (!section) throw new Error(`${file}: cannot find section 12 YAML`);
  let body = markdown.slice(0, section.index).trimEnd();
  body = body.replace(/\n## 9\. Relation to a value-trajectory CIM IR project\n[\s\S]*?(?=\n## 10\. Comparison to nearby works)/, '');
  body = body.replace(/\n## 10\. Comparison to nearby works/g, '\n## 9. Comparison to nearby works');
  body = body.replace(/\n## 11\. Corpus-ready final takeaway/g, '\n## 10. Corpus-ready final takeaway');
  return { body, yaml: section[1].trim() };
}

function yamlList(values, indent = '') {
  const items = Array.isArray(values) ? values.filter((value) => value !== null && value !== undefined && value !== '') : [];
  if (!items.length) return `${indent}[]`;
  return `\n${items.map((value) => `${indent}- ${quote(value)}`).join('\n')}`;
}

function publicationType(value) {
  const text = String(value || '').toLowerCase();
  if (text.includes('arxiv')) return 'preprint';
  if (text.includes('journal') || text.includes('transactions') || text.includes('letters')) return 'article';
  if (text.includes('repository') || text.includes('github') || text.includes('artifact')) return 'artifact';
  if (text.trim()) return 'conference';
  return '';
}

function bibtexKey(slug) {
  return slug.replace(/[^A-Za-z0-9:_-]/g, '');
}

function bibtexEntry(slug, title, year, publication, authors, authorNote) {
  const entryType = publication.type === 'article'
    ? 'article'
    : publication.type === 'conference'
      ? 'inproceedings'
      : 'misc';
  const lines = [
    `@${entryType}{${bibtexKey(slug)},`,
    `  title = {${String(title).replace(/[{}]/g, '')}},`
  ];
  if (authors.length) {
    lines.push(`  author = {${authors.map((author) => String(author).replace(/[{}]/g, '')).join(' and ')}},`);
  } else if (authorNote) {
    lines.push(`  author = {${String(authorNote).replace(/[{}]/g, '')}},`);
  }
  if (year) lines.push(`  year = {${year}},`);
  if (publication.venue) lines.push(`  howpublished = {${String(publication.venue).replace(/[{}]/g, '')}},`);
  if (publication.doi) lines.push(`  doi = {${publication.doi}},`);
  if (publication.url) lines.push(`  url = {${publication.url}},`);
  lines.push('}');
  return lines.map((line) => `  ${line}`).join('\n');
}

function buildFrontmatter(slug, metadata, summary, file) {
  const title = metadata.paper || metadata.title;
  if (!title) throw new Error(`${slug}: missing paper/title field`);

  const primary = schemaAxis(metadata.axis_A?.primary);
  if (!primary) throw new Error(`${slug}: missing schema-compatible axis_A.primary`);

  const rawSecondary = Array.isArray(metadata.axis_A?.secondary)
    ? metadata.axis_A.secondary
    : metadata.axis_A?.secondary
      ? [metadata.axis_A.secondary]
      : [];
  const secondary = [...new Set(rawSecondary.map(schemaAxis).filter(Boolean).filter((code) => code !== primary))];

  const axisB = [...new Set((metadata.axis_B || []).map(schemaMiddle).filter(Boolean))];
  if (!axisB.length) throw new Error(`${slug}: missing schema-compatible axis_B`);

  const artifact = metadata.artifact || {};
  const year = schemaYear(metadata.year);
  if (metadata.year && year === '') {
    warn(file, `non-numeric year "${metadata.year}" converted to blank/null`);
  }

  const artifactUrl = schemaUrl(artifact.url);
  if (artifact.url && artifactUrl === '') {
    warn(file, `non-URL artifact.url "${artifact.url}" converted to blank/null`);
  }

  const publicationInput = metadata.publication || {};
  const publication = {
    venue: publicationInput.venue || metadata.venue || '',
    type: publicationInput.type || publicationType(publicationInput.venue || metadata.venue),
    doi: publicationInput.doi || '',
    url: schemaUrl(publicationInput.url)
  };
  const authors = Array.isArray(metadata.authors) ? metadata.authors : [];
  const authorNote = metadata.author_note || metadata.authors_or_group || '';

  const reproducibility = ['high', 'medium', 'low', 'unknown'].includes(metadata.reproducibility_level)
    ? metadata.reproducibility_level
    : 'unknown';
  if (metadata.reproducibility_level && reproducibility === 'unknown' && metadata.reproducibility_level !== 'unknown') {
    warn(file, `unsupported reproducibility_level "${metadata.reproducibility_level}" converted to "unknown"`);
  }

  return `---\n` +
    `slug: ${slug}\n` +
    `title: ${quote(title)}\n` +
    `subtitle: "Scoped CIM stack note"\n` +
    `year: ${year}\n` +
    `publication:\n` +
    `  venue: ${quote(publication.venue)}\n` +
    `  type: ${quote(publication.type)}\n` +
    `  doi: ${quote(publication.doi)}\n` +
    `  url: ${quote(publication.url)}\n` +
    `authors:${yamlList(authors, '  ')}\n` +
    (authorNote && !authors.length ? `author_note: ${quote(authorNote)}\n` : '') +
    `bibtex: |\n${bibtexEntry(slug, title, year, publication, authors, authorNote)}\n` +
    `summary: ${blockScalar(summary)}\n` +
    `links:\n` +
    `  paper:\n` +
    `  artifact:\n` +
    `  docs:\n` +
    `  code:\n` +
    `technology:${yamlList(metadata.technology, '  ')}\n` +
    `workloads:${yamlList(metadata.workloads, '  ')}\n` +
    `tags: []\n` +
    `baselines: []\n` +
    `axis_A:\n` +
    `  primary: ${primary}\n` +
    `  secondary: [${secondary.join(', ')}]\n` +
    `axis_B: [${axisB.join(', ')}]\n` +
    `axis_C_first_class_objects:${yamlList(metadata.axis_C_first_class_objects, '  ')}\n` +
    `axis_D_rewrite_objects:${yamlList(metadata.axis_D_rewrite_objects, '  ')}\n` +
    `artifact:\n` +
    `  status: ${quote(artifact.status || 'unknown')}\n` +
    `  url: ${quote(artifactUrl)}\n` +
    `  license: ${quote(artifact.license)}\n` +
    `  last_checked: ${quote(artifact.last_checked)}\n` +
    `integration_roles:${yamlList(metadata.integration_roles, '  ')}\n` +
    `reproducibility_level: ${reproducibility}\n` +
    `notes:${yamlList(metadata.notes, '  ')}\n` +
    `takeaways: []\n` +
    `---`;
}

function sameExistingFile(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  return fs.realpathSync.native(a) === fs.realpathSync.native(b);
}

for (const input of inputs) {
  const source = path.isAbsolute(input) ? input : path.join(root, input);
  const markdown = fs.readFileSync(source, 'utf8');
  if (markdown.startsWith('---\n')) throw new Error(`${input}: already has frontmatter`);

  const { body, yaml } = extractSuggested(markdown, input);
  const metadata = parseSuggestedYaml(yaml);
  const slug = normalizeSlug(metadata.slug || path.basename(source, '.md'));
  const summary = extractSummary(body, input);
  const frontmatter = buildFrontmatter(slug, metadata, summary, input);
  const target = path.join(papersDir, `${slug}.md`);
  const output = `${frontmatter}\n\n${body}\n`;
  const sameCaseInsensitiveFile = target !== source && sameExistingFile(source, target);

  if (target !== source && fs.existsSync(target) && !sameCaseInsensitiveFile) {
    throw new Error(`${input}: target already exists: ${path.relative(root, target)}`);
  }

  if (dryRun) {
    console.log(`${path.relative(root, source)} -> ${path.relative(root, target)} (${slug})`);
    continue;
  }

  if (sameCaseInsensitiveFile) {
    const temp = path.join(papersDir, `.${slug}.migration.tmp`);
    fs.writeFileSync(temp, output);
    fs.unlinkSync(source);
    fs.renameSync(temp, target);
  } else {
    fs.writeFileSync(target, output);
    if (target !== source) fs.unlinkSync(source);
  }
  console.log(`migrated ${path.relative(root, source)} -> ${path.relative(root, target)}`);
}
