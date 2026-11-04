# Roadmark remaining market evidence reconciliation

As of 10 October 2026. Research reconciliation for deciding the next work, using the existing project evidence. The application and frozen lead records were read only. No runtime imports, tests, builds, dealer contact or new web research were performed.

## Main finding

The 152 frozen lead groups are not 152 missing currently available models. Several are historical epochs, editions, future releases or unresolved aliases; a few have materially stronger evidence elsewhere. More importantly, the lead list does not capture the entire remaining workload: substantial existing market-audit families still have no detailed catalogue representation, and some packet-level leads never reached the central ledger.

The market remains unclosed. Detailed catalogue coverage, current Australian sales evidence, exact technical identity, road approval and physical stock are separate questions. Unknown formal model years remain unknown. No recommendation below turns a technical listing, configuration control, supplier claim or historical delivery into accepted orders or independently verified stock.

## Reproducible snapshot counts

- Application source files contain 296 configurations across 129 model/generation rows: raw 34/11 plus additions 262/118. The inventory reports 126 detailed families. No runtime recount was performed.
- Market inventory: 231 audit records and 152 frozen lead groups. Lead classes: 31 passenger, 5 van, 7 ute, 20 truck, 23 bus, 63 motorcycle, 3 other
- 116 market records carry a detailed/partial-detailed coverage marker; 115 do not. These are marker counts, not 116 complete models or 115 necessarily eligible additions. The original ten detailed families sit outside this additions audit

| Class | Market audit rows | Detailed coverage marker | Without that marker |
|---|---:|---:|---:|
| passenger | 106 | 84 | 22 |
| van | 19 | 13 | 6 |
| ute | 13 | 2 | 11 |
| truck | 27 | 5 | 22 |
| bus | 27 | 7 | 20 |
| motorcycle | 39 | 5 | 34 |

The separate JSON contains all 152 original lead IDs, evidence pointers, an advisory disposition and the next evidence needed. Its categories are work-planning advice only. The original inventory statuses remain untouched.

## Stale tracking that can be narrowed from existing evidence

### XPENG New G6

The frozen lead asks whether four current configurator identities exist. The later exact Australian configurator audit establishes **three MY26 powertrains**: Standard Range RWD, Long Range RWD and Performance AWD. R18/R20 are wheel choices, and Black Edition is a Performance package. The three-row G6 scope is already integrated under `xpeng-g6` and `xpeng_g6_my26`.

Reconcile the lead to that existing record instead of researching or importing four powertrains again. Keep SR 20-inch range distinct from 18-inch range, and preserve the stock-to-technical-epoch limits for SR/LR. Source: `geely-zeekr-xpeng-evidence.json#/new_configurations`, report section “XPENG New G6”, [current Australian configurator](https://store.xpeng.com/au/configurator/New_G6R).

### BCI Fleetmaster EV

The older-brochure-only warning is superseded by the later live Fleetmaster page and its link from the current Classmaster category. Fleetmaster is specifically a **Classmaster mining derivative**, not an independently established new chassis family. The seven-row bus integration did not include this optional derivative.

A bounded derivative is supported for later integration review, with current orders, specific New stock, delivered payload and full sale-contract warranty still unverified. Source: `yutong-bci-electric-buses-evidence.json#/bodyOptions/13` and `bus-integration-boundaries.md`, “Fleetmaster derivative”; [current Fleetmaster page](https://bcibus.com.au/ev-ranged-buses/classmaster-ev/fleetmaster-ev/). Keep at most one named derivative relation, not an extra body plus chassis count.

### Leapmotor B03X

The frozen interest-only lead coexists with a later same-ID market record containing **Style and Design LR**, based on the 6 October Australian announcement. Expected dealer arrival is November. This is a future-only audit record, not proof of current delivery or a reason to add duplicate detail rows.

Source: `leapmotor-evidence.json#/records`, `market-inventory-2026-10-10.json#/records/230`; [Australian announcement](https://www.media.stellantis.com/au-en/leapmotor/press/leapmotor-b03x-australia-s-most-affordable-all-electric-suv-arrives-from-29-990-drive-away).

### Lexus RZ 600e and BMW grouped leads

RZ 600e is no longer merely an unexplained product mention. The 28 September announcement provides the exact F Sport Performance identity, nine planned Australian examples, Q4 arrival and EOI. It remains an announced scope under RZ, with formal MY and actual supply unproved. Source: `lexus-worker-evidence.json#/excluded_or_pending_models/0`; [Lexus announcement](https://www.lexus.com.au/news/2026/09/lexus-australia-to-launch-ultra-exclusive-rz-600e-f-sport-performance-flagship).

The BMW additional-variants group is only partly open: iX3 40 has been integrated. i5 M60 Touring and i7 M70 remain retained technical listings with current orders/New stock unconfirmed; new i7 60 xDrive remains Q4-announced, and iX3 M60 has 2027 order timing. Preserve these separate scopes. Sources: `bmw-worker-evidence.json#/retained_listing_records` and `#/announced_future_records`.

## Bounded holds are already useful answers

These leads are not blank research:

- Audi MY27 Q6/SQ6 SUV/Sportback have announced H1 2027 scope. Current MY26 technical data and future pricing are not interchangeable (`audi-electric-worker.json#/announced_future_records`)
- Audi Q8/SQ8 body pages explicitly stop factory ordering. Residual New vehicles require fresh unit-specific evidence; a range-index link or pre-owned listing is insufficient (`audi-electric-worker.json#/held_configuration_records`)
- CUPRA Born is explicitly unavailable to order/sold out on the reviewed AU page. Born VZ/local residual New remains separate (`vw-skoda-cupra-evidence.json#/model_gaps`)
- Deepal S05, Denza Z9GT, Honda Super-ONE, Zeekr 7GT and the upcoming Mercedes grouped models remain EOI/coming-soon scopes. Mazda CX-6e has a stronger explicit preorder status, which still does not establish deliveries. The GLC technical table does not override the coming-soon campaign
- Mercedes Trucks eActros 400/600 are expressly not yet available in Australia in the saved local source. Windrose Mega 960 is a 2028 roadmap item. Keep these separate from current eActros 300/E700 families
- Energica Ego+/EsseEsse9+ and Segway E110S have local sold-out evidence. It is a scoped seller finding, not nationwide extinction or a legal conclusion
- Benzina Zero “Buddy” is an apparent name false positive from travel-buddy copy for the V-10 kick scooter, not a supported road motorcycle model (`motorcycle-local-source.json`)

The per-lead original URLs and exact inventory JSON pointers are preserved in the companion ledger. No fresh nationwide absence claim is justified. Isuzu D-MAX EV withdrawal is only secondary reporting in this material; preserve that attribution rather than treating it as primary manufacturer closure.

## Duplicate and alias controls

### Established relationships

- XPENG R18/R20 and Black Edition: wheel/package scopes, not additional powertrains
- BCI Fleetmaster: named Classmaster derivative
- LEKI E1 Surge Racing Red: colour edition with free nonbinding waitlist
- Savic Alpha/Delta: legacy trim naming under C-Series, separate current grade supply not established
- Stark VARG EX Factory Edition: same EX family; MX Factory sold-out state cannot transfer to EX
- Kawasaki MY24/MY25 e-1 evidence: older epochs of existing Ninja e-1/Z e-1 families, not new families
- LDV eT60 “22 km WA” lead: an unresolved stock advertisement for the existing eT60 family, not another model
- ACE Cargo/Yewt/V1 group: Yewt already has an audit record; Cargo and V1 remain separate open scopes

### Possible relationships that must not be blindly merged

- Nexport ZE-B 86/106/125 versus current NexGen ZE-B: supplier code/body relation unresolved
- Scania 25P versus the existing battery-electric truck family: current sales-code applicability unresolved
- Volvo BZL articulated versus BZL: local unveiling is established, exact family/configuration/order relation remains open
- WYLD RRR/RRRR and TG/TGG: title/menu discrepancies require exact model and wheel/road classification
- Global Energica Experia/Eva Ribelle names overlap existing AU audit records, but global brand continuity does not establish resumed Australian supply

Cross-file identity also needs explicit mappings when reconciling coverage: `farizon-supervan` to market `farizon-sv`; eVito detail to `mercedes-benz-evito-panel-van`; `leapmotor-b10`/`c10` detail to market `leapmotor-b10-bev`/`c10-bev`; and `polestar-4-coupe` detail to market `polestar-4-coup`. These are observed existing catalogue/market identity mappings, not reasons to duplicate records.

## Ready evidence and genuine unfinished research

### Existing evidence should be used before another broad search

1. **Denza D9, GAC AION UT/V and smart #1/#3/#5:** 15 bounded configurations across six existing market families already have source/proposal/candidate artifacts. This is pending integration work, not 15 missing research projects. Denza alone has explicit manufacturer MY26; GAC/smart manufacturer MY remains null. GAC seller-MY26 New ads are a separate epoch; smart equipment fitment status remains unclassified. smart #5 has advertised orders plus announced November delivery, not completed deliveries. Use `denza-gac-smart-integration-boundaries.json` and `remaining-denza-gac-smart/evidence.json`, with the candidate/runtime review owned separately
2. **Volkswagen ID. Buzz MY26:** four bounded current configurations have captured equipment and two exact MY26 Pro New advertisements. Three are passenger Buzz configurations and one is Cargo; Cargo MY25 already exists. No newly complete technical/rankable records were established. The four-row packet needs its guarded integration review, not another generic model search (`remaining-volkswagen-evidence.json`, `remaining-volkswagen-integration-boundaries.json`)
3. **Ford Transit City:** an explicit MY27 local technical/equipment packet and primary expected November-delivery date are already available. It remains a pre-delivery offering; the old “November only from secondary reporting” gap is stale. Source: `ford-vans-epoch-followup.json`; [Ford brochure](https://www.ford.com.au/content/dam/na/ford/en_au/nameplate/transit-city/2026/overview/2027-my-transit-city-specs-08-sep.pdf)
4. **Mercedes eSprinter:** the three current-family body rows and three future-effective technical references are already separated in `mercedes-next-vans-worker.json`. The optional MWB D03 high roof is not another powertrain. A safe bounded family/body presentation can use this work, but current exact MY, roof-specific range/mass, price and New stock remain genuine holds. The currently linked MY2026 brochure is effective November 2026 production and cannot certify an October vehicle
5. **Volvo trucks:** nine named Australian axle/body platforms across six families plus one separate older FM advertised-New item are documented. **Zero closed Australian exact factory builds** were established. Preserve family envelopes and page-only pairings outside exact variant/ranking fields. This packet is ready for an audit/platform presentation, not nine extra exact build rows (`volvo-electric-trucks-evidence.json`)
6. **Fleetmaster / BCI Citirider / Yutong U18:** use the existing bus boundary report. Fleetmaster supports a named derivative; BRS8 is a technical aftersales epoch without commercial build binding; U18 has current local technical evidence but remains audit-only. Do not undo the narrower seven-base-row admission

### Passenger priorities requiring fresh targeted work

The most actionable unchecked or incompletely checked current-offer candidates are Mazda 6e, GWM ORA hatch versus ORA 5 SUV, Jeep Avenger, Alfa Romeo Junior, Ford Mustang Mach-E, Suzuki e VITARA, Lotus Eletre/Emeya and Maserati Folgore's three body families. Exact current local trim/body/MY, equipment and price evidence should come first; apparent current marketing alone still does not prove orders.

Suzuki needs territory-aware evidence: the current national site excludes Queensland/northern NSW distribution territory. Do not claim a national price from one distributor. The inventory contains the direct sources for each of these model scopes.

BMW i3 and iX4 already have family-level current range cards but were outside the previous BMW detailed audit; iX5 is also named in that packet's out-of-scope leads and is not centrally represented. These warrant a specific current Australian BEV identity/supply check, not an inferred trim matrix from names.

CUPRA Tavascan, Audi Q4 and Mercedes EQB/EQE/EQS SUV/Maybach are **known bounded blockers**, not unresearched blank families. Tavascan MY25.5 technical references cannot become MY26 data; the reviewed MY26 New ads contain demo-condition conflicts. Q4 MY25/MY26 residual and MY27 future scopes must remain separate. Mercedes legacy technical listings need current exact sale/New evidence; the combined five-family lead was already split deliberately.

A dedicated residual-New pass remains necessary for Fiat/Abarth 500e, Jaguar I-PACE, Volvo EC40/C40, standard Hyundai IONIQ 6, LDV MIFA 9 and the legacy scopes identified in Lexus/Nissan/other packets. Do not treat old brochures or low-mileage used/demo listings as new supply.

### Vans and utes

- Ford E-Transit Custom has two named official body/grade offerings, but MY26.50 live 71.45-kWh data conflicts with the reported MY27.25/March-2027 change point. Exact VIN/build battery/range/charging applicability remains open. Full-size E-Transit retains current-MY and roof-mass holds; its older MY23.50 sheet is not current certification (`ford-electric-vans-manufacturer.json`, `ford-vans-epoch-followup.json`)
- e-Transporter has family-level technical evidence and a partial New ad, but no exact current-MY local configuration matrix. Its former configurator route now falls back to the model overview; that is inconclusive, not sold-out evidence (`remaining-volkswagen-evidence.json`)
- Mercedes EQV and eVito Tourer are not closed by the eVito panel/eSprinter packet. Exact EQV grade/order scope and Tourer seating/epoch remain open
- Skywell EC11, BYD T3, eT60 and MIFA 9 need current exact residual-New evidence. EC11 E-Cargo versus E-Crew should be cross-checked with bus scope
- Pioneer/DFSK EC35, Victory EC1 van/truck, ACE, Joylong/JMEV and IVECO eDaily still need current local complete-new-road-vehicle supply/approval evidence. Trials, stale planned-release pages and global products do not close them
- Tembo Tusker has a current complete-vehicle sales/delivery history, but its body/drivetrain/battery matrix is unresolved. Tembo EUV kits, Voltra and ZERO mining conversions are different supply categories
- Silverado EV, Hummer Pickup/SUV, Sierra EV and F-150 Lightning need independent importer/new-donor, current supply, exact technical and VIN-specific road-status treatment. AUSEV's saved suspension notice must survive; neither remanufacture nor old launch intent is evidence of new current allocation. Rivian, Cybertruck and Riddara remain unproved local-new-road offerings

### Trucks and buses

The existing truck census includes 27 market families but only five have detailed-coverage markers. The Volvo packet closes some family/platform research, while exact build selection remains a genuine boundary. Priority current local families without detailed rows include eActros 300/eEconic, Scania, SANY, Sitrak and Windrose E700. Foton eAUMAN C/D and eAUMARK S and JAC N55/N75/N90 already carry exact/future/historical holds; do not overwrite them with generic “current” flags.

Bus coverage is seven bounded detail families out of 27 audit rows. Remaining current local offering candidates include ARCC, BYD B70/BC12B1, Challenger Electric Low Floor, Custom Denning Element, Foton, King Long, Nexport, Scania and Volvo. Exact body/chassis identity, complete-vehicle versus platform count, order status and applicable state/road approvals remain unclosed. BLK's “electric” choice still needs explicit BEV configuration evidence. BYD brochure-only variants, BusTech/SEA/Ebusco continuity and Higer/Golden Dragon/Optare-Switch/Avass/Zhongtong discovery gaps remain material.

For commercial vehicles, a public-source boundary is sometimes the real endpoint. An AU order/configuration sheet or vehicle-specific quotation may be needed to close cab, wheelbase, battery, axle and completed-body applicability. This audit does not authorize contacting sellers; it identifies the evidence needed.

### Motorcycles and scooters

The claim “not yet screened” is stale: the census already contains 39 model-audit records, 63 lead groups and explicit exclusions. Only five Segway/ZEEHO families currently have detailed catalogue coverage. The remaining 34 audit families include actual Australian advertised-new/order routes, listings with uncertain supply and a subscription EOI, so they should not be lumped into one missing-research count.

Prioritize exact current-source detail for the locally advertised road families: Kawasaki e-1, Zero LS1, BMW CE 04, Can-Am Origin/Pulse, FONZ, FTN, Savic, LEKI, Benzina Zero, Stark EX/SM, KTM Freeride E, Surron road variants, Talaria road variants and UBCO. Preserve the differing strength of each market record; this list is not a claim that each is currently orderable.

Resolve explicit local NEW condition and road configuration before deep specification work for Super Soco CPX/TC Max, NIU contradictory competition/road listings, EMoS/WYLD legacy listings, Caofen distributor scope and Streetdog 80 residual units. Global-only Yadea, Gogoro, Piaggio, LiveWire and similar names can remain discoverable holds until an Australian seller/importer route appears. A tyre-fitment page, AU locale, seat, LAMS mention or general ADR claim alone does not establish a current new road offering.

Existing off-road exclusions (Zero XB/XE, UBCO Work, Stark MX, Surron Light Bee off-road siblings, Talaria off-road variants and kick scooters) remain exact-variant exclusions. No approval transfer from a road sibling is permitted.

## Gaps hidden outside the 152 lead groups

These existing research findings need searchable audit pointers, not automatic catalogue admission:

- **Yutong U18:** current July-2026 AU sheet; order/state-exemption/technical-error hold (`yutong-bci-electric-buses-evidence.json#/auditOnlyRecords/2`)
- **Volvo FL 14t LFP:** HVIA reports a local purchase offering; first-party Australian specification/order closure missing. Do not import overseas 145/176-kWh values (`volvo-electric-trucks-evidence.json#/holds`, `fl-14t-lfp-au-launch`)
- **Volvo FH and FH Aero 6x4 rigids:** current-page-only pairings, outside the jointly corroborated nine-platform subset (`#/additionalPageOnlyPlatforms`)
- **BMW iX5:** current range-page name, outside the detailed BMW assignment (`bmw-worker-evidence.json#/out_of_scope_leads`)
- **XPENG L03:** announced Q4 Australian sale plus interest-only current page; G9/P7/P7+ remain global-only scope (`geely-zeekr-xpeng-evidence.json#/excluded_or_pending_models`)
- **Nissan LEAF third generation and legacy:** no final AU third-generation programme or qualifying legacy residual New unit established (`nissan-worker-evidence.json#/excluded_or_pending_models`)
- **Lexus TZ / legacy UX300e and RZ450e, Genesis GV90:** global prototype, legacy or coming-soon scopes already documented separately (`lexus-worker-evidence.json`, `genesis-worker-evidence.json`)

The inventory's own unresolved-universe list additionally names Rolls-Royce Spectre/Black Badge, Dongfeng/Nammi, JAC E30X, Skywell, Seres, NIO, VinFast and Changan. No bounded closure for these categories was found in the reviewed specialist packets. They need local new-road-sale discovery or an attributed exclusion, not overseas-spec imports. Broad low-volume-import and new-versus-retrofit scope remains open.

## Tracking text that should eventually be reconciled

No edits are proposed to the frozen historical records themselves. A separate current reconciliation view can supersede stale wording while retaining its provenance:

- “Motorcycles not yet screened” contradicts the completed bounded motorcycle census and five detail integrations
- “Every entry has stockStatus unverified” contradicts the later advertised-New evidence; physical stock is still independently unverified
- Notes saying 229 model records lag the actual 231-row inventory
- Fleetmaster's older-brochure-only warning, the blank G6 trim question and B03X's duplicate lead/record need linked current dispositions
- Farizon F3E has three detailed rows; retain only the genuinely unclosed complete build-matrix issue rather than implying no primary configuration work exists
- Several discovery buckets contain multiple model families while some leads describe only an edition or a single advertisement. A “lead group” count cannot measure model completeness

## Suggested next sequence

1. Finish separately controlled Denza/GAC/smart and Volkswagen guarded integration work; use the existing packets instead of another broad research pass
2. Create a non-destructive current-reconciliation overlay for the identified stale links and omitted packet-level holds; retain frozen history and separate model/epoch/edition/stock identities
3. Run targeted research on high-confidence Australian current-offer passenger gaps, alongside detailed local motorcycle families and current heavy-vehicle sales/build matrices
4. Pursue the residual-New and specialist-import/road-approval questions as dedicated tasks with exact acceptance criteria
5. Claim completeness only after supplier/manufacturer discovery, all lead dispositions, complete-versus-platform relationships, local road eligibility and meaningful current-supply boundaries are explicitly reconciled. This audit has not reached that point

## Evidence and reproducibility

Primary URLs above are the existing packets' sources checked on 10 October, not refreshed in this reconciliation. Local report references are relative to `roadmark-research/`; application references are under `roadmark-work/roadmark/data/`. The JSON manifest records SHA-256 for the exact three application inputs and 26 inspected source packets. Original census names cited only within historical inventory records are not claimed to have been separately recovered or revalidated.

The companion JSON is a work-planning ledger. It does not mutate market status, ranking eligibility, model year, catalogue identity or frozen evidence. It contains every original lead ID exactly once.
