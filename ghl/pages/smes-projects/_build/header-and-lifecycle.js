// Dev-only QA for the port: duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (SMEs & Projects copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
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
    res.instances = await page.evaluate(() => !!window.__bwciSmesProjects && document.querySelectorAll('[data-sme-init="true"]').length);
    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-smes-projects');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-sme-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-smes-projects');
      const inst = window.__bwciSmesProjects;
      return { reattached: !!inst && inst.root === r && r.dataset.smeInit === 'true' };
    });
    await page.locator('[data-sme-sit="3"]').click(); await page.waitForTimeout(80);
    res.rerenderWorks = await page.evaluate(() => document.querySelector('.pm-detail__name').textContent + ' / sit ' + document.querySelector('.sit-card--on .sit-card__num').textContent);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    // hero anchor scrolls smoothly to the operating model
    await page.locator('.sme-hero-btn--ghost').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('sme-process').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }

  /* reduced motion: content visible, stages still switch */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('[data-sme-step="4"]').click(); await page.locator('[data-sme-cap="3"]').click(); await page.waitForTimeout(100);
    res.reducedMotion = await page.evaluate(() => ({
      step: document.querySelector('.pr-reading-label').textContent.trim(),
      detail: document.querySelector('.pm-detail__name').textContent.trim() + ' ' + getComputedStyle(document.querySelector('.pm-detail')).opacity,
      revealVisible: [...document.querySelectorAll('.rv')].every((e) => getComputedStyle(e).opacity === '1'),
      transition: getComputedStyle(document.querySelector('.sit-card')).transitionDuration,
    }));
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
