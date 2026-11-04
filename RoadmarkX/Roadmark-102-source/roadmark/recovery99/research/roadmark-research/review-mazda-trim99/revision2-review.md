# Mazda99 revision2 static review

**GO for the three-test-file repair delta. No static blockers.** Original review and its frozen candidate remain unchanged. Review is bound to revision2 manifest `5a68f63bad07833c31a173689616c06bc3dd6dd4b2044c7768aaa70d0fe0d46b`; exact file hashes and predecessors are in `revision2-review-pins.json`.

- Avatar test retains the original bespoke34 and generic309 historical assertions. Only the historical generic count is routed through the strict99 predecessor. The existing per-car projection loop still covers every live record, and an added assertion reconciles live bespoke plus generic counts
- City84 keeps every original ranking digest, all seven ranking groups, date policy, exclusion filtering and City assertions. Only that historical block's cars/sources change to strict99 predecessors; no digest is repinned and no production ranking policy changes
- New coverage proves exactly two generic Mazda additions, unchanged original generic records, full live projection, both Mazda IDs in all seven live exclusion arrays, unchanged remaining ranking results and all original City84 pre-addition digests
- Both repairs use the already reviewed whole-input predecessor checks. They do not broadly suppress unknown IDs or accept already-old inputs

All three replacement hashes match. Their declared before hashes match the initial approved candidate or unchanged app test, and City84's checkpoint98 predecessor hash agrees with the original manifest. No data, runtime source, historical fixture, numeric/hash pin, UI or generated artifact changes are proposed.

The cumulative set should be 22 files with five new paths: original20 plus the avatar replacement and new history-coverage test; the City84 replacement supersedes one original entry. Root's cumulative manifest still requires exact-set/hash reconciliation when supplied. Root owns the currently running QA process and must wait for its terminal outcome before applying the repair. No project or candidate code was executed during this review.
