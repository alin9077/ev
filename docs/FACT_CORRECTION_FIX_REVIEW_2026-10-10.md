# Fact-correction trust fix review

Reviewed 2026-10-10 in `roadmark-work/roadmark`. Read-only application review; the reviewer changed no application, approval-register or source-data files. Isolated fixtures used process-local register arrays with restoration. Main fixed findings while this review was running.

## Final result

**No remaining substantive blocker found in the reviewed fix.** Three issues found during review are now resolved and independently rechecked:

1. **Audit notes counted as conditions** — `src/lib/corrections.ts:243–251`. A first value correction appended `Correction one: Typo correction`; a second snapshot-bearing correction could select conditional/optional using that note as its only qualification. The substantive-condition guard now excludes generated `Correction ` notes, including IDs beginning with a colon. Regression tests pass.
2. **Published towing snapshots did not match approval input** — `src/lib/data.ts:421–441`. Towing normalization originally ran after approvals. A full snapshot copied from the published Model Y RWD fact conflicted solely because its comparison basis was `Maximum braked towing` rather than the internal `Manufacturer figure`. There are 71 currently normalized towing facts. Normalization now runs after research refresh and before approvals. An isolated approval copied directly from `catalogue()` succeeds, and a deliberately different approved comparison basis remains unchanged afterward.
3. **History invented legacy null-withdrawal status** — `src/components/correction-history.tsx:28–29`, `src/lib/corrections.ts:353+`. History previously showed `not_verified` for a legacy unavailable/not-applicable null withdrawal although application preserves those statuses. The helper now labels unrecorded legacy status explicitly. Neutral null-value wording also avoids `Not verified (unavailable)`. Rendered fixtures now show `No recorded value (unavailable)` when known and `No recorded value (withdrawn value; resulting claim status not recorded)` otherwise.

## Safeguards checked

- Ordinary non-null edits preserve semantic status, conditions and expiry; null withdrawals remain conservative. Unknown-to-known edits and standard promotions require explicit reviewed semantics; promotions also require explicit qualification/explanation handling
- Full snapshots compare effective metadata canonically, retaining array order and ignoring object-key order/undefined optional fields. Restriction, expiry and issue-resolution edits require snapshots
- Replacement sources reject missing/duplicate IDs, unsafe credential-bearing URLs, invalid/future access dates, holds, conflicts and access limitations
- Chains require the latest actual approved predecessor for snapshot-bearing successors, chronological review dates and matching intermediate output; supplied false references fail closed
- Structured replacement values are recursively checked and cloned; issue resolution is limited to named issues on the target claim
- Explanation-only conditions survive issue drafts and citable exports; actual correction-to-ranking integration keeps conditional claims excluded
- Buyer-summary guards remain unchanged; there is no automatic rebinding of previously reviewed copy

The intentional compatibility limit remains documented: historical value-only entries do not provide complete metadata-drift protection. Source usability checks do not establish that a source proves the exact claim; editorial review still must do that.

## Verification

Final command:

```text
node --import tsx --test --test-concurrency=2 tests/corrections.test.ts tests/citable.test.ts tests/research-refresh.test.ts tests/feature-corrections.test.ts tests/availability-corrections.test.ts tests/discovery.test.ts
59 passed, 0 failed
```

Additional independent checks:

- All 83 `data/` files are byte-identical to `roadmark-recovery/roadmark-checkpoint-2026-10-10(1).zip`
- Bundled checkpoint `data.ts`/`corrections.ts` and current equivalents against the same dependencies/data; the complete resulting 250-car catalogues are deeply identical with empty registers
- Empty `applyCorrections` output is deeply identical for all 250 current fact maps
- All three production approval registers remain `[]`; each SHA-256 is `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570`
- React static-render checks covered legacy unknown history and known unavailable/null history

This review did not independently run full build, lint, typecheck, validation or browser QA. Main owns those final gates. The checkout has no Git metadata, so checkpoint bytes and runtime comparisons were used instead of a Git diff.
