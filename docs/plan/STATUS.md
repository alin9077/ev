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

## Ambiguities found

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)
