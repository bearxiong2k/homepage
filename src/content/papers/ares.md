---
slug: ares
title: "ARES: A Mapping Framework of DNNs towards Diverse PIMs with General Abstractions"
short_title: "ARES"
subtitle: "Scoped CIM stack note"
year: 2023
venue: "ICCAD 2023"
authors_or_group: "Xiuping Cui, Size Zheng, Tianyu Jia, Le Ye, Yun Liang"
summary: >-
  ARES is a compiler-mapping framework for placing static DNN tensor operators onto multiple PIM/CIM-like hardware classes. Its main contribution is a pair of reusable abstractions: a compute abstraction that describes a PIM primitive as a tensorized compute equation, and a memory abstraction that encodes bit-level operand placement through mapping matrices and offsets. These abstractions are used to derive a mapping space over tensor binding, loop binding, loop sizes, resource allocation, execution order, and data movement. The demonstrated setting is simulator-backed DNN inference mapping on four adapted platforms: logic-DRAM, logic-SRAM, MVM-ReRAM, and near-DRAM / PIM-HBM-like hardware.
links:
  paper: https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "DRAM-PIM"
  - "ReRAM-CIM"
  - "MVM-based PUM"
  - "logic-based PUM"
  - "PNM"
  - "analog-CIM"
  - "digital-CIM"
  - "hybrid"
workloads:
  - "ResNet50"
  - "ResNeXt-50"
  - "MobileNet"
  - "BERT"
  - "GoogleNet"
  - "DenseNet"
  - "ResNet18 conv2D layers"
  - "GEMM"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A4]
axis_B: [B4, B3, B1]
axis_C_first_class_objects:
  - "compute_abstraction"
  - "memory_abstraction"
  - "bit_level_mapping_matrix"
  - "offset_vector"
  - "compute_dimension"
  - "parallel_dimension"
  - "reduction_dimension"
  - "operand_binding"
  - "loop_binding"
  - "array_spatial_location"
  - "data_transfer_schedule"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "array_binding"
  - "memory_layout"
  - "tensor_schedule"
  - "loop_tiling"
  - "loop_order"
  - "resource_allocation"
artifact:
  status: "no public artifact found"
  url:
  license:
  last_checked: "2026-05-19"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
reproducibility_level: low
notes:
  - "Best classified as a PIM/CIM mapping framework rather than a full public compiler dialect or ISA stack."
  - "Memory abstraction is the most reusable IR idea: bit-level layout legality via mapping matrices and offsets."
  - "Simulator-backed experiments cover four adapted PIM platforms; public simulator/code artifact was not found."
  - "Useful bridge between tensor access-matrix semantics and PIM-specific operand placement constraints."
  - "Artifact URL spot-check on 2026-05-19 found the author-hosted paper PDF but no public implementation link."
takeaways: []
---

# ARES — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework** | ARES defines mapping as binding DNN operator loops/tensors to PIM compute functions, then scheduling compute-function invocations across arrays, time, and memory levels. The paper’s central object is the feasible mapping space, searched with a genetic algorithm whose fitness is simulator execution time. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Secondary stack role, Axis A | **A2 — Simulator & cost-model support; A4-adjacent IR abstraction** | Evaluation uses custom cycle-accurate simulators for four adapted PIM platforms. The compute and memory abstractions are IR-like, but the public paper presents them as mathematical hardware abstractions rather than as a released dialect, serialized IR, or instruction compiler. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR; B3 Loop / tensor-schedule IR; B1 Config-as-IR, paper-level** | The named middle objects are compute abstraction, memory abstraction, operator iteration space/access matrices, binding, address mapping, and dataflow scheduling. The paper describes hardware descriptions as user input, but no public schema or artifact was found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| First-class CIM objects, Axis C | Compute abstraction; memory mapping matrix; offset vector; bit index; compute dimension; operand binding; loop binding; tile size; array / PIM unit / buffer hierarchy | ARES directly represents PIM compute as a tensorized equation and memory constraints as a bit-level address function `addr = A·[j,b]^T + offset`. It also names scheduling state: resource allocation, computation order, data transfer, spatial location, and begin time. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Rewrite object, Axis D | **Hardware mapping, array binding, memory layout, tensor schedule** | The transformations are operand binding, dimension binding, binding-size selection, tiling, loop reordering, parallelization, resource allocation, and data-transfer scheduling. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Best corpus tags | `compiler-mapping`, `PIM-mapping`, `hardware-abstraction`, `layout-constraints`, `bit-layout`, `DNN-inference`, `ReRAM-PIM`, `SRAM-PIM`, `DRAM-PIM`, `simulator-backed` | Tags reflect the demonstrated mapping framework and the four evaluated PIM-style platforms: logic-DRAM, logic-SRAM, MVM-ReRAM, and near-DRAM / PIM-HBM-like. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Closest comparison baselines | **PUMA, Neural Cache, PIM-HBM, PIM-DL, SIMDRAM, AMOS** | PUMA, Neural Cache, PIM-HBM, and PIM-DL are direct baseline/reference points in ARES; SIMDRAM represents bit-serial DRAM-PIM; AMOS is the closest general automatic tensor-mapping predecessor with hardware abstraction. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |

## 2. One-paragraph public summary

**ARES** is a compiler-mapping framework for placing static DNN tensor operators onto multiple PIM/CIM-like hardware classes. Its main contribution is a pair of reusable abstractions: a **compute abstraction** that describes a PIM primitive as a tensorized compute equation, and a **memory abstraction** that encodes bit-level operand placement through mapping matrices and offsets. These abstractions are used to derive a mapping space over tensor binding, loop binding, loop sizes, resource allocation, execution order, and data movement. The demonstrated setting is simulator-backed DNN inference mapping on four adapted platforms: logic-DRAM, logic-SRAM, MVM-ReRAM, and near-DRAM / PIM-HBM-like hardware. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| A general abstraction for PIM devices, consisting of compute abstraction and memory abstraction | Abstract, Section I contributions, Section IV | Equation / paper-only | Compute abstraction is formalized as `Dst[i] = F(Src0[j0], …)`; memory abstraction maps bit positions to memory addresses via a matrix and offset. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | The paper-level evidence supports a mathematical abstraction for static tensor operators and PIM compute/layout constraints. A public implementation or schema was not found. |
| Hardware diversity can be captured through tensorized compute plus data-layout constraints | Section I and Section IV discussion | Equation / case study | The paper gives MVM-based PUM and logic-based PUM examples: MVM maps reduction and parallel dimensions into array rows/columns; logic-based PUM models parallel and reduction dimensions with bit-serial placement constraints. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Demonstrated through representative examples and experiments over adapted platforms; further reuse would depend on implementing new hardware templates or abstractions. |
| ARES constructs a mapping space covering compute binding and scheduling | Section III overview and Section V | Equation / algorithmic description | Mapping is split into binding and scheduling. Binding includes operand binding, dimension binding, and loop-size selection; scheduling maps loops to spatial array locations and begin times. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | The reusable boundary is clearest at mapping-state construction, not at a released IR file or backend instruction format. |
| ARES generates feasible loop bindings using tensor reuse legality | Section V-B, Figure 4 | Equation / mapping rule | The paper derives a legality condition: a tensor can be reused along loop dimension `Lj` when the corresponding access-matrix column sums to zero in absolute value. This rule filters incorrect conv2D-to-MVM bindings. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Demonstrated for affine tensor access matrices in static operator mappings. More dynamic indexing or runtime-dependent sparsity would require additional representation. |
| ARES explores the mapping space automatically | Section V-C | Algorithm / paper-only | The paper uses a genetic algorithm. Genes include loop binding, tile sizes for spatial and temporal dimensions, loop order, and parallel dimensions; mutation changes tile sizes, loop orders, and parallel dimensions; fitness is simulator execution time. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | The search method is described at paper level. Public code, seeds, logs, and search configurations were not found. |
| ARES improves performance over template-based mappings | Abstract, Section VI, conclusion | Experiment | The reported results cover four PIM platforms, static DNN networks/operators, and simulator-backed evaluation. Reported improvements include 20.13% / 27.98% average single-operator gains for logic-SRAM / logic-DRAM, 69.2% for MVM-ReRAM single operators, up to 52% full-network improvement on MVM-ReRAM, and 11.98% / 11.01% average single/full-network gains for PNM. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Demonstrated through custom cycle-accurate simulators over adapted hardware models and selected DNN workloads; hardware measurement or released reproduction scripts were not found. |
| ARES covers common PIM paradigms | Section II background and Section VI setup | Case study / experiment | The paper categorizes PIM into logic-based PUM, MVM-based PUM, and PNM, then evaluates logic-DRAM, logic-SRAM, MVM-ReRAM, and near-DRAM-like platforms. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | The demonstrated scope is broad for static DNN mapping, but coverage is by representative adapted platforms rather than a public plug-in ecosystem. |

## 4. Stack anatomy

```text
Input / frontend:
  High-level operator descriptions and hardware descriptions. The operator object is a loop/access-matrix description: iteration space plus tensor access matrices. The hardware object is expressed in the paper as compute abstraction plus memory abstraction. Serialization/documentation status: paper-level; public schema not found.

Middle representation:
  Compute abstraction and memory abstraction. Compute abstraction is a tensorized equation with arithmetic type F, compute dimensions, and operand indices. Memory abstraction is a bit-level address mapping function using a mapping matrix A, bit index b, and offset vector. Serialization status: formal equations in the paper; reusable as an IR design, but no public IR file format found.

Mapping or scheduling state:
  Tensor mapping, operand binding, loop-dimension binding, binding-size constraints, spatial location p_i, begin time time_i, tile sizes, loop order, parallel dimensions, and resource allocation. The GA genome functions as the search-state representation. Inspectability: paper examples and equations; no public logs or serialized mapping dumps found.

Hardware abstraction:
  PIM unit, memory array, registers/buffers, processing logic, control units, bus/on-chip network, memory hierarchy, crossbar dimensions, and PNM compute units. For MVM PUM, the paper also discusses ADC/DAC precision limits and shift-and-add reconstruction; for logic PUM, it discusses bit-serial placement and bitline reduction. Reusability: mathematically clear, artifact status unknown.

Backend / simulator / codegen:
  Custom cycle-accurate simulators for the four evaluated platforms. The backend object appears to be simulator input derived from mapping decisions, rather than a generated instruction stream in the public paper. Documentation status: platform parameters are listed; simulator implementation not found.

Output artifact:
  Efficient mapping strategies and schedules: array binding, tile sizes, execution order, resource allocation, and data-transfer plan. Generated code or hardware instructions are not described as a public output.

Evaluation loop:
  Genetic search over mapping candidates; candidate fitness is execution time on the hardware simulator. Experimental workloads include full networks and individual conv2D/GEMM operators with 8-bit weights and input data.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the operator access matrices, compute-abstraction equation, memory-abstraction mapping matrix/offset, binding legality constraints, GA genome, and simulator timing model. The paper foregrounds compute and memory abstraction as the conceptual interface, while the reusable semantics are most visible in the legality rule that connects tensor access matrices to hardware reuse dimensions and in the search state that carries tile sizes, loop order, and resource allocation into the simulator. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.**  
ARES owns the middle slice between static DNN operator descriptions and PIM backend execution models. Its input boundary is an operator described by loops and tensor access matrices plus a hardware description written in compute/memory abstraction form. Its output boundary is a selected mapping/schedule evaluated by simulator execution time. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

**Secondary: A2 — Simulator & cost model.**  
The cost objective is not an exposed closed-form latency/energy equation; the fitness of a mapping is execution time on custom cycle-accurate simulators. The paper gives platform parameters and benchmark choices, making the simulator an important backend contract even though the implementation was not found publicly. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

**A4-adjacent but not best classified as A4.**  
ARES has explicit IR-like abstractions, especially the bit-level memory mapping function. The public evidence points to a mapping framework and mathematical abstraction rather than a full dialect/ISA compiler stack with serialized IR, verification passes, and code generation. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 5.2 Axis B — middle-layer style

**B4 — Hardware-resource IR.**  
The named representation is the pair of compute abstraction and memory abstraction. Decisions made here include what hardware tensor operands exist, which compute dimensions are parallel or reduction dimensions, and where operand bits may legally reside in the memory array. Decisions still embedded downstream include simulator timing, hardware-specific peripheral behavior, and concrete generated backend actions. A single public artifact that upstream passes could read, verify, and rewrite was not found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

**B3 — Loop / tensor-schedule IR.**  
The operator description uses iteration space and access matrices, and the mapping state binds software loops to hardware dimensions. Scheduling corresponds to loop transformations such as tiling, reordering, and parallelization across memory hierarchy levels and compute modules. This is the paper’s most concrete compiler-style mechanism. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

**B1 — Config-as-IR, paper-level.**  
The user provides hardware descriptions using the proposed abstractions, and the experiments instantiate platform parameters for logic-DRAM, logic-SRAM, MVM-ReRAM, and near-DRAM-like hardware. The config-as-IR interpretation is useful for corpus classification, but public config files or schemas were not found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 5.3 Axis C — first-class CIM objects

### 5.4 Axis D — rewrite object

ARES rewrites **hardware mapping and tensor schedule**. The concrete rewrite objects are:

- software tensor operand → hardware tensor operand,
- software loop dimension → hardware compute dimension,
- loop dimension → binding size,
- loop dimension → spatial location and begin time,
- tile size, loop order, parallel dimension, and resource allocation,
- operand data layout through the memory mapping matrix and offset.

The legal transformations include operand binding, dimension binding, memory-constrained binding-size selection, tiling, reordering, parallelization, and resource-allocation changes. The main equivalence exploited is that multiple loop-to-hardware bindings may compute the same tensor operator, provided tensor reuse semantics and hardware reuse semantics agree. The paper’s access-matrix rule preserves tensor identity: a tensor is reusable along a loop dimension when that loop dimension does not participate in the tensor’s access indexing. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

## 6. Technical mechanism reading

### 6.1 Compute abstraction

ARES defines a hardware compute primitive as a tensor equation: an output tensor element at index `i` is produced by applying arithmetic type `F` to indexed source operands. The abstraction includes the arithmetic type, compute dimension space, and memory access indices. This is a useful compiler object because it raises PIM hardware behavior above gate- or circuit-level details while retaining the operand-index structure needed for tensor mapping. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

The paper’s key design choice is that `F` is a high-level arithmetic type, such as multiply-add or activation, rather than necessarily the primitive native operation of the memory circuit. When a high-level operation is not directly supported, additional steps are needed to generate the operation. This positions ARES as a mapping framework over hardware primitives, with low-level arithmetic expansion treated as a backend/hardware responsibility. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 6.2 Memory abstraction

The memory abstraction is the most CIM-specific IR-like contribution. It maps the augmented tensor index `[j,b]`—hardware compute index plus bit position inside an element—to a memory address vector using a mapping matrix and offset. This lets a mapping rule express row/column/bitline/wordline placement constraints without hard-coding one hardware architecture. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

For MVM-based PUM, the abstraction captures that matrix reduction and parallel dimensions occupy different memory-array dimensions, and that multi-bit elements may occupy adjacent cells. For logic-based PUM, it captures bit-serial placement and reduction structure, including a symbolic mapping-matrix entry that indicates placement constraints without requiring continuous placement. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 6.3 Mapping formulation

The DNN operator is represented as tensors, loop iterations, and tensor access matrices. The hardware primitive is represented as operands, compute dimensions, operand indices, and memory mapping matrices. Binding then has three subproblems: operand binding, dimension binding, and loop-size determination. Scheduling assigns spatial locations and begin times to hardware primitive invocations. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

For conv2D-to-MVM, ARES first separates parallel and reduction hardware dimensions. A simple parallel/reduction match is insufficient because the data reuse implied by the software operator must match the data reuse required by the hardware compute abstraction. The paper’s legality rule checks tensor reuse from the access matrix: if the absolute values in the access-matrix column for loop `Lj` sum to zero, that tensor can be reused along `Lj`. This rule filters incorrect bindings where cells on the same wordline would require different input feature-map values. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 6.4 Binding-size constraints and memory capacity

After feasible loop bindings are found, ARES constrains binding sizes using memory-array capacity. For the MVM example with memory size `(X,Y)`, when input features are mapped to the crossbar and each element uses `B` memory cells, the paper gives constraints such as `SC * SR * SS ≤ X` and `SN * SH * SW * B ≤ Y`. This is where bit width, loop tiling, and physical array capacity meet in the mapping formulation. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 6.5 Scheduling and search

Scheduling is described as dataflow scheduling over PIM units and data buffers. It includes resource allocation, compute-function execution order, and data transfer between memory hierarchy levels. The paper explicitly connects these scheduling choices to loop transformations: tiling, reordering, and parallelization. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

Search uses a genetic algorithm. The genome contains loop binding and sizes of loops mapped to spatial and temporal dimensions. Crossover exchanges tile sizes between parent genomes; mutation changes tile size, loop order, and parallel dimensions. Fitness is simulator execution time. This makes the search objective clear, while the numerical latency/traffic model is mainly embedded in the simulator. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 6.6 Hardware and workload assumptions

The experiments use four adapted platforms: Ambit-like logic-DRAM using DDR4 parameters, Neural-Cache-like logic-SRAM, PUMA-like MVM-ReRAM, and PIM-HBM-like near-DRAM. The paper says it develops cycle-accurate simulators for these hardware platforms. Workloads include ResNet50, ResNeXt-50, MobileNet, BERT, GoogleNet, DenseNet, selected ResNet18 conv2D layers, and two GEMM shapes; all evaluated networks/operators use 8-bit weights and input data. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Bit-layout constraints are the reusable IR kernel

- **Observation:** The memory abstraction directly maps bit positions to memory addresses through a matrix and offset. This is stronger than treating layout as a backend annotation because legality depends on bit-level placement.
- **Why it matters for CIM compiler/IR work:** CIM legality often depends on where individual bits land relative to wordlines, bitlines, crossbar rows/columns, and peripheral paths. ARES shows one compact affine-style representation for that constraint.
- **Reusable lesson:** A future CIM IR could model operand layout as a type-like object: tensor dimension mapping, bit significance, bit position, memory coordinate, and offset scope.

### Insight 2 — Access-matrix reuse is a bridge between tensor semantics and hardware legality

- **Observation:** ARES uses the tensor access matrix to determine whether a tensor is reusable along a loop dimension, then uses that result to validate loop-to-hardware-dimension binding.
- **Why it matters for CIM compiler/IR work:** This separates semantic equivalence from cost ranking. The compiler can first reject mappings that violate operand-reuse semantics, then search among legal mappings.
- **Reusable lesson:** CIM IRs should preserve access functions or dependence summaries long enough to check hardware-layout legality, rather than lowering too early to flat buffers.

### Insight 3 — The search genome is a hidden schedule IR

- **Observation:** The GA genome contains loop binding, tile sizes, loop order, and parallel dimensions. Those fields are exactly the information a compiler would want to serialize, inspect, diff, and replay.
- **Why it matters for CIM compiler/IR work:** Even when a paper does not expose a standalone IR, the optimizer’s search state can reveal the real compiler boundary.
- **Reusable lesson:** A future corpus entry or reimplementation could define a mapping-record schema containing operand binding, dimension binding, tile sizes, memory offsets, array placement, and schedule timing.

### Insight 4 — Compute abstraction intentionally floats above native circuit operations

- **Observation:** The arithmetic type `F` represents high-level operations such as multiply-add, while the paper notes that unsupported high-level operations require additional generation steps.
- **Why it matters for CIM compiler/IR work:** This creates a clean mapping interface, but it also means a backend contract must specify how arithmetic is decomposed into bit-serial logic, MVM cycles, shift-add, or near-memory PU instructions.
- **Reusable lesson:** A practical CIM IR could split compute abstraction into two layers: semantic tensor primitive and hardware-native expansion recipe.

### Insight 5 — The simulator defines the cost-model boundary

- **Observation:** The mapping search ranks candidates by simulator execution time, while the paper-level equations mainly define legality and mapping space.
- **Why it matters for CIM compiler/IR work:** A compiler stack can have a clean legality IR but still depend on simulator-specific assumptions for performance ranking.
- **Reusable lesson:** Future stacks should make the simulator contract auditable: hardware parameters, transfer model, programming latency, ADC/DAC cycle model, shift-add cost, and calibration source.

### Insight 6 — Network-level scheduling matters most clearly for MVM-ReRAM

- **Observation:** For MVM-ReRAM, the paper adds a whole-network scheduling dimension: resource allocation among layers, because crossbar programming time is much larger than one MVM operation. It adopts layer-pipeline execution and divides crossbar resources among layers. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))
- **Why it matters for CIM compiler/IR work:** Mapping one operator independently can miss persistent-placement and reprogramming costs.
- **Reusable lesson:** CIM IRs should represent persistent array residency and inter-layer resource partitioning when mapping weight-stationary or crossbar-programmed accelerators.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **Checked sources:** author publication page, public PDF, IEEE/DBLP-style metadata, and targeted web/GitHub searches. The author publication page lists ARES with PDF and IEEE links, but no code/artifact link in the visible entry. ([Si-Ze Zheng](https://sizezheng.github.io/publications/))
- **What the artifact contains:** Not applicable.
- **What the artifact appears to omit:** Not applicable; no public artifact found.
- **Minimal command or workflow:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper gives equations, hardware parameters, workload names, selected layer shapes, and plotted results, but no public simulator, scripts, seeds, or raw result tables were found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Operator descriptions are iteration spaces plus tensor access matrices; hardware descriptions use compute and memory abstractions. No public schema found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Intermediate representation serialized | Unknown | Equations are documented; serialized IR files were not found. |
| Mapping decisions inspectable | Partial | Binding and scheduling equations plus examples are in the paper; mapping dumps/logs were not found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Schedule inspectable | Partial | Schedule is formalized as spatial location and begin time; GA schedule fields are described. Public schedule output unavailable. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Hardware config explicit | Partial | Several platform parameters are listed in tables; full simulator configuration unavailable. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Precision / bit-slice assumptions explicit | Partial | Bit index `b`, element bit width `B`, bit-serial discussion, and 8-bit experiment precision are explicit; detailed ADC/DAC precision settings are not exposed as a schema. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Cost model inspectable | Partial | Fitness is simulator execution time; simulator source and full timing model were not found. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Simulator backend documented | Partial | Platform adaptation and parameters are described; cycle-accurate simulator implementation is not public in checked sources. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Generated code / instruction stream inspectable | Unknown / N/A | The paper output is mapping/scheduling strategy; public generated instruction streams were not found. |
| Provenance from source op to backend action | Partial | Operand, dimension, and size binding connect operator loops to hardware dimensions; backend action provenance beyond simulator execution is not exposed. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |
| Reproduction scripts available | Unknown | No public artifact found. |
| Calibration source documented | Partial | Hardware parameters are drawn from DDR4 datasheets and prior hardware papers; simulator calibration or validation data are not exposed. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is conceptual. ARES’s frontend model—static tensor operators as iteration spaces plus affine access matrices—could be reimplemented for conv/GEMM-style DNN operators.
- **As IR inspiration:** The most valuable reusable boundary is the compute/memory abstraction pair, especially the memory mapping matrix with bit index and offset.
- **As mapper/scheduler:** The binding legality rule, memory-capacity constraints, and GA search fields could be adapted into a mapper for a future CIM compiler stack.
- **As cost model:** The simulator-fitness interface is useful as a pattern, but a new implementation would need explicit latency/energy plugins for arrays, data transfer, programming, ADC/DAC, shift-add, and reduction.
- **As backend:** Backend reuse would require rebuilding or wrapping a simulator, because no public simulator/codegen artifact was found.
- **As benchmark:** The workload set—ResNet50, ResNeXt-50, MobileNet, BERT, GoogleNet, DenseNet, selected ResNet18 conv layers, and GEMM shapes—can be reused as a benchmark checklist. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf))
- **As validation source:** The work provides simulator-backed comparative results and hardware parameters from prior systems; it does not provide chip measurements or released calibration traces in the checked sources.

**Integration effort estimate: High.**  
Integration would be most direct through a small reimplementation that extracts ARES’s operator access-matrix model, compute abstraction, memory mapping matrix, binding legality rules, and schedule-genome fields. The missing public artifact means the simulator interface, data formats, and exact search workflow would need to be reconstructed from the paper.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PUMA** | MVM-ReRAM DNN inference, crossbar mapping, weight-stationary execution | PUMA is a specific programmable memristor-based accelerator; ARES abstracts MVM-ReRAM as one target among multiple PIM classes and searches more mapping choices, including copying weight kernels to multiple crossbars. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Classify PUMA as architecture/ISA/backend-centered; classify ARES as cross-platform mapping abstraction. |
| **Neural Cache** | Bit-serial in-cache / SRAM-PIM acceleration of DNNs | Neural Cache provides a fixed mapping baseline for logic-SRAM; ARES derives loop bindings and data reuse legality from access matrices and memory constraints. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | ARES is useful when comparing template mapping against searchable PIM layout legality. |
| **PIM-HBM** | Near-DRAM / commercial DRAM-style PIM with software stack | PIM-HBM is a target-like PNM platform; ARES abstracts the near-memory compute/data-placement problem and searches scheduling/resource allocation. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Separate “hardware/software stack for one product class” from “mapping framework over PNM-style resources.” |
| **SIMDRAM** | Bit-serial SIMD processing using DRAM | SIMDRAM is a logic-DRAM-style reference for bit-serial in-memory processing; ARES maps DNN tensor operators across logic-DRAM-like resources using general compute/memory abstraction. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Useful corpus contrast between hardware capability proposal and compiler/mapping abstraction. |
| **PIM-DL** | Data-layout optimization for DNN inference on digital PIM | PIM-DL is cited as a fixed/template-style baseline family; ARES broadens the object from data layout alone to compute binding, memory mapping, and schedule search. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | Tag PIM-DL closer to layout optimization; tag ARES as mapping-space construction. |
| **AMOS** | Automatic mapping for tensor computations with hardware abstraction | AMOS is a general spatial-accelerator mapper; ARES imports that style of hardware abstraction/search into PIM-specific constraints such as bit-level memory layout and compute-in-memory operand legality. ([Si-Ze Zheng](https://sizezheng.github.io/files/ARES_A_Mapping_Framework_of_DNNs_Towards_Diverse_PIMs_with_General_Abstractions.pdf)) | ARES belongs in the “tensor mapping with PIM-specific layout legality” branch of the corpus. |

## 10. Corpus-ready final takeaway

- ARES’s core contribution is a **PIM hardware abstraction for mapping**, pairing a tensorized compute equation with a bit-level memory mapping matrix and offset.
