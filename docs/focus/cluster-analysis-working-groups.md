# Focus: Cluster Analysis and Working Groups

Status: active

Default-context policy: Do not read by default. Read when resuming cluster investigation, revising `src/data/clusters.json`, or changing the `/clusters/` route.

## Saved State

The cluster-analysis layer is a static, hand-authored research view over the existing corpus. Metadata is only a discovery seed; cluster claims must be argued from the actual paper notes, paper text when needed, official artifacts, and source-visible execution or file boundaries.

- Source data: `src/data/clusters.json`.
- Route: `src/pages/clusters/index.astro` at `/clusters/`.
- Current shape: 7 cluster hypotheses and 13 deeper investigation entries.
- Method direction: start from metadata to find candidate neighborhoods, then perform real cluster analysis by reading notes, papers, and official artifacts. A cluster is not ready because metadata fields line up; it is ready only when an analytical paragraph can explain what object the stack makes first-class and why the evidence supports that boundary.
- Display direction: prioritize analytical paragraphs and prose graphs that explain object flow, lineage or boundary, and artifact relationships. Treat each cluster as a small blog/article with a readable argument, not a card stack or dashboard entry. Avoid making the cluster layer feel like a deck of metadata cards with prose labels.
- Current display scaffold: each cluster has a draft `object_flow` field rendered on `/clusters/` with four consistent labels: Entry object, Binding/rewrite, Backend handoff, and Boundary. The `analysis` field is now the preferred public paragraph surface, and checked analysis paragraphs exist for the crossbar DNN toolchain, DRAM-PIM API/compiler, LLM memory-hierarchy, and full-stack IR/ISA boundary clusters. Treat the remaining object-flow text as a temporary scaffold for analysis, not as completion of the display direction.
- `/library/` and `/projects/cim-library/` link to `/clusters/`.
- Cluster data is separate from paper frontmatter so the public paper metadata contract stays descriptive.

## Methodology

1. Use metadata as a seed: Axis A/B placement, technologies, workloads, first-class objects, rewrite objects, artifact status, author/group fields, and note summaries suggest possible neighborhoods.
2. Read the substance before strengthening a cluster: inspect the corpus notes first, then the paper and official artifact/docs/code when the note does not establish the stack object, rewrite path, backend handoff, or lineage boundary.
3. Write an analysis paragraph, not a metadata digest: the public cluster text should state the shared first-class object, explain the transformation or handoff path, name the evidence base, and mark the boundary of the claim.
4. Keep subagent investigations scoped by cluster or cluster boundary: a subagent may be assigned one cluster, one comparison boundary, or one artifact lineage and should return checked claims, source paths/links, uncertainty, and candidate paragraph text.
5. Promote only evidence-backed conclusions into `src/data/clusters.json`; keep speculative links as next checks or uncertainty, not as cluster facts.
6. Render each cluster as an article: analysis first, object flow as a prose structure, object vocabularies as explanatory sentences rather than non-link tags, and working-group notes as coherent article subsections rather than collapsible data blocks.

## Current Cluster Hypotheses

1. Crossbar DNN compiler and simulator toolchain line.
2. Digital SRAM-CIM macro generation and precision specialization.
3. Analog CIM modeling, nonideality, and calibrated cost baselines.
4. UPMEM real-hardware runtime and benchmark layer.
5. PIMeval/PIMsynth DRAM-PIM API and bit-serial compiler line.
6. LLM-oriented PIM memory-hierarchy mapping and runtime-state modeling.
7. Full-stack IR, ISA, and serialized backend boundaries.

## Investigation Entries Started

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
- Preserve the cluster-as-article style: avoid reintroducing card-heavy layouts inside individual clusters unless a repeated reference list genuinely needs compact rows. Non-link object vocabularies should read as prose, not tag clouds; working-group analysis should appear inside the article body when it belongs to that cluster.
- Keep the display direction and the investigation work together: prose graphs and public paragraphs should improve only as the evidence for object flow, lineage or boundary, and artifact relationships improves.
- `object_flow` is currently structured public data exported through `scripts/export-atlas-manifest.mjs`, rendered on `/clusters/`, and validated by `docs/website-integration/schemas/atlas-manifest.schema.json`; keep those surfaces aligned if the field changes.
- `analysis` is also structured public data exported through the manifest and rendered before supporting metadata on `/clusters/`; add it only after note/paper/artifact analysis supports the paragraph.
- When revising each draft prose graph, preserve the four-step reading shape unless there is a deliberate style decision to replace it: entry object, binding/rewrite, backend handoff, and boundary.
- For each cluster batch, aim to replace metadata-shaped summaries with one or more analysis paragraphs grounded in notes/papers/artifacts. If the evidence is not yet checked, leave the paragraph as an investigation target rather than public polish.
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
- Browser smoke check for `/clusters/`: 7 clusters, 13 investigation entries, no horizontal overflow on desktop or mobile.
