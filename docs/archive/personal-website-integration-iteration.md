# Archived Iteration: Personal Website Integration

Status: largely done.

This iteration moved the CIM Library from a standalone atlas scaffold into a static personal website shell.

Completed:

- merged homepage/profile at `/`;
- project index at `/projects/`;
- CIM Library project landing page at `/projects/cim-library/`;
- stable full atlas route at `/library/`;
- stable paper note routes under `/papers/[slug]/`;
- project registry in `src/data/project-registry.json`;
- generated atlas manifest in `public/cim-library.manifest.json`;
- website contract and smoke checks;
- linked selected-publication support in `src/data/profile.json`;
- atlas layout polish and wider paper-note reading layout.

The retained `docs/website-integration/` files are now maintenance references for the static registry/manifest contract. The installer, templates, and session-report scaffold were removed after initialization.

Future website-shell work should be incremental and should not displace the next research direction: cluster analysis and coarse academic working-group investigation.
