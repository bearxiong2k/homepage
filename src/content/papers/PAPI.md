---
slug: papi
title: "PAPI: Exploiting Dynamic Parallelism in Large Language Model Decoding with a Processing-In-Memory-Enabled Computing System"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "ASPLOS 2025"
authors_or_group: "Yintao He, Haiyu Mao, Christina Giannoula, Mohammad Sadrosadati, Juan Gómez-Luna, Huawei Li, Xiaowei Li, Ying Wang, Onur Mutlu"
summary: >-
  **PAPI** is a heterogeneous HBM/DRAM-PIM architecture and runtime scheduling framework for LLM decoding. Its central contribution is not an explicit compiler IR, but a runtime decision layer that observes request-level parallelism and token-level parallelism, estimates whether fully connected kernels are compute- or memory-bound, and then maps those kernels either to GPU-like processing units or to FC-PIM, while attention/KV-cache-heavy work is assigned to disaggregated Attn-PIM devices. The demonstrated stack is simulator-backed: the paper evaluates LLaMA-65B, GPT-3 66B, and GPT-3 175B on Dolly creative-writing and general-QA tasks using Ramulator2/AttAcc-derived modeling. For CIM compiler/IR research, PAPI is most useful as a runtime-state and hardware-resource case study: it makes dynamic batching/speculation state first-class enough to schedule over heterogeneous PIM resources, but the reusable compiler boundary remains embedded in scheduler equations, hardware assumptions, data partitioning rules, and simulator setup rather than a serialized IR. ([arXiv](https://arxiv.org/html/2502.15470v1))
links:
  paper: https://arxiv.org/pdf/2502.15470v2
  artifact:
  docs:
  code:
technology:
  - "DRAM-PIM"
  - "HBM-PIM"
  - "digital-CIM"
  - "heterogeneous-PIM"
workloads:
  - "LLM decoding"
  - "LLaMA-65B"
  - "GPT-3 66B"
  - "GPT-3 175B"
  - "Dolly creative-writing"
  - "Dolly general-QA"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A2, A3]
axis_B: [B7, B4, B1]
axis_C_first_class_objects:
  - "FC-PIM"
  - "Attn-PIM"
  - "processing units / GPU tensor-core-like PUs"
  - "HBM devices"
  - "bank groups"
  - "DRAM banks"
  - "FPU-per-bank configuration"
  - "RLP"
  - "TLP"
  - "KV-cache capacity"
  - "FC-vs-attention kernel class"
axis_D_rewrite_objects:
  - "runtime state"
  - "mode selection"
  - "hardware assignment"
  - "kernel-to-device scheduling"
  - "HBM-level tensor partitioning"
artifact:
  status: "no official public artifact found"
  url: 
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
reproducibility_level: low
notes:
  - "Best read as a runtime scheduler and architecture co-design for dynamic LLM decoding."
  - "The reusable boundary is clearest around RLP/TLP-driven FC placement."
  - "Value-flow semantics are approximated through placement and partitioning, not typed as trajectories."
takeaways: []
---

# Papi — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with A2/A3 secondary | PAPI is one workload family × one heterogeneous HBM/DRAM-PIM system for LLM decoding, matching the taxonomy’s A5 bucket where PAPI is explicitly listed as a narrow co-design work. The paper’s concrete stack contribution is architecture + runtime scheduling + simulator-backed evaluation, not a portable compiler IR. (CIM taxonomy.md) |
| Middle-layer style, Axis B | **B7 runtime-state abstraction**, plus B4 hardware-resource abstraction and B1 hidden/config state | The named scheduling state is runtime RLP, TLP, estimated arithmetic intensity, and threshold α; hardware resources are PUs, FC-PIM, and Attn-PIM. The taxonomy marks PAPI under B7 runtime-state abstraction. (CIM taxonomy.md) |
| First-class CIM objects, Axis C | FC-PIM, Attn-PIM, PU/GPU, HBM device, bank group, DRAM bank, FPU-per-bank configuration, RLP/TLP, KV-cache capacity, kernel class | The paper names two PIM device classes and maps attention to Attn-PIM while dynamically mapping FC kernels to PUs or FC-PIM. It also names data partitioning across pseudo-channel, bank-group, bank, and multiplier levels. ([arXiv](https://arxiv.org/html/2502.15470v1)) |
| Rewrite object, Axis D | **Runtime state / mode selection / hardware assignment** | The actual transformation is FC-kernel placement between PU and FC-PIM as RLP/TLP changes. Attention is statically routed to Attn-PIM. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) |
| Best corpus tags | `LLM-serving`, `DRAM-PIM`, `HBM-PIM`, `runtime-scheduling`, `heterogeneous-PIM`, `simulator-backed`, `KV-cache`, `GEMV`, `dynamic-parallelism`, `hidden-IR` | Tags reflect the evidenced workload, hardware substrate, scheduler object, and evaluation method. |
| Closest comparison baselines | AttAcc, Samsung HBM-PIM, IANUS, SpecPIM, Hermes, HARMONI | PAPI directly compares against A100+AttAcc, A100+HBM-PIM, and AttAcc-only, and discusses IANUS/SpecPIM as nearby LLM-PIM schedulers. Hermes and HARMONI are close library works because they are LLM-serving / DRAM-PIM / runtime-state stack papers. ([arXiv](https://arxiv.org/html/2502.15470v1)) (CIM stack library compact.md) |

## 2. One-paragraph public summary

**PAPI** is a heterogeneous HBM/DRAM-PIM architecture and runtime scheduling framework for LLM decoding. Its central contribution is not an explicit compiler IR, but a runtime decision layer that observes request-level parallelism and token-level parallelism, estimates whether fully connected kernels are compute- or memory-bound, and then maps those kernels either to GPU-like processing units or to FC-PIM, while attention/KV-cache-heavy work is assigned to disaggregated Attn-PIM devices. The demonstrated stack is simulator-backed: the paper evaluates LLaMA-65B, GPT-3 66B, and GPT-3 175B on Dolly creative-writing and general-QA tasks using Ramulator2/AttAcc-derived modeling. For CIM compiler/IR research, PAPI is most useful as a runtime-state and hardware-resource case study: it makes dynamic batching/speculation state first-class enough to schedule over heterogeneous PIM resources, but the reusable compiler boundary remains embedded in scheduler equations, hardware assumptions, data partitioning rules, and simulator setup rather than a serialized IR. ([arXiv](https://arxiv.org/html/2502.15470v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| LLM decoding parallelism changes dynamically, changing compute/memory demands. | Abstract; Section 3.2; Figure 3 | Experiment / analysis | The paper argues that RLP varies with batching/SLO/memory capacity and runtime completion, while TLP varies with speculative decoding. It ties those variables to arithmetic intensity changes. ([arXiv](https://arxiv.org/html/2502.15470v1)) | Demonstrated as workload/runtime analysis for LLM decoding; the paper-level evidence supports dynamic RLP/TLP as the scheduler’s core state. |
| PAPI provides a heterogeneous PIM-enabled system with PUs, FC-PIM, and Attn-PIM. | Abstract; Section 4.1; Figure 5 | Hardware architecture / simulator model | Figure 5 and Section 4 define host CPU, high-performance processor/PUs, FC-PIM, and physically separated Attn-PIM devices. ([arXiv](https://arxiv.org/html/2502.15470v1)) | Evidenced as an architectural model and simulator target; reusable hardware interface details are clearest at the level of device roles, not an ISA. |
| Online kernel characterization can schedule FC kernels dynamically. | Section 5; Equations 1–2; Figure 6 | Equation / scheduler rule / experiment | The scheduler estimates FC arithmetic intensity using RLP × TLP, compares it with threshold α, and reschedules FC kernels between PUs and FC-PIM. Figure 6 validates the estimate against measured arithmetic intensity for GPT-3 66B. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) | Demonstrated for FC-kernel device selection in LLM decoding; attention remains assigned to Attn-PIM. |
| FC-PIM should be more compute-capable than Attn-PIM. | Section 6.1; Figure 7; Equations 3–4 | Equation / cost model / architecture | The paper uses DRAM-row reuse, power analysis, and an HBM die-area inequality to justify a 4P1B FC-PIM design with 96 banks per HBM memory unit. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) | Evidenced through analytical/simulator modeling, power/area assumptions, and HBM3 constraints; further reuse depends on simulator calibration and implementation detail availability. |
| Attn-PIM should prioritize memory capacity and KV-cache scaling. | Section 6.2–6.4; Figure 5(c) | Architecture / mapping rule | The paper assigns attention heads to HBM devices, uses AttAcc-style mapping for Kᵀ/V, and chooses 1P2B Attn-PIM to fit power constraints and KV-cache capacity needs. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) | Demonstrated for attention/KV-cache-heavy LLM decoding; data-layout semantics are described in prose rather than exposed as a reusable layout IR. |
| PAPI improves performance and energy over prior PIM-enabled LLM systems. | Abstract; Section 7; Figures 8–12 | Simulator experiment | The paper reports average speedups of 1.8× over A100+AttAcc, 1.9× over A100+HBM-PIM, and 11.1× over AttAcc-only on Dolly creative-writing; it reports 1.7×, 1.7×, and 8.1× on Dolly general-QA for GPT-3 175B; it also reports energy-efficiency improvements. ([arXiv](https://arxiv.org/html/2502.15470v1)) | Evaluated through Ramulator2/AttAcc-derived simulation over three LLMs, FP16, static batching, and selected RLP/TLP grids. |

## 4. Stack anatomy

```text
Input / frontend:
  LLM decoding kernels, model dimensions, RLP/TLP settings, batch/output behavior, and Dolly task traces. The paper does not expose a general parser or frontend IR; the input contract is mostly workload/model parameters and kernel classes.

Middle representation:
  Runtime state: RLP, TLP, estimated arithmetic intensity, memory-boundedness threshold α, and kernel class (FC vs attention). This is inspectable in the paper equations and scheduler description, but not presented as a serialized IR.

Mapping or scheduling state:
  FC kernel → PU or FC-PIM; attention kernel → Attn-PIM. Additional placement appears in attention-head-to-HBM assignment and FC-weight-block-to-HBM assignment. This is a runtime scheduling/mapping table conceptually, not a documented compiler artifact.

Hardware abstraction:
  Host CPU, high-performance processor, GPU-like PUs, scheduler, FC-PIM, Attn-PIM, HBM devices, pseudo-channels, bank groups, banks, multipliers/FPUs, and interconnects. The abstraction is strongest in Figure 5 and Section 6.

Backend / simulator / codegen:
  Simulator based on Ramulator2 and AttAcc. The paper mentions host CPU instructions and simulator-backed evaluation, but does not define a reusable instruction set, compiler pass interface, or generated code schema.

Output artifact:
  Latency, energy, energy-efficiency, speedup, sensitivity, and execution-breakdown figures. The paper does not expose an official public trace/config/code artifact in the checked sources.

Evaluation loop:
  Run simulated LLM decoding for LLaMA-65B, GPT-3 66B, and GPT-3 175B on Dolly creative-writing/general-QA, varying RLP and TLP; compare against A100+AttAcc, A100+HBM-PIM, and AttAcc-only.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of kernel category, RLP/TLP runtime registers, threshold α, FC/attention placement rules, bank-level mapping rules, and Ramulator2/AttAcc simulator assumptions. The paper foregrounds runtime scheduling, while the reusable semantics are most visible in the arithmetic-intensity estimator, the PU-vs-FC-PIM mode decision, and the HBM hierarchy mapping rules. This matches the taxonomy’s broader “hidden IR” warning: the actual semantics in many CIM stacks live across configs, search state, cost tables, and backend assumptions rather than one auditable artifact. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) (CIM taxonomy.md)

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

PAPI’s primary family is **A5 narrow end-to-end co-design**. It couples one hardware family—heterogeneous GPU/HBM/DRAM-PIM—with one workload family—LLM decoding—and demonstrates an end-to-end simulated architecture/scheduler loop. The taxonomy itself lists PAPI under A5, with the interpretation that such papers prove architecture ideas while hiding compiler boundaries and hard-coding trajectories rather than representing them. (CIM taxonomy.md)

Secondary roles are **A2 simulator & cost model** and **A3 mapping/scheduling/DSE framework**. A2 fits because the evaluation depends on a Ramulator2/AttAcc-derived simulator for latency/energy. A3 fits because the key middle-layer action is scheduling/mapping FC kernels to PU or FC-PIM based on runtime state. ([arXiv](https://arxiv.org/html/2502.15470v1))

### 5.2 Axis B — middle-layer style

**B7 runtime-state abstraction.**  
The named middle representation is RLP, TLP, arithmetic-intensity estimate, and threshold α. Decisions made there include whether the next FC kernel should run on PUs or FC-PIM. The decision that remains embedded is how that choice becomes simulator events, host instructions, memory traces, or device commands. There is no single paper-provided artifact that an upstream pass could read, verify, and rewrite. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

**B4 hardware-resource abstraction.**  
PAPI names hardware resources—PUs, FC-PIM, Attn-PIM, HBM devices, bank groups, banks, and FPUs. The decisions made at this layer include dedicating FC-PIM to more compute-capable PIM, dedicating Attn-PIM to KV-cache/attention capacity, and choosing interconnect assumptions. The resource abstraction is paper-visible but not serialized as a stable hardware-resource IR. ([arXiv](https://arxiv.org/html/2502.15470v1))

**B1 config-as-IR / hidden-stack behavior.**  
The cost and legality decisions are spread across threshold α, simulator assumptions, HBM3 parameters, area/power constraints, and mapping rules. This is constructive rather than disqualifying: the scheduler is clear, but reuse would benefit from extracting those assumptions into a typed configuration schema. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable as crossbar; first-class as HBM/PIM hierarchy** | PAPI is HBM/DRAM-PIM, not crossbar CIM. It names HBM devices, bank groups, banks, and FPUs. ([arXiv](https://arxiv.org/pdf/2502.15470v2)) |
| Bit-slicing / bit significance | **Not applicable / not exposed** | Workloads are evaluated with FP16; no bit-sliced representation is exposed as a compiler object. ([arXiv](https://arxiv.org/html/2502.15470v1)) |
| ADC/DAC precision or sensing | **Not applicable** | PAPI is digital DRAM/HBM-PIM with FPUs, not analog crossbar CIM. |
| Analog-to-digital or domain transition | **Not applicable** | The paper’s domain transition is between host/GPU/PIM devices, not analog sensing and digital reconstruction. |
| Peripheral circuits as path nodes | **Implicit / architectural** | The paper says compute logic is embedded in peripheral circuits, but those circuits are not represented as scheduled path nodes. ([arXiv](https://arxiv.org/html/2502.15470v1)) |
| Partial-sum accumulation path | **Implicit** | GEMV/MAC behavior is modeled through PIM execution and traces/simulation; partial-sum identity is not a named IR object. |
| Reconstruction / shift-add tree | **Not applicable** | No bit-slice reconstruction tree is part of the demonstrated abstraction. |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for RLP/TLP/KV capacity; not for masks/sparsity** | RLP/TLP drive scheduling; KV-cache footprint motivates disaggregated Attn-PIM. ([arXiv](https://arxiv.org/html/2502.15470v1)) |
| Value trajectory / flow path | **Approximated through placement and scheduling state** | PAPI names device assignment and memory partitioning, but not a typed value trajectory across resources. This aligns with the taxonomy’s finding that flow/trajectory is generally missing as a first-class IR object. (CIM taxonomy.md) |

### 5.4 Axis D — rewrite object

PAPI rewrites **runtime state and mode selection**: FC kernels are routed to either PUs or FC-PIM as RLP/TLP changes; attention kernels remain assigned to Attn-PIM. It also fixes data placement rules for FC weights and attention Kᵀ/V matrices across HBM hierarchy levels. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

The legal transformations are best described as:

- recompute arithmetic intensity from current RLP × TLP,
- compare against threshold α,
- reschedule FC kernels between PU and FC-PIM,
- release Attn-PIM resources when requests finish,
- preserve FC/attention kernel semantics and model-weight/KV-cache placement assumptions.

The equivalence exploited is **same FC kernel semantics, different execution location**. The information that must be preserved is kernel type, hidden dimension/model shape, RLP/TLP, threshold α, FC weight residency, attention-head/KV placement, and device capacity. The representation is especially well suited to dynamic device assignment; expressing trajectory rewrites such as partial-sum routing, reconstruction fusion, or domain-transition retiming would likely require an additional value-flow abstraction beyond PAPI’s scheduler state.

## 6. Technical mechanism reading

### Runtime arithmetic-intensity predictor

PAPI’s scheduler treats FC-kernel boundedness as a function of runtime parallelism. For an FC weight matrix of shape `(h, h)` and input shape `(RLP × TLP, h)`, the paper defines arithmetic intensity as FLOPs divided by bytes, then argues that for large hidden dimension `h`, the estimate simplifies to approximately `RLP × TLP`. This is the paper’s most reusable compiler-style abstraction: it turns dynamic serving state into a device-selection key. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

### Scheduling policy

The scheduling mechanism has two phases. Initial scheduling sets RLP to batch size and TLP to the system-defined speculation length, estimates arithmetic intensity, and compares it with a threshold α obtained by offline iterative evaluation on PIM and PU units. Runtime scheduling updates RLP by counting `<|eos|>` tokens after each decoding step, tracks TLP through a register updated by host software, predicts the next arithmetic intensity as `RLP × TLP`, and reschedules FC kernels between PUs and FC-PIM when the threshold decision changes. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

### Hardware abstraction

PAPI splits hardware into three roles: GPU-like processing units for compute-bound work, FC-PIM for memory-bound but computation-heavier FC kernels, and disaggregated Attn-PIM for attention/KV-cache-heavy kernels. Figure 5’s system diagram is the main “hardware IR” proxy: it names PUs, scheduler, host CPU, high-speed interconnect, FC-PIM, Attn-PIM, bank groups, banks, and the dynamic mapping table. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

### FC-PIM design

FC-PIM is motivated by DRAM-row reuse. The paper breaks PIM energy into DRAM access, activation transfer, and FPU computation, then argues that reusing one activated DRAM row for multiple FC computations reduces DRAM-access energy and permits more FPUs per bank within power constraints. The area model constrains `m(n × A_FPU + A_bank) ≤ A_max`, leading to a 4P1B FC-PIM design with 96 banks per HBM unit and three bank groups in an 8-high HBM stack. ([arXiv](https://arxiv.org/html/2502.15470v1))

### Attn-PIM design and KV-cache motivation

Attn-PIM is optimized differently because attention has lower arithmetic intensity and larger KV-cache footprint. The paper chooses 1P2B for Attn-PIM to stay within power limits and disaggregates Attn-PIM devices from the high-performance processor to scale capacity for longer sequences. Attention heads are distributed across Attn-PIM units, and Kᵀ/V partitioning follows AttAcc-style pseudo-channel, bank-group, bank, and multiplier-level layouts. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

### Evaluation assumptions

The paper evaluates with a simulator based on Ramulator2 and AttAcc, all HBMs as HBM3 at 5.2 Gbps per pin and 333 MHz, and three LLMs—LLaMA-65B, GPT-3 66B, and GPT-3 175B—using FP16 on Dolly creative-writing and general-QA tasks. The system comparison uses 90 HBM devices for fairness: 30 for FC weights and 60 for attention, with six GPUs required for GPT-3 175B model capacity under the PAPI memory split. ([arXiv](https://arxiv.org/pdf/2502.15470v2))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — RLP × TLP is a compact runtime IR object

- **Observation:** PAPI compresses a dynamic serving state into a simple arithmetic-intensity proxy.
- **Why it matters for CIM compiler/IR work:** It shows that a CIM stack for LLM serving may need a static graph plus a small runtime-state layer, not only a static tensor schedule.
- **Reusable lesson:** Future IRs could attach runtime-dependent symbolic fields—such as request concurrency, speculative width, KV-cache residency, and device threshold—to operators whose best backend changes at runtime.

### Insight 2 — The scheduler is a mode-selection rewrite, not a graph rewrite

- **Observation:** PAPI does not transform the LLM graph; it transforms the hardware mode used for FC execution.
- **Why it matters:** This is a clean example of Axis D “mode selection” over heterogeneous PIM resources.
- **Reusable lesson:** A compiler stack could expose mode selection as a typed rewrite object: `FC[GEMV, RLP, TLP] → PU` or `FC[GEMV, RLP, TLP] → FC-PIM`.

### Insight 3 — FC-PIM and Attn-PIM separate compute bandwidth from capacity

- **Observation:** PAPI’s architecture separates FC-PIM, which spends area/power on FPUs per bank, from Attn-PIM, which spends system resources on memory capacity and lower-FPU-density PIM.
- **Why it matters:** This suggests a useful IR distinction between *compute capability binding* and *capacity/state binding*.
- **Reusable lesson:** Future CIM IRs should represent “where the weights live” and “where the dynamic KV state lives” as separate placement dimensions.

### Insight 4 — Data partitioning is the closest thing to layout IR

- **Observation:** The most concrete mapping semantics appear in prose descriptions of Kᵀ/V and FC weight partitioning across pseudo-channel, bank-group, bank, and multiplier levels.
- **Why it matters:** These layout rules are essential for a backend contract, but they are not packaged as a reusable schema.
- **Reusable lesson:** A future corpus entry could extract these into a layout metadata form: tensor role, partition axis, hierarchy level, and device binding.

### Insight 5 — The simulator boundary carries much of the stack semantics

- **Observation:** PAPI’s reusable execution model is primarily visible through simulator methodology and hardware parameters.
- **Why it matters:** This is a common hidden-IR pattern in CIM stacks: the paper’s scheduler is crisp, while many legality and timing assumptions reside in backend modeling.
- **Reusable lesson:** A small adapter that emits scheduler decisions plus HBM layout metadata to Ramulator-like backends would make this style of work easier to compare.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no official public artifact found.**

- **Artifact URL or identifier:** no official code/artifact URL found in the checked paper/arXiv/author-page sources.
- **Unofficial/third-party reproduction:** a GitHub repository by `Lucyyannn/PAPI` states that it “reproduces the work of PAPI,” contains a modified Ramulator2, Python simulator, trace generators, sample outputs, and README instructions. I do **not** treat this as the official paper artifact. ([GitHub](https://github.com/Lucyyannn/PAPI/blob/main/README.md))
- **License:** Unknown / not found in the checked sources. The third-party GitHub page did not show a license in the visible repository metadata.
- **Last checked:** 2026-05-15.
- **What the paper contains:** architecture description, scheduling equations/rules, power/area assumptions, data partitioning rules, simulator methodology, and evaluation figures.
- **What the official artifact appears to omit:** no official released simulator, scripts, traces, configs, figure-reproduction workflow, or public issue tracker found.
- **Minimal workflow:** none documented officially. The third-party reproduction documents building Ramulator2, running `python main.py`, generating `papi_attn.trace` and `papi_fc.trace`, and running `./ramulator2 -f papi_attn.yaml` / `papi_fc.yaml`. ([GitHub](https://github.com/Lucyyannn/PAPI))
- **Whether paper figures appear reproducible from artifact:** Unknown for official artifact; partially suggested by the third-party reproduction but not independently verified here.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper documents model/task settings and RLP/TLP; no general frontend schema. |
| Intermediate representation serialized | Unknown | Scheduler state is described, but no serialized IR found. |
| Mapping decisions inspectable | Partial | PU vs FC-PIM decision is explicit; full simulator trace/mapping not official. |
| Schedule inspectable | Partial | Runtime scheduling rule is explicit; no official logs. |
| Hardware config explicit | Partial | HBM3, FPU-per-bank, bank groups, device counts are described. |
| Precision / bit-slice assumptions explicit | Partial / N/A | FP16 is explicit; bit slicing is not applicable to this digital HBM-PIM design. |
| Cost model inspectable | Partial | Arithmetic-intensity predictor, power/area equations, and simulator methodology are paper-visible. |
| Simulator backend documented | Partial | Ramulator2/AttAcc basis is stated; official source/configs not found. |
| Generated code / instruction stream inspectable | Unknown / N/A | Host instructions are mentioned, but no ISA or stream format is specified. |
| Provenance from source op to backend action | Partial | Kernel class → device assignment is clear; source-op-to-command provenance is not exposed. |
| Reproduction scripts available | Unknown officially | Third-party scripts exist; official scripts not found. |
| Calibration source documented | Partial | CACTI-3DD, HBM constraints, AttAcc/Ramulator2 basis are cited; full calibration package not found. |

### 8.3 Integration helper

- **As frontend:** Limited. PAPI does not provide a reusable parser/importer; reuse would start from LLM kernel descriptors, model dimensions, and serving-state traces.
- **As IR inspiration:** Strong for runtime-state fields: RLP, TLP, α, FC/attention kernel class, KV-cache capacity, and device mode.
- **As mapper/scheduler:** Strongest integration role. The RLP × TLP threshold rule could become a runtime scheduling pass in a larger CIM compiler.
- **As cost model:** Moderate. The arithmetic-intensity estimator and power/area constraints could become backend plugins.
- **As backend:** Partial. A Ramulator2/AttAcc adapter could wrap the same HBM-PIM assumptions, but official simulator sources/configs were not found.
- **As benchmark:** Useful. LLaMA-65B, GPT-3 66B, GPT-3 175B, Dolly creative-writing/general-QA, and RLP/TLP sweeps are good benchmark dimensions.
- **As validation source:** Moderate-to-low. Evidence is simulator-backed, with analytical area/power modeling; no real-system or chip-in-loop validation is provided in the checked sources.

**Integration effort estimate: Medium–High.** Integration would be most direct through the scheduler rule and hardware-resource model, not through a released compiler stack. Reuse would benefit from a small adapter that extracts `(kernel_type, RLP, TLP, model_shape, placement)` into a serializable scheduling record and maps it to a Ramulator-like backend.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| AttAcc | HBM-PIM for LLM attention | PAPI keeps attention on Attn-PIM but adds dynamic FC routing and FC-PIM. | Useful baseline for separating attention/KV-cache mapping from FC scheduling. |
| Samsung HBM-PIM | Commercial HBM-PIM substrate | PAPI models heterogeneous FC-PIM/Attn-PIM rather than a single HBM-PIM unit type. | Shows why one PIM device class may be too coarse for LLM decoding. |
| SpecPIM | Speculative-decoding-aware PIM scheduling | PAPI emphasizes online lightweight scheduling; the paper describes SpecPIM’s scheduling as offline/complex for dynamic runtime changes. ([arXiv](https://arxiv.org/html/2502.15470v1)) | Runtime overhead should be part of scheduler classification. |
| Hermes | LLM inference, heterogeneous near-memory acceleration, runtime policy | Hermes centers on activation sparsity and hot/cold placement; PAPI centers on RLP/TLP-driven FC device selection. (CIM stack library compact.md) | Good pair for “runtime-state abstraction” subtypes. |
| HARMONI | DRAM-PIM / LLM modeling and simulation | HARMONI exposes task graph / tensor allocation / communication edges more directly; PAPI exposes a compact dynamic scheduling rule. (CIM stack library compact.md) | Compare simulator/task-graph IR against scheduler-state IR. |
| Ouroboros | Narrow LLM-oriented co-design stack | Ouroboros focuses on wafer-scale SRAM-CIM, token pipeline, mapping, and KV-cache management; PAPI focuses on heterogeneous HBM/DRAM-PIM and online FC scheduling. (CIM stack library compact.md) | Corpus should separate architecture-scale mapping from runtime kernel-mode selection. |

## 10. Corpus-ready final takeaway

- PAPI’s real contribution is a dynamic scheduling and heterogeneous HBM/DRAM-PIM architecture for LLM decoding, not a portable CIM compiler IR.
- The strongest reusable stack layer is the runtime-state scheduler: RLP, TLP, arithmetic-intensity estimate, threshold α, and FC-kernel mode selection.
- The evidenced scope is simulator-backed LLM decoding over LLaMA-65B, GPT-3 66B, GPT-3 175B, Dolly creative-writing/general-QA, FP16, and selected RLP/TLP settings.
- First-class objects include FC-PIM, Attn-PIM, PUs, HBM hierarchy, kernel class, RLP/TLP, and KV-cache-driven capacity needs.
- The hidden IR lives in scheduler state, HBM partitioning prose, threshold calibration, hardware parameters, and Ramulator2/AttAcc simulator assumptions.
- Artifact status: no official public artifact found. A third-party reproduction exists but should not be treated as the official paper artifact.
- Integration is most plausible as a mapper/scheduler plugin and runtime-state benchmark for future CIM compiler stacks.
- Relevance to value-trajectory IR is medium: PAPI provides dynamic placement/state ingredients, while value-path typing would require additional trajectory metadata.
