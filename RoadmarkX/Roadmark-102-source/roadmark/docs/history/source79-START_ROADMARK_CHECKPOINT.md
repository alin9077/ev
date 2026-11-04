# Roadmark checkpoint setup

## Current tracked status — source79, 11 October 2026

ENGINEERING CHECKPOINT 79. Catalogue initially renders 12 cards with whole-catalogue search and accessible progressive reveal; filter and history changes reset the batch while comparison selection is retained. Catalogue titles and seating diagrams wrap whenever card space is limited. All 587 unique Node tests passed in final serial verification; typecheck, lint, validation, 388-page production build and emitted-artifact parity passed. Earlier candidate test/build workers were killed; retained attempt logs distinguish them from the successful final checks. Facts, all seven rankings, original Model Y hero and nine selling points are unchanged. This reduces initial card rendering, not the embedded data payload; no loading-speed benchmark is claimed. Browser Find and print include currently revealed cards only. Real-phone and complete release verification remain open.

- 342 configurations, 148 families, 152 generations; 329 summaries and 2,196 sources
- Market audit: 239 records, including 68 families with qualified New advertisements; complete coverage remains open
- Browser details and limits: qa/checkpoint79-browser-observations.json
- Original Model Y hero remains above discovery. No deployment or external report submission
- Save state at packaging: source78 / preview29 / index65 confirmed. Source79 / preview30 / index66 await receipts

## Implemented capabilities
- Discovery by exact-trim strength or buyer attribute, fair measurement groups, ties and dated source checks.
- Arbitrary researched-vehicle comparison, shareable selection, progressive catalogue rendering and mobile selection tray.
- 342 configuration records across 148 model families, including passenger vehicles, HiLux BEV and LDV, Farizon, Mercedes-Benz, Renault and Peugeot van configurations. Unknown equipment, model years and towing are explicit.
- Wider audit covers 239 model records across passenger, van, ute, truck, bus and motorcycle/scooter classes with source-qualified road-use claims. Includes uncertain, withdrawn and future-delivery records; this is not 239 currently available vehicles. Full market closure and specialist coverage remain open.
- Exact fact/equipment/availability reports, durable local inbox, read-only review screen, visible approved-correction history and shared claim propagation. Explicit offer deadlines expire separately from evidence freshness.
- Original Model Y hero and its nine main selling points remain at the top, above discovery.

## Release gates still open
Full market closure and exact-trim evidence, completion of changed-screen visual review, actual iPhone/Safari and Android/Chrome journeys, expanded-catalogue mobile performance, and a production reporting service. No public deployment is included or approved by this checkpoint.

See `ROADMARK_GOAL.md`, `REVIEW_WORKFLOW.md`, `MARKET_AUDIT_EXPANDED_2026-10-10.md` and `../qa/ROADMARK_PROGRESS_2026-10-10.md` for details.

Packaging: source and complete portable preview are separate matching archives. The source archive omits generated root/public preview copies; all application code, data and original visual-baseline assets remain. The preview archive contains the complete root index.html and a small index-b.html launcher. Merge both roadmark folders for restoration and verify their shared pairId/data hashes. Run pnpm build:portable to regenerate all generated copies.
