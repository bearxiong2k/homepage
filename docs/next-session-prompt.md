# Next Session Prompt

Use this prompt to start the next Codex session.

```text
We are in /Users/xiongzijian/coding/CIM-library.

Read AGENTS.md and docs/active-context.md first. Then use docs/README.md to choose task-specific context. Do not bulk-read archives, legacy docs, website-integration docs, or paper-note harnesses unless the task needs them.

Project status:
- Static Astro CIM compiler/IR paper library.
- 62 schema-valid paper entries.
- Stable routes: /, /projects/, /projects/cim-library/, /projects/cim-library/methodology/, /library/, /clusters/, /papers/, /papers/[slug]/.
- src/data/clusters.json is the hand-authored cluster/working-group source and stays separate from paper frontmatter.
- /clusters/ is a completed cluster and working-group route with a visible AI-assisted synthesis notice.

Active focus:
- Paper metadata maintenance.
- Focus doc: docs/focus/paper-metadata-maintenance.md.
- Current goal: continue broadening source-backed citation metadata coverage. Collect or verify full BibTeX from reliable citation sources first, record `citation_source`, then derive clean display metadata from BibTeX with `npm run sync:citation-metadata`.
- Current implementation: /papers/ lists notes and supports selected-note Markdown and BibTeX export; /papers/[slug]/ renders clean structured metadata, source links, axis placement, normalized Axis C/D labels, note outline, and the Markdown note body.
- Current metadata model: paper frontmatter uses `year`, structured `publication`, `authors` / optional `author_note`, and `bibtex`; source-backed BibTeX records also use `citation_source`, and display metadata is synced from BibTeX with `npm run sync:citation-metadata`. Do not reintroduce top-level `venue` or `authors_or_group`.
- Current metadata subtask: name normalization added `short_title` to all papers; publisher-link normalization has covered the DOI/proceedings/artifact-source backlog; all 62 entries now have source-backed `citation_source` records.
- Recent DBLP-backed additions: `arctic.md`, `cim-mxu.md`, `cmswitch.md`, `papi.md`, `pimsyn-nn.md`, `pimsim-nn.md`, `sega-dcim.md`, `simplepim.md`, `sparsep.md`, `pim-tc.md`, `prim.md`, and `pimcomp.md`. `pimcomp.md` now follows the formal 2025 TCAD record rather than the earlier arXiv-first year.
- Latest DBLP-backed additions: `gibbon.md`, `nax.md`, `cinm.md`, `count2multiply.md`, `hermes.md`, `hybrid-pim-for-attention-free-llm.md`, `syndcim.md`, `ciminus.md`, and `pimsynth.md`. Important corrections: `gibbon.md` now follows the 2023 TCAD article and corrected author list; `cinm.md` is ASPLOS (4) 2024; `ciminus.md` is IEEE TC 75(1), 2026.
- Recent decisions: `harmoni.md` is anchored to the HARMONI repository PDF rather than the broader Sangam arXiv record, `learncnm2predict.md` is anchored to the official CFAED/SAMOS publication page, and `pim-eda.md` is treated as a repository-centered suite with `@misc` BibTeX rather than a fake standalone paper.
- Next priority: audit citation freshness and source quality as maintenance. Replace artifact-only or forthcoming records with formal publisher/DBLP BibTeX when those records become available.

Paused focus:
- General style controller.
- Focus doc: docs/focus/style-controller.md.
- Resume by inventorying and replacing remaining repeated hard-coded presentation values only where their semantic role is clear.

Completed focus:
- Cluster analysis and working-group content.
- Focus doc: docs/focus/cluster-analysis-working-groups.md.
- Final shape at completion: 7 cluster hypotheses, 13 working-group investigation articles, 7 checked cluster analysis paragraphs.

Method:
- Keep the implementation static and inspectable.
- Keep academic/library routes quiet, readable, and dense enough for repeated research use.
- Do not add backend services, client-side styling dependencies, databases, PDF hosting, or route-breaking changes.
- Keep /library/ and /papers/[slug]/ stable.
- Do not add ranking, quality, coverage, or IR-relevance scores.
- Keep paper claims tied to primary paper/artifact evidence where possible.

For paper metadata maintenance:
1. Read docs/focus/paper-metadata-maintenance.md.
2. Verify citation data from reliable sources before editing frontmatter.
3. Add or correct full standard BibTeX and `citation_source`.
4. Run `npm run sync:citation-metadata` so clean display fields derive from BibTeX.
5. Run verification.

After substantial edits, run:
npm run qa
npm run validate
npm run export:atlas
npm run contract:website
npm run check
npm run build

Report changed files, context decisions, evidence limits, and verification results.
```
