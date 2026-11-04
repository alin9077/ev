# Checkpoint97 revision2: test-only children argument fix

## Change

Only `tests/buyer-display-copy-render.test.ts` changes. The two explicit `children:` props are replaced by one `render(node, sources = data.sources)` helper that always passes `node` as the third argument to `createElement`.

`WithEvidence` declares `children` as a required prop, while React's `createElement` declaration does not infer required props from positional children. The helper therefore contains one local `Parameters<typeof WithEvidence>[0]` assertion for `{ sources }`, immediately followed by `createElement(WithEvidence, props, node)`. The test helper itself requires `node`; no application type, component, lint rule, assertion, source selection or test count is changed. There is no `any`, suppression comment or rule disable.

The synthetic-clock test calls the same helper with its augmented `sources` array, so its citation context is preserved exactly. All other renders use the same `data.sources` array as before.

## Files

- `after/tests/buyer-display-copy-render.test.ts`: complete replacement test
- `before/tests/buyer-display-copy-render.test.ts`: exact current applied97 test
- `correction.patch`: minimal applied97→revision2 patch
- `MANIFEST.json`: exact correction hashes and retained failed-attempt description
- `CUMULATIVE-MANIFEST.json`: all12 checkpoint97 paths, with only this test's after hash/path/length updated; paths remain relative to the parent candidate directory
- `cumulative.patch`: complete checkpoint96→97 revision2 patch

The original checkpoint97 candidate, manifests, patch and failed QA attempt are untouched. All four runtime files, the seven buyer-copy replacements, every97/96 source-history pin and all data remain unchanged. The21 new tests and all test assertions are retained.

## QA status

Root reported attempt1 (execution session16824) exited1 after887 non-HTTP tests, one HTTP test and typecheck passed. Lint failed `react/no-children-prop` at the two explicit-child call sites. Later validation and builds were not reached. This revision does not overwrite or claim success for that attempt.

This worker performed static editing/reading/hashing only. No source import, syntax check, test, lint, typecheck, build, browser action, application write or network mutation was performed. Root should run the focused render tests, typecheck and lint, then repeat full QA and both builds against the revised exact application state.
