---
slug: pim-eda
title: "PIM EDA Suite / PIM Toolchain"
short_title: "PIM EDA Suite"
subtitle: "Scoped CIM stack note"
year: 2023
publication:
  venue: "GitHub repository"
  type: "other"
  doi: 
  url: "https://github.com/chenxm1986/PIM-Toolchain"
authors: []
author_note: "Xiaoming Chen group / ICT CAS and collaborators"
bibtex: |
  @misc{pim-eda,
    title = {PIM EDA Suite / PIM Toolchain},
    year = {2023},
    howpublished = {GitHub repository},
    url = {https://github.com/chenxm1986/PIM-Toolchain},
    note = {Repository-centered suite; associated papers include DAC 2023, IEEE TCAD, and DATE 2024}
  }
citation_source: https://github.com/chenxm1986/PIM-Toolchain
summary: >-
  **PIM EDA Suite / PIM Toolchain** is best read as a crossbar-PIM DNN/CNN inference toolchain family rather than a single compiler paper. Its strongest contribution for a CIM compiler/IR corpus is the way it exposes several adjacent compiler boundaries: PIMSYN-NN synthesizes a parameterized macro/PE/crossbar accelerator and dataflow under a power constraint; PIMCOMP-NN lowers ONNX models through structure/weight representations, array-group partitioning, weight replication, core mapping, and HT/LL scheduling into pseudo-instruction or simulator inputs; PIMSIM-NN evaluates ISA/program-instruction streams against architecture/NoC configuration; and PIMACC evaluates inference accuracy under configurable nonidealities. The demonstrated setting is static DNN/CNN inference on configurable crossbar/RRAM-style PIM accelerators, with reusable evidence strongest at the hardware-template/config, mapping-state, pseudo-instruction, and simulator-input boundaries. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))
links:
  paper:
  artifact: https://github.com/chenxm1986/PIM-Toolchain
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
  - "crossbar-PIM"
  - "NVM-CIM"
  - "configurable crossbar template"
workloads:
  - "CNN inference"
  - "DNN inference"
  - "ONNX models"
  - "AlexNet"
  - "VGG"
  - "ResNet"
  - "GoogleNet"
  - "SqueezeNet"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A1, A2, A3, A4]
axis_B: [B1, B2, B4, B5, B6, B7]
axis_C_first_class_objects:
  - "crossbar array"
  - "array group"
  - "macro / PE / crossbar hierarchy"
  - "chip / core / PIMFU hierarchy"
  - "logical array / physical array mapping"
  - "weight replication factor"
  - "ADC / DAC / cell precision parameters"
  - "local and global memory"
  - "NoC / inter-core transfer"
  - "pseudo-instruction stream"
  - "pixel dependency and runtime address records"
  - "nonideality configuration"
axis_D_rewrite_objects:
  - "operator graph"
  - "weight unfolding"
  - "array partitioning"
  - "hardware mapping"
  - "array binding"
  - "dataflow schedule"
  - "instruction stream"
  - "numeric bit-splitting"
  - "memory layout"
  - "accuracy model"
artifact:
  status: "public artifact found"
  url: "https://github.com/chenxm1986/PIM-Toolchain"
  license: "Apache-2.0 for PIMCOMP-NN, PIMSYN-NN, and PIMACC; umbrella and pimsim-nn license not found in checked README/listing"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Treat as a suite/paper-family entry unless a standalone PIM EDA paper is later identified."
  - "Most reusable boundary is PIMCOMP AG mapping plus pseudo-instruction/simulator input."
  - "PIMSYN IR DAG is valuable for operation/component-level CIM IR comparison."
  - "PIMACC nonideality config is useful as an accuracy-model plugin boundary."
takeaways: []
---

# PIM EDA Suite / PIM Toolchain — scoped CIM stack note

Checked sources: I found an umbrella repository titled **“PIM EDA Suite”** and four linked artifacts/papers: **PIMSYN-NN**, **PIMCOMP-NN**, **PIMSIM-NN**, and **PIMACC**. I did **not** find a standalone public paper titled exactly “PIM EDA”; this note treats the suite and its linked publications/artifacts as the corpus object. The umbrella repository describes the suite as an architecture-level EDA toolchain for PIM CNN accelerators and lists four tools: PIMSYN-NN, PIMCOMP-NN, PIMSIM-NN, and PIMACC. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with strong A3/A4/A2 subcomponents | The suite links synthesis, compilation, behavior/cycle simulation, and accuracy simulation around ONNX CNN/DNN workloads and a crossbar-centered PIM abstraction. The umbrella README explicitly describes the synthesizer, compiler, performance simulator, and accuracy simulator as separate tools in one toolchain. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain)) |
| Middle-layer style, Axis B | **B1 config-as-IR; B2 graph-as-IR; B4 hardware-resource IR; B5 instruction/meta-op/ISA; B6 accuracy/nonideality modeling; partial B7 runtime-state abstraction** | PIMSYN defines an IR-based DAG with MVM/ADC/ALU/load/store/merge/transfer operations; PIMCOMP uses structure IR, weight data, array groups, mapping state, and pseudo-instructions; PIMSIM consumes instruction/config inputs; PIMACC configures nonidealities. ([ar5iv](https://ar5iv.org/abs/2402.18114)) |
| First-class CIM objects, Axis C | Crossbar array, array group, PIMFU/PIM matrix unit, macro/PE/crossbar hierarchy, logical vs physical array, cell precision, ADC/DAC resolution, local/global memory, NoC/core mapping, weight replication factor, pseudo-instruction stream, runtime pixel/dependency records, nonideality knobs | These objects are named in the paper/artifacts as architecture parameters, mapping units, instructions, runtime records, or simulation inputs. The clearest compiler object is PIMCOMP’s **array group**, which is both a mapping and scheduling unit. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Rewrite object, Axis D | Graph, mapping, array binding, memory layout, instruction stream, numeric/bit-slice lowering, accuracy model | The suite rewrites ONNX/model structure into JSON/IR, partitions weights into AGs, chooses replication and core mappings, schedules HT/LL pipelines, emits verification/simulation instruction files, and passes nonideality parameters to PIMACC. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Best corpus tags | `PIM-EDA`, `crossbar-CIM`, `RRAM-CIM`, `analog-CIM`, `ONNX`, `compiler-mapping`, `ISA`, `architecture-synthesis`, `cycle-simulation`, `accuracy-simulation` | The demonstrated stack centers on ONNX CNN/DNN inference over configurable crossbar/PIM-array accelerators, with compiler mapping, pseudo-instructions, and simulators as reusable boundaries. |
| Closest comparison baselines | PUMA, MNSIM2.0, SongC, Polyhedral mapping, Gibbon, ISAAC/PipeLayer/PRIME | PIMCOMP compares against SongC, PUMA, and Polyhedral-style strategies; PIMSIM compares with MNSIM2.0; PIMSYN compares with Gibbon and manually designed PIM accelerators such as ISAAC/PipeLayer/PRIME. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |

## 2. One-paragraph public summary

**PIM EDA Suite / PIM Toolchain** is best read as a crossbar-PIM DNN/CNN inference toolchain family rather than a single compiler paper. Its strongest contribution for a CIM compiler/IR corpus is the way it exposes several adjacent compiler boundaries: PIMSYN-NN synthesizes a parameterized macro/PE/crossbar accelerator and dataflow under a power constraint; PIMCOMP-NN lowers ONNX models through structure/weight representations, array-group partitioning, weight replication, core mapping, and HT/LL scheduling into pseudo-instruction or simulator inputs; PIMSIM-NN evaluates ISA/program-instruction streams against architecture/NoC configuration; and PIMACC evaluates inference accuracy under configurable nonidealities. The demonstrated setting is static DNN/CNN inference on configurable crossbar/RRAM-style PIM accelerators, with reusable evidence strongest at the hardware-template/config, mapping-state, pseudo-instruction, and simulator-input boundaries. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| PIM EDA Suite is an architecture-level toolchain with synthesizer, compiler, behavior simulator, and accuracy simulator | Umbrella README introduction | Documentation / artifact | Four named components are linked and assigned roles: PIMSYN-NN, PIMCOMP-NN, PIMSIM-NN, PIMACC. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain)) | Demonstrated as a public repository hub; integration between tools is described, with reuse clearest through files/configs/instructions. |
| PIMCOMP is an end-to-end DNN compiler from high-level DNN description to pseudo-instructions | PIMCOMP TCAD abstract and Sections IV-A–IV-C | Paper + artifact | ONNX frontend, structure IR/weight split, optimizer stages, pseudo-instruction backend, profiler, and open-source implementation are described. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | Demonstrated for DNN inference over configurable crossbar PIM templates; hardware-specific primitive generation is an interface point. |
| PIMCOMP adapts to multiple PIM architectures via an abstract configurable architecture template | PIMCOMP Section III-A and Table II | Paper + config | Chips/cores/PIMFUs/crossbars/storage, connection type/bandwidth, cell precision, local/global memory, and PIMFU parameters are represented. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | The reusable boundary is clearest at architecture JSON/config plus compiler constants; detailed physical backends remain user-provided or simulator-specific. |
| PIMCOMP uses array groups as mapping/scheduling units | PIMCOMP Section V-A | Paper + code/artifact | Array groups are defined as vertically partitioned weight-matrix groups; AGs are physical sets of crossbars sharing inputs and managed by a common `mvm` pseudo-instruction. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | Demonstrated for convolution/FC weight partitioning and scheduling; the AG abstraction is a strong corpus object for CIM mapping IR. |
| PIMCOMP performs weight-layout guided computation-storage mapping | PIMCOMP Section VI | Algorithm / experiment | GA jointly optimizes weight replication and AG layout; task allocation differs for HT and LL pipeline modes. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | Evaluated through simulator/profiler-backed experiments over selected networks and architecture templates. |
| PIMCOMP supports HT and LL scheduling modes | PIMCOMP Sections IV-B and VII | Algorithm / artifact | HT mode uses layer groups and reusable pseudo-instructions; LL mode uses pixel-level dependency/runtime records and transmission queues. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | Demonstrated for batch-style throughput and single-sample latency scenarios; scheduling semantics are partly in algorithms and implementation state. |
| PIMSYN automatically transforms CNN applications into PIM architectures and dataflow | PIMSYN abstract and README | Algorithm / artifact | PIMSYN takes ONNX, power constraint, and hardware setup, then explores weight duplication, dataflow compilation, macro partitioning, and component allocation. ([ar5iv](https://ar5iv.org/abs/2402.18114)) | Demonstrated for CNN accelerator synthesis under a PIM macro/PE/crossbar abstraction; strongest as architecture/DSE plus dataflow representation. |
| PIMSYN defines IRs for dataflow DAG synthesis | PIMSYN Section IV-B and Table II | Paper / algorithm | IR categories include computation, intra-macro communication, and inter-macro communication; operations include MVM, ADC, ALU, load, store, merge, and transfer. ([ar5iv](https://ar5iv.org/abs/2402.18114)) | The paper-level IR is explicit and typed enough for corpus classification; artifact-level serialization details need per-file inspection. |
| PIMSIM-NN is an ISA-based cycle-accurate configurable simulator | PIMSIM abstract, Sections II–III, README | Paper + artifact | ISA types include matrix, vector, transfer, scalar; simulator inputs include architecture config, NoC config, and program instructions. ([ar5iv](https://ar5iv.org/abs/2402.18089)) | Demonstrated as SystemC/C++ simulator flow with example ResNet-18 instruction/config input; figures are not clearly reproduced by one documented script. |
| PIMACC simulates accuracy under configurable nonidealities | PIMACC README | Artifact / documentation | PIMACC consumes PIMCOMP mappings/instructions and configures cell precision, conductance, R ratio, wire conductance, variation, and stuck-at faults. ([GitHub](https://github.com/HertzHan/PIMACC-simulator)) | Demonstrated as an accuracy simulation wrapper around PIMCOMP verification output; dataset changes require modifying script logic. |

## 4. Stack anatomy

```text
Input / frontend:
ONNX-format CNN/DNN model. PIMCOMP converts ONNX into JSON containing node parameters and topological connections; PIMSYN also accepts ONNX/JSON plus total power and hardware setup parameters. Serialized and inspectable as model JSON, with ONNX assumptions documented in the README. Reusable with constraints on supported operators and input-node shape. 
```
PIMCOMP’s README states that the frontend converts ONNX to backend JSON with node parameters and topology, and lists supported operators such as CONV, Group CONV, FC, POOL, ADD, CONCAT, and ReLU. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

```text
Middle representation:
PIMCOMP: structure IR + separated weight data; array groups; mapping state; pseudo-instruction stream.
PIMSYN: IR-based dataflow DAG with MVM/ADC/ALU/load/store/merge/transfer.
PIMSIM: program instruction file plus architecture/NoC configuration.
PIMACC: verification instruction JSON plus nonideality configuration.
```
PIMCOMP names structure IR and weight data; PIMSYN defines an IR table and DAG; PIMSIM requires architecture, NoC, and instruction inputs; PIMACC expects `VerificationInfo.json` from PIMCOMP. ([ar5iv](https://ar5iv.org/abs/2411.09159))

```text
Mapping or scheduling state:
Layer partitioning, flexible unfolding tuple, array groups, weight replication factors, AG-to-core layout, computation-storage mapping, HT layer groups, LL pixel/AG dependency lists, runtime record, transmission request queue, memory manager state.
```
The most explicit scheduling state appears in PIMCOMP’s HT/LL algorithms and LL dependency-maintainer description. ([ar5iv](https://ar5iv.org/abs/2411.09159))

```text
Hardware abstraction:
PIMCOMP: chip/core/PIMFU/crossbar/local/global memory template and pseudo-instructions.
PIMSYN: macro/PE/crossbar hierarchy with ADC bank, ALUs, scratchpad, controller, DAC/S&H/mux units.
PIMSIM: core with scalar, vector, matrix, and transfer units over NoC.
PIMACC: nonideality parameters in config.
```
The hardware abstraction is documented across paper sections and READMEs. ([ar5iv](https://ar5iv.org/abs/2411.09159))

```text
Backend / simulator / codegen:
PIMCOMP backend quantizes weights, performs bit splitting, programs actual PIM arrays, and translates pseudo-instructions into hardware primitives through a user-provided hardware library. PIMSIM consumes generated program instructions for performance simulation. PIMACC consumes verification instructions for accuracy simulation.
```
PIMCOMP explicitly leaves a backend interface for hardware-specific primitives; PIMSIM and PIMACC document their input files. ([ar5iv](https://ar5iv.org/abs/2411.09159))

```text
Output artifact:
PIMCOMP can save EvaluationResult.txt, VerificationInfo.json, IntermediateInfo.json, and SimulationInfo.gz. PIMSYN saves output architecture JSON and a PIMCOMP input JSON. PIMSIM reports throughput/latency from instruction/config files. PIMACC reports inference accuracy.
```
The PIMCOMP output files and PIMSYN command outputs are documented in the READMEs. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

```text
Evaluation loop:
PIMCOMP uses a profiler during optimization and reports latency, throughput, energy, utilization, memory access, and local memory overhead. PIMSYN uses DSE with simulated annealing/evolution-style search and an IR-based behavior simulator. PIMSIM runs cycle-accurate event/SystemC-style simulation. PIMACC injects configured hardware nonidealities and compares accuracy.
```
PIMCOMP’s profiler, PIMSYN’s DSE flow, PIMSIM’s simulator, and PIMACC’s nonideality configuration are separately documented. ([ar5iv](https://ar5iv.org/abs/2411.09159))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of ONNX-derived JSON/structure IR, separated weights, hardware configuration, AG partitioning, weight replication, AG/core mapping, HT/LL schedule state, memory allocation records, and generated pseudo-instruction files. The papers foreground architecture templates, IR DAGs, and pseudo-instructions, while the reusable semantics are most visible in the serialized JSON/config/instruction outputs and in the pass order exposed by the implementation pipeline. PIMCOMP’s `main.cpp` shows the concrete pass sequence: load hardware/model information, preprocessing/topology extraction, optional GA, replication, partitioning, hierarchy mapping, element or batch scheduling, memory/data reload for batch mode, instruction optimization, placement, optional verification/simulation/intermediate output, and evaluation. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/raw/refs/heads/master/main.cpp))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

Primary: **A5 narrow end-to-end co-design**. The suite spans synthesis, compilation, performance simulation, and accuracy simulation, but the demonstrated workload setting is CNN/DNN inference on crossbar-centered PIM accelerators rather than a broad programming ecosystem. The umbrella README’s tool roles make this stack-scope claim explicit. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

Secondary: **A3 mapping/scheduling/DSE framework**. PIMCOMP’s strongest compiler contribution is mapping and scheduling: layer partitioning, weight replication, AG layout, computation-storage mapping, HT/LL scheduling, and profiler feedback. ([ar5iv](https://ar5iv.org/abs/2411.09159))

Secondary: **A4 explicit IR / ISA compiler stack**. PIMCOMP exposes pseudo-instructions such as `mvm`, `vec`, `copy`, `write`, `load`, `store`, `send`, and `recv`; PIMSIM’s paper describes matrix, vector, transfer, and scalar ISA classes. ([ar5iv](https://ar5iv.org/abs/2411.09159))

Secondary: **A2 simulator & cost model**. PIMSIM is a configurable cycle/circuit-level simulator over instruction/config inputs; PIMACC is an accuracy simulator for nonideal effects. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

Secondary: **A1 macro / architecture generator**, through PIMSYN. PIMSYN synthesizes PIM-based CNN accelerators from ONNX/power/config inputs using a macro/PE/crossbar architecture abstraction. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.** Hardware configuration is a first-class boundary: PIMCOMP’s `config.json` includes crossbar count/size, DAC resolution/count, cell precision, ADC resolution/count, crossbar latency/power, shift-adder latency, memory latency, NoC topology, layout, core count, and simulation controls. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json)) Decisions such as architecture size, precision knobs, memory behavior, NoC topology, and simulator mode are expressed as config values. A single config is readable, but compiler semantics remain distributed across code and generated outputs.

**B2 Graph-as-IR.** PIMCOMP uses ONNX topology and a structure IR; PIMSYN explicitly defines an IR-based DAG whose nodes represent operations and edges represent dependencies. ([ar5iv](https://ar5iv.org/abs/2411.09159)) Decisions made here include layer/operator topology, dependency order, and pipeline/dataflow structure. Upstream passes could read ONNX/JSON and PIMSYN’s IR conceptually, but the audited artifact boundary is clearest in generated JSON rather than a standalone documented dialect.

**B4 Hardware-resource IR.** AGs, cores, PIMFUs, macros, PEs, crossbars, local/global memories, ADC/DAC banks, and NoC are named and parameterized. PIMCOMP’s AG is the key hardware-resource object because it binds weight partitioning, input sharing, mapping, and `mvm` emission. ([ar5iv](https://ar5iv.org/abs/2411.09159))

**B5 Instruction / meta-op / ISA.** PIMCOMP’s pseudo-instructions and PIMSIM’s ISA act as the backend contract. The pseudo-instruction set abstracts core-level compute, vector, memory, and communication operations. ([ar5iv](https://ar5iv.org/abs/2411.09159)) This is the most natural interface for simulator wrapping.

**B6 Accuracy / nonideality modeling.** PIMACC makes nonideal effects configurable, including cell precision, conductance state, on/off ratio, bitline/wordline conductance, device variation, and stuck-at faults. ([GitHub](https://github.com/HertzHan/PIMACC-simulator)) These are not general compiler types, but they are useful numeric/physical annotations for future CIM IR.

**Partial B7 Runtime-state abstraction.** PIMCOMP’s LL scheduling describes forward/backward dependency lists, pixel-AG dependencies, mapping info, runtime records for pixel addresses per core, a heap-based memory manager, and a transmission-request queue. ([ar5iv](https://ar5iv.org/abs/2411.09159)) This is not exposed as a general runtime IR, but it is a concrete runtime-state model.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class** | PIMCOMP names PIMFU/crossbar arrays; PIMSYN names macro/PE/crossbar hierarchy. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Bit-slicing / bit significance | **Parameter + backend lowering** | PIMCOMP uses logical arrays in the optimizer and records logical-to-physical mapping, then performs weight-bit splitting in the backend. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| ADC/DAC precision or sensing | **Parameter / first-class in PIMSYN IR** | PIMCOMP config includes DAC/ADC resolution/count; PIMSYN IR includes ADC and notes MVM involves DAC and S&H. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json)) |
| Analog-to-digital or domain transition | **Costed / represented through ADC/pseudo-instruction boundary** | PIMSYN has ADC IR and component allocation; PIMCOMP hardware abstraction includes analog crossbar plus ADC/DAC peripherals. ([ar5iv](https://ar5iv.org/abs/2402.18114)) |
| Peripheral circuits as path nodes | **First-class in PIMSYN; parameterized in PIMCOMP/PIMSIM** | PIMSYN macro includes ADC bank and ALU components; config names ADC, DAC, S&H, shift-adder, output-buffer latencies. ([ar5iv](https://ar5iv.org/abs/2402.18114)) |
| Partial-sum accumulation path | **Implicit / operation-level** | PIMCOMP AG scheduling includes accumulating partial sums between AGs; PIMSYN includes ALU and merge/transfer IRs. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Reconstruction / shift-add tree | **Parameterized / partly hard-coded** | PIMCOMP config has shift-adder latency; PIMSYN ALU supports shift-and-add. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json)) |
| Runtime state, masks, KV cache, batching, sparsity | **Partial runtime state; batching represented; KV cache/masks not applicable to demonstrated CNN/DNN inference** | HT batch and LL element modes are explicit; LL records pixel addresses, dependencies, and transmissions. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Value trajectory / flow path | **Approximated** | Value movement appears through load/store/send/recv, local/global memory, pixel dependencies, and transfer requests, but the central first-class object is mapping/schedule/instruction rather than value identity. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |

### 5.4 Axis D — rewrite object

The suite rewrites several objects:

- **Operator graph:** ONNX topology is parsed into JSON/structure IR; graph-level fusion and elimination are described in PIMCOMP. ([ar5iv](https://ar5iv.org/abs/2411.09159))
- **Weight layout / numeric lowering:** convolution weights are unfolded, partitioned into AGs, replicated, mapped, bit-split, and programmed into physical arrays. ([ar5iv](https://ar5iv.org/abs/2411.09159))
- **Hardware mapping:** AGs and replicas are bound to cores/macros; PIMCOMP’s GA optimizes replication and AG layout. ([ar5iv](https://ar5iv.org/abs/2411.09159))
- **Schedule:** HT and LL scheduling rewrite dependency/order into layer groups, convolution-operator tasks, pixel dependencies, transmission requests, and pseudo-instructions. ([ar5iv](https://ar5iv.org/abs/2411.09159))
- **Instruction stream:** PIMCOMP emits verification and simulation instruction files; PIMSIM consumes program instructions. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **Accuracy model:** PIMACC overlays nonideality parameters onto PIMCOMP mappings/instructions. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))

Legal transformations include graph-level fusion/elimination, valid convolution unfolding choices, AG partitioning, replication-factor changes, AG-to-core remapping, HT/LL pipeline selection, task allocation, memory reuse/allocation, instruction ordering/optimization, backend bit splitting, and nonideality injection. The main equivalences exploited are MVM equivalence after convolution unfolding, parallel AG execution for shared inputs, replicated weights as alternate compute sites, and dependency-preserving reordering under structural/data/synchronization constraints. The representation is especially well suited to static CNN/DNN inference mapping; expressing cross-operator analog partial-sum carry, delayed ADC conversion, or reconstruction/reduction fusion would likely require an additional value-trajectory abstraction attached to AG outputs, ADC stages, VFU operations, and memory/communication events.

## 6. Technical mechanism reading

### 6.1 Hardware abstraction as the compiler contract

PIMCOMP’s configurable architecture template contains chips, cores, PIMFUs, crossbar arrays, local/global memory, configurable interconnect, communication mechanism, and execution model. Table III’s pseudo-instructions form the software-hardware interface at core level: `mvm` targets a PIMFU/array group, `vec` targets VFU operations, memory operations move data between local/global memory, and `send`/`recv` represent inter-core communication. ([ar5iv](https://ar5iv.org/abs/2411.09159))

PIMSYN uses a related but synthesis-oriented macro/PE/crossbar hierarchy: macros contain scratchpad memory, PE array, ADC bank, ALUs, register files, and controller; PEs include input registers, DACs, crossbars, S&H units, and output multiplexers. This gives the architecture generator a richer component allocation problem than PIMCOMP’s compiler-facing abstraction. ([ar5iv](https://ar5iv.org/abs/2402.18114))

### 6.2 Frontend and model structure

PIMCOMP’s frontend supports ONNX models and separates **structure IR** from **weight data**. Structure IR stores network topology and layer parameters as a lightweight proxy for repeated optimizer iterations, while weights are kept separately for backend mapping. The frontend also performs graph-level optimizations such as layer fusion and elimination. ([ar5iv](https://ar5iv.org/abs/2411.09159))

The artifact confirms a practical frontend boundary: ONNX is converted to backend JSON containing node parameters and topological connections. The README also states that common model JSONs are pre-converted for direct backend use. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

### 6.3 Array group as the core compiler object

PIMCOMP’s central mapping object is the **array group (AG)**. After convolution weights are unfolded into weight matrices, each weight matrix is vertically partitioned according to crossbar height; each partition forms an AG containing one or more arrays. An AG physically corresponds to a set of crossbar arrays inside a core, shares identical inputs, can broadcast input data, and can be managed by the same `mvm` pseudo-instruction. ([ar5iv](https://ar5iv.org/abs/2411.09159))

This is the most corpus-relevant CIM object in PIMCOMP: it is not simply a tensor tile or hardware array. It is a combined **storage-compute-schedule unit** that carries weight layout, input sharing, mapping legality, and instruction-generation meaning.

### 6.4 Flexible unfolding, partitioning, and replication

PIMCOMP represents convolution unfolding by a tuple `(H, W, P)` describing the height/width of weight matrices and number of parallel weight matrices. Valid unfolding preserves weight element count and respects convolution accumulation rules. The compiler greedily selects unfolding schemes: HT mode prioritizes minimal computation cycles and lower data loading volume, while LL mode prioritizes minimal computation cycles and lower memory requirement. ([ar5iv](https://ar5iv.org/abs/2411.09159))

Weight replication and AG layout are optimized jointly. PIMCOMP uses a GA with value-position combined chromosome encoding; each gene’s value represents a number of AGs and its position represents a mapped core. The artifact’s backend pipeline also exposes weight replication, partitioning, hierarchy mapping, and optional GA as explicit pass-level stages. ([ar5iv](https://ar5iv.org/abs/2411.09159))

### 6.5 HT and LL scheduling

PIMCOMP has two pipeline modes. **HT mode** processes the DNN layer-by-layer and targets throughput for large/continuous batches. **LL mode** forwards outputs to consumers as soon as enough data is available and targets single-sample latency. ([ar5iv](https://ar5iv.org/abs/2411.09159))

In HT scheduling, PIMCOMP groups layers to reduce first-batch latency, executes layer groups in topological order, runs independent layers in parallel, and generates a saturated-state pipeline whose pseudo-instructions can be reused across batches. The `Run` method represents a convolution-operator task: read one sliding window, trigger AG computation, accumulate partial sums, optionally fuse activation, and store or retain output depending on local memory capacity. ([ar5iv](https://ar5iv.org/abs/2411.09159))

In LL scheduling, PIMCOMP maintains forward and backward dependency lists, pixel-AG dependencies, AG/core mapping info, runtime pixel-address records, and heap-based memory allocation. It caches transmission requests and triggers communication based on thresholds or traversal boundaries. ([ar5iv](https://ar5iv.org/abs/2411.09159))

### 6.6 Profiler and simulation feedback

PIMCOMP’s profiler builds timing axes for components and simulates instruction-level parallel execution while accounting for structural conflicts, data conflicts, and inter-core synchronization. If power data are supplied, it maps pseudo-instructions to components to obtain power/energy estimates and also records utilization, memory footprint, inter-core transmission, and memory access volume. ([ar5iv](https://ar5iv.org/abs/2411.09159))

PIMSIM-NN provides a separate ISA-based simulator. It classifies instructions into matrix, vector, transfer, and scalar types; assumes cores plus global memory; uses grouped crossbars for matrices spanning multiple arrays; and simulates a core with scalar, vector, matrix, and transfer units. ([ar5iv](https://ar5iv.org/abs/2402.18089))

### 6.7 PIMSYN synthesis and IR DAG

PIMSYN’s synthesis flow has four stages: weight duplication, dataflow compilation, macro partitioning, and component allocation. It integrates DSE through simulated annealing and evolution-style search, generating an IR-based dataflow DAG and evaluating performance. ([ar5iv](https://ar5iv.org/abs/2402.18114))

PIMSYN’s IR table is unusually useful for a CIM corpus because it explicitly names CIM-adjacent operations: MVM, ADC, ALU, load, store, merge, and transfer. MVM is noted as involving DAC and sample-hold because those analog operations cannot be separated into different control steps. ([ar5iv](https://ar5iv.org/abs/2402.18114))

### 6.8 Precision, bit-slicing, and nonidealities

PIMCOMP uses logical arrays in the optimizer to abstract arbitrary signed weight precision, records logical-to-physical mapping, and performs weight-bit splitting in the backend. ([ar5iv](https://ar5iv.org/abs/2411.09159)) Its config exposes concrete precision/peripheral knobs such as `dac_resolution`, `cell_precision`, `adc_resolution`, `adc_count`, and shift-adder latency. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json))

PIMACC extends the stack into accuracy simulation by configuring nonideal effects: cell precision, reference conductance, on/off ratio, bitline/wordline conductance, variation, and stuck-at-fault probabilities. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))

### 6.9 Demonstrated evaluation scope

PIMCOMP evaluates three architecture instantiations and four networks: vgg8/resnet18 on MNIST and resnet34/googlenet on ImageNet; weights are 16-bit fixed point; HT uses batch size 128 and LL uses batch size 1. ([ar5iv](https://ar5iv.org/abs/2411.09159)) It reports improvements over SongC, PUMA, and Polyhedral-style baselines in throughput, latency, and energy. ([ar5iv](https://ar5iv.org/abs/2411.09159)) PIMSYN evaluates AlexNet, VGG13, VGG16, MSRA, and ResNet18 with 16-bit quantization and reports comparisons against manually designed accelerators and Gibbon. ([ar5iv](https://ar5iv.org/abs/2402.18114))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Array group is the reusable compiler granularity

- **Observation:** PIMCOMP’s AG combines crossbar partitioning, input broadcast, mapping flexibility, and instruction control into one named unit. ([ar5iv](https://ar5iv.org/abs/2411.09159))  
- **Why it matters for CIM compiler/IR work:** AG is closer to a CIM-specific IR object than a generic tensor tile because it encodes both where weights live and how computation is triggered.  
- **Reusable lesson:** A future CIM IR could define a resource-typed “array group” object with layout, input-sharing, partial-sum, and instruction-lowering fields.

### Insight 2 — The pseudo-ISA is a practical backend contract

- **Observation:** PIMCOMP’s pseudo-instructions expose compute, vector, memory, and inter-core communication operations at core level. ([ar5iv](https://ar5iv.org/abs/2411.09159))  
- **Why it matters for CIM compiler/IR work:** The instruction boundary is narrow enough to wrap in a simulator, yet general enough to represent multiple accelerator templates.  
- **Reusable lesson:** A corpus entry should separate “paper IR” from “simulator ISA”; here the pseudo-ISA is the most stable integration point for backend experiments.

### Insight 3 — PIMSYN and PIMCOMP expose complementary hidden IRs

- **Observation:** PIMSYN’s IR DAG explicitly names MVM/ADC/ALU/load/store/merge/transfer operations, while PIMCOMP’s strongest middle layer is AG layout plus pseudo-instruction scheduling. ([ar5iv](https://ar5iv.org/abs/2402.18114))  
- **Why it matters for CIM compiler/IR work:** Architecture DSE and compiler scheduling require different object boundaries: component allocation benefits from ADC/ALU nodes, while deployment benefits from AG and core mapping objects.  
- **Reusable lesson:** A future public corpus can tag PIMSYN as “operation/component IR” and PIMCOMP as “mapping/instruction IR,” even though both belong to one toolchain family.

### Insight 4 — LL scheduling is a seed for runtime-state IR

- **Observation:** PIMCOMP’s LL mode maintains pixel dependencies, AG correspondence, runtime core addresses, memory allocation state, and transmission requests. ([ar5iv](https://ar5iv.org/abs/2411.09159))  
- **Why it matters for CIM compiler/IR work:** This is one of the suite’s clearest examples of state that is neither pure graph IR nor pure instruction stream.  
- **Reusable lesson:** Future CIM IRs could borrow this as a static-plus-runtime table model for values that move across cores and memories.

### Insight 5 — Nonideality configuration suggests numeric/physical type attributes

- **Observation:** PIMACC exposes cell precision, conductance, wire conductance, variation, and stuck-at probabilities as configurable fields. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))  
- **Why it matters for CIM compiler/IR work:** These parameters could become attributes on arrays, value trajectories, or numeric formats rather than a simulator-only side file.  
- **Reusable lesson:** Treat nonideality config as an accuracy-model plugin boundary, not just an experiment script.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifiers:** `chenxm1986/PIM-Toolchain`, `sunxt99/PIMCOMP-NN`, `lixixi-jook/PIMSYN-NN`, `wangxy-2000/pimsim-nn`, `HertzHan/PIMACC-simulator`. The umbrella repository links the four tool components. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))  
- **License:** PIMCOMP-NN, PIMSYN-NN, and PIMACC list Apache-2.0 license in their READMEs/repository metadata. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) I did not find a license statement in the checked umbrella PIM-Toolchain README, and the checked pimsim-nn README/repository listing did not expose a license field. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** PIMCOMP-NN includes frontend/backend/evaluation/verification/model/output directories and can save evaluation, verification, intermediate, and simulation outputs; PIMSYN-NN includes Python DSE/synthesis scripts and output JSON generation; PIMSIM-NN includes C++/SystemC-style simulator code, examples, configs, and `ChipTest`; PIMACC includes PIMCOMP-derived compiler code, verification scripts, models/datasets, and nonideality configuration. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))  
- **What the artifact appears to omit:** A single formally specified suite-wide IR schema is not visible in the checked READMEs. The reusable interfaces are distributed across ONNX/JSON, config files, AG/mapping data structures, verification/simulation instruction outputs, and simulator inputs.  
- **Minimal documented workflows:** PIMCOMP: run ONNX frontend, build backend with CMake, then compile with flags such as `-m`, `-r`, `-p`, `-v`, `-i`, `-s`. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) PIMSYN: run `main.py` with network/ONNX path, total power, config, output, and PIMCOMP-output path. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN)) PIMSIM: build with CMake and run `ChipTest` with instruction and architecture config files. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) PIMACC: first generate `VerificationInfo.json` with PIMCOMP, then run `verification.py` for accuracy simulation. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))  
- **Whether paper figures appear reproducible from the artifact:** **Partial / Unknown.** Example models, configs, outputs, and commands are documented, but I did not find a single documented script that claims to regenerate all paper figures.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Yes | ONNX and backend JSON are documented for PIMCOMP/PIMSYN. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Intermediate representation serialized | Partial | JSON and `IntermediateInfo.json` are documented, but a suite-wide IR schema is not found in checked sources. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Mapping decisions inspectable | Partial | PIMCOMP can save intermediate information and mapping is a named backend stage; exact schema needs artifact inspection. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/raw/refs/heads/master/main.cpp)) |
| Schedule inspectable | Partial | Verification/simulation instruction outputs are saved; HT/LL algorithms are described. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Hardware config explicit | Yes | PIMCOMP and PIMSIM use explicit architecture configs; PIMSYN uses `config.json`. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN/blob/master/config.json)) |
| Precision / bit-slice assumptions explicit | Partial | Cell precision, ADC/DAC resolution, logical/physical arrays, and backend bit splitting are explicit; full propagation is distributed. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Cost model inspectable | Partial | PIMCOMP profiler and PIMSYN equations/DSE are described; code-level formulas require artifact inspection. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |
| Simulator backend documented | Yes | PIMSIM inputs and example command are documented. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Generated code / instruction stream inspectable | Partial | `VerificationInfo.json` and `SimulationInfo.gz` are documented; human readability varies by file. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Provenance from source op to backend action | Partial | ONNX topology, structure IR, AG mapping, and instructions are documented, but end-to-end provenance schema is not found in checked sources. |
| Reproduction scripts available | Partial | Commands and examples exist for PIMCOMP/PIMSYN/PIMSIM/PIMACC; full paper-figure reproduction workflow is not found in checked sources. |
| Calibration source documented | Partial | PIMCOMP cites CACTI/Orion and literature power data in the paper; PIMACC exposes nonideality parameters, but calibration datasets/sources are only partly visible. ([ar5iv](https://ar5iv.org/abs/2411.09159)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible through ONNX-to-JSON conversion and PIMCOMP’s model parser. Integration would need adapters for supported operators and model assumptions. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))  
- **As IR inspiration:** The strongest IR ideas are AGs, PIMSYN’s MVM/ADC/ALU/communication IRs, PIMCOMP pseudo-instructions, and LL runtime dependency records.  
- **As mapper/scheduler:** PIMCOMP’s AG partitioning, weight replication, GA-based layout, HT layer grouping, and LL pixel dependency scheduler are the most reusable compiler mechanisms.  
- **As cost model:** PIMCOMP’s profiler and PIMSYN’s DSE/cycle behavior simulator can inform backend plugins for latency, power, utilization, memory access, and communication. ([ar5iv](https://ar5iv.org/abs/2411.09159))  
- **As backend:** PIMSIM is the most direct backend wrapper because it consumes program instruction and architecture configuration files. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))  
- **As benchmark:** Reuse can target the documented models and scenarios: PIMCOMP’s vgg8/resnet18/resnet34/googlenet experiments and PIMSYN’s AlexNet/VGG/MSRA/ResNet-style CNN benchmarks. ([ar5iv](https://ar5iv.org/abs/2411.09159))  
- **As validation source:** PIMACC is useful for accuracy/nonideality validation; PIMSIM is useful for performance simulation. No real-chip calibration evidence was found in the checked sources.

**Integration effort estimate: Medium.** Integration would be most direct through PIMCOMP’s JSON/config/instruction outputs and PIMSIM’s instruction/config simulator interface. Reuse would benefit from a small adapter that extracts AG layout, pseudo-instructions, hardware config, and provenance into a stable schema. Deeper reuse of LL runtime state or PIMSYN component allocation would require aligning internal data structures with a public IR.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PUMA** | PIM ISA/compiler and memristor DNN acceleration | PIMCOMP positions itself as a configurable compiler over an abstract template and criticizes fixed/architecture-specific ISA boundaries; PIMSIM also uses PUMA as a comparison point. ([ar5iv](https://ar5iv.org/abs/2307.01475)) | Useful baseline for “ISA compiler stack,” but PIM EDA is broader because it adds synthesis/simulation/accuracy pieces. |
| **SongC / Polyhedral-style mapping** | Mapping and scheduling for PIM DNN inference | PIMCOMP compares against these as scheduling/resource-allocation styles and emphasizes AG-level mapping plus convolution-operator scheduling. ([ar5iv](https://ar5iv.org/abs/2411.09159)) | Good comparison for Axis D rewrite object: layer/block mapping versus AG/task/instruction mapping. |
| **MNSIM2.0** | Behavior/system-level PIM simulation | PIMSIM’s claimed distinction is ISA-based software/hardware decoupling and more explicit communication/synchronization modeling. ([ar5iv](https://ar5iv.org/abs/2402.18089)) | Good simulator baseline; corpus note should distinguish dataflow simulator from instruction/config simulator. |
| **Gibbon** | Architecture/model co-exploration | PIMSYN compares against Gibbon but uses fixed/trained CNNs as input and synthesizes PIM architecture/dataflow under power constraints. ([ar5iv](https://ar5iv.org/abs/2402.18114)) | Useful comparison for A1/A3 DSE scope; PIMSYN is architecture synthesis rather than model search. |
| **ISAAC / PipeLayer / PRIME / AtomLayer** | Crossbar/RRAM CNN accelerator architecture | PIMSYN uses these as manually designed accelerator baselines; they are closer to hardware architecture than compiler IR. ([ar5iv](https://ar5iv.org/abs/2402.18114)) | Helps classify PIM EDA as a toolchain around hardware templates, not just a new accelerator microarchitecture. |
| **PIMACC-adjacent accuracy simulators** | Nonideality and accuracy under analog CIM effects | PIMACC’s distinguishing public boundary is coupling PIMCOMP mappings/instructions with configurable nonideal effects. ([GitHub](https://github.com/HertzHan/PIMACC-simulator)) | Useful for corpus tags involving accuracy/nonideality modeling, even when compiler IR is mapping-centric. |

## 10. Corpus-ready final takeaway

- PIM EDA Suite is a public crossbar-PIM CNN/DNN inference toolchain family, not a single monolithic IR paper.
- The strongest reusable compiler layer is PIMCOMP’s AG-based mapping/scheduling pipeline from ONNX-derived JSON to pseudo-instructions and simulator inputs.
- The suite’s first-class CIM objects include crossbars, array groups, cores/PIMFUs, macro/PE/crossbar hierarchy, ADC/DAC/cell precision fields, local/global memory, NoC, replication factors, and instruction streams.
- The effective hidden IR is distributed across structure IR, weight data, hardware config, AG partition/mapping state, HT/LL schedule records, and generated verification/simulation files.
- PIMSYN contributes a more explicit operation/component IR DAG for synthesis, including MVM, ADC, ALU, load/store, merge, and transfer nodes.
- PIMSIM and PIMACC make the backend boundary auditable through program instructions/config files and nonideality configuration.
- Artifact status is public and partial-to-good for experimentation: multiple repos, documented commands, examples, and Apache-2.0 for several components; full paper-figure reproduction scripts are not clearly documented in checked sources.
- For value-trajectory IR work, PIM EDA provides strong ingredients but would benefit from an added abstraction that preserves value identity, domain transitions, bit significance, accumulation/reconstruction state, and peripheral path choices across lowering.
