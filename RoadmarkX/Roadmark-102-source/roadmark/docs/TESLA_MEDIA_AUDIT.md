# Tesla media audit and publication decision

**Checked:** 6 October 2026. **Purpose:** identify relevant media and a defensible production workflow for an independent, potentially monetised Australian comparison website. This is a rights-screening research note, not legal clearance.

## Decision

Build immediately with original information graphics and controlled media slots. Request written permission for the exact Tesla photography needed. Treat the gallery as a restricted editorial source, not a free commercial image library. Use official videos only through their permitted platform player after availability and terms checks. Do not make the site dependent on a successful licensing response.

The accompanying manifest contains **30 discovery records: 21 exact image-link targets, seven gallery collections and two video embed references**. None is currently approved for this project. A collection is not an individual downloadable asset. No Tesla media binaries are bundled.

## What the published terms establish

Tesla's [Australian gallery](https://www.tesla.com/en_au/tesla-gallery) limits its provided images to qualifying news-media stories. It excludes covers and advertising/promotional/commercial uses and requires the credit **“Courtesy of Tesla, Inc.”** Broader uses require written permission. The operator's business model and each placement matter; describing a page as a comparison does not by itself prove eligibility.

Tesla's [intellectual-property notice](https://www.tesla.com/en_au/legal/additional-resources#intellectual-property) reserves rights in website text, photography, graphics, animation, audio and video, and does not grant an implied IP licence. Discovering a CDN URL is not permission. Do not assume gallery conditions also license product-page images, or vice versa.

Australia has specific copyright exceptions, including certain criticism/review and news-reporting uses. The [Attorney-General's guidance](https://www.ag.gov.au/rights-and-protections/copyright/copyright-basics) is not a blanket exception for a comparison site's decorative hero, advertising or social promotion. Have qualified Australian counsel assess any proposed exception rather than building the project around an assumption. Owning an original photograph also does not settle every trademark, design, location, people-release or other third-party issue.

## What was found

| Source | Relevant material | Proposed treatment |
|---|---|---|
| Tesla AU Gallery | Model Y; Model Y L Premium; Model 3; Model 3 Performance | Request scoped editorial/comparison permission and exact AU/build identification. Individual download files were not exposed. |
| Tesla AU Gallery, charging | V4 Supercharger and Wall Connector collections | Useful for charging chapters, subject to rights and AU hardware/location checks. |
| Tesla AU Gallery, branding | Tesla logos | Do not use as this website's identity. No logo asset is approved here. |
| AU “Introducing New Model Y” article | Hero, exterior/rear, interior and AUNZ-labelled cabin image links | Useful candidate sources after permission and visual verification. Historical imagery is not current build evidence. |
| UK “Introducing New Model Y Performance” article | Red exterior, silver exterior and performance cabin links | Permission and AU build matching required. Do not imply UK launch hardware is the current Australian car. |
| AU Model 3 product page | Hero; app controls; climate; trip planning; Pet, Camp and Sentry; charging; safety illustration | Model 3-specific. Do not pass these off as Model Y or L. Screenshots/diagrams are not exempt from rights review. |
| AU Tesla App support | Phone/app hero image link | App-story candidate; create an interface-neutral original alternative by default. |
| AU Model Y article videos | 60-second-features introduction and designers/engineers film embeds | Standard-player candidates only, not downloadable footage for a hero loop. |

The Model 3 page expressly cautions that overseas models may be shown. “RHD”, “AUNZ” and “APAC” filenames are useful discovery hints; they do not certify a specific model year or trim.

### Priority image filenames to request

These are exact observed link filenames, not invented image-generation filenames:

- `learn_new_model_y_hero.jpg`
- `learn_new_modely_ext_1.jpg`
- `learn_new_modely_ext_2.jpg`
- `Learn-Introducing-Model-Y-Interior-Front-AUNZ.jpg`
- `Learn-Introducing-Model-Y-Interior-Rear-AUNZ.jpg`
- `Blog-Model-Y-Performance-Red.jpg`
- `Blog-Model-Y-Performance-Interior.jpg`

For Model Y L, request the official gallery's **Model Y L Premium** set, including exterior, second-row captain's seats, third row and luggage space with all seats in use. Its individual download URLs were not recovered; do not guess CDN paths or stretch a five-seat image into an L depiction.

See `media/tesla-media-candidates.csv` for all observed URLs and `media/tesla-media-candidates.json` for the machine-readable restrictions.

## Official-video route

The [Australian introduction article](https://www.tesla.com/en_au/learn/introducing-new-model-y) directly embeds:

| Article description | Video ID | Clean embed candidate |
|---|---|---|
| New Model Y features in 60 seconds | `iPJDW5EaIzE` | `https://www.youtube-nocookie.com/embed/iPJDW5EaIzE` |
| Behind the scenes with the designers and engineers | `_OiEwIUQzDk` | `https://www.youtube-nocookie.com/embed/_OiEwIUQzDk` |

[YouTube's AU terms](https://au.youtube.com/t/terms) allow use of its embeddable player subject to the agreement; they do not grant a separate right to download and republish the footage. Embedding can be restricted by the uploader or domain. These particular videos' live playback and intended-domain eligibility were **not tested**.

If approved after checks, use the normal player with click-to-load, an accurate title and a link fallback. Use [privacy-enhanced mode](https://support.google.com/youtube/answer/171780?expand=PrivacyEnhancedMode&hl=en), without claiming it eliminates all data collection. No iframe or thumbnail request before activation. Do not extract a poster frame from the video: start with an original graphic or a text-only cover. Do not hide attribution, controls or platform elements; do not autoplay or present the material as our test footage.

## Approval gate

A discovery record is deliberately not an approval record. Before an asset enters the production resolver, record its creator/owner, permission or licence evidence, approved placement, territory, duration/expiry, credit, permitted transformations, relevant vehicle/build and technical/visual review. Validate both rights and accuracy. Store private correspondence outside the public bundle.

Permission to display an editorial image does not automatically cover promotional Open Graph cards, advertisements, email campaigns or re-editing. Scope each use. Keep `media/approved-assets.json` empty until actual project permissions or original-asset ownership are documented. The normal fallback is a polished original schematic, not disabling the entire page.

## Verified contact and next step

Tesla's [Australian contact page](https://www.tesla.com/en_au/contact) lists **apacpress@tesla.com** for Australia and Asia press enquiries. This is a place to request routing/permission, not evidence permission exists or that a particular staff member will grant it. `TESLA_PERMISSION_REQUEST.md` contains a draft. No message was sent.

## Audit limitations

Public page text and exact linked URLs were reviewed. The image fetches returned throttling/cache-miss responses, so no image pixels, file dimensions, byte sizes, encodings or safe crops were verified. Direct network requests from the local container also failed DNS resolution. The dynamic Model Y product page exposed only partial text, and the gallery did not expose individual download links. This is therefore a targeted, verified discovery list—not an exhaustive site scrape or a visually approved asset pack. Source text and observed link targets support the inventory; filenames alone do not establish suitability.
