# Platforms — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 38/38 equal-size source/native full-page pairs are pixel-exact.
- Current source/inline feature traces: 29 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Ten additional config/URL scenarios passed. The central report attributes the existing export-only
previous-state console error separately; neither native variant emits it.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Platforms.dc.html`
("Platforms, Institutions & Connected Capabilities"). The design export is the unchanged reference;
everything GHL-specific for this page lives in this folder.

**Status:** updated to the October 2026 design export (header, breadcrumb and footer from the shared
site chrome). QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/platforms/
├── platforms.ghl.html              ← production block (hosted hero image)        ~173 KB
├── platforms.inline.ghl.html       ← self-contained block (hero image embedded)  ~2.7 MB
├── assets/plat-hero-rails.png      ← hero artwork, 2020×778 RGBA PNG, unchanged from the export (upload this to GHL)
├── _build/                         ← dev tooling only, never loaded at runtime
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

- CSS regenerated from the current export: mobile type floors (`--fs-floor-*`), transition and grid tweaks.
- The old header and footer were replaced by the shared site chrome (new SiteHeader, Breadcrumb and SiteFooter,
  `bwci-system.css`, `bwci-motion.js`); the config gains `logoImage` and `footer`, and the old footer keys
  (`about`, `corporate`, `legal`, `regulatory`, `insights`) are gone with the old footer.
- `investorsRoute` / `investorsParticipation` now default to the Investors & Partners port's real ids
  (`#inv-route`, `#inv-participation`).

## Source

| Source file | What was taken from it |
|---|---|
| `design/Platforms.dc.html` (last changed in 9154c4b) | All markup, CSS and the `text/x-dc` component: the six capabilities, register tiles and links, maturity mix, filter chips with live counts, active-filter chips, card/list views, list rows, register jumps, URL parameters, reveals |
| `design/SiteHeader.dc.html` (`current="platforms"`), `design/Breadcrumb.dc.html`, `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome (see below) |
| `design/bwci-system.css`, `design/bwci-motion.js` | Tokens, type scale, buttons and font floors the page uses (scoped, pruned); the section fade-up on scroll |
| `design/assets/bwci-logo.png` | Logo, from `ghl/shared/site-chrome/assets/bwci-logo.png` |
| `design/support.js` | Template runtime only. It loads React 18.3.1 from unpkg.com and wraps every `{{value}}` in `<span class="sc-interp">`, which the page's mobile CSS resizes (reproduced as `.plt-i`) |
| `design/assets/plat-hero-rails.png` | Hero artwork (2020×778, transparent). Desktop: right-hand 64% of the hero, `object-fit:contain` with a left fade and a 14 s drift; tablet: faded behind the copy; phone: full-bleed cover at 32% opacity |

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `assets/plat-hero-rails.png` and `ghl/shared/site-chrome/assets/bwci-logo.png` to **Media Storage** and copy their URLs.
2. Open `platforms.ghl.html`. The **first block** is the configuration: paste the URLs into
   `"platformsHeroImage"` and `"logoImage"`, and set the `"links"` (and `"footer"` wording if needed).
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
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "showHeader": true,
  "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
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
 `directory.syncUrl` | `true` | `false` stops the directory from writing `?maturity=` / `?relationship=` into the address bar (reading them on load still works) |
| `links.investorsRoute` | `/investors-partners#inv-route` | Pathway card 01 "Partner with Better World" (source `Investors Partners.dc.html#route`; `#inv-route` is the Investors & Partners port's id) |
| `links.investorsParticipation` | `/investors-partners#inv-participation` | Pathway card 02 "Explore institutional pathways" (source `#participation`) |
| `links.startConversation` | `/#bwci-cta` | "Start a conversation" button in the last section (source `Main.dc.html#cta`) |

`/#bwci-cta` is the Main port's closing section; `#inv-…` are the Investors & Partners port's section ids.

Links within this page are fixed: every card/row call to action and the hero's "Partner with Better World" go
to `#plt-engage` (source `#engage`); "Explore the platform directory" goes to `#plt-directory`. Header, drawer and footer items for this page use its configured route (`links.platforms`) and are marked `aria-current="page"`, as in the source. Page ids carry a `plt-` prefix
(`#plt-hero`, `#plt-registers`, `#plt-directory`, `#plt-governance`, `#plt-connection`, `#plt-pathways`,
`#plt-engage`).

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb | Shared site chrome — see "Header, breadcrumb and footer" below |
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

## Header, breadcrumb and footer (shared site chrome)

The header, mobile drawer, breadcrumb and footer are generated by `ghl/shared/site-chrome/` (see its README)
from `design/SiteHeader.dc.html` (`current="platforms"`), `design/Breadcrumb.dc.html` (`current="platforms"`) and
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

### October 2026 design update — checks re-run

Local headless Chromium against the current export (`design/` at the time of this branch), with the shared
scroll motion settled before each capture:

| Check | Result |
|---|---|
| Full-page pixel diff vs the source, reduced motion, shared motion settled (`_build/shoot.js`, `diff.py`) | 0 % differing pixels at all 13 widths (320 … 2560 px), identical page heights |
| Element-by-element box and computed-style comparison at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560 px (`_build/domdiff.js`) | 0 differences at 320–1280 px. At 1440, 1920 and 2560 px one reported value differs: the governance container's resolved `margin: 0 auto` reads `0px` in the source and `0px 80px` in the port, with the same matched rule and an identical box (x 80, width 1280) — a difference in how Chrome reports a resolved `auto` margin, not in layout |
| Section states × 1440/1024/768/390/320 px (`_build/states-shoot.js`) | 0 % in all 25 captures (register jump, list with an open row, jump + list, empty state, mix button); the script now settles the shared scroll motion and scrolls the section through first |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`) | Identical |
| Shared chrome trace (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): dropdowns, keyboard, drawer, focus trap, sticky, footer, scroll motion | Identical to the source |
| Lifecycle (`chrome-lifecycle.js`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host with the script run twice (one instance, no overflow, no style leakage), GHL re-render, body overflow restored, reduced motion | All pass; no JavaScript errors |

The table below is from the original port (its header/footer rows describe the previous chrome). The page
logic it covers did not change in this update except where "October 2026 design update" above says so.

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
6. Source links to `#engage` and other in-page ids point at the prefixed ids; links to other `.dc.html` pages come
   from the config (`#` while unresolved).

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
