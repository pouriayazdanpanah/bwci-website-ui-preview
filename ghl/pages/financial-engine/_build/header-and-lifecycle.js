// Dev-only QA for the port: duplicate init, GHL-style re-render, hero anchor, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
// (header, drawer, config, hostile host and re-render of the shared chrome are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js and chrome-lifecycle.js)
const { chromium } = require('playwright');
const url = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const loop = (page) => page.evaluate(() => [...document.querySelectorAll('.lp-n')].map((b) => (b.classList.contains('is-on') ? 'X' : 'o')).join('') + ' --p:' + document.querySelector('.lp').style.getPropertyValue('--p'));

  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    res.instances = await page.evaluate(() => !!window.__bwciFinancialEngine && document.querySelectorAll('[data-fe-init="true"]').length);
    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-financial-engine');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-fe-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-financial-engine');
      const inst = window.__bwciFinancialEngine;
      return { reattached: !!inst && inst.root === r && r.dataset.feInit === 'true' };
    });
    await page.locator('[data-fe-eng-next]').click(); await page.locator('[data-fe-eng-next]').click(); await page.waitForTimeout(60);
    await page.locator('.pr-chapter').nth(3).hover(); await page.locator('.cap-item').nth(0).hover(); await page.waitForTimeout(60);
    res.rerenderWorks = [await loop(page), await page.evaluate(() => document.querySelector('.pr').getAttribute('data-active')), await page.evaluate(() => [...document.querySelectorAll('.cap-item')].findIndex((c) => c.classList.contains('cap-item--active')))];
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    // hero anchor scrolls smoothly to the engine
    await page.locator('.fe-hero-btn--solid').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('fe-ops-model').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }
  /* reduced motion: content visible, the loop still switches */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('[data-fe-eng-prev]').click(); await page.waitForTimeout(60);
    res.reducedMotion = { loop: await loop(page), heroAnim: await page.evaluate(() => getComputedStyle(document.querySelector('.hero-fe-copy > *')).animationName) };
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
