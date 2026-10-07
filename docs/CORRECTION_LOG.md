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
