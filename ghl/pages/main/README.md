# Main (Homepage) — GoHighLevel port

## Content update — 11 November 2026 (branch `feat/ghl-main`, from main `505e162`)

By the owner's instruction Main now combines:
- **The owner's live Home markup** (the Custom Code markup supplied in the conversation on 11 November 2026, "the
  source is correct"). It replaces every section from the hero to the closing CTA exactly; only link addresses go back
  to `#` with their `data-bw-link` keys (the runtime fills them from the config), and the three leadership cards, which
  the live markup hard-coded to `/alexander-alegria-seif` etc., get the profile keys `profileAlexanderAlegriaSaif`,
  `profileFarhadReyazat` and `profileGabriellaKarlova`. What changed on the live page: new text throughout; the hero
  eyebrow and the scrolling credibility ticker are gone; eyebrows on The problem, Our approach and Leadership &
  Governance; the Financial Engine without its illustrative examples or their note; Platforms as five parts with three
  tabs (All 5 · Operating now 2 · In development 3) and their descriptions; Impact with a new line and without the
  "In development" badge; new audience cards with separate desktop and phone text; leadership names and profile links
  and a new governance panel; new CTA labels; and **no "10 The Platform Today" section**.
- **Design export `04715d6`'s new section "02 · Why it matters now, and why us"** (`#bwci-why`), inserted after the
  hero: the "Why now" bridge (need → BWCI → capital, curves drawn to the layout's pixel size, built with the scroll
  forward only, then pulses and a single glow; vertical below 900 px; everything shown at once with reduced motion) and
  the "Why us" 2×2 credentials panel. The design's `#problem` background (soft hand-off to the grey sections) is
  applied to `#bwci-problem`.

What the live markup needed beyond markup:
- **CSS for the owner's two new classes:** `bw-copy-desktop` / `bw-copy-mobile` (desktop text ≥768 px, phone text
  below) and `bw-platform-copy` (the platform descriptions shown in the "All" view, which hid them before).
- **Script data** for the parts the script redraws: the Platforms tabs re-render their cards from data, so the data,
  tabs and card template are now the owner's five parts (badge, name, description; no icon, relation, entity or
  stage track), and the block keeps `bw-platform-copy` when the filter changes. The tab summaries read "Parts
  operating now" / "Parts in development" (a port choice; the owner's markup only shows the "All" view). The Financial
  Engine data matches the owner's text, without the illustrative examples. The hero "At a glance" descriptions are
  unchanged (not in the markup).

Configuration:
- New: `showWhyFlags` (source prop `whyFlags`, default `true`): the "Awaiting sign-off", "Verify figure" and
  "Legal check" badges in the new section; only the boolean `false` hides them.
- New links: the three profile keys above, `providenceAssetManagement` (proposed, `bwci_url_providence_asset_management`),
  and `platformToday` → **proposed `{{ custom_values.bwci_url_platform_today }}`** (create it with the URL of the
  installed The Platform Today page).
- `today` (Main's own header/footer "The Platform Today") now uses the same `bwci_url_platform_today`, because the
  `#bwci-today` section it jumped to is gone. **Open (shared change, owner approval needed):** every other page's
  header and footer, and the global header, still link to Home + `#bwci-today`.
- Removed (no longer used): `governanceCommittees`, `governanceCapital`, `governanceRisk`, `platformsRegisters`.

Outputs: `main.ghl.html` and `main.inline.ghl.html` were edited together by the scripts in `qa/content-update-2026-11-11/` (with the owner markup), and
`node ghl/global/_build/main-global.js` regenerated both global variants. No other page changes.

Local QA (headless Chromium; not a published GHL page):
- **Owner markup:** in all four outputs the sections from hero to CTA (the new section aside) equal the owner's markup
  once link addresses are normalised.
- **"Why now, why us" against the design** (`qa/why.js`, the section on its own): 0.000 %, 0 differing rows at all 13
  widths with reduced motion (one capture of the source differed from itself at 1366/1920/2560 and re-captured to 0);
  the bridge trace (34 lines: drawn geometry at 1440 and 390, build progress at six scroll positions, no going back,
  completion with pulses and glow) is identical except one progress value in the third decimal (0.484 vs 0.485 at 390,
  a sub-pixel offset).
- **Content and links** (`qa/content-qa.js`): each Platforms tab renders the owner's cards, counts and summary, keeps
  `bw-platform-copy`, and "All" gives back the markup's text; desktop/phone copy switches at 768 px; the new links
  resolve (and are marked unavailable while unset); `showWhyFlags` false hides the four badges, the string `"false"`
  keeps them; no horizontal overflow and no script errors at 13 widths.
- **Behaviour regression** (`qa/behaviour.js`, main-branch block vs this block, 71/70 lines): hero facts, engine
  steps, Impact cards, anchors, keyboard and reduced motion unchanged; differences only where the content changed (the
  three tabs and their cards, shorter engine accordions without examples, no ticker, one strip-arrow step that no
  longer applies with three tabs).
- **Global rollout** (`ghl/global/qa/rollout.js main`): layout and pixels at 7 widths × 4 scroll positions, content
  links, dropdown, drawer, hostile host, in-page jumps, no errors: PASS, except the header-state check at 390 and 1440:
  the global header's "The Platform Today" still goes to `#bwci-today` while Main's own header goes to the Platform
  Today page (the open shared decision above).
- Shared unit tests (site-links, site-images, footer routes) PASS; every generated page rebuilds byte-identical.

The owner's live page itself (its CSS and script) was not supplied; QA is against the supplied markup and the design.

## Global header/footer version (9 November 2026)

`node ghl/global/_build/main-global.js` derives `main.global.ghl.html` and `main.global.inline.ghl.html` from the two
hand-edited outputs (which stay the source of truth; re-run it after editing them). They are Main **without** its header
and footer, for use between the [global header and footer](../../global/README.md) Global Sections. The script removes
the header/footer markup and CSS, drops `logoImage`, `showHeader`, `showFooter`, `footer` and the header-only links
(`home`, `impact`, `today`), applies the shared chrome's `global` runtime changes, and marks the root
`data-bwci-current="home" data-bwci-under-header`: Main's hero is pulled up under the header
(`margin-top: calc(var(--nav-h) * -1)`), so the global header keeps its placeholder transparent. The global header turns
its "The Platform Today" link (home + `#bwci-today`) into an in-page jump on Main, as before. Every step checks its match
and fails if Main's file changed shape. Local QA: [global rollout verification](../../global/qa/verification.md).

## Centralized images — October 27, 2026

Both outputs now use GHL image Custom Values for this page's 10 image settings.
Valid resolved URLs take priority in both variants. The inline block retains the exact original
artwork under `imageFallbacks` for empty, `#` or unresolved values; the hosted block skips unavailable
images without requesting merge tokens. Existing image fields, crops, CSS, content and links remain.

[Image keys, six values to create and installation](../../shared/site-images/README.md) and
[current verification](../../shared/site-images/qa/verification.md) supersede the older image/default
instructions below. The supplied existing keys are reused; no GHL values or pages were modified.
Actual GHL substitution and live media delivery remain **NOT VERIFIED**.

Main uses the existing `{{ custom_values.hero_image }}` for its hero and the supplied `bwci_img_…`
keys for its logo, portraits, Who photo and four Impact photos. Both files remain directly edited.

## Centralized links — October 27, 2026

Navigation now uses the exact existing GHL Custom Value keys from the supplied export. Both output
variants preserve the config ID, property names and all non-link settings/images. Configure URLs in
GHL, then paste the updated block. Every used Custom Value currently contains `#`; cross-page links
remain unavailable until their confirmed URLs are set. Local anchors and profile entry context remain.

Current [mapping, validation and integration limits](../../shared/site-links/README.md) supersede the
older route/default tables below. The [local verification report](../../shared/site-links/qa/verification.md)
records this migration's checks; older QA remains historical. Actual GHL substitution inside JSON and
published navigation are **NOT VERIFIED**; no page was published or account setting changed.

Main remains direct-edit: both outputs are updated together, with no `_build/` folder. Its local
`#bwci-impact` and `#bwci-today` values are preserved.

## Final local regression — October 27, 2026

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- 28/38 equal-size source/native full-page pairs are pixel-exact. Remaining raster differences are
  quantified in the central report.
- Current source/inline feature traces: 71 paired states; reviewed trace exceptions are in the central
  report.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

This regression corrects `fitSlot()` in both direct-edit outputs: after calculating the source's
cover-sized box, use `objectFit = 'fill'` to avoid a second CSS cover fit. The five source photo byte
streams and source/native image geometry are preserved. No `_build/` folder was added.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

GoHighLevel (GHL) **Website Builder → Custom Code** version of the Claude Design page
`design/Main.dc.html` (published at the site root as `index.html`), including the shared
`design/SiteHeader.dc.html` and `design/SiteFooter.dc.html` components it imports. The Claude Design
export in design/ is the reference; everything GHL-specific for this page lives here.

```
ghl/pages/main/
├── main.ghl.html          ← production block (hosted images)                      ~205 KB
├── main.inline.ghl.html   ← self-contained block (all images embedded as data URIs) ~4.7 MB
├── assets/                ← images to upload to GHL Media Storage (see below)
├── qa/                    ← development-only QA scripts (not part of the paste)
└── README.md
```

This page has no `_build/` folder: edit the two `.ghl.html` files directly and keep them identical
except for the image values in the config block (the inline file embeds them). The header, drawer and
footer markup/CSS/JS in both files came from the shared generator in `ghl/shared/site-chrome/`
(see that folder), so a header/footer change in design/ should be made there first and then copied
into these files.

## October 26, 2026 Main/shared synchronization

Historical stage 8 shared-synchronization evidence: [verification report](../../shared/site-chrome/qa/sync/verification.md) and
[aggregate results](../../shared/site-chrome/qa/sync/results.json). This update starts from merged
Impact PR #34 (`5b7fdfe`). Earlier QA sections below describe their original page revisions; they are
historical evidence, not a new full-page regression pass for these outputs.

- Header, drawer and footer now use independent `links.betterWorldImpact` (default `#`). Set the
  verified published Impact URL in this page's top JSON at installation. Unavailable links give
  accessible feedback without jumping to the top; configured links clear copied disabled state.
- Shared lifecycle handles root **or ancestor** replacement, delayed insertion and repeated script
  execution without requiring scroll/resize. Teardown restores the host's exact body overflow.
  Copied optional footer lines and native-option labels are normalized before reuse.
- Both variants passed current shared behavior at 390/1440px in a hostile host, including mocked
  HTTP image delivery for the hosted block. First execution before markup and explicit destroy/reboot
  also passed. Fonts used matching fallbacks; live GHL and actual web-font delivery remain **NOT VERIFIED**.
- That synchronization preserved page content, assets and pre-existing config values. The later
  final full-page responsive/source/interaction regression is recorded at the top of this README.

`links.impact` retains its existing homepage anchor `#bwci-impact` as a legacy config
setting. It is not consumed by the current header/footer, and is never reassigned to the independent
Impact page. `links.today` keeps its prior meaning. Build guards allow only this named legacy unused
key; missing, unknown and other unused keys still fail.

Main remains a direct-edit exception: both output files were updated together, with no `_build/`
folder. Besides the shared code/navigation update, only `.bw-cta` and `.bw-cta::before` changed to the
latest source gradients, 24px dot field and elliptical mask. All section markup/IDs and original
config/image strings are preserved. The CTA passed source geometry/style/text comparison at all
13 required widths and three extra height cases; all 32 source/variant image pairs were pixel-exact.

## Source coverage

The page was re-ported in full from the current export (the previous port matched an older design
with different sections and ids). Source dependencies inspected and replaced:

| Source | Port |
|---|---|
| `Main.dc.html` markup, `<style>`, `text/x-dc` logic | Scoped markup and CSS under `#bwci-main-page` (class prefix `bw-`, ids `bwci-*`); the `text/x-dc` state is re-implemented in native JS |
| `SiteHeader.dc.html` (utility bar, main nav, 4 dropdowns, mobile drawer with accordions, sticky state) | Shared chrome runtime (same links, labels, timings, keyboard model) |
| `SiteFooter.dc.html` (columns, regulatory text, legal line, bottom links) | Shared chrome footer; legal wording in config `footer` |
| `bwci-system.css`, `bwci-motion.js` | Not loaded by `Main.dc.html` (its tokens and type scale are in the page's own `<style>`), so neither is included; the page's own `.rv` reveal is ported |
| `image-slot.js` + `image-slots.state.json` (`home-who-photo`, `home-impact-1…4`) | Static images in `.bw-slot` frames that reproduce the slot's saved crop (size %, centre offset, cover at scale 1), recomputed on load and resize |
| `assets/home-hero-port.png`, `assets/people/*` | `assets/` here, configured by URL |
| `support.js`, React | Removed |

Sections, in source order: hero (`#bwci-hero`, with the key-facts strip), problem (`#bwci-problem`),
need (`#bwci-need`), the financial-engine loop (`#bwci-engine`), platforms by status (`#bwci-platforms`),
impact (`#bwci-impact`), audiences (`#bwci-audiences`), leadership (`#bwci-leadership`), today
(`#bwci-today`), closing CTA (`#bwci-cta`), then the footer. Other pages' configs link to
`/#bwci-impact` and `/#bwci-today`, so keep these ids stable. (Until 9 November 2026 five pages also linked to
`/#bwci-cta`; their "Start a conversation" buttons now open the Start a Conversation page.)

Since 9 November 2026 Main's header button, mobile-menu button and footer "Start a Conversation" link use the link key
`startAConversation` → `{{ custom_values.bwci_url_start_a_conversation }}` (the Start a Conversation page), edited by
hand in both outputs; "Contact" keeps `bwci_url_contact`. The inlined section list no longer has `startConversation`.

### Interactions ported

- **Header/drawer** (shared chrome): hover-intent dropdowns on fine pointers (160 ms close delay),
  click/keyboard dropdowns (ArrowDown/Up/Home/End, Escape returns focus, outside click closes), sticky
  bar after the utility strip scrolls away, mobile drawer below 1280 px with accordions, focus trap,
  Escape, and a body scroll lock that restores the host's own `overflow` value.
- **Hero key facts:** mouse hover, keyboard `:focus-visible` and click/tap select a fact; leaving the
  strip clears it; a second tap on touch closes it.
- **Engine loop:** node buttons and prev/next (wrapping) switch the step; progress ring `--p`; at
  ≥ 1024 px picking a step scrolls the detail card fully into view (smooth, or instant under reduced
  motion); below that the steps are an accordion.
- **Platforms by status:** filter tabs re-render the cards with the source's index-keyed reuse (kept
  cards stay in place, new ones animate in), counts and the "showing" label update; the tab strip
  shows edge arrows when it overflows, drags with the mouse, and keeps the picked tab in view.
- **Impact cards:** open 70 ms after hover, immediately on click/focus/tap.
- **Reveal on scroll** (`.rv`, IntersectionObserver, `0px 0px -8% 0px`, 0.08).
- **In-page anchors** scroll smoothly (instant under reduced motion).
- **Reduced motion:** ticker stops, no reveal/entrance animation, all content and controls visible.

## Installation in GoHighLevel

1. Upload to **Media Storage** and copy each URL:
   `assets/home-hero-port.png` (1448×1086), `assets/home-who-photo.webp` (1200×600),
   `assets/home-impact-1.webp` … `home-impact-4.webp`, `assets/alexander-alegria-saif.jpg`,
   `assets/farhad-reyazat.jpg`, `assets/gabriella-karlova.webp`, and the logo
   `ghl/shared/site-chrome/assets/bwci-logo.png`.
2. Open `main.ghl.html`. The **first block** is the configuration: paste the URLs into `heroImage`,
   `images.*` and `logoImage`, and set the `links`.
3. In the GHL page add a **full-width** section with no padding/margins, one row/column with no
   padding, and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font `<link>` tags, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`main.inline.ghl.html` works without steps 1–2 but is ~4.7 MB; GHL may reject or slow down a paste
that large, so use it for previews only. A placeholder (`REPLACE-WITH…`) URL is never requested: that
image simply stays empty until a real URL is set.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-main-config">
{ "heroImage": "…", "images": { … }, "logoImage": "…", "showHeader": true, "showFooter": true,
  "footer": { … }, "links": { … } }
</script>
```

| Key | Default | Used by |
|---|---|---|
| `heroImage` | placeholder | Hero visual |
| `images.whoPhoto`, `images.impact1…4` | placeholder | Need photo, impact cards (image-slot frames) |
| `images.leaderAlexander`, `leaderFarhad`, `leaderGabriela` | placeholder | Leadership cards |
| `logoImage` | placeholder | Header, drawer and footer logo |
| `showHeader` / `showFooter` | `true` | `false` removes the built-in header / footer (e.g. when a GHL global one is used) |
| `footer.regulatoryLine` | `""` | Optional regulatory sentence above the footer legal line |
| `footer.registeredJurisdiction`, `companyNumber`, `registeredOffice` | `""` | Optional parts of the footer legal line (omitted while empty, as in the source) |
| `links.home` | `/` | Logos |
| `links.financialEngine` | `/financial-engine` | Nav, drawer, footer, engine section |
| `links.ecosystem` | `/ecosystem` | Nav, drawer, footer |
| `links.platforms` | `/platforms` | Nav, drawer, footer |
| `links.platformsDirectory` | `/platforms#plt-directory` | Platform cards, "View the directory" |
| `links.platformsRegisters` | `/platforms#plt-registers` | Registers link |
| `links.smes`, `links.smesProcess`, `links.smesEngage` | `/smes-projects`, `…#sme-process`, `…#sme-engage` | SME nav and audience links |
| `links.investors`, `links.investorsRoute`, `links.investorsEngage` | `/investors-partners`, `…#inv-route`, `…#inv-engage` | Investor nav and audience links |
| `links.betterWorldImpact` | `#` | Independent Impact page in header/drawer/footer; set its verified URL |
| `links.impact`, `links.today` | `#bwci-impact`, `#bwci-today` | Preserved legacy Impact setting (unused by current chrome); Today same-page link |
| `links.whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory` | `#` | "Who we are" menu — **unresolved** |
| `links.leadership` | `#` | Nav, leadership cards and link — **unresolved** |
| `links.governance`, `governanceBoard`, `governanceCommittees`, `governanceCapital`, `governanceRisk`, `governancePerimeter` | `#` | Governance menu and "today" links — **unresolved** |
| `links.privateInvestors`, `corporateIR`, `contact`, `verify` | `#` | Nav, CTA, footer — **unresolved** |
| `links.legalPrivacy`, `legalTerms`, `legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap` | `#` | Footer bottom links — **unresolved** |

**Unresolved routes:** the design links these to pages that are not ported to GHL yet (Governance,
Governance Board, Governance Leadership, the profile pages) or that do not exist in the export
(who-we-are, private investors, corporate/IR, contact, verify, legal pages). They stay `#` until the
live GHL URLs exist; no URL has been invented for them.

## QA (local headless Chromium — not a published GHL page)

Source `design/Main.dc.html` served locally vs the port inside a plain host page
(`qa/make-previews.js`):

- **Pixel comparison** (`qa/shootv.js` + `qa/diff.py`, full page, reduced motion, viewport-stitched to
  avoid resize side-effects on the `svh`-sized hero): 0 % differing pixels at 320, 360, 390, 430,
  1280, 1366, 1440, 1600, 1920 and 2560 px; 375 px 0.36 % (sub-pixel image resampling in the impact
  cards, identical boxes); 768 and 1024 px ≈ 0.02 % (backdrop-blur rasterisation behind the facts strip).
- **DOM/computed-style walk** (`qa/domdiff.js`, every section + header + footer): 0 differences at all 13
  widths, and at 320×640, 390×844, 768×1024, 1024×600, 1440×1100, 1920×700 and 2560×1440.
- **Behaviour trace** (`qa/behaviour.js`: facts, engine, tabs/cards/drag/arrows, impact, anchors, touch
  at 390/320, reduced motion) identical to the source, except the one intentional difference below.
- **Shared chrome** (`ghl/shared/site-chrome/qa/chrome-behaviour.js`): header/dropdown/drawer/sticky/
  footer trace identical to the source.
- **Lifecycle** (`chrome-lifecycle.js main bw <base> bwci-main-page bwci-main-config`): config keys,
  `showHeader/showFooter:false`, footer wording, link overrides, broken JSON fallback, placeholders not
  requested, hostile host (aggressive global CSS, content above/below, `<section>` wrapper, the script
  executed twice → one instance, no horizontal overflow, host styles do not leak in), widget re-render
  (re-attaches, controls work), body overflow restored after the drawer. No console or network errors
  (Google Fonts are blocked by the local QA proxy only).
- **Reduced motion:** the same 7 elements as the source are invisible (hover-only fact detail, inactive
  impact media, leader overlays); all images load once scrolled into view (the leader images are lazy
  in the source too).

Run the scripts with `NODE_PATH=$(npm root -g)` from the repository root with a static server on it
(e.g. `npx http-server -p 8123 -c-1 .`); `node ghl/pages/main/qa/make-previews.js` writes
`qa/preview/plain.html` and `hostile.html` (git-ignored).

## Intentional differences and limits

- The source's image slots are editable in Claude Design (`image-slot.js` adds an editor control that
  takes keyboard focus). The port shows the saved crop as a static image; Tab skips that control.
- Remaining pixel differences are rasterisation only (see QA); no layout difference was found.
- The inline variant is ~4.7 MB; publish with the hosted variant.
- QA was local; installation in a published GHL page has not been verified.
