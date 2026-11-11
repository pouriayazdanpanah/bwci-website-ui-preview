# Who We Are — GoHighLevel port

Port of `design/Who We Are.dc.html` to one GoHighLevel Custom Code block. The block includes the shared header,
breadcrumb, leadership cards and footer. Merge and live GoHighLevel installation are separate steps.

## Content update (11 November 2026, branch `feat/ghl-who-we-are`, from main `505e162`)

By the owner's instruction the page now combines two sources:
- **Text:** the owner's live GoHighLevel page (rendered page supplied in the conversation on 11 November 2026), which
  the owner states is correct. It replaces the design's text in every existing section, including the hero lead and
  image description, the registered office address, "Why BWCI exists" with a second label "What “Better World” means",
  "Our role, in brief", "Our Principles" with a lead and six new descriptions, "From need to reinvestment", the
  leadership heading and "Start a Conversation" in the closing panel. The hero's "Our role →" now opens the Our Role
  page (`ourRole`) instead of scrolling to `#role`; the "Regulatory information" and "Read about our role" links are
  gone, so `corporateIRRegulatory` left the config.
- **Layout:** design export `505e162`, which adds four sections: **Our story** (`#story`, the footer's "Our story"
  target), **In his words** (`#who-words`), **Where we are today** (`#who-today`) and **What you can expect from us**
  (`#who-expect`). Their text is the design's, including its bracketed placeholders for the story, the founder quote,
  the "Next" milestones and the status date.
- **Cards:** the live page's names and roles ("Alexander Alegria-Seif · Chairman", "Dr Farhad Reyazat · Founder &
  Chief Executive Officer", "Gabriella Karlova · Director", "Professor Richard A. Werner · Strategic Banking Advisor")
  are set in this page's build (`CARD_TEXT`); the shared people data used by Board, Leadership and the profiles is
  unchanged.
- **"Start a Conversation"** keeps `startAConversation` (owner decision of 9 November, PR #55); the live page still had
  the older `contact` link.

The design export also marks this page "(review)" with `noindex, nofollow`; a block does not set either, and the page
title stays "Who We Are — Better World Capital Investments PLC" unless the owner says otherwise. QA compares the port
with `_build/merged-source.js`, which applies the live text to the design in memory (the design file is not edited).

First port: export `37102cf` (28 October 2026), PR #41.

## Global header/footer version (9 November 2026)

`node ghl/pages/who-we-are/_build/build.js --global` also writes `who-we-are.global.ghl.html` and
`who-we-are.global.inline.ghl.html`: this page **without** its header and footer, for use between the
[global header and footer](../../global/README.md) GoHighLevel Global Sections ("BWCI Header" / "BWCI Footer"). Its root
carries `data-bwci-current="who"` (the global header marks the current page from it); its config drops `logoImage`,
`showHeader`, `showFooter` and `footer` and keeps only the links the page itself uses. The regular outputs below are
unchanged. Local QA against the regular block: [global rollout verification](../../global/qa/verification.md). Live GHL
NOT VERIFIED for this page. Never paste it without the two global sections, and never combine the regular block with them.

## Files

| File | Use |
|---|---|
| `who-we-are.ghl.html` | **Production block** (145 KB). Images come only from Custom Values; nothing is requested until they are set |
| `who-we-are.inline.ghl.html` | Self-contained block (3.8 MB). Same references, plus the original image bytes as `imageFallbacks` for any value that is not set yet |
| `assets/` | Reference copies, byte-identical to design: `hero-globe.png` (1448×1086, RGBA) and the four leadership portraits |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, `merged-source.js` (the QA reference), QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record for this revision |

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of `who-we-are.ghl.html`, or the inline file while the image values are not set yet. Keep the
   config id `bwci-who-we-are-config` and the JSON structure unchanged.
3. Set the page title to "Who We Are — Better World Capital Investments PLC" (the source `<title>`).
4. Create the two proposed Custom Values below and set the URL of this page in `bwci_url_who_we_are`. Every
   page's header and footer already links here, including to `#purpose`, `#role`, `#principles` and `#story`.
5. Check the published page: links, images, header and drawer, the leadership carousel on a phone.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `whoWeAreHeroImage` | `{{ custom_values.bwci_img_who_we_are_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/hero-globe.png`. A separate key means the planned replacement photograph (design UI report) only needs a new value |
| `peopleImages.*` | `{{ custom_values.bwci_img_profile_<person> }}` | Existing portrait keys for Alexander Alegria Saif, Farhad Reyazat, Gabriella Karlova, Richard Werner |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFounderQuote` | `true` | Source prop `founderQuote` (default true): the "In his words" section. Set `false` until the quote is approved. Only the boolean `false` hides it |
| `showNextRow` | `true` | Source prop `nextRow` (default true): the "Next" row of "Where we are today". Only the boolean `false` hides it |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 31 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

Links on this page:
- **Existing values:** startAConversation, corporateIR, betterWorldImpact, financialEngineHero (= the Financial Engine value + `#fe-hero`), leadership, governance, platforms.
- **The four profiles:** the card links add `?from=leadership`, as the source does.
- **Shared header and footer keys.**
- **`ourRole`** → `{{ custom_values.bwci_url_our_role }}`: **proposed, create it in GHL.** The hero's "Our role →" and the first Explore row link to the Our Role page, which the design export does not contain. Until the value exists and holds a URL, both links are marked unavailable ("Not yet available"), like every other unset destination.

Custom Values to create (`name`/`value` bodies are also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json` for the image key):

```json
{ "name": "bwci_img_who_we_are_hero", "value": "<hosted URL of hero-globe.png>" }
{ "name": "bwci_url_our_role", "value": "#" }
```

GHL accepts one object per POST; check the returned `fieldKey` matches the reference above. Nothing was created in
the account from this repository.

## Sections and interactions reproduced

1. **Hero** (`#who-top`). The hero image drifts right to left (14 s, alternate). There are three layouts: at ≥1024 px the image is beside the copy; at 768–1023 px it sits below the copy with a dark fade; at ≤767 px it is a cover background at .32 opacity. The breadcrumb is Home › Who We Are. "Our role →" opens the Our Role page; "Start a Conversation" opens the Start a Conversation page.
2. **At a glance** (`#who-glance`). Four icon tiles overlap the hero by −64/−40/−32 px and lay out as 4, 2 or 1 columns. Hover fills the icon. The fourth tile is the registered office address. Then the corporate & regulatory statement, with the Corporate / IR link.
3. **Purpose** (`#purpose`). Dot and ring pattern, "Why BWCI exists" with Mission and What “Better World” means, and a quote card linking to Better World & Impact.
4. **Our story** (`#story`, new). A heading with "Since 2015", and three placeholder paragraphs on a gold-to-emerald timeline line; one column below 1024 px.
5. **In his words** (`#who-words`, new; `showFounderQuote`). A dark founder-quote card with a gold quote mark, the placeholder quote and the founder's byline with his portrait (`peopleImages.farhad-reyazat`, hidden while unset in the hosted block); one column below 768 px.
6. **Role** (`#role`). "Our role, in brief": a numbered list, and a "Who does what" aside that is sticky at ≥1024 px.
7. **Principles** (`#principles`). Six glass cards: hover lifts the card, adds a gold top line, and tints the number and icon. Two columns, then one, on smaller screens.
8. **How we work** (`#who-how`). The six-step Financial Engine strip (ring, chevrons, nodes) becomes a vertical list below 1024 px. It lights once, when 45 % is visible (IntersectionObserver), with staggered dots; without an observer it is lit at once. A copied live root starts unlit again.
9. **Where we are today** (`#who-today`, new). Today / In development / Next (`showNextRow`) rows with filled, half and dashed markers, and "Status as at [date]"; one column below 768 px.
10. **Explore** (`#who-explore`). Rows "01 Our Role" and "02 Leadership". Hover draws the underline and moves the text and arrow.
11. **Leadership** (`#who-leadership`). Four PersonCards (`from="leadership"`) in a 4- or 2-column grid. Below 768 px they form a scroll-snap carousel:
   - **Mouse or pen** (not touch) drags it once it overflows. The drag starts after 6 px. The release snaps smoothly to the nearest card (card width + 14 px).
   - **After a drag:** the click that ends it is cancelled, and native image drag is prevented.
   - **Touch** swipes natively.
   - Below the cards are links to Leadership and Governance.
12. **What you can expect from us** (`#who-expect`, new). A gold rule and heading (sticky at ≥1024 px) beside five numbered commitments.
13. **Next step** (`#who-next`). Dark CTA with a pattern, "Start a Conversation", and links to Platforms & Institutions and Corporate / IR. Since 9 November 2026 this button and the hero's "Start a Conversation" use `startAConversation` (`bwci_url_start_a_conversation`, the Start a Conversation page) instead of `contact`.

Also: the shared scroll motion (bwci-motion), which skips the hero as the source does; the shared header, drawer and footer; reduced-motion behaviour (no drift, no lift or slide, no stagger; content visible).

## How it is built

`node ghl/pages/who-we-are/_build/build.js` generates both blocks from `_build/src/` and the shared chrome:
- **CSS:** scoped to `#bwci-who-we-are`, with unused selectors pruned. Every source class carries a `who-` prefix, except the shared PersonCard's `gv-` classes. The source `.bw` wrapper is the root (`:scope.who-bw`, which keeps the source's selector specificity). The page uses the source's exact `:root` tokens: it defines no `--radius-full`, so the header's current-item underline keeps square ends, as in the source.
- **Ids:** `#purpose`, `#role`, `#principles` and `#story` keep their source names, because every page's footer links to them. The other sections use `who-` ids.
- **Fonts:** the source's font link, including Plus Jakarta Sans 800 (used by the "In his words" quote mark).
- **Build checks:** every link value equals the shared mapping's reference; the hero and portrait copies are byte-identical to `design/`; no Claude Design or local paths appear in the output.

This port adds two shared entries:
- **`ghl/shared/site-images/index.js`:** `whoWeAreHeroImage` → `bwci_img_who_we_are_hero`, a page-only setting that this page's build declares (`images: ['whoWeAreHeroImage']`), so it is in this page's script only. (In PR #41 it was first added to the list every page carries; that one-line change to the other pages was undone on `feat/ghl-providence-asset-management`. This page's own block is the same under both.)
- **`ghl/shared/site-links/index.js`:** a `proposed` list holding `ourRole` → `bwci_url_our_role`. It is resolved at build time only, so no other output changes.

## Validation (local, headless Chromium — not a published GHL page)

Full record: [qa/verification.md](qa/verification.md). The reference is the design (export `505e162`) with the owner's
live text (`_build/merged-source.js`).
- **Pixels:** 0.000 % with no differing rows at all 13 widths (320–2560) at 900 px height; 0.000 % at six widths at 600 and 1200 px, with motion on at 390/1440, in landscape (844 and 568 × 390), and
  with the founder quote and "Next" row switched off. No horizontal
  overflow, no console errors.
- **DOM:** box and style comparison of every section (the four new ones included), the header and the footer: 0
  differences at 1440/1024/768/390/320.
- **Behaviour (104 trace lines):** matches the reference in every interaction listed above, plus the new sections'
  layouts at every regime and the sticky "What you can expect" heading. The only differing value is a 1 px hero-image
  offset sampled at a different moment of the drift animation.
- **Shared header/drawer/footer/motion trace:** identical apart from the hero button's label ("Our role →", the owner's
  text; the trace was run against the design page). The lifecycle suite passes: config keys, hostile host, duplicate
  script, re-render, body-scroll restore and reduced motion.
- **Config:** literal, `#`, empty and resolved values in both variants. Resolved links compose sections and keep query strings; profile links put `?from=leadership` before any hash. The hosted block makes no image requests until values are set (the founder portrait included); the inline block falls back to the original bytes; no raw merge field reaches the DOM. A copied root picks up a changed config; disabled links don't navigate. `showFounderQuote` / `showNextRow`: `false` hides, the string `"false"` keeps the default.

## Intentional differences and source quirks

- Unset destinations (all 43 existing link values are `#` in the supplied export, plus the new `ourRole`) are marked unavailable instead of linking to design files. An unset hero image is hidden in the hosted block.
- Portraits are plain images placed the way image-slot places a photo; the image-slot editor is not ported, so there is no extra Tab stop inside each card.
- Smooth scrolling for in-page links is scoped to the widget (the source set it on `html`).
- The `.bw` paint-hold rule is omitted, because the system CSS is inline.
- The source hides the "Our Story" Explore row (`showOurStory` defaults to false; it would link to an `Our Story.dc.html` page the export does not contain), so the port has no such row. The "Our story" section itself is shown, and the footer's `#story` link now has its target.
- The text follows the owner's live page, not the design; the four new sections keep the design's text and placeholders ("[Our story, paragraph 1 …]", the founder quote, the "Next" milestones and "[date]").
- The leadership cards' names and roles follow the live page on this page only (see the content update above).

## Rebuild and test

```bash
node ghl/pages/who-we-are/_build/build.js && node ghl/pages/who-we-are/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g):
# MERGED=1 serves the reference (the design with the owner's live text) at design/Who We Are (merged).dc.html
export MERGED=1
S="http://localhost:8123/design/Who%20We%20Are%20(merged).dc.html"; P="http://localhost:8123/ghl/pages/who-we-are/_build/preview/plain.html"
node ghl/pages/who-we-are/_build/shoot.js "$S" /tmp/src && node ghl/pages/who-we-are/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/who-we-are/_build/diff.py /tmp/src /tmp/port
node ghl/pages/who-we-are/_build/domdiff.js "$S" "$P" 390
# founder quote and "Next" row off: MERGED_PROPS=founderQuote=false,nextRow=false with preview/plain-props.html
node ghl/pages/who-we-are/_build/behaviour.js "$S" src > /tmp/a; node ghl/pages/who-we-are/_build/behaviour.js "$P" port > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js who-we-are who http://localhost:8123/ bwci-who-we-are bwci-who-we-are-config
node ghl/pages/who-we-are/_build/config-qa.js http://localhost:8123/
```
