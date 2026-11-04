# Rebuilt101 portable verifier revision1

Root authorized this separate narrow revision after independent static review found the original QA claims broader than its checks. The original packet remains unchanged and unexecuted. Its verifier SHA is `8b8404dd1ca644c8a42a1e5633b7b2a6a40d685f9e30799faccb406540a8cdd8`; its manifest SHA is `5c1d71e4bab1f55a63620dbfa64f9998fe5a79af4d4785d9b21bf55afe911398`.

Prepared only. No candidate or application code was imported, executed, syntax-checked, tested or built. No application, runner, QA output or original candidate file was modified. The complete narrow source diff is `revision.diff`.

## Added checks

- Independently derive all non-HTTP tests from every final frozen `tests/**/*.test.ts` path, excluding only `tests/local-review.test.ts` for its required isolated second stage
- Independently specify all seven argv lists from the exact pinned reviewed99 runner mechanics; compare the sealed plan and each terminal to these required commands
- Validate the sealed execution request's exact runner argv, workspace/output, source-map/candidate configuration and pins, runner hash, start identity and root-exclusive-workspace flag
- Validate exact execution-request and each stage receipt's environment overrides, every stage's full declared removal list, and the request's ordered subset of actually inherited removed names
- Reject a non-null outer `session_id`, even if an object also claims exit0, while retaining the genuine zero-exit/chunk/output requirements
- Report independently derived commands, full selected frozen test paths, execution-request/environment validation and absence of an active outer session

The selected environment remains precisely `NEXT_TELEMETRY_DISABLED=1` and `NODE_OPTIONS=--max-old-space-size=1280 --max-semi-space-size=8`. Removed names remain `SITE_STATIC_EXPORT`, `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`. These are checks of sealed records from the pinned runner, not an independent operating-system environment attestation.

The default workspace root is adjusted for the nested revision directory. The original source/artifact mechanisms and acceptance conditions are otherwise unchanged: exact14-file delta, final-authored map and expanded QA map, source100/current hashes, canonical audit, four portable aliases, whole HTML, encoded/decoded data ordering, runtime/CSS/hero and art. No payload/source requirement or unknown-delta failure is relaxed. Original INPUT-PINS.json remains the required pinned source of identities.

## Root use after independent review and actual final QA completion

```sh
PYTHONDONTWRITEBYTECODE=1 python3 roadmark-research/rebuilt101-portable-proof-candidate/revision1/verify_rebuilt101_portable.py \
  --workspace-root /workspace/scratch/586427eef9f2 \
  --qa-result roadmark-rebuild101/qa-attempt1/run-result.json \
  --qa-result-sha256 ACTUAL_FINAL_QA_RESULT_SHA \
  --outer-terminal roadmark-rebuild101/qa-attempt1-external-terminal.json \
  --outer-terminal-sha256 ACTUAL_FINAL_EXTERNAL_TERMINAL_SHA \
  --expected-html101-sha256 ACTUAL_FINAL_INDEX_HTML_SHA \
  > roadmark-rebuild101/portable-proof-revision1-attempt1.stdout.json \
  2> roadmark-rebuild101/portable-proof-revision1-attempt1.stderr.json
```

The example has not been executed. Supply actual final paths/hashes and the genuine final tool result from the current QA run. Record the verifier's own actual exit and retain failure evidence. An external result from another command is not valid merely because its exit is zero. The existing original PLAN-AND-DERIVATION.md explains unchanged source/artifact limits; this revision closes its identified QA-contract omissions without asserting browser/phone/whole-Next-graph or release validation.
