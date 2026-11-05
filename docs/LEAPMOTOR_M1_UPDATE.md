# Leapmotor M1 working update
15 October 2026. M1 remains in progress.

## What changed for a buyer
- Ten exact Australian versions have sourced facts, strengths and trade-offs, including four added versions: two B03X grades, C10 AWD Sports+ and a separately advertised residual MY25 C10 Design
- B03X and AWD Sports+ show “Order open or arriving”. B03X’s November timing is expected dealership arrival; physical stock and customer delivery remain unconfirmed
- Prices retain their published on-road bases. Unknown-basis maker MSRP stays visible separately; secondary prices and unresolved towing comparisons remain unranked
- Published 30–80% charging times stay labelled. Exact 10–80% times remain Not published after two-source searches

## Current coverage
From the fresh registered normal coverage report:

| Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |
|---|---|---|---|---|---|---|---|---|---|
| 305 | 84.9% / 33.4% | 89.5% / 61.0% | 98.4% / 78.0% | 78.7% / 41.3% | 91.8% / 68.9% | 84.9% / 69.2% | 100.0% / 95.7% | 99.7% | 6.9% |

Cells are % filled / % earned Confirmed. Warranty is vehicle warranty; “In rankings” means inclusion in all six lists. Total: 413 catalogue versions, 336 Tier 1; 4,832/5,185 on-sale core cells reviewed and 401 strict gaps.

Research completed: BYD, GAC, Geely, IM, Jaecoo, Kia, MG, Tesla, Toyota, Zeekr. No brand meets all six completion criteria. Research remaining (46): ACE EV, Abarth, Alfa Romeo, Audi, BMW, CUPRA, Cadillac, Chery, Chevrolet, Deepal, Denza, Fiat, Ford, GMC, GWM, Genesis, Honda, Hyundai, Isuzu, JAC, Jaguar, Jeep, KGM, LDV, Leapmotor, Lexus, Lotus, MINI, Maserati, Mazda, Mercedes-Benz, Nissan, Polestar, Porsche, Renault, Roev, Subaru, Suzuki, Tembo, Volkswagen, Voltra, Volvo, XPENG, ZERO Automotive, smart, Škoda.

C1 remains open: 84 current model lists reviewed; no complete independent whole-market lists reconciled. The 23 unmatched models are Audi Q4 e-tron; Audi Q4 Sportback e-tron; BMW i3; BMW i5; CUPRA Tavascan; GMC Hummer EV SUV; LDV MIFA 9; Mercedes-Benz EQV; MINI Countryman; ACE EV Yewt / Mini Yewt; Chevrolet Silverado EV; Ford F-150 Lightning; GMC Hummer EV Pickup; GMC Sierra EV; JAC T9 EV / T9EV; LDV eT60; LDV eTerron 9; Roev HiLux electric conversion; Tembo Tusker; Maserati GranTurismo; Maserati GranCabrio; Maserati Grecale; Mazda CX-6e. There are also 27 unresolved leads. Leapmotor’s four current cohorts cover nine versions; residual MY25 C10 membership remains open. Its C3/C4/C6 pass, with seven strict charging-window gaps.

## Phone screenshots
Three fresh phone screenshots and current mobile verification are unavailable. No UI layout change was applied; the original Model Y hero and nine selling points are unchanged.

## What did not work
A strict serialization check first stopped on existing optional undefined feature fields; an exact-path diagnostic resolved the verification boundary. A later staged run timed out at 180 seconds; the reviewed bounded run passed. The relevant eleven-file test run passed 264 tests but one child was SIGKILLed without completed subtest results or assertion-error details. Its unchanged isolated retry passed 1/1, giving 265 passing relevant tests across separate runs; the failed aggregate and unestablished cause are retained.

Fresh structural validation, complete normal coverage and changed-file lint passed. Current full-suite, standard TypeScript, production-build and real-device checks remain open. This is working M1 progress, not a new milestone delivery.

## Decisions needed
None for this continuation. Next: Mazda. M2 still requires the user’s go-ahead.
