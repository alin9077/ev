# Citable-pages launch verification — 8 October 2026

## Shipped scope

- Nine static Model Y versus rival pages, including the existing Sealion 7 address.
- Thirty-four existing variant pages with sourced key facts, buyer questions and copy text.
- Five glossary anchors, all linking to relevant comparison rows.
- Markdown and JSON per pair, `/llms.txt`, Car/WebPage/FAQPage structured data, canonical URLs and a dated sitemap.
- Copy button on pair pages, variant pages and the currently displayed interactive pair, with a selectable fallback.
- Public HTTPS build configuration; local builds keep noindex. Static hosting uses real 404 handling.

## Evidence and tests

- Structural validation: 34 variants, 10 families, 11 generations, 69 criteria, 2,346 source-linked feature rows and 424 source records. Original JSON SHA-256 remains `010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657`.
- Unit tests: 37 passed, including comparison identity, source-date preservation, export/schema parity, selected-trim copy and audit holds.
- TypeScript and lint passed; static production build succeeded for 77 generated outputs.
- Chromium browser checks: 15 passed. Covers all nine pairs and 34 variants with JavaScript disabled, dated HTML/source links, JSON and Markdown parity, copy success and denied-clipboard fallback, glossary links, discovery files and unknown-page 404. Existing journeys cover trim selection, history/refresh, software selection, footnotes, keyboard focus, print, mobile reflow from 320 to 1440 px, and no external media requests.
- Pair HTML: approximately 202–239 KB uncompressed; Markdown/copy: 22–28 KB. The all-fleet interactive homepage remains about 4.45 MB and now directs readers/crawlers to focused pages.
- Manual visual review: desktop and 320 px pair-page screenshots. Browser testing found mobile navigation overflow; wrapping the navigation fixed it.
- Content audit: zero unexplained open cells; 170 explicit source-audit holds. This is an honest completeness check, not a claim that all figures are verified.

## Source audit and remaining editorial work

All 32 buyer sources previously read only as search summaries were attempted. Full text was retrieved for 22; 10 remained inaccessible. The full audit is in `data/source-audit-2026-10-08.json` and rendered at `/sources#source-audit`. Full-text access uncovered unsupported claims, recorded in `docs/CORRECTION_LOG.md` and corrected or withheld in the display adapter. The original research is preserved.

Retrieve or replace the ten unavailable articles, replace held licensed driveaway/weight inputs with maker data or permission, provide a correction inbox, and choose a custom domain later. No claim is made that assistants have indexed or cited the site. Use `qa/ai-citation-checks.csv` for the twenty-question monthly manual check.
