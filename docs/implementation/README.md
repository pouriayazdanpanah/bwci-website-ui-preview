# Page porting workflow

This guide turns a finished Claude Design page in design/ into one pasteable GoHighLevel Website Builder Custom Code block. CLAUDE.md holds project-wide rules. pages/<slug>.md is a brief for a page not yet ported; ghl/pages/<slug>/README.md is the durable record for a completed port.

## Reading and execution order

1. Read CLAUDE.md and this guide. For a new page, read its pending brief; if absent, inspect the source and create one using page-template.md. For a completed port, read its GHL README.
2. Inspect the source page, imported components such as design/SiteHeader.dc.html, design/support.js and vendor files only to understand export behavior, and all referenced assets/fonts/helpers. Inventory sections, state, animations, events, routes, breakpoints, sticky/scroll logic, and source quirks. Capture source render and behavior where possible.
3. Preserve unrelated files. Branch from current main. Create ghl/pages/<slug>/ and keep the design export intact. Port to browser-ready HTML, root-scoped CSS, and isolated native JavaScript. Preserve difficult interactions.
4. Resolve hosted assets and cross-page routes in a top config. Deliver one complete Custom Code block; optional development tools under _build/ must not run in GHL.
5. Compare the port with the source: section order, content, fonts, spacing, imagery, geometry, menus, controls, hover/focus, animations, scroll capture/release, anchors, and mobile behavior. Check reduced motion and repeat execution.
6. Validate 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, and 2560 px; vary height/orientation where relevant. Check document scrollWidth versus clientWidth, console/network errors, and a host page with global element/Bootstrap-like rules and surrounding content. A local browser check is not a published GHL check.
7. Document differences and limits in the page README; after confirming the brief's requirements are covered, remove the pending brief. Commit page-scoped changes, push, open a PR to main, and stop for manual review/merge.

## Pages awaiting a GHL port

None at present: every production page in design/ has a GHL port. For a new page, create its brief in pages/<slug>.md from page-template.md.

## Completed ports

- Main: ghl/pages/main/README.md. Its hosted and inline files are edited directly.
- Financial Engine: ghl/pages/financial-engine/README.md. Its hosted and inline files are generated from _build/src/.
- Ecosystem: ghl/pages/ecosystem/README.md. Its hosted and inline files are generated from _build/src/. It supersedes the older, unmerged ghl-ecosystem-standalone branch.
- Platforms: ghl/pages/platforms/README.md. Its hosted and inline files are generated from _build/src/.
- SMEs & Projects: ghl/pages/smes-projects/README.md. Its hosted and inline files are generated from _build/src/.
- Investors & Partners: ghl/pages/investors-partners/README.md. Its hosted and inline files are generated from _build/src/.

The completed-page README is the source of maintenance instructions; no duplicate brief is kept under docs/implementation/pages/. design/SiteHeader.dc.html is a shared source component. design/Before After.dc.html is a visual comparison/QA canvas, not a production website page.

## Git workflow

Run git switch main, git pull --ff-only origin main, and git switch -c feat/ghl-<slug>. Use a forced environment branch name only if necessary; keep one page per branch. Never branch from another page branch. Use clear page-scoped commits. Push and open a PR to main with source, output, assets, visual/behavioral/responsive QA, differences, and GHL limits. Do not merge. Documentation-only work uses its own branch.

Existing Financial Engine and Main work was merged through PRs #1–#4 from an environment-generated claude/... branch. This history explains the exception; the future rule is one page per fresh-main branch. GitHub Pages publishes design/ after a push to main. It does not install GHL Custom Code.
