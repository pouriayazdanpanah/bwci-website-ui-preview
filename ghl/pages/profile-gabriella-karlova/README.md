# Gabriella Karlova ? GoHighLevel profile

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

Standalone Website Builder ? Custom Code port of `design/Profile Gabriella Karlova.dc.html` and `GovProfile.dc.html`. Data/display name comes from `bwci-people.js`.

**Status (22/10/2026):** implemented; current local Chrome/Playwright QA is recorded below and in `_build/qa-results.json`. Published GHL: **NOT VERIFIED**. Independent branch from main `f13cda8`, alongside the other user-authorized profile; no auto merge.

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

- `profile-gabriella-karlova.ghl.html`: production hosted-image block; configure the first JSON section.
- `profile-gabriella-karlova.inline.ghl.html`: same block with original portraits/logo embedded; Google Fonts still load externally.
- `_build/src/profile-gabriella-karlova.{html,css,js,config.json}`: editable inputs. Generated outputs must be rebuilt, not patched directly.
- `_build/build.js`: existing Board/Leadership/Farhad/Alex scoping/pruning/config/asset pipeline and shared profile renderer.
- `assets/`: original portrait files, checked byte-for-byte by the build.
- `_build/`: development-only QA. Neither it nor any shared source file is fetched in GHL.

Root `#bwci-profile-gabriella-karlova`, prefix `pgk`, section IDs `pgk-main`, `pgk-top`, `pgk-biography`, `pgk-related`. Each script/selector is scoped to this page.

## Source inventory

The actual source was rendered/inventoried before coding. Dependencies inspected: page wrapper and `GovProfile.dc.html`; `bwci-people.js`; SiteHeader, SiteFooter, Breadcrumb, GovNav, PersonCard; `bwci-system.css`, `bwci-motion.js`, `image-slot.js`, `image-slots.state.json` and referenced assets. The page wrapper's extra `.sr` observer has no matching `.sr` elements and is omitted.

Order: shared header ? dark patterned hero with source portrait/name/roles/membership and four-item breadcrumb ? sticky GovNav ? Biography/detail values ? both return links and Also on the Board ? shared footer.

Hero portrait: `gabriella-karlova.webp` (812?1024); centred scale 1 cover in a 4:5 frame, width `min(300px,64vw)`. Source framing preserved, including Gabriella's saved scale 1 / x 0 / y 0. Related portraits keep original bytes and composition.

Biography content is null in the source: the Biography heading, empty body container and four empty detail rows remain, with **no invented biography or replacement empty-state copy**. Both source roles render on separate lines without empty entity suffixes.

Principal experience, Qualifications, Area of responsibility and Board / committee role stay empty in both cases, matching the source. LinkedIn is omitted while null. No biographical, role, regulatory or company information has been inferred.

## Entry and interactions

- Default/direct/missing/invalid `from`: **Board of Directors**. Explicit `?from=board` / `?from=leadership` switch Breadcrumb, GovNav current item and mobile select.
- One profile serves both contexts; membership labels follow source data, not the query string.
- Both Board and Leadership return links remain. Related Board cards, in order: **Alex Alegria-Seif, Dr Farhad Reyazat**. Self is excluded; related links always use `from=board`, preserving existing query/hash destinations. Unresolved `#` stays `#`.
- Source small cards retain hover lift/shadow/border/portrait zoom, view-profile overlay, emerald keyboard outline and touch overlay.
- ?767px: GovNav native select and horizontal related snap carousel; ?768px: nav list and related grid. Detail rows stack at ?560px. Hero flex wrapping/type floors match source.
- Carousel mouse drag starts after 6px, captures the pointer, disables snap during drag and suppresses its click. Pointerup/cancel restores state and the next ordinary click works. Touch/focus scrolling is native.
- Reduced motion removes hero/card transforms and keeps the source's short reveal fade; content settles visible. Window scrolling is never trapped outside the widget.

## Installation/configuration

1. For hosted output, upload all `assets/` portraits and `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage.
2. Edit the first JSON block (`bwci-profile-gabriella-karlova-config`): `logoImage`, `peopleImages`, `links`, toggles and optional footer wording.
3. Add one full-width section/row/column with zero padding/margins and one Custom Code element. Paste the entire hosted or inline file.
4. Check the actual published GHL page; the editor canvas is insufficient.

`peopleImages` keys are `gabriella-karlova` plus `alexander-alegria-saif`, `farhad-reyazat`. The inline variant embeds these images and the logo. Hosted placeholders containing `REPLACE-WITH` are never requested; their frames stay empty. Malformed JSON falls back to default behavior.

`showHeader` / `showFooter` default true; disable for a host-supplied header/footer. `footer.regulatoryLine`, `registeredJurisdiction`, `companyNumber`, `registeredOffice` stay empty until configured.

Route defaults follow existing ports: home `/`, financialEngine `/financial-engine`, ecosystem `/ecosystem`, platforms `/platforms`, smes `/smes-projects`, investors `/investors-partners`, impact `/#bwci-impact`, today `/#bwci-today`. Confirm these for installation.

**Unresolved `#`:** governance, governanceBoard, leadership, governanceFramework; related profile keys; whoWeAre/whoPurpose/whoRole/whoPrinciples/whoStory; privateInvestors, corporateIR, contact, verify; legalPrivacy/legalTerms/legalCookies/legalDisclosures/legalAccessibility/legalSitemap. The hub framework route should include `#gov-framework`. Existing port files/merged PRs do not establish actual GHL URLs; none are invented here.

## Shared implementation and cleanup

Reuses `ghl/shared/site-chrome/site-chrome.profile.js` and `site-chrome.profile.runtime.js` at build time. Complete native HTML/CSS/JS is embedded in each output; no React, support.js, vendor, local modules, external shared runtime URL or build tooling is required in GHL.

One shared build-reader fix normalizes CRLF to LF because fresh Git for Windows worktrees otherwise fail the existing `const NAV` parser. Identical fix is included in both profile PRs. Focused regression compares canonical Git LF inputs against the fresh CRLF checkout for all **11 previous chrome variants**, including Farhad/Alex: markup, CSS, runtime, routes/cards unchanged. Design files and previous output files are not edited.

Listeners use the existing AbortController/fallback cleanup. Portrait ResizeObserver, motion IntersectionObserver/timers, parent observer and pending bootstrap are cleaned up. Duplicate script keeps one instance; root replacement rebinds without requiring scroll; removal destroys it. Deferred markup has one pending bootstrap, removed on attachment/20s timeout. Drawer body-overflow locking restores the host's previous value. Other host content is preserved.

## Current QA and methodology

| Current check | Result |
|---|---|
| All 13 required widths, 320?2560px, height 900 | PASS: equal source/port document heights, zero overflow/errors; maximum image difference 0.000000% (RGB channel threshold 24) |
| 390?600, 1440?600/1200, landscape 844?390, motion-enabled 1440?900 | PASS: equal heights, no overflow/errors; maximum image difference 0.000000% |
| Final-pose DOM geometry/key styles at 1440?900 direct and 390?844 alternate entry | PASS: 0 differences for hero, GovNav, biography, related section, header/footer |
| Natural source/port content, roles, labels, all four entry contexts, self-exclusion, image fitting and interaction traces | PASS: identical traces; mouse drag and CDP touch swipe 170px, correct sticky/resize/reduced-motion behavior |
| Configured mouse/Enter/select navigation, query/hash routes, drag click suppression/next click | PASS |
| Hostile CSS/content above/below, duplicate script, immediate replacement/removal, resize, deferred markup/repeated bootstrap, scroll restoration | PASS at 390/1440 |
| Header dropdown hover/keyboard/mobile drawer, shared and page lifecycle, malformed config/toggles/legal wording/overrides | PASS, no JavaScript errors |
| Hosted/inline portraits, placeholders, Google Fonts and acceptance network | PASS; both font families loaded; no acceptance network failures |
| Fresh Windows CRLF build fix regression | PASS: 11 previous chrome variants unchanged against canonical Git LF |
| Generated JS syntax, deterministic build, original asset bytes, source/previous output isolation | PASS |
| Actual published GHL installation and wrapper behavior | NOT VERIFIED |

Source and port phone/desktop screenshots were visually inspected. Results are current executions for this profile, not prior README claims.

Static screenshot/DOM comparisons use the fully revealed pose: `qa-ready.js` waits for the actual person's full card/paragraph/image counts and fonts, scrolls through the page, then removes pending reveal tags on both sides for comparison. This is QA-only. Natural behavior/roles/membership/reduced-motion tests do not normalize these tags. The export's async component/reveal mounting may need one explicit QA remount attempt; persistent failures still fail the suite.

Source QA serves React from local canonical copies. Fresh Windows checkout CRLF conversion changes SRI hashes; `qa-routes.js` restores exact canonical LF bytes before fulfilling those two requests, preserving the source integrity checks. This change is test-only. The design and vendor files on disk remain unchanged.

## Differences and published limits

- Source image-slot edit/upload controls omitted, with original crop preserved and ordinary card Tab stops. Missing hosted images leave empty frames, following existing ports.
- Native select uses plain text options and hidden inactive layout, rather than Claude runtime wrappers.
- Native link/image dragging is suppressed only inside the related carousel. Anchor smoothing is limited to this block.
- Source asynchronous import/reveal races are not reproduced; production uses the existing root-scoped shared motion.
- Sticky header/GovNav require GHL ancestors without clipping overflow/transform constraints. Actual published GHL installation, wrapper behavior and live URLs: **NOT VERIFIED**. Local Chrome touch is emulation, not a physical-device claim.

## Reproduce

```powershell
node ghl/pages/profile-gabriella-karlova/_build/build.js
node ghl/pages/profile-gabriella-karlova/_build/make-previews.js
# Serve repo root; in worktrees use its own base path or a separate server.
python -m http.server 8765 --bind 127.0.0.1
$env:NODE_PATH = 'PATH_TO_PLAYWRIGHT_NODE_MODULES'
$src = 'http://127.0.0.1:8765/design/Profile%20Gabriella%20Karlova.dc.html'
$base = 'http://127.0.0.1:8765/'
$port = $base + 'ghl/pages/profile-gabriella-karlova/_build/preview/plain.html'
node ghl/pages/profile-gabriella-karlova/_build/shoot.js $src ghl/pages/profile-gabriella-karlova/_build/preview/qa/source
node ghl/pages/profile-gabriella-karlova/_build/shoot.js $port ghl/pages/profile-gabriella-karlova/_build/preview/qa/port
node ghl/pages/profile-gabriella-karlova/_build/domdiff.js $src $port 1440 900
node ghl/pages/profile-gabriella-karlova/_build/behaviour.js $src source
node ghl/pages/profile-gabriella-karlova/_build/behaviour.js $port port
node ghl/pages/profile-gabriella-karlova/_build/acceptance.js $base
node -r ./ghl/pages/profile-gabriella-karlova/_build/qa-browser.js ghl/shared/site-chrome/qa/chrome-lifecycle.js profile-gabriella-karlova pgk $base
node ghl/pages/profile-gabriella-karlova/_build/chrome-behaviour.js $port port
node ghl/pages/profile-gabriella-karlova/_build/header-and-lifecycle.js ($base + 'ghl/pages/profile-gabriella-karlova/_build/preview/') $base
$env:BWCI_QA_SOURCE_BASE = $base
node ghl/pages/profile-gabriella-karlova/_build/visual-matrix.js $base ghl/pages/profile-gabriella-karlova/_build/preview/qa/extra
node ghl/pages/profile-gabriella-karlova/_build/shared-regression.js
```

QA uses development Playwright with installed Chrome (`BWCI_QA_CHANNEL` can override `chrome`). Full screenshots/logs stay in ignored `_build/preview/qa/`. Current evidence is in `_build/qa-results.json`. Build/QA tools never run in the GHL block.
