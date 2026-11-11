# Main content update — 11 November 2026 (dev-only record)

- `owner-markup.html`: the owner's live Home markup as supplied (hero to closing CTA), the source of truth for those
  sections.
- `apply-markup.py`: replaces Main's sections with it (link addresses back to `#`, profile keys on the leadership
  cards), and inserts design export `04715d6`'s "Why now, why us" section and CSS (renamed to Main's classes, ids and
  keyframes) plus the CSS for the owner's `bw-copy-*` and `bw-platform-copy` classes.
- `apply-script.py`: config (new links and `showWhyFlags`, `today` → `bwci_url_platform_today`, unused keys removed),
  the engine and Platforms script data, and the bridge runtime.

Both were run once on `main.ghl.html` and `main.inline.ghl.html`, then `node ghl/global/_build/main-global.js`. Nothing
here runs in GHL.

Afterwards, by the owner's request, the closing CTA's four routes were pointed at the Start a Conversation forms
(`startAConversationSmes` / `Investors` / `Banks` / `Partners`), a direct edit of both outputs not covered by these
scripts; `owner-markup.html` keeps the owner's original keys.
