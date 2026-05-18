# PIMeval / PIMbench — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Primary: A2 Simulator & cost model. Secondary: A6 benchmark/programming framework; A3-light mapping/resource management.** | The paper presents PIMeval as a performance/energy modeling framework and PIMbench as a benchmark suite for digital DRAM-PIM, with C++ APIs used to implement workloads and emit timing/energy statistics. The stack owns the evaluation layer more strongly than a compiler frontend or explicit IR pipeline. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR; B5 PIM-command / micro-op API; B7 runtime object-state abstraction.** | Hardware targets are selected through device/config parameters; PIM data objects are allocated and tracked by object IDs; high-level API calls act as an architecture-independent command layer; low-level micro-ops are exposed in the public header. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API)) |
| First-class CIM objects, Axis C | **PIM device, PIM core, PIM object ID, DRAM rank/bank/subarray/row/column hierarchy, allocation layout, PIM commands, command statistics, selected micro-op registers.** | The paper names a PIM core as the processing unit at subarray or bank level, and the artifact exposes `PimObjId`, device enums, allocation enums, data types, device properties, and micro-op row registers. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Rewrite object, Axis D | **Manual API command stream, allocation/layout state, and target-specific command-cost lowering.** | The demonstrated transformation is from hand-written C++ benchmark code using PIM APIs into architecture-specific functional simulation plus latency/energy accounting. Bit-serial targets additionally map high-level operations into low-level bit-serial microprograms for the model. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Best corpus tags | `DRAM-PIM`, `digital-PIM`, `simulator`, `cost-model`, `benchmark-suite`, `C++-PIM-API`, `bit-serial`, `bit-parallel`, `subarray-PIM`, `bank-level-PIM` | These tags reflect the paper’s three modeled target families, C++ API boundary, benchmark suite, and performance/energy modeling focus. |
| Closest comparison baselines | **PrIM, InSituBench/Fulcrum, BLIMP, PIMSim, MultiPIM, DRAMsim3/Ramulator.** | The related-work section positions PIMbench against PrIM and InSituBench, and PIMeval against PIMSim, MultiPIM, DRAMsim3, and Ramulator; BLIMP is nearby because it studies bank-level DRAM-PIM with a compiler-analysis component. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |

## 2. One-paragraph public summary

**PIMeval / PIMbench** contributes a public modeling and benchmarking stack for **digital DRAM-PIM**, centered on a C++ PIM API, a configurable performance/energy model, and a benchmark suite spanning vector, linear algebra, graph, image, security, machine-learning, and DNN inference kernels. The demonstrated hardware scope covers three DRAM-PIM styles: DRAM-AP-style subarray bit-serial PIM, Fulcrum-style subarray bit-parallel PIM, and bank-level bit-parallel PIM. Its strongest contribution to a CIM compiler/IR corpus is not an explicit compiler IR, but a reusable evaluation boundary: PIM data objects, layout choices, target device configs, PIM API commands, and command-level timing/energy accounting. For compiler/IR research, PIMeval is useful as a backend-facing reference model and benchmark harness that exposes the kinds of objects a future CIM IR would need to preserve when lowering higher-level tensor or graph programs into digital DRAM-PIM execution. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| PIMeval is an architectural modeling framework for digital DRAM-PIM. | Abstract and Section I | Paper-only + artifact + equations | The paper defines a modeling framework for three digital DRAM-PIM targets, and the artifact provides a C++ simulator/library with configs, APIs, tests, and benchmarks. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | Demonstrated through simulator-backed experiments over modeled DRAM-PIM variants; physical DRAM-PIM hardware measurement is not the evidenced basis. |
| PIMbench is a benchmark suite for DRAM-PIM evaluation. | Abstract, Section II / Table I, artifact README | Experiment + code/artifact | The paper lists workloads including vector addition, AXPY, GEMV, GEMM, radix sort, AES, triangle count, filter-by-key, histogram, image kernels, KNN, linear regression, K-means, and VGG variants; the repository contains corresponding benchmark directories. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | Demonstrated for benchmark implementations written against PIMeval’s C++ API and evaluated through the simulator/modeling stack. |
| The framework can evaluate subarray-level bit-serial, subarray-level bit-parallel, and bank-level bit-parallel DRAM-PIM. | Sections I, IV, V, Table II | Hardware model + experiment + config artifact | The paper describes DRAM-AP-style bit-serial, Fulcrum-style bit-parallel, and bank-level PIM; the artifact includes config files selecting `PIM_DEVICE_BITSIMD_V_AP`, `PIM_DEVICE_FULCRUM`, and `PIM_DEVICE_BANK_LEVEL`. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | Demonstrated for digital DRAM-PIM abstractions parameterized by rank/bank/subarray/row/column counts and modeled PIM operation costs. |
| The PIM API lets programmers write PIM-enabled applications in a reusable way. | Section IV-B and artifact API docs | Code/artifact + documentation | The paper shows C++ APIs for allocation, copy, computation, and free; the wiki documents `pimCreateDevice`, `pimAlloc`, `pimAllocAssociated`, copy calls, arithmetic, bitwise, relational, reduction, broadcast, and shift operations. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The reusable interface is clearest at the C++ API boundary; upstream graph or tensor compiler ingestion is described as future-facing rather than implemented as a public compiler pipeline. |
| The resource manager abstracts PIM allocation, address mapping, and object tracking. | Section IV-A/B | Runtime-state abstraction + code/artifact | PIM data objects can span multiple 2D regions across PIM cores, use horizontal or vertical layout, and are referenced by object IDs; the artifact exposes `PimObjId`, allocation modes, data types, and device properties. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The mapping state is visible through object IDs, allocation choices, and device properties; a complete serialized mapping IR is not found in the checked sources. |
| PIMeval models latency from data movement and kernel execution. | Section IV-C | Equation/model description + artifact | The paper separates data movement latency from kernel execution latency and models PIM API latency using device characteristics and DDR timing data; bit-serial operations map to lower-level microprograms. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The demonstrated latency model is API/device-level and benchmark-driven; cycle-accurate DRAM protocol simulation is discussed as future integration with DRAMsim3. |
| PIMeval models energy for data transfer, execution, and background energy. | Section IV-D | Equation/model description | The paper gives a Micron-style read-power expression and an activation/precharge energy expression, plus API-level execution energy aggregation and background energy estimation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The paper-level evidence supports analytical/model-based energy accounting calibrated from device/power models and RTL-style estimates; hardware power measurement is outside the demonstrated scope. |
| PIMeval validates functional output and compares with existing simulators where possible. | Section V-A | Experiment | The paper reports output comparison with CPU baselines, bit-parallel comparison with the original Fulcrum simulator for selected kernels, and a toy UPMEM-style validation for bank-level behavior. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | Demonstrated for selected validation cases and modeled configurations; full equivalence against production hardware is not claimed by the checked evidence. |
| PIMbench reveals workload-dependent behavior across DRAM-PIM styles. | Sections V-B–V-D, Figures 6–10 | Experiment + sensitivity study | The paper studies sensitivity to banks/columns, separates data movement/host/kernel time, and compares modeled PIM against CPU and GPU baselines. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The evidenced scope is simulator-backed performance/energy analysis over the selected benchmarks, hardware parameters, and host/GPU comparison setup. |
| The public artifact supports reproducibility. | Artifact appendix, GitHub README, release | Code/artifact + documentation | The artifact appendix gives the GitHub repository, Zenodo DOI, MIT license, hardware/software requirements, workflow, and expected runtime; the README gives quick-start and code-structure documentation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | The artifact supports re-running the simulator/benchmarks; exact figure reproduction appears partially documented and may require reconstructing plots from emitted statistics. |

## 4. Stack anatomy

```text
Input / frontend:
C++ benchmark/application code that calls the PIMeval API. This is source-level code, not a serialized graph or tensor IR. The paper’s AXPY listing illustrates allocation, copy, PIM operation, copy-back, and free calls; the artifact documents the API in libpimeval.h and the wiki. Inspectable and reusable as C++ code/API examples. Serialized as source files, not as a compiler IR. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Middle representation:
PIM API calls over PimObjId operands, plus target device/config state. The named objects include PIM devices, PIM cores, PIM data objects, allocation layouts, data types, and PIM command categories. Inspectable through headers, config files, command statistics, and benchmark code. Partly serialized through .cfg files; API call sequences are embedded in C++ programs. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))

Mapping or scheduling state:
The resource manager allocates and tracks PIM data objects across 2D regions and PIM cores, with vertical or horizontal layouts. Associated allocation can align element indices across objects. The state is reusable through object IDs and API calls; a standalone mapping schedule file was not found in the checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Hardware abstraction:
A configurable DRAM-PIM hierarchy: ranks, banks per rank, subarrays per bank, rows, columns, local/global row buffers, PIM cores, processing units, and target architecture enum. It is serialized in config files and in device-creation parameters. The paper models subarrays as monolithic arrays rather than exposing MAT-level details. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Backend / simulator / codegen:
A functional simulator plus performance/energy model. High-level PIM APIs are evaluated against target-specific latency and energy formulas; bit-serial APIs can be mapped to low-level bit-serial microprogram behavior. Low-level micro-op APIs are visible in the public header, including row-register and Boolean operations. This is a simulator backend rather than generated executable PIM binaries. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Output artifact:
Runtime statistics, PIM command statistics, data movement statistics, host/PIM timing, and energy estimates. The artifact appendix shows sample output containing device configuration, copy statistics, and PIM command statistics. Inspectable as console/log output; a universal trace schema was not found in the checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Evaluation loop:
Build the PIMeval library and benchmark applications, select device/configs, run PIMbench kernels, compare against CPU/GPU baselines, and analyze latency/energy breakdowns and sensitivity. The README and artifact appendix document quick-start and full artifact workflows. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **C++ PIM API call order, `PimObjId` allocation state, data layout choice, device config, and target-specific cost-model dispatch**. The paper foregrounds the API and benchmark framework, while the reusable semantics are most visible in the public header, config files, resource manager behavior, and emitted PIM command statistics. For a compiler/IR corpus, PIMeval is best read as a simulator-backed command abstraction whose “IR-like” boundary is distributed across source-level API calls, runtime allocation metadata, and hardware configuration files rather than gathered into one standalone dialect or serialized program representation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
PIMeval’s owned stack slice is the evaluation backend: it models digital DRAM-PIM latency and energy, exposes hardware parameters, and evaluates benchmark applications through a functional simulator plus analytical cost model. The input to this slice is C++ code using PIM APIs plus a target configuration; the output is functional results and performance/energy statistics. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**Secondary: A6 — Programming / runtime / benchmark framework.**  
PIMbench strengthens the benchmark/programming layer by providing workloads written against a PIM API and a reproducible artifact workflow. The public artifact includes a benchmark suite, tests, configs, and build/run scripts; the artifact appendix describes expected requirements and runtime. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))

**Secondary, narrower: A3 — Mapping / scheduling / DSE framework.**  
The framework makes allocation, object association, layout, rank/bank/subarray parallelism, and target selection explicit enough for performance exploration. However, the demonstrated “mapping” is runtime/resource-manager and benchmark-code driven rather than a search-based compiler mapper. The paper’s sensitivity studies over columns and banks show how the model can support design-space reasoning. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**Adjacent: A4 — Explicit IR / dialect / ISA compiler stack.**  
The PIM API behaves like an implicit command abstraction, and the low-level micro-op API resembles an instruction/meta-op interface. The checked sources do not present a standalone compiler IR, dialect verifier, or lowering pipeline; the paper explicitly describes compiler targeting of PIM APIs as future-facing related work rather than the demonstrated stack. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named representation is the target configuration: ranks, banks, subarrays, rows, columns, and `simulation_target`. Decisions made there include hardware capacity, hierarchy, and architecture selection. The artifact includes IISWC configs for bit-serial, Fulcrum, and bank-level targets. A future upstream compiler could read these files as a backend capability descriptor, though the files are hardware configs rather than full program IR. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/tree/main/configs/iiswc))

**B4 — Hardware-resource IR.**  
The named middle objects are PIM device, PIM core, PIM data object, DRAM hierarchy fields, and allocation layout. Decisions made there include how objects are allocated across cores and whether layout is vertical or horizontal. Some decisions remain embedded in the resource manager, benchmark code, and simulator implementation. A single artifact that upstream passes could read, verify, and rewrite is not exposed as a complete serialized mapping object in the checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**B5 — Instruction / meta-op / ILA-like command layer.**  
The named representation is the high-level PIM API command set, with lower-level micro-op APIs available for row-register and Boolean operations. Decisions made there include operation category, operands, scalar constants, reduction target, and sometimes bit-slice extraction/insertion. Target-specific lowering and timing remain in the simulator/cost model. The API is stable enough to wrap as a backend contract, but the public evidence is a C++ function interface rather than a serialized instruction stream. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API))

**B7 — Runtime-state abstraction.**  
The named runtime state includes allocated object IDs, device handles, object association, copy direction, data type, and resource-manager metadata. Decisions made there include allocation, data movement, and object lifetime. This is a useful runtime boundary for a compiler because it names storage-resident values, but provenance from a source operator to every backend command is partially implicit in the benchmark program and command-stat output. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable as crossbar; first-class / parameter as DRAM hierarchy.** | DRAM hierarchy is explicit through ranks, banks, subarrays, rows, columns, row buffers, and PIM cores; subarrays are modeled as monolithic arrays. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Bit-slicing / bit significance | **First-class for bit-serial targets; parameter/API-level for general use.** | Bit-serial computation uses vertical bit layout and bit-slice operations; the artifact exposes `pimBitSliceExtract` and `pimBitSliceInsert` with bit-index operands. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| ADC/DAC precision or sensing | **Not applicable.** | The modeled targets are digital DRAM-PIM architectures; the paper states support is for digital techniques and treats analog bit-serial as future work. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Analog-to-digital or domain transition | **Not applicable for the demonstrated digital DRAM-PIM scope.** | Values move between host and PIM memory and through digital row-buffer / ALU structures, rather than analog compute plus ADC/DAC conversion. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Peripheral circuits as path nodes | **Costed / implicit.** | Sense amplifiers, local row buffers, global row buffers, GDL, walkers, ALPU, and ALUs appear in the architecture and energy/latency model, but not as a general path graph. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Partial-sum accumulation path | **Costed / implicit; first-class at API level for reductions.** | Reductions use subarray/bank accumulators, CPU fallback in some cases, and bit-serial popcount support; the API exposes reduction calls such as sum and min/max. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Reconstruction / shift-add tree | **Implicit / hard-coded in operation models.** | Bit-serial arithmetic is modeled as sequences of Boolean micro-operations across bit-slices, while high-level operations are exposed as arithmetic PIM APIs. The checked sources do not expose a standalone reconstruction-tree representation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for runtime objects and masks; not applicable / unknown for KV cache; batching and sparsity mostly outside demonstrated scope.** | `PimObjId`, allocation, associated allocation, copy direction, conditional APIs, and Boolean data types are exposed. The paper discusses future studies for problem sizes, batching, and sparse execution. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API)) |
| Value trajectory / flow path | **Approximated / implicit.** | The model records data movement and PIM command statistics and distinguishes host/kernel/data movement time, but value identity across row buffers, bit-slices, accumulators, and storage is not a separately typed trajectory object. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |

### 5.4 Axis D — rewrite object

PIMeval primarily rewrites or lowers **manual API calls and allocation/layout state** into **target-specific simulated actions and cost accounting**. It does not rewrite an operator graph or tensor schedule in the compiler sense; instead, the benchmark author writes the operation sequence in C++, and the library interprets PIM API calls under the selected device model. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**Legal transformations in the demonstrated framework include:**

- allocation and deallocation of PIM data objects;
- associated allocation so related operands align across element indices;
- host-to-device, device-to-host, and device-to-device data movement;
- high-level arithmetic, logical, comparison, reduction, broadcast, shift, and bit-slice operations over object IDs;
- target-specific latency/energy lowering for bit-serial, subarray bit-parallel, and bank-level PIM;
- low-level micro-op simulation for row-register and Boolean operations where the API is used directly. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API))

**Equivalences exploited.**  
The paper’s most important equivalence is that a benchmark can call the same high-level PIM API while the simulator interprets the call under different hardware targets. For bit-serial PIM, an integer operation is equivalent to a sequence of bit-slice Boolean operations in the model; for Fulcrum/bank-level targets, operations are modeled as row-buffer movement plus ALU/processing-unit actions. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**Information preserved across lowering.**  
The API preserves object identity, element type, data layout, operand association, copy direction, selected device target, and hardware hierarchy parameters. These are the key pieces a compiler adapter would need to maintain when emitting PIMeval calls from a higher-level IR. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))

**Constructive boundary.**  
The representation is especially well suited to **API-level backend evaluation, benchmark portability across modeled DRAM-PIM targets, and early hardware sensitivity studies**. Expressing cross-operator graph rewrites, reduction-tree retiming, bit-sliced value lifetimes across operator boundaries, or alternative peripheral routing would likely require an additional abstraction for **value trajectory, schedule order, and hardware path nodes**.

## 6. Technical mechanism reading

### 6.1 Modeled architecture families

PIMeval models three digital DRAM-PIM placement styles. The first is a **subarray-level bit-serial** architecture modeled after DRAM-AP / Micron-style in-memory logic, where computation occurs near sense amplifiers and values are laid out vertically so bit-slices of many elements can be processed row-wide. The second is **Fulcrum-style subarray bit-parallel PIM**, where a 32-bit ALU-like processing unit and walkers operate near subarrays. The third is **bank-level bit-parallel PIM**, where processing occurs at the bank interface using the global row-buffer/GDL path. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

This distinction matters for compiler/IR work because the **same high-level operation maps to different backend resources**. In bit-serial PIM, a 32-bit arithmetic operation expands into bit-slice activity over rows; in Fulcrum-style PIM, it is closer to ALU operations near subarrays; in bank-level PIM, it is constrained by the narrower global data path and bank-level processing resources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

### 6.2 C++ API as implicit command abstraction

The PIM API is the main reusable programming boundary. The paper groups APIs into device creation, resource management, data transfer, and high-/low-level operations. A PIM data object is allocated in PIM memory and referred to by object ID; computation APIs consume object IDs as operands. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

The artifact exposes this boundary through `libpimeval.h` and the wiki. It includes target enums such as bit-serial, Fulcrum, bank-level, Aquabolt, and AIM; allocation modes such as automatic, vertical, and horizontal; data types including integer, unsigned integer, Boolean, and floating-point variants; device properties including ranks, banks, subarrays, rows, columns, PIM core count, and layout; and APIs for allocation, copy, arithmetic, bitwise, relational, reduction, bit-slice, conditional, and micro-op execution. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))

### 6.3 Resource manager and layout

The resource manager is the closest thing to a mapping-state abstraction. It allocates, deallocates, and tracks PIM data objects; an object can span multiple 2D regions across multiple PIM cores, and layout can be horizontal or vertical. The API also supports associated allocation, which aligns an object with an existing object so element indices match across operands. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

For compiler use, this suggests a backend contract: a future compiler pass could lower tensor buffers or vector regions into `PimObjId` objects, preserve association relationships, select layout, and emit API calls. The current artifact makes this possible as a wrapper target, while deeper scheduling decisions remain embedded in the benchmark code and simulator internals.

### 6.4 Performance model

The performance model separates **data movement latency** from **kernel execution latency**. Data movement is modeled using transfer size and bandwidth; kernel execution is modeled by aggregating the PIM API operations used by a benchmark kernel. The paper notes that some operations remain on the host because of random access or inter-bank communication patterns, and those host sections are measured using C++ timing. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

Target-specific execution modeling is important. For bit-serial PIM, high-level APIs are mapped into lower-level bit-serial microprograms over vertically arranged bit-slices. For Fulcrum-style bit-parallel PIM, the model includes row read/write latency to a local row buffer and arithmetic/logical operation latency. For bank-level PIM, row transfers go through the global row buffer and narrow GDL before processing-unit execution. Reductions and broadcasts receive special handling because their efficient implementation depends heavily on the PIM style. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

### 6.5 Energy model

The energy model is organized into **data transfer energy, application execution energy, and background energy**. The paper uses a Micron-style power model for DRAM operations, including a read-power expression based on supply voltage and current deltas. For execution energy, PIMeval aggregates energy at PIM API granularity and separates device-specific contributors such as activation/precharge, local sense-amplifier movement, ALU operation, and GDL movement. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

This is useful for compiler/IR work because it gives a backend cost plugin shape: an operation is not costed only by arithmetic type, but by **where it executes, which row-buffer/GDL/peripheral path it uses, and how many rows/bit-slices/banks participate**.

### 6.6 Workloads and evaluation assumptions

PIMbench includes vector, dense linear algebra, sorting, cryptography, graph analytics, database-style filtering/histogram, image processing, classical ML, and DNN inference workloads. The paper classifies benchmarks by instruction mix, memory access type, execution type, and arithmetic intensity, and uses PCA/hierarchical clustering to examine workload similarity. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

The evaluation compares modeled PIM performance and energy against CPU and GPU baselines and reports separate data movement, host, and PIM-kernel components. The paper’s conclusion emphasizes that architecture choice is workload-dependent: Fulcrum-style subarray bit-parallel PIM performs strongly in the reported geometric means, while data movement overhead and layout conversion can dominate for some workloads. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

### 6.7 Simulator/backend assumptions

The paper assumes a PIM memory module physically separate from the host and models data movement over a DDR-style interface. It treats ranks as independent channels for bandwidth modeling and uses a simplified subarray abstraction rather than modeling MAT-level circuit structure. It also states future directions including DRAMsim3/gem5 integration, HBM variants, analog extensions, area modeling, wider SIMD, and additional kernels. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The PIM API is the real reusable boundary

- **Observation:** The paper’s practical abstraction is the architecture-independent C++ PIM API, not a named compiler IR. `PimObjId` operands, device handles, allocation calls, copy calls, arithmetic/logical/reduction calls, and micro-op calls form a command vocabulary that can target multiple modeled DRAM-PIM styles. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Why it matters for CIM compiler/IR work:** A compiler could target this API as a backend ABI, using it to compare scheduling and layout strategies without writing a new simulator.  
- **Reusable lesson:** A CIM IR stack can benefit from a thin command boundary that is architecture-independent at the call level but architecture-specific at the cost/lowering level.

### Insight 2 — The resource manager is hidden mapping state

- **Observation:** PIM objects can span 2D regions across PIM cores, and operations refer to those objects through IDs. Layout and association decisions are carried by allocation state rather than by a serialized mapping file. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Why it matters for CIM compiler/IR work:** This is a useful model for separating logical value identity from physical placement, but future IR integration would benefit from making the allocation map inspectable and rewritable.  
- **Reusable lesson:** Treat PIM object allocation as a first-class mapping object with fields for layout, element type, core placement, association, and lifetime.

### Insight 3 — Config files act as a backend contract

- **Observation:** The `.cfg` files select hierarchy and target architecture with compact fields such as rank count, banks per rank, subarrays per bank, rows, columns, and `simulation_target`. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/configs/iiswc/PIMeval_BitSerial_Rank32.cfg))  
- **Why it matters for CIM compiler/IR work:** These files are a practical example of config-as-IR: they provide enough target information for cost modeling and simulation selection.  
- **Reusable lesson:** A future compiler backend could formalize such configs as a schema with validation, capability queries, and explicit links to operation legality and cost formulas.

### Insight 4 — Cost granularity is API-level, with target-specific expansion

- **Observation:** PIMeval accounts for performance and energy at the PIM API level, while expanding bit-serial operations into lower-level microprogram behavior inside the model. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Why it matters for CIM compiler/IR work:** This gives a clean early-stage cost model, but it suggests that optimization passes needing bit-slice lifetime or row-register scheduling should target a lower-level representation.  
- **Reusable lesson:** Use multi-level lowering: high-level PIM commands for portability, and optional micro-op / bit-slice IR for architecture-specific scheduling.

### Insight 5 — Host/PIM partitioning is visible in the benchmark evidence

- **Observation:** The evaluation distinguishes PIM kernel time, host time, and data movement time; some benchmark sections execute on the host due to random access or inter-bank communication. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Why it matters for CIM compiler/IR work:** A CIM IR that only represents in-array operations will miss major execution costs unless it also models host fallback, data movement, and synchronization boundaries.  
- **Reusable lesson:** Preserve host/PIM boundary events as first-class schedule nodes or runtime effects.

### Insight 6 — Digital DRAM-PIM exposes two different “instruction granularities”

- **Observation:** Bit-serial PIM naturally exposes bit-slice Boolean micro-operations, while bit-parallel PIM resembles row-buffer movement plus ALU-style commands. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Why it matters for CIM compiler/IR work:** A single “PIM op” abstraction can hide radically different backend rewrite spaces.  
- **Reusable lesson:** A portable CIM IR should support both coarse command operations and optional lowering into bit-level or resource-level actions.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL:** `https://github.com/UVA-LavaLab/PIMeval-PIMbench`  
- **Artifact identifier:** Zenodo DOI `10.5281/zenodo.13243685`, listed in the artifact appendix. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **License:** MIT, stated in the repository README and license section. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** C++ PIMeval simulator/library, PIMbench benchmark directories, configuration files, tests, scripts, wiki documentation, and a v1.0.0 IISWC 2024 release corresponding to the paper artifact. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))  
- **What the artifact appears to omit:** A standalone serialized compiler IR, a documented full instruction-trace schema, and a complete public plotting pipeline for every paper figure were not found in the checked sources. The wiki’s micro-op simulation API section is marked “To be added,” even though micro-op APIs are present in the header. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API))  
- **Minimal documented workflow:** The README documents `git clone`, `make`, entering a PIMbench application directory, and running the executable; the artifact appendix documents `build_run.sh`, configuration selection, and sample output. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))  
- **Whether paper figures appear reproducible from the artifact:** **Partial.** The artifact includes source, configs, scripts, and emitted statistics needed for re-running experiments, and the artifact appendix estimates about 168 hours for a full experiment run. Exact figure regeneration appears to require reconstructing analysis/plotting from outputs and scripts rather than invoking a single documented figure-reproduction command. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | C++ API and benchmark invocation are documented; there is no separate graph/tensor input format. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API)) |
| Intermediate representation serialized | **Partial** | Hardware configs are serialized; API command sequences live in C++ source and runtime execution rather than a standalone IR file. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/configs/iiswc/PIMeval_BitSerial_Rank32.cfg)) |
| Mapping decisions inspectable | **Partial** | Object IDs, allocation calls, associated allocation, layout enums, and device properties are visible; full placement maps are embedded in runtime/resource-manager behavior. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h)) |
| Schedule inspectable | **Partial** | API call order is inspectable in benchmark source, and command statistics are emitted; a normalized schedule trace was not found in the checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Hardware config explicit | **Yes** | Config files expose hierarchy and simulation target. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/configs/iiswc/PIMeval_BitSerial_Rank32.cfg)) |
| Precision / bit-slice assumptions explicit | **Partial** | Data types and bit-slice APIs are exposed; full precision propagation as a type system is not shown. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h)) |
| Cost model inspectable | **Partial** | Paper provides equations and model structure; source code is public. Calibration and all implementation choices require reading the artifact. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Simulator backend documented | **Partial** | README/wiki/artifact appendix document use and APIs; low-level micro-op documentation is incomplete in the wiki. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench)) |
| Generated code / instruction stream inspectable | **N/A / Partial** | The artifact simulates API calls and exposes micro-op functions; no generated PIM binary or compiler-emitted instruction stream is the central artifact. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h)) |
| Provenance from source op to backend action | **Partial** | Benchmark source and command stats provide partial provenance from API call to modeled command category; full source-op-to-resource-path provenance is not found as a serialized artifact. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |
| Reproduction scripts available | **Yes** | README and artifact appendix describe build/run scripts and workflow. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench)) |
| Calibration source documented | **Partial** | Paper cites Micron power modeling, DDR timing, Fulcrum comparisons, and RTL-derived ALU estimates; complete raw calibration datasets are not presented as the main artifact. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest for C++ applications already expressible through PIMeval’s allocation, copy, arithmetic, logical, comparison, reduction, broadcast, and bit-slice APIs. It is less direct as a frontend for existing ML graph formats because no ONNX/MLIR/import pipeline is shown in the checked sources.  
- **As IR inspiration:** Borrow `PimObjId`, allocation layout, associated allocation, device properties, target enum, command statistics, and micro-op registers as candidate IR/runtime objects.  
- **As mapper/scheduler:** Adapt its resource-manager concepts for object placement, layout choice, and host/PIM movement decisions. More advanced schedule search would need an added schedule representation above the API call layer.  
- **As cost model:** The strongest integration path is as a backend cost plugin: latency and energy can be estimated from PIM API calls, data movement, device hierarchy, and target-specific operation costs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **As backend:** A compiler could emit C++ PIMeval API calls or wrap the library directly. This would support simulator-backed evaluation rather than deployment to a commercial PIM device.  
- **As benchmark:** PIMbench is directly reusable for comparing digital DRAM-PIM targets and for testing compiler-generated calls against hand-written PIM API implementations. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench))  
- **As validation source:** The paper provides CPU-output validation, Fulcrum-simulator comparison for selected kernels, and UPMEM-style toy validation for bank-level behavior; it does not rely on chip-in-loop measurement. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  

**Integration effort estimate: Medium.**  
Integration would be most direct through a small adapter that emits PIMeval C++ API calls and config files from a higher-level compiler IR. The cost-model and benchmark reuse are low-friction because the artifact is public and MIT-licensed, but a robust compiler integration would need additional serialization for mapping, schedule, command traces, and source-op provenance.

## 9. Relation to a value-trajectory CIM IR project

PIMeval provides useful ingredients for a value-trajectory IR, especially **object identity, layout choice, bit-slice APIs, device hierarchy, data movement accounting, and command-level statistics**. The closest approximation to trajectory semantics is the path from host memory to PIM object, through PIM API execution on a chosen device target, and back through data movement and command-stat reports. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/wiki/PIM-API))

**Does the paper name the path a value takes through CIM resources?**  
Partially. It names host/PIM transfers, PIM objects, PIM cores, subarray/bank resources, local/global row buffers, GDLs, walkers, ALUs, and bit-slices in the architecture/model description. These are not assembled into a first-class per-value path object. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))

**Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?**  
For this digital DRAM-PIM scope, analog partial sums and ADC/DAC sensing are not applicable. Value identity is preserved at the PIM object level through `PimObjId`, and reductions/bit-slice operations can be named through APIs. Fine-grained identity across every row-buffer transfer, micro-op register, partial accumulation stage, and reconstruction path is not exposed as a trajectory type in the checked sources. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))

**Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?**  
The artifact exposes data types, allocation layout, bit-index arguments for bit-slice extraction/insertion, and device hierarchy. Placement is represented through allocation/resource-manager state and hardware config, while channel bandwidth and data movement are modeled in the cost layer. A type-like system that carries bit significance, placement, and transition stage through every operation would be an extension. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))

**Could the representation express trajectory rewrites?**

- **Fusing reconstruction with downstream reduction:** Partially approachable through API fusion hooks and reduction APIs, but a trajectory-level representation would need explicit reconstruction and reduction-tree nodes. The header marks API fusion as experimental. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))  
- **Delaying or retiming ADC conversion:** Not applicable to the demonstrated digital DRAM-PIM targets.  
- **Carrying bit-sliced partial sums across operator boundaries:** The bit-slice APIs and vertical layout give useful ingredients, but cross-operator bit-slice lifetime would need an added abstraction for bit-sliced values and their valid storage locations. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench/blob/main/libpimeval/src/libpimeval.h))  
- **Changing reduction tree structure:** The current API can request reductions, and the model implements target-specific reduction handling; exposing alternate reduction trees would require a schedule/path representation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Routing values through alternative peripheral paths:** The model costs local row buffers, global row buffers, GDL, and ALU-style components, but route choice is not exposed as a general path rewrite. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  
- **Co-optimizing data movement and numeric reconstruction:** PIMeval already separates data movement and kernel time, making it a helpful cost backend; co-optimization would benefit from attaching movement, layout, bit-slice, and accumulation metadata to values in a higher-level IR. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf))  

A trajectory-level extension would likely attach **layout, bit significance, PIM object identity, hardware resource path, accumulation/reduction stage, and host/PIM residency** to each value or buffer region, then lower those annotations into PIMeval API calls and configs for evaluation.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PrIM** | Benchmarking PIM workloads and APIs. | PrIM targets UPMEM-like real PIM systems, while PIMbench/PIMeval targets modeled digital DRAM-PIM variants including subarray and bank-level designs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | Classify PrIM closer to A6 real-hardware benchmark/runtime; classify PIMeval as A2/A6 simulator-backed benchmark infrastructure. |
| **InSituBench / Fulcrum** | Benchmarking and modeling subarray-level PIM. | PIMbench borrows and broadens benchmark coverage across multiple DRAM-PIM styles; Fulcrum is also one of the modeled bit-parallel targets. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | PIMeval is useful for cross-architecture comparison, while Fulcrum-style work is closer to one architecture point. |
| **BLIMP** | Bank-level DRAM-PIM execution and compiler-analysis concerns. | BLIMP maps CPU-oriented workloads to a bank-level RISC-V-like PIM core, while PIMeval offers a unified PIM API and simulator model across bank-level and subarray-level architectures. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | BLIMP is closer to architecture/compiler co-design for a bank-level core; PIMeval is a broader benchmarking/cost-model platform. |
| **PIMSim** | Program annotation and PIM instruction simulation. | PIMeval emphasizes a high-level PIM API and benchmark suite; the paper says PIMSim annotates programs with PIM instructions and supports selected applications. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | PIMSim belongs near instruction-annotation simulation; PIMeval belongs near API-level portable evaluation. |
| **MultiPIM** | Simulation of multiple PIM systems. | The paper describes MultiPIM as assuming the same ISA for PIM and host, while PIMeval models API calls over different DRAM-PIM organizations. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | MultiPIM is useful for system-level ISA-uniform studies; PIMeval is useful for comparing heterogeneous DRAM-PIM backend models. |
| **DRAMsim3 / Ramulator** | DRAM timing simulation. | The paper positions these as DRAM protocol simulators that do not directly support PIM-specific simulation, while PIMeval models PIM commands, data movement, and energy at an architectural level. ([University of Virginia Computer Science](https://www.cs.virginia.edu/~skadron/Papers/PIMbench_PIMeval_iiswc2024.pdf)) | DRAMsim3/Ramulator are lower-level memory-simulation baselines; PIMeval is a PIM-aware modeling layer that could later integrate cycle-accurate DRAM timing. |

## 11. Corpus-ready final takeaway

- **Real contribution:** PIMeval/PIMbench is a public simulator-backed benchmarking and cost-modeling stack for digital DRAM-PIM, not an explicit compiler IR stack.  
- **Strongest reusable layer:** The reusable boundary is the C++ PIM API plus hardware config files and command/statistics reporting.  
- **Evidenced scope:** The paper demonstrates three modeled DRAM-PIM targets: DRAM-AP-style subarray bit-serial, Fulcrum-style subarray bit-parallel, and bank-level bit-parallel PIM.  
- **First-class objects:** PIM device, PIM core, PIM object ID, allocation layout, DRAM hierarchy parameters, PIM commands, command statistics, data types, and selected row-register micro-ops.  
- **Hidden IR location:** The effective IR-like state is distributed across API call order, resource-manager allocation state, device configs, and target-specific cost-model logic.  
- **Artifact/reproducibility:** Public MIT-licensed artifact found, with GitHub repository, Zenodo DOI, configs, tests, scripts, benchmarks, wiki docs, and v1.0.0 IISWC release.  
- **Integration role:** Best suited as a backend cost model, simulator wrapper, and benchmark suite for future CIM compiler/IR projects.  
- **Value-trajectory relevance:** Medium: it provides object/layout/bit-slice/device ingredients, but trajectory-level rewrites would require explicit value-path, schedule, and hardware-path abstractions.

## 12. Suggested metadata entry

```yaml
paper: "PIMeval / PIMbench: Architectural Modeling and Benchmarking for Digital DRAM PIM"
year: 2024
venue: "IISWC 2024"
authors_or_group: "University of Virginia LavaLab / Siddique et al."
technology:
  - DRAM-PIM
  - digital-CIM
  - digital-PIM
  - subarray-PIM
  - bank-level-PIM
workloads:
  - vector-addition
  - AXPY
  - GEMV
  - GEMM
  - radix-sort
  - AES
  - triangle-count
  - filter-by-key
  - histogram
  - image-processing
  - KNN
  - linear-regression
  - k-means
  - VGG-inference
axis_A:
  primary: A2_simulator_cost_model
  secondary:
    - A6_programming_runtime_benchmark
    - A3_mapping_scheduling_DSE_light
axis_B:
  - B1_config_as_IR
  - B4_hardware_resource_IR
  - B5_instruction_meta_op_API
  - B7_runtime_state_abstraction
axis_C_first_class_objects:
  - PIM_device
  - PIM_core
  - PIM_data_object_id
  - DRAM_rank_bank_subarray_row_column_hierarchy
  - allocation_layout_vertical_horizontal
  - PIM_API_command
  - PIM_command_statistics
  - data_type
  - bit_slice_index
  - row_register_micro_ops
axis_D_rewrite_objects:
  - API_command_stream
  - allocation_layout_state
  - target_specific_command_cost_lowering
  - bit_serial_microprogram_expansion
artifact:
  status: public_artifact_found
  url: "https://github.com/UVA-LavaLab/PIMeval-PIMbench"
  identifier: "Zenodo DOI 10.5281/zenodo.13243685"
  license: MIT
  last_checked: "2026-05-15"
integration_roles:
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: medium
trajectory_IR_relevance: medium
notes:
  - "Best classified as simulator/cost-model plus benchmark/API framework for digital DRAM-PIM."
  - "API calls and PimObjId operands function as an implicit command abstraction."
  - "Hardware configs are the clearest serialized backend contract."
  - "No standalone compiler IR or graph/tensor lowering pipeline found in checked public sources."
  - "Useful backend target for evaluating future CIM IR mapping and value-trajectory designs."
```