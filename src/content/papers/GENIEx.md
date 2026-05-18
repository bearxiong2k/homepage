# GENIEx — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 — Simulator & cost model** | GENIEx’s strongest evidenced contribution is an accuracy/nonideality simulator layer for analog memristive-crossbar MVMs. The paper formalizes a learned current-ratio model from HSPICE data and uses it inside a PyTorch functional simulator. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design** | The paper claims an end-to-end framework, and the demonstrated path is PyTorch DNN layers → iterative/tiled/bit-sliced MVM execution → GENIEx nonideality injection → classification accuracy. The simulator explicitly abstracts “the analog computing aspect” and ignores memory and communication effects. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Middle-layer style, Axis B | **B6 Accuracy / nonideality modeling**, with **B1 Config-as-IR** and limited **B2 Graph-as-IR** | The named reusable middle object is the learned GENIEx crossbar model, parameterized by voltage and conductance tensors. In the artifact, global config fields and custom PyTorch modules carry most stack decisions: bit slicing, bit streaming, crossbar size, ADC precision, accumulator width, and nonideality mode. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| First-class CIM objects, Axis C | Crossbar size, conductance matrix, input-voltage vector, nonideal current ratio, bit slices, bit streams, ADC bits, accumulator width, shift-add reconstruction, positive/negative weight paths | The paper directly names crossbar MVM, tiling, bit slicing, ADC output, and shift-add reconstruction. The code exposes these as config parameters and tensor transformations in `config.py`, `mvm_v3.py`, and custom `Conv2d_mvm` / `Linear_mvm` layers. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Rewrite object, Axis D | **Operator-to-MVM functional rewrite**, **numeric-format rewrite**, **array/tile binding**, **accuracy-model injection** | The framework rewrites selected PyTorch `Conv2d` and `Linear` layers into MVM-oriented layers, tiles weight matrices across crossbars, splits inputs/weights into bit streams and bit slices, applies a learned nonideality ratio, and reconstructs digital outputs through ADC quantization and shift-add. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Best corpus tags | `analog-CIM`, `RRAM-CIM`, `memristive-crossbar`, `nonideality-modeling`, `learned-surrogate`, `PyTorch-simulator`, `MVM-tiling`, `bit-slicing`, `DNN-inference`, `ResNet` | These tags reflect the evidenced stack layer, hardware setting, and workloads. |
| Closest comparison baselines | **CrossSim**, **NeuroSim**, **CxDNN**, **MemTorch**, **PUMA**, **X-Changr / AMS-style analog simulation** | CrossSim and MemTorch are nearby accuracy simulators; NeuroSim is nearby circuit/macro cost modeling; CxDNN is nearby crossbar nonideality compensation; PUMA is the closest full compiler/ISA contrast; the GENIEx paper itself positions GENIEx relative to CrossSim, NeuroSim, CxDNN, and AMS. ([arXiv](https://arxiv.org/pdf/2003.06902)) |

## 2. One-paragraph public summary

GENIEx is best read as a calibrated nonideality-modeling layer for analog memristive-crossbar CIM, coupled to a PyTorch functional simulator for DNN accuracy studies. Its central technical contribution is a learned surrogate for data-dependent MVM nonidealities: the model consumes an input-voltage vector and conductance matrix, predicts a per-column current correction ratio, and is trained from HSPICE-generated crossbar data. The demonstrated stack path replaces selected PyTorch convolution and linear layers with tiled, bit-sliced MVM execution, injects GENIEx nonideal current behavior, reconstructs digital outputs through ADC and shift-add operations, and evaluates classification accuracy on ResNet-style image-classification workloads. For CIM compiler/IR research, the reusable boundary is clearest as a backend accuracy plugin and as a concrete example of how bit-slice, tile, ADC, and parasitic parameters can be carried through functional simulation, while compiler-facing IR, pass interfaces, instruction streams, runtime scheduling, memory/communication timing, and energy/area modeling are outside the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2003.06902))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| GENIEx captures nonlinear, data-dependent nonidealities in memristive-crossbar MVM. | Abstract; Sections 3–4 | Equation + experiment | The paper defines ideal MVM current, nonideal current, and a learned ratio \(f_R(V,G)=I_\text{ideal}/I_\text{nonideal}\). It shows that nonideality depends on both input voltages and conductance patterns, then trains a neural model to predict the current ratio. ([arXiv](https://arxiv.org/pdf/2003.06902)) | Demonstrated for SPICE-generated crossbar MVM samples over selected voltage, conductance, sparsity, and crossbar-parameter regimes. Hardware-measured calibration is described as possible, but not shown in the checked paper evidence. |
| GENIEx improves over linear analytical nonideality models. | Section 4; Figure 5 | Experiment | The paper reports NF-RMSE of 0.25 and 0.7 for GENIEx versus 1.73 and 8.99 for an analytical model in the evaluated settings, corresponding to about 7× and 12.7× RMSE reduction. ([arXiv](https://arxiv.org/pdf/2003.06902)) | Evidence is simulator-backed against HSPICE data for the reported crossbar settings; it is an accuracy-model comparison, not a compiler or runtime comparison. |
| GENIEx can serve as a “universal” nonideality modeling method using either simulations or measurements. | Introduction contribution list | Paper-only + methodology | The methodology is general in form: train a neural mapping from \((V,G)\) to current-ratio outputs using labeled current data. ([arXiv](https://arxiv.org/pdf/2003.06902)) | The paper-level evidence supports a reusable modeling pattern. Artifact-level confirmation of alternate devices, measurement data, or automated retraining workflows would require additional datasets and scripts. |
| The work provides an end-to-end framework for evaluating large DNNs on memristive crossbars. | Abstract; contribution list; Section 5 | Algorithmic simulator + experiment + artifact | The simulator implements `conv2d-mvm` and `linear-mvm`, performs iterative MVM, tiling, bit slicing, ADC quantization, shift-add reconstruction, and GENIEx or ideal MVM execution. The public artifact exposes custom PyTorch MVM layers and model definitions such as ResNet variants. ([arXiv](https://arxiv.org/pdf/2003.06902)) | Demonstrated as a functional PyTorch accuracy simulator for selected layers and image-classification models. The paper explicitly states that memory and communication effects are ignored. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| The simulator models tiling and bit slicing for large DNN execution. | Section 5; Table 3; Figure 6 | Algorithm + code/artifact | Table 3 lists tiling and bit-slicing parameters including crossbar size, input bits, weight bits, accumulator width, ADC bits, stream width, and slice width. The artifact implements weight and input bit-slicing routines and tensor MVM kernels. ([arXiv](https://arxiv.org/pdf/2003.06902)) | The reusable boundary is clearest in PyTorch tensor layouts and global config fields. No separate serialized mapping IR or schedule trace is surfaced in the checked sources. |
| Device, circuit, and numerical design parameters materially affect DNN accuracy. | Section 6; Figures 7–9 | Experiment | The paper evaluates effects of crossbar size, \(R_\text{on}\), ON/OFF ratio, source/sink/wire resistances, fixed-point precision, stream width, and slice width on ResNet-20/CIFAR-100 and ResNet-18/ImageNet-subset accuracy. ([arXiv](https://arxiv.org/pdf/2003.06902)) | The evaluation loop is classification-accuracy oriented. Latency, energy, area, memory hierarchy, and communication timing are not part of the reported model. |
| The authors planned to open-source the framework. | Introduction contribution list | Paper-only + public artifact | The paper says the framework would be open-sourced. A public author-associated repository, `Aayush-Ankit/puma-functional-model`, contains `geniex`, `src`, `models`, and `test` folders, custom MVM layers, configs, and sample commands. ([arXiv](https://arxiv.org/pdf/2003.06902)) | The artifact is useful for simulator inspection and adaptation. In the checked sources, license, releases, HSPICE decks, pretrained GENIEx model weights, and paper-figure reproduction scripts were not found. |

## 4. Stack anatomy

```text
Input / frontend:
```

PyTorch DNN models and datasets are the effective frontend. The paper specifically implements `conv2d-mvm` and `linear-mvm` because convolution and fully connected layers dominate crossbar MVM execution; the artifact contains `resnet18_mvm.py`, `resnet20_mvm.py`, `vgg16_mvm.py`, and test scripts for CIFAR-100 and ImageNet-style evaluation. This is a PyTorch module graph and script-level workload entry, not a separate compiler frontend format. ([arXiv](https://arxiv.org/pdf/2003.06902))

```text
Middle representation:
```

The middle representation is distributed across PyTorch custom modules, tensor layouts, and config fields. The paper names tensors shaped around slices, tile rows/columns, crossbar rows/columns, streams, and batch dimensions; the artifact exposes corresponding parameters such as `bit_slice`, `bit_stream`, `weight_bits`, `input_bits`, `adc_bit`, `acm_bits`, crossbar dimensions, and GENIEx model paths. It is inspectable in code and configs, partially documented in the README, and not serialized as a standalone IR. ([arXiv](https://arxiv.org/pdf/2003.06902))

```text
Mapping or scheduling state:
```

Mapping state consists of iterative MVM decomposition, tiling across crossbars, positive/negative weight separation, bit slicing of weights, bit streaming of inputs, ADC quantization, and shift-add reduction. These decisions are represented as tensor transformations and loop structure inside the simulator rather than as an external schedule object. ([arXiv](https://arxiv.org/pdf/2003.06902))

```text
Hardware abstraction:
```

The hardware abstraction is an analog crossbar MVM template with conductance matrix, input voltage vector, nonideal output current, source/sink/wire parasitics, ON/OFF conductance range, ADC precision, accumulator width, stream width, and slice width. The artifact’s `config.py` and MVM kernels expose these as parameters and code paths; peripheral circuits are represented functionally rather than as independently scheduled hardware nodes. ([arXiv](https://arxiv.org/pdf/2003.06902))

```text
Backend / simulator / codegen:
```

The backend is a PyTorch functional simulator. It uses ideal dot-product-style tensor MVM or GENIEx nonideality injection depending on mode, loads a crossbar surrogate model when nonideality is enabled, predicts current ratios, applies scaling and ADC quantization, then reconstructs outputs through reductions. It does not emit an ISA, RTL, binary, or runtime command stream in the checked sources. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/mvm_v3.py))

```text
Output artifact:
```

The output is primarily classification accuracy and nonideality/error measurements. The paper reports NF-RMSE against HSPICE, design-parameter sensitivity, quantization sensitivity, bit-slicing sensitivity, and top-1 accuracy effects on ResNet models. The output is a simulator result, not a generated hardware program or trace. ([arXiv](https://arxiv.org/pdf/2003.06902))

```text
Evaluation loop:
```

The loop is: generate or collect crossbar \((V,G,I)\) data using HSPICE → train GENIEx as a current-ratio predictor → replace PyTorch layers with MVM versions → configure crossbar/numeric parameters → run ideal or nonideal MVM simulation → compare classification accuracy and nonideality metrics. The paper states the simulator ignores memory and communication effects, which makes the loop focused on analog-compute accuracy. ([arXiv](https://arxiv.org/pdf/2003.06902))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of PyTorch layer replacement, global configuration parameters, tensor layout conventions, bit-slice/stream dimensions, crossbar-model weights, and scaling constants used by the nonideality kernel. The paper foregrounds the GENIEx learned model, while the reusable stack semantics are most visible in the simulator’s tensor shapes and config parameters: they define how a DNN operator becomes tiled, signed, bit-sliced crossbar MVM with ADC and reconstruction behavior. ([arXiv](https://arxiv.org/pdf/2003.06902))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
GENIEx owns the accuracy/nonideality slice of the CIM stack. Its input is an MVM instance represented by input voltages and conductances; its core output is a corrected current estimate or current-ratio prediction. At the DNN level, the simulator maps layer execution to many such MVM instances and reports accuracy impact. ([arXiv](https://arxiv.org/pdf/2003.06902))

**Secondary: A5 — Narrow end-to-end co-design.**  
The paper’s “end-to-end” path is real but scoped: it starts from PyTorch DNN layers, lowers selected operators into crossbar MVM execution, injects nonideal behavior, and evaluates classification accuracy. It does not claim a general-purpose compiler IR in the evidenced artifact; the simulator explicitly abstracts away memory and communication, so the stack slice is analog-compute functional accuracy rather than full-system compilation. ([arXiv](https://arxiv.org/pdf/2003.06902))

**Not primary: A4 — Explicit IR / dialect / ISA compiler stack.**  
The paper does not present a named IR, dialect, instruction format, pass pipeline, verifier, or serialized compiler object. The closest compiler-facing boundary is the custom PyTorch layer API plus configuration fields.

### 5.2 Axis B — middle-layer style

**B6 — Accuracy / nonideality modeling.**  
The named middle representation is the GENIEx neural surrogate: a function over voltage and conductance values that predicts a current-ratio vector. Decisions made here include how ideal MVM current is corrected for nonlinear circuit effects and how SPICE-level behavior is approximated during DNN simulation. Decisions about operator fusion, memory placement, inter-layer scheduling, and runtime communication remain outside this representation. ([arXiv](https://arxiv.org/pdf/2003.06902))

**B1 — Config-as-IR.**  
The artifact’s `config.py` is a de facto stack contract. It names precision, fractional bits, crossbar dimensions, tile dimensions, bit stream width, bit slice width, ADC bits, accumulator bits, conductance values, voltage maximum, GENIEx dataset flags, and model-weight paths. Upstream tools could read these fields, but the config is not itself a typed IR with validation or transformation rules. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/config.py))

**B2 — Graph-as-IR, limited.**  
PyTorch module graphs provide the frontend structure, and the artifact replaces standard modules with `Conv2d_mvm` and `Linear_mvm`. Decisions made at this level are layer substitution and model selection; the detailed CIM lowering semantics reside inside layer implementations rather than graph annotations that a separate compiler could rewrite. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/pytorch_mvm_class_v3.py))

**B4 — Hardware-resource IR, partial.**  
Crossbar size, tile rows/columns, ADC bits, accumulator width, and parasitic values are explicit parameters, and tensor dimensions encode the binding of weights and inputs to crossbar resources. However, there is no separate resource graph for arrays, ADCs, shift-add trees, buffers, or interconnect. The hardware-resource abstraction is therefore inspectable but embedded in simulator setup and tensor layout. ([arXiv](https://arxiv.org/pdf/2003.06902))

**Single-artifact answer:**  
There is no single checked artifact that upstream passes could read, verify, rewrite, and hand to a backend as a complete CIM IR. The closest reusable artifacts are the config file, PyTorch MVM layer classes, and tensor-layout conventions.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class as crossbar size and tiled MVM resource; macro hierarchy beyond crossbar is implicit** | Table 3 lists crossbar size and GENIEx crossbar parameters; the simulator tiles layers across crossbar rows and columns. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Bit-slicing / bit significance | **First-class parameter and tensor dimension** | Bit slicing and bit streaming are named execution phases and appear as config fields; code implements bit-slicing routines and slice-based reconstruction. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| ADC/DAC precision or sensing | **ADC precision first-class parameter; DAC/input-drive behavior implicit through streams and voltage values** | Table 3 includes ADC bits, stream width, and slice width; code rounds/clamps analog output according to ADC range. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Analog-to-digital or domain transition | **Implicit functional transition, parameterized by ADC bits** | The simulator applies ADC quantization and then digital shift-add/reduction; this transition is modeled functionally rather than as a schedulable node. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Peripheral circuits as path nodes | **Parameter / implicit** | Source, sink, and wire resistances are experimental parameters; ADC and shift-add appear in the simulator, but peripheral components are not represented as independent path nodes with timing/energy. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Partial-sum accumulation path | **Explicit in tensor reductions, not separately serialized** | The simulator sums over crossbar rows, tile rows, streams, and slices in PyTorch tensor operations. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Reconstruction / shift-add tree | **Hard-coded / functional** | The paper describes shift-add reconstruction after ADC outputs; the artifact uses shift-add factors and reduction code. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Runtime state, masks, KV cache, batching, sparsity | **Batching is represented; masks/KV/runtime state are not applicable to the demonstrated workloads** | Batch size is part of tensor shapes; workloads are CNN/ResNet image classification. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Value trajectory / flow path | **Approximated through simulator tensors; not a named IR object** | The path appears as voltage/conductance/current-ratio tensors, ADC outputs, and digital reductions. Value identity across inter-layer storage, reconstruction, and later reductions is not surfaced as a first-class trajectory object. ([arXiv](https://arxiv.org/pdf/2003.06902)) |

### 5.4 Axis D — rewrite object

The tool rewrites **selected operator implementations** rather than a general compiler IR. Standard convolution and linear operations are replaced by MVM-specific PyTorch modules; weights are separated into positive and negative paths, flattened, tiled, and bit-sliced; inputs are split into bit streams; ideal analog MVM results are corrected using GENIEx; ADC quantization and shift-add reconstruction restore digital values. ([arXiv](https://arxiv.org/pdf/2003.06902))

Legal transformations in the demonstrated framework include layer substitution, crossbar tiling, bit-slice/bit-stream configuration, fixed-point precision selection, and ideal-versus-nonideal backend selection. The exploited equivalence is that convolution and fully connected layers can be lowered to repeated MVMs; fixed-point multiplication can be decomposed into bit-sliced and bit-streamed partial products; signed weights can be handled by positive/negative crossbar paths.

Information that must be preserved across lowering includes tensor shape, kernel geometry, input/output channels, padding/stride, weight sign, bit significance, fractional-bit placement, tile position, stream position, slice position, ADC precision, accumulator precision, and the mapping from analog partial sums to reconstructed digital outputs.

The representation is especially well suited to **functional accuracy experiments over static DNN inference layers**. Expressing cross-layer trajectory rewrites, memory/communication scheduling, ADC retiming, alternative reduction trees, instruction selection, or runtime state transformations would likely require an additional abstraction for value identity, domain transitions, resource binding, and schedule order.

## 6. Technical mechanism reading

### 6.1 Learned nonideality surrogate

The core model starts from ideal crossbar MVM: input voltages \(V\), conductances \(G\), and ideal column currents. The paper observes that nonideal crossbar current is a nonlinear, data-dependent function of both voltage and conductance, so it defines a correction ratio \(f_R(V,G)=I_\text{ideal}/I_\text{nonideal}\). GENIEx then predicts this ratio from the concatenation of the input-voltage vector and flattened conductance matrix, with an output vector matching the crossbar output columns. ([arXiv](https://arxiv.org/pdf/2003.06902))

The neural architecture reported in the paper is a two-layer fully connected model with input dimension \(N^2+N\), hidden dimension \(P\), and output dimension \(N\). The artifact’s default `NN_model(N)` similarly constructs a network over `N**2 + N` inputs, a 500-unit hidden layer, and `N` outputs. ([arXiv](https://arxiv.org/pdf/2003.06902))

### 6.2 Calibration data and HSPICE boundary

The paper describes generating training data by varying voltage and conductance values and running SPICE simulations to obtain nonideal output currents. The validated comparison is against HSPICE and a linear analytical model. The evaluated GENIEx model obtains substantially lower NF-RMSE than the analytical model in the reported setting. ([arXiv](https://arxiv.org/pdf/2003.06902))

For compiler/IR purposes, this means the calibration source is outside the compiler pipeline: the backend plugin depends on a pre-trained current-ratio model and consistent normalization/scaling. In the public artifact, the model path is configurable, but default paths are `None`, and pretrained GENIEx weights were not found in the checked files. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/config.py))

### 6.3 Layer lowering into MVM execution

The simulator implements convolution and linear layers as MVM-based PyTorch operations. For convolution, the paper describes iterative MVM over output-feature positions, tiling weight matrices into crossbar-sized chunks, and bit-slicing to account for limited cell/storage precision and DAC/input precision. ([arXiv](https://arxiv.org/pdf/2003.06902))

The artifact confirms this lowering pattern: custom `Conv2d_mvm` and `Linear_mvm` classes replace standard layers; weights are split into positive and negative components; weights are flattened and bit-sliced; tensors are unfolded and reshaped into crossbar-oriented layouts. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/pytorch_mvm_class_v3.py))

### 6.4 Nonideality injection and reconstruction

The simulator can execute ideal or nonideal MVM. In the nonideal path, it constructs voltage/conductance features for the crossbar model, predicts the nonideal ratio, rescales analog outputs, quantizes them through ADC logic, and then performs shift-add and reductions across slices, streams, tile rows, and crossbar rows. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/mvm_v3.py))

This is the most compiler-relevant mechanism: nonideality is injected at a backend MVM boundary rather than spread across the full DNN graph. A future compiler could treat this as a calibrated backend transfer function attached to a crossbar-MVM op.

### 6.5 Hardware and numeric assumptions

The paper’s simulator parameters include crossbar size, input/weight bit widths, accumulator width, ADC bits, stream width, slice width, \(R_\text{on}\), \(R_\text{off}\), source resistance, sink resistance, and wire resistance. The reported experiments use fixed-point networks, 14-bit ADC, 32-bit accumulator with 24 fractional bits, and 16-bit input/weight representations with 13 fractional bits unless varied. ([arXiv](https://arxiv.org/pdf/2003.06902))

The design-space experiments show that accuracy depends on crossbar size, \(R_\text{on}\), ON/OFF ratio, source/sink resistance, fixed-point precision, and bit-slicing/streaming choices. These results are useful for IR design because they show that numeric-format fields and hardware-binding fields are not incidental metadata; they affect the functional behavior of the backend. ([arXiv](https://arxiv.org/pdf/2003.06902))

### 6.6 Simulator boundary

The paper explicitly states that the simulator extracts the analog-computing aspect of accelerators and ignores memory and communication. This is an important scope boundary: GENIEx’s simulator can inform accuracy-aware mapping and backend modeling, but it is not an end-to-end timing, energy, memory, communication, or instruction-scheduling framework in the demonstrated form. ([arXiv](https://arxiv.org/pdf/2003.06902))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Current-ratio prediction is a clean backend contract

- **Observation:** GENIEx models the backend as a current-ratio transfer function from \((V,G)\) to corrected output current, rather than trying to expose every circuit node to the DNN simulator. ([arXiv](https://arxiv.org/pdf/2003.06902))  
- **Why it matters for CIM compiler/IR work:** This suggests a compact contract for analog-CIM backend plugins: an IR op could carry voltage/conductance distributions and receive calibrated nonideal current behavior.  
- **Reusable lesson:** Future stacks can separate mapping legality from analog fidelity by treating learned crossbar transfer functions as replaceable backend attributes.

### Insight 2 — Tensor layout functions as a de facto CIM IR

- **Observation:** The simulator’s meaningful intermediate state is not a named IR file; it is a set of tensor dimensions: slices, tile rows, tile columns, crossbar rows, crossbar columns, streams, and batch. ([arXiv](https://arxiv.org/pdf/2003.06902))  
- **Why it matters for CIM compiler/IR work:** These dimensions encode binding, precision, and reconstruction semantics that a compiler would otherwise need to type and verify.  
- **Reusable lesson:** A future IR could promote these dimensions into explicit fields on an `mvm.tile` or `cim.crossbar_mvm` operation.

### Insight 3 — Numeric format is part of the hardware mapping

- **Observation:** Bit stream width, bit slice width, ADC precision, accumulator width, and fractional-bit choices directly affect nonideality exposure and model accuracy. ([arXiv](https://arxiv.org/pdf/2003.06902))  
- **Why it matters for CIM compiler/IR work:** Numeric-format propagation is not just quantization metadata; it determines the number of analog MVM events, reconstruction semantics, and error accumulation path.  
- **Reusable lesson:** CIM IRs should represent bit significance, stream position, slice position, ADC stage, and accumulator precision as type-like or schedule-like information.

### Insight 4 — Calibration provenance is a first-order integration issue

- **Observation:** The paper explains HSPICE-backed calibration, but the checked public artifact exposes simulator code more clearly than it exposes SPICE decks, generated calibration datasets, or pretrained GENIEx model weights. ([arXiv](https://arxiv.org/pdf/2003.06902))  
- **Why it matters for CIM compiler/IR work:** A learned backend model is reusable only when the calibration source, parameter regime, normalization, and model checkpoint are traceable.  
- **Reusable lesson:** Future corpus entries should record calibration provenance as part of backend metadata, alongside device/circuit parameters.

### Insight 5 — The simulator boundary is useful even without a formal compiler pass

- **Observation:** The custom `Conv2d_mvm` and `Linear_mvm` classes expose a practical adaptation point for replacing DNN layers with CIM-aware functional equivalents. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/pytorch_mvm_class_v3.py))  
- **Why it matters for CIM compiler/IR work:** A compiler could target these layer wrappers as a backend, even though the paper itself does not define a compiler IR.  
- **Reusable lesson:** A small adapter from graph IR nodes to GENIEx-compatible layer calls could reuse the simulator as an accuracy backend for mapping experiments.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `Aayush-Ankit/puma-functional-model`. The repository is public, author-associated, and includes a `geniex` folder, `src` simulator code, `models`, `test` scripts, and a README naming the PUMA functional simulator authors, including GENIEx paper authors. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model))  
- **License:** Unknown / not found in the checked sources. The checked repository listing and README view did not show an explicit license or release package. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model))  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** PyTorch-based functional simulator code; custom `Conv2d_mvm` and `Linear_mvm` layers; model definitions for ResNet/VGG variants; CIFAR/ImageNet-style test scripts; config parameters for precision, tiling, ADC, accumulator, crossbar dimensions, and GENIEx model options; dataset helper files under `geniex/`. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model))  
- **What the artifact appears to omit:** In the checked sources, I did not find an explicit license, release, HSPICE decks, pretrained GENIEx surrogate checkpoints, pretrained DNN checkpoints bundled with the repo, or a script that reproduces the paper figures from scratch. The README expects user-provided pretrained model paths. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model))  
- **Minimal documented workflow:** The README lists Python 3.7.3 and PyTorch 1.5.1, shows how to replace PyTorch `Conv2d` / `Linear` layers with `Conv2d_mvm` / `Linear_mvm`, and gives sample commands under `test/`, including CIFAR-100 and ImageNet-style evaluation with ideal/nonideal mode flags and pretrained-model paths. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model))  
- **Paper figures reproducible from artifact:** Partial / uncertain. The simulator structure needed for layer-level experiments is present, but paper-exact reproduction appears to depend on external datasets, checkpoints, GENIEx model weights, and SPICE-generated calibration data not found in the checked artifact.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | PyTorch model scripts and README examples are provided; benchmark datasets/checkpoints are user-supplied. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model)) |
| Intermediate representation serialized | Unknown | No standalone IR/schema found; middle state is embedded in PyTorch modules, configs, and tensor layouts. |
| Mapping decisions inspectable | Partial | Tiling, bit slicing, positive/negative paths, and tensor reshapes are visible in code. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/pytorch_mvm_class_v3.py)) |
| Schedule inspectable | Partial | Execution order is visible in Python/PyTorch code, but no serialized schedule or trace was found. |
| Hardware config explicit | Partial | Crossbar dimensions, conductance values, ADC bits, accumulator width, and related parameters are explicit; some scaling constants and model paths remain embedded or unset by default. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/config.py)) |
| Precision / bit-slice assumptions explicit | Yes | Paper and artifact both expose weight/input bits, fractional bits, bit streams, bit slices, ADC bits, and accumulator bits. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Cost model inspectable | Partial | Accuracy/nonideality model is inspectable; energy, area, memory timing, and communication timing are outside the demonstrated simulator. ([arXiv](https://arxiv.org/pdf/2003.06902)) |
| Simulator backend documented | Partial | README, config, and source code are available; API-level documentation is limited. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model)) |
| Generated code / instruction stream inspectable | N/A | The checked sources expose functional simulation, not code generation or ISA emission. |
| Provenance from source op to backend action | Partial | Custom PyTorch modules show the path from layer call to MVM kernel; no source-op-to-crossbar trace format was found. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/blob/master/src/pytorch_mvm_class_v3.py)) |
| Reproduction scripts available | Partial | Test scripts are present; paper-exact assets and figure-generation workflow were not found. ([GitHub](https://github.com/Aayush-Ankit/puma-functional-model/tree/master/test)) |
| Calibration source documented | Partial | The paper documents HSPICE-based data generation; checked artifact sources do not appear to include the full SPICE calibration package or trained surrogate checkpoints. ([arXiv](https://arxiv.org/pdf/2003.06902)) |

### 8.3 Integration helper

- **As frontend:** Reuse is limited but practical. The artifact expects PyTorch models and provides MVM-specific module replacements, so a graph compiler could emit PyTorch modules or wrap existing PyTorch layers with `Conv2d_mvm` and `Linear_mvm`.

- **As IR inspiration:** The most useful abstractions are bit-slice dimension, bit-stream dimension, tile row/column, crossbar row/column, ADC precision, accumulator precision, conductance range, and nonideality-model binding. These could become explicit fields in a future CIM IR op.

- **As mapper/scheduler:** The tiling and bit-slicing logic could be adapted as a baseline lowering rule for static convolution and linear layers. It is not presented as a general search framework, so reuse would benefit from extracting the tensor-shaping rules into a separate mapper interface.

- **As cost model:** GENIEx is best treated as an accuracy/nonideality cost plugin. It estimates functional deviation from ideal MVM behavior, not latency, energy, area, or communication.

- **As backend:** The PyTorch simulator can be wrapped as a backend for accuracy evaluation. Integration would be most direct through the custom MVM layer classes and the `mvm_tensor_nonid` path.

- **As benchmark:** The paper’s demonstrated benchmarks are ResNet-20 on CIFAR-100 and ResNet-18 on an ImageNet subset, with sensitivity sweeps over crossbar and numeric parameters. ([arXiv](https://arxiv.org/pdf/2003.06902))

- **As validation source:** The validation source is HSPICE simulation. Hardware measurements, RTL, chip-in-loop, or real-system results were not found in the checked sources.

**Integration effort estimate: Medium.**  
Integration as an accuracy backend is relatively direct because the artifact already exposes PyTorch modules and configuration parameters. Integration into a compiler/IR stack would benefit from a small adapter that extracts operator shapes, tile assignments, bit-slice metadata, and GENIEx model bindings into a typed intermediate object. Paper-exact reproduction would require additional assets or reconstruction of the HSPICE datasets and model checkpoints.

## 9. Relation to a value-trajectory CIM IR project

GENIEx provides useful ingredients for a value-trajectory IR, especially the explicit decomposition of DNN layers into bit-sliced, bit-streamed crossbar MVM events and the learned mapping from voltage/conductance state to nonideal current behavior. The closest approximation to trajectory semantics is the simulator path: input tensor → voltage stream → crossbar conductance slice → analog output current → ADC quantized value → shift-add reconstruction → digital layer output. ([arXiv](https://arxiv.org/pdf/2003.06902))

The paper names several path stages, but it does not preserve value identity as a first-class object across analog partial sums, sensing, reconstruction, inter-tile reduction, storage, and later operators. Bit significance, stream width, slice width, ADC bits, accumulator bits, and tile placement are represented as parameters and tensor dimensions rather than type-like annotations attached to values. ([arXiv](https://arxiv.org/pdf/2003.06902))

A trajectory-level extension would likely attach metadata such as bit significance, slice index, stream index, crossbar coordinate, voltage range, conductance range, analog/digital domain, ADC stage, accumulator format, and reconstruction rule to each partial value. That extension would make it easier to express rewrites such as fusing reconstruction with downstream reduction, delaying ADC conversion, carrying bit-sliced partial sums across operator boundaries, changing reduction-tree structure, routing values through alternative peripheral paths, or co-optimizing data movement and numeric reconstruction.

In corpus terms, GENIEx is valuable as a **backend-calibration and numeric-trajectory ingredient** rather than as a full trajectory IR. It shows exactly why trajectory metadata matters: changing bit slicing, stream width, crossbar size, or conductance range changes observed accuracy, so a future IR should make those fields visible to analysis and transformation passes. ([arXiv](https://arxiv.org/pdf/2003.06902))

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **CrossSim** | Analog in-memory-computing accuracy simulation for MVM-like workloads | CrossSim is a broader analog IMC simulator with a Python/Numpy-like interface; GENIEx’s distinctive contribution is the learned SPICE-calibrated current-ratio surrogate embedded in a PyTorch DNN MVM simulator. ([GitHub](https://github.com/sandialabs/cross-sim?utm_source=chatgpt.com)) | Separate “accuracy simulator” papers by the object they make reusable: analog core API, device model, learned transfer model, or DNN layer wrapper. |
| **NeuroSim / DNN+NeuroSim** | Crossbar-oriented modeling of hardware behavior | NeuroSim focuses on circuit-level macro estimation of area, latency, dynamic energy, and leakage; GENIEx focuses on data-dependent nonideality and classification accuracy. ([Arizona State University](https://asu.elsevierpure.com/en/publications/neurosim-a-circuit-level-macro-model-for-benchmarking-neuro-inspi/?utm_source=chatgpt.com)) | Keep cost-model axes separate: energy/latency/area models and accuracy/nonideality models may be complementary backend plugins. |
| **CxDNN** | Resistive-crossbar nonideality and DNN inference robustness | CxDNN targets hardware/software compensation for errors due to crossbar nonidealities; GENIEx provides a learned nonideality modeling and evaluation path. ([ACM Digital Library](https://dl.acm.org/doi/fullHtml/10.1145/3362035?utm_source=chatgpt.com)) | Distinguish mitigation stacks from modeling stacks: one changes the network or mapping to compensate, the other supplies calibrated backend behavior. |
| **MemTorch** | PyTorch-integrated memristive deep-learning simulation | MemTorch is an open-source PyTorch framework for memristive device and crossbar simulation; GENIEx is narrower around SPICE-trained nonlinear MVM current-ratio prediction and tiled/bit-sliced ResNet accuracy experiments. ([GitHub](https://github.com/coreylammie/MemTorch?utm_source=chatgpt.com)) | PyTorch-layer artifacts are important even when no formal compiler IR exists; they often expose the true backend contract. |
| **PUMA** | Programmable memristor-crossbar accelerator stack | PUMA includes a specialized ISA, compiler, graph partitioning, scheduling, register allocation, and architecture simulation; GENIEx’s public artifact is housed in a PUMA functional-model repository but the GENIEx paper’s evidenced contribution is the nonideality simulator layer. ([arXiv](https://arxiv.org/abs/1901.10351?utm_source=chatgpt.com)) | Use PUMA as a contrast point for A4 compiler/ISA stacks; GENIEx can be cataloged as a backend accuracy model that such stacks could call. |
| **X-Changr / AMS-style analog simulation** | Analog crossbar modeling and simulation methodology | These are closer to modeling/simulation than compiler IR. GENIEx’s paper emphasizes data-dependent nonlinearities and large-DNN PyTorch integration relative to prior simulation tools listed in its comparison table. ([arXiv](https://arxiv.org/pdf/2003.06902)) | Related-work tables can overstate stack similarity; classify by reusable object: simulator, cost model, compensation method, compiler, or ISA. |

## 11. Corpus-ready final takeaway

- GENIEx’s real reusable contribution is a **learned SPICE-calibrated nonideality model** for analog memristive-crossbar MVM, not a standalone compiler IR.

- The strongest stack layer is **backend accuracy modeling**: voltage/conductance/current behavior is approximated by a neural surrogate and injected into PyTorch MVM simulation.

- The demonstrated end-to-end path is **PyTorch Conv/Linear layer replacement → MVM tiling and bit slicing → GENIEx nonideality injection → classification accuracy**.

- First-class objects include **crossbar dimensions, conductance matrix, input-voltage vector, bit streams, bit slices, ADC bits, accumulator width, and shift-add reconstruction**.

- The hidden IR is distributed across **config fields, custom PyTorch layer classes, tensor layouts, and nonideality-kernel code**.

- Artifact status is **public artifact found**, but license, release package, SPICE decks, pretrained GENIEx checkpoints, and paper-exact reproduction workflow were not found in the checked sources.

- Integration is most direct as a **backend simulator plugin** or **accuracy-cost model** for a future CIM compiler stack.

- For a value-trajectory IR project, GENIEx is useful because it shows how bit significance, analog domain transition, ADC precision, and reconstruction affect functional accuracy, while trajectory-level rewrites would require additional first-class metadata for value identity and path state.

## 12. Suggested metadata entry

```yaml
paper: "GENIEx"
year: 2020
venue: "DAC 2020 / arXiv 2020"
authors_or_group: "Indranil Chakraborty, Mustafa Fayez Ali, Dong Eun Kim, Aayush Ankit, Kaushik Roy"
technology:
  - analog-CIM
  - RRAM-CIM
  - memristive-crossbar
workloads:
  - ResNet-20 on CIFAR-100
  - ResNet-18 on ImageNet subset
axis_A:
  primary: "A2 Simulator & cost model"
  secondary:
    - "A5 Narrow end-to-end co-design"
axis_B:
  - "B6 Accuracy / nonideality modeling"
  - "B1 Config-as-IR"
  - "B2 Graph-as-IR, limited PyTorch module graph"
  - "B4 Hardware-resource IR, partial"
axis_C_first_class_objects:
  - crossbar_size
  - conductance_matrix
  - input_voltage_vector
  - nonideal_current_ratio
  - bit_slice
  - bit_stream
  - ADC_precision
  - accumulator_width
  - shift_add_reconstruction
  - positive_negative_weight_paths
axis_D_rewrite_objects:
  - operator_graph_to_MVM_layer
  - tensor_tiling
  - array_binding
  - numeric_format
  - accuracy_model_injection
artifact:
  status: "public artifact found"
  url: "Aayush-Ankit/puma-functional-model"
  license: "Unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - IR inspiration
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: low
trajectory_IR_relevance: medium
notes:
  - "Best used as a calibrated analog-CIM MVM nonideality backend."
  - "Functional simulator path is PyTorch layer replacement rather than explicit compiler IR."
  - "Paper explicitly scopes simulator to analog compute and ignores memory and communication effects."
  - "Paper-exact reproduction appears to require external checkpoints and SPICE calibration assets."
```