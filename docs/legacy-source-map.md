# Legacy Source Map

This project began as a generated standalone HTML atlas plus compact source notes. Keep the legacy files available as provenance and recovery material, but treat current Markdown frontmatter and `src/data/taxonomy.json` as the active source of truth.

## Files

- `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html`
  - Original standalone atlas.
  - Contains embedded paper records, role/style counts, display names, short overviews, and visualization logic.
  - Use only when recovering old overview text, original grouping, legacy display labels, or behavior that is missing from the current Astro atlas.
- `src/content/legacy/CIM stack library compact.md`
  - Compact source material for the 62-entry paper library.
  - Use as seed material for future paper additions or note revisions, then re-check paper/artifact evidence.
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
- The raw-note migration and atlas-core milestones are complete. Compact current state lives in `docs/active-context.md`; detailed roadmap context lives in `docs/future-development-plan.md`.

## Future Paper Import Order

1. Choose a paper from `CIM stack library compact.md`.
2. Recover any legacy display name or short overview from the HTML if useful.
3. Re-check the paper/artifact evidence.
4. Write the full corpus note with `docs/corpus-note-harness.md`.
5. Fill frontmatter using `docs/metadata-template.md`.
6. Run `npm run validate`.
