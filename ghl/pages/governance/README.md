# Governance — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of `design/Governance.dc.html` ("Governance", the
hub of the governance pages). The design export is the unchanged reference; everything GHL-specific for this
page lives in this folder.

**Status:** QA done locally in headless Chromium (see Validation). Not yet checked on a published GHL page.

```
ghl/pages/governance/
├── governance.ghl.html          ← production block (hosted logo)     ~71 KB
├── governance.inline.ghl.html   ← self-contained block (logo embedded) ~117 KB
├── _build/                      ← dev tooling only, never loaded at runtime
└── README.md
```

## Source

| Source file | What was taken from it |
|---|---|
| `design/Governance.dc.html` | Markup and page `<style>`: hero, the "Five layers of oversight" framework cards |
| `design/SiteHeader.dc.html` (`current="governance"`), `design/Breadcrumb.dc.html` (`current="governance"`), `design/SiteFooter.dc.html` | Header, drawer, breadcrumb and footer via the shared site chrome |
| `design/GovNav.dc.html` (`current="hub"`) | The governance section bar, via the shared site chrome (it is shared with the Board and Leadership pages) |
| `design/bwci-system.css` | Parts A, A2, B, D and the content-page parts C and E, which style almost the whole page: `.pg-hero` / `.pg-hero--in` (dark radial ground, rings, dot field, entrance), `.sec`, `.sec-head`, `.eyebrow`, `.pg-grid--5`, `.pg-card`, `.link` |
| `design/bwci-motion.js` | Section fade-up on scroll (framework cards below the fold) |
| `design/assets/bwci-logo.png` | Logo, from `ghl/shared/site-chrome/assets/bwci-logo.png`; the page has no other images |

Not needed by this page:
- `design/bwci-people.js` and `design/image-slot.js` are loaded by the source but used only by the Board, Leadership and profile pages.
- The page's own `text/x-dc` script reveals `.sr` elements, and the hub has none.
- The `.bw{visibility:hidden}` paint hold waits for `bwci-system.css` to load; here that CSS is inline in the block.

No React, `support.js`, `/vendor/`, unpkg or `./assets/` path is used by the delivered block.

## Installation in GoHighLevel

1. Upload `ghl/shared/site-chrome/assets/bwci-logo.png` to **Media Storage** (once for all pages) and copy its URL.
2. Open `governance.ghl.html`. The **first block** is the configuration: paste the URL into `"logoImage"` and set
   the `"links"` (and `"footer"` wording if needed).
3. In the GHL page, add a **full-width** section with no padding/margins, one row/column with no padding, and a
   **Custom Code** element in it.
4. Paste the **entire** file (config block, font links, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`governance.inline.ghl.html` needs no upload (logo embedded) and is ~117 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-governance-config">
{
  "logoImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-logo.png",
  "showHeader": true,
  "showFooter": true,
  "footer": { "regulatoryLine": "", "registeredJurisdiction": "", "companyNumber": "", "registeredOffice": "" },
  "links": { "home": "/", "financialEngine": "/financial-engine", … }
}
</script>
```

Plain JSON: double quotes, no trailing comma. If it is malformed the page still runs with the default links in
the markup (the logo then stays empty).

| Key | Default | Used by |
|---|---|---|
| `logoImage` | placeholder (never requested) | Header, drawer and footer logo |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (the breadcrumb and GovNav are part of the page and stay) |
| `footer.regulatoryLine` | `""` | Optional regulatory sentence above the footer legal line |
| `footer.registeredJurisdiction`, `footer.companyNumber`, `footer.registeredOffice` | `""` | Optional parts of the footer legal line (left out while empty, as in the source) |
| `links.home` | `/` | Logos, breadcrumb "Home" |
| `links.financialEngine`, `ecosystem`, `platforms`, `smes`, `investors` | `/financial-engine`, `/ecosystem`, `/platforms`, `/smes-projects`, `/investors-partners` | Nav, dropdowns, drawer, footer |
| `links.impact`, `links.today` | `/#bwci-impact`, `/#bwci-today` | "Better World & Impact", "The Platform Today" (sections of the Main port) |
| `links.governanceBoard` | `#` | GovNav "Board of Directors" (list and select), card 01 "Meet the Board" — **unresolved** |
| `links.leadership` | `#` | GovNav "Leadership" (list and select), Who We Are menu "Leadership" — **unresolved** |
| `links.governance` | `#` | This page: "Governance" in the utility bar and drawer (marked `aria-current`) and in the footer, GovNav select "Governance overview" — **unresolved** |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `privateInvestors`, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#` | Who We Are menu, Private Investors, Corporate/IR, Contact, Verify, legal links — **unresolved** |

**Unresolved routes.**
- **Board and Leadership:** Governance Board and Governance Leadership have no GHL port yet.
- **Not in the export:** Who We Are, Private Investors, Corporate IR, Contact, Verify a Communication and the Legal pages.
- **This page:** its own GHL path (`governance`) is not known yet.

They default to `#`; set them once the live GHL URLs exist. No URL was invented for them.

**Fixed links on this page.** GovNav "Governance Framework / Documents" (list and select) goes to
`#gov-framework` on this page. That is what the source link `Governance.dc.html#framework` does on the hub.

Page ids carry a `gov-` prefix: `#gov-top`, `#gov-main`, `#gov-framework`, and the five card ids `#gov-board`,
`#gov-committees`, `#gov-capital`, `#gov-risk` and `#gov-perimeter`.

**Links into this page.** The Main port links to the cards through `governanceCommittees`, `governanceCapital`,
`governanceRisk` and `governancePerimeter` (source `Governance.dc.html#committees` etc.). Once this page is live,
set them in the Main config to `<governance route>#gov-committees`, `#gov-capital`, `#gov-risk` and
`#gov-perimeter`, and `governance` to the route itself.

## Sections and interactions reproduced

| Section | Behaviour |
|---|---|
| Site header, breadcrumb, footer | Shared site chrome (see `ghl/shared/site-chrome/README.md`); "Governance" is the current item in the utility bar and drawer |
| Hero | Part E ground (radial emerald/teal glows over a near-black gradient), rings and dot field; the breadcrumb, h1 and lead fade up 80 / 170 / 260 ms after load (none with reduced motion) |
| GovNav | Sticky under the header (`top: --nav-h − --util-h`, z-index 50). **≥ 768 px:** centred list; hover turns the text ink with a light underline; keyboard focus shows a 2 px emerald outline inside the link. **≤ 767 px:** "Section" label and a native select (Governance overview, Board of Directors, Leadership, Governance Framework / Documents) that navigates on change and then shows "Governance overview" again. Switches live on resize (matchMedia), as in the source |
| Five layers of oversight | Five cards: three columns at ≥ 1024 px, two below, one at ≤ 640 px; card 05 is dark and spans two columns down to 768 px. "Meet the Board" has the source's emerald hover and arrow nudge. Cards below the fold fade up on scroll (shared motion) |
| In-page anchors | Smooth scroll that lands below the sticky header and GovNav (source `scroll-margin-top`); focus leaves the link, as with a native fragment jump |

## How it is built

`_build/src/` holds the editable source (`governance.css`, `governance.html`, `governance.js`,
`governance.config.json`). `node ghl/pages/governance/_build/build.js` generates both blocks, using the Platforms
pipeline:
- It inserts the shared site chrome: header, breadcrumb, GovNav and footer, plus `bwci-system.css` parts A–E.
- It scopes every selector under `#bwci-governance` and fails on any unscoped rule.
- It drops selectors for classes the page never renders: 209, mostly the content-page components other pages use. List them with `--report`.
- It checks link keys and in-page anchors, and rejects any Claude Design or local paths.

The source's `.bw` page wrapper is the widget root itself (`class="gov-bw"`). So `bwci-system.css` selectors like `.bw .pg-card` become
`#bwci-governance.gov-bw .pg-card`: each gains the root id and keeps its class count, which preserves the source's
specificity order. The page's generic class names carry a `gov-` prefix (`wrap`, `sec`, `sec-head`, `eyebrow`,
`h1`, `h3`, `lead`, `link`, `ar`). `html`/`body` are never styled.

## Validation (local, headless Chromium — not a published GHL page)

| Check | Result |
|---|---|
| Full-page pixel diff vs the source at 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 px (reduced motion, shared motion settled; `_build/shoot.js`, `diff.py`) | Identical page heights; 0 % differing pixels at every width |
| Same at 600 and 1200 px viewport height (390, 1024, 1440 px) and with motion on (390, 768, 1440 px) | 0 % |
| Element-by-element box and computed-style comparison (`_build/domdiff.js`) at 320×900, 375×900, 390×844, 390×600, 768×1024, 1024×768, 1280×900, 1280×1200, 1440×900, 1440×600, 1920×1080, 2560×1440 | 0 differences from 768 px. Below 768 px only the GovNav select's inner markup differs (see Intentional differences); every box and style matches |
| Interaction trace, source vs port vs hostile host (`_build/behaviour.js`): sticky GovNav under the header while scrolling, GovNav hover/leave/focus styles, Tab order, framework link (scroll position, hash, focus), card link hover, select at 390 and 320 px (options, choosing the framework option), live switch at 700 / 767 / 768 px, hero entrance with and without reduced motion | Identical (in the hostile host offset by the host content above the widget) |
| Shared chrome trace (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): dropdowns, keyboard, drawer, focus trap, sticky, footer, scroll motion | Identical to the source |
| Lifecycle (`chrome-lifecycle.js governance gov <base>`): config keys, header/footer off, footer wording, link overrides, broken JSON, placeholders never requested, hostile host with the script run twice (one instance, no overflow, no style leakage), GHL re-render, body overflow restored, reduced motion (nothing left invisible) | All pass; no JavaScript errors |
| GovNav lifecycle (`_build/header-and-lifecycle.js`): configured routes reach the list links, select options and card link; duplicate execution + re-render, then live resize on the new root; the select navigates to a configured route | All pass |
| Horizontal overflow | None at any width |

Web fonts could not be downloaded in the test browser, so the comparisons used fallback fonts on both sides; the
typeface itself must be checked on the published page. The source font link adds Plus Jakarta Sans 800, but no
rule on this page uses weight 800, so the block uses the same three `<link>` tags as the other GHL blocks.

## Intentional differences

1. **Select markup.** The source runtime puts a `<span class="sc-interp">` inside each GovNav `<option>`. Static
   HTML cannot hold elements inside an option, so the options carry plain text; the select looks and behaves the
   same. Both GovNav variants are in the markup and the inactive one is `hidden`, where the source renders only
   one.
2. **Framework link.** On the hub the framework link is a same-page anchor (`#gov-framework`) rather than a link
   to the page's own URL plus `#framework`. The browser treats both as the same in-page jump; this one also works
   before the page's GHL path is known.
3. **Smooth scroll.** The source sets `html{scroll-behavior:smooth}` for the whole page. The port does not style
   the host page; it smooth-scrolls its own anchors (instantly with reduced motion).
4. Source links to other `.dc.html` pages come from the config (`#` while unresolved).

## GoHighLevel notes

- The header and GovNav are `position:sticky`; they pin only if no GHL wrapper around the element uses
  `overflow:hidden/auto` or `transform`.
- Opening the mobile menu sets `document.body.style.overflow = 'hidden'` and restores the previous value on close
  or teardown — the only write outside the widget.
- **Window and document listeners:**
  - scroll, resize and orientationchange (passive);
  - the menus' mousedown/keydown;
  - one `matchMedia` listener for GovNav.

  All are removed on teardown or GHL re-render.

## Rebuild and test

```sh
node ghl/pages/governance/_build/build.js            # writes both .ghl.html files
node ghl/pages/governance/_build/make-previews.js    # _build/preview/{plain,hostile}.html (git-ignored)
# with a local server at the repo root (e.g. npx http-server -p 8123) and NODE_PATH=$(npm root -g):
node ghl/pages/governance/_build/shoot.js <url> <outDir>          # screenshots, reduced motion by default
python3 ghl/pages/governance/_build/diff.py <refDir> <testDir>    # pixel diff
node ghl/pages/governance/_build/behaviour.js <url>               # interaction trace
node ghl/pages/governance/_build/domdiff.js <sourceUrl> <portUrl> [width] [height]
node ghl/pages/governance/_build/header-and-lifecycle.js http://localhost:8123/ghl/pages/governance/_build/preview/
node ghl/shared/site-chrome/qa/chrome-lifecycle.js governance gov http://localhost:8123/
```

The source page loads React from unpkg.com; `_build/qa-routes.js` serves the identical local copies from
`design/vendor/` so the source can be rendered offline. Only the QA scripts use it.
