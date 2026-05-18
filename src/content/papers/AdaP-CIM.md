# AdaP-CIM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — narrow end-to-end co-design** | The paper connects a numeric format, an alignment datapath, BERT/GLUE quantization results, and synthesized SRAM-CIM macro PPA, but the owned stack slice is the AdaP datatype plus CIM MAC datapath rather than a general compiler pipeline. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Secondary stack role, Axis A | **A1/A2-adjacent — macro datapath + synthesis-backed cost evidence** | The demonstrated hardware object is a 256×64 SRAM-CIM macro with AdaP decoder, SAU, offset/shift, and SRAM-CIM blocks; the paper reports synthesized area/power in TSMC 28 nm at 250 MHz. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Middle-layer style, Axis B | **B6 accuracy/numeric modeling; B1 type/config-as-IR; B4 hardware-resource abstraction** | The central representation is the AdaP type/config `AdaP(n, es, rs)` and its flag/regime/exponent-extension/fraction fields. Hardware-resource information appears as a macro/module breakdown rather than a serialized IR. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| First-class CIM objects, Axis C | **AdaP numeric fields; bounded regime length; exponent-extension mode; effective exponent; SAU max-exponent finder; decoder; offset/shift unit; SRAM-CIM macro** | The paper directly names and reasons about the AdaP fields, the maximum effective exponent, the SAU bit-position grouping, and the macro modules in the area/power table. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Rewrite object, Axis D | **Numeric format and exponent-alignment state** | The actual transformation is from Posit-like encoded values to AdaP values and from per-input effective exponents to a shared `Emax` alignment state before CIM integer MAC execution. Operator graphs, schedules, placement, and instruction streams are not exposed as rewrite objects. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Best corpus tags | `SRAM-CIM`, `digital-CIM`, `numeric-format`, `posit`, `quantization`, `BERT-inference`, `GLUE`, `macro-PPA`, `hardware-software-co-design`, `hidden-IR` | Tags reflect the evaluated model/datasets, hardware macro, and compiler/IR relevance. |
| Closest comparison baselines | **Posit; AdaptivFloat; DIMCA; ReDCIM; AutoDCIM; DPE-CIM** | Posit and AdaptivFloat are direct numeric-format baselines; DIMCA is the Posit-CIM macro baseline used in the paper; ReDCIM is a related FP/INT digital CIM pipeline reference; AutoDCIM is a nearby compiler-stack contrast; DPE-CIM appears to be a later related work by overlapping authors on dynamic posit encoding plus speculative alignment. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |

## 2. One-paragraph public summary

**AdaP-CIM** is best read as a hardware–numeric-format co-design paper for CIM inference rather than as a compiler or IR stack. Its main contribution is **Adaptive Posit**, a Posit-derived format that bounds the regime length with parameter `rs` and adds an exponent-extension encoding mode, paired with a **speculative alignment unit** that computes the maximum effective exponent before CIM MAC execution. The demonstrated scope is BERT-Base-Uncased quantization on three GLUE tasks and synthesis of a 256×64 SRAM-CIM macro in TSMC 28 nm against a Posit/CT-based baseline. For CIM compiler/IR research, the reusable interface is clearest at the numeric type and alignment-state boundary: `AdaP(n, es, rs)`, effective exponent, encoding flag, exponent extension, fraction, `Emax`, and exponent-offset shift become the objects that a future IR would need to name, type, preserve, and lower. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| AdaP dynamically extends representable range with two exponent-encoding schemes and low overhead. | Abstract; Introduction; Section II. | Equation / paper-only mechanism. | The paper defines `AdaP(n, es, rs)`, bounds the regime length by `rs`, gives `kmax = rs − 1`, defines threshold `T = rs·2^es − 1`, and switches between Posit-style encoding and `Eext` encoding using a flag bit. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | The paper-level evidence supports the encoding rule and example. Exact per-layer or per-tensor parameter-selection workflow for `es` and `rs` is described conceptually, but no public implementation or serialized quantization config was found. |
| AdaP avoids Posit fraction truncation caused by unbounded variable-length regime fields. | Section II; Fig. 1. | Equation / diagram. | The paper states that bounding regime length under `rs < n − 1 − es` ensures fraction bits are not truncated and reduces leading-zero-counter overhead. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Demonstrated as a format-level argument and illustrated encoding; no artifact exposes a verifier for representable ranges or truncation cases. |
| SAU reduces delay, area, and power for max-exponent computation compared with a comparator tree. | Abstract; Section III; Fig. 2. | Algorithm / datapath description / experiment. | The paper describes grouping exponent bits by position, using OR trees and speculative lower-bit computation, then selecting lower-bit outputs after upper-bit resolution; it gives the SAU critical path as one AND gate, `log2 N` OR gates, and `log2 rs + es` multiplexers. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Demonstrated for the paper’s CIM MAC alignment setting. Broader compiler-level scheduling or multi-operator alignment is outside the evidenced scope. |
| AdaP is more robust than Posit and AdaptivFloat at low precision. | Section IV; Table I. | Experiment. | The paper evaluates BERT-Base-Uncased on CoLA, STS-B, and MNLI at 7, 8, and 9 bits. For example, at 7 bits AdaP reports 0.573 CoLA Matthews correlation versus FP32 0.586, and at 9 bits it matches the FP32 MNLI matched accuracy of 0.846. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Demonstrated for three GLUE tasks and the reported BERT setup. Reproducing the exact quantization run would require code, configs, model checkpoints, and preprocessing details not found in public artifact form. |
| AdaP-CIM improves macro area and power relative to the Posit/CT baseline. | Section IV; Table II. | Experiment / synthesis result. | The 256×64 macro at 250 MHz in TSMC 28 nm reports total area 70,420 μm² and power 17,422 μW for AdaP-CIM versus 84,177 μm² and 23,452 μW for the baseline, corresponding to 16.4% area and 25.7% power reductions. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Evidence is synthesis-backed macro PPA. The paper does not provide a public RTL/netlist/synthesis script bundle for independent audit. |
| AdaP-CIM achieves higher memory density than FP32 with negligible accuracy loss. | Introduction; Section IV. | Experiment / paper-only claim. | The introduction states 4× higher memory density versus FP32; Table I shows 8-bit and 9-bit GLUE results against FP32 reference metrics, and Section IV states that 9-bit AdaP gives 3.56× higher storage density with matched MNLI accuracy. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | The evidenced density/accuracy point depends on bit width and task metric. The reusable boundary is clearest as a numeric-format/storage-density tradeoff, not as an end-to-end compiler optimization. |

## 4. Stack anatomy

```text
Input / frontend:
BERT-Base-Uncased evaluated on CoLA, STS-B, and MNLI. The input object is a model plus task data for quantization experiments, not a named compiler graph or frontend format. Public serialization: unknown.

Middle representation:
AdaP numeric format, written as AdaP(n, es, rs), with sign, bounded regime, exponent, exponent-extension flag/mode, and fraction fields. This is inspectable in the paper’s equations and Fig. 1, but no public schema or type definition artifact was found.

Mapping or scheduling state:
Effective exponents E or Eext, maximum exponent Emax, and exponent offsets Emax − Ei used to shift fractions before CIM computation. This state is named in the datapath discussion, but not serialized as a mapping file, schedule, or IR dump.

Hardware abstraction:
A 256×64 SRAM-CIM macro at 250 MHz in TSMC 28 nm, decomposed into AdaP decoders, SAU, offset calculation and shifters, and SRAM-CIM. The abstraction is visible in Table II as module-level PPA, but the hardware hierarchy below this level is not publicly exposed.

Backend / simulator / codegen:
Hardware evidence is synthesis-backed area/power. The paper does not expose a compiler backend, simulator input format, code generator, or instruction stream.

Output artifact:
Paper tables: GLUE accuracy comparison and macro area/power breakdown. No public run logs, generated IR, generated code, RTL package, or benchmark scripts were found.

Evaluation loop:
Quantize/evaluate BERT-Base-Uncased under Posit, AdaptivFloat, and AdaP at 7/8/9 bits; synthesize the AdaP-CIM macro and compare against a Posit-CIM baseline with CT-based input alignment.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the **AdaP type parameters** `n`, `es`, `rs`, the **encoding branch** selected by threshold `T`, the **per-lane exponent/fraction state**, the **SAU-computed `Emax`**, and the **shift amount** `Emax − Ei` consumed by the CIM MAC datapath. The paper foregrounds a number format and circuit block, while the reusable compiler semantics are most visible in the implicit contract: encoded tensor values must carry enough exponent-mode information for alignment, fraction shifting, integer MAC execution, and final interpretation. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — narrow end-to-end co-design.** AdaP-CIM owns a narrow vertical slice: numeric representation, pre-MAC alignment hardware, and macro-level PPA/accuracy evaluation. The input is a quantized DNN inference setting; the output is GLUE accuracy plus SRAM-CIM macro area/power. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

**Secondary: A1/A2-adjacent.** The work behaves like a macro/datapath design paper with synthesis-backed cost evidence. It is not presented as a reusable circuit generator; rather, it reports a fixed macro size and module breakdown. The A2-like element is the cost evidence, not a public simulator or cost-model plugin. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

### 5.2 Axis B — middle-layer style

**B6 — accuracy / numeric modeling.**  
The named middle representation is AdaP. The decisions made there are bit width, exponent size, bounded regime length, whether an encoded value uses the normal Posit-like path or the exponent-extension path, and how much dynamic range/fraction fidelity the format preserves. The paper gives equations and benchmark tables, but no single artifact that upstream compiler passes could parse or rewrite.

**B1 — type/config-as-IR.**  
`AdaP(n, es, rs)` acts like a type/config object. It determines legal field layouts, maximum regime value, threshold `T`, and exponent-extension behavior. Decisions such as choosing `es` and `rs` from network-parameter distributions remain paper-level and are not exposed as a documented config search or serialized quantizer output. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

**B4 — hardware-resource abstraction.**  
The hardware resource abstraction is the macro/module breakdown: decoder, SAU, offset/shift, SRAM-CIM. Decisions around bit-level SAU structure are described in text and Fig. 2, while lower-level gate-level/netlist choices and synthesis settings remain embedded in the authors’ backend setup. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / module-level first-class** | The evaluated macro is 256×64 SRAM-CIM; Table II separates SRAM-CIM from decoder, SAU, and offset/shift blocks. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Bit-slicing / bit significance | **First-class for exponent-bit comparison; implicit for data MAC** | SAU groups exponent bits by bit position and computes `Emax[j]`; generic tensor bit-slicing is not exposed as a compiler object. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| ADC/DAC precision or sensing | **Not applicable / not exposed** | The paper’s demonstrated macro is SRAM/digital-CIM oriented and does not name ADC/DAC parameters in the stack interface. |
| Analog-to-digital or domain transition | **Not applicable / implicit** | The paper frames CIM as focusing on integer MAC after FP-like input alignment, without an analog sensing/reconstruction interface. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Peripheral circuits as path nodes | **First-class at module level** | AdaP decoder, SAU, offset calculation, and shifters are separately named and costed. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Partial-sum accumulation path | **Implicit** | MAC execution in CIM is the target operation, but partial-sum lifetime, reduction tree, and storage are not represented as explicit compiler objects. |
| Reconstruction / shift-add tree | **Hard-coded / costed at offset-shift level** | “OC & Shift” is costed in Table II; a general reconstruction tree abstraction is not exposed. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable** | The evaluated workload is BERT inference accuracy, but runtime batching, KV cache, masks, and sparsity are not stack objects in the paper. |
| Value trajectory / flow path | **Approximated** | The closest trajectory object is the path from encoded exponent/fraction fields to `Emax`, offset shift, and integer CIM MAC. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) |

### 5.4 Axis D — rewrite object

The work rewrites **numeric format** and **alignment state**. It transforms conventional Posit-style representation into AdaP representation with bounded regime and optional exponent extension, and it transforms a set of per-input effective exponents into a shared `Emax` plus per-input shift offsets.

Legal transformations in the demonstrated framework are:

- choosing the AdaP encoding scheme by comparing effective exponent `E` with threshold `T`;
- encoding `Eext = E − T` when the exponent-extension path is selected;
- replacing a comparator-tree maximum-exponent finder with the SAU’s bit-position grouped speculative max finder;
- shifting each fraction by `Emax − Ei` before CIM integer MAC.

The equivalence exploited is that FP/Posit-like MAC can be decomposed into exponent alignment plus integer-like fraction MAC. The information that must be preserved across lowering is the sign, effective exponent or exponent-extension field, fraction bits, selected encoding mode, and offset relation to `Emax`. The representation is especially well suited to numeric-format and max-exponent alignment rewrites; expressing graph-level fusion, array binding, multi-operator reduction scheduling, or domain-transition retiming would likely require an additional abstraction for tensor placement, partial-sum identity, and backend resource paths.

## 6. Technical mechanism reading

### 6.1 AdaP format as a type-level contract

AdaP modifies Posit by adding a bounded regime length `rs`. For `AdaP(n, es, rs)`, the paper defines the maximum regime value as `kmax = rs − 1` and sets an encoding threshold `T = kmax·2^es + emax = rs·2^es − 1`. When the effective exponent `E ≤ T`, the flag bit is `0` and the remaining fields follow Posit-like encoding. When `E > T`, the flag bit is `1`, and the representation stores an unsigned exponent extension `Eext`, followed by fraction bits. The paper’s example is `AdaP(8,1,3)`: `E = 4` uses the normal path under threshold `T = 5`, while `E = 6` uses `Eext = 1`. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

For compiler/IR purposes, this is the paper’s most concrete reusable object. It behaves like a parametric scalar/tensor type whose legality depends on `n`, `es`, `rs`, and whose value interpretation depends on a mode flag. A future IR could treat this as a type with field-layout constraints and conversion semantics.

### 6.2 SAU as a lowering rule for max-exponent alignment

The conventional FP-CIM path cited by the paper computes the maximum exponent with a comparator tree, then shifts each input fraction by `Emax − Ei` so that CIM can execute integer MAC. For `N` FP8 inputs, the paper states that the comparator-tree baseline needs `N − 1` four-bit comparators, with a critical path of `log2 N` comparators and multiplexers. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

The speculative alignment unit changes the max-exponent computation. It groups exponent bits by bit position, generates the most-significant bit of `Emax` with an OR tree, precomputes possible lower-bit outputs for different upper-bit cases, and then uses the upper-bit result to select the correct lower-bit result. In the six-bit illustration, the critical path occurs when the upper bit is `1` and includes one AND gate, `log2 N` OR gates, and `log2 rs + es` multiplexers. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

A compiler-oriented reading is that SAU is a backend lowering rule for a reduction-like primitive:

```text
max_effective_exponent(lane_exponents) -> Emax
align_fraction(fraction_i, Emax - Ei) -> aligned_fraction_i
CIM_integer_MAC(aligned_fraction_i, weight_fraction_i) -> accumulated result
```

The paper gives the hardware realization of this primitive, while a future IR would need to define the primitive’s type, lane scope, precision contract, and interaction with tensor layout.

### 6.3 Evaluation mechanism

The accuracy evaluation compares Posit, AdaptivFloat, and AdaP on BERT-Base-Uncased across CoLA, STS-B, and MNLI at 7, 8, and 9 bits. The paper notes that AdaptivFloat’s activation exponent bias is fine-tuned offline on the test dataset, which the authors flag as a comparison caveat. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

The hardware evaluation synthesizes an AdaP-CIM macro and a baseline Posit-CIM macro using TSMC 28 nm PDK. The macro size is 256×64 and the clock frequency is 250 MHz. Table II reports that AdaP decoders occupy 15,866 μm² and 1,793 μW, SAU occupies 719 μm² and 110 μW, offset/shift occupies 4,835 μm² and 2,220 μW, and SRAM-CIM occupies 49,000 μm² and 13,299 μW. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

The cost model is therefore **measurement-table/synthesis backed**, not an inspectable symbolic compiler cost model. A future compiler integration would likely wrap the reported module costs as backend parameters or require a new RTL/synthesis calibration.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — AdaP is a useful numeric type, not merely a quantization label

- **Observation:** `AdaP(n, es, rs)` determines field layout, regime bound, exponent-extension threshold, and value interpretation.
- **Why it matters for CIM compiler/IR work:** A compiler that treats “8-bit” as a scalar width would miss the mode flag, bounded regime, exponent-extension semantics, and fraction-preservation constraint.
- **Reusable lesson:** A CIM IR could model AdaP as a parametric numeric type with layout constraints and conversion operations, rather than as an opaque quantization annotation.

### Insight 2 — The alignment unit exposes a hidden lane-scope reduction primitive

- **Observation:** SAU computes a maximum effective exponent across CIM input lanes before fraction shifting.
- **Why it matters for CIM compiler/IR work:** This is a reduction over value metadata, not over tensor values themselves. It affects the legality and cost of lowering FP/Posit-like MACs to integer CIM MACs.
- **Reusable lesson:** Future IRs could introduce a first-class `max_exponent_scope` or `alignment_scope` object that records which lanes share `Emax`.

### Insight 3 — Peripheral circuits carry compiler-relevant semantics

- **Observation:** AdaP decoders, SAU, and offset/shift logic account for a meaningful portion of area and power in the macro breakdown.
- **Why it matters for CIM compiler/IR work:** Peripheral datapath choices are not just backend implementation details; they define what numeric values the array can consume and how they are aligned.
- **Reusable lesson:** A CIM backend contract should expose decoder, alignment, shift, and accumulation resources as costed path nodes.

### Insight 4 — The strongest reusable interface is between numeric encoding and CIM MAC

- **Observation:** The work’s clearest boundary is the transformation from encoded AdaP values to aligned fractions consumed by the CIM integer MAC.
- **Why it matters for CIM compiler/IR work:** This boundary is narrower and more reusable than the whole accelerator claim: a compiler could target this numeric/alignment contract even if its graph scheduler, placement, or memory hierarchy differs.
- **Reusable lesson:** Corpus entries should distinguish “full stack compiler” from “backend datatype/path contract” when classifying CIM co-design papers.

### Insight 5 — The paper suggests a type-system route for value-trajectory IR

- **Observation:** AdaP values carry mode-dependent exponent interpretation, while SAU creates a shared exponent context.
- **Why it matters for CIM compiler/IR work:** Value trajectory through CIM often depends on metadata such as exponent base, bit significance, and alignment domain.
- **Reusable lesson:** A future trajectory IR could attach `encoded_domain`, `effective_exponent`, `alignment_group`, and `fraction_shift` attributes to values as they pass through decoder, alignment, CIM MAC, and accumulation.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** None found for an author-provided code repository, quantization package, RTL, simulator, benchmark scripts, or synthesis flow.
- **Checked sources:** DATE PDF, HKUST research portal, HKUST institutional repository, VSDL publication page, DOI route, and targeted web/GitHub searches. The official pages list the paper and bibliographic details but do not expose a public artifact link. ([VSDL](https://vsdl.hkust.edu.hk/publications/?search=%22tag%3A+compute-in-memory%22))
- **License:** Unknown / not found for an artifact. The HKUST portal lists publisher copyright for the paper; the repository page provides DOI and bibliographic metadata. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/adap-cim-compute-in-memory-based-neural-network-accelerator-using/))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** Not applicable.
- **What the artifact appears to omit:** Public encoder/decoder code, quantization configs, BERT evaluation scripts, GLUE preprocessing details, RTL/netlist, synthesis scripts, simulator input, and generated reports were not found.
- **Minimal command or workflow:** Unknown / not found in the checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown. The paper tables are auditable as reported results, but figure/table reproduction from public scripts is not supported by a located artifact.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---:|---|
| Input format documented | Partial | BERT-Base-Uncased and three GLUE datasets are named; exact quantization/evaluation scripts are not public. |
| Intermediate representation serialized | Unknown | AdaP is formally described, but no serialized IR/type schema was found. |
| Mapping decisions inspectable | Partial | `Emax`, `Ei`, and offset shift are described; no mapping trace or schedule dump was found. |
| Schedule inspectable | Unknown | No operator schedule, array schedule, or compiler pass order is exposed. |
| Hardware config explicit | Partial | Macro size, clock, process, and module breakdown are reported; lower-level implementation files are not public. |
| Precision / bit-slice assumptions explicit | Partial | 7/8/9-bit evaluations and AdaP equations are shown; exact `es`/`rs` choices per benchmark are not fully exposed. |
| Cost model inspectable | Partial | Area/power table is inspectable; formulas/scripts for synthesis-derived costs are not public. |
| Simulator backend documented | N/A / Unknown | The paper reports synthesis-backed PPA; no simulator backend artifact was found. |
| Generated code / instruction stream inspectable | N/A | No compiler/codegen layer is presented. |
| Provenance from source op to backend action | Unknown | The flow from BERT operation to macro action is not serialized. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | TSMC 28 nm PDK and synthesis context are stated; full calibration/synthesis setup is not public. |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The paper names BERT-Base-Uncased and GLUE tasks, but no parser, model importer, or workload package was found.
- **As IR inspiration:** Strongest role. Borrow `AdaP(n, es, rs)`, bounded regime, flag-selected exponent mode, effective exponent, exponent-extension field, and alignment scope as type/value attributes.
- **As mapper/scheduler:** Reuse would be local to pre-MAC alignment, especially a backend lowering rule for max-effective-exponent computation and fraction shifts.
- **As cost model:** The module-level PPA table can seed a backend cost plugin for decoder, SAU, offset/shift, and SRAM-CIM blocks, pending recalibration.
- **As backend:** A compiler could wrap the conceptual backend contract — AdaP decode → `Emax` SAU → offset/shift → SRAM-CIM integer MAC — but a runnable backend would need new implementation work.
- **As benchmark:** The reported BERT/GLUE quantization points are useful comparison anchors, especially CoLA/STS-B/MNLI at 7/8/9 bits.
- **As validation source:** The main validation source is synthesized macro PPA in TSMC 28 nm; no chip-in-loop, RTL release, or public SPICE flow was found.

**Integration effort estimate: High.** Integration would be most direct through a small numeric-format and alignment-state adapter, but the absence of a public artifact means a future stack would need to reimplement the AdaP codec, parameter selection, SAU cost model, and benchmark harness. The most valuable reusable boundary appears to be the parametric numeric type plus lane-scope exponent-alignment primitive.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially the path from AdaP-encoded value fields to exponent alignment and CIM MAC input preparation. The paper names a partial value path: exponent or exponent-extension fields are decoded, a shared `Emax` is computed by SAU, each input fraction is shifted by `Emax − Ei`, and the CIM macro executes integer MAC. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf))

The paper’s demonstrated abstraction centers on **numeric encoding and pre-MAC alignment**. It does not preserve full value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage; in this digital SRAM-CIM setting, the closest approximation to trajectory semantics is the exponent/fraction metadata path through decoder, SAU, and shifter. Bit significance is first-class for exponent comparison, precision is represented through bit width and AdaP parameters, and domain transition is represented as an alignment step into integer-CIM MAC rather than as a general typed resource transition.

A trajectory-level extension would likely attach the following to tensor values or lanes:

```text
encoded_type: AdaP(n, es, rs)
encoding_mode: posit_like | exponent_extension
effective_exponent: E or T + Eext
alignment_scope: set of lanes sharing Emax
fraction_shift: Emax - Ei
compute_domain: encoded_value -> aligned_fraction -> CIM_integer_MAC -> accumulated_result
```

With those additions, a future IR could express trajectory rewrites such as fusing reconstruction with downstream reduction, carrying aligned partial sums across operator boundaries, changing reduction tree structure, or routing values through alternative decoder/shift paths. Retiming ADC conversion is not a direct fit for the demonstrated digital-SRAM path, but the same IR idea could generalize to analog-CIM backends by adding sensing-domain and conversion-stage attributes.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AdaptivFloat** | Adaptive low-bit floating-point-style encoding for resilient DNN inference. | AdaptivFloat dynamically shifts exponent range and clipping at layer granularity and has a public GitHub implementation; AdaP-CIM instead modifies Posit with bounded regime plus exponent extension and couples it to a CIM alignment datapath. ([GitHub](https://github.com/ttambe/AdaptivFloat?utm_source=chatgpt.com)) | Separate numeric-format artifacts from CIM-stack artifacts; both may be “IR inspiration” even when the compiler stack is absent. |
| **DIMCA** | Digital SRAM-CIM macro with approximate arithmetic and 28 nm implementation context. | AdaP-CIM uses a Posit-CIM macro baseline attributed to DIMCA-style hardware and focuses on AdaP decoder/SAU overhead reduction. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Macro papers can provide backend cost anchors without exposing compiler rewrite objects. |
| **ReDCIM** | Digital CIM support for FP/INT-style AI acceleration. | ReDCIM is a broader reconfigurable digital CIM processor with unified FP/INT pipeline; AdaP-CIM narrows the question to Posit-derived encoding and max-exponent alignment hardware. ([DATE Conference](https://past.date-conference.com/proceedings-archive/2024/DATA/1077_pdf_upload.pdf)) | Corpus classification should distinguish processor-level runtime/ISA exposure from datapath-level numeric alignment. |
| **AutoDCIM** | Digital CIM compiler automation. | AutoDCIM is explicitly presented as an automated digital CIM compiler; AdaP-CIM does not expose graph lowering, instruction generation, or mapping DSE. ([Kunming SHAO](https://kunmingshao.github.io/publication/DAC_23)) | Useful contrast: AdaP-CIM belongs near compiler backends as a datatype/path contract, not as an A4 compiler stack. |
| **CIMFlow** | Full-stack digital CIM framework with compiler and simulator. | CIMFlow’s public repo describes ONNX input, compiler-generated ISA, cycle-accurate simulation, configs, Docker, and IR/ISA debug outputs; AdaP-CIM provides paper-level equations and PPA/accuracy tables. ([GitHub](https://github.com/BUAA-CI-LAB/CIMFlow)) | Public corpus notes should track artifact surface separately from conceptual stack relevance. |
| **DPE-CIM** | Posit-derived dynamic encoding and speculative alignment. | DPE-CIM appears to continue the AdaP-CIM direction under “dynamic Posit encoding,” with a five-page ISCAS 2025 publication and broader software/hardware synthesis claims. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/dpe-cim-compute-in-memory-accelerator-using-dynamic-posit-encodin/)) | Treat DPE-CIM as a related successor/near neighbor, while keeping AdaP-CIM’s evidenced scope tied to the DATE 2024 two-page version. |

## 11. Corpus-ready final takeaway

- AdaP-CIM’s real contribution is a **Posit-derived numeric format plus CIM alignment datapath**, centered on bounded regime length, exponent-extension encoding, and speculative max-exponent computation.
- The strongest reusable stack layer is the **backend numeric/type contract**: `AdaP(n, es, rs)`, encoding mode, effective exponent, fraction, `Emax`, and offset shift.
- The evidenced workload scope is **BERT-Base-Uncased on CoLA, STS-B, and MNLI** at 7/8/9 bits, compared against Posit and AdaptivFloat.
- The evidenced hardware scope is a **256×64 SRAM-CIM macro** synthesized in TSMC 28 nm at 250 MHz, with module-level area/power for decoder, SAU, offset/shift, and SRAM-CIM.
- First-class CIM objects include the **AdaP decoder, SAU, exponent bit positions, offset/shift unit, and SRAM-CIM macro**; graph, schedule, instruction stream, and array placement objects are outside the demonstrated interface.
- The hidden IR is the **numeric-alignment state** passed from encoded values to SAU and fraction shifting before integer CIM MAC.
- **Artifact status: no public artifact found.** Reproduction would require reimplementing the quantizer, SAU model, and synthesis/evaluation flow.
- For a value-trajectory IR, AdaP-CIM is most relevant as a case study in making **precision fields and alignment metadata** explicit along the value path.

## 12. Suggested metadata entry

Metadata fields below reflect the DATE/HKUST publication metadata and the paper’s reported evaluation/hardware scope. ([HKUST](https://researchportal.hkust.edu.hk/en/publications/adap-cim-compute-in-memory-based-neural-network-accelerator-using/))

```yaml
paper: "AdaP-CIM: Compute-in-Memory Based Neural Network Accelerator using Adaptive Posit"
year: 2024
venue: "DATE 2024"
authors_or_group: "Jingyu He, Fengbin Tu, Kwang-Ting Cheng, Chi-Ying Tsui; HKUST"
technology:
  - SRAM-CIM
  - digital-CIM
  - posit
  - numeric-format
workloads:
  - BERT-Base-Uncased
  - GLUE CoLA
  - GLUE STS-B
  - GLUE MNLI
axis_A:
  primary: A5
  secondary:
    - A1-adjacent
    - A2-adjacent
axis_B:
  - B6
  - B1
  - B4
axis_C_first_class_objects:
  - AdaP numeric fields
  - bounded regime length
  - exponent-extension mode
  - effective exponent
  - speculative alignment unit
  - max-exponent finder
  - AdaP decoder
  - offset-and-shift unit
  - SRAM-CIM macro
axis_D_rewrite_objects:
  - numeric format
  - exponent-alignment state
  - fraction shift
  - backend datapath lowering
artifact:
  status: "no public artifact found"
  url: null
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: low
trajectory_IR_relevance: medium
notes:
  - "Best classified as hardware-software co-design, not an explicit compiler/IR stack."
  - "Reusable semantics are clearest around AdaP type parameters and lane-scope exponent alignment."
  - "PPA evidence is macro synthesis in TSMC 28 nm; no public RTL or scripts were found."
```