# November 8, 2026 design import

The owner requested publication using `python scripts/import_claude_zip.py <zip> --publish`.
The latest export was obtained through [Google Drive](https://drive.google.com/file/d/1JtnvdsvRZ70hOtG45jZ3O2fdBX0lcNFj/view),
from `BWCI - Website/design/BWCI - Website UI.zip`, uploaded November 8.
The [Claude artifact](https://claude.ai/code/artifact/71311b2b-fe91-43c3-9345-93963480a0cc)
was inaccessible through the available web tool; it was not edited or treated as verified.

## Source and publication

- ZIP SHA-256: `70fc8f5acf09626ec65b363e6e703bcd695a2e81fd5d969cb3783879b4e1c8a7`.
- 80 source files under `BWCI-Website-UI/`; 76 publishable files after standard normalization,
  including the generated homepage `index.html`.
- The original importer failed with `ZIP is missing required files: Main.dc.html, support.js,
  vendor/react-dom.js, vendor/react.js`. Those files existed inside the wrapper.
- An equivalent temporary flat ZIP was validated and published through the existing `--publish`
  command on clean, refreshed `main`. Commit: `a012ab2` (`Import Claude Design site export`).
- Seven changed design files: six new pages (`Start a Conversation`, `Privacy`, `Terms`, `Cookies`,
  `Disclosures`, `Accessibility`) and `SiteFooter.dc.html`. No existing page content, asset bytes,
  runtime files or GHL outputs were replaced by the import.
- GitHub Pages [deployment run 42472019472](https://github.com/pouriayazdanpanah/bwci-website-ui-preview/actions/runs/42472019472)
  for `a012ab2` completed successfully, including `actions/deploy-pages@v4` (job `128704782083`).
  This verifies deployment completion, separately from the local browser checks below.
  The public preview could not be read through the available web tool; the deployment result was
  verified through GitHub Actions.

## Importer and build compatibility fix

`fix/design-export-folder-import` starts from refreshed `main` at `a322211`; publication commit
`a012ab2` was subsequently integrated into the branch without changing its imported files. The fix
and this handoff are delivered in [PR #50](https://github.com/pouriayazdanpanah/bwci-website-ui-preview/pull/50),
open for manual review/merge at handoff. The initial fix commit is `1681ce8`; verify the branch/PR state
before resuming.

The importer accepts existing root exports or one complete folder-wrapped export, including nested
folder names. It validates original paths and case duplicates before removing the selected prefix,
rejects ambiguous complete nested exports, retains required-file/dependency/size checks and ignores
unrelated non-publishable files. Existing root exports keep their original selection behavior.

The footer's five new standalone policy routes are aliases for the same existing `legalPrivacy`,
`legalTerms`, `legalCookies`, `legalDisclosures` and `legalAccessibility` config keys. Unknown routes
still fail the build. This is development compatibility, with no changed GHL output or new values.

## Validation

- `python -B -m unittest discover -s scripts/tests -p 'test_*.py' -v`: 8 tests pass, covering equivalent
  root/wrapped/nested output, outside notes, root-export priority, ambiguous exports, unsafe paths,
  case duplicates, missing dependencies and incomplete exports.
- `node scripts/tests/footer-route-compatibility.js`: the five old/new route pairs generate identical
  footer markup; an unknown route is still rejected.
- The original Drive ZIP passes `--check` with the fixed importer and reports **0 changed files**
  against the published design. Published and fixed-importer normalization are equivalent.
- All **29 builders reproduce all 60 committed outputs**, including Main's untouched direct-edit pair.
  No pasted GHL block changes.
- Local Chromium smoke checks: all six new pages plus Main and Contact at **390 and 1440 px**
  (**16 cases**). Headings render; all five policy destinations are present; no local HTTP errors,
  page exceptions, broken loaded images or horizontal document overflow. Conversation/mobile and
  Privacy/desktop screenshots were inspected. Forms were not submitted.
- The local browser used the export's React/ReactDOM through the runtime resource map because the
  Cloud network blocks the external CDN. Google Fonts CSS was stubbed; fallback fonts were used.
  This is a local render check, not verification of external CDN/font delivery or physical devices.
- `git diff --check` passes. Existing policy placeholders and sitemap gaps remain as supplied.

## Handoff

Merge the importer/compatibility PR before using the normal command on future folder-wrapped exports.
Use a clean `main` and pull first; `--publish` commits and pushes the design, while `--check` is read-only.
The latest design is already pushed, so re-running it after the fix should be a no-op.
The six new designs are pending separate GHL implementation; all 30 earlier ports and Custom Values
retain their existing behavior. Live GHL installation remains unverified.
