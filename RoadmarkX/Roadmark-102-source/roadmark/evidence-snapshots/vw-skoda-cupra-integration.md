# VW / Škoda / CUPRA integration recommendation

Read-only review, 10 October 2026. No application files changed. Evidence: `vw-skoda-cupra-evidence.json`; all quoted source IDs below resolve there, with saved snapshots and hashes.

## Recommendation

**Integrate 11 current, exact manufacturer technical configurations first.** Optionally add **one separately labelled outgoing NEW configuration, Cargo MY25**, supported by its exact dealer ad and MY25 brochure. Keep the other eight records in the market audit or a clearly dated reference view until their remaining gates are resolved. Do not import all 20 as an undifferentiated current range.

The evidence file's `current_catalogue`, `manufacturer_configuration_verified` and `passenger_ranking_eligible` flags are not equivalent to readiness for current rankings. Read the `record_role`, exact MY, field conditions and stock evidence together. All per-VIN specification matches and physical-stock checks remain unverified.

### Decision for all 20 primary records

| Evidence record ID | Recommended disposition |
|---|---|
| `volkswagen-id4-my27-pro` | Current technical configuration; exact NEW MY27 ad also verified |
| `volkswagen-id4-my27-gtx` | Current technical configuration; exact NEW MY27 ad also verified |
| `volkswagen-id5-my26-pro` | Current technical configuration; exact MY26 NEW stock unverified |
| `volkswagen-id5-my26-gtx` | Current technical configuration; exact MY26 NEW stock unverified |
| `skoda-elroq-my27-select-60` | Current technical configuration, **July 2026 production scope**; NEW MY27 ad, exact build applicability still unverified |
| `skoda-elroq-my27-select-85` | Current technical configuration, July production scope; dealer June-build MY27 car must not establish the July-sheet per-VIN specification |
| `skoda-enyaq-my27-select-60` | Current technical configuration, July production scope; Perth NEW ad/feed claims 8 July build, clearing the broad date gate but not proving every delivered feature |
| `skoda-enyaq-my27-sportline-85` | Current SUV technical configuration, July production scope; June-build dealer applicability held |
| `skoda-enyaq-my27-coupe-sportline-85` | Current **Coupé** technical configuration, July production scope; clean exact NEW body/MY stock not verified |
| `skoda-enyaq-my27-rs` | Current SUV technical configuration, July production scope; June-build dealer applicability held |
| `skoda-enyaq-my27-coupe-rs` | Current **Coupé** technical configuration, July production scope; clean exact NEW body/MY stock not verified |
| `volkswagen-idbuzz-my25-pro-swb` | Outgoing MY25 technical reference plus explicit national MY25 new/demo offer; no clean exact NEW unit. Do not label latest/current technical range or stock-confirmed |
| `volkswagen-idbuzz-my25-pro-lwb` | Same outgoing-reference treatment; preserve seven-seat/LWB identity |
| `volkswagen-idbuzz-my25-gtx-lwb` | MY25 technical reference only. The fresh GTX dealer candidate conflicts on MY25/MY26; no clean exact NEW MY25 match |
| `volkswagen-idbuzzcargo-my25-swb` | Optional **outgoing** NEW van row: exact MY25 brochure + clean `cargo25_gorell` ad + current MY25 campaign. Keep out of passenger rankings |
| `volkswagen-idbuzz-my26-pro-swb` | Current identity/offer and clean NEW MY26 ad only; **no MY25 technical inheritance** |
| `volkswagen-idbuzz-my26-pro-lwb` | Current identity/offer and clean NEW MY26 ad only; **no MY25 technical inheritance** |
| `volkswagen-idbuzzcargo-my26-swb` | Current identity/offer only; exact clean MY26 stock and technical match unverified |
| `cupra-tavascan-my255-endurance` | Exact MY25.5 dated technical reference, still manufacturer-linked; not verified as the latest refresh or clean residual NEW stock |
| `cupra-tavascan-my255-vz` | Same MY25.5 restriction; Interior/Extreme are packages, not extra grades; Extreme's 477 km must not replace standard VZ's 505 km |

For the first 11, use `record_state: current_or_order_listed` with `orderStatus: listed_unconfirmed`. Use `stockStatus: new_stock_listed` only where the exact record has clean `stock_source_ids`; otherwise `unverified`. For the optional Cargo MY25 row use `record_state: outgoing`, `vehicle_class: van`, and its exact stock source. Do not use `verified_new_stock` to imply inspection.

**Why stop there?** Buzz's live downloads are explicitly MY25 while live offers and some clean ads are MY26. Current Tavascan pages still publish Endurance/VZ with a March 2026 MY25.5 brochure, while newer MY26 V/VZ dealer pages contain New-versus-demo conflicts. These prove publication/advertising, not a resolved replacement matrix. MY27 Buzz/Pro+ and MY26 Tavascan V/Endurance/VZ remain unresolved leads. The two residual NEW ID.5 MY25 records are outside these 20: identity-only, with no MY26 specification borrowing.

## Existing application overlap and market-audit reconciliation

Read `src/lib/data.ts`, `types.ts`, `discovery.ts`, `compare.ts`, `components/market-audit.tsx`, the baseline and additions JSON, and current market-audit records. At inspection the baseline had 34 variants and additions 70: **zero VW, Škoda or CUPRA models or variants**, hence no catalogue duplicates. Recheck before writing if another integration runs concurrently.

Keep SUV/Coupé, passenger Buzz/Cargo, MY and battery/drive identities separate. Suggested model identities are `volkswagen_id4_my27`, `volkswagen_id5_my26`, `skoda_elroq_my27`, `skoda_enyaq_suv_my27`, `skoda_enyaq_coupe_my27`; optional `volkswagen_idbuzz_cargo_my25`. Use readable exact trim/MY names and stable IDs. Retain the app's `__` variant-ID convention because `data.ts` derives detail slugs from it. Give MY revisions a shared `family_id` where appropriate so revisions are not counted as independent model families; keep both Enyaq bodies explicitly identified.

Existing IDs in `data/market-inventory-2026-10-10.json`:

| Existing audit ID | Reconciliation |
|---|---|
| `volkswagen-id-4` | Link MY27 Pro/GTX; correct the stale instruction to use MY26. Note exact NEW MY27 ads |
| `volkswagen-id-5` | Link current MY26 Pro/GTX. Separately retain residual NEW MY25 identity evidence; it does not prove MY26 stock |
| `skoda-elroq` | Link only MY27 Select 60/85 technical rows. Keep Sportline 85 unresolved: October order timing and final-specification-pending wording do not prove orders opened |
| `skoda-enyaq-suv` | Link MY27 Select 60/Sportline 85/RS; retain July-sheet applicability and dealer-build qualifications |
| `skoda-enyaq-coupe` | Link MY27 Sportline 85/RS; do not borrow SUV dealer ads or unresolved Wagon-template identities |
| `volkswagen-id-buzz` | Retain audit coverage with separate MY25 reference and MY26 offer/identity scopes; record clean MY26 SWB/LWB ads without importing their technical specifications |
| `volkswagen-id-buzz-cargo` | Retain MY25/MY26 split. Correct stale September-offer limitation to the current October–December offers. Downgrade `accepting_orders` to `listed_unconfirmed`: the source invites dealer contact about an order; no factory acceptance was verified |
| `cupra-tavascan` | Retain partial audit coverage. Replace old unversioned metrics with explicitly MY25.5 references; keep refreshed MY26 and stock-condition gates open |
| `cupra-born` in `unverifiedLeads` | Retain sold-out/unavailable-to-order evidence; no new detailed variant or Born VZ assumption |
| `volkswagen-e-transporter` | Leave to the separate commercial audit; this file does not resolve it |

Preserve existing `evidenceHistory`, add links/source history and detailed-catalogue references rather than deleting audit records. Follow the existing `catalogueCoverage`/`detailedCatalogueContext` pattern, retaining `rankingEligible: false` on market-only rows. Do not mark Elroq/Buzz/Tavascan family coverage complete. Recompute affected audit counts from the resulting records; do not increase them by 20 or treat model records as a vehicle count.

## Field mapping and comparison guardrails

Use the existing `catalogue-additions-2026-10-10.json` **variants + explicit facts + features** pattern. Variant values alone default to `standard` in `data.ts`; conditions written only in notes will not prevent a ranking. Explicit fact overrides are necessary for conflicts, offers, unknown cargo methods and revision holds.

| Evidence field | App mapping / rule |
|---|---|
| `battery_usable_kwh`, `battery_gross_kwh` | Keep separate facts; primary `battery_kwh` may use usable capacity only with `battery_basis: Usable`. Never interchange ID.4 Pro 84/79 with GTX 82/77, or ID.5 Pro 82/77 with GTX 84/79 |
| `range_wltp_km` | `range_km`, exact grade's WLTP **combined** basis; city figures separate. Preserve tested-wheel attribution as unknown; standard wheels do not prove the test configuration. A verified grade claim can be standard without inventing wheel testing |
| `standard_wheels` | Separate descriptive fact/equipment evidence with diameter, wheel name and front/rear tyres. Optional wheels/packages remain optional; do not create extra drivetrain grades |
| `ac_charge_max_kw`, `dc_charge_peak_kw` | `ac_kw`, `dc_peak_kw` only where explicitly maximum vehicle acceptance. MY25 Buzz/Cargo's 11 kW timed AC condition is not a separately proven maximum; leave `ac_kw` null there |
| `dc_10_80_min` | `dc_charge_time_min` with explicit 10–80% window and station/temperature qualifications; keep test-station power separate from peak acceptance. Where test conditions are incomplete, use `conditional` rather than ranking on window alone |
| `rear_cargo_l` | Split array into `boot_l` (all normal seats up) and `max_total_cargo_l` (all rear seats down). Škoda VDA values may be standard with VDA/seat-state bases. VW and CUPRA method-unknown values stay conditional, with no direct VDA ranking |
| Buzz cargo states | MY25 SWB 1,121 L seats up; folded figure null (2,205/2,232 conflict). LWB/GTX 306 L all seats up, 1,340 L third row down, 2,469 L all rear seats down. **Do not call 1,340 L its seven-seat boot** |
| Cargo van volume | MY25 unversioned 3.9 m³ page claim is not an exact MY volume standard; keep held/qualified. Never turn it into passenger `boot_l`. Preserve door/load-through dimensions and configuration separately |
| Tavascan storage | 540 L seats up / 1,550 L folded to roof, method unknown; do not label VDA |
| `seating_count` | `seats` only if exact standard configuration established. Current ID.4/ID.5/Škoda records leave it null; a five-seat dealer vehicle does not silently establish the manufacturer's standard grade |
| `dimensions_mm` | Separate length/width/height/wheelbase; preserve mirror basis. No swapping width including mirrors into body width |
| Mass and towing | Separate unladen/tare/GVM/payload, and braked/unbraked/towball. No inferred payload subtraction. ID.4 worldwide all-options tare claim is not Australian tare; keep normalized tare null |
| Torque | Individual front/rear values stay separate. No sum for GTX/RS. Retain Cargo's 550/560 conflict and Buzz GTX's ambiguous range as null |
| Price | Formal MLP remains null. Existing separate `driveaway_price_aud` fact is suitable for verified manufacturer FROM offers, `conditional`, exact buyer/paint/option terms, `validUntil: 2026-12-31`. Dealer-specific price stays separate with VIN/stock, not a universal grade price. Enyaq Select/Sportline/Coupé Sportline manufacturer prices remain null due to conflicting current primary figures |
| Warranty | Map vehicle and battery coverage separately, including use-class exclusions, 8-year/160,000 km battery limit and 70% trigger. VW/CUPRA staged remedy levels are qualifications, not different original capacity guarantees. Roadside stays separate |

Equipment maps to existing criteria such as `front_heated_seats`, `front_ventilated_seats`, `rear_heated_seats`, `heated_steering_wheel`, `parking_cameras`, `screens_hud`, `audio_system`, `glass_roof`, `power_tailgate`, `carplay_android_auto` and `battery_chemistry`. Map only the exact MY grid's standard dots or optional circles. Elroq Select 85 does **not** inherit Select 60's optional Canton/HUD/Area View/power-seat offerings. Tavascan Interior/Extreme packages are conditional equipment. Do not infer app functions, phone key, OTA, heat pump, V2L or ANCAP from siblings/navigation/marketing names.

## Minimal unknowns to keep

- Across the first 11: formal MLP, standard seating where not explicitly established, V2L and unresearched software/app/ADAS details. Do not erase the many verified technical measurements because unrelated fields remain open
- ID.4/ID.5: charge times, tow ratings, GVM/payload/front storage; ID.4 normalized tare. Current ID.5 manufacturer price is unverified. AWD total torque remains null
- Škoda: payload/tare, Enyaq front storage, three conflicted Enyaq prices; July-sheet applicability for June-build dealer VINs. Unladen mass is verified, so do not replace it with a guessed tare
- All MY26 Buzz/Cargo technical and equipment values; MY25 consumption unit errors, Cargo torque, SWB folded cargo and timed-AC maximum distinction
- Tavascan gross/usable basis (77 kWh is unqualified), refreshed MY26 matrix, and clean NEW status. Correct national locator code is **EXAE**; EXAI is Leon. Public configuration is not returned stock

Use manufacturer sources for technical facts and exact dealer sources for availability. Do not attach a blocked/conflicted dealer source to every otherwise verified manufacturer fact: `discovery.ts` rejects facts when a cited source has an access limitation/hold. Equally, do not remove a real field conflict to recover ranking eligibility. Preserve field-specific provenance and scope, with dates `2026-10-10` and the underlying publication revision separate.

Before any later implementation is accepted, check exact ID uniqueness, 11-current/optional-1-outgoing decisions, conditional offer expiry, VDA versus unknown-method cargo, MY/body battery separation, no June-build inference, and unknown feature-cell preservation. This review did not run tests or modify the application.
