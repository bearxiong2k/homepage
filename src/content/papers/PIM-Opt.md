---
slug: pim-opt
title: "PIM-Opt: Demystifying Distributed Optimization Algorithms on a Real-World Processing-In-Memory System"
subtitle: "Scoped CIM stack note"
year: 2024
venue: "PACT 2024"
authors_or_group: "Steve Rhyner, Haocong Luo, Juan Gómez-Luna, Mohammad Sadrosadati, Jiawei Jiang, Ataberk Olgun, Harshita Gupta, Ce Zhang, Onur Mutlu"
summary: >-
  PIM-Opt is a real-hardware UPMEM PIM study and reproducible evaluation framework for distributed optimization in linear ML training. Its main contribution is the implementation and measurement of MA-SGD, GA-SGD, and ADMM for logistic regression and SVM training on YFCC100M-HNfc6 and Criteo, including UPMEM execution, CPU/GPU baselines, preprocessing/postprocessing scripts, and figure-generation artifacts. The stack contribution is strongest at the runtime, benchmarking, and hardware-software co-design boundary: the paper makes host–DPU data movement, parameter-server synchronization, DPU/tasklet parallelism, and fixed-point backend constraints visible as performance-critical objects. For CIM compiler/IR research, PIM-Opt is most useful as a real-system backend and benchmark corpus rather than as an explicit IR stack: its reusable semantics are distributed across C structs, Makefiles, experiment scripts, timing logs, and host aggregation code. ([arXiv](https://arxiv.org/pdf/2404.07164v2))
links:
  paper: https://arxiv.org/pdf/2404.07164v2
  artifact: https://github.com/CMU-SAFARI/PIM-Opt
  docs:
  code:
technology:
  - "UPMEM"
  - "DRAM-PIM"
  - "digital-CIM"
  - "real-hardware-PIM"
workloads:
  - "logistic-regression-training"
  - "linear-SVM-training"
  - "YFCC100M-HNfc6"
  - "Criteo-1TB-click-logs"
  - "distributed-optimization"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A5, A2]
axis_B: [B7, B1, B4]
axis_C_first_class_objects:
  - "UPMEM_DPU"
  - "tasklet"
  - "MRAM"
  - "WRAM"
  - "host_parameter_server"
  - "host_DPU_transfer"
  - "data_partition"
  - "minibatch"
  - "local_model"
  - "global_model"
  - "gradient"
  - "fixed_point_value"
  - "sigmoid_LUT"
axis_D_rewrite_objects:
  - "runtime_state"
  - "synchronization_schedule"
  - "data_partitioning"
  - "batch_size"
  - "DPU_tasklet_configuration"
  - "fixed_point_backend_configuration"
artifact:
  status: "public_artifact_found"
  url: "https://github.com/CMU-SAFARI/PIM-Opt"
  license: "MIT"
  last_checked: "2026-05-15"
integration_roles:
  - "benchmark"
  - "backend"
  - "cost_model"
  - "validation"
  - "IR_inspiration"
reproducibility_level: high
notes:
  - "Best treated as a real-hardware UPMEM runtime/benchmark artifact rather than an explicit compiler IR stack."
  - "Reusable semantics are clearest in host-DPU communication phases, distributed optimizer state, DPU/tasklet configuration, and timing logs."
  - "ADC/DAC, analog partial sums, crossbar mapping, and bit-sliced reconstruction are not applicable to the demonstrated UPMEM digital DRAM-PIM platform."
takeaways: []
---

# PIM-Opt — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 — Programming / runtime / benchmark on real hardware** | PIM-Opt implements and evaluates centralized distributed optimization algorithms on a real UPMEM PIM system, with CPU/GPU baselines and an artifact intended to reproduce the paper’s figures. The paper’s strongest stack slice is the host–DPU runtime/benchmarking layer for distributed ML training. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Secondary stack role, Axis A | **A5 — Narrow end-to-end co-design**, with measurement-oriented **A2** aspects | The end-to-end path spans dataset preprocessing, UPMEM C kernels, host orchestration, CPU/GPU baselines, postprocessing, and plotting, but the demonstrated scope is intentionally centered on LR/SVM training with MA-SGD, GA-SGD, and ADMM. Timing breakdowns expose host–DPU communication and synchronization as first-order costs. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Middle-layer style, Axis B | **B7 Runtime-state abstraction**, **B1 Config-as-IR**, lightweight **B4 Hardware-resource IR** | The main reusable “middle” objects are runtime state and experiment configuration: DPU count, tasklet count, batch size, fixed-point type, DPU argument structs, local/global model state, gradients, and host-side aggregation. These are represented in scripts, Makefiles, C structs, and logs rather than a standalone compiler IR. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h)) |
| First-class CIM objects, Axis C | UPMEM DPU, tasklet, MRAM, WRAM, host parameter server, host–DPU transfer, data partition, minibatch, local model, global model, gradient, fixed-point value, sigmoid LUT | The paper names the UPMEM hierarchy and execution model directly, and the artifact exposes DPU/tasklet counts, MRAM/WRAM movement, fixed-point constants, and host aggregation code. ADC/DAC, crossbar, analog sensing, and bit-sliced reconstruction are not applicable to this UPMEM digital DRAM-PIM setting. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Rewrite object, Axis D | **Runtime state / synchronization schedule / data partitioning / fixed-point kernel configuration** | The work varies algorithm choice, batch size, DPU count, tasklet-level data parallelism, and synchronization frequency. It does not foreground graph or loop rewriting; the effective transformations are distributed-training schedule choices and backend-specific implementation choices. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Best corpus tags | `UPMEM`, `DRAM-PIM`, `digital-PIM`, `real-hardware`, `distributed-ML-training`, `LR-SVM`, `MA-SGD`, `GA-SGD`, `ADMM`, `host-DPU-communication`, `benchmark-artifact` | Tags reflect the evidenced technology, workload, algorithms, and reusable benchmark/runtime contribution. |
| Closest comparison baselines | SimplePIM; PIM-ML / UPMEM gradient-descent ML work; DNNs on commercial PIM; pLUTo / TransPimLib-style UPMEM support libraries; LambdaML-style distributed ML baselines | These are close by platform or workload: UPMEM programming support, UPMEM ML kernels, commercial PIM evaluation, LUT/runtime libraries, and distributed ML training baselines. The PIM-Opt artifact also acknowledges reused or repurposed code from PrIM, PIM-ML, LambdaML, TransPimLib, and RowPress. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |

---

## 2. One-paragraph public summary

PIM-Opt is a real-hardware UPMEM PIM study and reproducible evaluation framework for distributed optimization in linear ML training. Its main contribution is the implementation and measurement of MA-SGD, GA-SGD, and ADMM for logistic regression and SVM training on YFCC100M-HNfc6 and Criteo, including UPMEM execution, CPU/GPU baselines, preprocessing/postprocessing scripts, and figure-generation artifacts. The stack contribution is strongest at the runtime, benchmarking, and hardware-software co-design boundary: the paper makes host–DPU data movement, parameter-server synchronization, DPU/tasklet parallelism, and fixed-point backend constraints visible as performance-critical objects. For CIM compiler/IR research, PIM-Opt is most useful as a real-system backend and benchmark corpus rather than as an explicit IR stack: its reusable semantics are distributed across C structs, Makefiles, experiment scripts, timing logs, and host aggregation code. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

---

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| PIM-Opt implements representative centralized parallel SGD algorithms on a real-world PIM system. | Abstract / contributions | Algorithm; experiment; artifact | The paper describes MA-SGD, GA-SGD, and ADMM with a parameter-server organization, and the artifact contains UPMEM directories for ADMM, GA-SGD, and MA-SGD. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | Demonstrated for centralized distributed training of LR/SVM workloads on UPMEM DPUs; decentralized algorithms are discussed as future hardware-enabled directions rather than implemented scope. |
| The work evaluates distributed optimization algorithms for large-scale linear classification. | Abstract / intro / methodology | Equation; experiment | The ML objective is formalized for binary linear classification with loss plus regularization, and experiments cover LR and SVM on YFCC100M-HNfc6 and Criteo. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The evidenced workload family is linear binary classification; extension to DNN training or general tensor workloads would require additional kernels and orchestration. |
| UPMEM PIM can outperform CPU/GPU baselines for selected algorithm/workload combinations. | Introduction / evaluation | Experiment | The paper reports comparisons against CPU and GPU baselines, including cases where PIM is faster and cases where CPU/GPU behavior depends on dataset, algorithm, and communication intensity. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The demonstrated comparisons use specific hardware: a UPMEM system, a dual-socket AMD EPYC CPU baseline, and an NVIDIA A100 GPU baseline. The GPU baseline is minibatch SGD rather than full MA-SGD/GA-SGD/ADMM parity. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| ADMM reduces communication pressure compared with MA-SGD and GA-SGD. | Motivation / evaluation | Algorithm; experiment | The workflow shows that ADMM synchronizes after local subproblem processing, while MA-SGD and GA-SGD synchronize more frequently; timing breakdowns identify communication/synchronization as a major performance component. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The evidence is strongest for the two evaluated datasets, two linear models, and the UPMEM host–DPU parameter-server topology. |
| Host–DPU communication and synchronization are central bottlenecks on current UPMEM hardware. | Motivation / evaluation / implications | Experiment; hardware analysis | The UPMEM architecture has no direct inter-DPU communication; all inter-DPU communication routes through the host. The paper’s breakdowns quantify expensive host-DPU traffic and synchronization time. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The reusable boundary is clearest as a communication-aware backend model for UPMEM-like PIM, rather than a technology-independent CIM communication IR. |
| PIM-Opt provides an open-source artifact for reproduction. | Abstract / artifact appendix / GitHub README | Code/artifact; documentation | The paper states the code is open source; the artifact appendix lists preprocessing, UPMEM experiments, baselines, postprocessing, and plotting, while the GitHub repository contains corresponding folders and scripts. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The paper-level and repository-level evidence support reproducibility of the published workflow, subject to access to UPMEM hardware, large datasets, Slurm/tmux-style execution, and substantial disk/runtime resources. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| The UPMEM implementation uses backend-aware arithmetic choices. | Methodology / system implementation / code | Code/artifact; paper-only explanation | The paper states that UPMEM uses 32-bit fixed-point values because native floating point is unavailable, and uses a LUT for the LR sigmoid. The artifact exposes fixed-point constants and UPMEM build flags. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | The evidenced numeric path is hand-coded for the evaluated algorithms; a reusable type system for numeric formats is not serialized as a separate compiler object. |
| The artifact can reproduce all reported figures. | Artifact appendix / README | Documentation; code/artifact | The artifact appendix and README state that scripts and notebooks are sufficient to reproduce Figures 2 and 4–13. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | This note did not independently execute the artifact. Artifact-level confirmation would require the specified UPMEM/CPU/GPU resources, datasets, and long-running workflows. |

---

## 4. Stack anatomy

```text
Input / frontend:
  Object: YFCC100M-HNfc6 and Criteo datasets after preprocessing.
  Kind: dataset files plus preprocessing scripts, not a model/program IR.
  Inspectability/reuse: partially documented through README and preprocessing scripts; reusable mainly as benchmark preparation flow. The paper reports YFCC100M-HNfc6 and Criteo as the two large datasets. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

Middle representation:
  Object: experiment configuration plus C data structures such as dpu_arguments_t, dpu_info_t, and model_average_parallel_t.
  Kind: config-as-IR / runtime-state structs.
  Inspectability/reuse: inspectable in code, but not serialized as a standalone IR schema. Fields include data size, feature fractions, batch sizes, learning rate, regularization term, transfer counts, and task epochs. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h))

Mapping or scheduling state:
  Object: DPU allocation, DPU count, tasklet count, dataset partition, minibatch schedule, epoch/batch loop, local model or gradient synchronization.
  Kind: runtime schedule embedded in host C code, UPMEM Makefiles, and shell scripts.
  Inspectability/reuse: partially inspectable through Makefile flags, host loops, and timing logs. The paper describes distinct partitioning and synchronization schedules for MA-SGD, GA-SGD, and ADMM. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

Hardware abstraction:
  Object: UPMEM host + DRAM-PIM module hierarchy, DPU, MRAM, WRAM, tasklet, host-DPU transfer channel.
  Kind: concrete hardware-resource model rather than abstract architecture template.
  Inspectability/reuse: well described in the paper and encoded through UPMEM SDK calls and compile-time knobs such as NR_DPUS and NR_TASKLETS. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

Backend / simulator / codegen:
  Object: UPMEM C host code and DPU C kernels compiled with the UPMEM SDK.
  Kind: real-hardware backend; no simulator-centered backend is evidenced.
  Inspectability/reuse: source code is public; generated DPU instruction streams are not presented as a corpus object. The host code allocates DPUs, loads DPU binaries, transfers data and model state, launches DPUs, retrieves local state, and averages models. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/host/app.c))

Output artifact:
  Object: timing logs, accuracy/AUC/loss measurements, model states, postprocessed plots, paper figure notebooks.
  Kind: benchmark output and plotting artifact.
  Inspectability/reuse: documented through postprocessing and notebook workflow; README states the paper plots notebook reproduces the figures. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

Evaluation loop:
  Object: preprocessing → UPMEM run → CPU/GPU baseline run → postprocessing → notebook figure generation.
  Kind: reproducibility workflow.
  Inspectability/reuse: shell-script-driven workflow; requires specific hardware, datasets, and long-running execution environment. ([arXiv](https://arxiv.org/pdf/2404.07164v2))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of UPMEM build flags, dataset layout files, C structs passed to DPUs, host-side aggregation buffers, timing log conventions, and algorithm-specific directory structure. The paper foregrounds distributed optimization behavior on real PIM hardware, while the reusable semantics are most visible in the `dpu_arguments_t` fields, Makefile knobs, host transfer/launch/retrieve sequence, and timing breakdowns. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h))

---

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 — Programming / runtime / benchmark on real hardware.**  
PIM-Opt owns the runtime/benchmark slice from preprocessed training data to measured training behavior on real UPMEM DPUs. Its input is a prepared LR/SVM training workload; its output is measured runtime, communication, accuracy/AUC, and scalability behavior for MA-SGD, GA-SGD, and ADMM. The artifact explicitly contains preprocessing, UPMEM experiments, CPU/GPU baselines, postprocessing, and plotting. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

**Secondary: A5 — Narrow end-to-end co-design.**  
The work connects algorithm choice, UPMEM arithmetic limitations, DPU/tasklet execution, host-DPU synchronization, and dataset/model behavior. The demonstrated end-to-end stack is narrow and concrete: centralized distributed optimization for linear classification on UPMEM. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

**Measurement-oriented A2 aspect.**  
PIM-Opt is not primarily a simulator or analytic cost-model paper, but it provides measurement-backed cost evidence: expensive host-DPU communication, synchronization, DPU kernel time, data-transfer time, and algorithm-dependent communication frequency. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

### 5.2 Axis B — middle-layer style

**B7 — Runtime-state abstraction.**  
The named middle state is the distributed training state: local model, global model, gradients, bias, minibatch ID, epoch, DPU-local partitions, and host aggregation buffers. Decisions made here include synchronization frequency, whether the host aggregates models or gradients, and how often global parameters are redistributed. MA-SGD, GA-SGD, and ADMM differ mainly in this runtime-state trajectory. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

**B1 — Config-as-IR.**  
The artifact uses scripts and Makefiles as an experiment/configuration boundary. Fields such as `NR_DPUS`, `NR_TASKLETS`, type selection, batch size, scaling, and approximate-execution flags are compile- or run-configuration objects. The DPU argument struct also carries algorithm-relevant runtime parameters such as feature fractions, batch sizes, learning rate, regularization term, and transfer sizes. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h))

**B4 — Hardware-resource IR, lightweight and concrete.**  
The hardware-resource layer is UPMEM-specific: DPU, MRAM, WRAM, tasklet, host memory, and host-DPU transfer. The paper explains the UPMEM hierarchy and the constraint that inter-DPU communication must pass through the host. The resource abstraction is concrete and executable rather than a portable hardware IR. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

**Single upstream-readable artifact?**  
There is no single artifact that upstream compiler passes could read, verify, and rewrite as a canonical IR. The closest reusable boundary is the experiment configuration plus host/DPU structs and logs.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable** | UPMEM is a digital DRAM-PIM system with DPUs attached to DRAM banks, not an analog crossbar/macro CIM design. The paper describes modules, ranks, chips, banks, MRAM, and DPUs. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Bit-slicing / bit significance | **Not applicable / implicit numeric representation** | The evaluated UPMEM path uses 32-bit fixed-point data/model values; bit-slice mapping is not a first-class object. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| ADC/DAC precision or sensing | **Not applicable** | The target is digital UPMEM DRAM-PIM; ADC/DAC sensing is not part of the demonstrated execution model. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Analog-to-digital or domain transition | **Not applicable** | Values move through host memory, MRAM, WRAM, and DPU arithmetic rather than analog accumulation/sensing domains. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Peripheral circuits as path nodes | **Implicit / hardware-specific** | The paper discusses UPMEM host-DPU channels and DPU/MRAM/WRAM organization, but not peripheral circuit path nodes as compiler objects. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Partial-sum accumulation path | **Implicit algorithmic state** | Dot-product work is parallelized across tasklets and accumulated in software; partial sums are not exposed as a CIM accumulation-path IR. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Reconstruction / shift-add tree | **Not applicable / fixed-point arithmetic embedded in code** | Fixed-point constants are visible in code, but reconstruction trees are not a named stack object. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h)) |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for runtime state and batching; sparsity workload-specific** | Batches, epochs, DPU-local partitions, local/global models, gradients, and transfer sizes are explicit in paper/code. Criteo is a sparse high-dimensional workload, but sparsity is handled as workload/data behavior rather than a general sparse IR. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Value trajectory / flow path | **Approximated at system-dataflow level** | The workflow names movement from host to DPU MRAM, DPU execution, host retrieval, aggregation, and redistribution. It does not type value identity through fine-grained arithmetic stages. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |

### 5.4 Axis D — rewrite object

The tool rewrites or varies **distributed training runtime structure**, not an operator graph or tensor IR. The practical rewrite objects are:

- algorithm selection: MA-SGD vs GA-SGD vs ADMM;
- data partitioning across DPUs;
- minibatch size and epoch schedule;
- synchronization frequency and aggregation object: model vs gradient;
- DPU/tasklet configuration;
- fixed-point backend parameters and LUT-backed sigmoid path.

Legal transformations in the demonstrated framework are experiment and implementation variants that preserve the LR/SVM objective, dataset semantics, model parameters, labels/features, fixed-point scaling assumptions, and host-visible convergence/evaluation metrics. The main equivalence exploited is that distributed workers can process partitions and periodically reconcile model or gradient state through a centralized host parameter server. The representation is especially well suited to studying communication/computation tradeoffs across distributed optimizers; expressing graph-level lowering, alternate CIM array binding, inter-DPU collectives, or value-trajectory rewrites would likely require an additional abstraction for hardware topology, collectives, numeric format typing, and backend path semantics.

---

## 6. Technical mechanism reading

### 6.1 Optimization problem and workloads

PIM-Opt targets binary linear classification. The paper formalizes the training objective as empirical risk minimization over samples, with logistic regression using binary cross-entropy and SVM using hinge loss; it also includes regularization in the loss formulation. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

The evaluated workloads combine:

- algorithms: **MA-SGD**, **GA-SGD**, **ADMM**;
- models: **logistic regression** and **linear SVM**;
- datasets: **YFCC100M-HNfc6** and **Criteo**;
- platforms: real UPMEM PIM, CPU baseline, and GPU baseline. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

### 6.2 Distributed optimization as the real scheduling object

The key scheduling distinction is how often workers communicate through the host parameter server:

- **MA-SGD:** each DPU computes a local model update and the host averages local models.
- **GA-SGD:** each DPU computes gradients over a fraction of a minibatch and the host averages gradients.
- **ADMM:** each DPU processes local subproblems and synchronizes local models less frequently through consensus-style coordination. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

For a compiler/IR reader, the important mechanism is that the “schedule” is not a loop transformation over tensor operators; it is a synchronization trajectory over distributed runtime state. The paper’s central evidence is that changing this trajectory can dominate runtime because UPMEM DPUs cannot communicate directly with one another, so DPU-to-DPU coordination is mediated by the host. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

### 6.3 UPMEM backend contract

The backend contract is concrete and hardware-specific:

- a host CPU controls conventional memory and UPMEM PIM modules;
- each UPMEM bank includes MRAM plus a DPU;
- each DPU has WRAM scratchpad and supports multiple hardware tasklets;
- MRAM is DPU-local, and inter-DPU communication goes through host memory;
- DPU programs are written in C and built with the UPMEM SDK/runtime. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

This contract turns host-DPU movement into a first-order program object. The host code allocates DPUs, loads DPU code, transfers dataset/model state, launches DPU execution, retrieves local model state, averages results, and logs timing for load, kernel, retrieve, and model-average phases. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/host/app.c))

### 6.4 Tasklet-level mechanism

Within each DPU, PIM-Opt uses tasklet-level parallelism. The paper states that 16 tasklets per DPU parallelize dot products and MRAM/WRAM transfers by distributing features across tasklets. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

This is a backend-specific software schedule. It is important for corpus classification because it exposes an execution-resource mapping — features to tasklets, DPU-local data to MRAM/WRAM, local updates to host aggregation — without presenting a separate loop/tensor schedule IR.

### 6.5 Numeric assumptions

UPMEM does not provide native floating-point arithmetic in the same way as the CPU/GPU baselines used in the paper; PIM-Opt uses 32-bit fixed-point values on UPMEM, while CPU/GPU baselines use FP32. The LR sigmoid is implemented through a lookup table because UPMEM lacks native transcendental support. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

The artifact exposes fixed-point-related constants and type configuration in code and build settings. This is relevant to IR work because numeric format is an implicit backend type constraint rather than a separately typed IR value. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h))

### 6.6 Evaluation mechanism

The evaluation loop measures total training behavior, communication/synchronization, data movement, DPU kernel execution, accuracy/loss/AUC, strong/weak scaling, and CPU/GPU comparison. The paper’s reported breakdowns show that communication and synchronization can dominate MA-SGD and GA-SGD, while ADMM’s lower synchronization frequency can improve runtime for the evaluated configurations. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

The artifact implements the same loop as a reproducibility package: preprocessing scripts, UPMEM run scripts, CPU/GPU baseline scripts, postprocessing, and a plotting notebook. ([arXiv](https://arxiv.org/pdf/2404.07164v2))

---

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The parameter server is the de facto interconnect model

- **Observation:** PIM-Opt’s distributed algorithms are shaped by the fact that DPUs cannot communicate directly; the host gathers and redistributes model or gradient state. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  
- **Why it matters for CIM compiler/IR work:** A CIM stack that targets distributed PIM needs to represent not only memory hierarchy, but also legal collective paths and synchronization topology.  
- **Reusable lesson:** A future IR could make “collective route” and “aggregation owner” first-class fields, especially for host-mediated PIM systems.

### Insight 2 — Algorithm choice is a communication-schedule rewrite

- **Observation:** MA-SGD, GA-SGD, and ADMM differ less in frontend model structure than in what state is synchronized, how often it is synchronized, and how much host-DPU traffic is induced. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  
- **Why it matters for CIM compiler/IR work:** For memory-centric accelerators, the profitable rewrite may be at the distributed optimization trajectory level rather than the operator-graph level.  
- **Reusable lesson:** Corpus metadata should distinguish graph rewrites from runtime-state rewrites; PIM-Opt is a clear example of the latter.

### Insight 3 — The artifact’s configs and structs act as a practical IR boundary

- **Observation:** `dpu_arguments_t`, Makefile flags, run scripts, and result-log conventions carry the decisions needed to reproduce a run: DPU count, tasklet count, data sizes, batch sizes, learning rate, regularization, transfer sizes, and fixed-point type. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h))  
- **Why it matters for CIM compiler/IR work:** Even without a named IR, the stack has a stable set of parameters that define the backend contract.  
- **Reusable lesson:** These fields could be lifted into a small schema for UPMEM benchmark reproducibility or for wrapping PIM-Opt as a backend in a larger compiler stack.

### Insight 4 — Real-hardware timing logs expose the backend contract better than a diagram alone

- **Observation:** The code logs host-to-DPU model loading, DPU kernel execution, retrieval, and host model averaging, while the paper analyzes these phases in communication/computation breakdowns. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/host/app.c))  
- **Why it matters for CIM compiler/IR work:** Backend contracts need measurable phase boundaries, not only resource names.  
- **Reusable lesson:** A compiler-integrated benchmark could preserve these phase labels as provenance from high-level schedule decisions to hardware events.

### Insight 5 — Fixed-point and LUT handling reveal type-system pressure

- **Observation:** UPMEM execution uses 32-bit fixed-point arithmetic and LUT-backed sigmoid evaluation, while CPU/GPU baselines use FP32. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  
- **Why it matters for CIM compiler/IR work:** Numeric support is part of the backend contract, and arithmetic substitution can affect accuracy, portability, and reproducibility.  
- **Reusable lesson:** A future IR could attach numeric format, emulation path, and LUT provenance to operations that cross backend boundaries.

---

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL or identifier:** GitHub repository `CMU-SAFARI/PIM-Opt`; Zenodo identifier `10.5281/zenodo.12747665`. The paper and README point to public artifact resources. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  
- **License:** MIT license. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/LICENSE.txt))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** preprocessing scripts, UPMEM C code, CPU/GPU baseline code, postprocessing scripts, plotting notebook, and folders for ADMM, GA-SGD, and MA-SGD. ([GitHub](https://github.com/CMU-SAFARI/PIM-Opt))  
- **What the artifact appears to omit:** a standalone compiler IR, simulator backend, portable mapping schema, release-tagged package, and ISA-level generated instruction traces. The repository page reports no published releases. ([GitHub](https://github.com/CMU-SAFARI/PIM-Opt))  
- **Minimal documented workflow:** obtain datasets, run preprocessing, run UPMEM experiments, run baseline experiments, postprocess logs, and use `paper_plots.ipynb` to regenerate figures. The paper artifact appendix and README document these stages. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  
- **Whether paper figures appear reproducible from the artifact:** The artifact documentation states that the scripts and notebook are sufficient to reproduce Figures 2 and 4–13. This note did not independently execute the workflow; reproduction depends on the specified UPMEM, CPU/GPU, dataset, Slurm/tmux, and storage/runtime environment. ([arXiv](https://arxiv.org/pdf/2404.07164v2))  

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | Dataset acquisition and preprocessing workflow are documented; exact intermediate binary/layout conventions are mostly exposed through scripts and code. ([GitHub](https://github.com/CMU-SAFARI/PIM-Opt)) |
| Intermediate representation serialized | **Partial** | No standalone IR; configuration and runtime structs serve as inspectable intermediate state. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h)) |
| Mapping decisions inspectable | **Partial** | DPU/tasklet counts, partition sizes, batch sizes, and transfer sizes are visible in scripts, Makefiles, structs, and host code. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/common_support/common.h)) |
| Schedule inspectable | **Partial** | Algorithm-specific synchronization schedules are described in the paper and embedded in host/DPU code. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Hardware config explicit | **Yes** | UPMEM system details and CPU/GPU baselines are documented; compile flags expose DPU/tasklet parameters. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Precision / bit-slice assumptions explicit | **Partial** | Fixed-point UPMEM arithmetic is explicit; bit slicing is not applicable to this digital UPMEM setting. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Cost model inspectable | **Partial** | The work uses measured timing breakdowns rather than a standalone analytic cost model. Timing phases are visible in paper/code. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Simulator backend documented | **N/A** | The primary backend is real UPMEM hardware, not a simulator. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Generated code / instruction stream inspectable | **Partial** | Source C and build flow are public; ISA-level DPU instruction streams are not presented as corpus objects. ([GitHub](https://raw.githubusercontent.com/CMU-SAFARI/PIM-Opt/main/upmem_ml_coding/UPMEM/MA-SGD/YFCC100M-HNfc6/LR/Makefile)) |
| Provenance from source op to backend action | **Partial** | Provenance is clear at the algorithm/run phase level, but not as an operator-to-instruction mapping graph. |
| Reproduction scripts available | **Yes** | README and artifact appendix list preprocessing, UPMEM, baseline, postprocessing, and plotting scripts. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |
| Calibration source documented | **Yes** | Calibration is real-system measurement on specified UPMEM/CPU/GPU systems; no SPICE/RTL calibration is involved. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) |

### 8.3 Integration helper

- **As frontend:** Reuse is most direct through the dataset preprocessing and LR/SVM workload definitions. It is not a general parser/importer for neural-network graphs or tensor programs.
- **As IR inspiration:** The most useful abstractions are runtime-state records: DPU partition, local model, global model, gradient, minibatch schedule, transfer phase, and synchronization owner.
- **As mapper/scheduler:** The MA-SGD/GA-SGD/ADMM schedules can be adapted as examples of communication-aware distributed runtime scheduling for PIM.
- **As cost model:** The timing breakdowns and phase labels can become empirical backend plugins for host-DPU transfer, DPU kernel time, retrieval, and aggregation.
- **As backend:** The UPMEM code can be wrapped as a concrete backend for linear-model training experiments, with adapters around dataset layout, configuration, and result logs.
- **As benchmark:** The artifact is valuable as a benchmark suite for real UPMEM ML training, especially for comparing communication-heavy vs communication-light distributed optimizers.
- **As validation source:** Real UPMEM measurements can calibrate communication and synchronization models in other tools, provided those tools model a similar host-mediated DPU topology.

**Integration effort estimate: Medium.**  
Integration would be most direct through the existing scripts, C structs, and log formats. A small adapter could extract run configuration, timing phases, and synchronization events into a structured schema. General compiler integration would require additional representation work because the artifact is organized around hand-written workloads and experiment scripts rather than a reusable compiler IR.

---

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **SimplePIM** | UPMEM programming support and software stack usability | SimplePIM is closer to a programming/compiler support layer for UPMEM; PIM-Opt is closer to a measured ML training benchmark and algorithm-hardware co-design study. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | Keep UPMEM software frameworks separate from UPMEM workload/evaluation artifacts, even when both expose backend constraints. |
| **PIM-ML / UPMEM ML training work** | ML workloads on UPMEM, including gradient-descent-style training | PIM-Opt’s distinct focus is centralized distributed optimization across MA-SGD, GA-SGD, and ADMM, plus CPU/GPU comparisons and reproducibility workflow. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | Corpus entries should distinguish “ML kernel on PIM” from “distributed optimizer runtime on PIM.” |
| **DNNs on commercially available PIM** | Empirical evaluation on commercial PIM hardware | That line of work targets DNN inference/training behavior on commercial PIM; PIM-Opt targets linear-model distributed optimization and host-DPU synchronization. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | Hardware-backed evaluation papers can serve different IR roles depending on whether the first-class object is tensor execution, runtime state, or communication schedule. |
| **pLUTo / LUT support for UPMEM** | Backend-aware handling of expensive arithmetic through lookup tables | PIM-Opt uses a sigmoid LUT as part of its LR backend path, but the paper’s main object is distributed optimization rather than LUT synthesis. ([arXiv](https://arxiv.org/pdf/2404.07164v2)) | Numeric emulation choices should be tracked as backend contracts even when they are not the paper’s central contribution. |
| **LambdaML-style distributed ML systems** | Distributed ML training and parameter-server-style coordination | LambdaML is a distributed ML software baseline family; PIM-Opt maps related training ideas onto host-mediated UPMEM execution and exposes PIM-specific communication limits. The artifact acknowledges reused or repurposed code from LambdaML. ([GitHub](https://github.com/CMU-SAFARI/PIM-Opt)) | When classifying CIM stacks, separate distributed-ML algorithm lineage from CIM backend realization. |
| **TransPimLib / PrIM-style UPMEM libraries and benchmarks** | UPMEM kernels, runtime utilities, and benchmark infrastructure | PIM-Opt reuses or repurposes code from these sources but organizes it around reproducible distributed training experiments. ([GitHub](https://github.com/CMU-SAFARI/PIM-Opt)) | Repository provenance can reveal reusable backend components that are not visible from the paper’s high-level stack diagram. |

---

## 10. Corpus-ready final takeaway

- PIM-Opt’s real contribution is a real-hardware UPMEM implementation and evaluation of MA-SGD, GA-SGD, and ADMM for LR/SVM training on two large datasets, with CPU/GPU baselines and a public reproduction artifact.
- The strongest reusable stack layer is the runtime/benchmark layer: host-DPU data movement, parameter-server synchronization, DPU/tasklet execution, and timing/accuracy evaluation.
- The evidenced scope is centralized distributed optimization for linear binary classification on UPMEM; the paper’s conclusions are most directly reusable for host-mediated digital DRAM-PIM systems.
- The first-class objects are DPUs, tasklets, MRAM/WRAM, host aggregation, data partitions, minibatches, local/global model state, gradients, fixed-point values, and synchronization phases.
- The hidden IR is distributed across Makefiles, shell scripts, C structs, host/DPU code, and log conventions rather than a standalone compiler dialect or serialized mapping IR.
- Artifact status: public artifact found, MIT licensed, with preprocessing, UPMEM code, CPU/GPU baselines, postprocessing, and plotting scripts.
- Integration is most promising as a benchmark, empirical cost source, and UPMEM backend wrapper; compiler integration would benefit from extracting configs, runtime state, and timing phases into a schema.
- For a value-trajectory IR, PIM-Opt is useful at the system-flow level: it models where model/gradient values live and when they move, while analog partial-sum and ADC/DAC trajectory objects are not applicable to this platform.

---
