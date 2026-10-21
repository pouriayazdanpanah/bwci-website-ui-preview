# Christie Osarenren - GoHighLevel profile

Standalone Website Builder Custom Code port of `design/Profile Christie Osarenren.dc.html` and `GovProfile.dc.html`. Display data comes from `bwci-people.js`.

**Status (22/10/2026):** implemented and checked locally in Chrome/Playwright; evidence in `_build/qa-results.json`. Published GHL: **NOT VERIFIED**. Independent `feat/ghl-profile-christie-osarenren` from main `b954288`, after confirmed merges of PRs #25/#26. Stop at PR review; no auto merge.

## Files and build

- `profile-christie-osarenren.ghl.html`: hosted-image production block, editable top JSON configuration.
- `profile-christie-osarenren.inline.ghl.html`: identical page with original portraits/logo embedded; Google Fonts remain external.
- `_build/src/profile-christie-osarenren.{html,css,js,config.json}`: editable build inputs.
- `_build/build.js`: existing profile/chrome generator, CSS scoping/pruning, config and original asset guards.
- `assets/`: four original portrait files copied byte-for-byte.
- `_build/`: development tools only; no build or shared module is fetched by the pasted output.

Root `#bwci-profile-christie-osarenren`, prefix `pco`; IDs `pco-main`, `pco-top`, `pco-biography`, `pco-related`. Rebuild both outputs after input changes.

## Source inventory and content

Actual wrapper read and rendered before coding. Inspected dependencies: GovProfile, bwci-people.js, SiteHeader, SiteFooter, Breadcrumb, GovNav, PersonCard, bwci-system.css, bwci-motion.js, image-slot.js, image-slots.state.json and referenced assets/fonts. support.js/React only explain source rendering and are removed from production. The wrapper's extra `.sr` observer has no matching elements and is omitted.

Order: shared header; patterned dark hero, breadcrumb, portrait, name, role, membership; sticky GovNav; Biography/detail rows; both return links and Also on the Board; shared footer.

Own portrait `christie-osarenren.webp` is RGB 480 x 480. Source cover framing is centred scale 1 within the 4:5 frame, width `min(300px,64vw)`. Original related portraits/crops are preserved, including Gabriella's saved centred scale 1 state.

One role: **Senior Market Strategy & Research Analyst**, no entity suffix. **Leadership** is the sole membership. There are **zero biography paragraphs**: preserve the Biography heading and empty body container, without invented placeholder copy. Principal experience, Qualifications, Area of responsibility and Board / committee role retain their empty values. Null LinkedIn is omitted. No corporate or personal facts are inferred.

## Entry and interactions

- Direct/missing/invalid `from` defaults to **Leadership**. Explicit `?from=board` and `?from=leadership` change breadcrumb/GovNav/mobile select only; membership follows source data.
- Both Board and Leadership return links remain. Related cards: **Alex Alegria-Seif, Dr Farhad Reyazat, Gabriella Karlova**, in that order. The current person is excluded. Related routes append `from=board`, preserving other query parameters/hash; unresolved `#` stays `#`.
- Cards retain hover lift, border/shadow, portrait zoom, view-profile overlay, keyboard outline and touch overlay.
- At <=767px GovNav uses a native select and related cards use horizontal snap scrolling; >=768px uses nav list/grid. Detail rows stack at <=560px; hero wraps with source type floors. Header drawer breakpoint 1280px, footer 1023/479px.
- Mouse carousel drag starts beyond 6px, captures pointer, temporarily disables snap, suppresses the drag click, restores state on release/cancel and permits the next normal click. Native touch and keyboard scrolling remain.
- Source reveal/entrance timing and sticky behavior retained. Reduced motion removes hero/card transforms and keeps the short source reveal fade; content settles visible. Scrolling outside the widget is not trapped.

## Installation and configuration

1. Hosted variant: upload all four `assets/` portraits plus `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage.
2. Edit the first JSON block `bwci-profile-christie-osarenren-config`: `logoImage`, `peopleImages`, `links`, header/footer toggles and optional legal wording.
3. Paste the entire chosen output into one Custom Code element in a full-width section/row/column with zero margins/padding.
4. Verify the actual published GHL page and routes; the editor canvas is insufficient.

`peopleImages` keys: `christie-osarenren`, `alexander-alegria-saif`, `farhad-reyazat`, `gabriella-karlova`. Inline embeds those originals and the logo. Untouched `REPLACE-WITH` hosted placeholders are never requested and keep empty frames. Malformed JSON uses safe defaults.

`showHeader`/`showFooter` default true; disable for host-supplied chrome. Footer `regulatoryLine`, `registeredJurisdiction`, `companyNumber`, `registeredOffice` remain empty until configured.

Known route defaults follow existing ports: home `/`, financialEngine `/financial-engine`, ecosystem `/ecosystem`, platforms `/platforms`, smes `/smes-projects`, investors `/investors-partners`, impact `/#bwci-impact`, today `/#bwci-today`. Confirm at installation.

**Unresolved `#`:** governance, governanceBoard, leadership, governanceFramework; profileAlexanderAlegriaSaif/profileFarhadReyazat/profileGabriellaKarlova; whoWeAre/whoPurpose/whoRole/whoPrinciples/whoStory; privateInvestors, corporateIR, contact, verify; legalPrivacy/legalTerms/legalCookies/legalDisclosures/legalAccessibility/legalSitemap. Set the framework route to the hub with `#gov-framework`. Merged implementations do not establish live GHL URLs; none are invented.

## Runtime and cleanup

Existing `ghl/shared/site-chrome/site-chrome.profile.js` and profile runtime are used at build time only. Final native HTML/CSS/JS is embedded; no React, support.js, vendor imports, local modules, shared runtime URL or compiler is required. This page adds no shared changes and does not rebuild previous ports.

AbortController/fallback listeners, portrait ResizeObserver, reveal IntersectionObserver/timers, parent observer and pending bootstrap are cleaned up. Duplicate execution keeps one instance; root replacement rebinds without a scroll; removal destroys it. Deferred markup has one pending bootstrap, removed on attach or 20s timeout. Drawer body lock restores prior host overflow. Host content above/below is preserved.

## Current QA

| Check | Current result |
|---|---|
| 13 required widths 320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560 at height 900 | PASS; equal source/port heights; no horizontal overflow/JS errors; max pixel difference 0.000000% |
| 390x600,1440x600,1440x1200,844x390 landscape,1440x900 motion enabled | PASS; equal heights, no overflow/errors; max pixel difference 0.000000% |
| DOM geometry/key styles 1440x900 direct and 390x844 Board entry | PASS; zero differences across hero/GovNav/Biography/related/header/footer |
| Natural source/port content and interactions in four contexts | PASS; identical role/label/null-content/image-fit/hover/focus/sticky/resize/drag/touch/reduced-motion traces |
| Configured click/Enter/mobile-select navigation and query/hash routes | PASS; drag click suppressed, next click works |
| Hostile CSS/surrounding content 390/1440; duplicate/replacement/removal/deferred markup | PASS; no JS/network errors, cleanup and host scroll restoration verified |
| Header dropdown keyboard/hover, drawer, config/toggles/legal overrides | PASS |
| Hosted/inline portraits, untouched placeholders, fonts | PASS; all four real hosted images loaded; placeholders not requested; both fonts loaded |
| Generated runtime syntax, deterministic rebuild, original bytes, source/prior isolation | PASS |
| Actual published GHL/host wrappers/routes | NOT VERIFIED |

Source and port phone/desktop renders were inspected. Pixel comparison flags any RGB channel difference>24. Static screenshots/DOM compare fully revealed poses: QA removes pending reveal attributes only after actual content/cards/assets/fonts mount and scrolling/settling. Natural interaction tests run separately without that normalization. QA allows one explicit source remount for transient asynchronous Claude imports; warnings stay in raw logs. Source React bytes are served with canonical LF in QA so Git for Windows CRLF conversion does not break the original SRI; integrity is preserved, design files untouched. Touch uses Chrome CDP emulation, not a physical device.

## Reproduce local checks

```powershell
node ghl/pages/profile-christie-osarenren/_build/build.js
node ghl/pages/profile-christie-osarenren/_build/make-previews.js
python -m http.server 8765 --bind 127.0.0.1
# In another terminal; use the appropriate worktree base URL if serving the parent.
$env:NODE_PATH = 'PATH_TO_PLAYWRIGHT_NODE_MODULES'
$base = 'http://127.0.0.1:8765/'
$src = $base + 'design/Profile%20Christie%20Osarenren.dc.html'
$port = $base + 'ghl/pages/profile-christie-osarenren/_build/preview/plain.html'
node ghl/pages/profile-christie-osarenren/_build/shoot.js $src ghl/pages/profile-christie-osarenren/_build/preview/qa/source
node ghl/pages/profile-christie-osarenren/_build/shoot.js $port ghl/pages/profile-christie-osarenren/_build/preview/qa/port
node ghl/pages/profile-christie-osarenren/_build/domdiff.js $src $port 1440 900
node ghl/pages/profile-christie-osarenren/_build/behaviour.js $src source
node ghl/pages/profile-christie-osarenren/_build/behaviour.js $port port
node ghl/pages/profile-christie-osarenren/_build/acceptance.js $base
node -r ./ghl/pages/profile-christie-osarenren/_build/qa-browser.js ghl/shared/site-chrome/qa/chrome-lifecycle.js profile-christie-osarenren pco $base
node ghl/pages/profile-christie-osarenren/_build/chrome-behaviour.js $port port
node ghl/pages/profile-christie-osarenren/_build/header-and-lifecycle.js ($base + 'ghl/pages/profile-christie-osarenren/_build/preview/') $base
$env:BWCI_QA_SOURCE_BASE = $base
node ghl/pages/profile-christie-osarenren/_build/visual-matrix.js $base ghl/pages/profile-christie-osarenren/_build/preview/qa/extra
```

Development QA uses installed Chrome (`BWCI_QA_CHANNEL` can override). Raw captures/logs stay ignored under `_build/preview/qa/`; the tracked report contains this run's measurements. Tools never run in the GHL output. Pending-page brief requirements have been carried into this README; the temporary brief is removed at completion.
