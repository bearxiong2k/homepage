---
slug: cmswitch
title: "CMSwitch: Be CIM or Be Memory: A Dual-mode-aware DNN Compiler for CIM Accelerators"
short_title: "CMSwitch"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "ASPLOS 2025, Proceedings of the 30th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 2"
authors_or_group: "Shixin Zhao, Yuming Li, Bing Li, Yintao He, Mengdi Wang, Yinhe Han, Ying Wang"
summary: >-
  CMSwitch is best classified as a **dual-mode-aware CIM mapping and scheduling compiler** whose central contribution is making the compute-vs-memory mode of each CIM array part of the compilation optimization space. The paper introduces DEHA, a hardware abstraction that records dual-mode array parameters and switch overheads; DACO, a two-stage optimization pass that segments the DNN graph with dynamic programming and solves per-segment compute/memory allocation with mixed-integer programming; and DMO, a small meta-operator extension that expresses array-mode switching through `CM.switch(TOM/TOC, arrayaddr)`. The demonstrated stack takes ONNX-format DNN inference workloads and user-defined CIM hardware parameters, targets a Dynaplasia-like dual-mode CIM accelerator, evaluates CNN and Transformer models with 8-bit weights/activations through simulator-backed experiments, and reports a 1.31× average speedup over CIM-MLC. For CIM compiler/IR research, its most useful abstraction is the array-level resource/mode allocation state rather than a full public compiler IR or reusable backend contract. ([arXiv](https://arxiv.org/pdf/2502.17006v1))
links:
  paper: https://arxiv.org/abs/2502.17006
  artifact:
  docs:
  code:
technology:
  - "digital-CIM"
  - "eDRAM-CIM"
  - "dual-mode-CIM"
  - "Dynaplasia-like target"
  - "PRIME-style ReRAM sensitivity"
workloads:
  - "MobileNet"
  - "ResNet18"
  - "VGG16"
  - "BERT-large"
  - "LLaMA2-7B"
  - "OPT-6.7B"
  - "OPT-13B"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5]
axis_B: [B4, B2, B5, B1]
axis_C_first_class_objects:
  - "dual-mode CIM array"
  - "array coordinate"
  - "compute mode"
  - "memory mode"
  - "input-buffer role"
  - "output-buffer role"
  - "network segment"
  - "mode-switch overhead"
  - "compute/memory allocation"
axis_D_rewrite_objects:
  - "operator graph segmentation"
  - "hardware mapping"
  - "array binding"
  - "memory layout/resource role"
  - "mode selection"
  - "segment schedule"
  - "meta-operator stream"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown"
  last_checked: "2026-05-19"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend_metaop_interface"
  - "benchmark_reference"
reproducibility_level: low
notes:
  - "Best understood as a dual-mode CIM compiler/mapping framework rather than a full reusable public stack."
  - "Strongest evidence is the DEHA/DACO/DMO paper formulation: array-mode hardware abstraction, DP segmentation, MIP allocation, and CM.switch meta-operator syntax."
  - "No public CMSwitch code, simulator patch, benchmark harness, or generated meta-operator examples were found."
  - "Value-trajectory relevance comes from resource residency and mode-transition modeling, not from explicit numeric trajectory or partial-sum representation."
  - "Artifact URL spot-check on 2026-05-19 found arXiv and paper mirrors but no official public implementation link."
takeaways: []
---

# CMSwitch: Be CIM or Be Memory: A Dual-mode-aware DNN Compiler for CIM Accelerators — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework** | The strongest evidenced object is a mapping/search state over network segments and array-level compute/memory allocations. CMSwitch takes an ONNX DNN plus hardware parameters, then uses DP for network segmentation and MIP/Gurobi for per-segment resource allocation and scheduling. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design** | The paper demonstrates an input-to-output flow: ONNX graph → dual-mode hardware abstraction → DACO optimization → dual-mode meta-operator flow → simulator-backed evaluation. The demonstrated target is a standalone dual-mode CIM accelerator modeled after Dynaplasia, with a PRIME-style sensitivity case. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR; B2 Graph-as-IR; B5 Instruction/meta-op; partial B1 Config-as-IR** | The central middle state is a hardware-resource allocation: `λ_min`, `λ_mout`, and `λ_c` bind array coordinates `(x,y)` to input-buffer, output-buffer, or compute roles for each operator. ONNX supplies the graph, DEHA supplies hardware parameters, and DMO emits `CM.switch(TOM/TOC, arrayaddr)` meta-operators. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| First-class CIM objects, Axis C | **Dual-mode CIM array; array coordinate; compute/memory mode; input/output buffer role; network segment; switch overhead; on-chip memory/computation resource allocation** | These objects are explicitly named in the variables, hardware abstraction, constraints, and meta-operator syntax. ADC/DAC, analog partial-sum trajectory, reconstruction tree, and numeric nonideality are not central modeled objects in the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Rewrite object, Axis D | **Hardware mapping, array binding, mode selection, segment schedule, meta-operator stream** | CMSwitch rewrites a DNN graph into segments, chooses compute/memory allocation for dual-mode arrays, schedules operators in segment-level pipelines, and emits meta-operators that encode mode switching. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Best corpus tags | `compiler-mapping`, `dual-mode-CIM`, `hardware-resource-IR`, `DNN-inference`, `ONNX`, `MIP`, `dynamic-programming`, `meta-operator`, `eDRAM-CIM`, `simulator-backed` | Tags reflect the actual first-class objects and evaluation path. |
| Closest comparison baselines | **CIM-MLC, OCC, PUMA, PIMCOMP, C4CAM, TC-CIM** | CIM-MLC is closest because CMSwitch extends its simulator/meta-operator ecosystem and uses it as the main baseline. OCC and PUMA are direct evaluation baselines. PIMCOMP, C4CAM, and TC-CIM are nearby CIM compiler frameworks with different middle objects: crossbar mapping, CAM-oriented compilation, and tensor/polyhedral scheduling. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |

## 2. One-paragraph public summary

CMSwitch is best classified as a **dual-mode-aware CIM mapping and scheduling compiler** whose central contribution is making the compute-vs-memory mode of each CIM array part of the compilation optimization space. The paper introduces DEHA, a hardware abstraction that records dual-mode array parameters and switch overheads; DACO, a two-stage optimization pass that segments the DNN graph with dynamic programming and solves per-segment compute/memory allocation with mixed-integer programming; and DMO, a small meta-operator extension that expresses array-mode switching through `CM.switch(TOM/TOC, arrayaddr)`. The demonstrated stack takes ONNX-format DNN inference workloads and user-defined CIM hardware parameters, targets a Dynaplasia-like dual-mode CIM accelerator, evaluates CNN and Transformer models with 8-bit weights/activations through simulator-backed experiments, and reports a 1.31× average speedup over CIM-MLC. For CIM compiler/IR research, its most useful abstraction is the array-level resource/mode allocation state rather than a full public compiler IR or reusable backend contract. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CMSwitch is a novel compiler that co-adjusts CIM array mode and DNN mapping for dual-mode CIM chips. | Abstract and Introduction contributions | Equation / algorithm / experiment / paper-only | The paper formalizes array modes and allocation variables, embeds mode switching in segmentation/resource allocation, and evaluates generated meta-operator flows in simulators. ([arXiv](https://arxiv.org/abs/2502.17006)) | Demonstrated for simulator-backed DNN inference on a Dynaplasia-like dual-mode CIM target; artifact-level reuse is not confirmed by a public implementation. |
| DEHA integrates compute-memory mode switching into the hardware abstraction. | Section 4.2, Figure 8 | Hardware abstraction / paper-only | DEHA models a chip/array hierarchy, identifies the CIM array as the smallest switchable unit, and requires parameters such as number of switchable arrays, array size, internal/external bandwidth, switch method, switch latency, and function latency. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | The paper-level evidence supports the abstraction schema conceptually; no separately serialized DEHA schema or config artifact was found. |
| DACO uses dynamic programming for network segmentation and MIP for compute/memory allocation and scheduling. | Section 4.3, Algorithm 1 | Algorithm / equation | The paper defines topological graph flattening, segment states, inter-segment overhead, per-segment allocation variables, constraints, objective, and an Algorithm 1 loop that calls `MIP(S_i,j)` within a DP recurrence. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | The reusable boundary is clearest at the optimization formulation. Artifact-level confirmation of solver model construction, pruning, and output format would require code. |
| Per-segment allocation can be represented by array-level variables for memory-input, memory-output, and compute mode. | Table 1 and Section 4.3.2 | Equation / formal variables | The variables `λ_min(i,x,y)`, `λ_mout(i,x,y)`, and `λ_c(i,x,y)` directly bind CIM array coordinates to roles for operator `O_i`; `MemO_i`, `ComO_i`, and switch-count variables summarize memory/compute resource use. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | Strong paper evidence for a hidden hardware-resource IR; no standalone serialized IR file is evidenced. |
| DMO expresses compilation results in a generalized meta-operator flow rather than chip-specific machine code. | Section 4.4, Figure 13 | Meta-op syntax / paper-only | The syntax includes `parallel { ... }`, standard `<CIM>` and `<MEMORY>` operators, and `<SWC> ::= CM.switch(<type>, arrayaddr)` where `<type> ::= TOM | TOC`. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | The paper-level evidence supports a low-level output abstraction; no public examples of generated meta-operator files were found. |
| CMSwitch supports diverse DNNs including CNNs and large Transformer models. | Evaluation setup and workload-scale section | Experiment | The benchmark set includes MobileNet, ResNet, VGG, BERT, OPT, and LLaMA 2; Transformer scaling experiments vary batch size 4–16 and sequence length 32–2048; weights and activations are quantized to 8-bit. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | Demonstrated through simulator-backed inference experiments; exact benchmark harness, model import scripts, and calibration workflow are not independently visible. |
| CMSwitch achieves 1.31× average speedup over CIM-MLC. | Abstract and Section 5.2 | Experiment | Section 5.2 reports BERT, LLaMA2-7B, OPT-13B, MobileNet, ResNet18, and VGG16 results, with 1.31× average speedup and 2.03× maximum improvement versus CIM-MLC. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | The evidence is paper-level experimental reporting; reproducing Figure 14 would require simulator modifications, model configs, and scripts that were not found publicly. |
| Dual-mode switching overhead is small and worth modeling. | Section 5.5 | Experiment / cost study | The paper reports dual-mode switch overhead of about 3–5% of total execution time and argues that the segmentation strategy accounts for this overhead. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | Demonstrated under the paper’s Dynaplasia-like configuration and modified simulator; extension to other switch circuits depends on DEHA parameters and simulator calibration. |
| CMSwitch has scalability across hardware settings. | Section 5.5 | Experiment / sensitivity | The paper adjusts hardware settings to a PRIME-like architecture and reports speedups of 1.48× for BERT, 1.09× for LLaMA-7B, and 1.10× for OPT-13B over CIM-MLC. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | Supports a sensitivity argument, not a general proof across CIM technologies; PRIME’s ReRAM write behavior is discussed at a high level. |
| The authors “released the first compiler” aware of this CIM feature. | Introduction contribution bullet | Paper-only / artifact search | The claim appears in the contribution list. Public artifact search did not find an official CMSwitch repository; a GitHub account named `cmswitch` has zero public repositories and no visible paper artifact. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) | Artifact status: no public artifact found. |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX-format DNN, lowered to a computation graph expression. The paper names ONNX and graph flattening/topological ordering, but the parser/importer interface is not documented as a reusable artifact. The graph is inspectable in the paper as an algorithmic object, not as a public serialized IR. 

Middle representation:
  Network segments S_i,j plus allocation plan A / A*. This is a hardware-resource mapping state over operators and array coordinates. It is formalized by variables and equations, but no standalone serialization format is evidenced.

Mapping or scheduling state:
  λ_min(i,x,y), λ_mout(i,x,y), λ_c(i,x,y), MemO_i, ComO_i, Switch_m→c, Switch_c→m, inter-segment latency, intra-segment latency, and DP table L[j][A]. This is the strongest “hidden IR” in the work: typed role binding of array coordinates to memory-input, memory-output, and compute functions.

Hardware abstraction:
  DEHA, a chip/array abstraction with switchable-array count, array size, internal/external bandwidth, switch method, switch latency, and function latency. The abstraction is described in Figure 8 and Table 2, but no public schema or configuration file was found.

Backend / simulator / codegen:
  DMO meta-operator flow with standard CIM/memory operators, `parallel {}` for segment parallelism, and `CM.switch(TOM/TOC, arrayaddr)` for array-mode switching. Functional simulation uses the CIM-MLC simulator; latency evaluation uses modified NeuroSim/MNSIM-like simulators and a Dynaplasia-like hardware configuration.

Output artifact:
  Segments with dual-mode allocation and meta-operators. The paper shows syntax and figures, but no public generated output files were found.

Evaluation loop:
  Simulator-backed inference experiments compare CMSwitch to PUMA, OCC, and CIM-MLC on CNN and Transformer models, using 8-bit weights/activations and latency as the primary metric.
```

The input/output workflow is described in Section 4.1: CMSwitch takes user-defined hardware parameters and neural network applications, converts the neural network to ONNX, incorporates dual-mode hardware abstraction, uses DP and MIP to produce segmentation/allocation results, and emits dual-mode meta-operators. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the ONNX-derived operator list, the segment boundary state `S_i,j`, the array-role binding variables `λ_min/λ_mout/λ_c`, the cost terms for inter-segment data movement and switch latency, and the DMO meta-operator stream. The paper foregrounds DEHA/DACO/DMO as named compiler components, while the reusable semantics are most visible in the MIP variable definitions and constraints: they define the legality of “this physical array is currently an input buffer, output buffer, or compute array for this operator.” ([arXiv](https://arxiv.org/pdf/2502.17006v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.**  
CMSwitch’s primary ownership is the mapping/scheduling slice between a DNN graph and a CIM backend. It does not primarily introduce a new macro generator, analog simulator, ISA, or runtime system; it introduces a search space and optimization procedure for deciding **which arrays are memory, which arrays are compute, which operators share a segment, and how segment transitions are costed**. The paper explicitly frames DACO as a pass that allocates dual-mode CIM arrays for CIM-supported operators to minimize latency, with DP for segmentation and MIP for intra-segment allocation. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

**Secondary: A5 — Narrow end-to-end co-design.**  
The paper demonstrates a full path from ONNX workload and hardware parameters to meta-operator flow and simulator evaluation. The end-to-end scope is narrow and target-specific: DNN inference on standalone CIM accelerators with dual-mode arrays, a Dynaplasia-like main target, and a PRIME-style hardware sensitivity experiment. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The stack slice is defined by **input** = ONNX-format DNN plus DEHA hardware parameters, and **output** = network segments with compute/memory array allocation plus `CM.switch`-bearing meta-operator flow. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 5.2 Axis B — middle-layer style

**B4 — Hardware-resource IR.**  
The named middle representation is not called an IR, but the MIP allocation state functions as one. It gives each switchable CIM array a coordinate `(x,y)` and binds it to one of three roles for an operator: memory input buffer, memory output buffer, or compute mode. The decisions made here include mode selection, array allocation, buffer reuse across dependent operators, and resource-limit satisfaction. Decisions that remain embedded include exact low-level layout, simulator calibration, chip-specific ISA lowering, and detailed memory/reconstruction behavior. A single upstream-readable serialized artifact is not evidenced. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

**B2 — Graph-as-IR.**  
The graph representation is an ONNX-derived computation graph, flattened into a topologically sorted list of CIM-supported operators. The graph is used to identify dependencies and segment boundaries, and unsupported or too-large operators are partitioned into sub-operators with a greedy strategy. Graph-level decisions are therefore segmentation and coarse execution ordering. The exact ONNX import/lowering implementation is not publicly evidenced. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

**B5 — Instruction / meta-op / ILA style.**  
DMO is a meta-operator output layer. It names `CM.switch(<type>, arrayaddr)` and distinguishes `TOM` and `TOC` as mode-switch types. It also uses `parallel {}` to represent operators in a segment executing in parallel. This is a codegen-facing representation rather than a full machine ISA; users are expected to convert the meta-operator flow into chip-specific ISA or machine code. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

**Partial B1 — Config-as-IR.**  
DEHA acts like a hardware-configuration boundary: number of switchable arrays, array size, bandwidths, switch method, switch latency, and operation/read/write latency are compiler-visible inputs. The paper-level abstraction is clear; a public config schema was not found. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class at array level; chip/array hierarchy** | DEHA models chip and array tiers and treats the CIM array as the smallest switchable unit. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Bit-slicing / bit significance | **Implicit / technology background** | The paper mentions bit-series multiplication-addition for dual-mode CIM operation, but the optimization variables do not carry bit-slice or bit-significance types. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) |
| ADC/DAC precision or sensing | **Not applicable / not modeled as first-class** | The target is a Dynaplasia-like dual-mode array with switch control via global wordline input; the evaluated abstraction centers on array mode, bandwidth, and latency rather than ADC/DAC stages. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Analog-to-digital or domain transition | **Implicit / not first-class** | DMO names compute/memory switching, not analog/digital conversion boundaries. |
| Peripheral circuits as path nodes | **Parameter / switch mechanism** | DEHA records switch method and switch latency; the evaluation says runtime `CM.switch` corresponds to setting global wordline signals. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Partial-sum accumulation path | **Implicit** | CIM compute is described as MAC/MVM/MMM; the optimizer models operation rate and data rate, not partial-sum path structure. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) |
| Reconstruction / shift-add tree | **Implicit / not modeled** | No first-class reconstruction operator, shift-add tree, or cross-operator reconstruction state is evidenced. |
| Runtime state, masks, KV cache, batching, sparsity | **Partial parameter / workload state** | KV cache is discussed as a memory-pressure source in Transformer decoding; batch size and sequence length are varied experimentally. They are not represented as a general runtime-state IR. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Value trajectory / flow path | **Approximated by allocation and segment transition costs** | The closest approximation is segment-level store/switch/load modeling and in-place reuse of memory arrays across dependent operators. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |

### 5.4 Axis D — rewrite object

CMSwitch rewrites:

- the **operator graph** into a flattened topological operator list and network segments;
- the **hardware mapping** into per-segment compute/memory array allocation;
- the **array binding** into `(operator, array-coordinate, role)` variables;
- the **mode-selection plan** into `TOM` / `TOC` switch meta-operators;
- the **segment schedule** into serial segment execution with intra-segment parallelism;
- the **meta-operator stream** into a generalized output suitable for backend-specific lowering.

Legal transformations include segmenting operators, greedily partitioning too-large operators into sub-operators, reusing output buffers as input buffers across dependent operators, allocating arrays to compute or memory roles, and applying post-allocation optimizations such as weight duplication. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The equivalences exploited are primarily **resource and schedule equivalences**: an array may serve as compute or scratchpad memory depending on the segment, dependent operators may reuse memory arrays for producer-output/consumer-input buffering, and a segment’s latency is approximated by the maximum single-operator latency under pipelined execution. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

Information that must be preserved across lowering includes operator dependencies, segment boundaries, array coordinates, mode roles, switch direction, valid on-chip data that must be stored or can be processed in place, weights that must be reloaded for new segments, and hardware parameters such as bandwidth and switch latency. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The representation is especially well suited to **array-mode/resource allocation under latency cost models**. Expressing cross-operator numeric-trajectory rewrites—such as retiming sensing, retaining bit-sliced partial sums, or fusing reconstruction with reductions—would likely require an additional abstraction for value identity, numeric domain, bit significance, partial-sum format, and conversion/reconstruction stages.

## 6. Technical mechanism reading

### 6.1 DEHA: dual-mode hardware abstraction

DEHA extends hardware abstraction with a mode-switch attribute at CIM-array granularity. The paper simplifies the architecture to chip and array levels because the optimization target is the switchable array. Parameters include number of dual-mode arrays, array size, internal bandwidth, external/global bandwidth, switch method, switch latency, and function latency for compute/read/write operations. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

In the evaluated Dynaplasia-like configuration, Table 2 lists 96 switchable arrays, `320 × 320` array size, `10KB × 8` buffer size, `32b/cycle` internal bandwidth, switch by changing the input of global IA and IA′, and one-cycle switch latency. The actual runtime interpretation of `CM.switch` is setting the corresponding global wordline signal. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 6.2 DACO step 1: graph flattening and network segmentation

DACO receives an ONNX-format DNN and CIM hardware abstraction. It flattens the graph into a topologically sorted operator list `(O1, …, Om)` and uses dependency relation `W` to preserve producer-consumer relationships. Operators too large to fit on the CIM accelerator are partitioned into smaller sub-operators with a greedy strategy based on available on-chip resources. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The key segmentation idea is to execute groups of operators as serial segments while allowing pipelined/parallel execution within a segment. Segmentation reduces the search space and supports networks that cannot fit fully on chip. Inter-segment overhead includes three modeled sources: storing valid on-chip data, switching compute/memory mode, and loading data such as weights. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 6.3 DACO step 2: MIP allocation with array-role variables

For each segment, CMSwitch solves a resource allocation and scheduling problem. The MIP variables are the central paper-specific compiler objects:

- `λ_min(i,x,y)`: array `(x,y)` assigned to operator `Oi` as a memory-mode input buffer;
- `λ_mout(i,x,y)`: array `(x,y)` assigned as a memory-mode output buffer;
- `λ_c(i,x,y)`: array `(x,y)` assigned in compute mode;
- `MemO_i` and `ComO_i`: number of memory/compute arrays assigned to operator `Oi`;
- `Switch_m→c` and `Switch_c→m`: segment-transition switch counts. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The constraints encode: an array cannot be memory and compute for the same operator; a dependent operator may reuse the producer’s output memory array as input buffer; non-dependent operators cannot reuse the same resources; and total assigned resources must be within `N_cim`. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The objective approximates pipelined segment latency as `min max L_Oi` over operators in the segment. The latency model treats effective compute rate as the minimum of compute capacity and memory-feed-supported compute: `ComO_i · OP_cim` versus `(MemO_i · D_cim + D_main) · AI_Oi`; the total operator work `OP_Oi` is divided by that bottleneck term. This makes arithmetic intensity the key bridge between workload properties and compute-vs-memory resource choice. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The paper says Gurobi solves the memory/compute allocation for each network segment, then CMSwitch performs post-allocation optimizations such as weight duplication. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 6.4 DMO: dual-mode meta-operator output

DMO expresses results as a meta-operator flow rather than chip-specific machine code. Figure 13 defines `CM.switch(<type>, arrayaddr)` with `type ::= TOM | TOC`, where `TOM` and `TOC` switch an array address to memory or compute mode. `parallel {}` represents segment-level parallel execution. The paper states users can convert the meta-operator flow to ISA or machine code for a specific CIM chip. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### 6.5 Evaluation assumptions and backend path

For functional simulation, CMSwitch adopts the CIM-MLC functional simulator and compares execution results with PyTorch. For latency, the authors build on open-source NeuroSim and MNSIM-style simulators with modifications to simulate dual-mode switching, and they modify hardware configuration to match Dynaplasia. Workloads include MobileNet, ResNet, VGG, BERT, OPT, and LLaMA 2; all models use 8-bit weights and activations. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

The main comparison baselines are PUMA, OCC, and CIM-MLC, with execution latency as the primary metric. Section 5.2 reports 1.31× average speedup and 2.03× maximum speedup over CIM-MLC. Additional experiments vary batch size and sequence length for Transformer models, report 3–5% switch overhead, and measure compilation overhead as 2.8×–6.3× longer than CIM-MLC. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Array mode is the real compiler type

- **Observation:** The paper’s most concrete type-like distinction is not an ML tensor type or an ISA opcode; it is the role of a physical CIM array at a given point in the mapping: memory-input buffer, memory-output buffer, or compute array.
- **Why it matters for CIM compiler/IR work:** This suggests a practical IR design point for reconfigurable CIM accelerators: represent **resource role over time** as first-class state, with legality constraints attached to resource coordinates.
- **Reusable lesson:** Future CIM IRs can borrow the triple-role binding `λ_min/λ_mout/λ_c` as a compact way to expose mode-mutability to optimization passes. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### Insight 2 — Segmentation is a mode-transition contract, not just graph partitioning

- **Observation:** Segment boundaries are where CMSwitch charges store/switch/load costs. The segment is therefore both a graph partition and a hardware-reconfiguration interval.
- **Why it matters for CIM compiler/IR work:** For switchable CIM systems, segmentation should preserve not only dependency order but also which on-chip values must survive a reconfiguration and which arrays change role.
- **Reusable lesson:** A future compiler could model a segment boundary as a typed barrier carrying “valid data,” “mode delta,” and “reload set” fields rather than as a pure scheduling cut. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### Insight 3 — Arithmetic intensity is used as a resource-allocation signal

- **Observation:** The latency model uses arithmetic intensity to decide when memory arrays help feed computation versus when compute arrays dominate performance.
- **Why it matters for CIM compiler/IR work:** Arithmetic intensity becomes a bridge between graph/operator analysis and hardware resource typing. It is a simple scalar, but it drives mode selection in the MIP objective.
- **Reusable lesson:** Future CIM stacks could propagate per-operator intensity or bandwidth-pressure attributes as part of an IR annotation that informs array-mode and buffer-allocation passes. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### Insight 4 — Meta-operators are a portable backend boundary, but not the whole IR

- **Observation:** DMO’s `CM.switch` syntax is useful because it gives a backend-independent name to a hardware action, while leaving chip-specific signal/ISA lowering to later tooling.
- **Why it matters for CIM compiler/IR work:** This separates “compiler decided this array should become memory/compute” from “this exact chip toggles these control lines.”
- **Reusable lesson:** A portable CIM compiler stack could expose mode-switch meta-ops as a stable lowering boundary, while keeping hardware-specific control-signal lowering in backend plugins. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

### Insight 5 — The strongest reusable semantics are in the constraints

- **Observation:** The paper’s constraints encode CIM-specific legality: no role overlap, producer-output/consumer-input buffer reuse, non-dependent resource exclusion, and total resource limits.
- **Why it matters for CIM compiler/IR work:** These constraints are more reusable than the performance numbers because they capture architectural invariants for switchable-array compilers.
- **Reusable lesson:** A future IR verifier could turn these MIP constraints into static checks over a serialized segment/allocation plan. ([arXiv](https://arxiv.org/pdf/2502.17006v1))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** No official CMSwitch artifact was located. The paper describes a compiler workflow, simulator modifications, Gurobi-based optimization, and meta-operator generation, but no public repository, release, scripts, configs, or generated outputs were found during the check.
- **What the artifact appears to omit:** Public source code, DEHA schema/config files, DACO implementation, Gurobi model construction, simulator modifications, benchmark harness, generated DMO traces, reproduction scripts, and issue tracker were not found.
- **Minimal command or workflow, if documented:** None found publicly.
- **Whether paper figures appear reproducible from the artifact:** Unknown. Figure 14–18 reproduction would require the modified simulators, model import flow, hardware configs, and benchmark scripts.
- **Artifact-search note:** The contribution list says the authors “released the first compiler” aware of this CIM feature, but the public check did not find a corresponding artifact. A GitHub user named `cmswitch` has zero public repositories and does not evidence an official CMSwitch artifact. ([ar5iv](https://ar5iv.org/html/2502.17006v1))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | ONNX input is documented; importer details and supported operator coverage are not public. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Intermediate representation serialized | **Unknown** | Segment/allocation/meta-op states are formalized, but no serialized file format is found. |
| Mapping decisions inspectable | **Partial** | Figures show allocation results and variables define decisions; no public emitted mapping dump found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Schedule inspectable | **Partial** | Segment-level scheduling and `parallel {}` are described; no full schedule trace found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Hardware config explicit | **Partial** | Table 2 lists main Dynaplasia-like parameters; no config file found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Precision / bit-slice assumptions explicit | **Partial** | 8-bit weights and activations are explicit; bit-slice propagation is not a first-class compiler object. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Cost model inspectable | **Partial** | Equations and Algorithm 1 are inspectable; code-level implementation and calibration are not found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Simulator backend documented | **Partial** | The paper names CIM-MLC functional simulator plus modified NeuroSim/MNSIM-like latency simulator; modifications are not public. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Generated code / instruction stream inspectable | **Partial** | DMO syntax is shown; no generated trace files found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |
| Provenance from source op to backend action | **Partial** | Algorithm preserves operators, segments, and array allocation; no end-to-end provenance file found. |
| Reproduction scripts available | **Unknown** | No public CMSwitch scripts found. |
| Calibration source documented | **Partial** | Dynaplasia parameters and simulator basis are described; detailed calibration workflow is not found. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) |

### 8.3 Integration helper

- **As frontend:** Reuse would be limited to the idea of accepting ONNX DNN graphs. The paper does not expose a public ONNX importer or operator support matrix.
- **As IR inspiration:** The best reusable abstraction is the segment-plus-array-role state: `S_i,j`, `A*`, `λ_min`, `λ_mout`, `λ_c`, `MemO_i`, `ComO_i`, and switch-count variables.
- **As mapper/scheduler:** The DP-over-segments plus MIP-per-segment strategy is the most direct reusable mechanism. It could be adapted as a mapper pass in a future CIM compiler, especially for reconfigurable memory/compute arrays.
- **As cost model:** The latency bottleneck model—compute capacity vs memory-feed-supported compute—and inter-segment store/switch/load cost terms could become backend cost-model plugins.
- **As backend:** The DMO `CM.switch(TOM/TOC, arrayaddr)` interface could be wrapped as a backend-independent mode-switch operation, but chip-specific ISA lowering would need to be supplied separately.
- **As benchmark:** The paper’s benchmark mix—MobileNet, ResNet, VGG, BERT, OPT, LLaMA 2, batch/sequence scaling—offers a useful comparison menu. Public benchmark scripts were not found.
- **As validation source:** Validation is simulator-backed with PyTorch functional comparison and a Dynaplasia-like hardware configuration. No chip-in-loop, RTL artifact, or public calibration package was found.

**Integration effort estimate: High.**  
Integration would be most direct through reimplementing DACO from the paper’s equations and Algorithm 1, then writing an adapter that extracts ONNX operator metadata and emits a serialized segment/allocation plan. The most valuable reusable boundary appears to be the allocation formulation; backend integration would require reconstructing or replacing the modified simulator and defining a concrete DMO trace format. Artifact absence raises the effort from medium to high.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **CIM-MLC** | Multi-level CIM compilation, hardware abstraction, scheduling, meta-operators | CMSwitch builds on CIM-MLC’s ecosystem and focuses on dual-mode compute/memory array allocation. CIM-MLC is the closest baseline and simulator/meta-operator reference. ([CIM-MLC](https://cimmlc.github.io/)) | Classify CMSwitch as a specialization/extension around mode-switchable arrays rather than a broad replacement for multi-level CIM abstraction. |
| **OCC** | Compiler stack for CIM with scheduling and mapping optimizations | OCC is described as MLIR-based and ISA-oriented, with operator mapping via tiling and loop unrolling; CMSwitch’s central object is array-mode allocation and segment transitions. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) | Good contrast between explicit compiler IR/ISA style and hardware-resource allocation style. |
| **PUMA** | CIM accelerator mapping, duplication, and pipelining | PUMA is used as a baseline emphasizing operator duplication and pipeline scheduling; CMSwitch adds dynamic compute/memory mode allocation to the mapping space. ([arXiv](https://arxiv.org/pdf/2502.17006v1)) | Useful baseline for separating conventional CIM scheduling from dual-mode resource reconfiguration. |
| **PIMCOMP** | Compilation for crossbar-based PIM/CIM DNN accelerators | PIMCOMP is a universal compilation framework for crossbar-based PIM DNN accelerators; CMSwitch is narrower but adds explicit switchable-array compute/memory roles. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) | Corpus distinction: crossbar mapping/scheduling vs dual-mode resource-state optimization. |
| **C4CAM** | Compiler support for in-memory accelerator mapping | C4CAM targets CAM-based in-memory accelerators, while CMSwitch targets dual-mode CIM arrays and DNN segment allocation. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) | Shows how first-class CIM objects differ: CAM lookup/match structures vs switchable compute/memory arrays. |
| **TC-CIM / polyhedral CIM compilation** | Loop/tensor scheduling for CIM | Tensor/polyhedral approaches foreground loop nests and tensor schedules; CMSwitch foregrounds per-array mode/resource binding. ([ar5iv](https://ar5iv.org/html/2502.17006v1)) | Useful for Axis B: loop/tensor-schedule IR versus hardware-resource IR. |

## 10. Corpus-ready final takeaway

- CMSwitch’s core contribution is making **array-level compute/memory mode selection** part of CIM compilation rather than treating CIM arrays as statically compute-mode resources.
- The strongest reusable stack layer is the **DACO mapper/scheduler**: DP network segmentation plus MIP resource allocation over dual-mode CIM arrays.
- The evidenced scope is **simulator-backed DNN inference** from ONNX-style graphs on a Dynaplasia-like dual-mode CIM target, with CNN and Transformer workloads using 8-bit weights and activations.
- The first-class CIM objects are **switchable arrays, array coordinates, compute/memory roles, input/output buffer roles, segment boundaries, switch overhead, and bandwidth/capacity parameters**.
- The hidden IR is the allocation state `S_i,j`, `A*`, `λ_min`, `λ_mout`, `λ_c`, `MemO_i`, `ComO_i`, and transition-cost terms; DMO meta-operators expose only the final mode-switch boundary.
- Artifact status: no public artifact found. Paper-level equations, algorithms, figures, and tables are auditable, but public code, configs, simulator patches, and reproduction scripts were not located.
- Integration would be most useful as **IR inspiration, mapper/scheduler logic, and cost-model structure**; direct reuse would require reimplementation.
- For value-trajectory IR research, CMSwitch is relevant as a **resource-mode trajectory** model, but trajectory-level rewrites would add explicit value identity, numeric-domain, bit-slice, partial-sum, sensing, reconstruction, and reduction-path metadata.
