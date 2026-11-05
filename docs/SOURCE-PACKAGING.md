# Working source and one-time history archive

The working source is packaged as a single ZIP below 15,000,000 bytes. `python3 scripts/package-source.py` creates it reproducibly with fixed ZIP metadata and an internal `SOURCE-FILE-MANIFEST.json`. Dependencies, build output, generated QA reports/screenshots, local review data, environment files and the history archive are excluded. The packager includes only the QA files that active tests explicitly read.

The separate, one-time `roadmark-103-archive` package preserves historical recovery folders, start-here handovers, proposals, staged research, generated checkpoint HTML, QA output, and checkpoint byte-pin tests. `ARCHIVE-MOVES.json` records each original path, destination, size and checksum. Original bytes are retained in the archive; they are not discarded. Its `ARCHIVE-MANIFEST.json` contains the same move records.

## What remains in working source

- The unchanged original research JSON and the matching `data/` copy
- Every runtime overlay and the current catalogue's complete source records
- Active evidence sidecars used by current behavioural tests
- The buyer-summary identity ledger, even though its filename contains `snapshots`: the summary evaluator requires it at runtime
- Behavioural fixtures needed to verify facts, qualifications, mutation guards, interfaces, portable transport and source boundaries

Three formerly staged inputs are now explicit behavioural fixtures in `tests/fixtures/catalogue/`: bus integration, Renault/KGM and Kia/Cadillac. Their original copies are also preserved in the archive.

## Test migration

The original 28 `checkpoint*.test.ts` files are preserved in the archive. Pure historical byte reconstruction and prior checkpoint counts are no longer acceptance requirements. Product assertions embedded in those files have been extracted into ordinary named suites:

| Archived suite | Active behavioural coverage |
|---|---|
| checkpoint62-motorcycles | motorcycle-offer-evidence |
| checkpoint64-market | market-commercial-scope |
| checkpoint66-market | market-maserati-fiat-scope |
| checkpoint67-market | market-chassis-availability |
| checkpoint68-market | market-unresolved-epochs |
| checkpoint69-market | market-order-advertising |
| checkpoint71-offer | streetdog-offer-behaviour |
| checkpoint73-honda | honda-super-one-behaviour |
| checkpoint77-market | market-seller-listings |
| checkpoint80-market | market-sitrak-c3he |
| checkpoint81-market | market-b70-layout |
| checkpoint82-strength | strength-evidence-guards |
| checkpoint83-market | market-c9h-identity |
| checkpoint84-transit-city | transit-city-behaviour |
| checkpoint86-market | market-element-lengths |
| checkpoint88-market | market-skywell-seating |
| checkpoint89-market | market-evito-seating |
| checkpoint91-desert-strength | desert-strength-behaviour |
| checkpoint91-market | market-mifa-availability |
| checkpoint93-market | market-deepway-lead |
| checkpoint95-market | market-mazda-advertisement and mazda-cx6e-behaviour |
| checkpoint96-source-history | History-only; existing discovery-prefetch behaviour remains active |
| checkpoint97-source-history | History-only; buyer-display-copy and discovery behaviour remain active |
| checkpoint99-history-coverage | mazda-cx6e-behaviour and avatar-dimension-projection |
| checkpoint99-mazda | mazda-cx6e-behaviour |
| checkpoint100-market | market-held-evidence |
| checkpoint102-history | History-only; market projection and evidence validation remain active |
| checkpoint102-trikes | market-trike-evidence |

All active names refer to `tests/<name>.test.ts`. The independent reflow and generated-market-view suites also retain their behavioural checks after removal of their embedded historical byte pins. Current tests read the live catalogue or purpose-specific evidence fixtures rather than reconstructing the old source tree.

## Verify or recover an archived item

Unpack the archive beside the working source. Locate its original path in the manifest, verify its checksum if needed, and read that item directly from the archive. Restoring historical source on top of current files would replace current work; use a separate directory if reconstructing an old checkpoint. The archive is historical evidence, not a second dependency package needed to run or test Roadmark.
