# Better World & Impact — regeneration update (review prototype)

**Status: review prototype only.**
- Not published and not a GoHighLevel deliverable.
- `design/` and `ghl/` are unchanged.
- Editorial and approval items are in [REVIEW-NOTES.md](REVIEW-NOTES.md).

## What it is

The current Better World & Impact page with five new sections between its existing hero and its closing CTA:

| # | Section | Id | Composition |
|---|---|---|---|
| — | Header, breadcrumb, hero | unchanged | the current GHL port |
| 1 | What we mean by regeneration | `#bwi-regeneration` | heading and intro beside numbered rows (Natural, Economic, Social) with fine dividers; a three-loop renewal mark; the capital-structure statement and a compact "For example:" note beneath |
| 2 | Our approach: impact built into the architecture of capital | `#bwi-approach` (the hero's "Our approach ↓" target) | three moments on a descending staircase line ending in an arrow; vertical rail on tablet and phone; labelled "Copy pending" placeholders with no fixed height |
| 3 | Regeneration is part of the cycle, not an add-on | `#bwi-engine` | white section; explanatory copy as an "Awaiting alignment" placeholder; the **existing interactive Financial Engine component** (same stages, behaviour and "How the Financial Engine works →" link), without its "Impact considered" tags |
| 4 | Three returns from every cycle | `#bwi-returns` | three equal open columns on one fine rule, with vertical separators; stacked with a node marker on tablet and phone |
| 5 | How we will measure them | `#bwi-measure` (inset in 4) | softly tinted panel, "In development" status label (text plus marker, not colour alone), exact supplied copy, a small dot pattern kept clear of the text (hidden below 1024 px) |
| — | Closing CTA, footer | unchanged | the current GHL port |

Design language: the page's own tokens, fonts, type scale (`h1`, `lead`, `eyebrow`), containers, section spacing,
radii and status colours. Only the accents (gold numerals, emerald and ink lines) are new; there are no shadows on
the new sections. Motion is the site's own reveal (`siteMotion`): content is visible without JavaScript, reduced
motion is respected, and there is no scroll hijacking or looping animation in the new sections.

## Files

- `src/sections.html`, `src/sections.css`: the five sections (the only new design code).
- `build-review.js`: runs the page's own build (`ghl/pages/better-world-impact/_build/build.js`) in memory with
  these sections in place of the middle of the page, then writes `out/prototype.html`. Production outputs are not
  written.
  - It inserts the existing Financial Engine markup from the port's source.
  - It fails if the expected anchors or the three tags are not found.
- `out/prototype.html`: the self-contained prototype (embedded images; fonts from Google Fonts). Open it in a browser.
- `screenshots/`: desktop 1440 and mobile 390 full pages, plus the new sections at 1440, 768 and 390.
- `qa/shoot.js`, `qa/report.json`: the checks below.

```
node review/better-world-impact-regeneration/build-review.js
npx http-server -p 8123 -s -c-1 .     # then, from review/better-world-impact-regeneration/qa:
NODE_PATH=$(npm root -g) node shoot.js http://localhost:8123/review/better-world-impact-regeneration/out/prototype.html <outDir>
```

## Local checks (14 November 2026, headless Chromium, local server; not a GHL page)

- **Overflow and errors:** no horizontal overflow and no script or console errors at 320, 360, 375, 390, 430, 768,
  1024, 1280, 1440 and 1920 px.
- **Containment:** no text box leaves its section.
- **The dot pattern:** it overlaps no text at any width.
- **Font sizes at ≤ 767 px:**
  - the new sections' body text is at least 16 px;
  - labels (mono or uppercase) are at least 14 px;
  - the only 14 px non-label text is the existing engine's stage subtitle (`.lp-s`), unchanged.
- **Headings in order:** h1 (hero) → h2 per section → h3 for rows, moments, returns and the measurement panel.
- **Reduced motion (390) and JavaScript off (1440):** every heading and paragraph of the new sections is visible.
  The only hidden text is the engine's closed stage panels, which is the existing behaviour.
- **Not checked:** physical devices, a live GHL page, or screen-reader output.
