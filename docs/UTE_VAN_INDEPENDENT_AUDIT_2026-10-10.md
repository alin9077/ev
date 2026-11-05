# Independent ute/van integration audit

Date: 2026-10-10  
Result: PASS; 0 blocking checks, 1 presentation warning(s)

## Verified scope

- Seven configurations across four existing inventory families; no duplicate market families
- All 1,168 mapped source fields checked for values, units, statuses, source IDs, source conditions, locators, market and date
- All 49 source registry entries checked; all 201 source snapshot hashes and sizes match
- 19 canonical fact aliases checked, plus 60 qualified shared feature aliases
- Runtime has 262 configurations and 106 families; all 255 pre-existing configurations are unchanged
- Seven new configurations have 483 shared feature cells; no unsupported inherited positive features
- Zero new entries in any of seven discovery ranking attributes; no new standard-status fact

## Critical boundaries retained

1. Musso six-airbag correction and absent centre/driver-knee airbags remain explicit. AWD towball discrepancy and vehicle DC acceptance stay held. Black Edge is a 2WD-only option.
2. PV5 source-declared tare/kerb disagreement remains visible, normalized kerb remains null, and MY26 battery warranty conflict remains unresolved. Platinum/91% commercial-van collision-avoidance assessment is not crash stars.
3. Farizon seats are dealer-advertised three with the manufacturer count unverified. Superseded stock 39435 is not current clean-new evidence. The charging window is 20–80%, never relabelled 10–80%.
4. STARIA Liftback formal model year and seats remain held; the MY27/two-seat ad is Twin Swing. BEV is unrated, commercial warranty is used, the station/manufacturer 350 kW declaration is not normalized vehicle acceptance, and door-specific mass is not invented.
5. Commercial cargo/tub volumes do not become passenger boot capacity. Gross/usable battery values are not inferred. Loading, towing, offer and policy qualifications survive mapping.
6. Six configurations have exact named new-ad evidence; Liftback is official-offering-only. No physical stock, unsold status, accepted order or delivery guarantee is claimed.

## Corrections caught during review

Canonical dc_charge_time_min and warranty aliases were added; PV5 prose warranty unit cleared; Musso ventilation wording clarified; Farizon rated-power label corrected. All retain conditional/held evidence.

## Remaining presentation note

Some warranty_service values describe warranty although the runtime labels this criterion “Servicing”. This is nonblocking evidence-wise because canonical warranty cells are correct; use a qualified servicing statement or leave that feature unknown.

## Evidence and reproduction

- Detailed checks: ute-van-independent-audit.json
- Effective snapshot: ute-van-independent-effective-snapshot.json
- Run audit_ute_van_runtime.cjs from the app with node --import tsx, then audit_ute_van_integration.py and finalize_ute_van_audit.py
- Catalogue SHA-256: c61810ee5e32e7b496eb6e9ebcfa72e97df39e0a0f20b799e58ca0a18555bec7
- Evidence SHA-256: 8208fbc69eb295c59bb5b5dcb8102d4493d3d31182af59a49186742eba85b857

This was a read-only application audit; only research outputs were written. It audits integration against supplied source evidence and targeted original snapshots, not physical availability, legal entitlement or whole-market completeness.
