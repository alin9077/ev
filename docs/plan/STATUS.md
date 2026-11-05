# Execution plan status ledger

Update this file whenever a workstream starts, pauses or finishes. Newest entry at the top of each workstream. Paste real command output, not summaries. Plan: `docs/plan/EXECUTION_PLAN_2026-11-04.md`.

## Owner decisions

| ID | Decision | Default if no answer | Answer | Date |
|---|---|---|---|---|
| D0.1 | Archive destination | Separate private repo with Git LFS | | |
| D0.2 | Rewrite git history to purge 1.2 GB | No; shallow clones instead | | |
| D1.1 | Beta shows all 56 brands with grade styling | Yes, with coverage footer | | |
| D1.2 | Replace live site after phone test | Owner decides after test | | |
| D7.1 | Correction contact address | Link hidden until supplied | | |

## Workstreams

| WS | State | Branch | Last commit | Worker | Updated |
|---|---|---|---|---|---|
| WS0 Consolidate Roadmark | not started | | | | |
| WS1 Public beta (M2) | not started | | | | |
| WS2 Refresh loop + changes page | not started | | | | |
| WS3 Answer pages + any-pair | not started | | | | |
| WS4 Money thresholds | not started | | | | |
| WS5 Needs discovery + checklist | not started | | | | |
| WS6 Step-up view | not started | | | | |
| WS7 Live-site hygiene | in progress (W7.4 blocked: needs owner to run; PR awaiting review) | claude/ws7-live-site-hygiene-02d94a | | Claude Sonnet 5.5 worker | 2026-11-05 |

States: not started / in progress / paused (reason) / blocked (on what) / done (acceptance pasted below).

## Baseline measured 4 November 2026 (planning session)

Environment: cloud container, 16 GB RAM, 4 cores, Node 22.23.4, pnpm 11.19.0.

Live site (repository root at commit f0052a4):

- `pnpm validate`: pass. 34 variants / 10 families / 11 generations / 69 criteria / 2,346 evidence rows / 424 source references.
- `pnpm typecheck`: pass.
- `pnpm test`: 39 pass, 1 fail. Failure: `tests/citable.test.ts:73` expects 10 unavailable sources; `data/source-audit-2026-10-08.json` has 9 (checked 16, unavailable 9, corrected 5, unsupported 2). Fix is WS7.1.
- `pnpm test:e2e`: not run.

Roadmark Ford32 source (extracted from `RoadmarkX/Roadmark-recovery-source-FORD-WORKING-20261016T0145.tar.xz`):

- `pnpm install --frozen-lockfile`: pass.
- `node --max-old-space-size=6144 node_modules/typescript/bin/tsc --noEmit`: **exit 0 in 21 s**, zero errors. The SIGKILLs recorded in the handover were environment memory limits, not code errors.
- `pnpm test` (full suite, `--test-concurrency=2`, 6 GB heap): **680 tests passed, 0 failed, then the run was cut off by a 1,700-second (28-minute) wall-clock limit set by the planning session**, exit 124. Not a complete pass: 155 test files exist and the run was still progressing. No SIGKILL, no memory failure. WS0.5 must rerun without a time limit (budget at least 45 minutes on 4 cores) and record the terminal `# tests / # pass / # fail` lines.
- Lexus33 delta (`Lexus-working-recovery-delta-v1.zip`): **not present in this repository**. Must be found or Lexus re-researched (WS0.2).

Repository hygiene:

- `.git` is 1.2 GB; `RoadmarkX/` holds 3,132 tracked files (1.9 GB); two handoff zips (25 MB) tracked at the root.

## Entries

(Workers append below. Format: `### YYYY-MM-DD WS<N> — <state>` then the check output, gaps, decisions, failures.)

### 2026-11-05 WS7 — in progress

Branch `claude/ws7-live-site-hygiene-02d94a` (note: plan rule 8 names branches `ws<N>-<slug>`; the session harness assigned this name). W7.4 is blocked: needs owner to run (requires the owner's own ChatGPT, Perplexity and Google accounts). D7.1 unanswered, so the plan default applies: correction link hidden.

#### WS7 results, 2026-11-05

Environment: macOS (Darwin 27.0.0), 48 GB RAM, 16 CPU cores, Node v24.22.0 (plan baseline used Node 22.23.4; `engines` is `>=22`), pnpm 11.19.0. `NODE_OPTIONS=--max-old-space-size=6144` for typecheck and test. First `pnpm validate` needed `CI=true pnpm install --frozen-lockfile` in this worktree (pnpm refused to rebuild `node_modules` without a TTY); no lockfile change.

Rule 5 checks (run on this branch after W7.5):

- `pnpm validate`: exit 0. 34 variants / 10 families / 11 generations / 69 criteria / 2,346 evidence rows.
- `pnpm typecheck`: exit 0, no errors.
- `pnpm lint`: exit 0, no warnings printed.
- `pnpm test` (full suite, `tests/*.test.ts`): `tests 43 / pass 43 / fail 0 / cancelled 0 / skipped 0` (baseline was 39 pass, 1 fail; +3 new correction-contact tests, citable test fixed).
- `pnpm build`: exit 0 (validate, next build, portable build; portable B page 4.53 MB). It regenerated `index.html`, `index-b.html`, `public/index.html`, `public/index-b.html`; committed because the dated footnote is in them.
- `pnpm test:e2e` (chromium + webkit + firefox, against `next start` on :3001, no `NEXT_PUBLIC_*` env): **40 passed, 2 skipped, 51 failed (10.4 min). Not a clean pass.**
  - Both new e2e tests (correction mailto absent everywhere when unset; footnote text) pass on chromium and webkit.
  - Firefox: all 31 failures are `browserType.launch: Failed to launch the browser process` (the Firefox build in this environment will not start), including the 2 new tests. Not run in Firefox.
  - Chromium: 7 failures. I ran the same chromium project on a clean checkout of `ccb31c0` (before any WS7 change): **the same 7 tests fail there (7 failed, 22 passed)**, so they are pre-existing and not caused by WS7. They are: `citable.spec` "all nine comparisons" (expects indexable robots; needs a public `NEXT_PUBLIC_SITE_URL` build), `citable.spec` "glossary anchors and discovery files" (robots `Allow: /`, same cause), `journeys.spec` "first phone viewport" and both `portable.spec` tests (assert an h1 containing "Tesla Model Y vs."; page now says "Tesla Model Y is the EV car of the year. Here's why."), `journeys.spec` "all chapter details" (axe colour-contrast violation in the chapter-03 driving scene), `fleet.spec` "chapter row in the sticky bar" (gap 171.7 px, expected < 80).
  - WebKit: 13 failures (the same 7 plus `fleet.spec` x2 and four `scene-loading` "load ahead" timeouts at ~45 s). I did **not** baseline WebKit, so I cannot say they are pre-existing; none involves /sources, the pair pages or the footnote.
  - Not fixed: out of WS7 scope, and I did not weaken any test.
- Set-case check on a real build: `NEXT_PUBLIC_CORRECTION_EMAIL=corrections@example.com next build` then `next start`: `/sources`, `/compare/model-y-vs-sealion-7` and `/compare/model-y-vs-atto-3` each contained exactly one `mailto:corrections@example.com`. The default (unset) build contains none (e2e above). The built `.next` from that check is untracked and not committed.

Gaps named (WS7 has no plan-specified gap list; these are the ones found):

- 9 `unavailable` sources: 8 now readable, 1 still blocked (see `docs/CORRECTION_LOG.md`, 5 November 2026). The audit file and the `unavailable` list pinned in `tests/citable.test.ts` were deliberately **not** changed; deciding whether to promote recovered rows is a data change for review.
- Per source: `b7_ato_lct` recovered (2026-27 LCT $91,661 / $80,809); `b7_geely_launch` recovered but does not support the "serviced within dealer network" condition; `b7_tesla_mobile` not recovered (Cloudflare 403; only an old third-party Internet Archive capture, not bypassed); `b7_byd_network` recovered (no warehouse mention); `b7_kia_isla` recovered (names Sorento/EV9, not EV3/EV5); `b7_kia_adas` recovered; `b7_geely_driven` recovered; `b7_gridly_chem` recovered, page revised 2 Nov 2026; `b7_gridly_cable` recovered, page revised 27 Oct 2026, and it dates Tesla's cable removal 2024 against the site's July 2022.
- `docs/CORRECTION_LOG.md` (8 Oct entry) says 10 sources stayed inaccessible; the audit file lists 9. Noted, not edited.
- Branch name is `claude/ws7-live-site-hygiene-02d94a`, not `ws7-<slug>` (rule 8), because the session harness assigned it.

Decisions awaiting the owner: D7.1 correction address (unanswered; link stays hidden; set `NEXT_PUBLIC_CORRECTION_EMAIL` at build time to show it). Whether to promote recovered sources out of `unavailable`. Whether the pre-existing e2e failures should be a separate workstream.

WS7 acceptance list:

| Item | Result | Evidence |
|---|---|---|
| W7.1 Assert list of unavailable IDs from the audit data, not a bare count | pass | commit "W7.1"; `tests/citable.test.ts` deep-equals the sorted 9 IDs; full `pnpm test` 43/43 |
| W7.2 Retrieve or replace the 9 sources; record each with URL and access date | pass (8 recovered, 1 not) | `docs/CORRECTION_LOG.md`, 5 November 2026 table; `b7_tesla_mobile` blocked by bot challenge, reason recorded; no URL or figure invented |
| W7.3 `NEXT_PUBLIC_CORRECTION_EMAIL` mailto on `/sources` and every pair page, hidden when unset; behavioural tests for set and unset | pass | `tests/correction-contact.test.ts` (3 pass: unset/empty hidden, set renders mailto, malformed/multi-recipient hidden); e2e unset case passes on chromium+webkit; set case verified by curl on a built site (3 pages); Firefox not run |
| W7.4 Run 20 AI-citation questions in ChatGPT, Perplexity, Google | blocked: needs owner to run | requires the owner's own accounts; `qa/ai-citation-checks.csv` untouched |
| W7.5 Dated note on homepage sales footnote; no price changed | pass | "Prices are as at 6 October 2026; a refresh is scheduled." in `src/components/fleet-experience.tsx`; e2e `price-date-note` passes on chromium+webkit; diff touches no price data |
| Rule 5 checks | partial | validate, typecheck, lint, test, build pass; e2e not clean: 51 failures, Chromium's 7 identical on the pre-WS7 baseline, Firefox cannot launch, WebKit not baselined |

## Ambiguities found

(A worker who hits a case the definitions in section 1 of the plan do not cover writes it here, with the stricter reading they chose.)
