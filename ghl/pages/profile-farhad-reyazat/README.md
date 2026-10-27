# Dr Farhad Reyazat — GoHighLevel profile

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

Standalone **Website Builder → Custom Code** port of `design/Profile Farhad Reyazat.dc.html` and `design/GovProfile.dc.html`. One profile handles both Board and Leadership entry contexts.

**Status (21/10/2026):** implemented and tested locally in desktop/mobile Chromium using installed Google Chrome. Published GHL installation: **NOT VERIFIED**. `design/` is unchanged.

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

## Files and maintenance

| File | Purpose |
|---|---|
| `profile-farhad-reyazat.ghl.html` | Production block; hosted logo and portraits configured at the top (~100 KB) |
| `profile-farhad-reyazat.inline.ghl.html` | Same block with embedded logo and portraits (~931 KB); fonts still use Google Fonts |
| `_build/src/profile-farhad-reyazat.{html,css,js,config.json}` | Editable page sources; change these and rebuild, rather than editing generated output |
| `_build/build.js` | Board/Leadership build pipeline: shared parts, scoped/pruned CSS, route/anchor/runtime/asset checks, both output variants |
| `assets/` | Byte-identical source portraits of Farhad, Alex and Gabriella; upload these for the hosted variant |
| `_build/` QA scripts | Development only; not loaded by the delivered block |

Unique root: `#bwci-profile-farhad-reyazat`; prefix: `pfr`; runtime instance: `window.__bwciProfileFarhadReyazat`. Section IDs: `pfr-main`, `pfr-top`, `pfr-biography`, `pfr-related`.

## Sources and verified inventory

| Source | Coverage |
|---|---|
| `design/Profile Farhad Reyazat.dc.html` | Wrapper, fonts, page tokens, header/footer and `GovProfile` slug |
| `design/GovProfile.dc.html` | Hero layout/inline styles, role and membership labels, biography/detail rows, back links, small related cards and drag behavior |
| `design/bwci-people.js` | Display name **Dr Farhad Reyazat**, source role, six biography paragraphs, Board membership, image, related membership/order; read at build time |
| `SiteHeader.dc.html`, `SiteFooter.dc.html`, `Breadcrumb.dc.html`, `GovNav.dc.html` | Shared site chrome, governance navigation, dynamic profile breadcrumb |
| `PersonCard.dc.html`, `bwci-system.css`, `bwci-motion.js` | Shared small cards, tokens/layout, entrances and root-scoped scroll reveals |
| `image-slot.js`, `image-slots.state.json` | Cover-fit portrait geometry, scale 1, centred; saved Gabriella framing is also scale 1 / x 0 / y 0 |

Portrait originals: `farhad-reyazat.jpg` 2216×2015; `alexander-alegria-saif.jpg` 1440×1665; `gabriella-karlova.webp` 812×1024. Each `assets/` copy is checked byte-for-byte by the build. The hero is 4:5, width `min(300px,64vw)`; its photo intentionally crops horizontally to cover, matching the source.

The actual source was rendered before implementation. Section order: shared header → patterned profile hero/breadcrumb/portrait/name/roles/labels → sticky GovNav → Biography and detail table → return links and Also on the Board → shared footer. No source `.sr` elements occur on this page; the wrapper's extra `.sr` observer is unnecessary.

## Installation and configuration

1. For the hosted variant, upload the three portraits and `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage.
2. Edit the **first JSON block** (`bwci-profile-farhad-reyazat-config`) with the image URLs and actual destination URLs. Use valid JSON, double quotes, no trailing comma.
3. Add one full-width GHL section/row/column with zero padding and margins, then one Custom Code element. Paste the entire hosted or inline file.
4. Check the published page; the editor canvas is not sufficient to validate custom scripts.

| Key | Purpose/default |
|---|---|
| `logoImage` | Shared header/drawer/footer logo URL; hosted placeholder until configured |
| `peopleImages.farhad-reyazat` | Hero portrait URL |
| `peopleImages.alexander-alegria-saif`, `.gabriella-karlova` | Related portraits |
| `showHeader`, `showFooter` | Both `true`; set `false` if the GHL host supplies them |
| `footer.regulatoryLine`, `.registeredJurisdiction`, `.companyNumber`, `.registeredOffice` | Empty optional fields; no new company/legal facts added |
| `links.home` | `/` |
| `links.financialEngine`, `.ecosystem`, `.platforms`, `.smes`, `.investors` | Existing project defaults `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners`; confirm for the installation |
| `links.betterWorldImpact` | `#`; independent Impact page in header/drawer/footer |
| `links.impact`, `.today` | Preserved `/#bwci-impact` legacy setting (unused by current chrome), `/#bwci-today` link |
| `links.governance`, `.governanceBoard`, `.leadership`, `.governanceFramework` | **Unresolved `#`** until actual published GHL routes are supplied. Framework should include the hub's `#gov-framework` anchor |
| `links.profileAlexanderAlegriaSaif`, `.profileGabriellaKarlova` | **Unresolved `#`**; related profiles require their actual URLs |
| Other `links` | **Unresolved `#`**: `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` |

Placeholder image URLs containing `REPLACE-WITH` are never requested; their frames remain empty. Invalid JSON falls back to source-compatible defaults. The inline variant needs no image uploads. Routes can be changed independently of images; no actual GHL domain/path has been invented for the new profiles or Governance pages.

## Entry contexts and interactions

- Direct entry, missing `from`, or invalid `from`: Board context because this person is a Board member.
- `?from=board`: Home › Governance › Board of Directors › Dr Farhad Reyazat; Board is current in GovNav.
- `?from=leadership`: corresponding Leadership breadcrumb, GovNav current item and mobile select.
- The same profile block serves both entry points. The two membership labels remain Board of Directors and Leadership in either context.
- Biography has the exact six source paragraphs. Principal experience, Qualifications, Area of responsibility and Board / committee role values stay **empty**, as in `bwci-people.js`. No inferred content or placeholder facts were added.
- Both Board and Leadership return links remain present. Related cards are **Alex Alegria-Seif** and **Gabriella Karlova**, in Board order; Farhad is excluded. Related links always append `from=board`, keeping existing query strings and putting the parameter before a hash. Unresolved `#` links stay `#`.
- Related cards use source small-card text sizing, hover lift/shadow/border/portrait zoom and overlay; the overlay is visible on touch devices. Keyboard focus has the emerald outline.
- At ≤767px, related cards become the source's horizontally scrolling snap carousel. Mouse drags start after 6px, temporarily disable snap, capture the pointer and suppress the drag-generated click. The next ordinary click works. Touch swipe and keyboard focus scrolling use native browser behavior.
- GovNav uses a desktop list from 768px and the source's native select below it. It pins below the shared sticky header. Detail rows stack at ≤560px. Hero copy wraps below its portrait when the source flex layout requires it.
- Reduced motion removes hero/portrait entrances and card transforms; shared reveal retains a short opacity fade, as in the source, and settles to visible content.

## Shared implementation and cleanup

`ghl/shared/site-chrome/site-chrome.profile.js` reads the actual GovProfile template and people data, expands its five loops, renders default markup and generates Board/Leadership breadcrumb/GovNav contexts. `site-chrome.profile.runtime.js` handles context and drag. They are **development-only** and are fully inlined by this page's build. Future people can use the same renderer with a different slug/prefix and their own folder/build/config/output; no shared runtime URL is needed.

The existing shared generator adds only opt-in `breadcrumb: 'gov-profile'` with `profile: {name, via}` and a development data accessor. Header, footer, cards, CSS and runtime output for the existing nine pages are unchanged in the regression comparison against base `05e32a1`.

Root-scoped queries/CSS and AbortController-backed listeners follow Board/Leadership. Teardown removes page/shared listeners, portrait ResizeObserver, motion IntersectionObserver/timers and the parent MutationObserver. Duplicate execution keeps one instance. Root replacement immediately destroys/rebinds without requiring scroll/resize. Repeated execution before markup has one pending bootstrap observer/timer; it is removed after attachment or after 20 seconds. Opening the drawer temporarily changes `document.body.style.overflow` and restores the host's previous value on close or teardown; other host content is untouched. Window/document listeners exist only for the shared menus/sticky layout, anchor navigation and rerender fallback.

## QA performed in this implementation

All results below are current local browser runs, not historical README results and not a published GHL claim.

| Check | Result |
|---|---|
| Source/port full-page screenshots at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560 px, height 900, reduced motion | PASS: identical document heights and zero horizontal overflow; pixel differences ≤0.003% per width (threshold: any RGB channel >24). Differences are confined to portrait rasterization; no layout difference |
| Element-tree boxes and computed styles for hero, GovNav, biography, related section, header/footer at 1440×900 direct and 390×844 `from=leadership` | PASS: 0 differences in both runs; image-slot internals checked separately by fitted image/frame measurements |
| Source and port interaction assertions: four entry contexts, source copy/empty values, self-exclusion, hover, keyboard outline, sticky bar, resizes 700/1100/320/1600, mouse drag threshold/release, CDP touch swipe, touch overlay, reduced motion | PASS on both; mouse drag and touch swipe both moved the carousel 170px; sticky bar at 77px in the desktop test |
| Configured destination navigation: mouse click, Enter, mobile select, Board/Leadership breadcrumbs, related URL query/hash handling | PASS |
| Drag suppresses accidental navigation, next ordinary click navigates | PASS |
| Existing shared chrome lifecycle QA: images, placeholders, toggles, footer wording, malformed JSON, overrides, hostile host, drawer scroll lock, duplicate execution, rerender, reduced motion | PASS; no JavaScript errors |
| Profile lifecycle: hosted local image URLs decode and refit; untouched placeholders are not requested; config reaches GovNav/breadcrumb/cards; duplicate execution and rerender/resize | PASS |
| Strong hostile-host assertions at 390/1440: generic CSS, content above/below, duplicate script, replacement without scroll, resize, removal while drawer open | PASS; no horizontal overflow, old instance destroyed, body overflow restored, surrounding content retained |
| Deferred markup and repeated bootstrap | PASS: one attached instance, no pending bootstrap after insertion |
| Shared generator regression, nine previous page configurations | PASS: chrome markup/CSS/runtime/routes/cards unchanged |
| Network, decoded portraits and required fonts | Hosted local assets and embedded portraits load; Google Fonts Plus Jakarta Sans and JetBrains Mono downloaded in Chrome; no asset/runtime request failures in acceptance run |

The shared header/drawer/breadcrumb/footer traces match the source. **Motion timing caveat:** one source trace mounted the profile after the source's global initial scan and tagged no blocks; another source run did tag them. The port uses the existing root-scoped shared motion with the same 300/1200/2600ms scans after load, avoiding reliance on asynchronous Claude component loading. Settled content and styles match; source import-race timing is not reproduced.

Additional full-page source/port checks at 390?600, 1440?600, 1440?1200, landscape 844?390 and motion-enabled 1440?900 had identical heights, no overflow and no JavaScript errors. Desktop/landscape/motion comparisons differed by at most 0.0014%. In the first short-phone source capture, the Biography heading remained hidden by source motion; the port kept it visible (0.09044% difference, entirely that heading). This is the source asynchronous scan issue described above, not missing port content. A fresh source capture at the same viewport differed by 0.00326%. Phone and desktop screenshots were visually inspected.

## Intentional differences and limits

- Editable image-slot upload/edit controls are omitted; portraits keep source composition, with one normal Tab stop per related card. Missing image URLs leave empty frames, following the existing ports.
- Native HTML `<option>` uses plain text; inactive GovNav variants are hidden rather than unmounted.
- Mouse native link/image dragging is suppressed in the carousel so the intended pointer drag remains reliable; pointer release/cancel/teardown restores interaction. No input is intercepted outside the carousel.
- Smooth scrolling is limited to this block's anchors; the host document's scrolling style is not overwritten. Animation and typography remain scoped to this page.
- Sticky header/GovNav need ancestor wrappers without scroll-clipping/transform constraints. Confirm host wrappers and the actual published installation in GHL: **NOT VERIFIED**.
- Related profiles and Governance live URLs still need configuration. The other six profile ports remain separate work and are not included in this PR.

## Rebuild and reproduce QA

```powershell
node ghl/pages/profile-farhad-reyazat/_build/build.js
node ghl/pages/profile-farhad-reyazat/_build/make-previews.js
python -m http.server 8765 --bind 127.0.0.1
```

QA requires development Playwright and installed Chrome; set `NODE_PATH` to the directory containing the `playwright` package. There is no npm/build requirement in GHL. `BWCI_QA_CHANNEL` can override `chrome` for these scripts.

```powershell
$env:NODE_PATH = 'PATH_TO_PLAYWRIGHT_NODE_MODULES'
$src = 'http://127.0.0.1:8765/design/Profile%20Farhad%20Reyazat.dc.html'
$port = 'http://127.0.0.1:8765/ghl/pages/profile-farhad-reyazat/_build/preview/plain.html'
node ghl/pages/profile-farhad-reyazat/_build/shoot.js $src output/playwright/farhad/source
node ghl/pages/profile-farhad-reyazat/_build/shoot.js $port output/playwright/farhad/port
python ghl/pages/profile-farhad-reyazat/_build/diff.py output/playwright/farhad/source output/playwright/farhad/port
node ghl/pages/profile-farhad-reyazat/_build/domdiff.js $src $port 1440 900
node ghl/pages/profile-farhad-reyazat/_build/behaviour.js $src source
node ghl/pages/profile-farhad-reyazat/_build/behaviour.js $port port
node ghl/pages/profile-farhad-reyazat/_build/chrome-behaviour.js $port port
node -r ./ghl/pages/profile-farhad-reyazat/_build/qa-browser.js ghl/shared/site-chrome/qa/chrome-lifecycle.js profile-farhad-reyazat pfr http://127.0.0.1:8765/
node ghl/pages/profile-farhad-reyazat/_build/header-and-lifecycle.js http://127.0.0.1:8765/ghl/pages/profile-farhad-reyazat/_build/preview/ http://127.0.0.1:8765/
node ghl/pages/profile-farhad-reyazat/_build/acceptance.js
node ghl/pages/profile-farhad-reyazat/_build/visual-matrix.js
node ghl/pages/profile-farhad-reyazat/_build/shared-regression.js
```

`qa-routes.js` serves the repository's React copies only to source browser tests. Production output has no React, support.js, vendor, image-slot runtime, local imports, relative design asset URLs or external shared-file dependency. Local screenshots/logs are QA artifacts; they are not required by the published block.
