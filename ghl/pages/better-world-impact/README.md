# Better World & Impact — GoHighLevel port

## Design export 141ee23 (14 November 2026)

The page follows the new design: between the unchanged hero and closing CTA it now has **What we mean by
regeneration** (`#bwi-regeneration`), **Our approach** as a stepped "When capital is …" sequence (`#bwi-approach`),
**Regeneration is part of the cycle, not an add-on** with the design's **static** Financial Engine figure in a white
panel (`#bwi-engine`), and **Three returns from every cycle** with **How we will measure them** (`#bwi-returns`,
`#bwi-measure`). The old three-column approach, the interactive engine (PR #36) and the methodology notice are gone:
owner decision, 14 November 2026, "keep it static, as shown in the new design". Content, SVGs, layout, breakpoints and
draw-in animations are ported from the design; the design's two review props are config settings (below).
QA: [`qa/verification.md`](qa/verification.md). The interactive-engine record is kept under `qa/history/interactive-engine/`.
All four outputs (regular, inline, global, global inline) need re-pasting. Live GHL NOT VERIFIED.

## Global header/footer version (9 November 2026)

`node ghl/pages/better-world-impact/_build/build.js --global` also writes `better-world-impact.global.ghl.html` and
`better-world-impact.global.inline.ghl.html`: this page **without** its header and footer, for use between the
[global header and footer](../../global/README.md) GoHighLevel Global Sections ("BWCI Header" / "BWCI Footer"). Its root
carries `data-bwci-current="impact"` (the global header marks the current page from it); its config drops `logoImage`,
`showHeader`, `showFooter` and `footer` and keeps only the links the page itself uses. The regular outputs below are
unchanged. Local QA against the regular block: [global rollout verification](../../global/qa/verification.md). Live GHL
NOT VERIFIED for this page. Never paste it without the two global sections, and never combine the regular block with them.

## Centralized images — October 27, 2026

Both outputs now use GHL image Custom Values for this page's 2 image settings.
Valid resolved URLs take priority in both variants. The inline block retains the exact original
artwork under `imageFallbacks` for empty, `#` or unresolved values; the hosted block skips unavailable
images without requesting merge tokens. Existing image fields, crops, CSS, content and links remain.

[Image keys, six values to create and installation](../../shared/site-images/README.md) and
[current verification](../../shared/site-images/qa/verification.md) supersede the older image/default
instructions below. The supplied existing keys are reused; no GHL values or pages were modified.
Actual GHL substitution and live media delivery remain **NOT VERIFIED**.

## Centralized links — October 27, 2026

Navigation now uses the exact existing GHL Custom Value keys from the supplied export. Both output
variants preserve the config ID, property names and all non-link settings/images. Configure URLs in
GHL, then paste the updated block. Every used Custom Value currently contains `#`; cross-page links
remain unavailable until their confirmed URLs are set. Local anchors and profile entry context remain.

Current [mapping, validation and integration limits](../../shared/site-links/README.md) supersede the
older route/default tables below. The [local verification report](../../shared/site-links/qa/verification.md)
records this migration's checks; older QA remains historical. Actual GHL substitution inside JSON and
published navigation are **NOT VERIFIED**; no page was published or account setting changed.

## Final local regression — October 27, 2026 (historical: interactive engine, before export 141ee23)

Current evidence: [verification report](../../qa/final/verification.md) and
[machine-readable results](../../qa/final/results.json), from merged PR #36 (`7ddc04f`).

- Both outputs passed 19 viewport cases (57 source/inline/hosted captures), with loaded assets and no
  horizontal document overflow; 19/19 hosted/inline pairs are pixel-exact.
- Source comparison covers matching sections outside the deliberately interactive engine.
- All 56 engine interaction scenarios and eight page/config checks passed. The required interactive
  engine intentionally differs from the static exported figure.
- Six shared-menu/config cases, four hostile-host lifecycle cases and deferred-markup/destroy/reboot
  checks passed for this page.

Matching fallback fonts were used. Live GHL, actual web-font delivery, physical devices, published
URLs and approved business content remain **NOT VERIFIED**. Earlier QA sections below are historical.

Source: `design/Better World Impact.dc.html`, SiteHeader, Breadcrumb, SiteFooter, `bwci-system.css`,
`bwci-motion.js` and supplied `assets/impact-hero-ribbons.png`. Initial static port merged in PR #34;
Main/shared synchronization merged in PR #35 (`3d93dcf`), followed by the required engine interaction
correction in PR #36 (`7ddc04f`). The final local website-wide regression is recorded above;
live GHL installation remains a separate stage.

## Files, build and installation

Edit `_build/src/better-world-impact.{html,css,js,config.json}`, then run
`node ghl/pages/better-world-impact/_build/build.js`. Paste **one entire output** into one GHL Website
Builder Custom Code element in a full-width, zero-padding section/row/column.

- `better-world-impact.ghl.html`: about 128KB, with hosted image placeholders. Upload the supplied
  page artwork and shared `ghl/shared/site-chrome/assets/bwci-logo.png`, then set the two image URLs.
- `better-world-impact.inline.ghl.html`: about 3.56MiB; embeds both original PNGs. Font stylesheets
  remain external. Large Custom Code pastes need live GHL verification.
- `assets/impact-hero-ribbons.png`: unchanged 2022×778 RGBA artwork, 2,665,353 bytes, byte-identical
  to the design asset. No replacement, compression, flattening or baked-in crop.
- `_build/`, previews and QA dependencies are development only. Outputs require no React, JSX,
  source vendor/support script, local module, build process or source-relative asset at runtime.

Root/config: `bwci-better-world-impact` / `bwci-better-world-impact-config`; prefix `bwi-`; owner
`__bwciBetterWorldImpact`. Shared chrome is embedded at build time with `current="impact"`,
`breadcrumb="impact"`. Both variants share identical markup/styles/runtime and differ in image config
and their explanatory banner. GitHub Pages publishes design previews, not these GHL blocks.

## Source coverage

Source order is preserved: hero with original artwork, copy and breadcrumb; What we mean by regeneration; Our
approach; Regeneration and the Financial Engine; Three returns and How we will measure them; conditional Evidence and
Case studies; final CTA with source desktop/mobile copy. All text is verbatim from the design.

- **Regeneration:** renewal motif SVG (three arcs, arrow tips, numbered nodes, Natural/Economic/Social labels,
  dotted core; gradient pattern id `bwi-rg-dots`), three numbered rows on a coloured rail, the capital-structure
  paragraph and the "For example:" box. The motif sits beside the copy at 768–1023px and under it on phones.
- **Our approach:** three moments staggered as steps on desktop, a vertical timeline below 1024px. The `#bwi-approach`
  hero anchor still lands here.
- **Financial Engine:** the design's static figure (`figure.bwi-lp--static`, `role="img"` with the design's label),
  no stage controls and no "Impact considered" tags. Ring geometry at ≥1024px, vertical list with the return note below.
  "How the Financial Engine works →" uses `links.financialEngineHero`; on phones it is the design's full-width dark button.
  The design's bracketed supporting-copy placeholder is shown unless `engineSupportingCopy` is set.
- **Three returns:** hub icon with branch curves, three icon columns, dotted ties into the tinted measurement panel
  ("In development" status). Below 1024px the columns stack with icons on the left; branch and ties are hidden on phones.
- **Draw-in:** as the design's `componentDidMount`, the five `[data-bwi-draw]` figures that start below 90% of the
  viewport are armed (`bwi-is-armed`) and drawn once 15% visible (`bwi-is-in`). Without IntersectionObserver or under
  reduced motion nothing is armed, so every figure is complete without the script.

Known design traits kept as designed (owner: "follow the design"): the motif's SVG labels scale with the figure (about
10px desktop, 8px phones; decorative, `aria-hidden`, same words in the rows), and the measurement panel's dot pattern
reaches the start of its text on phones.

## Configuration and approved data

| Setting | Default / behavior |
|---|---|
| `impactHeroImage`, `logoImage` | Hosted placeholders; inline output embeds original PNGs |
| `showHeader`, `showFooter` | `true`; false uses host-provided chrome |
| `reviewFlags` | `false`. The design's "Review flags" prop (design default `true`): `true` shows the review badges "Copy to come" (approach, placeholders only), "Awaiting alignment" (engine, while no `engineSupportingCopy`) and "Leadership approval" |
| `approachCopy` | `"current site copy"` (the design option with the live wording, in the markup) or `"placeholders"` (the design default: bracketed "[Explanation to come …]" text, dashed boxes) |
| `engineSupportingCopy` | `""`. Empty shows the design's "[Supporting copy to come …]" placeholder; text replaces it with a normal lead paragraph |
| `evidence` | `[]`; complete records use value, label, date, source |
| `cases` | `[]`; complete records use label, title, summary, href, img, alt |
| `footer` | Existing optional regulatory/registration wording |
| `links.contact` | `#`; explicitly unavailable until a verified destination is configured |
| `links.startAConversation` | `{{ custom_values.bwci_url_start_a_conversation }}`: the hero and closing "Start a Conversation" buttons, the header, mobile-menu and footer buttons (owner decision, 9 November 2026; before, `links.contact`) |
| `links.betterWorldImpact` | `#`; independent Impact header/drawer/footer route |
| `links.financialEngineHero` | `/financial-engine#fe-hero`; existing local port anchor, live URL unverified |
| Other `links` | Existing shared destinations; configure each confirmed published URL |

Do not repurpose the original homepage `impact` setting retained by older pages. The hero approach
anchor stays `#bwi-approach`. Unavailable links give accessible feedback without jumping; valid routes
clear copied disabled state. Evidence/cases stay hidden until complete approved records are supplied.
Evidence value accepts text or a finite number; other fields are nonempty strings. Case images must
be HTTP(S), root-relative or a supported base64 image. Invalid/incomplete records are omitted.
Templates are populated through text/DOM APIs, not HTML interpolation. Copied records are cleared
before re-render. Malformed JSON retains safe launch defaults. No linked content is generated or verified.

## Motion and lifecycle

Source hero artwork drifts 14px over 14 seconds on desktop/tablet; phones keep its static crop. The
port also stops that drift for reduced motion, a deliberate difference from the export. Source reveal,
responsive typography/gutters, hero layout at 1024px and phone crop/final-CTA copy at 768px remain.

The shared owner reuses one instance during duplicate execution, waits for late markup and handles
root/ancestor replacement without scroll/resize. Replacement disconnects the draw-in observer, clears copied
`bwi-is-armed`/`bwi-is-in` classes and re-reads the config. Explicit teardown restores exact host
body overflow and removes status/shared listeners. No polling or continuous JS animation loop is added.

## Current verification

Current evidence: [`qa/verification.md`](qa/verification.md), [`qa/results.json`](qa/results.json) (page checks).
Historical: initial static page `qa/history/static-port/`, interactive engine (PR #36) `qa/history/interactive-engine/`.

```sh
node ghl/pages/better-world-impact/_build/build.js
node ghl/pages/better-world-impact/_build/build.js --global
node ghl/pages/better-world-impact/_build/static-checks.js
node ghl/pages/better-world-impact/_build/make-previews.js
python3 -m http.server 8124 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/better-world-impact/_build/qa.js http://127.0.0.1:8124 --checks-only
node ghl/pages/better-world-impact/_build/qa.js http://127.0.0.1:8124 --matrix-only
python3 ghl/pages/better-world-impact/_build/diff.py
```

`qa.js` renders the source with the port's launch settings (`reviewFlags` false, `approachCopy` "current site copy")
through its data-props; its `review` scenario renders both with the design's own defaults. `CHROMIUM_PATH` overrides
Playwright's browser. Raw captures stay ignored under `_build/qa-output/`.

Live GHL, actual web-font delivery/layout, final URLs/SEO, approved evidence/case content and physical
devices remain **NOT VERIFIED**. Stop at manual PR review; never merge automatically.
