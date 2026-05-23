# Personal Website Route Map

## Stable public routes

| Route | Purpose | Notes |
| --- | --- | --- |
| `/` | Personal homepage | Merged profile/about page: research focus, education, selected publications, contact, and route to projects. |
| `/projects/` | Project index | Generated from `src/data/project-registry.json`. |
| `/projects/cim-library/` | CIM Library landing page | Narrative project page; link to `/library/` and representative papers. |
| `/library/` | Full CIM atlas | Keep this route stable for bookmarks and citations. |
| `/papers/[slug]/` | Paper notes | Keep routes slug-based and static. |

## Optional routes later

| Route | Purpose |
| --- | --- |
| `/writing/` | Essays, research notes, or project logs. |
| `/projects/<future-id>/` | Landing page for another project. |
| `/tags/<tag>/` | Cross-project tag index once there is enough material. |

## Navigation rules

- Global navigation should be small: Home, Projects, CIM Library.
- Treat the route hierarchy as the index. Do not add an explicit graph/index widget on the homepage while the site has only one active project.
- Project-local navigation can be richer: Atlas, Taxonomy, Papers, Sources, Changelog.
- Do not make every atlas filter a top-level website navigation item.
- Keep the atlas route independent enough that it can be linked directly from papers, README files, and CV/project pages.
