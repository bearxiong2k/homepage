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
docs/README.md               documentation map and context routing
docs/active-context.md       compact current project state
docs/iteration-docs-playbook.md docs maintenance workflow
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

## Local workflow hooks

Install the repo-owned Git hooks once per clone:

```bash
npm run hooks:install
```

The hooks call package scripts rather than duplicating command lists:

```text
pre-commit -> npm run hook:precommit
pre-push   -> npm run hook:prepush
```

`hook:precommit` is the fast, non-mutating gate: content QA, metadata validation, atlas-export freshness check, website contract check, Marginalia sync drift check, and whitespace diff check.

`hook:prepush` is the full local release gate: everything above plus `astro check` and a production-base build with `ASTRO_SITE=https://bearxiong2k.github.io` and `ASTRO_BASE=/homepage`.

For Codex sessions, use the same full gate directly:

```bash
npm run codex:checkpoint
```

When Marginalia changes, sync from the Marginalia repo first when possible:

```bash
cd ../Marginalia
npm run sync:homepage:validate
```

From this repo, `npm run sync:marginalia` mirrors `../Marginalia/public/` into `public/marginalia/`; `npm run sync:marginalia:check` verifies the copy without changing files.

## Deploy to GitHub Pages

The repository includes a GitHub Actions Pages workflow at `.github/workflows/deploy-pages.yml`. It deploys pushes to `main` as a GitHub Pages project site:

```text
https://bearxiong2k.github.io/homepage/
```

In GitHub, set **Settings -> Pages -> Build and deployment -> Source** to **GitHub Actions**. The workflow keeps local development at `/`, but builds production with `ASTRO_BASE=/homepage` so static assets resolve under the project-site path.

If this repository later moves to a root Pages site, such as `bearxiong2k.github.io`, or uses a custom domain at the domain root, change the workflow build environment to `ASTRO_BASE=/` and set `ASTRO_SITE` to the final domain.

## Cloudflare Web Analytics

Cloudflare Web Analytics requires the JavaScript snippet when the hostname is not managed as a website in the same Cloudflare account. This site has the public beacon token installed in the shared Astro layout. To rotate or override it locally, set:

```bash
PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN=your-token
```

For GitHub Pages deployment, the checked-in default token is enough. If the token changes, either update the layout or add a repository variable named `CLOUDFLARE_WEB_ANALYTICS_TOKEN` under **Settings -> Secrets and variables -> Actions -> Variables**. The Pages workflow passes it to Astro at build time and the shared layout emits Cloudflare's beacon script on every page.

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

If raw notes are imported in the future, use `docs/corpus-note-harness.md` and `docs/metadata-template.md` before running full build checks. Raw notes must be promoted to frontmatter-backed content entries before `npm run validate` can pass.

## Visualization behavior

The atlas supports Axis A x Axis B and normalized Axis C x Axis D views. The selected-paper panel and paper detail pages expose summary metadata, provenance, normalized object/rewrite categories, context facets, and links into scoped atlas views. The active schema does not use coverage scores or ranking metrics.

## Website integration and next research layer

The personal static website shell now treats the CIM Library as a first-class project module. The retained integration checks define the registry/manifest contract:

```bash
npm run export:atlas
npm run contract:website
npm run smoke:website -- --fast
```

The active development direction is cluster analysis and broad academic working-group investigation. Use `docs/active-context.md` for the compact current state. The original seed roadmap is archived at `docs/archive/2026-05-cluster-analysis-working-groups-seed.md`.

The active visual direction is a quiet academic homepage with one small top nav. The homepage is the merged profile/about page; project detail starts at `/projects/`. Project modules can use their own visual surfaces, and the CIM atlas intentionally keeps its card/control/graph-heavy interface inside `/library/`.

For docs maintenance, use `docs/iteration-docs-playbook.md`. New sessions should not bulk-read all docs; use `docs/README.md` to select task-specific context.
