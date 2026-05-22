#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const papersDir = path.join(root, 'src/content/papers');
const expectedCount = 62;

function readFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

function cleanScalar(value = '') {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '~' || trimmed === 'null') return '';
  return trimmed.replace(/^['"]|['"]$/g, '');
}

function scalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match ? cleanScalar(match[1]) : '';
}

function nestedScalar(frontmatter, blockKey, key) {
  const lines = frontmatter.split('\n');
  const start = lines.findIndex((line) => line === `${blockKey}:`);
  if (start === -1) return '';
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(' ') && !line.startsWith('\t')) break;
    const match = line.match(new RegExp(`^\\s+${key}:\\s*(.*)$`));
    if (match) return cleanScalar(match[1]);
  }
  return '';
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function pushMap(map, key, value) {
  if (!key) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(value);
}

function printList(title, values, formatter = (value) => value) {
  console.log(`\n${title}: ${values.length}`);
  for (const value of values) console.log(`  - ${formatter(value)}`);
}

function printSampleList(title, values, limit = 20, formatter = (value) => value) {
  console.log(`\n${title}: ${values.length}`);
  for (const value of values.slice(0, limit)) console.log(`  - ${formatter(value)}`);
  if (values.length > limit) console.log(`  ... ${values.length - limit} more`);
}

function hasPublicArtifact(status) {
  return !hasNoPublicArtifact(status) && /public[_ -]artifact[_ -]found|public artifact found/i.test(status);
}

function hasNoPublicArtifact(status) {
  return /no[_ -]public[_ -]artifact[_ -]found|no public artifact found|no official public artifact found/i.test(status);
}

function hasMixedArtifactStatus(status) {
  return /partial|related public/i.test(status);
}

if (!fs.existsSync(papersDir)) {
  console.error(`ERROR: missing papers directory: ${papersDir}`);
  process.exit(1);
}

const files = fs.readdirSync(papersDir).filter((name) => name.endsWith('.md')).sort();
const rows = [];
const slugs = new Map();
const titles = new Map();
const normalizedTitles = new Map();
const rawFiles = [];
const slugFileMismatches = [];
const generatedMarkerHits = [];
const valueTrajectoryMentions = [];
const typoWatchHits = [];
const artifactStatusUrlMismatches = [];
const nullYears = [];
const blankArtifactUrls = [];
const missingPaperLinks = [];
const missingLastChecked = [];
const artifactUrlOnly = [];
const artifactLinkDisagrees = [];
const noSourceLinks = [];
const unknownRepro = [];
const sourceCoverage = {
  paper: 0,
  artifactLink: 0,
  docs: 0,
  code: 0,
  artifactUrl: 0
};

const typoWatch = [
  /learncnm2predic(?!t)/i,
  /miredow/i,
  /cim-prune(?!r)/i,
  /openacmv(?!2)/i,
  /pimeva(?!l)/i,
  /in-memoryneural/i
];

const markers = [
  { label: 'Suggested metadata entry', regex: /Suggested metadata entry/g },
  { label: 'trajectory_IR_relevance', regex: /trajectory_IR_relevance/g },
  { label: 'Relation to a value-trajectory', regex: /Relation to a value-trajectory/g },
  { label: 'value-trajectory IR project', regex: /value-trajectory IR project/g }
];

for (const file of files) {
  const fullPath = path.join(papersDir, file);
  const markdown = fs.readFileSync(fullPath, 'utf8');
  const frontmatter = readFrontmatter(markdown);
  if (!frontmatter) {
    rawFiles.push(file);
    continue;
  }

  const slug = scalar(frontmatter, 'slug');
  const title = scalar(frontmatter, 'title');
  const year = scalar(frontmatter, 'year');
  const artifactStatus = nestedScalar(frontmatter, 'artifact', 'status');
  const artifactUrl = nestedScalar(frontmatter, 'artifact', 'url');
  const artifactLastChecked = nestedScalar(frontmatter, 'artifact', 'last_checked');
  const linkPaper = nestedScalar(frontmatter, 'links', 'paper');
  const linkArtifact = nestedScalar(frontmatter, 'links', 'artifact');
  const linkDocs = nestedScalar(frontmatter, 'links', 'docs');
  const linkCode = nestedScalar(frontmatter, 'links', 'code');
  const reproducibility = scalar(frontmatter, 'reproducibility_level');
  const expectedFile = `${slug}.md`;

  rows.push({ file, slug, title });
  pushMap(slugs, slug, file);
  pushMap(titles, title, file);
  pushMap(normalizedTitles, normalizeTitle(title), `${file}: ${title}`);

  if (slug && file !== expectedFile) slugFileMismatches.push(`${file} declares slug ${slug}`);
  if (!year) nullYears.push(`${file}: ${title}`);
  if (!artifactUrl) blankArtifactUrls.push(`${file}: ${title}`);
  if (!linkPaper) missingPaperLinks.push(`${file}: ${title}`);
  if (!artifactLastChecked) missingLastChecked.push(`${file}: ${title}`);
  if (artifactUrl && !linkArtifact) artifactUrlOnly.push(`${file}: artifact.url is recorded but links.artifact is blank`);
  if (artifactUrl && linkArtifact && artifactUrl !== linkArtifact) {
    artifactLinkDisagrees.push(`${file}: links.artifact (${linkArtifact}) differs from artifact.url (${artifactUrl})`);
  }
  if (![linkPaper, linkArtifact, linkDocs, linkCode, artifactUrl].some(Boolean)) noSourceLinks.push(`${file}: ${title}`);
  if (linkPaper) sourceCoverage.paper += 1;
  if (linkArtifact) sourceCoverage.artifactLink += 1;
  if (linkDocs) sourceCoverage.docs += 1;
  if (linkCode) sourceCoverage.code += 1;
  if (artifactUrl) sourceCoverage.artifactUrl += 1;
  if (hasPublicArtifact(artifactStatus) && !artifactUrl) {
    artifactStatusUrlMismatches.push(`${file}: artifact status says public artifact found but url is blank`);
  }
  if (hasNoPublicArtifact(artifactStatus) && artifactUrl && !hasMixedArtifactStatus(artifactStatus)) {
    artifactStatusUrlMismatches.push(`${file}: artifact status says no public artifact found but url is ${artifactUrl}`);
  }
  if (reproducibility === 'unknown') unknownRepro.push(`${file}: ${title}`);

  const searchSurface = `${file}\n${slug}\n${title}\n${markdown}`;
  for (const pattern of typoWatch) {
    const match = searchSurface.match(pattern);
    if (match) typoWatchHits.push(`${file}: matched "${match[0]}"`);
  }

  for (const marker of markers) {
    const matches = [...markdown.matchAll(marker.regex)];
    if (matches.length) generatedMarkerHits.push(`${file}: ${marker.label} (${matches.length})`);
  }

  const valueTrajectoryMatches = [...markdown.matchAll(/value-trajectory/gi)];
  if (valueTrajectoryMatches.length) {
    valueTrajectoryMentions.push(`${file}: value-trajectory mention (${valueTrajectoryMatches.length})`);
  }
}

const duplicateSlugs = [...slugs.entries()].filter(([, values]) => values.length > 1);
const duplicateTitles = [...titles.entries()].filter(([, values]) => values.length > 1);
const nearDuplicateTitles = [...normalizedTitles.entries()].filter(([, values]) => values.length > 1);

console.log(`Paper files: ${files.length}`);
console.log(`Expected paper files: ${expectedCount}`);
console.log(`Structured files: ${rows.length}`);
console.log(`Raw/unstructured files: ${rawFiles.length}`);

printList('Raw files', rawFiles);
printList('Slug/file mismatches', slugFileMismatches);
printList('Duplicate slugs', duplicateSlugs, ([slug, values]) => `${slug}: ${values.join(', ')}`);
printList('Duplicate titles', duplicateTitles, ([title, values]) => `${title}: ${values.join(', ')}`);
printList('Near-duplicate normalized titles', nearDuplicateTitles, ([title, values]) => `${title}: ${values.join(' | ')}`);
printList('Typo-watch hits', typoWatchHits);
printList('Null or blank years', nullYears);
printList('Blank artifact URLs', blankArtifactUrls);
printList('Artifact status/url mismatches', artifactStatusUrlMismatches);
console.log('\nSource/provenance coverage (informational):');
console.log(`  - links.paper populated: ${sourceCoverage.paper}/${rows.length}`);
console.log(`  - links.artifact populated: ${sourceCoverage.artifactLink}/${rows.length}`);
console.log(`  - artifact.url populated: ${sourceCoverage.artifactUrl}/${rows.length}`);
console.log(`  - links.docs populated: ${sourceCoverage.docs}/${rows.length}`);
console.log(`  - links.code populated: ${sourceCoverage.code}/${rows.length}`);
printSampleList('Missing paper source links (informational)', missingPaperLinks);
printSampleList('Missing artifact last_checked dates', missingLastChecked);
printSampleList('Artifact URL only in artifact.url (informational)', artifactUrlOnly);
printSampleList('Artifact link/url disagreements', artifactLinkDisagrees);
printSampleList('No recorded source links', noSourceLinks);
printList('Unknown reproducibility levels', unknownRepro);
printList('Generated-marker hits', generatedMarkerHits);
printList('Value-trajectory mentions (informational)', valueTrajectoryMentions);

if (files.length !== expectedCount || rawFiles.length || duplicateSlugs.length || slugFileMismatches.length) {
  process.exitCode = 1;
}
