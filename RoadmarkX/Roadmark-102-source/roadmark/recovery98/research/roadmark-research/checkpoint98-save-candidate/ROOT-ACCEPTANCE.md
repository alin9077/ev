# Root acceptance: checkpoint98

This is an unexecuted static candidate derived from independently reviewed checkpoint97 save revision2. Root owns independent review, syntax checking, execution, browser checks, saves and delivery. Keep app writers/builds stopped during final observation and packaging. Use new output directories; preserve failed or partial attempts unchanged.

## 1. Review source, tooling and current QA

Review all three scripts, the derivation diff and packet pins before execution. Recheck saved97 source/preview/actual-receipt pins and exact candidate98 three-file manifest. The manifest lacks an `operation`/`beforeBytes` field: the packager infers the only CSS replacement and two additions from explicit preimage hashes, fixes the predecessor CSS length at 113,703, and verifies the complete reversed stylesheet hash. It does not reuse checkpoint97's twelve-file or ten-copy-mapping schema.

Require the pinned QA98 runner's seven genuine serial successes: non-HTTP tests, isolated HTTP tests, types, lint, validation, production build and portable build. The packager parses actual TAP totals, validates complete sealed evidence membership and mtimes, serial process timing, terminal/log hashes and eight producer-bound build artifacts. It requires the current source map and output bytes/mtimes to match the successful run, four equal portable aliases, and a BUILD_ID different from saved97. It does not assert all dependencies, continuous write monitoring, environment identity or the entire emitted Next runtime graph.

Record root's independently observed outer process exit separately from runner pre-exit JSON. A pending result, running process or successful pre-exit JSON alone is insufficient. Preserve real successful launch stdout and stderr, including genuinely empty files. Add every full-QA failure to the failed-attempt list. The starter list already preserves the wrong-cwd quick attempt and successful retry. The complete97 archive retains all prior failed97 history without relabeling it as98.

## 2. Populate real root receipts

Copy templates into a new directory such as `roadmark-recovery/final98-review/`; do not fill the frozen candidate templates. Every pinned reference has actual `path`, `sha256` and `bytes`, with workspace-relative safe paths. All future results start null.

### Actual external exit

Fill `ROOT-EXTERNAL-EXIT.template.json` with the successful QA result hash, reviewed runner hash, actual integer exit0, observed UTC time and `actualTerminalReviewed:true`. `terminalEvidence` may be a pinned path to an unedited actual tool/launcher terminal, or `{ "toolResult": ORIGINAL_ACTUAL_TOOL_RESULT }`. For inline tool results, retain genuine `exit_code`, `output` and `chunk_id` fields unchanged. The same two forms are supported for retained failed exits. Do not invent a PID, completion time or evidence file; label any root transcription and retain raw results.

### Actual reflow receipt

Fill `ROOT-REFLOW-OBSERVATION.template.json` with the actual QA-matching BUILD_ID, portable SHA256/length and saved97 fallback hashes. Keep every false scope flag false and prior-evidence historical flags true. Put actual observations and limitations in their arrays.

Each `geometryChecks` entry follows `GEOMETRY-CHECK.template.json`:

- `surface`: `production` or `portable`
- `route`: actual canonical `/cars/...` route, even when portable was opened through `index.html?page=...`
- `measurementKind`: `actual_browser_geometry`
- `viewportCSSWidth` and `documentScrollWidth`: actual numeric measurements
- `nativeZoomPercent`, `viewportPhysicalWidth`: actual values if established, otherwise null; do not infer native zoom from a CSS-width-only emulation
- `method` and `limitations`: actual measurement method and what it does not establish
- `factSections`: nonempty actual visible section measurements using `FACT-SECTION.template.json`
- `evidence`: pinned, nonempty text containing the actual browser measurement result

Each section has its actual label, bounding `left`/`right`, `clientWidth`/`scrollWidth` and parent grid `gridLeft`/`gridRight`. Use CSS pixels. For retained cases, the document must fit viewport+1px, and sections must fit their grid and viewport without internal scroll overflow. These are limited observed geometries, not a universal layout guarantee.

At least one original-defect Kawasaki entry on each surface must have an actual viewport in [332,334] CSS px. Exact canonical route:

`/cars/kawasaki-ninja-e1-my26/kawasaki-ninja-e1-my26-nx011atfnn-brisbane-kaw-ne1-my26-1--20261010`

Reproduce the original physical500/CSS333/native150% case when possible and record what was actually established. Do not replace the fresh measurement with the historical364px failure. Recheck 500px/desktop, Lexus equipment/warranty disclosures, narrow Model Y and boundaries when feasible, with honest coverage gaps. Those additional cases do not automatically close phone/full-journey gates.

Each `visualChecks` entry follows `VISUAL-CHECK.template.json`. It is separate from DOM geometry and uses `method:CUA_visible_inspection`, actual surface/route/location/viewport, a visible finding, limitations and a nonempty pinned observation. For Kawasaki near333, record the exact complete source token:

`dealer_advertised_exact_MY26_page_not_manufacturer_verified`

Only set `fullKawasakiSourceTokenReadable`, `openedReportWithinViewport` and `noEvidenceClippingObserved` true after actual visible review. Retention requires all three observations on both rebuilt surfaces. Reports must be opened and inspected; do not submit/save/export anything. For non-Kawasaki observations, set the Kawasaki-specific flag false and sourceToken null, with scope explained. A text-presence assertion is not proof that the full token is visibly readable. Do not upload screenshots.

`evidencePreservation` requires actual source/emitted-artifact review: three-declaration CSS scope, all other baseline inputs/data, display copy/evidence, identity/dates/availability/specifications/rankings/counts, unchanged original Model Y hero/nine selling points and unchanged freshness placeholder. Pin the real checks in `evidence`. The emitted-artifact comparison must explicitly permit only the reviewed CSS delta; do not use a copy-only unchanged-CSS invariant. A boolean alone is not that comparison or a visible hero inspection.

Set `reflowDisposition.decision` to `retain_scoped` only if actual geometry and visible checks support retention, with `checksSupportRetention:true` and a concrete reason. Otherwise use `experimental_unaccepted` and explain unresolved findings. The packager still requires actual narrow measurements on both surfaces and nonempty actual CUA observations. Keep97 as fallback. Source candidate changes are not a way to fill missing evidence.

### Binding and research

Populate `ROOT-SAVE-INPUTS.template.json` with actual pins for QA result, external observation, scoped reflow observation, independent source review, independent save-tooling review and successful launch streams. Set root-review/completeness/no-concurrent-writers booleans only after checking.

Copy the starter `RESEARCH-FILES.template.json` array into `researchFiles`, rechecking pins. Add later actual reviews, source/emitted-artifact comparison receipts, measurement/CUA logs, outer terminal and all failures/retries or cleanup records. Full successful QA evidence, candidate manifest, final map and runner are added automatically. Use only the script's relevant allowed directories; browser text may live under `roadmark-research/browser-reflow98/`, `roadmark-research/applied98/` or `roadmark-recovery/final98-review/`.

`failedAndRetryAttempts` starts empty because this static packet asserts no future failed98 outcome. Add every actual later failed full-QA attempt using `FAILED-ATTEMPT.template.json`, with sealed QA result, actual external nonzero exit and launch stdout/stderr. Do not add a nonexistent failure merely to populate the array. The packager checks retained failed membership/hashes/sizes/mtimes. Incomplete/interrupted attempts must remain intact and be honestly resolved before claiming completeness. Root's `allKnownFailedAndRetryEvidenceListed` is a completeness assertion, not automatic discovery.

Audit each newly selected UTF-8 file for secrets and relevance. Maximum 2MiB per file, 12MiB aggregate. No screenshots, raw captures, private queue, unrelated research or unreviewed attachment material. Evidence-index restoration is separate and excluded. Existing97 historical archive contents remain intact under the predecessor preservation rule.

## 3. Package in a new directory

After independent review, execute with actual pins:

```
python3 -B roadmark-research/checkpoint98-save-candidate/package_checkpoint98.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --binding roadmark-recovery/final98-review/root-save-inputs.json \
  --binding-sha256 ACTUAL_BINDING_SHA256 \
  --approved-packager-sha256 REVIEWED_PACKAGER_SHA256 \
  --approved-joiner-sha256 REVIEWED_JOINER_SHA256 \
  --output roadmark-recovery/final98-attempt1
```

Keep actual stdout/stderr/exit. Do not repair a failed output directory in place. The packager creates full source, preview, concise research, numbered16MiB slices and a kit. It reads back the actual kit and executes only its shipped joiner in a separate local self-test directory; no app execution occurs. The assembled ZIP must exactly equal the full source before an upload plan exists. Last-minute source/output/evidence/fallback guards run before the create request is emitted.

Inspect archive inventory, every preserved97 payload, the exact CSS preimage, old97 top-level manifest and actual97 save receipt, current source/preview pairing, aliases, real test totals and open gates. The full source remains local. Optional monolith saving applies only if strictly below local32MiB; it is never part of chat attachments.

## 4. Save with the currently supported helper

Read current Library prepared-upload guidance immediately before saving. Obtain the complete current helper and companion files in a new private directory. Use its ordered prepare/transfer/finalize/metadata-writeback flow, not a stale helper or direct fallback transfer. Give `library-create-request.json` unchanged as one stdin-and-EOF request. All items are new creates in order: source parts, recovery kit, preview, research, optional below-policy monolith last.

Retain complete genuine helper stdout/stderr. Do not retry successful or uncertain writes, target any existing identity, or repeat denied metadata reads. The offline correlator does not contact Library:

```
python3 -B roadmark-research/checkpoint98-save-candidate/verify_checkpoint98_saves.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --archive-directory roadmark-recovery/final98-attempt1 \
  --plan-sha256 ACTUAL_PLAN_SHA256 \
  --request-sha256 ACTUAL_REQUEST_SHA256 \
  --actual-results roadmark-recovery/final98-review/actual-helper-results.json \
  --actual-results-sha256 ACTUAL_COMPLETE_RESULTS_SHA256 \
  --output roadmark-recovery/final98-review/correlated-save-receipt.json
```

It requires one complete successful ordered batch, new version0 identities, actual local bytes and genuine helper-written identity/version xattrs. It protects all32 earlier and6 actual97 IDs. Unknown/failed/partial results, renamed artifacts or missing metadata require a separately reviewed narrow adaptation retaining every original result. Never manufacture xattrs, rewrite failures or claim independent server bytes.

## 5. Deliver the actual accepted scope

Attach returned new Library IDs for numbered parts and kit, then preview and concise research. Never attach the full-source monolith. Preserve actual send results separately; local correlation leaves `chatDeliveryComplete:false` deliberately. Do not retry an uncertain send.

Summarize the narrow reflow change, genuine checks and open gates. If experimental, say so. The prospective automated browser suite did not run under this CUA-only boundary. Real phones, accelerated WebGL, complete journeys, sustained performance, public export/publication, release and original index78/full135-pack recovery remain open. The concise supplement is not original index79.
