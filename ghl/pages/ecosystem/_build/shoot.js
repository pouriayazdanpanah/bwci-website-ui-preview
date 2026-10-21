// Dev-only: full-page screenshots of a page at a list of viewport widths.
// Usage: NODE_PATH=$(npm root -g) node shoot.js <url> <outDir> [w1,w2,...] [height] [motion|reduce]
// Default is prefers-reduced-motion: reduce, which pauses the autoplaying loop and freezes
// animations so source and port screenshots are deterministic and comparable.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const routeReact = require('./qa-routes');

const [url, outDir, widthsArg, heightArg] = process.argv.slice(2);
const widths = (widthsArg || '320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560').split(',').map(Number);
const height = Number(heightArg || 900);
const reducedMotion = process.argv[6] === 'motion' ? 'no-preference' : 'reduce';

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height }, deviceScaleFactor: 1, reducedMotion });
    await routeReact(page);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    // settle the shared scroll motion (bwci-motion.js scans ~0.3/1.2/2.6 s after load): wait for the last
    // scan, scroll through the page so every tagged block fades in, then return to the top
    await page.waitForTimeout(3000);
    // NOSCROLL=1 skips the scroll-through: the loop then never autoplays (it only plays while on screen), which
    // makes the capture deterministic; blocks the shared motion tagged below the fold stay hidden on both sides
    if (!process.env.NOSCROLL) await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.6);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)); }
      await new Promise((r) => setTimeout(r, 1800));
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await page.waitForTimeout(600);
    // the loop's SVG dots move on the SMIL timeline (not affected by reduced motion): freeze them at t=0
    await page.evaluate(() => document.querySelectorAll('svg').forEach((s) => { if (s.pauseAnimations) { s.pauseAnimations(); s.setCurrentTime(0); } }));
    // infinite decorative CSS animations (flow lines) keep running under reduced motion too: same frame on both sides
    await page.evaluate(() => document.getAnimations().forEach((an) => { if (an.effect && an.effect.getTiming().iterations === Infinity) { an.pause(); an.currentTime = 0; } }));
    await page.waitForTimeout(100);
    const info = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      vw: window.innerWidth,
    }));
    await page.screenshot({ path: path.join(outDir, `w${w}.png`), fullPage: true });
    console.log(JSON.stringify({ w, ...info, overflowX: info.docW > info.vw, errors }));
    await page.close();
  }
  await browser.close();
})();
