# Ford MY26.50: full-pack source and schema review

Verdict: no concrete defect found in this scope.

## Findings

- Each of the two configurations retains all 10 exact context source objects. Four are context-only, including the held future-update source; none of those four appears in fact, feature, availability, or buyer-dependency claim source lists.
- Full packs and page evidence select context sources without changing claim support or ranking gates. Discovery retains exactly `rankingEligible`, `completeVehicleCountEligible`, and `projectionScope`.
- Both ranking/count gates remain false. MY26.50 is retained as report/generation text and omitted from `vehicleModelDate` by the four-digit-year whitelist.
- Persisted app rows match all 1 model, 2 variants, 10 sources and 362 facts from the adapter. Both configuration boundaries, both expanded buyer records, all 14 dependencies and six accepted source snapshots match the bound artifacts.
- The 140 required nulls remain null; independently recomputed fact/configuration JSON hashes match the app fixture.
- Raw variant inputs total 317. The existing merge proof reports 310 summaries and 315 prior cars / 308 prior summaries unchanged; those runtime totals were not rerun.

## Verification boundary

Read-only code/JSON review only. No app runtime imports, tests, builds, browser rendering, Codex tasks, or app edits. Tests were reviewed as source, not claimed as passed. Actual rendered source disclosures and page schema remain for the parent verification pass. No release approval is implied.

## Key code references

- `configuration-evidence.ts:6-15`, `data.ts:718-745`, `page-evidence.ts:16-59`: context transport and fail-closed checks
- `discovery.ts:61-88,118-122`: three-field projection and bounded ranking gate
- `citable.ts:191-229,332-341,377-393`: claim-specific citations and schema date handling
- `selling-points.ts:87-104,290-337`: held-source guard and dependency-based copy citations

## Exact raw-file SHA-256 hashes

- `roadmark-work/roadmark/src/lib/configuration-evidence.ts`: `7ff6d81950d7ecd6697769cc01ef950d05b2e15fb4ea246a0a760559574f2aa3`
- `roadmark-work/roadmark/src/lib/page-evidence.ts`: `69d4aec9415f4d070e4f7bd12c42c8f967f7053aa838c2db6fd00980637f8629`
- `roadmark-work/roadmark/src/lib/data.ts`: `3ad2ffb8335ad1d061ffa9962d9002dd8a16b564825a905884098223d8edf5db`
- `roadmark-work/roadmark/src/lib/types.ts`: `e669bb885ff8f1a2a5565b139a9fce6b5507cfb3c99179cec061d84af091d645`
- `roadmark-work/roadmark/src/lib/citable.ts`: `c840c1ef6812f42068aef3ef0a82f54fbf475974bd45debd294a544a098779ef`
- `roadmark-work/roadmark/src/lib/discovery.ts`: `5dd8ce550c2479f763fca976f70cf398f43f2d068995c6f088c225d2a0c4aa5f`
- `roadmark-work/roadmark/src/lib/selling-points.ts`: `27709189a6ef75f38350b9dbfc464fd6e2b3dc7f7e96af4c57d2a2fcc1c355cf`
- `roadmark-work/roadmark/src/lib/buyer-proposal-storage.ts`: `2febace11633321f2c103a0b3db4c4632df8e3601195922c4b83fce6354f7f7c`
- `roadmark-work/roadmark/src/lib/launch-evidence.ts`: `4d017cf74835569b2d3fedb2ca68e4c5a5d8b07369ae814b62a66443f7b79e51`
- `roadmark-work/roadmark/src/lib/config.ts`: `6f3507757cc703272faf172881d3f265d1512b883c0cb6e4808d8062ef61936b`
- `roadmark-work/roadmark/tests/configuration-evidence-transport.test.ts`: `a0839b214137fae78a0ef04081dd3ff52c4cf2c26fbe57b1874e37d69e668c39`
- `roadmark-work/roadmark/tests/citable.test.ts`: `51fa779a238da86a53d9bd4f7f78b37c6f769600ec878c305b61edfa2f1112e5`
- `roadmark-work/roadmark/tests/ford-custom-integration.test.ts`: `d8f67aa22a4848f23a5eaac7cbfd5fb35d5570a7a7c9239384c831defbad2505`
- `roadmark-work/roadmark/qa/ford-custom-integration-fixture.json`: `b1d385f93fe3aa3fcfb66aebe9914ccbec33148e147a1102cdfb03cb3835a75b`
- `roadmark-work/roadmark/data/catalogue-additions-2026-10-10.json`: `729386711765938a3234e1df910f3a9c75379d42adff9bc13abba74314d42088`
- `roadmark-work/roadmark/data/buyer-selling-points-2026-10-10.json`: `0cc11616b78bd82a0e9a8d55362dc1e098b84ff95849d31d4fbd494f6bcb0f54`
- `roadmark-work/roadmark/data/buyer-identity-snapshots-2026-10-10.json`: `80a21fae26da4c18c85fa793a390b2477e259a0abaec073a1df6e22a369a61d1`
- `roadmark-research/ford-custom-runtime-candidate/adapter-candidate.json`: `8420b34f344ffcffbf98dd58fabe7403ac45fccbcc87e9e286aeacdf049fa07c`
- `roadmark-research/ford-custom-runtime-candidate/binding-effective-snapshot.json`: `83d96b618844ad22e73c3fec39a25e99fdd449bb91cd634d62f0431ac322a58b`
- `roadmark-research/ford-custom-runtime-candidate/actual-merge-proof.json`: `68aa27377827132c17f742bf0947c346af03b6e9680b408cdc5c2033c667a21d`
- `roadmark-research/ford-custom-runtime-candidate/runtime-copy-payload.json`: `cf33c6a931e31614ed77a3f0f3bfcfebd676500008d105c03d43652084759edc`

JSON review SHA-256: `7444ea51763a3159faa2476efaee01d05021cb2f6955125cf0124ac9fe75c3d0`

Static JSON comparisons: 19 passed; this is not a test-suite execution.
