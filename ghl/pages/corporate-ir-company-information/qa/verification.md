# Company Information — current local verification

**Final result: PASS**, with the intentional source repair and minor pixel difference below.

Run date: October 26, 2026. Source: `design/Corporate IR.dc.html#company-information` at merged
main `1e34f27` (Overview PR #28). Chromium 154.0.8037.57 via Playwright, Linux. Source React was
served from existing local vendor copies. Google font requests were deliberately blocked on both
sides; comparisons use the same fallback fonts. No design file or existing output was modified.

## Responsive and visual comparison

The source, inline output and hosted-logo output were captured for **24 cases**. The hosted test
uses the identical supplied logo through a local test-only URL. All 24 geometry, source-content and
overflow checks are PASS. Default cases cover every required width: 320, 360, 375, 390, 430, 768,
1024, 1099, 1100, 1101, 1280, 1366, 1440, 1600, 1920 and 2560px at 900px height.

Additional cases: 390×600, 1024×1200 and 1440×600; normal motion at 390×900 and 1440×900;
group off at 390×900; group and flags off at 1440×900; flags off at 390×900. Default captures
otherwise use reduced motion. The four `showGroup`/`showFlags` combinations are also exercised
individually in functional QA.

**Intentional source repair:** the source approval notice is about 368px wide with fallback fonts.
It exceeds phone content width and clips at smaller viewports. The port wraps only that long notice,
keeping its text and dot visible inside the content padding. Default raw source heights are
4268/4192/4142/4049px at 320/360/375/390px; the corresponding readable port heights are
4283/4207/4157/4064px (+15px). The other content and hierarchy are preserved.

Raw source screenshots are retained. For phone pixel comparisons, a second source capture adds only
the documented notice wrapping rule; no other source styles/content or reveal classes are rewritten.
This fixture is a no-op when the approval notice is absent. Geometry and image comparison use that
explicit adjusted reference on phones and the unchanged reference elsewhere. This is not a claim of
pixel equality with the clipped raw reference. The capture helper scrolls through the page and checks
ancestor opacity before screenshots, without forcing content visible.

**47 of 48 image comparisons are pixel-identical** to their stated reference. The remaining inline
768×900 comparison differs by 341 pixels (0.014683%) in the native selector's “Section” label only;
the corresponding hosted capture is identical. This minor difference does not change geometry or
behavior. Desktop/mobile source and port screenshots, the wrapped notice and the hostile host were
also inspected visually. Matching phone comparisons use the disclosed wrapping fixture, as described
above; wider comparisons use the raw source.

Final pixel metrics are recorded in `results.json` beside this report. Bulk captures and raw logs are
git-ignored in `_build/qa-output/`; local plain/hostile wrappers are in `_build/preview/`.

## Behaviour, runtime and shared compatibility

| Check | Result / current evidence |
|---|---|
| Company only: hero, nine facts, two name-history rows and parent/two-subsidiary tree | PASS; no inactive Corporate / IR page markup |
| Correct h1, current Company nav/selector, three-part breadcrumb | PASS |
| Independent URL links: Overview, Reports, Shareholders, Regulatory, Legal Notices; mobile selector actually navigates | PASS; local QA destinations only |
| Configured Home/Corporate/IR breadcrumb, Board cross-link and new Impact destination | PASS |
| Unavailable destinations: ARIA state, keyboard/click status, no top jump; five disabled mobile options | PASS |
| All group/flag combinations, approved-later empty state, placeholder preservation, malformed JSON fallback | PASS |
| Phone approval notice fits the content width | PASS; included in every rendered output case where it is visible |
| Visible focus, hover colour, touch menu and Escape | PASS |
| Sticky navigation, live 1099/1100/1101 resizing, header/footer toggles | PASS |
| Long company text and scoped same-page anchor | PASS; height expands without horizontal overflow; anchor reaches Name history |
| Reduced/normal motion and scroll reveals | PASS |
| Hostile host: heading font, background, text alignment, overflow and surrounding content | PASS |
| Duplicate execution, root replacement while drawer open without resize/scroll, body-overflow restoration and explicit teardown | PASS |
| JavaScript errors, console errors and unexpected network failures | PASS; zero across the current 24-case run and functional checks; deliberate font aborts excluded and disclosed |
| Hosted and inline blocks; supplied logo matches source | PASS |
| Browser-ready JS, scoped/prefixed output, config keys, no DC/React/import dependencies, only four Company sections | PASS |
| Shared generator vs main `1e34f27`, 17 existing contexts | PASS; header, breadcrumb, footer, GovNav, runtime, links, dynamic classes and CSS byte-identical for the old contexts |
| Nonempty IR label, empty-label fallback, label escaping and unknown-link rejection | PASS; in-memory fixture, no source mutation |
| Legacy homepage `impact` and independent `betterWorldImpact` semantics | PASS |
| Existing 17 delivered pages | PASS; 34 current 390/1440px smoke cases for visible h1, overflow and JavaScript errors; full affected-page regression remains a later shared-migration stage |
| Reproducible outputs and whitespace checks | PASS; rebuilt both blocks byte-identically, checked supplied logo equality and Git whitespace |

No previous task's QA was used to mark these checks passed. The shared generator baseline is read
from the merged commit, not regenerated outputs from this branch. Original delivered blocks remain
unchanged, including Overview.

## NOT VERIFIED

- Published GHL installation/runtime and ancestor conditions for sticky elements.
- External Google font delivery and rendering with actual web fonts.
- Actual GHL hosted asset URLs, published destination URLs and page SEO configuration.
- Approved company facts, jurisdiction, dates, office/name history, share status, group membership
  and activities, regulatory wording, update date and publication readiness. All source placeholders
  and applicable review flags remain; hiding flags does not confirm the content.
- The four remaining Corporate / IR pages, Better World & Impact, Main/shared output synchronization
  and the final full affected-page regression.

Intentional architecture: one independently deployed Company Information block replaces this source
hash view. Remaining pages are tracked individually in the implementation index. Stop at this page's
PR; Reports & Documents begins after merge is confirmed and main is refreshed.
