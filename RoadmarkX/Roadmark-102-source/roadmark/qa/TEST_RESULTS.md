# Verification results — 6 October 2026

## Implemented and tested

- Structural validation: PASS. 34 variants, 10 families, 11 generation records, 48 criteria, 1,632 evidence records, 283 sources and 15 publication issues. Original research hash unchanged.
- Domain unit tests: 16 passed. Includes measurement bases, unknowns, all variant counts, source relationships, Model Y L, EV3 six-plus-two, EVO, Zeekr Black, V2L, URL state, source URL sanitisation and media gating.
- TypeScript: PASS. ESLint: PASS, no warnings. Production build: PASS, including all 34 variant detail routes.
- Production browser suite: 29 passed. Chromium, WebKit and Firefox. Four deliberately skipped duplicates: print/PDF and screenshot-matrix tests run in Chromium only; the nine interaction journeys run in all three engines.
- Additional axe checks: no violations reported for homepage, cars, Model Y range, software, methodology, sources and Model Y L detail. Comparison and evidence dialog also passed the automated checks in all three engines. This is not a full WCAG certification.
- Viewport screenshots: 320, 375, 390, 430, 768, 1024 and 1440 px; no whole-page horizontal scrolling. Representative homepage, comparison, software-chapter and narrow-layout screenshots were visually inspected and corrected.
- 200%/400% equivalent layout viewports (640 × 400 and 320 × 256) and 844 × 390 landscape: no horizontal overflow; comparison header becomes static in short viewports. These are reflow simulations, not physical-device zoom certification.
- Clipboard denied: ordinary link plus selectable input displayed. Local storage denied: clear feedback with comparison intact. Shared links never import a saved local shortlist automatically.
- Three selections survive mobile layout, refresh and browser Back. Two different Model Ys work, exact duplicates are rejected, unknown IDs recover with a visible notice.
- Native dialogs support Escape, focus containment and focus return, including the WebKit regression fix.
- Print: generated `qa/comparison-print.pdf`, all selected identities and dated evidence references retained. No PDF service added.
- Restricted media: no third-party requests observed during the extended route checks. Empty approved media inventory resolves to original diagrams. Resolver rejects missing provenance, wrong placement and expiry. External video remains disabled.

## Production laboratory performance

Lighthouse 13.5.0, headless Chrome 153, local macOS server, mobile simulation, 4× CPU slowdown, 150 ms RTT / 1,638.4 Kbps simulated network. Final runs were serial after browser interaction testing.

| Page | Performance | LCP | Total blocking time | CLS | Initial transfer |
| --- | ---: | ---: | ---: | ---: | ---: |
| Homepage | 99 | 1.95 s | 8 ms | 0 | 231 KiB |
| Comparison | 99 | 1.95 s | 8 ms | 0 | 237 KiB |

Both pages scored 100 for automated accessibility and best practices. JS transfer was about 161 KiB per first route, below the 200 KB proposed budget; total initial transfer was below 1 MB. No hero photo or video is downloaded. SEO scores (66 homepage, 63 comparison) reflect deliberately disabled indexing and local origin settings; they are not production launch scores.

Cold/warm local navigation was measured separately without throttling. Cold script transfer: 157,488 bytes; warm script transfer: 0 bytes from the network. Local timings are not representative of Australian visitor networks. JSON reports preserve exact conditions and numbers.

These results do **not** establish field INP, real-user 75th percentile Core Web Vitals, physical-phone performance or a complete accessibility certification.

## Not yet verified / owner work

- Actual manufacturer specifications, current prices, delivery stock and all unresolved editorial issues need publication review. The build did not independently reverify the supplied automotive corpus.
- Physical iOS/Android devices, on-screen keyboards, native browser zoom, VoiceOver/NVDA and printer output need human/device QA. Responsive and keyboard simulations were performed.
- There are no licensed production photographs. The image `onError` fallback is implemented; no approved photograph existed for a real-asset failure test. Videos have not been enabled or playback-tested.
- Brand/domain clearance, a verified correction contact, production origin/security configuration and explicit deployment authorisation remain owner decisions.

## Evidence files

`browser-production.log`, `build.log`, `extended-results.json`, `lighthouse-home.json`, `lighthouse-compare.json`, `screenshots/` and `comparison-print.pdf` contain the run results. Earlier failed checks were fixed; the production log is the final browser result.

## Refinement verification — 6 October 2026

- Production build, TypeScript, lint and research validation: pass.
- Domain checks: 18/18 pass, including complete chapter coverage and fresh research scope.
- Browser checks: 35 pass across Chromium, WebKit and Firefox; four intentional skips for duplicate print/screenshot capture outside Chromium.
- Standalone `index.html`: file URL opens, comparison/variant changes, refresh, history, feature carousel, footnotes and explorer/detail navigation pass in all three engines with HTTP requests blocked. Chromium and Firefox additionally used browser offline mode; WebKit's offline emulation rejects file navigation itself, so request blocking was used there. No network requests were made by the portable app.
- Served `/index.html` and bottom sheet: automated WCAG 2 A/AA, 2.1 AA and 2.2 AA checks pass at 320px in all three engines.
- Seven main routes: zero automated accessibility violations in the final Chromium run. Manual keyboard and footnote focus restoration are covered by the browser journeys.
- Desktop and phone screenshots visually inspected. Source footnotes have a minimum 24px target and group multiple sources under one marker.
- Original research and copied source JSON hashes still match `010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657`.
- Root and served portable files match; each is approximately 3.38 MB because all variants are embedded for offline use.

Evidence: `refinement-build.log`, `refinement-unit.log`, `refinement-browser.log`, `refinement-accessibility.json`, and `screenshots/refined-*.png`. Earlier Lighthouse measurements describe the previous build and were not rerun for this refinement. Physical-device and manual screen-reader verification remain unperformed; automated checks are not a complete accessibility audit.

## Inline comparison verification — 6 October 2026

This supersedes the previous carousel interaction checks.

- Production build, type checking, lint and source-reference validation: pass. Original immutable research hashes remain unchanged.
- Domain checks: 20/20 pass, including operating thresholds, unverified automation, structured warranties and regular-trim versus Black Edition scope.
- Browser journeys: 35 pass in Chromium, Firefox and WebKit; four intentional skips for duplicate print and screenshot work outside Chromium. Initial mobile link overflow was fixed and the complete suite passed on the rebuilt site.
- All 66 detail rows appear directly across six chapters. Chapter anchors, specific research values, footnote target focus and return focus verified.
- Standalone file: car selection, refresh, Back, feature search, inline details, source footnotes and exploration pass with HTTP blocked. Chromium/Firefox additionally use offline emulation. No HTTP requests observed from the file app.
- 320–1440 px homepage and three-car comparison: no horizontal overflow. Final phone and desktop captures inspected; desktop column headings stay visible, phone vehicle cards identify the relevant trim.
- Automated WCAG checks: zero violations on the seven main routes in Chromium; the inline homepage and 320 px served standalone page also pass across all three engines. This does not replace physical-device or screen-reader testing.
- Root `index.html` and `public/index.html` match; approximately 3.41 MB, with data and assets embedded.
- Evidence: `inline-build.log`, `inline-unit.log`, `inline-browser.log`, `inline-accessibility.json`, `screenshots/inline-*.png`, the viewport captures and `comparison-print.pdf`. Previous Lighthouse measurements were not rerun and do not describe the larger inline page.

## Ten-family swipe verification — 6 October 2026

- Production build, type checking, lint and immutable research validation pass. Root and served `index.html` match at approximately 3.43 MB.
- Domain checks: 21/21 pass, including ten distinct families, current default representatives, validated Tesla baseline and exact-trim URL restoration.
- Browser suite: 42 pass across Chromium, Firefox and WebKit; six intentional skips (duplicate print/viewport captures and the Chromium-specific native-touch protocol in other engines).
- Verified mouse swipes, native touch in the offline file, arrow/Home/End keys, previous/next boundaries, model jump menu, synchronized detail tracks, Tesla baseline retention, per-family trim selection and refresh persistence.
- All 66 feature/specification sections remain inline. Conditional values have adjacent context; field conditions and source lineage remain intact.
- Main and served portable pages pass automated WCAG checks across all three engines. Expanded footnotes wrap on phone screens and return focus correctly. Screenshot matrix covers 320–1440 px; no page-level horizontal overflow. Horizontal movement stays within the intended card tracks.
- Final desktop/phone screenshots inspected. `qa-fleet.mjs` reports no browser errors, no page overflow and zero automated accessibility violations on the fleet homepage. Native hardware/screen-reader checks remain unperformed.
- WebKit's full-fleet trace capture adds per-action overhead; the long cross-feature journey has a 90-second test budget. Direct untraced interaction checks did not show that per-action delay.
- Evidence: `fleet-build.log`, `fleet-unit.log`, `fleet-browser.log`, `fleet-accessibility.json`, `fleet-final-smoke.json` and `screenshots/fleet-*.png`. No new field performance or Lighthouse result is claimed for this larger comparison.

## Wayfinding design verification — 6 October 2026

- Production build, research validation, type checking and lint pass. Domain checks: 21/21 pass. Original research hashes remain unchanged; root and served standalone HTML match at 3,449,722 bytes.
- Browser suite: 42 pass across Chromium, Firefox and WebKit; six existing intentional skips. Subsequent contrast, toolbar and chapter-offset refinements were checked again in all three engines on the final offline file.
- Final automated WCAG checks: zero violations at desktop, mobile chapter entry and mobile feature detail in all three engines. Fixed a large-type contrast issue and a mobile link hit area that overlapped content passing beneath the sticky toolbar.
- Final offline checks: all 66 details present, model jumping and keyboard Home work, and the focused comparison action appears in the initial phone viewport. Chapter headings land below the toolbar.
- Reflow checked at 320, 390, 640, 768, 1024 and 1440 px in all three engines, with no page-level horizontal overflow. At 320 × 256 the comparison toolbar becomes static. Computed styles confirm alternatives have transparent backgrounds, zero radius and only a 1px left divider.
- Final desktop and phone screenshots visually inspected. Only Model Y has an enclosing comparison card; the A–F index, original pictograms and condition explanations remain readable. Physical devices and manual screen-reader review were not performed.
- Evidence: `design-build.log`, `design-unit.log`, `design-browser.log`, `design-final-accessibility.json`, and `screenshots/design-*.png`. The earlier `design-accessibility.json` records the first-pass findings, which the final report supersedes.

## Automated-driving hero verification — 6 October 2026

- Build, type checking, lint and immutable research validation pass. Domain tests: 22/22, including chapter coverage, fixed driving priority and correct scope for Model Y L driving warnings.
- Browser suite: 42 pass across Chromium, Firefox and WebKit, with six existing intentional skips. The revised journeys verify seven chapters, all 66 detail rows, five driving criteria in the lead chapter and software history remaining in its own chapter after reordering.
- Swiping, trim changes, source footnotes, phone comparison action, priority selection and standalone offline navigation pass. Root and served `index.html` match.
- Additional final checks: zero browser errors and zero automated WCAG violations for the desktop hero, phone hero and phone chapter index. No page overflow at 320, 390, 768, 1024 or 1440 px. Screenshots visually inspected.
- Evidence: `driving-build.log`, `driving-unit.log`, `driving-browser.log`, `driving-accessibility.json` and `screenshots/driving-*.png`.

## Price-first comparison verification — 6 October 2026

- Production build, type checking, lint and immutable research validation pass. Domain tests: 22/22.
- Browser suite: 42 pass across Chromium, Firefox and WebKit; six existing intentional skips. Covers Premium RWD default, revised chapter order, trim selection, synchronized comparisons and offline standalone navigation.
- Final desktop and phone checks: zero browser errors, zero automated accessibility violations, all seven illustrations loaded. No page overflow at 320, 390, 768, 1024 or 1440 px. Final screenshots visually inspected.
- Root and served standalone HTML match; original research hashes remain unchanged. Manual screen-reader and physical-device testing were not performed.
- Evidence: `price-first-build.log`, `price-first-unit.log`, `price-first-browser.log`, `price-first-accessibility.json`, and `screenshots/price-first-*.png`.

## Chapter scenes verification — 6 October 2026

- Six three-second looping canvas scenes now open the price, range, space, convenience, comfort and software chapters, in the automated-driving scene's treatment and with its black Model Y. Production build, type checking, lint, formatting and immutable research validation pass.
- Domain tests: 25/25. Three new tests cover the scenes: one per chapter other than automated driving with three beats and alt text; finite geometry at 61 moments through each loop in wide and square panels; and every scene repeating exactly after 3 seconds.
- Seam check: frame-to-frame pixel change measured at 30 frames a second through each loop. The change across the wrap is at or below each scene's median, so no loop jumps where it restarts.
- Browser suite: 42 pass across Chromium, Firefox and WebKit; six existing intentional skips.
- `qa-scenes.mjs`: 259 checks, none failed, in all three engines. Each scene paints, carries alt text and three labels, moves, pauses and resumes; with reduced motion each starts on its resting frame and plays on request; a scene scrolled off screen stops repainting; the offline `index.html` plays all six (Chromium). Zero browser errors, zero automated WCAG violations at desktop and phone widths, and no page overflow at 320, 390, 768, 1024 or 1440 px.
- Root and served standalone HTML match at 3,734,430 bytes. Desktop and phone screenshots of all six visually inspected.
- Not done: physical devices, manual screen-reader review, and frame-rate measurement on low-power hardware (a frame draws in about 1 ms on this machine).
- Evidence: `scenes-build.log`, `scenes-unit.log`, `scenes-browser.log`, `scenes-accessibility.json` and `screenshots/scenes-*.png`.

## Modernist chapter scenes verification — 7 October 2026

- All seven chapter scenes were rebuilt on one new engine (`src/lib/scenes/`): loops of 10 to 12 seconds in three beats, a moving camera, four day scenes, two night scenes and one that passes from night to morning, a new code-built Model Y and jointed people. The earlier six three-second scenes and the old driving renderer are removed. Art direction: `docs/SCENE_DIRECTION.md`.
- Production build, type checking, lint, formatting and research validation pass.
- Unit tests: 27/27. Five cover the scenes: every chapter has a three-beat scene with a resting frame in its stated tone; the set mixes day and night and software passes through both; finite geometry at 37 moments through each loop in wide and square panels; every beat is reached in order with progress from 0 to 1; and every scene repeats exactly after its loop.
- `qa-scenes.mjs`: 322 checks, none failed, in Chromium, WebKit and Firefox. Each of the seven scenes paints, carries alt text and three labels, moves, pauses and resumes; with reduced motion each starts still, in its resting tone, and plays on request; a scene scrolled off screen stops repainting; software's panel passes through both tones while playing; the offline `index.html` plays all seven (Chromium). Zero browser errors, zero automated WCAG violations at desktop and phone widths, and no page overflow at 320, 390, 768, 1024 or 1440 px.
- Browser suite: 39 pass, six existing intentional skips, 3 fail. The three failures are one test in three engines, `fleet.spec.ts:78` "conditional features explain dependencies beside the label". It expects the BYD Sealion 7 phone-key cell to be conditional with a "supported-phone list" note; the research completion overlay added the same morning (`data/research-completion-2026-10-07.json`) now marks that cell standard. This is a data and test mismatch, not a scene fault, and was left for whoever owns that data change.
- Root and served standalone HTML match at 3,772,660 bytes. Wide and square review sheets of all seven scenes visually inspected, and one scene watched playing on the served page.
- A frame draws in about 2 ms (6 ms for the city drive) at retina size on this machine.
- Not done: physical devices, manual screen-reader review, and frame-rate measurement on low-power hardware.
- Evidence: `modernist-build.log`, `modernist-unit.log`, `modernist-browser.log`, `scenes-accessibility.json`, `screenshots/scenes-*.png` (including `scenes-sheet-before.png`, `scenes-sheet-day.png` and `scenes-sheet-night.png`), and `scene-reel.html`, a self-contained page that plays all seven.

## Chapter scenes refinement — 7 October 2026

- A review pass over the seven rebuilt scenes, made after the other sessions working in this folder had finished. Changes: push-ins on the cabin (comfort), the seats and the shield (space); a camera that follows the phone (convenience) and goes close on it (software); a voice waveform laid across the panel; the charging bay washed back while the battery fills; slow creeping holds; a tree moved off the driveway where it covered the departing car; a larger padlock and phone; the software scene now rests on its update ring at night; every scene framed below the table of figures; building windows drawn as one path per colour; and an even half frame rate on devices too slow to keep up.
- Production build, type checking, lint, formatting and research validation pass. Unit tests: 27/27.
- `qa-scenes.mjs`: 322 checks, none failed, in Chromium, WebKit and Firefox, including reduced motion and the offline file; zero browser errors and zero automated WCAG violations. Browser suite: 42 pass, six existing intentional skips.
- Loop restarts: the frame 2 ms before each loop's end was compared with the frame 2 ms after it. Every scene changes no more there than across the same step in mid-loop.
- Frame rate, GPU canvas at retina panel size on an M3 Max: all seven hold about 60 frames a second. With the processor throttled four times to stand in for a mid-range phone, six scenes hold 55 to 60; the city drive manages about 48 to 53 (45 before the window change), which is the case the half rate is for. The half rate itself was not exercised under throttling in a browser test.
- Key moments of every scene captured from the served page at desktop and phone widths with the table of figures and labels in place, and inspected: no subject is covered.
- Root and served standalone HTML match. Not done: physical devices, manual screen-reader review, and watching all seven loops through in real time.
- Evidence: `scenes-refine-build.log`, `scenes-refine-unit.log`, `scenes-refine-browser.log`, `scenes-refine-qa.log` and `scenes-accessibility.json`.

