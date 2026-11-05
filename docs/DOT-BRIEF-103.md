# Roadmark: brief for checkpoint 103 onward

From the owner, 13 October 2026.

Resume from checkpoint 102 exactly as you delivered it. I made no source edits, so there is nothing to reconcile. This brief sets the direction from here. Where it conflicts with `docs/ROADMARK_GOAL.md`, the 102 handover, or older checkpoint notes, this brief wins.

Two documents are attached that you have not seen before: `EV_BUYER_JOURNEYS.md` and `DOT_IMPLEMENTATION_HANDOFF.md`. They were written on 11 October against the original 34-variant site and never reached you. Milestone 3 below uses them.

---

## 1. Where checkpoint 102 stands

I had 102 reviewed independently against the original source. What you built is a real step up: 345 exact versions across 150 families, written strengths and trade-offs for 333 of them, like-for-like attribute rankings, comparison without a forced Model Y, per-claim sources, and the original design language kept intact.

It is not yet useful to a buyer, for six reasons. The numbers come from the 102 data files.

1. **Most cars have no price.** Of the 229 passenger versions you added, 50 show any price. 24 of the 38 passenger brands you added have no priced version at all, including Audi, BMW, Mercedes-Benz, Porsche, Polestar, Volvo, MINI and Leapmotor. The prices exist publicly; the admission rule rejected them (configurator prices, "from" prices, state driveaway prices).
2. **Facts are graded too harshly.** Of 28,698 added facts, 12% are `standard`, 65% are `conditional` and 21% are `not_verified`. Roughly four in ten of the conditional ones are conditional only because the model year or delivered build is unconfirmed. Vehicle warranty has a value on 191 passenger versions and is `standard` on none. Seats is missing on 59.
3. **The site will empty itself in early November.** Summaries and rankings disappear when evidence is more than 30 days old, measured against the visitor's clock. 28,311 facts are dated 10 October. From about 6–10 November every "why consider it" card and every ranking goes blank.
4. **Cards omit what people scan for.** No price, no range figure, and the same generic outline for 140 of the 150 families. Each card repeats the same two disclaimers.
5. **Effort went to the edges.** The last three checkpoints covered cargo trikes and evidence fields on held records, while 14 passenger models and 11 of 13 utes in the market audit still have no versions in the catalogue.
6. **The buyer journey is missing.** There is no top navigation, the phone homepage is about 46,700 px tall, and nothing helps a buyer narrow down by need or leave with a plan.

Separately, the process is heavier than the product. The working source needs three attachments, 28 test files only pin old checkpoints' bytes, and the reports are hard for me to read.

---

## 2. The goal

> A person choosing a new EV in Australia can, on their phone and in a few minutes, see every car they could buy with its price and the numbers that matter, understand what each is good at and what it gives up, narrow to two or three, and leave with a list of what to confirm before signing.

One principle changes how you work:

**A labelled number beats a withheld number.** Honesty means showing the best available figure, saying where it came from and how sure we are. It does not mean hiding the figure until it is beyond doubt. A buyer who sees "A$52,990, maker's configurator price, checked 10 Oct" is better served than one who sees "Needs confirmation".

Everything stays traceable. What changes is what you admit and how you show it, not the record of where it came from.

---

## 3. Priority tiers

Work strictly in this order. Do not start a lower tier while a higher one is short of its targets.

| Tier | Vehicles | Treatment |
|---|---|---|
| 1 | Passenger cars, SUVs, people movers, utes | Full depth. This is the product. |
| 2 | Vans and light commercials a small business buys | Full depth, after Tier 1 is complete and released. |
| 3 | Trucks, buses, motorcycles, scooters, trikes | Keep what exists as a plain directory behind a filter. No new research until I ask. |

The default view everywhere shows Tier 1 only. Tier 2 and 3 are one filter away and never mixed into the default list.

---

## 4. Definition of complete for Tier 1

"Complete" means all six of these are true and shown in the coverage report (section 8).

- **C1 Every model.** Every passenger car, SUV, people mover and ute that a private buyer can order new from a manufacturer or official importer in Australia is in the catalogue with its full current version list. Prove closure by reconciling against at least two independent published model lists and listing every difference with a reason.
- **C2 Core facts filled.** For every on-sale Tier 1 version: price 100% (any rung of the ladder in 5.1), and at least 95% for each of range, battery size, DC peak power, DC 10–80% time, AC charging power, seats, boot volume, 0–100 km/h, motor power, drive type, length/width/height, braked towing, vehicle warranty and battery warranty. Each gap carries a one-line reason.
- **C3 Grades are earned, not defaulted.** After regrading under section 5, report the split per core fact. Do not chase a quota. If any core fact is under half Confirmed, explain the pattern.
- **C4 Every version has a strength and a trade-off.** No "Evidence first: worth checking in detail" placeholders in Tier 1.
- **C5 Rankings are populated.** Range, price, charging time, seats, boot and towing rankings each include at least 90% of on-sale Tier 1 versions, grouped by measurement basis.
- **C6 Nothing is out of date at release.** No Tier 1 fact is past its freshness window (5.4).

---

## 5. Evidence rules I am authorising you to change

### 5.1 Price ladder

Show the highest rung available, with a short basis tag and the checked date.

1. Maker's list price before on-road costs (MLP, MSRP, RRP).
2. Maker's national driveaway price.
3. Maker's configurator or "from" price for the named version.
4. Maker's state-specific driveaway price. Tag the state.
5. Price reported by a reputable Australian motoring publication or price guide. Tag "reported by X".
6. Dealer advertised price. Tag "dealer ad". Lowest rung.

Rank prices in two groups only: before on-road costs, and driveaway. Never convert one into the other or apply an offer that the page does not state for that version.

### 5.2 Grading

Use four buyer-facing grades, mapped onto your existing statuses.

| Grade | Meaning | Shown as |
|---|---|---|
| Confirmed | Maker's current Australian material for this named version | Plain figure |
| Check | A real, specific condition changes the figure: an option pack, wheel size, or a different measurement method | Figure plus a small mark; condition on tap |
| Reported | From a secondary source, or carried from a sibling version | Figure in muted style with source tag |
| Not published | Looked for and not found | "Not published", and it goes on the dealer checklist |

Regrade under these rules:

- "Model year unconfirmed" or "delivered build may differ" is no longer a per-fact condition. It becomes one standing note in the methodology and one line on the detail page.
- A generic lab-test disclaimer (WLTP is a laboratory figure) is a standing note, not a condition.
- Brand-wide terms (vehicle warranty, battery warranty, roadside assistance) are entered once per brand from the maker's Australian warranty page and inherited by every version, as Confirmed.
- Body dimensions, seats and boot volume that the maker lists for the whole range apply to every version of that body, as Confirmed.
- Secondary sources are allowed at the Reported grade when the maker does not publish. Facts only; do not copy their prose.

Rankings admit Confirmed and Check values on the same measurement basis. Reported values are shown in the list but unranked. State how many versions were left out and why in one line.

### 5.3 Availability

Three buyer-facing states: **On sale now**, **Order open or arriving** (with the date if stated), **Not confirmed**. Keep the detailed evidence states in the data. Stock claims stay as honest as they are now.

### 5.4 Freshness

Nothing disappears because of age alone. Ageing changes the label and ranking eligibility; it never blanks a card.

| Fact type | Fresh for | After that |
|---|---|---|
| Price, offers, availability | 45 days | Shown with "checked on" date in amber; unranked |
| Range, battery, charging, performance, equipment | 180 days | Same |
| Dimensions, seats, towing, warranty terms | 365 days or until a model-year change | Same |

A strength or trade-off stays visible while the facts it depends on are fresh.

### 5.5 Still not allowed

Inventing or estimating a published figure. Presenting a dealer ad as a maker price. Claiming physical stock from a listing. "Best in Australia" wording before C1 passes. After C1 passes you may write scoped superlatives such as "Longest range of the 240 passenger EVs we track, October 2026".

---

## 6. Milestones

Deliver one milestone at a time. Each ends with a report (section 8) and waits for my go-ahead, except M0 into M1.

### M0 Stop the clock and lighten the load (first session)

- Replace the 30-day disappearance with the freshness rules in 5.4.
- Add `pnpm report:coverage` (section 8) and `pnpm report:stale`, which lists what ages out in the next 30 days, by brand.
- Repackage: working source in one attachment under 15 MB. Move recovery folders, proposal and snapshot files, and the `checkpoint*.test.ts` byte pins into a separate archive package delivered once. They no longer run in `pnpm test` and are no longer a requirement. Keep every behavioural test.
- Rewrite `README.md` so it describes the current product. Move historical start-here files into the archive.

**Done when:** setting the clock to 1 December 2026 still shows every card and ranking, with ageing labels; the source arrives as one file; `pnpm test` passes.

### M1 Tier 1 data complete

Work brand by brand in sales order, best sellers first, using the January–September 2026 sales data you already hold. For each brand: full current version list, then price, then core facts, then strength and trade-off. Finish a brand before starting the next. If a fact is not found after two sources, record "Not published" with the reason and move on.

- Apply the price ladder and regrading to all existing Tier 1 records first. This alone should lift coverage sharply.
- Add versions for the 14 passenger and 11 ute models that are audit-only, and resolve the 24 passenger and 7 ute leads to "added" or "not sold new here".
- Reconcile for C1.

**Done when:** C1 to C6 pass in the coverage report.

### M2 Presentation

- **Card:** brand, model, version; a to-scale side profile; price with basis tag; range; one more figure that suits the class (seats or charging time); strength in one line; trade-off in one line; availability chip; compare button. One phone screen tall at most.
- **Say it once.** Standing caveats live in the methodology and one footer line. A card carries a caveat only when it is specific to that car and would change a decision. Remove "Buyer-use interpretation, not a market-leading claim" and "Stock not verified" from cards.
- **Plain words.** No internal vocabulary in the interface: bounded configuration, audit record, held lead, ranking-eligible, source-scoped, exact-trim record.
- **Navigation:** a slim sticky top bar on every page with Find by need, Explore, Compare, Shortlist and Model Y pick. It must not alter the hero.
- **Length:** default homepage under 12,000 px at 375 px wide. Lists load 12 at a time on a phone.
- **Profiles:** extend the original to-scale side-profile drawings from 10 models to every Tier 1 family, drawn from each car's own length, height and wheelbase, in the existing style.
- Capture before and after at 375 px and 1280 px for every changed screen.

**Done when:** a first-time visitor on a phone can find a named car, see its price and range, and add it to a comparison in under a minute without scrolling past the hero.

### M3 Buyer journeys

Implement Phase 1 of the attached `DOT_IMPLEMENTATION_HANDOFF.md`, adapted to the 345-version catalogue. Its section C (neutral comparison) is largely done; verify it against that section's acceptance criteria.

- Three entrances: **Will an EV work for me?**, **Find cars for my needs**, **Compare cars I know**. "Find cars for my needs" absorbs the current attribute mode and adds multiple must-haves with confirmed and possible matches.
- A local decision record: chosen versions, priorities, reasons, compromises, open questions, test-drive notes. Export and import; no accounts.
- **Dealer checklist.** For any shortlisted version, generate "What to confirm before you sign" from its Check, Reported and Not published facts, plus the buyer's own needs. This is where the caveats removed from the cards go, as something useful.

**Done when:** every acceptance scenario in that handoff passes on the Next build, the public static build and the portable build.

### M4 Release readiness

- Lighthouse mobile at least 85 performance and 95 accessibility on home, discovery, a detail page and a comparison. Portable build under 12 MB. If a target cannot be met, report the measured figure and why.
- Reproduce and fix, or isolate and document, the "native error 9" crash and the stale-render after resize.
- Keyboard, screen reader, 200% zoom, reduced motion and print checks on the four journeys.
- **Phone testing.** Publish a noindex preview to a separate Sites project, not the live site, and send me the link with a ten-minute test script. I will run it on an iPhone and an Android phone and send results. If a separate preview is not possible, say so and send the portable build instead.
- Corrections: wire per-claim reports to a configurable contact address. I will supply it.

**Done when:** my phone test passes and I give explicit approval to replace the live site, which still shows the old 34-version "Tesla Model Y vs Australia's leading EVs".

---

## 7. How to work

- Stay inside the current milestone. Put other ideas in `docs/BACKLOG.md` with one line each.
- One checkpoint per milestone, plus a safety save when your environment is at risk. A checkpoint is one source file and one short change note.
- Add behavioural tests for new behaviour. Do not add tests that pin file bytes or counts of past checkpoints.
- Keep the original research snapshot immutable and keep using dated overlays.
- No analytics, no accounts, no publishing to the live site without my explicit go-ahead.
- Work in your own environment only, as before.

---

## 8. Report format

One page, plain English, in this order. No hash lists or checkpoint history in the body; attach them.

1. **What changed for a buyer**, in three to five bullets.
2. **Coverage report**, pasted from `pnpm report:coverage`:

   | Tier 1 on-sale versions | Price | Range | Battery | DC time | Seats | Boot | Warranty | Strength + trade-off | In rankings |
   |---|---|---|---|---|---|---|---|---|---|
   | count | % filled / % Confirmed | … | … | … | … | … | … | % | % |

   Plus brands done, brands remaining, and models still missing for C1.
3. **Three phone screenshots** of the most changed screens.
4. **What did not work**, with the actual failure.
5. **Decisions you need from me.**

---

## 9. Next level, after M4

In this order. Finish each before starting the next. All of them use data you will already hold.

1. **Step-up view.** Within a family, show what the next version up costs and what it adds: "+A$6,000 gets you 90 km more range, AWD and a heat pump".
2. **Figures buyers can feel.** Kilometres of range added per ten minutes of fast charging; dollars per kilometre of range. Show the working. Label derived figures as derived.
3. **Size overlay.** Lay two to-scale profiles over each other, and check a car against a garage or parking bay the buyer types in.
4. **Australian money thresholds.** Whether each version sits under the current FBT-exemption and luxury car tax thresholds, and current state incentives. Verify the current rules and figures from the ATO and each state revenue office; date them; never infer a personal tax outcome.
5. **What changed this month.** A dated page and feed of price moves, new arrivals and withdrawals, produced by the monthly refresh.
6. **Answer pages.** Dated, citable pages generated from the rankings: longest range under a budget, seven-seat EVs, EVs that tow 2,000 kg, EVs with vehicle-to-load. Give each the same JSON and Markdown exports as the pair pages, list them in `llms.txt`, and add permanent links for any pair of cars, not only the nine Model Y pairs.
7. **Open dataset.** The Tier 1 catalogue as CSV and JSON with a licence and a citation line.
8. **Also consider.** On each detail page: the nearest cheaper car with similar range, and the nearest car with more range at a similar price.
9. **Safety.** ANCAP rating, test year and which versions it covers.
10. **Coming soon.** Announced models with stated arrival timing, kept apart from cars on sale.
11. **Plain-phrase search.** "7 seats under 70k with V2L" parsed into filters by fixed rules, not a language model.

Then Tier 2, then a monthly refresh routine: run `pnpm report:stale`, recheck by brand, publish the change log.

---

## 10. Protected

- The Model Y hero, its heading and its nine selling points, with their qualifications and artwork, exactly as they are and where they are.
- The typography, colour, illustration and motion language. New screens must look like they belong.
- The original research snapshot and every source record.
- The privacy position: no behavioural analytics, no accounts.

---

## 11. What I will supply

- A contact address for corrections.
- Phone test results after each preview.
- A domain decision before public release.
