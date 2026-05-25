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
- General style controller.
- Focus doc: docs/focus/style-controller.md.
- Current goal: construct a general style controller for colors, formatting, fonts, spacing, and shared presentation policy across the static Astro website.
- Current implementation: src/styles/global.css contains the first controller slice, using CSS custom properties and compatibility aliases for existing variables. Ordinary content links are underlined by default, with navigation/control exceptions.
- Next priority: inventory and replace remaining repeated hard-coded style values where their semantic role is clear.

Completed focus:
- Cluster analysis and working-group content.
- Focus doc: docs/focus/cluster-analysis-working-groups.md.
- Final shape at completion: 7 cluster hypotheses, 13 working-group investigation articles, 7 checked cluster analysis paragraphs.

Method:
- Keep the implementation static and inspectable.
- Prefer a small token/controller layer over broad redesign.
- Keep academic/library routes quiet, readable, and dense enough for repeated research use.
- Do not add backend services, client-side styling dependencies, databases, PDF hosting, or route-breaking changes.
- Keep /library/ and /papers/[slug]/ stable.

For style-controller work:
1. Read docs/focus/style-controller.md.
2. Inventory existing style tokens, duplicated colors, font sizes, spacing scales, and route-specific CSS patterns.
3. Propose and implement one coherent controller slice.
4. Verify representative public routes.
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
