# Content and UI Harness

This harness defines what a safe development session should check.

## Automated checks

Run these after changes:

```bash
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build
```

Use this before dependencies are installed:

```bash
npm run smoke:website -- --fast
```

## Content checks

For paper metadata or corpus-note changes:

- The filename should match `slug`.
- `axis_A.primary` and `axis_A.secondary` must use known Axis A codes.
- `axis_B` must contain at least one known Axis B code.
- External links must be evidence-based.
- `artifact.status`, `artifact.url`, `artifact.license`, and `reproducibility_level` must not be guessed.
- Keep uncertain facts as `Unknown / not found in the checked sources` or equivalent.
- Do not add generated-note scaffolding sections to rendered notes.

## Website integration checks

For homepage, project index, and project landing pages:

- Project cards should read from `src/data/project-registry.json`, not duplicate hard-coded project facts across pages.
- CIM atlas stats should come from `public/cim-library.manifest.json` or a single build-time helper, not copied by hand.
- The `/library/` link should remain prominent.
- `/papers/[slug]/` links should remain stable.
- The homepage should summarize the atlas; it should not try to embed the whole atlas UI.

## UI viewport checklist

Check these widths after layout changes:

- 1440 px desktop.
- 1024 px laptop/tablet.
- 768 px tablet.
- 390 px mobile.

For each width:

- Global navigation wraps or collapses cleanly.
- Project cards remain readable.
- Atlas controls do not overlap.
- Long paper titles do not break layout.
- Tables and code blocks scroll or wrap intentionally.
- Focus states are visible for links and controls.

## Accessibility checks

- Every interactive control has a visible label or accessible text.
- Link text explains the destination.
- Do not rely on color alone for selected/filter states.
- Maintain semantic heading order.
- Keep reduced-motion users in mind when adding animations.

## Done definition

A session is done when:

1. The smallest meaningful user-facing increment is implemented.
2. Automated checks have been run or explicitly skipped with a reason.
3. The session report lists changed files and remaining risks.
