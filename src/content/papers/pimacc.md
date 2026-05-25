---
slug: pimacc
title: "PIMACC: Processing-in-Memory Accuracy Simulator for Neural Network Inference"
short_title: "PIMACC"
subtitle: "Scoped CIM stack note"
year: 
publication:
  venue: "Public software artifact"
  type: "other"
  doi: 
  url: "https://github.com/HertzHan/PIMACC-simulator"
authors: []
author_note: "Haocheng Han; Xiaoming Chen group / PIMCOMP-NN toolchain"
citation_source: https://github.com/HertzHan/PIMACC-simulator
bibtex: |
  @misc{pimacc,
    title        = {{PIMACC:} Processing-in-Memory Accuracy Simulator for Neural Network Inference},
    organization = {PIMACC simulator project},
    howpublished = {Public software artifact},
    url          = {https://github.com/HertzHan/PIMACC-simulator}
  }
summary: >-
  PIMACC is best understood as a CIM/PIM neural-network **accuracy simulation backend** coupled to the PIMCOMP-NN compiler flow. The public artifact demonstrates a workflow in which PIMCOMP-NN compiles an ONNX neural network, emits verification/mapping/instruction information, and PIMACC replays the compiled computation while injecting CIM nonidealities such as quantization effects, conductance variation, IR-drop approximations, and stuck-at faults. Its strongest contribution to a CIM compiler/IR corpus is not a new IR syntax, but a concrete backend contract: a generated verification state plus a hardware/nonideality configuration that connects high-level network nodes to crossbar-level numeric behavior. For compiler/IR research, PIMACC is valuable as evidence that accuracy verification needs its own lower-level representation of bit significance, signed decomposition, cell precision, DAC/ADC-related parameters, fault masks, and mapping provenance. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))
links:
  paper:
  artifact: https://github.com/HertzHan/PIMACC-simulator
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "analog-CIM"
  - "crossbar-based PIM"
workloads:
  - "DNN inference"
  - "CNN inference"
  - "ONNX models"
  - "ResNet-18 example"
  - "CIFAR-10-oriented verification workflow"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A5, A3, A4]
axis_B: [B6, B1, B5, B4, B2]
axis_C_first_class_objects:
  - "crossbar_size"
  - "xbar_array_count"
  - "core_count"
  - "cell_precision"
  - "DAC_resolution"
  - "ADC_fields"
  - "conductance_state"
  - "R_ratio"
  - "bitline_wordline_conductance"
  - "variation"
  - "stuck_at_fault_masks"
  - "bit_sliced_inputs"
  - "bit_sliced_weights"
  - "positive_negative_signed_arrays"
  - "AG_mapping_state"
  - "PIMCOMP_instruction_information"
axis_D_rewrite_objects:
  - "numeric_format"
  - "accuracy_model"
  - "bit_sliced_physical_arrays"
  - "hardware_mapping_consumed"
  - "instruction_stream_consumed"
  - "value_trajectory_approximated"
artifact:
  status: "public artifact found"
  url: "https://github.com/HertzHan/PIMACC-simulator"
  license: "Apache-2.0"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Most useful as a compiler-coupled accuracy simulator backend."
  - "Generated VerificationInfo.json is the key handoff object, but a full public schema was not found."
  - "config.json acts as a hardware and nonideality environment."
  - "Bit slicing, signed decomposition, and physical MVM code provide concrete ingredients for value-trajectory IR design."
takeaways: []
---

# PIMACC — scoped CIM stack note

**Scope note.** I found a public PIMACC simulator artifact and official toolchain documentation, but I did **not** find a standalone public PIMACC paper in the checked sources. The note below therefore treats the artifact, README, code, configuration files, PIM-Toolchain description, and the upstream PIMCOMP-NN paper as the auditable evidence base. The strongest public evidence is that PIMACC is an accuracy-simulation backend consuming PIMCOMP-NN mapping/instruction outputs, rather than a standalone compiler/IR proposal. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 Simulator & cost model** | PIMACC is described as an “end-to-end accuracy simulator” for CIM architectures, focused on neural-network inference accuracy under quantization, resistance variation, IR-drop-related effects, and stuck-at faults. Its reusable public boundary is the simulator backend, not a new frontend language or optimizer. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) |
| Secondary stack role, Axis A | **A5 Narrow end-to-end co-design**, with inherited **A3/A4** context | PIMACC is embedded in the PIMCOMP-NN flow: PIMCOMP-NN compiles an ONNX model, emits mapping/instruction information, and PIMACC consumes that information for verification/accuracy simulation. The PIMCOMP paper supplies the broader compiler, pseudo-instruction, mapping, and scheduling context. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) |
| Middle-layer style, Axis B | **B6 Accuracy / nonideality modeling**, plus **B1 Config-as-IR**, **B5 instruction/meta-op input**, **B4 hardware-resource parameters** | The central reusable middle layer is a combination of generated verification JSON, hardware `config.json`, mapping text, and simulator code paths. The artifact names hardware parameters, PIMCOMP-generated task/mapping state, bit-slice decomposition, and nonideal-device parameters rather than exposing a single formal IR. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| First-class CIM objects, Axis C | Crossbar dimensions, core count, DAC/ADC fields, cell precision, conductance states, variation, stuck-at masks, bit-sliced weights/inputs, positive/negative signed arrays, generated AG/node mapping, PIMCOMP instruction information | These objects are represented in `config.json`, mapping output, and verification code. Bit slicing and signed decomposition are especially visible in simulator routines such as `split_input`, `split_weight`, and `physical_mvm`. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Rewrite object, Axis D | **Numeric format / accuracy model / consumed mapping and instruction state** | PIMACC transforms ONNX/PIMCOMP state into quantized, signed, bit-sliced physical arrays and injects nonideal effects during simulated MVM. Mapping and scheduling are mostly inherited from PIMCOMP-NN rather than re-optimized inside PIMACC. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Best corpus tags | `accuracy-simulator`, `nonideality-modeling`, `PIMCOMP-backend`, `RRAM-CIM`, `analog-CIM`, `DNN-inference`, `ONNX`, `bit-slicing`, `stuck-at-faults`, `IR-drop-model` | These tags reflect the evidenced artifact scope: software accuracy verification for CIM/PIM neural inference using PIMCOMP-generated mapping and instruction information. |
| Closest comparison baselines | **PIMCOMP-NN**, **PIMSIM-NN**, **PIMSYN-NN**, **PUMA**, **DNN+NeuroSim / PyTorX** | PIMCOMP-NN is the immediate upstream compiler; PIMSIM-NN is the sibling performance simulator; PIMSYN-NN provides architecture synthesis in the same suite; PUMA is a broader ISA/compiler/simulator stack; DNN+NeuroSim and PyTorX are nearby accuracy/nonideality modeling frameworks. ([arXiv](https://arxiv.org/pdf/2411.09159)) |

## 2. One-paragraph public summary

PIMACC is best understood as a CIM/PIM neural-network **accuracy simulation backend** coupled to the PIMCOMP-NN compiler flow. The public artifact demonstrates a workflow in which PIMCOMP-NN compiles an ONNX neural network, emits verification/mapping/instruction information, and PIMACC replays the compiled computation while injecting CIM nonidealities such as quantization effects, conductance variation, IR-drop approximations, and stuck-at faults. Its strongest contribution to a CIM compiler/IR corpus is not a new IR syntax, but a concrete backend contract: a generated verification state plus a hardware/nonideality configuration that connects high-level network nodes to crossbar-level numeric behavior. For compiler/IR research, PIMACC is valuable as evidence that accuracy verification needs its own lower-level representation of bit significance, signed decomposition, cell precision, DAC/ADC-related parameters, fault masks, and mapping provenance. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))

## 3. Claimed contribution vs evidenced contribution

Because no standalone PIMACC paper was found, the “claim” column uses the official README/toolchain claims and marks upstream PIMCOMP claims separately.

| Paper / artifact claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| PIMACC is an end-to-end accuracy simulator for CIM architectures. | PIMACC README | Documentation + code/artifact | The README defines PIMACC as an end-to-end CIM accuracy simulator, and the repository exposes a verification backend that runs ONNX models through compiled/mapped CIM execution state. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) | Demonstrated as a software simulator for compiled DNN inference. A standalone PIMACC paper and paper-level experimental section were not found in the checked sources. |
| PIMACC evaluates inference accuracy under nonideal factors including quantization error, device resistance variation, IR-drop-related effects, and stuck-at faults. | PIMACC README and `config.json` / verification code | Documentation + code/artifact | The config includes `cell_precision`, conductance states, variation, SAF flags/probabilities, DAC/ADC fields, and xbar/core parameters; the code implements quantization, signed decomposition, stuck-at masks, IR-drop processing, and physical-xbar MVM routines. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) | The public artifact evidences a simulator implementation. Calibration against silicon, SPICE, or measured chip data was not found in the checked sources. |
| PIMACC works with task/data mappings and instructions generated by PIMCOMP-NN. | PIMACC README and PIM-Toolchain overview | Documentation + code/artifact | The README states that PIMCOMP-NN compiles the target network and generates `PIMACC/output/VerificationInfo.json`; the verification code reads that JSON, parses `AG_info`, node lists, and generated compilation metadata. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) | The reusable boundary is clearest at the generated verification JSON and mapping artifacts. The checked repository documents the filename and uses it in code, but the generated `VerificationInfo.json` sample was not present in the checked `output` directory. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/tree/main/output)) |
| The broader flow compiles high-level DNNs to pseudo-instruction streams for PIM accelerators. | Upstream PIMCOMP-NN paper | Paper + algorithm/experiment context | PIMCOMP-NN is described as an end-to-end DNN compiler with a configurable PIM accelerator template, pseudo-instructions, mapping, flexible unfolding, and scheduling algorithms that generate per-core pseudo-instruction streams. ([arXiv](https://arxiv.org/pdf/2411.09159)) | This is upstream context. PIMACC consumes this state for accuracy simulation; the compiler optimization itself belongs primarily to PIMCOMP-NN. |
| PIMACC is part of a larger PIM EDA suite with synthesis, compilation, performance simulation, and accuracy simulation tools. | PIM-Toolchain README / official toolchain description | Documentation | The toolchain description separates PIMSYN-NN, PIMCOMP-NN, PIMSIM-NN, and PIMACC, with PIMACC assigned to accuracy evaluation from architecture and instruction-sequence inputs. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain?utm_source=chatgpt.com)) | The evidenced role is a specialized accuracy lane in a broader hidden-stack flow. Cross-tool schemas are partially inferable from code and README, but not fully formalized in checked public docs. |
| PIMACC can compare simulated CIM execution against neural-network ground truth. | Verification code | Code/artifact | The verification code uses ONNX Runtime to obtain intermediate or reference outputs, then loads compilation state and simulates physical execution. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) | Demonstrated through software reference execution. The exact public reproduction coverage for paper figures is unknown because no dedicated PIMACC paper/figure set was found. |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX neural-network model plus dataset/image input, with PIMCOMP-NN compilation run before PIMACC. This is a model file plus generated compiler state, not a PIMACC-owned frontend IR. The README documents a ResNet-18 ONNX command-line example and notes that dataset changes require editing verification.py. Inspectability is partial. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))

Middle representation:
  The effective middle representation is the combination of PIMCOMP-generated VerificationInfo.json, MappingResult.txt, config.json, and simulator-internal dictionaries. VerificationInfo.json is documented as a generated input, MappingResult.txt is present as a text mapping artifact, and config.json is serialized and inspectable. The JSON schema is not fully documented in the checked sources. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/tree/main/output))

Mapping or scheduling state:
  Mapping/scheduling state is inherited from PIMCOMP-NN. The verification code parses AG_info, node names, node dimensions, communication-pair counts, and generated node lists; MappingResult.txt exposes core/node/AG/xbar/input-cycle style fields. This state is inspectable in sample mapping text and partially inspectable through generated JSON when available. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

Hardware abstraction:
  config.json describes xbar size, xbar array count, DAC/ADC fields, cell precision, conductance parameters, variation, stuck-at probabilities, core count, memory sizes, network parameters, and latency/power fields. It is a config-as-IR hardware/nonideality environment rather than a typed hardware dialect. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json))

Backend / simulator / codegen:
  The main public backend is Python verification code that performs ONNX reference execution, loads PIMCOMP compilation metadata, converts weights/inputs into signed and bit-sliced physical arrays, injects nonidealities, and simulates physical MVM. PIMACC does not appear to generate deployable machine code; it replays generated instructions/state for accuracy verification. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

Output artifact:
  Outputs are simulator/verification results and intermediate simulator state. The repository includes MappingResult.txt, while the README expects generated VerificationInfo.json. A documented, stable result schema for accuracy reports was not found in the checked sources. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/tree/main/output))

Evaluation loop:
  The loop is: compile with PIMCOMP-NN using verification output enabled, run PIMACC verification on an ONNX model and dataset, obtain ONNX Runtime ground truth, simulate mapped CIM execution under configured nonidealities, and compare accuracy/output behavior. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of generated PIMCOMP verification JSON, mapping text, hardware `config.json`, ONNX node names, memory/address state inside the simulator, and bit-sliced physical tensors constructed during verification. The paper/toolchain foregrounds accuracy simulation, while the reusable semantics are most visible in the backend contract: node/mapping provenance from PIMCOMP plus a hardware/nonideality environment that determines how values are quantized, decomposed, perturbed, accumulated, and reconstructed. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 Simulator & cost model.**  
PIMACC’s owned slice is software accuracy simulation for CIM inference. Its input is a compiled/mapped network plus architecture configuration, and its output is an accuracy/verification result under hardware nonidealities. The most concrete public implementation is the verification backend and nonideality model, not a new optimizer or IR compiler. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))

**Secondary: A5 Narrow end-to-end co-design.**  
PIMACC is part of a larger PIM EDA suite, and its workflow depends on PIMCOMP-NN for frontend compilation, mapping, scheduling, and instruction generation. This gives it an end-to-end feel, but with a narrow ownership boundary: accuracy verification after compilation. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain?utm_source=chatgpt.com))

**Inherited context: A3 Mapping / scheduling / DSE and A4 instruction-stack elements.**  
PIMCOMP-NN provides the mapping, scheduling, hardware template, and pseudo-instruction stream context. PIMACC reads and uses that state; it is best classified as a backend consumer of these objects rather than the primary site where they are rewritten. ([arXiv](https://arxiv.org/pdf/2411.09159))

### 5.2 Axis B — middle-layer style

**B6 Accuracy / nonideality modeling — primary.**  
The named middle representation is not a single IR object; it is the simulator’s accuracy state: quantized weights, quantized inputs, signed positive/negative arrays, bit-sliced physical weights, stuck-at masks, conductance variation, and IR-drop-adjusted physical arrays. Decisions made here include how numeric tensors are decomposed into CIM-cell precision, how DAC resolution partitions activation bits, how stuck-at faults are injected, and how IR-drop-related scaling modifies conductance-level behavior. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

**B1 Config-as-IR — strong secondary.**  
`config.json` acts as a hardware/nonideality environment: it names xbar dimensions, DAC/ADC fields, conductance parameters, cell precision, variation, SAF probabilities, memory sizes, core count, and latency/power parameters. Upstream passes could read it, but a type-checked schema or verifier was not found in the checked sources. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json))

**B5 Instruction / meta-op / ILA — consumed rather than owned.**  
The PIMCOMP-NN paper describes pseudo-instructions and per-core instruction-stream generation; PIMACC’s README says PIMCOMP-NN generates instruction information for PIMACC. PIMACC therefore uses instruction/meta-op state as an input contract. ([arXiv](https://arxiv.org/pdf/2411.09159))

**B4 Hardware-resource IR — partial.**  
Hardware resources are concrete enough to guide simulation: core count, xbar size, xbar array count, memory buffers, network topology fields, ADC/DAC fields, and mapping text with core/xbar allocation. The representation is more a parameterized resource model than a standalone hardware-resource IR. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json))

**Single artifact question.**  
There is no single checked artifact that upstream passes could read, verify, and rewrite as the complete PIMACC IR. The closest approximation is the tuple:

```text
(ONNX model, PIMCOMP VerificationInfo.json, MappingResult.txt, config.json, simulator code conventions)
```

This tuple is enough to drive the simulator, but future reuse would benefit from a documented schema that names node provenance, instruction operands, memory locations, bit significance, precision stages, and nonideality parameters in one place.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper / artifact | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Parameter / partially first-class.** Xbar size, xbar array count, core count, memory/network fields, and mapping text are explicit. | `config.json` exposes xbar/core parameters; MappingResult exposes core/node/AG/xbar-style mapping rows. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Bit-slicing / bit significance | **First-class inside simulator code.** Inputs and weights are split by DAC resolution and cell precision, with explicit powers used for reconstruction. | `split_input`, `split_weight`, and `physical_xbar` encode bit slicing and significance. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| ADC/DAC precision or sensing | **Parameter / partially modeled.** DAC resolution, ADC resolution, reference voltage, ADC count, and related fields are present; the checked code path also uses an `Am_precision` field derived from config. | Hardware config and `load_hardconfig()` read these fields. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Analog-to-digital or domain transition | **Approximated in simulator.** The code models DAC scaling into voltage-like quantities, crossbar MVM, ADC-like normalization, and digital reconstruction factors. | `physical_xbar` multiplies by reference voltage, accumulates bit/cell slices, and scales by voltage/conductance terms. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Peripheral circuits as path nodes | **Parameter / implicit.** ADC, DAC, shift-adder, sample-hold, buffers, and NoC parameters appear in config, but they are not exposed as rewriteable path nodes in a formal IR. | `config.json` includes peripheral latency/power/count fields. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Partial-sum accumulation path | **Implicit / hard-coded.** Partial sums are formed inside physical MVM routines through signed positive/negative decomposition and bit-slice accumulation. | `physical_mvm` combines positive and negative products; `physical_xbar` accumulates bit-slice contributions. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Reconstruction / shift-add tree | **Hard-coded / parameter-backed.** Bit-slice reconstruction is encoded by power-of-two weighting; shift-adder latency exists as a config field. | Reconstruction factors appear in `physical_xbar`; shift-adder fields appear in `config.json`. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Runtime state, masks, KV cache, batching, sparsity | **Fault masks and batch size are represented; KV cache is N/A for the demonstrated CNN inference setting.** | SAF masks are constructed in code; README command includes batch size; no LLM/KV-cache setting was found in checked sources. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Value trajectory / flow path | **Approximated, not surfaced as a standalone IR object.** Value flow is recoverable through node names, mapping state, memory simulator state, and physical MVM functions. | ONNX node names bridge reference outputs and compilation state; physical execution routines encode the value path. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |

### 5.4 Axis D — rewrite object

PIMACC’s concrete rewrite/simulation objects are:

- **Numeric format:** floating tensors are quantized to integer-like fixed-point representations, split by sign, then decomposed by bit significance and cell precision.
- **Accuracy model:** values are perturbed through variation, stuck-at faults, and IR-drop-related transformations.
- **Hardware mapping:** mapping is consumed from PIMCOMP-NN; PIMACC preserves node/mapping provenance for verification.
- **Instruction stream / execution state:** PIMCOMP-generated instruction and verification metadata drive the simulator.
- **Value trajectory:** represented procedurally in simulator functions rather than as a named IR.

Legal transformations in the framework include quantization, signed positive/negative decomposition, bit slicing by DAC/cell precision, conductance/fault perturbation, IR-drop-related scaling, physical crossbar MVM, and reconstruction into higher-level tensor values. The main equivalences exploited are numeric decomposition equivalences: signed values can be represented as positive/negative arrays, higher-precision weights can be represented as cell-precision slices, and input precision can be represented as DAC-resolution chunks. Information that must be preserved across lowering includes ONNX node identity, tensor shape, mapping/allocation state, bit significance, sign, precision scale, memory placement, and hardware configuration. The representation is especially well suited to replaying PIMCOMP-generated execution under nonidealities; expressing transformations such as retiming ADC conversion, carrying bit-sliced partial sums across operator boundaries, or selecting alternative peripheral routes would likely require an additional abstraction for explicit value trajectory and domain-stage typing.

## 6. Technical mechanism reading

### 6.1 Frontend and reference execution

PIMACC’s public workflow begins after PIMCOMP-NN compilation. The README instructs users to compile the target network with PIMCOMP-NN, enable verification output using `-v=YES`, and then run PIMACC’s verification script on an ONNX model such as ResNet-18 with dataset and batch-size parameters. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))

The verification code constructs a reference baseline using ONNX Runtime. It walks the ONNX graph, exposes intermediate outputs, runs inference, and stores ground-truth tensors by node-related keys. This design is important for compiler/IR analysis because the reference boundary is **node-level**, not merely final-accuracy-level: PIMACC can align compiled execution with source graph semantics through node names and intermediate tensors. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

### 6.2 PIMCOMP-generated verification state

The simulator loads `../output/VerificationInfo.json`, reads compilation metadata such as communication-pair counts, `AG_info`, node names, and tensor dimensions, and comments explicitly that ONNX graph node indices may differ from final compilation node indices after preprocessing, while `node_name` remains the semantic bridge. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

This is one of the most IR-relevant details in the artifact. It indicates that PIMACC’s backend contract depends on stable source-op identity even when compiler preprocessing changes node indexing. In a future typed IR, this would likely become an explicit provenance field connecting source graph operations, lowered tasks, mapped array groups, and backend actions.

### 6.3 Hardware and nonideality configuration

`config.json` is the main inspectable hardware/nonideality object. It includes xbar size, xbar-array count, DAC resolution, ADC resolution, reference voltage, cell precision, conductance state, resistance ratio, bitline/wordline conductance, variation, stuck-at-fault flags and probabilities, buffer sizes, core count, and latency/power fields for several hardware blocks. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json))

The verification code reads those fields in `load_hardconfig()`, including `cell_precision`, `reference_conductance_state`, `R_ratio`, `wordline_conductance`, `bitline_conductance`, `variation`, DAC/ADC-related fields, and SAF parameters. This confirms that the hardware config is not just documentation; it parameterizes the simulator. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

### 6.4 Weight and activation lowering

The simulator lowers weights and inputs into physical representations. In the checked code, weights are quantized, split into positive and negative components, and split into cell-precision chunks. The simulator also constructs stuck-at-fault masks: stuck-at-0 cells are forced to zero, and stuck-at-1 cells are forced to the maximum value representable by the configured cell precision. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

Activations are similarly quantized and decomposed. `split_input()` separates signs, unpacks bits, groups them according to DAC resolution, repacks chunks, and transposes them into a form consumed by physical xbar simulation. This makes bit significance a real simulator object, even though it is not exposed as a formal type. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

### 6.5 Physical MVM and reconstruction

`physical_mvm()` converts inputs and weights into integer-like representations, splits them into positive/negative and bit-sliced components, calls physical-xbar routines for the four sign combinations, and reconstructs the signed result as:

```text
positive-input × positive-weight
+ negative-input × negative-weight
- positive-input × negative-weight
- negative-input × positive-weight
```

The code then rescales the result back toward the higher-level numeric domain. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

`physical_xbar()` performs the bit-slice accumulation. It scales input chunks by a reference voltage, iterates over xbar slices, applies powers corresponding to DAC resolution and cell precision, and normalizes by reference voltage and conductance state. For compiler/IR purposes, this routine is the clearest implementation of the implicit value trajectory: digital activation chunk → DAC-like voltage scaling → physical crossbar multiply → bit/cell significance accumulation → ADC-like normalization → reconstructed tensor contribution. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

### 6.6 IR-drop and fault effects

The checked `IRdrop_process()` routine computes a conductance-dependent adjustment using xbar dimensions, bitline conductance, wordline conductance, and mean conductance of the physical xbar. This is a compact analytical approximation rather than a path-level circuit simulation in the exposed code. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))

Stuck-at faults are modeled through masks generated according to configured probabilities. The artifact therefore supports a useful separation: static mapping and bit slicing come from the compiler/simulator state, while nonidealities are injected by configuration-controlled physical models.

### 6.7 Workload and hardware assumptions

The documented example uses an ONNX ResNet-18 model and CIFAR-10-oriented verification workflow, with notes that other datasets require editing the verification script. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) The broader upstream PIMCOMP-NN paper targets DNN inference on configurable PIM accelerators and describes RRAM-crossbar-style MVM with DACs, ADCs, and conductance-programmed weights. ([arXiv](https://arxiv.org/pdf/2411.09159))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — VerificationInfo is the real backend contract

- **Observation:** The README names `VerificationInfo.json` as the handoff from PIMCOMP-NN to PIMACC, and the verification code parses it for node, AG, dimension, and communication metadata. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))
- **Why it matters for CIM compiler/IR work:** This file is the closest public approximation to a compiler-to-accuracy-simulator IR boundary.
- **Reusable lesson:** A future CIM IR could formalize this boundary with explicit fields for source op, mapped task, array group, memory location, instruction operand, precision, and expected reference tensor.

### Insight 2 — Accuracy simulation depends on mapping provenance

- **Observation:** PIMACC does not merely simulate an abstract layer; it reads compiler-generated mapping state and aligns it to ONNX node names. MappingResult also exposes core/node/AG/xbar-style mapping information. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))
- **Why it matters for CIM compiler/IR work:** Nonideality effects are placement-sensitive. A simulator needs to know where computation lands, not just what operator is being executed.
- **Reusable lesson:** Accuracy-aware CIM IR should preserve mapping provenance through lowering, especially when faults, variation, IR drop, or peripheral constraints depend on physical location.

### Insight 3 — Bit slicing behaves like a hidden type system

- **Observation:** The simulator explicitly decomposes inputs by DAC resolution and weights by cell precision, then reconstructs contributions using bit-significance factors. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))
- **Why it matters for CIM compiler/IR work:** These fields determine legal numeric transformations, but they are embedded in simulator functions rather than visible as typed IR attributes.
- **Reusable lesson:** A future IR could attach `sign`, `bit_range`, `cell_precision`, `dac_chunk`, `scale`, and `domain` attributes to values, enabling verification and rewrite passes over numeric decomposition.

### Insight 4 — The hardware config is a de facto nonideality environment

- **Observation:** `config.json` parameterizes both architecture and nonideality behavior: xbar shape, conductance values, variation, stuck-at probabilities, DAC/ADC fields, memory sizes, and core count. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json))
- **Why it matters for CIM compiler/IR work:** The same compiled graph can have different accuracy behavior under different hardware/nonideality environments.
- **Reusable lesson:** CIM compiler stacks should treat hardware/nonideality config as a typed environment that downstream passes and verifiers can inspect, validate, and version.

### Insight 5 — ONNX node names provide a practical provenance bridge

- **Observation:** The verification code comments that internal node indices may differ after preprocessing, but node names remain useful for consistency between ONNX graph state and final compilation state. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py))
- **Why it matters for CIM compiler/IR work:** Compiler pipelines often mutate graph indexing; stable semantic identity is needed for auditability and debugging.
- **Reusable lesson:** Corpus notes should record whether a stack preserves source-op provenance through mapping, scheduling, instruction generation, and simulation.

### Insight 6 — Accuracy and performance are split across sibling backends

- **Observation:** The PIM-Toolchain description assigns performance/latency/power simulation to PIMSIM-NN and accuracy-under-nonideality simulation to PIMACC. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain?utm_source=chatgpt.com))
- **Why it matters for CIM compiler/IR work:** This split is clean for tool organization but suggests a future challenge: performance and accuracy transformations may interact.
- **Reusable lesson:** A value-trajectory or backend-contract IR could allow both performance and accuracy simulators to consume the same mapped value-flow object.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

- **Artifact status: public artifact found.**
- **Artifact identifier:** `HertzHan/PIMACC-simulator`. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))
- **License:** Apache License 2.0. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/LICENSE))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** a PIMACC verification/simulation backend, PIMCOMP-NN-related source files, `config.json`, model folders, mapping output, documentation folder, and README workflow instructions. ([GitHub](https://github.com/HertzHan/PIMACC-simulator))
- **What the artifact appears to omit:** a standalone PIMACC paper, release tags, a fully documented `VerificationInfo.json` schema, a checked-in generated `VerificationInfo.json` sample in the `output` folder, and calibration documentation tying the nonideality models to measured silicon or SPICE. The checked `output` folder contained `MappingResult.txt`, while the README says `VerificationInfo.json` is generated during the PIMCOMP-NN workflow. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/tree/main/output))
- **Minimal documented workflow:** compile the target network with PIMCOMP-NN, enable verification output with `-v=YES`, then run `verification.py` with model path, pipeline type, image count, and batch size. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))
- **Whether paper figures appear reproducible from the artifact:** Unknown / not found in the checked sources, because a standalone PIMACC paper with figures was not found. The artifact appears intended to reproduce simulator workflows, but the checked public documentation does not provide a figure-by-figure reproduction manifest.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---:|---|
| Input format documented | Partial | ONNX model input and generated PIMCOMP verification file are documented; full generated-file schema was not found. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) |
| Intermediate representation serialized | Partial | `config.json` and mapping text are serialized; `VerificationInfo.json` is documented as generated but was not present in the checked output folder. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Mapping decisions inspectable | Partial | `MappingResult.txt` exposes core/node/AG/xbar/input-cycle-style rows. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/output/MappingResult.txt)) |
| Schedule inspectable | Partial | Scheduling/instruction state is generated by PIMCOMP-NN; PIMACC reads the verification file, but a complete public schema/sample was not found. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Hardware config explicit | Yes | Hardware and nonideality fields are explicit in `config.json`. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Precision / bit-slice assumptions explicit | Partial | Cell precision, DAC/ADC fields, and bit splitting are explicit in config/code; precision naming and propagation would benefit from a formal schema. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/config.json)) |
| Cost model inspectable | Partial | Accuracy/nonideality model code is inspectable; performance cost modeling belongs more directly to PIMSIM-NN/PIMCOMP context. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Simulator backend documented | Partial | README provides a minimal command; implementation is available in code. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) |
| Generated code / instruction stream inspectable | Partial | PIMCOMP pseudo-instruction generation is described upstream; PIMACC consumes generated instruction/verification state. ([arXiv](https://arxiv.org/pdf/2411.09159)) |
| Provenance from source op to backend action | Partial | Node-name bridging is implemented and discussed in comments; a full provenance schema was not found. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/verification/verification.py)) |
| Reproduction scripts available | Partial | A command-line workflow is documented; no release-tagged, figure-complete reproduction package was found. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md)) |
| Calibration source documented | Unknown | No measured silicon/SPICE calibration source for the exposed nonideality equations was found in the checked sources. |

### 8.3 Integration helper

- **As frontend:** PIMACC itself is not the natural frontend. Integration would use PIMCOMP-NN’s ONNX-based frontend, then pass generated verification/mapping state to PIMACC. ([arXiv](https://arxiv.org/pdf/2411.09159))
- **As IR inspiration:** The best IR ideas are the backend contract fields: source node name, mapped array group, xbar allocation, memory state, precision fields, bit-slice decomposition, sign decomposition, fault masks, and hardware/nonideality config.
- **As mapper/scheduler:** Mapping and scheduling logic should be reused from PIMCOMP-NN rather than PIMACC. PIMACC is useful for checking how mapping choices affect accuracy under nonidealities.
- **As cost model:** PIMACC can be wrapped as an accuracy/nonideality backend plugin. Useful model components include quantization, cell-precision slicing, DAC-resolution input slicing, stuck-at-fault masks, conductance variation, and IR-drop-related scaling.
- **As backend:** This is the strongest reuse role. A future compiler could generate a PIMACC-compatible verification file or write an adapter that emits the expected `VerificationInfo.json`-like state plus `config.json`.
- **As benchmark:** The artifact includes model folders and a documented ResNet-18/CIFAR-10-style verification command. Broader benchmark reuse would depend on documenting model preparation and generated compiler outputs. ([GitHub](https://github.com/HertzHan/PIMACC-simulator/blob/main/README.md))
- **As validation source:** PIMACC can validate simulator-level accuracy sensitivity to configured nonidealities. It is not, based on checked sources, a calibration source from chip measurements, RTL, or SPICE.

**Integration effort estimate: Medium.**  
Integration would be most direct through an adapter that emits PIMCOMP/PIMACC-style verification metadata and hardware config. The artifact’s simulator logic is public and inspectable, but the absence of a fully documented generated-file schema means an integrator would likely need to read `verification.py` and mirror its expected JSON structure. The most valuable reusable boundary appears to be the accuracy backend, not the frontend or scheduler.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **PIMCOMP-NN** | DNN-to-PIM compilation, mapping, scheduling, pseudo-instruction generation | PIMCOMP-NN owns the compiler/mapping/scheduling layer; PIMACC consumes its generated state for accuracy simulation. ([arXiv](https://arxiv.org/pdf/2411.09159)) | Classify PIMACC as an accuracy backend attached to an upstream compiler, not as the main compiler stack. |
| **PIMSIM-NN** | Simulation from architecture and instruction sequence | PIMSIM-NN targets performance, latency, power, and energy; PIMACC targets inference accuracy under nonidealities. ([GitHub](https://github.com/chenxm1986/PIM-Toolchain?utm_source=chatgpt.com)) | The PIM-Toolchain separates performance simulation and accuracy simulation, which is useful for corpus tagging. |
| **PIMSYN-NN** | Architecture-level PIM design-space exploration | PIMSYN-NN synthesizes architecture instances from model/constraint inputs; PIMACC evaluates accuracy for a chosen architecture/instruction state. ([arXiv](https://arxiv.org/abs/2402.18114?utm_source=chatgpt.com)) | Distinguish architecture synthesis objects from accuracy-verification objects. |
| **PUMA** | ISA/compiler/simulator stack for memristive PIM | PUMA exposes a broader programmable ISA/compiler/microarchitecture story, while PIMACC is a narrower simulator backend coupled to PIMCOMP-NN. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) | Use PUMA as a comparison for explicit instruction-stack design; use PIMACC for backend nonideality contracts. |
| **DNN+NeuroSim** | DNN-level CIM simulation with device/circuit/algorithm considerations | DNN+NeuroSim is a broader device/circuit/algorithm evaluation framework; PIMACC is more tightly coupled to PIMCOMP-generated mapping/instruction state. ([GitHub](https://github.com/In-Memory-Computing/DNN_NeuroSim?utm_source=chatgpt.com)) | Separate circuit/device exploration frameworks from compiler-generated execution-state verifiers. |
| **PyTorX / crossbar nonideality frameworks** | Neural-network mapping/evaluation under crossbar nonideal effects | PyTorX-style frameworks emphasize training/mapping/evaluation under nonidealities; PIMACC’s distinctive feature is its attachment to a PIM compiler’s task/data mapping and instruction information. ([GitHub](https://github.com/elliothe/pytorx?utm_source=chatgpt.com)) | Tag PIMACC as compiler-coupled accuracy verification rather than generic crossbar robustness evaluation. |

## 10. Corpus-ready final takeaway

- PIMACC’s evidenced contribution is a public CIM/PIM **accuracy simulation backend** for neural-network inference under configurable nonidealities.
- Its strongest reusable stack layer is the backend contract between PIMCOMP-NN’s generated mapping/instruction state and a simulator that models quantization, conductance variation, stuck-at faults, and IR-drop-related effects.
- The demonstrated scope is static DNN/CNN-style inference using ONNX models compiled by PIMCOMP-NN, with ResNet-18/CIFAR-10-style workflow documentation.
- First-class or near-first-class objects include crossbar dimensions, core/xbar mapping state, cell precision, DAC/ADC-related fields, conductance parameters, bit-sliced weights/inputs, sign-decomposed arrays, and SAF masks.
- The hidden IR is the combination of `VerificationInfo.json`, `MappingResult.txt`, `config.json`, ONNX node names, and simulator-internal memory/physical-array state.
- Artifact status is strong enough for code-level audit: public repository, Apache-2.0 license, inspectable config and simulator code; a standalone PIMACC paper and full generated-file schema were not found.
- Integration would be most direct by wrapping PIMACC as an accuracy backend or by writing an adapter from a future CIM IR into PIMACC-style verification metadata.
- For value-trajectory IR work, PIMACC is a useful case study because it encodes trajectory-relevant facts—bit significance, sign, precision, placement, nonideality, and reconstruction—but keeps them mostly inside backend procedures rather than a rewriteable IR.
