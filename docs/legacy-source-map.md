# Legacy Source Map

This project began as a generated standalone HTML atlas plus compact source notes. Keep the legacy files available because they contain migration material that is not fully represented in the current two seed paper entries.

## Files

- `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html`
  - Original standalone atlas.
  - Contains embedded paper records, role/style counts, display names, short overviews, and visualization logic.
  - Use this when recovering the old atlas overview text, original grouping, legacy display labels, or legacy coverage/visual score behavior.
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

- Current Astro metadata uses `coverage` as twelve descriptive dimensions with levels `0..3`.
- `src/components/TaxonomyAtlas.astro` currently computes a paper's visual coverage total by summing those twelve levels.
- Do not treat the visual total as a quality ranking.
- If a future task asks for "original paper overview", first check the embedded records in the legacy HTML, then cross-check the matching compact note.
- If a future task asks for "coverage score", inspect both the legacy HTML visualization logic and the current `coverage` frontmatter before deciding whether the request refers to old display behavior or the new descriptive metadata.

## Migration Order

1. Choose a paper from `CIM stack library compact.md`.
2. Recover any legacy display name or short overview from the HTML if useful.
3. Re-check the paper/artifact evidence.
4. Write the full corpus note with `docs/corpus-note-harness.md`.
5. Fill frontmatter using `docs/metadata-template.md`.
6. Run `npm run validate`.
