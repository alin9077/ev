# Electric-truck integration: independent data audit

Result: PASS after one corrected semantic defect. No outstanding data-audit errors or warnings.

## Verified scope

- 24 exact current Australian truck configurations: 14 Fuso factory chassis codes, one Hyundai 7,300 kg MIGHTY Electric cab-chassis, seven Farizon configurations and two Foton T5 ratings
- Exactly matches the 15 recommended Fuso/Hyundai records and the first nine current exact records from the Farizon/Foton/JAC packet
- No JAC historical records, held Foton family placeholders, Hyundai disputed lower-GVM configuration or extra Hyundai body options added
- Application audited read-only. Only research-side audit scripts, captures and reports were written

## Exhaustive parity checks

- 2,100/2,100 mapped fields pass independent source-to-output comparisons, including facts, equipment, shared warranties and deliberate null normalization guards
- 128/128 original/text source hashes match the actual local files and their source registries
- 390/390 structural and semantic guard checks pass
- Catalogue additions, supplied effective snapshot and independently evaluated live catalogue agree for every mapped field
- Both evidence JSON packets in application data are exact copies of the research packets
- Mapped checks cover value, transformation status, unit, basis/comparison basis, retained conditions, evidence locators, source IDs/URLs, conflict observations, warranty commercial conditions and log consistency

## Material defect found and fixed

Seven Farizon charging durations originally had a destination key and display label claiming hours, while their source values and stored units were minutes. This could make a published minute duration appear to be hours. The parent corrected all seven to dc_charge_time_min, min, and a neutral published-duration label. Final audit confirms the corrected key, value, unit and original SOC conditions. Fuso/Foton hour-valued durations retain their explicit hour basis.

## Safety and interpretation checks

- All 24 formal model years remain null; all exact stock and delivery states remain unverified; ordering stays listed/unconfirmed; no price is invented
- Fuso has 14 unique manufacturer chassis codes, with the 24 explicit rating configurations preserved in evidence rather than counted as separate trims. Optional GVM values stay within their base records
- All 14 Fuso range values remain unknown; unknown charge windows stay unknown; no 10–80% time is manufactured for any truck
- GCM is not converted into towing: Fuso trailer ratings remain unknown. Foton retains the literal GCM wording and null numeric GCM, while its independently published towing ratings retain their conditions
- Standard-GVM minus chassis-mass calculations reconcile exactly for Fuso and Foton. Calculated body-and-load allowance and published body-specific payload are separate from completed-vehicle payload; every normalized finished-cargo field remains null
- Gross versus usable battery capacities remain unknown for all 24. Manufacturer battery declarations are retained without reclassification
- Hyundai retains 502 V nominal battery voltage separately from the 569.4 V minimum compatible-charger threshold. Its 71-minute claim stays 8–100%, with 100 kW / 800 V station conditions
- Hyundai’s 4,495/4,500 kg lower-GVM dispute, 13.0/13.6 m turning dispute, touchscreen epoch dispute, finished-payload uncertainty and unresolved mirror-width bases remain held/qualified
- H9E AC charging conflicts stay null across all four configurations; Cargo Box range remains held rather than inheriting the unbodied claim. Body/mirror/loaded-test qualifications are retained
- F3E cab-chassis range remains unknown rather than inheriting Tray or Cargo Box range
- Foton 2025 Production equipment, warranty and 81.14 kWh declaration remain separate from unmatched 2023 stock
- Live equipment evaluation contains 1,656 shared feature cells: 13 exact conditional aliases and 1,643 unknown cells. All 13 aliases trace to the correct truck’s source-backed equipment. No passenger/van feature inheritance or absent-360-camera-to-no-camera inference was found

## Deliverables and limits

- Full machine-readable evidence: electric-truck-integration-audit.json
- Independent live capture: electric-truck-audit-live-snapshot.json
- Reproducible research-only checks: capture_electric_truck_audit.cjs and audit_electric_truck_integration.py
- The JSON audit records input hashes, every mapped-field result, every hash result, alias checks, guard checks and the resolved defect
- This audit establishes integration fidelity to the supplied source packets and local evidence bytes. It does not independently re-research every manufacturer assertion, prove actual stock/order acceptance, test every rendered screen or approve the separately handled selling-point manuscript
- Any later relevant application/evidence changes require rerunning the audit against refreshed snapshots
