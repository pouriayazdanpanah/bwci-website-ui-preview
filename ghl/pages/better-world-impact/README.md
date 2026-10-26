# Better World & Impact — GoHighLevel port

Source: `design/Better World Impact.dc.html`, SiteHeader, Breadcrumb, SiteFooter, `bwci-system.css`,
`bwci-motion.js` and supplied `assets/impact-hero-ribbons.png`. Initial static port merged in PR #34;
Main/shared synchronization merged in PR #35 (`3d93dcf`). The interaction correction starts from that
clean merged main on `feat/ghl-better-world-impact-interaction` and is pending its own PR review.
Final website-wide regression and live GHL installation remain separate stages.

## Files, build and installation

Edit `_build/src/better-world-impact.{html,css,js,config.json}`, then run
`node ghl/pages/better-world-impact/_build/build.js`. Paste **one entire output** into one GHL Website
Builder Custom Code element in a full-width, zero-padding section/row/column.

- `better-world-impact.ghl.html`: about 116KB, with hosted image placeholders. Upload the supplied
  page artwork and shared `ghl/shared/site-chrome/assets/bwci-logo.png`, then set the two image URLs.
- `better-world-impact.inline.ghl.html`: about 3.55MiB; embeds both original PNGs. Font stylesheets
  remain external. Large Custom Code pastes need live GHL verification.
- `assets/impact-hero-ribbons.png`: unchanged 2022×778 RGBA artwork, 2,665,353 bytes, byte-identical
  to the design asset. No replacement, compression, flattening or baked-in crop.
- `_build/`, previews and QA dependencies are development only. Outputs require no React, JSX,
  source vendor/support script, local module, build process or source-relative asset at runtime.

Root/config: `bwci-better-world-impact` / `bwci-better-world-impact-config`; prefix `bwi-`; owner
`__bwciBetterWorldImpact`. Shared chrome is embedded at build time with `current="impact"`,
`breadcrumb="impact"`. Both variants share identical markup/styles/runtime and differ in image config
and their explanatory banner. GitHub Pages publishes design previews, not these GHL blocks.

## Source coverage and required interaction

Source order is preserved: hero with original artwork, copy and breadcrumb; Our approach with the
Structured / Owned / Deployed columns; Financial Engine; optional methodology notice; conditional
Evidence and Case studies; final CTA with source desktop/mobile copy.

The actual exported engine is static and its `STEPS`, selection, previous/next and detail styles are
unused. The original user request explicitly requires the six-stage interaction. This correction
intentionally replaces that static figure with controls using those retained source definitions and
the established Main/Financial Engine pattern. `design/` remains unchanged. This is a documented
requirement-driven difference, not a claim that the source figure was interactive.

- Six native stage buttons, default **Need**; clicking selects a stage. Arrow keys move selection and
  focus, Home/End select first/last, and native Enter/Space activate the focused button.
- Previous/next wrap from first to last and last to first. Source progress is `index / 5`; an accessible
  stage count and active/past markers update together. Controls remain available on phones.
- At >=1024px, source ring geometry and detail-card styles are used. Buttons have actual hit boxes,
  preserving node centres. Selecting a node reveals the desktop card within source scroll limits;
  no wheel/touch scrolling is trapped. Source shorter-height geometry applies at <=860px.
- Below 1024px, one stage's description/example expands under its own button. Re-selecting it keeps
  that stage open, as in the established site pattern. Crossing the breakpoint preserves selection
  and updates controlled regions; inactive/duplicate panels are inaccessible (`aria-hidden`/`inert`).
- Architecture, Institution and Reinvestment retain persistent **Impact considered** labels,
  independently of selected stage. The return-loop copy remains intact.
- All six titles, descriptions and illustrative examples come verbatim from the source's `STEPS`.
  Examples are labelled **Example**; they are not published evidence or case studies. No facts,
  metrics, outcomes, approvals, case studies or URLs were invented.
- Source hover/focus treatment is retained. Reduced motion disables engine transitions and uses
  immediate desktop reveal scrolling. Mobile link text/arrow stay white on the source dark button.

All other section markup, original config/image strings and assets remain unchanged from `3d93dcf`.
No shared generator/runtime, design source or other 22 page outputs are modified by this correction.

## Configuration and approved data

| Setting | Default / behavior |
|---|---|
| `impactHeroImage`, `logoImage` | Hosted placeholders; inline output embeds original PNGs |
| `showHeader`, `showFooter` | `true`; false uses host-provided chrome |
| `showMethodology` | `true`; false hides the source future-publication notice |
| `evidence` | `[]`; complete records use value, label, date, source |
| `cases` | `[]`; complete records use label, title, summary, href, img, alt |
| `footer` | Existing optional regulatory/registration wording |
| `links.contact` | `#`; explicitly unavailable until a verified destination is configured |
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
root/ancestor replacement without scroll/resize. Replacement resets the engine to Need and removes
old handlers, media-query listeners and pending reveal frames. Explicit teardown restores exact host
body overflow and removes status/shared listeners. No polling or continuous JS animation loop is added.

## Current verification

Current evidence: [`qa/verification.md`](qa/verification.md), [`qa/results.json`](qa/results.json).
Current interaction checks cover 56 scenarios, both variants, the 13 required widths plus 767/1023px,
varied heights, normal/reduced motion, touch, keyboard/focus, hover, hostile CSS and lifecycle. Eight
page/config/motion checks pass. Unchanged-section source comparison covers 15 widths / 45 captures /
120 section pairs; geometry/text match, with raw pixel differences documented in the report.

Historical initial-static-page evidence is preserved under `qa/history/static-port/`. Shared sync
PR #35 evidence remains in `../../shared/site-chrome/qa/sync/`; it does not pass this correction.

```sh
node ghl/pages/better-world-impact/_build/build.js
node ghl/pages/better-world-impact/_build/static-checks.js
node ghl/pages/better-world-impact/_build/make-previews.js
python3 -m http.server 8124 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/better-world-impact/_build/interaction-qa.js http://127.0.0.1:8124 --behavior-only
node ghl/pages/better-world-impact/_build/interaction-qa.js http://127.0.0.1:8124 --visual-only
node ghl/pages/better-world-impact/_build/qa.js http://127.0.0.1:8124 --checks-only
python3 ghl/pages/better-world-impact/_build/interaction-diff.py
node ghl/pages/better-world-impact/_build/shared-regression.js
node ghl/pages/better-world-impact/_build/interaction-results.js
```

If Node cannot spawn Git, export `3d93dcf:ghl/shared/site-chrome/site-chrome.js` to a temporary file and
pass its path to `shared-regression.js`. `CHROMIUM_PATH` overrides `/usr/bin/chromium`. Raw captures
and fixtures stay ignored under `_build/qa-output/`. `--only=<case name>` runs a focused scenario;
aggregate recovery must be newer than the main behavior run. Older full-page static capture/diff
commands are historical because the engine is now intentionally different.

Live GHL, actual web-font delivery/layout, final URLs/SEO, approved evidence/case content and physical
devices remain **NOT VERIFIED**. After this corrective PR is reviewed and merged, run stage 9 current
full-site regression. Stop at manual PR review; never merge automatically.
