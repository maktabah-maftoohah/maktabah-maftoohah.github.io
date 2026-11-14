# Project Invariants: Maktabah Maftoohah Master Portal (`maktabah-maftoohah.github.io`)

> Central landing portal and interactive catalogue for the Maktabah Maftoohah organization. Governed by rules in `maktabah-orchestrator`.

## Core Architectural Invariants
1. **GitHub Pages Root Compatibility**:
   - As the organization root site (`https://maktabah-maftoohah.github.io/`), all asset imports and data fetches must use relative paths (`./css/...`, `./js/...`, `./data/...`).
   - Links to member repositories must link relatively (`./al-quran/`, `./sahih-al-bukhari/`) or via absolute canonical URLs (`https://maktabah-maftoohah.github.io/<repo>/`).
   - GitHub Pages Exclusivity: Web pages must never link to GitHub project repositories (github.com/...); all navigation must link exclusively to GitHub Pages.

2. **Encoding & File Standards**:
   - Strict UTF-8 without BOM encoding on all text files (HTML, JS, CSS, JSON, MD, PY).
   - Python operations must specify `encoding="utf-8"` and `ensure_ascii=False`.

3. **Zero-Build Vanilla ES6 Architecture**:
   - Runs natively in all modern evergreen browsers without node compilation, webpack, vite, or bundlers.
   - Entry point: `<script type="module" src="./js/app.js"></script>`.

4. **Sacred Text Integrity**:
   - Zero synthetic or hallucinated Islamic texts.
   - All citations, titles, authors, and primary edition references must strictly match verified scholarship.

5. **Dual-Language Standard**:
   - Primary default language: **Bahasa Melayu** (standard Malaysian Islamic nomenclature), toggleable to **English**.
