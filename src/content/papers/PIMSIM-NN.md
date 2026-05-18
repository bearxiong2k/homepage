# PIMSIM-NN — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **Hybrid: A2 Simulator & cost model + A4 ISA compiler/backend boundary** | The paper presents an ISA-based framework with a compiler and a cycle-accurate configurable simulator, and emphasizes decoupling software optimization from hardware architecture through the ISA. The public artifact is clearest as a SystemC simulator that takes compiled instruction streams plus architecture configuration, with ONNX-to-instruction compilation delegated to PIMCOMP-NN. ([arXiv](https://arxiv.org/html/2402.18089v1)) |
| Middle-layer style, Axis B | **B5 Instruction / meta-op / ISA**, **B1 Config-as-IR**, secondary **B4 Hardware-resource IR** | The reusable middle boundary is the instruction sequence: matrix, vector, transfer, and scalar instructions over a core/global-memory abstraction. Hardware behavior is parameterized by JSON configuration fields such as crossbar count, DAC/ADC resolution/count/latency, cell precision, memory timing, NoC layout, and simulator mode. ([arXiv](https://arxiv.org/html/2402.18089v1)) |
| First-class CIM objects, Axis C | **Instruction stream, core, local/global memory, crossbar group / array group, matrix/vector/transfer/scalar execution units, ROB, NoC config, DAC/ADC parameters, cell precision, shift-adder latency** | The ISA names array groups and mvmul operands; the paper names core-local memory, crossbars, execution units, synchronized transfer, ROB, dispatch conflicts, and mesh NoC. The artifact exposes many hardware parameters in the architecture config. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| Rewrite object, Axis D | **Hardware mapping + instruction stream**, with graph lowering through PIMCOMP-NN | The paper’s compiler discussion centers on mapping weights/layers to cores using utilization-first and performance-first strategies, then emitting per-core instructions. The companion compiler exposes ONNX parsing, node partition, weight replication, core mapping, dataflow scheduling, and simulation instruction output. ([arXiv](https://arxiv.org/html/2402.18089v1)) |
| Best corpus tags | `ISA`, `simulator`, `SystemC`, `instruction-stream`, `config-as-IR`, `crossbar-PIM`, `RRAM-PIM`, `DNN-inference`, `ONNX-via-PIMCOMP`, `cycle-accurate-simulation` | The tags reflect the evidenced public boundary: a simulator for RRAM-/PIM-style neural-network accelerators, an ISA document, compressed instruction files, JSON architecture configs, and SystemC-based execution. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Closest comparison baselines | **PIMCOMP-NN, PIMSYN-NN, MNSIM2.0, PUMA, PIM-Toolchain / PIMACC** | PIMCOMP-NN is the companion compiler; PIMSYN-NN synthesizes architectures for the same ecosystem; MNSIM2.0 is the simulator baseline compared in the paper; PUMA is the closest ISA/compiler/simulator precedent; PIM-Toolchain contextualizes PIMSIM-NN as the performance simulator beside PIMACC for accuracy effects. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |

## 2. One-paragraph public summary

PIMSIM-NN is best read as an ISA-centered simulation framework for crossbar-based PIM neural-network inference. The paper’s main contribution is the instruction-sequence boundary between software mapping/code generation and a configurable SystemC simulator: DNNs are compiled into per-core instructions, then evaluated against hardware and NoC configuration files for latency, power, energy, and throughput. The demonstrated paper scope is static DNN inference on memristor/RRAM-style crossbar accelerators, with experiments over CNN workloads such as AlexNet, GoogLeNet, ResNet-18, SqueezeNet, VGG-8, and VGG-16; the public simulator artifact is clearest for precompiled instruction streams and JSON hardware configs, while ONNX-to-instruction compilation is documented through the companion PIMCOMP-NN repository. For CIM compiler/IR research, PIMSIM-NN is valuable less as a general-purpose IR stack and more as a concrete backend contract: it shows which CIM details must be named at the ISA/config boundary for simulator-backed exploration. ([arXiv](https://arxiv.org/html/2402.18089v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “An ISA-based simulation framework including a dedicated ISA, a compiler, and a cycle-accurate configurable simulator.” | Abstract and conclusion | Paper-only + artifact | The paper states the framework structure; the public simulator repository contains a SystemC/C++ simulator, build instructions, an example compressed instruction file, and architecture config. The separate ISA document specifies instruction semantics. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The reusable public artifact is clearest at the simulator/backend boundary. End-to-end ONNX compilation is evidenced through the associated PIMCOMP-NN repository rather than inside the pimsim-nn repository. |
| “The ISA decouples software algorithms and hardware architectures.” | Abstract, introduction, conclusion | ISA specification + documentation | The ISA document defines an abstract architecture with cores, global memory, local memory, scalar/vector/PIM matrix units, array groups, and digital interfaces; the simulator consumes instruction streams and architecture configs. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The decoupling is most concrete for a fixed accelerator abstraction and neural-network inference instructions. Portability to arbitrary CIM architectures would require adapters from this abstract ISA/config model to target-specific hardware. |
| “Most instructions are high-level abstractions of primary DNN operators, classified into matrix, vector, transfer, and scalar.” | ISA section | ISA document | The paper names four instruction classes; the ISA document defines scalar/register instructions, `setbw`, `mvmul`, vector operations, load/store/local move, send/recv, wait/sync. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The instruction vocabulary targets DNN inference. General training, arbitrary control flow, and non-DNN kernels are outside the stated ISA scope; the ISA document explicitly says loops should be unrolled and the ISA is not for training or general-purpose computing. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| “A group mechanism lets crossbars belonging to the same matrix and using the same inputs run in parallel.” | ISA section | ISA specification + simulator abstraction | The paper describes groups; the ISA document defines array groups generated by the toolchain, stored by hardware, and used by `mvmul` through an `imm_group` field. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The group abstraction names logical arrays and hides physical-array details such as positive/negative weights and multi-cell precision from software. This makes the compiler boundary compact, while bit-slice-level physical placement remains below the ISA. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| “The compiler converts a DNN description to instructions for every core and supports software-level optimizations.” | Section III-A | Algorithm description + companion artifact | The paper describes two mapping policies: utilization-first packs layer weights tightly across cores, while performance-first maps one layer to unmapped cores. PIMCOMP-NN documents ONNX frontend conversion, backend stages, compilation modes, and optional outputs for intermediate info, verification, and simulation instruction files. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The DATE paper provides a compact algorithmic description. Artifact-level confirmation for the exact compiler used in the paper depends on PIMCOMP-NN and its output files, not on pimsim-nn alone. |
| “The simulator is cycle-accurate, configurable, scalable, SystemC-based, and modular.” | Section III-B | Paper-only + artifact documentation | The paper states SystemC cycle-by-cycle simulation and modular extension. The repository documents CMake build, `ChipTest`, architecture/NoC/program input files, and simulator modes. ([arXiv](https://arxiv.org/html/2402.18089v1)) | Demonstrated through public build/run documentation and a ResNet-18 example. Calibration sources for component timing/power values are not found in the checked README/config documentation. |
| “The simulator can evaluate software mapping and hardware ROB capacity independently.” | Section IV-A | Experiment | The paper evaluates utilization-first vs performance-first mapping with ROB size 1, then varies ROB size and reports normalized latency/energy trends. It uses a 64-core chip, 512 crossbars per core, 128×128 crossbars, and one shared ADC per core in the experiment. ([arXiv](https://arxiv.org/html/2402.18089v1)) | Demonstrated for selected CNN-style workloads in simulator-backed experiments. The public pimsim-nn README documents a ResNet-18 example; scripts to regenerate all paper figures were not found in the checked simulator README. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| “PIMSIM-NN models communication more accurately than MNSIM2.0 by using synchronous communication.” | Section IV-B | Experiment + comparative code reading claim | The paper compares against MNSIM2.0 on modified VGG-8, VGG-16, and ResNet-18 networks and attributes differences to MNSIM2.0’s fully asynchronous communication assumption; it reports about 10% latency difference on VGG networks and 53% slower ResNet-18 in PIMSIM-NN, with a second convolution communication-latency ratio of 77% vs 18%. ([arXiv](https://arxiv.org/html/2402.18089v1)) | The paper-level evidence supports the communication-model distinction for the evaluated networks. Independent artifact-level reproduction would require the modified networks, MNSIM2.0 setup, PIMSIM-NN configs, and scripts used for the comparison. |

## 4. Stack anatomy

```text
Input / frontend:
  Paper-level input is a network description file in ONNX format plus an architecture configuration file.
  Artifact-level PIMSIM-NN input is a compressed program-instruction file plus a JSON architecture configuration file; the README states that PIMCOMP-NN accepts ONNX and produces the instruction sequence. The pimsim-nn simulator input is serialized and reusable, but the compressed instruction stream is not human-readable without the compiler/parser. ([arXiv](https://arxiv.org/html/2402.18089v1))

Middle representation:
  The named middle representation is the PIM ISA instruction stream: matrix, vector, transfer/communication, and scalar instructions. PIMCOMP-NN also uses JSON model descriptions and can emit IntermediateInfo.json, VerificationInfo.json, and SimulationInfo.gz. The ISA is documented; intermediate compiler state is partially serialized when requested by PIMCOMP-NN flags. ([arXiv](https://arxiv.org/html/2402.18089v1))

Mapping or scheduling state:
  The paper-level mapping state records how layer weight matrices are assigned to cores/crossbars using utilization-first or performance-first policies. The companion compiler names node partition, weight replication, core mapping, and dataflow scheduling as backend stages. Mapping decisions are partly inspectable through PIMCOMP-NN’s optional IntermediateInfo.json and VerificationInfo.json outputs. ([arXiv](https://arxiv.org/html/2402.18089v1))

Hardware abstraction:
  The hardware abstraction is a chip with cores connected through an interconnection/NoC and a core containing local memory, register file, scalar/vector/matrix/transfer units, ROB, and crossbar groups. The artifact exposes this mostly as JSON config and simulator code; example config includes core count, mesh layout, crossbar dimensions, cell precision, DAC/ADC parameters, memory timing, and simulation mode. ([arXiv](https://arxiv.org/html/2402.18089v1))

Backend / simulator / codegen:
  Code generation emits per-core instruction streams; PIMSIM-NN consumes the compressed instruction sequence and config through `ChipTest`. The simulator is SystemC-based and reports throughput, latency, power, and energy / power-consumption statistics. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

Output artifact:
  Simulator output is a report with basic information, output count, throughput, and average latency in the documented example. PIMCOMP-NN can save evaluation results, verification instructions, intermediate information, and SimulationInfo.gz for detailed simulation. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

Evaluation loop:
  The paper evaluates mapping policy and ROB capacity, then compares simulator latency with MNSIM2.0. The artifact demonstrates a built-in ResNet-18 workflow; full paper-figure reproduction scripts are Unknown / not found in the checked sources. ([arXiv](https://arxiv.org/html/2402.18089v1))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the ISA instruction stream, array-group mapping, local/global memory addresses, synchronization instructions, and architecture/NoC JSON parameters. The paper foregrounds the ISA as the decoupling layer, while the reusable semantics are most visible in three serialized boundaries: PIMCOMP-NN’s model/intermediate/simulation files, PIMSIM-NN’s compressed instruction stream, and PIMSIM-NN’s architecture configuration. This is a practical “hidden IR” rather than a single compiler IR: legality lives in the compiler’s mapping and scheduling rules, timing/power semantics live in simulator configuration and component models, and execution ordering lives in instruction dependencies, ROB behavior, send/recv, wait/sync, and NoC timing. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 Simulator & cost model.**  
The strongest evidenced layer is the simulator: pimsim-nn takes program instructions and an architecture configuration, runs a SystemC-based simulation, and reports latency, throughput, power, and energy-style results. The README’s top-level description defines pimsim-nn as a simulator rather than as an ONNX compiler; ONNX-to-instruction generation is delegated to PIMCOMP-NN. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

**Co-primary / strong secondary: A4 Explicit IR / dialect / ISA compiler stack.**  
The paper’s compiler/IR relevance comes from the ISA boundary. The instruction set names matrix, vector, transfer, scalar, bit-width-setting, mvmul, vector arithmetic, memory transfer, inter-core communication, and synchronization operations. This is the object handed from compiler to backend. ([arXiv](https://arxiv.org/html/2402.18089v1))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The paper demonstrates mapping policies, and the companion PIMCOMP-NN backend exposes node partition, weight replication, core mapping, and dataflow scheduling. In the DATE paper itself, the mapping exploration is intentionally compact: utilization-first vs performance-first and ROB-capacity sensitivity. ([arXiv](https://arxiv.org/html/2402.18089v1))

**Secondary: A5 Narrow end-to-end co-design.**  
Within the broader PIM-Toolchain ecosystem, the intended flow is ONNX → PIMSYN-NN/PIMCOMP-NN → instruction sequence → PIMSIM-NN/PIMACC. That is a narrow CNN/DNN inference co-design stack for crossbar PIM, with PIMSIM-NN occupying the performance-simulation backend. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

### 5.2 Axis B — middle-layer style

**B5 Instruction / meta-op / ISA.**  
The named middle representation is the PIM DNN ISA. Decisions represented there include mvmul target group, local-memory source/destination, vector operation kind, bit-width setting, data movement, inter-core send/recv, and synchronization. Decisions still embedded below the ISA include physical array decomposition, some bit-slice implementation details, analog circuit realization, and timing/power models. The ISA document explicitly says the toolchain is concerned with logical arrays and physical arrays are transparent to software. ([arXiv](https://arxiv.org/pdf/2308.06449))

**B1 Config-as-IR.**  
The architecture configuration acts as a backend IR for hardware resources and timing. The example config names `xbar_array_count`, `xbar_size`, `cell_precision`, DAC/ADC resolution/count/latency, shift-adder latency, local/global memory timing, NoC layout, core count, and simulation mode. Upstream passes could read and specialize against this JSON, but the schema is documented mostly through README prose and example files rather than a formal verifier. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json))

**B4 Hardware-resource IR.**  
Cores, crossbars, array groups, execution units, local/global memory, and NoC are first-class in the abstraction. The compiler maps weights/layers to cores and crossbars; the simulator instantiates core and NoC resources from config. A single unified artifact for all upstream resource decisions is not fully visible in pimsim-nn alone; PIMCOMP-NN can emit intermediate and verification information, and PIMSIM-NN consumes simulation instructions/config. ([arXiv](https://arxiv.org/html/2402.18089v1))

**B2 Graph-as-IR, narrow and delegated.**  
ONNX is the frontend graph format, and PIMCOMP-NN converts ONNX to backend JSON containing node parameters and topology. In PIMSIM-NN itself, the simulator no longer sees ONNX; it sees the lowered instruction stream. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

**B7 Runtime-state abstraction, backend-local.**  
The simulator and ISA expose runtime state such as register file, local memory, ROB, event registers, wait/sync, and send/recv. This is useful for execution semantics, but the paper’s demonstrated compiler transformations are static mapping/scheduling rather than dynamic runtime adaptation. ([arXiv](https://arxiv.org/html/2402.18089v1))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class at logical array/group and simulator-resource level** | The paper defines matrix instructions over crossbars and a group mechanism; the ISA defines array groups generated by the toolchain; the config exposes crossbar count and dimensions. ([arXiv](https://arxiv.org/html/2402.18089v1)) |
| Bit-slicing / bit significance | **Parameter / partially implicit** | The ISA supports input/output bit-widths and matrix bit-width in `mvmul`, while physical arrays for multi-precision devices are treated as transparent to software. The artifact config exposes `cell_precision`. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| ADC/DAC precision or sensing | **Parameter / costed in simulator config** | The example config includes `dac_resolution`, `dac_count`, `adc_resolution`, `adc_latency_cycle`, and `adc_count`. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json)) |
| Analog-to-digital or domain transition | **Implicit in ISA, parameterized in simulator** | The ISA document says matrix/vector kernel components may operate in analog but interfaces are digital; the simulator config exposes ADC/DAC-related timing/precision fields. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| Peripheral circuits as path nodes | **Parameter / costed, not instruction-level path nodes** | Config fields include sample-hold latency, ADC latency, DAC count/resolution, shift-adder latency, and output-buffer latency. These are hardware parameters rather than rewriteable IR nodes. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json)) |
| Partial-sum accumulation path | **Implicit / partly exposed through array groups and vector/transfer instructions** | PIMCOMP’s partitioning description says array-group MVM results of the same node must be accumulated and may require inter-core accumulation. PIMSIM-NN ISA provides vector arithmetic and communication operations that can express accumulation steps. ([arXiv](https://arxiv.org/pdf/2307.01475)) |
| Reconstruction / shift-add tree | **Parameter / hard-coded backend behavior** | The simulator config exposes `shift_adder_latency_cycle`, but the paper/artifact evidence checked here does not expose reconstruction as a compiler-rewriteable tree. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime state first-class for registers/local memory/ROB/events; batching as simulator/compiler mode; KV cache N/A** | The ISA defines registers, local/global memory, event registers, wait/sync, and send/recv; PIMCOMP-NN documents high-throughput batch pipeline and low-latency element pipeline; the PIMSIM config has simulation mode. KV cache and LLM serving state are not applicable to the demonstrated CNN/DNN inference scope. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| Value trajectory / flow path | **Implicit / approximated** | The path of a value is recoverable from instruction order, local/global memory addresses, send/recv, sync, NoC config, and component latencies, but the paper’s named abstraction centers on instructions and hardware resources rather than persistent value identities across analog/digital stages. ([arXiv](https://arxiv.org/pdf/2308.06449)) |

### 5.4 Axis D — rewrite object

The compiler/tool stack rewrites:

- **Operator graph**: ONNX is parsed into backend JSON by PIMCOMP-NN.
- **Hardware mapping**: layers/nodes/array groups are assigned to cores/crossbars.
- **Array binding**: `mvmul` refers to array groups, and mapping determines which arrays hold which matrix partitions.
- **Dataflow schedule**: PIMCOMP-NN schedules for high-throughput or low-latency modes.
- **Instruction stream**: backend output is a simulation instruction stream.
- **Numeric format**: bit-width fields exist through `setbw`, `mvmul` matrix bit-width, and config precision fields, but the paper does not present a type system for numeric rewrites. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

Legal transformations in the demonstrated framework include choosing layer/core packing policy, partitioning weight matrices into array groups, replicating weights, mapping groups to cores, selecting pipeline granularity, scheduling communication and computation, and varying simulator/hardware parameters such as ROB size and component latencies. The exploited equivalences are mainly placement/scheduling equivalences: the same DNN computation can be realized by different core mappings, replication strategies, and inter-layer pipeline granularities, provided dependencies, memory addresses, bit-width settings, and synchronization semantics are preserved. ([arXiv](https://arxiv.org/html/2402.18089v1))

The representation is especially well suited to backend scheduling, simulator coupling, and hardware-configuration sensitivity. Expressing transformations such as ADC retiming, analog partial-sum lifetime extension across operators, alternative reconstruction trees, or co-optimized analog/digital value routing would likely require an additional abstraction that attaches trajectory, domain, precision stage, and reconstruction metadata to values rather than only to instructions/config fields.

## 6. Technical mechanism reading

### ISA as the compiler/simulator contract

PIMSIM-NN’s key mechanism is the ISA boundary. The paper classifies instructions into matrix, vector, transfer, and scalar classes; matrix instructions control crossbars for MVMUL, transfer instructions are synchronized, and the assumed architecture has cores and global memory connected by an interconnection, with local memory accessible by matrix/vector/transfer instructions. ([arXiv](https://arxiv.org/html/2402.18089v1))

The separate ISA document makes that contract more concrete. It assumes DNN inference with trained weights programmed into PIM accelerators before inference, and targets CNNs and MLPs. It defines an abstract system of cores and global memory, with the weights stored in cores and inputs in global memory. Each core has its own instruction sequence and decoder; different cores execute asynchronously. The core contains scalar, PIM matrix, and vector units, plus instruction memory, register file, and local memory. The document states that analog-domain kernel components can exist inside matrix/vector units, while interfaces remain digital. ([arXiv](https://arxiv.org/pdf/2308.06449))

The most compiler-relevant ISA features are:

- **Array groups**: logical arrays can be grouped arbitrarily within a core; groups are generated by the toolchain and stored by hardware. `mvmul` uses a group index to invoke matrix-vector multiplication over the corresponding matrix partition. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **Bit-width state**: `setbw ibiw, obiw` sets input/output vector bit widths for subsequent matrix/vector instructions; `mvmul` also carries a matrix bit-width field. This is a compact numeric-format mechanism, though not a full type system. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **Communication and synchronization**: `send`/`recv` are synchronous inter-core local-memory transfers, while `wait`/`sync` provide event-register synchronization. The ISA places correctness responsibility for matched send/recv and synchronization on the toolchain. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **Static control**: the ISA document states there is no branch instruction and loops should be completely unrolled, making the backend contract closer to a static schedule/instruction trace than a general program. ([arXiv](https://arxiv.org/pdf/2308.06449))

### Compiler and mapping mechanism

The DATE paper’s compiler section is compact. It states that the compiler converts a DNN description to instructions for every core and is based on PIMCOMP. The two demonstrated mapping policies are:

1. **Utilization-first**: map layer weights to cores tightly; if a core has enough crossbars, a whole matrix is mapped there, otherwise a matrix is partially mapped according to available crossbars. This can place multiple layers’ weights on one core.
2. **Performance-first**: map one layer’s weights to unmapped cores, ensuring each core stores one layer’s weights. ([arXiv](https://arxiv.org/html/2402.18089v1))

The companion PIMCOMP-NN artifact gives the broader compiler mechanism: ONNX frontend → JSON model/topology → backend stages of node partition, weight replication, core mapping, and dataflow scheduling. It supports high-throughput batch pipeline and low-latency element pipeline modes, and can save intermediate info, verification info, and simulation instruction streams. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))

The PIMCOMP paper provides useful context for what PIMSIM-NN inherits: PIMCOMP maps convolution/FC nodes to MVM operations, partitions weight matrices into array groups according to crossbar size, and accumulates MVM results when array groups of the same node are distributed across cores. ([arXiv](https://arxiv.org/pdf/2307.01475))

### Simulator mechanism

The simulator mechanism is a hierarchical SystemC model. The paper states that it is cycle-by-cycle, configurable through architecture config, and modular. It models a chip with mesh NoC, cores with four execution units corresponding to the four ISA instruction types, local memory for vector/matrix intermediate results, matrix units containing crossbars, and parallel execution through a ROB plus dispatch unit that detects instruction conflicts. ([arXiv](https://arxiv.org/html/2402.18089v1))

The public README exposes the run interface:

```text
ChipTest path_to_program_instructions_file path_to_architecture_configuration_file
```

The documented example runs a compressed ResNet-18 instruction stream with a latency config, then prints progress and a simulation report including core count, simulation mode, simulation time, throughput, and average latency. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

The example JSON config is technically important because it reveals the simulator contract: core count, ROB size, crossbar array count and size, DAC/ADC resolution/count/latency, cell precision, shift-adder latency, memory timing, NoC mesh layout, and simulation mode are explicit parameters. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json))

### Cost model and calibration boundary

PIMSIM-NN exposes latency and power/energy-style parameters through configuration and reports latency/power/energy results at the paper level. The checked sources show configurable timing and precision parameters, but a calibration trail from physical measurements, SPICE, RTL, or silicon measurements to the example values was not found in the README/config evidence. The related PIM-Toolchain page separates PIMSIM-NN as the performance simulator and PIMACC as the simulator for accuracy under non-ideal effects such as quantization error, resistance error, and IR-drop. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))

### Workload and experiment assumptions

The paper’s evaluation uses CNN-style DNNs. For mapping and ROB studies it reports AlexNet, GoogLeNet, ResNet-18, and SqueezeNet; for MNSIM2.0 comparison it uses modified VGG-8, VGG-16, and ResNet-18 networks because the open MNSIM2.0 code did not support concat operations used in many modern DNNs. The simulator setting for the mapping/ROB experiment is 64 cores, 512 crossbars per core, 128×128 crossbars, and one shared ADC. ([arXiv](https://arxiv.org/html/2402.18089v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The instruction stream is the strongest reusable boundary

- **Observation:** The public simulator does not consume ONNX directly; it consumes a compressed instruction stream and architecture config. The README explicitly states that PIMCOMP-NN accepts ONNX and config as inputs and produces the instruction sequence for PIMSIM-NN. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **Why it matters for CIM compiler/IR work:** This makes PIMSIM-NN a useful case where the backend contract is more concrete than the frontend story. The stable object is not “a DNN graph” but “per-core instructions plus hardware config.”
- **Reusable lesson:** Future CIM IR stacks can treat instruction-stream serialization as a backend ABI: an upstream IR can lower into this ABI while preserving source-op provenance and resource mapping metadata.

### Insight 2 — Array groups are a compact logical-array abstraction

- **Observation:** The ISA’s array group hides physical decomposition—positive/negative arrays, multi-device precision, and physical array count—while naming the logical matrix resource used by `mvmul`. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **Why it matters for CIM compiler/IR work:** Array groups are a practical midpoint between graph nodes and circuit-level arrays. They are fine-grained enough for scheduling/mapping but coarse enough to stay independent of device implementation.
- **Reusable lesson:** A future IR could borrow “logical array group” as a typed resource object, then attach optional lower-level bit-slice/physical-array views when targeting a concrete macro.

### Insight 3 — Config files function as de facto hardware-resource IR

- **Observation:** The example config names crossbar dimensions, array count, cell precision, DAC/ADC parameters, memory timing, NoC layout, ROB size, and simulator mode in one JSON object. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json))
- **Why it matters for CIM compiler/IR work:** Many legality and cost decisions depend on values that are outside the instruction stream. A compiler needs these fields to determine partitioning, mapping, throughput/latency behavior, and backend feasibility.
- **Reusable lesson:** Treat architecture config as a typed, versioned IR dialect rather than an unstructured settings file. This would enable validation, provenance, and backend interchange.

### Insight 4 — Synchronization is a compiler responsibility

- **Observation:** The ISA defines synchronous `send`/`recv` and `wait`/`sync`, and states that the toolchain must generate correct code for matched communication and synchronization. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **Why it matters for CIM compiler/IR work:** Correctness is not only numerical; it includes inter-core rendezvous, buffer sufficiency, dependency ordering, and deadlock avoidance.
- **Reusable lesson:** CIM compiler IRs that lower to multi-core PIM backends should carry communication contracts explicitly: producer/consumer identity, payload size, memory location, event semantics, and synchronization proof obligations.

### Insight 5 — ROB sensitivity exposes backend scheduling hazards

- **Observation:** The paper varies ROB size and explains diminishing latency gains through structure hazards when subsequent instructions use the same crossbar as earlier instructions in the ROB. ([arXiv](https://arxiv.org/html/2402.18089v1))
- **Why it matters for CIM compiler/IR work:** Crossbar conflicts are not just hardware timing details; they are schedule legality/performance constraints that a compiler can reason about.
- **Reusable lesson:** A compiler-facing IR should model resource reservations for crossbars, transfer units, vector units, and memories so that schedule rewrites can be checked before simulation.

### Insight 6 — PIMSIM-NN and PIMACC suggest a split between performance and accuracy backends

- **Observation:** The PIM-Toolchain overview assigns latency/power/energy performance simulation to PIMSIM-NN and non-ideality/accuracy evaluation to PIMACC. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))
- **Why it matters for CIM compiler/IR work:** CIM compilation often needs both timing/resource cost and numerical-fidelity cost, but the two may be implemented by different tools.
- **Reusable lesson:** A future IR could expose a common value/resource trajectory that feeds multiple backend analyses: one for timing/energy, one for analog non-ideality and accuracy.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `wangxy-2000/pimsim-nn` public GitHub repository. The paper points to it, and the README describes it as a simulator for RRAM-/PIM-based neural-network accelerators that evaluates latency/throughput, power, and energy from instruction sequences and architecture configuration. ([arXiv](https://arxiv.org/html/2402.18089v1))
- **Companion compiler identifier:** `sunxt99/PIMCOMP-NN`, public GitHub repository. It provides ONNX frontend, backend compilation stages, verification, and simulation instruction output. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **License:** PIMSIM-NN license: **Unknown / not found in the checked pimsim-nn repository page or README**. The root file listing shown in the checked source includes doc, example, packages, src, tools, CMakeLists, and README, but no LICENSE file is visible. PIMCOMP-NN is Apache-2.0. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** C++/SystemC simulator source tree, CMake build, `ChipTest` executable workflow, compressed ResNet-18 example instruction stream, architecture config JSON, NoC config, docs/ISA/paper references, and dependencies such as SystemC, zlib, fmt, nlohmann/json, filesystem. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **What the artifact appears to omit:** ONNX frontend/compiler implementation in the pimsim-nn repository; it points users to PIMCOMP-NN. Full scripts/configs to regenerate all paper figures were not found in the checked README. License information for pimsim-nn was not found in the checked repository page. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **Minimal documented workflow:** Build with CMake, then run `ChipTest` from the build directory with `../example/resnet18.gz` and `../example/config/latency_config.json`. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **Whether paper figures appear reproducible from artifact:** **Partial / Unknown.** The artifact includes a built-in ResNet-18 example and config, but the paper’s mapping comparison also includes AlexNet, GoogLeNet, and SqueezeNet, and the MNSIM2.0 comparison uses modified VGG/ResNet networks. The checked pimsim-nn README documents one built-in ResNet-18 example rather than a figure-reproduction suite. ([arXiv](https://arxiv.org/html/2402.18089v1))
- **Release status:** No releases were visible on the checked GitHub releases page. ([GitHub](https://github.com/wangxy-2000/pimsim-nn/releases?utm_source=chatgpt.com))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | Simulator inputs are documented as architecture config, NoC config, and program instruction file; compressed instruction schema is less directly documented in README. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Intermediate representation serialized | **Partial** | PIMCOMP-NN can emit IntermediateInfo.json, VerificationInfo.json, and SimulationInfo.gz; pimsim-nn consumes compressed instruction streams. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) |
| Mapping decisions inspectable | **Partial** | Paper describes mapping policies; PIMCOMP-NN can save intermediate info, but exact mapping-state schema is not fully specified in the checked README. ([arXiv](https://arxiv.org/html/2402.18089v1)) |
| Schedule inspectable | **Partial** | Instruction stream is inspectable with appropriate tooling; PIMCOMP-NN documents dataflow scheduling and simulation output, but pimsim-nn’s compressed example is not directly human-readable. |
| Hardware config explicit | **Yes** | Example config exposes core, crossbar, memory, ADC/DAC, NoC, and simulator settings. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json)) |
| Precision / bit-slice assumptions explicit | **Partial** | ISA exposes bit-width fields and config exposes cell precision/ADC/DAC precision; physical bit-slice mapping is treated as transparent to software. ([arXiv](https://arxiv.org/pdf/2308.06449)) |
| Cost model inspectable | **Partial** | Latency/power parameters are in config and simulator reports metrics; calibration source for example values is Unknown / not found in checked README. |
| Simulator backend documented | **Yes** | README documents build/run interface, architecture summary, simulator inputs, modes, and output format. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Generated code / instruction stream inspectable | **Partial** | PIMCOMP-NN can save SimulationInfo.gz and verification info; the pimsim-nn example is a compressed `.gz` instruction sequence. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Provenance from source op to backend action | **Partial** | PIMCOMP-NN frontend/backend stages and optional intermediate/verification files can support provenance, but the pimsim-nn README alone does not expose a source-op-to-instruction provenance format. |
| Reproduction scripts available | **Partial / Unknown** | Build/run example exists for ResNet-18; paper-figure reproduction scripts were not found in checked pimsim-nn README. ([GitHub](https://github.com/wangxy-2000/pimsim-nn)) |
| Calibration source documented | **Unknown / not found in checked sources** | Component latency/power values are configurable; measurement/SPICE/RTL/silicon provenance was not found in the checked README/config evidence. |

### 8.3 Integration helper

- **As frontend:** PIMSIM-NN itself is not the direct frontend. Integration through the documented stack should use PIMCOMP-NN’s ONNX frontend, which converts ONNX models to backend JSON and then to instruction streams. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN))
- **As IR inspiration:** The most useful abstractions are ISA instructions, logical array groups, local/global memory addressing, bit-width setting, synchronous transfer, event synchronization, and JSON hardware-resource configuration. ([arXiv](https://arxiv.org/pdf/2308.06449))
- **As mapper/scheduler:** Reuse would most naturally start from PIMCOMP-NN’s node partition, weight replication, core mapping, and dataflow scheduling stages; the DATE paper’s utilization-first/performance-first policies are compact examples for simulator sensitivity studies. ([arXiv](https://arxiv.org/html/2402.18089v1))
- **As cost model:** PIMSIM-NN can be wrapped as a backend timing/power/energy evaluator parameterized by architecture JSON. A small adapter would need to emit compatible instruction streams and configs, then parse simulator reports.
- **As backend:** This is the strongest integration role. A future CIM compiler could lower its backend IR to PIMSIM-NN instructions and use the simulator as an execution/cost oracle.
- **As benchmark:** The built-in ResNet-18 example and PIMCOMP-NN’s listed validated models are useful starting points, though corpus-grade benchmarking would benefit from pinning model files, configs, compiler flags, and simulator versions. ([GitHub](https://github.com/wangxy-2000/pimsim-nn))
- **As validation source:** PIMSIM-NN is useful for simulator-backed timing/resource validation. For analog non-ideality or accuracy calibration, the same toolchain points to PIMACC rather than PIMSIM-NN. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain))

**Integration effort estimate: Medium.**  
Integration would be most direct through the instruction/config boundary: emit PIMSIM-NN-compatible compressed instruction streams plus JSON configs, then call `ChipTest`. The main effort is not conceptual but infrastructural: documenting or reusing the instruction-stream serializer, preserving source-op provenance through lowering, and versioning the config schema. For end-to-end ONNX flows, reuse should route through PIMCOMP-NN or a compatible adapter.

## 9. Relation to a value-trajectory CIM IR project

PIMSIM-NN provides useful ingredients for a value-trajectory IR, especially instruction-level naming of local/global memory locations, array groups, bit-width-setting instructions, inter-core send/recv, wait/sync, and hardware-resource timing parameters. The closest approximation to trajectory semantics is the sequence of `mvmul`, vector, memory, transfer, and synchronization instructions over local/global memory addresses and array groups. ([arXiv](https://arxiv.org/pdf/2308.06449))

Against a future IR that makes value flow first-class:

- **Does the paper name the path a value takes through CIM resources?**  
  Partially. It names core, local memory, global memory, matrix unit/crossbars, transfer unit, NoC, and instruction actions. The trajectory is reconstructible from instruction operands and simulator config, but the named object is an instruction/resource sequence rather than a persistent value-flow object.

- **Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?**  
  The demonstrated abstraction preserves address-level identity across instructions and synchronization. It does not expose a separate trajectory object for analog partial sums, ADC boundary, shift-add reconstruction, digital accumulation, and storage. Shift-adder and ADC timing appear as config parameters, while accumulation is expressed through scheduled operations and data movement. ([GitHub](https://raw.githubusercontent.com/wangxy-2000/pimsim-nn/main/example/config/latency_config.json))

- **Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?**  
  Precision appears through `setbw`, `mvmul` matrix bit-width, `cell_precision`, DAC/ADC resolution, and related config fields. Placement appears through array-group/core mapping. Domain transition is acknowledged by the ISA’s analog-kernel/digital-interface statement and by ADC/DAC config fields. These are parameters and instruction fields rather than a unified type system. ([arXiv](https://arxiv.org/pdf/2308.06449))

- **Could it express trajectory rewrites?**  
  The current abstraction could approximate some trajectory changes by changing mapping, instruction order, send/recv placement, local-memory addresses, and hardware config. A trajectory-level extension would likely attach value identity, domain, precision stage, array group, ADC/sense event, reconstruction state, and reduction tree metadata to values or instruction results. That would make it more natural to express rewrites such as fusing reconstruction with downstream reduction, delaying ADC conversion, carrying bit-sliced partial sums across operator boundaries, changing reduction-tree structure, routing through alternative peripheral paths, or co-optimizing data movement and numeric reconstruction.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PIMCOMP / PIMCOMP-NN** | ONNX-to-crossbar-PIM DNN compilation, node partition, weight replication, core mapping, dataflow scheduling, instruction generation | PIMCOMP is the compiler/mapping side; PIMSIM-NN is the simulator/backend side. The public PIMSIM-NN README explicitly points to PIMCOMP-NN for instruction generation. ([GitHub](https://github.com/sunxt99/PIMCOMP-NN)) | Classify PIMSIM-NN and PIMCOMP-NN separately but link them as a compiler/simulator pair with a shared ISA boundary. |
| **PIMSYN-NN** | Same ecosystem and CNN/PIM accelerator target; uses ONNX, architecture parameters, and DSE | PIMSYN-NN synthesizes architecture instances and computation dataflow under constraints; PIMSIM-NN simulates a given architecture plus instruction sequence. ([GitHub](https://github.com/lixixi-jook/PIMSYN-NN)) | PIMSYN-NN is closer to A1/A3 design generation; PIMSIM-NN is closer to A2/A4 backend evaluation. |
| **MNSIM2.0** | Behavior-level PIM simulator for performance/accuracy exploration | PIMSIM-NN emphasizes ISA-based decoupling and synchronous communication; the paper’s comparison argues MNSIM2.0’s communication model is more asynchronous/idealized for the tested residual case. MNSIM2.0’s public README describes modeling HW performance and NN computing accuracy. ([arXiv](https://arxiv.org/html/2402.18089v1)) | Good contrast for corpus: dataflow/behavior simulator vs instruction-stream simulator boundary. |
| **PUMA** | Memristor-crossbar accelerator with specialized ISA, compiler, and simulator | PUMA is an architecture plus compiler/simulator for broad ML inference workloads; PIMSIM-NN is a simulation framework around a more general PIM DNN ISA/config boundary and companion compiler ecosystem. ([arXiv](https://arxiv.org/abs/1901.10351)) | Closest historical ISA/compiler/simulator precedent; compare by “what the ISA names” and how hardware resources are exposed. |
| **PIM-Toolchain / PIMACC** | Toolchain-level view of architecture synthesis, compilation, performance simulation, and accuracy simulation | PIM-Toolchain positions PIMSIM-NN as the latency/power/energy simulator and PIMACC as the non-ideality/accuracy simulator. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain)) | Corpus should record that PIMSIM-NN covers performance simulation; non-ideality/accuracy belongs to a sibling backend in the same toolchain. |

## 11. Corpus-ready final takeaway

- PIMSIM-NN’s core contribution is an **ISA-based simulator interface** for crossbar-based PIM DNN inference: compiler output is serialized as per-core instruction streams and consumed by a configurable SystemC simulator.
- The strongest reusable stack layer is the **backend/simulator contract**: compressed instruction stream + JSON architecture/NoC configuration → latency/throughput/power/energy-style report.
- The demonstrated paper scope is **static CNN/DNN inference** on a hierarchical crossbar-PIM accelerator model with cores, local/global memory, mesh NoC, matrix/vector/transfer/scalar units, and ROB-based parallelism.
- First-class objects include **array groups, matrix/vector/transfer/scalar instructions, local/global memory addresses, core/NoC resources, ROB, ADC/DAC parameters, cell precision, and shift-adder latency**.
- The “hidden IR” is distributed across **PIMCOMP-NN intermediate/simulation outputs, the ISA instruction stream, mapping state, and simulator config** rather than embodied in a single named compiler IR.
- Artifact status is **public artifact found** for pimsim-nn; the repository documents build/run and includes a ResNet-18 instruction/config example. PIMSIM-NN license is **Unknown / not found in checked sources**; PIMCOMP-NN is Apache-2.0.
- Integration is most direct by wrapping PIMSIM-NN as a **backend cost oracle** and using or emulating PIMCOMP-NN’s instruction serializer.
- For value-trajectory IR research, PIMSIM-NN is a useful reference for **resource/instruction contracts**, but trajectory-level rewrites would add explicit value identity, domain-transition, bit-slice, sensing, reconstruction, and reduction metadata.

## 12. Suggested metadata entry

```yaml
paper: "PIMSIM-NN: An ISA-based Simulation Framework for Processing-in-Memory Accelerators"
year: 2024
venue: "DATE 2024 Late Breaking Results"
authors_or_group: "Xinyu Wang, Xiaotian Sun, Yinhe Han, Xiaoming Chen"
technology:
  - RRAM-CIM
  - analog-CIM
  - crossbar-PIM
  - DNN-inference-accelerator
workloads:
  - AlexNet
  - GoogLeNet
  - ResNet-18
  - SqueezeNet
  - VGG-8
  - VGG-16
axis_A:
  primary:
    - A2_simulator_cost_model
    - A4_ISA_compiler_backend_boundary
  secondary:
    - A3_mapping_scheduling_DSE
    - A5_narrow_end_to_end_codesign
axis_B:
  - B5_instruction_meta_op_ISA
  - B1_config_as_IR
  - B4_hardware_resource_IR
  - B2_graph_as_IR_delegated_to_PIMCOMP
  - B7_runtime_state_backend_local
axis_C_first_class_objects:
  - instruction_stream
  - array_group
  - core
  - local_memory
  - global_memory
  - matrix_execution_unit
  - vector_execution_unit
  - transfer_execution_unit
  - scalar_execution_unit
  - NoC_mesh_config
  - ROB
  - DAC_ADC_parameters
  - cell_precision
  - shift_adder_latency
axis_D_rewrite_objects:
  - operator_graph_lowering
  - node_partition
  - weight_replication
  - core_mapping
  - array_group_binding
  - dataflow_schedule
  - instruction_stream
  - numeric_bitwidth_fields
artifact:
  status: "public artifact found"
  url: "GitHub repository identifier: wangxy-2000/pimsim-nn"
  companion_compiler: "GitHub repository identifier: sunxt99/PIMCOMP-NN"
  license: "PIMSIM-NN: Unknown / not found in checked sources; PIMCOMP-NN: Apache-2.0"
  last_checked: "2026-05-15"
integration_roles:
  - backend
  - cost_model
  - benchmark
  - IR_inspiration
  - mapper_scheduler_via_PIMCOMP
reproducibility_level: medium
trajectory_IR_relevance: medium
notes:
  - "Best viewed as an ISA/simulator boundary contribution rather than a standalone general compiler IR."
  - "Artifact exposes simulator inputs and a ResNet-18 example; complete paper-figure reproduction workflow was not found in checked README."
  - "Value trajectory is implicit in instruction/address/resource sequences and config parameters."
```