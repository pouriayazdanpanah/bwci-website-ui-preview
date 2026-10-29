# Who We Are — GoHighLevel port

Port of `design/Who We Are.dc.html` (design export `37102cf`, 28 October 2026) to one GoHighLevel Custom Code
block. The block includes the shared header, breadcrumb, leadership cards and footer. Branch
`feat/ghl-who-we-are`, started from main `37102cf`. Merge and live GoHighLevel installation are separate steps.

## Files

| File | Use |
|---|---|
| `who-we-are.ghl.html` | **Production block** (129 KB). Images come only from Custom Values; nothing is requested until they are set |
| `who-we-are.inline.ghl.html` | Self-contained block (3.7 MB). Same references, plus the original image bytes as `imageFallbacks` for any value that is not set yet |
| `assets/` | Reference copies, byte-identical to design: `hero-globe.png` (1448×1086, RGBA) and the four leadership portraits |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record for this revision |

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of `who-we-are.ghl.html`, or the inline file while the image values are not set yet. Keep the
   config id `bwci-who-we-are-config` and the JSON structure unchanged.
3. Set the page title to "Who We Are — Better World Capital Investments PLC" (the source `<title>`).
4. Create the two proposed Custom Values below and set the URL of this page in `bwci_url_who_we_are`. Every
   page's header and footer already links here, including to `#purpose`, `#role` and `#principles`.
5. Check the published page: links, images, header and drawer, the leadership carousel on a phone.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `whoWeAreHeroImage` | `{{ custom_values.bwci_img_who_we_are_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/hero-globe.png`. A separate key means the planned replacement photograph (design UI report) only needs a new value |
| `peopleImages.*` | `{{ custom_values.bwci_img_profile_<person> }}` | Existing portrait keys for Alexander Alegria Saif, Farhad Reyazat, Gabriella Karlova, Richard Werner |
| `showHeader` / `showFooter` | `true` | As on every page |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 32 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

Links on this page:
- **Existing values:** contact, corporateIR, corporateIRRegulatory, betterWorldImpact, financialEngineHero (= the Financial Engine value + `#fe-hero`), leadership, governance, platforms.
- **The four profiles:** the card links add `?from=leadership`, as the source does.
- **Shared header and footer keys.**
- **`ourRole`** → `{{ custom_values.bwci_url_our_role }}`: **proposed, create it in GHL.** The source links to `Our%20Role.dc.html` (the "Read about our role" link and the first Explore row), but the design export contains no such page. Until the value exists and holds a URL, both links are marked unavailable ("Not yet available"), like every other unset destination.

Custom Values to create (`name`/`value` bodies are also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json` for the image key):

```json
{ "name": "bwci_img_who_we_are_hero", "value": "<hosted URL of hero-globe.png>" }
{ "name": "bwci_url_our_role", "value": "#" }
```

GHL accepts one object per POST; check the returned `fieldKey` matches the reference above. Nothing was created in
the account from this repository.

## Sections and interactions reproduced

1. **Hero** (`#who-top`). The globe image drifts right to left (14 s, alternate). There are three layouts: at ≥1024 px the image is beside the copy; at 768–1023 px it sits below the copy with a dark fade; at ≤767 px it is a cover background at .32 opacity. The breadcrumb is Home › Who We Are. "Our role ↓" scrolls to `#role` (smooth, focus released, hash updated); "Start a Conversation" goes to Contact.
2. **At a glance** (`#who-glance`). Four icon tiles overlap the hero by −64/−40/−32 px and lay out as 4, 2 or 1 columns. Hover fills the icon. The registered office stays the source placeholder. Then the corporate & regulatory statement, with Corporate / IR and Regulatory links.
3. **Purpose** (`#purpose`). Dot and ring pattern, mission text, and a quote card linking to Better World & Impact.
4. **Role** (`#role`). A numbered list, and a "Who does what" aside that is sticky at ≥1024 px. It ends with the Our Role link.
5. **Principles** (`#principles`). Six glass cards: hover lifts the card, adds a gold top line, and tints the number and icon. Two columns, then one, on smaller screens.
6. **How we work** (`#who-how`). The six-step Financial Engine strip (ring, chevrons, nodes) becomes a vertical list below 1024 px. It lights once, when 45 % is visible (IntersectionObserver), with staggered dots; without an observer it is lit at once. A copied live root starts unlit again.
7. **Explore** (`#who-explore`). Rows "01 Our Role" and "02 Leadership". Hover draws the underline and moves the text and arrow.
8. **Leadership** (`#who-leadership`). Four PersonCards (`from="leadership"`) in a 4- or 2-column grid. Below 768 px they form a scroll-snap carousel:
   - **Mouse or pen** (not touch) drags it once it overflows. The drag starts after 6 px. The release snaps smoothly to the nearest card (card width + 14 px).
   - **After a drag:** the click that ends it is cancelled, and native image drag is prevented.
   - **Touch** swipes natively.
   - Below the cards are links to Leadership and Governance.
9. **Next step** (`#who-next`). Dark CTA with a pattern, "Start a Conversation", and links to Platforms and Corporate / IR.

Also: the shared scroll motion (bwci-motion), which skips the hero as the source does; the shared header, drawer and footer; reduced-motion behaviour (no drift, no lift or slide, no stagger; content visible).

## How it is built

`node ghl/pages/who-we-are/_build/build.js` generates both blocks from `_build/src/` and the shared chrome:
- **CSS:** scoped to `#bwci-who-we-are`, with unused selectors pruned. Every source class carries a `who-` prefix, except the shared PersonCard's `gv-` classes. The source `.bw` wrapper is the root (`:scope.who-bw`, which keeps the source's selector specificity). The page uses the source's exact `:root` tokens: it defines no `--radius-full`, so the header's current-item underline keeps square ends, as in the source.
- **Ids:** `#purpose`, `#role` and `#principles` keep their source names, because every page's footer links to them. The other sections use `who-` ids.
- **Build checks:** every link value equals the shared mapping's reference; the hero and portrait copies are byte-identical to `design/`; no Claude Design or local paths appear in the output.

This port adds two shared entries:
- **`ghl/shared/site-images/index.js`:** `whoWeAreHeroImage` → `bwci_img_who_we_are_hero`, a page-only setting that this page's build declares (`images: ['whoWeAreHeroImage']`), so it is in this page's script only. (In PR #41 it was first added to the list every page carries; that one-line change to the other pages was undone on `feat/ghl-providence-asset-management`. This page's own block is the same under both.)
- **`ghl/shared/site-links/index.js`:** a `proposed` list holding `ourRole` → `bwci_url_our_role`. It is resolved at build time only, so no other output changes.

## Validation (local, headless Chromium — not a published GHL page)

Full record: [qa/verification.md](qa/verification.md).
- **Pixels:** 0.000 % with no differing rows against the source at all 13 widths (320–2560) at 900 px height, at six widths at 600 and 1200 px, and with motion on at 390/1440. No horizontal overflow, no console errors.
- **DOM:** box and style comparison of every section, the header and the footer: 0 differences at 1440/1024/768/390/320.
- **Behaviour:** matches the source in every interaction listed above. The only differing values are 1 px hero-image offsets sampled at different moments of the drift animation.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes: config keys, hostile host, duplicate script, re-render, body-scroll restore and reduced motion.
- **Config:** literal, `#`, empty and resolved values in both variants. Resolved links compose sections and keep query strings; profile links put `?from=leadership` before any hash. The hosted block makes no image requests until values are set; the inline block falls back to the original bytes; no raw merge field reaches the DOM. A copied root picks up a changed config; disabled links don't navigate.

## Intentional differences and source quirks

- Unset destinations (all 43 existing link values are `#` in the supplied export, plus the new `ourRole`) are marked unavailable instead of linking to design files. An unset hero image is hidden in the hosted block.
- Portraits are plain images placed the way image-slot places a photo; the image-slot editor is not ported, so there is no extra Tab stop inside each card.
- Smooth scrolling for in-page links is scoped to the widget (the source set it on `html`).
- The `.bw` paint-hold rule is omitted, because the system CSS is inline.
- The source hides "Our Story" (`showOurStory` defaults to false), so the port has no Our Story row. The footer's `#story` link has no target on this page in the source either.
- Placeholder copy is kept as designed: "[Principles heading]", "[How we work]", "[Leadership & governance]", "[Next-step heading]", the lead sentences, and "[Registered office]". The UI report lists final copy and a photographic hero as open design items.

## Rebuild and test

```bash
node ghl/pages/who-we-are/_build/build.js && node ghl/pages/who-we-are/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g):
S="http://localhost:8123/design/Who%20We%20Are.dc.html"; P="http://localhost:8123/ghl/pages/who-we-are/_build/preview/plain.html"
node ghl/pages/who-we-are/_build/shoot.js "$S" /tmp/src && node ghl/pages/who-we-are/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/who-we-are/_build/diff.py /tmp/src /tmp/port
node ghl/pages/who-we-are/_build/domdiff.js "$S" "$P" 390
node ghl/pages/who-we-are/_build/behaviour.js "$S" src > /tmp/a; node ghl/pages/who-we-are/_build/behaviour.js "$P" port > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js who-we-are who http://localhost:8123/ bwci-who-we-are bwci-who-we-are-config
node ghl/pages/who-we-are/_build/config-qa.js http://localhost:8123/
```
