# Current rebuilt101 /market payload measurement plan

## Answer

A verified saved100 production-build identity survives, but its actual market HTML/RSC/chunks and the lost101 baseline request observations do not survive in the inspected source/research archives. There is no usable verified100 market-JS byte total to compare with the current build. Do not reuse the lost-VM31.7% result.

Current rebuilt101 is BUILD_ID oWIsGbFiaYgzVUEyU5Zrg. Static inspection finds nine modern initial JavaScript resources totaling886,228 raw bytes, one CSS resource88,013 bytes and market HTML100,926 bytes. The initial modern document+JS+CSS total is1,075,167 raw bytes. The market UI/data chunk is /_next/static/chunks/0kybbgc4nnabl.js,396,195 raw bytes. One112,594-byte noModule fallback is listed separately and excluded from modern Chromium's initial script set. These are fresh exact artifact sizes, not transferred gzip sizes or measured speed.

## Minimal defensible comparison

1. Preserve the current101 .next tree and BUILD_ID in place. Pin the current files listed in STATIC-EVIDENCE.json and retain the current QA result. No build or source change is needed on the live current101 tree for static measurement.
2. Root restores a new isolated100 source tree from the verified source archive below. Verify its saved source-manifest/expected-map members. Use a new .next directory, never overwrite the current101 build. An example proposed destination is roadmark-rebuild101/baseline100-measurement/app; it has not been created by this worker.
3. Root rebuilds that exact100 source with the same current installed dependency versions/runtime, compiler, command and environment as current101. The declared dependencies/devDependencies, pnpm lockfile, next.config.ts and tsconfig.json already match exactly; package.json changes are scripts only. Match current production command node node_modules/next/dist/bin/next build, NEXT_TELEMETRY_DISABLED=1 and NODE_OPTIONS=--max-old-space-size=1280 --max-semi-space-size=8, with SITE_STATIC_EXPORT, NEXT_PUBLIC_SITE_URL and NODE_ENV removed as in the current QA receipt. Retain actual terminal, build identity, toolchain/dependency observations and source hashes. Dependency reuse/isolation strategy is root's execution decision; no install or symlink is created here.
4. For both completed builds, parse .next/server/app/market.html as inert text. Enumerate distinct external script src values, split modern versus noModule, and enumerate stylesheet links. Read the corresponding .next/static/... files, record SHA256 and exact raw byte length, and sum modern JS, CSS and HTML separately. Use market/page_client-reference-manifest.js to identify the market-audit component chunk memberships. Keep inline scripts/Flight in HTML only; do not add market.rsc to a document total unless measuring a separately requested RSC response. Retain every asset identity rather than trusting names alone. Run precisely the same read-only method against both builds, and recheck101 pins afterward.
5. Report the fresh raw-byte difference as initial emitted modern route assets only. It establishes a static shipped-artifact comparison; it does not include later async/background route requests or prove browser consumption. The before side must be labeled newly rebuilt100 under the current environment, not the original historic100 build.
6. Only if root needs real transferred-byte evidence, conduct a new matched browser/logger experiment on both builds. The exact previously reviewed logger survives at the path below. Use fresh same-type origins, unchanged compression/prefetch settings, same browser/viewport and explicit phase boundaries. Count actual response Content-Encoding/body bytes and all distinct market RSC responses by log row; keep homepage/other prefetch separate, include previously served same-origin resources as inferred reuse rather than invented requests, and disclose logger errors. No response-byte or timing percentage should be extrapolated from this static plan.

## Exact surviving paths

- Verified baseline archive: roadmark-recovery/reassembled100/Roadmark-recovered-100-source.zip, SHA2560ab0172a49def161e9d6aab1f00ea0d866e919c5a14dd83ee61c9852cb6a4e74
- Saved100 QA identity: roadmark-work/roadmark/recovery100/research/roadmark-research/applied100/qa-attempt1/run-result.json; BUILD_ID lBzNgnFnu62t8Fg0e4IQ5. Its local bytes were checked against the archive member
- Saved100 production log: same directory, production_build.stdout.log;391 pages and route listing survive, but no route JS byte totals
- Current101 QA: roadmark-rebuild101/qa-attempt1/run-result.json and production_build.json
- Current market entry HTML: roadmark-work/roadmark/.next/server/app/market.html
- Current client-reference manifest: roadmark-work/roadmark/.next/server/app/market/page_client-reference-manifest.js
- Surviving reviewed logger: roadmark-work/roadmark/recovery96/research/roadmark-research/mobile-performance96-assessment/measurement-candidate/revision-2/loopback-access-logger.mjs; SHA2565181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512

STATIC-EVIDENCE.json contains exact current asset pins, verified recovered100 member identities, archive-gap findings and configuration comparisons. No raw HTML or JavaScript payload is copied into this packet. This worker performed only static reads, ZIP inspection, hashing and new evidence-file preparation; no app/candidate imports/execution, builds, browser/network, tests, source edits or Git operations.
