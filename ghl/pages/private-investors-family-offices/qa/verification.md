# Private Investors & Family Offices — local verification (2 November 2026)

- **Revision:** branch `feat/ghl-private-investors-family-offices`, based on main `b5a0d25` (design export `df79d85`, which added `design/Private Investors Family Offices.dc.html` with `pf-hero-threads.png` and `pf-impact-scale.png`).
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 % at every width |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 % |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 % |
| Landscape phones 844×390 and 568×320 | 0.000 % |
| Prop variants: `showFlags: true` and `showPamCard: false` (source defaults rewritten by `SRC_PROPS`), 320/390/768/1024/1440/1920 × 900 | 0.000 % |
| Page height (px), 320 → 2560 at 900 | 9300 · 8909 · 8656 · 8558 · 8252 · 6859 · 5196 · 5624 · 5793 · 5839 · 5840 · 5840 · 5840, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of the nine sections, header and footer | 0 differences at 1440, 1024, 768, 390 and 320; 0 for both prop variants at 1440 and 390 |

A few isolated rows differed in single captures (1024 at 900 and 600 px, 2560). They did not reproduce on repeat captures, and the source showed the same variation against itself.

## Behaviour (`_build/behaviour.js`, 47 trace lines, source vs port)

Identical in two consecutive runs. Covered:
- the conversation track at 390×700 and 1440×900: unlit at the top and at 25 % visibility, lit at 60 %, the bars filled once settled, their transitions, and still lit after scrolling back to the top;
- hover states (fine pointer) with their before/after colours, borders, transforms, shadows and transitions: the "why" rows and icons, relationship cards, architecture cards, the Providence Asset Management card and its link, conversation steps, governance and Verify links with their arrows, text links, the impact section link and the contact button;
- keyboard order from the governance links to "Start a Conversation", with visible outlines;
- the impact image drift (`imDrift`, 16 s, ease-in-out, infinite, alternate) and that it moves;
- live resize across 1100, 1024/1023, 901/900, 861/860, 768/767, 641/640, 561/560, 481/480, 360 and 1600 px: each section's grid and height, and no horizontal overflow;
- reduced motion: no drift, no bar transition, no card lift, and the track still lights.

**Notes on the trace script.**
- Scrolls are instant, and the trace waits for `load` plus 3 s so that the shared scroll motion has settled.
- Before each hover it waits 1.5 s after scrolling. The shared fade-in (0.7 s plus stagger) otherwise sometimes caught the contact button mid-reveal; a direct probe showed the same hover colour in both pages once revealed.
- The 60 % sample logs the class only, because bar values mid-transition vary by a frame between runs.
- The source has no `.cv-n` element (its lit rule is unused), so the trace reads the step icons instead.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`** (now normalising `pfo-`): the 64-line header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label line differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js private-investors-family-offices pfo …`:** pass, no errors.
  - Config keys and logos; hosted placeholders (no request; 5 images without `src`: three logos and the two page images).
  - Header/footer toggles, footer wording, link overrides, broken JSON.
  - Hostile host at 1440 and 390: one instance, no overflow, re-attached, body overflow restored, nothing left hidden.
  - Reduced motion: nothing invisible or translated.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - every page link is `#` with `aria-disabled`;
  - the hosted block makes **0 image requests**, with both page images hidden and the logos without `src`;
  - the inline block shows the original images from `imageFallbacks` (hero 1942 px, impact 1774 px, logo 640 px);
  - no raw `{{ }}` reaches the page.
- **Synthetic URLs, both variants:** both images and the logo load from their URLs (3 image requests in the hosted block). The page links resolve, for example `providenceAssetManagement` → `/providence-asset-management?v=1` and `investors` → `/investors-partners?v=1`. An absolute URL with spaces, query and fragment is trimmed and kept.
- **Clicks:** a disabled link does not navigate and carries the title "Not yet available"; an enabled one navigates.
- **Props:**
  - default: no badges, the Providence Asset Management card shown;
  - `showFlags: true`: the four badges, in order, on the h1, h2, h3 and note;
  - `showFlags: "true"` (a string): no badges;
  - `showPamCard: false`: the card hidden and its grid row gone;
  - `showPamCard: "false"` (a string): the card shown.
- **Hostile host** (generic CSS including `img{max-width:none!important;border}`, lists and spans; content above and below; the script executed twice), at 1440 and 390:
  - one owner;
  - badges and images keep their styles and sizes;
  - the track lights when scrolled to;
  - no horizontal overflow.
- **Copied live root** while lit and with badges, with a changed config (`showFlags` false, `showPamCard` false, new links):
  - starts unlit with no badges and the card hidden;
  - the new links are applied;
  - one owner on the new root;
  - the track lights again on scrolling.
- **Teardown** (root removed) leaves no instance. **`pagehide`** removes the app and its init marker.
- **No IntersectionObserver:** the track is lit at once.

## Shared entries

- `ghl/shared/site-images/index.js` gains `privateInvestorsHeroImage` → `bwci_img_private_investors_family_offices_hero` and `privateInvestorsImpactImage` → `bwci_img_private_investors_family_offices_impact`. Both are page-only and declared by this page's build. The proposed values are also in `bwci-image-custom-values-to-create.json` (now 12 keys).
- All 27 other generated pages rebuild byte-identical to main `b5a0d25`; Main is untouched. No other installed block needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (395 checks), including the frozen shared list. `ghl/shared/site-links/qa/unit.js`: PASS (212 checks).

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- Physical devices and the published page.
- The proposed `bwci_img_private_investors_family_offices_hero`, `bwci_img_private_investors_family_offices_impact` and `bwci_url_providence_asset_management` do not exist in the account yet.
