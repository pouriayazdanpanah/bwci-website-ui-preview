# BWCI website preview

Static preview of the BWCI website. `index.html` is the home page. The other
pages, `support.js`, `vendor/`, and `assets/` are needed for navigation and
rendering.

## View locally

Run `python -m http.server 8000` in this directory and visit
<http://localhost:8000/>. The pages need an HTTP server; opening the files
directly with `file://` may prevent the runtime from loading them correctly.

## Publish on GitHub Pages

Push this directory to the `main` branch of a GitHub repository. In the
repository's **Settings → Pages**, choose **GitHub Actions** as the build and
deployment source. The workflow in `.github/workflows/pages.yml` publishes the HTML pages
and their runtime and image assets. Each push to `main` deploys
the site; the **Actions** tab shows the deployment status and public URL.

The `uploads/`, `scratch/`, and `qa/` directories are local design and QA files.
They are ignored by Git and omitted from the published site.

## Update from a Claude Design ZIP

Claude Design exports in this project's format contain `Main.dc.html`, other
`*.dc.html` pages, `support.js`, `assets/`, and `vendor/`. The import command
copies only these publishable files. It also makes `index.html` match
`Main.dc.html`, so the exported home page appears at the site root. The importer also restores
mobile viewport metadata and keeps the home hero text in normal flow on
narrow screens. It leaves `ghl/` and the existing deployment workflow alone. New pages in the ZIP become
available at their `.dc.html` URLs; add navigation links separately if needed.

Preview what a ZIP would change:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip" --check
```

Import locally for review:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip"
```

To import and publish in one command, first switch to a clean, up-to-date
`main` branch, then run:

```powershell
python scripts/import_claude_zip.py "C:\path\to\BWCI - Website UI.zip" --publish
```

`--publish` commits only the files imported from the ZIP and pushes `main`.
The existing GitHub Actions workflow then deploys the site automatically.
The ZIP itself stays outside the repository; there is no need to upload its
large collection of reference images to GitHub.
