# Verify a Communication — local verification (29 October 2026)

**Revision:** branch `feat/ghl-verify-a-communication`, based on main `dd1a06b`.

**Environment:** headless Chromium (Playwright) and a local `http-server` at the repo root. The source page is
rendered through `design/support.js`, with React served from `design/vendor/`. Google Fonts were reachable in this
run, so source and port both rendered with the real Plus Jakarta Sans and JetBrains Mono faces. Pixel diffs used
Python 3.11 with numpy and Pillow.

**This is local QA, not a published GHL page.**

## Source fidelity

| Check | Result |
|---|---|
| Pixel diff, 13 widths (320 … 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width |
| Pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 %, 0 rows |
| Pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Pixel diff, props flipped (`showFlags` on, `showFormerName` off, `showAlerts` on), 6 widths | 0.000 %, 0 rows |
| Page height (px), 320 → 2560 | 6881 · 6491 · 6298 · 6277 · 6074 · 4954 · 4149 · 4407 · 4501 · 4534 · 4534 · 4534 · 4534, identical to the source |
| Horizontal overflow / console errors | none |
| DOM box and style walk of every section, the header and the footer | 0 differences at 1440, 1024, 768, 390 and 320 (defaults), and at 1440, 768 and 390 (props flipped) |

The flipped-props source is `design/Verify a Communication.dc.html` with `<base href="/design/">` and flipped prop
defaults, written to the git-ignored `_build/preview/source-props.html`. `design/` is not edited.

An earlier build of this branch was missing Plus Jakarta Sans 800 from its font link. That made the bold phrase of the
bank warning 3–5 px narrower. The block now uses the source's font link.

## Behaviour (`_build/behaviour.js`, 68 trace lines, source vs port)

The source and port traces are identical. Covered:
- **Hero:** shield and heading layout at 1440, 1024, 768, 390 and 320.
- **Quick check:** card overlap and columns; step hover (background and number); step-link hover (colour, arrow).
- **Official channels:** the heading column is sticky at ≥1024 px; row hover.
- **Never list:** item hover shift.
- **Regulated panel:** link hover and the panel layout.
- **Report:** card and bank layouts; authority link hover; Copy hover.
- **External links:** href, target and rel.
- **Step anchor:** scrolls to "What we will never do", releases focus, sets the hash.
- **Copy button**, with the clipboard allowed and denied:
  - the label, `data-done`, aria-label and colours update;
  - the clipboard holds `report@phishing.gov.uk`;
  - a second press restarts the 1.8 s timer, then it resets;
  - keyboard activation works, with the focus ring.
- **Phones:** 390 and 320.
- **Live resize:** 1100, 900, 700, 600, 500 and 1600.
- **Reduced motion.**

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`:** the 64-line header/drawer/dropdown/sticky/footer/motion trace is identical to the source. Its class normaliser now includes `vfc-`.
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js verify-a-communication vfc …`:** passes with no errors.
  - One instance runs after a duplicate script.
  - No overflow in the hostile host at 1440 or 390.
  - The page re-attaches after a GHL-style re-render.
  - Body overflow is restored after the drawer.
  - Nothing stays hidden after a re-render.
  - Reduced motion leaves nothing invisible or translated.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields and every value `#`:**
  - all 5 page links are `#`, with `aria-disabled` and the title "Not yet available";
  - a disabled link does not navigate;
  - the hosted block makes 0 image requests;
  - the inline block shows the embedded logo;
  - no raw `{{ }}` reaches an href or src;
  - the 4 external links are unaffected.
- **Synthetic URLs for every value, in both blocks:** the page links resolve (for example `/contact?v=1`), the footer's Verify link becomes `/verify?v=1`, and the logo loads from its URL.
- **Props:**
  - flipped, 18 of 19 badges are visible (the 19th sits in the hidden former-name row), the former-name row is hidden and the alerts section is shown;
  - the shared motion reveals the alerts content (0 elements still waiting after a scroll-through);
  - non-boolean values fall back to the source defaults.
- **Duplicate execution, content above, and a copied live root with a changed config:**
  - one owner (`__bwciVerifyACommunication`);
  - `contact: "#"` is disabled and the flags and alerts appear;
  - a pressed Copy button starts as "Copy" again and still works;
  - no overflow.
- **Teardown:** removing the root while "Copied" clears the timer, so the removed button is not changed later.

## Reproducibility

The other 23 builders reproduce their committed outputs unchanged. This branch changes no shared production code.

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- Physical devices.
- The published page.
- Clipboard behaviour under the GoHighLevel page's own permissions policy.
