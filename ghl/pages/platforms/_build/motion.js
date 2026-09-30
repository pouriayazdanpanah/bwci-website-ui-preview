// Dev-only: with motion enabled, lists the running animations/transitions after key interactions, and
// the keyboard focus ring, for source/port comparison.  NODE_PATH=$(npm root -g) node motion.js <url>
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await routeReact(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const anims = () => page.evaluate(() => document.getAnimations().map((a) => {
    const t = a.effect && a.effect.target;
    const tc = t ? (t.getAttribute('class') || t.tagName).split(' ')[0].replace(/^plt-/, '') : '?';
    const tm = a.effect.getTiming();
    return (a.animationName || a.transitionProperty || '?').replace(/^plt-/, '') + '@' + tc + ' d=' + tm.duration + ' delay=' + tm.delay + ' it=' + tm.iterations + ' dir=' + tm.direction;
  }).sort());
  const uniq = (l) => [...new Set(l)];
  console.log('load', JSON.stringify(uniq(await anims())));
  await page.locator('.rx-tile').nth(5).scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
  await page.locator('.rx-tile').nth(5).click(); await page.waitForTimeout(50);
  console.log('jump', JSON.stringify(uniq(await anims()).filter((s) => !/ivDrift|opacity|transform@rv|^transform@rx-tile|box-shadow|border-color/.test(s))));
  await page.waitForTimeout(3500);
  await page.locator('.vt button').nth(1).click(); await page.waitForTimeout(150);
  console.log('list', JSON.stringify(uniq(await anims()).filter((s) => !/ivDrift/.test(s))));
  await page.locator('.lv-row').first().click(); await page.waitForTimeout(150);
  console.log('row', JSON.stringify(uniq(await anims()).filter((s) => !/ivDrift|pcIn/.test(s))));
  // keyboard focus ring
  await page.mouse.click(5, 5);
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  console.log('focus', await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return (e.textContent || '').trim().slice(0, 20) + ' | ' + cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor + ' off=' + cs.outlineOffset; }));
  await browser.close();
})();
