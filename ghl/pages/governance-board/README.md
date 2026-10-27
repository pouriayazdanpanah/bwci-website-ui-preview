# Governance · Board of Directors — GoHighLevel port

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 38/38 equal-size source/native full-page pairs are pixel-exact.
- Current source/inline feature traces: 63 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Governance Board.dc.html` ("Board of
Directors"). The design export is the unchanged reference; everything GHL-specific for this page lives in this
folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/governance-board/
├── governance-board.ghl.html          ← production block (hosted images)        ~78 KB
├── governance-board.inline.ghl.html   ← self-contained block (images embedded)  ~908 KB
├── assets/                            ← the three portraits, unchanged from design/assets/people/ (upload these)
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
| `design/Governance Board.dc.html` | Markup and page `<style>`: hero, Board card grid, "How decisions are made and overseen" link band |
| `design/SiteHeader.dc.html` (`current="governance"`), `design/Breadcrumb.dc.html` (`current="gov-board"`: Home › Governance › Board of Directors), `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome |
| `design/GovNav.dc.html` (`current="board"`) | Governance section bar via the shared site chrome ("Board of Directors" current) |
| `design/PersonCard.dc.html` (`from="board"`), `design/bwci-people.js`, `design/image-slot.js` | Person cards via the shared site chrome: name, roles, portrait, "View profile" overlay, profile link with `?from=board` |
| `design/bwci-system.css` | Parts A, A2, B, D and the content-page parts C and E (hero, `.sec`, `.link`, `.gv-card`) |
| `design/bwci-motion.js` | Section fade-up on scroll (the link band) |
| `design/assets/people/alexander-alegria-saif.jpg` (1440×1665), `farhad-reyazat.jpg` (2216×2015), `gabriella-karlova.webp` (812×1024) | Portraits, copied byte-identical into `assets/` (the build checks this) |
| `design/image-slots.state.json` | Only `person-gabriella-karlova` is saved, at the default framing (scale 1, centred), which is what every portrait uses |

The page's own `text/x-dc` script reveals `.sr` elements; this page has none, so it has no equivalent. No React,
`support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload the three files in `assets/` and the logo `ghl/shared/site-chrome/assets/bwci-logo.png` to **Media
   Storage** and copy their URLs.
2. Open `governance-board.ghl.html`. The **first block** is the configuration: paste the URLs into `"logoImage"`
   and `"peopleImages"`, and set the `"links"` (and `"footer"` wording if needed).
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding, and a
   **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`governance-board.inline.ghl.html` needs no upload, but it is ~908 KB because the portraits are embedded. Use the
hosted block in production.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-governance-board-config">
{
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "peopleImages": {
    "alexander-alegria-saif": "https://REPLACE-WITH-YOUR-HOSTED-URL/alexander-alegria-saif.jpg",
    "farhad-reyazat": "https://REPLACE-WITH-YOUR-HOSTED-URL/farhad-reyazat.jpg",
    "gabriella-karlova": "https://REPLACE-WITH-YOUR-HOSTED-URL/gabriella-karlova.webp"
  },
  "showHeader": true, "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
  "links": { "home": "/", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default links in
the markup (the images then stay empty). An untouched `REPLACE-WITH…` URL is never requested; that portrait frame
stays empty (light grey).

| Key | Default | Used by |
|---|---|---|
| `logoImage` | placeholder | Header, drawer and footer logo |
| `peopleImages.<slug>` | placeholder | Portrait of that person's card |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (breadcrumb and GovNav stay) |
| `footer.regulatoryLine`, `footer.registeredJurisdiction`, `footer.companyNumber`, `footer.registeredOffice` | `""` | Optional footer legal wording (left out while empty, as in the source) |
| `links.home` | `/` | Logos, breadcrumb "Home" |
| `links.financialEngine`, `ecosystem`, `platforms`, `smes`, `investors` | `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` | Nav, dropdowns, drawer, footer |
| `links.betterWorldImpact` | `#` | Independent Better World & Impact page (header/drawer/footer); configure the verified destination |
| `links.impact`, `links.today` | `/#bwci-impact`, `/#bwci-today` | Legacy homepage Impact setting (currently unused); Today remains the homepage section link |
| `links.governance` | `#` | Breadcrumb "Governance", utility bar / drawer / footer "Governance" — **unresolved** |
| `links.governanceBoard` | `#` | This page: GovNav "Board of Directors" (list and select) — **unresolved** |
| `links.leadership` | `#` | GovNav "Leadership", Who We Are menu "Leadership" — **unresolved** |
| `links.governanceFramework` | `#` | GovNav "Governance Framework / Documents", link band "Governance Framework" (source `Governance.dc.html#framework`) — **unresolved** |
| `links.profileAlexanderAlegriaSaif`, `profileFarhadReyazat`, `profileGabriellaKarlova` | `#` | The three person cards — **unresolved** |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `corporateIR`, `contact`, `verify`, `legal…` (6) | `#` | Who We Are menu, Private Investors, Corporate/IR, Contact, Verify, legal links — **unresolved** |

**Unresolved routes.** The Governance hub, this page and Leadership have GHL ports but no known live paths yet; the
profile pages have no GHL port yet; Who We Are, Private Investors, Corporate IR, Contact, Verify a Communication
and the Legal pages are not in the export. They default to `#`; set them once the live GHL URLs exist (no URL was
invented). For the Governance hub port, `governanceFramework` is `<hub route>#gov-framework`.

**Profile links.** A card links to its configured profile route plus `?from=board`, as the source's
`BWCI_PEOPLE.href(p, 'board')` (the profile pages use it for their breadcrumb). The parameter joins an existing
query (`/people/farhad?lang=en&from=board`) and goes before a hash (`/people/gabriella?from=board#bio`). A route
left at `#` stays `#`.

Page ids carry a `gvb-` prefix: `#gvb-top`, `#gvb-main`, `#gvb-board`, `#gvb-framework-link`.

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb, footer | Shared site chrome (see `ghl/shared/site-chrome/README.md`) |
| Hero | Part E ground, rings and dot field; breadcrumb, h1 and lead fade up 80 / 170 / 260 ms after load (none with reduced motion) |
| GovNav | As on the Governance hub, with "Board of Directors" current (bold, ink underline, `aria-current`); the select starts on "Board of Directors" and has no overview entry, as the source |
| Board cards | Auto-fill grid (`minmax(min(100%,240px),1fr)`), three cards. Each: 4:5 portrait placed as image-slot.js places it (covers the frame at scale 1, centred; refitted on load and resize), name, roles (Gabriella Karlova's two roles keep their empty entity lines, as in the source). Hover (fine pointers): card lifts 4 px with the elevated shadow and a pale green border (`--status-op-border`), the portrait zooms to 1.04, the "View profile →" pill fades in; on touch devices the pill is always shown. Keyboard focus: 2 px emerald outline 3 px out. Reduced motion: no lift or zoom |
| Link band | "How decisions are made and overseen" with the "Governance Framework →" link (emerald hover, arrow nudge); fades up on scroll (shared motion) |

## How it is built

`_build/src/` holds the editable source (`governance-board.css`, `.html`, `.js`, `.config.json`);
`node ghl/pages/governance-board/_build/build.js` generates both blocks, using the Governance / Platforms pipeline:
shared site chrome at the `<!--chrome:…-->` markers and a person card at each `<!--person:slug-->` marker
(rendered from `design/bwci-people.js` at build time), scoping under `#bwci-governance-board`, pruning of the
system CSS the page never renders (206 selectors, list with `--report`), link-key and anchor checks, a check that
every card has a `peopleImages` entry and that `assets/` matches the design files, and the inline variant with
the portraits as data URIs. Generic class names carry a `gvb-` prefix (`wrap`, `sec`, `sec--line`, `lead`,
`link`, `ar`); the root is the source's `.bw` wrapper (`class="gvb-bw"`).

## Validation (local, headless Chromium — not a published GHL page)

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion, shared motion settled) | Identical page heights; 0 % differing pixels at every width |
| Same at 600 and 1200 px viewport height (390, 1024, 1440 px) and with motion on (390, 768, 1440 px) | 0 % |
| Element-by-element box and computed-style comparison (`_build/domdiff.js`, the image-slot compared as one box) at 320×900, 390×844, 768×1024, 1024×768, 1280×900, 1440×900, 1920×1080, 2560×1440 | 0 differences |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`): GovNav current/off styles, hover, focus; card rest/hover/leave (transform, shadow, border, portrait zoom, overlay), portrait size in its frame at every width and after live resizes (1100 / 700 / 500 / 1600 px), keyboard focus ring, touch overlay at 390 / 320 px, link-band hover, select options, reduced-motion hover and hero | Identical, except the Tab stop below |
| Shared chrome trace (`chrome-behaviour.js`, incl. Tab order through the header, breadcrumb and GovNav) | Identical to the source |
| Lifecycle (`chrome-lifecycle.js governance-board gvb <base>`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host with the script run twice, GHL re-render, body overflow restored, reduced motion | All pass; no JavaScript errors |
| Page lifecycle (`_build/header-and-lifecycle.js`): configured routes reach GovNav, the select, the breadcrumb, the link band and the cards (`?from=board` with query and hash routes); hosted portrait URLs load and fit; placeholders are not requested; duplicate execution + re-render, then portraits refit and GovNav switches on the new root | All pass |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both sides; the
typeface itself must be checked on the published page.

## Intentional differences

1. **Image-slot editor.** In Claude Design every portrait is an editable `image-slot` with its own controls, which
   take two Tab stops per card. The port shows the portrait at the slot's saved framing as a plain image, so Tab
   goes card → card → link band (as on the Main port).
2. **Select markup.** The GovNav options carry plain text (the source nests a span, which static HTML cannot hold
   in an `<option>`); both GovNav variants are in the markup and the inactive one is `hidden`.
3. A portrait whose URL is not configured stays an empty frame; the source would show the image-slot's empty
   state (initials and an upload hint meant for the editor).
4. Smooth scroll applies to the widget's own anchors, not to the whole host page; source links to other
   `.dc.html` pages come from the config (`#` while unresolved).

## GoHighLevel notes

- The header and GovNav are `position:sticky`; they pin only if no GHL wrapper around the element uses
  `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on close
  or teardown — the only write outside the widget.
- Listeners on `window`/`document`: scroll, resize and orientationchange (passive), the menus' mousedown/keydown,
  one `matchMedia` listener (GovNav); one ResizeObserver for the portraits. All removed on teardown or GHL
  re-render.

## Rebuild and test

```sh
node ghl/pages/governance-board/_build/build.js            # writes both .ghl.html files
node ghl/pages/governance-board/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/governance-board/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/governance-board/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/governance-board/_build/behaviour.js <url>               # interaction trace
node ghl/pages/governance-board/_build/domdiff.js <sourceUrl> <portUrl> [width] [height]
node ghl/pages/governance-board/_build/header-and-lifecycle.js http://localhost:8123/ghl/pages/governance-board/_build/preview/ http://localhost:8123/
node ghl/shared/site-chrome/qa/chrome-lifecycle.js governance-board gvb http://localhost:8123/
```

The source file name contains a space: use `design/Governance%20Board.dc.html` in URLs. `_build/qa-routes.js`
serves the local React copies from `design/vendor/` so the source can be rendered offline; only the QA scripts use it.
