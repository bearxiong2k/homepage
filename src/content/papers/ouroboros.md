---
slug: ouroboros
title: "Ouroboros: Wafer-Scale SRAM CIM with Token-Grained Pipelining for Large Language Model Inference"
short_title: "Ouroboros"
subtitle: "Scoped CIM stack note"
year: 2026
publication:
  venue: "ASPLOS 2026"
  type: "conference"
  doi: "10.48550/arXiv.2603.02737"
  url: "https://doi.org/10.48550/arXiv.2603.02737"
authors:
  - "Yiqi Liu"
  - "Yudong Pan"
  - "Mengdi Wang"
  - "Shixin Zhao"
  - "Haonan Zhu"
  - "Yinhe Han"
  - "Lei Zhang"
  - "Ying Wang"
bibtex: |
  @inproceedings{liu2026ouroboros,
    author = {Liu, Yiqi and Pan, Yudong and Wang, Mengdi and Zhao, Shixin and Zhu, Haonan and Han, Yinhe and Zhang, Lei and Wang, Ying},
    title = {Ouroboros: Wafer-Scale SRAM CIM with Token-Grained Pipelining for Large Language Model Inference},
    booktitle = {ASPLOS 2026},
    year = {2026},
    doi = {10.48550/arXiv.2603.02737},
    eprint = {2603.02737},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2603.02737}
  }
citation_source: https://arxiv.org/abs/2603.02737
summary: >-
  **Ouroboros** is best classified as a narrow end-to-end hardware–software co-design for wafer-scale **digital SRAM compute-in-memory** LLM inference. The paper’s central stack contribution is not a general CIM compiler IR, but a coherent target-specific execution stack: token-grained pipelining for causal decoder inference, communication- and fault-aware layer-to-core mapping, H-tree-aware intra-core placement, distributed dynamic KV-cache management, and a simulator-backed evaluation loop. Its demonstrated setting is LLM inference over a proposed 54 GB SRAM-CIM wafer-scale architecture, evaluated with decoder-only models such as LLaMA/Baichuan/Qwen and encoder-containing models such as T5/BERT. For CIM compiler/IR research, Ouroboros is valuable because it exposes a rich “hidden IR” made from mapping variables, pipeline stages, KV runtime tables, hardware-resource coordinates, and simulator parameters, even though those interfaces are paper-internal rather than released as a reusable dialect or instruction stream. ([arXiv](https://arxiv.org/html/2603.02737v1))
links:
  paper: https://arxiv.org/abs/2603.02737
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
  - "wafer-scale"
  - "all-SRAM"
workloads:
  - "LLaMA-13B"
  - "LLaMA-32B"
  - "LLaMA-65B"
  - "Baichuan-13B"
  - "Qwen-32B"
  - "T5-11B"
  - "BERT-large"
  - "WikiText-2"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A3, A2]
axis_B: [B4, B7, B1]
axis_C_first_class_objects:
  - "wafer_die_core_hierarchy"
  - "SRAM_CIM_crossbar"
  - "H_tree_reduction_path"
  - "mesh_NoC_coordinates"
  - "token_pipeline_stage"
  - "KV_page_table"
  - "KV_bitmap"
  - "logical_KV_block"
  - "row_column_valid_registers"
  - "partial_sum_accumulation_path"
  - "fault_map_and_replacement_chain"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "array_binding"
  - "token_pipeline_schedule"
  - "runtime_KV_state"
  - "fault_remap_state"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown for artifact; paper is CC BY 4.0"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation_partial"
reproducibility_level: low
notes:
  - "Strongest reusable boundary is mapping/runtime state rather than a released compiler API."
  - "Digital SRAM-CIM target makes ADC/DAC trajectory objects largely not applicable, but bit-level accumulation and shift-add paths are relevant."
  - "KV-cache management is unusually explicit and useful as a runtime-state abstraction for future CIM IR work."
takeaways: []
---

# Ouroboros — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 Narrow end-to-end co-design** | Ouroboros proposes a vertically integrated wafer-scale digital SRAM-CIM architecture plus an end-to-end LLM inference framework, rather than a reusable compiler stack with a public IR boundary. The stack flow covers pipeline partitioning, mapping, KV-cache management, scheduling, control, and simulation. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Secondary stack role, Axis A | **A3 Mapping / scheduling / DSE**, **A2 Simulator & cost model** | The strongest reusable mechanisms are MIQP/DP mapping, token-grained scheduling, KV-cache placement, and an E2E simulator calibrated with CACTI, RTL synthesis, MNSIM 2.0, BookSim2, and yield modeling. ([arXiv](https://arxiv.org/pdf/2603.02737)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR**, **B7 Runtime-state abstraction**, **B1 Config-as-IR** | The effective middle state is a hardware-resource mapping over wafer/die/core/crossbar resources plus runtime KV-cache tables and simulator parameters. A single serialized IR is not evidenced in public sources. |
| First-class CIM objects, Axis C | Wafer/die/core hierarchy, SRAM-CIM crossbar, H-tree, core mesh, logical KV blocks, row/column masks, page table, bitmap, row/column-valid registers, SFU, partial-sum/reduction path | These are named directly in the architecture, mapping, and KV-management sections. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Rewrite object, Axis D | **Hardware mapping**, **array binding**, **pipeline schedule**, **runtime KV state**, **fault-remap state** | The work rewrites transformer execution into a 6N-stage token pipeline, maps tiled layers to CIM cores, maps weights to H-tree leaves, distributes KV heads/sequences over cores, and remaps around failed cores. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Best corpus tags | `wafer-scale`, `SRAM-CIM`, `digital-CIM`, `LLM-inference`, `token-pipeline`, `KV-cache`, `compiler-mapping`, `runtime-state`, `simulator`, `fault-tolerance` | Tags reflect demonstrated stack objects rather than memory technology alone. |
| Closest comparison baselines | AttAcc, WaferLLM / Cerebras WSE-2, CIM-MLC, CMSwitch / Be CIM or Be Memory, TranCIM / MulTCIM | AttAcc and WaferLLM are direct evaluation baselines or related systems; CIM-MLC and CMSwitch are closer compiler/IR-style CIM stacks; TranCIM/MulTCIM are nearby digital-CIM transformer accelerators. ([arXiv](https://arxiv.org/pdf/2603.02737)) |

## 2. One-paragraph public summary

**Ouroboros** is best classified as a narrow end-to-end hardware–software co-design for wafer-scale **digital SRAM compute-in-memory** LLM inference. The paper’s central stack contribution is not a general CIM compiler IR, but a coherent target-specific execution stack: token-grained pipelining for causal decoder inference, communication- and fault-aware layer-to-core mapping, H-tree-aware intra-core placement, distributed dynamic KV-cache management, and a simulator-backed evaluation loop. Its demonstrated setting is LLM inference over a proposed 54 GB SRAM-CIM wafer-scale architecture, evaluated with decoder-only models such as LLaMA/Baichuan/Qwen and encoder-containing models such as T5/BERT. For CIM compiler/IR research, Ouroboros is valuable because it exposes a rich “hidden IR” made from mapping variables, pipeline stages, KV runtime tables, hardware-resource coordinates, and simulator parameters, even though those interfaces are paper-internal rather than released as a reusable dialect or instruction stream. ([arXiv](https://arxiv.org/html/2603.02737v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Wafer-scale SRAM-CIM can execute LLM inference in situ and avoid deep memory hierarchy movement. | Abstract, Introduction, Architecture Overview | Architecture description; simulator-backed experiment | The paper specifies a 215 mm × 215 mm monolithic WSC, 9 × 7 dies, 54 GB on-chip SRAM, mesh links, CIM cores, buffers, crossbars, SFU, and control. ([arXiv](https://arxiv.org/html/2603.02737v1)) | Demonstrated through a proposed architecture and simulator, not public silicon or a public simulator artifact. |
| Token-Grained Pipelining improves utilization and reduces activation storage. | Section 4.2, Figs. 4–6, ablation | Scheduling rule; causal-mask equivalence; experiment | Each transformer block is split into six stages, giving a 6N-stage pipeline; TGP schedules single tokens and exploits causal masking so prefill attention can proceed with preceding tokens. ([arXiv](https://arxiv.org/html/2603.02737v1)) | Strongest for causal decoder-only LLMs. Encoder/bidirectional attention falls back to sequence-level attention stages while preserving token-level stages elsewhere. |
| Communication-aware and fault-tolerant mapping reduces inter-core transmission. | Section 4.3, Eq. 1–4, Fig. 18 | Equation; algorithmic formulation; experiment | Inter-core mapping is formulated as MIQP with Manhattan distance, output/reduce/gather volumes, die-crossing penalty, core-capacity and defect constraints; intra-core mapping uses a DP objective over an H-tree abstraction. ([arXiv](https://arxiv.org/pdf/2603.02737)) | The reusable boundary is clearest at the mapping-state formulation. Artifact-level confirmation of solver inputs/outputs would require released code or configs. |
| Distributed dynamic KV-cache management improves SRAM utilization. | Section 4.4, Figs. 10–12, 17 | Hardware state design; scheduling rule; experiment | KV cache is represented through a three-level translation: sequence-to-core page table, core bitmap, and per-crossbar row/column-use registers; KV mapping distributes heads and sequences across cores and uses thresholds to reduce thrashing. ([arXiv](https://arxiv.org/pdf/2603.02737)) | Evidenced as paper-level hardware/runtime design and simulator evaluation. Public inspectable runtime traces were not found. |
| Ouroboros achieves 4.1× average throughput and 4.2× average energy-efficiency gain. | Abstract, Evaluation, Conclusion | Experiment | The paper reports 4.1× average throughput and 4.2× average energy-efficiency gains, peaking at 9.1× throughput and 17× energy efficiency for the 13B model. ([arXiv](https://arxiv.org/pdf/2603.02737)) | Simulator-backed comparison against DGX A100/vLLM, TPUv4 simulator setup, AttAcc, and Cerebras/WaferLLM-style WSC baseline. |
| The work is end-to-end. | Fig. 3 / Section 4.1; Implementation | Paper-only flow plus simulator | The flow begins with model pipeline partitioning, then weight mapping, resource allocation, hierarchical communication minimization, and distributed KV management. ([arXiv](https://arxiv.org/html/2603.02737v1)) | The paper-level evidence supports a closed research prototype flow. The public reusable interface is clearest in the described mapping and runtime-state objects, not in a released compiler API. |

## 4. Stack anatomy

```text
Input / frontend:
LLM architecture and inference workload. The named input is a transformer-style LLM with prefill/decode behavior, sequence-length distributions, and model parameters. It is a workload/model description rather than a documented parser format. Public serialization: unknown.

Middle representation:
A 6N-stage pipeline partition of N transformer blocks, plus tiled layer/core assignment variables M[l,i,o,n]. This is graph-plus-hardware-resource state, not a published IR dialect. Inspectable in equations and figures; serialized form unknown.

Mapping or scheduling state:
MIQP inter-core mapping, DP intra-core H-tree placement, token-grained pipeline schedule, KV head/sequence-to-core allocation ring, FCFS/preemptive inter-sequence scheduling, threshold-based KV admission, and local fault-remap chains. These are described algorithmically; public logs/configs unknown.

Hardware abstraction:
Wafer → die → CIM core → crossbar / H-tree / SFU / control hierarchy. The abstraction is concrete and parameterized in the paper: 54 GB SRAM, 9 × 7 dies, 13 × 17 cores per die, 32 crossbars per core, buffers, mesh links, H-tree, SFU, masks, and registers. Public config file unknown. ([arXiv](https://arxiv.org/html/2603.02737v1))

Backend / simulator / codegen:
E2E simulator using CACTI-derived SRAM parameters, Synopsys DC/ASAP7 logic synthesis, MNSIM 2.0-derived core characteristics, BookSim2 NoC modeling, and Murphy yield modeling. This is a simulator backend, not evidenced as generated machine code or an instruction stream. ([arXiv](https://arxiv.org/pdf/2603.02737))

Output artifact:
Throughput, energy, mapping/communication-volume results, ablation results, scalability results, and CIM-core comparison figures. Generated code/instruction streams are not evidenced in checked public sources.

Evaluation loop:
The paper evaluates WikiText-2 workloads over LLaMA-13B/32B/65B, Baichuan-13B, Qwen-32B, T5-11B, and BERT-large, comparing against DGX A100/vLLM, TPUv4 modeled with modified ONNXim/NPUsim, AttAcc, and Cerebras/WaferLLM-style WSC baselines. ([arXiv](https://arxiv.org/pdf/2603.02737))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the transformer stage partition, layer tiling variables, wafer/core coordinates, H-tree reduction/concatenation decisions, KV page-table/bitmap/register state, row/column masks, defect map, and simulator parameter tables. The paper foregrounds an end-to-end architecture, while the reusable semantics are most visible in the mapping objectives and the distributed KV state representation.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 Narrow end-to-end co-design.** Ouroboros owns a complete target-specific stack slice: LLM inference on a proposed wafer-scale digital SRAM-CIM system. The input is an LLM plus request/sequence workload, and the output is simulator-backed performance/energy behavior for a specific wafer/core/crossbar design. The work’s scope is vertically integrated: pipeline execution, core mapping, KV-cache management, fault handling, and simulator calibration are designed together.

**Secondary: A3 Mapping / scheduling / DSE framework.** The core compiler-like mechanisms are the MIQP inter-core mapping, DP H-tree intra-core mapping, token-grained schedule, and runtime KV placement. These are the most reusable parts for a future compiler.

**Secondary: A2 Simulator & cost model.** Section 5 describes an E2E simulator with calibrated component parameters from CACTI, RTL synthesis, MNSIM, BookSim2, and a yield model. That simulator is central to the paper’s evidence but was not found as a public artifact. ([arXiv](https://arxiv.org/pdf/2603.02737))

### 5.2 Axis B — middle-layer style

**B4 Hardware-resource IR.**  
The named middle representation is not an IR file; it is a resource assignment over wafer/die/core/crossbar coordinates. Decisions made here include which core handles which layer tile, which H-tree leaves store weights, and how reductions/gathers are positioned. Decisions embedded outside this representation include solver implementation, simulator data structures, traffic generation, and backend timing/energy assumptions.

**B7 Runtime-state abstraction.**  
KV cache state is explicit: sequence-to-head core coordinates, bitmaps, logical blocks, row/column-valid registers, masks, allocation thresholds, and scheduling queues. This is the paper’s clearest runtime-state model and could inspire a static-plus-runtime CIM IR. ([arXiv](https://arxiv.org/pdf/2603.02737))

**B1 Config-as-IR.**  
The simulator likely depends on architectural parameters, workload parameters, and calibrated component costs. In public evidence, these parameters are visible in prose and tables rather than a documented config schema. A future compiler integration would benefit from turning these into a machine-readable hardware target description.

There is no single public artifact that upstream passes could read, verify, and rewrite. The representation is reconstructable from the paper’s equations, figures, and implementation assumptions.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware object** | The architecture defines wafer/die/core/crossbar hierarchy; a core contains 32 crossbars and a 4 MB SRAM-CIM array subsystem. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Bit-slicing / bit significance | **Parameter / microarchitecture-visible** | Each SRAM cell stores 1 bit; inputs and weights are 8-bit; an 8:1 multiplexer selects input bits; shift adders accumulate into 32-bit partial sums. ([arXiv](https://arxiv.org/pdf/2603.02737)) |
| ADC/DAC precision or sensing | **Not applicable for analog ADC/DAC; digital sensing path is present** | The paper chooses digital CIM for no precision loss and describes sense amplifier → AND → adder tree → shift-adder accumulation. ([arXiv](https://arxiv.org/pdf/2603.02737)) |
| Analog-to-digital or domain transition | **Not applicable as analog transition; digital read/logic path is modeled** | The computation path is digital SRAM bitcell read and logic accumulation, not an analog accumulation followed by ADC conversion. |
| Peripheral circuits as path nodes | **First-class / costed** | Buffers, H-tree, SFU, control unit, AND gates, adder trees, shift adders, and NoC routers are described and costed through implementation models. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Partial-sum accumulation path | **First-class / costed** | The paper describes 13-bit adder-tree output sign-extended to 32 bits and accumulated in shift adders; intra-core mapping explicitly optimizes reduction vs concatenation placement. ([arXiv](https://arxiv.org/pdf/2603.02737)) |
| Reconstruction / shift-add tree | **First-class microarchitectural path** | 128 shift adders and 32-bit partial outputs are part of the crossbar design. ([arXiv](https://arxiv.org/pdf/2603.02737)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class runtime/control state** | Causal masks enable TGP; KV cache uses page table, bitmap, row/column-valid registers, block allocation, FCFS/preemptive scheduling, and thresholding. ([arXiv](https://arxiv.org/html/2603.02737v1)) |
| Value trajectory / flow path | **Approximated through mapping and communication costs** | The MIQP objective costs output, reduce, and gather movements over Manhattan distance and die-crossing penalties, but per-value identity is not represented as a typed trajectory object. ([arXiv](https://arxiv.org/pdf/2603.02737)) |

### 5.4 Axis D — rewrite object

Ouroboros rewrites **execution placement and runtime state**, rather than exposing a general operator-graph or loop IR. The main transformations are:

- Transformer blocks → six-stage pipeline per block.
- Sequence-level execution → token-grained execution for causal decoder inference.
- Layer weights → tiled core assignment under capacity, defect, distance, and communication constraints.
- Crossbar leaf placement → H-tree reduction/concatenation arrangement.
- KV cache → distributed sequence/head/block placement with page tables, bitmaps, row/column-valid registers, and thresholds.
- Fault map → local replacement-chain remapping and routing-table reconfiguration.

The legal equivalences include causal-mask-based early attention, repeated mapping over identical transformer blocks, output-channel tiling to reduce high-bitwidth partial-sum transfers, head independence in attention, and homogeneous-core substitution for fault recovery. The representation preserves data dependencies, causal attention semantics, KV identity by sequence/head/block, accumulation precision, core capacity, defect status, and NoC distance/cost. It is especially well suited to static spatial mapping plus dynamic KV allocation; expressing trajectory rewrites such as retiming reconstruction across operators would likely require an additional abstraction for value identity, numeric stage, and domain/placement transitions.

## 6. Technical mechanism reading

### 6.1 Architecture target

Ouroboros targets a **monolithic wafer-scale digital SRAM-CIM system**. The top-level WSC is specified as 215 mm × 215 mm with 54 GB on-chip SRAM; it is organized as 9 × 7 dies, each die has a 13 × 17 grid of CIM cores, and each core has input/output buffers, 32 crossbars, an H-tree NoC, an SFU, and a control unit. Core-to-core links are 256-bit bidirectional; the crossbar H-tree is 1024-bit to support partial-sum movement. ([arXiv](https://arxiv.org/html/2603.02737v1))

The core microarchitecture is deliberately capacity-oriented. The crossbar uses 6T SRAM bitcells, 8-bit weights, 8-bit activations, 128 32-bit partial-sum outputs, 1/32 row activation, five-stage adder trees, and 32-bit shift-add accumulation. This is an important compiler/IR detail: numeric reconstruction and accumulation are part of the hardware contract, but they are exposed as microarchitecture parameters rather than as a typed IR. ([arXiv](https://arxiv.org/pdf/2603.02737))

### 6.2 Token-grained pipeline

The paper splits each transformer block into six stages and forms a 6N-stage pipeline for an N-block model. The TGP insight is that causal decoder masks allow each token’s QKV to be consumed as soon as preceding tokens are available, because future-token attention entries are masked. This turns the minimum scheduling unit from sequence to token, reducing activation storage from sequence-sized intermediates to token-sized intermediates. ([arXiv](https://arxiv.org/html/2603.02737v1))

For encoder or bidirectional attention, the paper adapts TGP by allowing attention stages to degrade to sequence-level granularity while other stages remain token-level. This is a useful boundary condition for corpus classification: TGP’s cleanest equivalence depends on triangular causal masking, while the framework has a fallback for masks that require future-token context. ([arXiv](https://arxiv.org/pdf/2603.02737))

### 6.3 Inter-core mapping objective

The inter-core mapping assigns tiled layer parts to CIM cores. The MIQP objective minimizes weighted communication between cores using Manhattan distance, activation/reduction/gather volumes, and a die-crossing penalty. The constraints require each core to process at most one tile, exclude defective cores, and assign the predetermined number of cores to each layer. ([arXiv](https://arxiv.org/pdf/2603.02737))

A compiler reading should notice that legality and cost are partly separated. Legality is encoded by capacity/defect/count constraints, while ranking is driven by data movement volume and physical distance. This makes the formulation a plausible backend mapping plugin for a future IR, provided the solver input/output can be serialized.

### 6.4 Intra-core H-tree placement

Inside a core, the crossbar array is abstracted as a binary tree whose leaves are crossbars and internal nodes are H-tree convergence points. The DP objective pushes **reduction** closer to the leaves and **concatenation** closer to the root, because early concatenation increases bandwidth pressure by expanding partial-sum dimensions. The objective is expressed as minimizing depth(node) × weight(node), where weight distinguishes concatenation from reduction. ([arXiv](https://arxiv.org/pdf/2603.02737))

This is a compact example of CIM-specific lowering: the same logical tensor computation can have different communication costs depending on where reduction and concatenation occur in the physical accumulation tree.

### 6.5 Distributed KV-cache runtime state

The KV-cache design is the paper’s most explicit runtime abstraction. A three-level translation maps sequence/token state to physical storage: a page table maps sequence IDs to core coordinates for each head; a core-local bitmap records occupied blocks; crossbar-local registers track used rows/columns inside logical blocks. ([arXiv](https://arxiv.org/pdf/2603.02737))

KV mapping also distinguishes **K** and **V** growth direction: K growth is treated along output-channel dimension and preferentially searches other crossbars, while V growth is along input-channel dimension and preferentially uses blocks in the current crossbar. This is a paper-specific compiler insight because it ties tensor dimension semantics to physical block allocation. ([arXiv](https://arxiv.org/pdf/2603.02737))

### 6.6 Simulator and calibration loop

The E2E simulator incorporates CACTI SRAM characterization, Synopsys DC/ASAP7 synthesized logic for AND gates, adder trees, shift adders, Verilog SFU/control synthesis, MNSIM 2.0-derived core characteristics, BookSim2 NoC modeling, optical Ethernet assumptions, and Murphy yield modeling with random defect locations. ([arXiv](https://arxiv.org/pdf/2603.02737))

The evaluated workloads include decoder-only LLaMA-13B/32B/65B, Baichuan-13B, Qwen-32B, and encoder-containing T5-11B and BERT-large over WikiText-2. The baselines include DGX A100/vLLM, TPUv4 modeled by modified ONNXim/NPUsim, DGX+AttAcc, and Cerebras WSE-2/WaferLLM-style simulation. ([arXiv](https://arxiv.org/pdf/2603.02737))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — KV cache is a runtime IR candidate

- **Observation:** The page table, bitmap, logical-block registers, row/column-valid registers, and threshold rules form a concrete runtime state machine for distributed CIM KV storage.
- **Why it matters for CIM compiler/IR work:** Many CIM compiler papers stop at static weight placement. Ouroboros shows that LLM serving requires a first-class runtime object whose legality depends on compute/write separation, head placement, token growth, and block fragmentation.
- **Reusable lesson:** A future CIM IR could model KV state as a typed resource map: `(sequence, layer, head, token range) -> (core, crossbar, logical block, row/column extent, valid mask)`.

### Insight 2 — Causal masking becomes a scheduling equivalence

- **Observation:** TGP relies on the lower-triangular causal mask to start attention for the current token using preceding K/V values before all tokens in the sequence have completed QKV generation.
- **Why it matters for CIM compiler/IR work:** This is a graph/schedule rewrite justified by attention semantics, not merely a hardware pipeline trick.
- **Reusable lesson:** A compiler IR for CIM LLM inference should represent mask shape and dependency direction explicitly, because they determine legal token-level pipelining.

### Insight 3 — Mapping cost combines topology and tensor semantics

- **Observation:** The MIQP objective attaches different traffic weights to inter-layer output movement, intra-layer reduce movement, and gather movement, then multiplies those by physical distance and die-crossing penalty.
- **Why it matters for CIM compiler/IR work:** The mapping state is neither a pure graph placement nor a pure physical floorplan; it is a tensor-aware physical communication model.
- **Reusable lesson:** A portable CIM mapper should preserve both tensor-role labels and physical topology coordinates across lowering.

### Insight 4 — H-tree placement exposes accumulation-path semantics

- **Observation:** The intra-core DP chooses where reduction and concatenation happen in the H-tree, because early concatenation increases bandwidth pressure.
- **Why it matters for CIM compiler/IR work:** Reduction tree shape is a CIM-specific backend contract, not just an implementation detail.
- **Reusable lesson:** A value-trajectory IR could make reduction/concatenation nodes explicit path elements with placement, precision, and bandwidth effects.

### Insight 5 — Fault tolerance acts like a dynamic rewrite of placement state

- **Observation:** Failed KV cores trigger recomputation for affected sequences; failed weight cores trigger a local replacement chain that propagates weights to neighboring cores and evicts KV state.
- **Why it matters for CIM compiler/IR work:** Fault recovery is a runtime rewrite of mapping and storage state under legality constraints.
- **Reusable lesson:** A robust CIM runtime IR should separate static “nominal placement” from dynamic “active placement” plus recovery rules.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** No artifact license found. The paper itself is CC BY 4.0 on arXiv/ACM. ([arXiv](https://arxiv.org/html/2603.02737v1))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** N/A.
- **What the paper describes but no public artifact was found for:** E2E simulator, Verilog SFU/control, modified ONNXim/NPUsim setup, cycle-accurate WSC simulator, mapping solver implementation, workload scripts, simulator configs, generated mapping traces, and raw result data.
- **Minimal command or workflow:** Unknown / not found in checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper provides implementation assumptions and evaluation descriptions, but no public reproduction package was found.
- **Checked sources:** arXiv record, arXiv HTML/PDF, ACM/ASPLOS public program/search results, and targeted searches for repository/code/artifact names. The arXiv record exposes PDF, HTML, and TeX source links, plus generic arXivLabs code/data widgets, but no article-specific code link was visible. ([arXiv](https://arxiv.org/abs/2603.02737))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Workloads, models, sequence-length settings, and WikiText-2 are described; parser/schema unknown. |
| Intermediate representation serialized | Unknown | No public IR, config schema, or mapping dump found. |
| Mapping decisions inspectable | Partial | MIQP/DP equations and mapping rationale are clear; solver inputs/outputs not public. |
| Schedule inspectable | Partial | TGP and inter-sequence scheduling rules are described; execution traces unknown. |
| Hardware config explicit | Partial | Many architectural parameters are stated; no machine-readable target spec found. |
| Precision / bit-slice assumptions explicit | Partial | 8-bit weights/activations, 32-bit partial sums, 1-bit cells, mux and shift-add path are explicit; full quantization pipeline unknown. |
| Cost model inspectable | Partial | Component costs and tools are named; simulator implementation unavailable. |
| Simulator backend documented | Partial | CACTI, MNSIM 2.0, BookSim2, DC/ASAP7, and yield model are described; scripts/configs unknown. |
| Generated code / instruction stream inspectable | N/A / Unknown | The paper does not foreground a generated instruction stream. |
| Provenance from source op to backend action | Partial | Pipeline stages and layer/core mapping are described, but op-to-event traces are unavailable. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | CACTI, RTL synthesis, MNSIM, BookSim2, and Murphy model sources are named. ([arXiv](https://arxiv.org/pdf/2603.02737)) |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The paper uses standard LLM architecture/workload assumptions, but no importer or frontend schema is exposed.
- **As IR inspiration:** Strong. The KV page table/bitmap/register hierarchy, token pipeline stage state, defect-aware core map, and H-tree reduction/concatenation state are good candidates for future IR objects.
- **As mapper/scheduler:** Strong conceptual reuse. The MIQP inter-core formulation and DP intra-core H-tree placement could become backend mapping passes if recast with explicit inputs/outputs.
- **As cost model:** Medium. The paper’s traffic terms, NoC distance costs, die-crossing penalty, component energy parameters, and yield model could become target plugins.
- **As backend:** Medium-to-low without artifact. The simulator backend is described but not publicly wrapped.
- **As benchmark:** Medium. The workload/model set and baselines are useful, but reproduction requires reimplementing the simulator and baseline setup.
- **As validation source:** Partial. The work uses CACTI, RTL synthesis, MNSIM, BookSim2, and simulator validation against WaferLLM-style settings, but no real chip or public calibration package is available.

**Integration effort estimate:** **High.** Integration would be most direct through reimplementing the mapping/state objects from the equations and hardware descriptions, then writing adapters for a simulator target. Reuse would benefit from a small schema that extracts layer tiles, core coordinates, H-tree decisions, KV-table state, and traffic terms. The most valuable reusable boundary appears to be the mapping/runtime-state model rather than the unreleased simulator.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AttAcc** | PIM acceleration for transformer/LLM attention and KV-heavy inference | AttAcc is an HBM/PIM attention accelerator in a heterogeneous xPU+PIM system; Ouroboros targets full in-situ wafer-scale SRAM-CIM execution for the whole LLM stack. ([SCALE](https://scale.snu.ac.kr/papers/2024-04-Conference-ASPLOS-AttAcc.pdf?utm_source=chatgpt.com)) | Distinguish operator/attention PIM backends from full-stack SRAM-CIM co-designs. |
| **WaferLLM / Cerebras WSE-style baseline** | Wafer-scale LLM inference and large on-chip SRAM | Ouroboros adds digital SRAM-CIM execution, TGP, distributed KV management, and communication-aware mapping on a proposed SRAM-CIM wafer. ([arXiv](https://arxiv.org/pdf/2603.02737)) | Useful comparison for wafer-scale mapping and serving, but stack object differs: WSC scheduling vs CIM-resident compute/storage. |
| **CIM-MLC** | CIM compiler abstractions, multi-level scheduling, meta-operator flow | CIM-MLC foregrounds a reusable compilation stack and hardware abstraction; Ouroboros embeds target-specific mapping/state semantics inside a co-designed architecture/simulator. ([cimmlc.github.io](https://cimmlc.github.io/?utm_source=chatgpt.com)) | Good contrast between explicit compiler IR/meta-ops and hidden paper-internal mapping state. |
| **CMSwitch / Be CIM or Be Memory** | CIM resource allocation and mode-aware compilation | CMSwitch makes compute/memory mode switching a compiler optimization object; Ouroboros assumes a wafer-scale all-SRAM-CIM target and focuses on token pipeline, KV placement, and core mapping. ([arXiv](https://arxiv.org/abs/2502.17006?utm_source=chatgpt.com)) | Shows two ways to make “memory as compute resource” first-class: mode switching vs distributed KV/runtime state. |
| **TranCIM / MulTCIM** | Digital CIM for transformer acceleration | These are closer to circuit/operator-level transformer CIM accelerators; Ouroboros is system-level, full-stack, and LLM-serving oriented. ([arXiv](https://arxiv.org/html/2603.02737v1)) | Separate circuit/operator CIM innovations from whole-system mapping/runtime papers. |
| **CIM circuit macros such as VLSI’22 / ISSCC’22 baselines** | SRAM-CIM core design and TOPS/W comparison | Ouroboros intentionally trades aggressive core density for capacity-driven whole-model on-chip storage and LLM-serving throughput. ([arXiv](https://arxiv.org/html/2603.02737v1)) | Corpus entry should record the optimization target: circuit TOPS/W vs system-level memory-capacity efficiency. |

## 10. Corpus-ready final takeaway

- Ouroboros is a **target-specific end-to-end co-design** for wafer-scale **digital SRAM-CIM LLM inference**, not a general-purpose compiler/IR stack.
- Its strongest reusable stack layer is **mapping + scheduling + runtime state**: token-grained pipelining, MIQP/DP placement, distributed KV-cache mapping, and fault-aware remapping.
- The evidenced scope is **simulator-backed** evaluation over LLaMA/Baichuan/Qwen/T5/BERT workloads and baselines including DGX A100/vLLM, TPUv4 simulation, AttAcc, and Cerebras/WaferLLM-style WSC.
- First-class CIM objects include wafer/die/core/crossbar hierarchy, H-tree reduction path, masks, page tables, bitmaps, logical KV blocks, row/column-valid registers, and partial-sum accumulation paths.
- The hidden IR is the combination of **stage partition + layer tile/core assignment + H-tree placement + KV runtime tables + simulator target parameters**.
- Artifact status: **no public artifact found.** The paper describes an E2E simulator and Verilog/RTL modeling flow, but no public simulator repository or scripts were found.
- Integration is most promising as **IR inspiration, mapper/scheduler logic, cost-model structure, and benchmark target**, with high integration effort due to absent public artifacts.
- For value-trajectory IR work, Ouroboros is relevant because it exposes path-sensitive mapping and runtime state, but a trajectory-level extension would add explicit value identity, precision stage, bit significance, and resource-path annotations.
