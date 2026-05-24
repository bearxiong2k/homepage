# Focus: Manifest and Visualization Refinement

Status: active

Default-context policy: Read when refining static manifests, atlas or cluster visualization, website-facing project summaries, or route presentation for the CIM Library.

## Intent

Refine the public manifest and visualization layer before doing more cluster investigation. The goal is to make the library's static data surfaces and visual routes better organized, easier to inspect, and useful for future cluster work without changing the descriptive paper metadata contract.

## Current Surfaces

- Manifest exporter: `scripts/export-atlas-manifest.mjs`.
- Website-facing manifest: `public/cim-library.manifest.json`.
- Website contract check: `scripts/check-website-contract.mjs`.
- Project registry: `src/data/project-registry.json`.
- Full atlas route: `src/pages/library.astro`.
- Atlas visualization component: `src/components/TaxonomyAtlas.astro`.
- Cluster route: `src/pages/clusters/index.astro`.
- Cluster source: `src/data/clusters.json`.
- Website project page using manifest data: `src/pages/projects/cim-library/index.astro`.
- Plain paper-note index: `src/pages/papers/index.astro`.
- CIM Library lower-hierarchy navigator across `/projects/cim-library/`, `/library/`, `/clusters/`, `/papers/`, and `/papers/[slug]/`.

## Initial Questions

- What should the manifest expose for downstream website/project modules beyond paper counts and Axis A/B summaries?
- Should cluster summaries be exported into the manifest, into a separate cluster manifest, or remain only in `src/data/clusters.json`?
- Which visualization refinements should happen in `/library/`, `/clusters/`, or both?
- Can the manifest encode route-level summaries and available views without adding scores or changing paper frontmatter?
- What shape would make future cluster pages or project cards easier to build while keeping the site static and inspectable?
- How should the CIM Library's local navigator behave like the global navigator while remaining clearly lower in hierarchy?

## Current Decision

- Extend `public/cim-library.manifest.json` rather than creating a separate cluster manifest for now.
- Export compact route inventory, public view descriptors, and cluster-layer stats/summaries.
- Keep full cluster prose, evidence, uncertainty, and investigation-card text in `src/data/clusters.json`.
- Use the manifest for website-facing project summaries and view cards.
- Treat CIM Library navigation as a local project navigator, not ad hoc inline links: it should behave like the global navigator but sit one hierarchy lower and route among project overview, atlas, cluster notes, and paper details.
- Implemented `src/components/CimLibraryNav.astro` as the shared lower-hierarchy navigator for overview, atlas, clusters, and notes.
- The Notes target is now `/papers/`, a plain listing of all recorded paper notes; individual `/papers/[slug]/` pages keep Notes active in the local navigator.
- `/library/` uses a page-level sidebar for its in-page atlas anchors instead of top card buttons, matching the paper-detail page's section-navigation pattern.
- Route-level links inside the CIM Library are centralized: project overview uses the local navigator rather than duplicate route cards or inline route links, while cluster-specific atlas filters live in the top `/clusters/` focus map instead of being repeated inside every cluster card.
- `npm run contract:website` enforces `docs/website-integration/schemas/atlas-manifest.schema.json` before bespoke route/count checks, so route and view drift fails the normal website loop.
- `/clusters/` uses a focus-first display: the top map names each cluster's binding object and routes to detail, while cluster cards keep representative/supporting papers beside evidence, working-group notes, and investigation details in grouped disclosures.
- Merged cluster/content task: future cluster iterations should develop content and manifest together. For each cluster, prefer an insightful text graph or prose-graph explanation of object flow, lineage/boundary, and evidence relationships over scattered decorative cards. If this becomes structured data, update `src/data/clusters.json`, `scripts/export-atlas-manifest.mjs`, the manifest schema, and `/clusters/` in the same batch.
- Keep cluster content out of paper frontmatter.

## Guardrails

- Keep `/library/`, `/clusters/`, and `/papers/[slug]/` stable.
- Keep implementation static; do not add backend services or a database.
- Do not add coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.
- Do not move cluster conclusions into paper frontmatter unless the public metadata contract intentionally changes.
- Use generated manifest data for website summaries where practical; avoid hand-copying counts across pages.
- Keep the local navigator simple, stable, and route-based; avoid duplicating the full atlas UI or turning page headers into unrelated link piles.
- Keep cluster and working-group labels coarse, tentative where evidence is weak, and traceable to papers/artifacts/authors/repositories.

## Likely Work Batches

1. Consider whether the project registry should display manifest-derived route/view metadata in `/projects/`.
2. Consider whether `/papers/` should gain lightweight filters or grouping after the plain listing proves stable.
3. Add cluster text-graph/prose-graph content and manifest support together, one coherent cluster slice at a time.
4. Run the full website loop after implementation.

## Local Navigator Target

- Scope: CIM Library project only.
- Routes: `/projects/cim-library/`, `/library/`, `/clusters/`, `/papers/`, and paper detail pages under `/papers/[slug]/`.
- Behavior: same mental model as the global navigator, but visually and structurally subordinate to it.
- Content: use short route labels such as Overview, Atlas, Clusters, and Papers/Notes; avoid long explanatory inline link strings.
- Active state: show the current project sub-route where practical.
- Data source: prefer manifest `routes` and `views` for stable route labels; keep page-specific anchors local to the page.
- Current implementation: labels are Overview, Atlas, Clusters, and Notes; the Notes state links to `/papers/` and is active on both `/papers/` and `/papers/[slug]/`.
- Global navigation mapping: the whole CIM Library route family, including `/projects/cim-library/`, `/library/`, `/clusters/`, `/papers/`, and `/papers/[slug]/`, should keep the top-level `CIM Library` item active. The generic `Projects` top-level item should not take over for the CIM Library overview page.
- Link structure: keep route-level navigation in `CimLibraryNav`; collect repeated scoped atlas links in a single structured section; keep paper, source, and in-page anchor links contextual.

## Verification

For docs-only focus setup, run:

```bash
npm run validate
```

After manifest, route, visualization, or contract edits, run:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```

Use a browser smoke check for any rendered `/library/`, `/clusters/`, or project-page visual changes.
