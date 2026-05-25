#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [, , rawSlug, ...titleParts] = process.argv;
if (!rawSlug || !titleParts.length) {
  console.error('Usage: npm run new:paper -- <slug> <Paper Title>');
  process.exit(1);
}
const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = titleParts.join(' ');
const outDir = path.join(process.cwd(), 'src/content/papers');
const outPath = path.join(outDir, `${slug}.md`);
if (fs.existsSync(outPath)) {
  console.error(`Refusing to overwrite ${outPath}`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const template = `---
slug: ${slug}
title: ${JSON.stringify(title)}
short_title: ${JSON.stringify(title)}
subtitle: Scoped CIM stack note
year:
publication:
  venue:
  type:
  doi:
  url:
authors: []
bibtex: |
  @misc{${slug},
    title = {${title.replace(/[{}]/g, '')}}
  }
citation_source:
summary: >-
  Replace with a one-paragraph public corpus summary.
links:
  paper:
  artifact:
  docs:
  code:
technology: []
workloads: []
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: []
axis_B: [B1]
axis_C_first_class_objects: []
axis_D_rewrite_objects: []
artifact:
  status: unknown
  url:
  license:
  last_checked: "${today}"
integration_roles: []
reproducibility_level: unknown
notes: []
takeaways: []
---

## Corpus classification snapshot

TODO.

## Public summary

TODO.

## Integration helper

TODO.
`;
fs.writeFileSync(outPath, template);
console.log(`Created ${outPath}`);
