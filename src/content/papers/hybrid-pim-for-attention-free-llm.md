---
slug: hybrid-pim-for-attention-free-llm
title: "Towards Floating Point-Based Attention-Free LLM: Hybrid PIM with Non-Uniform Data Format and Reduced Multiplications"
short_title: "Hybrid PIM"
subtitle: "Scoped CIM stack note"
year: 2024
publication:
  venue: "ICCAD 2024"
  type: "conference"
  doi: "10.1145/3676536.3676776"
  url: "https://doi.org/10.1145/3676536.3676776"
authors:
  - "Lidong Guo"
  - "Zhenhua Zhu"
  - "Tengxuan Liu"
  - "Xuefei Ning"
  - "Shiyao Li"
  - "Guohao Dai"
  - "Huazhong Yang"
  - "Wangyang Fu"
  - "Yu Wang"
bibtex: |
  @inproceedings{DBLP:conf/iccad/GuoZLNLDYF024,
    author = {Lidong Guo and Zhenhua Zhu and Tengxuan Liu and Xuefei Ning and Shiyao Li and Guohao Dai and Huazhong Yang and Wangyang Fu and Yu Wang},
    title = {Towards Floating Point-Based Attention-Free {LLM}: Hybrid {PIM} with Non-Uniform Data Format and Reduced Multiplications},
    booktitle = {{IEEE/ACM} International Conference on Computer-Aided Design, {ICCAD} 2024},
    pages = {177:1--177:9},
    publisher = {{ACM}},
    year = {2024},
    doi = {10.1145/3676536.3676776},
    url = {https://doi.org/10.1145/3676536.3676776}
  }
citation_source: https://dblp.org/rec/conf/iccad/GuoZLNLDYF024
summary: >-
  This paper contributes a hardware-software co-design for attention-free LLM inference that makes the MVM/EWM split in Mamba and RWKV the central optimization boundary. Its clearest CIM-stack contribution is a precision-and-arithmetic layer: PN, a PIM-oriented exponent-free non-uniform weight format that preserves bit-sliced analog RRAM MVM execution, and a multiplication-free approximate FP16 EWM implementation mapped onto a proposed 3D-SRAM digital PIM array. The demonstrated path is not a general compiler IR, but it does expose useful compiler/IR ingredients: a named numeric representation, a group-wise offline parameter-search algorithm, an operator-to-hardware mapping rule, a PN shift configuration boundary, conversion units between INT and FP stages, and simulator/synthesis-backed hardware evaluation for Mamba/RWKV families. The work is therefore best placed as a narrow end-to-end co-design with a strong isolated precision/mapping abstraction, relevant to CIM compiler research as evidence for treating bit significance, scaling-factor propagation, operator sensitivity, and domain transition as first-class lowering state. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))
links:
  paper: https://doi.org/10.1145/3676536.3676776
  artifact: https://github.com/gld17/PN
  docs:
  code:
technology:
  - "RRAM-CIM"
  - "SRAM-CIM"
  - "3D-SRAM-CIM"
  - "analog-CIM"
  - "digital-CIM"
  - "hybrid"
workloads:
  - "Mamba-130M"
  - "Mamba-370M"
  - "Mamba-1.4B"
  - "Mamba-2.8B"
  - "RWKV-169M"
  - "RWKV-430M"
  - "RWKV-1.5B"
  - "RWKV-3B"
  - "HellaSwag"
  - "PIQA"
  - "Arc-Easy"
  - "Winogrande"
tags: []
baselines: []
axis_A:
  primary: A5
  secondary: [A2, A3]
axis_B: [B1, B4, B6, B7]
axis_C_first_class_objects:
  - "PN_scaling_factors"
  - "weight_groups"
  - "bit_sliced_RRAM_crossbars"
  - "ADC_DAC_path"
  - "PN_shift_config_register"
  - "barrel_shifter_add_reconstruction"
  - "3D_SRAM_EWM_array"
  - "INT_FP_conversion_units"
  - "nonlinear_LUT"
  - "hidden_state_buffer"
axis_D_rewrite_objects:
  - "numeric_format"
  - "operator_to_architecture_mapping"
  - "array_binding"
  - "arithmetic_approximation"
  - "scale_propagation"
  - "reconstruction_path"
artifact:
  status: "public artifact found; partial for full paper reproduction"
  url: "https://github.com/gld17/PN"
  license: "unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - "IR_inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best classified as a hardware-software co-design demo rather than a general compiler stack."
  - "Strongest reusable boundary is PN precision/reconstruction metadata for bit-sliced RRAM MVMs."
  - "Public artifact appears focused on PN parameter search and quantized CNN examples; full Mamba/RWKV hardware evaluation flow was not found."
  - "Useful for value-trajectory IR design because it exposes bit significance, reconstruction, domain conversion, and buffer-mediated EWM state as optimization-relevant objects."
takeaways: []
---

# Towards Floating Point-Based Attention-Free LLM: Hybrid PIM with Non-Uniform Data Format and Reduced Multiplications — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A5 narrow end-to-end co-design**, with A2/A3 aspects | The paper co-designs numeric format, operator assignment, and hybrid PIM architecture for Mamba/RWKV inference. The demonstrated stack slice runs from operator-level MVM/EWM characterization to PN format search, approximate FP EWM arithmetic, RRAM/3D-SRAM architecture, and simulator/synthesis-backed evaluation. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Middle-layer style, Axis B | **B1 config-as-IR**, **B4 hardware-resource IR**, **B6 accuracy/arithmetic modeling** | The most explicit middle state is the PN parameter list `{Sy, I}` per weight group plus the PN shift configuration register file. The hardware hierarchy is represented as RRAM PEs/crossbars, 3D-SRAM EWM arrays, LUTs, buffers, converters, ADC/DAC, and routers; the arithmetic abstraction is carried by PN equations and approximate FP16 EWM equations. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| First-class CIM objects, Axis C | PN bit-level scaling factors; weight groups; bit-sliced RRAM crossbars; ADC/DAC path; barrel shifter/add tree; 3D-SRAM EWM array; INT/FP conversion units; LUT; buffer for hidden/intermediate state | The paper names and reasons about these objects directly in equations, Algorithm 1, Figure 7, and the evaluation configuration table. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Rewrite object, Axis D | **Numeric format**, **operator-to-architecture mapping**, **array/peripheral binding**, **arithmetic approximation** | The work transforms FP/INT weight representation into PN parameters, aligns FP scaling factors into INT runtime factors, maps MVMs to RRAM analog PIM and EWMs to 3D-SRAM digital PIM, and rewrites mantissa multiplication into addition-based approximate FP arithmetic. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Best corpus tags | `hardware-software-co-design`, `precision-abstraction`, `numeric-format`, `operator-mapping`, `RRAM-CIM`, `3D-SRAM-CIM`, `analog-CIM`, `digital-CIM`, `attention-free-LLM`, `simulator-backed-evaluation` | Tags reflect the evidenced contribution rather than a general compiler/IR stack. |
| Closest comparison baselines | ReD-CIM; MNSIM 2.0; configurable multi-precision single-bit RRAM framework; PRIME/ISAAC-style RRAM analog PIM; LLM-FP4/NF-style non-uniform quantization | ReD-CIM is used as a hybrid-PIM EWM comparison, MNSIM 2.0 is the RRAM simulation backend, the single-bit RRAM framework is the PIM baseline, PRIME/ISAAC are nearby analog crossbar accelerators, and LLM-FP4/NF are nearby non-uniform format references. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |

## 2. One-paragraph public summary

This paper contributes a hardware-software co-design for attention-free LLM inference that makes the MVM/EWM split in Mamba and RWKV the central optimization boundary. Its clearest CIM-stack contribution is a precision-and-arithmetic layer: PN, a PIM-oriented exponent-free non-uniform weight format that preserves bit-sliced analog RRAM MVM execution, and a multiplication-free approximate FP16 EWM implementation mapped onto a proposed 3D-SRAM digital PIM array. The demonstrated path is not a general compiler IR, but it does expose useful compiler/IR ingredients: a named numeric representation, a group-wise offline parameter-search algorithm, an operator-to-hardware mapping rule, a PN shift configuration boundary, conversion units between INT and FP stages, and simulator/synthesis-backed hardware evaluation for Mamba/RWKV families. The work is therefore best placed as a narrow end-to-end co-design with a strong isolated precision/mapping abstraction, relevant to CIM compiler research as evidence for treating bit significance, scaling-factor propagation, operator sensitivity, and domain transition as first-class lowering state. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Attention-free LLM inference is bottlenecked by memory-bound MVMs and EWMs. | Abstract, Introduction, Figures 2–3 | Experiment / workload characterization | The paper identifies MVMs and EWMs as the main inference operators for Mamba and RWKV, with Mamba/RWKV block equations showing hidden-state update and time-mixed input patterns. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Demonstrated for Mamba/RWKV-style attention-free LLM blocks; not presented as a general workload compiler for arbitrary neural networks in the ICCAD paper. |
| Different operators should use different data formats based on quantization sensitivity. | Section 3.1, Table 2 | Experiment / paper-only analysis | MVMs are treated as relatively quantization-tolerant, while EWMs show notable accuracy loss under INT-W8A8; Approx-FP16 EWM is close to the FP baseline in Table 2. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | The paper-level evidence supports operator-specific precision selection for the evaluated attention-free LLM setting. |
| PN enables non-uniform weight representation while preserving bit-sliced analog RRAM MVM equivalence. | Section 3.2, Equations 8–11, Algorithm 1, Figure 6 | Equation / algorithm | PN replaces fixed powers-of-two bit factors with learned scaling factors α_l, proves a bit-sliced accumulation identity, searches group-wise PN parameters, and aligns α_l to `Sy * Il` for full-INT runtime MVM. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | The reusable boundary is clearest at the numeric-format object and PN parameter list; the full compiler contract for arbitrary graph lowering is not serialized as a separate IR. |
| Approximate FP multiplication can reduce EWM hardware overhead. | Section 3.3, Equations 12–15, Table 2 | Equation / experiment | The mantissa multiplication is approximated using log/anti-log relations so that FP multiplication becomes sign XOR, exponent addition, mantissa addition, and overflow handling; Table 2 reports less than 0.5% accuracy loss for the approximation in the shown Mamba-130M EWM experiment. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Demonstrated for EWM arithmetic in the evaluated models; further reuse would depend on verifying error tolerance for other FP-sensitive operators. |
| Hybrid RRAM + 3D-SRAM PIM improves utilization and efficiency. | Abstract, Section 4, Figure 7 | Hardware design / experiment | The architecture maps PN-based MVMs to RRAM analog PIM and multiplication-free FP EWMs to a 3D-SRAM digital array; it includes LUTs, buffers, INT/FP conversion units, ADC/DAC paths, and PN shift configuration. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | The evidenced stack is an architecture template with simulator/synthesis-backed evaluation, rather than an artifacted backend that emits an instruction stream. |
| The design achieves near-FP accuracy and large speed/energy gains. | Abstract, Section 5, Tables 3–7, Figures 8–9 | Experiment | Accuracy is reported for Mamba 130M/370M/1.4B/2.8B and RWKV 169M/430M/1.5B/3B on HellaSwag, PIQA, Arc-Easy, and Winogrande; hardware evaluation uses MNSIM 2.0, Synopsys Design Compiler at TSMC 28 nm, and CACTI. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Evaluated through simulator/synthesis-backed experiments. Artifact-level confirmation of Figure 8/9 generation would require additional scripts or simulator modifications beyond the checked public repository. |
| PN has a public implementation. | GitHub repository `gld17/PN` | Code/artifact / documentation | The repository exposes example scripts for fixed PN parameter search and CNN quantization/evaluation, including `quant/pn_search.py`, `main.py`, quantization wrappers, checkpoints/assets folders, and shell commands. ([GitHub](https://github.com/gld17/PN)) | The artifact exposes PN quantization examples; the checked repository is partial for this paper’s full Mamba/RWKV + MNSIM + Synopsys/CACTI evaluation path. |

## 4. Stack anatomy

```text
Input / frontend:
  Pretrained Mamba/RWKV models and operator-level decomposition into MVMs, EWMs,
  nonlinear functions, hidden-state update, and buffers. This is a workload graph
  described in the paper, not a separately serialized frontend IR. Equations (1)–(2)
  define Mamba and RWKV update patterns; Figure 3 shows the block-level operator mix.

Middle representation:
  PN numeric format f_PN and the group-wise PN parameter list P_PN = {Sy, I}_{i→N}.
  This is an algorithmic/config representation: named in Algorithm 1, partly
  materializable as scaling factors and PN shift configuration, but not documented
  as a general compiler IR schema.

Mapping or scheduling state:
  Coarse operator mapping: MVM → RRAM analog PIM; EWM → 3D-SRAM digital PIM;
  nonlinear functions → LUT; intermediate/hidden state → buffer. PE counts depend
  on model size. Schedule details are largely implicit in the architecture and
  evaluation setup rather than exposed as a reusable schedule file.

Hardware abstraction:
  Hybrid hardware template with mixed-size RRAM PEs, bit-sliced crossbars, ADC/DAC,
  barrel shifter/add path, NoC/router merging, 3D-SRAM EWM array, INT-to-FP and
  FP-to-INT units, nonlinear LUT, buffer, and fixed hardware parameters such as
  256×256 / 16×16 RRAM crossbars and 2×64×64 3D-SRAM.

Backend / simulator / codegen:
  RRAM PEs are evaluated with MNSIM 2.0; digital circuits are synthesized with
  Synopsys Design Compiler at TSMC 28 nm; buffer and LUT are modeled with CACTI.
  No public compiler backend or generated instruction stream was found in the
  checked artifact.

Output artifact:
  Paper-level outputs: accuracy tables, hardware speed/energy comparisons, area
  and power breakdowns. Public repository outputs: PN search output and quantized
  CNN evaluation logs, as implied by README commands and main.py log writing.

Evaluation loop:
  Accuracy: Mamba/RWKV zero-shot datasets and data-format configurations.
  Hardware: model-dependent PE/EWM-array counts, MNSIM 2.0 for RRAM PEs,
  Synopsys DC for digital circuits, CACTI for buffer/LUT, GPU and PIM baselines.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of (1) operator partitioning into MVM, EWM, nonlinear functions, and buffer-resident hidden/intermediate values; (2) PN group parameters `{Sy, I}` plus shift configuration; (3) hardware-resource assignment to RRAM PEs, 3D-SRAM EWM arrays, LUT, conversion units, and buffer; and (4) simulator/synthesis parameters. The paper foregrounds arithmetic and architecture, while the reusable semantics are most visible in Algorithm 1, Equations 8–16, Figure 7’s hardware contract, and Table 4’s hardware configuration. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A5 narrow end-to-end co-design.**  
The paper owns a complete but narrow slice: attention-free LLM operator characterization, precision selection, PN parameter search, approximate FP EWM arithmetic, hybrid RRAM/3D-SRAM architecture, and simulator/synthesis-backed evaluation. The input is a Mamba/RWKV inference workload with MVM/EWM structure; the output is a set of hardware and accuracy results, rather than a compiler-produced executable artifact. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

**Secondary: A2 simulator & cost model.**  
The evaluation relies on MNSIM 2.0 for RRAM PEs, Synopsys Design Compiler at TSMC 28 nm for digital circuits, and CACTI for buffer/LUT. These form a simulator/synthesis-backed cost path, but the cost model is not exposed as a public standalone backend plugin in the checked artifact. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

**Secondary: A3 mapping / scheduling / DSE framework, narrow form.**  
The mapping is operator-specific: MVMs are assigned to RRAM analog PIM, EWMs to 3D-SRAM digital PIM, nonlinear functions to LUTs, and hidden/intermediate state to buffer. It is a mapping policy and hardware partition, not a general search framework over arbitrary CIM schedules. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

### 5.2 Axis B — middle-layer style

**B1 config-as-IR.**  
The named middle representation is the PN parameter list `P_PN = {Sy, I}_{i→N}` generated from pretrained weights, group size, and bit-width. Decisions made here include group partitioning, target distribution extraction, gradient-based scaling-factor search, and INT-mode alignment. Decisions embedded elsewhere include exact model import, full Mamba/RWKV execution schedule, simulator configuration, and model-size-dependent hardware resource counts. Upstream passes could plausibly read and rewrite `{Sy, I}` if serialized, but the paper does not define a general schema for it. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

**B4 hardware-resource IR.**  
The hardware abstraction is explicit as a hierarchy: host/DRAM, RRAM analog PIM with mixed-size PEs and crossbars, routers, buffer, SRAM digital PIM, 3D-SRAM EWM arrays, nonlinear LUT, and conversion units. Decisions made there include which resource class handles MVM/EWM/nonlinear functions and where data-format conversion occurs. The reusable object is closest to a hardware template and configuration table, not a formal resource dialect. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

**B6 accuracy / arithmetic modeling.**  
The paper models quantization sensitivity by operator class, PN representation error, scaling-factor search loss, and approximate FP multiplication error. This style is strongly evidenced by Equations 8–15, Algorithm 1, and Tables 2–5. The decisions that remain embedded are acceptable error thresholds, calibration/validation details, and complete reproduction workflow for the LLM experiments. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

**Secondary implicit B7 runtime-state abstraction.**  
The buffer stores fixed EWM parameters, hidden states to update, and intermediate MVM/EWM results. This is important for attention-free decoding, but it is represented as architecture state rather than as a typed runtime-state IR. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class hardware hierarchy** | RRAM PEs contain multiple crossbars for different weight bits; large PEs use 256×256 crossbars and small PEs use 16×16 crossbars; the EWM array is a 2×64×64 3D-SRAM structure. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Bit-slicing / bit significance | **First-class numeric/mapping object** | Equations 7–9 express bit-sliced accumulation; PN replaces fixed bit factors with α_l; Figure 7 uses crossbars for bit-7 through bit-0. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| ADC/DAC precision or sensing | **Parameter / costed component** | Figure 7 shows DAC, MUX & ADC, and ADC output; Table 4 specifies 8-bit, 1.3 GSps ADC and one ADC per eight columns. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Analog-to-digital or domain transition | **First-class / costed transition** | The design places INT-to-FP and FP-to-INT conversion units around the 3D-SRAM array and reports their area/power contribution. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Peripheral circuits as path nodes | **First-class / costed** | ADC, barrel shifter/add path, routers, LUTs, buffers, and conversion units are shown in Figure 7 and costed in Tables 6–7. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Partial-sum accumulation path | **Represented and reasoned about** | Equations 6–9 derive current accumulation and reconstruction across bit-sliced RRAM crossbars; routers merge PE outputs. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Reconstruction / shift-add tree | **First-class for PN implementation** | PN scaling factors are converted to INT factors, then approximated as sparse three-one-bit values so multiplication becomes three shift-and-add operations; the shift amount is stored in a PN shift configuration register file. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **Runtime state is parameter/implicit; masks, batching, sparsity not central** | The buffer stores fixed EWM parameters, hidden states, and intermediate results. The paper does not foreground masks, KV cache, batching, or sparsity as compiler objects. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |
| Value trajectory / flow path | **Approximated by architecture data path** | Figure 7 and Section 4 expose an MVM-results → buffer → EWM-results path with conversion units and LUTs, but value identity is not represented as a typed cross-operator trajectory. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) |

### 5.4 Axis D — rewrite object

The work rewrites four main objects:

1. **Numeric format:** FP/INT weight values are rewritten into PN encoded values plus bit-level scaling factors α_l, then into INT runtime factors `Il` and a shared layer-level factor `Sy`.
2. **Arithmetic:** EWM FP16 multiplication is rewritten from mantissa multiplication to addition-based approximate FP multiplication.
3. **Operator mapping:** MVMs are assigned to analog RRAM PIM; EWMs are assigned to 3D-SRAM digital PIM; nonlinear functions are assigned to LUTs; format transitions are assigned to conversion units.
4. **Peripheral implementation:** PN factor multiplication is rewritten into shift-and-add using a sparse 8-bit factor approximation.

Legal transformations in the paper include group-wise PN parameter search, INT-mode scaling-factor alignment, shift-and-add replacement for PN scaling, approximate FP mantissa multiplication, and fixed operator-to-hardware partitioning. The core equivalences are the PN bit-sliced accumulation identity in Equation 9 and the FP mantissa approximation in Equations 12–14. The lowering must preserve weight-group scaling semantics, bit significance, activation INT assumptions for MVMs, FP16-sensitive EWM values, hidden-state update semantics, and conversion boundaries. The representation is especially well suited to precision/mapping co-design for MVM/EWM workloads; expressing cross-operator bit-sliced partial-sum movement, delayed ADC conversion, alternative reduction trees, or global trajectory rewrites would likely require an additional abstraction for value identity across analog, digital, reconstructed, reduced, and stored forms. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

## 6. Technical mechanism reading

### 6.1 Operator sensitivity drives the stack cut

The paper begins by observing that Mamba and RWKV replace attention with recurrent/state-space or linear-attention-style computation, but still expose heavy MVM and EWM workloads. Mamba’s update uses element-wise operations in the hidden-state recurrence, while RWKV mixes current and previous token input before linear layers. This matters for CIM compilation because the candidate “IR object” is not a transformer attention graph; it is an operator partition with MVMs, EWMs, nonlinear functions, hidden states, and buffers. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

The precision split follows operator sensitivity. For MVMs, the paper argues that non-uniform formats better match pretrained weight distributions, while analog RRAM needs a bit-sliced, accumulation-compatible representation. For EWMs, Table 2 shows INT-W8A8 EWM causes sizable accuracy loss on Mamba-130M, whereas Approx-FP16 remains close to the base FP behavior. This creates the co-design rule: use PN/INT for MVM weights/activations and approximate FP16 for EWM. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

### 6.2 PN as a PIM-compatible non-uniform weight type

The PN mechanism starts from the constraint that an RRAM crossbar accumulates currents corresponding to bit-sliced partial products. For INT, reconstruction is compatible with summing crossbar outputs weighted by powers of two. For FP/NF, exponent alignment and mantissa arithmetic break that direct bit-sliced accumulation. PN restores the bit-sliced property by defining a real value as a sum over encoded bits weighted by adjustable scaling factors α_l. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

The key IR-like feature is that α_l is not merely a quantizer parameter; it is also a hardware reconstruction contract. Equation 9 shows that the output can be reconstructed by weighting each bit-slice accumulation `y_j[l]` by α_l. Algorithm 1 then produces a parameter list from pretrained weights, group size, and bit-width: partition weights into groups, compute a target distribution, initialize PN parameters, update with gradient descent until a threshold, and align the resulting factors into `Sy` and integer `I`. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

The INT-mode alignment step is especially relevant to CIM IR design. The paper converts α_l into `Sy * Il`, with `Il` as an 8-bit integer and `Sy` as a shared FP factor. Because `Sy` is shared among weight groups in one layer, the paper states it can be passed forward and processed at the model output, leaving runtime MVMs as full-INT operations. This is effectively a scale-propagation rewrite, similar in spirit to quantized compiler scale folding, but specialized to RRAM bit-sliced execution. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

### 6.3 Shift-and-add PN reconstruction as backend contract

At the hardware level, the RRAM PE contains multiple crossbars corresponding to different bits of a weight matrix. For PN, the ADC outputs of each crossbar must be multiplied by INT scaling factors before summation. The paper avoids a general multiplier by approximating each 8-bit factor as a value with three one-bits and five zero-bits, converting multiplication into three shift-and-add operations. The shift amounts are read from a PN shift configuration register file configured offline after PN search. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

For a compiler/IR reader, the backend contract is therefore:

- each weight bit-slice has a corresponding crossbar output,
- each bit-slice has a configured integer scaling factor,
- the factor is implemented by a small shift-add sequence,
- a shared scale may be delayed across the layer or model boundary,
- the analog output path includes ADC and digital reconstruction.

This is a compact and useful abstraction for a future precision-aware CIM lowering pass.

### 6.4 Multiplication-free FP EWM path

For EWMs, the paper keeps FP16 semantics approximately rather than quantizing everything to INT. It decomposes FP multiplication into sign XOR, exponent addition, and mantissa multiplication. The mantissa multiplication is approximated using `log2(1+k) ≈ k` and `2^k ≈ k+1`, making the mantissa product approximately additive, with overflow handled by shifting mantissa bits and incrementing the exponent. The paper gives the resulting error expression and reports that Approx-FP16 has less than 0.5% accuracy loss in the shown EWM sensitivity experiment. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

The hardware implementation maps this arithmetic to a two-layer 3D-SRAM EWM array with a base compute die. Two 16-bit operands are stored in different SRAM dies, moved vertically through VBLs, and computed in the bottom die’s multiplication-free FP unit. The claimed utilization improvement comes from vertically transferring operand pairs and opening the relevant cells for element-wise pairing, rather than forcing EWM into an MVM-shaped SRAM access pattern. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

### 6.5 Evaluation and cost path

The hardware configuration table specifies an NVIDIA A100 baseline, RRAM crossbar sizes of 256×256 and 16×16, 8-bit 1.3 GSps ADCs, one ADC per eight columns, a 2×64×64 3D-SRAM EWM array, 64 INT-to-FP and 64 FP-to-INT units, 1 GHz digital frequency, 192 KB buffer, and 64 KB LUT. RRAM PEs are simulated with MNSIM 2.0, digital circuits are synthesized using Synopsys Design Compiler at TSMC 28 nm, and CACTI is used for buffer/LUT modeling. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

Accuracy is evaluated on Mamba 130M/370M/1.4B/2.8B and RWKV 169M/430M/1.5B/3B over HellaSwag, PIQA, Arc-Easy, and Winogrande. Table 3 reports W8A8 results, while Table 5 reports W4A8 results; the paper states PN-W8A8 consistently improves over INT and approaches FP accuracy, and PN-W4A8 improves average accuracy over INT-W4A8 for Mamba and RWKV. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

The performance evaluation compares GPU, an RRAM PIM baseline, and a hybrid baseline using ReD-CIM for EWM. The paper reports 49.9–89.6× speedup and 167.3–2537.1× energy-efficiency improvement over GPU, plus up to 3.1× overall speedup over the ReD-CIM hybrid baseline and 6.1× EWM speedup / 54.8× EWM energy savings for the EWM-specific comparison. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf))

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — PN is a numeric type with a backend reconstruction contract

- **Observation:** PN is defined as adjustable bit factors α_l, but the paper immediately ties those factors to analog bit-slice accumulation and shift-add reconstruction after ADC.
- **Why it matters for CIM compiler/IR work:** This suggests a useful type-system direction: a tensor value could carry bit-slice weights, group scale, reconstruction path, and legal accumulation domain as type-like metadata.
- **Reusable lesson:** Future CIM IRs can borrow the separation between encoded bits, per-bit significance, shared scale, and backend reconstruction primitive.

### Insight 2 — Scale propagation is the quiet compiler move

- **Observation:** The shared `Sy` factor is passed forward and processed outside the actual runtime MVM, allowing the RRAM path to remain full-INT.
- **Why it matters for CIM compiler/IR work:** This is a scale-motion rewrite across operator boundaries. It resembles quantization compiler rewrites, but here the reason is analog PIM compatibility rather than vector ALU efficiency.
- **Reusable lesson:** A CIM IR should represent which scale factors are consumed locally, delayed, folded into later operations, or emitted as final reconstruction metadata.

### Insight 3 — Operator sensitivity, not memory technology alone, defines the partition

- **Observation:** The paper maps MVMs and EWMs to different PIM substrates because their arithmetic sensitivity and utilization patterns differ.
- **Why it matters for CIM compiler/IR work:** A useful middle layer would annotate operators with arithmetic tolerance, accumulation depth, memory reuse, and PIM utilization shape.
- **Reusable lesson:** “MVM vs EWM” can be treated as a lowering class with associated legal formats and hardware modes, rather than as a generic graph node label.

### Insight 4 — The buffer is a latent runtime-state object

- **Observation:** The architecture buffer stores fixed EWM parameters, hidden states, and intermediate results crossing MVM and EWM units.
- **Why it matters for CIM compiler/IR work:** Attention-free inference depends on recurrent hidden state. A static-only mapping IR would miss the persistent state that mediates the PIM data path.
- **Reusable lesson:** Future static-plus-runtime CIM IRs could model hidden-state buffers, update frequency, and conversion points as first-class runtime state.

### Insight 5 — The public artifact exposes the precision layer more clearly than the full architecture stack

- **Observation:** The repository provides PN search and quantization/evaluation scripts, while the paper’s MNSIM/Synopsys/CACTI evaluation path is described in prose rather than exposed as a runnable public flow.
- **Why it matters for CIM compiler/IR work:** The reusable boundary is currently the numeric-format layer and PyTorch quantization wrappers, not the full PIM backend.
- **Reusable lesson:** Corpus classification should record this as “partial artifact: PN precision layer,” separating it from paper-level architecture claims.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found; artifact is partial for this ICCAD paper.**

- **Artifact identifier:** GitHub repository `gld17/PN`. The repository title and README describe PN as a PIM-oriented non-uniform format and link to the paper. ([GitHub](https://github.com/gld17/PN))
- **License:** Unknown / not found in the checked sources. The checked root listing shows README, `main.py`, `run.sh`, `utils.py`, `quant`, `ckpts`, and `assets`, but no visible LICENSE file. ([GitHub](https://github.com/gld17/PN))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** Example PN scripts, including fixed PN parameter search (`python quant/pn_search.py`) and model quantization/evaluation commands; PyTorch quantization wrappers replace Linear/Conv2d modules with W/A quantized versions; quantization functions include INT, NF, PN, and related modes. ([GitHub](https://github.com/gld17/PN))
- **What the artifact appears to omit:** A documented Mamba/RWKV end-to-end evaluation script, MNSIM 2.0 modifications/configs for the proposed hybrid architecture, Synopsys Design Compiler scripts, CACTI configuration, Figure 8/9 plotting scripts, and a serialized compiler/mapping IR were not found in the checked repository pages.
- **Minimal documented workflow:** README gives `python quant/pn_search.py` for fixed PN parameter search and `python main.py --model_name mobilenetv2 --dataset imagenet --gpu_id 3 --w_bit 4 --a_bit 8 --w_mode pn --a_mode int` for quantization/evaluation. ([GitHub](https://github.com/gld17/PN))
- **Whether paper figures appear reproducible from artifact:** Unknown / not documented. The repository documents PN examples and CNN quantization commands; the paper’s Mamba/RWKV performance figures rely on simulator/synthesis tools described in the paper. ([GitHub](https://github.com/gld17/PN))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper documents pretrained weights for PN search and Mamba/RWKV workloads; repo documents CNN model/dataset command-line flags. |
| Intermediate representation serialized | Partial | PN parameter list is defined in Algorithm 1, and repo uses PN quantization tables/files; no general IR schema found. |
| Mapping decisions inspectable | Partial | Operator mapping is explicit in paper figures/text; no public mapping dump found. |
| Schedule inspectable | Unknown | No schedule file or instruction trace found. |
| Hardware config explicit | Yes | Table 4 gives hardware parameters; Figure 7 gives architecture components. |
| Precision / bit-slice assumptions explicit | Yes | PN equations, Algorithm 1, and shift-add implementation describe bit significance and scaling factors. |
| Cost model inspectable | Partial | Methodology names MNSIM 2.0, Synopsys DC, and CACTI; underlying configs/scripts not found in public artifact. |
| Simulator backend documented | Partial | Backend tools are identified, but the customized flow is not publicly documented in the checked repo. |
| Generated code / instruction stream inspectable | N/A / Unknown | No compiler-generated instruction stream is described or artifacted. |
| Provenance from source op to backend action | Partial | MVM/EWM mapping is clear at operator class level; source-node-to-resource traces are not exposed. |
| Reproduction scripts available | Partial | PN search and quantization examples exist; full paper reproduction scripts not found. |
| Calibration source documented | Partial | Hardware methodology cites simulator/synthesis/CACTI; calibration details for modified models and hardware flow are not exposed in the checked artifact. |

### 8.3 Integration helper

- **As frontend:** Reuse is limited. The paper’s Mamba/RWKV block decomposition is useful, but the public artifact’s documented command path targets CNN-style PyTorch evaluation rather than a Mamba/RWKV importer.
- **As IR inspiration:** Strong. PN parameters `{Sy, I}`, bit-slice scaling factors, delayed shared scale, PN shift configuration, and format-transition nodes are useful abstractions for a CIM precision dialect.
- **As mapper/scheduler:** Medium. The fixed MVM→RRAM and EWM→3D-SRAM mapping can be adapted as a rule-based lowering pass for attention-free LLMs.
- **As cost model:** Medium at paper level, lower at artifact level. The metrics and backend tools are clear, but reusable cost plugins would require reconstructing simulator/synthesis inputs.
- **As backend:** Low-to-medium. The RRAM and 3D-SRAM hardware contracts are clear enough to wrap conceptually, but no public backend interface or instruction format was found.
- **As benchmark:** Medium. Mamba/RWKV model families and zero-shot datasets provide a useful benchmark slice for attention-free LLM CIM stacks.
- **As validation source:** Medium. The paper provides simulator/synthesis-backed results, but no chip-in-loop or public hardware measurements were found.

**Integration effort estimate: Medium to High.**  
Integration would be most direct through the PN precision layer: extract PN parameter search, serialize `{Sy, I}`, and attach it to weight tensors in an existing compiler. Reusing the full hybrid PIM backend would require additional adapters or reimplementation for MNSIM 2.0 configuration, 3D-SRAM EWM modeling, conversion-unit costs, and source-op-to-resource provenance. The most valuable reusable boundary appears to be the precision-and-reconstruction contract rather than an end-to-end compiler pipeline.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **MNSIM 2.0** | Simulator/cost modeling for PIM architectures | Used here as RRAM PE evaluation backend; this paper adds a workload-specific precision/arithmetic layer and hybrid RRAM/3D-SRAM architecture. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Classify MNSIM-like work as A2, while this paper is A5 with A2 dependence. |
| **Configurable multi-precision CNN computing framework based on single-bit RRAM** | Multi-precision RRAM mapping and RRAM PIM baseline | Used as the PIM baseline; this paper adds PN non-uniform factors and attention-free LLM EWM handling. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Distinguish conventional bit-sliced INT/fixed-point RRAM compilation from PN-style non-uniform bit significance. |
| **ReD-CIM** | Digital SRAM-CIM with unified FP/INT pipeline | Used as hybrid-PIM EWM baseline; this paper’s EWM path uses approximate FP multiplication and 3D-SRAM layout to improve EWM utilization. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Useful comparison for digital-CIM FP support versus approximate arithmetic plus layout co-design. |
| **PRIME / ISAAC-style RRAM accelerators** | Analog RRAM crossbar MVM acceleration | These are analog MVM accelerators; this paper focuses on making non-uniform numeric format compatible with bit-sliced analog accumulation and adding a digital EWM substrate. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | Keep analog-CIM architecture papers separate from works that introduce an explicit precision/reconstruction abstraction. |
| **LLM-FP4 / NF-style quantization work** | Non-uniform low-bit formats for LLMs | These motivate non-uniform representation, while this paper modifies the format to preserve analog PIM bit-slice accumulation. ([NIC SEFC](https://nicsefc.ee.tsinghua.edu.cn/nics_file/pdf/3b18c2b6-a7c4-439d-9fa8-d6276749f085.pdf)) | For corpus tagging, separate “quantization format for accuracy” from “quantization format as backend-executable CIM object.” |

## 10. Corpus-ready final takeaway

- The paper’s real CIM-stack contribution is a precision/arithmetic co-design layer for attention-free LLM inference, centered on PN for RRAM MVMs and approximate FP16 EWM arithmetic for 3D-SRAM digital PIM.
- The strongest reusable stack object is the PN parameter/reconstruction contract: group-wise scaling factors, INT-mode alignment, delayed shared scale, and shift-add backend configuration.
- The demonstrated scope is Mamba/RWKV inference with MVM/EWM operator specialization, evaluated through accuracy experiments and simulator/synthesis-backed hardware modeling.
- First-class CIM objects include bit-sliced RRAM crossbars, ADC/DAC path, PN shift configuration, barrel shifter/add reconstruction, 3D-SRAM EWM array, INT/FP converters, LUT, and hidden/intermediate-state buffer.
- The hidden IR is the combination of operator partition, PN parameter list, shift configuration, resource assignment, hardware configuration table, and simulator assumptions.
- Artifact status: public artifact found, but partial for this paper; the repository exposes PN search/quantization examples rather than the full Mamba/RWKV + MNSIM + Synopsys/CACTI reproduction flow.
- Integration is most direct as IR inspiration or a precision-lowering plugin; using it as a full backend would require reconstructing simulator configs, scheduling/resource traces, and hardware cost adapters.
- For a value-trajectory CIM IR, the paper supplies strong ingredients for representing bit significance, reconstruction path, conversion boundaries, and buffer-mediated runtime state, while trajectory-level rewrites would need an additional explicit value-flow abstraction.
