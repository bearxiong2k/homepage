---
slug: comonm
title: "CoMoNM: A Cost Modeling Framework for Compute-Near-Memory Systems"
short_title: "CoMoNM"
subtitle: "Scoped CIM stack note"
year: 2025
publication:
  venue: "arXiv:2508.11451"
  type: "other"
  doi: "10.48550/arXiv.2508.11451"
  url: "https://doi.org/10.48550/arXiv.2508.11451"
authors:
  - "Hamid Farzaneh"
  - "Asif Ali Khan"
  - "Jeronimo Castrillon"
author_note: "ScaDS.AI; TU Dresden"
bibtex: |
  @misc{farzaneh2025comonm,
    author = {Farzaneh, Hamid and Khan, Asif Ali and Castrillon, Jeronimo},
    title = {CoMoNM: A Cost Modeling Framework for Compute-Near-Memory Systems},
    year = {2025},
    howpublished = {arXiv:2508.11451},
    doi = {10.48550/arXiv.2508.11451},
    eprint = {2508.11451},
    archivePrefix = {arXiv},
    primaryClass = {cs.ET},
    url = {https://arxiv.org/abs/2508.11451}
  }
citation_source: https://arxiv.org/abs/2508.11451
summary: >-
  CoMoNM is best classified as a CNM latency cost-model framework with a reusable mapping and virtual-instruction interface. It accepts a high-level or low-level application representation, a target CNM configuration, and an explicit hierarchical mapping, then estimates execution time through a split compute-engine/memory-engine execution model. The paper strengthens the cost-model and design-space-exploration layer of the CIM/CNM stack: its most concrete compiler-facing abstractions are the mapping vector, the custom CNM IR, and the `llvcnm` virtual assembly. The demonstrated scope covers UPMEM hardware and Samsung HBM-PIM simulation, with workloads from PrIM and ML kernels/models, and the strongest evidence is latency-prediction accuracy and mapping/hardware what-if exploration rather than end-to-end code generation deployment. ([arXiv](https://arxiv.org/pdf/2508.11451v1))
links:
  paper: https://arxiv.org/pdf/2508.11451v1
  artifact: https://github.com/h4midf/CNM-Cost-model
  docs:
  code:
technology:
  - "UPMEM"
  - "DRAM-CNM"
  - "HBM-PIM"
  - "digital-CIM"
  - "digital-CNM"
workloads:
  - "PrIM vector addition"
  - "PrIM matrix-vector multiplication"
  - "PrIM select"
  - "PrIM histogram"
  - "PrIM scan"
  - "PrIM matrix-matrix multiplication"
  - "PrIM reduction"
  - "HBM-PIM GEMV"
  - "HBM-PIM vector addition"
  - "ReLU"
  - "RNN-T"
  - "AlexNet"
  - "ResNet"
  - "Wav2Vec-style speech model"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A3, A4, A6]
axis_B: [B1, B3, B4, B5, B7]
axis_C_first_class_objects:
  - "hierarchical CNM mapping vector"
  - "rank / DPU / tasklet hierarchy"
  - "channel / bank / FPU hierarchy"
  - "process"
  - "compute-engine"
  - "mem-engine"
  - "exec-engine"
  - "memory hierarchy"
  - "DMA and bank access behavior"
  - "instruction latency LUT entry"
  - "partial-result dependency / accumulation placement"
axis_D_rewrite_objects:
  - "mapping"
  - "iteration-space partition"
  - "loop structure"
  - "instruction stream"
  - "hardware resource configuration"
  - "runtime blocking state"
artifact:
  status: "public repository found but empty / partial; no runnable public CoMoNM artifact found"
  url: "https://github.com/h4midf/CNM-Cost-model"
  license: "unknown / not visible"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best understood as a CNM latency cost-model backend with explicit mapping and virtual-instruction interfaces."
  - "Strongest reusable idea is the hierarchical mapping vector plus compute-engine/mem-engine separation."
  - "CNM IR and llvcnm are described in the paper, but no runnable implementation was visible in the checked public artifact."
  - "Digital CNM/PIM targets make ADC/DAC, analog sensing, and bit-slice reconstruction not applicable in the demonstrated scope."
takeaways: []
---

# CoMoNM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 Simulator & cost model** | CoMoNM’s central object is an execution-time estimator: it takes an application, target CNM system specification, and mapping specification, then returns estimated execution time. The paper positions this as a millisecond-scale cost model for replacing repeated hardware/simulator runs during CNM design and compilation. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Secondary stack roles | **A3 Mapping / scheduling / DSE**, **A4 Explicit IR / virtual ISA stack**, limited **A6 validation on real hardware** | The mapping vector is explicit and hierarchical; CoMoNM explores mapping spaces and hypothetical hardware changes. It also introduces a custom CNM IR and a lower virtual assembly, `llvcnm`, but the strongest evidenced contribution remains latency modeling rather than a full compiler stack. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B3 Loop/tensor-schedule IR**, **B4 Hardware-resource IR**, **B5 Instruction/meta-op/ILA**, limited **B7 runtime-state abstraction** | The stack combines a target configuration file, a mapping vector over hierarchy levels, a custom CNM IR with operands/loops/memory requests, and `llvcnm` instruction streams. The execution engine additionally carries process/thread state, PCs, and blocking state for compute and memory engines. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| First-class CIM objects, Axis C | CNM hierarchy levels, mapping vector, process, compute-engine, mem-engine, memory hierarchy, DMA/bank access behavior, instruction opcode class, latency LUT entry, dependency/partial-result accumulation | The paper directly names ranks/DPUs/tasklets for UPMEM and channels/banks/FPUs for HBM-PIM, and models memory engines, compute engines, processes, and instruction latencies. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Rewrite object, Axis D | **Mapping**, **loop/iteration-space partition**, **instruction stream**, **hardware-resource configuration**, limited **runtime execution state** | The demonstrated transformations are mapping enumeration, partitioning into subspaces, ordering/dependency handling, high-level lowering to CNM IR/`llvcnm`, and “what-if” hardware-resource changes. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Best corpus tags | `CNM`, `cost-model`, `latency-estimation`, `hierarchical-mapping`, `MLIR-linalg`, `virtual-ISA`, `UPMEM`, `HBM-PIM`, `DSE`, `memory-engine-model` | These tags reflect the paper’s demonstrated stack slice and targets. |
| Closest comparison baselines | Cinnamon/CINM, PIMFlow, PIMCOMP, SongC, UPMEM simulator/uPIM, SADIMM | These are closest by stack role: CNM/CIM compiler frameworks, simulation frameworks, and domain-specific CNM cost models. The paper itself compares recent memory-centric compiler frameworks by abstraction level and evaluates against UPMEM and simulator baselines. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |

## 2. One-paragraph public summary

CoMoNM is best classified as a CNM latency cost-model framework with a reusable mapping and virtual-instruction interface. It accepts a high-level or low-level application representation, a target CNM configuration, and an explicit hierarchical mapping, then estimates execution time through a split compute-engine/memory-engine execution model. The paper strengthens the cost-model and design-space-exploration layer of the CIM/CNM stack: its most concrete compiler-facing abstractions are the mapping vector, the custom CNM IR, and the `llvcnm` virtual assembly. The demonstrated scope covers UPMEM hardware and Samsung HBM-PIM simulation, with workloads from PrIM and ML kernels/models, and the strongest evidence is latency-prediction accuracy and mapping/hardware what-if exploration rather than end-to-end code generation deployment. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CoMoNM is a generic cost model for CNM systems that estimates performance rapidly and accurately. | Abstract, Intro contributions, Sec. IV, Conclusion | Algorithm + experiment | The execution engine uses compute/memory engines, instruction-latency LUTs, representative-slice simulation, and extrapolation; evaluation reports UPMEM hardware and HBM-PIM simulator comparisons. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Demonstrated for the modeled UPMEM and Samsung HBM-PIM targets; latency evidence is tied to the paper’s profiled LUTs and benchmark suite. Artifact-level confirmation would require the LUTs, configs, and scripts. |
| CoMoNM accepts high-level hardware-agnostic application representations and lowers them through `cnm-gen` into virtual CNM assembly. | Intro contribution 2; Sec. IV-B/IV-D | Paper-only + IR examples | The paper shows MLIR `linalg`/Torch-style examples, describes extraction of loop ranges, indexing maps, memory access patterns, and dependencies, and shows a CNM IR / `llvcnm` lowering path. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | The paper-level evidence supports the lowering design for example kernels. A runnable public `cnm-gen` artifact was not found in the checked sources. |
| `llvcnm` is a target-agnostic virtual assembly for CNM systems. | Sec. IV-D; Conclusion | Paper-only + instruction example | The paper shows target assembly translated into `llvcnm` instructions such as `LOAD_I32`, `MUL_I32`, `ADD_I32`, `STORE_I32`, `INC`, `JNEQ`, and `JUMP`. It states operands are virtual for UPMEM latency modeling, while HBM-PIM uses operands because latency depends on physical data location. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | The reusable boundary is clearest at instruction-class latency modeling. Functional semantics and operand correctness are not the main evidenced interface. |
| The framework introduces a flexible hierarchical mapping specification. | Intro contribution 3; Sec. IV-C; Figs. 8–9; Eq. 1 | Equation + examples | The mapping is a vector of `K+1` tuples over `N` iteration-space dimensions, with entries representing iteration ranges at hierarchy levels. Examples map GEMV to UPMEM ranks/DPUs/tasklets and HBM-PIM channels/banks/FPUs. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Demonstrated as explicit mapping input for partitioning, allocation order, dependency handling, and DSE. Reuse would benefit from a serialized schema and validator. |
| CoMoNM models compute and memory subsystems separately. | Sec. IV-A; Sec. V-A | Algorithm + paper model | The compute-engine models UPMEM pipelines and HBM-PIM FPUs with PIPELINE and VECTOR_PROC modes; the mem-engine models MRAM/WRAM, registers/banks, access restrictions, blocking/non-blocking access, DMA, and contention. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | The demonstrated scope is latency modeling for digital CNM/PIM resources. Analog nonideality and ADC/DAC effects are outside this paper’s target abstraction. |
| CoMoNM can guide design-space and mapping-space exploration. | Sec. VI-D/VI-E | Experiment | The paper evaluates hypothetical UPMEM changes, including DMA engine behavior, pipeline stages, functional units, WRAM size, and MRAM size; it also exhaustively generates mappings for 4/8/16-DIMM configurations and reports mapping-performance variation. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Demonstrated through modeled UPMEM what-if studies and predicted mapping distributions. The paper-level evidence supports design ranking; artifact-level reproduction would require public scripts/configs. |
| CoMoNM is open source. | Motivation / Sec. III text | Artifact check | The paper calls CoMoNM “an open-source tool.” A public GitHub repository named `h4midf/CNM-Cost-model` was found, but GitHub reports “This repository is empty.” The cfaed publication page lists no downloads. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Artifact status is partial/empty at the checked public boundary; no runnable implementation, examples, or reproduction scripts were visible in the checked sources. |

## 4. Stack anatomy

```text
Input / frontend:
  High-level MLIR linalg / affine-style IR, C/C++ or target assembly, Torch-style frontend examples, or direct llvcnm.
  Object type: graph/loop DSL, target assembly, or virtual instruction stream.
  Public artifact status: paper examples are inspectable; runnable frontend artifact not found.

Middle representation:
  Custom CNM IR followed by llvcnm virtual assembly.
  Object type: CNM IR with operands, types, memory requests, loops, operations, and execution order; llvcnm as virtual instruction stream.
  Public artifact status: paper snippets are inspectable; schema/parser implementation not found.

Mapping or scheduling state:
  Hierarchical mapping vector m over iteration-space dimensions and CNM hierarchy levels.
  Object type: mapping/config object, shown as vectors of tuples and subspace mappings.
  Public artifact status: examples are inspectable in paper; serialized schema not found.

Hardware abstraction:
  Target system specification file plus compute-engine, mem-engine, exec-engine, process model, and latency LUTs.
  Object type: hardware-resource configuration and simulator state.
  Public artifact status: described in paper; concrete config files and LUTs not found.

Backend / simulator / codegen:
  Execution engine simulates representative instruction slices through compute/memory accept rules and extrapolates latency.
  Object type: latency model / simulator kernel, not hardware codegen in the demonstrated public boundary.
  Public artifact status: algorithm is visible; implementation not found.

Output artifact:
  Estimated execution time / report for a given application, target, and mapping.
  Object type: cost-model output.
  Public artifact status: paper reports figures/tables; output format not found.

Evaluation loop:
  Random mapping generation, hardware/simulator comparison, hypothetical hardware-resource changes, and exhaustive mapping enumeration.
  Object type: experimental DSE loop.
  Public artifact status: paper describes workflow; scripts not found.
```

This stack reading is based on the paper’s Fig. 6 flow, its Sec. IV lowering description, and Sec. V execution-engine model. The target description is explicitly described as a configuration file, while the main CoMoNM modules are process, compute-engine, mem-engine, and exec-engine components. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the CNM IR, `llvcnm`, the mapping vector, target configuration, latency LUTs, and simulator runtime state. The paper foregrounds `llvcnm` and the CNM IR as named representations, while the reusable semantics are most visible in the mapping vector and in the compute-engine/mem-engine contract: which instruction type goes to which engine, which resource can accept it, and when a process/thread remains blocked. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 Simulator & cost model.**  
CoMoNM owns the slice from “application + target spec + mapping” to estimated latency. The main backend object is not a chip layout or generated executable; it is an execution-time estimate produced by a modeled compute/memory system and latency LUTs. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The paper’s mapping vector is an explicit compiler/DSE input. It partitions an iteration space across ranks/DPUs/tasklets or channels/banks/FPUs, supports multiple subspaces, orders maps by indices, and models dependency-driven accumulation. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**Secondary: A4 Explicit IR / dialect / ISA compiler stack.**  
CoMoNM introduces two named intermediate representations: a higher CNM IR and `llvcnm`. The paper provides examples of MLIR `linalg` lowering into CNM IR and then into virtual instructions. The demonstrated compiler stack is strongest as an interface into the cost model. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**Limited: A6 Programming / runtime / benchmark on real hardware.**  
UPMEM evaluation uses a real 16-DIMM system, while HBM-PIM evaluation uses Samsung’s simulator. This provides calibration/validation evidence, but the public stack object remains a model rather than a runtime system. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The target system description is a configuration file that defines target type and parameters. The model’s behavior depends on target-specific compute-engine mode, memory hierarchy, latency LUTs, and accept rules. The paper describes these objects, but a public schema and concrete configuration files were not visible in the checked artifact boundary. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**B3 Loop / tensor-schedule IR.**  
The `linalg` import path extracts loop ranges, indexing maps, affine maps, memory access patterns, and dependencies. The custom CNM IR then records loop induction variables, operations, memory requests, and execution order. This is the closest object upstream compiler passes could rewrite before `llvcnm` lowering. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**B4 Hardware-resource IR.**  
The mapping vector directly names compute hierarchy levels and allocates iteration-space factors to those levels. This is hardware-resource IR in compact form: the same mathematical mapping style is used for UPMEM ranks/DPUs/tasklets and HBM-PIM channels/banks/FPUs. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**B5 Instruction / meta-op / ILA.**  
`llvcnm` is a virtual instruction layer containing typed operations such as load, store, arithmetic, increments, and branches. Its operands are virtual for UPMEM latency modeling, but physical-location-sensitive for HBM-PIM latency. This makes `llvcnm` a latency-oriented virtual assembly rather than a fully evidenced functional ISA. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

**B7 Runtime-state abstraction, limited.**  
Algorithm 1 exposes thread states, per-thread program counters, vector state, and blocking/unblocking behavior. These are central to latency estimation but appear as execution-engine state rather than a serialized compiler IR. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable as crossbar; hardware hierarchy is first-class** | The evaluated targets are UPMEM and Samsung HBM-PIM, with ranks/DPUs/tasklets and channels/banks/FPUs modeled as hierarchy levels. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Bit-slicing / bit significance | **Not applicable / type parameter only** | The CNM IR records operand structure and type, including scalar/array and numeric datatype, but no bit-slice representation is described. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| ADC/DAC precision or sensing | **N/A** | UPMEM and HBM-PIM are modeled as digital CNM/PIM resources; the paper’s modeled resources are pipelines, FPUs, DMA, banks, MRAM/WRAM/registers. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Analog-to-digital or domain transition | **N/A** | No analog compute/sense transition is represented in the checked paper sections. |
| Peripheral circuits as path nodes | **Costed / first-class for digital CNM resources** | DMA, bank interfaces, memory hierarchy, access restrictions, and resource contention are modeled in the mem-engine. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Partial-sum accumulation path | **Costed / partially first-class through dependencies** | Mapping along dependency dimensions creates partial results; if the target supports rank-level accumulation it is performed there, otherwise partial results are sent higher in the hierarchy, e.g., CPU for UPMEM. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Reconstruction / shift-add tree | **N/A** | No reconstruction or shift-add path is described for the evaluated digital CNM/PIM targets. |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime state is internal; masks/KV/batching/sparsity not evidenced** | Algorithm 1 uses thread state, per-thread PCs, vector state, and blocked/free state. No first-class masks, KV cache, or batching abstraction appears in the checked sources. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |
| Value trajectory / flow path | **Approximated through memory requests, instructions, and mapping** | CNM IR has memory requests, loops, operations, and execution order; the model tracks resource use and latency, but value identity across all storage/compute stages is not the central named object. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) |

### 5.4 Axis D — rewrite object

The paper actually rewrites or varies four main objects:

1. **Loop / iteration-space partition:** mapping vectors divide an N-dimensional iteration space across hierarchy levels and subspaces.  
2. **Hardware mapping:** ranks, DPUs, tasklets, channels, banks, FPUs, WRAM/MRAM sizes, and resource constraints are varied or modeled.  
3. **Instruction stream:** target assembly and `linalg`-derived CNM IR lower into `llvcnm`.  
4. **Runtime-resource schedule:** the execution engine simulates which compute/memory engine accepts an instruction and when processes block.

Legal transformations in the paper’s framework include changing tile/subspace shapes, changing hierarchy-level assignment, changing execution precedence among maps, varying target-resource parameters, and comparing generated `linalg`-derived code against clang-generated assembly. The main equivalence exploited is that different mappings or instruction orders can compute the same kernel while inducing different memory contention, bank behavior, or pipeline utilization. The representation must preserve loop bounds, indexing maps, memory access patterns, dependency dimensions, data type, operation order, and target hierarchy bindings. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

The representation is especially well suited to latency-oriented mapping and hardware-parameter exploration. Expressing trajectory-level rewrites such as moving reconstruction across operator boundaries, changing analog/digital transition timing, or carrying bit-sliced partial sums would likely require an additional abstraction for value identity, numeric stage, and domain transition.

## 6. Technical mechanism reading

### 6.1 Mapping as the central compiler-facing object

CoMoNM’s most reusable formal object is the mapping vector. For an N-dimensional iteration space and K compute-hierarchy levels, the map is a vector of K+1 tuples; each tuple has N entries, and an entry identifies how much of a given iteration dimension is performed at a hierarchy level. This compactly binds loop/tensor space to hardware resources. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

The mapping examples show a useful property for compiler work: the same representation can express multiple independent subspaces, hierarchy-level partition factors, and execution precedence. In UPMEM, the hierarchy is ranks → DPUs → tasklets; in HBM-PIM, it is channels → banks → FPUs. Dependencies are inferred from which iteration dimension is partitioned; splitting a reduction dimension creates partial results that must later be accumulated. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 6.2 Two-step IR lowering: `linalg` → CNM IR → `llvcnm`

The paper’s frontend story is a two-level lowering path. `linalg` input is analyzed for loop ranges, indexing maps, affine maps, memory accesses, and dependencies. It is then transformed into a custom CNM IR with operand/type declarations, induction variables, memory requests, operations, loops, and execution order. Finally, the CNM IR lowers to `llvcnm`, with target-specific memory hierarchy affecting load/store generation and control flow. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

For compiler/IR research, the split is important. The CNM IR is the more semantic layer: it still names operands, loops, memory requests, and order. `llvcnm` is the lower latency interface: instructions are simple and typed, and operands are partly target-dependent in their relevance to timing. For UPMEM, operands are virtual and not used for latency; for HBM-PIM, operands matter because latency depends on physical location. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 6.3 Cost model: compute-engine, mem-engine, exec-engine

CoMoNM separates the modeled CNM system into compute-engine, mem-engine, exec-engine, and process abstractions. The compute-engine models execution resources such as UPMEM DPU pipelines and HBM-PIM FPUs, with PIPELINE and VECTOR_PROC modes. The mem-engine models MRAM/WRAM, registers/banks, access restrictions, contention, blocking accesses, and non-blocking DMA transfers. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

This separation is useful because it turns latency into a resource-acceptance problem: can the compute engine or memory engine accept the next instruction for a given process at this cycle? If yes, the instruction dispatches and the resource becomes blocked until the operation completes. This captures effects such as concurrent DMA requests from multiple UPMEM tasklets. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 6.4 Representative-slice simulation and extrapolation

Algorithm 1 uses a hybrid approach between full instruction-level simulation and analytic formulas. It extracts representative portions of the iteration space using `get_portion`, simulates those portions instruction-accurately, checks a convergence condition between two portion sizes, and extrapolates to the remaining iteration space. The paper states that the smallest portion executes all instructions at least once, allowing repetitive kernel behavior to be captured without simulating every iteration. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

This is a key technical design: latency estimation becomes fast because CoMoNM samples enough of the instruction/resource interaction to learn the pattern, then scales it. The approach is particularly aimed at repetitive kernels where DMA, bank, or pipeline blocking behavior stabilizes over representative slices. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 6.5 Workload and hardware assumptions

The UPMEM setup uses a 16-DIMM real machine, 350 MHz DPUs, 64 MB MRAM, and 64 KB WRAM; HBM-PIM uses Samsung’s simulator with 16 channels, 16 banks per channel, 8 PIMUnits per channel, and 16 FPUs per PIMUnit. The paper explicitly excludes off-chip host-bus data communication time. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

UPMEM benchmarks come from PrIM: vector addition, GEMV, select, histogram, scan, GEMM, and reduction. HBM-PIM benchmarks include GEMV, vector addition, ReLU, RNN-T, AlexNet, ResNet, and Wav2Vec-style speech representation. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

### 6.6 Calibration and validation boundary

The cost model relies on pre-stored LUTs derived from target-system characterization. Validation compares predicted latency with UPMEM hardware and Samsung HBM-PIM simulator latency over 1024 random mappings per benchmark, with geometric means over ten runs. Reported average errors include 2.99% for HBM-PIM and UPMEM trends with higher error for DMA-heavy kernels. ([arXiv](https://arxiv.org/pdf/2508.11451v1))

The reproducibility boundary is therefore the unavailable LUT/config/script layer. The paper gives enough mechanism to understand the model, but public reuse would require the concrete target specifications, calibrated latencies, mapping generator, and workload lowering scripts.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The mapping vector is the cleanest reusable IR boundary

- **Observation:** The mapping vector directly binds iteration-space dimensions to hierarchy levels and can represent multiple subspaces plus execution precedence.
- **Why it matters for CIM compiler/IR work:** It is a compact, architecture-parametric object that can sit between an MLIR-style loop/tensor IR and a target-specific backend.
- **Reusable lesson:** Future CIM stacks could adopt a typed mapping object with validators for hierarchy coverage, dependency dimensions, capacity constraints, and accumulation placement.

### Insight 2 — CoMoNM’s “IR” is distributed across three layers

- **Observation:** CNM IR captures semantic loop/memory structure, `llvcnm` captures latency-relevant instruction classes, and target configs/LUTs define timing semantics.
- **Why it matters for CIM compiler/IR work:** A first-class IR boundary must decide whether timing belongs in instruction attributes, hardware-resource types, external cost tables, or pass context.
- **Reusable lesson:** A public corpus should record CoMoNM as an IR-plus-cost-model stack, not as a standalone semantic compiler IR.

### Insight 3 — Compute/memory engine separation gives a concrete backend contract

- **Observation:** The execution model asks whether compute or memory resources can accept an instruction, then models blocked/free state.
- **Why it matters for CIM compiler/IR work:** This is a useful abstraction for backends where memory movement, DMA, banking, and compute issue are co-equal schedulable resources.
- **Reusable lesson:** A future CIM IR could expose resource-acceptance constraints as verifiable scheduling contracts rather than embedding them inside simulator code.

### Insight 4 — Operand semantics are target-dependent in `llvcnm`

- **Observation:** UPMEM latency modeling treats operands as virtual, while HBM-PIM latency depends on physical data location.
- **Why it matters for CIM compiler/IR work:** The same opcode-level IR may require target-specific operand meaning; address/location metadata can be semantically relevant for one backend and irrelevant for another.
- **Reusable lesson:** A robust virtual CIM assembly should separate functional operands, physical placement operands, and timing-relevant attributes.

### Insight 5 — Representative-slice execution is a practical middle ground for CIM cost models

- **Observation:** CoMoNM avoids full simulation by simulating representative slices and extrapolating once behavior stabilizes.
- **Why it matters for CIM compiler/IR work:** CIM/CNM mapping search needs fast evaluators, but purely symbolic formulas often miss contention and pipeline effects.
- **Reusable lesson:** Future stacks could expose a “sampled schedule trace” object: small enough for search, detailed enough to carry engine contention and memory-path behavior.

### Insight 6 — Calibration data is part of the backend interface

- **Observation:** The model depends on profiled instruction latencies and target-specific LUTs.
- **Why it matters for CIM compiler/IR work:** A cost-model backend is reusable only when its calibration tables, units, and provenance are available and versioned.
- **Reusable lesson:** Corpus metadata should distinguish “paper describes cost model” from “artifact exposes calibrated backend.”

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found, but it is empty / partial. No runnable public CoMoNM artifact was found in the checked sources.**

- **Artifact identifier:** `h4midf/CNM-Cost-model`.
- **Evidence:** The first author’s GitHub profile lists a public `CNM-Cost-model` repository, and opening it shows GitHub’s message: “This repository is empty.” ([GitHub](https://github.com/h4midf?tab=repositories))
- **Paper-artifact mismatch:** The paper states that CoMoNM is an open-source tool, but the checked repository contains no files, README, scripts, configs, or license. ([arXiv](https://arxiv.org/pdf/2508.11451v1))
- **Institutional publication page:** cfaed lists the paper and says “No Downloads available for this publication.” ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/publications?pubId=3854))
- **License:** Unknown / not found in the checked CoMoNM repository.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** An empty public repository shell.
- **What the artifact appears to omit:** Source code, `cnm-gen`, CNM IR schema, `llvcnm` parser/emitter, target configs, latency LUTs, benchmark scripts, mapping generator, reproduction workflow, and figure-generation scripts.
- **Minimal command/workflow:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from artifact:** Unknown; no reproduction scripts were visible.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper examples show MLIR `linalg`, Torch-style source, target assembly, CNM IR snippets, and `llvcnm`, but no public schema/parser was found. |
| Intermediate representation serialized | Partial | CNM IR and `llvcnm` snippets are shown; serialization format and implementation were not found. |
| Mapping decisions inspectable | Partial | Mapping vectors are explicitly shown in the paper; no public mapping files or validator found. |
| Schedule inspectable | Partial | Execution order and algorithmic state are described; generated schedule traces not found. |
| Hardware config explicit | Partial | Paper gives target parameters and says target description is a config file; public config files not found. |
| Precision / bit-slice assumptions explicit | Partial / N/A | Numeric datatypes are represented; bit-slicing is not applicable to the demonstrated digital CNM/PIM targets. |
| Cost model inspectable | Partial | Algorithm 1 and module descriptions are visible; LUTs and implementation not found. |
| Simulator backend documented | Partial | Compute-engine/mem-engine and execution engine are described; runnable simulator not found. |
| Generated code / instruction stream inspectable | Partial | Paper shows assembly and `llvcnm` examples; generated files not found. |
| Provenance from source op to backend action | Partial | `linalg` → CNM IR → `llvcnm` path is described, but source-to-instruction trace metadata not found. |
| Reproduction scripts available | Unknown | No runnable CoMoNM artifact or scripts found. |
| Calibration source documented | Partial | Paper says LUTs come from target performance characterization; concrete calibration data not found. |

### 8.3 Integration helper

- **As frontend:** CoMoNM’s described `linalg` import path is useful as a frontend pattern, especially the extraction of loop ranges, affine/indexing maps, memory accesses, and dependencies. Reuse would depend on obtaining or reimplementing `cnm-gen`.
- **As IR inspiration:** The strongest borrowable abstractions are the custom CNM IR fields—operand/type, induction variable, memory request, operation, loop, execution order—and the lower `llvcnm` instruction interface.
- **As mapper/scheduler:** The hierarchical mapping vector is directly reusable as a mapper contract. A future stack could add legality checks for capacity, dependency dimensions, resource coverage, and accumulation placement.
- **As cost model:** The compute-engine/mem-engine split and representative-slice simulation strategy could become backend plugins for digital CNM/PIM targets.
- **As backend:** Wrapping CoMoNM directly is currently blocked by artifact availability. Reimplementation would be most direct through the paper’s Algorithm 1, mapping equation, and target-resource descriptions.
- **As benchmark:** The workload list is reusable: PrIM for UPMEM and ML kernels/models for HBM-PIM. Public reproduction would require mapping sets and target configs.
- **As validation source:** UPMEM hardware measurements and Samsung simulator comparisons are valuable calibration references, but calibration tables and raw measurements were not found.

**Integration effort estimate: High.**  
Integration would be most direct through a reimplementation of the mapping vector, CNM IR, `llvcnm`, and execution-engine algorithm. The paper provides a clear conceptual backend contract, but the checked public artifact does not expose implementation files, configs, LUTs, or scripts. The most valuable reusable boundary appears to be the hierarchical mapping specification plus the compute/memory-engine cost-model split.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **Cinnamon / CINM** | MLIR-based compiler stack for heterogeneous CIM/CNM targets; CoMoNM is positioned as integrable with CINM. | Cinnamon foregrounds dialects, conversions, and transformations; CoMoNM foregrounds latency estimation and mapping evaluation. The public Cinnamon repo contains sources, abstractions, transformations, and build instructions, unlike the checked CoMoNM artifact boundary. ([GitHub](https://github.com/tud-ccc/Cinnamon)) | Classify Cinnamon as compiler/IR infrastructure and CoMoNM as cost-model/DSE infrastructure with IR adapters. |
| **PIMFlow** | Mapping/compilation for PIM/CIM workloads. | CoMoNM is closer to a generic evaluator that can compare mappings than a full workload compiler. | Corpus should separate “chooses/rewrites schedule” from “scores candidate schedules.” |
| **PIMCOMP** | Compiler framework for PIM systems and abstraction-level optimization. | CoMoNM’s paper explicitly categorizes PIMCOMP among compiler frameworks by abstraction level, while CoMoNM adds a cost model for exploring choices across those levels. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Useful baseline for stack-role contrast: compiler optimization vs. cost-model feedback. |
| **SongC** | Compiler/programming framework for near-memory / memory-centric systems. | CoMoNM’s named middle object is the mapping + latency model, while SongC is closer to programming/compiler infrastructure. | Nearby works should be compared by first-class object, not performance ranking. |
| **UPMEM simulator / uPIM** | Execution-time evaluation for UPMEM-like systems. | CoMoNM models DMA timing/resource contention explicitly enough to report better accuracy and far faster estimation in the paper’s experiments. ([arXiv](https://arxiv.org/pdf/2508.11451v1)) | Simulator baselines belong in the corpus as validation backends, not compiler IR stacks. |
| **SADIMM** | Accurate CNM modeling for a specific workload class. | SADIMM is described by CoMoNM as domain-specific for sparse attention, whereas CoMoNM aims at a broader CNM cost-model interface. ([arXiv](https://arxiv.org/html/2508.11451v1)) | Distinguish domain-specific analytical models from reusable mapping/IR cost-model frameworks. |

## 10. Corpus-ready final takeaway

- CoMoNM’s real contribution is a latency-estimation backend for CNM systems, centered on explicit application, target, and mapping inputs.
- Its strongest reusable stack layer is the hierarchical mapping specification, which maps iteration-space dimensions to CNM hierarchy levels.
- The named IR stack has two layers: a custom CNM IR for operands, loops, memory requests, operations, and execution order, then `llvcnm` as a lower virtual instruction stream.
- The cost model separates compute-engine and memory-engine behavior, making DMA, bank access, pipeline issue, and resource blocking visible to the evaluator.
- The evidenced scope covers UPMEM hardware and Samsung HBM-PIM simulation with PrIM and ML workloads; host off-chip communication is outside the experiment scope.
- The hidden IR is the combined state of mapping vector, target config, latency LUTs, instruction stream, and process/blocking state.
- Artifact status: a public `CNM-Cost-model` repository was found but is empty; no runnable public CoMoNM artifact was found in the checked sources.
- For value-trajectory IR work, CoMoNM contributes useful mapping and resource-path ingredients, but trajectory-level semantics would add value identity, precision stage, and domain-transition metadata.
