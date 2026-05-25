#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { citationDisplayMetadata } from '../src/lib/bibtex.js';

const root = process.cwd();
const papersDir = path.join(root, 'src/content/papers');
const syncAll = process.argv.includes('--all');

function frontmatter(markdown, file) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter block`);
  return { block: match[1], start: match.index, end: match[0].length };
}

function block(fm, key) {
  const match = fm.match(new RegExp(`^${key}:.*\\n([\\s\\S]*?)(?=^[A-Za-z0-9_]+:|(?![\\s\\S]))`, 'm'));
  return match ? match[1].replace(/^  /gm, '').trim() : '';
}

function quote(value) {
  if (value === null || value === undefined || value === '') return '';
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function nestedScalar(fm, blockKey, key) {
  const source = fm.match(new RegExp(`^${blockKey}:.*\\n([\\s\\S]*?)(?=^[A-Za-z0-9_]+:|(?![\\s\\S]))`, 'm'))?.[1] ?? '';
  const line = source.split('\n').find((item) => new RegExp(`^\\s+${key}:`).test(item));
  if (!line) return '';
  const value = line.replace(new RegExp(`^\\s+${key}:\\s*`), '').trim();
  return value.replace(/^['"]|['"]$/g, '');
}

function yamlList(values) {
  if (!values.length) return 'authors: []';
  return `authors:\n${values.map((value) => `  - ${quote(value)}`).join('\n')}`;
}

function replaceTopLevelScalar(fm, key, value) {
  const replacement = `${key}: ${value}`;
  return fm.replace(new RegExp(`^${key}:.*$`, 'm'), replacement);
}

function replacePublication(fm, publication) {
  const next = [
    'publication:',
    `  venue: ${quote(publication.venue)}`,
    `  type: ${quote(publication.type)}`,
    `  doi: ${quote(publication.doi)}`,
    `  url: ${quote(publication.url)}`
  ].join('\n');
  return fm.replace(/^publication:.*\n(?:\s+.*\n)*/m, `${next}\n`);
}

function replaceAuthors(fm, authors) {
  return fm.replace(/^authors:.*\n(?:\s+- .*\n)*/m, `${yamlList(authors)}\n`);
}

const files = fs.readdirSync(papersDir).filter((name) => name.endsWith('.md')).sort();
let changed = 0;

for (const file of files) {
  const full = path.join(papersDir, file);
  const markdown = fs.readFileSync(full, 'utf8');
  const parsed = frontmatter(markdown, file);
  if (!syncAll && !/^citation_source:\s*\S+/m.test(parsed.block)) continue;
  const citation = citationDisplayMetadata(block(parsed.block, 'bibtex'));
  if (!citation.title) continue;

  let fm = parsed.block;
  if (citation.year) fm = replaceTopLevelScalar(fm, 'year', citation.year);
  if (citation.publication.venue) {
    fm = replacePublication(fm, {
      ...citation.publication,
      doi: citation.publication.doi || nestedScalar(fm, 'publication', 'doi'),
      url: citation.publication.url || nestedScalar(fm, 'publication', 'url')
    });
  }
  if (citation.authors.length) fm = replaceAuthors(fm, citation.authors);

  if (fm !== parsed.block) {
    const next = `---\n${fm}\n---${markdown.slice(parsed.end)}`;
    fs.writeFileSync(full, next);
    changed += 1;
  }
}

console.log(`Synced bibtex-derived display metadata in ${changed} paper file(s).`);
