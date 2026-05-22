---
slug: dypim
title: "DyPIM: Dynamic-Inference-Enabled Processing-In-Memory Accelerator"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "DATE 2024"
authors_or_group: "Tongxin Xie, Tianchen Zhao, Zhenhua Zhu, Xuefei Ning, Bing Li, Guohao Dai, Huazhong Yang, Yu Wang"
summary: >-
  DyPIM is a DATE 2024 hardware–software co-design study for dynamic CNN inference on an RRAM-based PIM accelerator. Its main contribution is not a general-purpose CIM compiler, but a set of reusable dynamic-execution abstractions: Channel-Net separates channel-mask generation from intermediate feature readiness to recover inter-layer pipelining; channel grouping and dynamic operation-unit formation align pruning granularity with PIM crossbar execution granularity; and a throughput-oriented loss uses layer latency rather than total MAC reduction as the training proxy. The demonstrated setting is ResNet-20/32/56 on CIFAR-10 and CIFAR-100, evaluated with MNSIM 2.0 after adding dynamic control flows, using a 128×128 crossbar and 16×8 operation unit. For CIM compiler/IR research, the paper is most useful as a hidden-stack example in which the effective IR is distributed across runtime masks, dynamic tables, OU formation rules, latency targets, and simulator assumptions rather than exposed as a named, serializable compiler representation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
links:
  paper: https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf
  artifact:
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
  - "PIM"
workloads:
  - "ResNet-20 on CIFAR-10/CIFAR-100"
  - "ResNet-32 on CIFAR-10/CIFAR-100"
  - "ResNet-56 on CIFAR-10/CIFAR-100"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A2, A3]
axis_B: [B7, B4, B2, B1]
axis_C_first_class_objects:
  - "spatial mask"
  - "channel mask"
  - "exit decision"
  - "dynamic table"
  - "image ID"
  - "mask readiness"
  - "sparsity granularity"
  - "operation unit"
  - "dynamic operation unit"
  - "wordline activation order"
  - "crossbar / PE / tile hierarchy"
  - "bottleneck-layer latency"
axis_D_rewrite_objects:
  - "runtime state"
  - "hardware mapping"
  - "array / OU binding"
  - "graph-level mask-generation placement"
  - "training objective / latency target"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown / not found"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "backend wrapper, via related MNSIM 2.0 substrate"
reproducibility_level: low
notes:
  - "Most reusable abstraction is mask-to-OU lowering for dynamic CIM execution."
  - "Paper reports MNSIM 2.0 with added dynamic control flows, but the DyPIM-specific extension was not found publicly."
  - "Useful hidden-stack case where runtime tables and simulator assumptions carry the effective IR semantics."
takeaways: []
---

# DyPIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — Narrow end-to-end co-design** | DyPIM is framed as a software–hardware co-design for dynamic inference on PIM: Channel-Net and throughput-oriented training on the algorithm side, plus mask-aware pipeline control and dynamic operation-unit formation on the accelerator side. The evaluated slice is ResNet-style CNN inference on RRAM/PIM, not a general compiler stack. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Secondary stack roles, Axis A | **A2 — Simulator & cost model; A3 — Mapping / scheduling / DSE framework** | Hardware performance is evaluated through MNSIM 2.0 with added dynamic control flows; the core mapping/scheduling object is the alignment between sparsity granularity and operation-unit granularity. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Middle-layer style, Axis B | **B7 runtime-state abstraction; B4 hardware-resource IR; B2 graph-as-IR; partial B1 config-as-IR** | The paper’s most explicit intermediate objects are dynamic masks, image IDs, exit decisions, operation units, sparsity granularity, and layer latencies. These are not serialized as a named IR, but they act as the middle layer between the dynamic network and the PIM backend. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| First-class CIM objects, Axis C | **spatial masks, channel masks, exit decisions, dynamic table, sparsity granularity, operation units, dynamic OUs, wordline activation order, crossbar / PE / tile hierarchy, DAC/ADC path nodes, bottleneck-layer latency** | The paper directly names and reasons about masks, OUs, dynamic OU formation, tile-level control flow, and crossbar hardware parameters. Precision and bit-slicing are present mainly through the inherited RRAM/PIM background and simulator setting, rather than as a transformable IR field. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Rewrite object, Axis D | **runtime state + hardware mapping + graph/training objective** | DyPIM rewrites where channel masks are generated, groups output channels to match OU width, dynamically forms OUs from non-contiguous active wordlines, and trains toward layer sparsity targets derived from latency. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Best corpus tags | `RRAM-CIM`, `analog-CIM`, `dynamic-inference`, `runtime-masks`, `channel-pruning`, `spatial-pruning`, `operation-unit`, `mask-aware-dataflow`, `MNSIM`, `hardware-software-codesign` | These tags capture the demonstrated stack boundary: dynamic CNN pruning on an RRAM/PIM accelerator evaluated through simulator-backed experiments. |
| Closest comparison baselines | **DPACS, DGNet, MNSIM 2.0, Sparse ReRAM Engine, Gibbon, PRIME / configurable multi-precision RRAM CNN** | DPACS and DGNet are closest on dynamic spatial/channel pruning; MNSIM is the simulator substrate; Sparse ReRAM Engine is close on OU-level sparse ReRAM execution; Gibbon is close on PIM co-exploration; PRIME and the single-bit RRAM CNN framework are close on RRAM/PIM architecture support. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3575693.3575728?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

DyPIM is a DATE 2024 hardware–software co-design study for dynamic CNN inference on an RRAM-based PIM accelerator. Its main contribution is not a general-purpose CIM compiler, but a set of reusable dynamic-execution abstractions: Channel-Net separates channel-mask generation from intermediate feature readiness to recover inter-layer pipelining; channel grouping and dynamic operation-unit formation align pruning granularity with PIM crossbar execution granularity; and a throughput-oriented loss uses layer latency rather than total MAC reduction as the training proxy. The demonstrated setting is ResNet-20/32/56 on CIFAR-10 and CIFAR-100, evaluated with MNSIM 2.0 after adding dynamic control flows, using a 128×128 crossbar and 16×8 operation unit. For CIM compiler/IR research, the paper is most useful as a hidden-stack example in which the effective IR is distributed across runtime masks, dynamic tables, OU formation rules, latency targets, and simulator assumptions rather than exposed as a named, serializable compiler representation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| DyPIM is a software–hardware co-design for dynamic inference on PIM. | Abstract; conclusion. | Paper-only + experiment. | The paper combines a PIM-friendly dynamic network, throughput-oriented training, pipeline controller, dynamic table, and DOU-enabled PE architecture. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | Demonstrated for ResNet-style CNN inference under simulator-backed evaluation; no public DyPIM implementation was found. |
| Channel-Net avoids pipeline stalls caused by channel-mask generation. | Section III, Fig. 3, Equations 1–4. | Equation + architecture sketch + experiment. | The paper models `l2` start time as dependent on mask readiness, then moves channel-mask generation to a standalone branched decision network using the original image. It reports Channel-Net extra delay as 5.16% of total latency and a 57.17× reduction in extra mask-generation latency. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The paper-level evidence supports the scheduling argument for ResNet-style channel pruning; artifact-level confirmation would require released training and simulator traces. |
| Channel grouping aligns algorithmic channel pruning with PIM operation-unit width. | Section IV-B, Fig. 4. | Equation + mapping rule. | Every `N` channels are merged into a channel group that shares the same mask value, with `N` aligned to OU width so the channel-mask count per OU can be reduced to one. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The reusable boundary is clearest at the mapping rule “mask group width = OU width”; generality to other networks or irregular channel layouts is not separately evaluated. |
| Dynamic OU formation aligns spatial sparsity with hardware execution granularity. | Section IV-B and VI-D, Equations 11–13, Fig. 5. | Equation + hardware control rule. | Non-zero wordlines are grouped into OUs by prefix-sum-derived order; DyPIM factorizes the mask computation into channel-mask preprocessing and per-window spatial-mask processing, reducing prefix-sum cost for a 3×3 kernel to 8 adders and 4 cycles. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | Demonstrated as a PE-level control mechanism in the paper and simulator setting; no RTL, gate-level, or public code artifact was found. |
| Throughput-optimal training improves PIM throughput by balancing layer latency. | Section V, Equations 8–10. | Equation + experiment. | The training objective computes per-layer target sparsity from measured layer latency and a target throughput improvement, then adds performance and accuracy terms to cross-entropy. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The evidenced scope is latency-aware sparsity targeting for pipeline-enabled PIM CNN inference; the training workflow itself is paper-level. |
| DyPIM supports layer-wise, spatial-wise, and channel-wise dynamic inference. | Section VI-A/B, Fig. 5. | Architecture description. | The tile-level design includes input decoder, output encoder, dynamic table, image ID, exit decision, spatial mask, channel mask, and readiness fields. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The runtime-state interface is clear conceptually; serialization format, trace format, and programmatic API are unknown / not found in the checked sources. |
| DyPIM achieves 1.52×–2.74× speedup and 2.05×–3.95× throughput improvement. | Abstract; Section VII; conclusion. | Experiment. | Experiments evaluate ResNet-20/32/56 on CIFAR-10 and CIFAR-100 using MNSIM 2.0 with dynamic control flows, 128×128 crossbars, and 16×8 OUs. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The paper-level evidence supports simulator-backed comparisons under the stated settings; figure reproduction would require the unpublished DyPIM modifications and training setup. |
| DyPIM has modest area and energy overhead. | Section VII-E. | Experiment / estimate. | The paper reports Channel-Net adds approximately 6.8% area and 5.5% energy, and the hardware architecture changes add 0.51% tile area. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) | The estimation method and calibration details are not exposed as an artifact; reuse would require reconstructing the cost path in MNSIM or another backend. |

## 4. Stack anatomy

```text
Input / frontend:
  ResNet-20, ResNet-32, and ResNet-56 CNN inference workloads on CIFAR-10 and CIFAR-100, augmented with dynamic spatial/channel pruning and Channel-Net mask generation. This is a neural-network graph/workload object, not a documented general frontend or importer. The workloads and datasets are named, but a serialized input format is not exposed. 

Middle representation:
  Spatial masks, channel masks, exit decisions, channel groups, layer latencies, target sparsity ratios, and dynamic-table entries. These are runtime/state objects and training-side metadata, not a named IR. They are inspectable in equations and figures, but not serialized or documented as a reusable interface.

Mapping or scheduling state:
  Sparsity granularity (SG), operation unit (OU), numbers of spatial/channel mask granularities per OU, channel grouping factor, dynamic OU formation, prefix-sum order `f(M)`, and wordline activation condition. This is an implicit hardware-resource mapping state. The legal transformations are described mathematically, but no pass output or schedule trace is published.

Hardware abstraction:
  RRAM crossbar hierarchy with tiles, PEs, crossbar groups, DACs, ADCs, sense-and-amplify stage, adder tree, tile-level output buffer, input/output encoders, dynamic table, and intra-layer pipeline controller. The evaluated configuration uses 128×128 crossbars and 16×8 OUs. It is documented in the paper and evaluated through MNSIM 2.0; it is not exposed as a DyPIM-specific public hardware description.

Backend / simulator / codegen:
  MNSIM 2.0 behavior-level simulation with added dynamic control flows. Upstream MNSIM 2.0 is public, but the DyPIM-specific dynamic-control extension was not found as a public artifact. No generated instruction stream or backend codegen interface is described.

Output artifact:
  Reported speedup, throughput improvement, accuracy–speedup tradeoff, and overhead estimates. The output is paper figures/tables rather than generated code, an executable binary, an IR dump, or a simulator trace.

Evaluation loop:
  Train dynamic networks using Gumbel-Softmax and the throughput-oriented loss; evaluate hardware performance with modified MNSIM 2.0; compare baseline ResNet, DGNet, DyPIM variants with channel grouping, DOU, and throughput-optimal training; report speedup, throughput, accuracy, area, and energy.
```

The input, simulator setup, and key evaluation settings are described in Section VII: ResNet-20/32/56 on CIFAR-10/100, MNSIM 2.0 with dynamic control flows, 128×128 crossbar, and 16×8 OU. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the dynamic table, per-image masks, channel-grouping rule, per-window spatial-mask processing, latency-derived sparsity targets, and MNSIM hardware configuration. The paper foregrounds the dynamic network and accelerator architecture, while the reusable semantics are most visible in the mask-readiness constraints, SG–OU alignment equations, DOU wordline-order rules, and bottleneck-latency training objective. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — Narrow end-to-end co-design.**  
DyPIM owns a narrow but coherent slice from dynamic CNN design through PIM-aware control and simulator evaluation. Its input is a ResNet-style dynamic inference workload with spatial/channel masks; its output is simulator-backed hardware performance and accuracy tradeoff. The paper’s stack slice is strongest where algorithmic dynamic pruning interacts with mask readiness, PIM pipeline timing, and OU granularity. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**Secondary: A2 — Simulator & cost model.**  
The paper uses MNSIM 2.0 as the backend evaluation substrate and states that dynamic control flows are added to enable dynamic inference simulation. The upstream MNSIM repository describes MNSIM 2.0 as modeling PIM hardware performance and neural-network computing accuracy, but the DyPIM-specific modifications were not found publicly. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
DyPIM is not a full mapper, but it performs mapping-like transformations: channel grouping aligns mask width with OU width; DOU selects non-contiguous active wordlines to form OUs; throughput-oriented training uses bottleneck-layer latency as a scheduling-relevant cost proxy. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 5.2 Axis B — middle-layer style

**B7 — Runtime-state abstraction.**  
The named middle representation is the set of dynamic decision results: spatial masks, channel masks, exit decisions, image ID, readiness bits, and the dynamic table implemented as a circular queue. Decisions made there include whether data proceeds, which pixels/channels are computed, and when a layer can consume masks. Upstream compiler passes would need a serializable mask/state schema to read or verify this representation; the paper provides the semantics in Fig. 5 and prose rather than a file format. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**B4 — Hardware-resource IR.**  
The named hardware-resource objects are SG, OU, sub-OU, wordline, crossbar, PE, tile, DAC, ADC, adder tree, and output buffer. Decisions made there include whether a memory-cell group can be skipped, how channels are grouped, and how non-zero wordlines are dynamically packed into executable OUs. The hardware decisions remain embedded in equations, architecture diagrams, and simulator setup rather than exposed as a single reusable hardware-resource IR. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**B2 — Graph-as-IR.**  
The dynamic network structure acts like a graph-level object: Channel-Net changes the placement and dependency of channel-mask generators relative to the backbone network. The key graph decision is to generate channel masks from the original image through a branched decision network instead of waiting for intermediate output features. This graph object is described architecturally, but no graph serialization or import/export boundary is documented. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

**Partial B1 — Config-as-IR.**  
The backend evaluation likely depends on MNSIM-style configuration, and the paper reports concrete hardware configuration values. Upstream MNSIM exposes files such as `SimConfig.ini`, `techfile.txt`, `main.py`, and a manual, but the DyPIM-specific configuration or dynamic-control extension was not found as a public release. ([GitHub](https://github.com/thu-nics/MNSIM-2.0))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware abstraction / parameter** | The paper describes tiles, PEs, crossbars, and sub-kernel mapping; evaluation uses 128×128 crossbars. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Bit-slicing / bit significance | **Parameter / implicit** | Background says crossbars within a PE map different bits of a sub-kernel; DyPIM does not make bit significance a transformable object in the demonstrated mechanism. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| ADC/DAC precision or sensing | **Path node / simulator parameter, mostly implicit** | Fig. 5 shows DACs, ADC, sense-and-amplify, output register, and adder tree in the PE path; precision settings are not foregrounded as rewrite objects. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Analog-to-digital or domain transition | **Implicit / costed through backend** | The PE diagram includes DAC/ADC around the crossbar group, and performance is evaluated by MNSIM 2.0; DyPIM does not expose domain transition as a first-class IR edge. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Peripheral circuits as path nodes | **First-class in architecture diagram; partially costed** | DOU support, prefix-sum-related preprocessing, mask processing, DAC/ADC, adder tree, and buffers are drawn as hardware path components; overhead is reported at area/energy level. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Partial-sum accumulation path | **Implicit path object** | The adder tree and PE-level output buffer appear in Fig. 5, but partial-sum identity and accumulation schedules are not named as compiler objects. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Reconstruction / shift-add tree | **Implicit / not central** | The paper mentions bit mapping in background and shows an adder tree, but reconstruction is not developed as a separate abstraction. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for masks and sparsity; KV cache not applicable** | Spatial masks, channel masks, exit decisions, image IDs, readiness bits, sparsity ratios, and dynamic-table entries are explicit. KV cache is not applicable to the CNN setting. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Value trajectory / flow path | **Approximated** | The closest representation is the masked dataflow through zero insertion, line buffer, skip control, wordline-vector formation, crossbar group, ADC, adder tree, and output buffer. Value identity across those stages is not exposed as a typed trajectory. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |

### 5.4 Axis D — rewrite object

DyPIM’s rewrite objects are **runtime state**, **hardware mapping**, and **graph/training objective**. It changes the dynamic network graph by moving channel-mask generation into Channel-Net; changes mapping by grouping channels to match OU width; changes runtime scheduling by dynamically forming OUs from active non-contiguous wordlines; and changes training by targeting the layer with the longest post-pruning latency rather than total computation reduction. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

Legal transformations in the paper’s framework include generating channel masks before the dependent backbone layer requires them, sharing a mask across a channel group, skipping OUs when all relevant spatial or channel mask values deactivate the work, packing non-zero wordlines into dynamic OUs, and adjusting layer sparsity targets according to latency. The main equivalences are that grouped channels share a pruning decision, zero insertion reconstructs the dense sliding-window context for sparse inter-layer flow, and non-contiguous active wordlines can be executed together when the DOU ordering rule preserves the selected active work. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

The information that must be preserved across lowering includes image ID, mask readiness, spatial-mask position, channel-mask group identity, wordline order, OU/sub-OU boundaries, output-channel association, and layer-latency target. The representation is especially well suited to mask-aware dynamic CNN execution on an OU-based RRAM/PIM accelerator; expressing precision retiming, cross-operator partial-sum carry, or ADC/reconstruction fusion would likely require an additional abstraction for value domain, bit significance, and accumulation-path identity.

## 6. Technical mechanism reading

### 6.1 Pipeline stall as a mask-readiness dependency

The paper’s first compiler-relevant move is to turn channel-mask generation into a scheduling dependency. In conventional dynamic pruning, the channel mask for a later layer is generated from an intermediate feature map, so the next layer must wait for both required input data and the completed mask. DyPIM formalizes this with `T_start` equations for layer `l2` and the generator, showing that channel-mask generation can delay inter-layer pipelining. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

Channel-Net rewrites that dependency by using the original image as the decision-network input. Instead of inserting a channel-mask generator inside each residual block, Channel-Net uses lightweight feature extractors and branch generators so masks for different backbone depths become available progressively. In IR terms, this is a readiness transformation: the mask producer is moved earlier in the data-dependency graph so its result is ready before the consuming convolution needs it. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 6.2 Sparsity granularity versus operation-unit granularity

DyPIM’s second key mechanism is the distinction between **algorithmic sparsity granularity** and **hardware operation-unit granularity**. At the algorithm level, one spatial pixel and one output channel can be masked, making the minimum SG correspond to a single memory cell in the crossbar. At the hardware level, MVMs execute at OU granularity, where one OU covers multiple rows and columns. Therefore, algorithmic MAC reduction maps to hardware speedup only when entire OUs can be skipped. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

The paper models the probability that an OU can be skipped as a function of spatial sparsity, channel sparsity, and the number of mask granularities inside an OU. It then derives hardware speedup from the number of skipped OUs, making `#Ms` and `#Mc` the bridge variables between dynamic-pruning semantics and PIM execution cost. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 6.3 Channel grouping as a mapping rule

Channel grouping increases the channel sparsity granularity so that a group of `N` channels shares the same mask value. DyPIM chooses `N` to align with OU width, reducing the number of channel-mask granularities inside an OU. This is a mapping constraint that a compiler-style representation could expose as a field on channel groups: group width, mask ID, output-channel range, and OU-width compatibility. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 6.4 Dynamic OU formation as runtime scheduling

For the spatial dimension, DyPIM uses dynamic OU formation. The original DOU rule computes a prefix sum over the input mask to determine the order of non-zero wordlines; in cycle `Clk`, a wordline is activated if its prefix-sum-derived order falls within that cycle’s OU range. DyPIM improves this by exploiting the relation between the channel mask, spatial mask, and combined wordline mask: channel masks can be preprocessed per image, while spatial masks are processed per sliding window. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

This factorization is important for IR design because it separates a **per-image runtime table** from a **per-window schedule**. For a 3×3 kernel, the paper reports that the per-window spatial prefix sum needs 8 adders and 4 cycles, and the remaining combined order can be read through a multiply table. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 6.5 Throughput-oriented training objective

DyPIM’s training objective uses latency rather than total computation as the hardware-performance proxy. The method first records layer latency for the backbone network, then computes the minimum target sparsity ratio for each layer based on the maximum layer latency and a target throughput improvement. The loss combines cross-entropy, a performance term that pushes the most under-target layer toward its sparsity target, and an accuracy-oriented upper-bound term to avoid unnecessary sparsity. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

For compiler/IR purposes, this objective effectively exports a cost-model concept into training: the bottleneck layer defines throughput, and dynamic pruning is valuable when it reduces that bottleneck rather than merely reducing total operations. This is a reusable idea for CIM stacks where layer latency depends on array utilization, OU packing, peripheral overhead, and pipeline balance.

### 6.6 Hardware abstraction and backend assumptions

The tile architecture contains input/output encoders, an intra-layer pipeline controller, a data distributor, PEs, output buffers, and a dynamic table. Each dynamic-table entry holds image ID and decision results, including spatial mask, channel mask, and exit decision. The intra-layer controller inserts zeros to recover sparse input dataflow, uses a line buffer for sliding windows, carries mask values with the window, and skips PE transfer when output pixels are masked. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

The PE diagram includes mask preprocessing, prefix sum, merge logic, wordline vector generation, DACs, crossbar group, ADC, sense-and-amplify, output register, adder tree, and PE-level output buffer. Evaluation uses MNSIM 2.0 with dynamic control flows added, a 128×128 crossbar, and a 16×8 OU. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Mask readiness is a scheduling object

- **Observation:** DyPIM treats channel-mask availability as a first-order pipeline constraint: a layer cannot start until both input data and its mask are ready. Channel-Net is valuable because it moves mask production earlier in the dependency graph. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** A static graph IR that only records convolution dependencies would miss the true dynamic-execution constraint. A CIM dynamic-inference IR should represent mask producer, mask consumer, readiness time, and validity scope.
- **Reusable lesson:** Model masks as timed runtime values, not as side metadata attached after scheduling.

### Insight 2 — Sparsity speedup depends on executable granularity, not mask density alone

- **Observation:** DyPIM’s equations separate computation reduction from actual PIM speedup by introducing `#Ms`, `#Mc`, and OU skip probability. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** A compiler that optimizes sparsity ratios without modeling OU coverage can overestimate backend benefit. The first-class object should be the executable mask tile or OU, not only the tensor sparsity ratio.
- **Reusable lesson:** Represent “skip legality” at the hardware execution granularity, with explicit mapping from tensor mask coordinates to array/OU coordinates.

### Insight 3 — The dynamic table is the clearest runtime IR boundary

- **Observation:** The dynamic table stores image ID, exit decision, spatial mask, channel mask, and readiness status in a circular queue. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** This table is a compact contract between dynamic-network decisions and hardware control. It names the minimum state needed to coordinate layer-wise, spatial-wise, and channel-wise dynamic execution.
- **Reusable lesson:** A future compiler could serialize a dynamic-state schema with fields for decision ID, mask shape, mask granularity, consuming layer, readiness, and lifetime.

### Insight 4 — Prefix-sum factorization exposes a split between per-image and per-window work

- **Observation:** DyPIM avoids repeatedly prefix-summing a full crossbar-length wordline mask by preprocessing channel masks per image and processing spatial masks per sliding window. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** This distinction suggests a scheduling dimension beyond static/dynamic: some dynamic state is image-level, while other dynamic state is window-level or token-level.
- **Reusable lesson:** Runtime IR should attach update frequency and reuse scope to dynamic fields, because those properties affect hardware overhead.

### Insight 5 — Bottleneck latency is a better training proxy than global MAC reduction for pipelined CIM

- **Observation:** The throughput-optimal training objective targets the longest layer latency after pruning rather than total computation reduction. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** In pipelined CIM, throughput may be dominated by the slowest stage, and layer compute capability can vary by mapping and hardware resource availability.
- **Reusable lesson:** Compiler cost models and training losses can share a bottleneck-stage abstraction: layer latency, pipeline occupancy, and target sparsity should be jointly represented.

### Insight 6 — The simulator modification is part of the real stack contract

- **Observation:** The paper states that dynamic control flows were added to MNSIM 2.0 for dynamic inference simulation, but the public upstream MNSIM repository is a general behavior-level PIM tool rather than a DyPIM-specific release. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- **Why it matters for CIM compiler/IR work:** The semantics of masks, skips, and dynamic OUs ultimately have to be accepted by the backend simulator. Without a visible simulator API or trace format, the backend contract is embedded in paper-level assumptions.
- **Reusable lesson:** Publishable CIM stacks should expose the simulator input schema and dynamic-control trace alongside performance figures.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** no DyPIM-specific public code, simulator fork, training package, benchmark package, or reproduction scripts were found in the checked sources.
- **Related public artifact:** upstream **MNSIM-2.0** exists as a public GitHub repository and aims to model PIM hardware performance and neural-network computing accuracy; the repository includes `MNSIM`, `MNSIM_manual.pdf`, `SimConfig.ini`, `main.py`, and `techfile.txt`. ([GitHub](https://github.com/thu-nics/MNSIM-2.0))
- **Official publication-page evidence:** the NICS-EffAlg publication page lists DyPIM with a **Paper** link only; nearby entries on the same page show separate **Code** links when code is available. ([NICS-EffAlg](https://nics-effalg.com/publications/))
- **License:** unknown / not found for DyPIM. Upstream MNSIM repository listing did not show a license file in the checked page; treat license status as unknown unless independently confirmed. ([GitHub](https://github.com/thu-nics/MNSIM-2.0))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** no DyPIM artifact. The related MNSIM repository contains a Python simulator, configuration files, manual, and weight-file pointer. ([GitHub](https://github.com/thu-nics/MNSIM-2.0))
- **What the artifact appears to omit:** DyPIM Channel-Net training code, dynamic-control-flow MNSIM modifications, DOU simulation implementation, trained models, exact configs for figures, logs, and reproduction scripts.
- **Minimal command or workflow, if documented:** unknown / not found for DyPIM. Upstream MNSIM has repository files, but a DyPIM-specific workflow was not found.
- **Whether paper figures appear reproducible from the artifact:** unknown. The paper states that MNSIM 2.0 was modified with dynamic control flows; those modifications were not found publicly. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Networks and datasets are named; no serialized workload format or importer is documented. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Intermediate representation serialized | Unknown | Masks, dynamic table, SG/OU state, and latency targets are described, but no IR file or schema is published. |
| Mapping decisions inspectable | Partial | Channel grouping, SG/OU equations, and DOU rules are visible in the paper; per-layer mapping dumps are not found. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Schedule inspectable | Partial | Pipeline-readiness equations and dynamic-table logic are shown; no simulator schedule trace is published. |
| Hardware config explicit | Partial | Crossbar size and OU size are explicit; full simulator config for DyPIM is not found. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Precision / bit-slice assumptions explicit | Partial | Bit mapping appears in PIM background, but precision fields are not central to DyPIM’s mechanism. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |
| Cost model inspectable | Partial | Analytical skip/speedup formulas and training loss are inspectable; backend MNSIM modifications are not. |
| Simulator backend documented | Partial | MNSIM 2.0 is public and documented at a high level; DyPIM-specific dynamic-control extensions are paper-only in checked sources. ([GitHub](https://github.com/thu-nics/MNSIM-2.0/blob/master/README.md?plain=1)) |
| Generated code / instruction stream inspectable | N/A | The work does not present an instruction stream or code generator. |
| Provenance from source op to backend action | Partial | The paper connects masks to skipped pixels/channels and OUs, but does not publish an op-to-PE trace. |
| Reproduction scripts available | Unknown | No DyPIM scripts found. |
| Calibration source documented | Partial | The hardware setting follows an existing RRAM accelerator and uses MNSIM 2.0, but detailed calibration sources are not exposed. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is limited. The demonstrated frontend is ResNet-style CNN inference with dynamic spatial/channel masks; no general parser, ONNX importer, or graph schema was found.
- **As IR inspiration:** Reuse is strongest. The dynamic table, mask readiness, spatial/channel mask scopes, channel groups, SG/OU mapping, and latency-derived sparsity targets are strong candidates for a dynamic-CIM IR.
- **As mapper/scheduler:** The channel-grouping rule and DOU wordline-packing rule could be adapted into a mapper pass that lowers tensor masks to array/OU skip decisions.
- **As cost model:** The OU skip probability, hardware speedup expression, and bottleneck-layer latency target could become backend cost-model plugins.
- **As backend:** Integration would be most direct through an MNSIM wrapper, but the DyPIM-specific dynamic-control extension would need to be reimplemented or obtained from the authors.
- **As benchmark:** The ResNet-20/32/56 + CIFAR-10/100 setup and variant comparisons are reusable as a conceptual benchmark suite, but exact reproduction requires missing configs and training code.
- **As validation source:** The paper provides simulator-backed results and overhead estimates; it does not provide SPICE, RTL, chip-in-loop, or real-system validation.

**Integration effort estimate: High.**  
The most valuable reusable boundary appears to be the mask/OU abstraction rather than a runnable tool. Integration would require reconstructing Channel-Net training, dynamic mask traces, the MNSIM dynamic-control extension, and the DOU cost model. A small adapter could expose masks, channel groups, and OU formation as IR objects, but reproducing the reported figures would require additional implementation work and calibration.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **DPACS** | Dynamic spatial/channel pruning with hardware-aware execution. | DPACS is an algorithm–architecture co-design for dynamic pruning with a public repository; DyPIM specializes the problem to PIM pipeline stalls and OU granularity. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3575693.3575728?utm_source=chatgpt.com)) | Good comparison for dynamic mask semantics; DyPIM’s corpus value is stronger on PIM-specific mask-to-OU lowering. |
| **DGNet** | Dynamic dual gating over spatial and channel dimensions. | DGNet supplies a dynamic-network baseline; DyPIM changes mask generation and hardware control so such dynamic masks can execute efficiently on PIM. ([CVF Open Access](https://openaccess.thecvf.com/content/ICCV2021/papers/Li_Dynamic_Dual_Gating_Neural_Networks_ICCV_2021_paper.pdf?utm_source=chatgpt.com)) | Distinguish algorithmic dynamic pruning from CIM execution semantics. |
| **MNSIM 2.0** | Behavior-level PIM modeling and NN accuracy/performance evaluation. | MNSIM is the simulator substrate; DyPIM adds a dynamic-inference scenario and dynamic control-flow assumptions on top. ([GitHub](https://github.com/thu-nics/MNSIM-2.0/blob/master/README.md?plain=1)) | Use DyPIM as an example where simulator inputs and extensions become part of the hidden IR boundary. |
| **Sparse ReRAM Engine** | OU-level sparse ReRAM execution and activation/weight sparsity. | SRE focuses on exploiting activation and weight sparsity in ReRAM using OU-based computation; DyPIM focuses on dynamic masks, Channel-Net, and per-image/per-window DOU formation. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3307650.3322271?utm_source=chatgpt.com)) | Strong comparison for OU-level skip legality and mask-to-crossbar mapping. |
| **Gibbon** | NN/PIM architecture co-exploration. | Gibbon searches joint NN and PIM architecture spaces; DyPIM is a narrower dynamic-inference design with explicit runtime mask and OU-control semantics. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2022/html/0421.html?utm_source=chatgpt.com)) | Separates DSE/search-stack papers from hidden-stack co-design papers. |
| **PRIME / configurable multi-precision RRAM CNN framework** | RRAM/PIM acceleration for neural-network inference. | PRIME and the configurable multi-precision work emphasize architecture and precision/configuration; DyPIM emphasizes dynamic runtime state and mask-aware execution. ([Computer Science](https://cseweb.ucsd.edu/~jzhao/files/PRIME_isca2016.pdf?utm_source=chatgpt.com)) | Useful contrast between precision/layout-centered CIM objects and runtime-mask-centered CIM objects. |

## 10. Corpus-ready final takeaway

- DyPIM is best classified as a **narrow hardware–software co-design demo** for dynamic CNN inference on an RRAM/PIM accelerator.
- Its strongest reusable stack layer is the **runtime mask and operation-unit execution model**: mask readiness, dynamic table, SG/OU alignment, channel grouping, and DOU wordline packing.
- The evidenced scope is **ResNet-20/32/56 on CIFAR-10/100**, evaluated with **modified MNSIM 2.0**, 128×128 crossbars, and 16×8 OUs. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/c69aff31-5bbd-45dc-8e2c-40deb0c504d7.pdf))
- The paper’s first-class CIM objects are masks, OUs, dynamic OUs, wordline activation order, dynamic-table entries, and bottleneck-layer latency.
- The hidden IR is distributed across equations, mask tables, channel-grouping rules, DOU prefix-sum logic, training targets, and simulator configuration.
- Artifact status: no public artifact found. Upstream MNSIM 2.0 is public, but the DyPIM-specific dynamic-control extension was not found. ([NICS-EffAlg](https://nics-effalg.com/publications/))
- Integration into a future compiler would be most useful as **IR inspiration, mapper/scheduler logic, and cost-model logic**, not as a drop-in frontend or backend.
- For value-trajectory IR work, DyPIM is medium-relevance: it names dynamic flow-control objects clearly, while trajectory-level numeric/domain rewrites would require additional value identity and domain-transition metadata.
