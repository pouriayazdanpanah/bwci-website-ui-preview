# Who We Are — local verification (28 October 2026)

Revision: branch `feat/ghl-who-we-are`, based on main `37102cf` (design export "Import Claude Design site export").
Environment: headless Chromium (Playwright), local `http-server` at the repo root, source page rendered through
`design/support.js` with React served from `design/vendor/`. Google Fonts are not reachable from this environment
for either the source or the port, so both render with the same fallback fonts. **This is local QA, not a
published GHL page.**

## Source fidelity

| Check | Result |
|---|---|
| Pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width |
| Pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 %, 0 rows |
| Pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Page height (px) | 10290 · 9756 · 9651 · 9409 · 9101 · 7930 · 6257 · 6734 · 6961 · 7005 · 7005 · 7005 · 7005, identical to the source |
| Horizontal overflow / console errors | none at any width |
| DOM box and style walk of hero, glance, purpose, role, principles, how, explore, leadership, next, header, footer | 0 differences at 1440, 1024, 768, 390, 320 |

Earlier runs on this branch found and fixed two differences: a 16 px shift from "How we work" down (a `.bw`
selector had lost a class of specificity) and the square vs rounded ends of the header's current-item underline
(the source defines no `--radius-full`; the port now uses the source's exact tokens).

## Behaviour (`_build/behaviour.js`, 90 trace lines, source vs port)

Identical except for the hero image's x offset (±1 px). The image drifts continuously (14 s), and the two runs
sample it at slightly different moments. Covered:
- hero regimes at 1440/1024/768/390/320/700;
- glance tiles and their hover;
- hero button hover;
- the sticky role aside;
- principle card hover;
- engine strip unlit, then lit at 45 % visibility (dot colours, vertical list below 1024 px);
- explore row hover;
- card hover and focus;
- grid press-move-release;
- "Our role" anchor: scroll, focus and hash;
- carousel at 390/320/700:
  - a short move clicks through;
  - a drag sets `is-drag` and scrolls;
  - the release snaps to the next card (`273 = 259 + 14` at 390);
  - the click that ends a drag is swallowed, and the next click works;
- touch: overlay visible, tap clicks through, no drag;
- live resize (1100/900/700/500/1600);
- reduced motion.

Off-screen carousel cards stay in the reveal "wait" state until swiped into view, then fade in. The source does the
same.

## Shared chrome

- `ghl/shared/site-chrome/qa/chrome-behaviour.js`: 64-line header/drawer/dropdown/sticky/footer/motion trace, identical to the source (its class normaliser now includes `who-`).
- `ghl/shared/site-chrome/qa/chrome-lifecycle.js who-we-are who … bwci-who-we-are bwci-who-we-are-config`: pass, no errors. One instance after a duplicate script; no overflow in the hostile host at 1440 or 390; the header still sticks below host content; re-attached after a GHL-style re-render; body overflow restored after the drawer; reduced motion leaves nothing hidden or translated.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields (as pasted) and every value `#`:**
  - all 18 page links and 4 card links are `#`, with `aria-disabled` and "Not yet available";
  - a disabled link does not navigate;
  - the hosted block makes 0 image requests, and its hero is hidden;
  - the inline block shows the original hero, portraits and logo from `imageFallbacks`;
  - no raw `{{ }}` reaches an href or src.
- **All values resolved (synthetic `/<page>?v=1` URLs and hosted asset URLs), both variants:**
  - page links resolve; `financialEngineHero` becomes `/financial-engine?v=1#fe-hero`;
  - profile cards get `…?v=1&from=leadership`;
  - the footer gets `/who-we-are?v=1#purpose|#role|#principles|#story`;
  - hero, portraits and logo load from the URLs.
- **A base URL with its own fragment:** the section link replaces it (`/fe?x=1#fe-hero`), and the profile query goes before the hash (`/people/farhad?from=leadership#bio`).
- **Duplicate execution + content above + a copied live root with a changed config:**
  - one owner (`__bwciWhoWeAre`);
  - the new `ourRole` URL is applied and `contact: "#"` is disabled;
  - the engine starts unlit and lights on scroll;
  - no overflow.

## Shared image entry (`whoWeAreHeroImage`)

Superseded on 29 October 2026: the setting is now page-only (see `ghl/shared/site-images/README.md`), and the other
pages' outputs are back to their files before PR #41. The record below describes the PR #41 revision.


- 22 generated pages rebuilt and both Main files edited: in all 46 outputs the only change is the one-line list of image settings.
- Old and new resolvers applied to every existing output's config, with values literal, resolved and `#`: 138/138 identical results.
- `ghl/shared/site-images/qa/unit.js`: PASS (330 checks).
- `ghl/shared/site-links/qa/unit.js`: PASS (212 checks).

## Not verified

- GHL substitution of Custom Values inside `application/json` and cache propagation.
- Real web fonts, physical devices, and the published page.
- The two proposed Custom Values do not exist in the account yet.
