# Corporate / IR — Legal Notices — GoHighLevel port

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

Independent Legal Notices page from `design/Corporate IR.dc.html#legal-notices`, inspected on merged
main `f1324c6` after Regulatory PR #32. Only the Legal Notices view is embedded. All six Corporate /
IR destinations use independent configurable page URLs; no inactive view is bundled.

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
ghl/pages/corporate-ir-legal-notices/
  _build/src/corporate-ir-legal-notices.{html,css,js,config.json}
  _build/build.js
  corporate-ir-legal-notices.ghl.html
  corporate-ir-legal-notices.inline.ghl.html
  qa/{verification.md,results.json}
```

Edit `_build/src/`, then run `node ghl/pages/corporate-ir-legal-notices/_build/build.js` to generate
both variants. Paste one complete output into one GHL Website Builder Custom Code element in a
full-width section with zero padding. Do not paste both into one document. For the hosted variant,
upload `ghl/shared/site-chrome/assets/bwci-logo.png` and set `logoImage`; inline embeds the identical
640×153 supplied PNG. Set actual published page/policy URLs in the top JSON before enabling links.
No package, build step, React, source runtime, support.js, vendor file or relative asset is required
in GHL. The GitHub Pages preview still publishes only `design/`, not these production blocks.

Root/config IDs: `bwci-corporate-ir-legal-notices` and `bwci-corporate-ir-legal-notices-config`.
Classes, data attributes, internal IDs and animations use `cil-`; the page owner is
`__bwciCorporateIRLegalNotices`. Existing shared header, labelled breadcrumb, footer, system content
styles and motion are assembled at build time. This build does not edit design, shared generators
or earlier output blocks.

## Source inspection and content

The source imports SiteHeader (`current="ir"`), Breadcrumb (`current="ir"`, label Legal notices),
SiteFooter, `bwci-system.css` and `bwci-motion.js`. `support.js`/React implement the export's hash
views, data mapping, review props, 1100px menu switch and reveal observers. Native HTML/CSS/JavaScript
replaces those design-only dependencies. The shared logo is the only image; hero dots/masks, menu
chevron, arrows, status marks and transitions retain their source composition.

The hero retains Legal notices and `Last updated: [dd Month yyyy]`; breadcrumb: Home → Corporate/IR
→ Legal notices. Below the independent section navigation is one Notice / Summary / Last updated
table. Seven rows remain in source order:

| Notice | Preserved summary |
|---|---|
| Terms of use | Conditions for using this website. |
| Privacy notice | How we collect and use personal data. |
| Cookie notice | Cookies used on this site and how to manage them. |
| Regulatory disclosures | Required statements for regulated entities. |
| Complaints procedure | How to make a complaint and escalation routes. |
| Accessibility statement | Accessibility standard and known issues. |
| Modern slavery statement | Annual statement, where applicable. |

Every row retains `[dd Mon yyyy]`. Disclosures and complaints each retain the source note
`May belong to Providence Asset Management Ltd, not BWCI PLC`. These are review notes, not a verified
assignment of policy ownership. No legal policy text, date, downloadable file or destination is invented.
Fonts remain Plus Jakarta Sans and JetBrains Mono with existing Google Fonts links/system fallbacks.

## Configuration and destinations

Top JSON exposes `logoImage`, `showHeader`, `showFooter`, `showFlags`, `footer` and `links`.
`showFlags:false` hides only the two owner-review notes; all seven rows/dates remain. It does not
approve their content or ownership. Malformed JSON retains safe fresh-block defaults. Documents,
group visibility and report filtering do not apply and are not exposed as unused settings.

The six navigation keys remain independent: `corporateIR`, `corporateIRCompanyInformation`,
`corporateIRReportsDocuments`, `corporateIRShareholders`, `corporateIRRegulatory` and
`corporateIRLegalNotices`. All default to `#` until published routes are verified. Shared routes,
including the independent `betterWorldImpact` key, retain their existing semantics; the old Main
Impact anchor is not repurposed.

Policy keys in row order are `legalTerms`, `legalPrivacy`, `legalCookies`, `legalDisclosures`,
`legalComplaints`, `legalAccessibility` and `legalModernSlavery`. All default to `#`: their source
`Legal.dc.html#…` destinations have no corresponding design/production policy content. The first,
second, third, fourth and sixth keys are also used by the shared footer, so configuring one updates
both destinations in this block. Complaints and modern slavery add page-local keys without changing
the shared generator. Footer `legalSitemap` remains a separate unresolved destination.

Unavailable links expose ARIA/title/status feedback without a hash jump; the native selector disables
unavailable destinations while retaining the current Legal Notices option. Approved display wording
is maintained in the HTML build input and rebuilt into both variants. JSON manages routes/chrome,
not a new legal-content or document-fetching system. QA URLs are never production defaults.

## Responsive behavior, runtime and differences

The section list appears above 1100px; the native selector at or below it. Tables retain the source
three-column sizing and 768–1023px spacing; rows stack at <=767px with Updated labels. The source's
mobile table header remains visible because its later row display rule overrides the header's earlier
hide rule. This cascade and all source wording/geometry are preserved. No page-specific visual
correction is applied. The header collapses below 1280px; footer grid/type/gutters use source rules.

The header and section bar stick while their containers permit it; the shorter notice list releases
the section bar at the end of main before the footer. Preserve normal wheel/touch/keyboard scrolling,
page/reveal animations, hover/focus, scoped anchors, live resize and reduced motion. Native option
text replaces DC interpolation spans; independent URLs replace source hash-view switching. Inline
CSS removes the export's delayed paint hold. Missing policy links become explicit unavailable states.

The merged Regulatory lifecycle is reused: one owner across duplicate execution; child-list observer
checks root connectivity and schedules one boot after replacement; cleanup removes listeners,
observers, timers/frames, reveal/status/menu state and restores the exact prior body overflow.
Copied disabled link attributes, unavailable option labels and optional footer regulatory text are
normalized on replacement. There is no polling/endless frame loop. Queries/CSS are scoped; shared
chrome's limited document/window listeners are cleaned up. Published GHL ancestors must still allow
sticky positioning. Older-page normalization remains in the later shared synchronization backlog.

## Current verification and reproduction

Current PASS/FAIL/NOT VERIFIED evidence and aggregate measurements are in `qa/verification.md` and
`qa/results.json`. Bulk screenshots/logs and plain/hostile host wrappers are ignored under `_build/`.
Historical results from other pages are not current verification of this port.

```sh
node ghl/pages/corporate-ir-legal-notices/_build/build.js
node ghl/pages/corporate-ir-legal-notices/_build/static-checks.js
node ghl/pages/corporate-ir-legal-notices/_build/shared-regression.js
node ghl/pages/corporate-ir-legal-notices/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/corporate-ir-legal-notices/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir-legal-notices/_build/diff.py
node ghl/pages/corporate-ir-legal-notices/_build/regression.js http://127.0.0.1:8123
```

`--checks-only` runs functional checks, `--matrix-only` the visual matrix;
`--recapture=WIDTHxHEIGHTxfalse` selects one capture. `CHROMIUM_PATH` overrides `/usr/bin/chromium`.
If Node cannot spawn Git, export the baseline with `git show f1324c6:ghl/shared/site-chrome/site-chrome.js`
to a temporary file and pass its path to `shared-regression.js`. Source React is served from existing
local vendor files only in QA; remote fonts are deliberately blocked on both sides for matching
fallback-font comparisons.

Published GHL/host conditions, actual web fonts/page/asset/policy URLs, SEO and legal approval of
policy text/ownership/applicability/date/footer wording remain **NOT VERIFIED**. This implementation
does not create the underlying seven policies. Stop at this PR. Better World & Impact starts only
after confirmed merge and refreshed main; Main/shared synchronization and final regression follow.
