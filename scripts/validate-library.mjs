#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const taxonomyPath = path.join(root, 'src/data/taxonomy.json');
const papersDir = path.join(root, 'src/content/papers');
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const familyCodes = new Set(Object.keys(taxonomy.families));
const middleCodes = new Set(Object.keys(taxonomy.middles));
const requiredTopLevel = ['slug', 'title', 'short_title', 'summary', 'axis_A', 'axis_B'];

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
  const match = fm.match(new RegExp(`^${key}:\\n([\\s\\S]*?)(?=^[A-Za-z0-9_]+:|\\Z)`, 'm'));
  return match ? match[1] : '';
}

function getInlineList(fm, key) {
  const match = fm.match(new RegExp(`^${key}:\\s*\\[(.*?)\\]`, 'm'));
  if (!match) return [];
  return match[1]
    .split(',')
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

  const slug = getScalar(fm, 'slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fail(`${file}: invalid slug "${slug}"`);
  if (slugs.has(slug)) fail(`${file}: duplicate slug "${slug}"`);
  slugs.add(slug);

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
