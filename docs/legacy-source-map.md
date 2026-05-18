# Legacy Source Map

This project began as a generated standalone HTML atlas plus compact source notes. Keep the legacy files available because they contain migration material that is not fully represented in the current two seed paper entries.

## Files

- `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html`
  - Original standalone atlas.
  - Contains embedded paper records, role/style counts, display names, short overviews, and visualization logic.
  - Use this when recovering the old atlas overview text, original grouping, legacy display labels, or old visualization behavior.
  - For the current atlas milestone, treat this as the UI reference for first-screen framing, role/style cards, matrix click-to-filter behavior, searchable paper cards, result counts, and responsive layout density.
- `src/content/legacy/CIM stack library compact.md`
  - Compact source material for the 62-entry paper library.
  - Use this as the main seed when creating new `src/content/papers/*.md` entries.
- `src/content/legacy/CIM taxonomy.md`
  - Longer taxonomy background.
  - Use this to resolve ambiguity before changing `src/data/taxonomy.json`.
- `src/content/legacy/note prompt.md`
  - Original long-form generation harness.
  - Condensed into `docs/corpus-note-harness.md` for future paper work.

## Migration Notes

- Current Astro metadata does not use coverage scores or trajectory-IR relevance fields.
- Do not restore the old visual totals as quality rankings.
- If a future task asks for "original paper overview", first check the embedded records in the legacy HTML, then cross-check the matching compact note.
- If a future task asks for "coverage score", treat it as a legacy-atlas request unless the user explicitly asks to reintroduce coverage metadata.
- If a future task asks to improve the atlas, start with `docs/atlas-visualization-harness.md` and the legacy HTML before touching paper detail pages.

## Migration Order

1. Choose a paper from `CIM stack library compact.md`.
2. Recover any legacy display name or short overview from the HTML if useful.
3. Re-check the paper/artifact evidence.
4. Write the full corpus note with `docs/corpus-note-harness.md`.
5. Fill frontmatter using `docs/metadata-template.md`.
6. Run `npm run validate`.
