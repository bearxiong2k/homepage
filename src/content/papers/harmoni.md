---
slug: harmoni
title: "HARMONI: Hierarchical ARchitecture MOdeling for LLMs with Near/In Memory Computing"
short_title: "HARMONI"
subtitle: "Scoped CIM stack note"
year: 2026
publication:
  venue: "ISPASS 2026"
  type: "conference"
  doi: 
  url: "https://github.com/UVA-LavaLab/HARMONI/blob/main/HARMONI_ISPASS2026.pdf"
authors:
  - "Khyati Kiyawat"
  - "Yasas Seneviratne"
  - "Zhenxing Fan"
  - "Morteza Baradaran"
  - "Kevin Skadron"
bibtex: |
  @inproceedings{kiyawat2026harmoni,
    author = {Kiyawat, Khyati and Seneviratne, Yasas and Fan, Zhenxing and Baradaran, Morteza and Skadron, Kevin},
    title = {HARMONI: Hierarchical ARchitecture MOdeling for LLMs with Near/In Memory Computing},
    booktitle = {IEEE International Symposium on Performance Analysis of Systems and Software, ISPASS 2026},
    year = {2026},
    url = {https://github.com/UVA-LavaLab/HARMONI/blob/main/HARMONI_ISPASS2026.pdf}
  }
citation_source: https://github.com/UVA-LavaLab/HARMONI/blob/main/HARMONI_ISPASS2026.pdf
summary: >-
  HARMONI is best read as a modeling, mapping, and simulation stack for LLM inference on hierarchical DRAM-PIM / near-memory systems. Its strongest reusable contribution is the combination of a Python-generated Transformer task graph, tensor placement metadata, hierarchical memory/logic-unit binding, and analytic latency/energy/resource modeling. The public artifact demonstrates the stack through configurable LLM model presets, DRAM hierarchy strings, batch/token settings, fusion flags, mapping options, network/GEMM trace generation, and ISPASS artifact-evaluation scripts. For CIM compiler/IR research, HARMONI is most useful as a simulator-backend and benchmark-harness reference: it shows how an LLM task graph can be enriched with placement, phase, communication, and hardware-binding information before being evaluated by a memory-system cost model. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))
links:
  paper: https://github.com/UVA-LavaLab/HARMONI/blob/main/HARMONI_ISPASS2026.pdf
  artifact: https://github.com/UVA-LavaLab/HARMONI
  docs:
  code:
technology:
  - "DRAM-PIM"
  - "near-memory-computing"
  - "digital-CIM"
  - "chiplet/hierarchical-memory-system"
workloads:
  - "LLM inference"
  - "Transformer inference"
  - "LLaMA-family presets"
  - "Mistral/Phi/GPT-family presets"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A3, A5]
axis_B: [B2, B4, B1, B7]
axis_C_first_class_objects:
  - "Transformer_DFG_node"
  - "phase_layer_head_annotation"
  - "HarmoniTensor"
  - "tensor_address_offset"
  - "tensor_memory_location"
  - "row_column_access_metadata"
  - "DRAM_channel_rank_chip_bank_hierarchy"
  - "weight_rank_and_KV_rank_partitioning"
  - "logic_unit"
  - "supported_operation_table"
  - "communication_edge"
  - "sync_node"
  - "aggregation_node"
  - "network_route_or_comm_cost"
axis_D_rewrite_objects:
  - "operator_task_graph"
  - "hardware_mapping"
  - "tensor_memory_layout"
  - "task_partitioning"
  - "aggregation_reduction_structure"
  - "communication_trace"
artifact:
  status: "public artifact found"
  url: "https://github.com/UVA-LavaLab/HARMONI"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
reproducibility_level: medium
notes:
  - "Best classified as simulator/cost-model plus placement-aware graph mapping for LLM inference."
  - "Artifact exposes DFG construction, tensor allocation, mapping, cost modeling, trace generation, and AE scripts."
  - "Standalone serialized IR schema and instruction/codegen backend were not found in checked sources."
  - "ADC/DAC and analog bit-slice objects are not applicable to the demonstrated digital DRAM-PIM abstraction."
takeaways: []
---

# HARMONI — scoped CIM stack note

**Source note.** I found the public HARMONI repository, README, scripts, code, license, release metadata, and the paper PDF file in the repository. The PDF title/author header was extracted and used for the citation metadata; paper-section-level statements remain conservative and the audit emphasis is on the public artifact/code evidence. The repository names the work “HARMONI: Hierarchical ARchitecture MOdeling for LLMs with Near/In Memory Computing.” ([GitHub](https://github.com/UVA-LavaLab/HARMONI))

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 Simulator & cost model** | The artifact’s main entry point is a simulation driver, with modules for DFG construction, memory mapping, latency/energy modeling, area/power calculation, trace generation, stats dumping, and visualization. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) |
| Secondary stack role, Axis A | **A3 Mapping / scheduling / DSE framework; A5 narrow end-to-end co-design** | HARMONI maps Transformer task-graph nodes to hierarchical logic units and exposes experiment parameters for model, DRAM organization, batch, token counts, fusion options, and mapping modes. The demonstrated stack is narrow and LLM-inference-specific rather than a general-purpose compiler. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py)) |
| Middle-layer style, Axis B | **B2 Graph-as-IR; B4 Hardware-resource IR; B1 Config-as-IR; partial B7 Runtime-state abstraction** | The central middle object is a NetworkX DFG with task nodes, tensor edges, phase/layer/head annotations, and communication labels. Hardware resources are represented as a memory-system graph with channels, ranks, chips, bank groups, banks, and logic units. CLI/config files act as experiment IR, while KV cache and batch/head state appear as explicit tensor allocation metadata. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py)) |
| First-class CIM objects, Axis C | **DRAM hierarchy, logic-unit hierarchy, tensor placement/location metadata, weight/KV rank partitioning, communication edges, aggregation nodes, costed compute/network resources** | HARMONI names channels, ranks, chips, bank groups, banks, logic units, supported operations, tensor addresses, tensor locations, row/column accesses, routing paths, subtasks, sync nodes, and aggregation nodes. ADC/DAC and bit-slice objects are not applicable to the artifact’s digital DRAM-PIM style. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py)) |
| Rewrite object, Axis D | **Operator/task graph + hardware mapping + memory layout + communication/cost trace** | The tool builds a Transformer DFG, rewrites partitioned tasks into subtasks plus synchronization and aggregation nodes, assigns logic units, attaches tensor-location metadata, and generates performance/network/GEMM traces. ([GitHub](https://github.com/UVA-LavaLab/HARMONI/blob/main/simulation/helpers.py)) |
| Best corpus tags | `simulator`, `cost-model`, `graph-as-ir`, `hardware-resource-ir`, `DRAM-PIM`, `near-memory-computing`, `LLM-inference`, `Transformer`, `KV-cache`, `tensor-placement` | These tags reflect the artifact’s exposed interfaces and demonstrated workload family. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) |
| Closest comparison baselines | **Sangam, NeuPIMs, FACIL, UM-PIM** | These nearby works share DRAM-PIM / PIM-for-LLM / PIM memory-system concerns, but differ in whether the main object is a simulator stack, an architecture proposal, a user-library/controller path, or a memory-space abstraction. ([arXiv](https://arxiv.org/abs/2511.12286v1?utm_source=chatgpt.com)) |

## 2. One-paragraph public summary

HARMONI is best read as a modeling, mapping, and simulation stack for LLM inference on hierarchical DRAM-PIM / near-memory systems. Its strongest reusable contribution is the combination of a Python-generated Transformer task graph, tensor placement metadata, hierarchical memory/logic-unit binding, and analytic latency/energy/resource modeling. The public artifact demonstrates the stack through configurable LLM model presets, DRAM hierarchy strings, batch/token settings, fusion flags, mapping options, network/GEMM trace generation, and ISPASS artifact-evaluation scripts. For CIM compiler/IR research, HARMONI is most useful as a simulator-backend and benchmark-harness reference: it shows how an LLM task graph can be enriched with placement, phase, communication, and hardware-binding information before being evaluated by a memory-system cost model. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| HARMONI provides hierarchical architecture modeling for LLMs with near-/in-memory computing. | Repository title/README and paper PDF identifier. | Code/artifact + documentation | The artifact exposes a simulation driver, model/DRAM/network/logic configs, memory-system construction, DFG generation, task mapping, latency/energy modeling, trace generation, and visualization. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) | Demonstrated as a Python analytic modeling framework for Transformer/LLM inference over configurable DRAM-PIM-style hierarchies. Paper-body confirmation would require successful extraction of the PDF text. |
| The stack models LLM inference as a task graph / execution trace. | Compact note and artifact structure; artifact code names the DFG. | Code/artifact | `DFG` wraps a NetworkX directed graph; task nodes carry fields such as kernel/type, token, layer, phase, head, input/output tensors, and communication-labeled edges. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py)) | The reusable graph boundary is clear in Python objects and visualizations; a standalone serialized IR schema is not evident from the checked sources. |
| The framework allocates tensors with memory-location metadata. | Artifact modules `model_alloc.py`, `tensor.py`, `dram_utils.py`. | Algorithm + code/artifact | Weights and KV cache tensors are assigned offsets, rank/chip mappings, locations, row/column access counts, and separate weight/KV-rank placement behavior. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/model_alloc.py)) | Evidenced for HARMONI’s configured DRAM hierarchy and LLM tensor classes. General external tensor-layout import/export is not found in the checked sources. |
| The framework maps graph nodes onto hierarchical logic units. | Artifact mapping module. | Algorithm + code/artifact | `map_tasks_to_logic_units` topologically traverses the graph, matches tensor locations to supported logic units, splits partitioned tasks into subtasks, inserts sync and aggregation nodes, and attaches logic-unit metadata. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py)) | Demonstrated for the operation set and hierarchy encoded in the logic/memory configs. Mapping legality is embedded in Python logic and supported-op lists rather than an external verifier. |
| The framework estimates latency, energy, area, and critical path. | README module structure and performance/analysis code. | Equation-like cost functions + code/artifact | The artifact contains latency/energy functions for GEMM/GEMV, softmax, RMSNorm, SiLU, rotary, reductions, memory accesses, communication, plus area/power calculators and critical-path analysis calls. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) | Evaluated through analytic simulation; calibration sources are partially visible in comments and constants, while full paper-level validation details are unknown from the checked sources. |
| The evaluation can be reproduced through an AE workflow. | `scripts/run_ae.sh`, `launch_ae_jobs.sh`, `analyse_ae.sh`, parameter files. | Code/artifact + documentation | The scripts create output directories, run local or Slurm jobs over named experiment sizes, summarize outputs, copy optional H100 references, and generate ISPASS-style figures. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/run_ae.sh)) | Reproduction support is present. Figure-for-figure reproducibility is partial/unknown without executing the full workflow and matching the paper figures. |
| HARMONI supports model and hardware design-space choices for LLM inference. | CLI args, model configs, DRAM/network/logic configs, parameter files. | Code/artifact | CLI options include model name, dtype, batch, input/output tokens, DRAM config, fused QKV/attention flags, head splitting, systolic-array option, buffer size, optimization mode, stats dumps, and trace dumps. Model presets include several GPT/LLaMA/Mistral/Phi families. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py)) | Demonstrated for the encoded model templates and DRAM/logic/network abstractions. Importing arbitrary models from common ML frameworks is not found in the checked sources. |

## 4. Stack anatomy

```text
Input / frontend:
```

The frontend is a Python CLI plus config files. Inputs include `--model_name`, `--dtype`, batch size, input/output token counts, DRAM configuration string, fusion flags, head-splitting option, buffer size, optimization choice, dump options, and cache/visualization flags. This is a config/CLI object rather than a conventional compiler frontend. It is documented in README examples and encoded in `args.py`; it is reusable by scripts but not presented as a stable external schema. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py))

```text
Middle representation:
```

The middle representation is a NetworkX-based DFG. Nodes carry operation and Transformer context fields such as kernel/type, phase, layer, token, head, input tensor, and output tensor; edges carry communication-operation labels. The graph is inspectable through Python objects, optional visualizations, cache files, and dump outputs, but the checked sources do not show a standalone textual IR specification. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))

```text
Mapping or scheduling state:
```

Mapping state appears as node attributes, task-to-logic-unit assignments, generated subtasks, sync nodes, aggregation nodes, and temp-tensor placement metadata. The mapper matches tensor locations to logic units that support each operation, then rewrites partitioned tasks to reflect distributed execution. It is inspectable through generated task-mapping/stat dumps and graph visualizations. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))

```text
Hardware abstraction:
```

The hardware abstraction is a Python memory-system graph with root, channels, ranks, chips, bank groups, banks, and logic units. It also includes supported-op sets by hierarchy level, network configuration constants, routing-table construction, DRAM timing assumptions, and weight/KV rank separation. This abstraction is explicit and inspectable in code/configs, but mainly reusable as Python modules rather than as a versioned hardware-description format. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py))

```text
Backend / simulator / codegen:
```

The backend is an analytic simulator, not a hardware code generator. It computes per-node metrics, memory timing, compute latency/energy, communication latency/energy, GEMM traces, network traces, resource breakdowns, and critical-path timing. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/transformer_sim.py))

```text
Output artifact:
```

Outputs include stats, timelines, task mappings, network and GEMM traces, DFG visualizations, timing CSVs, graph-cache artifacts, results, and plots. The README and tree document these output areas, while exact schemas are mostly code-defined. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))

```text
Evaluation loop:
```

The evaluation loop is script-driven. The AE workflow initializes directories, launches jobs locally or through Slurm, processes outputs, optionally incorporates H100 reference data, and generates figure data/plots. Parameter files enumerate model, DRAM, token, and batch combinations. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/run_ae.sh))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the NetworkX DFG, `HarmoniTensor` placement fields, logic-unit hierarchy, supported-op tables, DRAM address-interleaving logic, node metric annotations, and trace/stat outputs. The paper/repository foregrounds architecture modeling, while the reusable compiler semantics are most visible in the DFG annotations, tensor-location metadata, task-to-logic-unit binding, and inserted aggregation/synchronization nodes. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 Simulator & cost model.**  
HARMONI’s owned slice begins with model/config choices and ends with simulated timing, energy, resource, trace, and visualization outputs. The repository structure explicitly separates DFG/memory/mapping/modeling code from performance, hardware, trace, report, and visualization modules, which makes the simulator/cost-model role the clearest classification. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The mapper rewrites DFG nodes according to tensor placement and hardware-resource availability, splitting tasks into partitioned subtasks and inserting aggregation nodes. Experiment parameters expose enough model/hardware choices to function as a design-space exploration harness. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))

**Secondary: A5 Narrow end-to-end co-design.**  
The artifact connects LLM model templates, memory allocation, graph construction, mapping, simulation, and reporting in one flow. Its demonstrated scope is a specialized LLM inference stack over DRAM-PIM-style hierarchies rather than a broad compiler infrastructure for arbitrary CIM technologies. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/config/model_config.py))

### 5.2 Axis B — middle-layer style

**B2 Graph-as-IR.**  
The named middle representation is the DFG. Decisions made there include operator decomposition, phase/layer/head labeling, fused attention/QKV structure, communication-edge labeling, and later insertion of sync/aggregation nodes. Several decisions remain embedded in graph-construction and mapping code rather than a separate pass manager or schema. Upstream tools could read the Python graph or generated visualizations, but a single stable serialized IR artifact is not evident from the checked sources. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))

**B4 Hardware-resource IR.**  
The memory-system object names channels, ranks, chips, bank groups, banks, and logic units, and the logic config names supported operations at root/channel/rank/chip levels. Decisions made there include where operations may legally execute, which ranks hold weights versus KV cache, and what communication path is used between mapped tasks. The abstraction is first-class in Python but not separated as a compiler dialect or hardware IR file. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py))

**B1 Config-as-IR.**  
CLI arguments and config modules are a practical IR boundary for experiments: they select model family, dtype, DRAM organization, batch/tokens, fusion behavior, mapping mode, and trace/stat outputs. This makes the artifact easy to run for supported configurations, while deeper semantics remain in Python modules. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py))

**Partial B7 Runtime-state abstraction.**  
KV cache allocation, batch-dependent rank assignment, prefill/decode phases, and token-dependent graph construction give HARMONI a meaningful runtime-state component. The runtime state is represented as tensors and DFG phases rather than as a separate dynamic runtime IR. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/model_alloc.py))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable for crossbars; DRAM hierarchy is first-class** | HARMONI models a DRAM hierarchy of channels, ranks, chips, bank groups, banks, and logic units, not analog crossbar arrays. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py)) |
| Bit-slicing / bit significance | **N/A / implicit numeric width parameter** | The artifact exposes dtype and a `Data_width` constant, but checked sources do not show bit-slice placement or bit-significance flow as first-class IR objects. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py)) |
| ADC/DAC precision or sensing | **Not applicable** | The checked artifact is digital DRAM-PIM-style modeling; no ADC/DAC precision object is evident. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py)) |
| Analog-to-digital or domain transition | **Not applicable** | Communication and compute are modeled digitally through latency/energy functions and network/routing abstractions. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/config/network_config.py)) |
| Peripheral circuits as path nodes | **Costed / partially first-class** | Energy breakdown includes resources such as systolic array, SRAM buffer, adder tree, max tree, exp/divider/sqrt units, SIMD units, center-stripe logic, DRAM chiplet, and communication. These resources are costed but not uniformly exposed as graph path nodes. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/pu_latency_energy.py)) |
| Partial-sum accumulation path | **Costed / represented through aggregation and reduction nodes** | The mapper inserts aggregation nodes for partitioned tasks and connects subtasks through reduction communication edges; cost code includes adder-tree and reduction-related resources. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py)) |
| Reconstruction / shift-add tree | **N/A** | No analog bit-sliced reconstruction path is evidenced in the checked artifact. |
| Runtime state, masks, KV cache, batching, sparsity | **KV cache and batching first-class; masks/sparsity unknown** | KV tensors are allocated separately from weights, batch placement is represented in rank assignment, and prefill/decode phases appear in graph construction. Mask/sparsity abstractions were not found in checked sources. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/model_alloc.py)) |
| Value trajectory / flow path | **Approximated** | The closest approximation is DFG edges plus tensor location metadata, logic-unit mapping, communication labels, routing information, and trace outputs. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py)) |

### 5.4 Axis D — rewrite object

HARMONI rewrites an **operator/task graph** and its **hardware mapping state**. The main transformations are: constructing a Transformer DFG from model config; choosing fused versus unfused attention/QKV forms; allocating weight, KV, and activation tensors; binding tasks to logic units; splitting partitioned tasks into subtasks; inserting synchronization and aggregation nodes; and attaching communication/cost metadata for analysis. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))

The legal transformations are those encoded by supported operation lists, tensor-location matching, rank/chip hierarchy rules, and local graph rewrites. The framework exploits equivalences such as partitioned tensor work being decomposable into per-location subtasks followed by aggregation, GEMM with `m == 1` being treated as GEMV, and fused attention/QKV being selectable as graph-construction variants. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))

Information that must be preserved across lowering includes tensor identity, shape, precision, size, address offset, location list, row/column access counts, phase/layer/head labels, logic-unit mapping, and communication-edge intent. The representation is especially well suited to placement-aware LLM task simulation; expressing analog reconstruction rewrites, delayed sensing, bit-sliced value propagation, or backend-independent instruction generation would likely require an added abstraction for numeric trajectory and backend operation contracts. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/tensor.py))

## 6. Technical mechanism reading

### 6.1 Transformer graph construction as the compiler-facing object

HARMONI constructs a graph-level representation of LLM inference. The DFG object wraps a directed NetworkX graph, and graph construction attaches operation type, layer, token, phase, head, input tensors, and output tensors to nodes. The artifact contains special handling for attention components, including Q/K/V generation, rotary, KV append, score/scale/softmax/context, fused score/context, and concatenation. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))

For compiler/IR analysis, the important point is that the graph is not simply an operator list. It carries enough semantic annotation to distinguish prefill/decode phases, layer/head-level parallelism, tensor roles, and communication-producing edges. This makes it a useful “execution-trace-like” IR, even though its public interface is a Python object rather than a dialect/schema.

### 6.2 Tensor placement and address-interleaving metadata

`HarmoniTensor` carries name, tag, precision, shape, DRAM association, address offset, chip index, stride, number of elements, byte size, mapping, requests, locations, and row/column access metadata. Location computation expands address and interleaving information into storage locations and access counts. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/tensor.py))

The allocation code separates weight and KV placement. Weight allocation uses interleaving-aware address allocation so weights avoid KV ranks, while KV cache allocation is directed to KV ranks and uses batch-dependent rank selection. Temporary tensors are assigned locations based on the producing logic unit and buffer-size assumptions. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/model_alloc.py))

This is one of HARMONI’s clearest IR lessons: tensor placement is not a backend afterthought. It becomes part of the graph’s semantics because later mapping and cost modeling depend on tensor address ranges, chip/rank locations, and row/column access counts.

### 6.3 Hierarchical hardware abstraction

The memory-system object builds a graph of root, channels, ranks, chips, bank groups, banks, and logic units. Configured logic units advertise supported operations, and network configuration supplies bandwidth/latency constants for interconnect modeling. The code also distinguishes weight ranks and KV ranks when the DRAM config includes those fields. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py))

The hardware abstraction acts like a resource IR. It answers three compiler-relevant questions: which operations may run at which hierarchy levels, where tensors reside, and what communication path/cost connects producer and consumer logic units.

### 6.4 Mapping procedure and graph rewrite

The mapper traverses tasks in topological order. For tasks with tensor inputs, it searches for matching logic units based on tensor location and operation support. If the input tensor is partitioned across multiple locations, the mapper creates per-partition subtasks, redirects relevant edges through a synchronization node, and inserts an aggregation node mapped to a common parent. For tasks without direct input tensors, mapping decisions use static policies, predecessor inheritance, or closest-common-parent placement. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))

This means HARMONI’s rewrite object is not only a schedule; it is a graph transformation that changes the number and connectivity of tasks to reflect memory placement. That makes the mapped DFG closer to a simulator trace than a pure high-level operator graph.

### 6.5 Latency, energy, and communication model

The performance model computes per-node metrics such as FLOPs, bytes accessed, operational intensity, memory time, communication time, execution time, execution energy, and energy breakdown. It contains operation-specific handling for GEMM/GEMV, fused score, softmax, RMSNorm, SiLU, rotary, scale, elementwise multiply/add, lookup, aggregation, and other Transformer operations. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/transformer_sim.py))

The lower-level latency/energy module defines resource categories and constants for data width, compute cycle time, operation cycles, tree widths, DRAM read/write/activate energy, systolic-array resources, SRAM buffer, SIMD units, trees, and communication. Comments indicate that some DRAM energy constants are derived from simulator-style sources such as Ramulator2/DRAMsim3-style parameters, but full calibration provenance remains partial in the checked code. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/pu_latency_energy.py))

Communication is modeled through network configuration and routing. The memory-system code builds routing tables and can compute communication time and energy from path/routing information or operation-aware analytical latency. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py))

### 6.6 Workload and evaluation assumptions

The checked artifact exposes LLM model presets including GPT, LLaMA, Mistral, and Phi families, with fields such as layer count, hidden dimension, heads, KV heads, context length, vocabulary size, dtype, and activation function. The sample README command runs LLaMA2-7B with BF16, a DDR5 memory configuration, batch size 1, 32 input/output tokens, fused QKV, fused attention, and layer/static mapping optimization. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/config/model_config.py))

The AE parameter file includes Mistral-7B and LLaMA2-7B cases, BF16 dtype, multiple DDR5 configurations, input/output token counts such as 128 and 2048, and batch sizes including 1, 4, and 8. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/params/ispass_ae_small.txt))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — Tensor placement is the real compiler contract

- **Observation:** HARMONI’s graph becomes meaningful for simulation only after tensor objects carry address offsets, chip/rank mappings, location lists, and row/column access counts. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/tensor.py))  
- **Why it matters for CIM compiler/IR work:** A CIM IR that stops at operator placement would miss the information HARMONI needs for memory timing, communication, and task splitting.  
- **Reusable lesson:** Future stacks can borrow the idea of making tensor placement metadata a first-class annotation that survives graph lowering.

### Insight 2 — Mapping rewrites the graph, not just node attributes

- **Observation:** Partitioned tensor work is represented by creating subtasks and aggregation nodes, not merely by attaching a “partitioned” flag to a task. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))  
- **Why it matters for CIM compiler/IR work:** This makes distributed execution visible to later analysis passes, including communication and critical-path analysis.  
- **Reusable lesson:** A robust CIM IR should allow placement decisions to refine graph structure when a hardware mapping changes the execution topology.

### Insight 3 — KV cache is a placement problem, not only a workload parameter

- **Observation:** KV cache allocation is treated separately from weight allocation, with rank partitioning and batch-dependent placement rules. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/model_alloc.py))  
- **Why it matters for CIM compiler/IR work:** LLM-serving state can dominate memory movement and placement legality, so it belongs in the IR/mapping boundary rather than only in benchmark metadata.  
- **Reusable lesson:** Future CIM compiler stacks for LLM inference should represent persistent runtime tensors, such as KV cache, with placement and lifetime metadata.

### Insight 4 — Hardware-resource hierarchy is a second IR

- **Observation:** The memory-system graph and logic-unit support table encode operation legality and communication paths independently of the DFG. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/memory_system.py))  
- **Why it matters for CIM compiler/IR work:** The DFG alone does not define legal execution. The legal mapping space is the product of DFG semantics and resource hierarchy semantics.  
- **Reusable lesson:** A future public corpus should classify HARMONI under both graph-as-IR and hardware-resource-IR, because the stack’s semantics are distributed across both objects.

### Insight 5 — Config files function as the experiment-level IR

- **Observation:** Model presets, DRAM strings, network constants, logic-unit configs, CLI options, and AE parameter files collectively define an experiment. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py))  
- **Why it matters for CIM compiler/IR work:** In many CIM stacks, the stable public interface is not a compiler IR but a set of configuration files and scripts.  
- **Reusable lesson:** Corpus entries should identify config-as-IR boundaries explicitly, because they often define the reproducible contract more clearly than diagrams.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL or identifier:** `github.com/UVA-LavaLab/HARMONI`. The repository is public and named HARMONI. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))  
- **License:** MIT License, copyright 2026 LAVAlab. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/LICENSE))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** Python simulator, DFG/modeling modules, memory allocation, task mapping, DRAM/model/network/logic configs, hardware area/power modules, latency/energy models, analysis/timeline utilities, trace generators, stats reporters, visualization code, AE scripts, parameter files, generated-output directories, and a paper PDF file in the repository. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))  
- **What the artifact appears to omit:** A standalone textual IR schema, a backend instruction-set/codegen target, real-hardware runtime integration, and fully extracted paper-text metadata were not found in the checked sources. Calibration provenance is partial in the inspected code.  
- **Minimal documented workflow:** The README documents cloning, creating a Python 3.10 conda environment, installing `graphviz`, installing requirements, sourcing `env.sh`, and running `python3 run.py --simulate ...` with a LLaMA2-7B BF16 DDR5 example. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))  
- **AE workflow:** `run_ae.sh` initializes outputs and calls `launch_ae_jobs.sh`; `launch_ae_jobs.sh` supports Slurm or local execution and named experiment sizes; `analyse_ae.sh` summarizes outputs and generates figure data/plots. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/run_ae.sh))  
- **Whether paper figures appear reproducible from the artifact:** **Partial / unknown.** The artifact contains AE scripts and figure-generation scripts, but figure-for-figure reproduction was not executed in this session and the paper figures were not matched against generated outputs. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/analyse_ae.sh))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | CLI arguments and README example are documented; no separate input schema found. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py)) |
| Intermediate representation serialized | **Partial** | DFG exists as a NetworkX object with cache/visualization outputs; no standalone IR schema found. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py)) |
| Mapping decisions inspectable | **Partial** | Task mappings can be dumped and node logic-unit assignments are explicit in code; schema stability is code-defined. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py)) |
| Schedule inspectable | **Partial** | Topological traversal, subtasks, sync/aggregation nodes, and critical-path analysis are visible; no separate schedule language found. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py)) |
| Hardware config explicit | **Yes** | DRAM, logic, model, and network configs are public code/config modules. ([GitHub](https://github.com/UVA-LavaLab/HARMONI/tree/main/config)) |
| Precision / bit-slice assumptions explicit | **Partial / N/A** | Dtype and data width are explicit; bit-slicing is not applicable to the demonstrated digital DRAM-PIM abstraction. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py)) |
| Cost model inspectable | **Yes** | Latency/energy functions and resource breakdowns are public Python code. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/transformer_sim.py)) |
| Simulator backend documented | **Partial** | README and code structure document the simulator; detailed API docs were not found. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) |
| Generated code / instruction stream inspectable | **N/A** | The artifact exposes traces and simulator outputs rather than generated hardware instruction streams. ([GitHub](https://github.com/UVA-LavaLab/HARMONI)) |
| Provenance from source op to backend action | **Partial** | DFG node attributes, mapping annotations, traces, and stats support provenance; no formal provenance schema found. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py)) |
| Reproduction scripts available | **Yes** | AE scripts and parameter files are present. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/run_ae.sh)) |
| Calibration source documented | **Partial** | Some constants include source-style comments; full calibration/validation provenance is not fully evident from checked sources. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/pu_latency_energy.py)) |

### 8.3 Integration helper

- **As frontend:** HARMONI’s CLI/config path can be reused for supported LLM presets and DRAM hierarchy experiments. It is less direct as a frontend for arbitrary PyTorch/ONNX/MLIR imports because such importers were not found in the checked sources. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/args.py))  
- **As IR inspiration:** The most reusable abstractions are the Transformer DFG, `HarmoniTensor` placement metadata, phase/layer/head annotations, communication-labeled edges, and inserted aggregation/sync nodes. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/transformer_dfg.py))  
- **As mapper/scheduler:** The mapping procedure can inspire a placement-aware graph rewrite pass that splits work by tensor location and maps subtasks to supported logic units. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/core/task_mapping.py))  
- **As cost model:** The per-node latency/energy/resource functions, network model, memory-timing assumptions, and energy breakdown categories can be wrapped as backend plugins. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/modeling/perf/transformer_sim.py))  
- **As backend:** Integration would be most direct by emitting HARMONI-compatible DFG/tensor/config objects and using the simulator as an analytic backend.  
- **As benchmark:** The model presets, DRAM configurations, AE parameter files, and scripts are useful as a public benchmark harness for LLM-inference mapping experiments. ([GitHub](https://raw.githubusercontent.com/UVA-LavaLab/HARMONI/main/config/model_config.py))  
- **As validation source:** The checked artifact supports simulator-backed analysis. Hardware measurements, chip-in-loop validation, SPICE, or RTL calibration were not found in the inspected public sources.

**Integration effort estimate: Medium.**  
Reuse would be most direct through a small adapter that emits HARMONI’s Python DFG, tensor, and hardware-config objects. The effort rises if the upstream stack needs a stable serialized IR, arbitrary model import, formal legality checking, or instruction-level backend integration. The most valuable reusable boundary appears to be the placement-aware graph plus cost-model interface.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **Sangam** | DRAM-PIM / chiplet-based LLM inference and CXL-style integration concerns. | Sangam is framed as a chiplet-based DRAM-PIM accelerator for LLM inferencing; HARMONI’s reusable artifact is a configurable modeling/mapping/simulation stack. ([arXiv](https://arxiv.org/abs/2511.12286v1?utm_source=chatgpt.com)) | Keep architecture proposals and simulator/IR backends separate in corpus tags, even when they target similar hardware. |
| **NeuPIMs** | Heterogeneous NPU+PIM LLM inference, especially moving attention GEMV-style work to PIM. | NeuPIMs exposes an artifact with NPU-only and NPU+PIM branches; HARMONI exposes a hierarchy-aware DFG/mapping/cost-model framework. ([GitHub](https://github.com/casys-kaist/NeuPIMs?utm_source=chatgpt.com)) | Compare by rewrite object: workload partitioning across NPU/PIM versus explicit DFG-to-memory-hierarchy mapping. |
| **FACIL** | DRAM address mapping and SoC-PIM cooperation for on-device LLM inference. | FACIL emphasizes flexible address mapping, a user-level library, and a specialized memory controller; HARMONI models tensor allocation, logic-unit mapping, and analytic performance over a hierarchy. ([Seong Hoon Seo](https://seonghoonseo.github.io/files/pdf/research/2025-hpca-facil.pdf?utm_source=chatgpt.com)) | Address mapping can appear either as a hardware/software mechanism or as simulator-visible tensor-placement metadata. |
| **UM-PIM** | DRAM-based PIM memory-system abstraction and shared memory-space concerns. | UM-PIM focuses on a uniform/shared memory space for DRAM-PIM programming; HARMONI focuses on graph/task mapping and cost modeling over explicit hierarchy. ([Yilong Zhao](https://xiaoke0515.github.io/resume/publications/slides/ISCA24-93-UMPIM.pdf?utm_source=chatgpt.com)) | Distinguish programming model / memory-space abstractions from compiler-visible mapping and cost-model IR. |

## 10. Corpus-ready final takeaway

- HARMONI’s real contribution is a public Python modeling and simulation stack for LLM inference on hierarchical DRAM-PIM / near-memory systems.  
- The strongest reusable layer is the simulator backend plus placement-aware graph/mapping machinery.  
- The evidenced scope is Transformer/LLM inference using model presets, configurable DRAM hierarchies, tensor allocation, logic-unit mapping, and analytic latency/energy/resource modeling.  
- First-class objects include DFG nodes, Transformer phase/layer/head metadata, tensor locations, weight/KV rank placement, hardware hierarchy nodes, logic units, communication edges, sync nodes, and aggregation nodes.  
- The hidden IR is distributed across the NetworkX DFG, `HarmoniTensor` metadata, memory-system graph, supported-op configs, mapping code, and trace/stat outputs.  
- Artifact status is strong for code availability: the public repository is MIT-licensed and includes setup instructions, example commands, AE scripts, configs, and model/performance modules. ([GitHub](https://github.com/UVA-LavaLab/HARMONI))  
- Integration is most natural by wrapping HARMONI as a cost-model/backend target or by borrowing its tensor-placement and hierarchy-mapping abstractions.  
- For value-trajectory IR research, HARMONI is a useful digital DRAM-PIM reference: it approximates value flow through tensor placement and communication paths, while trajectory-level rewrites would require explicit value-flow/type annotations.
