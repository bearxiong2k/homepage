# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

Read AGENTS.md and docs/active-context.md first. Then use docs/README.md to choose task-specific context. Do not bulk-read archives, legacy docs, website-integration docs, or paper-note harnesses unless the task needs them.

Project status:
- Static Astro CIM compiler/IR paper library.
- 62 schema-valid paper entries.
- Stable routes: /, /projects/, /projects/cim-library/, /projects/cim-library/methodology/, /library/, /clusters/, /papers/, /papers/[slug]/.
- src/data/clusters.json is the hand-authored cluster/working-group source and stays separate from paper frontmatter.
- /clusters/ is a completed cluster and working-group route with a visible AI-assisted synthesis notice.

Active focus:
- Detail page content refinement.
- Focus doc: docs/focus/detail-page-content-refinement.md.
- Current goal: improve individual paper detail page content quality, source traceability, uncertainty handling, and per-paper reading usefulness.
- Current implementation: /papers/ lists notes and supports selected-note Markdown export; /papers/[slug]/ renders metadata, source links, axis placement, normalized Axis C/D labels, note outline, and the Markdown note body.
- Current metadata subtask: name normalization added `short_title` to all papers; continue publisher-link normalization from docs/focus/paper-metadata-maintenance.md if asked.
- Next priority: audit representative detail pages and decide which issues belong in paper Markdown notes versus the detail-page shell, unless the metadata normalization batch is resumed.

Paused focus:
- General style controller.
- Focus doc: docs/focus/style-controller.md.
- Resume by inventorying and replacing remaining repeated hard-coded presentation values only where their semantic role is clear.

Completed focus:
- Cluster analysis and working-group content.
- Focus doc: docs/focus/cluster-analysis-working-groups.md.
- Final shape at completion: 7 cluster hypotheses, 13 working-group investigation articles, 7 checked cluster analysis paragraphs.

Method:
- Keep the implementation static and inspectable.
- Keep academic/library routes quiet, readable, and dense enough for repeated research use.
- Do not add backend services, client-side styling dependencies, databases, PDF hosting, or route-breaking changes.
- Keep /library/ and /papers/[slug]/ stable.
- Do not add ranking, quality, coverage, or IR-relevance scores.
- Keep paper claims tied to primary paper/artifact evidence where possible.

For detail-page content refinement:
1. Read docs/focus/detail-page-content-refinement.md.
2. Audit representative /papers/[slug]/ pages.
3. Decide whether each issue belongs in paper Markdown content or the route shell.
4. Implement one coherent content/shell refinement batch.
5. Run verification.

After substantial edits, run:
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build

Report changed files, context decisions, evidence limits, and verification results.
```
