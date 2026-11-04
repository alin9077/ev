# Roadmark checkpoint setup

## Current tracked status — source85, 11 October2026

ENGINEERING CHECKPOINT 85. A narrow price-animation fix prevents continuously changing battery widths from accumulating in the permanent geometry cache, using the exact original softened-box geometry and two stable renderer slots. Across 120 distinct charging samples, the old cache retained 240 extra meshes / 1,232,640 typed-array bytes; the candidate retained none. All 36 populated-spec scene snapshots and seven paired paused fallback canvas images match source84. All 660 Node tests, types, lint, validation, the 389-page build and emitted-artifact proof passed. Catalogue data and rankings remain unchanged: 343 details, 149 families, 153 generations, 330 summaries, 2,196 sources, 240 market records and 393 named entries. The original Model Y hero and nine selling points, HTML shell, CSS and protected artwork are unchanged. Sustained own-VM Chromium stability remains unresolved: native error 9 occurred on the unchanged source84 home, the standalone candidate animation, and a plain no-Roadmark control page. This shows the current browser environment cannot establish sustained application stability. This is not a proven crash fix or speedup. Live WebGL, real phones, complete journeys and production release remain unapproved.

- Full evidence: qa/checkpoint85-checkpoint85-portable-proof.json and qa/checkpoint85-browser-observations.json
- Saved before this packaging:source84 / preview35 / index71. New receipts pending

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
