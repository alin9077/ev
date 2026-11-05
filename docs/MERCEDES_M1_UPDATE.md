# Mercedes-Benz M1 working update
15 October 2026. Working progress; M1 is not complete.

## What changed for a buyer
- Eleven exact Mercedes versions have sourced strengths and trade-offs; ten are currently listed for sale. The electric GLC remains provisional
- Three published braked-towing figures now count correctly: EQA 250+ at 0 kg, and EQA/EQB City Editions at 750 kg. All remain Reported and unranked; confirm the delivered vehicle rating before relying on them
- The City Editions’ 35- and 32-minute charging figures stay visible. Their charge windows are unknown, so neither counts as a 10–80% time or gains a rank
- A completed evidence review now counts separately from whether a figure fills the required measurement. Mercedes passes the grading check, with 158/170 core cells filled and twelve gaps. Its model census, core coverage and ranking targets remain open

## Current coverage
| Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |
|---|---|---|---|---|---|---|---|---|---|
| 304 | 82.9% / 33.6% | 89.5% / 60.9% | 98.4% / 76.0% | 78.9% / 39.1% | 89.8% / 69.1% | 84.9% / 67.1% | 98.0% / 93.8% | 99.7% | 6.9% |

Figures are % filled / % Confirmed. Warranty means vehicle warranty. “In rankings” means inclusion in all six lists, not their average. Listings do not prove physical stock or accepted orders.

Research completed: BYD, GAC, Geely, IM, Jaecoo, Kia, MG, Tesla, Toyota, Zeekr. No brand yet meets all six completion criteria.

Research remaining (46): ACE EV, Abarth, Alfa Romeo, Audi, BMW, CUPRA, Cadillac, Chery, Chevrolet, Deepal, Denza, Fiat, Ford, GMC, GWM, Genesis, Honda, Hyundai, Isuzu, JAC, Jaguar, Jeep, KGM, LDV, Leapmotor, Lexus, Lotus, MINI, Maserati, Mazda, Mercedes-Benz, Nissan, Polestar, Porsche, Renault, Roev, Subaru, Suzuki, Tembo, Volkswagen, Voltra, Volvo, XPENG, ZERO Automotive, smart, Škoda.

C1 is open: 80 exact current model lists reviewed, but no independent whole-market lists reconciled; 24 unmatched models and 27 unresolved leads remain. Mercedes has 24 current-version/model/lead dispositions open. Globally, C1–C5 remain open; C6 passes. All 409 catalogue versions are preserved, including 332 Tier 1 versions.

The correction accounts for 27 existing reviews across seven brands: 4,787/5,168 core cells are reviewed, and strict gaps fall from 431 to 428. All ranking memberships are unchanged.

## Phone screenshots
No new layouts or screens were added; the availability wording was corrected to Current listing. No new phone screenshots or current real-device mobile pass are available.

## What did not work
The complete six-file test command below passed 83 tests, then the grading file exhausted its JavaScript heap. The failed attempt is preserved:

```sh
node --max-old-space-size=448 --max-semi-space-size=1 --import tsx --test --test-concurrency=1 tests/m1-coverage-tracking.test.ts tests/brand-updates.test.ts tests/coverage-reports.test.ts tests/m1-evidence-grading.test.ts tests/discovery.test.ts tests/availability-ranking.test.ts
```

One authorized retry of the unchanged file passed all 15 tests:

```sh
node --max-old-space-size=512 --max-semi-space-size=1 --import tsx --test --test-concurrency=1 tests/m1-evidence-grading.test.ts
```

Both runs were sequential and bounded to 900 seconds plus ten seconds to stop. These 98 passing test results are separate from the earlier 214 Mercedes test results. Changed-file lint, fresh structural validation and the complete coverage command passed; all 102 report changes were checked. Current full-suite, standard TypeScript, production-build and real-phone checks remain open. The original Model Y hero and nine selling points are unchanged; M2 and publication have not started.

## Decisions needed
None for this continuation.

Next: Leapmotor.
