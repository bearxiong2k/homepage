---
slug: pim-tc
title: "Accelerating Triangle Counting with Real Processing-in-Memory Systems"
short_title: "PIM-TC"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "IPDPS Workshop on Graphs, Architectures, Programming, and Learning (GrAPL); also indexed as arXiv/CoRR abs/2505.04269"
authors_or_group: "Lorenzo Asquini, Manos Frouzakis, Juan Gómez-Luna, Mohammad Sadrosadati, Onur Mutlu, Francesco Silvestri"
summary: >-
  PIM-TC is a real-hardware graph-processing stack for triangle counting on UPMEM processing-in-memory DPUs. Its main contribution is a workload-specific host/DPU implementation that maps COO-format graph edges to PIM cores using vertex coloring, constructs host-to-DPU edge batches, optionally applies uniform and reservoir sampling for approximate counting, uses Misra-Gries summaries to handle high-degree vertices, and measures the result on a real UPMEM platform. For CIM compiler/IR research, the work is most useful as evidence for the backend/runtime boundary of a graph workload on commercial digital PIM: it names hardware resources, batching state, graph partition state, and per-DPU memory-resident samples, while the demonstrated reusable abstraction is closer to a specialized mapping/runtime protocol than to a general compiler dialect or instruction-level IR. ([arXiv](https://arxiv.org/pdf/2505.04269v2))
links:
  paper: https://arxiv.org/pdf/2505.04269v2
  artifact: https://github.com/CMU-SAFARI/PIM-TC
  docs:
  code:
technology:
  - "UPMEM"
  - "DRAM-PIM"
  - "digital-PIM"
  - "processing-near-memory"
workloads:
  - "triangle-counting"
  - "graph-processing"
  - "COO-edge-list graphs"
  - "dynamic graph updates"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A5, A3]
axis_B: [B2, B4, B7, B1]
axis_C_first_class_objects:
  - "DPU_or_PIM_core"
  - "MRAM_bank"
  - "WRAM_scratchpad"
  - "tasklet"
  - "CPU_DPU_transfer_batch"
  - "color_triplet"
  - "per_DPU_edge_sample"
  - "edge_region_index"
  - "Misra_Gries_high_degree_table"
  - "partial_triangle_count"
axis_D_rewrite_objects:
  - "graph_mapping"
  - "edge_partitioning"
  - "edge_duplication"
  - "memory_layout"
  - "vertex_relabeling"
  - "runtime_sampling_state"
  - "reduction_state"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/CMU-SAFARI/PIM-TC"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Strongest as a real-hardware UPMEM graph benchmark and mapping/runtime case study."
  - "The reusable boundary is clearest around COO input, color-triplet mapping, per-DPU samples, and host-DPU batching."
  - "Most CIM analog objects such as ADC/DAC precision, bit slicing, and reconstruction paths are not applicable to the demonstrated digital UPMEM stack."
takeaways: []
---

# PIM-TC — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 Programming / runtime / benchmark on real hardware**; secondary **A5 narrow end-to-end co-design** and **A3 mapping / scheduling** | The paper implements triangle counting on a real UPMEM system and evaluates it on 20 PIM-enabled DIMMs / 2560 DPUs; its main stack ownership is the graph-to-DPU runtime path rather than a reusable compiler IR. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR**, **B4 hardware-resource mapping**, **B7 runtime-state abstraction**, with **B1 config-as-IR** elements | The named middle objects are COO edges, color triplets, per-DPU edge batches, per-DPU samples `S`, region/index tables, Misra-Gries summaries, and CLI/Makefile parameters. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| First-class CIM objects, Axis C | DPU / PIM core, MRAM bank, WRAM scratchpad, tasklets, CPU↔DPU transfer batches, per-DPU edge sample, graph color triplet, high-degree-node remap table | UPMEM hardware hierarchy is explicit: each DPU has MRAM, IRAM, WRAM, and tasklets; host-to-DPU transfers and per-DPU samples are central to the algorithm. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Rewrite object, Axis D | **Graph mapping**, **memory layout**, **runtime state**, **vertex/edge relabeling**, **sampling state** | The tool transforms an input COO edge stream into color-compatible DPU batches, applies optional uniform/reservoir sampling, sorts/indexes per-DPU subgraphs, remaps selected high-degree nodes, and reduces partial counts. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Best corpus tags | `UPMEM`, `digital-PIM`, `DRAM-PIM`, `triangle-counting`, `graph-processing`, `real-hardware`, `runtime-mapping`, `COO-graphs`, `sampling`, `benchmark-candidate` | Tags reflect technology, workload, and the concrete stack boundary. |
| Closest comparison baselines | **TCIM / STT-MRAM triangle-counting accelerators**, **Bader/MapJIK CPU TC**, **cuGraph GPU TC**, **TRIEST / streaming sampling**, **UPMEM graph-processing workloads** | TCIM is closest by workload and PIM theme but uses simulated STT-MRAM graph slicing; MapJIK and cuGraph are experimental baselines; TRIEST-style sampling is a technical ingredient. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |

## 2. One-paragraph public summary

PIM-TC is a real-hardware graph-processing stack for triangle counting on UPMEM processing-in-memory DPUs. Its main contribution is a workload-specific host/DPU implementation that maps COO-format graph edges to PIM cores using vertex coloring, constructs host-to-DPU edge batches, optionally applies uniform and reservoir sampling for approximate counting, uses Misra-Gries summaries to handle high-degree vertices, and measures the result on a real UPMEM platform. For CIM compiler/IR research, the work is most useful as evidence for the backend/runtime boundary of a graph workload on commercial digital PIM: it names hardware resources, batching state, graph partition state, and per-DPU memory-resident samples, while the demonstrated reusable abstraction is closer to a specialized mapping/runtime protocol than to a general compiler dialect or instruction-level IR. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| First triangle-counting algorithm for UPMEM PIM | Abstract / Introduction contributions | Paper algorithm + real-hardware experiment + code artifact | The paper describes and evaluates a UPMEM implementation, and the repository exposes host and DPU C code. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Demonstrated for triangle counting over unweighted COO graph inputs on UPMEM DPUs; general graph analytics are not abstracted as a compiler framework. |
| Vertex coloring avoids cross-PIM-core communication | Section 3.1 / Figure 1 | Algorithm + mapping rule | Nodes are hashed into `C` colors; each DPU is assigned an ordered color triplet; edges are sent to compatible triplets so triangles can be counted locally. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | The mapping is specialized to triangle counting and to the color-triplet coverage/correction scheme. |
| Reservoir sampling handles limited DPU DRAM capacity | Sections 3.3 and 4.5 | Algorithm + equation + experiment | Each DPU keeps a sample `S` of at most `M` edges; later edges replace existing sample entries with probability `M/t`; per-DPU triangle counts are corrected by a combinatorial probability factor. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Evidence supports approximate triangle counting under bounded per-DPU memory; quality depends on graph structure, with V1r showing high error due to very few triangles. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Uniform host-level sampling reduces transfer and counting time | Sections 3.2 and 4.4 | Algorithm + experiment | Edges are retained with probability `p`; the estimated count divides by `p^3`; Table 3 reports relative error for multiple keep probabilities. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Demonstrated as an approximate mode over the paper’s graph set and `p ∈ {0.5, 0.25, 0.1, 0.01}`. |
| Misra-Gries improves high-degree-node cases | Sections 3.5 and 4.3 | Algorithm + sensitivity experiment | Host threads track frequent nodes with a dictionary of size `K`; the top `t` nodes are remapped to high IDs before DPU sorting/counting. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Best supported for graphs with high maximum degree; paper reports extra remapping cost and graph-dependent benefit. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| PIM-TC is compelling for dynamic COO graphs | Section 4.6 / Figure 7; dynamic branch README | Experiment + artifact branch | The paper simulates 10 updates of WikipediaEdit and compares cumulative time; the dynamic branch documents multiple update files and append/increasing graph formats. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Demonstrated through a WikipediaEdit update simulation; broader dynamic-graph workloads would need additional evidence. |

## 4. Stack anatomy

```text
Input / frontend:
COO / Matrix Market graph edge list, preprocessed by removing self-loops and duplicate undirected edges, shuffling, and adding a header.

Middle representation:
Color-annotated edge stream; per-DPU color triplet; per-host-thread arrays of edge batches; per-DPU sample S in MRAM; optional top-frequency node table.

Mapping or scheduling state:
Number of colors C; derived number of DPUs binomial(C + 2, 3); host thread count; DPU tasklet count; per-DPU batch sizes; sample-size bound M; uniform-sampling probability p; Misra-Gries K and t.

Hardware abstraction:
UPMEM host + DPU model: host CPU, DPUs/PIM cores, MRAM bank, WRAM scratchpad, IRAM, tasklets, CPU-DPU transfers.

Backend / simulator / codegen:
C host program plus UPMEM DPU C kernel compiled with the UPMEM SDK; no separate simulator path is presented as the primary backend.

Output artifact:
Triangle count estimate/exact count, timing breakdown for setup, sample creation, and triangle counting; optional dynamic update cumulative behavior.

Evaluation loop:
Parameter sweeps over C / DPU count, Misra-Gries K and t, uniform sampling probability p, reservoir sample size, and CPU/GPU comparisons.
```

The paper-level evaluation describes the input preprocessing, hardware setup, timing phases, and measurement protocol; the repository documents build prerequisites, CLI options, and reproduction commands. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the COO edge stream, the color hash and triplet assignment, host-side per-DPU edge batches, the DPU-resident sample `S`, the region index table inside each DPU, and optional Misra-Gries remapping metadata. The paper foregrounds triangle-counting algorithm design and real-system evaluation, while the reusable semantics are most visible in the batching contract between host memory and DPU MRAM plus the per-DPU sample/index state used by the DPU kernel. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 Programming / runtime / benchmark on real hardware.** PIM-TC is best classified as a real-hardware UPMEM implementation and benchmark-style workload stack. Its strongest owned slice is from a COO graph file through host-side partitioning and transfer to DPU-local counting and host reduction. The paper explicitly evaluates on a system with 20 PIM-enabled DIMMs, 2560 DPUs, 32 host threads, and 16 PIM threads per DPU. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

**Secondary: A5 narrow end-to-end co-design.** The work co-designs the algorithm around UPMEM constraints: no direct inter-DPU communication, bounded MRAM per DPU, CPU-mediated transfers, and tasklet/WRAM execution. The slice is narrow because the frontend, middle state, and backend are all specialized to triangle counting over COO graphs. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

**Secondary: A3 mapping / scheduling / DSE framework, limited to a fixed workload.** The mapping choices are concrete: color count determines DPU count, color triplets define edge placement, host threads create batches, and parameters `p`, `M`, `K`, and `t` select approximate or remapped execution modes. The artifact exposes these as compile-time and command-line controls. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.** The middle representation is a graph edge stream in COO / Matrix Market form plus graph-derived metadata: colors, compatible triplets, edge batches, samples, sorted edge order, and region indices. Decisions made here include edge placement, edge duplication, edge ordering, and high-degree-node remapping. A single upstream-readable graph IR is not packaged; the readable boundary is the input format plus the source-level data structures and CLI options. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

**B4 Hardware-resource IR.** The hardware-resource layer is expressed through DPU count, tasklet count, MRAM sample size, WRAM buffer size, host thread count, and CPU-DPU transfer batches. The artifact asks users to align `NR_DPUS` with `binomial(C + 2, 3)` and to configure tasklets, host threads, and WRAM buffer size before build. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))

**B7 Runtime-state abstraction.** Runtime state is central: per-host-thread batches, per-DPU samples, reservoir replacement state, Misra-Gries tables, partial per-tasklet counts, and host reduction. The dynamic branch makes this even clearer by taking a sequence of update files and comparing append-style processing against full cumulative reprocessing by CPU/GPU baselines. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-TC/main/host/app.c))

**B1 Config-as-IR.** The Makefile/CLI combination functions as a compact configuration boundary. It names the number of colors, DPUs, host threads, tasklets, sample size, keep probability, Misra-Gries dictionary size, remapped-node count, and random seed. It is inspectable by users, but it is a run configuration rather than a serialized compiler IR. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** for analog/SRAM crossbar taxonomy; **DPU + MRAM-bank hierarchy is first-class** | UPMEM is modeled as DPUs attached to MRAM banks with WRAM/IRAM. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Bit-slicing / bit significance | **Not applicable** | The workload is integer graph edge processing on digital DPUs, not bit-sliced analog CIM. |
| ADC/DAC precision or sensing | **Not applicable** | UPMEM DPUs are 32-bit in-order RISC-style digital cores. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Analog-to-digital or domain transition | **Not applicable** | The demonstrated path is host memory ↔ DPU MRAM/WRAM, not analog compute/sense conversion. |
| Peripheral circuits as path nodes | **Not applicable / implicit** | The paper abstracts UPMEM at DPU, MRAM, WRAM, transfer, and tasklet level. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Partial-sum accumulation path | **First-class as digital partial counts** | Per-tasklet and per-DPU triangle counts are summed by the host after DPU execution. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Reconstruction / shift-add tree | **Not applicable** | No bit-sliced reconstruction path is part of the demonstrated workload. |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for batching, samples, graph sparsity, update state** | Host threads create per-DPU edge batches; each DPU stores a sample `S`; the dynamic branch documents append/increasing update files. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Value trajectory / flow path | **Implicit / approximated** | The closest value path is edge → color assignment → DPU batch → MRAM sample → WRAM buffer → partial count → host reduction. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |

### 5.4 Axis D — rewrite object

The work rewrites **graph mapping**, **memory layout**, **runtime state**, and **vertex identifiers**. The concrete transformations are:

1. Hash-color vertices and assign each edge to one or more compatible color-triplet DPUs.
2. Duplicate edges across required DPU triplets and correct redundant all-same-color triangle counts.
3. Optionally discard host-level edges with probability `1 − p` and correct by `p^3`.
4. Optionally apply reservoir replacement inside each DPU sample `S` and correct by the sample-combination probability.
5. Sort each DPU-local subgraph, create edge-region indices, and count with a merge-like ordered-edge traversal.
6. Optionally remap high-degree vertices to new high IDs using Misra-Gries heavy-hitter summaries.

The legal exact transformations preserve graph triangle identity under color partitioning, edge ordering, and high-degree vertex relabeling; the approximate transformations preserve an estimator contract rather than exact edge coverage. The representation is especially well suited to expressing graph-edge placement, bounded DPU-local storage, and runtime batching. Expressing analog value-flow rewrites, instruction-selection alternatives, or numeric reconstruction would likely require an additional abstraction for value type, domain, and resource path.

## 6. Technical mechanism reading

### 6.1 Color-triplet graph mapping

PIM-TC uses a randomized vertex coloring scheme. Each vertex receives a color `0 … C−1`, using a hash of the form `h_C(u) = ((a · u + b) mod p) mod C`; each DPU is assigned an ordered color triplet corresponding to one possible triangle color configuration. An input edge is routed to compatible DPU triplets, so each DPU can count triangles locally over its assigned edge subset. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

This is the core mapping mechanism from a compiler perspective: the graph is not lowered into tensor ops or a general PIM ISA; it is lowered into **color-compatible per-DPU edge batches**. The number of colors also determines the number of DPU triplets, and the artifact exposes the required consistency between `C` and `NR_DPUS`. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))

### 6.2 Host-side batch creation and transfer contract

The host reads COO edges, builds arrays of edges per PIM core, and transfers batches to DPUs. Each host thread maintains its own per-DPU arrays, which reduces synchronization during batch creation; the DPU then stores received edges into MRAM or invokes reservoir sampling when the sample is full. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

For an IR-stack corpus, this is the clearest backend contract: the backend accepts an edge batch stream addressed by DPU ID / color triplet and stores it into DPU-local MRAM state.

### 6.3 Uniform sampling as frontend/runtime rewrite

Uniform sampling is applied while reading the input edge stream. Each edge is kept with probability `p`, and the returned triangle count is divided by `p^3` because a triangle survives only when all three of its edges survive. The paper reports error values across seven graphs for `p ∈ {0.5, 0.25, 0.1, 0.01}` and notes speedups up to 80× for `p = 0.01` in favorable graph cases. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

The important compiler-style point is that this is a **semantics-changing approximate rewrite** with an explicit estimator boundary. A future IR could type this as an approximate graph-edge thinning pass with an attached estimator correction.

### 6.4 Reservoir sampling as DPU-local memory rewrite

Reservoir sampling is invoked at the PIM-core level when a DPU cannot store all assigned edges. If the sample limit is `M`, the first `M` edges are inserted deterministically; for the `t`-th later edge, replacement happens with probability `M/t`. The paper corrects per-DPU counts by dividing by the probability that all three triangle edges remain in the sample. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

This mechanism is a compact example of a runtime memory-bound rewrite: edge identity is partially randomized, the DPU-local sample size becomes a resource constraint, and the result is tied to estimator metadata.

### 6.5 DPU-local layout, index construction, and triangle counting

Inside each DPU, PIM-TC sorts the sample `S` by edge endpoint order, builds a region table keyed by the first node, and uses scratchpad buffers plus binary search / merge-like traversal to count triangles. Figure 2 in the paper shows the DPU-local subgraph sample and region table. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

This is the closest thing to a local schedule: MRAM holds the edge sample and index, WRAM holds edge buffers, tasklets scan partitions, and partial tasklet counts are reduced into a per-DPU count before host reduction. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

### 6.6 Misra-Gries high-degree-node handling

The high-degree-node optimization uses Misra-Gries summaries on host-side edge streams. Each host thread tracks frequent nodes with dictionary size `K`; after stream processing, the top `t` frequent nodes are sent to DPUs, where edges involving those nodes are remapped to new high IDs before sorting. The purpose is to reduce expensive neighbor matching for very high-degree first nodes. ([arXiv](https://arxiv.org/pdf/2505.04269v2))

This mechanism is particularly relevant to IR design because it is a **legality-preserving vertex relabeling** driven by runtime graph statistics. It would fit naturally as a graph-layout rewrite carrying a proof obligation: triangle identity must be preserved under ID remapping.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The color triplet is the de facto mapping type

- **Observation:** The central mapping object is not a generic graph partition but a color triplet assigned to a DPU. Every edge is routed by checking compatibility with these triplets.
- **Why it matters for CIM compiler/IR work:** This suggests an IR object like `edge_partition(color_pair → dpu_triplets)` could make communication avoidance auditable.
- **Reusable lesson:** A graph-PIM IR could expose color assignments, duplication count, and correction rules as first-class mapping metadata.

### Insight 2 — The per-DPU sample `S` is a useful runtime-storage abstraction

- **Observation:** The paper names the per-DPU sample `S`, stores it in MRAM, optionally bounds it by `M`, sorts it, indexes it, and counts over it. ([arXiv](https://arxiv.org/pdf/2505.04269v2))
- **Why it matters for CIM compiler/IR work:** `S` behaves like a memory-resident IR object with resource limits and estimator metadata.
- **Reusable lesson:** Future CIM graph stacks could represent bounded local memory objects with provenance: source edges, sampling policy, placement, and correction factor.

### Insight 3 — Approximate execution is split across host and DPU levels

- **Observation:** Uniform sampling occurs on the host before transfer; reservoir sampling occurs in each DPU after placement.
- **Why it matters for CIM compiler/IR work:** The same semantic goal—approximate triangle counting—is realized at two different stack levels with different cost and accuracy implications.
- **Reusable lesson:** An IR should distinguish approximation before placement from approximation after placement, because each affects data transfer, local memory pressure, and estimator scope differently.

### Insight 4 — Misra-Gries turns runtime statistics into a graph-layout rewrite

- **Observation:** Heavy-hitter detection happens during host stream processing; the resulting top-node list changes vertex IDs inside DPUs before sort/count.
- **Why it matters for CIM compiler/IR work:** This is a concrete example of a runtime-observed graph property driving a legal rewrite.
- **Reusable lesson:** A static-plus-runtime IR could attach “observed frequency summary” metadata to graph streams and lower it into a vertex relabeling pass.

### Insight 5 — The artifact’s CLI and Makefile form the visible integration boundary

- **Observation:** Build-time parameters (`NR_TASKLETS`, `NR_DPUS`, `NR_THREADS`, `WRAM_BUFFER_SIZE`) and run-time flags (`-c`, `-p`, `-M`, `-k`, `-t`, `-s`, `-f`) expose most user-controllable decisions. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))
- **Why it matters for CIM compiler/IR work:** These fields are the practical knobs a compiler adapter would need to synthesize.
- **Reusable lesson:** A wrapper compiler could emit PIM-TC configurations and input files before attempting deeper source-level integration.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** GitHub repository `CMU-SAFARI/PIM-TC`; the paper also states that source code is available at this repository. ([arXiv](https://arxiv.org/pdf/2505.04269v2))  
- **License:** MIT license, according to the repository page and README. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC))  
- **Last checked:** 2026-05-15.  
- **What it contains:** Host C code, DPU C code, common headers, Makefile, README, and an image directory; the README documents UPMEM SDK requirements, build command, CLI flags, preprocessing guidance, dataset sources, and experiment commands. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC))  
- **Dynamic-graph artifact:** A `dynamic-graph-TC` branch documents multi-update input files and the dynamic WikipediaEdit evaluation workflow. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/tree/dynamic-graph-TC))  
- **What the artifact appears to omit:** Packaged datasets, full preprocessed graph files, paper result logs, release packages, and figure-generation scripts were not evident in the checked repository pages; the GitHub releases page reports no releases. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/releases))  
- **Minimal documented workflow:** Install/activate UPMEM SDK v2024.1.0, run `make`, then run `./app -c <nr_colors> -f <path_to_graph_file> [OPTIONS]`; examples include exact counting, uniform sampling, and Misra-Gries-enabled runs. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))  
- **Whether paper figures appear reproducible from artifact:** Partially. The README provides experiment settings, dataset sources, preprocessing steps, parameter sweeps, and baseline commands, but figure plotting scripts and raw measured results were not found in the checked pages. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md))  

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Yes** | COO / Matrix Market input and preprocessing steps are documented. ([GitHub](https://github.com/CMU-SAFARI/PIM-TC/blob/main/README.md)) |
| Intermediate representation serialized | **Partial** | Input graph files are serialized; color assignments, batches, samples, and indices are runtime/source-level state rather than a standalone IR file. |
| Mapping decisions inspectable | **Partial** | `C`, DPU count, color triplets, and code are inspectable; per-run edge-to-DPU mapping is not presented as a separate trace. |
| Schedule inspectable | **Partial** | Tasklet count, host threads, and source code expose scheduling structure; no separate schedule file. |
| Hardware config explicit | **Yes** | Paper and README name DPU/MRAM/WRAM/tasklet resources and evaluation hardware. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Precision / bit-slice assumptions explicit | **N/A** | Digital graph processing on UPMEM DPUs, not bit-sliced analog CIM. |
| Cost model inspectable | **Partial** | No full analytical cost model; timing is decomposed into setup, sample creation, and triangle counting phases. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |
| Simulator backend documented | **N/A** | Primary backend is real UPMEM hardware, not a simulator. |
| Generated code / instruction stream inspectable | **Partial** | Host and DPU C sources are inspectable; generated DPU binary / instruction stream is not separately documented. |
| Provenance from source op to backend action | **Partial** | Edge routing rules are clear; per-edge runtime provenance is not serialized. |
| Reproduction scripts available | **Partial** | Commands and a preprocessing function are documented; packaged scripts/results were not found in the checked pages. |
| Calibration source documented | **Yes / real-system** | Measurements are on real UPMEM hardware with CPU/GPU baseline systems described. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) |

### 8.3 Integration helper

- **As frontend:** The COO / Matrix Market parser and preprocessing assumptions can be reused as a graph-workload frontend, especially for dynamic edge-list workloads.
- **As IR inspiration:** The most useful abstractions are color triplets, edge-to-DPU compatibility, per-DPU sample `S`, region index tables, sampling correction metadata, and high-degree-node remap tables.
- **As mapper/scheduler:** The color-based partitioner and DPU batch builder are the clearest reusable mapper components.
- **As cost model:** The timing decomposition into setup, sample creation, and triangle count phases could become a backend measurement model; the sampling equations could become estimator plugins.
- **As backend:** The host/DPU code can be wrapped as a UPMEM backend for triangle counting, with compiler-generated CLI/Makefile settings and input files.
- **As benchmark:** Strong benchmark candidate for real-hardware digital PIM graph processing, especially COO triangle counting and dynamic append-style graphs.
- **As validation source:** Real-system measurements on UPMEM hardware can calibrate graph-PIM transfer and DPU-local compute models.

**Integration effort estimate: High.** Integration into a general CIM compiler/IR stack would require adapters for graph import, mapping-state extraction, configuration generation, and result/provenance capture. The most direct path is to wrap the repository as a backend benchmark, then gradually expose color-triplet mapping, per-DPU samples, and high-degree remapping as serializable IR objects.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **TCIM / STT-MRAM triangle-counting accelerators** | Triangle counting on PIM-style memory systems | TCIM-style work uses simulated STT-MRAM arrays and graph slicing/compression; PIM-TC emphasizes standard COO input and real UPMEM hardware. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Distinguish simulated in-memory accelerator mapping from commercial PIM runtime mapping. |
| **TRIEST / streaming triangle-count sampling** | Approximate triangle counting with sampling | PIM-TC reuses reservoir-style sampling as a DPU-local memory-capacity mechanism, not only as a streaming graph algorithm. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Sampling can be an IR-level memory-capacity rewrite, not merely an algorithmic approximation. |
| **Bader / MapJIK CPU triangle counting** | CPU baseline for triangle counting | Used as a state-of-the-art CPU baseline; CPU path internally benefits from CSR conversion, which is excluded from static comparison timing. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Baseline fairness depends on whether input-format conversion is inside or outside the measured stack. |
| **cuGraph triangle counting** | GPU baseline over COO-derived graphs | GPU consistently outperforms PIM-TC in static graph comparisons, while dynamic COO append behavior changes the measured stack boundary. ([arXiv](https://arxiv.org/pdf/2505.04269v2)) | Corpus entries should separate kernel performance from data-format/update handling. |
| **Other UPMEM graph / sparse workloads** | Real PIM backend, host-DPU transfers, tasklets, MRAM/WRAM hierarchy | PIM-TC is graph-operator-specific rather than a reusable UPMEM compiler layer. | Useful as a backend contract example for graph analytics, especially where runtime state dominates. |

## 10. Corpus-ready final takeaway

- PIM-TC’s real contribution is a hand-engineered triangle-counting implementation for UPMEM DPUs, with graph-aware host partitioning, DPU-local storage, and real-hardware evaluation.
- The strongest reusable stack layer is the **graph-to-DPU mapping/runtime boundary**: COO edge stream, color triplets, per-DPU batches, MRAM samples, WRAM buffers, and host reduction.
- The evidenced scope is triangle counting on unweighted COO graphs, with exact and approximate modes evaluated on real UPMEM hardware and CPU/GPU baselines.
- The paper makes DPU resources, MRAM/WRAM storage, tasklets, host-DPU transfer batches, samples, and high-degree remap state first-class enough to guide backend integration.
- The hidden IR is distributed across CLI/Makefile configuration, host batch-building code, DPU sample/index state, and estimator correction rules.
- Artifact status: public artifact found; MIT-licensed source is available, with main and dynamic-graph branches, but packaged datasets, releases, raw logs, and figure-generation scripts were not found in the checked pages.
- Integration is most direct as a UPMEM graph benchmark/backend wrapper; broader compiler reuse would benefit from serializing the mapping and runtime state.
- For value-trajectory IR work, PIM-TC is most relevant as a digital graph-state trajectory example rather than an analog numeric-flow example.
