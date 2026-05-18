# CIMA_COM / CIMA_COMP — scoped CIM stack note

**Scope note.** I found a public **CIMA_COMP** repository and a closely related full-stack memristor-CIM paper from the same Tsinghua-LEMON ecosystem. I did **not** find a public paper record titled exactly **CIMA_COM** or **CIMA_COMP** in the checked sources. The note below therefore treats the repository as the strongest paper-specific artifact evidence, and uses the related Nature Communications full-stack CIM paper only where its compiler/IR claims align with the artifact vocabulary.

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 Narrow end-to-end co-design**, with strong **A3 Mapping / scheduling / DSE** and partial **A4 Explicit IR / backend compiler stack** | The public artifact implements an ONNX-to-IR-to-mapped-IR-to-SystemC/UVM/chip-JSON/weight/LUT flow for a YOLOv5m-style demo. The strongest reusable layer is the CIMA mapper/backend boundary rather than a general-purpose compiler framework. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR**, **B1 Config-as-IR**, **B4 Hardware-resource IR**, partial **B5 backend meta-op/config**, partial **B6 precision / calculation-parameter modeling** | The repository exposes an `irtool` graph representation, YAML/JSON serialization, CIMA mapping metadata, hardware topology parameters, SystemC/UVM/chip JSON outputs, and CIMA calculation fields such as ADC quantization level, scale, offset, and accumulation shifts. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| First-class CIM objects, Axis C | IR graph nodes, CIMA device topology, CIMA mapping info, core/PE/XB allocation, PE direction, DMEM allocation, ADC range / quantization level, scale/offset/shift fields, activation LUT, weight layout JSON | These are named, serialized, or generated directly. Crossbar/array-level details appear through hardware configs, array shapes, PE dimensions, mapped addresses, and backend JSON structures. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| Rewrite object, Axis D | Operator graph, hardware mapping, array binding, memory layout, backend task/config, numeric scaling parameters | The mapper performs operator replacement/fusion, adaptive splitting, placement, DMEM optimization, calculation-parameter attachment, and backend lowering into SystemC/UVM/chip/weight/LUT artifacts. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/mapper.py)) |
| Best corpus tags | `compiler-mapping`, `graph-ir`, `config-as-ir`, `CIMA-specific-backend`, `analog-CIM`, `RRAM-CIM`, `DNN-inference`, `YOLOv5m`, `SystemC-UVM`, `chip-json-codegen` | Tags reflect the evidenced artifact boundary and the related full-stack CIM paper’s memristor-CIM framing. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| Closest comparison baselines | TC-CIM, OCC, PIMCOMP, OpenCIMTC, AIHWKIT | These are close because they address tensor/CIM compilation, CIM mapping, full-stack CIM tooling, or analog hardware-aware modeling. The related Nature paper explicitly cites TC-CIM, OCC, PIMCOMP, and AIHWKIT; OpenCIMTC is the adjacent public full-stack toolchain artifact. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |

## 2. One-paragraph public summary

CIMA_COM / CIMA_COMP is best read as a CIMA-specific compiler and backend artifact that makes a practical CIM deployment pipeline concrete: it imports an ONNX-style DNN workload, converts it into a YAML/JSON-serializable graph IR, maps the graph onto a fixed CIMA hardware topology, attaches CIMA mapping and calculation metadata, and emits SystemC/UVM/chip-side JSON, weight, and activation-LUT artifacts for a YOLOv5m-style demonstration. Its strongest contribution to CIM compiler/IR research is the exposed boundary between graph-level model representation, CIM placement/splitting state, and backend code-generation contracts. The demonstrated scope is architecture-specific and artifact-centered: reuse is clearest for researchers interested in how a CIMA mapper/backend serializes graph, placement, precision, memory, and chip-configuration state across a narrow end-to-end stack. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| A full-stack CIM software-hardware framework can compile models to hardware-runnable code and support automatic placement / optimization. | Related Nature paper abstract, Fig. 1 discussion, results text | Paper-only plus related public artifact | The paper describes a CIM compiler, optimizer, chip simulator, automatic model placement, and hardware-parameter tuning; the CIMA_COMP artifact exposes a compiler-style flow from model import to mapped IR and backend outputs. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | Paper-level evidence supports the full-stack framing; CIMA_COMP artifact-level evidence is clearest for the YOLOv5m-style compiler/backend path. |
| The stack uses an intermediate representation with algorithm, mapping, and calculation parameters. | Related Nature paper Fig. 2b description | Paper-only plus artifact code | The paper describes a CIM IR with parameter categories; the artifact serializes IR and later attaches `CIMA_mapping_info` and `CIMA_calc_info` fields such as ADC quantization, scale, offset, and shift parameters. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | The reusable boundary is clearest at the serialized YAML IR plus CIMA-specific metadata; generality beyond the CIMA backend is not evidenced by the checked artifact. |
| The compiler can import framework/ONNX models into a unified IR. | CIMA_COMP README and YOLOv5m mapper script | Documentation; code/artifact | `Model2IR` is described as a frontend converter, and the YOLOv5m flow invokes `ConvertONNX` before dumping an ONNX-derived YAML IR. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) | Demonstrated through the YOLOv5m-oriented test flow and expected model directory layout. |
| The mapper maps IR to CIMA hardware topology with core/PE/XB allocation and communication. | CIMA_COMP README, mapper code, search code | Documentation; code/artifact | The repository describes `mapper` as mapping IR to CIMA topology; code exposes node info, hardware config, XB counts/shapes, ADC/DAC fields, placement strategy, split factors, and CIMA-only backend checks. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) | The demonstrated mapper is tied to the CIMA/A280-oriented backend and fixed CIMA device naming/topology conventions. |
| The backend generates SystemC/UVM/chip-side artifacts. | CIMA_COMP README, CLI, UVM/chip scripts | Documentation; code/artifact | The artifact documents and implements generation of `{model}_systemc.json`, UVM schedule/raw-data files, `{model}_chip.json`, graph PDFs, weight JSON, and activation LUT JSON. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) | Shown through artifact examples for `yolov5m_wo_head`; reproducibility depends on required model and training-derived parameter files. |
| Weight and activation artifacts can be extracted for chip deployment. | README, `main_weight_extract.py`, `gen_act_lut.py` | Documentation; code/artifact | Weight extraction consumes system config, mapped IR, and integer weights to emit chip weight JSON; activation LUT extraction reads system config and LUT tensors to emit activation LUT JSON. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) | The reusable boundary is clearest at backend JSON plus IR metadata; required training/platform files are external to the repo workflow. |
| The full system is evaluated on multiple neural networks and tasks. | Related Nature paper results and conclusion | Experiment; paper-only | The related paper reports six neural-network models across image classification, text classification, segmentation, and object detection, with simulator-backed large-scale ResNet-50 evaluation. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) | This is paper-level evidence for the related full-stack system; the checked CIMA_COMP public artifact primarily documents the YOLOv5m demo path. |

## 4. Stack anatomy

```text
Input / frontend:
  ONNX-style model file plus training-derived parameter files. In the demo flow,
  the expected inputs include model/{model_name}.onnx, hard_params_dict_cpu.pth,
  and weight_int_dict_cpu.pth. The frontend object is a DNN operator graph imported
  through Model2IR / ConvertONNX and serialized as YAML. Inspectable: yes, after dump.
  Reusable: partial, because the YOLOv5m demo assumes external parameter files.

Middle representation:
  Unified graph IR managed by irtool and serialized as YAML/JSON-like objects.
  The key inspectable files include *_onnx_ir.yaml, *_mapped_ir.yaml,
  *_dmem_opt_mapped_ir.yaml, and *_dmem_opt_mapped_ir_w_params.yaml.
  It is graph-as-IR plus config-as-IR. Inspectable: yes. Documented: partial.

Mapping or scheduling state:
  Mapping state includes node_info, node_weight, hardware_config, split factors,
  placement strategy, masked device IDs, CIMA_mapping_info, CIMA_calc_info,
  DMEM allocation, and backend schedule/config structures. It is partly serialized
  in the mapped IR and partly embedded in mapper/search/backend code. Inspectable:
  partial-to-yes, depending on the stage.

Hardware abstraction:
  A CIMA device hierarchy with core/PE/XB-style allocation, array dimensions,
  ADC/DAC fields, PE direction conventions, DMEM, and task-level backend structures.
  The demo sets a fixed CIMA device with 36 nodes arranged as 4 x 9 and task_num 128;
  backend weight extraction uses PE dimensions such as 576 x 128. Inspectable: yes
  in code and generated JSON. Reusable: strongest for CIMA-like backends.

Backend / simulator / codegen:
  Code generation emits SystemC JSON, UVM schedule/raw-data files, chip JSON,
  chip weight JSON, activation LUT JSON, and graph PDF. The code imports runtime,
  simulator, DMEM optimizer, and codegen modules, but the public demo workflow is
  centered on artifact generation rather than a fully documented simulator campaign.

Output artifact:
  YAML IR files, SystemC/UVM JSON/text, chip JSON, weight JSON, activation LUT JSON,
  graph PDF, and log files. These are inspectable and useful as backend contracts.

Evaluation loop:
  The related paper describes compiler + optimizer + chip simulator + hardware
  evaluation loops. The CIMA_COMP artifact exposes a CLI sequence:
  mapper → UVM/SystemC → chip JSON → weight extraction → activation LUT extraction.
```

The README documents the submodules and expected output stages, while the CLI implements the end-to-end command order. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of serialized graph YAML, `CIMA_mapping_info`, `CIMA_calc_info`, hardware config dictionaries, training-derived `.pth` parameter files, DMEM allocation state, and backend JSON templates. The paper-level framing foregrounds a CIM IR, while the reusable semantics are most visible in the artifact’s YAML/JSON files and in the mapper/backend code paths that interpret CIMA-specific names, shapes, directions, ADC ranges, and scale/shift fields. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 Narrow end-to-end co-design.**  
The artifact owns a narrow but concrete path from model import to chip-side artifacts. The input slice is an ONNX-style neural-network model plus external training/quantization files; the output slice is a set of mapped IR, SystemC/UVM/chip JSON, weight JSON, and activation LUT artifacts. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The most reusable internal layer is the mapper: it consumes graph/node information and hardware configuration, performs CIMA-specific split/placement decisions, and records mapping information for backend lowering. The search code exposes hardware fields such as XB number, XB shape, ADC/DAC counts, DAC precision, placement strategy, split factors, and CIMA data width. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

**Secondary: A4 Explicit IR / dialect / ISA compiler stack, limited to a CIMA-specific form.**  
The artifact serializes IR files and backend configuration outputs, but the representation is not presented as a general dialect with independently specified legality, verification, or extensibility rules. It is best classified as an explicit graph/config IR boundary inside a CIMA-specific compiler stack. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is the unified IR graph managed by `irtool`. It carries model operators, graph references, inserted/fused operators, and later CIMA mapping/calculation metadata. Decisions made here include operator replacement, fusion, graph splitting, identity/transition insertion, and mapped-IR serialization. The single artifact upstream passes could read is the dumped YAML IR, though full semantics require the mapper/backend code that interprets CIMA fields. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

**B1 Config-as-IR.**  
Hardware config dictionaries, CIMA device dictionaries, generated SystemC/chip JSON, and weight/LUT JSON behave as configuration IR. Decisions made there include device topology, task layout, buffer indices, PE direction, ADC ranges, scale/offset/shift, and backend register/config data. Some assumptions remain embedded in scripts and constants, especially the YOLOv5m demo setup and hard-parameter extraction. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py))

**B4 Hardware-resource IR.**  
The mapper and backend expose resource-level objects: device IDs, core/PE/XB allocation, PE dimensions, row/column split factors, and memory allocation. This layer is directly useful for backend integration because mapping decisions are carried into generated artifacts. Broader portability would benefit from a documented hardware-schema boundary independent of CIMA naming. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

**B5 Instruction / meta-op / backend config.**  
The generated SystemC/UVM/chip JSON and UVM schedule/raw-data files are backend meta-op/config artifacts rather than a published ISA. They are still valuable as a concrete lowering target because they expose task structure, routing, PE direction, buffer indices, and weight/LUT payloads. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_uvm.py))

**B6 Accuracy / nonideality modeling, partial.**  
The related Nature paper emphasizes analog noise, hardware-parameter tuning, and simulator/chip evaluation. In CIMA_COMP, calculation fields such as ADC quantization level, scale, offset, activation LUT, and accumulation shifts are explicit, while calibration and training-derived parameter sources remain external to the artifact workflow. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class / parameterized** | Hardware configs include CIMA device hierarchy, XB counts/shapes, and backend array/PE dimensions; related paper describes memristor arrays, input decoder, output buffer, and ADC as computing-unit components. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| Bit-slicing / bit significance | **Parameter / partially implicit** | Artifact exposes CIMA data width choices and 4/8-bit handling; related paper states two cells represent one signed 4-bit weight. A general bit-slice type system is not separately specified in the checked sources. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| ADC/DAC precision or sensing | **Parameter / calculation metadata** | Search hardware config includes `adc_num`, `dac_num`, and `dac_precision`; demo code attaches `ADC_quant_level` and derives ADC range from hard-scale parameters. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| Analog-to-digital or domain transition | **Implicit / partially parameterized** | ADC fields and quantization levels are represented, but domain-transition semantics are carried through CIMA calculation/backend conventions rather than a standalone IR object. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py)) |
| Peripheral circuits as path nodes | **Parameter / backend-configured** | Related paper names input decoder, output buffer, and ADC; artifact backend structures include PE direction, buffer index, and task/config fields, but peripheral paths are not exposed as independently rewritable graph nodes. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| Partial-sum accumulation path | **Parameter / backend-configured** | CIMA calculation info includes `accumulate_shift_num`; weight extraction carries accumulation shift and buffer/task fields into chip weight JSON. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py)) |
| Reconstruction / shift-add tree | **Hard-coded / parameterized** | Scale, offset, scale-shift, accumulation shift, ADC range, and LUT parameters are serialized, but reconstruction is expressed through backend fields and generated artifacts rather than a separately typed reduction/reconstruction IR. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py)) |
| Runtime state, masks, KV cache, batching, sparsity | **Partial / mostly not applicable** | Masked device IDs and runtime/simulation modules appear in the mapper flow; KV cache and LLM-style batching are outside the demonstrated CNN inference scope. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/mapper.py)) |
| Value trajectory / flow path | **Approximated / implicit** | Routing and destination information appears in backend config and activation-LUT extraction, but value identity across analog partial sums, sensing, accumulation, reconstruction, and storage is not represented as a single first-class trajectory object. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/gen_act_lut.py)) |

### 5.4 Axis D — rewrite object

The compiler/tool actually rewrites several objects:

- **Operator graph:** ONNX-derived graph is converted, fused, split, and annotated.
- **Hardware mapping:** nodes are placed onto CIMA device resources.
- **Array binding and weight layout:** weights are transformed into array/backend JSON layouts.
- **Memory layout:** DMEM allocation and buffer indices are propagated.
- **Backend task/config:** SystemC/UVM/chip JSON artifacts encode lowered execution/configuration state.
- **Numeric format / calculation metadata:** ADC quantization, scale, offset, scale-shift, accumulation-shift, and activation LUTs are attached or emitted.

Legal transformations include operator replacement, ReLU/pool/split/SiLU/conv-mul-add fusion, adaptive splitting, split-node insertion, concat/add reconstruction, DMEM optimization, and backend lowering. The equivalences exploited are graph-level functional equivalences—especially splitting and recombining tensor operators—and backend-preserving layout equivalences that bind slices to CIMA PE/XB resources. Across lowering, the framework must preserve operator identity, tensor shapes, channel/kernel splits, references, weights, BN/quantization parameters, placement addresses, buffer state, and CIMA calculation metadata. The representation is especially well suited to static CNN-style graph mapping and chip-config generation; expressing retimed ADC conversion, cross-operator bit-sliced partial sums, or alternative peripheral routing would likely require an additional abstraction for value trajectory and domain-transition state.

## 6. Technical mechanism reading

### 6.1 Frontend and graph IR serialization

The artifact’s frontend path is built around `Model2IR` and `irtool`: the README describes model parsing/conversion from frameworks or ONNX into a unified IR, and the YOLOv5m mapper script converts an ONNX file and dumps YAML IR stages. The practical IR contract is therefore not a formal dialect specification, but a set of serialized graph files consumed by mapper, optimizer, and backend passes. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

### 6.2 Mapper interface and search state

The mapper constructor exposes the stack’s real control surface: input IR, device description, CPU-layer choices, search method, weight format, copy/split parameters, placement strategy, data width, calculation info, fusion flags, adaptive split flags, operator replacement, runtime mode, target device, and layer data-type dictionary. The code path is explicitly CIMA-oriented: the mapper constructs placement/search state and raises an error for non-CIMA targets in the checked implementation. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/mapper.py))

The base search interface uses `node_info`, `node_weight`, and `hardware_config`. Its node fields include operator type, kernel/stride, calculation count, input/output precision, shape, channels, and copy constraints; the hardware fields include CIMA hierarchy names, XB number, XB shape, ADC/DAC counts, and DAC precision. This is the clearest mapper-level schema for a future reusable CIM mapping interface. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

### 6.3 Adaptive splitting as graph rewrite plus resource binding

Adaptive splitting is not only a placement heuristic. The search code can insert split nodes, clone or split layers, create concat/add/fused-add structures, adjust weights and BN parameters, replace references, insert identity or transition operators, recompute parser state, and then place nodes against XB budgets. For a compiler/IR reader, this is important: mapping legality is partly achieved by rewriting the graph into a form the fixed CIMA backend can place. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

### 6.4 Hardware abstraction and fixed demo topology

The YOLOv5m demo constructs a CIMA device with name `cima-0`, kind `cima-node`, 36 elements, height 4, width 9, and task number 128. It also uses masked device IDs and CIMA-specific DMAC layers. Backend weight extraction uses PE dimensions such as 576 × 128 and maps tasks to PE directions. The related Nature paper describes the underlying memristor CIM compute unit with arrays, input decoder, output buffer, and ADC; it also states that each array has 1152 × 128 1T1R cells and that two cells represent one signed 4-bit weight. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py))

### 6.5 Precision, quantization, and calculation parameters

The calculation path is artifact-specific and concrete. The demo loads `hard_params_dict_cpu.pth` and `weight_int_dict_cpu.pth`, computes activation LUT data, derives chip weight/ADC ranges from hard-coded current levels and scale constants, and attaches `CIMA_calc_info` fields including `ADC_quant_level`, `scale_shift_num`, `scale`, `offset`, `sharedBN`, and `accumulate_shift_num`. This is useful evidence for a compiler/IR taxonomy because numeric reconstruction and sensing assumptions are carried as backend metadata rather than only as simulator internals. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py))

### 6.6 Backend code-generation contract

The backend path has several named outputs. UVM/SystemC generation loads the final mapped IR with parameters and emits SystemC JSON, UVM schedule/raw-data files, and optionally a graph PDF. Chip generation consumes the SystemC JSON and emits chip JSON. Weight extraction consumes weights, SystemC JSON, and mapped IR to produce per-PE weight/config JSON. Activation LUT extraction consumes system config and activation LUT tensors to generate chip activation-LUT JSON. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_uvm.py))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — YAML and JSON files are the practical IR boundary

- **Observation:** The artifact’s clearest reusable interface is the chain of dumped YAML IR files and backend JSON outputs, not a standalone language specification.
- **Why it matters for CIM compiler/IR work:** It shows how CIM mapping state can be made auditable through serialized graph and config artifacts even when the compiler is architecture-specific.
- **Reusable lesson:** Future stacks could formalize this boundary by giving `CIMA_mapping_info`, `CIMA_calc_info`, hardware config, and backend task JSON a documented schema. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))

### Insight 2 — Mapping legality is achieved through graph transformation

- **Observation:** Adaptive splitting can rewrite the graph by inserting split/concat/add/identity/transition structures and adjusting weight or BN state before placement.
- **Why it matters for CIM compiler/IR work:** This makes mapping a semantic graph rewrite problem, not merely an assignment of existing operators to arrays.
- **Reusable lesson:** A portable CIM IR should treat split/reconstruct rewrites as first-class transformations with legality checks over tensor shape, channel partitions, and numeric reconstruction metadata. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

### Insight 3 — The backend contract exposes more CIM detail than the high-level graph

- **Observation:** Weight JSON, activation LUT JSON, PE direction, buffer index, ADC range, and scale/shift fields reveal the actual chip interface.
- **Why it matters for CIM compiler/IR work:** Many CIM semantics appear late in the lowering pipeline, where backend templates and config files decide how values are sensed, scaled, routed, and stored.
- **Reusable lesson:** A future stack could lift these backend fields into an earlier hardware-resource/value-trajectory IR so they can be verified and optimized before codegen. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_weight_extract.py))

### Insight 4 — Precision metadata behaves like an informal type system

- **Observation:** Input/output precision, CIMA data width, ADC quantization level, scale, offset, scale-shift, accumulation-shift, and LUT parameters are propagated through several stages.
- **Why it matters for CIM compiler/IR work:** These fields describe how numeric values change representation across mapping and backend lowering.
- **Reusable lesson:** Future CIM IRs could convert these fields into type-like annotations on tensors, partial sums, and backend resources. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py))

### Insight 5 — The artifact is strongest as a CIMA backend specimen

- **Observation:** The code paths, names, constants, and backend outputs are centered on CIMA/A280-style deployment.
- **Why it matters for CIM compiler/IR work:** This makes the artifact valuable as a real backend contract, even if reuse across other CIM architectures would require adapters.
- **Reusable lesson:** Corpus organization should classify it as a narrow end-to-end stack with a strong isolated mapper/backend layer, rather than as a broad compiler substrate. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/mapper.py))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL:** `https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP`
- **License:** Unknown / not found in the checked repository listing. The root listing exposed README, requirements, modules, tests, and setup files, but no visible license file; GitHub also showed no releases or packages. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** Python/C++ compiler components including `Model2IR`, `irtool`, `mapper`, `optimizer`, `backend`, `cimruntime`, and `test/Yolov5m`; CLI commands for mapper, UVM/SystemC, chip JSON, weight extraction, activation LUT extraction, and all-in-one flow. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))
- **What the artifact appears to omit:** The README states that `hard_params_dict_cpu.pth` and `weight_int_dict_cpu.pth` are usually provided by a training platform, so a complete reproduction depends on external files. A direct script-to-paper-figure reproduction path was not found in the checked CIMA_COMP sources. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))
- **Minimal documented workflow:** Install requirements, install the package in editable mode, prepare the YOLOv5m model and required `.pth` files, then run the CLI sequence such as `python cli.py all --model-name yolov5m_wo_head` from the demo directory. The CLI internally orders mapper, UVM/SystemC, chip, weight, and activation-LUT stages. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/))
- **Whether paper figures appear reproducible from the artifact:** Partial / unknown. The artifact can generate IR/backend artifacts and graph PDFs for the demo path, but I did not find a documented one-command reproduction of the related paper’s experimental figures in CIMA_COMP.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | ONNX-style model path and required `.pth` files are documented for YOLOv5m; full schema is not separately specified. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| Intermediate representation serialized | **Yes** | Multiple YAML IR stages are dumped. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| Mapping decisions inspectable | **Partial** | Mapped IR and mapping metadata are inspectable; full interpretation depends on mapper/backend code. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/mapper.py)) |
| Schedule inspectable | **Partial** | UVM schedule/raw-data outputs are generated, but schedule semantics are not presented as a standalone specification. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_uvm.py)) |
| Hardware config explicit | **Yes** | CIMA device dictionaries and hardware-config fields are explicit in code. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py)) |
| Precision / bit-slice assumptions explicit | **Partial** | Precision, data width, ADC quantization, and scale/shift fields are visible; bit-slice semantics are not formalized as a separate IR. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| Cost model inspectable | **Partial** | Search state and placement constraints are inspectable; a general published cost-model interface is not evident from the checked files. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/mapper/search/Base.py)) |
| Simulator backend documented | **Partial** | Runtime/simulation components are present and related paper discusses simulator use; the demo workflow mainly documents artifact generation. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP/blob/main/)) |
| Generated code / instruction stream inspectable | **Yes / config-level** | SystemC/UVM/chip JSON/text, weight JSON, and LUT JSON are generated. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_uvm.py)) |
| Provenance from source op to backend action | **Partial** | Graph names, mapping info, task config, and weight extraction preserve substantial provenance; a formal provenance table is not documented. |
| Reproduction scripts available | **Partial** | CLI exists for the YOLOv5m demo; external model/parameter files are required. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/cli.py)) |
| Calibration source documented | **Partial** | Hard parameters are loaded from training/platform files; their generation/calibration pipeline is outside the CIMA_COMP repo evidence. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py)) |

### 8.3 Integration helper

- **As frontend:** The ONNX-to-unified-IR path can inspire a workload importer, especially for static CNN inference graphs. Reuse would require documenting the IR schema and expected model/parameter file contracts.
- **As IR inspiration:** The most valuable abstractions are the staged YAML IR, `CIMA_mapping_info`, `CIMA_calc_info`, hardware config dictionaries, and backend JSON artifacts.
- **As mapper/scheduler:** The adaptive split, placement, masked-device handling, CIMA data-width handling, and DMEM allocation flow could be adapted as a CIMA-specific mapper plugin.
- **As cost model:** The artifact exposes resource fields and calculation metadata that could seed a backend cost/legality model, but a reusable cost-model API would need to be extracted from search and backend code.
- **As backend:** Integration would be most direct by wrapping the SystemC/UVM/chip JSON generation and weight/LUT extraction interfaces.
- **As benchmark:** The YOLOv5m-style flow is useful as a public compiler/backend benchmark if the required ONNX and `.pth` files are supplied.
- **As validation source:** The related full-stack paper reports chip/simulator-backed evaluation, while CIMA_COMP itself is more directly useful for compiler artifact validation than for independent hardware calibration. ([Nature](https://www.nature.com/articles/s41467-025-57183-0))

**Integration effort estimate:** **Medium to High.** Integration would be most direct through the serialized YAML/JSON artifacts and the mapper/backend Python APIs. Effort rises when targeting non-CIMA architectures, because CIMA-specific topology names, constants, external training artifacts, and backend conventions are embedded across mapper, parameter extraction, and codegen scripts.

## 9. Relation to a value-trajectory CIM IR project

The work provides useful ingredients for a value-trajectory IR, especially its explicit handoff from graph IR to CIMA mapping metadata, calculation metadata, backend task/config JSON, weight layout, and activation LUTs. The closest approximation to trajectory semantics is the combination of graph edges, `CIMA_mapping_info`, `CIMA_calc_info`, SystemC/chip JSON routing fields, PE direction, buffer indices, ADC range, scale/offset/shift fields, and LUT outputs. ([GitHub](https://raw.githubusercontent.com/Tsinghua-LEMON-Lab/CIMA_COMP/main/test/Yolov5m/main_mapper.py))

The demonstrated abstraction centers on static graph mapping and backend configuration. It names where operators and weights are placed and how backend numeric parameters are attached, but value identity is distributed across multiple artifacts rather than preserved as a single trajectory object through analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage. Bit significance, channel rate, precision stage, placement, and domain transition are present as parameters or conventions, not as one type-like trajectory annotation.

A trajectory-level extension would likely attach value-path records to IR edges and mapped fragments: source tensor slice, bit significance, CIM array/PE binding, analog accumulation scope, ADC stage, scale/shift/reconstruction stage, buffer location, routing destination, and downstream reduction use. That would make it easier to express rewrites such as fusing reconstruction with downstream reduction, delaying ADC conversion, carrying bit-sliced partial sums across operator boundaries, changing reduction trees, routing through alternative peripheral paths, and co-optimizing data movement with numeric reconstruction.

## 10. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **TC-CIM** | Tensor/CIM compilation and mapping | Closer to tensor-comprehension style compilation; CIMA_COMP is more artifact/backend-oriented with CIMA-specific graph/config lowering. | Separate tensor-schedule IR work from architecture-specific graph-to-chip compiler artifacts. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| **OCC** | End-to-end optimizing compiler for CIM | OCC is positioned as a general optimizing compiler baseline; CIMA_COMP’s reusable evidence is the concrete CIMA YAML/JSON mapper/backend pipeline. | Compare by rewrite object: general optimizing compiler versus CIMA-specific graph/config/backend rewrite. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| **PIMCOMP** | DNN mapping/scheduling for crossbar-based PIM | Both are mapping-centered; CIMA_COMP exposes a fuller chip-artifact path including SystemC/UVM/chip/weight/LUT outputs. | Useful distinction between mapping optimizer and deployment-artifact generator. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |
| **OpenCIMTC** | Full-stack memristor-CIM toolchain | OpenCIMTC is an adjacent public toolchain with compiler/optimizer/simulator/training modules; CIMA_COMP is a narrower CIMA compiler/backend repository. | Corpus should link related artifacts but keep their evidence boundaries separate. ([GitHub](https://github.com/Tsinghua-LEMON-Lab/OpenCIMTC?utm_source=chatgpt.com)) |
| **AIHWKIT** | Analog hardware-aware modeling and training | AIHWKIT is closer to analog nonideality/training simulation; CIMA_COMP is closer to compiler mapping and backend codegen. | Good contrast between B6 accuracy-model stacks and B1/B2/B4/B5 compiler-backend stacks. ([Nature](https://www.nature.com/articles/s41467-025-57183-0)) |

## 11. Corpus-ready final takeaway

- CIMA_COM / CIMA_COMP is best classified as a **narrow end-to-end CIMA compiler/backend stack** with a strong mapper/codegen layer.
- The strongest reusable stack slice is the path from **ONNX-derived graph IR → CIMA mapped YAML IR → SystemC/UVM/chip JSON → weight/LUT artifacts**.
- The evidenced public artifact scope is clearest for a **YOLOv5m-style static CNN inference demo** with external training-derived parameter files.
- First-class CIM objects include **CIMA device topology, mapping info, calculation info, ADC quantization/range fields, scale/shift metadata, PE directions, buffers, weight layouts, and activation LUTs**.
- The effective hidden IR is distributed across **serialized YAML, CIMA metadata fields, hardware config dictionaries, `.pth` parameter files, and backend JSON/code templates**.
- Artifact status is **public artifact found**, but license and complete paper-figure reproduction scripts were not found in the checked CIMA_COMP sources.
- Integration is most promising as a **CIMA mapper/backend specimen**, less as a general multi-architecture compiler substrate without adapters.
- For value-trajectory IR research, the artifact is useful because it exposes many trajectory ingredients, while a future extension would need to make value path, domain transition, and reconstruction state first-class.

## 12. Suggested metadata entry

```yaml
paper: "CIMA_COM / CIMA_COMP"
year: "unknown for exact CIMA_COM; related full-stack CIM paper found in 2025"
venue: "unknown for exact CIMA_COM; related paper: Nature Communications"
authors_or_group: "Tsinghua-LEMON-Lab; related paper includes Ruihua Yu, Ze Wang, Qi Liu, Bin Gao, Huaqiang Wu, et al."
technology:
  - RRAM-CIM
  - memristor-CIM
  - analog-CIM
  - CIMA-specific
workloads:
  - YOLOv5m-style object-detection demo
  - static CNN inference
  - "related paper: six neural-network models across image classification, text classification, segmentation, and object detection"
axis_A:
  primary: A5 narrow_end_to_end_co_design
  secondary:
    - A3 mapping_scheduling_DSE
    - A4 explicit_IR_backend_compiler_stack_partial
axis_B:
  - B1 config_as_IR
  - B2 graph_as_IR
  - B4 hardware_resource_IR
  - B5 backend_meta_op_config
  - B6 precision_calculation_modeling_partial
axis_C_first_class_objects:
  - unified_graph_IR
  - CIMA_mapping_info
  - CIMA_calc_info
  - CIMA_device_topology
  - core_PE_XB_allocation
  - DMEM_allocation
  - ADC_quant_level_and_ADC_range
  - scale_offset_shift_metadata
  - PE_direction_and_buffer_index
  - weight_JSON
  - activation_LUT_JSON
axis_D_rewrite_objects:
  - operator_graph
  - hardware_mapping
  - adaptive_split_and_reconstruction_graph
  - array_binding
  - memory_layout
  - numeric_scaling_metadata
  - backend_task_config
artifact:
  status: public_artifact_found
  url: "https://github.com/Tsinghua-LEMON-Lab/CIMA_COMP"
  license: "unknown / not found in checked repository listing"
  last_checked: "2026-05-15"
integration_roles:
  - frontend
  - IR_inspiration
  - mapper_scheduler
  - backend
  - benchmark
  - validation_partial
reproducibility_level: medium_low
trajectory_IR_relevance: medium
notes:
  - "Exact public paper record for CIMA_COM/CIMA_COMP was not found in checked sources."
  - "The strongest evidence is the public CIMA_COMP compiler/backend artifact."
  - "Required YOLOv5m demo inputs include external training-derived .pth files."
  - "The reusable boundary is clearest at YAML mapped IR plus SystemC/UVM/chip/weight/LUT JSON outputs."
```