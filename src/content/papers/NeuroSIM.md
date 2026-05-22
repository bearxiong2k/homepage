---
slug: neurosim
title: "NeuroSIM / DNN+NeuroSim"
subtitle: "Scoped CIM stack note"
year: 2018
venue: "IEEE TCAD,IEDM"
authors_or_group: "Shimeng Yu group / NeuroSim authors"
summary: >-
  **NeuroSIM / DNN+NeuroSim** is best classified as a CIM **device–circuit–architecture simulator with a narrow DNN-to-CIM evaluation flow**. The original NeuroSim contribution is a C++ macro model that estimates area, latency, energy, leakage, and accuracy for SRAM and emerging-memory CIM designs using a bottom-up hierarchy of device, array, peripheral, and architecture models; DNN+NeuroSim then wraps this backend with PyTorch/TensorFlow or PyTorch workflows that extract network topology, weights, activations, and training traces, map them onto a fixed chip/tile/PE/synaptic-array organization, and report accuracy and hardware metrics. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) For CIM compiler/IR research, the work is most useful as a **backend contract and cost-model reference**: it exposes concrete CIM resources, precision fields, ADC/sensing assumptions, device nonidealities, and layer-wise hardware reports, while the reusable compiler boundary is mainly expressed through configuration files, traces, and C++ simulator interfaces rather than a standalone IR, ISA, or modular lowering pipeline. ([arXiv](https://arxiv.org/pdf/2003.06471))
links:
  paper: https://arxiv.org/pdf/2003.06471
  artifact: https://github.com/neurosim/NeuroSim
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "RRAM-CIM"
  - "PCM"
  - "FeFET"
  - "ECRAM"
  - "analog-CIM"
  - "digital-CIM"
  - "hybrid"
workloads:
  - "MLP/MNIST"
  - "VGG-8/CIFAR-10"
  - "ResNet/ImageNet-style inference"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A5, A3, A1]
axis_B: [B1, B4, B6, B2, B7]
axis_C_first_class_objects:
  - "chip/tile/PE/synaptic-array hierarchy"
  - "subarray dimensions"
  - "SRAM/eNVM/FeFET memory-cell parameters"
  - "conductance state"
  - "ADC/sensing precision"
  - "ADC sharing / muxing"
  - "buffers and H-tree interconnect"
  - "accumulation units and adder/shift-add structures"
  - "precision fields"
  - "activation/weight/error/gradient traces"
axis_D_rewrite_objects:
  - "hardware mapping"
  - "array binding"
  - "convolution-kernel-to-submatrix lowering"
  - "trace partitioning"
  - "weight duplication"
  - "numeric-format configuration"
  - "nonideality configuration"
  - "training operation flow"
artifact:
  status: "public artifact found"
  url: "https://github.com/neurosim/NeuroSim"
  license: "CC BY-NC 4.0"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
  - "frontend_partial"
reproducibility_level: medium
notes:
  - "Most reusable as a CIM backend/cost-model contract."
  - "Intermediate semantics are distributed across configs, traces, wrapper code, simulator state, and CSV reports."
  - "No standalone compiler IR, ISA, or instruction-stream artifact found in the checked sources."
  - "Useful source of CIM-specific Axis C objects for future value-trajectory IR design."
takeaways: []
---

# NeuroSIM / DNN+NeuroSim — scoped CIM stack note

I treat this corpus entry as the **NeuroSim family centered on the original NeuroSim circuit macro model and the DNN+NeuroSim inference/training wrappers**, because the public artifacts and papers form one connected stack: NeuroSim supplies the C++ device/circuit/chip model, while DNN+NeuroSim adds PyTorch/TensorFlow or PyTorch integration, traces, automatic mapping/floorplanning, and DNN-level accuracy/performance reporting. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Hybrid: A2 primary; A5 secondary; A3/A1 supporting** | The central reusable component is a **simulator and cost model** for CIM macros and chips: NeuroSim estimates area, latency, dynamic energy, leakage, and accuracy from device/circuit/architecture parameters. DNN+NeuroSim adds a bounded end-to-end DNN-to-CIM workflow, with automatic floorplanning/mapping into chip/tile/PE/synaptic-array hierarchy. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR; B6 Accuracy/nonideality modeling; partial B2 Graph-as-IR; partial B7 trace/runtime state** | The most inspectable middle state is the combination of PyTorch model topology, hardware parameters in `Param.cpp` / wrapper arguments, trace CSVs, and NeuroSim C++ data structures. The artifact exposes parameters for memory type, operation mode, ADC style, subarray size, cell precision, FeFET/eNVM device fields, batch size, and nonideality settings. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/Param.cpp)) |
| First-class CIM objects, Axis C | **Chip/tile/PE/synaptic array, subarray dimensions, SRAM/eNVM/FeFET cells, ADC / multilevel sensing, buffers, H-tree/interconnect, accumulation units, conductance states, precision fields, activity traces** | These objects are named in the papers and exposed in code/configs. The simulator hierarchy includes memory cells, array architecture, peripherals, and communication; DNN+NeuroSim maps traces through chip/tile/PE/synaptic-array levels. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) |
| Rewrite object, Axis D | **Hardware mapping, array binding, tensor-to-array lowering, trace partitioning, numeric-format / nonideality configuration** | The work rewrites DNN layer structure and traces into mapped array activity and hardware reports. V2.0’s mapping maps a K×K kernel into K×K submatrices/PEs and accumulates partial sums with adder trees; the wrapper partitions traces and assigns them to chip resources. ([arXiv](https://arxiv.org/pdf/2003.06471)) |
| Best corpus tags | `simulator`, `cost-model`, `config-as-IR`, `hardware-resource-IR`, `analog-CIM`, `SRAM-CIM`, `eNVM-CIM`, `DNN-inference`, `on-chip-training`, `trace-driven-evaluation`, `ADC-modeling`, `nonideality-modeling` | Tags reflect the public artifact boundary and the paper-evidenced workflow. |
| Closest comparison baselines | **MLP+NeuroSim / earlier NeuroSim; MNSIM; ISAAC; PRIME; PUMA; Timeloop/Accelergy** | MNSIM and NeuroSim are both CIM/PIM modeling platforms; ISAAC/PRIME are ReRAM/CIM accelerator baselines; PUMA is close because it adds an ISA/compiler layer for memristor crossbars; Timeloop/Accelergy is close as a mapping/cost-model stack, though not CIM-specific. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/publications/2020/GLSVLSI20_None.pdf?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

**NeuroSIM / DNN+NeuroSim** is best classified as a CIM **device–circuit–architecture simulator with a narrow DNN-to-CIM evaluation flow**. The original NeuroSim contribution is a C++ macro model that estimates area, latency, energy, leakage, and accuracy for SRAM and emerging-memory CIM designs using a bottom-up hierarchy of device, array, peripheral, and architecture models; DNN+NeuroSim then wraps this backend with PyTorch/TensorFlow or PyTorch workflows that extract network topology, weights, activations, and training traces, map them onto a fixed chip/tile/PE/synaptic-array organization, and report accuracy and hardware metrics. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) For CIM compiler/IR research, the work is most useful as a **backend contract and cost-model reference**: it exposes concrete CIM resources, precision fields, ADC/sensing assumptions, device nonidealities, and layer-wise hardware reports, while the reusable compiler boundary is mainly expressed through configuration files, traces, and C++ simulator interfaces rather than a standalone IR, ISA, or modular lowering pipeline. ([arXiv](https://arxiv.org/pdf/2003.06471))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Integrated device–circuit–algorithm framework for benchmarking CIM accelerators | NeuroSim abstract and DNN+NeuroSim abstracts | Equation; experiment; code/artifact | NeuroSim models device/circuit/architecture metrics; DNN+NeuroSim connects DNN wrappers to the C++ model and reports accuracy, area, latency, energy, leakage, throughput, and efficiency. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) | Demonstrated for simulator-backed CIM evaluation over MLP and CNN workloads, with strongest reuse at the backend model and trace/config interface. |
| Automatic algorithm-to-hardware mapping and chip floorplanning | DNN+NeuroSim framework section and Fig. 2 discussion | Algorithmic description; code/artifact; experiment | The wrapper reads network topology, performs automatic floorplanning, partitions traces, and assigns them to chip/tile/PE/synaptic-array resources. ([arXiv](https://arxiv.org/pdf/2003.06471)) | The paper-level evidence supports layer-to-hardware mapping and trace assignment; artifact-level semantics are embedded in wrapper/C++ flow rather than a separate mapping IR schema. |
| CNN inference support from VGG to ResNet and CIFAR to ImageNet | 2019 DNN+NeuroSim abstract and framework section | Experiment; documentation; code/artifact | The 2019 paper reports support for VGG and ResNet, CIFAR and ImageNet, with PyTorch/TensorFlow integration. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611)) | Demonstrated for static CNN inference and quantized models; general frontend reuse depends on adapting model definitions and trace extraction. |
| On-chip training support with nonideal-device modeling | V2.0 abstract and training architecture sections | Algorithmic description; equations; experiment; code/artifact | V2.0 models feed-forward, error calculation, weight-gradient calculation, and weight update, including nonlinearity/asymmetry and cycle/device variation. ([arXiv](https://arxiv.org/pdf/2003.06471)) | Demonstrated mainly around VGG-8/CIFAR-10 training workflow and simulator-backed sweeps; the reusable boundary is clearest at training traces, nonideality parameters, and hardware reports. |
| Versatile memory-device support | 2019 DNN+NeuroSim abstract; code parameters | Code/artifact; paper-only for some device-level cases | The paper names SRAM, RRAM, PCM, FeFET, and ECRAM; the artifact exposes memory-cell and device-parameter choices such as SRAM, RRAM, FeFET, Ron/Roff, conductance levels, and FeFET polarization fields. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611)) | Device support is best read as model-parameter support inside NeuroSim; validity depends on the chosen device assumptions and calibration data. |
| Circuit-level calibrated modeling | NeuroSim 2018 model setup and validation sections | Equation; experiment | The original paper derives bottom-up analytical models, latency and energy equations, and validates subarray models against layout/SPICE with reported average errors for latency, energy, and leakage. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) | The paper-level evidence supports macro-model calibration for modeled circuit blocks; full-system calibration depends on the selected technology, array, and peripheral assumptions. |
| Public implementation available | README and source headers | Code/artifact; documentation | Public repositories provide PyTorch wrapper code, NeuroSim C++ code, manuals, configuration files, make-based build instructions, and CSV outputs. The code header and README identify a CC BY-NC 4.0 license. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1)) | Artifact status is public and usable for inspection; exact reproduction of every paper figure is partially documented and would require matching configurations, datasets, seeds, and scripts. |

## 4. Stack anatomy

```text
Input / frontend:
PyTorch/TensorFlow or PyTorch model definitions, dataset loaders, quantization settings, and training/inference wrapper arguments. The frontend object is a DNN graph/model encoded in framework code, not a standalone compiler IR. V1.x supports PyTorch/TensorFlow in the paper; V2.x artifact is PyTorch-only. It is inspectable as source code and command-line arguments, with documented example workflows.

Middle representation:
A combination of network topology, layer records, weights, activations, gradients/errors, precision fields, and CSV trace/statistics files such as input_activity.csv, weight_dist.csv, delta_dist.csv, PythonWrapper_Output.csv, NeuroSim_Output.csv, and per-epoch reports. This is serialized and inspectable, but it is a trace/config boundary rather than a typed IR with verifier and rewrite rules. ([arXiv](https://arxiv.org/pdf/2003.06471))

Mapping or scheduling state:
Automatic floorplanning maps layer traces to chip/tile/PE/synaptic-array hierarchy; V2.0 introduces a kernel-spatial mapping in which a K×K kernel is mapped to K×K submatrices/PEs and partial sums are accumulated through adder trees. Training scheduling covers feed-forward, error calculation, weight-gradient calculation, and weight update, with operation ordering and buffer/DRAM traffic modeled. The state is partly visible in reports and partly embedded in wrapper/C++ logic. ([arXiv](https://arxiv.org/pdf/2003.06471))

Hardware abstraction:
A hierarchical CIM template: chip, tiles, processing elements, synaptic arrays/subarrays, global/local buffers, H-tree/global routing, accumulation units, ADC/sense circuits, activation/pooling units, SRAM/eNVM/FeFET device models, conductance states, read/write pulses, wire parasitics, and technology-node parameters. It is explicit and reusable as simulator configuration plus C++ classes/functions. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

Backend / simulator / codegen:
The backend is the NeuroSim C++ macro model. It computes area, latency, energy, leakage, throughput, TOPS/W, and component/layer/operation breakdowns. It is a simulator backend, not a code generator or instruction-stream compiler. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/main.cpp))

Output artifact:
CSV reports, per-epoch hardware breakdowns, accuracy logs, activity/weight/delta distributions, and printed layer-wise metrics. These outputs are inspectable and useful for backend calibration or comparison, but they are not a serialized executable program for CIM hardware. ([arXiv](https://arxiv.org/pdf/2003.06471))

Evaluation loop:
The PyTorch wrapper runs inference or training, extracts real or pseudo traces, invokes the NeuroSim C++ backend, and combines algorithm accuracy with hardware metrics. The V2.x README documents a workflow that edits NeuroSim core parameters, builds with `make`, sets constraints in `train.py`, and runs the PyTorch wrapper. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.0))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **framework model topology + layer records + weight/activation/error/gradient traces + hardware parameter files + floorplanning rules + NeuroSim C++ object state + CSV reports**. The papers foreground an end-to-end benchmarking flow, while the reusable semantics are most visible in the **trace/config/simulator boundary**: precision fields, subarray dimensions, ADC sharing, memory-cell type, conductance model, and layer-to-array breakdowns together define the actual backend contract.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
NeuroSim’s strongest and most reusable slice is the device/circuit/backend model. The original paper describes a C++ circuit-level macro model that estimates area, latency, dynamic energy, leakage, and accuracy from memory-cell, transistor, array, peripheral, and architecture parameters. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

**Secondary: A5 — Narrow end-to-end co-design.**  
DNN+NeuroSim adds an end-to-end path from DNN framework execution to CIM metrics: network topology and traces are extracted by a wrapper, mapped to chip/tile/PE/synaptic arrays, and evaluated for accuracy and hardware cost. The demonstrated scope is centered on quantized DNN inference/training workflows such as VGG-8/CIFAR-10 and ResNet/ImageNet-style inference experiments. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611))

**Supporting: A3 — Mapping / scheduling / DSE framework.**  
The stack performs automatic floorplanning, layer trace assignment, kernel-to-submatrix mapping, array partitioning, and device/precision/array-size sweeps. These mapping decisions are evidenced in the papers and artifacts, but the mapping interface is embedded in the wrapper and simulator rather than exposed as a general-purpose compiler API. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611))

**Supporting: A1 — Macro / circuit generator-like modeling.**  
NeuroSim is not primarily a layout generator in the compiler sense, but its bottom-up macro model constructs area/latency/energy estimates from memory-cell and subcircuit models and validates against SPICE/layout for selected configurations. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The clearest reusable middle representation is configuration: `Param.cpp`, wrapper arguments, hardware constraints in `train.py`, and CSV trace/statistics files. Decisions made here include memory-cell type, operation mode, access type, transistor roadmap, buffer style, subarray size, ADC precision/sharing, cell precision, batch size, and nonideality settings. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/Param.cpp))  
A single upstream-readable IR artifact is not the primary interface; reuse would benefit from extracting these fields into a schema.

**B4 — Hardware-resource IR.**  
The named hardware resources are chip/tile/PE/synaptic array, buffers, H-tree interconnect, ADC/sense units, adder/accumulation units, and memory cells. Decisions made at this layer include array dimensions, PE organization, peripheral sharing, cell precision, and device parameters. ([arXiv](https://arxiv.org/pdf/2003.06471))  
Several resource decisions remain embedded in C++ classes and hard-coded flow assumptions, but the resource vocabulary is unusually concrete for backend integration.

**B6 — Accuracy / nonideality modeling.**  
The paper and artifact expose nonideality parameters for ADC quantization, retention, nonlinear/asymmetric update, device-to-device variation, and cycle-to-cycle variation. V2.0 gives conductance-update equations and variation definitions; the artifact exposes corresponding command-line and code fields. ([arXiv](https://arxiv.org/pdf/2003.06471))  
This style is valuable for IR research because these fields behave like numeric/type qualifiers that influence both accuracy and backend cost.

**Partial B2 — Graph-as-IR.**  
The frontend graph is a PyTorch/TensorFlow or PyTorch model. The wrapper reads topology and traces, but the graph is not presented as a reusable compiler IR with a stable textual form, verifier, or pass interface. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611))

**Partial B7 — Runtime-state abstraction.**  
Training/inference traces, per-epoch reports, batch size, activity distributions, and DRAM/buffer traffic act as runtime-state summaries. They support trace-driven evaluation, but runtime state is not modeled as a general scheduling/runtime abstraction for dynamic batching, masks, KV cache, or serving policies. ([arXiv](https://arxiv.org/pdf/2003.06471))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class** | NeuroSim models memory cell, array architecture, synaptic core, and inter-core communication; DNN+NeuroSim maps traces to chip/tile/PE/synaptic-array hierarchy. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) |
| Bit-slicing / bit significance | **Parameter / partially first-class** | The artifact exposes `cellBit`, input/synapse precision, ADC precision, and multilevel sensing parameters. Bit significance influences cost through precision and shift-add structures, but a standalone bit-slice IR is not the evidenced interface. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/Param.cpp)) |
| ADC/DAC precision or sensing | **Parameter and costed object** | The papers sweep ADC precision and discuss multilevel sensing; code exposes SAR ADC/current-mode options, ADC muxing, and output levels. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611)) |
| Analog-to-digital or domain transition | **Costed / implicit flow stage** | NeuroSim distinguishes analog operation within cores from digital communication between cores; DNN+NeuroSim accumulates partial sums after ADC conversion from subarrays. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) |
| Peripheral circuits as path nodes | **First-class / costed** | Buffers, H-tree, ADCs, accumulation units, activation/pooling units, adders, registers, and shift-add circuits appear in architecture descriptions and output breakdowns. ([arXiv](https://arxiv.org/pdf/2003.06471)) |
| Partial-sum accumulation path | **Costed / partially first-class** | V2.0 maps kernel submatrices and uses adder trees for partial sums; the 2019 paper describes partial sums through ADCs accumulated from multiple subarrays. ([arXiv](https://arxiv.org/pdf/2003.06471)) |
| Reconstruction / shift-add tree | **Costed / embedded in backend** | SRAM and eNVM models include adder, register, shift-add, mux, and shift-register structures for multibit weights and readout. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) |
| Runtime state, masks, KV cache, batching, sparsity | **Trace-level parameter; broader serving state not applicable / not evidenced** | Batch size and per-epoch traces are modeled; the checked papers do not target LLM serving constructs such as KV cache or dynamic batching. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/Param.cpp)) |
| Value trajectory / flow path | **Approximated through traces and reports** | The closest approximation is real/pseudo trace propagation of weights, activations, errors, and gradients through mapped hardware. Value identity across analog partial sums, sensing, reconstruction, and storage is not serialized as a typed trajectory object. ([arXiv](https://arxiv.org/pdf/2003.06471)) |

### 5.4 Axis D — rewrite object

The tool actually rewrites or transforms:

- **Operator graph / layer topology** into a hardware floorplan and layer records.
- **Tensor/kernel structure** into array/submatrix mapping, including K×K kernel-to-K×K submatrix mapping in V2.0.
- **Hardware mapping and array binding** through trace partitioning, weight duplication, array partitioning, and PE/synaptic-array assignment.
- **Numeric format and nonideality configuration** through precision fields, ADC precision, cell precision, conductance levels, update nonlinearity/asymmetry, and variation parameters.
- **Training operation flow** into feed-forward, error calculation, weight-gradient calculation, and weight-update phases with buffer and off-chip traffic accounting.

Legal transformations are simulator-backed transformations that preserve DNN layer dimensions, quantized values/traces, precision settings, mapped array dimensions, and operation ordering required by the modeled architecture. The exploited equivalences are mainly **matrix/tensor-to-crossbar MVM equivalences**, convolution lowering/unrolling into array operations, and spatial reuse/duplication choices that trade area, latency, and energy. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

The representation is especially well suited to **costing concrete CIM resource choices**: memory cell type, subarray size, ADC precision, cell precision, peripheral sharing, and nonideality parameters. Expressing transformations such as retiming ADC conversion across operator boundaries, preserving bit-sliced partial sums as typed values, or rewriting reduction-tree structure independently of the simulator would likely require an additional abstraction for **value trajectory, domain transition, and reconstruction state**.

## 6. Technical mechanism reading

### 6.1 Circuit macro model: conductance, latency, and energy

The original NeuroSim model starts from the crossbar interpretation of neural computation: synaptic weights are represented by conductance values and weighted sums are produced by the crossbar current relation \(I = G \cdot V\). ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) The simulator then builds a bottom-up C++ macro model from memory-cell and transistor parameters to gate-level subcircuits, array architecture, peripherals, and architecture-level communication. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

For latency, the paper uses analytical circuit estimates including Horowitz-style delay modeling and sums operation latency across array/peripheral/architecture components. For energy, it uses switching-energy terms and selected-cell eNVM programming energy expressions, then aggregates array and subcircuit energy. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) This is the part of the stack most naturally reusable as a backend cost plugin.

### 6.2 Hardware hierarchy and peripheral model

The hardware abstraction is hierarchical: chip → tile → PE → synaptic array/subarray, with buffers, H-tree routing, accumulation units, ADC/sensing, activation, and pooling units around the arrays. ([arXiv](https://arxiv.org/pdf/2003.06471)) The simulator distinguishes analog in-core behavior from digital communication between cores, which makes it useful for modeling where analog-to-digital conversion, accumulation, and buffering costs enter the path. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970))

The artifact exposes many of these choices in code: memory-cell type, access type, transistor type, device roadmap, buffer type, ADC style, pipeline/speedup options, subarray dimensions, ADC muxing, cell precision, Ron/Roff, FeFET polarization, batch size, and DRAM type. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/NeuroSIM/Param.cpp))

### 6.3 DNN wrapper and trace interface

DNN+NeuroSim adds a wrapper that stores activations and weights, takes real traces from DNN execution, partitions them, and assigns them to the hardware hierarchy through automatic floorplanning. The output combines algorithm accuracy with hardware metrics including area, latency, energy, leakage, throughput, and energy efficiency. ([arXiv](https://arxiv.org/pdf/2003.06471))

The paper distinguishes real-traced, pseudo-traced, and average simulation modes. Real-traced simulation is the most detailed but expensive; pseudo/average modes approximate activity and can underestimate effects such as column-current behavior. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611)) For compiler researchers, this trace interface is important because it is the point where abstract DNN values become backend-visible activity.

### 6.4 Mapping and floorplanning

The mapping mechanism is not presented as a general compiler IR pass pipeline, but the papers expose several concrete lowering steps. The wrapper obtains the network topology, performs automatic floorplanning, partitions traces, and maps them into chip/tile/PE/synaptic-array resources. ([arXiv](https://arxiv.org/pdf/2003.06471))

V2.0 introduces a mapping for convolution training in which each K×K kernel is mapped to K×K submatrices or PEs; partial sums are accumulated by adder trees. This is a meaningful CIM-specific rewrite object: convolution structure is converted into a spatial array-binding and accumulation plan. ([arXiv](https://arxiv.org/pdf/2003.06471))

### 6.5 Training extension

The V2.0 training stack models four phases: feed-forward, error calculation, weight-gradient calculation, and weight update. It includes transposable arrays for feed-forward/backpropagation paths and SRAM-based CIM arrays for weight-gradient calculation, with intermediate data stored in batch-sized buffers or off-chip DRAM. ([arXiv](https://arxiv.org/pdf/2003.06471))

The paper states that the four training steps are assumed non-overlapping to limit buffer overhead, while some feed-forward/error phases can be pipelined under certain conditions. ([arXiv](https://arxiv.org/pdf/2003.06471)) This assumption is compiler-relevant because it fixes part of the schedule and memory-traffic contract.

### 6.6 Accuracy, precision, and nonideality

DNN+NeuroSim models quantized values and device nonidealities. The 2019 paper includes weight precision, partial-sum quantization, ADC precision, and retention during inference; V2.0 extends this to on-chip training with nonlinear/asymmetric conductance updates and device/cycle variation. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10181611))

In the artifact, training precision and nonideality fields are explicit command-line or code parameters: dataset, batch size, epochs, weight/input/gradient precision, ADC precision, variation flags, LTP/LTD nonlinearity, maximum conductance level, cycle-to-cycle variation, and device-to-device variation. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1/blob/master/Training_pytorch/train.py))

### 6.7 Output and reporting

The artifact writes both algorithm-side and hardware-side outputs: activity distributions, weight/delta distributions, Python wrapper output, NeuroSim output, and per-epoch hardware breakdowns. The C++ backend writes layer/component breakdowns for area, latency, energy, and operation categories such as forward, activation-gradient, weight-gradient, and weight-update. ([GitHub](https://raw.githubusercontent.com/neurosim/DNN_NeuroSim_V2.1/master/README.md))

This output format makes NeuroSim practical as a **measurement backend** for a future compiler stack, provided an adapter can translate compiler IR decisions into the expected network, trace, and hardware-parameter inputs.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Config files and traces are the de facto IR boundary

- **Observation:** The most inspectable intermediate state is not a named IR dialect, but the combination of `Param.cpp`, wrapper arguments, layer records, traces, and CSV outputs.
- **Why it matters for CIM compiler/IR work:** This shows a common CIM-stack pattern: the backend contract is real and detailed, but it is distributed across configuration, traces, and simulator code rather than centralized in one IR file.
- **Reusable lesson:** A future compiler could wrap NeuroSim by defining a schema for array hierarchy, precision, ADC/sensing, conductance model, trace statistics, and layer mapping, then generate NeuroSim-compatible configs and trace files.

### Insight 2 — The simulator exposes a richer hardware contract than the frontend

- **Observation:** The frontend is a conventional DNN wrapper, while the backend names CIM-specific resources: subarrays, ADC muxing, cell precision, Ron/Roff, FeFET polarization, buffers, interconnect, and accumulation units.
- **Why it matters for CIM compiler/IR work:** The backend resource vocabulary is a strong candidate for Axis C first-class objects in a compiler IR.
- **Reusable lesson:** Compiler frontends should avoid stopping at “layer mapped to crossbar”; they should preserve enough metadata to select ADC precision, subarray binding, peripheral sharing, and accumulation path.

### Insight 3 — Kernel-to-submatrix mapping is an implicit tensor-layout rewrite

- **Observation:** V2.0’s K×K kernel-to-K×K submatrix mapping is a concrete rewrite from convolution structure into physical CIM placement and partial-sum accumulation.
- **Why it matters for CIM compiler/IR work:** This is the kind of lowering rule that a CIM IR could make explicit, verify, and compare against alternative placements.
- **Reusable lesson:** A future IR could represent convolution lowering as `(kernel element, channel group, bit slice, array coordinate, accumulation stage)` rather than hiding it inside a floorplanner.

### Insight 4 — Nonideality fields behave like numeric type qualifiers

- **Observation:** Precision, ADC quantization, conductance levels, LTP/LTD nonlinearity, retention, and variation parameters propagate into both accuracy and hardware estimates.
- **Why it matters for CIM compiler/IR work:** These fields are not mere backend options; they change the meaning and cost of a value path.
- **Reusable lesson:** A CIM IR type system could attach precision stage, device state, update model, and sensing model to values or tensors, enabling legality checks for mixed-precision and nonideality-aware rewrites.

### Insight 5 — Training support reveals a memory-traffic contract

- **Observation:** V2.0 explicitly separates feed-forward, error calculation, weight-gradient calculation, and weight update, and models intermediate storage, DRAM traffic, and buffer sizing.
- **Why it matters for CIM compiler/IR work:** Training introduces stateful updates and temporal data reuse that are not captured by static inference mapping alone.
- **Reusable lesson:** Future CIM compiler stacks should represent update state, gradient accumulation, and buffer/DRAM residency as first-class schedule objects, especially for on-chip learning.

### Insight 6 — Validation is modular rather than monolithic

- **Observation:** The original NeuroSim paper validates selected array/peripheral models against layout/SPICE and reports model error, while DNN+NeuroSim uses the macro model for broader algorithm-level sweeps.
- **Why it matters for CIM compiler/IR work:** This suggests a useful backend-plugin design: validate local circuit modules, then expose their costs to mapping and scheduling tools.
- **Reusable lesson:** A compiler corpus should record which backend costs are circuit-calibrated, which are analytical, and which depend on workload traces.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL / identifier:** GitHub repositories `neurosim/NeuroSim`, `neurosim/DNN_NeuroSim_V1.4`, and `neurosim/DNN_NeuroSim_V2.1`; the V2.0 repository is also documented in the checked README. ([LED Circuits Lab](https://shimeng.ece.gatech.edu/downloads/))
- **License:** CC BY-NC 4.0 is stated in the README/source header checked for the public artifact. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** PyTorch wrapper code, NeuroSim C++ backend, manuals, make-based build flow, hardware parameter files, nonlinearity table/scripts, training/inference examples, and CSV output generation. ([GitHub](https://raw.githubusercontent.com/neurosim/DNN_NeuroSim_V2.1/master/README.md))
- **What the artifact appears to omit:** A standalone compiler IR schema, an ISA or instruction-stream output, a stable pass API, and figure-specific reproduction scripts for every paper result were not found in the checked sources.
- **Minimal documented workflow:** Clone the repository, install dependencies, configure NeuroSim core parameters, build the C++ backend with `make`, set wrapper/hardware constraints, and run the PyTorch wrapper. V1.4 also documents example inference commands with dataset/model/mode/cellBit/subarray/ADC arguments. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.0))
- **Whether paper figures appear reproducible from the artifact:** **Partial / unknown.** The artifact writes the kinds of reports used in the papers, including accuracy and hardware breakdown CSVs, but exact reproduction of every plotted figure would require matching datasets, seeds, pretrained weights, hardware configs, and plotting scripts. The checked sources document outputs more clearly than figure-level reproduction.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---:|---|
| Input format documented | Partial | PyTorch model/wrapper inputs and command arguments are documented; frontend is framework code rather than a standalone input IR. |
| Intermediate representation serialized | Partial | Traces and CSV summaries are serialized; no single typed IR artifact was found. |
| Mapping decisions inspectable | Partial | Layer-wise reports and code expose mapping effects; full floorplanning state is embedded in wrapper/C++ logic. |
| Schedule inspectable | Partial | Training phase order and some pipeline assumptions are described; no independent schedule IR was found. |
| Hardware config explicit | Yes | Memory type, precision, subarray, ADC, device, buffer, and DRAM parameters are explicit in code/config. |
| Precision / bit-slice assumptions explicit | Partial | Precision and cell-bit fields are explicit; bit significance is not exposed as a first-class compiler type. |
| Cost model inspectable | Yes | Equations and C++ backend are available for inspection. |
| Simulator backend documented | Yes | Papers, manuals, README files, and source code document the NeuroSim backend. |
| Generated code / instruction stream inspectable | N/A | The artifact is a simulator flow; no generated CIM instruction stream was found. |
| Provenance from source op to backend action | Partial | Layer-wise provenance is visible through records and reports; fine-grained value-to-peripheral provenance is not serialized as a trajectory. |
| Reproduction scripts available | Partial | Build/run scripts and wrapper flows are available; exact figure reproduction scripts are not clearly identified. |
| Calibration source documented | Partial | The original paper documents SPICE/layout/PTM-based validation; raw calibration decks/data are not fully assessed in the checked sources. |

### 8.3 Integration helper

- **As frontend:** Reuse is possible for PyTorch-based CNN workloads and quantized training/inference examples. It is less direct as a general compiler frontend because the model format is framework code plus wrapper conventions.
- **As IR inspiration:** The most useful abstractions to borrow are hardware hierarchy, precision fields, ADC/sensing parameters, conductance-state models, trace summaries, and layer-wise cost reports.
- **As mapper/scheduler:** Mapping logic could be adapted for layer-to-array floorplanning, convolution kernel-to-submatrix binding, trace partitioning, weight duplication, and training-phase scheduling.
- **As cost model:** This is the most direct integration path. NeuroSim can serve as a backend plugin for area, latency, energy, leakage, throughput, and accuracy/nonideality estimates.
- **As backend:** A compiler could emit NeuroSim-compatible configuration and trace files, then parse `NeuroSim_Output.csv` and per-epoch reports.
- **As benchmark:** VGG-8/CIFAR-10, ResNet/ImageNet-style inference settings, device sweeps, ADC precision sweeps, and array-size sweeps are reusable comparison points, subject to matching version/configuration.
- **As validation source:** The original macro model’s SPICE/layout validation and DNN+NeuroSim’s later device/nonideality experiments can calibrate or sanity-check other CIM backend models.

**Integration effort estimate: Medium–High.**  
Integration would be most direct through a backend adapter that generates NeuroSim configs/traces and consumes CSV reports. The effort becomes higher if the goal is compiler-style rewriting, because mapping semantics, schedule choices, and value-flow assumptions are distributed across PyTorch wrapper code, C++ simulator state, and configuration files. The most valuable reusable boundary appears to be the **hardware/cost-model interface**, not a frontend IR or ISA layer.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **MLP+NeuroSim / original NeuroSim** | Device–circuit–algorithm modeling for CIM accelerators | Original NeuroSim centers on circuit macro modeling and MLP-style studies; DNN+NeuroSim adds CNN wrappers, automatic floorplanning, traces, and broader DNN metrics. ([NSF Public Access Repository](https://par.nsf.gov/servlets/purl/10109970)) | Treat the family as an evolution from backend macro model to trace-driven DNN evaluation stack. |
| **MNSIM** | Memristor/PIM simulator with accuracy and hardware performance modeling | MNSIM is a behavior-level PIM modeling platform; NeuroSim’s distinctive strength is its circuit-macro detail and device/peripheral parameterization. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/publications/2020/GLSVLSI20_None.pdf?utm_source=chatgpt.com)) | Both belong near A2/A3, but NeuroSim is especially useful for circuit/backend cost contracts. |
| **ISAAC** | ReRAM crossbar acceleration for neural networks | ISAAC is an accelerator architecture proposal with pipelined layer execution and eDRAM buffering; NeuroSim is a reusable simulator/evaluation framework rather than a single accelerator architecture. ([users.cs.utah.edu](https://users.cs.utah.edu/~rajeev/pubs/isca16.pdf?utm_source=chatgpt.com)) | Separate architecture proposals from simulator stacks even when both use crossbar MVM. |
| **PRIME** | ReRAM-based PIM / in-memory neural acceleration | PRIME embeds neural computation into ReRAM main memory; NeuroSim models many CIM device/array/peripheral choices and DNN traces. ([class.ece.iastate.edu](https://class.ece.iastate.edu/tyagi/cpre581/papers/ISCA16PRIME.pdf?utm_source=chatgpt.com)) | PRIME is closer to architecture/runtime organization; NeuroSim is closer to backend modeling and design-space evaluation. |
| **PUMA** | Memristor-crossbar DNN acceleration and compiler/system stack | PUMA includes a specialized ISA and compiler that partitions graphs and schedules/register-allocates instructions; NeuroSim’s reusable boundary is config/trace/simulator rather than ISA/program generation. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) | Useful contrast for Axis A4: PUMA foregrounds instruction/compiler objects; NeuroSim foregrounds hardware-cost objects. |
| **Timeloop/Accelergy** | Mapping-space search and analytical energy/performance modeling | Timeloop/Accelergy provides explicit tensor mapping and energy-estimation infrastructure for DNN accelerators; NeuroSim provides CIM-specific device/circuit/peripheral fidelity. ([timeloop.csail.mit.edu](https://timeloop.csail.mit.edu/?utm_source=chatgpt.com)) | A future CIM compiler could pair Timeloop-like mapping schemas with NeuroSim-like CIM backend cost plugins. |

## 10. Corpus-ready final takeaway

- NeuroSIM / DNN+NeuroSim is best treated as a **CIM simulator and cost-model stack with a bounded DNN wrapper**, not primarily as an explicit compiler IR or ISA stack.
- The strongest reusable layer is the **device/circuit/backend model**: memory-cell parameters, array/subarray organization, ADC/sensing, buffers, interconnect, accumulation, and nonideality modeling.
- The evidenced end-to-end scope covers quantized DNN inference and training workflows, especially CNN examples such as VGG-8/CIFAR-10 and ResNet/ImageNet-style inference studies.
- The first-class CIM objects are hardware resources and numeric/device parameters: chip/tile/PE/synaptic arrays, subarray size, ADC precision, cell precision, conductance levels, variation, buffers, and component-level cost breakdowns.
- The hidden IR is distributed across **PyTorch model code, traces, hardware configs, C++ simulator state, and CSV reports**.
- Artifact status: **public artifact found**, with CC BY-NC 4.0 licensing in the checked source; exact figure-level reproducibility is partial/unknown.
- Integration is most natural as a **backend cost model, benchmark source, and validation reference** for future CIM compiler/IR projects.
- For value-trajectory IR research, NeuroSim provides useful hardware and cost ingredients, while trajectory-level rewrites would require adding explicit value identity, domain-transition, bit-significance, and accumulation-path metadata.
