# Better World & Impact — GoHighLevel port

Source: `design/Better World Impact.dc.html`, inspected on merged main `b439054` after Legal Notices
PR #33. This twenty-third independent GHL page was merged in PR #34 (`5b7fdfe`). The Main/shared
synchronization above updates its embedded shared code. A required engine-interaction correction
and final affected-page regression remain; this does not complete or publish the website.

## October 26, 2026 Main/shared synchronization

Current shared-synchronization evidence: [verification report](../../shared/site-chrome/qa/sync/verification.md) and
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
- All page content, assets and pre-existing config values are preserved. Final full-page responsive,
  source/port and interaction regression remains a separate stage after the Impact interaction fix.

Both outputs were regenerated with this page's existing `_build/build.js`; its content CSS is
byte-identical to merged main `5b7fdfe`. Edit `_build/src/`, then rebuild as before. Older page-local
`shared-regression.js` assertions intentionally target historical shared code; use the current central
report for this synchronization rather than relabeling those historical checks as current.

## Files, build and installation

Edit `_build/src/better-world-impact.{html,css,js,config.json}`, then run
`node ghl/pages/better-world-impact/_build/build.js`. Paste one complete output into one GHL Website
Builder Custom Code element in a full-width, zero-padding section. Do not paste both variants into
one document.

- `better-world-impact.ghl.html`: hosted hero/logo, about 92KB; upload the supplied page artwork and
  shared `ghl/shared/site-chrome/assets/bwci-logo.png`, then set both image URLs in the top JSON.
- `better-world-impact.inline.ghl.html`: embeds both original PNGs, about 3.5MiB; no separate image
  upload is needed. Fonts retain their external stylesheet links.
- `assets/impact-hero-ribbons.png`: byte-identical copy of the design's 2022×778 RGBA artwork
  (2,665,353 bytes). No compression, replacement, background flattening or cropping is baked into it.
- `_build/` and its QA dependencies are development only. GHL needs no compiler, module, package,
  React, support.js, source vendor file or source-relative asset.

Root/config IDs: `bwci-better-world-impact` and `bwci-better-world-impact-config`; class/data/animation
prefix `bwi-`; owner `__bwciBetterWorldImpact`. Existing shared chrome is assembled at build time
with `current="impact"`, `breadcrumb="impact"` and content styles. Design files, shared generators
and assets are preserved. All 23 blocks receive the shared synchronization described above.
GitHub Pages continues to publish only the design preview.

## Source inventory and behavior

The actual export imports SiteHeader, Breadcrumb, SiteFooter, `bwci-system.css` and `bwci-motion.js`.
The DC/React component supplies only the methodology visibility and empty evidence/case arrays to
the rendered view. Plus Jakarta Sans and JetBrains Mono remain the source fonts with system fallbacks.

1. Hero: exact source heading/purpose copy, Home → Better World & Impact breadcrumb, approach anchor
   and Contact CTA; supplied ribbon artwork, gradients, dot field, masks, responsive crop and entrance.
2. Our approach: original introduction and Structured / Owned / Deployed columns with all copy.
3. Financial Engine: original explanatory copy, six steps, return loop and Financial Engine link.
4. Methodology: conditional notice stating the methodology will be published here; no invented file.
5. Evidence and Case studies: absent by default, source card layouts available for approved data only.
6. Final CTA: source dark gradients/dots, desktop/mobile copy variants and Contact CTA.

The rendered engine is **static**, as in the inspected markup: one accessible `figure role="img"`,
six list items, and fixed Impact considered markers at Architecture, Institution and Reinvestment.
It has no buttons, detail panels, accordion or scroll capture. The export retains unused interactive
step/previous/next definitions and retired CSS; those do not drive this view. However, the original user request explicitly requires stage selection, previous/next controls,
progress state and responsive interaction. The static port is therefore a **known unmet requirement**.
Implement the pending [interaction correction](../../../docs/implementation/pages/better-world-impact-interaction.md)
in a separate page-specific PR before final regression; source inspection does not override that request.

The desktop loop derives its nodes/arrows from the source `--R`/`--y` geometry. It becomes a vertical
list at <=1023px, preserving the mobile return note. Short desktop heights (<=860px) use the source's
smaller loop radius. Approach columns and hero layout switch at 1024px; hero phone crop and final CTA
copy switch at 768px. Header, footer, type and gutter breakpoints follow the shared source rules.

## Configuration and approved data

Top JSON settings:

| Setting | Default / behavior |
|---|---|
| `impactHeroImage`, `logoImage` | Explicit hosted placeholders; inline output embeds original PNGs |
| `showHeader`, `showFooter` | `true`; set false to use GHL-provided chrome |
| `showMethodology` | `true`; false hides the source notice |
| `evidence` | `[]`; complete records use value, label, date, source |
| `cases` | `[]`; complete records use label, title, summary, href, img, alt |
| `footer` | Existing optional regulatory/registration wording |
| `links` | Existing shared destinations plus `financialEngineHero` |

Evidence value accepts text or a finite number; other fields are nonempty strings. Case image URLs
must be HTTP(S), root-relative or a supported base64 image. Incomplete/invalid records are omitted;
sections remain hidden when no complete record exists. There are no production metrics, citations,
dates or case studies in the defaults. Populating these fields requires approved real content.

Native inert templates retain the exact source card markup. The runtime inserts values as text,
sets image/alt/link properties through DOM APIs and clears copied cards before re-rendering. Case
`href="#"` remains unavailable with feedback; valid configured routes navigate normally. Missing,
unsafe and placeholder image URLs are not requested. Malformed JSON keeps the launch defaults.
Content is supplied in JSON; the runtime does not verify claims or publish linked material.

The hero approach link targets `#bwi-approach`. Contact uses the existing unresolved `links.contact`
(`"#"`). `links.financialEngineHero` defaults to `/financial-engine#fe-hero`, matching the existing
Financial Engine output's verified local anchor. Its deployed URL is not established by this port.
The independent `betterWorldImpact` route remains configurable; older Main `impact` anchor semantics
are preserved. Current broad output synchronization is recorded above.

## Motion, lifecycle and intentional differences

Normal desktop/tablet artwork drifts 14px over 14 seconds with the source easing/alternate behavior;
phones retain the source's static image. The port additionally stops decorative drift for reduced
motion. The source leaves that image animation running in reduced mode. Shared reduced-motion hero
entrance/reveals and ordinary keyboard/wheel/touch scrolling remain supported. No scrolling is trapped.

Inline CSS removes the delayed export paint hold. Source internal IDs become scoped IDs; cross-page
links use configuration. Empty conditional sections use hidden containers/inert templates to support
later approved data. Text/geometry follow the source; the reduced-motion drift stop is deliberate.

The merged owner lifecycle reuses one live instance across repeated script execution. A child-list
observer detects root/ancestor replacement and schedules one boot; teardown clears shared observers,
listeners, finite timers/frames, copied reveal/status/menu state and the exact prior body overflow.
Copied unavailable links and optional footer regulatory text are normalized. There is no polling or
continuous JavaScript animation loop. CSS/queries are scoped; shared header document/window listeners
are relevant and removed. GHL ancestor conditions for sticky positioning still need live verification.

## Current verification and reproduction

Current evidence is in `qa/verification.md` and aggregate `qa/results.json`. Bulk captures/logs and
plain/hostile host wrappers are ignored under `_build/`. Historical results do not pass this port.

```sh
node ghl/pages/better-world-impact/_build/build.js
node ghl/pages/better-world-impact/_build/static-checks.js
node ghl/pages/better-world-impact/_build/make-previews.js
python3 -m http.server 8123 --bind 127.0.0.1
# Another terminal, with Playwright/Chromium and Pillow:
node ghl/pages/better-world-impact/_build/qa.js http://127.0.0.1:8123
python3 ghl/pages/better-world-impact/_build/diff.py
node ghl/pages/better-world-impact/_build/shared-regression.js
node ghl/pages/better-world-impact/_build/regression.js http://127.0.0.1:8123
```

`--matrix-only` / `--checks-only` separate visual and functional runs; `--recapture=390x900xfalse`
selects a capture. Source React uses existing local vendor copies only in QA. Google Fonts are blocked
on both sides for matching fallback fonts. Screenshots canonicalize infinite decorative drift at t=0
with `animations:'disabled'`; actual normal/reduced animation settings are tested separately. If Node
cannot spawn Git, export the `b439054` shared generator baseline to a temporary file and pass that path
to `shared-regression.js`. `CHROMIUM_PATH` can override `/usr/bin/chromium`.

Published GHL, actual web-font delivery/layout, hosted URLs/SEO, approved evidence/case content and real
Contact/methodology/case destinations remain **NOT VERIFIED**. After the Main/shared PR is reviewed
and merged, complete the required Impact interaction correction, then the final regression stage.
