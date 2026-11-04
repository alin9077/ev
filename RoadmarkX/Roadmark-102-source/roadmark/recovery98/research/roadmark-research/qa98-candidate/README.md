# Root-only checkpoint98 serial QA runner

Status: static candidate, not executed, imported or syntax-checked. Root owns independent review, application of the narrow-detail candidate and every executable check. This directory does not apply, repair or execute application code.

## Minimal lineage and current baseline

`run_qa98.py` is the reviewed QA97 runner copied with only these substitutions:

- Both `roadmark97.serial-qa.v1` receipt schema strings become `roadmark98.serial-qa.v1`
- The final `QA97_COMPLETE` / `QA97_FAILED` console markers become `QA98_COMPLETE` / `QA98_FAILED`

All executable admission, stage, evidence, output-verification and interruption-cleanup logic is otherwise byte-for-byte preserved. The source file remains unchanged at `roadmark-research/qa97-candidate/run_qa97.py`, SHA256 `8987a86aa9ae380211e3e6ca0765d73a2146558bd1bc754a2756d69c53ba860d`. See this directory's manifest for the new runner's measured static hash and size. A measured hash is not independent approval or an execution result.

The observed checkpoint97 baseline input map is:

- Path: `roadmark-research/applied97/expected-inputs-revision2.json`
- SHA256: `cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e`
- Observed input membership: 1,668 files

That baseline hash and membership were verified during static preparation. Checkpoint97 save/packaging is still pending in the parent task; the map's existence does not establish a completed save or accepted checkpoint. Do not derive a replacement baseline from an already-mutated application. Retain the existing checkpoint96 fallback and all checkpoint97 evidence. Any remaining predecessor-save gate belongs to root before source changes or execution.

The currently unapplied `roadmark-research/narrow-detail98-candidate/MANIFEST.json` declares three changed/added files: three CSS declaration changes in `src/app/globals.css`, three new Node source tests in `tests/detail-responsive.test.ts`, and six new browser source tests in `tests/e2e/detail-reflow.spec.ts`. Independent review/revision is pending. Those are candidate declarations, not runner gates, approved final inventory, or observed passing tests. No candidate manifest hash or final expected-input-map hash is pinned in this deliverable. Supply the actual reviewed candidate manifest and complete final map, with their independently approved SHA256 values, at runtime. If review changes a file or test count, use the final evidence rather than these preparation-time declarations.

## Configuration and exact inventory gate

The baseline and final maps are nonempty JSON objects mapping every admitted application-relative input path to its lowercase SHA256. Duplicate JSON keys, non-finite JSON values, unsafe paths, symlinks in observed scope, missing/unmanifested inputs and drift fail closed.

The candidate manifest must have a nonempty `files` array. Every row must contain a unique `path`, `beforeSHA256`, `sha256` and positive integer `bytes`. A new input uses `beforeSHA256: null`; replacements must match the checkpoint97 baseline's preimage hash. The postimage must differ from the preimage. The applied candidate file's byte count must match. Optional `appRoot` must equal `roadmark-work/roadmark`; optional `applicationRoot` must equal the actual absolute application path.

The expected map must equal exactly the baseline map plus the candidate additions/replacements. Actual application membership and hashes must then equal that final map. Deletions, unchanged candidate rows, ignored-output mutations in the manifest and unrelated source changes are rejected. Exact candidate delta rows are retained in the comparison receipt, and the entire manifest is pinned by path and hash. No fixed candidate file count, test count or candidate-specific path list is embedded in the runner.

Application inputs exclude only dependency/VCS directories (`node_modules`, `.git`), the root `.next` tree, the four generated portable aliases, `tsconfig.tsbuildinfo`, and three separately guarded historical metadata files. No manifest-controlled output exemption is accepted. The `baselineInputs` configuration field is generic: its checkpoint97 meaning comes from the reviewed runtime path/hash, not a hardcoded checkpoint selector.

## Root procedure and runtime invocation

1. Independently review and approve the exact runner bytes/hash, actual candidate manifest bytes/hash, all candidate changes and complete final input-map bytes/hash. Check that the final map is derived from the pinned checkpoint97 revision-2 baseline and the entire reviewed candidate delta. Resolve predecessor-save gates before proceeding.
2. Root alone applies the approved candidate. This runner does not apply source changes or construct the final input map. Do not execute an incomplete candidate or substitute the preparation-time manifest because the example mentions it.
3. Stop all other application writers, builds, tests and servers and keep them stopped throughout the attempt. `--exclusive-workspace-confirmed` confirms that responsibility. The app-directory advisory flock coordinates runners that use it; it cannot enforce exclusivity against unrelated processes.
4. Use a new evidence directory outside the app with an already existing parent. Never reuse, remove, relabel or overwrite a failed attempt. Store any root console log outside the attempt directory.
5. Set the five runtime values below from the independently reviewed final artifacts. These variables intentionally have no default, and missing values prevent launch. The output example is for the first actual attempt only; advance the attempt path for any retry.
6. Run only after the reviews and application are complete. Retain the execution tool's actual terminal/exit result or an independently reviewed outer-launcher receipt, together with all generated evidence.

```sh
python -B /workspace/scratch/586427eef9f2/roadmark-research/qa98-candidate/run_qa98.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --output roadmark-research/applied98/qa-attempt1 \
  --baseline-inputs roadmark-research/applied97/expected-inputs-revision2.json \
  --baseline-inputs-sha256 cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e \
  --expected-inputs "${REVIEWED_FINAL_MAP_PATH:?Set the reviewed workspace-relative final input-map path}" \
  --expected-inputs-sha256 "${REVIEWED_FINAL_MAP_SHA256:?Set its independently approved SHA256}" \
  --candidate-manifest "${REVIEWED_CANDIDATE_MANIFEST_PATH:?Set the actual reviewed workspace-relative manifest path}" \
  --candidate-manifest-sha256 "${REVIEWED_CANDIDATE_MANIFEST_SHA256:?Set its independently approved SHA256}" \
  --approved-runner-sha256 "${REVIEWED_QA98_RUNNER_SHA256:?Set the independently approved runner SHA256}" \
  --exclusive-workspace-confirmed
```

There are five required runtime variables in this example: final-map path/hash, candidate-manifest path/hash and runner hash. The root must establish their values before invocation; no hash is automatically promoted to approval. `run-result.json` is written before the runner exits and cannot establish the external runner exit. This deliverable supplies no outer launcher, independent emitted-output verifier, public-export runner or release sign-off.

## Preserved seven-stage serial execution

Stages run in this order and stop on the first failure:

1. `non_http_tests`: every frozen `tests/**/*.test.ts` input, lexicographically sorted, except exactly `tests/local-review.test.ts`
2. `local_http_tests`: only `tests/local-review.test.ts`
3. `typecheck`: `node node_modules/typescript/bin/tsc --noEmit`
4. `lint`: `node node_modules/eslint/bin/eslint.js src tests scripts`
5. `validation`: `node --import tsx scripts/validate.ts`
6. `production_build`: `node node_modules/next/dist/bin/next build`
7. `portable_build`: `node --import tsx scripts/build-portable.ts`

Both test stages use `node --import tsx --test --test-reporter=tap --test-concurrency=1` with explicit frozen test paths. There is no execution through package-manager scripts, parallel test group, implicit test discovery or test-count constant.

Browser E2E sources are retained as frozen inputs and may be checked by typecheck/lint, but browser `*.spec.ts` files are excluded from the Node test command by its existing `*.test.ts` selection. No browser script, Playwright command or other browser automation is added or run here. CUA remains the sole actual browser route for this task, owned by root. Retained source assertions do not establish browser execution or visual correctness.

Every child gets `NODE_OPTIONS=--max-old-space-size=1280 --max-semi-space-size=8` and `NEXT_TELEMETRY_DISABLED=1`. `SITE_STATIC_EXPORT`, `NEXT_PUBLIC_SITE_URL` and `NODE_ENV` are removed from the inherited child environment. Other environment settings remain inherited and are not dumped into evidence. The runner does not install packages, run public export, upload, deploy, browse or mutate source. Application tests and builds may create their intended temporary/build outputs.

Before and after each stage, the runner verifies its own pin, the baseline/final-map/candidate-manifest pins, exact application input membership/hashes and the existence/hash/size/mtime of historical checkpoint metadata (`CHECKPOINT-PREVIEW-MANIFEST.json`, `CHECKPOINT-SOURCE-MANIFEST.json`, `OPEN-PORTABLE-PREVIEW.txt`). `protected-input-comparison.json` retains the exact unchanged baseline map, complete candidate delta, configured pins, input counts and historical metadata observations. These checks protect every noncandidate input in the baseline, including catalogue/data/ranking/hero/configuration/history sources.

## Real process, log and TAP evidence

Each stage produces a durable launch-request receipt, separate raw stdout/stderr logs and a terminal receipt. Evidence records argv, cwd, PID, timestamps immediately before process launch and after successful spawn, observed terminal time, elapsed duration, actual subprocess return code, ordinary exit or terminating signal, launch/interruption error and any cleanup signals. These times bracket process creation and terminal observation; they are not timestamps instrumented inside the child.

A stage passes only with an actual zero child return, no launch/interruption error, matching frozen source digests, no source error and successful applicable test/output checks. The runner retains actual TAP counters and requires exactly one terminal summary for each of tests/suites/pass/fail/cancelled/skipped/todo, a positive test count, passes equal to tests and zero failure/cancellation/skip/TODO totals. It does not invent a tally or allow skips. Root separately reconciles the actual combined test total with the final reviewed candidate expectations. Declared Node or browser test counts must never be presented as observed passing counts without their actual execution evidence.

Later stages remain `not_started` after failure; a partial launch remains `incomplete`. The console completion marker is an aid to inspection, not a substitute for stage receipts, unmodified raw logs, TAP summaries and an externally observed zero runner exit. Do not manufacture missing terminal records or infer that a never-started stage passed.

## Preserved bounded interruption cleanup

Each child starts in its own session/group. The runner records its Linux `/proc/<pid>/stat` start identity, session and group before waiting. On catchable SIGINT/SIGTERM/SIGHUP or launch/wait exception, cleanup probes group existence independently of direct-child completion.

Before either SIGTERM or SIGKILL, it verifies that the original unreaped leader has the captured identity and that its session/group equal the child PID. Keeping the leader unreaped, including as a zombie, reserves that PID/group identity until the final signal. After SIGTERM, cleanup probes for at most ten seconds, sends SIGKILL if the group persists, waits at most ten seconds for the direct child, then probes group disappearance for up to five seconds. A retained zombie leader can conservatively consume the full TERM interval. No group signal is sent after reaping.

`groupCleanup` records probe phases/times/counts, observed presence, ownership/probe errors, bounded child-wait error, whether disappearance was established and whether manual cleanup may still be needed. Only `ProcessLookupError` establishes absence; permission/probe errors are inconclusive. Missing ownership or an already-reaped leader prevents signals to an unverified group. Cleanup errors are caught so terminal/log evidence can still be preserved. An interrupted/exceptional stage always fails, even if cleanup succeeds; later stages do not start.

Ordinary child returns, including nonzero or signalled returns, do not invoke this exception cleanup because the leader is already reaped. Root must independently confirm no surviving writers after every failed attempt before retry, even if no `groupCleanup` record exists. Cleanup covers the owned process group only; descendants that escaped into a different session/group are not claimed cleaned. Residual zombies or a reused group ID may conservatively leave disappearance unestablished.

## Preserved producer output checks

Production records bytes, SHA256 and mtime for:

- `.next/BUILD_ID`
- `.next/prerender-manifest.json`
- `.next/routes-manifest.json`
- `.next/server/app-paths-manifest.json`

The emitted BUILD_ID must be nonempty and differ from the pre-run BUILD_ID hash when one existed. The exact actual BUILD_ID string is retained.

Portable records the same fields for `index.html`, `index-b.html`, `public/index.html`, `public/index-b.html`. All four must have equal bytes/hash. A changed portable hash is not required. All eight observed output timestamps must be within their respective actual producer interval, with two seconds' filesystem tolerance. Each producer output observation includes the actual producer terminal receipt's SHA256. The runner verifies these outputs again before completion. Preexisting hashes are informational observations, not proof of checkpoint97 output provenance.

## Evidence boundaries and remaining root gates

- Requires existing trusted Linux/Python 3.9+, readable child `/proc` identity metadata, Node and local packages. Interpreter/dependencies/OS/inherited environment are not fully attested or hashed
- Source bytes are guarded at observations, not continuously. A transient modification restored between checks is outside this evidence, which is why root exclusivity is mandatory
- No semantic verifier is added. Passing this runner alone does not establish correct narrow-detail reflow, preserved availability/specification/ranking/count/provenance meaning, hydrated navigation, prefetch behavior, the whole route graph, CSS/chunks/assets, browser/phone behavior, sustained performance or release acceptance
- Narrow-detail semantic review and root CUA browser checks remain separate. A manifest pin proves selected bytes; it does not prove that the candidate's CSS declarations or source assertions are correct
- Hashes and times are trusted local observations, not signed or adversarial attestation. Freshness is supported by real producer execution and timestamps, not an OS write audit
- Argument/pin/path rejection may precede evidence-directory creation. Catchable later failures preserve evidence and report failure when possible. SIGKILL, host loss, filesystem failure or interruption during evidence writing can leave incomplete evidence. Missing terminals or missing externally observed zero exit never establish success
- Keep the checkpoint96 fallback and checkpoint97 evidence/map/output archives intact. Do not overwrite them when creating checkpoint98 artifacts or infer that checkpoint97 packaging is already complete
- Publication, uploads, deployment, public export, broader browser verification and checkpoint acceptance remain separate root-owned gates

Static preparation consisted only of reading source/JSON/instructions, copying and editing text in this directory, comparing the exact diff and measuring hashes/sizes. No runner/application import, syntax check, test, build, browser, upload, deployment, Git command, Codex task or package installation was performed by this worker.
