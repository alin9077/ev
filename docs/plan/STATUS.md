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
| WS0 Consolidate Roadmark | in progress (W0.4 blocked on owner; W0.8 test fixes pending) | claude/ws0-roadmark-source-938862 | | Sonnet worker (Claude Code) | 2026-11-05 |
| WS1 Public beta (M2) | not started | | | | |
| WS2 Refresh loop + changes page | not started | | | | |
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
- Full test suite: **fail** — 8 failures, fixes under W0.8.
- Coverage 433 / 356 / 314: **pass**.
- Build and portable build: **pass**.
- `docs/ENVIRONMENT.md`: **pass**. PR opened: see below.
- Lexus33 delta: **not recovered** (no fabrication).

## Ambiguities found

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)
