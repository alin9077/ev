# M1 brand order

Prepared 13 October 2026. Planning only; no vehicle-specification research performed for this note.

## Sales basis

[The Driven, 2 October 2026: Australian electric vehicle sales by month in 2026, by model and by brand](https://thedriven.io/2026/10/02/australian-electric-vehicle-sales-by-month-in-2026-by-model-and-by-brand-3/), checked 13 October 2026. Use its January–September **battery-electric** brand YTD column, not PHEV sales or automotive-group totals. Reporting is incomplete; published brand totals include commercial vehicles.

The original `data/research-sales-2026-10-06.json` retained this citation and a model-coverage note, but no brand counts. This table was recovered from the cited public page today. The immutable original remains unchanged.

## Published descending order

| Brand | Reported YTD BEVs |
|---|---:|
| BYD | 44,682 |
| Tesla | 41,705 |
| Geely | 15,709 |
| Zeekr | 12,120 |
| Omoda Jaecoo | 10,664 |
| Kia | 10,390 |
| MG | 9,911 |
| Hyundai | 3,441 |
| Toyota | 2,933 |
| Volkswagen | 2,723 |
| Volvo | 2,407 |
| GWM | 2,390 |
| GAC | 1,893 |
| BMW | 1,820 |
| Chery | 1,776 |
| Polestar | 1,679 |
| Subaru | 1,500 |
| XPeng | 1,296 |
| Mercedes-Benz | 1,217 |
| Leapmotor | 1,166 |
| Mazda | 1,094 |
| Skoda | 1,043 |
| Audi | 994 |
| Deepal | 924 |
| Mini | 731 |
| KGM | 636 |
| Cupra | 396 |
| Renault | 384 |
| Farizon | 286 |
| Nissan | 256 |
| Ford | 206 |
| Lexus | 189 |
| Denza | 142 |
| Porsche | 97 |
| Genesis | 78 |
| Suzuki | 67 |
| Jeep | 49 |
| Lotus | 5 |

Published zero rows: Alfa Romeo, Cadillac, Fiat, LDV, Peugeot, Rolls-Royce, Skyworth, Smart. Missing monthly data can produce these zeros; they do **not** prove zero sales.

Published brand sum: 178,999; FCAI/EVC BEV total: 180,589. The 1,590 difference is unallocated, not a new brand.

## Applying this to M1

- Follow the published brand ordering above, processing only Tier 1 passenger cars, SUVs, people movers and utes. Finish a brand's version list, prices, core facts, strengths and trade-offs before moving on.
- Farizon is a van brand in the held catalogue. Skip it during M1 and retain it for Tier 2. Peugeot and Skyworth also appear only in the commercial part of this sales table; do not start van research during M1.
- The priority is based on the published whole-brand BEV totals. It is not a newly calculated Tier 1-only sales ranking. Do not subtract commercial models using incomplete model data.
- Normalize labels without silently merging unrelated brands: Omoda Jaecoo covers held Jaecoo records; Mini means MINI; XPeng means XPENG; Skoda means Škoda; Cupra means CUPRA; Smart means smart.
- The publication groups IM models within MG and the Abarth 500e within Fiat. Process held IM records alongside the MG sales group, and Abarth alongside Fiat, while preserving their existing catalogue brand identities. These are work-queue mappings, not changes to catalogue ownership or sales facts.
- After the positive-sales sequence, resolve Tier 1 brands with published zero/unusable reporting in alphabetical order: Alfa Romeo, Cadillac, Fiat/Abarth, LDV, Rolls-Royce and smart. Rolls-Royce also needs C1 reconciliation because its appearance in this report does not establish a current held catalogue entry.
- Then resolve held Tier 1 brands/leads absent as separate brands from this table alphabetically: ACE EV, Chevrolet, GMC, Honda, Isuzu, JAC, Jaguar, Maserati, Roev, Tembo, Voltra and ZERO Automotive. Keep the Geely/Riddara RD6 lead with Geely. These have no assigned sales count or inferred sales rank. Resolve official-new-sale eligibility during C1; an importer/conversion lead is not automatically eligible.
- Alphabetical ordering for unresolved/no-data brands is an explicit planning tie-break, not a sales claim. Add any further C1-discovered brand to the unranked queue until a supported reported sales position exists.

## Integrity checks

The 38 positive brand rows sum to 178,999, matching the published brand-table total. Values above are transcribed from the YTD column; no sales values were estimated. The source's monthly model and brand totals differ in some months, so this plan does not reconstruct YTD from those monthly cells.

Local label and scope cross-checks: `data/au_ev_all_variants_2026-10-06.json`, `data/catalogue-additions-2026-10-10.json`, and the passenger/ute records and leads in `data/market-inventory-2026-10-10.json`.
