# Website + Atlas Integration Record

## Goal

Record the completed website-shell integration for the CIM atlas while preserving it as a reusable, static, research-facing module.

The website shell should feel like a quiet academic personal site: serif typography, plain rules, restrained links, and a clear hierarchy. The homepage should stay concise and merged with the profile/about content. Project detail belongs under `/projects/`, and the CIM atlas plus future project routes may use distinct UI styles when that makes the project type clearer.

## Protect the atlas baseline

- Keep `npm run qa`, `npm run validate`, `npm run check`, and `npm run build` green.
- Do not weaken `src/content.config.ts` to pass malformed entries.
- Preserve the current paper corpus and taxonomy vocabulary unless there is a deliberate content change.
- Keep `/library/` and `/papers/[slug]/` stable so external links do not break.

## Completed shell

Target routes:

- `/`: concise personal homepage with name, research focus, education, selected publications, contact, and a route to `/projects/`.
- `/projects/`: grid/list of project cards read from `src/data/project-registry.json`.
- `/projects/cim-library/`: project landing page explaining why the atlas exists, what it covers, how to use it, and how it is maintained.
- `/library/`: full atlas app.
- `/papers/[slug]/`: detail notes.

The homepage should not duplicate the atlas UI or the project landing page. It should introduce the person and route visitors to `/projects/`.

## Project registry

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

## Atlas manifest

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

## Paper-detail trust and scanability

Prioritize:

- compact metadata panels;
- visible source/provenance links;
- clearer Axis C and Axis D rendering;
- robust long-note typography;
- mobile behavior for long titles, tables, code blocks, and sidebars;
- back-links preserving atlas filter/selection context where practical.

## Future project pattern

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

The old template files and installer were removed after initialization. Use the live CIM Library project files as the reference implementation.

## Repository split guidance

Stay in one Astro repo while the website and atlas are both small enough to maintain together. Split later only if a project needs a different build system, large assets, independent releases, or private work-in-progress history.
