# Investors & Partners — pending GHL page brief

Status: design source exists; no ghl/pages/investors-partners/ port on current main.

## Verified source and planned destination

- Source: design/Investors Partners.dc.html. It imports design/SiteHeader.dc.html with current="investors" and CTA #engage.
- Export runtime: design/support.js and inline text/x-dc Component logic. The page does not directly import the vendor React files. Translate export state to browser JavaScript without a Claude runtime dependency.
- Hero image: design/assets/inv-hero-flow.png (source markup declares 2017?780; inspect composition before porting). Fonts: Plus Jakarta Sans and JetBrains Mono. Inspect inline SVGs and CSS graphics.
- Planned destination: ghl/pages/investors-partners/; planned root #bwci-investors-partners. Provide hosted image URL, cross-page routes, and relevant header/footer configuration.

## Sections and behavior to port

Source sections in order: Hero; The Proposition; Participation; Methodology; Delivery Perimeters; The Ecosystem; Your Route; Initiate a Dialogue; footer. The Proposition has a three-state selector. Methodology has a five-step arc/rail, direct node selection, and previous/next controls. Your Route has four selectable audience tabs and an associated detail panel. Preserve section reveal animation (IntersectionObserver), card/CTA links, sticky header and drawer, and the source's status labels. The source sets method node positions from a shared angle list; keep arc, nodes, and labels aligned when adapting geometry.

Source CSS uses breakpoints around 480, 767, 1023, and 1180 px. Inspect exact layouts for mobile/tablet and source navigation before coding. Some source links point to other .dc.html pages and a Main #insights anchor; map cross-page links to GHL routes and verify targets rather than carrying source URLs or assuming a finished Insights section.

## Acceptance checks

Compare section order, content, hero composition, all three selectors, five methodology stages, arc/rail geometry, CTA routes, header, and footer against the source. Validate all 13 widths in CLAUDE.md, varied heights for the method geometry, focus/keyboard/hover/click, reduced motion, no horizontal overflow, no source-relative assets, and repeat initialization inside a hostile GHL-like host. Document deliberate differences and actual GHL publication status in the new page README.
