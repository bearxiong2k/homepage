---
slug: openc2
title: "OpenC2: An Open-Source End-to-End Hardware Compiler Development Framework for Digital Compute-in-Memory Macro"
short_title: "OpenC2"
subtitle: "Scoped CIM stack note"
year: 2025
publication:
  venue: "DATE 2025"
  type: "conference"
  doi: "10.23919/DATE64628.2025.10992965"
  url: "https://doi.org/10.23919/DATE64628.2025.10992965"
authors:
  - "Tianchu Dong"
  - "Shaoxuan Li"
  - "Yihang Zuo"
  - "Hongwu Jiang"
  - "Yuzhe Ma"
  - "Shanshi Huang"
author_note: "HKUST(GZ)"
citation_source: https://dblp.org/rec/conf/date/DongLZJMH25
bibtex: |
  @inproceedings{DBLP:conf/date/DongLZJMH25,
    author       = {Tianchu Dong and
                    Shaoxuan Li and
                    Yihang Zuo and
                    Hongwu Jiang and
                    Yuzhe Ma and
                    Shanshi Huang},
    title        = {{OpenC\({}^{\mbox{2}}\)}: An Open-Source End-to-End Hardware Compiler
                    Development Framework for Digital Compute-in-Memory Macro},
    booktitle    = {Design, Automation {\&} Test in Europe Conference {\&} Exhibition,
                    {DATE} 2025, Lyon, France, March 31 - April 2, 2025},
    pages        = {1--2},
    publisher    = {{IEEE}},
    year         = {2025},
    doi          = {10.23919/DATE64628.2025.10992965},
    url          = {https://doi.org/10.23919/DATE64628.2025.10992965}
  }
summary: >-
  OpenC² contributes an open-source, template-based hardware generation and physical-design flow for digital SRAM compute-in-memory macros. Its strongest demonstrated stack layer is the backend macro generator: from top-level macro parameters, customized cells, and 45 nm FreePDK technology/library inputs, it emits Verilog and SPICE front-end netlists plus DEF/GDSII layout artifacts through open-source EDA tools. The paper demonstrates this flow for DCIM macro construction, including a 64×64, 4-bit-by-4-bit example and macro-level area, power, and energy-efficiency comparisons. For CIM compiler/IR research, OpenC² is best read as a backend-plugin case study: it makes macro shape, precision fields, hardware hierarchy, and physical layout generation concrete, while the effective intermediate semantics are distributed across configuration values, Python templates, generated netlists, Yosys scripts, and DEF/LEF/GDS metadata rather than a standalone CIM IR. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))
links:
  paper: https://researchportal.hkust.edu.hk/en/publications/opencsup2sup-an-open-source-end-to-end-hardware-compiler-developm/
  artifact: https://github.com/OpenC2-official/OpenC2_V1.0
  docs:
  code:
technology:
  - "SRAM-CIM"
  - "digital-CIM"
workloads:
  - "DCIM macro generation"
  - "VMM-oriented digital CIM macro context"
  - "64x64 4-bit x 4-bit generated macro example"
  - "macro-size PPA comparison"
tags: []
baselines: []
axis_A:
  primary: A1
  secondary: [A5, A2]
axis_B: [B1, B4]
axis_C_first_class_objects:
  - "macro rows and columns"
  - "input and weight bit widths"
  - "DCIM column"
  - "SRAM with read/write circuitry"
  - "bitcell array"
  - "adder tree"
  - "accumulator"
  - "decoder"
  - "input and wordline drivers"
  - "control block"
  - "DEF/LEF/GDS layout metadata"
axis_D_rewrite_objects:
  - "hardware topology"
  - "module expansion"
  - "array binding"
  - "bit-width propagation"
  - "memory layout / physical placement"
  - "backend EDA flow trajectory"
artifact:
  status: "public artifact found"
  url: "https://github.com/OpenC2-official/OpenC2_V1.0"
  license: "Unknown / not found in checked sources"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "cost_model"
  - "backend"
  - "benchmark"
  - "validation"
reproducibility_level: low
notes:
  - "Best treated as a backend-plugin case study rather than an application-level CIM compiler stack."
  - "The most auditable boundary is macro configuration to generated Verilog/SPICE/DEF/GDSII."
  - "Several semantic decisions are embedded in templates, scripts, generated EDA files, and layout metadata."
  - "A trajectory-IR extension would add explicit value identity, bit significance, precision stage, and path annotations above the current macro generator."
takeaways: []
---

# OpenC² — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A1 Macro / circuit generator** | OpenC² is presented as an “end-to-end hardware compiler” whose demonstrated input is a set of DCIM macro parameters plus technology/library files, and whose outputs are Verilog/SPICE netlists and DEF/GDSII layout artifacts. The paper’s workflow is macro-hardware generation and physical-design assembly rather than application-level CIM compilation. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Secondary stack role, Axis A | **A5 Narrow end-to-end co-design**, with some **A2 macro-level PPA reporting** | The “end-to-end” slice is credible from macro specification and cell libraries to generated front-end and back-end hardware artifacts. The evaluation reports area, power, and energy-efficiency comparisons for generated DCIM macros, but the evidenced loop is at the macro/backend level. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Middle-layer style, Axis B | **B1 Config-as-IR; B4 Hardware-resource IR** | The main reusable middle object is the macro configuration: rows, columns, weight bit width, input bit width, technology files, and customized standard-cell/DCIM libraries. The generated hierarchy also names hardware resources such as SRAM-with-R/W, DCIM columns, adder trees, accumulators, decoders, drivers, control, LEF/DEF/GDS layout objects, and Yosys command files. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| First-class CIM objects, Axis C | **Macro dimensions; SRAM/DCIM column hierarchy; weight/input precision; adder tree; accumulator; decoder/driver/control blocks; physical-layout metadata** | These are named in the paper’s flow and in artifact generators. The artifact exposes parameterized Verilog/SPICE generators and physical-design scripts for submodules and top-level layout. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/source/frontend/spice_generator)) |
| Rewrite object, Axis D | **Hardware topology, module expansion, layout placement/routing trajectory, numeric bit-width propagation** | The tool rewrites top-level scalar macro parameters into a concrete module hierarchy, synthesized/flattened Verilog, SPICE, LEF/DEF/GDS layout artifacts, and physical placement formulas. It does not expose a separate neural-network graph IR, instruction stream, or application schedule in the checked sources. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_macro_generator.py)) |
| Best corpus tags | `digital-CIM`, `SRAM-CIM`, `macro-generator`, `physical-design-flow`, `template-codegen`, `Verilog`, `SPICE`, `DEF-GDSII`, `FreePDK45`, `backend-plugin-case-study` | Tags reflect the demonstrated artifacts and the compiler/IR boundary visible in the paper and repository. |
| Closest comparison baselines | **AutoDCIM, ARCTIC, SynDCIM, SEGA-DCIM, OpenACM** | These works are close because they also address automated DCIM macro generation, parameterized CIM hardware, layout/PPA flow, precision support, or open-source CIM hardware compilation. OpenC² is especially close to AutoDCIM because the paper compares generated macro area/efficiency against AutoDCIM. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |

## 2. One-paragraph public summary

OpenC² contributes an open-source, template-based hardware generation and physical-design flow for digital SRAM compute-in-memory macros. Its strongest demonstrated stack layer is the backend macro generator: from top-level macro parameters, customized cells, and 45 nm FreePDK technology/library inputs, it emits Verilog and SPICE front-end netlists plus DEF/GDSII layout artifacts through open-source EDA tools. The paper demonstrates this flow for DCIM macro construction, including a 64×64, 4-bit-by-4-bit example and macro-level area, power, and energy-efficiency comparisons. For CIM compiler/IR research, OpenC² is best read as a backend-plugin case study: it makes macro shape, precision fields, hardware hierarchy, and physical layout generation concrete, while the effective intermediate semantics are distributed across configuration values, Python templates, generated netlists, Yosys scripts, and DEF/LEF/GDS metadata rather than a standalone CIM IR. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| “First open-source end-to-end framework” for automated DCIM macro generation | Abstract, introduction, conclusion | Paper-only + code/artifact | The paper describes a flow from macro specifications and libraries to Verilog/SPICE and DEF/GDSII. A public GitHub repository exists with source, libraries, and generated example results. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Demonstrated scope is an end-to-end **DCIM macro hardware-generation** slice. The checked sources do not show an application frontend, neural-network graph importer, explicit CIM IR, runtime, or benchmark harness. |
| Generates front-end netlists in Verilog/SPICE and back-end layouts in DEF/GDSII | Abstract, Fig. 1, Section II | Code/artifact + paper | The repository contains frontend Verilog/SPICE generator directories, backend placement/routing/top-module generation scripts, and generated example outputs for a 64×64 4-bit×4-bit macro. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/source/frontend/spice_generator)) | The reusable boundary is clearest at macro configuration → hardware files. A documented, end-user CLI or formal schema was not found in the checked README. |
| Uses top-level specifications and customized cell/technology libraries as inputs | Fig. 1, Section II-A | Documentation + code/artifact | The paper names rows `r`, columns `c`, weight precision `w`, and input precision `i`; the repository includes `library` subfolders for GDS, LEF, Liberty, SPICE, Verilog, and layermap files. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Input format is partially documented through paper figures and hard-coded script parameters. A separate machine-readable IR/schema for upstream tools was not found in checked sources. |
| Template-based generation improves adaptability across technologies, sizes, and configurations | Abstract, intro, conclusion | Algorithm/code pattern + paper-only | Python generators parameterize macro rows, columns, input/weight widths, and module naming; physical scripts compute dimensions and placements from submodule area data and bit-width formulas. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/generate_dcim_macro_verilog_file.py)) | The paper-level evidence supports parameter adaptation inside the DCIM macro generator. Artifact-level reuse across other process technologies would depend on supplying compatible cells, technology files, and EDA setup. |
| Generates a regular DCIM macro hierarchy with bitcell arrays, adder tree, accumulator, drivers, and control | Fig. 2, Section II-B/C | Code/artifact + paper | Fig. 2 shows DCIM column, bitcell array, adder tree, accumulator adder, sign processing, shift DFF, input/WL drivers, and control block; artifact generators create SRAM-with-R/W, adder tree, accumulator, DCIM column, decoder, driver, and top module. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Demonstrated hierarchy is a digital SRAM-CIM macro hierarchy. Workload-level mapping onto multiple macros or scheduling across layers is outside the evidenced artifact boundary. |
| Uses open-source tools, including Yosys, NTUPlace, Qrouter, and KLayout | Fig. 1, Sections II-C/D | Paper-only + artifact files | The paper’s flow explicitly names these tools, and the artifact includes Yosys command files in the generated example. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | The checked README is minimal, so a complete reproducible invocation sequence and tool-version contract remain most visible through scripts and generated folders rather than top-level documentation. |
| Achieves compact layout and improved area efficiency over AutoDCIM | Abstract, Section III, Figs. 3–6 | Experiment | The paper reports more than 30% area reduction and more than 40% area-efficiency improvement versus AutoDCIM, along with power and energy-efficiency comparisons normalized to process node and INT4. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Evidence is macro-level PPA comparison. The checked repository exposes a generated 64×64 4-bit×4-bit result, while scripts/data to regenerate every plotted figure were not clearly documented in the top-level README. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/results/dcim_macro_64x64_for_4bitx4bit)) |
| Provides a generated 64×64, 4-bit×4-bit DCIM macro example | Section III-B, Fig. 7 | Experiment + artifact | The paper shows a 64×64, 4-bit-by-4-bit layout example; the repository includes `results/dcim_macro_64x64_for_4bitx4bit` with frontend and backend artifacts. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Shown through artifact examples for one concrete macro configuration. Broader figure reproduction would require reconstructing the workflow and tool environment from scripts. |

## 4. Stack anatomy

```text
Input / frontend:
```

Top-level DCIM macro configuration: number of rows `r`, number of columns `c`, weight bit width `w`, input bit width `i`, plus technology files and customized standard-cell / DCIM cell libraries. This is a config object rather than an application graph or tensor program. It is partially inspectable in the paper’s Fig. 1 and in generator scripts that hard-code or pass `num_row`, `num_col`, `weight_bit_width`, and `input_bit_width`. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

```text
Middle representation:
```

The middle representation is the generated hardware hierarchy: decoder, drivers, SRAM-with-R/W, DCIM columns, adder tree, accumulator, control, and top macro. It is serialized mainly as Verilog/SPICE and later as DEF/LEF/GDS layout metadata, rather than as a standalone CIM IR. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_macro_generator.py))

```text
Mapping or scheduling state:
```

Mapping state is macro-shape and module-placement state: row/column dimensions, bit widths, partial-sum bit widths, repeated column groups, named submodules, submodule areas, pin locations, and placement coordinates. It is inspectable in Python generator scripts and generated DEF/LEF files, but not presented as a separate mapping log or schedule IR. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/generate_def_for_top_module.py))

```text
Hardware abstraction:
```

The hardware abstraction is a digital SRAM-CIM macro with customized bitcell/SRAM read-write structures, adder-tree reduction, accumulator/sign/shift logic, decoder, drivers, and control. The paper foregrounds this as a macro-level DCIM architecture; the artifact exposes corresponding generator files and library folders. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

```text
Backend / simulator / codegen:
```

Backend code generation emits Verilog and SPICE templates, uses Yosys for control synthesis/flattening, and uses physical-design scripts plus NTUPlace, Qrouter, and KLayout for placement, routing, and GDSII assembly. This is a codegen/EDA backend rather than a workload simulator. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

```text
Output artifact:
```

Generated artifacts include Verilog, SPICE, Yosys command files, LEF, DEF, and GDS files. The repository includes an example result directory for `dcim_macro_64x64_for_4bitx4bit` with frontend and backend subfolders. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/results/dcim_macro_64x64_for_4bitx4bit))

```text
Evaluation loop:
```

The evaluation loop is macro-level physical/PPA comparison: generated layout area, area efficiency, power, and energy efficiency against AutoDCIM and other DCIM macros, normalized as described in the paper. The paper’s figures provide the main evidence; the artifact provides generated example files but the checked top-level README does not document a complete figure-reproduction workflow. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of scalar macro parameters, Python template function boundaries, module naming conventions, bit-width formulas, generated Verilog/SPICE, Yosys scripts, and DEF/LEF/GDS placement metadata. The paper foregrounds a template-based hardware compiler and datapath-aware floorplan, while the reusable semantics are most visible in the generator scripts and generated files: they encode what resources exist, how widths propagate, how repeated columns are assembled, where pins are placed, and how the top-level macro is physically constructed. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_macro_generator.py))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A1 Macro / circuit generator.**  
OpenC² belongs primarily in A1 because its owned stack slice begins with DCIM macro parameters and technology/cell-library inputs, then emits hardware netlists and layout. The paper explicitly defines the input/output boundary as top-level macro specifications and library files to Verilog/SPICE plus DEF/GDSII artifacts. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

**Secondary: A5 Narrow end-to-end co-design.**  
The framework is “end-to-end” inside a narrow macro-generation lane: configuration → template generation → synthesis/placement/routing → layout. This is a useful end-to-end backend flow, especially for physical-design-aware DCIM macro construction. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

**Secondary: A2 Simulator & cost model, limited to macro-level PPA reporting.**  
The paper reports area, power, and energy-efficiency comparisons and includes area-calculation scripts in the artifact. The strongest evidenced cost object is physical macro area and derived macro-level efficiency, with power/energy reported in the paper. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The named middle representation is a small set of macro parameters: rows, columns, weight precision, input precision, plus technology and library files. Decisions made there include macro size, array dimensions, precision-dependent module widths, and generated file names. Several downstream decisions remain embedded in generator templates, Yosys scripts, EDA setup, and physical-design formulas. A single upstream-readable IR artifact was not found; the closest reusable artifact is a parameter schema implicit in the scripts and paper figure. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

**B4 Hardware-resource IR.**  
The generated hardware hierarchy functions like a resource-level IR: SRAM-with-R/W, DCIM column, adder tree, accumulator, decoder, drivers, control, pins, nets, and layout macros are named and serialized. Decisions made at this level include module instantiation, bit-width expansion, physical size estimation, component placement, and top-level connectivity. Decisions such as legal retiming, application mapping, tensor lowering, and multi-macro scheduling would benefit from an additional representation above this hardware-resource level. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_column_generator.py))

**B6 Accuracy / nonideality modeling: not a primary style.**  
OpenC² is digital SRAM-CIM and the checked evidence centers on exact digital macro generation and physical PPA. Precision is parameterized through input and weight bit widths, but a reusable accuracy/nonideality IR or calibration model was not found in the checked sources. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **First-class macro hierarchy** | Rows, columns, DCIM macro, DCIM column, SRAM-with-R/W, decoder, drivers, accumulator, and top module are named in the paper and artifact scripts. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Bit-slicing / bit significance | **Parameter / implicit** | Weight and input bit widths are explicit parameters; the bit-level interpretation is embedded in generator logic, adder-tree/accumulator construction, sign processing, and layout naming rather than exposed as a separate type system. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/spice_generator/accumulator_generator.py)) |
| ADC/DAC precision or sensing | **N/A for the demonstrated digital SRAM-CIM flow** | The architecture is digital CIM with digital adder/accumulator structures; ADC/DAC objects are not central to this macro flow. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Analog-to-digital or domain transition | **N/A / implicit digital-domain path** | The demonstrated abstraction centers on digital SRAM-CIM macro construction; no analog-to-digital conversion stage is represented as a first-class object in the checked sources. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Peripheral circuits as path nodes | **First-class hardware modules** | Drivers, decoder, control block, adder tree, accumulator, sign processing, and shift DFF are shown in Fig. 2 and named in generators. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Partial-sum accumulation path | **First-class module / parameterized bit-width path** | The artifact computes `psum_bit_width` and `column_psum_bit_width` from weight width, input width, and input count, then emits accumulator structures. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/spice_generator/accumulator_generator.py)) |
| Reconstruction / shift-add tree | **Hard-coded / implicit in generated datapath** | Fig. 2 shows sign processing and shift DFF; the generator exposes adder tree and accumulator blocks, while reconstruction semantics are encoded in those templates rather than a separate rewriteable object. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Runtime state, masks, KV cache, batching, sparsity | **N/A / not found in checked sources** | The checked evidence is a static macro hardware-generation flow, not a runtime/programming stack. |
| Value trajectory / flow path | **Implicit through hardware topology and layout** | The path is visible as SRAM/DCIM column → adder tree → accumulator/control/pins in paper diagrams and generated modules, but value identity and domain-stage annotations are not serialized as a separate trajectory IR. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |

### 5.4 Axis D — rewrite object

The tool rewrites **macro configuration into hardware artifacts**. Concretely, it transforms row/column/precision parameters into module hierarchy, bit-width-dependent datapaths, synthesized/flattened Verilog, SPICE subcircuits, LEF/DEF/GDS physical layout, and EDA command files.

Legal transformations in the demonstrated framework include:

- expanding rows, columns, and bit widths into decoder, driver, SRAM, adder-tree, accumulator, and top-module instances;
- deriving partial-sum and output widths from weight/input precision and array dimensions;
- assembling repeated datapath blocks into a regular macro floorplan;
- synthesizing control RTL with Yosys;
- placing/routing submodules and merging layout into top-level GDSII.

The main equivalence exploited is **regular macro structure**: repeated DCIM columns and supporting datapath blocks can be generated, placed, and routed from a compact parameter set. Information preserved across lowering includes macro dimensions, bit widths, module names, pin names, library cells, net connectivity, layer information, and physical placement metadata.

The representation is especially well suited to backend macro materialization and physical hierarchy generation. Expressing graph-level operator fusion, cross-layer tiling, multi-macro scheduling, delayed numeric reconstruction, or runtime-dependent state would likely require an additional abstraction for tensor/operator provenance, value identity, and legal trajectory rewrites above the current macro generator.

## 6. Technical mechanism reading

### 6.1 Parameterized macro generation

The paper’s central interface is a top-level DCIM macro specification with `r` rows, `c` columns, weight bit width `w`, and input bit width `i`. These values are combined with technology files and customized cells to drive a template generator. The artifact mirrors this interface: the Verilog generator script passes `num_row`, `num_col`, `weight_bit_width`, and `input_bit_width` into `generate_dcim_macro_verilog_file`, then writes a top-level Verilog file under a result directory named by the macro configuration. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 6.2 Hardware hierarchy as the practical middle object

The generator constructs a hardware hierarchy rather than a workload IR. The Verilog macro generator includes a standard-cell library file and a flattened control file, then emits decoder, driver, DCIM column, and top-module code. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_macro_generator.py)) The DCIM column generator composes SRAM-with-R/W, adder tree, and accumulator submodules, which are the clearest named datapath resources exposed by the artifact. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_column_generator.py))

The accumulator generator makes one important bit-width rule explicit: it derives partial-sum and column partial-sum widths from weight bit width, input bit width, and the logarithm of the number of inputs. This is a small but useful example of a compiler-relevant numeric propagation rule embedded in backend generation code. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/spice_generator/accumulator_generator.py))

### 6.3 Netlist generation

The paper states that most regular submodules are generated by templates, while the control block is produced from an RTL template and synthesized to a gate-level netlist using Yosys. The repository’s generated example includes Yosys command files for flattening and synthesizing modules such as accumulator, adder tree, control, decoder, drivers, and SRAM-with-R/W. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

From a compiler-stack perspective, the netlist generator is the place where the abstract macro configuration becomes concrete resource allocation: bit-width fields determine submodule names, top-level ports, adder widths, accumulator widths, and generated file paths. This is the strongest point for wrapping OpenC² as a backend plugin.

### 6.4 Physical-design mechanism

The physical-design flow is datapath-oriented. The paper states that accumulator and control blocks are placed with NTUPlace, while other modules are optimized according to regular datapath structure; Qrouter performs routing and KLayout merges GDSII. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

The artifact’s backend scripts expose this mechanism at a concrete level. `generate_def_for_top_module.py` reads submodule area information, derives submodule names from macro parameters and bit-width formulas, computes macro width/height, emits DEF sections, and places repeated SRAM/adder/accumulator structures using coordinate formulas. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/generate_def_for_top_module.py)) The same script exposes named pins such as `din`, `dout`, `wl_address`, `rst`, `start`, `r_w_cim`, `out_*`, and `sign_out`, along with metal-layer geometry. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/generate_def_for_top_module.py))

### 6.5 Cost and evaluation model

The paper evaluates generated macro layouts using area, area efficiency, power, and energy efficiency. It defines area efficiency as normalized area per bit, compares against AutoDCIM, and reports more than 30% area reduction and more than 40% area-efficiency improvement in the evaluated macro setting. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

The artifact includes area-calculation scripts that read submodule `area.json` files and compute macro dimensions from submodule dimensions and macro parameters. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/calc_dcim_macro_area.py)) This makes area the most inspectable cost component in the checked artifact. The full power/energy calibration path for all paper figures is less directly documented in the top-level README, so reuse as a cost model would benefit from auditing the scripts and regenerating the EDA outputs under a controlled toolchain.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The backend contract is more concrete than the “compiler” label

- **Observation:** The paper uses compiler language, but the artifact’s clearest contract is macro configuration to Verilog/SPICE/DEF/GDSII. Rows, columns, bit widths, and library files are the practical input boundary.
- **Why it matters for CIM compiler/IR work:** This is a useful reminder that a CIM “compiler” may expose its most reusable interface at the hardware backend boundary rather than at graph, tensor, or instruction level.
- **Reusable lesson:** A future CIM IR stack could wrap OpenC² behind a backend dialect that lowers a typed macro-resource object into generated layout/netlist artifacts.

### Insight 2 — The generated hierarchy is a de facto hardware-resource IR

- **Observation:** SRAM-with-R/W, DCIM column, adder tree, accumulator, control, decoder, drivers, and layout macros are consistently named in the code and output directories. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/verilog_generator/verilog_generator/dcim_column_generator.py))
- **Why it matters for CIM compiler/IR work:** These names are close to the resource vocabulary a compiler backend needs for legality checking, cost modeling, and provenance from abstract macro resources to physical artifacts.
- **Reusable lesson:** The hardware hierarchy could be lifted into a declarative resource schema so upstream passes can inspect and rewrite macro shape before template emission.

### Insight 3 — Numeric propagation appears in backend code, not in a type system

- **Observation:** Partial-sum and output widths are derived in generator code from weight width, input width, and input count. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/spice_generator/accumulator_generator.py))
- **Why it matters for CIM compiler/IR work:** Precision propagation is one of the places where compiler semantics meet hardware generation. Here it is auditable, but embedded in Python templates rather than checked by a typed IR.
- **Reusable lesson:** A future stack could promote these rules into type-like fields for bit significance, reduction depth, accumulation width, and output reconstruction.

### Insight 4 — The physical-design scripts reveal assumptions that paper diagrams compress

- **Observation:** The backend scripts encode submodule dimensions, placement coordinates, pin names, layers, offsets, and repeated-column layout formulas. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/generate_def_for_top_module.py))
- **Why it matters for CIM compiler/IR work:** Physical metadata often determines whether a mapping is reusable. OpenC² shows that layout-aware CIM compilation needs a representation for pins, layers, component placement, and routing constraints, not only array dimensions.
- **Reusable lesson:** A backend IR for CIM should include layout metadata as first-class resource attributes or attachable constraints.

### Insight 5 — The artifact is useful as a reproducible boundary case for “end-to-end”

- **Observation:** The public repository contains source, libraries, and generated macro outputs, while the top-level README is brief and releases are not published. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0))
- **Why it matters for CIM compiler/IR work:** Corpus users can study a real open hardware-generation flow, while also seeing where reproducibility depends on scripts, directory conventions, and EDA environment details.
- **Reusable lesson:** When cataloging CIM stacks, distinguish “end-to-end macro generation” from “end-to-end application-to-hardware compilation,” and record the exposed boundary precisely.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: public artifact found.**

- **Artifact URL / identifier:** `OpenC2-official/OpenC2_V1.0` on GitHub. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0))
- **License:** Unknown / not found in the checked sources. The top-level repository listing checked here does not show a license file, and the repository page reports no releases. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0))
- **Last checked:** 2026-05-15.
- **What the artifact contains:** source directories for frontend and backend generation; library folders for GDS, layermap, LEF, Liberty, SPICE, and Verilog; document PDFs; requirements file; and generated results for `dcim_macro_64x64_for_4bitx4bit`. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/document))
- **What the artifact appears to omit:** a detailed top-level runnable workflow, a formal input schema, a documented compiler API, a standalone CIM IR, a workload benchmark harness, public releases, and an explicit license file in the checked repository view. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0))
- **Minimal command or workflow, if documented:** Unknown / not found in the checked README. The repository exposes generator scripts and generated outputs, but the README text checked here is minimal and points mainly to the paper. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0))
- **Whether paper figures appear reproducible from the artifact:** Partial. The generated 64×64, 4-bit×4-bit example corresponds to the paper’s layout demonstration, but a documented workflow for regenerating all area/power/energy-efficiency figures was not found in the checked README. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf))

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Paper identifies macro parameters and library inputs; scripts expose corresponding variables. A separate schema/CLI was not found. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) |
| Intermediate representation serialized | Partial | Verilog, SPICE, DEF, LEF, and GDS are serialized. A standalone CIM IR is not found in checked sources. |
| Mapping decisions inspectable | Partial | Module expansion, bit-width rules, and placement formulas are inspectable in scripts; no separate mapping-state file was found. |
| Schedule inspectable | Partial | EDA flow steps and Yosys command files are exposed; application/runtime scheduling is outside the demonstrated scope. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/tree/main/results/dcim_macro_64x64_for_4bitx4bit/frontend/yosys_command_file)) |
| Hardware config explicit | Partial | Rows, columns, input/weight widths, library folders, and named hardware hierarchy are explicit; several assumptions live in templates and scripts. |
| Precision / bit-slice assumptions explicit | Partial | Input and weight bit widths and partial-sum width derivations are visible; bit-significance semantics are embedded in datapath generators. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/frontend/spice_generator/accumulator_generator.py)) |
| Cost model inspectable | Partial | Area calculation scripts are visible; complete power/energy calibration workflow for all figures was not clearly documented in checked sources. ([GitHub](https://github.com/OpenC2-official/OpenC2_V1.0/blob/main/source/backend/top_module_pnr/calc_dcim_macro_area.py)) |
| Simulator backend documented | N/A / Partial | The backend is an EDA generation flow rather than a simulator. Tool names and generated files are documented; full setup is less explicit. |
| Generated code / instruction stream inspectable | Yes / N/A | Generated Verilog/SPICE/DEF/GDS outputs are inspectable. No instruction stream is part of the demonstrated stack. |
| Provenance from source op to backend action | Partial | Provenance exists from macro parameters to generated modules/files; provenance from neural-network operators is outside the evidenced boundary. |
| Reproduction scripts available | Partial | Generator scripts and example outputs are available; a top-level reproduction script or release workflow was not found. |
| Calibration source documented | Partial | FreePDK45/library basis and normalization are described at paper level; full calibration scripts for all PPA plots are not clearly documented. |

### 8.3 Integration helper

- **As frontend:** OpenC² is not primarily a workload frontend. Reuse would be through a small adapter that emits its macro parameters from an upstream CIM compiler.
- **As IR inspiration:** The most useful abstractions are macro shape, precision fields, DCIM column hierarchy, submodule resource names, and physical-layout metadata.
- **As mapper/scheduler:** OpenC² provides backend module expansion and layout assembly rather than application mapping. Its regular-column construction could be adapted as a macro-shape legalization step.
- **As cost model:** Area formulas, bit-width-derived datapath sizing, and macro-level PPA metrics could become backend cost plugins. Power/energy reuse would require reconstructing the EDA and normalization workflow.
- **As backend:** This is the most direct integration role. A compiler could wrap the generator as a backend that lowers a typed SRAM-DCIM macro resource into Verilog/SPICE/DEF/GDS artifacts.
- **As benchmark:** The 64×64, 4-bit×4-bit generated macro and paper-level comparisons against AutoDCIM are useful backend benchmarks. It is not an application benchmark suite in the checked sources.
- **As validation source:** The artifact provides RTL/netlist/layout files and FreePDK45-oriented libraries, useful for backend validation. Silicon measurement or chip-in-loop validation was not found in the checked sources.

**Integration effort estimate: High.**  
Integration would be most direct through a backend adapter that extracts a normalized macro configuration and invokes the generator scripts. The effort is elevated by the minimal README workflow, unknown license status, hard-coded example parameters in scripts, and the need to make implicit template/layout assumptions explicit for a larger compiler stack. For corpus reuse as a case study, effort is lower because the generated files and code structure are already inspectable.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **AutoDCIM** | Automated DCIM macro generation and layout/PPA comparison | OpenC² compares directly against AutoDCIM and emphasizes open-source generation using FreePDK45 and open-source tools. AutoDCIM is the nearest baseline for macro compiler scope. ([zyh0911.github.io](https://zyh0911.github.io/assets/pdf/OpenC2.pdf)) | Use AutoDCIM/OpenC² as a pair for “DCIM macro compiler” entries; distinguish artifact openness and exposed backend boundary. |
| **ARCTIC** | Automated DCIM compiler with parameterized precision and macro generation | ARCTIC emphasizes broad integer/floating precision support and BIST/adaptive topology features; OpenC² emphasizes a public, inspectable DCIM macro generation and physical-design flow. ([past.date-conference.com](https://past.date-conference.com/proceedings-archive/2024/DATA/399_pdf_upload.pdf)) | ARCTIC is closer to precision/configuration exploration; OpenC² is cleaner as an open backend artifact case study. |
| **SynDCIM** | Performance-aware DCIM compilation and layout generation | SynDCIM foregrounds multi-spec subcircuit synthesis, search, and 40 nm test-chip validation; OpenC² foregrounds open-source template generation and FreePDK45-compatible artifacts. ([arXiv](https://arxiv.org/abs/2411.16806)) | Separate search/synthesis-oriented macro compilers from template-backed open macro generators. |
| **SEGA-DCIM** | DSE-guided DCIM compiler and template-based netlist/layout generation | SEGA-DCIM emphasizes multi-objective design-space exploration across area, power, delay, and precision; OpenC² exposes a narrower but public macro hardware-generation flow. ([arXiv](https://arxiv.org/html/2505.09451)) | Good comparison for whether “middle layer” is DSE/search state or config/template state. |
| **OpenACM** | Open-source SRAM-based CIM/compiler infrastructure | OpenACM adds accuracy-configurable multiplier libraries and approximation-oriented SRAM macro generation; OpenC² is a digital CIM macro generator centered on exact macro layout/backend generation. ([arXiv](https://arxiv.org/pdf/2601.11292)) | Useful contrast between open backend macro generation and approximation-aware CIM design spaces. |

## 10. Corpus-ready final takeaway

- OpenC²’s evidenced contribution is an open-source, template-based **digital SRAM-CIM macro hardware generator**.
- Its strongest reusable stack layer is the **backend macro-generation and physical-design flow** from macro parameters and libraries to Verilog/SPICE/DEF/GDSII.
- The demonstrated “end-to-end” scope is macro-level: top-level DCIM specifications and cell libraries to generated netlist/layout artifacts.
- First-class objects include macro dimensions, input/weight bit widths, DCIM columns, SRAM-with-R/W, adder trees, accumulators, decoders, drivers, control, pins, and layout metadata.
- The effective hidden IR is distributed across configuration values, Python generator templates, generated Verilog/SPICE, Yosys scripts, and DEF/LEF/GDS physical metadata.
- Artifact status is public, with source, libraries, and a generated 64×64 4-bit×4-bit example; license and full runnable workflow were not found in the checked sources.
- Integration is most promising as a backend plugin or backend case study for a larger CIM compiler/IR stack.
- For value-trajectory IR work, OpenC² supplies concrete backend resources and bit-width propagation rules, while trajectory-level value identity and rewrite legality would need an added abstraction layer.
