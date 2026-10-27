# Corporate / IR — Shareholders — GoHighLevel port

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

- Both outputs passed 22 viewport cases (66 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 22/22 hosted/inline pairs are pixel-exact.
- 44/44 equal-size source/native full-page pairs are pixel-exact.
- All 9 current page/config checks passed; the 1100px IR navigation boundary is included.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

Independent Shareholders page from `design/Corporate IR.dc.html#shareholders`, inspected from merged
main `65a5a44` after Reports & Documents PR #30. Only this view is embedded; all six Corporate / IR
destinations have independent configurable URLs. No other page view is hidden in this block.

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

## Files, build and installation

```
ghl/pages/corporate-ir-shareholders/
  _build/
    src/corporate-ir-shareholders.{html,css,js,config.json}
    build.js, make-previews.js, qa.js, static-checks.js, shared-regression.js, regression.js, diff.py
  corporate-ir-shareholders.ghl.html          # hosted logo, approximately 79 KB
  corporate-ir-shareholders.inline.ghl.html   # embedded logo, approximately 125 KB
  README.md
  qa/verification.md, results.json
```

Follows the merged Corporate / IR/Governance build pipeline: insert shared chrome, scope/prune CSS,
check route keys/anchors and runtime references, escape JSON script content, then emit two complete
blocks. Current build prunes 283 unused selectors and the unused media entrance. Root/config ids:
`bwci-corporate-ir-shareholders` / same id plus `-config`. Other ids, classes, hooks and keyframes use
`cis-`; owner is `window.__bwciCorporateIRShareholders`. Shared generators and old outputs are unchanged.

For the hosted version upload the supplied `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media
Storage and configure its actual URL in `logoImage`. The inline version embeds that identical source
logo. There are no other page images. Font links request Plus Jakarta Sans 400/500/600/700/800 and
italic 400, JetBrains Mono 500/600/700.

Paste **one entire file** into **one GHL Website Builder Custom Code element** in a full-width,
zero-padding section/row/column. Set the page/SEO title to “Shareholder information — Better World
Capital Investments PLC”. Configure approved destinations and display copy before publishing, and
verify the published page; the GHL editor canvas does not establish runtime behavior. No React, JSX,
`support.js`, local module/vendor import or build step runs in the delivered block.

## Source content and behavior

| Source | Port |
|---|---|
| `Corporate IR.dc.html`, Shareholders view | Hero without lead and unconfirmed update date; share-status heading/statement; four share facts; two general-meeting rows; shareholder-enquiry card |
| Source `showFlags` | Same six review badges, default true; false hides badges but preserves placeholders |
| Corporate / IR nav | Sticky desktop list >1100px, native selector <=1100px; Shareholders current; separate configured page URLs replace hash view switching |
| SiteHeader current `ir`, SiteFooter and labelled IR Breadcrumb | Existing shared generator; Home → Corporate/IR → Shareholder information, parent via `links.corporateIR` |
| bwci-system.css and bwci-motion.js / page observer | Source tokens/type floors, hero rings/dots/entrances, responsive facts/table/card, staggered reveals and reduced-motion fades |

Facts stack below 561px; meeting rows stack below 768px. The source mobile table header remains visible
because the later `.ir-tr` display rule overrides `.ir-th`; that appearance is preserved. All share
classes/currency, trading status, registrar, secretary-enquiry placeholder, dates, AGM year, Notice/
Results labels, name/role, email and postal text remain the exact source copy. The secretary-enquiry
value remains plain text as in the source; no extra email action is invented.

## Top JSON configuration

Use plain JSON, double quotes and no trailing commas. Malformed JSON keeps safe markup defaults.

| Key | Default / use |
|---|---|
| `logoImage` | Hosted placeholder is skipped without requesting it; embedded data URI in inline variant |
| `showHeader`, `showFooter` | True; false removes the component. Without the built-in header, section nav pins at zero |
| `showFlags` | True; false hides review badges, not the unconfirmed placeholder wording |
| `footer.*` | Existing optional legal/regulatory wording fields, empty until confirmed |
| `links.home`, `financialEngine`, `ecosystem`, `platforms`, `smes`, `investors`, `today` | Existing defaults `/`, `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners`, `/#bwci-today`; inherited conventions, not new live-URL assertions |
| `links.corporateIR` | `#`; Overview in nav, breadcrumb and shared chrome |
| `links.corporateIRCompanyInformation`, `corporateIRReportsDocuments`, `corporateIRShareholders`, `corporateIRRegulatory`, `corporateIRLegalNotices` | `#`; each independent page, including this page's own published URL |
| `links.shareholderMeetingNotice` | `#`; first meeting row, Notice (PDF) |
| `links.shareholderMeetingResults` | `#`; second meeting row, Results (PDF), independent of the notice URL |
| `links.irEmail` | `#`; approved `mailto:` destination for the enquiry card. Source dummy `ir@domain` is not activated |
| `links.betterWorldImpact` | `#`; independent Impact destination; legacy shared homepage `impact` meaning is preserved |
| `links.governance`, `leadership`, `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#`; unresolved shared destinations until actual published URLs are verified |

Page/file URLs accept absolute HTTP(S), origin-relative paths and same-page fragments; contact links
also accept `mailto:`/`tel:`. Unavailable/placeholder values remain `#`, with disabled ARIA state,
“Not yet available” tooltip and status announcement on keyboard activation without jumping. The five
noncurrent mobile options are disabled until configured; current Shareholders stays selected. No
production path or downloadable document is invented. Local test routes and hosted-logo URL are
injected by QA only and do not appear in production defaults.

Approved display copy is edited in `_build/src/corporate-ir-shareholders.html`, then both variants
are rebuilt. Top JSON controls URLs, flags and chrome; source share facts, meetings and contact copy
are deliberately not a new data-fetching system. `showGroup` and document-list modes do not apply to
this view and are not unused settings here.

## Lifecycle and intentional differences

The merged page-owner lifecycle is retained: repeated script execution reuses the live instance;
root/ancestor replacement tears down old listeners/observers/timers/frames and schedules one boot,
without requiring scroll/resize. Copied menu/reveal/status state is reset. This page additionally
clears copied disabled-link attributes when a destination becomes configured, and removes/recreates
the optional footer regulatory line exactly once on a copied root. The broader migration of older
page runtimes remains tracked in the implementation index.

`destroy()` also disconnects the owner child-list observer and removes its pagehide listener. There is
no polling or perpetual animation-frame loop. Shared chrome's limited document keyboard/mousedown and
window scroll/resize/load listeners are cleaned up. The mobile drawer restores the host's exact prior
body overflow on close/teardown; other styles/queries remain scoped. Published GHL ancestor overflow/
transforms must still allow sticky positioning.

Architectural differences are intentional: one independent page replaces the source hash view; the
list and native selector both exist with CSS showing the source's active layout; options use plain
text instead of DC spans; external paint hold is unnecessary with inline CSS. Dummy file/email hrefs
become explicit configurable unavailable destinations, with the same source labels and appearance.
No meeting file, share-status fact, contact or publication date is fabricated.

All share facts, statement wording, meeting dates/year, Notice/Results availability, contacts, postal
details, footer wording and update date need approval. Hiding flags does not confirm them. Published
GHL, actual files/URLs, email delivery, SEO settings and real Google font rendering remain **NOT VERIFIED**.

## Current verification and reproduction

Current PASS/FAIL/NOT VERIFIED evidence is recorded in `qa/verification.md` and aggregate
`qa/results.json`. Bulk captures/raw logs and plain/hostile wrappers are git-ignored under `_build/`.
Historical results are not current verification for this port.

```sh
node ghl/pages/corporate-ir-shareholders/_build/build.js
node ghl/pages/corporate-ir-shareholders/_build/static-checks.js
node ghl/pages/corporate-ir-shareholders/_build/shared-regression.js
node ghl/pages/corporate-ir-shareholders/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/corporate-ir-shareholders/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir-shareholders/_build/diff.py
node ghl/pages/corporate-ir-shareholders/_build/regression.js http://127.0.0.1:8123
```

`--checks-only` runs functional checks; `--matrix-only` captures source/inline/hosted without repeating
those checks; `--recapture=WIDTHxHEIGHTxfalse` reruns a selected capture into a separate result file.
`CHROMIUM_PATH` overrides `/usr/bin/chromium`. If Node cannot spawn Git, export
`git show 65a5a44:ghl/shared/site-chrome/site-chrome.js > /tmp/cis-chrome-baseline.js` and pass that path
to `shared-regression.js`. Source React is served from existing local vendor copies only in QA; Google
font requests are deliberately blocked for matching fallback-font comparisons.

Open one Shareholders PR after QA/docs, then stop. Regulatory starts after merge and refreshed main.
