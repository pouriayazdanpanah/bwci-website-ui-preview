# Start a Conversation links — verification (9 November 2026)

**Change:** every "Start a Conversation" button links to the Start a Conversation page through the owner-created
Custom Value `{{ custom_values.bwci_url_start_a_conversation }}` (link key `startAConversation`). "Contact" links keep
`{{ custom_values.bwci_url_contact }}`. Contact's four route buttons add `#smes`, `#investors`, `#banks`, `#partners`.
The old section key `startConversation` (home `#bwci-cta`) and the named survey key `contactSurvey`
(`{{ custom_values.contact }}`) are no longer used by any page.

**Revision:** branch `claude/wonderful-ptolemy-k1o60k`, from main `8d2d3cb`. All 35 generated pages rebuilt; Main's two
outputs edited by hand. QA is **local only** (headless Chromium, network blocked); live GHL is **NOT VERIFIED**.

| Check | Script | Result |
|---|---|---|
| Before/after preservation, 72 outputs: CSS, non-link settings and all text identical; only link names change, and only on "Start a Conversation" buttons and Contact's four routes; the inlined section list loses `startConversation` (Contact's also gains its four routes) | `preserve.js <baseline-repo-root> <repo-root>` (baseline = outputs of `8d2d3cb`) | PASS — [preserve-results.txt](preserve-results.txt) |
| Browser, 72 outputs, GHL substitution modelled with test URLs: every "Start a Conversation" link resolves to the Start a Conversation value (routes with their hash; Investors & Partners and SMEs hero buttons still jump to their own closing section); every "Contact" link resolves to `bwci_url_contact`; no link reaches the survey value; no script errors. Unset value (`#`): the buttons are disabled, "Contact" stays live | `NODE_PATH=$(npm root -g) node browser.js <repo-root> <tmp-dir>` | PASS — [browser-results.txt](browser-results.txt) |
| Shared mapping unit test (owner-created value, route sections, no survey/home-section keys) | `node ghl/shared/site-links/qa/unit.js` | PASS, 209 checks — [unit-results.txt](unit-results.txt) |
| Page config QA with the renamed keys: Contact (disabled click, Banks route navigation, copied root with the value unset); Platforms, Investors & Partners, SMEs & Projects (link override) | each page's `_build/config-qa.js` / `config.js` / `config-and-url.js` | exit 0, no errors — `page-config-qa-*.json.txt` |
| All 35 builders (their own link/config guards) | `node ghl/pages/<slug>/_build/build.js` | PASS |
| `scripts/tests/footer-route-compatibility.js`, `ghl/shared/site-images/qa/unit.js` | — | PASS |

`ghl/shared/site-links/qa/static.js` is the October migration's comparison against its own baseline checkout and was
not rerun. No pixel comparison was needed: the preservation check shows CSS and markup are unchanged apart from link
names, so the pages render exactly as before.
