# Ecosystem — pending GHL page brief

Status: no ghl/pages/ecosystem/ port on current main. An older standalone Ecosystem widget exists on the separate ghl-ecosystem-standalone branch; inspect it as prior work before starting a fresh page branch, but validate it against the current design export and current GHL conventions.

## Verified source and planned destination

- Source: design/Ecosystem.dc.html. It imports design/SiteHeader.dc.html with current="ecosystem" and CTA #engage.
- Export runtime: design/support.js and the page's text/x-dc Component logic. The HTML does not import design/vendor/react.js or react-dom.js directly; the source logic does use React.createRef through the export runtime. None of this may be a dependency of the final GHL block.
- Source image: design/assets/eco-hero-waves.webp in the hero. Source font families: Plus Jakarta Sans and JetBrains Mono. Inspect inline SVGs, CSS diagrams, and gradients in the source.
- Planned destination: ghl/pages/ecosystem/; planned unique root #bwci-ecosystem. Expose hero URL, cross-page routes, header/footer toggles where appropriate, and the loop's default lens and interval in one GHL configuration area.

## Sections and behavior to port

Source sections in order: Hero; Network Architecture; Ecosystem Loop; Connection Mechanics; Participants; Flows; Comparison; Engagement; footer. The architecture has three selectable lenses/dimensions, layer controls, and a visual network. The loop has five nodes with full/SME/investor/partner lenses, autoplay, pause on manual selection, play control, progress dots, desktop/mobile layouts, and a changing caption. Source props defaultLens and intervalSec control its initial lens and interval (default 4 seconds). Participants, mechanics, and flows also have selectable state; keep their panel/diagram/caption changes, not just their default screenshots. Preserve comparison visuals, header drawer, links, and section reveals.

The source uses ResizeObserver for loop width, IntersectionObserver for loop visibility and reveals, and setInterval for autoplay. Scope observers to this root, avoid duplicate timers after GHL rerender, and keep reduced-motion state readable and operable. The source has breakpoints around 767, 1023, and 1180 px; inspect the exact rules and responsive geometry before porting. Keep network labels, nodes, and connectors aligned from shared dimensions rather than isolated offsets.

## Acceptance checks

Compare all sections and states with the source at the 13 widths in CLAUDE.md and varied heights. Exercise every lens, layer, mechanism, participant, and flow selection; autoplay/pause/replay; hidden-tab or offscreen behavior; mobile menu; hover/focus/keyboard; links; reduced motion; and repeat initialization. Check no horizontal overflow or broken hero image in a hostile GHL-like host. Record deliberate differences and actual GHL publication status in ghl/pages/ecosystem/README.md when implemented.
