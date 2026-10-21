// Dev-only: like shoot.js, but without Playwright's full-page viewport resize (Main's hero is sized in svh and
// a resize restarts its transitions): the page is captured viewport by viewport at a fixed height and stitched.
//   NODE_PATH=$(npm root -g) node shootv.js <url> <outDir> [w1,w2,...] [height]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const routeReact = require('./qa-routes');
const [url, outDir, widthsArg, heightArg] = process.argv.slice(2);
const widths = (widthsArg || '320,360,375,390,430,768,1024,1280,1366,1440,1600,1920,2560').split(',').map(Number);
const height = Number(heightArg || 900);
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await routeReact(page);
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const tiles = [];
    for (let y = 0, i = 0; y < H; y += height, i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(1200);
      const top = await page.evaluate(() => Math.round(window.scrollY));
      const f = path.join(outDir, `t${w}_${i}.png`);
      await page.screenshot({ path: f });
      tiles.push([f, top]);
    }
    execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
t=json.loads(sys.argv[1]); H=int(sys.argv[2]); W=int(sys.argv[3]); out=Image.new('RGB',(W,H),'white')
for f,top in t: out.paste(Image.open(f).convert('RGB'),(0,top))
out.save(sys.argv[4])
import os
[os.remove(f) for f,_ in t]
`, JSON.stringify(tiles), String(H), String(w), path.join(outDir, `w${w}.png`)]);
    const docW = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(JSON.stringify({ w, docW, docH: H, overflowX: docW > w, errors }));
    await page.close();
  }
  await browser.close();
})();
