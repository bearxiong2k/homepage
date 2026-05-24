# Future Development Plan

Default-context policy: Do not read by default. Use `docs/active-context.md` for compact session state and read this file only when changing roadmap, cluster-analysis scope, or active project direction.

## Current State

This is a static Astro paper library for CIM compiler/IR-stack research.

- `src/content/papers/` contains 62 schema-valid Markdown paper entries.
- The raw-note migration milestone is complete; no raw long-form notes remain.
- The public metadata contract is descriptive. It does not include coverage scores, ranking scores, or `trajectory_IR_relevance`.
- `/` is the merged personal homepage/profile page.
- `/projects/` and `/projects/cim-library/` form the static project shell around the atlas.
- `/library/` is the stable full atlas route.
- `/clusters/` is the active static cluster and coarse working-group route.
- `/papers/[slug]/` renders individual long-form corpus notes.
- `src/data/clusters.json` is the hand-authored cluster source. It is deliberately separate from paper frontmatter so the public paper metadata contract stays descriptive and unchanged.
- Axis C/D normalization is render-time only through `src/lib/axisNormalization.ts` and `src/data/taxonomy.json`.
- `src/data/profile.json` contains linked selected publications, including ASMA 2025, the ACPEE 2024 nano-channel paper, the Sensors 2024 solid-state nanopore article, and verified PRAB/NIM-A DOI links.
- The website integration kit has been initialized. Remaining website-integration files are contract and maintenance docs, not active scaffolding.

Keep these checks green while changing UI or content:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```

Latest known good baseline:

- `npm run validate`: `Validated 62 paper metadata file(s).`
- `npm run qa`: 62 files, 62 structured, 0 raw files; source/provenance coverage is informational audit output.
- `npm run contract:website`: OK.
- `npm run check`: `0 errors, 0 warnings, 0 hints`.
- `npm run build`: 68 static pages.

## Completed Website-Shell Iteration

The personal website shell work is largely done for the current scope.

Implemented:

- concise merged homepage/profile at `/`;
- project index at `/projects/` sourced from `src/data/project-registry.json`;
- narrative CIM Library project page at `/projects/cim-library/`;
- stable full atlas route at `/library/`;
- stable paper note routes under `/papers/[slug]/`;
- quiet academic visual shell with one top navigation path;
- linked publication support on the homepage;
- atlas geometry cleanup after the style shift: wider A/B and C/D SVG coordinate systems, smaller node initials, stacked Axis B row labels, and two-row staggered Axis C labels;
- wider desktop paper-note reading layout;
- static atlas manifest export and website contract checks.

The brief archive for this iteration is `docs/archive/2026-05-personal-website-integration-iteration.md`.

## Active Focus -- Cluster Analysis and Working Groups

Status: active. Resume from `docs/focus/cluster-analysis-working-groups.md`.

The first-pass cluster-analysis and academic-working-group layer has been reactivated from `docs/archive/2026-05-cluster-analysis-working-groups-seed.md`. The manifest and visualization refinement iteration is complete and archived at `docs/archive/2026-05-manifest-visualization-refinement-iteration.md`.

Implemented first pass:

- route: `/clusters/`, as a sibling research view to `/library/`;
- data: `src/data/clusters.json`, hand-authored and inspectable;
- UI: article-like cluster sections with analysis, object flow, binding theme, representative/supporting papers, shared objects, rewrite objects, evidence, uncertainty, coarse working-group notes, and scoped atlas links;
- analysis paragraphs: `analysis` is the preferred public synthesis field and currently exists for the crossbar DNN toolchain, DRAM-PIM API/compiler, LLM memory-hierarchy, and full-stack IR/ISA boundary clusters after focused note-level investigation;
- deeper group investigations: selected clusters now carry working-group investigation notes with scope, coherence rationale, continuity evidence, boundaries, next checks, and source links;
- draft display scaffold: each cluster has an `object_flow` field rendered on `/clusters/`, exported in the atlas manifest, and validated by the manifest schema;
- links: `/projects/cim-library/` and `/library/` now point to the cluster route.

Current methodology direction:

- Metadata is a seed for candidate neighborhoods, not the basis of the final claim.
- Cluster conclusions should be argued from paper notes, paper text where needed, official artifacts, and source-visible file or execution boundaries.
- Public cluster and working-group content should move toward small article-like entries with analytical paragraphs and prose graphs rather than metadata-card summaries, non-link tag clouds, folded data blocks, repeated internal subtitles, list-heavy metadata sections, or duplicated working-group article/investigation pairs. Working-group analysis is a parallel lens over artifact lineage, authorship context, repositories, and institutional practice; it should cross-reference cluster seeds without being nested inside cluster analysis. The `/clusters/` route should keep one left navigator shared by cluster articles and one clear working-group investigation article per group so neither lens reads as an appendix to the other.
- Subagent investigations can be scoped by cluster, boundary question, or artifact lineage; their useful output is checked claims, source links/paths, uncertainty, and candidate analytical prose.

Current cluster hypotheses:

1. Crossbar DNN compiler and simulator toolchain line.
2. Digital SRAM-CIM macro generation and precision specialization.
3. Analog CIM modeling, nonideality, and calibrated cost baselines.
4. UPMEM real-hardware runtime and benchmark layer.
5. PIMeval/PIMsynth DRAM-PIM API and bit-serial compiler line.
6. LLM-oriented PIM memory-hierarchy mapping and runtime-state modeling.
7. Full-stack IR, ISA, and serialized backend boundaries.

The PIMeval/PIMsynth cluster is intentionally narrow. HARMONI is related through UVA LavaLab and DRAM-PIM modeling, but it now belongs to the LLM memory-hierarchy cluster because its central object is a Transformer DFG plus tensor placement and hierarchy mapping, not the PIM API / bit-serial compiler boundary.

Working-group investigation depth has started for:

- Xiaoming Chen / Yinhe Han crossbar-PIM compiler/simulator toolchain artifacts;
- HKUST / digital-CIM macro compiler and physical-backend artifacts;
- OpenACM / approximate-DCIM optimization boundary;
- NeuroSim-centered analog CIM modeling artifacts;
- CiMLoop as a Timeloop/Accelergy CIM modeling extension;
- GENIEx/NAX nonideality-aware co-design thread;
- SAFARI / UPMEM real-hardware runtime and benchmark artifacts;
- UVA LavaLab PIMeval-to-PIMsynth API/compiler artifacts;
- HARMONI as the public LLM memory-hierarchy modeling anchor;
- LLM serving and near-memory runtime-state comparison set;
- CIMFlow/OpenCIMTC serialized compiler-contract comparison;
- PUMA/CIM-MLC hidden graph-to-backend state comparison;
- public full-stack artifact boundary comparison set.

These are intentionally coarse groups or comparison sets with deeper evidence notes, not collaboration graphs.

Good next moves:

1. Continue adding in-depth investigation notes cluster-by-cluster, prioritizing groups where official artifacts expose file formats or execution flows.
2. Strengthen each investigation by checking representative paper notes against official artifacts where the current evidence is thin.
3. Develop the long-term display direction alongside the evidence: evidence-grounded analytical paragraphs and prose graphs should explain object flow, lineage or boundary, and artifact relationships without overclaiming.
4. Refine the current `object_flow` scaffold only when the underlying evidence is strong enough, and keep `src/data/clusters.json`, `/clusters/`, the manifest exporter, and the manifest schema aligned.
5. Keep the single `/clusters/` page unless a cluster accumulates enough checked evidence to justify a separate detail page.
6. Keep using scoped `/library/` links rather than duplicating the atlas.
7. Avoid deriving clusters automatically until the hand-authored layer has been reviewed.

Guardrails:

- Keep group labels coarse and evidence-based.
- Mark uncertain groupings as tentative.
- Do not introduce coverage, quality, ranking, or relevance scores.
- Do not create a fine-grained collaboration graph unless explicitly requested.
- Keep `/library/` and `/papers/[slug]/` stable.
- Keep the implementation static and inspectable.

## Maintenance Notes

- Preserve the 62-entry corpus unless intentionally adding/removing papers.
- Keep slugs unique and filename-aligned.
- Keep Axis A/B values within `src/data/taxonomy.json`.
- Do not weaken `src/content.config.ts` to accommodate malformed notes.
- Do not automatically rewrite scholarly prose unless explicitly requested.
- Keep legacy source files intact unless explicitly asked to archive or rewrite them.
