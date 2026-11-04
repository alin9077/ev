# Road-scooter integration audit

Audited: 2026-10-10T12:00:45.797757+00:00

## Result
- 5 standard configurations; 331/331 mapped fields pass
- 28/28 source registrations; 60/60 hashes pass (54 original/text, 6 derived)
- 97/97 semantic checks pass; 126 numeric facts excluded from ranking
- 15/15 exact conditional feature aliases pass; remaining 330 rows unknown; no passenger assumptions inherited
- Blocking errors: 0; warnings: 1

## Holds preserved
- E110S remains excluded. Colours and optional battery packs are not extra configurations
- E125S peak power and E300SE curb mass are null, with source disagreements retained
- Gross/usable energy, approved seats/pillion, payload, wall AC input, charger inclusion, ADR identity and exact model year remain unknown
- Advertised new availability is not physically checked or VIN-confirmed stock; delivery remains unverified
- ZEEHO SOC windows are retained; Segway starting SOC is unspecified. Range test/pack caveats and limited licensing claims remain qualified

## Nonblocking completeness gaps
- Exact manufacturer sources support narrowly qualified phone-key, app, firmware-update and display details absent from shared equipment rows
- Already-mapped charging and local price facts also lack shared-row aliases
- Do not infer passenger features, national licence entitlement, HUD, automatic unlocking, complete OTA coverage, included charger or national prices

## Blocking findings
- None found in this data-integration audit

## Scope limits
- Local captured sources and the actual catalogue reader were checked. No fresh external stock check, independent vehicle test, app edit, browser UI run, or full build/test suite was performed
- Detailed per-field, source, hash and input-revision checks are in road-scooter-integration-audit.json
