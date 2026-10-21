// Dev-only QA for the port: duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (Ecosystem copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
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
    res.instances = await page.evaluate(() => !!window.__bwciEcosystem && document.querySelectorAll('[data-eco-init="true"]').length);
    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-ecosystem');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-eco-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-ecosystem');
      const inst = window.__bwciEcosystem;
      return { reattached: !!inst && inst.root === r && r.dataset.ecoInit === 'true' };
    });
    await page.locator('.cm-item').nth(2).hover(); await page.waitForTimeout(80);
    res.rerenderMechWorks = await page.evaluate(() => document.querySelector('.cm-diagram').getAttribute('data-mech') === '2');
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    // hero anchor scrolls smoothly to the operating model
    await page.locator('.eco-hero-btn--solid').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('eco-blueprint').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }

  /* reduced motion: content visible, stages still switch */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.pt-node').nth(2).click();
    res.reducedMotion = await page.evaluate(() => ({
      part: document.querySelector('.pt-panel__t').textContent.trim(),
      loopPaused: !document.querySelector('[data-eco-lp-play]').hidden,
      revealVisible: [...document.querySelectorAll('.rv')].every((e) => getComputedStyle(e).opacity === '1'),
      transition: getComputedStyle(document.querySelector('.pt-node')).transitionDuration,
    }));
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
