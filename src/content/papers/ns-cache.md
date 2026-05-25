---
slug: ns-cache
title: "NS-Cache — Optimization and Benchmarking of Monolithically Stackable Gain Cell Memory for Last-Level Cache"
short_title: "NS-Cache"
subtitle: "Scoped CIM stack note"
year: 2025
publication:
  venue: "IEEE Transactions on Computers"
  type: "article"
  doi: "10.1109/TC.2025.3625490"
  url: "https://doi.org/10.1109/TC.2025.3625490"
authors:
  - "Faaiq Waqar"
  - "Jungyoun Kwak"
  - "Junmo Lee"
  - "Minji Shon"
  - "Mohammadhosein Gholamrezaei"
  - "Kevin Skadron"
  - "Shimeng Yu"
citation_source: https://doi.org/10.1109/TC.2025.3625490
bibtex: |
  @article{ns-cache,
    author       = {Faaiq Waqar and
                    Jungyoun Kwak and
                    Junmo Lee and
                    Minji Shon and
                    Mohammadhosein Gholamrezaei and
                    Kevin Skadron and
                    Shimeng Yu},
    title        = {{NS-Cache:} Optimization and Benchmarking of Monolithically Stackable
                    Gain Cell Memory for Last-Level Cache},
    journal      = {{IEEE} Transactions on Computers},
    year         = {2025},
    doi          = {10.1109/TC.2025.3625490},
    url          = {https://doi.org/10.1109/TC.2025.3625490}
  }
summary: >-
  **NS-Cache**, formally *Optimization and Benchmarking of Monolithically Stackable Gain Cell Memory for Last-Level Cache*, contributes a public early-exploration framework for advanced last-level-cache memory technologies, especially monolithically stacked amorphous-oxide-semiconductor 2T gain-cell memories for large LLCs. Its strongest reusable layer is the backend cache/device/circuit PPA model: bank–subarray–mat hierarchy, peripheral and interconnect cost modeling, M3D/TSV-like stacking parameters, access-mode choices, refresh timing, and a Gem5/Ruby benchmarking bridge. The demonstrated workload setting is CPU multicore LLC evaluation using Rodinia and PARSEC/Splash2x benchmarks with Gem5 statistics and NS-Cache-derived cache timing/energy parameters, rather than a neural operator graph or CIM tensor compiler. For a CIM compiler/IR corpus, NS-Cache is most useful as a **cost-model and backend-contract case study**: the first-class object is an advanced cache-memory configuration and its timing/energy consequences, while tensor-CIM scheduling, ISA lowering, analog partial-sum semantics, and value-trajectory rewrites remain outside the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2503.06304))
links:
  paper: https://doi.org/10.1109/TC.2025.3625490
  artifact: https://github.com/neurosim/NS-Cache
  docs:
  code:
technology:
  - "other: \"AOS 2T gain-cell LLC\""
  - "M3D-memory"
  - "SRAM-cache"
  - "eDRAM-cache"
  - "STT-MRAM-cache"
  - "FinFET"
  - "nanosheet"
workloads:
  - "Rodinia"
  - "PARSEC/Splash2x"
  - "CPU multicore LLC benchmarking"
tags: []
baselines: []
axis_A:
  primary: A2
  secondary: [A3, A5]
axis_B: [B1, B4, B6, B7]
axis_C_first_class_objects:
  - "cache hierarchy: bank/subarray/mat"
  - "memory cell model"
  - "tag/data bank organization"
  - "cache access mode"
  - "peripheral circuits"
  - "local/global wires"
  - "TSV/MIV-like vertical interconnect"
  - "refresh timing and refresh energy"
  - "Gem5 quantized latency parameters"
axis_D_rewrite_objects:
  - "hardware mapping"
  - "cache organization"
  - "array binding"
  - "access-mode selection"
  - "wire/interconnect selection"
  - "stack-layer configuration"
  - "cost-model objective selection"
artifact:
  status: "public artifact found"
  url: "https://github.com/neurosim/NS-Cache"
  license: "Creative Commons Attribution-NonCommercial 4.0"
  last_checked: "2026-05-15"
integration_roles:
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: medium
notes:
  - "Best treated as a CIM-adjacent backend/cache-memory modeling entry rather than an explicit tensor-CIM compiler."
  - "Config files and C++ search state function as the practical intermediate boundary."
  - "Gem5 bridge is valuable for modeling refresh/access timing effects from backend cache parameters."
takeaways: []
---

# NS-Cache — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A2 — Simulator & cost model** | The paper presents NS-Cache as an early-exploration PPA RAM/cache model for advanced FinFET/nanosheet/M3D designs, derived from DESTINY/NVSim/CACTI-style modeling and NeuroSim technology models. The paper’s main handoff is latency/energy/area/refresh parameters for cache designs, not a tensor/CIM program representation. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Secondary stack role, Axis A | **A3 — Mapping / scheduling / DSE framework; A5 — narrow hardware-software co-design** | The code enumerates cache organizations and optimization targets, then feeds quantized latency/refresh timing into a modified Gem5/Ruby path for architectural benchmarking. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR; B6 Accuracy/nonideality modeling; limited B7 Runtime-state abstraction** | The most inspectable middle object is a configuration file plus C++ parameter structures: capacity, associativity, process node, access mode, routing, M3D stack flags, wire/TSV parameters, cell files, and optimization targets. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg)) |
| First-class CIM objects, Axis C | **Cache hierarchy, memory cell, bank/subarray/mat, peripheral path nodes, refresh/access timing, wire/TSV/MIV-like interconnect parameters** | The named hardware hierarchy is bank → subarray → mat, with I/O logic, control, interconnect, predecoder, decoders, precharge/write drivers, sense amplifiers, MIV/TSV-style vertical connections, and refresh/event timing. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Rewrite object, Axis D | **Hardware mapping/configuration and access-mode selection** | The tool rewrites/explores cache organizations: tag/data arrays, subarray/mat partitioning, active rows/columns, access mode, wire choices, stack-layer settings, and optimization objectives. It does not expose an operator graph, tensor schedule, instruction stream, or numeric-format IR. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp)) |
| Best corpus tags | `cache-model`, `PPA-model`, `Gem5`, `Ruby`, `M3D-memory`, `AOS-gain-cell`, `FinFET`, `nanosheet`, `config-as-IR`, `hardware-DSE` | Tags reflect the demonstrated public artifact and paper mechanism. |
| Closest comparison baselines | **CACTI, NVSim, DESTINY, NeuroSim, Gem5/Ruby, CACTI-IO / V-Cache-style cache modeling** | The paper explicitly positions NS-Cache as a synthesis/extension of DESTINY/NVSim and NeuroSim; it uses Gem5/Ruby for timing-aware system benchmarking and models AMD V-Cache-style LLC organization for comparison. ([arXiv](https://arxiv.org/pdf/2503.06304)) |

## 2. One-paragraph public summary

**NS-Cache**, formally *Optimization and Benchmarking of Monolithically Stackable Gain Cell Memory for Last-Level Cache*, contributes a public early-exploration framework for advanced last-level-cache memory technologies, especially monolithically stacked amorphous-oxide-semiconductor 2T gain-cell memories for large LLCs. Its strongest reusable layer is the backend cache/device/circuit PPA model: bank–subarray–mat hierarchy, peripheral and interconnect cost modeling, M3D/TSV-like stacking parameters, access-mode choices, refresh timing, and a Gem5/Ruby benchmarking bridge. The demonstrated workload setting is CPU multicore LLC evaluation using Rodinia and PARSEC/Splash2x benchmarks with Gem5 statistics and NS-Cache-derived cache timing/energy parameters, rather than a neural operator graph or CIM tensor compiler. For a CIM compiler/IR corpus, NS-Cache is most useful as a **cost-model and backend-contract case study**: the first-class object is an advanced cache-memory configuration and its timing/energy consequences, while tensor-CIM scheduling, ISA lowering, analog partial-sum semantics, and value-trajectory rewrites remain outside the demonstrated abstraction. ([arXiv](https://arxiv.org/pdf/2503.06304))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Develop an open-source cache early-exploration tool, NS-Cache, for advanced cache designs in leading-edge nodes and M3D memories | Abstract, Fig. 2 caption, Sec. II-A, Sec. IV-A | Paper + code/artifact | The paper states NS-Cache models advanced 7/3 nm caches and is integrated with Gem5; the GitHub repository is public and contains `src`, `config`, `gem5_llc_refresh`, documentation, licenses, and example configs. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Demonstrated as a cache PPA exploration tool with config-driven C++ source and modified Gem5 tree. Full figure-level reproduction scripts are not clearly documented in the checked sources. |
| Combine DESTINY/NVSim-style cache organization with NeuroSim advanced transistor models | Sec. II-A, Sec. IV-A, README | Paper + code/documentation | The paper says NS-Cache synthesizes DESTINY/NVSim and NeuroSim V1.4, extending beyond 22 nm bulk technologies into FinFET/nanosheet nodes; the README says the tool extends DESTINY, NVSim, and CACTI3DD and inherits leading-edge transistor/PPA specifications from NeuroSim V1.4. ([arXiv](https://arxiv.org/pdf/2503.06304)) | The reusable boundary is clearest at technology/cache configuration and PPA modeling. The detailed calibration chain depends on paper references and embedded source assumptions. |
| Model AOS 2T gain-cell LLCs from device through circuit and system levels | Intro contributions, Sec. III, Sec. IV-B, Sec. V–VI | Equation + experiment + code | The paper describes TCAD-derived compact modeling for IWO 2T-GCs, bank-level modeling of AOS 2T-GC arrays/peripherals, and Gem5 benchmark integration. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Demonstrated for modeled AOS 2T-GC LLCs and projected/scaled device assumptions; TCAD decks and Ansys/HFSS inputs were not found in the checked public artifact. |
| Provide Gem5/Ruby timing-accurate cache refresh/access evaluation | Intro contributions, Sec. V-A, Fig. 10, repository | Code/artifact + paper | The paper says NS-Cache interfaces with Gem5 Ruby, quantizes latency metrics into cycles, and modifies Ruby memory structures/protocols in SLICC to model refresh and access modes. The repo contains a `gem5_llc_refresh` tree. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Demonstrated as a modified Gem5 path for LLC refresh/access timing. Reproducing exact benchmark figures would require workload setup and undocumented figure-generation workflow. |
| Explore cache access modes and Tag Arrays Under Data (TAU) integration | Sec. IV-E, Table II, Fig. 8–9, Fig. 12b | Experiment + code | The paper defines TAU strategies, updates GDL bus-width/access-mode modeling, and reports read-bandwidth/area/runtime consequences. The code exposes cache access mode and access-mode-dependent block/associativity transformations. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Demonstrated for LLC tag/data co-integration choices and cache-line access modes. The abstraction is a hardware organization/search state, not a general compiler scheduling IR. |
| Benchmark SRAM, eDRAM, STT-MRAM, and AOS 2T-GC LLCs at 7 nm and compare against V-Cache-style design | Intro contributions, Sec. V-B/D, Sec. VI-A/B | Experiment | The paper uses Rodinia and PARSEC/Splash2x benchmarks, OpenMP, Zen3-like Gem5 parameters, and NS-Cache-generated bank/subarray latency/refresh parameters; it compares candidate LLC memories and a bandwidth-optimized IWO 2T-GC design against a modeled AMD V-Cache baseline. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Evaluated through simulator-backed experiments over CPU cache benchmarks. The benchmark interface is architectural statistics and cache timing, not neural workload lowering. |
| Compute program-level LLC energy using Gem5 cache statistics and NS-Cache operation energies | Sec. VI-A, Eq. 5 | Equation + experiment | The paper’s energy expression combines Gem5 hit/miss/write counts with NS-Cache per-operation energies, refresh energy over runtime/refresh period, row count, and static power. ([arXiv](https://arxiv.org/pdf/2503.06304)) | The equation supports program-level LLC energy estimation under the modeled cache hierarchy and refresh policy. Whole-system energy beyond the modeled LLC/off-chip assumptions is outside the direct model boundary. |
| Public artifact is available and usable by others | Paper Sec. II-A; README | Code/artifact + documentation | GitHub hosts a public repository with build/run instructions, example configs, source code, modified Gem5 tree, licenses, and starter tips. ([GitHub](https://github.com/neurosim/NS-Cache/)) | Artifact-level evidence supports basic model execution and configuration. Full paper reproduction appears partial because benchmark datasets, figure scripts, TCAD/HFSS decks, and exact experiment orchestration were not found in the checked sources. |

## 4. Stack anatomy

```text
Input / frontend:
  Named object: NS-Cache configuration file plus memory-cell file.
  Type: config-as-IR, not a tensor graph or compiler IR.
  Serialized/inspectable: yes, as .cfg and .cell files. Example config fields include design target, cache access mode, associativity, process node, capacity, word width, roadmap, routing, sensing, memory cell file, optimization target, pruning, wiring flag, stack count, partition granularity, TSV projections, and TSV redundancy. Reusable as a backend configuration boundary. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg))

Middle representation:
  Named object: C++ InputParameter, MemCell, Result, Bank, SubArray, Mat, Technology, Wire, TSV objects.
  Type: hardware-resource state plus search state.
  Serialized/inspectable: partially. Input and selected output are inspectable; intermediate search states are mostly in C++ objects/macros. InputParameter names technology, cache, search, wire, stack, quantization, and Gem5-related fields. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/InputParameter.h))

Mapping or scheduling state:
  Named object: cache organization / design-space enumeration.
  Type: hardware mapping/DSE state: tag-bank search, data-bank search, active subarray/mat counts, mux choices, wire choices, stack layers, access mode, optimization target.
  Serialized/inspectable: partially. Full exploration can output CSV, while optimized single runs print summaries; the search loop and pruning logic live in source. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp))

Hardware abstraction:
  Named object: bank → subarray → mat hierarchy with cell, decoder, predecoder, precharger/write driver, sense amplifier, comparator, wire, TSV/MIV-like interconnect, tag/data bank organization, and refresh path.
  Type: circuit/cache hierarchy and PPA model.
  Serialized/inspectable: partially. Configs and source are public; calibrated model assumptions are distributed across paper references and C++ technology/circuit code. ([arXiv](https://arxiv.org/pdf/2503.06304))

Backend / simulator / codegen:
  Named object: NS-Cache executable plus modified Gem5/Ruby/SLICC path.
  Type: simulator backend, not instruction codegen.
  Serialized/inspectable: yes for source; partially for end-to-end workflow. The README documents `make -C src/`, `./nsc <configuration_file>`, and Gem5 build guidance for the packaged modified Gem5 tree. ([GitHub](https://github.com/neurosim/NS-Cache/))

Output artifact:
  Named object: printed cache summary, optional CSV for full exploration, quantized Gem5 command/parameters when enabled.
  Type: PPA report / simulator parameterization.
  Serialized/inspectable: partially. ExampleResult shows generated design specification, solution count, cache area, data/tag area, and timing summary. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/ExampleResult.txt))

Evaluation loop:
  Named object: NS-Cache-generated bank/subarray timing + Gem5 runtime/cache statistics + LLC energy equation.
  Type: simulator-backed benchmark loop.
  Serialized/inspectable: partially. The paper describes Rodinia and PARSEC/Splash2x OpenMP benchmarks and Gem5 being fed cycle latency and refresh timing from NS-Cache; exact figure reproduction scripts are not found in the checked artifact. ([arXiv](https://arxiv.org/pdf/2503.06304))
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of the `.cfg`/`.cell` files, the `InputParameter` and `MemCell` objects, the enumerated tag/data-bank candidate states, the selected `Result` object, and the quantized Gem5/Ruby timing parameters. The paper foregrounds device/circuit/cache PPA modeling, while the reusable semantics are most visible in the configuration schema, cache hierarchy object model, and access/refresh timing bridge into Gem5. The search legality and ranking rules are embedded in C++ loops, macros such as capacity verification and best-result update, and simulator assumptions rather than in a separately typed IR artifact. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/InputParameter.h))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A2 — Simulator & cost model.**  
NS-Cache owns the backend memory/device/circuit/cache modeling slice. Its input is a hardware/cache configuration and memory-cell model; its output is cache PPA, timing, refresh, and quantized simulator parameters. The paper explicitly motivates a gap in cache/RAM modeling beyond 22 nm bulk technology and positions NS-Cache as an open-source advanced-node cache exploration tool. ([arXiv](https://arxiv.org/pdf/2503.06304))

**Secondary: A3 — Mapping / scheduling / DSE framework.**  
The tool explores legal cache organizations and optimization targets over tag/data arrays, subarrays, mats, active subarray/mat settings, wire styles, stack layers, partition granularity, and access modes. The code searches tag first, then data, verifies capacity, updates best results, refines wire choices, and can prune a full exploration. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp))

**Secondary: A5 — Narrow end-to-end co-design.**  
The paper connects device choices, cache circuit organization, and architecture-level Gem5 results. This is a narrow hardware-software co-design path around LLC memories and CPU benchmarks, with Gem5/Ruby modeling refresh and access-mode timing. ([arXiv](https://arxiv.org/pdf/2503.06304))

### 5.2 Axis B — middle-layer style

**B1 — Config-as-IR.**  
The named middle representation is the NS-Cache configuration file and associated memory-cell file. Decisions made there include cache/RAM target, access mode, associativity, capacity, process node, word width, routing, sensing mode, memory-cell input file, optimization target, pruning, stack count, partition granularity, and TSV projection parameters. Upstream tools could generate this configuration, but verification would require mirroring parser semantics and source-level constraints. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg))

**B4 — Hardware-resource IR.**  
The source exposes hardware-resource classes and fields for process node, technology roadmap, cell type, cache hierarchy, wire/TSV choices, stack layers, row/column subarray counts, active subarray/mat counts, mux factors, and sensing. Decisions that remain embedded in code include legality checks, pruning, wire refinement, tag/data coordination, and access-mode-specific block/associativity rewriting. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/InputParameter.h))

**B6 — Accuracy / nonideality modeling.**  
The paper and artifact model technology/device/circuit nonidealities as PPA terms: TCAD-derived AOS compact behavior, retention/access tradeoffs, parasitic capacitance, leakage, level shifter overhead, refresh timing, peripheral energy, and TSV/interconnect latency/energy. The single upstream-readable abstraction is still a config/report boundary; the detailed nonideality propagation lives in model code and paper assumptions. ([arXiv](https://arxiv.org/pdf/2503.06304))

**Limited B7 — Runtime-state abstraction.**  
Runtime enters through Gem5 hit/miss/write counts, runtime, refresh period, row count, and quantized refresh/access timing. This is a cache-event/runtime-statistics abstraction, not a general runtime-state IR for batching, sparsity, masks, KV cache, or dynamic tensor scheduling. ([arXiv](https://arxiv.org/pdf/2503.06304))

There is no single serialized intermediate artifact that upstream compiler passes could read, type-check, rewrite, and hand to the backend as a general CIM program. The most reusable boundary is a generated NS-Cache config plus optional Gem5 parameterization.

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class for cache arrays/macros; crossbar-specific form not applicable** | Bank, subarray, and mat hierarchy are central to NS-Cache, with named routing and active subarray/mat concepts. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Bit-slicing / bit significance | **Not applicable / unknown for CIM bit-sliced compute** | The paper models cache-line/tag/data widths and ECC assumptions, not bit-sliced MAC semantics. Word width and block width appear as cache parameters. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg)) |
| ADC/DAC precision or sensing | **Not applicable; sensing is circuit-costed** | Sense amplifiers and minimum sense voltage are modeled as memory/circuit concepts; there is no ADC/DAC precision object as in analog-CIM MAC arrays. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/MemCell.h)) |
| Analog-to-digital or domain transition | **Not applicable** | The demonstrated path is cache memory access and refresh, not analog MAC accumulation followed by conversion. |
| Peripheral circuits as path nodes | **First-class / costed** | The paper names row decoders, level shifters, precharger/write drivers, MIV arrays, latching sense amplifiers, and control/interconnect stages; source accumulates predecoder, mux, sense, mat, comparator, TSV, and leakage terms. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Partial-sum accumulation path | **Not applicable** | The work’s path object is a cache transaction/tag-data path rather than a CIM multiply-accumulate path. |
| Reconstruction / shift-add tree | **Not applicable** | No bit-slice reconstruction or shift-add reduction tree is represented in the checked paper/artifact. |
| Runtime state, masks, KV cache, batching, sparsity | **Refresh/runtime statistics are parameterized; other runtime objects not applicable** | Gem5 supplies hit/miss/write counts and runtime; the energy model uses refresh period and row count. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Value trajectory / flow path | **Approximated at cache-transaction level** | Fig. 3 and Fig. 8 describe transaction flow through I/O, control, interconnect, predecoder, tag/data arrays, and access modes; this is not value-identity tracking across CIM arithmetic stages. ([arXiv](https://arxiv.org/pdf/2503.06304)) |

### 5.4 Axis D — rewrite object

The tool actually rewrites or explores **hardware mapping/configuration**:

- cache access mode: normal, sequential, fast;
- tag-bank and data-bank organization;
- block-size and associativity adjustments under access modes;
- subarray/mat dimensions and active subarray/mat parallelism;
- local/global wire type and repeater selection;
- M3D stack and partition parameters;
- optimization target and pruning constraints;
- Gem5 timing quantization for cache refresh/access events.

The legal transformations are those that preserve cache capacity, associativity/access-mode semantics, and viable organization constraints while changing layout/resource choices and cost ranking. The equivalences exploited are cache-organization equivalences: many bank/subarray/mat decompositions implement the same logical cache capacity and line size, allowing PPA ranking under different objectives. Information that must be preserved across lowering includes capacity, word/cache-line width, associativity, tag/data relation, hit/miss/write timing, refresh period, row count, and static/dynamic energy components. The representation is especially well suited to **cache-memory PPA exploration and Gem5 parameter generation**; expressing tensor-operator fusion, analog partial-sum retiming, ADC placement, bit-slice reconstruction, or CIM instruction scheduling would likely require an additional abstraction for value identity, compute semantics, and operator-to-array binding.

## 6. Technical mechanism reading

### 6.1 Device-to-cache modeling path

The paper begins from AOS 2T gain-cell device design. It reports ML-assisted compact models derived from Sentaurus TCAD data, calibrated to an experimentally demonstrated long-channel DG IWO transistor, then scaled into 15 nm gate-length DG and CAA structures. The device-level sweep considers oxygen-vacancy/dopant profile, threshold voltage, read/write transistor asymmetry, `Vhold`, `Vboost`, access time, and retention time. ([arXiv](https://arxiv.org/pdf/2503.06304))

For compiler/IR purposes, the important feature is not the device physics itself but the **contract it creates**: device choices become cache-cell parameters, which become mat/subarray timing and energy, which are quantized into architectural cycles. This is a classic backend-cost-model stack: low-level characterization is not exposed as a compiler type, but its consequences become cost fields.

### 6.2 Cache hierarchy and search state

NS-Cache inherits the CACTI/NVSim/DESTINY style of organizing caches into banks, subarrays, and mats. The paper explicitly defines bank-level routing, active subarrays (`NASR`, `NASC`), mats within subarrays, tag/data bank roles, predecoder routing, and the impact of subarray delay on cache bandwidth. ([arXiv](https://arxiv.org/pdf/2503.06304))

The artifact’s `InputParameter` class makes the hardware design-space explicit: design target, optimization target, process node, capacity, word width, device roadmap, memory-cell files, temperature, pruning/constraints, CACTI assumptions, M3D stack limits, clock frequency, quantization flag, associativity, access mode, routing mode, wire/repeater choices, active subarray/mat ranges, mux factors, TSV projection, monolithic stack count, `monolithic3DMat`, stack-layer bounds, and tag-technology options. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/InputParameter.h))

The code-level search first designs tag arrays for cache targets, computing tag block size from total address bits, index bits, offset bits, dirty/valid bits, active parallelism, and associativity; then it searches data arrays with access-mode-specific transformations. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp))

### 6.3 Access modes and TAU

The paper distinguishes normal, sequential, and fast access modes and uses them to reason about tag/data interaction and routed bits. In code, sequential access collapses associativity for the data access, fast access loads the entire set as a single word by multiplying block size by associativity, and normal access restricts row-per-set behavior to preserve timing assumptions. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp))

The Tag Arrays Under Data (TAU) mechanism is the paper’s most architecture-specific co-design contribution. TAU places SRAM tag subarrays/mats under monolithically integrated data memories, aiming to reuse silicon footprint and reduce tag/data communication. The paper discusses homogeneous and heterogeneous TAU variants, changes global data-line bus-width modeling, and evaluates their area, bandwidth, runtime, and miss/write penalty consequences. ([arXiv](https://arxiv.org/pdf/2503.06304))

### 6.4 Cost model and program energy equation

The cost model combines RC/logical-effort-style cache hierarchy modeling, NeuroSim-derived advanced transistor/interconnect models, memory-cell parameters, peripheral-circuit models, refresh costs, and vertical-interconnect terms. The source accumulates predecoder, mux, sense, mat, TSV, comparator, read/write/reset/set/refresh dynamic energy, leakage, and refresh latency terms at the subarray level. ([arXiv](https://arxiv.org/pdf/2503.06304))

At the program level, the paper computes LLC energy from Gem5 L3 statistics:

\[
E_{\text{PRGM}} \approx N_H E_H + N_M E_M + N_W E_W + \frac{t_{\text{run}} N_{\text{row}} E_R}{t_r} + P_s t_{\text{run}},
\]

where hits, misses, and writes come from Gem5; per-operation hit/miss/write/refresh energies and static power come from NS-Cache; and runtime plus refresh period determine refresh energy accumulation. The exact notation in the PDF is typeset compactly, but the variable definitions are given in Sec. VI-A. ([arXiv](https://arxiv.org/pdf/2503.06304))

### 6.5 Gem5/Ruby bridge

The Gem5 bridge is not a code generator in the compiler sense; it is a simulator parameterization interface. The paper says NS-Cache-derived system-level latency metrics and subdivision metrics are quantized into discrete cycles using a parameterized clock frequency passed to Gem5. It modifies Ruby memory structures and SLICC protocols to model refresh latency, refresh frequency, refresh strategy, and access-mode-specific tag/data communication penalties. ([arXiv](https://arxiv.org/pdf/2503.06304))

The README documents a `-ViewQuantization` flag for viewing quantized hierarchy outputs and the generated Gem5 command, and notes that users should build the `MERSI_Three_Level` configuration in the packaged Gem5 tree. ([GitHub](https://github.com/neurosim/NS-Cache/))

### 6.6 Workload and evaluation assumptions

The workload layer is CPU cache benchmarking. The paper uses Rodinia and PARSEC/Splash2x with large problem sizes, compiled with OpenMP, and Gem5 system parameters chosen to mirror AMD Zen3-like architecture. Gem5 receives cycle latency and refresh timing parameters generated from NS-Cache bank/subarray modeling. ([arXiv](https://arxiv.org/pdf/2503.06304))

The evaluation compares modeled 7 nm SRAM, 1T1C eDRAM, STT-MRAM, and IWO 2T-GC LLC macros and later compares a bandwidth-optimized IWO 2T-GC cache against a modeled AMD V-Cache organization using NS-Cache plus parasitic assumptions for inter-tier communication. ([arXiv](https://arxiv.org/pdf/2503.06304))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The config files are the practical IR boundary

- **Observation:** The `.cfg` and `.cell` files are the most stable external representation: they name cache access mode, capacity, associativity, process node, routing, memory-cell file, optimization target, stack count, partition granularity, and TSV assumptions. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg))  
- **Why it matters for CIM compiler/IR work:** A compiler that wanted to use NS-Cache would most naturally generate configs, not call a typed IR API.  
- **Reusable lesson:** Future CIM stacks can treat backend cost models as config targets, but should add a schema/version layer if configs are expected to become verifiable IR boundaries.

### Insight 2 — Search legality and cost ranking are separated in code, not in a formal pass pipeline

- **Observation:** The code enumerates candidate tag/data organizations, filters invalid or too-aggressive partitioning, verifies capacity, updates best results, and then refines wire choices. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp))  
- **Why it matters for CIM compiler/IR work:** This pattern resembles a mapper, but the legality predicates and ranking objectives are embedded in C++ search loops and macros.  
- **Reusable lesson:** A future CIM IR could borrow the separation between candidate generation, legality checking, and objective ranking while making those steps explicit passes.

### Insight 3 — Gem5 quantization reveals the real backend contract

- **Observation:** The paper-level bridge to architecture simulation is the quantization of NS-Cache latency/refresh metrics into Gem5 cycles and Ruby/SLICC event penalties. ([arXiv](https://arxiv.org/pdf/2503.06304))  
- **Why it matters for CIM compiler/IR work:** Backend handoff is not a detailed layout or instruction stream; it is a compact timing contract that the architectural simulator can consume.  
- **Reusable lesson:** CIM compilers could similarly expose “backend timing contracts” for simulator integration: per-stage latency, energy, refresh/retention events, domain transitions, and queue/resource penalties.

### Insight 4 — Refresh is modeled as a runtime/statistical effect rather than a static schedule

- **Observation:** Program energy uses Gem5 hit/miss/write counts plus runtime and refresh-period terms, while Gem5 modifications model refresh latency/frequency/strategy. ([arXiv](https://arxiv.org/pdf/2503.06304))  
- **Why it matters for CIM compiler/IR work:** Retention/refresh is a dynamic hardware property that affects availability and energy, but here it is not represented as a schedule object tied to individual values.  
- **Reusable lesson:** A future value-trajectory IR could attach retention lifetime, refresh obligation, and availability windows to memory-resident values.

### Insight 5 — The cache transaction path is a useful non-CIM analogue for trajectory IR

- **Observation:** Fig. 3 and Fig. 8 describe address/control/tag/data movement through I/O logic, control, interconnect, predecoders, arrays, and peripheral circuits. ([arXiv](https://arxiv.org/pdf/2503.06304))  
- **Why it matters for CIM compiler/IR work:** Although this is a cache path rather than a CIM MAC path, it shows how a backend model can decompose a transaction into resource stages and attach latency/energy to each.  
- **Reusable lesson:** CIM IR designers can borrow the “transaction through named resources” pattern and extend it to analog partial sums, sensing, reconstruction, reduction, and storage.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact identifier:** `neurosim/NS-Cache` on GitHub. The repository is public and contains `Doc`, `config`, `gem5_llc_refresh`, `src`, changelog, licenses, and notice files. ([GitHub](https://github.com/neurosim/NS-Cache/))  
- **License:** Creative Commons Attribution-NonCommercial 4.0 according to the README and LICENSE file. ([GitHub](https://github.com/neurosim/NS-Cache/))  
- **Last checked date:** 2026-05-15.  
- **What the artifact contains:** C++ NS-Cache source, example new/old configurations, memory-cell files, an example result, a modified Gem5 tree, build/run instructions, and multiple inherited license files. ([GitHub](https://github.com/neurosim/NS-Cache/tree/main/config))  
- **What the artifact appears to omit:** No clearly documented one-command reproduction workflow for all paper figures was found in the checked sources. TCAD decks, Ansys/HFSS project files, exact benchmark binaries/datasets, and figure-generation scripts were not found in the checked public pages.  
- **Minimal documented workflow:** clone the repository, run `make -C src/`, then run `./nsc <configuration_file>` such as `./nsc config/New_Configs/SRAM_cache_14nm.cfg`; for Gem5, the README points users to the Gem5 README and the `MERSI_Three_Level` build/configuration path. ([GitHub](https://github.com/neurosim/NS-Cache/))  
- **Whether paper figures appear reproducible from the artifact:** **Partial / unknown.** The artifact exposes the model, configs, modified Gem5 tree, and example output, but the checked documentation does not provide a complete script chain from configs and benchmarks to every paper figure.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | **Partial** | README describes configs and points to `inputParameter.cpp/.h` and `MemCell.cpp/.h`; example configs show concrete fields. ([GitHub](https://github.com/neurosim/NS-Cache/)) |
| Intermediate representation serialized | **Partial** | Configs and outputs are serialized; internal search state is C++ object state rather than a standalone IR file. |
| Mapping decisions inspectable | **Partial** | Search loops and best-result updates are visible in source; individual candidate traces require full exploration/output settings. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/main.cpp)) |
| Schedule inspectable | **N/A / Partial** | There is no tensor/CIM schedule. Cache access-mode and refresh timing are inspectable through configs, code, and Gem5 quantization. |
| Hardware config explicit | **Yes** | Config files and `InputParameter` expose process, capacity, associativity, routing, stack, wire, TSV, and cache access parameters. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/config/New_Configs/GainCell_Cache_14nm.cfg)) |
| Precision / bit-slice assumptions explicit | **N/A** | Cache word/line width is explicit; CIM bit-slice precision is not the modeled object. |
| Cost model inspectable | **Partial** | Source contains latency/energy/leakage accumulation; calibration assumptions depend on paper references and embedded technology code. ([GitHub](https://github.com/neurosim/NS-Cache/blob/main/src/SubArray.cpp)) |
| Simulator backend documented | **Partial** | Paper describes Gem5/Ruby/SLICC changes; repo includes a modified Gem5 tree and README build hints. ([arXiv](https://arxiv.org/pdf/2503.06304)) |
| Generated code / instruction stream inspectable | **N/A** | The artifact generates reports/parameters, not an instruction stream. |
| Provenance from source op to backend action | **N/A / Partial** | Provenance exists from cache config to report/Gem5 timing; there is no source tensor op. |
| Reproduction scripts available | **Partial / Unknown** | Basic build/run documented; full paper-figure reproduction scripts were not found. |
| Calibration source documented | **Partial** | Paper cites TCAD calibration and foundry/IRDS-derived technology modeling; public artifact does not clearly expose TCAD decks. ([arXiv](https://arxiv.org/pdf/2503.06304)) |

### 8.3 Integration helper

- **As frontend:** Reuse is limited to cache-memory configurations. It does not provide a neural-network, tensor, graph, ONNX, MLIR, or workload frontend.  
- **As IR inspiration:** The useful abstraction is config-as-IR for backend memory hierarchy: cell file, cache mode, hierarchy dimensions, wire/interconnect choices, stack layers, refresh/retention parameters, and optimization target.  
- **As mapper/scheduler:** The candidate enumeration and pruning logic can inspire a mapper for hardware-resource search, especially when many physical organizations implement the same logical memory.  
- **As cost model:** This is the strongest integration role. NS-Cache could become a backend plugin that returns cache/memory area, read/write latency, refresh latency, dynamic energy, leakage, and quantized simulator parameters.  
- **As backend:** A wrapper could generate NS-Cache configs and parse reports or CSV outputs. The Gem5 bridge could be reused for architectural simulation of cache refresh/access timing.  
- **As benchmark:** The paper’s Rodinia and PARSEC/Splash2x CPU cache benchmarks, Zen3-like Gem5 setup, and SRAM/eDRAM/STT-MRAM/AOS comparisons are useful as memory-system baselines. ([arXiv](https://arxiv.org/pdf/2503.06304))  
- **As validation source:** The paper provides modeled validation via TCAD-calibrated compact models, inherited DESTINY/NVSim/NeuroSim validation lineage, and simulator comparisons. Direct chip-in-loop or RTL validation is not evidenced in the checked sources. ([arXiv](https://arxiv.org/pdf/2503.06304))  

**Integration effort estimate: Medium.** Integration would be most direct through a small adapter that emits `.cfg`/`.cell` files and parses NS-Cache summaries or CSV outputs. Deeper integration would require making search choices and cost components accessible through a stable API rather than relying on source-level objects/macros. Gem5 reproduction adds setup cost because the paper’s architectural workflow depends on benchmark compilation, modified Ruby/SLICC behavior, and workload-specific statistics.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **CACTI** | Cache memory area/latency/power modeling | CACTI is the historical SRAM cache modeling base; NS-Cache extends the style toward advanced FinFET/nanosheet and M3D/cache alternatives. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Place NS-Cache in the cache-cost-model lineage, not as a tensor compiler. |
| **NVSim** | Emerging-memory PPA modeling | NVSim extended CACTI-like principles to NVMs such as MRAM/RRAM/PCM; NS-Cache inherits and adapts this lineage for advanced cache memories and Gem5 benchmarking. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Useful comparison for “memory technology as first-class object.” |
| **DESTINY** | 3D eDRAM/NVM cache modeling | DESTINY added 3D eDRAM/NVM cache support but is described as stopping before FinFET-generation nodes; NS-Cache targets FinFET/nanosheet/M3D updates. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Distinguish legacy memory-cache DSE from advanced-node cache DSE. |
| **NeuroSim** | Device/circuit/architecture modeling for compute-in-memory | NeuroSim’s lineage includes CIM architectural analysis and advanced transistor models; NS-Cache reuses the technology/PPA modeling lineage for cache exploration rather than neural compute lowering. ([arXiv](https://arxiv.org/pdf/2503.06304)) | This is a good “CIM-adjacent backend model” entry. |
| **Gem5/Ruby** | System-level timing and architectural benchmarking | Gem5 provides the runtime/cache-statistics and protocol simulation substrate; NS-Cache supplies cache latency/refresh/energy parameters. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Backend contracts can be simulator parameters rather than generated instructions. |
| **AMD V-Cache-style LLC modeling** | Large LLC organization, 3D stacking, interconnect/parasitic effects | NS-Cache models a V-Cache-like organization as a comparison point and evaluates a bandwidth-optimized AOS design within the same footprint assumptions. ([arXiv](https://arxiv.org/pdf/2503.06304)) | Comparison should focus on hierarchy/stacking object, not compiler IR richness. |

## 10. Corpus-ready final takeaway

- NS-Cache’s real contribution is a public advanced-node cache-memory PPA exploration framework plus a Gem5/Ruby timing bridge for LLC refresh/access benchmarking.
- The strongest reusable stack layer is the backend cost model: device/cell → mat/subarray/bank → cache timing/energy/area → Gem5 cycles/statistics.
- The evidenced workload scope is CPU multicore cache benchmarking over Rodinia and PARSEC/Splash2x, not neural graph lowering or CIM tensor compilation.
- First-class objects include cache hierarchy, memory-cell parameters, access modes, tag/data organization, peripheral circuits, wire/TSV-like interconnect, refresh timing, and optimization targets.
- The hidden IR is the combination of `.cfg`/`.cell` files, C++ `InputParameter`/`MemCell`/`Result` state, search loops, and quantized Gem5 parameters.
- Artifact status: public artifact found; the repository includes source, configs, modified Gem5, licenses, and example output, while full paper-figure reproduction scripts and TCAD/HFSS inputs were not found in the checked sources.
- Best integration role for a CIM compiler/IR stack: backend cost-model plugin or simulator-parameter backend, with a config/report adapter.
- Relevance to value-trajectory IR is medium: the paper models transaction paths through named memory resources, but trajectory-level CIM semantics would add value identity, bit significance, domain transitions, partial-sum/reconstruction stages, and cross-operator movement.
