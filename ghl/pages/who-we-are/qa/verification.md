# Who We Are — local verification (11 November 2026)

- **Revision:** branch `feat/ghl-who-we-are`, based on main `505e162` (design export `505e162`).
- **Reference:** the design page with the owner's live text, built in memory by `_build/merged-source.js` and served
  by `qa-routes.js` (`MERGED=1`) at `design/Who We Are (merged).dc.html`. It applies 26 text/markup substitutions
  to the design page and 4 to `bwci-people.js` (this page's card names and roles); the design files are not edited.
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The reference is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** local QA, not a published GHL page. The first port's record (export `37102cf`, PR #41) is in the git
  history of this file.

## Source fidelity

| Check | Result |
|---|---|
| Pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width (after re-capture; see below) |
| Pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 %, 0 rows (two 6–7-row blips at 1200 px re-captured to 0) |
| Pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Landscape 844×390 and 568×390 | 0.000 %, 0 rows |
| Founder quote and "Next" row off (`showFounderQuote` / `showNextRow` false; reference `MERGED_PROPS=founderQuote=false,nextRow=false`), 320/390/768/1024/1440/1920 × 900 | 0.000 %, 0 rows |
| Page height (px), 320 → 2560 at 900 | 14159 · 13234 · 12855 · 12658 · 12097 · 10263 · 8587 · 9438 · 9743 · 9811 · 9811 · 9811 · 9811, identical to the reference |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of every section (Our story, In his words, Where we are today and What you can expect included), header and footer | 0 differences at 1440, 1024, 768, 390 and 320 |

Two differences were found and fixed during this run:
- **Principles:** the design's principle cards are static markup; its `PR` list in the script is not rendered. The
  reference first changed the list, so its cards kept the old text (port 26 px taller at 1440). The reference now
  changes the cards.
- **The "In his words" quote mark** (font-weight 800) was a synthesised bold in the port, whose font link lacked
  weight 800 (unused until this export). The port now loads the source's exact font link, including 800.

Isolated 1–9-row differences at 390, 1440 and 1600 in one capture re-captured to 0 rows; at 1440 the reference also
differed from its own earlier capture.

## Behaviour (`_build/behaviour.js`, 104 trace lines, reference vs port)

Identical except one value: the hero image's x offset at the live resize to 900 px (184 vs 185 px). The image drifts
continuously (14 s) and the two runs sample it at different moments, as already recorded for the first port.
Covered:
- hero regimes at 1440/1024/768/390/320/700, glance tiles and their hover, hero button hover;
- the sticky role aside, principle card hover;
- engine strip unlit, then lit at 45 % visibility;
- **the new sections** at 1440/1024/768 and 390/320/700: the story grid, "Since" block, timeline and its first marker;
  the founder card's grid, padding, quote mark (weight 800), quote style and portrait; the "Where we are today"
  rows and markers; the "What you can expect" grid, its heading sticky at ≥1024 px (static below), and the numbered
  list;
- explore row hover, card hover and focus, grid press-move-release;
- the leadership carousel at 390/320/700 (short move, drag, snap, swallowed click), touch;
- live resize (1100/900/700/500/1600), including the new sections' grid columns;
- reduced motion.

The first port's "Our role ↓" anchor test was removed: the owner's live page links "Our role →" to the Our Role page.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`** against the design page: the 64-line
  header/drawer/dropdown/sticky/footer/motion trace is identical except the hero button's label in the keyboard order
  ("Our role ↓" in the design, "Our role →" in the owner's text).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js who-we-are who …`:** pass, no errors (config keys and logos, hosted
  placeholders, a hostile host at 1440 and 390 with one instance and no overflow, re-attached, body overflow restored,
  reduced motion with nothing invisible or translated). The 2 elements still waiting to reveal at 390 are the
  off-screen carousel cards, the same count as on main before this change and as the source.
- **`ghl/global/qa/rollout.js` (who-we-are):** ALL PASS. The global header + `who-we-are.global.inline.ghl.html` +
  global footer against the regular block: layout and pixels at 7 widths × 4 scroll positions (anti-aliasing notes
  only), header state, dropdown and drawer while stuck, hostile host, in-page jumps, no script errors.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty, synthetic URLs and hosted images**, both variants:
  - unset links are `#` with `aria-disabled`; resolved links compose sections and keep queries; profile links keep
    `?from=leadership` before any hash;
  - the hosted block makes 0 image requests until values are set; the founder portrait in "In his words" is hidden
    without a value and uses `peopleImages.farhad-reyazat` when set (the inline block uses the embedded portrait);
  - no raw `{{ }}` reaches the page.
- **Duplicate script, content above, copied live root with a changed config:** one owner, the new `ourRole` value
  applied to both its links, the engine strip unlit again until scrolled, no overflow.
- **Disabled click:** "Our role" does not navigate and carries "Not yet available".
- **Switches:** `showFounderQuote` / `showNextRow` `false` hide the section and the row; the string `"false"` keeps
  both shown.

## Shared entries and regression

- No shared file changes. Only this page's outputs (regular, inline and both global variants) changed; every other
  page's block is untouched.

## Not verified

- Physical devices and the published page.
- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- The owner's live page itself: its text was taken from the rendered page supplied in the conversation.
