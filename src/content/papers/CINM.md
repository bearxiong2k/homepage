---
slug: cinm
title: "CINM (Cinnamon): A Compilation Infrastructure for Heterogeneous Compute In-Memory and Compute Near-Memory Paradigms"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "ASPLOS '25 / Proceedings of the 29th ACM International Conference on Architectural Support for Programming Languages and Operating Systems, Volume 4"
authors_or_group: "Asif Ali Khan; Hamid Farzaneh; Karl F. A. Friebel; Clément Fournier; Lorenzo Chelini; Jeronimo Castrillon"
summary: >-
  CINM, or Cinnamon, contributes an MLIR-based abstraction and lowering stack for compute-in-memory and compute-near-memory systems. Its strongest contribution for a compiler/IR corpus is the explicit hierarchy of dialects: a high-level `cinm` dialect for device-agnostic CINM operations and target-selection hooks, mid-level `cnm` and `cim` dialects for common near-memory and in-memory resource/control patterns, and device dialects such as UPMEM and memristor for backend-specific lowering. The demonstrated scope is CPU+UPMEM on real UPMEM hardware and CPU+memristor-crossbar through an OCC/gem5-style simulation path, with workloads drawn from ML kernels, tensor contractions, MLPs, and selected PriM benchmarks. CINM is therefore best read as a reusable compiler/mapping framework and IR design point for heterogeneous CIM/CNM systems, rather than as a fully calibrated universal CIM runtime or value-trajectory IR. ([arXiv](https://arxiv.org/html/2301.07486v4))
links:
  paper: https://arxiv.org/pdf/2301.07486
  artifact: https://github.com/tud-ccc/Cinnamon
  docs:
  code:
technology:
  - "UPMEM"
  - "digital-CNM"
  - "memristor-crossbar"
  - "PCM"
  - "RRAM-CIM"
  - "analog-CIM"
  - "hybrid"
workloads:
  - "GEMM / MM"
  - "2MM / 3MM"
  - "convolution"
  - "tensor contractions"
  - "MLP"
  - "PriM: vector addition"
  - "PriM: matrix-vector multiplication"
  - "PriM: histogram"
  - "PriM: BFS"
  - "PriM: select"
  - "PriM: reduction"
  - "PriM: time-series analysis"
tags: []
baselines: []
axis_A:
  primary: A4
  secondary: [A3, A5, A6]
axis_B: [B4, B3, B5, B1]
axis_C_first_class_objects:
  - "cinm_tensor_ops"
  - "cnm_workgroup"
  - "cnm_buffer"
  - "affine_scatter_gather_map"
  - "cim_device_id"
  - "cim_crossbar_id"
  - "cim_future_barrier"
  - "memristor_tile_id"
  - "memristor_write_to_crossbar"
  - "UPMEM_rank_dpu_tasklet_hierarchy"
  - "UPMEM_WRAM_MRAM_memory_objects"
  - "partial_result_merge"
axis_D_rewrite_objects:
  - "operator_graph"
  - "tensor_program"
  - "loop_nest"
  - "hardware_mapping"
  - "buffer_layout"
  - "array_crossbar_binding"
  - "device_meta_op_stream"
  - "partial_sum_accumulation"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/tud-ccc/Cinnamon"
  license: "MIT per LICENSE file; README text mentions BSD 2-clause, verify before redistribution"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model_plugin_host"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Best understood as an MLIR compiler/mapping stack for CIM/CNM, not a universal validated CIM infrastructure."
  - "UPMEM path has the clearest public artifact and real-hardware evidence."
  - "Memristor path is important for analog-CIM comparison, but artifact-level backend completeness is partial in checked sources."
  - "Cost model support is primarily an interface/placeholder; automated target-selection policy remains future work."
  - "Value-trajectory extensions would attach domain, precision, bit-slice, sensing, reconstruction, and accumulation metadata to MLIR values and device futures."
takeaways: []
---

# CINM (Cinnamon) — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A4 — Explicit IR / dialect / compiler stack** | CINM’s center of gravity is an MLIR lowering stack: `cinm` → `cim` / `cnm` / `affine` → device dialects such as `upmem` and `memristor` → LLVM or device APIs. The paper explicitly frames the contribution as hierarchical MLIR abstractions and progressive lowering. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Secondary roles, Axis A | **A3 + A5 + limited A6** | A3 because the stack performs tiling, loop interchange, loop unrolling, workgroup mapping, and partial-result accumulation; A5 because the demonstrated end-to-end scope is CPU+UPMEM and CPU+memristor-crossbar; limited A6 because the UPMEM path is evaluated on real hardware while the memristor path is simulator-backed. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR; B3 loop/tensor-schedule IR; B5 device meta-op IR; partial B1 config-as-IR** | `cnm` workgroups, buffers, scatter/gather maps, `cim` device operations, UPMEM hierarchy, and memristor tile IDs make hardware resources visible in MLIR. Tiling, loop interchange, and loop unrolling are the main schedule rewrites. Device calls are exposed as MLIR operations rather than a full instruction ISA. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| First-class CIM objects, Axis C | `cinm` tensor ops; `cnm` workgroup/buffer/scatter/gather/launch; `cim` acquire/write/execute/read/barrier; `cim` / artifact-level device and crossbar IDs; memristor tile ID, write-to-crossbar, GEMM/GEVM, barrier; UPMEM rank/DPU/tasklet hierarchy, WRAM/MRAM allocation and memcpy | The paper names high-level CINM ops and lower-level `cim`/`cnm` operations; the artifact’s TableGen files expose additional typed objects such as `cim.acquire_crossbar`, `cim.future`, `upmem.hierarchy`, `upmem.launch`, `upmem.memcpy`, and `memristor.write_to_crossbar`. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Rewrite object, Axis D | **Operator graph + tensor/loop schedule + hardware mapping + device meta-op stream** | CINM rewrites `linalg`/TOSA/torch-level programs into `cinm` ops, canonicalizes convolution through im2col/GEMM, lowers to `cim`/`cnm`, tiles by device limits, interchanges/unrolls loops, inserts partial-result merging, and lowers to UPMEM or memristor device calls. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Best corpus tags | `MLIR`, `hierarchical-dialects`, `compiler-mapping`, `CIM-CNM`, `UPMEM`, `memristor-crossbar`, `tensor-lowering`, `tiling`, `workgroup-IR`, `device-dialect` | These tags match the demonstrated abstraction stack and artifact surface. |
| Closest comparison baselines | **OCC, PriM, XLA-NDP, PIMFlow, Infinity Stream, CIM-MLC / memristor compilers** | OCC is the closest memristor-crossbar baseline; PriM is the UPMEM benchmark/code baseline; XLA-NDP, PIMFlow, Infinity Stream, CHOPPER, PRIMO, and other CIM compilers are discussed as related compiler/framework efforts with different IR and target choices. ([arXiv](https://arxiv.org/html/2301.07486v4)) |

## 2. One-paragraph public summary

CINM, or Cinnamon, contributes an MLIR-based abstraction and lowering stack for compute-in-memory and compute-near-memory systems. Its strongest contribution for a compiler/IR corpus is the explicit hierarchy of dialects: a high-level `cinm` dialect for device-agnostic CINM operations and target-selection hooks, mid-level `cnm` and `cim` dialects for common near-memory and in-memory resource/control patterns, and device dialects such as UPMEM and memristor for backend-specific lowering. The demonstrated scope is CPU+UPMEM on real UPMEM hardware and CPU+memristor-crossbar through an OCC/gem5-style simulation path, with workloads drawn from ML kernels, tensor contractions, MLPs, and selected PriM benchmarks. CINM is therefore best read as a reusable compiler/mapping framework and IR design point for heterogeneous CIM/CNM systems, rather than as a fully calibrated universal CIM runtime or value-trajectory IR. ([arXiv](https://arxiv.org/html/2301.07486v4))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “First end-to-end compilation flow” for heterogeneous CIM/CNM with hierarchical abstractions | Abstract and introduction | Paper + artifact | The paper shows a left-to-right MLIR flow from torch/linalg/TOSA through `cinm`, `cnm`/`cim`, device dialects, and LLVM/device APIs; the repository contains source folders for dialects, conversions, targets, runtime, samples, tests, and testbench. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Demonstrated for selected UPMEM CNM and memristor-crossbar CIM targets. The paper states the architecture restriction is driven by available open-source evaluation tools. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| `cinm` abstracts over CINM devices and supports target selection | Sec. 3.2.2 and contribution list | Paper-only + artifact definitions | `cinm` exposes a constrained set of tensor-like operations such as elementwise arithmetic/logic, GEMM/GEMV, transpose, histogram, top-k, similarity search, mergePartial, popCount, reduce, and scan. The artifact defines these ops in TableGen. ([arXiv](https://arxiv.org/html/2301.07486v4)) | The paper-level evidence supports an interface for target selection; automated policy is explicitly left for future cost models/search mechanisms. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| `cnm` captures common CNM resource structure | Sec. 3.2.3, Table 2, Fig. 7/8 | Paper + code/artifact | `cnm` names workgroups, buffers, scatter/gather, launch, wait, logical PUs, and a memory-resource tree; the artifact defines `cnm.workgroup`, `cnm.alloc`, `cnm.scatter`, `cnm.gather`, and `cnm.launch`. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Reusable boundary is clearest at the workgroup/buffer/scatter/gather interface. Physical mapping to a particular CNM device is deferred to the device dialect. |
| `cim` captures common CIM setup/execution structure | Sec. 3.2.4, Table 3 | Paper + code/artifact | `cim` names acquire, write, execute, read, barrier, release; the artifact further exposes device IDs, crossbar IDs, futures, `cim.acquire_crossbar`, `cim.op.gemm`, and `cim.op.gemv`. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Demonstrated abstraction centers on device allocation, array/crossbar binding, and execution launch. ADC/DAC and analog reconstruction parameters are discussed as setup concerns rather than fully propagated value types. |
| Device dialects lower to UPMEM and memristor APIs | Sec. 3.2.5 | Paper + artifact definitions | The paper says device dialects expose supported operations, array/tile sizes, memory hierarchy, and library interfaces; artifact files define UPMEM hierarchy/launch/memcpy/WRAM allocation and memristor write/GEMM/GEVM/barrier ops. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Artifact-level confirmation is clearest for MLIR operation definitions and UPMEM-oriented build/run flow. Current README roadmap still lists xbar abstraction/conversions/backend connection as roadmap items, so memristor backend completeness should be treated as partial in the public artifact. ([GitHub](https://github.com/tud-ccc/Cinnamon)) |
| CINM applies device-aware optimizations | Sec. 3.2.5–3.2.6 and evaluation | Algorithm/pass description + experiment | The paper describes compulsory tiling by crossbar size, loop interchange to reduce writes, loop unrolling for multiple CIM tiles, WRAM-aware tiling/interchange for UPMEM, and mergePartial for tile results. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Evidence supports selected transformations over GEMM-like/tensor kernels and selected PriM workloads. |
| CINM performance is competitive with or better than baselines | Abstract, Sec. 4 | Experiment + artifact data for UPMEM plots | For CIM, results are compared to OCC and an ARM CPU baseline; for UPMEM, CINM-generated code is compared to PriM and CPU-opt. Artifact scripts/data expose Figure 11 and Figure 12 inputs. ([arXiv](https://arxiv.org/pdf/2301.07486)) | Paper figures are experiment-level evidence. Full rerun depends on heavy dependencies, UPMEM hardware for the CNM path, and OCC/gem5-style setup for the CIM path. |

## 4. Stack anatomy

```text
Input / frontend:
  Object: MLIR from linalg, TOSA, torch / torch-mlir; selected PriM kernels are manually translated.
  Kind: tensor/operator IR.
  Serialization / reuse: MLIR textual examples and testbench files are public; input coverage is partial rather than arbitrary-program complete.

Middle representation:
  Object: cinm dialect, then cim or cnm dialect.
  Kind: MLIR dialects with typed operations, attributes, regions, workgroups, buffers, device operations, and tensor values.
  Serialization / reuse: serialized as MLIR; operation definitions are inspectable in TableGen.

Mapping or scheduling state:
  Object: workgroup shape, buffer sizes, affine scatter/gather maps, tile sizes, loop nests, loop order, unroll factor, partial-result merge.
  Kind: MLIR attributes + loops + pass-controlled lowering state.
  Serialization / reuse: partially inspectable in generated MLIR; a single standalone schedule schema is not exposed.

Hardware abstraction:
  Object: cnm workgroup/memory tree; cim device/crossbar acquisition; UPMEM hierarchy of ranks/DPUs/tasklets; memristor tile ID/crossbar operations.
  Kind: hardware-resource IR and device meta-op IR.
  Serialization / reuse: inspectable through dialect definitions and generated IR; physical hardware parameters are split across paper prose, types, and backend setup.

Backend / simulator / codegen:
  Object: UPMEM runtime/API path, LLVM lowering path, memristor library-call path, OCC/gem5-style simulation path.
  Kind: runtime calls, LLVM IR, translated UPMEM C/C++ kernels, simulator-backed execution.
  Serialization / reuse: UPMEM workflow is clearest in the public repo; memristor simulation reproducibility is less directly documented in checked artifact files.

Output artifact:
  Object: generated code, intermediate IRs, UPMEM runner/kernels, plot data for Figures 11/12.
  Kind: generated MLIR / LLVM / UPMEM C/C++ / benchmark data.
  Serialization / reuse: repository README says generated code and intermediate IRs are placed under testbench/gen after running compile-benches.sh.

Evaluation loop:
  Object: UPMEM hardware runs, PriM comparison, CPU-opt comparison, OCC/gem5-style memristor simulation, plot scripts/data.
  Kind: benchmark execution and plotting workflow.
  Serialization / reuse: partial; Figure 11/12 data and scripts are present, full hardware/simulator reruns depend on external setup.
```

The frontend, middle representations, and generated IR/code are described in the paper and repository: CINM starts from `linalg`, TOSA, or torch, then lowers through `cinm`, `cim`/`cnm`, device dialects, generic MLIR dialects, LLVM, and device APIs; the README states that benchmarks live under `testbench/`, `compile-benches.sh` compiles them, and generated code/intermediate IRs appear under `testbench/gen/`. ([arXiv](https://arxiv.org/html/2301.07486v4))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of textual MLIR, dialect attributes, workgroup dimensions, affine scatter/gather maps, tile sizes selected by backend constraints, loop-nest order, pass order, and device runtime assumptions. The paper foregrounds dialect hierarchy, while the reusable semantics are most visible in `cnm` workgroups/buffers, `cim` device/crossbar/future objects, and the UPMEM/memristor device meta-ops in the artifact. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cim/IR/CimOps.td))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A4 — Explicit IR / dialect / ISA compiler stack.** CINM belongs primarily in A4 because the contribution is an MLIR compiler stack with new dialects and lowering passes. The owned slice begins at tensor/operator IR from `linalg`, TOSA, or torch, and ends at device dialects, LLVM, runtime calls, or translated UPMEM code. ([arXiv](https://arxiv.org/html/2301.07486v4))

**Secondary: A3 — Mapping / scheduling / DSE framework.** CINM includes mapping and scheduling decisions, but the strongest evidenced mechanisms are transformation and lowering rather than an exhaustive automated DSE engine. The paper explicitly says target selection requires cost models and search; the implemented work focuses on the mechanism and leaves policy automation to future work. ([arXiv](https://arxiv.org/html/2301.07486v4))

**Secondary: A5 — Narrow end-to-end co-design.** The demonstrated end-to-end scope is CPU+UPMEM and CPU+memristor-crossbar. The paper states that broader target coverage is constrained by available open-source evaluation tools, while the abstraction design is intended to be extensible. ([arXiv](https://arxiv.org/html/2301.07486v4))

**Limited: A6 — Programming / runtime / benchmark on real hardware.** The UPMEM path is evaluated on a real high-end UPMEM machine, while the memristor path uses a full-system gem5 simulator based on OCC. This makes A6 relevant as evidence, but not the main taxonomy placement. ([arXiv](https://arxiv.org/html/2301.07486v4))

### 5.2 Axis B — middle-layer style

**B4 Hardware-resource IR.** The named middle representations are `cnm` workgroups and buffers, `cim` devices/crossbars/futures, UPMEM hierarchy objects, and memristor tile IDs. Decisions made here include which resource executes a region, where buffers live, how data is scattered/gathered, and how launch/acquire/execute barriers are represented. Some physical decisions remain embedded in backend lowering, hardware setup, and simulator/runtime configuration. ([arXiv](https://arxiv.org/html/2301.07486v4))

**B3 Loop / tensor-schedule IR.** CINM rewrites tensor operations into tiled loop nests and applies loop interchange and loop unrolling for locality, write minimization, and tile parallelism. The schedule is inspectable in generated MLIR but is not presented as a standalone schedule object independent of passes and backend setup. ([arXiv](https://arxiv.org/html/2301.07486v4))

**B5 Instruction / meta-op / device-call IR.** Device dialects act like meta-op interfaces: UPMEM exposes launch/memcpy/allocation/hierarchy operations, while memristor exposes write-to-crossbar, GEMM, GEVM, and barrier. These are not a technology-independent CIM instruction set, but they form a backend contract that can be inspected and wrapped. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/UPMEM/IR/UPMEMOps.td))

**Partial B1 Config-as-IR.** Configuration appears as MLIR attributes and types: `workgroupShape`, buffer size attributes, UPMEM hierarchy shape, tasklet count, and backend-specific tile sizes. There is no single external config artifact that fully captures mapping, schedule, precision, and backend settings; the configuration is distributed across MLIR, pass invocations, and runtime/simulator assumptions. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cinm/IR/CinmOps.td))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class in `cim`/artifact at device/crossbar/tile level; parameterized in paper** | Paper discusses fixed CIM array sizes, crossbar tiles, and memristor dialect lowering; artifact defines `cim.acquire_crossbar` and memristor tile-ID operations. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Bit-slicing / bit significance | **Parameter / evaluation assumption** | Paper says high-precision values use bit slicing across columns and shift-add weighting; this is not exposed as a first-class type-like value in the checked dialect definitions. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| ADC/DAC precision or sensing | **Parameter / setup-level, mostly implicit** | Paper mentions device setup parameters such as device levels, number of shared ADCs, and write mode; the public dialect definitions checked here do not expose ADC/DAC precision as value types. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Analog-to-digital or domain transition | **Implicit / backend assumption** | The memristor path is modeled as crossbar execution and library calls; analog VMM, bit slicing, and shift-add are discussed in evaluation rather than represented as a composable trajectory IR. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Peripheral circuits as path nodes | **Costed / described, not first-class IR** | Read/write latency and energy values for PCM devices and associated periphery are taken from ISAAC and Gallo-style sources; peripheral elements are part of the evaluation model rather than named IR nodes. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Partial-sum accumulation path | **First-class at `mergePartial` / loop accumulation level; implicit below that** | `cinm.mergePartial` is in the high-level operation set; the paper attributes UPMEM performance gains to partial-result management and accumulation. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Reconstruction / shift-add tree | **Hard-coded / evaluation assumption** | The paper describes shift-add weighting after bit slicing, but the checked artifact surface does not expose reconstruction as a rewriteable IR object. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly not applicable / not central** | CINM’s evaluated workloads are GEMM-like ML kernels, contractions, MLP, and selected PriM workloads using INT32; no KV-cache or dynamic batching abstraction is evidenced. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Value trajectory / flow path | **Approximated by lowering path and resource ops** | Values are tracked as MLIR SSA/tensor values and device futures/buffers, but semantic stages such as analog partial sum, sensing, reconstruction, and storage are not a unified trajectory object. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cim/IR/CimOps.td)) |

### 5.4 Axis D — rewrite object

CINM rewrites an **operator/tensor program** into a hierarchy of device-aware IRs. Convolution can be canonicalized into im2col plus GEMM; `linalg.matmul` becomes `cinm.gemm`; `cinm` regions lower to `cim`, `cnm`, or affine; `cnm` introduces workgroups, buffers, scatter/gather, and launch; `cim` introduces acquire/execute/read/write/barrier; and device dialects lower toward UPMEM, memristor calls, or LLVM. ([arXiv](https://arxiv.org/html/2301.07486v4))

The legal transformations evidenced by the paper include tensor canonicalization, tiling/partitioning, workgroup dimension interchange/coalescing/splitting, WRAM-locality loop interchange, crossbar-size compulsory tiling, write-minimizing loop interchange, loop unrolling for multi-tile parallelism, and partial-result merging. The equivalences exploited are tensor algebra rewrites, independence of workgroup PUs, independence of tiled loop iterations, and GEMM-like decomposition for operations that can be profitably mapped to CIM/CNM. ([arXiv](https://arxiv.org/html/2301.07486v4))

The information that must be preserved across lowering includes tensor shape and element type, device eligibility, workgroup shape, buffer placement, scatter/gather maps, memory hierarchy constraints, tile-size legality, synchronization/barrier dependencies, partial-result identities, and host/device data movement. The representation is especially well suited to hierarchical device lowering and device-aware loop/data movement rewrites; expressing analog trajectory rewrites such as retiming ADC conversion or carrying bit-sliced partial sums across operator boundaries would likely require an additional abstraction for domain, precision stage, bit significance, and reconstruction state. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cinm/IR/CinmOps.td))

## 6. Technical mechanism reading

### 6.1 Hierarchical MLIR lowering

The core mechanism is a progressive MLIR lowering stack. Inputs may arrive from `torch`, `tosa`, or `linalg`; `cinm` is the device-agnostic abstraction that constrains the operator space and provides target-selection hooks; `cim` and `cnm` capture paradigm-specific control/data movement; device dialects such as `upmem` and `memristor` lower to target APIs or LLVM-compatible forms. Figure 4’s compiler diagram and Section 3.1 make the hierarchy explicit. ([arXiv](https://arxiv.org/pdf/2301.07486))

The artifact mirrors this structure: the repository has `include`, `lib`, `runtime`, `samples`, `test`, `testbench`, and `tools` folders, and its README states that Cinnamon contains sources for abstractions, transformations, and conversions for progressive lowering. ([GitHub](https://github.com/tud-ccc/Cinnamon))

### 6.2 `cinm` as constrained operator vocabulary

`cinm` is not a memory-technology model; it is a constrained operator vocabulary for targetable CIM/CNM computation. Table 1 includes elementwise arithmetic/logic, GEMM/GEMV, transpose, histogram/majority, top-k, similarity search, mergePartial, popCount, reduce, and scan, with CIM/CNM applicability marked per op. The artifact’s `CinmOps.td` defines these as MLIR operations with tensor operands/results and includes `cinm.compute` regions carrying attributes such as `workgroupShape` and `bufferSizesInBytes`. ([arXiv](https://arxiv.org/html/2301.07486v4))

A key compiler move is canonicalization into this constrained vocabulary. The paper’s convolution example lowers `linalg.conv2d` into an im2col-style generic operation, shape collapse, `cinm.gemm`, and shape expansion. This illustrates why CINM is more of an IR/mapping stack than a workload-specific kernel library: the important object is the rewritten tensor/operator representation that can be routed to a device dialect. ([arXiv](https://arxiv.org/html/2301.07486v4))

### 6.3 Target selection hook rather than calibrated policy

CINM’s high-level target-selection story is intentionally separated from a fully implemented cost model. The paper states that optimal device mapping requires cost models and search mechanisms, and that the current work focuses on the mechanism enforcing mapping decisions rather than automated policy. Section 3.3 proposes a cost-model interface registered by device dialects, so the reusable design point is a cost-model plugin boundary over a constrained `cinm` op set. ([arXiv](https://arxiv.org/html/2301.07486v4))

### 6.4 CNM mechanism: workgroup/resource tree

The `cnm` dialect is the clearest hardware-resource IR in the paper. A `cnm.workgroup` is a logical address space with PUs at leaves and memory spaces arranged as a tree. Buffers are opaque outside launch regions and become regular memrefs inside a launch body; data movement is represented through scatter/gather maps. The paper emphasizes that workgroup dimensions can be interchanged, coalesced, or split because PUs are independent, while memory footprint and copied scalars change. ([arXiv](https://arxiv.org/html/2301.07486v4))

The artifact definitions match this mechanism: `cnm.workgroup`, `cnm.alloc`, `cnm.scatter`, `cnm.gather`, and `cnm.launch` are defined as MLIR operations, with affine maps and transfer-count helpers embedded in the op definitions. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cnm/IR/CnmOps.td))

### 6.5 CIM mechanism: acquire/write/execute/read plus tiling

The `cim` dialect abstracts common in-memory device protocol: acquire a device, write data, execute a kernel, read results, synchronize, and release. The paper’s rationale is that many CIM targets require setup before useful execution, but exact setup depends on device technology. It names setup parameters such as device levels, shared ADC count, and write mode, and uses acquire/execute/read/write as the common compiler-facing boundary. ([arXiv](https://arxiv.org/html/2301.07486v4))

CIM-specific transformations center on fixed array/crossbar sizes and costly NVM writes. CINM tiles kernels to fit arrays, interchanges tiled loops to reduce writes, unrolls inner loops to run multiple tiles in parallel, and uses `cinm.mergePartial` for partial results. ([arXiv](https://arxiv.org/html/2301.07486v4))

### 6.6 Device dialects: UPMEM and memristor

The UPMEM dialect exposes a hierarchy of ranks/DPUs/tasklets, launch regions, WRAM allocation, memcpy, DPU allocation/free, and kernel outlining/translation paths. The paper also states that tasklet count can be user-configured and that CINM empirically uses 16 tasklets for large matmul cases. ([arXiv](https://arxiv.org/html/2301.07486v4))

The memristor dialect exposes backend operations such as `memristor.write_to_crossbar`, `memristor.gemm`, `memristor.gevm`, and `memristor.barrier`, each parameterized by a tile ID and memrefs. These operations form the clearest artifact-level contract for a memristor backend, although the README roadmap still lists xbar abstraction/conversions/backend connection as future or known-work items. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Memristor/IR/MemristorOps.td))

### 6.7 Evaluation assumptions

The UPMEM evaluation uses a real UPMEM system and compares generated code with PriM and CPU-opt baselines. The memristor evaluation uses a full-system gem5 simulation environment adapted from OCC; the paper models a PCM-based tile array, uses read/write/periphery energy/latency values from prior sources, and describes bit slicing plus shift-add for high-precision values. All workloads in the paper’s configurations use INT32. ([arXiv](https://arxiv.org/html/2301.07486v4))

For CIM, the paper reports that `cim-min-writes` reduces writes by 7×, averages 12.4× performance improvement, and that `cim-opt` reaches a 30× performance gain versus the ARM CPU baseline in the reported setup. For UPMEM, Figure 11 reports 47%, 42%, and 40% speedups for optimized 4/8/16-DIMM configurations over corresponding non-optimized CINM configurations; Figure 12 compares CINM with PriM and CPU-opt. ([arXiv](https://arxiv.org/pdf/2301.07486))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The dialect hierarchy is the contribution, not a single universal CIM IR

- **Observation:** CINM’s reusable object is a hierarchy: `cinm` for targetable operations, `cnm`/`cim` for paradigm-level resource/control abstractions, and device dialects for concrete backend contracts. ([arXiv](https://arxiv.org/pdf/2301.07486))  
- **Why it matters for CIM compiler/IR work:** It shows a practical way to avoid forcing UPMEM-style near-memory execution and analog crossbar execution into one flat IR.  
- **Reusable lesson:** A future corpus can classify CINM as a hierarchical IR stack where portability is achieved by narrowing the op vocabulary and deferring device-specific lowering.

### Insight 2 — `cnm.workgroup` is a strong hardware-resource IR boundary

- **Observation:** The `cnm` workgroup encodes parallel PUs and a memory tree while hiding direct memory manipulation behind allocate/scatter/gather/launch. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **Why it matters for CIM compiler/IR work:** It makes data distribution and memory hierarchy explicit enough for legal rewrites, while keeping physical UPMEM details in a lower dialect.  
- **Reusable lesson:** Workgroup-plus-memory-tree designs are useful for future PIM/CNM IRs, especially when mapping must preserve locality and communication legality.

### Insight 3 — Cost modeling is designed as a plugin boundary

- **Observation:** CINM narrows the program to a constrained `cinm` op set and proposes a device-registered cost-model interface, but the paper’s demonstrated flow does not provide a fully automated mapping policy. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **Why it matters for CIM compiler/IR work:** The constrained op set gives future cost models a stable domain; it also clarifies where a compiler corpus should distinguish “mapping interface” from “calibrated mapper.”  
- **Reusable lesson:** Treat cost-model hooks as first-class corpus evidence, but separately record whether a calibrated model/search implementation is present.

### Insight 4 — The analog CIM path exposes a useful but coarse backend contract

- **Observation:** The memristor dialect’s artifact surface is at the level of write-to-crossbar, GEMM/GEVM, and barrier over tile IDs and memrefs. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Memristor/IR/MemristorOps.td))  
- **Why it matters for CIM compiler/IR work:** This is a clean backend API boundary, but bit slicing, sensing, ADC setup, and reconstruction mostly live below or beside the IR boundary.  
- **Reusable lesson:** Future analog-CIM IRs can borrow the device/crossbar/tile resource vocabulary while adding typed representations for precision stage, analog domain, and reconstruction.

### Insight 5 — The UPMEM evidence is stronger at runtime/codegen integration than at universal target selection

- **Observation:** The public workflow includes UPMEM build recipes, generated IR/code paths, and figure data for UPMEM comparisons; the paper evaluates on real UPMEM hardware. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/justfile))  
- **Why it matters for CIM compiler/IR work:** It makes UPMEM a practical backend for studying compiler lowering, workgroup distribution, and host/device code generation.  
- **Reusable lesson:** CINM is especially useful as a UPMEM-oriented IR/backend case study and as a template for adding other CNM device dialects.

### Insight 6 — Partial-result management is a cross-cutting semantic object

- **Observation:** `cinm.mergePartial`, tiling, loop interchange, loop unrolling, synchronization barriers, and accumulation all appear around partial results. The paper links UPMEM gains to partial-result management and accumulation. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **Why it matters for CIM compiler/IR work:** Partial sums are where tensor semantics, hardware mapping, data movement, and numeric reconstruction intersect.  
- **Reusable lesson:** Future CIM IR designs should consider partial-result identity and accumulation path as first-class objects, rather than treating them only as loop temporaries.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**  
**Artifact URL / identifier:** `https://github.com/tud-ccc/Cinnamon` / `tud-ccc/Cinnamon`.  
**License:** the checked `LICENSE` file says MIT; the README text says BSD 2-clause, so downstream users should verify the intended license before redistribution. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/LICENSE))  
**Last checked:** 2026-05-15.

The artifact contains the Cinnamon source tree, MLIR dialect definitions, conversion/target/runtime/testbench folders, benchmark MLIR files, build recipes, UPMEM-oriented generation/run recipes, and artifact data/scripts for Figures 11 and 12. The README says benchmarks live under `testbench/`, `compile-benches.sh` compiles them, and generated code/intermediate IRs are written under `testbench/gen/`; the script itself invokes `just genBench` for a subset of benchmarks. ([GitHub](https://github.com/tud-ccc/Cinnamon))

The artifact appears to omit, or at least does not make immediately public in the checked files, a one-command full reproduction of all paper figures across both UPMEM hardware and the memristor simulator path. Figure 11 and Figure 12 have data/plot files in the artifact; Figure 10’s full CIM reproduction path was not confirmed in the checked artifact files. ([GitHub](https://github.com/tud-ccc/Cinnamon/tree/main/artifact/scripts))

**Minimal documented workflow:** install dependencies, configure/build with `just configure -no-torch-mlir`, run `compile-benches.sh`, or run individual `just` recipes such as `genBench`, `cinm-to-cnm`, `cnm-to-upmem`, `upmem-to-llvm`, `translate-upmem-kernel-to-cpp`, and linker/runner steps. ([GitHub](https://github.com/tud-ccc/Cinnamon))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper documents `linalg`, TOSA, torch/torch-mlir, and manual PriM translation; examples are public MLIR testbench files. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Intermediate representation serialized | Yes | MLIR dialects and benchmark IR are textual; README says intermediate IRs are generated under `testbench/gen/`. ([GitHub](https://github.com/tud-ccc/Cinnamon)) |
| Mapping decisions inspectable | Partial | Workgroup shapes, hierarchy types, scatter/gather maps, tile-related IR, and pass outputs can be inspected; automated policy is not fully implemented. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/Cnm/IR/CnmOps.td)) |
| Schedule inspectable | Partial | Loop nests and transformations are represented through MLIR/pass outputs, but there is no standalone schedule schema. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Hardware config explicit | Partial | UPMEM hierarchy and tasklets are explicit; crossbar/ADC/periphery assumptions are partly in paper prose and backend setup. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/UPMEM/IR/UPMEMOps.td)) |
| Precision / bit-slice assumptions explicit | Partial | INT32 workloads and bit slicing/shift-add are described; bit significance is not a first-class checked IR type. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Cost model inspectable | Partial | Cost-model interface is described; calibrated cost models/search policy are future work. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Simulator backend documented | Partial | Paper describes gem5/OCC-style memristor simulation; public artifact confirmation is clearest for dialect/code surface, less direct for full simulator reproduction. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Generated code / instruction stream inspectable | Partial | UPMEM C/LLVM generation recipes and device dialect ops are inspectable; a technology-independent CIM instruction stream is not exposed. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/justfile)) |
| Provenance from source op to backend action | Partial | Examples show `linalg`/conv to `cinm.gemm` and lower-level dialects; full provenance tracking is not a separate artifact. ([arXiv](https://arxiv.org/html/2301.07486v4)) |
| Reproduction scripts available | Partial | Build/run scripts and Fig. 11/12 data scripts exist; full hardware/simulator reproduction depends on external setup. ([GitHub](https://github.com/tud-ccc/Cinnamon/blob/main/compile_benches.sh)) |
| Calibration source documented | Partial | The paper cites prior latency/energy sources for PCM/periphery; calibration tables were not found as standalone checked artifact files. ([arXiv](https://arxiv.org/html/2301.07486v4)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible when workloads can already be represented in MLIR `linalg`, TOSA, or torch/torch-mlir. Non-idiomatic PriM-style programs may require manual translation or a dedicated frontend. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **As IR inspiration:** The most valuable abstractions are the three-level dialect hierarchy, constrained `cinm` op set, `cnm` workgroup/resource tree, and `cim` acquire/execute/read/write protocol.  
- **As mapper/scheduler:** The tiling, loop interchange, loop unrolling, scatter/gather, and partial-result mechanisms can be adapted, especially for workgroup-distributed CNM or crossbar-sized CIM. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **As cost model:** CINM is better used as a cost-model plugin host than as a calibrated cost model itself. A future stack could implement target-selection policies over the `cinm` op set. ([arXiv](https://arxiv.org/html/2301.07486v4))  
- **As backend:** UPMEM is the clearest backend integration point; memristor dialect operations are useful as a coarse crossbar API wrapper, with additional work needed for full analog trajectory or simulator integration. ([GitHub](https://raw.githubusercontent.com/tud-ccc/Cinnamon/main/include/cinm-mlir/Dialect/UPMEM/IR/UPMEMOps.td))  
- **As benchmark:** Testbench MLIR files, PriM comparisons, and Figure 11/12 data are reusable for compiler-flow studies; hardware availability affects reruns. ([GitHub](https://github.com/tud-ccc/Cinnamon/tree/main/testbench))  
- **As validation source:** UPMEM measurements provide real-system evidence; memristor validation is simulator-backed with energy/latency parameters from prior work rather than chip-in-loop evidence. ([arXiv](https://arxiv.org/html/2301.07486v4))  

**Integration effort estimate: Medium.** Integration would be most direct through MLIR: reuse the dialect definitions, conversion passes, and UPMEM-oriented recipes. Effort rises for full reproduction because LLVM/MLIR versioning, UPMEM SDK/hardware, torch-mlir, and simulator setup are nontrivial dependencies. The most valuable reusable boundary appears to be the textual MLIR dialect stack, not the full end-to-end experimental environment.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| OCC | Memristor-crossbar compilation and simulation | CINM reuses/extends the OCC-style memristor path but wraps it in a broader MLIR hierarchy spanning CIM and CNM. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Classify OCC-like flows as target-specific CIM compiler/simulator stacks; classify CINM as a hierarchy that can host such flows. |
| PriM | UPMEM CNM benchmark/code baseline | PriM provides hand-optimized UPMEM benchmarks; CINM generates UPMEM code from higher-level IR and compares against PriM. ([arXiv](https://arxiv.org/html/2301.07486v4)) | PriM is a benchmark/runtime baseline; CINM is a compiler-lowering stack with UPMEM backend evidence. |
| XLA-NDP | Compiler/runtime for near-data processing | Paper describes XLA-NDP as XLA-based and specific to NDPX/ML training, while CINM is MLIR-based and multi-dialect across CIM/CNM. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Distinguish graph/framework compilers for one NDP architecture from hierarchical dialect stacks. |
| PIMFlow | Graph transformation and GPU-PIM partitioning for CNNs | PIMFlow targets a GPU-based CNM system and ONNX/CNN graph transformations; CINM’s middle layer is MLIR dialects and hardware-resource lowering. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Use PIMFlow as a graph-as-IR/mapping comparison, not as the same style of dialect IR. |
| CHOPPER / PRIMO | Low-level bit-serial or vector/SIMD-style offload | CHOPPER focuses on bit-serial SIMD DRAM processing; PRIMO substitutes vector patterns with device APIs. CINM instead introduces reusable mid-level dialects. ([arXiv](https://arxiv.org/html/2301.07486v4)) | These are closer to instruction/API substitution or bit-serial mapping; CINM is broader in IR layering. |
| Infinity Stream | Hybrid in/near-memory execution from program dataflow | The paper calls Infinity Stream the closest in goal, but contrasts its LLVM-IR dataflow extraction with CINM’s multiple IR levels for domain/device optimizations. ([arXiv](https://arxiv.org/html/2301.07486v4)) | Useful contrast between late LLVM/dataflow extraction and earlier multi-level IR design. |

## 10. Corpus-ready final takeaway

- CINM’s core contribution is a hierarchical MLIR abstraction stack for CIM/CNM compilation: `cinm`, `cim`, `cnm`, and device dialects.
- The strongest reusable stack layer is the middle compiler IR: constrained CINM ops, CNM workgroups/buffers/scatter/gather, and CIM acquire/execute/read/write protocol.
- The demonstrated scope is CPU+UPMEM on real UPMEM hardware and CPU+memristor-crossbar through OCC/gem5-style simulation.
- First-class objects include workgroups, buffers, scatter/gather maps, device IDs, crossbar IDs, tile IDs, futures/barriers, UPMEM hierarchy, and memristor device calls.
- The hidden IR is distributed across MLIR attributes, pass order, tile sizes, loop nests, scatter/gather maps, runtime setup, and simulator assumptions.
- Artifact status: public artifact found; it includes source, dialect definitions, testbench files, build recipes, and Figure 11/12 data, with full UPMEM/simulator reproduction dependent on external infrastructure.
- CINM is best integrated as IR inspiration, UPMEM backend scaffolding, and a host for future cost models rather than as a complete calibrated mapping oracle.
- For value-trajectory IR research, CINM provides resource and lowering ingredients, while trajectory-level rewrites would add explicit value-domain, bit-slice, sensing, reconstruction, and accumulation metadata.
