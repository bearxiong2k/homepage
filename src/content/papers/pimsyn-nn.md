---
slug: pimsyn-nn
title: "PIMSYN: Synthesizing Processing-in-memory CNN Accelerators"
short_title: "PIMSYN-NN"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "DATE 2024"
authors_or_group: "Wanqian Li, Xiaotian Sun, Xinyu Wang, Lei Wang, Yinhe Han, Xiaoming Chen"
summary: >-
  PIMSYN-NN, published as **PIMSYN: Synthesizing Processing-in-memory CNN Accelerators**, contributes an automatic synthesis and design-space-exploration flow for crossbar-based PIM CNN accelerators. Its central compiler/IR contribution is an IR-based dataflow DAG used to express computation, intra-macro communication, and inter-macro communication while the DSE flow searches weight duplication, DAC/ReRAM/crossbar settings, macro partitioning, macro sharing, and peripheral allocation. The demonstrated stack is strongest for **static CNN inference** from ONNX-format model structure plus a power budget into a synthesized macro/PE/crossbar architecture and dataflow schedule, with evaluation through a cycle-accurate IR-based behavior-level simulator. For CIM compiler/IR research, PIMSYN-NN is most useful as a mapping/scheduling and hardware-resource synthesis case study: it makes several CIM architectural objects first-class, while its IR semantics are most reusable when read together with the DAG construction rules, component-allocation model, JSON configs, and downstream PIMCOMP/PIMSIM toolchain interfaces. ([arXiv](https://arxiv.org/pdf/2402.18114))
links:
  paper: https://arxiv.org/pdf/2402.18114
  artifact: https://github.com/lixixi-jook/PIMSYN-NN
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
  - "crossbar-CIM"
  - "parameterized-PIM-template"
workloads:
  - "CNN inference"
  - "AlexNet"
  - "VGG13"
  - "VGG16"
  - "MSRA"
  - "ResNet18"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A2, A4]
axis_B: [B2, B4, B1]
axis_C_first_class_objects:
  - "crossbar_set"
  - "weight_duplication_factor"
  - "macro_PE_crossbar_hierarchy"
  - "DAC_resolution"
  - "ADC_resolution"
  - "ADC_bank"
  - "ALU_units"
  - "macro_partition"
  - "macro_sharing"
  - "load_store_merge_transfer_IR_nodes"
  - "bit_iteration_index"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "array_binding"
  - "macro_partitioning"
  - "resource_allocation"
  - "dataflow_DAG_dependencies"
  - "bit_level_schedule"
  - "component_allocation"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/lixixi-jook/PIMSYN-NN"
  license: "Apache-2.0"
  last_checked: "2026-05-15"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "backend_adapter_via_PIMCOMP"
  - "simulator_adapter_via_PIMSIM"
reproducibility_level: medium
notes:
  - "Strongest evidence is for static CNN inference on a parameterized crossbar-based PIM accelerator template."
  - "IR-based DAG is explicit in the paper and code, but the most inspectable public interchange objects are JSON configs and architecture outputs."
  - "PIMSYN-NN synthesizes architecture/dataflow choices; companion PIMCOMP-NN handles instruction generation and PIMSIM-NN handles instruction-driven simulation."
takeaways: []
---

# PIMSYN-NN — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework** | The strongest evidenced contribution is the DSE loop that chooses weight duplication, DAC/ReRAM/crossbar parameters, macro partitioning, macro sharing, and peripheral allocation under a power budget. The paper’s own four-stage flow is weight duplication, dataflow compilation, macro partitioning, and components allocation. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Secondary stack role, Axis A | **A5 Narrow end-to-end co-design**; partial **A2 simulator/cost model**; limited **A4 IR-style compiler stack** | It accepts ONNX CNN structure, power constraint, and hardware setup parameters, then emits an accelerator architecture and dataflow schedule. Evaluation uses a cycle-accurate IR-based behavior-level simulator, while the artifact emits architecture JSON and PIMCOMP configuration rather than a backend-neutral serialized IR. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B1 Config-as-IR** | The paper names an IR-based DAG whose nodes are operations and whose edges are dependencies; design variables and artifact JSON also make hardware-resource choices explicit. The reusable boundary is clearest in JSON model/config/output files and the paper’s IR-node taxonomy. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| First-class CIM objects, Axis C | Crossbar set, weight duplication factor, macro/PE/crossbar hierarchy, DAC/ADC resolution, ADC bank, ALU units, macro partition, macro sharing, load/store/merge/transfer, bit iteration | These are named as design variables, IR nodes, architecture components, or output fields. The paper’s Table I and Table II are the clearest statements of first-class objects; the artifact output records per-layer duplication, macro count, macro size, ADC, SHIFTADD, and ADDITION allocation. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Rewrite object, Axis D | **Mapping + hardware allocation + dataflow DAG scheduling** | The framework rewrites the mapping state more than the mathematical operator graph: it chooses duplication, bit-loop decomposition via DAC resolution, DAG dependencies, macro binding, macro sharing, and component counts. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Best corpus tags | `compiler-mapping`, `DSE`, `graph-as-IR`, `hardware-resource-IR`, `RRAM-CIM`, `analog-CIM`, `crossbar-CIM`, `CNN-inference`, `architecture-synthesis`, `PIM-toolchain` | The demonstrated setting is crossbar-based PIM CNN acceleration, evaluated on static CNN inference models and integrated with a broader PIM toolchain. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Closest comparison baselines | Gibbon, NACIM, PIM-HLS, AutoDCIM, PIMCOMP-NN, PIMSIM-NN, ISAAC/PUMA-style crossbar accelerators | Gibbon/NACIM are close DSE baselines; PIM-HLS and AutoDCIM are nearby generation flows; PIMCOMP/PIMSIM are companion compiler/simulator tools; ISAAC/PUMA are representative manual architecture baselines. ([arXiv](https://arxiv.org/html/2402.18114v1)) |

## 2. One-paragraph public summary

PIMSYN-NN, published as **PIMSYN: Synthesizing Processing-in-memory CNN Accelerators**, contributes an automatic synthesis and design-space-exploration flow for crossbar-based PIM CNN accelerators. Its central compiler/IR contribution is an IR-based dataflow DAG used to express computation, intra-macro communication, and inter-macro communication while the DSE flow searches weight duplication, DAC/ReRAM/crossbar settings, macro partitioning, macro sharing, and peripheral allocation. The demonstrated stack is strongest for **static CNN inference** from ONNX-format model structure plus a power budget into a synthesized macro/PE/crossbar architecture and dataflow schedule, with evaluation through a cycle-accurate IR-based behavior-level simulator. For CIM compiler/IR research, PIMSYN-NN is most useful as a mapping/scheduling and hardware-resource synthesis case study: it makes several CIM architectural objects first-class, while its IR semantics are most reusable when read together with the DAG construction rules, component-allocation model, JSON configs, and downstream PIMCOMP/PIMSIM toolchain interfaces. ([arXiv](https://arxiv.org/pdf/2402.18114))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “Full-stack automatic synthesis framework” and “one-click transformation from CNN applications to PIM architectures” | Abstract and Introduction | Paper-only + artifact workflow | The paper defines an input/output synthesis flow; the artifact README exposes commands from ONNX or pre-converted JSON to generated architecture JSON and PIMCOMP config. ([arXiv](https://arxiv.org/html/2402.18114v1)) | Demonstrated for ONNX-format CNN structure and preprocessed CNN JSON into a parameterized PIM accelerator template. The public artifact documents examples, but figure-level reproduction scripts are not clearly separated. |
| DSE over dataflows and architectures | Introduction and Section III | Algorithm + code/artifact | Algorithm 1 traverses ReRAM ratio, ReRAM resolution, crossbar size, weight-duplication candidates, DAC resolution, macro partitioning, and component allocation; the artifact’s `main.py` loops over default ReRAM ratio/resolution/crossbar-size candidates and selects best power efficiency. ([arXiv](https://arxiv.org/pdf/2402.18114)) | The evidenced DSE is tailored to static CNN inference and the paper’s macro/PE/crossbar template. |
| PIM-friendly IRs expand architectural optimization opportunities | Introduction and Section IV-B | IR taxonomy + DAG construction | Table II defines MVM, ADC, ALU, load, store, merge, and transfer IRs with parameters such as layer, computation block, bit, crossbar count, vector width, and macro count. ([arXiv](https://arxiv.org/pdf/2402.18114)) | The IR is described and implemented as an internal scheduling/cost-model abstraction. A standalone serialized, versioned, backend-agnostic IR schema is not clearly exposed in the artifact. |
| Weight duplication is optimized rather than fixed heuristically | Section IV-A and Fig. 7 | Equation + algorithm + experiment | The paper formulates duplication as a constrained optimization over `WtDup`, uses an SA-based filter to select 30 candidates, and reports 19% power-efficiency and 27% throughput improvement over a `WOHO`-proportional heuristic. ([arXiv](https://arxiv.org/pdf/2402.18114)) | Evidence is simulator-backed and evaluated over the paper’s CNN benchmarks and hardware template. |
| Macro partitioning and inter-layer macro sharing improve efficiency | Section IV-C and Fig. 8–9 | Algorithm + experiment | The EA-based explorer mutates macro counts and macro-sharing choices, while inter-layer ADC reuse via macro sharing is reported to improve overall power efficiency by 8% and throughput by 15%. ([arXiv](https://arxiv.org/pdf/2402.18114)) | The reusable concept is strong for resource sharing in pipelined CNN accelerators; generalization to other operators or dynamic workloads would require additional dependence/resource modeling. |
| Components allocation balances peripheral resources under power budget | Section IV-D | Equation + heuristic | The paper models peripheral allocation as minimizing the maximum delay under a functional-unit power budget, then derives an allocation relation for `CompAlloc`. ([arXiv](https://arxiv.org/pdf/2402.18114)) | The model covers ADC bank and ALU-style components in the template; calibration depends on the provided latency/power parameters. |
| PIMSYN improves performance/power efficiency over prior works | Section V | Experiment | The paper reports 3.65–21.45× peak power-efficiency improvement over five manual PIM CNN accelerators, 1.4–5.8× effective power-efficiency improvement over ISAAC, and 56% average EDP decrease versus Gibbon on CIFAR-10/CIFAR-100 models. ([arXiv](https://arxiv.org/pdf/2402.18114)) | These are simulator-backed comparisons using selected CNNs and parameters from ISAAC/MNSIM where available. |
| Device independence for crossbar-based PIM CNN accelerators | Conclusion | Paper-only + config evidence | The conclusion states the template uses device parameters such as read power and latency rather than relying on a specific ReRAM device; artifact config exposes ReRAM, DAC, ADC, memory, NoC, and ALU latency/power parameters. ([arXiv](https://arxiv.org/pdf/2402.18114)) | The demonstrated scope remains crossbar-based PIM CNN acceleration; porting to a different device family would require validated parameter tables and possible simulator adaptation. |

## 4. Stack anatomy

```text
Input / frontend:
ONNX-format CNN model or preconverted model JSON; total power constraint; hardware setup parameters.
Object type: model graph/config JSON.
Serialization/reuse: ONNX is external; artifact includes preconverted JSON models for AlexNet, VGG13, VGG16, MSRA-A, and ResNet18, plus commands for ONNX-to-JSON use. The paper assumes the CNN is already trained and quantized. 
```

The paper and README both identify ONNX-format CNN structure, power constraint, and hardware parameters as inputs; the README also states that common models have been preconverted to JSON. ([arXiv](https://arxiv.org/pdf/2402.18114))

```text
Middle representation:
IR-based dataflow DAG.
Object type: graph of operation nodes plus dependency edges.
Serialization/reuse: described in the paper and implemented in code as IR nodes, but not documented as a stable external interchange schema.
```

The DAG nodes represent operations and edges represent dependencies; Table II names computation, intra-macro communication, and inter-macro communication IRs. ([arXiv](https://arxiv.org/pdf/2402.18114))

```text
Mapping or scheduling state:
WtDup vector, ResDAC, ResRram, XbSize, RatioRram, MacAlloc, CompAlloc, macro sharing, bit-loop count, dependency/bubble state.
Object type: search state + graph annotations + resource allocation.
Serialization/reuse: final allocation is partly visible in output JSON; intermediate DAG and search populations are less clearly exposed as public artifacts.
```

Algorithm 1 makes these decisions part of the DSE loop; the artifact output JSON records final per-layer duplication, macro counts, macro size, macro sharing, ADC, SHIFTADD, and ADDITION allocations. ([arXiv](https://arxiv.org/pdf/2402.18114))

```text
Hardware abstraction:
Parameterized macro/PE/crossbar template with NoC, scratchpad memory, PE array, DACs, crossbar, S&H, ADC bank, ALU units, registers, and controller.
Object type: hardware-resource template and parameter table.
Serialization/reuse: hardware setup appears in config.json and final architecture JSON.
```

The paper’s Fig. 2 and architecture section describe the three-level macro–PE–crossbar hierarchy and peripheral blocks; `config.json` exposes power/latency values for ReRAM, memory, ADC, DAC, and ALU-style components. ([arXiv](https://arxiv.org/pdf/2402.18114))

```text
Backend / simulator / codegen:
PIMSYN produces an accelerator architecture and dataflow schedule; companion PIMCOMP-NN can use an architecture instance to generate an instruction sequence; PIMSIM-NN simulates architecture + instruction sequence.
Object type: architecture JSON / PIMCOMP config; companion toolchain instruction stream.
Serialization/reuse: PIMSYN artifact emits architecture JSON and PIMCOMP configuration JSON; full instruction generation is delegated to PIMCOMP-NN.
```

The PIM-Toolchain README positions PIMSYN-NN as the synthesizer, PIMCOMP-NN as the compiler that emits instruction sequences, and PIMSIM-NN as the simulator that consumes architecture plus instructions. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

```text
Output artifact:
Synthesized architecture implementation JSON and PIMCOMP input configuration JSON.
Object type: config-as-output / architecture instance.
Serialization/reuse: yes, inspectable JSON in the public artifact.
```

Example output includes global fields such as `rram_ratio`, `rram_res`, `xbar_size`, `dac_res`, `adc_res`, `macro_h`, `macro_w`, and per-layer allocation fields; the PIMCOMP output includes `CellPrecision`, `CrossbarH/W`, `ChipH/W`, and `CoreH/W`. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/output/alexnet.json))

```text
Evaluation loop:
Cycle-accurate IR-based behavior-level simulator used in the paper; public toolchain also includes PIMSIM-NN for instruction-driven performance/power/energy simulation.
Object type: simulator-backed performance model.
Serialization/reuse: paper-level simulator evidence is clear; artifact-level reproduction of all paper plots is partial/unclear from checked documentation.
```

The paper states that synthesized accelerators are evaluated by a cycle-accurate IR-based behavior-level simulator, while PIMSIM-NN is documented as a companion simulator that consumes instruction and architecture configuration files. ([arXiv](https://arxiv.org/pdf/2402.18114))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the paper’s IR-node taxonomy, the generated dataflow DAG, the DSE variables, the resource allocation maps, the latency/power parameter tables, and the companion PIMCOMP/PIMSIM boundary. The paper foregrounds the IR-based DAG, while the reusable semantics are most visible in the tuple `{model JSON, config.json, WtDup/MacAlloc/CompAlloc decisions, output architecture JSON, PIMCOMP config}`. This makes PIMSYN-NN especially useful as a case study in **mapping-state-as-IR**, where correctness and performance semantics are distributed across graph dependencies, scheduling rules, and resource cost tables. ([arXiv](https://arxiv.org/pdf/2402.18114))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
PIMSYN-NN’s main owned slice is the search from CNN structure and hardware/power parameters to a resource allocation and schedule. The four synthesis stages explicitly decide weight duplication, convert the CNN to an IR-based DAG, partition computation across macros, and allocate components such as ADCs, DACs, and ALUs. ([arXiv](https://arxiv.org/pdf/2402.18114))

**Secondary: A5 Narrow end-to-end co-design.**  
The paper demonstrates an end-to-end path from ONNX CNN structure to architecture implementation and dataflow scheduling, but within a focused setting: static CNN inference on a parameterized crossbar-based PIM accelerator template. The workflow is narrow but coherent: CNN model + power constraint + hardware setup parameters in; synthesized PIM accelerator architecture and schedule out. ([arXiv](https://arxiv.org/pdf/2402.18114))

**Secondary: A2 Simulator & cost model.**  
PIMSYN-NN uses latency/power tables and an IR-based behavior-level simulator to rank candidates. The cost model is especially explicit for weight duplication, crossbar count, and component allocation. ([arXiv](https://arxiv.org/pdf/2402.18114))

**Partial: A4 Explicit IR / dialect / ISA compiler stack.**  
The paper defines named IR nodes and a DAG abstraction, but the public reusable interface is clearest as JSON configuration and output rather than a separately documented IR dialect, verifier, or backend-agnostic serialization. PIMCOMP-NN, the companion compiler, is the stack component that more directly targets instruction-flow generation. ([arXiv](https://arxiv.org/pdf/2402.18114))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is the **IR-based dataflow DAG**. It represents MVM/ADC/ALU/load/store/merge/transfer operations as nodes and dependency types as edges, including inter-layer, inter-block, inter-bit, and inter-operation dependencies. Decisions made here include execution ordering, bit-level iteration scheduling, inter-layer pipeline readiness, and communication dependencies. A single external artifact that upstream tools could read, verify, and rewrite is not clearly documented; the graph appears primarily as an internal Python data structure. ([arXiv](https://arxiv.org/pdf/2402.18114))

**B4 Hardware-resource IR.**  
The hardware-resource layer is encoded through `WtDup`, `MacAlloc`, `CompAlloc`, `XbSize`, `ResRram`, `ResDAC`, ADC resolution, macro count, and component counts. These decisions determine how the graph maps to crossbars, macros, ADC banks, ALUs, and communication resources. The final mapping is inspectable in output JSON, while some intermediate search-state details remain embedded in the DSE, SA, EA, and simulator logic. ([arXiv](https://arxiv.org/pdf/2402.18114))

**B1 Config-as-IR.**  
The artifact’s `config.json`, model JSON, architecture output JSON, and PIMCOMP configuration JSON function as a practical integration boundary. They expose precision, power, latency, crossbar, macro, and per-layer allocation fields. This is not positioned as a formal IR in the paper, but it is the clearest serialized interface for reuse. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/config.json))

**Borderline B6 Accuracy / nonideality modeling.**  
PIMSYN-NN treats the input CNN as already trained and quantized, sets ADC resolution to satisfy a minimum requirement, and states that hardware synthesis will not introduce accuracy loss. Accuracy and nonideality simulation are better represented by the companion PIMACC tool in the broader PIM EDA Suite, rather than by PIMSYN-NN itself. ([arXiv](https://arxiv.org/pdf/2402.18114))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class / parameterized** | Crossbar set is formalized in Eq. 1; the architecture template is macro–PE–crossbar; output JSON records `xbar_size`, `macro_h`, `macro_w`, `macro_num`, and `macro_size`. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Bit-slicing / bit significance | **First-class as scheduling index; numeric semantics mostly parameterized** | The paper introduces bit-level iterations when activation precision exceeds DAC resolution; Table II includes `bit` in MVM/ADC/ALU IR parameters. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| ADC/DAC precision or sensing | **Parameter / costed resource** | `ResDAC` appears in the design space; ADC resolution is selected to satisfy a minimum; artifact config includes DAC and ADC power/latency/frequency tables. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Analog-to-digital or domain transition | **First-class operation path** | The architecture section describes PE analog outputs converted by ADC bank and then calculated by ALUs; Table II includes ADC as an IR node. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Peripheral circuits as path nodes | **First-class / costed** | Components allocation assigns functional components inside each macro, including ADCs, DACs, and ALUs; output JSON records per-layer ADC, SHIFTADD, ADDITION, and POOL allocation. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Partial-sum accumulation path | **Costed / represented through ALU and shift-add operations** | ALUs support shift-and-add, pooling, and ReLU; Table II includes ALU with `aluop`; config includes SHIFTADD and ADDITION component parameters. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Reconstruction / shift-add tree | **Hard-coded or implicit beyond component count** | Shift-add is visible as an ALU/vector operation and artifact allocation field, but tree shape and reconstruction path are not exposed as an independent rewriteable object in the checked sources. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly not applicable for the demonstrated CNN synthesis scope** | The paper targets CNN inference with static model structure; companion PIMSIM has simulation modes for throughput/latency, but PIMSYN-NN’s own abstraction centers on static architecture/dataflow synthesis. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Value trajectory / flow path | **Approximated by DAG dependencies and resource binding** | MVM/ADC/ALU/load/store/merge/transfer nodes and dependencies approximate where values move, but value identity across analog partial sums, conversion, reconstruction, reduction, and storage is not exposed as a type-like trajectory object. ([arXiv](https://arxiv.org/pdf/2402.18114)) |

### 5.4 Axis D — rewrite object

PIMSYN-NN rewrites **hardware mapping and schedule state**. The main transformations are:

- choosing per-layer weight duplication (`WtDup`);
- choosing crossbar size, ReRAM resolution, DAC resolution, ADC resolution, and ReRAM power ratio;
- translating the CNN structural description into an IR-based dataflow DAG;
- adding dependency edges for inter-layer, inter-block, inter-bit, and inter-operation ordering;
- partitioning each layer’s crossbars across one or more macros;
- enabling macro sharing between selected layers to reuse ADCs at staggered times;
- allocating peripheral components across layers and IR workloads under a power budget. ([arXiv](https://arxiv.org/pdf/2402.18114))

The legal transformations preserve the trained/quantized CNN semantics while changing parallelism, placement, resource sharing, and latency/power balance. The key equivalences are that duplicated weights can compute multiple output positions in parallel, macro partitioning can distribute a layer’s resources across macros, and non-conflicting IRs can share physical resources. The information preserved across lowering includes layer dependencies, per-layer dimensions, bit iteration order, output availability for fine-grained pipelining, power-budget accounting, and hardware latency/power parameters. ([arXiv](https://arxiv.org/pdf/2402.18114))

The representation is especially well suited to architecture/resource exploration for static CNN graphs. Expressing trajectory-level transformations—such as delaying ADC conversion across operator boundaries, fusing reconstruction with reduction, or carrying bit-sliced partial sums into downstream operators—would likely require an additional abstraction for value identity, domain, bit significance, precision stage, and reconstruction/reduction path.

## 6. Technical mechanism reading

### 6.1 Crossbar-set model and duplication

The paper begins with a crossbar-based convolution model. A layer requires `CO` columns and `WK × WK × CI` rows, and when crossbar size and device resolution are limited, the weights are mapped to a **crossbar set**. Eq. 1 computes the number of crossbars in a set from kernel size, input channels, output channels, crossbar size, weight precision, and ReRAM cell resolution. A `WtDup` factor duplicates a layer’s weights across multiple sets, allowing `WtDup × CO` outputs to be computed in parallel and reducing the number of steps to complete the layer. ([arXiv](https://arxiv.org/pdf/2402.18114))

For compiler/IR purposes, `WtDup` is a central mapping variable: it changes the number of computation blocks, affects inter-layer pipeline timing, and influences communication volume. PIMSYN-NN models duplication as a constrained optimization problem: maximize performance over `WtDup` subject to the total crossbar budget. The crossbar budget is derived from total power, the ReRAM power ratio, and crossbar power as a function of crossbar size and ReRAM resolution. ([arXiv](https://arxiv.org/pdf/2402.18114))

### 6.2 SA-based weight-duplication candidate filter

The `WtDup` search space is large because it contains positive integer duplication choices across all layers. PIMSYN-NN uses a simulated annealing filter to select 30 candidate duplication vectors with low energy-function values before subsequent synthesis stages. The energy function balances two standard deviations: one over layer computation steps and one over per-layer access volume. In corpus terms, this is a useful separation between **mapping legality** and **candidate ranking**: Eq. 2 constrains total crossbar use, while Eq. 4 ranks candidate schedules by balance of compute and access pressure. ([arXiv](https://arxiv.org/pdf/2402.18114))

### 6.3 IR-based dataflow compilation

The dataflow compiler translates the CNN structural description into a DAG whose nodes are IR operations and whose edges are dependencies. The IR categories are:

- computation: MVM, ADC, ALU;
- intra-macro communication: load, store;
- inter-macro communication: merge, transfer.

Each IR node is parameterized with fields such as layer, computation-block count, bit index, vector width, crossbar count, source/destination macro, and macro count. The key dependence classes are inter-layer, inter-block, inter-bit, and inter-operation. This is the paper’s most explicit IR contribution: it turns layer-level CNN structure into a time/resource-sensitive graph that can be costed by DAG depth and IR latencies. ([arXiv](https://arxiv.org/pdf/2402.18114))

The artifact’s `dataflow_compile.py` mirrors this reading: it defines `IRNode` with operation name, operation index, computation-block index, bit index, timing fields, parent/child lists, and dependency delays; it also includes logic for inter-operation, inter-block, inter-layer, inter-bit, ADC conflict, NoC conflict, and bubble insertion. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/dataflow_compile.py))

### 6.4 Macro partitioning and macro sharing

Macro partitioning addresses communication and peripheral pressure when a layer’s resources are concentrated in too few macros. PIMSYN-NN supports identical macros across layers and customized macros per layer; it permits a layer to occupy one or more macros and permits two layers to share the same macro set. The sharing rule is motivated by inter-layer ADC reuse: if two layers use ADCs at staggered times, sharing can reduce ADC requirements with limited delay penalty. ([arXiv](https://arxiv.org/pdf/2402.18114))

The EA-based macro-partitioning explorer represents a macro partition as a gene, mutates the number of macros assigned to layers, mutates macro-sharing status, evaluates children through component allocation, and returns the best `MacAlloc`. This stage also completes communication-related IR latency information in the DAG. ([arXiv](https://arxiv.org/pdf/2402.18114))

### 6.5 Peripheral component allocation

Components allocation maps IRs to hardware resources. Different IRs may share a physical resource when they do not conflict in usage. PIMSYN-NN models the allocation problem as minimizing the maximum delay across layer/component workloads under the remaining power budget after ReRAM allocation. The variables include component workload, component frequency, component power, and the number of component instances allocated to each layer. ([arXiv](https://arxiv.org/pdf/2402.18114))

This is important for CIM IR research because peripheral units are not peripheral to the compiler problem: ADCs and ALUs directly determine schedule length and power allocation. In PIMSYN-NN, the allocation of ADCs, shift-add units, addition units, and pooling units is part of the final architecture object, visible in artifact output JSON. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/output/alexnet.json))

### 6.6 Workload, precision, and evaluation assumptions

The demonstrated workloads are AlexNet, VGG13, VGG16, MSRA, and ResNet18 with 16-bit quantization. The paper’s setup table includes eDRAM, NoC, ReRAM, DAC, and ADC parameters, and it states that other parameters are taken from ISAAC and MNSIM. PIMSYN-NN is implemented in Python and the paper reports about four hours for a synthesis process. ([arXiv](https://arxiv.org/pdf/2402.18114))

Precision is handled as a synthesis input/parameter rather than as a full numeric type system. Weight precision and ReRAM resolution affect crossbar count; activation precision versus DAC resolution induces bit-level iterations; ADC resolution is selected to satisfy a minimum requirement. ([arXiv](https://arxiv.org/pdf/2402.18114))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Weight duplication is treated as a schedule-shaping variable

- **Observation:** `WtDup` is not simply a memory replication count; it changes computation-block count, inter-layer pipeline timing, access volume, crossbar budget, and the DAG that downstream stages see. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **Why it matters for CIM compiler/IR work:** A CIM IR that treats duplication as layout metadata alone would miss its scheduling effect. PIMSYN-NN shows duplication should be visible to both resource allocation and dependence construction.  
- **Reusable lesson:** Future IRs can model weight duplication as a first-class mapping attribute attached to layer/operator instances, with derived effects on computation blocks, buffer demand, and communication pressure.

### Insight 2 — The IR DAG is a cost-model vehicle, not just a compiler graph

- **Observation:** The paper’s DAG is designed so synthesized accelerator performance can be estimated from DAG depth and IR latencies, and resource allocation corresponds to finding good hardware allocation for IRs. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **Why it matters for CIM compiler/IR work:** The graph is not merely a lowering of CNN operators; it is a bridge between scheduling, resource sharing, and cost estimation.  
- **Reusable lesson:** A useful CIM middle layer can expose latency-bearing micro-operations such as MVM, ADC, load/store, merge/transfer, and ALU operations without immediately committing to an instruction ISA.

### Insight 3 — Macro sharing reveals a compiler-level form of ADC reuse

- **Observation:** PIMSYN-NN searches for layer pairs that can share macro resources, especially ADCs, when their use times are staggered. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **Why it matters for CIM compiler/IR work:** ADC reuse is often viewed as a circuit or architecture policy; PIMSYN-NN frames it as a scheduling and resource-binding problem.  
- **Reusable lesson:** Future IRs could represent ADC lifetime intervals and conflict graphs, allowing passes to rewrite placement and conversion schedules while preserving dependence legality.

### Insight 4 — Config files form the most concrete public interchange boundary

- **Observation:** The artifact’s stable public objects are JSON files: model JSON, hardware/DSE config JSON, architecture output JSON, and PIMCOMP config JSON. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **Why it matters for CIM compiler/IR work:** Even when a paper names an IR, the artifact may expose a different practical boundary for reuse.  
- **Reusable lesson:** Corpus entries should record both the “paper IR” and the “artifact IR.” For PIMSYN-NN, the artifact IR is closest to a hardware-resource configuration and architecture-instance schema.

### Insight 5 — PIMSYN-NN separates synthesis from instruction generation

- **Observation:** The PIMSYN-NN repository says PIMCOMP-NN can further realize compilation optimization for accelerators synthesized by PIMSYN-NN, and the PIM-Toolchain README assigns architecture synthesis to PIMSYN-NN and instruction-sequence generation to PIMCOMP-NN. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **Why it matters for CIM compiler/IR work:** This separation clarifies the stack boundary: PIMSYN-NN produces an architecture and schedule-level design point, while instruction-stream generation is downstream.  
- **Reusable lesson:** A future CIM stack can use PIMSYN-style synthesis as an architecture/back-end selection pass before an ISA compiler lowers scheduled graph fragments to executable instructions.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL or identifier:** GitHub repository `lixixi-jook/PIMSYN-NN`, linked from the paper abstract and README. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **License:** Apache License v2.0. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** Python implementation files (`main.py`, `dse.py`, `dataflow_compile.py`, `simulated_annealing.py`, `evolution_algorithm.py`, `macro_allocate.py`, `component_allocate.py`, etc.), `config.json`, model JSONs, documentation/images, and example output JSONs. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **What the artifact appears to omit:** The checked README documents example commands and output files, but I did not find a packaged release, Docker/Conda environment file, or dedicated scripts that map directly to every paper figure/table. GitHub reports “No releases published.” ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **Minimal documented workflow:** Install Python packages `onnx`, `onnxruntime`, `numpy`, and `tqdm`; run `python main.py --network ... --total_power ... --macro_setting specified --config config.json --macro_reuse True --output ... --pimcomp ...`, or run with `--onnx_path` to invoke the frontend. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **Whether paper figures appear reproducible from the artifact:** **Partial / unclear.** The artifact contains runnable synthesis examples and example outputs, but figure-level reproduction scripts and exact experiment harnesses were not clearly found in the checked README. I inspected the artifact through public GitHub pages/raw files; I did not execute the workflow locally.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Yes** | README documents ONNX input and preconverted JSON model input. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN)) |
| Intermediate representation serialized | **Partial** | IR DAG is described in the paper and implemented internally; public serialized outputs are architecture/config JSON rather than a standalone DAG schema. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Mapping decisions inspectable | **Yes / Partial** | Final duplication, macro count, macro sharing, macro size, and component counts are visible in output JSON; intermediate candidates/populations are less clearly exposed. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/output/alexnet.json)) |
| Schedule inspectable | **Partial** | Paper defines the DAG and dependencies; artifact code constructs timing/dependency state, but the final schedule is not clearly documented as a standalone exported trace. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Hardware config explicit | **Yes** | `config.json` exposes precision, bandwidth, NoC power, SA/EA settings, ReRAM, memory, ADC, DAC, and ALU component parameters. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/config.json)) |
| Precision / bit-slice assumptions explicit | **Partial** | Weight/data precision and DAC/ReRAM resolutions are explicit; bit significance is used for scheduling but not as a rich type system. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Cost model inspectable | **Partial** | Key formulas are in the paper; artifact config exposes parameters. Full simulator calibration and all experiment scripts are less clear from checked sources. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Simulator backend documented | **Partial** | Paper states use of a cycle-accurate IR-based behavior-level simulator; companion PIMSIM-NN is documented separately. ([arXiv](https://arxiv.org/pdf/2402.18114)) |
| Generated code / instruction stream inspectable | **N/A / downstream** | PIMSYN-NN emits architecture/PIMCOMP config; PIMCOMP-NN is the companion that emits instruction streams. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain)) |
| Provenance from source op to backend action | **Partial** | Model JSON preserves layer names, providers, consumers, dimensions, and op parameters; output JSON maps many layer names to allocation decisions. ([GitHub](https://raw.githubusercontent.com/lixixi-jook/PIMSYN-NN/main/models/JSON/alexnet.json)) |
| Reproduction scripts available | **Partial** | README provides commands for AlexNet/ResNet18-style runs; no dedicated release or full figure-reproduction scripts found in checked README. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN)) |
| Calibration source documented | **Partial** | Paper lists key parameters and cites ISAAC/MNSIM for others; config records concrete values. ([arXiv](https://arxiv.org/pdf/2402.18114)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible through the ONNX-to-JSON frontend inherited from PIMCOMP-NN. It is most useful for CNN-like ONNX graphs with supported operators and known dimensions. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))  
- **As IR inspiration:** The IR-node list—MVM, ADC, ALU, load, store, merge, transfer—and dependence taxonomy are useful for a CIM scheduling IR. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **As mapper/scheduler:** The `WtDup` SA filter, macro-partition EA, macro-sharing rule, and component-allocation heuristic could be adapted as mapper passes. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **As cost model:** Eq. 1–6 and `config.json` provide a starting point for crossbar count, duplication feasibility, access-balance ranking, and peripheral allocation under a power budget. ([arXiv](https://arxiv.org/pdf/2402.18114))  
- **As backend:** PIMSYN-NN itself is best wrapped as an architecture synthesizer; executable instruction-stream generation is better routed through PIMCOMP-NN and simulation through PIMSIM-NN. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))  
- **As benchmark:** The artifact includes preconverted JSON models for AlexNet, VGG13, VGG16, MSRA-A, and ResNet18, and output examples for AlexNet/ResNet18. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN/tree/main/models/JSON))  
- **As validation source:** The paper’s validation is simulator-backed, with parameters partly from ISAAC and MNSIM. It is useful for architectural cost-model comparison, while chip/RTL/SPICE calibration would need separate sources. ([arXiv](https://arxiv.org/pdf/2402.18114))  

**Integration effort estimate: Medium.** Integration would be most direct through the JSON boundaries: model JSON in, `config.json` hardware parameters, architecture JSON out, and PIMCOMP config out. Reuse as a formal compiler IR would require an adapter that exports the internal DAG, records dependency/resource provenance, and normalizes component parameters into a backend-plugin schema. The most valuable reusable boundary appears to be the mapper/scheduler plus cost-model layer rather than a complete replacement for a general CIM compiler frontend or ISA backend.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PIMCOMP-NN** | Crossbar-based PIM DNN compilation, mapping, scheduling, and instruction generation | PIMCOMP-NN is the downstream compiler that emits instruction flow; PIMSYN-NN is the architecture synthesizer that emits architecture/configuration choices. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) | Separate “architecture synthesis IR” from “instruction compiler IR” when classifying this toolchain. |
| **PIMSIM-NN** | PIM accelerator simulation with architecture configuration and instruction inputs | PIMSIM-NN consumes instruction sequences and architecture configuration to report latency/throughput/power/energy; PIMSYN-NN searches architecture and dataflow choices. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) | Treat simulator input contracts as part of the backend boundary, not as the same object as PIMSYN’s internal DAG. |
| **Gibbon** | Model/architecture co-exploration for PIM neural accelerators | PIMSYN-NN does not perform model exploration in the Gibbon comparison; it takes trained Gibbon CNNs as inputs and searches architecture/dataflow choices. ([arXiv](https://arxiv.org/pdf/2402.18114)) | Distinguish neural architecture/model search from CIM mapping and hardware-resource synthesis. |
| **NACIM / device-circuit-architecture co-exploration** | Crossbar size, ReRAM resolution, DAC resolution, and architecture exploration | PIMSYN-NN’s Table I emphasizes additional variables such as `RatioRram`, `WtDup`, and `CompAlloc`. ([arXiv](https://arxiv.org/pdf/2402.18114)) | Corpus tags should record which CIM objects are first-class search variables, not just whether DSE exists. |
| **PIM-HLS** | Automatic hardware generation for PIM neural accelerators | The paper positions PIM-HLS as focused on heterogeneous SRAM/ReRAM memory distribution, while PIMSYN-NN targets homogeneous crossbar-based PIM CNN accelerator synthesis. ([arXiv](https://arxiv.org/html/2402.18114v1)) | HLS-style generation and mapping-oriented architecture synthesis should be separated in Axis A. |
| **AutoDCIM** | Automated CIM generation | The paper positions AutoDCIM as circuit/layout-level template generation for digital PIM, while PIMSYN-NN is architecture/dataflow DSE for crossbar-based CNN accelerators. ([arXiv](https://arxiv.org/html/2402.18114v1)) | Technology/circuit generators and compiler/mapping stacks can share “CIM synthesis” vocabulary but expose different rewrite objects. |

## 10. Corpus-ready final takeaway

- PIMSYN-NN is best classified as an **A3 mapping/scheduling/DSE framework** with a narrow end-to-end CNN-to-PIM-architecture synthesis path.  
- Its strongest reusable layer is the joint search over `WtDup`, crossbar/ReRAM/DAC parameters, macro partitioning, macro sharing, and peripheral component allocation.  
- The paper’s IR contribution is an **IR-based dataflow DAG** with MVM, ADC, ALU, load, store, merge, and transfer nodes, used primarily for scheduling and performance estimation.  
- First-class CIM objects include crossbar sets, weight duplication, macro/PE/crossbar hierarchy, ADC/DAC resolution, macro sharing, and component allocation.  
- The hidden IR is distributed across the DAG, search-state variables, latency/power config tables, and output architecture JSON.  
- Artifact status: **public artifact found** under Apache-2.0; the artifact includes Python code, configs, model JSONs, and output examples, while full paper-figure reproduction scripts are not clearly exposed in the checked README.  
- Integration is most direct through JSON adapters and mapper/cost-model reuse, with PIMCOMP-NN/PIMSIM-NN serving as downstream compiler/simulator companions.  
- For a value-trajectory CIM IR, PIMSYN-NN provides useful path-stage and resource-binding ingredients, but trajectory-level semantics would add explicit value identity, domain, precision stage, bit significance, and reconstruction/reduction state.
