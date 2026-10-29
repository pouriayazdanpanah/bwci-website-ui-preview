// Dev-only: screenshots of a page at a list of viewport widths, one height.
// Usage: NODE_PATH=$(npm root -g) node shoot.js <url> <outDir> [w1,w2,...] [height] [reduce|<ms>] [full|view]
//   reduce (default): prefers-reduced-motion: reduce, as the source and port render with no animation;
//   <ms>: motion on, with every running animation paused at that time (entrance, cone fade and float), so source and
//         port are compared at the same moment of their timelines.
//   full (default): a full-page capture; view: the viewport only (Playwright's full-page capture resizes the viewport,
//         which changes the vh units this page is built on whenever it is taller than the viewport).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [url, outDir, widthsArg, heightArg, modeArg, captureArg] = process.argv.slice(2);
const widths = (widthsArg || '320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560').split(',').map(Number);
const height = Number(heightArg || 900);
const at = modeArg && modeArg !== 'reduce' ? Number(modeArg) : null;
const fullPage = captureArg !== 'view';

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height }, deviceScaleFactor: 1, reducedMotion: at === null ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    await page.waitForTimeout(300);
    if (at !== null) await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), at);
    const info = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      vw: window.innerWidth,
      animations: document.getAnimations().length,
    }));
    await page.screenshot({ path: path.join(outDir, `w${w}.png`), fullPage });
    console.log(JSON.stringify({ w, h: height, ...info, overflowX: info.docW > info.vw, errors }));
    await page.close();
  }
  await browser.close();
})();
