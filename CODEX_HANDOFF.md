# Codex Handoff

## Project

Static Astro paper library for CIM compiler/IR-stack research.

- Paper metadata lives in `src/content/papers/*.md` frontmatter.
- Taxonomy vocabulary lives in `src/data/taxonomy.json`.
- Atlas routes: `/` and `/library/` render the same atlas; `/` is the primary public entry.
- Paper route: `/papers/[slug]/`.
- Keep the site static. Do not add PDF hosting, backend services, or a database.
- Do not reintroduce coverage scores, ranking scores, or `trajectory_IR_relevance`.

## Current State

- 62 paper notes are migrated and schema-valid.
- No raw long-form corpus notes remain in `src/content/papers/`.
- `/` and `/library/` atlas core is substantially done.
- Current atlas behavior:
  - large graph with layout switch between Axis A x Axis B and normalized Axis C x Axis D;
  - deterministic node spreading;
  - hover/focus previews with a hover footprint cloud;
  - click and picker selection;
  - separate filters for Axis A, Axis B, normalized Axis C, normalized Axis D, technology, and workload;
  - URL state for `layout=cd`, `c=`, `d=`, exact scoped cells through `cx=` / `cy=`, `tech=`, `workload=`, and selected `paper=`;
  - selected-paper footprint rendered on the atlas background, while hover previews another paper without changing the pinned selection;
  - selected-paper card prioritizes title/summary and opens the paper detail page with atlas state preserved;
  - object/rewrite/context cloud uses expandable groups for long metadata lists;
  - dense-cell summary under the atlas shows the largest plotted cells and can scope exactly to a cell;
  - responsive layout and mobile graph scroll.
- Axis C/D normalization is render-time only and comes from `src/lib/axisNormalization.ts` plus `src/data/taxonomy.json`; the content schema has not been weakened.
- Paper detail pages have:
  - initial CSS improvements for long notes, tables, code blocks, and mobile wrapping;
  - normalized Axis C/D chips;
  - detail-page facet/context chips that link back into scoped atlas views;
  - a source provenance strip derived from existing frontmatter;
  - richer paper/artifact/docs/code link cards with hostnames and short source-role descriptions.
- `npm run qa` now includes source/provenance coverage counters:
  - `links.paper`, `links.artifact`, `artifact.url`, `links.docs`, and `links.code` population;
  - missing paper-source links;
  - missing artifact `last_checked` dates;
  - artifact URLs recorded only under `artifact.url`;
  - disagreement between `links.artifact` and `artifact.url`;
  - entries with no recorded source links.
- Provenance backfill progress:
  - `links.paper` is populated for 45/62 entries after high-confidence backfill from existing body citations;
  - `links.artifact` is populated for 38/62 entries after mirroring existing `artifact.url` values;
  - 17 entries still need manual source checking before adding a paper link;
  - 7 entries currently have no recorded frontmatter source link at all;
  - artifact `last_checked` remains complete;
  - artifact status/url contradictions, artifact URL-only entries, and `links.artifact` / `artifact.url` disagreements remain at zero.

Latest known checks:

```bash
npm run validate
npm run check
npm run build
```

All were green after the latest detail-page provenance work.

## Next Work

Primary focus: backfill and normalize provenance metadata carefully.

- Use existing paper-body citations and checked sources to populate `links.paper` for representative papers first.
- Continue with the remaining 17 missing `links.paper` entries only when the body citation or checked source clearly identifies the exact paper.
- Keep future `links.artifact` and `artifact.url` values aligned unless there is a clear reason to distinguish source-card link from artifact status URL.
- Do not invent paper, code, docs, or artifact links; leave blank fields blank when uncertain.
- Keep artifact status, license, and last-checked conservative.

Secondary detail-page focus:

- Make long notes easier to read and scan.
- Improve metadata panels and Axis C / Axis D presentation.
- Keep mobile behavior robust for long titles, tables, code blocks, and sidebars.

Secondary focus: refine atlas scoping/filtering after the current C/D pass.

- Audit the render-time Axis C/D rules for false positives and overly broad buckets.
- Consider normalized controlled vocabularies for technology/workload if the raw terms become noisy.
- Keep selected-cell and dense-cluster views descriptive; do not turn them into scores.
- Keep preserving atlas state between `/`, `/library/`, and paper detail pages.

## References

- `docs/future-development-plan.md`: current development plan.
- `docs/next-session-prompt.md`: restart prompt.
- `docs/corpus-note-harness.md`: use only when adding or substantially revising paper notes.
- `docs/metadata-template.md`: frontmatter shape.
- `src/content/legacy/*`: legacy source material. Keep intact unless explicitly asked otherwise.

## Guardrails

- Keep content QA green: `npm run qa`, `npm run validate`, `npm run check`, `npm run build`.
- Do not weaken `src/content.config.ts` to accommodate malformed notes.
- Do not invent paper facts, artifact links, licenses, venues, years, or reproducibility claims.
- Keep metadata descriptive, not evaluative.
