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
- /clusters/ is the first-pass static cluster and coarse working-group route.
- /papers/[slug]/ renders individual long-form corpus notes and must remain stable.
- src/data/clusters.json is the hand-authored cluster source. Keep it separate from paper frontmatter unless the public metadata contract changes.
- The website-shell iteration is largely done and archived at docs/archive/personal-website-integration-iteration.md.
- docs/website-integration/ now records the static registry/manifest contract; its installer/templates/session-report scaffolding has been removed.
- src/data/profile.json contains linked selected publications, including ASMA 2025, ACPEE 2024, Sensors 2024, PRAB 2022, and NIM-A 2022.
- The public metadata contract is descriptive. Do not add coverage scores, ranking scores, or trajectory_IR_relevance.
- Axis C/D normalization is render-time only through src/lib/axisNormalization.ts and src/data/taxonomy.json; do not weaken src/content.config.ts.
- /library/ atlas sizing has been tightened: Axis A/B uses a wider coordinate system, smaller node initials, and stacked B-row labels; Axis C/D uses a wider coordinate system with two-row staggered Axis C labels.
- /papers/[slug]/ note pages use a wider desktop reading column and single-column mobile behavior.

Current cluster-layer state:
- The cluster-analysis and academic-working-group investigation from docs/archive/cluster-analysis-working-groups.md has a first implementation.
- Route decision: use /clusters/ as a sibling research view to /library/, not a nested project prose page.
- The page renders hand-authored clusters with binding theme, representative/supporting papers, shared objects, shared rewrite objects, evidence, uncertainty, coarse working-group notes, and scoped /library/ links.
- /projects/cim-library/ and /library/ link to the cluster route.
- Current clusters: crossbar DNN compiler/simulator toolchain line; digital SRAM-CIM macro generation; analog CIM modeling/nonideality baselines; UPMEM real-hardware runtime; PIMeval/PIMsynth DRAM-PIM API and bit-serial compiler line; LLM-oriented PIM memory-hierarchy mapping and runtime-state modeling; full-stack IR/ISA boundaries.
- The PIMeval/PIMsynth cluster is intentionally narrow. HARMONI was moved into the LLM memory-hierarchy cluster because its binding object is a Transformer DFG plus tensor placement/hierarchy mapping, not the PIM API or bit-serial compiler boundary.
- The `/clusters/` page renders related-cluster links. Keep it as a single static page unless a cluster accumulates enough checked evidence to justify a detail page.
- Working-group investigation notes have started for eight coarse groups or comparison sets: Xiaoming Chen / Yinhe Han crossbar-PIM compiler-simulator artifacts; HKUST / digital-CIM macro compiler and physical-backend artifacts; NeuroSim-centered analog CIM modeling artifacts; SAFARI / UPMEM real-hardware runtime and benchmark artifacts; UVA LavaLab PIMeval-to-PIMsynth API/compiler artifacts; HARMONI as the public LLM memory-hierarchy modeling anchor; LLM serving and near-memory runtime-state comparison; and public full-stack artifact boundary comparison.
- These investigation notes are intentionally deeper than the one-paragraph working-group summaries, but still avoid affiliation graphs and author-network mapping. The LLM-serving and full-stack-boundary cards are comparison sets, not lineage claims.

Good next steps:
1. Continue adding in-depth investigation notes cluster-by-cluster, prioritizing groups where official artifacts expose file formats, execution flows, or generated outputs.
2. Strengthen medium-confidence clusters by checking representative official artifacts and paper notes.
3. Keep the single /clusters/ page unless a cluster has enough additional checked evidence to justify a detail page.
4. Keep the working-group layer coarse; do not introduce an affiliation graph or detailed author-network map.
5. Keep cluster links scoped back to /library/ rather than duplicating atlas behavior.
6. Run npm run qa, npm run validate, npm run export:atlas, npm run contract:website, npm run check, and npm run build after edits.

Report:
- cluster data/model decisions;
- route and UI changes;
- evidence limits or uncertain group labels;
- browser viewport checks if UI changed;
- qa/validate/export:atlas/contract:website/check/build results.
```
