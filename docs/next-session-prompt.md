# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

This is a static Astro CIM compiler/IR paper library inside a personal website shell. Read AGENTS.md first, then docs/future-development-plan.md, docs/archive/cluster-analysis-working-groups.md, docs/corpus-note-harness.md, and docs/metadata-template.md.

Current state:
- src/content/papers contains 62 schema-valid Markdown paper entries; no raw corpus notes remain.
- / is the concise merged personal homepage/profile page.
- /projects/ is the project index sourced from src/data/project-registry.json.
- /projects/cim-library/ is the narrative landing page for the CIM Library project.
- /library/ is the stable full atlas route and must remain available.
- /papers/[slug]/ renders individual long-form corpus notes and must remain stable.
- The website-shell iteration is largely done and archived at docs/archive/personal-website-integration-iteration.md.
- docs/website-integration/ now records the static registry/manifest contract; its installer/templates/session-report scaffolding has been removed.
- src/data/profile.json contains linked selected publications, including ASMA 2025, ACPEE 2024, Sensors 2024, PRAB 2022, and NIM-A 2022.
- The public metadata contract is descriptive. Do not add coverage scores, ranking scores, or trajectory_IR_relevance.
- Axis C/D normalization is render-time only through src/lib/axisNormalization.ts and src/data/taxonomy.json; do not weaken src/content.config.ts.
- /library/ atlas sizing has been tightened: Axis A/B uses a wider coordinate system, smaller node initials, and stacked B-row labels; Axis C/D uses a wider coordinate system with two-row staggered Axis C labels.
- /papers/[slug]/ note pages use a wider desktop reading column and single-column mobile behavior.

Current goal:
- Reactivate the cluster-analysis and academic-working-group investigation from docs/archive/cluster-analysis-working-groups.md.
- The likely output is a new static cluster page or project subpage, but decide the route before implementation.
- The working-group layer should be coarse and evidence-based: vague groups that produced clusters of works and occasional cross-group cooperation, not detailed affiliation or author-network maps.

Good next steps:
1. Re-read docs/archive/cluster-analysis-working-groups.md and turn it into a concrete first-pass plan.
2. Decide the route: /clusters/ or /projects/cim-library/clusters/.
3. Prototype one or two high-confidence clusters before generalizing.
4. Decide whether cluster metadata belongs in src/data/clusters.json, derived helpers, or annotations attached to project data.
5. Define cautious working-group fields: label, evidence, representative papers, uncertainty, related groups.
6. Link clusters back to scoped /library/ views instead of duplicating the atlas.
7. Run npm run qa, npm run validate, npm run export:atlas, npm run contract:website, npm run check, and npm run build after edits.

Report:
- cluster data/model decisions;
- route and UI changes;
- evidence limits or uncertain group labels;
- browser viewport checks if UI changed;
- qa/validate/export:atlas/contract:website/check/build results.
```
