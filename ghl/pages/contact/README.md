# Contact — GoHighLevel port

This is a port of `design/Contact.dc.html` (design export `df79d85`, 2 November 2026) to one GoHighLevel Custom Code block. The block includes the shared header, breadcrumb and footer.
- Branch `feat/ghl-contact`, from main `ee5629c`; merged in PR #48 (`454f8e1`).
- Live GoHighLevel installation is a separate step and is not verified.

## Files

| File | Use |
|---|---|
| `contact.ghl.html` | **Production block** (112 KB). Images come only from Custom Values; nothing is requested until they are set |
| `contact.inline.ghl.html` | Self-contained block (2.0 MB). Same references, plus the original logo and hero bytes as `imageFallbacks` |
| `assets/` | `contact-hero-hands.png` (1774×887, RGBA), byte-identical to `design/assets/` (the build checks it) |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record |

The page's own image is the hero; the logo is the shared `bwci_img_logo`.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block.
   - Use the inline block while the image value is not set.
   - Keep the config id `bwci-contact-config` and the JSON structure.
3. Set the page title to "Contact — Better World Capital Investments PLC", which is the source `<title>`.
4. Create the proposed values below.
5. Set the existing `bwci_url_contact` to this page's URL. Every page's header "Start a Conversation" button and the footer "Contact" link already point here through it.
6. Check the published page: the links, the copy buttons and the "Contact details" jump.

## Owner decisions applied (2 November 2026)

- **"Start a Conversation" → the survey form.** The design links seven buttons and rows to a "Start a Conversation" page that is not in the export: the hero button, the router's lead button, the four enquiry routes (`#smes`, `#investors`, `#banks`, `#partners`) and the next-step button. All seven use the existing Custom Value `contact` (`{{ custom_values.contact }}`), the owner's external survey form. The section fragments are dropped because the form has no such sections. This is a different value from `bwci_url_contact`, the Contact page itself.
- **Email and phone → new Custom Values.** The design's `mailto:` and `tel:` links are empty. They become:
  - general enquiries email → proposed `bwci_url_contact_email`;
  - general enquiries phone → proposed `bwci_url_contact_phone`;
  - media enquiries email → proposed `bwci_url_media_email` (the design has a separate media address; it follows the same decision);
  - shareholder enquiries "email or registrar" → the existing `bwci_url_ir_email`, the investor-relations address that the Corporate IR pages already use.

  Each stays "Not yet available" until it holds a `mailto:` / `tel:` value. Nothing is invented.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `contactHeroImage` | `{{ custom_values.bwci_img_contact_hero }}` | **Proposed: create it in GHL** with the hosted URL of `assets/contact-hero-hands.png`. Unset, the hosted block shows the hero without the image |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showVisitorOffice` | `true` | Source prop: the "Office open to visitors" block in the registered-office panel |
| `showPam` | `true` | Source prop: the Providence Asset Management panel under the directory |
| `showMap` | `false` | Source prop: the placeholder map in the registered-office panel |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 31 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

A non-boolean prop value keeps its default.

The page's own links:

| Key | Reference | Where |
|---|---|---|
| `contactSurvey` | `{{ custom_values.contact }}` (existing survey form) | The seven "Start a Conversation" buttons and enquiry routes |
| `contactEmail` | `{{ custom_values.bwci_url_contact_email }}` — **proposed** | General enquiries email |
| `contactPhone` | `{{ custom_values.bwci_url_contact_phone }}` — **proposed** | General enquiries phone |
| `mediaEmail` | `{{ custom_values.bwci_url_media_email }}` — **proposed** | Media enquiries email |
| `irEmail` | `{{ custom_values.bwci_url_ir_email }}` (existing) | Shareholder enquiries email or registrar |
| `corporateIR` | existing | "Company information" and "Corporate / IR" |
| `governance`, `verify` | existing | "Governance", "Verify a Communication" |
| `providenceAssetManagement` | `bwci_url_providence_asset_management` (proposed in PR #45) | "Visit Providence Asset Management" (new tab) |

Custom Values to create (GHL accepts one object per POST; check that each returned `fieldKey` matches the reference above). The image body is also in `ghl/shared/site-images/bwci-image-custom-values-to-create.json`:

```json
{ "name": "bwci_img_contact_hero", "value": "<hosted URL of contact-hero-hands.png>" }
{ "name": "bwci_url_contact_email", "value": "mailto:<general enquiries address>" }
{ "name": "bwci_url_contact_phone", "value": "tel:<general enquiries number, e.g. +442079460000>" }
{ "name": "bwci_url_media_email", "value": "mailto:<media address>" }
```

Also fill the existing `bwci_url_ir_email` with a `mailto:` value. Nothing was created in the account from this repository.

**Displayed text.** The design's visible placeholders ("[email]", "[phone]", "[address]", "[hours, UK time]" and the bracketed notes) are content for the owner to approve in the design. They are kept as written, as on the Corporate IR pages. A Custom Value sets where a link goes, not its text.

## Sections and interactions reproduced

1. **Hero** (`#cnt-top`): the shared dark hero with the breadcrumb Home › Contact, the title, the lead, and two buttons: "Contact details ↓" and "Start a Conversation →".
   - **≥1024 px:** the hands image fills the right of the hero, faded in from the left.
   - **768–1023 px:** the image is centred below the copy.
   - **≤767 px:** it becomes a dimmed cover background.
   - The image drifts 14 px sideways (14 s, alternating). It stops on phones and with reduced motion.
   - **"Contact details" jump:** scrolls smoothly to the section, below the sticky header (`scroll-margin-top`). It updates the URL hash to `#cnt-details` and moves focus off the button, as a native fragment jump does. With reduced motion it jumps at once.
2. **Enquiry router** (`#cnt-enquiries`): the card overlapping the hero.
   - It has a dark lead panel with its button, and the four enquiry routes.
   - Hover tints a route, slides its title 4 px and fills its arrow circle; press scales the circle.
   - It stacks below 900 px, and the button goes full width below 560 px.
3. **Contact details** (`#cnt-details`): the grid pattern with coloured cells (hidden on phones), and the registered-office panel.
   - **Registered-office panel:** the address placeholder, company number 09881564 with its copy button, the visitor block and the map (props). It is sticky at ≥1024 px.
   - **Directory:** general (email, phone, hours), media (email, contact) and shareholder (email or registrar, "Company information"). It stacks below 1024 and 768 px.
   - **Providence Asset Management panel:** the "Visit" button opens in a new tab.
4. **Copy buttons (five):** company number, general email, general phone, media email, shareholder email.
   - A click writes to the clipboard, swaps the copy icon for a tick (blur and scale), sets `aria-label` to "Copied" and announces "… copied" in a polite live region.
   - After 1.6 s everything resets. Only one button is "copied" at a time.
   - Without the Clipboard API the tick still shows, as in the source.
   - **What is copied:** the design copies its placeholder text. The port does the same until the matching email or phone value is set; then it copies that address (the `mailto:` / `tel:` value without its scheme or query). The company number is always 09881564.
5. **Verify before you reply** (`#cnt-verify`): the note with "Verify a Communication".
6. **Next step** (`#cnt-next`): the dark panel with "Start a Conversation" (full width below 768 px), "Governance" and "Corporate / IR".

Also: the shared scroll motion (bwci-motion), the shared header, drawer and footer, and reduced motion (no drift, no route slide, the copy icons swap without movement).

## How it is built

`node ghl/pages/contact/_build/build.js` generates both blocks from `_build/src/` and the shared chrome (`current: 'contact'`, `breadcrumb: 'contact'`, `content: true`, `images: ['contactHeroImage']`).
- **CSS:** scoped to `#bwci-contact`, with unused selectors pruned.
  - The source style also carries the rules of the page it was derived from (at a glance, purpose, role, principles, engine strip, explore, leadership); the build drops them.
  - Every source class and id carries the `cnt-` prefix; the source `.bw` wrapper is the root (`:scope.cnt-bw`). The source keyframes `ivDrift` becomes `cnt-ivDrift`.
  - The source's exact `:root` tokens are kept; its page font-size floors become `:scope` rules.
- **Markup:** generated once from the source's rendered DOM (with `showMap` on for the map), so text and structure match it. Hooks (`data-cnt-*`) are added for the image, links, copy buttons, props and live region.
- **Script:** the page's text/x-dc component (three props, five copy buttons) and the "Contact details" jump, in native JavaScript, plus the shared chrome runtime.
- **Build checks:** link values against the shared mapping, the hero copy byte-identical to `design/assets/`, scoped selectors, keyframe names, the in-page anchor target, and no Claude Design or local paths.

Shared changes (only this page's block is new; the 28 other generated pages rebuild byte-identical, and Main is untouched):
- `ghl/shared/site-images/index.js`: `contactHeroImage` → `bwci_img_contact_hero`, a **page-only** setting declared by this build. The to-create file now holds 13 keys.
- `ghl/shared/site-links/index.js`:
  - proposed `contactEmail`, `contactPhone`, `mediaEmail`;
  - a new `named` list for existing values outside the `bwci_url_` naming, with its first entry `contactSurvey` → `contact`.

  Both are resolved at build time only. `qa/unit.js` gains two checks.
- `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the `cnt-` prefix.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md).
- **Pixels:** 0.000 % against the source at all 13 widths (320–2560) at 900 px height, at six widths at 600 and 1200 px, with motion on at 390/1440, in landscape at 844×390 and 568×320, and with the three props flipped at six widths.
- **DOM:** box and style walk of the five sections, header and footer: 0 differences at 1440, 1024, 768, 390 and 320, and with the props flipped at 1440 and 390.
- **Behaviour (53 trace lines):** identical to the source. It covers the copy buttons (clipboard, labels, icons, message, reset, switching, keyboard), the "Contact details" jump, the sticky panel, every hover state, keyboard order, the drift, live resize across every breakpoint and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes.
- **Config:**
  - literal, `#`, empty and resolved values in both variants;
  - the hero: no request until set;
  - what the copy buttons copy, unset and set;
  - the survey click;
  - the props, including non-boolean values;
  - a hostile host at 1440 and 390;
  - a copied root mid-copy;
  - teardown mid-copy, `pagehide`, no Clipboard API, and no IntersectionObserver.

## Intentional differences and source quirks

- **Unset values:** destinations are marked unavailable instead of linking to design files or to empty `mailto:` / `tel:` links. An unset hero image is left out of the hosted block.
- **Survey links:** the four route fragments are dropped (owner decision above).
- **Copied text:** the configured address once set, instead of the placeholder (above).
- **Smooth scroll:** the source sets `html{scroll-behavior:smooth}` on the whole page, also with reduced motion. The port scrolls only its own "Contact details" link, and jumps at once with reduced motion. The host's `<html>` is left alone.
- **Paint hold:** the `.bw` paint-hold rule is omitted; the system CSS is inline.
- **Source quirk, kept as designed:** in "Verify before you reply", the "Verify a Communication" link is white on the white note card (the shared `.hlink` colour), so it only shows on hover or focus. The port reproduces it exactly; fixing it is a design change.
- **Header:** on this page the header's "Start a Conversation" button is the current page (green), as in the source: it links to Contact (`bwci_url_contact`), not to the survey.

## Rebuild and test

```bash
node ghl/pages/contact/_build/build.js && node ghl/pages/contact/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
B=ghl/pages/contact/_build
S="http://localhost:8123/design/Contact.dc.html"; P="http://localhost:8123/$B/preview/plain.html"
node $B/shoot.js "$S" /tmp/src && node $B/shoot.js "$P" /tmp/port && python3 $B/diff.py /tmp/src /tmp/port
node $B/domdiff.js "$S" "$P" 390
# prop variant: SRC_PROPS rewrites the source's prop defaults; compare with plain-props.html
SRC_PROPS=showVisitorOffice=false,showPam=false,showMap=true node $B/shoot.js "$S" /tmp/srcp && node $B/shoot.js "http://localhost:8123/$B/preview/plain-props.html" /tmp/portp
node $B/behaviour.js "$S" > /tmp/a; node $B/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js contact cnt http://localhost:8123/ bwci-contact bwci-contact-config
node $B/config-qa.js http://localhost:8123/
```
