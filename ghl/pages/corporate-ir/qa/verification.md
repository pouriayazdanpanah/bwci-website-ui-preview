# Corporate / IR Overview — current local verification

**Final result: PASS**, with the minor visual difference and NOT VERIFIED items below.
Run date: October 26, 2026. Reference: `design/Corporate IR.dc.html`, empty-hash Overview at
main `812f136`. Chromium 154.0.8037.57 via Playwright, Linux; source React served from existing local vendor
copies. No design file was changed. Google font requests were deliberately blocked on both sides;
all comparisons use the same fallback fonts. This is local QA, not published GHL QA.

## Source comparison and responsive matrix

Each case compared the source, inline output and hosted output (hosted logo pointed to the identical
local supplied asset by the test browser). All **21 cases / 63 captures** have matching rounded section
geometry and total page height, and no horizontal document overflow. The 42 source/output image
comparisons are retained in the aggregate `results.json` beside this report.

| Width | Height | Motion | Inline / hosted result |
|---|---|---|---|
| 320, 360, 375, 390, 430 | 900 | Reduced | PASS; pixel-identical |
| 768 | 900 | Reduced | PASS; 341 changed pixels (0.008440%) in the native selector's “Section” label only, both variants |
| 1024, 1099, 1100, 1101 | 900 | Reduced | PASS; pixel-identical |
| 1280, 1366, 1440, 1600, 1920, 2560 | 900 | Reduced | PASS; pixel-identical |
| 390 | 600 | Reduced | PASS; pixel-identical |
| 1024 | 1200 | Reduced | PASS; pixel-identical |
| 1440 | 600 | Reduced | PASS; pixel-identical |
| 390, 1440 | 900 | Normal | PASS; settled captures pixel-identical |

The remaining 768px label difference is minor and does not change section geometry or functionality.
Matched screenshots at 390px and 1440px were also inspected visually across every section. The hosted
1440px capture was repeated after strengthening reveal-settling checks; the final image is identical.
The capture helper scrolls naturally and checks opacity through ancestors; it does not force source
or port content visible or rewrite reveal classes to obtain the comparison.

## Behaviour, runtime and compatibility

| Check | Result / evidence |
|---|---|
| Overview only: hero + six sections, six facts, eight index rows, three documents, three announcements, three verification rules, two contacts | PASS |
| No other Corporate / IR view hidden in the output; no DC/React runtime or local source imports | PASS; static checks and rendered DOM |
| Five configured independent destinations: desktop links and mobile selector actually navigate to local QA URLs | PASS; no hash-based view switching |
| Overview active state, Home → Corporate/IR breadcrumb, configured Impact/announcements/contact destinations | PASS |
| Unconfigured links: keyboard/click does not jump; ARIA unavailable state and status message; disabled mobile options | PASS |
| Visible keyboard focus, hover colour, mobile touch drawer and Escape | PASS |
| Published placeholder rows, `Launch (none)`, `showFlags:false`, malformed JSON fallback | PASS; source placeholders remain when flags are hidden |
| Sticky section bar, live resizing across 1099/1100/1101, header/footer off | PASS; nav aligns below the measured header, or zero without it |
| Long text and scoped same-page anchors | PASS; expanded facts increase page height without horizontal overflow; configured anchor reaches the contact section |
| Reduced motion and ordinary motion; content visible after scrolling | PASS |
| Hostile host: heading font, section background, text alignment, surrounding content and overflow | PASS; aggressive global styles, content above/below |
| Duplicate script execution | PASS; one owner and one status element |
| Root replacement while drawer open, without scroll/resize | PASS; old body overflow restored, new menu works, one status element |
| Explicit teardown | PASS; page owner removed and status cleaned up; source inspection confirms listeners/observers/timers/frames are disposed |
| JavaScript errors / console errors / unexpected failed network requests | PASS; zero in final functional diagnostics; deliberate font aborts excluded and disclosed |
| Hosted and inline variants | PASS; hosted test requests and loads the supplied local logo; inline needs no image request |
| New independent `betterWorldImpact` key and old homepage `impact` mapping | PASS; static assertions preserve both meanings |
| Unknown design-link validation | PASS; an in-memory unknown destination still throws; no source mutation |
| Existing 16 inline pages at 390px and 1440px | PASS; **32 smoke cases** checking one visible h1, overflow and JavaScript errors. This is not full visual/interaction regression |
| Existing page outputs and `design/` unchanged | PASS; Git comparison against branch base |
| Reproducible build, JavaScript parsing, config-key coverage, scoped/prefixed output and `git diff --check` | PASS |

Bulk captures, plain/hostile preview wrappers and raw logs live under git-ignored `_build/qa-output/`
and `_build/preview/`; rerun the commands in the page README to reproduce them. Aggregate measurements
are committed as `qa/results.json`. No historical QA was used to declare these checks passed.

## NOT VERIFIED / remaining dependencies

- Installation and behavior in a published GHL page; host ancestor constraints on sticky positioning.
- External web-font delivery and final rendering with the real Google fonts.
- Real hosted GHL asset URLs, published page/destination URLs and external FCA page availability.
- Corporate facts, security/legal/regulatory wording, contact details, documents, publication dates,
  file sizes, announcements and approval to publish any placeholders. No download was invented.
- The five independent Corporate / IR subpages, Better World & Impact, Main CTA synchronization and
  broad shared-config/output migration. Full affected-page regression belongs to that later migration.

The architecture deliberately differs from the reference: six independently deployed pages replace
six hash-switched views. Only the Overview is delivered in this PR. Next stage: Company Information,
after this page's merge is confirmed and latest main is refreshed.
