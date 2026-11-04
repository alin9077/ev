# Mazda99 cumulative revision2 reconciliation

**GO for the cumulative repair manifest. No static blockers.** This approval composes the original Mazda99 GO with the separately reviewed three-test-file revision2 repair. It does not certify running or future QA results.

Verified exact supplied hashes:

- Cumulative candidate: `c3ec1f62102a55a4721641fca61c56547a5193b011e659938ea7fbff87006c8c`
- Expected inputs: `8914e219a8fde52dcce4bab12ebae5b3541893e5cabdd1edc8ab3a143091cb76`
- Normalized QA candidate: `7932ada0ed98a4ee5f63ae01f7758ee713642e8eda6fc8751a3a9a6c604f5450`

Independent reconstruction confirms exactly 22 cumulative paths: 17 replacements and five new files. The initial20 are preserved except the reviewed City84 after-image; the avatar replacement and history-coverage test add two paths. Every before hash is the original checkpoint98 hash, including City84. Every final after hash and byte count matches its reviewed candidate source file.

The entire expected-input map equals the frozen checkpoint98 map with only these22 reviewed entries applied: 1,670 old inputs become1,675, with1,653 old paths unchanged. Relative to the initial99 map, only the three revision2 paths change. The QA projection matches all22 cumulative rows exactly and references the verified cumulative manifest. Original194 runtime/visual/generator pins and all evidence/count declarations are unchanged. Original candidate, initial expected-input map and initial QA projection hashes remain intact.

Exact paths, hashes and reconciliation results are retained in `cumulative-revision2-review-pins.json`. Original and revision2 reviews remain separate. Root may apply this repair after the running attempt reaches its actual terminal state, then rerun the required checks against these cumulative inputs. No application mutation or project/candidate execution was performed by this reviewer.
