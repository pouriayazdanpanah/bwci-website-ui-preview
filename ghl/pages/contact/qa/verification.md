# Contact — local verification (2 November 2026)

- **Revision:** branch `feat/ghl-contact`, based on main `ee5629c` (design export `df79d85`, which added `design/Contact.dc.html` with `contact-hero-hands.png`).
- **Environment:** headless Chromium (Playwright) against a local `http-server` at the repo root.
  - The source is rendered through `design/support.js`, with React served from `design/vendor/`.
  - The real Google Fonts loaded.
  - Pixel diffs use Python 3.11 with numpy and Pillow (threshold 24/255 per channel).
- **Scope:** this is local QA, not a published GHL page.

## Source fidelity

| Check | Result |
|---|---|
| Full-page pixel diff, 13 widths (320, 360, 375, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920, 2560) × 900 px, reduced motion | 0.000 %, 0 differing rows at every width |
| Full-page pixel diff, 320/390/768/1024/1440/1920 × 600 px and × 1200 px | 0.000 % |
| Full-page pixel diff, motion on, 390 and 1440 | 0.000 %, 0 rows |
| Landscape phones 844×390 and 568×320 | 0.000 %, 0 rows |
| Props flipped (`showVisitorOffice` and `showPam` off, `showMap` on; source defaults rewritten by `SRC_PROPS`), 320/390/768/1024/1440/1920 × 900 | 0.000 %, 0 rows |
| Page height (px), 320 → 2560 at 900 | 5128 · 4969 · 4879 · 4861 · 4738 · 4091 · 2995 · 3251 · 3346 · 3361 · 3361 · 3361 · 3361, identical to the source |
| Horizontal overflow / console errors | none at any width, in either page |
| DOM box and style walk of the five sections, header and footer | 0 differences at 1440, 1024, 768, 390 and 320; 0 with the props flipped at 1440 and 390 |

One capture at 320×600 showed 3 differing rows. Two repeat captures of both pages had 0, and the first port capture differed from a later port capture by the same 3 rows (capture noise).

## Behaviour (`_build/behaviour.js`, 53 trace lines, source vs port)

Identical in two consecutive runs. Covered:
- **Copy buttons:**
  - each of the five: `data-copied`, `aria-label`, both icon opacities, the live message and the clipboard text;
  - the reset 1.6 s after the last click;
  - a second click restarting the timer, and another button taking over;
  - Enter and Space on a focused button;
  - the icon transitions.
- **The "Contact details" jump** at 1440×900 and 390×844: it is still moving after 150 ms, then settles at the same scroll position and section offset, with the same hash and focus.
- **The registered-office panel:** sticky at 1440 px, not sticky at 1023 px.
- **Hover states** (fine pointer), with before/after colours, borders, transforms, shadows and transitions: both hero buttons, an enquiry route (its title, arrow circle and arrow), the router button, both kinds of copy button, a channel and its link, "Company information", the Providence Asset Management button and its icon, "Verify a Communication", the next-step button and links.
- **Keyboard order** from the hero through the router, and through the registered office and directory copy buttons, with visible outlines.
- **The hero image drift:** `ivDrift`, 14 s, ease-in-out, infinite, alternate at 1440; none at 390, where the image is a cover.
- **Live resize** across 1100, 1024/1023, 900/899, 768/767, 641/640, 561/560, 360 and 1600 px: the hero, router, directory, channels, Providence Asset Management panel, note and links, and no horizontal overflow.
- **Reduced motion:** no drift, no route title slide, the copy icons swap without transform or blur.

**Note on the trace script.** Samples are taken after the 0.2 s icon fade has settled: a first run sampled two states mid-fade, where the opacities differed in the third decimal between runs.

## Shared chrome

- **`ghl/shared/site-chrome/qa/chrome-behaviour.js`** (now normalising `cnt-`): the 64-line header/drawer/dropdown/sticky/footer/motion trace is identical to the source (only the `src`/`port` label line differs).
- **`ghl/shared/site-chrome/qa/chrome-lifecycle.js contact cnt …`:** pass, no errors.
  - Config keys and logos; hosted placeholders (no request; 4 images without `src`: three logos and the hero).
  - Hostile host at 1440 and 390: one instance, no overflow, re-attached, body overflow restored, nothing left hidden.
  - Reduced motion: 5 "invisible" elements, which are the copy buttons' tick icons waiting for a click (`opacity: 0`, the same 5 in the source). Nothing is translated.

## Configuration (`_build/config-qa.js`)

- **Literal merge fields, every value `#`, every value empty:**
  - every page link is `#` with `aria-disabled`, including the seven survey links, the three emails and the phone;
  - the hosted block makes **0 image requests**, with the hero hidden and the logos without `src`;
  - the inline block shows the original hero (1774 px) and logo from `imageFallbacks`;
  - no raw `{{ }}` reaches the page.
- **Synthetic values, both variants:**
  - the survey (`contact`) → the seven "Start a Conversation" links;
  - `mailto:` / `tel:` values → the email and phone links;
  - the hero and logo load from their URLs (2 image requests in the hosted block);
  - the header and footer "Contact" links → `bwci_url_contact`.
- **Copy buttons:**
  - unset: `09881564`, `[email]`, `[phone]`, `[email]`, `[email or registrar details]` (as the source);
  - set: `09881564`, `hello@example.test` (from `mailto:hello@example.test?subject=Enquiry`), `+44 20 7946 0000` (from `tel:+44%2020%207946%200000`), `press@example.test`, `ir@example.test`;
  - an empty `mailto:`, a `javascript:` value or an `https:` value copies the placeholder.
- **Clicks:** a disabled survey link does not navigate and carries the title "Not yet available"; an enabled one opens the survey URL.
- **Props:**
  - default: visitor block shown, map hidden, Providence Asset Management panel shown;
  - flipped: the opposite;
  - string values (`"false"`, `"true"`) keep the defaults.
- **Hostile host** (generic CSS including `button`, `address`, `img`, lists and spans; content above and below; the script executed twice), at 1440 and 390:
  - one owner;
  - the copy buttons stay 44×44 with their own colours;
  - the address is upright with no margin;
  - copying works and is announced;
  - "Contact details" lands the section below the sticky header (93 / 85 px);
  - no horizontal overflow.
- **Copied live root mid-copy**, with a changed config (`showPam` off, `showMap` on, survey `#`, a new media email):
  - starts with no button copied and an empty message;
  - the new props and links are applied;
  - one owner on the new root;
  - the old timer does not touch it;
  - copying uses the new address.
- **Teardown mid-copy** leaves no instance, and the pending timer does nothing. **`pagehide`** removes the app and its init marker.
- **No Clipboard API:** the button still shows "Copied" and the message, as in the source.
- **No IntersectionObserver:** the props apply and nothing is hidden except the 5 tick icons.

## Shared entries

- `ghl/shared/site-images/index.js`: `contactHeroImage` → `bwci_img_contact_hero`, page-only and declared by this page's build. It is also in `bwci-image-custom-values-to-create.json` (now 13 keys).
- `ghl/shared/site-links/index.js`:
  - proposed `bwci_url_contact_email`, `bwci_url_contact_phone`, `bwci_url_media_email`;
  - `named`: `contactSurvey` → the existing `{{ custom_values.contact }}`.
- All 28 other generated pages rebuild byte-identical to main `ee5629c`; Main is untouched. No other installed block needs re-pasting.
- `ghl/shared/site-images/qa/unit.js`: PASS (408 checks), including the frozen shared list. `ghl/shared/site-links/qa/unit.js`: PASS (214 checks, two new for the named and proposed lists).

## Not verified

- GHL substitution of Custom Values inside `application/json`, and cache propagation.
- The survey form's behaviour after the link: it is an external page.
- Clipboard behaviour in real browsers on a published page (permissions differ by browser), physical devices and the published page.
- The proposed `bwci_img_contact_hero`, `bwci_url_contact_email`, `bwci_url_contact_phone`, `bwci_url_media_email` and `bwci_url_providence_asset_management` do not exist in the account yet; `bwci_url_ir_email` and `bwci_url_contact` were `#` in the supplied export.
