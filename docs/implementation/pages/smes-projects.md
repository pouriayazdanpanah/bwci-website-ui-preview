# SMEs & Projects — pending GHL page brief

Status: design source exists; no ghl/pages/smes-projects/ port on current main.

## Verified source and planned destination

- Source: design/SMEs Projects.dc.html. It imports design/SiteHeader.dc.html with current="smes" and CTA #engage.
- Export runtime: design/support.js and inline text/x-dc Component logic. It does not directly import the vendor React files. Final GHL output must use browser-ready JavaScript.
- Hero image: design/assets/sme-hero-flow.webp (source markup declares 1400×511). Fonts: Plus Jakarta Sans and JetBrains Mono; inspect inline SVG and CSS graphics.
- Planned destination: ghl/pages/smes-projects/; planned root #bwci-smes-projects. Put hosted hero URL, routes, and needed header/footer toggles in the top configuration.

## Sections and behavior to port

Source sections: Hero; Your Situation; The Process; Delivery Perimeters; Operating Principles; Initiate a Dialogue; footer. Source state selects a situation, delivery capability, process chapter, and operating-principle row. Selecting a situation also selects its matched capability. Situation cards are focusable and respond to Enter/Space as well as click. The five process chapters respond to hover, focus, and click. Delivery perimeter cards and operating-principle rows update active/expanded content. Preserve these relationships and the source's status language, not just default cards. The source reveals elements through IntersectionObserver and imports the sticky header/mobile drawer.

Source CSS has breakpoints around 767, 800, and 1023 px. Inspect the real layouts, especially process geometry, hero image crop, cards, and interactions at touch widths. Scope selectors/listeners to the widget and make repeated GHL execution safe.

## Acceptance checks

Compare all sections/states to the source. Check situation-to-capability mapping, all five process stages, perimeter choice, principle expansion, Enter/Space, hover/focus/click, mobile navigation, links, reduced motion, and reveal visibility. Test all 13 widths in CLAUDE.md, no clipping/overflow, varied heights where geometry matters, no broken hosted image, and hostile host isolation. Record differences and actual GHL publication status in ghl/pages/smes-projects/README.md.
