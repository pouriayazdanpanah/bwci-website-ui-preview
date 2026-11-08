# Accessibility statement — local verification (8 November 2026)

- **Revision:** branch `feat/ghl-legal-nav`, based on main `aac105f` (design export `aac105f`: the shared
  `LegalNav.dc.html` replaces the legal pages switcher). The first port's record (export `a012ab2`, PR #51) is in the
  git history of this file.
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width (see the note below) |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 %, 0 rows after re-capture |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Landscape 844×390 and 568×390 | 0.000 %, 0 rows |
| Badge off (`showFlags: false`; source default rewritten by `SRC_PROPS=flags=false`), 320/390/768/1024/1440/1920 × 900 | 0.000 %, 0 rows |
| Page height (px), 320 → 2560 at 900 | 3131 · 3084 · 3084 · 3010 · 2909 · 2136 · 1812 · 1989 · 2011 · 2019 · 2019 · 2019 · 2019, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page (13 widths each) |
| DOM box and style walk of hero, legal pages bar, document, header and footer | 0 differences at 1440, 1024, 768, 390 and 320; 0 with the badge off at 1440 and 390 |

Isolated 1–17-row differences in single captures (glyph edges, the select's text) all re-captured to 0 rows; at those widths the source also differed from its own earlier capture (capture noise).

## Behaviour (`_build/behaviour.js`, 56 trace lines, source vs port)

Identical. Covered:
- **The index** at 1440×900 and 390×844: the first section marked at load; the mark following each section through the
  reading band; back at the top; the last link clicked (still moving after 120 ms, then the same final offset below the
  sticky header and the legal pages bar, the same hash and focus); the mark after the click.
- **The sticky index column:** sticky at 1440 px (57 px lower than before, below the bar), static at 899 px.
- **The legal pages bar** at 1440, 1024, 768, 767 and 390 px: the link list (≥768 px) or the "Legal" select (≤767 px),
  the current page and its style, the select's options and selected page, the host's sticky position, and the bar's
  position at load and after scrolling 400 and 1200 px (stuck under the header: 77 px from the top on desktop, 69 px on
  a phone); hover and keyboard focus of another link, hover of the current link; the select's style and label.
- **Hovers** of the breadcrumb link, an index link and "Contact us".
- **Keyboard order** from the breadcrumb through the five bar links and the index, with visible outlines.
- **Live resize** across 1280, 1101/1100, 900/899, 768/767, 641/640, 360, 800 and 1600 px (the bar switching between
  list and select both ways), with no horizontal overflow.
- **Reduced motion:** the final position of an index click, and the bar links' colour transition (kept, as the source).

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`:** the 64-line header/drawer/dropdown/sticky/footer/motion
  trace is identical to the source (only the `src`/`port` label differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js legal-accessibility lac …`:** pass, no errors. It covers config keys and logos, hosted placeholders, a hostile host at 1440 and 390 (one instance, no overflow, re-attached, body overflow restored, nothing left hidden), and reduced motion (nothing invisible or translated).

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - every page link is `#` with `aria-disabled`, including the five bar links;
  - the select's other options are disabled and labelled "— not yet available"; the current page's option stays enabled;
  - the hosted block makes 0 image requests;
  - the inline block shows the original logo;
  - no raw `{{ }}` reaches the page.
- **Synthetic URLs:**
  - the five legal links (page, bar and select options) and Home resolve;
  - `contactDetails` → `/contact?v=1#cnt-details`;
  - a Contact value with its own query and fragment (`https://example.com/contact?a=1#top`) gives
    `https://example.com/contact?a=1#cnt-details`.
- **Clicks:** a disabled "Contact us" does not navigate and carries the title "Not yet available"; an enabled one
  opens `contact?v=1#cnt-details`.
- **The phone select (390 px):** choosing Terms opens `terms?v=1` when configured; choosing an unset page does not
  navigate, the select shows this page again and the status region announces "This destination is not yet available."
- **Badge:** shown by default, hidden with `false`, shown with the string `"false"`.
- **Hostile host** (generic CSS including `nav`, `aside`, `article`, lists and spans; content above and below; the script
  executed twice), at 1440 and 390: one owner; the bar (1440×56 links at 1440 px, 390×73 select at 390 px), grid and index keep their layout; after
  scrolling, the bar stays stuck right under the sticky header; the index click lands below the bar and marks the last
  section; no horizontal overflow.
- **Copied live root** with the last index item marked and a changed config: starts with the first item marked, the badge
  hidden, the new links applied, one owner on the new root.
- **Teardown** leaves no instance; **`pagehide`** removes the app and its init marker.
- **No IntersectionObserver:** no index item is marked, as in the source.

## Shared entries and regression

- `ghl/shared/site-chrome/site-chrome.js`: GovNav and LegalNav are built by one `sectionBar()` template; new option
  `legalnav`. The runtime part `site-chrome.govnav.js` is unchanged.
- All 31 other generated pages rebuild byte-identical to main `aac105f` (the three governance pages that use GovNav
  included); Main is untouched. No other installed block needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (408 checks). `ghl/shared/site-links/qa/unit.js`: PASS (215 checks).
  `scripts/tests/footer-route-compatibility.js`: PASS.

## Not verified

- Physical devices and the published page.
- GHL substitution of Custom Values inside `application/json`, and cache propagation.
