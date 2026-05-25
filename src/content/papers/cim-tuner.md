---
slug: cim-tuner
title: "CIM-Tuner: Balancing the Compute and Storage Capacity of SRAM-CIM Accelerator via Hardware-mapping Co-exploration"
short_title: "CIM-Tuner"
subtitle: "Scoped CIM stack note"
year: 2026
publication:
  venue: "arXiv:2601.18070"
  type: "other"
  doi: "10.48550/arXiv.2601.18070"
  url: "https://doi.org/10.48550/arXiv.2601.18070"
authors:
  - "Jinwu Chen"
  - "Yuhui Shi"
  - "He Wang"
  - "Zhe Jiang"
  - "Jun Yang"
  - "Xin Si"
  - "Zhenhua Zhu"
bibtex: |
  @misc{chen2026cimtuner,
    author = {Chen, Jinwu and Shi, Yuhui and Wang, He and Jiang, Zhe and Yang, Jun and Si, Xin and Zhu, Zhenhua},
    title = {CIM-Tuner: Balancing the Compute and Storage Capacity of SRAM-CIM Accelerator via Hardware-mapping Co-exploration},
    year = {2026},
    howpublished = {arXiv:2601.18070},
    doi = {10.48550/arXiv.2601.18070},
    eprint = {2601.18070},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2601.18070}
  }
citation_source: https://arxiv.org/abs/2601.18070
summary: >-
  **CIM-Tuner** is a hardware-mapping co-exploration stack for SRAM compute-in-memory accelerators. Its main contribution is not a general-purpose compiler IR, but a reusable modeling and mapping abstraction: SRAM-CIM macros are represented as matrix-projection units with parameters such as accumulation length, parallel channels, storage-compute ratio, input-compute bandwidth, and weight-update bandwidth; accelerators are represented as a three-stage template with Input SRAM, CIM macro array, Output SRAM, and external bandwidth; and each operator is assigned a two-level mapping strategy combining spatial scheduling, temporal update priority, and macro-level tiling. The demonstrated workloads are DNN inference operators, especially CNN and Transformer-derived matrix multiplications encoded as CSV operator shapes, evaluated through a C CIMMA compiler, instruction-flow/count simulation, Python power/area/latency models, and simulated annealing over hardware sizing. For CIM compiler/IR research, the paper is most useful as evidence that a compact CIM-resource template plus mapping-state search can serve as an effective middle layer for hardware/software co-design, while the reusable IR boundary is clearest in the configuration schema, mapping labels, instruction types, and simulator metrics rather than in a separately documented compiler IR. ([arXiv](https://arxiv.org/html/2601.18070v1))
links:
  paper: https://arxiv.org/abs/2601.18070
  artifact: https://github.com/champloo2878/CIM-Tuner
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
  - "analog-CIM"
  - "hybrid"
workloads:
  - "ResNet-18"
  - "BERT Base, sequence length 64 and 512"
  - "BERT Large, sequence length 64 and 512"
  - "ViT Large, sequence length 197"
  - "GPT-2 Large, sequence length 8"
tags: []
baselines: []
axis_A:
  primary: A3
  secondary: [A2, A5]
axis_B: [B1, B4, B5, B3]
axis_C_first_class_objects:
  - "CIM_macro_matrix_abstraction"
  - "AL_accumulation_length"
  - "PC_parallel_channel"
  - "SCR_storage_compute_ratio"
  - "ICW_input_compute_bandwidth"
  - "WUW_weight_update_bandwidth"
  - "MR_MC_macro_grid"
  - "Input_SRAM_size"
  - "Output_SRAM_size"
  - "external_bus_bandwidth"
  - "mapping_labels_NR_R_IP_WP_AF_PF"
  - "partial_sum_accumulator_and_output_SRAM_flags"
axis_D_rewrite_objects:
  - "hardware_mapping"
  - "array_binding"
  - "buffer_schedule"
  - "macro_tiling"
  - "instruction_stream"
  - "hardware_sizing"
artifact:
  status: "public artifact found"
  url: "https://github.com/champloo2878/CIM-Tuner"
  license: "Unknown / not found in checked repository pages"
  last_checked: "2026-05-15"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Paper-level IR claim is best interpreted as operator-shape extraction plus mapping/compiler state, not as a standalone auditable IR."
  - "The CIMMA ISA and ATOS flags expose partial-sum trajectory semantics more concretely than the high-level framework diagram."
  - "The artifact is most reusable through config files, mapping labels, instruction counts, and simulator metrics."
takeaways: []
---

# CIM-Tuner — scoped CIM stack note

> Official paper title: **“CIM-Tuner: Balancing the Compute and Storage Capacity of SRAM-CIM Accelerator via Hardware-mapping Co-exploration.”** The paper was submitted to arXiv in January 2026 and appears in DATE 2026 proceedings. ([arXiv](https://arxiv.org/abs/2601.18070))

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A3 Mapping / scheduling / DSE framework**, with **A2 simulator & cost model** and **A5 narrow end-to-end co-design** | The strongest slice is hardware-mapping co-exploration: the tool varies accelerator sizing and per-operator mapping strategies under area/objective constraints, then evaluates them through compiler-generated instruction flows and simulator-backed PPA metrics. ([arXiv](https://arxiv.org/html/2601.18070v1)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B4 hardware-resource IR**, **B5 instruction/meta-op**, partial **B3 tensor-schedule/mapping** | Macro and accelerator parameters are explicit in config/code; mappings are named dataflow strings; the compiler emits or counts ISA-like instructions. The paper mentions “IR” for operator-dimension extraction, but the auditable boundary is clearer in CSV operator shapes, config files, dataflow labels, and instruction counts. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py)) |
| First-class CIM objects, Axis C | CIM macro matrix abstraction; AL, PC, SCR, ICW, WUW; macro grid MR×MC; Input SRAM / Output SRAM sizes; bus bandwidth; mapping labels NR/R, IP/WP, AF/PF; partial-sum accumulation flags | These objects are directly named in the paper’s template and artifact. Partial-sum behavior is especially visible through AF/PF tiling and the CIMMA ISA’s accumulator/output-SRAM flags. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) |
| Rewrite object, Axis D | **Hardware mapping**, **array binding**, **buffer/dataflow schedule**, **instruction stream**, limited **numeric-parameter selection** | CIM-Tuner rewrites operator shapes into one of several mapping strategies, varies hardware sizing parameters, and compiles mappings into instruction flows or instruction counts for PPA evaluation. ([arXiv](https://arxiv.org/html/2601.18070v1)) |
| Best corpus tags | `SRAM-CIM`, `compiler-mapping`, `hardware-software-co-design`, `DSE`, `simulated-annealing`, `instruction-flow-simulation`, `config-as-IR`, `matrix-template`, `DNN-inference`, `partial-sum-mapping` | Tags reflect the demonstrated stack boundary: workload-shape CSVs, macro/accelerator configs, mapping search, compiler-generated instruction flows, and simulator metrics. |
| Closest comparison baselines | **AutoDCIM**, **MICSim**, **MNSIM 2.0**, **NeuroSim / DNN+NeuroSim**, **SCALE-Sim**, **Morphable CIM** | AutoDCIM is the closest compiler/mapping baseline cited by CIM-Tuner; MICSim/MNSIM/NeuroSim are nearby simulator/modeling frameworks; SCALE-Sim is used for the digital-accelerator motivation; Morphable CIM is a CIM architecture/mapping-adjacent baseline for storage/compute morphing. ([arXiv](https://arxiv.org/html/2601.18070v1)) |

## 2. One-paragraph public summary

**CIM-Tuner** is a hardware-mapping co-exploration stack for SRAM compute-in-memory accelerators. Its main contribution is not a general-purpose compiler IR, but a reusable modeling and mapping abstraction: SRAM-CIM macros are represented as matrix-projection units with parameters such as accumulation length, parallel channels, storage-compute ratio, input-compute bandwidth, and weight-update bandwidth; accelerators are represented as a three-stage template with Input SRAM, CIM macro array, Output SRAM, and external bandwidth; and each operator is assigned a two-level mapping strategy combining spatial scheduling, temporal update priority, and macro-level tiling. The demonstrated workloads are DNN inference operators, especially CNN and Transformer-derived matrix multiplications encoded as CSV operator shapes, evaluated through a C CIMMA compiler, instruction-flow/count simulation, Python power/area/latency models, and simulated annealing over hardware sizing. For CIM compiler/IR research, the paper is most useful as evidence that a compact CIM-resource template plus mapping-state search can serve as an effective middle layer for hardware/software co-design, while the reusable IR boundary is clearest in the configuration schema, mapping labels, instruction types, and simulator metrics rather than in a separately documented compiler IR. ([arXiv](https://arxiv.org/html/2601.18070v1))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| CIM-Tuner is an automatic tool for hardware balancing and optimal mapping under an area constraint. | Abstract and Introduction contributions. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Algorithm, experiment, code/artifact | Simulated annealing varies MR, MC, SCR, IS size, and OS size while enforcing an area constraint; per-operator mapping choices are evaluated through simulator calls. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/experiments/cim_sa_model.py)) | Demonstrated for static DNN operator shapes and simulator-backed PPA objectives; “optimal” is evidenced as best found under the paper’s explored search procedure and models. |
| A matrix abstraction makes SRAM-CIM macro modeling universal across diverse CIM designs. | Section III-B, Fig. 4, Eqs. 1–5. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Equation, artifact config | The abstraction names AL, PC, SCR, ICW, WUW and derives compute/update latency; config files encode data widths, macro sizes, ICW/WUW, frequency, energy efficiency, and area. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg)) | Reusable for designs that can be summarized by these macro-level metrics. Fine-grained circuit behavior, ADC/sensing detail, analog nonideality, and value reconstruction are folded into parameters rather than represented as separate IR objects. |
| The generalized accelerator template decouples circuit implementation from architecture exploration. | Section III-B and Fig. 4. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Architecture model, code/artifact | The template has Input SRAM, CIM macro grid, Output SRAM, and bus bandwidth; artifact code computes AL/PC from macro_col/macro_row and derives buffer depths and bandwidths. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/cim_acc_config.py)) | Demonstrated for SRAM-CIM accelerator modeling, with CIM macro internals replaced by behavior/power/area models. |
| Fine-grained two-level mapping expands the mapping space. | Section III-C, Figs. 5–6. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Algorithm, code/artifact, experiment | Eight mapping labels combine NR/R spatial scheduling, IP/WP temporal scheduling, and AF/PF tiling; the simulator maps public labels to internal dataflow strings. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sim.py)) | Demonstrated for matrix-multiplication-like operators. The mapping abstraction is strong for buffer reuse and partial-sum placement, less explicit for graph-level fusion or cross-operator value typing. |
| CIM-Tuner compiles mappings into unified instruction flows and simulates instruction-driven power/latency. | Section III-A and IV-A. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Paper, code/artifact, documentation | The artifact includes a C CIMMA compiler, instruction types such as `Lin`, `Lwt`, `Cmpfis`, `Cmpfgt`, `Los`, and accumulator/output flags; README documents compiling the C program and optionally writing instructions to `Result/inst.txt`. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/evacim/CIMMA_Compiler)) | Instruction-flow evidence is strong at the artifact boundary. The ISA is documented as a tool-facing instruction set rather than as a stable external compiler target. |
| Expanded mapping strategies improve energy efficiency and throughput over a prior CIM mapping baseline. | Section IV-B, Fig. 7. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Experiment | The paper reports average **1.58×** energy-efficiency and **2.11×** throughput improvement over a restricted spatial-scheduling baseline across seven networks. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Comparison is within the same CIM-Tuner co-exploration framework, restricting the baseline mapping space to represent prior spatial scheduling. |
| CIM-Tuner improves SOTA accelerator configurations under identical area budgets. | Section IV-C, Table II. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Experiment | The paper instantiates TranCIM and TP-DCIM macro/template parameters, then reports energy-efficiency and throughput gains under fixed area budgets. ([arXiv](https://arxiv.org/html/2601.18070v1)) | The authors state that computational optimizations from the original accelerators are deliberately excluded, focusing on storage-compute allocation. ([arXiv](https://arxiv.org/html/2601.18070v1)) |
| Operator-size-aware objective and pruning reduce exploration overhead. | Section III-D and IV-D, Fig. 9. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Algorithm, experiment, code/artifact | Same-size operators are merged; SCR/IS/OS are constrained to powers of two; bandwidth constraints prune hardware designs; the paper reports >80% runtime reduction and >35% design-space reduction. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Demonstrated for the authors’ workload set and search implementation. |
| Simulation accuracy is silicon-verified. | Abstract and Section IV-E, Fig. 10. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Experiment / hardware measurement | A 28 nm prototype accelerator is used for power/functionality validation; the paper reports relative error below 10% for supported instructions. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Evidence is strongest for the reported prototype/template and instruction-power validation; broad validation across every supported macro config would require additional artifact-level calibration data. |
| CIM-Tuner is open-sourced. | Abstract, arXiv page, README. ([arXiv](https://arxiv.org/abs/2601.18070)) | Code/artifact, documentation | Public GitHub repository contains configs, Python simulator, C compiler, RTL directory, experiment scripts, result logs, plots, and benchmark CSVs. ([GitHub](https://github.com/champloo2878/CIM-Tuner)) | Public artifact is available; repository license was not found in the checked repository pages. The paper license on arXiv is separate from software reuse terms. ([arXiv](https://arxiv.org/abs/2601.18070)) |

## 4. Stack anatomy

```text
Input / frontend:
```

Workloads enter as operator descriptions. In the paper, the frontend is described as “IR” used to extract matrix dimensions; in the artifact, the clearest input is CSV. Transformer-style CSVs use `Layer, M, N, K`; CNN-style CSVs are converted from IFMAP/filter/channel/stride fields into `(N, K, M)` GEMM tuples. The CSVs are serialized and inspectable, and example workloads include ResNet-18, BERT Base/Large, ViT Large, and GPT-2 Large. ([arXiv](https://arxiv.org/html/2601.18070v1))

```text
Middle representation:
```

The middle state is a combination of operator GEMM tuples, CIM macro config, accelerator parameters, and mapping labels. The paper’s named macro representation is the **matrix abstraction** with AL, PC, SCR, ICW, and WUW; the accelerator template adds MR, MC, BW, IS_SIZE, and OS_SIZE. These are serialized in `.cfg` files and Python objects. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf))

```text
Mapping or scheduling state:
```

Mapping state is encoded as a dataflow choice: NR/R spatial scheduling, IP/WP temporal scheduling, and AF/PF macro-level tiling. In the artifact, these appear as public strings such as `NR_IP_AF` and internal strings such as `isap`, `ispp`, `wsap`, `wspp`, plus reversed variants. Mapping decisions are inspectable through printed optimal mappings and simulator records. ([arXiv](https://arxiv.org/html/2601.18070v1))

```text
Hardware abstraction:
```

Hardware is represented by macro parameters, accelerator-template parameters, area/power models, and instruction-level power estimates. The macro config includes data widths, AL/PC/SCR, input-compute bandwidth, weight-update bandwidth, frequency, energy efficiency, and macro area. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg))

```text
Backend / simulator / codegen:
```

The backend is the C-based CIMMA compiler plus Python simulator. `sim.py` calls `compiler_count` with bus width, AL, PC, SCR, buffer depths, frequency, operator dimensions, and dataflow, then converts instruction counts into area, latency, energy, throughput, and energy-efficiency metrics. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sim.py))

```text
Output artifact:
```

Outputs include instruction counts, optional instruction text in `Result/inst.txt`, per-operator or model-level PPA metrics, optimal dataflow labels, hardware sizing logs, result logs, and plots. The README documents enabling instruction writing via `WRITE_INST` and states that compiled instructions are saved to `./Result/inst.txt`. ([GitHub](https://github.com/champloo2878/CIM-Tuner))

```text
Evaluation loop:
```

The evaluation loop performs per-operator mapping selection inside a hardware search. Same-size operators are reduced/counted, candidate hardware configurations are generated, invalid or area-violating configurations are filtered, and simulated annealing accepts/rejects candidates using a Metropolis criterion. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of **CSV-derived GEMM tuples**, **CIM `.cfg` macro descriptors**, **accelerator sizing variables**, **mapping labels**, **instruction-count vectors**, and **area/power/latency tables**. The paper foregrounds the matrix abstraction and generalized accelerator template, while the reusable semantics are most visible in the artifact’s `nn_config.py`, `.cfg` files, `sw_func.py` mapping search, `sim.py` instruction-count interface, and CIMMA ISA documentation. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A3 Mapping / scheduling / DSE framework.**  
CIM-Tuner’s strongest ownership is the mapping/hardware design-space loop. It takes operator dimensions plus macro/accelerator parameters, chooses per-operator mapping strategies, varies hardware sizing, and ranks candidates by energy efficiency, throughput, or EDP. The paper’s search procedure and artifact’s simulated-annealing scripts make this the clearest corpus role. ([arXiv](https://arxiv.org/html/2601.18070v1))

**Secondary: A2 Simulator & cost model.**  
The simulator is central rather than incidental: the compiler emits/counts instruction flows, and the Python model estimates area, latency, energy, L2 traffic, throughput, and energy efficiency. ([arXiv](https://arxiv.org/html/2601.18070v1))

**Secondary: A5 Narrow end-to-end co-design.**  
The paper demonstrates a full loop from workload operator shapes to hardware sizing and mapping metrics, with a limited silicon-backed validation point. The demonstrated “end-to-end” boundary is narrow: static DNN inference operator shapes, SRAM-CIM macro templates, and simulator-backed PPA. ([arXiv](https://arxiv.org/html/2601.18070v1))

**Not primary: A4 Explicit IR / dialect / ISA compiler stack.**  
The artifact exposes an ISA-like backend interface, but the paper does not present an independently specified compiler IR or dialect with type rules, verification rules, or upstream/downstream contracts. The auditable compiler target is clearest as CIMMA instruction flow/counts. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/evacim/CIMMA_Compiler))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The `.cfg` files are the most reusable macro boundary. They name data precision, AL, PC, initial SCR, ICW, WUW, frequency, energy efficiency, and area. Decisions such as circuit-level sensing, ADC details, and nonidealities are summarized into these parameters rather than represented as separate graph objects. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg))

**B4 Hardware-resource IR.**  
The generalized accelerator template acts as a hardware-resource representation: macro rows/cols, bus width, input/output SRAM sizes, AL/PC expansion, buffer depths, and compute/write widths. Upstream passes could read these fields, but the schema is embodied in Python/config code rather than a versioned IR spec. ([arXiv](https://arxiv.org/html/2601.18070v1))

**B5 Instruction / meta-op / ILA.**  
The CIMMA instruction set names load, compute, output-store, no-op, and accumulator/output-SRAM behavior. The `ATOS` flags are particularly important because they expose partial-sum lifetime and movement. This is the closest artifact-level “backend contract.” ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/evacim/CIMMA_Compiler))

**Partial B3 Loop / tensor-schedule IR.**  
NR/R, IP/WP, and AF/PF encode tensor mapping and reuse choices, but the representation is a finite mapping label rather than a general loop-nest/tensor-schedule IR. Transformations are selected from a fixed strategy set. ([arXiv](https://arxiv.org/html/2601.18070v1))

**B6 Accuracy / nonideality modeling: limited.**  
The paper discusses CIM designs differing in data precision and accuracy and reports power/functionality validation, but the demonstrated simulator path is PPA-centered. Network accuracy, analog nonideality propagation, ADC errors, or retraining-aware accuracy modeling are not the central represented objects in the checked sources. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class parameterized macro/accelerator hierarchy** | Matrix abstraction names CIM macro AL×PC and SCR; accelerator template uses MR×MC macro grid. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) |
| Bit-slicing / bit significance | **Parameter / implicit** | Input, weight, and output data widths are config fields; bit significance and bit-slice placement are not separately represented. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg)) |
| ADC/DAC precision or sensing | **Parameter / implicit** | ACIM ICW is related to DAC precision in Eq. 2; artifact config uses `input_compute_bw`, not a separate ADC/DAC object. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) |
| Analog-to-digital or domain transition | **Implicit / costed through macro parameters** | The macro abstraction covers DCIM and ACIM compute bandwidth and latency, but domain transitions are not named as value-level IR nodes. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) |
| Peripheral circuits as path nodes | **Costed / partially first-class through instruction categories** | Load, compute, output SRAM, bus traffic, and L2 read/write bits appear in the ISA/simulator; fine circuit nodes remain summarized. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/evacim/CIMMA_Compiler)) |
| Partial-sum accumulation path | **First-class in mapping and ISA flags** | AF/PF tiling explicitly trades input reuse against output SRAM partial-sum buffering; ATOS flags encode accumulator/output-SRAM/external-bus partial-sum movement. ([arXiv](https://arxiv.org/html/2601.18070v1)) |
| Reconstruction / shift-add tree | **Implicit / hard-coded or not applicable at this abstraction level** | The checked paper/artifact expose data widths and Psum movement, but no separate reconstruction tree object was found. |
| Runtime state, masks, KV cache, batching, sparsity | **Not a demonstrated first-class object** | Workloads are static operator lists; the paper references sparsity in related SRAM-CIM accelerators but deliberately focuses on storage-compute allocation rather than accelerator-specific compute optimizations. ([arXiv](https://arxiv.org/html/2601.18070v1)) |
| Value trajectory / flow path | **Approximated** | The path is approximated by three-stage accelerator template, mapping labels, and CIMMA instructions; value identity across analog/digital/partial-sum stages is not a separately typed IR object. ([arXiv](https://arxiv.org/html/2601.18070v1)) |

### 5.4 Axis D — rewrite object

CIM-Tuner rewrites **hardware mapping** and **resource binding** more than graphs or source programs. The legal transformations include:

- choosing NR or R spatial scheduling, which effectively decides whether activation or weight data is placed in the CIM array;
- choosing IP or WP temporal update priority, which changes whether Input SRAM or CIM-resident data is updated first;
- choosing AF or PF macro-level tiling, which changes partial-sum reuse versus input-vector reuse;
- reversing GEMM dimensions for reversed mappings;
- varying MR, MC, SCR, IS_SIZE, and OS_SIZE under area and bandwidth constraints;
- compiling the resulting mapping into instruction flows / counts for the CIMMA backend. ([arXiv](https://arxiv.org/html/2601.18070v1))

The key equivalences are matrix-multiplication equivalences under data stationary choices, same-size operator canonicalization, and reuse trade-offs between input buffering, CIM weight updates, and output partial-sum buffering. Information that must be preserved across lowering includes GEMM dimensions, data widths, AL/PC/SCR capacity, buffer depth, bus bandwidth, mapping label, and partial-sum accumulation semantics. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py))

The representation is especially well suited to **static GEMM-like operator mapping and compute/storage sizing**. Expressing graph-level fusion, delayed sensing, cross-operator bit-slice persistence, dynamic batching, KV-cache residency, sparsity masks, or alternate analog peripheral routes would likely require an additional abstraction for value identity, numeric stage, and domain-transition state.

## 6. Technical mechanism reading

### 6.1 Matrix abstraction

CIM-Tuner abstracts a CIM macro as a vector-matrix projection: an input vector of length **AL** is multiplied against an **AL×PC** weight matrix stored in SRAM-CIM, producing a partial-sum vector of length **PC**. **SCR** selects among multiple stored matrices available to the compute unit. This is the paper’s central move: it reduces heterogeneous SRAM-CIM macros to a small set of architecture-level parameters. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf))

The key formulas are:

- `ICW_DCIM = AL × N_InputBitline`
- `ICW_ACIM = AL × Precision_DAC`
- DCIM compute latency scales as `Datawidth[Input] / N_InputBitline × 1/freq`
- ACIM compute latency scales as `Datawidth[Input] / Precision_DAC × 1/freq`
- update latency scales as `AL × Datawidth[Weight] / WUW × 1/freq` ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf))

For compiler/IR purposes, this makes **ICW** and **WUW** important bridge parameters: they stand between circuit implementation and mapping legality/cost without exposing the full circuit.

### 6.2 Generalized accelerator template

The accelerator template has three stages: Input SRAM, CIM macro array, and Output SRAM. Inputs are broadcast along macro columns, outputs accumulate along macro rows, and an external bus connects the template to DRAM. The explicit hardware variables are **MR**, **MC**, **BW**, **IS_SIZE**, and **OS_SIZE**, combined with macro parameters to derive effective AL, PC, buffer depth, compute width, and write width. ([arXiv](https://arxiv.org/html/2601.18070v1))

This template is narrow but useful: it gives the compiler/search loop enough structure to reason about whether the bottleneck is compute capacity, CIM storage, input buffering, output buffering, or external traffic.

### 6.3 Two-level mapping strategy

At the accelerator level, CIM-Tuner combines:

- **NR vs R spatial scheduling:** whether activation or weight data is stored as CIM weights;
- **IP vs WP temporal scheduling:** whether Input SRAM or CIM-resident data is updated first;
- **AF vs PF macro tiling:** whether SCR blocks favor accumulation within the same output channel or parallel reuse within the same input channel. ([arXiv](https://arxiv.org/html/2601.18070v1))

The compiler/IR significance is that AF/PF exposes a CIM-specific partial-sum trade-off. AF reduces output-SRAM pressure by accumulating consecutive partial sums, while PF improves input reuse but may increase temporary partial-sum storage and external-memory traffic when Output SRAM is limited. ([arXiv](https://arxiv.org/html/2601.18070v1))

### 6.4 Cost model and simulator

The Python simulator invokes the C compiler-count binary with hardware parameters, operator dimensions, and mapping/dataflow label. It then consumes instruction counts, applies area modeling, normalizes compute/update energy based on compute/write widths, computes cycle latency, estimates L2 read/write bits, and reports energy efficiency, throughput, EDP, and energy. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sim.py))

The simulator’s instruction categories include input loads, weight loads, CIM compute variants, output-store, no-op, and reward/fusion counters. This instruction-count vector is the most concrete backend-facing object in the artifact. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sim.py))

### 6.5 Search procedure

The network-level flow reduces identical operator shapes using `np.unique`, evaluates the best mapping for each unique operator, weights metrics by operator counts, and returns a scalar objective. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py))

The simulated-annealing search mutates macro rows, macro columns, SCR exponent, input-SRAM-size exponent, and output-SRAM-size exponent; constructs a new accelerator candidate; rejects area-violating candidates; and accepts or rejects candidate moves through a Metropolis probability. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/experiments/cim_sa_model.py))

### 6.6 Workload and validation scope

The artifact’s workload set includes ResNet-18, BERT Base/Large at selected sequence lengths, ViT Large with sequence length 197, and GPT-2 Large with sequence length 8. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/nn_config)) The paper’s silicon-backed validation reports a 28 nm prototype for power/functionality and less-than-10% relative error versus simulation for supported instructions. ([arXiv](https://arxiv.org/html/2601.18070v1))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The matrix abstraction is a hardware contract, not a full IR

- **Observation:** AL, PC, SCR, ICW, and WUW make heterogeneous SRAM-CIM macros comparable at the mapping level.
- **Why it matters for CIM compiler/IR work:** These fields are strong candidates for a CIM backend type or target descriptor because they determine legality and cost of tiling, updating, and partial-sum buffering.
- **Reusable lesson:** A future IR could attach a “CIM macro capability” type to arrays or memory regions, using CIM-Tuner’s parameters as a minimal target contract. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf))

### Insight 2 — The mapping label is a compact schedule object

- **Observation:** `NR_IP_AF`, `NR_IP_PF`, `NR_WP_AF`, and related labels encode three independent mapping decisions in one string.
- **Why it matters for CIM compiler/IR work:** This shows a small finite schedule space can still capture important CIM-specific reuse behavior.
- **Reusable lesson:** Future stacks could split these labels into typed schedule attributes: storage orientation, update priority, and SCR tiling policy. ([arXiv](https://arxiv.org/html/2601.18070v1))

### Insight 3 — Partial-sum behavior is most visible in the ISA, not the paper’s “IR”

- **Observation:** The CIMMA ISA flags distinguish whether partial sums remain in an accumulator register, move to Output SRAM, combine with Output SRAM data, or leave through the external bus.
- **Why it matters for CIM compiler/IR work:** These flags expose value-lifetime semantics that are central to CIM mapping and usually hidden in cost models.
- **Reusable lesson:** A value-trajectory IR could promote these accumulator/output flags into first-class value-flow operations. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/evacim/CIMMA_Compiler))

### Insight 4 — Operator-size reduction is a hidden canonicalization pass

- **Observation:** Same-size operators are merged and counted before model-level evaluation.
- **Why it matters for CIM compiler/IR work:** This is effectively a canonicalization from graph operators to equivalence classes of GEMM shapes.
- **Reusable lesson:** Corpus entries should distinguish “graph compiler” evidence from “operator-shape multiset” evidence; CIM-Tuner’s demonstrated frontend is clearest as the latter. ([arXiv](https://arxiv.org/html/2601.18070v1))

### Insight 5 — The artifact’s config files are the de facto macro type descriptors

- **Observation:** Config files contain precision, macro geometry, bandwidth, frequency, efficiency, and area fields.
- **Why it matters for CIM compiler/IR work:** These fields define what the compiler can ask of a CIM macro and what the simulator can cost.
- **Reusable lesson:** A future compiler stack could wrap these `.cfg` files as target descriptors while replacing the ad hoc CSV frontend with an explicit IR importer. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg))

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `champloo2878/CIM-Tuner`. The paper and arXiv page identify this as the open-source CIM-Tuner tool. ([arXiv](https://arxiv.org/abs/2601.18070))
- **License:** Unknown / not found in the checked repository pages. The arXiv paper has a visible license link, but that is paper licensing rather than software licensing. ([arXiv](https://arxiv.org/abs/2601.18070))
- **Last checked:** 2026-05-15.
- **Contains:** CIM macro config files, Python simulator scripts, C CIMMA compiler, RTL directory, experiment scripts, neural-network CSV configs, result logs, and plotting files. ([GitHub](https://github.com/champloo2878/CIM-Tuner))
- **Appears to omit or leave embedded:** A standalone IR specification, a formal schema for CSV/config files, a software license, release tags, and complete calibration datasets for all supported macro configurations. The repository page showed no releases. ([GitHub](https://github.com/champloo2878/CIM-Tuner/releases?utm_source=chatgpt.com))
- **Minimal documented workflow:** compile `evacim/CIMMA_Compiler` with `make`; run `python3 try.py`; optionally enable `WRITE_INST` to emit `Result/inst.txt`; run `python3 -m evacim.sim ...` for a single operator; run `python3 -m evacim.sw_func ...` for a model; run experiment scripts such as `python3 -m experiments.cim_sa_model`. ([GitHub](https://github.com/champloo2878/CIM-Tuner))
- **Paper figures reproducible from artifact:** Partial / likely for several plots. README points to paper experiments in `./experiments` and visualizations in `./plot`, but the checked documentation does not present a one-command reproduction manifest per figure. ([GitHub](https://github.com/champloo2878/CIM-Tuner))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | CSV use is clear from files and `nn_config.py`; schema is code-level rather than standalone documentation. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py)) |
| Intermediate representation serialized | Partial | Operator shapes, macro configs, mapping labels, and instruction text/counts are serialized or inspectable; no separately documented IR file format found. |
| Mapping decisions inspectable | Yes | `sw_func.py` returns and prints selected dataflow labels; README documents model-level evaluation. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sw_func.py)) |
| Schedule inspectable | Partial | Mapping labels are inspectable; full temporal/address schedule is visible through generated instruction flow when enabled. ([GitHub](https://github.com/champloo2878/CIM-Tuner)) |
| Hardware config explicit | Yes | `.cfg` files and `CIMACC` fields explicitly encode macro and accelerator parameters. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg)) |
| Precision / bit-slice assumptions explicit | Partial | Data widths are explicit; bit-slice/significance representation is not a separate object. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/cim_config/FPCIM%40ISSCC23.cfg)) |
| Cost model inspectable | Partial | Python code exposes energy, throughput, L2 traffic, EDP formulas; fitted model data/provenance is less fully documented in public files. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/sim.py)) |
| Simulator backend documented | Partial | README gives commands; CIMMA ISA Readme documents instruction types; full backend semantics are distributed across C/Python. ([GitHub](https://github.com/champloo2878/CIM-Tuner)) |
| Generated code / instruction stream inspectable | Yes | README describes enabling instruction writing to `Result/inst.txt`. ([GitHub](https://github.com/champloo2878/CIM-Tuner)) |
| Provenance from source op to backend action | Partial | CSV row → GEMM tuple → mapping label → compiler-count command is traceable in code; no unified provenance file found. ([GitHub](https://github.com/champloo2878/CIM-Tuner/blob/main/evacim/nn_config.py)) |
| Reproduction scripts available | Partial | Experiment scripts are present; per-figure exact reproduction commands are not fully documented in the checked README. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/experiments)) |
| Calibration source documented | Partial | Paper describes DC synthesis/PTPX fitting and a 28 nm prototype validation; public calibration detail appears limited. ([arXiv](https://arxiv.org/html/2601.18070v1)) |

### 8.3 Integration helper

- **As frontend:** Reuse is clearest for static DNN operator-shape import. The CSV frontend can be wrapped, but integration into a graph compiler would need an adapter from ONNX/MLIR/TVM-style ops into CIM-Tuner’s `(N,K,M)` or CNN-derived GEMM tuples.
- **As IR inspiration:** The matrix abstraction and accelerator template are useful target-descriptor candidates: AL, PC, SCR, ICW, WUW, MR, MC, IS_SIZE, OS_SIZE, and BW.
- **As mapper/scheduler:** The NR/R, IP/WP, AF/PF mapping space is directly reusable as a finite CIM mapping-policy set.
- **As cost model:** Instruction-count-driven latency/energy, L2 traffic, compute/write bandwidth normalization, and area-constrained search can become backend plugins.
- **As backend:** The CIMMA compiler and instruction-count interface could be wrapped as an external backend if inputs are lowered to the expected operator dimensions and dataflow labels.
- **As benchmark:** The artifact’s ResNet/BERT/ViT/GPT-2 CSVs, macro configs, experiment scripts, logs, and plots provide useful benchmark seeds. ([GitHub](https://github.com/champloo2878/CIM-Tuner/tree/main/nn_config))
- **As validation source:** The paper’s 28 nm prototype validation and <10% instruction-power error provide a useful calibration anchor, but broader calibration reuse would depend on additional details for each macro configuration. ([arXiv](https://arxiv.org/html/2601.18070v1))

**Integration effort estimate:** **Medium.** Integration would be most direct through the existing config files, CSV workload format, and simulator CLI. Reuse in a larger compiler stack would benefit from a small adapter that extracts operator shapes, emits CIM-Tuner mapping labels, and imports PPA results. Turning it into a first-class IR backend would require more work because the semantics are distributed across CSV parsing, config files, C compiler code, Python search, and simulator assumptions.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AutoDCIM** | Automated digital CIM compiler and storage-compute balance | CIM-Tuner positions AutoDCIM as prior fixed-template digital CIM exploration and extends the scope to a matrix abstraction, generalized accelerator template, accelerator-level scheduling, macro-level tiling, and hardware-mapping co-exploration. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) | Classify CIM-Tuner as broader mapping/DSE over SRAM-CIM templates, not only a fixed digital-CIM compiler. |
| **MICSim** | Open-source pre-circuit CIM simulator and multi-level DSE | MICSim is primarily a modular simulator for mixed-signal CIM accelerators with PyTorch/HuggingFace-oriented evaluation; CIM-Tuner’s distinctive object is the SRAM-CIM matrix template plus two-level mapping and sizing search. ([arXiv](https://arxiv.org/abs/2409.14838?utm_source=chatgpt.com)) | Separate simulator frameworks from compiler/mapping frameworks even when both perform DSE. |
| **MNSIM 2.0** | Behavior-level PIM modeling and unified digital/analog memory-array modeling | MNSIM emphasizes hierarchical PIM modeling and accuracy/performance evaluation; CIM-Tuner emphasizes compute/storage balancing, mapping labels, and instruction-flow simulation for SRAM-CIM. ([GitHub](https://github.com/thu-nics/MNSIM-2.0?utm_source=chatgpt.com)) | Useful comparator for Axis A2 simulator/cost model versus Axis A3 mapping/DSE. |
| **NeuroSim / DNN+NeuroSim** | Device/circuit/architecture benchmarking for CIM | NeuroSim is a technology/device-aware benchmark framework; CIM-Tuner uses higher-level macro metrics and searches accelerator sizing/mapping under area constraints. ([GitHub](https://github.com/neurosim/DNN_NeuroSim_V1.4?utm_source=chatgpt.com)) | Mark NeuroSim-like works as modeling/technology-stack baselines, not as explicit compiler IR stacks. |
| **SCALE-Sim** | Accelerator simulation and buffer/array trade-off motivation | CIM-Tuner uses SCALE-Sim to motivate compute/storage balance in conventional systolic accelerators; CIM-Tuner then specializes the problem to SRAM-CIM macros and partial-sum mapping. ([date26.date-conference.com](https://date26.date-conference.com/proceedings-archive/2026/DATA/1441.pdf)) | Good corpus contrast between digital accelerator scheduling models and CIM-specific storage/compute coupling. |
| **Morphable CIM** | CIM architecture/mapping flexibility and operation intensity | Morphable CIM is cited as a CIM architecture approach; CIM-Tuner is a tooling framework that can compare templates through matrix abstraction and mapping search. ([arXiv](https://arxiv.org/html/2601.18070v1)) | Keep architecture innovation distinct from reusable compiler/mapping infrastructure. |

## 10. Corpus-ready final takeaway

- **Real contribution:** CIM-Tuner contributes a practical SRAM-CIM hardware-mapping co-exploration framework built around a matrix macro abstraction, generalized accelerator template, two-level mapping space, instruction-flow simulation, and simulated annealing.
- **Strongest reusable layer:** The most reusable layer is the **mapping + cost-model boundary**: operator GEMM tuples, macro/accelerator config, mapping labels, instruction counts, and PPA metrics.
- **Evidenced scope:** Demonstrated on static DNN inference operator shapes, including CNN and Transformer-derived workloads, with simulator-backed results and one reported 28 nm prototype validation point.
- **First-class objects:** AL, PC, SCR, ICW, WUW, MR, MC, IS_SIZE, OS_SIZE, BW, NR/R, IP/WP, AF/PF, instruction types, and partial-sum accumulator/output flags.
- **Hidden IR location:** The effective IR is distributed across CSV workload files, `.cfg` macro descriptors, Python accelerator objects, mapping strings, C compiler instruction flow, and simulator cost tables.
- **Artifact status:** Public artifact found at `champloo2878/CIM-Tuner`; software license not found in checked repository pages; README provides setup and example commands.
- **Integration role:** Best reused as a mapper/scheduler, cost-model plugin, benchmark seed, or backend simulator wrapper; less direct as a general frontend or standalone IR.
- **Value-trajectory relevance:** Medium. It provides useful partial-sum and resource-path ingredients, but a trajectory IR would add explicit value identity, domain, precision stage, bit significance, and reconstruction metadata.
