# Rebuilt101 portable proof: original static review

## Decision

NO-GO pending a separately retained QA-binding revision. This applies to verifier `8b8404dd1ca644c8a42a1e5633b7b2a6a40d685f9e30799faccb406540a8cdd8` and manifest `5c1d71e4bab1f55a63620dbfa64f9998fe5a79af4d4785d9b21bf55afe911398`. Keep the original packet unchanged. No candidate was imported, executed or syntax-checked, and no final QA/artifact pass is established.

## Blocking scope mismatch

The new packet claims seven-stage QA validation, but `verify_qa` only compares most terminal commands with that run's own reported stage plan (line 387). Except for portable, it does not independently derive the required commands, complete sorted non-HTTP test selection or isolated local HTTP test. It seals but does not interpret `execution-request.json`, so launch argument/output-directory/runner/configuration and declared environment settings are not independently joined. A reduced test command and matching plan can be internally consistent without establishing the claimed complete suite.

The outer-terminal check (lines 423–424) requires integer exit zero, a string output and a chunk identifier. It omits the documentation's explicit rejection of an active `session_id` response. The final association between a supplied terminal and this QA run remains root-observed trusted evidence; the checker cannot authenticate a tool invocation from arbitrary JSON. That boundary must be stated honestly.

The preparer confirmed these are unintended documentation/claim overbreadth, and no separate rebuilt101 full-QA/save gate is established. The independent source reviewer likewise did not approve any final-QA/session gate. Required narrow repair: derive the complete commands from the pinned final expected map and known reviewed runner mechanics; compare both stage plan and actual terminals to them; validate the sealed launch request and declared environment; explicitly reject any non-null session identifier on the terminal observation. Do not relax payload/source checks or invent final QA hashes. Root must supply the real terminal from the current execution and independently preserve its provenance.

## Independent static checks passed

- All six candidate manifest rows, seven checksum entries and eleven path-bearing pins match actual bytes
- Decoder and ordered comparator function code match the historical100 checker carried in the pinned100 research supplement; only boundary whitespace differs
- Original input counts are 1,678→1,684, expanded QA counts 2,807→2,813, with exactly 14 changed paths: eight modifications and six additions
- Every expanded baseline-map entry matches a unique genuine source100 ZIP member; all 1,129 additional historical entries are unchanged
- The final QA candidate exactly reconstructs the final authored and expanded maps; all 2,813 current entries match, and an independent current source inventory using the runner exclusions is exactly equal to the final QA map
- The historical expected map differs only in the two declared earlier helper/test revisions and is not used as final authority
- The complete source100 historical manifest and canonical market remain byte-exact
- All four saved100 preview aliases are 37,020,751 bytes at SHA `cb4fe95ff34b375fe139b7ef81e959c7ae000a1cb4b44ed74ad340a662f4e39b`
- Separate inert baseline decoding confirms the complete canonical market and all object/array order over 27,336 nodes, including 242 records and 143 unverified leads

Detailed observations: `ORIGINAL-STATIC-CHECKS.json`.

## Mechanisms otherwise suitable for scoped root execution

Source and preview100 ZIPs have independent pinned provenance. All used data paths reject traversal/absolute/backslash/symlink forms, regular files are bounded to 128 MiB with pre/post identity/size/mtime/ctime checks, and selected ZIP members are unique/regular/unencrypted/size-bounded and CRC-checked without extraction. The expanded baseline totals 502,848,016 uncompressed bytes processed member by member; largest member 74,934,307 bytes. There is no global memory/decompression quota or adversarial concurrent-path guarantee. Root must keep trusted input files quiescent.

The frozen-map defect from the lost historical101 tool is not repeated: actual frozen bytes/size/mtime are sealed by final QA evidence; strict parsed content and canonical digest must match the final expected map, independent of serialization order. Full evidence directory membership, receipt/terminal/log hashes and lengths/mtimes, stage order, successful integer exit codes, signal/interruption/cleanup absence, TAP completion and producer output SHA/size/mtime windows are checked. Final production BUILD_ID must be nonempty, equal the QA report and different from100. The narrower command/request/outer-completion gaps above remain.

All four final aliases must equal both the final index and the exact saved100 HTML bytes. Full raw ev-data, prefix/suffix, every decoded value/object/array ordering, complete canonical market and complete art are checked. Missing/malformed payloads fail closed. No ignored paths, projection exceptions, numeric tolerances or source-inferred JavaScript equivalence are admitted. Exact whole-HTML equality preserves the original portable hero/flag, CSS, shell and runtime as bytes, without pretending to verify browser rendering/interactions. Changed runtime/shell remains unknown and fails with byte-span diagnostics.

## Review boundary

Only local text, JSON, ZIP data, source inventory and byte/hash inspection occurred; writes were restricted to this review directory. No application/candidate import or execution, syntax check, tests, builds, installations, browser, network, Git, uploads or app edits occurred. Current QA remained in progress. This does not establish a full Next module graph, dependency/build attestation, browser/phone/visual behavior, publisher truth, final archives, saving, delivery or release approval.
