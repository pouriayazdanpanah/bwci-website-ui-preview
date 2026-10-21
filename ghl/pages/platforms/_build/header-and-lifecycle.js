// Dev-only QA for the port: duplicate init, GHL-style re-render, hero anchor, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (Platforms copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
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
    res.instances = await page.evaluate(() => !!window.__bwciPlatforms && document.querySelectorAll('[data-plt-init="true"]').length);
    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-platforms');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-plt-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-platforms');
      const inst = window.__bwciPlatforms;
      return { reattached: !!inst && inst.root === r && r.dataset.pltInit === 'true' };
    });
    await page.locator('[data-plt-rel="Group Build"]').click(); await page.waitForTimeout(80);
    res.rerenderDirectoryWorks = await page.evaluate(() => document.querySelector('[data-plt-res] b').textContent + ' / ' + document.querySelectorAll('.dg .pd').length + ' cards');
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    // hero anchor scrolls smoothly to the directory
    await page.locator('.plt-hero-btn--solid').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('plt-directory').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }

  /* reduced motion: content visible, stages still switch */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.rx-tile').nth(3).click(); await page.waitForTimeout(100);
    res.reducedMotion = await page.evaluate(() => ({
      jump: document.querySelector('.jb-tx span').textContent.trim(),
      cards: [...document.querySelectorAll('.dg .pd')].map((e) => getComputedStyle(e).animationName + ':' + getComputedStyle(e).opacity).join(','),
      scrolledTo: Math.round(document.querySelector('[data-plt-tb]').getBoundingClientRect().top),
      revealVisible: [...document.querySelectorAll('.rv')].every((e) => getComputedStyle(e).opacity === '1'),
      transition: getComputedStyle(document.querySelector('.rx-tile')).transitionDuration,
    }));
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
