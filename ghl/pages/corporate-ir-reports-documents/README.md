# Corporate / IR — Reports & Documents — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 22 viewport cases (66 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 22/22 hosted/inline pairs are pixel-exact.
- 44/44 equal-size source/native full-page pairs are pixel-exact.
- All 11 current page/config checks passed; the 1100px IR navigation boundary is included.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

Independent Reports page from `design/Corporate IR.dc.html#reports-documents`, based on merged
main `224a81e` after Company Information PR #29. Only this view is embedded. The other Corporate / IR
destinations are separate configured pages; no inactive page views are bundled.

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
ghl/pages/corporate-ir-reports-documents/
  _build/
    src/corporate-ir-reports-documents.{html,css,js,config.json}
    build.js, make-previews.js, qa.js, static-checks.js, shared-regression.js, regression.js, diff.py
  corporate-ir-reports-documents.ghl.html          # hosted logo, approximately 92 KB
  corporate-ir-reports-documents.inline.ghl.html   # embedded logo, approximately 138 KB
  README.md
  qa/verification.md, results.json
```

The Overview/Company/Governance build convention is retained: insert shared chrome, scope/prune CSS,
validate route keys/anchors and browser-ready JS references, then emit two complete blocks. Current
build prunes 281 selectors and the unused media entrance. Root/config ids are
`bwci-corporate-ir-reports-documents` / same id plus `-config`; all page classes, other ids, keyframes
and hooks use `cid-`. Owner: `window.__bwciCorporateIRReportsDocuments`. No shared-generator edit or
existing-page regeneration is required for this page.

For the hosted variant, upload the supplied `ghl/shared/site-chrome/assets/bwci-logo.png` to GHL Media
Storage and configure `logoImage`. The inline variant embeds the identical source logo. There are no
other page images. Font links request Plus Jakarta Sans 400/500/600/700/800 and italic 400, JetBrains
Mono 500/600/700.

Paste **one entire output file** into **one GHL Website Builder Custom Code element** in a full-width,
zero-padding section/row/column. Set the GHL page/SEO title to “Reports & documents — Better World
Capital Investments PLC”. Configure approved metadata, real file/asset URLs and page destinations
before publication. Check the published page; the editor canvas is not runtime verification. No React,
JSX, `support.js`, vendor/local module or build step runs in GHL.

## Source content and behaviour

| Source | Port |
|---|---|
| `Corporate IR.dc.html`, Reports view | Hero without lead, unconfirmed update date, Type/Year/Search title controls, Clear filters, polite count, five source-placeholder rows, Published sort and one-page informational pager |
| Source `documents` prop | `Published` / `Launch (none)` modes, from top JSON |
| Source `showFlags` prop | Same review badges, default true; hiding flags does not confirm metadata |
| Source Corporate / IR nav | Sticky desktop list >1100px and native selector <=1100px; Reports current; independent configured URLs |
| SiteHeader current `ir`, SiteFooter, labelled IR Breadcrumb | Existing shared generator; Home → Corporate/IR → Reports & documents uses `links.corporateIR` for the parent |
| bwci-system.css / bwci-motion.js and page reveal | Source tokens, type floors, hero rings/dots and entrances, filter reveal/shared scroll motion and reduced-motion fades |

Filter layout has two columns below 900px and one below 768px. The table hides Year at 768–1023px and
stacks rows below 768px. The source mobile table header remains visible because the later `.ir-tr`
display rule overrides `.ir-th`; this appearance is retained. Input geometry is reset within this root
so unrelated GHL styles do not change the source search field.

## Top JSON settings and document records

Use plain JSON with double quotes and no trailing commas. A fresh block with malformed JSON retains
the delivered static metadata and safe unresolved links. Missing/non-array `reportDocuments` falls
back to the rendered rows; an explicit empty array means zero documents. Invalid non-object records
are ignored. Missing text fields display empty text, not invented facts.

| Setting | Default / meaning |
|---|---|
| `logoImage` | Hosted placeholder is skipped without requesting it; embedded data URI in inline variant |
| `showHeader`, `showFooter` | True; false removes that component. Without the header the section bar pins at zero |
| `showFlags` | True; false hides review badges but keeps bracketed placeholder metadata |
| `documents` | `Published` shows the configured records. `Launch (none)` disables filters/search/Clear, hides count/table/pager and shows “Documents will be published here as they are released.” Use Launch when no approved files exist |
| `reportDocuments` | Five unconfirmed source records. Replace only with approved metadata and URLs, in newest-first order |
| `footer.*` | Existing optional legal/regulatory wording fields; empty until confirmed |

Each record has this shape (the actual source placeholder, not a claimed published report):

```json
{
  "title": "[Annual report yyyy]",
  "type": "Annual report",
  "year": "[yyyy]",
  "published": "[dd Mon yyyy]",
  "file": "PDF · [size]",
  "url": "#",
  "unconfirmed": true
}
```

`title`, `type`, `year`, `published` and `file` are display text. Values render with native DOM text
operations, never HTML interpolation; the build also escapes `<` inside the JSON script block.
Type/year options derive from configured records in first-seen
order; the source defaults produce the same three types and placeholder year. A record keeps its
“To confirm” badge unless `unconfirmed` is explicitly false or all flags are hidden.

File URLs support HTTP(S) or origin-relative paths. Missing/placeholder/unsupported URLs remain `#`,
gain an ARIA unavailable state and tooltip, and announce unavailability on keyboard activation without
jumping. There are no fabricated downloads. Configuring a URL does not verify its existence or content;
document approval and real file delivery must be checked separately.

Filtering follows the source exactly: Type AND Year AND a trimmed, case-insensitive query that matches
title OR type (despite the “Search title” label). Count is the number of matches: e.g. two matches show
“Showing 1–2 of 2 documents”. Clear resets the three filters and **retains sort direction**. Sort reverses
the configured newest-first order; it does not parse unconfirmed display dates. The button's source
label/icon state is preserved and its column also gets `aria-sort`. “Previous / Page 1 of 1 / Next”
remain informational spans; no unsupported multi-page backend is invented. No matches hides table/pager
and shows the source empty message. `Published` with `reportDocuments: []` is the same zero-result state
with enabled controls; Launch is the separate disabled-control mode. `showGroup` belongs to Company
Information and is not an unused Reports setting.

## Page destinations

| Link keys | Default / use |
|---|---|
| `home`, `financialEngine`, `ecosystem`, `platforms`, `smes`, `investors`, `today` | Existing defaults `/`, `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners`, `/#bwci-today`; inherited conventions, not new live-URL assertions |
| `corporateIR` | `#`; Overview in nav, breadcrumb and shared chrome |
| `corporateIRCompanyInformation`, `corporateIRReportsDocuments`, `corporateIRShareholders`, `corporateIRRegulatory`, `corporateIRLegalNotices` | `#`; each independently configured page, including this page's own published destination |
| `betterWorldImpact` | `#`; independent Impact destination; legacy shared homepage `impact` meaning is preserved |
| `governance`, `leadership`, `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#`; unresolved shared destinations until actual published URLs are verified |

Page URLs accept absolute HTTP(S), origin-relative paths and same-page fragments. Missing destinations
are explicit unavailable links; five noncurrent mobile options are disabled until configured. The
current Reports option remains selected. Local QA destinations/logo URLs are injected in test responses
only and are absent from production defaults. File URLs live in their own records, not `links`.

## Lifecycle, differences and remaining dependencies

Reuses the merged page-owner lifecycle: duplicate execution reuses the current instance; root/ancestor
replacement tears down and boots the new root without scroll/resize. Replacement resets filters/sort
as a fresh source mount does. All filter/menu listeners, reveal observers, shared motion timers,
dropdown timeout and header frame are cleaned up. Owner destroy also disconnects its child-list
observer and pagehide listener. No polling or perpetual animation-frame loop is used.

Shared chrome has limited document keydown/mousedown and window scroll/resize/load listeners. Mobile
drawer body-overflow locking restores the exact host value on close/teardown. Other styles/queries are
scoped. Sticky behavior depends on published GHL ancestors allowing sticky children.

Intentional architecture differences: one independent page replaces the Reports hash view; metadata/
file URLs are editable JSON rather than source constants; native options use plain text; an inert
row template renders safe configurable records; filtered rows are hidden/reordered rather than React
reconciled. The source paint hold is unnecessary with inline CSS. The visible source layout, control
behaviour, placeholders and unknown shared-link guard are preserved. No shared source or older output
is changed.

No document title/year/publication date/file size, company fact, footer wording or publication readiness
is confirmed by this port. Preserve placeholders and approval flags until approved. Published GHL,
real fonts, file delivery, hosted asset URLs and production page destinations remain **NOT VERIFIED**.
Current local measurements and limits are recorded in `qa/verification.md` and `qa/results.json`.

## Reproduce current QA

```sh
node ghl/pages/corporate-ir-reports-documents/_build/build.js
node ghl/pages/corporate-ir-reports-documents/_build/static-checks.js
node ghl/pages/corporate-ir-reports-documents/_build/shared-regression.js
node ghl/pages/corporate-ir-reports-documents/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal with Playwright/Chromium and Pillow:
node ghl/pages/corporate-ir-reports-documents/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/corporate-ir-reports-documents/_build/diff.py
node ghl/pages/corporate-ir-reports-documents/_build/regression.js http://127.0.0.1:8123
```

`--checks-only` runs functional tests; `--matrix-only` captures source/inline/hosted without repeating
the interaction traces. `--recapture=WIDTHxHEIGHTxfalse` reruns a capture case into a separate result
file. `CHROMIUM_PATH` overrides `/usr/bin/chromium`. If Git cannot be spawned inside Node, export
`git show 224a81e:ghl/shared/site-chrome/site-chrome.js > /tmp/cid-chrome-baseline.js` and pass its path
to `shared-regression.js`. Source React is served from existing local vendor files only in QA; Google
fonts are deliberately blocked for matching fallback-font comparisons. Bulk captures/previews are
git-ignored. Historical QA is not current evidence.

Open one Reports PR after verification/docs, then stop. Shareholders starts after merge and refreshed main.
