# Citable EV pages — launch plan

Owner request: 8 October 2026. Custom domain to be chosen later; launch first on the public Sites address.

## Release sequence

1. Generate nine permanent Model Y versus rival pages from the existing, exact Australian variant records. Keep the existing Sealion 7 URL. Use Premium RWD as the explicit baseline and the lowest listed current trim per rival. Link all other trims. Put six useful measurements, dates and source links in server-rendered HTML.
2. Use one claim formatter for visible key facts, buyer questions, copy text and JSON/Markdown exports. Preserve units, measurement windows, market, trim, generation, conditional status and individual evidence dates. Never treat a build date as a fact check or manufacture a winner from mismatched bases.
3. Add the copy button to permanent pages, variant pages and the live comparison. Copy only the selected cars. Provide selectable text if clipboard permission is denied.
4. Add WLTP, LFP, V2L, FBT and driveaway definitions, each with a stable anchor and links to relevant comparison rows. Publish Car, WebPage and FAQPage JSON-LD matching the visible content.
5. Publish stable JSON and Markdown comparisons, `/llms.txt`, a dated sitemap and explicit crawler rules. Local builds stay noindex; public builds require a valid HTTPS origin. Static hosting must serve real HTML on deep links and return a real 404 for unknown pages.
6. Open all 32 buyer sources previously read only through summaries. Record successful checks, corrected claims and access failures individually. Do not promote inaccessible sources to verified. Withhold unsupported claims; preserve the immutable original research and apply dated corrections.
7. Validate all nine pages and 34 variant pages with JavaScript disabled, source/date parity across formats, payload size, canonical URLs, 404s and clipboard success/failure. Run the existing data, type, lint and regression checks, build, then publish publicly.

## Launch boundaries

- Publication is authorised by the request to launch. A purchased domain is not required for the initial public address.
- Keep desk-research and build/applicability qualifications. An opened source confirms only the claims actually checked; a 2025 road test does not establish a 2026 trim's result.
- Re-use the current original illustrations; no new manufacturer-photo rights are required.
- CarExpert driveaway and weight rows identified as licensed industry data need maker replacements or permission before syndication; show an explicit unconfirmed value where withheld.
- Record unresolved source retrieval and editorial tasks in the source audit and correction log. No silent substitution of search snippets for article text.
- No behavioural analytics or new third-party requests in the reader experience.

## Monthly manual measurement

Start after publication, then repeat monthly on the same day. Use the 20 questions in `qa/ai-citation-checks.csv` in ChatGPT, Perplexity and Google. Record date, service/mode, exact question, response link or saved answer, whether this site was cited, cited URL, quoted figure, correct trim/basis/date and any correction needed. Track citation rate and correct-quote rate separately. Do not count a mention without a link as a citation. Host crawler logs, when available, are supporting evidence rather than proof of citations. No recurring automation is configured by this plan.

## Success criteria

- Nine distinct pair URLs; no third car's research embedded in a pair page.
- Main answers and source links present in HTML without JavaScript.
- Target under 250 KB uncompressed HTML per pair; compact copy/Markdown under 30 KB (JSON includes structured claim and citation fields).
- Every exported claim has car, trim, basis, status, evidence date and source URLs beside it.
- Public robots allow retrieval, all canonical URLs use the real public origin, and the sitemap lists every citable page.
- Failed source checks are visible and unsupported figures are withheld; no false claim of indexing or citation success.
