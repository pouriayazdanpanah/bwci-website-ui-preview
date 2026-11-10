# Global header/footer — local verification (9 November 2026)

## Rollout: all 35 pages

**Scope:** every page with a `.global` block — the 34 generated pages and Main — against today's page block
(`<page>.inline.ghl.html`), with `site-header.inline` / `site-footer.inline`. **Local only**; headless Chromium with the
real fonts. The owner tested the pilot pages on a GHL test page (reported working, address not recorded); the other
pages are NOT VERIFIED in GHL.

**Revision:** branch `feat/ghl-global-chrome-pilot` working tree after `ef0bcf2`, committed with this record.

Run: `NODE_PATH=$(npm root -g) node ghl/global/qa/rollout.js <outDir> <shard> 4` for shards 0–3 in parallel
(≈40 min). Results: [results/rollout-run.log](results/rollout-run.log),
[results/rollout-results.json](results/rollout-results.json).

**Method:** as the pilot (one variant open at a time; reduced motion; every font file loaded and served from a cache;
GHL-like host). Per page:
- layout of every page, header and footer element, document height and every content link target, at 7 widths
  (320, 390, 768, 1024, 1280, 1440, 1920);
- pixels at 4 scroll positions per width;
- header state (current-page marks, expanded states, hrefs) and the `--util-h` / `--nav-h` the page sees, at 1440 and 390;
- a dropdown opened over the page while stuck (1440) and the phone drawer opened while stuck (390);
- a hostile host (generic element CSS, every GHL section `z-index:1`) with GHL content above, at 1440 and 390,
  4 scroll positions, header on top once stuck;
- the page's first in-page jump at 1440 and 390;
- the header lifecycle (Main, hostile host) and The Platform Today's overlays in a layered host.

**Pixel rule:**
- identical; or
- with identical layout:
  - anti-aliasing (under 0.2 % of the viewport differs); or
  - imperceptible shading (pixels off by more than 2/255 under 0.2 %, e.g. gradients and resampled images); or
- a recorded token / label difference confined to the header, drawer or footer. If a difference remains, today's
  block is reloaded to see whether it varies by itself (not needed in the final run).

### Result — 35 pages, 853 checks, 0 failures, no script errors

| Verdict for differing screenshots | Count | What |
|---|---|---|
| Anti-aliasing | 83 | Mostly 4 px at the active underline's ends (the pages without `--radius-full`: rounded ends now) or text/icon edges; the phone drawer's half-pixel icons |
| Imperceptible shading | 11 | Colour off by 1/255 over gradients and the hero images (e.g. Ecosystem, Who We Are in the hostile host), with identical layout |
| Token / label differences (recorded) | 8 screenshots + 2 layout notes | The open phone drawer on Ecosystem, Financial Engine, Investors & Partners, Platforms and SMEs & Projects (14 px → design sizes); The Platform Today's phone footer (15 → 16 px text, +28 px height) |

All other screenshots are pixel-identical.

Other checks:
- Header state matches on every page. On Main, today's in-page `#bwci-today` becomes home + `#bwci-today`, which the
  global header turns back into an in-page jump on the real home address.
- `--util-h` / `--nav-h`, in-page jumps and content links all match.
- Menus open over every page's content.
- The header stays on top in the layered host.
- The Platform Today in a layered host:
  - "How to read" stays visible, also over the footer;
  - the open guide covers the header;
  - section layers are restored on teardown.
- Header lifecycle on Main:
  - transparent placeholder (`data-bwci-under-header`);
  - three executions leave one owner;
  - removal restores `<html>` and the sections;
  - re-insertion re-initialises with the same current-page marks;
  - `pagehide` tears down.

### Found and fixed during the rollout

- **Main's hero runs under the header** → `data-bwci-under-header` (transparent placeholder).
- **Main's in-page "The Platform Today" link** → same-page header links become in-page jumps.
- **The Platform Today's floating button and guide** would be covered by separate header/footer sections in a layered
  host → `data-bwci-overlays` (section layered at 998, lifted to 1000 while the guide is open).
- **QA corrections:**
  - screen-reader status elements are excluded from the layout comparison;
  - shading-only rule;
  - footer token rule;
  - Main's same-page link;
  - a control reload for pages that vary by themselves (Providence's world map does).


## Pilot: Contact and Governance

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
