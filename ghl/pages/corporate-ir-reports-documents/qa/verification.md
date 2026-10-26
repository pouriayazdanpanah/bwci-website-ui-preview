# Reports & Documents — current local verification

**Final result: PASS.** Run date: October 26, 2026. Reference:
`design/Corporate IR.dc.html#reports-documents` at merged main `224a81e` after PR #29.
Chromium 154.0.8037.57 via Playwright, Linux. Source React was served from the existing local vendor
copies in QA only. Google font requests were deliberately blocked on both sides; these comparisons
use the same fallback fonts. `design/`, shared generators and all 18 previous delivered blocks are
unchanged. No historical QA was used to declare this page passed.

## Responsive and visual evidence

**All 56 source/output image comparisons are pixel-identical**, with matching section geometry and
page height and no horizontal document overflow. These are 28 source/inline/hosted cases, using the
unaltered source layout. Source review props and control input are set to the corresponding test state;
no source styles or reveal classes are rewritten for matching. The hosted-logo variant uses the
identical supplied local logo URL, injected only by QA. Both production defaults remain unchanged.

| Cases | Result |
|---|---|
| 320, 360, 375, 390, 430, 768, 1024, 1099, 1100, 1101, 1280, 1366, 1440, 1600, 1920, 2560px ×900px, reduced motion | PASS; all requested widths and nav breakpoints |
| 390×600, 1024×1200, 1440×600, reduced motion | PASS |
| 390×900, 1440×900, normal motion | PASS |
| Annual-report type filter, 1440×900 | PASS; two matching rows |
| No-results search, 390×900 | PASS; zero count, no-results card, table/pager hidden |
| Launch (none), 390×900 and 1440×900 | PASS; disabled controls, launch card, count/table/pager hidden |
| Review flags off, 390×900 | PASS; placeholders remain |
| Ascending source order, 1440×900 | PASS; reversed rows and matching icon/focus state |
| Placeholder year plus trimmed Governance search, 768×900 | PASS; two matching rows |

Default source/port screenshots were also inspected visually on desktop and phone; the hostile-host
render was inspected separately. Captures scroll through the page and verify opacity through ancestors
before capture, without forcing visibility. The source's mobile table-header/cascade behavior and
tablet Year-column hiding are preserved.

## Functional, lifecycle and compatibility evidence

| Check | Result / scope |
|---|---|
| Reports-only standalone block: hero + one Reports section, five source metadata rows, no inactive Corporate / IR views | PASS |
| Exact source titles/years/dates/file sizes and review flags; no invented download URLs | PASS; top defaults match source constants and every file URL is `#` |
| Source-vs-port interaction traces at 390/768/1440px, with inline/hosted/hostile variants | PASS; 10 states per trace, 120 state snapshots, 90 matched source/output transitions |
| Type AND Year filters; title OR type search; case and leading/trailing whitespace | PASS |
| Clear resets filters and retains ascending order; whitespace-only query enables Clear; toggling back restores source order | PASS |
| Match count, no-results card, one-page informational pager and Published sort labels/icon | PASS; count follows source match-count semantics; no fake pagination controls |
| Launch mode, review flags off, empty configured records and malformed JSON fallback | PASS; explicit empty array stays empty; malformed fresh config falls back safely |
| Configured metadata with multiple years/types and explicitly approved record | PASS; options derive from the supplied test records |
| Native text rendering, closing-script JSON embedding, unsupported URL and unavailable download handling | PASS; in-memory build fixture round-trips escaped metadata; browser treats markup as text and blocks the unsupported URL |
| Configured file URL navigation | PASS to a local test stub only; real file delivery NOT VERIFIED |
| Correct title/current state; independent page URLs, mobile selector, three-part breadcrumb and Impact destination | PASS; actual local navigation, no hash view switching |
| Unavailable links, keyboard activation/status, visible focus, hover and touch/Escape menu | PASS |
| Sticky nav, live 1099/1100/1101 resize, header/footer off and scoped anchor | PASS |
| Long document title | PASS; increased height without horizontal overflow |
| Repeated script execution while filtered, one sort toggle and root replacement while drawer open | PASS; no duplicate listeners/rows; replacement resets as a fresh mount; new filters work |
| Hostile global styles, content above/below, heading/input layout and body-overflow restoration | PASS |
| Explicit teardown | PASS; filter events stop updating rows; owner/status removed; observers/timers/frames/listeners disposed |
| JavaScript/console errors and unexpected failed network requests | PASS; zero across the matrix and current functional diagnostics; deliberate font aborts excluded and disclosed |
| Scoped/prefixed CSS, browser-ready JS, no DC/React/local runtime imports, config-link coverage and logo equality | PASS |
| Existing shared generator, 18 consumer contexts vs main `224a81e` | PASS; markup, CSS, runtime, routes, dynamic classes and labelled trails byte-identical; unknown-link guard still rejects its in-memory fixture |
| Existing 18 delivered pages at 390/1440px | PASS; 36 smoke cases for visible h1, overflow and JavaScript errors. This is not the later full shared-output migration regression |
| Reproducible outputs, default blocks unchanged by safe JSON embedding, Git whitespace and unchanged source/old outputs | PASS |

Aggregate evidence is committed in `qa/results.json`. Bulk captures and raw logs remain under ignored
`_build/qa-output/`, and plain/hostile wrappers under `_build/preview/`. Reproduction commands are in
the page README. The selected metadata-safety check was repeated after the stronger closing-script
fixture was added; its latest result is included alongside the full earlier interaction diagnostics.

## NOT VERIFIED / intentional differences

- Published GHL installation/runtime, ancestor constraints on sticky layout, hosted asset/page URLs,
  SEO settings, external Google font delivery and real-font rendering.
- Real PDF/file availability and contents, document approvals, titles/years/publication dates/file
  sizes, footer wording and publication readiness. Source metadata remains explicitly unconfirmed.
- The three remaining Corporate / IR subpages, Better World & Impact, Main/shared output migration
  and the final full affected-page regression.

Intentional implementation differences: one independent page replaces the hash-switched Reports view;
editable record metadata/file URLs replace source constants; safe native DOM/template rendering hides
and reorders filtered rows; plain-text options replace DC spans; Published header adds `aria-sort`.
Sort deliberately reverses configured newest-first source order rather than inventing date parsing
for placeholder dates. Source layout and behavior otherwise match the rendered reference.

Stop at this page's PR. Shareholders starts after merge is confirmed and main is refreshed.
