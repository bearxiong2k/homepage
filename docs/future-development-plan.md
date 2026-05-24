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

## Completed Focus -- Cluster Analysis and Working Groups

Status: completed. Use `docs/focus/cluster-analysis-working-groups.md` only for maintenance or a new follow-up focus.

The focus source of truth is `docs/focus/cluster-analysis-working-groups.md`. Keep detailed methodology and maintenance notes there so this roadmap does not become a duplicated session log.

Current cluster set:

1. Crossbar DNN compiler and simulator toolchain line.
2. Digital SRAM-CIM macro generation and precision specialization.
3. Analog CIM modeling, nonideality, and calibrated cost baselines.
4. UPMEM real-hardware runtime and benchmark layer.
5. PIMeval/PIMsynth DRAM-PIM API and bit-serial compiler line.
6. LLM-oriented PIM memory-hierarchy mapping and runtime-state modeling.
7. Full-stack IR, ISA, and serialized backend boundaries.

Maintenance direction:

1. Keep the single `/clusters/` page as the completed public cluster layer unless a future cluster accumulates enough checked evidence to justify a separate detail page.
2. Preserve the visible AI-assisted synthesis notice on `/clusters/`.
3. Refine cluster object-flow and evidence paragraphs only when source checks sharpen the argument.
4. Keep group labels coarse and uncertainty explicit.
5. Avoid deriving clusters automatically unless a new explicit focus reopens the cluster layer.

## Active Focus -- General Style Controller

Status: active. Resume from `docs/focus/style-controller.md`.

Current roadmap direction:

1. Inventory duplicated style decisions across global CSS, layout/components, and representative route files.
2. Continue replacing repeated values with semantic controller tokens where the role is clear.
3. Decide whether route-level density or presentation modes need a small data/config layer after the CSS-token pass.
4. Verify the stable public routes after any substantial style-controller change.

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
