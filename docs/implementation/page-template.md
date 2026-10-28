# PAGE_NAME — GHL implementation brief

Copy to docs/implementation/pages/<page-slug>.md for a page that has no completed GHL port, after inspecting its actual source. Read [the workflow and shared contract](README.md) first. Replace every placeholder with verified facts and delete inapplicable items. When the port is completed and the same facts are captured in its GHL README, remove the pending brief. Resolve links relative to the copied brief when applicable.

## Files and destination

- Source: SOURCE_FILE (normally design/<name>.dc.html).
- Imported components/helpers: SOURCE_DEPENDENCIES (exact paths/import names and why used).
- Source assets/fonts: SOURCE_ASSETS (exact paths, roles, dimensions/aspect/transparency where relevant).
- Destination: DESTINATION_FOLDER (ghl/pages/<slug>/).
- Pasteable outputs: <slug>.ghl.html and <slug>.inline.ghl.html, following the existing hosted/inline convention.
- Unique root: ROOT_SELECTOR.
- Build inputs/command, if present: BUILD_INPUTS_AND_COMMAND; otherwise say files are maintained directly.
- GHL configuration: GHL_CONFIG (exact shared link/image Custom Value references, header/footer toggles and defaults).

## Shared configuration and build plan

- Shared chrome/components: SHARED_COMPONENTS (generator options, header/drawer/footer, breadcrumb and applicable governance/profile components; no per-page fork).
- Link mapping: LINK_MAPPING (config properties, exact existing field keys, preserved local anchors/query context and any new `bwci_url_<destination>` names).
- Image mapping: IMAGE_MAPPING (config paths, exact existing keys, source assets and new `bwci_img_<page>_<role>` names). Reuse shared logo/portrait keys and Main's existing `hero_image`; do not duplicate them.
- Proposed values for owner creation: PROPOSED_VALUES (name, expected reference, intended asset/destination and one-object-per-POST API bodies; separate proposed from account-confirmed).
- Generation/runtime: GENERATION_PLAN (extend shared mappings/resolver paths for new properties; serialize with `chrome.imageConfig(cfg)`; resolve images/links before consumers; keep delivered blocks self-contained). Main remains direct-edit in both outputs.
- Inline fallback: FALLBACK_PLAN (exact original embedded bytes under matching `imageFallbacks` paths; resolved usable URLs take priority in both variants; unavailable hosted values never request literal merge fields).
- Shared impact: AFFECTED_CONSUMERS (which builders/outputs need regeneration, whether Main needs manual synchronization and which checks cover them).

## Source inspection record

List rendered sections in order, source HTML/CSS and text/x-dc or other script behavior, state/events, React or runtime helper use, imports, assets, all responsive breakpoints, sticky/scroll behavior, and SPECIAL_INTERACTIONS. Capture the original render where possible. Record quirks and whether to preserve or intentionally fix each. Do not invent dependencies or use screenshots alone when source code exists.

## Port contract

Deliver one browser-ready Custom Code block with configuration, root-scoped CSS under ROOT_SELECTOR, complete markup, and isolated native JavaScript. Preserve content, hierarchy, geometry, animations, transitions, hover/focus/active states, navigation, and responsive behavior. No Claude runtime, source React build, npm/compiler/local module, support.js, /vendor/, or unresolved source asset paths may be required at runtime. Guard re-execution and clean up. Explain any global listener/body style change and protect surrounding GHL content. Derive responsive geometry from shared variables. Reduced motion must leave content and controls visible.

## Acceptance checks

- Visual: compare source and port at representative phone/tablet/desktop sizes; inspect every section, artwork, fonts, spacing, graphics, and animation timing.
- Responsive: RESPONSIVE_NOTES; test 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, and 2560 px, plus varied heights/orientation where needed. Check overflow, clipping, overlap, menus, geometry, and sticky release.
- Interaction: SPECIAL_INTERACTIONS; test click, hover, focus, keyboard, wheel/trackpad-like deltas, touch, anchors, resize, and reduced motion as applicable. Scroll capture must release in both directions.
- Runtime/GHL: no exceptions, broken assets, source runtime imports, duplicate listeners/timers/markup, or global CSS leaks. Test in a hostile host with generic element/Bootstrap-like CSS and surrounding content where practical. Distinguish local QA from a published GHL check.
- Central configuration: check resolved, literal-unresolved, empty and `#` image/link values in both variants; correct URL priority, exact inline fallback bytes, unchanged crop/fit, no hosted request for unresolved fields, query/fragment preservation and copied-root configuration changes. Extend shared mapping/QA coverage for this page; regenerate affected consumers.
- Document exact differences, source quirks, assets/routes, and remaining limits in DESTINATION_FOLDER/README.md before PR; then remove this pending brief after checking that its requirements were carried over.

## Git and handoff

From current main, pull with --ff-only and create feat/ghl-<slug> (or document a forced branch name). Keep one page per branch. Commit clear page-scoped work, push, and open a PR to main covering source/output, visual/behavioral/responsive QA, assets, differences, and GHL limits. Stop; never auto merge.

Update the workflow inventory, page README and affected shared records with the final change, proposed
keys, actual checks and remaining work. Track implemented, PR-open, confirmed-merged and live-GHL-verified
states separately. Do not treat supplied snapshots or old test reports as current account verification.
