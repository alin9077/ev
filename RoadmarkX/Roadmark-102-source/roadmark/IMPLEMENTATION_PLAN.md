# Implementation plan

1. Preserve the supplied research and inspect its fields, references and publication issues. Reconstruct missing companion documentation from actual input, clearly marking it as implementation documentation.
2. Build a Next.js App Router application with typed domain adapters, pure comparison helpers, publication safeguards and a local media approval gate.
3. Deliver selection → comparison → evidence, responsive three-car preservation, URL state, discovery and detail routes.
4. Add the four Model Ys, six editorial chapters, software eligibility/timelines, methodology, sources, print and SEO controls.
5. Run data integrity, unit, type, lint, production, accessibility and browser checks; inspect mobile and desktop screenshots and document remaining limitations.

# Decisions log

- The folder contains research JSON, workbook, PDF, master prompt and media audit; no application or package manager exists. Use Next.js, React, TypeScript and plain CSS tokens. The provided pnpm runtime was selected when npm proved unavailable.
- Work in this folder; preserve originals. No public deployment is authorised.
- Visual direction: an independent motoring publication, warm white and ink with cobalt accents, generous typography, schematic seating/range diagrams and equal typographic vehicle treatment.
- The supplied schema, data dictionary, acceptance checklist, reference registry and media manifests named by the prompt are absent. Reconstruct implementation companions without representing them as original research attachments.
- No manufacturer photography is licensed. Use original functional SVG diagrams and typography; no image-generation brief was supplied, so do not fabricate exact vehicle imagery.
- Preserve the dated research snapshot, all source IDs and uncertain states. Only selected vehicle evidence is serialized by the server-rendered route. Do not import the full corpus into client components.
- The Sites workflow is used for design/QA guidance. Explicit Next.js and local-only requirements take precedence over its default starter and publishing workflow.
- Current official Next.js installation documentation and Apple AU comparison/product references were inspected on 6 October 2026. Dependency versions will be pinned after registry inspection.


## Completion

Implemented every principal route, a curated pair route, all 34 detail records, the selection-to-evidence journey, responsive third-car preservation, source registry, software history, original diagrams, print and publication gates. See `qa/TEST_RESULTS.md` for final results and precise remaining verification limits. The production preview runs locally; nothing was published.

Software headlines use current eligibility records. The homepage leads with dated changes, while minimum counts remain qualified supporting text. Catalogue payloads contain only identity and three filter facts; detailed evidence is supplied only for selected variants.

The Next.js development server generated its default AGENTS.md/CLAUDE.md files; those were retained. Browser QA led to repairs for WebKit focus return, narrow navigation wrapping, structured research values, null event details and desktop column alignment.

## Completed refinement pass

Mapped screenshot talking points across all 48 criteria, prioritised six buyer chapters, shortened headings, reduced the comparison overview to essentials, and added an accessible detail carousel. Replaced evidence buttons with grouped numbered footnotes. Added a dated nine-source research overlay and a reproducible standalone offline `index.html`. Production and browser verification results are in `qa/TEST_RESULTS.md`.
