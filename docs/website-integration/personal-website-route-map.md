# Personal Website Route Map

## Stable public routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Personal homepage | Should introduce you, your research interests, and featured projects. |
| `/projects/` | Project index | Generated from `src/data/project-registry.json`. |
| `/projects/cim-library/` | CIM Library landing page | Narrative project page; link to `/library/` and representative papers. |
| `/library/` | Full CIM atlas | Keep this route stable for bookmarks and citations. |
| `/papers/[slug]/` | Paper notes | Keep routes slug-based and static. |

## Optional routes later

| Route | Purpose |
| --- | --- |
| `/about/` | Bio, research direction, contact, CV links. |
| `/writing/` | Essays, research notes, or project logs. |
| `/projects/<future-id>/` | Landing page for another project. |
| `/tags/<tag>/` | Cross-project tag index once there is enough material. |

## Navigation rules

- Global navigation should be small: Home, Projects, CIM Library, About.
- Project-local navigation can be richer: Atlas, Taxonomy, Papers, Sources, Changelog.
- Do not make every atlas filter a top-level website navigation item.
- Keep the atlas route independent enough that it can be linked directly from papers, README files, and CV/project pages.
