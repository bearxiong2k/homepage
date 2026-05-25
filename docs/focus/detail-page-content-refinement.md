# Focus: Detail Page Content Refinement

Status: active

Default-context policy: Read when refining paper detail page content, note structure, source presentation, or per-paper reading quality.

## Goal

Improve the content quality and usefulness of individual paper detail pages under `/papers/[slug]/`, with attention to how each page helps a reader verify and reuse a paper note.

This focus is about content refinement first, not a broad visual redesign. UI changes should support reading, source checking, note export, and uncertainty visibility.

## Main Files

- `src/content/papers/*.md`
- `src/pages/papers/[slug].astro`
- `src/pages/papers/index.astro`
- `src/content.config.ts`
- `docs/corpus-note-harness.md`
- `docs/metadata-template.md`
- `docs/legacy-source-map.md`
- `src/data/taxonomy.json`

## Current Route State

- `/papers/` lists all paper notes and supports selected-note Markdown export sourced from `src/content/papers`.
- `/papers/[slug]/` renders frontmatter metadata, source links, axis placement, normalized Axis C/D labels, note outline, and the Markdown note body.
- Paper pages currently carry the content tag: first-order AI content, manually modified prompt and direct AI output.

## Refinement Priorities

1. Audit representative detail pages for content clarity, repeated weak phrasing, source traceability, and uncertainty handling.
2. Identify which improvements belong in paper Markdown notes versus the detail-page shell.
3. Keep factual claims tied to papers, artifacts, docs, examples, issue trackers, or release notes.
4. Preserve a neutral scholarly tone and separate claimed contribution from evidenced contribution.
5. Avoid weakening `src/content.config.ts`; fix malformed content instead.

## Current Metadata Batch

- Name normalization is in progress: paper frontmatter now distinguishes full `title` from normalized `short_title`.
- Intended contract: note lists and detail pages use full `title`; atlas nodes and compact atlas UI use `short_title`.
- Publisher-link normalization is partially complete. Continue from `docs/focus/paper-metadata-maintenance.md` before doing more DOI/source edits.

## Guardrails

- Keep `/papers/[slug]/` stable.
- Do not add ranking, quality, coverage, or IR-relevance scores.
- Do not treat generated legacy notes as ground truth.
- Do not bulk-read legacy archives unless a specific paper refinement needs them.
- Use primary paper/artifact evidence first, then legacy seed material only as hypotheses.

## Verification

For content-only batches, run:

```bash
npm run validate
```

For detail-page shell changes or substantial note/export changes, run:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```
