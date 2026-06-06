#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const marginaliaPublic = resolve(repoRoot, '..', 'Marginalia', 'public');
const homepageCopy = resolve(repoRoot, 'public', 'marginalia');

if (!existsSync(marginaliaPublic)) {
  console.warn('[marginalia-sync] WARN: ../Marginalia/public not found; skipping local sync drift check');
  process.exit(0);
}

if (!existsSync(homepageCopy)) {
  console.error('[marginalia-sync] ERROR: public/marginalia is missing; run npm run sync:marginalia');
  process.exit(1);
}

const result = spawnSync('rsync', [
  '-ain',
  '--delete',
  '--omit-dir-times',
  '--exclude',
  '.DS_Store',
  `${marginaliaPublic}/`,
  `${homepageCopy}/`,
], {
  cwd: repoRoot,
  encoding: 'utf8',
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || '');
  process.exit(result.status ?? 1);
}

const changes = result.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

if (changes.length) {
  console.error('[marginalia-sync] ERROR: public/marginalia is out of sync with ../Marginalia/public');
  console.error('[marginalia-sync] Run npm run sync:marginalia, then review and stage the copied files.');
  for (const line of changes.slice(0, 40)) console.error(`  ${line}`);
  if (changes.length > 40) console.error(`  ... ${changes.length - 40} more`);
  process.exit(1);
}

console.log('[marginalia-sync] public/marginalia matches ../Marginalia/public');
