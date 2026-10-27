# Existing Custom Values migration verification — October 27, 2026

Baseline: merged final-regression PR #37, `a41c1aea9e770f5dd115b33fe465bfa66d1a45f0`.
Branch: `feat/ghl-centralized-custom-values`, created directly from refreshed clean main.

## Results

| Check | Result | Coverage |
|---|---|---|
| Supplied Custom Value validation | PASS keys; URLs pending | 46 supplied records; 43 reused, 3 retained outside scope; unique names/keys, exact returned merge syntax; all 43 used values are `#` |
| Config and static preservation | PASS | 23 pages / 46 blocks; 704 link properties, 702 changed and two Main local anchors preserved; original config IDs, roots, owners and property names; exact non-navigation settings/image strings |
| UI/content preservation | PASS static comparison | CSS byte-identical in all 46 blocks; HTML structure/text identical after normalizing only configured href/option values; unrelated source JS and all 22 builders/guards unchanged |
| Section and URL boundary tests | PASS | 212 checks: missing/empty/unresolved bases, unsafe schemes, root/full URLs, existing query/hash, all 23 section aliases, local Main anchors and explicit overrides |
| Native browser navigation | PASS | 184 current cases: all 23 pages × hosted/inline × supplied export, configured future URL fixtures, unexpanded fields and empty fields; zero unexpected page/console/network diagnostics |
| Browser behavior | PASS | Hostile surrounding CSS; future-URL cases at 390 and 1440px; every rendered config-bound anchor checked; header/footer equality, mobile drawer/Escape and exact host overflow; ancestor replacement back to pending links; Main filtered cards remain connected; 46 real selector/footer navigation events reach intercepted fixture destinations |
| Build reproducibility | PASS | 22 builders rerun; all 46 current output hashes stable; Main keeps its direct-edit workflow |
| JSON substitution | PASS local model | Configs parse before and after supplied/synthetic text substitution; query ampersands, encoded commas and hashes preserved; no unresolved merge token reaches an active navigation href |
| Actual GHL JSON merge and cache behavior | NOT VERIFIED | No published page using this method was supplied; local substitution is a model, not a GHL server test |
| Published URLs / fonts / physical devices | NOT VERIFIED | All 43 supplied destination values remain `#`; no production route is inferred from older local paths |
| Live account changes / deployment | NOT PERFORMED | No Custom Values renamed/created/updated, and no GHL page installed or published |

The original pilot waited for offscreen lazy images and timed out on Main. Corrected only that
readiness assumption and the actual Main card selector; the full three-page pilot passed 24 cases.
The final all-page run uses the corrected driver. Static checks also identified configured hardcoded
fallbacks in six content templates and two Investors pathway data entries; these are now `#` until
runtime link configuration applies. Main's dynamic card fallback is likewise `#`. The fixed external
FCA guidance URL and all local section behavior remain unchanged.

## Supplied values

Complete per-page Used By lists are in [the CSV table](custom-values-validation.csv); the table below
uses page counts for readability. No value is considered a published page merely because its key exists.

| Custom Value | Exact returned fieldKey | Current value | Used by | Validation |
|---|---|---|---|---|
| `bwci_url_home` | `{{ custom_values.bwci_url_home }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_who_we_are` | `{{ custom_values.bwci_url_who_we_are }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_financial_engine` | `{{ custom_values.bwci_url_financial_engine }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_ecosystem` | `{{ custom_values.bwci_url_ecosystem }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_platforms` | `{{ custom_values.bwci_url_platforms }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_smes_projects` | `{{ custom_values.bwci_url_smes_projects }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_investors_partners` | `{{ custom_values.bwci_url_investors_partners }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_private_investors` | `{{ custom_values.bwci_url_private_investors }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_governance` | `{{ custom_values.bwci_url_governance }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_governance_board` | `{{ custom_values.bwci_url_governance_board }}` | `#` | 13 pages | PASS key; URL pending |
| `bwci_url_governance_leadership` | `{{ custom_values.bwci_url_governance_leadership }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_profile_alexander_alegria_saif` | `{{ custom_values.bwci_url_profile_alexander_alegria_saif }}` | `#` | 8 pages | PASS key; URL pending |
| `bwci_url_profile_farhad_reyazat` | `{{ custom_values.bwci_url_profile_farhad_reyazat }}` | `#` | 8 pages | PASS key; URL pending |
| `bwci_url_profile_gabriella_karlova` | `{{ custom_values.bwci_url_profile_gabriella_karlova }}` | `#` | 8 pages | PASS key; URL pending |
| `bwci_url_profile_richard_werner` | `{{ custom_values.bwci_url_profile_richard_werner }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_profile_ewa_dudek` | `{{ custom_values.bwci_url_profile_ewa_dudek }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_profile_agnes_gradzewicz` | `{{ custom_values.bwci_url_profile_agnes_gradzewicz }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_profile_christie_osarenren` | `{{ custom_values.bwci_url_profile_christie_osarenren }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_corporate_ir` | `{{ custom_values.bwci_url_corporate_ir }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_corporate_ir_company_information` | `{{ custom_values.bwci_url_corporate_ir_company_information }}` | `#` | 6 pages | PASS key; URL pending |
| `bwci_url_corporate_ir_reports_documents` | `{{ custom_values.bwci_url_corporate_ir_reports_documents }}` | `#` | 6 pages | PASS key; URL pending |
| `bwci_url_corporate_ir_shareholders` | `{{ custom_values.bwci_url_corporate_ir_shareholders }}` | `#` | 6 pages | PASS key; URL pending |
| `bwci_url_corporate_ir_regulatory` | `{{ custom_values.bwci_url_corporate_ir_regulatory }}` | `#` | 6 pages | PASS key; URL pending |
| `bwci_url_corporate_ir_legal_notices` | `{{ custom_values.bwci_url_corporate_ir_legal_notices }}` | `#` | 6 pages | PASS key; URL pending |
| `bwci_url_better_world_impact` | `{{ custom_values.bwci_url_better_world_impact }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_contact` | `{{ custom_values.bwci_url_contact }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_verify` | `{{ custom_values.bwci_url_verify }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_announcements` | `{{ custom_values.bwci_url_announcements }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_privacy_policy` | `{{ custom_values.bwci_url_privacy_policy }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_terms` | `{{ custom_values.bwci_url_terms }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_cookies_policy` | `{{ custom_values.bwci_url_cookies_policy }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_disclosures` | `{{ custom_values.bwci_url_disclosures }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_accessibility` | `{{ custom_values.bwci_url_accessibility }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_sitemap` | `{{ custom_values.bwci_url_sitemap }}` | `#` | 23 pages | PASS key; URL pending |
| `bwci_url_complaints_policy` | `{{ custom_values.bwci_url_complaints_policy }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_modern_slavery` | `{{ custom_values.bwci_url_modern_slavery }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_fca_register_entry` | `{{ custom_values.bwci_url_fca_register_entry }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_verify_email` | `{{ custom_values.bwci_url_verify_email }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_verify_phone` | `{{ custom_values.bwci_url_verify_phone }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_ir_email` | `{{ custom_values.bwci_url_ir_email }}` | `#` | 2 pages | PASS key; URL pending |
| `bwci_url_secretary_email` | `{{ custom_values.bwci_url_secretary_email }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_shareholder_meeting_notice` | `{{ custom_values.bwci_url_shareholder_meeting_notice }}` | `#` | 1 pages | PASS key; URL pending |
| `bwci_url_shareholder_meeting_results` | `{{ custom_values.bwci_url_shareholder_meeting_results }}` | `#` | 1 pages | PASS key; URL pending |
| `Custom Field Name` | `{{ custom_values.custom_field_name }}` | `Value` | 0 pages | Unused sample; retained |
| `contact` | `{{ custom_values.contact }}` | [Provided form URL](https://api.smartysoftware.co.uk/widget/survey/ixBriHum6UNTO2i5Wjrn) | 0 pages | Review legacy form vs canonical Contact |
| `Home  Hero Image` | `{{ custom_values.hero_image }}` | [Provided image URL](https://assets.cdn.filesafe.space/VJfUJbm01Udrn4vlmDQk/media/6ad91b8989ad2537e4a4e724.webp) | 0 pages | Outside navigation scope; retained |

## Link mapping and modified files

[link-mapping.csv](link-mapping.csv) lists every page, original config ID, JSON property, existing
Custom Value, exact reference, suffix, old local default and current GHL value. [updated-pages.csv](updated-pages.csv)
lists all 46 updated standalone HTML blocks. Twenty-two source configs and page runtimes are updated;
six source content templates lose only configured hardcoded fallbacks. Shared chrome embeds the
small link normalizer; no CSS/design/asset file changes. Per-page READMEs and the implementation index
point to this report. [results.json](results.json) contains the current detailed evidence.

The `bwci_url_contact` and legacy `contact` fields are distinct and have different values. The legacy
survey URL was not copied into the canonical key or repurposed as a verified page. `hero_image` remains
outside scope and the sample value is not used. These are reported for owner review, with no account edits.

## Reproduce

Provide Node, Playwright and Chromium; no QA dependency runs in GHL. From repository root:

```sh
mkdir -p /tmp/bwci-links-baseline
git archive a41c1ae ghl/pages | tar -x -C /tmp/bwci-links-baseline
node ghl/shared/site-links/qa/unit.js
node ghl/shared/site-links/qa/static.js /tmp/bwci-links-baseline/ghl/pages
node ghl/shared/site-links/qa/browser.js
node ghl/shared/site-links/qa/reproducibility.js
node ghl/shared/site-links/qa/aggregate.js
```

`CHROMIUM_PATH` overrides `/usr/bin/chromium`. `browser.js --slugs=main,corporate-ir` runs a targeted
pilot without replacing the full report. The browser suite serves exact original image bytes through
local Playwright request fixtures for hosted variants, blocks Google Fonts on both variants, and uses
matching fallbacks/reduced motion. No real account URL is requested. Raw generated logs/JSON are under
ignored `output/`; committed aggregate/CSV tables are the durable evidence. A new integration task
must verify actual GHL replacement/cache behavior before calling the published integration verified.
