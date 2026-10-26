# Legal Notices — current local verification

**Final result: PASS.**

Run date: October 26, 2026. Reference: `design/Corporate IR.dc.html#legal-notices` at merged main
`f1324c6` after Regulatory PR #32. Chromium 154.0.8037.57 via Playwright on Linux. Source React is
routed from existing local vendor files only for QA. Google Fonts requests are deliberately aborted
on both sides; source and output use matching fallback fonts. No historical result passes this page.
Design files, shared generators and all 21 earlier output blocks are unchanged.

## Responsive and visual evidence

The source, inline and hosted output matrix covers 23 cases: 320,360,375,390,430,768,1024,1099,1100,
1101,1280,1366,1440,1600,1920 and 2560px at 900px height/reduced motion; 390×600, 1024×1200,
1440×600; normal motion at 390×900 and 1440×900; flags off at 390×900 and 1440×900. Hosted tests
override only the logo URL with the identical supplied local PNG. Test routes do not enter defaults.

No source style, table layout or content correction is applied. The flags-off reference sets only
the matching review prop. The capture helper scrolls through all content, reveals source/port rows
normally, and checks opacity through ancestors without forcing visibility. All seven rows and two
review notes must be visible in the default captures; the source's mobile table-header cascade remains.

All **23 cases PASS**, with matching source/output section geometry and page heights and no
horizontal document overflow. **All 46 source/inline/hosted image comparisons are pixel-identical**
with matching fallback fonts. No source CSS normalization or page-specific visual change is applied.
One initial 430px local navigation hit the 30-second load timeout; a targeted repeat passed without
production changes. Initial failure and successful retry provenance are recorded in `results.json`.
Matrix and functional runs contain zero JS/console errors or unexpected failed network requests. Bulk captures/logs are ignored under `_build/qa-output/`; plain/hostile host wrappers
are ignored under `_build/preview/`.

## Functional, lifecycle and compatibility evidence

| Check | Current result / scope |
|---|---|
| Only Legal Notices: hero, one table, three headers, seven rows/21 cells | PASS; no inactive Corporate / IR views |
| Each source title, summary, date placeholder and correct warning ownership row | PASS; compared with the source LEGAL data, not another port's result |
| Two exact source owner-review notes; flags off leaves all seven rows/dates; malformed JSON | PASS in inline/hosted checks |
| Seven unavailable policy URLs | PASS; separate keys default `#`; keyboard activation gives status without a hash jump |
| Seven independently configured policy destinations | PASS; every row navigates to its own local stub; actual policies NOT VERIFIED |
| Current nav/selector and Home → Corporate/IR → Legal notices breadcrumb | PASS |
| Actual independent page navigation, native selector and Impact destination | PASS; distinct local routes, no source hash-view switching |
| Keyboard/focus/hover and mobile touch/Escape menu | PASS |
| Live 1099/1100/1101 resize, sticky section bar and release at main's end | PASS; bar stays below the header while pinned and ends before footer |
| Header/footer off, long legal summary and scoped notice anchor | PASS; no horizontal document overflow |
| Copied root with newly configured policy/page URLs | PASS; valid links lose copied disabled/title state; native option loses unavailable label |
| Copied optional footer regulatory line | PASS; exactly one after replacement |
| Hostile global CSS and content above/below | PASS; scoped text/font/background, surrounding host unaffected |
| Duplicate script, replacement with drawer open, exact prior body-overflow restoration, working new menu and teardown | PASS; one owner/status, complete cleanup |
| Functional JS/console errors or unexpected failed requests | PASS; zero; deliberate font aborts excluded/disclosed |
| Standalone scoped/prefixed output, native JS syntax, config keys, supplied logo equality and labelled breadcrumb | PASS |
| Safe JSON script embedding | PASS; in-memory closing-script fixture is escaped and round-trips as text without changing actual settings |
| Shared generator vs main `f1324c6`, 21 earlier contexts | PASS; markup/CSS/runtime/routes/dynamic classes byte-identical; label fallback/escaping and unknown-link guard retained |
| Existing 21 delivered blocks at 390/1440px | PASS; 42 current smoke cases for visible h1, document overflow and JS errors |
| Reproducible hosted/inline outputs and Git whitespace | PASS; both variants rebuild byte-identically |

Earlier-page smoke does not replace the later full shared-output migration/interaction/visual regression.
The shared baseline was exported from Git and supplied as a file to the comparison runner. Current
aggregate evidence is in `results.json`; reproduction commands are in the page README.

## NOT VERIFIED / intentional differences

- Published GHL installation, live runtime and ancestor conditions for sticky behavior.
- Actual Google Fonts delivery/layout, hosted logo/page/policy URLs and SEO settings.
- Underlying policy contents, ownership/applicability, dates and footer legal/regulatory approval.
  The design's missing Legal.dc.html policies are not created or inferred by this port.
- Better World & Impact, Main/shared synchronization and final full affected-page regression,
  including older copied-link/footer/option normalization.

Architecture: one independent page replaces the source hash view; native options use plain text,
inline CSS removes the delayed paint hold, and absent policy destinations become configurable
unavailable states. No page-specific visual or content change is intentional. Root replacement
normalization follows merged Regulatory. Hiding review notes does not approve source claims.

Stop at this page's PR. Better World & Impact begins after confirmed merge and refreshed main.
