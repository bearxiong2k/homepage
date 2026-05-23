# Website + Atlas Integration Plan

## Goal

Make the CIM atlas feel like a polished project inside your personal website while preserving it as a reusable, static, research-facing module.

## Phase 0: protect the current atlas baseline

- Keep `npm run qa`, `npm run validate`, `npm run check`, and `npm run build` green.
- Do not weaken `src/content.config.ts` to pass malformed entries.
- Preserve the current paper corpus and taxonomy vocabulary unless there is a deliberate content change.
- Keep `/library/` and `/papers/[slug]/` stable so external links do not break.

## Phase 1: add the website shell

Target routes:

- `/`: personal homepage with name, research focus, featured projects, and selected writing.
- `/projects/`: grid/list of project cards read from `src/data/project-registry.json`.
- `/projects/cim-library/`: project landing page explaining why the atlas exists, what it covers, how to use it, and how it is maintained.
- `/library/`: full atlas app.
- `/papers/[slug]/`: detail notes.

The homepage should not duplicate the atlas UI. It should introduce the project and route visitors to the full atlas.

## Phase 2: stabilize the project registry

Create or maintain `src/data/project-registry.json` with one entry per project. A project entry should include:

- `id`
- `title`
- `kind`
- `status`
- `summary`
- `route`
- `repo`
- `source_manifest`
- `tags`
- `featured`

The registry is for website navigation and project cards. The atlas manifest is for project-specific statistics and content summaries.

## Phase 3: export the CIM atlas manifest

Run:

```bash
npm run export:atlas
```

The manifest should include:

- paper count;
- year range;
- Axis A/B counts;
- normalized Axis C/D count summaries;
- top technology/workload facets;
- one lightweight record per paper.

Use the generated manifest for homepage cards such as "62 papers classified", "Axis A x B atlas", or "active research corpus" without importing Astro content directly into every page.

## Phase 4: improve paper-detail trust and scanability

Prioritize:

- compact metadata panels;
- visible source/provenance links;
- clearer Axis C and Axis D rendering;
- robust long-note typography;
- mobile behavior for long titles, tables, code blocks, and sidebars;
- back-links preserving atlas filter/selection context where practical.

## Phase 5: add reusable future-project templates

For every future project, add:

```text
src/data/project-registry.json entry
public/<project-id>.manifest.json or generated equivalent
/project-route/
/project-route/<detail-route>/ if needed
docs/<project-id>/maintenance-notes.md
scripts/export-<project-id>-manifest.mjs
```

A future project does not need to be a paper atlas, but it should be statically exportable and summarized through the same registry.

## Phase 6: only split repositories if necessary

Stay in one Astro repo while the website and atlas are both small enough to maintain together. Split later only if a project needs a different build system, large assets, independent releases, or private work-in-progress history.
