# Providence Asset Management — local verification (29 October 2026)

- **Revision:** branch `feat/ghl-providence-asset-management`, based on main `ebc84b6`.
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow.
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 768, 1024, 1280, 1366, 1440, 1600, 1920 and 2560 × 900 px, reduced motion | 0.000 %, 0 differing rows |
| Full-page pixel diff, 768, 1024, 1440 and 1920 × 600 and × 1200 px | 0.000 %, 0 rows |
| Full-page pixel diff with `showFlags` on, 768, 1024, 1440 and 1920 | 0.000 %, 0 rows |
| Full-page pixel diff, 320, 360, 375, 390 and 430 | Differs only inside the map band (0.30–0.48 %), because the **source** map is blank in these captures (see below) |
| Viewport pixel diff of the map section, 320, 360, 375, 390 and 430, reduced motion | 0.000 %, 0 rows, no errors in either page |
| Canvas pixel checksum (map, reduced motion): 1440, 1024, 768, 390, 320 and 700, and during resize to 1100, 800, 600 and 1600 | identical to the source |
| Page height (px), 320 → 2560 | 7398 · 7185 · 7137 · 7115 · 7030 · 5900 · 5152 · 5936 · 6082 · 6144 · 6144 · 6144 · 6144, identical to the source |
| DOM box and style walk of every section, the header and the footer | 0 differences at 1440, 1024, 768, 390 and 320; and with `showFlags` on, at 1440 and 390 |

**Phone full-page captures.** Playwright's full-page screenshot temporarily resizes the viewport to the whole page:
- **Source, 320–430 px:** the source's map frame then lands on a zero-size canvas and throws `InvalidStateError: Failed to execute 'drawImage' … width or height of 0`. This happened in 3 of 3 runs, so the source's map is blank in those captures. Outside that band the captures match.
- **Port:** the same captures never error. Its frame loop now also skips a zero-size frame explicitly.
- **Viewport captures:** without the resize, source and port are pixel-identical at all five phone widths.

**Fixes made during QA** (all now pass):
- **Role text size:** a hidden badge left in the DOM changed the role text from 13 to 15 px, through the shared `.gv-role span:first-child/:last-child` rules. Badges are now created only while shown, as in the source.
- **Portrait comparison:** the DOM diff now compares portraits by image, not by URL form.

## Behaviour (`_build/behaviour.js`, 82 trace lines, source vs port)

Identical once mid-transition transform values (the callout scale transitions, 0.3–0.6 s) are masked. Covered:
- hero layouts, fact tiles and their hover, the hero ghost button, service-card hover;
- **map:** before and after the reveal; near the UK anchor; on the Middle East callout; after leaving. Each records the active tip and line, line stroke and dash offset, callout opacity and animation, parallax variables, layer transforms and canvas size, plus pixel checksums.
- **map with motion on:** magnifier hover, the Middle East anchor, and leaving;
- client-type hover;
- engine strip before and after it lights (the PAM node ring);
- people layout, role style and card hover;
- history layout and hover;
- the "Regulatory status" anchor;
- **phones 390/320/700:** hero, facts, map, carousel drag, snap, click suppression, and the next click;
- live resize: 1100, 800, 600 and 1600.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`:** the 64-line trace is identical to the source. Its normaliser now includes `pam-`.
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js providence-asset-management pam …`:** pass, no errors.
  - One instance after a duplicate script.
  - No overflow in the hostile host.
  - The root re-attaches; body overflow is restored.
  - "Invisible" lists the three hover-only card overlays, and the source has the same three.
  - The one element waiting after a re-render at 390 px is the third carousel card, off-screen to the right; the source has the same. It fades in when swiped into view.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields / every value `#`:**
  - all 8 page links are `#`, with `aria-disabled`;
  - the hosted block makes 0 image requests, with the hero hidden and portrait backgrounds empty;
  - the inline block shows the original hero, portraits and logo;
  - no raw `{{ }}` reaches the page;
  - the 3 external links are unaffected.
- **Synthetic URLs for every value, both variants:**
  - links resolve (`financialEngineHero` → `/financial-engine?v=1#fe-hero`; the profiles without `?from=`, as in the source);
  - hero, portraits and logo load from their URLs.
- **Portrait URL with a JSON-escaped quote:** encoded as `%22` inside `url("…")`.
- **Badges:**
  - `showFlags: true` creates the 6 badges in the source's classes and text, and the role text then takes the source's flagged style (15 px);
  - a non-boolean value means off.
- **Duplicate execution + content above + a copied live root with a changed config:**
  - one owner;
  - the badges follow the new config (6 → 0) and `platforms: "#"` is disabled;
  - the map and engine strip restart unrevealed, and the map reveals again on scroll;
  - no overflow.
- **Teardown:** removing the root while the map's frame loop runs leaves 0 frames scheduled afterwards.

## Shared image entry (`pamHeroImage`)

- `pamHeroImage` is page-only: declared by this page's build, so it is in this page's script only.
- The list every page carries is frozen at its PR #39 contents. The 46 outputs that existed before PR #41 (Main included) are byte-identical to their files at `37102cf`. Who We Are is unchanged from main. Verify a Communication changes one line: its list loses the Who We Are entry it never used.
- Old vs new resolver on every existing output's config (values literal, resolved and `#`): 156/156 identical.
- `ghl/shared/site-images/qa/unit.js`: PASS (343 checks), including the new check that the shared list stays frozen.
- `ghl/shared/site-links/qa/unit.js`: PASS (212 checks).

## Not verified

- GHL substitution of Custom Values inside `application/json` and cache propagation.
- Physical devices and the published page.
- The proposed `bwci_img_providence_asset_management_hero` does not exist in the account yet.
