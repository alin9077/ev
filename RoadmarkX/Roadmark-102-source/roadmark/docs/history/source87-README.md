# Roadmark

## Current tracked status — source87, 11 October 2026

ENGINEERING CHECKPOINT 87. Invocation-local catalogue reuse changes only pairLinks and the llms handler. The default pairLinks invocation evaluates the full catalogue once instead of nine times; one llms handler invocation evaluates it once instead of ten times and passes the same validated array to pairLinks. There is no persistent cache or validation-guard bypass. These are deterministic evaluation-count reductions, not a measured speedup or a crash fix; force-static transport semantics are unchanged. All 670 Node tests (669 non-HTTP plus one local HTTP), types, lint, validation, the 389-page build and emitted-artifact proof passed. Six new compiled old/current regressions use two exact source86 TypeScript text fixtures. All source86 data and historical tests are preserved. The entire portable HTML, its JavaScript and payload, all seven ranking groups, and 20 static transport bodies (llms, sitemap and 18 comparison Markdown/JSON bodies) are byte-identical to source86. Original Model Y hero, all nine selling points and 18 protected visual inputs are unchanged. No market, design, hero, animation or admission change is made. Counts remain 343 details, 149 families, 153 generations, 330 summaries, 2,196 sources, 240 market records and 393 named entries. Scoped browser evidence is recorded separately for the exact artifact hash. Sustained Roadmark browser stability remains unresolved; prior native error 9 results remain evidence. Live WebGL, real phones, complete journeys, full market closure and production release remain unapproved.

- Full evidence: qa/checkpoint87-checkpoint87-portable-proof.json and qa/checkpoint87-browser-observations.json
- Confirmed before packaging: source86 / preview37 / index73. Source87 / preview38 / index74 receipts are pending

## Run and restore

See START-HERE-ROADMARK.txt and package.json. Match pairId in source and preview manifests. The previous README is preserved at docs/history/source86-README.md.
