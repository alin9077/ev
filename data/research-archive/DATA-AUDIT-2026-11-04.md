# Data audit — 4 November 2026

Scope: the app's loaded catalogue (433 variants) as users see it, after `isVerifiedFact()` hides unverified facts. "Tier 1 on sale" = passenger + ute with availability `current_or_order_listed` (276 variants). Research cutoff of the imported data is ~16 Oct 2026.

## What's good

- **Integrity is clean.** No duplicate ids, no slug collisions, no brand-spelling variants, no negative values. Every fact with a value cites a source and every source id resolves.
- **Core buyer data for mainstream cars is solid.** Tier 1 on sale: 73.6% of the 22 fact slots visible; warranty 100%, length 99%, seats 96%, boot 87%, range 77%, 0–100 76%.
- **Strong brands** (key-slot visibility, on-sale): Tesla 99, Geely/Zeekr/Toyota/Nissan/Leapmotor/GAC 91, Kia 90, XPENG 89, Subaru 88, BYD 87.
- **Spot checks mostly agree.** 15 of 20 price/range values checked against Australian sources agreed (Model 3, Sealion 7, ATTO 1/3, Scenic, Trailseeker, Kona, EV9, Ariya, X9…).
- **Freshness**: all visible facts were reviewed 5–15 Oct 2026 (20–30 days old).

## What needs work (ranked)

1. **Wrong values**
   - `kia_ev3__gt_line_awd_long_range__5` price 63,950 (confirmed) — sources say **$66,490**; the original value was right.
   - Same variant towing 1,500 kg (confirmed) — no source found; range maximum is **1,000 kg**.
   - Tesla Model 3 Premium RWD DC peak 175 kW graded *confirmed* but Tesla doesn't publish it (~170 kW estimate) — downgrade to reported.
   - Model 3 internal inconsistencies: two RWD trims share 62.5 kWh/175 kW but show 520 vs 572 km; ground clearance 128 vs 138 between trims; RWD efficiency 9.15 km/kWh (only outlier).
2. **Junk text visible to users**
   - `scope` renders as the literal "undefined" on 381 facts (Geely EX5, Jaecoo J5, Kia EV3/EV5, Zeekr 7X) — bug in `src/lib/data.ts` (`String(undefined)`).
   - 196 qualifications contain `categories[id=…]` API paths (mostly Porsche); 40 contain raw JSON/Python dicts; 122 "Source locator:" strings (32 with URLs); 44 snake_case field names used as basis text; 108 researcher instructions ("Retain the established usable core basis…"); 48 qualifications > 400 chars.
3. **Mixed comparison bases in the same column**
   - Price: 28 driveaway among 233 list prices; 3 models mix both.
   - Range: 13 ADR, 8 NEDC, 2 WLTC alongside 246 WLTP.
   - Battery: 168 "gross or usable not stated", 32 gross, 111 usable.
   - DC charge window: 13 are 30–80%, 1 is 0–80%, plus text values like "<30 min".
4. **Naming**
   - 8 trims equal the model name ("Porsche Taycan Taycan", Macan, Cayenne, Audi Q6); 10 more Taycan trims repeat the model.
   - ~30 trims contain ad/sheet text ("· MY25 residual New advertising", "Brisbane advertised offer", "· July 2026 AU sheet").
   - Casing: DOLPHIN, ATTO 3 EVO, IONIQ, "smart".
   - 24 near-duplicate groups across model years (e.g. Kia EV6 Air MY26 + MY27, XPENG G6 2024 + 2025 both "current").
5. **Grades vs sources**: 376 "confirmed" facts lack a maker/regulator source (372 are maker domains mistyped as `authorised_dealer`); `source_type` has 114 distinct values.
6. **Availability**: 58% of variants are "current" with order status unconfirmed; 29 provisional variants show prices; 5 outgoing variants still priced; VW ID.5 is discontinued in Australia but 2 variants are tagged current.
7. **Metadata**: 181 variants have no numeric model year (156 "Model year unverified"); 101 generations marked unverified; 33 drive Unknown; no body-type field.
8. **Prices go stale soon**: all prices cross 45 days old around 19 Nov 2026; 4 visible driveaway offers already expired 31 Oct.

## What's missing

### Data on existing variants
- **Tier 1 on sale with no visible price: 109 of 276.** Zero visible price for GWM, MG, IM, Škoda, Audi, Mazda, Genesis, Porsche; BMW 22%.
- **No visible range: 64.** Porsche 0%; Audi DC charge time 0%.
- **Weak brands**: Cadillac 27, Denza 27, Renault 41, Genesis 45, Ford 49 (0% towing), Porsche 55.
- **Empty slots (Tier 1 on sale)**: turning circle 62%, kerb weight 55%, unbraked towing 53%, frunk 53%, ground clearance 50%, max cargo 49% — 1,180 empty cells; the archive covers almost none.
- **Equipment**: only 23.5% of feature cells visible. Under 10%: novated/FBT 0%, driveaway price 6.5%, remote preconditioning 7%, V2G 9%. ANCAP visible for only 12 of 41 car brands.
- **Vans, trucks, buses, motorcycles (77 variants): 0% visible** — nothing was graded. Their pages are empty but still in the sitemap.
- **Hidden but present**: 420 Tier 1 on-sale cells hidden for grade (price 78, DC time 68, 0–100 46, towing 38, range 35). Reviewing these is the biggest single gain.

### Models
Estimated coverage ≈85% of mainstream on-sale BEV cars/utes (≈75–80% including niche/luxury), against ~146 models / 52 brands on the market.

Priority additions: Zeekr 7GT, GAC Aion UT Standard Range, Kia PV5 Passenger, MG U9 EV ute, Mercedes EQE + EQE SUV, Mercedes EQS facelift / EQS SUV, Lotus Eletre + Emeya, Hongqi E-HS9 (Jan 2027), Toyota C-HR BEV (2027), Lexus RZ 600e F Sport Performance, Fiat/Abarth 500e, Peugeot E-3008/E-5008, Maserati Folgore range, Rolls-Royce Spectre, Mercedes EQV, LDV eT60.
Brands absent: Lotus, Rolls-Royce, Maserati, Jaguar, Fiat, Abarth, Hongqi.
Listed but likely gone: VW ID.5 (ended MY26), standard Hyundai IONIQ 6 (only N sold).

### Dimensions buyers expect with no app slot
In the archive but not slotted: motor power/torque (423 variants), payload/GVM/GCM (key for utes and vans), kWh/100 km, V2L kW, connector type, ANCAP stars, service interval.
Nowhere: state stamp duty/rego/rebates, numeric LCT/FBT-exemption eligibility, capped-price servicing cost, delivery lead time, recall history.

## Recommended order of work

1. Fix the "undefined" scope bug and strip junk text in `scripts/import-dot-research.ts`; fix trims/casing. (Small, high visibility.)
2. Correct the EV3 AWD price/towing and Model 3 grades; tag ID.5 outgoing.
3. Normalise or label comparison bases (price basis, range cycle, charge window) in compare views.
4. Review the 420 hidden Tier 1 cells, starting with price and DC time; fill prices for MG, GWM, Škoda, Audi, Mazda, Porsche, Genesis.
5. Decide on vans/trucks/buses/motorcycles: grade them or remove them from the sitemap.
6. Add the top missing models; set up a price refresh cycle (45 days).
7. Consider slots for power, payload/GVM, ANCAP stars and kWh/100 km — data already exists in the archive.

Method: three independent passes (coverage via the app's own loader; plausibility/consistency rules plus 20 web spot checks; market comparison via Dot's leads and web search). Web checks relied on secondary outlets (CarExpert, CarsGuide, Carsales, The Driven, Chasing Cars); manufacturer sites were not opened, so treat model-coverage figures as estimates.
