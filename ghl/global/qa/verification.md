# Global header/footer pilot — local verification (9 November 2026)

**Scope:** `ghl/global/site-header*.ghl.html` and `site-footer*.ghl.html`, with `contact.global*.ghl.html` and
`governance.global.ghl.html`, compared with today's page blocks `contact.inline.ghl.html` and
`governance.inline.ghl.html`. **Local only** — headless Chromium (Playwright) with the real Plus Jakarta Sans /
JetBrains Mono files; not a published GoHighLevel page. Live GHL is **NOT VERIFIED**.

**Revision:** working tree on `claude/wonderful-ptolemy-k1o60k` after PR #55's commits (`55779c2`), not yet pushed.

Run: `NODE_PATH=$(npm root -g) node ghl/global/qa/pilot.js <outDir>` (≈15 min). Results:
[results/pilot-run.log](results/pilot-run.log), [results/results.json](results/results.json).

## Method

- **Host:** a GoHighLevel-like page (section › row › column › custom-code wrappers). Variant A is today's page
  block in one section. Variant B is the global header, the page's `--global` block and the global footer, each in its
  own section.
- **Custom Values:** substituted as text, like GHL does. Link values become test URLs. Image values stay literal, so
  the inline blocks show their embedded fallbacks.
- **Rendering:** reduced motion, which stops the Contact hero's endless drift; section 1b checks the header with
  motion on. Every font file is loaded before the first screenshot. Fonts are served from a local cache after the
  first download.
- **Loading order:** in the pixel checks, one variant is open at a time.
- **Pixel rule:**
  - Identical. Or:
  - Anti-aliasing only: under 0.2 % of the viewport, and only together with an identical layout (the bounding box of
    every rendered page, header and footer element). These cases are listed separately below.

## Results — 155 checks, 0 failures, no script errors

| Area | Checks | Result |
|---|---|---|
| Full viewport, 13 widths (320–2560) × 5 scroll positions (top, 20 px, 120 px, middle, bottom), both pages | 130 screenshots, plus the document height and the layout of every element per width | **All 130 pixel-identical**, same heights and layouts |
| Motion on: header area at 390 / 1024 / 1440 | 6 | identical |
| Header links at 1440 and 390: text, `aria-current`, `aria-expanded`, `hidden`, href | 4 | identical. The current page is marked as on today's blocks: Contact's "Start a Conversation" and "Contact"; Governance's "Governance" |
| `--util-h` / `--nav-h` seen by the page | 4 | identical (40/117 px desktop, 0/69 px phone) |
| Desktop: dropdown on hover, ArrowDown, Escape, stuck after scrolling, dropdown over page content while stuck | 10 | identical pixels, states, focus |
| Phone: drawer open, Tab wrap (40 Tabs), accordion, Escape, open while stuck, close button; body scroll lock | 12 | identical states, focus, body overflow and layout; drawer-open states anti-aliasing only (below) |
| In-page jumps: GovNav link / select (1440, 390), Contact details (1440, 390) | 4 | same scroll position, target and sticky-GovNav offset |
| GoHighLevel content above and below (300 px), 1440 / 390, 6 scroll positions | 24, plus 4 layout checks | identical layouts; pixels identical or anti-aliasing only (below); header on top once stuck |
| Hostile host (generic element CSS; **every GHL section `position:relative; z-index:1`**), same matrix | 24, plus 4 layout checks | identical; header on top of later sections once stuck (`raiseSection`) |
| Lifecycle (hostile host) | 5 | `raiseSection` lifts the header section to 999. Executing the script three times leaves one owner and one status element. Removal restores `<html>` sizes and the section z-index. Re-insertion re-initialises closed and pinned. `pagehide` tears down |
| Current page when the page block arrives 1.5 s after window load | 1 | marked (the page block announces `bwci:page-ready`) |

**Anti-aliasing only (passed; layout identical):**
- **Drawer open / Tab / accordion at 390 px, both pages:** 144 px, max channel difference 61. The drawer's icons sit
  on half pixels in the design (the close button at y = 11.5). The fixed header is its own compositing layer, so
  Chromium smooths those icons differently.
- **Content above the header, 1440 px, scroll positions 150–700:** Contact 33 px, Governance 42 px, max channel
  difference 1–2 (invisible).

## Found and fixed during the pilot

1. **Translucent stuck header over a coloured GHL section:** the empty placeholder let the section's background show
   through the blurred header. The global roots now have the page wrapper's white background, as on today's blocks.
2. **Font request:** a font link in the global blocks added a second set of `@font-face` rules. That changed which
   font file rendered Governance's own text. The global blocks now load no font and use the page block's.
3. **Current page when the page block runs after the header** (any order in GHL): the `--global` page runtime
   dispatches `bwci:page-ready`, and the header re-reads `data-bwci-current`. This replaced a DOM-observer search that
   stopped at window load.

Test-harness corrections (not product changes): the variants are compared one at a time, and every font file is
loaded and served from a cache. Before that, random fallback-font loads and concurrent pages produced varying
differences in either variant.

## Not covered here

- A real GoHighLevel page:
  - Global Section behaviour;
  - Custom Value substitution inside a global section;
  - GHL's own section CSS, stacking and `transform`s;
  - publication and caching.
- Physical devices; Safari / Firefox.
- The 34 other pages: no `--global` builds yet.
- The pages without `--radius-full` / `--fs-floor-sm` (see the README's differences).
