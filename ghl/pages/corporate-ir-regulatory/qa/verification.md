# Regulatory — current local verification

**Final result: PASS.**

Run date: October 26, 2026. Reference: `design/Corporate IR.dc.html#regulatory` at merged main
`53f0457` after Shareholders PR #31. Chromium 154.0.8037.57 via Playwright on Linux. Source React
is routed from existing local vendor files only for QA. Google Fonts requests are deliberately
aborted on both sides; comparisons use identical fallback fonts. No historical result is used to
pass this page. Design files, shared generators and all 20 earlier output blocks remain unchanged.

## Responsive and visual matrix

Source, inline and hosted output are compared across 23 cases. Default reduced-motion widths are
320,360,375,390,430,768,1024,1099,1100,1101,1280,1366,1440,1600,1920 and 2560px at 900px height.
Additional cases: 390×600, 1024×1200, 1440×600; normal motion at 390×900 and 1440×900; flags off
at 390×900 and 1440×900. Hosted tests point at the identical local supplied logo through a test-only
config override. Production settings remain unconfigured.

The unmodified source clips the perimeter approval badge at 320/360/375px and the relationship
approval badge at 320/360px. The port preserves all wording and constrains the block badges to their
containers with wrapping; this also restores the perimeter card's intended inner padding at 390px.
Every raw source capture is retained. A second reference applies only:

```css
.ir-tc--blk { max-width:100%; white-space:normal; }
.ir-tc--blk::before { flex:none; }
```

The port is compared separately against that documented correction and the untouched source.
`results.json` records both comparisons and raw/source section geometry. A changed raw image is
not labelled pixel-identical. Source content, table layout, other styles and visibility are not
rewritten. The capture helper scrolls through content and verifies ancestor opacity without forcing
visibility. Flags-off cases set only the corresponding source review prop. The source's visible
mobile table headers are preserved.

All **23 cases PASS**, with matching corrected-reference section geometry/page heights, no
horizontal document overflow and no clipped approval badges. **All 46 output/reference comparisons
are pixel-identical.** Against the unmodified source, **34/46 are pixel-identical**; the other **12**
are the documented narrow-badge wrapping differences (320/360/375/390 at the default height, 390×600
and 390 with normal motion, both variants). No unexpected difference remains. Matrix and functional
runs have zero JavaScript/console errors or unexpected network failures. Bulk screenshots/raw logs are ignored under
`_build/qa-output/`; plain/hostile wrappers are ignored under `_build/preview/`.

## Functional, lifecycle and compatibility evidence

| Check | Result / scope |
|---|---|
| Regulatory only: hero + perimeter, authorised entity and proposed institutions | PASS; no other Corporate / IR view embedded |
| Exact source names, perimeter statement, placeholder relationship/FRN/permissions/date and proposed status | PASS; six authorised-table headers/cells and both two-row tables |
| Two review badges; flags off preserves placeholders and proposed status; malformed JSON | PASS in inline/hosted checks; fresh-block defaults retained |
| Unconfirmed register-entry URL | PASS; default `#`, unavailable ARIA/title/status, keyboard activation causes no jump or blank tab |
| Configured register entry | PASS; local fixture opens a separate tab with `window.opener === null`; real entity entry NOT VERIFIED |
| Home → Corporate/IR → Regulatory information breadcrumb; current nav/native selector | PASS |
| Actual independently configured page navigation, mobile selector and Impact destination | PASS; distinct local destinations, no source hash-view switching |
| Focus outline, hover, touch/Escape menu, sticky/live breakpoint resize and header/footer toggles | PASS |
| Long regulatory table copy and scoped same-page anchor | PASS; no document overflow |
| Copied root with new register/page destinations | PASS; valid links lose stale disabled/title attributes; enabled native option loses copied unavailable label |
| Copied optional footer regulatory line | PASS; exactly one line after replacement |
| Duplicate execution, replacement with drawer open, exact prior body-overflow restoration and teardown | PASS; one owner/status and working replacement menu |
| Hostile global CSS and surrounding host content | PASS; scoped alignment/font/background and no horizontal overflow |
| Functional JavaScript/console errors/unexpected failed requests | PASS; zero; deliberate Google font aborts disclosed/excluded |
| Standalone scoped/prefixed output, JS syntax, route keys, supplied logo equality and labelled breadcrumb | PASS |
| Safe JSON script embedding | PASS; in-memory closing-script fixture round-trips without executing markup or editing settings |
| Shared generator vs main `53f0457`, 20 existing contexts | PASS; markup/CSS/runtime/routes/dynamic classes byte-identical; unknown-link guard still throws on its in-memory fixture |
| Existing 20 delivered blocks at 390/1440px | PASS; 40 current smoke cases for visible h1, overflow and JavaScript errors |
| Reproducible outputs and whitespace | PASS; both variants rebuild byte-identically; Git whitespace clean |

This earlier-page smoke is not the later full shared-output migration/interaction/visual regression.
The baseline generator was exported with Git and passed as a file when the runner could not spawn
Git directly. Aggregate measurements are recorded in `results.json`; reproduction commands are in
the page README.

## NOT VERIFIED / differences

- Published GHL installation/runtime and host ancestor conditions for sticky positioning.
- Actual Google Fonts delivery/layout, hosted logo/page URLs and SEO settings.
- The legal accuracy/approval of the source perimeter statement, entity name/authorisation,
  relationship, regulator, FRN, permissions, proposed status/availability, update date and footer wording.
- Real FCA register entry or its contents. The source's generic register homepage is deliberately
  replaced by an explicit unconfigured exact-entry setting. Local fixtures verify behavior only.
- Legal Notices, Better World & Impact, Main/shared synchronization and the full affected-page
  regression, including older copied-link/footer/option-state normalization.

Architecture changes: one independent Regulatory block replaces a source hash view; native options
contain plain text; inline CSS removes the delayed paint hold. The two narrow approval badges wrap
without changing text. Root replacement normalizes copied unavailable states and optional footer.
Hiding review badges does not confirm the source's statements or placeholders.

Stop at this page's PR. Legal Notices begins after confirmed merge and refreshed main.
