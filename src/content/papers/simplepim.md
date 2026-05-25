---
slug: simplepim
title: "SimplePIM: A Software Framework for Productive and Efficient Processing-in-Memory"
short_title: "SimplePIM"
subtitle: "Scoped CIM stack note"
year: 2023
publication:
  venue: "PACT 2023"
  type: "conference"
  doi: "10.1109/PACT58117.2023.00017"
  url: "https://doi.org/10.1109/PACT58117.2023.00017"
authors:
  - "Jinfan Chen"
  - "Juan Gómez-Luna"
  - "Izzat El Hajj"
  - "Yuxin Guo"
  - "Onur Mutlu"
bibtex: |
  @inproceedings{DBLP:conf/IEEEpact/ChenGHGM23,
    author = {Jinfan Chen and Juan G{\'{o}}mez{-}Luna and Izzat El Hajj and Yuxin Guo and Onur Mutlu},
    title = {{SimplePIM}: A Software Framework for Productive and Efficient Processing-in-Memory},
    booktitle = {32nd International Conference on Parallel Architectures and Compilation Techniques, {PACT} 2023},
    pages = {99--111},
    publisher = {{IEEE}},
    year = {2023},
    doi = {10.1109/PACT58117.2023.00017},
    url = {https://doi.org/10.1109/PACT58117.2023.00017}
  }
citation_source: https://dblp.org/rec/conf/IEEEpact/ChenGHGM23
summary: >-
  **SimplePIM** is a C-level programming framework for UPMEM-style processing-in-memory systems that makes PIM-resident arrays, host-managed metadata, communication collectives, and array iterators the primary reusable objects. Its contribution is clearest as a runtime/programming layer: users register or create arrays, move them with scatter/gather/broadcast/allreduce/allgather, and invoke map, general reduction, or zip iterators through host-side calls while the framework handles DPU allocation, alignment, per-DPU partitioning, scratchpad-aware execution, and DPU binary loading. The paper demonstrates this stack on real UPMEM hardware across reduction, vector addition, histogram, linear regression, logistic regression, and K-means, reporting both LoC reduction and runtime comparisons against hand-optimized UPMEM baselines. For CIM compiler/IR research, SimplePIM is most useful as an example of a “hidden IR” embedded in runtime metadata and DPU argument structs: the stack does not center on an explicit graph or dialect, but it does expose a concrete backend contract for naming PIM arrays, preserving placement state, and lowering high-level array operations to real PIM execution. ([arXiv](https://arxiv.org/html/2310.01893v1))
links:
  paper: https://doi.org/10.1109/PACT58117.2023.00017
  artifact: https://github.com/CMU-SAFARI/SimplePIM
  docs:
  code:
technology:
  - "UPMEM"
  - "DRAM-PIM"
  - "digital-CIM"
  - "real-hardware-PIM"
workloads:
  - "reduction"
  - "vector_addition"
  - "histogram"
  - "linear_regression"
  - "logistic_regression"
  - "k_means"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A5, A3]
axis_B: [B7, B3, B4, B1]
axis_C_first_class_objects:
  - "PIM-resident array"
  - "array_id"
  - "DPU_set"
  - "per_DPU_partition_lengths"
  - "MRAM_start_end_offsets"
  - "element_type_size"
  - "communication_collective"
  - "function_handle"
  - "lazy_zipped_array"
  - "reduction_accumulator"
axis_D_rewrite_objects:
  - "runtime_state"
  - "memory_layout"
  - "array_binding"
  - "iterator_lowering"
  - "DPU_kernel_template_selection"
  - "host_mediated_collective"
artifact:
  status: "public artifact found"
  url: "https://github.com/CMU-SAFARI/SimplePIM"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Best read as a UPMEM C runtime/API whose hidden IR is host-side array metadata plus per-DPU argument state."
  - "Strongest evidence is real-hardware execution and public code for six UPMEM workloads."
  - "No standalone serialized compiler IR or graph dialect found in checked sources."
  - "Analog CIM objects such as ADC/DAC, bit-sliced partial sums, and reconstruction trees are not applicable to the demonstrated UPMEM backend."
takeaways: []
---

# SimplePIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 — Programming / runtime / benchmark on real hardware** | SimplePIM is presented as a high-level C programming framework for real PIM systems, implemented and evaluated on UPMEM hardware with six workloads. The paper foregrounds host-side management, communication primitives, and iterator APIs rather than a standalone compiler IR. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design**, with a light **A3 mapping/runtime-scheduling** component | The framework spans host API calls, PIM-resident array metadata, DPU binary creation, data movement, and real-hardware evaluation. The demonstrated end-to-end path is narrow: C-level array iterators targeting UPMEM DPUs. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Middle-layer style, Axis B | **B7 runtime-state abstraction**, **B3 loop / iterator abstraction**, partial **B4 hardware-resource metadata** | The reusable middle state is a host-managed table of PIM-resident arrays plus iterator handles and per-DPU argument structs. The paper names map, reduce, zip, scatter, gather, broadcast, allreduce, and allgather as the programmer-visible abstraction. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| First-class CIM objects, Axis C | PIM-resident arrays, array IDs, per-DPU partitions, DPU set, DPU MRAM address ranges, element type sizes, function handles, host-PIM/PIM-PIM collectives, lazy zipped arrays, reduction accumulators | SimplePIM directly names arrays and operations over arrays. In the artifact, `table_host_t` records array name, start/end offsets, length, per-DPU lengths, type size, and virtual-zip fields; `simplepim_management_t` stores the DPU set and argument buffers. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h)) |
| Rewrite object, Axis D | **Runtime state + memory layout + iterator lowering + DPU kernel template selection** | The tool does not expose a graph IR or instruction IR; it transforms host API calls into UPMEM runtime actions: aligned scatter/gather, per-DPU argument structs, DPU binary loading, launches, host-side reduction, and management-table updates. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/communication/CommOps.c)) |
| Best corpus tags | `UPMEM`, `DRAM-PIM`, `digital-PIM`, `C-runtime`, `array-iterators`, `host-PIM-communication`, `PIM-PIM-collectives`, `real-hardware`, `benchmark-artifact`, `runtime-state-IR` | These tags reflect the demonstrated UPMEM implementation, the C API, the iterator/collective abstraction, and the public artifact. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Closest comparison baselines | **PrIM benchmarks**, **PIM-ML / UPMEM ML training**, **dpu_kmeans**, **DaPPA**, **CINM/Cinnamon** | PrIM, PIM-ML, and dpu_kmeans are close because SimplePIM reuses their workload space and/or hand-tuned baselines; DaPPA is close as a data-parallel UPMEM programming framework; CINM is close as an explicit MLIR-based CIM/CNM compiler stack. ([arXiv](https://arxiv.org/html/2310.01893v1)) |

## 2. One-paragraph public summary

**SimplePIM** is a C-level programming framework for UPMEM-style processing-in-memory systems that makes PIM-resident arrays, host-managed metadata, communication collectives, and array iterators the primary reusable objects. Its contribution is clearest as a runtime/programming layer: users register or create arrays, move them with scatter/gather/broadcast/allreduce/allgather, and invoke map, general reduction, or zip iterators through host-side calls while the framework handles DPU allocation, alignment, per-DPU partitioning, scratchpad-aware execution, and DPU binary loading. The paper demonstrates this stack on real UPMEM hardware across reduction, vector addition, histogram, linear regression, logistic regression, and K-means, reporting both LoC reduction and runtime comparisons against hand-optimized UPMEM baselines. For CIM compiler/IR research, SimplePIM is most useful as an example of a “hidden IR” embedded in runtime metadata and DPU argument structs: the stack does not center on an explicit graph or dialect, but it does expose a concrete backend contract for naming PIM arrays, preserving placement state, and lowering high-level array operations to real PIM execution. ([arXiv](https://arxiv.org/html/2310.01893v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| SimplePIM is a high-level programming framework for real PIM systems. | Abstract and introduction. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Paper description + code/artifact | The paper defines a host-centered framework with management, communication, and processing interfaces; the repository contains `lib/management`, `lib/communication`, and `lib/processing`. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Demonstrated for UPMEM-style PIM with host-controlled DPU arrays and C APIs. The reusable boundary is clearest at the runtime/API layer. |
| SimplePIM abstracts PIM hardware complexity. | Introduction and Section 3. ([arXiv](https://arxiv.org/html/2310.01893v1)) | API design + implementation | The management interface tracks array ID, length, element type, physical PIM DRAM address, per-DPU lengths, and DPU set; the communication layer handles alignment, address calculation, and transfer commands. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h)) | The abstraction is evidenced for continuous arrays distributed over UPMEM DPUs. Complex patterns such as stencil/convolution are discussed as requiring finer-grained scatter/gather support. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| SimplePIM provides host-PIM and PIM-PIM communication primitives. | Section 3.2. ([arXiv](https://arxiv.org/html/2310.01893v1)) | API + code/artifact | The paper names broadcast, scatter, gather, allreduce, and allgather; the repository exposes corresponding functions in `CommOps.h` and implements padding/alignment and UPMEM transfer calls in `CommOps.c`. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/communication/CommOps.h)) | The demonstrated PIM-PIM path is host-mediated on UPMEM, because the paper states UPMEM has no direct hardware communication channel between PIM cores. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| SimplePIM provides processing iterators: map, reduce, and zip. | Abstract, introduction, and Section 3.3. ([arXiv](https://arxiv.org/html/2310.01893v1)) | API + code/artifact | The paper defines `simple_pim_array_map`, `simple_pim_array_red`, and `simple_pim_array_zip`; artifact files include `map`, `gen_red`, and `zip` processing directories and host functions such as `table_map`, `table_gen_red`, and `table_zip`. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM)) | The iterator set covers array map, generalized reduction, and two-input zip in the released UPMEM implementation. |
| Programmer-defined functions are compiled into DPU-side code and passed through handles. | Section 3.3, “Creation of a Function Handle.” ([arXiv](https://arxiv.org/html/2310.01893v1)) | Algorithmic lowering in prose + code/artifact | The paper says `create_handle` reads a file containing a PIM function, compiles it, and returns a CPU-side handle; the artifact’s `create_handle` constructs `dpu-upmem-dpurte-clang` commands for map, reduction, and zip binaries, and builds a shared object for host-side reduction combination. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/processing/ProcessingHelperHost.h)) | The compiler boundary is template-based C compilation into UPMEM DPU binaries, not a separately serialized IR/dialect. |
| SimplePIM improves programmer productivity. | Contributions and Section 5.2. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Experiment / code-size measurement | Table 1 reports effective PIM-related LoC for six benchmarks: SimplePIM uses 14–68 lines versus 82–206 lines for hand-optimized baselines, a 2.98×–5.93× reduction factor. ([arXiv](https://arxiv.org/html/2310.01893v1)) | The LoC metric excludes common host data loading, host allocation, variable definitions, and timing code; it focuses on PIM-related data transfers and kernel execution. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| SimplePIM performs comparably or faster than hand-optimized UPMEM code. | Abstract, introduction, Section 5.3. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Real-hardware experiment | The paper evaluates on a UPMEM system with 2,432 PIM cores and reports weak/strong scaling over 608, 1,216, and 2,432 cores. It reports comparable performance for reduction, histogram, and linear regression, and average speedups for vector addition, logistic regression, and K-means. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Demonstrated for six UPMEM-friendly array/ML workloads with baseline sizes chosen to match prior open-source implementations. |
| SimplePIM includes UPMEM-specific optimizations. | Section 4.2–4.3. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Implementation rules + experiments | The paper describes 12 default PIM threads, batched MRAM-scratchpad transfers, shared vs thread-private reduction accumulators, lazy zip, strength reduction, limited loop unrolling, boundary-check avoidance, function inlining, and adaptive transfer sizing. ([arXiv](https://arxiv.org/html/2310.01893v1)) | The strongest evidence is UPMEM-specific; the paper discusses possible extension to broader PIM systems, but the artifact is UPMEM-centered. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| The framework is open source. | Abstract, contributions, repository README. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Code/artifact + documentation | The public GitHub repository contains `benchmarks/` for six workloads and `lib/` for management, communication, and processing; the repository declares an MIT license. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM)) | Artifact-level confirmation supports the API, kernels, benchmarks, and build workflow. Figure reproduction scripts were not found in the checked README/release pages. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM)) |

## 4. Stack anatomy

```text
Input / frontend:
  C host program + programmer-defined C functions stored in files/directories.
  Object type: source code and API calls, not a graph IR.
  Inspectable/reusable: yes, through examples and benchmark folders; documented at README level.
```

The user-facing program calls scatter/broadcast/gather/allreduce/allgather and map/reduce/zip, while application logic is supplied through functions such as `map_func`, `init_func`, `map_to_val_func`, and `acc_func`. The paper’s histogram example shows the user defining iterator functions and then invoking `simple_pim_create_handle`, `simple_pim_array_scatter`, and `simple_pim_array_red`. ([arXiv](https://arxiv.org/html/2310.01893v1))

```text
Middle representation:
  Host-side management table of PIM-resident arrays plus function handles.
  Object type: runtime table / C structs.
  Serialized: no standalone serialized IR found.
  Inspectable/reusable: yes in source, especially Management.h and ProcessingHelperHost.h.
```

The effective middle state is `table_host_t` and `simplepim_management_t`: array name, start/end MRAM offsets, logical length, per-DPU length vector, element type size, lazy-zip state, DPU set, DPU count, and per-operation argument buffers. Handles store DPU binary locations and function type. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h))

```text
Mapping or scheduling state:
  Per-DPU partition lengths, MRAM offsets, DPU argument structs, tasklet count, scratchpad reduction choice.
  Object type: runtime mapping state and generated per-DPU launch arguments.
  Serialized: no; pushed into DPUs through UPMEM runtime calls.
  Inspectable/reusable: partially, through C structs and launch code.
```

Map and reduction calls build per-DPU argument records, load DPU binaries, push arguments, launch DPUs synchronously, and update the management table. The paper states that map uses 12 PIM threads by default and that reduction chooses between shared and thread-private in-scratchpad accumulators based on array sizes and data types. ([arXiv](https://arxiv.org/html/2310.01893v1))

```text
Hardware abstraction:
  UPMEM DPU set, per-DPU MRAM region, 64KB scratchpad, alignment/transfer constraints, 12-tasklet default.
  Object type: hardware-resource metadata plus hard-coded backend assumptions.
  Serialized: no full hardware config file found.
  Inspectable/reusable: partially in code and paper.
```

The paper’s UPMEM model includes up to 2,560 PIM cores, each coupled with a 64 MB DRAM bank, 64 KB scratchpad, and 24 KB instruction memory; it also states that UPMEM data transfers have 8-byte alignment and 2,048-byte transfer-limit considerations. ([arXiv](https://arxiv.org/html/2310.01893v1))

```text
Backend / simulator / codegen:
  UPMEM SDK compiler and runtime; generated DPU binaries for map/reduce/zip.
  Object type: C templates compiled to DPU binaries.
  Serialized: binary artifacts generated during build/handle creation.
  Inspectable/reusable: source templates are inspectable; generated machine-level instruction stream is not surfaced as an IR object.
```

The artifact’s handle creation invokes `dpu-upmem-dpurte-clang -O2 -DNR_TASKLETS=12` with macro-included user function headers and DPU-side source files. The README says execution requires the UPMEM SDK and can run on real modules or the SDK functional simulator. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/processing/ProcessingHelperHost.c))

```text
Output artifact:
  UPMEM DPU binary execution, host result arrays, runtime timing prints, benchmark outputs.
  Object type: executable binary + host-visible results.
  Serialized: benchmark binaries/results if user runs scripts; no corpus-standard trace/schema found.
  Inspectable/reusable: benchmark source and Makefiles are present; plotted figure-generation path not found in checked sources.
```

The README documents per-benchmark workflows such as `cd benchmarks/va`, `make`, and `./bin/host`; for ML benchmarks it documents generating input data with Python first. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))

```text
Evaluation loop:
  Real UPMEM execution over six benchmarks, weak/strong scaling over 608/1216/2432 PIM cores, comparison with hand-optimized baselines.
  Object type: experimental loop over benchmark parameters.
  Inspectable/reusable: partially; code and Makefiles are public, but figure reproduction scripts were not found in checked README/release pages.
```

The paper evaluates reduction, vector addition, histogram, K-means, linear regression, and logistic regression, and reports weak/strong scaling comparisons to PrIM and PIM-ML-style baselines. ([arXiv](https://arxiv.org/html/2310.01893v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the host management table, lazy-zip metadata, per-DPU argument structs, function-handle binary paths, and backend C templates. The paper foregrounds a simple C API, while the reusable semantics are most visible in the runtime metadata contract: an array ID denotes a distributed PIM-resident layout, and iterator calls rewrite that layout state by allocating output regions, choosing communication transfers, compiling/launching DPU kernels, and registering new array IDs. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 — Programming / runtime / benchmark on real hardware.**  
SimplePIM’s strongest stack ownership is the programmer-visible C runtime/API for UPMEM. Its inputs are host-side C calls and user-defined C functions; its outputs are PIM-resident arrays, DPU launches, gathered host arrays, and benchmark results. The paper’s evaluation is explicitly real UPMEM hardware with 2,432 PIM cores and six UPMEM-friendly workloads. ([arXiv](https://arxiv.org/html/2310.01893v1))

**Secondary: A5 — Narrow end-to-end co-design.**  
The stack spans frontend API, runtime metadata, DPU compilation, communication, execution, and evaluation, but the demonstrated end-to-end lane is intentionally narrow: array-oriented C iterators and collectives on UPMEM. The code release’s structure mirrors this scope, with `benchmarks/` and `lib/management`, `lib/communication`, and `lib/processing`. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))

**Tertiary flavor: A3 — mapping / scheduling / DSE framework, but as runtime heuristics rather than a general search framework.**  
SimplePIM makes mapping decisions such as padding/alignment, splitting arrays across DPUs, per-DPU lengths, 12-tasklet execution, lazy zip, adaptive transfer sizing, and shared-vs-private reduction accumulator choice. These decisions are embedded in runtime/backend code, not exposed as a general mapping search space. ([arXiv](https://arxiv.org/html/2310.01893v1))

### 5.2 Axis B — middle-layer style

**B7 — Runtime-state abstraction.**  
The named middle representation is the management interface. It tracks PIM-resident arrays through `array_meta_data_t` in the paper and `table_host_t` in the artifact: IDs/names, lengths, element type sizes, physical address offsets, per-DPU lengths, and virtual-zip state. Decisions made here include whether an array exists, where its distributed chunks reside, how long each DPU’s local segment is, whether a zip is virtual, and where a new output array should be registered. ([arXiv](https://arxiv.org/html/2310.01893v1))

**B3 — Loop / tensor-schedule IR, in iterator form.**  
The named representation is not a tensor IR but a fixed set of array-processing iterators: map, generalized reduction, and zip. These iterators define the legal computation patterns the framework can lower, and their implementation chooses batched transfers, tasklet loops, and accumulator strategies. Decisions about loop unrolling, boundary-check removal, transfer sizing, and function inlining remain embedded in the UPMEM backend implementation. ([arXiv](https://arxiv.org/html/2310.01893v1))

**B4 — Hardware-resource IR, partial and runtime-embedded.**  
The paper and code name UPMEM resources such as PIM cores/DPUs, DRAM banks/MRAM regions, 64 KB scratchpad memory, tasklets, and transfer alignment. The artifact stores the DPU set and DPU count in the management object and records MRAM offsets in table metadata. There is no single hardware-description artifact that upstream passes could read, verify, and rewrite; the resource model is distributed across paper assumptions, headers, constants, and UPMEM SDK calls. ([arXiv](https://arxiv.org/html/2310.01893v1))

**B1 — Config-as-IR, partial.**  
Benchmark parameters such as DPU count and element count appear in benchmark headers such as `Param.h`, and operation arguments are pushed into DPUs through structs such as `map_arguments_t` and `gen_red_arguments_t`. This is useful as a backend contract, but it is runtime configuration rather than a durable compiler IR. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/benchmarks/va/Param.h))

**Single rewriteable artifact?**  
No standalone artifact was found that serves as a unified IR for upstream verification or rewriting. The closest inspectable boundary is a source-level C API plus runtime structs and generated DPU binaries. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable for analog crossbars; first-class for PIM-resident arrays and DPU memory regions** | UPMEM is described as DRAM banks with programmable PIM cores, scratchpad, and instruction memory; SimplePIM names continuous PIM-resident arrays through metadata. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Bit-slicing / bit significance | **Not applicable / implicit numeric concern** | UPMEM is a digital DPU-based architecture. The paper discusses integer quantization and bit shifts for ML workloads, but not bit-sliced CIM values as first-class objects. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| ADC/DAC precision or sensing | **Not applicable** | The demonstrated target is UPMEM DRAM-PIM with programmable cores and explicit memory transfers, not analog CIM with converters. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Analog-to-digital or domain transition | **Not applicable** | No analog sensing/reconstruction path is represented; value movement is host DRAM ↔ DPU MRAM/scratchpad ↔ host. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Peripheral circuits as path nodes | **Implicit hardware constraints** | Transfer alignment, transfer size, scratchpad, and host-mediated communication are modeled as implementation constraints, not peripheral path nodes. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Partial-sum accumulation path | **First-class for reductions at array/accumulator level** | General reduction uses `init_func`, `map_to_val_func`, and `acc_func`; UPMEM implementation has per-DPU intermediate reductions, host-side OpenMP combination, and shared/thread-private scratchpad accumulators. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Reconstruction / shift-add tree | **Not applicable for analog reconstruction; hard-coded numeric shifts in ML cases** | The paper uses integer quantization and shifts to avoid overflow/underflow in ML baselines, but does not expose a reconstruction tree object. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for runtime array state and batching; other items not applicable / not found** | Runtime state is explicit in management tables, per-DPU lengths, offsets, lazy zip metadata, and batched transfers. No KV cache/mask abstraction was found in checked sources. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h)) |
| Value trajectory / flow path | **Approximated at array/chunk level** | Scatter, gather, broadcast, allreduce, allgather, map, reduce, and zip define coarse value movement; per-value typed trajectories are not the named abstraction. ([arXiv](https://arxiv.org/html/2310.01893v1)) |

### 5.4 Axis D — rewrite object

SimplePIM rewrites **runtime state, memory layout, array binding, and iterator calls**. A scatter call rewrites a host array into padded, aligned, per-DPU MRAM chunks and registers a new array ID. A map call rewrites a source array ID and function handle into per-DPU arguments, a DPU binary launch, and a new output array entry. A zip call can rewrite two arrays into lazy metadata rather than immediate physical concatenation. A reduction call rewrites input elements into per-DPU intermediate accumulators and then into a host-combined result. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/communication/CommOps.c))

Legal transformations include distributing continuous arrays over DPUs, padding and aligning data movement, choosing batched scratchpad transfers, substituting power-of-two offset multiplications with shifts, unrolling loops with bounded depth, removing inner-loop boundary checks through pre-partitioning, inlining user functions into iterator templates, lazily representing zip, and choosing reduction accumulator variants based on scratchpad capacity and synchronization tradeoffs. ([arXiv](https://arxiv.org/html/2310.01893v1))

The exploited equivalences are mostly array/data-parallel equivalences: elementwise map can be performed independently per DPU chunk; reductions can accumulate locally and then combine with a commutative function; zip can remain virtual until consumed by a downstream iterator; and PIM-PIM communication can be emulated by gathering through the host and broadcasting back. ([arXiv](https://arxiv.org/html/2310.01893v1))

The representation must preserve array identity, element type size, logical length, per-DPU local lengths, MRAM start/end offsets, function-handle type, binary path, and lazy-zip provenance. Expressing general graph fusion, cross-operator value trajectories, alternative hardware communication fabrics, or analog reconstruction retiming would likely require an additional abstraction that makes per-value path, domain, precision stage, and resource binding explicit. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h))

## 6. Technical mechanism reading

### 6.1 API-level object model

SimplePIM’s core object is the **PIM-resident array**. In the paper, the management interface tracks array metadata including ID, length, data type, and physical PIM DRAM address; the management object also records registered arrays and hardware information such as the number of PIM cores. In the artifact, this object appears as `table_host_t`, with fields for name, start/end offsets, total length, per-DPU lengths, element type size, and virtual-zip provenance. ([arXiv](https://arxiv.org/html/2310.01893v1))

This is the main compiler/IR insight: array identity is separated from physical placement. A user names `"t1"` or `"t2"` in host code, while the runtime records the distributed placement and the DPU-local lengths. Downstream communication and processing calls lookup the ID and reuse that placement state. ([arXiv](https://arxiv.org/html/2310.01893v1))

### 6.2 Communication lowering

The communication interface lowers high-level collectives to UPMEM transfers. Scatter splits a host array into nearly equal chunks across PIM DRAM banks while respecting alignment constraints; gather reassembles a scattered array; broadcast copies a host array to all PIM cores; allreduce and allgather emulate PIM-PIM collectives through host-mediated movement. ([arXiv](https://arxiv.org/html/2310.01893v1))

The artifact’s `CommOps.c` makes the layout rules concrete: it calculates padding, computes per-DPU transfer sizes, prepares UPMEM transfers with `dpu_prepare_xfer`, pushes data to `DPU_MRAM_HEAP_POINTER_NAME`, and registers the resulting table metadata. The helper `calculate_pad_len` computes padding so the total data size is divisible over DPUs and each DPU transfer obeys type-size and 8-byte alignment constraints. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/communication/CommOps.c))

### 6.3 Processing iterators

The **map** iterator applies a programmer-defined `map_func` to each input element and creates a new output array. The UPMEM implementation evenly splits input over PIM cores, launches PIM threads, loads data from PIM DRAM to the 64 KB scratchpad in batches, applies the function, and stores results back in batches. ([arXiv](https://arxiv.org/html/2310.01893v1))

The **general reduction** iterator is richer. Users provide `init_func`, `map_to_val_func`, and `acc_func`; the iterator maps each input element to an output value and an output index, then accumulates with a commutative function. In implementation, each DPU produces intermediate results, the host gathers them, and a host version of the accumulator combines them with OpenMP. ([arXiv](https://arxiv.org/html/2310.01893v1))

The **zip** iterator introduces a particularly IR-like optimization: lazy zipping. The management interface records the addresses, type sizes, and shared length of two arrays without physically combining them. When a later iterator consumes the virtual zipped array, the framework extracts both underlying addresses and streams batches into scratchpad for fused processing. ([arXiv](https://arxiv.org/html/2310.01893v1))

### 6.4 Function-handle compilation

SimplePIM bridges host code and DPU code through function handles. The paper says `create_handle` reads a file containing a PIM function, compiles it, and returns a handle to the CPU; optional context data can be broadcast to all PIM cores. The artifact implements this by constructing UPMEM compiler commands for map and reduction templates and by compiling host-side shared objects for reduction combination. ([arXiv](https://arxiv.org/html/2310.01893v1))

This mechanism is compiler-adjacent: the stack performs template specialization and backend compilation, but the exposed rewrite object is the handle and runtime table rather than an explicit multi-level IR.

### 6.5 Optimization and cost assumptions

SimplePIM’s cost model is procedural and hardware-specific rather than equation-based. The paper’s key UPMEM assumptions include high scratchpad-to-MRAM sensitivity, 8-byte transfer alignment, limited transfer sizes, slow emulated integer multiplication, slow floating point, and the need for enough tasklets to fill the DPU pipeline. ([arXiv](https://arxiv.org/html/2310.01893v1))

The concrete optimization rules are:

- Replace multiplications with shifts when array element sizes are powers of two.
- Use limited loop unrolling to reduce branches while respecting DPU instruction memory.
- Pre-partition work to avoid inner-loop boundary checks.
- Inline programmer-defined functions into iterator loops.
- Dynamically adapt scratchpad-to-DRAM transfer size to input data size and type.
- Use lazy zip to avoid copying and looping overhead.
- Choose shared or thread-private reduction accumulators based on scratchpad capacity and synchronization overhead. ([arXiv](https://arxiv.org/html/2310.01893v1))

### 6.6 Workload and numeric assumptions

The six workloads are reduction, vector addition, histogram, K-means, linear regression, and logistic regression. Vector addition is implemented as zip plus map; histogram is generalized reduction; K-means and regression workloads follow integer quantization approaches from prior UPMEM ML baselines because UPMEM floating point is emulated in software. Logistic regression uses the same quantization as linear regression and the Taylor-series sigmoid approximation used by the baseline. ([arXiv](https://arxiv.org/html/2310.01893v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The management table is the de facto IR boundary

- **Observation:** The paper presents a C API, but the most reusable semantic object is the host-side table of PIM-resident arrays. It records identity, placement, element size, per-DPU lengths, and lazy-zip provenance. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **Why it matters for CIM compiler/IR work:** This is a concrete example of an IR-like boundary that is not called an IR. It captures enough information for later passes to reason about where data lives and how it can be consumed.  
- **Reusable lesson:** A future CIM IR could borrow this idea as a runtime layout environment: symbolic array names map to hardware-resident chunks, with explicit provenance and placement metadata.

### Insight 2 — Lazy zip is a small but important fusion abstraction

- **Observation:** Zip can be represented virtually by storing two source addresses and type sizes, then physically materialized only when another iterator consumes it. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **Why it matters for CIM compiler/IR work:** This is equivalent to a deferred layout transformation or producer-consumer fusion boundary. It shows that even a narrow runtime can carry enough provenance to avoid redundant data movement.  
- **Reusable lesson:** Future compiler stacks could generalize lazy zip into a first-class “virtual layout” object for multi-input operators, scatter/gather fusion, and delayed materialization.

### Insight 3 — General reduction exposes an accumulator contract

- **Observation:** The reduction iterator separates initialization, element-to-output mapping, and accumulation through `init_func`, `map_to_val_func`, and `acc_func`; implementation then decides local accumulation and host combination. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **Why it matters for CIM compiler/IR work:** This separates semantic associativity/commutativity from physical accumulation path. It is a useful bridge between high-level reductions and backend-specific accumulation resources.  
- **Reusable lesson:** A future IR could turn this into a typed reduction object with explicit accumulator layout, reduction tree, synchronization policy, and host/device split.

### Insight 4 — UPMEM backend constraints are encoded as transformations, not merely constants

- **Observation:** Alignment, transfer size, tasklet count, scratchpad capacity, and integer-operation costs directly drive code transformations such as padding, transfer batching, strength reduction, loop unrolling, and boundary-check removal. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **Why it matters for CIM compiler/IR work:** Backend constraints here are not passive hardware parameters; they change the legal and profitable lowering.  
- **Reusable lesson:** A portable CIM stack should expose such constraints as rewrite preconditions and cost annotations, not leave them only in backend templates.

### Insight 5 — The artifact reveals a template-specializing compiler slice

- **Observation:** The paper frames SimplePIM as a framework, but the artifact’s handle creation performs specialization: it injects user function headers through compiler macros, compiles iterator templates to DPU binaries, and creates host-side shared objects for reduction combination. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/processing/ProcessingHelperHost.c))  
- **Why it matters for CIM compiler/IR work:** This is a practical backend/codegen contract: user semantics are spliced into a fixed parallel skeleton.  
- **Reusable lesson:** A future compiler could wrap this as a backend plugin that consumes a small set of map/reduce/zip meta-ops and emits UPMEM-compatible binaries.

### Insight 6 — Real-hardware validation is the strongest reusable evidence

- **Observation:** The evaluation uses a 2,432-core UPMEM system and reports weak/strong scaling over six workloads; the repository contains benchmark directories and runnable Makefile workflows. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **Why it matters for CIM compiler/IR work:** Many CIM stacks rely on simulators or analytical models; SimplePIM is valuable as a calibration point for real DPU memory movement, launch overheads, and framework-vs-hand-code comparisons.  
- **Reusable lesson:** A corpus should tag SimplePIM as a validation/benchmark artifact for UPMEM runtime lowering rather than as a general-purpose CIM dialect.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `CMU-SAFARI/SimplePIM` GitHub repository. The paper and README both point to this public repository. ([arXiv](https://arxiv.org/html/2310.01893v1))  
- **License:** MIT License, copyright SAFARI Research Group at ETH Zürich, 2023. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/LICENSE))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** C source for management, communication, and processing interfaces; benchmark folders for vector addition, reduction, histogram, K-means, linear regression, and logistic regression; Makefile-based benchmark workflows; Python data-generation scripts for ML benchmarks according to the README. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))  
- **What the artifact appears to omit in checked sources:** No release packages are published on the GitHub releases page; no figure-generation workflow was found in the checked README/release pages. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))  
- **Minimal documented workflow:** Install the UPMEM SDK; clone the repo; for simple benchmarks, enter a benchmark folder, run `make`, then `./bin/host`; for linear regression/logistic regression/K-means, generate input data with the benchmark’s Python script before building/running. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))  
- **Whether paper figures appear reproducible from the artifact:** **Partial / unknown from checked sources.** The code and benchmark workflows are public, but the checked README/release pages do not document scripts that directly regenerate Figures 9–11.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | C host calls and user-defined function files are described in the paper; README documents benchmark workflows. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Intermediate representation serialized | **Unknown** | No standalone serialized IR/schema found; middle state is C runtime metadata and DPU argument structs. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h)) |
| Mapping decisions inspectable | **Partial** | Per-DPU lengths, offsets, padding, and lazy-zip state are inspectable in source, but not emitted as a separate trace by the checked docs. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/management/Management.h)) |
| Schedule inspectable | **Partial** | The paper documents 12 default PIM threads and batched scratchpad transfers; handle creation uses `-DNR_TASKLETS=12`. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Hardware config explicit | **Partial** | Paper gives UPMEM architecture parameters; artifact stores `num_dpus` and DPU set, while no full hardware config file was found. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Precision / bit-slice assumptions explicit | **Partial** | Integer type sizes and ML quantization assumptions are described; analog bit slicing is not applicable to UPMEM. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Cost model inspectable | **Partial** | No formal cost equation found; optimization rules and timing prints are visible in paper/code. ([arXiv](https://arxiv.org/html/2310.01893v1)) |
| Simulator backend documented | **Partial** | README states the code requires UPMEM SDK and can run on real modules or the UPMEM SDK functional simulator. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM)) |
| Generated code / instruction stream inspectable | **Partial** | DPU source templates and compiler commands are visible; generated instruction streams are not exposed as a corpus-level object. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/processing/ProcessingHelperHost.c)) |
| Provenance from source op to backend action | **Partial** | API calls map to table entries, arguments, DPU binaries, and launches in source; no provenance trace format found. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SimplePIM/main/lib/processing/map/Map.c)) |
| Reproduction scripts available | **Partial** | Benchmark Makefiles and Python data-generation scripts are documented; figure scripts not found in checked README/release pages. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM)) |
| Calibration source documented | **Yes** | Evaluation is on a real UPMEM system with 2,432 PIM cores and baseline comparisons. ([arXiv](https://arxiv.org/html/2310.01893v1)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible for C applications expressible as array scatter/broadcast plus map/reduce/zip. Integration would be most direct by recognizing SimplePIM-style calls or by generating those calls from a higher-level IR.  
- **As IR inspiration:** The most valuable reusable boundary is the management-table abstraction: array ID, distributed placement, per-DPU lengths, type size, and lazy layout provenance.  
- **As mapper/scheduler:** The partitioning, padding, alignment, lazy zip, and reduction-variant logic could be adapted as UPMEM backend lowering rules.  
- **As cost model:** The paper’s optimization rules and measured UPMEM behavior can seed a rule-based backend cost plugin, especially for transfer alignment, scratchpad capacity, tasklet occupancy, integer multiplication cost, and host-mediated collectives.  
- **As backend:** A compiler could wrap `create_handle`, iterator templates, and UPMEM SDK compilation as a backend for map/reduce/zip meta-ops.  
- **As benchmark:** The six workloads and links to PrIM/PIM-ML/dpu_kmeans baselines make SimplePIM useful as a UPMEM productivity/performance benchmark. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))  
- **As validation source:** Real-system UPMEM results can calibrate static models of DPU launches, MRAM-scratchpad transfer behavior, host-mediated communication, and reduction overheads. ([arXiv](https://arxiv.org/html/2310.01893v1))  

**Integration effort estimate: Medium.** Integration as a UPMEM backend or benchmark harness is relatively direct because the artifact exposes C APIs, benchmark folders, and UPMEM compilation commands. Integration into a general CIM compiler/IR stack would require an adapter that extracts or reconstructs the runtime table state as a durable IR object, plus a representation for iterator semantics and backend constraints. The demonstrated scope is clear and useful, but the core semantics are distributed across source templates, runtime structs, and UPMEM SDK calls rather than packaged as a single compiler-facing schema.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PrIM benchmark suite / UPMEM characterization** | Real UPMEM hardware, memory-bound workloads, baseline implementations for reduction/vector addition/histogram. | PrIM is primarily a benchmark and characterization suite; SimplePIM is a programming/runtime abstraction that reimplements some benchmark patterns through iterators and collectives. ([arXiv](https://arxiv.org/abs/2105.03814?utm_source=chatgpt.com)) | Tag SimplePIM separately from pure benchmark suites: it contributes a reusable programming layer and hidden runtime IR. |
| **PIM-ML: Machine Learning Training on a Real Processing-in-Memory System** | UPMEM ML workloads including linear regression, logistic regression, and K-means; integer quantization and real-system evaluation. | PIM-ML provides hand-tuned ML workload implementations and analysis; SimplePIM abstracts several of these patterns through map/reduce/zip and communication primitives. ([arXiv](https://arxiv.org/abs/2206.06022?utm_source=chatgpt.com)) | Use PIM-ML as a workload/baseline neighbor, not as the same stack role. |
| **UPMEM dpu_kmeans** | K-means on UPMEM and reusable DPU software packaging. | dpu_kmeans is an application/template project for one algorithm; SimplePIM’s reusable object is the array-programming runtime that can express K-means among other workloads. ([GitHub](https://github.com/upmem/dpu_kmeans?utm_source=chatgpt.com)) | Distinguish application-specific UPMEM code from pattern-based programming frameworks. |
| **DaPPA** | Pattern-based UPMEM programming, automatic data distribution/gathering, memory management, work parallelization, UPMEM target code generation. | DaPPA is closer to a source-to-target data-parallel code generation framework; SimplePIM is a C runtime/API with iterator handles and library-managed PIM arrays. ([arXiv](https://arxiv.org/abs/2310.10168?utm_source=chatgpt.com)) | Good comparison for A6/A5 UPMEM programming stacks; contrast the first-class object: data-parallel application code vs runtime array metadata. |
| **CINM / Cinnamon** | CIM/CNM compiler infrastructure, UPMEM support, backend lowering. | CINM is explicitly MLIR-based and targets heterogeneous CIM/CNM devices; SimplePIM is a UPMEM-centered runtime framework without a standalone IR/dialect. ([GitHub](https://github.com/tud-ccc/Cinnamon?utm_source=chatgpt.com)) | Useful contrast between explicit IR stacks and hidden-runtime-IR stacks. |
| **FREERIDE / MATE-style generalized reduction lineage** | General reduction pattern: map input elements to output entries and combine with associative/commutative accumulation. | SimplePIM adapts this pattern to PIM-resident arrays, DPU-local accumulation, and host-mediated final combination. ([arXiv](https://arxiv.org/html/2310.01893v1)) | Tag generalized reduction separately from conventional map-only PIM APIs. |

## 10. Corpus-ready final takeaway

- SimplePIM’s real contribution is a C-level programming/runtime framework for UPMEM-style PIM arrays, not a general CIM compiler IR.
- Its strongest reusable stack layer is the host-managed runtime boundary: PIM-resident array metadata, communication collectives, iterator handles, and per-DPU launch arguments.
- The evidenced scope is six UPMEM workloads—reduction, vector addition, histogram, linear regression, logistic regression, and K-means—evaluated on real UPMEM hardware with 608/1,216/2,432-core scaling. ([arXiv](https://arxiv.org/html/2310.01893v1))
- First-class objects include array IDs, DPU/MRAM placement, per-DPU chunk lengths, element type sizes, lazy zipped arrays, function handles, and reduction accumulator functions.
- The hidden IR lives in C structs and backend templates: `table_host_t`, `simplepim_management_t`, operation argument structs, and DPU compilation commands.
- Artifact status is strong for a narrow UPMEM scope: public MIT-licensed code, six benchmark folders, documented UPMEM SDK workflow, and no published GitHub releases. ([GitHub](https://github.com/CMU-SAFARI/SimplePIM))
- Integration would be most direct as a UPMEM backend or benchmark harness; compiler-level reuse would benefit from extracting runtime metadata into a durable IR/schema.
- For a value-trajectory IR, SimplePIM is relevant as a chunk-level data-placement and movement model; trajectory-level rewrites would add explicit value-path, domain, precision, and reduction-tree metadata.
