# Retrieving and running the execution plan

The plan, the ledger and the worker prompt live in this directory on the branch `claude/affectionate-ramanujan-9bj3hv` (and on `main` once merged).

## Retrieve

```bash
git clone --depth 1 --filter=blob:none --branch claude/affectionate-ramanujan-9bj3hv https://github.com/alin9077/ev.git ev
```

```bash
cd ev && cat docs/plan/EXECUTION_PLAN_2026-11-04.md
```

The shallow, blob-filtered clone avoids downloading the 1.2 GB of archive history. The archives themselves are fetched on demand only if a command touches them (WS0 needs one file: `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz`).

If the branch has already been merged, use `--branch main` instead.

## Execute

1. Open `docs/plan/STATUS.md`, read the owner decisions table, and fill in any answer you already have.
2. Pick the lowest-numbered workstream that is "not started" and whose dependencies (plan section 3 table) are "done". WS0 and WS7 have no dependencies.
3. Start a worker with the text in `docs/plan/START_PROMPT.md`, substituting the workstream number.
4. When the worker's pull request arrives, check that STATUS.md contains the acceptance list with pass/fail beside every line and real numbers in the gaps list. Merge only then.

## Running it as a Claude Code cloud session

From claude.ai/code, open the repository `alin9077/ev`, choose the branch above, and send the contents of `docs/plan/START_PROMPT.md` with the workstream number filled in. WS0 and WS1 need an environment with at least 16 GB RAM; the full Roadmark test suite and typecheck were measured there (see the baseline in STATUS.md).

## Keeping the plan current

The plan is versioned by its filename date. Do not edit a dated plan after workers have started on it; write a new dated file and note the supersession at the top of both. STATUS.md is the only file that changes continuously.
