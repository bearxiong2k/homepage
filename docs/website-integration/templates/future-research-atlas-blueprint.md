# Future Research Atlas Blueprint

Use this when starting another atlas-like project inside the personal website.

## Project identity

- Project id:
- Public title:
- One-sentence summary:
- Audience:
- Main route:
- Detail route pattern:
- Source repository:

## Content model

- Content root:
- Required metadata fields:
- Controlled vocabulary files:
- Validation script:
- Export manifest script:

## UI model

- Main browsing view:
- Detail view:
- Filters/facets:
- Provenance/source affordances:
- Mobile constraints:

## Integration files

Add:

```text
src/data/project-registry.json entry
public/<project-id>.manifest.json
scripts/export-<project-id>-manifest.mjs
docs/<project-id>/maintenance-notes.md
```

## Quality gates

- Validate content.
- Export manifest.
- Check website contract.
- Run Astro check/build.
- Do manual viewport checks.
