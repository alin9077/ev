# Actual checkpoint96 binding: candidate2 preparation

This is an additive correction to candidate1, SHA256 `96b9fc6893eeb638cff03e892543bfba3b0df84b4ff618415f48b67b519b0f19`. Candidate1 remains unchanged. Existing receipts, application inputs, QA outputs, scripts and frozen tool packets were not edited. This preparer only read/hashes/selected existing evidence and made byte-identical text copies; no package, application, harness, cleanup or browser action was executed.

## Added measurement provenance

Candidate1 retained the original logger source but omitted the actual executed revision2 source. Candidate2 additionally binds:

- Actual revision2 logger, SHA256 `5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512`, its README, REVISION record and unchanged checksum listing
- Actual revision2 acceptance harness, SHA256 `fa5e6a202ebfcc95a5f85289cc811fc0b6c9c823757d74b24859281c0480e51e`, its README, REVISION record and unchanged checksum listing
- The full concise text evidence for synthetic run `2026-10-12T02-33-38-515Z-8d400ab5`: 23 exercised cases passed, zero failed, no cleanup/evidence issues reported
- The separate intentional interruption run `2026-10-12T02-34-33-076Z-5720a396`: incomplete/harness_signal, 12 cases passed before interruption; this is not a complete acceptance pass. Its original wrapper failure and later port-probe limitations remain preserved
- Actual native baseline/repeat/after launch scripts, their logger stdout/stderr and Next startup logs; these include cleanup traps but do not independently prove actual child exit codes

All added synthetic logger JSONL has the same limited15-field observation schema. It is sanitized request metadata, with no response body/header capture. No browser screenshots, raw publisher captures, native runtime binary or unrelated project material was selected.

## Text-copy lineage

Exact copy lineage, original paths, SHA256 and byte sizes are recorded in:

`roadmark-research/mobile-performance96-assessment/root-runtime-observations/save-provenance-text/COPY-PROVENANCE.json`

Source material came from `roadmark-restoration/measurement96/`, the revision2 logger/harness `SHA256SUMS` files, and the already existing `/tmp/roadmark-harness-interrupt.py` wrapper. Every copied payload was compared byte-for-byte with its source. Filenames end in `.txt` solely to retain inert evidence within the unchanged approved extension gates. No tool gate was relaxed.

## Superseding browser observation

Candidate2 uses root's new `browser-scoped-measurements-revision2.json`, SHA256 `3ac3c1d3ecc5e1d04132020c69587530f97a356683860d79d871fd7e9e378844`, 10,142 bytes. The original 9,740-byte observation is retained as historical evidence.

Logger18872 stderr says a malformed request was rejected before request logging. Its phase and path cannot be reconstructed from that notice. Root's new observation explicitly limits zero-detail counts to valid logged requests; the rejected request is unclassified. The other two sweep logs remain separately bound. No all-traffic or total-page-transfer claim follows from the recorded detail-response reduction.

Root's scoped retention decision, cold164/267ms tool-bound observations, original failure/retry history and open phone/WebGL/full-journey/release gates are unchanged. Root reports owned tabs/servers stopped and no app writers; exact native preview child exits remain unrecorded. `rootReviewed` stays false pending independent candidate2 review and root acceptance.
