---
slug: learncnm2predict
title: "LearnCNM2Predict: Transfer Learning-based Performance Model for CNM Systems"
short_title: "LearnCNM2Predict"
subtitle: "Scoped CIM stack note"
year: 2025
venue: "25th IEEE International Conference on Embedded Computer Systems: Architectures, Modeling and Simulation (SAMOS 2025)"
authors_or_group: "Anderson Faustino da Silva; Hamid Farzaneh; João Paulo C. de Lima; Asif Ali Khan; Jeronimo Castrillon"
summary: >-
  **LearnCNM2Predict** contributes a transfer-learning performance model for UPMEM-style compute-near-memory systems: it compiles CNM benchmark programs under different compiler-pass and hardware configurations, extracts static opcode-histogram features from compiled programs, augments them with DPU/tasklet and workload parameters, and trains an MLP to predict runtime and speedup for new target applications after limited fine-tuning. Its strongest CIM-stack contribution is a learned cost-model layer for ranking or filtering CNM program variants, rather than a new compiler IR, mapping language, or backend ISA. The demonstrated setting is UPMEM C/C++ benchmark code drawn from PrIM, PIM-ML, and Cinnamon-generated variants, measured on a 2048-DPU UPMEM system and evaluated across compiler pass sequences, DPU/tasklet counts, and benchmark parameters. For CIM compiler/IR research, the paper is most useful as evidence that a compact “feature-record IR” — instruction-mix summary plus hardware/compiler/workload configuration — can serve as a practical prediction boundary for digital CNM design-space exploration. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))
links:
  paper: https://grk2767.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf
  artifact: https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict
  docs:
  code:
technology:
  - "UPMEM"
  - "digital-CNM"
  - "DRAM-PIM"
workloads:
  - "PrIM benchmarks"
  - "PIM-ML linear/logistic regression variants"
  - "Cinnamon-generated UPMEM variants"
  - "BFS"
  - "BS"
  - "GEMV"
  - "HST-L"
  - "HST-S"
  - "MLP"
  - "RED"
  - "SCAN-RSS"
  - "SCAN-SSA"
  - "SpMV"
  - "TRNS"
  - "TS"
  - "VA"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A6, A3]
axis_B: [B1, B4, B5, B7]
axis_C_first_class_objects:
  - "DPU count"
  - "tasklet count"
  - "compiler pass/configuration identifier"
  - "workload parameter"
  - "opcode histogram"
  - "runtime label"
  - "speedup label"
axis_D_rewrite_objects:
  - "program/configuration variant"
  - "compiler pass sequence"
  - "hardware configuration"
  - "workload parameter"
  - "learned model adaptation"
artifact:
  status: "public artifact found"
  url: "https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "cost_model"
  - "benchmark"
  - "validation"
  - "IR inspiration"
reproducibility_level: medium
notes:
  - "Treats opcode-histogram plus configuration fields as the practical reusable boundary."
  - "Best suited as a learned cost model for UPMEM CNM variant ranking."
  - "Does not expose a formal graph, loop, memory-layout, or value-trajectory IR."
  - "Full reproduction depends on UPMEM hardware or simulator setup and exact experiment configuration."
takeaways: []
---

# LearnCNM2Predict — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 — Simulator & cost model** | The central object is a learned performance predictor for CNM/UPMEM program variants, trained from static opcode histograms, workload parameters, compiler-pass identifiers, and DPU/tasklet settings to predict runtime and speedup. The paper frames this as a transfer-learning performance model rather than a compiler IR or lowering stack. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Secondary stack role, Axis A | **A6 — Programming / runtime / benchmark on real hardware**; light **A3 — DSE support** | The evidence is grounded in measured UPMEM executions over PrIM, PIM-ML, and Cinnamon-generated benchmark variants, with pass-sequence and hardware-configuration sweeps. The model is positioned as a tool for design-space exploration and compiler-optimization selection, but the paper’s artifact primarily exposes prediction and training workflows. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR**, **B5 Instruction / meta-op summary**, **B4 Hardware-resource parameters**, light **B7 Runtime-state abstraction** | The reusable middle state is a serialized feature table: opcode-count embeddings plus `tasklets`, `dpus`, pass/config identifiers, workload parameters, and measured labels. It summarizes instruction mix rather than preserving ordered control/data flow. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| First-class CIM objects, Axis C | **DPU count, tasklet count, compiler-pass/config ID, workload parameter, static opcode histogram, runtime/speedup label** | UPMEM’s DPU/tasklet structure and memory hierarchy are described in the paper, but the model’s explicit inputs are compact configuration and binary-derived feature fields. Analog-CIM objects such as crossbar cells, ADC/DAC precision, and bit slicing are outside the demonstrated technology setting. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Rewrite object, Axis D | **Configuration/program variant**, not an explicit graph/loop/instruction rewrite | The enumerated transformations are compiler pass-sequence variation, DPU/tasklet-count variation, workload-parameter variation, and transfer/fine-tuning of the predictor. The work predicts the cost of variants; it does not expose a typed IR on which compiler rewrites are formally specified. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Best corpus tags | `UPMEM`, `digital-CNM`, `performance-model`, `transfer-learning`, `cost-model`, `opcode-histogram`, `compiler-pass-selection`, `benchmarking`, `PrIM`, `PIM-ML` | These tags reflect the stack boundary that is easiest to reuse: learned cost prediction over measured UPMEM benchmark variants. |
| Closest comparison baselines | Devic et al. “To PIM or not to PIM”; Gómez-Luna et al. PrIM; PIM-ML; Cinnamon/CINM; ATFormer; TransferTuning | These works are close either because they model or benchmark UPMEM/PIM systems, generate UPMEM code variants, or use transfer learning for performance prediction/tuning. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |

## 2. One-paragraph public summary

**LearnCNM2Predict** contributes a transfer-learning performance model for UPMEM-style compute-near-memory systems: it compiles CNM benchmark programs under different compiler-pass and hardware configurations, extracts static opcode-histogram features from compiled programs, augments them with DPU/tasklet and workload parameters, and trains an MLP to predict runtime and speedup for new target applications after limited fine-tuning. Its strongest CIM-stack contribution is a learned cost-model layer for ranking or filtering CNM program variants, rather than a new compiler IR, mapping language, or backend ISA. The demonstrated setting is UPMEM C/C++ benchmark code drawn from PrIM, PIM-ML, and Cinnamon-generated variants, measured on a 2048-DPU UPMEM system and evaluated across compiler pass sequences, DPU/tasklet counts, and benchmark parameters. For CIM compiler/IR research, the paper is most useful as evidence that a compact “feature-record IR” — instruction-mix summary plus hardware/compiler/workload configuration — can serve as a practical prediction boundary for digital CNM design-space exploration. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| A transfer-learning model can predict CNM runtime and speedup for target applications using little target data. | Abstract, Introduction, Section 3, Section 4 | Algorithm, experiment, code/artifact | The L2P pipeline trains an MLP on source benchmark embeddings and fine-tunes for unseen target benchmarks; the paper reports average MAPE of **8.04%** for runtime and **7.11%** for speedup, with worst reported cases near GEMV. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | Demonstrated for UPMEM benchmark variants generated from PrIM, PIM-ML, and Cinnamon-style code, using measured UPMEM executions and static feature extraction. |
| Static program features are sufficient to build useful CNM performance embeddings. | Section 3.1 | Paper-only, code/artifact | The paper describes opcode histograms extracted from compiled CNM programs and augmented with dataset size, workload parameters, DPU/tasklet counts, and compiler configuration. The artifact contains scripts that generate opcode-count YAML records using `llvm-objdump`/text processing. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The evidenced representation is a lossy instruction-mix/configuration feature vector. Ordered instruction streams, control flow, memory-layout provenance, and source-operator identity are not preserved in this feature boundary. |
| The framework is application-agnostic and compiler-agnostic. | Introduction and Section 4 | Experiment, paper-only | The experiments train and transfer across 17 UPMEM benchmark variants and use many compiler-pass configurations. The paper states that the model is designed to be independent of a specific compiler optimization while still encoding pass-sequence variation. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The demonstrated scope is UPMEM C/C++ benchmark code, UPMEM binaries or compiled artifacts, DPU/tasklet variation, workload-parameter variation, and pass-sequence variation. Broader compiler or architecture transfer is a plausible direction rather than directly evidenced. |
| The model can support DSE and compiler optimization. | Introduction, Figure 1 discussion, Section 3 | Experiment, paper-only | The paper shows that prediction can be much faster than exhaustive measurement and reports fine-tuning and prediction times. It frames the predictor as a way to avoid evaluating every program/configuration pair. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The artifact exposes training and inference scripts. A complete optimizer/search loop that consumes predictions and emits selected compiler configurations is not the main reusable interface. |
| The method is validated on real CNM hardware. | Section 4.1 | Experiment | Data generation is reported on a UPMEM system with 16 DIMMs and 2048 DPUs; host/training hardware and OS details are provided. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The strongest evidence is for the measured UPMEM platform. The paper’s conclusion notes that evaluating other CNM architectures was constrained by the availability of reliable open infrastructures. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Less than 1% of training data is needed for target adaptation. | Introduction and Section 4 setup | Experiment, code/artifact | The paper states that 1% of target/inference data is used for fine-tuning in the reported setup. The public example inference script uses a `fine_tuning_size` argument, though the example value shown is `0.1`, so exact paper-figure reproduction requires matching the paper’s experiment configuration. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The paper-level evidence supports low-data fine-tuning for the reported benchmark split. Artifact-level reproduction should verify the exact fine-tuning fraction, seeds, pass files, and measured logs used for each figure. |
| The work is open source. | Section 4.1 availability note and GitHub README | Code/artifact, documentation | The repository `ComputerSystemsLaboratory/LearnCNM2Predict` is public, contains source code, scripts, example datasets, example models, benchmark subdirectories, and an MIT license. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | The public artifact provides a useful implementation boundary. Full paper-figure reproducibility appears to depend on UPMEM hardware or simulator access, pass files, generated logs, and exact experiment settings. |

## 4. Stack anatomy

```text
Input / frontend:
  UPMEM-oriented C/C++ benchmark applications from PrIM, PIM-ML, and Cinnamon-generated variants;
  compiler pass pipelines; workload-size parameters; DPU and tasklet counts.
  These are source trees, script arguments, filenames, and configuration fields rather than a typed compiler IR.
```

```text
Middle representation:
  A feature record / embedding: opcode histogram plus hardware/compiler/workload fields.
  In the artifact, intermediate data is serialized through YAML/CSV-like records and normalized numeric tables;
  this is inspectable and reusable as data, but not documented as a formal IR schema.
```

```text
Mapping or scheduling state:
  DPU count, tasklet count, pass-sequence/configuration identifier, and benchmark parameter.
  These are inspectable in filenames, script loops, and dataset columns; detailed memory placement,
  DMA schedule, and source-operation mapping are implicit in benchmark code and UPMEM execution.
```

```text
Hardware abstraction:
  UPMEM DIMM/rank/chip/DPU structure, DPU tasklets, MRAM/WRAM/IRAM capacities, and host/DPU execution model.
  The predictor’s feature boundary uses compact hardware parameters rather than a full hardware-resource graph.
```

```text
Backend / simulator / codegen:
  UPMEM SDK compilation and execution on real UPMEM hardware or simulator-compatible benchmark workflows.
  The artifact invokes benchmark builds/runs and then trains/predicts from logs and embeddings;
  it is not a standalone compiler backend.
```

```text
Output artifact:
  Predicted runtime and/or speedup, trained model weights, metrics, plots, and residual/accuracy reports.
  The model output is directly usable as a cost estimate for variant ranking or downstream DSE.
```

```text
Evaluation loop:
  Generate program/config variants → compile/run on UPMEM → extract static opcode embeddings →
  merge with measured runtime/speedup labels → train source model → fine-tune for target benchmark →
  predict and report MAPE/R²/other metrics.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of opcode-histogram files, normalized CSV feature tables, DPU/tasklet fields, pass/configuration identifiers, workload parameters, scaler state, and trained model weights. The paper foregrounds transfer learning as the mechanism, while the reusable compiler-stack semantics are most visible in the feature-record boundary: it names the program variant, hardware setting, compiler setting, and measured/predicted performance label without carrying a full graph, loop nest, memory schedule, or value trajectory. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
The paper’s owned stack slice is performance prediction: given a compiled-program feature vector and a compact hardware/compiler/workload configuration, estimate runtime and speedup. The input is a measured or generated program/config variant; the output is a predicted cost label usable for ranking or filtering variants. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

**Secondary: A6 — Programming / runtime / benchmark on real hardware.**  
The predictor is calibrated from real UPMEM benchmark executions, and the paper describes the UPMEM hardware hierarchy and execution environment in enough detail to make the dataset-generation loop meaningful. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

**Light secondary: A3 — Mapping / scheduling / DSE framework.**  
The model is intended to reduce the cost of exploring DPU/tasklet and compiler-pass configurations, but the reusable artifact is clearest as a predictor rather than as a complete mapper or scheduler. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is not an IR dialect; it is a dataset row or embedding record. Decisions encoded there include DPU count, tasklet count, pass/configuration ID, workload parameter, and normalized numeric features. Upstream passes could read and rewrite this table, but they would be manipulating a prediction feature schema rather than a semantics-preserving compiler IR. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/dataset_generator.py))

**B5 — Instruction / meta-op summary.**  
The model consumes opcode histograms. This gives first-class status to instruction categories as counts, but not to instruction order, dependencies, memory addresses, DMA events, or control-flow regions. The representation is useful for statistical performance modeling; a compiler pass that needs legality proofs or source-to-backend provenance would need an additional representation before histogramming. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

**B4 — Hardware-resource parameters.**  
The paper and scripts expose DPU/tasklet counts as explicit configuration dimensions. The full UPMEM hierarchy — host, DIMM, rank, chip, DPU, MRAM, WRAM, IRAM, DMA path — is described, but the model’s direct feature interface compresses hardware into a small set of configuration fields. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

**B7 — Runtime-state abstraction, limited to measured labels.**  
Runtime and speedup are supervised targets, and baseline speedup is computed relative to a baseline configuration in the data-preparation workflow. The runtime state is therefore represented as labels and metrics rather than as a dynamic execution-state IR. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/update_x86_embeddings_with_upmem_data.py))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** | The demonstrated platform is UPMEM digital CNM/PIM with DPUs near DRAM, not analog crossbar CIM. The paper describes DIMMs, ranks, chips, DPUs, MRAM, WRAM, and IRAM. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Bit-slicing / bit significance | **Not applicable / implicit** | The evaluated UPMEM setting does not expose analog bit-slice compute. Quantized PIM-ML benchmark variants are named, but bit significance is not a typed feature propagated through the predictor interface. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| ADC/DAC precision or sensing | **Not applicable** | UPMEM is described as a digital DPU-based CNM system; ADC/DAC stages are not part of the modeled stack object. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Analog-to-digital or domain transition | **Not applicable** | The value domain in the demonstrated platform is digital host/DPU memory and execution, not analog accumulation plus conversion. |
| Peripheral circuits as path nodes | **Implicit / not applicable** | The model does not expose peripheral circuit nodes; hardware abstraction is compactly expressed through DPU/tasklet and platform context. |
| Partial-sum accumulation path | **Implicit** | Benchmarks such as GEMV and reductions contain accumulation behavior, but the predictor represents them through opcode histograms and benchmark parameters, not an explicit accumulation-path object. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Reconstruction / shift-add tree | **Not applicable** | No explicit bit-sliced reconstruction path is modeled for UPMEM. |
| Runtime state, masks, KV cache, batching, sparsity | **Parameter / implicit** | Workload parameters and DPU/tasklet counts are explicit; richer runtime-state objects such as masks, batching state, or KV cache are not part of the demonstrated feature schema. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/update_x86_embeddings_with_upmem_data.py)) |
| Value trajectory / flow path | **Approximated by feature summary** | The closest object is the opcode-histogram/configuration feature vector; it summarizes program behavior statistically rather than naming per-value paths through memory, compute, accumulation, and storage. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/bash/x86_embeddings_generator.sh)) |

### 5.4 Axis D — rewrite object

The tool rewrites or varies **program/configuration instances**, not graph nodes or loop nests. The legal transformations evidenced by the paper and artifact are:

- changing compiler pass sequences or optimization configurations;
- changing DPU and tasklet counts;
- changing benchmark/workload parameters;
- generating benchmark variants through existing benchmark and Cinnamon-derived code paths;
- training, freezing, and fine-tuning model layers for target applications. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

The main equivalence exploited is predictive rather than semantic: different program/configuration variants are embedded into a common numeric feature space, and transfer learning uses shared structure across source and target benchmarks. Information that must be preserved across this lowering includes opcode counts, DPU/tasklet settings, pass/configuration identity, workload parameters, and measured target labels. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

The representation is especially well suited to fast cost estimation over enumerated UPMEM program variants. Expressing source-level legality, memory-layout transformations, DMA retiming, DPU communication protocols, or value-trajectory rewrites would likely require an additional abstraction before the histogram stage: for example, a graph/loop/memory IR that preserves source-operation identity and memory-domain transitions.

## 6. Technical mechanism reading

### 6.1 Data-generation loop

The experimental loop enumerates benchmark variants over hardware and compiler dimensions. The paper reports 15 hardware configurations generated from DPU counts 1–16 and tasklet counts 1–16, with tasklets constrained to be at least the number of DPUs, and 1,004 compiler configurations including 1,000 unique pass sequences plus standard optimization levels. It initially generates 15,060 samples per benchmark before filtering unsuccessful executions, leaving roughly 12,000 samples per benchmark. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

The public script `upmem_data_generator.sh` mirrors this loop: it iterates over tasklets, DPUs, compiler passes, and workload parameters, sets variables such as `NR_TASKLETS`, `NR_DPUS`, and `PASSES`, builds/runs benchmarks, and writes logs named by benchmark, tasklet count, DPU count, pass, and parameter. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/bash/upmem_data_generator.sh))

### 6.2 Feature extraction as the reusable boundary

The core representation is an embedding built from static opcode histograms plus configuration fields. The paper states that instruction histograms are extracted from compiled CNM programs without executing them and are augmented with dataset size, workload-specific parameters, and DPU/tasklet/compiler-configuration codes. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

The artifact exposes this boundary through scripts that disassemble compiled artifacts, count instruction mnemonics, and emit YAML-style `instruction: count` records. The script is named `x86_embeddings_generator.sh`, so exact reproduction should verify which binary target and compilation path correspond to each paper experiment; the paper-level description is “compiled CNM programs,” while the artifact’s script naming suggests a host-side or cross-toolchain embedding workflow that deserves audit during reuse. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/bash/x86_embeddings_generator.sh))

### 6.3 Dataset construction and normalization

The dataset generator loads embedding and UPMEM measurement directories, merges feature records, normalizes numeric columns with a `StandardScaler`, and preserves special fields such as `tasklets`, `dpus`, `pass`, and `param` in the output ordering. This makes the feature table a practical serialized interface for downstream training, prediction, and analysis. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/dataset_generator.py))

### 6.4 Learned model

The paper describes L2P as an MLP that predicts runtime and speedup, with dense layers, residual connections, batch normalization, ReLU activations, dropout, and a final regression output. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) The tuned configuration reported in Section 4 uses 12 hidden layers, 256 neurons per layer, dropout 0.5, batch size 16, learning rate 0.0001, and freezing of the first six hidden layers during fine-tuning. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) The public `model.py` implements an `L2PModel` with input layer, hidden-layer module lists, batch-normalization layers, dropout, residual connections, and a freeze-layer routine with default `freeze_up_to=6`. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/model.py))

A small paper/code reading note is useful here: the paper’s architectural prose mentions a 16-hidden-layer MLP in the generic model description, while the reported optimal setup and artifact defaults use 12 hidden layers. For corpus purposes, the evidenced experimental configuration should be recorded as 12 hidden layers unless a reproduction explicitly selects otherwise. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

### 6.5 Transfer-learning procedure

The transfer workflow trains on source applications, freezes a configurable prefix of model layers, and fine-tunes on a small target subset. The paper reports using 1% of inference/target data for fine-tuning in the evaluated setup. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) The artifact exposes this mechanism through training and inference scripts, including flags for `fine_tuning`, `fine_tuning_size`, `freeze_up_to`, learning rate, dropout, layer count, patience, and target column. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/example/training.sh))

### 6.6 Cost model and metrics

There is no analytical latency equation or memory-traffic formula in the main reusable interface. The cost model is learned from measured runtime/speedup labels, and the exposed metrics include RMSE, MAE, R², MAPE, SMAPE, and residual-normality checks in the artifact utilities. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/utils.py)) The paper’s main reported accuracy results are average runtime MAPE of 8.04% and speedup MAPE of 7.11%, with best/worst runtime cases of 2.53% for HST-S and 17.97% for GEMV, and best/worst speedup cases of 2.83% for TRNS and 15.89% for GEMV. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))

### 6.7 Workload and hardware assumptions

The demonstrated workloads come from PrIM, PIM-ML, and Cinnamon-generated UPMEM variants. The paper excludes SEL, UNI, and NW from the evaluation because of implementation errors and selectively evaluates linear/logistic regression variants with and without quantization. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) The PrIM and PIM-ML repositories embedded in or referenced by the artifact document UPMEM SDK requirements and support execution on real UPMEM modules or simulator workflows. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/tree/main/benchmarks/prim-benchmarks))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The feature table is the de facto IR boundary

- **Observation:** The artifact’s YAML/CSV feature records carry the fields that matter for prediction: opcode counts, DPU/tasklet settings, pass/configuration identifiers, workload parameters, and labels.
- **Why it matters for CIM compiler/IR work:** This is an example of a cost-model IR that is intentionally lossy but operationally useful. It can be produced after compilation and consumed by a learned model without requiring a full compiler dialect.
- **Reusable lesson:** A future CIM compiler stack could emit a richer version of this feature record as a backend-cost interface, while preserving links back to source operators or schedules for explainability.

### Insight 2 — Compiler pass sequence is modeled as a predictive feature, not a semantic rewrite log

- **Observation:** The pass/configuration dimension is encoded into the dataset and used for prediction, but the model does not need to understand each pass’s legality or transformation semantics.
- **Why it matters for CIM compiler/IR work:** This separates two roles often conflated in compiler stacks: a legality-preserving rewrite system and a cost-ranking layer over generated variants.
- **Reusable lesson:** A compiler can use LearnCNM2Predict-like features downstream of a normal lowering pipeline, as a variant scorer, while retaining legality and provenance in a separate IR.

### Insight 3 — Transfer-source choice becomes a benchmark-coverage question

- **Observation:** The paper finds that structurally richer applications can serve as better sources for transfer, while simpler targets are often easier to predict. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf))
- **Why it matters for CIM compiler/IR work:** For learned cost models, benchmark selection is part of the interface design: source workloads define what performance patterns the model can reuse.
- **Reusable lesson:** A future corpus should record not only benchmark names but also structural descriptors — memory intensity, reduction structure, control irregularity, and DPU/tasklet scaling behavior — because these may govern transfer quality.

### Insight 4 — Measured UPMEM logs are the calibration source

- **Observation:** The predictor is supervised by measured UPMEM executions, and the artifact’s generation scripts make measured logs part of the workflow.
- **Why it matters for CIM compiler/IR work:** This is valuable for stacks that need hardware-calibrated backend costs without deriving a full analytical timing model for every DPU/runtime effect.
- **Reusable lesson:** The cleanest reuse path is to treat the model as a calibration plugin: emit feature rows from a compiler, collect hardware labels for a calibration set, then train/fine-tune for a new benchmark family.

### Insight 5 — DPU/tasklet fields expose the useful hardware contract

- **Observation:** The model directly varies DPU and tasklet counts, while deeper UPMEM details such as MRAM/WRAM transfer timing and tasklet synchronization appear indirectly through measurements.
- **Why it matters for CIM compiler/IR work:** It shows that a small number of hardware-resource fields can already carry predictive value for digital CNM, even when detailed runtime behavior remains embedded in benchmark execution.
- **Reusable lesson:** A future IR could use DPU/tasklet/resource fields as typed placement attributes, then attach learned cost features after lowering.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `ComputerSystemsLaboratory/LearnCNM2Predict` on GitHub. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict))  
- **License:** MIT License. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/LICENSE))  
- **Last checked:** 2026-05-15.  
- **What the artifact contains:** Python model/training/inference utilities, bash scripts for UPMEM data generation and embedding generation, example datasets, example pretrained models, and benchmark subdirectories for PrIM, PIM-ML, and Cinnamon-derived variants. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict))  
- **What the artifact appears to omit or leave embedded:** no tagged GitHub release is shown; exact full-paper figure reproduction depends on matching UPMEM hardware or simulator setup, pass files, generated logs, seeds, and experiment-specific fine-tuning settings. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict))  
- **Minimal documented workflow:** README stages include generating UPMEM data, generating embeddings, updating embeddings with UPMEM measurements, generating datasets, training, and predicting. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict))  
- **Whether paper figures appear reproducible from the artifact:** partial. The code paths and examples are public, but the README alone does not fully specify a one-command reproduction of all paper figures and measured UPMEM datasets.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | README and scripts document workflow arguments; a formal schema for every feature column is not presented as a standalone spec. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict)) |
| Intermediate representation serialized | Partial | YAML/CSV embeddings and normalized datasets are serialized, but they are not named as a compiler IR. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/bash/x86_embeddings_generator.sh)) |
| Mapping decisions inspectable | Partial | DPU/tasklet/pass/parameter choices are inspectable; detailed mapping from source operations to DPU memory actions is implicit in benchmark code and execution. |
| Schedule inspectable | Partial | Compiler pass/configuration IDs and pass files are part of the workflow; ordered runtime schedules are not the model’s exposed object. |
| Hardware config explicit | Yes | UPMEM hardware hierarchy is described in the paper; DPU/tasklet counts are explicit fields in experiments and scripts. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Precision / bit-slice assumptions explicit | N/A / Partial | Analog bit slicing is not applicable to UPMEM; quantized benchmark variants exist for PIM-ML, but precision is not a propagated IR type. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |
| Cost model inspectable | Yes | The MLP architecture, training, fine-tuning, and metric utilities are public. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/blob/main/py/model.py)) |
| Simulator backend documented | Partial | README mentions UPMEM simulator or hardware; embedded benchmark READMEs require the UPMEM SDK and real modules or simulator-compatible execution. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict)) |
| Generated code / instruction stream inspectable | Partial | Benchmark source and disassembled opcode histograms are inspectable; ordered instruction streams are summarized into counts. |
| Provenance from source op to backend action | Unknown / Partial | Program variant provenance exists at file/config level; source operator to backend action provenance is not the exposed feature boundary. |
| Reproduction scripts available | Partial | Data-generation, embedding, training, and inference scripts are public, with example datasets and models. Full paper reproduction requires additional environment matching. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict)) |
| Calibration source documented | Partial | The paper documents hardware setup and measured UPMEM execution; complete raw calibration coverage should be verified in the artifact during reproduction. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) |

### 8.3 Integration helper

- **As frontend:** Reuse is indirect. The work can ingest compiled benchmark artifacts and feature records, but it does not provide a general CIM frontend for importing graphs, tensor programs, or loop nests.
- **As IR inspiration:** The most useful abstraction is the feature-record boundary: opcode histogram plus hardware/compiler/workload fields. A future IR could make this a documented cost-model sidecar.
- **As mapper/scheduler:** It can rank enumerated variants, but mapping legality and schedule construction would need to come from another compiler or benchmark-generation layer.
- **As cost model:** This is the strongest integration role. Runtime and speedup prediction can become a backend plugin for UPMEM-like digital CNM, especially when calibrated with local hardware measurements.
- **As backend:** The artifact wraps UPMEM benchmark build/run workflows rather than exposing a reusable codegen backend.
- **As benchmark:** The benchmark set and generated variants are useful for evaluating learned cost models over UPMEM configurations.
- **As validation source:** Real UPMEM measurements provide valuable calibration data for other predictors or compiler-search systems.

**Integration effort estimate: Medium.**  
Integration would be most direct through the dataset interface: emit compatible opcode/configuration feature rows from an existing compiler or build system, then fine-tune the public model. Reuse becomes more involved when a stack needs source-level provenance, schedule legality, or memory-transfer modeling, because those semantics are compressed away before the predictor boundary. For UPMEM-style cost ranking, the artifact provides a practical starting point; for full compiler/IR integration, a small adapter plus a richer provenance sidecar would be useful.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| Devic et al., “To PIM or not to PIM” | PIM/CNM performance decision support | Closer to analytical or decision modeling for PIM suitability, while LearnCNM2Predict uses transfer learning over measured UPMEM variants. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | Separate analytical performance models from learned feature-record cost models. |
| Gómez-Luna et al., PrIM benchmark suite | UPMEM benchmarking and workload coverage | PrIM supplies real PIM workloads and baselines; LearnCNM2Predict uses benchmark variants as supervised data for a predictor. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/tree/main/benchmarks/prim-benchmarks)) | Benchmark suites can become calibration corpora for learned compiler cost models. |
| PIM-ML | Machine-learning workloads on UPMEM | PIM-ML contributes UPMEM implementations of ML algorithms; LearnCNM2Predict treats selected PIM-ML variants, including quantized/non-quantized variants, as prediction targets. ([GitHub](https://github.com/ComputerSystemsLaboratory/LearnCNM2Predict/tree/main/benchmarks/pim-ml)) | Workload repositories should be classified separately from cost-model layers built on them. |
| Cinnamon / CINM | Generating or transforming UPMEM/CNM program variants | Cinnamon-generated codes are used to test robustness and structural variation; LearnCNM2Predict predicts performance over generated variants rather than defining the generator’s IR. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | Generated variants are a useful bridge between compiler transformation space and learned cost modeling. |
| ATFormer | Transfer learning for performance prediction | Similar transfer-learning motivation, but aimed at tensor-program/device performance rather than UPMEM CNM benchmark variants. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | Keep transfer-learning performance models distinct by their feature boundary and target backend. |
| TransferTuning | Transfer of tuning knowledge across tensor programs | Shares the idea of reusing optimization knowledge across tasks; LearnCNM2Predict transfers prediction models across CNM applications/configurations. ([cfaed.tu-dresden.de](https://cfaed.tu-dresden.de/files/Images/people/chair-cc/publications/2507_daSilva_SAMOS.pdf)) | In the corpus, distinguish search-policy transfer from supervised cost-model transfer. |

## 10. Corpus-ready final takeaway

- LearnCNM2Predict is best classified as a **learned cost-model / performance-prediction layer** for UPMEM-style digital CNM.
- Its strongest reusable stack layer is the **feature-record interface**: opcode histogram plus DPU/tasklet, compiler-pass, workload-parameter, and measured-label fields.
- The evidenced scope is UPMEM C/C++ benchmark variants from PrIM, PIM-ML, and Cinnamon-generated code, measured on a 2048-DPU UPMEM platform.
- The paper’s first-class CIM objects are compact digital-CNM configuration fields, especially **DPU count**, **tasklet count**, **compiler configuration**, and **program instruction mix**.
- The hidden IR is distributed across embedding files, normalized CSV datasets, script naming conventions, scaler state, pass/configuration identifiers, and trained model weights.
- The artifact is public under MIT and includes model code, scripts, examples, and benchmark directories; exact full-paper reproduction requires matching UPMEM/simulator setup and experiment configuration.
- Integration is most direct as a **backend cost-model plugin** or **benchmark calibration source**, not as a graph/loop/memory compiler IR.
- For value-trajectory IR research, the work is most relevant as a learned prediction sidecar; trajectory-level rewrites would need an upstream representation that preserves value identity, memory-domain transitions, and reduction/storage paths before histogramming.
