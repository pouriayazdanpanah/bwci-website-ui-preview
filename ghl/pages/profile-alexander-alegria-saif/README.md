# Alex Alegria-Seif — GoHighLevel profile

Standalone **Website Builder → Custom Code** port of `design/Profile Alexander Alegria Saif.dc.html` with `GovProfile.dc.html`. The display name comes from `bwci-people.js`: **Alex Alegria-Seif**. It intentionally differs from the export filename/slug.

**Status (21/10/2026):** implemented and tested locally in Chrome with development Playwright. Published GHL installation: **NOT VERIFIED**. Based on merged main `abe7f98` (Farhad PR #21). No design, shared runtime, or existing page output changes.

## Files and maintenance

| File | Purpose |
|---|---|
| `profile-alexander-alegria-saif.ghl.html` | Hosted-image production block (~102 KB) |
| `profile-alexander-alegria-saif.inline.ghl.html` | Same block with logo and portraits embedded (~932 KB); fonts still load from Google Fonts |
| `_build/src/profile-alexander-alegria-saif.{html,css,js,config.json}` | Editable inputs; rebuild rather than patching generated output |
| `_build/build.js` | Existing scoped/pruned Board/Leadership/Farhad build pipeline, using the shared GovProfile renderer |
| `assets/` | Three original portraits, copied byte-identical from the design |
| `_build/` QA tools and `qa-results.json` | Development only, never loaded in GHL; current run evidence |

Root: `#bwci-profile-alexander-alegria-saif`; prefix `pas`; instance `window.__bwciProfileAlexanderAlegriaSaif`. IDs: `pas-main`, `pas-top`, `pas-biography`, `pas-related`.

## Source inspection and content

The actual source was rendered and visually inspected before implementation. Sources inspected:

- `design/Profile Alexander Alegria Saif.dc.html`: page wrapper, tokens, fonts, imports, `.sr` observer (there are no `.sr` elements here).
- `design/GovProfile.dc.html`: hero, breadcrumb, role/membership labels, biography, detail rows, return links, related cards, entry contexts and drag behavior.
- `design/bwci-people.js`: exact name, Chairman role/entity, six biography paragraphs, membership and related order. Data is read at build time; no new corporate/biographical claims added.
- `SiteHeader.dc.html`, `SiteFooter.dc.html`, `Breadcrumb.dc.html`, `GovNav.dc.html`, `PersonCard.dc.html`: supplied by unchanged `ghl/shared/site-chrome/`.
- `bwci-system.css`, `bwci-motion.js`, `image-slot.js`, `image-slots.state.json`: source system styles, motion and centred scale-1 cover geometry.

Section order: shared header → dark patterned profile hero with four-item breadcrumb, portrait, name, role and two membership labels → sticky GovNav → Biography and detail rows → both return links and Also on the Board → shared footer.

The hero portrait is `alexander-alegria-saif.jpg` (1440×1665), displayed in the source 4:5 frame, width `min(300px,64vw)`. Related portraits are `farhad-reyazat.jpg` (2216×2015) and `gabriella-karlova.webp` (812×1024). The build checks source asset bytes before embedding. Gabriella's saved framing is centred at scale 1; the other two have no override.

## Installation/configuration

1. For hosted output, upload all three `assets/` portraits plus `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage.
2. Set image URLs and actual routes in the **first JSON block**, ID `bwci-profile-alexander-alegria-saif-config`.
3. Use a full-width GHL section, row and column with zero padding/margins and one Custom Code element. Paste the **entire** hosted or inline file.
4. Validate the actual published page; the editor canvas does not establish script behavior.

| Config key | Purpose/default |
|---|---|
| `logoImage` | Header/drawer/footer logo; hosted placeholder |
| `peopleImages.alexander-alegria-saif` | Hero portrait URL |
| `peopleImages.farhad-reyazat`, `.gabriella-karlova` | Related card portrait URLs |
| `showHeader`, `showFooter` | `true`; switch off when the host provides them |
| `footer.regulatoryLine`, `.registeredJurisdiction`, `.companyNumber`, `.registeredOffice` | Empty optional source fields |
| `links.home` | `/` |
| `links.financialEngine`, `.ecosystem`, `.platforms`, `.smes`, `.investors` | Existing `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` defaults; confirm for the installation |
| `links.impact`, `.today` | Existing `/#bwci-impact`, `/#bwci-today` anchors |
| `links.governance`, `.governanceBoard`, `.leadership`, `.governanceFramework` | Unresolved `#`; set published destinations. Hub framework route includes `#gov-framework` |
| `links.profileFarhadReyazat`, `.profileGabriellaKarlova` | Related destinations, unresolved `#` until actual GHL URLs are known |
| Other `links` | Unresolved `#`: `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` |

The own-profile link key is not configured because Alex is excluded from related cards. Placeholder `REPLACE-WITH` URLs are never fetched and frames stay empty. Invalid JSON falls back to default links/behavior. Inline output needs no image uploads. Existing port files or merged PRs do not establish real published GHL URLs; none are invented here.

## Contexts and interactions

- Direct/missing/invalid `from`: Board context, because Alex is a Board member.
- `?from=board`: Home › Governance › Board of Directors › Alex Alegria-Seif. Board is current in GovNav/select.
- `?from=leadership`: matching Leadership breadcrumb and GovNav/select. The same profile serves both contexts; both membership labels remain present.
- Six exact biography paragraphs; Principal experience, Qualifications, Area of responsibility and Board / committee role values remain empty, following the source data. No LinkedIn row is added while the source value is null.
- Both return links remain present. Related Board cards are **Dr Farhad Reyazat**, then **Gabriella Karlova**. Alex's card is excluded. Related links append `from=board`, preserve existing queries and put the parameter before a hash; `#` remains unresolved.
- Source small-card hover lift/shadow/border, portrait zoom, view-profile overlay and emerald keyboard outline; overlay visible on touch. Reduced motion removes entrance/card movement and retains the source's short reveal fade.
- Source flex hero wrapping, detail rows stacked at ≤560px, GovNav list at ≥768px/native select below it. Sticky navigation pins below the header.
- Related cards form a snap carousel at ≤767px. Native touch scrolling and focus scrolling; mouse drag activates after 6px, captures the pointer, suppresses its click, and releases on pointerup/cancel. An ordinary following click still navigates.

## Shared generation and lifecycle

Uses unchanged `site-chrome.profile.js` and `site-chrome.profile.runtime.js`, introduced in the merged Farhad port. The renderer expands the actual template and people data at build time; header, footer, Breadcrumb, GovNav, PersonCard, system tokens and image fitting remain shared development infrastructure. Each output embeds its complete native HTML/CSS/JS with no shared runtime request, React, support.js, vendor imports or source-relative assets.

Page-specific scoped styles and queries, guarded init, AbortController-backed listener cleanup, portrait/motion observers and timers follow the existing implementation. A parent observer immediately tears down and reattaches after root replacement, including when no scroll occurs. Removing the widget restores body overflow and releases resources. Repeated pre-markup execution keeps one pending bootstrap, removed on attachment/20-second timeout. Drawer scroll locking is the only body-style write and restores the host's previous value. Host content above/below remains intact.

## Current QA

All results below were executed for this Alex profile, not inherited from another page's README. Local browser results do **not** certify a published GHL installation.

| Check | Current result |
|---|---|
| 13-width source/port screenshots: 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560; height 900 | PASS: identical document heights, no overflow/JS errors, maximum pixel difference **0.002688%**, RGB channel threshold 24 |
| Final-pose element boxes/key computed styles across hero, GovNav, biography, related section, header/footer: 1440×900 direct, 390×844 Leadership | PASS: 0 differences in both comparisons |
| Natural source vs port interaction traces | PASS: identical name/content/empty values, contexts, related self-exclusion, image fit, hover, keyboard outline, sticky nav, resize, 170px mouse drag, 170px CDP touch swipe, touch overlay and reduced-motion results |
| Actual configured navigation and acceptance | PASS: direct/Board/Leadership/invalid entry routes, mouse/Enter/select navigation, related query/hash links, drag click suppression/next click |
| Hostile host and lifecycle at 390/1440 | PASS: generic CSS and surrounding content, duplicate script, root replacement/removal, body overflow restoration, breakpoint resize, deferred markup and repeated bootstrap |
| Shared chrome lifecycle | PASS: header/footer toggles, legal wording config, malformed JSON, overrides, loaded images, placeholders not fetched, hostile CSS, rerender and reduced motion; no JS errors |
| Portraits/fonts/network | Hosted local portraits decode and refit; embedded images decode; Plus Jakarta Sans and JetBrains Mono loaded; acceptance had no network failures or JS errors |

The screenshot/DOM scripts compare the **fully revealed static pose**: `qa-ready.js` waits for this person's actual content, three decoded portraits and loaded fonts; after scrolling, it clears pending reveal tags on both sides. This normalization is QA-only and is not inserted into production. A natural source comparison initially retained two source-only hidden reveal tags (detail table/return-links block) despite matching geometry; the Claude runtime's asynchronous global scan can race component mounting. The port uses the existing root-scoped motion. Natural interactions/motion/reduced-motion are tested separately without this normalization.

Additional source/port full-page comparisons at 390?600, 1440?600, 1440?1200, landscape 844?390 and motion-enabled 1440?900 passed: identical document heights, no overflow/JS errors, maximum pixel difference 0.002450%. Header hover/dropdown/keyboard/mobile-drawer and profile hosted-image/lifecycle traces also completed with no JS errors. Generated JS syntax, deterministic rebuild and unchanged design/shared/previous outputs were verified. Full bounded evidence is in `_build/qa-results.json`.

## Intentional differences and GHL limits

- Image-slot editor upload/edit controls omitted; original portrait composition retained, with normal card Tab stops. Missing hosted URLs leave empty frames, following existing ports.
- Native `<option>` uses plain text; inactive GovNav layout is hidden instead of unmounted.
- Native link/image dragging is suppressed only within the carousel so intended pointer dragging works. No outside input interception.
- Anchor smoothing is scoped to widget targets; host document scroll styling is not changed. Source global/asynchronous motion mounting races are not reproduced.
- Sticky behavior depends on GHL ancestors without clipping overflow/transform constraints. Actual GHL wrappers, live route configuration and published page behavior remain **NOT VERIFIED**.
- Five other profiles remain separate work. This PR changes only Alex's files and the implementation inventory.

## Build and reproduce

```powershell
node ghl/pages/profile-alexander-alegria-saif/_build/build.js
node ghl/pages/profile-alexander-alegria-saif/_build/make-previews.js
python -m http.server 8765 --bind 127.0.0.1
```

Development QA requires Playwright and installed Chrome. Set `NODE_PATH` to the directory containing the Playwright package; `BWCI_QA_CHANNEL` optionally overrides `chrome`. No package or build step is required by the GHL output.

```powershell
$env:NODE_PATH = 'PATH_TO_PLAYWRIGHT_NODE_MODULES'
$src = 'http://127.0.0.1:8765/design/Profile%20Alexander%20Alegria%20Saif.dc.html'
$port = 'http://127.0.0.1:8765/ghl/pages/profile-alexander-alegria-saif/_build/preview/plain.html'
node ghl/pages/profile-alexander-alegria-saif/_build/shoot.js $src output/playwright/alex/source
node ghl/pages/profile-alexander-alegria-saif/_build/shoot.js $port output/playwright/alex/port
python ghl/pages/profile-alexander-alegria-saif/_build/diff.py output/playwright/alex/source output/playwright/alex/port
node ghl/pages/profile-alexander-alegria-saif/_build/domdiff.js $src $port 1440 900
node ghl/pages/profile-alexander-alegria-saif/_build/behaviour.js $src source
node ghl/pages/profile-alexander-alegria-saif/_build/behaviour.js $port port
node ghl/pages/profile-alexander-alegria-saif/_build/chrome-behaviour.js $port port
node -r ./ghl/pages/profile-alexander-alegria-saif/_build/qa-browser.js ghl/shared/site-chrome/qa/chrome-lifecycle.js profile-alexander-alegria-saif pas http://127.0.0.1:8765/
node ghl/pages/profile-alexander-alegria-saif/_build/header-and-lifecycle.js http://127.0.0.1:8765/ghl/pages/profile-alexander-alegria-saif/_build/preview/ http://127.0.0.1:8765/
node ghl/pages/profile-alexander-alegria-saif/_build/acceptance.js
node ghl/pages/profile-alexander-alegria-saif/_build/visual-matrix.js
```

`qa-routes.js` serves local React copies only to source QA. Full screenshots/logs are local artifacts, not GHL dependencies. The first source screenshot was captured before implementation; source and port phone/desktop screenshots were visually inspected.
