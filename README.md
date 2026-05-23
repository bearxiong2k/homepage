# Paper Library Draft

Static Astro scaffold for a CIM compiler/IR paper corpus.

## Mental model

```text
Paper library
├── taxonomy vocabulary in src/data/taxonomy.json
├── one Markdown file per paper in src/content/papers/
├── personal homepage and project shell under src/pages/
├── public atlas app at /library/
├── project registry in src/data/project-registry.json
├── completed website integration contract in docs/website-integration/
└── static hosting on a personal website
```

Paper metadata lives in each Markdown file's YAML frontmatter. The Markdown body is the long public corpus note.

## Important paths

```text
src/content/papers/          paper notes with structured frontmatter
src/data/taxonomy.json       Axis A/B plus object/rewrite vocabulary
src/pages/index.astro        personal homepage
src/pages/projects/          project index and CIM Library landing page
src/pages/library.astro      stable atlas route
src/pages/papers/[slug].astro dynamic paper route
src/components/TaxonomyAtlas.astro interactive atlas + selected-paper panel
src/lib/axisNormalization.ts render-time Axis C/D normalization
src/lib/rehypeMathDelimiters.mjs note math display cleanup
scripts/validate-library.mjs frontmatter/reference checks
scripts/scaffold-paper.mjs   create a new paper stub
AGENTS.md                    project instructions for future Codex runs
docs/corpus-note-harness.md  paper-note conversion harness
docs/website-integration/    static website integration contract
docs/legacy-source-map.md    where to recover legacy atlas/source details
docs/next-session-prompt.md  concise restart context
public/cim-library.manifest.json generated atlas manifest
```

## Run locally

```bash
npm install
npm run validate
npm run dev
```

Build for static hosting:

```bash
npm run export:atlas
npm run contract:website
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

If raw notes are imported in the future, use `docs/future-development-plan.md` before running full build checks. Raw notes must be promoted to frontmatter-backed content entries before `npm run validate` can pass.

## Visualization behavior

The atlas supports Axis A x Axis B and normalized Axis C x Axis D views. The selected-paper panel and paper detail pages expose summary metadata, provenance, normalized object/rewrite categories, context facets, and links into scoped atlas views. The active schema does not use coverage scores or ranking metrics.

## Website integration and next research layer

The personal static website shell now treats the CIM Library as a first-class project module. The retained integration checks define the registry/manifest contract:

```bash
npm run export:atlas
npm run contract:website
npm run smoke:website -- --fast
```

The next development direction returns to cluster analysis and broad academic working-group investigation. The seed roadmap is in `docs/archive/cluster-analysis-working-groups.md`.

The active visual direction is a quiet academic homepage with one small top nav. The homepage is the merged profile/about page; project detail starts at `/projects/`. Project modules can use their own visual surfaces, and the CIM atlas intentionally keeps its card/control/graph-heavy interface inside `/library/`.
