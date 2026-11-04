# Roadmark checkpoint setup

## Current tracked status — source87, 11 October 2026

ENGINEERING CHECKPOINT 87. Invocation-local catalogue reuse changes only pairLinks and the llms handler. The default pairLinks invocation evaluates the full catalogue once instead of nine times; one llms handler invocation evaluates it once instead of ten times and passes the same validated array to pairLinks. There is no persistent cache or validation-guard bypass. These are deterministic evaluation-count reductions, not a measured speedup or a crash fix; force-static transport semantics are unchanged. All 670 Node tests (669 non-HTTP plus one local HTTP), types, lint, validation, the 389-page build and emitted-artifact proof passed. Six new compiled old/current regressions use two exact source86 TypeScript text fixtures. All source86 data and historical tests are preserved. The entire portable HTML, its JavaScript and payload, all seven ranking groups, and 20 static transport bodies (llms, sitemap and 18 comparison Markdown/JSON bodies) are byte-identical to source86. Original Model Y hero, all nine selling points and 18 protected visual inputs are unchanged. No market, design, hero, animation or admission change is made. Counts remain 343 details, 149 families, 153 generations, 330 summaries, 2,196 sources, 240 market records and 393 named entries. Scoped browser evidence is recorded separately for the exact artifact hash. Sustained Roadmark browser stability remains unresolved; prior native error 9 results remain evidence. Live WebGL, real phones, complete journeys, full market closure and production release remain unapproved.

- Full evidence: qa/checkpoint87-checkpoint87-portable-proof.json and qa/checkpoint87-browser-observations.json
- Confirmed before packaging: source86 / preview37 / index73. Source87 / preview38 / index74 receipts are pending

## Implemented capabilities
- Discovery by exact-trim strength or buyer attribute, fair measurement groups, ties and dated source checks.
- Arbitrary researched-vehicle comparison, shareable selection, progressive catalogue rendering and mobile selection tray.
- 343 configuration records across 149 model families, including passenger vehicles, HiLux BEV and LDV, Farizon, Mercedes-Benz, Renault and Peugeot van configurations. Unknown equipment, model years and towing are explicit.
- Wider audit covers 240 model records across passenger, van, ute, truck, bus and motorcycle/scooter classes with source-qualified road-use claims. Includes uncertain, withdrawn and future-delivery records; this is not 240 currently available vehicles. Full market closure and specialist coverage remain open.
- Exact fact/equipment/availability reports, durable local inbox, read-only review screen, visible approved-correction history and shared claim propagation. Explicit offer deadlines expire separately from evidence freshness.
- Original Model Y hero and its nine main selling points remain at the top, above discovery.

## Release gates still open
Sustained own-VM Chromium stability (native error 9 remains unresolved), full market closure and exact-trim evidence, completion of changed-screen visual review, actual iPhone/Safari and Android/Chrome journeys, expanded-catalogue mobile performance, and a production reporting service. No public deployment is included or approved by this checkpoint.

See `ROADMARK_GOAL.md`, `REVIEW_WORKFLOW.md`, `MARKET_AUDIT_EXPANDED_2026-10-10.md` and `../qa/ROADMARK_PROGRESS_2026-10-10.md` for details.

Packaging: source and complete portable preview are separate matching archives. The source archive omits generated root/public preview copies; all application code, data and original visual-baseline assets remain. The preview archive contains the complete root index.html and a small index-b.html launcher. Merge both roadmark folders for restoration and verify their shared pairId/data hashes. Run pnpm build:portable to regenerate all generated copies.
