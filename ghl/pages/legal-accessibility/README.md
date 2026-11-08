# Accessibility statement — GoHighLevel port

This is a port of `design/Accessibility.dc.html` (design export `a012ab2`, imported 8 November 2026) to one GoHighLevel Custom Code
block. The block includes the shared header and footer.
- **One of five legal pages** (Privacy, Terms, Cookies, Disclosures, Accessibility) built from the same design template.
  Each is its own port with its own folder, prefix and block. The other four: Privacy, Terms, Cookies, Disclosures.
- **Branch:** `feat/ghl-legal-pages`, from main `12576d8`. The owner chose one PR for the five pages, an exception to
  the one-page-per-branch rule.
- Merge and live GoHighLevel installation are separate steps.

## Files

| File | Use |
|---|---|
| `legal-accessibility.ghl.html` | **Production block** (85 KB). The logo comes only from its Custom Value; nothing is requested until it is set |
| `legal-accessibility.inline.ghl.html` | Self-contained block (132 KB). Same references, plus the original logo bytes as `imageFallbacks` |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record |

The page has no images of its own.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block. Keep the config id `bwci-legal-accessibility-config` and the JSON structure.
3. Set the page title to "Accessibility statement — Better World Capital Investments PLC", which is the source `<title>`.
4. Set the **existing** Custom Value `bwci_url_accessibility` to this page's URL. Every page's footer link "Accessibility" already uses it,
   and so does this page's legal pages switcher.
5. Check the published page: the switcher, the "On this page" index and the "Contact us" link.

No new Custom Value is needed. Nothing was created in the account from this repository.

## Configuration — the JSON block at the top of the paste

| Property | Value | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | Existing, shared by every page |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFlags` | `true` | Source prop `flags` (default **true**): the "Wording to approve" badge next to the date. Set `false` once the wording is approved. Only the boolean `false` hides it |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 26 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs |

The page's own links:
- `home`: the breadcrumb's "Home";
- `legalPrivacy`, `legalCookies`, `legalAccessibility`, `legalTerms`, `legalDisclosures`: the five cards of the legal pages
  switcher (the existing `bwci_url_privacy_policy`, `bwci_url_cookies_policy`, `bwci_url_accessibility`, `bwci_url_terms`,
  `bwci_url_disclosures`, the same values the footer uses);
- `contactDetails` → `{{ custom_values.bwci_url_contact }}#cnt-details`: "Contact us" in the questions panel. The
  design links to `Contact.dc.html#details`. In the Contact port that section's id is `cnt-details`, so this page-only
  section link adds that fragment to the Contact page's value. It stays unavailable while `bwci_url_contact` is unset.

## Sections and interactions reproduced

1. **Hero** (`#lac-top`): the shared dark inner-page hero with the page's own breadcrumb (Home › Legal ›
   Accessibility; "Legal" is not a link), the title, the lead, "Last updated [date]" and the "Wording to approve" badge.
2. **Legal pages switcher**: the five documents, each with icon, name and one-line description. This page's card is
   marked with the gradient border and filled icon.
   - **≥1101 px:** five columns.
   - **≤1100 px:** one row that scrolls sideways with snapping (cards 220 px, 200 px below 768 px). At load the current
     card is centred when the row overflows.
   - Hover (fine pointer) tints the other cards and their icons; pressing scales a card to 98 %.
3. **Document** (`#lac-content`): the "On this page" index and the sections (Our commitment, The standard we aim for, Known issues, Feedback and help).
   - **≥900 px:** the index is a sticky column beside the text.
   - **Below 900 px:** it sits above the text, and the marked item is filled dark.
   - **Index marking:** the first section is marked at load. The mark then follows the section crossing the band 25–35 %
     down the viewport (IntersectionObserver, as the source).
   - **Index links** scroll smoothly to their section, below the sticky header. They update the hash (`#lac-…`) and move
     focus off the link, as a native fragment jump does. With reduced motion they jump at once.
4. **Questions panel**: "Found something hard to use?" with "Contact us →"; it stacks below 640 px.

Also: the shared scroll motion (bwci-motion), the shared header (no menu item is current, as the source's
`current="legal"`), drawer and footer, and reduced motion (no press scaling; the shared fade-in kept).

## How it is built

`node ghl/pages/legal-accessibility/_build/build.js` generates both blocks from `_build/src/` and the shared chrome
(`current: 'legal'`, no shared breadcrumb, `content: true`, `sections: ['contactDetails']`).
- **CSS:** scoped to `#bwci-legal-accessibility`, with unused selectors pruned. Every source class and id carries the `lac-` prefix;
  the source `.bw` wrapper is the root (`:scope.lac-bw`). The source's exact `:root` tokens are kept, and its page
  font-size floors become `:scope` rules. The element resets also neutralise a host's `float` and `width` on sectioning
  elements.
- **Markup:** generated once from the source's rendered DOM, so text and structure match it. Hooks (`data-lac-*`) are added
  for links, the badge, the switcher row, the index and the document.
- **Script:** the page's text/x-dc component (badge, switcher centring, index marking) and the index links' smooth
  scroll, in native JavaScript, plus the shared chrome runtime.
- **Build checks:** link values against the shared mapping, in-page anchor targets, scoped selectors, and no Claude
  Design or local paths.

Shared changes (only the five legal blocks are new; the 29 other generated pages rebuild byte-identical and Main is
untouched):
- `ghl/shared/site-links/index.js`: the first page-only section link, `contactDetails` → `contact` + `#cnt-details`,
  declared by these five builds. `qa/unit.js` gains a check for it.
- `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the five prefixes.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md).
- **Pixels, 13 widths (320–2560) × 900:** 0.000 %, 0 differing rows at every width.
- **Other pixel sets:** 0.000 % at six widths × 600 and × 1200, with motion on at 390/1440, in landscape (844 and
  568 × 390), and with the badge off. Isolated one- to four-row blips did not repeat on re-capture.
- **DOM:** box and style walk of the hero, switcher, document, header and footer: 0 differences at 1440, 1024, 768, 390
  and 320, and with the badge off at 1440 and 390.
- **Behaviour (41 trace lines):** identical to the source, covering the index (load, reading band, click,
  hash, focus), the sticky index column, the switcher, hovers, keyboard order, live resize across every breakpoint
  and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes.
- **Config:**
  - literal, `#`, empty and resolved values;
  - `contactDetails` composed from the Contact value, with its query kept and fragment replaced;
  - disabled and enabled clicks;
  - the badge prop, including a non-boolean value;
  - a hostile host at 1440 and 390;
  - a copied root with a changed config;
  - teardown, `pagehide`, and no IntersectionObserver.

## Intentional differences and source quirks

- **Switcher centring.** The source centres the current card when it mounts, before the shared system stylesheet has
  applied, so it measures the row about 40 px wider than it ends up; the snapping then settles on a neighbouring card at
  some widths. The port measures the final layout and centres the card as the source's code intends. Measured from 320
  to 1100 px in 10 px steps: 12 of 79 widths (440–470 and 920–990 px) end at a different card; the source shows 87–100 % of the Accessibility card, the port 100 %.
- **Unset values:** destinations are marked unavailable instead of linking to design files.
- **Smooth scroll:** the source sets `html{scroll-behavior:smooth}` on the whole page, also with reduced motion. The port
  scrolls only its own index links, and jumps at once with reduced motion. The host's `<html>` is left alone.
- **Section ids** carry the `lac-` prefix, so an index link's hash is `#lac-…` rather than the source's bare id.
- **Paint hold:** the `.bw` paint-hold rule is omitted; the system CSS is inline.
- **As designed:** the text is placeholder wording in brackets, marked for approval by the badge; it is kept as written.

## Rebuild and test

```bash
node ghl/pages/legal-accessibility/_build/build.js && node ghl/pages/legal-accessibility/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
B=ghl/pages/legal-accessibility/_build
S="http://localhost:8123/design/Accessibility.dc.html"; P="http://localhost:8123/$B/preview/plain.html"
node $B/shoot.js "$S" /tmp/src && node $B/shoot.js "$P" /tmp/port && python3 $B/diff.py /tmp/src /tmp/port
node $B/domdiff.js "$S" "$P" 390
# badge off: SRC_PROPS rewrites the source's prop default; compare with plain-props.html
SRC_PROPS=flags=false node $B/shoot.js "$S" /tmp/srcf && node $B/shoot.js "http://localhost:8123/$B/preview/plain-props.html" /tmp/portf
node $B/behaviour.js "$S" > /tmp/a; node $B/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js legal-accessibility lac http://localhost:8123/ bwci-legal-accessibility bwci-legal-accessibility-config
node $B/config-qa.js http://localhost:8123/
```
