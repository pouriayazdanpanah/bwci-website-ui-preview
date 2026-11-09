# Privacy notice — GoHighLevel port

This is a port of `design/Privacy.dc.html` (design export `aac105f`, imported 8 November 2026) to one GoHighLevel Custom Code
block. The block includes the shared header and footer.
- **One of five legal pages** (Privacy, Terms, Cookies, Disclosures, Accessibility) built from the same design template.
  Each is its own port with its own folder, prefix and block. The other four: Terms, Cookies, Disclosures, Accessibility.
- **History:** first ported from export `a012ab2` on `feat/ghl-legal-pages` (PR #51; the owner chose one PR for the
  five pages, an exception to the one-page-per-branch rule). Export `aac105f` replaced the page's legal pages switcher
  with the shared LegalNav bar; that update (`feat/ghl-legal-nav`, from main `aac105f`, again one PR for the five) merged in PR #53 (`2f13c21`).
- Merge and live GoHighLevel installation are separate steps.

## Global header/footer version (9 November 2026)

`node ghl/pages/legal-privacy/_build/build.js --global` also writes `legal-privacy.global.ghl.html` and
`legal-privacy.global.inline.ghl.html`: this page **without** its header and footer, for use between the
[global header and footer](../../global/README.md) GoHighLevel Global Sections ("BWCI Header" / "BWCI Footer"). Its root
carries `data-bwci-current="legal"` (the global header marks the current page from it); its config drops `logoImage`,
`showHeader`, `showFooter` and `footer` and keeps only the links the page itself uses. The regular outputs below are
unchanged. Local QA against the regular block: [global rollout verification](../../global/qa/verification.md). Live GHL
NOT VERIFIED for this page. Never paste it without the two global sections, and never combine the regular block with them.

## Files

| File | Use |
|---|---|
| `legal-privacy.ghl.html` | **Production block** (85 KB). The logo comes only from its Custom Value; nothing is requested until it is set |
| `legal-privacy.inline.ghl.html` | Self-contained block (131 KB). Same references, plus the original logo bytes as `imageFallbacks` |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js`, QA scripts. Nothing here runs in GHL |
| `qa/verification.md` | Local QA record |

The page has no images of its own.

## Installation in GoHighLevel

1. Create the page in GHL with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block. Keep the config id `bwci-legal-privacy-config` and the JSON structure.
3. Set the page title to "Privacy notice — Better World Capital Investments PLC", which is the source `<title>`.
4. Set the **existing** Custom Value `bwci_url_privacy_policy` to this page's URL. Every page's footer link "Privacy" already uses it,
   and so does the legal pages bar of all five legal pages.
5. Check the published page: the legal pages bar (tabs on desktop, the "Legal" select on a phone), the "On this page" index and the "Contact us" link.

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
- `legalPrivacy`, `legalCookies`, `legalAccessibility`, `legalTerms`, `legalDisclosures`: the five tabs of the legal pages
  bar and the options of its phone select (the existing `bwci_url_privacy_policy`, `bwci_url_cookies_policy`, `bwci_url_accessibility`, `bwci_url_terms`,
  `bwci_url_disclosures`, the same values the footer uses);
- `contactDetails` → `{{ custom_values.bwci_url_contact }}#cnt-details`: "Contact us" in the questions panel. The
  design links to `Contact.dc.html#details`. In the Contact port that section's id is `cnt-details`, so this page-only
  section link adds that fragment to the Contact page's value. It stays unavailable while `bwci_url_contact` is unset.

## Sections and interactions reproduced

1. **Hero** (`#lpv-top`): the shared dark inner-page hero with the page's own breadcrumb (Home › Legal ›
   Privacy; "Legal" is not a link), the title, the lead, "Last updated [date]" and the "Wording to approve" badge.
2. **Legal pages bar** (`design/LegalNav.dc.html`, `current="privacy"`, from the shared site chrome): Privacy, Cookies,
   Accessibility, Terms and Disclosures.
   - **≥768 px:** a centred row of links on a white bar 57 px tall; this page's link is bold with a dark underline.
     Hover darkens another link and gives it a light underline; keyboard focus shows a green inset outline.
   - **Below 768 px** (matchMedia, as the source): a "Legal" label and a native select showing this page; choosing
     another page opens it.
   - The bar sticks under the sticky header while the page scrolls (`top: var(--nav-h) − var(--util-h)`, z-index 50).
     The sticky index column and the section jump targets sit 57 px lower to clear it.
   - An unset destination: its link is marked unavailable, its option is disabled ("— not yet available"), and
     choosing it announces "This destination is not yet available." without navigating.
3. **Document** (`#lpv-content`): the "On this page" index and the sections (Who we are, What we collect, How we use it, Who we share it with, How long we keep it, Your rights).
   - **≥900 px:** the index is a sticky column beside the text.
   - **Below 900 px:** it sits above the text, and the marked item is filled dark.
   - **Index marking:** the first section is marked at load. The mark then follows the section crossing the band 25–35 %
     down the viewport (IntersectionObserver, as the source).
   - **Index links** scroll smoothly to their section, below the sticky header. They update the hash (`#lpv-…`) and move
     focus off the link, as a native fragment jump does. With reduced motion they jump at once.
4. **Questions panel**: "Questions about your personal information?" with "Contact us →"; it stacks below 640 px.

Also: the shared scroll motion (bwci-motion), the shared header (no menu item is current, as the source's
`current="legal"`), drawer and footer, and reduced motion (the shared fade-in kept).

## How it is built

`node ghl/pages/legal-privacy/_build/build.js` generates both blocks from `_build/src/` and the shared chrome
(`current: 'legal'`, no shared breadcrumb, `legalnav: 'privacy'`, `content: true`, `sections: ['contactDetails']`).
- **CSS:** scoped to `#bwci-legal-privacy`, with unused selectors pruned. Every source class and id carries the `lpv-` prefix;
  the source `.bw` wrapper is the root (`:scope.lpv-bw`). The source's exact `:root` tokens are kept, and its page
  font-size floors become `:scope` rules. The element resets also neutralise a host's `float` and `width` on sectioning
  elements.
- **Markup:** generated once from the source's rendered DOM, so text and structure match it. Hooks (`data-lpv-*`) are added
  for links, the badge, the index and the document. The legal pages bar is the shared chrome's markup, inserted at
  `<!--chrome:legalnav-->`.
- **Script:** the page's text/x-dc component (badge, index marking) and the index links' smooth
  scroll, in native JavaScript, plus the shared chrome runtime (header, footer and the legal pages bar).
- **Build checks:** link values against the shared mapping, in-page anchor targets, scoped selectors, and no Claude
  Design or local paths.

Shared changes:
- **This update** (`feat/ghl-legal-nav`, merged in PR #53): `ghl/shared/site-chrome/site-chrome.js` builds the GovNav and LegalNav bars
  from one template (`sectionBar()`), with a new `legalnav` option. LegalNav reuses GovNav's hooks, CSS and runtime
  part (`site-chrome.govnav.js`, unchanged). The 31 other generated pages rebuild byte-identical and Main is untouched,
  so only the five legal blocks need re-pasting.
- **First port** (PR #51): `ghl/shared/site-links/index.js` gained the first page-only section link, `contactDetails` →
  `contact` + `#cnt-details`, declared by these five builds (`qa/unit.js` checks it).
  `ghl/shared/site-chrome/qa/chrome-behaviour.js` (development only) normalises the five prefixes.

## Validation (local, headless Chromium with real web fonts — not a published GoHighLevel page)

Full record: [qa/verification.md](qa/verification.md). Against export `aac105f`:
- **Pixels, 13 widths (320–2560) × 900:** 0.000 % at every width.
- **Other pixel sets:** 0.000 % at six widths × 600 and × 1200, with motion on at 390/1440, in landscape (844 and 568 × 390),
  and with the badge off. Isolated 1–17-row blips in single captures re-captured to 0 rows.
- **DOM:** box and style walk of the hero, the legal pages bar, the document, header and footer: 0 differences at 1440,
  1024, 768, 390 and 320, and with the badge off at 1440 and 390.
- **Behaviour (60 trace lines):** identical to the source, covering the index (load, reading band, click, hash,
  focus), the sticky index column, the legal pages bar (list or select at 1440, 1024, 768, 767 and 390 px, the current
  page, the options, the sticky position while scrolling, hover, focus, the select's style), the other hovers,
  keyboard order, live resize across every breakpoint and reduced motion.
- **Shared header/drawer/footer/motion trace:** identical. The lifecycle suite passes.
- **Config:**
  - literal, `#`, empty and resolved values, for the page links, the bar's links and the select's options;
  - `contactDetails` composed from the Contact value, with its query kept and fragment replaced;
  - disabled and enabled clicks; the phone select opening a configured page, and refusing an unset one;
  - the badge prop, including a non-boolean value;
  - a hostile host at 1440 and 390, with the bar stuck under the header;
  - a copied root with a changed config;
  - teardown, `pagehide`, and no IntersectionObserver.

## Intentional differences and source quirks

- **Unset values:** destinations are marked unavailable instead of linking to design files.
- **Smooth scroll:** the source sets `html{scroll-behavior:smooth}` on the whole page, also with reduced motion. The port
  scrolls only its own index links, and jumps at once with reduced motion. The host's `<html>` is left alone.
- **Section ids** carry the `lpv-` prefix, so an index link's hash is `#lpv-…` rather than the source's bare id.
- **Paint hold:** the `.bw` paint-hold rule is omitted; the system CSS is inline.
- **As designed:** the text is placeholder wording in brackets, marked for approval by the badge; it is kept as written.

## Rebuild and test

```bash
node ghl/pages/legal-privacy/_build/build.js && node ghl/pages/legal-privacy/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
B=ghl/pages/legal-privacy/_build
S="http://localhost:8123/design/Privacy.dc.html"; P="http://localhost:8123/$B/preview/plain.html"
node $B/shoot.js "$S" /tmp/src && node $B/shoot.js "$P" /tmp/port && python3 $B/diff.py /tmp/src /tmp/port
node $B/domdiff.js "$S" "$P" 390
# badge off: SRC_PROPS rewrites the source's prop default; compare with plain-props.html
SRC_PROPS=flags=false node $B/shoot.js "$S" /tmp/srcf && node $B/shoot.js "http://localhost:8123/$B/preview/plain-props.html" /tmp/portf
node $B/behaviour.js "$S" > /tmp/a; node $B/behaviour.js "$P" > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js legal-privacy lpv http://localhost:8123/ bwci-legal-privacy bwci-legal-privacy-config
node $B/config-qa.js http://localhost:8123/
```
