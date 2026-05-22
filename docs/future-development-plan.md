# Future Development Plan

## Current State

This is a static Astro paper library for CIM compiler/IR-stack research.

- `src/content/papers/` contains 62 schema-valid Markdown paper entries.
- The raw-note migration milestone is complete; no raw long-form notes remain.
- The active metadata contract is descriptive. It does not include coverage scores, ranking scores, or `trajectory_IR_relevance`.
- `/` is the primary public atlas route; `/library/` renders the same atlas for compatibility.
- `/papers/[slug]/` renders individual long-form corpus notes.
- Axis C first-class objects and Axis D rewrite objects are normalized at render time from `src/data/taxonomy.json` vocabulary, without adding new required frontmatter fields.
- The atlas supports both Axis A x Axis B and normalized Axis C x Axis D layouts.
- Keep the site static and suitable for personal hosting. Do not add PDF hosting, backend services, or a database unless the project direction changes.

Keep these checks green while changing UI or content:

```bash
npm run qa
npm run validate
npm run check
npm run build
```

Latest known good baseline:

- `npm run validate`: `Validated 62 paper metadata file(s).`
- `npm run qa`: 62 files, 62 structured, 0 raw files; source/provenance coverage is now reported as informational audit output.
- `npm run check`: `0 errors, 0 warnings, 0 hints`.
- `npm run build`: 64 static pages.

## Completed Focus -- Atlas Core

The main `/library/` atlas focus is now substantially done.

Implemented:

- large Axis A x Axis B graph as the first main section on `/library/`;
- deterministic node spreading for dense cells;
- hover/focus summaries and click-to-select behavior;
- filtered paper picker and reset controls;
- selected-paper right panel focused on Axis C first-class objects and Axis D rewrite objects;
- selected-paper Axis A x Axis B coverage shown directly on the atlas as a non-scoring background cloud;
- short taxonomy explanation after the graph;
- responsive controls and mobile horizontal graph scroll;
- paper detail page CSS improvements for long notes, tables, code blocks, and mobile wrapping.

## Completed Focus -- Detail Pages and Atlas Scoping, First Pass

Implemented:

- render-time Axis C/D normalization using `src/data/taxonomy.json` object and rewrite vocabularies;
- separate Axis C and Axis D atlas filters;
- atlas layout switch between Axis A x Axis B and normalized Axis C x Axis D;
- URL state for `layout=cd`, `c=`, `d=`, exact scoped cells through `cx=` / `cy=`, plus existing `tech=` and `workload=`;
- detail-page normalized Axis C/D chips and context chips that link back into scoped atlas views;
- atlas selected-paper card split from hover preview, so click pins a paper while hover previews the active object/rewrite cloud;
- responsive atlas profiles with larger nodes and tighter labels for A/B and C/D views;
- expandable object/rewrite/context clouds for long metadata lists;
- dense-cell summary under the atlas with one-click exact scoping for the plotted cell.

Do not rebuild the atlas from scratch. Future atlas work should be incremental and should use current frontmatter plus `src/data/taxonomy.json` as source of truth.

## Completed Focus -- Detail-Page Provenance, First Pass

Implemented:

- detail-page provenance strip summarizing paper-source presence, artifact-link presence, artifact status, and last-checked date;
- hero source actions generated from existing `links.paper`, `links.artifact`, `links.docs`, `links.code`, and `artifact.url` metadata;
- richer source cards with source role labels, short descriptions, and hostnames;
- explanatory source note clarifying that artifact status and checked date come from the recorded corpus pass rather than live monitoring;
- responsive source/provenance layout with single-column mobile behavior and no horizontal overflow in checked viewports.

This pass did not add new schema fields. It surfaces the current descriptive frontmatter more clearly.

## Completed Focus -- Provenance QA, First Pass

Implemented:

- `npm run qa` now reports source/provenance coverage for `links.paper`, `links.artifact`, `artifact.url`, `links.docs`, and `links.code`;
- missing paper-source links are listed as informational audit items;
- missing artifact `last_checked` dates are checked separately from artifact URL coverage;
- artifact URLs recorded only under `artifact.url` are surfaced so the frontmatter can be normalized intentionally;
- disagreements between `links.artifact` and `artifact.url` are reported;
- entries with no recorded source links are listed.

Current mechanical audit reading:

- `links.paper` is now populated for 61/62 entries after high-confidence backfill from checked body citations and source records.
- `links.artifact` is now populated for 38/62 entries and aligned with the existing `artifact.url` coverage.
- `pim-eda.md` is the only remaining entry without `links.paper`; it is a suite/toolchain entry composed from several related papers, so leave it blank unless a canonical suite paper is identified.
- no entries currently lack all frontmatter source links.
- `artifact.last_checked` is complete across the current corpus.
- artifact status and artifact URL fields currently have no contradiction according to the QA script.
- artifact URL-only entries and `links.artifact` / `artifact.url` disagreements are currently zero.

## Next Focus -- Detail Pages and Atlas Scoping

The next product milestone should treat paper detail pages and atlas scoping as one connected improvement loop. The detail page is where users inspect evidence and vocabulary; the atlas is where the same vocabulary becomes navigable. Improve them together so metadata refinements, controlled facets, back-links, and rendering fixes reinforce the same browsing workflow.

Remaining priority work:

1. Improve the long-note reading layout on `/papers/[slug]/`.
2. Make metadata easier to scan without duplicating the full note.
3. Continue source/provenance backfill for `pim-eda.md` only if checked evidence identifies a canonical paper for the suite/toolchain as a whole.
4. Preserve alignment between `links.artifact` and `artifact.url` unless a future schema change intentionally separates source-card links from artifact-status URLs.
5. Audit normalized Axis C/D categories for false positives or overly broad buckets; keep them descriptive.
6. Consider whether normalized technology/workload metadata needs a controlled vocabulary beyond the current separate selectors.
7. Improve mobile behavior for long titles, tables, code blocks, metadata panels, and atlas/detail transitions.
8. Refine rendered note content: audit Markdown display edge cases, formula/math notation, escaped symbols, and table/code rendering so corpus notes display faithfully instead of exposing raw Markdown or unrendered formulas.
9. Consider compact paper lists/cards and an optional static search index only after the detail-page and metadata scanability path is stable.

The atlas should remain descriptive. Do not introduce coverage, quality, ranking, or relevance scores.

Keep changes schema-compatible unless there is a clear reason to update `src/content.config.ts`.

## Content QA

Content QA is mostly green, but keep these checks in mind during edits:

- preserve the 62-entry corpus unless intentionally adding/removing papers;
- keep slugs unique and filename-aligned;
- keep Axis A/B values within `src/data/taxonomy.json`;
- keep generated-note artifacts out of rendered notes;
- keep artifact URLs, years, venues, and reproducibility labels evidence-based;
- do not invent publication facts or artifact behavior.

Use `scripts/promote-raw-note.mjs` only for future imported raw notes. The regular development path should not need raw-note migration instructions.

## Research Extensions

Later research-facing improvements:

- explicit source provenance fields for paper, artifact, docs, and checked date;
- controlled vocabulary for `integration_roles`;
- comparison pages for clusters such as ONNX-to-ISA stacks, UPMEM runtime stacks, macro generators, and simulator/cost-model frameworks;
- tag pages or Axis A/B detail pages if they prove useful after detail-page polish.

## Non-Goals

- Do not add PDF hosting.
- Do not add backend services or a database.
- Do not weaken the content schema to accommodate malformed notes.
- Do not introduce quality scores, coverage scores, ranking scores, or `trajectory_IR_relevance`.
- Do not automatically rewrite scholarly prose unless explicitly requested.
