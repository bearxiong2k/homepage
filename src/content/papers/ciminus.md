---
slug: ciminus
title: "CIMinus: Empowering Sparse DNN Workloads Modeling and Exploration on SRAM-Based CIM Architectures"
short_title: "CIMinus"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "IEEE Transactions on Computers"
authors_or_group: "Yingjie Qi, Jianlei Yang, Rubing Yang, Cenlin Duan, Xiaolin He, Ziyan He, Weitao Pan, Weisheng Zhao"
summary: >-
  **CIMinus** contributes a sparse-DNN modeling and exploration framework for digital SRAM-based compute-in-memory systems. Its central stack contribution is **FlexBlock**, a compositional sparsity abstraction that represents structurally constrained sparse weight matrices using FullBlock and IntraBlock patterns, coupled with a declarative interface for workload DAGs, hardware units, and mapping templates. The demonstrated flow starts from ONNX or manually described DNN workloads, applies or describes FlexBlock-compatible pruning masks, maps compressed/rearranged weights onto parameterized CIM macros, and estimates latency and energy through system-level/cycle-level modeling. The work is most relevant to CIM compiler/IR research as a **configuration-and-mapping boundary**: it shows how sparsity masks, compressed matrix layout, loopnest mapping, index-memory overhead, and macro organization can be named explicitly enough for exploration, even though the paper’s reusable endpoint is a simulator/cost-model report rather than a compiler IR, ISA, or synthesis backend. ([arXiv](https://arxiv.org/pdf/2511.16368v1))
links:
  paper: https://arxiv.org/pdf/2511.16368v1
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "sparse DNN inference"
  - "CNNs"
  - "ResNet50"
  - "ResNet18"
  - "VGG16"
  - "MobileNetV2"
  - "CIFAR-100"
  - "ImageNet"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A3, A5]
axis_B: [B1, B2, B3, B4, B7]
axis_C_first_class_objects:
  - "FlexBlock sparsity"
  - "FullBlock sparsity"
  - "IntraBlock sparsity"
  - "sparse masks"
  - "compressed/rearranged weight matrix"
  - "CIM array"
  - "sub-array"
  - "macro organization"
  - "pre-processing unit"
  - "post-processing unit"
  - "index unit"
  - "index memory"
  - "multiplexer-based routing"
  - "accumulator"
  - "shift-add unit"
  - "global/local buffer"
  - "input-sparsity profiling"
axis_D_rewrite_objects:
  - "sparsity mask"
  - "weight layout"
  - "compression orientation"
  - "data rearrangement"
  - "loopnest mapping"
  - "spatial/temporal binding"
  - "hardware mapping"
  - "macro organization"
  - "weight duplication"
  - "cost-model access state"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best classified as modeling/simulation framework plus sparse-CIM mapping abstraction."
  - "FlexBlock is the clearest reusable object for future compiler IR design."
  - "MappingTemplate acts as a de facto IR boundary across workload layout, compression, tiling, loop mapping, and hardware binding."
  - "Validated against reported MARS and SDP results, with paper-reported 5.27% speedup/energy-saving error margin."
  - "No public CIMinus artifact located; nearby public CIMFlow artifact should be treated as a separate stack unless authors later connect it to CIMinus."
takeaways: []
---

# CIMinus — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 — Simulator & cost model** | CIMinus is introduced as a cost-modeling framework for sparse DNN workloads on SRAM-based CIM, producing latency and energy estimates from workload, hardware, and mapping descriptions. The paper explicitly scopes the tool for system-level evaluation and exploration rather than accelerator implementation. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Secondary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework; A5 — narrow end-to-end co-design** | The tool includes mapping templates, loopnest-based spatial/temporal mapping, compression/rearrangement, and use-case exploration over sparsity and macro organization. It also includes a pruning-to-evaluation workflow, but the demonstrated end-to-end path terminates in simulator estimates rather than generated hardware/software artifacts. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B2 Graph-as-IR; B3 Loop/tensor-schedule IR; B4 Hardware-resource IR; partial B7 Runtime-state abstraction** | CIMinus represents DNNs as DAGs, hardware as compute/memory unit descriptions, and mapping as a template containing flattening, compression orientation, tiling, loop permutation, and spatial/temporal binding. Input sparsity is handled by profiling activations to estimate skippable bit-serial work, giving a limited runtime-state flavor. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| First-class CIM objects, Axis C | **FlexBlock sparsity patterns, sparse masks, CIM array/sub-array/macro hierarchy, compute/memory units, index memories, input-sparsity detection, indexing muxes, accumulators, shift-add units, loopnest mapping, compressed/rearranged weight matrices** | The paper names FullBlock/IntraBlock/FlexBlock; exposes compute and memory units including CIM arrays, preprocessors, index units, adders, shift-adders, accumulators, buffers, and index memories; and makes compression/rearrangement part of mapping. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Rewrite object, Axis D | **Sparsity mask; weight layout; hardware mapping; loopnest mapping; macro organization; cost-model access/latency state** | Transformations include pruning-mask generation, 3D-to-2D flattening, row/column compression, padding/slicing-based rearrangement, spatial/temporal loop mapping, operation-to-unit mapping, and weight duplication versus spatial mapping. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `sparse-DNN`, `cost-model`, `cycle-level-simulation`, `mapping-exploration`, `config-as-IR`, `sparsity-abstraction`, `FlexBlock`, `pruning-workflow` | Tags reflect the demonstrated stack slice: sparse DNN modeling and exploration on digital SRAM CIM systems. |
| Closest comparison baselines | **MARS, SDP, DNN+NeuroSim, MNSIM 2.0, ZigZag-IMC, CiMLoop, CIMFlow** | MARS and SDP are validation targets and sparse digital SRAM-CIM design references; DNN+NeuroSim, MNSIM, ZigZag-IMC, and CiMLoop are nearby modeling frameworks; CIMFlow is a nearby same-lab public compiler/simulator stack with ISA, MLIR compiler, and SystemC simulator. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |

## 2. One-paragraph public summary

**CIMinus** contributes a sparse-DNN modeling and exploration framework for digital SRAM-based compute-in-memory systems. Its central stack contribution is **FlexBlock**, a compositional sparsity abstraction that represents structurally constrained sparse weight matrices using FullBlock and IntraBlock patterns, coupled with a declarative interface for workload DAGs, hardware units, and mapping templates. The demonstrated flow starts from ONNX or manually described DNN workloads, applies or describes FlexBlock-compatible pruning masks, maps compressed/rearranged weights onto parameterized CIM macros, and estimates latency and energy through system-level/cycle-level modeling. The work is most relevant to CIM compiler/IR research as a **configuration-and-mapping boundary**: it shows how sparsity masks, compressed matrix layout, loopnest mapping, index-memory overhead, and macro organization can be named explicitly enough for exploration, even though the paper’s reusable endpoint is a simulator/cost-model report rather than a compiler IR, ISA, or synthesis backend. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CIMinus is a cost-modeling framework for sparse DNN workloads on SRAM-based CIM architectures. | Abstract / Introduction / Sec. IV-A | Equation; experiment; paper-only framework description | The paper gives latency and energy equations, unit-level energy aggregation, cycle-level access counting, and validation against reported MARS and SDP results. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Demonstrated for digital SRAM-CIM sparse DNN evaluation using reported accelerator configurations and paper-level simulation assumptions. Artifact-level confirmation would require public simulator code or configs. |
| FlexBlock is an expressive sparsity abstraction for structurally constrained CIM sparse weights. | Sec. III-C / III-D; Fig. 3; Table II | Definition; equation-like formalism; experiment | FullBlock and IntraBlock are formally defined over 2D weight matrices; Table II maps row-wise, row-block, column-wise, channel-wise, and hybrid sparsity patterns into FlexBlock forms. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | The reusable abstraction is clearest for static weight sparsity after reshaping DNN filters into 2D matrices. The paper constrains efficient compositions to at most two patterns and imposes mapping-oriented conditions on block sizes and IntraBlock shape. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| CIMinus decouples workload, hardware, and mapping descriptions. | Sec. IV-B / IV-C; Fig. 4 / Fig. 5 | Documentation-like paper interface; code snippets in figures | The interface separates workload DAG / sparsity description, hardware compute-memory unit templates, and mapping templates containing mapping dictionary, tiling, flattening, loop permutation, compression orientation, and rearrangement method. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Demonstrated in paper examples. A single external schema or serialized IR was not found in checked public sources. |
| CIMinus includes a pruning workflow aligned with FlexBlock. | Sec. IV-D | Equation; algorithmic description; experiment | The pruning workflow computes block/pattern loss using criteria such as L1 or L2 norm, selects blocks/patterns with lowest loss, generates masks, applies them to weight matrices, and compares resulting model accuracies against reported sparse DNN results. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Demonstrated for static weight pruning and mask generation over selected CNN workloads. Dynamic activation sparsity is profiled for skippable bit-serial computation rather than rewritten as a persistent runtime IR object. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| CIMinus accurately estimates sparse-CIM speedups and energy savings within a 5.27% error margin. | Abstract / Introduction / Sec. VI-A; Fig. 6 | Experiment | Validation compares estimated speedups, energy savings, power breakdown, and model accuracy with reported MARS and SDP results; the paper reports all speedup/energy-saving data points within 5.27% error. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | The validation is against published accelerator results, using configurations “whenever possible.” The paper notes that undisclosed parameters such as buffer bandwidth can create modeling differences, and that the tool operates at a higher abstraction level than circuit-level simulation. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| CIMinus supports rapid design iteration. | Sec. VI-B; Fig. 7 | Experiment | Runtime analysis covers MobileNetV2, ResNet50, and VGG16, hybrid and row-block sparsity, sparsity ratios 0.5–0.9, and macro counts 4–64; the paper reports runtimes under 100 seconds for the tested configurations, dominated by mapping and cycle-level simulation. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Demonstrated on the authors’ evaluation setup and selected CNN models. Independent reproducibility depends on access to simulator implementation, model/config files, and scripts. |
| CIMinus can explore sparsity-pattern and mapping-strategy trade-offs. | Sec. VII; Figs. 8–12 | Experiment; case study | The paper evaluates speedup, energy saving, and accuracy for several FlexBlock patterns; explores input sparsity; compares macro organizations, spatial mapping, weight duplication, and weight rearrangement. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Demonstrated for CNN inference workloads on a common digital SRAM-CIM configuration with 8-bit weights/features, 1024×32 macro arrays, 32×32 sub-arrays, and selected macro organizations. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX model import or manual workload description. The paper represents workloads as a DAG whose nodes are data and operations and whose edges are input/output dependencies. FlexBlock sparsity metadata is attached to weights or generated as masks. Serialized artifact: paper-level code examples; no public schema found.

Middle representation:
  Combination of workload DAG, FlexBlock sparsity description, hardware unit descriptions, and mapping template. This is closer to config-as-IR plus graph-as-IR than to a compiler IR dialect. Inspectable/documented: partially, through Fig. 4 and Fig. 5 code examples. Reusable: conceptually clear; public implementation not found.

Mapping or scheduling state:
  MappingTemplate with tiling size, filter flattening sequence, loop permutation, compression orientation, rearrangement method, and mapping_dict from operation classes to hardware units. It also uses a multi-level loopnest with temporal and spatial loops. Serialized/inspectable: paper example; artifact-level serialization unknown.

Hardware abstraction:
  Parameterized compute units and memory units: CIM arrays, sub-arrays, preprocessors, adders, shift-adders, accumulators, index units, global/local buffers, FIFOs, and index memories. Users provide dimensions, organization, location, connection, dynamic energy per access, and static energy per cycle. Serialized/inspectable: paper example; no public config files found.

Backend / simulator / codegen:
  Cycle-level simulation and cost modeling. It determines access counts and latency internally, combines per-access/per-cycle energy parameters, models sparsity-support overhead, and returns latency and energy breakdown. It is not presented as a code generator or instruction-stream backend.

Output artifact:
  Pre-check report on verification failures, model accuracy, overall latency, detailed energy breakdown, speedup/energy-saving estimates, runtime/scalability results. Public output files or reproducible figure-generation scripts were not found.

Evaluation loop:
  User varies sparsity pattern, pruning strategy, mapping template, macro organization, and hardware parameters; CIMinus estimates accuracy, latency, energy, array utilization, and component-level overhead. Demonstrated through validation against MARS and SDP and two use cases: sparsity exploitation and mapping strategy exploration.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **FlexBlock sparsity descriptors + sparse masks + compressed/rearranged 2D weight matrices + loopnest mapping template + hardware unit/resource graph + internally computed access/latency counters**. The paper foregrounds FlexBlock and the declarative interface, while the reusable semantics are most visible in the mapping template fields—flattening order, compression orientation, tiling, loop permutation, spatial binding, and rearrangement method—and in the cost model’s access-count/critical-path state. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
CIMinus’s owned stack slice is the path from sparse-DNN/hardware/mapping description to latency and energy estimation. The paper states that the framework aggregates unit access counts with per-access energy and determines the critical path for latency, with access counts and latency determined internally by cycle-level simulation. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
The mapping slice is substantial: sparse weights are flattened, compressed, padded or sliced, assigned to destinations, and mapped through loopnest-based spatial/temporal scheduling. The demonstrated mapping studies compare spatial mapping, weight duplication, macro organizations, and weight rearrangement. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**Tertiary: A5 — Narrow end-to-end co-design.**  
The flow spans model pruning, mask generation, workload/hardware/mapping specification, pre-simulation analysis, cost modeling, and accuracy/latency/energy reports. The endpoint remains system-level evaluation, and the paper explicitly positions CIMinus as complementing HLS and component-design tools rather than generating accelerator components. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is a set of declarative descriptions: workload, hardware unit, and mapping method. Decisions made here include hardware unit dimensions/organization/energy, workload graph structure, sparsity pattern, mapping destination, tiling, compression, flattening, loop order, and rearrangement. A single public serialized artifact that upstream passes could read, verify, and rewrite was not found; the paper evidence is in API-style examples and framework diagrams. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**B2 — Graph-as-IR.**  
The workload is a DAG: data and operations are nodes, edges are input/output relationships, and ONNX import can populate operation dimensions and weight/feature data. The graph carries enough structure for operator mapping and dependency checking, but the paper’s compiler-relevant transformations occur mostly at sparse weight layout and mapping-template level rather than graph rewriting. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**B3 — Loop / tensor-schedule IR.**  
MVM operations use a multi-level loopnest whose loops correspond to dimensions in reshaped weight, input feature, or tiled submatrices. The mapping can mark loops as temporal or spatial and bind spatial loops to CIM array or organization dimensions. This is the clearest schedule-like representation in the paper. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**B4 — Hardware-resource IR.**  
Hardware is represented as compute and memory unit templates. CIM arrays, preprocessors, index units, adders, shift-adders, accumulators, buffers, FIFOs, and index memories are named as resource objects with dimensions, energy, location, organization, and connectivity. Decisions embedded in the simulator include unit access estimation, resource-count inference, pipeline overlap, and critical-path determination. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

**Partial B7 — Runtime-state abstraction.**  
Input sparsity is dynamic: CIMinus profiles activation samples to estimate skippable bit-serial computations and models zero detection/skipping logic. This gives a limited runtime-state object—the skippable ratio / bit-mask behavior—but the demonstrated representation centers on static profiling and cost estimation rather than a persistent runtime state table. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class / parameter** | CIM arrays, sub-arrays, macros, macro organization, unit location, and organization dimensions are exposed in hardware descriptions and examples. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Bit-slicing / bit significance | **Parameter / costed behavior** | Computation is described as bit-serial: input values are decomposed into bits and fed sequentially; input sparsity skips zero bits in activations. Precision is evaluated at 8-bit weights/features in the use cases. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| ADC/DAC precision or sensing | **Not applicable for demonstrated digital SRAM-CIM path** | The paper contrasts analog CIM ADC overhead with digital CIM, and frames CIMinus around SRAM-based digital CIM architectures. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Analog-to-digital or domain transition | **Not applicable / background only** | Analog MAC and ADC appear in background motivation; the modeled target is digital MAC logic integrated in SRAM cells. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Peripheral circuits as path nodes | **First-class / costed** | Pre-processing, post-processing, index units, adders, shift-adders, accumulators, buffers, and index memories are named; their energy/access behavior is included in modeling. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Partial-sum accumulation path | **First-class / costed** | The paper discusses bitline-direction accumulation, additional accumulators for misaligned partial sums, and accumulator units in hardware descriptions. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Reconstruction / shift-add tree | **Parameter / costed component** | Shift-adders are included as compute units in the macro support path; the paper treats them as units in hardware/cost modeling rather than as a separately rewritable numeric reconstruction IR. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for sparsity masks; parameter/profile for input sparsity; N/A for KV cache/batching** | FlexBlock descriptions generate sparse data masks; input sparsity is profiled to estimate skippable computations; no KV-cache or dynamic batching object is present in the demonstrated CNN setting. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |
| Value trajectory / flow path | **Approximated through mapping and cost state** | The framework names DAG dependencies, operation destinations, data reshaping, spatial/temporal loops, buffers, and units, but value identity across reconstruction, reduction, storage, and downstream operations is not the central first-class object. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) |

### 5.4 Axis D — rewrite object

CIMinus rewrites or transforms:

- **Sparsity masks:** block-level and intra-block masks generated from FlexBlock descriptors and pruning criteria.
- **Weight layout:** DNN filters are flattened into 2D matrices, compressed row-wise or column-wise, padded or sliced, and rearranged to reduce raggedness.
- **Hardware mapping:** operations are assigned to CIM arrays or post-processing units; macro organization changes available parallelism.
- **Loopnest mapping:** loops are marked temporal or spatial and spatially bound to CIM array or organization dimensions.
- **Mapping strategy:** spatial mapping, weight duplication, and weight rearrangement are evaluated as alternative mapping choices.
- **Cost-model state:** unit access counts, sparsity-support operations, and critical-path pipeline state are derived internally for latency/energy reporting.

Legal transformations include pruning block/element sets under FullBlock/IntraBlock rules, composing up to two FlexBlock patterns, changing flattening order, selecting row/column compression orientation, changing tile size, padding/slicing compressed matrices, changing loop order and spatial/temporal loop binding, and choosing macro organizations and duplication strategies. The main equivalences exploited are sparse-mask equivalence after structured pruning, layout-equivalent compressed matrices with padding/slicing, and loopnest mapping alternatives that preserve MVM semantics. The representation must preserve source operation dimensions, weight-index alignment, input routing indices, block/element mask semantics, partial-sum alignment, and data dependencies across the workload DAG. The representation is especially well suited to structured sparsity/layout/mapping exploration; expressing trajectory-level transformations such as retiming reconstruction across operators would likely require an additional abstraction for value identity, numeric stage, and accumulation/reconstruction path.

## 6. Technical mechanism reading

### 6.1 FlexBlock: sparsity as the central reusable abstraction

CIMinus begins from a CIM-specific observation: sparse weights must be regular enough to fit rigid array structures. The paper describes CIM weights as reshaped into 2D matrices and stored stationarily; inputs are bit-serial; row activation requires row-wise input-index alignment; bitline accumulation requires output-index alignment; and arrays often cover only fractions of DNN layers, motivating multi-macro mapping. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

FlexBlock represents a 2D weight matrix as a composition of block-based sparsity patterns. **FullBlock** removes whole blocks of size `m × n`; its non-zero block count is determined by sparsity ratio, and non-zero block indices identify the top-left corners retained in the matrix. **IntraBlock** keeps a fixed number of non-zero elements inside each block according to a pattern set of binary masks. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

The key compiler-like idea is that sparsity is not just a numerical property; it is a **layout-and-routing contract**. FullBlock needs block indices to route inputs and accumulate partial sums, while IntraBlock needs finer-grained indexing and mux-based input selection because compressed elements from multiple rows can share an array row. The paper restricts efficient FlexBlock compositions to practical forms: FullBlock block sizes should align with hardware dimensions, IntraBlock patterns should be column-wise one-dimensional blocks, and CIMinus limits pattern composition to two patterns as a balance between expressiveness and routing/indexing complexity. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

### 6.2 Programming interface: workload, hardware, and mapping as separate descriptions

The workload interface uses either ONNX import or manual DAG construction. The DAG names data and operation nodes, connects dependencies, and attaches FlexBlock descriptions to weights. For user-defined workloads, the framework can auto-generate randomized sparsity masks from the sparsity description. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

The hardware interface names compute units and memory units. Compute units include CIM arrays, preprocessors, adders, shift-adders, accumulators, and index units; memory units include global buffers, local buffers, FIFOs, and index memories. Users provide unit dimension, organization, energy, connection, and location. CIMinus then infers required unit counts from array size, unit size, and organization. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

The mapping interface has two important layers. First, **data reshaping** flattens 3D filters into 2D matrices, chooses row-wise or column-wise compression, pads compressed dimensions to tile sizes, and optionally rearranges ragged matrices by padding or slicing. Second, **operation mapping** sends MVM operations such as Conv and FC to CIM macros, sends other operations to post-processing, and represents MVM as a multi-level loopnest with temporal and spatial loops. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

### 6.3 Pruning workflow: mask generation under hardware-facing sparsity constraints

The pruning workflow takes FlexBlock block configurations and pruning criteria such as L1 or L2 norm. For coarse-grained pruning, it computes a loss value over every candidate block; for fine-grained pruning, it computes a loss value for each candidate intra-block pattern over elements that would be pruned. Blocks or patterns with lowest loss are selected; masks are generated layer by layer and applied to weights. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

Compiler/IR reading: this is not a general DNN optimizer; it is a **mask-generation pass constrained by a hardware-mappable sparsity type**. The pass output is a sparse model plus metadata that the simulator can use to determine index storage, routing, mux operations, and partial-sum accumulation overhead.

### 6.4 Cost model: pipeline latency, unit energy, and sparsity overhead

The latency model views execution as load, compute, and write-back stages in a pipeline. Total latency combines initial loading, intermediate step latency under possible overlap, final compute, and final write-back. The function for intermediate pipeline steps accounts for load/compute bottlenecks and buffer constraints that may prevent overlap. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

The energy model sums compute-unit energy, memory read/write energy, and static energy. Compute energy is per-access energy times access count; memory energy is read/write energy times read/write counts; static energy is static power times total latency. Users supply per-access/per-cycle parameters, while CIMinus determines access counts and latency through cycle-level simulation. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

Sparsity overhead is explicitly costed. FlexBlock requires block-index storage, and IntraBlock additionally requires element-index storage. The simulator also tracks index-memory reads, mux operations for input selection, additional accumulation for misaligned partial results, and zero detection/skipping for input sparsity. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

### 6.5 Evaluation setting

Validation uses reported MARS and SDP digital SRAM-based CIM designs. Table I lists different macro sizes, sub-array sizes, macro organizations, buffer configurations, sparsity patterns, and evaluation scopes; the validation uses VGG16, ResNet18, and ResNet50 with CIFAR100 for MARS and ImageNet for SDP. The paper reports that estimated speedups and energy savings fall within a 5.27% error margin of reported results. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

The exploration use cases use 8-bit weights and features, 1024×32 arrays with 32×32 sub-arrays, weight-stationary mapping, a 4-macro architecture for sparsity exploration, and a 16-macro architecture for mapping exploration over organizations such as 8×2, 4×4, and 2×8. ([arXiv](https://arxiv.org/pdf/2511.16368v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — FlexBlock is a sparsity type system for mapping legality

- **Observation:** FlexBlock does more than classify sparsity density. It constrains the shape, order, and composition of pruning patterns so compressed matrices remain mappable onto CIM arrays with predictable indexing and accumulation behavior. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** A future compiler can treat sparsity not as an untyped mask but as a typed layout property: FullBlock and IntraBlock carry different legality conditions, indexing needs, mux costs, and accumulation paths.  
- **Reusable lesson:** Sparse-CIM IRs should attach sparsity pattern type, block shape, nonzero ratio, pattern set, compression orientation, and required routing/index metadata as first-class layout attributes.

### Insight 2 — The mapping template is the de facto IR boundary

- **Observation:** The mapping template combines operation destination, tiling, flattening order, loop permutation, compression orientation, and rearrangement. Those fields determine how a DNN operator becomes compressed matrix tiles and spatial/temporal CIM activity. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** This is the point where graph semantics, sparse tensor layout, and hardware resource binding meet.  
- **Reusable lesson:** A future stack could formalize this mapping template as an inspectable IR object, with verifier rules for tile alignment, row/column compression validity, partial-sum alignment, and macro-dimension binding.

### Insight 3 — Sparsity support is modeled as concrete hardware work

- **Observation:** CIMinus costs index memory accesses, mux-based input selection, extra accumulation for misaligned partial sums, and zero detection/skipping logic. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** Sparse acceleration benefits can be offset by peripheral and buffer overhead; an IR that only counts skipped MACs would mis-rank mappings.  
- **Reusable lesson:** Sparse-CIM compiler cost interfaces should expose index traffic, routing fan-in, accumulation repair, and buffer pressure as separate cost categories.

### Insight 4 — Input sparsity is treated differently from weight sparsity

- **Observation:** Weight sparsity is represented statically through FlexBlock and masks; input sparsity is profiled dynamically through activation samples to estimate skippable bit-serial computations. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** Static and dynamic sparsity need different IR objects: one can be layout metadata; the other may require runtime profiling summaries, guard conditions, or adaptive execution state.  
- **Reusable lesson:** A static-plus-runtime CIM IR could represent weight masks as layout types and activation sparsity as profiled runtime state with confidence intervals, dataset provenance, and per-layer bit-position statistics.

### Insight 5 — The validation boundary is system-level and literature-calibrated

- **Observation:** CIMinus validates against MARS and SDP using reported configurations where possible, PCACTI for buffers, a referenced CIM-array power model, and synthesized Verilog for remaining digital modules. The paper explicitly notes that undisclosed design parameters can cause modeling differences. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** The backend contract is a calibrated cost interface, not a physical implementation interface.  
- **Reusable lesson:** Corpus entries should distinguish “validated cost model” from “runnable backend” and record calibration sources separately from compiler abstractions.

### Insight 6 — Array utilization is not a sufficient optimization objective

- **Observation:** Weight duplication and rearrangement can increase utilization, but Fig. 12 shows that macro energy gains may be offset by buffer access overhead. ([arXiv](https://arxiv.org/pdf/2511.16368v1))  
- **Why it matters for CIM compiler/IR work:** Mapping objectives should rank end-to-end energy/latency, not just macro occupancy.  
- **Reusable lesson:** A CIM mapper should keep macro utilization, buffer traffic, sparse-index traffic, and peripheral activity as separate objective terms.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **Checked sources:** arXiv abstract/PDF/HTML, IEEE/DOI-linked public metadata, CI-Lab news and project pages, web search, GitHub search.
- **What the artifact contains:** N/A.
- **What the artifact appears to omit:** Public source code, runnable simulator, workload/config files, pruning scripts, mapping templates, calibration tables, and figure reproduction scripts were not located.
- **Minimal command or workflow:** Unknown / not found.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper describes enough modeling structure and evaluation parameters to understand the workflow, but public scripts/configs were not found.

Important distinction: a **related** public CIMFlow repository from the same lab exists and exposes an MLIR/ISA/SystemC compiler-simulator stack, but the checked sources do not identify it as a CIMinus artifact. ([GitHub](https://github.com/BUAA-CI-LAB/CIMFlow))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | ONNX import and manual DAG construction are described in the paper; public schema/config files were not found. |
| Intermediate representation serialized | Unknown | The paper shows API-style objects and mapping templates, but no public serialized IR was found. |
| Mapping decisions inspectable | Partial | Mapping fields are shown in Fig. 5 and described in Sec. IV-C; artifact-level inspection is unavailable. |
| Schedule inspectable | Partial | Multi-level loopnest and spatial/temporal loop binding are described; no emitted schedule file found. |
| Hardware config explicit | Partial | Hardware unit parameters and validation configurations are described; public config files not found. |
| Precision / bit-slice assumptions explicit | Partial | 8-bit weights/features are stated for exploration; bit-serial processing and input-bit skipping are described. |
| Cost model inspectable | Yes, paper-level | Latency, energy, and index-overhead equations are included. |
| Simulator backend documented | Partial | Cycle-level simulation and access-count estimation are described, but simulator implementation was not found. |
| Generated code / instruction stream inspectable | N/A | The demonstrated output is cost-model reports, not generated code or ISA. |
| Provenance from source op to backend action | Partial | DAG-to-operation mapping and MVM loopnest are described; no source-to-trace artifact was found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | Paper reports PCACTI, PTPX, Design Compiler, and a referenced CIM-array power model; detailed calibration files were not found. |

### 8.3 Integration helper

- **As frontend:** CIMinus’s ONNX/manual DAG interface is useful as a frontend pattern, but reuse would require reconstructing or reimplementing the parser/interface because no public artifact was found.
- **As IR inspiration:** FlexBlock is the strongest reusable IR idea. A future IR could borrow `FullBlock`, `IntraBlock`, block shape, sparsity ratio, pattern set, composition order, compression orientation, and mask provenance.
- **As mapper/scheduler:** The mapping template is valuable for sparse CIM mapping: flattening sequence, tiling size, loop permutation, spatial/temporal binding, operation destination, compression orientation, and rearrangement method could be adapted into a formal mapping IR.
- **As cost model:** The energy/latency decomposition is reusable as a backend plugin interface: per-unit access energy, memory read/write energy, static power, pipeline overlap, index-memory traffic, mux cost, extra accumulation, and input-sparsity skipping.
- **As backend:** Direct backend reuse is unclear because no simulator artifact was found. A wrapper would likely need to reimplement the cost equations and access-count logic from the paper.
- **As benchmark:** The paper’s validation and exploration settings are useful benchmark references: MARS, SDP, ResNet50, ResNet18, VGG16, MobileNetV2, CIFAR100, ImageNet, FlexBlock pattern table, 4-/16-macro studies, and mapping alternatives.
- **As validation source:** Validation is literature-calibrated against reported sparse SRAM-CIM accelerator results, with buffers from PCACTI, digital modules synthesized via Design Compiler/PTPX, and a cited CIM-array power model. It is useful as a system-level calibration reference, not as a chip-in-loop or public RTL validation source.

**Integration effort estimate: Medium–High.**  
Integration would be most direct through **IR inspiration and cost-model reimplementation**, because the paper provides clear object boundaries and equations. Reuse would benefit from a small adapter that extracts FlexBlock metadata, compressed matrix layout, loopnest binding, and hardware-unit parameters from an upstream compiler IR. Effort rises because the simulator implementation, configs, and reproduction scripts were not found publicly, so backend behavior would need to be reconstructed from the paper.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **MARS** | Sparse digital SRAM-CIM exploitation and array-aligned sparse mapping | CIMinus uses MARS as a validation target and generalizes sparse-pattern exploration through FlexBlock rather than presenting a single accelerator design. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Classify MARS as accelerator/co-design evidence; classify CIMinus as sparse-CIM modeling and mapping abstraction. |
| **SDP** | Structured sparse digital SRAM-CIM with routing/index support | CIMinus models SDP’s hybrid IntraBlock + FullBlock style and validates speedup/energy/accuracy against reported SDP results. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | SDP is a hardware/dataflow baseline; CIMinus is a framework that turns such sparsity patterns into reusable exploration objects. |
| **DNN+NeuroSim** | DNN-to-CIM evaluation and hardware modeling | The paper positions DNN+NeuroSim as an end-to-end benchmarking framework with circuit-level hardware models and nonideality trade-offs; CIMinus focuses on sparse digital CIM patterns, indexing, routing, and mapping overhead. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Separate device/circuit nonideality modeling from sparse layout/mapping cost modeling. |
| **MNSIM 2.0** | Behavior-level CIM modeling and training/quantization flow | MNSIM is described as a unified array model for analog/digital CIM with specialized training/quantization, whereas CIMinus adds sparse pattern abstraction and sparse-support overhead modeling. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Useful contrast between array-model abstraction and sparsity-layout abstraction. |
| **ZigZag-IMC** | System-level exploration with analytical CIM performance model | ZigZag-IMC integrates analog/digital IMC models into a DSE framework; CIMinus specializes in sparse DNN workloads on digital SRAM CIM and explicitly models compression, indexing, and routing overhead. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Distinguish dense IMC dataflow exploration from sparse-CIM mapping semantics. |
| **CiMLoop** | Flexible hardware specification and fast energy modeling | CiMLoop is presented as efficient system-level modeling with flexible hardware specs and statistical energy modeling; CIMinus’s differentiator is FlexBlock plus sparse workload/mapping support. ([arXiv](https://arxiv.org/pdf/2511.16368v1)) | Pair CiMLoop with CIMinus when comparing cost-model frameworks, but tag CIMinus for sparse-CIM first-class objects. |
| **CIMFlow** | Digital CIM compilation and simulation infrastructure | CIMFlow exposes an ISA, MLIR-based compiler, and SystemC simulator; CIMinus exposes sparse-DNN cost modeling and mapping abstractions without a found public compiler artifact. ([cimflow.org](https://www.cimflow.org/)) | CIMFlow belongs closer to explicit compiler/ISA stack; CIMinus belongs closer to sparse mapping/cost-model abstraction. |

## 10. Corpus-ready final takeaway

- CIMinus’s main contribution is a **sparse-DNN cost-modeling and mapping-exploration framework** for digital SRAM-based CIM.
- The strongest reusable abstraction is **FlexBlock**, which makes structured sparsity patterns first-class through FullBlock, IntraBlock, block sizes, sparsity ratios, pattern sets, and composition order.
- The demonstrated stack slice runs from ONNX/manual workload DAG plus hardware/mapping descriptions to **latency, energy, accuracy, and utilization estimates**, not to generated code or accelerator implementation.
- The hidden IR is the combination of **FlexBlock metadata, sparse masks, compressed/rearranged 2D weights, loopnest mapping templates, hardware-unit descriptions, and simulator access-count state**.
- CIM-specific first-class objects include CIM arrays/sub-arrays/macros, preprocessors, index units, index memories, adders, shift-adders, accumulators, buffers, sparse masks, and input-sparsity profiling.
- Evidence is strongest for sparse-DNN cost modeling, mapping exploration, pruning-mask generation, and validation against reported MARS and SDP results.
- **Artifact status: no public artifact found.**
- For a value-trajectory CIM IR, CIMinus offers useful layout/mapping/cost ingredients; trajectory-level rewrites would add explicit value identity, bit significance, numeric stage, accumulation path, reconstruction state, and storage/domain transition metadata.
