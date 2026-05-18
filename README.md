# Paper Library Draft

Static Astro scaffold for a CIM compiler/IR paper corpus.

## Mental model

```text
Paper library
├── taxonomy vocabulary in src/data/taxonomy.json
├── one Markdown file per paper in src/content/papers/
├── one atlas page at /library/
└── static hosting on a personal website
```

Paper metadata lives in each Markdown file's YAML frontmatter. The Markdown body is the long public corpus note.

## Important paths

```text
src/content/papers/          paper notes with structured frontmatter
src/data/taxonomy.json       Axis A/B vocabulary and coverage dimensions
src/pages/library.astro      atlas route
src/pages/papers/[slug].astro dynamic paper route
src/components/TaxonomyAtlas.astro interactive atlas + cloud panel
scripts/validate-library.mjs frontmatter/reference checks
scripts/scaffold-paper.mjs   create a new paper stub
AGENTS.md                    project instructions for future Codex runs
docs/corpus-note-harness.md  paper-note conversion harness
docs/legacy-source-map.md    where to recover legacy atlas/source details
CODEX_HANDOFF.md             concise implementation notes
```

## Run locally

```bash
npm install
npm run validate
npm run dev
```

Build for static hosting:

```bash
npm run build
```

## Add papers

1. Put one `.md` file in `src/content/papers/`.
2. Keep the YAML frontmatter fields in the sample files.
3. Put the complete paper note below the frontmatter.
4. Run `npm run validate` before committing.

Create a blank stub:

```bash
npm run new:paper -- cim-mlc "CIM-MLC"
```

For full note conversion, use `docs/corpus-note-harness.md`. Legacy seed material is intentionally preserved in `src/content/legacy/`; `docs/legacy-source-map.md` explains which file to consult for compact notes, original overview text, and old atlas behavior.

## Visualization behavior

The left atlas uses the existing draft's Axis A × Axis B dot-grid idea. The right panel replaces the old radar view with a selected-paper **coverage cloud**:

- background grid: same Axis A × Axis B frame as the atlas;
- membership bubbles: every listed Axis A × Axis B combination for the selected paper;
- coverage bubbles: coverage dimensions with level > 0, sized by level 1–3.

This gives paper-specific shape without introducing scores or radar charts.
