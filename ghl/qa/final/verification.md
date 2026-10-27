# Final local regression — October 27, 2026

**PASS locally:** all 23 GHL pages / 46 production blocks, after merged Main/shared PR #35 and
Impact interaction PR #36. This branch, `test/ghl-final-regression`, starts directly from clean,
refreshed main `7ddc04f85fed7fc457d5d25fc2d42e834d15807f`. It contains one confirmed Main image-fit
correction and current regression evidence. Review and merge are manual; publication is separate.

Machine-readable evidence: [`results.json`](results.json). Page maintenance instructions remain in
the [implementation inventory](../../../docs/implementation/README.md) and individual page READMEs.
Older page-local reports describe their original revisions. The shared synchronization report is
stage 8 history; the counts below were rerun against the current outputs.

## Production correction

Main's `fitSlot()` already computes the source image-slot's cover-sized image box. Clearing inline
`objectFit` then exposed the block's CSS `object-fit: cover` fallback, which fitted the image a second
time inside that box. Both directly edited Main outputs now set `objectFit = 'fill'` after sizing,
matching the source's default fit inside its computed box. The CSS fallback still handles images
before their dimensions are available. No markup, configuration, asset or design file changed.

The 375px diagnostic became pixel-exact against source. All 19 Main viewport cases were recaptured
after the fix, followed by its source/native behavior traces, focused controls, six shared-menu cases,
six image-geometry cases, static checks and output reproducibility. At 375×900 and 844×390, source,
inline and hosted frame/image boxes for the four Impact photos match exactly; all five saved photo files are byte-identical to
`design/image-slots.state.json`. Main keeps its direct-edit workflow and has no `_build/` folder.
The other 22 pages and shared production code are unchanged from the merged baseline.

## Environment and capture method

Chromium 154.0.8037.57, Playwright, Python/Pillow and a Linux loopback HTTP server. Google Fonts
requests were deliberately aborted on both sides; comparisons use matching fallback fonts.
Source React is served from existing local vendor bytes only by development fixtures. Native blocks
contain no source React, `support.js`, vendor imports, local modules or source-relative asset URLs.

The matrix captures actual source, current inline output and current hosted output. Hosted fixture
URLs serve the original embedded asset bytes over local HTTP. Fixtures never enter production
configuration. Static screenshots use reduced motion, disabled screenshot animations and real
scrolling to settle reveals and paint offscreen images. The matrix does **not** clear source reveal
attributes, rewrite source CSS, align pixels or resize images to manufacture a match. Normal-motion
hover, keyboard, touch, wheel and lifecycle behavior is exercised separately.

Every page includes these widths at height 900: **320, 360, 375, 390, 430, 768, 1024, 1280, 1366,
1440, 1600, 1920, 2560**, plus **767 and 1023**. Every page also includes **390×600, 1440×600,
1440×1200 and 844×390**. All six Corporate / IR pages add **1099/1100/1101**; Ecosystem adds
**963/964/965** around its map breakpoint. This yields 458 viewport cases and 1,374 final captures.
Phone hero pairs for all 23 pages, ten representative desktop hero pairs and the largest remaining
raster differences were visually inspected. Pixel and section geometry checks cover the full pages.

## Coverage and results

| Check | Result | Coverage |
|---|---|---|
| Responsive source/inline/hosted matrix | PASS | 23 pages, 458 viewport cases; headings and section text agree except the deliberately interactive Impact engine; loaded images; no document horizontal overflow |
| Hosted vs inline pixels | PASS | **458/458 full-page pairs pixel-exact** with identical fixture assets |
| Source vs native pixels | Reviewed | **822/858** equal-size full-page pairs pixel-exact; **3,830/3,962** comparable section pairs exact; remaining differences and excluded heights explained below |
| Current static/native checks | PASS | 46 blocks; syntax, isolated roots/config IDs/owners/prefixes, unique IDs, one heading, links, local/cross-page anchors, source-runtime exclusion and original embedded assets |
| Build guards | PASS | 44 missing/unknown-unused-key fixtures across 22 builders; unknown design href rejected; independent Impact route and old homepage `impact` values preserved |
| Output reproducibility | PASS | 22 builders rerun; all 46 outputs unchanged by rebuilding, including direct-edit Main |
| Full shared-menu contract | PASS | 138 cases: each page in both variants at 390/1440px, plus header/footer-off and malformed JSON; hover, keyboard, Escape/outside close, sticky state, mobile trap/accordion, host overflow restoration and teardown |
| Shared synchronization/lifecycle suite | PASS | 92 fresh cases across all 23 pages, both variants and 390/1440px in hostile CSS; repeated scripts, config changes, ancestor replacement/removal/reinsertion, disabled-link normalization and exact body-overflow restoration |
| Deferred markup / explicit destroy/reboot | PASS | 23 fresh page cases; duplicate execution before markup, insertion, destroy, mutation after destroy and explicit reboot |
| Existing page interaction traces | PASS with reviewed raw deltas | Nine source/current-inline pairs, 397 paired state snapshots; wheel, keyboard, touch, scroll, selectors, filters and page-specific controls in their existing scenarios |
| Focused source/inline/hosted controls | PASS | Nine cases resolving Main delayed hover/editor Tab order, Board settled link hover and Investors principle hover/focus |
| Individual profiles | PASS | Seven profiles × 18 scenarios = 126; 84 data/entry snapshots; direct, Board, Leadership and invalid context; source-matching portraits/roles/bio/related cards, sticky nav, hover/focus, drag threshold, mouse drag, touch swipe and reduced motion |
| Corporate / IR and Impact page/config checks | PASS | 62 checks rerun across the six IR pages and Impact, including available/empty data, filters/routes, config modes and lifecycle contracts |
| Impact interaction | PASS | 56 fresh scenarios for both variants: six-stage selection, previous/next wrap, progress, details, desktop/phone layout, keyboard/touch, motion, scroll and lifecycle |
| Platforms config/URL state | PASS | Ten current-output scenarios; placeholder/hosted assets, toggles, malformed JSON and query updates preserving unrelated parameters, hash and host history state |
| Main image geometry | PASS | Six source/inline/hosted cases at 375×900 and 844×390; maximum CSS-pixel delta 0; original five saved photo byte streams preserved |
| Native diagnostics | PASS | No unexpected JavaScript, console, failed-asset or HTTP errors in the final native matrix, profile, shared-menu, focused, IR and Impact runs |

There is no combined “test total”: the rows count different things and some exercise overlapping
behavior. `results.json` records each page's source/hash, viewport sizes, heights, exact-pixel counts,
functional states and the reviewed exceptions.

## Visual differences and source diagnostics

Equal-size source/native full-page comparisons exclude 58 pairs whose heights differ intentionally:
38 Impact pairs (its required interactive engine replaces the static export figure) and 20 narrow
Company/Regulatory pairs (approval badges wrap instead of clipping). Corresponding equal-size
sections are still compared. The Impact engine itself is tested by the dedicated interaction suite.
Company is 15px taller in the five affected phone cases. Regulatory is 31px taller at 320/360/375px
and 15px taller in the two 390px height cases. These are existing documented differences.

The 36 remaining non-exact equal-size full-page pairs are restricted to:

| Page | Exact source/native pairs | Largest percentage with any RGB channel delta >24 | Inspection |
|---|---:|---:|---|
| Main | 28/38 | 0.000022% | Fitted Impact photographs; at four affected sizes the maximum channel delta is 3–9, with no pixels over 24. At 1024px only two pixels exceed 24. Frame/image geometry and bytes agree; 375px is exact after the fit correction |
| Ecosystem | 20/44 | 0.020132% | Thin rule/diagram raster differences; the largest above-threshold difference at 963px is confined to two horizontal pixel rows. Text, layout and interaction states agree |
| Corporate / IR Overview | 42/44 | 0.004578% | Small raster difference in the “Section” selector label at 1024px; content and geometry agree |

Every other equal-size source/native full-page pair is pixel-exact. Raw pixel comparisons count
**any** changed channel separately from the >24 measure; the latter is a diagnostic threshold, not
a claim of pixel identity. All native hosted/inline comparisons remain exact.

The 397 legacy trace pairs contain **24 raw state deltas**, retained in `results.json`:

- Main: two Tab snapshots include source image-slot's invisible editor buttons. Native cards omit
  Artifact editing controls and move directly to the next product card. The focused suite also checks
  cancellation of the 70ms hover delay and settled hover/click/focus on all three render variants.
- Board: three editor-only Tab stops and two transition-frame hover styles. The isolated, fully
  settled source/inline/hosted link styles agree. Leadership has three editor-only Tab-stop deltas.
- Investors: 14 snapshots retain a different inactive principle after the test pointer crosses cards
  while exercising other pinned sections. Active wheel/route state agrees. Isolated explicit hover
  and keyboard focus select each of the three principles correctly on source and both native variants.

Source-only console output is recorded rather than suppressed: Ecosystem emits four SVG parser
messages while literal `{{p.x}}`/related template coordinates await hydration. Platforms emits one
`reading 'mat'` error because the export's `componentDidUpdate` expects previous state while
`support.js` forwards only previous props. The Platforms README already documents this source URL
writing quirk. A separate six-case attribution run reproduces the two source diagnostics and finds
zero such errors in either native variant. No design file was changed to silence them.

## Capture and driver recoveries

Initial captures missed offscreen reveals/photographs. The driver now scrolls the current viewport
through the document and visits each still-pending visible reveal via a stable element handle.
Main 375px and Investors 1920px screenshot timeouts were recaptured on fresh pages. A tiled Investors
2560px source bitmap was rejected despite normal DOM geometry; a fresh capture is pixel-exact.
These attempts are retained in ignored raw output and recovery metadata. Final counts above use
complete passing captures. This capture repair exposed the real Main fit bug described above.

The profile driver now derives related-card counts from the actual Board list, excluding the person
being viewed; centers galleries outside sticky chrome before dragging; and waits for terminal hover
opacity instead of an intermediate animation frame. The full 126-scenario suite passed afterward.
The malformed-config fixture is corrupted only after constructing a valid host wrapper. All 138
menu cases passed with that corrected fixture. Early failing jobs and recovery logs remain under
ignored `output/`; they are not represented as unresolved production failures or erased from history.

## Reproduce

Provide Node, Playwright, `/usr/bin/chromium` (or `CHROMIUM_PATH`), Python and Pillow. Run from repository
root. The generated screenshots, wrappers, detailed logs and intermediate JSON live under ignored
`ghl/qa/final/output/`; committed `results.json` is the durable review index. Browser runs take time.

```sh
node ghl/qa/final/static.js
node ghl/qa/final/reproducibility.js
python3 -m http.server 8125 --bind 127.0.0.1
```

In a second terminal while the server is running:

```sh
node ghl/qa/final/matrix.js http://127.0.0.1:8125
python3 ghl/qa/final/pixels.py
node ghl/qa/final/traces.js http://127.0.0.1:8125 --slugs=main,financial-engine,ecosystem
node ghl/qa/final/functional.js http://127.0.0.1:8125
python3 ghl/qa/final/compare-traces.py
node ghl/qa/final/focused.js http://127.0.0.1:8125
node ghl/qa/final/chrome.js http://127.0.0.1:8125
node ghl/qa/final/source-diagnostics.js http://127.0.0.1:8125
node ghl/qa/final/image-geometry.js http://127.0.0.1:8125
node ghl/pages/platforms/_build/make-previews.js
node --require ./ghl/qa/final/browser-preload.js ghl/pages/platforms/_build/config-and-url.js http://127.0.0.1:8125/ghl/pages/platforms/_build/preview/ > ghl/qa/final/output/platform-config-url.log
python3 ghl/qa/final/aggregate.py
```

The functional runner runs the other six legacy traces, all profiles, six IR page suites, Impact
interaction/page suites and shared/deferred suites sequentially. The aggregate rejects incomplete
coverage, failed cases, unexpected diagnostics, unclassified trace differences and non-exact native
variant pairs. `matrix.js --slugs=main --recover --cases=375x900,844x390` archives the previous result,
retains other passing cases and recaptures selected sizes. Run `pixels.py main` afterward. Focused
and chrome `--slugs=main` runs write targeted files; the aggregate uses these only when newer than
the full run, requiring all three/six Main cases. A new complete run needs no targeted files.

## Publication boundary

The local regression stage is complete and ready for PR review. Actual GHL installation/paste limits,
GHL wrapper behavior, real Google Fonts delivery/layout, physical devices, published URLs/SEO and
approved company/regulatory/evidence/case content remain **NOT VERIFIED**. Existing unavailable
destinations and empty approved-data arrays stay explicit. No URLs, facts, policies, announcements
page or evidence records were invented. A merge does not deploy these blocks to GHL; installation,
configuration and verification on the actual published pages are the next separate stage.
