---
slug: turbo-charged-mapper
title: "The Turbo-Charged Mapper: Fast and Optimal Mapping for Energy-efficient and Low-latency Accelerator Design"
short_title: "Turbo-Charged Mapper"
subtitle: Scoped CIM stack note seed
year: 2026
publication:
  venue: "arXiv:2602.15172"
  type: "other"
  doi: "10.48550/arXiv.2602.15172"
  url: "https://doi.org/10.48550/arXiv.2602.15172"
authors:
  - "Michael Gilbert"
  - "Tanner Andrulis"
  - "Vivienne Sze"
  - "Joel S. Emer"
bibtex: |
  @misc{gilbert2026turbo,
    author = {Gilbert, Michael and Andrulis, Tanner and Sze, Vivienne and Emer, Joel S.},
    title = {The Turbo-Charged Mapper: Fast and Optimal Mapping for Energy-efficient and Low-latency Accelerator Design},
    year = {2026},
    howpublished = {arXiv:2602.15172},
    doi = {10.48550/arXiv.2602.15172},
    eprint = {2602.15172},
    archivePrefix = {arXiv},
    primaryClass = {cs.AR},
    url = {https://arxiv.org/abs/2602.15172}
  }
citation_source: https://arxiv.org/abs/2602.15172
summary: >-
  The Turbo-Charged Mapper is a mapping-search and schedule-representation contribution for tensor-algebra accelerators, centered on dataplacement, LoopTree mappings, symbolic pruning, and curried analytical modeling.
links:
  paper: https://arxiv.org/pdf/2602.15172
  artifact: https://accelergy-project.github.io/accelforge/
  docs: https://accelergy-project.github.io/accelforge/guide/spec/mapping.html
technology: ["digital accelerator", "CiMLoop-adjacent"]
workloads: ["tensor algebra", "GPT-style Einsums", "MobileNetV3"]
tags: ["compiler-mapping", "loop-schedule", "LoopTree", "dataplacement", "mapspace-search", "analytical-cost-model", "DSE", "AccelForge", "CiMLoop-adjacent", "tensor-algebra-accelerator"]
baselines: ["Timeloop", "ZigZag/LOMA", "LoopTree", "CiMLoop", "CoSA", "Fast & Fusiest"]
axis_A:
  primary: A3
  secondary: [A2]
axis_B: [B3, B1, B4]
axis_C_first_class_objects: ["storage nodes", "tensor tiles", "memory hierarchy", "component actions", "spatial fanout", "compute units"]
axis_D_rewrite_objects: ["mapping", "loop schedule", "tile-shape search state", "storage-node order", "loop placement/order", "loop bounds"]
artifact:
  status: public but partial/indirect artifact found
  url: https://accelergy-project.github.io/accelforge/
  license: MIT noted in source note
  last_checked: "2026-05-18"
integration_roles: ["IR inspiration", "mapper_scheduler", "cost_model", "benchmark"]
reproducibility_level: medium
notes: ["Seed frontmatter reduced from the uploaded detailed note.", "Replace body with the complete corpus note when ready."]
takeaways: ["Dataplacement is the paper's central IR-like object.", "The reusable boundary is clearest in LoopTree mappings, pmapping templates, and symbolic cost criteria.", "Useful baseline for separating mapping legality from cost ranking."]
---

## Corpus classification snapshot

The Turbo-Charged Mapper is classified primarily as **A3 — mapping / scheduling / DSE framework**, with **A2 — simulator & cost model** as a secondary role. Its main middle-layer styles are **B3 Loop / tensor-schedule IR**, **B1 Config-as-IR**, and **B4 Hardware-resource IR**.

## Public summary

The paper is best read as a mapping-search and schedule-representation contribution for tensor-algebra accelerators. Its central idea is to make **dataplacement**—which tensor tiles are kept at which memory levels and for what lifetime—a separable mapping choice alongside dataflow and tile shape. For CIM compiler/IR research, its strongest relevance is as a clear example of how a hidden middle layer can make placement, reuse, and schedule legality first-class enough to support optimality-preserving search.

## Integration helper

The most direct integration path is to borrow its **dataplacement / LoopTree / symbolic-pruning split** as an IR-design comparison point. Reuse would benefit from an adapter that extracts storage-node order, loop placement, tile shape, and cost criteria into a format comparable with CIM-specific placement and resource metadata.
