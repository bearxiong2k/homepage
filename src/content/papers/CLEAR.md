---
slug: clear
title: "CLEAR: a full-stack chip-in-loop emulator for analog RRAM based computing-in-memory system"
subtitle: "Scoped CIM stack note"
year: 2023
venue: "Science China Information Sciences 66(12):229402"
authors_or_group: "Ruihua Yu, Wenqiang Zhang, Bin Gao, Yiwen Geng, Peng Yao, Yuyi Liu, Qingtian Zhang, Jianshi Tang, Dong Wu, Hu He, Ning Deng, He Qian, Huaqiang Wu; Tsinghua University"
summary: >-
  CLEAR is a chip-in-loop stack for analog RRAM computing-in-memory that connects chip-aware DNN training, a compiler, an “emulation-oriented IR,” and a calibrated emulator capable of switching parts of execution between a real chip and an analog computing model. Its most distinctive compiler/IR contribution is the use of backend addresses as part of the model representation: a layer can be mapped to a concrete chip/tile/XB coordinate and weight rectangle, or marked virtual for simulator/off-hardware execution. The demonstrated compiler scope is DNN-centric: ONNX-style neural-network graphs are optimized through operator fusion/splitting and critical-path resource reallocation, then evaluated on VGG/ResNet-style inference workloads and prior RRAM chip settings. For CIM compiler/IR research, CLEAR is most useful as an example of a hardware-addressed graph IR coupled tightly to calibration and chip-in-loop backend selection. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))
links:
  paper: https://link.springer.com/article/10.1007/s11432-022-3756-3
  artifact: https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
workloads:
  - "VGG11"
  - "ResNet18"
  - "ResNet34"
  - "ResNet50"
  - "CIFAR-10 ResNet34 inference"
  - "MNIST two-layer FC / five-layer CNN calibration cases"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A2, A3, A4, A6]
axis_B: [B2, B4, B6, B5]
axis_C_first_class_objects:
  - "chip/tile/XB address"
  - "XB weight rectangle [Sx,Sy,Ex,Ey]"
  - "real-chip address"
  - "virtual backend address"
  - "VMM"
  - "Add"
  - "Activation"
  - "Pooling"
  - "Flatten"
  - "Dispatch"
  - "Merge"
  - "ADC/DAC/shift-add path in backend model"
axis_D_rewrite_objects:
  - "operator graph"
  - "layer fusion/splitting"
  - "Conv/MatMul-to-VMM decomposition"
  - "hardware mapping"
  - "array/XB resource allocation"
  - "backend address binding"
artifact:
  status: "public supplementary artifact found; no public runnable code artifact found"
  url: "https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf"
  license: "Unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Most reusable abstraction is the backend address field connecting graph nodes to real or virtual CIM execution."
  - "Compiler evidence centers on operator fusion/splitting and critical-path XB reallocation."
  - "Analog model exposes a useful value-path skeleton but does not present it as a rewriteable trajectory IR."
takeaways: []
---

# CLEAR — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — Narrow end-to-end co-design** | CLEAR presents a chip-aware training framework, compiler, and chip-in-loop emulator in one pipeline. The demonstrated stack is centered on analog RRAM CIM DNN execution rather than a general-purpose compiler framework. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| Secondary stack roles | **A2, A3, A4, A6** | A2: analog/circuit emulator with calibration. A3: placement/resource reallocation and scheduling. A4: named “emulation-oriented IR.” A6: chip-in-loop execution and real-chip calibration. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR; B4 Hardware-resource IR; B6 Accuracy/nonideality modeling; partial B5 instruction/meta-op** | The IR carries layer/operator information, node fusion/splitting relationships, precision, and backend addresses. Hardware resources are represented through chip/tile/XB coordinates and virtual addresses. The simulator models RRAM noise, IR drop, DAC/ADC behavior, and update noise. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| First-class CIM objects, Axis C | **XB/crossbar address, chip/tile/XB hierarchy, row/column weight region, real-vs-virtual backend address, VMM/Add/Activation/Pooling/Flatten/Dispatch/Merge ops, ADC/DAC/shift-add path in model** | The clearest named CIM object is the backend address: `Chip[x].Tile[y].XB[z].[Sx,Sy,Ex,Ey]`, plus `virtual` for operations outside the real hardware. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Rewrite object, Axis D | **Operator graph + hardware mapping/resource allocation + backend address binding** | CLEAR performs operator fusion/splitting, splits Conv/MatMul into VMM, inserts dispatch/merge-like structure, and reallocates XBs along the critical path to improve throughput. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Best corpus tags | `analog-CIM`, `RRAM-CIM`, `chip-in-loop`, `compiler-mapping`, `emulation-oriented-IR`, `ONNX`, `DNN-inference`, `nonideality-model`, `hardware-address-IR`, `calibrated-simulator` | Tags follow the paper’s stated stack boundary and the supplementary IR/compiler evidence. |
| Closest comparison baselines | **PUMAsim/PUMA, MNSIM/MNSIM2.0, NeuroSim/DNN+NeuroSim, prior Tsinghua RRAM chips** | The paper’s own comparison table positions CLEAR against PUMAsim, MNSIM/MNSIM2.0, and NeuroSim/DNN+NeuroSim on compilation optimization, hardware-system support, inference/training support, and on-chip verification. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |

## 2. One-paragraph public summary

CLEAR is a chip-in-loop stack for analog RRAM computing-in-memory that connects chip-aware DNN training, a compiler, an “emulation-oriented IR,” and a calibrated emulator capable of switching parts of execution between a real chip and an analog computing model. Its most distinctive compiler/IR contribution is the use of backend addresses as part of the model representation: a layer can be mapped to a concrete chip/tile/XB coordinate and weight rectangle, or marked virtual for simulator/off-hardware execution. The demonstrated compiler scope is DNN-centric: ONNX-style neural-network graphs are optimized through operator fusion/splitting and critical-path resource reallocation, then evaluated on VGG/ResNet-style inference workloads and prior RRAM chip settings. For CIM compiler/IR research, CLEAR is most useful as an example of a hardware-addressed graph IR coupled tightly to calibration and chip-in-loop backend selection. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CLEAR is a “full-stack chip-in-loop emulator” for analog RRAM CIM. | Title, introduction, architecture figure, conclusion | Paper-only + experiment | The paper describes a three-module flow: chip-aware training, compiler, and chip-in-loop emulator. Outputs include simulated/chip-in-loop accuracy, circuit metrics, and throughput. | The demonstrated scope is analog RRAM CIM for DNN models, with examples around CNN/ResNet-style networks and referred chip designs. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| CLEAR provides a general IR to unify real-chip and simulator execution. | Intro and compiler-design text; Appendix B | Documentation/paper-only IR schema | The named “emulation-oriented IR” stores layer metadata, precision, fusion/splitting relationships, and backend address fields. The address can select real hardware or virtual execution. | The reusable boundary is clearest at the address-bearing graph representation; no public standalone parser/schema/code artifact was found in the checked sources. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| The compiler optimizes model structure and deployment. | Compiler-design paragraph; Appendix A | Algorithm + pass description | The paper describes operator fusion/splitting, Conv/MatMul-to-VMM splitting, BatchNorm/Conv fusion, and critical-path resource reallocation across XBs. | Demonstrated for DNN layers expressible through the listed IR operations and the chip/tile/XB resource model. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| Critical-path reforming improves throughput. | Appendix A.2, Algorithm A1, Fig. D1 | Algorithm + experiment | Algorithm A1 initializes XB allocation, estimates layer time as `tdata + tXB`, repeatedly allocates extra XBs to the current bottleneck, and reports large throughput improvements, including 211x for ResNet18. | The experiment uses VGG11 and ResNet18/34/50 on ImageNet-style throughput simulation for a 128M RRAM chip configuration. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| The emulator models analog nonidealities and can be calibrated with real chips. | Analog model section; Appendix C/D | Equation + experiment | The model includes read/write noise, IR drop, DAC/ADC nonidealities, shift-add reconstruction, open/closed-loop conductance update models, and calibration against real-chip measurements. | The paper reports chip/emulator outcome errors as low as 0.17% for inference and 0.36% for training; independent reproduction would require public code/data or chip access. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| CLEAR supports array-, macro-, and system-level emulation. | Main Fig. 1 and analog-model paragraph | Paper-only + experiment setup | The main paper names array, macro, and system levels; the supplement lists referred chip specifications for a 4K array, 160K chip, 16K system, and 128M simulation architecture. | The paper-level evidence supports multi-level emulation over these RRAM settings; artifact-level confirmation would require runnable emulator implementation. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |

## 4. Stack anatomy

```text
Input / frontend:
  Optimized neural network model, shown as ONNX in Fig. 1, plus a representation of the CIM chip. The frontend includes model parsing, hardware analysis, and graph optimization. This is a graph/config input; the paper documents it in figures and prose, but a public serialized input schema was not found.

Middle representation:
  “Emulation-oriented IR.” It is a graph-like layer representation carrying operation type, attributes, parameters, input/output metadata, precision, node fusion/splitting relationships, and later backend address fields. It is inspectable at the paper-table level, but no public machine-readable IR file format was found. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

Mapping or scheduling state:
  Schedule, resource allocation, placement/routing, and critical-path XB reallocation. The most concrete mapping state is `X_l`, the number of XBs allocated to layer l, plus backend addresses for chip/tile/XB and row/column weight regions. Algorithm A1 documents the reallocation rule. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

Hardware abstraction:
  Three-level hardware address space: chip-level x, tile-level y, XB-level z, with `[Sx,Sy,Ex,Ey]` defining the rectangular weight region inside an XB. Some controller-level operations use fewer coordinates; unsupported or off-chip operations can be marked `virtual`. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

Backend / simulator / codegen:
  Backend selection is mediated by address: real-chip address or virtual address. Real-chip operations program weights into RRAM and execute on chip; virtual operations use the compact analog computing model. The paper states that real hardware layers own corresponding hardware instruction codes, but the instruction format itself is not publicly specified. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

Output artifact:
  Simulated and chip-in-loop accuracy, circuit metrics, throughput, and power/performance/area metrics. These are paper outputs and plotted results, not public generated files in the checked sources. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

Evaluation loop:
  Three case studies: dataflow optimization; analog computing verification; and model calibration. The workloads/settings include VGG11 and ResNet18/34/50 for ImageNet throughput simulation, ResNet34 on CIFAR-10 for chip-in-loop inference, and two-layer FC / five-layer CNN cases for chip calibration. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the emulation-oriented IR graph, backend address fields, resource-allocation variables, schedule/placement order, and analog-model parameters. The paper foregrounds a named IR, while the reusable semantics are most visible in the address grammar and the list of supported CIM-friendly operations. The backend contract is especially concrete: a layer is either mapped to a physical chip/tile/XB/row-column region or marked virtual, which determines whether it enters hardware instruction generation or simulator execution. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — Narrow end-to-end co-design.** CLEAR owns a vertical slice from chip-aware training through compiler mapping into chip-in-loop execution. The slice is defined by DNN model input, RRAM CIM chip representation, address-bearing IR, and emulator/real-chip backend selection. The “full-stack” claim is evidenced within this narrow RRAM-DNN loop rather than through broad frontend language support or backend portability. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

**Secondary: A2 — Simulator & cost model.** CLEAR includes an analog computing model for inference/training, array/macro/system emulation levels, and calibration against chip measurements. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

**Secondary: A3 — Mapping / scheduling / DSE framework.** The compiler performs resource allocation and critical-path reforming over XBs, plus schedule/placement/routing steps shown in the architecture. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

**Secondary: A4 — Explicit IR / dialect / ISA compiler stack.** The paper names an emulation-oriented IR and documents its operation/address table. The IR is explicit at the paper level, while public reuse would depend on recovering or reimplementing the schema. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

**Secondary: A6 — Programming / runtime / benchmark on real hardware.** Chip-in-loop execution and calibration are part of the evaluation loop, with real-chip measurements used to calibrate the analog model. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

### 5.2 Axis B — middle-layer style

**B2 — Graph-as-IR.**  
The named middle representation is the emulation-oriented IR graph. Decisions made there include operation type, operator decomposition/fusion state, tensor metadata, precision, and eventually backend address binding. Decisions such as exact instruction format, simulator internals, and calibration data flow remain mostly in backend prose/figures. No public single artifact was found that upstream passes could read, verify, and rewrite.

**B4 — Hardware-resource IR.**  
The address field makes hardware placement first-class: `Chip[x].Tile[y].XB[z].[Sx,Sy,Ex,Ey]` names physical resources and the mapped weight rectangle. This is the strongest compiler/IR feature in the paper because it exposes backend choice and resource binding as part of the representation. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

**B6 — Accuracy / nonideality modeling.**  
The analog computing model includes bit slicing, DAC, array computation, ADC quantization, shift-add, read/write noise, IR drop, and conductance-update equations. These semantics are modeled in the backend rather than typed through the IR. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

**Partial B5 — Instruction / meta-op / ILA.**  
The IR operation table names meta-ops such as VMM, Add, Activation, Pooling, Flatten, Dispatch, and Merge, and the paper states that real-hardware layers receive hardware instruction codes. The instruction stream itself is not exposed as a reusable public artifact in the checked sources. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class for mapping** | The IR address names chip/tile/XB coordinates; the emulator also describes array, macro, and system levels. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| Bit-slicing / bit significance | **Parameter/model-level** | Appendix C states that input data is sliced into multi single-bit vectors before DAC conversion. Bit significance is visible in the analog path, not as a type system. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| ADC/DAC precision or sensing | **Parameter/model-level** | Table D1 lists ADC/DAC bits and ADC count per array for simulation and referred chips; Appendix C models DAC/ADC nonidealities. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Analog-to-digital or domain transition | **Costed/modelled path** | Fig. C1/Appendix C describe digital input, DAC to analog, array current, ADC quantization, and digital shift-add. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Peripheral circuits as path nodes | **Model-level** | Appendix C separates device/array model and peripheral circuit model, with DAC, ADC, controller, voltage reference, write driver, and shift-add blocks. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Partial-sum accumulation path | **Partly first-class through Add/Merge and shift-add model** | Table B1 includes Add and Merge; Appendix C names shift-adder circuits after ADC output. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Reconstruction / shift-add tree | **Model-level / implicit structure** | The analog model states that output data is obtained with shift-adder circuits; no separate rewriteable reconstruction IR is documented. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable / implicit** | The demonstrated workloads are CNN/ResNet-style DNN inference/training cases; no LLM runtime-state abstraction is described in the checked sources. |
| Value trajectory / flow path | **Approximated** | The closest path representation is the analog computing model’s sequence: bit slicing → DAC → array → ADC → shift-add, plus graph-level Dispatch/Merge/Add. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |

### 5.4 Axis D — rewrite object

CLEAR rewrites the **operator graph** and **hardware mapping state**. The compiler fuses BatchNorm into Conv, splits Conv/MatMul into VMM operations, inserts/uses CIM-friendly operations such as Dispatch, Merge, Add, and reallocates XB resources along a critical path. It then lowers graph nodes by adding backend addresses, preserving operation type, tensor dimensions, precision, weights, input/output metadata, and placement. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

Legal transformations include equivalent operator fusion, hardware-instruction-driven layer combination/splitting, VMM decomposition, and critical-path resource replication/reallocation. The equivalences exploited are layer algebra equivalence, especially Conv-BatchNorm folding, and resource equivalence where additional XBs can reduce a layer’s effective bottleneck time. Information that must be preserved across lowering includes data dimensions, weight region, precision, fusion/splitting lineage, address, and backend selection.

The representation is especially well suited to layer-to-XB binding and chip-vs-virtual backend selection. Expressing cross-layer bit-slice lifetime, ADC retiming, reconstruction-tree rewrites, or analog partial-sum transport across operator boundaries would likely require an additional abstraction for value trajectory, domain stage, bit significance, and partial-sum identity.

## 6. Technical mechanism reading

### 6.1 Pipeline contract

CLEAR’s pipeline begins with a neural-network architecture/dataset and a representation of the CIM chip. The chip-aware training framework optimizes the network under quantization and weight-noise constraints; the compiler parses and optimizes the trained model according to operation constraints and available on-chip resources; the chip-in-loop emulator executes operations either virtually through the analog model or physically on RRAM hardware. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

### 6.2 Emulation-oriented IR

The IR carries frontend model metadata before deployment and backend addresses after deployment. Appendix B says the IR includes input/output/weight dimensions, precision, node fusion/splitting relationships, and an address attribute. Address `NONE` is used after parsing/optimization before backend allocation; after allocation, the address corresponds to actual hardware location. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

The address grammar is the most concrete part of the IR:

- VMM: `Chip[x].Tile[y].XB[z].[Sx,Sy,Ex,Ey]`
- Add: `Chip[x].Tile[y].Adder[z]` or `virtual`
- Activation: `Chip[x].Tile[y].Activation[z]` or `virtual`
- Pooling: `Chip[x].Tile[y].Pooling[z]` or `virtual`
- Flatten/Dispatch/Merge: `Chip[x].Controller[y]` or `virtual`

For Conv/FC-like operations, `[Sx,Sy,Ex,Ey]` gives the mapped weight rectangle inside the XB. The `virtual` address indicates execution outside the actual hardware, and the scheduling module shields such layers so that only real-hardware layers receive hardware instruction codes. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### 6.3 Compiler passes

Appendix A defines two compiler-optimization categories: node combination/splitting and critical-path reforming. Node combination/splitting is partly driven by the finest-grained scheduling instructions supported by hardware. Conv can be split into VMM operations; BatchNorm can be fused into Conv by changing Conv parameters, with the paper giving the fused weight expression as `w' = wβ / sqrt(var)`. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

Critical-path reforming reallocates spare XBs to the bottleneck layers on the longest path. For each layer, initial allocation is computed from weight shape and array size, `X_l^0 = (C_out × C_in × K × K)/(H × W)`. The initial execution time uses `T_l^0 = t_data + t_XB`. While resources remain, Algorithm A1 selects the layer maximizing `T_l X_l^0 / X_l`, then increments that layer’s XB allocation by its initial allocation. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### 6.4 Analog backend model

The analog model captures the value path through an XB: input data is sliced into single-bit vectors, converted to voltages by DACs, applied to the RRAM array, sensed/quantized by ADCs, and reconstructed through shift-add circuits. The inference model includes read/write noise and IR drop, written as `I_out = V_in F_Row (G_ori + N(G_ori)) F_Col`. The update model includes open-loop conductance dynamics with pulse count and switching-window parameters, and closed-loop update with Gaussian noise around the target conductance. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### 6.5 Evaluation scope

The experiments cover three cases: dataflow optimization, analog computing verification, and model calibration. The dataflow optimization case uses VGG11 and ResNet18/34/50 for ImageNet throughput simulation on a 128M RRAM-chip configuration with 256×256 arrays. The analog verification case compares native FP32 and chip-in-loop ResNet34 inference for CIFAR-10. The calibration case uses a 160K chip with a two-layer FC NN and a multi-chip system with a five-layer CNN for MNIST. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Backend address is the real IR boundary

- **Observation:** The address field is more than placement metadata; it selects whether a node runs on real hardware or through the analog model.
- **Why it matters for CIM compiler/IR work:** This turns backend choice into an IR-level attribute rather than an external runtime switch.
- **Reusable lesson:** Future CIM IRs can borrow the idea of typed backend addresses, but add validation rules for address legality, resource aliasing, and provenance. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### Insight 2 — `virtual` is a useful compatibility escape hatch

- **Observation:** Operations unsupported by the real chip can be marked virtual and shielded from hardware instruction generation.
- **Why it matters for CIM compiler/IR work:** This is a practical way to mix CIM execution with simulator/host execution while keeping one graph-level workflow.
- **Reusable lesson:** A portable CIM compiler could generalize `virtual` into explicit execution domains: CIM array, peripheral unit, digital controller, host, simulator, or calibration backend. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### Insight 3 — Critical-path reforming is a pipeline-balancing mapper

- **Observation:** The resource allocator is not a broad architecture search; it is a bottleneck-balancing rule over spare XBs on the critical path.
- **Why it matters for CIM compiler/IR work:** It shows how a simple mapping-state variable, `X_l`, can connect graph-level layer cost to physical array replication.
- **Reusable lesson:** Future mappers can separate legality allocation from throughput balancing: first map every layer once, then redistribute residual resources according to a bottleneck objective. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### Insight 4 — The analog model sketches a trajectory even though the IR centers on layers

- **Observation:** The backend model follows a clear value path: bit-slice, DAC, array current, ADC, shift-add.
- **Why it matters for CIM compiler/IR work:** This path contains exactly the objects a trajectory IR would want to name, but they currently live in the simulator model rather than the graph IR.
- **Reusable lesson:** A future IR could attach domain-stage and bit-significance annotations to VMM outputs and Add/Merge nodes, making reconstruction and conversion points rewriteable. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))

### Insight 5 — Chip-in-loop calibration is framed as backend substitution

- **Observation:** The same workflow can select a real-chip address or virtual address, enabling model calibration against on-chip results.
- **Why it matters for CIM compiler/IR work:** Calibration is not treated as a separate experiment script; it is presented as a backend pathway under the IR.
- **Reusable lesson:** CIM stacks can expose calibration hooks as backend plugins that consume the same mapped IR as simulation and codegen. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public supplementary artifact found; no public runnable compiler/simulator/code artifact found in the checked sources.**

- **Artifact identifier:** Springer supplementary PDF, “Appendixes A–E,” linked from the article page. ([Springer](https://link.springer.com/article/10.1007/s11432-022-3756-3))  
- **License:** Unknown / not found in the checked sources.  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** compiler optimization description, Algorithm A1, emulation-oriented IR table, analog computing model equations/figures, experimental setup/results, and comparison table. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf))  
- **What it appears to omit:** runnable source code, public IR files, parser/compiler implementation, simulator scripts, benchmark package, raw calibration data, and figure reproduction scripts.  
- **Minimal command or workflow:** Unknown / not found in the checked sources.  
- **Whether paper figures appear reproducible from the artifact:** Unknown. The figures and algorithms are documented, but no scripts or datasets were found that would regenerate them.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | ONNX is shown as the optimized model input, and chip representation is shown conceptually. No public schema found. |
| Intermediate representation serialized | Unknown | IR attributes are documented in Table B1, but no serialized example file found. |
| Mapping decisions inspectable | Partial | Address format and Algorithm A1 expose mapping state conceptually. |
| Schedule inspectable | Partial | Schedule/placement/routing are shown in figures; no schedule dump format found. |
| Hardware config explicit | Partial | Table D1 lists array size, ADC/DAC bits, ADC count, and capacity for simulation/referred chips. |
| Precision / bit-slice assumptions explicit | Partial | Precision appears in IR attributes; bit slicing and ADC/DAC bits are documented in the model/spec table. |
| Cost model inspectable | Partial | Critical-path timing uses `tdata + tXB`; analog model equations are given. |
| Simulator backend documented | Partial | Device/array/peripheral models are described, but no runnable backend found. |
| Generated code / instruction stream inspectable | Unknown | Hardware instruction codes are mentioned, but format is not exposed. |
| Provenance from source op to backend action | Partial | Fusion/splitting relationships and backend address fields give partial provenance. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | The paper describes chip-based calibration and reports errors, but raw calibration data/workflow scripts were not found. |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest at the ONNX-style DNN graph level. A future stack could import ONNX, then attach CLEAR-like CIM address fields after mapping.
- **As IR inspiration:** The most useful abstraction is the address-bearing graph node: operation type + tensor metadata + precision + fusion/splitting relation + physical-or-virtual backend address.
- **As mapper/scheduler:** Algorithm A1 can be adapted as a residual-resource pass for layer-pipeline CIM accelerators: allocate once for legality, then rebalance bottleneck layers with spare arrays.
- **As cost model:** The `tdata + tXB` timing split and the analog nonideality path can become backend plugins, especially for RRAM crossbar models.
- **As backend:** The simulator/codegen interface could be wrapped around a backend-address contract, but public reuse would require reimplementing the simulator and instruction interface.
- **As benchmark:** VGG11 and ResNet18/34/50 throughput simulation, ResNet34 CIFAR-10 chip-in-loop inference, and MNIST FC/CNN calibration cases are useful benchmark motifs.
- **As validation source:** The reported real-chip calibration path and measurement comparisons can guide calibration methodology for other analog CIM simulators.

**Integration effort estimate: High.** Integration would be most direct through a small adapter that reconstructs the emulation-oriented IR table and address grammar, then maps ONNX nodes to VMM/Add/Activation/Pooling/Flatten/Dispatch/Merge. The main effort is that no public runnable compiler, simulator, calibration package, or IR serialization was found, so reuse would primarily be conceptual unless the authors’ implementation becomes available.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PUMAsim / PUMA | Memristor/RRAM accelerator simulation and DNN inference support | CLEAR’s comparison emphasizes compiler optimization, hardware-system support, and on-chip verification as differentiators. | Classify PUMA-like work closer to simulator/architecture support unless the compiler-facing object is exposed. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| MNSIM / MNSIM2.0 | Memristor-based neuromorphic/CIM simulation | CLEAR positions MNSIM as behavior-model simulation without the same compilation optimization or unified hardware workflow. | Useful baseline for simulator/cost-model axis; less central to address-bearing IR. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| NeuroSim / DNN+NeuroSim | Circuit-level CIM modeling and DNN benchmarking | NeuroSim is close on circuit modeling and training support; CLEAR adds a chip-in-loop unified workflow and compiler optimization claim. | Good comparison for separating backend model strength from compiler/IR boundary. ([Springer](https://static-content.springer.com/esm/art%3A10.1007%2Fs11432-022-3756-3/MediaObjects/11432_2022_3756_MOESM1_ESM.pdf)) |
| Fully hardware-implemented memristor CNN | Real RRAM CIM neural-network execution | CLEAR uses such prior chip/system results as calibration/evaluation context rather than presenting a new standalone chip. | Useful validation source; classify by hardware demonstration vs compiler stack role. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |
| Array-level boosting RRAM CIM work | RRAM array accuracy and spatial allocation | CLEAR’s compiler resource allocation echoes array/resource-aware deployment, but wraps it in a compiler/emulator stack. | Helps distinguish circuit/device compensation from compiler-visible resource rewriting. ([SciEngine](https://cdn.sciengine.com/doi/pdf/761A2F2A63E7408AB2AE3B565114BDCC)) |

## 10. Corpus-ready final takeaway

- CLEAR’s real compiler/IR contribution is an address-bearing emulation-oriented graph representation that can direct a DNN layer to real RRAM hardware or virtual analog simulation.
- The strongest reusable stack layer is the backend contract: operation metadata plus chip/tile/XB/row-column address plus `virtual` fallback.
- The demonstrated scope is analog RRAM CIM for DNN workloads, with VGG/ResNet throughput simulation, ResNet34 CIFAR-10 chip-in-loop inference, and small FC/CNN calibration cases.
- First-class objects include VMM/Add/Activation/Pooling/Flatten/Dispatch/Merge operations, XB addresses, weight rectangles, precision attributes, and virtual-vs-real backend selection.
- The hidden IR is distributed across the IR table, address grammar, critical-path allocation state, schedule/placement pipeline, and analog simulator assumptions.
- Artifact status is partial: a public supplementary PDF exists, but no public runnable compiler/simulator/code artifact was found in the checked sources.
- Integration is most realistic as IR and mapper inspiration rather than direct software reuse.
- For value-trajectory IR research, CLEAR is valuable because its analog model exposes the missing trajectory path: bit slicing, DAC, array, ADC, and shift-add reconstruction.
