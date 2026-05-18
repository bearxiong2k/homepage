# CIM Library Agent Guide

## Project Intent

This repository is a static Astro paper library for CIM compiler/IR-stack research. Treat it as a public corpus, not as a private scratchpad.

The core question behind every entry is:

> What object does the stack make first-class: what does it name, type, rewrite, verify, serialize, and hand to the backend?

## Source Priority

Use sources in this order when adding or revising a paper entry:

1. The paper and any official artifact, docs, code, examples, issue tracker, or release notes.
2. `src/content/legacy/CIM stack library compact.md` as seed material.
3. `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html` for legacy atlas data, original overview text, and old visualization behavior.
4. `src/content/legacy/note prompt.md` and `docs/corpus-note-harness.md` for the note-writing harness.
5. `src/content/legacy/CIM taxonomy.md` and `src/data/taxonomy.json` for vocabulary.

Do not treat generated legacy notes as ground truth. Use them as hypotheses to check against paper/artifact evidence.

## Current Architecture

- `src/content/papers/*.md` is the paper database. Each file has YAML frontmatter plus a Markdown corpus note.
- `src/content.config.ts` is the strict Astro schema.
- `src/data/taxonomy.json` is the Axis A/B vocabulary and the coverage-dimension vocabulary.
- `src/pages/library.astro` renders the atlas route at `/library/`.
- `src/pages/papers/[slug].astro` renders individual paper notes.
- `src/components/TaxonomyAtlas.astro` owns filtering, the Axis A x Axis B atlas, the selected-paper panel, and the coverage matrix.

## Paper Entry Workflow

1. Create a stub with `npm run new:paper -- <slug> "<Paper Title>"`.
2. Fill frontmatter first; keep arrays inline where readable.
3. Paste or write the complete public corpus note below the frontmatter.
4. Preserve a neutral, constructive scholarly tone.
5. Separate claimed contribution from evidenced contribution.
6. Mark uncertain facts as `Unknown / not found in the checked sources`.
7. Run `npm run validate` before considering the entry ready.

Use `docs/metadata-template.md` for the full frontmatter shape and `docs/corpus-note-harness.md` for the long-form note structure.

## Taxonomy Rules

Axis A is the stack role:

- `A1` macro / circuit generators
- `A2` simulators and cost models
- `A3` mapping / scheduling / DSE
- `A4` explicit IR / dialect / ISA compiler stacks
- `A5` narrow end-to-end co-design
- `A6` programming / runtime / benchmark

Axis B is the operative middle-layer style:

- `B1` config-as-IR / search state
- `B2` graph-as-IR
- `B3` loop / tensor schedule
- `B4` hardware-resource IR
- `B5` instruction / meta-op / ILA
- `B6` accuracy / nonideality model
- `B7` runtime-state abstraction

Coverage values are descriptive levels, not quality scores:

- `0`: not central / not reported
- `1`: supporting or mentioned
- `2`: explicit component
- `3`: primary evidenced strength

The current atlas uses the sum of the twelve coverage levels as a visualization size/summary value. Do not introduce a separate ranking or scoring model unless explicitly requested.

## Development Commands

```bash
npm install
npm run validate
npm run check
npm run build
npm run dev
```

If dependencies are not installed, `npm run validate` still works because it uses Node built-ins only. `npm run check`, `npm run build`, and `npm run dev` require the Astro dependencies.

## Design Constraints

- Keep this as a static site suitable for personal hosting.
- Do not add PDF hosting yet.
- Do not add backend services or a database unless the project direction changes.
- Prefer small, inspectable metadata changes over automatic prose parsing.
- Improve visual components only after content and schema validation are stable.
- Keep legacy source files intact unless the user asks to rewrite or archive them.
