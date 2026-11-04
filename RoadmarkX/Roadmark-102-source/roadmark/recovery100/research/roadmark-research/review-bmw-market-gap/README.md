# BMW i3 / iX4 independent research review

Decision: **GO for a bounded future market evidence/limitations amendment only.** No required research correction was found. This is not code admission, an app-ready patch, permission to change the app, completed production QA, or a complete BMW market audit. Both records remain held.

Reviewed candidate: `research-candidate.json`, SHA-256 `8c7a14e8937f85aabed7ec30676c5a26fdc09445203166fc51b21259fbe31937`.

## Decisive findings

- **Marketing versus availability:** S01 captures the two AU 50 xDrive cards, the New label and Build & Price links (iX4 L291–306; i3 L456–472). These support current marketing presence only. The separate Coming Soon cards are M60 entries. The candidate does not turn a CTA, technical page, or lack of a stock link into accepted orders or physical New stock.
- **i3 AU timing:** S02 L549 explicitly identifies the i3 50 xDrive Sedan as arriving in 2027. The proposed note retains that Australian timing. It does not claim a formal model year, accepted order, committed delivery, or that pre-orders are closed.
- **iX4 timing:** S08 is BMW PressClub Global, dated 8 October 2026 at L52. Its March 2027 launch statement is at L79. The candidate correctly retains the scope of the global release and does not assert an Australian launch month. L128 separately qualifies equipment and consumption figures to Germany; none are proposed as normalized AU specifications.
- **M60 separation:** S06 L234 and S07 L508–510 support 2027 AU M60 order availability. They do not establish either 50 variant's order-opening date. Mixed combustion M350 content on S06 is not inherited into the i3 entry. The global M60 January 2027 passage is likewise not imported into Australian timing.
- **40 separation:** S05 names i3 40 and 50 in technical/image-label content, with the German-market optional-equipment WLTP caveat at L324. S08 names iX4 40 in the global release. Neither source establishes local current sale admission, and neither 40 nor M60 is proposed for admission.
- **Identity:** S03/S04 current AU product titles support NA0/NA7. The candidate properly keeps 52JB/22HU as historical report-only values. The three historical dossier paths remain absent and are not represented as restored or reverified.

## Integrity checks

Independently re-read the live inventory JSON without importing or executing application code. The whole input file still matches `ea4e4f7120e7739de987405740641997c15c6bb0704082724ae3d38055b6fdfa`.

- `/records/33`, `bmw-i3`: exact preimage equal; canonical hash `80cecd64b464661a15300d994c945dabedc71846078524293130b081f4ede3e6`
- `/records/40`, `bmw-ix4`: exact preimage equal; canonical hash `ec992cdd729290031adfbf6efacbc7bfa1245e2f321debed32c58c02f625ce18`
- All 34 package-manifest entries match, with no unlisted package files
- All 8 source capture and sparse-excerpt hashes match; each sparse quote is present in the saved primary-source capture and each cited primary URL appears in its capture
- All 3 input-provenance hashes match; the historical bridge object and its canonical hash match the current retained bridge

The source provenance explicitly describes local tool-extraction and sparse-excerpt hashes. It does not claim publisher-origin bytes or origin-byte hashes. Observation windows are qualified tool-observation bounds; undated pages are not assigned invented publication dates. The dated release and the observation date remain distinct.

## Permission and access boundary

The historical selected-build route remains permission-blocked, including alternate routes. The saved source headers show ordinary public product, technical and press-page reads, not selected-build access. This is a static evidence review, not a complete independent execution-log audit, so it does not certify every past action's absence.

The iX4 technical-page failure is correctly described as a tool-access failure without an exposed HTTP status or publisher denial. The candidate records that it stopped. This reviewer made no network call, retry, alternate access, browser action, contact, or configurator request. The bounded dealer search does not establish national stock absence.

## Conditions for any later amendment

Limit it to supported evidence/limitations wording for these two rows and preserve the cited source and geographic/variant distinctions. Keep `listed_unconfirmed`, `unverified`, `current_listing_order_stock_unconfirmed`, `market_audit_only`, false ranking eligibility, null model year, null complete-vehicle-count eligibility, existing 50 xDrive trims and partial trim coverage. No new specifications, grades, ranking, count, exact order, New-stock, or sale-certification admission is supported. Recheck the exact preimages before any separately authorized future application.

No app files were written by this reviewer. No application imports, tests, builds, Git commands, browser, or network were used. Writes are confined to this review directory. QA3 status and whole-app integrity are outside this review.

## Review limitation

This independently checks the supplied capture content and local integrity, not a fresh live-origin observation. There is no unresolved source-content gap for the narrow evidence wording. Publisher-origin authenticity, network-fetch timestamps, selected order build/effectivity, current orders, exact stock and full market completeness remain unestablished.
