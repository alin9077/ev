# Rebuilt checkpoint101 scoped source review

## Decision

GO for root full QA of the exact rebuilt101 source candidate below. No remaining static blocker was found after the reported typing and history-reader boundary issues were corrected. This is a newly rebuilt candidate after the workspace reset; historical101 results and approvals do not establish acceptance of these bytes.

- Candidate: roadmark-rebuild101/qa-candidate.json, SHA256 34651bac29fc721eb9021fa3f4859b01928fbcef3fadfda6869d216ce78c3d06
- Expected inputs: roadmark-rebuild101/qa-expected-inputs.json, SHA256 0777404050e976a91d2e87e1cb8e64c78d51cffc075e709abbc530cd341bf8aa
- Expanded baseline: roadmark-rebuild101/qa-baseline-inputs.json, SHA256 a849da057146300c8525598d3b251c3e4b182096ca6d183e51a1d1ab6574ad0d
- Unchanged QA runner: roadmark-rebuild101/run_qa99.py, SHA256 a043d6ac749a39d025bf452eddb55440d2ac81ba3b73be9f4d894a5055a2e10f

## Verified static facts

The saved100 source ZIP at roadmark-recovery/reassembled100/Roadmark-recovered-100-source.zip is 48,765,019 bytes, SHA256 0ab0172a49def161e9d6aab1f00ea0d866e919c5a14dd83ee61c9852cb6a4e74. All1,678 original source-map entries match it. Independently applying the unchanged runner's input exclusions to archive members yields all2,807 expanded baseline entries exactly. The expanded map retains additional recovery/history payloads rather than treating those files as new application changes.

All2,813 current input paths and hashes match the expected map. The candidate exactly derives it through14 paths: eight modifications and six additions. No saved100 application member is missing; all other saved100 member bytes remain unchanged. Canonical inventory, original hero, market page and discovery-prefetch sources are unchanged.

The generated display/search projection is446,265 bytes, SHA256 e9324e71479402b0e8d3c2e832c6cc0ed6b4be4f0097b6603214474804faed6e. Independent JSON inspection and serialization reproduce it exactly: all242 record IDs, order, allowlisted values, nested arrays, top-level sections and optional-field absence are preserved. The full1,653,304-byte canonical inventory remains SHA256 2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac, including143 unverified leads and audit metadata.

The UI component differs only by its provider import. The provider imports only the generated projection. Package dev/test/validate paths use the nonwriting freshness check, and generation remains an explicit --write action. The portable builder differs only by an added alias mapping the new provider to the existing portable canonical adapter; its embedded marketInventory still comes from the full canonical source. Exact emitted portable equality remains for fresh runtime verification.

All eight modified-file preimages in the history fixture match saved100 bytes, lengths and hashes. All eight modified-file and three runtime-addition current pins match the reviewed files. The fixture is sealed at SHA256 0a00252acf24358b9fa8551b08f90d04744487b45b14c194ac861485b7dabddb. The reader verifies the entire guarded delta before exposing predecessor bytes and returns copies. All six newly introduced paths are explicitly rejected as having no source100 predecessor; the three test/fixture/adapter additions are in a separate rejection set to avoid self-hash cycles. Existing historical outer pins remain unchanged.

The final path guard rejects dot segments, absolute paths, backslashes, percent encoding, query/fragment syntax and colon forms, while permitting legitimate bracketed Next route paths. Tests cover every guarded-file mutation, all six no-predecessor paths, unsafe URL/path aliases and an existing bracket-route passthrough.

## Closed findings and limits

The initial root typecheck log exposed inferred {} return types in the generator. Explicit return fields resolve the inference issue without changing generated JSON bytes. Reported unsealed-fixture, alias-bypass, incomplete no-predecessor and bracket-path compatibility findings were corrected in the final reviewed source. The exact current helper and test hashes are recorded in DECISION.json.

This review used only static file, hash, JSON, ZIP and text inspection. It executed or imported no candidate/application code and ran no syntax check, test, build, browser action, network request, Git command, upload or screenshot. No application or configuration file was edited. This report persists the already completed review; no new source review or execution was performed to write it.

Approval covers proceeding with root full QA only. Fresh full-QA results, actual output/terminal seals, emitted portable preservation, browser behavior, request payload measurement, packaging, save, delivery and release remain separate gates. No historical101 runtime finding is reused as proof for this rebuilt candidate.
