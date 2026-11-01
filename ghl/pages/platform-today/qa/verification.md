# The Platform Today — local verification (1 November 2026)

- **Revision:** branch `feat/ghl-platform-today`, based on main `aa929dd` (design export "Import Claude Design site export").
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
| Page height (px), 320 → 2560 at 900 | 3634 · 3549 · 3477 · 3405 · 3304 · 2687 · 1868 · 1932 · 1958 · 1969 · 1969 · 1969 · 1969, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of hero, stages, "How to read" button, guide dialog, header and footer | 0 differences at 1440, 1024, 768, 390 and 320 |

Two first captures had a few isolated differing pixels (1024 × 900: 10 pixels in 5 rows; 844 × 390: 7 rows). Each was re-captured twice for source and port: every pair, source with source, port with port and source with port, then matched with 0 rows. They were capture noise.

## Behaviour (`_build/behaviour.js`, 39 trace lines, source vs port)

Identical. Covered:
- **Stages and button (390 × 500):** unlit at the top; still unlit at 12 % visible; lit at 25 %, with the button shown; the dots scaled in; still lit after scrolling back to the top, with the button hidden again.
- **Pairs (1440):** hovering each paired card highlights its pair and dims the rest; the unpaired cards change nothing; leaving clears it. Card lift (−2 px) and shadow on hover. Focusing the "View" link changes no pair.
- **Guide (1440):**
  - the transition definitions of the panel, button and backdrop;
  - opening it: class, `aria-hidden`, `<html>` overflow `hidden`, the button hidden, and focus on Close;
  - closing it by Escape, the backdrop, Close and "Got it", each returning focus to the button;
  - Enter on the focused button opens it; Tab moves into the guide body.
- **Bottom sheet and side panel:** 390 × 844, 640 × 800 and 641 × 800 (the 640 px switch) — panel geometry open and closed, and the body scrolling with `overscroll-behavior: contain`.
- **Live resize:** 1100, 1024, 1023 (rail hidden, one column), 700, 1600.
- **Reduced motion:** no rail or dot transition, no pulse, no card transform on hover; the guide still opens.

**Source race, recorded as an intentional difference.** At 1440 × 500 the source lights the stages at load, though they start 651 px down. Its observer first fires at about 400 ms, before the header and breadcrumb components mount, with the stages at 262 px; it fires again at 650 px, not intersecting. The port's observer fires once, with the final layout, so the stages light when 15 % visible. At 390 × 500 the source has no race and the two traces match.

**Dialog timing.** Frame-by-frame, the panel and button follow the same curves in both pages. The port applies the open class in the click handler; React renders it in the next frame, so a single sample a few milliseconds after the click can differ by one frame. The trace compares the transition definitions instead.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`:** the 64-line header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label line differs). Its normaliser now includes `ptd-`. "How It Works" and "The Platform Today" carry `aria-current="page"` in the header and drawer, as `current="today"` does in the source.
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js platform-today ptd …`:** pass, no errors.
  - Config keys and logos, hosted placeholders (no request), showHeader/showFooter, footer wording, link overrides, broken JSON.
  - Hostile host at 1440 and 390: one instance after a duplicate script, no overflow, the header still sticks below host content, the root re-attaches, `body` overflow restored after the drawer, nothing left hidden.
  - Reduced motion: nothing invisible or translated.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:** the breadcrumb and card links are `#` with `aria-disabled`; the hosted block makes 0 image requests; the inline block shows the logo; no raw `{{ }}` reaches the page.
- **Synthetic URLs, both variants:** `providenceAssetManagement` → `/providence-asset-management?v=1`, `platforms` → `/platforms?v=1`, logo from the URL. An absolute URL with spaces, query and fragment is trimmed and kept.
- **Clicks:** a disabled link does not navigate ("Not yet available"); an enabled one does.
- **Guide in a hostile host** (generic CSS on `button`, `article`, `div`, `small`, … , content above and below, the script executed twice; `<html style="overflow:auto">`), at 1440 and 390:
  - one owner;
  - the button stays `position: fixed` with its own styles;
  - the panel opens inside the window, focus goes to Close;
  - `<html>` overflow goes to `hidden` and back to the host's `auto` on Escape, with focus back on the button;
  - no horizontal overflow.
- **Copied live root** while the guide is open and the copy carries 6 stale pair classes, with a changed config:
  - the new owner holds the new root;
  - the guide starts closed;
  - `<html>` overflow is back to the host's `scroll`;
  - 0 pair classes;
  - the new links are applied (`platforms` → `/new-platforms`, `providenceAssetManagement` → unavailable);
  - the guide reopens.
- **Teardown with the guide open:** removing the root restores the host's `<html>` overflow (`scroll`); a later Escape changes nothing; no instance is left.
- **No IntersectionObserver:** the stages are lit at once and the button stays hidden, as in the source.

## Shared link entry (`providenceAssetManagement`)

- `ghl/shared/site-links/index.js` gains the proposed `providenceAssetManagement` → `bwci_url_providence_asset_management`, resolved at build time.
- All 26 other generated pages rebuild byte-identical to main `aa929dd`; Main is untouched. No installed block needs re-pasting.
- `ghl/shared/site-links/qa/unit.js`: PASS (212 checks). `ghl/shared/site-images/qa/unit.js`: PASS (356 checks).

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- The fixed "How to read" button and guide inside GHL's real wrappers.
- Physical devices and the published page.
- The proposed `bwci_url_providence_asset_management` does not exist in the account yet.
