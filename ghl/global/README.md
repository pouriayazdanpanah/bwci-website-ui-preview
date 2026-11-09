# Global site header and footer

One header block and one footer block, each pasted once into a GoHighLevel **Global Section**, instead of a header and
footer inside every page block. Editing the global section then updates every page that uses it.

**Status (9 November 2026):** every page that has a site header (35: the 34 generated pages and Main) has a global
version, `ghl/pages/<page>/<page>.global.ghl.html` and `.global.inline.ghl.html`. The 404 page keeps its regular
block: its design has its own logo bar and no site header or footer. The regular outputs of all 36 pages are unchanged
and keep working on their own; never combine a regular block with the global sections (two headers), or a global block
without them (no header). The pilot (Contact, Governance) was tested by the owner on a GHL test page on 9 November 2026
and reported working (page address not recorded); the other pages are verified locally only.

## Files

| File | Paste into |
|---|---|
| `site-header.ghl.html` (hosted logo) or `site-header.inline.ghl.html` (embedded logo) | ONE Custom Code element in a full-width **Global Section** at the very top of the page, no padding |
| `ghl/pages/<page>/<page>.global.ghl.html` (hosted images) or `.global.inline.ghl.html` (embedded images) | the page's own Custom Code element, full-width section, no padding |
| `site-footer.ghl.html` or `site-footer.inline.ghl.html` | ONE Custom Code element in a full-width **Global Section** at the very bottom of the page, no padding |

Use **Global** (or Universal) sections, not a "Section Template": a template is a copy and does not update the other
pages. Edit a global section on a test page first; a saved change reaches every page that uses it.

Build: `node ghl/global/_build/build.js` (both blocks); `node ghl/pages/<page>/_build/build.js --global` for each
generated page; `node ghl/global/_build/main-global.js` for Main (derived from its two hand-edited outputs). Without
`--global` the page builds write their regular outputs, byte-identical to before.

## Switching a page over in GoHighLevel

1. Keep a copy of the page's current Custom Code.
2. Replace it with the page's `.global` block (the same variant, hosted or inline, as before).
3. Insert the saved "BWCI Header" Global Section above it and "BWCI Footer" below it; remove any template header/footer.
4. Publish, then check the header, the menus and one link. Do steps 2–4 together before publishing: a `.global` block
   without the sections has no header; a regular block with them has two.

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

## Differences from the page blocks (found by the local QA, all 35 pages)

The global header and footer follow the SiteHeader / SiteFooter design the same way on every page. Today's page
blocks sometimes inherited a little of their page's own CSS; those pages change slightly:

- **Missing tokens.** The global blocks use the fullest token set (Governance's).
  - Pages without `--radius-full` get rounded ends on the 2 px active-link underline: Contact, the five legal pages,
    The Platform Today, Private Investors & Family Offices, Providence Asset Management, Start a Conversation, Verify a
    Communication and Who We Are.
  - Pages without the mobile type floors (`--fs-floor-sm` / `--fs-floor-body`) get the floors in the header and footer
    on phones. Visible only on **The Platform Today**: its footer text is 16 px instead of 15 px on phones (the footer
    is 28 px taller); everything else on the page is identical.
- **Label size in the phone menu.** On Ecosystem, Financial Engine, Investors & Partners, Platforms and SMEs & Projects,
  the page's own CSS shrinks every `.<prefix>-i` label to 14 px (`!important`, ≤ 767 px). That class is shared with the
  header, so today the open phone menu on those 5 pages shows 14 px labels (the design source does the same through
  its page-wide `.sc-interp` rule). The global header shows the design's own sizes (18 px rows), as on the other 30
  pages. Nothing else changes; the closed phone header has no text. **Owner decision:** keep the consistent header
  (current), or reproduce the 14 px labels on those 5 pages (a page marker, as for the overlays below).
- **Main's "The Platform Today" header link.** Today it jumps to `#bwci-today` on Main. The global header links to
  `bwci_url_home` + `#bwci-today` on every page and, on the page whose address matches (Main), turns it into the same
  in-page jump.
- **Fonts.** The global blocks load no font. They use Plus Jakarta Sans 400–700, which every page block loads. (The 36
  page blocks request it in three different ways; a font link in the header changed which font file rendered
  Governance's own text, a visible-only-in-pixels difference found by the pilot QA.) On a GoHighLevel page without a
  BWCI page block the header and footer fall back to the system font.
- **The 404 page** keeps its regular block (its own logo bar; no site header or footer in its design).

Behaviour that needed a mechanism (no visible difference):
- **Main** (`data-bwci-under-header`): its hero is pulled up under the header, so the header's placeholder is
  transparent there.
- **The Platform Today** (`data-bwci-overlays`): its floating "How to read" button and full-screen guide sit above the
  header (z-index 70 / 100 > 60) on today's block. In a host that layers its sections, a separate header section (raised
  to 999) and footer section would cover them, so the page's own section is layered at 998 (above the footer, below the
  header) and lifted to 1000 while the guide is open; all restored on teardown. With unlayered sections nothing changes.

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

- Pilot (Contact, Governance): `NODE_PATH=$(npm root -g) node ghl/global/qa/pilot.js <outDir>`.
- Rollout (all 35 pages, shardable): `NODE_PATH=$(npm root -g) node ghl/global/qa/rollout.js <outDir> [shard] [shards] [slugs]`.

Results: [qa/verification.md](qa/verification.md).
