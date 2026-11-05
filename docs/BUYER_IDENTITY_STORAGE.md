# Immutable buyer identity storage

The checked inline proposal is preserved in development checkpoint 37 and the separately saved research proof. Active storage now separates repeated approved expected identity objects into a content-addressed ledger. This is a storage change, not a new source of vehicle truth.

- `buyer-selling-points-2026-10-10.json` and `buyer-identity-snapshots-2026-10-10.json` must travel together under `data/`
- Runtime Node processes use the project root as their working directory, matching the existing research loader
- The server/build loader parses both once, validates exact order-sensitive snapshot hashes and target IDs, then freezes every nested expected object
- Missing/malformed references, mixed inline guards, incorrect targets and invalid hashes fail loading
- Explicit `none` declarations preserve older records that never had a whole-identity guard; missing declarations are invalid
- The pure selling-point evaluator is unchanged and receives the original expanded shape. Actual vehicle objects are never borrowed into expected snapshots
- Client components and portable pages receive only prepared summaries, not the expected ledger
- Next output tracing explicitly includes both exact input files for server routes

To migrate a reviewed inline proposal, run `node --import tsx scripts/normalize-buyer-identities.ts <checked-inline-file>`. This verifies exact full-proposal round trip before writing either file. The two writes are sequential, so keep a checked checkpoint and never publish only one member of the pair. Do not use current catalogue facts to regenerate approved expectations.

Measured active input storage fell from 70,256,293 to 41,527,940 bytes, saving 28,728,353 bytes (40.9%). No runtime serialization cache was introduced. This is not a measured mobile-loading or browser-performance improvement.

See `qa/buyer-storage-migration-proof.json` for complete 291-car/284-summary parity, 335 checks and 163 representative mutations. These are storage regression checks; they do not replace or relabel the frozen Kia/Cadillac compositional source proof. Final verification passed: 301 tests, TypeScript, ESLint, structural checks, 337-page build and portable generation. All 23 emitted server traces contain both readable JSON inputs. Portable HTML is byte-identical to checked checkpoint 37.
