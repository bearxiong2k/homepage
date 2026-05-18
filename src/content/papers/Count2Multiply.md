# Count2Multiply — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with **A2 simulator/cost model** and **A3 mapping/scheduling** as secondary | The paper’s strongest stack slice is the co-design of a digital-CIM accumulation primitive, host-side command generation, DRAM row layout, and reliability scheme. Evaluation is simulator-backed using an NVMain/RTSim cycle-level CIM model with Ambit/SIMDRAM validation. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Middle-layer style, Axis B | **B5 instruction/meta-op/ILA**, **B4 hardware-resource IR**, **B6 accuracy/nonideality modeling**, **B7 runtime-state abstraction** | The named middle object is the **µProgram**: a preconstructed sequence of Ambit-style AP/AAP memory commands selected by the host for each radix digit of the input. Hardware resources are represented as masks, counter rows, Ambit B/C/D row groups, bank/subarray layout, and on-die ECC behavior. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| First-class CIM objects, Axis C | High-radix Johnson counters, mask rows for `Z`, counter row addresses, digit radix, overflow flag `O_next`, µProgram macros, AP/AAP command sequences, Ambit B/C/D row groups, on-die ECC checks | These objects are explicitly named in the mechanism: `Z` is stored as masks, `Y` as counters, `X` is converted into command streams, and the host tracks a virtual counter for IARM. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Rewrite object, Axis D | **Instruction stream + numeric format + mapping state + runtime state** | The paper rewrites input values into radix digits, skips zero digits, selects µPrograms, binds them to counter and mask row addresses, inserts overflow/carry-resolution commands, and optionally expands masking operations into ECC-checkable protected sequences. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Best corpus tags | `digital-CIM`, `DRAM-PIM`, `Ambit-style`, `bulk-bitwise`, `masked-accumulation`, `Johnson-counter`, `host-command-generation`, `µProgram`, `ECC-fault-tolerance`, `cycle-level-simulation` | These tags reflect the actual evidenced stack layer: arithmetic lowering to DRAM row operations and simulator-backed evaluation, rather than a general compiler IR. |
| Closest comparison baselines | **Ambit**, **SIMDRAM**, **MIMDRAM**, **BitBLAS/GPU baselines**, **FCDRAM-style controller integration**, **CORUSCANT / RTM-adjacent earlier versions** | Ambit provides the row-operation substrate; SIMDRAM is the main RCA-based in-DRAM arithmetic baseline; MIMDRAM is used for simulator validation; BitBLAS/GPU baselines are used for GEMV/GEMM comparison; FCDRAM is cited as a possible non-CPU controller path. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |

## 2. One-paragraph public summary

**Count2Multiply** contributes a digital-CIM masked accumulation primitive for integer-binary and integer-integer matrix operations by storing one operand as bit-sliced mask rows, storing outputs as high-radix Johnson-counter rows, and converting the other operand into host-generated Ambit-style memory-command µPrograms. Its compiler/IR relevance is clearest at the boundary between numeric lowering and backend instruction generation: input values are converted into radix digits, zero digits are skipped, row addresses are populated into preconstructed command macros, and a host-side virtual counter manages delayed carry propagation. The demonstrated stack is an Ambit-style commodity-DRAM CIM design evaluated with a cycle-level NVMain/RTSim extension over GEMV/GEMM-like kernels from LLaMA/LLaMA-2, BERT/LLama-3 attention, DNA pre-alignment filtering, and quantized GNN workloads. The work is best read as a hardware-software co-design and instruction-stream lowering study for digital-CIM arithmetic, with reusable ideas for representing masks, counter state, µProgram templates, and ECC-aware recomputation paths in a future CIM IR. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Count2Multiply is a digital CIM framework for multiplication, addition, and related operations using high-radix parallel counting. | Abstract and conclusion | Paper-only + algorithm + experiment | The paper defines high-radix Johnson-counter updates, maps them to Ambit-style AP/AAP commands, and evaluates GEMV/GEMM and other workloads. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The demonstrated scope is strongest for Ambit-style DRAM bulk-bitwise execution and manually selected matrix-like kernels. |
| Store `Z` in memory as masks, convert `X` into memory commands, and accumulate `Y` in column-wise counters. | Fig. 1 and Sec. VI | Mapping description + algorithm | `Z` is represented as mask rows, `Y` as high-radix counters, and `X` as an external input stream processed by the host and memory controller. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The reusable boundary is a masked-accumulation mapping, not a general tensor graph IR. |
| High-radix Johnson counters reduce carry-propagation work. | Sec. V and Algorithm 1 | Algorithm + operation-count experiment | Algorithm 1 describes variable-step incrementing for an n-bit Johnson counter, including forward shift, inverted feedback, and overflow checking; the paper reports k-ary counting reduces CIM operations by 2–6× over unary counting. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The mechanism is evidenced for radix/digit choices used in the DRAM-CIM evaluation; general backend portability would require re-lowering these steps to each CIM primitive set. |
| IARM delays carry rippling and uses host-side state to avoid unnecessary high-order digit updates. | Sec. V-D2 and Algorithm 2 | Algorithm + runtime-state model | Algorithm 2 tracks a software virtual counter, issues µPrograms for non-zero digits, and inserts overflow handling only when the virtual counter indicates it is needed. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The effective runtime abstraction is the host virtual counter plus `O_next`; it is not presented as a serialized IR object. |
| Fault tolerance is first-class and can use traditional row-wise ECC. | Abstract, Sec. VII | Algorithmic transformation + analytical fault table + experiment | The paper converts protected masking into XOR-checkable intermediate/final rows, uses on-die ECC signaling to restart from a safe checkpoint, and reports error/detect-rate estimates and application-level accuracy under CIM faults. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The paper-level evidence supports ECC-aware recomputation in the modeled DRAM setup; artifact-level confirmation of the full protected execution path was not found. |
| The host can generate µPrograms fast enough and with small code footprint. | Sec. VI-A and Sec. VIII-D | Algorithm + gem5-style runtime evaluation | The paper states that the host converts input digits, selects preconstructed µProgram macros, and can issue one AAP command every 8 ns; it also reports 20 AP/AAP commands per µProgram, 42 with protection, about 2 KB for four radix-4 µPrograms, and about 4 KB for Algorithm 2 code. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The evidenced interface is command generation for the Count2Multiply primitive; upstream compiler integration remains a design opportunity. |
| Count2Multiply supports GEMV, GEMM, shift-left, ReLU, and addition. | Contribution list and Sec. VI-B | Paper-only + algorithmic description | GEMV/GEMM are described in detail as masked accumulation; shift-left, ReLU, and vector addition are described as counter operations. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | GEMV/GEMM receive the clearest evaluation evidence; other tensor-style operations are described at the mechanism level. |
| Count2Multiply improves performance/efficiency over SIMDRAM and GPU baselines. | Abstract and Sec. VIII | Experiment | The abstract reports average improvements over A100 and SIMDRAM; Sec. VIII evaluates DDR5/HBM configurations, SIMDRAM, RTX 3090 Ti/A100, and BitBLAS GPU kernels. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | The comparisons are simulator-backed for in-DRAM designs and measured/benchmarked for GPU kernels under the paper’s selected workloads and assumptions. |

## 4. Stack anatomy

```text
Input / frontend:
```

`X`, `Z`, and `Y` tensors for integer-vector/matrix by binary/ternary matrix multiplication. `Z` is stored in memory as mask rows; `X` is read as an input stream and converted by the host into radix digits; `Y` is stored as high-radix counters. This is a workload format and mapping convention rather than a documented frontend IR. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Middle representation:
```

The named representation is the **µProgram**, a preconstructed sequence of AP/AAP memory commands implementing Johnson-counter increment steps. It is inspectable in the paper as command pseudocode and figures, but no confirmed serialized µProgram schema was found. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Mapping or scheduling state:
```

Mapping state consists of counter row addresses `JC_addr`, mask row addresses `m_addr`, digit radix `r`, bit-slice row placement for `Z`, Ambit B/C/D row groups, bank/subarray selection, and the host-side virtual counter used by IARM. These are explicit in algorithms and diagrams, but appear distributed across pseudocode, row-layout assumptions, and simulator setup rather than exposed as a single rewriteable file. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Hardware abstraction:
```

The hardware abstraction is Ambit-style DRAM CIM: multirow activation, AP/AAP commands, row-copy operations, DCC-based NOT, row buffer/sense-amplifier behavior, banks/subarrays, memory timing, and on-die ECC signaling. Table II gives DDR5/HBM-style parameters and the paper evaluates with commercial DRAM-like timings. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Backend / simulator / codegen:
```

The backend is a cycle-level CIM simulation model built by extending NVMain/RTSim; the codegen concept is host-side generation of ACT/PRE/AP/AAP command sequences from µProgram macros. Ambit and SIMDRAM implementations are reported as validated against prior published results and MIMDRAM’s simulator. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Output artifact:
```

The output is a memory-command stream plus updated in-memory counter rows. The command stream is described as deterministic from the host’s perspective; it is not shown as a portable binary, textual IR, or serialized trace format in the paper. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

```text
Evaluation loop:
```

The loop is workload-shape selection, row-layout/counter-radix setup, cycle-level DRAM-CIM simulation, comparison with SIMDRAM and GPU baselines, fault-rate/accuracy analysis, and overhead analysis for protection and host generation. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of `(Z bit-slice layout, Y counter layout, digit radix, JC address table, mask address table, µProgram macro library, virtual counter / O_next state, DRAM timing/configuration, ECC recomputation rule)`. The paper foregrounds high-radix counting and reliability, while the reusable compiler semantics are most visible in the host-side lowering contract: convert `X` into radix digits, skip zero digits, select µProgram templates, populate row addresses, and issue a backend command stream. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 narrow end-to-end co-design.** Count2Multiply owns a narrow but deep slice: masked integer accumulation in digital CIM, spanning arithmetic representation, DRAM row layout, host-side command generation, fault detection, and simulator-backed evaluation. Its input is a matrix/vector accumulation pattern; its output is an AP/AAP memory-command stream operating on mask and counter rows. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**Secondary: A2 simulator & cost model.** The paper’s quantitative evidence is produced by a cycle-level NVMain/RTSim extension with DRAM timing parameters, energy/area/performance comparisons, and fault-overhead modeling. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**Secondary: A3 mapping / scheduling / DSE framework.** The work performs mapping decisions over counter radix, row placement, number of banks, sparse zero skipping, bit slicing, carry propagation, and protection level. These decisions are described through algorithms and experiments rather than a general search framework. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**Not primary: A4 explicit IR / dialect / ISA compiler stack.** The work has an instruction-like µProgram interface, but the paper does not present a standalone IR, dialect, verifier, parser, or upstream compiler pass pipeline.

### 5.2 Axis B — middle-layer style

**B5 Instruction / meta-op / ILA.**  
The named middle representation is the **µProgram**. It is a backend-facing macro of Ambit-style memory commands, generated offline using majority synthesis and selected at runtime by input digit value. Decisions made here include which sequence of forward shifts, inverted feedback steps, AP/AAP commands, and protected recomputation steps realize a radix increment. A single artifact that upstream passes could read, verify, and rewrite was not found. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**B4 Hardware-resource IR.**  
The paper makes DRAM row groups, mask rows, counter rows, B/C/D Ambit groups, row addresses, banks, subarrays, and on-die ECC visible as mapping objects. Decisions made here include where masks and counters live, how `Z` is bit-sliced, how `Y` rows are reused or copied, and how memory commands are broadcast across subarrays. Some resource decisions remain embedded in the simulator configuration and row-layout assumptions. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**B6 Accuracy / nonideality modeling.**  
The reliability layer models CIM faults, ECC detection, recomputation, undetectable/detectable error probabilities, and application-level impact on DNA filtering and BERT. Decisions made here include protection level, FR repetition count, and restart point after an ECC failure. The model is explicit in the paper, but not found as a public reusable calibration package for Count2Multiply. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**B7 Runtime-state abstraction.**  
IARM introduces a host-side virtual counter and `O_next` state that governs delayed carry propagation. This is one of the most IR-relevant aspects: runtime state determines when a command is added to the stream. It is described as pseudocode rather than a serialized runtime table. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

**B1 Config-as-IR, partial.**  
DRAM parameters, bank counts, row sizes, timing values, radix choices, and fault-rate assumptions act like configuration-level IR in the evaluation. The paper lists these parameters, but a confirmed Count2Multiply configuration file format was not found. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / implicit**, DRAM-subarray hierarchy is explicit; analog crossbar hierarchy is not applicable | Fig. 1/Fig. 2 describe DRAM channel/rank/bank/subarray organization and Ambit B/C/D row groups. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Bit-slicing / bit significance | **First-class for `Z` masks** | Integer-integer operation is supported by bit-slicing matrix `Z`; CSD rows represent positive and negative powers of two. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| ADC/DAC precision or sensing | **Not applicable** | The demonstrated design is digital DRAM bulk-bitwise CIM; no analog ADC/DAC conversion path is part of the mechanism. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Analog-to-digital or domain transition | **Not applicable / digital-only** | The stack operates through digital bitwise row operations and host-issued commands rather than analog dot-product sensing. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Peripheral circuits as path nodes | **Parameter / costed** | Sense amplifiers, row buffer, DCC NOT path, memory controller, bank/subarray timing, and on-die ECC are part of the hardware abstraction and timing model. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Partial-sum accumulation path | **First-class** | `Y` is stored as high-radix Johnson counters; each column counter accumulates `X_i` when the corresponding `Z_i,j` mask bit is 1. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Reconstruction / shift-add tree | **Hard-coded / partially discussed** | Johnson-to-binary conversion can be skipped when followed by ReLU or LUT-based operators; power-of-two bit-slice scaling is handled by host shifts. A general reconstruction IR is not exposed. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for masks, overflow, sparsity; not applicable for KV cache/batching** | Masks, `O_next`, virtual counters, non-zero digit skipping, and sparse inputs are central to Algorithm 2 and the sparsity evaluation. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Value trajectory / flow path | **Approximated** | The value path is visible as `X` → radix digits → µProgram commands → masked counter updates → optional conversion/ReLU/LUT use, but identity is not represented as a first-class trajectory object. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |

### 5.4 Axis D — rewrite object

Count2Multiply rewrites **numeric format**, **instruction stream**, **mapping state**, and **runtime carry state**.

Legal transformations in the paper include converting binary `X` into radix digits, skipping zero digits, selecting `µProgram[incr]`, binding counter/mask row addresses, using CSD bit slices for ternary/integer `Z`, delaying carry propagation through IARM, and expanding masked operations into ECC-checkable XOR-style protected sequences. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

The exploited equivalences are arithmetic masked accumulation as a sum of outer products, Johnson-counter cyclic transitions, high-radix increments with the same command count as smaller increments within a digit, CSD bit-slice decomposition for signed integer `Z`, and ECC homomorphism over XOR to check protected intermediate/final rows. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

Information that must be preserved across lowering includes digit radix, digit position, counter row address, mask row address, bit significance/sign, overflow state, ECC restart point, bank/subarray placement, and timing constraints. The representation is especially well suited to **value-dependent command generation for masked accumulation**; expressing cross-operator trajectory rewrites, alternative reduction trees, or backend-independent tensor graph transformations would likely require an additional abstraction for value identity, bit-slice lifetime, and counter ownership across operator boundaries.

## 6. Technical mechanism reading

### 6.1 Masked accumulation as the central lowering

The core computation reinterprets matrix-vector multiplication as masked accumulation:

`Y_j += X_i` if `Z_i,j = 1`.

Instead of storing both operands in memory, Count2Multiply stores `Z` as mask rows and `Y` as column-wise high-radix counters. The host reads `X`, converts it into digit increments, and broadcasts the resulting memory commands to all arrays containing the relevant counters. This creates a natural “instruction stream from values” lowering: `X` does not become resident tensor data in the CIM array; it becomes the command sequence. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

### 6.2 Johnson-counter representation

A Johnson counter is used as the in-memory accumulator digit. The paper motivates this choice because adjacent states have single-bit transitions, which can reduce transition-related error exposure, and because the cyclic structure maps to shift plus inverted feedback operations. The in-memory counter is laid out so bits of a counter reside in memory rows while columns represent many counters in parallel. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

Algorithm 1 is the key lowering rule for a variable-step increment. It expresses a k-step update as masked forward shift, masked inverted feedback, and overflow update to `O_next`. This is the local arithmetic semantics that a compiler-style IR would need to preserve if it wanted to reason about Count2Multiply legality. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

### 6.3 µProgram generation and host-side command selection

The µProgram is the backend contract. The paper states that µPrograms are generated at compile time, then populated at runtime by the host with specific row addresses and selected by the input digit. In Sec. VI-A, the host reads elements of `X`, converts them from binary to the counter radix, selects an AP/AAP sequence from preconstructed assembly macros, and issues it through the memory controller. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

This is value-dependent code generation: the input digit determines both the µProgram choice and the counter-digit row addresses. For CIM compiler work, this is a concrete example where the boundary between “program” and “data” is intentionally shifted: operand values shape the backend command stream. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

### 6.4 Input-Aware Rippling Minimization

IARM is the runtime-state component. Rather than conservatively propagating carries through all higher-order digits, the host tracks a software virtual counter and only inserts carry-resolution commands when the virtual counter indicates that delayed overflow could become unsafe. Algorithm 2 shows that only non-zero digits are incremented, the virtual counter is updated, and `O_next` controls whether propagation continues. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

This is one of the most reusable compiler insights in the paper: carry scheduling is represented as a runtime state machine, not as a fixed lowering of every arithmetic operation into a full-width adder.

### 6.5 Bit-sliced signed/integer matrix support

For integer-integer multiplication, the paper decomposes `Z` into bit-sliced rows using canonical signed digit style encoding. Positive and negative rows represent powers of two, and the host scales inputs according to the bit-slice row address, using shifts rather than CPU multiplication to generate command increments. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

This makes bit significance and sign visible in the row layout. In a compiler IR, these would be natural type or layout attributes: `mask_row(sign=+, bit=0)`, `mask_row(sign=-, bit=0)`, and so on.

### 6.6 ECC-aware protected operations

The reliability mechanism uses the fact that conventional ECCs are homomorphic over XOR but not directly over AND/OR. The paper therefore embeds masking operations into XOR-checkable intermediate/final rows, then uses on-die ECC signaling to detect faults and restart from a safe checkpoint. The protected forward-shift µProgram and fault-propagation example show the recomputation boundary. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

The useful IR reading is that protection is not merely a hardware flag; it changes the instruction stream and introduces checkpoint/retry semantics. A future IR could model this as a verified rewrite from `masked_update` to `protected_masked_update(restart=line_2, checks=FR)`.

### 6.7 Cost model and simulator assumptions

The performance model combines operation counts, DRAM timing, bank-level parallelism, row utilization, host command-generation overhead, fault detection/recomputation overhead, and workload sparsity. The paper evaluates DDR5 and HBM2e-style configurations and states that Ambit-style DRAM CIM was simulated by extending NVMain/RTSim with a cycle-level CIM model. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

The paper’s strongest experimental evidence is for GEMV/GEMM-like tensor shapes and selected real-world proxies: LLaMA/LLaMA-2 GEMV/GEMM dimensions, BERT and LLama-3 attention operations, DNA filtering, and INT4 GNN workloads. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The operand value becomes the instruction stream

- **Observation:** Count2Multiply stores one operand as masks and turns the other operand into AP/AAP command sequences. The host selects µPrograms based on each non-zero radix digit of `X`. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** This suggests an IR boundary where tensor values can be lowered into backend actions rather than only into memory-resident data.  
- **Reusable lesson:** A future CIM IR could represent `broadcast_increment(value_digit, mask_row, counter_row)` as a typed meta-op with value-dependent expansion rules.

### Insight 2 — The hidden IR is a tuple of layout, macro, and runtime state

- **Observation:** The semantics live across `Z` bit-slice rows, `Y` counter rows, `JC_addr`, `m_addr`, digit radix, µProgram macros, and the IARM virtual counter. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** None of these objects alone captures the computation; legality depends on their combination.  
- **Reusable lesson:** A compiler stack could expose this tuple as a first-class mapping state, making carry scheduling, row ownership, and bit significance inspectable.

### Insight 3 — Carry propagation is a schedulable event

- **Observation:** IARM treats carry propagation as an event triggered by virtual-counter state rather than a fixed consequence of every increment. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** It separates arithmetic equivalence from schedule choice, allowing latency reductions while preserving counter correctness.  
- **Reusable lesson:** Future IRs could represent “deferred carry obligation” as state attached to an accumulator, similar to a pending reduction or delayed normalization.

### Insight 4 — ECC protection is an instruction-stream rewrite

- **Observation:** Fault protection expands masking operations into XOR-checkable intermediate/final rows and adds recomputation points. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** Reliability is not just a cost annotation; it changes the backend command stream and introduces restart semantics.  
- **Reusable lesson:** CIM IRs could treat fault protection as a verified lowering pass with explicit check rows, check frequency, and recovery scope.

### Insight 5 — Bit slicing is a row-layout type system in disguise

- **Observation:** Signed/integer `Z` values are decomposed into bit-sliced positive and negative rows, and the host scales `X` according to row bit significance. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** Bit significance is not merely numeric metadata; it determines row address selection and command scaling.  
- **Reusable lesson:** A future IR could attach `sign`, `bit_position`, `scale`, and `row_group` to mask rows as type-like information.

### Insight 6 — Simulator parameters define much of the backend contract

- **Observation:** DRAM organization, timing, bank count, row size, ECC availability, and FR-FCFS scheduling are central to the evaluation. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Why it matters for CIM compiler/IR work:** A mapper cannot reason about Count2Multiply performance without these backend parameters.  
- **Reusable lesson:** Treat timing/configuration files as backend dialect attributes rather than incidental simulator setup.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public repository found, but the artifact is partial / relevance unclear.** I found a public GitHub repository named **SU-JonesLab/C2M**, described by GitHub as “C2m implementation in DRAM-Bender” and forked from `Frank1412/Count2Multiply`. ([GitHub](https://github.com/SU-JonesLab/C2M))

- **Artifact URL or identifier:** `SU-JonesLab/C2M` GitHub repository.  
- **License:** MIT License is present, with copyright attributed to the SAFARI Research Group at ETH Zürich; this appears to apply to the repository content as published, not necessarily a confirmed full Count2Multiply artifact. ([GitHub](https://github.com/SU-JonesLab/C2M/blob/master/LICENSE))  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** A DRAM-Bender directory, an `analysis` directory with `plot_all_results.py`, and an `experimental_data` directory whose README points to a Zenodo package for experimental data. ([GitHub](https://github.com/SU-JonesLab/C2M))  
- **What the artifact appears to omit or leave unclear:** The repository README text identifies a DSN’24 “Simultaneous Many-Row Activation” artifact rather than Count2Multiply’s HPCA 2026 NVMain/RTSim evaluation; I did not find a paper-linked artifact appendix, release, simulator fork, workload scripts, or documented Count2Multiply reproduction workflow in the checked sources. ([GitHub](https://github.com/SU-JonesLab/C2M/blob/master/README.md))  
- **Minimal command or workflow, if documented:** The README documents a DRAM-Bender characterization workflow using `run_all_scripts.py`, with a multi-week expected runtime for a DRAM module; this workflow appears to correspond to the DSN’24 characterization README rather than the HPCA 2026 Count2Multiply evaluation. ([GitHub](https://github.com/SU-JonesLab/C2M/blob/master/README.md))  
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in the checked sources. The visible repository documentation points to characterization experiments and plots, not clearly to Count2Multiply figures 13–18.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Tensor roles and shapes are described; no standalone workload schema was found. |
| Intermediate representation serialized | Unknown | µPrograms are described, but no confirmed serialized IR/trace format was found. |
| Mapping decisions inspectable | Partial | Row groups, masks, counters, bit slices, and addresses are in diagrams/pseudocode. |
| Schedule inspectable | Partial | Host-side schedule is visible in Algorithm 2 and µProgram descriptions. |
| Hardware config explicit | Yes | DRAM/HBM parameters and timing values are listed in Table II. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Precision / bit-slice assumptions explicit | Yes | INT8-INT2, INT4, ternary `Z`, radix-4 counters, and 64-bit accumulation capacity are described. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Cost model inspectable | Partial | Operation counts, timing, bank scaling, protection overhead, and host overhead are reported; implementation files were not confirmed. |
| Simulator backend documented | Partial | Paper states NVMain/RTSim extension and validation; public simulator source was not confirmed. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) |
| Generated code / instruction stream inspectable | Partial | µProgram pseudocode and command sequences are in the paper; no confirmed generated traces. |
| Provenance from source op to backend action | Partial | GEMV/GEMM lowering from `X,Z,Y` to µProgram increments is described, but not via an auditable compiler log. |
| Reproduction scripts available | Partial / unclear | A public repository contains scripts, but visible documentation appears tied to a different DRAM characterization artifact. |
| Calibration source documented | Partial | Simulator validation sources are cited; raw calibration files for Count2Multiply were not found. |

### 8.3 Integration helper

- **As frontend:** Limited direct reuse. The paper’s workload frontend is a set of tensor shapes and workload assumptions, not a parser or importer.  
- **As IR inspiration:** Strong reuse potential for `masked_accumulate`, `counter_digit`, `mask_row`, `bit_slice_row`, `µProgram`, `overflow_obligation`, and `protected_update` abstractions.  
- **As mapper/scheduler:** The IARM logic, zero-digit skipping, row reuse for `Y`, and bank/subarray command interleaving are useful mapper/scheduler ingredients.  
- **As cost model:** Operation counts, bank scaling, radix/capacity tradeoffs, protection overhead, and host generation overhead could become backend cost-model plugins.  
- **As backend:** Wrapping the µProgram-to-AP/AAP interface would be the most direct backend integration path, provided a simulator implementation or command schema is available.  
- **As benchmark:** GEMV/GEMM shapes from LLaMA/LLaMA-2, transformer attention, DNA filtering, and GNN workloads can be reused as digital-CIM masked-accumulation benchmarks. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **As validation source:** The paper provides simulator-backed DRAM-CIM comparisons and fault/accuracy studies; no real-chip Count2Multiply validation artifact was confirmed.

**Integration effort estimate: Medium to High.** Integration would be most direct through the µProgram boundary and the mapping tuple `(radix, mask rows, counter rows, row addresses, virtual counter state)`. Reuse would benefit from a small adapter that extracts Algorithm 2-style command generation into a backend-independent library. Effort rises because the published evidence describes the interface in paper form, while a confirmed complete NVMain/RTSim artifact and serialized command format were not found.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially for digital-CIM trajectories where values move through **host digitization → command stream → mask-conditioned row update → counter state → optional conversion or direct reuse**. The closest approximation to trajectory semantics is the combination of `Z` mask row placement, `Y` counter row identity, digit radix, `O_next`, and µProgram selection. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

- **Does the paper name the path a value takes through CIM resources?** Partially. It names the host-side conversion of `X`, the storage of `Z` as masks, the storage of `Y` as counters, and the AP/AAP command path through the memory controller. It does not package this as a first-class value trajectory. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?** For this digital DRAM-PIM setting, analog partial sums and ADC sensing are not applicable. Value identity is partially preserved through counter row addresses and digit positions, but not through a general cross-operator value-flow representation.  
- **Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?** Bit significance and sign are visible in the bit-sliced `Z` rows; placement is visible through row addresses and Ambit groups; precision appears as radix, integer width, and accumulation capacity. These are represented as mechanism parameters rather than type-system objects. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Could the representation express fusing reconstruction with downstream reduction?** The paper notes that Johnson-to-binary conversion can be skipped when followed by ReLU or LUT-style operators, which is a useful ingredient. A trajectory-level extension would attach encoding and consumer-operator compatibility metadata to counter values. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))  
- **Could it express delaying or retiming ADC conversion?** ADC retiming is not applicable to the demonstrated digital DRAM-CIM path.  
- **Could it carry bit-sliced partial sums across operator boundaries?** It suggests this possibility for Johnson-encoded outputs reused by ReLU/LUT-based operations, but a full cross-operator bit-slice lifetime model would require an additional abstraction.  
- **Could it change reduction tree structure or route through alternative peripheral paths?** The paper’s demonstrated abstraction centers on masked counter updates and carry scheduling; trajectory-level rewrites would add explicit path alternatives for row-buffer, DCC, ECC, copy, and counter-reuse choices.  
- **Could it co-optimize data movement and numeric reconstruction?** Yes, as an extension. The row-reuse discussion for matrix rows of `Y` and the avoidance of copying many `Z` rows provide a concrete starting point for data-movement-aware trajectory metadata. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf))

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **Ambit** | Bulk-bitwise DRAM operations, MAJ/NOT primitives, row-group constraints | Count2Multiply builds a masked high-radix counter and host µProgram layer on top of Ambit-style AP/AAP primitives. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | Classify Ambit-like works as backend primitive substrates; Count2Multiply is a higher arithmetic/mapping layer over that substrate. |
| **SIMDRAM** | In-DRAM arithmetic and matrix-like computation | SIMDRAM is the main RCA-style in-DRAM arithmetic baseline; Count2Multiply replaces bit-serial RCA-style accumulation with high-radix Johnson counting and zero-digit skipping. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | Useful contrast between “adder circuit as primitive” and “counter/masked accumulation as primitive.” |
| **MIMDRAM** | End-to-end DRAM-PIM system and simulator validation | MIMDRAM is used as a validation reference for the simulator, while Count2Multiply focuses on a specific arithmetic primitive and command-generation scheme. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | Helps distinguish broad DRAM-PIM execution systems from narrow arithmetic co-designs. |
| **BitBLAS / GPU baselines** | Low-precision GEMV/GEMM comparison | Count2Multiply compares against RTX 3090 Ti/A100 and uses BitBLAS for GEMV/GEMM GPU implementations. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | These are performance baselines, not CIM stack papers; corpus comparisons should avoid treating them as IR-neighbor works. |
| **FCDRAM-style controller integration** | Controller-side orchestration of in-memory commands | The paper cites FPGA or specialized memory-controller execution as alternative hosts for µProgram orchestration. ([CFAED](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2602_Lima_HPCA.pdf)) | Highlights that the µProgram interface could be hosted by CPU, FPGA, or memory-controller logic. |
| **CORUSCANT / RTM-adjacent earlier framing** | Digital bulk-bitwise CIM in non-DRAM memory | Earlier arXiv versions discuss broader technology compatibility, while the final HPCA PDF’s evidenced evaluation centers on commodity DRAM/Ambit-style operation. ([arXiv](https://arxiv.org/html/2409.10136v3)) | For corpus placement, use final-paper evidence: technology-portability claims should be separated from demonstrated backend scope. |

## 11. Corpus-ready final takeaway

- Count2Multiply’s evidenced contribution is a **digital-CIM masked accumulation primitive** based on high-radix Johnson counters, mask rows, host-generated µPrograms, and ECC-aware recomputation.
- The strongest reusable stack layer is the **lowering boundary from input values and bit-sliced masks to AP/AAP command streams**.
- The demonstrated scope is **Ambit-style commodity DRAM CIM**, evaluated with a cycle-level NVMain/RTSim extension and GEMV/GEMM-like workloads.
- First-class objects include **mask rows, counter rows, radix digits, overflow flags, µProgram macros, AP/AAP commands, Ambit row groups, and ECC check/retry state**.
- The hidden IR is the combined mapping/runtime tuple: `(Z bit-slice layout, Y counter layout, row addresses, digit radix, µProgram library, virtual counter, ECC policy, DRAM timing)`.
- Artifact status is **public repository found, but partial / relevance unclear**; no confirmed full Count2Multiply reproduction workflow or NVMain/RTSim artifact was found in the checked sources.
- Integration would be most direct as a **backend plugin or mapper/scheduler component** for digital-CIM masked accumulation.
- For a value-trajectory IR, Count2Multiply is most relevant as a model of **digital value trajectory through masks, counter digits, carry obligations, and protected command expansion**.

## 12. Suggested metadata entry

```yaml
paper: "Count2Multiply: Reliable In-Memory High-Radix Counting"
year: 2026
venue: "HPCA 2026"
authors_or_group: "João Paulo C. de Lima, Benjamin Morris III, Asif Ali Khan, Jeronimo Castrillon, Alex K. Jones"
technology:
  - DRAM-PIM
  - digital-CIM
  - Ambit-style bulk-bitwise DRAM
workloads:
  - GEMV/GEMM shapes from LLaMA and LLaMA-2
  - BERT and LLama-3 attention GEMV/GEMM
  - DNA pre-alignment filtering
  - GCN / GIN / GraphSAGE node classification
axis_A:
  primary: A5_narrow_end_to_end_codesign
  secondary:
    - A2_simulator_cost_model
    - A3_mapping_scheduling_DSE
axis_B:
  - B5_instruction_metaop_ILA
  - B4_hardware_resource_IR
  - B6_accuracy_nonideality_modeling
  - B7_runtime_state_abstraction
  - B1_config_as_IR_partial
axis_C_first_class_objects:
  - high_radix_Johnson_counter
  - mask_row_for_Z
  - counter_row_for_Y
  - digit_radix
  - O_next_overflow_flag
  - virtual_counter
  - uProgram_macro
  - AP_AAP_memory_command
  - Ambit_B_C_D_row_group
  - ECC_check_and_recompute_state
axis_D_rewrite_objects:
  - numeric_format
  - instruction_stream
  - memory_layout
  - hardware_mapping
  - runtime_state
  - fault_protection_expansion
artifact:
  status: "public repository found; partial / relevance unclear"
  url: "SU-JonesLab/C2M GitHub repository"
  license: "MIT license in repository; applicability to full Count2Multiply artifact unclear"
  last_checked: "2026-05-15"
integration_roles:
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: low_to_medium
trajectory_IR_relevance: medium
notes:
  - "Best classified as a hardware-software co-design for digital-CIM masked accumulation rather than a general compiler IR stack."
  - "The reusable compiler boundary is the host-side lowering from radix digits and row addresses to AP/AAP µProgram command streams."
  - "The paper provides strong paper-level evidence for mapping, command generation, fault protection, and cycle-level simulation; full artifact-level reproduction remains unclear."
```