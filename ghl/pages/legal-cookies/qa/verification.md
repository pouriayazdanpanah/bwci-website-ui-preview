# Cookie notice — local verification (8 November 2026)

- **Revision:** branch `feat/ghl-legal-pages`, based on main `12576d8` (design export `a012ab2`).
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 % at 12 widths; at 430 px 0.534 % (63 rows, y 458–520), all in the switcher (see below) |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 % |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 % |
| Landscape 844×390 and 568×390 | 0.000 % |
| Badge off (`showFlags: false`; source default rewritten by `SRC_PROPS=flags=false`), 320/390/768/1024/1440/1920 × 900 | 0.000 % |
| Page height (px), 320 → 2560 at 900 | 3079 · 2974 · 2976 · 2977 · 2923 · 2151 · 1797 · 2000 · 2019 · 2027 · 2027 · 2027 · 2027, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of hero, switcher, document, header and footer | 0 differences at 1440, 1024, 768, 390 and 320; 0 with the badge off at 1440 and 390 |

Isolated one- to four-row differences in single captures did not reproduce on repeat captures (capture noise).

**Switcher scroll position, 320–1100 px in 10 px steps:** 4 of 79 widths (430–460 px): the source leaves the Cookies card 85–100 % visible (not scrolled), the port scrolls it fully into view. This is the intentional difference described in
the README: the source centres the current card before the shared system stylesheet has applied.

## Behaviour (`_build/behaviour.js`, 41 trace lines, source vs port)

Identical. Covered:
- **The index** at 1440×900 and 390×844: the first section marked at load; the mark following each section through the
  reading band; back at the top; the last link clicked (still moving after 120 ms, then the same final offset below the
  sticky header, the same hash and focus); the mark after the click.
- **The sticky index column:** sticky at 1440 px, static at 899 px.
- **The legal pages switcher** at 1440, 1100, 768 and 390 px: the current card, scroll position (widths where both
  agree), layout, snapping and the current card's border and shadow; hover on another card and its icon, and on the
  current card.
- **Hovers** of the breadcrumb link, an index link and "Contact us".
- **Keyboard order** from the breadcrumb through the switcher and the index, with visible outlines.
- **Live resize** across 1280, 1101/1100, 900/899, 768/767, 641/640, 360 and 1600 px, with no horizontal overflow.
- **Reduced motion:** the final position of an index click, and the switcher transitions.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`** (now normalising the five legal prefixes): the 64-line
  header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js legal-cookies lck …`:** pass, no errors. It covers config keys and logos, hosted
  placeholders, a hostile host at 1440 and 390 (one instance, no overflow, re-attached, body overflow restored, nothing
  left hidden), and reduced motion (nothing invisible or translated).

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - every page link is `#` with `aria-disabled`;
  - the hosted block makes 0 image requests;
  - the inline block shows the original logo;
  - no raw `{{ }}` reaches the page.
- **Synthetic URLs:**
  - the five legal links and Home resolve;
  - `contactDetails` → `/contact?v=1#cnt-details`;
  - a Contact value with its own query and fragment (`https://example.com/contact?a=1#top`) gives
    `https://example.com/contact?a=1#cnt-details`.
- **Clicks:** a disabled "Contact us" does not navigate and carries the title "Not yet available"; an enabled one
  opens `contact?v=1#cnt-details`.
- **Badge:** shown by default, hidden with `false`, shown with the string `"false"`.
- **Hostile host** (generic CSS including `nav`, `aside`, `article`, lists and spans; content above and below; the script
  executed twice), at 1440 and 390: one owner, the switcher, grid and index keep their layout, the index click lands
  below the sticky header and marks the last section, no horizontal overflow. This test found that a host's
  `aside{float;width}` narrowed the index column; the element resets now neutralise both.
- **Copied live root** with the last index item marked and a changed config: starts with the first item marked, the badge
  hidden, the new links applied, one owner on the new root.
- **Teardown** leaves no instance; **`pagehide`** removes the app and its init marker.
- **No IntersectionObserver:** no index item is marked, as in the source.

## Shared entries and regression

- `ghl/shared/site-links/index.js`: page-only section `contactDetails` → `contact` + `#cnt-details`.
- All 29 other generated pages rebuild byte-identical to main `12576d8`; Main is untouched. No other installed block
  needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (408 checks). `ghl/shared/site-links/qa/unit.js`: PASS (215 checks, one new
  for `contactDetails`). `scripts/tests/footer-route-compatibility.js`: PASS.

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- Physical devices and the published page.
- `bwci_url_cookies_policy` and `bwci_url_contact` were `#` in the supplied export.
