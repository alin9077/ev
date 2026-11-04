# Independent static review: narrow-detail98

## Decision

Accept for root-owned application and verification. No blocking code defect found. This is a narrow, appropriate reflow repair; it is not a rendered-layout pass, phone acceptance, or release approval.

Reviewed candidate manifest SHA256: `1201400954d6562939644bb09c522ae2275b545ede2e68e5b3abc601ba8cb1a9`.

## Independently verified scope

- Current application CSS is exactly the declared preimage: 113,703 bytes, SHA256 `18bd4641d0b37f32dea2f54c9ed3d8a6169e6a7d4503cb62d37e1cb96343d74e`
- Candidate CSS is 113,757 bytes, SHA256 `11eeef2b51b61ebba20d91051d3059bdde177b1cb25dc4eac1466073d6a0b2d4`. A direct full-file diff contains only the two declared hunks: section `min-width: 0`, inherited `overflow-wrap: anywhere`, and narrow-track `minmax(0, 1fr)`
- All candidate file, patch, and report hashes match the manifest. The two new test paths do not exist in the reviewed application
- `.detail-facts` markup occurs only in `src/components/detail.tsx`, for Essentials and supplementary source/equipment/warranty fact grids. No hero, nine-reason, fleet, route, data, content, reporting logic, or asset changes appear in the candidate

## CSS assessment

The diagnosis is well supported by the source: the narrow rule currently restores an automatic track minimum with `1fr`, while the actual Kawasaki generated HTML contains the long underscore-separated MY26 source token in `.fact-basis`. Existing emergency wrapping covers `.fact-value strong`, but not that sibling basis text. The candidate addresses both track sizing and text wrapping without removing text or introducing clipping or a horizontal scrolling container.

The three declarations are a small, deliberately defensive combination. Static analysis does not establish that all three are independently necessary; inheritance of `overflow-wrap: anywhere` also changes intrinsic sizing. That redundancy is reasonable here. The change preserves the existing 3/2/1 column progression: desktop above 1100px, tablet through 1100px, and narrow through 767px. Margins, padding, gaps, type sizes, borders, and the 44px disclosure controls are unchanged. Section wrapping also applies to long evidence text at desktop widths and in print; ordinary text should retain its normal word breaks, while oversized tokens can gain extra lines. Root should inspect the resulting line lengths and height, not merely the page width.

Model Y homepage selectors are outside the changed selectors. That is strong static scope evidence, not a substitute for the protected-source checks and retained-reference visual check.

## Tests and route truth

The candidate adds three Node test declarations and six browser declarations. The configured Chromium/WebKit/Firefox projects expand the latter to 18 prospective runs. None were run in this review.

- The Node tests guard all three existing grid rules, the shrinking/wrapping declarations, and the exact full checkpoint97 stylesheet after reversing only the two reviewed replacements. This is a strong whole-file scope guard, not a visual test
- All three exact routes exist as current generated production HTML: Kawasaki Ninja e-1 MY26, Lexus ES 350e Sports Luxury FWD, and Tesla Model Y Premium RWD. Kawasaki's generated `.fact-basis` contains the exact asserted token
- Production uses the real detail route. Portable uses the documented `/index.html?page=...` adapter, whose resolver matches `/cars/${family}/${slug}`. No heavyweight homepage prerequisite is introduced
- Report selectors match the current native details/summary and labelled textarea markup. The tests open, type, close, and reopen without submitting, saving, or exporting a report
- The browser cases inspect document/section overflow across seven widths and open available supplementary groups. They check one report per record and the column count of the first fact grid

Non-blocking coverage limitations worth retaining in the acceptance record:

1. `detail-reflow.spec.ts:76–79` checks token text presence, not token visibility. The geometry checks and immutable CSS scope help, but do not independently prove that every character is readable. Root's visible full-text check is necessary. A future test could explicitly assert the token node is visible
2. Each width iteration fills the draft before checking its value. The final reopen checks retention, but intermediate resize/reopen retention could be masked by refilling. A future test could check the previous value before the next fill
3. Supplementary groups are opened only when found; Lexus's expected equipment/warranty groups are not asserted present. Column count is checked only on the first grid. These are narrower guarantees than a comprehensive supplementary-evidence test
4. The seven widths cover both sides of each layout family but not the adjacent 767/768 and 1100/1101 boundary pairs. Native 150% zoom, physical phones, complete mobile journeys, and all catalogue records remain outside this spec

These do not block the CSS candidate. Root's equivalent bounded CUA checks can cover the observed defect without claiming that the unavailable automated browser suite passed.

## History and artifact guards

No new Node historical-reader adapter is necessary. The sealed checkpoint91 `before-app-input-hashes.json` has no `src/app/globals.css` entry; the 97-to96 source adapter explicitly reconstructs three components and guards its display helper, none changed here. Its outer historical pins must remain untouched.

The complete checkpoint97 input map at `roadmark-research/applied97/expected-inputs-revision2.json` does pin the old stylesheet hash. Create a new checkpoint98 expected map from that exact prior map with only the reviewed CSS replacement and the two new test entries. Do not mutate checkpoint97 inputs or treat the changed CSS as historical. Any reused emitted-artifact invariant asserting unchanged CSS/HTML shell must explicitly account for this reviewed CSS delta and still reject unrelated drift. Portable HTML must be regenerated from shared source.

## Required acceptance evidence

Root owns application, complete supported serial tests/types/lint/validation/builds, exact final-input comparison, and emitted-artifact checks. In the cloud browser, prioritize both rebuilt surfaces at the original physical500/CSS333 native150% case: inspect the complete Kawasaki token, all Essentials edges, and an opened report. Also inspect Lexus supplementary equipment/warranty grids, a narrow Model Y detail, 500px and desktop layouts, and the unchanged homepage hero/nine reasons against retained references. Include boundary checks if feasible.

Report actual browser engines and widths observed. CUA inspection is not an automated 18-case pass. Native error9, sustained performance, real phones, full-market closure, production reporting, publication, and release gates remain separate.

## Review method

Static reads and review-file writes only. No application writes, imports, project scripts, tests, syntax checks, browser use, uploads, Git operations, or Codex tasks. Read repository AGENTS, current/historical handoff documentation, architecture, implementation plan, goal/mobile guidance, the installed Next.js CSS guide, candidate artifacts, affected/shared source, routes, generated route HTML excerpts, test configuration, and relevant historical input/reader guards. Hashes and direct diffs were measured with ordinary read-only utilities.
