---
slug: pimcomp
title: "PIMCOMP: An End-to-End DNN Compiler for Processing-In-Memory Accelerators"
short_title: "PIMCOMP"
subtitle: "Scoped CIM stack note"
year: 2025
publication:
  venue: "IEEE Trans. Comput. Aided Des. Integr. Circuits Syst."
  type: "article"
  doi: "10.1109/TCAD.2024.3496847"
  url: "https://doi.org/10.1109/TCAD.2024.3496847"
authors:
  - "Xiaotian Sun"
  - "Xinyu Wang"
  - "Wanqian Li"
  - "Yinhe Han"
  - "Xiaoming Chen"
bibtex: |
  @article{DBLP:journals/tcad/SunWLHC25,
    author = {Xiaotian Sun and Xinyu Wang and Wanqian Li and Yinhe Han and Xiaoming Chen},
    title = {{PIMCOMP}: An End-to-End {DNN} Compiler for Processing-In-Memory Accelerators},
    journal = {{IEEE} Trans. Comput. Aided Des. Integr. Circuits Syst.},
    volume = {44},
    number = {5},
    pages = {1745--1759},
    year = {2025},
    doi = {10.1109/TCAD.2024.3496847},
    url = {https://doi.org/10.1109/TCAD.2024.3496847}
  }
citation_source: https://dblp.org/rec/journals/tcad/SunWLHC25
summary: >-
  PIMCOMP is best read as a crossbar-PIM/CIM DNN deployment compiler whose most reusable contribution is the middle/backend optimizer: it converts an ONNX-style DNN description into a structure IR plus weight data, partitions weights into **array groups**, optimizes weight replication and AG layout across cores, schedules high-throughput or low-latency inter-layer pipelines, and emits pseudo-instruction/configuration artifacts for verification and simulation. The paper strengthens the CIM compiler stack at the mapping/scheduling boundary rather than at a formal general-purpose IR boundary: its named abstractions are structure IR, hardware configuration, array groups, mapping info, pseudo-instructions, and pixel-level runtime management. The demonstrated setting is static DNN inference on configurable NVM crossbar-style PIM accelerators, evaluated with simulator-backed experiments over VGG/ResNet/GoogleNet-style workloads and three abstracted architecture instances. ([arXiv](https://arxiv.org/pdf/2411.09159v1))
links:
  paper: https://doi.org/10.1109/TCAD.2024.3496847
  artifact: https://github.com/sunxt99/PIMCOMP-NN
  docs:
  code:
technology:
  - "NVM-crossbar"
  - "analog-CIM"
  - "crossbar-PIM"
  - "hybrid"
workloads:
  - "DNN inference"
  - "CNNs"
  - "VGG8"
  - "ResNet18"
  - "ResNet34"
  - "GoogleNet"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A4, A2]
axis_B: [B1, B2, B4, B5, B7]
axis_C_first_class_objects:
  - "structure_IR"
  - "weight_data"
  - "crossbar_array"
  - "PIMFU"
  - "core"
  - "local_memory"
  - "global_memory"
  - "array_group"
  - "weight_replica"
  - "AG_to_core_mapping"
  - "pseudo_instruction"
  - "pixel_runtime_record"
  - "hardware_config"
axis_D_rewrite_objects:
  - "operator_graph"
  - "weight_unfolding"
  - "array_group_partition"
  - "weight_replication"
  - "hardware_mapping"
  - "computation_storage_mapping"
  - "instruction_stream"
  - "pipeline_schedule"
  - "runtime_memory_state"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/sunxt99/PIMCOMP-NN"
  license: "Apache-2.0"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Best classified as a compiler/mapping framework with narrow end-to-end integration."
  - "Array group is the paper-specific CIM compiler object to preserve in the corpus."
  - "Pseudo-instructions are simulator/backend-facing, while formal value-trajectory semantics would need additional typed metadata."
takeaways: []
---

# PIMCOMP — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework** | The strongest contribution is the optimizer: layer partitioning, layout-computation mapping, GA-based weight layout/replication, and HT/LL dataflow scheduling. The paper explicitly describes these as the optimizer’s three general stages and uses profiler feedback to tune mapping/scheduling. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Secondary stack roles | **A5 Narrow end-to-end co-design**, **A4 ISA/meta-op compiler stack**, **A2 simulator/cost-model adjunct** | The paper claims an end-to-end compiler from ONNX-style DNN models to pseudo-instructions and hardware operation streams, with a profiler for latency/throughput/energy. The artifact exposes frontend/backend/verification modules and pimsim-nn integration, but the reusable compiler boundary is clearest at JSON structure IR, mapping info, and pseudo-instruction/simulation outputs. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B5 Instruction/meta-op**, **B7 Runtime-state abstraction** | The paper names a “structure IR,” array groups, mapping info, pseudo-instruction streams, and pixel-level runtime records. The artifact also exposes `config.json`, intermediate JSON, verification JSON, and simulation gzip outputs. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| First-class CIM objects, Axis C | Crossbar array, PIMFU, core, local/global memory, array group, weight replica, AG-to-core mapping, pseudo-instruction, ADC/DAC-like precision parameters, pixel-level runtime record | The named CIM-specific programming object is the **array group**, a set of arrays sharing inputs and serving as mapping/scheduling unit. Hardware hierarchy and precision/resource parameters are explicit in the architecture template and artifact config. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Rewrite object, Axis D | **Mapping**, **array binding**, **memory layout**, **instruction stream**, **operator-level schedule**, **runtime pixel state** | The compiler reshapes weights into unfolding formats, partitions them into AGs, chooses replication/layout, maps tasks to replicas/cores, schedules HT or LL pipelines, and emits pseudo-instruction streams. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Best corpus tags | `compiler-mapping`, `array-group`, `crossbar-CIM`, `NVM-crossbar`, `DNN-inference`, `ONNX`, `pseudo-instruction`, `PIM-simulator`, `weight-replication`, `pipeline-scheduling` | Tags reflect the demonstrated stack boundary: DNN graph import, crossbar-resource mapping, pseudo-instruction generation, and simulator-facing artifacts. |
| Closest comparison baselines | **PUMA**, **Polyhedral**, **SongC**, **Co-Design**, **TC-CIM/TDO-CIM/CINM/OCC** | The paper’s own comparison table places PIMCOMP against prior PIM compilation tools by design philosophy, schedule granularity, end-to-end support, hardware configurability, application diversity, and system optimization; experiments compare mainly against SongC, PUMA, and Polyhedral. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |

## 2. One-paragraph public summary

PIMCOMP is best read as a crossbar-PIM/CIM DNN deployment compiler whose most reusable contribution is the middle/backend optimizer: it converts an ONNX-style DNN description into a structure IR plus weight data, partitions weights into **array groups**, optimizes weight replication and AG layout across cores, schedules high-throughput or low-latency inter-layer pipelines, and emits pseudo-instruction/configuration artifacts for verification and simulation. The paper strengthens the CIM compiler stack at the mapping/scheduling boundary rather than at a formal general-purpose IR boundary: its named abstractions are structure IR, hardware configuration, array groups, mapping info, pseudo-instructions, and pixel-level runtime management. The demonstrated setting is static DNN inference on configurable NVM crossbar-style PIM accelerators, evaluated with simulator-backed experiments over VGG/ResNet/GoogleNet-style workloads and three abstracted architecture instances. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “End-to-end DNN compiler” from high-level DNN description to pseudo-instructions | Abstract and contribution list | Paper + artifact | Paper describes frontend, optimizer, backend, profiler; artifact README documents ONNX frontend, JSON backend input, backend command-line flags, verification JSON, intermediate JSON, and simulation gzip output. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Demonstrated for supported DNN inference operators and static models; README lists supported ops and additional assumptions for new models. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Configurable PIM accelerator abstraction | Section III, Fig. 1, Table II | Paper + config artifact | Paper defines chips, cores, PIMFUs, crossbar arrays, local/global storage, VFUs, execution patterns, and configurable parameters; artifact `config.json` exposes crossbar count/size, cell precision, ADC/DAC counts/resolutions, local/global memory timings, bus topology, and core count. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Strongest for NVM crossbar-style accelerators compatible with Crossbar/IMA/Tile/Chip-style hierarchies; per-hardware primitive translation depends on user-provided hardware library/backend. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Array group as programming/mapping unit | Section V-A, Fig. 6 | Paper mechanism | An AG is defined by vertically partitioning each unfolded weight matrix according to array height; each AG contains `ceil(W/Warray)` arrays and becomes the mapping/scheduling unit. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | The reusable abstraction is clear for convolution/FC-style MVM work mapped to crossbars; richer cross-operator numeric trajectories would require additional value-level metadata. |
| Flexible unfolding format | Section V-B, Table IV | Equation/table + heuristic | Unfolding is represented as `(H,W,P)` with `HWP = IOK²`; five valid methods are compared by computation cycles, data loading volume, and memory overhead; a greedy selector prioritizes compute cycles and then HT/LL-specific secondary criteria. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | The paper-level evidence supports convolutional weight unfolding and resource/performance tradeoffs; artifact-level schema for external rewrite of unfolding choices is less explicit in README. |
| Weight-layout guided computation-storage mapping | Section VI, Fig. 7/8 | Algorithmic method + profiler loop | GA encodes AG counts and core positions in chromosomes, mutates AG distribution and replication, and uses profiler-estimated performance after scheduling a simplified pseudo-instruction stream as fitness. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Demonstrated as mapping/search logic inside the compiler; external tools would likely wrap or extract AG/core mapping state rather than consume a stable public IR schema. |
| HT and LL scheduling modes | Section VII, Algorithms 1–2 | Algorithms + experiments | HT uses layer grouping and saturated pipeline generation for reusable pseudo-instructions; LL uses pixel-level dependency/memory management, transmission request batching, and a layer queue. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Demonstrated for static DNN inference and paper workloads; dynamic batching, sparsity, KV-cache state, or runtime admission control are outside the evidenced scope. |
| Throughput/latency/energy gains | Evaluation Section VIII | Experiment | Simulated across three architecture instances and four networks; reported average HT throughput gain of 3.3× over Polyhedral and LL latency improvements of 21.8×, 9.8×, and 5.4× over SongC, PUMA, and Polyhedral. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Results are simulator-backed with power data drawn/scaled from prior tools and literature; hardware measurement or chip-in-loop validation is not the main evidence base. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Public implementation | Abstract + README | Code/artifact | The paper states PIMCOMP is open-sourced; GitHub README documents modules, usage, verification, pimsim-nn connection, supported models/operators, and Apache-2.0 license. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Artifact appears suitable for inspecting compile artifacts and running documented examples; paper-figure reproduction from one command is not documented in the checked README. |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX DNN model. The frontend parses ONNX, splits structure IR from weight data,
  and can emit JSON containing node parameters and topological connections.
  Serialized and inspectable through model JSON files; reusable for the documented
  operator subset. 

Middle representation:
  “Structure IR” containing layer index, layer type, layer attributes, input/output
  dimensions, providers, and consumers; weight data kept separately. This is graph-like,
  serialized as JSON for backend input, and used as a lightweight proxy during optimizer
  iterations.

Mapping or scheduling state:
  Array groups, unfolded weight matrices, weight replicas, AG-to-core mapping,
  chromosome state for GA, LayerGroupList for HT scheduling, LayerQueue and pixel-level
  dependency/runtime records for LL scheduling. Partly serialized through IntermediateInfo,
  VerificationInfo, and SimulationInfo outputs when flags are enabled.

Hardware abstraction:
  Configurable chips, cores, PIMFUs, crossbar arrays, VFUs, local/global memories,
  interconnect parameters, execution model, and communication mechanism. In the artifact,
  `config.json` exposes several simulator/backend fields including xbar size, cell
  precision, ADC/DAC fields, memory timing, bus topology, and core count.

Backend / simulator / codegen:
  Backend quantizes weights, partitions/bit-splits them, maps to arrays according to
  mapping info, and translates pseudo-instructions into hardware primitives using a
  user-provided hardware library. The artifact can produce simulator input for pimsim-nn.

Output artifact:
  EvaluationResult.txt, VerificationInfo.json, IntermediateInfo.json, SimulationInfo.gz,
  plus instruction/configuration artifacts consumed by verification or pimsim-nn.

Evaluation loop:
  Profiler consumes architecture parameters and pseudo-instruction streams, simulates
  timing axes, structural/data conflicts, synchronization, power if supplied, and
  statistics such as utilization, memory footprint, communication, and memory access.
```

The paper and README support this anatomy: the paper’s Fig. 4 labels frontend, optimizer, backend, profiler, structure IR, weight data, mapping info, pseudo-instruction stream, and instruction stream; the README documents ONNX-to-JSON conversion and flags for saving evaluation, verification, intermediate, and simulation outputs. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of structure IR, weight-data split, hardware config, AG partitioning, replication/layout search state, mapping info, pass order, and generated pseudo-instruction streams. The paper foregrounds pseudo-instructions as the software-hardware interface, while the reusable semantics are most visible in the AG mapping abstraction and the JSON/config/output artifacts that connect frontend, optimizer, verifier, and simulator. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
PIMCOMP owns the slice from DNN graph/weight representation to hardware mapping and schedule. Its core transformations are layer partitioning, AG formation, weight replication/layout, computation-storage mapping, and HT/LL scheduling. The input to this slice is structure IR plus weight data and hardware configuration; the output is mapping info plus pseudo-instruction streams. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**Secondary: A5 Narrow end-to-end co-design.**  
The stack is presented end-to-end: ONNX frontend, optimizer, backend, profiler, verification, and simulator connection. The demonstrated scope is DNN inference on configurable NVM crossbar-style PIM accelerators, with artifact assumptions around supported operators, ONNX float input, and model-shape restrictions documented in README. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

**Secondary: A4 Explicit IR / ISA compiler stack.**  
PIMCOMP does not introduce a general IR framework such as MLIR, but it does define a pseudo-instruction interface with `mvm`, `vec`, `copy`, `write`, `load`, `store`, `send`, and `recv`. This gives the backend a concrete instruction/meta-op boundary at core level. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**Secondary: A2 Simulator & cost model.**  
The profiler is central to GA fitness and evaluation. It consumes architectural parameters and pseudo-instruction streams, models conflicts/synchronization, and reports latency, throughput, energy, utilization, memory, and communication metrics. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The hardware configuration is a de facto IR boundary. It names crossbar size, cell precision, ADC/DAC fields, memory timing, bus topology, layout, and core count in artifact `config.json`; the paper’s Table II similarly defines configurable architecture-template parameters. Decisions such as hardware scale, memory bandwidth/timing, precision fields, and interconnect topology are made here. A stable upstream schema is partly visible, but several compiler decisions remain embedded in C++ passes and backend setup. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**B2 Graph-as-IR.**  
The named structure IR is graph-like: layer index, type, attributes, dimensions, providers, and consumers. It supports layer fusion/elimination and provides topology for scheduling. The single artifact boundary is the frontend’s JSON backend input, documented as containing node parameters and topological connections. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**B4 Hardware-resource IR.**  
Array groups and AG-to-core mappings are the most paper-specific middle representation. Decisions include weight unfolding, AG partitioning, replication factor, AG distribution across cores, and assignment of convolution-operator tasks to replicas. The AG concept is named and reasoned about, but the full legality/cost semantics are distributed across GA, profiler, scheduling, and backend mapping code. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**B5 Instruction / meta-op / ILA.**  
Pseudo-instructions form the visible backend contract. `mvm` targets an array group, `vec` targets VFU operations, memory ops target local/global memory, and `send`/`recv` express inter-core communication. Upstream passes could read the emitted instruction stream if saved, but the artifact’s README presents it primarily as verification/simulation output rather than as a documented rewriteable IR. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**B7 Runtime-state abstraction.**  
The LL mode introduces pixel-level dependency lists, mapping info, runtime records, and a heap-based memory manager. This is a useful static representation of runtime state for fine-grained inter-layer pipelines. It is closest to a runtime-state IR, though its semantics are described as a virtual runtime mechanism in software rather than a standalone public schema. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

## 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware resource** | Architecture template names chips, cores, PIMFUs, crossbar arrays, local/global memory; README says the abstraction is compatible with Crossbar/IMA/Tile/Chip structures. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Bit-slicing / bit significance | **Parameter / backend operation** | Backend is described as quantizing weights, partitioning weight data, performing bit splitting, and programming arrays. Artifact config includes cell precision. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| ADC/DAC precision or sensing | **Parameter in artifact; less central in paper text** | Artifact `config.json` includes `dac_resolution`, `dac_count`, `adc_resolution`, `adc_latency_cycle`, ADC power fields, and `adc_count`. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json)) |
| Analog-to-digital or domain transition | **Costed/parameterized indirectly** | The profiler maps pseudo-instructions to components if power data is supplied; config exposes ADC/DAC and shift-adder timing fields. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Peripheral circuits as path nodes | **Parameter / component in hardware model** | Paper names PIMFU as crossbar arrays plus peripheral circuits for MVM; config includes ADC, sample-hold, shift-adder, output-buffer parameters. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Partial-sum accumulation path | **Implicit/costed through VFU/AG behavior** | Paper says VFU may perform result accumulation with adder tree and HT `Run` includes accumulating partial sums between AGs. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Reconstruction / shift-add tree | **Parameter / backend detail** | Config has `shift_adder_latency_cycle`; paper discusses multi-array storage for higher-precision weights and bit splitting in backend, but a standalone reconstruction IR is not exposed. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime pixel state is first-class for LL; KV/batching/sparsity not applicable to demonstrated DNN setting** | Pixel-level runtime management records dependency lists, mapping info, runtime record, and heap-based memory allocation/release. HT uses batch size 128 and LL uses batch size 1 in experiments. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Value trajectory / flow path | **Approximated through dependencies, mapping info, and pseudo-instructions** | The path is visible as load/MVM/VFU/store/send/recv actions plus pixel dependencies, but value identity is mainly tracked at pixel/task/memory-address granularity rather than as a type-level trajectory object. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |

## 5.4 Axis D — rewrite object

PIMCOMP rewrites or transforms:

- **Operator graph:** layer fusion/elimination and structure-weight splitting.
- **Tensor/weight layout:** convolutional weights are unfolded into `(H,W,P)` forms and partitioned into AGs.
- **Hardware mapping:** AG replication/layout and AG-to-core mapping.
- **Array binding:** computational tasks are assigned to layer replicas and AGs.
- **Memory layout/state:** local/global memory placement, pixel-level runtime records, heap allocation/release.
- **Instruction stream:** pseudo-instructions are generated, optimized, and emitted for verification/simulation.
- **Pipeline schedule:** HT layer groups and LL queue/transmission scheduling.

Legal transformations preserve DNN topology, layer parameters, weight values under quantization/bit splitting, dependency order, AG/core capacity constraints, local/global memory constraints, and pseudo-instruction semantics. The representation is especially well suited to AG-level replication/layout search and static DNN pipeline scheduling; expressing trajectory rewrites such as delaying ADC conversion or carrying bit-sliced partial sums across operator boundaries would likely require an additional abstraction for value identity, domain, precision stage, and reconstruction state.

## 6. Technical mechanism reading

### Hardware abstraction and pseudo-instruction contract

The hardware template abstracts a multi-level accelerator with chips, cores, PIMFUs, crossbar arrays, VFUs, local memory, global memory, and inter-core communication. The paper frames this as a portability layer that isolates hardware differences from the compiler. The pseudo-instruction interface is core-level: `mvm` executes an array-group MVM, `vec` invokes vector operations, memory instructions move data within or between local/global memory, and communication instructions send/receive between cores. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### Structure-weight split

The frontend parses ONNX and produces separate structure IR and weight data. Structure IR carries topology and layer parameters for fast optimizer iteration; weight data is held for backend quantization, bit splitting, and physical array programming. This split is important for compiler/IR work because it separates the graph/control object from large numeric tensors and allows iterative mapping/search without repeatedly carrying full weights. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### Array groups and flexible unfolding

The key named mapping object is the **array group**. After unfolding convolutional weights into `P` matrices of shape `H × W`, PIMCOMP partitions each matrix vertically using array height; each AG contains enough arrays to cover the width. AGs share inputs, can be mapped independently from layer boundaries, and allow pseudo-instruction `mvm` granularity to match a multi-array hardware operation. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

The unfolding format is represented by `(H,W,P)` with `HWP = IOK²`, and selected from five valid methods with different compute, memory-load, and extra-memory tradeoffs. The greedy selection prioritizes minimal computation cycles, then HT favors lower data-loading volume while LL favors lower memory requirement. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### GA-based layout and replication

The GA jointly searches replication and AG layout. A chromosome encodes both value and position: the gene value stores layer index and AG count, while position denotes the mapped core. Mutation changes AG count, assigns layers to empty positions, or partially swaps AGs between cores; the compiler maintains chromosome legality. Fitness is evaluated by running scheduling to produce a simplified pseudo-instruction stream and profiling performance considering computation, memory access, and communication. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### Adaptive computation-storage mapping

Given a weight layout, PIMCOMP assigns convolution-operator tasks to replicas. HT mode distributes tasks proportionally to replica count and tries to reuse adjacent sliding-window input data. LL mode prioritizes rapid production of downstream pixels and uses the mapping to balance computation and communication; for non-convolution and non-FC layers on VFUs, the paper uses a greedy criterion to minimize data communication. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### HT and LL scheduling

HT mode targets continuous input streams. It executes layer groups in topological order, groups dependent layers when the pipeline cycle is preserved, groups independent layers for parallel execution, and generates a saturated pipeline whose pseudo-instructions can be reused across batches. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

LL mode targets batch size 1. It introduces a virtual runtime mechanism: forward/backward pixel dependency lists, pixel-AG dependency lists, mapping info, runtime records, transmission requests, and heap-based local-memory allocation/release. Transmission requests are cached and issued when a threshold or traversal condition is met, preserving memory until transmission completes. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

### Evaluation assumptions

The evaluation instantiates three architecture configurations: Arch-A with 168 cores and 96 crossbars/core, Arch-B with 138 cores and 128 crossbars/core, and Arch-C with 16 chips, 4 cores/chip, and 8 crossbars/core; all use 2-bit cells, while model weights are quantized to 16-bit fixed point. Benchmarks are VGG8/ResNet18 on MNIST and ResNet34/GoogleNet on ImageNet; HT uses batch size 128 and LL uses batch size 1. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Array group is the paper’s real compiler object

- **Observation:** The AG bridges physical arrays and compiler scheduling: it groups arrays sharing input, maps below layer granularity, and is directly targeted by `mvm`.
- **Why it matters for CIM compiler/IR work:** It gives a concrete example of a hardware-resource IR object that is neither a full layer nor an individual crossbar.
- **Reusable lesson:** Future CIM IRs can borrow AG-like “input-shared array bundle” objects as schedulable/bindable resources.

### Insight 2 — Structure IR and weight data are deliberately split

- **Observation:** The frontend separates topology/parameters from raw weights, letting the optimizer iterate over a lightweight graph object.
- **Why it matters for CIM compiler/IR work:** This suggests a practical IR layering: graph topology for search, tensor data for backend placement, and hardware config for legality/cost.
- **Reusable lesson:** A public CIM compiler stack could formalize this split with explicit provenance from source op → structure node → AG partition → instruction.

### Insight 3 — The profiler participates in mapping, not just reporting

- **Observation:** GA fitness is evaluated by scheduling a simplified pseudo-instruction stream and using profiler feedback for computation/memory/communication performance.
- **Why it matters for CIM compiler/IR work:** The cost model is operational: candidate mappings are ranked through simulated backend behavior rather than a purely symbolic objective.
- **Reusable lesson:** Future stacks can expose “candidate mapping + provisional schedule” as a first-class cost-model query object.

### Insight 4 — LL scheduling is a small runtime-state IR

- **Observation:** Pixel-level dependency lists, runtime records, transmission requests, and heap memory management provide a software representation of fine-grained pipeline state.
- **Why it matters for CIM compiler/IR work:** It shows that CIM scheduling may need static compilation of runtime tables, not just static placement.
- **Reusable lesson:** A future IR could represent per-value readiness, address lifetime, and inter-core transfer requests as verifiable runtime-state objects.

### Insight 5 — Pseudo-instructions expose backend intent but not all numeric semantics

- **Observation:** `mvm`, `vec`, memory, and communication instructions are clear enough for verification and simulation, while bit splitting, reconstruction, and analog/digital transition semantics remain mostly in backend/config assumptions.
- **Why it matters for CIM compiler/IR work:** This separates a useful instruction interface from a richer numeric trajectory interface.
- **Reusable lesson:** A value-trajectory IR could extend PIMCOMP’s pseudo-instructions with typed precision/domain/bit-slice annotations.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** GitHub repository `sunxt99/PIMCOMP-NN`; the paper states PIMCOMP is open-sourced there. ([arXiv](https://arxiv.org/pdf/2411.09159v1))
- **License:** Apache-2.0, as shown in README and LICENSE. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **Last checked:** 2026-05-15.
- **Contains:** frontend, backend, evaluation, models, output, verification, `config.json`, `main.cpp`, build instructions, ONNX-to-JSON workflow, backend flags, verification script, and pimsim-nn simulation-output path. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **Appears to omit or leave implicit:** a release package, one-command paper-figure reproduction, a formal external IR schema, and full per-hardware primitive libraries. The checked GitHub page reports “No releases published.” ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **Minimal documented workflow:** install ONNX/ONNX Runtime/NumPy/OpenCV for frontend/verification; build backend with CMake and g++; convert ONNX to JSON; run `./PIMCOMP-NN -m=resnet18 -r=balance -p=element ...`; run verification with `verification.py`. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **Paper figures reproducible from artifact:** Partial / unknown. The repository has evaluation code and output mechanisms, but the checked README documents compilation/verification/simulation workflows rather than a figure-reproduction harness.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Yes | ONNX frontend and JSON backend input are documented. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Intermediate representation serialized | Partial | Backend JSON, `IntermediateInfo.json`, and structure IR are visible; formal schema is not separately documented in checked README. |
| Mapping decisions inspectable | Partial | `IntermediateInfo.json` and mapping info are mentioned; GA/mapping internals are primarily pass-level. |
| Schedule inspectable | Partial | Instruction streams can be saved for verification/simulation; HT/LL algorithms are described in paper. |
| Hardware config explicit | Yes | Paper Table II and artifact `config.json` expose hierarchy/resource/timing parameters. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |
| Precision / bit-slice assumptions explicit | Partial | Cell precision, ADC/DAC parameters, and backend bit splitting are present; full type-level precision propagation is not exposed as a public IR. |
| Cost model inspectable | Partial | Profiler behavior is described; implementation is in artifact, but README-level calibration details are limited. |
| Simulator backend documented | Partial | README links pimsim-nn and says `SimulationInfo.gz` is produced for detailed simulation. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Generated code / instruction stream inspectable | Yes | Verification and simulation outputs save instruction-related artifacts. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Provenance from source op to backend action | Partial | Structure IR, mapping info, verification info, and pseudo-instructions provide pieces; a unified provenance schema is not documented. |
| Reproduction scripts available | Partial | Build/run commands and evaluation directory exist; figure-level scripts are unclear from checked README. |
| Calibration source documented | Partial | Paper states crossbar/VFU power from PUMA, memory/router via CACTI/Orion scaled to 32nm. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) |

### 8.3 Integration helper

- **As frontend:** Reuse is most direct for ONNX-to-JSON ingestion of supported DNN inference operators. The documented supported operators are CONV, Group CONV, FC, POOL, ADD, CONCAT, and ReLU, with additional assumptions for element pipeline and model input. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **As IR inspiration:** The strongest abstractions to borrow are structure IR, AG, AG-to-core mapping info, pseudo-instruction stream, and LL pixel runtime records.
- **As mapper/scheduler:** The GA-based replication/layout optimizer, HT layer grouping, LL pixel dependency management, and computation-storage mapping rules are the most reusable mechanisms.
- **As cost model:** The profiler can inspire a backend plugin API that evaluates candidate mappings through provisional schedules and architecture parameters.
- **As backend:** The simulator/codegen boundary can be wrapped through saved `VerificationInfo.json`, `IntermediateInfo.json`, and `SimulationInfo.gz`, with pimsim-nn as the documented simulator target.
- **As benchmark:** The artifact lists validated classic CNN models, and the paper evaluates VGG8, ResNet18/34, and GoogleNet across three architecture instances. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **As validation source:** The work is strongest as simulator-backed validation; external calibration can draw from its CACTI/Orion/PUMA-derived power setup and, more broadly, the PIM EDA suite’s PIMSIM-NN/PIMACC tools for performance and nonideality/accuracy simulation. ([arXiv](https://arxiv.org/pdf/2411.09159v1))

**Integration effort estimate:** **Medium.** Integration would be most direct through the artifact’s JSON/config/instruction outputs and the AG mapping abstraction. Effort rises when treating PIMCOMP as a general backend because several semantics live in C++ passes, hardware config, simulator assumptions, and model-specific restrictions. A practical adapter would extract structure IR, AG partitions, mapping info, and pseudo-instruction streams into a stable external schema.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PUMA | PIM DNN compiler/ISA and inter-layer pipeline | PUMA is a close baseline for programmable PIM and MVM-granularity scheduling; PIMCOMP’s paper emphasizes AG mapping, weight replication/layout, and two pipeline modes across configurable hardware. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Separate “ISA/compiler stack” from “mapping/scheduling optimizer” even when both emit instructions. |
| Polyhedral | PIM mapping and weight replication for DNN inference | Both use replication and pipelining; PIMCOMP argues AG-level mapping improves utilization and throughput relative to layer-level mapping granularity. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Record rewrite object granularity: layer, MVM, AG, convolution operator, or instruction. |
| SongC | PIM DNN deployment and memory/dataflow concerns | Paper treats SongC as storage-computation-disentangled and uses it as a major baseline for HT/LL throughput, latency, and energy. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Similar workload does not imply same CIM object; layout binding is the differentiator. |
| Co-Design | Graph-based PIM compilation/mapping | Paper groups Co-Design with graph-partitioning approaches and contrasts PIMCOMP’s convolution-operator-level scheduling and layout-guided computation-storage mapping. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Corpus entries should distinguish graph partitioning from AG/resource mapping. |
| TC-CIM / TDO-CIM / CINM / OCC | PIM compilation/offload tools | The paper’s Table I places them as more layer-wise or coarse-grained relative to PIMCOMP’s CG-based convolution-operator scheduling and higher hardware/app configurability. ([arXiv](https://arxiv.org/pdf/2411.09159v1)) | Use these as “offload/runtime/compiler” comparators, but keep PIMCOMP tagged as mapping/scheduling-centric. |
| PIMSIM-NN / PIM EDA Suite | Simulator/toolchain integration | PIMCOMP-NN is the compiler component; PIMSIM-NN consumes architecture and instruction sequence for latency/power/energy, while PIMACC targets nonideality/accuracy simulation. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain)) | In the corpus, compiler, architecture synthesizer, performance simulator, and accuracy simulator should be separate but cross-linked artifacts. |

## 10. Corpus-ready final takeaway

- PIMCOMP’s real contribution is an AG-centered compiler optimizer for crossbar-PIM DNN inference: unfolding, AG partitioning, weight replication/layout, computation-storage mapping, and HT/LL scheduling.
- The strongest reusable stack layer is the **mapping/scheduling middle layer**, not a general-purpose IR framework.
- The paper demonstrates an end-to-end path from ONNX-style DNN input to pseudo-instruction/configuration artifacts, with artifact support for JSON backend input, intermediate/verification/simulation outputs, and pimsim-nn integration.
- First-class CIM objects include crossbar hierarchy, PIMFU/core/local/global memory, array group, weight replica, AG-to-core mapping, pseudo-instruction, and LL pixel runtime record.
- The effective hidden IR is distributed across structure IR, hardware config, AG mapping state, GA chromosomes, scheduling queues, runtime records, and emitted pseudo-instructions.
- Artifact status is public and Apache-2.0; reproducibility is medium because compile/verification workflows are documented, while paper-figure reproduction and formal IR schemas are less explicit in the checked sources.
- Integration is most direct by wrapping the ONNX→JSON frontend, extracting AG/mapping/pseudo-instruction artifacts, or using the profiler/simulator interface as a backend cost-model target.
- For value-trajectory IR research, PIMCOMP offers useful ingredients—AGs, pixel dependencies, and pseudo-instructions—but a trajectory-level extension would add typed value identity across bit-slicing, analog accumulation, sensing, reconstruction, communication, and storage.
