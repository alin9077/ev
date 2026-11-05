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
| WS4 Money thresholds | in progress | claude/ws4-money-thresholds-8e2e2f | | Sonnet worker (Claude Code) | 2026-11-05 |
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

## Ambiguities found

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)
