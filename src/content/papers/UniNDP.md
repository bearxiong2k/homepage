# UniNDP — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework** | The central compiler object is a search state over data partition, DRAM-row/column mapping, PU allocation, and workload scheduling, then ranked by predictor and simulator. The overview explicitly says UniNDP creates a partition/mapping/scheduling search space, prunes it, generates top-K instruction sequences, simulates them, and reports the best strategy. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Secondary stack roles, Axis A | **A2 Simulator & cost model; A4 ISA-style compiler stack; A5 narrow end-to-end co-design** | UniNDP contributes a cycle-accurate, instruction-driven simulator; a DRAM-timing predictor; and a unified NDP instruction abstraction, but the demonstrated end-to-end path is narrow: ONNX/operator-level ML workloads to instruction lists and latency metrics for NDP architectures. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR; B5 Instruction / meta-op / ILA; B7 Runtime-state abstraction; limited B2 Graph-as-IR** | Hardware configurations, tree resources, instruction lists, instruction queues, and hardware-status spaces carry most reusable semantics. The “operator IR” is an operator-level ONNX-derived description of MM/MVM-like shapes rather than a general public graph dialect. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| First-class CIM objects, Axis C | DRAM hierarchy tree, memory node, PU node, buffer node, DRAM timing parameters, MAC/data-movement/host instructions, DRAM row/column mapping, instruction queue, hardware status, VMC issue state | The paper names central/memory/PU/buffer nodes, DRAM timing attributes, compute/movement/host instruction classes, data-block row/column mapping constraints, and simulator state tracking DRAM banks, buses, PUs, and buffers. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Rewrite object, Axis D | **Hardware mapping, memory layout, instruction stream, scheduling / issue order, cost-ranked search state** | Transformations are over tensor/operator partitioning, operand-to-DRAM layout, PU/resource binding, and generated NDP instructions. Scheduling appears as dependency-aware instruction grouping and VMC out-of-order issue rather than a standalone schedule IR. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Best corpus tags | `DRAM-PIM`, `near-DRAM-processing`, `compiler-mapping`, `DSE`, `instruction-driven-simulator`, `ISA-abstraction`, `hardware-config-as-IR`, `ML-operators`, `LLM-inference`, `latency-predictor` | The demonstrated stack is DRAM/NDP-oriented rather than analog-array CIM; its reusable boundary is strongest at mapping, configuration, instruction generation, and simulation. |
| Closest comparison baselines | CAIRO, To PIM or Not, PIMFlow, uPIMulator, Ramulator-PIM, Samsung PIMSimulator | The paper itself positions these as nearby compilation/simulation tools: CAIRO, To PIM or Not, and PIMFlow are compiler/runtime/offload works; uPIMulator, Ramulator-PIM, PIMSimulator, and PRIMO are simulator/emulator baselines or neighbors. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |

## 2. One-paragraph public summary

UniNDP is best read as a unified mapping-and-simulation framework for **DRAM-based near-data / near-DRAM processing architectures**. Its main contribution is a narrow but concrete stack that takes ML operator descriptions and hardware configuration, enumerates partition and data-layout strategies across DRAM hierarchy levels, prunes and ranks those strategies with DRAM-timing-derived predictors, lowers top candidates to a small NDP instruction abstraction, and evaluates them with an instruction-driven timing simulator. The paper strengthens the CIM/PIM stack at the **mapping, hardware-resource abstraction, cost-model, and simulator-backend** layers rather than at the frontend language or formal IR-verification layer. The demonstrated scope is ML operators from CNN and LLM workloads—especially MM and MVM shapes—on bank-, device-, and rank-level NDP architectures modeled after UPMEM, AiM, HBM-PIM, and DIMMining-like organizations. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| UniNDP is a unified NDP compilation and simulation tool for ML workloads. | Abstract and Section III overview. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Paper + artifact | The paper and artifact expose a compiler, simulator, configs, workloads, backend codegen files, and evaluation scripts. The repo lists `backend`, `config`, `frontend`, `midend`, `sim`, `workload`, `compile.py`, `compile_predictor.py`, and `sim_verify.py`. ([GitHub](https://github.com/UniNDP-hpca25-ae/UniNDP)) | Demonstrated for ML operator workloads, mainly matrix-like operators used in CNNs and LLMs. Support for non-ML/general computation is described as future work. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Unified tree-based hardware abstraction can represent multiple NDP architectures. | Section IV-A / Fig. 3. | Architecture abstraction + config artifact | The abstraction names DRAM hierarchy levels, central nodes, memory nodes, PU nodes, and buffer nodes; memory nodes include bitwidth/capacity/timing, PUs include parallelism/frequency, and buffers include size and read/write latency. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | The artifact exposes several YAML configs for UPMEM, GDDR6-AiM, HBM-PIM, DIMMining, and testsim; extending a new dataflow requires adding backend code rather than changing only config. ([GitHub](https://github.com/godfather991/UniNDP/tree/main/config)) |
| Unified instruction set covers NDP compute, internal data movement, and host-side operations. | Section IV-B / Table II. | ISA abstraction + backend code | Table II names MAC-DRAM, MAC-GB, MAC-LB, REG2LB/LB2REG, LB2DRAM/DRAM2LB, GB2DRAM/DRAM2GB, READ/WRITE-DRAM, WRITE-GB, WRITE-LB, READ/WRITE-REG. The paper states unsupported hardware components cause corresponding instructions to be excluded during compilation. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | The instruction abstraction is a modeling/compiler instruction stream, not a public hardware ISA specification with binary encoding, formal semantics, or hardware validation. The reusable boundary is clearest at instruction-list generation and timing simulation. |
| Cycle-accurate, instruction-driven simulator evaluates generated instruction sequences. | Section V / Fig. 4. | Simulator algorithm + code/artifact | The simulator is described as hardware status space + instruction queue + virtual memory controller. It updates status only when a new instruction is issued, checks dependencies, chooses earliest issue time, and updates occupied hardware state. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Cycle accuracy is evaluated against Samsung PIMSimulator for selected MVM operators; the paper reports 6–8% deviation and attributes this to refresh modeling. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Compiler optimizes data partition, mapping, and workload scheduling. | Section VI / Fig. 6. | Equations + search procedure + artifact | The compiler encodes partition across DRAM hierarchy, maps operands to rows/columns, prunes with hardware-status indicators, ranks top-K with a predictor, generates instruction sequences, and simulates candidates. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | The demonstrated transformations are mapping/layout/schedule search for operator shapes. The public artifact’s main workflow compiles CSV workload rows and shape arguments rather than a general-purpose graph compiler workflow. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/workload/README.md)) |
| Search-space pruning and predictor reduce compilation time while preserving useful candidates. | Section VI-D/E and Section VII-D/E. | Equation + experiment + artifact commands | Equation 8 gives a performance upper-bound indicator using DRAM access, row misses, bandwidth, workload, PU count, and PU performance; the paper reports pruning from 5,640s to 1,475s for a Llama2-7B MM example and predictor R² values above 0.95 for sampled architectures. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | The predictor is a ranking accelerator, not the final oracle: the paper states predictor-only compilation reduces performance, so final selection still uses the simulator on top-K candidates. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| UniNDP achieves speedups across multiple NDP architectures and workloads. | Abstract, Section VII-B, conclusion. | Experiment | The paper reports 1.07–1.49× average speedup for MM, 1.10–1.62× for MVM, and 1.86–3.43× / 1.05–1.49× end-to-end speedups for CNNs / LLMs compared with existing NDP partition and mapping strategies. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Results are simulator-backed for selected CNN/LLM operator workloads and five modeled architecture configurations. The baselines are partition/mapping strategies from AiM/HBM-PIM-like work, not full production compilers. |

## 4. Stack anatomy

```text
Input / frontend:
  Workload representation + hardware configuration. The paper says the workload is a series of operator-level IRs output by ONNX, with selected memory-intensive operators such as MVM and MM deployed to NDP. In the artifact, the most inspectable public frontend boundary is CSV workload rows: name, operator type, input size, shared dimension, weight size, batch size. This is serialized and reusable, but it is a compact operator-shape interface rather than a full graph IR. 

Middle representation:
  Partition and mapping search state. The paper gives formal encodings for partition tuples across channel/rank/device/bank and mapping tuples for weight/input/output to DRAM data blocks and rows. This state is named mathematically and appears in code as design points, but a single standalone IR file format for all intermediate decisions is not documented. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

Mapping or scheduling state:
  Data partition, DRAM row/column mapping, PU allocation, top-K candidate list, generated instruction groups, and simulator issue queue. Mapping decisions are inspectable through result CSVs and logs; scheduling is clearest in the generated instruction sequence plus simulator queue/VMC behavior. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md))

Hardware abstraction:
  Configurable DRAM hierarchy tree with central nodes, memory nodes, PU nodes, and buffer nodes. Artifact-level hardware configs are YAML files such as `upmem.yaml`, `gddr6-aim.yaml`, `hbm-pim.yaml`, and `dimmining.yaml`; these include data precision, row/column/device-width fields, PU/buffer fields, and DRAM timing parameters. ([GitHub](https://github.com/godfather991/UniNDP/tree/main/config))

Backend / simulator / codegen:
  Architecture-specific Python backends generate instruction groups and predictor counts; the simulator consumes generated code, tracks hardware status, and returns latency. The repo’s backend directory contains separate backend files for AiM, HBM-PIM, UPMEM, DIMMining, and templates, while the simulator directory contains bank/buffer/channel/device/rank/system and instruction-queue modules. ([GitHub](https://github.com/godfather991/UniNDP/tree/main/backend))

Output artifact:
  Instruction sequence, predicted latency, simulated latency, result CSVs, logs, and summary CSVs. README workflows store per-workload result CSV/log files and summarize end-to-end results into `combined_results.csv`; key metrics include `cmd`, `pu_dram_access`, `host_dram_access`, and `row_change`. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md))

Evaluation loop:
  Enumerate or prune design space; rank candidates with predictor; generate instruction sequences for top-K candidates; simulate candidates; report best mapping and metrics. This loop is described in Section III and implemented in `compile.py` as partition-space construction, mapping assignment, codegen, predictor/top-K selection, simulation, and CSV output. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the workload shape tuple, YAML hardware configuration, partition tuple, operand-to-row mapping tuple, architecture-specific backend codegen choices, generated instruction list, and simulator hardware-status state. The paper foregrounds a unified abstraction and instruction set, while the reusable semantics are most visible in the partition/mapping equations, YAML config fields, result CSV metrics, and simulator queue/status contract.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.** UniNDP’s strongest ownership is the middle of the stack: it chooses how an operator is partitioned across DRAM hierarchy levels, how operands are mapped into rows and columns, which PU/buffer/data path is used, and which top-K candidates deserve cycle-accurate simulation. The input that defines this slice is an operator shape plus hardware config; the output is a best partition/mapping/scheduling strategy with instruction stream and latency metrics. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**Secondary: A2 Simulator & cost model.** The simulator is a major contribution: it provides hardware status space, instruction queue, and virtual memory controller, and the predictor provides a fast ranking model based on DRAM timing and instruction-pattern counts. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**Secondary: A4 Explicit IR / dialect / ISA compiler stack.** UniNDP does define a small NDP instruction abstraction, but its public semantics are closer to a meta-instruction interface for simulation/codegen than to a full compiler IR/dialect with type rules, verification, or multi-pass rewriting. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**Secondary: A5 Narrow end-to-end co-design.** The artifact and paper connect workload CSV/operator shapes to backend instruction lists and latency summaries. The end-to-end path is valuable for research comparison, while the reusable API is most mature for DRAM-NDP mapping and simulation.

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is the hardware configuration: YAML config fields for precision, rows/columns, device width, PU counts, buffer sizes, and timing parameters. Decisions made there include NDP hierarchy level, buffer capacity, PU parallelism, burst length, and DRAM timing. Decisions that remain embedded include architecture-specific dataflow and backend-specific codegen rules. There is a readable artifact upstream tools could consume, but a schema/validator is not documented. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/config/gddr6-aim.yaml))

**B4 Hardware-resource IR.**  
The paper’s tree abstraction makes hardware resources first-class: central/data-bus nodes, memory nodes, PUs, and buffers. Mapping decisions attach operator partitions and operand data blocks to these resources. Some legality is represented by the tree and config, while some remains in backend code and instruction exclusion rules. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**B5 Instruction / meta-op / ILA.**  
The named representation is the unified NDP instruction set. It covers MAC variants, internal data movements, and host-side operations, and the simulator consumes instruction sequences. This is the clearest backend contract in the paper, though no standalone formal instruction schema or binary ISA is provided. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**B7 Runtime-state abstraction.**  
The simulator’s hardware status space is explicitly stateful: it tracks current command/countdown for DRAM banks and current state/countdown for buses, buffers, and PUs. The VMC uses this state to choose earliest-issue instructions. This is not a runtime API for a deployed system, but it is a useful runtime-state model for timing simulation. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**Limited B2 Graph-as-IR.**  
The paper says the workload representation is operator-level IR from ONNX, but the demonstrated reusable boundary is operator shape selection and CSV workloads rather than a public ONNX graph lowering pipeline. The artifact includes a frontend directory with `onnx.py`, but the README workflows center on shape arguments and workload CSVs. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable as crossbar; first-class as DRAM hierarchy** | UniNDP models DRAM hierarchy levels—channel, rank, device, bank—and NDP nodes rather than analog crossbars. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Bit-slicing / bit significance | **Not applicable / limited parameter** | The artifact configs include `data_pr: 16` and device-width/burst fields, but bit significance and bit-sliced value representation are not the modeled object. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/config/gddr6-aim.yaml)) |
| ADC/DAC precision or sensing | **Not applicable** | The modeled technology is digital DRAM-NDP/PIM; the paper’s cost model centers on DRAM timing, row changes, buffers, buses, and PUs, not analog sensing. |
| Analog-to-digital or domain transition | **Not applicable** | No analog/digital boundary is part of the named abstraction; data movement is between DRAM, local/global buffers, registers, and host. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Peripheral circuits as path nodes | **First-class as PU, buffer, bus/central node; costed through timing/state** | Central nodes represent data buses, memory nodes hold timing, PU nodes hold parallelism/frequency, and buffer nodes hold size/read-write latency. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Partial-sum accumulation path | **Implicit / instruction-level** | MAC instructions store results in registers; REG2LB/LB2REG and LB2DRAM are used for temporary/intermediate results and further processing. The path is modeled as instructions and buffers, not as a typed partial-sum IR. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Reconstruction / shift-add tree | **Not applicable** | This is not an analog or bit-sliced CIM design with reconstruction trees. The closest relevant object is PU reduction-unit parallelism used in pruning hints. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for simulator state; workload batch is a parameter; masks/KV/sparsity are not central objects** | Simulator status and instruction queue are first-class. Workload shape includes batch size in CSV; LLM workloads are represented through MM/MVM shapes, not KV-cache runtime state. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Value trajectory / flow path | **Approximated through instruction/data-movement paths** | The instruction set names movement among DRAM, global buffer, local buffer, PU registers, and host. It approximates trajectory as instruction-level resource transitions rather than preserving per-value identity across stages. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |

### 5.4 Axis D — rewrite object

UniNDP rewrites **hardware mapping, memory layout, instruction streams, and scheduling/issue order**. The key transformations are:

- Partition matrix dimensions M/K/N across channel, rank, device, and bank hierarchy levels.
- Map weight, activation, and output slices to DRAM data blocks and rows.
- Select PU parallelism/resource allocation and hardware utilization levels.
- Generate MAC, data-movement, and host-side instruction streams.
- Reorder/issue instructions through a dependency-aware queue and VMC timing model.

The legal equivalences are matrix/tensor partitioning equivalences: multiple partitions and layouts compute the same MM/MVM operator but differ in DRAM row locality, buffer reuse, PU utilization, host traffic, and instruction count. Information that must be preserved includes operator dimensions, reduction semantics, operand identity, output placement, data dependencies between producer/consumer instructions, and timing/resource occupancy constraints. The representation is especially well suited to DRAM-row locality and PU/buffer mapping; expressing cross-operator fusion, typed bit-sliced partial sums, delayed numeric reconstruction, or analog-domain retiming would likely require an additional abstraction for value identity, precision stage, and domain transition.

## 6. Technical mechanism reading

### 6.1 Input normalization: operator shapes plus architecture config

The paper describes the input as two pieces: workload representation and hardware configuration. Workloads are operator-level IRs from ONNX, with time-consuming/memory-intensive operators such as MVM and MM selected for NDP execution; hardware config includes DRAM timing parameters and architecture specifications. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

In the artifact, this becomes a practical shape-driven compiler interface. `compile.py` takes `-A` architecture, `-W` workload type, and `-S` size fields; supported workload types in the CLI include `mm`, `elewise`, `softmax`, `layernorm`, and `batchnorm`, with MM sizes interpreted as input/reduce/output/batch dimensions. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/compile.py?utm_source=chatgpt.com)) Workload CSVs serialize one layer/operator per row with name, operator type, input size, shared dimension, weight size, and batch size. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/workload/README.md))

### 6.2 Hardware abstraction: tree nodes as the resource model

UniNDP’s abstraction is a configurable tree. Each level corresponds to a DRAM hierarchy layer such as channel, rank, device, or bank. Central nodes model interfaces/data buses, memory nodes model the smallest memory unit containing a PU, PU nodes model computation resources, and buffer nodes model local/global buffers with size and latency. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

This is the most IR-like part of the hardware model. It creates a named resource graph against which compiler legality can be checked: for example, MAC-DRAM requires a path connecting two banks to a PU, while MAC-LB requires a local buffer; missing resources cause the compiler to exclude the corresponding instruction. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

### 6.3 Unified instruction abstraction

The instruction set has three families:

1. **Compute:** MAC-DRAM, MAC-GB, MAC-LB.
2. **Internal NDP movement:** REG2LB/LB2REG, LB2DRAM/DRAM2LB, GB2DRAM/DRAM2GB.
3. **Host-side operations:** READ/WRITE-DRAM, WRITE-GB, WRITE-LB, READ/WRITE-REG.

The instructions are later split into DRAM commands such as ACT, READ, and WRITE by the memory controller during runtime. This makes the instruction stream a compact backend interface: high enough to be generated from a mapping strategy, low enough for DRAM timing simulation. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

### 6.4 Partition and mapping equations

The partition encoding distributes an operator across DRAM hierarchy levels. For MM, the paper represents partitioning across channel, rank, device, and bank by tuple components over M, K, and N. After partitioning, each sub-operator has derived sub-shapes based on original matrix sizes and partition factors. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

The mapping encoding then maps weight, activation, and output sub-operators into DRAM row/column blocks. The smallest mapping unit is a data block corresponding to burst length. Constraints include fitting a data slice into burst-length × device-width capacity and fitting a group of slices into a DRAM row. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

For compiler/IR readers, the important detail is that UniNDP separates **operator partition** from **operand layout**. The partition decides which sub-computation belongs to which hierarchy/resource; the mapping decides how W/A/O data are packed into DRAM rows to trade off row activations, redundant reads, and buffer reuse.

### 6.5 Search-space pruning and predictor

The pruning method has two stages. First, it constrains mapping choices using hardware hints: for example, K-dimension slice sizes should match PU reduction-unit parallelism, and some K-row mapping factors are suggested to match dimensions of data read from DRAM to reduce redundant reads. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

Second, it estimates a performance upper bound using hardware-status terms: DRAM access divided by bandwidth, row misses times precharge time, and ideal PU compute latency. The paper states that this bound omits extra movements among PU, buffer, and other PUs, so it serves as an early pruning/ranking indicator rather than final timing. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

The predictor then estimates extra data-movement latency from instruction patterns and DRAM timing. It is embedded in code generation: the code generator uses fixed-size instruction-sequence patterns to predict instruction latency, then full-sequence latency is obtained by multiplying by loop count. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) The key design is a two-tier evaluator: predictor for broad ranking, simulator for final top-K selection.

### 6.6 Instruction-driven simulator

The simulator is described as an event/instruction-driven cycle-accurate simulator. It maintains hardware status, instruction dependencies, and a VMC issue policy. Instead of updating every cycle, it jumps from one instruction issue event to the next, reducing iterations from DRAM-cycle count to instruction-sequence length. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

This is an important modeling compromise. It retains DRAM timing constraints, row-buffer effects, bus/buffer/PU occupancy, and dependency ordering, but the simulation granularity is instruction issue and resource countdown rather than full cycle-by-cycle DRAM command stepping.

### 6.7 Evaluation scope

The paper evaluates bank-, device-, and rank-level NDP configurations. Architectures include a UPMEM-like bank-level design, AiM/HBM-PIM-like device-level designs, and a DIMMining-like rank-level design. Workloads include CNN operators converted through im2col and LLM MM/MVM shapes from Llama2-7B, Llama2-13B, and Llama2-34B with max input length 4096. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The tree abstraction is a hardware-resource IR, not just a simulator config

- **Observation:** The tree encodes hierarchy, data-path visibility, PU placement, local/global buffers, and legal instruction availability. Missing nodes or buffers change which instructions can be generated. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
- **Why it matters for CIM compiler/IR work:** It shows how a resource graph can serve as the contract between a mapper and a backend without committing to one DRAM-PIM architecture.
- **Reusable lesson:** A future CIM IR stack could borrow this idea as a “hardware capability dialect”: named memory levels, compute nodes, movement edges, buffer capacities, and instruction legality constraints.

### Insight 2 — Mapping legality and cost ranking are separated

- **Observation:** Partition/mapping equations define legal design points, while pruning and predictor/simulator rank those points. Equation 8 deliberately omits some extra movement costs and is used as a pruning bound rather than a complete timing model. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
- **Why it matters for CIM compiler/IR work:** This separation is useful for reusable compiler infrastructure: legality can be checked structurally, while cost plugins can evolve with new timing or calibration models.
- **Reusable lesson:** Store partition/layout legality in one object and cost annotations in another; avoid baking all timing assumptions into the mapping representation.

### Insight 3 — The instruction stream is the clearest backend boundary

- **Observation:** The paper’s instruction set is small, typed by data source/destination, and directly consumed by the simulator. It names where operands come from—DRAM, global buffer, local buffer—and where results go. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
- **Why it matters for CIM compiler/IR work:** The instruction list acts as a stable interface between mapping/codegen and timing simulation.
- **Reusable lesson:** For CIM/PIM stacks, a compact instruction/meta-op layer can be more reusable than a full frontend graph dialect when the goal is architecture comparison.

### Insight 4 — The simulator exposes hidden runtime state that could become IR metadata

- **Observation:** Hardware status space tracks DRAM bank command/countdown and states of buses, buffers, and PUs; the VMC uses this status to issue instructions out of order. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
- **Why it matters for CIM compiler/IR work:** Many performance-critical constraints are neither graph-level nor loop-level; they are resource-state and dependency constraints.
- **Reusable lesson:** A future IR could attach “resource occupancy” and “earliest issue” metadata to schedule/instruction objects, making timing assumptions inspectable before simulation.

### Insight 5 — The artifact reveals a practical, shape-first frontend boundary

- **Observation:** Although the paper mentions ONNX operator IR, the README’s main public workflow compiles workload CSVs and command-line shapes. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))
- **Why it matters for CIM compiler/IR work:** For corpus classification, UniNDP should be treated as a compiler/mapping backend with operator-shape ingestion, not as a general frontend framework.
- **Reusable lesson:** A small shape schema can be sufficient for reproducible DSE over ML operator kernels, but integration with graph compilers would benefit from an adapter that exports this schema from ONNX/MLIR/TVM.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL / identifier:** `https://github.com/godfather991/UniNDP` redirects from / mirrors the `UniNDP-hpca25-ae/UniNDP` artifact path. The repository describes itself as artifact material for HPCA 2025 paper #2108. ([GitHub](https://github.com/UniNDP-hpca25-ae/UniNDP))
- **License:** MIT license, as listed by GitHub. ([GitHub](https://github.com/godfather991/UniNDP))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** Python compiler scripts, backend codegen modules, YAML hardware configs, frontend/midend modules, simulator modules, workload CSVs, scripts, verification scripts, and requirements. ([GitHub](https://github.com/UniNDP-hpca25-ae/UniNDP))
- **What the artifact appears to omit or leave embedded:** A formal IR schema, a standalone instruction-file schema, a validator for YAML configs/workload CSVs, full plotting scripts for some figures, and a fully documented ONNX-to-operator pipeline. Some figure reproduction relies on processed Excel files linked from Google Drive, and simulator validation requires external Samsung PIMSimulator setup. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md))
- **Minimal documented workflow:** Install requirements; run `compile.py` for one operator or `process_workload.sh` for workload CSVs; summarize results with combine scripts. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md))
- **Whether paper figures appear reproducible from artifact:** Partial. README provides commands for Table V/VI, Fig. 7/8, simulator verification, predictor verification, pruning, breakdown, and Insight 2 experiments; Fig. 9 and Fig. 11 plotting are described as relying on processed Excel files. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | CSV workload rows are documented; ONNX operator IR ingestion is described in the paper but less central in public workflow. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/workload/README.md)) |
| Intermediate representation serialized | **Partial** | Hardware configs and workloads are serialized; partition/mapping search states appear in code/logs/CSVs rather than a single documented IR. |
| Mapping decisions inspectable | **Partial** | Result CSV/log workflows are documented; exact internal design-point schema is code-level. ([GitHub](https://github.com/godfather991/UniNDP/blob/main/README.md)) |
| Schedule inspectable | **Partial** | Instruction groups/queues are modeled and generated, but no standalone schedule IR is documented. |
| Hardware config explicit | **Yes** | YAML configs expose architecture parameters and DRAM timing fields. ([GitHub](https://github.com/godfather991/UniNDP/tree/main/config)) |
| Precision / bit-slice assumptions explicit | **Partial / N/A** | `data_pr` is explicit; bit-slice semantics are not a DRAM-NDP object here. |
| Cost model inspectable | **Partial** | Equations and code-level predictor exist; predictor coefficients/logic are backend-specific. |
| Simulator backend documented | **Partial** | Paper explains simulator structure; README points to `testsim.py`; simulator modules are public. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |
| Generated code / instruction stream inspectable | **Partial** | Generated instruction sequences are simulator inputs; exact serialized format is not separately documented in README. |
| Provenance from source op to backend action | **Partial** | Shape/workload rows map to compiler outputs; fine-grained source-to-instruction provenance is code/log dependent. |
| Reproduction scripts available | **Yes / Partial** | Main experiment commands are documented; some figure plotting uses processed Excel files. ([GitHub](https://github.com/UniNDP-hpca25-ae/UniNDP)) |
| Calibration source documented | **Partial** | DRAM timing sources are described in paper; simulator validation compares to Samsung PIMSimulator for selected MVM operators. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is most direct through the workload CSV or `compile.py` shape interface. The ONNX mention is useful conceptually, but public integration would likely write an adapter from ONNX/MLIR/TVM operators into UniNDP’s compact shape schema.
- **As IR inspiration:** The best abstractions to borrow are the tree hardware-resource model, partition/mapping tuples, instruction categories, and hardware-status state.
- **As mapper/scheduler:** The partition/mapping search logic and hardware-status-guided pruning are strong candidates for adaptation, especially for DRAM-PIM architecture exploration.
- **As cost model:** The predictor and metrics—instruction count, PU/host DRAM access, row changes, buffer/register movement—could become backend cost plugins.
- **As backend:** The simulator/instruction interface could be wrapped as a latency backend for generated instruction streams, with adapters for instruction serialization and config schema.
- **As benchmark:** The workload CSVs for ResNet, VGG, Llama2 prefill/decode, MM, and MVM are useful operator-level benchmarks. ([GitHub](https://github.com/godfather991/UniNDP/tree/main/workload))
- **As validation source:** Validation is simulator-to-simulator against Samsung PIMSimulator, not silicon/RTL/SPICE calibration. This is still useful for relative timing comparisons within DRAM-PIM modeling. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

**Integration effort estimate: Medium.** Integration would be most direct through YAML config plus workload CSV/shape inputs. Reuse would benefit from a small adapter that extracts partition/mapping decisions and generated instruction lists into a stable JSON/MLIR-like form. The main effort is disentangling architecture-specific backend codegen assumptions from the generic tree/instruction abstractions.

## 9. Relation to a value-trajectory CIM IR project

UniNDP provides useful ingredients for a value-trajectory IR, especially its explicit movement instructions among DRAM, global buffer, local buffer, PU register, and host, and its tree model of reachable resources. The closest approximation to trajectory semantics is the generated instruction stream plus simulator dependency graph: values are implicitly tracked by source/destination resources and data dependencies rather than by first-class value identities. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf))

- **Does the paper name the path a value takes through CIM resources?** Partially. It names resource transfers such as DRAM↔local buffer, DRAM↔global buffer, register↔local buffer, and host↔register/buffer/DRAM. It does not appear to define a separate value-path object independent of instructions.
- **Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?** For this digital DRAM-NDP setting, analog partial sums/sensing/reconstruction are N/A. Digital intermediate results are represented operationally through MAC result registers and buffer/DRAM movement instructions.
- **Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?** Placement and data precision are represented as parameters/config/search state. Bit significance and domain transition are not type-like IR fields in the demonstrated abstraction.
- **Could it express trajectory rewrites?**  
  - Fusing reconstruction with downstream reduction: N/A for the demonstrated technology; a reduction/fusion extension would need value-stage metadata.  
  - Delaying or retiming ADC conversion: N/A.  
  - Carrying bit-sliced partial sums across operator boundaries: outside the demonstrated abstraction; would require typed partial-sum/value-slice objects.  
  - Changing reduction tree structure: partially approximated through PU reduction-unit parallelism and K-dimension mapping, but not as a standalone reduction-tree rewrite.  
  - Routing values through alternative peripheral paths: supported at instruction/dataflow level when alternative paths exist, such as local vs global buffer vs DRAM.  
  - Co-optimizing data movement and numeric reconstruction: data movement is optimized; numeric reconstruction is not a modeled object.

A trajectory-level extension would likely attach value identity, precision stage, data domain, producer/consumer dependency, and resource-path annotations to UniNDP’s instruction stream and mapping tuples. For DRAM-PIM, the most useful “trajectory” fields would be operand identity, DRAM row/block location, buffer/register residency, reduction ownership, and host-return point.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| CAIRO | Instruction-level PIM offloading and PIM compilation | UniNDP is broader as an architecture-parameterized mapping/simulation framework for multiple NDP placements, whereas CAIRO is described by UniNDP as instruction-level offloading to HMC. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Tag UniNDP as multi-architecture mapping/simulation, not only offload selection. |
| To PIM or Not | Deciding/offloading computations to bank-level NDP | UniNDP’s compiler searches partition/mapping/layout and simulates top-K instruction sequences, rather than centering on binary offload choice. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Distinguish offload-decision frameworks from mapping/layout DSE frameworks. |
| PIMFlow | Compiler/runtime support for CNNs on PIM-enabled GPU memory | UniNDP targets DRAM-NDP architecture modeling across bank/device/rank placements and includes a custom simulator/predictor. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Workload overlap does not imply same IR object: PIMFlow is runtime/compiler support; UniNDP’s object is mapping state + instruction stream. |
| uPIMulator | UPMEM-PIM compilation and cycle-level simulation | UniNDP treats UPMEM-like bank-level NDP as one config among several; uPIMulator is more architecture-specific. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Use UniNDP as the “unified NDP modeling” entry and uPIMulator as an architecture-specific simulator entry. |
| Samsung PIMSimulator | Cycle-accurate HBM-PIM simulation | UniNDP validates against PIMSimulator for selected MVMs and reports 6–8% deviation, while adding compiler search and multi-architecture abstraction. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Good comparison for simulator fidelity, but UniNDP’s corpus role includes mapping/compiler search. |
| Ramulator-PIM / PRIMO | NDP/PIM simulation and emulation | UniNDP’s differentiator is the compiler-facing tree abstraction plus instruction-driven simulator and predictor; Ramulator-PIM/PRIMO are closer to simulation/emulation infrastructure. ([nicsefc.ee.tsinghua.edu.cn](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/d356f1fd-6204-4b21-8849-a9c3b2e15065.pdf)) | Separate backend timing engines from full mapping+simulation toolchains. |

## 11. Corpus-ready final takeaway

- UniNDP’s real contribution is a **DRAM-NDP mapping and simulation stack**: configurable hardware abstraction, instruction abstraction, compiler search, predictor, and instruction-driven simulator.
- The strongest reusable layer is the **middle/backend boundary**: hardware-resource config + partition/mapping state + NDP instruction stream + simulator metrics.
- The demonstrated scope is **operator-level ML workloads**, especially MM/MVM-like CNN and LLM operators on modeled bank-, device-, and rank-level NDP architectures.
- First-class objects include **DRAM hierarchy nodes, PUs, buffers, timing parameters, data blocks/rows, MAC/movement/host instructions, instruction queues, and hardware status**.
- The hidden IR is distributed across **YAML configs, partition/mapping tuples, backend codegen, generated instruction lists, CSV/log outputs, and simulator state**.
- Artifact status is **public artifact found** under an MIT-licensed GitHub repository, with runnable scripts and configs; some plotting and validation workflows depend on external files/tools.
- Integration is most natural as a **mapper/scheduler, cost-model backend, simulator backend, and benchmark provider**, with a medium-effort adapter needed for stable IR serialization.
- For a value-trajectory IR, UniNDP offers useful ingredients for **resource-path and movement modeling**, but trajectory-level rewrites would add first-class value identity, precision/domain stage, and cross-instruction value-flow metadata.

## 12. Suggested metadata entry

```yaml
paper: "UniNDP: A Unified Compilation and Simulation Tool for Near DRAM Processing Architectures"
year: 2025
venue: "IEEE HPCA 2025"
authors_or_group: "Tongxin Xie, Zhenhua Zhu, Bing Li, Yukai He, Cong Li, Guangyu Sun, Huazhong Yang, Yuan Xie, Yu Wang"
technology:
  - DRAM-PIM
  - near-DRAM-processing
  - digital-CIM
  - NDP
workloads:
  - CNN operators
  - ResNet
  - VGG
  - Llama2-7B
  - Llama2-13B
  - Llama2-34B
  - MM
  - MVM
axis_A:
  primary: A3_mapping_scheduling_DSE_framework
  secondary:
    - A2_simulator_cost_model
    - A4_instruction_meta_op_stack
    - A5_narrow_end_to_end_codesign
axis_B:
  - B1_config_as_IR
  - B4_hardware_resource_IR
  - B5_instruction_meta_op_ILA
  - B7_runtime_state_abstraction
  - B2_limited_operator_graph_as_IR
axis_C_first_class_objects:
  - DRAM_hierarchy_tree
  - central_bus_node
  - memory_node
  - PU_node
  - buffer_node
  - DRAM_timing_parameters
  - data_block_and_row_mapping
  - NDP_instruction_stream
  - instruction_queue
  - hardware_status_space
  - virtual_memory_controller_issue_state
axis_D_rewrite_objects:
  - hardware_mapping
  - data_partition
  - DRAM_row_column_layout
  - PU_binding
  - instruction_stream
  - issue_order
  - cost_ranked_design_point
artifact:
  status: public_artifact_found
  url: "https://github.com/godfather991/UniNDP"
  license: MIT
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: medium
trajectory_IR_relevance: medium
notes:
  - "Best classified as a DRAM-NDP mapping/simulation framework rather than an analog CIM IR stack."
  - "Reusable semantics are clearest in the hardware tree, mapping equations, instruction set, YAML configs, and simulator status model."
  - "Frontend evidence is operator-shape/CSV centered; ONNX operator IR is described but less exposed as a public reusable boundary."
```