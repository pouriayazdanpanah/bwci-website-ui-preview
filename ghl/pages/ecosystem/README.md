# Ecosystem — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Ecosystem.dc.html`
("The Better World Ecosystem"). The design export is the unchanged reference; everything GHL-specific
for this page lives in this folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/ecosystem/
├── ecosystem.ghl.html                  ← production block (hosted hero image)       ~140 KB
├── ecosystem.inline.ghl.html           ← self-contained block (hero image embedded) ~723 KB
├── assets/ecosystem-hero-waves.webp    ← hero artwork, 1200×668 RGBA webp (upload this to GHL)
├── _build/                             ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `design/Ecosystem.dc.html` | All markup, CSS and the `text/x-dc` component: loop state, lenses, autoplay, mechanics and participant selection, reveals |
| `design/SiteHeader.dc.html` (`current="ecosystem"`, `cta-href="#engage"`) | Sticky header, "How It Works" dropdown, mobile drawer and accordions |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.eco-i`) |
| `design/assets/eco-hero-waves.webp` | Hero artwork (1200×668, transparent). Desktop: right-hand layer at `min(64vw,1000px)`; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/ecosystem-hero-waves.webp` to **Media Storage** and copy its URL.
2. Open `ecosystem.ghl.html`. The **first block** is the configuration: paste the URL into
   `"ecosystemHeroImage"` and set the `"links"`.
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`ecosystem.inline.ghl.html` needs no upload (image embedded) but is ~723 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-ecosystem-config">
{
  "ecosystemHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/ecosystem-hero-waves.webp",
  "showHeader": true,
  "showFooter": true,
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
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer |
| `loop.defaultLens` | `"full"` | Loop lens on load: `full`, `sme`, `investor` or `partner` (source prop `defaultLens`); anything else → `full` |
| `loop.intervalSec` | `4` | Seconds per autoplay step (source prop `intervalSec`); values outside 1–60 → 4 |
| `links.home` | `/` | Header and drawer logo |
| `links.financialEngine` | `/financial-engine` | "The Financial Engine" (dropdown, drawer), footer "Financial Engine" |
| `links.platforms` | `/platforms` | "Platforms & Institutions" (header, drawer) |
| `links.smes` | `/smes-projects` | "SMEs & Projects" (header, drawer, footer) |
| `links.investors` | `/investors-partners` | "Investors & Partners" (header, drawer, footer) |
| `links.about` | `/#bwci-what` | Footer "About" |
| `links.capabilities` | `/#bwci-platforms` | Footer "Capabilities" |
| `links.governance` | `/#bwci-trust` | "Governance" (top bar, drawer, footer) |
| `links.corporate` | `/#bwci-trust` | "Corporate/IR" (top bar, drawer) |
| `links.legal` | `/#bwci-trust` | Footer "Legal & Documents" |
| `links.regulatory` | `/#bwci-trust` | Footer "Regulatory Boundaries" |
| `links.insights` | `#` | Footer "Insights" (the Main page has no Insights section yet) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section, footer "Start a Conversation" |
| `links.verify` | `/#bwci-cta` | Footer "Verify a Communication" |

The `/#bwci-…` defaults are section ids of the Main page port. Links within this page are fixed:
"Contact" and "Start a Conversation" in the header go to `#eco-engage` (source `cta-href="#engage"`);
the hero buttons go to `#eco-blueprint` and `#eco-compare`. Page ids carry an `eco-` prefix
(`#eco-hero`, `#eco-architecture`, `#eco-blueprint`, `#eco-layers`, `#eco-mechanics`, `#eco-participants`,
`#eco-flows`, `#eco-compare`, `#eco-governance`, `#eco-engage`).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header | Sticky, turns translucent once scrolled; dropdown on hover or click, closes on outside click or Escape; burger drawer below 1200 px with two accordions; scroll lock while the drawer is open |
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
4. Source header links to `#engage` point at `#eco-engage`; other pages' `.dc.html` links come from the
   config.

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
