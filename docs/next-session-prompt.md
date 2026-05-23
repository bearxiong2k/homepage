# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

Read AGENTS.md and docs/active-context.md first. Then use docs/README.md to choose any task-specific context. Do not bulk-read archives, paper-note harnesses, website-integration notes, or legacy docs unless the task needs them.

Current default state:
- Static Astro CIM compiler/IR paper library inside a personal website shell.
- 62 schema-valid paper entries; no raw corpus notes remain.
- Stable routes: /, /projects/, /projects/cim-library/, /library/, /clusters/, /papers/[slug]/.
- /library/ and /papers/[slug]/ must remain stable.
- src/data/clusters.json is the hand-authored cluster source, separate from paper frontmatter.
- /clusters/ is the active cluster and coarse working-group route.
- The cluster layer currently has 7 cluster hypotheses and 9 deeper investigation cards.
- Working-group labels must remain coarse and evidence-based; LLM-serving and full-stack-boundary cards are comparison sets, not lineage claims.
- Do not add coverage scores, ranking scores, quality scores, or trajectory_IR_relevance.

Good next steps depend on the requested focus:
- Cluster work: continue evidence checking and add/update investigation notes in src/data/clusters.json.
- Paper work: read docs/corpus-note-harness.md and docs/metadata-template.md only then.
- Website work: read docs/website-integration/README.md only then.
- Docs work: read docs/iteration-docs-playbook.md and docs/archive/README.md.

After substantial edits, run:
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build

Report changed files, context/docs decisions, evidence limits, and verification results.
```
