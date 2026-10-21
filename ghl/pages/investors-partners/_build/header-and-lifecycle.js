// Dev-only QA for the port: duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (Investors & Partners copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
const url = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};

  /* page lifecycle (header, drawer, config, hostile host and re-render are covered by
     ghl/shared/site-chrome/qa/chrome-behaviour.js and chrome-lifecycle.js) */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    res.instances = await page.evaluate(() => !!window.__bwciInvestorsPartners && document.querySelectorAll('[data-inv-init="true"]').length);
    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-investors-partners');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-inv-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-investors-partners');
      const inst = window.__bwciInvestorsPartners;
      return { reattached: !!inst && inst.root === r && r.dataset.invInit === 'true' };
    });
    await page.locator('[data-inv-rt="2"]').click(); await page.waitForTimeout(80);
    res.rerenderWorks = await page.evaluate(() => document.querySelector('.rt-p__role').textContent + ' / ' + document.querySelector('[data-inv-rt-cta]').textContent);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    // hero anchor scrolls smoothly to the operating model
    await page.locator('.inv-hero-btn--ghost').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('inv-participation').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }

  /* reduced motion: content visible, stages still switch */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('[data-inv-mt-next]').click(); await page.locator('[data-inv-mt-next]').click(); await page.waitForTimeout(100);
    res.reducedMotion = await page.evaluate(() => ({
      stage: document.querySelector('.mt-code').textContent.trim() + ' ' + getComputedStyle(document.querySelector('.mt-anim')).opacity,
      revealVisible: [...document.querySelectorAll('.rv')].every((e) => getComputedStyle(e).opacity === '1'),
      transition: getComputedStyle(document.querySelector('.pp-item')).transitionDuration,
    }));
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
