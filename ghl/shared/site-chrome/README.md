# Shared site chrome (development only)

Generator for the header, mobile drawer, breadcrumb and footer that every GHL page port pastes in,
plus the shared design-system CSS and scroll motion. **Nothing here runs in GoHighLevel**: each page's
build inlines the generated markup, CSS and JS into its own pasteable block, scoped to that page's
root and class prefix. A pasted page never loads a file from this folder.

```
ghl/shared/site-chrome/
├── site-chrome.js           ← generator: require(...)({ prefix, current, breadcrumb, label, govnav, content, people, rename, system, links })
├── site-chrome.runtime.js   ← vanilla runtime template (__P__ = page prefix), inlined into each page script
├── site-chrome.govnav.js    ← GovNav runtime part, appended only for pages with a govnav option
├── site-chrome.people.js    ← person-card runtime part (portraits, profile links), appended only with people:true
├── assets/bwci-logo.png     ← logo (640×153) — upload once to GHL Media Storage, set logoImage in each page
└── qa/
    ├── chrome-behaviour.js  ← same header/drawer/sticky/footer/motion script on a source page and a port
    ├── chrome-lifecycle.js  ← historical page lifecycle harness
    └── sync/               ← current all-23-page synchronization checks and verification report
```

## What it reads from design/ (at build time)

| Source | Output |
|---|---|
| `SiteHeader.dc.html` — CSS and the `NAV` / `UTIL` data of its `text/x-dc` component | Utility bar, main nav with dropdowns, mobile drawer with accordions (`.<prefix>-hdr`) |
| `SiteFooter.dc.html` — CSS and link columns | Footer (`.<prefix>-sft`), legal line and optional regulatory line from config |
| `Breadcrumb.dc.html` — `TRAILS` and inline styles | Breadcrumb for inner pages (inline styles kept, hover/focus reproduced) |
| `bwci-system.css` parts A, A2, B, D | Tokens, type scale, buttons, badges, font floors (pruned per page; `system:false` skips it) |
| `bwci-system.css` parts C, E (`content:true`) | Content-page components and the governance hero, for the `.bw` pages (Governance, …). `.bw` is the widget root (class `<prefix>-bw`), so each selector gains the root id and keeps its class count |
| `GovNav.dc.html` (`govnav: 'hub' \| 'board' \| 'leadership'`) | Governance section bar: sticky list ≥ 768 px, native select below (matchMedia, as the source), hover/focus as the source's `style-hover` / `style-focus` rules. On the hub the framework item is the in-page `#<prefix>-framework` |
| `bwci-motion.js` | `siteMotion()`: root-scoped port of the scroll reveal (scans at 300/1200/2600 ms after load) |
| `PersonCard.dc.html`, `bwci-people.js`, `image-slot.js` (`people:true`) | `personCard(slug, from)` renders a card as the source does (name and roles in `.<prefix>-i` spans, empty values included); the portrait is a `.<prefix>-slot` block with the image-slot's own styles, placed at its default framing (cover at scale 1, centred, refitted on load and resize). The page config holds `peopleImages.<slug>` and one profile link key per person (`profile` + slug in camel case, e.g. `profileFarhadReyazat`); the runtime appends `?from=<page>` to configured profile routes. `people` lists each person's key and portrait file for the page build |

Every design `href` maps to a config link key (`HREF_KEYS`). An unknown href fails the build, so a
new destination in the design cannot ship without a config key.

### October 26, 2026 export compatibility

`Better%20World%20Impact.dc.html` maps to **`betterWorldImpact`**, default `#` until its published
destination is verified. The old **`impact`** key still maps `Main.dc.html#impact` to `/#bwci-impact`;
Main's same-page override retains its original meaning. Do not repurpose an existing `impact` value.
The unknown-link guard remains enabled (`corporate-ir/_build/static-checks.js` exercises it with
an in-memory unknown destination).

All **23** page consumers now include the independent Impact header/drawer/footer link: 22 build-based
ports were regenerated, and Main's two direct-edit blocks were synchronized manually. All 16 original
configs add `betterWorldImpact: "#"` while preserving their exact old `impact` values. The generator
exports `legacyLinkKeys: ['impact']` so the 15 older builds retain that one inactive compatibility
setting. Missing keys and every other unused key still fail; unknown design hrefs still fail. The seven
newer page configs do not acquire an unnecessary legacy key. Existing installed GHL blocks require
repasting; editing this generator does not update them.

Corporate / IR's six views have independent configurable page URLs. Overview uses Breadcrumb `ir`
(Home → Corporate/IR); each subpage uses `breadcrumb: 'ir', label: <source label>` for the three-item
trail, with the middle link configured through `links.corporateIR`. Impact uses Breadcrumb `impact`.
Profile/other trails keep their existing markup. Current evidence is in
[`qa/sync/verification.md`](qa/sync/verification.md); page-local assertions against earlier shared
revisions remain historical checks, not current synchronization evidence.

## Link defaults and unresolved routes

Ported pages use their GHL paths: `home` `/`, `financialEngine` `/financial-engine`, `ecosystem`
`/ecosystem`, `platforms` `/platforms`, `smes` `/smes-projects`, `investors` `/investors-partners`,
`today` `/#bwci-today` (Main overrides it with a same-page anchor). The retained legacy `impact`
setting is `/#bwci-impact` (`#bwci-impact` on Main), currently unused by the header/footer.

Everything else defaults to `#` and is listed as **unresolved** in each page README until a live GHL
URL exists: `whoWeAre`, `whoPurpose`, `whoRole`, `whoPrinciples`, `whoStory`, `leadership`,
`privateInvestors`, `governance`, `governanceBoard`, `governanceFramework`, the `profile…` keys, `corporateIR`, `contact`, `verify`, `legalPrivacy`, `legalTerms`,
`legalCookies`, `legalDisclosures`, `legalAccessibility`, `legalSitemap`, `betterWorldImpact`. Set them in each page's
config `links` once the pages exist (no URL is invented here).

## Runtime behaviour (matches SiteHeader / SiteFooter)

- Dropdowns open on hover only for `(hover:hover)` pointers and close 160 ms after leaving; click and
  keyboard open them (ArrowDown/Up/Home/End move through items, Escape closes and returns focus);
  focus leaving or a mousedown outside closes them.
- Drawer below 1280 px: focus moves to the close button, Tab is trapped, Escape and the links close it,
  accordions start open for the current section, the body scroll is locked and restored to the host's
  own `overflow` value, and the drawer closes when the viewport grows to ≥ 1280 px.
- Sticky state is measured relative to the page root, so content above the widget in GHL does not
  break it; `--util-h` / `--nav-h` are set on the root.
- Config: `logoImage`, `showHeader`, `showFooter`, `footer.{regulatoryLine, registeredJurisdiction,
  companyNumber, registeredOffice}`, `links.*`. Placeholder URLs are never requested.
- Unavailable routes (`#`, placeholders, unsupported schemes) normalize to `#`, gain disabled state,
  and announce an accessible status without jumping. Valid configured routes clear copied disabled
  attributes. Delegated checks preserve the actual href of later-rendered profile cards, including
  query/hash and `?from=` context. A page-owned status is reused; otherwise chrome owns one.
- Copied regulatory footer lines are removed before rendering the configured line once. GovNav's
  unavailable options are disabled, and a newly configured option loses its stale unavailable label.
- Each page owns one child-list observer for root/ancestor removal and delayed insertion, with one
  scheduled boot frame and no polling. Repeated execution reuses that owner. Replacement tears down
  feature/shared handlers before mounting the new root, even without scroll/resize. Explicit destroy
  disconnects the owner and restores body overflow; non-persisted `pagehide` also destroys it.

## Changing the header or footer

1. Update the design (`design/SiteHeader.dc.html`, `SiteFooter.dc.html`, `Breadcrumb.dc.html`).
2. Migrate affected link config keys, then rebuild every page: `node ghl/pages/<slug>/_build/build.js`
   for all 22 build-based pages. Main has
   no build folder: generate its parts with `require('./ghl/shared/site-chrome/site-chrome')({ prefix: 'bw',
   current: 'home', breadcrumb: null, system: false, links: { impact: '#bwci-impact', today: '#bwci-today' } })`
   and replace the header, footer, chrome CSS and `SHARED SITE CHROME` script section in both
   `main*.ghl.html` files by hand, keeping them identical.
3. Follow `qa/sync/verification.md` for current preservation, route/lifecycle, hosted-image and Main
   CTA checks. Run source/port behavior and the full responsive/page-specific regression appropriate
   to the next change. The synchronization report is not the final website regression stage.

## Profile ports (development only)

`site-chrome.profile.js` consumes the actual `design/GovProfile.dc.html` template and `bwci-people.js`, using the existing chrome generator for header/footer, Breadcrumb, GovNav, cards and system CSS. It expands the five profile loops at build time, preserves empty source fields and source copy, excludes the current person from related Board cards, and returns `hero`, `biography`, `related`, `chrome`, `runtime` and `imageSlugs`.

```js
const profile = require('../../../shared/site-chrome/site-chrome.profile')({
  slug: 'farhad-reyazat', prefix: 'pfr', rename: pageClassRename,
});
```

The existing chrome generator accepts opt-in `breadcrumb: 'gov-profile', profile: {name, via}` to produce the source's four-item profile trail. Existing breadcrumb options are preserved; the profile's historical `_build/shared-regression.js` compares generated markup, CSS, runtime, routes and cards against base `05e32a1`. The current all-page synchronization intentionally updates embedded shared runtime. `loadPeople()` is exported only for development generators.

`site-chrome.profile.runtime.js` is inlined by the page build. It selects Board/Leadership breadcrumb and GovNav from `?from=`, using Board membership for the default, before applying route config and binding GovNav. It implements the source's 6px mouse-drag threshold, pointer capture, click suppression and cleanup. Native touch scrolling/snap remains in the source system CSS. Each person keeps a separate page folder, editable `_build/src/` files, prefix/root/config and hosted/inline outputs; neither shared profile file is fetched in GHL.

First consumer: `ghl/pages/profile-farhad-reyazat/README.md`, including current local browser evidence, actual route/image configuration and publication limits. Shared synchronization evidence for all seven profiles is now in `qa/sync/verification.md`.
