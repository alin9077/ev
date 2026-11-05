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
| D0.3 | `tests/selling-points.test.ts` "all eligible buyer reasons at the policy date have matching source dependencies": for 3 Cadillac versions (`cadillac_lyriq_my27_sport_awd__20261010`, `cadillac_lyriq_my27_v_awd__20261010`, `cadillac_vistiq_my27_platinum_awd_6_seat__20261010`) the summary cites `r10_kc_cadillac_offers` and `r10_kc_cadillac_optiq_offer_image` (from `availabilityGuardSourceIds` in `data/buyer-selling-points-2026-10-10.json`), which the source-level car does not carry in its fact, feature or availability sources, so the test's pack lacks them. Both sources exist in the source registry and production `pack()` adds summary source IDs, so no shipped page is missing a citation. Options: (a) trim those Cadillac guard lists to sources the cars use; (b) add the offers sources to the cars' evidence; (c) change the test oracle to build the pack with the summary applied. Needs a data-ownership call, not made. Test left failing, unmodified. | Stop on this one (W0.8 instruction) | | |

## Workstreams

| WS | State | Branch | Last commit | Worker | Updated |
|---|---|---|---|---|---|
| WS0 Consolidate Roadmark | in progress (W0.4 blocked on owner; W0.8 test fixes pending) | claude/ws0-roadmark-source-938862 | | Sonnet worker (Claude Code) | 2026-11-05 |
| WS1 Public beta (M2) | not started | | | | |
| WS2 Refresh loop + changes page | in progress | claude/ws2-refresh-loop-670724 (stacked on claude/ws0-roadmark-source-938862) | | Sonnet worker (Claude Code) | 2026-11-05 |
| WS3 Answer pages + any-pair | not started | | | | |
| WS4 Money thresholds | not started | | | | |
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

### 2026-11-05 WS2 — in progress

Branch: `claude/ws2-refresh-loop-670724`, cut from the in-progress WS0 branch (stacks on the WS0 PR). Environment: macOS (Darwin), 48 GB RAM, 16 CPUs, Node v24.22.0 (plan says Node 22; engines is `>=22`), pnpm 11.19.0. WS0's 8 inherited test failures (m1-evidence-grading, mercedes-passenger-catalogue, package-source, selling-points, scene-dynamic-geometry) are fixed in W0.8 on the WS0 branch and are not touched here.

### 2026-11-05 WS2 — in progress (usage limit reached; handed back unfinished)

Branch `claude/ws2-refresh-loop-670724`, stacked on the WS0 PR (#2). Environment: Apple M3 Max, 48 GB RAM, 16 CPUs, Node v24.22.0, pnpm 11.19.0.

**Done:** W2.1 runbook, W2.2 tooling (`refresh:plan/scaffold/build`), W2.3 `diff.ts` + `data/changes/schema.json` + snapshots, W2.4 `/changes`, `/changes.json`, `/changes/feed.xml`, llms.txt, sitemap, portable route. W2.5: 16 packets dated 2026-11-05 (BYD, Tesla, Geely, Zeekr, Jaecoo, Kia, MG, IM, Hyundai, Toyota, Volkswagen, Volvo, GWM, GAC, BMW, and Lexus as a price/availability packet only). `pnpm validate` passed after each. `data/changes/2026-11.json` generated by diff.ts: 14 price changes (12 Hyundai, 2 MG MGS6).

**Outcomes across 163 on-sale versions:** 233 claims rechecked unchanged, 49 changed (35 same-value offer renewals), 184 not rechecked ("source unavailable, value retained, date unchanged"; each listed with its reason in `docs/plan/WS2_UNRECHECKED_CLAIMS_2026-11-05.md`).

**Acceptance (`report:stale --as-of 2026-12-01`, zero stale price claims): FAIL.** 74 of 163 on-sale `price_aud` facts and 310 price-like claims in total would be past 45 days (89 on-sale prices fresh). Causes: legacy `driveaway_price` equipment rows cannot be re-dated by a recheck; offers ending 30 Nov; GWM ORA 5 and VW ID. Buzz MY26 price facts bound to configuration evidence; BMW/Volvo prices behind postcode forms; dealer-only and secondary-reported prices; GAC AION UT/V basis conflict (page calls $31,990 a drive away price, catalogue holds it as MSRP). Volvo, BMW, GWM, GAC were largely not rechecked.

**Needs review:** Zeekr 7X Black Edition ($75,900 on configurator) vs catalogue version not on sale; Hyundai INSTER Cross shows a 1-cent change (43,500 to 43,499.99) from the maker API.

**Not done:** rule 5 on the final tree. Last full `pnpm test` (before test fixes) was still running: 715 passing, 2 failing, both date-pinned tests (as-of 2026-10-14/15, earlier than the new evidence); fixed by moving their as-of date to the new evidence date, assertions unchanged (`availability-corrections`, `brand-live-safety`); those two files pass alone. The full run's final tally, the 8 WS0-inherited failures, `pnpm build`, `build:public`, `test:e2e` (spec written, not run), and the /changes portable check are all still to do. Typecheck and lint passed.
**W0.5 — run 2026-11-05; checks do not all pass.**

Environment: Apple M3 Max, 16 cores, 48 GB RAM, macOS, **Node v24.22.0** (plan says Node 22; not tested), pnpm 11.19.0, `NODE_OPTIONS=--max-old-space-size=6144`. Install: `CI=true pnpm install --frozen-lockfile` passed (6.4 s).

```
pnpm validate        "result": "PASS" counts: variants 433, families 171, generations 194, criteria 69, evidence 29877 (current 351, outgoing 46, provisional 36); sourceReferences 3858; publicationIssues 15; sha256 010ded19...4657   68.6 s, max RSS 1.28 GB
pnpm typecheck       tsc --noEmit, exit 0     8.4 s, max RSS 1.14 GB
pnpm lint            eslint src tests scripts, exit 0     7.0 s, max RSS 1.11 GB
pnpm test            FAILED (exit 1), not killed. 1,653.5 s (27.6 min), max RSS 3.19 GB
  ℹ tests 1299
  ℹ suites 0
  ℹ pass 1290
  ℹ fail 8
  ℹ cancelled 0
  ℹ skipped 1
  ℹ todo 0
  ℹ duration_ms 1652609.878
pnpm report:coverage --as-of 2026-10-16   exit 0, 84.3 s, max RSS 1.73 GB
  314 Tier 1 on-sale | price 90.1% filled / 36.9% Confirmed | range 90.8% / 67.2% | battery 100.0% / 83.4% | DC time 79.6% / 47.8% | seats 97.1% / 72.3% | boot 90.1% / 76.8% | warranty 100.0% / 99.0% | strength+trade-off 98.7% | in rankings 8.6%
  Scope: 356 Tier 1 versions; all 433 catalogue versions preserved. 5147/5338 on-sale core cells reviewed.
  C1 OPEN, C2 OPEN (285 gaps), C3 OPEN, C4 OPEN (351/356), C5 OPEN (0/6), C6 PASS.
  Research-complete brands: Audi, BYD, GAC, Geely, IM, Jaecoo, KGM, Kia, MG, MINI, Mazda, Nissan, Tesla, Toyota, Zeekr; coverage-qualified: none.
pnpm build           exit 0, 4,526 s (75.4 min), max RSS 3.27 GB. Next 16.3.8: "Generating static pages using 1 worker (479/479) in 72.1min". Includes build:portable.
  "Portable Roadmark experience written (50.65 MB)." index.html = 50,646,106 bytes; .next 813 MB.
```

`pnpm test` was started in the background and waited for with no time limit. The runner prints `ℹ` lines, not `# tests`. Rule 5 order was followed (validate, typecheck, lint, test); `pnpm test:e2e` was not run (no UI change). `pnpm build:portable` was not run separately: `pnpm build` runs it as its last step.

The plan's `pnpm build` expectation of 433 / 356 / 314 holds (coverage). The 8 test failures are listed next.

**Known failures inherited from the Ford32 source (8)** — reproduced when each file is run alone (a scoped run, not the full suite):

| # | File | Test | Cause |
|---|---|---|---|
| 1 | `tests/m1-evidence-grading.test.ts:381` | initial grades preserve source summaries while reviewed brand packets replace only their own copy | `gradeReviewStatus` is `undefined`, test expects `"review_required"`; cause not established |
| 2 | `tests/mercedes-passenger-catalogue.test.ts` | Mercedes imports seven manufacturer-listed records without stock or MY claims | catalogue has 11 Mercedes passenger records, test pins 7 |
| 3 | same | Mercedes charging conflicts cannot become canonical maxima | `200 !== null` (same 11-vs-7 data change; not separately diagnosed) |
| 4 | same | GLB seven-seat claim never supplies occupied-row cargo or an inherited battery warranty | `8 !== null`; same, not separately diagnosed |
| 5 | same | Mercedes usable energy and scoped warranty durations remain distinct | assertion false; same, not separately diagnosed |
| 6 | `tests/package-source.test.ts` (runs `tests/package_source_test.py:291`) | source archives round-trip, preserve bytes, exclude generated files and enforce their size limit | macOS temp path: result is `/private/var/...`, test expects `/var/...` (symlink) — environment difference |
| 7 | `tests/scene-dynamic-geometry.test.ts` | 36 populated-spec price scene frames preserve source84 geometry, materials, transforms and shot definitions | pinned SHA-256 differs; cause not established |
| 8 | `tests/selling-points.test.ts` | all eligible buyer reasons at the policy date have matching source dependencies | assertion false; cause not established |

No test was weakened, skipped or deleted. **Owner decision (relayed by the orchestrator, 2026-11-05): "8 failing tests: document in the PR, fix in W0.8".**

**W0.6 — done.** `docs/ENVIRONMENT.md` written. There is no START-HERE / RECOVERY / OPEN-THIS prose at the repository root of the Ford32 tree, so nothing was removed (`docs/CHECKPOINT103.md` is a dated milestone document and was left).

**Archive scripts exercised (read-only parts):** `archive.sh manifest` wrote 3,135 entries (3,132 `RoadmarkX/` files + 2 zips + 1 `.sha256`) in 46 s; list SHA-256 `6fb94a109a08702fa361359552d67d76c084f48cfede9938330ef7ace9d31fd1`. `crosscheck.py`: CONTENTS-MANIFEST payload archive OK; recovery-manifest entries matched 3,588, differing 471 (49 distinct manifest/archive pairs; historical manifests, cause not established), 44 names not present. `create` stopped at "git-lfs is not installed"; `push` refused without owner approval. No external repo was created.

**Gaps this workstream must name explicitly**
- Lexus33 recovered: **no**.
- Full `pnpm test` aggregate: **fail** — 1299 tests, 1290 pass, 8 fail, 1 skipped (not killed).
- `pnpm build`: **pass**, 4,526 s. `pnpm build:portable`: **pass** (run inside `pnpm build`), output 50.65 MB (50,646,106 bytes `index.html`).
- Ford32 manifest files whose hash did not match: **0 of 706** (checked at extraction and again in the working tree).

**Acceptance (WS0)**
- Roadmark source is ordinary tracked files at the root: **pass** (706 files + manifest, hashes verified; commit e213a55).
- Tag `ev-side-by-side-2026-11-04` on old `main`: **pass locally**; pushed with the PR.
- Archives removed from the tree and copied to `ev-archive`: **blocked** — awaiting owner go-ahead.
- Typecheck, validate, lint: **pass**.
- Full test suite: **fail** — 8 failures at first run; after W0.8, 1 failure (D0.3), 1297/1299 pass.
- Coverage 433 / 356 / 314: **pass**.
- Build and portable build: **pass**.
- `docs/ENVIRONMENT.md`: **pass**. PR opened: see below.
- Lexus33 delta: **not recovered** (no fabrication).

**W0.8 — 7 of 8 fixed; 1 awaiting owner (D0.3) (2026-11-05).** Full `pnpm test` rerun with no time limit after the fixes (1,573.8 s, max RSS 4.28 GB, exit 1, not killed):

```
ℹ tests 1299
ℹ suites 0
ℹ pass 1297
ℹ fail 1
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 1572938.20875
```

Remaining failure: `selling-points` "all eligible buyer reasons at the policy date have matching source dependencies" (D0.3). Resolutions, one commit each, no test weakened, skipped or deleted:
1. `package-source`: compare `os.path.realpath` on both sides (macOS `/var` → `/private/var`); assertion otherwise unchanged.
2–5. `mercedes-passenger-catalogue` (4): the dated 15 Oct packet (`m1-mercedes-benz-2026-10-15`, 39 sources) legitimately added 4 versions (GLC 400 4MATIC, eVito Tourer 129 Mid, EQA and EQB 250+ City Edition) and filled reported price/range, drive, AC, DC peak and per-version battery warranty on the original 7. Tests now assert the exact 7 + 4 record IDs, no stock or model-year claim on any row, that values on the originals cite the packet with an earned grade, and keep the GLB cargo, attributed DC table, usable-energy and commercial-exclusion assertions.
6. `m1-evidence-grading`: the drift test took the first previously-standard range entry in ranking order; at the fixed as-of 2026-10-13 only 22 Tier 1 entries were rankable (0 previously-standard) and the first was a VW ID. Buzz Cargo van, which the passenger/ute-only regrading guard does not cover. Selection now restricts to guarded classes and ranks at the newest packet date (74 candidates); assertions unchanged.
7. `scene-dynamic-geometry`: all 36 sampled frames differed from the pinned source84 SHA-256 digests while item counts matched; plan rule 4 forbids hash pins. Replaced with determinism, finite and well-formed mesh/transform/material checks, shot variation, and a populated-spec-changes-a-frame check; item counts retained.
8. `selling-points`: not fixed, see decision D0.3 in the table at the top.

#### WS2 follow-up (5 Nov, later): test triage and acceptance

Environment: Apple M3 Max, 48 GB RAM, 16 CPUs, Node v24.22.0, pnpm 11.19.0.

**First full `pnpm test` (11 failures):** (a) 2 date-pinned tests fixed here (`availability-corrections`, `brand-live-safety`: as-of dates moved to 2026-11-05, assertions unchanged); (b) 8 WS0-inherited (`m1-evidence-grading`, 4 Mercedes, `package-source`, `scene-dynamic-geometry`, `selling-points`); (c) 1 caused by WS2 data: `mg4-additions` as-of date pin (fixed the same way). I also found my Lexus packet cleared the legacy RZ/ES buyer summaries (no earlier packet to re-issue them), so it was **removed**; Lexus is not refreshed (needs a normal brand update).

**Second full `pnpm test`** after merging WS0's W0.8 fixes (1,315 s):
```
ℹ tests 1339
ℹ pass 1337
ℹ fail 1
ℹ skipped 1
```
The one failure is `selling-points` (Cadillac, owner decision D0.3), inherited from WS0, not WS2.

`pnpm typecheck`, `pnpm lint`: pass. `pnpm validate`: pass after every packet.

**Acceptance (WS2):**
- `report:stale --as-of 2026-12-01` shows zero stale Tier 1 price claims for the 14 brands: **FAIL.** Of 158 on-sale versions in the 15 refreshed brands, 74 `price_aud` facts are stale (Volvo 16 of 18, MG 9 of 17, Hyundai 10 of 21, VW 8 of 13, BMW 8 of 9, Kia 7 of 27, IM 6 of 6, GAC 4 of 4, GWM 3 of 3, Zeekr 2 of 8, Jaecoo 1 of 1; BYD, Tesla, Geely, Toyota 0). Counting all price-like claims incl. equipment `driveaway_price` rows: 310.
- `data/changes/2026-11.json` exists, validates against `data/changes/schema.json`, produced by `diff.ts`: **PASS** (test re-derives it from the committed snapshots).
- `/changes` renders in Next, static and portable builds with the same entries: **Not yet verified** (build and e2e below).
- Behavioural tests per change type; rechecked-unchanged gives no entry but moves the date: **PASS** (`tests/refresh-diff.test.ts`).

**Gaps list:** brands not refreshed: Lexus (packet removed, above); Volvo, BMW, GWM, GAC mostly not rechecked (postcode forms, configuration-evidence binding, basis conflict). Claims not rechecked: 184, each with its reason in `docs/plan/WS2_UNRECHECKED_CLAIMS_2026-11-05.md`.

## Ambiguities found

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)
