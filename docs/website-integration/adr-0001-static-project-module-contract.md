# ADR 0001: Static Project Module Contract

## Status

Proposed.

## Context

The CIM Library is both a research atlas and a future personal-website project. The repository should support the atlas today and additional projects later without introducing backend infrastructure.

## Decision

Use a static project-module contract:

1. Project metadata lives in `src/data/project-registry.json`.
2. Each substantial project may generate a static manifest under `public/`.
3. The personal website shell reads registry entries for navigation and cards.
4. Full project experiences remain separate routes, such as `/library/`.
5. Project detail pages can read their own manifest or source data as needed.

## Consequences

Benefits:

- Works with static hosting.
- Keeps content review simple.
- Makes future projects easy to add.
- Avoids hidden backend dependencies.
- Lets the CIM atlas remain linkable and independently useful.

Tradeoffs:

- Cross-project search and dashboards are limited to what manifests export.
- Large projects may need their own export scripts.
- The registry must be kept current when project routes move.

## Rejected alternatives

- Backend database: unnecessary for a public static corpus.
- Embedding the whole atlas on the homepage: makes the homepage heavy and harder to understand.
- One-off hard-coded project cards: fast initially, but brittle as projects grow.
