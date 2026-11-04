# M0 candidate visual QA

## Result

The M0 candidate renders discovery, the catalogue, and the same Model Y Premium Long Range AWD detail page successfully in dot's cloud Chromium. The production-code freeze was confirmed at 21:47:35 UTC on 13 October 2026. Settled screenshots were refreshed after that freeze. No native browser crash occurred on these three candidate routes; the homepage was not retried after its checkpoint-102 Error 9 reproduction.

**Scope:** ordinary desktop CSS viewport 1180 × 757. Top viewport screenshot files are 1165 × 747 after the browser screenshot API excludes scrollbars. Some scrolled screenshots include a 1180 × 757 viewport. The files were decoded to verify their actual dimensions. No 375px phone or 1280px claim is made. No browser clock was changed; this is current-clock visual and interaction QA, not a future-clock browser test.

## Before and after

The paired top screenshots and full-page captures are alongside this report. `compare-baseline-candidate.html` arranges the three paired top captures side by side using those local image files.

- Discovery: original hero/entrances, typography, colours and column arrangement remain visually consistent. Current records retain their written strengths and trade-offs; the updated availability checked-date text is visible on cards. The settled discovery top screenshot has only the ordinary Next development N icon, not a Rendering badge.
- Catalogue: title, filters, default count, three-column cards, compare tray and data remain present. Cards now visibly label price and range dates as “Checked on …”. Long price basis text wraps without visible overlap in the captured region.
- Detail: Model Y Premium Long Range AWD heading, seating illustration, introductory copy, actions, key facts and source dates remain visible and aligned. Its top viewport and full-page height are consistent with the baseline at this width. Current-fresh facts do not show an amber ageing warning.

## Useful after-capture files

- `candidate103-discover-changed-region.jpg`: first three discovery cards with checked dates and written strengths/trade-offs
- `candidate103-cars-changed-region.jpg`: first three catalogue cards with price and range checked dates
- `candidate103-detail-key-facts-region.jpg`: exact-version listed price and per-source dates
- `candidate103-price-ranking-1180.jpg`: price freshness explanation and populated first rows
- `candidate103-range-ranking-1180.jpg`: populated range ranking region

The matching top/full-page files use `candidate103-discover-1180-*`, `candidate103-cars-1180-*`, and `candidate103-model-y-detail-1180-*` names. Checkpoint-102 counterparts use `baseline102-*`.

## Interaction checks

After code freeze and initial hydration:

1. Selected the attribute entrance. “Go further” stayed selected across separate observations, with populated ranking groups, per-row checked dates and availability dates. The explanation says these figures remain fresh for 180 days. One WLTP-combined passenger group had 47 comparable trims and Kia EV3 Air 2WD Long Range at 604 km first.
2. Selected “Spend less”. It stayed selected across separate observations, with populated grouped prices and a 45-day freshness explanation. One before-on-road-cost passenger group had 15 comparable trims and Toyota bZ4X 2WD at A$55,990 first.
3. Switched back to range successfully.

Earlier mode resets overlapped active source edits/HMR and did not recur in the settled post-freeze check. They are **not classified as a confirmed product defect**. The very first click immediately after one navigation occurred before hydration settled and did not change the mode; the subsequent settled interaction worked.

## Limitations and observed warnings

- Requested 375px/1280px captures remain unavailable in this browser setup. Chromium explicitly blocks DevTools; Roadmark's existing frame-ancestors CSP blocks iframe test fixtures. No policy was weakened, and no further workaround was attempted.
- One hydration warning specifically listed browser-injected `data-oai-browser-agent-cursor-*` attributes on the root HTML element. It is recorded as an automation-environment warning, not evidence of an application-data mismatch. Transient development overlays can therefore be present in ancillary ranking images.
- The existing `/api/reporting` HTTP 404 occurred on the detail route, as it did in the baseline.
- The original homepage Error 9 remains baseline evidence; no claim is made that M0 fixes it.
- No mobile real-device, accessibility, future-clock UI, production-build or public-site testing is implied by this report.

## Cleanup

The candidate was served in dot's cloud desktop terminal from the M0 working source with `next dev --webpack --hostname 127.0.0.1 --port 3103`. The server was stopped and the terminal returned to its shell prompt after capture. No application source, data, security setting or public deployment was changed by this QA worker.
