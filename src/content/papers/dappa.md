---
slug: dappa
title: "DaPPA: A Data-Parallel Programming Framework for Processing-in-Memory Architectures"
short_title: "DaPPA"
subtitle: "Scoped CIM stack note"
year: 2023
publication:
  venue: "arXiv:2310.10168"
  type: "other"
  doi: "10.48550/arXiv.2310.10168"
  url: "https://doi.org/10.48550/arXiv.2310.10168"
authors:
  - "Geraldo F. Oliveira"
  - "Alain Kohli"
  - "David Novo"
  - "Ataberk Olgun"
  - "A. Giray Yaglikci"
  - "Saugata Ghose"
  - "Juan Gómez-Luna"
  - "Onur Mutlu"
bibtex: |
  @misc{oliveira2023dappa,
    author = {Oliveira, Geraldo F. and Kohli, Alain and Novo, David and Olgun, Ataberk and Yaglikci, A. Giray and Ghose, Saugata and Gómez-Luna, Juan and Mutlu, Onur},
    title = {DaPPA: A Data-Parallel Programming Framework for Processing-in-Memory Architectures},
    year = {2023},
    howpublished = {arXiv:2310.10168},
    doi = {10.48550/arXiv.2310.10168},
    eprint = {2310.10168},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2310.10168}
  }
citation_source: https://arxiv.org/abs/2310.10168
summary: >-
  DaPPA is a UPMEM-oriented programming and dynamic code-generation framework that raises the programmer-facing abstraction from explicit DPU memory movement and tasklet partitioning to C++ data-parallel patterns. Its main reusable contribution is the `Pipeline`/stage abstraction: users express map, reduce, filter, window, group, and composite pattern pipelines, while DaPPA generates UPMEM host/DPU code, arranges MRAM and WRAM data, handles 8-byte alignment, partitions work across DPUs and tasklets, and performs CPU-side leftover or post-processing when required. The paper demonstrates the approach on six PrIM workloads—VA, SEL, UNI, RED, GEMV, and HST-S—on a real UPMEM system with 2,560 DPUs, reporting 2.1× average end-to-end speedup over hand-tuned PrIM implementations and 94% lower effective UPMEM-related LOC. For CIM compiler/IR research, DaPPA is most relevant as a layer-specific frontend-to-backend stack where the first-class object is a data-parallel pipeline plus UPMEM memory-layout/runtime state, rather than an explicit portable IR, instruction dialect, analog-CIM value trajectory, or hardware-model schema. ([arXiv](https://arxiv.org/pdf/2310.10168))
links:
  paper: https://arxiv.org/pdf/2310.10168
  artifact:
  docs:
  code:
technology:
  - "DRAM-PIM"
  - "UPMEM"
  - "digital-CIM"
  - "processing-near-memory"
workloads:
  - "vector addition"
  - "select"
  - "unique"
  - "reduction"
  - "general matrix-vector multiplication"
  - "image histogram small"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A3, A5]
axis_B: [B2, B4, B7]
axis_C_first_class_objects:
  - "Pipeline"
  - "stage"
  - "data_parallel_pattern"
  - "argument_role_and_type_size"
  - "input_output_intermediate_vector"
  - "scalar_reduction_output"
  - "fetch_marker"
  - "DPU"
  - "tasklet"
  - "MRAM_region"
  - "WRAM_cache_block"
  - "alignment_padding"
  - "execution_round"
  - "CPU_leftover_work"
  - "host_filter_compaction"
  - "host_reduce_combination"
axis_D_rewrite_objects:
  - "pattern_pipeline"
  - "memory_layout"
  - "DPU_tasklet_partition"
  - "host_DPU_data_movement"
  - "generated_UPMEM_code"
  - "runtime_post_processing_state"
artifact:
  status: "no public artifact found"
  url: 
  license: "Unknown / not found in the checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR_inspiration"
  - "mapper_scheduler"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Strongest corpus value is as a UPMEM-specific pattern-to-codegen stack."
  - "The effective IR is implicit in Pipeline state plus global stage/argument lists and MRAM/WRAM layout calculations."
  - "Analog-CIM objects such as ADC/DAC, bit slicing, sensing precision, and reconstruction paths are not applicable."
  - "Real-system evaluation is valuable, but public reproduction depends on unavailable DaPPA implementation artifacts."
takeaways: []
---

# DaPPA — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 Programming / runtime / benchmark on real hardware** | DaPPA is presented as a C++ programming framework for UPMEM PIM systems, with a pattern API, `Pipeline` dataflow interface, and dynamic template-based compilation to UPMEM binaries. The evaluation is on a real UPMEM system with 20 DIMMs and 2,560 DPUs. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Secondary stack role, Axis A | **A3 Mapping / scheduling / code-generation framework; A5 narrow end-to-end stack** | The framework calculates MRAM/WRAM placement, DPU/tasklet partitioning, alignment handling, CPU/DPU work division, and host post-processing; the end-to-end slice is specific to UPMEM rather than backend-agnostic CIM. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Middle-layer style, Axis B | **B2 pipeline/dataflow-as-IR; B4 hardware-resource layout state; B7 runtime-state abstraction** | The named middle object is a `Pipeline` made of ordered stages, each holding a data-parallel pattern and typed arguments. The effective resource state appears as global stage and argument lists, MRAM/WRAM offsets, element-count calculations, fetch markers, and CPU/DPU post-processing decisions. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| First-class CIM objects, Axis C | `Pipeline`, stage, pattern primitive, argument role/type, input/output/intermediate vector, scalar reduction, fetch marker, DPU, tasklet, MRAM allocation, WRAM cache block, alignment padding, execution round, CPU leftover work, host post-processing | DaPPA names high-level dataflow objects and UPMEM memory/parallelism objects directly. Analog CIM objects such as crossbar arrays, ADCs/DACs, bit-sliced reconstruction, and sensing paths are not applicable to its fully digital UPMEM target. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Rewrite object, Axis D | **Pattern pipeline → UPMEM host/DPU code + memory layout + runtime transfer/post-processing plan** | Transformations include kernel stringification, type removal, memory arrangement, MRAM/WRAM offset calculation, DPU/tasklet splitting, CPU leftover generation, filter compaction, reduce combination, and invalid-pipeline splitting via `PipelineFull`. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Best corpus tags | `UPMEM`, `DRAM-PIM`, `digital-PIM`, `programming-framework`, `pattern-frontend`, `dynamic-codegen`, `MRAM-WRAM-layout`, `CPU-DPU-partitioning`, `PrIM-benchmarks`, `real-hardware-evaluation` | Tags reflect the evidenced stack boundary: a data-parallel frontend and dynamic code generator for UPMEM, evaluated on PrIM workloads. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Closest comparison baselines | **SimplePIM, PrIM, CINM/Cinnamon, CHOPPER, Infinity Stream** | SimplePIM is the closest UPMEM programming-framework baseline; PrIM supplies hand-tuned UPMEM workloads; CINM is a more explicit MLIR-style heterogeneous CIM/CNM compiler; CHOPPER and Infinity Stream are compiler/ISA-oriented nearby PIM stacks with different first-class rewrite objects. ([arXiv](https://arxiv.org/abs/2310.01893?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

DaPPA is a UPMEM-oriented programming and dynamic code-generation framework that raises the programmer-facing abstraction from explicit DPU memory movement and tasklet partitioning to C++ data-parallel patterns. Its main reusable contribution is the `Pipeline`/stage abstraction: users express map, reduce, filter, window, group, and composite pattern pipelines, while DaPPA generates UPMEM host/DPU code, arranges MRAM and WRAM data, handles 8-byte alignment, partitions work across DPUs and tasklets, and performs CPU-side leftover or post-processing when required. The paper demonstrates the approach on six PrIM workloads—VA, SEL, UNI, RED, GEMV, and HST-S—on a real UPMEM system with 2,560 DPUs, reporting 2.1× average end-to-end speedup over hand-tuned PrIM implementations and 94% lower effective UPMEM-related LOC. For CIM compiler/IR research, DaPPA is most relevant as a layer-specific frontend-to-backend stack where the first-class object is a data-parallel pipeline plus UPMEM memory-layout/runtime state, rather than an explicit portable IR, instruction dialect, analog-CIM value trajectory, or hardware-model schema. ([arXiv](https://arxiv.org/pdf/2310.10168))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| DaPPA abstracts UPMEM programmability by automatically managing data movement, memory allocation, and workload distribution. | Abstract, intro, overview | Paper-only + implementation description | The paper describes a C++ framework with data-parallel APIs, a `Pipeline` interface, dynamic template-based compilation, MRAM/WRAM arrangement, CPU/DPU transfer handling, and DPU/tasklet splitting. ([arXiv](https://arxiv.org/pdf/2310.10168)) | Demonstrated for UPMEM-style digital near-memory execution over 1D vector-oriented patterns; public artifact-level confirmation would require source code or generated examples. |
| DaPPA provides five primary data-parallel primitives: map, reduce, filter, window, and group. | Section 5.1, Figure 2 | API description + formal pattern descriptions | The paper defines the primitives, their purity/associativity requirements where relevant, and composite variants such as window+group, window+filter, group+filter, and window+group+filter. ([arXiv](https://arxiv.org/html/2310.10168v2)) | The reusable semantic boundary is clearest for 1D vector and scalar-reduction patterns; GEMV requires a manual row loop because matrices are not directly recognized as first-class data structures. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| The `Pipeline` class allows users to describe implicit dataflow across stages without writing UPMEM-specific commands. | Section 5.2, Figure 3, Listing 1 | API description + code listing | `Pipeline(length)`, `stage(...)`, `fetch(...)`, `execute()`, and `getLength(...)` are described; stages hold a pattern macro, tasklet kernel function, typed argument roles, and optional overlap/group metadata. ([arXiv](https://arxiv.org/html/2310.10168v2)) | The pipeline is inspectable in paper listings but is not shown as a serialized IR artifact; downstream semantics are held in generated code and compiler state. |
| Dynamic template-based compilation lowers a pipeline to UPMEM binaries. | Section 5.3, Figure 4/5 | Pass description / codegen flow | The paper describes Inja-based template population, kernel stringification, global stage and argument lists, type-size/string retention, MRAM/WRAM memory arrangement, CPU leftover generation, and host post-processing for filter/reduce. ([arXiv](https://arxiv.org/pdf/2310.10168)) | The paper-level evidence supports the compilation structure and transformation order; artifact-level confirmation would require the template files, generated source, and build scripts. |
| DaPPA improves performance over hand-tuned PrIM implementations. | Section 7.2, Figures 5–6 | Real-hardware experiment | The evaluation reports 2.1× average end-to-end speedup over six PrIM workloads, with SEL and UNI benefiting from DaPPA’s parallel return transfer plus CPU compaction strategy; DPU-kernel-only performance is reported as 1.4× average over PrIM. ([arXiv](https://arxiv.org/pdf/2310.10168)) | Demonstrated for six selected PrIM workloads, 11 tasklets, and average over 10 runs on one UPMEM platform; the result partly reflects different placement of compaction/reduction work between DPU time and host transfer/post-processing time. |
| DaPPA reduces programming complexity. | Section 7.1, Table 1 | LOC experiment | The paper manually counts effective UPMEM-programming LOC and reports a geometric-mean reduction from 124 LOC in PrIM to 7 LOC in DaPPA, or 94%; compared to SimplePIM where available, the reported reduction is 59%. ([arXiv](https://arxiv.org/html/2310.10168v2)) | Demonstrated with LOC as the productivity metric; the paper excludes data loading, host allocation, variable definition, and timing code from the count. |
| Dynamic compilation overhead is small relative to UPMEM allocation and execution. | Section 7.3 | Experiment / timing measurement | The paper reports approximately 1 ms for template substitution, 150 ms for DPU binary compilation per pipeline, 1–150 ms for other calculations, and compares these with 1200 ms UPMEM SDK DPU allocation and end-to-end execution time. ([arXiv](https://arxiv.org/pdf/2310.10168)) | Demonstrated for the six evaluated workload implementations; public reproduction would require implementation and scripts. |
| DaPPA is the first fully automatic data-parallel pattern framework for UPMEM code generation. | Contributions and related work | Paper-only claim + related-work discussion | The authors distinguish DaPPA from SimplePIM by the broader pattern set, automatic CPU–DPU/DPU data communication handling, and cooperative CPU/DPU execution. ([arXiv](https://arxiv.org/pdf/2310.10168)) | The claim is scoped to the authors’ surveyed UPMEM frameworks; the public corpus should preserve it as an authors’ claim rather than an independently exhaustive literature verdict. |

## 4. Stack anatomy

```text
Input / frontend:
  C++ user code using DaPPA’s data-parallel pattern macros and Pipeline API.
  Object type: programming API / pattern pipeline.
  Serialization: not shown as a standalone serialized IR.
  Reusability: conceptually clear; source-level reuse depends on artifact availability.

Middle representation:
  Pipeline with ordered stages, stage pattern string/macro, tasklet kernel function, typed argument tuple, overlap/group parameters, fetch markers, and output-length metadata.
  Object type: implicit dataflow/pipeline IR in host program state.
  Serialization: unknown / not found in checked sources.
  Inspectability: described through API signatures and Listing 1.

Mapping or scheduling state:
  Global stage list, global argument list, per-stage WRAM cache element count, MRAM element capacity, MRAM base offsets, WRAM cache offsets, DPU/tasklet partitions, execution rounds, CPU leftover elements, filter/reduce post-processing state.
  Object type: compiler/runtime state and layout metadata.
  Serialization: unknown / not found in checked sources.
  Inspectability: partially described in Section 5.3 and 5.3.1.

Hardware abstraction:
  UPMEM host + DDR4 + PIM DIMMs + DPU + MRAM + WRAM + IRAM + tasklets + 8-byte DMA alignment.
  Object type: fixed target hardware model embedded in codegen assumptions.
  Serialization: no hardware config schema found.
  Reusability: strongest for UPMEM; backend-agnostic reuse would require extracting a resource model.

Backend / simulator / codegen:
  Dynamic template-based code generation using UPMEM code skeletons and Inja, followed by compilation into a UPMEM binary.
  Object type: code template / generated host-DPU source / binary.
  Simulator: no simulator interface used in the evidenced evaluation.
  Inspectability: paper describes the flow; generated files are not publicly found.

Output artifact:
  UPMEM binary plus host execution behavior that transfers input, launches DPU kernels, fetches outputs, and performs CPU-side compression/reduction or leftover work.
  Object type: executable binary and runtime transfer plan.
  Serialization: binary exists during execution; public generated outputs not found.

Evaluation loop:
  Real UPMEM hardware, six PrIM workloads, PrIM hand-tuned baselines, LOC comparison, end-to-end and DPU-kernel timing over 10 runs.
  Object type: hardware measurement.
  Reusability: benchmark names and setup are clear; reproduction scripts for DaPPA were not found.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the `Pipeline` stage sequence, the global stage/argument lists created during stringification, the argument role/type-size metadata retained after type removal, and the MRAM/WRAM offset and element-count calculations used to populate UPMEM templates. The paper foregrounds a high-level programming API, while the reusable semantics are most visible in the boundary between `Pipeline` construction and template population: that boundary names the pattern, argument role, data length, memory-placement constraints, CPU/DPU division, and post-processing responsibilities. ([arXiv](https://arxiv.org/html/2310.10168v2))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 Programming / runtime / benchmark on real hardware.**  
DaPPA’s central stack role is to make UPMEM programming easier through a C++ API and runtime/code-generation framework. Its evidenced input is C++ code written with data-parallel pattern macros and `Pipeline` calls; its output is UPMEM execution on real DPUs, including generated code, memory movement, kernel launch, output fetch, and host post-processing. The paper’s evaluation is explicitly hardware-backed: 20 UPMEM DIMMs, 160 GB PIM-capable memory, and 2,560 DPUs. ([arXiv](https://arxiv.org/pdf/2310.10168))

**Secondary: A3 Mapping / scheduling / code-generation framework.**  
DaPPA also owns a concrete mapping slice: it splits data across DPUs, splits DPU work across tasklets, lays out intermediate and final vectors in MRAM, computes WRAM cache blocks and offsets, handles 8-byte alignment, creates CPU threads for leftover elements, and partitions invalid pipelines when filter/reduce outputs require CPU aggregation. ([arXiv](https://arxiv.org/html/2310.10168v2))

**Secondary: A5 Narrow end-to-end co-design.**  
The end-to-end path is narrow but complete for its target: pattern API → dynamic UPMEM codegen → UPMEM binary → measured real-system execution. The stack slice is tightly coupled to UPMEM’s MRAM/WRAM/tasklet/DMA constraints rather than a portable CIM hardware hierarchy. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 5.2 Axis B — middle-layer style

**B2 — Pipeline/dataflow-as-IR.**  
The named representation is the `Pipeline` object with ordered stages. Each stage names a data-parallel pattern, a kernel function, input/output argument roles, and optional window/group parameters. Decisions made here include pattern selection, stage order, argument flow, intermediate-vs-fetched outputs, and vector-length compatibility. Decisions that remain embedded downstream include exact MRAM/WRAM offsets, chunking, execution rounds, DPU/tasklet partitioning, and CPU-side compaction/reduction. A single serialized artifact for upstream verification or rewriting is not found in the checked sources. ([arXiv](https://arxiv.org/html/2310.10168v2))

**B4 — Hardware-resource layout state.**  
The hardware-resource state is MRAM allocation, WRAM cache block sizing, offset calculation, DPU/tasklet split, and alignment padding. These objects are not presented as a separate dialect or config file, but Section 5.3.1 describes them as explicit calculations. The resource representation is therefore auditable at the algorithmic level, while direct tool integration would benefit from an exposed schema or dump format. ([arXiv](https://arxiv.org/pdf/2310.10168))

**B7 — Runtime-state abstraction.**  
DaPPA’s runtime state includes `fetch` markers, output length for filters, CPU/DPU work partitioning, multi-round execution when MRAM capacity is exceeded, filter holes and compaction, partial reductions, and `PipelineFull` sub-pipelines. These states determine correctness and performance after lowering. They are visible in the paper’s runtime descriptions, but not as a standalone runtime-state IR artifact. ([arXiv](https://arxiv.org/html/2310.10168v2))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** | DaPPA targets digital UPMEM DPUs integrated with DRAM banks, not analog crossbar CIM. The named hardware hierarchy is host CPU, DDR4 memory, UPMEM DIMM, PIM chip, DPU, MRAM, WRAM, and IRAM. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Bit-slicing / bit significance | **Not applicable** | The framework handles C++ element types and type sizes for layout, but does not expose bit-sliced numeric representation as a CIM object. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| ADC/DAC precision or sensing | **Not applicable** | UPMEM is a digital near-memory architecture with programmable in-order DPUs; sensing and conversion precision are outside the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Analog-to-digital or domain transition | **Not applicable** | The relevant domain transitions are CPU main memory ↔ DPU MRAM and MRAM ↔ WRAM data movement, not analog/digital conversion. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Peripheral circuits as path nodes | **Implicit / target-specific** | DMA and alignment constraints shape MRAM–WRAM movement, but peripheral circuits are not named as rewriteable path nodes. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Partial-sum accumulation path | **First-class for reductions at the pattern/runtime level** | Reduce is first-class; DaPPA computes partial reductions across DPU/tasklet subranges and combines partial results on the host CPU. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Reconstruction / shift-add tree | **Not applicable** | There is no bit-sliced analog or DRAM-PUD reconstruction path in the presented UPMEM framework. |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for selected runtime states; not for masks/KV cache/sparsity** | `fetch`, `getLength`, filter output compaction, CPU leftover elements, execution rounds, and `PipelineFull` sub-pipeline splitting are first-class or explicitly described runtime concerns. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Value trajectory / flow path | **Implicit / approximated** | The path CPU memory → MRAM → WRAM → MRAM → CPU is described, and stage outputs can become later-stage inputs, but value identity is not represented as a typed trajectory object. ([arXiv](https://arxiv.org/pdf/2310.10168)) |

### 5.4 Axis D — rewrite object

DaPPA rewrites a **data-parallel pattern pipeline** into a **UPMEM-specific host/DPU execution plan**. The concrete rewrite objects are:

- pattern stages and kernel functions,
- argument roles and type sizes,
- memory layout in MRAM and WRAM,
- DPU/tasklet partitions,
- execution rounds,
- CPU leftover work,
- filter/reduce post-processing,
- generated UPMEM source/binary via templates.

Legal transformations include extracting kernel text into templates, retaining type-size/string metadata after type removal, arranging intermediate and final vectors in MRAM, forming WRAM cache blocks, splitting data evenly across DPUs and tasklets subject to 8-byte alignment, using CPU work for unaligned leftovers, copying full filter output regions back in parallel and compacting holes on the CPU, combining DPU reduction partials on the CPU, and splitting unsupported stage combinations into sub-pipelines through `PipelineFull`. ([arXiv](https://arxiv.org/pdf/2310.10168))

The main equivalences are data-parallel ones: pure map/filter/window/group functions can be distributed independently; associative reductions can be partially combined in a tree-like hierarchy; intermediate vectors can remain on the DPU side when not fetched; and padding/alignment transformations preserve output semantics while satisfying UPMEM transfer rules. ([arXiv](https://arxiv.org/html/2310.10168v2))

The information preserved across lowering is the pattern type, stage order, kernel body, input/output/scalar/reduction role, element type size, vector length, fetch status, group/window metadata, and memory-location requirements. The representation is especially well suited to 1D vector pipelines whose dependencies match DaPPA’s pattern library; expressing arbitrary tensor layouts, cross-operator global filter indices, backend-portable resource choices, or value-trajectory rewrites would likely require an additional abstraction for indexed layouts, global compaction state, and typed data-movement paths.

## 6. Technical mechanism reading

### 6.1 Frontend: data-parallel patterns as programmer-facing semantics

DaPPA’s frontend is a small pattern language embedded in C++. The five primary primitives are map, reduce, filter, window, and group. The paper gives semantic constraints that are important for compiler correctness: map/filter/window/group rely on pure functions or predicates, while reduce relies on associativity so partial reductions can be grouped and combined without changing the result. Composite patterns such as window+group and window+filter extend the frontend to common overlapped or grouped vector operations. ([arXiv](https://arxiv.org/html/2310.10168v2))

For compiler/IR purposes, the key point is that DaPPA makes the **pattern** first-class, not an arbitrary control-flow graph. Pattern identity carries enough information to choose a lowering strategy: map maps to independent elementwise tasklet work; reduce maps to DPU/tasklet partial reductions and host combination; filter maps to per-DPU variable-length output plus host compaction; window adds overlap metadata; group adds non-overlapping chunk metadata.

### 6.2 Dataflow object: `Pipeline` and stage metadata

The main API object is `Pipeline`. A stage takes a macro string identifying the pattern, a function pointer/lambda for the DPU tasklet kernel, a tuple of typed arguments, and optional overlap/group-size parameters. Argument roles include input array, output array, input-output array, scalar parameter, scalar reduction output, and combination function. `fetch` marks outputs that must return to host memory, while non-fetched intermediate arrays can remain DPU-side. `execute` triggers DPU allocation and pipeline execution; `getLength` is needed for filters because the output length is not known statically. ([arXiv](https://arxiv.org/html/2310.10168v2))

This is DaPPA’s closest paper-level IR boundary. It names the computation stage, dataflow edges through shared arguments, and externally visible outputs. It also constrains legal stage combinations: filter and reduce outputs require CPU aggregation before certain downstream uses, which motivates `PipelineFull` as a higher-level wrapper that partitions invalid stage sequences into multiple sub-pipelines. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 6.3 Dynamic template-based compilation

DaPPA lowers a pipeline dynamically using UPMEM code skeletons and the Inja C++ template engine. The paper describes four transformations:

1. **Stringification and argument extraction:** kernels and stage arguments are extracted from the pipeline into global stage and argument lists.
2. **Type removal:** most C++ type information is removed except type size and string representation, reducing template complexity.
3. **Memory arrangement:** MRAM and WRAM parameters are computed from the full pipeline view.
4. **CPU/DPU division and post-processing:** unaligned leftovers, filter compaction, and reduce combination are assigned to host-side code where needed.

After these transformations, parameters and kernels are inserted into the UPMEM skeleton and compiled into a DPU binary. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 6.4 Memory placement and scheduling mechanism

DaPPA’s placement procedure is shaped by UPMEM’s memory hierarchy and alignment constraints. For MRAM, DaPPA splits data evenly across DPUs while respecting 8-byte alignment, allocates dedicated MRAM regions for intermediates that flow across stages, and performs multiple execution rounds when the full dataset does not fit in available MRAM. For WRAM, it computes a per-stage cache element count by summing argument type sizes, dividing WRAM capacity by that sum, then decrementing the count as needed to satisfy 8-byte-aligned MRAM–WRAM transfers. It also computes sequential WRAM cache offsets for each argument. ([arXiv](https://arxiv.org/pdf/2310.10168))

The only explicit equation-like expression in the paper’s memory-management discussion is the leftover calculation:

`CPU elements = total_length − (elements_per_round × nr_rounds)`

This formula assigns elements that do not fit aligned DPU rounds to CPU execution. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 6.5 Special cases: window, filter, reduce, and invalid pipelines

For **window**, neighboring DPU partitions may need lookahead data. DaPPA supports user-provided overlap data appended to the input to keep output length consistent. ([arXiv](https://arxiv.org/pdf/2310.10168))

For **filter**, output length is unpredictable, and MRAM–WRAM transfers still require alignment. DaPPA transfers available output elements after processing each input WRAM block, rounds transfer size up to the nearest valid alignment, and copies the last 8 bytes of the previous WRAM output block into the next one to avoid gaps while appending new valid elements. ([arXiv](https://arxiv.org/pdf/2310.10168))

For **reduce**, DPU/tasklet-local partial results are later combined on the CPU. This makes reduction a pattern-level operation whose lowering spans both DPU execution and host post-processing. ([arXiv](https://arxiv.org/html/2310.10168v2))

For **invalid stage combinations**, DaPPA identifies cases where a filter or reduce result cannot directly feed later stages. Filter outputs lack global retained-element positions at each DPU; reduce outputs are partial until host aggregation. `PipelineFull` detects these cases and partitions execution into multiple sub-pipelines with CPU aggregation between them. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 6.6 Evaluation and assumptions

The evaluation uses six workloads from PrIM: VA, SEL, UNI, RED, GEMV, and HST-S. The default input is 1M 32-bit integer elements per UPMEM core; GEMV uses matrices with 4096 rows and 256 columns per UPMEM core, and HST-S uses 256 bins. The hardware setup is a 2-socket Intel Xeon Silver 4110 host at 2.10 GHz, 128 GB DDR4-2400 memory, and 20 UPMEM DIMMs with 160 GB PIM-capable memory and 2,560 DPUs. The experiment uses 11 tasklets for DaPPA and PrIM and reports averages across 10 runs. ([arXiv](https://arxiv.org/pdf/2310.10168))

The demonstrated cost model is mostly **resource-legality and placement calculation**, not a symbolic latency/energy optimizer. The paper measures real execution time and reports dynamic compilation overheads, but it does not present a backend-agnostic optimization objective or simulator-calibrated analytical cost model. The reported overheads are 1 ms for template substitution, 150 ms for compiling a DPU binary per pipeline, and 1–150 ms for other operations such as element-count calculations. ([arXiv](https://arxiv.org/pdf/2310.10168))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The pattern primitive is the user-visible IR boundary

- **Observation:** DaPPA’s `Pipeline` stage records the pattern kind, kernel function, typed argument roles, overlap/group parameters, and fetch status. That stage object is the most stable named unit across frontend, lowering, and runtime.
- **Why it matters for CIM compiler/IR work:** It shows a useful middle ground between low-level UPMEM APIs and a full compiler IR: a small set of pattern semantics is enough to automate many hardware-specific decisions.
- **Reusable lesson:** A future CIM IR could expose “pattern stages” as a frontend dialect, then lower them into a more auditable memory/resource IR.

### Insight 2 — Memory layout is the hidden compiler contract

- **Observation:** The decisive lowering state is MRAM/WRAM layout: element counts, cache offsets, base offsets, padding, execution rounds, and intermediate vector storage.
- **Why it matters for CIM compiler/IR work:** For near-memory architectures, correctness and performance depend on layout metadata as much as on operator selection. DaPPA’s paper-level semantics become backend-real when mapped to MRAM/WRAM transfer units and alignment constraints.
- **Reusable lesson:** A corpus entry for UPMEM-like work should record whether the stack exposes memory-layout metadata as a first-class inspectable object or embeds it in codegen.

### Insight 3 — Filter is a runtime-state problem, not only a data-parallel primitive

- **Observation:** Filter appears as a simple predicate at the API level, but its UPMEM lowering introduces variable output length, holes after parallel return transfers, 8-byte alignment padding, and CPU compaction.
- **Why it matters for CIM compiler/IR work:** This is a concrete example where a high-level operator requires runtime metadata—retained counts, offsets, and compaction order—to preserve global semantics.
- **Reusable lesson:** Future CIM IRs that handle dynamic sparsity, masks, or filtering should carry compaction state and output-length provenance explicitly.

### Insight 4 — CPU/DPU cooperative execution is a lowering decision

- **Observation:** DaPPA assigns unaligned leftovers and some filter/reduce post-processing to the CPU while DPUs process aligned chunks.
- **Why it matters for CIM compiler/IR work:** The backend contract is not “all computation moves to memory”; it is a partitioned execution plan with host repair, aggregation, or cleanup steps.
- **Reusable lesson:** A CIM IR for real systems should represent host-side continuation work and provenance from DPU partial output to CPU-visible final output.

### Insight 5 — `PipelineFull` is a legality-repair abstraction

- **Observation:** The paper identifies stage combinations that cannot be safely handled in a single pipeline and provides `PipelineFull` to split execution around filter/reduce aggregation barriers.
- **Why it matters for CIM compiler/IR work:** This is a legality rule over intermediate values: certain values are local or partial until a host-side global operation materializes them.
- **Reusable lesson:** A future IR could type intermediate values as “DPU-local,” “globally compacted,” “partial reduction,” or “host-materialized” to make these barriers verifiable.

### Insight 6 — The evaluation exposes where the stack gains performance

- **Observation:** DaPPA’s strongest performance advantage over PrIM appears in SEL and UNI because DaPPA prefers parallel DPU-to-CPU transfer of full output regions followed by CPU compaction, while the PrIM baselines use serial return transfers for variable-sized outputs. ([arXiv](https://arxiv.org/pdf/2310.10168))
- **Why it matters for CIM compiler/IR work:** The performance mechanism is not only better DPU code; it is a different data-return and post-processing schedule.
- **Reusable lesson:** A corpus note should record transfer schedule and host post-processing as compiler decisions, not as peripheral runtime details.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** No DaPPA code repository, scripts, benchmark package, generated-code dump, issue tracker, or release page found in the checked sources. The paper references the public PrIM benchmark suite and the Inja template engine, but those are dependencies/baselines rather than a DaPPA artifact. ([arXiv](https://arxiv.org/html/2310.10168v2))
- **License:** Unknown / not found in the checked sources for DaPPA.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** Not applicable for DaPPA; no public artifact found.
- **What the artifact appears to omit:** Public DaPPA source code, template files, generated UPMEM source, build scripts, reproduction scripts, raw measurement data, and configuration files are not found in the checked sources.
- **Minimal command or workflow, if documented:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. Figures 5–6 and Table 1 are described in the paper, but public reproduction scripts for DaPPA were not found. ([arXiv](https://arxiv.org/pdf/2310.10168))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | The C++ API and examples are described, including `Pipeline`, `stage`, `fetch`, `execute`, and `getLength`. ([arXiv](https://arxiv.org/html/2310.10168v2)) |
| Intermediate representation serialized | **Unknown** | The pipeline exists as program state; no standalone serialized IR is found. |
| Mapping decisions inspectable | **Partial** | MRAM/WRAM, alignment, CPU leftover, and filter/reduce post-processing rules are described in prose and formulas. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Schedule inspectable | **Partial** | Stage order is explicit; exact generated schedule is not publicly inspectable without source/generated files. |
| Hardware config explicit | **Partial** | The evaluated hardware is specified; no reusable hardware config schema is found. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Precision / bit-slice assumptions explicit | **N/A** | DaPPA targets programmable digital DPUs, not bit-sliced analog/DRAM-PUD arithmetic. |
| Cost model inspectable | **Partial** | Resource and alignment calculations are inspectable; no formal latency/energy cost model is presented. |
| Simulator backend documented | **N/A** | The evaluation is real UPMEM hardware, not simulator-backed. |
| Generated code / instruction stream inspectable | **Unknown** | The codegen flow is described, but generated source/binary examples are not found. |
| Provenance from source op to backend action | **Partial** | Pattern stages map to template code and memory/layout actions in the paper narrative. ([arXiv](https://arxiv.org/pdf/2310.10168)) |
| Reproduction scripts available | **Unknown** | No DaPPA artifact found. |
| Calibration source documented | **Partial** | Real-hardware setup and measured timing methodology are described; raw data/scripts are not found. ([arXiv](https://arxiv.org/pdf/2310.10168)) |

### 8.3 Integration helper

- **As frontend:** DaPPA’s pattern vocabulary and `Pipeline` API are useful as a frontend model for vector-oriented UPMEM workloads. Direct reuse would depend on access to source code or reimplementation from the paper.
- **As IR inspiration:** The best IR inspiration is the stage object: pattern kind, function body, argument role, element type size, overlap/group metadata, fetch status, and output-length behavior.
- **As mapper/scheduler:** The MRAM/WRAM element-count calculations, 8-byte alignment handling, CPU leftover split, filter compaction strategy, and reduce host-combination strategy could be adapted for UPMEM-like backends.
- **As cost model:** The work provides placement and resource-legality calculations plus real measured overheads; a future stack could turn these into backend plugins for alignment, transfer granularity, allocation overhead, and host post-processing cost.
- **As backend:** The described UPMEM template backend could be wrapped if implementation files become available; from the public paper alone, reuse would require reconstructing the templates and runtime.
- **As benchmark:** The evaluation mapping of six PrIM workloads to patterns is reusable as a benchmark taxonomy: VA→map, SEL→filter, UNI→window+filter, RED→reduce, GEMV→group plus manual row loop, HST-S→vector-valued reduce. ([arXiv](https://arxiv.org/html/2310.10168v2))
- **As validation source:** The paper provides real-system UPMEM measurements, useful for coarse validation of UPMEM data-transfer and codegen decisions; reproducible calibration would benefit from raw timing logs and scripts.

**Integration effort estimate: High.**  
Integration would be most direct through reimplementing the paper’s `Pipeline`/stage abstraction and MRAM/WRAM layout rules, because no public DaPPA artifact was found. The most valuable reusable boundary appears to be the implicit pipeline-to-template state: stage list, argument list, type-size metadata, memory offsets, and host post-processing plan. A small adapter would not be sufficient without reconstructing the UPMEM templates and runtime behavior.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **SimplePIM** | Productive programming for real UPMEM hardware. | SimplePIM exposes high-level APIs and map/reduce-like execution, but DaPPA claims broader native patterns and more automatic CPU–DPU/DPU communication handling. ([arXiv](https://arxiv.org/abs/2310.01893?utm_source=chatgpt.com)) | Separate “UPMEM programming API” from “UPMEM dynamic codegen and data-movement automation.” |
| **PrIM benchmark suite** | Real UPMEM workloads and baselines. | PrIM is a benchmark suite with hand-tuned implementations; DaPPA uses six PrIM workloads as evaluation targets and compiler-generated alternatives. ([GitHub](https://github.com/CMU-SAFARI/prim-benchmarks?utm_source=chatgpt.com)) | Treat PrIM as benchmark/validation infrastructure, not as an IR stack. |
| **CINM / Cinnamon** | Compiler support for heterogeneous CIM/CNM targets, including UPMEM-like systems. | CINM is MLIR-based and aims at hierarchical abstractions across CIM/CNM devices; DaPPA is narrower and UPMEM-specific, with a pattern API and dynamic templates rather than a public dialect boundary. ([arXiv](https://arxiv.org/abs/2301.07486?utm_source=chatgpt.com)) | Useful contrast between explicit IR stack and target-specific programming framework. |
| **CHOPPER** | Compiler infrastructure for processing-using-memory. | CHOPPER targets programmable bit-serial SIMD PUD in DRAM and emphasizes bit-slicing and virtual code emission; DaPPA targets programmable UPMEM DPUs and emphasizes pattern-level data movement and memory placement. ([shiangjun.com](https://shiangjun.com/pdf/CHOPPER-final.pdf?utm_source=chatgpt.com)) | The first-class rewrite object differs sharply: bit-sliced SIMD code vs UPMEM pattern pipeline/layout state. |
| **Infinity Stream** | Programmer-friendly in-/near-memory lowering. | Infinity Stream uses a two-phase JIT to lower a tDFG to in-memory commands and evaluates on a cycle-accurate simulator; DaPPA lowers C++ pattern pipelines to real UPMEM binaries and evaluates on hardware. ([Arizona State University](https://asu.elsevierpure.com/en/publications/infinity-stream-portable-and-programmer-friendly-in-near-memory-f/?utm_source=chatgpt.com)) | Distinguish stream/DFG portability from hardware-specific UPMEM codegen. |
| **TransPimLib / PyGim** | UPMEM programmability support. | These are described by DaPPA as kernel/library support for narrower scopes such as transcendental functions or graph neural networks; DaPPA positions itself as a broader pattern framework. ([arXiv](https://arxiv.org/html/2310.10168v2)) | In corpus metadata, distinguish kernel libraries from compiler/runtime frameworks. |

## 10. Corpus-ready final takeaway

- DaPPA’s real contribution is a C++ data-parallel pattern frontend plus dynamic template-based code generator for UPMEM PIM systems.
- The strongest reusable stack layer is the pattern-pipeline abstraction: `Pipeline`, stage, pattern kind, typed argument roles, fetch markers, and UPMEM-aware lowering state.
- The evidenced scope is six PrIM workloads on a real UPMEM system with 2,560 DPUs; reported results are 2.1× average end-to-end speedup over PrIM and 94% effective UPMEM LOC reduction. ([arXiv](https://arxiv.org/pdf/2310.10168))
- The first-class CIM objects are digital near-memory objects: DPU, tasklet, MRAM, WRAM, alignment, execution round, intermediate vector, partial reduction, and host post-processing state.
- The hidden IR is the compiler/runtime state between `Pipeline` construction and template population: global stage list, global argument list, type-size metadata, MRAM/WRAM offsets, CPU leftover elements, and filter/reduce aggregation state.
- Artifact status: no public artifact found.
- Integration is most plausible as IR inspiration or a reimplemented UPMEM mapper/backend; direct reuse is constrained by the absence of public DaPPA source and reproduction scripts.
- For value-trajectory IR work, DaPPA is relevant as a digital data-movement trajectory case study, especially for MRAM/WRAM/host materialization and partial-result barriers, rather than analog-CIM value reconstruction.
