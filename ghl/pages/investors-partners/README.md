# Investors & Partners — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 38/38 equal-size source/native full-page pairs are pixel-exact.
- Current source/inline feature traces: 28 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Investors Partners.dc.html`
("Investors & Partners"). The design export is the unchanged reference; everything GHL-specific for this page
lives in this folder.

**Status:** updated to the October 2026 design export (header, breadcrumb and footer from the shared
site chrome). QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/investors-partners/
├── investors-partners.ghl.html          ← production block (hosted hero image)        ~137 KB
├── investors-partners.inline.ghl.html   ← self-contained block (hero image embedded)  ~2.6 MB
├── assets/inv-hero-flow.png             ← hero artwork, 2017×780 RGBA PNG, unchanged from the export (upload this to GHL)
├── _build/                              ← dev tooling only, never loaded at runtime
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

- CSS regenerated from the current export: mobile type floors (`--fs-floor-*`) and a transition tweak; the
  directory link now carries the source's inline `max-width: 427px` (it was a fixed 427×14 px box).
- The old header and footer were replaced by the shared site chrome (new SiteHeader, Breadcrumb and SiteFooter,
  `bwci-system.css`, `bwci-motion.js`); the config gains `logoImage` and `footer`, and the old footer keys
  (`about`, `capabilities`, `corporate`, `legal`, `regulatory`, `insights`) are gone with the old footer.

## Source

| Source file | What was taken from it |
|---|---|
| `design/Investors Partners.dc.html` (import 3734ca5, 2026-10-01) | All markup, CSS and the `text/x-dc` component: proposition, participation cards, methodology arc/rail/stage, perimeters, ecosystem, routes, reveals |
| `design/SiteHeader.dc.html` (`current="investors"`), `design/Breadcrumb.dc.html`, `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome (see below) |
| `design/bwci-system.css`, `design/bwci-motion.js` | Tokens, type scale, buttons and font floors the page uses (scoped, pruned); the section fade-up on scroll |
| `design/assets/bwci-logo.png` | Logo, from `ghl/shared/site-chrome/assets/bwci-logo.png` |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.inv-i`) |
| `design/assets/inv-hero-flow.png` | Hero artwork (2017×780, transparent). Desktop: right-hand 64% of the hero, `object-fit:contain` with a left fade and a 14 s drift; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/inv-hero-flow.png` and `ghl/shared/site-chrome/assets/bwci-logo.png` to **Media Storage** and copy their URLs.
2. Open `investors-partners.ghl.html`. The **first block** is the configuration: paste the URLs into
   `"investorsHeroImage"` and `"logoImage"`, and set the `"links"` (and `"footer"` wording if needed).
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`investors-partners.inline.ghl.html` needs no upload, but it is ~2.6 MB because the 1.9 MB PNG is embedded.
Use the hosted block in production. The PNG was kept byte-identical.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-investors-partners-config">
{
  "investorsHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/inv-hero-flow.png",
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "showHeader": true,
  "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
  "links": { "home": "/", "financialEngine": "/financial-engine", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default
links in the markup (the image then stays empty).

| Key | Default | Used by |
|---|---|---|
| `investorsHeroImage` | placeholder (no request is made until replaced) | Hero artwork |
| `logoImage` | placeholder | Header, drawer and footer logo (upload `ghl/shared/site-chrome/assets/bwci-logo.png`) |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (the breadcrumb is part of the page and stays) |
| `footer.regulatoryLine` | `""` | Optional regulatory sentence above the footer legal line |
| `footer.registeredJurisdiction`, `footer.companyNumber`, `footer.registeredOffice` | `""` | Optional parts of the footer legal line (left out while empty, as in the source) |
| `links.home` | `/` | Logos, breadcrumb "Home" |
| `links.financialEngine`, `ecosystem`, `platforms`, `smes`, `investors` | `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` | Nav, dropdowns, drawer, footer |
| `links.betterWorldImpact` | `#` | Independent Better World & Impact page (header/drawer/footer); configure the verified destination |
| `links.impact`, `links.today` | `/#bwci-impact`, `/#bwci-today` | Legacy homepage Impact setting (currently unused); Today remains the homepage section link |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `leadership`, `privateInvestors`, `governance`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#` | Who We Are menu, Leadership, Private Investors, Governance, Corporate/IR, Contact, Verify, legal links — **unresolved** (see below) |
| `links.smesSituation` | `/smes-projects#sme-situation` | Participation cards 02 and 03 (source `SMEs Projects.dc.html#situation`; `#sme-situation` is the SMEs port's section id) |
| `links.platformsDirectory` | `/platforms#plt-directory` | "View the full Platforms & Institutions directory →" (source `Platforms.dc.html#directory`) |
| `links.ecosystemBlueprint` | `/ecosystem#eco-blueprint` | "Explore the ecosystem →" (source `Ecosystem.dc.html#blueprint`) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |


**Unresolved routes.** The design links the keys marked unresolved to pages that have no GHL port yet
(Governance, Governance Board, Governance Leadership, the profile pages) or that are not in the export at all
(Who We Are, Private Investors, Corporate IR, Contact, Verify a Communication, Legal). They default to `#`;
set them here once the live GHL URLs exist. No URL was invented for them.

`/#bwci-cta` is the Main port's closing section; `#sme-…`, `#plt-…` and `#eco-…` are the section ids of the
SMEs & Projects, Platforms and Ecosystem ports. Links within this page are fixed: the hero's "Start a
conversation" and the route call to action go to `#inv-engage` (source `#engage`); "See where capital can
connect" goes to `#inv-participation`; participation cards 01 and 04 go to `#inv-perimeters` and `#inv-route`.
Header, drawer and footer items for this page use its configured route (`links.investors`) and are marked `aria-current="page"`, as in the source. Page ids carry an `inv-`
prefix (`#inv-hero`, `#inv-proposition`, `#inv-participation`, `#inv-methodology`, `#inv-perimeters`,
`#inv-ecosystem`, `#inv-route`, `#inv-engage`).

**Links from other pages into this one:** the Platforms port's pathway cards and the Main port's audience
links default to `/investors-partners#inv-route`, `#inv-participation` and `#inv-engage`, so keep these ids stable.

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb | Shared site chrome — see "Header, breadcrumb and footer" below |
| Hero | Gradient, dot field, flow artwork drifting 14 px (14 s, alternate); separate tablet and phone treatments |
| 01 A structured connection to the real economy | Three items (focusable); hovering or focusing one selects it (white card, gold edge, filled number). The heading column is sticky on desktop |
| 02 Where institutional capital could connect | Four link cards with hover lift, emerald top rule and large background number; 01 → perimeters, 02/03 → SMEs & Projects situation section, 04 → route |
| 03 How opportunities are structured | Five stages. Desktop (≥ 1024 px): arc of nodes placed from one shared angle list (−60°…60° on a 520 px wheel) with a focal line rotating to the selected node; hovering or clicking a node selects it. Below 1024 px: a five-step rail with done/current states and a growing fill. Previous / next buttons wrap round (05 → 01, 01 → 05) and a five-segment progress bar follows. The stage text is re-mounted on every change, replaying its fade-up |
| 04 Platforms and capabilities in the ecosystem | Four cards with status glyphs; Providence Asset Management is the dashed gold card (source `dp-card--v`) |
| 05 Connection without consolidation | Four items with an emerald top rule on hover |
| 06 Where do you fit? | Four route tabs; hovering, focusing or clicking one selects it. The panel is re-mounted (fade-up) and the call to action's text changes |
| Start a conversation, footer | Dark CTA; 4-column footer reflowing to 2 and 1 |
| Reveals | Section heads fade up once when 15% visible, with the source delays |

## Header, breadcrumb and footer (shared site chrome)

The header, mobile drawer, breadcrumb and footer are generated by `ghl/shared/site-chrome/` (see its README)
from `design/SiteHeader.dc.html` (`current="investors"`), `design/Breadcrumb.dc.html` (`current="investors"`) and
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

`_build/src/` holds the editable source (`investors-partners.css`, `investors-partners.html`,
`investors-partners.js`, `investors-partners.config.json`). `node ghl/pages/investors-partners/_build/build.js`
generates both blocks:

- fills the `<!--view:…-->` markers in `investors-partners.html` with the default state (item 01, stage 01,
  route 01), rendered by the `VIEW` part of `investors-partners.js`, so the page data and the arc geometry
  live in one place and the static markup matches what the script produces;
- scopes every selector under `#bwci-investors-partners` and fails on any unscoped rule;
- drops selectors naming classes/ids the page can never render (149 selectors, list with `--report`) and
  unused keyframes;
- checks that every `data-inv-link` key exists in the config (and the reverse), that in-page anchors exist,
  and that no Claude Design, unpkg, vendor or local asset path remains.

The CSS keeps the source rule order (mobile overrides depend on it). Generic class names carry an `inv-`
prefix (`container`, `section`, `btn`, `h1`, `hero`, `st`, `on`, `done`, …), keyframes are `inv-` namespaced,
and element resets neutralise host typography, buttons and lists. `html`/`body` are never styled: the source's
`html{text-size-adjust:100%}` is applied to the widget root instead.

## Validation (local, headless Chromium)

### October 2026 design update — checks re-run

Local headless Chromium against the current export (`design/` at the time of this branch), with the shared
scroll motion settled before each capture:

| Check | Result |
|---|---|
| Full-page pixel diff vs the source, reduced motion, shared motion settled (`_build/shoot.js`, `diff.py`) | 0 % at 12 of 13 widths; 360 px 0.039 % (anti-aliasing; every box matches to 0.001 px); identical page heights |
| Element-by-element box and computed-style comparison at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 px (`_build/domdiff.js`) | 0 differences at every width |
| Section states × 1440/1024/768/390/320 px (`_build/states-shoot.js`) | 0 % in all 35 captures; the script now settles the shared scroll motion and scrolls the section through first |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`) | Identical |
| Shared chrome trace (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): dropdowns, keyboard, drawer, focus trap, sticky, footer, scroll motion | Identical to the source |
| Lifecycle (`chrome-lifecycle.js`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host with the script run twice (one instance, no overflow, no style leakage), GHL re-render, body overflow restored, reduced motion | All pass; no JavaScript errors |

The table below is from the original port (its header/footer rows describe the previous chrome). The page
logic it covers did not change in this update except where "October 2026 design update" above says so.

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion) | Identical page heights; 0.000% differing pixels at every width |
| With motion on (390, 768, 1440 px); at 600 px viewport height (390, 1024, 1440 px); at 1280×1200 | 0.000% |
| Section states × 1440/1024/768/390/320 px (`_build/states-shoot.js`): proposition 03 focused, stages 02/04/05 (arc and rail), route 03, route 04 keyboard focus, participation card hover | 0.000% in all 35 captures |
| Element-by-element box and computed-style comparison at 320, 390, 768, 1024 and 1440 px (`_build/domdiff.js`) | 0 differences |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`, 27 checks): proposition hover/focus, node hover/click with focal line, fill and progress, next/previous wrap-round, keyboard Enter/Space on previous, route hover/click/focus/Tab, participation links with scroll, sticky heading, node geometry, rail taps at 1023/768/390/320 px, reduced motion | Identical (including which elements are re-mounted) |
| Header, drawer, accordions, Escape, anchors, re-render recovery, duplicate execution, reduced motion (`_build/header-and-lifecycle.js`), inside the hostile host | All pass |
| Config (`_build/config.js`): inline and hosted image, untouched placeholder, header/footer off, link overrides, broken JSON | All behave as documented; no JavaScript errors |
| Hostile host (Bootstrap/normalize-like global CSS, 10 px root font, content above and below, script run twice) | Same geometry; pixel-identical apart from one anti-aliased pixel; one instance |
| Network | Only the Google Fonts stylesheet (and the hero image once configured) |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both
sides; the typeface itself must be checked on the published page. The fonts are loaded with the same
three `<link>` tags as the other GHL blocks.

## Intentional differences

1. The scroll-reveal start state (hidden, 14 px down) applies only once the script runs, so the content
   stays visible if the script never runs. With the script, the reveal is identical.
2. The source sets `html{scroll-behavior:smooth}` for the whole page. The port does not style the host
   page; it smooth-scrolls its own in-page links instead (instantly with reduced motion) and, like a native
   fragment jump, moves focus off the clicked link. Scripted or keyboard jumps elsewhere on the host page are
   instant.
3. Source links to `#engage` and other in-page ids point at the prefixed ids; links to other `.dc.html` pages come
   from the config (`#` while unresolved).

### Source behaviour kept as is

- On phones (≤ 767 px) every data-driven text renders at 14 px (source `.sc-interp` rule).
- The arc's nodes are `<div>`s inside an `aria-hidden` column (mouse only). Keyboard users change the stage
  with the previous / next buttons, and below 1024 px with the rail's buttons, as in the source.
- The "View the full Platforms & Institutions directory →" link keeps the source's inline `max-width: 427px`.
- Hovering a proposition item, a node or a route tab selects it.

## GoHighLevel notes

- The header is `position:sticky`, and so is the proposition heading (desktop); they pin only if no GHL
  wrapper around the element uses `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on
  close or teardown — the only write outside the widget.
- Background rings of adjacent sections deliberately overlap section edges (source design); the widget
  root clips them horizontally with `overflow-x: clip`.
- Listeners on `window`/`document`: scroll, resize and orientationchange (passive), header mousedown/keydown
  for the dropdown and drawer. One IntersectionObserver for the reveals. All removed on teardown or GHL
  re-render.

## Rebuild and test

```sh
node ghl/pages/investors-partners/_build/build.js            # writes both .ghl.html files
node ghl/pages/investors-partners/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/investors-partners/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/investors-partners/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/investors-partners/_build/states-shoot.js <url> <outDir>   # section state screenshots
node ghl/pages/investors-partners/_build/behaviour.js <url>               # interaction trace
node ghl/pages/investors-partners/_build/domdiff.js <sourceUrl> <portUrl> [width]
node ghl/pages/investors-partners/_build/header-and-lifecycle.js <portUrl>
node ghl/pages/investors-partners/_build/config.js http://localhost:8123/ghl/pages/investors-partners/_build/preview/
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it. The source file name
contains a space: use `design/Investors%20Partners.dc.html` in URLs.
