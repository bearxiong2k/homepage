---
slug: miredo
title: "MIREDO: MIP-Driven Resource-Efficient Dataflow Optimization for Computing-in-Memory Accelerator"
short_title: "MIREDO"
subtitle: "Scoped CIM stack note"
year: 2026
publication:
  venue: "ASP-DAC 2026"
  type: "conference"
  doi: "10.48550/arXiv.2510.26463"
  url: "https://doi.org/10.48550/arXiv.2510.26463"
authors:
  - "Xiaolin He"
  - "Cenlin Duan"
  - "Yingjie Qi"
  - "Xiao Ma"
  - "Jianlei Yang"
author_note: "Beihang University CI-Lab"
bibtex: |
  @inproceedings{he2026miredo,
    author = {He, Xiaolin and Duan, Cenlin and Qi, Yingjie and Ma, Xiao and Yang, Jianlei},
    title = {MIREDO: MIP-Driven Resource-Efficient Dataflow Optimization for Computing-in-Memory Accelerator},
    booktitle = {ASP-DAC 2026},
    year = {2026},
    doi = {10.48550/arXiv.2510.26463},
    eprint = {2510.26463},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2510.26463}
  }
citation_source: https://arxiv.org/abs/2510.26463
summary: >-
  **MIREDO** is best read as a CIM dataflow mapping framework that makes loop-factor placement, operand-specific memory hierarchy use, transfer paths, and buffering decisions explicit inside a Mixed-Integer Programming formulation. The paper’s strongest contribution is not a public compiler IR or instruction stack, but a stall-aware analytical model for SRAM-CIM accelerator mapping: it captures memory-capacity constraints, bus-width-derived transfer latency, single-versus-double buffering, and recursive loop-level latency to select a dataflow for DNN inference. The demonstrated workload setting is primarily INT8 CNN inference, with ResNet-18/ImageNet used as the baseline case and additional DNN/hardware sweeps reported through simulator-backed experiments. For CIM compiler/IR research, MIREDO is valuable as evidence that a useful “hidden IR” for CIM mapping can be a structured optimization state: constants, binary variables, enumerated data-size candidates, loop-factor placements, memory-level bindings, and latency recurrences. ([arXiv](https://arxiv.org/pdf/2510.26463))
links:
  paper: https://arxiv.org/pdf/2510.26463
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
  - "analog-CIM"
  - "hybrid"
workloads:
  - "INT8 CNN inference"
  - "ResNet-18 on ImageNet"
  - "representative DNN model sweeps"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A5]
axis_B: [B3, B4, B1]
axis_C_first_class_objects:
  - "hierarchical_CIM_accelerator"
  - "CIM_core"
  - "CIM_macro"
  - "memory_hierarchy_level"
  - "operand_type_input_weight_output"
  - "loop_tiling_factor"
  - "spatial_unrolling_axis"
  - "temporal_loop_slot"
  - "operand_specific_memory_mapping"
  - "direct_transfer_path"
  - "single_double_buffer_mode"
  - "bus_width"
  - "memory_capacity"
  - "MVM_latency"
  - "recursive_latency_state"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "tensor_schedule"
  - "loop_factor_placement"
  - "array_binding"
  - "operand_memory_layout"
  - "transfer_path"
  - "buffering_mode"
artifact:
  status: "no_public_artifact_found"
  url: 
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark_partial"
reproducibility_level: low
notes:
  - "Best understood as a mapper/scheduler/cost-model contribution."
  - "Effective IR is the MIP state, not a public serialized dialect."
  - "ONNX frontend and complete-dataflow output are claimed; schemas and artifacts were not found."
  - "Transfer-path and buffering variables are useful ingredients for a future value-trajectory CIM IR."
takeaways: []
---

# MIREDO — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework**; secondary **A2 — Simulator & cost model** | MIREDO formulates CIM dataflow optimization as a Mixed-Integer Programming problem whose decision variables encode spatial/temporal loop placement, operand-specific memory placement, transfer paths, and buffering choices. The strongest evidenced layer is mapper plus analytical latency model, validated against a custom simulator. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Middle-layer style, Axis B | **B3 Loop / tensor-schedule IR**, **B4 Hardware-resource IR**, partial **B1 Config-as-IR** | DNN operators are represented as loop nests; hardware resources appear as memory hierarchy levels, capacities, bus widths, unrolling axes, transfer paths, and single/double-buffer state. There is no public serialized IR artifact found; the effective middle state is the MIP variable/constant system. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| First-class CIM objects, Axis C | CIM macro/core/accelerator hierarchy; memory levels; operand classes input/weight/output; loop tiling factors; spatial unrolling axes; memory capacity and bus width; direct transfer paths; single/double-buffer decisions; MVM latency; partial-sum/output transfer cases | The paper names and models these objects in the architecture abstraction, notation table, constraints, and latency model. ADC/DAC appear in the macro diagram, but the MIP evidence centers on bandwidth, capacity, transfer, buffering, and MVM latency rather than ADC/DAC as rewriteable objects. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Rewrite object, Axis D | **Hardware mapping / tensor schedule / array binding / memory-level mapping / buffering mode / transfer path** | The tool rewrites loop-factor placement into temporal loop slots and spatial unrolling dimensions, chooses operand-specific memory levels, chooses bypass/transfer paths, and chooses buffering modes. It does not expose an instruction stream or standalone dialect in the checked public sources. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Best corpus tags | `compiler-mapping`, `MIP-optimization`, `SRAM-CIM`, `DNN-inference`, `loop-nest-mapping`, `dataflow-DSE`, `stall-aware-cost-model`, `memory-hierarchy`, `buffering`, `ONNX-frontend-claim` | Tags reflect the paper’s actual optimization object and demonstrated evaluation setup. |
| Closest comparison baselines | **CoSA**, **ZigZag / ZigZag-IMC**, **CiMLoop**, **SPCIM**, **NeuroSpector**, **PIMCOMP** | CoSA is closest in constrained-optimization style; ZigZag/CiMLoop are closest in architecture-mapping and CIM modeling; SPCIM is close in spatial/temporal multi-macro CIM utilization; NeuroSpector is close as dataflow scheduling analysis; PIMCOMP is close as a PIM/CIM compiler-flow reference. ([arXiv](https://arxiv.org/pdf/2510.26463)) |

## 2. One-paragraph public summary

**MIREDO** is best read as a CIM dataflow mapping framework that makes loop-factor placement, operand-specific memory hierarchy use, transfer paths, and buffering decisions explicit inside a Mixed-Integer Programming formulation. The paper’s strongest contribution is not a public compiler IR or instruction stack, but a stall-aware analytical model for SRAM-CIM accelerator mapping: it captures memory-capacity constraints, bus-width-derived transfer latency, single-versus-double buffering, and recursive loop-level latency to select a dataflow for DNN inference. The demonstrated workload setting is primarily INT8 CNN inference, with ResNet-18/ImageNet used as the baseline case and additional DNN/hardware sweeps reported through simulator-backed experiments. For CIM compiler/IR research, MIREDO is valuable as evidence that a useful “hidden IR” for CIM mapping can be a structured optimization state: constants, binary variables, enumerated data-size candidates, loop-factor placements, memory-level bindings, and latency recurrences. ([arXiv](https://arxiv.org/pdf/2510.26463))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| MIREDO accepts a DNN model in ONNX format plus an architecture description and produces a complete dataflow with temporal and spatial mapping. | Section IV-A / Fig. 3 | Paper-only plus formulation | The paper describes ONNX input, architecture description, dimensional factorization, MIP formulation, problem solving, and output dataflow with spatial/temporal mapping. | The public paper supports a claimed frontend-to-dataflow path; artifact-level confirmation of ONNX parsing, schema, and output serialization would require a public implementation. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Dataflow optimization is formulated as a Mixed-Integer Programming problem. | Section IV-A, Eq. 1 | Equation | Workload/hardware parameters become constants `Sc`; mapping choices become decision variables `Sv`; constraints enforce hardware and mapping legality; the objective minimizes `objcost(Sc,Sv)`. | Demonstrated as a mathematical mapper formulation; no checked public artifact exposes a runnable MIP model or solver input file. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| The framework models hardware hierarchy and CIM-specific constraints. | Section III, Section IV-B/C, Table II | Equation / paper model | The abstraction includes global buffer, distribution network, CIM cores, SIMD, local buffers/registers, accumulator, CIM macro, memory mode vs compute mode, capacity, bus width, and unrolling constraints. | The demonstrated abstraction targets multi-core SRAM-CIM-like accelerators; extension to other CIM technologies would require reparameterizing macro latency, paths, and resource constraints. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Flexible Factorization reduces loop-factor search complexity. | Section IV-B, Algorithm 1 | Algorithm | The algorithm starts from prime factors, greedily merges pairs according to a FlexScore loss metric, and stops at `kmin` or a loss threshold `α`. | Evidenced as pseudocode and described as preprocessing for MIP; no artifact-level runtime behavior or sensitivity to `kmin/α` was found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| The MIP supports spatial/temporal mapping and uneven operand-level memory mapping. | Section IV-C, Eqs. 2–5 | Equation | Binary variables place each loop factor exactly once into temporal loop slots or spatial unrolling axes; `XM` maps factors per operand type and memory level; `XN` models direct operand transfer paths and bypass legality. | The reusable boundary is clearest at mapping-state design: factor placement, operand type, memory level, and transfer path. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| The optimizer decides single- vs double-buffering. | Section IV-C, Eq. 9 | Equation | Binary variable `ψDM` selects buffering mode, and the capacity constraint accounts for double buffering by increasing storage demand. | Demonstrated as a compile-time mapping variable; runtime buffer occupancy, hazards, and dynamic scheduling are abstracted into latency equations. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Analytical latency model captures pipeline stalls. | Section IV-D, Table III, Eqs. 11–13 | Equation | Transfer latency is tied to data tile size, precision, and bus width; loop latency is recursively modeled with cases for single buffering, double buffering, output transfer, and no-transfer/data-stationary reuse. | The paper-level evidence supports stall-aware loop-level modeling; simulator-level confirmation is summarized by accuracy results, while simulator source is not public in the checked sources. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| MIREDO improves EDP up to 3.2×. | Abstract, Section V, Fig. 5 | Experiment | Evaluation reports 1.6×–3.2× EDP reduction over a ZigZag-inspired heuristic across representative DNN models and hardware configurations. | Demonstrated through paper experiments using a custom simulator, PCACTI-derived memory modeling, and prior-work logic statistics; artifact-level reproduction is not available from checked public sources. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Analytical model achieves 95.5% average accuracy. | Section V-B, Fig. 4(a) | Experiment | Latency predictions are compared against detailed hardware simulation over evaluated model layers, with reported average accuracy of 95.5%. | Demonstrated for the paper’s simulator and evaluated CNN layers; independent calibration would require simulator source, inputs, and figure scripts. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| MIREDO is scalable and extendable to various DNN workloads and CIM architectures. | Conclusion | Paper-only / experiment | The paper reports sweeps over DNN models and hardware parameters: macro configuration, core count, and buffer capacity. | The demonstrated scope is simulator-backed sweeps over selected CNN-style workloads and architecture parameters; broader reuse would depend on making architecture schemas and solver formulation available. ([arXiv](https://arxiv.org/pdf/2510.26463)) |

## 4. Stack anatomy

```text
Input / frontend:
  Claimed object: DNN model in ONNX format plus detailed architecture description.
  Type: model graph + hardware configuration.
  Inspectability: described in Fig. 3 and Section IV-A; no public schema or parser artifact found.

Middle representation:
  Claimed/evidenced object: loop-nest workload representation converted into constants, binary variables, one-hot vectors, and constraints.
  Type: MIP optimization state rather than a named compiler IR/dialect.
  Inspectability: equations and notation are visible in the paper; serialized form unknown.

Mapping or scheduling state:
  Object: factor list F, spatial/temporal placement variables XL/XU, operand-level memory variables XM, memory-level utilization ψU, transfer-path variables XN, buffering variables ψDM/ψDL, latency variables T/P/L.
  Type: loop/tensor schedule plus hardware-resource mapping.
  Inspectability: paper equations are inspectable; solver model files or mapping dumps not found.

Hardware abstraction:
  Object: hierarchical SRAM-CIM accelerator with off-chip memory, global buffer, distribution network, CIM cores, buffers/registers, preprocessing, accumulator, CIM macro, SRAM array, DAC/ADC in diagram, memory/compute modes.
  Type: hardware template and resource model.
  Inspectability: architecture is documented in figures/tables and parameters; reusable config format unknown.

Backend / simulator / codegen:
  Object: custom simulator based on the Section III architecture; memory latency/power modeled using PCACTI; other logic from prior work.
  Type: simulator-backed evaluation loop.
  Inspectability: paper describes simulator use; no public simulator artifact for MIREDO found.

Output artifact:
  Object: “complete dataflow” with spatial and temporal mapping.
  Type: mapping/configuration state, not shown as a serialized IR or instruction stream in the public paper.
  Inspectability: output existence is claimed; concrete file format unknown.

Evaluation loop:
  Object: Gurobi solver per convolutional layer, 5-minute cap per layer, custom simulator comparison against ZigZag-inspired and WS baselines.
  Type: optimization + simulation evaluation.
  Inspectability: experiment setup and aggregate figures are reported; reproduction scripts not found.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of loop-factor lists, operand-indexed memory-level bindings, direct transfer-path indicators, buffer-mode indicators, one-hot enumerations for legal sizes/counts, and recursive latency variables. The paper foregrounds the MIP formulation, while the reusable semantics are most visible in the legality constraints: each loop factor is placed exactly once; memory use is operand-specific; bypass paths are constrained; double buffering consumes effective capacity; and transfer latency is attached to the innermost loop block where movement occurs. This makes MIREDO a strong example of a mapping-state-as-IR paper, even though the checked public sources do not expose a standalone IR file, dialect, or backend interface. ([arXiv](https://arxiv.org/pdf/2510.26463))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.**  
MIREDO’s owned slice begins after model/layer extraction and architecture-parameter specification, then searches for a legal and cost-effective dataflow. The input boundary is a DNN model and architecture description; the output boundary is an optimized temporal/spatial dataflow. The technical core is the MIP formulation over mapping variables, not a macro generator, ISA compiler, or runtime. ([arXiv](https://arxiv.org/pdf/2510.26463))

**Secondary: A2 — Simulator & cost model.**  
The paper’s second major contribution is the stall-aware analytical latency model: it recursively computes operand-processing and critical-path latency, models single/double buffering differently, and validates predictions against a custom simulator with a reported 95.5% average accuracy. ([arXiv](https://arxiv.org/pdf/2510.26463))

**Tertiary / narrow A5 trait — End-to-end co-design path.**  
The paper claims a route from ONNX and hardware description to complete dataflow and simulator-backed evaluation. The demonstrated public evidence is strongest around layer-level MIP mapping and evaluation rather than an exposed end-to-end compiler stack. ([arXiv](https://arxiv.org/pdf/2510.26463))

### 5.2 Axis B — middle-layer style

**B3 — Loop / tensor-schedule IR.**  
The named middle representation is a loop nest derived from DNN operators. Decisions made there include tiling-factor decomposition, temporal loop ordering, spatial unrolling, loop-level bounds, and loop-level latency recursion. A single upstream-readable serialized artifact was not found; the paper represents these decisions through MIP variables and equations. ([arXiv](https://arxiv.org/pdf/2510.26463))

**B4 — Hardware-resource IR.**  
Hardware resources are represented through memory levels, capacities, bus widths, legal unrolling axes, operand-to-memory availability, transfer paths, and buffer modes. Decisions made there include whether an operand uses or bypasses a memory level, whether a direct transfer from one level to another is legal, and whether buffering is single or double. Several backend assumptions remain embedded in constants: MVM latency, bus bandwidth, enumerated sizes, and simulator-calibrated component statistics. ([arXiv](https://arxiv.org/pdf/2510.26463))

**B1 — Config-as-IR, partial.**  
The architecture description and mapping specifications function as configuration inputs, and the “optimal dataflow” functions like a mapping configuration output. The paper does not show a concrete config schema, stable serialization format, verifier, or pass interface, so this is best classified as a partial config-as-IR reading rather than a public config IR. ([arXiv](https://arxiv.org/pdf/2510.26463))

## 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware abstraction** | The hierarchy includes accelerator, CIM core, CIM macro, SRAM array, buffers/registers, SIMD, accumulator, and global/off-chip memory; Table IV gives macro/core/buffer parameters. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Bit-slicing / bit significance | **Parameter / implicit** | The paper mentions bit-serial input preprocessing and precision-dependent MVM latency, but does not expose bit significance as a rewriteable mapping object. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| ADC/DAC precision or sensing | **Implicit / diagram-level parameter** | DACs and ADCs appear in the CIM macro figure, but the MIP equations shown in the paper model precision, MVM latency, bus width, and transfer latency rather than ADC/DAC placement or precision rewrites. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Analog-to-digital or domain transition | **Implicit / costed through macro latency** | MVM latency is a constant determined by operand precision and macro design; explicit domain-transition scheduling is not surfaced as a separate variable. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Peripheral circuits as path nodes | **Implicit / architectural cause of stalls** | The paper explains that memory and compute modes share peripheral circuits, preventing computation and weight update from overlapping; the optimizer models the resulting stalls at the transfer/buffering level. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Partial-sum accumulation path | **Costed / partially first-class by operand case** | The core contains an accumulator; output/Psum transfer is distinguished in the latency table, especially for output operands and single/double buffering. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Reconstruction / shift-add tree | **Implicit / not surfaced** | The paper refers to bit-serial preprocessing and accumulation but does not present a separate reconstruction or shift-add tree representation in the checked sources. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable / outside demonstrated scope** | The demonstrated workload is INT8 CNN inference; no KV cache, runtime batching state, masks, or sparsity-control state is exposed in the paper’s MIP formulation. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Value trajectory / flow path | **Approximated** | Transfer-path variables `XN` describe direct operand movement between memory levels, and recursive latency accounts for transfer/compute overlap; value identity through analog partial sums, sensing, reconstruction, and downstream reductions is not a first-class type-like object. ([arXiv](https://arxiv.org/pdf/2510.26463)) |

## 5.4 Axis D — rewrite object

MIREDO rewrites **hardware mapping and tensor schedule**. The legal transformations include:

- placing each loop factor into exactly one temporal loop slot or spatial unrolling axis;
- selecting operand-specific memory-level loop blocks;
- using or bypassing memory levels per operand;
- selecting legal direct transfer paths between hierarchy levels;
- choosing single or double buffering under capacity constraints;
- selecting enumerated data-size and loop-bound candidates to keep the formulation MIP-compatible;
- minimizing a latency/locality objective after recursive latency modeling. ([arXiv](https://arxiv.org/pdf/2510.26463))

The equivalences exploited are schedule and tiling equivalences: many factorizations, loop placements, memory placements, and buffering choices compute the same layer but expose different reuse, locality, and stall behavior. The preserved information is tensor dimension bounds, operand identity, factor products, legal unrolling constraints, memory capacity, transfer bandwidth, and MVM latency. The representation is especially well suited to static convolution-layer mapping under fixed hardware templates; expressing cross-operator trajectory rewrites, dynamic runtime state, alternate peripheral routing, or precision-stage retiming would likely require an additional abstraction for value identity and domain/precision state.

## 6. Technical mechanism reading

### MIP state as the compiler middle layer

MIREDO’s central compiler object is a MIP state. Hardware and workload are constants; mapping options are binary and one-hot variables; constraints enforce legality; the objective ranks feasible mappings. Table II’s variables are particularly IR-like: `X` matrices represent spatial/temporal mapping, `V` vectors choose pre-enumerated candidates, `ψ` indicators encode operational state, and `T/P/L` represent transfer, processing, and critical-path latency. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Flexible Factorization

Loop bounds can have many prime factors, which expands the mapping search space. MIREDO introduces **Flexible Factorization**: start from prime factors, compute a FlexScore based on the number of unique partitions into one, two, or three subsets, then greedily merge the factor pair that causes the smallest relative FlexScore loss until the factor count or loss threshold stops the process. For an IR researcher, the important point is that loop-factor granularity is itself a tunable representation decision: the mapper reduces the number of named tiling atoms before invoking the solver. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Spatial and temporal mapping variables

Each factor `Fd,f` is assigned either to a temporal loop slot or a spatial unrolling dimension. The uniqueness constraint in Eq. 2 is the schedule legality core: every factor is mapped exactly once. Spatial unrolling is constrained by hardware capability `CX`; for example, the paper notes that a CIM macro wordline axis may allow only output-channel unrolling. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Operand-specific memory-level mapping

MIREDO introduces `XM d,f,λ,m` so that loop blocks can be independently defined for each operand type—input, weight, output—at each memory level. This is important because CIM reuse behavior differs by operand: weights may be stationary in macros, inputs may be multicast or streamed, and outputs/partial sums may need accumulation and write-back. The paper’s memory mapping matrix `CM` constrains which memory units are dedicated to or shared among operands. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Transfer-path and bypass modeling

The transfer-path variable `XN m,m′,λ` names direct movement of an operand from one memory level to another. Constraints link this to whether a memory level is used or bypassed, enforcing path uniqueness and preventing illegal bypasses. This is one of MIREDO’s clearest contributions to CIM-IR thinking: the path through the memory hierarchy becomes a solver-visible object rather than an implicit simulator behavior. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Capacity, precision, and enumerated size selection

The data size at each memory level is based on loop bounds, operand precision, and whether the level is used. Because products of factors are nonlinear, MIREDO linearizes by summing logarithms and selecting from pre-enumerated valid data sizes using one-hot vectors. Precision appears as `Pm,λ` in the size and transfer-latency equations; it is a parameter in the mapping model rather than a type system for value representation. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Single/double-buffer decision

Each memory level may operate in a single-buffered mode or double-buffered mode. Double buffering can overlap transfer and computation but halves effective storage capacity. MIREDO introduces a binary decision `ψDM` and folds it into the capacity constraint, making buffering a legal mapping choice rather than a fixed backend assumption. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Stall-aware recursive latency model

The latency model recursively computes operand-processing latency at each temporal loop level. Table III distinguishes single buffering, double buffering, output operands, and no-transfer reuse. Transfer latency is constrained by data tile size, bus width, precision, and utilization state; critical-path latency is the maximum of nested loop latency and current-loop transfer/processing latency. This is the paper’s most technically distinctive mechanism for CIM compiler work: it models stalls caused by mode switching, throughput mismatch, and operand synchronization at mapping time. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Objective

The objective combines two goals: minimize total latency, represented by the maximum top-level operand-processing latency, and encourage locality by rewarding larger data placement at memory levels closer to CIM macros. This formulation turns “keep data close to CIM compute” into a weighted optimization term rather than a fixed weight-stationary rule. ([arXiv](https://arxiv.org/pdf/2510.26463))

### Evaluation assumptions

The main setup uses a custom simulator for the Section III architecture, PCACTI for memory latency/power, prior-work estimates for other logic components, Gurobi as the solver, and a 5-minute cap per layer on a 2GHz Intel Xeon Gold 6330 CPU. The baseline workload is ResNet-18 inference on ImageNet with INT8 weights and activations; the paper also reports sweeps over DNN models and hardware configurations. ([arXiv](https://arxiv.org/pdf/2510.26463))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The MIP variable set is the de facto IR boundary

- **Observation:** The reusable semantic boundary is not a named compiler dialect; it is the set of constants, binary variables, one-hot vectors, and latency variables that define a legal CIM dataflow.
- **Why it matters for CIM compiler/IR work:** It shows that a mapping IR can be optimization-native: legality, resource binding, and latency reasoning can be encoded directly in the middle representation.
- **Reusable lesson:** A future public stack could serialize the MIREDO-style state—factor list, operand memory levels, transfer paths, buffer modes, latency recurrences—as a verifiable mapping IR.

### Insight 2 — Operand-specific memory mapping is more CIM-relevant than generic tiling alone

- **Observation:** `XM d,f,λ,m` separates mapping by operand type and memory level, rather than assigning a single loop block uniformly across all operands.
- **Why it matters for CIM compiler/IR work:** CIM bottlenecks often arise from different lifetimes and transfer constraints for weights, inputs, and partial sums; operand-aware mapping captures this directly.
- **Reusable lesson:** CIM IRs should type memory-placement decisions by operand role, not only by tensor shape or loop dimension.

### Insight 3 — Buffer mode is a compile-time schedule object

- **Observation:** MIREDO treats single versus double buffering as a binary mapping decision that affects both capacity and latency.
- **Why it matters for CIM compiler/IR work:** Many compiler stacks assume buffering policy in the backend; MIREDO exposes it early enough to trade storage capacity against overlap and stalls.
- **Reusable lesson:** Buffering mode should be represented in a mapping IR with explicit capacity effects and legal overlap semantics.

### Insight 4 — Transfer path is the closest approximation to value trajectory

- **Observation:** `XN` names direct operand transfers between memory levels and constrains bypass behavior.
- **Why it matters for CIM compiler/IR work:** Although this is not a full value-trajectory IR, it is a concrete step toward representing where data moves, which path it uses, and which memory levels it skips.
- **Reusable lesson:** A trajectory IR could extend this path variable with value identity, numeric domain, precision stage, and accumulation/reconstruction state.

### Insight 5 — The latency model encodes pipeline semantics without requiring a cycle-level schedule

- **Observation:** Recursive latency cases approximate stalls from buffering, output write-back, and operand synchronization through equations rather than through explicit event traces.
- **Why it matters for CIM compiler/IR work:** It offers a compact cost-model plugin boundary: a backend can provide latency cases and constants while the compiler searches mappings.
- **Reusable lesson:** Future IR stacks can separate mapping legality from backend latency semantics by attaching parametric latency recurrences to memory/compute path nodes.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources. The checked sources include the arXiv paper page, the CI-Lab publication/news/project pages, and public web/GitHub search results. The official CI-Lab project page lists MIREDO under “Toolchains for Computation-in-Memory,” but it does not expose a MIREDO-specific repository, scripts, dataset, solver model, or simulator package in the checked lines. ([ci-lab.net](https://www.ci-lab.net/project/toolchains-for-computation-in-memory/))
- **License:** Unknown / not found for MIREDO. A related same-lab CIMFlow repository is public under Apache-2.0, but it is a distinct DAC 2025 framework and should not be treated as the MIREDO artifact. ([GitHub](https://github.com/BUAA-CI-LAB/CIMFlow))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** No MIREDO artifact found.
- **What the artifact appears to omit:** Public solver formulation files, ONNX examples, architecture schemas, simulator source, reproduction scripts, generated dataflow dumps, figure scripts, and benchmark configurations were not found in the checked public sources.
- **Minimal command or workflow:** Unknown / not found.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper reports a custom simulator, Gurobi solver, PCACTI-derived memory modeling, and prior-work logic statistics, but no public reproduction workflow was found. ([arXiv](https://arxiv.org/pdf/2510.26463))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | ONNX input and architecture description are claimed, but schema/examples are not public in checked sources. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Intermediate representation serialized | Unknown | MIP state is described mathematically; no serialized IR or solver file found. |
| Mapping decisions inspectable | Partial | Variables and constraints are inspectable in the paper; actual mapping outputs/dumps are not found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Schedule inspectable | Partial | Spatial/temporal mapping variables are formalized; concrete schedules per layer are not tabulated as reusable artifacts. |
| Hardware config explicit | Partial | Table IV gives representative hardware parameters; no full machine-readable config found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Precision / bit-slice assumptions explicit | Partial | INT8 weights/activations are stated; precision appears in equations; detailed bit-slice representation is not exposed. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Cost model inspectable | Partial | Equations and latency cases are in the paper; implementation not found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Simulator backend documented | Partial | Custom simulator and modeling sources are described; simulator source/docs not found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Generated code / instruction stream inspectable | N/A / Unknown | The paper outputs dataflow, not an evidenced instruction stream. |
| Provenance from source op to backend action | Partial | Convolutional layer identification is described; op-to-simulator trace provenance is not exposed. ([arXiv](https://arxiv.org/pdf/2510.26463)) |
| Reproduction scripts available | Unknown | No public MIREDO reproduction scripts found. |
| Calibration source documented | Partial | Memory modeled with PCACTI; other logic from prior work; full calibration data not found. ([arXiv](https://arxiv.org/pdf/2510.26463)) |

### 8.3 Integration helper

- **As frontend:** Reuse is uncertain. The paper claims ONNX input and automatic convolutional-layer identification, but a parser or schema was not found.
- **As IR inspiration:** Strong. The factorized loop representation, operand-indexed memory-level variables, transfer-path variables, and buffering indicators are directly useful as IR design ingredients.
- **As mapper/scheduler:** Strong conceptually. The MIP formulation can inspire or be reimplemented as a mapper for SRAM-CIM accelerators.
- **As cost model:** Strong conceptually. The latency recurrence and buffering cases could become backend cost-model plugins for a compiler.
- **As backend:** Limited from public sources. The custom simulator is described but not publicly available in the checked sources.
- **As benchmark:** Partial. ResNet-18/ImageNet INT8 and DNN/hardware sweeps are described; exact benchmark configs and scripts are not found.
- **As validation source:** Partial. The paper reports simulator validation and 95.5% analytical accuracy, but calibration/reproduction artifacts are not public.

**Integration effort estimate: High.**  
Integration would be most direct through a clean-room reimplementation of the MIP formulation and latency equations. Reuse would benefit from a small adapter that extracts layer loop bounds from ONNX and emits a serializable mapping state containing factor placement, operand memory bindings, transfer paths, and buffering decisions. The most valuable reusable boundary appears to be the mapping/cost-model interface, not an existing public codebase.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| CoSA | Constrained optimization for spatial accelerator scheduling | CoSA is a general spatial-accelerator MIP-style baseline; MIREDO adapts constrained optimization to CIM-specific memory hierarchy, transfer paths, buffering, and MVM latency. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Classify MIREDO as CIM-specialized MIP mapping rather than generic accelerator scheduling. |
| ZigZag / ZigZag-IMC | Architecture-mapping design-space exploration and uneven mappings | MIREDO uses a MIP formulation and stall-aware latency model; the paper compares against a ZigZag-inspired heuristic and cites ZigZag for uneven mapping support. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Use as the closest DSE/search comparison, but distinguish heuristic search from MIP legality/cost encoding. |
| CiMLoop | Flexible and accurate CIM modeling | CiMLoop is closer to modeling/evaluation infrastructure; MIREDO is closer to optimizer-driven dataflow selection with explicit MIP variables. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Place CiMLoop in simulator/modeling tags and MIREDO in mapper/scheduler plus analytical-cost tags. |
| SPCIM | Spatial-temporal multi-macro utilization for CIM | SPCIM is tied to a reconfigurable cluster/topology approach; MIREDO targets a more general MIP mapping formulation over hierarchical resources. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Useful contrast between hardware-topology-specific CIM optimization and formulation-level mapping. |
| NeuroSpector | Dataflow scheduling and data-movement impact | NeuroSpector analyzes dataflow scheduling for DNN accelerators; MIREDO focuses on SRAM-CIM-specific dataflow constraints and stall modeling. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Use as a broader accelerator dataflow baseline, not a CIM-stack IR peer. |
| PIMCOMP | End-to-end compilation for crossbar-based PIM DNN accelerators | PIMCOMP is closer to compiler-stack classification; MIREDO is more focused on MIP dataflow optimization and cost modeling. ([arXiv](https://arxiv.org/pdf/2510.26463)) | Helps separate “compiler flow” papers from “mapper/cost-model layer” papers. |

## 10. Corpus-ready final takeaway

- MIREDO’s real contribution is a **MIP-based dataflow mapper** for SRAM-CIM accelerators, with a strong stall-aware analytical latency model.
- The strongest reusable stack layer is **mapping/scheduling plus cost modeling**, not a public IR dialect, ISA, or released backend.
- The evidenced scope is **INT8 DNN/CNN inference**, with ResNet-18/ImageNet as the baseline case and simulator-backed sweeps over DNNs and hardware parameters.
- First-class objects include **loop factors, temporal/spatial placements, operand-specific memory levels, transfer paths, buffer modes, capacities, bus widths, and recursive latency variables**.
- The hidden IR is the **MIP state**: constants, variables, constraints, enumerated candidates, and objective terms.
- Artifact status: **no public artifact found** for MIREDO as of 2026-05-15.
- Integration would be most useful through a **clean-room reimplementation** of the MIP formulation and latency model as a mapper plugin.
- For value-trajectory IR work, MIREDO is relevant as a **memory-path and buffering abstraction**, but trajectory-level value identity, precision-stage typing, and reconstruction semantics would need an added layer.
