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
  - `/papers/` plain index of recorded paper notes.
  - `/papers/[slug]/` stable paper notes.
- Public metadata contract is descriptive: Axis A/B placement, first-class objects, rewrite objects, artifact status, integration roles, notes, and takeaways.
- Do not add coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.
- Axis C/D normalization stays render-time only through `src/lib/axisNormalization.ts` and `src/data/taxonomy.json`.

## Active Focus

The active focus is manifest and visualization refinement for the CIM Library. Pause additional cluster investigation until the manifest/visualization shape is clearer.

Current focus doc:

- `docs/focus/manifest-visualization-refinement.md`

Retrievable paused focus:

- `docs/focus/cluster-analysis-working-groups.md`

Main implementation surfaces:

- `scripts/export-atlas-manifest.mjs`
- `public/cim-library.manifest.json`
- `scripts/check-website-contract.mjs`
- `src/components/TaxonomyAtlas.astro`
- `src/pages/library.astro`
- `src/pages/clusters/index.astro`
- `src/data/clusters.json`
- `src/pages/projects/cim-library/index.astro`
- CIM Library local navigator across project overview, atlas, clusters, paper index, and paper notes.

Current manifest/visualization question:

- The generated manifest now represents the library, route inventory, public views, and compact cluster-layer stats before further cluster investigation content is added.
- `public/cim-library.manifest.json` is schema version `0.2.0` and includes `routes`, `views`, and `cluster_layer`.
- `npm run contract:website` now validates the generated manifest against `docs/website-integration/schemas/atlas-manifest.schema.json` before running bespoke route/count checks.
- The CIM Library local navigator is implemented in `src/components/CimLibraryNav.astro` and appears on project overview, atlas, cluster, paper-index, and paper-note routes.
- `/clusters/` is focus-first: a top cluster focus map names each binding object, and individual cluster cards keep papers and evidence detail grouped instead of scattering TOC, atlas slices, working-group notes, and investigations across separate page regions.
- Next cluster-content direction is merged with manifest work: add per-cluster text/prose graphs that are insightful to read, and evolve `src/data/clusters.json`, manifest export/schema, and `/clusters/` together when those fields become structured.
- Paper detail pages are content-first: no framed title card at the top, and atlas/source/context metadata is grouped at the bottom after the corpus note.
- Preserve the descriptive paper metadata contract and keep clusters separate from paper frontmatter unless the contract is intentionally changed.
- Do not add coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.

## Session Scope

When asked to continue or proceed, prefer a complete coherent batch instead of a very small edit.

- Manifest/visualization sessions can audit the current manifest and visual route consumers, update generated manifest/contract/docs, and refine one coherent route or summary slice.
- Cluster sessions should resume only after reading `docs/focus/cluster-analysis-working-groups.md`.
- Website, docs, or paper sessions can touch all files needed for one complete user-visible slice.
- Keep the batch bounded by evidence quality: stop before making speculative lineage, affiliation, scoring, or ranking claims.

## Task-Specific Docs

Use `docs/README.md` to choose additional context. Important examples:

- Cluster details and roadmap: `docs/future-development-plan.md`.
- Focus switch map: `docs/focus/README.md`.
- Manifest/visualization focus: `docs/focus/manifest-visualization-refinement.md`.
- Paused cluster focus: `docs/focus/cluster-analysis-working-groups.md`.
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
- Static build: 68 pages.
- Navigation smoke check: global nav active state is stable; `/`, `/projects/`, and the CIM Library route family map to Home, Projects, and CIM Library respectively. CIM Library local nav active states are Overview, Atlas, Clusters, and Notes; no horizontal overflow on desktop or mobile.
- Link-structure smoke check: `/projects/cim-library/` has no duplicate route cards or inline route links; `/clusters/` has one structured atlas-slice panel with 7 slice links and no per-cluster atlas buttons.
- `/projects/cim-library/` smoke check: manifest-backed stats show 62 papers, 7 clusters, 13 investigation notes, 4 public views; no horizontal overflow on desktop or mobile.
- `/library/` smoke check: in-page atlas sections use a left sidebar, not top card buttons; no horizontal overflow on desktop or mobile.
- `/papers/` smoke check: plain note index renders 62 paper links, keeps the local Notes nav active, and has no horizontal overflow on desktop or mobile. Paper detail pages render a plain note header, corpus note first, and bottom metadata.
- `/clusters/` smoke check: 7 focus rows, 7 cluster panels, 21 grouped detail sections, no horizontal overflow on desktop or mobile.
