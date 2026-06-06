#!/usr/bin/env node
import { chmodSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const hooksPath = resolve(repoRoot, '.githooks');
const hooks = ['pre-commit', 'pre-push'];

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(hooksPath)) {
  console.error('[hooks] ERROR: .githooks directory is missing');
  process.exit(1);
}

for (const hook of hooks) {
  const hookPath = resolve(hooksPath, hook);
  if (!existsSync(hookPath)) {
    console.error(`[hooks] ERROR: missing ${hookPath}`);
    process.exit(1);
  }
  chmodSync(hookPath, 0o755);
}

run('git', ['config', 'core.hooksPath', '.githooks']);
console.log('[hooks] installed repo Git hooks from .githooks');
