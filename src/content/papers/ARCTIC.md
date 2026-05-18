---
slug: arctic
title: "ARCTIC: Agile and Robust Compute-In-Memory Compiler with Parameterized INT/FP Precision and Built-In Self Test"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "DATE 2024"
authors_or_group: "Hongyi Zhang, Haozhe Zhu, Siqi He, Mengjie Li, Chengchen Wang, Xiankui Xiong, Haidong Tian, Xiaoyang Zeng, Chixiao Chen"
summary: >-
  **ARCTIC: Agile and Robust Compute-In-Memory Compiler with Parameterized INT/FP Precision and Built-In Self Test** is best read as a physical digital-CIM macro compiler for SRAM-based DCIM. Its main contribution is a parameterized macro-generation flow that accepts hardware-level specifications—timing and area constraints, memory depth and width, mantissa width, exponent width, exponent offset, and INT/FP format—and produces low-level RTL, MarchCIM BIST logic, and placed-and-routed 28 nm macro layouts through commercial EDA flows. The paper strengthens the lower hardware-generation layer of the CIM stack, especially precision-specialized INT/FP macro construction and DCIM-aware BIST, rather than the model-frontend or tensor-mapping layer. For CIM compiler/IR research, ARCTIC is useful as evidence that numeric-format fields, mantissa/exponent placement, BIST test modes, and physical macro hierarchy are important first-class backend objects, even though the paper foregrounds a template/EDA flow rather than a standalone auditable IR. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))
links:
  paper:
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "Macro-level INT/FP MAC evaluation"
  - "No DNN graph-level workload found in checked sources"
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A5]
axis_B: [B1, B4, B6]
axis_C_first_class_objects:
  - "SRAM memory array"
  - "8T memory cell"
  - "read-out compute logic"
  - "adder tree"
  - "comparator tree"
  - "mantissa array"
  - "exponent array"
  - "shared exponent"
  - "normalization module"
  - "sub-array partitioning"
  - "clock gating"
  - "MarchCIM BIST controller/counter/decoder/comparator"
  - "BIST test vectors and masks"
axis_D_rewrite_objects:
  - "numeric format"
  - "macro topology"
  - "hardware mapping"
  - "memory layout"
  - "BIST/test-vector flow"
  - "EDA flow sequence"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown"
  last_checked: "2026-05-19"
integration_roles:
  - "IR inspiration"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best viewed as a precision-parameterized physical DCIM macro generator."
  - "Most useful IR ingredients are precision fields, mantissa/exponent placement, normalization path, and MarchCIM BIST state."
  - "The paper evidences macro-level PPA and BIST overhead, not model-frontend compilation or tensor-to-array scheduling."
  - "Artifact URL spot-check on 2026-05-19 found the DATE paper PDF but no public implementation link."
takeaways: []
---

# ARCTIC — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A1 — Macro / circuit generator** | ARCTIC’s owned stack slice is a parameterized SRAM-based **digital CIM macro generation flow**: user specs drive cell characterization, RTL generation, BIST insertion, synthesis, place-and-route, DRC/LVS, post-layout simulation, and PPA feedback. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design** | It spans from macro-level hardware parameters to placed-and-routed macro layouts, but the demonstrated end-to-end scope is macro generation rather than DNN graph compilation or runtime execution. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR** | The paper’s middle representation is clearest as a structured hardware configuration: timing/area constraints, memory depth/width, mantissa width, exponent width, exponent offset, precision format, and template-selected macro resources. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| First-class CIM objects, Axis C | **SRAM memory array, read-out compute logic, adder/comparator tree, mantissa/exponent arrays, shared exponent, normalization module, sub-array partitioning, BIST controller/counter/decoder/comparator/test vectors** | These objects are named directly in the macro topology and BIST sections; they are represented as hardware-generation and verification objects rather than as a reusable compiler IR. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Rewrite object, Axis D | **Numeric format, macro topology, array/memory layout, BIST/test-vector flow, EDA flow sequence** | Transformations occur by specializing templates and backend constraints: INT/FP precision selection, mantissa/exponent organization, bit-line division, sub-array clock gating, adder-tree sharing, common-exponent placement, and BIST insertion. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `macro-compiler`, `RTL-generation`, `physical-design-flow`, `INT-FP-precision`, `floating-point-CIM`, `BIST`, `DFT`, `MarchCIM` | Tags reflect the demonstrated macro-generator and DFT focus. |
| Closest comparison baselines | **AutoDCIM, ALPINE, SynDCIM, CiMLoop, CIMFlow, OpenACM/OpenACMv2** | AutoDCIM and ALPINE are prior DCIM macro compilers cited by ARCTIC; SynDCIM is a later performance-aware DCIM macro compiler; CiMLoop and CIMFlow are broader modeling/stack frameworks with explicit artifacts; OpenACM is a later open-source macro-generation flow. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |

## 2. One-paragraph public summary

**ARCTIC: Agile and Robust Compute-In-Memory Compiler with Parameterized INT/FP Precision and Built-In Self Test** is best read as a physical digital-CIM macro compiler for SRAM-based DCIM. Its main contribution is a parameterized macro-generation flow that accepts hardware-level specifications—timing and area constraints, memory depth and width, mantissa width, exponent width, exponent offset, and INT/FP format—and produces low-level RTL, MarchCIM BIST logic, and placed-and-routed 28 nm macro layouts through commercial EDA flows. The paper strengthens the lower hardware-generation layer of the CIM stack, especially precision-specialized INT/FP macro construction and DCIM-aware BIST, rather than the model-frontend or tensor-mapping layer. For CIM compiler/IR research, ARCTIC is useful as evidence that numeric-format fields, mantissa/exponent placement, BIST test modes, and physical macro hierarchy are important first-class backend objects, even though the paper foregrounds a template/EDA flow rather than a standalone auditable IR. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| ARCTIC is an agile and robust SRAM-based DCIM compiler with INT/FP precision parameterization and BIST support. | Abstract and introduction contributions. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Paper-only + experiment | The paper describes a compiler flow that customizes DCIM structures for different precision formats and sizes and generates BIST-equipped macro layouts. | Demonstrated at the macro-hardware level; the reusable boundary is clearest at hardware configuration → RTL/BIST/layout, not DNN graph → accelerator execution. |
| The compiler supports flexible precision formats, including INT1–32, FP8/16/32, BF16, and diverse memory widths/depths. | Contribution list. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Paper-only + experiments | Evaluation reports generated DCIM macros for several INT/FP formats, including INT16, INT8, INT4, FP16, BF16, and FP8(E5M2). ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | The broad precision range is stated by the authors; the paper’s table evidences selected formats rather than an independently runnable generator. |
| ARCTIC uses adaptive topology and layout optimization for variable precision formats. | Abstract; Section III-B; Figures 5–6. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Paper-only + layout figures | The paper describes parameterized memory arrays, adder/comparator trees, latch+AND read-out compute, shared-exponent FP customization, bit-line division, sub-array clock gating, adder-tree sharing, and exponent-bit placement in the middle of the mantissa array. | Evidence supports macro-template specialization and physical-placement choices; a general mapping optimizer or serialized placement IR is not shown in the checked sources. |
| MarchCIM BIST supports both SRAM memory array and DCIM computing logic cells with low complexity. | Contribution list and Section III-C. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Algorithm / paper-only + experiment | The paper defines a March-X-derived DCIM test approach with memory/logic selection, mode selection, row/column addressing, masking of non-tested mantissa/exponent cells, and comparison logic. It reports BIST area overhead below 4% across evaluated formats. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Demonstrated as paper-level BIST architecture and area/power results; artifact-level confirmation of generated BIST RTL was not found. |
| Generated macros are competitive with state-of-the-art handcrafted DCIM macros. | Evaluation Section IV-B and Table III. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Experiment | The paper reports 28 nm, 0.9 V, 200 MHz experiments and compares energy efficiency for INT4, INT8, and BF16 against several handcrafted DCIM works. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | The comparison is macro-level and post-layout/simulation-backed as described; it is not an end-to-end neural-network throughput or accuracy study. |
| ARCTIC provides feedback from post-simulation to optimize synthesis and place-and-route constraints. | Section III-A and Figure 4. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | Flow description | The flow includes DRC/LVS, post-layout simulation, timing checks, power analysis, and feedback to synthesis and place-and-route constraints. | The paper evidences a physical-design loop; the search policy, data schema, and stopping criteria are not documented as a reusable public artifact. |

## 4. Stack anatomy

```text
Input / frontend:
  User-provided macro specifications: timing constraints, area constraints,
  memory depth/width, mantissa width, exponent width, exponent offset,
  and INT/FP format selection. This is a hardware config, not a DNN graph.

Middle representation:
  A parameterized/template-based DCIM macro configuration. The named state
  is distributed across precision fields, memory-array dimensions, cell models,
  RTL templates, BIST templates, and backend constraints.

Mapping or scheduling state:
  Macro-layout mapping state: mantissa/exponent organization, common-exponent
  placement, bit-line division, sub-array gating, adder-tree sharing, and
  placement of write drivers, compute logic, and address decoder.

Hardware abstraction:
  SRAM-based digital CIM macro with 8T memory cell, read-out compute logic,
  adder tree, comparator tree, mantissa/exponent arrays, normalization module,
  and MarchCIM BIST blocks.

Backend / simulator / codegen:
  Low-level RTL generation, BIST logic generation/insertion, commercial EDA
  synthesis, place-and-route, DRC/LVS, Synopsys PrimeTime PX power simulation,
  and post-layout simulation using characterized libraries and Verilog models.

Output artifact:
  Optimized DCIM macro layouts/netlists/RTL as described in the paper. No
  public generated files or scripts were found in the checked sources.

Evaluation loop:
  Area overhead of BIST across selected formats; energy-efficiency comparison
  of generated macros against handcrafted DCIM macro works.
```

The input boundary is explicitly macro-level: timing/area constraints, memory dimensions, mantissa/exponent width, and exponent offset activate the flow. The backend boundary is also explicit: cell characterization produces timing/power libraries and Verilog models, then the flow emits low-level RTL, inserts MarchCIM BIST, performs synthesis/place-route/DRC/LVS/post-layout simulation, and feeds timing/power results back into backend constraints. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the user hardware spec, the precision-format tuple, the parameterized macro template, MarchCIM test-vector/test-mode state, and the commercial EDA constraint set. The paper foregrounds “compiler” as a macro-generation flow; the reusable semantics are most visible in the precision fields, mantissa/exponent physical organization, normalization path, sub-array/adder-tree layout choices, and BIST state machine/test-vector interface. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 — Macro / circuit generator.** ARCTIC’s central object is a DCIM macro, not a neural-network graph, tensor program, ISA program, or runtime schedule. It starts from macro-level specifications and produces RTL plus physical macro implementation through EDA tools. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

**Secondary: A5 — Narrow end-to-end co-design.** The flow connects cell characterization, template specialization, BIST generation, synthesis, layout, verification, and power/timing feedback. This is end-to-end within a narrow macro-design slice, rather than an end-to-end model-to-hardware compiler stack. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The stack slice ARCTIC owns most strongly is **specification → DCIM macro implementation**. Its input is a hardware configuration; its output is a generated macro with INT/FP MAC datapath and MarchCIM BIST. The demonstrated evaluation is macro PPA and BIST overhead, not model-level deployment. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is not a file format or dialect; it is the user-provided hardware specification plus format parameters. Decisions made there include memory size, timing/area target, mantissa width, exponent width, exponent offset, and precision family. Decisions that remain embedded in backend setup include exact template instantiation, synthesis constraints, place-and-route feedback, and cell-library characterization. A single upstream-readable artifact is not described in the paper. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

**B4 — Hardware-resource IR.**  
The paper names macro resources—memory array, write driver, address decoder, read-out compute logic, adder tree, comparator tree, exponent array, mantissa array, normalization module, and BIST components. Decisions made at this layer include common-exponent placement, bit-line division, sub-array clock gating, and adder-tree sharing. These are hardware-resource transformations rather than graph rewrites. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

**B6 — Accuracy / numerical-format modeling, limited to format support.**  
The FP path includes exponent comparison, maximum activation exponent, exponent subtraction, unified weight exponent addition, mantissa shifting, a shifting window, adder-tree accumulation, and normalization based on data width, exponent width, and exponent offset. This is a useful numeric-format abstraction, although the paper’s experiments focus on macro PPA rather than model accuracy over neural-network workloads. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

## 5.3 Axis C — first-class CIM objects

### 5.4 Axis D — rewrite object

ARCTIC rewrites **numeric format and macro hardware structure**. The legal transformations are template-driven: selecting INT versus FP format, setting mantissa/exponent widths and offset, generating memory/adder/comparator structures, choosing shared-exponent FP organization, placing exponent bits relative to mantissa storage, dividing bit lines, gating sub-arrays, sharing adder trees, and inserting MarchCIM BIST logic. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The equivalences exploited are mostly hardware/numeric equivalences: INT MAC can be realized as in-memory multiplication plus fixed shifting; FP MAC can be decomposed into mantissa multiplication, exponent comparison/subtraction, shifting, accumulation, and normalization; BIST can force one operand to numerical 1 and mask unrelated cells to recover direct comparison semantics in a MAC-producing memory array. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

Information that must be preserved across lowering includes the precision tuple, memory dimensions, exponent offset, mantissa/exponent placement, row/column addressing, test mode, memory/logic selection, and backend timing/area constraints. The representation is especially well suited to macro-specialization and DFT insertion; expressing graph-level operator fusion, inter-layer tensor placement, cross-operator partial-sum reuse, or runtime batching would likely require an additional abstraction for tensor identity and execution schedule.

## 6. Technical mechanism reading

### 6.1 Compiler flow as macro-specialization pipeline

ARCTIC’s compilation pipeline has three named phases: custom cell characterization, template-based DCIM macro customization plus MarchCIM BIST generation, and constraint-aware synthesis/place-route. The custom cells include an 8T memory cell and compute cells designed to match foundry-provided cell height; extracted parasitics produce timing/power libraries and Verilog models, which are then incorporated into a standard-cell-style flow so commercial EDA tools can synthesize and optimize the design. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The most compiler-like boundary is the hardware specification. It includes timing and area constraints, memory depth and width, mantissa width, exponent width, and exponent offset. After cell characterization, those parameters specialize a low-level RTL macro template and a MarchCIM BIST circuit template; the generated RTL then enters synthesis, place-and-route, DRC/LVS, post-layout simulation, and timing/power analysis. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

### 6.2 INT/FP macro topology

For INT DCIM, weights are stored directly in memory arrays, and MAC computation is described as in-memory multiplication followed by fixed-bit-width shifting and adder-tree accumulation. For multi-bit INT/FP multiplication, a read-out latch coupled with multiple AND gates performs bit-parallel MAC operation. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

For FP DCIM, ARCTIC uses a shared-exponent scheme: stored mantissas share a common weight exponent stored in an exponent array. The FP computation path compares activation exponents to find the maximum activation exponent, subtracts activation exponents from that maximum, adds the unified weight exponent, shifts mantissa multiplication results accordingly, accumulates shifted results in an adder tree, and normalizes the result according to the configured data width, exponent width, and exponent offset. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

### 6.3 Layout mechanism

The physical-layout mechanism is not a generic place-and-route IR; it is a set of macro-aware template/layout choices. ARCTIC divides bit lines to tune the storage-computation ratio, uses clock gating for sub-arrays, shares adder trees to trade TOPS/area against TOPS/energy, places common exponent bits in the middle of the mantissa array for FP macros, puts write drivers and compute logic near memory arrays, and locates the address decoder amid the memory array for routing. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

### 6.4 MarchCIM BIST mechanism

The BIST contribution adapts March-X-style memory testing to DCIM, where read-out returns a MAC result rather than a raw stored vector. The paper gives the DCIM read-out equation as a sum of products, `Output = w0 × a0 + ... + wn × an`, and uses that to motivate testing both SRAM cells and read-out compute logic. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The key trick is to set the corresponding weight or activation to numerical 1 so the MAC path can behave like a direct comparison path for the selected test cell, while masking unrelated mantissa/exponent cells to avoid interleaved interference. The BIST architecture includes a controller, counter, test-vector decoder, and comparator; test vectors contain memory/logic selection, mode selection, and row/column address information. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

For INT macro memory tests, the input activation’s least-significant bit is set to one, the addressed weight is written with the selected test pattern, and the output is truncated for comparison. For FP macro tests, exponent and mantissa are handled separately: the activation exponent is set to the exponent offset and the mantissa is zeroed to represent numerical 1, after which the normalization module supports direct comparison. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

### 6.5 Evaluation mechanism

The paper reports generated macros in 28 nm CMOS at 0.9 V and 200 MHz, evaluates MarchCIM BIST area overhead across INT16, INT8, INT4, FP16, BF16, and FP8(E5M2), and reports area overhead below 4% in Table II. Power consumption is simulated using Synopsys PrimeTime PX with characterized standard-cell libraries and Verilog models for post-layout simulation. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The energy-efficiency comparison in Table III places ARCTIC-generated INT4, INT8, and BF16 macros against handcrafted DCIM macro works. The evidenced scope is macro-level PPA comparison; workload-level compiler evaluation over DNN graphs, tensor schedules, or instruction streams is outside the demonstrated experiment. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Precision fields behave like backend type parameters

- **Observation:** ARCTIC’s format tuple—data width, mantissa width, exponent width, exponent offset—controls RTL generation, FP shifting/normalization, exponent-array organization, and BIST comparison behavior. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))  
- **Why it matters for CIM compiler/IR work:** A future CIM IR could treat these fields as type-level attributes that must be preserved through lowering, rather than as backend constants.  
- **Reusable lesson:** Borrow the precision tuple as a backend type contract: `{format, mantissa_bits, exponent_bits, exponent_offset, shared_exponent_group}`.

### Insight 2 — MarchCIM exposes verification state as a CIM-specific object

- **Observation:** The BIST logic names memory/logic selection, test mode, row address, column address, test patterns, masking, and comparator behavior. These are not ordinary SRAM test fields; they encode how to make a MAC-producing array behave like a testable memory path. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))  
- **Why it matters for CIM compiler/IR work:** Compiler stacks often stop at performance mapping, but CIM hardware generation also needs verifiable test modes that preserve observability of storage and compute cells.  
- **Reusable lesson:** A CIM IR could include DFT/BIST annotations for “testable value path,” “masked lanes,” and “forced numerical-one operand.”

### Insight 3 — The macro generator’s hidden IR is split between templates and EDA constraints

- **Observation:** ARCTIC’s compilation state is distributed across user parameters, RTL templates, BIST templates, characterized cell libraries, synthesis constraints, layout constraints, and post-layout feedback. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))  
- **Why it matters for CIM compiler/IR work:** This split is common in hardware-generation papers; corpus classification should capture where semantics are inspectable, even when no standalone IR is published.  
- **Reusable lesson:** For future stacks, expose the macro-specialization state as a serializable config so upstream mappers can reason about physical resources before backend code generation.

### Insight 4 — Shared exponent placement is a physical/numeric co-design point

### Insight 5 — BIST recovers direct-comparison semantics by controlling operand identity

- **Observation:** MarchCIM sets one operand to numerical 1 and masks unrelated cells so the MAC output can be compared against a test vector. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))  
- **Why it matters for CIM compiler/IR work:** This is a semantic rewrite of the datapath for verification: a many-input MAC path is constrained into a single-cell observability path.  
- **Reusable lesson:** Future IRs could model “verification mode” as a legal alternative trajectory with explicit operand forcing and masking constraints.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** Not applicable; no ARCTIC public artifact was located.
- **What the artifact appears to omit:** Public RTL templates, BIST generator, configs, characterization scripts, EDA scripts, generated layouts, and reproduction notebooks were not found in the checked sources.
- **Minimal command or workflow:** Unknown / not found.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper describes a commercial EDA-based flow using characterized libraries, Synopsys PrimeTime PX, DRC/LVS, and post-layout simulation, but no public reproduction package was found. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf))

The bibliographic record identifies the work as DATE 2024 with DOI `10.23919/DATE58400.2024.10546676`; checked public sources located the paper and publication listings, but not an official repository or artifact package. ([DBLP](https://dblp.org/rec/conf/date/ZhangZHLWXTZC24))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | Input fields are described in prose, but no schema or config file is provided. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Intermediate representation serialized | **Unknown** | No standalone IR/config artifact found. |
| Mapping decisions inspectable | **Partial** | Paper describes common-exponent placement, bit-line division, clock gating, and adder-tree sharing; no generated mapping dump found. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Schedule inspectable | **N/A / Unknown** | No graph/tensor execution schedule is described. |
| Hardware config explicit | **Partial** | Macro parameters and generated hardware blocks are explicit in prose/figures; no machine-readable config found. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Precision / bit-slice assumptions explicit | **Partial** | INT/FP widths, exponent offset, shared exponent, shifting window, and normalization path are described. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Cost model inspectable | **Partial** | PPA is obtained through EDA/post-layout simulation; no standalone analytic cost model found. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Simulator backend documented | **Partial** | Synopsys PrimeTime PX and post-layout Verilog simulation are named, but scripts/settings are not public. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |
| Generated code / instruction stream inspectable | **Partial / N/A** | RTL generation is described; no instruction stream and no public generated RTL found. |
| Provenance from source op to backend action | **Unknown** | Source object is macro config, not DNN op; no provenance trace found. |
| Reproduction scripts available | **Unknown** | No public scripts found. |
| Calibration source documented | **Partial** | Characterized custom-cell timing/power libraries and parasitic extraction are described; raw calibration files are not public. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) |

### 8.3 Integration helper

- **As frontend:** Limited. ARCTIC’s frontend is a macro-parameter interface, not a model importer. Reuse would start by defining a public schema for the paper’s input fields.
- **As IR inspiration:** Strong. Precision fields, shared-exponent grouping, mantissa/exponent physical placement, normalization path, BIST test mode, and masked verification path are useful IR objects.
- **As mapper/scheduler:** Moderate for macro-layout mapping; limited for DNN tensor scheduling. The adaptable pieces are common-exponent placement, sub-array partitioning, and adder-tree/resource sharing.
- **As cost model:** Moderate if one can reproduce the EDA flow. The paper’s PPA loop suggests backend plugins for area, timing, power, BIST overhead, and format-specific macro energy.
- **As backend:** Potentially strong conceptually, but practical reuse would require access to RTL templates, characterized cells, technology libraries, and EDA scripts.
- **As benchmark:** Useful as a macro-generation benchmark across INT16/8/4, FP16, BF16, FP8(E5M2), and as a BIST overhead benchmark.
- **As validation source:** Useful for macro-level calibration from reported 28 nm post-layout results; less direct for workload-level validation because no model-level evaluation is shown.

**Integration effort estimate: High.** Integration would be most direct through a new adapter that reconstructs ARCTIC’s macro config as a public JSON/YAML schema and maps it to an available RTL/EDA backend. The most valuable reusable boundary appears to be the precision-aware macro/BIST hardware contract. Practical reuse is constrained by the absence of public templates, generated files, and scripts, and by dependence on commercial EDA characterization and post-layout flows.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AutoDCIM** | Automated digital CIM macro generation. ARCTIC cites AutoDCIM as a prior DCIM compiler. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | ARCTIC’s distinguishing emphasis is parameterized INT/FP precision plus MarchCIM BIST support. | Classify both near A1; use Axis C to separate precision/DFT objects from generic macro-generation objects. |
| **ALPINE** | Agile PIM/CIM macro compilation and physical macro design. ([Researchr](https://researchr.org/publication/ZhangJWZZC21)) | ARCTIC extends the compiler framing toward FP support and DCIM-aware BIST. | Useful baseline for macro-template generation; ARCTIC adds stronger numeric-format and test-object signals. |
| **SynDCIM** | Performance-aware DCIM macro compiler with automated performance-to-layout generation. ([arXiv](https://arxiv.org/abs/2411.16806)) | SynDCIM emphasizes subcircuit synthesis and test-chip validation; ARCTIC emphasizes INT/FP parameterization and MarchCIM BIST. | Good comparison for A1/A5 macro-generation flows and for distinguishing search/subcircuit synthesis from precision/BIST specialization. |
| **CiMLoop** | CIM modeling, mapping, and energy evaluation. ([GitHub](https://github.com/mit-emze/cimloop)) | CiMLoop is a public full-stack modeling tool with tutorials, examples, Docker workflow, and reproducible notebooks; ARCTIC is a paper-described macro generator with no public artifact found. ([GitHub](https://github.com/mit-emze/cimloop)) | Contrast explicit modeling/specification artifacts with paper-only physical compiler flows. |
| **CIMFlow** | Digital CIM stack infrastructure. ([CIMFlow](https://www.cimflow.org/)) | CIMFlow exposes ISA, MLIR compiler, and SystemC simulator, while ARCTIC operates at RTL/layout macro generation. | Useful contrast between A4 explicit IR/ISA stack and A1 macro/circuit generation. |
| **OpenACM / OpenACMv2** | Open-source DCIM macro generation and backend physical flow. ([GitHub](https://github.com/ShenShan123/OpenACM)) | OpenACM exposes code, configs, OpenROAD flow, and approximate multiplier/SRAM/PE generators; ARCTIC’s public evidence is paper-only. | Useful artifact-rich comparison for reusable macro-generator interfaces and config-as-IR design. |

## 10. Corpus-ready final takeaway
