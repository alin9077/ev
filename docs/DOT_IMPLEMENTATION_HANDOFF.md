# DOT implementation handoff

Prepared 11 October 2026 for EV Side by Side. This handoff packages the buyer research and defines a bounded implementation assignment for a later DOT session. No application changes or deployment are included in this handoff.

## Implementation goal

Implement and verify a complete first release that helps an Australian EV shopper move from their situation to a useful shortlist and a concrete purchase-verification plan. Provide three entrances: **Will an EV work for me?**, **Find cars for my needs**, and **Compare cars I know**. Let users compare any two or three researched variants, understand relevant differences and uncertainty, and save or export their reasons, compromises and outstanding checks. Preserve the existing Model Y editorial comparison as a clearly labelled specialist path, the source evidence and qualifications, and working shared links.

The assignment is complete when all Phase 1 acceptance criteria below pass across the Next application, public static build and supported portable experience, with the existing data and citation checks passing. Deliver a reviewable implementation, test results and a concise account of remaining limitations. Production publication is a separate action and is not required by this assignment.

## Read first

1. `AGENTS.md` in the project root. Read the relevant local Next guides under `node_modules/next/dist/docs/` before writing application code. This project uses Next 16.3.8, React 19.3.0 and TypeScript; do not assume older Next conventions.
2. [EV buyer groups and website journeys](EV_BUYER_JOURNEYS.md), especially the ranked groups, exact existing journeys, proposed flow and missing-support table.
3. The current application code, `README.md` and `data/RESEARCH_DATA_DICTIONARY.md`.
4. `docs/ARCHITECTURE.md` and `docs/AI_LAUNCH_PLAN.md` for background. Some historical descriptions are stale; reconcile them with the actual route and component wiring.

The broader buyer report contains P0, P1 and P2 recommendations. This handoff turns those into a specific first implementation scope. Historical master prompts and plans are background, not a reason to expand this assignment beyond the goal. Preserve applicable repository instructions and the user’s later directions.

## Starting state and evidence limits

- Snapshot base commit: `ca598cdc4074ee27fe4b3db8dd8b60a343ce8deb`. The archive contains working-tree file contents plus the newly written research and handoff documents; it does not contain Git history. The archive manifest records every packaged file's SHA-256 hash.
- The catalogue has 34 variant records across ten families. It is not a comprehensive listing of every EV in Australia, and not every record is current/order-listed.
- Core pages already include model/trim filters, comparison evidence, differences-only mode, feature search, software history, dated sources, copy/share, device-local saving and print. Reuse them.
- The source homepage uses `FleetExperience` and `ModelYVerdict`. An older `Experience mode="home"` implementation still exists; do not mistake it for the routed homepage.
- The public HTML retrieved during the audit had broader top navigation and an older comparison hero than the current source. Establish the target behaviour from this brief and current code, rather than copying either version blindly.
- Buyer rankings are product-priority hypotheses, not measured market shares or analytics results. The previous audit inspected source and deployed HTML; it did not run live browser interaction tests.
- Automotive evidence is a dated research snapshot with targeted overlays and explicit holds. Existing QA reports document earlier runs, not verification of the upcoming changes.

## Phase 1 scope

### A Clear entrances and navigation

Provide the three starting actions prominently and let users move directly into any of them. Surface Explore cars, Compare, Learn and My shortlist consistently on desktop and mobile. Keep existing permanent Model Y pair URLs and clearly identify their editorial scope. Make catalogue coverage visible without suggesting that the ten-family subset is the entire market.

Resolve the difference between local and deployed navigation as part of the implementation. Align the homepage's dated sales-coverage wording with the methodology. Retain substantiated evidence and qualifications; if a claim cannot be supported, narrow it rather than inventing support.

**Accept when:** A visitor can find each entrance without reading the long comparison; someone who knows their cars can reach the picker directly; Model Y-specific pages remain discoverable; the same navigation intent is available on narrow screens and by keyboard.

### B Optional EV suitability assessment

Build a short, skippable flow using charging access, usual driving, essential longer trips, budget basis, purchase timing and non-negotiable needs. Allow “not sure”. Ask further questions only when they change the next step. Retain answers during the current journey and offer explicit local saving.

Return an explanation of what appears workable, what is unresolved and what to check next. Without reliable personal cost, charging and trip evidence, do not present a definitive suitability score or guarantee. A user with no known charging access should receive an action plan to investigate charging, not an automatic vehicle recommendation. Make deferring, exploring alternatives and having no suitable catalogue result valid outcomes.

**Accept when:** A beginner can identify their blocking question and next action; a public-charging-dependent buyer is not assessed using an assumed home tariff or home charger; an unknown answer remains unresolved; an experienced user can bypass the entire flow.

### C Neutral selection and relevant comparison

Support any two or three valid catalogue variants without automatically inserting Model Y. Allow removal and replacement of the reference vehicle. Preserve a deliberate Model Y editorial path and the current permanent Model Y pair definitions.

Update the full selection chain: URL parsing, defaults, picker restrictions, comparison labels, catalogue tray, variant CTAs, static comparison, mobile active vehicle, copy/export and portable routing. Define empty, one-car, duplicate, invalid and three-car states explicitly. Do not silently add a default challenger when only one vehicle has been chosen.

Let a selected priority lead the general comparison or jump directly to a meaningful summary of that topic. Stable chapter identifiers and evidence links must still work. The Model Y editorial path may retain its editorial presentation if labelled clearly.

**Accept when:** Two non-Tesla variants compare on their own; a third arbitrary variant can be added and removed; valid old shared Model Y URLs retain the requested variants; invalid IDs receive a clear recovery state; refresh and Back/Forward preserve the intended selection; no hidden Tesla assumption breaks labels or mobile controls.

### D Requirements and honest matches

Extend discovery to accept multiple must-haves using the data actually available. Separate requirements from preferences. Support meaningful combinations such as budget, seats and supported equipment rather than only a single equipment option. Add useful sorting where the measurement basis supports it.

Separate confirmed matches from possible matches requiring confirmation. An unknown price or feature must not count as satisfying a hard constraint. Maintain the distinction between dated listed price, estimated driveaway context and a written quote. Requirements such as three-child-seat fit, accessibility or a seven-seat vehicle may need a physical check or an explicit catalogue-gap result; do not fabricate measurements.

**Accept when:** A hard budget produces clearly distinguished verified/possible results; multiple requirements persist as users inspect cars and return; excluded cars have understandable reasons; no-result states identify which requirement or catalogue boundary is responsible and provide a useful next step.

### E Decision record and purchase checks

Extend the existing shortlist into a local decision record containing selected variants, priorities, reasons to keep or reject a car, acceptable compromises, unresolved questions and test-drive notes. Generate an editable checklist from the user's needs and the selected variants' existing caveats. Include physical-fit, charging, quote, insurance/service and build-specific checks where relevant.

Reuse printing and sharing. Keep an ordinary comparison link distinct from an export that contains personal notes. Offer an explicit portable export/import for the decision record; validate imported data and render notes as text. An account system is unnecessary. Make the scope of AI copy clear: the current implementation copies only the reference and active rival even when three vehicles are selected.

Migrate legacy `ev-shortlist` arrays without data loss. Shared URL selection must take precedence over locally stored preferences. Handle unavailable storage, malformed imported data and removed catalogue IDs gracefully.

**Accept when:** A user saves a shortlist, reloads, recovers their decision context, prints or exports it, and can share the comparison without inadvertently including private notes. A returning household can record a test-drive result and revise its choice. Every finalist can have explicit unanswered questions and a next action.

### F Contextual explanations and evidence preservation

Add concise explanations needed by these flows, including BEV versus hybrid/PHEV, kW versus kWh, AC versus DC, claimed versus real-world range and charging routines. Ground new factual copy in suitable sources and preserve context when a user opens help. Existing glossary links must not redirect every visitor into an unrelated Model Y/Sealion 7 comparison.

Preserve claim-level dates, measurement bases, uncertainty states, source lineage and explicit holds. Unknown must remain different from unavailable. Separate editorial preference from a personalised result. Keep the original research snapshot immutable; any new factual evidence belongs in an appropriately sourced overlay.

**Accept when:** Users can read an explanation and return to the same cars/question; conditional features retain their conditions; all existing citation and source-integrity tests pass; a page update does not falsely refresh evidence dates.

## Working sequence

1. Run the available baseline checks and document pre-existing failures. Inspect actual route wiring and installed Next documentation. Choose a clean implementation branch/worktree if appropriate to the environment, preserving unrelated user changes.
2. Define the shared selection, needs and versioned local decision-record models. Specify old-link and old-shortlist compatibility before changing the UI.
3. Implement neutral comparison and persistence first, because every entrance depends on them. Add targeted regression tests for the behaviours that currently assume Model Y.
4. Implement entry navigation, suitability questions and discovery requirements using the shared state. Add contextual explanations without duplicating research values across UI components.
5. Complete the decision record, checklist, print/export and return journey. Verify information retained and deliberately omitted by each sharing method.
6. Exercise the full journeys in the three build forms, resolve accessibility and layout issues, update documentation and produce the final implementation report.

Work through the complete first release; a visual mockup or a new homepage alone does not satisfy the goal. Make routine implementation choices autonomously within this scope. If external evidence or a service is unavailable, implement a useful bounded fallback and name the limitation rather than inventing data.

## Important code paths

| Area | Files to inspect |
| --- | --- |
| Routed home and editorial path | `src/app/page.tsx`, `src/components/fleet-experience.tsx`, `src/components/model-y-verdict.tsx`, `src/lib/fleet.ts` |
| Shared navigation and styling | `src/app/layout.tsx`, `src/components/site-shell.tsx`, `src/app/globals.css` |
| Selection and comparison | `src/lib/compare.ts`, `src/lib/config.ts`, `src/lib/page-props.ts`, `src/components/picker.tsx`, `src/components/experience.tsx`, `src/components/static-comparison.tsx` |
| Discovery and detail CTAs | `src/components/explorer.tsx`, `src/components/detail.tsx`, `src/components/ui.tsx` |
| Topic order and evidence | `src/lib/chapters.ts`, `src/lib/data.ts`, `src/lib/launch-evidence.ts`, `src/components/footnotes.tsx` |
| Permanent pairs and exports | `src/lib/pair-pages.ts`, `src/lib/citable.ts`, `src/components/citable-report.tsx`, `src/components/selected-copy.tsx`, `src/app/compare/[pair]/` |
| Reference copy | `src/app/glossary/page.tsx`, `src/app/methodology/page.tsx`, `src/app/sources/page.tsx` |
| Portable and public outputs | `src/portable/entry.tsx`, `src/portable/navigation.ts`, `src/portable/link.tsx`, `scripts/build-portable.ts`, `scripts/build-public.mjs` |
| Tests | `tests/domain.test.ts`, `tests/citable.test.ts`, `tests/scenes.test.ts`, `tests/e2e/`, `playwright.config.ts` |

New routes need explicit portable navigation support; unknown portable paths currently fall back to existing content. Root `index.html`, `index-b.html` and `public/index.html` are generated outputs. Change shared sources and regenerate them; do not hand-edit their bundled code.

## Verification and definition of done

Use Node 24 if available; the repository requires Node 22 or newer and pins pnpm 11.19.0. Install from the lockfile with `pnpm install --frozen-lockfile` when needed. The archive excludes installed dependencies and build caches.

Run the repository checks appropriate to the completed changes:

```sh
pnpm validate
pnpm audit:content
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Run the application on an available local port and set `TEST_URL` accordingly. Playwright defaults to `http://127.0.0.1:3001`; the dev server does not necessarily use that port. Install required Playwright browsers if missing and run the relevant end-to-end tests, including the new complete journeys, across the configured Chromium, WebKit and Firefox projects where available. Record any unavailable environment separately from a test failure.

Verify the public build using `pnpm build:public` with an appropriate HTTPS `NEXT_PUBLIC_SITE_URL`, following the repository build instructions. This is a local build check, not publication. Verify the regenerated portable experience both offline and when served. Preserve existing canonical/indexing behaviour and machine-readable pair exports.

The release acceptance scenarios are:

- A beginner with uncertain charging receives specific checks and can resume with answers.
- A renter does not receive an unsupported “EV will work for you” conclusion.
- A user compares two non-Tesla cars without a third car being inserted.
- A family combines requirements and creates an appropriate physical-fit checklist.
- A budget user can distinguish a confirmed listed-price match from an unknown price and from a driveaway quote.
- A known-model shopper skips introductory steps and opens exact variants quickly.
- A returning user retains their notes and priorities; old local shortlists and shared URLs still work.
- A shared comparison excludes personal notes unless the user explicitly exports them.
- The no-results, unknown-data, storage-failure and malformed-import states remain useful and readable.
- Desktop and mobile users can complete the same tasks with labelled controls, keyboard access, sensible focus handling and reduced-motion support.
- Citation links, evidence dates, conditional claims, static exports and portable navigation remain correct.

Provide screenshots of the key desktop and mobile states, actual test/build results, changes to source-data handling if any, and known limitations. Do not report historical QA files as new results. Application tests were not rerun for preparation of this documentation-only handoff.

## Later work outside the first release

Keep these as an ordered backlog rather than blocking the initial goal:

1. Personal total-ownership-cost scenarios with current-car reference and transparent sensitivity ranges.
2. Richer charging and trip scenarios, starting with external planning handoffs before considering live integrations.
3. A structured finance/lease quote worksheet with freshly verified official rules; no inferred personal tax result.
4. A working correction contact and evidence-refresh ownership. Do not invent an inbox or deploy a non-functional form.
5. Additional family/accessibility measurements, used-EV inspection content, home-energy compatibility and commercial-use guidance.
6. Catalogue expansion driven by observed unmet needs and sufficient research coverage.

Accounts, behavioural analytics, live charger/dealer feeds, booking systems, tax advice, a checkout and production deployment are not necessary for this first implementation goal. Keep existing privacy commitments and avoid speculative feature, charging or savings claims.

## Expected final delivery from DOT

Return the implementation changes, a short summary of completed buyer journeys, evidence that Phase 1 acceptance criteria pass, and a list of any genuine blockers or deferred items. Explain remaining gaps in terms of user decisions. Include exact commands/results and the location of screenshots and updated documentation so another person can review and continue the work.
