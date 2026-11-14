# Better World & Impact interaction correction — current verification

**PASS for the corrective page scope.** Baseline: merged Main/shared PR #35, main `3d93dcf17f1d14c8325b679b6f6573ba1153d6ae`.
Run date: October 26, 2026; local Linux Chromium 154.0.8037.57 / Playwright, Python/Pillow. Branch:
`feat/ghl-better-world-impact-interaction`. Machine-readable current evidence: [`results.json`](results.json).
Raw screenshots/logs and QA fixtures are ignored under `_build/qa-output/interaction/`.

## Requirement and intentional source difference

The actual source figure is static. The original request explicitly requires six-stage selection,
previous/next, progress and responsive interaction. PR #34 missed that requirement. This correction
uses the source's retained `STEPS` text, selection/wrap/progress logic and loop/detail/accordion CSS,
with the established Main/Financial Engine pattern. The source files are unchanged. Interactive
engine pixel identity with the static source is neither expected nor claimed.

Six native stage buttons have real hit boxes, keyboard/focus behavior, one active stage, accessible
controlled detail regions and progress. Previous/next wrap and remain available on phones. At 1024px
the UI switches from mobile accordion details to the desktop card without losing selection. Source
Impact considered markers remain on Architecture, Institution and Reinvestment. Examples are labelled
illustrative source examples; evidence/cases remain empty by default. No new claims or destinations.

## Actual checks

| Check | Status | Coverage |
|---|---|---|
| Static/native output | PASS | Both variants compile as native JS; all six source titles/descriptions/examples present; six buttons and both panel sets; three persistent Impact markers; independent routes, prefix, empty data, original hero/logo bytes, escaped config JSON |
| Stage/controls/keyboard | PASS | 30 cases: inline + mocked-HTTP hosted at 320,360,375,390,430,767,768,1023,1024,1280,1366,1440,1600,1920,2560px; all six selections, next/previous wrapping, progress and accessible region state, Arrow/Home/End/Enter/Space, focus outline, real hit boxes, reduced motion and ordinary wheel scrolling |
| Varied heights | PASS | Eight cases: both variants at 390×600, 1024×600, 1440×600 and 1440×1200 |
| Hostile host | PASS | Eight cases: both variants at 320,390,1024,1440px, generic global CSS and surrounding content |
| Normal motion / touch | PASS | Four cases: both variants at 390/1024px with touch emulation and normal motion; controls and keyboard continue working |
| Duplicate / ancestor / resize / destroy | PASS | Four cases: both variants at 390/1440px; duplicate owner identity, detached handlers inert, ancestor replacement/removal/reinsertion without events, default-state reset, exact host overflow restore, one footer line, resize across the breakpoint preserving selection, explicit teardown/reboot |
| Delayed bootstrap / hover / desktop reveal | PASS | One scenario: script twice before markup, one pending owner; inert markup mounts correctly; hover scales inactive dot without selecting; desktop detail revealed within source limits; cleanup restores host overflow |
| Mobile link readability | PASS | One scenario with 16 subcases: eight narrow widths × both variants, including hostile 390px; white text/arrow over dark background and working next-stage control |
| Page/config/motion | PASS | Eight checks: current content/breadcrumb, methodology switch, malformed/invalid config, approved-data templates/text safety/removal, configured/unavailable routes and footer, native anchors/scroll/breakpoints/header toggles, artwork dimensions/drift/reduced stop, hostile menu/touch/lifecycle and no JS/console/network errors |
| Unchanged source sections | PASS with measured raster differences | 15 source widths × source/inline/hosted = 45 captures; 120 section comparisons. Hero, Approach, Methodology and final CTA have identical text and dimensions. Hero/Approach: 60/60 pixel-exact pairs. Later-section crops show subpixel vertical raster differences, described below |
| Preservation and scope | PASS | Both output configs/image values and all markup outside the engine equal `3d93dcf`; design/assets/shared code/other 22 output pairs untouched. Shared generator matches the merged-main baseline in all 22 other page contexts; unknown-link guard retained |
| Rebuild | PASS | Rebuilding the page leaves both output hashes unchanged |
| Live GHL, real fonts/routes/content, physical devices, final whole-site regression | NOT VERIFIED | Separate installation/content dependencies and stage 9 |

There are **56 interaction scenarios** above plus **eight page checks**. The first behavior run passed
53/54 cases; one inline 1023px case hit a whole-page `load` event timeout under concurrent browser
work. The harness now waits for `DOMContentLoaded` and the actual mounted owner. That complete case
passed its focused rerun. No production change was needed for that timeout; aggregate evidence retains
the recovery record. Focused recovery must be dated after the main run.

Manual image inspection caught dark text on the newly used dark mobile Financial Engine link. The
old root selector was scoped as a descendant and did not apply. Corrected it to `:scope #bwi-engine …`
and verified current text/arrow colors plus navigation controls at all eight narrow widths in both
variants. This final CSS-only fix is confined to the engine; the prior unchanged-section captures
remain applicable. Inspected settled phone/desktop engine captures and Methodology comparison crops.

## Source comparison details and limits

Source React uses existing local vendor bytes only in QA. Google Fonts are deliberately blocked on
both sides; actual font delivery/layout is **NOT VERIFIED**. Hosted tests use local HTTP fixtures
serving the original embedded image bytes, not production asset URLs. Screenshots use reduced motion
and `animations:'disabled'` to canonicalize decorative hero drift; source CSS/layout is not rewritten.

Adding engine details changes subsequent sections' document Y positions, including their fractional
pixel positions. Methodology/CTA text, dimensions, markup and styles are preserved, but raw full-page
crops retain that vertical raster phase. Of 120 unchanged-section pairs, 60 are pixel-exact. Raw
RGB-channel>24 differences peak at **2.2673%** of a Methodology crop and **1.5898%** of a CTA crop.
For example, at 360px Methodology begins at source Y=3032.54688 and port Y=3365.4375; rounding raw
capture origins produces a subpixel shift. Those differences are recorded, not normalized away or
claimed as pixel-exact. The engine's added content intentionally increases overall page height.

Historical initial static-port QA is retained at `history/static-port/`. It is not evidence for this
interaction correction. Shared PR #35 results remain its own historical synchronization evidence.

## Reproduce and review boundary

Use the build and split behavior/visual/page-check commands in the page README, then run
`interaction-diff.py`, `shared-regression.js` against `3d93dcf`, and `interaction-results.js`. Raw
fixtures never enter production settings. `CHROMIUM_PATH` overrides the local Chromium binary.

Stop at this corrective PR for manual review/merge. After confirmation, perform stage 9 current
source/port/responsive/interaction regression across all 23 pages. Neither merge nor local browser QA
establishes installation, publication, real asset/font delivery or approved business content in GHL.
