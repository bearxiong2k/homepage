# Future Development Plan

## Current State

This is a static Astro paper library for CIM compiler/IR-stack research.

- `src/content/papers/` contains 62 schema-valid Markdown paper entries.
- The raw-note migration milestone is complete; no raw long-form notes remain.
- The public metadata contract is descriptive. It does not include coverage scores, ranking scores, or `trajectory_IR_relevance`.
- `/` is the merged personal homepage/profile page.
- `/projects/` and `/projects/cim-library/` form the static project shell around the atlas.
- `/library/` is the stable full atlas route.
- `/clusters/` is the first-pass static cluster and coarse working-group route.
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
- `npm run build`: 67 static pages.

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

The brief archive for this iteration is `docs/archive/personal-website-integration-iteration.md`.

## Next Focus -- Cluster Analysis and Working Groups

The first-pass cluster-analysis and academic-working-group layer has been reactivated from `docs/archive/cluster-analysis-working-groups.md`.

Implemented first pass:

- route: `/clusters/`, as a sibling research view to `/library/`;
- data: `src/data/clusters.json`, hand-authored and inspectable;
- UI: static cluster panels with binding theme, representative/supporting papers, shared objects, rewrite objects, evidence, uncertainty, coarse working-group notes, and scoped atlas links;
- deeper group investigations: selected clusters now carry working-group investigation notes with scope, coherence rationale, continuity evidence, boundaries, next checks, and source links;
- links: `/projects/cim-library/` and `/library/` now point to the cluster route.

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
- NeuroSim-centered analog CIM modeling artifacts;
- SAFARI / UPMEM real-hardware runtime and benchmark artifacts;
- UVA LavaLab PIMeval-to-PIMsynth API/compiler artifacts;
- HARMONI as the public LLM memory-hierarchy modeling anchor.
- LLM serving and near-memory runtime-state comparison set;
- public full-stack artifact boundary comparison set.

These are intentionally coarse groups or comparison sets with deeper evidence notes, not collaboration graphs.

Good next moves:

1. Continue adding in-depth investigation notes cluster-by-cluster, prioritizing groups where official artifacts expose file formats or execution flows.
2. Strengthen each investigation by checking representative paper notes against official artifacts where the current evidence is thin.
3. Keep the single `/clusters/` page unless a cluster accumulates enough checked evidence to justify a separate detail page.
4. Keep using scoped `/library/` links rather than duplicating the atlas.
5. Avoid deriving clusters automatically until the hand-authored layer has been reviewed.

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
