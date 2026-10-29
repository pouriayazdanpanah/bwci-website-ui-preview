# Page not found (404) — local verification (29 October 2026)

- **Revision:** branch `feat/ghl-page-not-found`, based on main `dbe6515`.
- **Source:** `_build/source/BWCI_404.html`, the owner's standalone Claude Design export, rendered as supplied. Its bundler unpacks the template, the embedded fonts and images, `support.js` and React from the file itself.
- **Environment:**
  - headless Chromium (Playwright), against a local `http-server` at the repo root;
  - the port loads the real Google Fonts (the source embeds the same families and weights);
  - pixel diffs use Python 3.11 with numpy and Pillow, with a threshold of 24/255 per channel (`diff.py`). A separate zero-tolerance check reports the maximum channel difference.
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 rows at every width |
| The same at × 400, × 568 and × 1200 px; 320/390/768/1024/1440/1920/2560 × 1600 px | 0.000 %, 0 rows |
| Viewport-only captures (no full-page resize), 13 widths × 400 and × 568 px | 0.000 %, 0 rows |
| Motion on, every animation paused at 0, 350, 600, 1500 and 5700 ms, 320/390/768/1440/1920 × 900 | 0.000 %, 0 rows |
| Page height (px) | identical to the source in every case. At 900, 1200 and 1600 it is the viewport. At 400: 577 · 577 · 577 · 552 · 552 · 500 · 570 · 653 · 670 · 674 ×4 (320 → 2560). At 568: the viewport, except 577 at 320–375 and 570–674 from 1024 up |
| Horizontal overflow / console errors | none, in either page |
| DOM box and computed-style walk of `<main>` (20 elements, 42 properties, image sizes, text) | 0 differences at 1440×900, 390×844 and 320×568 |

**Zero-tolerance check.** Most captures are bit-identical (maximum channel difference 0). A few show sub-threshold differences, for example a maximum of 2 over a gradient at 1920×900, or 16–104 in a handful of pixels of a mid-animation frame. Each was re-captured three times for source and port:
- the source matched itself every time;
- the port's runs differed among themselves, and one port run matched the source with a maximum of **0** in each case.

They are rasterisation noise between runs (the blended, masked cone and gradients), not differences between port and source.

## Behaviour (`_build/behaviour.js`, 44 trace lines, source vs port)

Identical. Covered:
- **Animations:** the six that run and their timing:
  - cone `nfFade` 1.2 s, then `nfFloat` 9 s infinite from 1.2 s;
  - `nfIn` 0.8 s at 0.1, 0.2, 0.3 and 0.4 s;
  - the fill modes.
- **Sampled frames:** opacity and transform of each animated element at 0–10200 ms; the float keeps running after the entrance.
- **Reduced motion:** no animations, opacity 1, cone .5 at its static `translateX(-50%)`.
- **Hover:** Go home (background `#0F9A7E`, arrow +3 px), Contact us (white border, 5 % fill), the logo link (white). Then rest after the pointer leaves, at 1440 and 390.
- **Keyboard:** Tab order logo → Go home → Contact us → out, with the 2 px `#A3D9C9` outline at 3 px.
- **Live resize:** 1100×700, 861/860 (cone breakpoint), 600, 481/480 (button stack), 390×844 → 844×390 → 390×844, 1600×1000. Each step records the geometry of the page, cone, logo, copy, code, title and buttons, and the button direction.
- **Short viewport (320×400):** the page is 577 px; a mouse wheel scrolls 120 px and End scrolls to the bottom (177). Nothing intercepts input.

## Configuration and lifecycle (`_build/config-qa.js`)

- **Literal merge fields (as pasted), every value `#`, or every value empty:**
  - the three links are `#` with `aria-disabled`;
  - the hosted block makes **0 image requests**: cone hidden, logo without `src`;
  - the inline block shows the original cone (1323 px) and logo (640 px) from `imageFallbacks`;
  - no raw `{{ }}` reaches the page.
- **Synthetic URLs for every value, both variants:**
  - links resolve (`/home?v=1`, `/contact?v=1`);
  - cone and logo load from the URLs;
  - a click on the enabled "Contact us" navigates.
- **Other values:**
  - an absolute URL with spaces and a fragment is trimmed and kept;
  - `javascript:` is refused (unavailable);
  - `REPLACE-WITH-URL` for the cone falls back to the inline bytes.
- **Broken JSON:** every link unavailable, no images; no error.
- **Disabled click:** no navigation; the title is "Not yet available", and the status line reads "This destination is not yet available."
- **Hostile host, 1440×900, 390×844 and 320×568:**
  - the host has generic CSS on `html`, `body`, `*`, `h1`, `p`, `a`, `span`, `i`, `img`, `header`, `main`, `section` and `div`, content above and below, and the script executed twice;
  - one owner (`__bwciPageNotFound`), one initialised root, no horizontal overflow;
  - `<main>` is the viewport height (577 at 320×568, as in the plain host);
  - the computed styles of the code, title, lead, eyebrow, rule, both buttons, logo and cone are identical to the plain host.
- **Pixels, plain vs hostile widget:** 0.001 % at 320/390 and 0.000 % at 1440. The only pixels over the threshold are 2 antialiased corner pixels at the bottom of the buttons; the hostile page is scrolled 300 px past its host content.
  - The first run found one leak: a host `div{line-height:2}` reached the eyebrow and buttons, making `<main>` 586 px at 320. The port now resets `div` as it resets the other elements, and the check passes.
- **Re-render with a changed config** (live root replaced by a copy; home `/new-home`, contact `#`, cone `#`):
  - the new owner holds the new root;
  - the links follow the new config;
  - the inline cone falls back to its original bytes;
  - one status line;
  - the six animations restart, as on a fresh load.
- **Teardown:** removing the root leaves no instance (the owner waits for a new root). `pagehide` removes the owner.
- **Reduced motion:** 0 animations, nothing invisible or translated; the cone stays at .5.

The shared `ghl/shared/site-chrome/qa/chrome-behaviour.js` and `chrome-lifecycle.js` suites test the site header, drawer and footer, which this page does not have. Their remaining checks (config keys, hostile host, duplicate script, re-render, reduced motion) are covered above.

## Shared image entry (`notFoundConeImage`)

- `notFoundConeImage` → `bwci_img_page_not_found_cone` is page-only: declared by this page's build, so it is in this page's script only.
- All 25 other generated pages rebuild **byte-identical** to main `dbe6515`, and Main is untouched. No installed block needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (356 checks), including the check that the shared list stays frozen.
- `ghl/shared/site-links/qa/unit.js`: PASS (212 checks). No link mapping changed.

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- The GHL 404 setting, and the HTTP status GHL returns for a missing URL.
- Physical devices and the published page.
- The proposed `bwci_img_page_not_found_cone` does not exist in the account yet.
