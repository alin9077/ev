# Checkpoint 96 durable-save tooling: independent static review

Status: HOLD. The frozen tooling has no remaining blocking static issue for its original three-row scope, but that scope failed full QA. There is no executable save approval and no approval for the forthcoming revision3 scope. Keep this packet unchanged as historical evidence. New scope, pins, retained failure history and an independent final binding review are required before packaging.

The QA failure arrived before approval was communicated. Independent static inspection now confirms qa-attempt1/run-result.json has passed=false: the non-HTTP stage exited1 with751 tests,734 passes and17 failures; all six later stages are not_started. All ten sealed evidence hashes, sizes and mtimes match. The failed result pin and terminal details are retained in FAILED-QA-GATE.json. Root reports historical checkpoint91 reconstruction guards reject the changed Discovery hash and a forthcoming revised candidate will address that support; its precise scope is not yet supplied. Neither this report nor the original three-row scripts authorize that revision.

## Exact frozen packet

The author explicitly froze the packet before this formal approval. All nine MANIFEST entries and all ten SHA256SUMS entries match current file hashes; all manifested byte sizes match. All eleven packet file pins are retained in FROZEN-PINS-AND-STATIC-CHECKS.json.

- MANIFEST.json: 5d0c405b463ea118ab22879c4658e55a33ec735e3faf0694bf726c53b09ef7de
- SHA256SUMS: e821cce33187f347c65c8ecef3db9881cf7d34d30f0b59702e8fe3a7a02b2eb9
- package_checkpoint96.py, 31,935 bytes: 6cb68d0a460222b60db9be887013a5f3980281cca5ce79c1c6cb92a635376e07
- join_recovered96_source.py, 4,232 bytes: 54ef53c385f52ed180e5837d10fa3262c38b82e68e2eaac27fb5a0f4dee251ec
- verify_checkpoint96_saves.py, 9,335 bytes: 885e70076a538f96c724ee471d0c294d479d1ad0f37a756520f515406545dd10
- RESEARCH-FILES.template.json, 10,170 bytes: 799d8698ba89645725e37c00d3c93464fe09052a7e6b15d3d13da78b574c5de2

Changed candidate bytes require renewed review.

## Review method and corrections

Read the complete packager, shipped joiner and save correlator, their templates and acceptance instructions, the approved QA runner's source contract, relevant historical receipts, actual baseline observation records, saved source archive and manifest. Checks were static file/JSON/ZIP reading, hashing, source-file enumeration and review writes only. No candidate or application import, execution, syntax check, tests, build, browser, Git, Codex task, Library operation, upload or application write was performed. Review writes are confined to this review directory.

Two issues identified before freeze were corrected:

1. The correlator initially protected only saved 95 identities. The frozen version also preserves the complete twenty earlier protected identities, including all six final 94 saves. Combined with the six real final 95 identities, twenty-six earlier identities are excluded from new results.
2. The original required research selection omitted several full streams referenced by baseline summaries and the known interrupted logger-acceptance history. The frozen selection now mandates baseline complete streams for ports 18860 through 18864 and both interruption records, alongside no-click/cold/scroll observations, both source revisions and the corrected QA approval.

## Exact source delta and history preservation

The saved 95 source is exactly 34,143,193 bytes, SHA256 e3a8478bc95321fecd3ad248b5f8f34c260a8124f3379bc346572b207cea4062. Its ZIP has 1,956 unique entries: 1,955 manifested payloads plus its source manifest. Every manifested payload hash and byte size verifies. Every one of the 1,659 baseline application inputs is present with its expected hash. The saved preview and actual save receipt also match their embedded immutable anchors.

The final input map is exactly the baseline plus two replacements, src/components/discovery.tsx and src/portable/link.tsx, and one addition, tests/discovery-prefetch.test.ts. There are no deleted or additional changed input paths. A fresh independent enumeration and hashing of all 1,660 current application inputs exactly matches the final map; no included symlink was found.

The packager copies every prior source payload, changes only the two authorized application paths, adds the test and scoped research/readmes, and preserves the previous source manifest at roadmark/recovery96/history/checkpoint95-source-manifest.json before replacing its current manifest location. New history/research paths are collision-checked. Other prior source, research history, media/design data and readmes remain byte-identical. All fifteen previously excluded QA rasters stay outside both source inventory and input map. Current portable aliases are not inserted into the source archive.

This is payload preservation, not byte-identical compression or ZIP metadata preservation. The prior saved source/preview files themselves are never modified. The full95 fallback remains available.

## QA and current output binding

The final candidate manifest, exact 1,660-input map and approved QA runner are pinned. The packager requires the genuine successful current result, full sealed attempt membership, all seven stages, passing stage receipts and process terminals, frozen before/after input digest, serial chronology, exact command/cwd and positive PID. It rechecks retained logs and all evidence hashes/bytes/mtimes. TAP summaries must contain complete all-passing counts with no failures, cancellation, skips or todos; the actual counts are recorded rather than manufactured. The acceptance instructions additionally require root to review the expected 856 non-HTTP and one isolated HTTP count.

The four production identity/routing outputs and four portable aliases must match their producer-bound QA observations, hashes, byte lengths and nanosecond mtimes. Each output must fall within its producer interval, using the approved runner's two-second filesystem tolerance. All four portable aliases must agree. The new BUILD_ID must differ from the saved95 build. The preview is created from all four current aliases and its manifest binds the complete new source ZIP hash and common pair identity.

A separate actual external-runner observation must bind the approved runner and real QA result and reference retained terminal evidence. The packager does not independently authenticate execution-tool output: root's actual terminal inspection and the final binding review remain mandatory. The result is trusted local process evidence, not signed process attestation. Dependencies, the interpreter and complete emitted Next runtime graph are outside the stated scope. No checkpoint95 market-only equivalence proof is reused as proof of checkpoint96 JavaScript equivalence.

## Browser measurement and research scope

Future result, terminal and browser identity fields remain null; observations/comparisons are empty and unsupported verification flags remain false in the templates. No pre-filled future pass is present.

The actual browser receipt must identify own VM Chromium, the current QA build and portable hash/bytes, and the immutable95 source/preview anchors. Nonempty actual observations, limitations and baseline/after comparisons are required, with pinned evidence for each side. The optimization disposition is explicit: retain_scoped requires measurementSupportsRetention=true and a reason; otherwise experimental_unaccepted remains possible and must be reported as such. The code binds the evidence but does not validate human metric interpretation. QA alone cannot establish a performance win or acceptable cold-click tradeoff.

The existing research template contains fifty files totaling 418,597 bytes, largest 36,244 bytes. All fifty current hashes and sizes match; all decode as UTF-8. The nine selected network JSONL files contain only the same fifteen limited observation fields, with pathname-only routing and query-presence booleans; they do not contain response bodies, cookies, authorization headers or full query values. The text scroll records are local app-card observations. The selected existing material is relevant to this experiment and its failure/retry history. Inspection found no selected raster/HTML/PDF/ZIP capture or unrelated Mercedes work. Targeted private-key, probable API-key, full HTML-document and inline-image scans found no match; this is not a universal secret-detection guarantee.

The new supplement accepts only explicitly selected pinned text under bounded roots, with two MiB per-file and twelve MiB total limits. It rejects capture/screenshot/private/secret/queue/Mercedes/technical-candidate path components and does not recurse through research directories. Root must still inspect every actual additional file and natural-text claim, preserve all later failed/retry evidence and add measurement/navigation/cleanup evidence and separate launch logs. Filename/type filters alone do not certify content. No actual final research union has yet been approved.

Phone verification, accelerated WebGL, full journeys, full visual/stability validation, public export, release, whole-runtime-graph equivalence and independent server-byte verification remain false. Original upstream index78/full135-pack research remains unrecovered; the new concise supplement is not original index79.

## Safe reconstruction, saving and identity correlation

All archive outputs are exclusive creates in a new external workspace directory. ZIP writes are read back and compared to intended payloads. Source always has ordered sixteen MiB binary slices in ZIP_STORED wrappers and a kit. Wrapper overhead is accounted for in the separate conservative local thirty-two MiB upload policy; it is not claimed to be a generic helper/server limit. Full source remains local and is never selected for chat; an optional separate Library create exists only below that local threshold.

The packager reads the actual shipped kit back, writes those exact joiner bytes into an isolated reconstruction directory, runs only that standard-library joiner and compares its resulting full ZIP bytes, hash, size and pair identity to the source. This is a real required self-test when root executes; it has not occurred during review. The joiner rejects unsafe names, symlinked parts/manifests, wrong part order/membership, compressed/encrypted/nonregular members, incorrect sizes/hashes and existing output files. It never extracts or executes the application.

After reconstruction the packager rechecks app inputs, QA outputs/evidence, selected research and immutable anchors before creating an actionable save request. Parts and kit precede preview and research; an eligible optional monolith comes last. Every request is an exact new create with no existing identity target.

The offline correlator requires the exact plan/request/result pins, one complete ordered real helper batch, successful per-item creates, unique new Library identities outside all twenty-six protected prior identities, initial version zero, backing IDs, matching local file bytes and actual helper-persisted identity/version xattrs. Real returned sizes are checked if supplied; absence is not filled with invented remote metadata. Service renames or partial/multi-attempt results stop for separately reviewed adaptation. It makes no Library call and does not retry denied metadata reads or uncertain saves.

Actual saved results and local xattrs do not independently prove server content bytes or successful attachment delivery. Separate accepted native attachment-send results remain required, and uncertain saves/sends must not be repeated automatically.

## Remaining root gates before any newly reviewed execution

1. Complete genuine QA under the exact approved runner and inspect the actual external exit and expected counts. Do not promote the running attempt to a pass.
2. Complete and review actual scoped browser measurements/navigation, their comparison protocol and retention decision. Preserve limited/negative findings.
3. Independently review the exact final save-input binding, all referenced evidence/content and continued source/output pins before packaging. Adding this immutable static review as pinned text may avoid circular review hashes.
4. After a newly frozen scope and fresh independent tooling/binding approval, root may perform the newly authorized syntax checks and packaging. The current packet is on hold and must not be adapted or executed against revision3 under this report. Inspect genuine exit, manifests, source delta, four-alias preview, self-test and ordered plan before any save.
5. Use the current supported authorized Library prepared helper, preserve complete genuine results, then run the exact offline correlator. Preserve identities and all uncertainty/denial boundaries.
6. Deliver the actual newly saved parts, kit, preview and research through native attachments, retaining separate accepted-send evidence and truthful scoped claims. Keep full95 fallback intact.

Historical static review is complete, with no remaining static defect found in the exact old-scope packet. The failed QA gate prevents saving it. Revised-scope approval, successful current QA, measurements, final binding, packaging, reconstruction, Library saving, attachment delivery and release remain unestablished.
