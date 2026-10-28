# BWCI project instructions

Before implementing or changing a GHL page, read these repository records in order:

1. [Project rules](CLAUDE.md).
2. [Implementation status and workflow](docs/implementation/README.md).
3. The relevant `ghl/pages/<slug>/README.md`, or a new-page brief made from
   [the page template](docs/implementation/page-template.md).
4. Shared [site chrome](ghl/shared/site-chrome/README.md),
   [link Custom Values](ghl/shared/site-links/README.md), and
   [image Custom Values](ghl/shared/site-images/README.md).

Claude and Codex use the same versioned project memory: Claude starts at `CLAUDE.md`; Codex starts
here and reads the same rules. Both must follow the workflow's
[resume and handoff checklist](docs/implementation/README.md#claude-and-codex-resume-and-handoff).
Do not maintain a separate Codex-only status or rely on either tool's private memory.

These versioned files are the durable project memory for future sessions. Follow the shared
configuration, build, lifecycle and QA contract; do not rely on chat history or copy an older page's
historical defaults. Keep current status and page/shared records updated when the work changes.
Use a fresh branch from current `main`, including for documentation changes. Finish with a PR for
manual review; never auto merge. A merged PR does not establish installation or publication in GHL.
