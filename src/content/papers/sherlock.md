---
slug: sherlock
title: "SHERLOCK: Scheduling Efficient and Reliable Bulk Bitwise Operations in NVMs"
short_title: "SHERLOCK"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "DAC 2024"
authors_or_group: "Hamid Farzaneh; João Paulo C. de Lima; Ali Nezhadi Khelejani; Asif Ali Khan; Mahta Mayahinia; Mehdi Tahoori; Jeronimo Castrillon"
summary: >-
  **SHERLOCK** is a mapping and scheduling framework for bulk bitwise logic in memristive NVM compute-in-memory systems. Its main compiler contribution is to treat a bulk-bitwise program as a DAG of operand and operation nodes, cluster dependent operations so their operands fit NVM array columns, bind those clusters to row/column resources, and generate simulator-compatible read/write/shift/CIM instructions while accounting for the latency–energy–reliability tradeoff of multi-row activation. The demonstrated flow starts from C bulk-bitwise kernels parsed with pycparser, targets scouting-logic-style ReRAM and STT-MRAM arrays, and evaluates BitWeaving, bit-sliced Sobel, and Usuba-generated bit-sliced AES through an extended gem5 + NVSim + SPICE/statistical-modeling backend. For CIM compiler/IR research, SHERLOCK is best read as a graph-to-hardware-layout compiler whose reusable semantics are clearest in the DAG, cluster/layout state, instruction format, and reliability-aware MRA model. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))
links:
  paper: https://publikationen.bibliothek.kit.edu/1000178608
  artifact:
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "STT-MRAM-CIM"
  - "NVM-CIM"
  - "digital-CIM"
  - "scouting-logic"
workloads:
  - "BitWeaving-V database predicate evaluation"
  - "bit-sliced Sobel edge detection"
  - "Usuba-generated bit-sliced AES"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A5, A4]
axis_B: [B2, B4, B5, B6]
axis_C_first_class_objects:
  - "DAG_operand_nodes"
  - "DAG_operation_nodes"
  - "b_level_priority"
  - "operation_clusters"
  - "memory_layout"
  - "array_id"
  - "rows"
  - "columns"
  - "per_column_CIM_operation"
  - "multi_row_activation_count"
  - "decision_failure_probability"
axis_D_rewrite_objects:
  - "operator_graph"
  - "hardware_mapping"
  - "array_binding"
  - "memory_layout"
  - "instruction_stream"
  - "reliability_cost_annotation"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown / not found"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend_adapter"
  - "benchmark"
  - "validation_reference"
reproducibility_level: low
notes:
  - "Best read as a reliability-aware graph-to-column-layout compiler for bulk-bitwise NVM-CIM."
  - "The instruction stream is the clearest backend contract: op + array/column/row address + optional per-column CIM op."
  - "Frontend and backend implementation details are paper-level in checked sources; no runnable artifact was found."
takeaways: []
---

# SHERLOCK — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework** | SHERLOCK’s owned stack slice is DAG-to-NVM-array mapping plus dependency-preserving instruction scheduling. The paper’s algorithms output a memory layout and instruction stream for CIM-capable NVM arrays. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Secondary stack roles | **A2 + A5**, with a limited **A4-like backend interface** | Evaluation uses an extended gem5 flow, NVSim array modeling, and SPICE-derived failure probabilities. The paper also presents a narrow end-to-end flow from C/pycparser kernels to simulator-compatible instructions, but the explicit compiler interface is a generated instruction format rather than a reusable public IR/dialect. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR; B4 Hardware-resource IR; B5 Instruction/meta-op stream; B6 Reliability/nonideality model** | The central representation is a DAG/DFG with operand and operation nodes, b-level priorities, clusters, column layout, and read/write/shift/CIM instructions. Reliability enters through decision-failure probability and multi-row-activation tradeoffs. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| First-class CIM objects, Axis C | **DAG op/operand nodes; column clusters; rows/columns/array IDs; multi-row activation count; CIM logic op per column; layout; instruction stream; decision-failure probability** | The paper directly names the DAG, layout, clusters, target array dimensions, column mapping, generated instructions, CIM operation field, MRA setting, and probability of decision failure. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Rewrite object, Axis D | **Operator graph + hardware mapping + array binding + instruction stream** | SHERLOCK rewrites same-type Boolean chains into multi-operand operations, clusters operation nodes, binds operands to array columns, and merges compatible instructions after dependency checks. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Best corpus tags | `compiler-mapping`, `graph-as-ir`, `bulk-bitwise-cim`, `nvm-cim`, `reram-cim`, `stt-mram`, `scouting-logic`, `instruction-generation`, `reliability-aware-scheduling`, `gem5-nvsim-spice` | These tags reflect the demonstrated objects and evaluation path. |
| Closest comparison baselines | **Pinatubo, CONCEPT, RACER, Ambit, ParaBit, Usuba/BitWeaving** | Pinatubo and CONCEPT are close NVM/RRAM bulk-bitwise PIM baselines; RACER is close as a resistive-memory PUM system with ISA/compiler-facing concerns; Ambit and ParaBit are related bulk-bitwise in/near-memory systems; BitWeaving and Usuba provide workload/compiler inputs used in evaluation. ([cseweb.ucsd.edu](https://cseweb.ucsd.edu/~jzhao/files/Pinatubo-dac2016.pdf?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

**SHERLOCK** is a mapping and scheduling framework for bulk bitwise logic in memristive NVM compute-in-memory systems. Its main compiler contribution is to treat a bulk-bitwise program as a DAG of operand and operation nodes, cluster dependent operations so their operands fit NVM array columns, bind those clusters to row/column resources, and generate simulator-compatible read/write/shift/CIM instructions while accounting for the latency–energy–reliability tradeoff of multi-row activation. The demonstrated flow starts from C bulk-bitwise kernels parsed with pycparser, targets scouting-logic-style ReRAM and STT-MRAM arrays, and evaluates BitWeaving, bit-sliced Sobel, and Usuba-generated bit-sliced AES through an extended gem5 + NVSim + SPICE/statistical-modeling backend. For CIM compiler/IR research, SHERLOCK is best read as a graph-to-hardware-layout compiler whose reusable semantics are clearest in the DAG, cluster/layout state, instruction format, and reliability-aware MRA model. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| SHERLOCK is an end-to-end automated framework that takes a high-level target-agnostic application and device model and generates optimized code for NVM-CIM accelerators. | Introduction and Fig. 1 | Paper-only + algorithm + simulator instruction format | The paper shows a flow from high-level application to DFG, mapper, scheduler, codegen, and gem5-oriented evaluation. It states that the implementation starts from C and uses pycparser to generate the DAG. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Demonstrated for bulk-bitwise C kernels lowered to DAGs and emitted as simulator-compatible instructions. Artifact-level confirmation would require public source, input examples, and generated outputs. |
| Efficient mapping of complex applications to CIM-capable NVMs is the core problem. | Abstract, motivation, Sec. 3 | Algorithm + experiment | Algorithms 1 and 2 define layout generation, b-level ordering, cluster discovery, column assignment, and instruction generation. The experiments compare naive and optimized mapping across array sizes and technologies. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | The paper provides strongest evidence for DAG operand/operation mapping to columns in scouting-logic-style ReRAM/STT-MRAM simulations. |
| The optimized mapper reduces data movement and improves data reuse / array utilization. | Sec. 3.3 and conclusion | Algorithm + experiment | The mapper computes `k` column clusters, constrains cluster size by column capacity, minimizes cross-cluster dependencies, and greedily merges clusters to `k`. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | The reusable boundary is clearest at the cluster/layout state. Direct data-movement counters are not exposed as a public trace in the checked sources. |
| SHERLOCK generates executable/optimized code for the target CIM system. | Introduction, Sec. 3.2.1, Fig. 4 | Instruction format + paper-only | The generated instruction format contains operation type, array ID, columns, rows, and optionally per-column CIM logic op; examples include write, read, shift, and CIM read instructions. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | The paper-level evidence supports a simulator-facing instruction stream. Public artifact-level confirmation would require generated instruction files or backend scripts. |
| SHERLOCK co-optimizes performance, energy, and reliability. | Abstract, introduction, Sec. 4.2, conclusion | Experiment + equation + simulator model | Evaluation reports performance and energy improvements, and models application failure probability as `P_app = 1 - Π_i(1 - PDF_i)`. Reliability is tied to device distributions, operation type, and number of activated rows. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Demonstrated through simulator-backed experiments and statistical failure modeling for ReRAM/STT-MRAM. The optimization is clearest as MRA-aware graph/schedule selection, rather than as a separately exposed reliability IR. |
| Multi-row activation gives a performance–reliability tradeoff. | Background, Sec. 4.1–4.2, Fig. 6 | Experiment + equation | The paper explains that activating more rows improves performance but reduces sense margin and can increase decision-failure probability. Experiments compare exactly 2-row operations with `≥2`-row transformed DAGs. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Demonstrated for Boolean multi-operand operations in scouting-logic NVM arrays. Applicability to other CIM forms would require a corresponding device/reliability model. |
| The method is hardware-approach independent / applicable to other CIM flavors. | Sec. 2.1 | Paper-only | The paper states the mapping/scheduling core is independent of the specific hardware approach and applicable to other CIM flavors. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | The evaluated hardware abstraction is scouting-based NVM logic with ReRAM and STT-MRAM parameters. Further reuse would depend on defining equivalent row/column, operation, latency, energy, and reliability contracts for another CIM backend. |
| SHERLOCK outperforms state of the art by about 10× latency, 4.6× energy, and 1.5× reliability. | Abstract and conclusion | Experiment | Table 2 reports latency/energy results for BitWeaving, Sobel, and AES over ReRAM/STT-MRAM and 512/1024 arrays; Sec. 4.2 reports reliability trends and average `P_app` improvement. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Evaluated through extended gem5 + NVSim + SPICE/statistical modeling. CPU EDP comparison is simulator-based, not hardware measurement. |

## 4. Stack anatomy

```text
Input / frontend:
  Object: high-level C program for bulk-bitwise kernels.
  Type: source program parsed through pycparser AST.
  Serialization / reuse: the paper documents the route from C to AST to DAG, but no public input schema, parser repo, or sample corpus was found. The demonstrated kernels are BitWeaving, bit-sliced Sobel, and Usuba-generated bit-sliced AES. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Middle representation:
  Object: DFG/DAG with operand/intermediate-result nodes and operation nodes.
  Type: graph-as-IR; operation nodes are unit-weighted, operand nodes and edges are zero-weighted, and operation b-level values are computed as priorities.
  Serialization / reuse: inspectable in paper figures and algorithms; no serialized DAG format found in checked sources. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Mapping or scheduling state:
  Object: layout, b-level-sorted node queue, clusters, `k` required columns, `CmaxSize`, and generated instruction list.
  Type: hardware-resource mapping state plus schedule/instruction state.
  Serialization / reuse: represented in pseudocode as algorithm outputs `layout` and `inst`; public files exposing these states were not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Hardware abstraction:
  Object: NVM array with rows/columns, array ID, row activation, column-wise logic control, sense amplifiers, reference resistance/current, row buffer rotation, row copy, NOT, and technology parameters.
  Type: hardware template plus technology/device model.
  Serialization / reuse: Table 1 gives evaluation parameters and the instruction format encodes array/column/row addresses; no standalone hardware schema was found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Backend / simulator / codegen:
  Object: read/write/shift/CIM instruction stream compatible with the authors’ simulation infrastructure.
  Type: simulator trace / instruction stream.
  Serialization / reuse: a snippet is shown in Fig. 4; the backend is described as extended gem5 with NVSim and SPICE-derived device parameters, but public backend code was not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Output artifact:
  Object: memory layout, instruction sequence, latency/energy/reliability metrics.
  Type: paper-level outputs, tables, figures.
  Serialization / reuse: paper-visible, not artifact-visible in checked sources.

Evaluation loop:
  Object: latency, energy, EDP, and application failure probability under ReRAM/STT-MRAM, 512/1024 arrays, and exact-2 vs ≥2-row MRA settings.
  Type: simulator-backed experiment with SPICE/statistical reliability model.
  Serialization / reuse: numeric results are published in Table 2 and figures; reproduction scripts were not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the DAG, b-level priority annotations, cluster membership, layout table with data arrival cycle, target array parameters, and generated instruction stream. The paper foregrounds the DFG and mapping algorithms; the reusable semantics are most visible in the layout/instruction boundary, where source graph nodes become row/column bindings and dependency-checked read/write/shift/CIM actions. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.**  
SHERLOCK’s main contribution is deciding how DAG operands and operations are clustered, placed into NVM array columns, scheduled, and merged into fewer simulator instructions. The input to this slice is a DAG plus target specification; the output is a layout and instruction stream. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**Secondary: A2 — Simulator & cost model.**  
The work relies on extended gem5 for system simulation, NVSim for array-level latency and energy including hierarchy/interconnect, SPICE simulations for cell resistive levels, and statistical modeling to derive decision-failure probabilities. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**Secondary: A5 — Narrow end-to-end co-design.**  
The paper’s flow spans frontend, mapper, scheduler, codegen, device model, and simulator evaluation, but the demonstrated scope is bulk-bitwise kernels on scouting-logic-style NVM-CIM arrays. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**A4-like component: instruction/meta-op interface.**  
The generated instruction format is compiler-relevant: `op address[arrayID][columns][rows] [cim-op]`, with read, write, shift, and CIM operation fields. It is a backend contract rather than a public IR dialect in the checked sources. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 5.2 Axis B — middle-layer style

**B2 — Graph-as-IR.**  
The named middle representation is the DFG/DAG. Operand/intermediate values and operation nodes are separated; dependencies are graph edges; operation nodes carry b-level priorities used by mapping and scheduling. Decisions made here include operation ordering, dependency grouping, and legal graph-level substitution of same-type operations. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**B4 — Hardware-resource IR.**  
The layout, clusters, rows, columns, and array IDs form a hardware-resource mapping state. Decisions made here include how many columns are needed, which operation clusters fit in a column, which operands are already mapped, and which cross-column dependencies should be minimized. A single reusable artifact for upstream passes to read/rewrite was not found; the representation is visible through algorithms and instruction examples. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**B5 — Instruction / meta-op / ILA style.**  
The instruction stream encodes read/write/shift/CIM actions and per-column logic operation fields. Scheduling decisions include dependency-safe instruction merging across clusters and row-buffer shifts for alignment. The instruction format is the clearest backend handoff in the paper. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**B6 — Accuracy / nonideality modeling.**  
Reliability is modeled through decision failure probability, device distributions, row-activation count, and application-level failure probability. The decisions made there include whether to use exactly two rows or multi-row activation and which Boolean operations are merged. The reliability model is paper-visible, while the calibration scripts/decks were not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class at array/row/column level; hierarchy parameterized** | NVM devices are organized as `m × n` arrays; instructions encode array ID, columns, and rows; Table 1 varies square array dimensions. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Bit-slicing / bit significance | **Implicit / workload-level** | Sobel uses a bit-sliced implementation and AES is Usuba-generated bit-sliced AES. The paper does not expose bit significance as a typed IR field; it appears in workload encoding. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| ADC/DAC precision or sensing | **Sensing is first-class in the hardware/reliability model; ADC/DAC precision is not applicable to this bulk-bitwise setting** | Scouting logic compares array resistance/current with a reference; decision failure is tied to comparator/reference imperfections and overlap in resistance distributions. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Analog-to-digital or domain transition | **Implicit / reliability-costed** | The analog sense process produces a binary output; the paper models failure probability of that decision but does not represent domain transition as an IR node. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Peripheral circuits as path nodes | **Costed / implicit; some operations named** | Row copy, row-buffer rotation, and NOT are supported by additional CMOS circuitry; shifts appear in generated instructions. NVSim/Cadence/SPICE parameters support evaluation. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Partial-sum accumulation path | **Not applicable** | The demonstrated computation is bulk Boolean logic rather than analog MAC / partial-sum accumulation. |
| Reconstruction / shift-add tree | **Not applicable; row-buffer shift is first-class as an instruction** | The shift operation aligns row-buffer contents and is encoded with array ID, direction, and distance. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Operand-level for masks; otherwise not applicable / implicit** | BitWeaving variables such as `m_gt`, `m_lt`, `meq1`, and `meq2` appear as operands/intermediates in the DAG, but there is no separate runtime-state abstraction. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Value trajectory / flow path | **Approximated by DAG dependencies + layout + instruction stream** | The graph records dependencies, layout records placement, and instructions record backend actions. A trajectory-level value type is not exposed in the checked sources. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |

### 5.4 Axis D — rewrite object

SHERLOCK rewrites and lowers four main objects:

1. **Operator graph:** same-type Boolean operations can be substituted by a single multi-operand node when one node’s output is used once by the other. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))  
2. **Hardware mapping / array binding:** operation nodes are clustered and operands are bound to CIM array columns subject to column capacity and dependency structure. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))  
3. **Instruction stream:** compatible instructions across clusters are merged after dependency checks. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))  
4. **Reliability/performance operating point:** exact two-row activation and multi-row activation represent different latency/reliability points. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))  

Legal transformations are dependency-preserving DAG clustering, same-type Boolean node substitution, capacity-constrained cluster merging, column assignment, and instruction merging over common array/row accesses. The main equivalence exploited is Boolean associativity/mergeability for same-type operations when use-count and target-model constraints permit multi-row activation. The lowering must preserve data dependencies, operation type, row/column placement, output availability, array capacity, and the reliability implications of the number of simultaneously activated rows. The representation is especially well suited to static bulk-bitwise DAGs; expressing cross-operator bit-slice lifetime, numeric reconstruction, or alternative analog/digital route choices would likely require an added abstraction for value trajectory and precision/domain state.

## 6. Technical mechanism reading

### 6.1 Frontend and graph construction

The paper starts from a C program, parses it with pycparser, builds an AST, and then generates a DAG. Operation nodes represent logic operations; operand/intermediate nodes represent data values; graph edges encode dependencies. Operation nodes are unit-weighted, operand nodes and edges are zero-weighted, and b-level priorities are computed for operation nodes. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

The key IR point is that SHERLOCK treats **bulk-bitwise computation as a static dependency graph**, not as a loop/tensor schedule. Loops are present in source examples such as BitWeaving, but the mapping mechanism presented in the paper operates on the DAG for a kernel/iteration-level Boolean dataflow. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.2 Naive mapping baseline

Algorithm 1 takes a target and DAG and outputs `layout` and `inst`. It sorts operation nodes by b-level, computes unmapped operands for each operation, places operands into columns until the column fills, then moves to the next column. The layout stores data and arrival cycle in memory, while generated instructions define the execution order. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

The baseline is compiler-relevant because it defines the minimal backend contract: a graph node becomes a row/column placement plus an instruction sequence. It also exposes why mapping matters: when a single column cannot contain the required operands/intermediates, naive placement causes duplication or movement. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.3 Optimized mapping by operation clustering

Algorithm 2 computes the number of columns `k = operands(DAG) / m`, where `m` is column size, then finds `k` clusters of operation nodes. Cluster size is constrained by `CmaxSize`, derived from column capacity and node degrees, so each cluster can fit in one column. The goal is to group dependent operations and reduce cross-column dependencies. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

The cluster assignment score is:

`score(d, C) = β · |C| + α · Σ_{q ∈ pred(d) ∩ C} ρ(d, q)`

where `ρ(d, q)` is the priority difference between node `d` and predecessor `q`, and `α`, `β` control the influence of priority/dependency and cluster size. The paper states that the scoring rule generalizes the five assignment cases and favors grouping connected nodes with lower priority differences. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.4 Operation merging and multi-row activation

SHERLOCK applies a graph transformation when two operation nodes have the same operation type and the output of one is used once by the other. The two nodes can be replaced by one equivalent node with `x + y` operands. The target model matters because multi-row activation can reduce the number of operations but changes decision-failure probability. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

This is the paper’s clearest compiler/reliability coupling: the legal graph rewrite changes the number of operands activated together, which then affects both latency and the probability of sensing failure. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.5 Instruction generation and merging

Generated instructions use the format:

`op address[arrayID][columns][rows] [cim-op]`

The first field is `read`, `write`, or `shift`; the address field contains array ID, columns, and rows; CIM operations add a per-column logic-operation field. Shift instructions use array ID, direction, and distance for row-buffer alignment. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

After cluster mapping, SHERLOCK identifies mergeable instructions across clusters. For example, two reads from the same array and row but different columns can be combined into a single wider read, after dependency checking. This makes the instruction stream the paper’s most explicit backend serialization boundary. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.6 Hardware and reliability abstraction

The target hardware is a memristive NVM array with simultaneous wordline activation and scouting-logic-style column-wise Boolean operations such as (N)OR, (N)AND, and X(N)OR. Column-wise control is enabled by multiplexers connected to sense amplifiers and reference resistance, driven by configuration bits in the CIM instruction. The paper also assumes row copy, row-buffer rotation, and NOT using additional peripheral circuitry. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Reliability is modeled through decision failure: process variation and comparator/reference imperfections can cause the NVM-CIM output to be generated incorrectly. More activated rows can improve performance while reducing sense margin and increasing decision-failure probability. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

At application level, the paper uses:

`P_app = 1 - Π_i^N (1 - PDF_i)`

where `N` is the total number of operations and `PDF_i` is the error probability of operation `i`. This connects graph/schedule choices to an application-level failure probability. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### 6.7 Evaluation assumptions

The evaluation uses an extended version of gem5, NVSim for array-level latency/energy including hierarchy and interconnect, and SPICE simulations to derive LRS/HRS resistive levels and statistical decision-failure probabilities. Table 1 lists STT-MRAM, ReRAM, CMOS, array, and gem5 CPU/cache parameters. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

Workloads are BitWeaving-V for database scan predicates, bit-sliced Sobel edge detection, and Usuba-generated bit-sliced AES. Experiments vary ReRAM vs STT-MRAM, 512 vs 1024 arrays, and exact-2 vs `≥2`-row multi-row activation. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Column clusters are the real mapping IR

- **Observation:** The DAG is visible as the frontend IR, but the decisive compiler state is the cluster-to-column assignment: `k` clusters, `CmaxSize`, predecessor relationships, and b-level priority together determine whether operands stay local or require movement.
- **Why it matters for CIM compiler/IR work:** A future IR could make “column cluster” a typed placement object with capacity, dependency, and reliability attributes instead of keeping it as algorithm-local state.
- **Reusable lesson:** Borrow the cluster abstraction as a middle-layer resource object between Boolean DAGs and array instructions. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### Insight 2 — MRA couples graph rewriting to device reliability

- **Observation:** Replacing two same-type Boolean operations with one multi-operand operation reduces operation count but increases the number of activated rows, changing decision-failure probability.
- **Why it matters for CIM compiler/IR work:** This is an example where a graph rewrite has a technology-dependent correctness/risk cost, so legality and profitability need both symbolic dependency checks and device-aware reliability metadata.
- **Reusable lesson:** Treat operation arity / activated-row count as an IR attribute that propagates into cost and reliability models. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### Insight 3 — The instruction stream reveals the backend contract more clearly than the flow diagram

- **Observation:** Fig. 1 presents a compiler flow, but Fig. 4 and Sec. 3.2.1 show the actionable backend interface: op type, array ID, columns, rows, and per-column CIM op.
- **Why it matters for CIM compiler/IR work:** This format specifies what the backend must know: placement, alignment, selected columns, row activation, and operation type.
- **Reusable lesson:** A small adapter around this instruction schema could serve as a test target for other graph-level CIM mappers. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### Insight 4 — Reliability is modeled at operation and application granularity, not as a separate IR layer

- **Observation:** The paper derives application reliability from per-operation decision-failure probabilities, with device distributions feeding `PDF_i`.
- **Why it matters for CIM compiler/IR work:** This suggests a useful interface between hardware calibration and compiler scheduling: each scheduled CIM operation can carry a failure probability determined by operation type, device, and activated-row count.
- **Reusable lesson:** Future stacks could attach reliability annotations to scheduled operations and maintain a compositional application-level reliability expression. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

### Insight 5 — The frontend scope is narrow but concrete

- **Observation:** The paper’s frontend path is C → pycparser AST → DAG, and the evaluated kernels are bulk-bitwise or bit-sliced kernels.
- **Why it matters for CIM compiler/IR work:** This makes SHERLOCK useful for studying static Boolean kernels, but integration into tensor/MLIR/dataflow stacks would require an importer that lowers higher-level operations to the same Boolean DAG shape.
- **Reusable lesson:** Use SHERLOCK’s DAG expectations as a target format for bit-sliced or Booleanized compiler frontends. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **Public paper/slides:** The TU Dresden/cfaed publication page provides the paper PDF download; separate public slides are also indexed, but these are presentation materials rather than a runnable artifact. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/publications?pubId=3726))
- **License:** Unknown / not found for source code. The paper itself is ACM/DAC publication material; no repository license was found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** No public code artifact found. Checked public materials contain the paper PDF, official publication metadata, and slides.
- **What the artifact appears to omit:** Source code, parser, DAG serializer, mapper implementation, generated instruction files, gem5 extensions, NVSim configs, SPICE decks, workload scripts, reproduction workflow, and plotting scripts were not found.
- **Minimal command or workflow, if documented:** Unknown / not found in checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper provides algorithms, parameters, and numeric results, but no public scripts or generated outputs were found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | C input and pycparser AST route are described; no input schema or examples found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Intermediate representation serialized | Unknown | DAG is described and illustrated; no serialized DAG artifact found. |
| Mapping decisions inspectable | Partial | Algorithms expose layout/clusters; no public mapping logs found. |
| Schedule inspectable | Partial | Instruction format and snippet are shown; no full generated schedules found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Hardware config explicit | Partial | Table 1 reports parameters; no config files found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Precision / bit-slice assumptions explicit | Partial | Bit-sliced Sobel and AES are stated; bit significance is not exposed as an IR field. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Cost model inspectable | Partial | Cluster score and `P_app` equation are visible; simulator implementation not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Simulator backend documented | Partial | Extended gem5, NVSim, and SPICE/statistical modeling are described; no backend code found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Generated code / instruction stream inspectable | Partial | Format and example are shown in Fig. 4; no generated files found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |
| Provenance from source op to backend action | Partial | The algorithms connect DAG nodes to layout and instruction generation; no trace/provenance file found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | Device/circuit parameters and model references are listed; simulation decks and raw distributions were not found. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest if another tool can emit SHERLOCK-style Boolean DAGs from C, bit-sliced code, or higher-level kernels. The paper’s pycparser path is a useful reference, but a public importer was not found.
- **As IR inspiration:** The DAG + b-level priority + cluster + layout combination is the strongest IR inspiration. A future stack could serialize these as graph nodes, placement annotations, and resource constraints.
- **As mapper/scheduler:** The cluster scoring, `CmaxSize` capacity constraint, greedy cluster merging, and dependency-safe instruction merging are the most directly adaptable mechanisms.
- **As cost model:** The useful backend plugin would expose latency/energy per read/write/shift/CIM op, plus `PDF_i` as a function of technology, operation type, and activated-row count.
- **As backend:** The simulator-facing instruction format could be wrapped if the extended gem5/NVSim/SPICE environment or an equivalent backend is available.
- **As benchmark:** BitWeaving-V, bit-sliced Sobel, and Usuba-generated bit-sliced AES are useful static Boolean-kernel benchmarks for graph-to-CIM mappers. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))
- **As validation source:** The paper provides SPICE/statistical modeling assumptions and simulator-backed latency/energy/reliability results, not chip measurements. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf))

**Integration effort estimate: Medium–High.**  
Integration would be most direct through a small adapter that emits SHERLOCK-like DAGs and consumes a SHERLOCK-like instruction schema. Effort rises because the checked sources do not expose code, configs, generated traces, or simulator extensions. The most valuable reusable boundary appears to be the layout/instruction interface plus reliability annotation per scheduled CIM operation.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **Pinatubo** | NVM bulk bitwise operations with simultaneous row activation | Pinatubo is primarily an NVM PIM architecture/circuit proposal for OR/AND/XOR/INV; SHERLOCK adds a graph mapping/scheduling layer for larger applications and column placement. ([cseweb.ucsd.edu](https://cseweb.ucsd.edu/~jzhao/files/Pinatubo-dac2016.pdf?utm_source=chatgpt.com)) | Classify Pinatubo closer to architecture/macro support and SHERLOCK closer to compiler mapping/scheduling. |
| **CONCEPT** | RRAM PIM operations and memory-controller organization | CONCEPT focuses on a column-oriented memory controller for RRAM PIM operations; SHERLOCK focuses on compiling DAGs into column layouts and instruction sequences. ([asic2.group](https://asic2.group/wp-content/uploads/2018/12/CONCEPT_IEEE_MICRO_FINAL-1.pdf?utm_source=chatgpt.com)) | Useful contrast between controller-level backend design and graph-to-controller scheduling. |
| **RACER** | Resistive-memory processing and compiler/ISA-facing execution | RACER provides a bit-pipelined execution model and ISA abstraction for resistive memory; SHERLOCK’s main abstraction is DAG clustering and reliability-aware MRA scheduling. ([ghose.web.illinois.edu](https://ghose.web.illinois.edu/papers/21micro_racer.pdf?utm_source=chatgpt.com)) | Both are relevant to compiler/IR stacks, but RACER is more ISA/execution-model centered while SHERLOCK is mapper/scheduler centered. |
| **Ambit** | Bulk bitwise operations inside memory | Ambit targets commodity DRAM using triple-row activation for AND/OR; SHERLOCK targets memristive NVM scouting logic with multi-row activation and device-dependent reliability modeling. ([People Inf ETH Zurich](https://people.inf.ethz.ch/omutlu/pub/ambit-bulk-bitwise-dram_micro17.pdf?utm_source=chatgpt.com)) | Useful for distinguishing DRAM-PIM bitwise primitives from NVM-CIM reliability-aware scheduling. |
| **ParaBit** | Parallel bitwise operations near/in storage | ParaBit is a NAND-flash SSD bulk-bitwise system cited as related in the paper; SHERLOCK targets array-level NVM CIM mapping. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Corpus tag should separate storage/SSD bitwise PIM from array-level NVM-CIM compilers. |
| **BitWeaving / Usuba** | Bit-level workload representation | BitWeaving-V and Usuba-generated bit-sliced AES are inputs/benchmarks rather than SHERLOCK’s backend target. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2406_Farzaneh_DAC.pdf)) | Treat them as frontend/workload sources for Boolean DAGs, not as CIM mappers. |

## 10. Corpus-ready final takeaway

- SHERLOCK’s real contribution is a **DAG-to-NVM-array mapping and scheduling method** for bulk bitwise CIM, centered on operation clustering, column placement, instruction generation, and MRA-aware reliability tradeoffs.
- The strongest reusable stack layer is the **mapper/scheduler boundary**: DAG nodes become clusters, clusters become column layouts, and layouts become read/write/shift/CIM instructions.
- The evidenced scope is **static bulk-bitwise kernels** evaluated on scouting-logic-style ReRAM/STT-MRAM arrays using extended gem5, NVSim, SPICE-derived parameters, and statistical decision-failure modeling.
- First-class objects include **operation/operand DAG nodes, b-level priorities, clusters, layout, rows/columns/array IDs, CIM op fields, multi-row activation count, and per-operation failure probability**.
- The hidden IR is the combination of **DAG annotations + cluster state + layout table + target parameters + instruction stream**, rather than a single public dialect or schema.
- **Artifact status: no public artifact found.** The public checked sources provide the paper PDF and slides, but no repository, scripts, simulator extensions, configs, or generated traces.
- Integration would be most useful by reimplementing or adapting the **cluster/layout/instruction logic** and connecting it to another CIM backend with explicit latency, energy, and reliability callbacks.
- For a value-trajectory IR, SHERLOCK is a useful precursor because it ties value dependencies to physical placement and operation failure probability; trajectory-level reuse would add typed value path metadata across placement, sensing, and storage.
