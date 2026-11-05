# Mercedes-Benz passenger strengths and tradeoffs

Seven guarded technical-only proposals checked 10 October 2026. All are manufacturer-listed; formal model year, accepted factory orders and strict NEW stock remain unverified. GLC stays audit-only and vans are excluded. No equipment changes or application edits.

## Mercedes-Benz EQA 250+

Strength — A defined home-charging starting point: A 70kWh usable battery and up-to-11kW AC input give you concrete figures to check against your home charging setup.

Tradeoff — Allow time for rapid charging: Mercedes quotes 35 minutes for 10–80% DC charging. Treat that as a conditional manufacturer claim when planning stops, rather than a promised stop time.

Sources: [r10_mb_mb_eqa](https://www.mercedes-benz.com.au/passengercars/models/suv/eqa/overview.html)

## Mercedes-Benz CLA 200

Strength — A 20-minute charging claim: The exact CLA 200 table quotes 20 minutes for 10–80% DC charging, a useful starting point for checking whether charging stops suit your routine.

Tradeoff — Check the charging hardware: AC and DC maximum-power claims remain unresolved. Confirm the selected build and compatible chargers before relying on that quoted stop time.

Sources: [r10_mb_mb_cla_electric](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html)

## Mercedes-Benz CLA 350 4MATIC

Strength — More usable energy than CLA 200: The CLA 350 table lists 85kWh usable, 27kWh more than the CLA 200’s 58kWh. That gives you more stored energy to consider, without establishing a range advantage.

Tradeoff — Confirm your AC charging setup: Resolved AC capability remains unverified. Confirm the selected build’s AC rating before sizing a home charging installation.

Sources: [r10_mb_mb_cla_electric](https://www.mercedes-benz.com.au/passengercars/models/saloon/cla-electric/overview.html)

## Mercedes-Benz GLB 250+

Strength — Seven-seat electric layout: The GLB 250+ table specifies seven seats and 85kWh usable battery capacity, a starting point for shoppers who need more than five seating positions.

Tradeoff — Check luggage with every seat in use: Seven seats do not establish luggage room. Cargo volume with all seating rows in use is unverified, so check your passengers and usual luggage together.

Sources: [r10_mb_mb_glb_electric](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html), [r10_mb_mb_warranty_pdf](https://www.mercedes-benz.com.au/content/dam/australia/passengercars/services/warranty/mercedes-benz-passenger-car-warranty-statement-2026-05.pdf)

## Mercedes-Benz GLB 350 4MATIC

Strength — More output, the same usable battery: The GLB 350 lists 260kW, 60kW more than the GLB 250+, while both tables specify seven seats and 85kWh usable. That separates the output choice from battery capacity.

Tradeoff — Range still needs checking: The higher output does not establish range or efficiency. Exact-grade range remains unverified; the separate advertised vehicle’s figures do not fill that gap.

Sources: [r10_mb_mb_glb_electric](https://www.mercedes-benz.com.au/passengercars/models/suv/glb-electric/overview.html), [r10_mb_mb_warranty_pdf](https://www.mercedes-benz.com.au/content/dam/australia/passengercars/services/warranty/mercedes-benz-passenger-car-warranty-statement-2026-05.pdf)

## Mercedes-Benz EQS 400

Strength — Battery cover for longer ownership: For eligible purchases, Mercedes lists EQS high-voltage battery cover to 10 years or 250,000km, whichever comes first, including a remedy below 70% state of health under the full terms.

Tradeoff — Resolve charging ratings before choosing: The technical table and equipment descriptions disagree on maximum AC and DC power. Both resolved ratings remain unverified; check the selected vehicle before planning charging around them.

Sources: [r10_mb_mb_eqs](https://www.mercedes-benz.com.au/passengercars/models/saloon/eqs/overview.html), [r10_mb_mb_warranty_pdf](https://www.mercedes-benz.com.au/content/dam/australia/passengercars/services/warranty/mercedes-benz-passenger-car-warranty-statement-2026-05.pdf)

## Mercedes-Benz G 580 with EQ Technology

Strength — 432kW with 117kWh usable: For shoppers prioritising system output, Mercedes lists 432kW alongside 117kWh usable battery capacity. Exact-grade range remains unverified.

Tradeoff — Check commercial-use battery cover: The May 2026 warranty excludes G 580 high-voltage battery cover for commercial applications, including part-time rideshare. Confirm your intended use before relying on the private-use battery warranty.

Sources: [r10_mb_mb_g_class_electric](https://www.mercedes-benz.com.au/passengercars/models/suv/g-class-electric/overview.html), [r10_mb_mb_warranty_pdf](https://www.mercedes-benz.com.au/content/dam/australia/passengercars/services/warranty/mercedes-benz-passenger-car-warranty-statement-2026-05.pdf)

## Guard and scope notes

- Exact effective fact envelopes, source dates/eligibility, identities and availability are retained in JSON. Model years are null, with “Model year unverified” as display copy.
- Canonical AC conflicts and CLA 200/EQS DC remain null. Conditional table-only claims are separate and are not used as resolved ratings. CLA 350 is not described as a proven same-trim AC conflict.
- GLB battery-warranty duration, distance and retention remain null. EQS warranty and G 580 commercial-use exclusion retain full terms.
- Two arithmetic comparisons use like-basis technical facts: CLA 350 has 27kWh more usable energy than CLA 200; GLB 350 has 60kW more system output than GLB 250+. Neither establishes acceleration, efficiency or range.
- Page-default equipment and exact-offer range, price, wheels and model years are not inherited. No recommendation or whole-record ranking eligibility is conferred.
- Prices have separate context and are absent from technical clause dependencies.
- Shared-reader verification follows below; richer snapshot-only checks must not be mistaken for runtime enforcement.

## Shared-reader verification

- All seven summaries and all 14 clauses render against the current shared catalogue, effective features and source registry
- All 96 dependency snapshots exactly match, including 89 full effective fact envelopes, seven null model years, source evidence/eligibility metadata and all availability envelopes
- Changing each of 74 clause-used fact values suppresses every dependent clause while preserving every independent companion clause
- All seven records fail closed for changed formal MY, model code, usable-energy basis, gross/range nulls, charging window, qualifications, status, stale fact date, fact issues or loss of listed eligibility
- Both GLB records suppress stale battery-warranty conditions if any null battery term/distance/retention or warranty string is filled
- Removing the G 580 commercial high-voltage-battery exclusion suppresses its tradeoff while preserving independent output/battery copy
- Resolving a canonical AC/DC null suppresses dependent unresolved-rating copy; no conditional attributed-table value is substituted into canonical fields
- Changing or expiring all prices preserves all technical/warranty clauses inside their independent 30-day evidence window
- Changing separately attributed conditional charging claims does not mutate or replace canonical nulls and does not affect copy that makes no attributed-table-power claim
- All summaries suppress outside the 30-day evidence freshness window
- 30 missing/stale/held/conflicted/blocked source mutations fail closed for dependent copy in both shared reader stages
- No equipment claims or feature patches; GLC and all vans excluded from the seven-record proposal

### Runtime limits

- Runtime guards compare fact value/status/unit/basis/qualifications/conditionExplanation, freshness/issues, required source membership and source access/conflict/hold states. Rich comparisonBasis, scope, market, source publication/qualification metadata and full availability envelopes are exact review snapshots, not independently compared at runtime.
- Current-listed runtime eligibility checks record availability state; it does not compare the saved listed_unconfirmed/unverified availability envelope. This proposal does not claim that stronger availability enforcement exists.
- No app code or data was changed; mutation tests use in-memory fixtures only.
