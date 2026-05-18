# Corpus Note Harness

Use this harness when converting one CIM stack paper into a public corpus note.

Current project priority note: the paper corpus migration is complete enough that the next product milestone is the `/library/` taxonomy atlas visualization, not more single-paper page polish. Use `docs/atlas-visualization-harness.md` for atlas UI work. Use this corpus-note harness only when adding or substantially revising paper notes.

For the current raw-note migration, most notes already follow this harness. The task is usually to promote their `## 12. Suggested metadata entry` YAML into Astro frontmatter, not to regenerate the full note.

## Input Contract

```text
Paper to analyze: <paper name>
Primary source: <paper URL or local path>
Official artifacts checked: <code/docs/artifact URLs>
Legacy seed note: src/content/legacy/CIM stack library compact.md
Taxonomy: src/data/taxonomy.json and src/content/legacy/CIM taxonomy.md
```

Use the legacy compact note as a starting hypothesis only. Re-check the paper and artifacts independently.

## Writing Requirements

- Separate what the paper claims from what is evidenced by equations, algorithms, experiments, code, documentation, or artifacts.
- Include technical detail that helps a researcher reuse, compare, or extend the work.
- Use a constructive, neutral, scholarly tone.
- Avoid direct negative phrasing where a scoped evidence statement is clearer.
- State artifact availability directly. If no artifact is found, write: `Artifact status: no public artifact found.`
- Use `Unknown / not found in the checked sources` for uncertain facts.
- Do not invent numbers, algorithm names, architecture parameters, benchmarks, or artifact behavior.

Preferred phrasing:

- `The demonstrated scope is ...`
- `The reusable interface is clearest at ...`
- `The paper provides strongest evidence for ...`
- `Further reuse would depend on ...`
- `The artifact exposes ... while several assumptions remain embedded in ...`

## Output Structure

```markdown
# <Paper Name> -- scoped CIM stack note

## 1. Corpus classification snapshot

| Dimension | Classification | Evidence / rationale |
|---|---|---|
| Primary stack role, Axis A | A1/A2/A3/A4/A5/A6, or hybrid | 1-3 sentences |
| Middle-layer style, Axis B | B1-B7, possibly multiple | 1-3 sentences |
| First-class CIM objects, Axis C | Concrete objects | What is named or represented directly |
| Rewrite object, Axis D | Graph / loop / mapping / instruction / numeric format / runtime state / other | What transformations the work performs |
| Best corpus tags | 5-10 tags | Concrete tags |
| Closest comparison baselines | 3-6 works | Why they are close |

## 2. One-paragraph public summary

Write one polished paragraph that states the contribution, stack slice, demonstrated workload/hardware/compiler setting, and relevance to CIM compiler/IR research.

## 3. Claimed contribution vs evidenced contribution

| Paper claim | Where the claim appears | Evidence type | What is evidenced | Evidence boundary |
|---|---|---|---|---|
| Claim in authors' terms | Abstract / section / figure / table | Equation / algorithm / experiment / artifact / code / documentation / paper-only | Concrete supported content | Demonstrated scope |

## 4. Stack anatomy

Input / frontend:
Middle representation:
Mapping or scheduling state:
Hardware abstraction:
Backend / simulator / codegen:
Output artifact:
Evaluation loop:

**Hidden-IR reading:**
Identify where the effective semantics live if they are distributed across configs, graph annotations, search states, cost tables, pass order, simulator assumptions, or code templates.

## 5. Taxonomy placement in detail

### 5.1 Axis A -- stack role
Explain the primary and secondary stack roles and the input/output boundary.

### 5.2 Axis B -- middle-layer style
For each selected style, state the named middle representation, decisions made there, decisions embedded elsewhere, and whether one artifact can be read, verified, and rewritten.

### 5.3 Axis C -- first-class CIM objects

| CIM object | Status in this paper | Evidence |
|---|---|---|
| Crossbar / array / macro hierarchy | First-class / parameter / implicit / not applicable | Source |
| Bit-slicing / bit significance | First-class / parameter / implicit / not applicable | Source |
| ADC/DAC precision or sensing | First-class / parameter / implicit / not applicable | Source |
| Analog-to-digital or domain transition | First-class / costed / implicit / not applicable | Source |
| Peripheral circuits as path nodes | First-class / costed / implicit / not applicable | Source |
| Partial-sum accumulation path | First-class / costed / implicit / not applicable | Source |
| Reconstruction / shift-add tree | First-class / hard-coded / implicit / not applicable | Source |
| Runtime state, masks, KV cache, batching, sparsity | First-class / parameter / implicit / not applicable | Source |

### 5.4 Axis D -- rewrite object
State what the compiler/tool rewrites, what transformations are legal, what equivalences are exploited, what information must be preserved, and what would require an additional abstraction.

## 6. Technical mechanism reading

Explain equations/objectives, algorithms/passes, mapping/search/scheduling, cost model, hardware abstraction, precision assumptions, workload assumptions, simulator/backend assumptions.

## 7. Artifact and reproducibility

State public artifact status, runnable boundaries, input/output examples, dependencies, licenses if found, and what can be independently checked.

## 8. Comparison points

Compare against closest corpus entries using Axis A/B role, middle representation, first-class objects, and reusable boundary.

## 9. Integration notes for this library

State suggested frontmatter values and what role this paper should play in the corpus.

## 10. Final takeaway

One concise paragraph.
```

## Frontmatter Adapter

Use section 9 to fill `src/content/papers/<slug>.md` frontmatter:

- `summary`: section 2.
- `axis_A`: section 5.1.
- `axis_B`: section 5.2.
- `axis_C_first_class_objects`: section 5.3 concrete named objects.
- `axis_D_rewrite_objects`: section 5.4 rewrite targets.
- `artifact`: section 7.
- `tags`, `baselines`, `integration_roles`, `takeaways`: sections 1, 8, 9, and 10.

## Existing Raw Note Adapter

When a note already has `## 12. Suggested metadata entry`:

1. Extract the fenced YAML block under that heading.
2. Use it as the frontmatter candidate.
3. Normalize the file path to `src/content/papers/<slug>.md`.
4. Remove the `## 12. Suggested metadata entry` section from the rendered body.
5. Remove any generated section titled `## 9. Relation to a value-trajectory CIM IR project`.
6. Renumber `## 10. Comparison to nearby works` to section 9 and `## 11. Corpus-ready final takeaway` to section 10.
7. Keep the title and remaining public sections intact.
8. Check the candidate against `docs/metadata-template.md` and `src/content.config.ts`.

Conservative defaults for missing fields:

- missing optional URL: blank/null;
- missing arrays: `[]`;
- missing `artifact.status`: `unknown`;
- missing `artifact.last_checked`: current project date if the note clearly reflects current checked sources, otherwise blank/null;
- missing `reproducibility_level`: `unknown`;

Ignore obsolete `trajectory_IR_relevance` fields in generated notes. Never invent artifact links, licenses, paper venues, years, or research claims. If a suggested metadata block conflicts with the prose, keep the more conservative value and leave a short `notes` entry.
