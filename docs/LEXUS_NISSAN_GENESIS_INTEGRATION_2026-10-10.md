# Lexus / Nissan / Genesis integration memo

Checked 10 October 2026. Research-only deliverable; the main agent owns all catalogue/application changes.

## Recommended scope

13 current configuration records across seven families: Lexus 5, Nissan 4, Genesis 4. Five exact NEW advertisements cover the four Ariya grades. No exact NEW Lexus or Genesis advertisement was accepted. That is a bounded-search finding, not a nationwide stock absence claim.

The integration source is `lexus-nissan-genesis-evidence.json`. Keep `lexus-worker-evidence.json`, `nissan-worker-evidence.json`, and `genesis-worker-evidence.json` as the independent audit records. JSON contains exact URLs, dates, locators and snapshot hashes. `lexus-nissan-genesis-validation.json` checks all cross-references and hashes.

## Family and configuration mapping

### Lexus RZ: existing market family `lexus-rz`

Create distinct May 2026 Australian revision records with formal MY null:

- `lexus_rz_500_luxury_au_2026_revision`: RZ 500e Luxury AWD
- `lexus_rz_500_sports_luxury_au_2026_revision`: RZ 500e Sports Luxury AWD
- `lexus_rz_550_f_sport_au_2026_revision`: RZ 550e F Sport AWD

The August 2026 AU brochure is the principal technical source (proof L2026-023304). Do not replace the old RZ 450e epoch with these values. Current listings support `listed_unconfirmed`; a build/request-contact interface does not prove factory orders are accepted.

Technical import: 280 / 280 / 300 kW system power; declared 74.69 / 74.69 / 76.96 kWh; 460 / 460 / 437 km WLTP; 18 / 18 / 18.86 kWh/100km. These are exact current AU grade values. Battery net/gross basis is unspecified. All have 20-inch wheels, 22 kW three-phase AC and 522 L declared boot space. Maximum kerb weights are 2095 / 2105 / 2155 kg; GVM 2640 kg. Do not label maximum kerb weight as minimum or DIN/EU weight. No payload was inferred.

Current RZ brochure 28-minute DC time omits SOC endpoints. Keep `dc_10_80_minutes` null. May launch explicitly supports 150 kW DC for the 500e grades; 550e DC peak remains null in this packet because the detailed source found for that number is preliminary European material. Zero-to-100 and top speed also remain null for current AU grades rather than using overseas previews.

The 5.6 m turning value is tyre radius, not diameter. The 3.76 / 3.7 V battery values are cell-scale, not pack voltage. Per-motor 167 kW / 268.6 Nm values are not summable combined output/torque.

Grade distinctions: Luxury uses NuLux and 10-speaker Panasonic; Sports Luxury has Ultrasuede, 13-speaker Mark Levinson, HUD, dimming panoramic roof, radiant heaters, digital rear-view mirror and parking assist; F Sport adds steer-by-wire yoke, eight simulated gears, sport seats and aluminium pedals. The panoramic roof is specifically Sports Luxury only. Unconfirmed ventilation/heating details are null rather than inferred from a sibling.

September 28 price list: $84,500 / $91,000 / $104,920, AUD manufacturer list excluding on-road/statutory charges and options. F Sport's $104,920 supersedes May's $105,000. Do not use demo drive-away ads as these list prices.

### Lexus ES: newly found audit family

Add a battery-electric ES family, suggested market-audit ID `lexus-es-bev`, with:

- `lexus_es_350e_sports_luxury_au_2026_launch`: ES 350e Sports Luxury FWD
- `lexus_es_500e_sports_luxury_au_2026_launch`: ES 500e Sports Luxury AWD

These were absent from the starting inventory. The July 7 Australian launch and August 2026 AU brochure (proof L2026-023376) establish exact current local grades. Exclude ES 300h hybrid from BEV records. Formal MY stays null. Current listing is established; factory acceptance and exact NEW stock are unverified. July launch date is not MY, build date or delivery date.

Technical import: 165 / 252 kW system power; declared 74.69 kWh; 510 / 465 km WLTP; 16.4 / 17.9 kWh/100km; 22 kW AC / 150 kW DC; 517 L declared boot; maximum kerb 2180 / 2280 kg; GVM 2635 / 2735 kg; 21-inch 235/45R21 tyres. Cargo standard/load height is not supplied. Turning figure 5.918 m is tyre radius. ES350e motor maximum 167 kW is separate from total-system 165 kW. Keep total-system power in the main comparison field.

Both BEVs have semi-aniline accented seats, AVS with pitch/bounce control, 17-speaker Mark Levinson, HUD, two wireless phone chargers, front radiant heaters, panoramic roof and 14-inch centre display. ES500e adds AWD and Interactive Manual Drive. Positive feature values have exact locators; null is not absence.

Charging conflict: official press kit says 28 minutes at 10–80%; separate July launch release says 10–20%; current brochure says 28 minutes without SOC endpoints. Preserve all three and keep normalized 10–80 time null until reconciled. Do not silently fix a suspected typo.

Manufacturer list prices $77,000 / $84,000 before on-road/statutory charges and options. The earlier global reveal's approximate 685 / 610 km range is not Australian current range.

### Nissan Ariya: existing market family `nissan-ariya`

- `nissan_ariya_engage_63_my25`
- `nissan_ariya_advance_63_my25`
- `nissan_ariya_advanceplus_87_my25`
- `nissan_ariya_evolve_87_my25`

Formal MY25 is explicit in the manufacturer MY25 sheet and independent dealer labels. Current technical revision is August 2025 r2, not a new invented MY merely because the document changed. Current r2 changes kerb/GVM and wall-to-wall turning circle from the June sheet; use the current exact values and retain revision history.

63 / 63 / 87 / 87 kWh is explicitly usable. Power 160 / 160 / 178 / 290 kW; torque 300 / 300 / 300 / 600 Nm. Range 385 / 385 / 504 / 487 km indicative WLTP. Standard AC 7.4 / 7.4 / 7.4 / 22 kW. The 22 kW Advance+ charger is a factory option, not standard and not verified on the accepted stock ad. All DC peaks 130 kW; 10–80% approximately 35 minutes for 63 kWh or 40 minutes for 87 kWh using a 130 kW charger. Separate 50 kW durations are also recorded.

FWD cargo 466 / 1350 L and AWD 408 / 1280 L are seats-up/folded volumes to the roof. Do not compare silently with Lexus cargo measurements whose load height/standard is unknown. Current 11.5 m turning measurement is wall-to-wall circle, unlike the Lexus tyre radii.

Current October conditional maximum recommended drive-away offers: $42,990 / $44,990 / $51,990 / $60,990. Terms: participating dealers, private/ABN buyers, new and demo vehicles, while stocks last; buy October 1–31 and deliver by November 30, 2026; Government, Rental and National Fleet excluded; premium paint extra. Keep label/expiry alongside price. Do not treat campaign inclusion of demos as NEW-stock eligibility. Individual accepted NEW ads have their own prices and some have not adopted the campaign amount.

Historical launch MSRP $55,840 / $59,840 / $63,840 / $71,840 is stored separately; current MSRP is unknown. Reject manufacturer page $1 placeholders.

Stock: Westpoint 2959475 Engage; Macarthur 2962117 and Sutherland NI2955598 Advance; National Capital 142361 Advance+; Springwood 2968014 Evolve. All have exact public VIN/stock identity and NEW status. Moorooka N76217 is SOLD and rejected. Springwood 2107680 is demo, distinct from accepted 2968014. Sutherland immediate-delivery wording is a dealer claim only. All stock remains subject to recheck; no physical inspection.

Do not change `orderStatus` to `accepting_orders`: July 29, 2025 manufacturer orders-open is historical; current factory acceptance was not reverified. `stockStatus` can become `new_stock_listed` for the four evidenced grades while retaining `listed_unconfirmed` order status.

### Genesis: existing four market families

Use exact active Australian commerce MY rather than stale model-page metadata:

- `genesis_gv60_2027` → `genesis-gv60`: Advanced RWD MY27, 84 kWh, 168 kW / 350 Nm, 561 km WLTP
- `genesis_gv60magma_2027` → `genesis-gv60-magma`: Magma Performance AWD MY27, 84 kWh, 448 kW / 740 Nm normal; 478 kW / 790 Nm boost, 425 km WLTP
- `genesis_g80ev_2026` → `genesis-electrified-g80`: Signature AWD MY26 long-wheelbase 94.5 kWh revision, 272 kW / 700 Nm, 570 km WLTP
- `genesis_gv70ev_2025` → `genesis-electrified-gv70`: Signature Performance AWD MY25 revised 84 kWh specification

Active commerce model codes/selector and exact modelNameYear establish MY. GV60 spec-page metadata says 2026 and G80 says 2025; those metadata values are retained as conflicts, not allowed to override current active commerce identity. MY27 GV60/Magma/current G80 values must not be merged with outgoing AWD/Performance, 77.4 kWh or 87.2 kWh epochs. Some archived JSON is contaminated with current or petrol boilerplate, so existence of a legacy URL/isLatestModel flag is not enough.

Magma is current-listed rather than announcement-only because active AU MY27 commerce is corroborated by firsthand July 2026 Australian launch coverage. Neither this nor a deposit CTA proves current accepted factory orders. Manufacturer terms reserve interest subject to availability. All Genesis order status stays `listed_unconfirmed` and exact NEW stock unverified.

Current manufacturer stock API returns 12 petrol vehicles in every state query, zero BEVs in that snapshot. This does not establish nationwide BEV absence. GV60 has a freshly extended in-stock-new MY27 campaign through October 31, 2026; generic campaign text is not a VIN-level ad.

Main numeric holds:

- 350 kW is the test charger, not established vehicle DC peak. `dc_max_kw` stays null
- Magma 0–100: 3.6 s technical PDF versus 3.4 s brochure/hero, both boost; keep null
- Magma dimensions: PDF 4635/1940/1560 mm versus stale selector 4515/1890/1595 mm; keep canonical null and candidates explicit
- Magma/GV60 tare conflicts stay null; do not insert kerb mass instead
- GV60 Advanced V2L capability stays null: absent adapter/interior socket rows conflict with later exterior-connection text
- Magma 425 km is supported by current technical PDF/selector; commerce 470 km is a documented outlier
- G80 current 570 km / 5.1 s technical/current data supersede promotional 520 km / 4.9 s brochure values; old values remain preserved
- Do not import absent cargo volumes or sunroof/V2L power from older models or overseas data

Genesis calculator totals are illustrative NSW postcode 2000, private registration, zero-cost paint/interior, no paid accessories. They are not national RRP or exact-stock prices. Vehicle-price/GST/LCT fields vary by endpoint; preserve breakdown. The main `price_aud` is held rather than silently inserting pre-LCT manufacturer components. Examples: GV60 $96,285; Magma $141,014.98; G80 $168,758; GV70 $143,873. Do not compare them against Lexus before-on-road list prices without their basis.

## Warranty scope to preserve

- Lexus current private vehicle 5 yr/unlimited km; commercial 5 yr/160,000 km. Battery-defect base 5 yr with conditional annual extensions to 10 yr after health checks; capacity cover separate 8 yr/160,000 km below 70%, with operating/maintenance conditions. Original 2021 UX300e announcement offered different up-to-10-year/160,000 km capacity assurance: retain that historical epoch, do not impose the current eight-year page retroactively
- Nissan standard vehicle 5 yr/unlimited km, conditional Nissan-service-activated extensions up to 10 yr/300,000 km. EV capacity 8 yr/160,000 km against falling below nine bars; no verified percentage conversion and no independently established eight-year all-defect-battery promise. Ten-year extension does not extend capacity warranty
- Genesis private 5 yr/unlimited km, commercial 5 yr/130,000 km; HV battery 8 yr/160,000 km with below-70% SOH condition and exclusions. Component/paint/12V exceptions remain separate. Servicing and roadside are benefits, not blanket vehicle-warranty coverage

## Held / excluded scope

RZ600e EOI; TZ prototype; RZ450e legacy; early54.3 kWh UX300e versus updated72.8 kWh UX300e; LEAF MY23 usable39/59 kWh versus older declared40/62 kWh; global third-generation LEAF; Genesis archived MY24 GV60/77.4 kWh, prior G80 epochs and MY24 GV70; GV90 coming-soon.

For updated UX300e, official historical Australian NEDC is 560 km. Its press kit explicitly identifies 440 km WLTP as European and says the Australian model was not tested under WLTP. LEAF's MY23 WLTP figures are likewise European-spec indicative, while Australian NEDC is separate. Never turn these into local WLTP records.

## Integration and regression checks

1. Add ES BEV family/audit row and reconcile audit counts; do not duplicate hybrids or hidden inventory records
2. Match configurations by research ID/epoch, not marketing family name or build year
3. Import each fact's value, source IDs, locator, measurement basis and status together
4. Null conflict/unknown fields stay null when a fallback UI layer exists; test that sibling/prior-year defaults do not reappear
5. Keep all exact NEW ads tied to the correct grade, VIN/stock identity, observation date and price basis
6. Preserve explicit archived/pending records outside current eligible results; make no `accepting_orders` upgrades in this workstream
7. Validate source paths and hashes from the JSON, including the clearly labelled Lexus web-extraction snapshots. Do not claim those are original PDF byte snapshots
8. Keep ranking/market-leadership assertions disabled; exact comparison fields do not establish a complete market census
