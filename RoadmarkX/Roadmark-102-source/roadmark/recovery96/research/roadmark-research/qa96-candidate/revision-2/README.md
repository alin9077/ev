# Root-only checkpoint96 serial QA runner, revision 2

Status: static source candidate, not executed or syntax-checked. This worker read the existing QA95 contracts, application instructions, package commands, local Next CLI documentation, portable builder and local HTTP test. It authored only this directory. Root owns independent review, candidate application and every executable check.

Revision 2 preserves the original runner and fixes the independently identified interrupted-process-group cleanup defect. A direct child's exit no longer ends cleanup while descendants can survive in the owned group. Commands, input admission, stage pass criteria and output verification are otherwise unchanged.

## Pins observed during preparation

- `run_qa96.py`: SHA256 `927d4bdf6318b300c4f8581fb074eb929555b902e5dd355381fcafadc4d50ff3`
- Checkpoint95 input map, `roadmark-research/applied95/expected-inputs.json`: SHA256 `42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57`
- Prefetch candidate revision-2 manifest, `roadmark-research/discovery-prefetch96-candidate/revision-2/MANIFEST.json`: SHA256 `9421e8f6421df52c6aa9ede71a0b9e3d976cfb010f33f5de229f31097e91aa44`
- Preserved original runner, `roadmark-research/qa96-candidate/run_qa96.py`: SHA256 `b4e77d050038485c294f88bafd84eb924f93b02f85fbaa9dd5423368833d8933`
- Final root-supplied input map, `roadmark-research/applied96/expected-inputs-revision2.json`: SHA256 `6a9c4f8301f98f4a3d481ca137768563d6274b2df0f6b3df63badb3ebf1815fa`

These are observed preparation pins, not approval or a successful run. If independent review requires a candidate revision, supply the newly reviewed manifest/hash and exact final expected-input map/hash. The runner has no candidate hash, file-count or test-count constant.

## Configuration contract

The baseline and final maps must be JSON objects mapping every admitted application input path to its lowercase SHA256. Paths are app-relative. Duplicate JSON keys, non-finite JSON values, unsafe paths, symlinks in the observed scope, missing/unmanifested inputs, and drift fail closed.

The candidate manifest must contain a nonempty `files` array of unique rows with `path`, `beforeSHA256`, `sha256` and positive integer `bytes`. A new input has `beforeSHA256: null`; replacement preimages must equal the baseline map. Other candidate metadata is retained in the protected-input comparison. If present, `appRoot` must match the relative app path and `applicationRoot` must match the actual absolute app path. The expected map must equal precisely the baseline map plus those replacements/additions. Deletions, ignored-output mutations in the manifest, unchanged candidate rows and unrelated source changes are not supported.

The candidate supplied during preparation contains `src/components/discovery.tsx`, `src/portable/link.tsx` and `tests/discovery-prefetch.test.ts`. All frozen test files are automatically selected. This document does not assert the final test tally.

## Root launch after independent review and application

1. Keep all other app writers, builds, tests and servers stopped throughout the attempt. The explicit flag confirms that responsibility. The app-directory advisory flock coordinates this runner only; it cannot enforce exclusivity against unrelated processes. After every failed attempt, independently verify that no surviving writers remain before retry, even when no `groupCleanup` record exists. Ordinary child returns, including nonzero/signalled exits, do not invoke exception-path group cleanup because the leader is already reaped.
2. Apply only the reviewed candidate and prepare/pin the complete final expected-input map outside the app. Do not use this tool to apply or repair source.
3. Create the output's parent directory if necessary. The attempt directory itself must not exist. Keep the root console log outside it. Never reuse, delete or relabel a failed attempt.
4. Execute the independently reviewed, exact-pinned runner. The following command includes the final map supplied by root after its corrected candidate application and quick checks. This worker did not execute it:

```sh
python -B /workspace/scratch/586427eef9f2/roadmark-research/qa96-candidate/revision-2/run_qa96.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --output roadmark-research/applied96/qa-attempt1 \
  --baseline-inputs roadmark-research/applied95/expected-inputs.json \
  --baseline-inputs-sha256 42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57 \
  --expected-inputs roadmark-research/applied96/expected-inputs-revision2.json \
  --expected-inputs-sha256 6a9c4f8301f98f4a3d481ca137768563d6274b2df0f6b3df63badb3ebf1815fa \
  --candidate-manifest roadmark-research/discovery-prefetch96-candidate/revision-2/MANIFEST.json \
  --candidate-manifest-sha256 9421e8f6421df52c6aa9ede71a0b9e3d976cfb010f33f5de229f31097e91aa44 \
  --approved-runner-sha256 927d4bdf6318b300c4f8581fb074eb929555b902e5dd355381fcafadc4d50ff3 \
  --exclusive-workspace-confirmed
```

Root must retain the execution tool's actual terminal/exit or an independently reviewed outer launcher receipt. `run-result.json` is written by the runner before the runner exits and is not proof of that external exit. No outer launcher or independent emitted-output verifier is supplied here.

## What it does

Seven stages run serially and stop on the first failure:

1. Every frozen `tests/**/*.test.ts` file in lexicographic order, excluding exactly `tests/local-review.test.ts`, using Node's TAP reporter and test concurrency one
2. Only `tests/local-review.test.ts`, isolated with the same concurrency and reporter
3. Direct local TypeScript `--noEmit`
4. Direct local ESLint over `src tests scripts`
5. `node --import tsx scripts/validate.ts`
6. Ordinary `node node_modules/next/dist/bin/next build`
7. `node --import tsx scripts/build-portable.ts`

Every child receives `NODE_OPTIONS=--max-old-space-size=1280 --max-semi-space-size=8` and `NEXT_TELEMETRY_DISABLED=1`. `SITE_STATIC_EXPORT`, `NEXT_PUBLIC_SITE_URL` and `NODE_ENV` are removed from the inherited child environment. Other environment settings remain inherited and are not copied into evidence, avoiding disclosure of secrets. There is no install, public-export command, upload, deployment, browser or source mutation by the runner. App tests/builds can make their intended temporary/build outputs.

Before and after each stage, the runner verifies its own pin, all three externally supplied manifest/map pins, exact application source membership/hashes and the existence/hash/size/mtime of historical checkpoint metadata. This includes protection of all noncandidate catalogue, market, report, ranking, hero, configuration and other inputs present in the baseline map. `protected-input-comparison.json` retains their exact path/hash map, candidate delta, source pins and metadata observation.

Each process gets a durable launch-request record, separate raw stdout/stderr files, and a terminal record with argv, cwd, PID, timestamp immediately before `Popen`, timestamp after successful spawn, terminal-observation timestamp, duration, actual subprocess return code, ordinary exit or terminating signal, launch error/interruption and cleanup signals sent. Start/end times bracket process creation and terminal observation, not instrumented timestamps inside the child.

The child is launched in its own session and its Linux `/proc/<pid>/stat` start identity, session and group are captured before waiting. On catchable SIGINT/SIGTERM/SIGHUP or a launch/wait exception, the runner probes the original process group independently from the direct child. Before sending SIGTERM or SIGKILL, it verifies that the original unreaped leader still has the captured identity and that its session/group equal the child PID. Holding the leader unreaped, including as a zombie, prevents its PID/group identity being reused before the final signal. After SIGTERM it polls group existence for up to ten seconds and sends SIGKILL if the group persists, then waits at most ten seconds for the direct child and probes group disappearance for up to five further seconds. A retained zombie leader can conservatively consume the full TERM interval even after all active work has stopped. There are no group signals after reaping. This is cleanup of the original owned group, not a claim to discover descendants that escaped into another session/group.

`groupCleanup` retains probe phases/times/counts, actual observed group presence, ownership/probe errors, bounded child-wait error, whether disappearance was established and whether manual cleanup may still be needed. Only `ProcessLookupError` establishes absence; permission and other probe errors are inconclusive. If ownership is unavailable or the leader was already reaped, the runner will not signal an unverified group. Cleanup errors are caught so logs and terminal evidence can still be preserved. An interrupted/exceptional stage always fails and later stages never start, even if cleanup subsequently succeeds. Residual zombies or another group appearing under a reused ID can conservatively leave disappearance unestablished; neither is silently converted into a passing stage.

Test receipts retain actual TAP totals. Success requires exactly one summary for each counter, a positive test count, passes equal to tests and zero failure, cancellation, skip or TODO totals. There is no invented expected tally or automatic skip allowance. A stage receipt requires the actual zero subprocess return, no launch/interruption error, unchanged sources and successful applicable output/test checks. Later stages are marked `not_started` after failure; partial launches are `incomplete`.

Root's stated expected tally for the supplied final map is 856 non-HTTP plus one HTTP test, 857 total. This is a root-supplied expectation to compare with actual results, not a hard-coded runner assertion or an executed result from this worker.

The producing build records exact bytes, SHA256 and mtime for `.next/BUILD_ID`, `.next/prerender-manifest.json`, `.next/routes-manifest.json` and `.next/server/app-paths-manifest.json`. The new BUILD_ID must be nonempty and differ from the observed previous BUILD_ID when one exists. The portable producer records all four aliases: `index.html`, `index-b.html`, `public/index.html`, `public/index-b.html`; they must be byte-identical. No change from the old portable hash is required. All eight output timestamps must be inside their respective actual producer interval, with two seconds' filesystem tolerance. The runner compares those outputs again before completion and retains the exact actual BUILD_ID string. Preexisting output hashes are informational observations, not a checkpoint95 provenance claim.

## Boundaries and incomplete evidence

- Standard-library Python 3.9+ on the existing Linux environment with readable child `/proc` identity metadata; Node/local packages are existing trusted execution prerequisites. Interpreter, dependencies, OS and inherited environment are not attested or fully hashed
- Input exclusions match the prior contract: dependencies/VCS, the entire `.next` tree, the four portable aliases, `tsconfig.tsbuildinfo`, and three separately guarded historical checkpoint metadata files. No arbitrary output exemption is accepted through the manifest
- The observed source bytes are frozen at guard points, not continuously monitored. A temporary change restored before observation is outside the evidence. Root exclusivity is required
- No semantic verifier is copied from checkpoint95. This does not prove unchanged rendering/ranking behavior, hydrated navigation, prefetch network behavior, full route graph, CSS, `.next/server/chunks`, other emitted assets, browser/phone behavior, sustained performance or market semantics
- Timing and hashes are trusted local observations, not signed/adversarial attestations. Output freshness is supported by actual producer execution and observed timestamps; it is not an OS-level write audit
- Initial argument/pin/path rejection can occur before an evidence directory exists. If a later exception is catchable, existing evidence remains and `run-result.json` records failure. SIGKILL, host loss, filesystem failure, cleanup failure or interruption during evidence writing can leave incomplete evidence; absence of complete terminals and an externally observed zero runner exit is not success
- Each root execution attempt remains separate. Do not manufacture missing receipts or infer that a never-started stage passed. Publication, public export, release acceptance and any broader browser verification remain separate gates
