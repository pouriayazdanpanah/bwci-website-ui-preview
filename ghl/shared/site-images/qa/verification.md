# Image Custom Values verification — October 27, 2026

Baseline: merged navigation PR #38, `52b3cc50906b7e2619273e76d24f99c4e90e7b17`.
Branch: `feat/ghl-image-custom-values`, created from clean refreshed main.
Result: **PASS locally**. No GHL account mutation, API provisioning or publication was performed.

## Scope and mapping

- **23 pages / 46 outputs**, **73 image configuration settings**, **20 unique source images**.
- Reuse the 13 exact `bwci_img_…` references supplied by the owner. Reuse the already existing Main
  `hero_image` from the earlier account export, rather than create a duplicate Main hero value.
- Propose six new hero keys in [API-ready request bodies](../bwci-image-custom-values-to-create.json).
  Each object is one create request. The owner must create these values and enter hosted image URLs.
- Both output variants use the references. Inline blocks retain their original embedded bytes under
  optional `imageFallbacks`; valid resolved primary URLs override those fallbacks. Hosted blocks have
  no embedded fallback. Existing image properties/config IDs and navigation remain unchanged.

[Full key inventory](../README.md#full-image-inventory), [per-page/property CSV](image-mapping.csv) and
[machine-readable inventory](inventory.json) record each key, source asset, usage and creation status.
The supplied image keys were reported as created by the owner; their current URL values were not
supplied. The six proposed keys are not represented as existing account values.

## Current results

| Check | Result | Coverage |
|---|---|---|
| Complete image binding | PASS | All 73 settings in each variant reference the intended image key; shared logos/portraits reuse one key across consumers |
| Original artwork preservation | PASS | All 20 original asset SHA-256 values match the previous inline bytes and the current fallback bytes; shared portraits are byte-identical across pages |
| UI/content/navigation preservation | PASS | Exact CSS and HTML in all 46 outputs; all non-image config, link keys/values, alt text and unrelated runtime preserved |
| Builder preservation | PASS | All 22 builder changes are limited to the image config serializer; original guards and other build logic retained; Main has no new build folder |
| Boundary tests | PASS | 317 checks for URL availability, primary priority, empty/#/unresolved/invalid values, all image paths, embedded fallback, null optional containers and stale src cleanup |
| Browser images | PASS | 184 cases: all 23 pages × hosted/inline × resolved URLs, raw tokens, empty values and # placeholders; all 20 images exercised |
| Source fit/frame comparison | PASS | 476 image pairs at 390px and 1440px against the previous blocks, using identical source bytes; maximum geometry delta 0 CSS pixels; original natural dimensions match |
| URL changes and copied markup | PASS | In all 46 resolved-URL cases, clone already-loaded roots, change image URLs, verify new URLs, then set pending values and verify stale hosted src removal or exact inline fallback |
| Header/drawer/footer identity | PASS | Every logo element uses the same central value; portrait references are shared across Main/Board/Leadership/profiles |
| Diagnostics | PASS | No unexpected JavaScript/console/network errors; no request for unresolved merge tags or old REPLACE-WITH placeholders |
| Reproducible output generation | PASS | 22 builders rerun; all 46 output hashes stable, including the two direct-edit Main blocks |
| Actual GHL substitution/media delivery | NOT VERIFIED | Existing key URL values and a published installation were not supplied; browser substitution and HTTP delivery are local fixtures |
| Live GHL actions | NOT PERFORMED | No image values created/updated/renamed; no page installed, published or deployed |

The initial three-page pilot assumed two logo nodes. The actual shared header/drawer/footer contains
three; corrected only the QA count assumption. The repeated pilot passed 24 cases before the full
184-case run. There were no image-binding exceptions or production fixes hidden by that correction.

## Behavior and limitations

A valid GHL-resolved HTTP(S), root-relative or supported data-image URL takes priority in both variants.
Empty strings, #, unresolved tokens, old upload placeholders and unsupported schemes are unavailable.
Inline outputs use exact original bytes in that case; hosted outputs omit src instead of requesting
invalid URLs. This also clears old URLs copied from a live root. An HTTP 404 for an otherwise valid URL
is still a delivery/configuration problem; the fallback is not an HTTP-error retry mechanism.

Main's hero intentionally keeps the existing `{{ custom_values.hero_image }}`. No unused
`bwci_img_main_hero` is introduced. Future Impact case image records remain unchanged and empty by
default; no speculative case keys/images are invented. Source SVG/CSS decoration is preserved.

The six proposed values start with # in the request file. Upload the corresponding supplied artwork
to GHL Media Storage and set the direct image URL. Check actual returned fieldKey spelling after
creation. Real GHL replacement inside application/json, caching, media contents/delivery, real web
fonts and physical-device behavior remain **NOT VERIFIED**. No local fixture URL enters production.

## Reproduce

Provide Node, Playwright and Chromium. From repository root:

```sh
mkdir -p /tmp/bwci-images-baseline
git archive 52b3cc5 ghl/pages | tar -x -C /tmp/bwci-images-baseline
node ghl/shared/site-images/qa/unit.js
node ghl/shared/site-images/qa/static.js /tmp/bwci-images-baseline/ghl/pages
node ghl/shared/site-images/qa/browser.js
node ghl/shared/site-images/qa/reproducibility.js
node ghl/shared/site-images/qa/aggregate.js
```

`CHROMIUM_PATH` overrides `/usr/bin/chromium`. A targeted browser pilot supports
`--slugs=main,better-world-impact,profile-farhad-reyazat` and leaves the full report intact. The browser
suite fulfills original image bytes through request interception, blocks Google Fonts, uses matching
fallback fonts/reduced motion, visits lazy photos and compares the unchanged fit/frame geometry.
No actual GHL media/account URL is requested. Detailed raw JSON is under ignored `output/`; committed
[results.json](results.json) and CSV/inventory tables are the durable current evidence.
