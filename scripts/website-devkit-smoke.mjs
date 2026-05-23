#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const fast = args.has('--fast') || args.has('--no-astro') || args.has('--no-build');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.execPath;

const steps = [
  { name: 'content QA', command: npmCommand, args: ['run', 'qa'] },
  { name: 'metadata validation', command: npmCommand, args: ['run', 'validate'] },
  { name: 'atlas manifest export', command: nodeCommand, args: ['scripts/export-atlas-manifest.mjs'] },
  { name: 'website contract', command: nodeCommand, args: ['scripts/check-website-contract.mjs'] }
];

if (!fast) {
  steps.push(
    { name: 'Astro check', command: npmCommand, args: ['run', 'check'] },
    { name: 'static build', command: npmCommand, args: ['run', 'build'] }
  );
}

for (const step of steps) {
  console.log(`\n[website-smoke] ${step.name}`);
  const result = spawnSync(step.command, step.args, { stdio: 'inherit' });
  if (result.error) {
    console.error(`[website-smoke] ERROR: ${step.name} failed to start: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[website-smoke] ERROR: ${step.name} exited with ${result.status}`);
    process.exit(result.status || 1);
  }
}

if (fast) {
  console.log('\n[website-smoke] OK fast mode. Astro check/build were skipped.');
} else {
  console.log('\n[website-smoke] OK full mode.');
}
