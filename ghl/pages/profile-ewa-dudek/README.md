# Ewa Dudek - GoHighLevel profile

## Centralized links — October 27, 2026

Navigation now uses the exact existing GHL Custom Value keys from the supplied export. Both output
variants preserve the config ID, property names and all non-link settings/images. Configure URLs in
GHL, then paste the updated block. Every used Custom Value currently contains `#`; cross-page links
remain unavailable until their confirmed URLs are set. Local anchors and profile entry context remain.

Current [mapping, validation and integration limits](../../shared/site-links/README.md) supersede the
older route/default tables below. The [local verification report](../../shared/site-links/qa/verification.md)
records this migration's checks; older QA remains historical. Actual GHL substitution inside JSON and
published navigation are **NOT VERIFIED**; no page was published or account setting changed.

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 38/38 equal-size source/native full-page pairs are pixel-exact.
- All 18 current source/inline/hosted profile scenarios passed, including four entry contexts,
  portrait/data parity, hover/focus, sticky nav, mouse drag, touch swipe and reduced motion.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

Standalone Website Builder Custom Code port of `design/Profile Ewa Dudek.dc.html` and `GovProfile.dc.html`. Display data comes from `bwci-people.js`.

**Status (22/10/2026):** implemented and checked locally in Chrome/Playwright; evidence in `_build/qa-results.json`. Published GHL: **NOT VERIFIED**. Independent `feat/ghl-profile-ewa-dudek` from main `0014375`, in the user-authorized two-profile batch. Stop at PR review; no auto merge.

## October 26, 2026 Main/shared synchronization

Historical stage 8 shared-synchronization evidence: [verification report](../../shared/site-chrome/qa/sync/verification.md) and
[aggregate results](../../shared/site-chrome/qa/sync/results.json). This update starts from merged
Impact PR #34 (`5b7fdfe`). Earlier QA sections below describe their original page revisions; they are
historical evidence, not a new full-page regression pass for these outputs.

- Header, drawer and footer now use independent `links.betterWorldImpact` (default `#`). Set the
  verified published Impact URL in this page's top JSON at installation. Unavailable links give
  accessible feedback without jumping to the top; configured links clear copied disabled state.
- Shared lifecycle handles root **or ancestor** replacement, delayed insertion and repeated script
  execution without requiring scroll/resize. Teardown restores the host's exact body overflow.
  Copied optional footer lines and native-option labels are normalized before reuse.
- Both variants passed current shared behavior at 390/1440px in a hostile host, including mocked
  HTTP image delivery for the hosted block. First execution before markup and explicit destroy/reboot
  also passed. Fonts used matching fallbacks; live GHL and actual web-font delivery remain **NOT VERIFIED**.
- That synchronization preserved page content, assets and pre-existing config values. The later
  final full-page responsive/source/interaction regression is recorded at the top of this README.

`links.impact` retains its existing homepage anchor `/#bwci-impact` as a legacy config
setting. It is not consumed by the current header/footer, and is never reassigned to the independent
Impact page. `links.today` keeps its prior meaning. Build guards allow only this named legacy unused
key; missing, unknown and other unused keys still fail.

Both outputs were regenerated with this page's existing `_build/build.js`; its content CSS is
byte-identical to merged main `5b7fdfe`. Edit `_build/src/`, then rebuild as before. Older page-local
`shared-regression.js` assertions intentionally target historical shared code; use the current central
report for this synchronization rather than relabeling those historical checks as current.

## Files and build

- `profile-ewa-dudek.ghl.html`: hosted-image production block, editable top JSON configuration.
- `profile-ewa-dudek.inline.ghl.html`: identical page with original portraits/logo embedded; Google Fonts remain external.
- `_build/src/profile-ewa-dudek.{html,css,js,config.json}`: editable build inputs.
- `_build/build.js`: existing profile/chrome generator, CSS scoping/pruning, config and original asset guards.
- `assets/`: four original portrait files copied byte-for-byte.
- `_build/`: development tools only; no build or shared module is fetched by the pasted output.

Root `#bwci-profile-ewa-dudek`, prefix `ped`; IDs `ped-main`, `ped-top`, `ped-biography`, `ped-related`. Rebuild both outputs after input changes.

## Source inventory and content

Actual wrapper read and rendered before coding. Inspected dependencies: GovProfile, bwci-people.js, SiteHeader, SiteFooter, Breadcrumb, GovNav, PersonCard, bwci-system.css, bwci-motion.js, image-slot.js, image-slots.state.json and referenced assets/fonts. support.js/React only explain source rendering and are removed from production. The wrapper's extra `.sr` observer has no matching elements and is omitted.

Order: shared header; patterned dark hero, breadcrumb, portrait, name, role, membership; sticky GovNav; Biography/detail rows; both return links and Also on the Board; shared footer.

Own portrait `ewa-dudek.webp` is RGB 480 x 480. Source cover framing is centred scale 1 within the 4:5 frame, width `min(300px,64vw)`. Original related portraits/crops are preserved, including Gabriella's saved centred scale 1 state.

One role: **Operational Manager**, no entity suffix. **Leadership** is the sole membership. There are **zero biography paragraphs**: preserve the Biography heading and empty body container, without invented placeholder copy. Principal experience, Qualifications, Area of responsibility and Board / committee role retain their empty values. Null LinkedIn is omitted. No corporate or personal facts are inferred.

## Entry and interactions

- Direct/missing/invalid `from` defaults to **Leadership**. Explicit `?from=board` and `?from=leadership` change breadcrumb/GovNav/mobile select only; membership follows source data.
- Both Board and Leadership return links remain. Related cards: **Alex Alegria-Seif, Dr Farhad Reyazat, Gabriella Karlova**, in that order. The current person is excluded. Related routes append `from=board`, preserving other query parameters/hash; unresolved `#` stays `#`.
- Cards retain hover lift, border/shadow, portrait zoom, view-profile overlay, keyboard outline and touch overlay.
- At <=767px GovNav uses a native select and related cards use horizontal snap scrolling; >=768px uses nav list/grid. Detail rows stack at <=560px; hero wraps with source type floors. Header drawer breakpoint1280px, footer1023/479px.
- Mouse carousel drag starts beyond6px, captures pointer, temporarily disables snap, suppresses the drag click, restores state on release/cancel and permits the next normal click. Native touch and keyboard scrolling remain.
- Source reveal/entrance timing and sticky behavior retained. Reduced motion removes hero/card transforms and keeps the short source reveal fade; content settles visible. Scrolling outside the widget is not trapped.

## Installation and configuration

1. Hosted variant: upload all four `assets/` portraits plus `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage.
2. Edit the first JSON block `bwci-profile-ewa-dudek-config`: `logoImage`, `peopleImages`, `links`, header/footer toggles and optional legal wording.
3. Paste the entire chosen output into one Custom Code element in a full-width section/row/column with zero margins/padding.
4. Verify the actual published GHL page and routes; the editor canvas is insufficient.

`peopleImages` keys: `ewa-dudek`, `alexander-alegria-saif`, `farhad-reyazat`, `gabriella-karlova`. Inline embeds those originals and the logo. Untouched `REPLACE-WITH` hosted placeholders are never requested and keep empty frames. Malformed JSON uses safe defaults.

`showHeader`/`showFooter` default true; disable for host-supplied chrome. Footer `regulatoryLine`, `registeredJurisdiction`, `companyNumber`, `registeredOffice` remain empty until configured.

Known route defaults follow existing ports: home `/`, financialEngine `/financial-engine`, ecosystem `/ecosystem`, platforms `/platforms`, smes `/smes-projects`, investors `/investors-partners`, impact `/#bwci-impact`, today `/#bwci-today`. Confirm at installation.

**Unresolved `#`:** governance, governanceBoard, leadership, governanceFramework; profileAlexanderAlegriaSaif/profileFarhadReyazat/profileGabriellaKarlova; whoWeAre/whoPurpose/whoRole/whoPrinciples/whoStory; privateInvestors, corporateIR, contact, verify; legalPrivacy/legalTerms/legalCookies/legalDisclosures/legalAccessibility/legalSitemap. Set the framework route to the hub with `#gov-framework`. Merged implementations do not establish live GHL URLs; none are invented.

## Runtime and cleanup

Existing `ghl/shared/site-chrome/site-chrome.profile.js` and profile runtime are used at build time only. Final native HTML/CSS/JS is embedded; no React, support.js, vendor imports, local modules, shared runtime URL or compiler is required. This page adds no shared changes and does not rebuild previous ports.

AbortController/fallback listeners, portrait ResizeObserver, reveal IntersectionObserver/timers, parent observer and pending bootstrap are cleaned up. Duplicate execution keeps one instance; root replacement rebinds without a scroll; removal destroys it. Deferred markup has one pending bootstrap, removed on attach or20s timeout. Drawer body lock restores prior host overflow. Host content above/below is preserved.

## Current QA

| Check | Current result |
|---|---|
| 13 required widths320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560 at height900 | PASS; equal source/port heights; no horizontal overflow/JS errors; max pixel difference 0.000000% |
| 390x600,1440x600,1440x1200,844x390 landscape,1440x900 motion enabled | PASS; equal heights, no overflow/errors; max pixel difference 0.000000% |
| DOM geometry/key styles1440x900 direct and390x844 Board entry | PASS; zero differences across hero/GovNav/Biography/related/header/footer |
| Natural source/port content and interactions in four contexts | PASS; identical role/label/null-content/image-fit/hover/focus/sticky/resize/drag/touch/reduced-motion traces |
| Configured click/Enter/mobile-select navigation and query/hash routes | PASS; drag click suppressed, next click works |
| Hostile CSS/surrounding content390/1440; duplicate/replacement/removal/deferred markup | PASS; no JS/network errors, cleanup and host scroll restoration verified |
| Header dropdown keyboard/hover, drawer, config/toggles/legal overrides | PASS |
| Hosted/inline portraits, untouched placeholders, fonts | PASS; all four real hosted images loaded; placeholders not requested; both fonts loaded |
| Generated runtime syntax, deterministic rebuild, original bytes, source/prior isolation | PASS |
| Actual published GHL/host wrappers/routes | NOT VERIFIED |

Source and port phone/desktop renders were inspected. Pixel comparison flags any RGB channel difference>24. Static screenshots/DOM compare fully revealed poses: QA removes pending reveal attributes only after actual content/cards/assets/fonts mount and scrolling/settling. Natural interaction tests run separately without that normalization. QA allows one explicit source remount for transient asynchronous Claude imports; warnings stay in raw logs. Source React bytes are served with canonical LF in QA so Git for Windows CRLF conversion does not break the original SRI; integrity is preserved, design files untouched. Touch uses Chrome CDP emulation, not a physical device.

## Reproduce local checks

```powershell
node ghl/pages/profile-ewa-dudek/_build/build.js
node ghl/pages/profile-ewa-dudek/_build/make-previews.js
python -m http.server 8765 --bind 127.0.0.1
# In another terminal; use the appropriate worktree base URL if serving the parent.
$env:NODE_PATH = 'PATH_TO_PLAYWRIGHT_NODE_MODULES'
$base = 'http://127.0.0.1:8765/'
$src = $base + 'design/Profile%20Ewa%20Dudek.dc.html'
$port = $base + 'ghl/pages/profile-ewa-dudek/_build/preview/plain.html'
node ghl/pages/profile-ewa-dudek/_build/shoot.js $src ghl/pages/profile-ewa-dudek/_build/preview/qa/source
node ghl/pages/profile-ewa-dudek/_build/shoot.js $port ghl/pages/profile-ewa-dudek/_build/preview/qa/port
node ghl/pages/profile-ewa-dudek/_build/domdiff.js $src $port 1440 900
node ghl/pages/profile-ewa-dudek/_build/behaviour.js $src source
node ghl/pages/profile-ewa-dudek/_build/behaviour.js $port port
node ghl/pages/profile-ewa-dudek/_build/acceptance.js $base
node -r ./ghl/pages/profile-ewa-dudek/_build/qa-browser.js ghl/shared/site-chrome/qa/chrome-lifecycle.js profile-ewa-dudek ped $base
node ghl/pages/profile-ewa-dudek/_build/chrome-behaviour.js $port port
node ghl/pages/profile-ewa-dudek/_build/header-and-lifecycle.js ($base + 'ghl/pages/profile-ewa-dudek/_build/preview/') $base
$env:BWCI_QA_SOURCE_BASE = $base
node ghl/pages/profile-ewa-dudek/_build/visual-matrix.js $base ghl/pages/profile-ewa-dudek/_build/preview/qa/extra
```

Development QA uses installed Chrome (`BWCI_QA_CHANNEL` can override). Raw captures/logs stay ignored under `_build/preview/qa/`; the tracked report contains this run's measurements. Tools never run in the GHL output. Pending-page brief requirements have been carried into this README; the temporary brief is removed at completion.
