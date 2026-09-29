# Platforms — pending GHL page brief

Status: design source exists; no ghl/pages/platforms/ port on current main.

## Verified source and planned destination

- Source: design/Platforms.dc.html. It imports design/SiteHeader.dc.html with current="platforms" and CTA #engage.
- Export runtime: design/support.js and inline text/x-dc Component logic; no direct vendor React scripts in this page. Final GHL block must be browser-ready.
- Hero image: design/assets/plat-hero-rails.png (source markup declares 2020×778). Fonts: Plus Jakarta Sans and JetBrains Mono. Inspect inline SVGs and diagram artwork.
- Planned destination: ghl/pages/platforms/; planned root #bwci-platforms. Expose hosted image URL and GHL routes/configuration in one place.

## Sections and behavior to port

Source sections: Hero; Two-Register Architecture; Filters & Platform Directory; Governance & Regulatory Architecture; Ecosystem Connection; Audience Pathways; Start a Conversation; footer. The two registers link into a directory of six capabilities. Directory state filters by maturity and relationship, shows counts and active filter chips, supports reset and empty state, and switches between card and list views. List rows expand; register jumps highlight a capability and scroll to the directory. Preserve the status/relationship distinctions and capability copy. Source state uses query parameters maturity and relationship on mount and history.replaceState when filters change; in GHL, preserve unrelated host query parameters and do not replace the containing page's URL unintentionally. Document any intentional route behavior change.

The source has IntersectionObserver reveals and breakpoints around 480, 767, 900, 1023, and 1180 px. Inspect exact grid/list layouts, filter behavior, URL state, anchored navigation, hover/focus, and header/mobile drawer before coding. Scope all DOM queries and listeners to the page root where possible.

## Acceptance checks

Compare all sections and directory states with source. Test every maturity/relationship combination, counts, chips/removal/reset, empty state, grid/list, row expansion, register jump/back action, URL initial state and subsequent updates, header and routes. Validate all 13 widths in CLAUDE.md, varied heights, reduced motion, no overflow/missing image, duplicate initialization, and hostile host isolation. Document deliberate differences and actual GHL publication status in ghl/pages/platforms/README.md.
