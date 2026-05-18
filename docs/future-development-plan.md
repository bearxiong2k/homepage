# Future Development Plan

## Current State

The repository contains 62 Markdown paper notes in `src/content/papers/`, and all 62 are now valid Astro content entries with YAML frontmatter.

The raw-note migration milestone is complete:

- `npm run validate` passes with `Validated 62 paper metadata file(s).`
- `npm run check` passes with `0 errors, 0 warnings, 0 hints`.
- `npm run build` passes and builds 64 static pages into `dist/`.
- No raw long-form notes remain in `src/content/papers/`.

The migration helper `scripts/promote-raw-note.mjs` remains useful for any future imported notes. It promotes the fenced YAML block under `## 12. Suggested metadata entry`, strips obsolete generated migration-only sections, normalizes filenames to slugs, and conservatively coerces schema-sensitive fields.

Current product priority: make `/library/` a strong taxonomy atlas before refining individual paper detail pages. The legacy standalone HTML in `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html` is the main UI benchmark for this phase. The present Astro atlas has valid data plumbing, but its sizing, layout density, and interactive browsing utility are weaker than the draft and should be improved first.

## Milestone 1 -- Content QA

Status: substantially complete. Keep this milestone green while doing UI work.

Recommended checks:

1. Scan for duplicate slugs and title collisions.
2. Compare the final corpus count against the legacy atlas count of 62 records.
3. Check typo-like titles and names such as `LearnCNM2Predic`, `MIREDOW`, `CIM-Prune`, `OpenACMv`, `PIMeva`, and the long `In-MemoryNeural` filename.
4. Verify all Axis A and Axis B values are from `src/data/taxonomy.json`.
5. Spot-check high-priority paper and artifact URLs.
6. Review entries whose migration helper blanked nonnumeric years, blanked non-HTTP(S) artifact values, or mapped unsupported reproducibility labels to `unknown`.
7. Search for lingering generated-note artifacts such as `Suggested metadata entry`, `trajectory_IR_relevance`, and value-trajectory project prose.
8. Run `npm run validate`, `npm run check`, and `npm run build` after QA edits.

Keep QA changes small and evidence-based. Do not invent missing publication facts or artifact links.

## Milestone 2 -- Atlas Visualization First

Goal: make `/library/` the primary public experience: a useful, readable, visually strong taxonomy atlas that helps a visitor understand the CIM compiler/IR landscape before opening single-paper pages.

Use `docs/atlas-visualization-harness.md` for implementation and review. Use the legacy HTML as the reference for interaction density and explanatory structure, not as a source of obsolete metadata fields.

Priority fixes:

1. Restore a strong overview flow before the paper dots: core finding, corpus counts, Axis A/B explanation, and the "hidden IR" / value-trajectory gap framing from the legacy draft.
2. Add a role × middle-style matrix or equivalent overview that shows counts across Axis A and Axis B, with clickable cells that filter or focus the atlas.
3. Improve atlas sizing and layout so the visualization is not cramped, especially on desktop. The atlas should have enough horizontal and vertical room to compare clusters and should not be visually subordinate to repeated axis-description cards.
4. Improve interactive utility: search, Axis A filter, Axis B filter, technology/workload filter, count feedback, selected-paper details, reset/filter affordances, keyboard focus, and clear empty states.
5. Decide whether the main browsing surface should be a dot atlas, a searchable card/grid list, or both. If both are present, keep them synchronized.
6. Recover useful legacy behaviors such as clickable matrix cells, compact paper cards with expandable details, stable result count, and persistent selected-paper context.
7. Keep visual polish restrained and research-oriented: dense but readable, strong hierarchy, no backend services, no PDF hosting.
8. Verify with browser screenshots at desktop and mobile widths before calling this milestone complete.

Do not reintroduce legacy `coverage`, ranking, or `trajectory_IR_relevance` metadata. Counts, matrix cells, and visual emphasis are allowed as derived UI state, not as new paper-quality scores.

Acceptance criteria:

- `/library/` communicates the taxonomy and corpus shape within the first screen and makes the atlas the main object, not a small embedded widget.
- A reader can answer "which stack roles and middle-layer styles dominate?" without opening a paper page.
- A reader can filter from overview matrix/card interactions into the paper atlas/list and inspect the selected work without losing context.
- The layout is usable at common desktop widths and does not collapse into awkward oversized cards or undersized charts.
- `npm run validate`, `npm run check`, and `npm run build` pass after implementation.

## Milestone 3 -- Paper Page Polish

Only after atlas visualization is substantially improved:

- improve individual paper page layout for long notes;
- tighten typography and spacing for corpus-note sections;
- add source/provenance affordances if useful;
- make paper metadata easier to scan on mobile;
- keep the site static and suitable for personal hosting.

## Milestone 4 -- Corpus Navigation Extensions

After the atlas and paper pages are stable:

- add tag pages if useful;
- add Axis A / Axis B detail pages if useful;
- consider a static search index;
- consider source provenance badges if they improve public trust.

## Milestone 5 -- Research Extensions

Future research-facing improvements:

- add explicit source provenance fields for paper, artifact, docs, and checked date;
- add a controlled vocabulary for `integration_roles`;
- add comparison pages for clusters such as ONNX-to-ISA stacks, UPMEM runtime stacks, macro generators, and simulator/cost-model frameworks.

## Migration Helper Notes

For future imports, use this workflow:

1. Create a stub with `npm run new:paper -- <slug> "<Paper Title>"`, or import a raw long-form note that contains `## 12. Suggested metadata entry`.
2. Run `node scripts/promote-raw-note.mjs --dry-run <files...>` and inspect planned filenames and warnings.
3. Promote with `scripts/promote-raw-note.mjs` when the dry-run looks correct.
4. Restore schema-valid values only when checked evidence is already present in the note or official source material.
5. Run `npm run validate`.

The helper should remain conservative. It should fail loudly when metadata is ambiguous instead of inventing values.

## Non-Goals For Now

- Do not add PDF hosting.
- Do not add a database or backend service.
- Do not weaken the content schema.
- Do not introduce a quality score or ranking model.
- Do not add coverage scores or trajectory-IR relevance metadata unless the project direction changes.
- Do not automatically rewrite scholarly prose unless the user explicitly asks for editorial cleanup.
