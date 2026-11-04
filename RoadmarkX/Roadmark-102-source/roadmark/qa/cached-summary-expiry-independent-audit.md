# Cached buyer-summary expiry audit

Result: all three reproduced gaps were fixed by the parent and independently rechecked. No remaining actionable blocker was found within the requested scope.

- 10 tiny pure-library/component-SSR regression checks pass
- Tests cover related and model-year dependencies, earliest deadline, inclusive boundary, independent clause expiry, malformed fields, source guards, actual static HTML, and Sydney calendar boundaries
- Existing aggregate proposal has no fact-kind model-year guard and no clause consuming an explicitly timed expected fact, so the compiler cases are defensive coverage
- No app-data import, full build, app edit, or frozen-proof edit was performed

Run from the Roadmark checkout:

```sh
node --import tsx --test /tmp/roadmark-cached-summary-audit/regression.mjs
```

See report.json for findings, evidence, and audit boundaries. These fixtures use synthetic cars and sources and import only pure libraries and the two directly audited components.


Root integration: the ten independent fixtures are preserved in tests/fixtures/cached-summary-ssr.mjs and loaded by tests/cached-summary-ssr.test.ts under the standard test command. The root reran all ten successfully; an additional compact-citation preservation test covers the presentation change. Original independent report paths describe the audit-time temporary workspace, not runtime requirements.
