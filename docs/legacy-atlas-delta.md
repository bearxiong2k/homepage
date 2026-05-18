# Legacy Atlas Delta

The uploaded standalone HTML is now the UI benchmark for the next milestone. The current Astro route has better content plumbing, but the legacy draft has better taxonomy communication, layout density, and browsing utility.

## Legacy Strengths To Recover

- Strong hero framing with the core finding, corpus scale, and "middle layer" thesis.
- Sticky navigation across conceptual sections.
- Role cards and middle-style cards with representative works, risks, and first-class artifact language.
- Role × middle-style matrix with counts, paper names, and click-to-filter behavior.
- Hidden-IR pathology section that explains why named artifacts often differ from actual semantics.
- First-class object and rewrite-object tables that make the value-trajectory gap visible.
- Searchable paper atlas/cards with role/style filters, result count, compact summaries, and expandable details.
- Responsive behavior that keeps the browsing surface usable rather than reducing the atlas to a small decorative chart.

## Astro Differences To Preserve

- Data comes from Astro content collection frontmatter, not an embedded JSON script.
- `src/data/taxonomy.json` stores active Axis A/B vocabulary and colors.
- Paper pages remain available at `/papers/[slug]/`.
- Current content schema remains strict and descriptive.

## Legacy Features To Avoid Or Reinterpret

- Do not restore coverage scores, ranking scores, or `trajectory_IR_relevance` fields as paper metadata.
- Do not treat old visual totals as quality rankings.
- Derived UI counts are allowed: role counts, style counts, matrix cell counts, and filtered result counts.
- Legacy radar/coverage visuals may inspire layout, but any revived visualization must be based on active descriptive metadata.

## Current Gap

The current `TaxonomyAtlas.astro` dot plot is valid but underpowered: sizing is cramped, the atlas lacks the legacy matrix/list browsing loop, and the page does not communicate the taxonomy shape before forcing the user into individual dots. Fix this before paper detail page refinement.
