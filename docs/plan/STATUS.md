# Execution plan status ledger

Update this file whenever a workstream starts, pauses or finishes. Newest entry at the top of each workstream. Paste real command output, not summaries. Plan: `docs/plan/EXECUTION_PLAN_2026-11-04.md`.

## Owner decisions

| ID | Decision | Default if no answer | Answer | Date |
|---|---|---|---|---|
| D0.1 | Archive destination | Separate private repo with Git LFS | | |
| D0.2 | Rewrite git history to purge 1.2 GB | No; shallow clones instead | | |
| D1.1 | Beta shows all 56 brands with grade styling | Yes, with coverage footer | | |
| D1.2 | Replace live site after phone test | Owner decides after test | | |
| D7.1 | Correction contact address | Link hidden until supplied | | |

## Workstreams

| WS | State | Branch | Last commit | Worker | Updated |
|---|---|---|---|---|---|
| WS0 Consolidate Roadmark | in progress | claude/ws0-roadmark-source-938862 | | Sonnet worker (Claude Code) | 2026-11-05 |
| WS1 Public beta (M2) | not started | | | | |
| WS2 Refresh loop + changes page | not started | | | | |
| WS3 Answer pages + any-pair | not started | | | | |
| WS4 Money thresholds | in progress (W4.1, W4.2, W4.4 done; W4.3 deferred) | claude/ws4-money-thresholds-8e2e2f | | Sonnet worker (Claude Code) | 2026-11-05 |
| WS5 Needs discovery + checklist | not started | | | | |
| WS6 Step-up view | not started | | | | |
| WS7 Live-site hygiene | not started | | | | |

States: not started / in progress / paused (reason) / blocked (on what) / done (acceptance pasted below).

## Baseline measured 4 November 2026 (planning session)

Environment: cloud container, 16 GB RAM, 4 cores, Node 22.23.4, pnpm 11.19.0.

Live site (repository root at commit f0052a4):

- `pnpm validate`: pass. 34 variants / 10 families / 11 generations / 69 criteria / 2,346 evidence rows / 424 source references.
- `pnpm typecheck`: pass.
- `pnpm test`: 39 pass, 1 fail. Failure: `tests/citable.test.ts:73` expects 10 unavailable sources; `data/source-audit-2026-10-08.json` has 9 (checked 16, unavailable 9, corrected 5, unsupported 2). Fix is WS7.1.
- `pnpm test:e2e`: not run.

Roadmark Ford32 source (extracted from `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz`):

- `pnpm install --frozen-lockfile`: pass.
- `node --max-old-space-size=6144 node_modules/typescript/bin/tsc --noEmit`: **exit 0 in 21 s**, zero errors. The SIGKILLs recorded in the handover were environment memory limits, not code errors.
- `pnpm test` (full suite, `--test-concurrency=2`, 6 GB heap): **680 tests passed, 0 failed, then the run was cut off by a 1,700-second (28-minute) wall-clock limit set by the planning session**, exit 124. Not a complete pass: 155 test files exist and the run was still progressing. No SIGKILL, no memory failure. WS0.5 must rerun without a time limit (budget at least 45 minutes on 4 cores) and record the terminal `# tests / # pass / # fail` lines.
- Lexus33 delta (`Lexus-working-recovery-delta-v1.zip`): **not present in this repository**. Must be found or Lexus re-researched (WS0.2).

Repository hygiene:

- `.git` is 1.2 GB; `RoadmarkX/` holds 3,132 tracked files (1.9 GB); two handoff zips (25 MB) tracked at the root.

## Entries

(Workers append below. Format: `### YYYY-MM-DD WS<N> — <state>` then the check output, gaps, decisions, failures.)

### 2026-11-05 WS0 — in progress

Branch: `claude/ws0-roadmark-source-938862` (the plan names `ws0-roadmark-source`; the harness-assigned worktree branch is used instead). W0.4 external step requires owner approval (see below).

**W0.1 — done (2026-11-05).** Extracted into a fresh empty scratchpad directory (outside the repo).
- Archive SHA-256 `d624a00ea9f9ae0c1e4c75e12930a7cb9554a537d3e1c6ca03a7a34406295444` — matches the plan.
- Files: 707 on disk = 706 manifest-listed source files + `SOURCE-FILE-MANIFEST.json`. Manifest entries: 706.
- Per-file check (SHA-256 and byte size of all 706 entries against `SOURCE-FILE-MANIFEST.json`): 0 mismatches, 0 missing, 1 extra on disk (the manifest itself).

**W0.2 — Lexus delta not found (2026-11-05).** Local-filesystem search only (the owner's ChatGPT Library is not reachable from this session). Searched `~/Downloads`, `~/Desktop`, `~/Documents`, `~/ai-workspace` and `~/Library/Application Support/Claude` by name (`*lexus*`, `Lexus-working*`, `*delta*`) and `~/Downloads`, `~/Desktop`, `~/Documents`, `~/ai-workspace` for any `.zip` of exactly 183,022 bytes. Result: no `Lexus-working-recovery-delta-v1.zip` and no 183,022-byte zip. The only hits were unrelated Lexus/Nissan/Genesis research files from the 10 Oct recovery trees and unrelated delta archives for Hyundai/QA/Volkswagen.

Lexus33 delta not recovered; Lexus to be re-researched as a normal packet in WS2. Proceeding with Ford32 (706 files + manifest). The delta was not reconstructed.

**W0.3 — done (2026-11-05).** Tag `ev-side-by-side-2026-11-04` created locally on `main` (`f0052a41e406974a06abdb02826fa7ad63d4b449`); not pushed yet. Root tree replaced with the 706 Ford32 files + `SOURCE-FILE-MANIFEST.json`; all 706 hashes re-verified in the working tree after copy (0 mismatches). `au_ev_all_variants_2026-10-06.json` is byte-identical to `main` (SHA-256 `010ded19…4657`). Old live-site files removed from the tree (kept in history and at the tag), including `.openai/hosting.json`, `backups/`, `CODEX_MASTER_PROMPT.md`, `IMPLEMENTATION_PLAN.md`, `docs/DOT_START_PROMPT.md`. Preserved: `docs/plan/`, `RoadmarkX/`, the two root handoff zips (+ `.sha256`). No `node_modules`, `.next`, `out` or generated root/`public` `index*.html` committed.

**W0.4 — blocked: awaiting owner go-ahead to create ev-archive (2026-11-05).** Prepared, not executed: `scripts/archive/archive.sh` (manifest / create / verify / push), `scripts/archive/crosscheck.py`, `docs/ARCHIVE.md`. `RoadmarkX/` and the two root zips remain in place; nothing deleted; no repo created; nothing pushed. Git LFS is not installed on this machine (`git lfs version` fails), needed for the `create` step.

### 2026-11-05 WS4 — in progress

Branch: `claude/ws4-money-thresholds-8e2e2f`, cut from the in-progress WS0 branch `claude/ws0-roadmark-source-938862` (stacks on the WS0 PR). Scope this pass: W4.1, W4.2, W4.4, plus an exported row-text helper. **W4.3 (display): deferred: lands after WS1 to avoid conflicts.** The 8 inherited failures being fixed in W0.8 (`m1-evidence-grading`, `mercedes-passenger-catalogue`, `package-source`, `selling-points`, `scene-dynamic-geometry`) are not touched by WS4.

**Environment.** macOS (Darwin), 48 GiB RAM, 16 CPU cores, Node v24.22.0 (plan says Node 22; not 22 here), pnpm 11.19.0. `node_modules` was stale from the old live-site install; `CI=true pnpm install --frozen-lockfile` was run first. `NODE_OPTIONS=--max-old-space-size=6144`.

**Check summary (rule 5), run on commit after W4.4 + test-helper type fix.**
- `pnpm validate`: exit 0, `"result": "PASS"`, 433 variants / 171 families / 194 generations / 69 criteria / 29,877 evidence, snapshot sha256 `010ded19…4657`.
- `pnpm typecheck`: exit 0 (a first run caught a `null` argument in my test helper; fixed in its own commit).
- `pnpm lint`: exit 0, no output.
- `pnpm test` (full, no time limit, background, ~26.6 min): `# tests 1316 / # pass 1307 / # fail 8 / # skipped 1 / # cancelled 0 / duration_ms 1595999`.
  - The 8 failures are exactly the inherited WS0/W0.8 set, untouched here: `m1-evidence-grading` (initial grades preserve source summaries…), `mercedes-passenger-catalogue` (4 tests), `package-source` (source archives round-trip…), `selling-points` (all eligible buyer reasons…), `scene-dynamic-geometry` (36 populated-spec price scene frames…).
  - WS4's 17 new tests all pass (`tests/thresholds.test.ts`); `tests/coverage-reports.test.ts` still passes. No other failures.
- `pnpm build` / `pnpm test:e2e`: not run; no UI changed.

**W4.1 — done.** `data/au-thresholds-2026-11-05.json`, all `checked_at` 2026-11-05.
| Row | Value | Source |
|---|---|---|
| FBT exempt price cap (FY2026-27) | A$91,661 | ato.gov.au LCT thresholds page; rule on ATO "Electric cars exemption" page |
| LCT fuel-efficient (FY2026-27) | A$91,661 | https://www.ato.gov.au/tax-rates-and-codes/luxury-car-tax-rate-and-thresholds |
| LCT other (FY2026-27) | A$80,809 | same |
| FBT exemption rules | 3-sentence summary | https://www.ato.gov.au/businesses-and-organisations/hiring-and-paying-your-workers/fringe-benefits-tax/types-of-fringe-benefits/fbt-on-cars-other-vehicles-parking-and-tolls/electric-cars-exemption |
| NSW rebate (closed, ended 1 Jan 2024) | $3,000 | https://www.revenue.nsw.gov.au/grants-schemes/electric-vehicle-rebate |
| NSW stamp duty refund (closed 1 Jan 2024) | dutiable value cap $78,000 | https://www.revenue.nsw.gov.au/grants-schemes/electric-vehicle-stamp-duty-refund |
| VIC ZEV subsidy (status unconfirmed) | $3,000 per page; page gives no end | https://www.solar.vic.gov.au/zero-emissions-vehicle-zev-subsidy |
| VIC road user charge | **not retrieved** (VicRoads 403 Cloudflare; vic.gov.au 404) | https://www.vicroads.vic.gov.au/registrations/fees-and-charges/motor-vehicle-duty-fee |
| QLD registration duty, electric (open) | $2 per $100 to $100,000, $4 per $100 above | https://www.qld.gov.au/transport/registration/fees/duty/rates |
| WA ZEV rebate (closed 10 May 2025) | $3,500 | https://www.transport.wa.gov.au/projects-planning/electric-vehicles/zero-emission-rebate |
| SA | **not retrieved** (treasury.sa.gov.au, revenuesa.sa.gov.au, sa.gov.au all 403 Cloudflare) | https://treasury.sa.gov.au/Growing-South-Australia/incentives-for-electric-vehicles |
| TAS duty exemption (closed, before 1 Jan 2024) | exemption | https://www.sro.tas.gov.au/motor-vehicle-duty/exemptions/electric-and-hydrogen-fuel-cell-vehicles |
| ACT stamp duty / registration / loan (open) | rate not on page; loan up to $20,000 | https://www.climatechoices.act.gov.au/transport-and-travel/zero-emissions-vehicles |
| NT | **not retrieved** (nt.gov.au and treasury.nt.gov.au 403 Cloudflare) | https://nt.gov.au/driving/rego/getting-an-nt-registration/get-electric-vehicle-registration-and-stamp-duty-concessions |

Cloudflare-challenged pages were not bypassed. The ACT stamp duty amount is not on the retrieved page, so it is null (the linked ACT revenue page was not retrieved). ACT loan uses a `loan` type outside the plan's four types (flagged in the file).

**W4.2 — done.** `src/lib/thresholds.ts` (pure `assessThresholds`, `formatFbtRow`, `thresholdFreshness`), `tests/thresholds.test.ts`.
**W4.3 — deferred: lands after WS1 to avoid conflicts.** Shipped instead: exported `formatFbtRow` (label, answer, "as at DD Mon YYYY, ATO", `#fbt` href and the mandatory not-tax-advice sentence), tested.
**W4.4 — done.** `report:stale` prints a "Money thresholds (45-day window)" section (`scripts/reporting/reports.ts`, `load.ts`, `report-stale.ts`). The first threshold rows go stale on 2026-12-21.

**Gaps (WS4), measured over all 356 Tier 1 versions (matches the coverage report's 356), as at 2026-11-05.**
| Outcome | FBT cap | LCT |
|---|---|---|
| Yes / no (resolved) | 74 under, 10 over | 76 not applicable, 10 applies |
| unknown: needs maker list price | 265 | 265 |
| unknown: close to cap; options and delivery change the outcome | 5 | 5 |
| unknown: utes qualify only if designed to carry under one tonne; payload not checked | 2 | n/a (LCT unaffected) |
| unknown: threshold not retrieved | 0 | 0 |

Of the 265 "needs maker list price": 31 are rung 2, 66 rung 3, 29 rung 4, 83 rung 5, 23 rung 6, and 33 have a price fact with no recorded ladder rung (legacy), which is treated strictly as not rung 1. 91 versions have a rung-1 price; of these 84 are resolved, 5 fall in the 2% band and 2 are utes with no sourced payload. The catalogue has 5 utes; 3 carry a sourced `payload_kg` (855, 905, 805 kg, all under one tonne, so price rules apply) and 2 Hilux BEV versions have none (reported as unknown). States whose incentive pages could not be retrieved: SA, NT; and the VIC road user charge row.

**Acceptance (WS4).**
- Unit tests for each branch of W4.2 including the 2% band, every non-rung-1 price and the ute payload branch: PASS.
- Every value has a non-null `source_url` on an ato.gov.au or state government domain and a `checked_at` within 45 days of the commit: PASS (rows not retrieved carry null values and the attempted URL; asserted by test).
- `/answers/under-fbt-threshold` driven from this data: DEFERRED (WS3 page does not exist yet).
- W4.3 display (row, state picker): DEFERRED (after WS1).
- Rule 5 checks: validate/typecheck/lint PASS; test 1307 pass / 8 fail (the inherited 8 only); build and e2e not run (no UI change).


**Review fix 2026-11-05 (orchestrator).** Ute payload branch added to `assessThresholds`. validate, typecheck, lint exit 0; scoped `tests/thresholds.test.ts` + `tests/coverage-reports.test.ts`: 27 tests, 27 pass, 0 fail. Full suite not rerun (per orchestrator); last full run above (1307 pass / 8 inherited fail) predates this change.

## Ambiguities found

- WS4: ATO ties the FBT cap to the LCT *value* (GST-inclusive, includes dealer delivery), while the catalogue holds the maker list price before on-road costs; hence the 2% "close to cap" band. Utes must also be designed to carry under one tonne to qualify: a ute returns `unknown` ("utes qualify only if designed to carry under one tonne; payload not checked") unless the catalogue holds a sourced `payload_kg`; a sourced payload of 1,000 kg or more returns false with the reason "not eligible: ute designed to carry one tonne or more" (row text: "No (not eligible: …)"). Counts unchanged (no catalogue ute is at 1,000 kg or more); scoped tests now 28/28, validate/typecheck/lint exit 0.
- WS4: 33 Tier 1 price facts have no ladder rung; read strictly as not rung 1.

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)

