# Private Investors & Family Offices — GoHighLevel port

This is a port of `design/Private Investors Family Offices.dc.html` (design export `df79d85`, 2 November 2026) to one GoHighLevel Custom Code block. The block includes the shared header, breadcrumb and footer.
- Branch `feat/ghl-private-investors-family-offices`, from main `b5a0d25`; merged in PR #47 (`ee5629c`).
- Live GoHighLevel installation is a separate step and is not verified.

## Global header/footer version (9 November 2026)

`node ghl/pages/private-investors-family-offices/_build/build.js --global` also writes `private-investors-family-offices.global.ghl.html` and
`private-investors-family-offices.global.inline.ghl.html`: this page **without** its header and footer, for use between the
[global header and footer](../../global/README.md) GoHighLevel Global Sections ("BWCI Header" / "BWCI Footer"). Its root
carries `data-bwci-current="investors"` (the global header marks the current page from it); its config drops `logoImage`,
`showHeader`, `showFooter` and `footer` and keeps only the links the page itself uses. The regular outputs below are
unchanged. Local QA against the regular block: [global rollout verification](../../global/qa/verification.md). Live GHL
NOT VERIFIED for this page. Never paste it without the two global sections, and never combine the regular block with them.

## Files

| File | Use |
|---|---|
| `private-investors-family-offices.ghl.html` | **Production block** (122 KB). Images come only from Custom Values; nothing is requested until they are set |
| `private-investors-family-offices.inline.ghl.html` | Self-contained block (5.4 MB). Same references, plus the original logo and both page images as `imageFallbacks` |
| `assets/` | `pf-hero-threads.png` (1942×809, RGBA) and `pf-impact-scale.png` (1774×887, RGBA), byte-identical to `design/assets/` (the build checks it) |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record |

The page's own images are the hero threads and the impact scale; the logo is the shared `bwci_img_logo`.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block.
   - Use the inline block while the image values are not set.
   - Keep the config id `bwci-private-investors-family-offices-config` and the JSON structure.
3. Set the page title to "Private investors & family offices — Better World Capital Investments PLC", which is the source `<title>`.
4. Create the two proposed image values below: upload each asset and use its direct URL.
5. Set the existing `bwci_url_private_investors` to this page's URL. Every page's header and footer already link here through it.
6. Check the published page: the hero, the conversation track, the impact image and the links.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `privateInvestorsHeroImage` | `{{ custom_values.bwci_img_private_investors_family_offices_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/pf-hero-threads.png`. Unset, the hosted block shows the hero without the image |
| `privateInvestorsImpactImage` | `{{ custom_values.bwci_img_private_investors_family_offices_impact }}` | **Proposed: create it in GHL** with the hosted URL of `assets/pf-impact-scale.png`. Unset, the hosted block shows the impact card without the image |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFlags` | `false` | Source prop. `true` adds the four review badges: "Heading to approve" (hero title), "Compliance wording" (important information), "Wording to approve" (Providence Asset Management card) and "Compliance" (conversation note). Only the boolean `true` turns them on |
| `showPamCard` | `true` | Source prop. `false` removes the Providence Asset Management card from the architecture grid. Only the boolean `false` hides it |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 26 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

The page's own links all reuse existing or already proposed values:
- `investors`: the breadcrumb's "Investors & Partners" and "Back to Investors & Partners";
- `corporateIR`: "Regulatory information" in the important-information notice;
- `providenceAssetManagement` (proposed in PR #45, `bwci_url_providence_asset_management`): "Learn more" on the Providence Asset Management card;
- `platforms`: the three other architecture cards;
- `betterWorldImpact`: the impact card;
- `governance`, `leadership`, `verify`: the governance links;
- `startAConversation`: "Start a Conversation" (since 9 November 2026 the Start a Conversation page, `bwci_url_start_a_conversation`; before, `contact`, the Contact page).

Custom Values to create (GHL accepts one object per POST; check that each returned `fieldKey` matches the reference above). The bodies are also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json`:

```json
{ "name": "bwci_img_private_investors_family_offices_hero", "value": "<hosted URL of pf-hero-threads.png>" }
{ "name": "bwci_img_private_investors_family_offices_impact", "value": "<hosted URL of pf-impact-scale.png>" }
```

Nothing was created in the account from this repository.

## Sections and interactions reproduced

1. **Hero** (`#pfo-top`): the shared dark hero with the breadcrumb Home › Investors & Partners › Private Investors & Family Offices, the title and the lead.
   - **≥1024 px:** the threads image sits at the bottom right, faded in by two masks.
   - **768–1023 px:** the image spans the full width below the copy, and the hero takes its content's height.
   - **≤767 px:** the image becomes a wide background (220 %) under a dark gradient.
2. **Important information** (`#pfo-important`): the notice card overlapping the hero by 72 px, with "Regulatory information". It re-flows at 860 and 560 px.
3. **Why it matters** (`#pfo-why`): two columns (one below 900 px), with the key list. Its rows highlight on hover; their `em` notes hide below 480 px.
4. **Relationship** (`#pfo-relationship`): three cards joined by connectors, stacked below 900 px. Hover lifts a card and fills its icon.
5. **Architecture** (`#pfo-architecture`): the featured Providence Asset Management card and three architecture cards. The grid has three columns, two below 1024 px and one below 640 px. Hover lifts the cards; the featured card's shadow deepens.
6. **Impact alignment** (`#pfo-impact`): the dark card with the scale image. The image drifts slowly (16 s, alternating); below 900 px it sits under the copy and stops drifting.
7. **How a conversation works** (`#pfo-conversation`): four steps.
   - **Lighting up:** once the track is 40 % visible (IntersectionObserver), the steps' bars fill one after another (260 ms apart). This happens once.
   - The bars run along the top of each step, or down the left edge below 640 px. The grid has four columns, two below 1024 px and one below 640 px.
   - Hover tints a step and fills its icon.
8. **Governance and trust** (`#pfo-trust`): three links (the last, Verify, is dark). Hover adds a border and shadow and moves the arrow.
9. **Next step** (`#pfo-next`): the dark panel with "Start a Conversation" (full width below 768 px) and "Back to Investors & Partners".

Also: the shared scroll motion (bwci-motion), the shared header, drawer and footer, and reduced motion (no drift, no bar or card movement; the shared fade-in is kept, as in the source).

## How it is built

`node ghl/pages/private-investors-family-offices/_build/build.js` generates both blocks from `_build/src/` and the shared chrome (`current: 'investors'`, `breadcrumb: 'private'`, `content: true`, `images: ['privateInvestorsHeroImage', 'privateInvestorsImpactImage']`).
- **CSS:** scoped to `#bwci-private-investors-family-offices`, with unused selectors pruned.
  - Every source class and id carries the `pfo-` prefix; the source `.bw` wrapper is the root (`:scope.pfo-bw`), so the source's `.bw …` rules keep their specificity over the shared hero.
  - The source keyframes `imDrift` becomes `pfo-imDrift`.
  - The source's exact `:root` tokens and font link are kept; the source's page font-size floors become `:scope` rules.
- **Markup:** generated once from the source's rendered DOM, so text and structure match it. Hooks (`data-pfo-*`) are added for the images, the track, the Providence Asset Management card and the badge hosts.
- **Script:** the page's text/x-dc component (the two props and the track) in native JavaScript, plus the shared chrome runtime.
  - As in the source's `sc-if`, a badge exists in the DOM only while shown.
  - A copied live root starts unlit and without badges, then follows its own config.
- **Build checks:** link values against the shared mapping, both image copies byte-identical to `design/assets/`, scoped selectors, keyframe names, and no Claude Design or local paths.

Shared changes:
- `ghl/shared/site-images/index.js` gains `privateInvestorsHeroImage` and `privateInvestorsImpactImage` as **page-only** settings, declared by this page's build.
- `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the `pfo-` prefix.

The 27 other generated pages rebuild byte-identical, and Main is untouched. No other installed block needs re-pasting.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md).
- **Pixels:** 0.000 % against the source at all 13 widths (320–2560) at 900 px height, at six widths at 600 and 1200 px, with motion on at 390/1440, and in landscape at 844×390 and 568×320. With `showFlags: true` and with `showPamCard: false`: 0.000 % at six widths.
- **DOM:** box and style walk of the nine sections, header and footer: 0 differences at 1440, 1024, 768, 390 and 320, and for both prop variants at 1440 and 390.
- **Behaviour (47 trace lines):** identical to the source, covering the track, the hover states, keyboard order, the drift, live resize across every breakpoint and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes: config keys, hostile host, duplicate script, re-render and reduced motion.
- **Config:**
  - literal, `#`, empty, resolved and absolute values in both variants;
  - both images: no request and no image in the hosted block until set, the original bytes in the inline block, the URL once resolved;
  - the two props, including non-boolean values;
  - disabled and enabled clicks;
  - a hostile host at 1440 and 390;
  - a copied root with a changed config;
  - teardown, `pagehide`, and no IntersectionObserver.

## Intentional differences and source quirks

- **Unset values:** destinations are marked unavailable instead of linking to design files. An unset image is left out of the hosted block; the hero and impact card keep their layout and dark ground.
- **Header link in the design:** the design header's own "Private Investors & Family Offices" entry points to `Private%20Investors.dc.html`, which is not this file's name; it only affects the design preview. The ported header uses `bwci_url_private_investors`, like every page.
- **Paint hold:** the `.bw` paint-hold rule and `html{scroll-behavior:smooth}` are omitted; the system CSS is inline and the page has no in-page links of its own.
- **Unused source rules:** the source style has a lit state for step numbers (`.cv-n`) and hero rules for status chips and buttons that the page does not render; the build drops them.
- **Shared fade-in:** blocks that start below the fold stay faded out until they are scrolled to, also with reduced motion, as in the source.
- **As designed:** the badges and the wording they mark are still to be approved; the conversation note says so.

## Rebuild and test

```bash
node ghl/pages/private-investors-family-offices/_build/build.js && node ghl/pages/private-investors-family-offices/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
B=ghl/pages/private-investors-family-offices/_build
S="http://localhost:8123/design/Private%20Investors%20Family%20Offices.dc.html"; P="http://localhost:8123/$B/preview/plain.html"
node $B/shoot.js "$S" /tmp/src && node $B/shoot.js "$P" /tmp/port && python3 $B/diff.py /tmp/src /tmp/port
node $B/domdiff.js "$S" "$P" 390
# prop variants: SRC_PROPS rewrites the source's prop defaults; compare with plain-flags.html / plain-nopam.html
SRC_PROPS=showFlags=true node $B/shoot.js "$S" /tmp/srcf && node $B/shoot.js "http://localhost:8123/$B/preview/plain-flags.html" /tmp/portf
node $B/behaviour.js "$S" > /tmp/a; node $B/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js private-investors-family-offices pfo http://localhost:8123/ bwci-private-investors-family-offices bwci-private-investors-family-offices-config
node $B/config-qa.js http://localhost:8123/
```
