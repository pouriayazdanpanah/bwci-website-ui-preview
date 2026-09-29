# Main — implementation brief

## Source and output

- Source: design/Main.dc.html, with SiteHeader imported via dc-import name="SiteHeader" current="home" from design/SiteHeader.dc.html.
- Source runtime: design/support.js and design/vendor/react.js plus react-dom.js render the export. They are inspection references, not production dependencies. Source logic is in the page's text/x-dc script; the import supplies header behavior.
- Source image: design/assets/hero-globe.png (1448×1086, transparent globe). Source uses Plus Jakarta Sans and JetBrains Mono. Inspect inline SVGs and CSS decoration rather than assuming each section has an image.
- Destination: ghl/pages/main/; root #bwci-main-page.
- Existing outputs: main.ghl.html (hosted hero URL) and main.inline.ghl.html (embedded hero); reference image assets/bwci-hero-globe.webp. No _build/ exists for this page; keep both variants aligned when editing.
- Top JSON config: heroGlobeImage, showHeader, links. Set the hosted image and routes before production GHL publication. Current port has a configurable header and includes its footer; it has no showFooter setting.

## Behavior to preserve and inspect

Source sections: Hero; The Problem; What BWCI Is; What's Different; Financial Engine; Ecosystem; Capabilities/Platforms; Front Doors; Trust & Transparency; final conversation CTA; footer. The SiteHeader import provides sticky navigation, dropdown, and mobile drawer. Inspect the hero globe/horizon movement, section reveal effects, card hover/active states, routes, and anchor scrolling in source and port. Keep the GHL section IDs listed in ghl/pages/main/README.md stable because Financial Engine links to them.

The port uses root-scoped CSS, defensive element resets, bw- classes, and an isolated script with a data-bw-ready guard and listener teardown. Preserve source mobile composition and the design preview's narrow hero text fix. Check header/menu state and root-relative scrolling with GHL content above the widget. Respect reduced motion. The source contains an empty Insights section marker, and several current GHL config destinations are "#" placeholders; document actual routes rather than inventing pages.

## QA and source differences

Compare every section and interaction with design/Main.dc.html; test the 13 standard widths in CLAUDE.md, mobile menu, header, links, hero image, hover/focus, reduced motion, no horizontal overflow, repeat execution, and a hostile host page. Existing page README records Chromium smoke tests at 320, 390, 768, 1024, 1440, and 1920 px, but no pixel comparison with the source. Do not present that smoke test as complete fidelity validation. Update page README with new comparisons, deliberate differences, hosted asset/route setup, and any actual published GHL result.
