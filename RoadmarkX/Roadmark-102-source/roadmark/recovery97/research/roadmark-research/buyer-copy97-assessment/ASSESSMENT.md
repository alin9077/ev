# Buyer-visible research wording: bounded checkpoint 97 proposal

## Recommendation

Use a small, exact-match **presentation-only** wording layer for six issue groups (seven replacement strings, ten live field occurrences). Do not edit the evidence JSON, frozen snapshots, buyer-summary records, sources, dates, availability, counts, specification eligibility or rankings. Keep the original Model Y hero and all nine selling points entirely unchanged.

The supplied browser findings are corroborated by static source tracing: Market directly renders `evidenceNote` and `limitations`; Discovery and exact-trim detail directly render `configuration_evidence.projectionScope`. No browser work was performed in this assessment.

**Important:** this is a review proposal, not an applied change. Checkpoint 96 is prefetch-only over checkpoint 95 data. Only this assessment directory was written. No application import/execution, syntax check, test, build, browser, Git, Codex task or upload was performed.

## Exact replacement list

Full machine-readable field paths, record IDs, exact before/after strings, line locations and rationale are in `REPLACEMENTS.json`. Paths use zero-based array indices as read here; use the stable IDs and exact old text for any future implementation.

### 1. FONZ Z Series SR and LR configuration notices

- Data: `data/catalogue-additions-2026-10-10.json`
- Active paths: `variants[299].configuration_evidence.projectionScope` (line 75692), `variants[300].configuration_evidence.projectionScope` (line 89992)
- IDs: `fonz_z_series_sr_forza_aranciata_black_vegan__20261010`, `fonz_z_series_lr_forza_aranciata_black_vegan__20261010`
- Before: “Bounded named advertised selection only; separate root admission required”
- Proposed after: “Only this named advertised selection is covered; further review is required before treating it as a fully verified configuration.”
- Why: describes the limited offer scope and remaining verification in buyer language. It does not establish a complete factory build, accepted order, allocated unit, stock, delivery, model year or ranking eligibility. All surrounding warnings remain.

### 2. Three Surron Ultra Bee EBMX configuration notices

- Data: `data/catalogue-additions-2026-10-10.json`
- Active paths: `variants[301].configuration_evidence.projectionScope` (line 104292), `variants[302].configuration_evidence.projectionScope` (line 122299), `variants[303].configuration_evidence.projectionScope` (line 140306)
- IDs: `surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010`, `surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010`, `surron_ultra_bee_hp_r_carbon_black_ebmx_19849__20261010`
- Before: “Bounded exact advertised New MY26 EBMX offer only, pending separate root admission”
- Proposed after: “Only this exact advertised New MY26 EBMX offer is covered; further review is required before treating it as a fully verified configuration.”
- Why: retains exact offer, seller, advertised New condition, advertised MY26 and pending review. It does not turn dealer MY into a verified manufacturer MY or an advertisement into verified stock.

### 3. Kawasaki Ninja e-1 configuration notice

- Data: `data/catalogue-additions-2026-10-10.json`
- Active path: `variants[304].configuration_evidence.projectionScope` (line 158018)
- ID: `kawasaki_ninja_e1_my26_nx011atfnn_brisbane_kaw_ne1_my26_1__20261010`
- Before: “Brisbane Motorcycles advertised New Ninja e-1 (LAMS) (MY26), NX011ATFNN, catalogue KAW-NE1-MY26_1; not a closed factory build; unpublished source-only proposal pending separate root admission”
- Proposed after: “Brisbane Motorcycles advertised New Ninja e-1 (LAMS) (MY26), NX011ATFNN, catalogue KAW-NE1-MY26_1. The advertisement is recorded, but a complete factory build is not verified; detailed specifications still require separate review.”
- Why: preserves seller, exact name and identifiers, incomplete-build limitation and pending technical review. The published buyer page should not call itself an unpublished proposal. Retain that original process statement in its provenance. This rewrite makes no registration, stock, delivery, accepted-order or manufacturer-MY finding.

### 4. Mazda CX-6e market record: limited brochure check and technical boundary

- Data: `data/market-inventory-2026-10-10.json`
- ID: `mazda-cx-6e`
- Active path: `records[241].limitations[4]` (line 24285)
- Before: “The root visually inspected brochure pages 5, 7 and 14, confirming grade table headings, cargo measurement basis and the publication footer/code. This limited visual check does not approve the separate detailed technical candidate; no technical epoch or specification is admitted by this market record.”
- Proposed after: “Brochure pages 5, 7 and 14 were visually checked for grade-table headings, cargo measurement basis and the publication footer/code. This limited check does not verify the detailed technical information, applicable specification version or vehicle specifications in this market record.”
- Why: preserves the precise three-page scope, checked items and the explicit absence of technical approval. It avoids implying a full-brochure review or applicability to the advertised VIN. The adjacent 363 L VDA / 468 L unresolved cargo conflict remains word-for-word untouched.

- Active path: `records[241].evidenceNote` (line 24279)
- Before: “Current Mazda Australia HTML names GT and Azami. The manufacturer retains preorder/almost-here advertising and links to dealer enquiry. Its current driveaway offer separately identifies E35 GT. Melville Mazda advertises one New E35 Azami GR, stock 11397703/VIN LVRHDCEK6TN551337, with public in_stock/reserved=false/preorder=false metadata last updated 6 October 2026. These seller fields do not establish present unsold physical availability. No detailed specification or brochure-to-VIN applicability is admitted.”
- Proposed after: “Current Mazda Australia HTML names GT and Azami. The manufacturer retains preorder/almost-here advertising and links to dealer enquiry. Its current driveaway offer separately identifies E35 GT. Melville Mazda advertises one New E35 Azami GR, stock 11397703/VIN LVRHDCEK6TN551337, with public in_stock/reserved=false/preorder=false metadata last updated 6 October 2026. These seller fields do not establish present unsold physical availability. This market record does not verify detailed specifications or whether the brochure applies to that VIN.”
- Why: changes only the last sentence. No seller status, date, identifier, stock qualification, grade or source changes.

### 5. Lexus ES BEV stale instruction to the implementation owner

- Data: `data/market-inventory-2026-10-10.json`
- Active path: `records[228].limitations[0]` (line 22540)
- ID: `lexus-es-bev`
- Before: “Newly discovered current Australian market-audit candidate: absent from starting inventory; main should add family audit and detailed configuration together without duplicating hybrids.”
- Proposed after: “This Australian battery-electric ES entry was added after the initial inventory. Its market and detailed configuration records cover the BEV models; hybrid ES models are separate.”
- Why: the existing current record already lists the two BEV grades and its evidence note says the exact Australian configuration records are integrated. The original instruction is stale. Preserve the BEV/hybrid distinction and historical late addition without presenting a task instruction as a buyer caveat. All actual unknowns in the other limitations stay unchanged, including manufacturer MY, charging-window conflict, cargo basis and unverified exact New stock.

### 6. BCI Mini Bus: internal UI publication instruction

- Data: `data/market-inventory-2026-10-10.json`
- Active path: `records[5].limitations[1]` (line 453)
- ID: `bci-mini-bus-ev`
- Before: “Admission is sales-sheet-scoped only. If the UI cannot keep this scope and the technical conflicts visible, retain the family in audit/search instead of publishing a falsely exact build.”
- Proposed after: “This entry is limited to the sales sheet. Unresolved technical conflicts mean it must not be treated as a verified exact build.”
- Why: retains the restriction that matters to buyers while leaving the original publication instruction available in internal evidence. The surrounding detailed width, motor, driver-count, battery-unit and charging conflicts remain unchanged.

## Rendering trace

### Market records

- `src/lib/market-inventory-data.ts:1` imports `data/market-inventory-2026-10-10.json` directly.
- `src/components/market-audit.tsx:23–26,36–44,128–129` reads and filters only `inventory.records` for cards.
- `:157` renders each active `r.evidenceNote` directly.
- `:158–173`, particularly `:170–172`, renders each active `r.limitations` string in the buyer-openable “Evidence & limitations” disclosure.
- `:155` separately renders `trimCoverage` with underscores replaced; `:211–215` renders top-level scope and notes. These broader labels/history are not proposed for this small pass.
- Reconciled/unverified/peripheral collections, nested amendment history and source artifact bookkeeping are not traversed into these cards.

### Configuration notices

- `src/lib/catalogue-additions.ts:13–17` reads the additions JSON; `src/lib/data.ts:98–100` adds its variants and `:473–477` copies the live `v.configuration_evidence` into `Car.configurationEvidence`.
- `src/lib/discovery.ts:64–79` transports the scope plus eligibility flags; it does not expose the nested frozen provenance in Discovery.
- `src/components/discovery.tsx:358–364`, especially `:363`, renders the scope directly immediately below “Captured configuration · specifications incomplete”.
- `src/components/detail.tsx:66–72`, especially `:71`, renders the same scope in exact-trim detail.
- `src/portable/entry.tsx:9–10,40–55` uses the same Market and Discovery components. `src/portable/market-inventory-data.ts` supplies the portable inventory. Presentation changes should be shared so portable and app surfaces do not diverge.

## Why the evidence JSON should remain unchanged

The active scope strings have six nested copies at `variants[299..304].configuration_evidence.frozenReadinessVariant.configuration_evidence.projectionScope`. These are provenance, not directly rendered scope notices. Leave them alone.

Four current buyer-summary expected-identity snapshots also include the full configuration evidence (including nested frozen scope). Their IDs are SHA-256 keys, not ordinary editable labels:

- FONZ SR: `i_b010bbb8ca3de3dff75755b7cfedd263a4086bf62c8e92a599654639be9d1317`
- FONZ LR: `i_d4a695824505aeb23917bb95dbc149871153caa8b7a10956aa0e4a8dcf92385b`
- Surron HP T carbon: `i_2efb1af61c666bfd60dfec047b4a7d2d4a2c18befa2be04c6886ea5163a5bd6c`
- Surron HP T desert: `i_df21c7d501a76d354b560489e3512ce8d99b6656775203bc21a8fe595c284e09`

`src/lib/buyer-proposal-storage.ts:24–28,48–58` hashes and checks each snapshot. `src/lib/selling-points.ts:99–110,258–266` checks exact identity equality. Changing only the active scope can therefore remove a guarded summary even if all facts are unchanged. Rewriting the snapshots to silence this problem would be a separate evidence migration, not this copy-only improvement.

Prefer applying each exact replacement only at presentation, using stable record/variant ID, relevant field and expected old string. Keep the original string as fallback when either identity or text differs, so an unseen future revision is not silently reinterpreted. Do not add global word substitutions such as replacing every “candidate” or “admission”; those words are meaningful in provenance and can occur in valid buyer qualifications. Do not feed display text back into comparisons, identity hashing, freshness or ranking.

## Deliberately excluded

- Original Model Y hero and nine selling points: no edits, proposal changes, order changes or guard changes.
- The source-only Mazda evidence companion repeats the original prose. `data/market-mazda-cx6e-lead-evidence-2026-10-12.json` is not the Market card's imported source; preserve it as research provenance.
- FONZ's “no third detailed candidate” is also a buyer-visible required condition (`variants[299/300].configuration_evidence.requiredBuyerVisibleConditions[7]`, plus guarded buyer proposal conditions and the market limitation). It is lower priority than the prominent heading-adjacent scope notice and should remain untouched in this bounded pass, especially to preserve the selling points and exact required-condition equality. A later explicit condition-language audit would need all bindings reviewed together.
- Other active Market instances include “admission” or “candidate” in Sitrak, LDV, Maserati and Custom Denning limitations. They are outside this small tranche. No claim is made that all buyer jargon is removed.
- The targeted active Market fields and the configuration-scope/condition strings did not expose literal “pinned” or “gating”. Those terms appeared in other internal evidence/workflow material, which is not a reason to rewrite it. This is not an exhaustive audit of every rendered fact, source record or export.
- Keep IDs, schemas, raw source quotations, source dates/URLs, candidate hashes, sourceOfferRecord, researchHoldMappings, frozenReadinessVariant, amendment history and expected identity ledgers intact.

## Separate optional improvement: initial freshness placeholder

Reference: `../initial-strengths96-assessment/ASSESSMENT.md`. That prior static assessment and root's passive browser observation indicate an intentional pre-clock state, not a demonstrated persistent strengths defect.

A distinct later presentation change could replace only the `!clockReady` empty-strength text with “Checking evidence freshness…” and “Strengths and trade-offs will appear once the date check completes.” Keep exact-trim navigation available. Use “evidence incomplete” only after readiness when the existing guards actually return no eligible summary/rank. No such change is included in the replacement manifest.

Do not alter clock readiness, the Australian evidence date, source/expiry/freshness guards, ranking policies or buyer summaries. A presentation branch must not expose claims or ranks before the clock is ready and must preserve the ready-state stale/missing evidence fallback. The current `src/components/discovery.tsx` lines are `62–63` and `95–101` for readiness/date, `329–334` for guarded summary selection, `381–416` for strength fallback, and `431–454` for trade-off fallback.

## Root-owned verification if selected later

1. Read the exact manifest and verify old text/IDs still match before implementing. Keep the seven changes as display-only replacements; no data rewrite.
2. Compare data, identity snapshot, buyer-selling-point and protected hero/selling-point hashes against the saved baseline. Verify no availability/specification/ranking/freshness or source/date changes.
3. Verify both Discovery and detail render the six intended notices and both app/portable Market render the four intended market-field replacements. Unmatched IDs and changed old strings must retain original text.
4. Verify the FONZ and Surron guarded summaries still behave identically, every condition remains visible, and all ranking/complete-build flags are unchanged.
5. Keep optional clock-placeholder work separate with its own pre-ready, ready, stale and expired-state checks.

This worker performed static inspection and report writes only. All future checks above remain unrun.
