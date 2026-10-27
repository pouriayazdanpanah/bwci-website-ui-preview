# Page porting workflow

This guide turns a finished Claude Design page in design/ into one pasteable GoHighLevel Website Builder Custom Code block. CLAUDE.md holds project-wide rules. pages/<slug>.md is a brief for a page not yet ported; ghl/pages/<slug>/README.md is the durable record for a completed port.

## Current status — October 27, 2026

All **23 target pages** have merged implementations. Main/shared synchronization merged in PR #35
(`3d93dcf`); the required Impact interaction correction merged in PR #36 (`7ddc04f`). Stage 9 started
directly from that clean, refreshed main on `test/ghl-final-regression` and completed the final local
regression: 458 source/inline/hosted viewport cases, all 458 native variant pairs pixel-exact, current
page interactions and shared/lifecycle checks passing. A confirmed Main saved-image fit correction
is included in both direct-edit outputs; all other production outputs, design files, assets and
shared production code are preserved. Evidence: [final report](../../ghl/qa/final/verification.md)
and [results](../../ghl/qa/final/results.json). This stage merged in PR #37 (`a41c1ae`).

The follow-up centralized-navigation migration starts directly from that fresh merged main on
`feat/ghl-centralized-custom-values`. Both variants of every page now use the exact 43 existing
GHL Custom Value keys supplied by the owner. All 43 supplied values are `#`; no destination is
invented or account setting changed. Page-section links reuse base values and preserve safe local
anchors and profile query context. CSS, content, media and unrelated settings are unchanged.
Evidence and all page/property mappings: [centralized links](../../ghl/shared/site-links/README.md).
This follow-up merged in PR #38 (`52b3cc5`). Actual GHL substitution inside JSON and cache propagation
remain **NOT VERIFIED** until checked on an installed page.

The image Custom Values follow-up starts from that merged main on `feat/ghl-image-custom-values`.
It connects 73 image settings across all 23 pages / 46 outputs to 20 shared image references. The
owner's 13 supplied keys and the existing Main `hero_image` are reused; six additional hero key names
and API request bodies are provided for owner creation. Both variants honor resolved image URLs;
inline outputs retain exact original bytes under optional `imageFallbacks`. Frames/crops, CSS, HTML,
navigation and source artwork remain unchanged. See [image keys and installation](../../ghl/shared/site-images/README.md)
and [current verification](../../ghl/shared/site-images/qa/verification.md). This image follow-up is
subject to manual PR review/merge; no GHL values are created and no pages are published.

Implementation and local regression are complete; **live GHL installation/publication is NOT
VERIFIED**. The next separate stage is configuring confirmed URLs/hosted assets/approved content,
pasting the blocks into GHL and checking actual font delivery, wrappers and published pages.

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
nineteenth implementation, merged in PR #30 (`65a5a44`). All 18 earlier delivered blocks were preserved.

Stage 4 refreshed that merged main from a clean tree and created `feat/ghl-corporate-ir-shareholders`
directly from `65a5a44`. Shareholders is the twentieth implementation, merged in PR #31 (`53f0457`).
All 19 earlier delivered blocks and the shared generators were preserved.

Stage 5 refreshed that merged main from a clean tree and created `feat/ghl-corporate-ir-regulatory`
directly from `53f0457`. Regulatory is the twenty-first implementation, merged in PR #32 (`f1324c6`).
All 20 earlier delivered blocks and shared generators were preserved.

Stage 6 refreshed that merged main from a clean tree and created `feat/ghl-corporate-ir-legal-notices`
directly from `f1324c6`. Legal Notices is the twenty-second implementation, merged in PR #33 (`b439054`).
All 21 earlier delivered blocks, design files and shared generators were preserved.

Stage 7 refreshed that merged main from a clean tree and created `feat/ghl-better-world-impact`
directly from `b439054`. Better World & Impact is the twenty-third implementation, merged in
PR #34 (`5b7fdfe`). That PR preserved all 22 earlier blocks and design/shared source files.

Stage 8 refreshed the confirmed merged main from a clean tree and created
`feat/ghl-main-shared-sync` directly from `5b7fdfe`. Both Main variants receive the confirmed two-rule
CTA background/dot update. All 23 pages receive current shared navigation/runtime: 22 builds regenerated
and Main updated directly. The original 16 configs add independent `betterWorldImpact` while retaining
their exact legacy `impact` values. All other original config values, images and page content remain
unchanged. Evidence: `ghl/shared/site-chrome/qa/sync/verification.md`. Stage 8 merged in PR #35
(`3d93dcf`); it does not replace the final full-page regression stage.

The corrective Impact interaction stage refreshed confirmed merged main from a clean tree and created
`feat/ghl-better-world-impact-interaction` directly from `3d93dcf`. The six-stage selection, previous/next,
progress and responsive details are implemented and locally checked in both variants. Current evidence:
`ghl/pages/better-world-impact/qa/verification.md` (56 interaction scenarios, eight page/config checks,
15 source-comparison widths). This page-specific correction merged in PR #36 (`7ddc04f`). All design
files, assets, shared production code and the other 22 page outputs were preserved.

Stage 9 refreshed that confirmed merged main from a clean tree, then created
`test/ghl-final-regression` directly from `7ddc04f`. Current all-page evidence is recorded in
`ghl/qa/final/verification.md` and each page README. The final local regression is complete, including
the Main fit correction; it merged in PR #37 (`a41c1ae`). No GHL publication is implied.

| Design source / change | GHL destination / status | Next review stage |
|---|---|---|
| `Corporate IR.dc.html`, empty hash | `corporate-ir` — merged in PR #28; local QA in its README; live GHL NOT VERIFIED | 1 merged |
| Same source, `#company-information` | `corporate-ir-company-information` — merged in PR #29; local QA in its README; live GHL NOT VERIFIED | 2 merged |
| Same source, `#reports-documents` | `corporate-ir-reports-documents` — merged in PR #30; local QA in its README; live GHL NOT VERIFIED | 3 merged |
| Same source, `#shareholders` | `corporate-ir-shareholders` — merged in PR #31; current QA in its README; live GHL NOT VERIFIED | 4 merged |
| Same source, `#regulatory` | `corporate-ir-regulatory` — merged in PR #32; current QA in its README; live GHL NOT VERIFIED | 5 merged |
| Same source, `#legal-notices` | `corporate-ir-legal-notices` — merged in PR #33; current QA in its README; live GHL NOT VERIFIED | 6 merged |
| `Better World Impact.dc.html` + supplied `assets/impact-hero-ribbons.png` | `better-world-impact` — initial port merged in PR #34; required six-stage engine correction merged in PR #36; hero, approach, methodology, evidence/cases and CTA delivered | 7 and correction merged; 9 local PASS |
| `Main.dc.html` CTA background/dot-field changes | Both direct-edit Main variants synchronized; no build folder added; 16 local source/port viewport cases and 32 pixel-exact image pairs | 8 merged, PR #35 |
| Header/Footer new independent Impact link | All 23 blocks now consume `betterWorldImpact` (`#` pending verified URL); all original `impact` values preserved as inactive compatibility settings | 8 merged, PR #35 |
| Breadcrumb new Impact trail and labelled Corporate / IR subpage trail | All seven new consumers preserve their correct trails; older/profile trails unchanged by synchronization | Per-page work merged; 8 verification recorded |
| Shared config/output migration | All 23 blocks synchronized; 16 older configs migrated without retargeting legacy anchors; 22 builds reproducible. Shared link/option/footer state and root/ancestor lifecycle checks pass | 8 merged, PR #35 |
| Required Impact interaction | Six source stages, details, illustrative examples, wrap controls, progress, keyboard/touch/focus and responsive panels implemented. Persistent Impact markers and empty evidence/cases preserved; 56 current interaction scenarios pass | Corrective PR #36 merged; 9 local PASS |
| Affected existing-page regression | Full source/port, responsive and page-interaction regression completed for all 23 pages; 458 viewport cases and shared/lifecycle suites. Small Main photo-fit correction included | 9 merged, PR #37 |
| Centralized GHL navigation | All 23 pages / 46 outputs use 43 exact existing Custom Values; shared menu, footer, CTA, profile and section links mapped; supplied destination values remain `#` | Follow-up PR review; actual GHL integration NOT VERIFIED |

Confirmed additional destination gap: the new Corporate / IR source links announcements to
`Main.dc.html#insights`, but neither current Main source markup nor either Main output contains an
Insights section. Overview's `links.announcements` remains explicitly unresolved (`#`). Do not invent
an announcements page or silently send it to a different section. Other linked-but-absent destinations
(Who We Are, Private Investors, Contact, Verify, Legal policies) remain configurable deployment/content
dependencies, not newly invented page implementations.

The Shareholders copied link/footer state and Regulatory copied native-option labels are now handled
in shared runtime and older consumers as appropriate. Stage 8 checks cover all 23 pages in both
variants at 390/1440px inside a hostile host, late markup, explicit destroy/reboot, root/ancestor
replacement, config changes, body-overflow restoration and current Main CTA styling. Stage 8 itself
was limited to synchronization; stage 9 now records the broader current regression separately.

All six Corporate / IR views, Impact and its required interaction correction are merged. All 23
target pages have separate implementations. Main/shared PR #35 is merged, and the final local
regression has completed from fresh main after PR #36. Its review/merge and actual GHL publication
remain separate steps. No automatic merges.

Impact's actual rendered source engine is a static `figure` with six list items and three fixed
Impact considered markers; its interactive definitions/styles are unused. The original user request
nevertheless explicitly says: "Preserve the six-stage interaction, stage selection, previous/next
controls, progress state, and responsive behavior." The static-only port in PR #34 missed this
requirement. The corrective page change now connects source step data and the retained detail styles
using the established Main/Financial Engine pattern. This intentional difference from static source is
documented and tested; the completed brief is retired into the page README. Evidence/cases remain
empty by default and the supplied artwork/source facts are preserved. The correction merged in
PR #36, and its current behavior passed the final regression stage.

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

- Corporate / IR Reports & Documents: ghl/pages/corporate-ir-reports-documents/README.md. Only `#reports-documents` content; hosted/inline blocks, labelled breadcrumb, independently configured page/file URLs, native filters/search/sort/count/reset and empty/launch states. Source metadata stays unconfirmed and download URLs default to `#`. Merged through PR #30; published GHL NOT VERIFIED.

- Corporate / IR Shareholders: ghl/pages/corporate-ir-shareholders/README.md. Only `#shareholders` content; hosted/inline blocks, labelled breadcrumb, four share facts, meetings/results and enquiry card. Source placeholders remain unconfirmed; notice/results/email URLs default to `#`. Copied link/footer state is normalized on replacement. Merged through PR #31; published GHL NOT VERIFIED.

- Corporate / IR Regulatory: ghl/pages/corporate-ir-regulatory/README.md. Only `#regulatory` content; hosted/inline blocks, labelled breadcrumb, regulatory-perimeter notice, authorised-entity/proposed-institution tables and review flags. Source FRN/permission/relationship placeholders remain unconfirmed; exact register-entry URL defaults to `#`. Long approval badges wrap within narrow containers, and copied native-option labels normalize. Merged through PR #32; published GHL NOT VERIFIED.

- Corporate / IR Legal Notices: ghl/pages/corporate-ir-legal-notices/README.md. Only `#legal-notices` content; hosted/inline blocks, labelled breadcrumb, seven notice rows, source summaries/date placeholders and two owner-review notes. Each policy has a separate configurable URL, default `#`; policy content is not invented. Reuses copied link/footer/option normalization. Merged through PR #33; published GHL NOT VERIFIED.

- Better World & Impact: ghl/pages/better-world-impact/README.md. Supplied PNG hero, three approach columns, accessible interactive six-stage engine, methodology notice, empty-by-default approved evidence/case templates and responsive final CTA. Hosted and embedded images are generated from `_build/src/`; reduced motion stops decorative artwork drift. Initial port merged in PR #34; required engine interaction merged in PR #36. Current local regression passed. Published GHL NOT VERIFIED.

The completed-page README is the source of maintenance instructions; no duplicate brief is kept under docs/implementation/pages/. design/SiteHeader.dc.html, design/SiteFooter.dc.html, design/Breadcrumb.dc.html, design/GovNav.dc.html, design/GovProfile.dc.html and design/PersonCard.dc.html are shared source components. design/Before After.dc.html is a visual comparison/QA canvas, not a production website page.

## Git workflow

Run git switch main, git pull --ff-only origin main, and git switch -c feat/ghl-<slug>. Use a forced environment branch name only if necessary; keep one page per branch. Never branch from another page branch. Use clear page-scoped commits. Push and open a PR to main with source, output, assets, visual/behavioral/responsive QA, differences, and GHL limits. Do not merge. Documentation-only work uses its own branch.

Existing Financial Engine and Main work was merged through PRs #1–#4 from an environment-generated claude/... branch. This history explains the exception; the future rule is one page per fresh-main branch. GitHub Pages publishes design/ after a push to main. It does not install GHL Custom Code.
