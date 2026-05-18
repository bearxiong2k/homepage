# OpenCIMTC — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 — Narrow end-to-end co-design**, with A3/A4/A2/A6 secondary roles | OpenCIMTC is presented as a full stack linking ONNX-level compilation, YAML CIM-IR, memristor-chip mapping, simulator/hardware backends, PDT training, and simulator-/chip-in-the-loop tuning. The demonstrated slice is a vertical RRAM/memristor CIM prototype plus its software flow, rather than a general compiler substrate across many architectures. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B2 Graph-as-IR**, **B4 Hardware-resource IR**, **B6 Accuracy/nonideality modeling**, limited **B7 Runtime-state abstraction** | The named middle representation is a YAML **CIM-IR** whose central split is Attribute, Mapping, and Calculation. It carries graph/layer attributes, physical mapping state, and deployment parameters such as ADC integration time and quantization/scale fields. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| First-class CIM objects, Axis C | Layer/op attributes; CIM-friendly op type; virtual/non-CIM op placement; weight split/copy/repeat; physical array address; runtime target; ADC integration time; weight/input/output scaling; activation precision; simulator nonideality knobs | The paper names and serializes mapping and calculation parameters in CIM-IR. The artifact exposes Python classes for mapping and calculation metadata, including row/column split, repeat/copy, runtime, mapped device address, activation bits, integration time, noise/ADC fields, and quantization fields. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Rewrite object, Axis D | **Operator graph**, **hardware mapping**, **array binding**, **numeric/deployment parameters**, and generated backend flow | The compiler rewrites ONNX-derived layer graphs through fusion/splitting, maps weight matrices to arrays, inserts split/add/concat-style structure for large layers, and rewrites per-layer calculation parameters during PDT/SSAT/PTSS flows. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Best corpus tags | `RRAM-CIM`, `analog-CIM`, `compiler-mapping`, `config-as-IR`, `YAML-IR`, `ONNX-frontend`, `hardware-in-loop`, `simulator-in-loop`, `post-deployment-training`, `nonideality-optimization` | These tags reflect the evidenced compiler/IR boundary: ONNX import, serialized CIM-IR, memristor array mapping, simulator/hardware execution, and tunable deployment parameters. |
| Closest comparison baselines | PUMA, TC-CIM, OCC, PIMCOMP, IBM AIHWKIT / analog hardware acceleration kit, Rasch-style hardware-aware analog IMC training | These are nearby because they address programmable CIM compilation, CIM compiler infrastructure, mapping to crossbar accelerators, or analog nonideality-aware training. The paper itself cites several of these lines of work in its references. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |

## 2. One-paragraph public summary

OpenCIMTC is best read as a concrete end-to-end memristor/RRAM CIM co-design stack whose reusable compiler contribution is a serialized YAML **CIM-IR** separating layer attributes, physical mapping information, and calculation/deployment parameters. The work strengthens the vertical path from ONNX model import to memristor-array placement, simulator or hardware execution, post-deployment training, and simulator-/chip-in-the-loop tuning of hardware-sensitive parameters. The demonstrated system targets static neural-network inference and training-adjustment flows for a specific memristor CIM prototype with FPGA/CPU support, with public artifact support clearest around ResNet-32 simulation and generated training/optimization/inference scripts. For CIM compiler/IR research, its main value is not a broad formal IR, but an auditable example of how mapping state, physical addresses, ADC/integration-time parameters, quantization fields, and backend generation contracts can be made explicit enough to survive a compiler-to-hardware flow. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| A full-stack memristor CIM system with software-hardware co-development | Abstract, Fig. 1, Methods | Experiment; artifact; hardware description | The paper describes a stack with compiler, optimizer, simulator, hardware driver, FPGA board, and eight memristor chips; the public repository contains compiler, customized HAT/PDT, optimizer, simulator, and utility code. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Demonstrated for the authors’ memristor CIM prototype and simulator flow. Public reuse is clearest for the software repository and simulator-oriented examples; hardware-backed reproduction depends on access to comparable prototype hardware. |
| A unified CIM-IR separates algorithm attributes, mapping information, and hardware calculation parameters | Fig. 2, Methods “CIM IR”, Supplementary Note 5 | Documentation; code/artifact | The paper and supplement define Attribute, Mapping, and Calculation fields; the artifact exposes IR/device/layer/data definitions and macro-specific mapping/calculation classes. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | The reusable boundary is clearest as YAML/config-plus-Python classes. A standalone schema, verifier, or dialect specification was not found in the checked sources. |
| The frontend can compile neural-network models through ONNX into CIM execution flows | Fig. 1, Supplementary Note 5, README | Documentation; code/artifact | The supplement says the compiler adopts ONNX as input; the README shows commands that convert a ResNet-32 ONNX model into mapped IR, training code, optimized IR, simulator code, and inference code. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) | Shown through artifact examples for ResNet-32. The demonstrated frontend generality is strongest for ONNX models matching supported operator/mapping assumptions. |
| The compiler performs model placement and weight mapping onto CIM arrays | Fig. 1, Fig. 2, Supplementary Notes 5–6, artifact mapper | Algorithm; code/artifact | The supplement describes a lowest-horizontal-line placement strategy and transformations for bit-unrolling, vector splitting, matrix row/column splitting, and weight copy. The artifact includes mapper logic and mapping metadata classes. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) | Demonstrated as weight-array placement and graph-compatible split/add/concat insertion for supported layer types. The mapping object is concrete; the schedule abstraction is mostly visible through generated code rather than a separate schedule IR. |
| The backend can target simulator and hardware-driver execution | Supplementary Note 5, Methods, README | Documentation; code/artifact; paper-only for some hardware details | The supplement describes backend parsing of CIM-IR into high-level functions and ACCI-style operations such as Set, Reset, Read, Calculate, and Program; the README demonstrates generation of simulator/inference Python code. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) | The public artifact clearly exposes simulator-oriented workflow. The paper-level evidence supports hardware-driver execution through the prototype; independent artifact-level confirmation of a complete PYNQ/register hardware driver would require additional hardware-specific files or hardware access. |
| Post-deployment training / hardware-like training improves deployment accuracy | Results and Methods “PDT” | Algorithm; experiment; code/artifact | The paper describes PDT using CIM-IR mapping information, bit-slicing, weight splitting, ADC/output quantization, and PyTorch extensions. The artifact contains `customized_hat` files and README commands to generate PDT training code. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Demonstrated for reported CNN/ResNet cases. Artifact examples are most concrete for ResNet-32; reproduction of full paper accuracy tables may require datasets, trained checkpoints, source data, and hardware/simulator calibration. |
| SSAT and PTSS optimize hardware calculation parameters | Results and Methods “SSAT” and “PTSS” | Algorithm; equation/objective; experiment; code/artifact | SSAT adjusts ADC integration time layer-by-layer using MSE feedback and chip or simulator outputs. PTSS uses a genetic algorithm over integration time, weight copy number, and input expansion mode; the artifact includes optimizer code and README commands for simulation-in-loop optimization. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | The paper-level evidence supports parameter search over selected hardware-sensitive knobs. The reusable optimization interface is clearest as “modify CIM-IR, regenerate backend code, evaluate MSE, update parameters.” |
| The stack demonstrates several neural networks across several tasks | Abstract and Results | Experiment | The paper reports demonstrations over six neural-network models and four task categories, including image classification, text classification, segmentation, and object detection; ResNet-50 is discussed through simulator-backed evaluation. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Demonstrated scope is the reported model/task set on the authors’ prototype/simulator. The artifact’s README centers on a ResNet-32 example. |
| The framework can be deployed on other CIM systems | Discussion; CIM-IR extensibility discussion | Paper-only plus partial artifact support | The paper argues that mixins and CIM-IR extensions can adapt the framework; the artifact contains device/runtime abstractions and macro-specific mixin classes. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | The design intent is visible. Practical portability would depend on writing new device definitions, mapping classes, backend codegen, simulator/hardware interfaces, and calibration data. |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX model plus hardware description / constraints YAML. The frontend extracts layer type, data type, dependencies, and resource needs, then performs graph-level transformations such as convolution–batchnorm fusion and large-layer splitting. This is a graph/config input boundary; it is serialized and documented through the README workflow and supplement. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

Middle representation:
  YAML CIM-IR plus Python IR classes. The named IR contains Node Information split into Attribute, Mapping, and Calculation. Attribute includes operator-level fields such as kernel, stride, padding, and op type; Mapping contains physical placement/split/copy/address information; Calculation contains deployment fields such as integration time, quantization scale, and input encoding. It is serialized and inspectable as generated YAML, while the effective schema is partly embedded in Python mixins/classes. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

Mapping or scheduling state:
  Placement state includes row/column splits, copy/repeat factors, runtime target, and mapped device addresses. The supplement describes a lowest-horizontal-line placement method; artifact code exposes macro placement and helper functions that attach mapping and calculation information to mapped layers. Scheduling is represented more through generated backend code and function calls than as a separately named schedule IR. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

Hardware abstraction:
  The paper’s hardware abstraction is a memristor CIM chip/module with arrays, ADC/DAC-related constraints, signed weight encoding, FPGA support, ARM CPU support for non-CIM functions, and an ACCI-like interface. The artifact represents hardware resources through device trees, runtime objects, and macro-specific device/config classes. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

Backend / simulator / codegen:
  The backend parses CIM-IR and emits high-level target code for simulator or hardware-driver execution. The supplement describes generated code as containing schedule, data conversion, and function calling; the README demonstrates code generation for PDT training, simulator optimization, and inference. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

Output artifact:
  Generated artifacts include mapped IR YAML, PDT training Python, modified/optimized IR YAML, simulator code, inference code, and weight files. The repository README shows these outputs in a ResNet-32 workflow. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/README.md))

Evaluation loop:
  OpenCIMTC uses PDT for hardware-like training, SSAT for single-parameter tuning of ADC integration time, and PTSS for genetic-algorithm search over multiple tunable parameters such as integration time, weight copy number, and input expansion mode. The loop repeatedly changes CIM-IR parameters, regenerates/evaluates backend behavior, and compares hardware/simulator output with ideal software output using MSE. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of serialized CIM-IR YAML, Python layer/device/data classes, macro-specific mapping and calculation mixins, placement search state, generated backend code, and simulator/hardware calibration assumptions. The paper foregrounds CIM-IR as the reusable boundary, while the reusable semantics are most visible in the tri-part split of Attribute/Mapping/Calculation plus the generated-script contract: parse model, bind weights to arrays, attach calculation knobs, generate simulator or hardware calls, evaluate, and rewrite parameters.

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 — Narrow end-to-end co-design.**  
OpenCIMTC owns a complete vertical slice for a memristor CIM prototype: frontend import, CIM-IR construction, array mapping, backend generation, simulator/hardware execution, PDT, and parameter search. The input is an ONNX neural-network model plus hardware/config constraints; the output is mapped IR plus generated training/optimization/inference code for simulator or chip-oriented execution. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**Secondary: A4 — Explicit IR / compiler stack.**  
The stack names a CIM-IR, serializes it as YAML, and uses it as the bridge between compiler, training, optimizer, simulator, and backend. Its strongest explicit IR concept is the Attribute/Mapping/Calculation split. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
The compiler performs placement, array binding, split/copy decisions, and hardware-parameter search. PTSS is a simulator/chip-in-the-loop DSE flow over tunable deployment parameters. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**Secondary: A2 and A6.**  
The simulator and hardware driver are part of the stack, and the paper reports on-chip execution on a prototype. The public artifact’s reusable evidence is clearest for simulator-oriented operation; hardware execution is documented in the paper and supplement. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is YAML CIM-IR. Decisions made there include operator attributes, mapping state, runtime target, physical weight addresses, quantization/scaling fields, ADC integration time, and other calculation parameters. The single artifact upstream passes can read and rewrite is the mapped YAML file, but the valid field set and semantics are also encoded in Python classes and backend assumptions. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**B2 — Graph-as-IR.**  
The IR carries layer nodes, inputs/outputs, weights, data definitions, and graph topology. The artifact’s `Layer`/`DataDef` logic represents layer inputs, outputs, weights, shapes, and references, while the ONNX frontend provides the graph source. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/irtool/core/layer.py))

**B4 — Hardware-resource IR.**  
Mapping fields name device locations, array addresses, split/repeat/copy factors, and runtime target. The paper’s supplement explicitly states that mapping information includes physical weight addresses on real memristor chips or virtual devices, and the artifact exposes `MacroDeviceMappingInfo` / `MacroMappingInfo` fields. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**B6 — Accuracy / nonideality modeling.**  
Calculation fields and PDT/PTSS flows make nonideal hardware behavior part of the compiler loop. The paper models low-precision DAC effects, ADC/output quantization, weight splitting, noise, and integration-time tuning; the artifact exposes fields such as activation bits, output quantization mode, noise scale, ADC offset/clamp/quantization, and LUT/fit parameters. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**B7 — Runtime-state abstraction, limited but useful.**  
The IR distinguishes runtime targets such as real chip and simulator, and the calculation parameters are deployment/runtime knobs. This is a runtime configuration abstraction rather than a general dynamic-state IR for batching, masks, KV cache, or sparsity. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

**B5 — Instruction/meta-op boundary, partial.**  
The supplement names an ACCI-style interface with Set, Reset, Read, Calculate, and Program operations, and generated code calls backend functions. This is best treated as a backend interface or meta-op set rather than a stable public ISA. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class / parameterized** | Hardware descriptions include array size/number and device constraints; mapping info carries physical addresses; artifact device/macro classes represent the target macro hierarchy. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Bit-slicing / bit significance | **Parameter / backend transformation** | Supplementary Note 6 describes bit-unrolling and fully-unrolling input formats; PDT flow models bit-slice behavior and shift-accumulation. The artifact exposes calculation fields such as activation bits and shift expansion mode. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| ADC/DAC precision or sensing | **Parameter / modeled calculation knob** | The paper discusses ADC precision and DAC precision as CIM constraints; calculation fields include integration time and ADC-related parameters. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Analog-to-digital or domain transition | **Costed/approximated via calculation and training flow** | PDT explicitly inserts output quantization/ADC-error behavior before accumulation; SSAT/PTSS optimize integration-time-related behavior through MSE. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Peripheral circuits as path nodes | **Partially first-class through backend interface** | ACCI functions include Set/Reset/Read/Calculate/Program, and the chip module includes DAC/ADC/SIC-style blocks. The path is represented as backend calls rather than a typed dataflow path. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Partial-sum accumulation path | **Implicit / generated-code semantics** | Supplementary Note 6 describes splitting and summing/concatenation behavior; PDT models shift-accumulate and split-output addition. These are visible as transformations and generated code behavior, not as a standalone partial-sum IR object. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Reconstruction / shift-add tree | **Hard-coded or parameterized behavior** | Bit-sliced input expansion and shift-add reconstruction are described in the supplement, and artifact calculation fields include shift expansion mode. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Not applicable / not found in checked sources** | The demonstrated workloads are static NN inference/training-adjustment flows. I did not find first-class runtime abstractions for KV cache, attention masks, dynamic batching, or sparsity in the checked sources. |
| Value trajectory / flow path | **Approximated** | The closest trajectory semantics are the hardware-like forward path in PDT and the mapping/calculation metadata that describe where values are placed and how they are quantized/accumulated. A value identity spanning analog partial sums, sensing, reconstruction, and downstream operators is not exposed as a named IR object. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |

### 5.4 Axis D — rewrite object

OpenCIMTC rewrites several concrete objects:

- **Operator graph:** ONNX-derived model structure is parsed, renamed, fused, split, and represented as CIM-IR layer nodes. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  
- **Hardware mapping / array binding:** weight matrices are split, copied, repeated, and placed onto arrays; mapping metadata stores device addresses and split/copy factors. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  
- **Memory/layout representation:** convolution weights and activations are transformed between 4D/2D layouts, split vectors/matrices, and bit-expanded input forms. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  
- **Numeric and hardware calculation parameters:** integration time, weight copy number, input expansion mode, quantization scales, activation bits, ADC/noise fields, and output quantization behavior are varied or serialized. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))  
- **Backend flow:** CIM-IR is lowered into generated Python/C-like function-call code for simulator or hardware-driver execution. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  

Legal transformations in the demonstrated framework include graph fusion/splitting, weight row/column splitting, weight copy, bit-unrolling input encoding, insertion of split/add/concat behavior for large mappings, and per-layer hardware-parameter rewriting. The equivalences exploited are mostly neural-network graph equivalences and linear-algebra partitioning equivalences: a large MVM or convolution can be partitioned across arrays and reconstructed through sum/concat; multiple copies can be averaged or scaled; low-bit input expansions can be recombined with shift-add behavior. The information that must be preserved across lowering includes layer identity, tensor shape/reference, weight value and physical address, split/copy structure, quantization/scale choices, runtime target, and reconstruction behavior.

The representation is especially well suited to per-layer placement plus deployment-parameter tuning. Expressing trajectory rewrites such as retiming ADC conversion across operator boundaries, carrying bit-sliced partial sums between layers, or changing reduction-tree topology would likely require an additional abstraction for typed value domains, partial-sum identity, peripheral path nodes, and reconstruction/reduction operators.

## 6. Technical mechanism reading

### 6.1 Compiler and CIM-IR mechanism

The compiler starts from ONNX and a hardware description. The supplement describes extracting layer type, data type, dependency, and resource needs, then applying graph optimizations such as convolution–batchnorm fusion and splitting layers that exceed hardware capacity. It then emits a CIM-IR whose node information is divided into Attribute, Mapping, and Calculation. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

The **Attribute** portion behaves like operator metadata: operator type, kernel, stride, padding, and related layer fields. The **Mapping** portion binds an operator’s weights to hardware or virtual resources: split/copy information, physical address, runtime target, and real-chip versus simulator/virtual execution. The **Calculation** portion carries per-layer hardware calculation parameters such as ADC integration time, weight scale, input quantization scale, activation bits, output quantization mode, and simulator/calibration-related fields. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

### 6.2 Mapping and data transformation

The mapping procedure is array-oriented. The supplement describes a lowest-horizontal-line placement algorithm that allocates weights while attempting to reduce the number of used arrays. It also describes transformations for input bit-unrolling, full unrolling, vector split/concat, matrix row split, column split, row-and-column split, and weight copy across same or different arrays. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

The artifact’s mapper confirms this organization: macro placement supports weight format selection, average copy, explicit parallelism/splitting options, placement strategy selection, runtime choice, and a target device. The helper logic attaches macro mapping and calculation information to mapped layers and can insert split/add/concat-like structure for adaptive splitting. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/mapper/macro.py))

### 6.3 Backend contract

The backend parses CIM-IR and emits high-level functions for simulator or hardware execution. The supplement describes target code as including scheduling, data conversion, and function calls; it also identifies ACCI-style operations such as Set, Reset, Read, Calculate, and Program. This makes the backend contract concrete, although the stable public object is the generated script plus CIM-IR rather than a separately specified instruction-set architecture. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

The public README demonstrates a staged workflow: generate mapped IR from ONNX, generate PDT training code, modify IR using trained weights, generate simulator-in-loop optimization files, run optimization, and finally generate simulator inference code. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/README.md))

### 6.4 PDT: hardware-like training after deployment mapping

PDT uses CIM-IR mapping information to make training aware of hardware behavior. The paper states that low-precision DACs motivate activation bit slicing, limited array size motivates weight splitting, and ADC/output quantization is modeled before accumulation. The PyTorch extensions implement hardware-like forward behavior and support backward propagation for adjusted training. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

For compiler/IR readers, the important point is that training is downstream of mapping: the mapping state is not merely a backend detail, but a training-time input. This makes CIM-IR a shared contract between compiler, training transformation, and deployment backend.

### 6.5 SSAT and PTSS: optimization by rewriting calculation parameters

SSAT is a single-parameter tuning loop for ADC integration time. The paper describes a layer-wise loop that compares ideal software outputs to hardware/simulator outputs using MSE, changes integration time by fixed increments, regenerates/runs configurations, and stops when a threshold condition is reached. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

PTSS generalizes this idea to multiple tunable parameters. The paper formulates a search over per-layer integration time, weight copy number, and input expansion mode, using a genetic algorithm and simulator feedback. The key compiler mechanism is a rewrite loop over CIM-IR: encode candidate parameters, generate simulator code, evaluate MSE, and update the IR according to the optimizer. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The three-way IR split is the durable abstraction

- **Observation:** OpenCIMTC’s most reusable idea is the split between algorithm attributes, mapping state, and calculation parameters. This separation lets layer identity, placement, and hardware tuning move through different compiler/training/backend stages without collapsing into a monolithic simulator input. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  
- **Why it matters for CIM compiler/IR work:** CIM stacks often mix placement, quantization, and hardware calibration inside backend code. OpenCIMTC shows a practical way to name these as separate IR regions.  
- **Reusable lesson:** A future CIM IR could preserve this split while adding a formal schema, validation rules, and pass interfaces.

### Insight 2 — Mapping metadata is training-visible, not just backend-visible

- **Observation:** PDT consumes mapping information, including bit slicing and weight splitting, to generate hardware-like trainable modules. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))  
- **Why it matters for CIM compiler/IR work:** This turns placement from a backend allocation result into an input to numerical adaptation. The compiler’s array binding can affect training semantics.  
- **Reusable lesson:** IRs for analog CIM should consider mapping state as part of the numerical contract, not merely an address assignment.

### Insight 3 — The optimization loop rewrites IR parameters rather than model structure

- **Observation:** SSAT and PTSS focus on modifying calculation parameters such as integration time, weight copy number, and input expansion mode, then evaluating MSE through simulator or chip feedback. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))  
- **Why it matters for CIM compiler/IR work:** This is a useful example of “deployment-parameter DSE” where legal rewrites are hardware-calibration choices, not graph algebra transformations.  
- **Reusable lesson:** Backend plugins could expose tunable calculation fields with legality ranges and calibration hooks, allowing a generic optimizer to rewrite them.

### Insight 4 — The backend interface reveals the actual hardware contract

- **Observation:** The supplement’s ACCI-style functions and generated code descriptions make the backend contract concrete: schedule, data conversion, and function calling are needed to turn CIM-IR into execution. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))  
- **Why it matters for CIM compiler/IR work:** A high-level IR alone does not capture all semantics; generated code and device APIs often define the real execution boundary.  
- **Reusable lesson:** Corpus entries should record both the named IR and the backend-call vocabulary, because the latter often exposes sensing/programming/calculation operations.

### Insight 5 — The artifact’s Python classes act as a schema surrogate

- **Observation:** The public artifact exposes many IR semantics through Python classes rather than through a separate formal schema document. `MacroMappingInfo` and `MacroCalcInfo` make fields such as split counts, runtime, mapped devices, scales, activation bits, integration time, noise, and ADC parameters visible. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/hw_paras_def/macro.py))  
- **Why it matters for CIM compiler/IR work:** For reuse and audit, class definitions may be as important as paper figures when identifying what the stack truly treats as first-class.  
- **Reusable lesson:** A future public IR stack could generate both YAML schemas and Python bindings from a single declarative source.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** GitHub repository `Tsinghua-LEMON-Lab/OpenCIMTC`; archived Zenodo record “RH-YU/OpenCIMTC: The initial version,” DOI `10.5281/zenodo.14823197`. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC))  
- **License:** MIT license in the repository and Zenodo record. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/LICENSE))  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** compiler package, frontend/backend/IR-tool/mapper directories, hardware-parameter definitions, customized HAT/PDT code, simulator utilities, optimizer code, ResNet-32 ONNX example, training configuration YAMLs, and README commands for IR generation, PDT code generation, optimization, simulator-code generation, and inference. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/tree/master/OpenCIMTC))  
- **What the artifact appears to omit or leave unclear:** I did not find a single top-level script that reproduces every paper figure end-to-end. Hardware-backed reproduction appears to require the authors’ prototype chips/FPGA setup and hardware-specific calibration/control access. The public workflow is clearest for simulator-oriented ResNet-32 examples.  
- **Minimal documented workflow:** install Python dependencies, run `cimcc.py` to generate mapped IR, generate PDT training code, train using provided quantization configs, modify IR with trained weights, generate optimization files, run `optimize.py`, generate simulator code, and run `inference.py`. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/README.md))  
- **Whether paper figures appear reproducible from the artifact:** Partial / unknown. The repository supports the demonstrated software flow and example generation, while full reproduction of hardware-backed figures likely requires external datasets, trained weights or source data, hardware access, and calibration details beyond a simple public command.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Yes | ONNX input and hardware/config YAML workflow are described in the supplement and README. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Intermediate representation serialized | Yes | Mapped CIM-IR is generated as YAML. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/README.md)) |
| Mapping decisions inspectable | Partial | Mapping fields are serialized and class-defined; full readability depends on generated YAML and code conventions. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/hw_paras_def/macro.py)) |
| Schedule inspectable | Partial | Generated target code includes scheduling/function calling, but I did not find a separate schedule IR. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Hardware config explicit | Partial | Hardware descriptions and device classes exist; complete hardware reproduction depends on prototype-specific details. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Precision / bit-slice assumptions explicit | Partial | Bit-unrolling and quantization behavior are described; propagation is partly encoded in backend/training code. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Cost model inspectable | Partial | MSE objectives and search algorithms are described; energy/latency-style reusable plugin interfaces are less explicit in the public compiler workflow. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Simulator backend documented | Partial | README shows simulator code generation and inference; simulator source is public. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/blob/master/README.md)) |
| Generated code / instruction stream inspectable | Partial | Generated Python/C-like target code is part of the workflow; stable ISA-level output is not the main public abstraction. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Provenance from source op to backend action | Partial | Layer names, graph references, and mapping metadata support provenance, but no formal provenance audit interface was found. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf)) |
| Reproduction scripts available | Partial | Scripts and commands are available for the ResNet-32 workflow; complete paper reproduction is broader than the README path. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC/tree/master/test)) |
| Calibration source documented | Partial | Paper and supplement discuss simulator/hardware calibration assumptions; public artifact-level calibration completeness remains unclear from checked files. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |

### 8.3 Integration helper

- **As frontend:** Reuse is possible through the ONNX import path and layer graph representation. Integration would be most direct for static DNN models with supported operators and known tensor shapes.  
- **As IR inspiration:** The Attribute/Mapping/Calculation split is the strongest reusable design. A future stack could borrow the idea while adding a schema, verifier, and pass manager.  
- **As mapper/scheduler:** The array placement, split/copy metadata, and adaptive split/add/concat insertion are useful for RRAM/crossbar mappers. Reuse would benefit from an adapter that extracts mapping state independent of the specific RRAM-144k target.  
- **As cost model:** SSAT/PTSS show how to define tunable deployment fields and optimize them with MSE feedback. The most reusable form is a plugin interface where calculation parameters expose legal ranges, objective hooks, and simulator/chip evaluators.  
- **As backend:** The simulator-code generation path can likely be wrapped more easily than the hardware-driver path. Hardware backend reuse would require matching device APIs, calibration, register/control conventions, and runtime support.  
- **As benchmark:** The ResNet-32 example, ONNX model, training configs, and generated-flow commands are useful as a small compiler-stack benchmark. The paper’s broader workload set is useful as a comparison target, but public reproduction appears more involved.  
- **As validation source:** The paper provides hardware-backed measurements and simulator-/chip-in-loop optimization examples that can inform calibration studies for analog CIM tools. Reuse as calibration data would depend on access to source data, simulator settings, and hardware characterization context.

**Integration effort estimate:** **Medium to High.** Integration as an IR-design reference or ResNet-32 simulator workflow is medium effort because the repository exposes the core compiler and example commands. Integration as a general backend or hardware-calibrated compiler component is high effort because several semantics are embedded in Python classes, generated scripts, simulator assumptions, and prototype-specific runtime behavior.

## 9. Relation to a value-trajectory CIM IR project

OpenCIMTC provides useful ingredients for a value-trajectory IR, especially its explicit separation of mapping and calculation metadata. The closest approximation to trajectory semantics is the combination of bit-slicing/input expansion, weight splitting, output quantization, shift-accumulation, and split-output reconstruction in PDT and data-transformation flows. ([Springer Static Content](https://static-content.springer.com/esm/art%3A10.1038%2Fs41467-025-57183-0/MediaObjects/41467_2025_57183_MOESM1_ESM.pdf))

The paper names parts of the path a value takes through CIM resources: input encoding, array/MVM execution, ADC/output quantization, split accumulation, and backend function calls. Value identity, however, is primarily preserved at the layer/tensor/mapping level, not as a first-class value object that spans analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage. The artifact’s `DataDef`, `Layer`, `MacroMappingInfo`, and `MacroCalcInfo` objects provide a plausible attachment point for such a trajectory extension. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/irtool/core/layer.py))

Bit significance, precision stage, placement, and domain transition are partly represented as parameter-like information: activation bits, input quantization scale, output quantization mode, shift expansion mode, integration time, runtime, and mapped device address. They are not presented as a type system, but they suggest what type-like fields a future trajectory IR could attach to tensors or partial-sum values. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/OpenCIMTC/master/OpenCIMTC/compiler/hw_paras_def/macro.py))

For trajectory rewrites:

- **Fusing reconstruction with downstream reduction:** The current representation can express split/add/concat behavior, but a trajectory-level extension would likely need explicit reconstruction and reduction nodes.  
- **Delaying or retiming ADC conversion:** The stack exposes ADC/integration-time parameters, but retiming ADC across boundaries would need a domain-transition abstraction.  
- **Carrying bit-sliced partial sums across operator boundaries:** Bit-sliced behavior is modeled inside transformations and PDT; cross-operator carrying would require typed partial-sum values.  
- **Changing reduction-tree structure:** Current mapping supports split and reconstruction choices; a rewriteable reduction tree would need an explicit accumulation-path object.  
- **Routing values through alternative peripheral paths:** ACCI-style functions and chip-module blocks provide vocabulary, but alternative path selection would need peripheral path nodes in IR.  
- **Co-optimizing data movement and numeric reconstruction:** OpenCIMTC already co-optimizes mapping and calculation parameters in a practical loop; a trajectory IR could generalize this by attaching movement, domain, precision, and reconstruction metadata to each value segment.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| PUMA | Programmable memristor/CIM acceleration and compiler-facing execution | PUMA is closer to a programmable architecture/ISA-style accelerator line, while OpenCIMTC is a prototype-specific vertical compiler–simulator–hardware stack with YAML mapping/calculation IR. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Separate “programmable CIM architecture” from “vertical co-design stack with config-as-IR.” |
| TC-CIM | Compilation for analog CIM using tensor/compiler abstractions | TC-CIM is closer to tensor-comprehension / compiler lowering, while OpenCIMTC emphasizes deployment mapping, hardware parameter tuning, and real prototype feedback. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Classify by rewrite object: tensor schedule versus mapping/calculation parameters. |
| OCC | Open CIM compiler infrastructure | OCC is the closest comparison by name and compiler ambition; OpenCIMTC’s distinctive object is the Attribute/Mapping/Calculation YAML CIM-IR tied to a memristor prototype and PDT/PTSS loops. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Record whether “open compiler” means a general dialect/pass stack or a reusable vertical flow. |
| PIMCOMP | Compilation/mapping for crossbar-based PIM DNN accelerators | Both address mapping DNN workloads to crossbar resources. OpenCIMTC adds hardware-backed execution, tunable calculation parameters, and post-deployment training around a concrete chip flow. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | For corpus grouping, distinguish array mapping frameworks from hardware-in-loop compiler stacks. |
| IBM AIHWKIT / analog hardware acceleration kit | Analog nonideality simulation and training | AIHWKIT-style tools center on analog training/simulation abstractions; OpenCIMTC couples nonideality-aware training to explicit CIM-IR mapping and backend generation. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Mark whether nonideality modeling is standalone or tied to compiler mapping state. |
| Rasch-style hardware-aware training for analog IMC | Training under analog IMC constraints | OpenCIMTC’s PDT shares the hardware-aware training concern but embeds it in an end-to-end compiler flow where mapping metadata feeds training code. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Corpus notes should identify when training consumes compiler IR rather than separate hardware model parameters. |

## 11. Corpus-ready final takeaway

- OpenCIMTC’s core reusable contribution is a vertical memristor CIM stack centered on a YAML CIM-IR with **Attribute**, **Mapping**, and **Calculation** fields.  
- The strongest reusable stack layer is the mapping/deployment boundary: physical array placement, split/copy metadata, runtime target, and ADC/quantization/integration-time parameters.  
- The evidenced scope is static neural-network inference and hardware-aware deployment/training flows for the authors’ memristor/RRAM CIM prototype, with a public ResNet-32-centered simulator workflow.  
- First-class CIM objects include layer attributes, physical weight addresses, array split/copy state, runtime target, integration time, quantization scales, activation bits, and simulator/nonideality knobs.  
- The hidden IR lives across YAML files, Python mixin classes, mapper state, generated scripts, and simulator/backend assumptions.  
- Artifact status is public: GitHub plus Zenodo, MIT licensed; reproducibility is strongest for software/simulator examples and partial for full hardware-backed paper figures.  
- Integration is most direct as IR inspiration, mapper/scheduler reference, simulator workflow, and deployment-parameter search pattern.  
- For value-trajectory IR research, OpenCIMTC is valuable because it exposes the ingredients—bit slicing, mapping, sensing/quantization parameters, and reconstruction behavior—even though trajectory identity is not the named IR object.

## 12. Suggested metadata entry

```yaml
paper: "OpenCIMTC / A full-stack memristor-based computation-in-memory system with software-hardware co-development"
year: 2025
venue: "Nature Communications"
authors_or_group: "Tsinghua LEMON Lab and collaborators"
technology:
  - RRAM-CIM
  - memristor-CIM
  - analog-CIM
  - hybrid analog-digital
workloads:
  - image classification
  - text classification
  - image segmentation
  - object detection
  - ResNet-32
  - ResNet-50 simulator evaluation
axis_A:
  primary: A5_narrow_end_to_end_codesign
  secondary:
    - A4_explicit_IR_compiler_stack
    - A3_mapping_scheduling_DSE
    - A2_simulator_cost_model
    - A6_programming_runtime_real_hardware
axis_B:
  - B1_config_as_IR
  - B2_graph_as_IR
  - B4_hardware_resource_IR
  - B6_accuracy_nonideality_modeling
  - B7_runtime_state_abstraction_partial
axis_C_first_class_objects:
  - operator_attributes
  - CIM_friendly_op_type
  - virtual_non_CIM_runtime
  - weight_split_copy_repeat
  - physical_array_address
  - runtime_target_real_or_simulator
  - ADC_integration_time
  - weight_scale
  - input_quantization_scale
  - activation_bits
  - output_quantization_mode
  - simulator_nonideality_parameters
axis_D_rewrite_objects:
  - operator_graph
  - hardware_mapping
  - array_binding
  - memory_layout
  - input_bit_expansion
  - numeric_format
  - hardware_calculation_parameters
  - generated_backend_flow
artifact:
  status: public_artifact_found
  url: "GitHub repository Tsinghua-LEMON-Lab/OpenCIMTC; Zenodo DOI 10.5281/zenodo.14823197"
  license: MIT
  last_checked: "2026-05-15"
integration_roles:
  - frontend
  - IR_inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: medium
trajectory_IR_relevance: medium
notes:
  - "Most reusable abstraction is the Attribute/Mapping/Calculation split in YAML CIM-IR."
  - "Public workflow is clearest for ResNet-32 simulator-oriented generation, PDT, optimization, and inference."
  - "Hardware-backed reproduction depends on prototype hardware and calibration context."
  - "Value-trajectory extensions could attach domain, precision, placement, and reconstruction metadata to DataDef/layer outputs and MacroMappingInfo/MacroCalcInfo."
```