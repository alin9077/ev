# Rebuilt101 historical compatibility: minimal safe wiring

## Recommendation

Keep every old checkpoint hash, fixture, guard body and97/96 helper byte unchanged. Add one strict test-only101→100 source adapter and a newly sealed101 fixture, then prepend that adapter at three existing reader entrypoints. Recompute all101 postimage identities from the newly built candidate; no pre-reset101 approval or hash is evidence for this rebuild.

This is an implementation recommendation from static source100 inspection, not approval of a new101 implementation or a test/build pass. New files are confined to this review directory; no app/candidate code, tests, builds, install, browser or Git was executed.

## Exact existing files that need edits

1. `src/components/market-audit.tsx`: change only the inventory import from `@/lib/market-inventory-data` to `@/lib/market-view-data`. Preserve handlers, JSX, search/filter predicates,24-row increments, fields, copy mapping, evidence and disclosure order.
2. `scripts/build-portable.ts`: add the new view alias pointing to the existing `src/portable/market-inventory-data.ts`. Retain the old alias, full canonical build-time import, `data.marketInventory`, shared portable adapter and unchanged32-byte codec. No projected dataset should be packed separately.
3. `package.json`: add explicit generator write/check scripts; prepend only the non-writing check to supported dev/validation paths. Existing normal/public builds already call validation. Do not silently regenerate during dev/test/build. The current rebuild uses a `.mjs` generator; bind its actual filename and exact new script strings rather than copying vanished prior candidate bytes.
4. `tests/market-audit-interactions.test.ts`: change only the compiled-source override key to `@/lib/market-view-data`. Keep canonical fixture data and all assertions.
5. `tests/buyer-display-copy-render.test.ts`: change only that same compiled-source override key. Keep its direct canonical inventory import, existing99/100 reconstruction and buyer-copy97 historical assertions unchanged.
6. `tests/checkpoint97-source-history.test.ts`: add the101 adapter import and define its shared `read` as `createCheckpoint101SourceReader(rawRead)`. The existing `sourceBeforeCheckpoint97` calls and every positive/negative assertion then see exact100/97-approved component bytes as before.
7. `tests/checkpoint96-source-history.test.ts`: add the101 adapter import and wrap its existing raw callback before `createCheckpoint97SourceReader`, giving raw→101→97→96. Keep the existing assertions, including the textual assertions about91 wiring.
8. `tests/helpers/checkpoint91-history.ts`: add the101 reader before `createCheckpoint99SourceReader`, giving raw→101→99→97→96. The unchanged99 helper already accepts/reverses the exact100 canonical market before its99 logic. Keep the existing original91 hash comparison loop, exclusion conditions, runtime data reconstruction and fixture loading intact.

No edits are needed to `tests/helpers/checkpoint97-source-history.ts`, `tests/helpers/checkpoint96-source-history.ts`, the99/100 market adapters, canonical provider/data, portable data/adapter/codec/entry, or the old checkpoint91 fixtures. Existing portable-market and string-codec tests still assert the old alias/full audit/32-byte boundary and should remain intact; add new101 assertions rather than replacing them.

## Why all three reader sites matter

The97 helper verifies the whole market component SHA `6062cb777b0943c09aeed8bb457b279ac9ab510509e39773d3aa77c34ecacfc1` before reversing buyer-copy changes. A five-character import shortening is still unapproved whole-file drift. Its coordinated reader also verifies Discovery, detail and the buyer-copy helper, so bypassing only one call or accepting arbitrary import substitutions weakens the contract.

The96 tests already enter through97 and therefore fail on that same market import even though96 changed only Discovery/link. They additionally read `tests/helpers/checkpoint91-history.ts` and assert its exact original reader construction string. The new101 adapter must return that helper's exact100 predecessor source, not merely restore the market import. This lets those existing textual assertions remain valid without weakening them.

The34 checkpoint91 input pins do not include package.json, build-portable.ts or market-audit.tsx. Their package/builder preservation is not an old91 hash failure; the97 coordinated guard causes the market failure. Recording all eight modified files in the new101 fixture provides a coherent101 revision boundary and exact100 historical source, including changed reader wiring and mock files.

## New adapter contract

Add `tests/helpers/checkpoint101-source-history.ts`, a fixture such as `qa/checkpoint101-market-view-history.json`, and a dedicated negative-test file. Keep this test-only; do not import it in runtime components or the generator.

- Pin the new fixture's exact raw SHA before parsing. Its reviewed changed-path set is exactly the eight paths above, with no duplicates/deletions; its introduced-path set is the actual generator, view provider, generated JSON, new projection/render tests, documentation, adapter, fixture and new adapter tests included in the final candidate.
- Bind exact current byte length/SHA for every changed file and each introduced non-self file, and retain exact source100 predecessor length/SHA for all eight changes. Verify the complete coordinated current state before exposing any predecessor; a mixture of old and new must fail.
- For each changed file, check its whole current hash before any reversal; reverse only the explicit unique literal substitutions; then require the exact full predecessor byte length/SHA. Do not search-and-replace arbitrary current sources or accept an already-old file.
- Pin unchanged97 and96 adapter bytes too:97 SHA `838dd04e58cf9185bb483294d5cf3614f08d0e31f23a1914ce485152cedca44e`;96 SHA `fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16`. Keep their implementations intact.
- Reject introduced paths when requested as predecessors. Reject noncanonical aliases such as `./`, absolute paths, traversal and backslashes. Return copied cached predecessor buffers; keep unrelated files raw so old outer pins still reject unapproved changes.
- Avoid a self-hash cycle: the adapter pins the fixture; the fixture does not contain its own hash or the adapter hash. The final external candidate/input manifest pins both, with that cycle exclusion explicit. No placeholder can count as an approved current hash.

A helper that restores only market-audit.tsx can unblock part of the suite but is insufficient to preserve the unchanged96 textual91-wiring assertions and full101 coordinated source contract.

## Required authored checks before running QA

Keep all old assertions. Add tests for exact reconstruction of every changed file, exact immutable97/96 helper identities and original91 fixture SHA `7e164c30217b8eff2180c1cdaefccea9effa95a2c9cce283cec01dfbe5768fb9`.

Reject each changed file mutated, missing, swapped, truncated, appended, same-length altered, CRLF-normalized and already-old. Exercise every nonempty101/100 predecessor subset for the eight changed paths (255 combinations), plus missing/mutated introduced guarded files and a changed fixture. Verify the raw new market component still fails the unadapted97 helper, proving the new reader is not repinning97. Verify cached-buffer copies, no predecessor for additions, invalid-path rejection and raw unrelated drift reaching existing outer pins.

New projection tests should check non-writing freshness, exact full-versus-view consumed values and actual component render/handler parity without changing the existing canonical/portable checks. For final portable verification, require exact encoded ev-data and full decoded canonical audit; unexplained emitted JavaScript differences remain fail-closed. Source alias intent is not artifact proof.

## Trusted baseline evidence

`BASELINE-IDENTITIES.json` binds20 relevant predecessor/protected files to the restored source100 archive and its own source manifest. Archive SHA is `0ab0172a49def161e9d6aab1f00ea0d866e919c5a14dd83ee61c9852cb6a4e74`. These are saved100 identities; live app bytes were observed changing during root's authorized rebuild and are not represented as a frozen new101 revision.
