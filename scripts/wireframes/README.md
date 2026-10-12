# Next Version wireframe prototypes

Two linked, clickable prototypes built from the Claude Design wireframes for the
next version of the BWCI site (IA and core design system, October 2026):

| Prototype | Published at |
| --- | --- |
| Index | `/wireframes/` |
| Desktop (1280 px layouts) | `/wireframes/desktop/home.html` |
| Mobile (390 px layouts) | `/wireframes/mobile/home.html` |

These are wireframes for internal review. They are not the live site and not a
financial promotion. Every page has `noindex,nofollow` and a draft banner.

## Contents

- `render/*.html`: the wireframe sources (home, corp, insights, platforms, engine)
  plus `support.js`, a minimal runtime shim that renders the `.dc.html` template
  syntax (`sc-for`, `sc-if`, `{{ }}`) without Claude Design.
- `tools/build_proto.py`: renders each source in Chromium (Playwright), extracts
  each desktop or mobile artboard as static HTML, and writes `design/wireframes/`.
- `tools/proto.css`, `tools/proto.js`: prototype chrome, including the top bar,
  the Desktop/Mobile switch, the screen menu, the **Links** and **Notes** toggles,
  the mobile menu, fit-to-width zoom and the text-to-link rules.

Navigation is wired from the wireframe text. The `RULES` list in
`build_proto.py` matches nav labels, breadcrumbs and "→" links to screens.
Pages that are in sitemap v2 but not wireframed yet (Governance, Who We Are,
SMEs, Investors, Start a Conversation and others) get a placeholder that lists
their planned content.

## Rebuild

```bash
python3 scripts/wireframes/tools/build_proto.py "$PWD/scripts/wireframes" "$PWD/design/wireframes"
```

This needs Python with Playwright and Chromium. Commit the regenerated
`design/wireframes/`. When the change reaches `main`, GitHub Pages republishes it.

To update a wireframe, replace its file in `render/` with the new Claude Design
export, keep the same file name, and rebuild. If artboard ids change, update
`SCREENS` in `build_proto.py`.
