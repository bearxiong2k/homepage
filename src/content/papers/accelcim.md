---
slug: accelcim
title: "AccelCIM: Systematic Dataflow Exploration for SRAM Compute-in-Memory Accelerator"
short_title: "AccelCIM"
subtitle: "Scoped CIM stack note"
year: 2026
publication:
  venue: "DAC 2026"
  type: "conference"
  doi: "10.48550/arXiv.2604.17692"
  url: "https://doi.org/10.48550/arXiv.2604.17692"
authors:
  - "Chenhao Xue"
  - "Yukun Wang"
  - "An Guo"
  - "Yuhui Shi"
  - "Jinwei Zhou"
  - "Xiping Dong"
  - "Yihan Yin"
  - "Yuanpeng Zhang"
  - "Tianyu Jia"
  - "Wei Gao"
  - "Qiang Wu"
  - "Xin Si"
  - "Jun Yang"
  - "Guangyu Sun"
bibtex: |
  @inproceedings{xue2026accelcim,
    author = {Xue, Chenhao and Wang, Yukun and Guo, An and Shi, Yuhui and Zhou, Jinwei and Dong, Xiping and Yin, Yihan and Zhang, Yuanpeng and Jia, Tianyu and Gao, Wei and Wu, Qiang and Si, Xin and Yang, Jun and Sun, Guangyu},
    title = {AccelCIM: Systematic Dataflow Exploration for SRAM Compute-in-Memory Accelerator},
    booktitle = {DAC 2026},
    year = {2026},
    doi = {10.48550/arXiv.2604.17692},
    eprint = {2604.17692},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2604.17692}
  }
citation_source: https://arxiv.org/abs/2604.17692
summary: >-
  **AccelCIM** contributes a systematic design-space exploration framework for SRAM compute-in-memory accelerator dataflows, with particular emphasis on the coupling between CIM macro parameters and macro-array organizations. Its strongest stack contribution is in hardware-aware mapping and backend evaluation: the paper models weight-stationary versus output-stationary dataflows, broadcast versus systolic interconnect, macro capacity, pipeline level, and compute-I/O overlap, then ranks candidate designs using cycle-accurate simulation and post-layout PPA extraction through an SRAM-CIM macro compiler, SPICE characterization, RTL generation, Cadence synthesis, and place-and-route. The demonstrated workloads are GEMM-like LLM inference cases, including Qwen3-0.6B, LLaMA-3-8B/70B, and GPT-3 175B, under W8A8 integer computation and prefill/time-to-first-token evaluation. For CIM compiler/IR research, AccelCIM is best read as a **config-and-schedule-centered mapping stack**: it makes hardware dataflow options and macro-array resources first-class, while upstream graph IR, explicit ISA lowering, runtime state, and serialized reusable intermediate states remain outside the demonstrated public interface. ([arXiv](https://arxiv.org/pdf/2604.17692))
links:
  paper: https://arxiv.org/pdf/2604.17692
  artifact:
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "W8A8 integer GEMM"
  - "LLM prefill / time-to-first-token"
  - "Qwen3-0.6B"
  - "LLaMA-3-8B"
  - "LLaMA-3-70B"
  - "GPT-3 175B"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A5, A1]
axis_B: [B1, B4, B3]
axis_C_first_class_objects:
  - "SRAM_CIM_macro_template"
  - "macro_bank_count_PC"
  - "accumulation_length_AL"
  - "local_storage_length_LSL"
  - "pipeline_level_PL"
  - "compute_IO_overlap_OL"
  - "array_rows_BR"
  - "array_columns_BC"
  - "weight_stationary_output_stationary_dataflow"
  - "broadcast_systolic_interconnect"
  - "bit_sliced_input_weight_processing"
  - "adder_tree_reduction_path"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "macro_array_organization"
  - "dataflow_choice"
  - "schedule_overlap_choice"
  - "tiling_parameter_selection"
artifact:
  status: "no public artifact found"
  url: 
  license: "paper CC-BY-4.0; AccelCIM artifact license unknown"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best read as config-as-IR plus hardware-resource mapping for SRAM-CIM macro arrays."
  - "Strongest evidence is for macro-array dataflow/PPA co-design, not for frontend IR or runtime integration."
  - "Uses in-house cycle simulator and post-layout flow; public reproducibility would benefit from scripts, schemas, simulator traces, and generated design files."
takeaways: []
---

# AccelCIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with A2 and A5 secondary roles | AccelCIM’s central object is a searchable **SRAM-CIM macro-array dataflow design space** spanning macro parameters, array dimensions, dataflow, interconnect, and compute-I/O overlap. The evaluation loop uses Bayesian optimization, an in-house cycle simulator, and post-layout PPA extraction. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B4 Hardware-resource IR**, with **B3 loop/tensor-schedule structure** | The closest “middle representation” is the design tuple: `AL, LSL, PC, PL, OL, BR, BC, dataflow, interconnection`, plus the GEMM tiling/scheduling parameters such as `TL`. The paper describes fixed loop structure and array-level movement rules rather than a named compiler IR. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| First-class CIM objects, Axis C | SRAM-CIM macro template; macro bank count; accumulation length; local storage length; parallel channels; pipeline level; compute-I/O overlap; macro-array rows/columns; WS/OS dataflow; broadcast/systolic interconnect; bit-slice processing; adder-tree reduction; `.lib/.lef` layout abstractions | These objects are named or parameterized in Table 2, Figure 4, Figure 5, and the macro-array generator flow. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Rewrite object, Axis D | **Hardware mapping / array organization / schedule choice / macro capability selection** | AccelCIM transforms the candidate design point rather than an operator graph or instruction stream: it varies macro parameters, array shape, dataflow, interconnect, overlap support, and workload tiling to rank Pareto-optimal designs. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `compiler-mapping`, `DSE`, `macro-array`, `LLM-inference`, `GEMM`, `cycle-simulator`, `post-layout-PPA`, `hardware-aware-scheduling` | The demonstrated setting is W8A8 integer GEMM for LLM prefill/projection workloads on SRAM-CIM macro arrays, evaluated with cycle simulation and 28 nm post-layout flow. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Closest comparison baselines | CiMLoop, CIMFlow, CIM-MXU, AutoDCIM/SEGA-DCIM/SynDCIM-style macro compilers, DAMIL-DCIM | Table 1 positions AccelCIM against prior SRAM-CIM automation work by array dataflow, interconnect, macro capacity flexibility, compute-I/O overlap, macro PPA, and array PPA. ([arXiv](https://arxiv.org/pdf/2604.17692)) |

## 2. One-paragraph public summary

**AccelCIM** contributes a systematic design-space exploration framework for SRAM compute-in-memory accelerator dataflows, with particular emphasis on the coupling between CIM macro parameters and macro-array organizations. Its strongest stack contribution is in hardware-aware mapping and backend evaluation: the paper models weight-stationary versus output-stationary dataflows, broadcast versus systolic interconnect, macro capacity, pipeline level, and compute-I/O overlap, then ranks candidate designs using cycle-accurate simulation and post-layout PPA extraction through an SRAM-CIM macro compiler, SPICE characterization, RTL generation, Cadence synthesis, and place-and-route. The demonstrated workloads are GEMM-like LLM inference cases, including Qwen3-0.6B, LLaMA-3-8B/70B, and GPT-3 175B, under W8A8 integer computation and prefill/time-to-first-token evaluation. For CIM compiler/IR research, AccelCIM is best read as a **config-and-schedule-centered mapping stack**: it makes hardware dataflow options and macro-array resources first-class, while upstream graph IR, explicit ISA lowering, runtime state, and serialized reusable intermediate states remain outside the demonstrated public interface. ([arXiv](https://arxiv.org/pdf/2604.17692))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “Systematic dataflow exploration framework for SRAM CIM accelerator” | Abstract and Introduction | Paper-only + experiment | The paper defines a joint macro/array design space and explores Pareto fronts for multiple dataflow families. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Demonstrated for SRAM-CIM macro arrays and GEMM-like DNN/LLM workloads; public artifact-level replay was not found. |
| “Systematic CIM accelerator dataflow design space” | Section 3.1, Table 2 | Design-space specification | Table 2 enumerates macro parameters: `AL`, `LSL`, `PC`, `PL`, `OL`, fixed W8/A8 bitwidths; and array parameters: `BR`, `BC`, WS/OS, broadcast/systolic. ([arXiv](https://arxiv.org/pdf/2604.17692)) | The design space is explicit at paper level. A machine-readable schema or serialized design record was not found in checked public sources. |
| “Rigorous design evaluator” | Introduction, Section 3.3, Section 4.1 | Backend flow + experiment | The flow uses an open-source SRAM-CIM macro compiler, SPICE macro characterization, `.lib/.lef`, RTL generation, Cadence Genus, Cadence Innovus, floorplan utilization sweeps, and post-layout power/area extraction. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Evidence is paper-level for the integrated AccelCIM flow. The dependent CIAL-CIMCompiler repository is public, but an AccelCIM repository with scripts/traces was not found. ([GitHub](https://github.com/Richard-Hui/CIAL-CIMCompiler)) |
| “Cycle-accurate architectural simulation” | Section 4.1 | Paper-only simulator claim | The paper states that an in-house cycle-accurate simulator obtains total cycles for applications; transition rates from simulator traces are used for power. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Simulator interface, trace format, input schema, and reproduction commands are unknown / not found in checked public sources. |
| “Compute-I/O overlap can reduce latency up to 50%” | Section 3.2, Equations 3–5 | Equation | The paper derives `T_nol = LSL × (Ts + Tc)`, `T_ol = LSL × max(Ts,Tc)`, and an upper-bound reduction ratio of 0.5. ([arXiv](https://arxiv.org/pdf/2604.17692)) | The equation supports block-level schedule analysis; the paper notes that actual reduction is often modest when compute time dominates write time. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| “Systolic interconnect improves area efficiency without degrading energy efficiency” | Section 4.3, Takeaway #1 | Experiment / ablation | Figure 10 evaluates non-macro power and area overhead across array sizes; the text reports higher area overhead for broadcast due to global interconnect routing. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Demonstrated under the paper’s selected 4-TOPS macro and array-size study; transfer to other technologies would require recalibration. |
| “Medium-sized CIM macros provide the best energy/area trade-off” | Section 4.3, Takeaway #2 | Experiment / ablation | Figure 11 and the surrounding text evaluate 512K bit-wise multiplier macro arrays and find larger macros improve energy efficiency while medium-sized macros improve area efficiency. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Demonstrated within the macro capacities supported by the adopted macro compiler and the selected array design assumptions. |
| “Compute-I/O overlap improves area efficiency for bandwidth-constrained designs at energy cost” | Section 4.3, Takeaway #3 | Experiment / ablation | Figure 12 reports 25–35% energy-efficiency reduction when overlap is enabled and area-efficiency benefits for larger `PC`. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Demonstrated for 2×4 macro arrays and macro variants differing in `PC`; broader reuse depends on exposing macro write-port and overlap-resource models. |
| “LLM inference case study” | Section 4.4, Table 3 | Experiment / case study | The paper reports optimized design points for Qwen3-0.6B, LLaMA-3-8B/70B, and GPT-3 175B, with best dataflows, parameter tuples, latency, power, and area. ([arXiv](https://arxiv.org/pdf/2604.17692)) | The evidenced workload boundary is prefill/time-to-first-token and GEMM-like LLM operations, not a documented full-model frontend or runtime system. |

## 4. Stack anatomy

```text
Input / frontend:
```

The paper-level input is a workload/application specification expressed through matrix dimensions and model-level parameters rather than a named frontend IR. For the LLaMA-3-8B main result, the paper uses W8A8 integer GEMM with batch size 8, sequence length 1024, and Q/K/V projection GEMM sizes M=8192, N=4096, K=4096. For the case study, it lists model layer count, hidden dimension, sequence length, and number of CIM cores. This input is inspectable in the paper tables, but a parser, model importer, serialized graph format, or workload schema is unknown / not found in the checked sources. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Middle representation:
```

The middle representation is best read as a **design configuration tuple** plus schedule equations. The named objects are macro parameters `AL`, `LSL`, `PC`, `PL`, `OL`, fixed `WBW=8`, `IBW=8`, array parameters `BR`, `BC`, dataflow `{WS, OS}`, and interconnection `{broadcast, systolic}`. Table 3 further exposes optimized tuples `(LSL, AL, PC, PL, BC, BR, TL)`. This is inspectable in paper tables, but no single documented IR artifact or machine-readable schema was found. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Mapping or scheduling state:
```

Mapping state consists of macro-level GEMM blocking, activation block length `TL`, weight block dimensions `(PC × LSL) × AL`, loop ordering over weight rows and activation columns, array-level dataflow choice, interconnect topology, and whether weight update overlaps with compute. The schedule is described through equations and prose for WS/OS and broadcast/systolic variants. It is inspectable as paper-level scheduling semantics, but serialized traces or schedules were not found. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Hardware abstraction:
```

The hardware abstraction includes an SRAM-CIM macro template with `PC` banks, 2-bit weight slicing, subarrays, bit-wise multipliers, channel-wise and weight-wise adder trees, pipeline stages, wordline driver, input buffer, and a control/I/O interface. At array level, it includes macro rows/columns, broadcast or systolic connections, and layout abstractions through `.lib` timing and `.lef` geometry files. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Backend / simulator / codegen:
```

The backend is hybrid. The paper uses an open-source SRAM-CIM macro compiler for macro layout, SPICE for timing/power characterization, `.lib/.lef` extraction, RTL generation for macro arrays, Cadence Genus synthesis, Cadence Innovus place-and-route, an in-house cycle-accurate simulator, and post-layout PPA aggregation. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Output artifact:
```

The paper outputs Pareto frontiers, ablation plots, layout examples, and optimized design-point tables. The backend also produces final macro-array layouts, post-synthesis netlists, and PPA estimates according to Figure 6, but these generated files are not publicly exposed in an AccelCIM artifact found during this check. ([arXiv](https://arxiv.org/pdf/2604.17692))

```text
Evaluation loop:
```

The evaluation loop explores the Table 2 design space using Bayesian optimization to identify Pareto-optimal designs. It evaluates performance as theoretical throughput or end-to-end latency, power by combining post-layout power with simulator-derived transition rates, and area from the most compact timing-closed macro-array floorplan. ([arXiv](https://arxiv.org/pdf/2604.17692))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the macro/array parameter tuple, the block-GEMM schedule equations, the dataflow-specific movement rules, and the backend timing/layout metadata. The paper foregrounds dataflow exploration and PPA evaluation; the reusable semantics are most visible in Table 2, Figure 5, Equations 1–5, Figure 6, and Table 3. A future compiler-facing version of AccelCIM would likely make this state explicit as a typed hardware-mapping record that preserves workload dimensions, macro binding, data movement direction, weight-update timing, and reduction placement.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
AccelCIM’s owned slice is the mapping/scheduling space between GEMM-shaped workloads and SRAM-CIM macro-array designs. Its input boundary is a workload/problem shape and candidate hardware parameters; its output boundary is a ranked or Pareto-filtered macro-array design with latency, power, and area estimates. ([arXiv](https://arxiv.org/pdf/2604.17692))

**Secondary: A2 Simulator & cost model.**  
The paper places substantial emphasis on cycle simulation and post-layout PPA evaluation. Its cost model includes analytic cycle equations for macro-level compute/write timing, in-house cycle-accurate simulation for application cycles and transition rates, and physical-design-derived timing, area, and power. ([arXiv](https://arxiv.org/pdf/2604.17692))

**Secondary: A5 Narrow end-to-end co-design.**  
AccelCIM connects workload shape, macro parameters, array topology, interconnect, overlap capability, layout, and PPA. The demonstrated end-to-end scope is narrow and hardware-centered: GEMM-like LLM inference mapped to SRAM-CIM macro arrays through a DSE/evaluation flow. ([arXiv](https://arxiv.org/pdf/2604.17692))

**Tertiary adjacency: A1 Macro / circuit generator.**  
AccelCIM uses a CIM macro compiler and an automatic macro-array generator, but the core contribution is the dataflow exploration and evaluation flow rather than a standalone public macro compiler. The paper’s macro-array generator converts array specs into RTL and physical layouts. ([arXiv](https://arxiv.org/pdf/2604.17692))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is the design configuration: macro parameters, array dimensions, dataflow, interconnect, and overlap support. Decisions made there include macro capacity, storage/compute ratio, pipeline level, array shape, and data movement family. Decisions embedded elsewhere include Bayesian optimization policy, simulator trace semantics, Cadence closure thresholds, and final PPA aggregation. A single upstream-readable, verifiable, rewriteable artifact was not found. ([arXiv](https://arxiv.org/pdf/2604.17692))

**B4 Hardware-resource IR.**  
The paper makes hardware resources more explicit than software program structure. Macro banks, subarrays, bit-wise multipliers, adder trees, I/O interface, array rows/columns, and interconnect topology act as resource objects. The reusable boundary is clearest at the hardware mapping record and `.lib/.lef`-driven backend contract. ([arXiv](https://arxiv.org/pdf/2604.17692))

**B3 Loop / tensor-schedule IR.**  
The work describes a fixed macro-level loop structure: outer loop over `LSL` weight rows and inner loop over `TL` activation columns, with differences across dataflows in activation/weight movement and update timing. This is schedule-like, but expressed as equations/prose rather than a tensor scheduling language. ([arXiv](https://arxiv.org/pdf/2604.17692))

**B6 Accuracy / nonideality modeling: limited to physical PPA rather than numerical accuracy.**  
The paper models timing, power, area, routing, utilization, and transition rates. It does not foreground analog nonideality or application accuracy modeling; W8A8 quantization is an evaluation assumption. ([arXiv](https://arxiv.org/pdf/2604.17692))

### 5.3 Axis C — first-class CIM objects

### 5.4 Axis D — rewrite object

AccelCIM rewrites the **hardware mapping and schedule configuration**, not a frontend graph or instruction stream. The legal transformations demonstrated are:

- changing macro parameters: `AL`, `LSL`, `PC`, `PL`, overlap support;
- changing macro-array shape: `BR`, `BC`;
- choosing WS versus OS dataflow;
- choosing broadcast versus systolic interconnect;
- selecting tiling/schedule parameters such as `TL`;
- ranking candidate designs under cycle, latency, power, and area objectives. ([arXiv](https://arxiv.org/pdf/2604.17692))

The exploited equivalence is that multiple macro-array dataflows implement the same block GEMM semantics while inducing different weight-update schedules, activation movement patterns, interconnect pressure, and PPA outcomes. The preserved information includes GEMM dimensions, W8A8 precision assumptions, dot-product equivalence, weight/activation block shapes, and reduction correctness. ([arXiv](https://arxiv.org/pdf/2604.17692))

## 6. Technical mechanism reading

### 6.1 Design-space construction

AccelCIM defines a joint macro/array design space. At macro level, the key parameters are accumulation length `AL`, local storage length `LSL`, parallel channels `PC`, pipeline level `PL`, compute-I/O overlap `OL`, and fixed 8-bit weight/input bitwidths. At array level, the parameters are array row size `BR`, array column size `BC`, dataflow `{WS, OS}`, and interconnection `{broadcast, systolic}`. This is the paper’s most direct compiler-relevant abstraction: it makes a hardware mapping candidate enumerable, comparable, and searchable. ([arXiv](https://arxiv.org/pdf/2604.17692))

### 6.2 Macro behavior as a data-path contract

The macro stores a weight block of `(PC × LSL) × AL`; weights are distributed across `PC` banks and sliced into 2-bit chunks. During GEMV, the input buffer broadcasts two input bit-slices, a wordline is activated, bit-wise multipliers compute products, and results pass through subarray-level and bank-level adder trees. The paper summarizes the macro’s behavior as `PC` parallel dot products every `IBW/2` cycles. ([arXiv](https://arxiv.org/pdf/2604.17692))

Compiler/IR reading: this is a local lowering contract from a dot product to a bit-sliced, row-activated, adder-tree reduction. The representation identifies where compute capacity, storage capacity, input-bit serialization, and reduction depth enter the cost model.

### 6.3 Macro-level GEMM schedule

For one activation block and one weight row, the compute cycle count is:

`Tc = TL · IBW / 2`

For updating one weight row:

`Ts = κ · PC · WBW`

The schedule loops over `LSL` weight rows and `TL` activation columns, keeping the same wordline active over multiple inputs to reduce wordline toggling. This is important because the “compiler” object is effectively a block schedule over macro-resident weights and streamed activation columns. ([arXiv](https://arxiv.org/pdf/2604.17692))

### 6.4 Array-level dataflow alternatives

AccelCIM studies four dataflow families: WS-broadcast, WS-systolic, OS-broadcast, and OS-systolic. In WS-broadcast, macros synchronize computation and weight updates row-by-row, with idle periods caused by sequential updates. WS-systolic staggers activation entry across rows and staggers weight entry to reduce idle periods. OS-broadcast shares weight blocks within a column; OS-systolic passes weights from upstream neighbors and receives activation bits from left neighbors after updates. ([arXiv](https://arxiv.org/pdf/2604.17692))

Compiler/IR reading: the dataflow choice defines where reuse happens, how synchronization barriers arise, and whether physical interconnect is global or local. This is closer to a hardware-resource schedule than a graph IR.

### 6.5 Compute-I/O overlap as a schedule/resource feature

When compute-I/O overlap is supported, a macro can begin computation on the next row while updating the current row. Without overlap:

`Tnol = LSL × (Ts + Tc)`

With overlap:

`Tol = LSL × max(Ts, Tc)`

The paper derives an upper-bound cycle reduction of 50%, then observes that actual benefit can be modest when compute time is several times larger than write time. ([arXiv](https://arxiv.org/pdf/2604.17692))

Compiler/IR reading: overlap is a capability bit that changes legal schedules. It is not just a hardware feature; it affects whether write and compute events may occupy the same time interval.

### 6.6 Backend evaluation flow

The backend pipeline starts from macro and array parameters. A cited open-source SRAM-CIM macro compiler generates macro layouts; SPICE extracts macro timing/power; timing and geometry are compiled into `.lib` and `.lef`; array specifications are translated to RTL; Cadence Genus and Innovus produce netlists and routed layouts; floorplan utilization is swept to find the most compact timing-closed design with acceptable DRVs; post-layout area/power are extracted. ([arXiv](https://arxiv.org/pdf/2604.17692))

Compiler/IR reading: `.lib/.lef` files and array RTL act as the backend contract. This makes the paper unusually hardware-grounded compared with purely analytical CIM mappers.

### 6.7 Search and objectives

AccelCIM uses Bayesian optimization to find Pareto-optimal designs over the Table 2 space. Performance is theoretical peak throughput when no application is specified, or end-to-end latency for a specific application. Power combines post-layout static/dynamic power with transition rates from cycle-accurate simulation traces. Area comes from the timing-closed floorplan. ([arXiv](https://arxiv.org/pdf/2604.17692))

For the LLM case study, the paper uses a combined PPA trade-off metric `latency² · power · area` and reports optimized design points for Qwen3-0.6B, LLaMA-3-8B/70B, and GPT-3 175B. ([arXiv](https://arxiv.org/pdf/2604.17692))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The design tuple is the de facto IR boundary

- **Observation:** The most reusable object is the macro-array design tuple, especially `(LSL, AL, PC, PL, BC, BR, TL)` plus dataflow and overlap. Table 3 exposes this tuple as the final “compiled” design point for each LLM scenario. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** A compiler stack could treat this tuple as a typed hardware-mapping IR that separates upstream workload shape from downstream backend PPA extraction.  
- **Reusable lesson:** Future CIM IRs can borrow this parameterization as a hardware-resource dialect or mapping attribute set.

### Insight 2 — Physical interconnect turns dataflow into a layout-sensitive object

- **Observation:** Broadcast and systolic are not treated merely as abstract communication choices; the paper evaluates routing overhead and reports that broadcast dataflows incur higher area overhead due to global interconnect demands. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** Dataflow IRs for CIM need to carry enough topology information for backend placement/routing cost, not just reuse direction.  
- **Reusable lesson:** Add interconnect topology and fanout/locality fields to mapping IRs, then let backend plugins refine their PPA.

### Insight 3 — Compute-I/O overlap is a legality condition for schedules

- **Observation:** The `OL` flag changes whether computation and weight update can overlap, changing block-multiplication timing from a sum to a max expression. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** Overlap support should be modeled as a resource constraint and scheduling capability, not merely as a scalar cost parameter.  
- **Reusable lesson:** A future IR could encode mutually exclusive versus concurrent macro events: `compute(row i+1)` and `write(row i)`.

### Insight 4 — Cycle-optimal and performance-optimal mappings can diverge

- **Observation:** The paper compares cycle-oriented and performance-oriented Pareto frontiers and argues that frequency-aware evaluation changes which points are truly favorable. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** A schedule that minimizes cycles may lengthen critical paths or worsen layout timing; the IR/backend contract needs a frequency/timing feedback channel.  
- **Reusable lesson:** Treat cycle count as one metric in a multi-stage cost model, with backend timing closure able to invalidate or demote a mapping.

### Insight 5 — The LLM evaluation is GEMM-centered, which clarifies the frontend gap

- **Observation:** The demonstrated LLM setting uses W8A8 integer GEMM and reports prefill/time-to-first-token results; it does not require a public transformer graph importer to make its main claims. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** AccelCIM is most useful as a backend mapper/evaluator once a frontend has already lowered model operations to GEMM shapes.  
- **Reusable lesson:** A future corpus stack could pair AccelCIM-style mapping with a separate graph-to-GEMM lowering layer.

### Insight 6 — Bit-sliced compute is visible but not yet a value type

- **Observation:** The paper describes 2-bit weight chunks and two input bit-slices entering the macro, followed by bit-wise multiplication and adder-tree reduction. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Why it matters for CIM compiler/IR work:** This is enough to derive timing and local hardware behavior, but not yet a type-like representation of bit significance, reconstruction, or cross-operator partial sums.  
- **Reusable lesson:** A trajectory-oriented IR could attach bit-slice index, accumulation stage, and reconstruction status to values moving through an AccelCIM-style macro path.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** None found for AccelCIM itself. The paper cites and uses an external open-source SRAM-CIM macro compiler, `Richard-Hui/CIAL-CIMCompiler`, as reference [12]. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **License:** AccelCIM artifact license unknown / not found. The paper is under Creative Commons Attribution 4.0 according to the arXiv/PDF front matter. ([arXiv](https://arxiv.org/pdf/2604.17692))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** No AccelCIM artifact was found. The dependent CIAL-CIMCompiler GitHub page is public and its README lists CIM macro parameters such as `WORDS`, `BITS`, `PC`, `WEIGHT_BW`, `INPUT_BW`, `SCR`, `BPBW`, and `DFF_STAGE`, with a Baidu download link; GitHub shows no releases. ([GitHub](https://github.com/Richard-Hui/CIAL-CIMCompiler))  
- **What the artifact appears to omit:** For AccelCIM itself, public scripts, simulator source, benchmark configs, machine-readable design-space schema, generated RTL, `.lib/.lef`, P&R scripts, traces, and figure reproduction scripts were not found in the checked sources.  
- **Minimal command or workflow:** Unknown / not found for AccelCIM.  
- **Whether paper figures appear reproducible from artifact:** Unknown. The paper describes the workflow, but no public AccelCIM reproduction bundle was found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Workload shapes and model parameters are documented in paper tables; no parser/schema found. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Intermediate representation serialized | Unknown | The effective IR is a design tuple, but no serialized IR file was found. |
| Mapping decisions inspectable | Partial | Final optimized tuples and dataflow choices are visible in Table 3. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Schedule inspectable | Partial | Macro-level and array-level schedules are described in Section 3.2 and Equations 1–5. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Hardware config explicit | Yes, paper-level | Table 2 gives macro and array design parameters. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Precision / bit-slice assumptions explicit | Partial | W8A8 is explicit; 2-bit slicing is described. Propagation as a type system is not shown. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Cost model inspectable | Partial | Equations and PPA definitions are described; in-house simulator and backend scripts are not public in checked sources. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Simulator backend documented | Partial | The paper states the simulator role and transition-rate use; interface and trace schema unknown. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Generated code / instruction stream inspectable | Partial / N/A | RTL generation is part of the backend flow, but generated code was not found publicly; no instruction stream is described. ([arXiv](https://arxiv.org/pdf/2604.17692)) |
| Provenance from source op to backend action | Partial | GEMM dimensions map to design points and PPA results; per-op lowering/provenance trace unknown. |
| Reproduction scripts available | Unknown | No AccelCIM scripts found. |
| Calibration source documented | Partial | SPICE, 28 nm process, `.lib/.lef`, Cadence Genus/Innovus flow are described; calibration data files not found. ([arXiv](https://arxiv.org/pdf/2604.17692)) |

### 8.3 Integration helper

- **As frontend:** Integration is indirect. AccelCIM could accept workload descriptors after another tool lowers a model to GEMM shapes, but a reusable parser/importer is not exposed in checked public sources.
- **As IR inspiration:** The macro-array design tuple is the strongest reusable abstraction. A future IR could formalize `AL`, `LSL`, `PC`, `PL`, `OL`, `BR`, `BC`, dataflow, interconnect, and `TL` as typed mapping attributes.
- **As mapper/scheduler:** The WS/OS and broadcast/systolic scheduling rules are useful templates for mapping GEMM blocks to SRAM-CIM macro arrays.
- **As cost model:** Equations 1–5, post-layout PPA definitions, transition-rate integration, and frequency-aware Pareto ranking are natural backend plugin candidates.
- **As backend:** The backend could be wrapped if the in-house simulator, RTL generator, and Cadence scripts were exposed. With current public evidence, reuse is more direct at the specification and modeling level.
- **As benchmark:** The paper’s LLM GEMM cases, W8A8 setup, and Table 3 design points can serve as comparison targets for other mappers.
- **As validation source:** The work is valuable as a post-layout evaluation reference, especially for interconnect overhead, compute-I/O overlap, and macro-size trade-offs. Full calibration reuse would require access to the generated layouts, SPICE data, and simulator traces.

**Integration effort estimate: High.**  
Integration would be most direct through a small adapter that extracts AccelCIM-style design tuples from an existing compiler mapping record. The main effort comes from artifact availability: the paper describes a sophisticated backend flow, but the in-house simulator, RTL generator, P&R scripts, and reproduction bundle were not found publicly. The most valuable reusable boundary appears to be the hardware-mapping/cost-model abstraction rather than a runnable compiler stack.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **CiMLoop** | CIM modeling and mapping/cost evaluation | AccelCIM’s Table 1 characterizes CiMLoop-like work as weight-stationary, broadcast-oriented, flexible in macro capacity, and analytical in macro/array PPA; AccelCIM adds WS/OS, broadcast/systolic, overlap/no-overlap, and post-layout array PPA. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Useful contrast between analytical simulator stacks and post-layout-aware dataflow DSE. |
| **CIMFlow** | Systematic digital CIM architecture evaluation | AccelCIM is closest in role to CIMFlow-style framework work, but focuses specifically on macro-array dataflow alternatives and physical interconnect/layout effects. The AccelCIM references list CIMFlow as an integrated digital CIM framework. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Corpus tag should distinguish “architecture modeling framework” from “macro-array dataflow DSE.” |
| **CIM-MXU** | Systolic SRAM-CIM matrix unit / OS-style array organization | AccelCIM uses CIM-MXU as a prior-work comparison point and Table 1 lists it as output-stationary, systolic, fixed macro capacity, overlap-supported, post-layout macro PPA, and analytical array PPA. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Good baseline for OS/systolic dataflow, but AccelCIM generalizes across WS/OS and overlap choices. |
| **AutoDCIM / SEGA-DCIM / SynDCIM-style macro compilers** | SRAM-CIM macro generation and circuit-level automation | AccelCIM depends on macro generation and post-layout macro characterization but shifts the corpus object upward to macro-array organization and workload-level PPA. References list SEGA-DCIM and SynDCIM as digital CIM compiler/synthesis works. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Separate A1 macro/circuit generator entries from A3 macro-array mappers. |
| **DAMIL-DCIM** | Layout-aware digital CIM synthesis / floorplanning | AccelCIM shares the theme that physical layout matters, but uses layout to evaluate dataflow choices rather than primarily solving detailed placement. The paper references DAMIL-DCIM as a dataflow-aware floorplan and MILP placement framework. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Useful comparison for “layout-aware CIM” where the rewrite object differs: floorplan placement versus macro-array schedule/dataflow. |
| **NeuroSim** | CIM modeling and technology/architecture evaluation | AccelCIM positions NeuroSim-like tools among analytical modeling baselines; its differentiator is post-layout macro and array PPA plus explicit macro-array dataflow exploration. ([arXiv](https://arxiv.org/pdf/2604.17692)) | Corpus should separate technology-scaled analytical modeling from backend-layout-calibrated DSE. |

## 10. Corpus-ready final takeaway

- AccelCIM’s real contribution is a **systematic SRAM-CIM macro-array dataflow exploration framework** with post-layout-aware PPA evaluation.
