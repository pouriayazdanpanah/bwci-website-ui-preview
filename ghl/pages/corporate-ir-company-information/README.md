# Corporate / IR — Company Information — GoHighLevel port

Independent Company Information page from `design/Corporate IR.dc.html#company-information`, inspected
from merged main `1e34f27` after Overview PR #28. The unchanged source switches six views by hash;
this block contains **only Company Information** and navigates to separate configured pages.

## October 26, 2026 Main/shared synchronization

Current shared-synchronization evidence: [verification report](../../shared/site-chrome/qa/sync/verification.md) and
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
- All page content, assets and pre-existing config values are preserved. Final full-page responsive,
  source/port and interaction regression remains a separate stage after the Impact interaction fix.

Both outputs were regenerated with this page's existing `_build/build.js`; its content CSS is
byte-identical to merged main `5b7fdfe`. Edit `_build/src/`, then rebuild as before. Older page-local
`shared-regression.js` assertions intentionally target historical shared code; use the current central
report for this synchronization rather than relabeling those historical checks as current.

## Files, build and installation

```
ghl/pages/corporate-ir-company-information/
  _build/
    src/corporate-ir-company-information.{html,css,js,config.json}
    build.js, make-previews.js, qa.js, static-checks.js, shared-regression.js, regression.js, diff.py
  corporate-ir-company-information.ghl.html          # hosted logo, approximately 81 KB
  corporate-ir-company-information.inline.ghl.html   # embedded logo, approximately 128 KB
  README.md
  qa/verification.md, results.json
```

Build inputs follow the merged Overview/Governance pipeline. Every selector is scoped to
`#bwci-corporate-ir-company-information`; ids, classes, animations and JS hooks use `cic-`.
Config id: `bwci-corporate-ir-company-information-config`; page owner:
`window.__bwciCorporateIRCompanyInformation`. The build inserts shared chrome, namespaces/prunes CSS
(283 unused selectors and the unused media entrance), validates config-link keys/anchors, rejects
source runtime references and writes both complete blocks. `_build/` never runs in GHL.

For the hosted variant, upload `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media Storage and
set its verified URL in `logoImage`. This is the source's identical supplied logo; there are no other
page images. The inline variant embeds it. Both include font links for Plus Jakarta Sans
400/500/600/700/800 and italic 400, JetBrains Mono 500/600/700.

Paste one entire output file into **one GHL Website Builder Custom Code element** inside a full-width,
zero-padding section/row/column. Set the GHL page/SEO title to “Company information — Better World
Capital Investments PLC”. Configure approved content, actual asset URLs and published destinations,
then check the published page; the GHL editor canvas does not establish runtime behavior. No React,
JSX, `support.js`, vendor import, local asset path or build process is required by the block.

## Source and preserved content

| Source | Implementation |
|---|---|
| `Corporate IR.dc.html`, Company view | Hero without a lead, placeholder update date, nine statutory facts, two name-history rows, optional group structure with parent/two subsidiary placeholders, approved-later empty state and Board cross-link |
| Source `showFlags` / `showGroup` props | Independent top-JSON booleans, both default true as in the source; all four combinations supported |
| Corporate / IR section navigation | Source desktop list above 1100px and native selector at/below 1100px; Company Information current; separate URL keys replace view-switching hashes |
| `SiteHeader.dc.html`, `SiteFooter.dc.html` | Shared generator, header current `ir`, configurable footer wording, dropdowns and mobile drawer |
| `Breadcrumb.dc.html` labelled `ir` branch | Home → Corporate/IR → Company information; parent link uses `links.corporateIR` |
| `bwci-system.css` A–E / `bwci-motion.js` and page observer | Tokens, type floors, hero rings/dots, tables/facts/tree, hero/page entrances, staggered scroll reveals and reduced-motion fades |

Name-history rows stack below 768px and statutory facts below 561px. The source's mobile table header
remains visible because its later `.ir-tr` display rule overrides `.ir-th`; that appearance is retained.
All statutory/regulatory/name/date/activity text remains exactly the source copy or placeholders.

## Top JSON configuration

Use ordinary JSON (double quotes, no trailing commas). Malformed settings retain safe markup defaults.

| Key | Default / use |
|---|---|
| `logoImage` | Hosted placeholder is skipped without requesting it; embedded data URI in inline variant |
| `showHeader`, `showFooter` | `true`; false removes that shared component. The section bar pins at zero without the built-in header |
| `showFlags` | `true`; false hides review badges, including the group approval notice. It does not remove placeholder wording or establish approval |
| `showGroup` | `true` preserves source preview defaults. False hides the tree/approval notice and shows “The group structure will be published once it has been approved.” Use false until approved group details exist |
| `footer.*` | Existing legal/regulatory wording fields, empty until confirmed |
| `links.home`, `financialEngine`, `ecosystem`, `platforms`, `smes`, `investors`, `today` | Existing project defaults `/`, `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners`, `/#bwci-today`; inherited conventions, not new live-URL assertions |
| `links.corporateIR` | `#`; Overview destination in navigation, breadcrumb and shared utility/footer |
| `links.corporateIRCompanyInformation` | `#`; this page's independently configurable published URL |
| `links.corporateIRReportsDocuments`, `corporateIRShareholders`, `corporateIRRegulatory`, `corporateIRLegalNotices` | `#`; four independent pages. Regulatory is also used by the statutory-facts cross-link |
| `links.governanceBoard` | `#`; group-section Board link (source target is Governance Board despite the wording “see Leadership”) |
| `links.betterWorldImpact` | `#`; independent Impact page in header/footer. Legacy shared `impact` semantics remain the homepage anchor and are not repurposed |
| `links.governance`, `leadership`, `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#`; unresolved shared destinations until actual published URLs are verified |

URL values support absolute HTTP(S), origin-relative paths and same-page fragments. The current select
option is Company Information; the other five options navigate to their own configured destinations.
Missing/placeholder destinations remain explicit: disabled ARIA state, “Not yet available” tooltip and
status announcement without a top-of-page jump. Unresolved mobile options are disabled and labelled.
QA injects local routes and a local hosted-logo URL only in test responses; no production URL is invented.

## Intentional differences and dependencies

1. **Independent page architecture:** source hash switching is removed. No Overview, Reports,
   Shareholders, Regulatory or Legal Notices view is embedded or hidden here. Source `documents` mode
   belongs to Overview/Reports and is not an unused Company setting.
2. **Approval notice readability:** the source notice measures about 368px in the fallback-font test
   and clips on narrow phones. Only `.cic-gate` gains `max-width:100%; white-space:normal` and its dot
   keeps its width, so the complete approval wording wraps inside the content area. Other badges retain
   source styling. Raw source captures are retained; phone comparison fixtures apply only this documented
   wrapping rule to isolate the rest of the layout. `design/` is never changed.
3. Both list/select variants are present with CSS showing only the appropriate one. Native options
   contain plain text instead of DC interpolation spans. The source paint hold is unnecessary with
   inline CSS. Smooth scrolling and CSS resets remain scoped to this widget.
4. The new shared `label` option only affects a nonempty IR breadcrumb. Existing Main, content,
   governance, profile and Overview generator outputs remain byte-identical to merged main `1e34f27`;
   the unknown-link validation guard remains active. Existing delivered page blocks are not regenerated.
5. No company name/number, jurisdiction, incorporation date, office, name history, share status,
   financial year end, group membership/activity, regulatory wording or update date is confirmed by
   this port. Keep placeholders/review flags and obtain business/legal approval before publication.

## Lifecycle and GHL compatibility

Reuses Overview's page-owner lifecycle: repeated script execution reuses the live owner; root or
ancestor replacement triggers teardown and one scheduled boot without requiring scroll/resize. Copied
status/menu/reveal state is reset. Root listeners, reveal observers, shared motion timers, dropdown
timer and header frame are disposed; owner `destroy()` also disconnects its document child-list observer
and removes its pagehide listener. No polling or perpetual animation-frame loop is used.

Shared chrome has limited document keyboard/mousedown and window scroll/resize/load listeners. Opening
the drawer temporarily writes body overflow and restores the exact prior host value on close or
teardown. Other queries/styles stay within the root. Sticky behavior still depends on published GHL
ancestors not imposing incompatible overflow/transforms.

## Verification and reproduction

Current PASS/FAIL/NOT VERIFIED results, captures and intentional source differences are recorded in
`qa/verification.md` and aggregate `qa/results.json`. Bulk captures and local plain/hostile wrappers are
git-ignored. No historical page QA establishes this page's current status. Published GHL, real Google
font rendering, approved corporate/legal content, hosted asset URLs and production destinations remain
**NOT VERIFIED**.

```sh
node ghl/pages/corporate-ir-company-information/_build/build.js
node ghl/pages/corporate-ir-company-information/_build/static-checks.js
node ghl/pages/corporate-ir-company-information/_build/shared-regression.js
node ghl/pages/corporate-ir-company-information/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/corporate-ir-company-information/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir-company-information/_build/diff.py
node ghl/pages/corporate-ir-company-information/_build/regression.js http://127.0.0.1:8123
```

If the environment prevents spawning Git inside Node, export
`git show 1e34f27:ghl/shared/site-chrome/site-chrome.js > /tmp/cic-chrome-baseline.js` and pass that file
to `shared-regression.js`. `CHROMIUM_PATH` overrides `/usr/bin/chromium`. Source React is served from
the existing local vendor files only in QA. Google font requests are deliberately blocked on both sides
for fallback-font comparisons. `--checks-only` runs functional checks; `--recapture=WIDTHxHEIGHTxfalse`
reruns a selected capture case with a separate result file.

This page gets its own PR. Stop at review; Reports & Documents starts from refreshed main after merge.
