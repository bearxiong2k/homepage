# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

Read AGENTS.md and docs/active-context.md first. Then use docs/README.md to choose any task-specific context. Do not bulk-read archives, paper-note harnesses, website-integration notes, or legacy docs unless the task needs them.

Current default state:
- Static Astro CIM compiler/IR paper library inside a personal website shell.
- 62 schema-valid paper entries; no raw corpus notes remain.
- Stable routes: /, /projects/, /projects/cim-library/, /library/, /clusters/, /papers/, /papers/[slug]/.
- /library/, /papers/, and /papers/[slug]/ must remain stable.
- src/data/clusters.json is the hand-authored cluster source, separate from paper frontmatter.
- /clusters/ is the current cluster and coarse working-group route.
- Active focus doc: docs/focus/cluster-analysis-working-groups.md.
- The manifest/visualization refinement focus is completed and archived at docs/archive/2026-05-manifest-visualization-refinement-iteration.md.
- Manifest schema is currently 0.2.0 with route inventory, public view descriptors, and compact cluster-layer stats, including the /papers/ note-index route.
- npm run contract:website validates public/cim-library.manifest.json against docs/website-integration/schemas/atlas-manifest.schema.json before bespoke route/count checks.
- CIM Library local navigator is implemented in src/components/CimLibraryNav.astro and stays aligned with the global navigator while remaining lower hierarchy. Its Notes item points to /papers/ and is active for both /papers/ and /papers/[slug]/.
- /projects/cim-library/ now explains the central corpus question, static public surfaces, and corpus-shape summaries.
- /library/ uses the same top spacing as the other CIM Library pages, a left in-page section sidebar, and a compact selected-paper reading bridge; detailed source/frontmatter metadata stays on /papers/[slug]/.
- /clusters/ is focus-first: the top cluster map names each binding object and links to detail/atlas slices; long evidence, working-group, and investigation material is grouped inside each cluster section.
- Cluster methodology/display direction is the active long-term focus: metadata seeds candidate clusters, but real cluster claims must come from paper-note, paper, and artifact analysis. Public cluster content should read like small blog/article entries with analytical paragraphs and prose graphs explaining object flow, lineage or boundary, and artifact relationships, not prose descriptions of metadata clustering, non-link tag clouds, folded data blocks, or card-style dashboards. Current object_flow fields are a draft four-step scaffold in src/data/clusters.json, rendered on /clusters/, exported in public/cim-library.manifest.json, and validated by the manifest schema; keep those surfaces aligned when revising them. The `analysis` field is the preferred public paragraph surface and currently exists for the crossbar DNN toolchain, DRAM-PIM API/compiler, LLM memory-hierarchy, and full-stack IR/ISA boundary clusters.
- Subagents may be scoped by cluster, boundary question, or artifact lineage for focused investigation; expected output is checked claims, source links/paths, uncertainty, and candidate analytical prose.
- Working-group labels must remain coarse and evidence-based; LLM-serving and full-stack-boundary groupings are comparison sets, not lineage claims.
- Do not add coverage scores, ranking scores, quality scores, or trajectory_IR_relevance.

Session scope:
- Prefer one coherent batch over a tiny single edit when the user says to proceed.
- For cluster work, first read docs/focus/cluster-analysis-working-groups.md; a reasonable batch can include 2-4 related investigation updates, the necessary source checks, data edits, docs count/status updates, and route smoke checks.
- For website/docs/paper work, use docs/README.md to select only the relevant task-specific docs.
- Stop early only when evidence is missing, a claim would become too speculative, or the next step needs a new product/research decision.

Good next steps depend on the requested focus:
- Cluster work: resume from docs/focus/cluster-analysis-working-groups.md before editing src/data/clusters.json; keep display-style changes tied to evidence improvements and preserve the cluster-as-article style over metadata-card polish.
- Paper work: read docs/corpus-note-harness.md and docs/metadata-template.md only then.
- Website work: read docs/website-integration/README.md only then.
- Docs work: read docs/iteration-docs-playbook.md and docs/focus/README.md.
- Historical manifest/visualization rationale: read docs/archive/2026-05-manifest-visualization-refinement-iteration.md only if needed.

After substantial edits, run:
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build

Report changed files, context/docs decisions, evidence limits, and verification results.
```
