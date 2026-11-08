# Start a Conversation — local verification (8 November 2026)

- **Revision:** branch `feat/ghl-start-a-conversation`, based on main `0ed3636` (design export `a012ab2`).
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.
- **Form links:** for every comparison the source was rendered with its four form props set (`SRC_PROPS`, `_build/qa-routes.js`)
  and the port with the same four links (`preview/plain-forms.html`), all pointing at the blank `_build/qa-form.html`. Both
  pages then show real iframes in place of the source's mock form, which the owner chose not to build.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 % at every width; one pixel at 1920 px (y 2556, a glyph edge, 26/255) |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 % (isolated 1–2-row blips at 390×600 and 1920×1200 did not repeat) |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Landscape 844×390 and 568×390 | 0.000 %, 0 rows |
| Badges off (`showFlags: false`; source `flags=false`), 320/390/768/1024/1440/1920 × 900 | 0.000 % (a 2-row blip at 1024 px did not repeat) |
| Page height (px), 320 → 2560 at 900 | 6264 · 5868 · 5822 · 5803 · 5618 · 4444 · 2866 · 3044 · 3082 · 3094 · 3094 · 3094 · 3094, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of hero, routes, "something else", header and footer | 0 differences at 1440, 1024, 768, 390 and 320; 0 with the badges off at 1440 and 390 |

The source captures identically against itself at 1920 px, so the one pixel there is a consistent anti-aliasing
difference of a single glyph edge.

The placeholder state (no form links) has no source equivalent; it was checked by screenshot at 1440 and 390 px.

## Behaviour (`_build/behaviour.js`, 39 trace lines, source vs port)

Identical. Covered:
- **The route at load:** the default (SMEs), `#banks`, then hash changes to `#partners` and to `#nothing` (ignored).
- **The four frames:** src, title, `loading="lazy"`, and height (880 px for the open one, 0 for hidden ones).
- **Clicks** on Investors, Partners and SMEs at 1440 px: selection, tabindex, panels, the spoken message, hash, no scroll.
- **The panel entrance animation:** `scIn`, 0.32 s.
- **Keyboard:** ArrowRight, ArrowDown, ArrowLeft, End, Home, ArrowUp move the selection with focus; Enter on the open tab.
- **Hovers** of a route card and its icon, the open card, "Choose a different route" and its arrow, the breadcrumb, and a
  "something else" card and its icon.
- **900 px:** a tap scrolls the panels into view.
- **390 px:** three taps; the tapped card stays at the same viewport position, with the accordion order.
- **"Choose a different route"** at 1440 and 390 px: the card's final position and the focused route card. Both pages
  focus the SMEs card, since SMEs is open. Afterwards the source closes the form and the port keeps it open; that part
  is the owner's decision and is not traced.
- **Live resize** across 1280, 1024/1023, 900/899, 768/767, 641/640, 360 and 1600 px, with no horizontal overflow.
- **Reduced motion:** the `scFade` entrance, and no tab or label transform.

Not compared, by the owner's decisions: tapping the open card on a phone (the source collapses it), the empty state, and
the success panel.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`** (now normalising `scv-`): the 64-line
  header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js start-a-conversation scv …`:** pass, no errors. It covers config keys
  and logos, hosted placeholders, and a hostile host at 1440 and 390 (one instance, no overflow, re-attached, body
  overflow restored, nothing left hidden).
  - **Reduced motion:** 4 "invisible" elements: the route cards' alternate "Start enquiry" / "Selected" labels, one of
    which is always transparent. The source has the same four.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - every page link is `#` with `aria-disabled`;
  - every form shows the placeholder, with no iframe `src` and **no form request**;
  - no raw `{{ }}` reaches the page.
- **Configured:**
  - the links resolve, with `contactDetails` → `/contact?v=1#cnt-details`;
  - the four iframes get their `src`, but only the open route's form loads (lazy); Banks loads when opened.
- **Unusable form values:** `/forms/smes`, `javascript:…` and an address with a space show the placeholder; a valid
  address with surrounding spaces is trimmed and used.
- **Heights:** `formHeight` 1240 gives 1240 px; `"abc"` and `50` keep 880 px. On a phone the default is 1180 px, and
  `formHeightPhone` 1500 gives 1500 px.
- **Default route:** `banks` opens Banks; `"none"` falls back to SMEs; the hash `#partners` wins over a default of
  `banks`.
- **Badges:** 4 shown by default, 0 with `false`, 4 with the string `"false"`.
- **Clicks:** a disabled "Contact details" card does not navigate ("Not yet available"); an enabled one opens
  `contact?v=1#cnt-details`.
- **Hostile host** (generic CSS including `iframe{border;height;width}`, `button`, `nav`, `aside`, lists and spans;
  content above and below; the script executed twice), at 1440 and 390:
  - one owner;
  - the route cards, the open panel and the 880 / 1180 px borderless iframe keep their layout;
  - a click opens Partners;
  - no horizontal overflow.
- **Copied live root** after opening Investors, with a changed config:
  - Investors is still open (from the hash);
  - its form now shows the placeholder;
  - the badges are hidden and the new link is applied;
  - the live region is empty;
  - one owner;
  - a later hash change is handled once, by the new root.
- **Teardown** right after "Choose a different route" (pending focus timer) leaves no instance, and a later hash change
  does nothing. **`pagehide`** removes the app and its init marker.
- **No IntersectionObserver:** routes still switch.

## Shared entries and regression

- `ghl/shared/site-links/index.js`: proposed `formSmes`, `formInvestors`, `formBanks`, `formPartners` → `bwci_url_form_*`.
- All 34 other generated pages rebuild byte-identical to main `0ed3636`; Main is untouched. No other installed block
  needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (408 checks). `ghl/shared/site-links/qa/unit.js`: PASS (215 checks).
  `scripts/tests/footer-route-compatibility.js`: PASS.

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- Real GHL form embeds: their own heights, scripts and confirmation screens inside the iframe.
- Physical devices and the published page.
- The proposed `bwci_url_form_*` values do not exist in the account yet.
