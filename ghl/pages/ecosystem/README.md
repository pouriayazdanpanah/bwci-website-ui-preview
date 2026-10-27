# Ecosystem — GoHighLevel port

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
- 20/44 equal-size source/native full-page pairs are pixel-exact. Remaining raster differences are
  quantified in the central report.
- Current source/inline feature traces: 26 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

The central report records four source-only SVG template parser diagnostics during hydration;
neither native variant emits them.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Ecosystem.dc.html`
("The Better World Ecosystem"). The design export is the unchanged reference; everything GHL-specific
for this page lives in this folder.

**Status:** updated to the October 2026 design export (header, breadcrumb and footer from the shared
site chrome). QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/ecosystem/
├── ecosystem.ghl.html                  ← production block (hosted hero image)       ~165 KB
├── ecosystem.inline.ghl.html           ← self-contained block (hero image embedded) ~795 KB
├── assets/ecosystem-hero-waves.webp    ← hero artwork, 1200×668 RGBA webp (upload this to GHL)
├── _build/                             ← dev tooling only, never loaded at runtime
└── README.md
```

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

## October 2026 design update

- The 119 CSS lines that changed in the export were ported (mobile type floors and related tweaks).
- Fix: the scroll reveals never ran in the previous port (the `.eco-js` gate was looked up on a descendant
  instead of the root); they now fade up as in the source.
- The old header and footer were replaced by the shared site chrome (new SiteHeader, Breadcrumb and SiteFooter,
  `bwci-system.css`, `bwci-motion.js`); the config gains `logoImage` and `footer`, and the old footer keys
  (`about`, `capabilities`, `corporate`, `legal`, `regulatory`, `insights`) are gone with the old footer.

## Source

| Source file | What was taken from it |
|---|---|
| `design/Ecosystem.dc.html` | All markup, CSS and the `text/x-dc` component: loop state, lenses, autoplay, mechanics and participant selection, reveals |
| `design/SiteHeader.dc.html` (`current="ecosystem"`), `design/Breadcrumb.dc.html`, `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome (see below) |
| `design/bwci-system.css`, `design/bwci-motion.js` | Tokens, type scale, buttons and font floors the page uses (scoped, pruned); the section fade-up on scroll |
| `design/assets/bwci-logo.png` | Logo, from `ghl/shared/site-chrome/assets/bwci-logo.png` |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.eco-i`) |
| `design/assets/eco-hero-waves.webp` | Hero artwork (1200×668, transparent). Desktop: right-hand layer at `min(64vw,1000px)`; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/ecosystem-hero-waves.webp` and `ghl/shared/site-chrome/assets/bwci-logo.png` to **Media Storage** and copy their URLs.
2. Open `ecosystem.ghl.html`. The **first block** is the configuration: paste the URLs into
   `"ecosystemHeroImage"` and `"logoImage"`, and set the `"links"` (and `"footer"` wording if needed).
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`ecosystem.inline.ghl.html` needs no upload (images embedded) but is ~795 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-ecosystem-config">
{
  "ecosystemHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/ecosystem-hero-waves.webp",
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "showHeader": true,
  "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
  "loop": { "defaultLens": "full", "intervalSec": 4 },
  "links": { "home": "/", "financialEngine": "/financial-engine", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default
links in the markup and the default loop settings (the image then stays empty).

| Key | Default | Used by |
|---|---|---|
| `ecosystemHeroImage` | placeholder (no request is made until replaced) | Hero artwork |
| `logoImage` | placeholder | Header, drawer and footer logo (upload `ghl/shared/site-chrome/assets/bwci-logo.png`) |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (the breadcrumb is part of the page and stays) |
| `footer.regulatoryLine` | `""` | Optional regulatory sentence above the footer legal line |
| `footer.registeredJurisdiction`, `footer.companyNumber`, `footer.registeredOffice` | `""` | Optional parts of the footer legal line (left out while empty, as in the source) |
| `links.home` | `/` | Logos, breadcrumb "Home" |
| `links.financialEngine`, `ecosystem`, `platforms`, `smes`, `investors` | `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` | Nav, dropdowns, drawer, footer |
| `links.betterWorldImpact` | `#` | Independent Better World & Impact page (header/drawer/footer); configure the verified destination |
| `links.impact`, `links.today` | `/#bwci-impact`, `/#bwci-today` | Legacy homepage Impact setting (currently unused); Today remains the homepage section link |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `leadership`, `privateInvestors`, `governance`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#` | Who We Are menu, Leadership, Private Investors, Governance, Corporate/IR, Contact, Verify, legal links — **unresolved** (see below) |
|
**Unresolved routes.** The design links the keys marked unresolved to pages that have no GHL port yet
(Governance, Governance Board, Governance Leadership, the profile pages) or that are not in the export at all
(Who We Are, Private Investors, Corporate IR, Contact, Verify a Communication, Legal). They default to `#`;
set them here once the live GHL URLs exist. No URL was invented for them.
 `loop.defaultLens` | `"full"` | Loop lens on load: `full`, `sme`, `investor` or `partner` (source prop `defaultLens`); anything else → `full` |
| `loop.intervalSec` | `4` | Seconds per autoplay step (source prop `intervalSec`); values outside 1–60 → 4 |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |

`/#bwci-cta` is the Main port's closing section. Links within this page are fixed: the hero buttons go to
`#eco-blueprint` and `#eco-compare`. Header, drawer and footer items for this page use its configured route (`links.ecosystem`) and are marked `aria-current="page"`, as in the source. Page ids carry an `eco-` prefix
(`#eco-hero`, `#eco-architecture`, `#eco-blueprint`, `#eco-layers`, `#eco-mechanics`, `#eco-participants`,
`#eco-flows`, `#eco-compare`, `#eco-governance`, `#eco-engage`).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb | Shared site chrome — see "Header, breadcrumb and footer" below |
| Hero | Gradient, dot field, wave artwork with frame and coordinate ticks (desktop), separate tablet and phone treatments |
| How the ecosystem is organised | Three dimension rows with stacked planes, rails and hover states; each row fades in on scroll (15% visible) |
| How the ecosystem fits together (loop) | 5 steps, 4 lenses ("Show everything", business, investor, partner). Autoplay every `intervalSec`, only while the section is at least 15% on screen. Clicking a node or dot pauses; "Play the loop" resumes; choosing a lens restarts at its first step and plays. Steps outside the lens fade to 28%. Board ≥ 900 px: 1120×740 canvas scaled to fit (ResizeObserver); narrower: ring + card, with the platform status card on step 04 |
| How participants connect | 4 mechanisms (hover, focus or click) expand their text and restyle the diagram (`data-mech`); diagram entities show tooltips on hover/focus; diagram fades in on scroll |
| Who participates | 4 groups (hover, focus or click) highlight node, spoke and port; the panel's text changes and its fade-up entrance replays. Phone: 2×2 grid, no ring |
| How value circulates | 3 cards with running light lines and hover lift/icon tilt |
| Three ways to access capital | 3 model cards with hover states |
| Governance, technology and risk | 4 cards with hover states |
| Start a conversation, footer | Dark CTA panel; 4-column footer reflowing to 2 and 1 |

The loop canvas and the participants map keep the source's shared geometry: every node, label, spoke and
port is positioned from one coordinate system (canvas pixels, scaled as a unit; 0–100 map units).

## Header, breadcrumb and footer (shared site chrome)

The header, mobile drawer, breadcrumb and footer are generated by `ghl/shared/site-chrome/` (see its README)
from `design/SiteHeader.dc.html` (`current="ecosystem"`), `design/Breadcrumb.dc.html` (`current="ecosystem"`) and
`design/SiteFooter.dc.html`, together with the parts of `design/bwci-system.css` the page uses and a
root-scoped port of `design/bwci-motion.js` (the fade-up the source adds to sections as they scroll in). The
same generated chrome is in every page port.

- Utility bar, logo and five nav groups (Who We Are, How It Works, Platforms & Institutions, SMEs & Projects,
  Investors & Partners). Dropdowns open on hover for fine pointers (closing 160 ms after the pointer leaves),
  on click, or from the keyboard (ArrowDown/Up/Home/End; Escape closes and returns focus); an outside click
  or focus leaving closes them.
- The bar sticks once the utility strip has scrolled away; this is measured relative to the widget, so GHL
  content above it does not break the sticky state.
- Below 1280 px a burger opens the drawer: accordions (the current section starts open), focus moves to
  the close button and Tab stays inside, Escape and links close it, and the body scroll is locked and then
  restored to the host's own value. It closes itself when the viewport grows to 1280 px or more.
- Breadcrumb "Home › …" with the source's inline styles and hover/focus colours.
- Footer link columns, logo, legal line and bottom links; the regulatory sentence and legal-line parts come
  from the `footer` config.

## How it is built

`_build/src/` holds the editable source (`ecosystem.css`, `ecosystem.html`, `ecosystem.js`,
`ecosystem.config.json`). `node ghl/pages/ecosystem/_build/build.js` generates both blocks:

- scopes every selector under `#bwci-ecosystem` and fails on any unscoped rule;
- drops selectors naming classes/ids the page never renders (the export still carries CSS for retired
  sections and other pages; 468 selectors, list with `--report`) and unused keyframes;
- checks that every `data-eco-link` key exists in the config (and the reverse), that in-page anchors
  exist, and that no Claude Design, unpkg, vendor or local asset path remains.

The CSS keeps the source rule order (mobile overrides depend on it). Generic class names carry an `eco-`
prefix (`container`, `section`, `btn`, `h1`, `hero`, `on`, …), keyframes are `eco-` namespaced, and
element resets neutralise host typography. `html`/`body` are never styled.

## Validation (local, headless Chromium)

### October 2026 design update — checks re-run

Local headless Chromium against the current export (`design/` at the time of this branch), with the shared
scroll motion settled before each capture:

| Check | Result |
|---|---|
| Full-page pixel diff vs the source, reduced motion, shared motion settled (`_build/shoot.js`, `diff.py`) | 0 % at 1024 px and wider, identical page heights at all 13 widths; the small raster offsets left at 360 and 768 px were already in the previous port (larger there) and are not layout differences |
| Element-by-element box and computed-style comparison at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 px (`_build/domdiff.js`) | Only the SMIL dots travelling round the loop differ (1 dot at ≤ 768 px, 3 wider); everything else identical |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`) | Identical |
| Shared chrome trace (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): dropdowns, keyboard, drawer, focus trap, sticky, footer, scroll motion | Identical to the source |
| Lifecycle (`chrome-lifecycle.js`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host with the script run twice (one instance, no overflow, no style leakage), GHL re-render, body overflow restored, reduced motion | All pass; no JavaScript errors |

The table below is from the original port (its header/footer rows describe the previous chrome). The page
logic it covers did not change in this update except where "October 2026 design update" above says so.

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion so the loop and animations hold still) | Identical page heights at all widths; ≤ 0.005% differing pixels, all from the SVG dots travelling round the loop. At 768 px the source itself varies 0.35% between runs; the port matches a second source run to 0.002% |
| Same at 600 and 1200 px viewport height (390, 1024, 1440 px wide) | Identical heights, ≤ 0.005% |
| Element-by-element box and computed-style comparison at 390, 768 and 1440 px (`_build/domdiff.js`) | No differences apart from the moving loop dots |
| Hostile host (Bootstrap/normalize-like global CSS, 10 px root font, content above and below, script run twice) | Same render; page height = widget + surrounding content; no horizontal overflow |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`, 26 checks): autoplay order, lens switching, node/dot pause, play resume, off-screen hold, off-lens node, layout switch at exactly 963/964 px, live resize, phone ring and card, mechanics hover, participants hover, reduced motion | Identical |
| Header, drawer, accordions, Escape, anchors, re-render recovery, duplicate execution (`_build/header-and-lifecycle.js`) | All pass |
| Keyboard: Tab through mechanics and participants, Enter/Space on loop nodes, focus tooltips on the diagram | Identical to the source |
| Config: overrides, lens/interval, header/footer off, broken JSON, invalid values, untouched image placeholder | All behave as documented; no failed requests, no JavaScript errors |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both
sides; the typeface itself must be checked on the published page. The fonts are loaded with the same
three `<link>` tags as the Main and Financial Engine blocks.

## Intentional differences

1. The scroll-reveal start state (hidden, 14 px down) applies only once the script runs, so the content
   stays visible if the script never runs. With the script, the reveal is identical.
2. Autoplay also waits while the browser tab is hidden (the source advanced slowly in background tabs).
3. With reduced motion, the SVG dots travelling round the loop are frozen. CSS cannot stop these
   animations, so the source kept them moving.
4. Source links to `#engage` and other in-page ids point at the prefixed ids; links to other `.dc.html` pages come
   from the config (`#` while unresolved).

### Source behaviour kept as is

- On phones (≤ 767 px) every data-driven text renders at 14 px (source `.sc-interp` rule), e.g. the loop
  card title and dimension titles.
- Choosing a lens restarts autoplay even with reduced motion (the source does the same).

### Differences from the pending brief

The brief (now removed) listed lens/layer controls for the architecture section and selectable flows. The
current design renders the architecture as three static rows and the flows as three static cards, so
those controls do not exist in the source; the unused source state (`lens`, `layer`, `flow`, `cmpRows`,
`gov`, `statuses`) was not ported. The older `ghl-ecosystem-standalone` branch was built from an earlier
export (about 300 changed lines) and was not used as a base.

## GoHighLevel notes

- The header is `position:sticky`; it pins only if no GHL wrapper around the element uses
  `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on
  close or teardown — the only write outside the widget.
- Background rings of adjacent light sections deliberately overlap section edges (source design); the widget
  root clips them horizontally with `overflow-x: clip`.
- Listeners on `window`/`document`: scroll, resize and orientationchange (passive), header mousedown/keydown
  for the dropdown and drawer. One autoplay interval, one ResizeObserver and two IntersectionObservers, all
  removed on teardown or GHL re-render.

## Rebuild and test

```sh
node ghl/pages/ecosystem/_build/build.js            # writes both .ghl.html files
node ghl/pages/ecosystem/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/ecosystem/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/ecosystem/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/ecosystem/_build/behaviour.js <url>               # interaction trace
node ghl/pages/ecosystem/_build/domdiff.js <sourceUrl> <portUrl> [width]
node ghl/pages/ecosystem/_build/header-and-lifecycle.js <portUrl>
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it.
