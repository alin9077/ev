# Configuration payload implementation review

10 October 2026. Read-only static review of root's implementation.

## Result

No blocking security, evidence, source-closure or fail-closed regression found in the inspected code. No application files were edited. No runtime imports, tests, builds or browser checks were run by this worker; root owns serial aggregate verification.

`discoveryCars` now creates a new three-field configuration object containing the unchanged `rankingEligible`, `completeVehicleCountEligible` and `projectionScope`. It preserves absent configuration markers and the remaining Car properties, including full summary/source guards, availability evidence and issues. Existing fact narrowing is unchanged. False or missing eligibility still fails the unchanged `!== true` ranking gate; only literal true permits later eligibility checks.

Call sites remain downstream of catalogue summary construction: home, discovery and their portable views. Full option/own/related identity validation still runs against the complete server catalogue. Detail, selected comparison packs, report inputs and stored/hydrated portable packs remain on the full-data path. No new external-data transmission, raw-HTML rendering or source sanitization bypass was introduced. Scope is rendered as ordinary escaped React text.

Raw JSON hash comparison: **all three match the prior audit** (catalogue additions, buyer proposal and identity ledger). Guard-module hash comparison: **all five match the prior audit** (selling-points, page-evidence, timing, proposal loading and snapshot resolution). See companion JSON for exact per-file hashes.

## Coverage and remaining test gaps

The updated home-payload test deliberately compares all non-configuration identity fields, exact retained values, new nested identity and absent-marker preservation. The new configuration-payload suite covers input/full-configuration hashes, retained full packs/options, original summary/fact/availability/issue references, payload ratio, all seven rankings/strengths/exclusions across six date states, false/undefined/true eligibility, source/date parity and source-closure identity/order.

Existing separate tests still cover independent VW configuration fixture hashes, selected-option and scoped-amendment mutations, complete source holds/snapshots, malformed deadlines, expiry boundaries and clock-gated SSR. Test source inspection is not a claim that the current aggregate has passed.

Two optional improvements, neither a blocking defect:

1. The scope SSR case renders full bounded cars. Render `discoveryCars(bounded)` instead, or add that case, to directly cover the combined projection/render boundary. Current independent tests already establish preserved scope values and visible rendering
2. The new source-drift parity test compares full/projected cached-summary results. Add explicit undefined assertions for changed/missing guard sources to make its local safety claim stronger. Existing source tests separately assert actual suppression, and the projection retains the identical summary reference

No need to broaden the payload change, weaken guards, or delay completion specifically for these optional assertions if the serial aggregate passes.

## Adjacent changes

- Always-visible scope remains outside summary conditions and independent of buyer-summary/clock validity. The badge and exact paid-paint/Cargo-fabric qualifications are retained
- `issueReaderText` is a pure exact-ID plus exact-text display mapping. Other IDs and altered/appended warnings pass through verbatim. Its citable, Issues and print call sites do not mutate evidence Issue objects, snapshots, source IDs or ranking holds. The replacement retains the station-rating versus vehicle-acceptance warning and matching charging-window/conditions caution
- Picker wrapping is limited to the first picker span using `min-width: 0` and `overflow-wrap: anywhere`; the price span remains nonshrinking. This is only a static assessment, not verified browser/phone layout

## Artifacts and limits

`configuration-client-payload-implementation-review.json` includes the reviewed invariants, optional gaps, raw/guard hash comparisons and 37 SHA-256 file records. Hashes reflect persistence time while root owns the working tree. The prior 249,461-byte estimate remains field-level offline JSON savings; this review did not remeasure route HTML/Flight/compression or phone performance.
