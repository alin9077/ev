# Architecture and decisions

- Next.js 16.3.8 App Router / React 19.3.0 / TypeScript 5.9.3, pinned by pnpm lockfile. Node 24 used locally; Next requires Node >=20.9. pnpm 11.19.0 is the provided runtime package manager. This supersedes the initial npm choice, because npm was unavailable.
- Plain CSS design tokens, native inputs and dialogs, system fonts. No CMS, accounts, database, analytics, vehicle integrations or external runtime services.
- App routes: discovery homepage, comparison, four-variant Model Y range, shortlist, 34 variant details, software, methodology, sources and one curated pair page.
- Server adapter preserves raw research and prepares view models. Only selected feature records are serialized into comparison pages. Discovery needs the lightweight catalogue, not all 1,632 evidence rows.
- URL is authoritative for comparison IDs, active challenger, section, category, search, priority and differences. Next navigation restores Back/Forward. Invalid IDs are omitted with a visible explanation. Same exact variant cannot be selected twice; two different Model Ys are supported.
- Discovery shortlist storage is explicitly local and opt-in. It is loaded only by a user action and cannot override a shared URL.
- Native dialog provides focus containment and Escape. Evidence restores focus to its trigger. Table header associations remain present in the two-column mobile layout.
- Restricted media cannot be rendered through the approval resolver. Current UI uses original functional graphics only. CSP prevents remote images/frames and behavioural trackers. No iframe, remote font or pixel loads.
- Comparison query pages are noindex. The curated pair has a canonical only when unmodified. No prices, review ratings or speculative product schema enter metadata. Site origin and indexing require an owner-provided production URL.
- Parameter views are excluded from the sitemap. `NEXT_PUBLIC_SITE_URL` configures the canonical origin. Before hosting, verify robots/canonical rules with the chosen domain.
- Print retains all selected vehicles, research date, qualification text and selected source references. Browser print is the export mechanism.

## Important limits

The dated automotive research is not independently reverified. Generic prose in some original field qualifications is preserved; no invented road test or precise charging curve is produced. Approximate software minimums are not reliability rankings. Default CSP permits Next inline hydration scripts; a future nonce-based policy requires dynamic nonce propagation and testing at deployment.

## Portable entry and refinement overlay

The Next app remains the primary server-rendered experience. `scripts/build-portable.ts` bundles shared React components into the root `index.html` and `public/index.html`, with inline CSS and embedded data. The portable navigation adapter uses the `page` query parameter so file URLs need no server routing. It uses neither a service worker nor external runtime/CDN assets. Root and served files are generated together by the build; do not hand-edit them.

`src/lib/chapters.ts` is the editorial chapter/criterion map. All 18 specification fields and 48 feature criteria render inline on the homepage and comparison overview. Chapter anchors and hero fact buttons move to the relevant on-page detail; the former modal carousel has been removed. Desktop tables keep vehicle identity visible; narrow screens stack labelled vehicle cells. Footnote providers group each claim's source IDs into one numbered marker and restore focus to the originating reference.

`data/research-refinement-2026-10-06.json` is an additive display overlay. The original snapshot stays immutable; only explicitly checked fields gain fresh-source status. Price, safety and unreviewed equipment do not inherit verification from a numeric specification check.

`data/research-usability-2026-10-06.json` adds a later, higher-precedence feature overlay. Optional condition labels, practical notes and explicit outstanding questions are rendered by the shared `FeatureValue` component on every feature surface. Search and difference detection include these fields. Structured warranty objects are converted to readable values with their original component scope and source lineage. Validation covers source references in both the raw snapshot and displayed feature overlays.


## Ten-family swipe comparison

The homepage now uses `FleetExperience` and `SwipeProvider`. The server and portable app both pass all variant packs so trim changes work immediately and offline. `fleetSelection` chooses the lowest listed current trim per alternative family, unless the URL names a valid selection. Model Y is the separate baseline; no popularity or sales rank is inferred. All 34 variants, including qualified outgoing/provisional records, remain selectable within their families.

Native horizontal scroll-snap tracks render nine open alternative columns beside each baseline card. One shared index synchronizes the hero, all 91 detail rows and software history. Mouse dragging, touch swiping, arrow/Home/End keys, previous/next buttons and a model dropdown control the same position. Resize observers only realign tracks when widths change. Offscreen columns are inert until they enter the visible range. Tesla cards have a separate colour, border and explicit baseline label, so colour alone is not needed to identify them. Alternative columns have transparent backgrounds and only a left stroke; the retained `swipe-card` class is a layout hook, not an enclosed visual card.

URL parameters `baseline`, `fleet`, `focus` and `priority` preserve the full ten-family view on refresh. Swipes replace the current URL without adding dozens of Back entries. Focused two/three-car comparison routes remain available through “Compare these cars”. The header's All EVs link returns to the fleet homepage.

The wayfinding design uses stable A–G chapter letters, colours and original `ComparisonSymbol` SVGs, even when priorities change the reading order after the fixed price and automated-driving chapters. These are decorative companions to the text labels. Responsive anchor offsets keep chapter headings below the toolbar; short viewports make the toolbar static. Motion respects the user's reduced-motion setting. No external fonts, images or new research records were introduced by the visual redesign.

Conditional features show “Why conditional” beside the value, using the existing sourced requirements and translating inherited family/trim qualifications into plain language. Conditional facts explain their quotation or measurement limitation. This presentation pass does not freshly reverify vehicle specifications or change the immutable dataset.


The first price row contains the vehicle selectors and complete `price_aud` facts. Advanced assistance is a normal comparison row in chapter 02. `orderChapters` fixes price first and automated driving second; priority choices reorder the remaining five subjects. Model Y Premium RWD is the global default, while valid shared-link selections still take precedence. Original chapter artwork and pictograms follow their subjects after the A/B reorder; asset filenames retain their original names. Software history is attached by category rather than a hard-coded chapter number. All 48 criteria and 18 specifications still appear exactly once in the fleet.
