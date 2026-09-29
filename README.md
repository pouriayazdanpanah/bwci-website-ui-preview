# BWCI website workspace

This repository keeps the static Claude Design preview and GoHighLevel (GHL)
implementation files separate:

| Folder | Purpose |
| --- | --- |
| `design/` | Published static site: `index.html`, `*.dc.html`, `support.js`, `assets/`, and `vendor/`. |
| `ghl/` | GHL Custom Code implementations and their build sources. Not published by GitHub Pages. |
| `scripts/` | Claude Design ZIP importer. |
| `.github/workflows/pages.yml` | Publishes only `design/` to GitHub Pages. |

The repository location of the design files changes, but public page URLs stay
the same: `design/index.html` is published at the site root.

## View the design locally

From the repository root, run:

```powershell
python -m http.server 8000 --directory design
```

Visit <http://localhost:8000/>. The pages need an HTTP server; opening them
through `file://` may prevent the runtime from loading.

## Publish the design

In repository **Settings > Pages**, select **GitHub Actions** as the build and
deployment source. The workflow copies only `design/` into the Pages artifact.
Pushes to `main` that change `design/` or the workflow deploy automatically;
changes only in `ghl/` do not redeploy the preview.

## Update from a Claude Design ZIP

The ZIP importer accepts the exported root `*.dc.html` pages, `support.js`,
`assets/`, and `vendor/`. It writes only to `design/`, maps `Main.dc.html`
to `design/index.html`, and ignores reference uploads, scratch files, and QA
material. It also restores mobile viewport metadata and keeps the home hero
text in normal flow on narrow screens. New pages become available at their
`.dc.html` URLs; add navigation links separately if needed.

Preview an import:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip" --check
```

Import locally for review:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip"
```

To import and deploy in one command, use a clean, up-to-date `main` branch:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip" --publish
```

`--publish` commits the changed files under `design/` and pushes `main`.
GitHub Actions then deploys the site. Keep the large ZIP outside the
repository; only its publishable files are committed.
