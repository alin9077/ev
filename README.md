# Roadmark

Roadmark helps people compare new electric vehicles in Australia. It combines an exact-version catalogue, sourced facts, strengths and trade-offs, like-for-like rankings, a market directory and a comparison workspace. The original Model Y introduction and nine illustrated selling points remain part of the site.

The catalogue is growing through dated, brand-by-brand research updates. Coverage is still incomplete: a listed version is not a claim of physical stock, and an unverified market lead is not a purchasable version. Run `pnpm report:coverage` for the current version counts, completed brand reviews and remaining gaps; the live report is authoritative rather than a fixed count in this README.

## Current work

Milestone M0 is delivered: evidence no longer disappears simply because it has aged, and historical recovery material is separate from the working source. M1 is active, reviewing Tier 1 brands in sales order; research completion does not mean all six coverage targets pass. The owner's current direction and milestone acceptance criteria are in [docs/DOT-BRIEF-103.md](docs/DOT-BRIEF-103.md); that brief takes precedence over older planning documents. See [docs/M1_PROGRESS.md](docs/M1_PROGRESS.md) for verified progress. The shorter phone layout and buyer journeys are later milestones, not completed features.

There are no accounts or behavioural analytics. Nothing in this source package publishes or replaces the live site automatically.

## Run locally

Use Node.js 22 or later and the pnpm version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local address printed by Next.js. Development binds to `127.0.0.1`.

## Checks and reports

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm validate
pnpm report:coverage
pnpm report:stale
```

`report:coverage` reports catalogue coverage and the gaps against the current brief. `report:stale` groups evidence by brand and shows which facts will age out of their freshness window in the next 30 days. Use `--details` for the gap list or `--json` for structured output. Both reports accept `--as-of YYYY-MM-DD` for a reproducible date; stale reporting also accepts `--days 30` and `--all-tiers`. Their default date is the current day in Australia/Sydney. The reports do not independently recheck publisher pages.

The active suite tests application behaviour and evidence boundaries. Historical checkpoint byte pins live in the separate archive and do not run in `pnpm test`.

## Build and preview

```sh
pnpm build
pnpm start
```

`pnpm build` validates the data, builds Next.js and creates the portable HTML files. For a static web export, use `pnpm build:public`; it creates `out/`. For the portable build alone, use `pnpm build:portable`; it creates `index.html` and its `index-b.html` alias. `pnpm preview:review` serves the portable file locally and supports the local editorial review queue.

Generated HTML, dependency folders, Next.js output and other build products are omitted from the source attachment. Recreate them with the commands above. Browser checks are available through `pnpm test:e2e` after installing the Playwright browser and preparing the required build.

## Evidence and freshness

The original research snapshot, `au_ev_all_variants_2026-10-06.json`, is immutable. Its matching copy in `data/` remains checked by validation. Dated overlays add or amend research without rewriting that original. Every sourced fact keeps its provenance.

Freshness windows are 45 days for prices, offers and availability; 180 days for range, battery, charging, performance and equipment; and 365 days for dimensions, seats, towing and warranty terms. Ageing changes the checked-date label and ranking eligibility; it does not remove the car or its displayed figures. Rankings compare compatible measurement bases. The report and methodology remain explicit about evidence and coverage limitations.

## Source layout

- `src/app/` — Next.js pages and routes
- `src/components/` — shared interface components
- `src/lib/` — catalogue, evidence, comparison and reporting logic
- `src/portable/` — portable browser entry and adapters
- `data/` — original research, dated overlays and active evidence records
- `public/media/` and `media/` — approved illustration assets and their register
- `scripts/` — validation, builds, reports and local preview tools
- `tests/` — behavioural unit, integration and browser tests
- `docs/` — current direction, methodology and implementation documentation

The active buyer-summary identity ledger remains in `data/`: it is required at runtime to validate a summary against the facts it describes. Historical proposals, recovery folders and checkpoint snapshots belong to the separate archive instead.

## Package the working source

```sh
python3 scripts/package-source.py
```

The command uses Python 3.9 or later with standard-library LZMA support and writes one reproducible `roadmark-104-source.tar.xz` beside this source folder (the name follows the folder). This is a standard, directly extractable tar archive compressed with XZ; it retains the original source bytes, including the immutable research and active behavioural inputs. XZ preset 6 uses an 8 MiB dictionary to keep compression memory bounded. Nothing is uploaded by this command.

Every package must be strictly below 15,000,000 bytes. Before reporting success, the packager reads every archived file back and verifies its path, size and SHA-256 against the embedded `SOURCE-FILE-MANIFEST.json`. A failed or oversized trial does not replace an existing verified output. Dependencies, build output, private environment files and the separately delivered historical archive remain excluded. Only QA inputs referenced by active tests are included.

To choose the output or retain ZIP compatibility:

```sh
python3 scripts/package-source.py --output ../roadmark-source.tar.xz
python3 scripts/package-source.py --format zip --output ../roadmark-source.zip
```

The `.tar.xz` or `.zip` suffix also selects the format; an explicit `--format` must match it. ZIP uses the same manifest and size gate but may be too large as research grows. Fixed file order and metadata make repeat packaging deterministic with the same Python/compression-tool versions; byte-identical compression across different tool versions is not promised.

Extract into a separate directory with a tar tool that supports XZ (for example, `tar -xJf roadmark-source.tar.xz`) or an XZ-capable archive app. Some older built-in archive viewers cannot open `.tar.xz`. Python offers a fallback without extra packages:

```sh
python3 -m tarfile -e roadmark-source.tar.xz ./unpacked-source
```

The source-packaging behavioural test included in `pnpm test` also requires Python 3.9 or later with LZMA support. It uses only a tiny synthetic fixture. See [docs/SOURCE-PACKAGING.md](docs/SOURCE-PACKAGING.md) for the one-time M0 history archive and the retained behavioural fixtures; its original ZIP description predates the tar.xz default above.
