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
deployment source. The workflow in `.github/workflows/pages.yml` publishes only
the five pages and their runtime and image assets. Each push to `main` deploys
the site; the **Actions** tab shows the deployment status and public URL.

The `uploads/`, `scratch/`, and `qa/` directories are local design and QA files.
They are ignored by Git and omitted from the published site.
