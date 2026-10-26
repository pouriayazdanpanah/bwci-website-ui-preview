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

## Verified design-to-implementation inventory (October 26, 2026)

Inspected a clean working tree, all page directories and both output variants, `CLAUDE.md`, this guide,
the page template, shared chrome and the Governance, Board and Leadership implementations. No repository
or nested `AGENTS.md` exists. Refreshed `main` with `git pull --ff-only origin main`: `daa5e0d` →
`812f136` ("Import Claude Design site export"). Implementation branch: `feat/ghl-corporate-ir`, based
directly on that refreshed main. The new export adds two source pages; it does not invalidate the
**16 existing ports**, including all seven individual profiles. Corporate / IR's six views require
six independent production blocks, so the verified target inventory is **23 GHL pages**.

Stage 2 resumes after Overview PR #28 was confirmed merged (`1e34f27`). A clean working tree was
refreshed with `git pull --ff-only origin main`, then branched as
`feat/ghl-corporate-ir-company-information` directly from that main. The 16 original ports and merged
Overview are preserved. Company Information was subsequently merged in PR #29 (`224a81e`).

Stage 3 refreshed that merged main from a clean tree, then created
`feat/ghl-corporate-ir-reports-documents` directly from `224a81e`. Reports & Documents is the
nineteenth implementation, pending its own PR review. All 18 existing delivered blocks are preserved.

| Design source / change | GHL destination / status | Next review stage |
|---|---|---|
| `Corporate IR.dc.html`, empty hash | `corporate-ir` — merged in PR #28; local QA in its README; live GHL NOT VERIFIED | 1 merged |
| Same source, `#company-information` | `corporate-ir-company-information` — merged in PR #29; local QA in its README; live GHL NOT VERIFIED | 2 merged |
| Same source, `#reports-documents` | `corporate-ir-reports-documents` — implemented; configurable source-placeholder records/URLs, type/year filters, title/type search, clear, count, sort and empty/launch states; current QA in its README; PR review pending, live GHL NOT VERIFIED | 3 (this change only) |
| Same source, `#shareholders` | `corporate-ir-shareholders` — pending; share facts, meetings/results and enquiries | 4 |
| Same source, `#regulatory` | `corporate-ir-regulatory` — pending; perimeter, regulated entities, proposed institutions | 5 |
| Same source, `#legal-notices` | `corporate-ir-legal-notices` — pending; source policy list and unavailable destinations | 6 |
| `Better World Impact.dc.html` + supplied `assets/impact-hero-ribbons.png` | Better World & Impact — pending; hero, approach, six-stage financial-engine interaction, methodology, conditional evidence/cases, final CTA | 7 |
| `Main.dc.html` CTA background/dot-field changes | Both direct-edit Main variants — pending; preserve their workflow | 8 |
| Header/Footer new independent Impact link | Minimal generator mapping added in this stage (`betterWorldImpact`); old homepage `impact` semantics preserved; current Overview consumes it | Preliminary dependency completed; broad synchronization still pending |
| Breadcrumb new Impact trail and labelled Corporate / IR subpage trail | Overview `ir` consumed; Company Information added opt-in `label`; Reports reuses it for Home → Corporate/IR → Reports & documents without another shared-generator change. Remaining subpages and Impact consumer/QA pending | Per-page stage; remaining sync in 8 |
| Shared config/output migration | Existing **16** pages still carry their prior header/footer. Update each config, regenerate the 15 build-based ports and synchronize Main manually, preserving existing configured homepage anchors | 8, separately scoped synchronization |
| Affected existing-page regression | Full shared navigation/lifecycle/visual regression after output synchronization — pending; Overview's shared changes do not rewrite existing blocks | 9 |

Confirmed additional destination gap: the new Corporate / IR source links announcements to
`Main.dc.html#insights`, but neither current Main source markup nor either Main output contains an
Insights section. Overview's `links.announcements` remains explicitly unresolved (`#`). Do not invent
an announcements page or silently send it to a different section. Other linked-but-absent destinations
(Who We Are, Private Investors, Contact, Verify, Legal policies) remain configurable deployment/content
dependencies, not newly invented page implementations.

Completing Overview, Company Information and Reports does **not** complete the Corporate / IR family. Resume
Shareholders only after Reports & Documents' merge is confirmed, from a fresh latest-main
branch. No automatic merges.

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
- Christie Osarenren: ghl/pages/profile-christie-osarenren/README.md. Hosted/inline outputs generated from _build/src/; Senior Market Strategy & Research Analyst role, no biography, default Leadership. Merged through PR #27; published GHL NOT VERIFIED.

- Corporate / IR Overview: ghl/pages/corporate-ir/README.md. Only the empty-hash overview from `design/Corporate IR.dc.html`; independent page URLs for the subpages. Hosted/inline outputs generated from `_build/src/`; source placeholders and document modes preserved. Merged through PR #28; published GHL NOT VERIFIED.

- Corporate / IR Company Information: ghl/pages/corporate-ir-company-information/README.md. Only `#company-information` content from the shared design source. Hosted/inline blocks, labelled breadcrumb, statutory facts/name history, review flags and group tree/empty modes. The long approval notice wraps on narrow phones instead of being clipped as in the source. Merged through PR #29; published GHL NOT VERIFIED.

- Corporate / IR Reports & Documents: ghl/pages/corporate-ir-reports-documents/README.md. Only `#reports-documents` content; hosted/inline blocks, labelled breadcrumb, independently configured page/file URLs, native filters/search/sort/count/reset and empty/launch states. Source metadata stays unconfirmed and download URLs default to `#`. PR review pending; published GHL NOT VERIFIED.

The completed-page README is the source of maintenance instructions; no duplicate brief is kept under docs/implementation/pages/. design/SiteHeader.dc.html, design/SiteFooter.dc.html, design/Breadcrumb.dc.html, design/GovNav.dc.html, design/GovProfile.dc.html and design/PersonCard.dc.html are shared source components. design/Before After.dc.html is a visual comparison/QA canvas, not a production website page.

## Git workflow

Run git switch main, git pull --ff-only origin main, and git switch -c feat/ghl-<slug>. Use a forced environment branch name only if necessary; keep one page per branch. Never branch from another page branch. Use clear page-scoped commits. Push and open a PR to main with source, output, assets, visual/behavioral/responsive QA, differences, and GHL limits. Do not merge. Documentation-only work uses its own branch.

Existing Financial Engine and Main work was merged through PRs #1–#4 from an environment-generated claude/... branch. This history explains the exception; the future rule is one page per fresh-main branch. GitHub Pages publishes design/ after a push to main. It does not install GHL Custom Code.
