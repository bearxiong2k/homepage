# Archived Roadmap: Cluster Analysis and Working Groups

Status: archived, inactive.

This roadmap is intentionally not part of the current development context. Re-open it only if the project direction returns to research-cluster visualization after the personal website integration work stabilizes.

## Archived Goal

Build a cluster-analysis and visualization layer for the CIM corpus. The page would explain why papers sit near each other, what stack object or workflow binds them, and which families of work form recognizable lines of research.

## Possible Shape

- Add a new cluster-focused static page, likely `/clusters/`, rather than overloading the current atlas.
- Derive clusters from existing descriptive metadata first: Axis A/B, normalized Axis C/D, technology, workloads, artifacts, baselines, notes, and source links.
- Provide cluster cards or panels that name the binding theme, list representative papers, show shared first-class objects/rewrite objects, and link back into scoped atlas views.
- Add a vague academic working-group layer where evidence supports it: repeated author groups, lab/project names, repository owners, or visible publication families.
- Describe broad working groups that produced clusters of works and occasional cross-group cooperation.

## Guardrails

- Do not build a detailed affiliation map, author connection graph, or fine-grained collaboration network.
- Keep group labels coarse, tentative where needed, and evidence-based.
- Keep the implementation static and inspectable.
- Prefer hand-authored or lightly derived cluster metadata over opaque automatic clustering until the desired view is clearer.
- Do not introduce coverage, quality, ranking, or relevance scores.

## Reinitialization Checklist

When this roadmap is reactivated:

1. Decide whether cluster metadata belongs in `src/data/clusters.json`, paper frontmatter, or derived helpers.
2. Decide whether working groups are manually curated labels, inferred cautiously from `authors_or_group`, or optional cluster annotations.
3. Prototype one or two high-confidence clusters before generalizing the visualization.
4. Keep cluster claims descriptive and evidence-based; mark uncertain groupings as tentative.
