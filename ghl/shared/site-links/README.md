# Centralized GHL navigation — October 27, 2026

The 23 page ports / 46 pasteable outputs now use the **43 existing Custom Values** supplied in the
user's GHL export. Names and `fieldKey` spelling are reused exactly; none are created, renamed or
updated in GHL. This is a navigation-only migration from merged PR #37 (`a41c1ae`).

## Configuration and installation

- Configure destination URLs centrally in the same GHL sub-account. All 43 used values in the
  supplied export are currently `#`; cross-page navigation therefore remains unavailable until
  confirmed URLs are entered. Existing relative paths are not treated as proof of publication.
- Paste one updated hosted or inline block into each corresponding GHL Custom Code element. Keep
  the original config ID and JSON structure. No package, shared runtime URL or build step runs in GHL.
- The JSON contains the exact returned merge fields, for example
  `"home": "{{ custom_values.bwci_url_home }}"`. Section destinations reuse their page's value plus
  the existing fragment; a small inlined helper composes them after substitution, preserving query
  parameters and replacing an existing fragment. If the base is `#`, empty or unresolved, the section
  link is unavailable instead of becoming an accidental local jump. Explicit URL overrides still work.
- Main's original local `#bwci-impact` and `#bwci-today` settings remain local. All other static local
  anchors are preserved. Profile `?from=board` / `?from=leadership` context still appends before hashes.
- Images, media URLs, logo values, footer wording, options, CSS, typography, content, sections and
  unrelated interaction code are preserved. Main remains direct-edit, with no `_build/` folder.

`index.js` is a development mapping/validation module. `links.runtime.js` is inlined through the
existing shared chrome generator. `custom-values.snapshot.json` records only the provided names,
exact field keys and then-current values; it is **audit evidence**, not a live URL source. Account IDs
and tracing metadata are omitted. Change website URLs in GHL, not in that snapshot.

## Findings from the supplied export

All 43 required values exist, with unique names and keys and consistent `bwci_url_` naming. All 43
values are `#`, so their published destinations remain unverified. No missing Custom Values were
found for the 66 existing link properties; 23 section properties reuse page-base values.

Three additional values are preserved outside this migration:

- `contact` / `{{ custom_values.contact }}` points to an existing external survey form, while
  `bwci_url_contact` is `#`. These are different keys and different configured destinations. The
  canonical navigation uses the existing `bwci_url_contact`; no form URL is silently reassigned.
- `Home  Hero Image` / `{{ custom_values.hero_image }}` is an image setting outside this link-only
  task. It does not replace or alter the existing page artwork.
- `Custom Field Name` / `{{ custom_values.custom_field_name }}` is an unused sample. It is neither
  referenced nor removed from the account.

The existing announcements destination still has no dedicated implementation: the source points
at a Main Insights section that does not exist. Its existing Custom Value remains `#`. Legal policy,
Who We Are, Private Investors, Contact and Verify destinations also need their actual approved pages
or URLs. Mail/phone/register/meeting destinations require confirmed values (`mailto:`, `tel:` or
appropriate HTTP(S)/root-relative URLs). Document-row placeholders and empty Impact evidence/cases
remain unchanged; no documents, contact details or destinations are invented.

## Reports and verification

- [Validation and test report](qa/verification.md).
- [All 46 modified output paths](qa/updated-pages.csv).
- [Every page/property mapping](qa/link-mapping.csv): 704 entries, including 702 changed references
  and the two preserved Main local anchors.
- [Custom Value validation table](qa/custom-values-validation.csv): all 46 supplied values, their
  current values, actual keys, complete Used By lists and validation status.
- [Machine-readable current evidence](qa/results.json).

Local tests model GHL's text substitution using the supplied `#` values, empty values, literal
unresolved fields and synthetic future URLs with query parameters/hashes. They do **not** establish
that GHL resolves fields inside `application/json` or how its publication cache refreshes. Actual GHL
substitution, published destinations, real font delivery and physical devices remain **NOT VERIFIED**.
No GHL API calls, account changes, installation or publication are performed by this migration.

For real-GHL confirmation, inspect an already installed block's published page source: verify the
JSON fields have resolved, the JSON parses, no raw merge token reaches links, and header/footer,
selectors, CTAs and profile context use the intended destinations. After a central URL change, check
fresh page loads across consumers and GHL cache propagation. A field that remains literal is disabled
locally; report that evidence before introducing a different carrier mechanism. Current field values
must be valid URL strings; encode quotes/control characters rather than placing raw text in URLs.
