# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

This is a static Astro CIM compiler/IR paper library. Read AGENTS.md first, then CODEX_HANDOFF.md, docs/future-development-plan.md, docs/atlas-visualization-harness.md, docs/legacy-atlas-delta.md, docs/legacy-source-map.md, docs/corpus-note-harness.md, and docs/metadata-template.md.

Current state:
- src/content/papers contains 62 Markdown notes.
- All 62 notes are structured Astro content entries with YAML frontmatter.
- No raw long-form corpus notes remain.
- The active schema does not use coverage scores or trajectory-IR relevance metadata. Do not reintroduce obsolete generated fields such as coverage or trajectory_IR_relevance.
- The raw-note migration milestone is complete.
- Content QA is substantially green: 62 structured files, no duplicate slugs/titles, no raw files, no lingering generated metadata sections, and no known typo-watch hits.
- npm run validate passes with "Validated 62 paper metadata file(s)."
- npm run check passes with "0 errors, 0 warnings, 0 hints."
- npm run build passes and builds 64 pages into dist/.

Product priority:
Prioritize the `/library/` taxonomy atlas visualization before individual paper detail page refinement. The current Astro atlas has valid data plumbing but its sizing, layout, and interactive utility are worse than the legacy standalone HTML draft.

Task:
Improve the `/library/` atlas experience using docs/atlas-visualization-harness.md.

Reference:
- Use src/content/legacy/cim_compiler_ir_taxonomy_visualization.html as the benchmark for visual density, overview flow, role/style matrix behavior, filtering utility, and paper browsing.
- Use current frontmatter and src/data/taxonomy.json as the source of truth.
- Use legacy text/behavior as design guidance, not as permission to restore obsolete score metadata.

Recommended implementation pass:
1. Inspect src/components/TaxonomyAtlas.astro, src/pages/library.astro, src/styles/global.css, docs/legacy-atlas-delta.md, and the legacy HTML.
2. Make `/library/` communicate the taxonomy shape in the first screen: core finding, corpus counts, Axis A/B overview, and why the middle layer matters.
3. Add or improve a role × middle-style matrix with counts and paper names; clicking a non-empty cell should filter/focus the paper set.
4. Improve atlas sizing and layout so the Axis A × Axis B visualization is large, legible, and useful on desktop.
5. Improve interaction: search, Axis A filter, Axis B filter, technology/workload filter, active result count, reset filters, selected-paper context, keyboard-accessible controls, and empty states.
6. Consider adding synchronized compact paper cards/list if dots alone are not enough for browsing.
7. Keep paper detail page polish deferred unless it is needed for the atlas flow.
8. Do not weaken src/content.config.ts and do not add coverage/ranking/trajectory_IR_relevance fields.
9. Run npm run validate, npm run check, and npm run build.
10. Use browser screenshots at desktop and mobile widths to verify sizing, nonblank rendering, legibility, and interactions.

Report:
- Atlas visualization changes and files changed;
- legacy behaviors recovered or intentionally skipped;
- browser viewport checks and build/check results;
- remaining atlas shortcomings before paper-page polish.
```
