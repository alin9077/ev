# EV Side by Side

Independent Australian EV comparison site built from the supplied 6 October 2026 research. The 8 October launch adds nine small, citable pair pages, dated key facts and questions, a glossary, copy text and machine-readable exports. See `docs/AI_LAUNCH_PLAN.md` and `qa/AI_LAUNCH_RESULTS.md` for release details.

## Run

Requires Node >=22 and pnpm 11.19.0 (Node 24 was used for verification). The Next.js application itself supports Node >=20.9; the included performance audit tools require Node >=22.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by the server. It defaults to port 3000 and chooses the next available port if occupied.

## Checks

```sh
pnpm validate
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm exec playwright install chromium webkit firefox
pnpm test:e2e
```

Browser tests default to `http://127.0.0.1:3001`; set `TEST_URL` to another running local server if needed. Production execution:

```sh
pnpm build
pnpm start
```

Use `pnpm start --port 3001` if port 3000 is occupied. Set `NEXT_PUBLIC_SITE_URL` to the approved real origin before a public build; local builds are noindex. The interactive Node build remains supported. Public Sites hosting uses pre-rendered HTML exported by `pnpm build:public`, with client-side selection on interactive routes. Public launch is authorised; a custom domain will be chosen later.

## Where to look

- `IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`: decisions and structure.
- `data/RESEARCH_DATA_DICTIONARY.md`: mapping, immutable snapshot and integrity scope.
- `src/lib/compare.ts`: comparison eligibility and URL validation.
- `src/lib/media.ts`, `media/approved-assets.json`: media permission gate.
- `docs/ORIGINAL_ASSET_BRIEF.md`: original graphics and production backlog.
- `qa/TEST_RESULTS.md`, `qa/screenshots/`: actual verification and screenshots.
- `docs/EDITORIAL_RELEASE_CHECKLIST.md`: unresolved publication, rights and owner decisions.

The supplied research is desk research, not a live manufacturer feed or independent road test. Thirty-four variants, ten families, eleven generation records and all original source IDs are preserved. No accounts, paid services, analytics, vehicle integrations or external media requests are required.

## Standalone HTML

Open the root `index.html` directly in a browser. This is a self-contained copy: its styles, application code and all 34 variant records are embedded, so it also works offline. All 91 comparison details appear directly in seven chapters, starting with price and ownership, followed by automated driving. The homepage compares a blue Model Y baseline card with nine alternative EV families in synchronized, stroke-separated columns. The default baseline is Model Y Premium RWD. Change any family’s trim in the opening price comparison. Price and automated driving stay first and second; priority choices reorder the remaining chapters. Arrow keys, buttons and the model menu work alongside touch and mouse gestures. A compact chapter row in the sticky bar steps through the chapters or jumps to one, and marks the chapter in view. The A–G chapter index uses consistent colours and original pictograms, and conditional explanations appear beside the relevant values. Chapter anchors and source footnotes remain available. Internal navigation, filters and comparison selection use local URL state. Original source links require an internet connection. The portable file includes the entire catalogue and is larger than the server-rendered app.

`pnpm build:portable` regenerates it from the shared components and current research overlay. `pnpm build` also generates it. The matching `public/index.html` makes the same entry available at `http://127.0.0.1:3001/index.html` when the local Next server is running. No redirect or running server is required for the root file.

The hero describes a ten-model comparison of Australia’s leading EVs. A dated sales footnote explains that it covers nine of the January–September 2026 sales top ten, plus Atto 3; Atto 1 is not yet in the catalogue.

Fresh research is recorded in `docs/REFINEMENT_RESEARCH.md`; the original research JSON stays immutable. The 7 October completion pass (`data/research-completion-2026-10-07.json`) gives every comparison cell a sourced value; `pnpm audit:content` fails on unexplained gaps; explicit 8 October source-audit holds are reported separately. The 7 October buyer-question pass (`data/research-buyer-2026-10-07.json`, built by `scripts/build-buyer-overlay.py`) adds 21 criteria and four measurements for driveaway price, FBT, insurance, resale, support, real-world range, energy use, home charging, family fit and cabin equipment.


## Citable public build

```sh
NEXT_PUBLIC_SITE_URL=https://ev-side-by-side.taytay245464.chatgpt.site pnpm build:public
node scripts/serve-static.mjs
TEST_URL=http://127.0.0.1:3012 pnpm exec playwright test tests/e2e/citable.spec.ts --project=chromium
```

The public build requires an HTTPS origin. Local builds without that setting remain noindex. `.openai/hosting.json` pins the Sites project and exports `out` with real 404 handling. The build writes hosting headers separately because Next.js headers are not applied to static exports.

- `/comparisons`: index of all nine permanent pair pages.
- `/compare/model-y-vs-sealion-7` and eight other stable pair URLs: exact baseline and rival, six key measurements, buyer questions, inline dated source links and matching Car/WebPage/FAQPage structured data.
- Each pair exposes `/comparison.json` and `/comparison.md`. `/llms.txt` lists the pair pages, variants and reference pages.
- `/glossary#wltp`, `#lfp`, `#v2l`, `#fbt`, `#driveaway`: short definitions with comparison-row links.
- Variant pages also open with dated key facts, questions and a copy button. The interactive fleet and comparison copy their currently selected pair.
- `data/source-audit-2026-10-08.json`: all 32 previous summary-only source checks. `src/lib/launch-evidence.ts` applies source holds and corrections while preserving original research. The content audit distinguishes explicit holds from unexplained missing values; it does not certify every figure.
- `qa/ai-citation-checks.csv`: twenty questions for monthly manual checks in ChatGPT, Perplexity and Google. No analytics or scheduled task has been added.

Unresolved editorial follow-up: retrieve the ten inaccessible articles or replace them with primary evidence; confirm licensing or maker replacements for held driveaway/weight data; provide a correction inbox and choose a custom domain. The public pages disclose their evidence limits.
