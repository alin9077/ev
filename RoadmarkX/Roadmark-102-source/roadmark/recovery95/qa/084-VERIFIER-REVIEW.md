# Checkpoint95 independent static verifier review

## Decision

Approved for root execution at the following exact SHA256 values, only after the approved serial runner has actually completed successfully and its root terminal exists:

- `roadmark-research/qa95-candidate/verify_qa95.py`: `f7a0044ced1bf2731aa25c786ef3a748c46ef595951720e6a18cf4ce4c7f4e51`
- `roadmark-research/qa95-candidate/launch_proof95.py`: `a1e1fb9d3bd4c899dfac664ad1b31d11dd0a60939a8d0aaf59e96258c886ccfc`

The previously approved runner and QA-launcher bytes remain unchanged:

- Runner: `af7690b3e991b89f8c4a58c3c92cee65763fa490d50d4c74bc43235010c23c96`
- QA launcher: `664383177b177b76398c8b2b53e509ee07f210537f6556c058810c6aa959149e`

This review is static source/JSON/HTML/ZIP-manifest inspection and SHA256 checking only. The reviewer did not import or execute any candidate/application code, perform syntax checks, run tests/builds/browser work, upload, use Git, or modify the application. Only review artifacts were written. Approval is not a statement that full 95 QA or emitted proof has passed.

## Baseline and full evidence chain

The verifier hard-pins the supplied saved94 upload plan, actual correlated save receipt, and complete local source and preview ZIPs. Independent hashes matched those source/preview ZIP pins. It checks checkpoint/pair/build identity across the plan, receipt, and both embedded manifests, and streams all four old preview aliases to require exact baseline SHA and size. It does not extract archives, execute archived code, access a network, or claim a fresh server-side hash verification. The source archive identity is bound as a whole; the verifier does not newly re-derive every archived source member against the old input map.

The reviewed runner separately binds the complete 1655 input map, verified 94 proof/artifact map, old BUILD_ID and portable bytes. The verifier rechecks those anchors and the exact 1659 applied95 map reconstructed from the hard-pinned seven-file manifest. It requires exactly three replacements/four additions and 1652 unchanged old inputs, no unmanifested inputs, unchanged empty approval registers, and unchanged historical checkpoint metadata.

The result must have the 95 success schema and checkpoint, match root's externally supplied actual result SHA, have no failure artifact, and contain exactly the required evidence members. Every log, process terminal, stage receipt, observation, freeze, and request is hash/size-bound to the same attempt. The saved runner argv is reparsed and must match its configuration and actual file path.

The verifier also requires root's externally supplied QA-terminal SHA. The root terminal must belong to this attempt, have an actual integer exit 0 and null interruption/launch error, bind the approved QA launcher/runner and actual result hashes, and record the command corresponding exactly to the saved runner argv. Its console log must contain the seven ordered stage starts, seven ordered successful stage ends, and single final runner completion message. Root and stage chronology/PIDs/durations are checked.

## Actual QA requirements

All seven receipts require integer exit 0, no interruption, no capture error, no source drift, exact reviewed command/cwd/environment, and matching before/after full input digests. Each receipt must equal its separately persisted real process terminal on all process fields and log reference.

Both full-test logs require exactly one summary per tests/pass/fail/cancelled/skipped/todo field. Counts must be 850 non-HTTP plus 1 isolated HTTP, with zero failures, cancellations, skips, or todo tests. Validation must exactly match the pinned actual 94 validation JSON, including 343 variants, 149 families and 2196 sources; its parsed object is retained in the 95 proof. The verifier requires the actual normal Next 389/389 static-generation terminal and /market route, plus the actual portable producer terminal.

The validation anchor deliberately uses the actual 94 validation log. Saved 94 proof.qa.validation contains only timing/exit fields and cannot support the old nested lookup used against 93; that adaptation issue was identified during review and avoided before approval.

## Output and presentation binding

Prebuild output hashes and BUILD_ID must equal verified 94. Production and portable observations must match their producing receipt's PID, command, exit, start/end, and post-terminal chronology. Core production and all portable output mtimes must fit their actual producer interval with two seconds of precision tolerance. Current selected outputs must exactly match captured SHA/size/mtime membership. A genuinely different BUILD_ID is required.

Route and app-paths manifest hashes must be unchanged; production HTML page membership must equal 94 with 343 car-detail pages. All detail routes and /market must have complete static prerender entries. The production presentation is rederived from current output and must equal both actual prebuild and postproduction observations. Its stated exclusions are complete script elements and script preload links; exactly three market count fragments are normalized 241-to242. CSS bytes and membership remain unchanged. This does not establish production hydration or whole-runtime graph equivalence.

## Portable market-only proof

The parser reads bounded portable bytes and a unique exact ev-data JSON-script boundary without evaluating JavaScript. It rejects an unexpected envelope, duplicate JSON keys/dictionary entries, invalid references, and unescaped literal '<' in the JSON payload. Its strict base36 and escaped-tilde decoding matches the inspected application codec, including treating dictionary contents as literals rather than recursively decoding them.

Both byte segments outside the JSON body must equal saved94 exactly. This preserves the portable document's HTML, CSS and executable JavaScript. Dictionary indexes may legitimately shift after the admitted market data changes; comparison therefore happens after strict decoding.

Top-level projection membership must remain exactly marketInventory/cars/packs/research/counts/art. Every non-market value is canonically hashed and compared with saved94. The complete decoded market object must equal the exact pinned applied95 source. The only changed market top-level fields must be counts, records, reconciledLeads, sourceArtifacts and unverifiedLeads. Appended objects must match the pinned fixture. Re-inserting the original lead at index 40 and removing the exact appended record/reconciliation/artifact must reconstruct the predecessor market object exactly.

The successor must have 242 audit records, 143 unresolved leads, 21 reconciled leads, 19 source artifacts, 5 peripheral records and 395 named trim entries, with fixture-bound dependent counts and independently counted class/status/trim tallies. The exact Mazda CX-6e GT/Azami record remains preorder/new_stock_listed, ranking-ineligible, not a complete-vehicle count, with accepted orders and physical stock unverified and model year/technical epoch null. The audit remains incomplete.

Decoded detailed data must remain 343 configurations, 149 families and 2196 sources; CX-6e cannot enter the detailed catalogue. The established Model Y baseline and nine alternative families are checked, and all corresponding original non-market values/bundle bytes are preserved. These are preservation claims, not a fresh independent ranking computation or browser/phone test.

The final proof rechecks all protected application inputs, current generated outputs and every remembered evidence file before writing proof and pin inventories. The proof correctly sets browserVerified, phoneVerified, publicExportRun and releaseApproved to false.

## Root proof launcher

The launcher validates its own and verifier external SHA pins and safe external paths, requires entirely new proof/log/terminal paths, and launches only the pinned read-only verifier with -B. Its terminal records actual PID, argv/cwd, start/end/duration, actual exit, interruption/launch error, all tool/result/root-QA-terminal pins, log bytes/hash and produced proof hash if present. No hardcoded successful return code is used.

The launcher imports no application code and runs no tests/builds/browser/upload. If the child is interrupted, only its own process group is signaled. A launch error or missing proof causes failure. Root and later packaging must require both actual exit 0 and null interruptionOrLaunchError, and confirm the launcher itself completed. A proof file or launch alone is insufficient. SIGKILL, machine loss, disk failure and repeated cleanup interruption may leave incomplete attempts; those must remain retained and cannot establish success.

## Exact root proof command

Use only after successful actual 95 QA/root-terminal completion. Replace both ACTUAL placeholders with hashes observed from that actual attempt; do not use projected or copied old values.

```sh
python -B /workspace/scratch/586427eef9f2/roadmark-research/qa95-candidate/launch_proof95.py \
  --workspace /workspace/scratch/586427eef9f2 \
  --runner /workspace/scratch/586427eef9f2/roadmark-research/qa95-candidate/run_qa95.py \
  --verifier /workspace/scratch/586427eef9f2/roadmark-research/qa95-candidate/verify_qa95.py \
  --approved-runner-sha256 af7690b3e991b89f8c4a58c3c92cee65763fa490d50d4c74bc43235010c23c96 \
  --approved-verifier-sha256 f7a0044ced1bf2731aa25c786ef3a748c46ef595951720e6a18cf4ce4c7f4e51 \
  --approved-launcher-sha256 664383177b177b76398c8b2b53e509ee07f210537f6556c058810c6aa959149e \
  --approved-proof-launcher-sha256 a1e1fb9d3bd4c899dfac664ad1b31d11dd0a60939a8d0aaf59e96258c886ccfc \
  --qa-directory roadmark-research/applied95/qa-attempt1 \
  --run-result-sha256 ACTUAL_SUCCESSFUL_RUN_RESULT_SHA256 \
  --root-terminal roadmark-research/applied95/qa-attempt1-terminal.json \
  --root-terminal-sha256 ACTUAL_SUCCESSFUL_ROOT_QA_TERMINAL_SHA256 \
  --output roadmark-research/applied95/emitted-proof-attempt1
```

Keep the workspace exclusive during verification and preserve all actual evidence. No remaining static blockers were found at the approved pins. The proof is trusted-root process/file evidence, not signed or adversarially secure attestation. No public release is approved; an approved configured HTTPS origin and the separate release gates are still required before public export.
