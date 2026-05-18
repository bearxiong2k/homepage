# PUMA — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with A4/A3/A2 secondary roles | PUMA couples a hybrid CMOS–memristor microarchitecture, specialized ISA, compiler, and simulator for ML inference. The paper’s stack boundary is defined by lowering model graphs into per-core/per-tile PUMA assembly and evaluating that instruction stream in PUMAsim. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Middle-layer style, Axis B | **B2 graph-as-IR**, **B4 hardware-resource IR**, **B5 instruction/meta-op/ISA**, partial **B1 config-as-IR**, partial **B6 accuracy/nonideality modeling**, small **B7 runtime-state abstraction** | The compiler builds a graph from a C++/ONNX-facing programming interface, partitions it over MVMUs/cores/tiles, schedules it, allocates registers, and emits PUMA assembly. Hardware configuration and precision assumptions are explicit in the paper and simulator configuration workflow, while valid/count and FIFO state appear as architectural synchronization objects. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| First-class CIM objects, Axis C | MVMU/crossbar, core/tile/node hierarchy, XbarIn/XbarOut registers, DAC/ADC boundary, 2-bit device / 16-bit bit-sliced MVM, MVM mask, filter/stride input-shuffle operands, shared memory valid/count attributes, receive FIFO IDs, per-core/per-tile instruction streams | These objects are named in the architecture, ISA, compiler, and simulator descriptions rather than appearing solely as background device assumptions. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Rewrite object, Axis D | **Operator graph → hardware mapping → scheduled instruction stream**, plus register allocation, data movement insertion, MVM coalescing, and fixed numeric-format/precision choices | The compiler rewrites the model graph by tiling tensors to MVMU-sized units, partitioning subgraphs across MVMUs/cores/tiles, inserting load/store and send/receive operations, coalescing independent MVMs, and allocating XbarIn/XbarOut/general-purpose registers. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Best corpus tags | `hybrid-CMOS-memristor`, `analog-CIM`, `ISA`, `compiler-mapping`, `graph-partitioning`, `per-core-codegen`, `PUMAsim`, `DNN-inference`, `MVM`, `bit-slicing` | Tags reflect the named stack boundary and demonstrated workloads. |
| Closest comparison baselines | ISAAC, PRIME, Fujiki et al. ISA-programmable memristor accelerator, Brainwave, PIMCOMP, DNN+NeuroSim / CrossSim | ISAAC and PRIME are close on ReRAM/crossbar inference architecture; Fujiki et al. is close on ISA-programmable memristor acceleration; Brainwave is close on spatial ISA/control granularity; PIMCOMP is close on PIM compiler mapping; NeuroSim/CrossSim are close simulator/cost/accuracy baselines. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |

## 2. One-paragraph public summary

PUMA is an ASPLOS 2019 hardware–software co-design for ML inference on a hybrid CMOS–memristor spatial accelerator. Its core contribution is a concrete, ISA-programmable CIM backend: a core/tile/node microarchitecture with memristor MVM units and digital functional units, a PUMA ISA with MVM, vector, memory, communication, and control instructions, a compiler that builds and partitions a model graph into per-core/per-tile assembly, and PUMAsim for functionality/timing/power evaluation. The demonstrated setting is static, MVM-heavy DNN inference—MLPs, LSTMs, and CNNs—with 16-bit fixed-point operations realized over conservative 2-bit memristor cells via bit-slicing. For CIM compiler/IR research, PUMA is most useful as a concrete example of a narrow end-to-end stack where graph partitioning, resource binding, inter-tile communication, and instruction scheduling are made compiler-visible for one architecture, while a more portable CIM IR would likely factor those internal states into explicit, verifiable, backend-independent objects. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| PUMA provides a programmable hybrid CMOS–memristor accelerator exposed through a specialized ISA. | Abstract and introduction | Architecture description, ISA table, simulator-backed experiments | The paper defines a core with MVMU, DAC/ADC boundary, XbarIn/XbarOut registers, VFU/SFU/MU, and an ISA including MVM, vector ALU, memory, send/receive, and branch instructions. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Demonstrated as a PUMA-specific ISA-programmable inference accelerator, rather than as a backend-agnostic CIM programming model. |
| The compiler translates high-level code to PUMA ISA and scales to many spatial cores. | Abstract, Section 5 | Compiler pass description, code/artifact | The paper describes a runtime C++ compiler interface, ONNX bindings, graph construction, graph partitioning, scheduling, register allocation, and per-core/per-tile assembly output. The compiler repository exposes `include`, `src`, and `test` directories with example programs. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | The reusable boundary is clearest at the C++/example-program interface and generated PUMA assembly; the internal graph/placement state is described but not presented as a stable interchange IR. |
| Graph partitioning and scheduling reduce data movement, register pressure, and MVM serialization. | Section 5 and Table 8 | Pass description, experiment | The compiler tiles tensors to MVMU-sized 2D chunks, maps subgraphs hierarchically to MVMUs/cores/tiles, inserts load/store and send/receive operations, uses reverse postorder scheduling, performs MVM coalescing, and reports optimization effects in Table 8. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Demonstrated for the paper’s PUMA architecture and benchmark set; portability would require extracting placement, memory, FIFO, and schedule decisions into a reusable schema. |
| PUMAsim provides detailed functionality/timing/power simulation. | Contribution list and Section 6.1 | Simulator description, public code/artifact | PUMAsim runs compiled PUMA ISA, produces detailed execution traces, and incorporates component power/timing models. The public simulator README documents Python 2.7 setup, `dpe.py` execution, compiled-model workflow, and trace outputs such as `hardware_stats.txt`. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Simulator-backed evidence is strong for architectural evaluation; reproducing every paper figure from the public artifact appears to require additional benchmark setup, model weights, calibration assumptions, and manual configuration. |
| PUMA improves energy and latency over CPUs/GPUs/TPU and has modest programmability overhead relative to ISAAC. | Abstract and Section 7 | Experiment | The abstract reports up to 2,446× energy and 66× latency improvements over GPUs; Table 6 compares TPU/ISAAC/PUMA; Section 7.4.2 reports 20.7% lower power efficiency and 29.2% lower area efficiency than ISAAC due to programmability overhead. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Evaluated through simulator-backed PUMA results and measured/platform-modeled baselines for the specified 2019 benchmark set and technology assumptions. |
| 2-bit memristor cells can support accurate 16-bit fixed-point inference through bit slicing. | Sections 3.2.1, 6.1, 7.6 | Architecture mechanism, precision/noise experiment | The design uses 2-bit devices and combines eight crossbars for 16-bit MVM; the evaluation assumes 16-bit fixed point and explores memristor bit precision/noise effects in Figure 13. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Precision handling is evidenced as a fixed architectural/numeric design point and sensitivity study; it is not exposed as a general type system for arbitrary precision propagation. |
| The compiler and simulator are open-sourced. | Introduction and repositories | Code/artifact, documentation | The paper states that simulator and compiler were open-sourced. Public repositories exist for the simulator and compiler; the simulator has an MIT license and a v1.0 release, while the compiler repository is archived and read-only as of Oct. 13, 2025. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Artifact-level evidence supports availability of source and examples. Full figure reproduction is partial/unclear from the checked documentation. |

## 4. Stack anatomy

```text
Input / frontend:
  Native runtime C++ library objects such as Model, InputVector/InVector, OutVector, ConstMatrix, vector streams, plus paper-described ONNX bindings. This is a graph-building frontend; the public compiler examples document C++ test programs and execution that generates PUMA assembly. Serialized: source-level C++ examples; inspectable: yes; documented: partial; reusable: most directly through examples and API headers. 

Middle representation:
  A compiler-built model graph of MVM and non-MVM operations. The graph is paper-visible in Figures 7–9 and artifact-visible through debug .dot/PDF generation in the test README. Serialized: partially, via generated debug dot/PDF artifacts; inspectable: partial; documented: partial; reusable: mainly as internal compiler state. 

Mapping or scheduling state:
  Tensor tiles sized to MVMUs, hierarchical placement onto MVMUs/cores/tiles, inserted load/store and send/receive operations, FIFO ID assignment, shared-memory allocation, reverse-postorder linearization, MVM coalescing, and register allocation over XbarIn/XbarOut/general-purpose register classes. Serialized: indirectly in generated PUMA assembly and reports; inspectable: partial; documented: paper-level; reusable: medium with code adaptation. 

Hardware abstraction:
  PUMA node/tile/core hierarchy; MVMUs with 128×128 dimensions in the evaluated configuration; XbarIn/XbarOut registers; DAC/ADC arrays; temporal SIMD VFU; SFU; MU; tile shared memory; valid/count attribute buffer; receive FIFOs; on-chip network. Serialized/configured in simulator configuration files according to the public workflow; inspectable: yes/partial; reusable: strongest as a PUMA backend target. 

Backend / simulator / codegen:
  Codegen emits per-tile and per-core `.puma` assembly-like instruction streams; PUMAsim executes compiled models using `dpe.py`, with manual config selection and `num_tile_compute` updates documented in the artifact. Serialized: yes, as generated PUMA assembly and trace/stat files; inspectable: yes; documented: partial. 

Output artifact:
  PUMA assembly files, simulator input folders, execution traces, hardware statistics, cycle counts, energy/access distributions, and compiler reports. The test README documents assembly generation and `<test-name>-report.out`; the simulator how-to shows `hardware_stats.txt` contents. Serialized: yes; inspectable: yes; reusable: partial because of older Python/toolchain and manual workflow. 

Evaluation loop:
  Compile ML models to PUMA ISA, run them in PUMAsim, combine timing/power models for PUMA components, and compare to CPU/GPU/TPU/ISAAC baselines over MLP/LSTM/CNN workloads. Paper figures are simulator-backed; artifact-level reproduction of all plots is not fully documented in the checked README/how-to.
```

The compiler frontend and graph partitioning flow are described in Section 5, while the artifact documentation states that examples can be compiled and executed to generate PUMA assembly, reports, and debug illustrations. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) The simulator workflow documents copying generated assembly into the simulator tree, selecting example config files, updating tile counts, running `python dpe.py`, and reading trace outputs such as `hardware_stats.txt`. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/how_to_run.md))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the compiler’s internal model graph, tensor tiling, MVMU/core/tile placement, FIFO/memory allocation, coalesced MVM sets, register allocation state, and simulator configuration. The paper foregrounds the PUMA ISA as the visible contract, while the reusable semantics are most visible in the graph-partitioning and codegen boundary: the point where a graph of MVM/vector/data-movement operations becomes per-core/per-tile instruction streams. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — narrow end-to-end co-design.** PUMA owns a vertically integrated slice: architecture, ISA, compiler, simulator, and evaluation methodology for one hybrid CMOS–memristor inference accelerator. The input is a high-level model graph built through C++/ONNX-facing interfaces, and the output is per-core/per-tile PUMA assembly evaluated in PUMAsim. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**Secondary: A4 — explicit IR / dialect / ISA compiler stack.** The PUMA ISA is explicit and central. It names MVM, ALU, memory, communication, and branch instructions, with operands such as MVM mask, filter/stride, vector width, FIFO ID, and memory addresses. The exposed compiler target is assembly for a specific ISA rather than a general CIM dialect. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**Secondary: A3 — mapping / scheduling / DSE framework.** The compiler performs graph partitioning, memory allocation, FIFO assignment, MVM coalescing, deadlock-aware scheduling, and register allocation. The paper also includes design-space sweeps over MVMU dimensions, MVMUs per core, VFU width, cores per tile, and register-file size. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**Secondary: A2 — simulator & cost model.** PUMAsim is a detailed architecture simulator with functionality/timing/power models; the paper reports RTL-derived datapath area/power, Cacti memory models, Booksim/Orion network modeling, ISAAC-derived MVMU models, and SAR ADC modeling. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is a model graph built at runtime by executing the C++ model description. Decisions made there include operator composition, MVM/non-MVM dependencies, and vector/matrix stream relationships. The compiler then partitions this graph and linearizes it. A single stable graph schema for upstream tools is not documented; the closest inspectable form is debug `.dot`/PDF generation and compiler reports. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**B4 Hardware-resource IR.**  
The mapping state binds graph partitions to MVMUs, cores, and tiles; it also allocates shared memory and FIFO IDs. Decisions remaining embedded in compiler/backend logic include exact placement heuristics, memory reuse, FIFO virtualization, and deadlock-safe global ordering. The representation is concrete enough for PUMA codegen but would need a schema to become an upstream-verifiable hardware-resource IR. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**B5 Instruction / meta-op / ISA.**  
The PUMA ISA is the clearest serialized backend object. It includes MVM, vector ALU, scalar ALU, copy, load/store, send/receive, jump, and branch instructions; codegen emits `.puma` files for tiles and cores. This is the strongest reusable interface if another tool wants to target PUMAsim directly. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**B1 Config-as-IR, partial.**  
Simulator configuration files carry hardware/backend settings such as number of compute tiles and number of matrices per core. The workflow requires selecting example config files and editing `num_tile_compute` / `num_matrix`, so configuration acts as part of the backend contract rather than a typed compiler IR. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/how_to_run.md))

**B6 Accuracy / nonideality modeling, partial.**  
The paper includes precision/noise sensitivity for memristor bit precision and uses 16-bit fixed-point operations over 2-bit cells. This supplies useful accuracy-model ingredients, but precision is treated as an evaluated design assumption rather than a first-class rewriteable numeric type throughout the compiler. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**B7 Runtime-state abstraction, limited but interesting.**  
The valid/count attributes for shared-memory entries and the receive FIFO IDs are named runtime state objects used for synchronization and communication ordering. They are architectural/compiler-visible enough to matter for scheduling and deadlock avoidance. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class** | PUMA defines MVMUs with memristor crossbars, XbarIn/XbarOut registers, and core/tile/node hierarchy; evaluated MVMU dimension is 128×128. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Bit-slicing / bit significance | **First-class architectural mechanism; parameterized in evaluation** | The paper uses 2-bit devices and realizes 16-bit MVM by combining eight crossbars via bit-slicing. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| ADC/DAC precision or sensing | **First-class/costed hardware boundary** | The MVMU includes DAC/ADC arrays; ADCs convert output currents to digital values, and the model uses SAR ADC data from survey/analysis sources. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Analog-to-digital or domain transition | **First-class at architecture level, implicit in compiler types** | XbarIn registers drive DACs; ADC outputs are stored in XbarOut registers, making the analog–digital boundary explicit in hardware and ISA register classes. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Peripheral circuits as path nodes | **Costed/parameterized** | DACs, ADCs, integrators, register files, VFU, SFU, MU, shared memory, network, and receive buffer appear in hardware tables and simulator models. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Partial-sum accumulation path | **First-class for partitioned MVM communication/aggregation; implicit for analog summation** | The paper names partial MVM aggregation across cores/tiles and inserts communication/synchronization for it; within-crossbar current summation is part of the MVMU model. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Reconstruction / shift-add tree | **First-class in architecture diagram; hard-wired in compiler abstraction** | Figure 2 shows shift-and-add after bit-sliced crossbars; the ISA exposes a full 16-bit MVM as a single MVM instruction, hiding the reconstruction inside the MVMU abstraction. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Masks/FIFOs/valid-count first-class; KV cache not applicable; batching evaluated but not a runtime IR object; sparsity not central** | MVM mask is an ISA operand; shared memory has valid/count attributes; send/receive use FIFO IDs; batch sizes are evaluated but not modeled as a dynamic IR state. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Value trajectory / flow path | **Approximated through placement + instructions + simulator trace** | The path from graph value to registers, MVMU, memory, FIFO, and tile communication is represented through generated instructions and simulator execution traces, but value identity is mainly implicit across backend actions. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |

### 5.4 Axis D — rewrite object

PUMA rewrites an **operator graph** into a **hardware mapping** and then into an **instruction stream**. The concrete transformations are:

- tensor tiling into MVMU-sized 2D chunks;
- hierarchical binding of MVM graph tiles to MVMUs, cores, and tiles;
- data movement insertion across cores and tiles;
- shared-memory allocation and FIFO ID assignment;
- reverse-postorder scheduling to reduce live ranges;
- MVM coalescing to activate multiple MVMUs from one instruction;
- deadlock-aware global linearization;
- register allocation across XbarIn, XbarOut, and general-purpose registers;
- spilling to general-purpose registers or shared memory when needed. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

The legal transformations preserve graph data dependencies, hardware placement legality, blocking communication order, register class constraints, and the static weight mapping assumption. The equivalences exploited are mostly scheduling and partitioning equivalences: different topological linearizations of the same graph, equivalent placements with different communication cost, and independent MVMs that can be coalesced into a masked multi-MVMU instruction. The representation is especially well suited to static, feed-forward, MVM-heavy inference graphs; expressing dynamic sparsity, value-dependent control, alternative analog sensing paths, or cross-operator bit-sliced partial-sum reuse would likely require an added abstraction for value trajectory, numeric stage, and runtime state.

## 6. Technical mechanism reading

### 6.1 Hardware mechanism: MVMU plus compact instruction control

PUMA starts from the observation that ML inference workloads are dominated by MVM operations but also require nonlinear, linear, transcendental, memory, and control operations. The core therefore combines analog MVMUs with a small in-order instruction pipeline, VFU, SFU, memory unit, and register files. The MVMU places constant weights in memristor conductances and uses DACs to drive input voltages and ADCs to capture output currents as digital XbarOut values. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

The precision design is central: realizable cells are assumed to provide 2–6 bits, PUMA conservatively uses 2-bit devices, and a 16-bit MVM is built from eight co-located bit-sliced crossbars. The ISA hides this detail by exposing a single 16-bit MVM instruction. This is a useful compiler boundary: the compiler sees an MVMU-level matrix-vector operation, while the backend owns bit-slice reconstruction and peripheral cost. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 6.2 ISA mechanism: MVM, vector, memory, communication, control

The ISA is a compact backend contract. MVM has a mask operand that can activate multiple MVMUs; filter/stride operands support input shuffling for convolutional reuse; vector ALU instructions carry vector width; load/store and send/receive represent intra-tile and inter-tile movement; branch and jump support compact CNN-style control flow. Instructions are seven bytes wide to support long operands and temporal SIMD vector width. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 6.3 Compiler mechanism: graph partitioning into resource-bound subgraphs

The frontend is a runtime C++ library: users create a model, declare input/output vectors and constant matrices, compose expressions, and call compile. The compiler builds a model graph, divides tensors into 2D MVMU-sized tiles, partitions graph pieces hierarchically to MVMUs/cores/tiles, and inserts explicit load/store and send/receive operations. Placement prioritizes MVMUs feeding the same outputs, then sharing the same inputs, then producer-consumer relationships. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

This compiler is not just a code emitter; it materializes PUMA’s spatial dataflow. Crossbar writes are configuration-time events, so runtime execution routes activations and partial results between fixed weight locations. That makes placement and communication insertion the central compiler problem. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 6.4 Scheduling and register allocation

Scheduling is framed around three constraints: reduce register pressure, capture MVM parallelism, and avoid deadlock. Reverse postorder scheduling consumes values soon after production; MVM coalescing fuses independent MVMs onto different MVMUs; and global graph linearization prevents cycles caused by blocking communication. Register allocation is split across XbarIn, XbarOut, and general-purpose register classes, with spills to general-purpose registers or shared memory depending on which class overflows. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 6.5 Simulator/cost mechanism

PUMAsim executes compiled PUMA ISA and reports traces. The paper’s evaluation combines RTL-derived datapath area/power, Cacti memory modeling, Booksim/Orion network modeling, ISAAC-derived MVMU models, memristor resistance/read-voltage assumptions, and SAR ADC modeling. The evaluated configuration includes 8 cores per tile, 2 MVMUs per core, 128×128 MVMUs, 64 KB tile data memory, 16 receive FIFOs, and 138 tiles per node. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

### 6.6 Workload and numeric assumptions

The evaluation targets inference, primarily MLPs, LSTMs for NMT/language modeling, and CNNs such as VGG16/VGG19. The workload table ranges from 5M to 856M parameters and uses sigmoid/tanh/log-softmax/ReLU functions depending on the model. The numeric setting is 16-bit fixed point, supported via 2-bit memristor cells and bit slicing. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — PUMA’s visible ISA is the stable backend contract

- **Observation:** The PUMA compiler ultimately emits per-core and per-tile assembly, and the simulator consumes compiled PUMA ISA. The codegen path emits `.puma` files for tiles and cores, with operations such as `mvm`, `alu`, `load`, `store`, `send`, and `receive`. ([GitHub](https://github.com/illinois-impact/puma-compiler/raw/refs/heads/master/src/codegen.cpp))
- **Why it matters for CIM compiler/IR work:** The ISA is the clearest serialization boundary. A future IR could target PUMA by lowering to this instruction set, but a richer upstream IR would need to represent placement, FIFO, and register decisions before codegen.
- **Reusable lesson:** Treat architecture-specific ISA as a backend dialect, and make the pre-ISA placement/schedule state explicit if cross-backend reuse is desired.

### Insight 2 — The compiler makes communication a first-order lowering step

- **Observation:** After graph partitioning, the compiler inserts load/store operations across cores, allocates shared memory, inserts send/receive operations across tiles, assigns FIFO IDs, and ensures FIFO conflicts are avoided. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))
- **Why it matters for CIM compiler/IR work:** CIM compilers often focus on array mapping, but PUMA shows that communication legality and synchronization can dominate the backend contract once weights are statically placed in arrays.
- **Reusable lesson:** A CIM IR should separate compute placement from communication/synchronization placement and should expose FIFO/memory-state resources when the hardware uses blocking producer-consumer flow.

### Insight 3 — Bit slicing is hidden behind an MVM instruction, which simplifies programming but narrows numeric rewrites

- **Observation:** The architecture co-locates eight 2-bit crossbars for one 16-bit MVM and exposes that composite operation as one ISA-level MVM. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))
- **Why it matters for CIM compiler/IR work:** This is a clean backend abstraction for fixed 16-bit inference, but it compresses bit significance, reconstruction, and ADC behavior into the MVMU.
- **Reusable lesson:** A future IR could borrow PUMA’s “composite MVM” abstraction while adding optional type-like metadata for bit slice, ADC stage, and reconstruction path.

### Insight 4 — Deadlock avoidance is an IR-level issue, not just a simulator issue

- **Observation:** Because communication across cores is blocking, independent per-core linearization can introduce control cycles. PUMA linearizes the entire graph at once and then places instructions into per-core/per-tile sequences to maintain a globally consistent order. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))
- **Why it matters for CIM compiler/IR work:** Once a CIM backend uses blocking queues, FIFOs, or valid/count memory state, schedule legality includes distributed-system constraints.
- **Reusable lesson:** A verifier for CIM mappings should check not only data dependencies but also communication-cycle freedom under the target’s blocking semantics.

### Insight 5 — PUMAsim exposes the practical backend contract more concretely than the high-level compiler diagram

- **Observation:** The simulator workflow requires generated assembly, simulator-side config files, tile-count updates, and model-specific trace folders; output includes hardware statistics with component access/energy distributions. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/how_to_run.md))
- **Why it matters for CIM compiler/IR work:** The run contract spans compiler output plus backend configuration, so reproducible compilation is not solely a property of the generated instruction stream.
- **Reusable lesson:** A future corpus entry or IR stack wrapper should capture both emitted code and simulator configuration as provenance.

### Insight 6 — PUMA’s optimization evidence is unusually tied to compiler passes

- **Observation:** Table 8 evaluates input shuffling, shared memory sizing, graph partitioning, register pressure, and MVM coalescing, directly linking paper-level optimizations to backend effects. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))
- **Why it matters for CIM compiler/IR work:** This makes PUMA useful as a compiler-mechanism case study, not only as an accelerator architecture paper.
- **Reusable lesson:** Future CIM IR evaluations should preserve pass-level attribution: which rewrite changed movement, register pressure, MVM parallelism, or synchronization overhead.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifiers:** public simulator repository and public compiler repository. The simulator README describes it as an ASPLOS 2019 PUMA emulator, and the compiler README states that the repository includes the PUMA compiler. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/README.md))
- **License:** simulator: MIT license. Compiler: permissive University of Illinois / IMPACT Research Group license text with redistribution conditions; the README does not name it as a standard SPDX license in the checked source. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/LICENSE))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** simulator source, benchmark/test folders, configs, requirements, `dpe.py` workflow, examples of trace/hardware-stat outputs; compiler source in `src`, programming interface in `include`, examples in `test`, and reports/debug dot/PDF workflow. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator))
- **What the artifact appears to omit or make partial:** full push-button reproduction of all ASPLOS plots, model weights for arbitrary workloads, modern environment packaging, and a stable public IR/schema for internal graph/placement state were not found in the checked README/how-to files.
- **Minimal documented workflow:** clone compiler and simulator, build the compiler, compile an example such as `mlp_l4_mnist`, run the generated test to produce PUMA assembly, copy/generate simulator files, choose/update simulator config, and run `python dpe.py -n <model_name>`. The documented environment is Ubuntu 16.04 and Python 2.7.12, with PyTorch 0.3.0 for the simulator workflow. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/how_to_run.md))
- **Whether paper figures appear reproducible from the artifact:** partial/unclear. The artifact documents compilation, simulation, reports, and hardware statistics, but the checked documentation does not present a single script that regenerates all paper figures and comparisons end to end.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper documents C++ interface and ONNX bindings; artifact provides C++ examples. ONNX binding details were not found in checked README. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Intermediate representation serialized | Partial | Debug `.dot`/PDF generation and reports are documented, but a stable IR schema is not. ([GitHub](https://github.com/illinois-impact/puma-compiler/blob/master/test/README.md)) |
| Mapping decisions inspectable | Partial | Paper describes placement heuristics; compiler reports exist. Exact mapping state is mainly internal/generated. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Schedule inspectable | Partial | Generated per-core/per-tile assembly is inspectable; scheduling rationale is paper-level. |
| Hardware config explicit | Yes | Hardware configuration appears in Table 3 and simulator config workflow. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Precision / bit-slice assumptions explicit | Yes | 2-bit cells, 16-bit fixed point, and 8-crossbar bit slicing are explicit. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Cost model inspectable | Partial | Paper lists modeling sources and component tables; simulator code is public. Calibration scripts for all paper figures were not found in checked docs. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |
| Simulator backend documented | Partial | README/how-to document setup and execution, but the environment is old and manual. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/README.md)) |
| Generated code / instruction stream inspectable | Yes | Compiler examples generate PUMA assembly; codegen emits `.puma` files. ([GitHub](https://github.com/illinois-impact/puma-compiler/blob/master/test/README.md)) |
| Provenance from source op to backend action | Partial | Graph examples and compiler reports help, but no checked source shows a formal provenance schema. |
| Reproduction scripts available | Partial | Scripts/workflows exist for examples and simulator execution; full paper-figure reproduction is unclear. ([GitHub](https://github.com/Aayush-Ankit/puma-simulator/blob/training/how_to_run.md)) |
| Calibration source documented | Partial | Paper documents RTL/Cacti/Booksim/Orion/ISAAC/ADC-model sources; exact public calibration bundle is unclear. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible through the C++ model-building interface and examples; ONNX support is claimed in the paper, but adapter work would require checking the compiler source beyond the README-level documentation.
- **As IR inspiration:** The useful abstractions are model graph → MVMU tiles → core/tile resource placement → FIFO/shared-memory communication → per-core/per-tile instruction streams.
- **As mapper/scheduler:** The graph partitioning priority order, MVM coalescing, global deadlock-aware linearization, and separated register classes are strong candidates for adaptation.
- **As cost model:** Component-level timing/energy categories, MVMU dimensions, ADC/DAC/peripheral costs, shared-memory/network costs, and trace-level access counts could become backend plugin metrics.
- **As backend:** PUMAsim could be wrapped as a PUMA-specific backend if an adapter emits `.puma` assembly and simulator config files.
- **As benchmark:** The paper’s MLP, NMT/LSTM, BigLSTM/LSTM-2048, VGG16, and VGG19 workload mix is useful for static MVM-heavy inference coverage.
- **As validation source:** Validation is simulator/RTL-model based, with no chip-in-loop or silicon measurement for the full PUMA accelerator in the checked sources; the paper uses RTL synthesis and established modeling tools for components. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

**Integration effort estimate:** **Medium–High.** Integration would be most direct through generated `.puma` assembly and PUMAsim configuration, but the environment is Python 2.7-era and the compiler repository is archived. Reuse would benefit from a small adapter that extracts compiler graph/placement/report data into a modern JSON or MLIR-like schema, plus a wrapper that pins simulator config and records provenance for each run.

## 9. Relation to a value-trajectory CIM IR project

PUMA provides useful ingredients for a value-trajectory IR, especially because it explicitly names the PUMA hardware path around MVMUs: XbarIn registers, DAC conversion, analog crossbar MVM, ADC conversion, XbarOut registers, general-purpose registers, tile shared memory, receive FIFOs, and send/receive instructions. The closest approximation to trajectory semantics is the combination of graph placement, inserted communication operations, register allocation, and simulator trace/stat output. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

The paper does name the physical/digital path a value takes through PUMA resources, but value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage is mostly implicit in instruction sequences and hardware semantics. Bit significance and reconstruction are visible in the architecture diagram and bit-slicing explanation, while compiler-level values mostly see a composite 16-bit MVM. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf))

A trajectory-level extension would likely attach type-like metadata to graph values and instruction operands:

- bit slice / significance group;
- analog or digital domain;
- precision stage before/after ADC;
- placement at MVMU/core/tile/register/memory/FIFO;
- reconstruction status;
- accumulation/reduction stage;
- allowed peripheral path.

With those additions, a future IR could express rewrites such as fusing reconstruction with downstream reduction, delaying or retiming ADC conversion, carrying bit-sliced partial sums across operator boundaries, changing reduction tree structure, routing values through alternative peripheral paths, and co-optimizing data movement with numeric reconstruction. PUMA’s demonstrated abstraction centers on graph-to-ISA lowering for a fixed MVMU contract; trajectory-level rewrites would add an explicit value-flow layer between graph partitioning and PUMA assembly.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| ISAAC | Analog crossbar CNN acceleration, MVMU/peripheral modeling, comparison baseline | ISAAC is treated by PUMA as an application-specific CNN accelerator with manually configured state machines, while PUMA emphasizes compiler-generated per-core/per-tile instructions. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Place ISAAC closer to architecture/dataflow template; place PUMA closer to ISA/compiler-backed co-design. |
| PRIME | ReRAM crossbar-based neural-network acceleration in memory | PRIME is closer to configurable ReRAM main-memory acceleration; PUMA builds a spatial accelerator with an explicit ISA and compiler. ([Iowa State University ECE Class](https://class.ece.iastate.edu/tyagi/cpre581/papers/ISCA16PRIME.pdf?utm_source=chatgpt.com)) | Useful contrast between memory-subarray reconfiguration and compiler-visible instruction streams. |
| Fujiki et al. ISA-programmable memristor accelerator | ISA-programmable memristor acceleration | PUMA distinguishes itself as a dataflow accelerator optimized for ML MVMs, with digital VFUs for vector operations, whereas Fujiki et al. is described as data-parallel and oriented to general-purpose vector operations. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Good corpus neighbor for “ISA first” CIM systems; compare the instruction object and synchronization model. |
| Brainwave | Spatial accelerator with instruction-level control granularity | PUMA compares control granularity to Brainwave while emphasizing higher storage density via memristive crossbars. ([Izzat El Hajj](https://ielhajj.github.io/publications/paper/paper-puma-asplos19.pdf)) | Useful non-CIM comparator for spatial instruction control and producer-consumer scheduling. |
| PIMCOMP | End-to-end DNN compiler for PIM accelerators | PIMCOMP is more directly framed as a compiler for PIM deployment and mapping; PUMA is a co-designed architecture/ISA/compiler/simulator stack for one PUMA backend. ([arXiv](https://arxiv.org/html/2411.09159v1?utm_source=chatgpt.com)) | Helps separate architecture-specific ISA stacks from more portable PIM compiler frameworks. |
| DNN+NeuroSim / CrossSim | CIM simulation, accuracy/PPA modeling | These tools foreground device/circuit/system modeling and accuracy/PPA exploration, whereas PUMA combines compiler-generated instruction streams with architectural timing/power simulation. ([Frontiers](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2021.659060/full?utm_source=chatgpt.com)) | Use as simulator/cost-model neighbors rather than graph-to-assembly compiler neighbors. |

## 11. Corpus-ready final takeaway

- PUMA’s real contribution is a narrow but complete hardware–software stack for a specific ISA-programmable hybrid CMOS–memristor inference accelerator.
- The strongest reusable layer is the graph-to-PUMA-assembly backend path: graph partitioning, MVMU/core/tile placement, communication insertion, scheduling, register allocation, and PUMAsim execution.
- The evidenced workload scope is static, MVM-heavy ML inference over MLP, LSTM/NMT/language-modeling, and CNN benchmarks, using 16-bit fixed point over 2-bit memristor cells.
- First-class CIM objects include MVMUs/crossbars, XbarIn/XbarOut registers, DAC/ADC boundaries, bit-sliced 16-bit MVMs, MVM masks, filter/stride input shuffling, tile shared memory, valid/count attributes, receive FIFOs, and per-core/per-tile instruction streams.
- The hidden IR is the combination of compiler graph, resource placement, communication state, coalescing decisions, register allocation, generated assembly, and simulator config.
- Artifact status is public and useful but partial for modern reproducibility: simulator and compiler source are available, the simulator is MIT-licensed, the compiler is archived/read-only, and the documented workflow relies on older Python/toolchain assumptions.
- Integration would be most direct by wrapping generated `.puma` assembly plus simulator configuration; broader reuse would benefit from exporting graph/placement/schedule state into a typed intermediate format.
- For value-trajectory IR work, PUMA supplies concrete path ingredients but would need an added abstraction for value identity, bit significance, reconstruction status, domain transition, and alternative peripheral routes.

## 12. Suggested metadata entry

```yaml
paper: "PUMA: A Programmable Ultra-efficient Memristor-based Accelerator for Machine Learning Inference"
year: 2019
venue: "ASPLOS 2019"
authors_or_group: "Aayush Ankit, Izzat El Hajj, Sai Rahul Chalamalasetti, Geoffrey Ndu, Martin Foltin, R. Stanley Williams, Paolo Faraboschi, Wen-mei Hwu, John Paul Strachan, Kaushik Roy, Dejan S. Milojicic"
technology:
  - RRAM-CIM
  - memristor-CIM
  - analog-CIM
  - hybrid-CMOS-memristor
workloads:
  - MLP inference
  - LSTM inference
  - neural machine translation
  - language modeling
  - CNN inference
  - VGG16
  - VGG19
axis_A:
  primary: "A5 narrow end-to-end co-design"
  secondary:
    - "A4 explicit ISA compiler stack"
    - "A3 mapping / scheduling / DSE framework"
    - "A2 simulator & cost model"
axis_B:
  - "B2 graph-as-IR"
  - "B4 hardware-resource IR"
  - "B5 instruction / meta-op / ISA"
  - "B1 config-as-IR (partial)"
  - "B6 accuracy / nonideality modeling (partial)"
  - "B7 runtime-state abstraction (limited)"
axis_C_first_class_objects:
  - MVMU / memristor crossbar
  - core / tile / node hierarchy
  - XbarIn registers
  - XbarOut registers
  - DAC / ADC boundary
  - 2-bit cell / 16-bit bit-sliced MVM
  - MVM mask operand
  - filter / stride input-shuffle operands
  - shared-memory valid/count attributes
  - receive FIFO IDs
  - per-core/per-tile PUMA assembly
axis_D_rewrite_objects:
  - operator graph
  - tensor tiling
  - hardware mapping
  - array/MVMU binding
  - memory layout
  - communication insertion
  - instruction stream
  - register allocation
  - fixed numeric format
artifact:
  status: "public artifact found"
  url:
    - "https://github.com/Aayush-Ankit/puma-simulator"
    - "https://github.com/illinois-impact/puma-compiler"
  license:
    simulator: "MIT"
    compiler: "University of Illinois / IMPACT permissive license text; standard SPDX name not confirmed"
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
reproducibility_level: "medium"
trajectory_IR_relevance: "medium"
notes:
  - "Best classified as a PUMA-specific ISA/compiler/simulator co-design rather than a portable CIM IR."
  - "Reusable semantics are clearest in graph partitioning, MVM coalescing, communication insertion, and per-core/per-tile codegen."
  - "Value-trajectory reuse would require adding explicit metadata for bit-slice, analog/digital domain, reconstruction, and accumulation path."
```