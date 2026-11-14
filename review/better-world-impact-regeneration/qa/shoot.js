// Dev-only QA for the review prototype: screenshots and layout checks.
//   NODE_PATH=$(npm root -g) node shoot.js <prototypeUrl> <outDir>
// - full-page captures at desktop, tablet and phone widths (after scrolling through, so every reveal has run);
// - per width: horizontal overflow, script errors, the smallest font size and the text boxes that leave their section
//   in the five new sections, text overlapping the decorative dot pattern, and every heading in order;
// - reduced motion and JavaScript off: the new sections' text is visible.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [url, outDir] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const NEW = '#bwi-regeneration, #bwi-approach, #bwi-engine, #bwi-returns';
const WIDTHS = [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
const SHOTS = { 1440: 1, 1024: 1, 768: 1, 390: 2, 360: 1, 320: 1 };

(async () => {
  const browser = await chromium.launch();
  const report = [];
  const scrollThrough = async (p) => {
    const h = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(60); }
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
  };
  for (const w of WIDTHS) {
    const p = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: SHOTS[w] || 1 });
    const errors = [];
    p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts && document.fonts.ready);
    await p.waitForTimeout(3000); // the motion scan runs at 0.3, 1.2 and 2.6 s
    await scrollThrough(p);
    const info = await p.evaluate((sel) => {
      const out = { overflow: document.documentElement.scrollWidth - innerWidth, minFont: 99, minFontEl: '', minLabel: 99, escapes: [], dotsOverlap: [], hidden: [] };
      document.querySelectorAll(sel).forEach((sec) => {
        const sr = sec.getBoundingClientRect();
        sec.querySelectorAll('h2, h3, p, span, li, a').forEach((el) => {
          if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return;
          const cs = getComputedStyle(el); if (cs.display === 'none' || el.closest('[aria-hidden="true"]') || el.closest('[inert]')) return;
          const r = el.getBoundingClientRect(); if (!r.width) return;
          const fs = parseFloat(cs.fontSize);
          const isLabel = cs.fontFamily.includes('Mono') || /uppercase/.test(cs.textTransform);
          if (isLabel) { if (fs < out.minLabel) out.minLabel = fs; } else if (fs < out.minFont) { out.minFont = fs; out.minFontEl = el.className || el.tagName; }
          if (r.left < sr.left - 0.5 || r.right > sr.right + 0.5) out.escapes.push((el.className || el.tagName) + ' ' + Math.round(r.left) + '-' + Math.round(r.right));
          if (+cs.opacity < 1 || cs.visibility !== 'visible') out.hidden.push(el.className || el.tagName);
        });
      });
      const dots = document.querySelector('.bwi-ms-dots');
      if (dots && getComputedStyle(dots).display !== 'none') {
        const d = dots.getBoundingClientRect();
        document.querySelectorAll('.bwi-ms-head > *, .bwi-ms-body p').forEach((t) => { const r = t.getBoundingClientRect(); const ox = Math.min(r.right, d.right) - Math.max(r.left, d.left), oy = Math.min(r.bottom, d.bottom) - Math.max(r.top, d.top); if (ox > 0 && oy > 0) out.dotsOverlap.push((t.className || t.tagName) + ' ' + Math.round(oy) + 'px'); });
      }
      out.headings = [...document.querySelectorAll('#bwci-better-world-impact main :is(h1,h2,h3)')].filter((h) => h.offsetParent && !h.closest('[inert]')).map((h) => h.tagName.toLowerCase() + ' ' + h.textContent.trim().slice(0, 48));
      out.height = document.documentElement.scrollHeight;
      return out;
    }, NEW);
    info.errors = errors;
    report.push([w, info]);
    if (SHOTS[w]) {
      await p.screenshot({ path: path.join(outDir, 'page-' + w + '.jpg'), fullPage: true, type: 'jpeg', quality: 82 });
      // the new sections on their own, from the end of the hero to the start of the closing CTA
      const box = await p.evaluate(() => { const a = document.getElementById('bwi-regeneration').getBoundingClientRect(), b = document.getElementById('bwi-returns').getBoundingClientRect(); return { x: 0, y: a.top + scrollY, width: innerWidth, height: b.bottom - a.top }; });
      await p.screenshot({ path: path.join(outDir, 'sections-' + w + '.png'), clip: box, fullPage: true });
    }
    await p.close();
  }
  // reduced motion and JavaScript off
  for (const [label, opts] of [['reduced motion 390', { viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }], ['no JavaScript 1440', { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }]]) {
    const p = await browser.newPage(opts);
    await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3200);
    if (label.startsWith('reduced')) await scrollThrough(p);
    report.push([label, await p.evaluate((sel) => {
      const bad = [];
      document.querySelectorAll(sel).forEach((s) => s.querySelectorAll('h2, h3, p').forEach((el) => { const cs = getComputedStyle(el); let e = el, op = 1; while (e) { op *= +getComputedStyle(e).opacity; e = e.parentElement; } if (cs.visibility !== 'visible' || op < 1) bad.push(el.textContent.trim().slice(0, 30)); }));
      return { notVisible: bad };
    }, NEW)]);
    await p.close();
  }
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
  report.forEach(([w, r]) => console.log(String(w).padEnd(20), JSON.stringify(Object.assign({}, r, { headings: undefined }))));
  console.log('headings 1440:', JSON.stringify(report.find((x) => x[0] === 1440)[1].headings, null, 0));
  await browser.close();
})();
