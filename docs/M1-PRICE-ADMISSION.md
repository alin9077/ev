# M1 retained-price admission

Policy date: 13 October 2026. This pass reuses evidence already held; it does not claim a new web check.

## Buyer change

The price ladder now selects the highest supported rung for the exact version. It admits named-version configurators, national and state driveaway amounts, Australian publication reports and dealer advertisements. Every selected amount keeps its original check date, source citation, price basis and relevant conditions.

Across all 268 existing Tier 1 records, numeric canonical prices rise from 69 to 171, a lift of 102 versions. This denominator includes existing residual and arriving records; `report:coverage` separately measures the on-sale subset. No new versions were added in this price pass.

Only two comparable price bases are used: before on-road costs and driveaway. Unresolved tax/on-road amounts remain visible without a rank. Reported and dealer prices are always unranked. A state quote keeps the state in its label; multiple state observations are retained separately, with a labelled NSW example preferred rather than selecting the cheapest state.

## Preserved evidence and protections

- The original research snapshot, source registry and old price facts are unchanged
- Dated overlays select 137 reviewed observations, each pointing to its original exact-value evidence record
- Full reviewed fact and source state guards stop an old overlay overriding a later correction or changed source
- Published amounts are copied unchanged; no before-on-road/driveaway conversion, dealer-delivery subtraction, option summing or sibling-price inheritance
- Offer start/end dates and version scope are checked; expired GWM and Suzuki campaign observations are not revived
- Old mixed citation bundles now identify the actual price source, including CarExpert for Geely EX5 and GoAuto for Model Y L

## Remaining gaps

97 existing Tier 1 versions still have no admissible current exact-version amount in the held evidence. Their reasons are listed in `data/price-ladder-review-2026-10-13.json` and the dated candidate overlays. Common causes are empty configurator totals, historical launch prices unbound to the current configuration, a campaign for a different version, expired or uncaptured terms, and a dealer record without a numeric price. No missing price is filled with an estimate.

Examples: BMW's Sport Collection offer is not attached to an M Sport version; Porsche's equipment placeholders and older launch prices are not treated as current totals; the MINI API's unchanged gross from-price is shown while the previously derived, rounded amounts are not promoted.

## Checks and maintenance

22 price and price-presentation behavioral tests pass. They cover rung ordering, version scope, offer expiry, state labels, uncertain bases, original-value provenance, source/correction drift, duplicate sources, lower-tier exclusion, idempotent application, mixed/unknown scene bases and expired offers. The broader scene suite also passes; price-scene geometry parity is unchanged. External packet prices retain their own original price basis rather than inheriting an unrelated null target template. TypeScript and focused ESLint checks pass.

`python scripts/extract-price-ladder.py` deterministically reproduces the existing-fact candidate overlay. It does not automatically refresh the reviewed guards. A changed candidate/fact/source must be reviewed before the guarded admission can be renewed. `node --import tsx scripts/audit-price-ladder.ts` prints the before/after audit and one-line gap reasons. The main coverage report is the milestone completion authority; this pass alone does not satisfy M1's full C1–C6 targets.
