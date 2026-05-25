# Focus Contexts

Use this directory to preserve retrievable project focus state when `docs/active-context.md` switches to a different active focus.

## How It Works

- `docs/active-context.md` names the current active focus and points to any paused focus that may need to be resumed later.
- Each focus file here keeps the compact state needed to restart that focus without bulk-reading archives.
- A focus file is not an archive. It is live retrievable context for work that may resume after another focus is marked done.
- When a focus is truly completed or superseded, move its detailed rationale to `docs/archive/` and update this index.

## Current Focus Files

| Focus file | Status | Use when |
|---|---|---|
| `detail-page-content-refinement.md` | active | Refining individual paper detail pages, note content quality, source traceability, and per-paper reading usefulness. |
| `style-controller.md` | paused / retrievable | Constructing a general style controller for colors, formatting, fonts, spacing, and shared presentation policy. |
| `cluster-analysis-working-groups.md` | completed / maintenance | Maintaining cluster investigation, working-group investigation articles, `/clusters/` evidence notes, or cluster content/object-flow work after the completed focus. |
| `paper-metadata-maintenance.md` | paused / retrievable | Improving paper source metadata, especially arXiv-only entries that may now have formal publication records. |

Completed focus history is indexed in `docs/archive/README.md`; the manifest/visualization refinement focus was archived as `docs/archive/2026-05-manifest-visualization-refinement-iteration.md`.

## Switching Focus

1. Save the outgoing focus state in a focus file.
2. Update `docs/active-context.md` to name the incoming focus and link the saved outgoing focus.
3. Update `docs/next-session-prompt.md` so `proceed` resumes the incoming focus.
4. Update this index if a focus is added, completed, archived, or superseded.
5. Keep default context short; do not paste full focus plans into `AGENTS.md`.
