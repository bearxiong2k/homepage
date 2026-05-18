# A Taxonomy of the Current CIM Compiler/IR Stack

*Framing: this taxonomy is deliberately not organized by memory technology (SRAM/RRAM/PCM/DRAM-PIM/UPMEM). Technology choice is orthogonal to the compiler question. The right axis is **what object the stack makes first-class** — what it names, types, rewrites, and hands to the backend. Read through this lens, the field's structure becomes sharp, and the gap our project targets becomes unambiguous.*

---

## 1. The Dominant Shape of the Stack

Across ~40 surveyed works, one pipeline recurs with remarkable uniformity:

```
[Static compute graph]  →  [Middle: mapping / search / lowering]  →  [ILA-ish + action-count simulator]
     (ONNX / Torch /            (where all variation lives,              (latency / energy / area,
      linalg / TOSA)              and where the field is weakest)         sometimes accuracy)
```

Frontends and backends are effectively **solved** for static workloads at the level of expressive adequacy — nobody needs another ONNX importer, and nobody needs another action-count simulator. The contested ground, and the ground where the field is conceptually thin, is the **middle**.

The taxonomy below therefore proceeds along four axes:

- **Axis A — Stack role:** which slice of the pipeline does the work occupy?
- **Axis B — Middle-layer style:** what abstraction sits between frontend and backend?
- **Axis C — First-class object:** what CIM-specific phenomenon is visible to the compiler?
- **Axis D — Rewrite object:** what does the compiler actually transform?

Axes A and B classify papers; axes C and D expose the gap.

---

## 2. Axis A — Stack-Role Taxonomy

Six families, by the slice of the stack each work owns:

| Family | First-class artifact | Representative works | Relation to our project |
|---|---|---|---|
| **A1. Macro / circuit generators** | Macro templates, cell choices, precision datapaths | AutoDCIM, SynDCIM, ARCTIC, SEGA-DCIM, OpenC², ReSCIM | Useful as *backend plugin targets*; below the IR question entirely. |
| **A2. Simulators & cost models** | Component hierarchy, energy/latency LUTs, nonideality tables | NeuroSim, DNN+NeuroSim, MNSIM-style, GENIEx, PIMACC, PIMSIM-NN, PIMeval, CoMoNM, HARMONI, CiMLoop | Useful as *evaluation backends*. CIM knowledge lives in simulator state, not in compiler-visible semantics. |
| **A3. Mapping / scheduling / DSE frameworks** | Tensor tiles, loop nests, layer partitions, array bindings, replication choices | PIMCOMP, PIMSYN-NN, CIM-MLC, CMSwitch, CIMFlow, MIREDO, ARES, CIM-Tuner, PIM-HLS, AccelCIM, NAX, Gibbon, Turbo-Charged Mapper | **Closest prior-art cluster.** The object being rewritten is *mapping*, not *trajectory*. Data movement is costed, not typed. |
| **A4. Explicit IR / dialect / ISA compiler stacks** | Graph IR, MLIR dialects, hardware-resource IR, meta-ops, ISA streams | CINM/Cinnamon, C4CAM, CIMFlow, OpenCIMTC, CIM-MLC, PUMA, PIMsynth, PolyXB | **Strongest IR-comparison baselines.** They claim explicit IR boundaries, but the IR object is an op, loop, resource, or instruction — not a value flow. |
| **A5. Narrow end-to-end co-design** | One architecture × one workload family | HASTILY, Hermes, PAPI, Ouroboros, Count2Multiply, DyPIM, Monarch-BD CIM, Hybrid-PIM for Mamba/RWKV, CIM-MXU, ViT-CIM | Prove useful architecture ideas; hide compiler boundaries and hard-code trajectories rather than representing them. |
| **A6. Programming / runtime / benchmark on real hardware** | Runtime API, DPU partitioning, host↔device movement | PrIM, SparseP, SimplePIM, DaPPA, PIM-TC, PIM-Opt | Important lessons for future dynamic work; outside static-CIM-IR scope. |

**What determines where a paper lands** (empirically, three forces):

1. **Lab center of gravity.** Circuit labs → A1. Compiler labs (Castrillon TUD, MIT) → A4, but tend to import GPU IR habits. Architecture labs → A3 or A5. Real-hardware labs (SAFARI, LAVA) → A6.
2. **Target workload.** CNN inference → A3/A4. LLM serving → A5 (runtime-first), because nobody has static IR vocabulary for dynamic KV state.
3. **Hardware maturity.** Real silicon → A6 (ISA forced to exist). Simulator-only → A3/A4 (absent hardware contract lets IR drift).

Our project posture is **A4-shaped** (compiler/IR) **applied to analog+digital CIM specifics** (which A4 labs usually abstract away) **on static workloads** (which A5 has largely abandoned). No single force in the field produces this intersection — which is an opportunity, and a reviewer-baseline hazard (§9).

---

## 3. Axis B — Middle-Layer Taxonomy

This is the most important axis for the paper. It refines the distinction within families A3/A4 by asking: *what abstraction actually sits between frontend and backend?*

### B1. Config-as-IR ("implicit compiler")
The middle layer is a bundle of description files — workload spec, hardware hierarchy, device model, search heuristic, NoC choice, PPA tables, accuracy model, architecture knobs — plus a search procedure. There is no stable IR; the "program" exists only as mutable state inside the search loop.

**Examples:** PIMSYN-NN, Gibbon, NAX, CIM-Tuner, AccelCIM, MCC-DSE, SEGA-DCIM, PIM-HLS, OpenACMv2, DNN+NeuroSim, many CiMLoop-style YAML flows.

**Tell:** the figure-of-contribution is a search-loop diagram; the "IR" is a Python/YAML struct coupled to the search algorithm.

### B2. Graph-as-IR
The middle starts from ONNX/TorchScript/layer DAGs and partitions, fuses, duplicates, or annotates. Strongest for layer partitioning, operator duplication, static DNN scheduling, per-layer architecture selection.

**Examples:** PIMCOMP, PIMSYN-NN, CIMFlow CG-level, CIM-MLC coarse-grained mode, OpenCIMTC ONNX path, CMSwitch graph-level stages.

**Tell:** the IR sees `Conv → MatMul → Add → ReLU`, but not "this value is a bit-sliced partial sum at columns 0–63, ADC-group 2, with significance offset 4."

### B3. Loop / tensor-schedule IR
Affine schedules, tensor expressions, einsums, linalg ops, LoopTree/Timeloop mappings, polyhedral SCoPs. Can represent tiling, unrolling, reuse, spatial/temporal loops, memory hierarchy placement, compute binding.

**Examples:** CINM/Cinnamon, PolyXB, ARES, MIREDO, Turbo-Charged Mapper, CiMLoop-adjacent flows, CIMFlow OP-level.

**Tell:** values are tensors in buffers, loops move tiles. CIM-specific phenomena (ADC sharing, bit-slice significance, reconstruction, analog partial sums, peripheral timing) appear as lowering details or cost-model constraints. **This is the strongest "respectable compiler" baseline to contrast with.**

### B4. Hardware-resource IR
Makes parts of the CIM machine visible: chip/core/crossbar hierarchy, macro groups, array groups, wordline/bitline structure, ADC/DAC precision, buffer capacity, NoC topology, compute-vs-memory mode.

**Examples:** CIM-MLC (chip/core/crossbar + CM/XBM/WLM), PIMCOMP (array groups), CMSwitch (dual-mode DEHA), ARES (compute/memory abstractions), CIMFlow (chip/core/unit), PIMSYN (macro/PE/crossbar), CIM-Tuner (matrix-template macros).

**Tell:** can answer "which crossbar/core does this operator use?" Cannot cleanly answer "what typed path does this value take through analog accumulation → conversion → digital accumulation → reduction → storage?" **Resource-centered, not value-centered.**

### B5. Instruction / meta-op / ILA
A backend boundary through instructions, pseudo-instructions, meta-operators, microprograms, action traces.

**Examples:** PUMA, PIMSIM-NN, CIMFlow ISA, CIM-MLC meta-operator flow, UniNDP, Count2Multiply µPrograms, PIMsynth bit-serial microprograms, PIMCOMP pseudo-instructions, PIMeval command model.

**Tell:** good for backend decoupling and simulation. Too low-level for upstream rewrites: once a path becomes an instruction stream, high-level equivalences (e.g., reconstruction-tree vs. fused-reducer) are already lost.

### B6. Accuracy / nonideality modeling
Analog error, quantization, stuck-at faults, IR drop, conductance drift, ADC precision, learned nonideality surrogates.

**Examples:** PIMACC, GENIEx, NeuroSim/DNN+NeuroSim, OpenCIMTC hardware-aware training, CLEAR chip-in-loop emulator, device-calibrated RRAM/SRAM flows.

**Tell:** accuracy/nonideality treated as simulation or training metadata, not as compiler-rewritable path properties.

### B7. Runtime-state abstraction
KV cache blocks, request-level parallelism, continuous batching, hot/cold placement, activation sparsity prediction, runtime remapping.

**Examples:** Hermes, PAPI, Ouroboros, HARMONI, some VLM/token-pruning CIM works.

**Tell:** contributes runtime policies, not static compiler IR. **Adjacent to our scope, not competing with it.** These works are running on top of static-CIM assumptions they never made explicit; they will eventually need our abstraction.

---

### The Hidden-IR Pathology (cross-cutting observation)

A pattern worth naming because it recurs across nearly every B1–B5 work and is the single biggest reason the field has not produced a stable abstraction:

> **The actual IR of a CIM compiler is almost never the one the paper names. It is the union of: the config YAML, the mutated graph attributes, the search-state struct, the cost-model LUT, and the codegen string templates.**

Concrete instances:

- **CIM-MLC**: paper foregrounds Abs-arch + Abs-com + meta-operator flow; actual semantics live in mutated ONNX attributes, pass ordering, and operator-specific virtual mapping routines.
- **CMSwitch**: foregrounds DEHA + DACO + DMO; actual IR is "ONNX graph + topological list + greedy sub-op partition + MIP solution + DP table + meta-op stream."
- **PIMSYN-NN**: foregrounds an IR-DAG; actual IR is "network JSON + Python layer objects + DSE candidate structs + final architecture JSON."
- **PIMCOMP**: "graph/config/instruction-like," explicitly not formalized.
- **CINM**: closest to a real IR (MLIR dialects), but layout/bit-slicing/ADC semantics live in backend setup and string templates, not in the dialect itself.

**Diagnostic:** "Does this paper have an IR?" is the wrong question. The right question is **"is there a single artifact that upstream passes can read, verify, and rewrite without consulting hidden state?"** Almost no surveyed work answers yes. A *real* IR **closes over its own semantics** — no hidden config, no smuggled assumptions in pass ordering. This is the positioning principle our project adopts.

---

## 4. Axis C — What CIM Objects are First-Class

For each work, ask: *what CIM-specific phenomenon is visible to upstream passes?*

| First-class object | Papers that expose it | Papers where it's implicit/hidden |
|---|---|---|
| Crossbar as 2D physical resource | CIM-MLC (VXB), CINM, CMSwitch (DEHA), PIMCOMP, OpenCIMTC, ARES | Most others: a mapping target inside search |
| Bit-slicing / bit-significance | GENIEx (backend), CiMLoop (as encoding), AdaP-CIM, Count2Multiply, PIMsynth | Nearly everyone: hidden in backend layout or a cost-model scalar |
| ADC/DAC precision | NeuroSim, CiMLoop, GENIEx, CIM-MLC (as parameter) | Everyone else: fixed device fact |
| Analog/digital domain transition | — (rarely named semantically) | Modeled as latency/energy/accuracy cost |
| Peripheral circuits as scheduled path nodes | — | Modeled as overhead cost only |
| Partial-sum accumulation path | — | **No paper makes this a first-class IR object** |
| Reconstruction tree | — (treated as inevitable) | Hard-coded in lowering |
| Dual-mode (compute vs. memory) arrays | CMSwitch | — |
| Hot/cold or dynamic mask state | Hermes, DyPIM | — |
| Sparsity structure | CIMinus (FlexBlock), SparseP, Monarch-BD | Preprocessing elsewhere |
| Fault / variation / nonideality | Count2Multiply, SHERLOCK, NeuroSim, GENIEx, ReSCIM | Absent or accuracy-only |
| **Space-time path of a value (flow/trajectory)** | **— (the gap we target)** | — |

**The last row is the finding.** No surveyed work makes *the path a value takes through the fabric* a named, typed, rewritable IR object. Closest approximations:

- **CIM-MLC's meta-operator flow**: closest in *name*, but a textual codegen output, not an IR the upstream reasons about.
- **ARES's tensorized compute + memory-layout matrices**: closest in *spirit* (encodes bit-level operand layout constraints), but stays at mapping level with no notion of multi-stage path.
- **CiMLoop's container hierarchy + encoding/slicing**: closest as *substrate*, but dataflow-as-object remains implicit in the loop nest.
- **CoMoNM's llvcnm**: virtual-assembly level — too low to serve as our abstraction.

Our project promotes the thing everyone names in their figures ("dataflow", "path", "flow") but nobody types.

---

## 5. Axis D — What the Compiler Actually Rewrites

A complementary view: what is the unit of transformation?

| Rewrite object | Typical transformations | Existing strength | What stays implicit |
|---|---|---|---|
| Operator graph | partition, fusion, duplication, pipeline segmentation | Static DNN compilation | CIM-local value paths, bit-slice movement, analog/digital boundaries |
| Loop nest / tensor schedule | tiling, interchange, unrolling, spatial/temporal mapping | Regular dense tensor workloads | Converter/peripheral paths, reconstruction, mixed-domain partial sums |
| Hardware mapping | array binding, macro allocation, row/column packing, replication | Capacity/utilization optimization | Value identity across analog partial sums and digital reducers |
| Mode selection | compute vs memory, SRAM vs RRAM, CIM vs host/GPU/PIM | Heterogeneous resource selection | Type-level semantics of mode transitions |
| Instruction stream | scheduling, synchronization, trace generation | Simulator/ISA boundary | High-level equivalences; legality of rewrites |
| Numeric format | quantization, bit slicing, posit/approximate, nonideality injection | Accuracy/PPA co-design | Relation between bit significance and physical route |
| Runtime state | KV placement, batching, token scheduling, hot/cold placement | Dynamic serving studies | Stable static value-flow abstraction |
| **Flow / trajectory** | **fusion, rerouting, reconstruction elimination, precision/channel retiming** | **Mostly missing** | **Our contribution** |

Mapped to sophistication tiers:

- **C1. Choose-and-place.** Pick a mapping from a finite set; optionally duplicate. *PIMCOMP, PIMSYN-NN, PIM-HLS, Hermes, PAPI, CIM-MXU, most hardware-gen.*
- **C2. Loop-nest-style search with CIM-aware constraints.** Tile, unroll, reorder, assign to hierarchy; cost model decides. *CiMLoop, Turbo-Charged Mapper, MIREDO, CINM, CIMFlow, CMSwitch, AccelCIM, ARES, CIM-Tuner.*
- **C3. Rewriting at the level of the computation itself.** Change *what gets computed* or *how operators compose*, not just how loops iterate. **Nearly empty.** Only honest entries: **Count2Multiply** (masked accumulation fused with Johnson counters), **HASTILY's UCLM** (fusing exponent LUT into MVM arrays), **Monarch-block-diagonal mapping** for structured sparsity. **Trajectory fusion belongs in this tier.**

The generic failure mode is that C1/C2 dominate because the IRs those works use *cannot express* C3 rewrites. Reconstruction trees, bit-slice significance, and partial-sum reduction paths are hidden inside backend codegen or cost-model constants. An IR that doesn't name them can't rewrite them.

---

## 6. What the Field Expresses Well — and What It Misses

Existing stacks are strong along predictable dimensions:

- **Hardware hierarchy** — chip → tile/core → PE/macro → crossbar → row/column/cell is well-covered by CIM-MLC, PIMCOMP, PIMSYN, CIMFlow, ARES, NeuroSim, OpenCIMTC.
- **Operator-to-array binding** — mapping Conv/GEMM/MVM/attention/MLP to arrays is a mature craft.
- **Static dense scheduling** — CNNs, MLPs, transformer linear layers are handled reasonably.
- **Cost-driven mapping** — latency, energy, area, utilization, NoC traffic, ADC/DAC cost, macro sharing, write cost, accuracy degradation are all modeled somewhere.
- **Backend-driven instruction / trace generation** — PUMA, PIMSIM-NN, CIMFlow, CIM-MLC, PIMCOMP, PIMsynth, UniMDP, PIMeval prove instruction-like backend boundaries are workable.

But the field systematically misses six things, each a consequence of not treating value flow as an IR object:

### 6.1 Dataflow as execution consequence, not IR object
Stacks derive dataflow *from* mapping and scheduling decisions. They can say *"map this tile to this array and schedule this instruction"* but not *"this value follows trajectory τ from analog partial sum through ADC group A, into digital accumulator B, through reconstruction tree R, into reducer D — and τ can be legally fused with τ′."*

### 6.2 Bit-slicing as layout/backend detail
Multi-bit weights, cell precision, bit-serial execution, ADC/DAC precision, shift-and-add reconstruction are represented as hardware config, mapping constraint, simulator parameter, or generated instruction sequence — rarely as type-level information on a value trajectory.

### 6.3 Analog/digital boundary is not a semantic boundary
Charge/current/voltage partial sums → sensed digital values → digital accumulation → storage: existing IRs flatten this into "MVM result" or "array operation result." The transition is modeled by latency/energy/accuracy, not as a compiler-visible typed transition.

### 6.4 Peripheral circuits as costs, not path nodes
ADC sharing, DAC bandwidth, sense-amp access, shift-add trees, local accumulators, reducers, output buffers often dominate CIM execution. Most IRs expose compute arrays more clearly than peripheral routes.

### 6.5 Reconstruction treated as inevitable
The received pipeline is *"crossbar partial sums → reconstruction tree → full-precision value → downstream op."* No existing IR structurally supports asking *"can the bit-sliced partial sums flow directly into the downstream reducer?"* because none of the four nouns in that question is typed.

### 6.6 Runtime state underdeveloped
LLM-serving CIM papers discuss KV cache, batching, token scheduling, runtime placement, but as architecture-specific schedulers, not as IR layers. This motivates our scope note: static compilation is not the endpoint, but it is the right ground on which to settle the value-flow abstraction before dynamic serving makes it harder.

---

## 7. The Field's Implicit Assumptions Our IR Should Break

Several assumptions are so universal that papers don't argue for them. Each is a vulnerability the trajectory abstraction exploits:

- **(a) "Bit-slicing is a backend layout concern."** Every analog-CIM paper treats bit-significance as a property of how weights are placed into columns, then *erases it* by producing a single accumulated tensor before the next operator. The reconstruction tree is invisible to upstream IR. Exactly what trajectory fusion targets.
- **(b) "Precision is a per-tensor scalar."** Quantization frameworks attach one precision per tensor. CIM reality: input, cell, DAC, ADC, and accumulation precisions are distinct and per-stage. CIM-MLC names them as VXB attributes but does not propagate them through rewrites. Type-level per-stage precision in trajectories is a clean break.
- **(c) "Channel rate equals operator rate."** No surveyed work distinguishes the rate at which a CIM array *produces* partial sums from the rate downstream digital logic *consumes* them. This is the bandwidth mismatch hidden in every "ADC-aware" cost model. Type-level channel rate enables coercions and rate-mismatch rewrites no current IR can express.
- **(d) "Mapping is a one-shot decision."** Hierarchical-search compilers commit early and treat downstream lowering as deterministic. Trajectories carry placement as type information later passes can refine — structurally different from treating it as a search variable.
- **(e) "Reduction is opaque."** Reducers (digital adder trees, shift-and-add reconstruction, softmax accumulation) appear as monolithic primitives. Trajectory fusion's leverage comes from cracking them open: reducers have *internal structure* that interacts with the bit-significance of their inputs, and that structure is currently invisible.

---

## 8. Where Our Project Sits

Against this map, the project is recognizably **not** another entry in A1–A6 and not another entry in B1–B7.