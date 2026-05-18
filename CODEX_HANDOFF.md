# Codex handoff

## Goal

Finish this as a static Astro paper library. Do not add PDF hosting yet.

Root-level project instructions now live in `AGENTS.md`. Use this handoff as a short status note; use `AGENTS.md` for ongoing agent behavior.

## Design decisions already made

- Paper metadata source: Markdown frontmatter in `src/content/papers/*.md`.
- Taxonomy vocabulary source: `src/data/taxonomy.json`.
- Atlas route: `/library/`.
- Paper route: `/papers/[slug]/`.
- Visualization: keep the old left-side Axis A × Axis B dot atlas; replace radar with selected-paper coverage cloud.
- No scoring model. Coverage levels are descriptive 0–3 metadata.

## What to finish next

1. Move complete paper notes into `src/content/papers/` and preserve/extend frontmatter.
2. Decide whether to keep sample seed bodies or replace them with full notes.
3. Run `npm install`, `npm run validate`, `npm run check`, and `npm run build`.
4. Improve the Markdown paper page layout only after content compiles.
5. Optional: add tag/axis detail pages after the atlas is stable.

Use `docs/corpus-note-harness.md` when generating full public notes. Use `docs/legacy-source-map.md` when recovering original overview text, legacy coverage behavior, or compact-source material from the draft artifacts.

## Frontmatter contract

Required fields:

```yaml
slug: lowercase-kebab-case
title: Paper title
summary: public one-paragraph summary
axis_A:
  primary: A1|A2|A3|A4|A5|A6
  secondary: []
axis_B: [B1]
coverage:
  frontend: 0
  graph: 0
  loop: 0
  resource: 0
  mapping: 0
  isa: 0
  sim: 0
  accuracy: 0
  runtime: 0
  macro: 0
  real: 0
  artifact: 0
```

Keep arrays inline where possible. The Astro schema is the strict source of truth; `scripts/validate-library.mjs` is a fast preflight check.

Coverage levels are descriptive evidence levels, not a ranking model. The current atlas sums the twelve dimensions only for visualization size and summary display.

## Converting existing generated notes

Use the note's section 11 metadata block when present. If absent, extract from:

- section 1 classification table -> `axis_A`, `axis_B`, objects, rewrite objects, tags, baselines;
- section 2 public summary -> `summary`;
- section 8 artifact status -> `artifact` and `reproducibility_level`;
- section 10 final takeaway -> `takeaways`.

Do not try to parse the entire prose automatically before the schema is stable. Prefer a small manual adapter plus validation.
