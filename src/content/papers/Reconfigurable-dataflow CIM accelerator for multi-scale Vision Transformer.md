# An In-Memory Computing Accelerator with Reconfigurable Dataflow for Multi-Scale Vision Transformer with Hybrid Topology — scoped CIM stack note

_Source note: I found the paper’s bibliographic record and ACM-indexed paper text snippets, but the ACM PDF itself was not retrievable through open browsing. No public artifact repository, benchmark package, compiler, simulator, or scripts were found in the checked public sources. The paper appears in DAC 2024 as paper 245:1–245:6. ([DBLP](https://dblp.org/rec/conf/dac/Chen0L0L0JY024))_

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — narrow end-to-end co-design**, with secondary **A3 mapping / scheduling / DSE** and paper-level **A2 cost/evaluation** | The paper’s strongest evidenced object is a digital SRAM-CIM accelerator/dataflow for multi-scale ViTs with hybrid convolution + MHA topology. It describes pipeline reordering, fused MHA matrix multiplication, reconfigurable IMC engines, and distributor/interconnect behavior, then evaluates speed, energy, and EDP in TSMC 22 nm. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR**; implicit **B1 Config-as-IR**, **B2 Graph-as-IR**, and **B3 tensor-schedule/dataflow IR** | The reusable middle layer is not presented as a serializable compiler IR. The effective representation is the combination of MHA/conv graph stages, reconfigurable IMC engines, distributor network, reuse buffer, partial-sum gathering, and dataflow modes. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| First-class CIM objects, Axis C | Digital SRAM-CIM macro/engine, reconfigurable IMC engine, distributor network, reuse buffer, accumulated-result path, post-processing unit, MHA pipeline stages, fused MatMul path | The paper directly names SRAM-based digital IMC, IMC engines, global interconnect/distributor behavior, reuse buffers, serial input bits, and gathered accumulated results. ADC/DAC and analog nonideality objects are outside the demonstrated digital-SRAM path. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Rewrite object, Axis D | **Operator/dataflow pipeline**, **hardware mapping**, **data movement schedule**, **array/engine binding**, and **memory-reuse path** | The paper’s transformations are dataflow-level: MHA pipeline reordering, two-stage softmax placement, fused MatMul to reduce quadratic intermediate traffic, and adaptable mapping of convolution/MHA to reconfigurable IMC engines and interconnects. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `multi-scale-ViT`, `MHA-acceleration`, `hybrid-conv-attention`, `reconfigurable-dataflow`, `hardware-software-codesign`, `attention-fusion`, `memory-traffic-reduction`, `paper-only-evaluation` | These tags reflect the demonstrated architecture and dataflow scope rather than a public compiler API or IR artifact. |
| Closest comparison baselines | TranCIM, MuITCIM, ReDCIM/PIMCA, FDCA, HEIRS, IMTP / weight-packing mapping work | Nearby work shares transformer/CIM, digital-CIM, mapping, or programmable-IMC concerns. The closest distinction is that this paper centers on multi-scale image ViTs with hybrid convolution + MHA and reconfigurable dataflow rather than a public ISA, IR, or compiler interface. ([GitHub](https://github.com/BUAA-CI-Lab/Literatures-on-SRAM-based-CIM)) |

## 2. One-paragraph public summary

This DAC 2024 paper contributes a digital SRAM-CIM accelerator architecture and reconfigurable dataflow for static-shape, image-domain multi-scale Vision Transformers whose topology mixes convolutional layers with multi-head attention. Its strongest CIM-stack contribution is at the hardware-mapping and backend-dataflow boundary: the paper highlights MHA pipeline reordering, a two-stage softmax strategy, fused attention matrix multiplication to reduce quadratic intermediate traffic, reconfigurable IMC engines, a distributor network, reuse buffers, accumulation, and post-processing paths. The demonstrated scope is a TSMC 22 nm evaluation against a baseline IMC accelerator, reporting 2.20×–2.52× MHA speedup, 40.6%–74.8% MHA energy reduction, and 44.1%–55.9% EDP reduction for typical multi-scale ViTs. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) For CIM compiler/IR research, the paper is most useful as a hardware-software co-design case where the practical “IR-like” object is a reconfigurable dataflow and resource-binding state, rather than a public frontend, verifier, serializable dialect, ISA, or compiler API.

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Multi-scale ViTs with hybrid topology need different CIM support than standard ViTs. | Abstract / introduction / background | Paper-only architecture motivation; workload analysis | The paper describes multi-scale ViTs as combining MHA with convolutional topology, variable layer sizes, and changing MHA proportions. It contrasts these with columnar standard ViTs and mentions Swin, PVT, CvT, and MobileViT as context. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The paper-level evidence supports image-domain, static-shape multi-scale ViT inference. Generalization to dynamic-token, autoregressive, sparse, or runtime-adaptive transformer workloads would require additional evidence. |
| SRAM-based digital IMC is suitable for convolution and MHA while avoiding analog nonidealities and costly analog/digital conversion. | Introduction / contribution summary | Paper-only architecture claim | The paper positions the design as SRAM-based digital IMC and states that this avoids analog nonidealities and costly analog/digital conversion. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The demonstrated abstraction is digital SRAM-CIM. Analog-CIM objects such as ADC precision, DAC timing, sensing margin, and analog reconstruction are outside the evidenced path. |
| MHA pipeline reordering and two-stage softmax reduce interconnection complexity. | Contribution summary; Figure 2 is referenced in indexed text | Algorithm / paper-only dataflow description | The paper claims a reordered MHA pipeline and a two-stage softmax method to reduce IMC macro interconnection complexity. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The reusable boundary is clearest as an attention-dataflow transformation. Artifact-level confirmation of exact softmax partitioning, legality checks, and corner-case handling was not found. |
| Fused MatMul computation eliminates redundant intermediate data transfer with quadratic complexity. | Contribution summary | Algorithm / paper-only dataflow transformation | The paper identifies fused MatMul computation in MHA as a way to reduce redundant intermediate data transfer, especially for the quadratic \(N \times N\) attention score path. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | Demonstrated for MHA-style \(QK^T\), softmax, and \(S'V\) structure. A general fusion IR, legality framework, or reusable graph-rewrite API was not found in public sources. |
| Reconfigurable IMC engines and interconnections support both convolution and MHA computation patterns. | Contribution summary / architecture description | Paper-only hardware abstraction | The paper describes reconfigurability at the IMC-engine level and global interconnect, with a flexible distributor network orchestrating IMC engines for convolutional layers and MHA. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The evidenced interface is an architecture/dataflow description. Public configuration schemas, compiler lowering rules, or inspectable mapping files were not found. |
| Reuse buffers and distributor/post-processing paths reduce data movement and support continuous convolution sliding. | Architecture data-path description | Paper-only hardware data path | Indexed text states that a reuse buffer eliminates redundant SRAM access during convolution sliding; distributor nodes receive serial input bits; accumulated results are gathered and transmitted to post-processing. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The data path is named at block level. Public timing traces, buffer-layout files, or source-op-to-backend provenance were not found. |
| The architecture improves MHA speed and energy and reduces EDP for multi-scale ViTs. | Evaluation section / abstract summary | Experiment | Reported results are 2.20×–2.52× speedup and 40.6%–74.8% energy reduction for MHA workloads, plus 44.1%–55.9% EDP reduction for typical multi-scale ViTs versus a baseline IMC accelerator in TSMC 22 nm. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | The paper-level evidence supports the reported benchmark/evaluation setup. Independent reproduction would require public configurations, models, workload extraction, simulator or RTL setup, and baseline details. |
| The design is reconfigurable across varying layer sizes. | Contribution summary / evaluation motivation | Paper-only architecture + experiment claim | The paper states that previous inflexible dataflows degrade when MHA layer size varies and claims the proposed distributor/engine mapping maintains high utilization across variable layer sizes. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) | Demonstrated for the selected multi-scale ViT workload family. Runtime shape polymorphism, online compilation, or dynamic batching were not evidenced in checked public sources. |

## 4. Stack anatomy

```text
Input / frontend:
  Object: multi-scale ViT operator structure, especially convolutional layers and MHA stages.
  Form: paper-level graph/tensor description; MHA is described through Q, K, V, S = QK^T, row-wise softmax S', and O = S'V.
  Serialization / reuse: no public frontend format, parser, model importer, or workload schema found.

Middle representation:
  Object: reordered MHA pipeline plus hybrid convolution/MHA dataflow.
  Form: implicit graph/dataflow representation in paper figures and architecture descriptions.
  Serialization / reuse: not found as a standalone IR, dialect, JSON/YAML schema, instruction format, or verifier input.

Mapping or scheduling state:
  Object: binding of convolution and MHA computation to reconfigurable IMC engines, distributor network, reuse buffers, accumulation, and post-processing.
  Form: hardware-resource and data-movement state; likely static per workload/layer.
  Serialization / reuse: mapping decisions are described, but no public inspectable mapping dump or compiler pass output was found.

Hardware abstraction:
  Object: SRAM-based digital IMC macro/engine hierarchy, reconfigurable interconnections, distributor network, reuse buffer, post-processing path.
  Form: architecture template and paper-level block/dataflow description.
  Serialization / reuse: hardware config appears in the paper; no public config file, RTL, simulator API, or macro generator found.

Backend / simulator / codegen:
  Object: TSMC 22 nm evaluation flow and baseline IMC comparison.
  Form: paper-level experiment/evaluation setup.
  Serialization / reuse: no public simulator backend, code generator, instruction stream, or reproduction script found.

Output artifact:
  Object: speedup, energy, and EDP results for MHA workloads and typical multi-scale ViT models.
  Form: paper tables/figures and reported metrics.
  Serialization / reuse: figures appear paper-only in checked sources.

Evaluation loop:
  Object: selected MHA workloads and multi-scale ViT models compared with a baseline IMC accelerator.
  Form: hardware evaluation in TSMC 22 nm.
  Serialization / reuse: benchmark extraction, calibration source, and scripts are unknown / not found in checked sources.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of tensor-stage identities \((Q, K, V, S, S', O)\), layer shape metadata, reordered attention pipeline, fused-MatMul placement, convolution sliding reuse, IMC-engine binding, distributor routing, partial-sum accumulation, and post-processing assumptions. The paper foregrounds accelerator architecture and reconfigurable dataflow, while the reusable semantics are most visible in the implied hardware-resource mapping: which values are kept local, which intermediate matrices are materialized or avoided, and where softmax, accumulation, and data movement are placed.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — Narrow end-to-end co-design.**  
The paper owns a vertically integrated slice from workload topology to specialized digital SRAM-CIM architecture and evaluation. Its input is a family of multi-scale ViT layers with convolution + MHA structure; its output is an evaluated accelerator design with reported speed, energy, and EDP improvements against a baseline IMC accelerator. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
The work performs mapping-like transformations: MHA pipeline reordering, fused matrix multiplication, two-stage softmax placement, and adaptable binding of convolution/MHA to IMC engines through a distributor network. The scheduling/mapping object is described architecturally rather than exposed as a public search state or compiler pass.

**Secondary: A2 — Simulator & cost model, paper-level.**  
The reported TSMC 22 nm evaluation gives latency, energy, and EDP evidence, but no public simulator API, calibration package, or inspectable cost-model implementation was found. The A2 classification is therefore evidence-at-paper-level rather than artifact-backed.

### 5.2 Axis B — middle-layer style

**B4 — Hardware-resource IR.**  
The named middle objects are IMC engines, reconfigurable interconnections, distributor network, reuse buffers, accumulated-result gathering, and post-processing. Decisions made there include whether a layer uses convolutional sliding reuse or attention-specific fused dataflow, how serial input bits are distributed, and how accumulated results return to post-processing. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) Decisions that remain embedded include exact routing configuration, cycle-level arbitration, buffer layout, and legality constraints. A single upstream-readable, verifier-backed artifact was not found.

**B1 — Config-as-IR, implicit.**  
The design suggests configuration state: engine mode, distributor routing, layer shape, and pipeline ordering. Public sources do not expose this as a file format. The reusable boundary would benefit from a compact configuration record describing layer type, tensor shape, engine assignment, distributor fanout, accumulation path, and post-processing stage.

**B2 — Graph-as-IR, paper-level.**  
The paper names the attention graph in terms of \(Q\), \(K\), \(V\), \(S=QK^T\), row-wise softmax, and \(O=S'V\). It also describes hybrid convolution + MHA topology in multi-scale ViTs. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) Graph decisions include reordering and fusion across attention matrix multiplications. Public sources do not show a graph IR that upstream tools can parse or rewrite.

**B3 — Loop / tensor-schedule IR, implicit.**  
Convolution sliding reuse and attention matrix products imply loop/tensor-schedule decisions. The reuse buffer eliminates redundant SRAM access during continuous convolution sliding, and the fused MHA path is a schedule/data-movement transformation. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) The explicit loop nest, tiling, ordering, and buffer index maps are not exposed in checked sources.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware object** | The paper names SRAM-based digital IMC macros/engines and discusses reconfigurability at the IMC engine and interconnect levels. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Bit-slicing / bit significance | **Parameter / implicit** | Indexed text mentions serial input bits distributed to IMC engines. Bit significance, bit-slice typing, and reconstruction metadata were not found as explicit public objects. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| ADC/DAC precision or sensing | **Not applicable for the demonstrated digital-SRAM path** | The paper positions digital SRAM-CIM as avoiding analog nonidealities and costly analog/digital conversion. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Analog-to-digital or domain transition | **Not applicable / outside evidenced path** | No analog sensing or ADC/DAC transition is part of the checked digital-CIM evidence. |
| Peripheral circuits as path nodes | **First-class hardware blocks, not public IR types** | Distributor network, reuse buffer, and post-processing unit are named data-path blocks. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Partial-sum accumulation path | **First-class at architecture level** | The paper states that accumulated computation results are gathered and transmitted to the post-processing unit. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |
| Reconstruction / shift-add tree | **Unknown / implicit** | Serial-bit digital CIM suggests reconstruction may exist in the hardware path, but a public first-class shift-add or reconstruction object was not found in checked sources. |
| Runtime state, masks, KV cache, batching, sparsity | **Unknown / mostly not applicable to demonstrated static image inference** | The workload framing is image-domain multi-scale ViT inference, not autoregressive KV-cache serving or dynamic batching. |
| Value trajectory / flow path | **Approximated through dataflow blocks** | The paper names value stages and block-level paths—reuse buffer, distributor, IMC engine, accumulation, post-processing—but does not expose an identity-preserving value-trajectory IR. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) |

### 5.4 Axis D — rewrite object

The paper’s actual rewrite objects are:

- **Operator/dataflow pipeline:** reordered MHA pipeline, two-stage softmax placement, and fused attention MatMul.
- **Hardware mapping:** convolution and MHA mapped to reconfigurable IMC engines and distributor/interconnect resources.
- **Data movement schedule:** reduced materialization or transfer of quadratic attention intermediates.
- **Memory reuse path:** convolutional sliding reuse through a reuse buffer.
- **Array/engine binding:** assignment of serial input-bit streams and accumulated results to IMC engines and post-processing.

The legal transformations are attention-specific and hardware-resource-specific. They preserve MHA semantics: generation of \(Q,K,V\), attention score computation \(S=QK^T\), row-wise softmax \(S'\), and output computation \(O=S'V\). They also preserve layer-shape compatibility, quantized/digital bit ordering, partial-sum correctness, and output layout expected by downstream convolution or transformer blocks.

The representation is especially well suited to static-shape, image-domain attention/convolution pipelines where data movement dominates. Expressing dynamic token pruning, runtime batching, KV-cache updates, alternative precision per head, or cross-layer bit-sliced partial-sum forwarding would likely require an additional abstraction for runtime state, value identity, and type-like numeric trajectory metadata.

## 6. Technical mechanism reading

### 6.1 Workload mechanism: multi-scale ViT rather than columnar ViT

The paper’s workload target is multi-scale Vision Transformer inference with hybrid convolution + attention topology. It describes standard ViTs as having repeated blocks and relatively fixed hyperparameters, while multi-scale ViTs progressively downsample feature maps, increase channel dimensions, and vary layer sizes. The paper specifically frames Swin, PVT, CvT, and MobileViT as part of the design context for hybrid or multi-scale ViTs. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

For a compiler/IR reader, the important point is that the workload has two incompatible locality patterns:

1. **Convolution:** spatial sliding, local reuse, and channel accumulation.
2. **MHA:** global or windowed token interactions, score matrix formation, row-wise softmax, and a second matrix product with \(V\).

This is why a single fixed CIM dataflow is a poor fit for the paper’s target; the design makes reconfigurability a first-class architecture concern.

### 6.2 MHA computation and quadratic traffic object

The paper describes MHA through the usual sequence: \(Q\), \(K\), and \(V\) are generated from an \(N\)-token input; \(QK^T\) produces the score matrix \(S\); a row-wise softmax produces \(S'\); and \(S'V\) produces the attention output \(O\). It notes that MHA compute and bandwidth scale quadratically with token count \(N\). ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

For IR purposes, the key object is not simply the operator graph, but the **materialization boundary** around \(S\) and \(S'\). A stack that materializes the full \(N \times N\) score or probability matrix creates a high-bandwidth intermediate. The paper’s fused-MatMul and reordered-pipeline reading treats this boundary as rewritable.

### 6.3 Pipeline reordering and two-stage softmax

The paper claims a reordered MHA pipeline and a two-stage softmax method that reduces interconnection complexity between IMC macros. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) This is the most compiler-like contribution in the paper: it moves non-matrix attention work into a form that better matches distributed IMC resources.

The checked public sources do not expose pseudocode, a verifier, or a legality proof for the two-stage softmax. The paper-level reading is that softmax placement becomes a hardware-mapping decision rather than a fixed graph node. A future IR could make this explicit by representing:

- the row dimension over which softmax normalizes,
- local versus global normalization state,
- required reduction statistics,
- placement of exponentiation / normalization / scaling,
- intermediate precision,
- and the return path into the \(S'V\) multiply.

### 6.4 Fused MHA matrix multiplication

The paper states that fused MatMul computation in MHA eliminates redundant intermediate data transfer with quadratic complexity. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) This is the strongest evidence for a dataflow rewrite object. Rather than treating \(QK^T\), softmax, and \(S'V\) as fully separated backend kernels, the architecture seeks a combined flow that reduces intermediate movement.

For a compiler stack, this suggests a useful rewrite pattern:

```text
Q, K, V
  -> score tile / partial score
  -> local or staged softmax state
  -> weighted V accumulation
  -> output tile
```

The paper does not expose this as a reusable rewrite rule or schedule IR, but the mechanism is valuable as an attention-specific lowering template.

### 6.5 Reconfigurable IMC engines and distributor network

The architecture uses reconfigurable IMC-based engines and global interconnect/distributor behavior to support both convolution and MHA. Indexed paper text describes a flexible distributor network that orchestrates IMC engines and enables adaptable mapping for convolutional layers and MHA while maintaining utilization across varying layer sizes. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

A separate architecture snippet states that the reuse buffer eliminates redundant SRAM access during continuous convolution sliding; the distributor network receives serial input bits and distributes them to IMC engines; accumulated computation results are gathered and transmitted to the post-processing unit. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

For compiler/IR purposes, these named blocks form the backend contract:

```text
activation / input bits
  -> reuse buffer
  -> distributor network
  -> IMC engines
  -> accumulation
  -> post-processing
  -> next layer
```

The paper’s public evidence supports this contract at block level. A reusable stack would need machine-readable fields for buffer residency, bit ordering, distributor fanout, engine mode, accumulation width, post-processing operation, and output layout.

### 6.6 Precision, quantization, and digital-CIM assumptions

The paper is framed as **digital SRAM-CIM**, and public snippets explicitly say this avoids analog nonidealities and costly analog/digital conversion. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com)) The checked sources mention serial input bits, which implies bit-level digital feeding into IMC engines, but they do not expose a public precision schema, bit-slice type system, generated shift-add schedule, or quantization propagation rule. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

A corpus classification should therefore separate:

- **evidenced:** digital SRAM-CIM, serial input-bit distribution, accumulated-result gathering;
- **unknown / not found in checked sources:** public bit-slice representation, quantization metadata format, requantization rule, precision verifier, or generated numeric schedule.

### 6.7 Evaluation mechanism

The paper reports evaluation in TSMC 22 nm. The indexed result states 2.20×–2.52× speedup and 40.6%–74.8% energy savings for MHA workloads, plus 44.1%–55.9% EDP reduction for typical multi-scale ViT models versus a baseline IMC accelerator. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

For auditability, the important boundary is that these are paper-level experiment results. Public checked sources did not expose the simulator, RTL, model-shape extractor, benchmark scripts, baseline configuration, or figure-generation workflow.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Attention pipeline order is the compiler-like object

- **Observation:** The paper’s central transformation is not a new frontend or public IR, but a reordered MHA dataflow with fused matrix multiplication and staged softmax.
- **Why it matters for CIM compiler/IR work:** Attention acceleration depends on where large \(N \times N\) intermediates are created, reduced, normalized, stored, or bypassed. That placement is an IR-level concern even when expressed as hardware dataflow.
- **Reusable lesson:** A future CIM compiler should make attention materialization boundaries explicit: score tile, softmax state, probability tile, weighted-\(V\) accumulation, and output tile.

### Insight 2 — The distributor network acts like a hardware-resource IR proxy

- **Observation:** The distributor network receives serial input bits, sends them to IMC engines, and participates in collecting accumulated results through post-processing. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))
- **Why it matters for CIM compiler/IR work:** The distributor is more than an interconnect; it is the point where logical tensor lanes become physical engine traffic.
- **Reusable lesson:** CIM IRs should consider a first-class “routing/distribution” object with fanout, bit order, target engines, timing, and return accumulation path.

### Insight 3 — Two-stage softmax is a placement problem, not just an operator

- **Observation:** The paper claims a two-stage softmax method to reduce IMC macro interconnection complexity. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))
- **Why it matters for CIM compiler/IR work:** Softmax is often treated as a non-CIM peripheral operation, but this paper treats its placement as part of attention dataflow design.
- **Reusable lesson:** Future IRs could represent softmax as decomposable state: local statistics, global reduction, normalization, precision, and placement. That would let compilers reason about fusing, delaying, or distributing normalization.

### Insight 4 — Digital CIM shifts the hard interface from ADC modeling to bit-path and accumulation modeling

- **Observation:** The paper emphasizes digital SRAM-CIM and avoidance of analog nonidealities/conversion, while still exposing serial input bits and accumulated-result paths. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))
- **Why it matters for CIM compiler/IR work:** A digital-CIM IR can avoid ADC/DAC fields, but it still needs precise representation of bit significance, bit-serial timing, accumulation width, and reconstruction or post-processing.
- **Reusable lesson:** Digital-CIM backends benefit from numeric-path metadata even when analog nonideality modeling is unnecessary.

### Insight 5 — Hybrid convolution + MHA stresses resource reconfiguration more than pure-attention mapping

- **Observation:** The paper’s workload is not a pure transformer sequence stack; it targets multi-scale ViTs where convolution and MHA coexist and layer sizes vary. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))
- **Why it matters for CIM compiler/IR work:** A backend that is excellent for one large attention shape may underutilize resources across pyramid-style image models.
- **Reusable lesson:** Corpus entries should distinguish transformer-CIM papers by topology: columnar ViT, windowed attention, pyramid/multi-scale ViT, hybrid convolution-attention, and autoregressive KV-cache serving.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** N/A.
- **License:** Unknown / not found in the checked sources.
- **Last checked date:** 2026-05-15.
- **Checked public sources:** ACM DOI/PDF listing via indexed text, DBLP bibliographic record, public literature lists, author/title web search, GitHub/code/artifact/repository searches. DBLP identifies the paper as DAC 2024 paper 245:1–245:6 and indicates closed access for the DOI record. ([DBLP](https://dblp.org/rec/conf/dac/Chen0L0L0JY024))
- **What the artifact contains:** No public artifact found.
- **What the paper provides:** Architecture/dataflow descriptions and paper-level performance/energy/EDP evaluation.
- **What appears to be omitted from public artifacts:** frontend, serializable IR, mapping dump, verifier, compiler API, ISA, simulator API, RTL package, benchmark extraction scripts, baseline configuration, figure reproduction workflow.
- **Minimal command or workflow:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from artifact:** Unknown; no public reproduction package found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | The paper describes MHA and multi-scale ViT workload structure, but no public model-import format or workload schema was found. |
| Intermediate representation serialized | Unknown | No serializable IR, dialect, graph schema, schedule dump, or config file found. |
| Mapping decisions inspectable | Partial | Mapping concepts are described through reconfigurable IMC engines and distributor behavior; no public mapping output found. |
| Schedule inspectable | Partial | MHA pipeline reordering, fused MatMul, and convolution sliding reuse are described; no inspectable schedule artifact found. |
| Hardware config explicit | Partial | Hardware hierarchy and blocks are named in the paper; no public machine-readable config found. |
| Precision / bit-slice assumptions explicit | Partial | Digital SRAM-CIM and serial input bits are evidenced; bit significance, accumulation width, and quantization schema were not found in public checked sources. |
| Cost model inspectable | Unknown | Reported energy/latency/EDP results exist, but no public cost-model implementation found. |
| Simulator backend documented | Unknown | TSMC 22 nm evaluation is reported; simulator/RTL/backend workflow not found publicly. |
| Generated code / instruction stream inspectable | N/A / Unknown | No public ISA or instruction stream found. |
| Provenance from source op to backend action | Partial | The paper links MHA/conv patterns to hardware dataflow concepts; no source-op-to-engine trace found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial / Unknown | TSMC 22 nm evaluation is reported; public calibration files or detailed reproduction package were not found. |

### 8.3 Integration helper

- **As frontend:** Reuse is limited as a frontend. The paper describes workloads and tensor stages, but no parser, model importer, or graph input format was found.
- **As IR inspiration:** Strong candidate. The useful abstractions are reordered attention pipeline, fused MHA materialization boundary, two-stage softmax placement, distributor routing, reuse-buffer residency, and accumulated-result path.
- **As mapper/scheduler:** Conceptually reusable. Mapping logic could be adapted by representing layer shape, MHA stage, convolution sliding window, IMC-engine mode, distributor fanout, and post-processing placement.
- **As cost model:** Paper-level metrics could inform a backend plugin for digital SRAM-CIM data movement, engine utilization, MHA intermediate traffic, and convolution reuse. Direct reuse would require reconstructing the cost equations and calibration assumptions.
- **As backend:** Wrapping as a backend would require a new implementation because no public simulator, codegen interface, ISA, or RTL package was found.
- **As benchmark:** Useful benchmark inspiration for multi-scale ViT and hybrid conv-attention CIM evaluation. Reuse would benefit from extracting exact layer shapes, precision assumptions, and baseline configuration from the paper.
- **As validation source:** The TSMC 22 nm reported results can serve as paper-level validation targets, but calibration into another tool would require more detailed public modeling data.

**Integration effort estimate: High.**  
Integration would be most direct through a new adapter that reconstructs the paper’s implicit mapping state: MHA stage graph, layer shapes, engine modes, distributor routing, buffer reuse, accumulation, and post-processing. The most valuable reusable boundary appears to be the attention-dataflow transformation and hardware-resource contract. Effort is high because no public artifact, serialized IR, simulator API, or reproduction scripts were found.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially because it names the high-level attention values \(Q\), \(K\), \(V\), \(S\), \(S'\), and \(O\), and it also names block-level hardware flow through reuse buffers, distributor network, IMC engines, accumulated-result gathering, and post-processing. ([ACM Digital Library](https://dl.acm.org/doi/epdf/10.1145/3649329.3658244?utm_source=chatgpt.com))

The closest approximation to trajectory semantics is the paper’s dataflow path:

```text
input / activation bits
  -> reuse buffer or MHA input path
  -> distributor network
  -> IMC engines
  -> accumulated results
  -> post-processing
  -> next layer output
```

The demonstrated abstraction centers on accelerator dataflow and resource mapping. A trajectory-level extension would likely attach the following metadata to each value or tile:

- logical tensor identity: \(Q\), \(K\), \(V\), score tile, softmax state, weighted-\(V\) partial, output tile;
- physical location: SRAM bank, reuse buffer, distributor lane, IMC engine, accumulator, post-processing unit;
- numeric state: bit position, precision, accumulation width, scaling state, post-processing operation;
- materialization state: virtual, partially accumulated, locally normalized, globally normalized, stored, or forwarded;
- movement state: fanout, gather path, reuse count, and destination stage.

For the specific trajectory rewrites:

| Trajectory rewrite | Fit with this paper |
|---|---|
| Fusing reconstruction with downstream reduction | Conceptually related through fused MHA MatMul and post-processing, but reconstruction metadata was not found as an explicit public object. |
| Delaying or retiming ADC conversion | Mostly not applicable to the demonstrated digital-SRAM path; the paper avoids analog/digital conversion rather than scheduling it. |
| Carrying bit-sliced partial sums across operator boundaries | The serial input-bit and accumulation path are relevant ingredients, but a type-like bit-slice/partial-sum IR was not found. |
| Changing reduction tree structure | Related to two-stage softmax and accumulated-result gathering; expressing general reduction-tree rewrites would require explicit reduction-state objects. |
| Routing values through alternative peripheral paths | Strongly related to the distributor network and reconfigurable interconnect. A trajectory IR could make those paths first-class. |
| Co-optimizing data movement and numeric reconstruction | Aligned with the paper’s data-movement motivation, especially fused MHA computation; full expression would require numeric-state and reconstruction metadata. |

Overall trajectory-IR relevance: **medium**. The paper is valuable as a case study for attention-specific value movement through CIM resources, but its public abstraction is block-level dataflow rather than an identity-preserving value-trajectory representation.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **TranCIM** | Transformer acceleration on digital CIM; multiple operation modes for transformer workloads | TranCIM is listed as a transformer-oriented digital CIM accelerator, while this paper targets multi-scale image ViTs with hybrid convolution + MHA and emphasizes reconfigurable dataflow plus two-stage softmax. ([GitHub](https://github.com/BUAA-CI-Lab/Literatures-on-SRAM-based-CIM)) | Separate “transformer-CIM” entries by workload topology and the object being rewritten: operation mode, attention dataflow, sparsity, or hardware mapping. |
| **MuITCIM** | Transformer CIM acceleration with attention-oriented sparsity/dataflow concerns | MuITCIM is positioned around multimodal transformer CIM and attention-token-bit hybrid sparsity; this paper centers on static image multi-scale ViT topology and conv/MHA reconfiguration. ([GitHub](https://github.com/BUAA-CI-Lab/Literatures-on-SRAM-based-CIM)) | The corpus should distinguish sparsity-first transformer CIM from topology/dataflow-first hybrid ViT CIM. |
| **PIMCA / programmable IMC accelerator line** | Digital SRAM-CIM backend and DNN acceleration | PIMCA-style work exposes a programmable accelerator with custom ISA and hardware-loop support, while this paper’s public evidence is architecture/dataflow without a public ISA or compiler handoff. ([Google Patents](https://patents.google.com/patent/US20220318610A1/en?utm_source=chatgpt.com)) | ISA-bearing CIM stacks provide a clearer backend contract; dataflow-only papers may still encode important hidden IR concepts. |
| **FDCA** | Digital-CIM accelerator dataflow for neural inference | FDCA is listed as a fine-grained digital-CIM CNN accelerator with hybrid quantization and weight-stationary dataflow, whereas this paper handles both convolution and MHA with attention-specific fusion/softmax placement. ([GitHub](https://github.com/BUAA-CI-Lab/Literatures-on-SRAM-based-CIM)) | CNN dataflow concepts transfer partly, but attention requires explicit representation of score/probability materialization and normalization. |
| **HEIRS** | Transformer acceleration using CIM hierarchy | HEIRS is listed as a hybrid 3D RRAM/SRAM-CIM accelerator for multi-task transformer acceleration; this paper stays in digital SRAM-CIM and focuses on multi-scale ViT hybrid topology. ([GitHub](https://github.com/BUAA-CI-Lab/Literatures-on-SRAM-based-CIM)) | Corpus classification should separate memory technology from compiler object: technology may differ while mapping/dataflow questions overlap. |
| **IMTP / tensor-program mapping work** | Compiler/mapping orientation for in-memory tensor programs | IMTP-style work describes search-based code generation and lowering to loop-based tensor IR; this paper contributes architecture-specific dataflow without a public loop IR or compiler artifact. ([arXiv](https://arxiv.org/pdf/2412.19630v1?utm_source=chatgpt.com)) | Explicit lowering artifacts are easier to integrate, but architecture papers can still provide valuable rewrite patterns and backend contracts. |

## 11. Corpus-ready final takeaway

- The paper’s real contribution is a **digital SRAM-CIM accelerator architecture and reconfigurable dataflow** for multi-scale image ViTs with hybrid convolution + MHA topology.
- The strongest reusable stack layer is the **backend mapping/dataflow layer**, especially MHA pipeline reordering, two-stage softmax placement, fused attention MatMul, distributor routing, and reuse-buffer/accumulation paths.
- The evidenced scope is **static-shape multi-scale ViT inference** evaluated in TSMC 22 nm against a baseline IMC accelerator, with reported MHA speedup/energy gains and whole-model EDP reduction.
- First-class objects are primarily **hardware resources and dataflow stages**: digital SRAM-CIM engines, distributor network, reuse buffer, accumulated-result path, post-processing, and MHA tensor stages.
- The hidden IR is the combination of **operator stage identity, layer shape, engine mode, distributor mapping, buffer residency, partial-sum path, and post-processing placement**.
- **Artifact status: no public artifact found.** No public compiler, simulator API, serialized IR, ISA, verifier, scripts, or reproducibility harness was found in checked sources.
- Integration is most plausible as **IR inspiration, mapper/scheduler design input, benchmark motivation, and paper-level validation target**, rather than as a directly reusable software stack.
- For value-trajectory IR work, the paper is useful because it exposes attention value movement through CIM resources, but a trajectory-level system would need explicit metadata for value identity, bit significance, precision stage, routing, accumulation, and materialization state.

## 12. Suggested metadata entry

```yaml
paper: "An In-Memory Computing Accelerator with Reconfigurable Dataflow for Multi-Scale Vision Transformer with Hybrid Topology"
year: 2024
venue: "DAC 2024"
authors_or_group: "Zhiyuan Chen; Yufei Ma; Keyi Li; Yifan Jia; Guoxiang Li; Meng Wu; Tianyu Jia; Le Ye; Ru Huang"
technology:
  - SRAM-CIM
  - digital-CIM
workloads:
  - multi-scale Vision Transformer inference
  - hybrid convolution + MHA image models
  - MHA workloads
  - convolutional layers
axis_A:
  primary: A5 narrow end-to-end co-design
  secondary:
    - A3 mapping / scheduling / DSE framework
    - A2 simulator & cost model, paper-level evaluation
axis_B:
  - B4 Hardware-resource IR
  - B1 Config-as-IR, implicit
  - B2 Graph-as-IR, paper-level
  - B3 Loop / tensor-schedule IR, implicit
axis_C_first_class_objects:
  - digital SRAM-CIM macro / IMC engine
  - reconfigurable IMC engine
  - distributor network
  - reuse buffer
  - accumulated-result path
  - post-processing unit
  - MHA tensor stages Q/K/V/S/Sprime/O
  - fused MHA MatMul dataflow
axis_D_rewrite_objects:
  - operator/dataflow pipeline
  - hardware mapping
  - data movement schedule
  - array/engine binding
  - memory reuse path
  - softmax placement
artifact:
  status: "no public artifact found"
  url: ""
  license: "Unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - benchmark
  - validation
reproducibility_level: low
trajectory_IR_relevance: medium
notes:
  - "Best understood as a hardware-software co-design and layer-specific architecture contribution."
  - "The reusable interface is clearest at the reconfigurable dataflow and hardware-resource mapping boundary."
  - "Public evidence supports MHA pipeline reordering, two-stage softmax placement, fused MatMul, reconfigurable IMC engines/interconnects, reuse buffering, accumulation, and post-processing."
  - "No public frontend, serializable IR, verifier, compiler API, ISA, simulator API, or reproduction harness was found in checked sources."
```