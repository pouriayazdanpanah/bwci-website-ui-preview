# Verify a Communication — GoHighLevel port

This is a port of `design/Verify a Communication.dc.html` (design export `37102cf`, 28 October 2026) to one GoHighLevel
Custom Code block. The block includes the shared header, breadcrumb and footer. It was built on branch
`feat/ghl-verify-a-communication`, from main `dd1a06b`. Merging and live GoHighLevel installation are separate steps.

## Files

| File | Use |
|---|---|
| `verify-a-communication.ghl.html` | **Production block** (107 KB). The logo comes from the shared Custom Value. The page has no other images |
| `verify-a-communication.inline.ghl.html` | Self-contained block (153 KB). It carries the same reference, plus the original logo as `imageFallbacks` |
| `_build/` | Development only: `src/` (page CSS, markup, runtime, config), `build.js` and the QA scripts. Nothing here runs in GoHighLevel |
| `qa/verification.md` | Local QA record for this revision |

## Installation in GoHighLevel

1. Create the page in GoHighLevel with one full-width section, no padding, and one **Custom Code** element.
2. Paste the whole of one block. Keep the config id `bwci-verify-a-communication-config` and the JSON structure.
3. Set the page title to "Verify a communication — Better World Capital Investments PLC" (the source `<title>`).
4. Set this page's URL in the existing Custom Value `bwci_url_verify`. Every page's header and footer already link to it, and so do the Corporate / IR overview and Main.
5. Check the published page: links, the Copy button, the header and drawer, and the layout on a phone.

No new Custom Values are needed.

## Configuration — the JSON block at the top of the paste

| Property | Default | Notes |
|---|---|---|
| `logoImage` | `{{ custom_values.bwci_img_logo }}` | The existing logo shared by every page |
| `showHeader` / `showFooter` | `true` | As on every page |
| `showFlags` | `false` | Source prop. Shows the review badges ("To confirm", "Copy to approve", "Wording + FRN to verify", …) next to the placeholders |
| `showFormerName` | `true` | Source prop. Shows the optional "Former name" row of the official channels |
| `showAlerts` | `false` | Source prop. Shows the phase-2 "Known impersonation alerts" table |
| `footer.*` | `""` | Optional legal wording, as on every page |
| `links.*` | 25 references | From the shared mapping (`ghl/shared/site-links`); the build fails if one differs. The page's own links are `contact` (Start a Conversation, Contact us) and `corporateIR` (Regulatory information, Company information) |

A non-boolean prop value falls back to the source default.

The external links are fixed public addresses taken from the source, as in the Corporate / IR port:
- the FCA Register (`https://register.fca.org.uk/`);
- Action Fraud;
- the FCA Consumer Helpline;
- `mailto:report@phishing.gov.uk`.

The web links open in a new tab. The page's own contact details (domains, email, phone, office, social and messaging) are placeholders in the design and stay text. They are not linked to the `verifyEmail` / `verifyPhone` values that the Corporate / IR overview uses.

## Sections and interactions reproduced

1. **Hero** (`#vfc-top`): the governance `pg-hero--in` ground and entrance, the breadcrumb (Home › Verify a Communication), the heading, the placeholder sub-heading and lead, and the shield tile in a right column. At ≤767 px the shield moves above the heading at 64 px.
2. **Quick check** (`#vfc-check`):
   - The card overlaps the hero by −88 px, or −56 px at ≤640 px.
   - The four steps sit in 4, 2 or 1 columns, with connector lines.
   - Hovering a step fills its number.
   - The links on steps 1 and 2 scroll smoothly to the channels and "never" sections; focus is released and the hash is updated.
3. **Official channels** (`#vfc-channels`): the heading column is sticky at ≥1024 px (top 132 px). Below it are six placeholder rows plus the optional former-name row. Rows highlight on hover.
4. **What we will never do** (`#vfc-never`): five items that shift 3 px on hover.
5. **Group entities and regulated activity** (`#vfc-regulated`): a dark panel with the placeholder wording, the FCA Register link and Regulatory information.
6. **Report a suspicious communication** (`#vfc-report`): the two cards and the bank warning.
   - **Copy** writes `report@phishing.gov.uk` to the clipboard when the browser allows it.
   - Whether or not it was allowed, the button shows "Copied" for 1.8 s, with `data-done="true"` and the aria-label "Copied report@phishing.gov.uk".
   - A second press restarts the timer.
7. **Known impersonation alerts** (`#vfc-alerts`): only shown with `showAlerts`. The table becomes stacked rows at ≤640 px.
8. **Next step** (`#vfc-next`): "Start a Conversation", Contact us and Company information.

The shared scroll motion scans every section, including the hero, as bwci-motion does for a `pg-hero` page. The shared header, drawer and footer behave as on every page. Reduced motion stops the item shift and the button press scale.

## How it is built

`node ghl/pages/verify-a-communication/_build/build.js` generates both blocks from `_build/src/` and the shared chrome:
- The CSS is scoped to `#bwci-verify-a-communication`, and unused selectors are pruned.
- Every source class and id carries the `vfc-` prefix. No other page links into these sections.
- The source's `.bw` wrapper is the root (`:scope.vfc-bw`), and the source's exact `:root` tokens are used.
- The font link is the source's, including Plus Jakarta Sans **800**, which `.bank` uses.
- The build checks that every link value equals the shared mapping's reference, and that the output contains no Claude Design or local paths.

This port changes no shared production code. The only shared file touched is `ghl/shared/site-chrome/qa/chrome-behaviour.js`, a QA script whose class normaliser now also strips `vfc-`.

## Validation (local, headless Chromium — not a published GoHighLevel page)

This is local QA with the real web fonts loaded. The full record is in [qa/verification.md](qa/verification.md).
- **Pixels:**
  - 0.000 % against the source, with no differing rows, at all 13 widths (320–2560) at 900 px height;
  - at six widths at 600 and 1200 px;
  - with motion on at 390 and 1440;
  - with the three props flipped, at six widths.
  - Page heights are identical, with no horizontal overflow and no console errors.
- **DOM:** a box-and-style comparison of every section, the header and the footer shows 0 differences at 1440/1024/768/390/320 with the defaults, and at 1440/768/390 with the props flipped.
- **Behaviour trace:** identical to the source (68 lines). It covers the hero, cards, sticky heading, all hovers, the step anchor, the Copy button (allowed and denied clipboard, second press, keyboard, focus ring), phones, live resize and reduced motion.
- **Shared chrome trace:** the header, drawer, footer and motion trace is identical. The lifecycle suite passes.
- **Config:** literal, `#`, empty and resolved values in both blocks:
  - unset links are disabled and don't navigate;
  - the hosted block requests no images until the logo is set;
  - the inline block falls back to the embedded logo, and no raw merge field reaches the page;
  - a copied root applies its new links and props and resets the Copy state;
  - a pending Copy timer is cleared on teardown.

## Intentional differences and source quirks

- Unset destinations are marked unavailable instead of linking to design files. All 43 existing link values are `#` in the supplied export.
- Smooth scrolling for the in-page step links is scoped to the widget; the source set it on `html`.
- The `.bw` paint-hold rule is omitted, because the system CSS is inline.
- The placeholder copy is kept exactly as designed: the bracketed sub-heading, lead, channel values, regulatory wording, report email and alert rows. Final wording and contact details need approval before launch.
- "Regulatory information" goes to the Corporate / IR page, as in the source, not to its `#regulatory` view.

## Rebuild and test

```bash
node ghl/pages/verify-a-communication/_build/build.js && node ghl/pages/verify-a-communication/_build/make-previews.js
# local server at the repo root (npx http-server -p 8123 -s -c-1 .), NODE_PATH=$(npm root -g), Python with numpy + Pillow:
S="http://localhost:8123/design/Verify%20a%20Communication.dc.html"; P="http://localhost:8123/ghl/pages/verify-a-communication/_build/preview/plain.html"
node ghl/pages/verify-a-communication/_build/shoot.js "$S" /tmp/src && node ghl/pages/verify-a-communication/_build/shoot.js "$P" /tmp/port && python3 ghl/pages/verify-a-communication/_build/diff.py /tmp/src /tmp/port
node ghl/pages/verify-a-communication/_build/domdiff.js "$S" "$P" 390
node ghl/pages/verify-a-communication/_build/behaviour.js "$S" src > /tmp/a; node ghl/pages/verify-a-communication/_build/behaviour.js "$P" port > /tmp/b; diff /tmp/a /tmp/b
node ghl/shared/site-chrome/qa/chrome-behaviour.js "$S" src   # and "$P" port, then diff
node ghl/shared/site-chrome/qa/chrome-lifecycle.js verify-a-communication vfc http://localhost:8123/ bwci-verify-a-communication bwci-verify-a-communication-config
node ghl/pages/verify-a-communication/_build/config-qa.js http://localhost:8123/
```

To compare the flipped props, write `_build/preview/source-props.html` (the source with `<base href="/design/">` and
the three prop defaults flipped) and `_build/preview/props.html` (the inline block with the same three config values).
Both live in the git-ignored preview folder; see `qa/verification.md`.
