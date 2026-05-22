---
slug: polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators
title: "Polyhedral-Based Compilation Framework for In-Memory Neural Network Accelerators"
subtitle: "Scoped CIM stack note"
year: 2021
venue: "ACM Journal on Emerging Technologies in Computing Systems"
authors_or_group: "Jianhui Han, Xiang Fei, Zhaolin Li, Youhui Zhang"
summary: >-
  **Polyhedral-Based Compilation Framework for In-Memory Neural Network Accelerators** presents PolyXB, a source-to-source compiler that uses the polyhedral model to recognize affine C loop nests implementing NN operators and rewrite them into calls or generated schedule regions for memristor-based neural-network accelerators. Its most relevant contribution for CIM compiler/IR research is the shift from single-kernel MV/MM offload toward a narrow vertical flow that also recognizes convolution, pooling, and fused initialization/activation patterns, then optionally forms a pipeline and allocates PE resources across matched operators. The demonstrated stack slice is static C/PET/ISL compilation for dense, affine NN inference kernels, with paper-level evaluation over synthetic kernels and NN benchmarks and case studies for ISAAC- and FPSA-like architectures; the public artifact exposes the compiler, options, tests, and benchmark kernels, while the reusable IR boundary is clearest in the schedule-tree marks, `ast_info` metadata, tiling options, and emitted accelerator API calls. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/))
links:
  paper: https://dl.acm.org/doi/fullHtml/10.1145/3469847
  artifact: https://github.com/Jianhui-Han/polyxb
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "memristor-CIM"
  - "analog-CIM"
workloads:
  - "static NN inference kernels"
  - "MV"
  - "MM"
  - "CONV"
  - "pooling"
  - "fused init/activation kernels"
  - "synthetic kernels"
  - "paper-level NN benchmarks"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A4]
axis_B: [B3, B4, B1]
axis_C_first_class_objects:
  - "schedule_node_marks"
  - "xbblas_operator_calls"
  - "tile_sizes"
  - "PE_count"
  - "PE_allocation"
  - "pipeline_stage"
  - "activation_function_id"
  - "array_view_metadata"
axis_D_rewrite_objects:
  - "loop_nest"
  - "schedule_tree"
  - "source_call_region"
  - "operator_pattern"
  - "hardware_mapping_state"
  - "pipeline_stage_schedule"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/Jianhui-Han/polyxb"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR_inspiration"
  - "mapper_scheduler"
  - "benchmark"
  - "backend_wrapper"
reproducibility_level: medium
notes:
  - "Reusable semantics are distributed across ISL schedule marks, affine access templates, ast_info metadata, and generated C calls."
  - "Public artifact supports source-to-source compiler tests; full paper performance reproduction scripts were not found in the checked repository."
  - "VGG16 and ResNet50 files are present in the benchmark directory but are 0-byte placeholders in the checked GitHub snapshot."
takeaways: []
---

# Polyhedral-Based Compilation Framework for In-Memory Neural Network Accelerators — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework** | The work is centered on detecting affine NN loop kernels, rewriting matched schedule regions into accelerator calls, and allocating PE resources for pipelined execution across matched operators. The paper frames the contribution as automatic detection/mapping plus pipeline generation for memristor-based NN accelerators. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/)) |
| Secondary stack role, Axis A | **A5 Narrow end-to-end co-design**, with limited **A4-like compiler-stack behavior** | It has a source-to-source compiler boundary and case studies for ISAAC/FPSA-style memristor architectures, but the durable interface is C plus inserted calls/marks rather than a separately specified dialect, ISA, or serialized CIM IR. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Middle-layer style, Axis B | **B3 Loop / tensor-schedule IR**, **B4 Hardware-resource IR**, weak **B1 Config-as-IR** | The central middle representation is the polyhedral schedule tree and affine access relations; the artifact also carries PE count, tiling sizes, pipeline stage, PE base, and tiled sizes in compiler options / `ast_info`. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c)) |
| First-class CIM objects, Axis C | Matched NN operator calls, schedule marks, PE count, tile sizes, pipeline stage, PE allocation/base, accelerator API granularity | The artifact names emitted calls such as `xbblas_mv_bare`, `xbblas_mm_bare`, `xbblas_mm_act`, `xbblas_conv_bare`, `xbblas_conv_act`, and `xbblas_pooling`, and exposes options for tiling, PE count, pipeline generation, and coarse/conv modes. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c)) |
| Rewrite object, Axis D | **Loop nest / schedule tree / source call region / mapping state** | The compiler maps bottom-up over schedule nodes, matches operator-shaped subtrees, inserts marks, and then builds user AST nodes / generated function calls. Pipeline generation cuts a matched subtree and inserts a generated pipeline mark. ([GitHub](https://github.com/Jianhui-Han/polyxb/blob/main/src/tactics.c)) |
| Best corpus tags | `compiler-mapping`, `polyhedral`, `source-to-source`, `loop-pattern-detection`, `memristor-CIM`, `analog-CIM`, `DNN-inference`, `pipeline-generation`, `PE-allocation`, `C-artifact` | Tags reflect the evidenced interface: C/PET/ISL source-to-source compilation, affine loop recognition, emitted accelerator calls, and memristor NN accelerator case studies. |
| Closest comparison baselines | TC-CIM, TDO-CIM, PUMA, FPSA, IBM CM compiler prototype | TC-CIM/TDO-CIM are closest because they also use polyhedral/Loop Tactics-style detection for CIM offload; PUMA is close as a memristor compiler stack but targets an ISA/compiler backend; FPSA is close as a ReRAM NN stack with mapper/router; IBM CM compiler is close for pipeline/dataflow control across computational-memory cores. ([Google Cloud Storage](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/f46e2a0c228e6f651d12ecb65985b53634568a3b.pdf?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

**Polyhedral-Based Compilation Framework for In-Memory Neural Network Accelerators** presents PolyXB, a source-to-source compiler that uses the polyhedral model to recognize affine C loop nests implementing NN operators and rewrite them into calls or generated schedule regions for memristor-based neural-network accelerators. Its most relevant contribution for CIM compiler/IR research is the shift from single-kernel MV/MM offload toward a narrow vertical flow that also recognizes convolution, pooling, and fused initialization/activation patterns, then optionally forms a pipeline and allocates PE resources across matched operators. The demonstrated stack slice is static C/PET/ISL compilation for dense, affine NN inference kernels, with paper-level evaluation over synthetic kernels and NN benchmarks and case studies for ISAAC- and FPSA-like architectures; the public artifact exposes the compiler, options, tests, and benchmark kernels, while the reusable IR boundary is clearest in the schedule-tree marks, `ast_info` metadata, tiling options, and emitted accelerator API calls. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| A source-to-source framework automatically detects and maps multiple NN operators onto memristor-based accelerators. | Abstract / introduction / contribution list. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/)) | Paper claim + code/artifact | The artifact implements matchers for MV, MM, convolution, pooling, and MM/CONV fused with init/activation; these are applied as bottom-up schedule-tree passes. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c)) | Demonstrated for static affine C SCoPs whose loop and access structure match the compiler’s expected schedule/access templates. The reusable boundary is clearest at schedule marks and emitted `xbblas_*` calls. |
| The framework extends prior MV/MM-centric polyhedral CIM offload to CONV and fused operators. | Introduction contrasts TC-CIM/TDO-CIM with CONV, activation, and fused-operator support. ([dl.acm.org](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) | Algorithm/code | `match_conv_bare`, `match_conv_init`, `match_conv_act`, `match_conv_init_act`, `match_mm_act`, and `match_mm_init_act` are explicit code paths; the pass order prioritizes fused CONV before simpler CONV, then pooling, then fused/simple MM and MV. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c)) | Evidence supports pattern recognition and call generation for template-like affine loop nests. General graph-level operator import from ONNX/PyTorch is outside the evidenced artifact boundary. |
| The framework supports pipeline generation and resource allocation across operators. | Abstract / introduction / contribution list. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/)) | Algorithm/code | The artifact has `-p` pipeline generation and `-n` PE count options; `do_allocate` allocates PE resources among matched nodes and records `is_pipe`, `n_stage`, `n_pes`, and `a_base` into `ast_info`. ([GitHub](https://github.com/Jianhui-Han/polyxb)) | Demonstrated scope is static pipelines over matched operators. The artifact exposes the heuristic state in code, but not a standalone serialized pipeline IR or schedule report. |
| Different invocation granularities are supported, including coarse-grained invocation for integration with native accelerator toolchains. | Introduction / contributions. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) | Paper claim + artifact options | The public README exposes `-c enable coarse-grained generation`; code also switches CONV between `xbblas_conv_*` and MM-like calls depending on `en_conv`. ([GitHub](https://github.com/Jianhui-Han/polyxb)) | Paper-level evidence supports the intended coarse/fine API split. Artifact-level confirmation is visible in options and call selection; complete native toolchain integration scripts were not found in the checked repository. |
| Evaluation shows reliable detection/mapping and order-of-magnitude pipeline benefit versus non-pipelined polyhedral frameworks. | Abstract / CRAFT page / ACM crawled abstract. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/)) | Experiment, paper-only for numeric details; code/artifact for runnable tests | Public artifact includes synthetic kernels and a test Makefile that compares generated output against original C output for MV/MM/CONV/pooling/MLP-style examples. ([GitHub](https://github.com/Jianhui-Han/polyxb/tree/main/benchmarks)) | The paper-level claim covers synthetic and NN benchmarks plus ISAAC/FPSA case studies. The current public artifact gives regression-style functional tests; figure/table reproduction scripts for the reported speedups were not found in the checked repository. |

## 4. Stack anatomy

```text
Input / frontend:
  C source containing affine SCoP regions, parsed through PET and ISL.
  Object type: C loop nest / SCoP. Inspectable as source; not a neural-network graph import format.
  Reusable: yes for C/PET affine kernels; less direct for framework-level NN graphs.

Middle representation:
  Polyhedral schedule tree, domains, access relations, and schedule-node marks.
  Object type: loop/tensor schedule IR internal to ISL.
  Serialized: printed to stderr by the compiler for “Original schedule” and “Schedule after tactics,” but not emitted as a reusable corpus artifact by default. The main transform path copies the PET schedule, intersects it with the domain, applies tactics, and prints with the modified schedule. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/polyxb.c))

Mapping or scheduling state:
  `ast_info` metadata attached to ISL mark IDs: dimensions, ranges, tiled sizes, leading dimensions, activation function ID, pipeline flag, stage number, PE count, and PE base.
  Object type: internal C struct / mark payload.
  Serialized: no standalone schema found; inspectable in code. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/info.h))

Hardware abstraction:
  PE-count and tile-size abstraction, plus accelerator API call names such as `xbblas_mv_bare`, `xbblas_mm_bare`, `xbblas_mm_act`, `xbblas_conv_bare`, `xbblas_conv_act`, `xbblas_pooling`, load/store calls for convolution/pooling, and `fence()`.
  Object type: API-level accelerator template, not detailed circuit/ISA state.
  Reusable: usable as a wrapper boundary if a backend provides these functions.

Backend / simulator / codegen:
  Source-to-source C code generation through ISL AST printing, with generated user AST nodes replacing matched marks.
  Object type: C output with calls and generated loops.
  Artifact documentation states `./polyxb -t benchmarks/mv.c` produces `mv.polyxb.c`. ([GitHub](https://github.com/Jianhui-Han/polyxb))

Output artifact:
  Generated C source.
  Object type: source code with accelerator calls / helper allocation and load/store calls.
  Inspectable: yes after running compiler; examples of generated outputs are not pre-committed in the checked repository.

Evaluation loop:
  Paper-level evaluation: synthetic kernels and NN benchmarks, plus ISAAC/FPSA case studies. Public artifact-level loop: compile benchmark, compile generated C with test harness, compare generated output with original output via `diff`. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of ISL schedule-tree structure, affine access equality templates, schedule marks named after accelerator calls, `ast_info` payloads, and command-line options for tiling, PE count, pipeline, and conv/coarse generation. The paper foregrounds the polyhedral model as the compiler substrate; the reusable semantics are most visible in the artifact’s matcher order, mark names, and `ast_info` fields rather than in a separately documented IR file or dialect. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
PolyXB owns the stack slice from affine C loop nests to accelerator-oriented source calls. The central decisions are whether a loop region is an MV/MM/CONV/pooling/fused operator, how it is tiled, whether it participates in a pipeline, and how many PEs / which PE base are assigned to a stage. This places it most naturally in mapping and scheduling rather than macro generation or circuit simulation.

**Secondary: A5 Narrow end-to-end co-design.**  
The paper relates the compiler to memristor NN accelerators and evaluates case-study settings inspired by ISAAC and FPSA. The abstraction boundary remains narrow: fixed operator templates and API calls over a memristor-CIM PE model, rather than a general-purpose co-design stack for arbitrary CIM devices.

**Limited A4-like behavior.**  
The compiler has explicit pass order and code-generation calls, but the work does not define a durable external IR, dialect, instruction schema, or serialized mapping format. The A4-like aspect is therefore “compiler stack with internal IR,” not “explicit CIM IR/ISA stack.”

### 5.2 Axis B — middle-layer style

**B3 Loop / tensor-schedule IR — primary.**  
The named middle representation is the polyhedral schedule tree plus affine access functions. Decisions made there include loop-pattern recognition, schedule-node marking, and substitution of matched subtrees with accelerator calls. The pass order in `tactics.c` is explicit: CONV fused patterns first, then CONV, pooling, MM fused/simple, MV init/simple, then optional pipeline construction and final build. ([GitHub](https://github.com/Jianhui-Han/polyxb/blob/main/src/tactics.c))

**B4 Hardware-resource IR — secondary.**  
The hardware-resource state is not a standalone IR, but it is concrete: `num_pes`, tile sizes, `is_pipe`, `n_pes`, `a_base`, and `n_stage`. Decisions include PE partitioning across stages and spatial mapping within the generated call arguments. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/info.h))

**B1 Config-as-IR — weak.**  
The command line exposes hardware/workload-mapping choices: `-t`, `-M`, `-N`, `-K`, `-p`, `-n`, and `-c`. These options partially function as an external configuration boundary, but they do not form a complete hardware schema or backend contract. ([GitHub](https://github.com/Jianhui-Han/polyxb))

A single artifact that upstream passes could read, verify, and rewrite was **not found in the checked sources**. The closest candidates are the generated C source and the compiler’s printed ISL schedules.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / implicit** | The paper background describes memristor crossbars, wordlines/bitlines, DACs/ADCs, and shift-add reconstruction, but the compiler artifact’s explicit hardware object is a PE count and accelerator call interface rather than crossbar hierarchy. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Bit-slicing / bit significance | **Implicit / paper-background only** | The paper discusses multi-cell representation of high-precision weights and ISAAC’s 2-bit-per-cell example in background; no bit-slice object or type field is exposed in the artifact’s options or `ast_info`. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| ADC/DAC precision or sensing | **Implicit / paper-background only** | DAC/ADC appear in the memristor architecture description; compiler-level precision fields or sensing modes were not found in the checked artifact. ([dl.acm.org](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Analog-to-digital or domain transition | **Implicit** | The architecture background includes digital-to-analog input conversion and analog-to-digital output conversion; generated calls abstract this transition behind API names. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Peripheral circuits as path nodes | **Implicit / costed in paper case studies, not artifact-visible as nodes** | The paper motivates activation units and fused operators near MM/CONV units; the artifact records activation as a function ID and emits fused call variants, but not peripheral-circuit path nodes. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Partial-sum accumulation path | **Implicit** | MAC patterns are detected through affine access relations and reductions; the analog partial-sum path is hidden behind matched MV/MM/CONV calls. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/access.c)) |
| Reconstruction / shift-add tree | **Implicit / background** | Shift-and-add is described for memristor precision reconstruction, but no reconstruction-tree object is exposed in the artifact. ([dl.acm.org](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Runtime state, masks, KV cache, batching, sparsity | **Batch/layer pipeline state only; others not applicable or unknown** | Pipeline stage and PE allocation are first-class internally; masks/KV cache/sparsity are outside the demonstrated static CNN/MLP-style inference scope. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/info.h)) |
| Value trajectory / flow path | **Approximated by operator order and pipeline stage** | The nearest representation is a generated pipeline over matched stages with guarded stage execution and `fence()`, not a value-identity trajectory across analog/digital resources. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/build.c)) |

### 5.4 Axis D — rewrite object

The compiler rewrites **loop nests and schedule-tree subregions** into **accelerator API calls** plus optional **pipeline stage structure**. It also rewrites some CONV cases into either CONV primitive calls or MM-like calls depending on the `en_conv` option.

Legal transformations include:

- Recognizing affine MAC access relations as MV/MM/CONV/pooling.
- Recognizing fused init and/or activation patterns around the MAC body.
- Marking matched schedule regions with accelerator call names.
- Tiling matched operators according to `-M`, `-N`, and `-K`.
- Assigning PEs and stage metadata for pipeline generation.
- Emitting load/store wrapper calls for CONV/pooling data reshaping.

Equivalences exploited include affine access equality, commutation of MAC operands in matcher code, equivalence between some CONV shapes and MM-like lowering when CONV primitive mode is disabled, and fused init/activation recognition when access relations align with the MAC result.

Information preserved across lowering includes array base addresses, leading dimensions, operator extents, tile sizes, activation function ID, initialization guard, pipeline stage, and PE mapping base. The representation is especially well suited to recognizing dense affine loop kernels and replacing them with backend calls; expressing bit-serial execution, ADC retiming, analog partial-sum lifetime, or alternative peripheral routing would likely require an added trajectory/resource-path abstraction beyond schedule marks and `ast_info`.

## 6. Technical mechanism reading

### 6.1 Operator recognition as schedule-shape plus affine-access equality

The compiler’s core pattern recognition combines schedule-tree structure with affine access templates. In `match.c`, each matcher first checks a schedule-node shape such as `b-b-l`, `b-b-b-l`, or longer sequence/filter/band structures for fused cases, then checks statement type and access relation. For example, MV and MM matchers look for MAC statements and call `access_is_mv` or `access_is_mm`; fused variants additionally check initialization and activation statements and insert marks such as `xbblas_mm_act`. CONV and pooling have separate matchers and can insert CONV/pooling call marks. ([raw.githubusercontent.com](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c?utm_source=chatgpt.com))

The access templates in `access.c` make the compiler’s semantics auditable. MV, MM, CONV, and pooling are described by affine maps such as `[i,j] -> [(i),(j)]`, `[i,j,k] -> [(i),(k)]`, and CONV-style maps involving stride expressions like `k*stride+p`. This is the paper’s most concrete IR-like contract: an operator is a recognizable affine relation between loop iterators and array references. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/access.c))

### 6.2 Pass ordering encodes fusion priority

The pass sequence in `tactics.c` runs fused CONV initialization+activation before simpler CONV forms, then pooling, then fused/simple MM, then MV. This order matters because a larger fused region should be captured before its inner MAC is consumed by a simpler matcher. From an IR-design perspective, the fusion policy is embedded in pass order rather than represented as a declarative rewrite lattice. ([GitHub](https://github.com/Jianhui-Han/polyxb/blob/main/src/tactics.c))

### 6.3 Internal mapping state: `ast_info`

`ast_info` is the hidden mapping record. It holds whether the match is CONV or pooling, whether it has initialization or activation, the activation function ID, input/output dimensions, ranges, tiled sizes, leading dimensions, array metadata, and pipeline fields (`is_pipe`, `n_pes`, `a_base`, `n_stage`). This is the closest artifact-level object to a CIM mapping IR. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/info.h))

### 6.4 Code generation

`build.c` constructs generated AST nodes for marked schedule regions. It builds call argument lists, creates address expressions for arrays, emits CONV/pooling load/store wrapper calls, and emits tiled loops around accelerator calls when tiling is enabled. It also has a `build_pipeline_node` path that emits a top-level loop over pipeline time, guards each stage by stage index, and appends `fence()`. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/build.c))

### 6.5 Pipeline and PE allocation

The paper claims pipeline generation over the NN workload, and the artifact provides `-p` and `-n` options for pipeline and PE count. The code path `do_allocate` allocates PE resources among matched nodes and stores stage/base/PE-count information back into `ast_info`; the README documents `-p enable pipeline generation` and `-n number of PEs`. ([GitHub](https://github.com/Jianhui-Han/polyxb))

The checked artifact supports a practical compiler heuristic rather than an externally specified optimization problem. It derives per-operator quantities such as number of tiles, reuse, degree, latency, maximum, and a PE budget; the objective is visible as balancing pipeline resource allocation in C code, but a serialized cost-model file or independent equation schema was not found. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/pipeline.c))

### 6.6 Hardware and precision assumptions

The paper’s hardware model is memristor/ReRAM-style analog CIM: crossbar dot products accumulate current along bitlines, inputs are converted through DACs, outputs through ADCs, and multi-cell/shift-add reconstruction handles limited conductance precision. These objects are important for the paper’s architectural motivation, but PolyXB’s public compiler artifact abstracts them behind coarse PE and API-call boundaries rather than making precision, ADC/DAC, or bit-slice state a typed compiler object. ([dl.acm.org](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com))

### 6.7 Workload and backend assumptions

The demonstrated compiler frontend is C with SCoP regions; the example benchmark `mv.c` uses `#pragma scop` / `#pragma endscop` around a regular affine MV loop. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/benchmarks/mv.c)) The public benchmark directory contains MV/MM/CONV/pooling/fused examples plus `mlp-*`, `conv2`, and placeholder VGG16/ResNet50 files, but the current GitHub snapshot shows `vgg16.c` and `resnet50.c` as 0-byte files. ([GitHub](https://github.com/Jianhui-Han/polyxb/tree/main/benchmarks))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Affine access templates are the real operator contract

- **Observation:** The compiler does not need a neural-network graph IR to identify MV/MM/CONV/pooling. It identifies operators through affine access relations and schedule-tree shape.
- **Why it matters for CIM compiler/IR work:** This shows a low-level route for recovering domain operators from C loops when graph metadata is unavailable.
- **Reusable lesson:** A future CIM IR could preserve both graph-level operator identity and affine-access witnesses, allowing verification that an offloaded operator corresponds to a legal loop region.

### Insight 2 — Fusion priority is encoded procedurally

- **Observation:** Fused CONV/MM patterns are tried before simpler operators in the pass list.
- **Why it matters for CIM compiler/IR work:** Fusion legality and priority are part of the compiler semantics even when no explicit fusion IR exists.
- **Reusable lesson:** A future stack could make this priority inspectable as a rewrite rule set: “prefer fused init+activation over bare MAC when access/result maps match.”

### Insight 3 — `ast_info` is a compact hidden mapping IR

- **Observation:** The struct carries operator type, dimensional metadata, tile sizes, activation, leading dimensions, array identities, and pipeline placement.
- **Why it matters for CIM compiler/IR work:** These fields are exactly the sort of metadata a backend needs after pattern detection and before code generation.
- **Reusable lesson:** A future CIM IR could lift `ast_info` into a serialized operator-mapping record with typed fields for extents, memory views, tile shape, stage, PE allocation, and backend call target.

### Insight 4 — Pipeline generation treats matched operators as stages, not as value trajectories

- **Observation:** The generated pipeline loop controls stage timing and PE allocation but does not expose analog partial sums, sensing, reconstruction, or storage transitions as named values.
- **Why it matters for CIM compiler/IR work:** This is a useful middle point between single-operator offload and full trajectory IR: it captures inter-operator scheduling without modeling all intra-operator physical paths.
- **Reusable lesson:** A value-trajectory IR could reuse PolyXB’s stage/resource abstraction and add per-stage value types for domain, precision, and reconstruction state.

### Insight 5 — The artifact’s test harness validates semantic equivalence at the C-output boundary

- **Observation:** Tests compile original and generated C and compare outputs, rather than exposing internal proof objects or mapping traces.
- **Why it matters for CIM compiler/IR work:** For source-to-source CIM compilers, differential execution is a practical first audit layer.
- **Reusable lesson:** Future corpus artifacts should keep this style of end-to-end output comparison while also emitting a mapping manifest from source loop to accelerator action.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL / identifier:** `https://github.com/Jianhui-Han/polyxb`
- **License:** MIT License. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/LICENSE))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** C source for the compiler, a customized `isl-polyxb` submodule entry, benchmark kernels, tests, Makefile, and README build/run instructions. The repo lists `benchmarks`, `src`, `test`, `.gitmodules`, `LICENSE`, `Makefile`, and `README.md`. ([GitHub](https://github.com/Jianhui-Han/polyxb))
- **What the artifact appears to omit:** Pre-generated paper figures/tables, full simulator integration scripts for ISAAC/FPSA case-study reproduction, release packages, and populated VGG16/ResNet50 benchmark sources in the current GitHub snapshot. GitHub shows no releases, and the VGG16/ResNet50 files are 0 bytes. ([GitHub](https://github.com/Jianhui-Han/polyxb))
- **Minimal documented workflow:** initialize the `isl-polyxb` submodule, build LLVM 9.x, build customized ISL, build PET against that ISL, edit prefixes in the Makefile, run `make`, then run `./polyxb -t benchmarks/mv.c`; tests are documented with `cd test; make`. ([GitHub](https://github.com/Jianhui-Han/polyxb))
- **Whether paper figures appear reproducible from artifact:** Unknown / not found in the checked sources. The artifact supports compiler-output functional tests, but figure/table reproduction scripts for the paper’s reported performance claims were not found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | README documents C input to `polyxb`; examples use SCoP pragmas. A full input-language spec was not found. ([GitHub](https://github.com/Jianhui-Han/polyxb)) |
| Intermediate representation serialized | **Partial** | ISL schedules are printed during compilation, but no stable external IR schema was found. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/polyxb.c)) |
| Mapping decisions inspectable | **Partial** | Matchers and mark names are inspectable in code; generated mapping manifests were not found. ([raw.githubusercontent.com](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/match.c?utm_source=chatgpt.com)) |
| Schedule inspectable | **Partial** | Original and post-tactics schedules are printed to stderr by the compiler path. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/polyxb.c)) |
| Hardware config explicit | **Partial** | PE count and tile sizes are explicit options; crossbar/ADC/DAC hierarchy is abstracted. ([GitHub](https://github.com/Jianhui-Han/polyxb)) |
| Precision / bit-slice assumptions explicit | **Partial** | Paper background discusses multi-cell precision and shift-add; compiler artifact does not expose precision fields. ([dl.acm.org](https://dl.acm.org/doi/fullHtml/10.1145/3469847?utm_source=chatgpt.com)) |
| Cost model inspectable | **Partial** | Pipeline allocation logic is in code; no standalone cost-model file was found. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/src/pipeline.c)) |
| Simulator backend documented | **Partial** | Paper case studies mention ISAAC/FPSA; public repository checked here centers on source-to-source compiler and tests. ([CRAFT Lab](https://craft.cs.tsinghua.edu.cn/publication/polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators/)) |
| Generated code / instruction stream inspectable | **Yes for generated C / N/A for ISA** | Output C file is generated by command; no instruction stream ISA is emitted. ([GitHub](https://github.com/Jianhui-Han/polyxb)) |
| Provenance from source op to backend action | **Partial** | Source-to-call provenance can be inferred from matchers and output C; no separate provenance report found. |
| Reproduction scripts available | **Partial** | Test Makefile exists for functional comparison; paper performance reproduction scripts were not found. ([GitHub](https://raw.githubusercontent.com/Jianhui-Han/polyxb/main/test/Makefile)) |
| Calibration source documented | **Unknown / not found** | No SPICE/RTL/chip calibration package found in the checked artifact. |

### 8.3 Integration helper

- **As frontend:** Reusable for C/PET affine kernels with SCoP-style regions. Integration into graph-first ML compilers would need an importer that lowers operators to recognized affine C/ISL patterns or directly populates equivalent access maps.
- **As IR inspiration:** Strongest reusable abstraction is the combination of schedule mark name + `ast_info` metadata: operator kind, array views, extents, tiling, activation, and pipeline placement.
- **As mapper/scheduler:** The matcher library and pipeline PE-allocation heuristic could be adapted as a schedule-level offload pass for dense static NN inference kernels.
- **As cost model:** The paper’s resource/pipeline framing and artifact’s PE allocation code can seed a backend plugin, but reuse would benefit from extracting formulas and hardware constants into explicit config files.
- **As backend:** The generated C API-call boundary is wrapper-friendly if a future backend implements `xbblas_*`, `conv_load_data`, `conv_store_data`, `pool_load_data`, `pool_store_data`, and `fence`.
- **As benchmark:** The synthetic kernels and test harness are useful for testing pattern recognition. The current public VGG16/ResNet50 placeholders should be treated as artifact metadata rather than runnable NN benchmarks.
- **As validation source:** Functional output comparison is available. Hardware-measurement or simulator-calibration reuse is unknown / not found in the checked repository.

**Integration effort estimate: Medium.** Integration would be most direct through the generated C-call boundary or by reusing the matcher logic inside another ISL-based compiler. Effort rises if the target stack expects graph IR, MLIR dialects, serialized mapping manifests, or explicit analog precision/resource-path objects, because those concepts are currently distributed across C structs, pass order, and generated calls.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **TC-CIM** | Polyhedral/Loop Tactics-style recognition of ML tensor operations for memristor CIM offload. ([Google Cloud Storage](https://storage.googleapis.com/gweb-research2023-media/pubtools/pdf/f46e2a0c228e6f651d12ecb65985b53634568a3b.pdf?utm_source=chatgpt.com)) | TC-CIM is closer to Tensor Comprehensions and fixed-function block offload; PolyXB extends the detected operator set and adds whole-workload pipeline/resource allocation claims. | Place PolyXB as a successor-style loop-pattern compiler focused on broader NN operator detection and pipeline generation. |
| **TDO-CIM** | Transparent detection/offload using LLVM/Polly/Loop Tactics for computation-in-memory. ([TU/e Research Portal](https://research.tue.nl/en/publications/tdo-cim-transparent-detection-and-offloading-for-computation-in-m/?utm_source=chatgpt.com)) | TDO-CIM targets lower-level transparent offload and PolyBench-style evaluation; PolyXB focuses on NN operator templates, CONV/fusion, and pipeline generation across operators. | Useful distinction: transparent low-level CIM offload vs NN-specific polyhedral mapping framework. |
| **PUMA** | Memristor-based ML inference compiler stack. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) | PUMA exposes a specialized ISA and compiles graph workloads to instruction scheduling/register allocation across spatial cores; PolyXB emits source-level API calls from affine C regions. | Corpus should separate instruction/ISA-first stacks from source-to-source loop-rewrite stacks. |
| **FPSA** | ReRAM NN accelerator stack with software mapping and placement/routing. ([arXiv](https://arxiv.org/abs/1901.09904?utm_source=chatgpt.com)) | FPSA is a full architecture/software stack with neural synthesizer, temporal-to-spatial mapper, and placement/routing; PolyXB is a compiler framework that can target FPSA-like invocation granularity. | FPSA is a backend/hardware-stack comparator; PolyXB is a frontend/mapping layer that could wrap such backends. |
| **IBM computational-memory NN compiler prototype** | Pipeline/dataflow execution across computational-memory cores. ([arXiv](https://arxiv.org/pdf/2003.04293?utm_source=chatgpt.com)) | IBM’s work emphasizes control logic for data dependencies in a CM dataflow accelerator; PolyXB emphasizes loop-kernel detection and source-to-source rewriting for memristor NN accelerators. | Both are relevant to pipeline IR; PolyXB contributes operator recovery, while IBM-style work contributes control/dataflow interface ideas. |

## 10. Corpus-ready final takeaway

- PolyXB is best classified as a **polyhedral CIM mapping/scheduling compiler**, not as a circuit generator, simulator, or explicit ISA stack.
- Its strongest reusable layer is the **loop/schedule matcher** that converts affine NN kernels into accelerator API calls.
- The evidenced operator scope includes MV, MM, CONV, pooling, and fused init/activation variants in the public code.
- The most concrete first-class objects are **operator marks, call names, tile sizes, PE counts, pipeline stage IDs, and PE base assignments**.
- Crossbar, DAC/ADC, bit slicing, and shift-add reconstruction are important architectural assumptions, but they remain mostly behind the API boundary.
- The public artifact is available under MIT and supports building/running PolyXB tests, while full paper-figure reproduction scripts were not found in the checked repository.
- Integration is most direct as a **frontend/matcher or source-to-source backend wrapper** for static affine NN inference kernels.
- For value-trajectory IR work, PolyXB is a useful stage/operator-recovery precedent; trajectory-level rewrites would add explicit value path, domain, precision, and reconstruction metadata.
