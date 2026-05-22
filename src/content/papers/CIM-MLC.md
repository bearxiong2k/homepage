---
slug: cim-mlc
title: "CIM-MLC: A Multi-level Compilation Stack for Computing-In-Memory Accelerators"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "ASPLOS 2024, Volume 2"
authors_or_group: "Songyun Qu, Shixin Zhao, Bing Li, Yintao He, Xuyi Cai, Lei Zhang, Ying Wang"
summary: >-
  CIM-MLC is a CIM compiler/mapping framework that contributes a three-tier hardware abstraction and a matching three-level scheduling pipeline for static DNN inference. Its main abstraction separates **architecture parameters**—chip, core, crossbar, buffer, NoC, ALU, cell precision, ADC/DAC precision—from **computing modes**—Core Mode, Crossbar Mode, and Wordline Mode—so that a compiler can select scheduling strategies at DNN-operator, MVM, or row-activation granularity. The demonstrated stack ingests ONNX graphs, records mapping decisions as graph attributes, performs graph segmentation, duplication, MVM-level pipelining, and WLM data remapping, then emits meta-operator flows for simulator-backed evaluation. For CIM compiler/IR research, CIM-MLC is valuable because it makes hardware-resource granularity explicit and provides a concrete meta-op backend boundary, while also illustrating a common “hidden IR” pattern: much of the reusable semantics sits in ONNX annotations, Python configs, optimization pass order, and codegen templates rather than in a single independently verifiable IR object. ([ar5iv](https://ar5iv.org/html/2401.12428v2))
links:
  paper: https://ar5iv.org/html/2401.12428v2
  artifact: https://github.com/Zhaoshixin-sky/CIM-MLC
  docs:
  code:
technology:
  - "analog-CIM"
  - "SRAM-CIM"
  - "RRAM-CIM"
  - "hybrid"
workloads:
  - "static DNN inference"
  - "CNN"
  - "VGG"
  - "ResNet"
  - "ViT"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A4, A5]
axis_B: [B2, B4, B5, B1]
axis_C_first_class_objects:
  - "chip/core/crossbar hierarchy"
  - "Core Mode / Crossbar Mode / Wordline Mode"
  - "VXB / virtual crossbar"
  - "crossbar size"
  - "maximum parallel rows"
  - "memory-cell type and precision"
  - "ADC/DAC precision"
  - "NoC and buffer parameters"
  - "ALU support and speed"
  - "meta-operator set"
axis_D_rewrite_objects:
  - "ONNX graph annotations"
  - "graph segmentation"
  - "operator duplication"
  - "MVM lowering and scheduling"
  - "VXB/crossbar binding"
  - "row/wordline remapping"
  - "meta-operator flow"
artifact:
  status: "public artifact found; partial/beta"
  url: "https://github.com/Zhaoshixin-sky/CIM-MLC"
  license: "unknown/not found for main compiler repo; separate project-page repo is BSD-2-Clause"
  last_checked: "2026-05-14"
integration_roles:
  - "frontend"
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
reproducibility_level: medium
notes:
  - "Best used as a resource-granularity and meta-op compiler baseline."
  - "The reusable abstraction is clearest at Abs-arch/Abs-com and VXB."
  - "The effective IR is distributed across ONNX attributes, Python configs, pass state, and codegen output."
  - "Trajectory-level CIM IR would add typed value identity across bit slicing, conversion, accumulation, reconstruction, and storage."
takeaways: []
---

# CIM-MLC — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework** | CIM-MLC’s central object is a multi-level mapping/scheduling process from ONNX DNN operators to core-, crossbar-, and wordline-grained meta-operator flows. This matches the taxonomy’s A3 family, where the first-class artifact is “tensor tiles, loop nests, layer partitions, array bindings, replication choices,” and CIM-MLC is explicitly listed in that cluster. (CIM taxonomy.md) |
| Secondary stack role, Axis A | **A4 + A5 hybrid** | It has A4 traits because it defines hardware-resource abstractions and meta-operator output; it has A5 traits because the demonstrated flow is a narrow ONNX-DNN-to-CIM evaluation stack rather than a general compiler infrastructure. The paper claims a universal framework for general CIM architectures, but the evidence is concentrated in DNN inference scheduling across selected templates. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) (CIM stack library compact.md) |
| Middle-layer style, Axis B | **B2 Graph-as-IR; B4 Hardware-resource IR; B5 Meta-op / ILA; B1 Config-as-IR traits** | The paper starts from ONNX computation graphs, exposes chip/core/crossbar tiers plus CM/XBM/WLM modes, and emits meta-operator flows. The artifact also makes Python architecture configs and code templates a practical semantic boundary. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| First-class CIM objects, Axis C | **Chip/core/crossbar hierarchy; VXB; core/crossbar/wordline modes; crossbar size; row activation limit; memory-cell type/precision; ADC/DAC precision; NoC/buffer/ALU parameters; meta-operators** | These objects are named in the paper’s Abs-arch / Abs-com description and exposed in the artifact’s `configs` folder. VXB and dimension binding are especially important because they make crossbar collaboration and bit-width placement visible to scheduling. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Rewrite object, Axis D | **Graph segmentation, operator duplication, pipeline schedule, MVM mapping, VXB binding, row/wordline remapping, meta-operator stream** | The compiler records optimization attributes in the ONNX graph, computes duplication and segmentation, lowers convolution to MVMs, updates crossbar-level duplication/pipeline choices, and applies WLM row remapping before emitting meta-operators. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Best corpus tags | `compiler-mapping`, `hidden-stack`, `hardware-abstraction`, `meta-operator`, `ONNX`, `DNN-inference`, `analog-CIM`, `SRAM-CIM`, `RRAM-CIM`, `multi-level-scheduling` | The paper and artifact are most useful for classifying CIM compiler middle layers, not device physics. The taxonomy’s framing asks what the stack names, types, rewrites, and hands to the backend, which is exactly where CIM-MLC is informative. (CIM taxonomy.md) |
| Closest comparison baselines | **PIMCOMP, CIMFlow, CMSwitch, PIMSYN-NN, CINM/Cinnamon, Polyhedral-based CIM compiler** | PIMCOMP and CIMFlow are close because they lower ONNX-style DNNs toward instruction/simulator interfaces; CMSwitch is close because it extends CIM-MLC-like meta-operator scheduling with dual-mode array decisions; CINM is close as an explicit IR-stack baseline; Polyhedral-based CIM is the paper’s direct compiler comparison. (CIM stack library compact.md) ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |

## 2. One-paragraph public summary

CIM-MLC is a CIM compiler/mapping framework that contributes a three-tier hardware abstraction and a matching three-level scheduling pipeline for static DNN inference. Its main abstraction separates **architecture parameters**—chip, core, crossbar, buffer, NoC, ALU, cell precision, ADC/DAC precision—from **computing modes**—Core Mode, Crossbar Mode, and Wordline Mode—so that a compiler can select scheduling strategies at DNN-operator, MVM, or row-activation granularity. The demonstrated stack ingests ONNX graphs, records mapping decisions as graph attributes, performs graph segmentation, duplication, MVM-level pipelining, and WLM data remapping, then emits meta-operator flows for simulator-backed evaluation. For CIM compiler/IR research, CIM-MLC is valuable because it makes hardware-resource granularity explicit and provides a concrete meta-op backend boundary, while also illustrating a common “hidden IR” pattern: much of the reusable semantics sits in ONNX annotations, Python configs, optimization pass order, and codegen templates rather than in a single independently verifiable IR object. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “Universal multi-level compilation framework for general CIM architectures” | Abstract / Introduction | Paper claim + experiment + artifact | The paper defines Abs-arch and Abs-com, with chip/core/crossbar hierarchy and CM/XBM/WLM computing modes; it evaluates three prior CIM accelerators with different devices, hierarchies, and programming interfaces. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | Demonstrated for static DNN inference over selected CIM accelerator templates. The reusable boundary is clearest at architecture configs plus meta-operator codegen, not at a formal universal IR. |
| “General hardware abstraction for CIM architectures and computing modes” | Section 3.2, Figures 4–8 | Abstraction + artifact config | The paper names chip/core/crossbar tiers, CM/XBM/WLM modes, VXB, row activation, device type/precision, ADC/DAC precision, NoC, buffer, and ALU parameters. The artifact exposes related parameters in `configs/README.md` and `architecture.py`. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | The abstraction is concrete for resource and scheduling parameters. Semantic value trajectory, reconstruction path, analog/digital boundary identity, and provenance-rich type information are not represented as a separate serialized object in the checked artifact. |
| “Multi-level scheduling across architectural tiers” | Section 3.3 | Algorithm / pass description + code | The paper describes CG-, MVM-, and VVM-grained scheduling for CM, XBM, and WLM. The artifact `main.py` implements a pass order: core virtual mapping, core-wise duplication, core-wise pipeline, address generation, core codegen, crossbar duplication/codegen, row-wise pipeline, and row-wise codegen. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | Strongly evidenced as a mapping/scheduling pipeline. The artifact exposes the pass order, while deeper legality and equivalence checks appear embedded in Python routines and graph attributes. |
| “Meta-operator set represents CIM computation process” | Sections 3.2–3.4, Figures 10–16 | Codegen description + output examples | The paper defines MOP_CM, MOP_XBM, and MOP_WLM to describe hardware activation at different tiers. The repository includes codegen modules for CoreWise, CrossbarWise, and WordlineWise codegen and output examples for CG-, MVM-, and VVM-grained instruction files. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | Meta-operators are evidenced as backend-facing traces or codegen outputs. They are closest to a backend contract, but not shown as a rich upstream IR with verifier, schema, or stable provenance contract. |
| “Better scheduling and instruction generation results” | Abstract, Section 4 | Experiment | The paper reports average inference speedup over prior CIM-oriented compilation work, compares with Poly-Schedule, evaluates VGG/ResNet/ViT-style models on ImageNet with 8-bit weights/activations, and studies architecture parameters such as core number, crossbar number, crossbar size, and parallel rows. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | The paper-level evidence supports simulator-backed latency/power trends for selected DNNs and architecture templates. Artifact-level reproduction of all figures is not clearly documented in the checked repository. |
| “Can be middleware between neural network models and CIM hardware” | Conclusion | Paper-only + partial artifact | The artifact accepts ONNX models, architecture config modules, input feature-map size, input/weight precision, and emits meta-operator flow files. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | The demonstrated middleware path is ONNX-centered and Python-config-driven. Further reuse would benefit from a stable schema for configs, intermediate states, and generated meta-operator provenance. |
| “Open-source release” | GitHub / project page | Code/artifact | A public GitHub repository exists with folders for `codegen`, `configs`, `model`, `onnx_model`, `optimization`, `output`, `simulator`, and `utils`; the README gives a minimal command. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC)) | Artifact status is partial/beta: the README states the repository is “just a beta version” and that complete compilation tools and model testing results would be released later. No packaged releases are published. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC)) |

## 4. Stack anatomy

```text
Input / frontend:
ONNX-formatted neural-network graph, plus input feature-map size and precision arguments. The graph is explicit and serialized as ONNX; the artifact includes `onnx_model/conv.onnx` and uses ONNX runtime-related dependencies. The paper describes ONNX nodes as operators and edges as data dependencies. Inspectability is partial: the source graph is inspectable, but pass-added attributes become the de facto compiler state. 
```

Citations: ([ar5iv](https://ar5iv.org/html/2401.12428v2))

```text
Middle representation:
A combination of ONNX graph attributes, architecture configuration Python modules, CIM architecture objects, pass-local Python structures, and meta-operator codegen templates. The paper names Abs-arch and Abs-com, while the artifact exposes them as Python data structures rather than as a standalone IR schema.
```

Citations: ([ar5iv](https://ar5iv.org/html/2401.12428v2))

```text
Mapping or scheduling state:
CG-grained graph segmentation and operator duplication; XBM MVM-grained duplication and pipeline; WLM row/wordline remapping and pipeline. In the artifact, `main.py` shows these as ordered passes and writes generated outputs to files when `output_dir` is supplied.
```

Citations: ([ar5iv](https://ar5iv.org/html/2401.12428v2))

```text
Hardware abstraction:
Chip tier: cores, NoC, global buffer, ALU. Core tier: crossbars, local buffer, crossbar NoC, ALU. Crossbar/device tier: crossbar shape, maximum parallel rows, device type, cell precision, ADC/DAC precision. The paper describes three architecture tiers, while the artifact’s config README says the code models four tiers: chip, core, crossbar, and device.
```

Citations: ([ar5iv](https://ar5iv.org/html/2401.12428v2))

```text
Backend / simulator / codegen:
CoreWise, CrossbarWise, and WordlineWise codegen modules emit meta-operator flows. The paper says a Python functional simulator verifies meta-operator execution traces and that an extended simulator based on prior open-source simulators evaluates latency and power.
```

Citations: ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC))

```text
Output artifact:
Meta-operator flow / instruction-like text outputs. The artifact includes example files for `MLP_CG_grained_inst.txt`, `MLP_MVM_grained_inst.txt`, and `MLP_VVM_grained_inst.txt`.
```

Citation: ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/tree/main/output))

```text
Evaluation loop:
Simulator-backed latency and power evaluation over DNN benchmarks and selected CIM architecture baselines, including VGG, ResNet, and ViT-style models, with weights and activations quantized to 8-bit precision in the reported network benchmark setup.
```

Citation: ([ar5iv](https://ar5iv.org/html/2401.12428v2))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of ONNX graph annotations, architecture Python config, CIM object construction, pass ordering in `main.py`, optimization modules, address-generation state, and tier-specific codegen templates. The taxonomy explicitly names this pattern for CIM-MLC: the paper foregrounds Abs-arch, Abs-com, and meta-operator flow, while the working semantics live in mutated ONNX attributes, pass order, and operator-specific virtual mapping routines. (CIM taxonomy.md)

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.** CIM-MLC owns the compiler middle: it takes a static ONNX DNN graph and hardware parameters, chooses segmentation, duplication, mapping, pipelining, and row remapping, then emits tier-specific meta-operator flows. This aligns with the taxonomy’s A3 cluster, where the rewritten object is mapping rather than value trajectory. (CIM taxonomy.md)

**Secondary: A4 — Explicit IR / dialect / ISA compiler-stack traits.** CIM-MLC has A4-like features because it names a hardware-resource abstraction and meta-operator output, and the taxonomy lists it among explicit IR / ISA-style compiler-stack baselines. The important qualification is that the explicit boundary is more instruction/meta-op-like than IR-like in the verifier/provenance sense. (CIM taxonomy.md)

**Tertiary: A5 — Narrow end-to-end co-design flow.** The paper and artifact show a vertical path from ONNX to meta-operator traces to simulator-backed evaluation. The demonstrated scope is static DNN inference on selected accelerator templates, not a broad general-purpose infrastructure stack. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

### 5.2 Axis B — middle-layer style

**B2 — Graph-as-IR.**  
The named upstream representation is ONNX: nodes are operators and edges are dependencies. Decisions made here include graph segmentation, core-mode operator duplication, and inter-operator pipeline decisions. The paper says optimization information is recorded by adding attributes to ONNX nodes, such as duplication. A single upstream-readable IR is partial: ONNX is readable, but the CIM-specific semantics are annotations and pass state rather than an independent schema. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

**B4 — Hardware-resource IR.**  
The named middle representation is the Abs-arch / Abs-com abstraction: chip/core/crossbar tiers and CM/XBM/WLM modes. Decisions made here include core allocation, VXB construction, crossbar binding, row activation, and resource-aware scheduling. Decisions still embedded in search/codegen include exact layout, address generation, cycle-record propagation, and generated meta-op formatting. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

**B5 — Instruction / meta-op / ILA.**  
The named backend representation is a meta-operator flow. Decisions made there include hardware activation at CM, XBM, and WLM levels, plus digital compute and data movement meta-operators. This is useful for simulator coupling and backend wrapping, but the taxonomy warns that instruction/meta-op boundaries can be too low-level for upstream rewrites once high-level equivalences have been lowered away. (CIM taxonomy.md)

**B1 — Config-as-IR traits.**  
The artifact’s architecture config modules define the hardware target, and the `configs/README.md` documents parameters such as API mode, core count, NoC, buffers, crossbar number, crossbar size, parallel rows, device type, and precision. The representation is reusable as configuration, but several semantics remain coupled to Python object constructors and pass implementations. ([GitHub](https://raw.githubusercontent.com/Zhaoshixin-sky/CIM-MLC/main/configs/README.md))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class resource hierarchy** | Chip, core, and crossbar tiers are named in Section 3.2; the artifact’s architecture config constructs chip, core, crossbar, and device objects. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Bit-slicing / bit significance | **Parameter / layout binding, partially first-class through VXB dimension binding** | The paper introduces VXB and dimension binding, including binding matrix bit-width `B` to crossbar columns or different crossbars. This exposes bit placement enough for scheduling, but not as a typed value-flow object. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| ADC/DAC precision or sensing | **Parameter** | Crossbar-tier parameters include ADC and DAC precision, and the paper says they influence computation accuracy and latency. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Analog-to-digital or domain transition | **Costed / parameterized, not trajectory-first** | ADC/DAC are represented as precision parameters and simulator costs, while the path identity across analog readout, conversion, and digital accumulation is not presented as a standalone compiler object. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Peripheral circuits as path nodes | **Parameter / implicit** | The paper names peripheral circuits such as wordline drivers, bitline drivers, ADC, and DAC at the crossbar tier, but schedules rows/crossbars rather than explicit peripheral path nodes. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Partial-sum accumulation path | **Implicit / codegen-specific** | Shift-accumulate appears as an ALU-supported CIM-specific operation, and WLM examples discuss accumulation of row outputs, but partial-sum identity across a multi-stage path is not represented as a first-class IR object. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Reconstruction / shift-add tree | **Hard-coded or implicit** | The paper mentions shift-accumulate in the ALU context; the checked sources do not expose a serialized reconstruction tree abstraction. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly not applicable to demonstrated scope** | The demonstrated workload setting is static DNN inference over VGG/ResNet/ViT-style models; runtime serving state such as KV cache or batching is outside the paper’s evidenced scope. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Value trajectory / flow path | **Approximated by meta-operator flow, not first-class** | The taxonomy identifies CIM-MLC’s meta-operator flow as the closest approximation “in name,” but a textual codegen output rather than an upstream value-trajectory IR. (CIM taxonomy.md) |

### 5.4 Axis D — rewrite object

CIM-MLC rewrites **operator graph mapping**, **operator duplication**, **graph segmentation**, **MVM scheduling**, **crossbar/VXB binding**, **wordline/row mapping**, and **meta-operator emission**. It also rewrites physical placement at the mapping level: for WLM, the data remapping strategy distributes data contributing to the same computation across different crossbars so rows can be activated concurrently. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

The legal transformations in the paper are scheduling-preserving transformations for DNN inference: duplicating operators subject to core constraints, segmenting graphs when model capacity exceeds CIM resources, lowering convolution to MVM sequences, staggering crossbar activation to reduce peak power, and remapping rows for finer WLM pipelining. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

The exploited equivalences are mostly **parallelism and placement equivalences**: duplicating operators over cores preserves the operator’s computation while increasing throughput; crossbar-level pipelining preserves MVM computation while changing activation timing; WLM remapping preserves the logical accumulation while changing row/crossbar placement. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

The representation is especially well suited to resource-aware lowering from static DNN graphs to tiered CIM hardware activation. Expressing value-trajectory rewrites—such as reconstruction fusion, ADC retiming, or carrying bit-sliced partial sums across operator boundaries—would likely require an additional abstraction that attaches domain, precision stage, bit significance, accumulation identity, and route information to values rather than only to resources or emitted meta-operators. This follows the taxonomy’s broader finding that current stacks generally derive dataflow from mapping rather than make value trajectory the typed rewrite object. (CIM taxonomy.md)

## 6. Technical mechanism reading

### 6.1 Hardware abstraction: Abs-arch + Abs-com

CIM-MLC’s core mechanism is the pairing of a **hardware-resource abstraction** and a **computing-mode abstraction**. Abs-arch models CIM accelerators at chip, core, and crossbar tiers. Abs-com models the programming granularity exposed by the architecture: **Core Mode** for DNN-operator-level scheduling, **Crossbar Mode** for MVM-level scheduling, and **Wordline Mode** for row-level scheduling. The paper states that architecture tiers and computing modes maintain a one-to-one correspondence, so the available programming interface determines what parameters and scheduling choices are exposed to the compiler. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

At the chip tier, the compiler sees core count, global buffer, ALU support/speed, NoC type/cost, and buffer bandwidth. At the core tier, it sees crossbar count, local buffer, crossbar NoC, and core-local digital units. At the crossbar tier, it sees crossbar size, maximum concurrently activated rows, device type and precision, and ADC/DAC precision. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

The artifact mirrors this as Python configuration and object construction: `configs/README.md` lists API mode, core/crossbar counts, NoC, buffers, crossbar size, maximum row activation count, device type, and precision; `architecture.py` constructs `ChipLevel`, `CoreLevel`, `XBLevel`, and `DeviceLevel` objects from `ArchTem`. ([GitHub](https://raw.githubusercontent.com/Zhaoshixin-sky/CIM-MLC/main/configs/README.md))

### 6.2 VXB and dimension binding

The most CIM-specific abstraction is **VXB, Virtual Crossbar**. Instead of treating a physical crossbar as the only scheduling unit, CIM-MLC constructs VXBs by binding matrix dimensions—row, column, bit-width—to crossbar dimensions—crossbar, row, column. The paper’s example states that matrix bit-width can be spread across adjacent columns or across different crossbars. This is a useful compiler-facing handle for bit placement and crossbar collaboration, even though it remains resource-centered rather than value-trajectory-centered. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

### 6.3 CG-grained scheduling

For CM architectures, CIM-MLC performs computation-graph-grained scheduling. The paper describes graph segmentation and operator duplication under the `core_number` constraint. It uses dynamic programming to search duplication numbers and adjusts them to avoid pipeline stalls under NoC, buffer bandwidth, and ALU constraints. Optimization information is recorded by adding attributes to ONNX graph nodes. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

In the artifact, this stage appears as `CoreVirtualMapping`, `CoreWiseDuper`, `CoreWisePipeline`, address generation, and `CoreWiseCodegen` in `main.py`. The code comments explicitly identify “PASS 1 Core-Wise Virtual Mapping,” “PASS 2 Core-Wise Duplication,” and core-wise code generation. ([GitHub](https://raw.githubusercontent.com/Zhaoshixin-sky/CIM-MLC/main/main.py))

### 6.4 MVM-grained scheduling

For XBM architectures, CIM-MLC unrolls supported operators into MVMs, maps MVMs to VXBs/crossbars, and explores operator duplication plus MVM-grained pipeline scheduling. The paper’s key scheduling idea is to stagger crossbar activation: instead of waiting for all crossbars required by a logical MVM to receive input, the scheduler activates a crossbar as soon as its input arrives. The paper reports that this reduces the peak number of simultaneously activated VXBs in its example and lowers peak power. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

In the artifact, this stage is represented by `CrossbarWiseDup`, `crossbarwise_updata_dup`, and `CrossbarWiseCodegen`, gated by whether the architecture API is `Crossbar` or `Wordline`. ([GitHub](https://raw.githubusercontent.com/Zhaoshixin-sky/CIM-MLC/main/main.py))

### 6.5 VVM / WLM scheduling

For WLM architectures, CIM-MLC performs row-level data remapping. The paper’s mechanism distributes rows contributing to the same computation across different crossbars so the allowed number of parallel rows can be used more effectively. In the example, this lets two portions of a computation complete in one cycle rather than two and enables the downstream operator to start earlier. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

The artifact has `WordlineRemap.py`, `WordlineWise.py`, and `WordlineCodeTem.py`, and `main.py` invokes `RowWisePipeline` and `RCWiseCodegen` when the architecture API is `Wordline`. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/tree/main/optimization))

### 6.6 Cost model and simulator assumptions

The paper says it uses a Python functional simulator to verify scheduling results as meta-operator execution traces and extends open-source simulator components from prior works, including PUMA, NeuroSim, and NVSim, to evaluate cycle and power for meta-operator flows. It also notes idealized parameters: for the ISAAC-like baseline, parameters not elaborated are considered ideal; for example, sufficient buffer bandwidth can hide load/store time within computation time. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

This matters for corpus classification: CIM-MLC’s strongest evidence is not cycle-accurate silicon validation but simulator-backed comparison over abstractions and selected architecture parameters.

### 6.7 Workload and precision assumptions

The reported network benchmarks include VGG, ResNet, and ViT-style models; weights and activations are quantized to 8-bit precision and tested on ImageNet. The architecture baseline uses RRAM/2-bit cells with 1-bit DAC and 8-bit ADC in Table 3. ([ar5iv](https://ar5iv.org/html/2401.12428v2))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The three computing modes are a useful “granularity contract”

- **Observation:** CM, XBM, and WLM are not simply labels; they define what scheduling unit the compiler is allowed to control: DNN operators, MVMs, or rows. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **Why it matters for CIM compiler/IR work:** This is a practical way to separate architecture capability from compiler pass selection. A future IR could encode “legal control granularity” as a target capability instead of hard-coding it in pass order.  
- **Reusable lesson:** Keep hardware resource hierarchy and exposed programming granularity separate, then bind them through target capabilities.

### Insight 2 — VXB is a strong resource abstraction but not yet a value abstraction

- **Observation:** VXB and dimension binding expose how matrix dimensions and bit-width map onto crossbar rows, columns, and multiple crossbars. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **Why it matters for CIM compiler/IR work:** This is close to the missing type-level representation of bit significance and placement. It gives a future IR an anchor for attaching value metadata such as bit lane, significance offset, and reconstruction obligation.  
- **Reusable lesson:** Treat VXB as a hardware-resource layer, then add value-trajectory annotations on top of VXB bindings.

### Insight 3 — The ONNX graph becomes a mutable scheduling ledger

- **Observation:** The paper states that optimization information is recorded by adding attributes to ONNX graph nodes, and the artifact’s pass order depends on those annotations. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **Why it matters for CIM compiler/IR work:** This is an efficient engineering path, but it makes the compiler state a blend of source graph, mapping metadata, and pass-local assumptions.  
- **Reusable lesson:** A future stack could extract those annotations into a serialized mapping-state artifact with schema, verifier, and provenance from source op to backend action.

### Insight 4 — WLM remapping is the paper’s most trajectory-like mechanism

- **Observation:** In WLM, data contributing to the same computation is redistributed across crossbars to enable more concurrent row activation and earlier downstream execution. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **Why it matters for CIM compiler/IR work:** This is a concrete example where physical placement and accumulation timing change while preserving computation. It approaches trajectory reasoning because it changes when partial contributions become available.  
- **Reusable lesson:** Row-remapping legality could become a trajectory rewrite rule if partial-sum identity, row group, accumulation stage, and downstream consumer readiness were typed.

### Insight 5 — The meta-operator flow is a useful backend boundary

- **Observation:** CIM-MLC emits CM/XBM/WLM meta-operator flows and uses them as simulator traces. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **Why it matters for CIM compiler/IR work:** Meta-ops are concrete enough to run through simulators and backend adapters, but too late for many upstream transformations.  
- **Reusable lesson:** Keep meta-ops as a backend lowering target, but introduce a higher-level IR layer that can still express fusion, retiming, reconstruction, and domain-transition rewrites before meta-op emission.

### Insight 6 — The beta artifact reveals the real integration boundary

- **Observation:** The README documents dependencies, folder structure, architecture configs, ONNX input, and a minimal compilation command, while also stating that the repository is a beta version and complete tools/results would be released later. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/blob/main/README.md))  
- **Why it matters for CIM compiler/IR work:** The reusable interface is clearest at `configs`, `optimization`, `codegen`, and `output`; figure-level reproducibility and backend calibration are less directly exposed.  
- **Reusable lesson:** For corpus reuse, classify CIM-MLC as a partial compiler artifact with valuable abstractions and example flows, not as a complete reproducibility package.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found; artifact is partial/beta.**

- **Artifact identifier:** GitHub repository `Zhaoshixin-sky/CIM-MLC`, linked from the project page. ([GitHub](https://github.com/CIMMLC/CIMMLC.github.io))  
- **License:** Unknown / not found for the main compiler repository in the checked GitHub listing. The separate project-page repository `CIMMLC.github.io` is marked BSD-2-Clause and includes a BSD-2-Clause license file, but that appears to license the website repository, not necessarily the compiler artifact. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC))  
- **Last checked date:** 2026-05-14.  
- **What the artifact contains:** Python code for codegen, configs, model/ONNX inputs, optimization passes, output examples, simulator-related files, utilities, `main.py`, and `requirement.txt`. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC))  
- **What the artifact appears to omit:** No packaged releases are published; the README says the repository is a beta version and that complete compilation tools and model testing results would be released later. Open issues include a compilation error report, a simulator-file question, and a release-time question. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/releases))  
- **Minimal documented command:** `python main.py -onnx_model_path ./onnx_model/conv.onnx --ifmsize 1 3 32 32 --arch_config_module configs.example_config`, with optional `--output_dir` to save outputs. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/blob/main/README.md))  
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in the checked sources. The artifact provides examples and a runnable-looking command, but I did not find a documented script that regenerates the paper’s figures or all model-testing results. The README’s beta note supports treating figure reproduction as unconfirmed. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC))  

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Yes** | ONNX input, feature-map size, precision args, and architecture config module are documented. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/blob/main/README.md)) |
| Intermediate representation serialized | **Partial** | ONNX graph is serialized; CIM-specific state is graph attributes, Python objects, and pass-local state rather than a standalone IR file. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Mapping decisions inspectable | **Partial** | Output files and graph attributes are inspectable in principle; no stable mapping schema found. |
| Schedule inspectable | **Partial** | Meta-operator examples exist for CG/MVM/VVM; pass order is visible in `main.py`. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/tree/main/output)) |
| Hardware config explicit | **Yes** | Config README and architecture constructors expose hardware parameters. ([GitHub](https://raw.githubusercontent.com/Zhaoshixin-sky/CIM-MLC/main/configs/README.md)) |
| Precision / bit-slice assumptions explicit | **Partial** | Cell precision, ADC/DAC precision, input and weight precision are explicit; bit significance as type/provenance is not a standalone object. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Cost model inspectable | **Partial** | Paper describes latency/power simulator extensions and architecture parameters; complete calibration and figure scripts are not clearly documented. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Simulator backend documented | **Partial** | Paper describes functional and performance simulators; artifact includes simulator files, but interface documentation appears limited. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |
| Generated code / instruction stream inspectable | **Yes / Partial** | Example generated meta-op files are included; schema stability is not clear. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/tree/main/output)) |
| Provenance from source op to backend action | **Partial** | ONNX node attributes and codegen imply provenance, but no full provenance contract was found. |
| Reproduction scripts available | **Partial** | A minimal command exists; full paper-figure reproduction scripts were not found. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/blob/main/README.md)) |
| Calibration source documented | **Partial** | The paper references extended PUMA/NeuroSim/NVSim-style simulators, but complete calibration artifacts were not found in the checked README. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) |

### 8.3 Integration helper

- **As frontend:** Reuse is most direct through its ONNX input path and model conversion assumption. It can serve as a baseline ONNX-to-CIM frontend for static DNN graphs. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/blob/main/README.md))  
- **As IR inspiration:** The strongest reusable ideas are Abs-arch, Abs-com, VXB, and CM/XBM/WLM granularity contracts. These could seed a more formal hardware-resource dialect or target-capability schema. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **As mapper/scheduler:** The CG/MVM/VVM scheduling split, dynamic-programming duplication, crossbar pipeline, and WLM remapping are adaptable as mapping passes. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **As cost model:** Latency/power modeling could be wrapped as a backend plugin if the simulator interface is stabilized. The paper’s simulator description is useful, but a clean API would need to be extracted. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **As backend:** The meta-operator flow is a practical backend boundary. A future stack could target MOP_CM, MOP_XBM, or MOP_WLM-like outputs as a simulator or codegen adapter. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  
- **As benchmark:** The artifact’s example ONNX model and output files can support small regression tests; the paper’s VGG/ResNet/ViT benchmark space is useful for comparison, but full figure reproduction is not confirmed. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC/tree/main/output))  
- **As validation source:** The paper is simulator-backed; it is useful for relative scheduling validation and abstraction comparison, not as chip-in-loop or silicon calibration evidence. ([ar5iv](https://ar5iv.org/html/2401.12428v2))  

**Integration effort estimate: Medium–High.** Integration would be most direct through the architecture config and generated meta-op output. Reuse would benefit from a small adapter that extracts ONNX node annotations, pass results, and meta-op traces into a stable serialized mapping format. The effort rises because the artifact is beta, has no packaged release, and appears to encode several assumptions in Python modules and pass order rather than in a documented IR schema. ([GitHub](https://github.com/Zhaoshixin-sky/CIM-MLC))

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PIMCOMP** | ONNX-style DNN mapping to crossbar-based CIM/PIM, scheduling, pseudo-instruction output | PIMCOMP is a narrower but more toolchain-like ONNX-to-instruction flow around a shared PIM template; CIM-MLC foregrounds multi-level hardware/computing-mode abstraction. (CIM stack library compact.md) | Use PIMCOMP as a baseline for “narrow end-to-end compiler stack”; use CIM-MLC as the baseline for explicit computing-granularity abstraction. |
| **CIMFlow** | ONNX input, hardware config, graph-level mapping, instruction/simulator backend | CIMFlow has a documented 32-bit CIM ISA and SystemC simulator; CIM-MLC’s backend boundary is meta-operator flow across CM/XBM/WLM modes. (CIM stack library compact.md) | CIMFlow is stronger as ISA/simulator comparison; CIM-MLC is stronger as granularity-aware scheduling comparison. |
| **CMSwitch** | CIM compiler/mapping with meta-operator output | CMSwitch extends nearby ideas into compute-vs-memory mode selection for dual-mode arrays and explicitly compares speedup over CIM-MLC. (CIM stack library compact.md) | Use CMSwitch to show how a CIM-MLC-like meta-op compiler can be extended with mode-selection rewrite objects. |
| **PIMSYN-NN** | Architecture synthesis, dataflow scheduling, ONNX CNN input, hardware hierarchy | PIMSYN-NN synthesizes architecture and dataflow under power/resource constraints; CIM-MLC compiles onto provided architecture abstractions and computing modes. (CIM stack library compact.md) | PIMSYN-NN belongs near architecture synthesis; CIM-MLC belongs near mapping/scheduling over existing templates. |
| **CINM / Cinnamon** | Explicit compiler infrastructure for CIM/CNM systems | CINM is MLIR-based with explicit dialects and lowering; CIM-MLC is Python/ONNX/config/meta-op based and more focused on CIM hardware granularity. (CIM stack library compact.md) | Use CINM as the explicit-IR baseline; use CIM-MLC to identify hardware-resource objects that MLIR-style dialects should expose. |
| **Polyhedral-based CIM compiler** | DNN operator detection and mapping onto CIM accelerators | It is the paper’s direct comparison baseline, but the paper frames it as narrower in device/interface support and optimization granularity. ([ar5iv](https://ar5iv.org/html/2401.12428v2)) | Use it as a baseline for loop/tensor schedule approaches; CIM-MLC highlights why CIM-specific resource hierarchy matters beyond generic loop rewriting. |

## 10. Corpus-ready final takeaway

- CIM-MLC’s real contribution is a **multi-level CIM compiler/mapping abstraction**: chip/core/crossbar resources paired with CM/XBM/WLM computing modes.  
- Its strongest reusable stack layer is the **middle layer**: resource-aware graph, MVM, and row-level scheduling over a configurable CIM hardware abstraction.  
- The evidenced scope is **static DNN inference** from ONNX graphs to simulator-evaluated meta-operator flows over selected SRAM/RRAM-style CIM accelerator templates.  
- The most important first-class objects are **VXB, core/crossbar/row activation granularity, crossbar size, parallel row count, device/cell precision, ADC/DAC precision, NoC/buffer/ALU parameters, and meta-operators**.  
- The hidden IR is the union of **ONNX graph annotations, Python architecture configs, CIM object construction, pass order, optimization state, address generation, and codegen templates**.  
- Artifact status is **public but partial/beta**: useful folders, example outputs, and a minimal command exist, but no packaged release or full paper-figure reproduction workflow was found.  
- Integration is most promising through **architecture configs, scheduling-pass extraction, and meta-op backend wrapping**.  
- For value-trajectory IR research, CIM-MLC is an important comparison point: it names resources and emits flows, but trajectory-level rewrites would add typed value identity across bit slicing, sensing, accumulation, reconstruction, and storage.
