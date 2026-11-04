# Independent review: detail client transport projection

10 October 2026. Read-only source review against the saved source54 ZIP (SHA-256 `eb8e33d734144bf70a6fd610e40004dd3b54d6674c18f9d25c76d66533a15c8d`). Root owns serial testing, lint/type validation and the subsequent build. This worker did not import application modules, run tests/builds, edit application files, or use HTTP/browser tools.

## Result

**No blocking consumer, evidence, guard, or caller-compatibility problem found.** The patch matches the audited paired-boundary recommendation. Actual generated-route savings and final rendered-content verification remain pending the root's build; previous estimates are not promoted to measured results here.

## Verified scope

Byte comparison of every existing `src/`, `data/` and `tests/` file in the verified source54 archive found:

- Changed existing files: only `src/components/buyer-summary.tsx`, `src/components/ui.tsx`, `src/components/detail.tsx`
- New files: only `src/lib/detail-client-props.ts`, `tests/detail-client-props.test.ts`
- Missing files: none
- All other source, data and test files are byte-identical, including original hero, comparison, source/summary/identity producers, guard modules, avatar code and existing clock tests

The BuyerSummary diff is exclusively type imports and its parameter type. The ui.tsx diff is exclusively a type-only import and SoftwareTimeline's parameter type. Their executable bodies are byte-unchanged. Detail changes are imports, both summary call sites, the timeline call site, and formatting of the existing configuration-warning `<strong>` text. The text remains the same; final markup equality will verify the formatting change as part of the generated build review.

## Helper and consumer checks

### BuyerSummary

`buyerSummaryCar` returns a new wrapper containing the exact existing `car.buyerSummary` reference. It neither copies nor truncates conditions, expectedVisibleConditions, immutable expectedSourceSnapshots, guardSourceIds, strengths/tradeoffs or their deadlines. A missing summary stays `undefined`.

All runtime reads in BuyerSummary are of `car.buyerSummary`; no omitted Car field is consumed. Sources are still `pack.sources` at both actual detail call sites, and the tree-wiring test checks strict source-array reference equality.

The following code is unchanged against source54:

- Initial evidence-date state derived from summary.checkedAt
- Australian evidence-date refresh on mount
- 60-second refresh interval and clearInterval cleanup
- Complete `currentBuyerSummary` invocation with unchanged sources and 30-day policy
- `buyerSummaryNeedsClock` pre-clock suppression
- Independent strength/tradeoff rendering and footnotes
- EvidenceConditions and checked-at display

Therefore the projection supplies the same input object to the same clock/guard logic during initial, repeated and later evaluations. Existing malformed-deadline, visible-condition, source-drift and expiry tests remain intact. This review does not claim it executed browser timers.

### SoftwareTimeline

`softwareTimelinePack` creates a new pack wrapper and a new five-field identity wrapper:

- id: Model Y L caution
- modelId: Kia EV3 notice
- brand: heading and Kia wording
- model: heading
- trim: heading

It retains the exact original references to complete eligibility, events and configuration. Every runtime pack read was checked. No `facts`, `configurationEvidence`, `buyerSummary`, `features` or `sources` read occurs inside SoftwareTimeline.

All filter predicates, all event rows, pending status, categories, delivery methods, verification text, changes, notes, footnotes, no-event notice and configuration-change rendering stay unchanged. Since the whole events array and each original event are retained, repeated/late filter selections do not require any omitted field or a newly loaded subset.

### Calls and compatibility

Both summary branches in Detail are updated: passenger/undefined class and explicit non-passenger class. SoftwareTimeline uses the projected pack once at the end of Detail. Full server packs continue to supply every fact, source-history item, issue, availability qualification, ClaimReport and FeatureValue outside those two boundaries.

Existing SoftwareTimeline callers in `fleet-experience.tsx`, `experience.tsx` (including comparison/print sections) and `software.tsx` are unchanged and still pass complete Pack values, which structurally satisfy the narrowed type. The optional `onEvidence` prop remains accepted. Type-only imports introduce no runtime dependency from those client consumers back into application data. There is no mutation, source projection, source-field stripping, altered guard or portable codec implementation in this patch.

## New test review

The new test suite checks all catalogue cars for:

- Exact wrapper key sets
- Strict identity of the complete summary and all three timeline objects/arrays
- Exact values of all five timeline identity fields
- Absence of unrelated timeline facts/sources
- Full-vs-projected BuyerSummary and SoftwareTimeline SSR equality for every car

It also traverses actual Detail element trees for Tesla and FONZ, verifies both narrow props and the original sources array, and requires one summary and one timeline per detail tree. This covers the passenger and non-passenger branch distinction. The test title calls the latter “commercial”; FONZ is a scooter. That label is cosmetic, not a coverage defect for the actual branch condition.

The test suite compares the current full and projected consumer inputs using current components. The separately captured source54 baseline provides the additional before-edit comparison. Its two saved copies are byte-identical and contain 325 distinct car IDs, each with summary/timeline byte counts and hashes. **This worker only verified the baseline file structure; it did not rerender or compare a new result yet.** Root's serial test/build results remain authoritative.

Optional nonblocking strengthening, if useful later: an explicit input-before/after hash or frozen-input test would document nonmutation; the helpers visibly perform only reads and create wrappers. Interactive filter/clock checks should wait for the user's browser permission rather than adding a workaround.

## Remaining verification

1. Root's focused/full tests, typecheck, lint and data validation must finish successfully
2. Compare post-edit component markup against the saved source54 hashes for all 325 records
3. After the real Next build, measure actual detail HTML/Flight with preserved source and qualifier closure; compare stable/non-Flight markup and report actual differences from the offline estimates
4. Confirm homepage hero, discovery and comparison data/rendering remain unchanged, allowing for normal build IDs/chunk names
5. Browser, handset performance, timer execution and interactive filter checks remain unperformed and permission-dependent

Companion `detail-projection-implementation-review.json` records the checked file hashes and exact source54 comparison scope.
