---
slug: openacmv2
title: "OpenACMv2: An Accuracy-Constrained Co-Optimization Framework for Approximate DCiM"
short_title: "OpenACMv2"
subtitle: "Scoped CIM stack note"
year: 2026
venue: "DAC 2026 / arXiv preprint"
authors_or_group: "Yiqi Zhou, Yue Yuan, Yikai Wang, Bohao Liu, Qinxin Mei, Zhuohua Liu, Shan Shen, Wei Xing, Daying Sun, Li Li, Guozhu Liu"
summary: >-
  OpenACMv2 contributes an accuracy-constrained architecture–circuit co-optimization flow for approximate digital SRAM-based compute-in-memory processing elements. Its strongest reusable layer is the design-space exploration and cost-model boundary: Level-I encodes approximate multiplier choices and SRAM macro parameters as optimizer states, evaluates multiplier error/PPA through PEA-GNN, and selects Pareto candidates under MRED/NMED budgets; Level-II refines selected compressor cells and SRAM bitcells through SPICE/PVT/Monte Carlo-style transistor sizing. The demonstrated workloads are image blending for 8-bit multipliers and CIFAR-10 inference for 16-bit multipliers, with hardware evidence centered on 8/16-bit approximate multipliers, SRAM macro configurations, FreePDK45/Nangate45-style cells, OpenROAD/OpenSTA/VCS evaluation, and Xyce/SPICE-style sizing. For CIM compiler/IR research, the paper is most useful as a concrete example of making approximate arithmetic choices, SRAM macro parameters, and circuit-validity constraints first-class optimization objects, while high-level workload ingestion, tensor IR, instruction lowering, and runtime abstractions remain outside the paper’s main demonstrated interface. ([arXiv](https://arxiv.org/pdf/2603.13042))
links:
  paper: https://arxiv.org/pdf/2603.13042
  artifact: https://github.com/ShenShan123/OpenACM
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
  - "approximate-CIM"
  - "DCiM"
workloads:
  - "image blending"
  - "CIFAR-10 inference"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A5, A1]
axis_B: [B1, B2, B4, B6]
axis_C_first_class_objects:
  - "approximate 4:2 compressor variant"
  - "compressor slot"
  - "partial-product column approximation region"
  - "bit significance"
  - "multiplier reduction stage"
  - "SRAM rows / columns / mux ratio / array count"
  - "6T bitcell transistor width"
  - "PVT / Monte Carlo condition"
  - "MRED / NMED accuracy budget"
axis_D_rewrite_objects:
  - "hardware configuration"
  - "numeric approximation choice"
  - "SRAM macro organization"
  - "transistor sizing vector"
  - "accuracy/PPA search trajectory"
artifact:
  status: "public artifact found; partial relative to full figure reproduction"
  url: "https://github.com/ShenShan123/OpenACM"
  license: "Apache-2.0"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Most reusable boundary is the ACCO optimization state, not a named compiler IR."
  - "PEA-GNN provides a compact hardware-flow graph for approximate multiplier error/PPA prediction."
  - "Level-I selects approximate arithmetic semantics; Level-II preserves selected truth tables while optimizing circuit cost."
  - "High-level graph ingestion, tensor scheduling, ISA/runtime, and cross-operator value trajectories are outside the demonstrated core."
takeaways: []
---

# OpenACMv2 — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with **A2 simulator & cost model**, **A5 narrow end-to-end co-design**, and inherited **A1 macro / circuit generator** roles | The paper’s central contribution is ACCO: Level-I searches multiplier compressor assignments, partial-product approximation patterns, and SRAM macro configurations; Level-II sizes compressor and SRAM bitcell transistors under PVT/variation. The paper frames this around an OpenACM/OpenYield-backed DCiM PE flow rather than a general compiler IR. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B4 hardware-resource IR**, **B6 accuracy / nonideality modeling**, plus **B2 graph-as-IR inside PEA-GNN** | The named middle objects are a compressor assignment vector `a`, a stage-wise graph `G=(V,E)` for the multiplier surrogate, SRAM tuples `(r,c,μ,nₐ)`, transistor width vectors `w`, and YAML / JSON-style optimization configs. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| First-class CIM objects, Axis C | Approximate 4:2 compressor type, compressor slot, PP-column approximation region, reduction-tree stage, 8/16-bit multiplier, SRAM bank rows/columns/mux/array count, 6T bitcell device widths, PVT/Monte Carlo corner, MRED/NMED budget, PE macro | These are directly named in equations, figures, optimizer states, and artifact commands. ADC/DAC objects are not central because the demonstrated architecture is digital SRAM/DCiM. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Rewrite object, Axis D | **Hardware mapping / architecture configuration**, **numeric approximation choice**, **transistor sizing trajectory**, **accuracy model** | Transformations choose compressor types per slot, which PP columns are approximate, SRAM macro shape, and transistor sizes / threshold choices. The paper does not foreground graph-level NN lowering, tensor scheduling, ISA generation, or runtime-state rewrites. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `approximate-CIM`, `DSE`, `cost-model`, `GNN-surrogate`, `transistor-sizing`, `OpenROAD`, `SPICE`, `accuracy-constrained-optimization` | Tags follow the evidenced contribution: approximate digital SRAM-based DCiM PE optimization with PPA/error prediction and circuit-level sizing. |
| Closest comparison baselines | OpenACM, OpenYield, AutoDCIM, SynDCIM, ARCTIC, OpenC2 | OpenACMv2 builds on OpenACM and OpenYield; the paper positions AutoDCIM, SynDCIM, ARCTIC, and OpenC2 as nearby DCiM compiler/generator efforts focused on exact arithmetic or macro generation rather than approximate arithmetic ACCO. ([arXiv](https://arxiv.org/pdf/2603.13042)) |

## 2. One-paragraph public summary

OpenACMv2 contributes an accuracy-constrained architecture–circuit co-optimization flow for approximate digital SRAM-based compute-in-memory processing elements. Its strongest reusable layer is the design-space exploration and cost-model boundary: Level-I encodes approximate multiplier choices and SRAM macro parameters as optimizer states, evaluates multiplier error/PPA through PEA-GNN, and selects Pareto candidates under MRED/NMED budgets; Level-II refines selected compressor cells and SRAM bitcells through SPICE/PVT/Monte Carlo-style transistor sizing. The demonstrated workloads are image blending for 8-bit multipliers and CIFAR-10 inference for 16-bit multipliers, with hardware evidence centered on 8/16-bit approximate multipliers, SRAM macro configurations, FreePDK45/Nangate45-style cells, OpenROAD/OpenSTA/VCS evaluation, and Xyce/SPICE-style sizing. For CIM compiler/IR research, the paper is most useful as a concrete example of making approximate arithmetic choices, SRAM macro parameters, and circuit-validity constraints first-class optimization objects, while high-level workload ingestion, tensor IR, instruction lowering, and runtime abstractions remain outside the paper’s main demonstrated interface. ([arXiv](https://arxiv.org/pdf/2603.13042))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| OpenACMv2 provides a two-level ACCO flow for approximate DCiM | Abstract, Introduction, Fig. 2, Conclusion | Equation, algorithm description, experiment, artifact documentation | Level-I explores compressor combinations, PP-column approximation, and SRAM macro parameters; Level-II sizes compressor and SRAM bitcell transistors under PVT/variation. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Demonstrated as a narrow DCiM PE co-design flow, not as a general tensor-compiler stack. The reusable boundary is clearest around architecture/circuit optimization states. |
| Accuracy budgets are first-class constraints | Introduction, Sec. 4.1.2, Sec. 6.2 | Equation, experiment | MRED and NMED are defined formally; top-level multiplier optimization minimizes MRED and PDP subject to an NMED constraint, with MRED budgets used in image blending and CIFAR-10 experiments. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Demonstrated for multiplier-level approximation budgets mapped to PSNR and CIFAR-10 Top-k accuracy. Cross-operator or runtime accuracy contracts are not shown as a serialized IR. |
| PEA-GNN rapidly predicts approximate multiplier PPA/error | Sec. 4.1.3, Fig. 4, Table 1 | Equation, experiment, code/artifact | PEA-GNN maps compressor assignments to a stage-wise graph; node features combine truth-table probabilities and compressor error vectors; a GraphSAGE-style update and MLP predict MRED, NMED, delay, area, and power. Table 1 reports 142× / 464× speedups versus EDA for 8/16-bit cases. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Evidenced for automatically generated 8/16-bit multiplier datasets evaluated with Nangate45/OpenROAD/OpenSTA and VCS. Extension to other multiplier topologies or PVT corners would require retraining/calibration. |
| Classic single- and multi-objective optimizers are integrated | Sec. 4.1.4, Sec. 5.1.3, README, `run_optimization.py` | Algorithm, code/artifact, documentation | The paper lists MOEA/D, NSGA-II, SMAC, MOBO for multiplier search and CBO/PSO/SA for SRAM macro search; the artifact documents `--algo NSGA/MOEAD/MOBO/SMAC` and stage modes `config` and `width`. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Artifact-level evidence supports an optimizer workspace and saved outputs; exact reproduction of all paper plots depends on external tools and datasets. |
| The SRAM macro is co-optimized with architecture and transistor-level decisions | Sec. 5, Fig. 8, Fig. 9, SRAM-OPT README | Equation, experiment, code/artifact, documentation | SRAM macro configuration is formalized as rows, columns, mux ratio, and array count under a capacity constraint; a FOM combines power, area, and delay; SRAM-OPT documents MC simulation, SNM/delay/power/area metrics, PVT corners, and YAML parameter spaces. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Demonstrated primarily as bank-level configuration and 6T bitcell/peripheral sizing. The paper states detailed SRAM area results are omitted due to space. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| The workflow is open-source and reproducible | Abstract, README, license | Code/artifact, documentation | The GitHub artifact is public, Apache-2.0 licensed, and documents installation, external tools, quick-start commands, optimization stages, output files, and supported compressors. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md)) | The README also says the repository “mainly contains” the circuit-generation front-end and that ACCO modules will be released incrementally, while later sections document DCIM_OPT and SRAM-OPT workflows. Full paper-figure reproduction should be treated as partially evidenced. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md)) |

## 4. Stack anatomy

```text
Input / frontend:
  User-level hardware and optimization specifications: bit width, PE/SRAM parameters, accuracy budgets, algorithm choice, compressor family, and stage selector. In the artifact these appear as CLI arguments, YAML configs, and optimizer options rather than as a DNN graph IR. The demonstrated workload layer is image blending and CIFAR-10 evaluation, not a reusable frontend parser. Documented, partially serialized, reusable with adapters. 

Middle representation:
  The clearest middle objects are: multiplier compressor assignment vector a; selective lower-significance PP-column region J_L; PEA-GNN stage-wise graph G=(V,E); SRAM tuple (r,c,μ,nₐ); transistor width vector w; and artifact-level config.json / YAML files. These are configs, graph objects, and optimization states rather than a single compiler IR. ([arXiv](https://arxiv.org/pdf/2603.13042))

Mapping or scheduling state:
  Optimizer populations, candidate states, Pareto fronts, MRED/PDP objective values, and Level-I/Level-II handoff candidates. The artifact documents solutions.txt and pareto_front.png outputs. This is inspectable as DSE state, not as a schedule over tensor loops or instructions. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

Hardware abstraction:
  Approximate DCiM PE containing SRAM macro, multiplier, control logic, input/output buffering; multiplier as PP generation + configurable approximate compressor reduction tree + final carry-propagate adder; SRAM as rows/columns/mux/array count plus 6T bitcell/peripheral circuits. ([arXiv](https://arxiv.org/pdf/2603.13042))

Backend / simulator / codegen:
  OpenACM circuit generators, OpenROAD/OpenSTA-style physical flow, VCS for some EDA evaluation, SPICE/Xyce or ngspice for transistor-level simulation, and OpenYield-derived SRAM sizing. The README documents flow-script generation, SRAM RTL generation, multiplier/PE generation, and `./DCIM/tcl/eda.sh`. ([arXiv](https://arxiv.org/pdf/2603.13042))

Output artifact:
  Generated RTL, OpenROAD scripts, selected multiplier/SRAM designs, Liberty `.lib` files, LEF for SRAM-OPT, optimizer `config.json`, `solutions.txt`, and `pareto_front.png`. Output is inspectable at the hardware/DSE level rather than as an instruction stream. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

Evaluation loop:
  Level-I PEA-GNN prediction and optimizer search; EDA-ground-truth comparison for GNN quality; Level-II SPICE/PVT/Monte Carlo transistor sizing; task-level image/CIFAR-10 accuracy checks; OpenROAD/OpenSTA/VCS-backed PPA evaluation. ([arXiv](https://arxiv.org/pdf/2603.13042))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the compressor assignment vector, PEA-GNN graph construction, SRAM macro tuple, transistor width vector, accuracy thresholds, and optimizer output files. The paper foregrounds ACCO as a two-level workflow, while the reusable semantics are most visible in the artifact’s configuration files, `run_optimization.py` state encoding, YAML parameter spaces, and generated Pareto outputs. A future compiler could wrap these as a typed “approximate arithmetic + macro configuration” IR boundary.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
OpenACMv2 owns the design-space search between an architecture/circuit template and backend evaluation. Its inputs are bit width, compressor library, PP-column approximation choices, SRAM macro parameters, accuracy constraints, and optimizer choices; its outputs are selected Pareto candidates and generated hardware artifacts. ([arXiv](https://arxiv.org/pdf/2603.13042))

**Secondary: A2 Simulator & cost model.**  
PEA-GNN is a surrogate cost/error model for approximate multipliers, and Level-II relies on SPICE/PVT/Monte Carlo evaluation. Table 1 is specifically an accuracy/runtime validation of the surrogate against EDA. ([arXiv](https://arxiv.org/pdf/2603.13042))

**Secondary: A5 Narrow end-to-end co-design.**  
The paper connects approximate arithmetic choices, SRAM macro configuration, transistor sizing, and task-level accuracy checks. The demonstrated endpoint is a DCiM PE/macro path, not a broad compiler stack across arbitrary neural-network graphs. ([arXiv](https://arxiv.org/pdf/2603.13042))

**Inherited / supporting: A1 Macro / circuit generator.**  
OpenACMv2 builds on OpenACM’s PE, SRAM, multiplier, and OpenROAD script generation, and on OpenYield/SRAM-OPT for variation-aware SRAM sizing. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The most reusable middle representation is configuration state: `a` for compressor choices, `(r,c,μ,nₐ)` for SRAM, `w` for transistor widths, YAML files for SRAM parameters, and JSON/text outputs for optimization results. Decisions made here include approximation placement, compressor family selection, SRAM shape, and sizing. Decisions embedded in backend setup include OpenROAD/VCS/SPICE invocation, technology libraries, and generated circuit templates. There is no single general-purpose IR file, but the config/output boundary is close to an inspectable DSE IR.

**B2 Graph-as-IR, localized to the surrogate.**  
PEA-GNN converts a multiplier compressor assignment into a graph whose nodes are HA/FA/exact/approximate compressors and whose edges are signal interconnects. This graph is central to prediction, but it is not presented as a user-facing compiler IR for rewriting downstream mappings. ([arXiv](https://arxiv.org/pdf/2603.13042))

**B4 Hardware-resource IR.**  
Hardware resources—compressor slots, reduction stages, SRAM rows/columns/mux/arrays, transistor width groups—are the objects that the flow names and optimizes. This style is stronger than graph/tensor IR in the paper.

**B6 Accuracy / nonideality modeling.**  
MRED/NMED, PSNR/Top-k accuracy, PPA, PVT corners, SNM, SPICE simulation, and Monte Carlo variation are first-class evaluation dimensions. This is the most distinctive middle-layer style for OpenACMv2. ([arXiv](https://arxiv.org/pdf/2603.13042))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class as SRAM macro / PE hierarchy** | PE contains multiplier and SRAM macro; SRAM macro is parameterized by rows, columns, mux ratio, and array count. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Bit-slicing / bit significance | **First-class for multiplier PP-column significance** | Approximation is restricted to lower-significance PP columns while higher-significance columns remain exact. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| ADC/DAC precision or sensing | **Not applicable / not central** | The demonstrated architecture is digital SRAM/DCiM; sensing appears in SRAM-OPT peripheral circuits, but ADC/DAC precision is not a compiler object. |
| Analog-to-digital or domain transition | **Not applicable / implicit** | The flow is digital CIM with transistor-level SPICE evaluation; no ADC retiming or analog-domain accumulation IR is described. |
| Peripheral circuits as path nodes | **Costed / parameterized for SRAM-OPT** | SRAM-OPT documents word-line driver, precharge, sense amplifier, write driver, decoder, and mux support. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/SRAM-OPT/SRAM_OPT_README.md)) |
| Partial-sum accumulation path | **First-class inside multiplier reduction tree** | Figure 3 and PEA-GNN model PP generation, configurable reduction tree, compressor stages, and final carry-propagate adder. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Reconstruction / shift-add tree | **Hard-coded / implicit** | The final carry-propagate adder is part of the multiplier structure, but reconstruction is not exposed as a separately rewritable object. ([arXiv](https://arxiv.org/pdf/2603.13042)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable / not found in checked sources** | The paper centers on static hardware DSE and task-level evaluation, not runtime-state management. |
| Value trajectory / flow path | **Approximated / implicit** | PEA-GNN preserves local signal-flow structure through compressor graph message passing, but value identity across storage, reduction, reconstruction, and downstream operators is not serialized as a trajectory object. ([arXiv](https://arxiv.org/pdf/2603.13042)) |

### 5.4 Axis D — rewrite object

OpenACMv2 rewrites **hardware configuration**, **numeric approximation choice**, **SRAM macro organization**, **transistor sizing vectors**, and **accuracy/PPA search trajectories**.

Legal transformations in the demonstrated framework include assigning one of eight compressor types to each configurable compressor slot, choosing which lower-significance PP columns are approximate, selecting SRAM rows/columns/mux/array count under capacity constraints, and changing transistor widths / threshold-model choices within technology bounds. The exploited equivalence is accuracy-budgeted approximate arithmetic: different compressor assignments may be acceptable when MRED/NMED and task accuracy stay within budget. Across lowering, the flow must preserve bit-width, PP-column significance, selected compressor semantics, MRED/NMED constraints, SRAM capacity, truth-table correctness for each sized compressor, and PVT/sizing bounds.

The representation is especially well suited to local approximate arithmetic and hardware-resource DSE. Expressing graph-level operator fusion, tensor tiling, instruction scheduling, cross-layer bit-slice reuse, or runtime remapping would likely require an additional abstraction for source operators, value identity, schedule order, memory layout, and backend action provenance.

## 6. Technical mechanism reading

### 6.1 ACCO as a two-level decomposition

The core mechanism is a decomposition of an otherwise coupled architecture/transistor search into two levels. Level-I searches architecture states quickly using a GNN surrogate or lightweight SRAM models; Level-II refines shortlisted states through SPICE/PVT-aware transistor sizing. The paper motivates this by arguing that concurrent architecture-plus-transistor optimization has similar PPA potential but a much larger, more coupled search space; the adopted divide-and-conquer strategy preserves tractability. ([arXiv](https://arxiv.org/pdf/2603.13042))

### 6.2 Approximate multiplier representation

For an N-bit multiplier, partial products form `2N` columns. The lower-significance subset is eligible for approximation, while the higher-significance subset remains exact. In the 8-bit example, the paper defines `t=9` configurable compressor positions and a library of `K=8` compressor types, giving an architecture-level search space of `K^t = 8^9` combinations. This is the clearest IR-like object in the paper: a vector `a=[a₁,…,aₜ]` whose entries select compressor types at specific column/slot locations. ([arXiv](https://arxiv.org/pdf/2603.13042))

The top-level objective defines exact and approximate multiplication results, error distance, MRED, NMED, delay, dynamic power, area, and PDP. The optimizer minimizes MRED and PDP subject to an optional accuracy constraint such as `NMED(a) ≤ ε_NMED`. ([arXiv](https://arxiv.org/pdf/2603.13042))

### 6.3 PEA-GNN as a surrogate cost/error model

PEA-GNN maps each compressor assignment to a stage-wise graph aligned with the multiplier compression hierarchy. Nodes are combinational components—HA, FA, exact compressors, approximate compressors—and edges are signal interconnects. Node features combine truth-table-derived input probabilities with bit-level compressor error vectors. GraphSAGE-style message passing propagates information within each reduction stage, and a shared MLP predicts MRED, NMED, delay, area, and power. ([arXiv](https://arxiv.org/pdf/2603.13042))

For compiler/IR readers, the interesting point is that the surrogate’s graph is neither a high-level compute graph nor a low-level netlist alone; it is a compression-flow graph whose feature schema explicitly connects bit-level error behavior to physical metrics. This suggests a possible future IR type for approximate arithmetic nodes: `(truth_table, error_vector, bit_significance, stage, physical_cost_range)`.

### 6.4 Optimizer layer

The multiplier search integrates MOEA/D, NSGA-II, SMAC, and MOBO. The paper presents them as alternative optimizers over the same objective space, while the artifact’s `run_optimization.py` routes `config` stage states through GNN prediction and normalizes MRED/PDP objectives. ([arXiv](https://arxiv.org/pdf/2603.13042))

The artifact documents two main DCIM_OPT stages: `--stage config` for Level-I GNN-based MRED/PDP search and `--stage width` for Level-II SPICE-based compressor sizing. Outputs include `config.json`, `solutions.txt`, and `pareto_front.png`. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

### 6.5 Transistor-level compressor sizing

Level-II for compressors treats transistor widths as the design vector. Width-sharing groups reduce dimensionality while preserving symmetry. Functional correctness is checked by comparing SPICE-classified output voltages against each compressor’s target truth table; objectives include PDP and area, with optional worst-case aggregation across PVT corners. ([arXiv](https://arxiv.org/pdf/2603.13042))

This means Level-II is not changing the approximate arithmetic function selected by Level-I; it is changing implementation costs while preserving the selected compressor’s truth-table semantics. That boundary is a useful compiler contract: architecture search chooses an approximate function; circuit sizing optimizes the implementation while preserving that function.

### 6.6 SRAM macro and bitcell optimization

SRAM Level-I represents a bank organization as rows `r`, columns `c`, mux ratio `μ`, and number of arrays `nₐ`, constrained by total capacity. In the paper’s SRAM section, capacity is set to `4 KB × 8 = 32,768` bits, rows and columns are chosen from power-of-two grids, and `nₐ` is derived for full utilization. The SRAM FOM combines maximum read/write power, bank area, and maximum read/write delay. ([arXiv](https://arxiv.org/pdf/2603.13042))

SRAM Level-II uses OpenYield-style SPICE/PVT/Monte Carlo sizing for 6T SRAM bitcells, with hold/read/write SNM, read/write delay, power, and area. SRAM-OPT’s README exposes this as YAML-configured parameter spaces and optimization scripts, including peripherals such as word-line drivers, precharge, sense amplifiers, write drivers, decoders, and column muxes. ([arXiv](https://arxiv.org/pdf/2603.13042))

### 6.7 Demonstrated evaluation scope

The paper evaluates PEA-GNN against EDA ground truth on 8-bit and 16-bit designs; Table 1 reports 0.26 s vs. 37 s for 8-bit and 0.25 s vs. 116 s for 16-bit prediction/evaluation comparisons, with the EDA path listed as OpenROAD + OpenSTA + VCS. ([arXiv](https://arxiv.org/pdf/2603.13042))

Task-level evidence is shown through 8-bit image blending PSNR and 16-bit CIFAR-10 Top-1/Top-5 accuracy. Tables 2 and 3 show that Level-II reduces PDP relative to Level-I within selected cases while reported PSNR or Top-k accuracy remains unchanged. ([arXiv](https://arxiv.org/pdf/2603.13042))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Approximate compressor assignment is the de facto IR object

- **Observation:** The vector `a` names compressor choices at specific PP-column positions and is the object that search, prediction, and evaluation repeatedly transform.
- **Why it matters for CIM compiler/IR work:** This is more IR-like than the paper’s high-level “compiler” diagram: it has a finite domain, bit-significance semantics, cost/error annotations, and a clear backend handoff.
- **Reusable lesson:** A future approximate-CIM IR could expose compressor-slot assignment as a typed region: `approx_region`, `slot_id`, `compressor_variant`, `truth_table`, `error_vector`, and `cost_model_ref`.

### Insight 2 — PEA-GNN’s graph is a hardware-flow graph, not a neural-network graph

- **Observation:** PEA-GNN’s graph nodes are compressor/tree components, and message passing follows multiplier compression stages.
- **Why it matters for CIM compiler/IR work:** It suggests an intermediate layer between gate netlists and tensor graphs: a hardware arithmetic-flow graph that is compact enough for DSE but structured enough to preserve bit-level error propagation.
- **Reusable lesson:** Surrogate-backed compiler IRs may benefit from graph views specialized to backend structures, rather than forcing all optimization through source-level operator graphs.

### Insight 3 — Level-I / Level-II separation creates a clean legality contract

- **Observation:** Level-I may change approximate arithmetic choices; Level-II sizes transistor implementations while preserving each selected compressor truth table.
- **Why it matters for CIM compiler/IR work:** This separates semantic legality from physical cost ranking. Compiler passes can reason about accuracy at Level-I and circuit validity at Level-II.
- **Reusable lesson:** Future stacks could encode “semantic variant selected” and “implementation variant sized” as distinct layers, with formal preservation checks between them.

### Insight 4 — SRAM macro parameters are treated as DSE state, not as a memory-layout IR

- **Observation:** Rows, columns, mux ratio, and number of arrays are optimized under capacity and FOM constraints, but the paper does not expose a tensor placement or schedule mapping into those arrays.
- **Why it matters for CIM compiler/IR work:** This distinction helps classify OpenACMv2 as hardware-resource DSE rather than a full CIM mapping compiler.
- **Reusable lesson:** A future compiler could attach OpenACMv2-style SRAM FOM plugins to a separate mapping IR that binds tensors, tiles, and partial sums to macro resources.

### Insight 5 — Artifact outputs are useful but need decoding to become corpus IR records

- **Observation:** The artifact documents optimizer outputs such as `config.json`, `solutions.txt`, and `pareto_front.png`; these expose states and objectives but are not described as a stable schema.
- **Why it matters for CIM compiler/IR work:** Corpus integration can still use these outputs as audit records, provided an adapter decodes state vectors into named compressor slots and SRAM fields.
- **Reusable lesson:** For corpus purposes, normalize each run into `{input_budget, architecture_state, circuit_state, predicted_metrics, backend_metrics, task_metrics}`.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.** The artifact is the GitHub repository `ShenShan123/OpenACM`, licensed under Apache-2.0. Last checked: **2026-05-15**. The repository README describes OpenACMv2, OpenACM front-end generators, DCIM_OPT and SRAM-OPT workspaces, installation dependencies, quick-start commands, optimization stages, supported compressors, and expected output files. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

What the artifact contains: circuit-generation front-end components for flow scripts, SRAM, PE, multiplier generation, multiplier GNN, compressor sizing, optimization algorithms, DCIM backend workflow, DCIM_OPT, SRAM-OPT, examples, and docs. The README lists external tools including OpenROAD, OpenSTA, FreePDK45, OpenYield, and Xyce; SRAM-OPT additionally documents ngspice/Xyce, FreePDK45 transistor models, YAML configs, MC simulation, and multiple optimizers. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

What the artifact appears to omit or leave partially packaged: a single end-to-end reproduction script for all paper figures, a formal stable IR/schema specification, and a clearly documented provenance path from workload operation to each backend action. The README also contains a cautionary statement that the repository “mainly contains” the circuit-generation front-end and that ACCO modules will be released incrementally, even though later sections document DCIM_OPT and SRAM-OPT workflows. ([GitHub](https://raw.githubusercontent.com/ShenShan123/OpenACM/main/README.md))

Minimal documented workflows:
```bash
python openacm/flow_script_generator/flow_script_generator.py --design_name dcim_pe --top_model sram_multiplier_system --location_x 30 --location_y 15
python openacm/pe_compiler/SRAM.py --data_width 8 --addr_count 16 --rtl_dir ./DCIM/rtl
python openacm/multiplier_compiler/multiplier_compiler.py --bit_width 8
python openacm/pe_compiler/pe_compiler.py --data_width 8 --addr_count 16 --multiplier_module Exact
./DCIM/tcl/eda.sh

python DCIM_OPT/run_optimization.py --stage config --circuit 8bit --algo NSGA
python DCIM_OPT/run_optimization.py --stage width --compressor sabetz --algo MOBO
```

Paper figures appear **partially reproducible from the artifact**: the repository documents matching stages and output files, but exact reproduction of Tables/Figures would require matching technology libraries, external EDA/SPICE tools, generated datasets, trained GNN state, and experiment scripts.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | CLI options and YAML configs are documented; no formal schema is presented. |
| Intermediate representation serialized | Partial | Optimizer configs and solutions are serialized, but the IR is an implicit state vector/config combination. |
| Mapping decisions inspectable | Partial | `solutions.txt` and Pareto plots expose candidate states; decoding compressor slots requires tool knowledge. |
| Schedule inspectable | Unknown | The work is not primarily a schedule compiler; PE control exists, but tensor/loop schedules are not exposed. |
| Hardware config explicit | Yes | Bit width, PE/SRAM parameters, compressor choices, SRAM macro parameters, and transistor sizing configs are explicit. |
| Precision / bit-slice assumptions explicit | Partial | 8/16-bit cases and PP-column significance are explicit; cross-operator precision typing is not exposed. |
| Cost model inspectable | Partial | Equations, PEA-GNN structure, FOMs, and normalization ranges are inspectable; trained-model provenance is less clear. |
| Simulator backend documented | Partial | OpenROAD/OpenSTA/VCS and SPICE/Xyce/ngspice-style paths are documented; exact local setup is dependency-heavy. |
| Generated code / instruction stream inspectable | Partial | RTL, Liberty/LEF, and flow scripts are inspectable; there is no ISA/instruction stream layer. |
| Provenance from source op to backend action | Partial | Provenance exists from architecture config to generated hardware; source NN op to backend action is outside the main interface. |
| Reproduction scripts available | Partial | Quick-start and stage commands are documented; full paper-figure reproduction is not confirmed. |
| Calibration source documented | Partial | EDA comparison setup and Nangate45/OpenROAD/OpenSTA settings are stated; complete calibration data/package is not fully evidenced. |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The frontend is primarily hardware/optimization configuration, not a general model importer.
- **As IR inspiration:** Strong. Borrow the compressor assignment vector, PP-column approximation region, SRAM tuple, width vector, accuracy-budget fields, and truth-table preservation contract.
- **As mapper/scheduler:** Reusable as a hardware-resource DSE engine for approximate multiplier selection and SRAM macro search; less direct as a loop/tensor scheduler.
- **As cost model:** Strong candidate. PEA-GNN-style predictor and SRAM FOM/SPICE metrics could become backend cost plugins.
- **As backend:** Reusable with wrappers around OpenACM generators, DCIM_OPT, SRAM-OPT, OpenROAD scripts, and SPICE/Xyce evaluation.
- **As benchmark:** Useful for 8/16-bit approximate multiplier DSE, image blending, CIFAR-10 accuracy-budget checks, and compressor-family comparisons.
- **As validation source:** Useful for simulator-backed validation through EDA, SPICE, PVT/MC, and OpenROAD/OpenSTA; no chip-in-loop or measured silicon evidence is shown in the checked sources.

**Integration effort estimate:** **Medium–High.** Integration would be most direct through DCIM_OPT/SRAM-OPT outputs and generator scripts. A small adapter could extract state vectors, compressor labels, SRAM tuples, and objective values into a corpus schema. Higher effort comes from external EDA/SPICE dependencies, implicit state decoding, and the absence of a single stable IR contract.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **OpenACM** | Open-source SRAM-based approximate CiM/DCiM compiler flow with PE, SRAM macro, multiplier, and OpenROAD backend | OpenACMv2 extends it with ACCO: accuracy-constrained two-level architecture/circuit optimization and PEA-GNN-backed search. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Treat OpenACM as the generator/backend substrate and OpenACMv2 as the DSE/cost-model extension. |
| **OpenYield** | Variation-aware SRAM/circuit optimization and transistor sizing | OpenACMv2 uses OpenYield ideas for SRAM bitcell/periphery and PVT/MC-aware sizing inside an approximate DCiM co-design loop. ([arXiv](https://arxiv.org/pdf/2603.13042)) | Useful distinction between circuit-yield optimization engines and CIM compiler IR layers. |
| **AutoDCIM** | Automated digital CIM compiler and macro architecture/layout generation | AutoDCIM takes user specs and generates optimized DCIM macro architecture/layout; OpenACMv2 centers on approximate arithmetic accuracy budgets and architecture–transistor co-optimization. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/autodcim-an-automated-digital-cim-compiler/?utm_source=chatgpt.com)) | Compare by stack role: macro generator vs. approximate-arithmetic DSE. |
| **SynDCIM** | Performance-aware DCIM compiler from performance specs to layout | SynDCIM emphasizes multi-spec-oriented subcircuit synthesis and performance-to-layout generation; OpenACMv2 emphasizes MRED/NMED-constrained approximate multiplier/SRAM search. ([arXiv](https://arxiv.org/abs/2411.16806?utm_source=chatgpt.com)) | Separate performance-spec synthesis from accuracy-budgeted approximate arithmetic. |
| **ARCTIC** | Agile DCIM compiler with parameterized precision and robustness concerns | ARCTIC supports parameterized INT/FP formats and DCIM-friendly BIST; OpenACMv2’s first-class precision object is PP-column/compressor approximation rather than general INT/FP precision modes. ([past.date-conference.com](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf?utm_source=chatgpt.com)) | Useful contrast between precision-format IR and approximate-compressor IR. |
| **OpenC2** | Open-source end-to-end hardware compiler framework for digital CIM macro | OpenC2 is positioned as a macro hardware compiler framework; OpenACMv2 adds accuracy-constrained approximate arithmetic and transistor-level co-optimization. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0?utm_source=chatgpt.com)) | Useful for corpus distinction between open DCIM codegen frameworks and ACCO-style DSE layers. |

## 10. Corpus-ready final takeaway

- OpenACMv2’s real contribution is an accuracy-constrained architecture–circuit DSE flow for approximate digital SRAM-based DCiM PEs.
- The strongest reusable stack layer is the hardware-aware cost/DSE boundary: compressor assignment, PP-column approximation, SRAM macro tuple, PEA-GNN prediction, and SPICE/PVT sizing.
- The evidenced scope is 8/16-bit approximate multipliers, SRAM macro/bitcell optimization, image blending PSNR, and CIFAR-10 Top-k accuracy-budget experiments.
- The first-class objects are approximate compressor variants, compressor slots, bit-significance/PP-column regions, SRAM bank parameters, transistor width groups, PVT/MC conditions, and MRED/NMED budgets.
- The hidden IR lives in optimizer states, PEA-GNN graph construction, YAML configs, `config.json`, `solutions.txt`, and generated hardware files rather than in a named compiler dialect.
- Artifact status: public artifact found; Apache-2.0; the repository documents front-end generation, DCIM_OPT, SRAM-OPT, quick-start commands, and output files, with full paper-figure reproduction requiring external tool alignment.
- Integration is most promising as an IR inspiration, DSE plugin, cost-model backend, and approximate-arithmetic benchmark.
- For value-trajectory IR work, OpenACMv2 is valuable for local bit-significance and approximate-reduction semantics; trajectory-level rewrites would add explicit value identity, domain transitions, reconstruction paths, and cross-operator placement/state objects.
