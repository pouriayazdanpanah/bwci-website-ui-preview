# Investors & Partners — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Investors Partners.dc.html`
("Investors & Partners"). The design export is the unchanged reference; everything GHL-specific for this page
lives in this folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/investors-partners/
├── investors-partners.ghl.html          ← production block (hosted hero image)        ~112 KB
├── investors-partners.inline.ghl.html   ← self-contained block (hero image embedded)  ~2.5 MB
├── assets/inv-hero-flow.png             ← hero artwork, 2017×780 RGBA PNG, unchanged from the export (upload this to GHL)
├── _build/                              ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `design/Investors Partners.dc.html` (import 3734ca5, 2026-10-01) | All markup, CSS and the `text/x-dc` component: proposition, participation cards, methodology arc/rail/stage, perimeters, ecosystem, routes, reveals |
| `design/SiteHeader.dc.html` (`current="investors"`, `cta-href="#engage"`) | Sticky header, "How It Works" dropdown, mobile drawer and accordions (same header block as the other ports) |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.inv-i`) |
| `design/assets/inv-hero-flow.png` | Hero artwork (2017×780, transparent). Desktop: right-hand 64% of the hero, `object-fit:contain` with a left fade and a 14 s drift; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/inv-hero-flow.png` to **Media Storage** and copy its URL.
2. Open `investors-partners.ghl.html`. The **first block** is the configuration: paste the URL into
   `"investorsHeroImage"` and set the `"links"`.
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`investors-partners.inline.ghl.html` needs no upload, but it is ~2.5 MB because the 1.9 MB PNG is embedded.
Use the hosted block in production. The PNG was kept byte-identical.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-investors-partners-config">
{
  "investorsHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/inv-hero-flow.png",
  "showHeader": true,
  "showFooter": true,
  "links": { "home": "/", "financialEngine": "/financial-engine", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default
links in the markup (the image then stays empty).

| Key | Default | Used by |
|---|---|---|
| `investorsHeroImage` | placeholder (no request is made until replaced) | Hero artwork |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer |
| `links.home` | `/` | Header and drawer logo |
| `links.financialEngine` | `/financial-engine` | "The Financial Engine" (dropdown, drawer), footer "Financial Engine" |
| `links.ecosystem` | `/ecosystem` | "Ecosystem Topology" (dropdown, drawer), footer "Our Ecosystem" |
| `links.platforms` | `/platforms` | "Platforms & Institutions" (header, drawer) |
| `links.smes` | `/smes-projects` | "SMEs & Projects" (header, drawer, footer) |
| `links.smesSituation` | `/smes-projects#sme-situation` | Participation cards 02 and 03 (source `SMEs Projects.dc.html#situation`; `#sme-situation` is the SMEs port's section id) |
| `links.platformsDirectory` | `/platforms#plt-directory` | "View the full Platforms & Institutions directory →" (source `Platforms.dc.html#directory`) |
| `links.ecosystemBlueprint` | `/ecosystem#eco-blueprint` | "Explore the ecosystem →" (source `Ecosystem.dc.html#blueprint`) |
| `links.about` | `/#bwci-what` | Footer "About" |
| `links.capabilities` | `/#bwci-platforms` | Footer "Capabilities" (source `Main.dc.html#platforms`) |
| `links.governance` | `/#bwci-trust` | "Governance" (top bar, drawer, footer) |
| `links.corporate` | `/#bwci-trust` | "Corporate/IR" (top bar, drawer) |
| `links.legal` | `/#bwci-trust` | Footer "Legal & Documents" |
| `links.regulatory` | `/#bwci-trust` | Footer "Regulatory Boundaries" |
| `links.insights` | `#` | Footer "Insights" (the Main page has no Insights section yet) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |
| `links.verify` | `/#bwci-cta` | Footer "Verify a Communication" |

The `/#bwci-…` defaults are section ids of the Main page port; `#sme-…`, `#plt-…` and `#eco-…` are the section
ids of the SMEs & Projects, Platforms and Ecosystem ports. Links within this page are fixed: "Contact" and
"Start a Conversation" in the header, footer "Start a Conversation", the hero's "Start a conversation" and the
route call to action go to `#inv-engage` (source `#engage`); "See where capital can connect" goes to
`#inv-participation`; participation cards 01 and 04 go to `#inv-perimeters` and `#inv-route`; the current-page
links ("Investors & Partners" in header, drawer and footer) go to `#inv-hero`. Page ids carry an `inv-`
prefix (`#inv-hero`, `#inv-proposition`, `#inv-participation`, `#inv-methodology`, `#inv-perimeters`,
`#inv-ecosystem`, `#inv-route`, `#inv-engage`).

**Links from other pages into this one:** the Platforms port's pathway cards default to
`/investors-partners#route` and `/investors-partners#participation`. With this port the targets are
`/investors-partners#inv-route` and `/investors-partners#inv-participation`; set those two values
(`investorsRoute`, `investorsParticipation`) in the Platforms config block.

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header | Sticky, turns translucent once scrolled; dropdown on hover or click, closes on outside click or Escape; burger drawer below 1200 px with two accordions; scroll lock while the drawer is open |
| Hero | Gradient, dot field, flow artwork drifting 14 px (14 s, alternate); separate tablet and phone treatments |
| 01 A structured connection to the real economy | Three items (focusable); hovering or focusing one selects it (white card, gold edge, filled number). The heading column is sticky on desktop |
| 02 Where institutional capital could connect | Four link cards with hover lift, emerald top rule and large background number; 01 → perimeters, 02/03 → SMEs & Projects situation section, 04 → route |
| 03 How opportunities are structured | Five stages. Desktop (≥ 1024 px): arc of nodes placed from one shared angle list (−60°…60° on a 520 px wheel) with a focal line rotating to the selected node; hovering or clicking a node selects it. Below 1024 px: a five-step rail with done/current states and a growing fill. Previous / next buttons wrap round (05 → 01, 01 → 05) and a five-segment progress bar follows. The stage text is re-mounted on every change, replaying its fade-up |
| 04 Platforms and capabilities in the ecosystem | Four cards with status glyphs; Providence Asset Management is the dashed gold card (source `dp-card--v`) |
| 05 Connection without consolidation | Four items with an emerald top rule on hover |
| 06 Where do you fit? | Four route tabs; hovering, focusing or clicking one selects it. The panel is re-mounted (fade-up) and the call to action's text changes |
| Start a conversation, footer | Dark CTA; 4-column footer reflowing to 2 and 1 |
| Reveals | Section heads fade up once when 15% visible, with the source delays |

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
3. Links that pointed at other `.dc.html` pages come from the config; source `#engage` etc. point at the
   `inv-` ids.

### Source behaviour kept as is

- On phones (≤ 767 px) every data-driven text renders at 14 px (source `.sc-interp` rule).
- The arc's nodes are `<div>`s inside an `aria-hidden` column (mouse only). Keyboard users change the stage
  with the previous / next buttons, and below 1024 px with the rail's buttons, as in the source.
- The "View the full Platforms & Institutions directory →" link keeps the source's fixed inline size
  (427×14 px).
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
