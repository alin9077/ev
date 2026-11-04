> ENGINEERING CHECKPOINT 74. Market-audit Clear filters now resets search, order evidence, vehicle type and pagination together. The full market inventory is transported through the existing lossless portable codec instead of compiled into JavaScript. All previous 342 configuration packs, 329 summaries, 2196 sources and the complete 29-key inventory are preserved. Raw HTML is 414292 bytes smaller; inline JavaScript is 1193948 bytes smaller. These are artifact-size measurements, not phone-speed results. All 544 non-HTTP tests, 23 focused checks, types/lint/validation, 388-page build and actual emitted-data verification passed. Original Model Y hero, nine selling points, all protected assets, HTML shell and CSS remain unchanged. Browser/live HTTP/real-phone release verification remains pending.

# Roadmark working checkpoint — 10 October 2026

This is an in-progress development checkpoint, not a finished or published release.

## Open the portable experience
Download the matching `Roadmark-portable-preview.zip`, unzip it and open `roadmark/index.html` in a desktop browser. The source checkpoint and preview share a pair identifier in their manifests; merge their `roadmark` folders for a full restoration. It contains the bundled experience and research. It does not need an account or a network connection for its local screens. External evidence links require the internet. On a file URL, reporting is draft-only when browser storage is permitted.

## Run the development app
Use Node22+ and the project's pinned pnpm version. Install with `pnpm install --frozen-lockfile`, then `pnpm dev`. Build with `pnpm build`. Run `pnpm test`, `pnpm typecheck`, `pnpm lint` and `pnpm validate` before release.

## Try durable local claim reports
Run `pnpm build:portable` then `pnpm preview:review`. Open `http://127.0.0.1:3013/index.html`.
The read-only local editorial inbox is `http://127.0.0.1:3013/index.html?page=/review`.
Reports are stored in `.roadmark/review-queue` on the machine running this service. Nothing is sent to a public service or approved automatically. Browser-saved drafts are a separate queue. The archive excludes local test reports and runtime binaries.

## What changed
- Discovery by exact-trim strength or buyer attribute, fair measurement groups, ties and dated source checks.
- Arbitrary researched-vehicle comparison, shareable selection, progressive catalogue rendering and mobile selection tray.
- 325 configuration records across 139 model families, including passenger vehicles, HiLux BEV and LDV, Farizon, Mercedes-Benz, Renault and Peugeot van configurations. Unknown equipment, model years and towing are explicit.
- Wider audit covers 231 model records across passenger, van, ute, truck, bus and motorcycle/scooter classes with source-qualified road-use claims. Includes uncertain, withdrawn and future-delivery records; this is not 231 currently available vehicles. Full market closure and specialist coverage remain open.
- Exact fact/equipment/availability reports, durable local inbox, read-only review screen, visible approved-correction history and shared claim propagation. Explicit offer deadlines expire separately from evidence freshness.
- Original Model Y hero and its nine main selling points remain at the top, above discovery.

## Release gates still open
Full market closure and exact-trim evidence, completion of changed-screen visual review, actual iPhone/Safari and Android/Chrome journeys, expanded-catalogue mobile performance, and a production reporting service. No public deployment is included or approved by this checkpoint.

See `ROADMARK_GOAL.md`, `REVIEW_WORKFLOW.md`, `MARKET_AUDIT_EXPANDED_2026-10-10.md` and `../qa/ROADMARK_PROGRESS_2026-10-10.md` for details.

Packaging: source and complete portable preview are separate matching archives. The source archive omits generated root/public preview copies; all application code, data and original visual-baseline assets remain. The preview archive contains the complete root index.html and a small index-b.html launcher. Merge both roadmark folders for restoration and verify their shared pairId/data hashes. Run pnpm build:portable to regenerate all generated copies.
