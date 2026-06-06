#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const mode = process.argv[2] || 'codex';

const workflows = {
  precommit: [
    ['npm', ['run', 'qa']],
    ['npm', ['run', 'validate']],
    ['npm', ['run', 'export:atlas:check']],
    ['npm', ['run', 'contract:website']],
    ['npm', ['run', 'sync:marginalia:check']],
    ['git', ['diff', '--check']],
    ['git', ['diff', '--cached', '--check']],
  ],
  prepush: [
    ['npm', ['run', 'qa']],
    ['npm', ['run', 'validate']],
    ['npm', ['run', 'export:atlas:check']],
    ['npm', ['run', 'contract:website']],
    ['npm', ['run', 'sync:marginalia:check']],
    ['npm', ['run', 'check']],
    ['npm', ['run', 'build'], {
      ASTRO_SITE: 'https://bearxiong2k.github.io',
      ASTRO_BASE: '/homepage',
    }],
    ['git', ['diff', '--check']],
    ['git', ['diff', '--cached', '--check']],
  ],
};

workflows.codex = workflows.prepush;

if (!workflows[mode]) {
  console.error(`[homepage-checks] ERROR: unknown workflow "${mode}"`);
  console.error(`[homepage-checks] Expected one of: ${Object.keys(workflows).join(', ')}`);
  process.exit(1);
}

function run(command, args, env = {}) {
  const label = [command, ...args].join(' ');
  console.log(`\n[homepage-checks] > ${label}`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`[homepage-checks] running ${mode} workflow`);
for (const [command, args, env] of workflows[mode]) run(command, args, env);
console.log(`\n[homepage-checks] ${mode} workflow passed`);
