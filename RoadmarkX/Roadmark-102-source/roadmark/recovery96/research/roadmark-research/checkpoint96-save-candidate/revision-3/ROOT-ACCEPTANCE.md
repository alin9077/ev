# Root acceptance procedure

This is the cumulative six-row revision3 packet. The previous three-row packet in the parent directory is immutable historical HOLD evidence. FullQA1 failed with751 reported tests,734 passes and17 failing modules; no later stages ran. The new packet admits only the reviewed historical-source reconstruction support plus the unchanged runtime candidate and corrected test. A fresh successful full run against the1662 map remains required.

## 1. Review before execution

Independently review all three scripts and their pins. This packet is static and unexecuted. Root may run syntax checks after review; this author did not. Keep source writers/builds stopped during measurement completion and packaging. Do not mutate successful QA evidence or reuse failed attempt directories.

The full QA result must come from the exact embedded revision2 runner and final candidate/map. Expected counts are866 non-HTTP plus1 isolated HTTP, but the packager derives counts from the actual complete TAP summaries and records them rather than manufacturing a tally. Review any unexpected count before accepting. Seven stages and ordinary zero terminals are mandatory. The runner's own result is written before it exits; it is not the external exit.

The packager checks the runner evidence map, full attempt membership, stage result/terminal/log hashes, serial process times, frozen-map digest, current source inventory and all eight exact output hashes/sizes/mtimes. It checks producer intervals with the runner's2-second filesystem tolerance. Those are trusted local observations, not signed attestations or continuous write monitoring. Dependencies/interpreter/environment and the full Next output graph are outside scope.

## 2. Prepare the actual root evidence

Copy templates to new files outside this candidate folder, preferably `roadmark-recovery/final96-review/`. All pinned references have shape `{ "path": "workspace-relative/path", "sha256": "actual64hex", "bytes": actual_integer }`. No placeholder is accepted. Future refs in templates are null on purpose.

### External runner observation

Fill the actual run-result hash, approved runner hash, externally observed zero exit, time observed and `actualTerminalReviewed:true`. `terminalEvidence` points to a retained unedited actual execution-tool terminal result or actual reviewed outer-launcher terminal. A root transcription should be clearly identified as such and retain the underlying tool result unchanged. Never invent PID, timing, exit status or missing tool output. Retain separate launch stdout/stderr as research even if the external terminal contains only a short completion response.

### Scoped browser/measurement observation

Bind the actual QA-matching BUILD_ID, portable alias hash/bytes and95 fallback source/preview hashes. `observations` and `limitations` are nonempty natural-text arrays recording only root-observed facts. No screenshot is required or uploaded. Keep every false scope gate in the template false.

`comparisons` is a nonempty array. Each record has:

```
{
  "metric": "actual named observation",
  "baseline": "actual value or structured observed result",
  "after": "actual value or structured observed result",
  "units": "requests, compressed body bytes, tool observation bound ms, etc.",
  "protocolAndCaveats": "actual method; differences; why this is or is not comparable",
  "baselineEvidence": {"path": "...", "sha256": "...", "bytes": 0},
  "afterEvidence": {"path": "...", "sha256": "...", "bytes": 0}
}
```

The0 above illustrates a numeric field and is not a claimed size. Use actual nonempty evidence bytes. Comparisons need not show improvement. Preserve the three fresh-origin baseline no-click sweeps individually; each observed13 requests/12 destinations/401024 gzip body bytes. Keep cold/warm distinctions and limitations: local application-layer compressed/dechunked body observations, not network wire or browser-consumed bytes; tool bounds, not precise paint/INP/phone latency. Different scroll geometry, target, hydration wait or origin/cache conditions must remain explicit. The packager binds evidence bytes but does not calculate or validate human interpretation of metrics.

`optimizationDisposition` requires `decision`, `measurementSupportsRetention` and a concrete `reason`. Use `retain_scoped` only after reviewing supportive actual measurements and navigation checks; otherwise use `experimental_unaccepted`. All wider phone/WebGL/full-journey/public-export/release gates remain open either way.

### Save binding

Start with `ROOT-SAVE-INPUTS.template.json`. Set actual pinned `qaResult`, `externalRunnerObservation`, `scopedBrowserMeasurement`. Copy `RESEARCH-FILES.template.json`'s array into `researchFiles`, after verifying its pins. Add the final QA static approval, every actual full-QA failed/retry attempt (if any), after measurement observations/logs, run cleanup records, browser navigation checks, actual root terminal and separate root launch logs. Include final static save review and actual packager/joiner/correlator files and documentation as desired.

Set the three review booleans true only after verifying the evidence is complete and no app/build writers remain. The required fixed research list covers pre-existing quick failures/retries and baseline measurements; `allKnownFailedAndRetryEvidenceListed` is root's explicit completeness declaration for later attempts, not an automatic discovery proof. All selected files must stay within allowed relevant paths and content/privacy limits. Audit content for secrets before selecting logs; filename filters are not a content security scanner.

The revision3-specific history must include its application receipt, focused attempt3, typecheck attempt3, completed historical retry log and its actual exit observation, final revision3 source review/pin record, all failed fullQA1 files and its actual external-exit/launch records. The failed result and external-exit record are pinned in the packager; sealed failure membership/hashes/bytes/mtimes are rechecked. Do not pin a historical-retry log while still running. If the starter research template omits a still-growing file, append its final actual pin after completion. Keep root's receipt creation time distinct from the earlier actual process-exit observation.

## 3. Execute packaging once

Use a new output directory with an existing parent. Replace only the uppercase illustrative arguments below with observed pins/paths:

```
python3 -B roadmark-research/checkpoint96-save-candidate/revision-3/package_checkpoint96.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --binding roadmark-recovery/final96-review/root-save-inputs.json \
  --binding-sha256 ACTUAL_BINDING_SHA256 \
  --approved-packager-sha256 REVIEWED_PACKAGER_SHA256 \
  --approved-joiner-sha256 REVIEWED_JOINER_SHA256 \
  --output roadmark-recovery/final96-attempt1
```

Retain actual process stdout/stderr/exit. The packager writes the archives, reconstructs using the shipped joiner and emits a genuine self-test receipt, then rechecks source/output/research/fallback inputs before the ordered Library request. On failure, keep that attempt unchanged; review and use a new directory for a justified retry. No upload plan means no upload.

Inspect the resulting manifests, archive payload inventory, source-preservation delta, pair ID, open gates, measured disposition, source-parts manifest, actual joiner stdout/exit/hash, upload-plan order and actual local sizes. The full monolith is never a chat attachment. No `.next` build directory is shipped.

## 4. Save with the supported current Library helper

Read the current Library skill and prepared-upload guidance immediately before saving. Both prepared tools are available during preparation, so multiple new files use its bundled prepared helper. Fetch all three current companion files unchanged into one fresh private directory, including every page. Do not use a stale copied helper or manually prepare/finalize/transfer; never inspect denied metadata through another route.

Use exactly `library-create-request.json` as one stdin-and-EOF request. All operations are new creates, ordered parts, kit, preview, research, and optional below-policy monolith last. The helper applies complete returned metadata/identity to each original local path. Retain complete genuine results and stderr privately. Do not retry an uncertain or successful create.

Run the offline correlator only after the full batch is conclusively successful:

```
python3 -B roadmark-research/checkpoint96-save-candidate/revision-3/verify_checkpoint96_saves.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --archive-directory roadmark-recovery/final96-attempt1 \
  --plan-sha256 ACTUAL_PLAN_SHA256 \
  --request-sha256 ACTUAL_REQUEST_SHA256 \
  --actual-results roadmark-recovery/final96-review/actual-helper-results.json \
  --actual-results-sha256 ACTUAL_COMPLETE_RESULTS_SHA256 \
  --output roadmark-recovery/final96-review/correlated-save-receipt.json
```

The correlator assumes one unchanged current-helper batch. If results rename an artifact, omit an item, contain an unknown/failed state, or span several attempts, stop and review an adaptation that preserves each raw attempt and original order. Do not trim failed items, synthesize metadata, force a version number or bypass identity writeback errors.

## 5. Deliver with truthful scope

Use returned successful Library IDs as native attachments, parts plus kit first, preview and research afterward. Never send the monolith in chat. Record actual accepted send results separately; saved bytes do not prove delivery. Do not repeat an uncertain send.

User-facing summary should say what changed, actual measured result and major limits. `experimental_unaccepted` must remain explicit if that is the measured disposition. A scoped accepted engineering change is still not full phone/WebGL/journey/release validation. Keep95 fallback available. Do not expose internal helper/xattr mechanics or raw private transfer output in the user summary.
