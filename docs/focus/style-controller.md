# Focus: General Style Controller

Status: active

Default-context policy: Read when resuming the active focus or working on website styling infrastructure.

## Goal

Construct a general style controller for the CIM Library / personal website shell so visual decisions can be adjusted coherently across routes instead of being scattered through page-specific CSS.

The controller should handle at least:

- color roles and palette tokens;
- typography and font choices;
- spacing, radius, borders, and surface treatments;
- route-level density or presentation modes where useful;
- reusable formatting decisions for article pages, atlas views, cluster notes, and project pages.

## Current Implementation

The first controller slice is CSS custom properties in `src/styles/global.css`. It introduces canonical tokens for color, typography, radius, common shadows, and link underline spacing while keeping existing legacy variables such as `--bg`, `--panel`, `--ink`, `--muted`, `--line`, `--accent`, `--link`, `--rule`, `--radius`, `--mono`, and `--sans` as compatibility aliases.

Link policy is part of the controller: ordinary content links are underlined by default, matching paper detail notes. Navigation, pills, outline controls, and card-like source controls can opt out with local `text-decoration: none`.

This keeps the site static and inspectable, avoids a new client dependency, and allows gradual replacement of hard-coded page-level styling.

## Next Steps

1. Inventory remaining hard-coded color, spacing, radius, and font-size clusters in `src/styles/global.css`.
2. Replace repeated values with semantic tokens only where the role is clear.
3. Decide whether route-level density or presentation modes need a small data/config layer after the CSS-token pass.
4. Verify `/`, `/projects/`, `/projects/cim-library/`, `/library/`, `/clusters/`, `/papers/`, and representative paper pages after each substantial slice.

## Main Files

- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/components/CimLibraryNav.astro`
- `src/components/TaxonomyAtlas.astro`
- `src/pages/index.astro`
- `src/pages/projects/index.astro`
- `src/pages/projects/cim-library/index.astro`
- `src/pages/library.astro`
- `src/pages/clusters/index.astro`
- `src/pages/papers/[slug].astro`

## Guardrails

- Keep `/library/`, `/clusters/`, `/papers/`, and `/papers/[slug]/` stable.
- Do not introduce a backend service, client-side styling dependency, or database.
- Preserve the static, inspectable Astro implementation.
- Prefer a small token/controller layer over a broad redesign.
- Keep academic/library routes quiet, readable, and dense enough for repeated research use.
- Do not make broad visual changes until the existing style surfaces and duplicated decisions are inventoried.
