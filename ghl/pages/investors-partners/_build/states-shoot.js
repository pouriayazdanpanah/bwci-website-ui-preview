// Dev-only: screenshots of the interactive sections in several states (reduced motion), for pixel
// comparison of source and port.  NODE_PATH=$(npm root -g) node states-shoot.js <url> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const routeReact = require('./qa-routes');
const [url, outDir] = process.argv.slice(2);
const STATES = {
  pp3: { sel: '#proposition, #inv-proposition', act: async (p) => { await p.locator('.pp-item').nth(2).focus(); } },
  step2: { sel: '#methodology, #inv-methodology', act: async (p) => { await p.locator('.mt-ctrl button').nth(1).click(); } },
  step4: { sel: '#methodology, #inv-methodology', act: async (p) => { await p.locator('.mt-ctrl button').nth(0).click(); await p.locator('.mt-ctrl button').nth(0).click(); } },
  step5: { sel: '#methodology, #inv-methodology', act: async (p) => { await p.locator('.mt-ctrl button').nth(0).click(); } },
  route3: { sel: '#route, #inv-route', act: async (p) => { await p.locator('.rt-tab').nth(2).click(); } },
  route4kbd: { sel: '#route, #inv-route', act: async (p) => { await p.locator('.rt-tab').nth(3).focus(); } },
  paHover: { sel: '#participation, #inv-participation', act: async (p) => { await p.locator('.pa-card').nth(1).hover(); }, keepMouse: true },
};
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  for (const w of [1440, 1024, 768, 390, 320]) {
    for (const [name, st] of Object.entries(STATES)) {
      const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
      await routeReact(page);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await st.act(page);
      if (!st.keepMouse) await page.mouse.move(0, 0);
      await page.waitForTimeout(700);
      // the sticky site header would overlap the element capture at scroll-dependent positions
      await page.addStyleTag({ content: '[data-sc-name="SiteHeader"], .inv-hdr-host{ visibility:hidden !important; }' });
      await page.locator(st.sel).screenshot({ path: path.join(outDir, `${name}-${w}.png`) });
      await page.close();
    }
  }
  await browser.close();
})();
