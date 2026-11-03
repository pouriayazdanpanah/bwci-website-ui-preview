# The Platform Today — GoHighLevel port

This is a port of `design/Platform Today.dc.html` to one GoHighLevel Custom Code block. The block includes the shared header, breadcrumb and footer.
- **First port:** design export `aa929dd` (1 November 2026), merged in PR #45.
- **Hero update:** design export `df79d85` (2 November 2026) added a hero image and a new hero layout. The port follows it on branch `feat/ghl-platform-today-hero`, from main `df79d85` (a new branch name, because `feat/ghl-platform-today` is already merged); merged in PR #46 (`b5a0d25`).
- Live GoHighLevel installation is a separate step and is not verified.

## Files

| File | Use |
|---|---|
| `platform-today.ghl.html` | **Production block** (104 KB). Images come only from Custom Values; nothing is requested until they are set |
| `platform-today.inline.ghl.html` | Self-contained block (3.2 MB). Same references, plus the original logo and hero bytes as `imageFallbacks` |
| `assets/` | `platform-today-hero-arcs.png` (1604×980, RGBA), byte-identical to `design/assets/` (the build checks it) |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record for this revision |

The page's own image is the hero; the logo is the shared `bwci_img_logo`.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block.
   - Use the inline block while the image values are not set.
   - Keep the config id `bwci-platform-today-config` and the JSON structure.
3. Set the page title to "The Platform Today — Better World Capital Investments PLC", which is the source `<title>`.
4. Create the two proposed values below:
   - the hero image: upload `assets/platform-today-hero-arcs.png` and use its direct URL;
   - the link: the URL of the installed Providence Asset Management page.
5. Check the published page: the stages, the paired-card highlight, the "How to read" button and guide, and the links.

**Nothing links to this page yet.** In the design export, the header and footer "The Platform Today" entries still go to the home page's section (`Main.dc.html#today`), and the Platforms page has no link to it. Pointing the menus here is a design change; it would also change the header and footer of every page (an all-page change that needs the owner's approval and a re-paste of every block). When the design does link here, propose `bwci_url_platform_today` for it.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `platformTodayHeroImage` | `{{ custom_values.bwci_img_platform_today_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/platform-today-hero-arcs.png`. Unset, the hosted block shows the hero without the image |
| `showHeader` / `showFooter` | `true` | As on every page |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 26 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

The page's own links are:
- `platforms`: the breadcrumb's "Platforms & Institutions";
- `providenceAssetManagement` → `{{ custom_values.bwci_url_providence_asset_management }}`: the "View" link on the Providence Asset Management card. **Proposed: create it in GHL.** Until it holds a URL, the link is marked unavailable ("Not yet available"), like every other unset destination.

Custom Values to create (GHL accepts one object per POST; check that each returned `fieldKey` matches the reference above). The image body is also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json`:

```json
{ "name": "bwci_img_platform_today_hero", "value": "<hosted URL of platform-today-hero-arcs.png>" }
{ "name": "bwci_url_providence_asset_management", "value": "<URL of the Providence Asset Management page>" }
```

Nothing was created in the account from this repository.

## Sections and interactions reproduced

1. **Hero** (`#ptd-top`): the shared dark hero with the breadcrumb Home › Platforms & Institutions › The Platform Today, the title and the lead.
   - **≥768 px:** the arcs image sits on the right, vertically centred and faded into the hero by two masks. The copy column takes up to half the width (60 % at 768–1023 px), and the hero is 420–580 px tall.
   - **≤767 px:** the image becomes a cover background at 50 % opacity under a dark gradient, and the hero takes its content's height.
   - The breadcrumb items do not wrap internally, and the shared hero's ring decoration is hidden, as in the source.
2. **Stages** (`#ptd-stages`): three columns (Now / Established & Operational 02, Next / Pre-Operational 03, Later / In development 01) with six cards, the source's data written out.
   - **Rail:** at ≥1024 px a rail with three nodes runs above the columns. Below 1024 px the rail is hidden and the columns stack.
   - **Lighting up:** once the stages are 15 % visible (IntersectionObserver), the rail fills from left to right, the nodes scale in one after another (0, 0.45 and 0.9 s), and the "Now" node pulses. This happens once.
   - **Paired cards:** hovering or focusing inside a paired card highlights it and its partner (Pair A: Trade Finance Private Equity and Trade Finance Institution; Pair B: Community Bank Private Equity and Community Bank) and dims the others. Leaving clears it. The unpaired cards (Providence Asset Management, Regenerative Economy Private Equity) dim only.
   - **Card hover:** a fine pointer lifts the card 2 px and adds the shadow.
   - The Providence Asset Management card's "View" link, and the status note.
3. **"How to read" button**: fixed at the bottom right, shown while the stages are on screen (and hidden while the guide is open).
4. **Guide dialog**: a side panel (≥641 px) or bottom sheet (≤640 px) with the example card and the type, status and relationship legends.
   - Opening it locks the page scroll on `<html>` and moves focus to Close after 60 ms.
   - Escape, the backdrop, Close and "Got it" close it; focus returns to the button.
   - Its body scrolls on its own (`overscroll-behavior: contain`).

Also: the shared scroll motion (bwci-motion), the shared header, drawer and footer, and reduced motion (no rail or node transition, no pulse, no card lift; the guide fades instead of sliding; all content visible).

## How it is built

`node ghl/pages/platform-today/_build/build.js` generates both blocks from `_build/src/` and the shared chrome (`current: 'today'`, `breadcrumb: 'today'`, `content: true`).
- **CSS:** scoped to `#bwci-platform-today`, with unused selectors pruned.
  - Every source class and id carries the `ptd-` prefix; the source `.bw` wrapper is the root (`:scope.ptd-bw`), so the source's `.bw .pg-hero.pt-hero` rules keep their specificity over the shared hero, as in the source.
  - The source keyframes `ptPulse` becomes `ptd-ptPulse`.
  - The source's exact `:root` tokens and font link are kept.
  - The source style also has rules for a hero snapshot panel and a guide call-to-action that the page does not render; the build drops them, with their keyframes `ptIn` and `ptGrow`.
- **Markup:** generated once from the source's rendered DOM, so text and structure match it. Hooks (`data-ptd-*`) are added for the stages, the cards' pairs and the guide.
- **Script:** the page's text/x-dc component (stages, pairs, guide) in native JavaScript, plus the shared chrome runtime.
- **Build checks:** link values against the shared mapping, the hero copy byte-identical to `design/assets/`, scoped selectors, keyframe names, and no Claude Design or local paths.

Shared changes:
- **PR #45:** `ghl/shared/site-links/index.js` gains the proposed `providenceAssetManagement` → `bwci_url_providence_asset_management`, resolved at build time. `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the `ptd-` prefix.
- **Hero update:** `ghl/shared/site-images/index.js` gains `platformTodayHeroImage` → `bwci_img_platform_today_hero` as a **page-only** setting, declared by this page's build (`images: ['platformTodayHeroImage']`).

In both cases only this page's block changes: the 26 other generated pages rebuild byte-identical, and Main is untouched.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record, for the hero-update revision: [qa/verification.md](qa/verification.md).
- **Pixels:** 0.000 % with no differing rows against the source at all 13 widths (320–2560) at 900 px height, at six widths at 600 and 1200 px, with motion on at 390/1440, and in landscape at 844×390 and 568×320.
- **DOM:** box and style walk of the hero, stages, button, dialog, header and footer: 0 differences at 1440, 1024, 768, 390 and 320.
- **Behaviour (39 trace lines):** identical to the source, covering the stages, button, pairs, dialog, bottom sheet, resize and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes: config keys, hostile host, duplicate script, re-render, scroll lock restore and reduced motion.
- **Config:**
  - literal, `#`, empty, resolved and absolute values in both variants;
  - the hero: no request and no image in the hosted block until it is set, the original bytes in the inline block, the URL once resolved;
  - disabled and enabled clicks;
  - the guide in a hostile host at 1440 and 390;
  - a copied root while the guide is open and a pair highlighted;
  - teardown while the guide is open;
  - no IntersectionObserver.

## Intentional differences and source quirks

- **Unset values:** destinations are marked unavailable instead of linking to design files, and an unset hero image is left out of the hosted block (the hero keeps its layout and dark ground).
- **Stages lighting on short screens:** on a short desktop viewport (for example 1440×500), the source lights the stages at load, before they are on screen. Its observer first fires before the header and breadcrumb components mount, while the stages still sit higher up. The port lights them when they are really 15 % visible, which is the source's stated rule. On taller screens, and at 390×500, the two behave the same.
- **Scroll lock:** the guide restores the host page's own `<html>` overflow on close and on teardown; the source cleared it to `''`.
- **Paint hold:** the `.bw` paint-hold rule and `html{scroll-behavior:smooth}` are omitted; the system CSS is inline and the page has no in-page links of its own.
- **Fixed elements in GHL:** the "How to read" button and the guide are `position: fixed`, as in the source. If a GHL wrapper around the Custom Code element ever had a transform, they would be positioned relative to that wrapper instead of the window; check this on the published page.
- **As designed:** the guide dialog has no focus trap (Tab can leave it), as in the source. The status note says statuses are confirmed and that type and relationship are still to be confirmed.

## Rebuild and test

```bash
node ghl/pages/platform-today/_build/build.js && node ghl/pages/platform-today/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
S="http://localhost:8123/design/Platform%20Today.dc.html"; P="http://localhost:8123/ghl/pages/platform-today/_build/preview/plain.html"
node ghl/pages/platform-today/_build/shoot.js "$S" /tmp/src && node ghl/pages/platform-today/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/platform-today/_build/diff.py /tmp/src /tmp/port
node ghl/pages/platform-today/_build/domdiff.js "$S" "$P" 390
node ghl/pages/platform-today/_build/behaviour.js "$S" > /tmp/a; node ghl/pages/platform-today/_build/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js platform-today ptd http://localhost:8123/ bwci-platform-today bwci-platform-today-config
node ghl/pages/platform-today/_build/config-qa.js http://localhost:8123/
```
