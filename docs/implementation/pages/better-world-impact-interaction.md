# Better World & Impact — required interaction correction (pending)

## Status and scope

The original user request explicitly requires: "Preserve the six-stage interaction, stage selection,
previous/next controls, progress state, and responsive behavior." PR #34 (`5b7fdfe`) delivered only the
actual static source figure. This requirement is therefore **not complete**. Implement a page-specific
corrective PR after the Main/shared synchronization merges, before stage 9 full regression. Start from
clean latest main; stop at PR review and never merge automatically.

Read `CLAUDE.md`, the implementation guide and `ghl/pages/better-world-impact/README.md` first.
Inspect `design/Better World Impact.dc.html` markup, unused `STEPS`/selection/previous/next logic and
responsive detail styles, plus the implemented Main and Financial Engine interaction patterns. Keep
`design/` unchanged. Explicit user requirements take precedence over the source's currently static
rendered markup; document the resulting intentional difference.

## Required delivery

- Six-stage selection with visible active state, original step content and correct progress state.
- Working previous/next controls and responsive detail/accordion behavior derived from the source
  definitions and established site patterns; keyboard/touch/focus and reduced motion must work.
- Preserve approach, supplied hero artwork/crop/quality, Impact markers, methodology, final CTA,
  independently configurable destinations, empty default evidence and case data. Invent no impact
  claims, metrics, outcomes, proof, case studies or destinations.
- Edit existing `_build/src/` and regenerate both independently pasteable blocks. Preserve scoped
  CSS/native JS, current shared lifecycle and cleanup through repeated execution/root replacement.

## Verification and completion

Use current rendered source as the visual baseline for unchanged sections; evaluate the required
interaction against its explicit acceptance criteria/source definitions, not the static screenshot.
Check all 13 standard widths, varied heights, keyboard/touch/hover, reduced motion, both variants,
hostile host, overflow, console/network and duplicate/root/ancestor lifecycle. Report PASS/FAIL/NOT
VERIFIED with current evidence. Live GHL/font/publication dependencies remain distinct.

Move verified requirements/results into the page README and retire this brief only once the interaction
is implemented and checked. Update the implementation index. Open the corrective PR, report remaining
stage 9 regression work, then stop until merge confirmation.
