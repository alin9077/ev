# Correction log

2026-10-06: Original automotive records preserved byte-for-byte. Added implementation-only display guards for Model Y L software count, unknown feature text, conditional facts and publication-issue propagation. No research verification dates changed. No automotive source was freshly verified by the build.

## 6 October 2026 — feature and presentation refinement

Added a separate primary-source research overlay (nine sources) without modifying the supplied snapshot. Corrected Tesla manual wording for V2L, clarified FSD/Grok and garage scope, rechecked Sealion digital-key/motor evidence, and resolved the ATTO 3 EVO numeric specification document hold. Remaining source conflicts stay qualified. See `REFINEMENT_RESEARCH.md`.

Added six short buyer-priority chapters, a keyboard/touch detail carousel, and numbered footnotes with return links. Added a reproducible self-contained root `index.html` and a matching `/index.html` server entry, sharing the existing application components and research adapter.

## 6 October 2026 — inline comparisons and operating details

Moved all 18 specifications and 48 feature criteria from the detail carousel onto the homepage and comparison overview. Added chapter anchors, persistent desktop vehicle headings, labelled mobile cells and inline software history. Removed the carousel; source footnotes still return to the originating claim.

Added `research-usability-2026-10-06.json`: 12 source records and 99 variant/feature clarifications. Confirmed Sealion ANCAP trim applicability and documented operating limits, distinguished memory presets from full profiles, clarified Tesla activation/eligibility conditions, checked the regular Zeekr trim matrix and expanded shared Supercharger usability notes. Unconfirmed software behaviours remain explicit. Converted existing structured warranty objects into readable figures without modifying the original evidence. Full source lineage is validated after display overlays.


## 6 October 2026 — ten-family swipe view

Replaced the homepage pair selector with synchronized cards for the Model Y baseline and nine alternative families. Tesla remains separate in every row; swipe, mouse, keyboard and button navigation move all chapters together. Added per-family trim selection and refreshable fleet URL state. Kept all 66 detail rows and source footnotes inline, plus the existing focused comparison route.

Added contextual explanations to conditional labels on cards, feature rows and specification facts. Original source qualifications and unresolved evidence are preserved. No automotive claims or verification dates were promoted in this presentation pass.

## 6 October 2026 — wayfinding visual design

Rebuilt the homepage visual system from the supplied Aicher and wayfinding moodboard: sky blue, large typography, open comparison columns, fine rules, and an A–F chapter index with original pictograms. Only the Model Y baseline has an enclosing card. Chapter letters and colours remain attached to the same subjects when priorities reorder the sections. Updated the shared masthead and type palette, compact mobile layout, focus controls and swipe-position indicator. Preserved all research content, conditional context, footnotes, trim selection and synchronized swipe behaviour. The root and served standalone HTML are regenerated from the same components.

## 6 October 2026 — automated-driving hero

Made automated driving the opening hero and chapter A. Its first comparison contains the vehicle selectors and full evidence for Full Self-Driving / advanced assistance; standard assistance, remote parking, automatic gear selection and traffic-light alerts follow. Moved these five criteria from their former chapters without duplicating or dropping any of the 66 comparisons. Price, range and the other topics now follow in chapters B–G. Priorities reorder only the following chapters, keeping automated driving first.

Rechecked Tesla's Australian FSD support page for the hero's active-supervision note, linked through the existing `r3_tesla_fsd` footnote. While inspecting the new hero, corrected the adapter so a shared software-history issue does not append Model Y L FSD activation warnings to unrelated vehicles' advanced-assistance and Summon entries. Original research records, feature verification states and vehicle-specific source conditions remain intact.

## 6 October 2026 — price-first comparison

Made Price & ownership chapter A and Automated driving chapter B, with both positions fixed. Fresh visits default to Model Y Premium RWD; explicit shared-link trim selections remain respected. Replaced the driving-led hero with a neutral Model Y comparison headline. Preserved all seven original illustrations, associating each with its subject, and all 66 inline comparisons.

Added a separately sourced January–September 2026 Australian EV sales note. The existing catalogue covers nine of the sales top ten plus ATTO 3; ATTO 1 is absent. The hero therefore says “Australia’s leading EVs” rather than claiming exact top-ten coverage. Original research records remain unchanged.


## 7 October 2026 — content completion pass

Reviewed every homepage cell for all 34 variants. Before this pass 433 feature cells and 84 specification cells had no value, and 75 more carried a gap inside a longer value. `data/research-completion-2026-10-07.json` now supplies a sourced value for each: 513 feature rows, 84 specification rows and 48 new source records. `pnpm audit:content` lists any cell that still lacks a value and currently reports none. The supplied research JSON is unchanged; `scripts/build-completion-overlay.py` regenerates the overlay.

Evidence read in full text: the Australian owner's manuals for Kia EV3 and EV5, BYD SEALION 7, ATTO 2, ATTO 3 and both ATTO 3 EVO handbooks, and the Zeekr 7X manual; the Australian specification sheets for those models plus Geely EX5 and Jaecoo J5 EV; Tesla's Australian manual, shop, configurator and FSD support pages; and ANCAP's register. Copies and extracted text are in `qa/research/2026-10-07/`.

How open cells were closed:

- **Feature absent from a complete Australian document** (358 rows): shown as not offered, naming the document. Examples: no walk-away locking, Pet Mode or parked recording in the Kia and BYD manuals; no rear seat heating on EV3, ATTO 2, EVO or J5.
- **Feature found** (47 rows): for example Kia pack density from published energy and battery weight, EV3 V2L at 3.68 kVA, Zeekr position memory and mirror folding, Tesla motor types.
- **Value from a non-primary or overseas source** (86 feature rows, most specification rows): marked conditional with the basis stated. This covers Tesla battery capacities, Kia charging peaks, EV3 and SEALION 7 folded cargo volume, the Zeekr AWD frunk, and the whole EV3 GT-Line AWD record, which uses GT-Line equipment because Kia's sheet still lists four FWD grades.
- **Figure the manufacturer does not publish**: the cell says so. This applies to battery density for Tesla, BYD, Geely, Zeekr and Jaecoo; Tesla 10–80% charge times; Model 3 folded cargo volume; the entry Model 3's battery and charging peak; EV5 Standard Range charging peak; and ATTO 3 Essential charge time.

Corrections to earlier records: Tesla Summon is shown as not yet available in Australia rather than unverified. Model Y L towing is 1,588 kg with four or fewer occupants (1,043 kg with six). Model 3 Performance and the on-sale Geely EX5 Extended Range cars are not rated to tow. ANCAP has no ATTO 2 or Jaecoo J5 rating. ANCAP lists the 2022 ATTO 3 rating for all Australian variants without naming EVO, so EVO stays conditional. The EV3 GT-Line AWD is not assumed to share the FWD ANCAP rating.

## 7 October 2026 — editorial pass

Every comparison cell was rewritten so each row uses one wording pattern across all 34 variants. `data/research-editorial-2026-10-07.json` (generated by `scripts/build-editorial-overlay.py`) is applied last and replaces the displayed value, status and note of all 1,632 feature cells; it keeps each row's sources and evidence date. Earlier research files are unchanged.

- **Raw research structures removed** (129 cells): values such as `vehicle years: 6; vehicle km: 150000` and `adaptive cruise: Listed in research` are now sentences.
- **Repeated caveats moved to the row**: charge-window, peak-rate, WLTP, ANCAP-protocol and Supercharger-app notes appear once under the row heading (`rowNotes` in `src/lib/chapters.ts`) instead of on every card. Inheritance and hardware boilerplate sentences are gone.
- **Status follows the car, not the evidence trail**: a feature fitted to a grade is Standard; Conditional is kept for settings that are off by default, reported-only behaviour and unconfirmed coverage.
- **Trim-specific answers**: grade-dependent equipment (Kia Air/Earth/GT-Line, BYD Dynamic/Premium, Geely Complete/Inspire, Zeekr RWD/Performance) states what that grade has.
- **Duplicate rows**: the homepage no longer shows the storage summary beside the three cargo rows, and "Warranty and servicing" became "Servicing" because the warranty terms have their own rows.
- **New figures** (marked conditional, EV Database European records): Model Y RWD and Long Range AWD and Model 3 RWD 10–80% charge times; Model 3 RWD usable capacity (60 kWh) and DC peak (175 kW); Model 3 folded cargo (977 L). Other Tesla grades show the 24–28 minute range for comparable versions. Zeekr 7X ANCAP sub-scores (91/87/78/78) were added from ANCAP.
- **Still unpublished**: battery density outside Kia, the Kia EV5 Standard Range DC peak and the outgoing ATTO 3 Essential charge time.
- **Update history**: run-together words repaired, researcher instructions removed, and category and evidence labels shortened.


## 8 October 2026 — citable-pages launch audit

All 32 buyer sources previously read as search summaries were attempted. Full text was retrieved for 22; 10 remained inaccessible. See `data/source-audit-2026-10-08.json` for each URL, attempt date and outcome. Original snapshots are unchanged; `src/lib/launch-evidence.ts` applies display corrections.

- Tesla service-centre count: the opened ScrapeHero page now reports 21 as at 21 August 2026, rather than 17 in April 2025.
- Jaecoo alerts: removed unsupported restart-persistence wording. Geely's profile shortcut is labelled as a recall control, not permanent disabling.
- Zeekr consumption: the cited European review does not contain the claimed WLTP numbers; the numbers and derived yearly costs are withheld.
- Model 3 Performance battery: the cited article concerns a Canadian RWD model, so the Australian Performance chemistry claim is withheld.
- Zeekr cable inclusions: the source describes the first-thousand-customer launch offer, not later-order inclusions.
- Model Y L: a five-seat battery article cannot establish six-seat chemistry; an expo demonstration is not proof of child-restraint compatibility.
- FBT: removed categorical future eligibility claims; proposals and verified law remain distinct.
- Licensed third-party driveaway and weight figures are withheld pending maker evidence or permission.
- AAA range: retained as a qualified historical result for an April 2025 test car, not a test of every current Premium RWD. Its page returned no readable result text on recheck.
- Additional checks: opened the EV Database Model Y Long Range AWD page (27-minute 10–80% estimate, European record), Compare the Market's March 2026 insurance table and CHOICE's January 2026 brand benchmarks. Dates and driver profiles remain attached.

## 5 November 2026 — recheck of the nine sources still marked unavailable (WS7.2)

Each of the nine URLs in `data/source-audit-2026-10-08.json` with status `unavailable` was requested again on 5 November 2026 (access date for every row below) with a plain HTTP client, and the returned text was compared with what the site cites the source for (`supports` field in `data/research-buyer-2026-10-07.json`). Eight pages loaded and were read; one is blocked. **No site data, display text or audit status was changed by this entry.** `data/source-audit-2026-10-08.json` remains the record of the 8 October attempt, and `tests/citable.test.ts` still pins the 8 October list of nine. Where a page is now readable, promoting its claims back from "withheld" is a separate, reviewed data change; the notes below say what the page does and does not support. No replacement URL was invented.

| Source ID | URL (as recorded) | Accessed | Outcome | Notes |
|---|---|---|---|---|
| `b7_ato_lct` | https://www.ato.gov.au/tax-rates-and-codes/luxury-car-tax-rate-and-thresholds | 2026-11-05 | **Recovered** (HTTP 200, ATO page "Last updated 1 June 2026") | Table row 2026-27: fuel-efficient vehicles $91,661, other vehicles $80,809. Matches the figures the site cites. The page covers the LCT thresholds only; it does not establish the FBT exemption cap or the May 2026 Budget proposals that the novated-lease rows also rely on (those use other sources). |
| `b7_geely_launch` | https://www.mynrma.com.au/open-road/news/2025/geely-ex5-launches | 2026-11-05 | **Recovered, partly supports** (HTTP 200) | Page states a seven-year/unlimited-km vehicle warranty, an eight-year/unlimited-km high-voltage battery warranty and "up to seven years of roadside assistance". It does **not** say roadside assistance depends on servicing inside the Geely dealer network; the site's condition "applies while the car is serviced within the Geely dealer network" is not supported by this page. |
| `b7_tesla_mobile` | https://whichcar.com.au/car-news/tesla-expands-mobile-servicing-australia-wide | 2026-11-05 | **Not recovered from the original URL.** HTTP 403, Cloudflare "Just a moment..." challenge | Not bypassed. A third-party Internet Archive capture (captured 7 January 2026, under `www.whichcar.com.au/news/...`) was readable: it is an old Tesla launch-era article saying owners can have their cars serviced at home or work by a Tesla technician, and that more than 80% of repairs can be done without visiting a service centre. It supports "mobile technicians at home or workplace" only as an old, third-party-archived statement. Still unverified for today; a current Tesla Australia service page should replace it, and none has been located or cited here. |
| `b7_byd_network` | https://www.mynrma.com.au/open-road/news/2026/byd-targets-shorter-service-waits | 2026-11-05 | **Recovered** (HTTP 200, dated 27 September 2026) | Confirms about 120 sales and service sites, about 30 more by the end of 2026, about 200 by early 2027, and service waits targeted at four to five days. The retrieved text does not mention a 20,000 m² Melbourne parts warehouse (that part of the `supports` note is unconfirmed; the site's displayed text does not use it). |
| `b7_kia_isla` | https://tynan.com.au/blog/kia-australia-responds-to-customer-feedback-with-new-speed-limit-warning-feature | 2026-11-05 | **Recovered** (HTTP 200, dated 18 September 2024; a Kia dealer's blog, not Kia) | Confirms a long press of the steering-wheel mute button disables the audible speed-limit warning, rolled out by over-the-air update first on the facelifted Sorento and EV9, with other models later by dealer update or OTA. It does **not** name the EV3 or EV5. The site's EV5 row correctly tells buyers to check their car has it; that caution should stay. |
| `b7_kia_adas` | https://web1.goauto.com.au/kia/kia-says-it-won-t-adjust-adas-stance/2025-04-11/96137.html | 2026-11-05 | **Recovered** (HTTP 200, dated 11 April 2025) | Quotes Kia Australia's product planning manager that speed-limit warnings must default on or the car would breach ANCAP policy and "wouldn't be a five-star car, under 2023 and beyond protocols". Matches the cited claim. |
| `b7_geely_driven` | https://thedriven.io/2025/08/07/geely-ex5-review-electric-suv-is-great-value-for-money-and-not-just-a-distraction | 2026-11-05 | **Recovered** (HTTP 200; the server redirected the request to `http://`, same path; review dated 7 August 2025) | Confirms the reviewer was warned "Driver distraction detected" while watching the road and "driver's face not detected" with reflective sunglasses. One reviewer, one car, at launch; the site already words this as "an earlier review". |
| `b7_gridly_chem` | https://www.gridly.com.au/blog/lfp-vs-nmc-battery-australia | 2026-11-05 | **Recovered, but the page has changed** (HTTP 200; now shows 21 July 2026, "Updated: 2 November 2026") | Confirms "Tesla's Australian guidance for LFP vehicles is to leave the charge limit at 100 per cent and fully charge at least once a week". It is a commercial blog and cites no Tesla page; Tesla's own owner's manual or support page would be the primary source. It was revised after the 7 October citation, so the 7 October wording cannot be assumed to be what the page said then. |
| `b7_gridly_cable` | https://www.gridly.com.au/blog/ev-charging-cable-australia | 2026-11-05 | **Recovered, but the page has changed and one statement conflicts** (HTTP 200; now shows 18 July 2026, "Updated: 27 October 2026") | Confirms no mainstream brand includes a Type 2 to Type 2 public-charging cable and that inclusions vary. It says Tesla stopped including the Mobile Connector "in 2024"; the site's Model Y row says July 2022 (from the separate `b7_tesla_cable` source). The two dates conflict and neither was resolved here; the Tesla cable date should be checked against a Tesla primary page before either is relied on. |

Summary: 8 pages readable and broadly supporting what they are cited for (2 with unsupported parts: `b7_geely_launch` conditions, `b7_byd_network` warehouse), 2 of those pages changed after citation (`b7_gridly_chem`, `b7_gridly_cable`, with a Tesla cable date conflict), and 1 not recovered (`b7_tesla_mobile`, bot-challenge). Follow-ups for the owner or WS2, not done here: decide whether to move recovered rows out of `unavailable` in the audit file (this would change the test's pinned list and any withheld claims), find Tesla primary pages for the service and cable claims, and note that the 8 October entry above says "10 remained inaccessible" while the audit file lists nine.
