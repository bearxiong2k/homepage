---
slug: pimsynth
title: "PIMsynth: A Unified Compiler Framework for Bit-Serial Processing-in-Memory Architectures"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "IEEE Computer Architecture Letters"
authors_or_group: "Deyuan Guo, Mohammadhosein Gholamrezaei, Matthew Hofmann, Ashish Venkat, Zhiru Zhang, Kevin Skadron"
summary: >-
  PIMsynth is a public compiler framework for generating bit-serial PIM microprograms from bit-parallel combinational Verilog. Its clearest contribution is an automated lowering path that combines Yosys/ABC logic synthesis, a GenLib-described bit-serial PIM instruction set, analog-PIM-specific transformations for TRA/MAJ/DCC behavior, LLVM-based scheduling and register allocation, and PIMeval-backed functional/performance validation. The demonstrated setting is fixed-width integer and bitwise combinational kernels over 8/16/32/64-bit operands, evaluated on representative digital and analog DRAM-PIM programming models with small single-bit register sets. For CIM compiler/IR research, PIMsynth is most useful as a bit-level compiler-stack example where the first-class object is neither a neural-network tensor graph nor an array placement map, but a bit-serial operation DAG plus a constrained register/simulator instruction interface. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))
links:
  paper:
  artifact: https://github.com/UVA-LavaLab/PIMsynth
  docs:
  code:
technology:
  - "DRAM-PIM"
  - "digital-CIM"
  - "analog-CIM"
  - "bit-serial-PIM"
workloads:
  - "fixed-width integer arithmetic"
  - "fixed-width relational and logical operations"
  - "min/max"
  - "shifts"
  - "population count"
  - "AES S-box variants in artifact"
tags: []
baselines: []
axis_A:
  primary: A4
  secondary: [A3, A5]
axis_B: [B2, B5, B4]
axis_C_first_class_objects:
  - "bit-serial operation DAG"
  - "GenLib-defined PIM ISA gates"
  - "PIM mode"
  - "register count"
  - "single-bit PIM registers"
  - "memory row read/write"
  - "digital PIM LU op"
  - "analog TRA/MAJ op"
  - "DCC NOT support"
  - "AP/AAP multi-output operation"
  - "PIMeval API call"
axis_D_rewrite_objects:
  - "graph"
  - "instruction stream"
  - "hardware-resource allocation"
  - "register allocation"
  - "copy insertion"
  - "Boolean normalization"
  - "analog destructive-use legality"
artifact:
  status: "public artifact found"
  url: "https://github.com/UVA-LavaLab/PIMsynth"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "frontend"
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Reusable boundary is clearest at GenLib/BLIF/PIM IR-1 and PIMeval API codegen."
  - "Demonstrated scope is bit-serial DRAM-PIM kernels, not general tensor/loop-level CIM compilation."
  - "Analog-specific transformation sequence is valuable for modeling destructive CIM operations."
  - "Exact paper-figure reproduction from artifact was not confirmed from checked top-level documentation."
takeaways: []
---

# PIMsynth — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A4 Explicit IR / dialect / ISA compiler stack** | PIMsynth is organized as a compiler pipeline from Verilog + GenLib-defined bit-serial ISA + register count to BLIF, IR-1, RISC-V assembly / IR-2, PIMeval C++ microprograms, and tests. The paper frames this as a fully automated compiler for digital and analog bit-serial PIM. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Secondary stack roles, Axis A | **A3 Mapping / scheduling / DSE framework; A5 narrow end-to-end co-design** | The middle of the stack performs technology mapping, analog-specific graph transformation, LLVM-based scheduling/register allocation/spilling, and simulator-backed validation. The demonstrated end-to-end scope is bounded to two bit-serial DRAM-PIM programming models. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR; B5 Instruction / meta-op / ILA; B4 Hardware-resource IR** | The paper names IR-1 as a bit-serial data-dependency graph and IR-2 as the scheduled/register-allocated form; the artifact serializes PIM IR-1 as a text format with module, mode, register count, inputs, outputs, temps, and opcode lines. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| First-class CIM objects, Axis C | **Bit-serial operation DAG; GenLib ISA gates; single-bit PIM registers; memory row read/write; digital LU ops; analog TRA/MAJ, AP/AAP, DCC row access; register spill read/write pairs** | The paper directly names the digital and analog programming models, single-bit registers, TRA/DCC-enabled rows, AP/AAP primitives, and PIMeval APIs for row read/write and logical operations. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Rewrite object, Axis D | **Graph + instruction stream + hardware-resource allocation** | Rewrites include logic synthesis / technology mapping into a GenLib-defined operation set, analog-compatible graph transformations, priority-aware topological sorting, scheduling, register allocation, spilling, and backend API emission. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Best corpus tags | `bit-serial-PIM`, `DRAM-PIM`, `digital-PIM`, `analog-PIM`, `compiler-stack`, `ISA-as-GenLib`, `graph-lowering`, `register-allocation`, `PIMeval`, `Verilog-benchmarks` | These tags reflect the paper’s actual reusable boundary: bit-parallel combinational Verilog lowered to bit-serial PIM microprograms through explicit ISA, scheduling, and simulator interfaces. |
| Closest comparison baselines | **SIMDRAM, CHOPPER, PIMLC, PIMeval/PIMbench, MIMDRAM** | SIMDRAM is closest on analog DRAM bit-serial MAJ/NOT compilation; CHOPPER is closest as a compiler infrastructure for programmable bit-serial PUD; PIMLC is close as a Boolean-function-to-PIM-instruction compiler for SRAM/ReRAM PIM; PIMeval/PIMbench is the simulator/backend contract; MIMDRAM builds on SIMDRAM’s bit-serial compilation path. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |

## 2. One-paragraph public summary

PIMsynth is a public compiler framework for generating bit-serial PIM microprograms from bit-parallel combinational Verilog. Its clearest contribution is an automated lowering path that combines Yosys/ABC logic synthesis, a GenLib-described bit-serial PIM instruction set, analog-PIM-specific transformations for TRA/MAJ/DCC behavior, LLVM-based scheduling and register allocation, and PIMeval-backed functional/performance validation. The demonstrated setting is fixed-width integer and bitwise combinational kernels over 8/16/32/64-bit operands, evaluated on representative digital and analog DRAM-PIM programming models with small single-bit register sets. For CIM compiler/IR research, PIMsynth is most useful as a bit-level compiler-stack example where the first-class object is neither a neural-network tensor graph nor an array placement map, but a bit-serial operation DAG plus a constrained register/simulator instruction interface. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “A fully automated, end-to-end compilation flow” for digital and analog bit-serial PIM, supporting multiple instruction sets and register configurations | Contributions list and compiler main-flow section | Algorithm + code/artifact + experiment | The paper defines inputs as Verilog, a GenLib ISA, and target register count; the artifact exposes CLI stages from Verilog/BLIF/C/ASM to PIM/test and a README flow from `.v` to `.hpp` PIM microprograms and PIMeval simulation. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Demonstrated for bit-parallel combinational Verilog kernels lowered to bit-serial PIM under the paper’s digital/analog DRAM-PIM programming models. Broader high-level languages and PIM architectures are explicitly future work. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| A transformation and optimization flow that converts digital circuits into analog-PIM-compatible IR | Contributions list; Section III-B; Fig. 4 | Algorithm + artifact | The paper describes steps for global input replication, AND/OR-to-MAJ normalization, inverter elimination through DCC, and resolving input-destructive requirements through inout reuse, multi-output operations, or copy insertion. The artifact directory contains corresponding transformer modules such as MAJ normalization, inverter elimination, inout-variable reuse, multi-destination optimization, port isolation, and copy insertion. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | The reusable boundary is clearest for analog bit-serial DRAM-PIM operations based on TRA/MAJ, DCC NOT, and AP/AAP-style primitives. |
| A benchmark suite of Verilog modules implementing bit-parallel operations | Contributions list; Evaluation Section IV-B | Documentation + code/artifact | The paper lists 8/16/32/64-bit integer arithmetic, relational/logical operations, min/max, shift, and popcount. The artifact directory exposes many benchmark Verilog files, including arithmetic, comparison, min/max, popcount, shift, and AES S-box variants. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Demonstrated as fixed-width combinational modules for bit-serial compilation; larger applications, floating point, and LUT-style logic are discussed as extensibility directions rather than fully evidenced benchmark families. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| A PIMeval extension for correctness and performance/energy modeling of generated micro-op workloads | Abstract, contributions list, codegen/simulation sections | Paper-only + code/artifact | The paper states that PIMeval is extended for bit-serial PIM primitives and that generated tests run micro-op-level simulation. The artifact includes PIMeval as a submodule dependency and code generators mapping digital/analog instructions to PIMeval APIs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Artifact-level confirmation is strongest for the compiler-to-PIMeval API boundary and test workflow; exact reproduction of paper plots depends on the build/submodule state and result-collection scripts. |
| Compiler-generated code is close to hand-optimized baselines | Abstract and Evaluation Section IV-C / Fig. 5 | Experiment | The paper reports geometric means of 1.08× for digital PIM and 1.54× for analog PIM relative to hand-optimized baselines, with digital baselines from PIMeval/PIMbench and analog baselines from SIMDRAM/MIMDRAM-style sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Evaluated on a subset of benchmarks selected by baseline availability and operation type; the paper frames the result as preliminary and leaves improved synthesis/scheduling and broader target support to future work. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |

## 4. Stack anatomy

```text
Input / frontend:
  Verilog combinational modules plus submodule RTL, a GenLib file describing the bit-serial PIM ISA, target PIM mode, and register count. The input is documented in the paper and artifact CLI; benchmark inputs are serialized as .v files and GenLib libraries. Reusable for bit-level combinational kernels. 

Middle representation:
  Tech-independent BLIF, ABC-mapped BLIF DAG, PIM IR-1, generated C, and RISC-V assembly / IR-2. The paper names IR-1 as the bit-serial data-dependency graph and IR-2 as the scheduled/register-allocated form; the artifact serializes PIM IR-1 as a text format with header directives and opcode lines. Inspectability is relatively strong at BLIF, .pim_ir1, .c, and .s outputs.

Mapping or scheduling state:
  Technology mapping is encoded through GenLib and ABC; analog legality rewrites are encoded by graph-transformation passes; scheduling/register allocation/spilling are delegated to LLVM through generated C and RISC-V assembly. The mapping state is partially inspectable through generated BLIF, PIM IR-1, assembly, output logs, and run scripts.

Hardware abstraction:
  Two programming models: digital bit-serial PIM with logic units attached to sense amplifiers and small single-bit registers; analog bit-serial PIM with TRA/MAJ, DCC rows for NOT, AP/AAP operations, and TRA/DCC-enabled register rows. A minimal target file in the artifact also records opcode latency classes and operand kinds.

Backend / simulator / codegen:
  The backend emits PIMeval C++ API calls. Digital codegen maps logical opcodes to PIMeval operations such as pimOpAnd, pimOpXor, pimOpMaj, and row read/write calls; analog codegen maps read/write and logic to AP/AAP-style PIMeval calls and register-file rows.

Output artifact:
  Generated .hpp bit-serial PIM microprogram, generated tests, bitwise verification code, logs, and summary files. The README describes `.hpp` microprograms feeding a test generator and PIMeval simulation; the run script builds and executes generated PIM and bitwise test binaries.

Evaluation loop:
  Compile benchmark → generate PIMeval API code and bitwise reference/test → build generated test → run PIM test and bitwise test → grep logs for read/write/logic/AP/AAP counts and test pass strings. Paper evaluation then uses timing parameters from a DDR4_8Gb_x16_3200 model and compares generated execution time with hand-written baselines.
```

The pipeline above is supported by the paper’s main-flow description and the artifact’s README/source layout. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the GenLib ISA, BLIF DAG, PIM IR-1 text, generated C used to steer LLVM, RISC-V assembly / IR-2, and the PIMeval codegen templates. The paper foregrounds a unified compiler flow, while the reusable semantics are most visible in the serialized PIM IR-1 format, the analog graph-rewrite pass names, the register/opcode mapping tables, and the PIMeval API emission layer. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/blif-translator/generator_pim_ir1.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A4 Explicit IR / dialect / ISA compiler stack.**  
PIMsynth owns the slice from bit-parallel Verilog to bit-serial PIM microprogram. Its input boundary is Verilog + GenLib ISA + register count; its output boundary is PIMeval-executable micro-op code plus tests. The paper names intermediate states IR-1 and IR-2, and the artifact now exposes PIM IR-1 as a text, line-oriented format. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The work performs technology mapping into a target operation set, analog graph normalization, instruction scheduling, register allocation, and spill insertion. The register count is a target parameter, and spilling is modeled as extra row read/write traffic. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

**Secondary: A5 Narrow end-to-end co-design.**  
The stack is end-to-end for a carefully scoped bit-serial DRAM-PIM setting: frontend kernels, compiler passes, backend microprograms, generated tests, and simulator evaluation. The paper explicitly bounds support to two programming models and leaves broader PIM architectures and higher-level languages to future work. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is the bit-serial data-dependency graph / PIM IR-1. Decisions made here include operation normalization, analog compatibility, input replication, copy insertion, and transformation into opcodes that can later be scheduled. Decisions that remain embedded include pass ordering, exact topological priorities, and the target-specific meaning of opcodes. The artifact provides a single serialized PIM IR-1 text file that upstream tools could read and rewrite, although a formal schema beyond the generator docstring was not found in the checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

**B5 Instruction / meta-op / ILA.**  
GenLib acts as an ISA-as-library boundary for synthesis, and IR-2 / RISC-V assembly acts as the scheduled/register-allocated instruction stream. Decisions made here include opcode selection, register allocation, spilling, and PIMeval API translation. The instruction semantics are readable through GenLib gate definitions and codegen opcode maps, but the complete backend contract is distributed across parser/codegen files and PIMeval APIs. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src-genlib/all.genlib))

**B4 Hardware-resource IR.**  
Hardware resources enter as register count, digital/analog mode, row read/write costs, AP/AAP/TRA/DCC behavior, and PIMeval register identifiers. The artifact exposes register counts in CLI parameters and IR-1 headers, plus opcode/register maps in the backend. A single standalone hardware-resource IR is not the main artifact; the resource model is spread across command-line arguments, generated IR headers, `pim_target.py`, and backend codegen. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/bit_serial_compiler.py))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable / implicit** | The demonstrated substrates are DRAM-PIM programming models with subarrays, rows, sense amplifiers, LUs, and TRA/DCC-enabled rows rather than crossbar macros. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Bit-slicing / bit significance | **Implicit / workload-level** | The work is bit-serial and compiles fixed-width bit-parallel Verilog operations, but the first-class compiler object is the bit-level operation graph rather than a typed bit-significance field. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| ADC/DAC precision or sensing | **Not applicable** | The evaluated models are digital LU operations and analog DRAM TRA/DCC-style majority logic, not analog crossbar MACs with ADC/DAC conversion. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Analog-to-digital or domain transition | **Not applicable / implicit** | The analog path remains within bit-serial DRAM row operations and PIMeval AP/AAP/DCC abstractions; no ADC/DAC stage is named. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Peripheral circuits as path nodes | **Parameter / backend API node** | Digital LUs, sense amplifiers, row read/write, TRA/DCC rows, and AP/AAP operations are named and code-generated, but not represented as a general graph of peripheral circuit path nodes. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Partial-sum accumulation path | **Not applicable** | The workloads are fixed-width logical/integer bit-serial kernels, not analog MAC partial-sum accumulation. |
| Reconstruction / shift-add tree | **Implicit / not central** | Fixed-width arithmetic is expressed as bit-level Verilog and logic graphs; no separate numeric reconstruction tree is made first-class in the checked paper/artifact evidence. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable** | The demonstrated stack targets static bit-serial kernels and generated tests, not runtime batching or model-serving state. |
| Value trajectory / flow path | **Approximated by dependency graph and instruction stream** | The closest value-path object is the bit-serial data-dependency graph plus read/write/register operations and analog transformations that protect or duplicate variables under input-destructive MAJ behavior. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |

### 5.4 Axis D — rewrite object

PIMsynth rewrites **logic graphs and instruction streams**. The key transformations are:

- Verilog bit-parallel combinational logic → technology-independent BLIF → GenLib-mapped BLIF DAG. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/bit_serial_compiler.py))
- Digital circuits → bit-serial PIM IR-1 dependency graphs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))
- Analog compatibility rewrites: input/output copy insertion, MAJ normalization, inverter elimination via DCC-style inverted inputs, inout-variable reuse, multi-output packing, and fallback copy insertion. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))
- PIM IR-1 / generated C → LLVM scheduling/register allocation/spilling → RISC-V assembly / IR-2. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))
- Assembly / IR-2 → PIMeval API code for digital or analog backends. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/bit_serial_compiler.py))

Legal equivalences are mostly Boolean and bit-level: AND/OR expressed through MAJ with constants, NOT absorbed into MAJ operands via DCC, copies inserted or packed through AP/AAP multi-output behavior, and scheduling/register-allocation choices that preserve the bit-level DAG dependencies. Information that must be preserved includes gate opcode semantics, dependency order, input/output identity, temporary value liveness, target register count, digital/analog mode, and destructive-use constraints for analog operations.

The representation is especially well suited to bit-level Boolean/arithmetic lowering and register-constrained bit-serial scheduling. Expressing cross-operator value trajectories, analog MAC accumulation/reconstruction choices, ADC retiming, or multi-level memory hierarchy routing would likely require an additional abstraction for value identity, numeric stage, domain transition, and path/resource binding.

## 6. Technical mechanism reading

### 6.1 Frontend and ISA-as-GenLib

PIMsynth uses Verilog as the source language because bit-parallel combinational logic can be handed to standard logic synthesizers, then interpreted as a bit-serial data-dependency graph. The target ISA is expressed as a GenLib standard-cell library, allowing ABC/Yosys mapping to choose among gates/operations supported by a target PIM architecture. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

The artifact makes this boundary concrete: `src-genlib` contains libraries such as `inv_nand`, `inv_maj_and`, `inv_maj_and_or`, `inv_and_xnor_mux`, and related gate sets; `all.genlib` defines constants, INV, AND/NAND, OR/NOR, XOR/XNOR, MUX, and MAJ gate forms. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main/src-genlib))

### 6.2 Digital and analog programming models

The digital model assumes vertical data layout in DRAM subarrays, lightweight bit-serial LUs attached to sense amplifiers, row reads into sense amplifiers, register copies, bit-serial logic on single-bit registers, and row writes. The analog model assumes TRA-based MAJ, AND/OR through MAJ with constants, DCC-enabled rows for NOT, and a small group of TRA/DCC-enabled register rows before writing results back to regular rows. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

A compiler-relevant detail is that analog TRA operations are input-destructive. The paper uses this to motivate copy/replication, inout-variable reuse, multi-output AAP packing, and related legality transformations before scheduling. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

### 6.3 IR-1 and analog graph transformations

The paper names PIM IR-1 as a bit-serial data-dependency graph before scheduling. The artifact serializes PIM IR-1 with a module name, mode, register count, inputs, outputs, temps, and opcode lines; it also supports multi-output gates by placing space-separated outputs before the first comma. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

For analog PIM, the transformation sequence is the mechanism most distinctive to PIMsynth:

1. Replicate global inputs to protect source variables from destructive TRA effects.
2. Normalize AND/OR gates into MAJ with constant zero/one inputs.
3. Eliminate inverters by negating MAJ inputs and exploiting DCC.
4. Resolve destructive-use requirements through inout reuse, multi-output operations, or copy insertion. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

The artifact’s pass names match this mechanism at a useful implementation level: MAJ normalizer, inverter eliminator, inout-variable reuse, multi-destination optimizer, port isolation, and wire-copy inserter. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main/src/blif-translator))

### 6.4 Scheduling, register allocation, and spilling

After IR-1, PIMsynth uses LLVM to perform instruction scheduling, register allocation, and spill insertion. The paper states that spilled registers cause an additional pair of memory row read/write operations, which can substantially affect execution time. It also describes bit-serial-friendly Verilog inputs and a priority-aware topological sort to reduce register pressure, while treating optimal scheduling as future work. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

The artifact implements the LLVM boundary by generating C, compiling it to RISC-V assembly with Clang/LLVM, and then translating the assembly into PIM API code. The CLI exposes `--num-regs`, `--llvm-args`, `--from-stage`, and `--to-stage`, making partial-pipeline inspection possible. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/bit_serial_compiler.py))

### 6.5 Backend API and simulator contract

The backend contract is PIMeval API code. For digital PIM, opcodes such as `and2`, `or2`, `xor2`, `xnor2`, `maj3`, and `mux2` map to PIMeval calls such as `pimOpAnd`, `pimOpOr`, `pimOpXor`, `pimOpXnor`, `pimOpMaj`, and `pimOpSel`, while reads/writes are emitted through row-to-sense-amplifier and sense-amplifier-to-row calls. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/asm-parser/code_gen_pimeval_digital.py))

For analog PIM, the code generator maps read/write and logic through AP/AAP-style calls, maintains register-file and inverted-register-file naming, and reserves some rows/register indices in code. This is where several hardware assumptions become concrete and auditable. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/asm-parser/code_gen_pimeval_analog.py))

### 6.6 Cost and timing model

The paper’s timing model is table-based rather than a formal optimization objective. It derives evaluation parameters from a DDR4_8Gb_x16_3200 model; Table I lists tCK = 0.63 ns, row read/write as tRAS + tRP, digital logic as tCCD, and analog AP/AAP as tRAS + tRP. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

The artifact also exposes a minimal target machine description with DRAM-cycle timing constants and opcode latency categories, including `tCCD`, `tRC`, and digital compute opcodes with `tCCD` latency. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/blif-translator/pim_target.py))

### 6.7 Workloads and evaluation scope

The benchmark suite focuses on Verilog implementations of fixed-width integer arithmetic, relational/logical operations, min/max, shifts, and popcount, with artifact entries also showing AES S-box variants. The paper evaluates a subset selected by baseline availability and operation type, comparing generated execution time against hand-optimized digital and analog bit-serial baselines. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — GenLib is the practical ISA boundary

- **Observation:** PIMsynth turns target bit-serial operations into a standard-cell library consumed by Yosys/ABC rather than inventing a new frontend IR for ISA selection.
- **Why it matters for CIM compiler/IR work:** This shows a lightweight way to reuse mature logic synthesis while still exposing target-specific PIM opcodes.
- **Reusable lesson:** A future CIM compiler can treat “ISA-as-library” as a backend plugin layer, especially when the target operations are Boolean-complete and costed at bit level. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

### Insight 2 — The analog-specific pass sequence is a compact legality model

- **Observation:** The analog path is not just a different opcode table; it rewrites the graph to handle destructive TRA semantics, DCC inversions, and AAP multi-output copies.
- **Why it matters for CIM compiler/IR work:** It demonstrates that CIM legality often lives in value-use constraints and side effects, not merely in operation availability.
- **Reusable lesson:** Future IRs should attach destructive-use, inout, and multi-destination semantics to ops/resources instead of encoding them only in backend templates. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

### Insight 3 — The artifact’s PIM IR-1 is more reusable than the paper diagram suggests

- **Observation:** The paper names IR-1, while the artifact serializes it as a compact text format with mode, register count, ports, temporaries, and opcode lines.
- **Why it matters for CIM compiler/IR work:** This creates an auditable boundary where external tools could insert, verify, or compare bit-serial graph transformations.
- **Reusable lesson:** Even a simple line-oriented IR can become a valuable corpus anchor if it names target mode, resource count, and multi-output operand conventions explicitly. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/blif-translator/generator_pim_ir1.py))

### Insight 4 — Scheduling is delegated, but register pressure is still a PIM concern

- **Observation:** LLVM performs scheduling/register allocation/spilling, but the paper explicitly observes that a spill corresponds to additional memory row read/write traffic.
- **Why it matters for CIM compiler/IR work:** A general-purpose register allocator can be reused, but the spill cost is CIM-specific because it materializes as memory-array movement.
- **Reusable lesson:** A future stack can adapt conventional compiler infrastructure if it provides a target model where spills, reads, writes, and in-memory operations have domain-specific costs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))

### Insight 5 — The simulator API reveals the backend contract

- **Observation:** The codegen layer maps abstract bit-serial opcodes into PIMeval calls for row reads/writes, register moves, digital logic, AP/AAP, and DCC-style analog behavior.
- **Why it matters for CIM compiler/IR work:** The simulator API is where hardware semantics, register naming, and cost-observable events become executable.
- **Reusable lesson:** Corpus entries should inspect simulator APIs and generated code, not only paper diagrams, because they often reveal the real backend interface. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/asm-parser/code_gen_pimeval_digital.py))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL or identifier:** UVA-LavaLab/PIMsynth on GitHub. The paper states the code is publicly available there, and the repository README identifies it as “PIMsynth: Bit-Serial Compiler.” ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf))
- **License:** MIT license, as shown in the repository metadata/README. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** Build instructions using Apptainer; submodules for Yosys, ABC, LLVM, and PIMeval/PIMbench; GenLib ISA files; Verilog benchmarks and submodules; BLIF translator; ASM parser; test generator; and benchmark/test scripts. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main))
- **What the artifact appears to omit or leave distributed:** A standalone formal IR specification beyond source/docstrings; a single unified hardware-schema file; explicit paper-figure reproduction instructions in the README; and a public statement of exact commit/submodule versions used for the paper figures in the checked README.
- **Minimal documented workflow:** clone recursively, build the Apptainer image, build all submodules, then run an example such as `../apptainer-run.sh ./run_benchmark.sh inv_nand 4 digital add_int32`. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main))
- **Whether paper figures appear reproducible from the artifact:** **Partial / unclear.** The run script compiles benchmarks, builds generated tests, runs PIM and bitwise tests, and emits summary logs with operation counts and pass strings. Exact Fig. 5 plot reproduction was not confirmed from the checked README and visible scripts. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/testbench/run_benchmark.sh))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Yes** | Verilog, GenLib, register count, PIM mode, and stage options are documented in the paper and CLI. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Intermediate representation serialized | **Yes** | PIM IR-1 is text-based and line-oriented; BLIF, C, ASM, and HPP outputs are also generated. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/blif-translator/generator_pim_ir1.py)) |
| Mapping decisions inspectable | **Partial** | GenLib, BLIF, PIM IR-1, and assembly are inspectable; ABC/Yosys mapping internals and pass-order effects require reading generated scripts/logs and source. |
| Schedule inspectable | **Partial** | IR-2 / RISC-V assembly is generated after LLVM scheduling/register allocation, but scheduling rationale is not exposed as a separate structured schedule file. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Hardware config explicit | **Partial** | Register count, digital/analog mode, opcode timing classes, and GenLib ISA are explicit; full hardware hierarchy is distributed across paper assumptions and backend code. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/blob/main/src/blif-translator/generator_pim_ir1.py)) |
| Precision / bit-slice assumptions explicit | **Partial** | Workloads use fixed-width 8/16/32/64-bit Verilog kernels; bit significance is implicit in RTL/bit-serial lowering rather than typed in IR. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Cost model inspectable | **Partial** | Paper Table I and artifact `pim_target.py` expose timing constants/latency classes, but a complete calibrated energy model interface was not found in checked top-level docs. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |
| Simulator backend documented | **Partial** | README names PIMeval simulation; codegen maps to PIMeval APIs. Full PIMeval extension behavior requires inspecting submodule/source beyond top-level README. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main)) |
| Generated code / instruction stream inspectable | **Yes** | README flow includes `.s` and `.hpp`; compiler stages can stop at intermediate outputs. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main)) |
| Provenance from source op to backend action | **Partial** | The chain is inspectable through generated files, but no explicit provenance map from Verilog operation to final PIMeval call was found in checked sources. |
| Reproduction scripts available | **Yes / Partial** | Benchmark scripts exist and run tests; exact paper plot reproduction remains unclear. ([GitHub](https://github.com/UVA-LavaLab/PIMsynth/tree/main/testbench)) |
| Calibration source documented | **Partial** | Paper states timing comes from a DDR4_8Gb_x16_3200 model; artifact-level calibration files were not confirmed in checked sources. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest for combinational Verilog modules and GenLib-described bit-serial ISA variants. It is less direct for high-level tensor, graph, or loop frontends without adding a lowering path to Verilog/BLIF.
- **As IR inspiration:** PIM IR-1 is a useful minimal model for a bit-serial operation DAG with mode, register count, ports, temporaries, opcode lines, and multi-output conventions.
- **As mapper/scheduler:** The GenLib + ABC mapping path and analog graph transformations could be adapted for other bit-serial PIM targets with Boolean operation sets and constrained registers.
- **As cost model:** Table-based timing and opcode latency classes could become backend plugins, especially for distinguishing row read/write, digital logic, and AP/AAP-style operations.
- **As backend:** The PIMeval API interface could be wrapped as a backend target for generated microprogram validation.
- **As benchmark:** The fixed-width Verilog kernels are directly reusable for bit-level compiler comparison across bit-serial PIM ISAs and register budgets.
- **As validation source:** The validation source is simulator-backed. The checked sources do not show chip-in-loop, RTL synthesis, SPICE calibration, or hardware measurement calibration for the generated programs.

**Integration effort estimate: Medium.** Integration would be most direct through the serialized PIM IR-1 and PIMeval backend. Reuse would benefit from a small adapter that extracts PIM IR-1, normalizes opcode/resource metadata, and records provenance between source Verilog signals, graph nodes, scheduled registers, and PIMeval calls. The most valuable reusable boundary appears to be GenLib/BLIF/PIM IR-1 for bit-level lowering, rather than the whole end-to-end build environment.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **SIMDRAM** | Bit-serial DRAM/PUD compilation, MAJ/NOT representation, row-to-operand allocation | SIMDRAM is the closest analog DRAM-PIM baseline and focuses on MAJ/NOT execution in DRAM; PIMsynth generalizes the compiler path around Verilog + GenLib + LLVM + PIMeval and explicitly targets both digital and analog bit-serial models. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Classify SIMDRAM-like works around MAJ/NOT graph synthesis and row allocation; classify PIMsynth around reusable compiler pipeline and ISA-parametric lowering. |
| **CHOPPER** | Compiler infrastructure for programmable bit-serial PUD, register spilling, analog optimizations | CHOPPER uses a bit-slice compiler and virtual code-emitter style; PIMsynth uses Verilog/logic synthesis and GenLib ISA mapping, and the paper emphasizes public artifact availability. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Distinguish high-level bit-slice programming stacks from logic-synthesis-driven bit-level compiler stacks. |
| **PIMLC** | Boolean-function / combinational-Verilog-to-PIM instruction generation, workload-resource-aware scheduling | PIMLC targets SRAM/ReRAM-style bit-serial PIM; PIMsynth targets DRAM-based digital and analog models with input-destructive analog operations and digital register constraints. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Both belong near “logic compiler for PIM,” but their first-class hardware constraints differ: array-resource scheduling versus DRAM row/TRA/register semantics. |
| **PIMeval / PIMbench** | Simulator and benchmark infrastructure for digital DRAM PIM | PIMsynth wraps/extends PIMeval as a backend target and validation loop rather than serving primarily as a simulator paper. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | In corpus metadata, mark PIMeval as backend/validation infrastructure and PIMsynth as compiler frontend-to-backend integration. |
| **MIMDRAM** | Builds on SIMDRAM-style bit-serial compilation for more complex DRAM PIM execution | MIMDRAM focuses on MIMD-style high-level mapping while relying on SIMDRAM-like underlying bit-serial compilation; PIMsynth concentrates on automating the bit-serial compiler layer itself. ([University of Virginia Computer Science](https://www.cs.virginia.edu/venkat/papers/cal2025.pdf)) | Separate high-level program/data orchestration from the bit-serial microprogram synthesis layer. |

## 10. Corpus-ready final takeaway

- PIMsynth’s real contribution is a public, automated compiler path from combinational Verilog and a GenLib-defined bit-serial PIM ISA to scheduled/register-allocated PIMeval microprograms.
- The strongest reusable stack layer is the bit-level lowering path: Verilog/BLIF DAG → PIM IR-1 → LLVM-scheduled IR-2 / assembly → PIMeval API code.
- The demonstrated scope is fixed-width bit-serial DRAM-PIM kernels over digital LU and analog TRA/MAJ/DCC programming models.
- First-class objects include operation DAG nodes, GenLib ISA gates, PIM mode, register count, single-bit registers, row read/write events, AP/AAP analog primitives, and PIMeval backend calls.
- The hidden IR is distributed across GenLib libraries, BLIF, serialized PIM IR-1, generated C/assembly, backend register/opcode maps, and simulator API templates.
- Artifact status: public artifact found; it includes compiler code, benchmarks, GenLibs, build/test scripts, and PIMeval integration under an MIT license.
- Integration is most direct as an IR inspiration, bit-serial mapper/scheduler, backend wrapper, and benchmark source; it would require adapters for provenance, hardware schemas, and value-trajectory metadata.
- For a value-trajectory CIM IR, PIMsynth is most relevant as an example of preserving bit-level value identity under destructive analog operations, not as a full model of analog MAC accumulation or ADC/reconstruction trajectories.
