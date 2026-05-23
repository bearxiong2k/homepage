#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packagePath = path.join(root, 'package.json');
const registryTemplatePath = path.join(
  root,
  'docs/website-integration/templates/project-registry.template.json'
);
const registryPath = path.join(root, 'src/data/project-registry.json');
const publicDir = path.join(root, 'public');

const scriptsToAdd = {
  'export:atlas': 'node scripts/export-atlas-manifest.mjs',
  'contract:website': 'node scripts/check-website-contract.mjs',
  'smoke:website': 'node scripts/website-devkit-smoke.mjs'
};

function log(message) {
  console.log(`[website-devkit] ${message}`);
}

function fail(message) {
  console.error(`[website-devkit] ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(packagePath)) {
  fail('package.json not found. Run this from the repository root.');
}

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.scripts = pkg.scripts || {};
let changedPackage = false;
for (const [name, command] of Object.entries(scriptsToAdd)) {
  if (!pkg.scripts[name]) {
    pkg.scripts[name] = command;
    changedPackage = true;
    log(`added package script "${name}"`);
  } else if (pkg.scripts[name] !== command) {
    log(`kept existing package script "${name}" (${pkg.scripts[name]})`);
  } else {
    log(`package script "${name}" already installed`);
  }
}

if (changedPackage) {
  fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
  log('updated package.json');
}

fs.mkdirSync(publicDir, { recursive: true });

if (!fs.existsSync(registryPath)) {
  if (!fs.existsSync(registryTemplatePath)) {
    fail(`missing registry template: ${path.relative(root, registryTemplatePath)}`);
  }
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.copyFileSync(registryTemplatePath, registryPath);
  log('created src/data/project-registry.json from template');
} else {
  log('kept existing src/data/project-registry.json');
}

log('done');
log('next: npm run smoke:website -- --fast');
