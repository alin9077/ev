# Root-only checkpoint99 serial QA runner proposal

Status: static-only candidate. This worker has not imported, compiled, syntax-checked, or executed the runner or application code. No checkpoint99 input map, application changes, QA receipts, or claimed passing results are supplied.

## Exact lineage and scope

`run_qa99.py` comes from the exact unchanged `roadmark-research/qa98-candidate/run_qa98.py` with only three lines changed:

- Two `roadmark98.serial-qa.v1` receipt-schema strings become `roadmark99.serial-qa.v1`
- The final `QA98_COMPLETE` and `QA98_FAILED` markers become `QA99_COMPLETE` and `QA99_FAILED`

The source and candidate are both 22,175 bytes with mode 0644. All other bytes are preserved. The inverse substitutions compare byte-for-byte with the source. `runner.diff` contains the complete unified diff; `MANIFEST.json` records input and output hashes, scope, and static observations. These measured hashes are not independent approval.

The existing checkpoint98 input map was observed at `roadmark-research/applied98/expected-inputs.json`, SHA256 `e1f1afa40710976b5ef057264cb09b3443866764f1ef584c9ce05a5ebad875d2`. This observation is not a fresh verification of the application, checkpoint98 QA, or checkpoint acceptance. Existing checkpoint98 evidence and fallback artifacts remain untouched.

Application instructions were read at `roadmark-work/roadmark/AGENTS.md`. No Next.js or application implementation code is changed by this proposal.

## Preserved behavior and limits

All admission checks, commands, permissions, application paths, input/output exclusions, evidence semantics, output verification, and bounded process-group interruption cleanup remain unchanged from the QA98 runner. The seven serial stages remain:

1. Non-HTTP Node tests selected from the frozen `tests/**/*.test.ts` paths
2. Isolated `tests/local-review.test.ts`
3. Typecheck
4. Lint
5. Validation
6. Production build
7. Portable build

Browser `*.spec.ts` inputs are retained but not executed by those Node test commands. No browser automation, public export, upload, deployment, package installation, or Git action is added. CUA/browser verification and Mazda-specific semantic review remain separate root-owned gates.

The runner still requires a pinned baseline map, reviewed candidate manifest, and complete pinned final map. The final map must equal the baseline plus exactly the reviewed candidate additions/replacements; no fixed candidate paths or test counts are added. Source pins, exact input membership, historical metadata, real child terminals, TAP summaries, and producer-output checks retain their QA98 meanings and limits. The app-directory flock still cannot establish exclusivity against unrelated writers. The runner's `run-result.json` still cannot establish its own external process exit. Root must confirm no surviving writers after failed attempts before retrying.

## Root execution gate

Do not execute this proposal until root has independently reviewed the exact runner bytes/hash, reviewed and applied the actual Mazda99 candidate, prepared and independently pinned the complete final checkpoint99 input map from the approved checkpoint98 baseline plus the actual candidate delta, and established exclusive application access. The actual app remains `roadmark-work/roadmark`.

A future invocation uses this runner path and a new attempt directory, for example `roadmark-research/applied99/qa-attempt1`, whose parent must already exist. No such directory or evidence is created here. Supply the actual reviewed final-map and candidate-manifest paths/hashes and approved runner hash explicitly. Never reuse or overwrite an attempt. Keep console logs outside the attempt directory and retain the actual external terminal/exit evidence.

Root owns execution, source application, final-map preparation, independent verification, semantic/browser checks, packaging, and checkpoint acceptance. This is a proposal only.
