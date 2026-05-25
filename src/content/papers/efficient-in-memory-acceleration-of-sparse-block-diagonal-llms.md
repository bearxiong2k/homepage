---
slug: efficient-in-memory-acceleration-of-sparse-block-diagonal-llms
title: "Efficient In-Memory Acceleration of Sparse Block Diagonal LLMs"
short_title: "SparseBD-LLM CIM"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "IEEE Cross-disciplinary Conference on Memory-Centric Computing (CCMCC), to appear / arXiv v1"
authors_or_group: "João Paulo C. de Lima, Marc Dietrich, Jeronimo Castrillon, Asif Ali Khan"
summary: >-
  This paper is best read as a focused hardware-software co-design study for mapping Monarch-style block-diagonal transformer weights onto analog CIM crossbars. Its core contribution is not a general CIM compiler IR, but a set of mapping and scheduling rules that make block-diagonal structure usable on CIM arrays: a latency-oriented sparse mapping, a capacity-oriented dense packing, diagonal-index placement with rotation cancellation, permutation folding, and mapping-aware temporal row/column activation. The demonstrated workload is transformer inference over parameterized matmuls in BERT-large, BART-large, and GPT-2-Medium, evaluated through a simulator based on IBM’s PCM-oriented 3D AIMC modeling stack with ADC/DAC design-space variation. For CIM compiler/IR research, the paper is valuable because it exposes a compact “hidden IR” centered on packed array layout, diagonal offsets, ADC sharing, and schedule timestamps—objects that a future explicit IR could name, type, verify, serialize, and lower to a backend. ([arXiv](https://arxiv.org/pdf/2510.11192v1))
links:
  paper: https://arxiv.org/abs/2510.11192
  artifact:
  docs:
  code:
technology:
  - "analog-CIM"
  - "PCM-CIM-simulation"
  - "NVM-CIM"
  - "SRAM-CIM-mentioned"
  - "hybrid-simulator-stack"
workloads:
  - "BERT-large parameterized matmuls, context length 512"
  - "BART-large parameterized matmuls, context length 1024"
  - "GPT-2-Medium parameterized matmuls, context length 1024"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A5, A2]
axis_B: [B4, B1, B3, B6]
axis_C_first_class_objects:
  - "Monarch_block_diagonal_factors_L_R"
  - "fixed_permutation_P"
  - "CIM_crossbar_array_m_by_m"
  - "block_size_b"
  - "block_to_array_binding"
  - "diagonal_index"
  - "rotation_shift_metadata"
  - "row_column_activation_mask"
  - "ADC_count"
  - "ADC_precision"
axis_D_rewrite_objects:
  - "dense_parameterized_matmul_to_Monarch_matmul"
  - "permutation_folding"
  - "hardware_mapping"
  - "array_binding"
  - "packed_memory_layout"
  - "temporal_schedule"
  - "ADC_precision_cost_parameter"
artifact:
  status: "no public artifact found"
  url: 
  license: 
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend_adapter"
  - "benchmark"
reproducibility_level: low
notes:
  - "Strongest evidence is for layout-aware mapping and scheduling of stationary Monarch-sparse transformer weights."
  - "Paper uses an existing open-source AIMC simulator and Accelergy ADC plugin, but no paper-specific implementation was found."
  - "Value-trajectory relevance comes from rotation/shift semantics, ADC-sharing schedule, and partial-result combination."
takeaways: []
---

# Efficient In-Memory Acceleration of Sparse Block Diagonal LLMs — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework** | The paper’s clearest stack ownership is the transformation from Monarch-style block-diagonal matrices into CIM array placements, plus mapping-aware row/column activation scheduling. The authors frame the problem as placing \(N \cdot p\) Monarch matrices onto \(m \times m\) CIM arrays and compare Linear, SparseMap, and DenseMap mappings. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design; A2 — simulator/cost-model user** | The paper claims a D2S → mapper → scheduler → CIM-simulator flow, but the demonstrated reusable slice is mapping/scheduling for stationary parameterized matmuls evaluated through an existing AIMC simulator and Accelergy ADC model. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Middle-layer style, Axis B | **B4 Hardware-resource IR; B1 Config-as-IR; B3-like schedule state** | The middle objects are not presented as a named IR/dialect. The effective representation is a hardware-resource mapping: block diagonals, diagonal indices, packed crossbar layout, ADC sharing, activation timestamps, and simulator configuration. |
| First-class CIM objects, Axis C | **CIM arrays/crossbars, block-diagonal matrices \(L,R\), diagonal index, row/column activation set, ADC count/precision, mapping strategy, temporal schedule** | The paper directly names the \(m \times m\) CIM array, block size \(b\), block-diagonal \(L,R\) factors, SparseMap/DenseMap, diagonal index \(i\), ADC sharing, ADC resolution, and scheduler-generated addresses/control commands. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Rewrite object, Axis D | **Hardware mapping, array binding, memory layout, algebraic permutation placement, temporal schedule, numeric precision parameter** | The work rewrites dense parameterized matmuls into Monarch factors, folds permutations into \(L,R\), packs block diagonals into arrays, chooses diagonal/shift placement, and schedules row/column activation under ADC-sharing constraints. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Best corpus tags | `compiler-mapping`, `mapping-aware-scheduling`, `analog-CIM`, `PCM-CIM-simulation`, `Monarch-matrix`, `structured-sparsity`, `LLM-inference`, `ADC-sharing`, `crossbar-layout`, `simulator-backed-evaluation` | Tags reflect the actual compiler/IR-relevant object: block-diagonal layout and schedule over analog CIM resources. |
| Closest comparison baselines | **ASADI; TranCIM; Adaptable Butterfly Accelerator; Monarch / Monarch Mixer; IBM 3D-SiM simulator** | ASADI and TranCIM are close on sparse transformer/CIM scheduling; Adaptable Butterfly and Monarch are close on structured sparse matrices; IBM 3D-SiM is the simulator dependency used for evaluation. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |

## 2. One-paragraph public summary

This paper is best read as a focused hardware-software co-design study for mapping Monarch-style block-diagonal transformer weights onto analog CIM crossbars. Its core contribution is not a general CIM compiler IR, but a set of mapping and scheduling rules that make block-diagonal structure usable on CIM arrays: a latency-oriented sparse mapping, a capacity-oriented dense packing, diagonal-index placement with rotation cancellation, permutation folding, and mapping-aware temporal row/column activation. The demonstrated workload is transformer inference over parameterized matmuls in BERT-large, BART-large, and GPT-2-Medium, evaluated through a simulator based on IBM’s PCM-oriented 3D AIMC modeling stack with ADC/DAC design-space variation. For CIM compiler/IR research, the paper is valuable because it exposes a compact “hidden IR” centered on packed array layout, diagonal offsets, ADC sharing, and schedule timestamps—objects that a future explicit IR could name, type, verify, serialize, and lower to a backend. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CIM-aware sparse mapping densely packs block-diagonal matrices onto CIM arrays and reduces fragmentation. | Introduction contribution list; Sec. III-B. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Algorithm / paper-only mechanism / experiment | Two mapping families are described: SparseMap partitions/pads \(L,R\) across arrays; DenseMap packs multiple block diagonals into one array and introduces diagonal-index-aware layout. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Demonstrated for Monarch-structured parameterized matmuls in transformer layers, not as a released generic sparse-layout compiler pass. |
| Performance-aware scheduling balances ADC sharing and parallelism. | Introduction contribution list; Sec. III-C. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Algorithm / paper-only mechanism | DenseMap requires mapping-aware CIM instructions; the scheduler activates subsets of rows and columns over timestamps \(t_0\)–\(t_3\), generates memory addresses/control commands, and runs arrays in parallel while temporally scheduling within each array. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Paper-level evidence supports the scheduling rule and its simulator use; artifact-level inspection of emitted commands was not found in checked sources. |
| End-to-end automation from dense model to sparse CIM execution. | Fig. 2 and Sec. III overview. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Paper-only flow diagram / experiment | The described flow is D2S transformation → mapper → scheduler → CIM simulator. The paper explains each stage conceptually and evaluates outputs through simulation. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | The demonstrated scope is an end-to-end experimental flow in the paper. Public frontend schema, serialized IR, pass API, and figure reproduction scripts were not found in checked sources. |
| D2S transformation reduces BERT-large parameter count and FLOPs. | Fig. 2b and Sec. III-A. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Equation / experiment | The paper reports BERT-large with 512-token inputs has 8× parameter reduction and 5.7× FLOP reduction after D2S; the decomposition is \(M = P \cdot L \cdot P \cdot R \cdot P\). ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | The paper applies D2S to parameterized matmuls only; activation-only attention matmuls remain untransformed. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| DenseMap improves memory footprint and array utilization. | Fig. 6 and Sec. IV-A. | Experiment | DenseMap is reported to require 87% fewer CIM arrays than Linear and more than 73% fewer than SparseMap; its average utilization reaches 78.8%, roughly 3× SparseMap. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Evaluated for three transformer models in the simulator; residual underutilization is attributed to mismatch between Monarch block and CIM array dimensions. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| SparseMap and DenseMap reduce latency and energy over dense CIM baseline. | Fig. 7 and Sec. IV-B. | Experiment | SparseMap improves latency by 1.59× over Linear; DenseMap reduces latency by 1.73× over Linear and energy by 1.74×. DenseMap uses lower-resolution ADCs, reported as 3b versus 5b for SparseMap and 8b for Linear. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Simulator-backed result for parameterized matmuls in BERT-large, BART-large, and GPT-2-Medium. GPU comparison is used as a reference point, but the central evidence is relative to Linear CIM. |
| ADC/DAC design-space variation changes the best mapping choice. | Fig. 8 and Sec. IV-C. | Experiment / cost-model dependency | The paper varies ADCs per array from 4 to 32 and uses the Accelergy ADC plugin to obtain parameter values. DenseMap benefits when ADC sharing is high, while SparseMap becomes best at 32 ADCs per array. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Demonstrated as sensitivity analysis for BERT; broader converter/accuracy calibration would require additional artifact detail. |
| The mapping and scheduling strategies are CIM-technology agnostic. | Sec. IV experimental setup. | Paper-only claim / simulator-backed evaluation | The evaluated simulator uses IBM PCM parameters, while the authors state the strategies should generalize to other CIM technologies. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | The checked evidence is PCM-oriented simulation; technology transfer is a plausible mapping-level argument rather than a multi-technology artifact demonstration. |

## 4. Stack anatomy

```text
Input / frontend:
  Pre-trained dense transformer model, or an already Monarch-sparse model. Object type: model graph with parameterized matmuls. Public schema: Unknown / not found in checked sources.

Middle representation:
  Monarch-structured matrix M with block-diagonal factors L and R plus fixed permutation P. Object type: structured matrix/layout state, not a named IR. Serialization: Unknown / not found in checked sources.

Mapping or scheduling state:
  SparseMap or DenseMap placement of L/R blocks onto m x m CIM arrays; diagonal indices iL/iR; shifts; activation timestamps t0...t3; generated addresses/control commands. Object type: mapping state plus temporal schedule. Inspectability: paper figures and prose; public serialized schedule not found.

Hardware abstraction:
  Analog CIM crossbar arrays, ADC/DAC sharing and precision, DPUs for auxiliary operations, MHA units, communication and layer operation costs. Object type: simulator hardware config/cost table. Partial documentation through paper Table I and public simulator dependency.

Backend / simulator / codegen:
  Existing open-source 3D AIMC simulator from IBM plus Accelergy ADC plugin for converter parameters. Object type: simulator graph/config plus latency/energy model. Paper-specific adapter: Unknown / not found in checked sources.

Output artifact:
  Latency, energy, CIM-array count, utilization, ADC/DAC sensitivity plots. Object type: evaluation results. Figure scripts/raw data: Unknown / not found in checked sources.

Evaluation loop:
  Compare Linear, SparseMap, DenseMap over BERT-large, BART-large, GPT-2-Medium; vary ADCs per array and ADC precision. Object type: simulator experiment loop. Reproducibility harness: Unknown / not found in checked sources.
```

The paper’s Fig. 2 establishes the D2S → mapper → scheduler → CIM-simulator flow, while Sec. IV identifies the simulator as an open-source AIMC simulator with configurable architectural parameters and execution flows. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the Monarch factors \(L,R\), the folded permutation structure, block-to-array placement, diagonal indices, rotation/shift assignments, row/column activation masks per timestamp, ADC-sharing configuration, and simulator cost table. The paper foregrounds mapping and scheduling as methods, while the reusable semantics are most visible in Fig. 4/Fig. 5’s packed crossbar layout and Sec. III-C’s mapping-aware activation sequence. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 — Mapping / scheduling / DSE framework.**  
The paper owns the slice between structured sparse transformer weights and CIM execution: it maps block-diagonal factors to crossbars, chooses capacity-versus-latency layouts, and schedules row/column activations under ADC-sharing constraints. Its input is a dense or Monarch-sparse transformer parameterized matmul; its output is a simulator-ready execution plan summarized through latency, energy, memory footprint, utilization, and converter sensitivity. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**Secondary: A5 — Narrow end-to-end co-design.**  
The system is end-to-end for one structured-sparsity family: dense-to-sparse Monarch transformation, mapping, scheduling, and simulation. The demonstrated scope is narrow and useful: stationary parameterized matmuls in transformer inference on analog CIM arrays. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**Secondary dependency: A2 — Simulator & cost model.**  
The evaluation depends on a pre-existing open-source simulator from the IBM 3D AIMC LLM work and an Accelergy ADC plugin for converter parameter extraction. The paper uses these as backend/cost infrastructure rather than contributing a standalone simulator. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**Adjacent but not primary: A4 — Explicit IR / dialect / ISA compiler stack.**  
The scheduler is said to issue CIM commands, but the checked sources do not expose a public ISA, dialect, instruction schema, or serialized IR. The reusable compiler object is therefore clearest as mapping/scheduling state rather than an explicit compiler IR. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 5.2 Axis B — middle-layer style

**B4 — Hardware-resource IR.**  
The named middle representation is a placement of block-diagonal matrix factors onto \(m \times m\) crossbars. Decisions made there include array partitioning, zero padding, dense packing, diagonal-index assignment, and whether to optimize for latency or capacity. The decisions that remain embedded are the concrete command format, simulator adapter, and emitted schedule representation. No single public artifact was found that upstream passes could read, verify, and rewrite.

**B1 — Config-as-IR.**  
Hardware behavior is partly parameterized through array dimensions, PCM MVM latency/energy, communication cost, layer costs, ADC count, ADC precision, and ADC/DAC parameter extraction. Table I gives the paper-level configuration, while the reused IBM simulator repository exposes an `AcceleratorConfig`, mapping strategy API, trace generation, and `schedule_execution` workflow. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**B3-like — Tensor schedule / temporal activation state.**  
The scheduler is not a general loop IR, but it has a schedule-like object: row/column activation subsets across timestamps, with intra-array sequentiality and inter-array parallelism. This is especially relevant for an IR corpus because the legal schedule depends on memory layout correctness, not simply on tensor loop order. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**B6 — Accuracy / nonideality modeling, limited role.**  
The paper varies ADC/DAC precision and uses energy/latency models, but it does not foreground analog nonideality propagation as a compiler-level accuracy object. Precision is a cost/performance parameter rather than a typed value property in the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class** | The mapping problem is explicitly formulated over \(m \times m\) CIM arrays; array count and utilization are central metrics. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Bit-slicing / bit significance | **Implicit / parameter** | Inputs are described as DAC-converted and typically bit-streamed; ADC resolution is varied, but bit significance is not exposed as a named IR object. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| ADC/DAC precision or sensing | **Parameter / costed** | ADC sharing and resolution are key to the mapping argument; DenseMap is evaluated with 3b ADCs versus 5b/8b alternatives, and ADC counts are swept from 4 to 32 per array. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Analog-to-digital or domain transition | **Costed / implicit** | The CIM dataflow includes DAC conversion, analog multiplication/summation, ADC conversion, and digital shift-and-add accumulation. The paper costs converter choices through simulator/plugin parameters. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Peripheral circuits as path nodes | **Costed / parameter** | ADCs, DACs, DPUs, MHA units, communication, LayerNorm, and nonlinear/add operations appear in the simulator abstraction and Table I. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Partial-sum accumulation path | **Implicit / costed** | Arrays produce partial results that are subsequently combined; analog CIM background includes shift-and-add output accumulation. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Reconstruction / shift-add tree | **Implicit** | Shift-and-add is named as part of generic analog CIM output accumulation, but no reusable reconstruction-tree abstraction is exposed. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Runtime state, masks, KV cache, batching, sparsity | **Sparsity first-class; other runtime state mostly implicit** | Block-diagonal sparsity, packed diagonals, and activation masks are central. The evaluated focus is parameterized matmuls; activation-only attention matmuls remain untransformed. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |
| Value trajectory / flow path | **Approximated / implicit** | The closest trajectory object is the mapped sequence of input vector → selected rows/columns → ADC-shared outputs → partial-result combination, with rotation/shift handling across \(L,R\). ([arXiv](https://arxiv.org/pdf/2510.11192v1)) |

### 5.4 Axis D — rewrite object

The compiler-like transformations are:

- dense parameterized matmul \(X \cdot W\) → Monarch structured matmul \(X \cdot M\);
- \(M = P \cdot L \cdot P \cdot R \cdot P\) → folded form \(M = (P L P) \cdot P \cdot (P R P)\);
- block-diagonal \(L,R\) → array partitions or densely packed crossbar layouts;
- diagonal indices \(i_L,i_R\) → rotation-canceling assignments where \(i_R = -i_L \bmod b\);
- full-array activation → timestamped row/column activation subsets for DenseMap;
- ADC/DAC converter precision/count → simulator cost parameters. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

The legal equivalences are algebraic and layout-driven: Monarch approximation replaces dense weights; outer permutations can be folded into \(L,R\); rotations introduced by packed diagonal placement can be cancelled by paired \(R\)-stage placement; and zero-padded blocks preserve correctness under SparseMap. The information that must be preserved across lowering includes source operator identity, \(L/R\) stage order, fixed permutation \(P\), block size \(b\), array dimension \(m\), diagonal offset, activation timestamp, partial-output destination, and ADC precision/sharing configuration. The representation is especially well suited to structured block-diagonal placement and mapping-aware temporal scheduling; expressing cross-operator partial-sum retiming or alternative analog/digital conversion points would likely require an additional trajectory abstraction for value identity, domain, precision stage, and reconstruction path.

## 6. Technical mechanism reading

### 6.1 Dense-to-sparse transformation target

The paper relies on Monarch matrices as the structured sparsity family. In the described form, a dense matrix \(W\) is approximated by a Monarch-structured matrix \(M\), minimizing the Frobenius norm \(\lVert W-M\rVert_F\), with factor matrices obtained through reshaping and rank-1 SVD. The concrete decomposition used for the mapping discussion is:

\[
M = P \cdot L \cdot P \cdot R \cdot P
\]

where \(L\) and \(R\) are block-diagonal matrices and \(P\) is a fixed permutation. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

The transformation is applied to parameterized matmuls in MHA and FFN blocks, such as projection and feed-forward weights. Non-parameterized activation-only attention matmuls are kept outside this transformation. This distinction is important for compiler classification: the stationary weight matrix is the rewrite object, not the whole attention operator graph. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 6.2 Mapping formulation

The mapping problem is stated over a model with \(N\) layers, \(p\) parameterized matrix multiplications per layer, CIM arrays of size \(m \times m\), and Monarch block size \(b=\sqrt{n}\). The placement problem reduces to placing \(N \cdot p\) Monarch matrices onto the available CIM arrays. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**SparseMap / latency-optimized mapping** partitions \(L,R\) according to array dimension \(m\), assigns one or more blocks to each array, and uses zero padding for unused cells. The paper gives the effective utilization as \((b/m)\times100\%\); for \(n=1024\), \(m=256\), and \(b=32\), utilization is 12.5%. This mapping preserves parallelism but consumes more arrays. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

**DenseMap / capacity-optimized mapping** packs multiple block diagonals into a single array. The paper states that when \(m\) is a multiple of \(b\), utilization can approach 100%, and Fig. 4b illustrates four block diagonals packed into \(L\) and \(R\) arrays. This improves memory footprint and ADC utilization, but it changes the legal activation schedule because each column can hold data from multiple block-diagonal matrices. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 6.3 Rotation, shifting, and permutation folding

Dense packing introduces an output rotation: a block diagonal at index \(i\) produces output rotated by \(i\) positions. The paper exploits the two-stage \(L\) then \(R\) Monarch structure by assigning \(R\)-stage diagonal indices so that:

\[
i_R = -i_L \bmod b
\]

This neutralizes the rotation introduced by \(L\), with special handling for self-inverse indices \(0\) and \(b/2\). ([arXiv](https://arxiv.org/pdf/2510.11192v1))

The paper also folds outer permutations into matrix structure:

\[
M = (P L P) \cdot P \cdot (P R P)
\]

This reduces the explicit permutation operations from three to one and is performed offline before mapping \(L,R\) to CIM arrays. For a compiler/IR reader, this is the most explicit algebraic rewrite in the paper. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 6.4 Mapping-aware scheduling

SparseMap can activate all rows and columns in parallel because its padded layout avoids column conflicts. DenseMap needs a temporal schedule: activating all rows/columns would mix values from different packed diagonals. The scheduler therefore activates row/column subsets over multiple timestamps; the paper’s example uses \(t_0,t_1,t_2,t_3\) to complete one diagonal, then repeats for remaining diagonals. The scheduler is described as generating memory addresses and control commands, while all arrays still operate in parallel across the accelerator. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

### 6.5 Cost model and simulator assumptions

The evaluation uses an open-source simulator from the IBM 3D AIMC LLM work. The paper says this simulator models 2D/3D analog in-memory computing accelerators with configurable architectural parameters, weight-stationary CIM arrays for MVMs, DPUs for auxiliary operations, MHA units, data movement, scheduling cost, latency, and energy. The reported baseline technology is IBM PCM, with Table I listing MVM, ADC, communication, LayerNorm, ReLU, GeLU, and add costs. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

The public IBM simulator repository exposes a Python package, tests, an `AcceleratorConfig`, a mapper API, trace generation, and `schedule_execution`, under an MIT license. This confirms the simulator dependency is real and reusable, but it is not a paper-specific release of the SparseMap/DenseMap framework. ([GitHub](https://github.com/IBM/3D-CiM-LLM-Inference-Simulator))

For ADC/DAC exploration, the paper uses the Accelergy ADC plugin. The plugin repository states that it estimates ADC area/energy for analog and mixed-signal accelerator design-space exploration, supports parameters such as ADC resolution, technology, number of ADCs, and throughput, and is MIT-licensed. It also carries a deprecation notice pointing to a newer `hwcomponents-adc` repository. ([GitHub](https://github.com/Accelergy-Project/accelergy-adc-plug-in))

### 6.6 Workload assumptions

The evaluated workloads are parameterized matmuls in BERT-large, BART-large, and GPT-2-Medium. The paper uses context length 512 for BERT and 1024 for BART/GPT-2. It focuses on parameterized matmuls because Monarch factorization targets stationary weights and those matmuls constitute over 80% of FLOPs in the paper’s setup. ([arXiv](https://arxiv.org/pdf/2510.11192v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Packed diagonal index is the hidden layout type

- **Observation:** DenseMap’s correctness depends on a diagonal index attached to each packed block diagonal. That index determines output rotation, legal pairing between \(L\) and \(R\), and row/column activation timing. ([arXiv](https://arxiv.org/pdf/2510.11192v1))  
- **Why it matters for CIM compiler/IR work:** A generic sparse tensor layout is not enough here; the compiler needs a layout type carrying modular rotation semantics.  
- **Reusable lesson:** A future IR could attach `diagonal_index`, `rotation_offset`, and `stage_pair` fields to packed block-sparse tiles.

### Insight 2 — Scheduling legality is layout-dependent, not just resource-dependent

- **Observation:** DenseMap changes the schedule legality: full-array activation is correct for SparseMap but incorrect for densely packed arrays because a column can store multiple logical diagonals. ([arXiv](https://arxiv.org/pdf/2510.11192v1))  
- **Why it matters for CIM compiler/IR work:** CIM schedulers need access to memory layout metadata, not merely tensor shape and array capacity.  
- **Reusable lesson:** Treat activation masks and timestamped row/column selections as verifiable schedule objects derived from placement.

### Insight 3 — Permutation folding is a compiler rewrite, not a hardware trick

- **Observation:** The paper’s \(M = (P L P) \cdot P \cdot (P R P)\) rewrite moves two permutation operations into the matrix factors before mapping. ([arXiv](https://arxiv.org/pdf/2510.11192v1))  
- **Why it matters for CIM compiler/IR work:** This is a clean example of an algebraic rewrite whose payoff is a simpler backend contract.  
- **Reusable lesson:** CIM IRs should allow operator-level algebraic rewrites that preserve layout-aware semantics, not only backend tiling.

### Insight 4 — ADC sharing acts like a scheduling resource

- **Observation:** DenseMap’s intra-array sequentiality becomes beneficial when ADC sharing is high, while SparseMap becomes preferable when more ADCs are available. ([arXiv](https://arxiv.org/pdf/2510.11192v1))  
- **Why it matters for CIM compiler/IR work:** ADC count and precision are not only hardware parameters; they change mapping choice and schedule ranking.  
- **Reusable lesson:** Backend cost models should expose converter-sharing degree and precision as first-class schedule parameters.

### Insight 5 — The simulator boundary reveals the backend contract

- **Observation:** The paper’s backend evidence is strongest where it meets the simulator: array counts, utilization, ADC precision/count, energy, latency, communication, and auxiliary operation costs. ([arXiv](https://arxiv.org/pdf/2510.11192v1))  
- **Why it matters for CIM compiler/IR work:** The true integration boundary is the mapping/schedule-to-simulator adapter, even though the adapter is not publicly specified.  
- **Reusable lesson:** A future stack could standardize a simulator input schema containing array layout, row/column activation schedule, converter settings, and source-op provenance.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** None found for a paper-specific implementation, benchmark package, mapper, scheduler, scripts, or reproduction harness.
- **Last checked date:** 2026-05-15.
- **Checked sources:** arXiv paper page, arXiv PDF/HTML, title/code/GitHub searches, author GitHub surface search, and publication pages. The arXiv page exposes PDF/HTML/TeX and generic code-data-media discovery widgets, but no paper-specific code link; the cfaed publication page says no downloads are available. ([arXiv](https://arxiv.org/abs/2510.11192))
- **Paper license:** arXiv links to CC BY 4.0 for the paper. ([arXiv](https://arxiv.org/abs/2510.11192))
- **Related public dependencies:** IBM’s 3D-CiM LLM Inference Simulator is public, MIT-licensed, and includes a README workflow; Accelergy ADC plugin is public and MIT-licensed, with a deprecation notice pointing to a newer ADC component repository. ([GitHub](https://github.com/IBM/3D-CiM-LLM-Inference-Simulator))
- **What the artifact appears to omit:** No paper-specific mapper/scheduler source, D2S implementation, simulator adapter, experiment configs, generated schedules, raw figure data, or figure scripts were found in checked public sources.
- **Minimal command/workflow:** No paper-specific command found. The reused IBM simulator documents `pip install -e .`, `python -m pytest -v tests/`, mapper construction, trace generation, and `schedule_execution`; the Accelergy plugin documents cloning and `pip install .`. ([GitHub](https://github.com/IBM/3D-CiM-LLM-Inference-Simulator))
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in checked sources. The simulator and ADC plugin are reusable dependencies, but the SparseMap/DenseMap experiment harness and figure-generation path were not found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper identifies dense transformer models and parameterized matmuls, but no public parser/schema was found. |
| Intermediate representation serialized | Unknown | Monarch \(L,R,P\) structure is described; no serialized IR file or schema found. |
| Mapping decisions inspectable | Partial | SparseMap/DenseMap and diagonal placement are inspectable in figures/prose; no emitted layout dump found. |
| Schedule inspectable | Partial | Timestamped activation pattern is shown conceptually; no schedule trace format found. |
| Hardware config explicit | Partial | Table I gives major latency/energy parameters; full simulator config for experiments not found. |
| Precision / bit-slice assumptions explicit | Partial | ADC precisions and ADC counts are discussed; bit-slice/value type propagation is not exposed. |
| Cost model inspectable | Partial | Uses IBM simulator and Accelergy ADC plugin; exact paper-specific parameter files not found. |
| Simulator backend documented | Partial | The reused IBM simulator has public README examples; paper-specific integration remains unclear. |
| Generated code / instruction stream inspectable | Unknown | Scheduler is said to issue control commands; public instruction stream not found. |
| Provenance from source op to backend action | Partial | Para-Matmul versus NonPara-Matmul distinction is clear; source-op-to-command trace not found. |
| Reproduction scripts available | Unknown | No paper-specific scripts found. |
| Calibration source documented | Partial | PCM/ADC sources and plugin are cited; full calibration path for all reported figures is not public in checked sources. |

### 8.3 Integration helper

- **As frontend:** Reuse is mostly conceptual. The paper’s input contract is dense transformer parameterized matmuls or pre-existing Monarch-sparse models; no reusable importer was found.
- **As IR inspiration:** The strongest IR ideas are block-diagonal factors \(L,R\), fixed permutation \(P\), packed diagonal index, rotation offset, \(L/R\) stage pairing, array occupancy, row/column activation masks, and ADC-sharing parameters.
- **As mapper/scheduler:** The SparseMap/DenseMap rules could be adapted into a compiler pass that emits a packed-crossbar layout plus timestamped activation schedule.
- **As cost model:** The reported metrics—array count, utilization, ADC resolution/count, MVM latency/energy, communication, and auxiliary digital costs—could become backend plugin fields.
- **As backend:** The most direct backend wrapper would target the public IBM 3D-SiM simulator, but it would require an adapter that injects SparseMap/DenseMap-specific placements and schedules.
- **As benchmark:** BERT-large, BART-large, and GPT-2-Medium parameterized matmuls are useful benchmark anchors; reproducing the exact figures would require experiment configs and scripts.
- **As validation source:** The paper is simulator-backed; it does not provide chip-in-loop, RTL, SPICE, or measured hardware validation for the proposed mapping itself.

**Integration effort estimate: High.**  
Integration would be most direct through a small schema that extracts `source_op → Monarch factors → packed array layout → activation schedule → simulator config`. The mapping rules are concrete enough to reimplement, and the simulator dependency is public, but the absence of a paper-specific artifact means a future stack would need to reconstruct the D2S, placement, schedule emission, and plotting workflow.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **ASADI** | Sparse attention acceleration using diagonal structure in CIM | ASADI targets sparse attention with dynamic data sparsity, while this paper targets stationary parameterized block-diagonal weights in attention and FFN layers. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Separate dynamic attention sparsity from stationary weight-layout mapping. |
| **TranCIM** | Sparse transformer acceleration and CIM scheduling | TranCIM is a full-digital bitline-transpose CIM sparse transformer accelerator; this paper focuses on analog CIM mapping of Monarch block-diagonal parameter matrices. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Similar scheduling questions can sit over very different CIM technology contracts. |
| **Adaptable Butterfly Accelerator** | Structured sparse matrices for attention/FFN acceleration | The butterfly accelerator targets digital ASIC execution, whereas this paper adapts Monarch/block-diagonal structure to analog CIM arrays and ADC-sharing constraints. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Structured matrix papers should be classified by their backend contract, not only by sparsity pattern. |
| **Monarch / Monarch Mixer** | Expressive structured matrix factorization | Monarch supplies the matrix family; this paper contributes CIM-specific mapping, rotation handling, permutation folding, and scheduling for that family. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Treat algorithmic structured-sparsity representations as frontend objects that need backend-aware layout semantics. |
| **IBM 3D-CiM LLM simulator / 3D-SiM** | LLM inference simulation on analog AIMC accelerators | The IBM simulator provides the backend/cost substrate; this paper uses it to evaluate a new mapping/scheduling scheme for Monarch-sparse matmuls. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Simulator interfaces often reveal the practical IR boundary for CIM stack papers. |
| **Accelergy ADC plugin** | ADC area/energy design-space modeling | The plugin provides converter estimates; this paper uses converter variation to show when DenseMap versus SparseMap is favorable. ([arXiv](https://arxiv.org/pdf/2510.11192v1)) | Converter precision/count should be treated as compiler-visible scheduling and cost-model metadata. |

## 10. Corpus-ready final takeaway

- The paper’s real contribution is a mapping and scheduling method for Monarch-style block-diagonal transformer weights on analog CIM crossbars.
- The strongest reusable stack layer is **mapping-aware scheduling**: packed crossbar layout, diagonal indices, rotation/shift handling, and timestamped row/column activation.
- The demonstrated scope is parameterized matmuls in BERT-large, BART-large, and GPT-2-Medium, evaluated in simulation using PCM-oriented AIMC parameters.
- First-class objects include \(L,R\) block-diagonal factors, CIM array dimension \(m\), block size \(b\), SparseMap/DenseMap strategy, diagonal index, ADC sharing, ADC precision, and activation schedule.
- The hidden IR is the combination of Monarch factor layout, packed array binding, diagonal-offset metadata, ADC configuration, and scheduler state.
- Artifact status: no public artifact found. Related public dependencies include IBM’s MIT-licensed 3D-SiM simulator and the MIT-licensed Accelergy ADC plugin.
- Integration into a future compiler stack would be most direct as a mapper/scheduler pass plus simulator adapter, rather than as a frontend or full IR.
- For value-trajectory IR research, the paper is most relevant as a case study where layout changes induce value rotations, converter scheduling, partial-result combination, and backend-visible path constraints.
