# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

This is a static Astro CIM compiler/IR paper library. Read AGENTS.md first, then CODEX_HANDOFF.md, docs/future-development-plan.md, docs/corpus-note-harness.md, and docs/metadata-template.md.

Current state:
- src/content/papers contains 62 schema-valid Markdown paper entries.
- The raw-note migration milestone is complete; no raw corpus notes remain.
- The active schema is descriptive. Do not add coverage scores, ranking scores, or trajectory_IR_relevance.
- / is the primary public atlas entry and renders the atlas directly; /library/ still renders the same atlas.
- /papers/[slug]/ renders individual long-form paper notes.
- Axis C/D normalization is render-time only through src/lib/axisNormalization.ts and src/data/taxonomy.json; do not weaken src/content.config.ts.
- npm run qa, npm run validate, npm run check, and npm run build are currently green.

Recently completed:
- Normalized Axis C first-class objects and Axis D rewrite objects into controlled render-time categories.
- Added separate Axis C and Axis D atlas filters.
- Added an atlas layout switch between Axis A x Axis B and normalized Axis C x Axis D.
- Preserved atlas URL state with layout=cd, c=, d=, exact scoped cells through cx=/cy=, tech=, workload=, and paper=.
- Added normalized Axis C/D and context chips on detail pages that link back into scoped atlas views.
- Reworked the atlas presentation:
  - larger responsive graph profiles for A/B and C/D;
  - graph-first single-column atlas layout;
  - click pins the selected paper while hover previews another paper's footprint and object/rewrite cloud;
  - expandable object/rewrite/context clouds for long metadata lists;
  - dense-cell summary under the atlas with one-click exact scoping for plotted cells.
- Expanded the taxonomy explanation to include Axis C object vocabulary and Axis D rewrite vocabulary.
- Added detail-page provenance affordances:
  - provenance strip for paper source, artifact link, artifact status, and last-checked date;
  - hero source actions derived from existing paper/artifact/docs/code links;
  - richer source cards with source-role descriptions and hostnames;
  - source note clarifying that artifact status and checked date come from recorded corpus metadata rather than live monitoring.
- Added source/provenance QA coverage:
  - npm run qa reports links.paper, links.artifact, artifact.url, links.docs, and links.code population;
  - missing paper-source links and entries with no recorded source links are informational audit items;
  - artifact last_checked coverage and links.artifact vs artifact.url disagreements are checked separately.
- Backfilled high-confidence links.paper values from existing body citations:
  - links.paper is now populated for 61/62 entries;
  - links.artifact is now populated for 38/62 entries and aligned with artifact.url coverage;
  - pim-eda.md is the only remaining entry without links.paper; it is a suite/toolchain entry composed from several related papers, so leave it blank unless a canonical suite paper is identified;
  - no entries currently lack all frontmatter source links;
  - artifact.last_checked remains complete;
  - artifact status/url contradictions, artifact URL-only entries, and links.artifact vs artifact.url disagreements remain at zero.
- Updated CODEX_HANDOFF.md and docs/future-development-plan.md with the latest state.

Good next steps:
1. Audit Axis C/D normalization quality against a handful of papers from different families; tune rules only when evidence clearly supports it.
2. Continue provenance backfill for pim-eda.md only if checked evidence identifies a canonical paper for the suite/toolchain as a whole; otherwise leave links.paper blank.
3. Preserve links.artifact and artifact.url alignment unless a future schema change intentionally separates those concepts.
4. Audit rendered note content for Markdown display edge cases, formula/math notation, escaped symbols, tables, and code blocks.
5. Consider whether technology/workload raw terms need controlled vocabularies after the current separate filters.
6. Keep improving mobile behavior for atlas/detail transitions, long titles, tables, code blocks, metadata panels, and dense-cell summaries.
7. Consider compact paper list/card views or a static search index only after detail-page scanability is stable.

Implementation guidance:
- Use current frontmatter and src/data/taxonomy.json as source of truth.
- Keep the public metadata contract descriptive.
- Keep legacy files intact unless explicitly asked to archive or rewrite them.
- Prefer incremental changes over rebuilding the atlas.
- Do not weaken src/content.config.ts.
- Re-run npm run qa, npm run validate, npm run check, and npm run build after edits.

Report:
- What detail-page, atlas-scoping, or provenance changes were made;
- Browser viewport checks if UI changed;
- qa/validate/check/build results;
- Remaining follow-up items.
```
