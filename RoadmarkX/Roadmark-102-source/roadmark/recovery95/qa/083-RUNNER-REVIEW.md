# Checkpoint95 independent static runner review

## Decision

Approved for exclusive root execution at these exact SHA256 values:

- `roadmark-research/qa95-candidate/run_qa95.py`: `af7690b3e991b89f8c4a58c3c92cee65763fa490d50d4c74bc43235010c23c96`
- `roadmark-research/qa95-candidate/launch_qa95.py`: `664383177b177b76398c8b2b53e509ee07f210537f6556c058810c6aa959149e`

This approval is only for the serial runner and its root launcher. The independently pinned verifier and proof launcher are not yet approved by this document. No actual checkpoint95 full QA or output proof is claimed.

The reviewer read source text, static JSON, existing HTML fragments, and hashes. The reviewer did not import or execute candidate/application code, perform syntax checks, run tests/builds, change the application, use a browser, upload, use Git, or create a task. Review files are the only writes.

## Independently checked input chain

- Saved94 complete input map: `6fe274badc06ae64b9fa2be225d73019ef98bd503dcdf0cc9b38238daa33a3ba`
- Applied95 complete input map: `42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57`
- Exact seven-file candidate manifest: `2b8f983e5da1524d0517aa0e400231c651a179fd524b71359cebb707516499ed`
- Verified94 artifact pins: `0605725e6536302590871a7ec23f36674046d5fb8aa3d1eff193cd2d49534c44`
- Verified94 proof: `65bc2b5b45956ed608cea36993c8441e89c54b2d9a772762e2fdddf4fd096538`
- Actual94 validation log: `ef2d03ab304c6a06f1acd3d6a6ed3547c9845e5d1c43791fe0727485a94a03a9`
- Saved94 upload plan: `6eb55b84ce97918c56935775c94d8c6c413a7d8b625729526fec126f827ed0ba`
- Correlated94 save receipt: `d23275b3f20a5916c0224c4f1a88fad99561b4d48542e1ea151d5d35ae649925`

Independent static JSON comparison found 1,655 old inputs, 1,659 new inputs, no deletions, exactly four additions, and exactly three replacements. Every manifest preimage and postimage matches those complete maps. The new files are the Mazda evidence sidecar, checkpoint95 fixture, checkpoint95 test, and checkpoint95 historical helper. Replacements are the market JSON and two existing checkpoint93 test/helper files. The remaining 1,652 old inputs are unchanged.

The runner rebuilds that exact map from the hard-pinned seven-file manifest and pinned94 map. It checks candidate file sizes, hashes of every current input, complete input membership, and unchanged empty correction registers. It does not apply or roll back the application delta. Generated outputs, dependencies, VCS files, tsbuildinfo, and three separately frozen historical metadata files have explicit membership exclusions.

## Execution and evidence

Both files contain standard-library imports, definitions, and a guarded main entrypoint. Neither invokes application work at import time. The runner only executes the seven explicit commands after external self-pin validation, fresh external evidence-directory creation, configuration checking, and root's exclusivity assertion. An advisory app-directory lock coordinates instances of this runner; it does not prevent unrelated writers.

The seven serial stages are all manifested top-level non-HTTP tests at concurrency 1; isolated local HTTP test; TypeScript no-emit; ESLint over src/tests/scripts; structural validation; ordinary Next production build; portable build. Required historical91/93, new95, and report-review test files must be present in the non-HTTP command. The expected verifier tally is 850 non-HTTP tests plus one isolated HTTP test. The runner's success alone does not independently validate those log tallies.

The ordinary-build environment explicitly sets Node memory limits and disables telemetry. SITE_STATIC_EXPORT, NEXT_PUBLIC_SITE_URL, and NODE_ENV must be absent. No public-export, deployment, browser, phone, upload, or release action is included.

The initial selected outputs must exactly equal the pinned94 artifact map, and the prebuild BUILD_ID must be bRi5VFzp553AQovWPUkLQ. Before any stage, the runner captures full selected artifact SHA/size/mtime and bounded presentation, then rehashes outputs to detect capture drift. Each stage records actual argv, cwd, PID, start/end/duration, real child exit, interruption status, log hash/size, and source hashes before/after. Its actual process terminal is persisted before output capture. Capture errors and source drift are recorded in a stage receipt before the runner fails closed.

The production observation is captured by the producing runner after the real child terminates and before portable generation. Core production and all portable mtimes must fall inside producer intervals with two seconds of timestamp tolerance. A different production BUILD_ID is required. All four portable aliases must agree with one another and differ from the saved94 portable bytes; exact semantic bounds remain the verifier's responsibility.

Final outputs must exactly equal the immediately captured artifacts including metadata. Full input configuration, historical metadata, and runner bytes are rechecked before successful run-result creation. Failed or interrupted attempts are preserved rather than reused.

## Presentation boundary

All selected production .html pages are compared by hashes of the markup after excluding complete script elements and script preload links. CSS hashes and membership must remain unchanged. Only the three exact market-count fragments are normalized from 241 to 242, each with a uniqueness check. Static inspection confirmed those predecessor fragments currently exist. No other text replacement or broad numeric normalization occurs.

This is a bounded static presentation comparison. It excludes production hydration/RSC scripts and JavaScript preload references, does not prove the whole production runtime graph, and does not replace browser/phone testing. The portable verifier must separately preserve outside-payload bytes and decoded non-market data, because legitimate market changes can renumber the global string dictionary.

## Root launcher

The launcher requires externally supplied SHA pins for itself and the runner, safe external tool/attempt paths, and wholly new attempt/log/terminal paths. It uses the current Python interpreter with -B, passes through the exact input-map and candidate pins, and launches the approved runner with root's explicit exclusivity flag. It records the real runner PID, return code, timestamps, duration, exact command and launch arguments, log bytes/hash, and actual run-result hash if present.

A launch failure is recorded with a null PID/exit and an error; interruption signals only the child runner's process group, allowing the runner to finish its own stage cleanup. Source/tool guards use explicit checks, so Python optimization cannot silently remove them. SIGKILL, machine loss, filesystem failure, or a repeated interruption during cleanup can still leave incomplete evidence; absence of a terminal/result is not success. Root must inspect the actual launcher completion and terminal, not infer success from starting the command.

## Exact proposed root command

```sh
python -B /workspace/scratch/586427eef9f2/roadmark-research/qa95-candidate/launch_qa95.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --runner /workspace/scratch/586427eef9f2/roadmark-research/qa95-candidate/run_qa95.py \
  --approved-runner-sha256 af7690b3e991b89f8c4a58c3c92cee65763fa490d50d4c74bc43235010c23c96 \
  --approved-launcher-sha256 664383177b177b76398c8b2b53e509ee07f210537f6556c058810c6aa959149e \
  --output roadmark-research/applied95/qa-attempt1 \
  --expected-inputs roadmark-research/applied95/expected-inputs.json \
  --expected-inputs-sha256 42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57 \
  --candidate-manifest roadmark-research/market-lead95-implementation/candidate-manifest.json \
  --candidate-manifest-sha256 2b8f983e5da1524d0517aa0e400231c651a179fd524b71359cebb707516499ed \
  --exclusive-workspace-confirmed
```

Root must first stop other app writers/tests/builds/servers, unset the three prohibited environment variables, recheck both approved tool hashes, and retain all actual attempts. These approvals are invalid for changed tool bytes. No static blockers found for these exact runner/launcher hashes under the stated operating conditions.
