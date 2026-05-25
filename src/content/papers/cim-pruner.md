---
slug: cim-pruner
title: "CIM-Pruner: A Dual-Mode Compute-In-Memory Macro for Efficient VLMs with Intra-Chunk Token Pruning and Merging"
short_title: "CIM-Pruner"
subtitle: "Scoped CIM stack note"
year: 2026
venue: "ISCAS 2026"
authors_or_group: "Zhuojun Han, Siqi He, Chixiao Chen, Haozhe Zhu"
summary: >-
  CIM-Pruner is publicly described as an ISCAS 2026 paper proposing a dual-mode Compute-in-Memory macro for efficient Vision-Language Models through in-memory token pruning and token merging. Its strongest public evidence places the contribution at the CIM macro and narrow hardware-software co-design layer: it targets the token-reduction behavior of VLM inference and appears to make intra-chunk pruning/merging a hardware-visible operation. For CIM compiler/IR research, the main value is not an exposed frontend, IR, mapper, ISA, or reusable backend interface, but the set of dynamic objects it motivates: token masks, merge groups, chunk boundaries, macro mode switches, and token lineage. Those objects are important because a future VLM-oriented CIM backend would need to name, preserve, verify, and lower them across the boundary between token-level algorithms and CIM macro execution. ([Haozhe's Blog](https://zhutmost.com/publication))
links:
  paper: https://epapers2.org/iscas2026/ESR/paper_details.php?paper_id=2510
  artifact:
  docs:
  code:
technology:
  - "CIM macro"
  - "memory technology unknown/not found"
  - "VLM-oriented CIM"
workloads:
  - "Vision-Language Models"
  - "dynamic token pruning"
  - "token merging"
  - "intra-chunk token reduction"
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A5]
axis_B: [B4, B7]
axis_C_first_class_objects:
  - "dual-mode CIM macro"
  - "macro mode switch"
  - "token keep/drop mask"
  - "merge group"
  - "chunk boundary"
  - "token lineage"
axis_D_rewrite_objects:
  - "runtime state"
  - "token set"
  - "mode selection"
  - "token lineage"
artifact:
  status: "no public artifact found"
  url: 
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Full paper text not found in checked public sources."
  - "Author news confirms a CIM macro supporting in-memory token merging and pruning for Vision-Language Models."
  - "Detailed circuit parameters, algorithms, benchmarks, equations, and reproduction workflow are unknown from public evidence."
takeaways: []
---

# CIM-Pruner — scoped CIM stack note

**Source status note.** I found public author-page evidence for the paper, but I did **not** find a public paper PDF, official code repository, documentation, simulator, benchmark package, or artifact. The author publication page lists CIM-Pruner as an accepted ISCAS 2026 paper by Zhuojun Han, Siqi He, Chixiao Chen, and Haozhe Zhu, and the author news page says it demonstrates a CIM macro supporting in-memory token merging and pruning for Vision-Language Models. ([Haozhe's Blog](https://zhutmost.com/publication))  
Accordingly, this is a **public-evidence scoped note**. Paper-internal details such as section numbers, equations, figures, circuit parameters, benchmarks, and measured results are marked **Unknown / not found in the checked sources** where appropriate.

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Primary: A1 Macro / circuit-level CIM design. Secondary: A5 Narrow end-to-end co-design.** | The public title describes a “Dual-Mode Compute-In-Memory Macro,” and the author news describes a CIM macro for in-memory token merging and pruning for VLMs. The demonstrated public scope is clearest at the macro/workload co-design boundary rather than a reusable compiler stack. ([Haozhe's Blog](https://zhutmost.com/publication)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR, implicit; B7 Runtime-state abstraction, implicit. Possible B1 Config-as-IR, unknown.** | The named middle object is not a public IR. The compiler-relevant state appears to be macro mode, chunk-local token-pruning state, and token-merging state. Whether these are encoded as configuration fields, tables, RTL parameters, or simulator inputs is not publicly evidenced. |
| First-class CIM objects, Axis C | **Dual-mode CIM macro; mode switch; token keep/drop decision; merge group; chunk boundary; token lineage.** | The title and author news make the macro and in-memory token pruning/merging first-class public concepts. Chunk boundary is implied by “intra-chunk.” Token lineage and merge groups are necessary semantic objects for token merging, but their concrete representation is unknown from public evidence. |
| Rewrite object, Axis D | **Runtime token state / token set; mode selection; token lineage.** | The transformation suggested by public evidence is a dynamic reduction of token streams: pruning tokens and merging token groups inside chunks. No public evidence shows graph rewriting, loop scheduling, instruction generation, or serialized mapping IR. |
| Best corpus tags | `CIM-macro`, `hardware-software-co-design`, `VLM-inference`, `token-pruning`, `token-merging`, `dynamic-token-reduction`, `runtime-state`, `CIM-backend-requirements`, `no-public-artifact`, `value-trajectory-IR-inspiration` | Tags reflect the public claim boundary: VLM-oriented CIM macro with dynamic token reduction, useful mainly as a backend/IR stress case. |
| Closest comparison baselines | **MulTCIM, PuMer, MADTP, ToMe, ARCTIC, CIMFlow.** | MulTCIM is closest on multimodal-transformer CIM acceleration and runtime token pruning; PuMer, MADTP, and ToMe are close on token pruning/merging semantics; ARCTIC and CIMFlow are close corpus contrasts because they expose stronger compiler/generator or IR/ISA boundaries. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/multcim-digital-computing-in-memory-based-multimodal-transformer-/)) |

## 2. One-paragraph public summary

CIM-Pruner is publicly described as an ISCAS 2026 paper proposing a dual-mode Compute-in-Memory macro for efficient Vision-Language Models through in-memory token pruning and token merging. Its strongest public evidence places the contribution at the CIM macro and narrow hardware-software co-design layer: it targets the token-reduction behavior of VLM inference and appears to make intra-chunk pruning/merging a hardware-visible operation. For CIM compiler/IR research, the main value is not an exposed frontend, IR, mapper, ISA, or reusable backend interface, but the set of dynamic objects it motivates: token masks, merge groups, chunk boundaries, macro mode switches, and token lineage. Those objects are important because a future VLM-oriented CIM backend would need to name, preserve, verify, and lower them across the boundary between token-level algorithms and CIM macro execution. ([Haozhe's Blog](https://zhutmost.com/publication))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “CIM-Pruner: A Dual-Mode Compute-In-Memory Macro for Efficient VLMs with Intra-Chunk Token Pruning and Merging.” | Public author publication page title. | Paper-only / public listing. | The official title names the stack object as a **dual-mode CIM macro** and names the workload transformation as **intra-chunk token pruning and merging**. ([Haozhe's Blog](https://zhutmost.com/publication)) | The public listing supports macro-level classification and the token-reduction target. Paper sections, equations, circuit diagrams, and exact algorithmic details were not found in public sources checked. |
| The work demonstrates a CIM macro supporting in-memory token merging and pruning for VLMs. | Author news entry. | Paper-only / public author statement. | The news page directly states that the paper demonstrates a CIM macro design supporting in-memory token merging and pruning for Vision-Language Models. ([Haozhe's Blog](https://zhutmost.com/news)) | The demonstrated scope is publicly described at a high level. Artifact-level confirmation of macro interface, simulator inputs, RTL, or measurement scripts would require a public artifact or paper PDF. |
| The macro is “dual-mode.” | Paper title on publication page. | Paper-only. | A mode distinction is part of the named contribution. The likely compiler-relevant object is a macro mode flag or mode-selection state. ([Haozhe's Blog](https://zhutmost.com/publication)) | The public evidence does not reveal the mode semantics, mode-switch cost, control encoding, or whether modes correspond exactly to pruning and merging. |
| The reduction is “intra-chunk.” | Paper title on publication page. | Paper-only. | Chunk-local token reduction is part of the claimed mechanism. This makes chunk boundary a likely first-class object for an IR reading. ([Haozhe's Blog](https://zhutmost.com/publication)) | Chunk size, chunk formation, alignment with model layers, and legality constraints are unknown / not found in the checked sources. |
| The work is relevant to CIM compiler/IR stacks. | Derived from the corpus taxonomy and compact note, not from a located artifact. | Analytical inference. | The paper motivates dynamic-token CIM backend objects: token masks, merge groups, chunk IDs, lineage, and mode selection. | The paper-level public evidence supports an IR design lesson, but a reusable frontend, IR, mapping API, backend schema, or compiler artifact was not found. |

## 4. Stack anatomy

```text
Input / frontend:
  Public evidence points to Vision-Language Model inference with token sequences.
  The concrete input format is unknown: no parser, model-import format, ONNX/Torch graph path,
  or benchmark config was found in public sources.

Middle representation:
  The likely middle state is a token-reduction state: chunk boundary, keep/drop mask,
  merge group, token representative, lineage, and macro mode.
  This is an inferred hidden representation, not a public named IR.

Mapping or scheduling state:
  The public title implies intra-chunk pruning/merging and a dual-mode macro.
  A compiler-facing schedule would need to decide which chunks use which mode,
  when reduction occurs, and how reduced tokens are routed.
  Public serialization and inspectability are unknown.

Hardware abstraction:
  The named hardware abstraction is a dual-mode CIM macro.
  Array topology, SRAM/RRAM/analog/digital technology, bit slicing, ADC/DAC behavior,
  accumulation path, and peripheral topology are unknown / not found.

Backend / simulator / codegen:
  No public backend interface, simulator, instruction stream, RTL repository,
  generated macro code, or codegen path was found.

Output artifact:
  The expected paper-level output is a reduced token stream and macro-level efficiency result,
  but exact output artifacts, logs, traces, or generated files are unknown.

Evaluation loop:
  Public evidence indicates VLM efficiency motivation.
  Specific models, datasets, accuracy metrics, latency/energy metrics, and calibration sources
  are unknown / not found in the checked public sources.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **token chunking**, **token keep/drop decisions**, **merge grouping**, **token lineage**, and **macro mode control**. The paper foregrounds a CIM macro contribution, while the reusable compiler semantics are most visible in the dynamic token state that must survive lowering: a backend cannot safely prune or merge VLM tokens unless the representation preserves which tokens were removed, which tokens were combined, how merged values are interpreted downstream, and where chunk-local assumptions stop.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 Macro / circuit generator or macro design.**  
The official title names a “Compute-In-Memory Macro,” and the author news says the paper demonstrates a CIM macro design for in-memory token merging and pruning. This places the strongest public evidence at the macro/circuit layer. ([Haozhe's Blog](https://zhutmost.com/publication))

**Secondary: A5 Narrow end-to-end co-design.**  
The work is workload-shaped: the macro is described around VLM token pruning and token merging rather than generic matrix multiplication alone. The stack slice it owns most strongly is therefore: **VLM token-reduction behavior → dual-mode CIM macro operation → efficiency evaluation**. The input/output boundary for that slice appears to be token state entering a macro-level reduction primitive and a reduced token representation leaving it, but the concrete interface is not public.

It is less appropriate, from the checked public evidence, to classify CIM-Pruner as A4 explicit IR / dialect / ISA compiler stack, because no public frontend, IR dialect, ISA, instruction stream, pass pipeline, or lowering API was found.

### 5.2 Axis B — middle-layer style

**B4 Hardware-resource IR, implicit.**  
The named middle object is the dual-mode CIM macro. Decisions likely made around this object include which operation mode to use, how token chunks are presented to the macro, and how pruning/merging interacts with macro-local data movement. The decisions that remain embedded are the internal circuit control, physical array organization, sensing path, and peripheral behavior. There is no public single artifact that upstream passes could read, verify, and rewrite.

**B7 Runtime-state abstraction, implicit.**  
Token pruning and merging are runtime-state transformations: the number of live tokens and their lineage can vary by input, layer, or chunk. The natural middle representation would include token masks, merge groups, chunk IDs, and lineage records. Public evidence names the transformation, but not the data structure.

**Possible B1 Config-as-IR, unknown.**  
A dual-mode macro normally requires control parameters or configuration fields. However, no public config schema, runtime table, simulator input, or generated control stream was found. If the paper PDF later exposes a mode table or hardware parameter file, the classification could add B1 more strongly.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class at macro level; hierarchy parameters unknown.** | The public title and news identify a CIM macro, but array hierarchy, banks, subarrays, or crossbar dimensions are not visible in checked public sources. ([Haozhe's Blog](https://zhutmost.com/publication)) |
| Bit-slicing / bit significance | **Unknown / not found in the checked sources.** | No public paper text or artifact was found describing bit slicing, bit significance, or numeric partitioning. |
| ADC/DAC precision or sensing | **Unknown / not found in the checked sources.** | The memory technology and sensing style are not public in the checked sources. |
| Analog-to-digital or domain transition | **Unknown / not found in the checked sources.** | No public circuit path, sensing transition, or domain boundary was located. |
| Peripheral circuits as path nodes | **Implicit at macro level; specific path nodes unknown.** | A CIM macro necessarily includes peripheral behavior, but public evidence does not name the path nodes or expose them as compiler objects. |
| Partial-sum accumulation path | **Unknown / not found in the checked sources.** | No equations, diagrams, or artifact files were found. |
| Reconstruction / shift-add tree | **Unknown / not found in the checked sources.** | No public evidence found for reconstruction path or shift-add behavior. |
| Runtime state, masks, KV cache, batching, sparsity | **Token pruning/merging first-class at the claim level; concrete masks/tables unknown.** | Public title and news name token pruning and token merging. KV cache, batching, and sparse runtime data structures were not found. ([Haozhe's Blog](https://zhutmost.com/publication)) |
| Value trajectory / flow path | **Approximated through token lineage; detailed CIM path unknown.** | Token merging implies identity/lineage changes. Public evidence does not expose analog partial sums, sensing, digital accumulation, storage, or route alternatives. |

### 5.4 Axis D — rewrite object

The evidenced rewrite object is best read as **runtime token state** rather than an operator graph, loop nest, instruction stream, or numeric format.

Likely transformations include:

- pruning tokens within a chunk,
- merging token groups within a chunk,
- switching macro mode,
- preserving or reconstructing downstream token semantics after reduction.

The relevant equivalences are token-level approximations: a subset or merged representation of tokens is treated as an acceptable substitute for the unreduced token set under VLM accuracy constraints. For a compiler/IR reading, the information that must be preserved across lowering includes chunk ID, original token IDs, keep/drop mask, merge membership, representative token or merge output, ordering constraints, and any downstream validity condition.

The representation is especially well suited to **dynamic token-reduction semantics at the macro boundary**. Expressing cross-operator value trajectories, such as carrying bit-sliced partial sums across layers or delaying sensing until after a downstream reduction, would likely require an added abstraction for numeric path, domain transition, and storage lifetime.

## 6. Technical mechanism reading

### 6.1 Publicly evidenced mechanism

The public mechanism is: **perform token pruning and token merging for Vision-Language Models inside or tightly coupled to a dual-mode CIM macro**. The important compiler observation is that the macro is not merely a matrix engine; it is specialized for a dynamic sequence-reduction pattern. The author news states that the paper demonstrates a CIM macro design supporting in-memory token merging and pruning for VLMs. ([Haozhe's Blog](https://zhutmost.com/news))

### 6.2 Token reduction as a hardware-visible workload object

VLMs process multimodal token streams. Token pruning changes the live-token set by discarding tokens; token merging changes token identity by combining multiple tokens into a representative or aggregate token. “Intra-chunk” reduction suggests that the token stream is partitioned into bounded regions and that reduction legality is local to those regions. For a compiler, this turns **chunk boundary** into a placement and legality object, not just a batching detail.

A useful IR-level form would likely represent:

```text
chunk_id
original_token_ids
keep_mask
merge_group_id
representative_token_id
merge_weight_or_policy
macro_mode
output_token_id
lineage_record
```

The public sources do not reveal whether CIM-Pruner uses these exact fields. They are the minimal compiler-facing fields implied by the named transformation.

### 6.3 Dual-mode macro as backend contract

The “dual-mode” part of the title is important for IR work because a mode is a backend-visible control state. A compiler that targets such a macro would need to know when the macro is in pruning mode, merging mode, or another paper-specific mode. It would also need mode-switch cost, mode legality, operand layout, and output interpretation.

Public evidence establishes the existence of a dual-mode macro as a named paper contribution, but the checked sources do not expose:

- mode encodings,
- cycle-level sequencing,
- mode-switch overhead,
- data layout requirements,
- supported precision,
- accumulation or sensing path,
- control interface.

### 6.4 Cost model and objective

No public equation, objective function, latency model, energy model, area model, or accuracy model was found. A reusable compiler cost model would need at least:

- per-chunk pruning/merging latency,
- mode-switch cost,
- memory movement avoided by token reduction,
- accuracy sensitivity to pruning/merging,
- token density after reduction,
- macro utilization under variable token counts.

From the public evidence, the paper’s cost model should be treated as **Unknown / not found in the checked sources**.

### 6.5 Workload assumptions

The public target workload is **Vision-Language Models**. Specific architectures, datasets, token lengths, layer placement, compression ratios, accuracy metrics, and baseline systems were not found in public sources. The closest public algorithmic context includes token pruning and token merging methods such as PuMer, MADTP, and ToMe, which show why dynamic token reduction is a meaningful VLM/Vision Transformer optimization target. PuMer combines text-informed pruning and modality-aware merging for VLMs, MADTP uses multimodal alignment-guided dynamic token pruning, and ToMe merges similar tokens in Vision Transformers without additional training. ([ACL Anthology](https://aclanthology.org/2023.acl-long.721/))

### 6.6 Simulator or backend assumptions

No official simulator, RTL, netlist, scripts, trace format, model patch, benchmark package, or documentation was found. The backend should therefore be recorded as **paper-level public evidence only** until a paper PDF or artifact becomes available.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Token reduction becomes a CIM backend object

- **Observation:** CIM-Pruner publicly centers the CIM macro around token pruning and merging rather than only dense matrix-vector or matrix-matrix multiplication.
- **Why it matters for CIM compiler/IR work:** A VLM backend may need to expose token-reduction state as a backend object. The compiler cannot treat token count as a static tensor shape if the macro dynamically removes or combines tokens.
- **Reusable lesson:** Future CIM IRs for VLMs should include typed token masks, merge groups, and lineage metadata alongside tensor layout and hardware placement.

### Insight 2 — Chunk boundaries are likely legality boundaries

- **Observation:** The title specifies “intra-chunk” token pruning and merging.
- **Why it matters for CIM compiler/IR work:** A chunk boundary can define which tokens may be compared, pruned, merged, stored together, or routed through a macro. This is closer to a schedule legality object than a simple tensor dimension.
- **Reusable lesson:** A compiler could model chunking as an explicit region construct with local reduction rules, output-token ordering, and downstream reconstruction constraints.

### Insight 3 — Dual-mode macros need mode-aware lowering

- **Observation:** The macro is publicly named as dual-mode.
- **Why it matters for CIM compiler/IR work:** Mode selection is a backend contract: an upstream pass must know what each mode consumes, what it produces, and when switching modes is legal or profitable.
- **Reusable lesson:** A future CIM backend interface should expose mode fields with legality checks, transition costs, and value-interpretation rules.

### Insight 4 — Token lineage is the hidden semantic payload

- **Observation:** Token merging changes value identity: multiple input tokens become one downstream token or representative.
- **Why it matters for CIM compiler/IR work:** Accuracy, attention alignment, residual paths, and downstream indexing may depend on knowing which original tokens contributed to each output token.
- **Reusable lesson:** A VLM-oriented CIM IR should treat lineage as provenance, not just compression metadata.

### Insight 5 — CIM-Pruner is a useful stress case for value-trajectory IR

- **Observation:** The paper’s public description connects dynamic token transformations with in-memory execution.
- **Why it matters for CIM compiler/IR work:** It stresses both symbolic identity flow and physical resource flow: a token’s semantic identity and its hardware path may change together.
- **Reusable lesson:** A value-trajectory IR should attach token-level provenance to placement, precision, and domain-transition metadata.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in the checked sources.
- **License:** Unknown / not found.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** Not applicable; no public artifact found.
- **What the artifact appears to omit:** Not applicable; no public artifact found.
- **Minimal command or workflow:** Unknown / not found.
- **Whether paper figures appear reproducible from the artifact:** Unknown; no public artifact found.
- **Public source anchor:** The author publication page lists the accepted paper, and the author news page summarizes the macro-level contribution, but neither exposed a public artifact link in the checked sources. ([Haozhe's Blog](https://zhutmost.com/publication))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Unknown | No public paper PDF, benchmark package, model import path, or config format found. |
| Intermediate representation serialized | Unknown | No serialized IR, schema, trace, or token-state format found. |
| Mapping decisions inspectable | Unknown | No mapping table, scheduler output, or macro-control trace found. |
| Schedule inspectable | Unknown | No pass order, schedule, or execution trace found. |
| Hardware config explicit | Partial | Public evidence names a dual-mode CIM macro; circuit parameters and hierarchy are unknown. |
| Precision / bit-slice assumptions explicit | Unknown | No public precision, bit-slicing, or sensing description found. |
| Cost model inspectable | Unknown | No equations, model files, or calibration data found. |
| Simulator backend documented | Unknown | No public simulator/backend documentation found. |
| Generated code / instruction stream inspectable | Unknown / N/A | No public ISA, codegen, or instruction stream found. |
| Provenance from source op to backend action | Unknown | Token lineage is implied by merging, but no provenance representation was found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Unknown | No public SPICE/RTL/silicon/simulator calibration source found. |

### 8.3 Integration helper

- **As frontend:** No public parser, importer, or workload format was found. Direct frontend reuse is currently unclear.
- **As IR inspiration:** The most valuable reusable boundary appears to be dynamic token state: chunk IDs, token masks, merge groups, macro mode, and token lineage.
- **As mapper/scheduler:** Reuse would benefit from an adapter that extracts intra-chunk token-reduction legality and maps it to backend mode selection. The exact scheduling logic is unknown until the paper or artifact is public.
- **As cost model:** If equations become available, the likely reusable metrics are token-density reduction, latency/energy per pruning or merging operation, mode-switch overhead, and accuracy sensitivity.
- **As backend:** A future compiler could wrap the macro as a backend primitive if the operand layout, control interface, and output semantics are released.
- **As benchmark:** The work can serve as a conceptual benchmark for VLM token-reduction CIM backends. Specific workloads and baselines are unknown from public evidence.
- **As validation source:** Hardware validation value is unknown. Public sources describe a macro demonstration, but no SPICE, RTL, chip measurement, or simulator package was found.

**Integration effort estimate: High.** Integration would be most direct through a small adapter that models token masks, merge groups, chunk boundaries, and macro modes. However, practical reuse depends on access to the full paper or artifact because the public evidence does not expose the macro interface, circuit parameters, cost model, or reproduction workflow.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **MulTCIM** | Multimodal transformer acceleration with CIM and token sparsity. | MulTCIM is a digital CIM accelerator for multimodal transformers with long-reuse elimination, runtime token pruning, modal-adaptive CIM networking, and an EBB-CIM macro. CIM-Pruner’s public evidence is narrower around a dual-mode macro for in-memory pruning and merging. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/multcim-digital-computing-in-memory-based-multimodal-transformer-/)) | Use MulTCIM as a nearby VLM/multimodal CIM accelerator baseline; use CIM-Pruner as a macro-level token-reduction backend stress case. |
| **PuMer** | VLM token pruning and token merging. | PuMer is an algorithmic token-reduction framework using text-informed pruning and modality-aware merging; it reports throughput and memory benefits at the model level rather than a CIM macro interface. ([ACL Anthology](https://aclanthology.org/2023.acl-long.721/)) | PuMer helps define the algorithmic objects — masks, merge groups, modality-aware token state — that a CIM backend like CIM-Pruner would need to support. |
| **MADTP** | Dynamic token pruning for VLMs. | MADTP uses multimodal alignment-guided dynamic token pruning and adjusts compression ratios by layer and input. It is a dynamic pruning method rather than a CIM macro stack. ([CVF Open Access](https://openaccess.thecvf.com/content/CVPR2024/papers/Cao_MADTP_Multimodal_Alignment-Guided_Dynamic_Token_Pruning_for_Accelerating_Vision-Language_Transformer_CVPR_2024_paper.pdf)) | MADTP is useful for classifying dynamic token masks and layer/input-dependent compression as runtime-state IR objects. |
| **ToMe** | Token merging by combining similar tokens. | ToMe provides a training-free token-merging method and an official PyTorch implementation for patching existing Vision Transformer models. It is a software/model-level artifact, not a CIM backend. ([arXiv](https://arxiv.org/abs/2210.09461)) | ToMe clarifies the lineage and grouping semantics that a hardware token-merging primitive must preserve. |
| **ARCTIC** | CIM macro generation and hardware-resource parameterization. | ARCTIC is a DCIM compiler that takes user-provided parameters and constraints and generates DCIM structures, macro layouts, and BIST circuits, with explicit precision and macro-template generation. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | ARCTIC is a stronger A1/A4 generator-stack comparison: it shows what a reusable macro compiler boundary looks like when parameters, templates, and generated artifacts are exposed. |
| **CIMFlow** | Explicit CIM compiler/simulator stack. | CIMFlow documents an ONNX-to-MLIR-to-ISA flow and a SystemC simulator that executes ISA instruction streams and reports cycle/energy metrics. ([CIMFlow](https://www.cimflow.org/docs/Compiler)) | CIMFlow is the contrast case for explicit IR/ISA stacks; CIM-Pruner is better classified as a macro/co-design contribution unless a compiler interface becomes public. |

## 10. Corpus-ready final takeaway

- CIM-Pruner is publicly evidenced as an ISCAS 2026 dual-mode CIM macro for VLM token pruning and token merging.
- The strongest reusable stack layer is the **hardware macro / narrow hardware-software co-design** layer.
- The evidenced scope is VLM-oriented in-memory token reduction; specific models, equations, circuit parameters, benchmarks, and measurements are unknown from checked public sources.
- The most important first-class objects for a compiler reading are macro mode, chunk boundary, token keep/drop mask, merge group, and token lineage.
- The hidden IR appears to be the dynamic token-reduction state needed to connect VLM token semantics to CIM macro execution.
- **Artifact status: no public artifact found.**
- Integration into a future CIM compiler would be most useful as IR inspiration and backend-contract design rather than as a drop-in compiler component.
- For a value-trajectory IR, CIM-Pruner is a medium-relevance case: it highlights semantic value lineage through token merging, while detailed physical value paths remain unknown from public evidence.
