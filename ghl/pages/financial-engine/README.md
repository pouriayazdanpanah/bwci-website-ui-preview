# Financial Engine — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 38/38 equal-size source/native full-page pairs are pixel-exact.
- Current source/inline feature traces: 40 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of the Claude Design page
`design/FinancialEngine.dc.html`. The Claude Design export in design/ is the reference; everything
GHL-specific for this page lives in this folder.

**Status:** updated to the October 2026 design export (new six-step Financial Engine loop; header,
breadcrumb and footer from the shared site chrome). QA done locally in headless Chromium (see Validation).
Not yet checked on a published GHL page.

```
ghl/pages/financial-engine/
├── financial-engine.ghl.html          ← production block (hosted images)        ~160 KB
├── financial-engine.inline.ghl.html   ← self-contained block (images embedded)  ~560 KB
├── assets/financial-engine-hero.webp  ← hero globe (upload this to GHL)
├── _build/                            ← dev tooling only, never loaded at runtime
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

## Source

| Source file | What was taken from it |
|---|---|
| `design/FinancialEngine.dc.html` | All markup, CSS and the `text/x-dc` component: operating-principle chapters, the six-step Financial Engine loop (`STEPS`, `opsStage`, `lpdReveal`), capabilities, structure, CTA |
| `design/SiteHeader.dc.html` (`current="engine"`), `design/Breadcrumb.dc.html` (`current="engine"`), `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome (see below) |
| `design/bwci-system.css`, `design/bwci-motion.js` | Tokens, type scale, buttons and font floors the page uses (scoped, pruned); the section fade-up on scroll |
| `design/support.js` | Template runtime only. Every `{{value}}` is rendered inside `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.fe-i`). React (`vendor/`) is **not needed** |
| `design/assets/2b37055061899aec512b2c880a24ac91.webp` | Hero globe (1100×766, transparent, `object-fit:contain`; `cover` + 32 % opacity behind the copy on phones) |
| `design/assets/bwci-logo.png` | Logo, from `ghl/shared/site-chrome/assets/bwci-logo.png` |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## What changed in the October 2026 export

- The seven-stage orbit and its wheel/keyboard scroll capture are gone from the design. They are replaced
  by **the Financial Engine loop**: six steps on a ring with a progress arc (`--p`), a detail card with
  previous / next buttons that wrap round (06 → 01, 01 → 06), and an accordion on tablets and phones.
  On desktop (≥ 1024 px) picking a step scrolls the detail card fully into view (source `lpdReveal`: 16 px
  gap below, never above 80 px from the top).
- Hero buttons are now "See how it works ↓" and "Discuss your need →".
- CSS regenerated from the export (mobile type floors and other tweaks) with the same transform as the newer
  ports, and the build moved to their pipeline (scoping, pruning, `VIEW` markup, link checks).
- Header, breadcrumb and footer come from the shared site chrome; the config gains `logoImage` and `footer`,
  and the old footer keys (`about`, `whatsDifferent`, `capabilities`, `corporate`, `legal`, `regulatory`,
  `insights`) are gone with the old footer.

## Installation in GoHighLevel

1. Upload `assets/financial-engine-hero.webp` and `ghl/shared/site-chrome/assets/bwci-logo.png` to
   **Media Storage** and copy their URLs.
2. Open `financial-engine.ghl.html`. The **first block** is the configuration: paste the URLs into
   `"financialEngineImage"` and `"logoImage"`, and set the `"links"` (and `"footer"` wording if needed).
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`financial-engine.inline.ghl.html` works without step 1 (images embedded as data URIs) but is ~560 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-financial-engine-config">
{
  "financialEngineImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/financial-engine-hero.webp",
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "showHeader": true,
  "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
  "links": { "home": "/", "ecosystem": "/ecosystem", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default
links in the markup (the images then stay empty).

| Key | Default | Used by |
|---|---|---|
| `financialEngineImage` | placeholder (no request is made until replaced) | Hero globe |
| `logoImage` | placeholder | Header, drawer and footer logo |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (the breadcrumb is part of the page and stays) |
| `footer.regulatoryLine` | `""` | Optional regulatory sentence above the footer legal line |
| `footer.registeredJurisdiction`, `footer.companyNumber`, `footer.registeredOffice` | `""` | Optional parts of the footer legal line (left out while empty, as in the source) |
| `links.home` | `/` | Logos, breadcrumb "Home" |
| `links.financialEngine`, `ecosystem`, `platforms`, `smes`, `investors` | `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` | Nav, dropdowns, drawer, footer |
| `links.betterWorldImpact` | `#` | Independent Better World & Impact page (header/drawer/footer); configure the verified destination |
| `links.impact`, `links.today` | `/#bwci-impact`, `/#bwci-today` | Legacy homepage Impact setting (currently unused); Today remains the homepage section link |
| `links.explorePlatforms` | `/#bwci-platforms` | Capabilities "Explore Platforms" (source `Main.dc.html#platforms`) |
| `links.startConversation` | `/#bwci-cta` | Closing section button (source `Main.dc.html#cta`) |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `leadership`, `privateInvestors`, `governance`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#` | Who We Are menu, Leadership, Private Investors, Governance, Corporate/IR, Contact, Verify, legal links — **unresolved** (see below) |

**Unresolved routes.** The design links the keys marked unresolved to pages that have no GHL port yet
(Governance, Governance Board, Governance Leadership, the profile pages) or that are not in the export at all
(Who We Are, Private Investors, Corporate IR, Contact, Verify a Communication, Legal). They default to `#`;
set them here once the live GHL URLs exist. No URL was invented for them.

Links to places on this page are fixed: the hero's "See how it works ↓" goes to `#fe-ops-model` and
"Discuss your need →" to `#fe-cta`. In-page ids carry an `fe-` prefix: `#fe-hero`, `#fe-principle`,
`#fe-ops-model`, `#fe-capabilities`, `#fe-structure`, `#fe-cta`. Header, drawer and footer items for this
page use `links.financialEngine` and are marked `aria-current="page"`, as in the source.

Behaviour tuning (developers only) stays in the `OPTIONS` object inside the `<script>`: `engRevealMin` 1024,
`engRevealGap` 16, `engRevealTop` 80 (source values).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb | Shared site chrome — see below |
| Hero | Globe artwork, two anchor buttons (smooth scroll, instant with reduced motion) |
| Operating principle | Five chapters; hover, focus or click selects one: `data-active`, the reading number, label, title, body and proof change |
| The Financial Engine loop | Six nodes, progress arc, detail card with wrapping previous / next; elements update in place (as React did), so the CSS transitions run as in the source. Desktop: the detail reveal scroll. Below 1024 px: an accordion of the same steps |
| Capabilities | Hover, focus or click makes one item active |
| Structure, closing CTA, footer | Static content with the source hover states |
| Section fade-up | `bwci-motion.js` port, scoped to the widget root |

## Header, breadcrumb and footer (shared site chrome)

The header, mobile drawer, breadcrumb and footer are generated by `ghl/shared/site-chrome/` (see its README)
from `design/SiteHeader.dc.html` (`current="engine"`), `design/Breadcrumb.dc.html` (`current="engine"`) and
`design/SiteFooter.dc.html`, together with the parts of `design/bwci-system.css` the page uses and a
root-scoped port of `design/bwci-motion.js`. The same generated chrome is in every page port.

- Utility bar, logo and five nav groups (Who We Are, How It Works, Platforms & Institutions, SMEs & Projects,
  Investors & Partners). Dropdowns open on hover for fine pointers (closing 160 ms after the pointer leaves),
  on click, or from the keyboard (ArrowDown/Up/Home/End; Escape closes and returns focus); an outside click
  or focus leaving closes them.
- The bar sticks once the utility strip has scrolled away; this is measured relative to the widget, so GHL
  content above it does not break the sticky state.
- Below 1280 px a burger opens the drawer: accordions (the current section starts open), focus moves to
  the close button and Tab stays inside, Escape and links close it, and the body scroll is locked and then
  restored to the host's own value. It closes itself when the viewport grows to 1280 px or more.
- Breadcrumb "Home › The Financial Engine" with the source's inline styles and hover/focus colours.
- Footer link columns, logo, legal line and bottom links; the regulatory sentence and legal-line parts come
  from the `footer` config.

## How it is built

`_build/src/` holds the editable source (`financial-engine.css`, `financial-engine.html`,
`financial-engine.js`, `financial-engine.config.json`). `node ghl/pages/financial-engine/_build/build.js`
generates both blocks:

- fills the `<!--view:…-->` markers with the loop's default state, rendered by the `VIEW` part of
  `financial-engine.js`, so the static markup and the script agree;
- inlines the shared site chrome (markup, CSS, runtime);
- scopes every selector under `#bwci-financial-engine` and fails on any unscoped rule or `@import`;
- drops selectors naming classes/ids the page can never render and unused keyframes;
- checks that every `data-fe-link` key exists in the config (and the reverse), that in-page anchors exist,
  and that no Claude Design, unpkg, vendor or local asset path remains.

The CSS keeps the source rule order (mobile overrides depend on it). Generic class names carry an `fe-`
prefix, `:root` tokens live on the widget root and `html`/`body` are never styled. Fonts: the same three
Google Fonts `<link>` tags as the other GHL blocks (an `@import` inside `<style>` did not load in GHL).

## Validation (local, headless Chromium)

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion, shared scroll motion settled) | Identical page heights; 0 % differing pixels at every width (at 1024 px the port equals one of two source runs, which differ from each other) |
| Element-by-element box and computed-style comparison at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 px (`_build/domdiff.js`) | 0 differences up to 1280 px. At 1440 px and wider one reported value differs: the hero's inner box reads its resolved `margin: 0 auto` as `0px 80px` in the source and `0px` in the port, with an identical box — how Chrome reports a resolved `auto` margin, not a layout difference |
| Interaction trace, source vs port (`_build/behaviour.js`): chapters hover/focus, loop nodes by click and keyboard, the desktop reveal scroll, previous / next wrap-round, Enter/Space, Shift+Tab, node hover, capabilities, tablet/phone accordion at 1023/768/390/320 px, reduced motion | Identical |
| Shared chrome trace (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): dropdowns, keyboard, drawer, focus trap, sticky, footer, motion | Identical to the source |
| Lifecycle (`chrome-lifecycle.js`, `_build/header-and-lifecycle.js`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host (aggressive global CSS, content above/below, script run twice → one instance), GHL re-render, hero anchor, reduced motion | All pass; no JavaScript errors |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both
sides; the typeface itself must be checked on the published page.

## Intentional differences

1. The header's sticky state is measured relative to the widget (not `window.scrollY`), so it stays correct
   when GHL content sits above the widget.
2. `prefers-reduced-motion`: transitions and animations become instant and scrolling is not smoothed; every
   state stays visible and interactive.
3. The source sets `html{scroll-behavior:smooth}` for the whole page. The port does not style the host page;
   it smooth-scrolls its own anchors and the reveal scroll instead.
4. Debug `console.log` calls and CSS for sections the source no longer renders were removed. The source
   still computes the old seven-stage orbit state (`OPS_STAGES`, including the "Design the Struture" typo),
   but its template no longer renders it, so it was not ported.

### Faithfully reproduced source quirks

- On phones (≤ 767 px) every data-driven string renders at **14 px** (e.g. the principle reading title),
  because the source's "readability floor" CSS targets the runtime's `.sc-interp` span. To use the intended
  heading sizes instead, delete `.fe-i` from the mobile `font-size` rules in `_build/src/financial-engine.css`
  and rebuild.
- Source copy is unchanged, including "he structure is designed…" (principle 02).

## GoHighLevel notes

- The header is `position:sticky`; it pins only if no GHL wrapper around the element uses
  `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on
  close or teardown — the only write outside the widget. The old non-passive `wheel` listener is gone with
  the orbit; all window/document listeners are passive scroll/resize plus the menus' mousedown/keydown.
- Everything is removed on teardown or GHL re-render.

## Rebuild and test

```sh
node ghl/pages/financial-engine/_build/build.js            # writes both .ghl.html files
node ghl/pages/financial-engine/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/financial-engine/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/financial-engine/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/financial-engine/_build/behaviour.js <url>               # interaction trace
node ghl/pages/financial-engine/_build/domdiff.js <sourceUrl> <portUrl> [width]
node ghl/pages/financial-engine/_build/header-and-lifecycle.js <portUrl>
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it.
