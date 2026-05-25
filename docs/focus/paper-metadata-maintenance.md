# Focus: Paper Metadata Maintenance

Status: active / retrievable

Default-context policy: Do not read by default. Read when improving paper frontmatter, source links, publication venues, DOI links, or artifact provenance.

## Current Task Queue

- For papers whose recorded source is only arXiv, check whether a formal publication now exists.
- When found, update the paper entry with the formal venue, DOI or publisher page, and keep arXiv as supplementary source when useful.
- Prefer primary sources: publisher pages, conference proceedings, official DOI records, author pages, and official artifacts.
- Mark unresolved cases as `Unknown / not found in the checked sources` rather than guessing.

## 2026-05 Name / Link Normalization Batch

Completed in the current batch:

- Added `short_title` to all 62 paper entries.
- Made `title` the full display name and `short_title` the atlas/compact label.
- Replaced legacy top-level `venue` / `authors_or_group` frontmatter with structured `publication`, `authors`, optional `author_note`, and `bibtex`.
- Added selected-paper BibTeX export to `/papers/`; display metadata remains clean `year · publication` plus authors rather than full citation strings.
- Updated paper scaffolding, raw-note promotion, validation, and manifest export to use the structured metadata model.
- Corrected the metadata direction: `citation_source` marks records whose BibTeX came from a reliable citation source, and display fields are synced from that BibTeX rather than generating BibTeX from display metadata.
- Source-backed citation records started with `cimflow.md` from the official CIMFlow docs, `pimeval.md` from DBLP, and `neurosim.md` from IEEE CEDA/IEEE metadata.
- Continued source-backed BibTeX-first conversion for `ares.md`, `c4cam.md`, `cimloop.md`, `pim-hls.md`, `dypim.md`, `geniex.md`, `pim-opt.md`, and `puma.md`; there are now 11 entries with `citation_source`.
- Continued source-backed arXiv-first conversion for accepted/preprint records where publisher metadata is not yet available: `accelcim.md`, `cim-tuner.md`, `comonm.md`, `dappa.md`, `efficient-in-memory-acceleration-of-sparse-block-diagonal-llms.md`, `miredo.md`, `openacmv2.md`, `ouroboros.md`, and `turbo-charged-mapper.md`; there are now 20 entries with `citation_source`.
- Resolved the remaining semantic/source-decision cases: `harmoni.md` is anchored to the HARMONI repository PDF rather than the unrelated Sangam arXiv record, `learncnm2predict.md` is anchored to the official CFAED/SAMOS publication page, and `pim-eda.md` is anchored as a repository-centered suite entry. There are now 23 entries with `citation_source`.
- Fixed `scripts/sync-bibtex-display-metadata.mjs` so blank nested YAML scalars such as missing DOI values do not absorb following `url` lines during BibTeX-derived sync.
- Continued DBLP-backed formal-record conversion for `arctic.md`, `cim-mxu.md`, `cmswitch.md`, `papi.md`, `pimsyn-nn.md`, `pimsim-nn.md`, `sega-dcim.md`, `simplepim.md`, `sparsep.md`, `pim-tc.md`, `prim.md`, and `pimcomp.md`; there are now 35 entries with `citation_source`.
- Continued DBLP-backed formal-record conversion for `gibbon.md`, `nax.md`, `cinm.md`, `count2multiply.md`, `hermes.md`, `hybrid-pim-for-attention-free-llm.md`, `syndcim.md`, `ciminus.md`, and `pimsynth.md`; that checkpoint brought coverage to 44 entries with `citation_source`.
- Added BibTeX display cleanup for common DBLP LaTeX accent/bracing forms, including names such as `Gómez-Luna`.
- Completed source-backed citation coverage for all 62 entries. The final normalization batch added formal DBLP/publisher/DOI records for `adap-cim.md`, `autodcim.md`, `cim-mlc.md`, `clear.md`, `declarative-memory-services.md`, `exploiting-the-memory-compute-coupling-feature-for-cim-accelerator-design-optimization.md`, `hastily.md`, `ns-cache.md`, `openc2.md`, `opencimtc.md`, `polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators.md`, `reconfigurable-dataflow-cim-accelerator-for-multi-scale-vision-transformer.md`, `rescim.md`, `sherlock.md`, and `unindp.md`; `cim-pruner.md` is anchored to the official ISCAS 2026 paper page; `cima-com.md` and `pimacc.md` are anchored as public software artifact records.
- Confirmed and updated publisher DOI/proceedings links for `arctic.md`, `ares.md`, `c4cam.md`, `cim-mxu.md`, `cimflow.md`, `ciminus.md`, `cimloop.md`, `cinm.md`, `cmswitch.md`, `count2multiply.md`, `declarative-memory-services.md`, `dypim.md`, `geniex.md`, `gibbon.md`, `hastily.md`, `hermes.md`, `hybrid-pim-for-attention-free-llm.md`, `nax.md`, `neurosim.md`, `ns-cache.md`, `papi.md`, `pim-hls.md`, `pim-opt.md`, `pim-tc.md`, `pimcomp.md`, `pimeval.md`, `pimsim-nn.md`, `pimsyn-nn.md`, `pimsynth.md`, `prim.md`, `puma.md`, `sega-dcim.md`, `simplepim.md`, `sparsep.md`, and `syndcim.md`.
- Removed the misleading inherited PIMCOMP arXiv paper link from `pimacc.md`; that entry currently has no standalone public paper link recorded.

All current paper entries now have `citation_source`. Future maintenance should audit citation freshness and source quality rather than continuing a missing-source backlog.

Known checks from this batch:

- `cimflow.md`: official title is `CIMFlow: An Integrated Framework for Systematic Design and Evaluation of Digital CIM Architectures`, DAC 2025, DOI `10.1109/DAC63849.2025.11133270`.
- `neurosim.md`: frontmatter is now anchored to `DNN+NeuroSim V2.0: An End-to-End Benchmarking Framework for Compute-in-Memory Accelerators for On-Chip Training`, IEEE TCAD, DOI `10.1109/TCAD.2020.3043731`; the note body still intentionally discusses the broader NeuroSim family.
- `pimeval.md`: official paper title is `Architectural Modeling and Benchmarking for Digital DRAM PIM`, IISWC 2024, DOI `10.1109/IISWC63097.2024.00030`.
- `pimacc.md`: no standalone public PIMACC paper was found in the checked sources; keep `links.paper` blank unless a primary source is found.
- `declarative-memory-services.md`: no DOI found; `links.paper` now points to the official CIDR 2026 proceedings page.
- `dappa.md`: found a PACT 2025 poster DOI, but did not replace the arXiv full-paper link because the publisher item is explicitly a poster record and not clearly the same full paper version.
- `learncnm2predict.md`: anchored to the official CFAED/SAMOS publication page and PDF; no DOI found in checked sources.
- `harmoni.md`: anchored to the HARMONI repository PDF after confirming the PDF header title/authors; the old arXiv link resolved to the broader Sangam paper and was removed from paper metadata.
- `pim-eda.md`: repository-centered suite entry, not a single paper. It now has a `@misc` repository BibTeX record and `citation_source` so exports are explicit without pretending there is a standalone PIM EDA paper.
- `pimcomp.md`: formal TCAD record is 2025 (`IEEE TCAD` 44(5): 1745-1759), so the display year now follows the DBLP/DOI-backed journal record instead of the earlier arXiv-first metadata.
- `gibbon.md`: formal DOI-backed record is the 2023 IEEE TCAD article by Hanbo Sun, Zhenhua Zhu, Chenyu Wang, Xuefei Ning, Guohao Dai, Huazhong Yang, and Yu Wang; the old frontmatter had a stale author list.
- `cinm.md`: formal ASPLOS record is ASPLOS (4) 2024, not ASPLOS 2025.
- `ciminus.md`: formal IEEE Transactions on Computers record is volume 75(1), 2026, even though DOI registration and preprint metadata were 2025.
- `polyhedral-based-compilation-framework-for-in-memory-neural-network-accelerators.md`: formal ACM JETC metadata is volume 18(1), 2022, article 15; the earlier 2021 display year was an online/seed-record artifact.
- `opencimtc.md`: now uses the Nature Communications author list and article metadata directly; `cima-com.md` remains a separate artifact-centered record and does not claim the Nature DOI as its own.

## Guardrails

- Do not weaken `src/content.config.ts`.
- Do not rewrite note prose unless the publication metadata affects a concrete statement.
- Do not replace a valid official artifact link with an aggregator.
- Keep metadata in the structured `year`, `publication`, `authors` / `author_note`, and `bibtex` model; do not reintroduce top-level `venue` or `authors_or_group`.
- For citation cleanup, collect or verify the full standard BibTeX first, record `citation_source`, then run `npm run sync:citation-metadata` to derive clean display fields.
- Run `npm run validate` after metadata edits; run the full website loop if route summaries or generated manifests change.
