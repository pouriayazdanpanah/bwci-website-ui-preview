// Dev-only: screenshots of the interactive sections in several states (reduced motion), for pixel
// comparison of source and port.  NODE_PATH=$(npm root -g) node states-shoot.js <url> <outDir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const routeReact = require('./qa-routes');
const [url, outDir] = process.argv.slice(2);
const STATES = {
  sit4: { sel: '#situation, #sme-situation', act: async (p) => { await p.locator('.sit-card').nth(3).click(); } },
  sit4caps: { sel: '#perimeters, #sme-perimeters', act: async (p) => { await p.locator('.sit-card').nth(3).click(); } },
  step4: { sel: '#process, #sme-process', act: async (p) => { await p.locator('.pr-chapter').nth(3).click(); } },
  step3: { sel: '#process, #sme-process', act: async (p) => { await p.locator('.pr-chapter').nth(2).click(); } },
  step5: { sel: '#process, #sme-process', act: async (p) => { await p.locator('.pr-chapter').nth(4).click(); } },
  cap4: { sel: '#perimeters, #sme-perimeters', act: async (p) => { await p.locator('.pm-card').nth(3).click(); } },
  pc4: { sel: '#principles, #sme-principles', act: async (p) => { await p.locator('.pc-row').nth(3).click(); } },
  kbdFocus: { sel: '#situation, #sme-situation', act: async (p) => { await p.locator('.sit-card').nth(1).focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); } },
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
      await page.mouse.move(0, 0);
      await page.waitForTimeout(700);
      // the sticky site header would overlap the element capture at scroll-dependent positions
      await page.addStyleTag({ content: '[data-sc-name="SiteHeader"], .sme-hdr-host{ visibility:hidden !important; }' });
      await page.locator(st.sel).screenshot({ path: path.join(outDir, `${name}-${w}.png`) });
      await page.close();
    }
  }
  await browser.close();
})();
