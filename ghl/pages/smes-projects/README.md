# SMEs & Projects — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/SMEs Projects.dc.html`
("SMEs & Projects"). The design export is the unchanged reference; everything GHL-specific for this page
lives in this folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/smes-projects/
├── smes-projects.ghl.html          ← production block (hosted hero image)        ~107 KB
├── smes-projects.inline.ghl.html   ← self-contained block (hero image embedded)  ~538 KB
├── assets/sme-hero-flow.webp       ← hero artwork, 1400×511 RGBA WebP, unchanged from the export (upload this to GHL)
├── _build/                         ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `design/SMEs Projects.dc.html` (import 08e0a09, 2026-10-01) | All markup, CSS and the `text/x-dc` component: situations, matched capability, process steps, capability detail, operating principles, reveals |
| `design/SiteHeader.dc.html` (`current="smes"`, `cta-href="#engage"`) | Sticky header, "How It Works" dropdown, mobile drawer and accordions (same header block as the Ecosystem and Platforms ports) |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.sme-i`) |
| `design/assets/sme-hero-flow.webp` | Hero artwork (1400×511, transparent). Desktop: right-hand 64% of the hero, `object-fit:contain` with a left fade and a 14 s drift; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/sme-hero-flow.webp` to **Media Storage** and copy its URL.
2. Open `smes-projects.ghl.html`. The **first block** is the configuration: paste the URL into
   `"smesHeroImage"` and set the `"links"`.
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`smes-projects.inline.ghl.html` needs no upload (image embedded) but is ~538 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-smes-projects-config">
{
  "smesHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/sme-hero-flow.webp",
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
| `smesHeroImage` | placeholder (no request is made until replaced) | Hero artwork |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer |
| `links.home` | `/` | Header and drawer logo |
| `links.financialEngine` | `/financial-engine` | "The Financial Engine" (dropdown, drawer), footer "Financial Engine" |
| `links.ecosystem` | `/ecosystem` | "Ecosystem Topology" (dropdown, drawer), footer "Our Ecosystem" |
| `links.platforms` | `/platforms` | "Platforms & Institutions" (header, drawer) |
| `links.investors` | `/investors-partners` | "Investors & Partners" (header, drawer, footer) |
| `links.about` | `/#bwci-what` | Footer "About" |
| `links.capabilities` | `/#bwci-platforms` | Footer "Capabilities" (source `Main.dc.html#platforms`) |
| `links.governance` | `/#bwci-trust` | "Governance" (top bar, drawer, footer) |
| `links.corporate` | `/#bwci-trust` | "Corporate/IR" (top bar, drawer) |
| `links.legal` | `/#bwci-trust` | Footer "Legal & Documents" |
| `links.regulatory` | `/#bwci-trust` | Footer "Regulatory Boundaries" |
| `links.insights` | `#` | Footer "Insights" (the Main page has no Insights section yet) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |
| `links.verify` | `/#bwci-cta` | Footer "Verify a Communication" |

The `/#bwci-…` defaults are section ids of the Main page port. Links within this page are fixed:
"Contact" and "Start a Conversation" in the header, footer "Start a Conversation", "Discuss this need" and
the hero's "Start a conversation" go to `#sme-engage` (source `#engage`); "See how we approach your need"
goes to `#sme-process`; each situation card's link goes to `#sme-perimeters`; the current-page links
("SMEs & Projects" in header, drawer and footer) go to `#sme-hero`. Page ids carry an `sme-` prefix
(`#sme-hero`, `#sme-situation`, `#sme-process`, `#sme-perimeters`, `#sme-principles`, `#sme-engage`).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header | Sticky, turns translucent once scrolled; dropdown on hover or click, closes on outside click or Escape; burger drawer below 1200 px with two accordions; scroll lock while the drawer is open |
| Hero | Gradient, dot field, flow artwork drifting 14 px (14 s, alternate); separate tablet and phone treatments |
| 01 What are you trying to achieve? | Four situation cards (click, or Enter/Space when focused). The chosen card gets the emerald border, number, radio and matched-perimeter treatment, **and selects its matched capability in 03**: 01 → Trade Finance Platform, 02 and 03 → Private Capital Platform, 04 → Providence Asset Management. The card's "How … may help" link selects the card and scrolls to 03 |
| 02 How we approach your need | Five steps; hovering, focusing or clicking a step selects it: number and title shift, the sub-line appears (desktop), the reading panel text and accent colour (gold / blue for step 3 / emerald for step 5) change, and the large background step number and its ring move |
| 03 Which platforms and capabilities are relevant | Four capability buttons with status glyphs; the selected one fills emerald. The detail panel (matched capability, fit, mandate, relevance, "Discuss this need") is re-mounted when the capability changes, which replays its fade-up; it stays put when a situation keeps the same capability (02 ↔ 03) |
| 04 How we approach real economy finance | Five principle rows; hovering, focusing or clicking one opens it (height animates, gold underline grows, "+" turns into "×"); one open at a time. The heading column is sticky on desktop |
| Start a conversation, footer | Dark CTA; 4-column footer reflowing to 2 and 1 |
| Reveals | Section heads fade up once when 15% visible |

## How it is built

`_build/src/` holds the editable source (`smes-projects.css`, `smes-projects.html`, `smes-projects.js`,
`smes-projects.config.json`). `node ghl/pages/smes-projects/_build/build.js` generates both blocks:

- fills the `<!--view:…-->` markers in `smes-projects.html` with the default state (situation 01, step 01,
  capability 01, principle 01), rendered by the `VIEW` part of `smes-projects.js`, so the page data lives in
  one place and the static markup matches what the script produces;
- scopes every selector under `#bwci-smes-projects` and fails on any unscoped rule;
- drops selectors naming classes/ids the page can never render (the export carries CSS for retired hero
  tags, a perimeter strip, a principles counter and other pages; 154 selectors, list with `--report`) and
  unused keyframes;
- checks that every `data-sme-link` key exists in the config (and the reverse), that in-page anchors exist,
  and that no Claude Design, unpkg, vendor or local asset path remains.

The CSS keeps the source rule order (mobile overrides depend on it). Generic class names carry an `sme-`
prefix (`container`, `section`, `btn`, `h1`, `hero`, `st`, `pr`, …), keyframes are `sme-` namespaced, and
element resets neutralise host typography, buttons and lists. `html`/`body` are never styled: the source's
new `html{text-size-adjust:100%}` (import 08e0a09) is applied to the widget root instead, where it is
inherited by everything inside the widget.

## Validation (local, headless Chromium)

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion) | Identical page heights; 0.000% differing pixels at every width |
| Same at 600 px viewport height (390, 1024, 1440 px) | 0.000% |
| With motion on (390, 768, 1440 px) | 0.000% at 390 and 768; 0.009% at 1440 from the hero drift's timing and an area where the source differs from itself between runs |
| Section states × 1440/1024/768/390/320 px (`_build/states-shoot.js`): situation 04 and its effect on 03, steps 3, 4 and 5 (three accent colours), capability 04, principle 04 open, keyboard focus ring on a card link | 0.000% in all 40 captures |
| Element-by-element box and computed-style comparison at 320, 390, 768, 1024 and 1440 px (`_build/domdiff.js`) | 0 differences |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`, 28 checks): every situation and its matched capability, same-capability switch without re-mount, Enter/Space on cards and on the card link, link click with scroll to 03, hover/focus/click on every step, capability clicks including the current one, principle hover/click/focus with open heights, sticky heading, touch at 768 and 390 px, reduced motion | Identical |
| Header, drawer, accordions, Escape, anchors, re-render recovery, duplicate execution, reduced motion (`_build/header-and-lifecycle.js`), inside the hostile host | All pass |
| Config (`_build/config.js`): inline and hosted image, untouched placeholder, header/footer off, link overrides, broken JSON | All behave as documented; no JavaScript errors |
| Hostile host (Bootstrap/normalize-like global CSS, 10 px root font, content above and below, script run twice) | Same geometry to the subpixel; pixel-identical apart from the last rows where the host's own content begins below the widget; one instance |
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
3. Source header links to `#engage` point at `#sme-engage`; other pages' `.dc.html` links come from the
   config.

### Source behaviour kept as is

- On phones (≤ 767 px) every data-driven text renders at 14 px (source `.sc-interp` rule), e.g. card titles,
  step titles and the capability detail.
- Situation cards are `<article tabindex="0" aria-pressed>` elements (not buttons). Enter or Space on a card's
  "How … may help" link selects the card but does not follow the link; a mouse click does both.
- Hovering a step or a principle selects it, so moving the pointer across the list changes the selection.

## GoHighLevel notes

- The header is `position:sticky`, and so is the principles heading (desktop); they pin only if no GHL
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
node ghl/pages/smes-projects/_build/build.js            # writes both .ghl.html files
node ghl/pages/smes-projects/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/smes-projects/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/smes-projects/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/smes-projects/_build/states-shoot.js <url> <outDir>   # section state screenshots
node ghl/pages/smes-projects/_build/behaviour.js <url>               # interaction trace
node ghl/pages/smes-projects/_build/domdiff.js <sourceUrl> <portUrl> [width]
node ghl/pages/smes-projects/_build/header-and-lifecycle.js <portUrl>
node ghl/pages/smes-projects/_build/config.js http://localhost:8123/ghl/pages/smes-projects/_build/preview/
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it. The source file name
contains a space: use `design/SMEs%20Projects.dc.html` in URLs.
