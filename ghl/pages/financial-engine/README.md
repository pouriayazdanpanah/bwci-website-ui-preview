# Financial Engine — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of the Claude Design page
`FinancialEngine.dc.html`. The Claude Design export in the repository root is the
unchanged reference implementation; everything GHL-specific for this page lives in this folder.

```
ghl/pages/financial-engine/
├── financial-engine.ghl.html          ← production block (hosted image URL)       ~135 KB
├── financial-engine.inline.ghl.html   ← self-contained block (image embedded)     ~480 KB
├── assets/financial-engine-hero.webp  ← local copy of the hero image (upload this to GHL)
├── _build/                            ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `FinancialEngine.dc.html` | All markup, CSS and the `DCLogic` component (state, wheel/keyboard lock, stage wheel, chapters, capabilities) |
| `SiteHeader.dc.html` (`<dc-import name="SiteHeader" current="engine">`) | Sticky header, "How It Works" dropdown, mobile drawer and accordions |
| `support.js` (Claude Design runtime) | Template engine only. Behaviour that mattered: every `{{value}}` is rendered inside `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.fe-i`) |
| `vendor/react.js`, `vendor/react-dom.js` | Only used by the runtime to render the template — **not needed**; the port is vanilla JS |
| `assets/2b37055061899aec512b2c880a24ac91.webp` | Hero globe (1100×766, RGBA with transparency, `object-fit:contain`; `cover` + 32 % opacity behind the copy on phones) |

## Installation in GoHighLevel

1. Upload `assets/financial-engine-hero.webp` to **Media Storage** and copy its URL.
2. Open `financial-engine.ghl.html`. The **first block** is the configuration (same pattern as the
   Main page's `bwci-main-config`). Paste the image URL into `"financialEngineImage"` and set the
   `"links"` to your GHL page paths.
3. In the GHL page, add a section → set it to **full width**, remove its padding/margins, add one
   row/column with no padding, and drop a **Custom Code** element in it.
4. Paste the **entire** file (config block, `<style>`, `<div id="bwci-financial-engine">`, `<script>`).
5. Save and preview the **published** page (GHL does not run custom-code scripts in the editor canvas).

`financial-engine.inline.ghl.html` works the same way without step 1 (the image is embedded as a
data URI in the config), but it is ~480 KB; use it for testing or as a fallback.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-financial-engine-config">
{
  "financialEngineImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/financial-engine-hero.webp",
  "showHeader": true,
  "showFooter": true,
  "links": { "home": "/", "ecosystem": "/ecosystem", … }
}
</script>
```

It is plain JSON: keep the double quotes, and no comma after the last entry. If it is ever
malformed, the page still works with the default links written in the markup.

| Key | Default | Used by |
|---|---|---|
| `financialEngineImage` | placeholder (no request is made until replaced) | Hero globe |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (e.g. when GHL global sections are used) |
| `links.home` | `/` | Header + drawer logo |
| `links.ecosystem` | `/ecosystem` | "Ecosystem Topology" (dropdown, drawer) |
| `links.platforms` | `/platforms` | "Platforms & Institutions" (header, drawer) |
| `links.smes` | `/smes-projects` | "SMEs & Projects" (header, drawer, footer) |
| `links.investors` | `/investors-partners` | "Investors & Partners" (header, drawer, footer) |
| `links.about` | `/#bwci-what` | Footer "About" |
| `links.whatsDifferent` | `/#bwci-different` | Footer "What's Different" |
| `links.capabilities` | `/#bwci-platforms` | Footer "Capabilities" |
| `links.explorePlatforms` | `/#bwci-platforms` | Capabilities section "Explore Platforms" |
| `links.governance` | `/#bwci-trust` | "Governance" (top bar, drawer, footer) |
| `links.corporate` | `/#bwci-trust` | "Corporate/IR" (top bar, drawer) |
| `links.legal` | `/#bwci-trust` | Footer "Legal & Documents" |
| `links.regulatory` | `/#bwci-trust` | Footer "Regulatory Boundaries" |
| `links.insights` | `#` | Footer "Insights" (the Main page has no Insights section yet) |
| `links.contact` | `/#bwci-cta` | "Contact" (top bar, drawer) |
| `links.startConversation` | `/#bwci-cta` | "Start a Conversation" (drawer button, final CTA, footer) |
| `links.verify` | `/#bwci-cta` | Footer "Verify a Communication" |

The `/#bwci-…` defaults point at the section ids of the Main page GHL port. Links to places on this
page (`#fe-hero`, `#fe-ops-model`, `#fe-cta`) are not configurable because they never change.
The build fails if a `data-fe-link` key in the markup is missing from the config (or vice versa).

Behaviour tuning (developers only) stays in the `OPTIONS` object inside the `<script>`:
`opsLockOffset` 64, `opsDesktopMin` 1024, `headerDesktopMin` 1200, `opsWheelThreshold` 80,
`opsTransitionMs` 550, `opsReleaseNudge` 140, `opsRearmMs` 450 (all source values).

In-page anchor ids are prefixed to avoid collisions with GHL element ids:
`#fe-hero`, `#fe-principle`, `#fe-ops-model`, `#fe-capabilities`, `#fe-structure`, `#fe-cta`.

## How the port maps the source

- **React/DCLogic → vanilla JS.** All content is static HTML (crawlable, no layout shift); the script
  only toggles classes/attributes/text, exactly like the source's re-renders did.
- **Styles** are the source CSS in source order (many mobile rules depend on order + `!important`),
  with every selector prefixed by `#bwci-financial-engine` (done by `_build/build.js`, which fails
  the build on any unscoped selector). Generic class names were prefixed (`container`→`fe-container`,
  `section`, `btn`, `h1`, `h-display`, `body-lg`, `body-sm`, `text-link`, `icon`, `footer`, `hdr*`,
  `hero-btn`, `hero-actions`) and element resets neutralise host typography/normalize/Bootstrap rules.
  `:root` tokens live on the widget root; `html`/`body` are never styled.
- **Operating Model lock** (desktop ≥1024 px): same state machine as the source — passive scroll
  watcher detects the section crossing the 64 px line, a non-passive `wheel` listener (and
  Arrow/Page/Space keys) then advances stages 01→07 with an 80 px delta threshold and 550 ms cooldown,
  and releases with a 140 px smooth nudge past either end, re-arming after 450 ms.
- **Stage wheel geometry** is pure CSS from one coordinate system (`--orbit-size`,
  `--orbit-radius`, `--stage-total-angle`): markers, labels, rings and the focal ring cannot drift
  apart at any width. Stage rotation animates along the arc (`transform .6s`).
- **Mobile/tablet (<1024 px)**: orbit replaced by the source's stepper rail (prev/next, 7 dots,
  done/active states, scroll-into-view on change).
- `html{scroll-behavior:smooth}` is reproduced per-link (in-page anchors) and per-`scrollBy` call.
- **Fonts**: Plus Jakarta Sans + JetBrains Mono, loaded with the same three `<link>` tags as the Main page GHL block (placed right after the config block). A CSS `@import` inside the `<style>` did not load in GoHighLevel, and the build now rejects `@import`. The font families are used only inside the widget.

### Intentional differences (robustness fixes, no visual change)

1. The lock also releases if the page is moved by something other than the wheel (scrollbar drag,
   touch, anchor jump, find-in-page). In the source the lock could stay armed off-screen and then
   swallow wheel/arrow keys elsewhere on the page.
2. Clicking an orbit stage while the section is still approaching no longer gets reset to stage 01
   by the lock engaging mid-scroll.
3. Wheel deltas in line/page mode (some Firefox/Windows mice) are normalised to pixels.
4. Debug `console.log` calls from the source were removed.
5. The header's "stuck" state is measured relative to the widget (not `window.scrollY`), so it stays
   correct when GHL content sits above the widget.
6. `prefers-reduced-motion`: all transitions/animations become instant and scrolling is not
   smoothed; every state remains visible and interactive.
7. Dead code from the export was dropped: CSS for sections the source does not render (Problem,
   Illustrative Example, Status, Governance, old nav) and their IntersectionObservers (their target
   elements do not exist in the source, so they never ran).

### Faithfully reproduced source quirks

- On phones (≤767 px) every data-driven string renders at **14 px** (e.g. the Operating Model panel
  title and the principle reading title), because the source's "readability floor" CSS targets the
  runtime's `.sc-interp` span. This is exactly what the Claude Design page shows. To use the
  intended heading sizes instead, delete `.fe-i` from the two mobile `font-size` rules in
  `_build/src/financial-engine.css` and rebuild.
- Source copy is unchanged, including "Design the Stru**t**ure" (stage 02) and "he structure is
  designed…" (principle 02).

## Validation (see `_build/`)

| Check | Result |
|---|---|
| Full-page pixel diff vs the Claude Design page at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560 px | identical page heights; ≤0.004 % differing pixels (anti-aliasing on a decorative circle) |
| Same diff inside a hostile host page (Bootstrap/normalize-like global CSS, `html{font-size:10px}`, content above/below the widget, script executed twice) | identical render, no horizontal overflow |
| Horizontal overflow | none at any tested width, without touching `body` |
| Wheel lock sequence, keyboard capture, node click, chapter hover, capability hover, mobile rail | same trace as the source (see `_build/behaviour.js`) |
| Duplicate execution / re-render | single instance; stale instances are destroyed and re-attached |
| JS errors | none |

Rebuild after editing `_build/src/*`:

```sh
node ghl/pages/financial-engine/_build/build.js          # writes both .ghl.html files
node ghl/pages/financial-engine/_build/make-previews.js  # writes _build/preview/{plain,hostile}.html (git-ignored)
```

## GoHighLevel notes

- The header is `position:sticky`; it stays pinned only if no GHL wrapper around the Custom Code
  element uses `overflow:hidden/auto` or `transform`. Full-width sections without effects are fine.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` (source behaviour) and
  restores the previous value on close — the only write outside the widget.
- The Operating Model registers a non-passive `wheel` listener on `window` (required for the
  scroll capture); it returns immediately unless the section is locked.
- `SiteHeader` and the footer are shared by every Claude Design page. They are included here so the
  page is complete; when more pages are ported, consider moving them to a shared GHL global section
  and setting `"showHeader": false` / `"showFooter": false`.
