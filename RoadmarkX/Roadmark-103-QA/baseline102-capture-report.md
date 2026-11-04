# Checkpoint 102 visual baseline capture

Captured 13 October 2026 (conversation clock) in dot's own cloud Chromium. The desktop terminal/server clock showed 14 October 2026. No user computer, published site, source-data record, application source, or security policy was changed.

## Verified captures

The browser reported an ordinary desktop CSS viewport of **1180 × 757**. Its screenshot API excluded scrollbars and returned viewport image files of **1165 × 747**. These are neither 1280px captures nor phone/device-emulation captures.

| Route | Viewport screenshot | Full-page screenshot | Full image dimensions |
|---|---|---|---|
| `/discover` | `baseline102-discover-current.jpg` | `baseline102-discover-1180-full.jpg` | 1165 × 5284 |
| `/cars` | `baseline102-cars-1180-viewport.jpg` | `baseline102-cars-1180-full.jpg` | 1165 × 4896 |
| `/cars/tesla-model-y/premium-long-range-awd-1` | `baseline102-model-y-detail-1180-viewport.jpg` | `baseline102-model-y-detail-1180-full.jpg` | 1165 × 22119 |

Discovery visibly displayed its original heading and vehicle/attribute entrances. Catalogue DOM reported 12 of 329 matching variants under its default current-manufacturer-listing filter, from 150 families; the exact detail URL was read from a catalogue link. The detail visibly displayed Model Y Premium Long Range AWD, its version description and key-facts section. Each saved image was decoded to verify image dimensions and file integrity.

## Failures and limits

- The baseline homepage initially rendered its protected Model Y hero, then the fresh tab failed with native Chromium **Error code: 9**. An older failed localhost tab showed the same code. This reproduces a baseline browser failure, not an M0 regression. Evidence: `baseline102-native-error9.png` (1188 × 848). No claim is made about its cause.
- Chromium explicitly refused DevTools with **“DevTools not allowed on this page. Your organization has blocked the use of DevTools on this page.”** No retry or policy bypass was attempted.
- A separate authored responsive-CSS iframe fixture could load, but Roadmark's unchanged `next.config.ts` CSP has **`frame-ancestors 'none'`**, so `/discover` and `/cars` could not render inside it. Both route requests returned HTTP 200. Evidence of failed fixture: `baseline102-discover-375-frame-failure.jpg`. This is failure evidence, not a mobile screenshot. The fixture was abandoned without weakening CSP.
- Therefore the requested **375px and 1280px baselines are not available**. These desktop captures must not be represented as them.
- Initial page navigation sometimes exceeded the browser tool's approximately ten-second protocol timeout while Next compiled; waiting for terminal-reported HTTP 200 and observing the loaded page succeeded for discovery, catalogue and detail.
- The baseline server logged a missing React child-key warning from `FleetExperience` on homepage and `/api/reporting` 404 on the exact detail page. They were not investigated or changed within this capture task.

## Reproducible local setup

The baseline ran from the pristine checkpoint-102 source using `next dev --webpack --hostname 127.0.0.1 --port 3102` in dot's cloud desktop terminal, with Node at `/opt/codex/runtimes/codex-primary-runtime/dependencies/node/bin/node`. The exec-shell server was stopped first because it had owned `.next/dev` while its network namespace was inaccessible to cloud Chromium. The working M0 source directory was not edited. Next generated `.next` state only. The separate fixture used Python's localhost-only HTTP server on port 3104.

Both servers were stopped after capture. Launcher scripts remain outside the application source, at `../baseline.sh` and `../qa-server.sh`; the abandoned fixture is `baseline-harness.html` beside this report.
