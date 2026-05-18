# C4CAM — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A4 explicit IR / dialect compiler stack**, with **A3 mapping / scheduling / DSE** and **A5 narrow end-to-end co-design** secondary roles | The paper’s central mechanism is an MLIR lowering path from Torch/TorchScript through a `cim` abstraction and a CAM-specific `cam` abstraction, then into loops and backend calls. The demonstrated stack slice is CAM-oriented similarity/search compilation plus architecture-aware mapping and simulator-backed design-space exploration. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Middle-layer style, Axis B | **B2 graph-as-IR**, **B4 hardware-resource IR**, **B3 loop / schedule IR**, **B1 config-as-IR**, **B6 accuracy / cost modeling** | The `cim` layer rewrites similarity patterns in the operator/dataflow graph; the `cam` layer names bank/mat/array/subarray allocation and search operations; `cam-map` produces nested `scf.parallel` loops; architecture specs and CAMASim configs carry hardware parameters and cost-model assumptions. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| First-class CIM objects, Axis C | CAM device type, search type, similarity metric, CAM hierarchy, resource allocation handles, search/write/read ops, partial-result merge policy, architecture specification, subarray partitioning, selective search | The `cam` abstraction directly represents allocation for banks, mats, arrays, and subarrays, and lowers `cim.execute` into `cam.write_value`, `cam.search`, and `cam.read_value`. It also records CAM type, search type, metric, and partial-result accumulation method. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Rewrite object, Axis D | Operator graph, similarity/search pattern, partitioning/mapping state, array binding, loop schedule, backend API call sequence, heuristic optimization mode | C4CAM rewrites Torch-level kernels into `cim.similarity`, partitions computations to fit CAM resources, maps partitions to hierarchy levels, and applies heuristics for latency, power, and density/utilization. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Best corpus tags | `CAM`, `MLIR`, `compiler-mapping`, `similarity-search`, `KNN`, `HDC`, `DNA-read-mapping`, `CAMASim`, `Eva-CAM`, `design-space-exploration` | Tags reflect the paper’s IR/dialect contribution, its demonstrated workloads, and its simulator-backed evaluation path. |
| Closest comparison baselines | **CAMASim**, **DT2CAM**, **CINM/Cinnamon**, **OCC**, **manual HDC CAM designs such as BioHD/SearchD**, **manual DNA CAM mapping such as FVSA-style read mapping** | These are close because they share either the CAM simulator boundary, MLIR/CIM compilation concern, CAM mapping object, or application-specific CAM implementation baseline. C4CAM’s distinguishing point is the MLIR-based path from high-level kernels to CAM hierarchy mapping and simulator-backed DSE. |

## 2. One-paragraph public summary

C4CAM is a 2024 ASPLOS paper that proposes an MLIR-based compiler and mapping flow for content-addressable-memory accelerators, focused on similarity and search-style workloads rather than general tensor-program compilation. Its main technical contribution is a layered lowering path from TorchScript/Torch MLIR into a generic `cim` abstraction and then into a CAM-specific `cam` abstraction that names CAM hierarchy, allocation, search mode, similarity metric, and partial-result handling. The demonstrated workloads are KNN, hyperdimensional-computing similarity, and DNA read mapping, evaluated through a CAMASim/Eva-CAM-style simulator setup with FeFET TCAM/MCAM assumptions rather than through a public end-to-end compiler artifact. The work is most useful to CIM compiler/IR research as an example of making CAM search and hierarchy mapping explicit in IR, with the clearest reusable boundary around pattern lowering, CAM resource binding, and simulator-facing cost-model integration. ([Cfaed](https://cfaed.tu-dresden.de/publications?pubId=3738))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| C4CAM is an “end-to-end automated retargetable framework” that generates code from TorchScript and architecture specifications. | Abstract, introduction, Figure 3, Section 4 | Paper-only, IR snippets, experiments | The paper shows a flow from TorchScript through Torch MLIR, `cim`, `cam`, loop dialects, and low-level CAM API calls; it also describes architecture specs as inputs to mapping and optimization. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The paper-level evidence supports an end-to-end design and experimental flow. Artifact-level confirmation would require a public C4CAM compiler implementation, which was not found in the checked sources. |
| C4CAM extends the frontend for CAM-relevant TorchScript kernels. | Section 4.3 | Pass description, paper-only | The paper states that C4CAM uses the PyTorch MLIR converter and extends it for operations such as `norm` and `topk`; it also notes that other MLIR frontends could be used if conversions to `cim` are supplied. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | Demonstrated for selected TorchScript kernels used in KNN, HDC, and DNA mapping. Broader frontend support is described as possible through additional lowering paths. |
| The `cim` abstraction can identify and fuse CIM-amenable similarity/search primitives. | Section 4.4.1 and Algorithm 1 | Algorithm, pass description, IR snippets | The paper describes pattern matching for dot product, Euclidean distance, cosine similarity, and Hamming similarity, replacing matched blocks with `cim.similarity`. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The evidenced rewrite set is a selected family of comparison/search kernels. The reusable boundary is clearest at pattern-to-`cim.similarity` lowering. |
| The `cam` abstraction maps generic CIM operations to CAM-device calls and CAM hierarchy. | Section 4.4.2 and Figure 6 | IR snippets, pass description | The paper shows `cam.alloc_bank`, `cam.alloc_mat`, `cam.alloc_array`, `cam.alloc_subarray`, `cam.write_value`, `cam.search`, and `cam.read_value`, with search types such as exact, best, and range and metrics such as Euclidean and Hamming. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The demonstrated scope is CAM search/match execution over a hierarchical CAM accelerator. Public dialect definitions or verifier code were not located. |
| C4CAM supports mapping and optimization for latency, power, and utilization. | Section 4.4.2 and Section 5.6 | Heuristic description, experiment | The paper describes heuristics that maximize parallel arrays for latency, reduce enabled subarrays for power, and use selective search for density/utilization, then evaluates variants such as `cam-base`, `cam-power`, `cam-density`, and `cam-power-density`. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The experiments demonstrate simulator-backed tradeoffs over HDC-like configurations and subarray sizes. The optimization logic is described at the heuristic level in the paper. |
| C4CAM’s results match hand-crafted CAM implementations closely. | Section 5.3 | Experiment | For HDC, the paper reports geometric-mean latency and energy deviations of 0.9% and 5.5% against manual designs; for DNA mapping, it reports similar accuracy with throughput and throughput/W variation around 7.8% and 6%. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | This supports the simulator-backed generated mapping for the evaluated HDC and DNA cases. The comparison is against selected manual CAM implementations, not a public hardware execution trace. |
| C4CAM enables comparison against GPU baselines and CAM design-space exploration. | Section 5.4–5.6 | Experiment | The paper evaluates KNN, HDC, and DNA kernels against GPU-oriented baselines and explores CAM subarray sizes and optimization targets. It states that latency/energy exclude preprocessing and transfer of training/reference data unless otherwise specified. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The strongest evidence is for search/similarity kernels and simulator-estimated CAM performance. End-to-end application claims should be read with the stated preprocessing and data-transfer boundaries. |
| CAMASim provides the simulator backend and can incorporate Eva-CAM/SPICE-style cost data. | Section 5.1 and CAMASim repository | Code/artifact, documentation, experiment | The paper states that C4CAM extends open-source CAMASim; the repository documents a functional simulator plus performance evaluator, `cam.write()` / `cam.query()` APIs, config files, and optional Eva-CAM integration. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) | The related simulator artifact is public and documented. The C4CAM compiler layer that emits into this backend was not found as a public artifact in the checked sources. |

## 4. Stack anatomy

```text
Input / frontend:
TorchScript kernels plus an architecture specification. The frontend path uses the PyTorch MLIR converter into Torch IR, with C4CAM-specific extensions for selected operations such as norm and topk. The architecture specification describes hierarchy and access mode, but a public standalone schema for the C4CAM compiler was not found.

Middle representation:
A layered MLIR path: Torch dialect -> cim dialect/abstraction -> cam dialect/abstraction -> scf/arith/LLVM-compatible lowering. The `cim` layer is a graph-level abstraction for CIM-amenable primitives; the `cam` layer is a hardware-resource and CAM-operation abstraction. The paper provides IR snippets, but public dialect files or verifier definitions were not found.

Mapping or scheduling state:
The mapping state consists of similarity-pattern matches, operand partitioning, allocation to bank/mat/array/subarray hierarchy, nested loops, active subarray choices, and partial-result merge behavior. Some state is inspectable in paper IR snippets, especially Figure 6; artifact-level inspection would require compiler source.

Hardware abstraction:
The hardware abstraction is a hierarchical CAM accelerator model with bank, mat, array, and subarray levels, CAM device type such as TCAM/MCAM/ACAM, search type such as exact/best/range or threshold, metric such as Euclidean/Hamming, and merge policy for horizontal/vertical partial results. CAMASim configs expose related hardware and cost parameters.

Backend / simulator / codegen:
The `cam` abstraction lowers to low-level API calls and simulator-facing operations. Evaluation uses CAMASim, with a functional simulator and performance evaluator, and incorporates Eva-CAM/SPICE-style latency and energy estimates for CAM cells and peripheral components.

Output artifact:
The paper describes generated code/API calls and shows generated MLIR-like snippets. The public artifact boundary found in the checked sources is CAMASim, not a public C4CAM compiler artifact.

Evaluation loop:
Evaluation compiles or maps KNN, HDC, and DNA-read-mapping kernels, runs simulator-backed performance estimation, compares against hand-crafted CAM implementations and GPU baselines, and explores architecture/heuristic settings such as subarray size, power mode, and density mode.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of MLIR operations, architecture specification fields, CAMASim configuration/cost tables, and pass-order assumptions. The paper foregrounds `cim` and `cam` as compiler-visible abstractions, while the reusable semantics are most visible in the boundary between `cam` resource operations and the simulator’s functional/performance contract: write/query/search behavior, hierarchy sizing, sensing mode, merge behavior, and cost attribution. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A4 explicit IR / dialect / compiler stack.**  
C4CAM’s main object is an MLIR-based lowering stack. The paper explicitly places Torch IR, `cim`, `cam`, loop/arith, and LLVM-compatible lowering in a progressive compiler flow. The stack slice it owns most strongly is the transformation from selected high-level comparison/search kernels into CAM hierarchy operations and backend calls. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**Secondary: A3 mapping / scheduling / DSE framework.**  
The `cam-map` pass maps partitioned computations onto bank/mat/array/subarray hierarchy and emits nested loops. C4CAM also explores optimization targets for latency, power, and utilization using heuristic mapping variants and simulator feedback. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**Secondary: A5 narrow end-to-end co-design.**  
The paper connects frontend lowering, CAM mapping, backend simulation, and design-space exploration for a focused workload family: similarity/search kernels in KNN, HDC, and DNA read mapping. The demonstrated end-to-end path is narrow and CAM-specific, which makes the contribution clearer as a targeted co-design stack than as a general CIM compiler. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**Supporting role: A2 simulator & cost model.**  
C4CAM’s evaluation relies on CAMASim, whose public artifact exposes a functional simulator, performance evaluator, configuration files, and optional Eva-CAM integration. The simulator is a major evidence source, but the compiler paper’s main novelty is above the simulator boundary. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

### 5.2 Axis B — middle-layer style

**B2 graph-as-IR.**  
The named middle representation is the `cim` abstraction. It detects dataflow patterns such as Euclidean, cosine, dot-product, and Hamming similarity and rewrites them into `cim.similarity`. Decisions made there include whether a region is CIM-amenable, which similarity primitive it represents, and how to partition operands that exceed CAM capacity. A single public artifact for upstream passes to read and verify this representation was not found; the paper provides snippets and pass descriptions. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**B4 hardware-resource IR.**  
The named representation is the `cam` abstraction. It directly names CAM resources and operations: bank, mat, array, subarray, write, search, read, search type, metric, and partial-result merge. Decisions made there include device binding, hierarchy traversal, allocation granularity, and access parallelism. Decisions such as cost constants, detailed peripheral modeling, and some merge costs are carried into the simulator configuration and performance model. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**B3 loop / tensor-schedule IR.**  
The `cam-map` pass lowers CAM mapping into nested `scf.parallel` loops around hierarchy allocation and search/read operations. This makes the schedule partially inspectable in the paper’s MLIR snippets. More detailed schedule verification would depend on access to compiler-generated IR dumps or pass source. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**B1 config-as-IR.**  
Architecture specification and CAMASim configuration carry hardware hierarchy, access mode, array size, cell type, sensing mode, and cost-model parameters. The public CAMASim artifact documents config-driven use, including `cam_config`, `cost_config.json`, `cam.write()`, and `cam.query()`. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

**B6 accuracy / nonideality modeling.**  
The paper’s performance and energy estimates use CAMASim plus Eva-CAM/SPICE-derived values and evaluate bit precision, quantization, and hashing effects. These assumptions are modeled through simulator setup and experiment design rather than a type-level numeric IR. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class for CAM hierarchy** | `cam` names bank, mat, array, and subarray allocation; architecture specs define hierarchy and access mode. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Bit-slicing / bit significance | **Parameter / workload encoding assumption** | Cell precision and encoding/quantization are evaluated, especially for HDC and KNN, but bit significance is not presented as a compiler type or first-class IR object. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| ADC/DAC precision or sensing | **Parameter / cost-model assumption** | CAMASim configuration and Table 1 include sensing modes such as BE/TH and cell precision; detailed ADC/DAC precision is not the foreground compiler object. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Analog-to-digital or domain transition | **Implicit / costed through simulator** | The paper discusses sensing/peripheral costs and simulator performance estimation, but value-domain transitions are not named as rewriteable IR entities. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Peripheral circuits as path nodes | **Costed / parameterized** | Table 1 lists adder, register, comparator, decoder, and merge-related costs; CAMASim performance evaluator estimates peripheral circuits and buffers. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Partial-sum accumulation path | **First-class at merge-policy level; costed below that** | `cam` conversion specifies how to accumulate partial results, with default CPU accumulation and possible hardware support such as adder trees or extra CIM modules. Horizontal/vertical merge behavior is part of the simulator setup. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Reconstruction / shift-add tree | **Implicit / not central** | C4CAM focuses on CAM search/match and partial-result merge rather than bit-sliced arithmetic reconstruction. No general reconstruction tree IR was found in the checked paper evidence. |
| Runtime state, masks, KV cache, batching, sparsity | **Mostly not applicable / implicit** | The demonstrated workloads are static search/similarity kernels. DNA voting counters and result buffers appear as application/simulator state, not as a general runtime-state abstraction. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |
| Value trajectory / flow path | **Approximated through resource ops and buffers** | The path write → search → read → merge is visible in `cam` operations and simulator calls, but value identity across sensing, accumulation, reconstruction, and storage is not represented as a first-class trajectory object. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |

### 5.4 Axis D — rewrite object

C4CAM rewrites several objects:

- **Operator graph:** Torch/Torch MLIR patterns for similarity and top-k style search are rewritten into `cim.similarity`.
- **Hardware mapping:** partitions are mapped onto bank/mat/array/subarray hierarchy.
- **Array binding and memory layout:** `cam.alloc_*` operations bind buffers and search data to CAM resources.
- **Loop schedule:** `cam-map` emits nested `scf.parallel` loops over hierarchy levels.
- **Mode selection:** heuristic passes select latency-, power-, density-, or combined optimization behavior.
- **Backend API sequence:** `cim.acquire/execute/release` becomes CAM allocation, write, search, read, and low-level API calls.
- **Numeric / encoding assumptions:** precision, quantization, hashing, and sensing mode affect experiments and simulator configuration, but are not shown as a general numeric type system.

The legal transformations in the paper are similarity-pattern recognition, operator fusion into CAM-search primitives, capacity partitioning, hierarchy mapping, selective search, parallelization across arrays/subarrays, and partial-result merge scheduling. The main equivalences exploited are semantic equivalences between high-level similarity formulas and CAM-compatible search/match operations: Euclidean distance, cosine similarity, dot product, and Hamming similarity can be represented as associative search or comparison kernels under the chosen encoding and metric. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

Information that must be preserved across lowering includes the query/reference distinction, similarity metric, search mode, top-k or threshold behavior, operand shapes, partition boundaries, result indices/scores, resource capacity, and merge semantics. The representation is especially well suited to expressing CAM-oriented similarity search and hierarchy-aware placement; expressing cross-operator numeric reconstruction, ADC retiming, or value-flow rewrites across multiple computational domains would likely require additional attributes for numeric stage, domain transition, and value provenance.

## 6. Technical mechanism reading

### 6.1 Frontend and progressive MLIR lowering

C4CAM starts from TorchScript and uses the PyTorch MLIR converter to obtain Torch dialect IR. The paper reports frontend extensions for `norm` and `topk`, which matter because its target workloads often express similarity search as matrix multiplication, norm/distance computation, and top-k selection. The authors also frame the design as compatible with other MLIR-based frontends such as ONNX-MLIR or IREE if equivalent conversions into `cim` are supplied. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

The lowering stack is structured as:

```text
TorchScript / Torch dialect
  -> cim abstraction
  -> cam abstraction
  -> scf / arith / LLVM-compatible lowering
  -> low-level CAM API / simulator-facing execution
```

The compiler/IR idea is that generic CIM-likely operations are recognized before committing to a specific CAM hierarchy. This is useful because the `cim` layer can express “this is a similarity/search primitive,” while the `cam` layer decides how it is mapped to TCAM/MCAM/ACAM resources.

### 6.2 `cim` abstraction: similarity as the first major rewrite boundary

The `cim` abstraction introduces operations such as `cim.acquire`, `cim.execute`, and `cim.release`. The paper defines this layer as responsible for identifying CIM-amenable primitives, partitioning operands that exceed array capacity, and exposing an abstract programming model before lowering to a specific device dialect. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

Algorithm 1 is the clearest compiler mechanism: it matches dataflow blocks corresponding to dot product, Euclidean distance, cosine similarity, and Hamming similarity. When a match is found, the block is fused into `cim.similarity`. This is a graph-level rewrite: it does not merely annotate an operation as “fast on CAM,” but replaces a recognized multi-op expression with a semantic search primitive. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

For compiler research, the important point is that `cim.similarity` serves as a semantic compression boundary. It hides multiple Torch-level operations behind one operation whose legality depends on metric, encoding, and backend support. That makes it a natural candidate for verification rules: preserve distance ordering, top-k behavior, threshold semantics, and result-index provenance.

### 6.3 `cam` abstraction: CAM hierarchy and search operations become explicit

The `cam` abstraction binds CIM operations to CAM-specific hardware structure. The paper states that conversion from `cim` to `cam` requires a CAM device type such as ACAM, TCAM, or MCAM; a search type such as exact, best, or threshold/range; and a metric such as Euclidean or Hamming. It also records how partial results are accumulated, with CPU accumulation as a default and hardware merge support as an alternative. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

The key `cam` operations are:

- `cam.alloc_bank`
- `cam.alloc_mat`
- `cam.alloc_array`
- `cam.alloc_subarray`
- `cam.write_value`
- `cam.search`
- `cam.read_value`

Figure 6 shows these operations embedded in nested `scf.parallel` loops, which means the mapping result is partly represented as standard MLIR control flow plus CAM-specific resource operations. This is more explicit than a pure config file: hierarchy levels and search calls are compiler-visible objects. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

### 6.4 Mapping, partitioning, and optimization heuristics

The `cim` partitioning pass handles cases where kernels exceed CAM processing-element size, using subarray granularity as the partitioning basis. The `cam-map` pass then maps the partitioned computation onto nested loops and allocation calls. If data exceeds the system capacity, the paper says additional loops can be introduced to process the workload in chunks. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

The optimization modes are heuristic and architecture-aware:

- **Latency / performance mode:** maximizes parallel use of available arrays and subarrays.
- **Power mode:** reduces the number of enabled subarrays.
- **Density / utilization mode:** uses selective search to improve utilization.
- **Combined power-density mode:** composes these ideas, trading latency for lower active resource use.

The DSE section evaluates variants such as `cam-base`, `cam-power`, `cam-density`, and `cam-power-density` across subarray sizes from 16×16 to 256×256. The results illustrate that C4CAM’s optimization object is not a tensor schedule in the TVM sense; it is closer to a CAM resource-activation and partition-placement policy. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

### 6.5 Simulator and cost model

The paper’s backend evidence is simulator-backed. Section 5.1 describes a 2FeFET CAM setup at 45 nm and reports that TCAM/MCAM energy and latency are obtained through Eva-CAM-style data backed by manufactured FeFET demonstrations. It also states that C4CAM extends open-source CAMASim with an interface for architecture simulation. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

CAMASim’s public repository documents a functional simulator and performance evaluator. The functional simulator path handles CAM data and queries through calls such as `cam.write()` and `cam.query()`, while the performance side uses configuration and cost data, including optional Eva-CAM integration and a `cost_config.json` path for performance values. ([GitHub](https://github.com/camasim-project/CAMASim/blob/main/README.md))

For auditability, this places the clearest public backend contract at the CAMASim API and configuration level rather than at a public C4CAM compiler API.

### 6.6 Workload and precision assumptions

The demonstrated workloads are:

- **KNN:** similarity search using cosine or Euclidean-style kernels followed by top-k; evaluated on datasets such as Iris, Wine, Breast Cancer, Wine Quality, and Pneumonia. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))
- **HDC:** binary and multi-bit hypervectors, including 8k-dimensional HDC on MNIST. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))
- **DNA read mapping:** CAM-assisted seed/reference lookup and voting, with 4-bit base-pair encoding and Hamming-distance-style thresholding. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

Precision is evaluated experimentally rather than represented as a rich type system. For HDC and KNN, the paper studies 1-bit, 2-bit, and 3-bit configurations, as well as hashing/quantization tradeoffs. These experiments are important for compiler/IR work because they suggest a future design space where bit precision, encoding, and match metric could become type-like attributes attached to search values and CAM buffers. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — `cim.similarity` is the semantic compression point

- **Observation:** The most important compiler rewrite is not the final CAM allocation; it is the recognition of multi-op similarity expressions and their replacement with `cim.similarity`.
- **Why it matters for CIM compiler/IR work:** This gives the compiler a semantic object that can survive lowering: metric, search behavior, query/reference relation, and result ordering can be preserved even after the original Torch-level expression is gone.
- **Reusable lesson:** Future CIM IRs can borrow this pattern by defining high-level associative primitives whose legality is checked before hardware binding.

### Insight 2 — The `cam` dialect makes hierarchy visible without exposing every circuit detail

- **Observation:** `cam.alloc_bank`, `cam.alloc_mat`, `cam.alloc_array`, and `cam.alloc_subarray` expose the accelerator hierarchy as rewriteable compiler state, while lower-level sensing and peripheral costs remain in the simulator/configuration layer.
- **Why it matters for CIM compiler/IR work:** This is a practical separation: the compiler can reason about placement, partitioning, and parallelism without becoming a full circuit simulator.
- **Reusable lesson:** A future stack could adopt a similar split: first-class resource handles in IR, calibrated energy/latency details in backend plugins.

### Insight 3 — CAMASim is the clearest public backend contract

- **Observation:** The public artifact found for this ecosystem is CAMASim, whose documented interface centers on `cam.write()` and `cam.query()` plus configuration/cost files.
- **Why it matters for CIM compiler/IR work:** The simulator API reveals what a backend needs from an upstream compiler: CAM data, CAM query, array/cell/sensing configuration, and merge/performance assumptions.
- **Reusable lesson:** A reusable compiler backend could target CAMASim first by emitting explicit data/query/config bundles, even if it does not reproduce the full C4CAM MLIR stack.

### Insight 4 — Mapping legality and cost ranking are partly separated

- **Observation:** Pattern recognition and partitioning establish what can be mapped, while latency/power/density heuristics rank or choose how to activate CAM resources.
- **Why it matters for CIM compiler/IR work:** Separating legality from ranking makes the stack easier to extend: new metrics or hardware modes can reuse the same semantic `cim.similarity` primitive if they preserve its result contract.
- **Reusable lesson:** Future IRs should distinguish “this search is semantically legal on CAM” from “this resource placement is optimal under a cost objective.”

### Insight 5 — Precision is evaluated as a design knob, not yet elevated to a type system

- **Observation:** The paper studies 1-bit, 2-bit, and 3-bit CAM precision and hashing/quantization effects, but precision propagation is not shown as a compiler type discipline.
- **Why it matters for CIM compiler/IR work:** Precision decisions affect accuracy, latency, energy, and encoding legality; treating them as backend-only parameters limits static reasoning.
- **Reusable lesson:** A future IR could attach precision, encoding, metric, and sensing assumptions to values and buffers, enabling verification of mixed-precision CAM search paths.

### Insight 6 — Partial-result merge is a latent IR object

- **Observation:** The paper explicitly discusses horizontal/vertical merge behavior and partial-result accumulation, but much of the detailed cost and implementation sits in simulator setup.
- **Why it matters for CIM compiler/IR work:** Merge behavior determines result correctness, latency, energy, and data movement. It is a natural place to make value trajectory more explicit.
- **Reusable lesson:** Future CAM/CIM IRs could introduce first-class merge/reduction nodes with attributes for location, numeric domain, associativity, and result provenance.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**C4CAM compiler artifact status: no public artifact found.**

**Related simulator artifact status: public artifact found.** The public artifact located is **CAMASim**, identified as the GitHub repository `camasim-project/CAMASim`. The repository describes CAMASim as a comprehensive content-addressable-memory simulation framework with a function simulator and performance evaluator, and documents use through `cam.write()` and `cam.query()` calls. ([GitHub](https://github.com/camasim-project/CAMASim))

- **License:** MIT license, as shown in the CAMASim repository license file. ([GitHub](https://github.com/camasim-project/CAMASim/blob/main/LICENSE))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** CAMASim simulator code, examples, configuration-driven setup, functional simulation, performance-evaluation components, architecture-estimator files, cost configuration, and optional Eva-CAM integration. ([GitHub](https://github.com/camasim-project/CAMASim/blob/main/README.md))
- **What it appears to omit:** The checked public sources did not reveal the C4CAM MLIR compiler implementation, dialect definitions, pass source, generated IR dumps for the paper figures, or scripts that reproduce the paper’s C4CAM compiler results end-to-end.
- **Minimal documented workflow:** The CAMASim README documents cloning the repository, installing dependencies with `uv sync`, activating the environment, and running an example such as `python example/DecisionTree/example.py`. It also describes preparing `cam_config`, extracting CAM data/query inputs, initializing CAMASim, calling `cam.write(CAM_Data)`, and querying with `cam.query(CAM_Query)`. ([GitHub](https://github.com/camasim-project/CAMASim/blob/main/README.md))
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in the checked sources. CAMASim can support related simulation workflows, but the public repository does not appear to include the C4CAM compiler flow and full paper reproduction scripts.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | TorchScript frontend and architecture-spec inputs are described in the paper; public compiler schemas were not found. |
| Intermediate representation serialized | Partial | Paper includes `cim` and `cam` IR snippets; public dialect files or serialized IR examples were not found. |
| Mapping decisions inspectable | Partial | Figure 6-style IR exposes hierarchy allocation and loops; full pass outputs are not publicly located. |
| Schedule inspectable | Partial | Nested `scf.parallel` loops are shown in the paper; compiler-generated schedule dumps are not found. |
| Hardware config explicit | Partial | Architecture parameters are described in the paper and CAMASim uses explicit configs. |
| Precision / bit-slice assumptions explicit | Partial | Bit precision and encoding are evaluated; no type-level precision propagation artifact was found. |
| Cost model inspectable | Partial | Paper tables and CAMASim cost configs expose some cost-model assumptions; full paper reproduction path is unclear. |
| Simulator backend documented | Yes | CAMASim README documents simulator structure, examples, and Eva-CAM/cost-config integration. ([GitHub](https://github.com/camasim-project/CAMASim/blob/main/README.md)) |
| Generated code / instruction stream inspectable | Partial | The paper shows generated `cam` IR snippets and low-level API intent; public generated outputs were not found. |
| Provenance from source op to backend action | Partial | Running examples show source-pattern to `cim`/`cam` lowering; systematic provenance tracking is not publicly documented. |
| Reproduction scripts available | Partial | CAMASim examples are available; C4CAM paper reproduction scripts were not found. |
| Calibration source documented | Partial | Paper cites Eva-CAM/SPICE-style and FeFET-backed data; exact calibration workflow is not fully exposed in public C4CAM artifacts. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is mainly conceptual. The TorchScript/Torch MLIR path and selected `norm`/`topk` support indicate how to import similarity/search kernels, but integration would require reimplementing or obtaining the C4CAM-specific passes.
- **As IR inspiration:** Strong. The `cim.similarity` abstraction and `cam` hierarchy operations are concrete IR patterns worth borrowing for CAM-oriented compiler stacks.
- **As mapper/scheduler:** Medium. The partitioning, hierarchy binding, and latency/power/density heuristics could be adapted, especially for workloads with query/reference search structure.
- **As cost model:** Medium to high through CAMASim. CAMASim’s public configuration and performance-evaluation boundary could be wrapped as a backend plugin.
- **As backend:** Medium. A future compiler could emit CAMASim-compatible data/query/config objects directly, even without reproducing the exact C4CAM MLIR implementation.
- **As benchmark:** Medium. KNN, HDC, and DNA read mapping are useful benchmark classes for CAM search stacks, but exact paper reproduction would require additional implementation detail.
- **As validation source:** Low to medium. The paper provides simulator-backed comparisons to manual designs and GPU baselines; it does not provide a public hardware-in-the-loop validation artifact.

**Integration effort estimate: Medium–High.** Integration would be most direct through CAMASim, because that public boundary exposes simulator calls and configuration structure. Reusing C4CAM as a compiler stack would require rebuilding the MLIR dialects, pattern rewrites, mapping passes, and paper-specific workload lowering from the descriptions. The most valuable reusable boundary appears to be the semantic split between `cim.similarity` and `cam` hierarchy mapping.

## 9. Relation to a value-trajectory CIM IR project

C4CAM provides useful ingredients for a value-trajectory IR, especially its explicit write/search/read resource operations, CAM hierarchy handles, and partial-result merge discussion. The closest approximation to trajectory semantics is the path from `cam.write_value` into subarray search, result readout, and horizontal/vertical merge. This gives a coarse path through CAM resources, but it does not fully preserve value identity across sensing, analog/digital transition, digital accumulation, reconstruction, reduction, and storage as first-class IR state. ([Cfaed](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2405_Farzaneh_ASPLOS.pdf))

For the specific trajectory-IR questions:

- **Does the paper name the path a value takes through CIM resources?**  
  Partially. It names write, search, read, hierarchy allocation, and merge operations. It does not describe a general value-flow graph through every peripheral and numeric-domain stage.

- **Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?**  
  It preserves query/reference/result structure at the CAM operation level and discusses partial-result accumulation. Detailed value identity across sensing and peripheral stages is mostly represented through simulator behavior and cost configuration.

- **Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?**  
  Placement is represented through `cam` resource allocation. Precision and sensing are parameters in experiments and simulator setup. Bit significance, channel rate, and domain transition are not presented as type-like compiler attributes.

- **Could it express fusing reconstruction with downstream reduction?**  
  The current abstraction is closer to CAM search plus merge. A trajectory-level extension would likely attach reconstruction and reduction-stage attributes to result buffers and merge operations.

- **Could it express delaying or retiming ADC conversion?**  
  The demonstrated abstraction centers on CAM search operations and simulator-level sensing assumptions. Retiming conversion would require first-class domain-transition nodes or attributes.

- **Could it carry bit-sliced partial sums across operator boundaries?**  
  The paper’s demonstrated workloads use CAM match/search semantics rather than cross-operator bit-sliced arithmetic. This would likely require additional value-stage and bit-slice provenance metadata.

- **Could it change reduction tree structure?**  
  Partially. The paper discusses partial-result accumulation and hardware-vs-CPU merge choices. A trajectory IR could make the merge tree itself explicit and rewriteable.

- **Could it route values through alternative peripheral paths?**  
  The simulator/cost configuration can represent alternative peripheral costs, but compiler-level peripheral-path routing would require additional IR objects.

- **Could it co-optimize data movement and numeric reconstruction?**  
  C4CAM already co-optimizes CAM mapping and resource activation for latency, power, and density. Numeric reconstruction/data-movement co-optimization would require a richer abstraction for value stage, domain, and reconstruction location.

A trajectory-level extension would likely attach attributes such as `{resource, domain, precision, encoding, sensing_stage, merge_stage, result_provenance}` to `cam.write`, `cam.search`, `cam.read`, result buffers, and merge operations. C4CAM is therefore a useful CAM-hierarchy and search-operation starting point, but a value-trajectory IR would add a more explicit account of numeric stage and value identity.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| CAMASim | CAM simulation, functional/performance modeling, config-driven CAM evaluation | CAMASim is the public simulator boundary; C4CAM is the compiler/mapping layer that targets or extends such a simulator. | Classify CAMASim as simulator/cost model; classify C4CAM as compiler/mapping stack with simulator-backed evidence. |
| DT2CAM | Mapping application logic to CAM and using CAMASim-style execution | DT2CAM is application-specific around decision trees, while C4CAM targets similarity/search kernels through MLIR abstractions. | Distinguish application translator artifacts from generalizable IR/dialect contributions. |
| CINM / Cinnamon-style MLIR CIM work | MLIR-based CIM abstraction and lowering | CINM-like work is closer to general CIM compilation, while C4CAM specializes the middle layer around CAM search, metric selection, and hierarchy mapping. | Useful comparison for whether the first-class object is a CIM op, a CAM search primitive, or a hardware resource. |
| OCC-style CIM compiler stacks | Compiler mapping for CIM accelerators | OCC-like stacks usually foreground crossbar/tensor arithmetic mapping; C4CAM foregrounds associative search and CAM hierarchy. | Corpus tags should separate arithmetic-CIM mapping from associative-CAM mapping. |
| Manual HDC CAM designs such as BioHD/SearchD | CAM acceleration of hyperdimensional similarity | Manual designs provide hand-tuned application baselines; C4CAM automates a compiler path for related HDC kernels. | Use these as evidence baselines, not as IR-stack equivalents. |
| Manual DNA CAM mapping / FVSA-style read mapping | CAM acceleration of approximate sequence matching | Manual DNA accelerators hardwire lookup/voting structure; C4CAM expresses parts of this through CAM search and merge abstractions. | Good comparison for whether voting/merge state is first-class or embedded in application logic. |

## 11. Corpus-ready final takeaway

- C4CAM’s core contribution is an MLIR-based lowering path for CAM-oriented similarity/search kernels, centered on `cim.similarity` and a CAM-specific `cam` abstraction.
- The strongest reusable stack layer is the middle/backend boundary: similarity primitive → CAM hierarchy allocation → write/search/read → simulator-facing execution.
- The demonstrated scope covers KNN, HDC similarity, and DNA read mapping, evaluated through simulator-backed experiments and selected manual/GPU comparisons.
- First-class CIM objects include CAM type, search mode, metric, hierarchy levels, allocation handles, search/read/write ops, and partial-result merge policy.
- The hidden IR is distributed across MLIR snippets, architecture specs, heuristic mapping modes, CAMASim configuration, and cost-model assumptions.
- C4CAM compiler artifact status: no public artifact found. A related public CAMASim simulator artifact is available under MIT license.
- Integration is most direct through CAMASim or by reimplementing the `cim`/`cam` abstractions in an MLIR-based compiler.
- For a value-trajectory IR, C4CAM is most relevant as a resource-path and search-operation model; trajectory-level work would add first-class value identity, domain transition, precision stage, and merge/reconstruction metadata.

## 12. Suggested metadata entry

```yaml
paper: "C4CAM"
year: 2024
venue: "ASPLOS 2024"
authors_or_group: "Hamid Reza Farzaneh, Mohammad Hossein Shahrokh Abadi, Minxuan Zhou, Wanqian Zhao, Aviral Shrivastava, Jeronimo Castrillon"
technology:
  - other: FeFET-CAM
  - TCAM
  - MCAM
  - associative-CIM
  - hybrid
workloads:
  - KNN similarity search
  - hyperdimensional-computing similarity
  - DNA read mapping
axis_A:
  primary: A4 explicit IR / dialect / compiler stack
  secondary:
    - A3 mapping / scheduling / DSE framework
    - A5 narrow end-to-end co-design
    - A2 simulator-backed cost model
axis_B:
  - B2 graph-as-IR
  - B4 hardware-resource IR
  - B3 loop / tensor-schedule IR
  - B1 config-as-IR
  - B6 accuracy / nonideality modeling
axis_C_first_class_objects:
  - CAM device type
  - CAM search type
  - similarity metric
  - bank / mat / array / subarray hierarchy
  - CAM allocation handles
  - write / search / read operations
  - partial-result merge policy
  - architecture specification
axis_D_rewrite_objects:
  - operator graph
  - similarity pattern
  - partitioning state
  - hardware mapping
  - array binding
  - loop schedule
  - resource activation mode
  - backend API sequence
artifact:
  status: "partial: related public CAMASim simulator found; C4CAM compiler artifact status: no public artifact found"
  url: "GitHub: camasim-project/CAMASim"
  license: "MIT for CAMASim"
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
reproducibility_level: medium-low
trajectory_IR_relevance: medium
notes:
  - "Most reusable compiler idea is the separation between cim.similarity and cam hierarchy/resource operations."
  - "Artifact-level reuse is clearest through CAMASim rather than through a public C4CAM compiler implementation."
  - "Precision, sensing, and merge costs are important but largely represented through simulator/configuration assumptions rather than type-like IR."
```