// Dev-only: screenshots of the directory section in several interaction states (reduced motion), for
// pixel comparison of source and port.  NODE_PATH=$(npm root -g) node states-shoot.js <url> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const routeReact = require('./qa-routes');
const [url, outDir] = process.argv.slice(2);
const STATES = {
  jump: async (p) => { await p.locator('.rx-tile').nth(5).click(); },
  listOpen: async (p) => { await p.locator('.vt button').nth(1).click(); await p.locator('.lv-row').nth(1).click(); },
  jumpList: async (p) => { await p.locator('.rx-link').nth(1).click(); await p.locator('.vt button').nth(1).click(); await p.locator('.lv-row').nth(0).click(); },
  empty: async (p) => { await p.locator('.tb-g >> nth=0 >> button >> nth=3').click(); await p.locator('.tb-g >> nth=1 >> button >> nth=3').click(); },
  mix: async (p) => { await p.locator('.mx-btn').nth(0).click(); },
};
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of [1440, 1024, 768, 390, 320]) {
    for (const [name, act] of Object.entries(STATES)) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      await routeReact(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await act(page);
      await page.mouse.move(0, 0);
      await page.waitForTimeout(900);
      // the sticky site header would overlap the element capture at scroll-dependent positions
      await page.addStyleTag({ content: '[data-sc-name="SiteHeader"], .plt-hdr-host{ visibility:hidden !important; }' });
      await page.locator('#directory, #plt-directory').screenshot({ path: path.join(outDir, `${name}-${w}.png`) });
      await page.close();
    }
  }
  await browser.close();
})();
