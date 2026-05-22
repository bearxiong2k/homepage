---
slug: syndcim
title: "SynDCIM: A Performance-Aware Digital Computing-in-Memory Compiler with Multi-Spec-Oriented Subcircuit Synthesis"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "DATE 2025"
authors_or_group: "Kunming Shao, Fengshi Tian, Xiaomeng Wang, Jiakun Zheng, Jia Chen, Jingyu He, Hui Wu, Jinbo Chen, Xihao Guan, Yi Deng, Fengbin Tu, Jie Yang, Mohamad Sawan, Tim Kwang-Ting Cheng, Chi-Ying Tsui"
summary: >-
  SynDCIM is a performance-aware SRAM-based digital CIM macro compiler whose evidenced contribution is a macro-generation EDA flow: a user provides architectural parameters and PPA-oriented performance constraints, the tool forms a subcircuit search space from a characterized library, applies a heuristic multi-spec search, emits RTL/netlists and circuit constraints, and then uses commercial synthesis, APR, timing, DRC/LVS, and post-layout simulation to obtain a layout. The paper strengthens the lower compiler/backend side of the CIM stack: subcircuit libraries, resource-level architectural search, layout-aware backend integration, and silicon validation. The demonstrated workloads are macro-level MAC operations under precision modes such as INT4/8, FP8, BF16, FP4/8, and silicon test modes for a 64×64 MCR=2 macro, rather than a public model-graph frontend or reusable tensor IR. For CIM compiler/IR research, SynDCIM is best read as a hardware-resource/configuration compiler whose “IR-like” semantics live in the macro spec, subcircuit-library choices, timing constraints, and generated RTL/netlist/layout flow. ([arXiv](https://arxiv.org/html/2411.16806v2))
links:
  paper: https://arxiv.org/pdf/2411.16806
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "MAC-operation macro evaluation"
  - "INT4/INT8/FP8/BF16 post-layout precision sweep"
  - "INT1/INT2/INT4/INT8/FP4/FP8 silicon macro validation"
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A3, A5]
axis_B: [B1, B4]
axis_C_first_class_objects:
  - "macro_SPEC"
  - "SRAM_cell"
  - "WL_BL_driver"
  - "bitwise_multiplier_multiplexer"
  - "adder_tree_CSA"
  - "shift_and_adder"
  - "output_fusion_unit"
  - "FP_INT_alignment_unit"
  - "array_dimensions"
  - "MCR"
  - "precision_modes"
  - "timing_PPA_constraints"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "subcircuit_selection"
  - "critical_path_retiming"
  - "pipeline_register_placement"
  - "column_partitioning"
  - "power_area_subcircuit_substitution"
  - "RTL_netlist_generation"
artifact:
  status: "no public artifact found"
  url: 
  license: 
  last_checked: "2026-05-19"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Macro-specification-to-layout scope is well evidenced in the paper."
  - "No public SCL, RTL templates, PPA LUTs, generated outputs, or reproduction scripts found in checked sources."
  - "Most useful corpus reading is hardware-resource/config-as-IR rather than graph/loop/ISA compiler stack."
  - "Artifact URL spot-check on 2026-05-19 found the arXiv paper record but no official public implementation link."
takeaways: []
---

# SynDCIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A1 Macro / circuit generator**, with **A3 Mapping / scheduling / DSE** and **A5 narrow macro-level co-design** | SynDCIM takes macro architecture/performance specifications, searches a subcircuit design space, emits RTL/netlists, and drives synthesis/APR to layout. Its “end-to-end” path is macro-specification-to-layout, with silicon validation for one generated 40 nm macro. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Middle-layer style, Axis B | **B1 Config-as-IR** + **B4 Hardware-resource IR** | The middle state is a specification-derived subcircuit configuration/search space plus a subcircuit library with PPA LUTs, not a tensor graph or ISA. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| First-class CIM objects, Axis C | SRAM cell, WL/BL drivers, bitwise multiplier/multiplexer, adder tree / CSA, Shift-and-Adder, OFU, FP/INT alignment unit, array dimensions, MCR, precision modes, timing/PPA constraints | The paper explicitly decomposes a DCIM macro into seven subcircuits and makes them selectable/costed through the SCL and MSO searcher. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Rewrite object, Axis D | **Hardware mapping / subcircuit selection / timing-retiming / pipeline placement / column partitioning / RTL-netlist generation** | Algorithm 1 rewrites the macro design trajectory by selecting subcircuits, repairing timing paths, retiming registers, splitting columns, removing/fusing registers where legal, and fine-tuning for power/area. ([arXiv](https://arxiv.org/pdf/2411.16806)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `macro-generator`, `EDA-flow`, `subcircuit-library`, `PPA-search`, `RTL-generation`, `layout-generation`, `silicon-validation`, `precision-configurable` | Tags reflect the evidenced stack layer and evaluation scope. |
| Closest comparison baselines | AutoDCIM, ARCTIC, EasyACIM, ISLPED’23 structured macro generation, ReDCIM, manually designed ISSCC SRAM-DCIM macros | These are close because they address DCIM macro generation, structured CIM macro layout, precision-configurable DCIM, or hand-designed DCIM macro baselines rather than high-level model compilation. ([arXiv](https://arxiv.org/pdf/2411.16806)) |

## 2. One-paragraph public summary

SynDCIM is a performance-aware SRAM-based digital CIM macro compiler whose evidenced contribution is a macro-generation EDA flow: a user provides architectural parameters and PPA-oriented performance constraints, the tool forms a subcircuit search space from a characterized library, applies a heuristic multi-spec search, emits RTL/netlists and circuit constraints, and then uses commercial synthesis, APR, timing, DRC/LVS, and post-layout simulation to obtain a layout. The paper strengthens the lower compiler/backend side of the CIM stack: subcircuit libraries, resource-level architectural search, layout-aware backend integration, and silicon validation. The demonstrated workloads are macro-level MAC operations under precision modes such as INT4/8, FP8, BF16, FP4/8, and silicon test modes for a 64×64 MCR=2 macro, rather than a public model-graph frontend or reusable tensor IR. For CIM compiler/IR research, SynDCIM is best read as a hardware-resource/configuration compiler whose “IR-like” semantics live in the macro spec, subcircuit-library choices, timing constraints, and generated RTL/netlist/layout flow. ([arXiv](https://arxiv.org/html/2411.16806v2))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “Performance-to-layout” DCIM compiler aligned with user-defined performance expectations | Abstract; Section I contributions; Section III-A framework | Paper-only + algorithm + flow | The paper describes a flow from macro specifications to Pareto design points, RTL/netlists, commercial synthesis/APR, and post-layout checks. ([arXiv](https://arxiv.org/html/2411.16806v2)) | Demonstrated scope is DCIM macro generation from architectural/PPA specs to layout, not a public high-level ML framework frontend. |
| Scalable subcircuit library with customizable components and PPA LUTs | Section I contributions; Section III-B; Fig. 3 | Paper-only + characterized-cell flow | The SCL contains seven subcircuit classes and PPA lookup tables over topologies, dimensions, and timing constraints; customized SRAM/multiplier/mux cells are characterized into standard-cell-compatible LIB/LEF-style flow. ([arXiv](https://arxiv.org/html/2411.16806v2)) | The paper-level evidence supports the library concept and characterization flow; artifact-level inspection of LUT schemas/files is unavailable in checked public sources. |
| Multi-spec-oriented searcher finds Pareto-frontier macro designs | Section III-C; Algorithm 1; Fig. 8 | Algorithm + experiment | Algorithm 1 describes a heuristic hierarchical search with subcircuit configuration, critical-path optimization, latency optimization, and PPA fine-tuning; Fig. 8 reports generated/implemented Pareto design points for H=W=64, MCR=2, INT4/8 and FP4/8, 800 MHz at 0.9 V. ([arXiv](https://arxiv.org/pdf/2411.16806)) | The demonstrated search object is a DCIM macro configuration space; independent reproducibility would require public SCL, scripts, constraints, and commercial-tool setup. |
| Flexible precision support | Section I; Section II-A/B; Section IV-A/B | Architecture description + experiments + silicon measurement | The macro architecture includes FP/INT alignment and OFU components; post-layout experiments cover INT4/8, FP8, BF16; silicon validation covers INT1/2/4/8 and FP4/8 for the fabricated macro. ([arXiv](https://arxiv.org/html/2411.16806v2)) | Precision is represented as a macro/specification parameter and hardware subcircuit choice, not as a typed tensor/value IR in the checked sources. |
| Compatibility with standard digital implementation flow | Section III-D; Fig. 6 | Flow description | The paper describes customized cells characterized into LEF/LIB-compatible form, Synopsys Design Compiler synthesis, Cadence Innovus APR with SDP scripts, gate-level/post-layout simulation, DRC, and LVS. ([arXiv](https://arxiv.org/pdf/2411.16806)) | The reusable boundary is clearest at generated RTL/netlists plus LIB/LEF/circuit constraints; public scripts and technology files were not found. |
| Silicon validation of generated macro | Abstract; Section IV-B; Fig. 9/10; Table II | Hardware measurement | A 64×64, MCR=2 40 nm macro is fabricated; reported results include 1.1 GHz and 9 TOPS at 1.2 V, 300 MHz at 0.7 V, 0.112 mm² macro area, and 1921 TOPS/W / 80.5 TOPS/mm² under the paper’s scaling assumptions and sparsity conditions. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Evidence is strongest for one generated macro and measured test-chip conditions; reuse as a calibration source would need access to raw measurement data and generated design files. |
| Superiority or competitiveness versus existing DCIM macros | Abstract; Section IV-B; Table II | Experiment / comparison | Table II compares the generated macro against selected ISSCC/TCAS-I DCIM designs. ([arXiv](https://arxiv.org/pdf/2411.16806)) | The comparison is at macro metric level and includes scaling notes; it is not a full-system workload or compiler-stack comparison. |

## 4. Stack anatomy

```text
Input / frontend:
  Macro SPEC from a DSE/compiler context: array dimensions H/W, FP&INT precision set,
  MCR, MAC frequency, weight-update frequency, PPA preference, and circuit constraints.
  This is a configuration/spec object. It is named in Algorithm 1 and Section III-A,
  but no public serialized schema was found.

Middle representation:
  Subcircuit Library (SCL) + search-space configuration derived from SPEC.
  The SCL stores selectable SRAM cells, multipliers/muxes, adders, drivers,
  FP/INT alignment, S&A, and OFU variants with PPA LUTs. It is inspectable in
  paper figures and prose; public files were not found.

Mapping or scheduling state:
  Critical-path state for MAC path and OFU path; register-placement state between
  adder tree, S&A, and OFU; column-height partitioning; subcircuit substitution.
  This is an implicit search state described by Algorithm 1 and Section III-C.

Hardware abstraction:
  A DCIM macro hierarchy: SRAM array, WL/BL drivers, memory cells, multiplier/mux,
  bit-wise CSA / adder tree, S&A, OFU, FP/INT alignment, MCR, precision modes,
  timing constraints, LIB/LEF-compatible cells, RTL/netlists.

Backend / simulator / codegen:
  Architecture RTL, subcircuit RTL, netlists, Synopsys Design Compiler,
  Cadence Innovus APR with structured data path scripts, gate-level simulation,
  PrimeTime, DRC/LVS, post-layout simulation.

Output artifact:
  Pareto-frontier macro design points, RTL/netlists, circuit constraints,
  standard-cell-compatible physical design inputs, and final DCIM macro layout.
  The paper reports these outputs; public downloadable generated outputs were not found.

Evaluation loop:
  Post-layout experiments over generated macro sizes/precisions; Pareto-frontier
  implementation of selected design points; silicon measurement of one 40 nm macro.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the macro SPEC, subcircuit-library entries and PPA LUTs, critical-path constraints, register-placement decisions, and generated RTL/netlist/layout constraints. The paper foregrounds “compiler” as performance-to-layout automation, while the reusable semantics are most visible in the SCL/search-space boundary: a future stack could expose this as a typed hardware-resource configuration IR that records selected subcircuits, precision support, timing constraints, and legal retiming/partitioning actions. ([arXiv](https://arxiv.org/html/2411.16806v2))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 Macro / circuit generator.** SynDCIM owns the slice from macro-level architectural/PPA specification to generated RTL/netlists and layout. Its core input is not a neural-network graph; it is a macro SPEC and performance target. Its core output is not a runtime program; it is a generated DCIM macro design point and layout-ready implementation flow. ([arXiv](https://arxiv.org/html/2411.16806v2))

**Secondary: A3 Mapping / scheduling / DSE framework.** The MSO searcher performs architectural synthesis over selectable subcircuits, checks MAC/OFU critical paths, retimes registers, partitions columns, and substitutes power/area-efficient subcircuits. This is DSE over hardware-resource choices rather than operator scheduling over a model graph. ([arXiv](https://arxiv.org/pdf/2411.16806))

**Secondary: A5 Narrow end-to-end co-design.** The “end-to-end” evidence is meaningful within the macro-generation stack: SPEC → search → RTL/netlist → APR/layout → post-layout/silicon validation. It is narrow relative to a full ML compiler stack because the demonstrated entry point is a macro specification, and the checked sources do not expose a public PyTorch/ONNX/MLIR/TVM-style frontend. ([arXiv](https://arxiv.org/pdf/2411.16806))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is the macro SPEC plus derived subcircuit configuration. Decisions made there include dimensions, precision support, MCR, MAC/update frequency, PPA preference, and subcircuit constraints. The paper does not publish a single inspectable schema, but Algorithm 1 and Section III-A make clear that the SPEC is the object that seeds search and backend generation. ([arXiv](https://arxiv.org/html/2411.16806v2))

**B4 Hardware-resource IR.**  
The SCL acts like a hardware-resource vocabulary: SRAM cell variants, multiplier/mux variants, CSA/adders, alignment, drivers, S&A, OFU, timing, power, and area. Decisions made there include topology choice, timing feasibility, register placement, and power/area fine-tuning. Upstream passes could reuse this most cleanly if the SCL and search state were serialized as a versioned hardware-resource IR. ([arXiv](https://arxiv.org/html/2411.16806v2))

**Not selected as primary: B2/B3/B5/B7.**  
The checked sources do not evidence a graph IR, loop/tensor schedule IR, instruction/meta-op stream, or runtime-state abstraction. RTL/netlists are generated outputs rather than the paper’s reusable compiler middle layer. ([arXiv](https://arxiv.org/pdf/2411.16806))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class macro parameter / hardware hierarchy** | Array dimensions H/W, SRAM array layout, macro dimensions, and MCR are explicit search/spec fields; silicon macro is 64×64, MCR=2. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Bit-slicing / bit significance | **Parameter / implicit data path** | Inputs are fed bit-serially; S&A accumulates bit-serial partial sums; OFU fuses lower-to-higher bit-width outputs. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| ADC/DAC precision or sensing | **Not applicable** | SynDCIM targets SRAM-based digital CIM macros; the represented precision objects are INT/FP modes and digital alignment/fusion units rather than ADC/DAC parameters. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Analog-to-digital or domain transition | **Not applicable / digital FP-to-INT conversion represented** | The paper names FP&INT alignment as converting FP data to INT format through comparison and shifting; no analog sensing boundary is part of the demonstrated abstraction. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Peripheral circuits as path nodes | **First-class / costed** | WL/BL drivers, FP/INT alignment, S&A, and OFU are named subcircuits with topology/configuration and PPA relevance. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Partial-sum accumulation path | **First-class hardware path** | Partial sums pass through adder tree, S&A, and OFU; Algorithm 1 explicitly optimizes critical paths and register placement across these stages. ([arXiv](https://arxiv.org/html/2411.16806v2)) |
| Reconstruction / shift-add tree | **First-class component, mostly hardware-template level** | S&A and OFU are named and parameterized components; OFU adds S&A outputs from lower bit-width to higher bit-width. ([arXiv](https://arxiv.org/pdf/2411.16806)) |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly outside representation; sparsity appears in measurement condition** | Table II measurement notes include input/weight sparsity conditions, but no runtime table or dynamic scheduler is exposed in the checked sources. ([arXiv](https://arxiv.org/pdf/2411.16806)) |
| Value trajectory / flow path | **Implicit** | The physical data path is described through subcircuits, but value identity across stages is not exposed as a typed, serializable trajectory object. ([arXiv](https://arxiv.org/html/2411.16806v2)) |

### 5.4 Axis D — rewrite object

SynDCIM rewrites **hardware mapping and macro implementation state**: subcircuit selection, adder topology, timing repair, register retiming, column partitioning, pipeline-stage insertion/removal, PPA-oriented subcircuit substitution, and RTL/netlist generation. Legal transformations are governed by timing constraints, TOPS/PPA preferences, and availability of library variants. The exploited equivalences are circuit/microarchitectural: different CSA compositions, register placements, column partitioning, and subcircuit choices can preserve the macro function while changing area, power, frequency, or layout regularity. ([arXiv](https://arxiv.org/pdf/2411.16806))

Information that must be preserved across lowering includes selected precision modes, array dimensions, MCR, timing/frequency targets, MAC and OFU path legality, subcircuit identity, and layout constraints needed for SDP-based placement. The representation is especially well suited to macro-level PPA/timing exploration; expressing tensor-operator fusion, cross-layer workload mapping, runtime batching, or value-trajectory rewrites would likely require an additional abstraction for tensor/value identity and inter-operator dataflow. ([arXiv](https://arxiv.org/html/2411.16806v2))

## 6. Technical mechanism reading

### 6.1 Macro-specification to search-space construction

SynDCIM begins from architectural and performance specifications: dimensions, FP&INT precision modes, MCR, MAC frequency, weight-update frequency, and PPA preferences. The MSO searcher uses these to define each subcircuit’s configuration and constraints, forming a search space of directly synthesizable subcircuit candidates. In compiler terms, this is the point where a high-level macro contract becomes a resource-constrained hardware configuration problem. ([arXiv](https://arxiv.org/html/2411.16806v2))

### 6.2 Subcircuit library as the costed hardware vocabulary

The SCL contains seven subcircuit classes: FP&INT alignment, WL/BL drivers, memory cell, bitwise multiplier/multiplexer, adder tree, S&A, and OFU. Customized SRAM cells, multipliers, and multiplexers are laid out and characterized so they can participate in a standard digital flow; digital subcircuits such as alignment, drivers, S&A, and OFU use parameterized RTL templates, with typical configurations implemented and simulated for PPA data while other configurations are estimated/scaled from synthesis data. ([arXiv](https://arxiv.org/html/2411.16806v2))

### 6.3 Adder-tree mechanism and timing-aware variants

A paper-specific mechanism is the bit-wise CSA family. The library mixes 4-2 compressors, full adders, and half adders: looser timing constraints favor more compressors for power/area, while stricter timing constraints replace some compressors with full adders to shorten critical path. The authors also exploit different port delays by reordering cell connections, treating adder topology and wiring order as search-relevant implementation choices. ([arXiv](https://arxiv.org/pdf/2411.16806))

### 6.4 Heuristic hierarchical search

Algorithm 1 states the input as a macro SPEC from DSE/compiler and the objective as minimizing power/area while meeting a throughput constraint, with output as macro RTL/netlist and circuit constraints. The search proceeds through: setting subcircuit configurations from SPEC; critical-path optimization for adder and OFU paths; latency optimization by removing/fusing registers when timing allows; and PPA fine-tuning through preference-oriented subcircuit substitutions. ([arXiv](https://arxiv.org/pdf/2411.16806))

### 6.5 Backend implementation flow

The backend is explicitly commercial-EDA based. Customized cells are characterized into LEF/LIB-compatible forms, synthesis is run through Synopsys Design Compiler, APR uses Cadence Innovus with structured data path TCL scripts, and verification/evaluation uses gate-level simulation, PrimeTime, DRC/LVS, and post-layout simulation. The backend contract is therefore a VLSI implementation contract: cell Verilog, LIB/LEF, RTL, netlist, timing constraints, SDP script, and post-layout checks. ([arXiv](https://arxiv.org/pdf/2411.16806))

### 6.6 Evaluation assumptions

The post-layout evaluation is macro-centric: four generated macros from 32×32 to 256×256 are evaluated for MAC operations under INT4/8, FP8, and BF16. A Pareto-frontier case uses H=W=64, MCR=2, INT4/8 and FP4/8, and 800 MHz MAC/update frequency at 0.9 V. Silicon validation fabricates a 64×64, MCR=2 40 nm macro supporting INT1/2/4/8 and FP4/8, with reported shmoo/throughput/energy/area metrics. ([arXiv](https://arxiv.org/pdf/2411.16806))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The SCL is the de facto backend contract

- **Observation:** The most reusable semantic boundary is the Subcircuit Library: named subcircuit classes, PPA LUTs, timing constraints, and standard-cell-compatible characterization data.
- **Why it matters for CIM compiler/IR work:** It shows that a CIM “backend” can be a resource library with legal topology variants and calibrated PPA data, rather than an instruction emitter.
- **Reusable lesson:** Future CIM IRs could define a backend-plugin interface around resource nodes such as `memory_cell`, `mul_mux`, `adder_tree`, `shift_add`, and `output_fusion`, each with timing/PPA contracts. ([arXiv](https://arxiv.org/pdf/2411.16806))

### Insight 2 — Search separates feasibility repair from PPA ranking

- **Observation:** Algorithm 1 first repairs timing feasibility through adder/OFU critical-path transformations, then performs latency and PPA fine-tuning.
- **Why it matters for CIM compiler/IR work:** This suggests a useful pass structure: legality/feasibility passes before cost-ranking passes.
- **Reusable lesson:** A future compiler could encode timing legality as verifiable constraints and keep PPA preferences as a separate optimization policy. ([arXiv](https://arxiv.org/pdf/2411.16806))

### Insight 3 — Precision support is hardware-structural, not just numeric metadata

- **Observation:** INT/FP precision choices affect FP/INT alignment and OFU hardware, and the paper reports measurable overheads for FP8 and BF16 relative to INT4/8.
- **Why it matters for CIM compiler/IR work:** Precision in CIM compilation may need to select or size physical reconstruction/fusion resources, not simply annotate tensors.
- **Reusable lesson:** A precision-aware IR should propagate precision fields into resource allocation for alignment, shift/add, fusion, and accumulation path selection. ([arXiv](https://arxiv.org/html/2411.16806v2))

### Insight 4 — Layout regularity is a compiler concern

- **Observation:** The paper treats placement regularity as part of generation, using Cadence Innovus structured data path scripts to keep SRAM cells and nearby adders arranged regularly.
- **Why it matters for CIM compiler/IR work:** CIM backend interfaces may need layout metadata or placement constraints, because macro performance depends on regular SRAM/adder organization.
- **Reusable lesson:** A backend-facing CIM IR could include placement classes, array-column affinity, and peripheral-placement regions as first-class constraints. ([arXiv](https://arxiv.org/pdf/2411.16806))

### Insight 5 — Silicon validation is valuable calibration, but not a reusable artifact by itself

- **Observation:** The 40 nm test chip gives concrete calibration points for one generated macro, including area, frequency, throughput, and energy-efficiency metrics.
- **Why it matters for CIM compiler/IR work:** Hardware measurements can anchor cost-model plausibility even when the compiler artifact is unavailable.
- **Reusable lesson:** A public corpus should distinguish “validated generator” from “reusable generator”: SynDCIM is valuable as a validation source and design pattern, while direct reuse would depend on public SCL, scripts, and generated files. ([arXiv](https://arxiv.org/pdf/2411.16806))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** None found. The official project/publication page links to the paper download and a general GitHub profile, not a SynDCIM code/artifact repository. ([Kunming SHAO](https://kunmingshao.github.io/publication/DATE_25))  
- **License:** N/A for artifact. The HKUST research portal lists publisher copyright © 2025 EDAA for the publication record. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/syndcim-a-performance-aware-digital-computing-in-memory-compiler--2/))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** No public artifact found.  
- **What the artifact appears to omit:** Public code, SCL files, PPA LUTs, RTL templates, generated RTL/netlists, commercial-tool scripts, technology files, test benches, raw silicon data, and figure reproduction scripts were not found in the checked public sources.  
- **Minimal command or workflow:** Unknown / not found in the checked sources.  
- **Whether paper figures appear reproducible from the artifact:** Unknown; no public artifact found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | SPEC fields are described in paper/Algorithm 1, but no schema found. |
| Intermediate representation serialized | Unknown | The effective state is SPEC + SCL + search constraints; no public serialized IR found. |
| Mapping decisions inspectable | Partial | Search decisions are described in Algorithm 1 and prose; no logs/artifact found. |
| Schedule inspectable | N/A / Partial | The paper has pipeline/register placement decisions, not workload scheduling. |
| Hardware config explicit | Partial | Dimensions, MCR, precision modes, subcircuit classes, and timing targets are explicit in examples. |
| Precision / bit-slice assumptions explicit | Partial | Precision modes and bit-serial/S&A/OFU path are described; no typed propagation artifact found. |
| Cost model inspectable | Partial | PPA LUT concept and objective are described; LUT contents/schema unavailable. |
| Simulator backend documented | Partial | Gate-level/post-layout simulation tools are named; scripts unavailable. |
| Generated code / instruction stream inspectable | Partial / N/A | RTL/netlists are generated outputs, but public generated files were not found; no instruction stream is involved. |
| Provenance from source op to backend action | Unknown | Source is macro SPEC, not op graph; no provenance artifact found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | Silicon metrics and conditions are reported; raw measurement dataset unavailable. |

### 8.3 Integration helper

- **As frontend:** Reuse is limited to macro-level SPEC ingestion. There is no public model importer in the checked sources.
- **As IR inspiration:** Strong candidate for a hardware-resource/config-as-IR design: macro parameters, subcircuit choices, PPA LUT entries, timing constraints, precision support, and placement constraints.
- **As mapper/scheduler:** The MSO searcher’s feasibility-first, PPA-second pass structure could be adapted for macro-level resource binding and timing repair.
- **As cost model:** The PPA LUT and post-layout/silicon validation approach could inspire backend cost plugins, especially for SRAM digital CIM macros.
- **As backend:** Integration would be most direct by wrapping a SynDCIM-like flow behind an RTL/netlist/layout backend interface; actual reuse would require SCL, scripts, and technology collateral.
- **As benchmark:** Paper-level macro settings—32×32 to 256×256 precision sweeps, H=W=64 MCR=2 Pareto case, and 64×64 silicon macro—can serve as corpus benchmark descriptors.
- **As validation source:** The strongest validation source is the fabricated 40 nm macro and reported post-layout/silicon measurements.

**Integration effort estimate: High.** The most valuable reusable boundary appears to be the SCL/MSO-search contract, but the checked public sources provide paper-level descriptions rather than a runnable artifact. Integration would benefit from a small adapter that extracts macro SPEC, selected subcircuits, timing constraints, and generated-output metadata, but direct wrapping would require non-public RTL templates, PPA LUTs, commercial EDA scripts, and technology files.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| AutoDCIM | Automated digital CIM macro generation | SynDCIM’s table positions AutoDCIM as end-to-end generation but without FP&INT support, PPA-selectable subcircuits, or spec-oriented synthesis; SynDCIM adds SCL/MSO search and precision/PPA-driven selection. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Classify both as macro compilers, but distinguish template assembly from PPA-aware subcircuit synthesis. |
| ARCTIC | Agile CIM compiler with parameterized INT/FP precision | ARCTIC is closest on configurable precision; SynDCIM’s distinctive object is the PPA-selectable subcircuit library plus multi-spec search. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Precision support alone should not imply an IR stack; inspect whether precision is a parameter, type, or rewrite object. |
| EasyACIM | Automated CIM design-space exploration and synthesizable architecture | EasyACIM targets analog CIM; SynDCIM targets SRAM-based digital CIM with standard digital implementation flow and silicon macro validation. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Separate analog-vs-digital technology from compiler role; both can be macro generators with different first-class circuit objects. |
| ISLPED’23 structured macro generation | Structured layout/macros using standard cells | SynDCIM shares the concern of regular macro layout but adds DCIM-specific subcircuit synthesis and PPA search. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Layout scripts and placement regularity can be backend IR concerns in CIM stacks. |
| ReDCIM | Unified FP/INT digital CIM pipeline | ReDCIM is a hardware architecture reference for FP/INT pipeline ideas; SynDCIM turns similar precision/peripheral concerns into generator/search objects. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Hardware papers can supply first-class object vocabulary even when they are not compiler stacks. |
| ISSCC SRAM-DCIM macros | Manually designed high-efficiency macro baselines | SynDCIM compares generated macro metrics with manually designed SRAM-DCIM macros; the corpus distinction is generated design flow versus hand-designed macro result. ([arXiv](https://arxiv.org/pdf/2411.16806)) | Keep performance baselines separate from reusable compiler/IR evidence. |

## 10. Corpus-ready final takeaway

- SynDCIM’s real contribution is a performance-aware SRAM digital CIM **macro-generation EDA flow** from macro SPEC to RTL/netlist, APR, layout, and silicon-validated macro measurement.
- Its strongest reusable stack layer is the **subcircuit-library + MSO searcher** boundary: selectable hardware resources, PPA LUTs, timing constraints, and implementation decisions.
- The evidenced scope is macro-level MAC hardware under configurable INT/FP precision modes, not a public ML graph compiler or runtime stack.
- First-class objects include SRAM cells, WL/BL drivers, multiplier/mux circuits, CSA/adder tree, S&A, OFU, FP/INT alignment, MCR, array dimensions, precision modes, and PPA/timing targets.
- The “hidden IR” is the combination of macro SPEC, SCL entries, search constraints, critical-path state, register-placement state, and generated RTL/netlist/layout constraints.
- Artifact status: no public artifact found.
- Integration is most plausible as IR inspiration, backend-cost-model inspiration, and validation source; direct reuse would require public SCL, RTL templates, EDA scripts, and generated outputs.
- For a value-trajectory IR, SynDCIM contributes a clear digital CIM path vocabulary, while trajectory-level rewrites would add typed value identity across S&A, OFU, precision alignment, registers, and layout/resource placement.
