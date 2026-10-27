# Corporate / IR Overview — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 22 viewport cases (66 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 22/22 hosted/inline pairs are pixel-exact.
- 42/44 equal-size source/native full-page pairs are pixel-exact. Remaining raster differences are
  quantified in the central report.
- All 8 current page/config checks passed; the 1100px IR navigation boundary is included.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

The empty-hash Overview in `design/Corporate IR.dc.html`, ported from main `812f136`.
Only Overview content is included here. All five other Corporate / IR views now have separate
merged implementations, listed in `docs/implementation/README.md` (PRs #29–#33).

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

Both outputs were regenerated with this page's existing `_build/build.js`; its content CSS is
byte-identical to merged main `5b7fdfe`. Edit `_build/src/`, then rebuild as before. Older page-local
`shared-regression.js` assertions intentionally target historical shared code; use the current central
report for this synchronization rather than relabeling those historical checks as current.

## Delivered files and installation

```
ghl/pages/corporate-ir/
  _build/
    build.js
    src/corporate-ir.{html,css,js,config.json}
    make-previews.js, qa.js, static-checks.js, regression.js, diff.py
  corporate-ir.ghl.html          # hosted logo, approximately 90 KB
  corporate-ir.inline.ghl.html   # embedded logo, approximately 136 KB
  README.md
  qa/verification.md, results.json
```

Paste **one entire output file** into one GHL Website Builder Custom Code element in a full-width,
zero-padding section/row/column. Its JSON config is near the top. Configure verified destinations and
approved content before publication. The hosted variant requires uploading
`ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage and setting `logoImage`; the inline
variant embeds that identical supplied logo. There are no other page images. Font links explicitly
request Plus Jakarta Sans 400/500/600/700/800 and italic 400, JetBrains Mono 500/600/700.

Both blocks contain all required HTML, root-scoped CSS and isolated native JS. `_build/` is development
only; no npm, React, JSX, `support.js`, source relative paths or shared JS/CSS imports run in GHL.
Root: `#bwci-corporate-ir`; config: `#bwci-corporate-ir-config`; classes/ids/keyframes: `cir-`.

## Sources and preserved behaviour

| Source | Port |
|---|---|
| `Corporate IR.dc.html` hero and Overview | Title, lead, placeholder update date; six company facts; eight section-index rows; three latest documents; three announcements; verification guidance and two named-contact cards |
| Source `showFlags` and `documents` props | Same review badges and `Published` / `Launch (none)` modes, from top JSON |
| Source Corporate / IR nav | Sticky under the header; desktop list above 1100px, native selector at/below 1100px; Overview current in both; URL navigation instead of hash view switching |
| `SiteHeader.dc.html`, `SiteFooter.dc.html` | Existing shared generator, current `ir`, menus/dropdowns/mobile drawer, configurable footer wording; latest independent Impact destination |
| `Breadcrumb.dc.html`, current `ir` | Home → Corporate/IR with source hover/focus styles |
| `bwci-system.css` A–E | Tokens, typography floors, hero rings/dot field, cards, tables, rows and responsive rules; all classes renamed with `cir-` |
| Source `text/x-dc` observer + `bwci-motion.js` | Page entrance, staggered scroll reveals, shared section motion, source reduced-motion fades; no scroll trapping |

The layout stacks table rows below 768px, facts below 561px and the verification panel below 900px.
The build uses the Governance pipeline: insert shared chrome, scope selectors, prune unused source
rules/keyframes, check link keys and anchors, reject runtime source dependencies, then write both variants.
The current build prunes 241 selectors and the unused media entrance keyframe.

## Configuration and destinations

Use plain JSON with double quotes and no trailing commas. Malformed JSON keeps safe markup defaults.

| Key | Default / meaning |
|---|---|
| `logoImage` | Hosted placeholder skipped without making a request; data URI in inline variant |
| `showHeader`, `showFooter` | `true`; `false` removes the built-in component. Without the built-in header, section navigation sticks at zero |
| `showFlags` | `true`; `false` hides review badges, while bracketed source placeholders remain unchanged |
| `documents` | `Published` shows the source's three **unconfirmed placeholder** rows. `Launch (none)` shows “Documents will be published here as they are released.” Use launch mode if no approved documents exist |
| `footer.*` | Existing shared legal wording fields, empty until confirmed |
| `links.home`, `financialEngine`, `ecosystem`, `platforms`, `smes`, `investors`, `today` | Existing project defaults `/`, `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners`, `/#bwci-today`; inherited conventions, not newly asserted live URL verification |
| `links.corporateIR` | `#`; this Overview's published URL, utility links and current nav item |
| `links.corporateIRCompanyInformation` | `#`; independent `corporate-ir-company-information` page |
| `links.corporateIRReportsDocuments` | `#`; independent `corporate-ir-reports-documents` page, latest-document titles and “All reports & documents” |
| `links.corporateIRShareholders` | `#`; independent `corporate-ir-shareholders` page |
| `links.corporateIRRegulatory` | `#`; independent `corporate-ir-regulatory` page and regulatory fact cross-link |
| `links.corporateIRLegalNotices` | `#`; independent `corporate-ir-legal-notices` page |
| `links.betterWorldImpact` | `#`; new independent Impact page, header and footer. The shared legacy `impact` key retains its old homepage-anchor meaning; it is not consumed by this page |
| `links.announcements` | `#`; source points at `Main.dc.html#insights`, but current Main markup/outputs have no corresponding section. Explicitly unresolved |
| `links.verifyPhone`, `verifyEmail`, `irEmail`, `secretaryEmail` | `#`; set approved `tel:` / `mailto:` destinations when known. Source dummy contacts are never activated |
| `links.governance`, `governanceBoard`, `leadership`, `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#`; inherited unresolved published destinations; existing GHL implementation does not establish a live URL |

URLs support absolute HTTP(S), origin-relative paths and same-page fragments; contact links also accept
`tel:`/`mailto:`. No production path is invented. Missing/placeholder destinations stay `#`, gain
`aria-disabled="true"` and “Not yet available” tooltips, and announce unavailability on activation without
jumping to the top. Unresolved mobile options are disabled and labelled “not yet available.” The
current Overview option stays selected. Local QA routes (`/__qa__/…`) and the local hosted-logo URL are
injected by the test browser only, never saved in delivered configuration.

## Intentional differences and content dependencies

1. **Six separate pages:** source React switches six views using hashes; production requires six
   separate blocks and URLs. This block embeds only Overview; each navigation destination has a separate
   key. Company Information (including source `showGroup`) and the four other views are not bundled here.
2. Both list and selector markup exist, with CSS displaying only the source's active layout. Native
   `<option>` text contains no source interpolation spans. No React or route-hash listener is required.
3. Source `mailto:*@domain`, dummy telephone and broken/unverified design destinations are explicit
   configurable unavailable links. Document titles point to the separate Reports page as in the source;
   there are no invented download URLs or downloads. The supplied FCA scam-guidance URL is preserved.
4. The source paint hold (`.bw` hidden until external styles load) is removed because all CSS is inline.
   Source graphics/animations remain; host styles cannot change heading fonts or section backgrounds.
5. No corporate facts, document titles/dates/file sizes, update date, announcement, security claims,
   email domain, contacts, addresses or regulatory wording have been confirmed by this port. All source
   placeholders and applicable review flags remain. Obtain business/legal approval before publication.

## Lifecycle and host compatibility

One page owner (`window.__bwciCorporateIR`) reuses the running instance on repeated execution. A single
document child-list MutationObserver detects removal/replacement, including ancestor replacement without
a resize/scroll, and schedules one boot frame. Old root listeners, both reveal observers, shared motion
timers, dropdown timeout and header frame are cleaned up before initializing the replacement. Copied
reveal/menu/status state is reset. `destroy()` disconnects the owner observer and removes the pagehide
listener; no polling or continuous animation-frame loop is used.

Shared chrome owns limited document keydown/mousedown and window scroll/resize/load listeners. The
mobile drawer temporarily writes `document.body.style.overflow` and restores the host's exact previous
value on close or teardown. Other queries/styles stay within the root. Sticky positioning still depends
on GHL ancestors allowing sticky children (no interfering overflow or transforms).

## Current verification

See `_build/qa-output/results.json`, `checks.json`, `pixel-diff.json` and screenshots produced by the
commands below. Final current-run results are recorded in `qa/verification.md`; generated bulk captures
and local preview wrappers are git-ignored. Historical QA of other pages is not evidence for this port.

Live GHL installation, published URLs, approved content and external web-font delivery are
**NOT VERIFIED**. Local Chromium results do not establish any of those.

## Rebuild and verify

```sh
node ghl/pages/corporate-ir/_build/build.js
node ghl/pages/corporate-ir/_build/static-checks.js
node ghl/pages/corporate-ir/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# In another terminal, with Playwright/Chromium and Pillow available:
node ghl/pages/corporate-ir/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir/_build/diff.py
node ghl/pages/corporate-ir/_build/regression.js http://127.0.0.1:8123
# Only functional checks when captures are not needed:
node ghl/pages/corporate-ir/_build/qa.js http://127.0.0.1:8123 --checks-only
```

`CHROMIUM_PATH` overrides the test browser binary (default `/usr/bin/chromium`). Source React requests
are served from the existing `design/vendor/` copies in tests only. Google font requests are deliberately
blocked for deterministic fallback-font comparisons. No tooling or preview wrapper is shipped to GHL.

After implementation, current verification and docs, open one Overview PR and stop for manual review.
Do not start Company Information until the Overview merge is confirmed.
