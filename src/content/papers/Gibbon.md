# Gibbon — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with **A2 Simulator & cost model** and **A5 Narrow end-to-end co-design** as secondary | Gibbon’s owned stack slice is the design-space exploration loop over NN structure and PIM hardware parameters, using ESAPP search and a simulator-backed RNN predictor. The backend evaluation is MNSIM 2.0 rather than a compiler backend or ISA generator. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B6 Accuracy / nonideality modeling** | The paper represents candidates as combinations of network topology/operations, quantization choices, and PIM hardware parameters such as crossbar size, ADC/DAC resolution, and memristor precision. The cost and accuracy semantics are primarily realized through MNSIM 2.0 plus the learned predictor. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| First-class CIM objects, Axis C | DNN DAG stage/block choices; convolution operation choices; weight/activation bitwidth; crossbar size; ADC/DAC resolution; memristor precision; activated word/bit-line parameters; area/energy/latency/accuracy metrics | These objects are directly named in the search space and predictor inputs. CIM value trajectories, explicit partial-sum identities, instruction streams, and source-op-to-array provenance are not shown as serialized IR objects in the checked sources. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Rewrite object, Axis D | **Design candidate / hardware-software mapping configuration**, plus graph topology, operation choice, numeric precision, and hardware parameter selection | The transformations are search mutations over candidate variables: block count, channel count, kernel size, group count, quantization bitwidths, crossbar size, ADC/DAC resolution, and memristor precision. ESAPP changes mutation priorities using entropy and hardware-impact estimates. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Best corpus tags | `RRAM-CIM`, `analog-CIM`, `memristor-PIM`, `NAS`, `hardware-software-co-design`, `design-space-exploration`, `surrogate-cost-model`, `MNSIM`, `CNN-inference`, `mixed-precision` | Tags reflect the demonstrated setting: memristor/RRAM PIM accelerator co-exploration for CNN inference, with simulator-backed search. |
| Closest comparison baselines | **NACIM**, **NAS4RRAM**, **UAE**, **CARS**, **MNSIM 2.0**, **MultiPrecision** | NACIM, NAS4RRAM, and UAE are PIM/CIM-oriented co-design or NAS baselines; CARS is an evolutionary NAS baseline used for comparison; MNSIM 2.0 is the simulator backend; MultiPrecision is the PIM accelerator template discussed in the paper. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |

## 2. One-paragraph public summary

Gibbon is best read as a memristor/RRAM PIM hardware-software co-exploration framework rather than as an explicit CIM compiler IR stack. Its contribution is a PIM-oriented neural-network/hardware search space, an entropy-and-intensity guided evolutionary search method called ESAPP, and an RNN-based surrogate predictor trained from MNSIM 2.0 simulator results. The demonstrated workload setting is static CNN inference on CIFAR-10 and CIFAR-100 over a MultiPrecision-style memristor PIM accelerator parameter space, including crossbar size, ADC/DAC resolution, memristor precision, and quantization choices. For CIM compiler/IR research, Gibbon is useful because it exposes which design-choice variables and metric-provenance fields become important when NN structure, precision, and PIM hardware are optimized together, even though its reusable boundary is more clearly a search candidate/configuration interface than a typed, serializable compiler IR. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Gibbon is an automated framework for efficient PIM-oriented NN accelerator co-exploration. | Abstract, introduction, framework overview | Algorithm, experiment, paper-only framework description | The paper defines a loop that samples parent candidates, filters most candidates with a predictor, mutates children by priority, evaluates selected candidates using MNSIM, updates the predictor/priority state, and returns an optimized design candidate. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Demonstrated as a simulator-backed DSE/NAS loop for static CNN inference; the checked public sources do not expose a Gibbon-specific compiler IR or backend code generator. |
| The search space jointly covers NN structure and PIM hardware configuration. | Search-space section and Table II | Search-space definition, experiment | The search variables include block count, output channels, kernel size, group count, weight/activation bitwidth, crossbar size, ADC resolution, DAC resolution, and memristor precision. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | The evidenced representation is a constrained candidate space, not a general tensor/memory IR for arbitrary models or accelerator targets. |
| Gibbon introduces PIM-oriented NN operators/topologies such as even kernels with SEP and grouped convolution. | PIM-oriented search-space section | Equation, experiment, design-space analysis | The paper defines statistical equilibrium padding for even-sized kernels and motivates grouped convolution as reducing computation, weights, and ADC conversion energy. It reports representative reductions in area/latency/energy for these choices. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Demonstrated inside the Gibbon CNN search space; reuse for other operators would require extending the operation/search vocabulary. |
| ESAPP improves search efficiency by entropy-guided and hardware-impact-guided mutation priority. | ESAPP section and Algorithm 1 | Equation, algorithm | ESAPP uses entropy over candidate-variable distributions and an intensity term for hardware impact, combines them into a priority, and updates the HyperParameter Table during evolutionary search. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | The paper-level evidence supports search-priority adaptation over a fixed discrete variable space; it does not define compiler rewrite legality beyond the candidate mutations. |
| The RNN-based predictor accelerates simulator evaluation while preserving useful ranking quality. | Multilevel joint simulator section | Model description, equations, experiment | The predictor embeds candidate descriptions, extracts sequential features with an RNN over stages/blocks, and uses an MLP regressor with ranking-oriented loss; the paper reports 7.59 s predictor evaluation versus 549 s simulator evaluation and 98.6% time reduction for the compared evaluation workload. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | The predictor is trained on sampled candidates evaluated by MNSIM 2.0; artifact-level confirmation of model architecture, training scripts, checkpoints, and exact data splits was not found in the checked public sources. |
| Gibbon improves accuracy/efficiency compared with prior PIM-oriented NAS/co-design baselines. | Evaluation section and result tables | Experiment | The paper compares against NACIM, UAE, NAS4RRAM, and CARS, reporting separate accuracy-, EDP-, and area-optimized Gibbon variants on CIFAR workloads. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Evidence is simulator-backed and benchmark-specific. The demonstrated scope is CIFAR CNN inference using MNSIM-based evaluation rather than silicon or RTL measurements. |
| The framework provides architectural insights for PIM-oriented design. | Insight/analysis section | Experiment, sensitivity study | The paper analyzes effects of kernel size, channel allocation, quantization bitwidth, ADC resolution, and crossbar size on accuracy, EDP, and area. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9)) | The insights are tied to the searched CNN/PIM space and should be reused as design hypotheses unless recalibrated for a new hardware template or workload. |
| Other simulators could be used in the framework. | Experimental setup | Paper-only plus simulator-backed implementation claim | The paper states that Gibbon uses MNSIM 2.0 by default and that other PIM simulators such as NeuroSim could be included. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | The checked public artifacts expose MNSIM 2.0, but no Gibbon adapter interface or alternative simulator plugin was found. |

## 4. Stack anatomy

```text
Input / frontend:
  A constrained CNN/NAS search space over stage/block topology, operation choices, and per-operation quantization parameters. The paper models DNNs as DAGs whose vertices are operations and whose edges are dependencies. This is graph/search-space input rather than a documented compiler frontend or general model importer. Inspectability is paper-level; Gibbon-specific serialization was not found. 

Middle representation:
  A design candidate combining NN topology choices, operation choices, quantization choices, and PIM hardware parameters. This is closest to config-as-IR plus graph-as-IR. It is named through the search-space variables and predictor embeddings, but no standalone IR schema is documented in the checked sources.

Mapping or scheduling state:
  ESAPP maintains parent/child populations, a HyperParameter Table, entropy values, hardware-impact intensity, mutation priorities, and predictor/simulator scores. This state is inspectable in algorithmic form in the paper, but no serialized search log or schedule artifact was found.

Hardware abstraction:
  A parameterized memristor PIM accelerator space including crossbar size, ADC/DAC resolution, memristor precision, activated word/bit lines, and quantization. MNSIM 2.0 exposes lower-level simulator configuration fields such as device, crossbar, interface, DAC, ADC, buffers, adders, shift registers, tile, and architecture parameters. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

Backend / simulator / codegen:
  MNSIM 2.0 is the demonstrated simulator backend; the RNN predictor is a learned surrogate trained from simulator outputs. The paper reports area, power, energy, latency, and accuracy estimates. No generated code, instruction stream, or backend ISA interface is shown.

Output artifact:
  An optimized design candidate and associated metrics such as accuracy, EDP, area, latency, energy, and power. The output is a ranked design/configuration result rather than a compiled binary, instruction trace, or serialized lowering product.

Evaluation loop:
  Sample design candidates; evaluate a training subset with MNSIM; train the RNN predictor; use the predictor to filter low-performance candidates; evaluate selected candidates with MNSIM; update predictor and mutation priorities; repeat until convergence. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the candidate variable tuple, the NN DAG/stage/block description, per-operation quantization settings, global PIM hardware parameters, ESAPP’s HyperParameter Table, the predictor embedding/codebook state, and MNSIM’s simulator configuration. The paper foregrounds co-exploration and surrogate modeling, while the reusable semantics are most visible in the design-choice variables and in the metric provenance path from candidate description to MNSIM-backed area/energy/latency/accuracy estimates.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
Gibbon’s central object is the design candidate, and its central transformation is search over candidate variables. It owns the DSE loop: parent selection, candidate filtering, mutation priority, simulator evaluation, predictor update, and final design selection. The input is a constrained CNN/PIM search space; the output is an optimized candidate and metric vector. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

**Secondary: A2 Simulator & cost model.**  
The RNN predictor and multilevel joint simulator are major parts of the contribution. The predictor estimates accuracy and hardware metrics, while MNSIM 2.0 provides the simulator-backed training/evaluation signal. The reusable cost-model boundary is clearest at candidate-to-metrics prediction. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

**Secondary: A5 Narrow end-to-end co-design.**  
Gibbon connects NN architecture choices, quantization choices, PIM architecture choices, and simulator-backed evaluation. The demonstrated end-to-end slice is narrow: static CNN inference over CIFAR datasets and a memristor PIM accelerator family. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

**Not primary A4.**  
The paper does not present a compiler dialect, ISA, lowering pass stack, or serialized IR contract. Its compiler relevance comes from the co-design variables and cost-model interface rather than from an auditable compiler middle end.

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is the design candidate: a configuration-like tuple spanning neural-network and hardware variables. Decisions made there include block count, channel count, kernel size, group count, quantization bitwidth, crossbar size, ADC/DAC resolution, and memristor precision. The decisions remaining embedded are simulator-specific mapping details, analog accumulation semantics, reconstruction paths, and exact cost provenance. A single upstream-readable/rewriteable artifact was not found; the paper describes the candidate variables and the simulator consumes corresponding configuration. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9))

**B2 Graph-as-IR.**  
The paper explicitly describes the DNN as a directed acyclic graph, with operation vertices and dependency edges. The graph-level choices include topology/stage/block structure and operation selection. Graph semantics are used for NAS, but the paper does not expose a graph IR with typed CIM annotations, pass legality, or source-to-backend provenance. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

**B4 Hardware-resource IR.**  
Hardware resources are represented as candidate parameters and simulator configuration fields: crossbar dimensions, ADC/DAC resolution, memristor precision, activated lines, buffers, adders, shift registers, tiles, and architecture settings. The hardware resource model is suitable for design ranking, while array binding, schedule, and instruction-level allocation remain inside MNSIM/backend assumptions. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

**B6 Accuracy / nonideality modeling.**  
Gibbon includes accuracy as a predicted and evaluated metric and introduces a differential accuracy predictor for PIM-related accuracy loss. It also relies on MNSIM’s PIM accuracy/hardware modeling path. This makes accuracy/nonideality a first-class evaluation target, although not a typed IR property propagated through lowering. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / partly first-class** | Crossbar size is a search variable; MNSIM exposes crossbar, tile, and architecture configuration fields. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9)) |
| Bit-slicing / bit significance | **Parameter / implicit** | Weight and activation bitwidths plus memristor precision are search variables, but bit significance and bit-slice identity are not shown as separate IR objects. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9)) |
| ADC/DAC precision or sensing | **First-class parameter** | ADC resolution and DAC resolution are explicit search variables and predictor/hardware descriptors. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Analog-to-digital or domain transition | **Costed / implicit** | The PIM MVM description identifies DAC and ADC as key conversion elements; MNSIM has interface/DAC/ADC configuration fields. Conversion is costed through simulation rather than exposed as a rewriteable IR node. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Peripheral circuits as path nodes | **Costed / parameterized** | ADC/DAC are explicit; MNSIM config also includes buffers, adders, multipliers, and shift registers. Gibbon’s search space foregrounds ADC/DAC rather than a full peripheral path graph. ([GitHub](https://raw.githubusercontent.com/thu-nics/MNSIM-2.0/master/SimConfig.ini)) |
| Partial-sum accumulation path | **Implicit / simulator-costed** | MNSIM evaluates latency/area/power/energy, and PIM MVM implies accumulation through crossbar currents, but the checked Gibbon sources do not expose partial sums as named transferable values. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Reconstruction / shift-add tree | **Implicit / hard-coded or backend-managed** | MNSIM has shift-register and adder configuration fields; Gibbon’s paper-level search space does not expose reconstruction as a separate rewrite object. ([GitHub](https://raw.githubusercontent.com/thu-nics/MNSIM-2.0/master/SimConfig.ini)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable / implicit** | The demonstrated workload is static CNN inference on CIFAR datasets; no runtime-state abstraction such as KV cache, dynamic batching, or mask state is part of the paper’s represented search object. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) |
| Value trajectory / flow path | **Approximated / implicit** | The closest approximation is candidate-level evaluation through simulator metrics and accuracy prediction. The paper does not preserve value identity across analog partial sums, sensing, reconstruction, and storage as a first-class object. |

### 5.4 Axis D — rewrite object

Gibbon rewrites **design candidates**. More specifically, it mutates graph topology and operation choices, numeric precision parameters, and PIM hardware parameters. The legal transformations are those admitted by the discrete search space: changing block number, output channels, kernel size, group count, weight/activation bitwidth, crossbar size, ADC/DAC resolution, and memristor precision. ESAPP changes the probability of mutating each hyperparameter using entropy and hardware-impact intensity, while the simulator/predictor ranks candidates by accuracy and hardware metrics. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

The equivalences exploited are design-space equivalences rather than compiler semantic equivalences: many candidate configurations compute compatible CNN functions but differ in architecture cost, quantization behavior, or PIM mapping cost. The information that must be preserved across evaluation is the full candidate descriptor: graph/stage/block structure, operation settings, precision settings, and hardware parameters. The representation is especially well suited to co-optimizing architecture-level and model-level parameters; expressing instruction-level retiming, source-op-to-array provenance, or trajectory rewrites would likely require an additional abstraction for value identity, accumulation domains, and peripheral-path stages.

## 6. Technical mechanism reading

### 6.1 Co-exploration candidate space

Gibbon defines the search space as a Cartesian product of NN-structure choices and PIM hardware choices. The NN side includes DAG topology and operation choices; the hardware side includes crossbar size, ADC/DAC properties, memristor precision, and activated line parameters. Quantization choices are attached to operations and linked to PIM hardware constraints. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

The paper’s Table II gives the concrete search variables: block number `{1,2}`, output channels `{16,32,48,64,80,96}`, kernel size `{1,2,3}`, group count `{1,2,4,8,16}`, weight and activation bitwidth `{5,7,9}`, crossbar size `{32,64,128,256}`, ADC resolution `{4,6,8,10}`, DAC resolution `{1,2}`, and memristor precision `{1,2}`. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9))

### 6.2 PIM-oriented operation choices

Two paper-specific operation/search-space choices are especially relevant for compiler/IR readers.

First, Gibbon introduces **statistical equilibrium padding** for even-sized kernels. The goal is to support even kernels while reducing padding-induced statistical shift. The paper formalizes this with a Bernoulli-style padding expression and evaluates 2×2 kernels against 1×1 and 3×3 alternatives. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

Second, it includes **group convolution** as a PIM-oriented operation choice. The paper motivates this by reducing computation and weights by a factor related to the group count and by reducing ADC conversion energy. In IR terms, this is an operation-level rewrite knob whose backend value is hardware-cost sensitivity, not only FLOP count. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

### 6.3 ESAPP search priority mechanism

ESAPP is an evolutionary search strategy that uses two signals. The first is **entropy**, which measures the diversity or uncertainty of a hyperparameter distribution in the current population. The second is **intensity**, which estimates the hardware-performance impact of mutating a given hyperparameter. These are combined into a priority, and the priority updates the HyperParameter Table that guides mutation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

Algorithmically, ESAPP initializes candidate populations and hyperparameter priority, samples parents, filters candidates, mutates children based on the HyperParameter Table, evaluates candidates, and updates the table until the search converges. For compiler researchers, the key point is that legality is encoded by the candidate space, while search pressure is encoded by entropy/intensity. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

### 6.4 RNN surrogate and multilevel joint simulator

Simulator evaluation dominates the search loop, so Gibbon introduces a multilevel joint simulator: an RNN predictor filters most candidates, while MNSIM evaluates selected candidates and supplies training labels. The predictor input is the combined NN/PIM description, including items such as crossbar size, ADC/DAC settings, and kernel information. Its outputs include accuracy and hardware metrics such as area, power, energy, and latency. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

The predictor has three main pieces: a design-candidate embedder, an RNN feature extractor, and an MLP regressor. The embedder maps discrete candidate descriptions into continuous embeddings; the RNN handles variable numbers of blocks across stages; the MLP predicts metrics. The paper also defines a ranking-oriented metric/loss and a differential accuracy predictor for PIM-related accuracy loss. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

### 6.5 Backend and evaluation assumptions

The evaluation uses MNSIM 2.0 as the baseline PIM simulator, with memristor, ADC, and DAC defaults from MNSIM. The paper states that Gibbon is built on `aw_nas`, evaluates on CIFAR-10 and CIFAR-100, and uses MNSIM for hardware simulation across all compared methods. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

The reported search result table compares Gibbon against NACIM, UAE, NAS4RRAM, and CARS. It reports Gibbon variants optimized for EDP, area, or accuracy, with search time reported as six GPU hours in the table. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The candidate tuple is the practical IR boundary

- **Observation:** Gibbon’s reusable semantic object is the design candidate: a tuple binding NN structure, operator choices, quantization, and PIM hardware parameters.
- **Why it matters for CIM compiler/IR work:** This suggests that a CIM IR does not have to begin as a full instruction dialect; a useful first boundary can be a typed design-choice record that is auditable and costed.
- **Reusable lesson:** Future stacks could formalize such candidate tuples as schemas, with provenance from source graph nodes to hardware/cost fields.

### Insight 2 — Search priority separates legality from ranking pressure

- **Observation:** ESAPP keeps the legal design space fixed while dynamically changing which hyperparameters are more likely to mutate.
- **Why it matters for CIM compiler/IR work:** This separates “what transformations are allowed” from “which transformations are promising under the current objective,” a useful distinction for mapping IRs and autotuners.
- **Reusable lesson:** A compiler-oriented version could attach legality constraints and objective-sensitive priority metadata to rewrite rules.

### Insight 3 — Hardware descriptors are model features, not backend afterthoughts

- **Observation:** The predictor consumes both NN descriptions and PIM hardware descriptions, including crossbar and ADC/DAC-related fields.
- **Why it matters for CIM compiler/IR work:** The cost model treats hardware configuration as part of the middle representation, not as a late backend constant.
- **Reusable lesson:** Future CIM IRs could make hardware-resource annotations type-like and pass them through graph, schedule, and lowering stages.

### Insight 4 — Accuracy loss is modeled as a differential property

- **Observation:** Gibbon’s differential accuracy predictor estimates PIM-related accuracy loss relative to a base one-shot accuracy signal.
- **Why it matters for CIM compiler/IR work:** This is close to an effect annotation: the candidate does not merely have a functional shape; it carries expected numerical degradation under a hardware realization.
- **Reusable lesson:** A future IR could attach accuracy-risk or nonideality-effect metadata to precision, conversion, and placement decisions.

### Insight 5 — MNSIM exposes more backend contract detail than the paper-level compiler view

- **Observation:** MNSIM configuration exposes device, crossbar, interface, DAC, ADC, buffers, adders, shift registers, tiles, and architecture settings.
- **Why it matters for CIM compiler/IR work:** These fields are closer to backend contract objects than the high-level Gibbon framework diagram.
- **Reusable lesson:** A practical integration path would wrap simulator config and outputs as a backend plugin, while adding an adapter that records which candidate fields generated which simulator settings. ([GitHub](https://raw.githubusercontent.com/thu-nics/MNSIM-2.0/master/SimConfig.ini))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: partial public artifact found; no public Gibbon implementation/reproduction artifact found.**

- **Artifact URL or identifier:** Official Gibbon project page at NAS at NICS-EFC; public MNSIM-2.0 GitHub repository; public `aw_nas` repository as the general NAS framework named by the paper. ([Google Sites](https://sites.google.com/view/nas-nicsefc/home/application-on-efficiency/gibbon))
- **License:** The TCAD paper is marked CC BY 4.0. The `aw_nas` repository search result reports MIT license. A Gibbon-specific code license was not found. A LICENSE file was not visible in the checked MNSIM-2.0 repository listing. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** The official Gibbon page contains a public summary, method description, result/insight highlights, and BibTeX. MNSIM-2.0 contains simulator code, README, manual, `SimConfig.ini`, `main.py`, technology/config files, and example structure. ([Google Sites](https://sites.google.com/view/nas-nicsefc/home/application-on-efficiency/gibbon))
- **What the artifact appears to omit:** A Gibbon-specific ESAPP implementation, search-space config files, predictor training scripts, trained checkpoints, candidate logs, reproduction scripts for paper figures/tables, and a documented end-to-end Gibbon command were not found in the checked public sources.
- **Minimal command or workflow:** No Gibbon-specific minimal workflow was found. MNSIM’s `main.py` exposes command-line arguments for hardware description, weights, NN model, and hardware/accuracy simulation toggles, so MNSIM can be used as a simulator component, but this is not the full Gibbon search workflow. ([GitHub](https://raw.githubusercontent.com/thu-nics/MNSIM-2.0/master/main.py))
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in the checked sources. MNSIM supports simulator evaluation, but reproducing Gibbon’s search tables would require the missing Gibbon search/predictor/config artifacts.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | The paper documents the search variables and workload setting; no standalone Gibbon input schema was found. |
| Intermediate representation serialized | Unknown | The design candidate is described conceptually; no serialized IR/schema was found. |
| Mapping decisions inspectable | Partial | Search decisions are visible through ESAPP pseudocode and variables; concrete candidate logs were not found. |
| Schedule inspectable | Unknown | No explicit schedule or instruction-level mapping trace is exposed. |
| Hardware config explicit | Partial | Search variables are explicit, and MNSIM config is explicit; candidate-to-config adapter details were not found. |
| Precision / bit-slice assumptions explicit | Partial | Weight/activation bitwidth, ADC/DAC resolution, and memristor precision are explicit; bit-slice identity and reconstruction semantics are embedded. |
| Cost model inspectable | Partial | Predictor architecture, losses, and simulator dependency are described; source code/checkpoints were not found. |
| Simulator backend documented | Partial | MNSIM 2.0 is public and configurable; the Gibbon-to-MNSIM integration layer was not found. |
| Generated code / instruction stream inspectable | N/A | The paper’s demonstrated output is a design candidate and metrics, not an instruction stream. |
| Provenance from source op to backend action | Partial | Candidate variables connect graph/operator choices to metrics; source-op-to-array/action provenance is not shown. |
| Reproduction scripts available | Unknown | No Gibbon-specific reproduction scripts were found. |
| Calibration source documented | Partial | MNSIM defaults and simulator-backed training data are described; lower-level calibration provenance depends on MNSIM and is not fully unpacked in Gibbon. |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest for constrained CNN/NAS search spaces, not for general model import. A future stack could borrow the stage/block/operator vocabulary and add a parser/schema.
- **As IR inspiration:** The most valuable abstraction is the combined candidate record: graph choice + operation choice + precision + PIM hardware parameters + metric targets.
- **As mapper/scheduler:** ESAPP could be adapted as a mapper/DSE policy over any discrete CIM mapping space with measurable objective impact.
- **As cost model:** The RNN surrogate and differential accuracy-prediction idea could become backend plugins that predict area, latency, energy, power, and accuracy loss from IR annotations.
- **As backend:** MNSIM 2.0 can be wrapped as a simulator backend. Reuse would benefit from an adapter that emits MNSIM configs and records candidate-to-simulator provenance.
- **As benchmark:** CIFAR-10/CIFAR-100 CNN search spaces and the reported baseline comparisons are useful for small-scale co-design benchmarking.
- **As validation source:** The work is simulator-backed. It can calibrate other tools against MNSIM-style estimates, but it does not provide silicon, RTL, or chip-in-loop validation evidence in the checked sources.

**Integration effort estimate:** **High for reproducing Gibbon end-to-end; Medium for reusing its ideas.** Integration would be most direct through a new adapter that encodes Gibbon-style candidate tuples and calls MNSIM as a cost backend. Full reproduction would require reconstructing or reimplementing ESAPP, the predictor training pipeline, search configs, and paper-specific benchmark workflow.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially its explicit treatment of hardware-sensitive design variables: crossbar size, ADC/DAC resolution, memristor precision, quantization bitwidth, and operator choices. The closest approximation to trajectory semantics is the path from candidate description to simulator-evaluated accuracy/area/latency/energy metrics.

The paper names important stages in the analog PIM computation path, including DAC input conversion, crossbar MVM using Kirchhoff’s laws, and ADC output conversion. However, the demonstrated abstraction centers on candidate-level design ranking. It does not preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage as a first-class compiler object. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf))

Bit significance, channel rate, precision stage, placement, and domain transition are represented mostly as parameters or simulator assumptions. A trajectory-level extension would likely attach typed annotations to graph edges or tensor fragments, including bit-slice role, analog/digital domain, crossbar placement, ADC stage, accumulation path, reconstruction operation, and destination buffer.

For the example trajectory rewrites:

- **Fusing reconstruction with downstream reduction:** Not directly represented; would require reconstruction and reduction path nodes.
- **Delaying or retiming ADC conversion:** ADC resolution is a parameter, but ADC placement/timing is not a rewriteable trajectory object.
- **Carrying bit-sliced partial sums across operator boundaries:** Bitwidth and memristor precision are parameters; bit-sliced partial-sum identity would need an added value-flow abstraction.
- **Changing reduction tree structure:** Reduction cost may be reflected through simulation, but the tree is not exposed as a schedule/IR object.
- **Routing values through alternative peripheral paths:** Peripheral fields exist in MNSIM configuration; route alternatives are not surfaced as named paths in Gibbon.
- **Co-optimizing data movement and numeric reconstruction:** Gibbon co-optimizes hardware/model parameters, but trajectory-level co-optimization would add explicit data-movement and reconstruction semantics.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| NACIM | Joint neural-architecture and CIM accelerator co-exploration | Gibbon adds a broader PIM-oriented search space, ESAPP, and a learned predictor; NACIM is a close co-design baseline in the evaluation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Place near DSE/NAS co-design works, not explicit compiler IR stacks. |
| NAS4RRAM | PIM/RRAM-aware neural architecture search | Gibbon compares against NAS4RRAM and adds explicit PIM hardware search parameters plus surrogate evaluation. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Useful contrast between NN-architecture search and joint NN/hardware candidate search. |
| UAE | Accuracy/uncertainty-aware NAS for emerging CIM | Shared focus on CIM-aware NN search and accuracy effects; Gibbon’s emphasis is co-searching PIM hardware variables and simulator-backed hardware metrics. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Shows how accuracy modeling can be part of the middle-layer object even without a compiler IR. |
| CARS | Evolutionary NAS baseline | Shared evolutionary search machinery; Gibbon adds PIM-specific hardware variables, ESAPP priority, and MNSIM-backed metrics. ([ResearchGate](https://www.researchgate.net/publication/369632753_Gibbon_An_Efficient_Co-Exploration_Framework_of_NN_model_and_Processing-In-Memory_Architecture/fulltext/642598a292cfd54f843d9f8c/Gibbon-An-Efficient-Co-Exploration-Framework-of-NN-model-and-Processing-In-Memory-Architecture.pdf?_tp=eyJwYWdlIjoiam91cm5hbERldGFpbCJ9)) | Helps separate generic NAS search policy from CIM-specific search-object design. |
| MNSIM 2.0 | PIM simulator and cost/accuracy backend | Gibbon uses MNSIM as evaluation infrastructure; MNSIM itself is closer to A2 simulator/cost-model infrastructure than to NAS/DSE. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | In the corpus, Gibbon should point to MNSIM as its backend contract and provenance dependency. |
| MultiPrecision | Memristor PIM accelerator template | Gibbon’s search space and experiments build around a MultiPrecision-style PIM setting. ([dai.sjtu.edu.cn](https://dai.sjtu.edu.cn/my_file/pdf/f8091be3-32b0-486b-a2a8-c738f07e0d0f.pdf)) | Useful for understanding which hardware hierarchy assumptions are inherited rather than introduced as a compiler abstraction. |

## 11. Corpus-ready final takeaway

- Gibbon’s main contribution is a simulator-backed hardware-software co-exploration loop for memristor/RRAM PIM accelerators.
- Its strongest reusable stack layer is the DSE/cost-model boundary: candidate description → predictor/MNSIM metrics → search update.
- The demonstrated scope is static CNN inference on CIFAR-10/CIFAR-100 with constrained NN topology, operation, quantization, and PIM hardware choices.
- First-class objects include CNN stage/block choices, operation choices, bitwidths, crossbar size, ADC/DAC resolution, memristor precision, and metric objectives.
- The hidden IR is the combination of candidate tuple, ESAPP search state, predictor embedding state, and MNSIM hardware configuration.
- Artifact status is partial: public paper/project documentation and MNSIM/aw_nas dependencies are available, but no public Gibbon-specific implementation or reproduction package was found.
- Integration is most practical by wrapping MNSIM as a backend cost plugin and reimplementing the Gibbon candidate schema plus ESAPP policy.
- For value-trajectory IR research, Gibbon is a useful source of hardware-sensitive fields and metric-provenance lessons, while trajectory-level semantics would require explicit value-flow, conversion, accumulation, and reconstruction objects.

## 12. Suggested metadata entry

```yaml
paper: "Gibbon"
year: 2022_DATE_paper; 2023_TCAD_extended_version
venue: "DATE 2022; IEEE TCAD 2023"
authors_or_group: "Yannan N. Wu, Peiyu Y. Chen, H. H. Li, Yiran Chen, Yingyan Lin, Yu Wang, Yuan Xie, Cheng Zhuo"
technology:
  - RRAM-CIM
  - memristor-PIM
  - analog-CIM
workloads:
  - CNN inference
  - CIFAR-10
  - CIFAR-100
axis_A:
  primary: A3_mapping_scheduling_DSE_framework
  secondary:
    - A2_simulator_cost_model
    - A5_narrow_end_to_end_co_design
axis_B:
  - B1_config_as_IR
  - B2_graph_as_IR
  - B4_hardware_resource_IR
  - B6_accuracy_nonideality_modeling
axis_C_first_class_objects:
  - DNN_DAG_stage_block_topology
  - operation_choice
  - weight_activation_bitwidth
  - crossbar_size
  - ADC_resolution
  - DAC_resolution
  - memristor_precision
  - hardware_metric_vector
  - accuracy_metric
axis_D_rewrite_objects:
  - design_candidate
  - graph_topology
  - operation_choice
  - numeric_precision
  - hardware_configuration
  - search_priority_state
artifact:
  status: "partial public documentation found; no public Gibbon implementation/reproduction artifact found"
  url: "Official NAS at NICS-EFC Gibbon page; public MNSIM-2.0 repository; public aw_nas repository"
  license: "Paper CC BY 4.0; aw_nas MIT; Gibbon-specific code license unknown; MNSIM license not found in checked repository listing"
  last_checked: "2026-05-15"
integration_roles:
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
reproducibility_level: low_for_end_to_end_Gibbon; medium_for_MNSIM_backend_reuse
trajectory_IR_relevance: medium
notes:
  - "Best treated as DSE/NAS co-exploration plus surrogate cost modeling, not as an explicit CIM IR/ISA compiler stack."
  - "Most reusable abstraction is the candidate tuple connecting NN structure, quantization, and PIM hardware parameters."
  - "Value-trajectory extensions would add explicit domain-transition, partial-sum, reconstruction, and source-to-backend provenance objects."
```