---
slug: pim-hls
title: "PIM-HLS: An Automatic Hardware Generation Tool for Heterogeneous Processing-In-Memory-based Neural Network Accelerators"
subtitle: "Scoped CIM stack note"
year: 2023
venue: "DAC 2023"
authors_or_group: "Yu Zhu, Zhenhua Zhu, Guohao Dai, Fengbin Tu, Hanbo Sun, Kwang-Ting Cheng, Huazhong Yang, Yu Wang"
summary: >-
  **PIM-HLS** is a DAC 2023 tool paper that frames heterogeneous SRAM/RRAM PIM accelerator generation as an area-constrained mapping, scheduling, and hardware-parameter optimization problem for CNN inference. Its clearest contribution is not a general-purpose CIM compiler IR, but a hardware-aware optimization flow: a manually written NN description is parsed into a DFG, MNSIM-derived latency/area choices are used to rank SRAM/RRAM and array/interface options, layers are grouped and remapped under area constraints, bottleneck layers can be split or duplicated, and Verilog-style hardware templates plus module-level control/instruction information are generated. The demonstrated scope is static VGG-8 and ResNet-18 CNN inference over simulated SRAM/RRAM PIM configurations, with the most reusable compiler insight lying in the mapping state: layer groups, device binding, tile-set allocation, weight remapping cost, and area/latency-driven hardware choice. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
links:
  paper: https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf
  artifact: https://github.com/Hazuyuki/PIM-HLS
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "RRAM-CIM"
  - "analog-CIM"
  - "digital-CIM"
  - "heterogeneous"
workloads:
  - "VGG-8 CNN inference"
  - "ResNet-18 CNN inference"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A2]
axis_B: [B2, B4, B1, B5]
axis_C_first_class_objects:
  - "DFG_node"
  - "layer"
  - "layer_group"
  - "SRAM_or_RRAM_binding"
  - "tile"
  - "tile_set"
  - "crossbar_size"
  - "ADC_DAC_choice_and_count"
  - "area_latency_choice"
  - "weight_split_factor"
  - "duplicated_bottleneck_layer"
  - "MNSIM_hardware_config"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "runtime_weight_schedule"
  - "layer_grouping"
  - "array_binding"
  - "device_mode_selection"
  - "hardware_parameter_choice"
  - "HDL_template_instantiation"
artifact:
  status: "public artifact found; partial"
  url: "https://github.com/Hazuyuki/PIM-HLS"
  license: "Unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
reproducibility_level: low
notes:
  - "Best understood as a mapping/scheduling and hardware-DSE flow rather than a general CIM compiler IR."
  - "The effective IR is distributed across simple NN .ir files, DFG/search state, MNSIM choice tables, config generation, and Verilog templates."
  - "Useful for value-trajectory IR work as evidence for resource metadata and analog/digital transition parameters, especially ADC/DAC and Sub_Position fields."
takeaways: []
---

# PIM-HLS — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with **A5 narrow end-to-end co-design** | The strongest evidenced layer is the optimizer that assigns PIM implementation choices, groups layers under area constraints, schedules/remaps weights, and tunes tile-level hardware parameters. The paper also presents an end-to-end flow from NN description to HDL/instructions, but the demonstrated public boundary is most concrete around mapping, scheduling, cost tables, and generated templates. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B1 Config-as-IR** | The input is a manually written NN description with tensor declarations and operator lines; the preprocessing step builds a DFG. Hardware choices are represented through device/config parameters, latency/area tables, tile sets, layer groups, and MNSIM-style configuration files rather than through a general compiler IR. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
| First-class CIM objects, Axis C | Layer, DFG node, layer group, PIM implementation choice, tile/tile set, crossbar size, ADC/DAC count, device type, area/latency choice, weight split/duplication factor | These are named directly in the paper’s optimization flow and/or artifact scripts. The artifact exposes `DFG_Node`, `Hardware_Config`, device descriptors for SRAM/RRAM, ADC/DAC fields, and MNSIM-style config generation. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/DFG.py)) |
| Rewrite object, Axis D | **Mapping / scheduling / hardware binding / hardware parameter choice** | PIM-HLS rewrites the layer graph into ordered layer groups, chooses SRAM/RRAM per layer, splits oversized layers, duplicates bottleneck layers, maps layer groups to tile resources, and adjusts array/interface parameters. It does not primarily rewrite tensor algebra, loop nests, or a portable instruction IR. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
| Best corpus tags | `compiler-mapping`, `hardware-DSE`, `heterogeneous-CIM`, `SRAM-CIM`, `RRAM-CIM`, `CNN-inference`, `MNSIM-backed`, `weight-scheduling`, `HDL-generation`, `config-as-IR` | Tags reflect the evidenced stack boundary: static CNN workloads, SRAM/RRAM PIM choices, area-constrained weight remapping, MNSIM-derived latency/area evaluation, and HDL/config generation. |
| Closest comparison baselines | MNSIM, DNN+NeuroSim, Gibbon, PIMSYN, DeepBurning / AutoDNNchip | MNSIM and NeuroSim are simulator/cost-model baselines; Gibbon is a PIM DSE/co-exploration baseline; PIMSYN is a later CNN-to-PIM synthesis flow; DeepBurning and AutoDNNchip are HLS-style NN accelerator generation references. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |

## 2. One-paragraph public summary

**PIM-HLS** is a DAC 2023 tool paper that frames heterogeneous SRAM/RRAM PIM accelerator generation as an area-constrained mapping, scheduling, and hardware-parameter optimization problem for CNN inference. Its clearest contribution is not a general-purpose CIM compiler IR, but a hardware-aware optimization flow: a manually written NN description is parsed into a DFG, MNSIM-derived latency/area choices are used to rank SRAM/RRAM and array/interface options, layers are grouped and remapped under area constraints, bottleneck layers can be split or duplicated, and Verilog-style hardware templates plus module-level control/instruction information are generated. The demonstrated scope is static VGG-8 and ResNet-18 CNN inference over simulated SRAM/RRAM PIM configurations, with the most reusable compiler insight lying in the mapping state: layer groups, device binding, tile-set allocation, weight remapping cost, and area/latency-driven hardware choice. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Heterogeneous PIM with multiple implementation approaches can improve performance under severe area constraints. | Abstract, Introduction, Section IV-A, Figures 1, 3, 5, 6 | Experiment + cost-model-backed DSE | The paper compares SRAM-PIM, RRAM-PIM, and heterogeneous choices on VGG-8 and ResNet-18 using MNSIM-derived latency/area data. It reports heterogeneous designs with both SRAM and RRAM and discusses density/performance tradeoffs. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Demonstrated for simulated CNN inference over two networks and two memory technologies; broader technology sets and non-CNN workloads are paper-level future/reuse directions. |
| PIM implementation approach selection can be reduced by criteria-based sorting. | Section IV-A, Eq. 1, Figure 3 | Equation + experiment | The paper defines `Ri = a` as assigning PIM implementation approach `a` to layer `i`, uses criteria for memory, computation, and memory/computation ratio, and gives a monotonic ordering condition that assigns denser PIM choices to more memory-consuming layers. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | The paper-level evidence supports candidate pruning and Pareto-frontier quality for VGG-8/ResNet-18-like CNNs; a reusable API for arbitrary criteria is not documented in the artifact. |
| Runtime weight scheduling and mapping can be formulated and solved in polynomial time. | Abstract, contributions, Section IV-B, Eq. 2, Algorithm 1 | Equation + algorithm | The paper defines layer groups, uses topological sorting, splits oversized layers, duplicates bottleneck layers, and uses a DP recurrence `Lat_{i+1} = min_p(Lat_p + F(p+1,i+1))` to choose layer group boundaries. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Demonstrated for ordered static NN graphs where layer execution can be grouped sequentially; the DP formulation assumes layer-group boundaries and a latency function `F` supplied by the mapping/cost model. |
| Hardware parameters can be optimized at tile granularity after scheduling. | Overview and Section IV-C | Algorithmic procedure + experiment | PIM-HLS treats tiles as the minimum optimization granularity, adjusts array size and interface numbers, sorts layers by compute capability, divides tiles into tile sets, and optimizes bottleneck tile sets. The paper reports average 3.5% latency-estimation error versus MNSIM for its pipeline assumption. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | The reusable boundary is clearest at tile-set and bottleneck-layer parameter selection; detailed pass ordering and serialized intermediate states are partly embedded in scripts and cost tables. |
| PIM-HLS automatically generates HDL code and module instructions. | Abstract, Introduction, Overview, contribution list | Paper-only + partial artifact | The paper states that HDL and instructions are generated from scheduling results and hardware templates. The GitHub repository contains Verilog files and Python generation scripts, including a code generator that emits `Crossbar` instances and control wires. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Artifact-level confirmation is partial: the repository exposes scripts/templates and example IR files, but no README, packaged workflow, released benchmark outputs, or complete dependency bundle was found in the checked top-level repository. |
| The evaluation achieves average 5.9× speedup with 72.8% less area versus state-of-the-art PIM designs. | Abstract, contribution list, Section V, conclusion | Experiment | The paper reports latency comparisons against SRAM/RRAM PIM baselines under 16 mm² and 40 mm² constraints and gives the headline average improvement. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Evaluated through simulator-backed experiments; the artifact does not expose an end-to-end reproduction script for the published figures in the checked sources. |
| PIM-HLS can support other CNN models. | Section V-A | Paper-only | The evaluation uses VGG-8 and ResNet-18 and states the tool can also be used for other CNN models. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Demonstrated examples are VGG-8 and ResNet-18; evidence for arbitrary CNN import depends on manually preparing the repository’s simple `.ir` format. |

## 4. Stack anatomy

```text
Input / frontend:
  Object: NN description file, represented publicly by vgg8.ir and resnet.ir.
  Type: simple graph/config text, with int8 tensor declarations and operator assignments such as conv, relu, maxpool, bn, add, avgpool, fc.
  Serialization/reuse: serialized and inspectable; documented mainly by examples and parser behavior, not by a standalone schema.
```

The paper says the preprocessing stage takes an NN description file containing layer information and input/activation tensor dimensions, then builds a DFG. The artifact’s `.ir` files show a compact typed tensor/operator format, for example VGG-8 tensor declarations and operator lines from `I1 = conv(W1, I0)` through `I20 = fc(W8, I19)`. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

```text
Middle representation:
  Object: DFG and per-layer metadata.
  Type: graph nodes plus tensor table; artifact class DFG_Node carries type, name, input list, output, next/prev edges, param count, FLOPs, and config dictionary.
  Serialization/reuse: DFG is built in Python memory; the source graph is serialized, but the derived DFG state is not exposed as a stable IR file.
```

The parser splits lines into tensor declarations and operator messages, builds data tables, computes parameters/FLOPs for conv/fc layers, and topologically queues nodes during code generation. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/DFG.py))

```text
Mapping or scheduling state:
  Object: layer groups, split factors, duplicated bottleneck layers, device list, layer-to-device configuration list, area table, latency table, tile-set points.
  Type: algorithmic/search state in Python and paper pseudocode.
  Serialization/reuse: partly inspectable in code; final Pareto lists are pickled, but the mapping state is not presented as a documented exchange format.
```

The paper’s Algorithm 1 outputs layer groups and includes topological sort, area-based splitting, duplication, and DP boundary selection. The artifact’s `assign.py` defines `Hardware_Config`, `dfs_state`, `calc_latency`, `gene_area`, `param_opt`, and `dfs`, exposing the search state and cost aggregation as Python objects. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

```text
Hardware abstraction:
  Object: SRAM/RRAM device descriptors, crossbar size, group number, DAC/ADC choices and counts, PIM type, polarity, subtraction position, tile parameters, buffer/LUT/NoC configuration.
  Type: MNSIM-style config-as-IR plus internal latency/area choices.
  Serialization/reuse: config_gene.py serializes simulator configuration files; several fields are explicit, while calibration and generated choice tables are partly external.
```

The artifact’s `Device` class names SRAM and RRAM parameters, including technology node, device area, read/write latency, device precision, resistance values, and ADC/DAC choice. The generated config file writes crossbar, interface, PE, digital-module, tile, architecture, and algorithm sections. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py))

```text
Backend / simulator / codegen:
  Object: MNSIM evaluation, Verilog templates, generated Crossbar instances, module-level control/instruction signals.
  Type: simulator-backed cost model plus HDL generation.
  Serialization/reuse: MNSIM config files and Verilog are inspectable; the full end-to-end generation workflow is not packaged as a documented CLI in the checked artifact.
```

The paper states that MNSIM supplies layer-wise latency/area evaluations across implementation approaches, array sizes, and interface numbers, and that the generation stage emits instructions and HDL from predefined templates. The artifact includes Python code that writes Verilog `define`s and `Crossbar` module instances. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

```text
Output artifact:
  Object: optimized HDL code, per-module instructions/control flow, simulator configs, Pareto/cost outputs.
  Type: Verilog-style HDL, pickled Pareto data, MNSIM ini-like config.
  Serialization/reuse: partially serialized; reproducible figure data and a one-command workflow were not found in the checked sources.
```

The repository lists Python scripts, `.ir` network descriptions, and Verilog files such as `NoC.v`, `res18.v`, and `res_top.v`; the repository page also shows no releases. ([GitHub](https://github.com/Hazuyuki/PIM-HLS))

```text
Evaluation loop:
  Object: MNSIM-generated latency/area tables, candidate PIM choices, area constraints, latency/throughput comparisons.
  Type: simulator-backed DSE loop.
  Serialization/reuse: described in the paper and partly visible in code through `choices_{network}.out`; the choice-output files themselves were not found in the visible top-level repo listing.
```

The paper evaluates SRAM/RRAM and heterogeneous designs on VGG-8 and ResNet-18 using MNSIM and reports results under 16 mm² and 40 mm² constraints. The artifact’s scheduler loads `choices_{network}.out`, indicating that MNSIM-derived choice tables are an external prerequisite for the search script. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the simple NN `.ir` graph, the derived DFG, the MNSIM latency/area choice table, the layer-group schedule, the SRAM/RRAM binding list, split/duplication factors, and tile-level hardware configuration. The paper foregrounds an HLS-style pipeline, while the reusable semantics are most visible in the mapping and cost-model state: layer demand metrics, implementation choices, area-constrained layer groups, bottleneck tile sets, and simulator configuration fields. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
PIM-HLS’s most evidenced stack slice starts after a static NN graph is available and ends at an optimized mapping/schedule plus hardware configuration. Its core transformations are layer-to-PIM-technology assignment, layer grouping under area limits, runtime weight remapping schedule, split/duplication decisions, and tile-level hardware-parameter search. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

**Secondary: A5 Narrow end-to-end co-design.**  
The paper presents an end-to-end path from NN description to HDL and instructions, but it is narrow in workload and backend scope: static CNN inference, SRAM/RRAM PIM choices, MNSIM-like architecture, and pseudo PIM arrays made of register files plus delay-configurable MAC units for cycle-accurate simulation/verification. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

**Adjacent but not primary: A2 Simulator & cost model.**  
PIM-HLS relies heavily on MNSIM for layer-wise latency/area evaluation, but it is not itself primarily a simulator paper. The simulator interface functions as the cost-model backend for DSE. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is the DFG built from a simple NN description. Decisions made at this level include dependency ordering and layer metadata extraction. The artifact’s DFG node structure carries operator type, tensor names, graph edges, parameter counts, FLOPs, and a config dictionary. A single stable graph-IR serialization beyond the input `.ir` examples was not found in the checked sources. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

**B4 Hardware-resource IR.**  
The strongest internal representation is hardware-resource state: tile sets, crossbar/array size, row/column interface counts, SRAM/RRAM type, area/latency table, and bottleneck status. These decisions are made across scheduling and parameter optimization, with legality driven by area constraints and latency ranking. Some choices remain embedded in Python search code and MNSIM-derived pickled choice files. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py))

**B1 Config-as-IR.**  
`config_gene.py` exposes a practical backend contract: device, crossbar, interface, PE, digital module, tile, architecture, and algorithm configuration fields. This is not a compiler IR in the MLIR/TVM sense, but it is the most concrete serialized boundary to the simulator/backend. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py))

**B5 Instruction / meta-op / ILA.**  
The paper claims module instructions are generated, and the overview figure includes an instruction generator. The public artifact most clearly exposes Verilog generation and control wires; an independently documented instruction schema was not found in the checked sources. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / backend object** | Crossbar size, subarray size, crossbar group count, PE count, tile count, and tile-level architecture fields are explicit in `config_gene.py`; the paper treats tile as the minimum hardware-optimization granularity. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py)) |
| Bit-slicing / bit significance | **Implicit / partially parameterized** | The artifact uses `w_prec = 8` and int8 tensor declarations, while device precision and weight polarity are config fields. Bit-slice placement and bit-significance propagation are not represented as a graph/type object in the checked sources. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/assign.py)) |
| ADC/DAC precision or sensing | **Parameter / costed** | ADC/DAC choices, areas, precision, power, sample rate, and counts are generated as simulator config fields; hardware-parameter optimization discusses high-precision ADC/DAC area overhead for analog RRAM-PIM. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py)) |
| Analog-to-digital or domain transition | **Parameter / implicit path semantics** | `PIM_Type` distinguishes analog and digital PIM, and `Sub_Position` states whether positive/negative crossbar subtraction occurs in analog or digital domain after ADC quantization. This is a useful parameter but not a value-flow IR object. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py)) |
| Peripheral circuits as path nodes | **Costed parameters** | ADC, DAC, adders, shift registers, registers, joint module, buffers, LUT, and bandwidth fields are config parameters, with area/power defaults or user-defined options. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py)) |
| Partial-sum accumulation path | **Implicit / template-level** | The paper’s architecture uses pseudo PIM arrays with register files and delay-configurable MAC units; the config exposes adders and shift registers, but partial-sum identity across stages is not a named middle object. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
| Reconstruction / shift-add tree | **Parameter / implicit** | Shift register fields and tile adder fields exist in the config, but reconstruction is not represented as a rewriteable IR node in the checked sources. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime weight schedule first-class; other dynamic state not applicable / not found** | Runtime weight scheduling, remapping, split, and duplication are central. KV cache, batching policy, masks, and sparsity are outside the demonstrated CNN-inference setting. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |
| Value trajectory / flow path | **Approximated by mapping and latency state** | The closest representation is the mapping of layers to tile sets and the domain-related config fields. The paper centers on layer/weight placement and cost, rather than preserving value identity through analog accumulation, sensing, reconstruction, and storage. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) |

### 5.4 Axis D — rewrite object

PIM-HLS rewrites **hardware mapping and schedule**. The transformed objects are layer-to-technology assignment, layer-group boundaries, tile-set allocation, split factors, duplication choices, crossbar/interface parameters, and generated Verilog/module-control structure.

Legal transformations include:

* assigning each layer to SRAM-PIM or RRAM-PIM according to memory/computation criteria;
* topologically ordering the DFG to preserve dependencies;
* splitting a layer when its area exceeds the constraint;
* duplicating the most time-consuming layer in a group while spare area remains;
* grouping adjacent/topologically ordered layers into runtime mapping groups;
* allocating hardware resources to tile sets;
* increasing hardware parameter choices when latency improves enough and area remains within budget. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The exploited equivalences are mostly **resource-performance equivalences** rather than algebraic equivalences: a layer can be split across multiple mappings, duplicated to reduce bottleneck latency, or assigned to a denser/slower versus faster/larger PIM implementation if the resulting latency/area tradeoff improves. The information that must be preserved across lowering is operator dependency order, tensor dimensions, layer parameter/FLOP demand, weight capacity requirement, device binding, tile-level area, per-choice latency, and remapping cost. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/DFG.py))

The representation is especially well suited to static CNN layer placement under area constraints. Expressing transformations such as operator fusion across reconstruction boundaries, ADC retiming, bit-sliced partial-sum forwarding across layers, or alternative analog/digital accumulation paths would likely require an additional abstraction for value trajectory, numeric stage, and domain transition.

## 6. Technical mechanism reading

### 6.1 Frontend and DFG construction

The paper’s frontend accepts an NN description file containing layer information and tensor dimensions. The public examples are simple `.ir` files: tensor declarations use `int8` plus shape vectors, and computations are operator assignments such as `I1 = conv(W1, I0)`, `I2 = relu(I1)`, `I5 = maxpool2x2(I4)`, and `I20 = fc(W8, I19)` for VGG-8. ResNet-18 adds `bn` and residual `add` nodes. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The parser constructs graph nodes by splitting declaration/operator lines, linking producer outputs to consumer inputs, and computing rough `param` and `flops` for convolution and fully connected layers. This gives the optimizer demand signals: parameter count for memory pressure and FLOPs for compute pressure. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/DFG.py))

### 6.2 Layer-to-PIM implementation selection

The first optimization stage chooses PIM implementation approaches per layer. The paper defines `Ri = a` as assigning approach `a` to layer `i`; for `L` layers and `K` implementation choices, exhaustive candidates scale as `O(K^L)`. The proposed criteria rank layers and implementation choices by memory density, computation capability, or the ratio between memory and computation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The memory criterion is formalized by sorting layers by memory consumption `Cl_i` and PIM approaches by memory density `Cr_a`, then selecting assignments satisfying a monotonic condition:

`(Cr_a - Cr_b)(Cl_i - Cl_j) >= 0`.

The intended effect is to bind higher-density memories to layers with larger memory demand. The paper reports that for ResNet-18 with SRAM/RRAM choices, candidate count falls from 262,144 to 18 under the proposed criteria, and Figure 3 compares criteria-generated candidates to brute force. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

### 6.3 Runtime weight scheduling and layer grouping

The scheduling problem starts from an edge-device constraint: the accelerator may not have enough area/capacity to store all network weights simultaneously, so layers must be mapped, computed, erased/rewritten, and remapped over time. The paper turns this into layer groups: a set of layers mapped simultaneously, with the next group mapped after the current group finishes. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The DP recurrence uses the observation that, after topological ordering, layer `L_{i+1}` can be assigned to the same group as `L_i` or the next group. The recurrence is:

`Lat_0 = 0`, and `Lat_{i+1} = min_{0 <= p <= i}(Lat_p + F(p+1, i+1))`.

Here `Lat_p` is the best latency for the prefix through layer `p`, and `F(a,b)` is the mapping/computation latency for a group containing layers `L_a ... L_b`. Algorithm 1 also splits layers whose area exceeds the constraint and duplicates the most time-consuming layer in a group until area is insufficient. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The artifact implements a related search state in `assign.py`: `calc_erase` computes remapping/write overhead using bandwidth/write parameters, `calc_latency` combines group bottleneck latency and erase overhead, and `dfs` enumerates grouping states before calling `param_opt`. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/assign.py))

### 6.4 Hardware-parameter optimization

After scheduling, PIM-HLS tunes tile-level parameters. The paper’s key abstraction is that tiles are the minimum hardware optimization granularity. It sorts layers by computing capability, partitions tiles into tile sets, and then optimizes the tile sets assigned to bottleneck layers. The optimization reduces search from `O(C^T)` to `O(CL)`, where `C` is the number of hardware choices, `T` the number of tiles, and `L` the number of layers. The paper reports average 3.5% latency-estimation error versus MNSIM for its pipeline assumption. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

In the artifact, `Hardware_Config` stores a configuration dictionary, latency table, area table, total latency, and total area. The `param_opt` routine allocates per-device constraints, computes split factors for oversized single-layer groups, builds `points`/`layer_table` structures for tile-set segments, initializes a hardware configuration, and greedily considers higher-choice hardware options when latency improves and area remains feasible. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/assign.py))

### 6.5 Cost model and simulator contract

PIM-HLS uses MNSIM as the layer-wise performance/area evaluator. The paper says MNSIM evaluates layers under different PIM approaches, array sizes, and interface numbers, with user-defined device-level hardware data used as fundamental data for optimization. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

The artifact’s `config_gene.py` shows the backend contract concretely. For SRAM and RRAM, it sets device technology, device type, device area, read/write latency, device levels, resistance states, and ADC/DAC choices. It then writes crossbar size, cell type, ADC/DAC numbers, PIM type, polarity, analog/digital subtraction position, tile PE count, pooling units, tile adders, buffer settings, LUT settings, tile connection, tile number, and simulation-level options. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/config_gene.py))

The scheduler expects precomputed `choices_{network}.out` files, loaded by `pickle`, which indicates that MNSIM-generated or otherwise precomputed layer/hardware choices are a prerequisite to run the optimization path. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/assign.py))

### 6.6 Workload and precision assumptions

The demonstrated workloads are VGG-8 and ResNet-18 CNNs; the paper states that other CNN models can be used. The public `.ir` examples use `int8` tensors and weights, while the scheduler has a global `w_prec = 8`. Device precision appears as a hardware parameter in `Device.prec`, with SRAM set to 1 and RRAM set to 2 in the artifact. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The real IR boundary is the mapping state, not the NN syntax

- **Observation:** The `.ir` input is intentionally simple: typed tensors plus operator assignments. The distinctive semantics appear after parsing, when layer demand, area, latency choices, device binding, layer grouping, split/duplication, and tile-set allocation are combined.
- **Why it matters for CIM compiler/IR work:** A future CIM IR can treat PIM-HLS as evidence that CIM compilation often needs a resource/schedule IR between tensor graph IR and backend config.
- **Reusable lesson:** Borrow the layer-group plus area/latency choice table as a middle-layer contract for PIM mapping passes.

### Insight 2 — Criteria-based technology selection is a useful “typed resource binding” pattern

- **Observation:** PIM-HLS does not simply search all SRAM/RRAM assignments; it ranks layer demand against memory-technology capability and uses monotonic criteria to prune candidates. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))
- **Why it matters for CIM compiler/IR work:** This suggests a type-like binding rule: layers carry memory/computation demand attributes, while hardware resources carry density/throughput attributes.
- **Reusable lesson:** A future IR could represent device binding as a constrained rewrite with preserved attributes, rather than as an opaque backend decision.

### Insight 3 — Weight scheduling is modeled as a first-class runtime remapping problem

- **Observation:** The paper’s DP groups layers because all weights may not fit on the accelerator at once, and remapping/erase/write cost becomes part of the latency model. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))
- **Why it matters for CIM compiler/IR work:** CIM compilers often focus on static placement; PIM-HLS shows that constrained edge accelerators need a representation for temporal residency of weights.
- **Reusable lesson:** Add weight-residency intervals, remap barriers, and rewrite/write-cost terms to a CIM scheduling IR.

### Insight 4 — Tile sets are a compact abstraction for heterogeneous hardware tuning

- **Observation:** Instead of treating every tile independently, PIM-HLS groups tiles into sets and tunes bottleneck sets. This provides a manageable search space while preserving layer-specific hardware differences. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))
- **Why it matters for CIM compiler/IR work:** Tile sets are a useful middle abstraction between individual macros and whole-accelerator configurations.
- **Reusable lesson:** Represent tile-set equivalence classes explicitly, with shared crossbar/interface parameters and per-layer binding.

### Insight 5 — The simulator config reveals the backend contract more clearly than the paper diagram

- **Observation:** The paper’s Figure 2 shows PIM simulator and hardware configurations at a high level; `config_gene.py` reveals concrete backend fields such as `DAC_Num`, `ADC_Num`, `PIM_Type`, `Sub_Position`, `Tile_Num`, and `Simulation_Level`. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))
- **Why it matters for CIM compiler/IR work:** Backend config files often function as the de facto ABI between compiler and simulator/hardware generator.
- **Reusable lesson:** Treat simulator config schemas as corpus evidence for what CIM objects a stack actually names and hands to the backend.

### Insight 6 — Precision is present as a parameter, but not yet as a propagated type discipline

- **Observation:** The examples use `int8`, the scheduler uses `w_prec = 8`, and device precision/ADC precision are config fields. ([GitHub](https://github.com/Hazuyuki/PIM-HLS/blob/main/vgg8.ir))
- **Why it matters for CIM compiler/IR work:** Precision influences density, ADC/DAC area, mapping capacity, and latency, but the checked sources do not expose a precision propagation or verification layer.
- **Reusable lesson:** A future IR could turn these scalar precision knobs into typed numeric-stage metadata that travels with tensors, partial sums, and reconstructed values.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL:** `https://github.com/Hazuyuki/PIM-HLS`
- **Official status:** The paper footnote points to this GitHub repository. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))
- **License:** Unknown / not found in the checked repository listing.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** A small public repository with Python scripts (`DFG.py`, `assign.py`, `config_gene.py`), example network descriptions (`vgg8.ir`, `resnet.ir`), and Verilog files/templates including `NoC.v`, `res18.v`, and `res_top.v`. The repository page reports 2 commits and no releases. ([GitHub](https://github.com/Hazuyuki/PIM-HLS))
- **What the artifact appears to omit:** A visible README/manual, release package, license file, figure-reproduction scripts, and the precomputed `choices_{network}.out` files referenced by `assign.py` were not found in the checked top-level listing. The repository page shows “No description” and no releases. ([GitHub](https://github.com/Hazuyuki/PIM-HLS))
- **Minimal command or workflow, if documented:** Unknown / not found in the checked sources. The scripts imply a workflow of preparing `.ir` files, producing MNSIM choice tables, running the assignment/optimization script, and using config/Verilog generation, but this workflow is inferred from code and paper structure rather than a documented command.
- **Whether paper figures appear reproducible from the artifact:** Partial / unknown. The paper’s experiments depend on MNSIM-derived latency/area evaluation and comparison baselines; the visible artifact exposes some scripts and examples but not a complete reproduction package for Figures 5–6. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Examples document the format by use; no standalone schema found. |
| Intermediate representation serialized | Partial | Source `.ir` is serialized; derived DFG/mapping state is in memory. |
| Mapping decisions inspectable | Partial | Search structures and Pareto output are visible in code; final mapping schema is not documented. |
| Schedule inspectable | Partial | Algorithm and Python state expose grouping/scheduling logic; serialized schedule format not found. |
| Hardware config explicit | Yes | MNSIM-style config generation is explicit. |
| Precision / bit-slice assumptions explicit | Partial | `int8`, `w_prec = 8`, device precision, ADC precision fields are visible; bit-slice semantics are not first-class. |
| Cost model inspectable | Partial | Latency/area aggregation and erase/write overhead are in code; MNSIM choice generation and calibration files are external/unclear. |
| Simulator backend documented | Partial | Paper names MNSIM and config fields are explicit; full backend workflow not packaged. |
| Generated code / instruction stream inspectable | Partial | Verilog generation and templates are visible; instruction schema is unclear. |
| Provenance from source op to backend action | Partial | DFG and generated module names preserve layer/weight names in places; full provenance table not found. |
| Reproduction scripts available | Partial | Scripts exist, but no end-to-end README/figure reproduction workflow found. |
| Calibration source documented | Partial | Paper cites SRAM/RRAM device sources and MNSIM; artifact embeds some parameters, but complete calibration provenance is not packaged. |

### 8.3 Integration helper

- **As frontend:** The parser and `.ir` examples can be reused as a lightweight CNN graph format, but integration would benefit from a converter from ONNX/PyTorch/MLIR into the simple tensor/operator syntax.
- **As IR inspiration:** The most valuable abstractions are DFG node metadata, layer demand attributes, layer groups, split factors, duplicated bottleneck layers, device binding, tile sets, and MNSIM choice tables.
- **As mapper/scheduler:** The DP layer-grouping idea and area-aware remapping cost are directly relevant to future CIM mappers, especially for edge devices with insufficient on-array weight capacity.
- **As cost model:** The layer-wise latency/area table, density/performance criteria, ADC/DAC area terms, and remapping/erase cost formulas can become backend plugins.
- **As backend:** The MNSIM config generator and Verilog templates could be wrapped, but a stable adapter would need to define required choice files, output schedule format, and generated instruction format.
- **As benchmark:** VGG-8 and ResNet-18 `.ir` files can serve as small static CNN mapping tests.
- **As validation source:** The work is simulator-backed; it does not provide chip-in-loop measurements or RTL-to-silicon calibration in the checked sources. MNSIM and cited SRAM/RRAM macro parameters are the calibration anchors. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf))

**Integration effort estimate: Medium to High.** Integration would be most direct through the config/cost-model boundary: generate PIM-HLS-style layer choices and feed them into a rewritten scheduler. Effort rises because the public artifact exposes useful scripts and examples but not a documented, packaged CLI or complete reproduction bundle. A small adapter should extract `.ir` parsing, choice-table schema, layer-group schedule, and hardware-config emission into explicit JSON/YAML or MLIR-like artifacts.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **MNSIM / MNSIM 2.0** | CIM/PIM performance, area, and system-level modeling | PIM-HLS uses MNSIM as a cost backend and adds layer scheduling, heterogeneous SRAM/RRAM selection, and HDL/template generation around it. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Classify MNSIM as A2 simulator/cost model; PIM-HLS as A3/A5 using simulator outputs as hidden IR/cost tables. |
| **DNN+NeuroSim V2.0** | End-to-end benchmarking of CIM accelerators for DNNs | NeuroSim emphasizes benchmarking across device/circuit/algorithm hierarchy and framework integration; PIM-HLS emphasizes area-constrained heterogeneous hardware generation and remapping schedule. ([arXiv](https://arxiv.org/abs/2003.06471?utm_source=chatgpt.com)) | Separate simulator/benchmark stacks from mapper/scheduler stacks, even when both evaluate DNNs on CIM hardware. |
| **Gibbon** | PIM-oriented design-space exploration | Gibbon co-explores NN model and PIM architecture using evolutionary search; PIM-HLS focuses on fixed NN graphs and layer-wise SRAM/RRAM binding, runtime weight scheduling, and tile parameter tuning. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Use Gibbon as a nearby DSE baseline but distinguish model-architecture co-search from compiler-style mapping/remapping. |
| **PIMSYN** | Automatic synthesis of PIM-based CNN accelerators | PIMSYN is a later full-stack CNN-to-PIM synthesis framework with ONNX input and workflow/hardware construction output; PIM-HLS is earlier and specifically stresses heterogeneous SRAM/RRAM choice and runtime weight scheduling under area constraints. ([arXiv](https://arxiv.org/abs/2402.18114?utm_source=chatgpt.com)) | Good comparison for A5 synthesis flows; note the frontend boundary difference between ONNX-like input and PIM-HLS’s manual `.ir`. |
| **DeepBurning / AutoDNNchip** | HLS-style NN accelerator generation | These are CMOS/FPGA/ASIC NN HLS references in the paper’s related work; PIM-HLS adapts the HLS idea to PIM-specific layer binding, remapping, and tile-level constraints. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Useful as non-CIM HLS contrast: their first-class objects are accelerator schedule/resources, but not PIM array residency and remapping. |
| **PRIME and SRAM/RRAM PIM accelerator baselines** | PIM accelerator architecture for neural networks | PIM-HLS uses homogeneous SRAM/RRAM PIM designs as baselines and seeks to generate heterogeneous designs under area limits. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/fab6156a-f133-4b35-929a-b0e65c7387ad.pdf)) | Treat architecture papers as hardware baselines; PIM-HLS belongs in the compiler/mapping corpus because it manipulates mappings and schedules over such hardware templates. |

## 10. Corpus-ready final takeaway

- PIM-HLS’s core contribution is an area-constrained mapping/scheduling/DSE flow for heterogeneous SRAM/RRAM PIM CNN accelerators.
- The strongest reusable stack layer is the mapping state: layer groups, SRAM/RRAM binding, split/duplication factors, tile-set allocation, and latency/area choice tables.
- The evidenced workload scope is static CNN inference on VGG-8 and ResNet-18, evaluated through MNSIM-backed experiments.
- First-class objects include layers, DFG nodes, PIM implementation choices, layer groups, tiles/tile sets, crossbar/interface parameters, ADC/DAC counts, and remapping cost.
- The hidden IR is distributed across the `.ir` graph, Python DFG/search state, MNSIM choice files, generated config files, and Verilog templates.
- Artifact status: public artifact found, but the checked repository appears partial: examples and scripts are visible, while license, README/workflow, releases, choice tables, and figure reproduction scripts were not found.
- Integration is most promising through a wrapper around the scheduler/cost-model boundary, rather than by adopting the frontend as a general compiler IR.
- For value-trajectory IR work, PIM-HLS is useful as evidence for resource and domain-transition metadata, but trajectory rewrites would need additional first-class value-flow, numeric-stage, and reconstruction abstractions.
