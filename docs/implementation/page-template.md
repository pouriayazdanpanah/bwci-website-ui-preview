# PAGE_NAME — GHL implementation brief

Copy to docs/implementation/pages/<page-slug>.md for a page that has no completed GHL port, after inspecting its actual source. Replace every placeholder with verified facts and delete inapplicable items. When the port is completed and the same facts are captured in its GHL README, remove the pending brief.

## Files and destination

- Source: SOURCE_FILE (normally design/<name>.dc.html).
- Imported components/helpers: SOURCE_DEPENDENCIES (exact paths/import names and why used).
- Source assets/fonts: SOURCE_ASSETS (exact paths, roles, dimensions/aspect/transparency where relevant).
- Destination: DESTINATION_FOLDER (ghl/pages/<slug>/).
- Pasteable output: <slug>.ghl.html; optional inline variant only if useful.
- Unique root: ROOT_SELECTOR.
- Build inputs/command, if present: BUILD_INPUTS_AND_COMMAND; otherwise say files are maintained directly.
- GHL configuration: GHL_CONFIG (hosted URLs, routes, header/footer toggles and defaults).

## Source inspection record

List rendered sections in order, source HTML/CSS and text/x-dc or other script behavior, state/events, React or runtime helper use, imports, assets, all responsive breakpoints, sticky/scroll behavior, and SPECIAL_INTERACTIONS. Capture the original render where possible. Record quirks and whether to preserve or intentionally fix each. Do not invent dependencies or use screenshots alone when source code exists.

## Port contract

Deliver one browser-ready Custom Code block with configuration, root-scoped CSS under ROOT_SELECTOR, complete markup, and isolated native JavaScript. Preserve content, hierarchy, geometry, animations, transitions, hover/focus/active states, navigation, and responsive behavior. No Claude runtime, source React build, npm/compiler/local module, support.js, /vendor/, or unresolved source asset paths may be required at runtime. Guard re-execution and clean up. Explain any global listener/body style change and protect surrounding GHL content. Derive responsive geometry from shared variables. Reduced motion must leave content and controls visible.

## Acceptance checks

- Visual: compare source and port at representative phone/tablet/desktop sizes; inspect every section, artwork, fonts, spacing, graphics, and animation timing.
- Responsive: RESPONSIVE_NOTES; test 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, and 2560 px, plus varied heights/orientation where needed. Check overflow, clipping, overlap, menus, geometry, and sticky release.
- Interaction: SPECIAL_INTERACTIONS; test click, hover, focus, keyboard, wheel/trackpad-like deltas, touch, anchors, resize, and reduced motion as applicable. Scroll capture must release in both directions.
- Runtime/GHL: no exceptions, broken assets, source runtime imports, duplicate listeners/timers/markup, or global CSS leaks. Test in a hostile host with generic element/Bootstrap-like CSS and surrounding content where practical. Distinguish local QA from a published GHL check.
- Document exact differences, source quirks, assets/routes, and remaining limits in DESTINATION_FOLDER/README.md before PR; then remove this pending brief after checking that its requirements were carried over.

## Git and handoff

From current main, pull with --ff-only and create feat/ghl-<slug> (or document a forced branch name). Keep one page per branch. Commit clear page-scoped work, push, and open a PR to main covering source/output, visual/behavioral/responsive QA, assets, differences, and GHL limits. Stop; never auto merge.
