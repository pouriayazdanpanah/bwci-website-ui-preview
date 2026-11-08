# Start a Conversation — GoHighLevel port

This is a port of `design/Start a Conversation.dc.html` (design export `a012ab2`, imported 8 November 2026) to one
GoHighLevel Custom Code block. The block includes the shared header and footer.
- **Branch:** `feat/ghl-start-a-conversation`, from main `0ed3636`.
- Merge and live GoHighLevel installation are separate steps.

## Owner decisions applied (8 November 2026)

- **The forms are the owner's GHL form iframes.** Each of the four routes embeds a GHL form from its own Custom Value.
  The design's mock form ("Form preview · your embedded form loads here") is not built. Until a route's link is set,
  a plain placeholder ("The enquiry form loads here") fills its frame.
- **A route is always open.** The page starts on the default route: SMEs & Projects, or the route named in the URL hash,
  e.g. `…#investors`. The design's "Choose a route above" empty state is not used:
  - "Choose a different route ↑" scrolls back to the route cards and focuses the open route's card, instead of closing
    the form;
  - on phones, tapping the open route's card leaves it open, instead of collapsing it.
- **No success panel.** The design's review-only thank-you state belonged to its mock form; the GHL form shows its own
  confirmation inside the iframe.

## Files

| File | Use |
|---|---|
| `start-a-conversation.ghl.html` | **Production block** (119 KB). The logo comes only from its Custom Value |
| `start-a-conversation.inline.ghl.html` | Self-contained block (166 KB). Same references, plus the original logo bytes as `imageFallbacks` |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts and `qa-form.html` (a blank stand-in form for local tests). Nothing here runs in GHL |
| `qa/verification.md` | Local QA record |

The page has no images of its own.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block. Keep the config id `bwci-start-a-conversation-config` and the JSON structure.
3. Set the page title to "Start a conversation — Better World Capital Investments PLC", which is the source `<title>`.
4. Create the four proposed form values below. Each holds the **embed link of a GHL form**: the `src` of the iframe GHL
   gives you when you embed a form or survey, e.g. `https://api.leadconnectorhq.com/widget/form/<form id>`. Only the link
   goes in the value, not the whole embed code.
5. If a form is taller or shorter than the frame, adjust `formHeight` / `formHeightPhone` in the config (see below).
6. Check the published page: each route's form, the route cards, and a link with `#investors` at the end.

**Nothing links to this page yet.** The header's "Start a Conversation" button goes to the Contact page, as in the
design. Contact's own seven "Start a Conversation" buttons still open the survey form (`{{ custom_values.contact }}`),
by the owner's 2 November decision. Pointing them here is an open owner decision; it would rebuild Contact and need a
re-paste of its block. This page would then get a proposed `bwci_url_start_a_conversation`, and Contact's four route
buttons would open their matching route (`#smes`, `#investors`, `#banks`, `#partners`).

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `forms.smes` | `{{ custom_values.bwci_url_form_smes }}` | **Proposed: create it.** SME or project enquiry form |
| `forms.investors` | `{{ custom_values.bwci_url_form_investors }}` | **Proposed: create it.** Investor or capital provider enquiry form |
| `forms.banks` | `{{ custom_values.bwci_url_form_banks }}` | **Proposed: create it.** Bank or financial institution enquiry form |
| `forms.partners` | `{{ custom_values.bwci_url_form_partners }}` | **Proposed: create it.** Strategic partner enquiry form |
| `defaultRoute` | `"smes"` | The route open at load when the URL names none: `smes`, `investors`, `banks` or `partners`. Anything else means `smes` |
| `formHeight` | `880` | Form frame height in px (the source's). 200–4000; anything else keeps 880 |
| `formHeightPhone` | `1180` | The same below 768 px (the source's). 200–4000; anything else keeps 1180 |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFlags` | `true` | Source prop `flags` (default **true**): the four "Compliance to approve" badges. Set `false` once the wording is approved. Only the boolean `false` hides them |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 26 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

A form link is used only when it is a full `http://` or `https://` address. Anything else shows the placeholder: unset,
`#`, a merge field GHL left in place, a relative path or another scheme. The four form values are proposed in
`ghl/shared/site-links/index.js`, and the build checks the config against them.

Custom Values to create (GHL accepts one object per POST; check that each returned `fieldKey` matches the reference above):

```json
{ "name": "bwci_url_form_smes", "value": "<embed link of the SME or project enquiry form>" }
{ "name": "bwci_url_form_investors", "value": "<embed link of the investor enquiry form>" }
{ "name": "bwci_url_form_banks", "value": "<embed link of the bank enquiry form>" }
{ "name": "bwci_url_form_partners", "value": "<embed link of the strategic partner enquiry form>" }
```

Nothing was created in the account from this repository.

The page's own links:
- `home`: the breadcrumb's "Home";
- `corporateIR` and `verify`: the "Looking for something else?" cards;
- `contactDetails` → `{{ custom_values.bwci_url_contact }}#cnt-details`: the "Contact details" card. This is the page-only
  section link the legal pages added.

## Sections and interactions reproduced

1. **Hero** (`#scv-top`): the shared dark inner-page hero with the page's own breadcrumb (Home › Start a conversation),
   the title, the lead and the three promise chips (stacked full width below 768 px).
2. **Routes** (`#scv-routes`): the raised card with "Which best describes you?" and four route cards.
   - **Route cards** are tabs (`role="tab"`, `aria-selected`, roving `tabindex`). The open route has the gradient border,
     filled icon and "Selected" label.
   - **Layout:** four columns, two below 1024 px. Below 768 px they become radio-style rows, and each route's panel opens
     directly under its own card (an accordion, by CSS `order`).
   - **Choosing a route** (click, tap, or Arrow keys / Home / End on a card) opens its panel with the source's entrance
     animation. It announces "… form open" in a polite live region and writes the route to the URL hash (`#banks`)
     without scrolling.
   - **Scrolling on choice:**
     - on tablets (768–1023 px) a tap scrolls the panel into view;
     - on phones the tapped card stays exactly where the finger is, even when a panel above it closes.
   - **Hash:** opening the page with `#smes`, `#investors`, `#banks` or `#partners`, or changing the hash later, opens
     that route.
   - **Each panel:** the dark aside (route, intro, "What happens next" in three steps, the legal note with its badge;
     sticky at ≥1024 px), the form frame with "Secure form", and "Not the right route? / Choose a different route ↑".
   - **Form frame:** the iframe has `loading="lazy"`, so only the open route's form loads, and the others load when
     opened. Its height is 880 px (1180 px on phones) or the configured one. Without a link the frame shows the
     placeholder.
3. **Looking for something else?** (`#scv-else`): three link cards (Corporate / IR, Verify a Communication, Contact
   details), stacked below 900 px.

Also: the shared header ("Start a Conversation" marked current, as the source's `current="contact"`), drawer, footer and
scroll motion, and reduced motion (panels fade instead of sliding, no card press scaling, no label movement).

## How it is built

`node ghl/pages/start-a-conversation/_build/build.js` generates both blocks from `_build/src/` and the shared chrome
(`current: 'contact'`, no shared breadcrumb, `content: true`, `sections: ['contactDetails']`).
- **CSS:** scoped to `#bwci-start-a-conversation`, with unused selectors pruned. That drops the mock form, the success and
  empty states, and the unused hero mark, with their keyframes. Every source class and id carries the `scv-` prefix; the
  keyframes `scIn` and `scFade` become `scv-scIn` and `scv-scFade`. The source's exact `:root` tokens are kept. The
  placeholder style is the only port-only CSS, built from the source's frame and empty-state styles.
- **Markup:** generated once from the source's rendered DOM with all four form links set, so text and structure match.
  Hooks (`data-scv-*`) are added for tabs, panels, forms, placeholders, badges, the back buttons and the live region.
- **Script:** the page's text/x-dc component (routes, hash, keyboard, phone accordion, back, live messages) with the
  owner's changes above, plus the form links and heights, in native JavaScript, and the shared chrome runtime.
- **Build checks:** page links and the four form links against the shared mapping, scoped selectors, keyframe names, and
  no Claude Design or local paths.

Shared changes (only this page's block is new; the 34 other generated pages rebuild byte-identical and Main is
untouched):
- `ghl/shared/site-links/index.js` proposes `formSmes`, `formInvestors`, `formBanks` and `formPartners`
  (`bwci_url_form_*`), resolved at build time. The existing unit check on proposed names covers them.
- `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the `scv-` prefix.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md). The source was rendered with the same four form links as the
port's comparison preview (both pointing at `_build/qa-form.html`), so both show real iframes.
- **Pixels, 13 widths (320–2560) × 900:** 0.000 %. Only one pixel at 1920 px differs, by 26/255 on a glyph edge.
- **Other pixel sets:** 0.000 % at six widths × 600 and × 1200, with motion on at 390/1440, in landscape (844 and
  568 × 390), and with the badges off. Isolated one- or two-row blips did not repeat.
- **DOM:** box and style walk of the hero, routes, "something else", header and footer: 0 differences at 1440, 1024, 768,
  390 and 320, and with the badges off at 1440 and 390.
- **Behaviour (39 trace lines):** identical to the source. It covers the route at load and from the hash, hash changes,
  clicks and keyboard (selection, tabindex, panel, message, hash), the panel animation, hovers, the tablet scroll, the
  phone accordion, "Choose a different route" (scroll and focus), resize and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes.
- **Config:**
  - literal, `#`, empty and resolved values (placeholders and no form requests while unset);
  - lazy loading, so only the open route's form loads;
  - unusable form values;
  - heights, including invalid ones;
  - default route and hash priority;
  - the badges;
  - clicks;
  - a hostile host (including generic `iframe` and `button` CSS) at 1440 and 390;
  - a copied root;
  - teardown, `pagehide`, and no IntersectionObserver.

## Intentional differences and source quirks

- **Owner decisions** (above): no mock form (iframe or placeholder instead), no empty state (a route is always open,
  "Choose a different route" keeps it open, a tap on the open phone card keeps it open), no success panel. The
  announcement after "Choose a different route" is "Choose a route." (the source said "Form closed. Choose a route.").
- **Unset values:** destinations are marked unavailable instead of linking to design files.
- **Smooth scroll:** the source sets `html{scroll-behavior:smooth}` on the whole page. The port scrolls only for its
  own actions, and jumps at once with reduced motion. The host's `<html>` is left alone.
- **Paint hold:** the `.bw` paint-hold rule is omitted; the system CSS is inline.
- **Source quirks, kept:**
  - the "[Team]" and "[X]" placeholder tokens inside "What happens next" render as full-width bars, because the source's
    step-text rule (`.sc-nx span{display:block}`) also matches them;
  - the hero's lead and chips still say "[X] working days", placeholder wording to approve.

## Rebuild and test

```bash
node ghl/pages/start-a-conversation/_build/build.js && node ghl/pages/start-a-conversation/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
B=ghl/pages/start-a-conversation/_build; F=http://localhost:8123/$B/qa-form.html
export FP="formUrlSmes=$F?smes,formUrlInvestors=$F?investors,formUrlBanks=$F?banks,formUrlPartners=$F?partners"
S="http://localhost:8123/design/Start%20a%20Conversation.dc.html"; P="http://localhost:8123/$B/preview/plain-forms.html"
SRC_PROPS=$FP node $B/shoot.js "$S" /tmp/src && node $B/shoot.js "$P" /tmp/port && python3 $B/diff.py /tmp/src /tmp/port
SRC_PROPS=$FP node $B/domdiff.js "$S" "$P" 390
SRC_PROPS=$FP node $B/behaviour.js "$S" > /tmp/a; node $B/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and the port's preview/plain.html, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js start-a-conversation scv http://localhost:8123/ bwci-start-a-conversation bwci-start-a-conversation-config
node $B/config-qa.js http://localhost:8123/
```
