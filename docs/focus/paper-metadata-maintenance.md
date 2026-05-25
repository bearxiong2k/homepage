# Focus: Paper Metadata Maintenance

Status: paused / retrievable

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
- Confirmed and updated publisher DOI links for `arctic.md`, `c4cam.md`, `cimflow.md`, `neurosim.md`, `pimeval.md`, `puma.md`, and `sparsep.md`.
- Removed the misleading inherited PIMCOMP arXiv paper link from `pimacc.md`; that entry currently has no standalone public paper link recorded.

Continue by checking these entries whose `links.paper` remains arXiv, an author-hosted PDF, or blank:

`accelcim.md`, `ares.md`, `cim-mxu.md`, `cim-tuner.md`, `ciminus.md`, `cimloop.md`, `cinm.md`, `cmswitch.md`, `comonm.md`, `count2multiply.md`, `dappa.md`, `declarative-memory-services.md`, `dypim.md`, `efficient-in-memory-acceleration-of-sparse-block-diagonal-llms.md`, `geniex.md`, `gibbon.md`, `harmoni.md`, `hastily.md`, `hermes.md`, `hybrid-pim-for-attention-free-llm.md`, `learncnm2predict.md`, `miredo.md`, `nax.md`, `ns-cache.md`, `openacmv2.md`, `ouroboros.md`, `papi.md`, `pim-eda.md`, `pim-hls.md`, `pim-opt.md`, `pim-tc.md`, `pimacc.md`, `pimcomp.md`, `pimsim-nn.md`, `pimsyn-nn.md`, `pimsynth.md`, `prim.md`, `sega-dcim.md`, `simplepim.md`, `syndcim.md`, `turbo-charged-mapper.md`.

Known checks from this batch:

- `cimflow.md`: official title is `CIMFlow: An Integrated Framework for Systematic Design and Evaluation of Digital CIM Architectures`, DAC 2025, DOI `10.1109/DAC63849.2025.11133270`.
- `neurosim.md`: frontmatter is now anchored to `DNN+NeuroSim V2.0: An End-to-End Benchmarking Framework for Compute-in-Memory Accelerators for On-Chip Training`, IEEE TCAD, DOI `10.1109/TCAD.2020.3043731`; the note body still intentionally discusses the broader NeuroSim family.
- `pimeval.md`: official paper title is `Architectural Modeling and Benchmarking for Digital DRAM PIM`, IISWC 2024, DOI `10.1109/IISWC63097.2024.00030`.
- `pimacc.md`: no standalone public PIMACC paper was found in the checked sources; keep `links.paper` blank unless a primary source is found.

## Guardrails

- Do not weaken `src/content.config.ts`.
- Do not rewrite note prose unless the publication metadata affects a concrete statement.
- Do not replace a valid official artifact link with an aggregator.
- Run `npm run validate` after metadata edits; run the full website loop if route summaries or generated manifests change.
