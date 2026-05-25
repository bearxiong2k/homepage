---
slug: declarative-memory-services
title: "Declarative Memory Services"
short_title: "DMS"
subtitle: "Scoped CIM stack note"
year: 2026
venue: "CIDR 2026"
authors_or_group: "Jeronimo Castrillon, Jana Giceva, Yu Hua, Kimberly Keeton, Akhil Shekar, Kevin Skadron, Tianzheng Wang, Huanchen Zhang"
summary: >-
  **Declarative Memory Services** is a CIDR 2026 vision paper that argues future memory programming should expose desired memory properties rather than hand-coded device-specific mechanisms. Its main contribution is a layered abstraction: applications annotate logical memory regions and dataflow tasks with properties such as cacheability, coherence, latency, bandwidth, replication, compression, and offloadability; a calibration layer records device capabilities and APIs; and a memory-services runtime maps those declarations to heterogeneous devices including local DRAM, CXL memory, and PIM-style computational memory. The strongest demonstrated scope is conceptual and DBMS-oriented: disaggregated B+-trees, PIM filtering, and tiered-memory buffer caching motivate the abstraction. For a CIM compiler/IR corpus, the paper is most useful as a runtime/property-abstraction reference: it does not define a CIM operator IR, numeric trajectory IR, or instruction lowering path, but it clearly identifies the kinds of memory-service contracts a higher-level compiler might need to preserve when targeting PIM or heterogeneous memory backends. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))
links:
  paper: https://www.cidrdb.org/cidr2026/papers/p21-castrillon.pdf
  artifact:
  docs:
  code:
technology:
  - "CXL"
  - "DRAM-PIM"
  - "computational-memory"
  - "heterogeneous-memory"
  - "disaggregated-memory"
  - "tiered-memory"
  - "other"
workloads:
  - "disaggregated B+-tree indexing"
  - "DBMS data analytics filtering"
  - "tiered-memory buffer caching"
tags: []
baselines: []
axis_A:
  primary: A6
  secondary: [A3]
axis_B: [B1, B2, B4, B7]
axis_C_first_class_objects:
  - "logical memory regions"
  - "dataflow tasks"
  - "memory-property annotations"
  - "device catalog entries"
  - "memory service bindings"
  - "PIM offload API capability"
  - "runtime metadata / SLO state"
axis_D_rewrite_objects:
  - "runtime service binding"
  - "data placement"
  - "caching policy"
  - "replication policy"
  - "offload selection"
  - "data movement / tiering / spilling"
  - "compression or encoding selection"
artifact:
  status: "no public artifact found"
  url: 
  license: "Paper: CC-BY 4.0; artifact: N/A"
  last_checked: "2026-05-15"
integration_roles:
  - "IR inspiration"
  - "mapper_scheduler"
  - "cost_model"
  - "validation"
reproducibility_level: low
notes:
  - "Best classified as a declarative memory-services vision paper rather than a CIM compiler or explicit IR stack."
  - "Most useful corpus concept is the split between declarative annotations, calibration/device catalog, and runtime memory services."
  - "PIM appears as a supported computational-memory device class through service-level offload APIs."
  - "Value-trajectory IR support would require additional objects for value identity, numeric domain, bit-slice state, conversion points, and accumulation/reconstruction paths."
takeaways: []
---

# Declarative Memory Services — scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | **A6 / A3 hybrid, vision-layer** | The paper proposes a programming/runtime abstraction for heterogeneous memory services, with a DMS runtime that maps declarative properties to devices. Its demonstrated content is a vision architecture and case-study analysis rather than an implemented compiler or simulator. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Middle-layer style, Axis B | **B7 Runtime-state abstraction; B1 Config-as-IR; B2 Graph-as-IR; B4 Hardware-resource IR** | The named middle objects are annotated logical memory regions, data-flow tasks, a calibration/device catalog, and memory services such as caching, replication, offloading, and compression. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| First-class CIM objects, Axis C | **Logical memory regions; dataflow tasks; memory-property annotations; device catalog entries; offload APIs; memory-service choices** | DMS names properties such as coherence, cacheability, latency, bandwidth, replication, compression, and offloadability; it includes PIM through “computational memory,” Membrane-style filtering units, and `pim-load` / `pim-store` / `pim-offload` APIs. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Rewrite object, Axis D | **Runtime mapping state / service binding / data placement / offload selection / data movement policy** | Transformations are described as mapping desired properties to services and devices, placing regions, caching, tiering, moving data, spilling, applying transformations, and deciding whether to offload runtime tasks. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Best corpus tags | `declarative-memory-services`, `runtime-abstraction`, `heterogeneous-memory`, `CXL`, `PIM`, `DBMS`, `device-catalog`, `memory-service-runtime`, `property-annotations`, `vision-paper` | These tags reflect the paper’s scope: heterogeneous memory, declarative annotations, device calibration, and runtime service selection, with PIM as one supported memory-device class rather than a CIM compiler target. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Closest comparison baselines | **XMem; SDFG / DaCe; Data Pipes; DEX; Membrane; HyMem / Spitfire / vmcache** | XMem and SDFG are closest in abstraction/IR framing; Data Pipes is closest in declarative movement; DEX, Membrane, and tiered-buffer-cache systems motivate the three case studies. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |

## 2. One-paragraph public summary

**Declarative Memory Services** is a CIDR 2026 vision paper that argues future memory programming should expose desired memory properties rather than hand-coded device-specific mechanisms. Its main contribution is a layered abstraction: applications annotate logical memory regions and dataflow tasks with properties such as cacheability, coherence, latency, bandwidth, replication, compression, and offloadability; a calibration layer records device capabilities and APIs; and a memory-services runtime maps those declarations to heterogeneous devices including local DRAM, CXL memory, and PIM-style computational memory. The strongest demonstrated scope is conceptual and DBMS-oriented: disaggregated B+-trees, PIM filtering, and tiered-memory buffer caching motivate the abstraction. For a CIM compiler/IR corpus, the paper is most useful as a runtime/property-abstraction reference: it does not define a CIM operator IR, numeric trajectory IR, or instruction lowering path, but it clearly identifies the kinds of memory-service contracts a higher-level compiler might need to preserve when targeting PIM or heterogeneous memory backends. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| DMS lets developers specify desired properties without dictating implementation device or mechanism. | Abstract and introduction | Paper-only architecture / case-study argument | The paper defines a three-layer design: abstraction layer, calibration layer, and memory-services layer. | The paper-level evidence supports the abstraction split; artifact-level confirmation would require an implementation of the annotations, catalog, and runtime mapper. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| DMS supports high-level properties such as parallelism, coherence, persistence, cacheability, bandwidth, latency, compression, replication, and offloading. | Table 1, Section 4.1, Figure 1 | Table / architecture sketch | Table 1 lists memory properties; Section 4.1 gives annotation examples such as `[shared, coherent]`, `[latency < 1µs, read bandwidth >= 2GB/s]`, and `[cacheable, latency < 10µs]`. | Demonstrated as an annotation vocabulary and design sketch, not as a type checker, verifier, or serialized schema. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| A calibration layer can discover device capabilities and expose APIs to memory services. | Section 4.2, Table 2 | Table / paper-only design | Table 2 sketches a device catalog with local DRAM, CXL DRAM, and Membrane; capabilities include coherence, partial coherence, byte-addressability, and compute; APIs include `dram-load`, `cxl-load`, and `pim-offload`. | The reusable boundary is clearest at the catalog concept; no public catalog format or calibration workflow was found. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| A memory-services runtime can jointly optimize and execute applications over heterogeneous devices. | Figure 1 and Section 4.3 | Architecture sketch / paper-only | Figure 1 places replication, offloading, caching, and compression between annotated applications and devices; Section 4.3 describes allocation-time placement and background services for metadata tracking, data movement, tiering, garbage collection, and transformations. | Demonstrated as a runtime contract and research agenda; no algorithm, cost objective, or runnable runtime artifact is provided. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| DMS can simplify disaggregated B+-tree designs. | Case Study 1 and Section 4.3 | Case study | The paper identifies caching, coherence, data placement, replication, and offloading decisions in RDMA/disaggregated B+-trees, then maps them to DMS services. | The case study is comparative and conceptual, using DEX and Sherman as motivating systems rather than evaluating a DMS implementation. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| DMS can guide PIM filtering decisions. | Case Study 2, Section 4.1, Section 4.3 | Case study | The paper connects PIM filtering to bank-level parallelism, data placement, coherence, operator fusion, and runtime offload decisions based on column size. | Demonstrated for a Membrane-style database filtering scenario at paper level; no PIM compiler pass, placement algorithm, or simulator input is exposed. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| DMS can improve tiered-memory buffer caching by exposing DBMS intent. | Case Study 3 and Section 4.3 | Case study | The paper argues that pages used once in a scan and pages reused randomly by hash tables should carry different cache/tiering hints, and that PAX/NSM page structure could guide cooling-time encoding/compression. | Demonstrated as an interface idea for DBMS/runtime cooperation; no replacement buffer manager or reproduction scripts were found. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| DMS requires future work on calibration, mapping, SLA guarantees, deployment, and debugging. | Section 5 | Research agenda | The paper enumerates open problems: device characterization, properties-to-services mapping, SLA monitoring/migration, extensibility, deployment, and correctness/debugging. | This section is best read as a roadmap for future systems and tools rather than implemented functionality. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |

## 4. Stack anatomy

```text
Input / frontend:
  Application code with annotated logical memory regions and/or dataflow tasks.
  Object type: source-level annotations plus graph-like task/dataflow model.
  Serialization / reuse: no public schema found; examples appear inline in the paper.

Middle representation:
  Logical memory regions, dataflow tasks, memory-property annotations, and task/state markers.
  Object type: property-bearing region/task abstraction.
  Serialization / reuse: inspectable in paper examples, not provided as a standalone IR.

Mapping or scheduling state:
  Runtime service binding: caching, placement, replication, offloading, tiering, spilling, compression, metadata tracking.
  Object type: runtime mapping state and background-service policy.
  Serialization / reuse: conceptual; no implementation or trace format found.

Hardware abstraction:
  Calibration-layer device catalog with hardware, capabilities, and APIs.
  Object type: hardware-resource table / capability catalog.
  Serialization / reuse: Table 2 is inspectable; no machine-readable catalog found.

Backend / simulator / codegen:
  Device-specific APIs such as dram-load, dram-store, dram-dsa, cxl-load, cxl-store, pim-load, pim-store, pim-offload.
  Object type: abstract API contract to device-specific implementations.
  Serialization / reuse: API names are sketched; implementations are not exposed.

Output artifact:
  Executed application using selected memory services over available devices.
  Object type: runtime action plan / service execution, not a generated instruction stream.
  Serialization / reuse: unknown; no output format or generated artifact found.

Evaluation loop:
  Case-study reasoning over DBMS examples and a research agenda.
  Object type: paper-only motivation and design sketch.
  Serialization / reuse: no experiments, scripts, or reproducibility workflow found.
```

**Hidden-IR reading:**  
The effective intermediate state appears to be the combination of property annotations on regions/tasks, the device catalog, and the runtime’s service-selection state. The paper foregrounds a declarative programming model, while the reusable semantics are most visible in the boundary between “desired properties” and “service/device bindings”: cacheable region → caching service → local DRAM; offloadable task → offloading service → PIM API; coherent shared state → device choice or coherence-maintenance action. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

## 5. Taxonomy placement in detail

### 5.1 Axis A — stack role

**Primary: A6 Programming / runtime / benchmark on real hardware, but as a vision-layer design.**  
DMS is framed as a runtime/software layer that applications interact with, where some services run at allocation time and others run in the background for efficient resource usage and SLO enforcement. The stack slice it owns most strongly is the contract from application intent to memory-service execution, not circuit generation, instruction generation, or simulator-backed evaluation. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

**Secondary: A3 Mapping / scheduling / DSE framework.**  
The proposed runtime decides data placement, caching, replication, offloading, tiering, spilling, and service selection using application annotations and hardware capabilities. This resembles a mapper/scheduler, but the paper gives the mapping responsibilities and examples rather than a concrete search algorithm, objective function, or pass pipeline. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

**Tertiary relation to A4 Explicit IR / dialect / ISA compiler stack.**  
The introduction says desired properties are “captured by a compiler and runtime,” and the dataflow model resembles an IR boundary, but the paper does not define syntax, typing rules, dialect operations, legality checks, or lowering passes. The A4 relevance is therefore inspirational rather than implemented. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 5.2 Axis B — middle-layer style

**B1 Config-as-IR.**  
The property annotations and device catalog behave like declarative configuration: a region or task carries requirements, and the catalog records what devices and APIs can satisfy them. Decisions made there include desired coherence, cacheability, latency, bandwidth, offloadability, and device capability matching. Decisions still embedded in the envisioned runtime include conflict resolution, cost ranking, migration policy, and service implementation choice. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

**B2 Graph-as-IR.**  
The dataflow layer explicitly models compute tasks and logical data transfers as a graph; it can mark task/operator fusion opportunities and pipeline-breaker state such as a hash table. This is the closest representation to a compiler IR, but no artifact exposes a graph format that upstream passes could read, verify, and rewrite. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

**B4 Hardware-resource IR.**  
The device catalog is a resource abstraction: hardware rows map to capabilities and APIs. It captures Local DRAM, CXL DRAM, and Membrane-style computational memory, with APIs including `dram-dsa`, `cxl-load`, and `pim-offload`. A future compiler could treat this as a backend capability schema, though the paper leaves calibration and self-evolution as open challenges. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

**B7 Runtime-state abstraction.**  
The memory services layer tracks region usage, CXL sharing/access state, data movement, tiering, garbage collection, transformations, and SLO enforcement. This is a runtime-state abstraction because key legality and performance decisions depend on dynamic properties such as workload behavior, column sizes, memory pressure, and SLA status. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 5.3 Axis C — first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | **Not applicable / implicit** | The paper mentions analog dot products in ReRAM/PCM as part of the broader memory-technology landscape, but DMS does not model arrays, macros, crossbars, rows, columns, or tile hierarchy as compiler objects. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Bit-slicing / bit significance | **Not applicable** | No bit-slicing, bit significance, or CIM numeric decomposition representation appears in the DMS abstraction. |
| ADC/DAC precision or sensing | **Not applicable** | PIM is treated at the service/API level, not as analog sensing or converter parameters. |
| Analog-to-digital or domain transition | **Implicit / high-level** | The closest domain transition is CPU/DRAM/CXL/PIM offload and coherence between host and PIM units; no analog/digital transition is named or costed. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Peripheral circuits as path nodes | **Not applicable** | Device APIs are named, but peripheral circuits are not represented as path nodes. |
| Partial-sum accumulation path | **Not applicable** | The paper’s PIM example is filtering, not MAC accumulation. |
| Reconstruction / shift-add tree | **Not applicable** | No reconstruction or shift-add semantics are discussed. |
| Runtime state, masks, KV cache, batching, sparsity | **First-class for memory/runtime state; not for ML KV cache or sparsity** | DMS can mark pipeline-breaker state such as a hash table and track logical-region usage, data movement, tiering, and SLO enforcement. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |
| Value trajectory / flow path | **Approximated by dataflow tasks and logical transfers** | The dataflow graph represents compute tasks and logical data transfers, and the runtime can place/offload/cache them, but value identity through CIM-internal stages is not modeled. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) |

### 5.4 Axis D — rewrite object

The paper’s rewrite object is **runtime mapping state**, especially the binding from annotated region/task properties to memory services and device APIs. The transformations it actually describes are:

- placing logical memory regions on devices that match desired properties;
- caching cacheable regions in compute-side local DRAM;
- distributing or replicating B+-tree nodes across memory servers;
- deciding whether filter tasks should be offloaded to PIM based on runtime data size;
- moving, tiering, spilling, garbage-collecting, and transforming data in background services;
- choosing encoding/compression schemes when cooling pages down the hierarchy;
- exposing possible task/operator fusion in a dataflow graph. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

The equivalences exploited are service-level rather than arithmetic: multiple devices or services can satisfy a logical property, such as CXL- vs PIM-based access APIs or alternative offload implementations. The information that must be preserved across lowering is the annotation set, dataflow/state boundaries, target SLOs, coherence requirements, data layout/structure hints, and catalog capability constraints. The representation is especially well suited to property-to-service mapping; expressing CIM-internal rewrites such as retiming ADC conversion, preserving bit-sliced partial sums, or changing reduction-tree topology would likely require an additional abstraction for value trajectory and numeric-domain state.

## 6. Technical mechanism reading

### 6.1 Three-layer contract

The mechanism is a layered contract rather than an implemented compiler pipeline. The **abstraction layer** lets applications declare desired properties on logical memory regions and dataflow tasks. The **calibration layer** discovers hardware devices, tracks capabilities, and exposes APIs. The **memory services layer** uses those APIs to implement services such as caching, replication, offloading, and compression, then optimizes and executes applications over the available devices. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 6.2 Declarative objects

The reusable declarative objects are:

1. **Logical memory regions** — memory blocks with qualitative or quantitative properties, e.g. `[shared, coherent]`, `[latency < 1µs, read bandwidth >= 2GB/s]`, or `[cacheable, latency < 10µs]`.
2. **Dataflow tasks and transfers** — graph nodes/edges that model compute tasks and logical movement, with annotations for cacheability, offloadability, fusion, and pipeline-breaker state.
3. **Device catalog entries** — hardware/capability/API triples such as Local DRAM with coherence and `dram-load`, CXL DRAM with partial coherence and `cxl-load`, and Membrane with compute and `pim-offload`.
4. **Memory services** — runtime services that satisfy properties through placement, caching, offloading, tiering, data transformation, and metadata tracking. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 6.3 Mapping/search/scheduling procedure

No formal mapping algorithm or search procedure is provided. The described procedure is:

1. Discover devices and populate the catalog.
2. Build service implementations over catalog APIs.
3. Accept annotated application regions and dataflow tasks.
4. At allocation time, choose data placement for each logical region.
5. At runtime, monitor metadata/SLOs and perform movement, tiering, spilling, or service migration.
6. For offloadable dataflow tasks, query whether the target compute is supported and at what cost. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

This is an important corpus distinction: DMS identifies the **state that a mapper would need**, but it does not expose a mapper implementation, optimization objective, legality checker, or serialized schedule.

### 6.4 Cost model and objectives

The paper gives example quantitative properties, such as latency and bandwidth SLOs, and discusses runtime cost questions such as whether offloading small dimension-table columns may cost more than it saves. It also states that offloading effectiveness depends on task graph structure, memory configuration, data size/location, and data-movement costs. These are cost-model ingredients, but no equation, calibrated model, or benchmarked objective is included. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 6.5 Hardware abstraction

The hardware abstraction is deliberately broad: conventional DRAM, CXL memory, HBM, computational memory/PIM, and tiered memory/storage systems. For CIM relevance, the main object is PIM-style computational memory: the paper discusses PNM/PIM, bank-level DRAM-PIM filtering, and Membrane’s filtering units across memory banks. It treats PIM through capabilities and APIs rather than through physical arrays, bitlines, ADCs, DACs, accumulation paths, or instructions. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

### 6.6 Workload assumptions

The motivating workloads are DBMS-oriented:

- disaggregated B+-tree indexing over RDMA-like compute/memory pools;
- data analytics filtering with bank-level DRAM-PIM;
- buffer-cache management over tiered DRAM, persistent memory, SSD, and CXL-style memory. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))

The demonstrated scope is therefore memory-service orchestration for data systems, not DNN inference, LLM serving, analog-CIM matrix multiplication, or a numeric compiler backend.

## 7. Paper-specific insight beyond the taxonomy

### Insight 1 — The property annotation is the reusable IR seed

- **Observation:** The most reusable abstraction is the property-bearing logical memory region: annotations such as cacheable, coherent, latency-bounded, bandwidth-bounded, replicated, and offloadable sit above device-specific APIs.
- **Why it matters for CIM compiler/IR work:** A CIM stack that treats PIM as a backend could use a similar property layer to preserve non-arithmetic constraints across lowering, especially coherence, placement, and offload eligibility.
- **Reusable lesson:** A future IR could attach memory-service attributes to buffers or regions, then lower them to backend-specific placement/offload actions.

### Insight 2 — The device catalog is a backend capability contract

- **Observation:** Table 2 functions as a small capability schema: each device advertises capabilities and APIs, and memory services consume those APIs.
- **Why it matters for CIM compiler/IR work:** CIM backends often need a structured way to describe supported operations, data types, placement constraints, and transfer costs; DMS frames this as a calibration-layer object.
- **Reusable lesson:** A public CIM compiler corpus could record whether each stack has an explicit hardware capability table, even when it does not expose a full IR.

### Insight 3 — Runtime information is central, not incidental

- **Observation:** DMS delays several decisions to runtime because memory configuration, data size, and data movement costs may be unavailable during development or compilation.
- **Why it matters for CIM compiler/IR work:** PIM/CIM offloading often depends on dynamic placement and data size; a purely static IR may need a runtime state channel for service binding, migration, and SLO repair.
- **Reusable lesson:** Treat runtime state as a first-class part of the stack contract, not merely backend bookkeeping.

### Insight 4 — The PIM example is service-level, not numeric-level

- **Observation:** The PIM filtering case names bank-level parallelism, data layout, coherence, and offloading, but it abstracts away instruction format, sensing, numeric precision, and internal data paths.
- **Why it matters for CIM compiler/IR work:** This distinguishes memory-service IR from CIM value-trajectory IR: both target near-data execution, but they make different objects first-class.
- **Reusable lesson:** The corpus should tag DMS as PIM-relevant but not as a CIM numeric-lowering or CIM instruction-generation stack.

### Insight 5 — The research agenda is a useful checklist for future IR tooling

- **Observation:** The open challenges—device characterization, property-to-service mapping, SLA guarantees, deployment, and correctness/debugging—align with missing infrastructure in many heterogeneous-memory compiler stacks.
- **Why it matters for CIM compiler/IR work:** They map naturally to IR validation questions: can a compiler explain why an SLO was missed, why a device was selected, or why a placement is legal?
- **Reusable lesson:** Future CIM IRs could expose provenance from source annotation to backend action, supporting debug views for service selection and runtime migration.

## 8. Reproducibility, auditability, and integration helper

### 8.1 Artifact status

**Artifact status: no public artifact found.**

- **Official public sources checked:** CIDR paper and an author slide deck. The CIDR page lists the paper and authors; the paper itself is under CC-BY 4.0. ([VLDB](https://www.vldb.org/cidrdb/2026/declarative-memory-services.html))
- **Artifact URL or identifier:** none found for code, runtime, compiler, simulator, benchmark package, examples, or reproduction scripts.
- **License, if found:** paper license is **Creative Commons Attribution 4.0 International (CC-BY 4.0)**. Artifact license: **N/A / no artifact found**. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf))
- **Last checked date:** 2026-05-15.
- **What the artifact contains:** no public artifact found. The official slide deck contains a concise presentation of the three-layer design and explicitly states: “Caveat: yet to implement, this is pure vision!” ([Csyhua](https://csyhua.github.io/csyhua/Hua-CIDR26-slides.pdf))
- **What the artifact appears to omit:** implementation, code, device-catalog schema, compiler frontend, runtime service code, calibration scripts, simulator backend, benchmark harness, and reproduction scripts.
- **Minimal command or workflow, if documented:** none found.
- **Whether paper figures appear reproducible from the artifact:** no figure-generation workflow found; Figure 1 and Table 2 are conceptual diagrams/tables.

### 8.2 Auditability checklist

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Partial | Annotation examples are shown inline, but no grammar/schema is provided. |
| Intermediate representation serialized | Unknown | Logical regions and dataflows are described, but no serialized IR was found. |
| Mapping decisions inspectable | Partial | The paper names decisions such as placement, caching, replication, and offloading; no trace or decision log format was found. |
| Schedule inspectable | Unknown | Runtime scheduling is envisioned, but no schedule representation is provided. |
| Hardware config explicit | Partial | Table 2 sketches a device catalog; no machine-readable hardware config found. |
| Precision / bit-slice assumptions explicit | N/A | The work is not a numeric CIM compiler and does not model bit slicing or converter precision. |
| Cost model inspectable | Partial | Latency/bandwidth SLOs and cost factors are discussed; no equation or implementation found. |
| Simulator backend documented | N/A | No simulator backend is presented. |
| Generated code / instruction stream inspectable | N/A | No codegen or instruction stream is presented. |
| Provenance from source op to backend action | Partial | The architecture implies annotation → service → API mapping; no provenance tool or trace format found. |
| Reproduction scripts available | Unknown / not found | No scripts found. |
| Calibration source documented | Partial | Calibration-layer goals and catalog fields are described; calibration method is an open challenge. |

### 8.3 Integration helper

- **As frontend:** Integration would be conceptual rather than direct. A future compiler could borrow the annotation vocabulary for memory regions and tasks, but would need to define syntax, typing, and serialization.
- **As IR inspiration:** The strongest IR inspiration is the combination of logical memory regions, dataflow tasks, property annotations, and a device-capability catalog.
- **As mapper/scheduler:** The paper identifies mapper responsibilities—placement, caching, replication, offload selection, tiering, spilling, and service migration—but an implementation would need a cost model and legality rules.
- **As cost model:** Latency, bandwidth, coherence, data movement, device support, and runtime column/data size are useful cost-model dimensions; formulas and calibration data would need to be supplied by another stack.
- **As backend:** The backend boundary could be wrapped as abstract memory APIs such as `pim-offload` or `cxl-load`; no concrete backend implementation is available.
- **As benchmark:** The motivating scenarios—disaggregated B+-trees, PIM filtering, and tiered buffer caching—are useful benchmark categories, but DMS itself does not package benchmark inputs.
- **As validation source:** The paper provides design constraints and research questions rather than hardware measurements, RTL, SPICE, chip-in-loop, or real-system calibration results.

**Integration effort estimate: High.**  
Integration would be most direct through a small adapter that turns compiler buffer/task metadata into DMS-like property annotations, plus a backend capability table. The absence of a public implementation means a future stack would need to supply the schema, runtime service implementation, cost model, and provenance/debug tooling. The most valuable reusable boundary appears to be the property-to-service contract, not executable code.

## 9. Comparison to nearby works

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|
| **XMem** | Declarative memory properties and hardware/software co-design | XMem is described as focusing on low-level DRAM access performance in a single node, while DMS targets broader modern memory technologies and disaggregated environments. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | Classify XMem closer to memory-attribute mechanisms; classify DMS as a broader service/runtime vision. |
| **Stateful DataFlow multiGraph / DaCe SDFG** | Data-centric IR and transformations for heterogeneous architectures | SDFG is an explicit data-centric IR; DMS borrows a dataflow flavor but focuses on memory-service properties and runtime mapping. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | Useful contrast between explicit IR and property/runtime abstraction. |
| **Data Pipes** | Declarative control over cross-device data movement | Data Pipes declaratively specifies data movement, while DMS aims to specify higher-level memory properties without explicit data-movement operations. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | Helps separate “movement-as-IR” from “property-as-IR.” |
| **DEX / Sherman** | Disaggregated-memory indexing, caching, placement, coherence | DMS uses these systems as examples of hand-coded caching, partitioning, and offloading choices that could be represented declaratively. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | Place DEX/Sherman as concrete systems; DMS is a generalization layer over their memory-service decisions. |
| **Membrane** | DRAM-PIM database filtering and bank-level parallelism | Membrane is the concrete PIM filtering target; DMS abstracts when and how filtering should be offloaded using runtime services. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | DMS is PIM-relevant through offload service selection, not through low-level PIM IR. |
| **HyMem / Spitfire / vmcache** | Tiered-memory buffer management and DBMS hints | DMS extends the idea of DBMS intent/hints toward declarative properties for data caching, cooling, spilling, and compression. ([VLDB](https://www.vldb.org/cidrdb/papers/2026/p21-castrillon.pdf)) | Useful as a memory-system baseline for runtime state and page/region policy. |

## 10. Corpus-ready final takeaway

- **Real contribution:** a declarative memory-services vision that separates application property annotations, hardware calibration/device catalogs, and runtime memory services.
- **Strongest reusable stack layer:** the property-to-service boundary: logical memory region / dataflow task → desired properties → memory service → device API.
- **Evidenced scope:** paper-level architecture and DBMS case studies for disaggregated B+-trees, PIM filtering, and tiered buffer caching.
- **First-class objects:** logical memory regions, dataflow tasks, memory-property annotations, device catalog entries, memory services, and runtime mapping state.
- **Hidden IR location:** the effective IR is distributed across annotations, the device catalog, service-selection state, and runtime metadata.
- **CIM relevance:** PIM is included as a computational-memory backend via offload services and APIs; CIM-internal numeric objects such as bit slices, ADC/DAC stages, partial sums, and reconstruction paths are not represented.
- **Artifact/reproducibility status:** Artifact status: no public artifact found. The official slide deck states the work is “yet to implement” and “pure vision.” ([Csyhua](https://csyhua.github.io/csyhua/Hua-CIDR26-slides.pdf))
- **Integration role:** best used as IR inspiration for memory-service annotations and backend capability catalogs, with high integration effort for executable compiler/runtime use.
