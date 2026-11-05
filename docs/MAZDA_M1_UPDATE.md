# Mazda M1 update — 15 October 2026

## 1. What changed for a buyer
- Four existing Mazda versions now have refreshed prices, all 17 core figures, and a strength and trade-off. No versions or equipment claims were added.
- Driveaway-from prices are A$52,990 for 6e GT and A$56,990 for CX-6e GT from public maker offers; A$55,990 for 6e Atenza and A$59,990 for CX-6e Azami are NSW configurator prices. They are labelled separately from before-on-road prices.
- Both CX-6e versions remain visible as “Order open or arriving”. Current maker evidence supports preorder advertising, not physical stock or accepted factory orders.
- Conflicting boot figures, the 6e towing-footnote uncertainty and secondary acceleration figures stay visible with their qualifications and outside rankings. No battery-health retention threshold is invented.

## 2. Fresh coverage report

| Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |
|---|---|---|---|---|---|---|---|---|---|
| 303 | 85.1% / 33.7% | 89.4% / 62.0% | 98.3% / 78.5% | 78.5% / 42.2% | 92.4% / 69.3% | 86.1% / 69.6% | 100.0% / 95.7% | 100.0% | 6.9% |

Figures are filled / Confirmed. Warranty means vehicle warranty; “In rankings” means eligible in all six required lists. All 413 catalogue versions and 336 Tier 1 versions remain. On-sale falls 305→303 because the two CX-6e preorders now sit outside that denominator, not because cars were removed. Percentage movements therefore mix refreshed evidence with this scope correction.

Mazda’s two on-sale versions have all 34 core cells filled and reviewed: 24 Confirmed, 8 Check and 2 Reported. All four Mazda versions have current-list membership recorded in two maker-family reviews. These are not the two independent whole-market lists required to close C1. Residual new MX-30 stock remains unresolved.

Research complete: BYD, GAC, Geely, IM, Jaecoo, Kia, MG, Mazda, Tesla, Toyota and Zeekr. 45 brands remain; none yet meets all C1–C6 criteria. Overall: 8/17 core fields meet their fill target, 4819/5151 on-sale core cells are reviewed, and freshness passes. C1–C5 remain open.

C1 still has 22 unmatched audit models and 27 unresolved leads. Models: Audi Q4 e-tron/Q4 Sportback; BMW i3/i5; CUPRA Tavascan; GMC Hummer SUV/Hummer Pickup/Sierra EV; LDV MIFA 9/eT60/eTerron 9; Mercedes-Benz EQV; MINI Countryman; ACE Yewt/Mini Yewt; Chevrolet Silverado EV; Ford F-150 Lightning; JAC T9 EV; Roev HiLux conversion; Tembo Tusker; Maserati GranTurismo/GranCabrio/Grecale. Their current Australian sale eligibility still needs reconciliation. Full brand and gap lists accompany this report.

## 3. Phone screenshots
No new phone screenshots were captured. This was a data and validation update; the current hero and interface were unchanged.

## 4. What did not work
The first staging check failed on “Hatchback” versus the retained “five-door hatchback” identity. That review wording was corrected; the targeted regression and complete stage passed. Fresh structural validation and normal coverage passed; coverage exactly matches the accepted stage.

The initial targeted test run had 229 passes and 3 failures: two stale null-value assertions and an unexplained buyer-availability file failure. Separately, the corrected safety file passed 7/7 and the unchanged buyer file passed 11/11. Four-file lint passed. These are separate outcomes, not a full-suite pass; the earlier file-failure cause remains unknown. Full TypeScript checks at 512 MiB and 640 MiB both ran out of memory. Boot/towing rankings and whole-market closure remain unfinished.

## 5. Decisions needed
None for this Mazda update. M1 remains in progress; no M2 work or publishing is proposed.
