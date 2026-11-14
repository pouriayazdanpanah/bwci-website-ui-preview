# Better World & Impact — design export 141ee23 verification

**Local QA PASS; live GHL NOT VERIFIED.** Source: `design/Better World Impact.dc.html` at main `141ee23`.
Branch `feat/ghl-better-world-impact`. Run date: 14 November 2026; local headless Chromium / Playwright, Pillow.
Remote fonts were blocked in both source and port (identical fallback fonts), so real web-font layout is not verified.

## Scope

Owner decision (14 November 2026): the Financial Engine is the design's static figure, not the interactive engine of
PR #36, and the rest of the page follows the design. The source is rendered with the port's launch settings through its
data-props (`reviewFlags` false, `approachCopy` "current site copy"); the `review` scenario renders both with the
design's own defaults (flags on, approach placeholders).

## Results

| Check | Status | Coverage |
|---|---|---|
| Static build checks (`static-checks.js`) | PASS | Both regular outputs: no engine controls or tags; one static `role="img"` figure with six stages; the five new section ids; 65 source text runs of the new sections and the three approach texts verbatim; the placeholder string in the runtime; launch settings; `bwi-` class prefix; JS syntax; escaped JSON |
| Page checks (`qa.js --checks-only`) | PASS 9/9 | Content and section order; static engine; launch defaults; review flags (5), placeholders and engine-copy override, re-read after root replacement; invalid JSON keeps defaults; unsafe hero URL falls back; draw-in arming below the fold, drawing in view, nothing armed under reduced motion; approved evidence/case templates and text safety; Start a Conversation / Financial Engine links and unavailable feedback; scoped `#bwi-approach` anchor, wheel scrolling, engine ring breakpoint at 1024px; header/footer switches; hero artwork drift and reduced-motion stop; hostile host, touch menu, duplicate script, root replacement and teardown; no JS, console or network errors |
| Source vs port pixels | PASS | Full-page captures, source vs inline and hosted output, reduced motion, widths 320, 360, 375, 390, 430, 767, 768, 1023, 1024, 1280, 1366, 1440, 1600, 1920, 2560 at 900px high, plus 390×600, 1024×1200, 1440×600: **0 changed pixels** in every pair, same page height and section geometry, no horizontal overflow |
| Normal motion, review and approved-data scenarios | PASS | 390/1440 normal motion (after draw-ins settle); review mode (flags on, approach placeholders) at 390/768/1440; approved evidence/case fixtures at 390/1440: **0 changed pixels** in every pair, same geometry. 25/25 matrix cases, 75 captures, no JS/console/network errors |
| Hostile host (390px) | PASS | Generic host CSS, content above and below, script executed twice: rendering matches the design by eye; no overflow |
| Live GHL, real fonts, physical devices | NOT VERIFIED | |

The matrix ran on  minus the teardown change in the same commit (un-arming undrawn figures on destroy); that
change does not affect rendering, and the page checks were re-run on the final build () and pass 9/9.

## Fixed during QA

On phones "How the Financial Engine works" rendered dark text on the dark button: the shared `#root.bwi-bw .bwi-link`
rule outranked the translated `.bw a.en-link`. The page rule now keeps the `bwi-bw` class (`:scope.bwi-bw a.bwi-en-link`),
the same specificity order as the design, and is white and full width as designed.

## Kept as designed

The renewal motif's SVG labels scale with the figure (about 10px desktop, 8px phones; decorative, `aria-hidden`, the same
words are in the rows). The measurement panel's dot pattern reaches the start of its text on phones.

## Commands

See the page [README](../README.md#current-verification). Raw captures stay ignored under `_build/qa-output/`.
