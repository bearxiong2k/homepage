# SparseP — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Primary: A6 — Programming / runtime / benchmark on real hardware. Secondary: A5 narrow end-to-end co-design; A3 mapping / scheduling.** | SparseP is centered on a real UPMEM PIM software library and evaluation methodology for SpMV, rather than a general compiler pipeline. The paper frames its main contribution as the first open-source SpMV library for real PIM architectures, with 25 kernels and real-system comparison against CPU/GPU baselines. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Middle-layer style, Axis B | **B1 config-as-IR; B3 loop / tensor-schedule IR; B4 hardware-resource IR; B7 runtime-state abstraction.** | The effective middle layer is distributed across kernel directories, Makefile parameters, sparse formats, DPU/tasklet mappings, synchronization modes, and host/DPU partitioning code. The artifact exposes these choices as build flags and hand-written C kernels rather than as a standalone compiler IR. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) |
| First-class CIM objects, Axis C | **UPMEM DPU, DRAM-bank/MRAM locality, WRAM/IRAM scratchpad/code memory, tasklet, host–PIM transfer phase, sparse matrix format, matrix partition, partial output, synchronization mode, data type.** | The paper directly names UPMEM DPUs, tasklets, MRAM/WRAM/IRAM, 1D/2D matrix partitioning, CSR/COO/BCSR/BCOO layouts, multiple data types, host retrieval/merge phases, and synchronization alternatives. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Rewrite object, Axis D | **Sparse memory layout, PIM-core mapping, tasklet schedule, synchronization mode, host–PIM movement plan, runtime partial-result state.** | SparseP rewrites the SpMV implementation by choosing among formats, partitioning schemes, core/tasklet load-balancing rules, synchronization mechanisms, and data-type-specialized kernels. These are selected through separate kernels and build/run configuration rather than through a generic rewrite engine. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Best corpus tags | `UPMEM`, `DRAM-PIM`, `digital-PIM`, `near-bank-PIM`, `SpMV`, `sparse-linear-algebra`, `sparse-format`, `host-PIM-data-movement`, `tasklet-scheduling`, `real-hardware-evaluation` | These tags reflect the demonstrated stack slice: sparse linear algebra kernels on a real near-bank digital PIM platform with explicit attention to sparse layout, partitioning, tasklet scheduling, and host–PIM data movement. |
| Closest comparison baselines | **PrIM Benchmark Suite; CUT / UPMEM characterization; HMC-based PIM SpMV; inter-DIMM broadcast/gather PIM work; Fujiki-style sparse format transformation near memory; commodity SpMV format/schedule libraries.** | These works share either the UPMEM real-system setting, sparse matrix mapping problem, or near-memory communication concern. SparseP is closest when the comparison object is a real PIM sparse-kernel backend rather than an analog-CIM compiler IR. ([arXiv](https://arxiv.org/pdf/2201.05072)) |

## 2. One-paragraph public summary

SparseP is a real-system sparse linear algebra study and software library for SpMV on UPMEM near-bank digital PIM. Its concrete contribution is a family of 25 hand-written host/DPU kernels covering CSR, COO, BCSR, and BCOO sparse formats, multiple scalar data types, 1D and 2D matrix partitioning, PIM-core load balancing, tasklet-level load balancing, and synchronization choices, evaluated on a 20-DIMM UPMEM system against CPU and GPU baselines. ([arXiv](https://arxiv.org/pdf/2201.05072)) For CIM compiler/IR research, SparseP is most useful as a sparse-mapping and backend-contract case study: it exposes what a compiler would need to represent for real near-bank PIM execution, including sparse format metadata, host–PIM transfer phases, DPU memory placement, tasklet schedules, partial-output merging, and reproducibility constraints around hardware, SDK, and benchmark preparation. The demonstrated abstraction is a library-plus-configuration stack rather than a standalone compiler IR, but its artifact makes the hidden mapping state unusually concrete. ([GitHub](https://github.com/CMU-SAFARI/SparseP))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| SparseP is the first comprehensive analysis of SpMV on real-world PIM systems and the first SpMV library for real PIM architectures. | Abstract and introduction / contributions. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Experiment; code/artifact; paper-only framing. | The paper evaluates SpMV on a real UPMEM system and the public artifact contains a SparseP repository with host/DPU kernels, scripts, inputs, and documentation. ([arXiv](https://arxiv.org/pdf/2201.05072)) | The demonstrated scope is UPMEM-style near-bank digital PIM and SpMV. The “first” claim is an authors’ positioning claim; the evidenced reusable result is the public UPMEM SpMV kernel suite. |
| SparseP provides 25 SpMV kernels across four sparse formats, data types, partitioning schemes, load-balancing schemes, and synchronization choices. | Section 3 overview, Table 1 / Table 2, artifact README. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Algorithm; code/artifact; documentation. | The artifact exposes `spmv/1D` and `spmv/2D` directories containing 9 and 16 kernel variants, respectively, matching the 25-kernel claim. ([GitHub](https://github.com/CMU-SAFARI/SparseP/tree/main/spmv/1D)) | The reusable boundary is clearest at kernel-directory selection plus Makefile/runtime parameters. There is no standalone serialized IR object that enumerates all choices. |
| The work explores SpMV strategies inside one multithreaded PIM core. | Contributions and Sections 3.1, 5. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Algorithm; experiment. | Tasklet load-balancing policies distribute rows, nonzeros, blocks, or block nonzeros across UPMEM tasklets; synchronization is studied through coarse-grained locks, fine-grained locks, and lock-free partial accumulation. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Demonstrated for UPMEM’s tasklet model and SpMV. Generalization to other PIM thread models would require adapting the tasklet, WRAM, mutex, and MRAM-access assumptions. |
| The work explores SpMV strategies across many PIM cores, including 1D and 2D partitioning. | Sections 3.2 and 3.3; Figure 8; Table 1. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Algorithm; experiment; code/artifact. | The paper defines horizontal 1D partitioning and multiple 2D tiling strategies, and the artifact provides named 1D/2D kernel families. ([arXiv](https://arxiv.org/pdf/2201.05072)) | The partitioning space is hand-implemented for SpMV formats and UPMEM DPUs. Further reuse as a compiler pass would depend on extracting the partition metadata and legality rules from host code into an explicit mapping object. |
| SparseP compares PIM SpMV against CPU and GPU baselines. | Evaluation methodology and Section 7. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Experiment. | The paper compares against an Intel Xeon Silver 4110 CPU and NVIDIA Tesla V100 GPU, reporting transfer-inclusive and kernel-only perspectives, performance fraction of peak, and energy/performance-per-watt observations. ([arXiv](https://arxiv.org/pdf/2201.05072)) | The comparison is tied to the specific platform, SuiteSparse matrix set, data types, and transfer model. It is strongest as a calibrated real-system backend study rather than a universal sparse accelerator ranking. |
| SparseP identifies bottlenecks and recommendations for future PIM systems. | Section 8 recommendations. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Experiment-supported design guidance. | The paper recommends attention to tasklet/core load balance, partitionable compressed formats, adaptive algorithms, synchronization support, and broadcast/gather-style communication support. ([arXiv](https://arxiv.org/pdf/2201.05072)) | The recommendations are grounded in UPMEM SpMV behavior. They are reusable as backend-contract requirements for sparse CIM/PIM compilers, especially around data movement and partial-result aggregation. |
| SparseP is publicly available and runnable. | Artifact README. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) | Code/artifact; documentation. | The repository provides C host/DPU kernels, matrix-download scripts, run scripts, Makefiles, and instructions for UPMEM SDK or functional-simulator use. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) | The artifact is public, but exact figure regeneration is partly implicit: scripts exist, paths must be edited, SDK/hardware are external, and the README does not present a figure-by-figure reproduction manifest. |

## 4. Stack anatomy

```text
Input / frontend:
Matrix Market .mtx sparse matrices, including SuiteSparse downloads via artifact scripts.
The input object is a sparse matrix file plus dense vector initialization in host code.
It is documented and inspectable, but the parsed representation is C data structures rather than a reusable frontend IR.

Middle representation:
CSR, COO, BCSR, and BCOO compressed matrix arrays, data-type specialization, block size, kernel-directory choice, and Makefile flags such as TYPE, NR_DPUS, and NR_TASKLETS.
This is a layout/config object rather than a named compiler IR.
It is inspectable through source code, scripts, and build flags, but not serialized as a single schema.

Mapping or scheduling state:
1D or 2D matrix partitioning, DPU assignment, tasklet assignment, row/nonzero/block load-balancing policy, synchronization mode, and host-side merge state.
The state is partly named in the paper and artifact directory structure, partly embedded in host and DPU C code.
It is inspectable but not emitted as a separate mapping trace.

Hardware abstraction:
UPMEM DPU, DRAM-bank-local MRAM, WRAM scratchpad, IRAM instruction memory, tasklets, host CPU, memory bus, and lack of direct PIM-core-to-PIM-core communication.
The abstraction is documented in the paper and encoded through the UPMEM SDK API.
It is concrete and reusable as a backend model for UPMEM-like digital PIM, not as a technology-neutral CIM hardware IR.

Backend / simulator / codegen:
Host C and DPU C compiled with the UPMEM SDK; DPU code is built with the UPMEM DPU compiler and can run on real UPMEM modules or the SDK functional simulator.
The backend is inspectable as source and build scripts.
The generated binary / instruction stream is not exposed as a compiler-level IR.

Output artifact:
Executable host and DPU binaries, output vector y, timing results, and script-collected experiment outputs.
The paper reports phase-level metrics: input-vector load, PIM kernel execution, result retrieval, and host merge.
The output is measurable and auditable, but provenance from a source-level SpMV operation to every backend action is implicit.

Evaluation loop:
Scripts download matrices, build kernel variants, run selected DPU/tasklet/data-type configurations, and collect results.
The paper’s evaluation loop compares single-DPU, multi-DPU 1D, multi-DPU 2D, CPU, and GPU behavior.
The workflow is partially reproducible with UPMEM SDK/hardware or functional simulator access.
```

The UPMEM hardware model includes 24 KB IRAM, 64 KB WRAM, 64 MB MRAM per DPU, 24 hardware threads/tasklets, and no direct DPU-to-DPU communication; these details are central to the backend contract that SparseP targets. ([arXiv](https://arxiv.org/pdf/2201.05072)) The artifact’s README documents the repository structure, matrix-download workflow, run scripts, and per-kernel build flow. ([GitHub](https://github.com/CMU-SAFARI/SparseP))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of sparse-format arrays, directory-level kernel variant, Makefile flags, host-side partition metadata, DPU memory layout, tasklet schedule, synchronization choice, and phase-level timing convention. The paper foregrounds a PIM SpMV library and empirical analysis, while the reusable semantics are most visible in the named kernel families, build parameters, partitioning descriptions, and host/DPU data-movement code.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 — Programming / runtime / benchmark on real hardware.**  
SparseP’s strongest ownership is the programming and evaluation layer for real UPMEM PIM hardware. Its input is a sparse matrix workload in compressed or convertible form; its output is a running host/DPU SpMV implementation plus measured runtime, energy estimates, and phase-level behavior. The paper’s methodology explicitly uses a real UPMEM platform with 20 PIM DIMMs and 2560 physical DPUs, of which 2528 are usable in the reported system because 32 were faulty. ([arXiv](https://arxiv.org/pdf/2201.05072))

**Secondary: A5 — Narrow end-to-end co-design.**  
SparseP is also a narrow co-design study because it jointly considers sparse format, DPU partitioning, tasklet scheduling, synchronization, host transfers, and UPMEM hardware constraints. The scope is deliberately tight: SpMV on UPMEM-style near-bank digital PIM. ([arXiv](https://arxiv.org/pdf/2201.05072))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
The work explores mapping and scheduling alternatives, including row/nonzero/block balancing, 1D vs 2D partitioning, DPU count, tasklet count, and synchronization strategy. These decisions are realized through a fixed set of hand-written variants rather than through a general-purpose search engine or rewrite system. ([arXiv](https://arxiv.org/pdf/2201.05072))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is the artifact’s combination of kernel directory, Makefile parameters, run-script parameters, and matrix input path. Decisions such as data type, number of DPUs, number of tasklets, and balancing mode appear as build or run parameters; for example, the CSR-row Makefile exposes `TYPE`, `NR_TASKLETS`, `NR_DPUS`, and tasklet-balancing flags. ([GitHub](https://github.com/CMU-SAFARI/SparseP/blob/main/spmv/1D/CSR-row/Makefile)) A single upstream-readable schema is not provided; an adapter would need to normalize directory names, Makefile flags, and script lists into one configuration object.

**B3 — Loop / tensor-schedule IR.**  
The actual schedule is a family of hand-written SpMV loop nests over rows, nonzeros, blocks, and block nonzeros. Decisions are made at row/nonzero/block granularity and tasklet granularity. The paper’s CSR loop presentation and later tasklet-balancing discussion show that SparseP’s legality constraints are loop/schedule constraints over sparse data structures. ([arXiv](https://arxiv.org/pdf/2201.05072)) These schedules are readable in C source, but they are not represented as a Halide/TVM/MLIR-style schedule object.

**B4 — Hardware-resource IR.**  
The work names concrete resources: DPU, MRAM, WRAM, IRAM, tasklet, host CPU, memory bus, and DRAM-bank locality. Decisions such as where matrix chunks, input-vector elements, partial outputs, and synchronization state reside are made with these resources in mind. ([arXiv](https://arxiv.org/pdf/2201.05072)) The hardware-resource representation is embedded in prose, UPMEM SDK calls, memory offsets, and transfer choices rather than as a formal hardware IR.

**B7 — Runtime-state abstraction.**  
SparseP makes runtime state operationally important: mutexes, partial-output buffers, host-side merge, per-DPU partitions, and tasklet-local work assignment determine both correctness and performance. The lock-free design stores partial results in WRAM and lets one tasklet merge them, while 2D partitioning creates host-side partial-output merging. ([arXiv](https://arxiv.org/pdf/2201.05072)) This is a valuable runtime-state abstraction for a future CIM compiler, though currently exposed as implementation structure rather than a serialized state machine.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable for analog crossbars; DPU / DRAM-bank hierarchy is first-class.** | SparseP targets UPMEM near-bank digital PIM, where each DPU is tightly coupled with a DRAM bank and has local MRAM/WRAM/IRAM resources. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Bit-slicing / bit significance | **Not applicable.** | The represented numeric variation is scalar data type selection, not bit-sliced analog-CIM representation. The paper and artifact discuss `int8`, `int16`, `int32`, `int64`, `fp32`, and `fp64` kernels. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| ADC/DAC precision or sensing | **Not applicable.** | UPMEM is a digital near-bank PIM platform with programmable DPUs, not an analog crossbar system requiring ADC/DAC modeling. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Analog-to-digital or domain transition | **Not applicable.** | The relevant domain transition is host memory / PIM memory movement, not analog-to-digital conversion. The execution phases are load input vector, run PIM kernel, retrieve results, and merge partial outputs. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Peripheral circuits as path nodes | **Implicit / costed at the memory-system level.** | SparseP measures and discusses host–PIM transfer and retrieval phases, and recommends broadcast/gather-style support for future systems. It does not model peripheral circuits as explicit IR nodes. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Partial-sum accumulation path | **First-class in algorithmic/runtime form.** | COO/BCOO row or block-row splits can create partial outputs requiring synchronization or host merge; lock-free tasklet synchronization stores partials in WRAM before merging. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Reconstruction / shift-add tree | **Not applicable.** | There is no bit-sliced analog reconstruction path. Equivalent concerns appear as digital partial-output accumulation and merge. |
| Runtime state, masks, KV cache, batching, sparsity | **Sparsity and runtime state are first-class; masks/KV cache/batching are not applicable to the demonstrated workload.** | CSR/COO/BCSR/BCOO arrays, tasklet assignments, locks, and partial-output states are central to the kernels. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Value trajectory / flow path | **Approximated by phase and placement structure.** | SparseP names the path from host input-vector load to DPU kernel execution to result retrieval and host merge, but does not serialize value identity as a trajectory IR. ([arXiv](https://arxiv.org/pdf/2201.05072)) |

### 5.4 Axis D — rewrite object

SparseP’s rewrite object is best described as **sparse mapping and schedule selection**. The paper’s framework changes:

- sparse memory layout: CSR, COO, BCSR, BCOO;
- partitioning: single DPU, 1D across DPUs, 2D across DPUs;
- DPU-core mapping: row, nonzero, block, or block-nonzero balancing;
- tasklet schedule: row/nonzero/block work distribution within a DPU;
- synchronization mode: coarse-grained locks, fine-grained locks, or lock-free partial accumulation;
- data type specialization: integer and floating-point variants;
- host–PIM movement: replicated input vector in 1D, partitioned input vector and host merge in 2D.

The legal transformations preserve SpMV semantics across equivalent sparse layouts and partitionings. The important preserved information is row identity, column index, nonzero value, block shape, data type, output-vector index, partial-output ownership, and reduction/merge responsibility. The representation is especially well suited to exploring **format–partition–schedule tradeoffs for one sparse operator**; expressing cross-operator sparse pipelines, automatic legality checking, or trajectory-level rewrites would likely require an additional abstraction for value identity, reduction ownership, and memory-domain transitions.

## 6. Technical mechanism reading

### 6.1 Workload object: SpMV as sparse-layout-sensitive computation

SparseP centers on SpMV, `y = A × x`, where `A` is sparse and `x`/`y` are dense vectors. The paper introduces CSR with the usual `rowptr`, `colind`, and `values` arrays and then considers COO, BCSR, and BCOO as alternative compressed formats. ([arXiv](https://arxiv.org/pdf/2201.05072)) For compiler/IR purposes, the important point is that the sparse layout is not a passive storage detail: it determines partition legality, tasklet work splitting, synchronization needs, input-vector access locality, and partial-output merge cost.

### 6.2 Hardware contract: UPMEM near-bank digital PIM

The target hardware is UPMEM’s programmable near-bank PIM architecture. Each DPU has local MRAM, WRAM, IRAM, a 32-bit in-order RISC pipeline, and hardware tasklets; DPUs are associated with DRAM banks and communicate with the host through memory transfers, while direct DPU-to-DPU communication is unavailable. ([arXiv](https://arxiv.org/pdf/2201.05072)) This gives SparseP a hardware abstraction closer to “many small memory-local digital cores” than to analog-CIM arrays. The compiler-relevant contract is therefore about placement, transfer granularity, local scratchpad capacity, tasklet parallelism, and host-mediated collection.

### 6.3 Execution phases as a cost boundary

SparseP decomposes execution into four phases: loading the input vector to PIM memory, executing the PIM kernel, retrieving results, and merging partial outputs on the host. The paper omits matrix load time from the main SpMV timing because sparse matrix data can be reused across iterative solvers or repeated SpMV calls. ([arXiv](https://arxiv.org/pdf/2201.05072)) This phase decomposition is one of the paper’s most useful compiler-facing ideas: it separates backend kernel cost from host–PIM data movement and reduction cost.

### 6.4 PIM-core partitioning: 1D and 2D

In 1D partitioning, the matrix is split horizontally across DPUs, and the full input vector is replicated to each participating DPU bank. This keeps most computation local but makes input-vector broadcast cost scale with DPU count. ([arXiv](https://arxiv.org/pdf/2201.05072)) In 2D partitioning, the matrix is split into tiles so each DPU receives a subset of rows and columns; this reduces input-vector replication but introduces partial outputs that must be gathered and merged. The paper evaluates equal-size, equal-width, and variable-size 2D strategies. ([arXiv](https://arxiv.org/pdf/2201.05072))

The result is a clear mapping tradeoff: 1D has simpler output ownership and larger replicated input movement; 2D reduces replicated input movement but creates more partial-output aggregation and tile-load-balance issues.

### 6.5 Load balancing across DPUs and tasklets

SparseP distinguishes load balance across PIM cores from load balance inside one DPU. Across DPUs, CSR and BCSR are constrained by row or block-row boundaries, while COO and BCOO can split work more flexibly by nonzeros or block nonzeros, with additional merge/synchronization implications. ([arXiv](https://arxiv.org/pdf/2201.05072)) Inside each DPU, tasklets divide rows, nonzeros, blocks, or block nonzeros. The paper evaluates tasklet balancing and uses 4×4 blocks for block formats in the reported experiments. ([arXiv](https://arxiv.org/pdf/2201.05072))

A compiler reading of this mechanism is that sparse format determines the legal schedule space. CSR preserves row-local accumulation but constrains partition cuts; COO exposes more nonzero-level work sharing but may create cross-tasklet or cross-DPU partial reductions.

### 6.6 Synchronization and partial-output ownership

SparseP implements synchronization alternatives for cases where multiple tasklets may update the same output row. The paper describes coarse-grained global locking, fine-grained locks, and a lock-free approach in which partial results are kept in WRAM and merged by one tasklet. ([arXiv](https://arxiv.org/pdf/2201.05072)) Table 2 classifies which format/load-balancing combinations need synchronization and which kernels use the lock-free, coarse-grained, or fine-grained strategy. ([arXiv](https://arxiv.org/pdf/2201.05072))

This is a runtime-state problem as much as a schedule problem. The backend must know whether an output element is exclusively owned, tasklet-shared, DPU-shared, or host-merged.

### 6.7 Memory layout and transfer granularity

SparseP’s kernel implementation streams sparse matrix data from MRAM to WRAM in chunks, following UPMEM-oriented transfer practices. Sparse matrix arrays are accessed in relatively coarse chunks, while input-vector accesses are irregular and fine-grained, and output-vector writes occur after local accumulation. ([arXiv](https://arxiv.org/pdf/2201.05072)) For IR design, this suggests that a backend contract for sparse PIM needs more than “which DPU owns which rows”: it also needs transfer granularity, cache/scratchpad staging, vector-access pattern, and output writeback ownership.

### 6.8 Empirical selection rather than formal cost optimization

SparseP does not present a single formal optimizer that chooses the best kernel variant. Instead, it implements a structured variant space and evaluates it empirically using phase-level measurements. The paper derives peak-performance and bandwidth reference values for UPMEM and compares achieved performance against CPU/GPU baselines, and it estimates energy using hardware counters and UPMEM-provided energy weights. ([arXiv](https://arxiv.org/pdf/2201.05072)) This makes the work valuable as a calibration and benchmarking source: the cost model is partly explicit through measured phases and partly embodied in scripts, hardware counters, and kernel variants.

### 6.9 Demonstrated workload and platform assumptions

The evaluation uses SuiteSparse matrices plus small matrices, multiple data types, and CPU/GPU comparison baselines. ([arXiv](https://arxiv.org/pdf/2201.05072)) The UPMEM platform has practical constraints that become part of the backend legality model: finite MRAM and WRAM, tasklet count, transfer granularity, limited multiplication hardware support for some types, and real-system DPU availability. The paper reports, for example, that UPMEM performance differs strongly by data type because some multiplication operations are hardware-supported while others are software-emulated. ([arXiv](https://arxiv.org/pdf/2201.05072))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Sparse format is a mapping legality object

- **Observation:** CSR, COO, BCSR, and BCOO are not treated merely as storage formats; they determine where partitions may cut, whether rows can be split, what synchronization is required, and how much host merge is introduced.
- **Why it matters for CIM compiler/IR work:** A sparse CIM IR should type layout choices with legality constraints, not just with memory-footprint metadata.
- **Reusable lesson:** Represent sparse layout as a first-class mapping object with fields for row ownership, nonzero ownership, block shape, output-reduction ownership, and split-row policy.

### Insight 2 — Host–PIM phases are part of the sparse schedule

- **Observation:** SparseP’s four-phase timing model separates input-vector load, PIM kernel execution, result retrieval, and host merge. ([arXiv](https://arxiv.org/pdf/2201.05072))
- **Why it matters for CIM compiler/IR work:** A compiler that optimizes only the PIM-local kernel can choose variants that are attractive inside the DPU but costly end-to-end.
- **Reusable lesson:** A future IR should include transfer and merge phases as schedulable operations, especially for sparse workloads where input-vector broadcast and partial-output gather dominate some regimes.

### Insight 3 — Tasklet synchronization is a semantic backend contract

- **Observation:** The lock-free, coarse-grained-lock, and fine-grained-lock variants express different ownership protocols for output accumulation. ([arXiv](https://arxiv.org/pdf/2201.05072))
- **Why it matters for CIM compiler/IR work:** Synchronization is not an incidental implementation detail when sparse partitions split rows or block rows; it determines legal accumulation and numerical reduction structure.
- **Reusable lesson:** Sparse PIM backends should expose “exclusive output,” “tasklet-shared output,” “DPU-shared partial,” and “host-merged partial” as schedule states.

### Insight 4 — The artifact directory tree acts as a de facto variant IR

- **Observation:** The repository’s `spmv/1D` and `spmv/2D` directories enumerate kernel variants, while Makefiles and scripts encode DPU count, tasklet count, data type, and balancing choices. ([GitHub](https://github.com/CMU-SAFARI/SparseP/tree/main/spmv/1D))
- **Why it matters for CIM compiler/IR work:** This is a practical example of how a backend library exposes a design space without a formal IR.
- **Reusable lesson:** A corpus adapter could mine the directory names and build flags into a normalized mapping schema for comparing sparse CIM/PIM stacks.

### Insight 5 — Real hardware capacity constraints shape the useful schedule space

- **Observation:** UPMEM-specific limits such as WRAM capacity, MRAM access patterns, tasklet count, and multiplication support affect kernel selection and performance. The artifact documentation also notes WRAM pressure when using more tasklets. ([arXiv](https://arxiv.org/pdf/2201.05072))
- **Why it matters for CIM compiler/IR work:** Backend legality needs explicit resource typing: scratchpad size, transfer granularity, local memory capacity, supported arithmetic, and number of hardware threads.
- **Reusable lesson:** Treat hardware resource constraints as verifiable schedule constraints rather than backend comments.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL / identifier:** `https://github.com/CMU-SAFARI/SparseP`
- **License:** MIT. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/SparseP/main/LICENSE))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** C host/DPU code, 25 SpMV kernel variants, 1D and 2D kernel directories, Makefiles, Python and shell run scripts, matrix-download scripts, and README instructions. ([GitHub](https://github.com/CMU-SAFARI/SparseP))
- **What the artifact appears to omit:** A packaged release, a container or locked SDK version, a standalone IR/schema, figure-by-figure reproduction manifest, generated mapping traces, and bundled UPMEM hardware/SDK dependencies.
- **Minimal documented workflow:** Install or use the UPMEM SDK, clone the repository, run the input matrix download script, update `input_path` in scripts, run the 1-DPU / 1D / 2D experiment scripts, or build an individual kernel with parameters such as `NR_DPUS`, `NR_TASKLETS`, and `TYPE`. ([GitHub](https://github.com/CMU-SAFARI/SparseP))
- **Whether paper figures appear reproducible from the artifact:** **Partial.** The scripts and kernels expose the main experiment space, but exact figure reproduction depends on external SDK/hardware access, path edits, and implicit mapping from scripts to paper figures.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Yes** | README and scripts use Matrix Market `.mtx` inputs and SuiteSparse download scripts. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) |
| Intermediate representation serialized | **Partial** | Sparse layouts and build configurations are visible, but no single serialized compiler IR is provided. |
| Mapping decisions inspectable | **Partial** | Kernel names, directories, scripts, and Makefile flags expose many mapping decisions. ([GitHub](https://github.com/CMU-SAFARI/SparseP/tree/main/spmv/1D)) |
| Schedule inspectable | **Partial** | Tasklet and DPU scheduling are inspectable in source code and described in the paper, but not emitted as a schedule trace. |
| Hardware config explicit | **Yes** | The paper describes UPMEM DPU resources and the evaluated system configuration. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Precision / bit-slice assumptions explicit | **Partial / N/A** | Data types are explicit; analog bit-slicing is not applicable to this digital PIM platform. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Cost model inspectable | **Partial** | Phase-level timing, peak references, and energy-estimation sources are described; no standalone cost-model implementation is exposed as an API. ([arXiv](https://arxiv.org/pdf/2201.05072)) |
| Simulator backend documented | **Partial** | The README states that kernels can run on the UPMEM SDK functional simulator, but the simulator is an external dependency. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) |
| Generated code / instruction stream inspectable | **Partial** | Host/DPU C source is available; compiled DPU instruction streams are not presented as an inspectable IR. |
| Provenance from source op to backend action | **Partial** | The SpMV-to-kernel relationship is clear at the operator level, but per-value provenance through transfers, tasklets, and merges is implicit. |
| Reproduction scripts available | **Partial** | Scripts are present, but require path edits, SDK setup, and appropriate hardware or functional simulation. ([GitHub](https://github.com/CMU-SAFARI/SparseP)) |
| Calibration source documented | **Partial** | CPU/GPU measurement tools and UPMEM-provided energy weights are described; the weight source itself is external. ([arXiv](https://arxiv.org/pdf/2201.05072)) |

### 8.3 Integration helper

- **As frontend:** SparseP can be reused as a Matrix Market / SuiteSparse sparse-workload frontend for SpMV experiments. Its frontend is practical rather than compiler-general: reuse would benefit from wrapping matrix parsing and format conversion into a clean importer.
- **As IR inspiration:** The most useful abstractions are sparse format, DPU partition, tasklet schedule, synchronization mode, partial-output ownership, and host–PIM phase.
- **As mapper/scheduler:** The 1D/2D partitioning policies and row/nonzero/block balancing rules could be adapted into a sparse PIM mapper. A future implementation would need to extract legality rules from the hand-written variants.
- **As cost model:** SparseP’s phase-level metrics are valuable backend plugins: input-vector load, PIM kernel time, result retrieval, host merge, tasklet imbalance, and energy-per-access estimates.
- **As backend:** The UPMEM C kernels can serve as a backend library target for a higher-level sparse compiler that chooses among existing variants and emits build/run configurations.
- **As benchmark:** The matrix set, scripts, CPU/GPU comparisons, and data-type variations make SparseP useful as a sparse-PIM benchmark package.
- **As validation source:** Real UPMEM measurements provide calibration data for digital near-bank PIM cost models, especially for host–PIM transfer overhead, DPU scaling, and tasklet-level scheduling.

**Integration effort estimate: High.** Integration would be most direct through a wrapper that selects existing kernels and generates Makefile/script parameters. Deeper compiler integration would require extracting an explicit mapping schema, schedule representation, and provenance model from C code, directory names, and scripts. The most valuable reusable boundary appears to be the sparse-format-plus-partitioning contract, while full end-to-end reuse depends on UPMEM SDK and hardware or functional simulator availability.

## 9. Relation to a value-trajectory CIM IR project

SparseP provides useful ingredients for a value-trajectory IR, especially for **digital sparse PIM trajectories** rather than analog-CIM trajectories. The closest approximation to trajectory semantics is the path:

```text
host sparse matrix / dense vector
→ compressed matrix arrays and input-vector placement
→ DPU MRAM
→ WRAM staging and tasklet-local accumulation
→ DPU output / partial output
→ host retrieval
→ host-side merge, when needed
→ final dense output vector
```

The paper names these phases and shows that they materially affect performance. ([arXiv](https://arxiv.org/pdf/2201.05072)) It preserves value identity at the level of rows, nonzeros, blocks, input-vector indices, and output-vector entries, but not as a serialized value-flow object. For split rows, 2D tiles, or lock-free tasklet accumulation, value identity is preserved through partial-output ownership and merge logic rather than through an explicit trajectory type.

For analog-style value-trajectory questions:

- **Analog partial sums, sensing, digital accumulation, reconstruction:** These are not applicable to the UPMEM digital-PIM substrate. The analogous object is digital partial-output accumulation across tasklets, DPUs, and host merge.
- **Bit significance, channel rate, precision stage, placement, domain transition:** Data type and placement are explicit; bit significance, ADC/DAC stage, and analog/digital domain transition are not applicable. A trajectory-level extension would attach data type, matrix format, row/block identity, DPU bank, MRAM/WRAM location, tasklet owner, and reduction owner to sparse values.
- **Fusing reconstruction with downstream reduction:** In this setting, the relevant rewrite would be fusing host merge with a downstream sparse/dense reduction, not analog reconstruction.
- **Delaying or retiming ADC conversion:** Not applicable to the demonstrated hardware.
- **Carrying bit-sliced partial sums across operator boundaries:** Not applicable as bit-slicing; a digital analogue would carry partial `y` fragments across host/PIM boundaries before final merge.
- **Changing reduction tree structure:** SparseP’s tasklet and host-merge strategies provide a concrete starting point. A trajectory IR would make the reduction tree explicit instead of embedding it in synchronization code.
- **Routing values through alternative peripheral paths:** SparseP motivates this through broadcast/gather recommendations. A trajectory IR would need explicit host–PIM collective operations and memory-bus path metadata.
- **Co-optimizing data movement and numeric reconstruction:** Numeric reconstruction is outside SparseP’s scope, but co-optimizing data movement and sparse partial aggregation is directly relevant.

Overall, SparseP’s demonstrated abstraction centers on sparse layout, mapping, and runtime partial-result management. A value-trajectory extension would likely attach trajectory metadata to sparse matrix entries, input-vector slices, DPU-local partial sums, and host-merged output fragments.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PrIM Benchmark Suite | Real UPMEM PIM benchmarking and programming model. | PrIM is broader across workloads; SparseP is deeper on SpMV formats, partitioning, and sparse scheduling. | Use SparseP as the sparse-linear-algebra specialist entry within the UPMEM benchmark family. |
| CUT / UPMEM characterization work | Real-system characterization of UPMEM DPUs, memory hierarchy, and scaling behavior. | Characterization work explains platform behavior; SparseP translates those constraints into a concrete sparse-kernel design space. | Separate platform characterization papers from workload-specific backend libraries, while linking their hardware assumptions. |
| Xie et al. HMC-style PIM SpMV | SpMV acceleration near memory and sparse matrix mapping. | The cited HMC work is a PIM hardware design direction; SparseP is a real UPMEM software library and measurement study. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Distinguish hardware-proposal sparse PIM from programmable real-hardware sparse PIM. |
| Sun et al. inter-DIMM broadcast/gather support | Communication support for PIM systems with irregular access and collective movement. | SparseP empirically shows host–PIM load/retrieve/merge pressure in SpMV; broadcast/gather work proposes architectural support for such movement. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Treat host–PIM collectives as compiler-visible operations for sparse CIM/PIM stacks. |
| Fujiki et al. sparse format transformation near memory | Sparse format and memory-controller/PIM cooperation. | Fujiki-style work focuses on transforming CSR to DCSR in a GPU memory-controller context; SparseP evaluates multiple sparse formats and schedules on UPMEM DPUs. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Sparse format conversion and sparse schedule selection should be separate corpus tags. |
| Commodity SpMV libraries and format-selection methods | Sparse layout, load balance, and performance tuning. | Commodity CPU/GPU methods assume different cache, communication, and thread models; SparseP adapts the format/schedule problem to distributed PIM memory and shallow local storage. ([arXiv](https://arxiv.org/pdf/2201.05072)) | Include commodity sparse-library lineage, but classify SparseP by its PIM backend contract rather than by performance ranking alone. |

## 11. Corpus-ready final takeaway

- SparseP’s real contribution is a public UPMEM SpMV library and real-system evaluation, centered on 25 hand-written sparse kernels rather than a general compiler IR.
- Its strongest reusable stack layer is the sparse PIM backend contract: sparse format, DPU partition, tasklet schedule, synchronization, host transfer, and partial-result merge.
- The evidenced scope is SpMV on UPMEM near-bank digital PIM, evaluated across CSR/COO/BCSR/BCOO, multiple data types, 1D/2D partitioning, and CPU/GPU baselines.
- The first-class objects are UPMEM DPUs, MRAM/WRAM/IRAM, tasklets, sparse arrays, partitions, partial outputs, synchronization modes, data types, and host–PIM phases.
- The hidden IR lives in the combination of kernel-directory names, Makefile flags, run scripts, host partitioning code, DPU memory layout, and synchronization implementation.
- Artifact status: public artifact found; the repository is MIT-licensed and includes kernels, scripts, inputs, and build instructions, while exact figure reproduction depends on external SDK/hardware and implicit workflow details.
- For integration, SparseP is most useful as a benchmark, backend library, mapping-rule source, and calibration point for digital near-bank PIM cost models.
- For a value-trajectory IR, SparseP is most relevant to digital sparse value placement, partial-output ownership, and host/PIM reduction trajectories; analog objects such as ADC/DAC, bit slicing, and reconstruction are not applicable.

## 12. Suggested metadata entry

```yaml
paper: "SparseP: Towards Efficient Sparse Matrix Vector Multiplication on Real Processing-In-Memory Systems"
year: 2022
venue: "Proceedings of the ACM on Measurement and Analysis of Computing Systems (POMACS), Vol. 6, No. 1, Article 21; SIGMETRICS/PERFORMANCE 2022 companion presentation"
authors_or_group: "Christina Giannoula, Ivan Fernandez, Juan Gómez-Luna, Nectarios Koziris, Georgios Goumas, Onur Mutlu"
technology:
  - UPMEM
  - DRAM-PIM
  - digital-CIM
  - near-bank-PIM
workloads:
  - SpMV
  - sparse linear algebra
  - SuiteSparse matrices
axis_A:
  primary: A6
  secondary:
    - A5
    - A3
axis_B:
  - B1 Config-as-IR
  - B3 Loop / tensor-schedule IR
  - B4 Hardware-resource IR
  - B7 Runtime-state abstraction
axis_C_first_class_objects:
  - UPMEM DPU
  - DRAM bank / MRAM
  - WRAM / IRAM
  - tasklet
  - CSR / COO / BCSR / BCOO sparse arrays
  - 1D / 2D matrix partition
  - host-PIM load / retrieve / merge phase
  - synchronization primitive
  - partial output
  - data type
axis_D_rewrite_objects:
  - sparse memory layout
  - PIM-core mapping
  - tasklet load balance
  - synchronization mode
  - host-PIM transfer schedule
  - runtime partial-result state
artifact:
  status: public artifact found
  url: "https://github.com/CMU-SAFARI/SparseP"
  license: MIT
  last_checked: 2026-05-15
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: medium
trajectory_IR_relevance: medium
notes:
  - "Strongest reusable boundary is sparse-format, partitioning, and tasklet scheduling for UPMEM-style digital PIM."
  - "No standalone compiler IR; semantics are distributed across code directories, Makefile flags, scripts, host partitioning, and DPU kernels."
  - "Most relevant to value-trajectory IR work as a digital sparse placement and partial-result ownership case study."
```