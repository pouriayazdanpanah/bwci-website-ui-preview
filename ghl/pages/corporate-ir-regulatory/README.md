# Corporate / IR — Regulatory — GoHighLevel port

Independent Regulatory page from `design/Corporate IR.dc.html#regulatory`, inspected from merged
main `53f0457` after Shareholders PR #31. This block embeds only the Regulatory view. All six
Corporate / IR destinations use independent configurable page URLs.

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
ghl/pages/corporate-ir-regulatory/
  _build/src/corporate-ir-regulatory.{html,css,js,config.json}
  _build/build.js
  corporate-ir-regulatory.ghl.html
  corporate-ir-regulatory.inline.ghl.html
  qa/{verification.md,results.json}
```

Edit `_build/src/`, then run `node ghl/pages/corporate-ir-regulatory/_build/build.js` to generate
both outputs. Paste one complete output into one GHL Website Builder Custom Code element in a
full-width section with zero padding. Do not paste both variants into the same document. The hosted
variant requires uploading `ghl/shared/site-chrome/assets/bwci-logo.png` and setting `logoImage`;
inline embeds the identical supplied PNG.
Set actual published routes in the top JSON before enabling cross-page links. GHL requires no build
step, package, module, React, Claude runtime, support.js, vendor file or source-relative asset.

Unique root/config IDs are `bwci-corporate-ir-regulatory` and `bwci-corporate-ir-regulatory-config`.
Classes, animation names, data attributes and internal IDs use `cirg-`; the single window owner is
`__bwciCorporateIRRegulatory`. Header, labelled breadcrumb, footer, system content styles and motion
are assembled from the existing shared generator at build time. Existing outputs and `design/` are
not edited or rebuilt by this page's build.

## Source inspection and preserved content

The source imports SiteHeader (`current="ir"`), Breadcrumb (`current="ir"` with page label),
SiteFooter, `bwci-system.css` and `bwci-motion.js`. Its text/x-dc logic uses React only to select
hash views, switch the section menu at 1100px, map source rows, toggle review badges and observe
reveals. This port uses native HTML/CSS/JavaScript and renders no inactive page views.

Preserved sections, after the hero and independent section navigation:

1. Regulatory perimeter: the complete source statement about BWCI PLC, relevant authorised entities
   and regulatory protections, dark card/dotted mask, gold label and legal-approval badge.
2. Regulated entities: Authorised entity heading; six table columns (Entity, Relationship to BWCI,
   Regulator, FRN, Permissions, Register); Providence Asset Management Ltd, `[To confirm]`, FCA,
   `[FRN]`, `[Permissions]`, View entry/arrow; relationship/FRN/permissions review badge.
3. Proposed institutions: Not yet authorised heading and complete explanatory text, Community Banking
   and its `Proposed · subject to authorisation` status. The status remains visible with flags off.

The hero says Regulatory information and retains `Last updated: [dd Month yyyy]`. The breadcrumb is
Home → Corporate/IR → Regulatory information. Names, regulatory statements and proposed status are
copied from the design, not new verification of authorisation, permissions, relationship or availability.
No FRN, permission, entity relationship, entry identifier or publication date is inferred.

Fonts remain Plus Jakarta Sans and JetBrains Mono through the existing Google Fonts links and system
fallbacks. The supplied shared PNG logo is the only image asset. The hero/card dots, masks, arrows
and status marks remain CSS/SVG. No external image lookup or page-specific artwork is needed.

## Configuration and destinations

Top JSON accepts `logoImage`, `showHeader`, `showFooter`, `showFlags`, `footer` and `links`.
`showFlags:false` hides the two approval badges; it does not remove placeholders or confirm content.
Malformed JSON retains safe defaults in fresh-block markup. Document/group/filter settings belong to
other Corporate / IR views and are not exposed here.

The six section destinations have separate keys: `corporateIR`, `corporateIRCompanyInformation`,
`corporateIRReportsDocuments`, `corporateIRShareholders`, `corporateIRRegulatory` and
`corporateIRLegalNotices`. They default to `#` until deployment routes are verified. Shared header/
footer destinations retain their existing keys, including `betterWorldImpact` for the independent
Impact page. The older Main `impact` anchor semantics are not repurposed.

`links.fcaRegisterEntry` also defaults to `#`. The design's View entry points only at
`https://register.fca.org.uk/`, a generic register homepage, while its FRN is unconfirmed. Configure
an approved exact entry URL before enabling the link. A valid destination retains `target="_blank"`
and `rel="noopener"`. This deliberate destination change avoids presenting a generic homepage as
a verified entity entry. The visible source label is preserved. No register entry is invented.

Unavailable links receive ARIA/title/status feedback and do not jump or open a blank tab. The native
mobile selector disables unavailable destinations while retaining the current Regulatory option.
Approved display copy is edited in the HTML build input and rebuilt into both variants. This is
not a data-fetching system. Local QA destinations and logo overrides never enter production defaults.

## Responsive behavior and intentional differences

Section navigation uses the source list above 1100px and native selector at or below it. Tables use
the source six-column grid, the 768–1023px tablet sizing and stacked rows at <=767px. The source's
mobile table headers remain visible because the later `.ir-tr` display rule overrides `.ir-th`;
this source cascade is preserved. The shared header collapses below 1280px, footer grid below 1024/
480px, and system type/gutters adapt at their source breakpoints.

Long approval badges are constrained to their container and may wrap. Unmodified source clips part
of the perimeter badge at 320/360/375px and the relationship badge at 320/360px. The fix also restores
the intended inner padding at 390px. Wording is unchanged. QA retains untouched source captures and
separately compares against a source reference applying only this documented CSS correction.

Native page entrance/reveal, sticky header and section bar, hover/focus, keyboard, touch, scoped
anchors and reduced motion follow the source. Plain-text native options replace DC interpolation
spans. Inline CSS removes the need for the export's delayed paint hold. Independent configured URLs
replace hash view switching.

## Runtime lifecycle and host isolation

Repeated script execution reuses one live owner. A document child-list observer checks whether the
root remains connected; root/ancestor replacement schedules one boot and tears down the old instance,
without polling or an endless animation-frame loop. The runtime cleans up listeners, observers,
timers, frames, reveal/status state and menu state. Shared chrome's limited document/window listeners
are removed. An open drawer restores the host's exact prior body overflow on close/teardown.

Copied disabled link attributes and optional footer regulatory text are normalized as in Shareholders.
This page also removes a copied unavailable native-option label after that route becomes configured.
Older-page normalization remains in the later shared synchronization backlog. Root queries and CSS
are scoped; published GHL ancestor overflow/transforms still need to permit sticky positioning.

## Current verification and reproduction

Current PASS/FAIL/NOT VERIFIED evidence and aggregate measurements live in `qa/verification.md` and
`qa/results.json`. Bulk screenshots/logs and host wrappers are ignored under `_build/qa-output/`
and `_build/preview/`. Historical page results do not establish this page's pass status.

```sh
node ghl/pages/corporate-ir-regulatory/_build/build.js
node ghl/pages/corporate-ir-regulatory/_build/static-checks.js
node ghl/pages/corporate-ir-regulatory/_build/shared-regression.js
node ghl/pages/corporate-ir-regulatory/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/corporate-ir-regulatory/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir-regulatory/_build/diff.py
node ghl/pages/corporate-ir-regulatory/_build/regression.js http://127.0.0.1:8123
```

`--checks-only` runs functional checks; `--matrix-only` captures the visual matrix separately;
`--recapture=WIDTHxHEIGHTxfalse` selects one capture. `CHROMIUM_PATH` overrides `/usr/bin/chromium`.
If Node cannot spawn Git, export `git show 53f0457:ghl/shared/site-chrome/site-chrome.js >
/tmp/cirg-chrome-baseline.js` and pass that path to `shared-regression.js`. Source React is routed
from existing local vendor files only for QA. Remote Google Fonts requests are deliberately aborted
on both sides so comparisons use matching fallback fonts.

Published GHL, actual web fonts/URLs/entry content, SEO, legal approval of perimeter/regulated-entity/
proposed-institution/footer wording and real FRN/permissions remain **NOT VERIFIED**. Stop at this
page's PR. Legal Notices starts after merge is confirmed and main refreshed.
