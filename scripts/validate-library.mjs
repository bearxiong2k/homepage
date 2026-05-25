#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { citationDisplayMetadata } from '../src/lib/bibtex.js';

const root = process.cwd();
const taxonomyPath = path.join(root, 'src/data/taxonomy.json');
const papersDir = path.join(root, 'src/content/papers');
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const familyCodes = new Set(Object.keys(taxonomy.families));
const middleCodes = new Set(Object.keys(taxonomy.middles));
const requiredTopLevel = ['slug', 'title', 'short_title', 'year', 'publication', 'authors', 'bibtex', 'summary', 'axis_A', 'axis_B'];

function frontmatter(markdown, file) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter block`);
  return match[1];
}

function getScalar(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function getBlock(fm, key) {
  const match = fm.match(new RegExp(`^${key}:.*\\n([\\s\\S]*?)(?=^[A-Za-z0-9_]+:|(?![\\s\\S]))`, 'm'));
  return match ? match[1] : '';
}

function getNestedScalar(fm, blockKey, key) {
  const block = getBlock(fm, blockKey);
  const match = block.match(new RegExp(`^\\s+${key}:\\s*(.*)$`, 'm'));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function getInlineList(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]`, 'm'));
  if (!match) return [];
  return match[1]
    .split(',')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function getYamlList(fm, key) {
  const inline = getInlineList(fm, key);
  if (inline.length || new RegExp(`^${key}:\\s*\\[\\]`, 'm').test(fm)) return inline;
  return getBlock(fm, key)
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*-\s*(.*)$/)?.[1] ?? '')
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(papersDir)) fail(`missing papers directory: ${papersDir}`);
const files = fs.readdirSync(papersDir).filter((name) => name.endsWith('.md')).sort();
if (!files.length) fail('no Markdown papers found in src/content/papers');

const slugs = new Set();
for (const file of files) {
  const full = path.join(papersDir, file);
  const fm = frontmatter(fs.readFileSync(full, 'utf8'), file);
  for (const key of requiredTopLevel) {
    if (!new RegExp(`^${key}:`, 'm').test(fm)) fail(`${file}: missing required key "${key}"`);
  }
  if (/^venue:/m.test(fm)) fail(`${file}: legacy top-level "venue" must move under publication.venue`);
  if (/^authors_or_group:/m.test(fm)) fail(`${file}: legacy top-level "authors_or_group" must move to authors/author_note`);

  const slug = getScalar(fm, 'slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`${file}: invalid slug "${slug}"`);
  if (slugs.has(slug)) fail(`${file}: duplicate slug "${slug}"`);
  slugs.add(slug);

  const publicationBlock = getBlock(fm, 'publication');
  if (!/^\s+venue:/m.test(publicationBlock)) fail(`${file}: publication.venue is required`);
  if (!/^\s+type:/m.test(publicationBlock)) fail(`${file}: publication.type is required`);
  const bibtex = getBlock(fm, 'bibtex');
  if (!/@(article|inproceedings|misc)\{/.test(bibtex)) fail(`${file}: bibtex must contain an article, inproceedings, or misc entry`);
  const citationSource = getScalar(fm, 'citation_source');
  if (citationSource) {
    const citation = citationDisplayMetadata(bibtex);
    if (!citation.title) fail(`${file}: source-backed bibtex must contain a title field`);
    if (citation.year && String(citation.year) !== getScalar(fm, 'year')) {
      fail(`${file}: year must be derived from source-backed bibtex year ${citation.year}`);
    }
    const citationVenue = citation.publication.venue;
    const frontmatterVenue = getNestedScalar(fm, 'publication', 'venue');
    if (citationVenue && citationVenue !== frontmatterVenue) {
      fail(`${file}: publication.venue "${frontmatterVenue}" must match source-backed bibtex display venue "${citationVenue}"`);
    }
    const citationAuthors = citation.authors.join(' | ');
    const frontmatterAuthors = getYamlList(fm, 'authors').join(' | ');
    if (citationAuthors && citationAuthors !== frontmatterAuthors) {
      fail(`${file}: authors must match source-backed bibtex authors`);
    }
  }

  const axisABlock = getBlock(fm, 'axis_A');
  const primaryMatch = axisABlock.match(/^\s+primary:\s*(A\d)/m);
  if (!primaryMatch || !familyCodes.has(primaryMatch[1])) fail(`${file}: invalid axis_A.primary`);
  const secondaryMatch = axisABlock.match(/^\s+secondary:\s*\[(.*?)\]/m);
  if (secondaryMatch) {
    secondaryMatch[1].split(',').map((x) => x.trim()).filter(Boolean).forEach((code) => {
      if (!familyCodes.has(code)) fail(`${file}: invalid axis_A.secondary code "${code}"`);
    });
  }

  const bCodes = getInlineList(fm, 'axis_B');
  if (!bCodes.length) fail(`${file}: axis_B must list at least one style`);
  bCodes.forEach((code) => {
    if (!middleCodes.has(code)) fail(`${file}: invalid axis_B code "${code}"`);
  });
}

if (!process.exitCode) {
  console.log(`Validated ${files.length} paper metadata file(s).`);
}
