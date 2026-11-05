# Roadmark 103 M0

13 October 2026 UTC. Coverage date: 14 October in Australia/Sydney. M0 code and data checks pass; future-clock browser and phone proof remain unverified. M1 has not begun.

## 1. What changed for a buyer

- Cars and their figures stay visible when evidence ages, with checked dates and ageing labels
- Prices and availability use a 45-day freshness window; technical figures use 180 days; dimensions, seats, towing and warranty terms use 365 days
- Older figures remain available but leave ranked groups; strengths and trade-offs follow the freshness of the facts they use
- Coverage and upcoming-expiry reports now expose the remaining gaps by version and brand

## 2. Coverage report

Baseline from `pnpm report:coverage --as-of 2026-10-14`:

| Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |
|---|---|---|---|---|---|---|---|---|---|
| 260 | 25.0% / 15.4% | 83.5% / 29.2% | 82.7% / 31.5% | 64.2% / 14.6% | 77.3% / 59.6% | 71.2% / 15.4% | 85.4% / 10.0% | 99.6% | 0.0% |

Cells are % filled / % Confirmed. Warranty means vehicle warranty; “In rankings” means eligible in all six required lists. These are existing grades, not completed M1 regrading. Listings do not prove physical stock. All 345 catalogue versions are preserved; 268 are Tier 1.

Brands done: none demonstrated against all six criteria. Brands remaining: 57. C1–C5 remain open; C6 passes at this report date. There are 1,140 core-fact gaps and 31 unresolved Tier 1 leads. Full brand names, individual reasons and grade splits: `m0-coverage-2026-10-14.md` and `m0-coverage-details-2026-10-14.txt`.

C1 models without a matched version (26; sale eligibility still needs reconciliation): Audi Q4 e-tron and Q4 Sportback e-tron; BMW i3 and iX4; CUPRA Tavascan; GMC Hummer EV SUV, Hummer EV Pickup and Sierra EV; LDV MIFA 9, eT60 and eTerron 9; Mercedes-Benz EQV and eVito Tourer; Polestar 5; Volvo EX60; ACE EV Yewt / Mini Yewt; Chevrolet Silverado EV; Ford F-150 Lightning; JAC T9 EV / T9EV; MG MGU9 EV; Roev HiLux conversion; Tembo Tusker; Leapmotor B03X; Maserati GranTurismo, GranCabrio and Grecale. Two independent published model lists have not yet been reconciled.

## 3. Three screenshots

Desktop changed regions, not phone-width proof:

- Discovery cards: `candidate103-discover-changed-region.jpg`
- Catalogue cards: `candidate103-cars-changed-region.jpg`
- Detail facts: `candidate103-detail-key-facts-region.jpg`

## 4. What did not work

`pnpm test` passed all 853 tests with no failures or skips (exit 0, 503.2 seconds). Typecheck, lint and structural validation also passed. All 407 frozen code, data and test inputs still match the tested files.

The 1 December data simulation retains all 345 cards. Tier 1 technical rankings still contain 72 range, 19 DC-time, 151 seating, 28 boot and 56 towing entries; stale prices remain visible but none are ranked. This verifies data behaviour, not a future-clock browser session. Details: `m0-coverage-clock-2026-12-01.md`.

The baseline homepage reproduced native Error 9; no fix is claimed. Browser restrictions and the existing frame policy blocked phone-width captures. Real-device, future-clock browser and production-build checks remain unverified: `candidate103-visual-qa-report.md` and `baseline102-capture-report.md`.

One working-source ZIP is under 15 MB; historical material is preserved in a separate one-time archive. No publishing occurred.

## 5. Decisions you need to make

No decision is needed to start M1 under the brief. Tier 1 data completion is next; phone testing and release approval remain outstanding.
