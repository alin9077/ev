# Roadmark99 selected research text content audit

## Finding

No blocking content or research-conformance finding was identified in the exact frozen draft2 selection. The independently reconstructed, deduplicated union contains **192 files, 3,936,923 bytes**. The 111 explicit research references account for 1,967,201 bytes; automatic evidence, binding and anchor inclusion accounts for the rest. The largest selected file is 209,471 bytes. This is a static content-review result, not a root attestation or permission to package, save, upload, execute, or publish.

## Exact frozen scope

- Save-tooling revision5 MANIFEST.json SHA-256: 62e631345942b43e2b4daadf85abe75cf7c6b2e674c61730190232df3aa5369d
- Draft2 MANIFEST.json SHA-256: fac4119c0d3317359bd4da685ae251751fe30eae09262e179671a66b8ff98513
- Draft2 SAVE-INPUTS.draft.json SHA-256: d76aed6c0a2950c5c4ac92ba5a69e29d396650fc3318ab6d58c618b3dfbb3c28
- Draft2 SCOPED-MAZDA-OBSERVATION.draft.json SHA-256: 8464fe957d3956cc892a4f317f9c4bde79d3137dfdeb645cd2217676e7269d7d
- Full per-file selection and pins: SELECTED-TEXT-MANIFEST.json, SHA-256 4f09270e53cb0d28e6c01ace416ab533556f334c5f776fc91c2bec159ce0cd68, 68014 bytes

The closure was reconstructed independently from the package source's literal selection rules, without loading or running that source. It includes each explicit research reference; all 42 QA3 sealed evidence members plus its result; all 10 QA1 sealed members plus its result; all 20 QA2 sealed members plus its result; external terminal and launch records; all selected source/map/QA-projection/repair/runner anchors; semantic and preservation evidence; and the draft2 binding itself. All 20 numbered actual browser observations and the separate 3,115-byte desktop hero label/target/geometry observation are included.

The source/map/projection states are the initial candidate and revisions2/3/4, with revision2/3/4 repair manifests and the pinned runner. No .ts source file is selected as research. Raw source history is a separate preservation subject. The baseline98 expected-input map is not selected under applied98; this audit does not repeat the separate saved98 ZIP verification. Literal mentions of baseline98 and its hash remain in applicable receipts and manifests.

## Conformance and integrity

- Every selected path is relative, normalized, free of traversal, inside the package's allowed directory prefixes and has an allowed suffix (.json, .jsonl, .log, .md, .txt, .py, .mjs or .patch)
- No selected path contains a package-rejected capture, screenshot, private, secret, queue, Mercedes or technical-candidate term
- No selected path or ancestor was a symbolic link
- Every selected file decoded as strict UTF-8; no NUL or disguised PDF/ZIP/PNG/JPEG file signature was found
- Every selected file is below 2,097,152 bytes; 3,936,923 total bytes is below 12,582,912
- All supplied SHA-256 and byte pins matched; all referenced sealed-QA mtimeNs matched; all three QA directories exactly match their declared evidence membership plus run-result.json
- No missing selected files, conflicting reference pins, duplicate explicit research paths, invalid selected JSON or unexpected selection suffix was found
- The root-only save-input booleans remain null and were not changed by this audit

## Content review and potentially suspicious text

Every selected byte was read, decoded and scanned. Review combined complete-file matching for credential formats, credential/private contexts, email and credential-bearing URLs, raw binary/HTML/data-URI markers and large encoded blobs with JSON structure inspection, source-map shape checks, URL/domain enumeration, full review of the 20 browser observation records and contextual review of scan hits. Repeated map hashes and TAP output were inspected structurally as well as scanned. The contextual hits below are legitimate task evidence, not retained secrets or unrelated payloads.

1. Source paths and test names. The expected-inputs maps in applied99 and revisions2/3/4, all QA frozen-inputs and protected-input-comparison records, source manifests and source review pins mention existing Mercedes evidence and review-queue source files. They contain names and hashes, not the referenced Mercedes payloads or private queue contents. For example applied99/expected-inputs.json lines83,127,346-347 and1403,1461-1463 are path/hash entries. QA command plans and stdout include existing test names for queue handling, capture failure and credential-URL rejection. Their inclusion preserves the full QA evidence; these words do not make the files raw captures or credentials.

2. Credential-like words. QA1/QA2/QA3 non_http_tests.stdout.log mention source-token wrapping and rejection of credential URLs (QA3 lines2306-2307 and2612-2613). External terminal records use the tool metadata field original_token_count. verify-portable-delta.py and verify-portable-delta-final.py lines181/184 use token for decoded string-table indexes. No secret values were present. The package's README/ROOT-ACCEPTANCE and lines347/520 of package_checkpoint99.py discuss exclusion rules. These are explanatory/validation text.

3. Public seller metadata. mazda-trim99-candidate/data-delta.json, expected-cars.json, summary-delta.json and final-revision4-semantic-evidence.json contain or project source-attributed Melville Mazda, Palmyra WA advertisement metadata: stock11397703, advertised VIN LVRHDCEK6TN551337, seller series/model code, build/compliance dates and seller-record timestamps. The linked public dealer source is the new CX-6e listing for stock11397703. The data explicitly distinguishes seller claims from manufacturer applicability, fulfilled orders and verified current physical stock. No owner/customer identity, personal contact record or private financial/medical data was found.

4. Source capture references. captureLimitations, hashBasis and sourceUrl fields in the Mazda data describe provenance and limitations, including saved extractor results or raw HTTP-response hash basis. They contain bounded source descriptions, structured vehicle evidence and hashes; they do not include the underlying publisher HTML/PDF response. mazda-root-visual99/root-visual-observations.json contains attributed technical-row observations, rawPdfBytesRetained=false and rawPdfSha256=null. No original publisher PDF, screenshot/image file, HTML document, base64 image/PDF or long encoded blob is selected.

5. Browser text observations. The 20 numbered records and normalized observation contain localhost app routes, measured geometry, attributed visible observations and limitations. They contain no account URL tokens, authentication data, screenshot pixels or external publisher dumps. desktop-hero-dom.json is a bounded local-app comparison of nine hero labels/hrefs/target-existence plus geometry and vehicle-selection query parameters, not an unrestricted webpage/browser-state capture. The repeated source screenshot mention in case01 and its normalized copy describes how the observation was made; it is not image content. Case08 retains the failed Footnote1 selection and recovery to actual Footnote390.

6. Artifact handles and local execution metadata. Selected review/preparation records contain Library artifact identifiers, SHA-256 pins, tool chunk/session identifiers, process IDs and workspace paths needed for provenance. No authentication credential was found in them. QA environment records contain the documented telemetry/memory settings rather than an inherited environment dump. The only web URL authorities found were www.mazda.com.au, www.melvillemazda.com.au and localhost127.0.0.1 ports8765/8766.

Scan-hit totals before contextual classification: {"credential_context": 21, "out_of_scope_context": 286, "private_context": 10}. There were zero credential-format, email, credential-bearing-URL, raw-content-marker or long-encoded-blob hits. All context hits were classified as above; none requires removing or rewriting sealed evidence.

## Method limits and handoff

This is a whole-selection static scan with structural/contextual review, not a guarantee that arbitrary unknown secrets could never evade a pattern check. It does not re-run QA, reproduce visual observations, browse the public sources, establish source truth, verify the package execution behavior, inspect saved98 ZIP contents, approve integration or sign root's attestations. No candidate/app code was executed, imported, syntax-checked, built or tested. No Git, browser, network, package, upload or external-state operation was used. Only this content-audit directory was written.

The result applies to the pinned 192-file union. Any later root final binding, newly added review report, altered evidence bytes or changed selection needs a bounded delta review and updated final count/pins. The report and inventory are not themselves part of the counted192 files unless root deliberately adds them. Original selected evidence and assertions remain unchanged.

## Prospective root preservation receipt addition

After the frozen draft2 union was audited, root supplied roadmark-research/applied99/root-final-preservation-check.json. Its actual size is **302 bytes**, SHA-256 **22a3c610a9d2e022b014b819440d637bef1eaeb8a507654f2df382ad25f0f165**. The full strict-UTF-8 JSON was read. It records a UTC observation time, exact-current-map assertion,1,675 input count,194 protected pins,111 verified research refs, completed root source/semantic/browser review and a false broad-release/real-phone claim. Its path, suffix, size, content and supplied hash pass this audit; it contains no secret, private record or raw capture. This reviewer has not adopted or independently re-performed those root assertions.

Adding that receipt alone to the frozen draft2 union would produce **193 files,3,937,225 bytes**. This is a prospective count, not a claim that the final root binding has already been authored or inspected. Final binding replacement and any added audit/review artifacts still require the bounded delta review described above.
