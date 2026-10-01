// Dev-only: full-page screenshots of a page at a list of viewport widths.
// Usage: NODE_PATH=$(npm root -g) node shoot.js <url> <outDir> [w1,w2,...] [height] [motion|reduce]
// Default is prefers-reduced-motion: reduce, which freezes the hero drift, card entrances and reveals so
// source and port screenshots are deterministic and comparable.
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
    await page.waitForTimeout(600);
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
