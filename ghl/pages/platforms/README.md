# Platforms — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Platforms.dc.html`
("Platforms, Institutions & Connected Capabilities"). The design export is the unchanged reference;
everything GHL-specific for this page lives in this folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/platforms/
├── platforms.ghl.html              ← production block (hosted hero image)        ~147 KB
├── platforms.inline.ghl.html       ← self-contained block (hero image embedded)  ~2.7 MB
├── assets/plat-hero-rails.png      ← hero artwork, 2020×778 RGBA PNG, unchanged from the export (upload this to GHL)
├── _build/                         ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `design/Platforms.dc.html` (last changed in 9154c4b) | All markup, CSS and the `text/x-dc` component: the six capabilities, register tiles and links, maturity mix, filter chips with live counts, active-filter chips, card/list views, list rows, register jumps, URL parameters, reveals |
| `design/SiteHeader.dc.html` (`current="platforms"`, `cta-href="#engage"`) | Sticky header, "How It Works" dropdown, mobile drawer and accordions (same header block as the Ecosystem port) |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.plt-i`) |
| `design/assets/plat-hero-rails.png` | Hero artwork (2020×778, transparent). Desktop: right-hand 64% of the hero, `object-fit:contain` with a left fade and a 14 s drift; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/plat-hero-rails.png` to **Media Storage** and copy its URL.
2. Open `platforms.ghl.html`. The **first block** is the configuration: paste the URL into
   `"platformsHeroImage"` and set the `"links"`.
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding,
   and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`platforms.inline.ghl.html` needs no upload, but it is ~2.7 MB because the 2 MB PNG is embedded. Use the
hosted block in production. The PNG was kept byte-identical; re-encoding it (for example as WebP) would
make both blocks lighter but is a design-asset decision.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-platforms-config">
{
  "platformsHeroImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/plat-hero-rails.png",
  "showHeader": true,
  "showFooter": true,
  "directory": { "syncUrl": true },
  "links": { "home": "/", "financialEngine": "/financial-engine", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default
links in the markup and URL sync on (the image then stays empty).

| Key | Default | Used by |
|---|---|---|
| `platformsHeroImage` | placeholder (no request is made until replaced) | Hero artwork |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer |
| `directory.syncUrl` | `true` | `false` stops the directory from writing `?maturity=` / `?relationship=` into the address bar (reading them on load still works) |
| `links.home` | `/` | Header and drawer logo |
| `links.financialEngine` | `/financial-engine` | "The Financial Engine" (dropdown, drawer), footer "Financial Engine" |
| `links.ecosystem` | `/ecosystem` | "Ecosystem Topology" (dropdown, drawer), "Explore the full ecosystem →", footer "Our Ecosystem" |
| `links.smes` | `/smes-projects` | "SMEs & Projects" (header, drawer, footer), pathway card 03 |
| `links.investors` | `/investors-partners` | "Investors & Partners" (header, drawer, footer) |
| `links.investorsRoute` | `/investors-partners#route` | Pathway card 01 "Partner with Better World" (source `Investors Partners.dc.html#route`) |
| `links.investorsParticipation` | `/investors-partners#participation` | Pathway card 02 "Explore institutional pathways" (source `#participation`) |
| `links.about` | `/#bwci-what` | Footer "About" |
| `links.governance` | `/#bwci-trust` | "Governance" (top bar, drawer, footer) |
| `links.corporate` | `/#bwci-trust` | "Corporate/IR" (top bar, drawer) |
| `links.legal` | `/#bwci-trust` | Footer "Legal & Documents" |
| `links.regulatory` | `/#bwci-trust` | Footer "Regulatory Boundaries" |
| `links.insights` | `#` | Footer "Insights" (the Main page has no Insights section yet) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |
| `links.verify` | `/#bwci-cta` | Footer "Verify a Communication" |

The `/#bwci-…` defaults are section ids of the Main page port. The Investors & Partners page has no GHL port
yet: once it exists, point `investorsRoute` and `investorsParticipation` at its real section ids.

Links within this page are fixed: "Contact" and "Start a Conversation" in the header, footer "Start a
Conversation", every card/row call to action and the hero's "Partner with Better World" go to `#plt-engage`
(source `#engage`); "Explore the platform directory" goes to `#plt-directory`; the current-page links
("Platforms & Institutions" in header, drawer and footer) go to `#plt-hero`. Page ids carry a `plt-` prefix
(`#plt-hero`, `#plt-registers`, `#plt-directory`, `#plt-governance`, `#plt-connection`, `#plt-pathways`,
`#plt-engage`).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header | Sticky, turns translucent once scrolled; dropdown on hover or click, closes on outside click or Escape; burger drawer below 1200 px with two accordions; scroll lock while the drawer is open |
| Hero | Gradient, dot field, rails artwork drifting 14 px (14 s, alternate); separate tablet and phone treatments |
| One holding company, two registers | Holding-company band; "Operating now" (2) and "In development and proposed" (4) registers. Each tile jumps to the directory filtered by its maturity **and** relationship and highlights that capability; each register link ("Operating · 2", "In development · 3", "Proposed · 1") filters by maturity only. The jump scrolls the toolbar to 88 px below the top |
| Platform directory | Maturity mix bar (segments outside the filter dim) and three mix buttons (click again to clear). Maturity chips (4) and relationship chips (5) with live counts: each count is computed against the other filter; a zero count gets a dashed chip. "Showing N of 6", removable active-filter chips and "Clear all". Every filter change clears the jump banner and re-mounts the results, which replays the staggered entrance (60 ms apart) |
| Jump banner | "From the two-register map · Showing [all] …  · filtered by …"; Back to registers (scrolls to 64 px below the top), Show all platforms, dismiss. Re-mounted (entrance replays) on every jump; dismissing it removes the capability highlight but keeps the filters |
| Cards / List | Toggle keeps filters and the jump. Cards: tags, mandate, entity/perimeter, availability, 7-stage engine-role pips and role, call to action; a jumped-to card gets the emerald focus pulse. List: one row open at a time (the open row survives filter changes while it stays in the result); rows collapse to name + chevron on phones |
| Empty state | Shown for combinations with no platform (e.g. Operating + Group build) with "Clear filters"; the footnote stays |
| Governance, Ecosystem connection, Pathways, Start a conversation, footer | Static content with the source hover states, the "This page" marker and the fence label that turns horizontal below 1024 px |
| Reveals | Every `.rv` block fades up once when 15% visible, with the source delays (90/180/270 ms) |

The chips, mix buttons and active-filter chips are updated in place (as React did), so keyboard focus stays
on the control that was used.

### URL parameters

On load, `?maturity=` and `?relationship=` preselect the filters. Values use the source's keys:
`Operating`, `In Development`, `Proposed`; `Group Company`, `Group Build`, `Partner Capability`,
`Enabling Layer` (spaces as `%20` or `+`). Unknown values are ignored.

On every filter change the port updates just these two parameters with `history.replaceState`. It keeps
every other query parameter (e.g. `utm_*`), the `#hash` and `history.state` of the host page, and never
adds history entries. Set `"directory": { "syncUrl": false }` to leave the address bar untouched.

## How it is built

`_build/src/` holds the editable source (`platforms.css`, `platforms.html`, `platforms.js`,
`platforms.config.json`). `node ghl/pages/platforms/_build/build.js` generates both blocks:

- fills the `<!--view:…-->` markers in `platforms.html` with the default directory state, rendered by the
  `VIEW` part of `platforms.js` (the code between `VIEW:start` and `VIEW:end`), so the static markup and the
  markup the script produces later always agree;
- scopes every selector under `#bwci-platforms` and fails on any unscoped rule;
- drops selectors naming classes/ids the page can never render (the export still carries CSS for retired
  sections and other pages; 214 selectors, list with `--report`) and unused keyframes. Classes are
  collected from the markup and from every directory state the `VIEW` code can render (all filter
  combinations, both views, each open row, each jump);
- checks that every `data-plt-link` key exists in the config (and the reverse), that in-page anchors exist,
  and that no Claude Design, unpkg, vendor or local asset path remains.

The CSS keeps the source rule order (mobile overrides depend on it). Generic class names carry a `plt-`
prefix (`container`, `section`, `btn`, `h1`, `hero`, `tag`, `chip`, `g`, `on`, …), keyframes are `plt-`
namespaced, and element resets neutralise host typography, buttons, lists, `dl`, `figure` and
`blockquote`. `html`/`body` are never styled.

## Validation (local, headless Chromium)

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion) | Identical page heights; 0.000% differing pixels at every width |
| Same with motion on (390, 768, 1440 px) and at 600 px viewport height (390, 1440 px) | 0.000% |
| Directory states × 390/320/768/1024/1440 px: register jump (card highlight + banner), list with an open row, jump + list + open row, empty state, mix button (`_build/states-shoot.js`) | 0.000% in all 25 captures |
| Element-by-element box and computed-style comparison at 320, 390, 768, 1024 and 1440 px (`_build/domdiff.js`) | 0 differences |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`, 40 checks): chips, repeated chip, active-filter removal (focus kept), mix toggle, empty state, Clear all, Space/Enter on chips, all 20 maturity × relationship combinations in both views, tile and link jumps with scroll position, list view, row open/close/switch, open row surviving a filter change, dismiss, Back to registers, Show all, URL preselection, phone list layout | Identical |
| Animations with motion on (`_build/motion.js`): hero drift, staggered card entrance, banner entrance, focus pulse, list entrance, chevron, reveals, keyboard focus ring | Same animations, durations, delays and focus ring (when a reveal starts depends only on scroll timing) |
| Header, drawer, accordions, Escape, anchors, re-render recovery, duplicate execution, reduced motion (`_build/header-and-lifecycle.js`), also inside the hostile host | All pass |
| Config and URL (`_build/config-and-url.js`): inline and hosted image, untouched placeholder, header/footer off, link overrides, broken JSON, URL preselection, parameter preservation, unknown values, `syncUrl: false` | All behave as documented; no JavaScript errors |
| Hostile host (Bootstrap/normalize-like global CSS, 10 px root font, content above and below, script run twice) | Pixel-identical to the plain render at 320, 390, 768 and 1440 px; one instance |
| Network | Only the Google Fonts stylesheet (and the hero image once configured) |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both
sides; the typeface itself must be checked on the published page. The fonts are loaded with the same
three `<link>` tags as the Main, Financial Engine and Ecosystem blocks.

## Intentional differences

1. **URL writing.** The source intends to write `?maturity=…&relationship=…` on every filter change, but in
   the design preview its update hook throws (`Cannot read properties of undefined (reading 'mat')` on every
   state change), so the address bar never changes; when it did work it would also have dropped all other
   query parameters and the hash. The port writes only its two parameters and keeps everything else (see
   URL parameters), and can be switched off with `syncUrl`.
2. **Unknown URL values** (`?maturity=Banana`) are ignored. The source would apply them and show an empty
   directory with a blank active-filter chip.
3. The scroll-reveal start state (hidden, 14 px down) applies only once the script runs, so the content
   stays visible if the script never runs. With the script, the reveal is identical.
4. With reduced motion, the register jump and "Back to registers" scroll instantly; the source always
   scrolled smoothly.
5. The source sets `html{scroll-behavior:smooth}` for the whole page. The port does not style the host
   page; it smooth-scrolls its own in-page links instead. Scripted or keyboard jumps elsewhere on the host
   page are therefore instant, and reveal blocks skipped by an instant jump fade in when they are scrolled
   back into view.
6. Source header links to `#engage` point at `#plt-engage`; other pages' `.dc.html` links come from the
   config.

### Source behaviour kept as is

- On phones (≤ 767 px) every data-driven text renders at 14 px (source `.sc-interp` rule), e.g. register
  counts, tile and card names, mix-button numbers.
- Card tags and list subtitles show the raw keys ("Group Company", "In Development"); tiles and chips show
  the sentence-case labels ("Group company", "In development"). Both render in capitals.
- The list-row detail references an undefined `mtIn` animation in the source, so it appears without an
  entrance animation; the dangling reference was removed.
- Any filter change, including "Show all platforms", clears the jump banner.

## GoHighLevel notes

- The header is `position:sticky`; it pins only if no GHL wrapper around the element uses
  `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on
  close or teardown. The directory's `history.replaceState` (only its two parameters) is the only other
  write outside the widget.
- Background rings of adjacent sections deliberately overlap section edges (source design); the widget
  root clips them horizontally with `overflow-x: clip`.
- Listeners on `window`/`document`: scroll, resize and orientationchange (passive), header mousedown/keydown
  for the dropdown and drawer. One IntersectionObserver for the reveals. All removed on teardown or GHL
  re-render. The directory uses one delegated click listener on the widget root.

## Rebuild and test

```sh
node ghl/pages/platforms/_build/build.js            # writes both .ghl.html files
node ghl/pages/platforms/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/platforms/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/platforms/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/platforms/_build/states-shoot.js <url> <outDir>   # directory state screenshots
node ghl/pages/platforms/_build/behaviour.js <url>               # interaction trace
node ghl/pages/platforms/_build/motion.js <url>                  # animations with motion on
node ghl/pages/platforms/_build/domdiff.js <sourceUrl> <portUrl> [width]
node ghl/pages/platforms/_build/header-and-lifecycle.js <portUrl>
node ghl/pages/platforms/_build/config-and-url.js http://localhost:8123/ghl/pages/platforms/_build/preview/
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it.
