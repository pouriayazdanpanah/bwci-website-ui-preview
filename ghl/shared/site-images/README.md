# Centralized GHL image values — October 27, 2026

All 23 pages / 46 outputs now bind 73 image configuration settings to **20 unique image values**.
Thirteen image keys are reused exactly from the latest user message. Main also reuses the already
existing `{{ custom_values.hero_image }}` from the earlier GHL export; no duplicate Main hero key is
created. The other **six hero keys are proposed for the owner to create**. No GHL API calls, account
edits or publication are performed.

This integration merged in PR #39 (`967b053`). Merge confirms the repository change; account creation
of the six proposed keys, their actual URLs and installed-page behavior remain unverified.

## Who We Are addition — October 28, 2026

The Who We Are port (`feat/ghl-who-we-are`) adds one image setting, `whoWeAreHeroImage`, mapped to the **proposed**
`{{ custom_values.bwci_img_who_we_are_hero }}` (asset `ghl/pages/who-we-are/assets/hero-globe.png`). Its body is
appended to [the to-create file](bwci-image-custom-values-to-create.json): **seven** keys to create in total. The
list of image settings is inlined into every page, so the 22 generated pages were rebuilt and both Main files were
edited by hand. In those 46 outputs that list is the only changed line, and the old and new resolvers return
identical results for every existing config ([evidence](../../pages/who-we-are/qa/verification.md)). The
inventory tables below describe the 23-page revision of PR #39; Who We Are reuses the logo and four portrait keys.

## Providence Asset Management addition — October 29, 2026

The Providence Asset Management port (`feat/ghl-providence-asset-management`) adds `pamHeroImage`, mapped to the
**proposed** `{{ custom_values.bwci_img_providence_asset_management_hero }}` (asset
`ghl/pages/providence-asset-management/assets/pam-hero.png`); its body is appended to the to-create file, which now
lists **eight** keys. As for Who We Are, every other generated page was rebuilt and both Main files edited: in the 50
existing outputs the image-settings list is the only changed line, and the old and new resolvers return identical
results for every existing config ([evidence](../../pages/providence-asset-management/qa/verification.md)). The page
reuses the logo and three portrait keys (Richard Werner, Farhad Reyazat, Gabriella Karlova).

## How the outputs work

- Existing image properties (`logoImage`, each page's hero property, Main `images`, and `peopleImages`)
  now contain Custom Value references. Original config IDs, navigation settings and all other options
  are preserved. Header, mobile drawer and footer share the same logo value; each person's portrait
  uses one key across Main leadership cards, Board, Leadership and profile pages.
- Both hosted and inline blocks honor a valid resolved image URL first. Hosted blocks skip an empty,
  `#`, unresolved merge field, old upload placeholder or unsupported image URL; no request is made
  for these values. Copied live image URLs are cleared when a replacement config is unavailable.
- Inline blocks retain the **exact original embedded image bytes** in an optional `imageFallbacks`
  object that mirrors their image properties. When a Custom Value is missing/empty/unresolved,
  those original images render. Once GHL supplies a usable URL, it overrides the fallback. The
  fallback is for unavailable configuration, not HTTP errors from an otherwise usable URL.
- Image frames, crop/fit logic, ratios, alt text, CSS, animations, content and navigation remain
  unchanged. No artwork is compressed or replaced. Main remains direct-edit with no `_build/` folder.
- `index.js` and the existing builders are development only. The small resolver is inlined into each
  page; pasted blocks load no shared JavaScript, React, source helpers or build tools.

## Keys to create (six from PR #39, one each from Who We Are and Providence Asset Management)

Upload the supplied assets to GHL Media Storage and use the direct image URLs as the values. `#` is
only a safe initial placeholder; no hosted production URLs are invented here. Do not recreate the
13 supplied keys or the existing Main `hero_image`.

| Custom Value name | Expected merge reference | Page | Supplied asset |
|---|---|---|---|
| `bwci_img_financial_engine_hero` | `{{ custom_values.bwci_img_financial_engine_hero }}` | financial-engine | [financial-engine-hero.webp](../../../ghl/pages/financial-engine/assets/financial-engine-hero.webp) |
| `bwci_img_ecosystem_hero` | `{{ custom_values.bwci_img_ecosystem_hero }}` | ecosystem | [ecosystem-hero-waves.webp](../../../ghl/pages/ecosystem/assets/ecosystem-hero-waves.webp) |
| `bwci_img_platforms_hero` | `{{ custom_values.bwci_img_platforms_hero }}` | platforms | [plat-hero-rails.png](../../../ghl/pages/platforms/assets/plat-hero-rails.png) |
| `bwci_img_smes_projects_hero` | `{{ custom_values.bwci_img_smes_projects_hero }}` | smes-projects | [sme-hero-flow.webp](../../../ghl/pages/smes-projects/assets/sme-hero-flow.webp) |
| `bwci_img_investors_partners_hero` | `{{ custom_values.bwci_img_investors_partners_hero }}` | investors-partners | [inv-hero-flow.png](../../../ghl/pages/investors-partners/assets/inv-hero-flow.png) |
| `bwci_img_better_world_impact_hero` | `{{ custom_values.bwci_img_better_world_impact_hero }}` | better-world-impact | [impact-hero-ribbons.png](../../../ghl/pages/better-world-impact/assets/impact-hero-ribbons.png) |
| `bwci_img_who_we_are_hero` | `{{ custom_values.bwci_img_who_we_are_hero }}` | who-we-are | [hero-globe.png](../../../ghl/pages/who-we-are/assets/hero-globe.png) |
| `bwci_img_providence_asset_management_hero` | `{{ custom_values.bwci_img_providence_asset_management_hero }}` | providence-asset-management | [pam-hero.png](../../../ghl/pages/providence-asset-management/assets/pam-hero.png) |

[API request bodies](bwci-image-custom-values-to-create.json) contain only `name` and `value` for the
six proposed values. GHL's create endpoint accepts **one object per POST**, not the whole array.
The existing loop script can read this file through `--file`. Check the returned `fieldKey` matches
the proposed reference after creation. This repository does not create values in the account.

## Full image inventory

| Image value | Status | Configuration uses | Pages |
|---|---|---:|---|
| `{{ custom_values.bwci_img_logo }}` | Existing, reused | 23 | better-world-impact, corporate-ir, corporate-ir-company-information, corporate-ir-legal-notices, corporate-ir-regulatory, corporate-ir-reports-documents, corporate-ir-shareholders, ecosystem, financial-engine, governance, governance-board, governance-leadership, investors-partners, main, platforms, profile-agnes-gradzewicz, profile-alexander-alegria-saif, profile-christie-osarenren, profile-ewa-dudek, profile-farhad-reyazat, profile-gabriella-karlova, profile-richard-werner, smes-projects |
| `{{ custom_values.hero_image }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_who_photo }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_impact_1 }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_impact_2 }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_impact_3 }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_impact_4 }}` | Existing, reused | 1 | main |
| `{{ custom_values.bwci_img_financial_engine_hero }}` | Create in GHL | 1 | financial-engine |
| `{{ custom_values.bwci_img_ecosystem_hero }}` | Create in GHL | 1 | ecosystem |
| `{{ custom_values.bwci_img_platforms_hero }}` | Create in GHL | 1 | platforms |
| `{{ custom_values.bwci_img_smes_projects_hero }}` | Create in GHL | 1 | smes-projects |
| `{{ custom_values.bwci_img_investors_partners_hero }}` | Create in GHL | 1 | investors-partners |
| `{{ custom_values.bwci_img_better_world_impact_hero }}` | Create in GHL | 1 | better-world-impact |
| `{{ custom_values.bwci_img_profile_alexander_alegria_saif }}` | Existing, reused | 10 | governance-board, governance-leadership, main, profile-agnes-gradzewicz, profile-alexander-alegria-saif, profile-christie-osarenren, profile-ewa-dudek, profile-farhad-reyazat, profile-gabriella-karlova, profile-richard-werner |
| `{{ custom_values.bwci_img_profile_farhad_reyazat }}` | Existing, reused | 10 | governance-board, governance-leadership, main, profile-agnes-gradzewicz, profile-alexander-alegria-saif, profile-christie-osarenren, profile-ewa-dudek, profile-farhad-reyazat, profile-gabriella-karlova, profile-richard-werner |
| `{{ custom_values.bwci_img_profile_gabriella_karlova }}` | Existing, reused | 10 | governance-board, governance-leadership, main, profile-agnes-gradzewicz, profile-alexander-alegria-saif, profile-christie-osarenren, profile-ewa-dudek, profile-farhad-reyazat, profile-gabriella-karlova, profile-richard-werner |
| `{{ custom_values.bwci_img_profile_richard_werner }}` | Existing, reused | 2 | governance-leadership, profile-richard-werner |
| `{{ custom_values.bwci_img_profile_ewa_dudek }}` | Existing, reused | 2 | governance-leadership, profile-ewa-dudek |
| `{{ custom_values.bwci_img_profile_agnes_gradzewicz }}` | Existing, reused | 2 | governance-leadership, profile-agnes-gradzewicz |
| `{{ custom_values.bwci_img_profile_christie_osarenren }}` | Existing, reused | 2 | governance-leadership, profile-christie-osarenren |

Complete [per-page/property mapping](qa/image-mapping.csv) and [machine-readable inventory](qa/inventory.json)
include the source artwork paths and SHA-256 hashes. Future Impact case images remain in their
approved case records; the source case list is empty and no case data or speculative image keys
are added. Inline SVG/CSS decoration is not a hosted image destination.

## Verification and rollout

[Current verification](qa/verification.md) and [detailed results](qa/results.json) cover exact source
asset/fallback preservation, unchanged UI/navigation, image URL priority and invalid values, all
pages in both variants, phone/desktop fit geometry and copied-root changes. Original source bytes
are served through local HTTP request fixtures to model future GHL media URLs.

Actual values/URLs for the newly supplied 13 keys were not included, so live image delivery and
correct asset selection in GHL are **NOT VERIFIED**. GHL substitution inside `application/json`,
cache propagation, real fonts and physical devices likewise require an installed-page check.
No GHL deployment or live account modification is performed. The earlier navigation-only reports
remain historical; this migration does not change the existing link Custom Values.

After creating/filling the six keys, paste one updated block per page. Use hosted blocks when all
required media URLs are configured; inline blocks retain original fallback artwork while still
honoring the central values. Test Main, a profile and a hero page first. Change a logo/portrait URL
centrally and check fresh page loads across consumers, including the mobile drawer. Retain only
URL-safe values in JSON merge fields (encode raw quotes/control characters in URLs).
