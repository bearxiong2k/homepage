---
slug: cimflow
title: "CIMFlow: An Integrated Framework for Systematic Design and Evaluation of Digital CIM Architectures"
short_title: "CIMFlow"
subtitle: Scoped CIM stack note seed
year: 2025
publication:
  venue: "DAC 2025"
  type: "conference"
  doi: "10.1109/DAC63849.2025.11133270"
  url: "https://doi.org/10.1109/DAC63849.2025.11133270"
authors:
  - "Yingjie Qi"
  - "Jianlei Yang"
  - "Yiou Wang"
  - "Yikun Wang"
  - "Dayu Wang"
  - "Ling Tang"
  - "Cenlin Duan"
  - "Xiaolin He"
  - "Weisheng Zhao"
bibtex: |
  @inproceedings{qi2025cimflow,
    title = {CIMFlow: An Integrated Framework for Systematic Design and Evaluation of Digital CIM Architectures},
    author = {Qi, Yingjie and Yang, Jianlei and Wang, Yiou and Wang, Yikun and Wang, Dayu and Tang, Ling and Duan, Cenlin and He, Xiaolin and Zhao, Weisheng},
    booktitle = {2025 62nd ACM/IEEE Design Automation Conference (DAC)},
    pages = {1--7},
    year = {2025},
    doi = {10.1109/DAC63849.2025.11133270}
  }
citation_source: https://www.cimflow.org/docs/Framework/what-is-cimflow
summary: >-
  CIMFlow is a public SRAM-based digital CIM infrastructure stack for DNN inference, connecting ONNX input, hardware configuration, graph partitioning, OP-level MLIR/DSL lowering, per-core ISA JSON, and SystemC-backed simulation.
links:
  paper: https://doi.org/10.1109/DAC63849.2025.11133270
  artifact: https://www.cimflow.org/
  docs: https://www.cimflow.org/docs/Compiler/Pipeline-Overview
technology: ["SRAM-CIM", "digital-CIM"]
workloads: ["DNN inference", "CNN inference", "INT8 inference"]
tags: ["digital-CIM", "SRAM-CIM", "DNN-inference", "compiler-mapping", "MLIR", "DSL", "ISA", "SystemC-simulator", "multi-core-mapping", "per-core-JSON"]
baselines: ["CIM-MLC", "PIMCOMP", "OCC", "NeuroSim", "MNSIM 2.0", "AutoDCIM"]
axis_A:
  primary: A5
  secondary: [A3, A4, A2]
axis_B: [B2, B5, B4, B1, B3, B7]
axis_C_first_class_objects: ["hardware hierarchy", "core grid", "macro groups", "local/global memory regions", "address space", "NoC bandwidth and cost matrix", "per-core instruction stream", "CIM_MVM", "vector/reduce/scalar/transfer units", "GRF/SRF registers", "synchronization IDs"]
axis_D_rewrite_objects: ["operator graph", "mapping state", "loop/tile schedule", "array binding/layout", "instruction stream", "runtime synchronization state"]
artifact:
  status: public artifact found
  url: https://www.cimflow.org/
  license: unknown
  last_checked: "2026-05-18"
integration_roles: ["frontend", "IR inspiration", "mapper_scheduler", "cost_model", "backend", "benchmark"]
reproducibility_level: medium
notes: ["Seed frontmatter reduced from the uploaded detailed note.", "Replace body with the complete corpus note when ready."]
takeaways: ["Strong vertical stack example from graph partitioning to per-core ISA JSON.", "Reusable semantics are clearest in CG JSON, hardware/config JSON, ISA JSON, and simulator contracts.", "Useful comparison point for hidden-IR boundaries in CIM compiler stacks."]
---

## Corpus classification snapshot

CIMFlow is classified primarily as **A5 — narrow end-to-end co-design**, with strong **A3/A4/A2** components. Its middle-layer styles include graph-level task planning, hardware-resource configuration, instruction/meta-op boundaries, and limited runtime-state abstraction through synchronization operations.

## Public summary

CIMFlow is a public SRAM-based digital CIM infrastructure stack for DNN inference that connects an ONNX frontend, hardware configuration, a two-level compiler, a documented 32-bit CIM ISA, and a SystemC cycle-level simulator. For CIM compiler/IR research, it is useful as a coherent vertical stack whose semantics are distributed across CG task JSON, hardware/config JSON, per-core ISA JSON, register conventions, synchronization instructions, and simulator input/output contracts.

## Integration helper

The most direct integration path is to use CIMFlow as a **backend/interface comparison**: keep its CG JSON and ISA JSON as examples of serialized compiler boundaries, then compare those boundaries against future CIM compiler IR proposals.
