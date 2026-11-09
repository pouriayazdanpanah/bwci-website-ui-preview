# Global site header and footer (pilot)

One header block and one footer block, each pasted once into a GoHighLevel **Global Section**, instead of a header and
footer inside every page block. Editing the global section then updates every page that uses it.

**Status: pilot.** Two pages have a matching block: Contact (`ghl/pages/contact/contact.global*.ghl.html`) and
Governance (`ghl/pages/governance/governance.global.ghl.html`). Every other page still uses its regular block, which
carries its own header and footer; do not combine a regular block with the global sections (the page would show two
headers). The regular outputs of all 36 pages are unchanged. Live GHL is **NOT VERIFIED**; the pilot exists to verify
it on a test page.

## Files

| File | Paste into |
|---|---|
| `site-header.ghl.html` (hosted logo) or `site-header.inline.ghl.html` (embedded logo) | ONE Custom Code element in a full-width **Global Section** at the very top of the page, no padding |
| `ghl/pages/<page>/<page>.global.ghl.html` (or `.global.inline.ghl.html` where it exists) | the page's own Custom Code element, full-width section, no padding |
| `site-footer.ghl.html` or `site-footer.inline.ghl.html` | ONE Custom Code element in a full-width **Global Section** at the very bottom of the page, no padding |

Use **Global** (or Universal) sections, not a "Section Template": a template is a copy and does not update the other
pages. Edit a global section on a test page first; a saved change reaches every page that uses it.

Build: `node ghl/global/_build/build.js` (both blocks), `node ghl/pages/contact/_build/build.js --global`,
`node ghl/pages/governance/_build/build.js --global`. The regular page builds are unchanged by the `--global` code.

## Settings (JSON at the top of each block)

- Header: `logoImage` (`{{ custom_values.bwci_img_logo }}`), `raiseSection` (default `true`, see below), `links` — the
  16 header, drawer and "Start a Conversation" destinations, as the same existing Custom Values every page uses.
- Footer: `logoImage`, `footer` (`regulatoryLine`, `registeredJurisdiction`, `companyNumber`, `registeredOffice`:
  the legal wording, now in one place) and `links` (24).
- Page block (`--global`): only its own settings and the links its content, breadcrumb and section bar use. It has no
  `showHeader`, `showFooter`, `footer` or `logoImage`.

No new Custom Values.

## How it works

- **Pinned header.** The page blocks' header was `position: sticky` inside the page block, which is as tall as the
  page. In its own GoHighLevel section a sticky header could only stick inside that section, so the global header is
  `position: fixed`: the block's root keeps the header's height in the flow, and the header follows that placeholder
  until the utility bar has scrolled away (`top = max(placeholder top, -utility bar height)`), as the source's sticky
  `top: calc(var(--util-h) * -1)` does. Before the script runs it sits in the flow (no layout jump).
- **Sizes for the page.** The header sets `--util-h` / `--nav-h` on `<html>` (the source sets them there too). The
  page's sticky bars (GovNav, LegalNav, side panels) and anchor offsets read them; a `--global` page block no longer
  resets them on its own root.
- **Current page.** A page block built with `--global` marks its root `data-bwci-current="<SiteHeader current>"`
  (`contact`, `governance`, …). The header marks the matching links (`aria-current`), the dropdown trigger and opens
  the drawer accordion of that section, as the source does per page. A page block that appears after the header is
  picked up until the window has loaded. Without a marker nothing is marked.
- **raiseSection.** If GoHighLevel gives its sections their own stacking layer (`z-index`), later sections would paint
  over a fixed header and its menus. While it runs, the header raises the `z-index` of those ancestors of its own
  block to 999 (below typical chat widgets) and restores them on teardown. `false` turns this off. The header warns
  in the console if an ancestor has `transform`, `filter` or `contain`, which would stop a fixed element from staying
  pinned.
- **Lifecycle.** As the page blocks: one owner per block, re-execution reuses it, removal/replacement tears down
  (restoring `<html>`, the raised sections and the body overflow), `pagehide` destroys it, no polling.

## Differences from the page blocks

- Tokens: the global blocks use the fullest token set (Governance's). 13 page blocks do not define `--radius-full`
  (square ends on the 2 px active-link underline) and 9 do not define `--fs-floor-sm` (12.5 px instead of 14 px
  utility text on phones). On those pages the global header will differ by that much; Contact and Governance match.
- Fonts: the global blocks load no font. They use Plus Jakarta Sans 400–700, which every page block loads. (The 36
  page blocks request it in three different ways; a font link in the header changed which font file rendered
  Governance's own text, a visible-only-in-pixels difference found by the pilot QA.) On a GoHighLevel page without a
  BWCI page block the header and footer fall back to the system font.

## What to check on the GHL test page

1. The header stays at the top while scrolling: the dark utility bar scrolls away, the white bar stays, turns
   translucent, and does not jump at the start.
2. Dropdowns (desktop) and the mobile menu open above the page content, not behind it; the menu locks the page scroll
   and Escape / the links close it.
3. Contact: "Start a Conversation" is highlighted in the header; Governance: "Governance" is underlined.
4. Governance: the section bar sticks just below the header; its links jump to the right place.
5. Links and the logo resolve from the Custom Values (no literal `{{ custom_values... }}`).
6. The page source has `--nav-h` on `<html>`; the browser console has no errors (and no "transform/filter/contain"
   warning).

## Local QA

`NODE_PATH=$(npm root -g) node ghl/global/qa/pilot.js <outDir>` — see [qa/verification.md](qa/verification.md).
