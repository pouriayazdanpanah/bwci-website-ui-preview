# Page not found (404) — GoHighLevel port

This is a port of the BWCI 404 design to one GoHighLevel Custom Code block.
- **Source:** the standalone Claude Design export `BWCI_404.html` supplied by the owner on 29 October 2026, kept unchanged at `_build/source/BWCI_404.html`. The page is **not part of the `design/` export**, so it is not on the GitHub Pages preview. Adding it to a later Claude Design export is a separate design step.
- **Branch:** `feat/ghl-page-not-found`, from main `dbe6515`.
- Merge and live GoHighLevel installation are separate steps.

## Files

| File | Use |
|---|---|
| `page-not-found.ghl.html` | **Production block** (35 KB). Images come only from Custom Values. Nothing is requested until they are set |
| `page-not-found.inline.ghl.html` | Self-contained block (1.7 MB). Same references, plus the original logo and cone bytes as `imageFallbacks` |
| `assets/not-found-cone.png` | The cone image (1323×1189, RGB), byte-identical to the one embedded in the source export. The logo is the shared `ghl/shared/site-chrome/assets/bwci-logo.png`, also identical |
| `_build/` | Development only: `source/` (the export), `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record for this revision |

## What the source is

The export is a bundler file. Unpacked, it holds:
- one static `<main>`, with its styles inline;
- a `<helmet>` with the page title, the tokens and the animation/hover/breakpoint rules;
- the embedded fonts: JetBrains Mono 500–700 and Plus Jakarta Sans 400–800;
- the logo and the cone image;
- `support.js` and React 18.3.1.

The page has **no text/x-dc logic and no React component**: `support.js` only mounts the markup. It uses **no site header, breadcrumb or footer**, only the white logo linking home. So the port needs no JavaScript for behaviour; the entrance, float and hovers are CSS, as in the source.

## Installation in GoHighLevel

1. Create a page in the GHL website (for example `/404`). Give it one full-width section with no padding and one **Custom Code** element, and no GHL header or footer.
2. Paste the whole of one block.
   - Use the inline block while the image values are not set.
   - Keep the config id `bwci-page-not-found-config` and the JSON structure.
3. Set the page title to "Page not found — Better World Capital Investments PLC", which is the source `<title>`.
4. Set the section/page background to `#0A1C22`.
   - The source paints its `<body>` that colour; the block paints only itself.
   - The block already fills the viewport (`min-height: 100vh`), so the colour shows only on overscroll or around GHL's own wrappers.
5. Create the proposed image value below. Upload `assets/not-found-cone.png` and use its direct URL as the value.
6. Publish the page and select it as the site's 404 page.
   - The setting is per domain. GHL's help article "[How to Create a Customizable 404 Error Page](https://help.gohighlevel.com/support/solutions/articles/48001239647-how-to-create-a-customizable-404-error-page)" describes it. Third-party guides give the path as Settings → Domains → (domain) → 404/Error page.
   - Confirm the menu names in the account.
   - A [GHL feature request](https://ideas.gohighlevel.com/website/p/return-proper-http-404-status-for-custom-404-pages) reports that a custom 404 page is reached by a redirect to `/error-404`, which answers `200`, not `404`. That is platform behaviour; the block cannot change it.
7. Check the published page: open a missing URL, then check the two links, the images and the animation.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page. Shown white (`filter: brightness(0) invert(1)`), as in the source |
| `notFoundConeImage` | `{{ custom_values.bwci_img_page_not_found_cone }}` | **Proposed: create it in GHL** with the hosted URL of `assets/not-found-cone.png` |
| `links.home` | `{{ custom_values.bwci_url_home }}` | Existing. The logo and "Go home" (source: `Main.dc.html`) |
| `links.contact` | `{{ custom_values.bwci_url_contact }}` | Existing. "Contact us" (source: `Contact.dc.html`) |

A 404 page can be served at any path, so the two link values should be absolute URLs (or root-relative paths). The shared rules apply: `#`, empty or unresolved values mark the link unavailable ("Not yet available", `aria-disabled`, no navigation). Anything other than `http(s)://`, `mailto:`, `tel:` or `/…` is refused.

Custom Value to create. Its `name`/`value` body is also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json`:

```json
{ "name": "bwci_img_page_not_found_cone", "value": "<hosted URL of not-found-cone.png>" }
```

GHL accepts one object per POST. Check that the returned `fieldKey` matches the reference above. Nothing was created in the account from this repository.

## What is reproduced

- **Layout.** A full-viewport dark page (`min-height: 100vh`, then `100dvh`) with:
  - the radial gradient;
  - a dot grid masked to the left;
  - the cone (screen blend at .5 opacity, faded at top and bottom) at 66 % across, 115 vh tall;
  - a dark veil behind the copy.
  - The logo is top left. The copy is centred: "Error 404" eyebrow with a gold rule, the "4**0**4" code (emerald zero), "Page not found", the lead sentence, "Go home →" and "Contact us".
- **Responsive.**
  - Every size uses the source's `clamp()` values.
  - At ≤860 px the cone is centred, 150 vw wide, and sits at −6 vh.
  - At ≤480 px the two buttons stack at full width.
  - On a short viewport (for example 320×400) the page grows to its content (577 px) and scrolls natively.
- **Motion.**
  - The cone fades in (1.2 s), then floats 12 px up and down (9 s, infinite).
  - The four copy blocks rise in at 0.1 / 0.2 / 0.3 / 0.4 s (0.8 s, `cubic-bezier(.22,1,.36,1)`).
  - With reduced motion there are no animations; the content is visible and the cone stays at .5.
- **Hover and focus.**
  - "Go home" brightens (`#0F9A7E`) and its arrow moves 3 px.
  - "Contact us" gets a white border and a faint fill.
  - The logo link turns white.
  - Keyboard focus shows the source's 2 px `#A3D9C9` outline at 3 px offset, in the order logo → Go home → Contact us.

## How it is built

`node ghl/pages/page-not-found/_build/build.js` generates both blocks.
- **CSS:** scoped to `#bwci-page-not-found`, with unused selectors pruned (none).
  - The source's inline styles become `nf-` classes, in source order.
  - The two breakpoint rules no longer need the source's `!important` to win: they follow the classes they override, at equal specificity. Only the reduced-motion rule keeps it.
  - Keyframes `nfFloat`, `nfIn` and `nfFade` become `nf-nfFloat`, `nf-nfIn` and `nf-nfFade`.
  - The root stands in for the source's `<body>`: background, colour, font, smoothing, line-height.
  - Element resets keep host CSS out (see the hostile-host check).
- **Script:** `ghl/shared/site-chrome` is used without a header, breadcrumb, footer or system CSS. Only its runtime is taken: the shared image and link resolvers, the logo loader and the unavailable-link handling.
- **Build checks:**
  - the source export's links map to exactly `home` and `contact`;
  - its embedded fonts equal the font link;
  - the logo and cone copies are byte-identical to its embedded images;
  - link values equal the shared mapping;
  - no Claude Design, bundler or local paths appear in the output.

Shared change: `ghl/shared/site-images/index.js` gains `notFoundConeImage` → `bwci_img_page_not_found_cone` as a **page-only** setting, declared by this page's build (`images: ['notFoundConeImage']`). **No other page's block changes.** All 25 other generated pages rebuild byte-identical; Main is untouched. No link mapping changes: both destinations already exist.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md).
- **Pixels:** 0.000 % against the source at all 13 widths (320–2560), at heights 400, 568, 900, 1200 and 1600. Full-page and viewport captures were both checked.
  - With motion, frames frozen at 0, 350, 600, 1500 and 5700 ms match at 320, 390, 768, 1440 and 1920.
  - The few sub-threshold pixel differences are run-to-run rendering noise. A repeat run of the port matched the source with a maximum difference of 0 in every case.
- **DOM:** box and computed-style walk of all 20 elements: 0 differences at 1440×900, 390×844 and 320×568.
- **Behaviour (44 trace lines):** identical to the source. Covered:
  - animation names and timing, and sampled frames;
  - reduced motion;
  - hover and keyboard focus at 1440 and 390;
  - live resize across 861/860 and 481/480, and orientation 390×844 ↔ 844×390;
  - wheel and End-key scrolling on a 320×400 viewport.
- **Config and lifecycle:**
  - literal, `#`, empty, resolved, absolute and refused values, and broken JSON, in both variants;
  - the hosted block makes 0 image requests until values are set;
  - disabled and enabled clicks;
  - hostile host with the script run twice: one owner, no overflow, the widget's styles identical to the plain host;
  - re-render with a changed config;
  - teardown and `pagehide`;
  - reduced motion.
- No console or network errors.

## Intentional differences and source quirks

- **Unset destinations** are marked unavailable instead of linking to design files. An unset cone is hidden in the hosted block, and an unset logo shows no image, as on every page.
- **Page background:** the `<body>` background, and `html, body { height: 100% }`, are not applied to the host page (see installation step 4).
- **Unprefixed CSS:** `-webkit-user-select: none` is added next to the source's `user-select: none` on the cone, for Safari. It has no visual effect.
- **Design annotation:** `data-screen-label="404"` on `<main>` is dropped.

## Rebuild and test

```bash
node ghl/pages/page-not-found/_build/build.js && node ghl/pages/page-not-found/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
S="http://localhost:8123/ghl/pages/page-not-found/_build/source/BWCI_404.html"; P="http://localhost:8123/ghl/pages/page-not-found/_build/preview/plain.html"
node ghl/pages/page-not-found/_build/shoot.js "$S" /tmp/src && node ghl/pages/page-not-found/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/page-not-found/_build/diff.py /tmp/src /tmp/port
#   heights: ... shoot.js <url> <dir> <widths> 568   motion frame: ... <widths> 900 600 view
node ghl/pages/page-not-found/_build/domdiff.js "$S" "$P" 390 844
node ghl/pages/page-not-found/_build/behaviour.js "$S" src > /tmp/a; node ghl/pages/page-not-found/_build/behaviour.js "$P" port > /tmp/b; diff /tmp/a /tmp/b
node ghl/pages/page-not-found/_build/config-qa.js http://localhost:8123/ /tmp/hosts && python3 ghl/pages/page-not-found/_build/diff.py /tmp/hosts/plain /tmp/hosts/hostile
```
