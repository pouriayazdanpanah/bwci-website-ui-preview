# Ecosystem page for HighLevel Custom Code

This branch contains a **single-paste** version of the Ecosystem page for a
HighLevel Website or Funnel **Custom Code** element:

- `ecosystem-widget.html` — paste the entire file into one Custom Code element.
- `build_widget.py` — regenerates that file from the source Ecosystem page,
  local React/runtime scripts, and hero image.

The code is isolated in a same-origin `srcdoc` iframe. This preserves the
existing Ecosystem interactions and responsive CSS while keeping its styles
away from HighLevel's page styles. All page code and the hero image are embedded
in the snippet. Google Fonts remains an optional external font request; system
font fallbacks are provided in the original CSS.

## Install in HighLevel

1. Open the destination page under **Sites → Websites** or **Sites → Funnels**.
2. Add a full-width section, row, and column with zero horizontal padding if
   the Ecosystem page should span the viewport.
3. Add a **Custom Code** element and paste the complete contents of
   `ecosystem-widget.html` into it. Save and inspect both the editor preview and
   the published page.
4. If HighLevel delays the script until the first interaction, disable
   **Optimise Javascript** for that page. The snippet also listens for the
   preview's `hydrationDone` event so it can remount after preview hydration.

The widget resizes its iframe to the page content as the viewport and
interactive content change. Internal links scroll the outer HighLevel page.
Links to other BWCI pages open at the top level, using the existing GitHub Pages
base URL set in `LINK_BASE` near the top of the snippet. Change that value if
those pages move to HighLevel. The snippet is about 730 KB because it embeds
its scripts and image; HighLevel does not document a Custom Code size limit in
its public support articles, so confirm that the editor saves the full block.

## Rebuild

From the repository root:

```powershell
python ghl/build_widget.py
```

This reads `Ecosystem.dc.html`, `support.js`, `vendor/react.js`,
`vendor/react-dom.js`, and `assets/eco-hero-waves.webp`. It does not modify those
source files. The GitHub Pages workflow deploys only pushes to `main`, so changes
on this branch do not alter the live site.

## Local verification

The generated block was tested in a local host page at 320, 390, 768, and 1280 CSS
pixels. The iframe height matched its content; there was no horizontal page
overflow; the hero image loaded; and the menu, loop tabs and play/pause,
mechanism and participant selectors, link targets, in-page scrolling, and
sticky navigation worked. The actual HighLevel editor and published page must
also be checked because this repository has no access to the user's HighLevel
site or its page-specific security settings.
