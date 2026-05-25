---
slug: autodcim
title: "AutoDCIM: An Automated Digital CIM Compiler"
short_title: "AutoDCIM"
subtitle: "Scoped CIM stack note"
year: 2023
venue: "DAC 2023"
authors_or_group: "Jia Chen, Fengbin Tu, Kunming Shao, Fengshi Tian, Xiao Huo, Chi-Ying Tsui, Kwang-Ting Cheng"
summary: >-
  AutoDCIM is best classified as a digital-CIM macro compiler rather than a workload compiler or explicit IR stack. Its public contribution is a spec-to-layout hardware generation flow that takes user macro specifications, builds a DCIM macro architecture, and produces an optimized physical layout using template-based generation plus a layout exploration loop over array partitioning choices. The demonstrated stack slice is the hardware-EDA layer: customized SRAM-based digital CIM cells, compute/peripheral structures, array partitioning, and layout generation.
links:
  paper: https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "AI inference / DCIM macro use cases"
  - "exact benchmark models: \"Unknown / not found in checked public sources\""
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A3, A5]
axis_B: [B1, B4]
axis_C_first_class_objects:
  - "DCIM_macro"
  - "SRAM_memory_array"
  - "array_partitioning"
  - "customized_compute_cell"
  - "multiplexer_multiplier_path"
  - "adder_tree"
  - "shift_add_accumulation_path"
  - "layout_template_metadata"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "array_binding"
  - "memory_layout"
  - "template_instantiation"
  - "macro_configuration"
artifact:
  status: "no public artifact found"
  url:
  license: "Unknown / not found"
  last_checked: "2026-05-19"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "validation"
reproducibility_level: low
notes:
  - "Best treated as a spec-to-layout DCIM macro compiler, not a workload compiler or explicit graph/ISA IR stack."
  - "Public evidence is strongest for template-based macro generation and array-partitioning/layout exploration."
  - "Follow-on work characterizes AutoDCIM as fixed-point/integer, closed-source, and commercial-EDA-dependent."
  - "Artifact URL spot-check on 2026-05-19 found official paper/metadata pages but no public implementation link."
takeaways: []
---

# AutoDCIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A1 Macro / circuit generator** | AutoDCIM is presented as a **spec-to-layout circuit compiler** for digital CIM macros: user specifications are converted into a DCIM macro architecture and optimized layout. The clearest owned stack slice is macro architecture and physical layout generation, not workload compilation. ([Kunming SHAO](https://kunmingshao.github.io/publication/DAC_23)) |
| Secondary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, narrow **A5** | The paper claims a layout exploration loop over DCIM array partitioning schemes. Follow-on comparisons describe AutoDCIM as an end-to-end automated DCIM flow, but with user-defined trade-off decisions rather than an automatic Pareto DSE. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B4 Hardware-resource IR** | The apparent middle object is a hardware/macro configuration: user specs, array partitioning, handcrafted templates, and layout parameters. No public evidence shows a graph IR, dialect, instruction IR, or runtime abstraction. |
| First-class CIM objects, Axis C | DCIM macro, array partitioning, SRAM cell / memory array, customized compute cell, multiplexer, adder tree, shift-add / accumulation path, layout template metadata | Public evidence names macro architecture, template-based generation, array partitioning, layout optimization, and DCIM subcircuits. Later SynDCIM text specifically attributes a **1T passing-gate multiplexer** design choice to AutoDCIM. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) |
| Rewrite object, Axis D | **Hardware mapping / array partitioning / layout flow / template instantiation** | The transformations are from specification to DCIM macro architecture and physical layout. The rewrite object is not an operator graph or loop nest; it is closer to macro resource binding plus placement/layout realization. |
| Best corpus tags | `digital-CIM`, `SRAM-CIM`, `macro-generator`, `spec-to-layout`, `hardware-compiler`, `template-based-generation`, `layout-optimization`, `array-partitioning`, `EDA-flow`, `fixed-point-DCIM` | Tags reflect the public claim and follow-on classification: AutoDCIM is a DCIM macro compiler with template-based layout generation, apparently focused on fixed-point / integer DCIM. ([arXiv](https://arxiv.org/html/2505.09451v1)) |
| Closest comparison baselines | **OpenC2**, **SynDCIM**, **SEGA-DCIM**, **ARCTIC**, **EasyACIM**, **OpenACM** | These works are close because they also automate CIM or DCIM macro generation, physical design, precision support, DSE, or open-source compiler infrastructure. OpenC2 and OpenACM explicitly position themselves relative to AutoDCIM. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |

## 2. One-paragraph public summary

**AutoDCIM** is best classified as a digital-CIM macro compiler rather than a workload compiler or explicit IR stack. Its public contribution is a **spec-to-layout hardware generation flow** that takes user macro specifications, builds a DCIM macro architecture, and produces an optimized physical layout using template-based generation plus a layout exploration loop over array partitioning choices. The demonstrated stack slice is the hardware-EDA layer: customized SRAM-based digital CIM cells, compute/peripheral structures, array partitioning, and layout generation. For CIM compiler/IR research, AutoDCIM is useful as an early example where the “compiler object” is not a neural-network graph or instruction stream, but a macro configuration and physical layout state; its reusable boundary is clearest as hardware-resource/config-as-IR inspiration for downstream macro backends. ([Kunming SHAO](https://kunmingshao.github.io/publication/DAC_23))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “First automated DCIM compiler.” | Abstract / HKUST publication page | Paper-only public abstract | The public abstract identifies AutoDCIM as an automated DCIM compiler and frames DCIM design automation as the target. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) | The public evidence supports a macro-generation compiler claim. It does not expose an upstream model compiler, graph IR, ISA, runtime, or benchmark harness. |
| “Takes user specifications as inputs and generates a DCIM macro architecture with an optimized layout.” | Abstract / HKUST publication page | Paper-only public abstract | The input/output boundary is specification → DCIM macro architecture → optimized layout. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) | The reusable boundary is clearest at macro specifications and generated layout. Exact schema, config format, and generated files are unknown / not found in checked public sources. |
| “Template-based generation balances handcrafted cell design and agile macro development.” | Abstract / HKUST publication page; author page calls it spec-to-layout | Paper-only public abstract | The compiler uses templates and handcrafted cell/layout knowledge rather than pure high-level synthesis. ([Kunming SHAO](https://kunmingshao.github.io/publication/DAC_23)) | Template internals, template language, and cell-library interface are not exposed through a public artifact. |
| “Layout exploration loop analyzes diverse DCIM array partitioning schemes to satisfy user specifications.” | Abstract / HKUST publication page | Paper-only public abstract | The paper claims exploration over array partitioning and layout alternatives. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) | Demonstrated scope is macro-level partition/layout exploration. Follow-on work describes AutoDCIM’s trade-off determination as user-defined rather than automatic Pareto-front exploration. ([arXiv](https://arxiv.org/html/2505.09451v1)) |
| Competitive efficiency versus silicon-verified DCIM macros. | Abstract / HKUST publication page | Paper-only public abstract; secondary comparisons | The public abstract states competitive efficiency results. OpenC2 later compares against AutoDCIM on TSMC40 and reports area/area-efficiency differences. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) | Paper-level evidence supports comparative evaluation, while artifact-level reproduction would require the closed macro generator, PDK/cell templates, and EDA scripts. |
| DCIM macro design is fixed-point / integer-oriented. | Follow-on SEGA-DCIM and OpenACM comparison tables | Secondary paper comparison | SEGA-DCIM says AutoDCIM supports a single integer architecture; OpenACM lists AutoDCIM as fixed-point, closed-source, basic SRAM analysis, adder-tree multiplier. ([arXiv](https://arxiv.org/html/2505.09451v1)) | This is secondary evidence from nearby compiler papers, useful for corpus placement but not a substitute for AutoDCIM’s full paper text. |
| AutoDCIM uses a specific multiplexer style and adder-tree sharing. | Follow-on SynDCIM / OpenC2 | Secondary technical comparison | SynDCIM states AutoDCIM uses a 1T passing gate as multiplexer; OpenC2 states AutoDCIM adopts adder-tree sharing, trading computational parallelism. ([arXiv](https://arxiv.org/html/2411.16806v1)) | These details are attributed by later works; direct artifact confirmation is not available in checked public sources. |

## 4. Stack anatomy

```text
Input / frontend:
User specifications for a DCIM macro. Public sources do not expose a schema. The object appears to be a hardware configuration rather than a model graph, loop IR, or instruction program.

Middle representation:
An implicit macro-architecture configuration: array dimensions / partitioning choices, template selections, compute-cell and peripheral organization, and layout parameters. It is not shown publicly as a serialized IR.

Mapping or scheduling state:
Array partitioning and layout exploration state. The paper foregrounds a loop over DCIM array partitioning schemes; follow-on work describes trade-off decisions as user-defined rather than automatically Pareto-selected.

Hardware abstraction:
SRAM-based digital CIM macro with memory array, compute logic, multiplexer / multiplier path, adder tree, shift-add accumulation, and peripheral circuits. Generic DCIM descriptions place weights in SRAM cells, feed activations bit-serially through wordline drivers, and accumulate partial sums through adder/shift-add structures. ([arXiv](https://arxiv.org/html/2411.16806v1))

Backend / simulator / codegen:
Template-based circuit/layout generation, apparently tied to custom cell templates and commercial physical-design tooling. OpenC2 later describes AutoDCIM as private and dependent on commercial EDA tools. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

Output artifact:
Generated DCIM macro architecture and optimized layout. Public sources do not expose generated Verilog/SPICE/DEF/GDS examples for AutoDCIM.

Evaluation loop:
Macro-level PPA / efficiency comparison against silicon-verified DCIM macros. Follow-on works compare AutoDCIM results against generated layouts, including an AutoDCIM-on-TSMC40 comparison in OpenC2. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **user specification fields, array partition candidates, handcrafted template parameters, layout constraints, and PPA/layout evaluation results**. The paper foregrounds automation from specification to layout, while the reusable semantics are most visible in the hardware-resource boundary: which SRAM-CIM cells, array partitions, peripheral paths, and accumulation structures are selected and arranged.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 Macro / circuit generator.** AutoDCIM’s public contribution is the generation of a DCIM macro architecture and optimized layout from user specifications. The author page describes the work as the “first spec-to-layout circuit compiler for digital computing-in-memory macros,” and the HKUST abstract describes specification input and macro/layout output. ([Kunming SHAO](https://kunmingshao.github.io/publication/DAC_23))

**Secondary: A3 Mapping / scheduling / DSE framework.** The paper’s layout exploration loop over array partitioning schemes creates a limited DSE role. The decisions appear to be macro partitioning and physical organization decisions, not workload schedule decisions. SEGA-DCIM later distinguishes AutoDCIM from automatic Pareto-front DSE by characterizing its trade-off determination as user-defined. ([arXiv](https://arxiv.org/html/2505.09451v1))

**Narrow A5 flavor:** It has an end-to-end **hardware** flow from top-level macro specs to layout. This is “end-to-end” within macro generation, not end-to-end from DNN model to executable CIM runtime.

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is not publicly exposed as an IR, but the operative representation is a DCIM macro configuration. Decisions made there include array partitioning, likely macro size, precision/configuration choices, and physical template instantiation. A single serialized object that upstream passes could read, verify, and rewrite was not found in checked public sources.

**B4 Hardware-resource IR.**  
AutoDCIM’s first-class design space is hardware-resource structure: SRAM cell arrays, compute logic, adder trees, peripheral blocks, and physical layout. SynDCIM’s DCIM taxonomy identifies subcircuits such as WL/BL drivers, memory cell, multiplier/multiplexer, adder tree, shift-and-add, and output-fusion paths; it also attributes a specific AutoDCIM multiplexer choice to a 1T passing gate. ([arXiv](https://arxiv.org/html/2411.16806v1))

**Not B2/B3/B5/B7 in the demonstrated public scope.**  
The checked public sources do not show a graph-as-IR, tensor schedule IR, instruction/meta-op stream, or runtime-state abstraction. The work is better treated as a hardware compiler with implicit configuration state.

### 5.3 Axis C — first-class CIM objects

### 5.4 Axis D — rewrite object

AutoDCIM rewrites **hardware configuration and layout state**. The transformation is:

`user macro specification → DCIM macro architecture candidate → array partition/layout candidate → generated physical layout`

Legal transformations evidenced publicly include template instantiation, array partitioning exploration, and layout optimization. Secondary evidence suggests AutoDCIM includes adder-tree sharing and a specific multiplexer implementation choice, both of which affect area, latency, and parallelism. ([arXiv](https://arxiv.org/html/2411.16806v1))

The equivalences exploited are hardware-generation equivalences: different array partitions and layout organizations can implement the same specified macro behavior. Across lowering, the flow must preserve DCIM MAC semantics, storage capacity, precision assumptions, array dimensions, connectivity, timing legality, and physical-design constraints.

## 6. Technical mechanism reading

### 6.1 Spec-to-layout macro compilation

AutoDCIM is framed as a compiler whose input is **user specifications** and whose output is a **DCIM macro architecture with optimized layout**. The public evidence supports a macro compiler, not a workload frontend. The compiler object is likely a structured hardware config containing macro dimensions, partitioning decisions, and template parameters, though the exact config schema is unknown / not found in checked sources. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/))

### 6.2 Template-based generation

The paper’s named mechanism is **template-based generation**. This suggests a hybrid flow: handcrafted cell/layout knowledge is packaged into reusable templates, and the compiler instantiates them to generate a complete macro. Later DCIM compiler papers use the same framing when contrasting AutoDCIM with OpenC2, SynDCIM, and SEGA-DCIM. OpenC2’s comparable flow shows the type of backend objects typical in this family—Verilog/SPICE netlists and DEF/GDSII layouts—while also stating that AutoDCIM itself is private and dependent on commercial EDA tools. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 6.3 Array partitioning and layout exploration

AutoDCIM’s layout exploration loop is described as analyzing diverse DCIM array partitioning schemes to satisfy user specifications. This is the main “middle-layer” transformation visible in the public text. Follow-on SEGA-DCIM characterizes AutoDCIM’s design space as a single integer architecture with user-defined trade-off determination, distinguishing it from later MOGA/Pareto-front approaches. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/))

### 6.4 Hardware abstraction

The relevant hardware abstraction is a digital SRAM-CIM macro. Generic DCIM operation stores weights in SRAM cells, feeds input activations bit-serially through WL drivers, and accumulates partial sums using adder-tree and shift-add paths. A typical DCIM macro can be decomposed into WL/BL drivers, memory cell, bitwise multiplier/multiplexer, adder tree, shift-and-add, and output-fusion logic. ([arXiv](https://arxiv.org/html/2411.16806v1))

For AutoDCIM specifically, later SynDCIM text attributes the multiplier/multiplexer choice to a **1T passing gate** that is area-efficient but has voltage-drop implications for power and latency. OpenC2 additionally says AutoDCIM uses adder-tree sharing, which reduces computational parallelism. ([arXiv](https://arxiv.org/html/2411.16806v1))

### 6.5 Precision and workload assumptions

The public AutoDCIM abstract refers generally to AI applications, but the checked public sources do not expose benchmark models or workload import formats. Follow-on compiler comparisons consistently place AutoDCIM in the **integer / fixed-point DCIM** category. SEGA-DCIM’s comparison table lists AutoDCIM as digital, INT precision, no estimation model, unoptimized design space, and user-defined trade-off determination. ([arXiv](https://arxiv.org/html/2505.09451v1))

### 6.6 Evaluation and backend assumptions

The public abstract states that AutoDCIM-generated macros show competitive efficiency relative to silicon-verified DCIM macros. OpenC2 later compares against “the best result of the design using AutoDCIM on TSMC40,” and reports that OpenC2’s FreePDK45 flow improves area and area efficiency in its setup. This supports the interpretation that AutoDCIM evaluation is post-layout / macro-PPA oriented, but reproduction depends on private templates, PDK data, and commercial EDA access. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The compiler object is a macro layout state

- **Observation:** AutoDCIM’s named input/output boundary is not model graph → executable, but user macro specification → generated DCIM macro layout.
- **Why it matters for CIM compiler/IR work:** It shows that a CIM “compiler” corpus should include hardware EDA compilers whose IR-like object is a macro configuration and layout flow.
- **Reusable lesson:** Future stacks could expose this hidden state explicitly as a hardware-resource IR with fields for array partition, cell template, peripheral path, accumulation tree, and layout constraints.

### Insight 2 — Array partitioning is the clearest rewriteable decision

- **Observation:** The most explicit transformation in the public description is layout exploration over DCIM array partitioning schemes.
- **Why it matters for CIM compiler/IR work:** Array partitioning is a natural bridge between high-level capacity/throughput requirements and physical layout feasibility.
- **Reusable lesson:** A reusable CIM IR could make array partitioning a typed mapping object, separating legality checks from PPA ranking.

### Insight 3 — Template generation is the backend contract

- **Observation:** AutoDCIM’s automation relies on handcrafted templates rather than a fully exposed high-level synthesis stack.
- **Why it matters for CIM compiler/IR work:** The backend contract is likely “instantiate these verified circuit/layout templates under parameter constraints,” not “lower arbitrary computation.”
- **Reusable lesson:** Future compilers can use template-backed lowering while still exposing a serialized pre-template IR for audit, debugging, and cross-tool comparison.

### Insight 4 — Digital CIM removes ADC/DAC objects but preserves trajectory questions

### Insight 5 — Follow-on work clarifies AutoDCIM’s corpus boundary

- **Observation:** OpenC2, SEGA-DCIM, SynDCIM, and OpenACM all position themselves as extending or contrasting with AutoDCIM on openness, DSE, precision, subcircuit synthesis, or approximation. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))
- **Why it matters for CIM compiler/IR work:** AutoDCIM is a useful anchor point for the “closed/proprietary spec-to-layout DCIM macro compiler” family.
- **Reusable lesson:** Corpus entries should distinguish macro-generation automation from workload-stack compilation, even when both use the word “compiler.”

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** No official public AutoDCIM repository, scripts, templates, generated layouts, or examples were found.
- **What the artifact appears to omit:** Publicly reusable source code, configuration schema, cell templates, DRC/LVS flow, generated Verilog/SPICE/DEF/GDS examples, benchmark scripts, and reproduction commands.
- **Minimal command or workflow:** Unknown / not found in checked public sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. Reproduction would require access to the private compiler, custom cell/layout templates, PDK data, and EDA scripts.
- **Artifact availability evidence:** OpenC2 describes AutoDCIM as private and dependent on commercial EDA tools; OpenACM lists AutoDCIM as closed-source. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Unknown | Public sources say “user specifications,” but no schema was found. |
| Intermediate representation serialized | Unknown | No serialized config/IR found. |
| Mapping decisions inspectable | Partial | Array partitioning/layout exploration is described publicly, but logs or design-space records were not found. |
| Schedule inspectable | N/A | No workload schedule is evidenced. |
| Hardware config explicit | Partial | Macro architecture, layout, templates, and array partitioning are described at paper level. |
| Precision / bit-slice assumptions explicit | Partial | Follow-on sources classify AutoDCIM as fixed-point / INT; exact precision fields are not public. ([arXiv](https://arxiv.org/html/2505.09451v1)) |
| Cost model inspectable | Unknown | No public cost-model implementation found. |
| Simulator backend documented | Unknown / N/A | Public evidence centers on layout/PPA evaluation, not a reusable simulator backend. |
| Generated code / instruction stream inspectable | N/A | No instruction stream is part of the demonstrated scope. |
| Provenance from source op to backend action | Unknown | No workload source op is evidenced. |
| Reproduction scripts available | Unknown | No official public artifact found. |
| Calibration source documented | Partial | Paper claims comparison with silicon-verified DCIM macros; exact public calibration package was not found. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/)) |

### 8.3 Integration helper

- **As frontend:** Reuse as a workload frontend appears limited; the public boundary is macro specification, not model import.
- **As IR inspiration:** Strong candidate for hardware-resource/config IR inspiration: macro dimensions, array partitions, template IDs, cell/peripheral choices, accumulation topology, and layout constraints.
- **As mapper/scheduler:** The array-partitioning exploration could be adapted as a macro mapper or backend legalization pass.
- **As cost model:** PPA comparison methodology could inspire backend cost plugins, but the public cost equations/tables and calibration data are not exposed.
- **As backend:** Integration would be most direct by wrapping a reimplemented template-based DCIM macro generator, since the original tool is not publicly available.
- **As benchmark:** Useful as a comparison point for spec-to-layout DCIM compiler papers, especially OpenC2, SynDCIM, SEGA-DCIM, ARCTIC, and OpenACM.
- **As validation source:** The paper-level evaluation provides macro-PPA comparison context, while external validation would benefit from accessible generated layouts or silicon/post-layout data.

**Integration effort estimate: High.** The conceptual interface is clear—macro specs to DCIM layout—but the executable boundary is not public. Reuse would benefit from a small adapter that extracts a normalized macro specification and emits an open DCIM-template generator format, such as the style exposed by OpenC2 or later open-source DCIM compiler efforts.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **OpenC2** | Spec-to-layout DCIM macro generation and physical design | OpenC2 is explicitly open-source-oriented and produces Verilog/SPICE plus DEF/GDSII from top-level specs; it positions AutoDCIM as private and commercial-EDA-dependent. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Separate “macro compiler” from “open reusable compiler.” Artifact status changes corpus value even when stack role is similar. |
| **SynDCIM** | Performance-aware DCIM macro compiler | SynDCIM adds subcircuit-library synthesis, PPA LUTs, multi-spec search, and silicon validation; it also identifies AutoDCIM’s 1T passing-gate mux choice. ([arXiv](https://arxiv.org/html/2411.16806v1)) | AutoDCIM is the earlier template/layout generator anchor; SynDCIM shifts toward subcircuit synthesis and performance constraints. |
| **SEGA-DCIM** | Automatic DCIM design generation | SEGA-DCIM adds MOGA/NSGA-II DSE, estimation models, and INT/FP precision support; it contrasts AutoDCIM as INT-only and user-defined trade-off selection. ([arXiv](https://arxiv.org/html/2505.09451v1)) | Distinguish layout exploration from explicit multi-objective DSE with Pareto-front outputs. |
| **ARCTIC** | Agile DCIM compiler with parameterized precision | ARCTIC extends the family toward INT/FP precision and built-in self-test, while AutoDCIM is positioned as an earlier integer macro compiler. ([xplorestaging.ieee.org](https://xplorestaging.ieee.org/document/10546676?utm_source=chatgpt.com)) | Precision and test structures are first-class compiler objects in later macro compilers. |
| **EasyACIM** | End-to-end CIM macro automation and DSE | EasyACIM targets analog CIM and uses MOGA-based design-space exploration to generate ACIM layouts. ([arXiv](https://arxiv.org/abs/2404.13062)) | Useful cross-technology comparison: AutoDCIM removes ADC/DAC trajectory issues but keeps macro-generation and layout-DSE issues. |
| **OpenACM** | Open-source DCIM compiler infrastructure | OpenACM classifies AutoDCIM as fixed-point, closed-source, basic SRAM analysis, adder-tree based; it adds configurable approximation and advanced SRAM analysis. ([arXiv](https://arxiv.org/html/2601.11292)) | The corpus should record whether approximation/accuracy is a first-class object or outside the demonstrated scope. |

## 10. Corpus-ready final takeaway

- AutoDCIM is a **digital SRAM-CIM macro compiler** whose public contribution is specification-to-layout macro generation.
