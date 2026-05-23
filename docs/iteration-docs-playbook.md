# Iteration Docs Playbook

Use this when opening, closing, or changing project focus. The goal is to keep default session context small while preserving enough history to recover decisions.

## Context Tiers

### Tier 1: Always Read

- `AGENTS.md`
- `docs/active-context.md`

These files must stay concise and stable. They should tell a future agent what the project is, what is currently active, and which guardrails are non-negotiable.

### Tier 2: Read When Needed

Task-specific docs live outside the default context:

- Paper-note work: `docs/corpus-note-harness.md`, `docs/metadata-template.md`, `docs/legacy-source-map.md`.
- Cluster work: `docs/future-development-plan.md`, `src/data/clusters.json`, relevant paper notes, and archived cluster seed if needed.
- Website work: `docs/website-integration/README.md` and the specific contract/ADR files it points to.
- Docs work: this playbook and `docs/archive/README.md`.

### Tier 3: Archives

Archives preserve history and rationale. They are not restart context.

Read archives only when:

- reactivating an old focus;
- checking why a route, schema, or page shape exists;
- recovering previously deferred plans;
- comparing current choices against an earlier decision.

## Opening an Iteration

1. Update `docs/active-context.md` with the active focus, current route/data files, and latest known good checks.
2. Put detailed goals and rationale in `docs/future-development-plan.md` or a focused task doc.
3. Keep `docs/next-session-prompt.md` short. It should point to `AGENTS.md`, `docs/active-context.md`, and task-specific docs only by need.
4. Do not paste long task plans into `AGENTS.md`.

## During an Iteration

- Update active implementation details near the source of truth.
- Prefer data files and route files for implemented behavior over prose-only claims.
- Keep docs factual: what exists, what is uncertain, what to check next.
- Mark comparison sets explicitly when evidence does not support a lineage claim.
- Do not copy the same state summary into several docs; update `docs/active-context.md` once and link outward.

## Closing an Iteration

1. Move detailed completed rationale to `docs/archive/`.
2. Update `docs/archive/README.md`.
3. Trim `docs/active-context.md` to only the state that should be default context.
4. Update `docs/next-session-prompt.md` to the new active focus.
5. Leave `AGENTS.md` unchanged unless a stable rule, command, or architecture invariant changed.

## Archive Naming

Use:

```text
docs/archive/YYYY-MM-short-topic-kind.md
```

Kinds:

- `seed` — archived idea or roadmap that may be reactivated.
- `iteration` — completed implementation phase.
- `decision` — focused rationale for a route, schema, or contract choice.
- `postmortem` — lessons from a failed or reverted direction.

Each archive should start with:

```md
# Archived <Kind>: <Topic>

Status: <archived seed | completed | superseded | retained reference>

Default-context policy: Do not read by default. Read when <specific trigger>.
```

## Default Context Budget

Keep these approximate limits:

- `AGENTS.md`: stable rules only, usually under 120 lines.
- `docs/active-context.md`: current state only, usually under 100 lines.
- `docs/next-session-prompt.md`: restart prompt only, usually under 60 lines.

If a doc starts accumulating history, move that history to an archive or a focused task doc.

## Verification

After documentation-only edits, run at least:

```bash
npm run validate
```

After docs that affect website contract, routes, generated manifest, or rendered UI guidance, run:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```
