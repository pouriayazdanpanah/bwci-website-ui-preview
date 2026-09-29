# Main (Homepage) — GoHighLevel port

GoHighLevel (GHL) **Website Builder → Custom Code** version of the Claude Design page
`Main.dc.html` (published at the site root as `index.html`). The Claude Design export in the
design/ folder is the reference; everything GHL-specific for this page lives here.

```
ghl/pages/main/
├── main.ghl.html                  ← production block (hosted hero image)        ~165 KB
├── main.inline.ghl.html           ← self-contained block (hero image embedded)   ~780 KB
├── assets/bwci-hero-globe.webp    ← hero globe, 1448×1086 RGBA webp (upload this to GHL)
└── README.md
```

These two files are the Main page blocks that were built and tested earlier, added to the
repository as-is. The two blocks are identical except for the hero image: the inline one has
it embedded and an empty `"heroGlobeImage"`. This page has no `_build/` folder; edit the
`.ghl.html` files directly and keep both variants in sync.

## Installation in GoHighLevel

1. Upload `assets/bwci-hero-globe.webp` to **Media Storage** and copy its URL.
2. Open `main.ghl.html`. The **first block** is the configuration: paste the image URL into
   `"heroGlobeImage"` and set the `"links"`.
3. In the GHL page, add a section → **full width**, no padding/margins, one row/column with no
   padding, and a **Custom Code** element in it.
4. Paste the **entire** file (config block, font `<link>` tags, `<style>`, markup, `<script>`).
5. Check the **published** page (GHL does not run custom-code scripts in the editor canvas).

`main.inline.ghl.html` works without steps 1–2, but it is ~780 KB.

## Configuration — the JSON block at the top of the paste

```html
<script type="application/json" id="bwci-main-config">
{
  "heroGlobeImage": "https://REPLACE-WITH-YOUR-HOSTED-URL/bwci-hero-globe.webp",
  "showHeader": true,
  "links": { "home": "#bwci-hero", "financialEngine": "/financial-engine", … }
}
</script>
```

| Key | Default | Used by |
|---|---|---|
| `heroGlobeImage` | placeholder URL | Hero globe (replace before publishing, otherwise the browser requests the placeholder URL) |
| `showHeader` | `true` | `false` removes the built-in header (e.g. when a GHL global header is used) |
| `links.home` | `#bwci-hero` | Header + drawer logo |
| `links.financialEngine` | `/financial-engine` | "The Financial Engine" (dropdown, drawer), "Explore" |
| `links.ecosystem` | `/ecosystem` | "Ecosystem Topology" (dropdown, drawer), "Explore the ecosystem" |
| `links.platforms` | `/platforms` | "Platforms & Institutions" (header, drawer), "View platform status" |
| `links.smes` | `/smes-projects` | "SMEs & Projects" (header, drawer, footer), "I’m an SME or project", SME route card |
| `links.investors` | `/investors-partners` | "Investors & Partners" (header, drawer, footer), "I’m an investor or partner", partner route card |
| `links.capabilities` | `#` | "View all capabilities" |
| `links.leadership` | `#` | Leadership card (trust section) |
| `links.corporate` | `#` | Corporate card (trust section) |
| `links.ctaSme` | `#` | Final CTA "SME / Project" |
| `links.ctaInvestor` | `#` | Final CTA "Investor / Partner" |
| `links.ctaCorporate` | `#` | Final CTA "Corporate Information" |
| `links.ctaVerify` | `#` | Final CTA "Verify a Communication" |

Keys left as `#` still need real destinations. Links to sections on this page are fixed and not
in the config.

## Section ids other pages link to

The Financial Engine block's default links point here, so keep these ids stable:

`#bwci-hero`, `#bwci-problem`, `#bwci-what`, `#bwci-engine`, `#bwci-different`,
`#bwci-ecosystem`, `#bwci-platforms`, `#bwci-frontdoors`, `#bwci-trust`, `#bwci-cta`.

## Shared with other pages

- **Fonts:** the three Google Fonts `<link>` tags after the config block are the reference.
  `ghl/pages/financial-engine` uses exactly the same tags.
- **Config pattern:** a JSON block at the top, `data-*-link="key"` on anchors, and flat
  key → URL links. Financial Engine follows it (`bwci-financial-engine-config`, `data-fe-link`).
- **Header/footer:** each page includes its own copy of the site header and footer.

## Smoke test (added to the repository)

Rendered in headless Chromium at 320, 390, 768, 1024, 1440 and 1920 px: no JavaScript
errors and no horizontal overflow at any width, and the hero globe renders. This is a smoke
test only; there is no pixel comparison against `Main.dc.html` for this page.
