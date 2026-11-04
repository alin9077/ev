# Root acceptance procedure, save revision2 / source revision3

This is a static, unexecuted checkpoint97 save revision2 packet derived from reviewed96 revision3 tooling and the frozen first97 save packet. It binds source candidate revision3 and expected-inputs-revision2.json. The earlier packet remains historical HOLD after lint failure. FullQA attempt1 failed lint after 887 non-HTTP tests, one HTTP test and typecheck passed; attempt2 failed cumulative-manifest admission before all seven stages. Neither produced current97 builds. Root must independently review it before syntax checks or execution. Keep writers/builds stopped during final observation and packaging. Never change an existing successful or failed evidence directory to make it pass.

## 1. Review source and future QA

Review all three scripts and packet hashes. Confirm the exact12-file candidate, six replacements/six additions,1662-to1668 map and seven display substitutions across ten ID/field mappings. Source revision3 corrects the metadata contract only. Its twelve primary rows are cumulative against96, with null preimages for all six additions. Its separate incrementalFiles record retains the pre-lint-fix97 render-test history; that exact original test is archived separately. The revision2 application receipt and actual quick checks establish the test-only code correction. Require actual formal source-revision approval and fresh full QA.

All seven serial stages must pass ordinarily: non-HTTP tests, isolated HTTP tests, typecheck, lint, validation, production build, portable build. The packager uses actual complete TAP summaries; it does not hard-code or manufacture a new test tally. The exact pinned runner must produce current result/evidence membership, stable input digest, actual terminal/log hashes, serial timing and the eight producer-bound output observations. The four portable aliases must match. BUILD_ID must differ from saved96's `i9nSXvDMk9qf8wSVyThUa`.

These are trusted local observations, not signed attestations or continuous write monitoring. Dependencies, interpreter/environment and the entire emitted Next graph remain outside scope. Keep root's independently observed outer process exit distinct from the runner's own pre-exit JSON.

## 2. Prepare actual root evidence

Copy the templates into a new review directory such as `roadmark-recovery/final97-review/`. Do not fill the frozen templates themselves. Each pinned reference has `{ "path": "workspace-relative/path", "sha256": "actual64hex", "bytes": actual_integer }`. Future references are null deliberately. Empty launch stderr is acceptable evidence when genuinely empty; observation evidence should contain the actual facts.

### External process exit

Fill `ROOT-EXTERNAL-EXIT.template.json` with the actual result hash, reviewed runner hash, observed exit0, time and `actualTerminalReviewed:true`. `terminalEvidence` must point to an unedited execution-tool response or retained actual outer-launcher terminal. Clearly label a root transcription, retain underlying raw output unchanged, and do not invent missing PID, timestamps or results. Preserve the separate launch stdout/stderr files too.

### Scoped visual/copy/evidence-preservation receipt

`ROOT-COPY-OBSERVATION.template.json` requires actual QA-matching BUILD_ID, portable SHA256/byte length and pinned96 fallback hashes. Record only actual observations in `observations` and `limitations`, with all scope flags left false. `prior96PerformanceIsHistoricalOnly` stays true; no fresh97 speed result is required or claimed.

`visualChecks` is a nonempty array of records shaped:

```
{
  "location": "actual inspected route, view and viewport",
  "observed": "actual scoped visual finding",
  "limitations": "what was not checked and relevant caveats",
  "evidence": {"path": "...", "sha256": "...", "bytes": 123}
}
```

`copyChecks` is a nonempty truthful scoped subset of the ten manifest mappings. Each mapping may occur at most once in this list. Record:

```
{
  "id": "exact manifest vehicle ID",
  "displayField": "exact manifest field",
  "observedText": "exact candidate after text actually checked",
  "method": "actual browser inspection or identified reviewed render-test method",
  "limitations": "scope and caveats",
  "evidence": {"path": "...", "sha256": "...", "bytes": 123}
}
```

The123 values are schema illustrations, not evidence sizes. Use real nonempty observation bytes. Do not claim browser coverage for test-only checks. Record unvisited mappings and untested viewports honestly. At least one actual visual inspection is required independently from reviewed render tests. No screenshot must be uploaded.

The six `evidencePreservation` booleans attest root review of all ten mappings and evidence preimages, every baseline data file, the original Model Y hero/nine selling points, identity/dates/availability/specifications/rankings/counts and unchanged freshness placeholder. Its nonempty `evidence` array must pin actual review/check receipts. Input-map and exact source preservation checks independently constrain the source bytes, but a boolean alone is not a browser observation.

`copyDisposition` has `decision`, `checksSupportRetention` and a concrete `reason`. Use `retain_scoped` only when actual reviewed checks support retention, otherwise `experimental_unaccepted`. Do not reinterpret saved96 performance measurements as fresh97 proof. No phone/full-journey/release claim is allowed.

### Save binding and concise research

Populate `ROOT-SAVE-INPUTS.template.json` with actual pinned `qaResult`, `externalRunnerObservation`, `scopedCopyObservation`, actual formal `sourceRevisionReview`, independent `saveToolingReview`, and the successful run's separate `successfulLaunchStdout`/`successfulLaunchStderr`. Set review/exclusivity booleans true only after actual review.

Copy `RESEARCH-FILES.template.json`'s array into `researchFiles`, rechecking pins. Add later source/QA/save review, actual browser logs and all quick failures/retries or cleanup records. The current successful QA's full evidence map is included automatically. Core candidate/copy manifest/final map/runner are automatically included too. Source96's entire historical evidence payload remains retained, without mislabeling it as current97 evidence.

The binding template already contains the two mandatory actual failed97 attempts, each with pinned `qaResult`, `externalRunnerObservation`, `launchStdout` and `launchStderr`. Retain these unchanged and append every later failed attempt. The packager requires both immutable known result/exit pins and verifies every failed attempt's full sealed membership, hashes, sizes and mtimes. For these two actual receipts, terminalEvidence contains the genuine inline toolResult: it is validated and retained inside the pinned original receipt, never rewritten into a manufactured path/terminal file. A later receipt may instead reference a genuine pinned terminal file. An empty list cannot pass this revision. Retain incomplete/interrupted attempts and resolve their evidence honestly before claiming completeness. `allKnownFailedAndRetryEvidenceListed` is root's completeness assertion, not automated directory discovery.

Allowed relevant paths are listed explicitly in the script. Browser evidence can live under `roadmark-research/browser-copy97/`, `roadmark-research/applied97/` or `roadmark-recovery/final97-review/`. Each new file must be relevant UTF-8 text, at most2MiB, with all new research at most12MiB. Content-audit logs before selecting them. No screenshot, raw capture, private queue, secret or unrelated research belongs in the new supplement. The newly attached evidence index belongs to separate restoration work; do not add unreviewed attachment material or raw/private restoration references.

## 3. Package into a new directory

After independent review, use actual arguments:

```
python3 -B roadmark-research/checkpoint97-save-candidate/revision-2/package_checkpoint97.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --binding roadmark-recovery/final97-review/root-save-inputs.json \
  --binding-sha256 ACTUAL_BINDING_SHA256 \
  --approved-packager-sha256 REVIEWED_PACKAGER_SHA256 \
  --approved-joiner-sha256 REVIEWED_JOINER_SHA256 \
  --output roadmark-recovery/final97-attempt1
```

Retain actual stdout/stderr/exit. The output must not already exist. A failed attempt stays unchanged; review and use a new directory for a justified retry. No upload plan means no upload. The packager executes only the exact joiner recovered from its shipped kit, checks reconstructed source byte-for-byte, then rechecks source, outputs, evidence and fallback anchors before emitting an ordered create request.

Inspect archive inventory, exact six preimages, historical source manifest, all unchanged96 payloads, source/preview pair, four aliases, real tallies and open gates. No `.next` directory is shipped. The full source is local, and only gets an optional Library create if strictly below the conservative local32MiB policy; never attach it in chat.

## 4. Save with current supported Library helper

Immediately before saving, read current Library skill/prepared-upload guidance. Fetch the complete current helper and companion files into a new private directory. Follow the helper's bundled ordered prepare/transfer/finalize flow; do not use a stale helper or bypass it. Submit `library-create-request.json` unchanged as one stdin-and-EOF request. Every operation is a new create: parts, kit, preview, research, optional below-policy monolith last.

Retain complete genuine helper stdout/stderr and inspect every item. Do not retry uncertain or successful creates, reuse prior identities or repeat denied metadata reads. The offline correlator makes no service calls:

```
python3 -B roadmark-research/checkpoint97-save-candidate/revision-2/verify_checkpoint97_saves.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --archive-directory roadmark-recovery/final97-attempt1 \
  --plan-sha256 ACTUAL_PLAN_SHA256 \
  --request-sha256 ACTUAL_REQUEST_SHA256 \
  --actual-results roadmark-recovery/final97-review/actual-helper-results.json \
  --actual-results-sha256 ACTUAL_COMPLETE_RESULTS_SHA256 \
  --output roadmark-recovery/final97-review/correlated-save-receipt.json
```

One complete successful batch, matching local bytes and real identity/version xattrs, is required. A service rename, unknown or failed state, missing item or multiple-attempt recovery needs a narrowly reviewed adaptation that retains every genuine result and original order. Never fabricate metadata or rewrite failures into apparent success.

## 5. Deliver with actual scope

Attach the returned Library IDs for numbered source parts and kit, then preview and concise research. Never attach the monolith. Preserve actual accepted send results separately; successful local correlation does not establish server bytes or chat delivery. Never repeat an uncertain send.

Summarize the buyer-facing language cleanup, actual checks and main limits. If disposition is `experimental_unaccepted`, say so. Keep saved96 fallback available. Original upstream index78/full135-pack recovery, real-phone/accelerated-WebGL/full-journey validation and release/public export remain open. The concise supplement is not original index79.
