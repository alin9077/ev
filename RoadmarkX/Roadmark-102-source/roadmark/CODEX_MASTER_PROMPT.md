# CODEX MASTER PROMPT — Model Y versus Australia's leading EVs

## Mission and operating instructions

Act as the product designer, frontend architect, accessibility engineer, data engineer and QA lead. Plan and implement an exceptional, production-oriented, mobile-first independent Australian EV comparison website. The central journey is comparing a chosen Tesla Model Y variant with the ten-model-family shortlist in the supplied research. Product storytelling should feel as considered as Apple's product pages; comparison should be quick, precise, transparent and genuinely usable on a phone.

Work inside the existing repository. Inspect its instructions, framework, package manager, files and available tools first. Preserve a healthy existing stack. On an empty project, use the current supported Next.js App Router, TypeScript and React with the existing package manager; use CSS variables/Tailwind and accessible UI primitives as appropriate. Verify the current official documentation and compatible package versions before introducing dependencies. Prefer the smallest maintainable solution. Do not add a CMS, database, accounts, API keys, vehicle integrations or external services merely to make the project look advanced.

First write a short implementation plan and decisions log, then execute it without waiting for approval on reversible design choices. Do not stop at wireframes or a static landing page. Complete the working comparison journey and run available tests. Do not make purchases, contact manufacturers, register domains, send email, configure recurring jobs or deploy publicly without explicit authorisation. Missing photographic rights must not block implementation: use the designed original-visual fallback described below. Report missing capabilities honestly; never claim a test, permission, asset download or deployment occurred when it did not.

Use these accompanying files:
- `data/au_ev_all_variants_2026-10-06.json` — immutable dated research input, not a guarantee that every value is current or independently verified.
- `data/research-schema.json` and `data/RESEARCH_DATA_DICTIONARY.md`.
- `docs/TESLA_MEDIA_AUDIT.md`, `media/tesla-media-candidates.json`, and `docs/ORIGINAL_ASSET_BRIEF.md`.
- `qa/ACCEPTANCE_TESTS.md` and `docs/REFERENCE_SOURCES.json`.

If attachments are mounted elsewhere, locate them by filename. Do not assume the ChatGPT sandbox paths exist in your repository. Inspect the data before writing an adapter. If research data genuinely is absent, build the shell and documented integration seam but do not invent automotive values to fill it.

## 1. Product scope and editorial position

The shortlist contains ten model families including Model Y, not ten non-Tesla competitors: Tesla Model Y; BYD Sealion 7; Geely EX5; Zeekr 7X; Jaecoo J5 EV; BYD Atto 2; Tesla Model 3; Kia EV5; Kia EV3; BYD Atto 3. The input contains eleven generation-level model records because outgoing Atto 3 and Atto 3 EVO are separate. Preserve that distinction while grouping them under the Atto 3 family in navigation.

The supplied snapshot has 34 variants, 48 comparison criteria and 1,632 variant/criterion evidence records. These are dataset counts, not 1,632 independent tests. There are 29 current/order-listed variants, four outgoing and one announced/provisional. Compute these counts from the input rather than scattering hard-coded totals around the UI.

Keep Model Y as the anchor. Default baseline ID: `tesla_model_y__premium_long_range_awd__1`. Expose all four supplied Model Y variants prominently, including within comparison:
- `tesla_model_y__premium_rwd__2`
- `tesla_model_y__premium_long_range_awd__1`
- `tesla_model_y__l_premium_awd__4`
- `tesla_model_y__performance_awd__3`

Switching Model Y must recompute every dependent figure, narrative, safety scope, feature status and software applicability. Permit comparing two different Model Y variants, but not adding the same exact variant twice. Permit all other researched trims, with outgoing and provisional records clearly separated from current selections.

The website is independent, not Tesla's website and not a Tesla advertisement. Use an original working brand such as “EV Side by Side”, configurable in one place and subject to a real name/domain clearance before launch. Do not use the Tesla T as our logo. Include a plain-language independence statement; disclose any future affiliate relationship. Main actions are Compare, Explore differences and View evidence, not an unsupported Buy Now funnel.

Do not claim this is the current national top ten or the whole Australian market unless the sales period and ranking have been separately verified. Default public wording: “Model Y versus Australia's leading EVs” and “Our researched shortlist”. Where the historic sales selection is described, identify its dated methodology; do not silently replace that evidence with the current date.

## 2. Design direction: Apple-inspired hierarchy, original execution

Study the official Apple AU iPhone comparison, Mac comparison and a current Apple product page from `REFERENCE_SOURCES.json`. Borrow the separation of highlights, a quick-look comparison and deep specifications; large readable type; strong product presentation; restrained colour; and coherent product selectors. Do not copy Apple's wording, layout pixel for pixel, assets, icons or proprietary font files. Do not call the finished design Apple-approved.

Build an editorial product experience, not a dashboard or a spreadsheet pasted into a template. Use a light warm-white base, near-black typography, subtle neutral panels, one original accent colour and generous whitespace. A dark software-story section may create contrast, but avoid a compulsory dark mode in v1. Use fluid typography, an 8-pixel spacing rhythm, restrained borders, tabular numerals and purposeful rounded corners. Avoid neon gradients, excessive glass blur, giant shadows, every section in identical cards and generic SaaS ornaments.

Use approximately 40–52 px hero type on phones and 72–96 px on large screens, adjusted for actual wrapping. Default body text around 16–18 px; never shrink comparison prose until it becomes unreadable. Desktop content should feel spacious around a 1,200–1,400 px maximum. Preserve visual distinction and equal image quality for every manufacturer; a polished Tesla image against low-quality competitor thumbnails is unacceptable.

Design the actual 390 px experience first. Product identity, selected trim, an actionable comparison control and a useful summary must appear near the beginning. The hero should not require scrolling through a full-screen film before choosing a car. Main CTA target: present in the first viewport on a typical 390 × 844 display. Do not force it at the expense of accessibility or translated/zoomed text.

Motion is optional enhancement: brief opacity/position changes and useful state transitions, with reduced-motion alternatives. No scroll hijacking, mandatory scrubbed video, fake loading sequences, autoplay sound, rotating hero carousel or decorative WebGL dependency. No content may require animation to become readable.

## 3. Information architecture and routes

Implement these principal experiences, with sensible route equivalents if the repository has conventions:

`/` — focused discovery homepage.
`/compare` — shareable comparison workbench, driven by validated URL state.
`/model-y` — the four Model Y variants and their meaningful differences.
`/cars` — the researched shortlist and filters.
`/cars/[family]/[variant]` — detailed variant page with generation/build context.
`/software` — update methodology, per-model timelines and eligibility.
`/methodology` — definitions, measurement bases, ranking scope and limitations.
`/sources` — source registry and correction/reporting information.

Add a small set of curated, indexable pair pages, such as Model Y versus Sealion 7, that use the same comparison engine. Do not create hundreds of near-empty SEO pages from every possible parameter combination. Keep parameterised filter/search views out of the sitemap; establish canonical/indexing rules that do not misrepresent which variants a page compares.

Primary navigation: Compare, Model Y range, Explore cars, Software updates. Put Methodology and Sources within easy reach and in the footer. The source date is data metadata, not a decorative “updated today” stamp.

## 4. Homepage: sequence and hero features

### A. Comparison-first hero

Suggested original headline: “Model Y. Meet your alternatives.”
Suggested supporting message: “Compare Australian variants, everyday features and documented software changes. See the differences that matter to you.”

Present the selected Model Y and an equally treated challenger in a clean product stage. When approved vehicle photos are unavailable, use an intentional typography-led stage with original abstract/schematic visuals and clear labels, not empty broken image frames or invented production-car photos.

Include a Model Y trim selector, a challenger selector, primary Compare CTA and secondary “Explore Model Y variants”. Use a named example comparison rather than a purported personalised recommendation. Below the controls show four concise, sourced essentials such as purchase-price basis, WLTP claim, seats and charging-time basis. Do not surface an ambiguous maximum range or maximum folded cargo figure as if it applies to every selected variant.

### B. Choose what matters

Provide optional priority chips: Price, Range and charging, Family space, Daily convenience, Software, Comfort and performance. Chips reorder or focus chapters and shortlist filters; they do not generate an undisclosed numerical winner score. The ordinary comparison works without completing a quiz. Explain a filtered shortlist and avoid quietly dropping cars just because data are incomplete.

### C. Six meaningful feature chapters

Give each chapter a clear benefit-led title, one strong visual or original diagram, selected-vehicle values, a brief practical interpretation, important conditions and a “Compare this” action. Use real data, not generic Tesla claims.

1. **“What does the price difference buy?”** Purchase price, included equipment and separately priced dependencies. Always state base/list versus driveaway, currency, date and optional costs. Default to no postcode-specific calculator until validated local rules exist.
2. **“Go farther. Understand the charging stop.”** WLTP range, charging windows, AC capability, route planning, battery preparation and charger access. Never convert peak kW into invented stop times or fake range simulations. Use labelled charge-window diagrams instead of false head-to-head timing charts.
3. **“Less to do before every drive.”** Phone key, passive entry, automatic start/shutdown, locking, profiles and preconditioning as a user journey. Distinguish a proximity fob from a driving phone key, and seat memory from transferable profiles. Do not invent seconds saved.
4. **“What changed after delivery?”** Make software history a signature full-width chapter high on the page, not a footnote. Show meaningful dated changes and applicability, not an update-count leaderboard. Use the software rules below.
5. **“Room for your actual life.”** Occupied-seat cargo, seating layouts, dimensions, child-seat considerations, Pet/Camp functions and ANCAP applicability. Separate safety evidence from seating convenience; do not imply one predicts the other. Model Y L requires its own six-seat story and safety record.
6. **“Comfort or performance? Choose deliberately.”** Ventilation, heating, roof/shade, HUD, suspension, driving hardware, standard assistance, phone integration, warranty and servicing. Show where competitors offer useful equipment. Subjective ride/paint/sound impressions must not become an objective ranking.

Each chapter should be shorter than its detailed comparison counterpart. Avoid turning the homepage into all 48 rows. Add concise variant cards for the four Model Ys, a browsable challenger section, then methodology and a final Compare CTA. The homepage and workbench must read from the same selected-variant data model.

## 5. Comparison workbench: core functionality

Desktop/tablet with adequate width: Model Y baseline plus up to two challengers, with product selectors, compact persistent identity/trim summaries and aligned feature rows. Do not default to ten columns. Desktop sticky labels/headers must not obscure focused controls or consume most of the viewport.

Phones: two visible vehicles, Model Y and one active challenger. If three vehicles were selected on desktop, preserve the third and expose clearly labelled challenger tabs/chips; never silently delete it when the viewport shrinks. Each comparison row has its label spanning the row above two equal-width value cells, retaining semantic header associations. Keep related values aligned and conditions within their cell. Avoid a separate label column that leaves no room for content. At extreme zoom/narrow layout, a labelled stacked presentation is acceptable. No accidental whole-page horizontal scrolling.

Provide:
- A searchable vehicle picker grouped by family, generation and variant, with Australian availability states.
- Filters by price basis/budget, drive, seats, claimed range and equipment, with appropriate unknown states. Results counts update accessibly.
- Variant selectors that change specifications without losing the rest of the selection.
- Overview / All features / Software tabs and a category navigator.
- A “Differences only” control whose semantics include different conditions and evidence states, not merely unequal displayed strings.
- Feature search, category expansion and clear all/reset controls.
- A source/evidence drawer for each claim: original source link, publisher, source type, date, market/build applicability, conditions and unresolved conflicts.
- A sticky bottom compare tray on discovery pages; on the workbench, make it compact and context-specific. Account for safe-area insets, keyboard, cookie notices and zoom.
- Copy/share comparison links, with Clipboard and ordinary-link fallback. Web Share is progressive enhancement, not required.
- Browser Back/Forward restoration, refresh persistence and an optional local-device shortlist without sign-in. URL state wins over local storage on a shared link. Validate query parameters and gracefully handle removed or unknown variant IDs.
- A readable print stylesheet retaining selected trims, source date, limitations and evidence references. No separate PDF-generation service in v1.

Show concise, neutral differences: “Lower listed base price”, “Higher WLTP claim” or “Six seats instead of five”, only when the relevant values/bases are eligible. Do not label lower acceleration or more published notices as an overall winner. Missing values must never sort as zero, free, worst or unavailable.

## 6. Software history — a first-class product feature

Read `update_events`, `update_eligibility`, `configuration_history` and the current publication issues, not only `prior_update_summary`. Older summary counts can conflict with later corrections. Resolve supersession explicitly.

Separate OTA release families, maintenance builds, dealer-installed updates, recall remedies, phone-app updates, hardware/model-year revisions and announcements. The UI must say which unit a count represents. Deduplicate by model/generation/family where appropriate; do not merge unrelated vendors' version strings or count every patch suffix as a feature release.

Default to the researched observation window, 5 October 2024 to 5 October 2026, shortened only where launch evidence supports it. The variant-review date is 6 October 2026. Do not label this a rolling “last two years” after the window has passed. An updated window requires new evidence, not changing a heading.

Every summary exposes documented minimum, exact-total-known status, period, evidence class, eligibility scope and meaningful changes. Use “At least N documented Australian release families” or “Total not established”, not unsupported exact totals. Separate a nameplate history from the current model year and from updates installed on an individual's vehicle. Unknown is not zero.

Visualise events on an accessible dated timeline; make the list itself usable without animation. Filter by meaningful features, fixes/security, dealer delivery and evidence type. Announcements are visually distinct from delivered releases. Show documentation coverage, not a made-up reliability score. A longer audit trail or a greater number of fixes is not automatically better software.

Critical regression: preserve EV3's six reverified notices plus two pending older records; do not present eight as equally verified. Preserve the separate Model Y L eligibility/unknown total; do not inherit the five-seat or whole-nameplate Tesla count. Do not treat a larger battery, new screen or new configuration acceleration as an OTA delivered to older vehicles. FSD, remote parking and summon require AU/build-specific evidence and supervision caveats.

## 7. Data integration and publication safety

Read the actual input keys: `metadata`, `criteria`, `models`, `variants`, `trim_equipment`, `feature_evidence`, `update_eligibility`, `update_events`, `configuration_history`, `sources`, `publication_issues`, and `prior_update_summary`. Preserve source IDs and all original research records. Create an adapter/view model rather than destructively replacing the research schema.

Known feature states are `standard`, `conditional`, `not_verified`, `subjective`, `unavailable`, `optional` and `not_applicable`. Represent them with text, icons and accessible labels, not green/red alone. Maintain the distinction between equipment availability and evidence certainty. If additional states are needed, derive them explicitly without overwriting the original value.

Represent displayed facts with value, unit, measurement basis, source IDs, observation/effective/review dates, market and variant/build scope, evidence status, qualifications and publication issues. Do not pretend a model-wide source was independently verified for a specific trim. Where lineage is only variant-level, show that scope honestly. A current access date does not make an old manufacturer article a current specification.

Build pure, tested comparison helpers that return `comparable`, `different_basis`, `conditional`, or `unknown`, plus an optional delta and reason. Calculate a numeric difference only when units and relevant bases match. Round presentation responsibly; preserve raw values.

Enforce:
- Base/list and driveaway prices cannot be given an unqualified delta. Do not invent tax, delivery, financing, insurance or energy assumptions.
- WLTP, EPA and NEDC claims remain separate. Wheel and variant qualifiers stay beside range. A claimed result is not our road test.
- 10–80%, 30–80% and 0–80% charging times are not directly comparable. A test charger's 350 kW supply is not the car's peak acceptance. No fabricated curves.
- Usable and gross battery capacity stay separate; missing Tesla capacity is null.
- Rear cargo with occupied seats, frunk and maximum folded total remain separate; methods such as VDA/manufacturer volume are identified.
- Rollout-subtracted and conventional acceleration claims carry their timing basis.
- Five-seat Model Y and Model Y L have separate ANCAP applicability. Do not inherit outgoing Atto 3's safety score into EVO.
- Five-seat Tesla V2L conflict remains conditional until resolved. No unqualified current-build availability or retrospective hardware upgrade.
- Geely generations, Zeekr Black wheel/range qualification, provisional EV3 AWD and EVO document-access limitations remain visible.
- Subjective finish, paint, ride and alert sounds cannot produce objective badges without matched testing.
- An image, overseas review or generic handbook is not proof a particular AU trim has a feature.

Apply publication issues wherever a value is used: cards, filters, hero stats, summary copy, tables, print, metadata, share images and exports. Invalid/unsupported claims must not escape through the SEO layer. For genuinely blocked claims, omit the assertion and show a usable “Needs confirmation” state. For permitted dated claims, retain their date and caveat. Do not silently fix conflicting source values by selecting the one that flatters Tesla.

Create build-time structural validation, integrity checks, source-reference checking and an explicit editorial release checklist. Keep validation of file structure separate from verification of factual correctness. Retain a correction log; never change a verification timestamp merely because the site rebuilt.

## 8. Media rights and original asset strategy

Read the media audit before writing image components. Publicly reachable does not mean licensed. The candidate manifest contains discovery URLs, not assets approved for deployment. All candidates currently have `production_allowed: false` for this project.

Tesla's official gallery has a limited news-media permission with conditions and mandatory credit. It is not unrestricted permission for commercial, promotional or cover use. Product-page images, app screenshots, technical illustrations, logos and raw videos do not become reusable through attribution, hotlinking, cropping, downloading or an AI restyle. Do not bypass access controls or remove watermarks. Do not assume our site qualifies as news media. Written permission or an appropriately scoped licence must be recorded before restricted media are published. A case-specific copyright exception requires qualified review, not a blanket statement from you.

Two video IDs linked on Tesla's AU article are candidates for the normal YouTube player: `iPJDW5EaIzE` and `_OiEwIUQzDk`. Confirm official provenance, current playback, embedding availability and platform policy before enablement. If enabled, use click-to-load privacy-enhanced embedding, a plain accessible title, normal controls and a link fallback. Do not self-host, edit, frame-extract, hide branding or use the videos as background loops. Do not promise privacy-enhanced mode eliminates all tracking. Prevent third-party requests before the user's load-video action.

Use an asset resolver, not arbitrary external URLs in JSX. Approved assets require documented owner/licence or permission, allowed placements, allowed transformations, attribution, approval reviewer/date, territory/duration where relevant, technical validation and exact model/build applicability. Block missing, expired, scope-mismatched or explicitly disallowed media at build/CI. An approval flag without provenance is insufficient. Never mark permission granted simply to pass a test. Ensure no restricted source URL is fetched by the runtime, preload tags, CSS, Open Graph rendering or generated screenshots.

Launch-capable fallback: original site-owned SVG/CSS diagrams and typographic product cards; commissioned/licensed AU vehicle photos when available; independently created conceptual illustrations clearly labelled as illustrations. Do not claim a schematic is an exact dimensional model. Do not use a fictional AI-generated interior or inaccurate generic EV as proof of actual seating, screens, wheels, safety hardware or charging ports. Never use five-seat imagery to depict L's third row. Original generation is not a guarantee of IP clearance and must not be a near-copy of a restricted photograph.

Use `ORIGINAL_ASSET_BRIEF.md` for the shot list and visual specifications. If image generation is actually available, create only the approved conceptual assets within that brief and record provenance. If unavailable, produce high-quality original SVG/CSS visualisations and implement replaceable media slots; do not claim photographs were generated. Do not add a paid image service or buy stock without authorisation.

Serve only approved local/CDN assets. Supply width/height, responsive sizes, accurate alt text and sensible crops. Product comparison cards use `object-fit: contain` so the vehicle is not cut off; editorial scenes may use `cover` with verified safe crop areas. Do not mirror RHD interiors into inaccurate LHD images or recolour hardware. Equalise photographic presentation, not real dimensions; a separate size comparison can use validated scaled dimensions.

## 9. Engineering, accessibility, performance and privacy

Separate source research, validation, normalised domain types, comparison logic, UI components and media approval. Prefer server-rendered/compiled static data with small client components. Do not send the full research corpus, all source prose or all 1,632 records to every route when only selected records are needed. No live scraping in visitors' browsers. No arbitrary URL fetch service, unnecessary authentication, vehicle login or VIN collection.

Useful component boundaries: SiteHeader, ComparisonHero, VariantPicker, PriorityChips, VehicleCard, CompareTray, KeyDifferences, FeatureChapter, ComparisonRow, FeatureStatus, EvidenceDrawer, UpdateTimeline, VariantOverview, MediaRenderer and MethodologyNotice. Treat this as a suggested structure, not a reason to ignore a good existing component system.

URL state should contain stable selected IDs, a validated active challenger, chosen section and filters where shareable. Keep dataset version/date in shared context so a recipient sees whether the underlying data changed. Use stable human-readable slugs mapped to immutable IDs. Avoid browser globals during server rendering and handle unavailable local storage gracefully.

Accessibility target: WCAG 2.2 AA, with a deliberate 44–48 px design target for primary touch controls; do not misstate this as WCAG's exact AA minimum. Support keyboard-only navigation, visible focus, logical headings, screen-reader labels, meaningful table relationships, zoom/reflow and reduced motion. Bottom sheets need correct dialog semantics, focus containment, Escape dismissal and focus return. Provide explicit buttons for any swipe action. Sources must be usable by touch and keyboard, not hover tooltips. Test sticky UI with on-screen keyboard, landscape and 200%/400% zoom. Do not claim a complete accessibility certification from an automated score.

Performance targets: Core Web Vitals at the 75th percentile of real visits — LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Before launch, measure lab performance and interaction tests; do not label a Lighthouse run as field INP or real-user proof. Aim for mobile Lighthouse Performance ≥90 under documented conditions, but report actual scores. Proposed budgets: first-route compressed JS ≤200 KB where practical; initial mobile transfer ≤1 MB; primary hero image ≤250 KB. Audit and justify deviations rather than gaming scores by removing the useful interface.

Prioritise only the true LCP image, lazy-load lower media, reserve geometry, use AVIF/WebP with appropriate fallback, and no initial video download. Test cold and warm loads. Use the system font stack or a properly licensed self-hosted font with its licence; do not copy Apple/Tesla font files. Never bundle fonts taken from the research environment.

Use semantic metadata, correct canonical links and a limited sitemap. No invented aggregate reviews, ratings, product availability, prices or rich-result eligibility. Use original or approved assets for social cards. Keep disclosures in social/print summaries where an isolated claim would mislead.

Sanitise source URLs and render research strings as text. Avoid raw HTML insertion. Keep permissions and licence documents that contain private correspondence out of public bundles. Add a CSP appropriate to the selected deployment and opt-in embed origins; prevent open redirect and arbitrary remote-image-proxy behaviour.

No third-party behavioural analytics by default. A local analytics interface may define anonymous events such as compare_started, variant_changed, evidence_opened and comparison_shared, without transmitting data until a real provider and lawful configuration are approved. No deceptive tracking and no prompts for personal information just to compare cars.

## 10. Execution sequence and acceptance

Implement in usable stages: inspect/audit; validate data and build adapters; establish design tokens and mobile layouts; deliver the compare picker-to-results-to-evidence journey; add Model Y/variant pages and feature chapters; add the software timeline and media gates; finish sources/methodology/print/SEO; test and polish.

Use `qa/ACCEPTANCE_TESTS.md` as the acceptance checklist. Run type checks, lint, unit tests, data validation, production build and end-to-end tests where tooling is available. Use browser automation at 390, 768 and 1440 px at minimum and inspect screenshots at 320, 375/390, 430, 768, 1024 and 1440 px where feasible. Test selected journeys in Chromium and WebKit, and Firefox if available. Record unavailable real-device testing rather than claiming it.

Required journeys: select two exact variants; change Model Y to RWD, L and Performance; add a third on desktop and retain it on mobile; show differences; find an unknown feature; open evidence; inspect software eligibility; share and restore the URL; print; reject an unapproved image; and display a useful fallback when an image or video fails.

Visually inspect actual pages at mobile and desktop sizes. Fix clipped labels, tiny footnotes, excessive hero height, sticky overlap, mismatched card heights, weak contrast, broken focus and accidental horizontal scroll. Assess the design as an automotive product publication, not merely a passing component demo.

Final handoff: working code; concise architecture and decisions log; data mapping and validation; asset inventory/approval rules; original asset production backlog; test commands and actual results; screenshots where generated; unresolved editorial/rights issues; and accurate run/deploy instructions. Clearly distinguish “implemented”, “tested”, “not yet verified” and “requires owner approval”. Make the result usable without live manufacturer scraping, paid services, unlicensed imagery or a sign-in.
