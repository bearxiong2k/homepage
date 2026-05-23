# Active Context

This is the compact default context for current project state. Keep it short; move detailed rationale to task-specific docs or archives.

## Current State

- Static Astro CIM compiler/IR paper library inside a quiet academic personal website shell.
- `src/content/papers/` contains 62 schema-valid Markdown paper entries; no raw corpus notes remain.
- Public routes:
  - `/` personal homepage/profile.
  - `/projects/` project index.
  - `/projects/cim-library/` narrative CIM Library landing page.
  - `/library/` stable full atlas app.
  - `/clusters/` static cluster and coarse working-group route.
  - `/papers/[slug]/` stable paper notes.
- Public metadata contract is descriptive: Axis A/B placement, first-class objects, rewrite objects, artifact status, integration roles, notes, and takeaways.
- Do not add coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.
- Axis C/D normalization stays render-time only through `src/lib/axisNormalization.ts` and `src/data/taxonomy.json`.

## Active Focus

The active research layer is cluster analysis and coarse working-group investigation over the existing corpus.

Current cluster source:

- `src/data/clusters.json`

Current route:

- `src/pages/clusters/index.astro`

Current cluster page shape:

- 7 hand-authored cluster hypotheses.
- 8 deeper investigation cards.
- Working-group labels remain coarse and evidence-based.
- LLM-serving and full-stack-boundary cards are comparison sets, not lineage claims.
- `/library/` and `/projects/cim-library/` link to `/clusters/`.

## Task-Specific Docs

Use `docs/README.md` to choose additional context. Important examples:

- Cluster details and roadmap: `docs/future-development-plan.md`.
- Original cluster seed: `docs/archive/2026-05-cluster-analysis-working-groups-seed.md`.
- Paper-entry workflow: `docs/corpus-note-harness.md` and `docs/metadata-template.md`.
- Website contract: `docs/website-integration/README.md`.
- Docs maintenance: `docs/iteration-docs-playbook.md`.

## Latest Good Verification

The latest known good loop:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```

Known baseline:

- 62 paper metadata files validated.
- Website contract OK.
- `astro check`: 0 errors, 0 warnings, 0 hints.
- Static build: 67 pages.
- `/clusters/` smoke check: 7 clusters, 8 investigation cards, no horizontal overflow on desktop or mobile.
