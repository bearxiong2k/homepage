---
slug: nax
title: "NAX: Neural Architecture and Memristive Xbar based Accelerator Co-design"
short_title: "NAX"
subtitle: "Scoped CIM stack note"
year: 2022
venue: "DAC 2022 / Proceedings of the 59th ACM/IEEE Design Automation Conference"
authors_or_group: "Shubham Negi, Indranil Chakraborty, Aayush Ankit, Kaushik Roy"
summary: >-
  NAX is a hardware-aware neural architecture search framework for CNN inference on memristive crossbar array IMC accelerators. Its main contribution is not a general compiler IR, but a search formulation that makes **per-layer coupling between neural operation choice and crossbar-size binding** explicit: convolution kernels in a ResNet-derived super-network are searched together with crossbar sizes, and the selected architecture is evaluated against accuracy, energy, and area-normalized latency objectives. The stack slice strengthened by the paper is the mapper/DSE layer between a CNN graph and a PUMA-like analog crossbar accelerator model, with nonideality feedback supplied through GENIEx and hardware-efficiency feedback through per-operation lookup-table costs. The demonstrated setting is static CNN inference on CIFAR-10 and Tiny ImageNet using ResNet-20/ResNet-18-derived search spaces, with simulator-backed comparisons against homogeneous-crossbar ResNet baselines. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
links:
  paper: https://arxiv.org/pdf/2106.12125
  artifact:
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
  - "memristive-crossbar"
workloads:
  - "CNN inference"
  - "CIFAR-10 / ResNet-20-derived search space"
  - "Tiny ImageNet / ResNet-18-derived search space"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A2]
axis_B: [B2, B4, B6, B1]
axis_C_first_class_objects:
  - "crossbar size"
  - "per-layer operation-to-crossbar binding"
  - "MVMU utilization"
  - "ADC precision formula"
  - "bit stream"
  - "bit slice"
  - "Ron/Roff/Vsupply"
  - "nonideality feedback through GENIEx"
axis_D_rewrite_objects:
  - "operator graph"
  - "hardware mapping"
  - "array binding"
  - "accuracy model feedback"
  - "cost-model ranking"
artifact:
  status: "no public artifact found"
  url: 
  license: 
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Strongest evidence is for per-layer co-search over CNN operation and crossbar size."
  - "Cost model boundary is a per-operation latency/energy lookup table."
  - "GENIEx supplies nonideality-aware architecture-update feedback."
  - "No public NAX code, config schema, generated mapping file, or reproduction script was found in checked sources."
takeaways: []
---

# NAX — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with **A5 narrow end-to-end co-design** and **A2 simulator/cost-model** support | NAX’s central object is a NAS/DSE search state that jointly chooses DNN operation choices and per-layer crossbar size. The paper evaluates the choices through simulator-backed hardware-efficiency tables and GENIEx nonideality-aware inference, rather than through a general compiler backend or ISA contract. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B6 Accuracy / nonideality modeling**, partial **B1 Config-as-IR** | The named middle representation is an over-parameterized DAG whose edges are mixed operations; each candidate operation is coupled to a crossbar-size choice and a zero operator for depth selection. Hardware parameters appear as table/config-like assumptions, while GENIEx supplies the nonideality feedback path. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| First-class CIM objects, Axis C | Crossbar size, operation-to-crossbar binding, MVMU utilization, ADC precision as a function of crossbar size, bit stream, bit slice, Ron/Roff/Vsupply, nonideality model | Crossbar size is directly searched per layer; Table I makes bit stream, bit slice, ADC precision, and device-level values explicit; the PUMA-like mapping discussion names MVMU partitioning and under-utilized MVMUs. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Rewrite object, Axis D | **Operator graph + hardware mapping / array binding + accuracy-cost ranking** | The framework rewrites the super-network by selecting one path per edge: kernel choice, crossbar size, and possible zero operation. It does not present a serialized instruction stream or frontend-neutral IR; the demonstrated rewrite is search-driven architecture/mapping selection. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Best corpus tags | `analog-CIM`, `RRAM-CIM`, `memristive-crossbar`, `NAS`, `compiler-mapping`, `hardware-software-codesign`, `DNN-inference`, `nonideality-modeling`, `PUMA-like`, `cost-model` | The paper is about memristive crossbar array IMC for CNN inference with NAS-based co-design and GENIEx-backed nonideality modeling. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Closest comparison baselines | **PUMA**, **GENIEx**, **DNN+NeuroSim**, **MNSIM**, **PIMCOMP**, **XploreNAS / CrossNAS** | PUMA is the closest programmable memristive accelerator substrate; GENIEx is the nonideality model NAX invokes; DNN+NeuroSim and MNSIM are adjacent simulator/cost-model stacks; PIMCOMP is a fuller compiler contrast; XploreNAS/CrossNAS are later NAS-style analog-PIM co-design relatives. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

NAX is a hardware-aware neural architecture search framework for CNN inference on memristive crossbar array IMC accelerators. Its main contribution is not a general compiler IR, but a search formulation that makes **per-layer coupling between neural operation choice and crossbar-size binding** explicit: convolution kernels in a ResNet-derived super-network are searched together with crossbar sizes, and the selected architecture is evaluated against accuracy, energy, and area-normalized latency objectives. The stack slice strengthened by the paper is the mapper/DSE layer between a CNN graph and a PUMA-like analog crossbar accelerator model, with nonideality feedback supplied through GENIEx and hardware-efficiency feedback through per-operation lookup-table costs. The demonstrated setting is static CNN inference on CIFAR-10 and Tiny ImageNet using ResNet-20/ResNet-18-derived search spaces, with simulator-backed comparisons against homogeneous-crossbar ResNet baselines. ([arXiv](https://arxiv.org/pdf/2106.12125)) |

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| NAX co-designs a neural network and IMC hardware architecture by exploring DNN parameters and crossbar size. | Abstract and introduction | Paper-only + algorithm + experiment | The paper defines a search over CNN operation choices and crossbar sizes, then reports selected mixed-crossbar networks on CIFAR-10 and Tiny ImageNet. ([arXiv](https://arxiv.org/pdf/2106.12125)) | Demonstrated for ResNet-derived CNN inference search spaces on a PUMA-like memristive crossbar accelerator model. |
| Crossbar size affects both hardware efficiency and application accuracy. | Section III, Fig. 3, Fig. 5 | Experiment + mapping analysis | The paper explains flattening convolution weights into 2D matrices, partitioning them onto MVMUs, and showing under-utilization as a function of output channels and crossbar size. It also reports nonideal accuracy changes for ResNet-20 across crossbar sizes. ([arXiv](https://arxiv.org/pdf/2106.12125)) | Evidenced through simulator-backed analysis of selected convolution operations and ResNet-20 on CIFAR-10. |
| The search space should include both DNN model choices and crossbar-size choices. | Section IV-A/B, Fig. 6 | Algorithm + equation | The over-parameterized network is a DAG of edges, each edge is a mixed operation, and candidate operations are mapped to different crossbar sizes plus a zero operator for depth selection. ([arXiv](https://arxiv.org/pdf/2106.12125)) | The reusable representation is clearest as a per-edge candidate set, not as a standalone serialized IR. |
| Nonideal crossbar effects should be considered during architecture-parameter updates. | Section IV-B, Fig. 6 | Algorithm + simulator use | During architecture-parameter updates, selected-architecture inference is routed through GENIEx; the weight-update step uses ideal crossbars while architecture updates use nonideal crossbars in the described flow. ([arXiv](https://arxiv.org/pdf/2106.12125)) | The paper-level evidence supports the feedback loop; artifact-level confirmation would require public NAX scripts/configs. |
| Energy and latency should enter the differentiable loss. | Section IV-C, Eq. 4–6 | Equation + cost model | Expected hardware efficiency is computed as a probability-weighted lookup-table cost over candidate operations, summed across edges, then added to cross-entropy loss with latency and energy weights. ([arXiv](https://arxiv.org/pdf/2106.12125)) | The cost-model interface is a lookup table over the search space; schema, calibration scripts, and generated tables are not exposed in a located public artifact. |
| Multi-objective optimization improves hardware efficiency compared with optimizing none or one hardware-efficiency term. | Section V-A, Table II | Experiment | CIFAR-10 ablation reports energy/latency/accuracy for no hardware term, energy-only, latency-only, and latency+energy objectives. ([arXiv](https://arxiv.org/pdf/2106.12125)) | Demonstrated for the CIFAR-10 i-search setting, not across arbitrary models or accelerators. |
| NAX improves EDAP and accuracy over homogeneous-crossbar ResNet baselines. | Abstract, Tables III–IV, result discussion | Experiment | On CIFAR-10, NAX mixed-crossbar variants are compared with ResNet-20 at 128, 64, 32, and 16 crossbar sizes; on Tiny ImageNet, NAX variants are compared with ResNet-18 at 128 and 64 crossbar sizes. ([arXiv](https://arxiv.org/pdf/2106.12125)) | The paper-level evidence is simulator-backed and benchmark-specific; reproduction from public code was not found. |
| GENIEx makes nonideal search practical enough for these experiments. | Section V-A/B | Simulator use + implementation description | The paper says GENIEx uses bit-serial compute units for MVM and custom conv2d/linear libraries, and that the authors added output-activation tiling and multi-GPU support for speedup. ([arXiv](https://arxiv.org/pdf/2106.12125)) | The implementation is described in text; no public NAX artifact was located to inspect the modifications. |

## 4. Stack anatomy

```text
Input / frontend:
  ResNet-20 for CIFAR-10 and ResNet-18 for Tiny ImageNet are used as backbones.
  The input is a CNN search space, not a frontend-neutral model import format.
  The paper describes replacing convolution layers in residual blocks with mixed layers.
  Serialized / inspectable / documented / reusable: documented in paper; no located serialized frontend schema.

Middle representation:
  Over-parameterized DAG N(e1, ..., en), where each edge is a mixed operation over candidate operations.
  Candidate operations combine convolution kernel choices with crossbar-size choices, plus a zero operator.
  Serialized / inspectable / documented / reusable: mathematically described and figure-visible; no located public IR file.

Mapping or scheduling state:
  Architecture parameters α, path probabilities p, binary gates g, and selected path per edge.
  The mapping state binds each selected operation to a crossbar size.
  Serialized / inspectable / documented / reusable: visible in equations and result figures; no located artifact exposing search traces.

Hardware abstraction:
  PUMA-like hierarchy: node, tile, core, MVMU, analog crossbars.
  Hardware parameters include bit stream = 1 bit, bit slice = 2 bit, ADC precision = log2(N*3), Ron, Roff, and Vsupply.
  Serialized / inspectable / documented / reusable: table-documented; no located backend contract or config schema.

Backend / simulator / codegen:
  GENIEx is used for nonideality-aware inference during architecture-parameter updates.
  Hardware efficiency F(.) is a lookup table containing latency and energy for operations in the search space.
  No generated PUMA ISA, compiler output, or instruction stream is reported as NAX output.
  Serialized / inspectable / documented / reusable: backend assumptions are paper-described; no located NAX code/artifact.

Output artifact:
  A compact CNN architecture with per-layer kernel and crossbar-size choices, shown in figures and tables.
  Output is a searched architecture/mapping, not a general codegen artifact.
  Serialized / inspectable / documented / reusable: result figures/tables are inspectable; machine-readable output format unknown.

Evaluation loop:
  Alternates weight-parameter updates and architecture-parameter updates.
  For ni-search, selected architecture inference during architecture updates uses GENIEx; for i-search, nonidealities are not considered.
  The final compact network is selected by maximum architecture-parameter value per edge.
```

The paper’s effective intermediate state appears to be the combination of the over-parameterized CNN DAG, per-edge architecture parameters, binary path gates, operation-to-crossbar candidate labels, the hardware-efficiency lookup table, and GENIEx’s nonideality-aware inference path. The paper foregrounds NAS, while the reusable semantics are most visible in the per-edge candidate set: “operation + crossbar size + cost + nonideal accuracy feedback.” ([arXiv](https://arxiv.org/pdf/2106.12125))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.** NAX owns the search/mapping slice: given a CNN backbone-derived super-network, it selects candidate operations and per-layer crossbar sizes under accuracy, latency, and energy objectives. Its input is a DNN search graph; its output is a compact network plus crossbar-size assignment. ([arXiv](https://arxiv.org/pdf/2106.12125))

**Secondary: A5 Narrow end-to-end co-design.** The work spans model architecture, crossbar-size hardware choice, simulator-backed hardware efficiency, and nonideality-aware accuracy, but the demonstrated scope is a specific analog MCA/PUMA-like CNN inference co-design loop rather than a portable compiler stack. ([arXiv](https://arxiv.org/pdf/2106.12125))

**Secondary: A2 Simulator & cost model.** NAX relies on a latency/energy lookup table and GENIEx for nonideality modeling. The paper cites GENIEx as modeling real-crossbar nonidealities using a neural network and uses it during architecture updates. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.** The named middle representation is the over-parameterized DAG `N(e1, ..., en)`. Decisions made there include operation selection, depth selection via zero operator, and path selection through architecture parameters and binary gates. Decisions embedded outside the graph include hardware cost-table construction, GENIEx configuration, and final simulator assumptions. There is no located single artifact that upstream passes could read, verify, and rewrite. ([arXiv](https://arxiv.org/pdf/2106.12125))

**B4 Hardware-resource IR.** Crossbar size is embedded into each candidate operation, so hardware binding is part of the search object. The representation is resource-aware at the array-size level but does not expose a full resource hierarchy as a typed, rewritable object. The PUMA-like hierarchy is described in prose as cores, tiles, nodes, and MVMUs. ([arXiv](https://arxiv.org/pdf/2106.12125))

**B6 Accuracy / nonideality modeling.** GENIEx is the nonideality feedback mechanism. The paper uses GENIEx during architecture-parameter updates and reports ideal versus nonideal accuracies. This makes nonideal accuracy part of the search objective loop, although the nonideality semantics are delegated to the simulator/model rather than represented in a public IR. ([arXiv](https://arxiv.org/pdf/2106.12125))

**Partial B1 Config-as-IR.** Hardware parameters are table-like and config-like: bit stream, bit slice, ADC precision, Ron, Roff, and supply voltage. The paper gives values, but no public config file or schema was found. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class at crossbar-size binding level; hierarchy described** | Candidate operations are mapped to crossbar sizes; PUMA-like node/tile/core/MVMU hierarchy is described. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Bit-slicing / bit significance | **Parameter** | Table I gives bit slice = 2 bit and bit stream = 1 bit. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| ADC/DAC precision or sensing | **Parameter / cost driver** | Table I sets ADC precision to `log2(N*3)`; the introduction frames ADC precision as a hardware parameter dependent on crossbar size. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Analog-to-digital or domain transition | **Costed implicitly** | ADC/peripheral cost motivates crossbar-size efficiency, and the lookup table costs latency/energy per operation; explicit domain-transition objects are not surfaced. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Peripheral circuits as path nodes | **Costed implicitly** | Under-utilized crossbars still access peripherals; this affects energy and latency. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Partial-sum accumulation path | **Implicit** | MVMU partitioning and bit-serial compute are described, but partial-sum paths are not named as rewritable objects. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Reconstruction / shift-add tree | **Implicit / not separately represented** | Bit stream and bit slice are parameters, but reconstruction is not exposed as a first-class transformation target in the checked sources. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Runtime state, masks, KV cache, batching, sparsity | **Parameter / implementation detail for tiling; otherwise not applicable to the CNN setting** | GENIEx tiling and multi-GPU support are described for search-time inference; KV cache and dynamic batching are outside the demonstrated workload. ([arXiv](https://arxiv.org/pdf/2106.12125)) |
| Value trajectory / flow path | **Approximated through simulator and cost model** | The paper models MVM, crossbar nonidealities, and per-operation costs, but value identity across analog partial sums, sensing, reconstruction, and digital accumulation is not a named IR object. ([arXiv](https://arxiv.org/pdf/2106.12125)) |

### 5.4 Axis D — rewrite object

NAX rewrites the **operator graph** and **hardware mapping**. Legal transformations include selecting one path per mixed edge, changing convolution kernel size, choosing per-layer crossbar size, and selecting a zero operator to reduce depth. The equivalence exploited is neural-architecture substitution within a super-network: candidate convolution operations are treated as alternative implementations for an edge, with different accuracy and hardware-efficiency consequences. ([arXiv](https://arxiv.org/pdf/2106.12125))

Information preserved across lowering includes tensor shape compatibility, residual-block structure, layer ordering, operation identity, selected crossbar size, and enough hardware context to query latency/energy and GENIEx nonideality behavior. The representation is especially well suited to “choose this CNN operation on this crossbar size”; expressing instruction scheduling, cross-layer bit-sliced accumulation, ADC retiming, or alternative peripheral routing would likely require an additional abstraction for value path, numeric stage, and backend resource schedule. ([arXiv](https://arxiv.org/pdf/2106.12125))

## 6. Technical mechanism reading

### 6.1 Search-space coupling

NAX starts from a CNN backbone and replaces convolution layers with mixed layers. For CIFAR-10, the backbone is ResNet-20 and the mixed layer includes kernels `{3x3, 5x5, 7x7}` mapped to crossbar sizes `{128x128, 64x64, 32x32, 16x16}`. For Tiny ImageNet, the backbone is ResNet-18 and the mixed layer uses kernels `{3x3, 5x5}` with crossbar sizes `{128x128, 64x64}`. This is the central compiler/IR insight: the “operation” being searched is not merely a neural op, but a neural op already paired with a hardware binding. ([arXiv](https://arxiv.org/pdf/2106.12125))

The over-parameterized network is defined as a DAG `N(e1, ..., en)`, with each edge set to a mixed operation over a candidate space `O`. Path-level pruning allows one active path per layer, and architecture parameters are transformed into binary gates for stochastic single-path selection. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 6.2 Mapping model: convolution to MVMUs

For a convolution with input activation `Hi x Wi x I` and kernel `K x K x I x O`, NAX follows a PUMA-like mapping: kernels are flattened and stored as columns of a 2D matrix, input feature maps are flattened into vectors, and the weight matrix is partitioned into crossbar-sized chunks mapped to MVMUs. Under-utilized MVMUs still activate peripherals, so layer shape and crossbar size jointly affect energy and area-normalized latency. ([arXiv](https://arxiv.org/pdf/2106.12125))

This motivates heterogeneous crossbar sizes: small output-channel layers can waste large crossbars, while layers with more output channels can amortize peripheral overhead better on larger crossbars. The result is a mapping problem over layer-specific utilization, not a global “largest crossbar is always best” rule. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 6.3 Nonideality-aware feedback

The paper models crossbar nonidealities such as parasitic resistances and nonlinear device I–V behavior. GENIEx is used to estimate accuracy degradation from these nonidealities, and the paper reports that large 128x128 crossbars can incur the largest accuracy drop in its ResNet-20/CIFAR-10 analysis, while smaller crossbars show different tradeoffs. ([arXiv](https://arxiv.org/pdf/2106.12125))

During search, NAX alternates weight updates and architecture-parameter updates. Weight parameters are trained with architecture parameters frozen. Then weights are frozen, binary gates are reset, and architecture parameters are updated on validation data; in ni-search, the selected architecture’s inference during this architecture-update step goes through GENIEx. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 6.4 Cost model and objective

The hardware-efficiency model is represented as a lookup table `F(.)` containing latency and energy for each operation in the search space. For edge `ei`, expected hardware efficiency is a probability-weighted sum over candidate operations; whole-network expected hardware efficiency sums over edges. The loss adds expected latency and expected energy to cross-entropy and weight decay:

`Loss = LossCE + λ1 ||w||²₂ + λ2 E[latency] + λ3 E[energy]`.

This is the clearest backend contract in NAX: “given a candidate operation with a crossbar binding, return latency and energy.” ([arXiv](https://arxiv.org/pdf/2106.12125))

### 6.5 Workload and simulator assumptions

The experiments are conducted on CIFAR-10 and Tiny ImageNet, using four NVIDIA RTX 2080Ti GPUs for NAX search/training. Table I sets bit stream, bit slice, ADC precision, Ron, Roff, and supply voltage. The GENIEx functional simulator uses bit-serial compute units for MVM and custom conv2d/linear operation libraries; to address high search-time cost, the authors describe adding output-activation tiling and multi-GPU support, and sampling a subset of layers for nonideal mapping during architecture updates. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 6.6 Experimental evidence

On CIFAR-10, Table III compares homogeneous-crossbar ResNet-20 baselines with NAX-i and NAX-ni mixed-crossbar networks. The paper reports that NAX-ni2 has 17% lower EDAP and 0.8% higher accuracy than the best nonideal-accuracy ResNet-20 baseline, and that NAX-ni3 improves EDAP and accuracy relative to the best-EDAP ResNet-20 baseline. On Tiny ImageNet, Table IV compares ResNet-18 baselines with NAX-i and NAX-ni variants; the paper reports NAX-ni2 has 0.2% higher accuracy with 4.4% lower EDAP than the best nonideal-accuracy ResNet-18 baseline. ([arXiv](https://arxiv.org/pdf/2106.12125))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Crossbar size is part of the neural operation, not just backend placement

- **Observation:** NAX’s candidate operation is effectively “kernel choice + crossbar size,” so the hardware binding is folded into the super-network search space.
- **Why it matters for CIM compiler/IR work:** This suggests an IR design where operator alternatives carry resource-binding annotations early enough to influence accuracy and cost, rather than treating mapping as a late backend pass.
- **Reusable lesson:** A future CIM IR could represent an op variant as `(semantic_op, shape, array_binding, precision_stage, cost_handle, nonideality_handle)`.

### Insight 2 — Mapping legality and cost ranking are separated but coupled

- **Observation:** The search graph provides legal alternatives; the lookup table `F(.)` ranks them by expected energy/latency, while GENIEx feeds back accuracy impact.
- **Why it matters for CIM compiler/IR work:** This is a useful separation of concerns: the IR can enumerate legal candidates, while backend plugins attach cost and fidelity.
- **Reusable lesson:** A compiler stack could standardize the candidate schema and allow multiple cost plugins: utilization, peripheral energy, ADC latency, nonideal accuracy, and area pressure.

### Insight 3 — Nonideality is inserted at architecture-update time

- **Observation:** NAX routes architecture-parameter updates, not every weight update, through GENIEx in ni-search.
- **Why it matters for CIM compiler/IR work:** This is a pragmatic approximation for expensive analog-fidelity models: use high-cost fidelity during decisions that choose architecture/mapping, while cheaper ideal execution trains weights.
- **Reusable lesson:** A future IR pass manager could support tiered fidelity modes, e.g., ideal, table-estimated, sampled-nonideal, and full-nonideal.

### Insight 4 — The strongest reusable boundary is the per-operation hardware table

- **Observation:** The paper’s clearest backend-facing object is the lookup table over candidate operations and crossbar sizes.
- **Why it matters for CIM compiler/IR work:** Even without a public compiler artifact, this is a concrete interface: a mapper can ask for `{energy, latency}` for each candidate op/resource binding.
- **Reusable lesson:** Corpus entries should record whether a paper’s cost table is operation-local, layer-local, schedule-local, or full-system; NAX is primarily operation/layer-local with network-level summation.

### Insight 5 — Heterogeneous crossbar assignment is the paper’s hidden “IR result”

- **Observation:** The final result is not merely a better CNN; it is a CNN whose layers carry heterogeneous crossbar-size labels.
- **Why it matters for CIM compiler/IR work:** That label is a mapping annotation with downstream implications for tiling, ADC precision, utilization, and nonideality.
- **Reusable lesson:** Future corpora should treat “selected architecture diagram with per-layer XBsize labels” as a mapping-state artifact, even when no explicit IR file exists.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **Checked sources:** arXiv paper page, ACM/DBLP metadata, author publication page, CatalyzeX entry, and the author’s visible GitHub repositories.
- **Evidence from checked sources:** The author publication page presents the NAX paper and summary but no code link in the visible page content; CatalyzeX shows “Request Code”; the author’s visible GitHub repositories include PUMA simulator/compiler forks and NAS-Bench-related repositories, but no visible NAX repository in the checked repository listing. ([Personal Website](https://negishubham.github.io/publications/nax))
- **License:** N/A for NAX artifact; no artifact license found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** N/A.
- **What the artifact appears to omit:** N/A; because no public NAX artifact was found.
- **Minimal command or workflow:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown; no public NAX reproduction scripts were found.

The paper itself describes implementation-level modifications to GENIEx, including output-activation tiling and multi-GPU support, but those modifications were not found as a public NAX artifact in the checked sources. ([arXiv](https://arxiv.org/pdf/2106.12125))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Backbones and search spaces are described for CIFAR-10 and Tiny ImageNet; no frontend schema found. |
| Intermediate representation serialized | Unknown | The DAG/mixed-operation representation is mathematical and figure-level; no serialized IR found. |
| Mapping decisions inspectable | Partial | Final per-layer crossbar choices are shown in figures/tables; search traces not found. |
| Schedule inspectable | Unknown | Alternating update procedure is described; no executable schedule or pass log found. |
| Hardware config explicit | Partial | Table I gives key parameters; full accelerator config schema not found. |
| Precision / bit-slice assumptions explicit | Partial | Bit stream, bit slice, and ADC precision formula are explicit; propagation rules are not exposed as IR/type rules. |
| Cost model inspectable | Partial | The lookup-table interface is described; table contents and generation scripts not found. |
| Simulator backend documented | Partial | GENIEx use is described; NAX-specific GENIEx integration artifact not found. |
| Generated code / instruction stream inspectable | N/A / Unknown | NAX does not report generated ISA/code as an output. |
| Provenance from source op to backend action | Partial | Candidate op to XBsize is visible; source-op to simulator/backend action is not serialized. |
| Reproduction scripts available | Unknown | No public NAX scripts found. |
| Calibration source documented | Partial | GENIEx is described as HSPICE-trained in its own paper; NAX uses it but does not expose calibration artifacts in a located NAX repo. ([arXiv](https://arxiv.org/abs/2003.06902?utm_source=chatgpt.com)) |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. NAX’s frontend is a manually constructed ResNet-derived search space, not a general ONNX/TVM/MLIR importer.
- **As IR inspiration:** Strong reuse potential. The useful abstraction is a mixed graph whose candidate operations already include CIM binding metadata.
- **As mapper/scheduler:** Medium reuse potential. The alternating differentiable search and per-edge binary gating could be adapted as a mapper for selecting operation variants and array sizes.
- **As cost model:** Medium reuse potential. The `F(operation)` lookup-table contract for latency/energy is clean, but reuse would require reconstructing the table generator or supplying a new backend plugin.
- **As backend:** Limited direct reuse. NAX delegates nonideality to GENIEx and does not expose a generated instruction stream or backend API.
- **As benchmark:** Useful as a benchmark pattern: ResNet-20/CIFAR-10 and ResNet-18/Tiny ImageNet with homogeneous-crossbar baselines and mixed-crossbar search results.
- **As validation source:** Useful for simulator-level validation and sensitivity analysis; it does not provide chip-in-loop or real-system measurements in the checked evidence.

**Integration effort estimate: Medium to High.** Integration would be most direct through reimplementing the search-space coupling and replacing `F(.)` with a modern backend cost plugin. Effort rises because the NAX-specific artifact, cost-table schema, and GENIEx integration scripts were not found publicly. The most valuable reusable boundary appears to be the per-layer candidate object: convolution operation plus crossbar-size binding plus latency/energy and nonideal-accuracy hooks.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PUMA | Memristive crossbar acceleration for ML inference; PUMA-like spatial hierarchy is the architectural substrate NAX discusses. | PUMA exposes programmability through a specialized ISA and compiler that partitions graphs, schedules instructions, and allocates registers; NAX searches neural/hardware choices and reports architecture mappings. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) | Separate “programmable backend stack” papers from “search/mapping over backend assumptions” papers. |
| GENIEx | Nonideality-aware memristive crossbar modeling. | GENIEx is a simulator/modeling component trained from HSPICE data; NAX uses GENIEx as feedback during architecture search. ([arXiv](https://arxiv.org/abs/2003.06902?utm_source=chatgpt.com)) | Model plugins can be first-class evidence even when the main paper’s IR is implicit. |
| DNN+NeuroSim | Device-to-circuit-to-algorithm benchmarking for CIM accelerators. | DNN+NeuroSim emphasizes benchmark/simulation hierarchy and PyTorch integration; NAX emphasizes differentiable search over crossbar-size-bound neural operations. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V2.1?utm_source=chatgpt.com)) | Distinguish simulator-as-stack from search-state-as-stack. |
| MNSIM | Behavior-level memristor-system simulation and early-stage DSE. | MNSIM provides a configurable hierarchical simulator; NAX uses a PUMA-like model and per-op table to guide NAS. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/publications/2016/DATE16_185.pdf?utm_source=chatgpt.com)) | Hierarchical hardware configuration can be explicit without becoming a compiler IR. |
| PIMCOMP | End-to-end DNN compiler for crossbar-based PIM accelerators. | PIMCOMP includes frontend, backend, verification, and instruction-flow generation; NAX does not expose a comparable compiler interface in the checked artifact trail. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN?utm_source=chatgpt.com)) | Useful contrast between mapping/DSE papers and reusable compiler-stack papers. |
| XploreNAS / CrossNAS | NAS-style optimization for nonideal or analog-PIM platforms. | These works extend the NAS/co-design family with robustness or cross-layer/circuit/architecture/system search; NAX is an earlier, focused crossbar-size and CNN-kernel co-search. ([arXiv](https://arxiv.org/pdf/2302.07769v2?utm_source=chatgpt.com)) | In the corpus, group these as CIM-aware NAS/DSE, then classify by what resource and fidelity objects are first-class. |

## 10. Corpus-ready final takeaway

- NAX’s real contribution is a differentiable NAS/DSE formulation that couples CNN operation selection with per-layer memristive crossbar-size binding.
- The strongest reusable stack layer is the mapper/search layer: candidate operation + crossbar size + hardware-efficiency lookup + nonideality-aware accuracy feedback.
- The evidenced scope is static CNN inference on ResNet-derived CIFAR-10 and Tiny ImageNet search spaces, evaluated against homogeneous-crossbar ResNet baselines.
- First-class CIM objects include crossbar size, operation-to-crossbar binding, MVMU utilization, bit stream, bit slice, ADC precision formula, and device-level Ron/Roff/Vsupply parameters.
- The hidden IR is the over-parameterized DAG plus architecture parameters, binary gates, per-operation cost table, and GENIEx simulator assumptions.
- Artifact status: no public artifact found.
- Integration is most promising as IR inspiration, mapper logic, and cost-model interface; direct backend reuse would require reconstructing missing scripts/configs.
- For value-trajectory IR work, NAX motivates resource-aware value modeling but would need added abstractions for analog/digital domain transitions, bit-sliced partial sums, reconstruction, ADC timing, and accumulation paths.
