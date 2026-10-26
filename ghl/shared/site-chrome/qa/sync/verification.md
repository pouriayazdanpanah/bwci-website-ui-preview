# Main/shared synchronization verification — October 26, 2026

Stage 8 starts from confirmed merged Impact PR #34, main `5b7fdfe9e3108d1ea989836d6c53e8f01ab56a51`,
on `feat/ghl-main-shared-sync`. This report covers this revision's shared synchronization and Main CTA
update. Earlier page-local QA remains historical. This is **not** the final full-page regression.
Machine-readable current evidence: [`results.json`](results.json). Raw logs/screenshots are ignored
under `output/`; no QA wrapper, fixture route or test image URL enters production config.

## Change boundaries

- All **23** independent pages / **46** pasteable variants are synchronized. Regenerated the **22**
  build-based ports. Main remains direct-edit, with no new `_build/` or runtime imports.
- Latest source Header/Footer use independent `betterWorldImpact`, default `#` until a published URL
  is verified. The original 16 configs gain that key and keep their exact original `impact` values
  (`#bwci-impact` on Main, `/#bwci-impact` elsewhere). Old values are neither repurposed nor retargeted.
  The legacy key is currently unused by chrome; only this named unused compatibility key is allowed
  by the 15 older builders. Missing keys, other unused keys and unknown design hrefs still fail.
- Existing breadcrumbs are preserved, including the six independent Corporate / IR trails and
  Impact trail. Main's header/footer/runtime exactly include their generated shared counterparts.
- Shared runtime normalizes unavailable/copied links, page-owned/shared status, native GovNav options
  and optional regulatory footer lines. Late person-card hrefs preserve their actual query/hash/from.
  The four earlier IR selectors also clear copied unavailable option labels.
- Sixteen legacy page bootstraps now use the established root/ancestor owner pattern already used by
  the seven new ports. One child-list observer and scheduled boot handle removal/insertion without
  scroll/resize. Duplicate execution reuses the owner; teardown restores exact host body overflow.
- Main's only content CSS changes are `.bw-cta` and `.bw-cta::before`: latest source gradients, 24px
  dots and elliptical mask. Source revision `daa5e0d..812f136` confirms only those Main rules changed.
  Other 22 page styles, all page section markup, all assets and all original config/image strings are
  unchanged. No `design/` file or page asset was edited.

## Current results

| Check | Result | Actual coverage |
|---|---|---|
| Static preservation / native syntax | PASS | 46 outputs against merged baseline; content, styles, root/prefix/owner, original config/image values, legacy URLs and three independent Impact links each. Hosted/inline files match after the config region. Main includes exact generated header/footer/runtime |
| Build guards | PASS | Each of 22 builders rejects a removed required key and an unknown unused key; generator rejects an unknown design href. Legacy/new Impact mappings remain distinct |
| Shared browser behavior | PASS | 92 cases = all 23 pages × 390/1440px × inline/hosted; hostile CSS and surrounding content; duplicate scripts; one status/footer line; unavailable link Enter without jump; config update clears disabled links/options; ancestor replacement without events; delayed removal/reinsertion; exact body-overflow restoration; configured Impact navigation. Existing Main/Financial Engine/Ecosystem/Platforms controls receive a smoke check |
| Hosted image path | PASS | All hosted browser cases use mocked local HTTP URLs serving the exact inline asset bytes; no production URLs are inferred |
| Initial delayed markup / explicit teardown | PASS | All 23 pages at 390px inline; execute twice before markup, reuse owner, insert inert markup, open drawer, explicit destroy restores host overflow and removes status, mutation does not revive destroyed owner, explicit reboot works |
| Main CTA source/port | PASS | 13 required widths at height 900 plus 390×600, 1440×600 and 1440×1200; actual source vs both variants. 48 captures, 32 source/port pairs pixel-exact; geometry, padding, gradients, dot size/mask and text match; no horizontal overflow |
| Reproducible output generation | PASS | Re-ran all 22 builders; hashes of all 46 outputs unchanged, including the two direct-edit Main files |
| JavaScript/console/network | PASS | No page errors, unexpected console errors, failed asset requests or HTTP errors in the current shared browser/CTA runs; deliberate blocked Google Fonts excluded |
| Required Impact engine interaction | FAIL / pending correction | PR #34's static figure lacks the explicitly requested selection, previous/next, progress and responsive interaction. Tracked in the pending page brief; not repaired by this synchronization PR |
| Final full-page responsive/source/interaction regression | NOT VERIFIED | Stage 9 is still pending; this report does not renew every historical per-page result |
| Published GHL / real web fonts / final routes and approved content | NOT VERIFIED | Requires actual installation, hosted asset/font delivery, verified destinations and approved facts/content |

The first 92-case browser run passed 88 cases. Four desktop Main/Financial Engine smoke checks timed
out because the source positions visible `.lp-dot` children inside zero-size parent buttons. Corrected
only the test target to click the visible child, then reran those **four full cases** successfully in
both variants. `results.json` retains this recovery provenance; no production change was needed.

Chromium 154.0.8037.57, Playwright, Python/Pillow, Linux local loopback host. Source React is routed to
existing local vendor bytes only in QA. Google Fonts are deliberately aborted on both source and port;
matching fallback fonts are used. Main captures use reduced motion and disabled screenshot animations;
source/port CSS and layout are otherwise unmodified. Inspected actual phone and desktop CTA captures.
The HTTP-image paths are local fixtures. Touch in browser tests is emulation, not physical-device QA.

## Reproduce

Install/provide Playwright, Chromium and Pillow in the development environment. From repository root:

```sh
mkdir -p /tmp/bwci-sync-baseline
# Read-only baseline export; does not switch or edit the working branch.
git archive 5b7fdfe ghl/pages | tar -x -C /tmp/bwci-sync-baseline
node ghl/shared/site-chrome/qa/sync/static.js /tmp/bwci-sync-baseline/ghl/pages
node ghl/shared/site-chrome/qa/sync/reproducibility.js
python3 -m http.server 8123 --bind 127.0.0.1
# A second terminal, with the server running:
node ghl/shared/site-chrome/qa/sync/browser.js http://127.0.0.1:8123
node ghl/shared/site-chrome/qa/sync/deferred.js http://127.0.0.1:8123
node ghl/shared/site-chrome/qa/sync/main-visual.js http://127.0.0.1:8123
python3 ghl/shared/site-chrome/qa/sync/pixels.py
node ghl/shared/site-chrome/qa/sync/aggregate.js
```

`CHROMIUM_PATH` overrides `/usr/bin/chromium`. Browser cases can be targeted with
`--slugs=main,financial-engine --widths=1440 --variants=inline,hosted`; targeted results write
`browser-partial.json`, without replacing the full matrix. The aggregate accepts targeted recovery
only for actual failed full-matrix case IDs and requires every recovered case to pass. A new clean
full run should pass all 92 cases directly with the corrected visible targets.

## Review boundary and remaining work

Open the Main/shared synchronization PR and stop for manual review/merge. After confirmed merge,
start the [Impact interaction correction](../../../../../docs/implementation/pages/better-world-impact-interaction.md)
from fresh main in its own page-specific PR. After that correction merges, perform stage 9 current
full-page regression across all 23 updated pages, all specified widths/IR boundaries/heights and
relevant interactions. A merge is not a GHL installation or publication.
