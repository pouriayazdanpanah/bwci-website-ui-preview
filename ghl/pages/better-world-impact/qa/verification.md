# Better World & Impact — current local verification

**Final result: PASS.**

Run date: October 26, 2026. Reference: `design/Better World Impact.dc.html` at merged main `b439054`
after Legal Notices PR #33. Chromium 154.0.8037.57 via Playwright on Linux. Source React is routed
from existing local vendor files only for QA; remote Google Fonts are blocked on both sides for
matching fallback-font comparisons. No historical result passes this page. Design, shared generator
and all 22 earlier output blocks remain unchanged.

## Responsive and image evidence

The matrix covers **24 cases**: default reduced-motion widths 320,360,375,390,430,767,768,1023,
1024,1280,1366,1440,1600,1920,2560 at 900px height; 390×600, 1024×1200, 1440×600; normal motion
at 390/1440×900; methodology off at 390/1440×900; approved-data fixtures at 390/1440×900.

Every case compares source, inline and hosted output. Hosted tests override the image URLs with
the identical local supplied hero/logo. Approved-data fixtures explicitly say QA only and use a
local logo image and destination; no fixture enters production defaults. The source reference sets
the matching methodology prop/empty-or-fixture arrays only. No source content or layout CSS is rewritten.

Screenshots canonicalize infinite decorative artwork drift at t=0 with Playwright
`animations:'disabled'`. Actual animation settings/movement are tested separately: source leaves
drift on under reduced motion, while the port deliberately stops it. The helper scrolls through all
content and checks opacity through ancestors without forcing visibility. No source paint or reveal
state is fabricated for comparison.

All **24 cases PASS**, with matching source/output section geometry/page heights and no horizontal
document overflow. **All 48 deterministic source/inline/hosted image comparisons are pixel-identical**
with matching fallback fonts and the documented animation-frame setup. Functional and matrix runs
contain zero JS/console errors or unexpected failed network requests. Current measurements are in
`results.json`.
Bulk captures/logs and plain/hostile wrappers are ignored under `_build/`.

## Functional, lifecycle and compatibility evidence

| Check | Current result / scope |
|---|---|
| Exact hero/approach/engine/methodology/final CTA source content and breadcrumb | PASS; default visible sections = five |
| Static accessible six-stage diagram | PASS; one figure role=img, six items, three fixed markers, zero engine/main buttons; clicking does not change stages |
| Methodology off, malformed JSON, incomplete evidence/cases and invalid image URL | PASS; safe launch defaults/no fabricated records or requests |
| Complete evidence/case templates and local case destination | PASS; shown only with explicit QA data; source/output visual fixture comparison is in the matrix |
| Text-safe approved data | PASS; HTML-looking label remains text, no injected image/script execution |
| Copied root after clearing data | PASS; old cards removed and empty sections hidden |
| Contact/Financial Engine destinations, unavailable keyboard feedback, focus and independent Impact current link | PASS; actual local fixture navigation; deployed URLs NOT VERIFIED |
| Scoped approach anchor, wheel/native scrolling, 767/768/1023/1024 live resize | PASS; no scroll capture or overflow |
| Supplied artwork/native size and motion | PASS; 2022×778 original image, normal 14s drift moves, reduced-motion drift stops |
| Header/footer off, sticky shared header/current How It Works context | PASS within local preview; published ancestor conditions NOT VERIFIED |
| Copied configured route and optional footer regulatory line | PASS; stale disabled state cleared; exactly one footer line |
| Hostile global CSS, surrounding content, touch/Escape/Tab menu behavior | PASS; scoped appearance and surrounding host unaffected |
| Duplicate script, replacement with drawer open, exact prior body-overflow restoration and teardown | PASS; one owner/status, working replacement menu and cleanup |
| Functional JS/console errors or unexpected failed requests | PASS; zero; deliberate font aborts disclosed/excluded |
| Standalone scoped/prefixed output, native JS syntax, config keys, labelled breadcrumb | PASS |
| Image identity and escaped JSON | PASS; supplied PNG byte-equal; in-memory closing-script fixture round-trips as text |
| Shared generator vs main `b439054`, 22 earlier contexts | PASS; markup/CSS/runtime/routes/dynamic classes byte-identical; unknown-link guard and labelled trail checks retained |
| Existing 22 delivered blocks at 390/1440px | PASS; 44 current smoke cases for visible h1, document overflow and JS errors |
| Reproducible hosted/inline outputs and whitespace | PASS; output rebuild identical, Git whitespace clean |

This earlier-page smoke does not replace the later full shared-output synchronization regression.
The shared baseline was exported through Git and supplied to the comparison runner. Current aggregate
evidence is in `results.json`; reproduction commands are in the page README.

## NOT VERIFIED / differences

- Published GHL, ancestor conditions for sticky behavior, actual fonts/hosted assets/page URLs and SEO.
- Approved real evidence, case-study content/images/alt text, source/date claims and linked destinations.
  Source arrays and production defaults are empty; no impact metrics or cases are inferred.
- Real Contact or methodology publication/destination and legal/footer content approval.
- Main/shared synchronization and final full affected-page regression, including older copied-root
  link/footer/option normalization and preserving the old Main Impact anchor.

The source engine is static despite unused interactive script/CSS definitions. Preserving that actual
view is a corrected inventory finding. Other architecture changes: scoped IDs/configured routes,
native hidden containers/inert templates for approved conditional data, no export paint hold, and
merged root-owner cleanup. Reduced motion additionally stops the source's decorative artwork drift.

Stop at this PR. Main/shared synchronization starts after confirmed Impact merge and refreshed main;
final affected-output regression follows.
