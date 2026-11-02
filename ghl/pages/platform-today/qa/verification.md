# The Platform Today — local verification (2 November 2026, hero update)

- **Revision:** branch `feat/ghl-platform-today-hero`, based on main `df79d85` (design export "Import Claude Design site export", which added the hero image `platform-today-hero-arcs.png` and the new hero layout to `design/Platform Today.dc.html`).
- **Earlier revision:** the first port (export `aa929dd`, PR #45) passed the same suites; that record is in this file's history.
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 %, 0 rows |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Landscape phones 844×390 and 568×320 | 0.000 %, 0 rows |
| Page height (px), 320 → 2560 at 900 | 3634 · 3549 · 3477 · 3405 · 3304 · 2810 · 1940 · 2039 · 2088 · 2123 · 2127 · 2127 · 2127, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of hero, stages, "How to read" button, guide dialog, header and footer | 0 differences at 1440, 1024, 768, 390 and 320 |

The hero image renders on the right at desktop widths and as a dimmed cover background below 768 px, in both pages.

## Behaviour (`_build/behaviour.js`, 39 trace lines, source vs port)

Identical, over three further runs. Covered, as for the first port:
- the stages lighting at 15 % and the button following them;
- the pair highlight and card hover;
- the guide dialog: transitions, open, focus, scroll lock, Escape, backdrop, Close, "Got it", focus return, keyboard;
- the bottom sheet at 390 × 844, 640 × 800 and 641 × 800;
- live resize;
- reduced motion.

**Changes to the trace script for this revision.** The taller hero made two timing effects of the source visible; neither is a page difference.
- **Scrolls are now instant.** The source sets `html{scroll-behavior:smooth}`, so the trace's `scrollIntoView` animated there, and the first hover landed mid-scroll. The port leaves the host's `<html>` alone.
- **It waits for the shared scroll motion to settle** (scans at 0.3, 1.2 and 2.6 s after `load`). The source reaches `load` later, because it fetches its 2.3 MB hero from a file.

One run sampled the dialog 600 ms after Escape while its delayed `visibility` change (0.45 s) had not yet applied in the port. Three further runs of both pages matched.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`:** the 64-line header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label line differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js platform-today ptd …`:** pass, no errors.
  - Config keys and logos; hosted placeholders (no request; 4 images without `src`: three logos and the hero).
  - Hostile host at 1440 and 390: one instance, no overflow, re-attached, body overflow restored, nothing left hidden.
  - Reduced motion: nothing invisible. The one "translated" element is the hero image (`translate: 0 -50%`, its vertical centring), the same in the source.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - the links are `#` with `aria-disabled`;
  - the hosted block makes **0 image requests**, with the hero hidden and the logos without `src`;
  - the inline block shows the original hero (1604 px) and logo from `imageFallbacks`;
  - no raw `{{ }}` reaches the page.
- **Synthetic URLs, both variants:** the hero and logo load from their URLs (1604 and 640 px wide); `providenceAssetManagement` → `/providence-asset-management?v=1`, `platforms` → `/platforms?v=1`. An absolute URL with spaces, query and fragment is trimmed and kept.
- **Clicks:** a disabled link does not navigate; an enabled one does.
- **Guide in a hostile host**, at 1440 and 390, with the script executed twice and `<html style="overflow:auto">`:
  - one owner;
  - the fixed button keeps its styles;
  - the panel opens in the window with focus on Close;
  - `<html>` overflow goes to `hidden`, then back to `auto`;
  - no horizontal overflow.
- **Copied live root** while the guide is open and the copy carries 6 stale pair classes, with a changed config:
  - the guide starts closed;
  - `<html>` overflow is back to the host's `scroll`;
  - 0 pair classes;
  - the new links are applied;
  - the stages and button follow the observer again: at the top of the taller page they start unlit, and light on scrolling to them;
  - the guide reopens.
- **Teardown with the guide open:** the host's `<html>` overflow is restored; no instance is left.
- **No IntersectionObserver:** the stages are lit at once and the button stays hidden, as in the source.

## Shared image entry (`platformTodayHeroImage`)

- `ghl/shared/site-images/index.js` gains `platformTodayHeroImage` → `bwci_img_platform_today_hero`, page-only and declared by this page's build. The proposed value is also in `bwci-image-custom-values-to-create.json`.
- All 26 other generated pages rebuild byte-identical to main `df79d85`; Main is untouched. No other installed block needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (369 checks), including the frozen shared list. `ghl/shared/site-links/qa/unit.js`: PASS (212 checks).

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- The fixed "How to read" button and guide inside GHL's real wrappers.
- Physical devices and the published page.
- The proposed `bwci_img_platform_today_hero` and `bwci_url_providence_asset_management` do not exist in the account yet.
