# Hermes — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — narrow end-to-end co-design** | Hermes is explicitly one workload family and one hardware setting: LLM inference on one consumer GPU plus multiple NDP-DIMMs. This matches the taxonomy’s A5 family, where Hermes is listed as a narrow end-to-end co-design work. (CIM taxonomy.md) |
| Secondary stack role, Axis A | **A2 / A3 — simulator-backed mapping and scheduling layer** | The paper’s strongest reusable slice is the mapping/scheduling policy for hot/cold neurons, evaluated through measured RTX 4090 kernels, an in-house Ramulator 2.0-derived NDP-DIMM simulator, and RTL-synthesized NDP cores. ([arXiv](https://arxiv.org/html/2502.16963v1)) |
| Middle-layer style, Axis B | **B7 runtime-state abstraction; B1 config/search-as-IR; B5 command boundary** | Hermes makes runtime hot/cold placement, activation prediction, and DIMM remapping visible. The taxonomy explicitly identifies B7 as KV/cache/batching/hot-cold-placement/runtime-remapping style and lists Hermes in that family. (CIM taxonomy.md) |
| First-class CIM objects, Axis C | **Neuron placement, hot/cold status, neuron activity state, neuron correlation table, DIMM load, DIMM-link remapping, NDP-DIMM GEMV/activation unit, MAC/softmax command stream** | The paper defines a neuron as a row/column in a weight matrix and uses it as the unit for partitioning and remapping; the system has explicit scheduler, predictor, neuron mapper, instruction queue, and NDP-DIMM units. ([arXiv](https://arxiv.org/html/2502.16963v1)) |
| Rewrite object, Axis D | **Hardware mapping + runtime state + schedule** | The work rewrites where neuron weights reside and execute: initial ILP placement, online hot-neuron swapping into GPU memory, and window-based cold-neuron remapping across DIMMs. This fits the taxonomy’s “runtime state” and “choose-and-place” rewrite tier, where Hermes is named. (CIM taxonomy.md) |
| Best corpus tags | `DRAM-PIM`, `digital-NDP`, `LLM-inference`, `activation-sparsity`, `runtime-scheduler`, `hot-cold-placement`, `Ramulator`, `GPU-PIM-coexecution`, `NDP-DIMM`, `simulator-backed` | These tags reflect the demonstrated hardware/software boundary rather than generic CIM technology categories. |
| Closest comparison baselines | **PAPI, Ouroboros, HARMONI, UniNDP, PIMCOMP / PIMSIM-NN, CIMFlow** | PAPI and Ouroboros are close LLM-serving co-designs; HARMONI and UniNDP are close DRAM/NDP simulation stacks; PIMCOMP/PIMSIM-NN and CIMFlow are closer compiler/simulator stacks with explicit instruction or config outputs. (CIM stack library compact.md) (CIM stack library compact.md) |

## 2. One-paragraph public summary

Hermes, formally “Make LLM Inference Affordable to Everyone: Augmenting GPU Memory with NDP-DIMM,” is an HPCA 2025 hardware–software co-design for activation-sparse LLM inference on a consumer-grade GPU augmented by digital near-data-processing DIMMs. Its core contribution is not a general CIM compiler IR, but a specialized runtime mapping and scheduling layer: frequently active “hot” neurons are kept on the GPU, while less frequently active “cold” neurons remain in NDP-DIMMs, with an offline ILP initializer, a lightweight online predictor, and a window-based DIMM load-balancing scheduler. The paper demonstrates this design for OPT, LLaMA2, and Falcon-style models under ReLU-based activation sparsity, using an RTX 4090, eight modeled DDR4 NDP-DIMMs, measured GPU kernels, a modified Ramulator 2.0 simulator, and RTL-synthesized NDP cores. For CIM compiler/IR research, Hermes is most useful as a runtime-state and mapping case study: it names neuron activity, placement, and remapping as first-class scheduling objects, while the compiler-visible value trajectory remains implicit in the scheduler, commands, barriers, and simulator assumptions. ([arXiv](https://arxiv.org/abs/2502.16963?utm_source=chatgpt.com))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Hermes enables budget-friendly LLM inference by augmenting one consumer GPU with NDP-DIMMs. | Abstract, Section I, Section IV-A | Architecture description + experiment | The system model combines one RTX 4090, PCIe 4.0, and eight 32 GB DDR4 NDP-DIMMs; NDP-DIMMs handle cold-neuron and attention-side work while the GPU handles hot neurons and projection. ([arXiv](https://arxiv.org/html/2502.16963v1)) | Demonstrated through a modeled NDP-DIMM system with measured GPU kernels and simulated/synthesized NDP components, not through a deployed physical NDP-DIMM platform. |
| Activation sparsity divides weight parameters into hot and cold neurons. | Abstract, Section II-B, Section III-A | Observation + workload study | The paper reports roughly 20% “hot” neurons accounting for about 80% of computation, defines a neuron as a row/column in a weight matrix, and relies on ReLU-style sparsity for OPT and modified LLaMA/Falcon models. ([arXiv](https://arxiv.org/html/2502.16963v1)) | Demonstrated for the selected LLMs and datasets; reuse depends on preserving or inducing compatible activation sparsity. |
| Initial hot/cold placement can be solved as an offline ILP. | Section IV-B, Table I, Equations 1–7 | Equation / optimization formulation | The objective minimizes total inference latency over layers using the maximum of GPU time and slowest DIMM time; constraints bound GPU and DIMM memory use. PuLP is used, with about 110 seconds reported for the offline solve. ([arXiv](https://arxiv.org/html/2502.16963v1)) | The reusable boundary is clearest at the placement model; the paper does not publish a serialized IR or solver input artifact. |
| A lightweight predictor can guide online hot/cold adjustment. | Section IV-C, Figure 7, Figure 8 | Algorithmic rule + experiment | The predictor combines a 4-bit neuron state table, token-wise temporal locality, and a layer-wise correlation table; it uses `s1 + λ·s2 > T` with λ=6 and T=15, and reports 98% accuracy with less than 1 MB memory. ([arXiv](https://arxiv.org/pdf/2502.16963)) | Evidenced as paper-level algorithm and reported overhead; public code for the predictor was not found. |
| Window-based online scheduling balances load across NDP-DIMMs. | Section IV-D, Algorithm 1, Figure 8 | Algorithm + ablation | The scheduler groups five tokens per window, computes per-DIMM activated-neuron counts, pairs high-load and low-load DIMMs, and remaps highly activated cold neurons through DIMM-link. ([arXiv](https://arxiv.org/pdf/2502.16963)) | Demonstrated for the paper’s NDP-DIMM model and activation traces; generality to other NDP topologies would require a remapping/topology adapter. |
| Hermes achieves strong speedups over offloading baselines. | Section V-B, Figures 9–12 | Experiment | The paper compares against HuggingFace Accelerate, FlexGen, Deja Vu, Hermes-host, and Hermes-base; it reports large normalized gains, and the abstract reports LLaMA2-70B at 13.75 tokens/s and 75.24× average speedup over the state-of-the-art offloading baseline. ([arXiv](https://arxiv.org/abs/2502.16963?utm_source=chatgpt.com)) | Evaluated under fixed 128-token input/output lengths, batch sizes 1–16, selected models, and a simulator-backed NDP-DIMM implementation. |

## 4. Stack anatomy

```text
Input / frontend:
```

LLM model weights and activation traces for OPT, LLaMA2, and Falcon-style models; OPT uses native ReLU activation, while LLaMA2/Falcon use public SparseLLM ReLU-substituted models and additional ReLU before QKV generation. The frontend is a workload/evaluation setup rather than a reusable compiler importer; input representation is not presented as a serialized IR. ([arXiv](https://arxiv.org/html/2502.16963v1))

```text
Middle representation:
```

The named middle objects are neurons, hot/cold labels, neuron mapping, neuron state table, neuron correlation table, and neuron activity table. These are runtime tables and optimization states, not a single graph/tensor/MLIR-style IR. They are partially inspectable in the paper through tables, equations, and algorithms, but not documented as a reusable schema.

```text
Mapping or scheduling state:
```

Offline mapping uses binary placement variables indicating whether a neuron in a layer is placed on a processing unit; online mapping uses state thresholds for hot-neuron selection and a DIMM mapping matrix for cold-neuron remapping. Algorithm 1 exposes the cold-neuron scheduling rule over a five-token window. ([arXiv](https://arxiv.org/html/2502.16963v1))

```text
Hardware abstraction:
```

The hardware abstraction is a digital NDP-DIMM module with DDR4 memory, a center buffer, one NDP core per DIMM, 256 multipliers, reduction-tree-based accumulation, a 256 KB buffer, activation units, DIMM-link, and standard GPU/NDP cooperation over PCIe. It is concrete and parameterized in Table II, but presented as the paper’s target architecture rather than a replaceable hardware-resource IR. ([arXiv](https://arxiv.org/pdf/2502.16963))

```text
Backend / simulator / codegen:
```

GPU-side kernels are launched through CUDA APIs such as `cudaLaunchKernel`; NDP-DIMM computations are invoked through extra NDP commands such as MAC and softmax, described in relation to a PIM-SYCL/unified-memory programming model. Backend performance is evaluated with measured GPU kernels, a modified Ramulator 2.0 simulator, and RTL synthesis of the NDP core. ([arXiv](https://arxiv.org/pdf/2502.16963))

```text
Output artifact:
```

The paper’s output is an execution plan/state: which neurons execute on GPU, which remain on which DIMM, when hot neurons are copied into GPU memory, and how cold neurons are remapped across DIMMs. No public serialized plan format, instruction trace format, simulator input format, or code-generation artifact was found.

```text
Evaluation loop:
```

The loop is profiling → offline ILP placement → prompt/prefill on GPU with activity monitoring → online prediction and remapping during token generation → simulator-backed throughput, ablation, and sensitivity experiments over models, batch sizes, DIMM counts, GPUs, and NDP multiplier counts. ([arXiv](https://arxiv.org/html/2502.16963v1))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of offline profiling data, ILP placement variables, per-neuron activity/state tables, layer-wise correlation tables, hot/cold thresholds, DIMM mapping matrices, instruction-queue decisions, CUDA/NDP command launches, synchronization barriers, merge kernels, and Ramulator/NDP configuration. The paper foregrounds the system and scheduler, while the reusable semantics are most visible in the placement and runtime tables. This matches the taxonomy’s broader “hidden-IR” observation that CIM stack semantics often live across configs, search state, LUTs, and codegen/simulator assumptions rather than in a single auditable artifact. (CIM taxonomy.md)

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — narrow end-to-end co-design.** Hermes owns a full vertical slice for one target problem: activation-sparse LLM inference on an RTX 4090 plus NDP-DIMMs. Its input is a sparsity-enabled LLM workload and profiled activation behavior; its output is a heterogeneous runtime execution schedule over GPU and NDP-DIMMs. The taxonomy classifies Hermes in A5, the “one architecture × one workload family” family. (CIM taxonomy.md)

**Secondary: A3 — mapping / scheduling / DSE framework.** The strongest compiler-like contribution is the placement/scheduling mechanism: ILP placement, online predictor, hot-neuron swapping, and cold-neuron DIMM rebalancing. The mapping object is not a tensor loop nest or explicit IR; it is a per-neuron placement state.

**Secondary: A2 — simulator and cost model.** The evaluation stack contains a modified Ramulator 2.0 backend and RTL-synthesized NDP cores, making the simulator/cost-model layer part of the paper’s evidence. ([arXiv](https://arxiv.org/html/2502.16963v1))

### 5.2 Axis B — middle-layer style

**B7 runtime-state abstraction.**  
The named middle representation is a set of runtime tables: neuron state table, neuron correlation table, neuron activity table, and neuron mapping. Decisions made there include whether a neuron is hot, whether it should be copied into GPU memory, and how cold neurons should be redistributed across DIMMs. Decisions embedded elsewhere include kernel launch ordering, barrier placement, merge execution, PIM-SYCL command realization, and simulator timing assumptions. There is no single artifact that upstream passes could read, verify, and rewrite. The taxonomy’s B7 description directly names hot/cold placement, activation sparsity prediction, and runtime remapping, with Hermes as an example. (CIM taxonomy.md)

**B1 config/search-as-IR.**  
The offline ILP and evaluation setup use profiled frequencies, per-neuron memory sizes, device capacities, compute times, synchronization costs, and architecture parameters. These effectively act as a configuration-driven IR boundary. The paper provides equations and tables, but not an independent file schema or verifier.

**B5 instruction / command boundary.**  
Hermes exposes extra NDP commands such as MAC and softmax, plus GPU kernel launches and barriers, but these appear as a backend control interface rather than a higher-level IR suitable for transformations. The taxonomy notes that instruction/meta-op boundaries are useful for backend decoupling but can lose higher-level rewrite equivalences once paths are lowered. (CIM taxonomy.md)

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** | Hermes targets digital DRAM/NDP-DIMM rather than crossbar analog CIM. |
| Bit-slicing / bit significance | **Implementation detail / parameter** | GEMV multipliers perform 128-bit multiplication “in a typical bit-serial manner,” but bit significance is not an upstream rewrite object. ([arXiv](https://arxiv.org/pdf/2502.16963)) |
| ADC/DAC precision or sensing | **N/A** | Fully digital NDP-DIMM path; no ADC/DAC abstraction is part of the demonstrated stack. |
| Analog-to-digital or domain transition | **N/A** | The technology is digital DRAM near-data processing, not analog CIM. |
| Peripheral circuits as path nodes | **Parameter / hardware component** | GEMV units, activation units, reduction-tree accumulators, buffers, DIMM-link controller/bridge are described as architecture components; they are not scheduled as compiler-visible path nodes. ([arXiv](https://arxiv.org/pdf/2502.16963)) |
| Partial-sum accumulation path | **Hardware component / implicit execution path** | The GEMV unit includes a reduction-tree-based accumulator and partial sums with dependencies, but partial-sum identity is not preserved as an IR object. ([arXiv](https://arxiv.org/pdf/2502.16963)) |
| Reconstruction / shift-add tree | **N/A / not foregrounded** | No analog bit-slice reconstruction object appears; digital accumulation is handled inside the GEMV unit. |
| Runtime state, masks, KV cache, batching, sparsity | **First-class** | Neuron state, correlation, activity, hot/cold placement, batching, and KV-cache placement are central to the scheduler. Attention is moved to NDP-DIMMs partly to avoid GPU KV-cache storage. ([arXiv](https://arxiv.org/html/2502.16963v1)) |
| Value trajectory / flow path | **Approximated through placement and command sequence** | The path “GPU hot computation / NDP cold computation → merge on NDP-DIMM → transformer-layer reduction” is described operationally, but value identity across stages is not typed or serialized. ([arXiv](https://arxiv.org/html/2502.16963v1)) |

The taxonomy’s key gap is that no surveyed work makes the space-time path of a value a named, typed, rewritable IR object; Hermes is instead listed as exposing hot/cold or dynamic mask state. (CIM taxonomy.md)

### 5.4 Axis D — rewrite object

Hermes rewrites **hardware mapping** and **runtime state**. The legal transformations are:

1. Initial placement of each layer’s neuron on GPU or a specific NDP-DIMM.
2. Online promotion of hot neurons from DIMM storage into GPU memory.
3. Eviction or overwrite of low-state GPU-resident neurons.
4. Cold-neuron remapping between DIMMs to balance activated-neuron counts.
5. Command scheduling for GPU kernels, NDP MAC/softmax operations, barriers, and merge kernels.

The key equivalence is activation sparsity: if a neuron’s activation is zero, its corresponding weight computation can be skipped without changing the layer result. The information preserved across lowering is neuron identity, layer identity, placement, activation state, and the ability to merge GPU and DIMM partial results. The representation is especially well suited to adaptive placement for sparse LLM inference; expressing trajectory rewrites such as retiming accumulation, fusing merge/reduction paths, or carrying partially accumulated values across operator boundaries would likely require an additional abstraction for value identity, accumulation stage, and storage/communication path. The taxonomy frames this as the difference between mapping/runtime-state rewrites and flow/trajectory rewrites. (CIM taxonomy.md)

## 6. Technical mechanism reading

### 6.1 Hot/cold neuron partition as the core abstraction

Hermes defines a neuron as a row or column in a weight matrix. Under activation sparsity, if the corresponding activation is zero, that neuron’s weights need not be loaded or computed. The paper reports a power-law-style split: about 20% hot neurons account for about 80% of computation, while the remaining cold neurons account for about 20%. This is the abstraction that makes NDP-DIMM useful: hot neurons get GPU compute density; cold neurons get DIMM capacity and local bandwidth. ([arXiv](https://arxiv.org/html/2502.16963v1))

### 6.2 Offline ILP placement

The offline placement problem minimizes total layer latency, with each layer’s time determined by the maximum of GPU execution and NDP-DIMM execution. NDP-DIMM time is the maximum across DIMMs, making load balance directly part of the objective. GPU time includes compute time plus two synchronization costs for input activation fetch and result return. The binary variables indicate whether a neuron in a layer is placed on a processing unit; memory-capacity constraints bound total neuron size on GPU and DIMMs. PuLP is used as the open-source solver, and the authors report around 110 seconds for the offline solve. ([arXiv](https://arxiv.org/html/2502.16963v1))

### 6.3 Online predictor

The online predictor combines two locality observations:

* **Token-wise temporal locality.** Each neuron has a 4-bit state in `[0,15]`. After prefill, states are initialized by activation frequency; during token generation, active neurons increase by `s=4`, inactive neurons decrease by 1. ([arXiv](https://arxiv.org/pdf/2502.16963))
* **Layer-wise correlation.** The system samples the top two correlated neurons from the previous layer and records them in a neuron correlation table. It predicts activation using `s1 + λ·s2 > T`, with λ=6 and T=15. The paper reports 98% predictor accuracy using less than 1 MB, including 232 KB for the LLaMA-7B neuron state table. ([arXiv](https://arxiv.org/pdf/2502.16963))

The predictor’s result feeds the neuron mapper. If a neuron’s state exceeds `Th=10`, it is treated as hot; if a hot neuron is currently in DIMM storage, the system copies it into GPU memory during projection computation and overwrites a lower-state GPU-resident neuron. ([arXiv](https://arxiv.org/pdf/2502.16963))

### 6.4 Window-based DIMM load balancing

Cold neurons are stored across multiple DIMMs, and the slowest DIMM determines the NDP portion of a layer. Hermes groups every five consecutive tokens into a window, counts activated neurons per DIMM, sorts DIMMs by load, pairs high-load and low-load DIMMs, and remaps the most activated neurons from the overloaded DIMM to the underloaded one. This directly exposes DIMM load as a scheduling object. ([arXiv](https://arxiv.org/pdf/2502.16963))

### 6.5 Hardware and backend contract

The target NDP-DIMM has a center-buffer-based design so its local NDP units can access all data in the DIMM while preserving normal memory access. Each DIMM includes GEMV units, activation units, and DIMM-link. The GEMV unit contains 256 multipliers, reduction-tree accumulation, and a 256 KB buffer; the activation unit includes FP16 exponentiation/add/multiply units plus comparator/adder tree/divider support. DIMM-link provides 25 GB/s per link and is used to reduce cold-neuron migration overhead. ([arXiv](https://arxiv.org/pdf/2502.16963))

### 6.6 Workload and evaluation assumptions

The demonstrated workloads are OPT-13B/30B/66B, LLaMA2-13B/70B, and Falcon-40B. OPT uses native ReLU activation; LLaMA2 and Falcon use public ReLU-substituted SparseLLM models, and the paper inserts additional ReLU before QKV generation. The experiments use batch sizes 1–16 and fixed 128-token input/output lengths. GPU performance is measured with NVIDIA Nsight Compute; NDP-DIMM performance is evaluated using a modified Ramulator 2.0 simulator; the NDP core is RTL-synthesized with Synopsys Design Compiler in TSMC 7 nm. ([arXiv](https://arxiv.org/html/2502.16963v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Neuron identity is the reusable scheduling unit

- **Observation:** Hermes chooses “neuron” rather than tensor tile, operator, or instruction as the unit of placement and migration.
- **Why it matters for CIM compiler/IR work:** This suggests an IR for sparse LLM-serving CIM may need sub-operator placement objects that survive across layers and tokens.
- **Reusable lesson:** A future stack could borrow a `NeuronPlacement` or `SparseChannelPlacement` object with fields for layer, row/column identity, current device, activation state, and migration cost.

### Insight 2 — The predictor table is a runtime IR candidate

- **Observation:** The neuron state table and correlation table are compact, typed runtime states: 4-bit activity state, previous-layer correlation links, thresholds, and update rules.
- **Why it matters for CIM compiler/IR work:** These tables are closer to a reusable runtime abstraction than the paper’s system diagram, because they define what the scheduler observes and rewrites.
- **Reusable lesson:** A static-plus-runtime IR could treat these as explicit stateful side tables with provenance from profiling, prefill, and online updates.

### Insight 3 — The ILP separates legality from ranking

- **Observation:** The offline ILP has clear feasibility constraints for memory capacity and a cost objective based on max GPU/DIMM time.
- **Why it matters for CIM compiler/IR work:** This is a useful pattern for separating “can this placement fit?” from “is this placement fast?” even when the later online runtime adjusts the result.
- **Reusable lesson:** A future mapper could expose the ILP variables as a serializable placement candidate, then let runtime passes refine the mapping under the same legality contract.

### Insight 4 — DIMM-link makes remapping a topology-aware operation

- **Observation:** Cold-neuron balancing is not simply a load-balancing heuristic; it is constrained by inter-DIMM bandwidth and migration cost.
- **Why it matters for CIM compiler/IR work:** A hardware-resource IR for DRAM-PIM should expose not only DIMM capacity and compute, but also DIMM-to-DIMM movement paths and contention points.
- **Reusable lesson:** Treat inter-memory links as schedulable resources, even in digital NDP systems where analog objects such as ADC/DAC are not present.

### Insight 5 — The merge kernel is the closest value-trajectory boundary

- **Observation:** GPU and NDP-DIMM compute different neuron subsets, then the NDP-DIMM side merges results.
- **Why it matters for CIM compiler/IR work:** The merge point is where value identity, partial result provenance, and device placement meet, but the paper keeps it operational rather than typed.
- **Reusable lesson:** A value-trajectory IR could attach source-device, neuron subset, precision, and reduction-stage metadata to each partial result before merge.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: artifact is partial.** Public modified SparseLLM model collection found; no public Hermes system code, simulator patch, RTL, ILP scripts, scheduler implementation, or figure-reproduction package was found in the checked sources.

- **Artifact identifier:** SparseLLM Hugging Face organization.
- **License:** Unknown / not found in the checked sources.
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** A Hugging Face organization focused on SparseLLMs, especially ReLU-activated LLMs converted from existing LLMs through fine-tuning; it lists public models, including ReluLLaMA-7B. ([Hugging Face](https://huggingface.co/SparseLLM))
- **What the artifact appears to omit:** Hermes scheduler code, Ramulator modifications, NDP-DIMM simulator configs, RTL, ILP solver scripts, benchmark harness, and figure-generation scripts.
- **Minimal command/workflow:** Unknown / not found in checked sources for Hermes. The paper states that modified LLaMA2/Falcon models are available through SparseLLM, but no Hermes workflow was found. ([arXiv](https://arxiv.org/html/2502.16963v1))
- **Whether paper figures appear reproducible from the artifact:** Unknown. The public model collection may support workload reconstruction, but the simulator/backend and scheduling implementation were not found.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Models/datasets and SparseLLM source are named; no full workload schema. |
| Intermediate representation serialized | Unknown | No serialized IR or mapping-state file found. |
| Mapping decisions inspectable | Partial | ILP variables, objective, thresholds, and examples appear in the paper. |
| Schedule inspectable | Partial | Algorithm 1 exposes cold-neuron remapping; full runtime schedule trace not found. |
| Hardware config explicit | Partial | Table II and architecture text provide NDP-DIMM parameters. |
| Precision / bit-slice assumptions explicit | Partial | FP16 units and bit-serial multiplier detail are described; no type-level propagation. |
| Cost model inspectable | Partial | Equations 1–7 expose the placement cost model; simulator implementation unavailable. |
| Simulator backend documented | Partial | Modified Ramulator 2.0 is named; patch/config not found. |
| Generated code / instruction stream inspectable | Partial | MAC/softmax commands and CUDA launches are described; command traces not found. |
| Provenance from source op to backend action | Partial | QKV, attention, projection, and MLP placement are described at workflow level. |
| Reproduction scripts available | Unknown | No public Hermes scripts found. |
| Calibration source documented | Partial | GPU kernels measured with Nsight Compute; NDP core synthesized in RTL; detailed calibration artifacts not found. |

### 8.3 Integration helper

- **As frontend:** Reuse is limited to the workload assumptions: ReLU-enabled LLMs, activation traces, and selected OPT/LLaMA/Falcon models. Integration would require an importer that produces neuron identities and activation-frequency profiles.
- **As IR inspiration:** The most valuable objects are `Neuron`, `HotColdPlacement`, `NeuronStateTable`, `NeuronCorrelationTable`, `NeuronActivityWindow`, and `DimmlinkMigration`.
- **As mapper/scheduler:** The offline ILP and five-token window scheduler are directly adaptable as mapper/runtime passes for sparse LLM inference on heterogeneous memory-compute systems.
- **As cost model:** Useful formulas include max-of-GPU-and-DIMM layer latency, slowest-DIMM bottleneck modeling, synchronization overhead, and migration-cost-aware remapping.
- **As backend:** The backend could be wrapped at the command level if MAC/softmax commands, barriers, and merge kernels were exposed in a trace format. Public wrapping would require reimplementing the missing simulator interface.
- **As benchmark:** The model set, batch sizes, input/output length, and offloading baselines are reusable benchmark references.
- **As validation source:** GPU measurement, Ramulator-derived simulation, and RTL synthesis provide calibration clues, but the absence of released simulator/RTL artifacts makes independent calibration indirect.

**Integration effort estimate: High.** Integration would be most direct through reimplementing the placement and scheduling algorithms around an existing LLM runtime and a DRAM-PIM simulator. Reuse would benefit from a small adapter that extracts per-neuron activation frequencies, builds the ILP input, serializes neuron placement, and emits a DIMM/GPU command trace. The most valuable reusable boundary appears to be the mapping/scheduler state, not the full end-to-end system.

## 9. Relation to a value-trajectory CIM IR project

Hermes provides useful ingredients for a value-trajectory IR, especially runtime placement, device-local execution, sparse-neuron identity, and merge-point semantics. The closest approximation to trajectory semantics is the FC-layer flow: activated neurons are assigned to GPU or NDP-DIMMs, GPU and DIMM computations run with barriers, and a merge kernel on the NDP-DIMM side gathers results. ([arXiv](https://arxiv.org/html/2502.16963v1))

- **Does the paper name the path a value takes through CIM resources?** Partially. It names host, GPU, NDP-DIMM, DIMM-link, MAC/softmax commands, barriers, and merge kernels, but the value path is described operationally rather than as a typed object.
- **Does it preserve value identity across partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?** It preserves neuron identity for placement and activation; partial result identity is implicit in the merge workflow. Analog sensing/reconstruction is not applicable to the digital NDP-DIMM target.
- **Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?** Placement is represented strongly; precision and bit-serial behavior are hardware details; channel rate is costed through bandwidth/timing, not typed; analog/digital domain transition is not applicable.
- **Could it express trajectory rewrites?**  
  - Fusing reconstruction with downstream reduction: not applicable for analog reconstruction; fusing merge with downstream reduction would require a typed partial-result/reduction abstraction.  
  - Delaying or retiming ADC conversion: not applicable.  
  - Carrying bit-sliced partial sums across operator boundaries: not represented; bit-serial multiplication is inside the GEMV unit.  
  - Changing reduction tree structure: hardware parameter/hardware design issue, not a scheduler rewrite.  
  - Routing values through alternative peripheral paths: DIMM-link remapping provides a coarse analogue for data movement, but peripheral paths are not first-class.  
  - Co-optimizing data movement and numeric reconstruction: Hermes co-optimizes placement and data movement, but not numeric reconstruction.

A trajectory-level extension would likely attach value-subset metadata to each partial result: layer, neuron subset, source device, current storage location, accumulation stage, merge target, and allowed migration path. This aligns with the taxonomy’s finding that current stacks tend to cost dataflow and reconstruction but do not make value flow a named, rewritable object. (CIM taxonomy.md)

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PAPI | LLM inference on PIM-enabled memory with runtime scheduling | PAPI focuses on FC-PIM / Attn-PIM and runtime rules for request/token parallelism, while Hermes focuses on activation-sparse hot/cold neuron placement over GPU + NDP-DIMM. (CIM stack library compact.md) | Group both as A5/B7 LLM-serving co-designs; distinguish by runtime object: request/token scheduling vs neuron placement. |
| Ouroboros | LLM inference co-design with distributed memory-state management | Ouroboros targets wafer-scale SRAM CIM and dynamic KV-cache management; Hermes targets commodity-style DRAM NDP-DIMMs and hot/cold activation sparsity. (CIM stack library compact.md) | Useful pair for “runtime state is emerging before IR vocabulary stabilizes.” |
| HARMONI | DRAM-PIM/chiplet LLM simulation and task-graph modeling | HARMONI exposes a Python-generated task graph/execution trace and tensor placement metadata; Hermes exposes neuron placement and runtime remapping. (CIM stack library compact.md) | HARMONI is closer to a simulator/task-graph backend; Hermes is closer to a sparse-neuron runtime mapper. |
| UniNDP | DRAM/NDP compilation and instruction-driven simulation | UniNDP centers on configurable DRAM-NDP abstraction, NDP instructions, mapping search, and simulator input; Hermes centers on a specific NDP-DIMM architecture and sparse LLM scheduler. (CIM stack library compact.md) | UniNDP is a closer backend/interface baseline; Hermes is a workload-specific scheduling baseline. |
| PIMCOMP / PIMSIM-NN | PIM compiler-to-simulator flow with instruction-like backend | PIMCOMP/PIMSIM-NN lower static ONNX DNNs to instruction/config artifacts for crossbar PIM; Hermes uses runtime neuron placement and command invocation for LLM serving. (CIM stack library compact.md) | Contrast static graph-to-instruction pipelines with dynamic sparse-runtime placement. |
| CIMFlow | Vertical digital CIM DNN compiler/simulator stack | CIMFlow exposes graph partitioning, MLIR/DSL lowering, ISA, and SystemC simulation; Hermes exposes a narrower scheduler and modeled NDP-DIMM backend. (CIM stack library compact.md) | CIMFlow is a stronger explicit-stack baseline; Hermes is a stronger runtime-state case study. |

## 11. Corpus-ready final takeaway

- Hermes is best read as a **narrow hardware–software co-design for activation-sparse LLM inference**, not as a general CIM compiler or IR stack.
- Its strongest reusable layer is the **hot/cold neuron mapping and runtime scheduling abstraction**: offline ILP placement, online predictor, and DIMM load-balancing scheduler.
- The evidenced scope is **one RTX 4090-class consumer GPU plus modeled DDR4 NDP-DIMMs**, evaluated with selected OPT/LLaMA2/Falcon workloads, measured GPU kernels, modified Ramulator 2.0 simulation, and RTL synthesis.
- The first-class objects are **neuron identity, activation state, hot/cold placement, DIMM mapping, runtime activity windows, and inter-DIMM remapping**.
- The hidden IR is the **union of profiling data, ILP variables, runtime tables, placement thresholds, command queues, barriers, merge kernels, and simulator configuration**.
- Artifact status is **partial**: public SparseLLM model collection found; no public Hermes implementation, simulator patch, RTL, or reproduction scripts were found.
- Integration into a future stack would be most valuable as a **runtime mapper/scheduler plugin and benchmark scenario** for sparse LLM serving on digital NDP/PIM memory.
- For a value-trajectory IR, Hermes motivates **runtime placement and merge-point metadata**, but trajectory-level rewrites would require explicit partial-result identity, accumulation-stage, and path annotations.

## 12. Suggested metadata entry

```yaml
paper: "Hermes / Make LLM Inference Affordable to Everyone: Augmenting GPU Memory with NDP-DIMM"
year: 2025
venue: "HPCA 2025"
authors_or_group: "Lian Liu, Shixin Zhao, Bing Li, Haimeng Ren, Zhaohui Xu, Mengdi Wang, Xiaowei Li, Yinhe Han, Ying Wang"
technology:
  - DRAM-PIM
  - digital-CIM
  - digital-NDP
  - NDP-DIMM
  - GPU-PIM-hybrid
workloads:
  - OPT-13B
  - OPT-30B
  - OPT-66B
  - LLaMA2-13B
  - LLaMA2-70B
  - Falcon-40B
axis_A:
  primary: A5_narrow_end_to_end_codesign
  secondary:
    - A3_mapping_scheduling_DSE
    - A2_simulator_cost_model
axis_B:
  - B7_runtime_state_abstraction
  - B1_config_search_as_IR
  - B5_instruction_command_boundary
axis_C_first_class_objects:
  - neuron_identity
  - hot_cold_neuron_status
  - neuron_state_table
  - neuron_correlation_table
  - neuron_activity_window
  - GPU_vs_NDP_DIMM_placement
  - DIMM_load
  - DIMM_link_remapping
  - MAC_softmax_command
axis_D_rewrite_objects:
  - hardware_mapping
  - runtime_state
  - neuron_placement
  - cold_neuron_remapping
  - command_schedule
artifact:
  status: partial
  url: "SparseLLM on Hugging Face; no public Hermes code/simulator/RTL found"
  license: unknown
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: low
trajectory_IR_relevance: medium
notes:
  - "Strong runtime-state case study for sparse LLM serving on digital NDP-DIMM."
  - "Most reusable abstraction is per-neuron hot/cold placement plus windowed DIMM load balancing."
  - "Value trajectory is operationally visible at GPU/NDP merge points but not represented as a typed rewritable object."
```