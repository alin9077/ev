# Monthly refresh runbook

How to keep one brand's facts inside their freshness windows. The unit of work is **one brand**, producing **one dated packet** in `data/m1-brand-updates/`, one findings file in `data/changes/findings/`, and one commit. The "What changed" page (`/changes`) is generated from the result; nobody writes it by hand.

Rules that bind every step (from `docs/plan/EXECUTION_PLAN_2026-11-04.md` section 2 and `docs/DOT-BRIEF-103.md` section 5):

- **No value from memory, news or dealer pages.** Every value you record comes from a page you opened on the date you record. Use the official source URL already in the packet's `sources[]`, or the maker's official Australian page for that model.
- **Never estimate.** A derived figure is labelled "derived" with its inputs. Nothing derived goes into a packet fact.
- **Never edit `au_ev_all_variants_2026-10-06.json`** or an existing packet. A refresh is a *new* packet; earlier packets stay as they are.
- **Ageing never removes a value or a card.** If you cannot recheck a claim, its value stays and its date stays.
- **Do not bypass bot protection.** If a site shows a Cloudflare challenge or a CAPTCHA, stop on that page, record it as `blocked`, and move on.

## Cadence

Refresh in the **first five working days of each month**, in sales order (`docs/M1_BRAND_ORDER.md`), **top 14 brands minimum**: BYD, Tesla, Geely, Zeekr, Omoda Jaecoo, Kia, MG (with IM), Hyundai, Toyota, Volkswagen, Volvo, GWM, GAC, BMW. Price, offer and availability claims go amber after 45 days, so a month-start refresh keeps every one of them fresh through the following month-end. Lexus and the remaining Tier 1 brands follow when the top 14 are done.

This runbook is the whole of the cadence. Nothing is scheduled, nothing runs by itself, and no automation touches data. A reminder may be set up only if the owner asks for one.

## Environment

Node 22 or later, pnpm 11.19.0 (the version in `package.json`), `pnpm install --frozen-lockfile`. Loading the catalogue takes about one to two minutes on a modern laptop, so each command below pauses before it prints. Use `NODE_OPTIONS=--max-old-space-size=6144` if a command is killed.

## Steps for one brand

Replace `BYD` with the brand and `2026-11-06` with the day you are working.

### 1. See what is due

```bash
pnpm report:stale --details --as-of 2026-11-06
pnpm refresh:plan --as-of 2026-11-06 --brand BYD
```

`report:stale` is the existing read-only report. `refresh:plan` groups the same claims by brand in sales order and, for each claim, shows the version, field, current value and basis, the source URL(s) on record, and the days until the claim goes stale (zero or negative means already stale). The default horizon is 45 days, so a refresh done on 6 November also covers everything that would age out before the next refresh.

Price-like claims appear three ways: the maker price (`price_aud`), extra offer or driveaway facts (`promotional_driveaway_aud` and similar), and an equipment row called `driveaway_price`. The equipment row is **projected from the price facts by the loader**; you never edit it. Refreshing the price fact refreshes the row.

### 2. Create the findings file

```bash
pnpm refresh:scaffold --brand BYD --as-of 2026-11-06 --out data/changes/findings/byd-2026-11-06.json
```

The scaffold lists **every current on-sale Tier 1 version of that brand** and, for each, **all 17 core fields**, the due extra claims, and the availability record. Each line has `"outcome": "pending"` and carries the current value, grade, date and source URLs so you can see what you are checking. It reads the catalogue and writes only the file you name.

### 3. Recheck each due claim at its source

For each claim marked `"due": true` (and for any other core field the page shows differently), open the source URL. Record exactly one outcome:

| Outcome | When | What you fill in |
|---|---|---|
| `unchanged` | The page shows the same value on the same basis. | `sourceIds` of a source you list under `sources[]` (URL, title, publisher, `accessed_date` = today). |
| `changed` | The value or the basis differs. | `value` (and `basis` / `comparisonBasis` / `unit` only if they changed), `sourceIds`, and a one-line `note` saying what the page shows. |
| `unavailable` | The page is gone, empty or will not render. | A `note`. **Nothing else.** The value stays and the date stays: write "source unavailable, value retained, date unchanged". |
| `blocked` | A Cloudflare challenge, CAPTCHA or login wall stops automated reading. | A `note` naming the page. Do not try to get round it. Treated like `unavailable`. |
| `pending` | Not checked. | Nothing. It is listed in the build report as unchecked. |

A **rechecked-unchanged** claim gets a new check date and a new `gradeReview` pointing at today's source; its grade does not change because the source did not change. A **changed** claim must still earn its grade: a maker configurator or list price is Confirmed (price rung 1–4); a publication's figure is Reported (rung 5+) and needs `"buyerGrade": "reported"` and a `publisher`.

For availability, record `unchanged` (same order status, new date and source) or `changed` with the new `availability` state (`current_or_order_listed`, `outgoing`, `announced_provisional`, `not_current`), `orderStatus` and `stockStatus`. "Orders open" is never "in stock".

A version the maker no longer lists is a `changed` availability to `not_current`; a version the maker lists that the catalogue lacks is **not** a refresh: record it under `newVersions[]` in the findings file with the page URL, so it can be added through the normal brand-update route and noted in the work log. The changes page will pick it up from the diff once it is in the catalogue.

If a clause of a version's written strength or trade-off depends on a value that **changed**, the builder stops and asks for replacement wording (`summaryOverrides[variantId]`). It will not reuse text that may quote the old figure.

### 4. Build the packet

```bash
pnpm refresh:build --findings data/changes/findings/byd-2026-11-06.json --out data/m1-brand-updates/byd-2026-11-06.json --register
```

The builder reads the findings and the current effective catalogue and writes a complete packet: sources, version guards, `before`/`after` facts, availability corrections and re-issued summaries. `--register` appends the packet to `data/m1-brand-updates/registry.json` (registry order is chronological and explicit). It prints an account of every claim: rechecked unchanged, changed, left alone and why. It refuses to write a packet that the catalogue loader would reject.

### 5. Check

```bash
pnpm validate
pnpm report:stale --details --as-of 2026-11-06 --days 45
```

`validate` loads the catalogue and applies every packet; any guard failure names the version and field. Then confirm the brand's price, availability and driveaway claims no longer appear in the stale report for the window you intended. At the end of a refresh cycle, run the full rule 5 sequence (`validate`, `typecheck`, `lint`, `test`, and `build` plus `test:e2e` if UI changed), with `NODE_OPTIONS=--max-old-space-size=6144`.

### 6. Commit

One commit per brand: the findings file, the packet, the `registry.json` line. Message: `WS2 refresh: BYD (2026-11-06) — N rechecked unchanged, M changed, K not rechecked`.

## After the last brand: the changes file

```bash
pnpm refresh:snapshot --out data/changes/snapshots/2026-11-after.json
pnpm refresh:diff --before data/changes/snapshots/2026-10-before.json --after data/changes/snapshots/2026-11-after.json --month 2026-11 --out data/changes/2026-11.json
```

`diff.ts` is the only thing that writes `data/changes/<YYYY-MM>.json`, and it validates the result against `data/changes/schema.json`. A change is exactly one of: `price_changed`, `price_added`, `price_removed`, `version_added`, `version_withdrawn`, `availability_changed`, `range_changed`, `warranty_changed`. A claim that was rechecked and found unchanged produces **no entry**, but its date is updated in the next snapshot. The `/changes` page, `/changes.json` and `/changes/feed.xml` read this file; there is nothing else to edit.

The "before" snapshot is the one taken at the end of the previous month's cycle (or, for the first cycle, taken before the first November packet was added). Keep snapshots; they are small.

## Known limits of the builder (found in the first run, 5 November 2026)

These are cases where `refresh:build` correctly refuses or where the claim cannot be rechecked from a page. Record them as `unavailable` with the reason; do not work round them.

- **Equipment rows named `driveaway_price`** are projected from a price fact that carries a driveaway basis (`price_aud` on a Driveaway basis, `promotional_driveaway_aud` or `published_driveaway_aud`). A legacy row that reads "Request a current driveaway quote" has no such fact behind it, so rechecking the page cannot re-date it. It stays amber until a driveaway price is added through a normal brand update.
- **Versions with configuration evidence** (GWM ORA 5 was the first) bind that evidence to the exact `price_aud` fact. Re-dating the fact breaks the binding unless the packet also carries a `configurationUpdates` row. The builder does not generate those; the loader error is "configuration dependency changed or unearned". Record `unavailable` and raise it as a normal brand update.
- **A price that depends on a postcode or state form** (BMW, Volvo, Lexus and Toyota driveaway estimates, Zeekr model switching) is not rechecked: entering a postcode is a form submission. Re-read only what the page shows without it, and say so.
- **An offer whose recorded window has ended** (`validUntil` in the past) is rechecked only against a page that restates the offer and its new window. Use `changed` with the same value, the new `conditionExplanation` and `validUntil`. A page that no longer shows the offer is `unavailable`.
- **A basis the page does not state.** If the maker page shows the same figure but no longer says whether it is before or after on-road costs, do not re-affirm the recorded basis: record `unavailable` with the conflict. GAC's AION UT page, which described the listed figure as a drive away price while the catalogue holds it as an MSRP, was the first case.
- **Dealer advertisements and secondary reports** are not rechecked: dealer pages are not an allowed source and a news article is not the maker's page.

## What to put in the work log

For every refresh, record in `docs/plan/STATUS.md` (or the month's log): brands refreshed, brands not refreshed and why, every claim with outcome `unavailable` or `blocked` (version, field, URL, what you saw), and any version the maker lists that is missing from the catalogue.

## Why the steps are in this order

Packets are applied in registry order and each `before` state must match the effective state at that point, so a refresh packet is built against the catalogue as it is *now* and appended last. Building two refresh packets for the same brand in parallel will fail the second one's guards; do one brand at a time.
