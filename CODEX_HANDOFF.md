# Codex handoff

## Goal

Finish this as a static Astro paper library. Do not add PDF hosting yet.

Root-level project instructions live in `AGENTS.md`. Use this handoff as a short status note; use `AGENTS.md` for ongoing agent behavior.

Current development plan lives in `docs/future-development-plan.md`. Atlas UI work should follow `docs/atlas-visualization-harness.md`. A ready-to-use restart prompt lives in `docs/next-session-prompt.md`.

## Design decisions already made

- Paper metadata source: Markdown frontmatter in `src/content/papers/*.md`.
- Taxonomy vocabulary source: `src/data/taxonomy.json`.
- Atlas route: `/library/`.
- Paper route: `/papers/[slug]/`.
- Visualization: prioritize a strong `/library/` taxonomy atlas before paper detail-page polish. Use the legacy standalone HTML as the benchmark for overview flow, matrix/list interactions, sizing, layout, and browsing utility.
- No coverage score, ranking score, or trajectory-IR relevance metadata in the active schema.
- Keep the site static and suitable for personal hosting.

## Current state

All 62 paper notes in `src/content/papers/` have been migrated into schema-valid Astro content entries. The previous raw-note migration blocker is resolved.

Latest verification:

- `npm run validate` passes: `Validated 62 paper metadata file(s).`
- `npm run check` passes: `0 errors, 0 warnings, 0 hints`.
- `npm run build` passes and builds 64 pages into `dist/`.

The final migration batch converted:

- `openc2.md`
- `opencimtc.md`
- `ouroboros.md`
- `papi.md`
- `pim-eda.md`
- `pim-hls.md`
- `pim-opt.md`
- `pim-tc.md`
- `pimacc.md`
- `pimcomp.md`
- `pimsim-nn.md`
- `pimsyn-nn.md`
- `pimeva.md`
- `pimsynth.md`
- `puma.md`
- `polyhedral-based-compilation-framework-for-in-memoryneural-network-accelerators.md`
- `prim.md`
- `rescim.md`
- `reconfigurable-dataflow-cim-accelerator-for-multi-scale-vision-transformer.md`
- `sega-dcim.md`
- `sherlock.md`
- `simplepim.md`
- `sparsep.md`
- `syndcim.md`
- `unindp.md`

Several artifact URLs and conservative metadata values were manually normalized when the note already contained checked evidence. Examples include OpenCIMTC, PIM-EDA, PIM-Opt, PIMACC, PIMCOMP, PIMSIM-NN, PIMSYN-NN, PrIM, and PUMA.

On macOS-style case-insensitive filesystems, Git may show case-only filename normalizations as modifications under the original tracked names until staging. The on-disk lowercase kebab-case filenames are authoritative.

## What to finish next

1. Keep content QA green with `npm run qa`, `npm run validate`, `npm run check`, and `npm run build`.
2. Improve `/library/` before individual paper pages.
3. Use `docs/atlas-visualization-harness.md` and `src/content/legacy/cim_compiler_ir_taxonomy_visualization.html` as the guide.
4. Restore or adapt the legacy strengths: first-screen taxonomy framing, role/style matrix with click-to-filter behavior, visible result counts, compact synchronized paper browsing, selected-paper details, and responsive sizing.
5. Do not reintroduce coverage scores, ranking scores, or `trajectory_IR_relevance` as active metadata.
6. Improve individual paper page layout only after the atlas is substantially useful.

Use `docs/atlas-visualization-harness.md` for atlas work. Use `docs/corpus-note-harness.md` when generating full public notes. Use `docs/legacy-source-map.md` when recovering original overview text or compact-source material from draft artifacts.

## Frontmatter contract

Required fields:

```yaml
slug: lowercase-kebab-case
title: Paper title
summary: public one-paragraph summary
axis_A:
  primary: A1|A2|A3|A4|A5|A6
  secondary: []
axis_B: [B1]
```

Keep arrays inline where possible. The Astro schema is the strict source of truth; `scripts/validate-library.mjs` is a fast preflight check.

Obsolete generated fields such as `coverage` and `trajectory_IR_relevance` should stay out of migrated entries.

## Future imports

For any future raw generated note:

1. Run `node scripts/promote-raw-note.mjs --dry-run <files...>` first.
2. Promote the note with `scripts/promote-raw-note.mjs` only after inspecting planned filenames and warnings.
3. Restore a schema-valid year, URL, or reproducibility label only when official source material or checked note evidence supports it.
4. Run `npm run validate`, then `npm run check`, then `npm run build`.
