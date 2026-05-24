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
| `manifest-visualization-refinement.md` | active | Refining static manifests, atlas/cluster visualization, route presentation, or website-facing project summaries. |
| `cluster-analysis-working-groups.md` | paused / retrievable | Resuming cluster investigation, working-group comparison cards, `/clusters/` evidence notes, or merged cluster content/manifest text-graph work. |
| `paper-metadata-maintenance.md` | paused / retrievable | Improving paper source metadata, especially arXiv-only entries that may now have formal publication records. |

## Switching Focus

1. Save the outgoing focus state in a focus file.
2. Update `docs/active-context.md` to name the incoming focus and link the saved outgoing focus.
3. Update `docs/next-session-prompt.md` so `proceed` resumes the incoming focus.
4. Update this index if a focus is added, completed, archived, or superseded.
5. Keep default context short; do not paste full focus plans into `AGENTS.md`.
