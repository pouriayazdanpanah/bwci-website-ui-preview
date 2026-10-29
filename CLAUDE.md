# BWCI GHL page implementation rules

Read this file and [the implementation workflow](docs/implementation/README.md) before writing code. For a page without a GHL port, read its brief in docs/implementation/pages/; if missing, inspect the source and create one from [the page template](docs/implementation/page-template.md). For a completed port, read its ghl/pages/<slug>/README.md. Also read the shared [site chrome](ghl/shared/site-chrome/README.md), [link values](ghl/shared/site-links/README.md), and [image values](ghl/shared/site-images/README.md); their current contracts supersede historical route/image defaults in older page records.

## Shared Claude and Codex memory

This file is Claude's entry point and the common project rulebook. Codex enters through
[AGENTS.md](AGENTS.md), which directs it to these same rules and records. Both tools must use the
workflow's [resume and handoff checklist](docs/implementation/README.md#claude-and-codex-resume-and-handoff).
The workflow's current status, page READMEs and shared contracts are the durable state; neither tool's
private memory or chat history is required. Keep mutable status in those common records instead of
creating separate Claude/Codex copies. Before continuing, verify the checkout and PR state against
the recorded handoff; after work, leave enough repository evidence for the other tool to resume.

## Purpose and boundaries

- design/ contains the Claude Design export and GitHub Pages preview. Use it as the visual and behavioral source. Do not edit it during a GHL port unless the user asks for a design change.
- ghl/pages/<slug>/ contains production ports for GoHighLevel Website Builder → Custom Code. Keep each page separate. The sibling bwci-website repository is a different workspace.
- scripts/import_claude_zip.py updates design/ from ZIP. .github/workflows/pages.yml publishes only design/ on main. A GHL PR does not update the live preview.

## Required page sequence

1. Read the project rules and the relevant pending-page brief or existing implementation README.
2. Inspect the actual design/<Page>.dc.html markup, CSS, text/x-dc logic, imported components, support.js, assets, fonts, events, state, animations, scrolling, sticky behavior, and responsive rules. Render the source where possible. Do not infer dependencies from another page.
3. Inventory all sections and interactions before coding. Treat the work as a runtime port: preserve content, hierarchy, layout, typography, images, SVGs, decorative graphics, transitions, hover/active/focus states, navigation, animation timing, scroll behavior, and mobile behavior. Investigate complex sections instead of replacing them with generic content.
4. Create/update ghl/pages/<slug>/. Deliver a complete block pasteable into one GHL Custom Code element: normally a top JSON config, needed font links, scoped style, unique root markup, and isolated script. The delivered block must run without a build step.
5. Use browser ready HTML, scoped CSS, and native JavaScript. Remove Claude Design/Artifact runtime and source React dependencies unless a genuine browser runtime need is established and documented. No npm, Vite, Webpack, JSX/TypeScript compilation, local modules, support.js, /vendor/, or source relative /assets/ paths may be required by the delivered block.
6. Scope CSS and DOM queries to a unique root such as #bwci-main-page or #bwci-financial-engine. Guard initialization and clean up listeners, observers, timers, animation frames, and host style changes across GHL re-execution/rerender. Any needed document/window listener or body style write must be relevant, limited, and documented. Do not alter unrelated widgets.
7. Put image and cross-page link Custom Value references in the top JSON configuration. Reuse exact existing field keys through the shared link/image mappings; do not hardcode a separate header, drawer, footer, logo or portrait URL in each page. Propose missing names with `bwci_url_<destination>` / `bwci_img_<page>_<role>`, document them for owner creation and verify returned `fieldKey` spelling when available. Preserve the existing Main `hero_image` exception. Keep original image bytes in inline `imageFallbacks`; usable resolved URLs take priority in both variants. Missing/empty/`#`/unresolved values stay unavailable in hosted outputs and use original image fallbacks in inline outputs. Keep source assets and image composition/quality. Account changes and GHL publication require their own user instruction.
8. Implement responsive behavior intentionally. Validate 320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, and 2560 px, plus varied heights for sticky/scroll sections. Check overflow, clipping, overlaps, navigation, geometry, imagery, and release from pinned sections. Derive orbit/arc labels and markers from shared responsive geometry.
9. Preserve applicable wheel, keyboard, touch, scrollbar, anchor, resize, and orientation behavior. Do not trap scrolling or intercept input outside the component. Support prefers-reduced-motion with content and controls visible. Avoid needless continuous handlers, queries, observers, libraries, and forced layout loops.
10. Compare source and port visually and functionally. Check console/network errors, broken assets, duplicate initialization, focus/hover, and no source runtime imports. Test inside a hostile GHL-like host with generic CSS and content above/below when practical. State clearly whether QA was local or in a published GHL page.
11. On completion, add the page README with source, output, assets, config, installation, interactions, responsive QA, intentional differences, and limits. Remove the pending-page brief once its verified requirements are incorporated in the implementation README. Do not rewrite completed ports merely for uniformity.

## Existing convention

- There are 24 merged page ports / 48 outputs (Who We Are merged in PR #41), plus Verify a Communication (`ghl/pages/verify-a-communication/`, on `feat/ghl-verify-a-communication`). Main's main.ghl.html and main.inline.ghl.html are edited directly and kept in sync; no Main build folder exists. Its hero property is `heroImage`, using `{{ custom_values.hero_image }}`.
- The other pages are generated: edit ghl/pages/<slug>/_build/src/, then run node ghl/pages/<slug>/_build/build.js for both variants. Do not edit only the generated HTML. Development modules never run in GHL.
- Reuse ghl/shared/site-chrome/ for header, drawer, footer, breadcrumbs and applicable governance/profile components. Builders serialize image settings with `chrome.imageConfig(cfg)`; runtimes resolve images and links before consuming them. Main receives the same shared changes manually in both outputs.
- Extend the shared mappings in ghl/shared/site-links/index.js and ghl/shared/site-images/index.js for new destinations/images. Update the image resolver paths when adding properties, and test new fields rather than bypassing the shared guard. Shared production changes require rebuilding all affected consumers and synchronizing Main when affected.
- All ports use root-scoped CSS, page-specific prefixes, native JavaScript, isolated lifecycle cleanup and the same font convention. Keep pending-page plans in docs/implementation/pages/ and completed-port details in each page README. Do not rewrite completed ports solely for uniformity.
- At handoff, update current workflow status, affected page/shared records, proposed keys and QA evidence. Separate implemented, PR-open, confirmed-merged and live-GHL-verified states. Historical snapshots/test results are evidence for their recorded revisions, not current account state or proof of a new run.

## Git and completion

- For each page: preserve unrelated local files, refresh main with git switch main and git pull --ff-only origin main, then branch as feat/ghl-<slug>. Never branch from another page branch or implement on main. If the environment forces its own branch name, keep one page per branch and document the exception. Use a separate branch for documentation-only work.
- Commit clear page scoped changes, push, and open a PR to main after implementation, QA, and docs. State source/output, visual and interaction coverage, responsive checks, assets, GHL limits, and differences. Stop at the PR; never auto merge, rewrite history, or merge existing PRs.
- GitHub Pages deploys design changes on main only. GHL PRs are review artifacts, not live GHL installations. Verify GHL publication separately when requested.
