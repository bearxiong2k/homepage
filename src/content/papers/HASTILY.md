# HASTILY — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with secondary **A2 simulator/cost model**, **A3 mapping/scheduling**, and paper-level **A4 ISA-extension** evidence | The demonstrated stack centers on one workload family—BERT-style transformer encoder inference—mapped to one SRAM analog-CIM accelerator design. The paper’s strongest reusable evidence is the UCLM microarchitecture, fine-grained vector scheduling, multi-core softmax reduction, and PUMASim-derived evaluation loop. The compiler is described through supported operations and ISA extensions, rather than through a public IR or frontend contract. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Middle-layer style, Axis B | **B3 tensor/vector schedule IR**, **B4 hardware-resource IR**, **B5 instruction/meta-op/ISA**, partial **B7 runtime-state abstraction** | The named middle concepts are vector-stage pipelining, UCLM/core/tile hierarchy, lookup-vs-compute mode, and extended ISA operations such as transpose vector, multi-core max, tree-sum/reduction, and SIMD exponent. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| First-class CIM objects, Axis C | UCLM, 8T-SRAM compute/lookup array, lookup line, lookup table, UCLM mode, core/tile hierarchy, VFU, RF, shared memory, ADC/DAC, S&H, S&A, local maxima, partial sums, reduction tree, K/V-as-weight mapping | These are named directly in the hardware and scheduling sections. Bit significance is handled by the shift-and-add path; softmax state is represented operationally through local maxima, partial sums, gathers, broadcasts, and reductions. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Rewrite object, Axis D | **Tensor/vector schedule**, **hardware mapping**, **array binding**, **mode selection**, **address mapping**, **instruction stream**, **numeric exp-LUT approximation**, **softmax runtime reduction state** | The stack rewrites transformer computation into row-wise MVMs, assigns K/V matrices as CIM weights, transposes K by address mapping, switches UCLMs between MAC and lookup, partitions softmax across cores, and emits/assumes ISA-level actions for reductions and exponent lookup. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Best corpus tags | `SRAM-CIM`, `analog-CIM`, `transformer-inference`, `BERT`, `softmax-acceleration`, `ISA-extension`, `cycle-level-simulator`, `PUMASim-derived`, `vector-pipelining`, `hardware-software-codesign` | These tags reflect the evidenced hardware, workload, scheduling, and evaluation boundary. |
| Closest comparison baselines | **PUMA**, **ReTransformer**, **X-Former**, **TransPIM**, **Softermax / ITA / Hyft**, **FlashAttention / FLAT** | PUMA is the simulator and architectural baseline; ReTransformer, X-Former, and TransPIM are nearby transformer CIM/PIM accelerators; softmax accelerators are close on function; FlashAttention/FLAT are close on attention-memory scheduling rather than CIM hardware. ([arXiv](https://arxiv.org/pdf/2502.12344)) |

## 2. One-paragraph public summary

HASTILY is a hardware-software co-design for BERT-style transformer encoder inference on an SRAM-based analog-CIM spatial accelerator. Its central contribution is the **Unified Compute and Lookup Module**: an 8T-SRAM CIM structure that can perform both matrix-vector multiplication and exponent-table lookup, enabling softmax acceleration inside the CIM core rather than relegating exponentiation entirely to a vector functional unit. The compiler-facing part of the work is clearest in its vector-level scheduling strategy and ISA extensions: transformer encoder layers are decomposed into row/vector MVM stages, Q/K/V and attention computations are pipelined through UCLMs, K/V are dynamically written as CIM weights, and softmax maxima/sums are reduced across cores through a tree-style gather. For CIM compiler/IR research, HASTILY is best read as a narrow but informative end-to-end stack whose reusable semantics are concentrated in the mapping schedule, UCLM mode model, softmax reduction state, and PUMASim-derived backend contract, rather than in an auditable standalone IR. ([arXiv](https://arxiv.org/pdf/2502.12344)) |

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| HASTILY accelerates transformer attention by addressing softmax and intermediate-matrix storage. | Abstract and Introduction | Experiment + paper-only stack description | The paper motivates softmax and QKᵀ storage as key bottlenecks, then evaluates softmax, encoder-layer, and end-to-end BERT performance. | Demonstrated for simulated SRAM-CIM acceleration of BERT-Base and BERT-Large with INT8 inputs/weights; decoder-phase GPT is explicitly discussed as a more limited use case. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| UCLMs integrate lookup and MAC in the same 8T-SRAM array with minimal/no array-area overhead. | Section III-A, Fig. 3 | Circuit/layout evidence in paper | The paper describes an added lookup line, SL-to-LKL/GND encoding, mode switching through an LK controller, and a TSMC 65nm layout figure. | Paper-level layout evidence is provided; reusable layout, SPICE, RTL, or design files were not found in checked public sources. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| The exponent operation can be accelerated through an in-array lookup table. | Section III-B, Fig. 4, Eq. 3 | Equation + architecture description | The paper decomposes exponentiation into lookup, bit-shift, and residual approximation; it uses K=128, stores 16-bit table entries, and reports approximation error for residual choices. | The evidence supports the paper’s exp-LUT mechanism and approximation analysis; end-to-end accuracy under analog nonidealities is handled as an assumption rather than a measured calibration. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Multi-core softmax reduces max/reduce complexity from N to log(N). | Section III-B.2, Fig. 5 | Scheduling algorithm in prose/figure | Each core computes local maxima and partial sums; partial values are gathered and reduced in a tree-like hierarchy, then redistributed for subtraction/exp and denominator computation. | Demonstrated as a scheduling strategy and evaluated in the simulator for softmax latency/energy across sequence lengths; no public pseudocode or schedule file was found. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Fine-grained pipelining reduces dependence on storing full intermediate matrices. | Section IV, Fig. 6 | Schedule description + timing expression | MatMuls are expressed as iterative MVMs; output vectors from one stage feed downstream MVMs, softmax, and feed-forward stages as soon as dependencies permit. The paper states an N-layer encoder can be computed in `(N + 1) * seqLen * MVM time`. | The demonstrated scope is transformer encoder inference. The Q/K/V projection stage remains a dependency boundary because K must be available before QKᵀ. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| The compiler supports BERT inference and extends the ISA. | Section V-B | Paper-only compiler description | The compiler is described as supporting traditional CIM operations plus transpose vector, multi-core vector max, tree-sum/reduction, and SIMD exponent. | The reusable boundary is described at the ISA-operation level; a parser, IR schema, pass pipeline, generated instruction listing, and public compiler artifact were not found. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Evaluation uses a cycle-level CIM simulator based on PUMASim. | Section V-A | Simulator methodology in paper | PUMASim is adapted from a chip/tile/core/MVMU hierarchy; PUMA MVMUs are replaced with UCLMs, and DRAM/global buffer are included for initial input/weight movement. | Simulator-backed evidence is reported in the paper, but artifact-level confirmation would require source, configs, and reproduction scripts. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| HASTILY improves throughput and energy efficiency over GPU and baseline CIM. | Abstract, Section VI, Figs. 7–13 | Experiment | The paper reports softmax latency reductions, encoder-layer speedups, end-to-end 158 TOPS for BERT-Base and 263 TOPS for BERT-Large, up to 9.8× GPU throughput, and about 8 TOPS/W. | Results are evaluated through simulator-backed HASTILY/PUMA comparisons plus A40 GPU measurements under stated INT8 and on-chip-data assumptions. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Accuracy effects of analog CIM can be addressed by hardware-aware training. | Section VII Discussion | Paper-only assumption | The paper states that low precision is used and analog CIM introduces quantization and functional errors; it assumes such errors can be reduced with hardware-aware training. | The paper-level evidence supports the assumption and cites prior work; it does not provide a HASTILY-specific accuracy/retraining study in the checked text. ([arXiv](https://arxiv.org/pdf/2502.12344)) |

## 4. Stack anatomy

```text
Input / frontend:
  BERT-Base and BERT-Large encoder-model configurations, sequence length, batch size,
  embedding size, head count, layer count, hidden dimension, and INT8 tensors.
  The paper names the workload objects and reports model specifications, but a documented
  import format or frontend schema was not found.

Middle representation:
  The effective middle representation is an implicit transformer operator graph lowered to
  vector/MVM stages plus ISA-level operations. It is best characterized as a tensor-vector
  schedule and instruction/meta-op layer, not as a serialized IR.

Mapping or scheduling state:
  The mapping state includes Q/K/V projection placement, K/V writes into UCLMs as weights,
  K transpose by address mapping, per-head parallelism, UCLM compute-vs-lookup mode, vector
  pipeline timing, softmax partitioning across cores, local maxima, partial sums, tree gathers,
  and broadcasted global maxima. This state is inspectable in figures and prose, but not as a
  machine-readable schedule artifact.

Hardware abstraction:
  A PUMA-like chip/tile/core hierarchy with global buffer, shared memory, instruction memory,
  RF, VFU, UCLMs, 64×64 8T-SRAM arrays, DACs, S&H, ADCs, and shift-add units. Table II gives
  power/area and parameter values; the simulator configuration itself was not found as a
  public file.

Backend / simulator / codegen:
  A cycle-level simulator based on PUMASim, modified by replacing RRAM MVMUs with SRAM UCLMs.
  The compiler is said to emit/support traditional CIM operations plus new ISA extensions for
  transpose, multi-core max, tree reduction, and SIMD exponent. Generated instruction streams
  are not shown as a reusable artifact.

Output artifact:
  Paper-level outputs are latency, energy, TOPS, TOPS/W, and figures comparing HASTILY, PUMA,
  and A40 GPU. No public compiler/simulator output package was found.

Evaluation loop:
  Run BERT-Base/Large parameterized workloads through the HASTILY simulator, compare to a
  modified PUMA baseline and A40 GPU measurements, and report softmax-, encoder-layer-, and
  end-to-end results.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the transformer vector pipeline, UCLM/core/tile allocation, K/V-as-weight mapping, Kᵀ address remapping, softmax reduction tree, UCLM mode schedule, and PUMASim hardware configuration. The paper foregrounds the UCLM architecture and scheduling diagrams, while the reusable semantics are most visible in the ISA-extension list and in the dependency-preserving vector timeline of Fig. 6. ([arXiv](https://arxiv.org/pdf/2502.12344))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — narrow end-to-end co-design.**  
HASTILY owns a vertically integrated slice: SRAM-CIM core design, softmax-specific hardware support, transformer-vector scheduling, ISA extensions, and simulator-backed evaluation. The input slice is BERT-style encoder inference; the output slice is performance and energy estimates for a PUMASim-derived HASTILY accelerator. ([arXiv](https://arxiv.org/pdf/2502.12344))

**Secondary: A2 — simulator & cost model.**  
The evaluation relies on a cycle-level simulator derived from PUMASim with explicit hierarchy and power/area parameters. Hardware characteristics such as global buffer size, number of tiles, UCLMs per core, SRAM array size, DAC/ADC precision, and VFU width are exposed in Table II. ([arXiv](https://arxiv.org/pdf/2502.12344))

**Secondary: A3 — mapping / scheduling / DSE framework.**  
The work’s software contribution is a mapping and scheduling strategy: row-wise MVM decomposition, vector pipelining through attention and feed-forward layers, K/V remapping into UCLMs, and multi-core softmax reductions. The paper notes that the evaluation setup can explore hardware configurations, model parameters, and quantization, but the demonstrated artifact boundary is paper-level. ([arXiv](https://arxiv.org/pdf/2502.12344))

**Partial A4 — explicit ISA/compiler stack.**  
The compiler is described through an extended ISA rather than a public dialect or IR. The named operations—transpose vector, multi-core vector max, tree reduction, and SIMD exponent—are important compiler-stack objects, but their syntax, serialization, lowering rules, and verification contract are not exposed in checked public sources. ([arXiv](https://arxiv.org/pdf/2502.12344))

### 5.2 Axis B — middle-layer style

**B3 — tensor/vector schedule IR.**  
The named middle representation is the fine-grained vector pipeline. Decisions made at this layer include which matrices are produced before attention begins, when each vector can feed the next MVM, which stages can overlap, and where the Q/K/V dependency boundary lies. Decisions about exact tile/core allocation and emitted instruction ordering remain embedded in the compiler/simulator description. No single upstream-readable serialized schedule was found.

**B4 — hardware-resource IR.**  
The hardware-resource objects are unusually concrete: chip, tile, core, shared memory, RF, VFU, UCLM, SRAM array, LK controller, DAC, ADC, S&H, and S&A. Decisions made here include compute-vs-lookup mode, lookup-table placement, exponent parallelism across SRAM arrays, and core-level softmax partitioning. The hardware resource model is documented in figures and Table II, while a machine-readable hardware description is not available in the checked sources.

**B5 — instruction/meta-op/ISA.**  
The paper explicitly identifies ISA extensions: transpose vector, finding maxima of a vector mapped to multiple cores, tree-sum/reduction, and single-instruction multiple exponent. This is the clearest compiler/backend boundary. The instruction stream is not shown, so legality and lowering behavior must be inferred from scheduling diagrams and text.

**Partial B7 — runtime-state abstraction.**  
Softmax requires local maxima, global maxima, partial exponent sums, denominators, store/load-based broadcasts, and cross-core tree reductions. These runtime states are not typed as an IR object, but they are operationally central to the compiler schedule and accelerator interface.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class** | UCLM, 64×64 SRAM arrays, 8 arrays per UCLM, 16 UCLMs per core, core/tile/chip hierarchy are named and parameterized. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Bit-slicing / bit significance | **Parameter / partially first-class** | S&A manages different bit significance for inputs and weights; 8-bit inputs/weights are used in evaluation. The exact bit-slice IR is not exposed. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| ADC/DAC precision or sensing | **Parameter** | Table II lists DAC and ADC components, with 1-bit DAC and 6-bit ADC precision. The compute path includes S&H and ADC conversion. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Analog-to-digital or domain transition | **Costed / described** | BL voltage is sampled, converted by ADC, and processed by S&A. Energy discussion states ADC energy dominates overall energy. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Peripheral circuits as path nodes | **First-class in architecture, costed in table** | VFU, RF, LK controller, DAC, S&H, MUX, ADC, S&A, shared memory, and memory bus appear in the architecture and hardware table. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Partial-sum accumulation path | **First-class for MVM; first-class runtime state for softmax reduction** | BL accumulation and S&A are described for MAC; local maxima and partial sums are gathered/reduced for softmax. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Reconstruction / shift-add tree | **First-class component, not exposed as standalone IR** | S&A manages bit significance and computes final MAC output; shift operations also complete exp lookup. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime state: partial; batching: parameter; KV cache: not central** | The work is encoder/prefill oriented. It tracks K/V matrices as dynamically written weights and discusses batch-size behavior; decoder KV-cache state is outside the demonstrated core scope. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| Value trajectory / flow path | **Approximated through schedule diagrams and hardware path** | The paper names stages such as Q/K/V projection, QKᵀ, scale/softmax, SV, output projection, and feed-forward; Fig. 6 gives a trajectory-like timeline, but not a typed value-flow IR. ([arXiv](https://arxiv.org/pdf/2502.12344)) |

### 5.4 Axis D — rewrite object

The compiler/tool rewrites:

- **Operator graph → vector-stage schedule:** transformer encoder blocks become Q/K/V projection, QKᵀ vectors, scale/softmax, SV vectors, output projection, Add/LayerNorm, and feed-forward stages.
- **MatMul → iterative MVMs:** each input row becomes one MVM, and output rows can feed downstream MVMs without storing full intermediate matrices.
- **K/V tensors → dynamic CIM weights:** K and V are written into UCLM arrays for attention, while K is transposed through address mapping.
- **Softmax vector → distributed runtime state:** local maxima and partial sums become per-core states, then tree-reduced and broadcast.
- **Exponent → LUT + shift + residual approximation:** exp is represented as a lookup-assisted numeric operation with K=128 and 16-bit entries.
- **Hardware execution → ISA/meta-ops:** transpose vector, multi-core max, tree reduction, and SIMD exponent become instruction-level backend actions.

The legal transformations exploit row-wise decomposition of matrix multiplication, associativity of max/sum reductions for tree-style softmax, address-remapping equivalence for transpose, and table/shift approximation for exponentiation. The representation must preserve data dependencies between Q/K/V projection and QKᵀ, per-head identity, row/vector ordering, bit significance, precision assumptions, UCLM mode, and the global softmax denominator. The representation is especially well suited to BERT encoder attention and vector-level pipelining; expressing decoder-phase KV-cache updates, online attention variants, retimed ADC placement, or cross-operator analog partial-sum reuse would likely require an added abstraction for value trajectory, domain transitions, and persistent runtime state.

## 6. Technical mechanism reading

### 6.1 UCLM as the hardware/compiler anchor

HASTILY’s compiler-visible hardware unit is the **Unified Compute and Lookup Module**. Each core has multiple UCLMs, and each UCLM contains dual-functionality 8T-SRAM arrays. The LK controller switches the array between compute and lookup modes; the same physical array can support MAC-style CIM and ROM-like lookup. ([arXiv](https://arxiv.org/pdf/2502.12344))

The lookup mechanism is operationally important for compiler modeling. A lookup copies the SRAM row to a buffer, writes `1` to the row, asserts the lookup line, reads the SL-encoded lookup bits, and writes the original row back; the paper reports 4-cycle lookup latency. This means lookup is not simply a pure register-file read in the backend model: it is a mode-specific SRAM operation with preservation of original row contents. ([arXiv](https://arxiv.org/pdf/2502.12344))

The compute mechanism follows analog-CIM semantics: multiple read wordlines are activated, bitline discharge represents the dot product, S&H captures the analog value, ADC converts it to digital, and S&A combines bit-significance contributions to produce the MAC output. This path exposes the CIM boundary most directly: analog accumulation, sensing, conversion, and reconstruction are all part of the backend contract, even though they are not surfaced as a typed IR. ([arXiv](https://arxiv.org/pdf/2502.12344))

### 6.2 Softmax as a CIM scheduling problem

The paper uses numerically stable softmax:

\[
\mathrm{softmax}(M_{i,j}) =
\frac{\exp(M_{i,j} - \max_j)}
{\sum_j \exp(M_{i,j} - \max_j)}
\]

and decomposes it into maxima, subtraction, exponent, reduction, and division. The key hardware-software decision is to move the exponent-heavy portion into UCLM lookup while leaving max/add/sub/div style vector operations to VFUs and cross-core scheduling. ([arXiv](https://arxiv.org/pdf/2502.12344))

For exponentiation, HASTILY uses a lookup-assisted decomposition of `e^x` into a power-of-two scale, a `2^(d/K)` lookup, and a small residual approximation. The paper stores `2^(i/K)` entries with `K=128`, uses 16-bit table values, and reports approximation error below 0.54% with residual approximated as 1 and 0.0015% with `1+r`. ([arXiv](https://arxiv.org/pdf/2502.12344))

The multi-core softmax schedule is the most IR-relevant algorithmic mechanism. Each core computes local maxima and partial sums, then those states are gathered and reduced in a tree-like hierarchy. The global maximum is redistributed so each core can subtract and exponentiate in parallel; a similar reduction computes the denominator. This turns a softmax vector into distributed scalar states plus per-core vector fragments. ([arXiv](https://arxiv.org/pdf/2502.12344))

### 6.3 Fine-grained vector pipeline

The scheduling mechanism treats one vector/row as the pipeline granule. A MatMul is represented as a sequence of MVMs; the output row of one MVM can be consumed by a downstream MVM while the next row is still being produced. This is the paper’s central compiler transformation for reducing intermediate storage pressure. ([arXiv](https://arxiv.org/pdf/2502.12344))

For attention, the Q/K/V projection stage is a dependency boundary. Inputs are multiplied by WQ, WK, and WV; then K and V are written into downstream UCLMs as weights, and K is transposed by changing address mapping. Once K is available, each head executes QKᵀ one vector at a time, scales the result, performs softmax in LT mode, immediately feeds the softmax vector to the V multiplication, and overlaps the next QKᵀ/softmax computation. ([arXiv](https://arxiv.org/pdf/2502.12344))

Within and across encoder layers, Add/LayerNorm and feed-forward stages are also pipelined at vector granularity. The paper summarizes the schedule by stating that an N-layer encoder can perform inference in `(N + 1) * seqLen * MVM time`, with Q/K/V projection as the non-pipelined dependency boundary. ([arXiv](https://arxiv.org/pdf/2502.12344))

### 6.4 Backend assumptions and cost model

The simulator is based on PUMASim and uses a chip/tile/core/MVMU hierarchy, with PUMA’s RRAM MVMUs replaced by SRAM UCLMs. The model includes DRAM and a global buffer for initial input/weight movement. Evaluations assume 8-bit inputs and weights, 16-bit lookup table resolution, 16 UCLMs per core, 8 crossbars per UCLM, and 64×64 crossbars. ([arXiv](https://arxiv.org/pdf/2502.12344))

The hardware table gives power/area parameters for global buffer, tile, shared memory, memory bus, core, VFU, register file, UCLM, DAC, and ADC. This is enough for paper-level comparison and high-level corpus classification, but a reusable backend plugin would need the simulator source, instruction costs, memory timing, and calibration scripts. ([arXiv](https://arxiv.org/pdf/2502.12344))

The paper compares HASTILY to a modified PUMA baseline and Nvidia A40 measurements. For GPU evaluation, it uses Hugging Face `transformers`, `bitsandbytes`, `nvidia-smi`, and PyTorch timing; for accelerator evaluation, it assumes accelerator data can remain on-chip except initial inputs and final outputs. ([arXiv](https://arxiv.org/pdf/2502.12344))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — UCLM mode is a compiler-visible resource

- **Observation:** The compute-vs-lookup mode of each UCLM is central to performance: the same SRAM resource can serve MACs or exponent lookup, with the LK controller governing mode behavior.
- **Why it matters for CIM compiler/IR work:** A future IR should not model CIM arrays as homogeneous matrix engines only. It should include mode-capable memory resources and represent mode transitions as scheduleable, costed events.
- **Reusable lesson:** Borrow a `memory_resource + mode + latency + preservation` abstraction: UCLM lookup has state-preserving row restore semantics, while UCLM compute has analog accumulation and ADC/S&A semantics.

### Insight 2 — The vector, not the operator, is the effective scheduling atom

- **Observation:** HASTILY’s pipeline improvement comes from treating each row/vector MVM as a stage that can feed downstream computation before the whole matrix is materialized.
- **Why it matters for CIM compiler/IR work:** Graph-level transformer ops are too coarse to capture this optimization. A useful middle layer needs vector-stage tokens with dependencies, storage requirements, and target-resource bindings.
- **Reusable lesson:** A CIM compiler could add an intermediate “streamed vector tile” representation between graph IR and hardware instructions.

### Insight 3 — Softmax creates distributed scalar state

- **Observation:** The softmax schedule materializes local maxima, global maxima, local exponent sums, and a denominator across cores.
- **Why it matters for CIM compiler/IR work:** Attention is not only a sequence of tensor ops; it is also a reduction-state protocol. Correctness depends on preserving the relationship between each vector fragment and the global maximum/denominator.
- **Reusable lesson:** Future IRs should type reduction states and broadcasts explicitly, especially when values cross core boundaries and alternate between CIM lookup and VFU arithmetic.

### Insight 4 — Dynamic weights are a first-class transformer-CIM issue

- **Observation:** HASTILY distinguishes static projection/FFN weights from dynamic attention matrices. K and V are generated at runtime and then written into UCLMs as weights; Kᵀ is produced through address mapping.
- **Why it matters for CIM compiler/IR work:** Transformer CIM stacks need to represent array reprogramming, temporary weight residency, address remapping, and write energy/latency—not only static model placement.
- **Reusable lesson:** Treat “activation becomes CIM weight” as a lowering rule with placement, lifetime, precision, and transpose metadata.

### Insight 5 — The simulator boundary is more concrete than the compiler boundary

- **Observation:** The paper gives a fairly concrete backend hardware model—PUMASim hierarchy, UCLM replacement, Table II parameters—while the compiler is summarized through supported ISA extensions.
- **Why it matters for CIM compiler/IR work:** For reuse, the backend contract is currently more recoverable than the frontend or IR contract.
- **Reusable lesson:** A future corpus adapter would most profitably start by reconstructing a hardware-config schema and instruction/meta-op set, then derive a minimal schedule IR around Fig. 6 and the softmax tree.

### Insight 6 — ADC cost shapes the value of architectural rewrites

- **Observation:** The paper reports that energy differences between PUMA and HASTILY are small because instruction counts and internal accesses are similar, while ADC energy dominates.
- **Why it matters for CIM compiler/IR work:** A compiler cost model that optimizes only MVM count or lookup placement may miss dominant peripheral costs.
- **Reusable lesson:** Peripheral-path energy—especially sensing/conversion—should be carried as a first-class cost on value trajectories.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** Unknown / not found in checked sources.
- **License:** Unknown / no public code artifact found.
- **Last checked date:** 2026-05-15.
- **What the paper says:** The arXiv version states that the “Code base of our evaluation setup will be open-sourced at github.” ([arXiv](https://arxiv.org/pdf/2502.12344))
- **What was checked:** exact-title web search, HASTILY + CIM + BERT + PUMASim queries, HASTILY + UCLM GitHub queries, author/name queries, arXiv page, and general GitHub-indexed search results.
- **What the artifact contains:** No public artifact found.
- **What the artifact appears to omit:** No public compiler, simulator fork, configs, generated ISA traces, benchmark scripts, model-import code, calibration files, or reproduction workflow were found.
- **Minimal command or workflow:** Unknown / not found in checked sources.
- **Whether paper figures appear reproducible from the artifact:** Unknown; paper figures are not reproducible from a located public artifact.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | BERT-Base/Large dimensions and evaluation settings are documented, but a compiler input schema or importer contract was not found. |
| Intermediate representation serialized | Unknown | No serialized IR, dialect, or schedule file was found. |
| Mapping decisions inspectable | Partial | Figures and prose show K/V mapping, K transpose by address mapping, vector pipeline, and softmax partitioning. |
| Schedule inspectable | Partial | Fig. 6 and Section IV explain the schedule; no machine-readable schedule artifact was found. |
| Hardware config explicit | Partial | Table II gives hardware parameters; simulator config files were not found. |
| Precision / bit-slice assumptions explicit | Partial | 8-bit inputs/weights, 16-bit lookup entries, 6-bit ADC, and 1-bit DAC are stated; bit-slice layout is not exposed as an IR. |
| Cost model inspectable | Partial | Power/area table and simulator methodology are described; formulas/source code are not public in checked sources. |
| Simulator backend documented | Partial | PUMASim-derived hierarchy and UCLM replacement are described; backend API/source is not found. |
| Generated code / instruction stream inspectable | Unknown | ISA extensions are named, but generated instruction streams are not shown. |
| Provenance from source op to backend action | Partial | Provenance is inferable for attention stages and softmax operations, but not traceable through an artifact. |
| Reproduction scripts available | Unknown | No scripts found. |
| Calibration source documented | Partial | TSMC65nm implementation and scaling to 32nm are described; calibration artifacts are not public in checked sources. |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The workload boundary is BERT encoder configurations rather than a documented model importer. Integration would require a frontend adapter from PyTorch/Hugging Face or ONNX-style transformer graphs into HASTILY’s vector-stage schedule.
- **As IR inspiration:** Strong. Useful abstractions include UCLM mode, lookup-table-backed exponent, activation-as-weight remapping, vector-stage pipeline tokens, multi-core softmax reduction state, and peripheral-aware value paths.
- **As mapper/scheduler:** Strong at the concept level. The fine-grained vector pipeline and tree-style softmax reduction could be adapted into a mapper for attention accelerators.
- **As cost model:** Medium. Table II and the PUMASim-derived setup provide a starting point for SRAM-CIM UCLM cost parameters; reuse would benefit from a small adapter that separates MVM, lookup, VFU, shared-memory, ADC, and S&A costs.
- **As backend:** Medium-to-high effort. A backend wrapper would need reconstructed ISA semantics and simulator input formats because the public compiler/simulator artifact was not found.
- **As benchmark:** Useful. BERT-Base/BERT-Large, sequence-length sweeps, batch-size sweeps, PUMA-style CIM baseline, and A40 comparison form a clear benchmark scenario.
- **As validation source:** Partial. The paper provides layout-level claims and simulator-calibrated numbers from TSMC65nm/32nm scaling, but no public SPICE/RTL/chip-in-loop data or measurement harness was found.

**Integration effort estimate: High.**  
Integration would be most direct through reconstructing a schedule-level model from Fig. 6 and a hardware-config model from Table II. The most valuable reusable boundary appears to be the ISA/meta-op plus UCLM-resource abstraction. The effort is high because the compiler, simulator fork, generated instruction streams, and reproduction scripts were not found as public artifacts.

## 9. Relation to a value-trajectory CIM IR project

HASTILY provides useful ingredients for a value-trajectory IR, especially its explicit hardware path through UCLM compute, ADC, S&A, VFU operations, lookup mode, shared memory, and cross-core reduction. The closest approximation to trajectory semantics is Fig. 6’s vector pipeline plus Fig. 5’s softmax reduction protocol: values move from Q/K/V projection into dynamic CIM weights, through QKᵀ MVM, scale, lookup-backed softmax, SV MVM, output projection, Add/LayerNorm, and feed-forward stages. ([arXiv](https://arxiv.org/pdf/2502.12344))

The paper names several value paths but does not preserve value identity as a typed object across all stages. Analog partial sums are described inside the UCLM compute path, and digital reductions are described for softmax, but the representation centers on scheduling and hardware operations rather than on a serializable value-flow trajectory. Bit significance is handled by S&A, precision is parameterized, and domain transitions are described through ADC/S&H, but these are not carried as type-like annotations from frontend tensor to backend instruction. ([arXiv](https://arxiv.org/pdf/2502.12344))

A trajectory-level extension would likely attach the following metadata to each vector fragment or partial sum:

- placement: tile/core/UCLM/SRAM array,
- domain: digital register, analog bitline, sensed digital value, reconstructed MAC output,
- precision: input/weight bit width, ADC precision, lookup precision, residual approximation choice,
- role: Q vector, K-as-weight, V-as-weight, logit vector, softmax numerator, denominator, attention output,
- path node: DAC, BL accumulation, S&H, ADC, S&A, VFU, shared memory, lookup table, reduction tree,
- reduction state: local max, global max, local sum, denominator, broadcast generation.

Under such an extension, HASTILY-like rewrites could express fusing reconstruction with downstream reduction, carrying bit-sliced partial sums across operator boundaries, changing softmax reduction-tree shape, or choosing alternative peripheral paths. Delaying ADC conversion or retiming analog-domain accumulation would require a richer hardware model than the paper demonstrates, because the current compute path samples and digitizes each MVM output before S&A and downstream VFU/lookup scheduling. ([arXiv](https://arxiv.org/pdf/2502.12344))

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PUMA** | Programmable CIM accelerator, ISA/simulator lineage, chip/tile/core hierarchy | HASTILY uses a PUMASim-derived backend and PUMA-style hierarchy, but replaces MVMUs with SRAM UCLMs and adds transformer/softmax ISA support. | Corpus should tag HASTILY as PUMA-lineage simulator/ISA work, but with a transformer-specific UCLM and scheduling contribution. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| **ReTransformer** | CIM/PIM transformer acceleration and intermediate-matrix pressure | ReTransformer is cited as ReRAM-based transformer PIM; HASTILY instead uses SRAM UCLMs for both MVM and exp lookup plus fine-grained vector pipelining. | Useful contrast between transformer-CIM dataflow solutions and in-array softmax-function support. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| **X-Former** | In-memory acceleration for transformers | HASTILY’s contribution is more specifically a dual-function SRAM CIM core plus softmax schedule and ISA extensions. | Place HASTILY near transformer CIM accelerators, but annotate its strongest first-class object as UCLM/mode/reduction state. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| **TransPIM** | Transformer acceleration through memory-centric hardware/software co-design | TransPIM is cited as memory-based transformer acceleration; HASTILY focuses on SRAM analog-CIM cores and BERT encoder pipeline/softmax lookup. | Corpus comparison should emphasize stack slice: off-chip/system PIM versus SRAM-CIM core and local vector pipeline. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| **Softermax / ITA / Hyft** | Softmax/attention acceleration | These works are close on the softmax bottleneck; HASTILY differs by embedding exponent lookup into dual-function CIM arrays and scheduling reductions across CIM cores. | HASTILY is valuable for IR work because softmax is represented as hardware-resource scheduling, not merely as an approximate arithmetic unit. ([arXiv](https://arxiv.org/pdf/2502.12344)) |
| **FlashAttention / FLAT** | Attention dataflow and memory-footprint reduction | These are not SRAM-CIM stacks, but they are close in treating attention as a schedule/data-movement problem. HASTILY brings a CIM-specific hardware path and UCLM mode model. | Helpful corpus cross-link for value-trajectory IR: both classes expose attention value movement, but at different hardware abstraction levels. ([arXiv](https://arxiv.org/pdf/2502.12344)) |

## 11. Corpus-ready final takeaway

- HASTILY’s real contribution is a transformer-oriented SRAM analog-CIM co-design: UCLM arrays support both MVM and exponent lookup, and software schedules softmax and encoder stages around that dual-function resource.
- The strongest reusable stack layer is the **mapping/scheduling layer**: vector-granular transformer pipelining, K/V dynamic weight placement, K transpose by address mapping, and tree-style multi-core softmax reduction.
- The demonstrated scope is BERT-Base and BERT-Large encoder inference with INT8 inputs/weights and simulator-backed evaluation against modified PUMA and A40 GPU baselines.
- First-class CIM objects include UCLM, 8T-SRAM array, lookup line/table, compute/lookup mode, VFU, RF, shared memory, ADC/DAC, S&H, S&A, local maxima, partial sums, and reduction tree.
- The hidden IR is best read as the combination of transformer vector schedule, UCLM/core/tile allocation, runtime softmax states, ISA meta-ops, and PUMASim hardware configuration.
- **Artifact status: no public artifact found.** The paper states that the codebase would be open-sourced on GitHub, but no public compiler/simulator artifact was found in checked sources. ([arXiv](https://arxiv.org/pdf/2502.12344))
- Integration is most plausible as IR inspiration, mapper/scheduler logic, benchmark scenario, or backend cost-model reconstruction; direct reuse as a compiler artifact would require substantial reconstruction.
- For value-trajectory IR research, HASTILY is a useful case because it exposes where values cross CIM modes, analog/digital boundaries, reconstruction paths, and distributed reduction states, even though those trajectories are not represented as a typed public IR.

## 12. Suggested metadata entry

```yaml
paper: "HASTILY: Hardware-Software Co-Design for Accelerating Transformer Inference Leveraging Compute-in-Memory"
year: 2025
venue: "IEEE Transactions on Circuits and Systems for Artificial Intelligence; arXiv:2502.12344"
authors_or_group: "Dong Eun Kim, Tanvi Sharma, Kaushik Roy"
technology:
  - SRAM-CIM
  - analog-CIM
  - 8T-SRAM
  - transformer-CIM
workloads:
  - BERT-Base
  - BERT-Large
  - transformer encoder inference
  - softmax
  - matrix-vector multiplication
axis_A:
  primary: A5_narrow_end_to_end_codesign
  secondary:
    - A2_simulator_cost_model
    - A3_mapping_scheduling
    - A4_ISA_extension_paper_level
axis_B:
  - B3_tensor_vector_schedule_IR
  - B4_hardware_resource_IR
  - B5_instruction_meta_op_ISA
  - B7_runtime_state_abstraction_partial
axis_C_first_class_objects:
  - UCLM
  - 8T_SRAM_compute_lookup_array
  - lookup_line_LKL
  - exponent_lookup_table
  - compute_lookup_mode
  - chip_tile_core_hierarchy
  - VFU
  - register_file
  - shared_memory
  - DAC
  - sample_and_hold
  - ADC
  - shift_and_add
  - local_maximum
  - partial_sum
  - tree_reduction
  - dynamic_KV_as_CIM_weights
axis_D_rewrite_objects:
  - operator_graph_to_vector_schedule
  - matmul_to_iterative_MVM
  - hardware_mapping
  - array_binding
  - memory_address_mapping
  - UCLM_mode_selection
  - softmax_reduction_state
  - instruction_stream
  - exponent_LUT_numeric_approximation
artifact:
  status: "no public artifact found"
  url: null
  license: "unknown"
  last_checked: "2026-05-15"
integration_roles:
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - backend_reconstruction
  - benchmark
  - validation_partial
reproducibility_level: low
trajectory_IR_relevance: medium
notes:
  - "Strongest evidence is architecture/scheduling/simulator-backed evaluation, not a public IR."
  - "Compiler is described through BERT support and ISA extensions; frontend contract and generated traces are unknown."
  - "Value-trajectory relevance comes from UCLM mode switching, analog-to-digital path, S&A reconstruction, and distributed softmax reduction state."
  - "Best classified as a narrow transformer SRAM-CIM co-design rather than a backend-agnostic compiler/IR stack."
```