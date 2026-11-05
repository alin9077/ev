# Hyundai integration audit

Result: PASS

Scope: read-only audit against the frozen 10 October 2026 Hyundai evidence packet. Audit files only were written to the research directory; no application files were edited. This checks source-to-app fidelity, not a fresh dealer enquiry or physical stock inspection.

## Verified
- 12 new configurations; runtime 274 total configurations and 112 detailed families
- All prior 262 effective catalogue records unchanged
- 4,283 mapped fields checked for values, status, units, sources, basis, conditions and locators
- All 309 preserved source files match manifest hash and size; all 70 source registry entries mapped
- All 23 conflicts and 20 holds retain their semantic restrictions
- All four option/roof children remain non-additive; no extra grades or family rows
- All 2,565 source equipment assertions retain held/null/false/optional meaning; 180 shared feature summaries audited
- No new Hyundai record enters numeric rankings
- Exact New-stock core filter contains only ELEXIO base/Elite and KONA Elite/Premium; IONIQ 6 N sunroof-only ad retained under held base stock
- Warranty standard/conditional extension and 70% SOH remedy clauses stay distinct; charge supply/SOC windows and cargo loading boundaries retained

## Fixed during independent review
- Held IONIQ 6 N base-row stock after a sunroof-only advertisement leaked into the stock filter
- Restored units to shared feature summaries
- Explicitly marked 7 kW home-charging time unknown where source supply differs or is unestablished
- Restored source-column locators, including exact charging aliases

## Remaining note
- INSTER Cross gloss-black mirror caps are source-optional with null value. Effective status is not verified with explicit optional qualification; this is conservative and not a false positive.

## Conflict matrix
- PASS elexio_dual_motor_brochure_copy: Official FWD/160 kW retained; no AWD or dual-motor promotion
- PASS elexio_cargo_page_504_vs_506: Technical 506 L VDA behind second row used; 504 L conflict stays visible
- PASS elexio_base_seat_configurator_copy: Exact grade seat matrix preserved
- PASS elexio_mass_shared_labels: Raw 2105 kg tare and broad shared mass ranges remain declared-only; comparable kerb/tare held
- PASS elexio_dealer_roof_claim: Dealer panoramic-roof prose not promoted
- PASS elexio_dealer_height_scope: Official height retains roof-rail boundary; generic 1673 mm not substituted
- PASS ioniq9_portable_charge_copy: Portable time held; conflicting copied declaration preserved only with explicit conflict guard
- PASS ioniq9_front_seat_adjustment_copy: Official MY27 16-way specification retained
- PASS inster_non_cross_49_availability: No current non-Cross 49 kWh record added
- PASS inster_model_year_epoch: Formal year remains null; older AX.V1/current AX.V2 stock not conflated
- PASS kona_elite_range: Elite 19-inch 444 km/16.7 kWh per 100 km retained
- PASS kona_stale_price_campaign: Expired novated offer price stays outside comparable price cell
- PASS inster_heat_pump_legacy_claim: Heat pump remains unknown; PTC and battery heating do not imply absence or presence
- PASS kona_ancap_report_epoch: 2023 rating year and current PDF December 2031 expiry retained
- PASS hn_conflict_boost_headlines: 448/740 normal and temporary 478/770 boost remain separate
- PASS hn_conflict_i5n_roof_epoch: Current calculator Vision Roof distinguished from optional roof in older-linked PDF; no-roof current orderability not asserted
- PASS hn_conflict_i5n_seat_adjustment: Manual source declaration retains explicit no blanket MY27/VIN-equipment binding
- PASS hn_conflict_i5n_dealer_year: Contradictory dealer year labels do not populate normalized technical MY
- PASS hn_conflict_i6n_pdf_template: All seven held sedan-template equipment rows remain null/not verified
- PASS hn_conflict_i6n_safety_groups: Sunroof children are roof-only contexts; no safety package variation inferred
- PASS hn_conflict_i6n_stock_range: 487 km WLTP manufacturer range retained; dealer 484 km not promoted
- PASS hn_conflict_i6n_energy_cycle: 18.7 consumption stays ADR 81/02-qualified, separately from WLTP range
- PASS hn_conflict_price_semantics: Raw calculator prices/roof surcharges not promoted to normalized RRP

## Hold matrix
- PASS hold 1: All existing directly held fact wrappers remain null; only source-qualified observations retained
- PASS hold 2: Explicit no physical-stock, accepted-order or delivery verification qualifiers retained
- PASS hold 3: All existing directly held fact wrappers remain null; only source-qualified observations retained
- PASS hold 4: Explicit no physical-stock, accepted-order or delivery verification qualifiers retained
- PASS hold 5: All existing directly held fact wrappers remain null; only source-qualified observations retained
- PASS hold 6: Explicit no physical-stock, accepted-order or delivery verification qualifiers retained
- PASS hold 7: Both MY27 IONIQ 9 rows exact New stock held; no MY26/DSM child added
- PASS hold 8: All existing directly held fact wrappers remain null; only source-qualified observations retained
- PASS hold 9: Explicit no physical-stock, accepted-order or delivery verification qualifiers retained
- PASS hold 10: Both MY27 IONIQ 9 rows exact New stock held; no MY26/DSM child added
- PASS hold 11: New-to-Demo redirects and failed earlier listing do not establish current MY27 New stock
- PASS hk_ranking: No additions enter any numeric ranking
- PASS inster_current_roof_basket: No roof-basket configuration or Cross sunroof range transfer
- PASS inster_legacy_extended_range: Older MY26 Extended Range not added or merged with current technical epoch
- PASS kona_sr_er_stock_mapping: Base SR/ER battery-ambiguous listings do not establish exact stock
- PASS kona_nline_stock: N Line remains one optional non-additive child with unverified option stock
- PASS hn_hold_i5n_no_roof: No extra no-roof current row; no discontinuation claim
- PASS hn_hold_i5n_my27_equipment: MY null and exact stock held; facts retain current-linked 2024-document boundary
- PASS hn_hold_i6n_ancap: No regular-model ANCAP stars or unverified centre-airbag assertion inherited
- PASS hn_hold_common_numbers: Vehicle DC peak, gross/usable split, service intervals and payload remain null

## Reproducibility
- Run audit_hyundai_runtime.cjs through the app’s tsx loader, then audit_hyundai_integration.py and complete_hyundai_audit.py
- Frozen research SHA-256: 583ce8eef94314a10003be3c48f346e67c432a6dfa827872543d677daa3f5e4d
- Audited catalogue overlay SHA-256: 9ef55e4b05f697667ed0626157697fcb272da239720bbd34253360721f8f8115
- Full proof and field rows: hyundai-independent-audit.json
- Runtime snapshot: hyundai-independent-effective-snapshot.json
