---
slug: sega-dcim
title: "SEGA-DCIM: Design Space Exploration-Guided Automatic Digital CIM Compiler with Multiple Precision Support"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "DATE 2025; arXiv v1 submitted 2025-05-14"
authors_or_group: "Haikang Diao, Haoyi Zhang, Jiahao Song, Haoyang Luo, Yibo Lin, Runsheng Wang, Yuan Wang, Xiyuan Tang"
summary: >-
  SEGA-DCIM is a digital SRAM-CIM macro-generation and design-space-exploration framework for producing Pareto-frontier DCIM macro designs across integer and floating-point precision choices. Its strongest contribution is the combination of a parameterized synthesizable DCIM architecture, normalized analytical area/delay/energy/throughput models, an NSGA-II-based multi-objective search over macro parameters, and a template-based Verilog/netlist/layout generation flow that relies on user-provided cell/layout resources and commercial EDA tools. The demonstrated workload abstraction is matrix-vector multiplication with static stored weights and streamed input vectors, evaluated mainly through macro-level PPA trends, generated layouts, and comparisons against published DCIM macro results. For CIM compiler/IR research, SEGA-DCIM is most useful as a hardware-generation and backend-cost-model reference: it makes DCIM macro structure and numeric precision choices first-class, while workload graph import, tensor IR, CIM ISA, runtime state, and simulator-facing instruction streams sit outside the demonstrated interface. ([arXiv](https://arxiv.org/abs/2505.09451)) |
links:
  paper: https://arxiv.org/abs/2505.09451
  artifact:
  docs:
  code:
technology:
  - "digital-CIM"
  - "SRAM-CIM"
  - "TSMC28-evaluated"
workloads:
  - "matrix-vector multiplication"
  - "NN macro computation with static stored weights"
  - "macro-level INT/FP precision sweeps"
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A3, A2, A5]
axis_B: [B1, B4]
axis_C_first_class_objects:
  - "DCIM_array_hierarchy"
  - "SRAM_weight_storage"
  - "weight_bit_column_mapping"
  - "input_bit_chunk_k"
  - "compute_unit"
  - "adder_tree"
  - "shift_accumulator"
  - "result_fusion_unit"
  - "FP_pre_alignment"
  - "INT_to_FP_converter"
  - "macro_layout"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "architecture_template_choice"
  - "array_binding"
  - "numeric_format"
  - "macro_generation_flow"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown / no implementation license found"
  last_checked: "2026-05-19"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Compiler boundary is macro/circuit/layout generation, not workload graph lowering."
  - "Design vector and component cost model are the clearest reusable abstractions."
  - "Backend reuse depends on unavailable templates, scripts, PDK collateral, and commercial EDA setup."
  - "Useful value-trajectory ingredients include bit-position columns, k-bit temporal input chunks, shift accumulation, result fusion, and FP pre-alignment/conversion."
  - "Artifact URL spot-check on 2026-05-19 found arXiv/paper mirrors but no official public implementation link."
takeaways: []
---

# SEGA-DCIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Primary: A1 macro / circuit generator. Secondary: A3 DSE framework, A2 cost model, narrow A5 macro-flow co-design.** | The demonstrated slice starts from a customized cell library, architecture templates, technology files, and user specifications such as weight count and precision, then searches Pareto-frontier DCIM macro designs and generates layouts through commercial EDA tools. The paper’s “compiler” boundary is a DCIM circuit/layout generator rather than a workload-to-execution compiler. ([arXiv](https://arxiv.org/html/2505.09451)) |
| Middle-layer style, Axis B | **B1 config-as-IR + B4 hardware-resource IR.** | The central representation is a design candidate containing an architecture type and design parameters such as `N`, `H`, `L`, `k`, precision fields, and storage-weight count. These parameters drive cost equations, NSGA-II search, Verilog generation, and layout generation. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| First-class CIM objects, Axis C | **DCIM array hierarchy, SRAM-cell weight storage, column/bit mapping, input bit chunk `k`, adder tree, shift accumulator, result-fusion unit, FP pre-alignment, INT-to-FP conversion, macro layout.** | The paper directly names and models these structures in the synthesizable architecture and cost model. ADC/DAC objects are not applicable to the demonstrated all-digital macro path. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Rewrite object, Axis D | **Hardware mapping / architecture-template choice / numeric-format parameterization / macro-generation flow trajectory.** | The tool searches and transforms macro design candidates, not operator graphs or loop schedules. Legal changes include selecting integer vs floating-point template, changing array dimensions, sharing factor `L`, input chunk `k`, and precision fields under capacity constraints. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Best corpus tags | `digital-CIM`, `SRAM-CIM`, `macro-generator`, `DCIM-compiler`, `design-space-exploration`, `NSGA-II`, `PPA-cost-model`, `multi-precision-INT-FP`, `template-Verilog-generation`, `commercial-EDA-layout` | These tags match the evidenced macro generator, analytical PPA model, multi-objective search, and Innovus-backed layout flow. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Closest comparison baselines | **AutoDCIM, EasyACIM, CIMFlow, DNN+NeuroSim / NeuroSim, MemGen / OpenSAR.** | AutoDCIM and EasyACIM are the closest CIM automation baselines named by the paper; CIMFlow is closer to a workload compiler / ISA / simulator stack; DNN+NeuroSim is closer as a CIM benchmarking/cost-model framework; MemGen/OpenSAR are adjacent macro-generator automation precedents. ([arXiv](https://arxiv.org/html/2505.09451)) |

## 2. One-paragraph public summary

SEGA-DCIM is a digital SRAM-CIM macro-generation and design-space-exploration framework for producing Pareto-frontier DCIM macro designs across integer and floating-point precision choices. Its strongest contribution is the combination of a parameterized synthesizable DCIM architecture, normalized analytical area/delay/energy/throughput models, an NSGA-II-based multi-objective search over macro parameters, and a template-based Verilog/netlist/layout generation flow that relies on user-provided cell/layout resources and commercial EDA tools. The demonstrated workload abstraction is matrix-vector multiplication with static stored weights and streamed input vectors, evaluated mainly through macro-level PPA trends, generated layouts, and comparisons against published DCIM macro results. For CIM compiler/IR research, SEGA-DCIM is most useful as a hardware-generation and backend-cost-model reference: it makes DCIM macro structure and numeric precision choices first-class, while workload graph import, tensor IR, CIM ISA, runtime state, and simulator-facing instruction streams sit outside the demonstrated interface. ([arXiv](https://arxiv.org/abs/2505.09451)) |

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “Automatic DCIM compiler” supporting multiple precision, including INT and FP. | Abstract and contribution bullets. ([arXiv](https://arxiv.org/abs/2505.09451)) | Paper claim + architecture + experiment. | The paper defines two architecture templates: multiply-based integer DCIM and pre-aligned floating-point DCIM. Experiments cover INT2, INT4, INT8, INT16, FP8, FP16, FP32, and BF16. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Demonstrated as macro-level circuit/layout generation and PPA exploration. The paper-level interface is user specs plus architecture/cell/technology inputs, not a DNN frontend or graph compiler. |
| Multi-objective design-space exploration selects Pareto-frontier DCIM designs. | Introduction and Section III-B. ([arXiv](https://arxiv.org/html/2505.09451)) | Equation + algorithm description + experiment. | Integer and FP objectives minimize area, delay, energy, and negative throughput; NSGA-II is applied across multiple architectures, followed by optional user distillation. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | The paper describes use of NSGA-II but does not provide public code, hyperparameters, random seeds, or a serialized search trace in the checked sources. |
| Concise estimation models for multiple-precision DCIM. | Section III-B and Tables II–VI. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Equation + analytical cost tables. | Standard cells and logic modules are normalized to NOR-gate-based area/delay/energy; adder tree, shift accumulator, result fusion, FP pre-alignment, and INT-to-FP converter are modeled. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | The model is demonstrated with TSMC28 assumptions. SRAM latency and power are approximated as zero in the analytical model, so calibration to another SRAM macro or PDK would require revisiting those assumptions. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Template-based generator can generate netlists and layouts. | Abstract, Fig. 4 / Section III-C, and experimental layouts. ([arXiv](https://arxiv.org/abs/2505.09451)) | Paper-only generator description + generated-layout experiment. | The flow separates memory array, DCIM compute component, and digital peripherals; memory-array generation duplicates fixed computing units; compute/peripheral generation is converted to Verilog generation; Innovus handles synthesis/layout. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | The reusable boundary is clearest at selected macro parameters and generated Verilog/layout. Public reuse would depend on access to the scripts, templates, cell layouts, PDK collateral, and Innovus setup. |
| Generated designs are competitive with SOTA DCIMs. | Section IV and Fig. 8. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Experiment / comparison. | The paper compares selected 64K-weight INT8 and BF16 designs against published 22 nm DCIM macros, reporting higher energy efficiency but lower area efficiency for the selected points. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | The comparison is macro-level and paper-level; it compares generated designs against published SOTA numbers rather than a fabricated SEGA-DCIM chip measurement. |
| The template approach can be extended to new DCIM structures. | Contribution bullets. ([arXiv](https://arxiv.org/html/2505.09451)) | Paper-only design argument. | The generator is organized around architecture templates and component categories, which is a plausible extension point. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Artifact-level confirmation would require a documented template API, example of adding a new architecture, or public generator code. Unknown / not found in the checked sources. |

## 4. Stack anatomy

```text
Input / frontend:
  User macro specifications: number of stored weights, data precision, and other requirements; customized cell library; multiple architecture templates; technology files / PDK collateral.
  Object type: configuration and hardware resources, not a neural-network graph IR.
  Serialization / reuse: paper describes the inputs, but no public schema or config files were found.

Middle representation:
  Pareto candidate design: architecture type plus design parameters such as N, H, L, k, input/weight bit width, mantissa/exponent width, and Wstore.
  Object type: design-point configuration / hardware-resource vector.
  Serialization / reuse: conceptually inspectable in the paper; public serialized representation unknown.

Mapping or scheduling state:
  Macro-level binding of weight bits to SRAM columns, input-bit chunks per cycle, sharing of L weights per compute unit, and selection of integer or FP data path.
  Object type: hardware mapping and numeric-format schedule embedded in parameters and equations.
  Serialization / reuse: partially explicit in equations and diagrams; no separate mapping file found.

Hardware abstraction:
  DCIM array, SRAM cells, compute unit, adder tree, shift accumulator, result-fusion unit, FP pre-alignment, INT-to-FP converter, input/output buffers.
  Object type: parameterized hardware template and analytical PPA model.
  Serialization / reuse: strongest paper-level abstraction; implementation templates not public in checked sources.

Backend / simulator / codegen:
  Template-based DCIM generator producing memory-array, compute-component, and peripheral netlists/layouts; Verilog generation for variable bit-width logic; commercial Innovus for synthesis/layout.
  Object type: codegen and physical-design flow.
  Serialization / reuse: generated Verilog/netlists/layouts are claimed, but public examples/scripts were not found.

Output artifact:
  Pareto-frontier DCIM designs and selected Pareto-frontier DCIM layouts.
  Object type: macro design points, Verilog/netlist/layout artifacts.
  Serialization / reuse: paper shows selected layouts; no downloadable generated artifacts were found.

Evaluation loop:
  Analytical PPA estimation, NSGA-II Pareto search, optional user distillation, commercial layout generation for selected designs, design-space plots and SOTA comparisons.
  Object type: DSE trajectory plus macro PPA results.
  Serialization / reuse: paper-level; public run scripts and logs not found.
```

The paper’s framework diagram names the inputs, NSGA-II explorer, optional user distillation, template generator, commercial placement/routing stage, and Pareto-frontier layouts. The detailed text further explains that each Pareto design contains an architecture type and design parameters, and that generation is performed only after the Pareto set is reduced by user selection. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the design-parameter vector, architecture-template choice, precision fields, analytical cost tables, and backend template assumptions. The paper foregrounds a “compiler” flow, while the reusable semantics are most visible in the parameterized macro-resource model: which bits are stored in which columns, how many input bits are consumed per cycle, where partial sums accumulate, and how integer results are fused or converted back to floating-point format. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 Macro / circuit generator.**  
SEGA-DCIM owns the slice from DCIM macro specification to generated Verilog/netlist/layout. Its input is a macro-level configuration plus architecture/cell/technology resources; its output is a set of Pareto-frontier macro designs and selected layouts. The paper’s generator directly targets memory arrays, DCIM compute components, and digital peripherals. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The MOGA/NSGA-II explorer searches over macro parameters and architecture choices to rank area, delay, energy, and throughput trade-offs. This is mapping-like at the hardware-resource level: it chooses array shape, sharing factor, input chunk width, and precision-specific datapath structure rather than mapping a complete neural-network graph. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**Secondary: A2 Simulator & cost model.**  
The paper provides analytical PPA equations for standard cells, logic modules, DCIM components, integer DCIM, and floating-point DCIM. The model is a design-time estimator rather than a full-system simulator. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**Narrow A5 end-to-end co-design, at macro-flow scope.**  
The demonstrated flow reaches physical layout through commercial tools, so it is end-to-end from macro spec to layout. The “end-to-end” boundary is hardware-macro generation, not workload import through runtime execution. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is the Pareto candidate: an architecture type plus design parameters. The decisions made there include integer vs floating-point architecture, number of columns `N`, array height `H`, sharing factor `L`, per-cycle input width `k`, and precision fields. Decisions about template implementation, exact Verilog structure, Innovus constraints, and PDK-specific calibration remain embedded in generator scripts and backend setup. No single public artifact was found that upstream passes could read, verify, and rewrite. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**B4 Hardware-resource IR.**  
The representation names hardware resources: SRAM cells, compute units, adder trees, shift accumulators, result-fusion units, pre-alignment, and INT-to-FP conversion. The cost model makes these resources countable and rankable. The resource abstraction is especially clear for array dimensions, bit-position columns, and accumulation/reconstruction paths. It is less clear as a reusable API because the implementation is paper-described rather than public. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

**Numeric-format parameterization within B1/B4.**  
Integer fields `Bx`/`Bw` and floating-point mantissa/exponent fields `BM`/`BE` influence both legal search space and hardware structure. This is not presented as a type system, but it is close to a type-like hardware contract: changing precision changes the input-buffer cadence, pre-alignment, accumulator width, result-fusion cost, and conversion path. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware template / parameter.** The paper uses a DCIM array with width `L * N`, height `H`, memory array, compute component, peripherals, and final macro layout. | Fig. 3/Fig. 4 and framework text. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Bit-slicing / bit significance | **First-class parameterized mapping.** Weight bits are mapped to different columns; result fusion shifts and sums columns according to weight-bit position. | Weight mapping and result-fusion description. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| ADC/DAC precision or sensing | **Not applicable.** The demonstrated architecture is all-digital DCIM; no ADC/DAC path is part of the macro model. | The architecture uses digital compute units, adder trees, shift accumulators, and converters, not analog sensing. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Analog-to-digital or domain transition | **Numeric domain transition is costed; analog transition is not applicable.** INT-to-FP conversion is explicitly modeled; analog-to-digital conversion is not part of the digital macro. | INT-to-FP converter description and cost-model placement. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Peripheral circuits as path nodes | **First-class / costed.** FP pre-alignment, input buffer, adder tree, shift accumulator, result fusion, and INT-to-FP converter are named and costed. | Section III-A/III-B component descriptions. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Partial-sum accumulation path | **First-class / costed.** Adder tree and shift accumulator collect partial sums across compute units and cycles. | Shift accumulator and adder-tree descriptions. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Reconstruction / shift-add tree | **First-class / costed.** The result-fusion unit shifts and sums column results to recover full weight precision. | Result-fusion text and cost-model discussion. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly not applicable / implicit.** The comparison metric assumes 10% sparsity, but the paper does not expose masks, batching state, KV cache, or runtime scheduling state as represented objects. | SOTA comparison metric states 10% sparsity; no runtime-state IR is described. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |
| Value trajectory / flow path | **Approximated structurally.** The data path is drawn and costed through pre-alignment, array, adder tree, shift accumulator, fusion, and conversion, but value identity is not serialized as an IR object. | Fig. 3 architecture and component descriptions. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) |

### 5.4 Axis D — rewrite object

SEGA-DCIM rewrites **hardware design candidates**. The transformed object is not an operator graph, loop nest, tensor schedule, instruction stream, or runtime table; it is a macro design point that binds numeric precision to a DCIM hardware template.

The legal transformations include:

- selecting multiply-based integer DCIM or pre-aligned floating-point DCIM;
- changing `N`, `H`, `L`, and `k`;
- changing integer precision fields `Bx`/`Bw` or floating-point fields `BM`/`BE`;
- changing storage capacity through `Wstore`;
- ranking candidates by area, delay, energy, and throughput;
- selecting Pareto-frontier candidates for template-based generation. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

The main equivalences exploited are hardware/numeric decompositions: a multi-bit weight can be distributed over bit-position columns; input precision can be consumed in `k`-bit chunks across cycles; floating-point mantissa multiplication can be lowered to aligned integer mantissa MAC plus output conversion. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

Information that must be preserved across lowering includes storage-weight count, numeric precision, bit significance, array dimensions, sharing factor, input-cycle cadence, partial-sum width, and reconstruction/conversion path. The representation is especially well suited to macro PPA exploration; expressing graph-level rematerialization, cross-operator bit-slice reuse, runtime sparsity scheduling, or instruction-level execution would likely require an additional abstraction for workload operators, value identity, schedule state, and backend-visible execution commands.

## 6. Technical mechanism reading

### 6.1 Macro architecture as the compiler target

The paper frames DCIM around matrix-vector multiplication: weights are pre-stored in the memory array, input vectors are streamed through an input buffer, computation happens in parallel within the memory array, and outputs are extracted through an output buffer. ([arXiv](https://arxiv.org/html/2505.09451))

The proposed synthesizable DCIM architecture contains an FP pre-alignment block, input buffer, CIM array, and INT-to-FP converter. Integer inputs bypass FP pre-alignment and conversion; floating-point inputs use exponent alignment so that mantissas can be processed through an integer mantissa MAC path. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 6.2 Bit-level storage and accumulation

The macro stores each weight bit in a separate column. If a weight is 4 bits, the four bits are mapped to four columns. A sharing factor `L` allows multiple weights to share one compute unit; at compute time, a selection gate chooses a one-bit weight and performs `1-bit × k-bit` multiplication. The paper implements that multiplication using `k` four-transistor NOR gates. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

Partial sums flow through an adder tree and shift accumulator. The shift accumulator collects adder-tree outputs across the `Bx / k` cycles needed to consume a `Bx`-bit input. The result-fusion unit then shifts and sums outputs from multiple weight-bit columns to reconstruct the full-precision result. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 6.3 Floating-point lowering as pre-aligned integer MAC

For FP operation, the weight mantissa is aligned offline and stored in the DCIM array before neural-network computation. At runtime, the input exponents are compared to find `XEmax`; each input exponent offset is computed as `XEmax - XE`; each input mantissa is shifted by that offset; then aligned input mantissas and weight mantissas use the same integer mantissa MAC datapath. The final integer output is converted back to FP by shifting, computing exponent/sign bits, and combining sign, exponent, and mantissa. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

For compiler researchers, this is one of the paper’s most useful mechanisms: the FP path is not treated as a black box. It is decomposed into pre-alignment, integer MAC, and reconstruction/conversion stages, each with area/delay/energy consequences.

### 6.4 Analytical cost model

The cost model starts from standard cells normalized to a NOR-gate reference under TSMC28 digital-circuit assumptions. The tables include NOR, OR, MUX2, half adder, full adder, DFF, and SRAM costs; SRAM latency and power are approximated as zero because weights are hard-wired from SRAM cells to compute units and leakage is treated as small. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

Logic modules are then built from those cells: 1-bit by `N`-bit multiplier, `N`-bit adder, `N:1` mux, `N`-bit shifter, and comparator. The paper states that the adder uses carry-ripple structure, the shifter uses barrel-shifter structure, and the comparator is simplified to an `N`-bit adder. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

Those module costs compose into component models for adder tree, shift accumulator, result fusion, FP pre-alignment, and INT-to-FP conversion. Integer and FP macro-level area/delay/energy/throughput equations are then built from those components. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 6.5 NSGA-II search objective

For integer DCIM, the paper formulates a multi-objective vector over macro parameters:

`F(N, H, L, k, Bw, Bx) = [A_INT, D_INT, E_INT, -T_INT]`

subject to a storage-capacity constraint tying `N`, `H`, `L`, `Bw`, and `Wstore`. For FP DCIM, the analogous vector is:

`F(N, H, L, k, Bw, BE, BM) = [A_FP, D_FP, E_FP, -T_FP]`

with a similar storage-capacity relation involving mantissa width. The negative throughput term makes throughput maximization compatible with minimization-style Pareto ranking. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

One audit note: the paper text elsewhere states `1 ≤ k ≤ Bx` for integer MAC, while the printed optimization constraint uses `k - Bx ≥ 0` and describes it as ensuring the single-round input bit cannot exceed total input width. Reuse of the formulation should validate the intended inequality direction against the implementation. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 6.6 Backend and physical design assumptions

After Pareto search and optional user distillation, the template generator emits the memory array, compute components, and digital peripherals. Memory-array generation duplicates fixed computing units; compute and peripheral generation is converted into Verilog generation; commercial Innovus handles synthesis and layout generation with predefined constraints; scripts merge the resulting layout pieces. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

The experiments use a Linux server with Intel Xeon Gold 6248 CPU, TSMC28 PDK, multiple architectures, precisions from INT2 to FP32/BF16, and `Wstore` from 4K to 128K. The paper reports that MOGA exploration for a particular array size and precision can finish in 30 minutes, and each selected design can be generated within one hour after user-defined distillation. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The design vector is the de facto IR boundary

- **Observation:** The most reusable middle object is the Pareto candidate: architecture type plus parameters such as `N`, `H`, `L`, `k`, `Wstore`, and precision fields.
- **Why it matters for CIM compiler/IR work:** This is the object that the explorer ranks, the generator consumes, and the layout flow instantiates.
- **Reusable lesson:** A future CIM IR could make this design vector explicit as a typed backend contract, with fields for array geometry, bit position, per-cycle input width, and numeric mode.

### Insight 2 — Precision is structural, not metadata

- **Observation:** Changing precision changes the input-buffer cadence, accumulator width, result-fusion width, FP pre-alignment, and INT-to-FP conversion path.
- **Why it matters for CIM compiler/IR work:** Precision annotations in CIM stacks often look like scalar type metadata; SEGA-DCIM shows that they alter hardware topology and costed path length.
- **Reusable lesson:** A future IR should propagate precision fields into storage layout, accumulation width, reconstruction path, and conversion cost rather than treating precision as a late codegen flag.

### Insight 3 — FP support is a lowering pattern

- **Observation:** Floating-point computation is lowered into exponent pre-alignment, integer mantissa MAC, and INT-to-FP reconstruction.
- **Why it matters for CIM compiler/IR work:** This resembles a compiler lowering from FP algebra to a structured integer-CIM path.
- **Reusable lesson:** Future stacks could represent FP-CIM lowering as an explicit pass with verifiable preconditions: exponent alignment, mantissa shift, integer partial-sum width, and output normalization.

### Insight 4 — The cost model separates resource counting from Pareto ranking

- **Observation:** The paper first derives resource-level cost formulas and then wraps them in NSGA-II objective vectors.
- **Why it matters for CIM compiler/IR work:** This separation is useful: legality and cost extraction can be modular, while search policy can change.
- **Reusable lesson:** A reusable compiler stack could expose SEGA-like component cost models as backend plugins and allow different search algorithms to consume the same hardware-resource IR.

### Insight 5 — Physical design collateral is part of the compiler contract

- **Observation:** The backend depends on customized cells, technology files, DRC/LVS rules, Innovus constraints, and user-supplied basic computing-unit netlists/layouts.
- **Why it matters for CIM compiler/IR work:** Macro compilers need a contract that includes physical collateral, not just logical operations.
- **Reusable lesson:** Public CIM compiler corpora should record whether the backend contract is logical IR, RTL, layout templates, PDK-specific scripts, or commercial-tool constraints.

### Insight 6 — Constraint auditability matters

- **Observation:** The paper’s prose and printed inequality for `k` appear directionally inconsistent, while the architecture text and cost model imply `1 ≤ k ≤ Bx`.
- **Why it matters for CIM compiler/IR work:** DSE formulations are executable semantics. Small constraint ambiguities can change the legal design space.
- **Reusable lesson:** Future IR/search artifacts should serialize constraints in machine-checkable form and include validation tests for legal design points.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** No implementation license found. The arXiv page has a paper-license link, but no public code/data/media artifact is listed as an implementation artifact. ([arXiv](https://arxiv.org/abs/2505.09451))
- **Last checked date:** 2026-05-15.
- **Checked sources:** arXiv abstract and code/data/media area; author pages for Haikang Diao, Haoyi Zhang, and Yibo Lin; web/GitHub search results; community SRAM-CIM literature index. The author pages list the paper with arXiv/PDF/DOI-style links, and the community software-stack list shows SEGA-DCIM with a paper link only. ([arXiv](https://arxiv.org/abs/2505.09451))
- **What the artifact contains:** No public artifact located.
- **What the artifact appears to omit:** Public implementation, generator templates, NSGA-II scripts, configuration schemas, example generated Verilog/netlists/layouts, benchmark scripts, issue tracker, release notes, and reproduction instructions were not found in the checked public sources.
- **Minimal command or workflow:** Unknown / not documented publicly.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper describes a TSMC28 + Innovus flow and reports generated layouts, but no public scripts or collateral were found for reproducing the figures. ([arXiv](https://arxiv.org/pdf/2505.09451v1))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Inputs are described as customized cell library, multiple architectures, technology files, weight count, and precision; no public schema found. |
| Intermediate representation serialized | Unknown | Pareto designs contain architecture type and parameters, but no serialized IR/config artifact was found. |
| Mapping decisions inspectable | Partial | Weight-bit column mapping, `L` sharing, and `k`-bit input cadence are described in prose and equations. |
| Schedule inspectable | Partial | Input chunking across `Bx/k` cycles is described; no executable schedule trace found. |
| Hardware config explicit | Partial | Parameters and architecture blocks are clear in the paper; public config files unknown. |
| Precision / bit-slice assumptions explicit | Yes | INT/FP precision fields, bit-column mapping, and result fusion are described. |
| Cost model inspectable | Partial | Equations/tables are in the paper; implementation/calibration source not public. |
| Simulator backend documented | N/A / Partial | The backend is commercial EDA layout generation rather than a simulator. Innovus use is described, but setup scripts are not public. |
| Generated code / instruction stream inspectable | Partial / N/A | Verilog/netlist/layout generation is claimed; no instruction stream is part of the demonstrated stack; generated code examples not public. |
| Provenance from source op to backend action | Unknown | The source object is macro config rather than graph op; no provenance trace found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | TSMC28 normalized cell assumptions are described, but the PDK data and calibration files are not public. |

### 8.3 Integration helper

- **As frontend:** SEGA-DCIM is not a direct frontend for a CIM compiler stack. It does not expose a PyTorch/ONNX/MLIR importer in the checked sources. Integration as frontend would require a new adapter from workload-level operators to `Wstore`, precision, and macro-shape requirements.

- **As IR inspiration:** Strong. The design vector can inspire a backend hardware-resource IR with fields for array shape, storage capacity, bit-column mapping, input chunk width, precision stage, accumulation width, and reconstruction path.

- **As mapper/scheduler:** Medium. The macro-level DSE logic could be adapted to choose macro parameters for a larger compiler, but graph partitioning, layer scheduling, inter-macro data movement, and runtime state would need separate abstractions.

- **As cost model:** Strong paper-level inspiration. The component formulas could become backend cost plugins, especially for digital SRAM-CIM macro resources. Reuse would require recalibration for a target PDK, SRAM macro, and standard-cell library.

- **As backend:** Potentially useful but high effort without artifact. A wrapper could target a SEGA-like generator if templates and scripts become available; in the checked public sources, the backend depends on commercial tools and private collateral.

- **As benchmark:** Partial. The paper’s precision set, `Wstore` sweep, and selected INT8/BF16 design points can be used as macro-DSE benchmark cases. It is less direct as a workload benchmark because no end-to-end model suite is exposed.

- **As validation source:** Partial. The paper provides generated-layout results and SOTA comparisons, but no chip measurement for SEGA-generated macros and no public calibration data.

**Integration effort estimate: High.** Integration would be most direct through a small adapter that emits SEGA-like macro parameter vectors and consumes analytical PPA estimates. However, a reusable implementation would need public templates, generator scripts, PDK-independent calibration hooks, and a documented schema. The most valuable reusable boundary appears to be the parameterized hardware-resource/cost abstraction rather than the closed physical-design flow.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AutoDCIM** | Automated digital CIM macro compilation. | SEGA-DCIM extends the design-space focus toward Pareto search and multiple precision; the SEGA paper characterizes AutoDCIM as digital, integer-only, single-architecture/user-defined trade-off compared with SEGA’s INT/FP and automatic Pareto frontier. ([arXiv](https://arxiv.org/html/2505.09451)) | Keep both under macro-generation/compiler-flow tags, but distinguish “template macro compiler” from “DSE-guided multi-precision macro compiler.” |
| **EasyACIM** | End-to-end CIM macro automation with MOGA-based DSE and layout generation. | EasyACIM targets analog CIM and includes ADC-related ACIM design choices; SEGA-DCIM targets digital SRAM-CIM and replaces analog sensing concerns with digital bit-slice, accumulation, and INT/FP reconstruction paths. ([arXiv](https://arxiv.org/abs/2404.13062?utm_source=chatgpt.com)) | Useful pair for technology-neutral taxonomy: both are macro generators, but Axis C first-class objects differ sharply. |
| **CIMFlow** | Digital CIM design/evaluation framework and DSE. | CIMFlow exposes a full-stack workflow from neural-network compilation to cycle-accurate simulation with ISA, MLIR-based compiler, and public repo; SEGA-DCIM focuses on macro-level design generation and physical layout. ([GitHub](https://github.com/BUAA-CI-LAB/CIMFlow?utm_source=chatgpt.com)) | Strong contrast for corpus users: CIMFlow is closer to A4/A6 workload compiler + simulator; SEGA-DCIM is closer to A1/A3 macro DSE. |
| **DNN+NeuroSim / NeuroSim** | CIM cost/performance modeling and benchmarking. | DNN+NeuroSim is an end-to-end benchmarking framework with a Python wrapper for PyTorch/TensorFlow; SEGA-DCIM uses analytical macro PPA models to guide layout-generating hardware DSE. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611?utm_source=chatgpt.com)) | Separate simulator/modeling stacks from generator stacks, even when both use PPA equations. |
| **MemGen / OpenSAR** | Automated circuit/macro generation precedent. | MemGen and OpenSAR are adjacent EDA macro-generator flows cited as inspiration; SEGA-DCIM specializes this idea for multi-precision digital CIM macro architecture and DSE. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Good examples of “compiler” meaning circuit generator, not software workload compiler. |
| **Published SOTA DCIM macros** | Macro PPA comparison targets. | SEGA-DCIM compares selected generated INT8/BF16 design points against published DCIM macros, but those baselines are hardware designs rather than compiler stacks. ([arXiv](https://arxiv.org/pdf/2505.09451v1)) | Use them as performance baselines, not taxonomy-neighbor compiler baselines. |

## 10. Corpus-ready final takeaway

- SEGA-DCIM’s real contribution is a **DSE-guided digital SRAM-CIM macro generator** with multi-precision INT/FP support.
- The strongest reusable stack layer is the **hardware-resource/cost abstraction**: array shape, bit-position columns, input chunk width, accumulation path, result fusion, and FP pre-alignment/conversion.
- The evidenced scope is **macro specification to Pareto design points and selected layouts**, using analytical PPA estimation plus commercial EDA-backed generation.
- The first-class CIM objects are **DCIM array hierarchy, SRAM weight storage, bit-column mapping, compute units, adder trees, shift accumulators, result-fusion units, FP pre-alignment, and INT-to-FP conversion**.
- The hidden IR is best read as the **architecture-template choice plus design-parameter vector plus cost tables plus generator/backend assumptions**.
- **Artifact status: no public artifact found.** Public reuse would require scripts, templates, configs, generated examples, and backend setup details.
- Integration into a future compiler stack would be most direct as a **backend cost-model and macro-template target**, not as a frontend or runtime.
- For value-trajectory IR work, SEGA-DCIM is useful because it exposes **bit significance, temporal input chunking, partial-sum accumulation, reconstruction, and numeric conversion** as costed macro-path elements.
