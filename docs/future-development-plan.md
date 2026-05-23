# Future Development Plan

## Current State

This is a static Astro paper library for CIM compiler/IR-stack research.

- `src/content/papers/` contains 62 schema-valid Markdown paper entries.
- The raw-note migration milestone is complete; no raw long-form notes remain.
- The public metadata contract is descriptive. It does not include coverage scores, ranking scores, or `trajectory_IR_relevance`.
- `/` is the merged personal homepage/profile page.
- `/projects/` and `/projects/cim-library/` form the static project shell around the atlas.
- `/library/` is the stable full atlas route.
- `/papers/[slug]/` renders individual long-form corpus notes.
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
- `npm run build`: 66 static pages.

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

The next iteration returns to the archived cluster-analysis and academic-working-group direction. Use `docs/archive/cluster-analysis-working-groups.md` as the seed plan.

The goal is not a detailed affiliation or author-connection map. The desired layer should identify vague research/work groups that produced clusters of works and may have cooperated with other groups on some works.

Likely first moves:

1. Decide whether the cluster view should live at `/clusters/` or under `/projects/cim-library/clusters/`.
2. Prototype a small hand-curated cluster data shape, likely `src/data/clusters.json`, before deriving anything automatically.
3. Define a coarse working-group annotation model with evidence fields and uncertainty labels.
4. Use existing paper metadata first: Axis A/B, normalized Axis C/D, technology, workloads, baselines, artifact links, authors/groups, venues, and note text.
5. Build one or two high-confidence clusters before broadening the visualization.
6. Link clusters back into scoped atlas views rather than duplicating the atlas.

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
