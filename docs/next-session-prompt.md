# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/homepage.

Read AGENTS.md and docs/active-context.md first. Then use docs/README.md to choose task-specific context. Do not bulk-read archives, legacy docs, website-integration docs, or paper-note harnesses unless the task needs them.

Project status:
- Static Astro personal website shell with a CIM compiler/IR paper library and a hosted Marginalia sub-PWA.
- 62 schema-valid paper entries.
- Stable routes: /, /projects/, /projects/cim-library/, /projects/cim-library/methodology/, /projects/marginalia/, /marginalia/, /library/, /clusters/, /papers/, /papers/[slug]/.
- src/data/project-registry.json currently lists two projects: CIM Library and Marginalia.
- public/marginalia/ is synced from sibling repo ../Marginalia/public/ by npm run sync:marginalia.
- Marginalia must remain a static subdirectory PWA. Do not iframe it into Astro, move service-worker.js to public/, rename IndexedDB/package formats, or broaden the service-worker scope.
- Marginalia's service worker cache cleanup must only delete caches with the marginalia-static- prefix because GitHub Pages cache storage is origin-wide.
- tsconfig.json excludes public/marginalia/** so Astro diagnostics do not typecheck vendored/static PWA files.

Active focus:
- Website project integration for Marginalia.
- Main files: package.json, src/data/project-registry.json, src/pages/projects/marginalia/index.astro, public/marginalia/, tsconfig.json, and sibling ../Marginalia/public/service-worker.js.
- Current implementation: Marginalia has a project landing page at /projects/marginalia/ and a direct app route at /marginalia/. In production with ASTRO_BASE=/homepage, the PWA is expected at https://bearxiong2k.github.io/homepage/marginalia/.
- Next priority: review the synced static diff, push through the normal homepage deployment path, then smoke production import/note/export/clear-site-data/restore.

Paused focus:
- Paper metadata maintenance.
- Focus doc: docs/focus/paper-metadata-maintenance.md.
- Current metadata checkpoint: all 62 entries have source-backed citation_source records. Future paper work should audit citation freshness and source quality as maintenance.

Other paused focus:
- General style controller.
- Focus doc: docs/focus/style-controller.md.

Completed focus:
- Cluster analysis and working-group content.
- Focus doc: docs/focus/cluster-analysis-working-groups.md.

Method:
- Keep implementation static and inspectable.
- Keep /library/ and /papers/[slug]/ stable.
- Do not add backend services, databases, PDF hosting, ranking scores, quality scores, coverage scores, or route-breaking changes.
- Keep public/marginalia/ as a copied static app owned by ../Marginalia.

After Marginalia/homepage edits, run:
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
ASTRO_SITE=https://bearxiong2k.github.io ASTRO_BASE=/homepage npm run build
git diff --check

Latest known local smoke:
- Marginalia checks in ../Marginalia passed: npm run check, npm test, git diff --check.
- Homepage checks passed with the command sequence above.
- A production-style local mount confirmed /homepage/marginalia/ redirects to /homepage/marginalia/reader.html, registers service-worker.js at scope /homepage/marginalia/, and loads the bundled quick-start document with Save enabled.
- The only observed browser console error was a missing root favicon.ico request.

Report changed files, route/scope decisions, verification results, and any production smoke gaps.
```
