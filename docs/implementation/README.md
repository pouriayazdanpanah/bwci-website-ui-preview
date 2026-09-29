# Page porting workflow

This guide turns a finished Claude Design page in design/ into one pasteable GoHighLevel Website Builder Custom Code block. CLAUDE.md holds project-wide rules; pages/<slug>.md records source-specific requirements; ghl/pages/<slug>/README.md explains the delivered port and installation.

## Reading and execution order

1. Read CLAUDE.md, this guide, and the page brief. If no brief exists, inspect the source and create one using page-template.md.
2. Inspect the source page, imported components such as design/SiteHeader.dc.html, design/support.js and vendor files only to understand export behavior, and all referenced assets/fonts/helpers. Inventory sections, state, animations, events, routes, breakpoints, sticky/scroll logic, and source quirks. Capture source render and behavior where possible.
3. Preserve unrelated files. Branch from current main. Create ghl/pages/<slug>/ and keep the design export intact. Port to browser-ready HTML, root-scoped CSS, and isolated native JavaScript. Preserve difficult interactions.
4. Resolve hosted assets and cross-page routes in a top config. Deliver one complete Custom Code block; optional development tools under _build/ must not run in GHL.
5. Compare the port with the source: section order, content, fonts, spacing, imagery, geometry, menus, controls, hover/focus, animations, scroll capture/release, anchors, and mobile behavior. Check reduced motion and repeat execution.
6. Validate 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, and 2560 px; vary height/orientation where relevant. Check document scrollWidth versus clientWidth, console/network errors, and a host page with global element/Bootstrap-like rules and surrounding content. A local browser check is not a published GHL check.
7. Document differences and limits in the page README and brief. Commit page-scoped changes, push, open a PR to main, and stop for manual review/merge.

## Existing implementations

| Page | Source | Brief | GHL folder | Maintenance |
| --- | --- | --- | --- | --- |
| Main | design/Main.dc.html | pages/main.md | ghl/pages/main/ | Edit two pasteable variants directly. |
| Financial Engine | design/FinancialEngine.dc.html | pages/financial-engine.md | ghl/pages/financial-engine/ | Edit _build/src/, then regenerate both variants. |

Other .dc.html files are design sources, not proof that a GHL port exists. Create a page brief when work on one begins. The older ghl-ecosystem-standalone branch is not a page folder on current main.

## Git workflow

Run git switch main, git pull --ff-only origin main, and git switch -c feat/ghl-<slug>. Use a forced environment branch name only if necessary; keep one page per branch. Never branch from another page branch. Use clear page-scoped commits. Push and open a PR to main with source, output, assets, visual/behavioral/responsive QA, differences, and GHL limits. Do not merge. Documentation-only work uses its own branch.

Existing Financial Engine and Main work was merged through PRs #1–#4 from an environment-generated claude/... branch. This history explains the exception; the future rule is one page per fresh-main branch. GitHub Pages publishes design/ after a push to main. It does not install GHL Custom Code.
