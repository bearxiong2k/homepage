Below is a reusable prompt you can use for each paper name. It is designed around your taxonomy’s four-axis lens and first-class-object / rewrite-object questions, while using the existing library note only as a seed rather than the final authority. (CIM taxonomy.md) (CIM stack library compact.md)

```markdown
You are helping me build a public CIM compiler/IR-stack corpus.

Paper to analyze: **{PAPER_NAME}**
Old compact note:

Context:
I have a CIM compiler/IR taxonomy whose main purpose is to classify CIM stack papers by:
- Axis A: stack role
- Axis B: middle-layer style
- Axis C: CIM-specific first-class objects
- Axis D: compiler rewrite object

The taxonomy is deliberately centered on the compiler/IR question, not memory technology. The key lens is: **what object does the stack make first-class — what does it name, type, rewrite, verify, serialize, and hand to the backend?**

Your task is to produce a detailed, public-facing corpus note for this paper.

Use the following inputs, in priority order:
1. The paper itself.
2. Any official artifact: code repository, documentation, scripts, benchmark package, simulator, compiler, examples, issue tracker, release notes.
3. The existing compact library note, if provided, as a starting hypothesis only.
4. The taxonomy as the required scope and vocabulary.

Do not treat the compact library note as ground truth. Re-read the paper and artifact evidence independently.

Important writing requirements:
- Separate **what the paper claims** from **what is actually evidenced** by equations, algorithms, experiments, code, documentation, or artifacts.
- Go beyond taxonomy placement. Include paper-specific technical insight that would help a researcher understand, reuse, compare, or extend the work.
- This corpus will be public. Use a constructive, neutral, scholarly tone.
- Avoid direct negative phrasing when possible.
  - Prefer: “The demonstrated scope is …”
  - Prefer: “The reusable interface is clearest at …”
  - Prefer: “The paper provides strongest evidence for …”
  - Prefer: “Further reuse would depend on …”
  - Prefer: “The artifact exposes … while several assumptions remain embedded in …”
  - Avoid: “This is not …”, “It lacks …”, “It fails to …”, “weak”, “merely”, “only”, “just”.
- Exception: artifact availability must be stated directly. If no artifact is found, write: **“Artifact status: no public artifact found.”**
- Be precise and auditable. Use “Unknown / not found in the checked sources” when appropriate.
- Do not invent details. If a number, claim, algorithm name, benchmark, architecture parameter, or artifact behavior is uncertain, mark it as uncertain.
- Prefer concrete nouns over vague judgments: IR object, mapping state, schedule, cost model, instruction stream, simulator input, hardware hierarchy, layout metadata, precision field, bit-slice representation, ADC/DAC parameter, accumulation path, reconstruction path, runtime state.

Output format:

# {PAPER_NAME} — scoped CIM stack note

## 1. Corpus classification snapshot

Give a compact classification table.

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | A1/A2/A3/A4/A5/A6, or hybrid | 1–3 sentences |
| Middle-layer style, Axis B | B1–B7, possibly multiple | 1–3 sentences |
| First-class CIM objects, Axis C | List concrete objects | Say what is named or represented directly |
| Rewrite object, Axis D | Graph / loop / mapping / instruction / numeric format / runtime state / flow trajectory / other | Say what transformations the work actually performs |
| Best corpus tags | 5–10 tags | e.g., compiler-mapping, MLIR, ISA, simulator, analog-CIM, SRAM-CIM, DNN-inference, LLM-serving |
| Closest comparison baselines | 3–6 related works | Explain why they are close |

Keep this section concise but specific.

## 2. One-paragraph public summary

Write one polished paragraph suitable for the public corpus.

It should say:
- what the paper really contributes,
- what part of the CIM stack it strengthens,
- what workload / hardware / compiler setting is actually demonstrated,
- how it relates to CIM compiler/IR research.

Avoid promotional language and avoid adversarial critique.

## 3. Claimed contribution vs evidenced contribution

Create a table separating claims from evidence.

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Claim in the authors’ terms | Abstract / intro / section / figure / table | Equation / algorithm / experiment / artifact / code / documentation / case study | Concrete supported content | Carefully state demonstrated scope |

Evidence type definitions:
- **Equation**: formal objective, cost model, mapping formulation, latency/energy expression.
- **Algorithm**: pseudocode, pass description, search procedure, scheduling rule, lowering rule.
- **Experiment**: benchmark result, ablation, comparison, sensitivity study, hardware measurement.
- **Code/artifact**: public implementation, runnable examples, configs, schemas, generated outputs.
- **Documentation**: README, artifact appendix, API docs, comments, scripts.
- **Paper-only**: described in text but no independent artifact located.

For “Evidence boundary,” use public-facing phrasing:
- “Demonstrated for static CNN inference on …”
- “Evaluated through simulator-backed experiments over …”
- “Shown through artifact examples for …”
- “The reusable boundary is clearest at …”
- “The paper-level evidence supports …; artifact-level confirmation would require …”

Do not collapse claims and evidence into one verdict.

## 4. Stack anatomy

Describe the paper’s actual stack from input to output.

Use this template:

```text
Input / frontend:
Middle representation:
Mapping or scheduling state:
Hardware abstraction:
Backend / simulator / codegen:
Output artifact:
Evaluation loop:
```

For each line:
- name the object if the paper names it,
- say whether it is a graph, loop nest, config, IR, instruction stream, simulator trace, hardware template, runtime table, or implicit state,
- state whether it is serialized, inspectable, documented, and reusable.

Then add a short paragraph:

**Hidden-IR reading:**  
Identify where the actual semantics live if they are distributed across configs, graph annotations, search states, cost tables, pass order, simulator assumptions, or code templates. Phrase constructively:
“The effective intermediate state appears to be the combination of …”
“The paper foregrounds …, while the reusable semantics are most visible in …”

## 5. Taxonomy placement in detail

Use the taxonomy axes explicitly.

### 5.1 Axis A — stack role

Choose the primary and secondary families:
- A1 Macro / circuit generator
- A2 Simulator & cost model
- A3 Mapping / scheduling / DSE framework
- A4 Explicit IR / dialect / ISA compiler stack
- A5 Narrow end-to-end co-design
- A6 Programming / runtime / benchmark on real hardware

Explain:
- why it belongs there,
- which stack slice it owns most strongly,
- what input and output define that slice.

### 5.2 Axis B — middle-layer style

Choose from:
- B1 Config-as-IR
- B2 Graph-as-IR
- B3 Loop / tensor-schedule IR
- B4 Hardware-resource IR
- B5 Instruction / meta-op / ILA
- B6 Accuracy / nonideality modeling
- B7 Runtime-state abstraction

For each selected style, answer:
- What is the named middle representation?
- What decisions are made there?
- Which decisions remain embedded in search, codegen, simulator, or backend setup?
- Is there a single artifact that upstream passes could read, verify, and rewrite?

### 5.3 Axis C — first-class CIM objects

Make a table.

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | First-class / parameter / implicit / not applicable | cite section or artifact |
| Bit-slicing / bit significance | First-class / parameter / implicit / not applicable | cite section or artifact |
| ADC/DAC precision or sensing | First-class / parameter / implicit / not applicable | cite section or artifact |
| Analog-to-digital or domain transition | First-class / costed / implicit / not applicable | cite section or artifact |
| Peripheral circuits as path nodes | First-class / costed / implicit / not applicable | cite section or artifact |
| Partial-sum accumulation path | First-class / costed / implicit / not applicable | cite section or artifact |
| Reconstruction / shift-add tree | First-class / hard-coded / implicit / not applicable | cite section or artifact |
| Runtime state, masks, KV cache, batching, sparsity | First-class / parameter / implicit / not applicable | cite section or artifact |
| Value trajectory / flow path | First-class / approximated / implicit / not applicable | cite section or artifact |

Use “not applicable” for technologies where the object genuinely does not belong, such as ADC/DAC in fully digital DRAM-PIM.

### 5.4 Axis D — rewrite object

State what the compiler or tool actually rewrites:
- operator graph,
- loop nest,
- tensor schedule,
- hardware mapping,
- array binding,
- memory layout,
- mode selection,
- instruction stream,
- numeric format,
- runtime state,
- accuracy model,
- value trajectory.

Then answer:
- What transformations are legal in the paper’s framework?
- What equivalences are exploited?
- What information must be preserved across lowering?
- What transformations would be hard to express without changing the representation?

Phrase the last item constructively:
“The representation is especially well suited to …; expressing … would likely require an additional abstraction for …”

## 6. Technical mechanism reading

Explain the core technical mechanism in detail.

Include:
- key equations or objectives,
- algorithms or passes,
- mapping/search/scheduling procedure,
- cost model,
- hardware abstraction,
- precision or quantization assumptions,
- workload assumptions,
- simulator or backend assumptions.

Use subheadings as needed.

Do not summarize the paper generically. Extract the mechanism a compiler/IR researcher would care about.

## 7. Paper-specific insight beyond the taxonomy

Write 3–6 insights that are specific to this paper.

Each insight should have this structure:

### Insight N — short title

- **Observation:** what the paper reveals technically.
- **Why it matters for CIM compiler/IR work:** how it informs IR design, mapping, verification, cost modeling, backend contracts, or corpus organization.
- **Reusable lesson:** what a future stack could borrow.

Good insight examples:
- “The artifact’s config files function as a de facto IR boundary.”
- “The search objective separates mapping legality from cost ranking.”
- “The simulator interface reveals the true hardware contract more clearly than the paper’s compiler diagram.”
- “The precision fields are parameters, but their propagation path suggests a possible type-system design.”
- “The runtime table is a useful model for representing dynamic state in a future static-plus-runtime IR.”

Avoid obvious statements such as “the work is useful” or “the paper improves performance.”

## 8. Reproducibility, auditability, and integration helper

This section is required.

### 8.1 Artifact status

State directly:
- Artifact status: public artifact found / no public artifact found / artifact referenced but access unclear / artifact is partial.
- Artifact URL or identifier, if available.
- License, if found.
- Last checked date.
- What the artifact contains.
- What the artifact appears to omit.
- Minimal command or workflow, if documented.
- Whether paper figures appear reproducible from the artifact.

If no artifact is found, say directly:
**Artifact status: no public artifact found.**

### 8.2 Auditability checklist

Fill this table.

| Audit item | Status | Notes |
|---|---|---|
| Input format documented | Yes / Partial / Unknown |
| Intermediate representation serialized | Yes / Partial / Unknown |
| Mapping decisions inspectable | Yes / Partial / Unknown |
| Schedule inspectable | Yes / Partial / Unknown |
| Hardware config explicit | Yes / Partial / Unknown |
| Precision / bit-slice assumptions explicit | Yes / Partial / Unknown / N/A |
| Cost model inspectable | Yes / Partial / Unknown |
| Simulator backend documented | Yes / Partial / Unknown / N/A |
| Generated code / instruction stream inspectable | Yes / Partial / Unknown / N/A |
| Provenance from source op to backend action | Yes / Partial / Unknown |
| Reproduction scripts available | Yes / Partial / Unknown |
| Calibration source documented | Yes / Partial / Unknown / N/A |

Use “Partial” generously when some evidence exists but is embedded in scripts, configs, or prose.

### 8.3 Integration helper

Explain how this work could be reused in a future CIM compiler/IR stack.

Use the following bullets:
- **As frontend:** whether its parser/importer/workload format can be reused.
- **As IR inspiration:** which data structures or abstractions are worth borrowing.
- **As mapper/scheduler:** what mapping or scheduling logic could be adapted.
- **As cost model:** what metrics and formulas could become backend plugins.
- **As backend:** whether simulator/codegen/instruction interface could be wrapped.
- **As benchmark:** what workloads, configs, or baselines could be reused.
- **As validation source:** whether hardware measurements, SPICE, RTL, chip-in-loop, or real-system results can calibrate other tools.

Then add:
**Integration effort estimate:** Low / Medium / High, with 2–4 sentences explaining why.

Use constructive wording:
“Integration would be most direct through …”
“Reuse would benefit from a small adapter that extracts …”
“The most valuable reusable boundary appears to be …”

## 9. Relation to a value-trajectory CIM IR project

Evaluate the paper specifically against a future IR that makes value flow / trajectory first-class.

Answer:
- Does the paper name the path a value takes through CIM resources?
- Does it preserve value identity across analog partial sums, sensing, digital accumulation, reconstruction, reduction, and storage?
- Are bit significance, channel rate, precision stage, placement, and domain transition represented as type-like information?
- Could the paper’s representation express trajectory rewrites such as:
  - fusing reconstruction with downstream reduction,
  - delaying or retiming ADC conversion,
  - carrying bit-sliced partial sums across operator boundaries,
  - changing reduction tree structure,
  - routing values through alternative peripheral paths,
  - co-optimizing data movement and numeric reconstruction?

Use public-facing phrasing:
“The work provides useful ingredients for a value-trajectory IR, especially …”
“The closest approximation to trajectory semantics is …”
“A trajectory-level extension would likely attach … to …”

Avoid saying “the paper does not do X” unless it is necessary and trivial. Prefer “The paper’s demonstrated abstraction centers on X; trajectory-level rewrites would add Y.”

## 10. Comparison to nearby works

Compare this paper with 3–6 nearby works from the library.

Use a table:

| Nearby work | Shared concern | Key distinction | Lesson for corpus |
|---|---|---|---|

Focus on stack role and IR/mapping object, not performance ranking.

## 11. Corpus-ready final takeaway

Write 5–8 bullet points.

Each bullet should be concise and reusable.
Cover:
- real contribution,
- strongest reusable stack layer,
- evidenced scope,
- first-class objects,
- implicit or hidden IR location,
- artifact/reproducibility status,
- integration role,
- relevance to value-trajectory IR.

Use neutral language suitable for a public GitHub corpus.

## 12. Suggested metadata entry

Produce a compact YAML-style metadata block:

```yaml
paper: "{PAPER_NAME}"
year: 
venue: 
authors_or_group: 
technology:
  - SRAM-CIM / RRAM-CIM / PCM / DRAM-PIM / UPMEM / analog-CIM / digital-CIM / hybrid / other
workloads:
  - 
axis_A:
  primary:
  secondary:
axis_B:
  - 
axis_C_first_class_objects:
  - 
axis_D_rewrite_objects:
  - 
artifact:
  status:
  url:
  license:
  last_checked:
integration_roles:
  - frontend
  - IR inspiration
  - mapper_scheduler
  - cost_model
  - backend
  - benchmark
  - validation
reproducibility_level: high / medium / low / unknown
trajectory_IR_relevance: high / medium / low
notes:
  - 
```

General constraints:
- Be specific.
- Cite paper sections, figures, tables, algorithms, equations, and artifact files when available.
- Keep claims and evidence separate.
- Mark uncertainty explicitly.
- Do not overgeneralize from small experiments.
- Avoid direct negative judgments; use evidenced-scope language.
- State artifact absence directly.
```
