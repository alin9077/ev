# Roadmark execution plan — 4 November 2026

This is the working plan for the next phase of the project. It is written so that a worker (a person or an agent session) can pick up any single workstream cold, know exactly what "done" means, and know what they must not do. It supersedes nothing in the owner's brief (`docs/DOT-BRIEF-103.md` inside the Roadmark source); where the two differ on *order*, this plan explains why and leaves the decision to the owner in the "Decisions" list of each workstream.

Companion files:

- `docs/plan/STATUS.md` — the ledger. Every worker updates it when they start, pause or finish a workstream.
- `docs/plan/START_PROMPT.md` — the text to paste into a new worker session.
- `docs/plan/README.md` — how to retrieve and run this plan later.

---

## 0. The situation in one paragraph

The repository `alin9077/ev` holds two products. The live site ("EV Side by Side": 34 variants, 10 families, Model Y-centred, Next.js 16) is healthy but small and its prices are dated 6 October 2026. The successor, Roadmark (433 versions, 171 families, 314 on sale, 56 brands, 15 brands research-complete), exists only as 1.9 GB of recovery archives under `RoadmarkX/` plus a Lexus delta that is **not in this repository**. Roadmark has never been shown to a buyer. On 4 November 2026 its latest source (Ford32, `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz`) was extracted in a fresh 16 GB, 4-core container: dependencies installed with the frozen lockfile, and `tsc --noEmit` **passed in 21 seconds** with a 6 GB heap. The "unknown-cause SIGKILL" in the handover notes was the previous environment running out of memory. Roadmark's code is not blocked; its process is.

---

## 1. Definitions (read before any workstream)

These words are used with exactly these meanings everywhere in this plan. If a worker finds a case the definition does not cover, they record it in `STATUS.md` under "Ambiguities found" and pick the stricter reading.

| Term | Exact meaning |
|---|---|
| **Roadmark source** | The directory tree extracted from `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz` (SHA-256 `d624a00ea9f9ae0c1e4c75e12930a7cb9554a537d3e1c6ca03a7a34406295444`), 706 files plus manifest, with the Lexus delta applied if it can be found (see WS0). |
| **Live site** | The 34-variant Next.js app at the root of this repository today, deployed at the Sites address in `.openai/hosting.json`. |
| **Version** | One exact purchasable configuration: brand + model + trim + model year + drive. It is the row unit of Roadmark. The old site calls this a "variant". |
| **Family** | A brand + model nameplate grouping of versions (e.g. "Kia EV5"). |
| **Tier 1** | Passenger cars, SUVs, people movers and utes. Tier 2 is vans/light commercial. Tier 3 is trucks, buses, motorcycles, scooters, trikes. Tier is a property of the version's vehicle class, not of the brand. |
| **On sale** | A Tier 1 version whose availability is `current_or_order_listed` with dated evidence, or an outgoing version with a sourced dealer "new stock" advertisement. Provisional/announced versions are **not** on sale. "On sale" never asserts physical stock. |
| **Core cell** | One (on-sale version × core field) pair. The core fields are exactly these 17 fact keys: `price_aud`, `range_km`, `battery_kwh`, `dc_peak_kw`, `dc_charge_time_min` (10–80% only), `ac_kw`, `seats`, `boot_l`, `zero_to_100_s`, `power_kw`, `drive`, `length_mm`, `width_mm`, `height_mm`, `towing_braked_kg`, `warranty`, `battery_warranty`. |
| **Filled** | The core cell has a non-null value. A value with a wrong measurement basis is still filled. |
| **Grade** | One of exactly four buyer-facing grades: **Confirmed**, **Check**, **Reported**, **Not published**. A cell that has a value but no earned grade is **Unreviewed**; Unreviewed is a state, not a fifth grade. |
| **Earned grade** | A grade carried in a dated M1 brand packet (`data/m1-brand-updates/*.json`) with a reason, an evidence scope and resolvable source IDs. A legacy `standard`/`conditional` status on its own does **not** earn a grade. |
| **Gap** | A core cell that is either (a) not filled after a documented two-source search, or (b) filled but Unreviewed. A "Not published" grade with its reason recorded is **not** a gap; it is a finished research outcome. |
| **Strict gap** | The count `pnpm report:coverage` prints as "gaps". As of 16 October 2026 it was 285 of 5,338 core cells. |
| **Fresh** | Evidence whose dated check is within its window: 45 days for price/offers/availability, 180 days for range/battery/charging/performance/equipment, 365 days for dimensions/seats/towing/warranty. Ageing changes the label and ranking eligibility; **it never removes a value or a card**. |
| **Ranked** | A version appears in a ranking list when its fact is Confirmed or Check, fresh, and on the same measurement basis as the group. Reported values are listed but unranked. |
| **Research-complete (brand)** | The brand's dated current-version list is established, every lead resolved, every on-sale core cell has an earned grade (including two-source "Not published"), every Tier 1 version has a strength and a trade-off, and claims are fresh. 15 brands qualified on 16 October 2026: Audi, BYD, GAC, Geely, IM, Jaecoo, KGM, Kia, MG, MINI, Mazda, Nissan, Tesla, Toyota, Zeekr. |
| **Coverage-qualified (brand)** | Research-complete **and** passes all six criteria C1–C6 of the brief. No brand is coverage-qualified today. |
| **Immutable snapshot** | `au_ev_all_variants_2026-10-06.json` (SHA-256 `010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657`). Never edited. All later evidence is a dated overlay. |
| **Packet** | A dated per-brand JSON in `data/m1-brand-updates/` registered in `registry.json`. The only legitimate way to add or change a buyer-facing fact. |

### Misreadings that are not allowed

- "Filled" is not "Confirmed". Report both, always, as `filled % / Confirmed %`.
- "Listed" is not "in stock". A configurator price is not an order.
- "Not published" is not "unknown". It means two sources were searched on a recorded date and neither had it.
- "Research-complete" is not "coverage-qualified" and neither is "released".
- An aged fact is not a missing fact.
- A 30–80% charge time is not a 10–80% charge time. A station's power is not the vehicle's peak.
- A test that passes "scoped" (a subset) is not the full suite. Say which.
- A typecheck that was killed is not a typecheck that failed, and neither is a pass.

---

## 2. Rules that apply to every workstream

1. The immutable snapshot is never modified. New facts go in dated packets. Every packet entry carries a source ID that resolves to a URL and an access date.
2. No fabricated or estimated figures. A derived figure (e.g. km per 10 minutes of charging) is labelled "derived" and shows its inputs.
3. No analytics, accounts, or third-party runtime requests. No publishing to the live site without the owner's explicit written go-ahead recorded in `STATUS.md`.
4. Every behaviour change gets a behavioural test. No test may pin file bytes, hashes or counts of past checkpoints.
5. Before claiming any check passed, run it in this order and paste the summary lines into `STATUS.md`: `pnpm validate`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, then (if UI changed) `pnpm build` and `pnpm test:e2e`. State the environment (RAM, CPU, Node version). Set `NODE_OPTIONS=--max-old-space-size=6144` for `test` and `typecheck`; the suite needs it.
6. Reports to the owner use the brief's section 8 format: what changed for a buyer (3–5 bullets), coverage table, three phone screenshots, what did not work, decisions needed.
7. Workers stay inside their workstream. Ideas go in `docs/BACKLOG.md` as one line each.
8. Git: one branch per workstream, named `ws<N>-<slug>`; small commits; never force-push a shared branch; never rewrite history without the owner's written approval (see WS0 decision D0.2).

---

## 3. Ranked workstreams

Order is by buyer value with prerequisites pulled forward. WS0 and WS7 can start today in parallel. WS1 needs WS0. WS2–WS6 need WS1's branch to exist (they build on the Roadmark source) but can start research and data work before WS1 ships.

| Rank | Workstream | Depends on | Buyer groups served | Size |
|---|---|---|---|---|
| 0 | WS0 Consolidate Roadmark into git; retire the archive process | — | all (enabler) | 1–2 days |
| 1 | WS1 Roadmark public beta (M2 presentation) | WS0 | 1, 3, 4, 8 | 2–3 weeks |
| 2 | WS2 Monthly refresh loop and "What changed" page | WS0 | all | 1 week + monthly |
| 3 | WS3 Answer pages and any-pair permalinks | WS0, WS1 data model | 3, 4, 6, 10 + AI citation | 1–2 weeks |
| 4 | WS4 Australian money thresholds | WS0 | 3, 7 | 3–4 days |
| 5 | WS5 Needs-based discovery and dealer checklist | WS1 | 2, 3, 4, 5, 6, 11 | 3 weeks |
| 6 | WS6 Step-up view within a family | WS1 | 1 | 3 days |
| 7 | WS7 Live-site hygiene | — | current visitors | 1 day |

Buyer group numbers refer to `docs/EV_BUYER_JOURNEYS.md` (1 cross-shoppers, 2 first-EV switchers, 3 budget/TCO, 4 family, 5 no home charging, 6 regional/towing, 7 novated lease, 8 experienced owners, 9 used, 10 solar/home energy, 11 urban second car, 12 fleets).

---

## WS0 — Consolidate Roadmark into git and retire the archive process

**Goal.** The Roadmark source lives in this repository as ordinary tracked files, builds and tests pass in a documented environment, and the recovery archives are no longer needed for day-to-day work.

**Why first.** Every later workstream edits Roadmark. Today each worker would first have to pick the right archive from 329 files, extract it, hope the Lexus delta exists, and re-verify hashes. That process, not the code, is what stalled M1.

### Tasks

W0.1 **Restore the source.** In an empty directory, extract `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz`. Verify the archive SHA-256 is `d624a00ea9f9ae0c1e4c75e12930a7cb9554a537d3e1c6ca03a7a34406295444` and that the tree has 706 source files plus `SOURCE-FILE-MANIFEST.json`. Record both numbers in `STATUS.md`.

W0.2 **Find the Lexus delta.** Search the owner's ChatGPT "Library" and local downloads for `Lexus-working-recovery-delta-v1.zip` (183,022 bytes, SHA-256 `f94d39d860f9c8b6b94dfd07cb0af948a1b85424d0c13480a20fe72ad5561900`). If found, apply it with its bundled applier (it replaces `src/lib/buyer-availability.ts`, `data/m1-brand-updates/registry.json`, `scripts/reporting/load.ts` and adds `tests/buyer-arrival.test.ts`, `data/m1-brand-updates/lexus-2026-10-16.json`, `data/m1-lexus-market-reconciliation-2026-10-16.json`); the result has 709 files. If **not found within one working day**, stop looking, write "Lexus33 delta not recovered; Lexus to be re-researched as a normal packet in WS2" in `STATUS.md`, and proceed with Ford32. Do not reconstruct the delta by hand from the handover notes.

W0.3 **Put it in git.** Create branch `ws0-roadmark-source` from `main`. Replace the repository root contents with the Roadmark source tree (the old live-site files are superseded; they remain in history). Before deleting anything, tag the current `main` as `ev-side-by-side-2026-11-04` so the live site's source is one command away. Keep `.gitignore` from Roadmark. Do not commit `node_modules`, `.next`, `out`, `index.html`, `index-b.html`, `public/index*.html` (all generated).

W0.4 **Move the archives out of the working tree.** `RoadmarkX/` (1.9 GB, 3,132 files) and the two handoff zips at the root (`ev-dot-handoff-2026-10-10.zip`, `ev-dot-buyer-journeys-handoff-2026-10-11.zip`) are removed from the tree in this branch. Where they go is decision D0.1 below; the default is a new private repository `alin9077/ev-archive` with Git LFS, pushed once, with its commit SHA written into `docs/ARCHIVE.md` here. Nothing is deleted from anywhere until the copy's SHA-256 list has been verified against `RoadmarkX/Roadmark-102-all-in-one/CONTENTS-MANIFEST.json` and the per-recovery manifests.

W0.5 **Prove it works.** In a container with at least 16 GB RAM, Node 22, pnpm 11.19.0:

```bash
pnpm install --frozen-lockfile
NODE_OPTIONS=--max-old-space-size=6144 pnpm typecheck
pnpm validate
pnpm lint
NODE_OPTIONS=--max-old-space-size=6144 pnpm test
pnpm report:coverage --as-of 2026-10-16
pnpm build
```

Expected: typecheck exits 0 (observed 21 s); validate reports 433 variants / 171 families / 194 generations / 69 criteria / 29,877 evidence rows (Ford32) or the Lexus33 numbers (434 / 171 / …) if W0.2 succeeded; coverage reports 433 catalogue / 356 Tier 1 / 314 on sale (Ford32) or 434 / 357 / 314 (Lexus33). Paste all summary lines into `STATUS.md`. If `pnpm test` is killed, record peak memory (`/usr/bin/time -v` or `ps`), raise the heap, and retry once; a second kill is a blocker to report, not to work around by skipping tests.

W0.6 **Write the environment note.** `docs/ENVIRONMENT.md`: minimum RAM, Node, pnpm, the `NODE_OPTIONS` setting, measured durations for typecheck, test, coverage report and build, and the exact commands. Delete or move to the archive any "START-HERE", "RECOVERY", "OPEN-THIS-CHECKPOINT" prose from the root.

W0.7 **Open a PR to `main`.** Title "Roadmark source becomes the working tree". Body: the numbers from W0.5, the archive location from W0.4, the Lexus outcome from W0.2.

### Gaps this workstream must name explicitly

- Lexus33 recovered: yes/no.
- Full `pnpm test` aggregate: pass/fail/killed, with counts. "151 scoped tests" is not an answer here.
- `pnpm build` and `pnpm build:portable`: pass/fail with output sizes.
- Any file in the Ford32 manifest whose hash did not match on extraction (expected: none).

### Decisions for the owner

- **D0.1 Archive destination.** (a) separate private repo with Git LFS (default); (b) cloud bucket with a manifest; (c) keep in this repo under LFS. Note: whichever is chosen, existing clones of `main` still carry 1.2 GB of history until D0.2.
- **D0.2 History rewrite.** Purging the archives from history (`git filter-repo`) would shrink `.git` from 1.2 GB to a few tens of MB but rewrites every commit SHA and invalidates every existing clone. Default: **do not rewrite**; instruct workers to clone with `--depth 1 --filter=blob:none`.

### Not in scope

Any UI change. Any brand research. Any test weakening. Reformatting unrelated files.

---

## WS1 — Roadmark public beta (M2 presentation)

**Goal.** A first-time visitor on a phone can find a named car, see its price (with basis tag and checked date) and range, understand its strength and trade-off, and add it to a comparison in under a minute without scrolling past the hero. Published as a **noindex preview** on a separate Sites project for the owner's phone test; replaces the live site only on the owner's written go-ahead.

**Why before finishing all brands.** 314 on-sale versions with 90% of prices filled is already a far better answer for buyer groups 1 and 3 than the live 34-variant site, and the live site's prices are already four weeks old. Waiting for 41 more brands pushes any buyer value into 2027.

### Scope (from brief 103 §6 M2, made testable)

W1.1 **Card.** Each catalogue card shows exactly: brand, model, version name; price with basis tag and "checked DD Mon" date (or "Not published"); WLTP range in km (or "Not published"); one class-appropriate third figure (seats for people movers and 6/7-seaters, otherwise 10–80% DC time); strength in one line; trade-off in one line; availability chip (one of: On sale now / Order open or arriving [date] / Not confirmed); Compare button. Height ≤ 1 phone screen at 375×667. No other text. **Removed from cards:** "Buyer-use interpretation, not a market-leading claim", "Stock not verified", and any sentence that appears on more than 20 cards.

W1.2 **Grade styling.** Confirmed = plain figure. Check = figure plus a small mark; condition shown on tap/focus. Reported = muted figure with a source tag ("reported by CarExpert"). Not published = the words "Not published". Aged = amber "checked DD Mon" label; value stays. Implement once, in one component, used by cards, detail pages and comparison rows.

W1.3 **Navigation.** A slim sticky top bar on every page: Find by need, Explore, Compare, Shortlist, Model Y pick. Must not change the hero. Works at 320 px, by keyboard, and in the portable build (query-parameter routing).

W1.4 **Default view = Tier 1 only.** Tier 2 and 3 are behind a visible filter and are never mixed into the default list, rankings or counts. Headline counts say "N passenger EVs" where N counts only Tier 1 on-sale versions.

W1.5 **Length and loading.** Homepage ≤ 12,000 px tall at 375 px wide. Lists render 12 cards then "Show more". Measured with Playwright: `document.documentElement.scrollHeight` at 375×667 after load.

W1.6 **Plain words.** Grep the rendered HTML of home, discover, one detail page and one comparison for these strings and fail the build if any appear: "bounded configuration", "audit record", "held lead", "ranking-eligible", "source-scoped", "exact-trim record", "Tier 1", "packet". Buyer-facing replacements are decided in W1.6's PR and listed in `docs/PLAIN_WORDS.md`.

W1.7 **Profiles.** Extend the to-scale side-profile drawings from the original 10 families to every Tier 1 family, drawn from each family's length, height and wheelbase in the existing style (`src/lib/car-avatar-shapes.ts`, `src/components/car-avatar.tsx`). Where a family lacks all three dimensions, use the class silhouette and list the family in `docs/PROFILES_GAPS.md`. Profiles are the largest single task here (171 families); they may ship after W1.1–W1.6 as a second PR, but the beta does not wait for them.

W1.8 **Before/after screenshots.** For every changed screen: 375 px and 1280 px, before and after, in `qa/screenshots/ws1/`. Include loading, empty and error states.

W1.9 **Preview deploy.** `NEXT_PUBLIC_SITE_URL=<preview origin> pnpm build:public` with noindex forced on; deploy to a **new** Sites project (not the one in `.openai/hosting.json`). Send the owner the link and a ten-minute test script (`docs/PHONE_TEST_SCRIPT.md`: find Kia EV5 → see price and range → add to comparison → compare with BYD Sealion 7 → open a Check condition → share link → open on desktop).

### Acceptance (all must pass; record results in STATUS.md)

- Playwright scenario "first-time phone visitor" completes W1.9's script in < 60 s of scripted interaction at 375×667 on Chromium and WebKit.
- Homepage scrollHeight ≤ 12,000 at 375 px.
- Lighthouse mobile on home, discover, one detail, one comparison: performance ≥ 85, accessibility ≥ 95. If a target is missed, report the measured figure and the cause; do not lower the target.
- Portable build ≤ 12 MB.
- Zero plain-words violations (W1.6 check).
- All of rule 5's checks pass.
- Owner's phone test passed and recorded.

### Gaps this workstream must name explicitly

- Number of Tier 1 on-sale cards showing "Not published" for price, for range, for the third figure (three numbers).
- Number of families without a to-scale profile.
- Number of cards still carrying any repeated disclaimer (must be 0).
- Lighthouse figures per page, actual.

### Decisions for the owner

- **D1.1 Release with partial brand coverage.** Beta shows all 56 brands. Versions from the 15 research-complete brands carry no special label; versions from other brands keep their grade styling (mostly Reported/Unreviewed). Default: yes, ship with a one-line footer "Coverage: N brands fully reviewed, M partly; see methodology". Alternative: Tier 1 from research-complete brands only (drops ~60% of versions).
- **D1.2 Replace the live site** after the phone test, or keep the preview as beta for a further period.

### Not in scope

New brand research. Buyer journeys (WS5). Rankings redesign. Changing the Model Y hero or its nine selling points (protected by the brief).

---

## WS2 — Monthly refresh loop and "What changed" page

**Goal.** Facts stay inside their freshness windows by a repeatable, dated, per-brand process, and every refresh produces a dated public page and feed of price moves, arrivals and withdrawals.

**Why now.** Today is 4 November 2026. Live-site prices (6 Oct) cross the 45-day line on **20 November**. Roadmark prices checked 10–15 Oct cross it between **24 and 29 November**. Without this loop every price goes amber and unranked within four weeks, and the product decays on a schedule. The changes page is also the only inherently new content each month.

### Tasks

W2.1 **Refresh runbook.** `docs/REFRESH_RUNBOOK.md`: for one brand, the exact steps: run `pnpm report:stale --details --as-of <date>` → for each stale or soon-stale claim open the source URL recorded in the packet's `sources[]` → record new value/basis/date or "unchanged, rechecked <date>" → write a new packet `data/m1-brand-updates/<brand>-<YYYY-MM-DD>.json` → register it → run checks → commit. A rechecked-unchanged fact gets a new check date; its grade does not change unless the source changed.

W2.2 **Refresh tooling.** `scripts/refresh/plan.ts`: outputs, for a given as-of date, a work queue grouped by brand in sales order (`docs/M1_BRAND_ORDER.md`): claim, current value, source URL, days until stale. `scripts/refresh/scaffold.ts`: writes an empty packet skeleton for a brand with every current on-sale version and every core field pre-listed, so the researcher only fills values. Both are read-only with respect to existing data.

W2.3 **Changes overlay.** `data/changes/<YYYY-MM>.json`, generated (not hand-written) by `scripts/refresh/diff.ts` from two coverage snapshots. A change is exactly one of: `price_changed` (value or basis differs on the same rung), `price_added`, `price_removed`, `version_added`, `version_withdrawn` (on sale → not), `availability_changed`, `range_changed`, `warranty_changed`. Each entry: version ID, field, before, after, before-date, after-date, source IDs. Anything else is not a change for this page.

W2.4 **Page and feed.** `/changes` lists months newest first; each month lists entries grouped by type then brand; each entry links to the version page and shows its source. `/changes.json` and `/changes/feed.xml` (RSS 2.0) carry the same entries. Add `/changes` to `llms.txt` and the sitemap.

W2.5 **First run.** Before 20 November 2026 complete a refresh of the top 7 brands by sales (BYD, Tesla, Geely, Zeekr, Omoda Jaecoo, Kia, MG). Before 30 November complete Hyundai, Toyota, Volkswagen, Volvo, GWM, GAC, BMW. Produce `data/changes/2026-11.json` and the page.

W2.6 **Cadence.** The runbook fixes the refresh to the first five working days of each month, in sales order, top 14 brands minimum. A scheduled reminder may be created only if the owner asks; no automation touches data.

### Acceptance

- `pnpm report:stale --as-of 2026-12-01` shows zero Tier 1 price claims from the 14 refreshed brands older than 45 days.
- `data/changes/2026-11.json` exists, validates against a JSON schema committed in `data/changes/schema.json`, and is produced by `diff.ts`, not by hand.
- `/changes` renders in the Next, static and portable builds with the same entries.
- Behavioural tests: diff classification for each change type; "rechecked-unchanged" produces no change entry but updates the date.

### Gaps to name explicitly

- Brands not refreshed this month and why.
- Claims that could not be rechecked because the source URL is gone (list them; mark "source unavailable, value retained, date unchanged").
- Lexus: if WS0 did not recover the delta, Lexus is researched here as a new packet (5 versions) and that is stated.

### Not in scope

New fields. New brands beyond the Tier 1 list. Any UI beyond `/changes`.

---

## WS3 — Answer pages and any-pair permalinks

**Goal.** Dated, citable pages generated from the rankings that answer the questions buyers and AI assistants actually ask, each with JSON and Markdown exports, listed in `llms.txt`, plus a permanent URL for any pair of versions.

**Why.** The live site's nine Model Y pair pages match nine questions. The rankings already hold 236 range, 177 price, 179 DC-time, 213 seat and 159 towing entries. The citable machinery (claim formatter, JSON/MD routes, FAQPage schema, `llms.txt`) exists in `src/lib/citable.ts`, `src/app/compare/[pair]/*`, `src/app/llms.txt/route.ts`.

### The initial page set (exactly these 12; more only via BACKLOG)

| Slug | Rule (applied to on-sale Tier 1, fresh, Confirmed or Check, same basis) |
|---|---|
| `/answers/longest-range-under-50k` | `price_aud` before on-road costs < 50,000, ranked by `range_km` WLTP combined desc |
| `/answers/longest-range-under-70k` | same, < 70,000 |
| `/answers/longest-range` | all, ranked by `range_km` desc |
| `/answers/cheapest-evs` | ranked by `price_aud` before on-road costs asc |
| `/answers/cheapest-driveaway` | ranked by `price_aud` driveaway asc (separate basis group) |
| `/answers/fastest-charging` | ranked by `dc_charge_time_min` 10–80% asc |
| `/answers/seven-seat-evs` | `seats` ≥ 7, ranked by price asc |
| `/answers/tow-2000kg` | `towing_braked_kg` ≥ 2,000, ranked by towing desc |
| `/answers/tow-1500kg` | ≥ 1,500 |
| `/answers/vehicle-to-load` | feature `v2l` standard, ranked by price asc |
| `/answers/under-fbt-threshold` | depends on WS4; price before on-road costs below the dated LCT fuel-efficient threshold |
| `/answers/awd-under-60k` | `drive` is AWD and price < 60,000, ranked by range desc |

W3.1 **Generator.** `src/lib/answers.ts`: a declarative list of pages (slug, title, filter, sort, basis group) and one function that produces a `CitableReport` from it, reusing `makeReport`. Every page states: the as-of date, the count of versions considered, the count excluded and the one-line reason groups ("12 excluded: price Reported only; 3 excluded: range basis not WLTP combined"). Ties preserved.

W3.2 **Routes.** `/answers/[slug]`, `/answers/[slug]/answer.json`, `/answers/[slug]/answer.md`, index at `/answers`. Server-rendered HTML with the answer and sources present without JavaScript. FAQPage + ItemList JSON-LD matching visible content. Canonical only on the public origin.

W3.3 **Any-pair permalinks.** `/compare/{versionA}-vs-{versionB}` for any two Tier 1 version IDs, canonicalised to alphabetical order (the other order 301s). Same exports as the nine Model Y pairs. Keep the nine existing slugs working. Static export must prerender at least the pairs that appear in any answer page's top 5 against each other (bounded set, listed in the build log); other pairs render on demand in the Next build and via client routing in the portable build.

W3.4 **Discovery files.** `llms.txt` lists all answer pages and the prerendered pairs. Sitemap dated per page from the newest fact date on that page, not the build date.

### Acceptance

- Each of the 12 pages renders with ≥ 1 entry, or renders an explicit "No version currently qualifies" with the reason; never an empty table.
- JSON, Markdown and HTML for each page contain the same version IDs in the same order (parity test).
- Pair canonicalisation test: `/compare/b-vs-a` → 301 → `/compare/a-vs-b`.
- Pages < 250 KB HTML each.
- `qa/ai-citation-checks.csv` is extended with one question per answer page and run once (manually, three services) with results committed as the baseline.

### Gaps to name explicitly

- Per page: versions considered, ranked, excluded, with reason groups.
- Any answer page whose top entry is a Check value (list them; the condition must be visible in the HTML).

### Not in scope

Editorial prose on answer pages beyond one sentence of scope. Rankings of subjective criteria. Superlatives ("best in Australia") until C1 passes.

---

## WS4 — Australian money thresholds

**Goal.** For every Tier 1 version with a before-on-road price, show whether it sits under the current FBT-exemption price cap (the luxury car tax threshold for fuel-efficient vehicles), whether LCT applies, and which state or territory EV incentives currently apply, each dated and sourced. Never a personal tax outcome.

### Tasks

W4.1 **Data file.** `data/au-thresholds-<YYYY-MM-DD>.json` with: `fbt_exempt_price_cap` {value, financial_year, source_url, checked_at}, `lct_threshold_fuel_efficient` and `lct_threshold_other` {same}, `fbt_exemption_rules` {eligibility summary in ≤ 3 sentences, source_url, checked_at}, and `state_incentives[]` {state, name, type (rebate / stamp duty / registration / road user charge), amount_or_rule, eligibility price cap if any, start, end or "open", source_url, checked_at}. Every value comes from the ATO or the relevant state revenue office page retrieved on `checked_at`. **No value from memory, a news article or a dealer page.** A worker who cannot retrieve the primary page records the row as "not retrieved" and leaves the value null.

W4.2 **Rules.** `src/lib/thresholds.ts`: a pure function (version, thresholds) → {underFbtCap: true/false/unknown, lctApplies: true/false/unknown, stateIncentives: [...]} using **only** the before-on-road price on rung 1 (maker list price). Driveaway, configurator and reported prices return `unknown` with the reason "needs maker list price". A price within 2% of the cap returns `unknown` with reason "close to cap; options and delivery change the outcome".

W4.3 **Display.** On the version detail and in comparison: one row "Under the FBT exemption price cap? Yes / No / Can't tell (reason)" with "as at DD Mon YYYY, ATO" and a link to the glossary entry `#fbt`, which already exists. State incentives: one row per state only when the visitor picks a state (local, URL-carried, not stored). Mandatory sentence beside the row: "Whether you can use the exemption depends on your employer and lease; this is not tax advice."

W4.4 **Freshness.** Threshold rows use the 45-day window. `report:stale` includes them.

### Acceptance

- Unit tests for each branch of W4.2 including the 2% band and every non-rung-1 price.
- Every value in the data file has a non-null `source_url` on an `ato.gov.au` or state revenue domain and a `checked_at` within 45 days of the commit date.
- The answer page `/answers/under-fbt-threshold` (WS3) is driven from this data and nothing else.

### Gaps to name explicitly

- Versions returning `unknown` and the count per reason.
- States whose incentive pages could not be retrieved.

### Not in scope

Novated lease calculators. Personal tax outcomes. Comparison of lease providers.

---

## WS5 — Needs-based discovery and the dealer checklist

**Goal.** "Find cars for my needs" accepts several must-haves and returns confirmed matches, possible matches and exclusions with reasons; any shortlisted version produces "What to confirm before you sign". This implements handoff sections D and E (`docs/DOT_IMPLEMENTATION_HANDOFF.md`) on the Roadmark catalogue.

### Must-haves (exactly this set for the first release; each maps to a core field or feature)

Budget (before-on-road or driveaway, chosen explicitly), minimum WLTP range, minimum seats, AWD required, minimum braked towing, vehicle-to-load required, heat pump required, spare tyre required, maximum length (fits my space), minimum boot litres, "order open now" only.

### Match semantics (no other outcome exists)

| Outcome | Rule |
|---|---|
| **Confirmed match** | Every must-have is satisfied by a Confirmed or Check fact that is fresh. Check conditions are listed under the card. |
| **Possible match** | Every must-have is satisfied or unknown, at least one is satisfied only by a Reported fact or is Not published/Unreviewed/aged. The card names which must-have is unresolved. |
| **Excluded** | At least one must-have is contradicted by a Confirmed, Check or Reported fact. The card names the must-have and the value. |

An unknown price never counts as under budget. A Not published seat count never counts as ≥ 7. A seven-seat requirement with no confirmed match says "No seven-seat EV in the catalogue currently has a confirmed seat count ≥ 7; N possible" rather than recommending a six-seater.

### Tasks

W5.1 `src/lib/needs.ts`: pure matcher implementing the table above; URL-carried state (`?need=budget:60000:driveaway&need=seats:7`); no local storage until the user explicitly saves.
W5.2 `/discover` gains the must-have panel; results in three labelled groups with counts; "why excluded" on every excluded card; empty state names the responsible must-have and offers to relax it.
W5.3 **Dealer checklist.** `src/lib/checklist.ts`: for a version, produce ordered items from: every Check fact (→ "Confirm <condition> applies to the car you are quoted"), every Reported fact (→ "Ask the dealer to confirm <field>: we only have <publisher>'s figure"), every Not published core field (→ "Ask for <field> in writing"), aged facts (→ "Our <field> was last checked <date>; confirm current"), availability not confirmed (→ "Confirm order acceptance and delivery timing in writing"), plus the buyer's own must-haves (→ "Check <must-have> on the test drive"). Rendered at `/cars/[family]/[version]#checklist`, printable, copyable, and included in the shortlist export.
W5.4 **Decision record.** Extend the existing local shortlist (`src/lib/buyer-proposal-storage.ts` family) with: priorities, reasons, compromises, open questions, test-drive notes; explicit export/import JSON validated on import; comparison link stays free of notes; migrate legacy `ev-shortlist` arrays without loss.

### Acceptance

- Matcher unit tests: one test per must-have × outcome (33 minimum), plus the unknown-never-satisfies rule.
- Playwright: budget + seats ≥ 7 + towing ≥ 1,500 produces the three groups with correct counts against a fixture.
- Checklist for a version with at least one of each grade produces one item per rule, in the stated order.
- Export then import of a decision record round-trips byte-equal.
- Handoff section D and E acceptance bullets each mapped to a named test in `STATUS.md`.

### Gaps to name explicitly

- Must-haves that no on-sale version can confirm today (list with counts).
- Core fields with so many Reported values that most matches become "possible" (name the field and the count).

### Not in scope

The suitability questionnaire ("Will an EV work for me?", handoff B) — it is next after WS5 and is listed in BACKLOG. Charging-feasibility or trip tools. Accounts.

---

## WS6 — Step-up view within a family

**Goal.** On any version page and card, show the next version up in the same family: "+A$6,000 gets you 90 km more range, AWD and a heat pump".

### Rules

- Only between two on-sale versions in the same family with prices on the **same basis and same rung group** (before-on-road vs driveaway). Otherwise show "Price basis differs; compare directly" with a link.
- Differences listed are only core fields and standard-fitted features that differ, in this fixed order: range, drive, DC time, power, seats, boot, towing, heat pump, V2L, then other features. Maximum five items, then "and N more".
- A Reported or aged figure in the sentence carries its grade mark. The sentence never includes a derived number beyond the price difference and the field differences themselves.

### Tasks

W6.1 `src/lib/step-up.ts` pure function + tests (same basis, different basis, top of family, single-version family, aged price).
W6.2 Render on version page, on cards (one line, collapsed), and in the comparison when both cars are in the same family.

### Acceptance

- Unit tests above pass; Playwright screenshot of Kia EV5 Air → Earth step-up at 375 px.

### Gaps to name explicitly

- Families where no step-up can be shown because of price basis mismatch (count and list).

---

## WS7 — Live-site hygiene (parallel, one day)

**Goal.** The live 34-variant site stays honest until WS1 replaces it.

W7.1 Fix `tests/citable.test.ts` line 73: the audit now records 9 unavailable sources, not 10. Change the assertion to read the count from the data and assert the *list* of unavailable source IDs instead of a bare number.
W7.2 Retrieve or replace the 9 sources still marked `unavailable` in `data/source-audit-2026-10-08.json`; record each outcome in `docs/CORRECTION_LOG.md`.
W7.3 Add a correction contact: a `mailto:` configured through `NEXT_PUBLIC_CORRECTION_EMAIL`, shown on `/sources` and every pair page footer. The owner supplies the address (decision D7.1); until then the link is hidden, not fake.
W7.4 Run the twenty questions in `qa/ai-citation-checks.csv` once in ChatGPT, Perplexity and Google; fill every column; commit as the baseline.
W7.5 Add a dated note to the homepage sales footnote that prices are as at 6 October 2026 and a refresh is scheduled (WS2); do not change any price.

### Not in scope

Adding Atto 1 or any vehicle (that happens in Roadmark via WS2). Design changes.

---

## 4. Stop list

Workers do not spend time on these, regardless of what older documents say:

- Tier 3 research (trucks, buses, motorcycles, scooters, trikes). Existing records stay as a filtered directory.
- Further scene animation, chapter art, or hero changes.
- New recovery, manifest, hash-chain or "safety save" tooling. Git is the recovery mechanism after WS0.
- Finishing all 41 remaining brands before shipping WS1.
- Tests that pin bytes, hashes or counts of past checkpoints.
- Any analytics, accounts, or third-party embeds.

---

## 5. Reporting

At the end of each workstream (and at each pause longer than a day) the worker writes, in `docs/plan/STATUS.md`: date, workstream, branch and commit, the check summary lines from rule 5, the "gaps to name explicitly" list filled in with real numbers, decisions awaiting the owner, and what did not work with the actual error text. A workstream is not "done" until its acceptance list is pasted with pass/fail beside each line.
