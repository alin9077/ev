# Rebuilt101 final portable proof plan

Prepared candidate only. No verifier or application code has been imported, executed, syntax-checked, tested or built by this preparer. No live application, runner, QA output or prior save was modified. Root must independently review the pinned candidate, wait for its actual final serial QA and collect the genuine external exit before executing this checker. No historical101 pass is reused.

## Inputs and source scope

`INPUT-PINS.json` seals the restored source100 ZIP (`0ab0172a49def161e9d6aab1f00ea0d866e919c5a14dd83ee61c9852cb6a4e74`), attached preview100 ZIP, materialized `roadmark-preview100/roadmark/index.html`, source maps, final14-file QA candidate, reviewed99 runner and exact historical100 helper source. The script pins this pin file. All paths read by the new verifier are workspace-relative, with traversal/symlink rejection and regular-file/size/stability checks. ZIPs are read in memory without extraction, with unique member/type/CRC/hash verification. Root must keep the checkout quiescent; this is not protection against adversarial parent-directory races.

The actual source delta is eight modified files plus six new files. The original app map is 1,678→1,684. Root's separately created `final-authored-inputs.json` (`6aad76783cc1787f64667b4fb6ef1fd71e7321c6e10ce35cc7f78441716362d5`) is cross-checked against that exact delta. The expanded restored QA map is 2,807→2,813: its extra 1,129 historical entries must remain unchanged. The verifier binds every expanded baseline map entry to its genuine source100 archive member and every final map entry to current application bytes, and checks the preserved historical100 source manifest separately.

`roadmark-rebuild101/expected-inputs.json` remains historical. Its hashes for `tests/helpers/checkpoint101-source-history.ts` and `tests/market-view.test.ts` predate final fixes. The checker pins it only to explain that historical distinction, never uses it as the final QA map. `SOURCE-SCOPE.json` records the exact final14 paths and stale-map differences. No source count is presented as a full module-graph result.

## Genuine QA producer join

The checker requires root-supplied final QA result path/SHA, genuine external tool-terminal JSON path/SHA, and independently observed actual101 HTML SHA. No final101 hash/result is defaulted or fabricated. The unchanged reviewed99 runner schema is a mechanics label; its current configuration must point to the final rebuilt101 maps and candidate.

It validates all sealed QA evidence hashes, sizes, mtimes and attempt-directory membership; exact parsed frozen-map equality and canonical digest; all seven stage receipts, ordered process terminals and log bindings; TAP completion; fresh production and portable producer outputs; and current artifact hashes/bytes/mtimes. Frozen-input raw bytes are correctly sealed by actual QA evidence, not by the authored map's JSON formatting. Each portable alias must originate in the genuine portable producer interval. The final external zero-exit tool result is pinned independently. Root is responsible for supplying the actual terminal from its current QA session, rather than an unrelated zero exit; this is local process evidence, not signed attestation.

The external terminal input is the tool's actual JSON object with `exit_code`, `chunk_id`, and `output`. It must describe final completion, not a running `session_id` response. This checker does not execute or poll the runner.

## Whole artifact, canonical audit, hero, runtime and art

The materialized baseline must match the exact `roadmark/index.html` member in the pinned preview ZIP: SHA `cb4fe95ff34b375fe139b7ef81e959c7ae000a1cb4b44ed74ad340a662f4e39b`, 37,020,751 bytes. Each of the four final aliases (`index.html`, `index-b.html`, `public/index.html`, `public/index-b.html`) must match both one another and those whole baseline bytes.

The checker independently compares:

- Entire encoded ev-data bytes, including string dictionary layout and unused entries
- Every decoded payload value and object/array ordering, with no ignored fields or audit exceptions
- The complete decoded market object against the unchanged canonical source100 JSON, including hidden/unverified/audit data
- HTML prefix including CSS, shell and title; HTML suffix including hero flag, runtime and license text
- Full decoded art object, reported separately as well as in the exhaustive payload comparison

Every four-alias full-byte equality is mandatory for success. If bytes differ, the checker reports prefix/suffix first differing offsets, bounded changed spans/hashes and next64-byte samples, exhaustive decoded field differences, separate art differences and canonical-market differences. Changed runtime/shell bytes are labeled unknown and fail; source import/alias changes never establish semantic equivalence. Invalid encoding or prerequisites fail closed, and later checks are not claimed to have run. All failure evidence must be retained.

Whole-byte equality proves the preserved original portable hero and all embedded audit content are the same bytes. It does not prove browser interactions, mobile layout, real-phone performance, the entire Next graph, dependency integrity, release approval or publisher claim truth. Those limits are in the result.

## Reviewed helper derivation

The original100 verifier was read as inert source text from the pinned attached100 research supplement, archive member `research/roadmark-research/artifact100-candidate/verify-portable100-delta.py`; exact SHA `aa431a1114e942b9100d680cc7df35cfacb9bdc8487be023eef0ccbec9dafd3e`.

`reviewed100-helpers.txt` is the exact region from `class VerificationFailure` through the exclusive `# END VERBATIM REVIEWED99 HELPERS.` marker. `reviewed100-comparison.txt` is the exact comparator region ending before `\ndef verify(args):`, deliberately omitting one boundary newline before that marker. Function code is unchanged. The checker copies these texts; it never imports the historical checker or accepts its historical result. The copied decoder rejects duplicate keys, malformed UTF-8, nonfinite numeric constants and invalid dictionary tokens, preserves number/bool distinction, and decodes only the known string-table format. New logic provides source bindings, actual QA joins and unchanged-whole-payload preservation, replacing the old100 ten-row amendment logic entirely. The copied simple read helper is unused; new reads use the stricter wrapper.

## Root command after independent review and real QA completion

Example paths only. Preserve an actual final external tool result at the selected path, determine the final result/hash independently, and substitute genuine values:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 roadmark-research/rebuilt101-portable-proof-candidate/verify_rebuilt101_portable.py \
  --workspace-root /workspace/scratch/586427eef9f2 \
  --qa-result roadmark-rebuild101/qa-attempt1/run-result.json \
  --qa-result-sha256 ACTUAL_FINAL_QA_RESULT_SHA \
  --outer-terminal roadmark-rebuild101/qa-attempt1-external-terminal.json \
  --outer-terminal-sha256 ACTUAL_FINAL_EXTERNAL_TERMINAL_SHA \
  --expected-html101-sha256 ACTUAL_FINAL_INDEX_HTML_SHA \
  > roadmark-rebuild101/portable-proof-attempt1.stdout.json \
  2> roadmark-rebuild101/portable-proof-attempt1.stderr.json
```

This command has not been run by the preparer. A successful report uses `schema=roadmark-rebuilt101-portable-preservation-v1`, `status=passed`, checkpoint101/baseline100, with the executing script SHA, explicit source scope, pinned final QA binding and full artifact observations. Record the checker's actual exit separately. Never accept stdout after a nonzero exit, overwrite failures or quietly weaken requirements. Any code revision needs renewed review and pins.
