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

The active focus is cluster analysis and working-group content for the CIM Library. Metadata should seed candidate clusters, but cluster claims must come from actual paper-note, paper, and artifact analysis. The long-term display direction is analytical paragraphs and prose graphs that explain object flow, lineage or boundary, and artifact relationships; each cluster should read like a small blog/article, not a cluster of cards, non-link tags, or folded data blocks. The manifest/visualization refinement focus is completed and archived.

Current focus doc:

- `docs/focus/cluster-analysis-working-groups.md`

Archived completed focus:

- `docs/archive/2026-05-manifest-visualization-refinement-iteration.md`

Retrievable paused focus:

- `docs/focus/paper-metadata-maintenance.md`

Main implementation surfaces:

- `src/data/clusters.json`
- `src/pages/clusters/index.astro`
- Representative paper notes and official paper/artifact sources for the cluster being revised.
- Current `object_flow` fields are a draft four-step display scaffold, structured in `src/data/clusters.json`, exported by `scripts/export-atlas-manifest.mjs`, validated by `docs/website-integration/schemas/atlas-manifest.schema.json`, and rendered on `/clusters/`; keep these surfaces aligned if the field changes. The `analysis` field is the preferred public paragraph surface and currently exists for the crossbar DNN toolchain, DRAM-PIM API/compiler, LLM memory-hierarchy, and full-stack IR/ISA boundary clusters.

Current cluster/content question:

- The cluster layer currently has 7 cluster hypotheses and 13 deeper investigation entries.
- The cluster methodology and display direction are not complete. Cluster work should improve evidence/investigation content, replace metadata-shaped summaries with analysis paragraphs, use that evidence to refine the draft object-flow prose graphs, and keep supporting metadata visually secondary inside each article. Object vocabularies should be prose when they are not links; working-group notes should be coherent article subsections when they belong to the cluster.
- Subagents may be scoped by cluster, boundary question, or artifact lineage when focused investigation would help; their outputs should be checked claims, source links/paths, uncertainty, and candidate analytical prose.
- Working-group labels must remain coarse and evidence-based.
- LLM-serving and full-stack-boundary groupings are comparison sets, not lineage claims unless source evidence supports lineage.
- Preserve the descriptive paper metadata contract and keep clusters separate from paper frontmatter unless the contract is intentionally changed.
- Do not add coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.

## Session Scope

When asked to continue or proceed, prefer a complete coherent batch instead of a very small edit.

- Cluster sessions should start by reading `docs/focus/cluster-analysis-working-groups.md`; a coherent batch can include 2-4 related investigation updates, necessary source checks, data edits, docs count/status updates, and route smoke checks.
- Manifest/visualization rationale is archived; revisit it only if the user explicitly asks for manifest or atlas-route contract work.
- Website, docs, or paper sessions can touch all files needed for one complete user-visible slice.
- Keep the batch bounded by evidence quality: stop before making speculative lineage, affiliation, scoring, or ranking claims.

## Task-Specific Docs

Use `docs/README.md` to choose additional context. Important examples:

- Cluster details and roadmap: `docs/future-development-plan.md`.
- Focus switch map: `docs/focus/README.md`.
- Active cluster focus: `docs/focus/cluster-analysis-working-groups.md`.
- Archived manifest/visualization focus: `docs/archive/2026-05-manifest-visualization-refinement-iteration.md`.
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
- `/projects/cim-library/` smoke check: overview explains the central corpus question, public static surfaces, and corpus-shape summaries; no horizontal overflow on desktop or mobile.
- `/library/` smoke check: in-page atlas sections use a left sidebar, not top card buttons; selected-paper details render as a compact reading bridge; no horizontal overflow on desktop or mobile.
- `/papers/` smoke check: plain note index renders 62 paper links, keeps the local Notes nav active, and has no horizontal overflow on desktop or mobile. Paper detail pages render a plain note header, corpus note first, a retained right panel, and bottom scan metadata.
- `/clusters/` smoke check: 7 focus rows, 7 article-like cluster sections, 7 object-flow sections, 21 grouped detail sections, no horizontal overflow on desktop or mobile.
