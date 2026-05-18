# CIM-MXU — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with **A2 simulator & cost model** and **A3 mapping / DSE** as secondary | The paper builds a TPUv4i-like architecture model, replaces conventional MXUs with CIM-MXUs, maps generative-model kernels onto the modeled system, and performs architecture exploration over CIM-MXU count and array dimension. The owned slice is strongest from CIM-MXU microarchitecture through TPU-level simulation, rather than a reusable compiler IR. ([arXiv](https://arxiv.org/html/2503.00461v1)) |
| Middle-layer style, Axis B | **B1 config-as-IR**, **B4 hardware-resource IR**, **B3 loop / tensor-schedule IR**, limited **B2 graph-as-IR** | The clearest middle objects are architecture parameters, CIM-core grid dimensions, memory hierarchy, model-layer shapes, and tiling variables such as `LtileM`, `DtileK`, and `DtileN`. The paper refers to a computational graph and mapping engine, but no serialized graph IR or dialect is exposed. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| First-class CIM objects, Axis C | CIM-MXU, CIM core grid, SRAM-CIM core, bank/sub-array, weight I/O, bit-serial input broadcast, shift-accumulator, PSUM buffer, pre/post-processing units, CMEM/VMEM/HBM hierarchy | The paper names these in the architecture and CIM-MXU design, especially Fig. 3–5 and Sec. III-B/C. These are first-class as hardware/modeling objects, not as compiler-level typed values. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Rewrite object, Axis D | **Hardware mapping**, **tiling**, **scheduling options**, **architecture configuration**, **numeric mode** | The tool performs tiling and scheduling of operators onto CIM-based TPU resources, prunes a large mapping space, explores performance-optimal mappings, and sweeps CIM-MXU count/array dimension. Numeric support is described for BF16 and INT8, with INT8 used in the model inference experiments. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Best corpus tags | `digital-CIM`, `SRAM-CIM`, `CIM-MXU`, `TPU-modeling`, `systolic-array`, `architecture-DSE`, `mapping-engine`, `LLM-inference`, `DiT-inference`, `GEMM-GEMV` | Tags reflect the demonstrated architecture-modeling and workload-evaluation scope. |
| Closest comparison baselines | TPUv4i, digital 128×128 MXU / Gemmini, LLMCompass, SCALE-Sim, Timeloop, CimLoop / MNSIM 2.0 | TPUv4i is the architectural baseline; Gemmini/SCALE-Sim are used for digital systolic comparison; LLMCompass and Timeloop shape the modeling/mapping context; CimLoop and MNSIM 2.0 are nearby CIM modeling tools. ([arXiv](https://arxiv.org/pdf/2503.00461)) |

## 2. One-paragraph public summary

**CIM-MXU** studies how a digital SRAM compute-in-memory matrix unit could replace the conventional systolic MXU inside a TPUv4i-like inference accelerator. Its main contribution is a hardware/software co-design and modeling study: a CIM-MXU microarchitecture built from a systolic grid of CIM cores, a TPU-level architecture model with VMEM/CMEM/HBM-style hierarchy, a mapping engine for Transformer-layer operators, and architecture exploration over CIM-MXU array size and count. The demonstrated workloads are representative generative-model inference kernels, especially GPT-3-30B Transformer-layer evaluation and DiT-XL/2 block evaluation, with INT8 experiments and BF16 support described at the microarchitecture level. For CIM compiler/IR research, the paper is most useful as a hardware-resource and cost-model case study: it shows what a backend would need to know about CIM-core grids, weight-update paths, tiling, memory hierarchy, and precision modes, while the reusable compiler boundary is clearest at the mapping/configuration state rather than at an explicit IR or instruction stream. ([arXiv](https://arxiv.org/pdf/2503.00461))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “We establish an architecture model and simulator to evaluate design benefits of CIM-based TPUs.” | Abstract / Introduction contributions | Paper-only + experiment | A TPUv4i-like model is specified with TensorCore, CIM-MXUs, VPU, VMEM, CMEM, main memory, ICI links, and configurable CIM-MXU parameters. ([arXiv](https://arxiv.org/html/2503.00461v1)) | The paper-level evidence supports the model structure and reported simulation results; artifact-level confirmation would require public simulator code, schemas, or scripts. |
| “CIM-MXU replaces conventional MXU in TPUs to accelerate GEMM/GEMV.” | Sec. III-A/B, Fig. 3–4 | Hardware model + experiment | The paper defines a CIM-MXU as a 16×8 grid of CIM cores, each performing 128 MACs per cycle, with output-stationary systolic propagation and weight I/O for interleaved read/write updates. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Demonstrated as architecture/modeling and post-P&R comparison, not as a public RTL/backend interface. |
| “CIM-MXU supports BF16 and INT8 operations like TPUv4i MXU.” | Sec. III-B | Paper-only hardware description | BF16 mode loads mantissa bits into CIM macros and uses pre-processing for exponent alignment/mantissa shifting plus post-processing for shift-accumulation/rounding; INT mode bypasses pre-processing. ([arXiv](https://arxiv.org/pdf/2503.00461)) | The functional path is described, but no public bit-accurate implementation, type system, or generated tests were found. |
| “The mapping engine performs tiling and scheduling of operators onto CIM-based TPU.” | Sec. III-C, Fig. 5 | Paper-only algorithm description | The paper describes tiling `[L,D]×[D,D]` into `[LtileM,DtileK]×[DtileK,DtileN]`, further partitioning tensors into VMEM, pruning the mapspace with heuristics, and using double buffering and memory coalescing. ([arXiv](https://arxiv.org/pdf/2503.00461)) | The reusable boundary is clearest as mapping state and hardware configuration; no serialized mapping trace or pass pipeline is exposed. |
| “CIM-MXU improves energy and area efficiency versus digital MXU.” | Sec. IV-A, Table II | Experiment | A Gemmini-generated 128×128 digital systolic array and the CIM-MXU are physically implemented in the same TSMC 22 nm technology; Table II reports 7.26 TOPS/W and 1.31 TOPS/mm² for CIM-MXU, 9.43× energy and 2.02× area efficiency improvement at equal MACs/cycle. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Demonstrated for the standalone MXU comparison under the paper’s implementation assumptions; public physical-design artifacts were not found. |
| “CIM benefits generative-model inference differently for LLM and DiT workloads.” | Sec. IV-B, Fig. 6 | Experiment | The paper evaluates GPT-3-30B and DiT-XL/2 configurations, batch size 8, INT8 precision, GPT-3 layer inference, and one DiT-XL/2 block. It reports strong energy reduction for LLM prefilling, 29.9% latency reduction for LLM decoding, and 6.67% latency / 10.4× energy reduction for DiT block evaluation. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Demonstrated through simulator-backed experiments over selected representative kernels rather than full application execution on a deployed TPU. |
| “Architecture choices can be optimized for LLMs and DiTs.” | Sec. V-A, Table IV, Fig. 7 | Experiment / DSE | The design space includes CIM-MXU array dimensions 8×8, 16×8, 16×16 and CIM-MXU counts 2, 4, 8. The paper selects Design A for LLM inference and Design B for DiT inference based on latency/energy trade-offs. ([arXiv](https://arxiv.org/pdf/2503.00461)) | The DSE is evidenced at the paper level; the search procedure is described but not available as a reusable public tool. |
| “Benefits scale to multi-device TPU inference.” | Sec. V-B, Fig. 8 | Experiment | The evaluation scales to 1, 2, and 4 TPUs, with up to 4-way pipeline parallelism and ring topology; Design A reports average 28% LLM speedup and 24.2× MXU energy reduction, while Design B reports 33% throughput improvement and 6.34× energy reduction. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Demonstrated in the simulator for modeled multi-TPU settings; runtime software, collective scheduling traces, or hardware measurements are not exposed. |

## 4. Stack anatomy

```text
Input / frontend:
Computational graph and model specification for Transformer-style layers. The paper names QKV generation, projection, FFN, attention, Softmax, LayerNorm, GeLU, GPT-3-30B, and DiT-XL/2 block shapes. This is graph/operator information in prose and figures; no public parser, schema, or serialized graph IR was found.

Middle representation:
A combination of model-layer shape metadata, hardware configuration, and tiling variables. The clearest named middle objects are [L,D]×[D,D], LtileM, DtileK, DtileN, VMEM/CMEM tiling, CIM-MXU count, CIM-core array dimension, and TPU memory/bandwidth parameters. It is inspectable in paper figures/tables, but not documented as a reusable artifact.

Mapping or scheduling state:
The “model mapping engine” performs operator tiling, scheduling, mapspace pruning, performance-optimal mapping exploration, double buffering, and memory coalescing. This is a mapping/search state, not an explicit compiler IR. It is described but not serialized in the checked public sources.

Hardware abstraction:
TPUv4i-like TensorCore with CIM-MXUs, VPU, VMEM, CMEM, OCI, ICI links, HBM/main memory, plus CIM-MXU as a systolic grid of CIM cores. Hardware parameters are explicit in Table I and Table IV; CIM-core internals are visible in Fig. 4 as SRAM bitcells, local readout/compute circuit, adder tree, shift-accumulator, PSUM buffer, and weight I/O.

Backend / simulator / codegen:
The paper reports a CIM-based TPU simulator/model, uses SCALE-Sim for digital systolic-array baseline evaluation, and uses Gemmini plus Cadence Genus/Innovus for the digital MXU physical-design comparison. No generated instruction stream, codegen backend, or public simulator artifact was found.

Output artifact:
Reported latency, energy, area-efficiency, and throughput results; optimized architecture choices Design A and Design B; no public machine-readable output format located.

Evaluation loop:
Standalone MXU physical-design comparison, single-layer/single-block inference evaluation for GPT-3-30B and DiT-XL/2, architecture DSE over CIM-MXU count/array dimensions, and multi-TPU throughput simulation.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of model graph/operator classes, tensor shapes, tile sizes, memory-residency assumptions, CIM-MXU resource counts, array dimensions, precision mode, and simulator cost tables. The paper foregrounds architecture modeling and design-space exploration, while the reusable semantics are most visible in the mapping engine’s tiling/scheduling state and the hardware-configuration tables. ([arXiv](https://arxiv.org/pdf/2503.00461))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 narrow end-to-end co-design.**  
CIM-MXU spans from a hardware block proposal to model-level inference evaluation: it replaces the TPUv4i MXU with a digital SRAM CIM-MXU, preserves the VPU and memory hierarchy, maps representative Transformer operators, and reports latency/energy/area trade-offs. The input defining this slice is a computational graph plus hardware configuration; the output is simulated performance/energy and selected TPU architecture variants. ([arXiv](https://arxiv.org/pdf/2503.00461))

**Secondary: A2 simulator & cost model.**  
The paper’s strongest reusable layer is the architecture model/simulator and its costed comparison of CIM-MXU versus digital MXU. Evidence includes Table I architecture parameters, Table II post-P&R MXU comparison, Fig. 6 workload results, and Fig. 7 DSE results. ([arXiv](https://arxiv.org/pdf/2503.00461))

**Secondary: A3 mapping / scheduling / DSE framework.**  
The mapping engine performs tiling/scheduling, mapspace pruning, and performance-optimal mapping exploration. The architecture DSE sweeps array dimension and CIM-MXU count, then selects Design A and Design B for different workload regimes. ([arXiv](https://arxiv.org/pdf/2503.00461))

### 5.2 Axis B — middle-layer style

**B1 config-as-IR.**  
The architecture tables act as the most concrete interchange object: TPUv4i-like memory sizes/bandwidths, CIM-MXU dimensions, CIM-core dimensions, and DSE choices. Decisions made here include resource count, array geometry, memory hierarchy capacity, and bandwidth assumptions. Decisions embedded elsewhere include cost formulas, pruning heuristics, and exact scheduling order. There is no single public artifact that upstream passes could read, verify, and rewrite.

**B4 hardware-resource IR.**  
CIM-MXU is modeled as a resource hierarchy: TensorCore → CIM-MXU → CIM core → bank/sub-array/peripheral path. This style captures the hardware contract a backend would need: where weights enter, where inputs propagate, where partial sums accumulate, and which operators remain on VPU. ([arXiv](https://arxiv.org/pdf/2503.00461))

**B3 loop / tensor-schedule IR.**  
The mapping engine’s tile variables and memory levels behave like a schedule state: tensors are tiled into CMEM and VMEM before execution on CIM-MXUs or VPU. Scheduling choices include double buffering and memory coalescing. ([arXiv](https://arxiv.org/pdf/2503.00461))

**Limited B2 graph-as-IR.**  
The paper starts from a computational graph and model specification, but the graph is used as input to mapping rather than exposed as a typed, rewriteable graph IR. The operator categories are visible in Fig. 5–6 and include QKV generation, attention, projection, FFN, LayerNorm, GeLU, and Softmax. ([arXiv](https://arxiv.org/pdf/2503.00461))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware hierarchy** | CIM-MXU is a grid of CIM cores; Table I gives MXU and CIM-core dimensions; Fig. 4 exposes bank/sub-array-level structure. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Bit-slicing / bit significance | **Parameter / implicit** | The paper describes bit-serial input broadcast and BF16 mantissa/exponent handling, but bit significance is not represented as a compiler-visible type or IR field. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| ADC/DAC precision or sensing | **Not applicable** | The work focuses on digital SRAM CIM; no analog ADC/DAC path is part of the demonstrated abstraction. |
| Analog-to-digital or domain transition | **Not applicable / digital pre-post path** | The relevant transition is BF16 pre-processing into INT MAC-style CIM operation and post-processing shift/rounding, not analog sensing. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Peripheral circuits as path nodes | **Named / partly costed at macro level** | Fig. 4 names local readout/compute circuit, adder tree, shift-accumulator, PSUM buffer, input driver, and weight I/O; reported costs are aggregated at CIM-MXU level. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Partial-sum accumulation path | **First-class in microarchitecture, not rewriteable IR** | The design uses output-stationary dataflow, shift-accumulator, and PSUM buffer; the mapping engine does not expose partial-sum trajectory as a rewrite object. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Reconstruction / shift-add tree | **Hard-coded / implicit** | BF16 post-processing handles shift-and-accumulation and rounding; Fig. 4 includes adder tree and shift-accumulator. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Runtime state, masks, KV cache, batching, sparsity | **Parameter / workload assumption** | KV cache is described for LLM inference stages; batch size, token length, and output-token index are experiment parameters. Runtime state is not a first-class compiler object. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Value trajectory / flow path | **Approximated by dataflow and memory hierarchy** | The paper names input/weight propagation, VMEM/CMEM tiling, and CIM-core execution paths, but value identity across stages is not exposed as a typed trajectory object. ([arXiv](https://arxiv.org/pdf/2503.00461)) |

### 5.4 Axis D — rewrite object

The tool actually rewrites or selects **hardware mapping**, **tile structure**, **scheduling options**, **array binding**, **memory hierarchy residency**, **architecture configuration**, and **numeric mode**. The legal transformations demonstrated are matrix/operator tiling into CMEM and VMEM, mapping operators to CIM-MXU versus VPU, using double buffering and memory coalescing, pruning/exploring mappings, and sweeping CIM-MXU count and array dimensions. ([arXiv](https://arxiv.org/pdf/2503.00461))

The main equivalence exploited is algebraic preservation of GEMM/GEMV under tiling and scheduling: `[L,D]×[D,D]=[L,D]` is partitioned into tile products that fit the modeled SRAM hierarchy. The information that must be preserved across lowering includes tensor shape, operator type, tile dimensions, memory placement, precision mode, and whether the operator executes on CIM-MXU or VPU. The representation is especially well suited to architecture/resource exploration; expressing cross-operator bit-sliced partial sums, reconstruction fusion, or alternative peripheral routing would likely require an additional abstraction for value stage, accumulation identity, and hardware path annotations.

## 6. Technical mechanism reading

### CIM-MXU as a TPU MXU replacement

The paper models a TPUv4i-like inference accelerator and replaces the conventional 128×128 MAC systolic MXU with a CIM-MXU. The baseline TPU structure includes TensorCore, MXUs, VPU, VMEM, CMEM, OCI, ICI links, and main-memory interface; the CIM-based model keeps the VPU for non-matrix operators such as normalization and activation functions. Table I gives the modeled hierarchy: 16 MB VMEM, 128 MB CMEM, 8 GB main memory, 614 GB/s main-memory bandwidth, and 100 GB/s ICI link bandwidth. ([arXiv](https://arxiv.org/pdf/2503.00461))

The CIM-MXU itself is organized as a systolic grid of CIM cores. In the default Table I / Sec. III-B setting, the MXU dimension is 16×8 CIMs and each CIM core dimension is 128×256. The CIM-MXU uses output-stationary dataflow: a 32-bit input vector propagates along rows, weights propagate along columns via interleaved SRAM read/write, and each CIM core can perform read/write through dedicated weight I/O. This is important for compiler work because the backend contract is not simply “matrix multiply”; it includes timing and reuse constraints for input broadcast, weight update, and partial-sum accumulation. ([arXiv](https://arxiv.org/pdf/2503.00461))

### Precision and numeric path

The design supports BF16 and INT8 at the microarchitecture level. In BF16 mode, mantissa bits of the weight matrix are loaded into CIM macros; input activations are pre-processed through exponent alignment and mantissa shifting so that INT MACs can be used in the CIM macro; post-processing performs shift-and-accumulation and rounding. In INT mode, the pre-processing unit is bypassed and input activation is loaded directly into the CIM array. The model-inference experiments use INT8 precision. ([arXiv](https://arxiv.org/pdf/2503.00461))

### Mapping and scheduling mechanism

The mapping engine starts from a computational graph and hardware configuration. It tiles matrix operations so that subtiles fit in CMEM, then further partitions tensors to fit in VMEM before assigning work to CIM-MXUs or VPU. The paper explicitly gives a layer example: `[L,D]×[D,D]=[L,D]` is partitioned into `[LtileM,DtileK]×[DtileK,DtileN]`. It also describes mapspace pruning, performance-optimal mapping exploration, double buffering, and memory coalescing across memory levels. ([arXiv](https://arxiv.org/pdf/2503.00461))

### Cost/evaluation model

The paper’s cost evidence combines several levels. For standalone MXU comparison, the authors generate a 128×128 digital systolic array using Gemmini and physically implement it with Cadence Genus/Innovus; the CIM core layout is manually drawn and the CIM-MXU is implemented with RTL for physical design, using the same TSMC 22 nm technology for both. Table II reports equal MACs/cycle and improved CIM-MXU energy/area efficiency. ([arXiv](https://arxiv.org/pdf/2503.00461))

For workload evaluation, the paper models GEMM/GEMV plus vector-unit operators such as Softmax, LayerNorm, and GeLU. It uses SCALE-Sim for baseline systolic-array evaluation and describes Softmax and GeLU modeling choices. The evaluated model settings are GPT-3-30B and DiT-XL/2, batch size 8, INT8 precision, GPT-3 single Transformer layer, one DiT block at 512×512 resolution, prefilling input length 1024, and decoding at the 256th output token. ([arXiv](https://arxiv.org/pdf/2503.00461))

### DSE mechanism and workload-specific conclusions

The architecture exploration varies CIM-MXU array dimension among 8×8, 16×8, and 16×16 and CIM-MXU count among 2, 4, and 8. For LLM inference, the paper observes a memory-bound regime where increasing CIM-MXU resources has limited performance return; it selects Design A as four CIM-MXUs with 8×8 array dimension. For DiT inference, compute-bound behavior makes larger/more CIM-MXUs more useful; the paper selects Design B as eight CIM-MXUs with 16×8 array dimension. ([arXiv](https://arxiv.org/pdf/2503.00461))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — CIM-MXU is a backend contract, not just a faster matrix unit

- **Observation:** The paper’s CIM-MXU contract includes input broadcast, weight propagation, simultaneous compute/weight update, output-stationary accumulation, and BF16/INT8 mode behavior.
- **Why it matters for CIM compiler/IR work:** A compiler targeting this backend would need to schedule weight updates and input waves, not merely lower `matmul` to a generic accelerator call.
- **Reusable lesson:** A future IR could represent “matrix unit” as a resource with dataflow phases: load/update weights, broadcast inputs, accumulate partial sums, post-process numeric format, and write back.

### Insight 2 — The mapping engine is the hidden compiler boundary

- **Observation:** The paper describes computational graph input, tiling variables, mapspace pruning, and scheduling choices, but the reusable semantics are concentrated in the mapping engine rather than an explicit IR.
- **Why it matters for CIM compiler/IR work:** This suggests a practical extraction point: turn the paper’s mapping state into a serializable mapping IR that records tile sizes, memory levels, CIM/VPU binding, and overlap decisions.
- **Reusable lesson:** Config-plus-schedule state can be promoted into an auditable IR boundary even when the original work presents it as simulator internals.

### Insight 3 — GEMV-dominant decoding exposes a CIM-specific scheduling advantage

- **Observation:** LLM decoding has input token length one, reducing GEMM to GEMV-like operations; the paper attributes speedup to broadcasting the input activation vector to all output channels without traversing preceding MAC units in a conventional systolic array.
- **Why it matters for CIM compiler/IR work:** Operator classification should include not just `GEMM` versus `GEMV`, but arithmetic-intensity and input-reuse regime, because the same hardware block has different value depending on token stage.
- **Reusable lesson:** A compiler could attach stage-aware workload metadata such as `prefill`, `decode`, sequence length, and GEMV/GEMM regime to guide backend mapping.

### Insight 4 — Precision is parameterized, but not yet a type discipline

- **Observation:** BF16 support is implemented through mantissa loading, exponent alignment, shift/accumulation, and rounding; INT8 bypasses pre-processing.
- **Why it matters for CIM compiler/IR work:** This is close to a type-system problem: values change representation as they pass through pre-processing, CIM INT MAC, shift accumulation, and rounding.
- **Reusable lesson:** A future IR could expose numeric-stage fields such as `format=BF16`, `mantissa_resident=true`, `accumulation_format=INT`, and `rounding_stage=postprocess`.

### Insight 5 — Architecture DSE reveals workload-specific backend variants

- **Observation:** Design A and Design B are selected for different workload regimes, with Design A favoring LLM energy/latency trade-offs and Design B favoring DiT throughput.
- **Why it matters for CIM compiler/IR work:** The backend target may not be a single static architecture; a compiler may need to bind workloads to architecture variants or generate mappings parameterized by resource configuration.
- **Reusable lesson:** Corpus entries should record whether a paper’s “backend” is a fixed device, a hardware template, or a design-space family.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Artifact URL or identifier:** N/A.
- **License:** Unknown / not found for an artifact.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** N/A.
- **What the artifact appears to omit:** Public simulator code, mapping engine implementation, hardware configuration schemas, RTL, layout collateral, scripts for Table/Figure reproduction, and benchmark package were not found in the checked public sources.
- **Minimal command or workflow:** Unknown / not documented.
- **Whether paper figures appear reproducible from the artifact:** Unknown; no artifact was found.
- **Public paper metadata:** arXiv lists the work as submitted on 2025-03-01 and accepted to DATE 2025; authors are Zhantong Zhu, Hongou Li, Wenjie Ren, Meng Wu, Le Ye, Ru Huang, and Tianyu Jia. ([arXiv](https://arxiv.org/abs/2503.00461))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Model/operator classes and shapes are described, but no file format or parser is exposed. |
| Intermediate representation serialized | Unknown | No serialized IR, mapping file, or schema found. |
| Mapping decisions inspectable | Partial | Tiling variables and scheduling options are described in Sec. III-C; no trace output found. |
| Schedule inspectable | Partial | Double buffering and memory coalescing are named; detailed schedule dumps are not public. |
| Hardware config explicit | Yes | Table I and Table IV specify major TPU/CIM-MXU parameters. ([arXiv](https://arxiv.org/pdf/2503.00461)) |
| Precision / bit-slice assumptions explicit | Partial | BF16/INT8 modes and bit-serial input behavior are described; bit-level IR is not exposed. |
| Cost model inspectable | Partial | Methodology and results are reported; formulas and implementation are not public. |
| Simulator backend documented | Partial | Simulator role is described; SCALE-Sim/Gemmini/Cadence are named for components. |
| Generated code / instruction stream inspectable | N/A | The work is an architecture simulator/modeling study, not an ISA/codegen stack. |
| Provenance from source op to backend action | Partial | Operator breakdowns are shown for QKV, attention, projection, FFN, etc.; no per-op backend trace found. |
| Reproduction scripts available | Unknown | No public scripts found. |
| Calibration source documented | Partial | Post-P&R comparison in TSMC 22 nm is described; design collateral is not public. ([arXiv](https://arxiv.org/pdf/2503.00461)) |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The paper’s frontend is a computational graph/model specification, but no parser or workload schema is exposed.
- **As IR inspiration:** Stronger. The useful abstractions are CIM-MXU resource hierarchy, CIM/VPU operator binding, memory-level tiling, precision mode, and workload stage metadata.
- **As mapper/scheduler:** Medium conceptual reuse. The tiling, mapspace pruning, double-buffering, and coalescing structure could be adapted into a future mapping pass if reimplemented.
- **As cost model:** Strong paper-level inspiration. Latency/energy/area metrics, MXU-level post-P&R calibration, and TPU-level memory hierarchy assumptions could become backend cost-model plugins.
- **As backend:** Medium-to-high effort. Wrapping the simulator directly would require access to simulator internals or reconstruction from the paper.
- **As benchmark:** Useful. GPT-3-30B layer, DiT-XL/2 block, prefilling/decoding regimes, and multi-TPU settings provide corpus benchmark scenarios.
- **As validation source:** Partial. The standalone MXU physical-design comparison can calibrate rough energy/area expectations, but full validation would benefit from RTL/layout artifacts or a released simulator.

**Integration effort estimate:** **Medium to High.** Integration would be most direct through a small adapter that extracts model shapes, tile sizes, hardware parameters, and precision mode into a backend configuration. Because no public artifact was found, reproducing the mapping engine and simulator would require reimplementation from the paper’s descriptions and figures.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially its explicit naming of CIM-core grids, input vector propagation, weight I/O, PSUM buffer, shift-accumulator, BF16 pre/post-processing, and VMEM/CMEM/HBM movement. The closest approximation to trajectory semantics is the described dataflow: input activations broadcast bit-serially, weights propagate through CIM cores via interleaved SRAM read/write, partial sums accumulate in an output-stationary systolic structure, and BF16 values pass through pre/post-processing around INT MAC computation. ([arXiv](https://arxiv.org/pdf/2503.00461))

The paper names the path a value takes through CIM resources at the hardware-description level, but value identity is not preserved as a first-class compiler object across partial sums, reconstruction, reduction, and storage. Bit significance and precision stage appear as hardware behavior rather than type-like metadata. For digital SRAM-CIM, ADC retiming is not applicable; an analogous trajectory-level extension would focus on retiming or fusing pre-processing, shift-accumulation, rounding, partial-sum buffering, and downstream reductions.

A trajectory-level extension would likely attach fields such as `domain`, `precision_stage`, `bit_role`, `tile_residency`, `accumulation_stage`, `core_coordinate`, `buffer_location`, and `postprocess_required` to mapped tensor fragments. That extension would make it possible to express rewrites such as fusing reconstruction with downstream reduction, carrying partial sums across operator boundaries, changing reduction-tree structure, routing values through alternative peripheral paths, or co-optimizing data movement and numeric reconstruction.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **TPUv4i / TPU v4** | TPU architecture baseline, MXU-centric inference acceleration | CIM-MXU keeps the TPU-style system frame but replaces MXUs with digital SRAM CIM blocks. | Classify as TPU-level CIM co-design, not standalone CIM macro work. |
| **LLMCompass** | Hardware modeling for LLM inference | CIM-MXU borrows the idea of architecture templates/performance modeling but adds CIM-MXU resources and DiT evaluation. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Useful comparison for A2/A3 simulator/DSE papers. |
| **Timeloop** | DNN accelerator mapping and mapspace exploration | CIM-MXU uses similar heuristic mapspace pruning but does not expose a general mapping language or public mapping artifact. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Helps distinguish mapping methodology from explicit mapping IR. |
| **SCALE-Sim** | Systolic-array performance modeling | Used for baseline digital systolic-array evaluation, while CIM-MXU models CIM arrays as the replacement compute substrate. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Good baseline tag for digital MXU comparison. |
| **Gemmini** | Generator for digital systolic accelerators | Used to generate the 128×128 digital MXU baseline for physical implementation; CIM-MXU is not presented as a public generator. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Separates generator-backed baseline from paper-specific CIM design. |
| **CimLoop / MNSIM 2.0** | CIM modeling and simulation | CIM-MXU targets CIM as a TPU MXU replacement for high-performance generative inference; related simulators focus more broadly on CIM modeling, DNN mapping, cross-stack exploration, or accuracy modeling. ([arXiv](https://arxiv.org/pdf/2503.00461)) | Useful nearby A2 comparison; CIM-MXU’s distinguishing object is the TPU-level CIM-MXU resource. |

## 11. Corpus-ready final takeaway

- CIM-MXU is best classified as a **narrow end-to-end hardware/software co-design study** with strong **architecture modeling, cost modeling, mapping, and DSE** content.
- The strongest reusable stack layer is the **CIM-MXU + TPU-level hardware abstraction**: CIM-core grid, systolic dataflow, VMEM/CMEM/HBM hierarchy, and CIM/VPU operator split.
- The evidenced scope is **simulator-backed generative-model inference evaluation**, centered on GPT-3-30B Transformer-layer and DiT-XL/2 block experiments, plus multi-TPU modeled throughput.
- First-class objects include **CIM-MXU, CIM core, weight I/O, input broadcast, PSUM buffer, shift-accumulator, tile sizes, memory hierarchy, and precision mode**.
- The hidden IR is the **mapping/configuration state**: model graph + shape metadata + tile sizes + memory-level placement + CIM-MXU resource parameters + cost model.
- Artifact status: **no public artifact found**; reproducibility is paper-level unless simulator, RTL/layout, or scripts become available.
- Integration would be most useful as **IR inspiration, mapper/scheduler guidance, backend cost-model calibration, and benchmark definition**, rather than as a drop-in compiler component.
- For value-trajectory IR research, the paper provides concrete backend path vocabulary but would need added type-like metadata for value identity, bit role, accumulation stage, and reconstruction stage.

## 12. Suggested metadata entry

```yaml
paper: "CIM-MXU / Leveraging Compute-in-Memory for Efficient Generative Model Inference in TPUs"
year: 2025
venue: "DATE 2025 (accepted; arXiv:2503.00461)"
authors_or_group: "Zhantong Zhu, Hongou Li, Wenjie Ren, Meng Wu, Le Ye, Ru Huang, Tianyu Jia"
technology:
  - SRAM-CIM
  - digital-CIM
  - TPU-style accelerator
workloads:
  - GPT-3-30B Transformer layer
  - LLM prefilling
  - LLM decoding
  - DiT-XL/2 block
  - GEMM
  - GEMV
  - Softmax
  - LayerNorm
  - GeLU
axis_A:
  primary: A5_narrow_end_to_end_codesign
  secondary:
    - A2_simulator_cost_model
    - A3_mapping_scheduling_DSE
axis_B:
  - B1_config_as_IR
  - B4_hardware_resource_IR
  - B3_loop_tensor_schedule_IR
  - B2_graph_as_IR_limited
axis_C_first_class_objects:
  - CIM-MXU
  - CIM-core-grid
  - SRAM-CIM-core
  - bank_subarray_hierarchy
  - weight_IO
  - bit_serial_input_broadcast
  - output_stationary_dataflow
  - PSUM_buffer
  - shift_accumulator
  - BF16_prepost_processing
  - VMEM_CMEM_HBM_hierarchy
axis_D_rewrite_objects:
  - hardware_mapping
  - tensor_tiling
  - schedule_options
  - architecture_configuration
  - array_binding
  - memory_layout_or_residency
  - numeric_mode
artifact:
  status: no_public_artifact_found
  url: null
  license: unknown
  last_checked: 2026-05-15
integration_roles:
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - benchmark
  - validation_partial
reproducibility_level: low_to_medium
trajectory_IR_relevance: medium
notes:
  - "Strongest evidence is at CIM-MXU microarchitecture/modeling and TPU-level DSE."
  - "No explicit compiler IR, dialect, ISA, or instruction stream is exposed."
  - "The effective hidden IR is model shape plus tiling/scheduling state plus hardware configuration."
  - "Digital SRAM-CIM makes ADC/DAC trajectory objects not applicable, but BF16/INT8 pre/post-processing is relevant to numeric-stage typing."
```