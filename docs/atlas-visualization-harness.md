# Atlas Visualization Harness

Use this harness when improving `/library/`, `src/components/TaxonomyAtlas.astro`, `src/pages/library.astro`, `src/styles/global.css`, or related static data transforms.

The current priority is the taxonomy atlas experience. Do this before single-paper page refinement. The legacy standalone draft at `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html` is the reference for interaction density, visual hierarchy, and explanatory scaffolding. The Astro version should keep its cleaner Markdown/content-collection data flow, but it needs to recover the draft's utility.

## Design Goal

The atlas should answer the corpus-level question first:

> What object does each stack make first-class, and where does it sit in the Axis A × Axis B landscape?

A visitor should understand the taxonomy shape, dominant clusters, and selected-work details without first opening an individual paper page.

## Source Priority For Atlas Work

1. `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html` for original layout, overview sections, matrix behavior, filtering behavior, paper-card browsing, and visual density.
2. `src/content/legacy/CIM stack library compact.md` for legacy display labels and short overview text when current frontmatter is too long for UI.
3. `src/data/taxonomy.json` for active Axis A/B names, descriptions, and colors.
4. `src/content/papers/*.md` frontmatter for current paper metadata.
5. `docs/legacy-atlas-delta.md` and `docs/legacy-source-map.md` for migration context.

Do not use generated legacy scores as current metadata. The active contract stays descriptive.

## What To Learn From The Legacy HTML

Keep or adapt these strengths:

- Strong first-screen framing: core finding, corpus counts, taxonomy scale, and why the middle layer matters.
- Sticky or easy navigation across taxonomy overview, matrix, hidden-IR gap, object/rewrite tables, and paper atlas.
- Role and middle-style cards that show representative works and the "first-class artifact" each bucket owns.
- A role × middle-style matrix with counts and paper names; clicking a non-empty cell filters the atlas.
- Searchable paper browsing with role/style filters, result counts, compact cards, and expandable details.
- Visual explanations of the hidden-IR pathology, first-class CIM objects, rewrite objects, and value-trajectory gap.
- Responsive behavior that preserves browsing utility instead of shrinking the chart into an unreadable widget.

Improve these areas in the Astro version:

- Use current Markdown frontmatter instead of embedded JSON.
- Preserve links to individual paper pages.
- Keep selected-paper details synchronized with filters and matrix/list interactions.
- Replace any legacy-only coverage/ranking fields with derived counts, badges, or descriptive labels.

## Required Interaction Surface

At minimum, the atlas milestone should provide:

- Search across title, summary, technology, workloads, baselines, Axis C objects, and Axis D rewrite objects.
- Axis A filter and Axis B filter.
- Technology/workload filter or equivalent tag filter.
- Visible result count and active filter state.
- Reset/clear filters affordance.
- Clickable role × middle-style cells, or an equivalent overview that filters the paper set.
- Selected-paper panel or synchronized paper-card detail region with title, year/venue, Axis A/B, summary, objects, rewrites, and link to `/papers/<slug>/`.
- Keyboard-accessible controls and click targets.
- Empty state for no matches.

Optional but useful:

- Toggle between dot atlas and list/card browsing.
- Highlight selected point/card in both views.
- Dense tooltip or hover preview for points.
- Group labels or cluster counts inside the dot atlas.

## Layout Requirements

- The atlas must be visually primary on `/library/`; do not bury it below oversized repeated cards.
- Use stable dimensions for the chart, matrix, controls, and selected panel so filtering does not resize the page unpredictably.
- On desktop, provide enough width for Axis A × Axis B comparison and enough height for all B styles to be legible.
- On mobile, prefer scrollable matrix/chart regions plus a readable list/card fallback.
- Text must not overlap inside dots, cards, axis labels, controls, or selected panels.
- Use derived counts and labels to reduce cognitive load; do not make the visitor infer everything from isolated dots.

## Implementation Guardrails

- Keep the site static. Do not add a backend, database, PDF hosting, or client-side dependency unless clearly justified.
- Keep `src/content.config.ts` strict. Do not weaken schema validation for UI convenience.
- Do not add `coverage`, ranking, or `trajectory_IR_relevance` fields to paper frontmatter.
- Derived UI counts are fine: Axis A counts, Axis B counts, matrix cell counts, filtered result counts.
- Prefer small, inspectable component changes over a large framework rewrite.
- Reuse legacy language when it helps explain the taxonomy, but adapt it to current schema and remove obsolete score semantics.

## Verification

Before finishing atlas work:

1. Run `npm run validate`.
2. Run `npm run check`.
3. Run `npm run build`.
4. Start or use the local dev server and inspect `/library/`.
5. Capture browser screenshots at desktop and mobile widths.
6. Check that the chart is nonblank, labels are legible, filters work, matrix/list interactions update the same paper set, and selected-paper details remain useful after filtering.

Report:

- UI changes made and files changed.
- Legacy behaviors recovered or intentionally skipped.
- Screenshots/viewport checks performed.
- Validation/check/build results.
- Remaining atlas shortcomings before paper-page polish.
