# Buyer-copy97 revision2: independent static review

## Verdict

**No static blocker. Approve this exact one-file correction for root-owned execution.** This review imported or executed no application/test code and made no application, Git, browser or network mutation.

The prior full-QA attempt remains failed: the root observation records execution16824 exit1 after887 non-HTTP tests, one HTTP test and typecheck passed. Lint rejected two explicit children props; later validation/build stages were not reached. This correction is not a claim that the revised QA has passed.

## Verified scope

Only `tests/buyer-display-copy-render.test.ts` changes:

- Before SHA-256: `1b59462adae6a9afd0c6301e27703d5cea25a7954ad745f89b30efcb0d4b1035`, 9,382 bytes
- After SHA-256: `91dec0eda2b540660df105829858b58112a127658cd388b2ce49b836c7a4ca09`, 9,557 bytes
- Correction patch SHA-256: `c1f6ad3a6a1cb9d85e96a4eae84b055ce9155e49ac967bfd4952fda759bdf448`
- Revision manifest SHA-256: `868e8374cb085d3a8dfdccabc62bc091a1302f0f2d1b58e39bbc1c5210b18187`
- Cumulative manifest SHA-256: `3023a55cfc62ff2a65ed229bbbfe5006400770258216825cd3c005356cac4584`
- Cumulative patch SHA-256: `41ffb19cbd27943daf9413eb5af7fda8e8b558009ec34ebe16dedcd65b536d61`

The candidate before file matches the applied97 test and original candidate exactly. Independent patch reconstruction matches both the one-file correction and the cumulative96→97 revision2 patch. Among the twelve cumulative manifest file descriptors, only this test's after hash, candidate path and byte length change.

All 1,668 files in the applied97 expected-input map still match at this pre-correction snapshot. All 117 data files, all protected files, all four runtime candidate files, all history-adapter bytes/pins and the exact independent copy fixture remain unchanged. The21 new tests and seven render tests are retained. Every test declaration and assertion line is identical, and complete diff inspection confirms no assertion body or test data changed.

## Type and runtime-semantics review

The helper now takes a required `node: ReactNode` and `sources: Source[] = data.sources`. It immediately creates the WithEvidence element using `createElement(WithEvidence, props, node)`.

The localized `{ sources } as Parameters<typeof WithEvidence>[0]` assertion bridges the actual installed React declaration: its `props` parameter requires the full component props type, while positional `...children: ReactNode[]` does not fulfill that required property in inference. The unchanged WithEvidence declaration requires only `children` and permits `sources?: Source[]`; the helper supplies the missing child positionally in the same expression. No broader application type changes, `any`, suppression comments or lint-rule changes are introduced.

Installed `@types/react/index.d.ts` lines480–494 confirm that function-component overload. Installed `react/cjs/react.development.js` lines1103–1104 copy a single positional child into the element props. Thus the resulting source context and child value match the original explicit-children construction, including a ReactNode array or null. This is static reasoning against the installed implementation, not a runtime test.

Ordinary renders use the same `data.sources` array. The synthetic-clock test still passes its augmented source array both to Discovery and to WithEvidence via the new helper. Its valid-summary control, incomplete-evidence assertion and hidden-clock-claim assertions are all unchanged. The unused original direct WithEvidence call is eliminated rather than leaving duplicate setup paths.

## Remaining gate

Root should rerun the revised render tests, typecheck and lint, then repeat full QA, validation, both builds and the existing app/portable browser plan. Preserve the failed first attempt and identify every later result by its revised input map. No runtime/history pin update is warranted for this test-only correction.

Independent comparison details: `revision-2-static-consistency.json`.
