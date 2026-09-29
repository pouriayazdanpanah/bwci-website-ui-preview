# Financial Engine — implementation brief

## Source and output

- Source: design/FinancialEngine.dc.html, with SiteHeader imported via dc-import name="SiteHeader" current="engine" from design/SiteHeader.dc.html.
- Source runtime: design/support.js and design/vendor/react.js plus react-dom.js render the Claude export and text/x-dc state. GHL port uses native JavaScript; source runtime files are not GHL dependencies.
- Source hero: design/assets/2b37055061899aec512b2c880a24ac91.webp (1100×766, transparent). Port stores ghl/pages/financial-engine/assets/financial-engine-hero.webp. Fonts are Plus Jakarta Sans and JetBrains Mono via the same font links as Main.
- Destination: ghl/pages/financial-engine/; root #bwci-financial-engine.
- Edit _build/src/financial-engine.html, financial-engine.css, financial-engine.js, and financial-engine.config.json; run node ghl/pages/financial-engine/_build/build.js to generate financial-engine.ghl.html and financial-engine.inline.ghl.html. _build/ is development only.
- Top JSON config: financialEngineImage, showHeader, showFooter, links. Use a hosted hero URL and GHL routes for production; inline variant embeds the hero for testing/fallback.

## Behavior and geometry contract

Preserve hero, Operating Principles chapter selector, seven-stage Operating Model, capabilities selector, structure section, CTA, header, and footer. Principles and capabilities respond to hover, focus, and click. Desktop Operating Model uses wheel/key capture; its stage nodes, numbers, rings, and labels derive from one CSS orbit coordinate system. Below 1024 px the source uses a stage rail with previous/next buttons and dots. Preserve scroll entry, stage order, both-direction release, click-to-jump, and rearming without trapping unrelated GHL content.

Current port OPTIONS include a 64 px lock line, 80 px wheel threshold, 550 ms transition cooldown, 140 px release nudge, 450 ms rearm, desktop orbit from 1024 px, and desktop header from 1200 px. Root-scoped CSS, fe- classes, init guard, cleanup, and targeted window listeners protect host content. The temporary body overflow change is for the mobile drawer. Keep showHeader/showFooter working when GHL supplies global sections.

## Verified differences and QA

ghl/pages/financial-engine/README.md records source quirks and deliberate robustness fixes. Source interpolation spans acquire small mobile text through .sc-interp; the port mirrors this with .fe-i. Source typos remain. The port releases if external scrolling moves the lock out of view, normalizes non-pixel wheel deltas, fixes click-while-approaching stage reset, and removes dead source code/debug logs. Retain these unless a design behavior change is requested.

Rebuild and compare with source at all 13 standard widths and varied viewport heights. Check section fidelity, orbit alignment, stage transitions, wheel/keyboard handling, mobile rail, principle/capability states, both release directions, anchors, resizing/orientation, reduced motion, header/footer toggles, duplicate execution, console/network errors, and a hostile host page. Existing README reports pixel and behavior checks at the listed widths; repeat relevant checks after changes. A browser host simulation does not prove published GHL behavior.
