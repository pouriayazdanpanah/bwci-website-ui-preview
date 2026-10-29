# Providence Asset Management — GoHighLevel port

This is a port of `design/Providence Asset Management.dc.html` and its map data, `design/pam-worldmap.js`, to one GoHighLevel Custom Code block. The page comes from design export `37102cf`, 28 October 2026.
- The block includes the shared header, breadcrumb and footer.
- It was built on branch `feat/ghl-providence-asset-management`, from main `ebc84b6`.
- Merge and live GoHighLevel installation are separate steps.

## Files

| File | Use |
|---|---|
| `providence-asset-management.ghl.html` | **Production block** (144 KB). Images come only from Custom Values. Nothing is requested until they are set |
| `providence-asset-management.inline.ghl.html` | Self-contained block (4.8 MB). Same references, plus the original image bytes as `imageFallbacks` |
| `assets/` | Reference copies, byte-identical to design: `pam-hero.png` (2140×735, RGBA) and the three portraits |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record for this revision |

## Installation in GoHighLevel

1. Create the page in GoHighLevel with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block.
   - Use the inline block while the image values are not set.
   - Keep the config id `bwci-providence-asset-management-config` and the JSON structure.
3. Set the page title to "Providence Asset Management — Better World Capital Investments PLC", which is the source `<title>`.
4. Create the proposed image value below. Upload `assets/pam-hero.png`, and use its direct URL as the value.
5. Check the published page:
   - the map;
   - the people carousel on a phone;
   - links and images.

No page links to this one yet. That includes Platforms, whose design has no link to it. A link value only needs to exist once a page links here: propose it as `bwci_url_providence_asset_management` then.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `pamHeroImage` | `{{ custom_values.bwci_img_providence_asset_management_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/pam-hero.png` |
| `peopleImages.*` | `{{ custom_values.bwci_img_profile_<person> }}` | Existing portrait keys for Richard Werner, Farhad Reyazat and Gabriella Karlova, used as card backgrounds |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFlags` | `false` | Source prop: the six review badges ("Relationship to confirm", "Wording to approve", "Placement to confirm", "PAM role to confirm") |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 29 references | Taken from the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

The page's own links are:
- `platforms`: the breadcrumb and "See all platforms & institutions";
- `contact`;
- `financialEngineHero`: the Financial Engine value + `#fe-hero`;
- the three profile keys, without `?from=` (as in the source).

The PAM website (`https://providenceassetmanagement.co.uk`) and the FCA Register firm entry (`https://register.fca.org.uk/s/firm?id=476091`) are fixed public addresses from the source. They open in a new tab, as in the Corporate / IR and Verify ports.

Custom Value to create; its `name`/`value` body is also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json`:

```json
{ "name": "bwci_img_providence_asset_management_hero", "value": "<hosted URL of pam-hero.png>" }
```

## Sections and interactions reproduced

1. **Hero** (`#pam-top`)
   - The line-art image is inverted onto the dark ground (filter, screen blend), in the three source layouts.
   - Breadcrumb: Home › Platforms & Institutions › Providence Asset Management.
   - The relationship placeholder.
   - "Regulatory status ↓" smooth-scrolls to `#pam-regulatory`; "Visit PAM website" is the external link.
2. **Regulatory status** (`#pam-regulatory`)
   - Four fact tiles overlap the hero by −72, −48 or −32 px, in 4, 2 or 1 columns. Hover fills the icon.
   - A dark panel holds the placeholder wording, the FCA Register button and two placeholder rows.
3. **What PAM does** (`#pam-services`)
   - Six cards in 3, 2 or 1 columns.
   - Hover lifts the card, draws the top line and fills the icon.
4. **Who PAM works with** (`#pam-clients`): the reach map, ported from the source's `initMap` with the same geometry, colours and timing.
   - **Drawing:** a canvas dot map from the inlined `PAM_WORLD` bitmap. A resize observer redraws it. At ≤767 px it is 210 % wide, as in the source.
   - **Reveal:** at 25 % visibility the leader lines draw and the UK / EU / Switzerland / Middle East callouts rise, then float.
   - **Pointer:** it magnifies nearby dots, moves the dot and callout layers in parallax, and activates the nearest anchor or the hovered callout.
   - **Frame loop:** while visible, a loop drives the pulsing anchor rings at about 30 fps when idle.
   - **Reduced motion:** no loop, no parallax, no float; each change draws one static frame.
   - Below the map are the five client types, with a hover underline.
5. **Role in the Financial Engine** (`#pam-engine`)
   - The six-step strip, with PAM marked at Institution and Capital.
   - It lights once 45 % is visible, and becomes a vertical list below 1024 px.
   - The key, and the Financial Engine link.
6. **Key people** (`#pam-people`)
   - Three cards using the system's `gv-card` styles, with the portraits as backgrounds.
   - Hover zooms the portrait and shows the overlay.
   - Below 768 px the cards are a scroll-snap carousel. A mouse or pen drags it after 6 px, and it snaps to the nearest card on release. The click after a drag is cancelled, and touch swipes natively.
7. **History** (`#pam-history`): a split layout with the milestone line. Hovering scales the dots.
8. **Next step** (`#pam-next`): Start a Conversation, the PAM website and all platforms & institutions.

Also reproduced:
- the shared scroll motion, which skips the hero as the source does;
- the shared header, drawer and footer;
- reduced-motion behaviour, which keeps content visible.

## How it is built

`node ghl/pages/providence-asset-management/_build/build.js` generates both blocks.
- **CSS:** scoped to `#bwci-providence-asset-management`, with unused selectors pruned.
  - Every source class and id carries the `pam-` prefix, except the `gv-` card classes from bwci-system.css part E.
  - `clFloat` becomes `pam-clFloat`.
  - The source's exact `:root` tokens and font link (including weight 800) are kept.
- **Script:** the map bitmap from `design/pam-worldmap.js` is inlined as a local constant. The build fails if its format or size changes.
- **Badges:** they exist in the DOM only while shown, as with the source's `sc-if`. Each badge's classes and text sit in `data-pam-flag` on its parent; a hidden badge left in place would change the role text's `:first-child`/`:last-child` styling.
- **Build checks:** link values against the shared mapping, and image copies against `design/`.

Shared change: `ghl/shared/site-images/index.js` gains `pamHeroImage` → `bwci_img_providence_asset_management_hero`.
- The list of image settings is inlined into every page. All 23 other generated pages were rebuilt, and both Main files were edited by hand.
- In those 50 outputs that line is the only change.
- The old and new resolvers return identical results for every existing config.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md).

- **Full-page pixels:** 0.000 % with no differing rows against the source at 768–2560 px (900, 600 and 1200 px heights), and with `showFlags` on at 768–1920 px.
- **Phones (320–430 px):** the full-page shots differ only inside the map band. Playwright's full-page capture briefly resizes the viewport, and the source's map then hits a zero-size frame: it throws `drawImage … width or height of 0` and is left blank in that shot.
  - Viewport screenshots of the map section at 320, 360, 375, 390 and 430 are identical (0.000 %), with no errors in either page.
  - Canvas pixel checksums match the source at every width tested.
  - The port skips such a frame instead of throwing (see differences).
- **DOM:** box and style comparison of every section, the header and the footer: 0 differences at 1440, 1024, 768, 390 and 320, and at 1440 and 390 with `showFlags` on.
- **Behaviour (82 trace lines):** identical to the source once mid-transition transform values are masked. Covered:
  - map reveal, anchor and callout activation, line colours, parallax values, canvas checksums, and the motion-on states;
  - all hovers;
  - the anchor;
  - the engine strip;
  - the carousel drag, snap and click suppression;
  - live resize.
- **Shared chrome:** the header, drawer, footer and motion trace is identical, and the lifecycle suite passes. Two counts are explained:
  - the three "invisible" elements are the hover-only card overlays, as in the source;
  - the one waiting element at 390 px is the off-screen third carousel card, as in the source.
- **Config:**
  - literal, `#`, empty and resolved values in both variants;
  - the hosted block makes no image requests until values are set;
  - the inline block falls back to the original hero, portraits and logo;
  - a JSON-escaped quote in a portrait URL is encoded;
  - the badges, and non-boolean values;
  - a copied root picks up its new config, and the map starts unrevealed;
  - teardown stops the map's frame loop (0 frames after removal);
  - disabled links don't navigate.

## Intentional differences and source quirks

- **Unset destinations:** they are marked unavailable instead of linking to design files. An unset hero image is hidden in the hosted block, and an unset portrait leaves the card's grey ground.
- **Zero-size canvas:** the map skips a frame while its canvas has no size. The source throws there and leaves the map blank until the next redraw.
- **Copied root:** a copied live root's map and engine strip start in the source's initial state.
- **In-page scroll:** smooth scrolling for the in-page link is scoped to the widget.
- **Paint hold:** the `.bw` paint-hold rule is omitted, because the system CSS is inline.
- **Placeholders are kept as designed:** the relationship, approved wording, legal name, permissions, service intro and next-step heading, and "Dates to be confirmed".

## Rebuild and test

```bash
node ghl/pages/providence-asset-management/_build/build.js && node ghl/pages/providence-asset-management/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
S="http://localhost:8123/design/Providence%20Asset%20Management.dc.html"; P="http://localhost:8123/ghl/pages/providence-asset-management/_build/preview/plain.html"
node ghl/pages/providence-asset-management/_build/shoot.js "$S" /tmp/src && node ghl/pages/providence-asset-management/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/providence-asset-management/_build/diff.py /tmp/src /tmp/port
node ghl/pages/providence-asset-management/_build/domdiff.js "$S" "$P" 390
node ghl/pages/providence-asset-management/_build/behaviour.js "$S" src > /tmp/a; node ghl/pages/providence-asset-management/_build/behaviour.js "$P" port > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js providence-asset-management pam http://localhost:8123/ bwci-providence-asset-management bwci-providence-asset-management-config
node ghl/pages/providence-asset-management/_build/config-qa.js http://localhost:8123/
```
