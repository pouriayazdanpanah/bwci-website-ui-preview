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

The current October 2026 export has **16 production pages**, all with a GHL implementation, including the Christie profile delivered in this PR. No production page in this export remains awaiting a port. A new page added by a future design import needs a fresh brief and its own branch as described above.

Implementation, merge and publication are separate states. A generated block or merged PR does not establish a live GHL URL. Unconfirmed governance/profile routes stay configurable and default to "#" until the published destinations are verified. `design/Main v1 (archive).dc.html` is an archive, `Before After.dc.html` is a QA canvas, and the shared component files are not additional production pages.

## Completed ports

- Main: ghl/pages/main/README.md. Its hosted and inline files are edited directly.
- Financial Engine: ghl/pages/financial-engine/README.md. Its hosted and inline files are generated from _build/src/.
- Ecosystem: ghl/pages/ecosystem/README.md. Its hosted and inline files are generated from _build/src/. It supersedes the older, unmerged ghl-ecosystem-standalone branch.
- Platforms: ghl/pages/platforms/README.md. Its hosted and inline files are generated from _build/src/.
- SMEs & Projects: ghl/pages/smes-projects/README.md. Its hosted and inline files are generated from _build/src/.
- Investors & Partners: ghl/pages/investors-partners/README.md. Its hosted and inline files are generated from _build/src/.
- Governance: ghl/pages/governance/README.md. Its hosted and inline files are generated from _build/src/. GovNav and bwci-system.css parts C/E come from the shared site chrome (ghl/shared/site-chrome/), which the Board and Leadership ports can reuse.
- Governance Board: ghl/pages/governance-board/README.md. Its hosted and inline files are generated from _build/src/. PersonCard comes from the shared site chrome (people option), with the Leadership and profile pages in mind.
- Governance Leadership: ghl/pages/governance-leadership/README.md. Its hosted and inline files are generated from _build/src/. PersonCard comes from the shared site chrome (people option), as on the Board page.

- Dr Farhad Reyazat: ghl/pages/profile-farhad-reyazat/README.md. Hosted and inline outputs are generated from _build/src/. Reusable GovProfile markup/context/drag support is in ghl/shared/site-chrome/; one profile handles Board and Leadership entry.
- Alex Alegria-Seif: ghl/pages/profile-alexander-alegria-saif/README.md. Hosted and inline outputs are generated from _build/src/ using the existing shared profile renderer. The source filename/slug is Alexander Alegria Saif; displayed content follows bwci-people.js.

- Gabriella Karlova: ghl/pages/profile-gabriella-karlova/README.md. Hosted/inline profile outputs; no biography, two roles, default Board. Merged through PR #23.
- Professor Richard A. Werner: ghl/pages/profile-richard-werner/README.md. Hosted/inline profile outputs; four biography paragraphs, no role line, default Leadership. Merged through PR #24.

- Ewa Dudek: ghl/pages/profile-ewa-dudek/README.md. Hosted/inline profile outputs; Operational Manager role, no biography, default Leadership. Merged through PR #25.
- Agnes Gradzewicz: ghl/pages/profile-agnes-gradzewicz/README.md. Hosted/inline profile outputs; Chief Marketing Officer role, no biography, default Leadership. Merged through PR #26.
- Christie Osarenren: ghl/pages/profile-christie-osarenren/README.md. Hosted/inline outputs generated from _build/src/; Senior Market Strategy & Research Analyst role, no biography, default Leadership. Delivered in this PR from main `b954288`; published GHL NOT VERIFIED.

The completed-page README is the source of maintenance instructions; no duplicate brief is kept under docs/implementation/pages/. design/SiteHeader.dc.html, design/SiteFooter.dc.html, design/Breadcrumb.dc.html, design/GovNav.dc.html, design/GovProfile.dc.html and design/PersonCard.dc.html are shared source components. design/Before After.dc.html is a visual comparison/QA canvas, not a production website page.

## Git workflow

Run git switch main, git pull --ff-only origin main, and git switch -c feat/ghl-<slug>. Use a forced environment branch name only if necessary; keep one page per branch. Never branch from another page branch. Use clear page-scoped commits. Push and open a PR to main with source, output, assets, visual/behavioral/responsive QA, differences, and GHL limits. Do not merge. Documentation-only work uses its own branch.

Existing Financial Engine and Main work was merged through PRs #1–#4 from an environment-generated claude/... branch. This history explains the exception; the future rule is one page per fresh-main branch. GitHub Pages publishes design/ after a push to main. It does not install GHL Custom Code.
