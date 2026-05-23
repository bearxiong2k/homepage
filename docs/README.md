# Documentation Map

Use this file to choose context deliberately. New sessions should not read every document in `docs/`.

## Default Context

Read these at session start:

- `AGENTS.md` — stable project rules, architecture, guardrails, commands.
- `docs/active-context.md` — compact current state, active focus, latest verification baseline.

Use `docs/next-session-prompt.md` when explicitly asked to continue from the restart prompt.

## Task-Specific Context

Read only when the task calls for it:

| Task | Read |
|---|---|
| Add or revise a paper note | `docs/corpus-note-harness.md`, `docs/metadata-template.md`, `docs/legacy-source-map.md` |
| Work on cluster or working-group analysis | `src/data/clusters.json`, `docs/future-development-plan.md`, archive seed if needed |
| Work on website shell, registry, manifest, or route contract | `docs/website-integration/README.md`, then specific ADR/plan files only if needed |
| Reorganize docs or close/open an iteration | `docs/iteration-docs-playbook.md`, `docs/archive/README.md` |
| Recover legacy atlas/corpus provenance | `docs/legacy-source-map.md`, then the named files under `src/content/legacy/` |

## Active Docs

- `docs/active-context.md` — concise active project state and next focus.
- `docs/future-development-plan.md` — detailed roadmap and rationale; not default session context.
- `docs/next-session-prompt.md` — short restart prompt for explicitly requested continuation.
- `docs/iteration-docs-playbook.md` — how to maintain, slim, archive, and update docs across iterations.

## Paper and Corpus Docs

- `docs/corpus-note-harness.md` — long-form paper-note writing and migration harness.
- `docs/metadata-template.md` — complete frontmatter shape.
- `docs/legacy-source-map.md` — which legacy source to consult for compact notes, old atlas data, and taxonomy vocabulary.

## Website Integration Docs

`docs/website-integration/` records the static project-module contract. It is maintenance context, not active scaffolding.

Start with:

- `docs/website-integration/README.md`

Only then read specific files:

- `adr-0001-static-project-module-contract.md`
- `content-and-ui-harness.md`
- `personal-website-route-map.md`
- `plan.md`
- `agent-addendum.md`

## Archives

Archived docs live in `docs/archive/` and are indexed by `docs/archive/README.md`.

Archive files should be named:

```text
YYYY-MM-short-topic-kind.md
```

Examples:

- `2026-05-cluster-analysis-working-groups-seed.md`
- `2026-05-personal-website-integration-iteration.md`

Archives are not default context. Read an archive only when recovering rationale, restarting an old focus, or checking prior decisions.
