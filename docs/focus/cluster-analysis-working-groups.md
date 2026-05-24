# Focus: Cluster Analysis and Working Groups

Status: paused / retrievable

Default-context policy: Do not read by default. Read when resuming cluster investigation, revising `src/data/clusters.json`, or changing the `/clusters/` route.

## Saved State

The cluster-analysis layer is a static, hand-authored research view over the existing corpus.

- Source data: `src/data/clusters.json`.
- Route: `src/pages/clusters/index.astro` at `/clusters/`.
- Current shape: 7 cluster hypotheses and 13 deeper investigation cards.
- Display direction: prefer insightful text graphs or prose graphs that explain object flow, lineage/boundary, and evidence relationships. Avoid scattering cluster meaning across many fancy cards with thin content.
- `/library/` and `/projects/cim-library/` link to `/clusters/`.
- Cluster data is separate from paper frontmatter so the public paper metadata contract stays descriptive.

## Current Cluster Hypotheses

1. Crossbar DNN compiler and simulator toolchain line.
2. Digital SRAM-CIM macro generation and precision specialization.
3. Analog CIM modeling, nonideality, and calibrated cost baselines.
4. UPMEM real-hardware runtime and benchmark layer.
5. PIMeval/PIMsynth DRAM-PIM API and bit-serial compiler line.
6. LLM-oriented PIM memory-hierarchy mapping and runtime-state modeling.
7. Full-stack IR, ISA, and serialized backend boundaries.

## Investigation Cards Started

- Xiaoming Chen / Yinhe Han crossbar-PIM compiler/simulator toolchain artifacts.
- HKUST / digital-CIM macro compiler and physical-backend artifacts.
- OpenACM / approximate-DCIM optimization boundary.
- NeuroSim-centered analog CIM modeling artifacts.
- CiMLoop as a Timeloop/Accelergy CIM modeling extension.
- GENIEx/NAX nonideality-aware co-design thread.
- SAFARI / UPMEM real-hardware runtime and benchmark artifacts.
- UVA LavaLab PIMeval-to-PIMsynth API/compiler artifacts.
- HARMONI as the public LLM memory-hierarchy modeling anchor.
- LLM serving and near-memory runtime-state comparison set.
- CIMFlow/OpenCIMTC serialized compiler-contract comparison.
- PUMA/CIM-MLC hidden graph-to-backend state comparison.
- Public full-stack artifact boundary comparison set.

## Resume Guidance

- Continue evidence checking and add/update investigation notes in `src/data/clusters.json`.
- Treat future cluster content as co-development with the manifest/visualization layer: when adding per-cluster text-graph fields or summaries, update `scripts/export-atlas-manifest.mjs`, `docs/website-integration/schemas/atlas-manifest.schema.json`, and `/clusters/` together.
- For each cluster, aim for a readable text graph that names the stack object, its transformations or handoff path, the evidence papers/artifacts, and the uncertainty boundary.
- A reasonable session batch can cover 2-4 related investigation updates plus source checks, docs count/status updates, and route smoke checks.
- Keep group labels coarse and evidence-based.
- Mark comparison sets explicitly where evidence does not support lineage.
- Do not introduce coverage scores, ranking scores, quality scores, or `trajectory_IR_relevance`.
- Do not build a fine-grained collaboration graph unless explicitly requested.
- Keep `/library/` and `/papers/[slug]/` stable.

## Latest Good Verification

- `npm run qa`
- `npm run validate`
- `npm run export:atlas`
- `npm run contract:website`
- `npm run check`
- `npm run build`
- Browser smoke check for `/clusters/`: 7 clusters, 13 investigation cards, no horizontal overflow on desktop or mobile.
