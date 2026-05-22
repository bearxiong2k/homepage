---
slug: prim
title: "PrIM / Benchmarking a New Paradigm: Experimental Analysis and Characterization of a Real Processing-in-Memory System"
subtitle: "Scoped CIM stack note"
year: 2022
venue: "IEEE Access"
authors_or_group: "Juan Gómez-Luna, Izzat El Hajj, Ivan Fernandez, Christina Giannoula, Geraldo F. Oliveira, Onur Mutlu"
summary: >-
  PrIM is best classified as a real-hardware benchmark and characterization framework for the UPMEM digital DRAM-PIM architecture rather than as an explicit compiler/IR stack. Its main contribution is a public suite of 16 manually ported memory-bound workloads, accompanying microbenchmarks, CPU/GPU baselines, and a measurement methodology for understanding DPU compute throughput, MRAM/WRAM bandwidth, host-DPU transfer behavior, scaling, and energy on 640-DPU and 2,556-DPU UPMEM systems. The reusable stack layer is clearest at the benchmark/reproducibility boundary: host code, DPU kernels, Makefile parameters, run scripts, datasets, and profiling outputs. For CIM compiler/IR research, PrIM is useful as a concrete backend contract for digital DRAM-PIM: it shows which objects a future IR would need to name to target UPMEM-like systems, especially DPU allocation, tasklet count, MRAM/WRAM staging, transfer direction, inter-DPU communication through the host, and workload partitioning. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))
links:
  paper: https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf
  artifact: https://github.com/CMU-SAFARI/prim-benchmarks
  docs:
  code:
technology:
  - "DRAM-PIM"
  - "UPMEM"
  - "digital-CIM"
  - "digital-PIM"
workloads:
  - "Vector Addition"
  - "GEMV"
  - "SpMV"
  - "Select"
  - "Unique"
  - "Binary Search"
  - "Time Series Analysis"
  - "BFS"
  - "MLP"
  - "Needleman-Wunsch"
  - "Image Histogram"
  - "Reduction"
  - "Prefix Sum"
  - "Matrix Transposition"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A2, A3]
axis_B: [B1, B4, B7, B5]
axis_C_first_class_objects:
  - "DPU"
  - "tasklet"
  - "MRAM_bank"
  - "WRAM"
  - "IRAM"
  - "DMA_transfer"
  - "CPU_DPU_transfer"
  - "DPU_CPU_transfer"
  - "host_merge"
  - "synchronization_primitive"
  - "datatype"
  - "block_size"
axis_D_rewrite_objects:
  - "manual_loop_partitioning"
  - "data_chunk_mapping"
  - "tasklet_block_assignment"
  - "memory_staging"
  - "synchronization_structure"
  - "implementation_variant_selection"
  - "runtime_phase_measurement"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/CMU-SAFARI/prim-benchmarks"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "benchmark"
  - "validation"
  - "cost_model"
  - "backend"
  - "IR_inspiration"
reproducibility_level: medium
notes:
  - "Best treated as a real-hardware UPMEM benchmark and characterization artifact, not an explicit compiler IR stack."
  - "Most reusable IR lessons concern digital value placement, host-DPU transfer phases, DPU/tasklet mapping, and synchronization provenance."
  - "Analog CIM objects such as ADC/DAC, crossbar bit-slicing, and reconstruction paths are not applicable to the demonstrated hardware."
takeaways: []
---

# PrIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 — Programming / runtime / benchmark on real hardware** | PrIM is presented as an open benchmark suite plus an experimental characterization of the UPMEM digital DRAM-PIM architecture. The paper evaluates microbenchmarks and 16 workloads on 640-DPU and 2,556-DPU real systems, with CPU/GPU comparisons. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Secondary stack role, Axis A | **A2 — Simulator & cost-model-adjacent characterization**; limited **A3-like manual mapping patterns** | The paper provides measured latency/bandwidth/throughput models and programming recommendations, but the mapping is encoded as manually written benchmark implementations rather than a reusable search/DSE compiler. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B4 Hardware-resource IR**, **B7 Runtime-state abstraction** | The reusable “middle” state is mostly Makefile/CLI parameters such as `NR_DPUS`, `NR_TASKLETS`, block length, type, and energy mode, plus UPMEM resources such as DPU, tasklet, MRAM, WRAM, transfer direction, and host synchronization. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks/blob/main/VA/Makefile)) |
| First-class CIM objects, Axis C | DPU set, DPU, tasklet, MRAM bank, WRAM scratchpad, IRAM, DMA transfer, CPU-DPU/DPU-CPU transfer, host merge/synchronization, data chunk, benchmark input size, block size, datatype | These objects are named directly in the paper and artifact. Analog CIM objects such as ADC/DAC, crossbar bit slicing, and analog reconstruction are not applicable to this fully digital DRAM-PIM target. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Rewrite object, Axis D | **Manual loop/data mapping + memory-layout/runtime-state rewrite** | The work rewrites workloads by hand into host code plus DPU kernels: partitioning data across DPUs, assigning blocks to tasklets, staging data through MRAM/WRAM, selecting synchronization patterns, and measuring CPU-DPU/DPU/DPU-CPU phases. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Best corpus tags | `benchmark-suite`, `real-hardware`, `UPMEM`, `DRAM-PIM`, `digital-PIM`, `microbenchmark`, `host-DPU-runtime`, `manual-porting`, `CPU-GPU-baselines`, `reproducibility-harness` | These tags reflect the demonstrated artifact boundary: workloads, microbenchmarks, scripts, host/DPU code, and hardware measurements. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) |
| Closest comparison baselines | **uPIMulator**, **PIMeval/PIMbench**, **A Full-System Perspective on UPMEM Performance**, **UPMEM SDK-based application studies** | These are close because they either simulate UPMEM/PrIM, generalize PIM benchmarking/modeling, or revisit PrIM-style real-system measurement with fuller offload accounting. ([GitHub](https://github.com/VIA-Research/uPIMulator?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

PrIM is best classified as a real-hardware benchmark and characterization framework for the UPMEM digital DRAM-PIM architecture rather than as an explicit compiler/IR stack. Its main contribution is a public suite of 16 manually ported memory-bound workloads, accompanying microbenchmarks, CPU/GPU baselines, and a measurement methodology for understanding DPU compute throughput, MRAM/WRAM bandwidth, host-DPU transfer behavior, scaling, and energy on 640-DPU and 2,556-DPU UPMEM systems. The reusable stack layer is clearest at the benchmark/reproducibility boundary: host code, DPU kernels, Makefile parameters, run scripts, datasets, and profiling outputs. For CIM compiler/IR research, PrIM is useful as a concrete backend contract for digital DRAM-PIM: it shows which objects a future IR would need to name to target UPMEM-like systems, especially DPU allocation, tasklet count, MRAM/WRAM staging, transfer direction, inter-DPU communication through the host, and workload partitioning. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “First comprehensive characterization and analysis” of the first publicly available real-world PIM architecture | Abstract / Introduction / Section 3 | Experiment + equations | Microbenchmarks characterize DPU arithmetic throughput, WRAM bandwidth, MRAM-WRAM DMA latency/bandwidth, operational intensity effects, and host-MRAM transfer bandwidth. The MRAM model is explicitly given as latency = α + β × transfer size, with bandwidth derived from transfer size, frequency, and latency. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | Demonstrated for the UPMEM architecture and the two UPMEM systems described in Table 1; it is empirical hardware characterization, not a portable analytical model for arbitrary CIM/PIM technologies. |
| “PrIM, a benchmark suite of 16 workloads from different application domains” | Abstract / Section 4 / Table 2 | Paper + artifact | Table 2 lists 16 workload variants across dense/sparse linear algebra, databases, analytics, graph processing, neural networks, bioinformatics, image processing, and parallel primitives. The repository exposes corresponding benchmark directories plus CPU/GPU baseline folders. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | Demonstrated as manually written UPMEM C host/DPU programs, not as a compiler frontend that ingests arbitrary application graphs. |
| Benchmarks are memory-bound and suitable candidates for PIM | Section 4 / Figure 11 | Experiment | The authors use a roofline model on CPU versions and report that the CPU versions of the workloads lie in the memory-bounded region. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | The roofline evidence is for the CPU versions and the datasets used in the study; suitability on UPMEM is further qualified by compute complexity and synchronization overhead. |
| UPMEM performance depends strongly on streaming access, low inter-DPU synchronization, and simple arithmetic | Section 5.2 / Section 6 | Experiment | Figure 16 and the key takeaways identify benchmarks where the 2,556-DPU system outperforms the GPU, and attribute suitability to streaming accesses, little/no inter-DPU communication, and limited multiplication/division/floating-point use. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | Demonstrated for the selected workloads and baselines; the paper’s comparison intentionally uses all DPUs in the full systems rather than searching for each workload’s best DPU count. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| The suite is publicly and freely available | Introduction / Section 4 / repository README | Code/artifact + documentation | The GitHub repository contains benchmark folders, microbenchmark folders, CPU/GPU baselines, Makefiles, run scripts, README instructions, and an MIT license. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) | Artifact-level reuse is clearest for reproducing or adapting UPMEM benchmark programs. Reuse as a compiler/IR corpus requires an additional extractor or schema to expose mapping decisions from C code, Makefiles, and scripts. |
| General programming recommendations for UPMEM software | Section 2.3.2 / Section 6 | Paper + experiment | The paper states recommendations such as executing long DPU regions, splitting work into independent data blocks, using many DPUs when enough work exists, and launching at least 11 tasklets per DPU; later experiments validate or qualify these recommendations. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | Demonstrated for UPMEM’s DPU/tasklet/MRAM/WRAM execution model. These recommendations are most reusable as backend constraints or scheduling heuristics for UPMEM-like digital PIM targets. |
| Alternative implementations expose workload/hardware tradeoffs | Section 4 and Appendix references | Experiment + code | The paper describes two histogram versions, two scan versions, and three reduction versions, selected or compared according to synchronization and MRAM access costs. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) | Evidence supports implementation-level design choices. A compiler-level legality or cost search over these alternatives is not exposed as a standalone pass in the checked artifact. |

## 4. Stack anatomy

```text
Input / frontend:
  Object: benchmark-specific input arrays, matrices, graphs, images, time series, sequences, and CLI parameters.
  Form: C/C++/CUDA benchmark programs plus input files and generated random data.
  Inspectability: documented per benchmark through README examples, command-line help, code, and scripts; no common declarative workload schema found in the checked sources.

Middle representation:
  Object: host C code + DPU C kernel + Makefile/CLI configuration.
  Form: source code and build-time macros such as NR_DPUS, NR_TASKLETS, BL, TYPE, ENERGY.
  Inspectability: serialized as source files and Makefiles; reusable as examples, but not a single graph/tensor/hardware IR.

Mapping or scheduling state:
  Object: DPU count, tasklet count, block length, per-DPU chunk assignment, per-tasklet block assignment, synchronization primitive, and transfer size.
  Form: manual code structure, macros, command-line parameters, and run-script dictionaries.
  Inspectability: partially inspectable in source and scripts; mapping provenance is embedded in each benchmark implementation.

Hardware abstraction:
  Object: UPMEM host CPU + DPU set + DPU + tasklet + MRAM bank + WRAM + IRAM + DMA transfer + CPU-DPU/DPU-CPU transfer.
  Form: UPMEM SDK runtime API and DPU C programming model.
  Inspectability: named explicitly in the paper and code; backend behavior depends on UPMEM SDK and hardware/functional simulator.

Backend / simulator / codegen:
  Object: UPMEM host executable and DPU binary.
  Form: compiled by host compiler and `dpu-upmem-dpurte-clang`; can run on real UPMEM modules or the UPMEM SDK functional simulator.
  Inspectability: generated binaries and DPU logs/profiles are inspectable at runtime; no compiler pass pipeline or machine-code IR schema is exposed by PrIM itself.

Output artifact:
  Object: timing breakdowns, energy measurement when enabled, correctness checks, profile logs, and benchmark outputs.
  Form: printed timing categories and files under benchmark `profile` directories.
  Inspectability: partially inspectable; scripts save outputs, but paper-figure notebooks or full raw result provenance were not found in the checked repository documentation.

Evaluation loop:
  Object: compile-run-measure loops over benchmark, DPU count, tasklet count, block length, and input size.
  Form: `run_weak.py`, `run_strong_rank.py`, `run_strong_full.py`, per-benchmark Makefiles, and microbenchmark `run.sh` scripts.
  Inspectability: documented and reusable, subject to UPMEM SDK/hardware or simulator availability.
```

The repository README states that each benchmark has similar subdirectories for baselines, data, DPU code, host code, support code, and Makefile; it also documents weak/strong scaling scripts and microbenchmark scripts. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) The VA example illustrates the effective stack boundary: the host allocates DPUs, loads a DPU binary, calculates per-DPU sizes, transfers arguments and arrays, launches synchronously, times phases, retrieves results, and verifies against a CPU computation. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks/blob/main/VA/host/app.c))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of benchmark C code, DPU kernel code, Makefile macros, run-script parameters, UPMEM runtime calls, and profile output categories. The paper foregrounds workload characterization and real-hardware methodology, while the reusable semantics are most visible in per-benchmark partitioning rules, MRAM/WRAM staging loops, tasklet synchronization choices, and host-mediated inter-DPU communication patterns. A future compiler/IR stack could make this hidden state explicit by serializing per-value placement, transfer direction, DPU/tasklet binding, block size, synchronization event, and host merge/reduction step.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 — Programming / runtime / benchmark on real hardware.**  
PrIM’s owned slice is the benchmark-and-measurement layer for a real UPMEM backend. The input is a suite of manually written workload implementations and parameterized runs; the output is performance, scaling, energy, and correctness evidence on real UPMEM systems and CPU/GPU baselines. The paper’s strongest evidence is empirical: microbenchmarks, roofline analysis, strong/weak scaling, and full-system comparisons. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

**Secondary: A2 — Simulator & cost-model-adjacent characterization.**  
The paper provides backend characterization useful for cost modeling, especially DPU arithmetic throughput, MRAM/WRAM bandwidth, transfer-size sensitivity, and host-DPU transfer behavior. However, the reusable object is a set of measured curves, equations, and recommendations, rather than a packaged simulator or compiler cost-model API. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

**A3-like but manual: mapping / scheduling patterns.**  
Several workloads include explicit partitioning and synchronization strategies: vector addition linearly assigns chunks to DPUs and blocks to tasklets; GEMV partitions rows and replicates the vector; scan and histogram expose alternative implementations. These are valuable mapping exemplars, but the mapping procedure is encoded in hand-written programs rather than exposed as a general search framework. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is not called an IR, but many backend decisions are surfaced as build and run parameters: `NR_DPUS`, `NR_TASKLETS`, `BL`, `TYPE`, and `ENERGY` in Makefiles, plus workload-specific command strings in the scaling scripts. These decide the number of DPUs, tasklets, block sizes, datatype variants, and measurement mode. Decisions that remain embedded include per-operator data partitioning, exact MRAM layout, synchronization structure, and host aggregation code. There is no single artifact that an upstream compiler could read, verify, and rewrite without parsing code and scripts. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks/blob/main/VA/Makefile))

**B4 — Hardware-resource IR.**  
The paper and artifact make UPMEM resources explicit: DPUs, tasklets, MRAM, WRAM, IRAM, DMA, DPU sets, and CPU-DPU/DPU-CPU transfers. Decisions made at this level include how data is chunked across DPUs, how blocks are assigned to tasklets, when data is staged through WRAM, and when the host performs merging or synchronization. The resource model is clear enough to guide a backend contract, but it is represented through UPMEM APIs and code templates rather than a standalone resource graph. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

**B7 — Runtime-state abstraction.**  
The work repeatedly exposes runtime states: host-side DPU allocation, argument transfer, kernel launch, DPU execution, inter-DPU synchronization through the host, result retrieval, and timing categories. These states are visible in both the paper’s performance breakdowns and the host code timers. The state machine is useful for an IR project because it identifies boundaries where provenance and synchronization should be preserved, though the artifact does not serialize this as a formal runtime-state IR. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

**Partial B5 — instruction/backend visibility.**  
The paper shows compiled UPMEM DPU ISA for a microbenchmark, and the repository builds DPU binaries with UPMEM’s DPU compiler. This provides backend evidence, but PrIM does not expose instruction selection or instruction-stream rewriting as its corpus object. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** | UPMEM is modeled as digital DRAM-PIM with general-purpose DPU cores near DRAM banks, not analog crossbars. The named hierarchy is host CPU, PIM chip, DPU, MRAM bank, WRAM, IRAM, and DMA engine. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Bit-slicing / bit significance | **Not applicable / datatype parameter** | The benchmark table lists software datatypes such as `int32_t`, `uint32_t`, `float`, and `int64_t`; bit-sliced analog CIM representation is not part of the demonstrated target. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| ADC/DAC precision or sensing | **Not applicable** | The target is fully digital DRAM-PIM with DPU cores; no ADC/DAC sensing path is part of the paper’s hardware abstraction. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Analog-to-digital or domain transition | **Not applicable** | The key domain transitions are host memory ↔ MRAM and MRAM ↔ WRAM, not analog ↔ digital conversion. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Peripheral circuits as path nodes | **Implicit / hardware resource** | DMA engine, DDR4 interface, control/status interface, WRAM, IRAM, and MRAM are named in the architecture, but peripheral circuits are not independently rewritable path nodes. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Partial-sum accumulation path | **First-class in workload code, not CIM-specific analog path** | Reduction, GEMV, MLP, histogram, and scan expose local reductions or accumulations across tasklets/DPUs, with host-side merging for some workloads. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Reconstruction / shift-add tree | **Not applicable** | There is no analog bit-slice reconstruction path. Digital reductions and prefix sums are represented as software implementations. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime state: partial first-class; sparsity: workload-level** | Runtime state includes DPU allocation, tasklet count, barriers, handshakes, mutexes, transfers, and host merges. Sparsity appears in SpMV and BFS data structures; KV cache and batching are not part of the demonstrated workload set. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Value trajectory / flow path | **Approximated through explicit memory movement** | The closest trajectory representation is movement from host memory to MRAM, MRAM to WRAM, tasklet-local computation, WRAM/MRAM writeback, and host retrieval/merge. This is visible in the VA paper description and DPU code. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |

### 5.4 Axis D — rewrite object

The tool rewrites **program structure manually**, not through a compiler IR pass. The rewrite objects are:

- operator/workload implementation choices, such as HST-S vs HST-L, SCAN-SSA vs SCAN-RSS, and RED variants;
- loop/data partitioning across DPUs and tasklets;
- memory layout and staging between host memory, MRAM, and WRAM;
- runtime synchronization patterns: barrier, handshake, mutex, and host-mediated inter-DPU merge;
- datatype/build configuration and block size;
- generated host/DPU binaries through the UPMEM compiler toolchain.

Legal transformations in the demonstrated framework are those the programmer encodes as alternative C implementations or build configurations. The equivalences exploited include independent data-parallel chunks, local accumulation before host merge, alternative prefix-sum decompositions, and different intra-DPU synchronization strategies. Information that must be preserved across lowering includes input partition boundaries, per-DPU data ownership, tasklet block assignment, transfer size and alignment, datatype, synchronization ordering, and final host reconstruction/merge semantics. The representation is especially well suited to empirical comparison of UPMEM implementation strategies; expressing automatic graph-level fusion, cross-kernel value placement, or verified retiming of host/DPU transfers would likely require an additional abstraction for value location, ownership, and synchronization provenance.

## 6. Technical mechanism reading

### 6.1 Hardware abstraction: UPMEM as a digital DRAM-PIM backend

The paper’s target is the UPMEM architecture: a host CPU with conventional DRAM plus PIM-enabled DIMMs whose DRAM chips integrate DPUs. Each DPU is a multithreaded in-order 32-bit RISC core with 24 hardware threads, 24 KB IRAM, 64 KB WRAM scratchpad, and access to a 64 MB MRAM bank. The DPU can use DMA instructions to move instructions from MRAM to IRAM and data between MRAM and WRAM. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

The paper’s two real systems are a 2,556-DPU system and a 640-DPU system. Table 1 reports, among other details, that the newer system uses 20 UPMEM DIMMs, 128 DPUs per DIMM, 350 MHz DPUs, and 159.75 GB of total DPU memory, while the older 640-DPU system uses 10 DIMMs, 64 DPUs per DIMM, 267 MHz DPUs, and 40 GB of DPU memory. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 6.2 Programming model and backend contract

UPMEM uses an SPMD programming model: software threads called tasklets execute the same code on different data, with up to 24 tasklets per DPU. Tasklets within a DPU share MRAM/WRAM and can synchronize using mutexes, barriers, handshakes, and semaphores; tasklets on different DPUs do not share memory or communicate directly, so inter-DPU coordination is mediated by the host CPU. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

The backend contract has several important compiler implications. DPU kernels should run long enough to amortize host interaction; work should be split into independent data blocks; many DPUs should be used when there is enough work; and at least 11 tasklets are recommended to utilize the DPU pipeline. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) Data layout is also part of the implicit backend contract: PIM-enabled memory maps entire 64-bit words to the same MRAM bank, and the UPMEM SDK uses a transposition library during host-MRAM transfers. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 6.3 Microbenchmark characterization as a cost-model seed

The paper characterizes DPU arithmetic throughput and WRAM bandwidth using streaming microbenchmarks, including COPY, ADD, SCALE, and TRIAD. It also studies arithmetic operations across datatypes and reports that throughput saturates after about 11 tasklets, matching the pipeline utilization argument. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

For MRAM-WRAM transfers, the paper introduces a linear latency model:

`MRAM latency in cycles = α + β × transfer_size`

and derives bandwidth as:

`MRAM bandwidth = transfer_size × DPU_frequency / MRAM_latency`.

Measurements report α around 77 cycles for `mram_read`, around 61 cycles for `mram_write`, and β = 0.5 cycles/byte for both. This is one of the most reusable cost-model ingredients in the paper, because it identifies transfer size as a scheduling-relevant parameter. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 6.4 Workload porting mechanism

PrIM’s main workload mechanism is manual host/DPU decomposition. Vector addition is representative: the implementation divides vectors into as many chunks as DPUs, assigns chunk `i` to DPU `i`, assigns blocks to tasklets cyclically, moves blocks from MRAM to WRAM, performs the operation, writes results back to MRAM, and finally retrieves chunks to host memory. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

Other workloads expose more complex mapping contracts. GEMV partitions matrix rows across DPUs and replicates the input vector. SEL uses handshakes among tasklets to compute local output positions and then relies on the host CPU for final merging because DPUs may return different numbers of filtered elements. BFS distributes vertices across DPUs and uses host merging of per-DPU visited bit-vectors at each iteration. MLP runs each layer as GEMV-like computation and returns intermediate vectors to the host before feeding the next layer. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

### 6.5 Evaluation methodology

The evaluation uses datasets that exceed WRAM capacity, requiring repeated MRAM-WRAM DMA transfers. The paper reports that the authors include best-performing transfer sizes in Table 3 and provide command lines and parameters in the artifact. Strong scaling is evaluated on 1 DPU, 1 rank from 1 to 64 DPUs, and 32 ranks from 256 to 2,048 DPUs; weak scaling is evaluated on 1 rank from 1 to 64 DPUs. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

The CPU/GPU comparison uses two full UPMEM systems, an Intel Xeon CPU, and an NVIDIA Titan V GPU. The paper includes DPU time and inter-DPU synchronization time for UPMEM measurements; energy is measured for the 640-DPU system and GPU/CPU baselines, while the 2,556-DPU system did not support energy measurements at the time. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The benchmark implementation is a de facto backend contract

- **Observation:** The reusable interface is clearest in the host/DPU C boundary: DPU allocation, binary loading, argument transfer, MRAM input layout, kernel launch, DPU execution, result retrieval, and correctness checking.
- **Why it matters for CIM compiler/IR work:** A compiler targeting UPMEM-like digital PIM needs to preserve these phases explicitly, because each phase has different costs and synchronization behavior.
- **Reusable lesson:** Treat host-DPU transfer, DPU-local execution, and host merge as typed runtime events in a future IR, rather than leaving them as opaque runtime calls.

### Insight 2 — Transfer size is a scheduling parameter, not only a runtime detail

- **Observation:** The MRAM latency/bandwidth model exposes fixed and variable transfer costs, making DMA transfer size central to performance. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))
- **Why it matters for CIM compiler/IR work:** An IR that represents memory movement only as “load” and “store” would miss an important scheduling knob: grouping values into transfer blocks that amortize fixed DMA overhead.
- **Reusable lesson:** Add transfer granularity and alignment metadata to value-placement or memory-movement IR nodes.

### Insight 3 — Inter-DPU communication is a host-mediated semantic boundary

- **Observation:** The paper repeatedly shows that DPUs lack direct inter-DPU communication, so global merge, scan, BFS frontier/visited-state consolidation, and layer-to-layer MLP movement are handled through the host. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))
- **Why it matters for CIM compiler/IR work:** This makes host mediation a correctness boundary, not just a performance penalty. A compiler must know when values leave DPU-local ownership and become global host state.
- **Reusable lesson:** Represent host-mediated barriers, reductions, and redistributions as explicit IR events with provenance from local DPU values to global state.

### Insight 4 — Alternative benchmark versions are small rewrite spaces

- **Observation:** HST-S/HST-L, SCAN-SSA/SCAN-RSS, and RED variants encode alternative legal implementations with different synchronization and memory-access tradeoffs. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf))
- **Why it matters for CIM compiler/IR work:** These variants are a compact example of what an automatic rewrite system could search: same high-level semantics, different placement of reductions, scans, barriers, and MRAM traffic.
- **Reusable lesson:** Future corpus entries could extract these alternatives as rewrite pairs: “semantic operator → UPMEM implementation template + legality/cost conditions.”

### Insight 5 — The artifact’s timing categories suggest an audit schema

- **Observation:** The host code separates CPU time, CPU-DPU transfer, DPU kernel time, and DPU-CPU transfer; the paper similarly breaks down DPU, inter-DPU, CPU-DPU, and DPU-CPU costs in scaling plots. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks/blob/main/VA/host/app.c))
- **Why it matters for CIM compiler/IR work:** These categories provide a natural audit trail from source-level partitioning to measured backend events.
- **Reusable lesson:** A reproducibility harness should log each lowered value’s contribution to transfer, execution, synchronization, and reconstruction/merge phases.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL/identifier:** GitHub repository `CMU-SAFARI/prim-benchmarks`. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks))
- **License:** MIT License. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** 16 PrIM benchmark directories, CPU/GPU baselines, DPU code, host code, data/support folders, Makefiles, eight microbenchmark groups, and weak/strong scaling scripts. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks))
- **What the artifact appears to omit:** A single serialized IR, a compiler pass pipeline, a declarative mapping schema, paper-figure notebooks, and an architecture-independent backend interface were not found in the checked README/source evidence.
- **Minimal documented workflow:** Install the UPMEM SDK; clone the repository; run a scaling script such as `python3 run_weak.py BFS`; or compile a benchmark with parameters such as `NR_DPUS=32 NR_TASKLETS=16 make all` and run the produced host binary. Microbenchmarks provide per-folder `run.sh` scripts. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks))
- **Whether paper figures appear reproducible from the artifact:** **Partial.** The repository documents scripts for weak/strong scaling and microbenchmarks used in the paper, but full reproduction of all figures depends on UPMEM hardware or the UPMEM SDK simulator, input paths for some workloads, baseline environments, and result post-processing that is not exposed as a complete figure-generation workflow in the checked README. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Per-benchmark CLI and data folders exist; several workloads have explicit file/input parameters. A unified schema was not found. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) |
| Intermediate representation serialized | Unknown | Source code, Makefile macros, and scripts are serialized; a named IR is not found in the checked sources. |
| Mapping decisions inspectable | Partial | DPU/tasklet partitioning is visible in paper descriptions and source code, but not extracted as a machine-readable mapping record. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Schedule inspectable | Partial | Loop/block schedules are visible in DPU C kernels and scripts; no schedule IR is exposed. |
| Hardware config explicit | Yes | DPU counts, tasklets, MRAM/WRAM/IRAM capacities, system sizes, and frequencies are stated in paper and build parameters. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Precision / bit-slice assumptions explicit | N/A / Partial | Software datatypes are explicit; analog bit-slicing is not applicable. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Cost model inspectable | Partial | MRAM latency/bandwidth equations and measured curves are in the paper; no standalone cost-model API was found. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Simulator backend documented | Partial | README states benchmarks run on real UPMEM modules and on the UPMEM SDK functional simulator; PrIM itself does not package a simulator. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) |
| Generated code / instruction stream inspectable | Partial | DPU binaries are generated; the paper shows an ISA listing for a microbenchmark. A compiler IR or generated instruction dump workflow was not found in PrIM documentation. ([cgiannoula.github.io](https://cgiannoula.github.io/assets/publications/Prim_Access22_arxiv.pdf)) |
| Provenance from source op to backend action | Partial | Present in code structure and timing categories, but not serialized as a provenance graph. |
| Reproduction scripts available | Yes | `run_weak.py`, `run_strong_rank.py`, `run_strong_full.py`, and microbenchmark `run.sh` scripts are documented. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) |
| Calibration source documented | Partial | Hardware measurements are described in the paper; full raw calibration data and plotting workflow were not found in checked sources. |

### 8.3 Integration helper

- **As frontend:** PrIM is most reusable as a workload corpus rather than as a parser/importer. Its “frontend” is a set of benchmark-specific C/C++/CUDA programs and input files.
- **As IR inspiration:** The most useful abstractions to borrow are DPU set, DPU-local memory, WRAM staging buffer, tasklet block assignment, transfer event, host merge, synchronization primitive, and profile phase.
- **As mapper/scheduler:** Mapping logic can be adapted from per-benchmark implementations: linear chunk-to-DPU mapping, cyclic block-to-tasklet mapping, replicated vectors, host-mediated global reductions, and alternative scan/histogram/reduction strategies.
- **As cost model:** The MRAM latency/bandwidth equations, tasklet-saturation observations, host-DPU transfer measurements, and synchronization breakdowns can seed backend plugins for UPMEM-like targets.
- **As backend:** The UPMEM SDK interface could be wrapped by a compiler backend that emits host code and DPU kernels, but PrIM itself is a benchmark suite rather than a code generator.
- **As benchmark:** This is the clearest integration role: workloads, microbenchmarks, CPU/GPU baselines, datasets, and scaling scripts are directly reusable subject to SDK/hardware availability.
- **As validation source:** The paper’s real-system measurements on 640-DPU and 2,556-DPU systems provide calibration targets for simulators and compiler cost models.

**Integration effort estimate: Medium.** Integration as a benchmark harness is relatively direct because the repository already contains runnable UPMEM programs and scripts. Integration as a compiler/IR backend would require adapters that extract implicit mapping state from C/Makefile/script boundaries and re-express it as a declarative target contract. The most valuable reusable boundary appears to be the phase-structured execution model: host input preparation → CPU-DPU transfer → DPU-local execution → synchronization/merge → DPU-CPU transfer → verification/profile.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **uPIMulator** | UPMEM execution, PrIM workloads, backend characterization | uPIMulator is an ISA-compatible simulator that reports support for enough UPMEM instructions to functionally simulate the PrIM benchmark suite; PrIM is the real-hardware benchmark and measurement source. ([GitHub](https://github.com/VIA-Research/uPIMulator?utm_source=chatgpt.com)) | Pair PrIM with uPIMulator when distinguishing real-hardware validation from simulator-backed backend exploration. |
| **PIMeval / PIMbench** | PIM benchmarking and modeling for digital DRAM-PIM | PIMeval/PIMbench targets broader PIM architecture modeling and supports subarray-level bit-serial, bit-parallel, bank-level designs, and multiple data layouts; PrIM is centered on UPMEM hardware. ([GitHub](https://github.com/UVA-LavaLab/PIMeval-PIMbench?utm_source=chatgpt.com)) | Use PrIM as the UPMEM-real-system anchor and PIMeval/PIMbench as a portability/modeling contrast. |
| **A Full-System Perspective on UPMEM Performance** | UPMEM benchmarking, offload costs, PrIM-style workloads | This later work builds on PrIM and focuses on full-system offloading considerations and benchmark methodology refinements. ([ess.cs.uos.de](https://ess.cs.uos.de/static/papers/Friesel-2023-DIMES.pdf?utm_source=chatgpt.com)) | Corpus notes should separate DPU-kernel speedups from full-system transfer, scheduling, and offload accounting. |
| **UPMEM SDK programming examples / SDK functional simulator** | Same runtime and backend toolchain | The SDK is the programming/runtime substrate; PrIM supplies workload breadth, baselines, and characterization methodology on top of it. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks)) | Treat SDK calls as the backend ABI that a future IR/codegen layer would target. |
| **PrIM-derived architecture studies using uPIMulator** | Use PrIM workloads to study architectural bottlenecks | These works use PrIM as a workload driver while moving the main research object to architectural simulation or proposed microarchitectural changes. ([arXiv](https://arxiv.org/html/2308.00846v3?utm_source=chatgpt.com)) | Corpus classification should distinguish benchmark artifact, simulator artifact, and architecture proposal even when they share workloads. |

## 10. Corpus-ready final takeaway

- PrIM’s real contribution is an open UPMEM DRAM-PIM benchmark and characterization suite with microbenchmarks, 16 workload variants, CPU/GPU baselines, and real-system measurements.
- The strongest reusable stack layer is the reproducibility/backend-validation layer: host/DPU code, Makefiles, run scripts, datasets, and phase-level timing.
- The evidenced scope is UPMEM digital DRAM-PIM on 640-DPU and 2,556-DPU systems, with benchmarking also documented for the UPMEM SDK functional simulator.
- First-class objects are DPU, tasklet, MRAM bank, WRAM, IRAM, DMA transfer, CPU-DPU/DPU-CPU transfer, synchronization primitive, and host merge state.
- The hidden IR lives in code and configuration: C host code, DPU kernels, Makefile macros, command-line parameters, and benchmark-specific mapping conventions.
- Artifact status: public artifact found, MIT-licensed, with runnable code and scripts; a declarative compiler IR, pass pipeline, and paper-figure workflow were not found in the checked sources.
- Integration is most direct as a benchmark and calibration source for future CIM/PIM compiler stacks.
- For value-trajectory IR work, PrIM is valuable for digital placement/transfer trajectories, while analog trajectory objects such as ADC/DAC, bit-sliced partial sums, and reconstruction paths are not applicable to this target.
