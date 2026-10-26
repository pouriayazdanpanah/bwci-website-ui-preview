# Shareholders — current local verification

**Final result: PASS.**

Run date: October 26, 2026. Reference: `design/Corporate IR.dc.html#shareholders` at merged main
`65a5a44` after Reports PR #30. Chromium 154.0.8037.57 via Playwright, Linux. Source React is served
from existing local vendor files only in QA. Google fonts are deliberately blocked on both sides;
comparisons use the same fallback fonts. Design files, shared generators and old outputs are unchanged.
No historical QA is used to mark this page passed.

## Responsive and visual matrix

Source, inline and hosted-logo output are compared in **23 cases**. The hosted test points at the
identical supplied local logo using a test-only config response. Default cases cover 320, 360, 375,
390, 430, 768, 1024, 1099, 1100, 1101, 1280, 1366, 1440, 1600, 1920 and 2560px at 900px height,
with reduced motion. Additional cases: 390×600, 1024×1200 and 1440×600; normal motion at 390×900 and
1440×900; flags off at 390×900 and 1440×900.

All 23 cases have matching section geometry/page height and no horizontal document overflow.
**All 46 source/output image comparisons are pixel-identical**, with matching fallback fonts.
Measurements are recorded in `results.json` beside this report. Source styles/content are not rewritten for comparison; only the source review
prop is set for the matching flags-off case. The capture helper scrolls through content and verifies
opacity through ancestors without forcing visibility. The source's visible mobile table header is
preserved. Bulk captures/logs are ignored under `_build/qa-output/`; plain/hostile wrappers are under
`_build/preview/`.

## Functional, lifecycle and compatibility evidence

| Check | Result / current scope |
|---|---|
| Shareholders only: hero + three sections, four facts, two meeting rows and one enquiry card | PASS; no inactive Corporate / IR page views |
| Exact source currency/share/registrar/secretary placeholders, AGM dates/year, Notice/Results labels, name/role/email/postal text | PASS |
| Six review flags; flags off preserves placeholders; malformed JSON keeps safe fresh-block defaults | PASS in inline/hosted cases |
| Dummy email is not activated; both meeting URLs and IR email default to `#` | PASS; unavailable ARIA/title/status and keyboard activation do not jump |
| Two independently configured file destinations | PASS; both links navigate to distinct local stubs only; real files NOT VERIFIED |
| Approved IR email config | PASS; correct `mailto:` href without sending email; actual delivery NOT VERIFIED |
| Correct title/current nav/selector and Home → Corporate/IR → Shareholder information breadcrumb | PASS |
| Actual configured independent page navigation, mobile selector and Impact destination | PASS; no hash view switching |
| Visible focus, hover, touch/Escape menu, sticky and live 1099/1100/1101 resize | PASS |
| Header/footer off, long shareholder text and scoped meeting anchor | PASS; expanded content has no horizontal overflow |
| Copied root with new configured destinations | PASS; stale disabled attributes are cleared and valid hrefs applied |
| Copied root with optional regulatory footer line | PASS; one line after replacement, no duplicate |
| Duplicate execution, root replacement while drawer open, body-overflow restoration and teardown | PASS; one owner/status and working new menu |
| Hostile global styles, surrounding content, heading font, background and text alignment | PASS |
| JavaScript/console errors and unexpected failed network requests | PASS; zero across the matrix and functional checks; deliberate Google font aborts are disclosed/excluded |
| Scoped/prefixed standalone output, native JS syntax, no source runtime imports, route keys, source logo and labelled breadcrumb | PASS |
| Safe JSON script embedding | PASS; in-memory closing-script fixture round-trips as JSON text without editing actual settings/output |
| Shared generator vs main `65a5a44`, 19 existing contexts | PASS; markup, CSS, runtime, routes, dynamic classes and labelled trails byte-identical; unknown-link guard still rejects its in-memory fixture |
| Existing 19 delivered blocks at 390/1440px | PASS; 38 current smoke cases for visible h1, overflow and JavaScript errors; full shared-output migration regression remains a later stage |
| Reproducible outputs, Git whitespace and unchanged design/shared/older blocks | PASS; both output variants rebuild byte-identically |

Aggregate current measurements are committed in `qa/results.json`; reproduction commands are in the
page README. Shared baseline code is read from the merged commit. No old delivered output is rebuilt
or claimed to have received the copied-root normalization in this page.

## NOT VERIFIED / intentional differences

- Published GHL installation/runtime and ancestor conditions for sticky positioning.
- Actual hosted asset/page URLs, real Notice/Results PDF availability/content, email delivery and
  page/SEO settings; source placeholders and unknown destinations remain explicit.
- Share classes/trading status/registrar/enquiry details, statement wording, meeting dates/year,
  contacts/postal details, update date and footer legal/regulatory approval. Hiding flags is not approval.
- External Google font delivery and final layout with the actual web fonts.
- Regulatory, Legal Notices, Better World & Impact, Main/shared output synchronization and the
  final full affected-page regression, including older copied-root route/footer normalization.

Intentional architecture: one independent Shareholders block replaces the source hash view; native
options contain plain text; unavailable file/email hrefs become configurable explicit states; paint
hold is unnecessary with inline CSS. Copied unavailable-link attributes and optional footer content are
normalized on this page's replacement. Visible source content/layout and motion are preserved.

Stop at this page's PR. Regulatory starts after merge is confirmed and main refreshed.
