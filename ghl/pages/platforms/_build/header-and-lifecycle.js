// Dev-only QA for the port: header interactions, duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (Platforms copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
const url = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};

  /* desktop header */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    const hdr = () => page.evaluate(() => ({
      stuck: document.querySelector('.plt-hdr').classList.contains('plt-hdr--stuck'),
      dd: !document.querySelector('[data-plt-dd-panel]').hidden,
      hostTop: Math.round(document.querySelector('.plt-hdr-host').getBoundingClientRect().top),
      utilH: getComputedStyle(document.getElementById('bwci-platforms')).getPropertyValue('--util-h').trim(),
    }));
    res.initial = await hdr();
    await page.locator('.plt-hdr__trigger').hover(); await page.waitForTimeout(100);
    res.hoverOpen = (await hdr()).dd;
    await page.mouse.move(700, 600); await page.waitForTimeout(300);
    res.leaveClosed = !(await hdr()).dd;
    await page.locator('.plt-hdr__trigger').click(); await page.waitForTimeout(50);
    await page.mouse.move(10, 890); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(250);
    res.outsideClosed = !(await hdr()).dd;
    await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(200);
    res.scrolled = await hdr();
    // instance count after duplicate script execution
    res.instances = await page.evaluate(() => !!window.__bwciPlatforms && document.querySelectorAll('[data-plt-init="true"]').length);

    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-platforms');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-plt-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
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

  /* mobile drawer */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    const d = () => page.evaluate(() => ({
      open: !document.querySelector('.plt-hdr__drawer').hidden,
      bodyOverflow: document.body.style.overflow,
      hiw: !document.querySelector('[data-plt-acc-panel="hiw"]').hidden,
      gov: !document.querySelector('[data-plt-acc-panel="gov"]').hidden,
    }));
    await page.locator('.plt-hdr__burger').tap(); await page.waitForTimeout(350);
    res.drawerOpen = await d();
    await page.locator('[data-plt-acc="gov"]').tap(); await page.locator('[data-plt-acc="hiw"]').tap(); await page.waitForTimeout(100);
    res.accToggled = await d();
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    res.escClosed = await d();
    await page.locator('.plt-hdr__burger').tap(); await page.waitForTimeout(300);
    await page.locator('.plt-hdr__x').tap(); await page.waitForTimeout(100);
    res.xClosed = await d();
    // hero anchor scrolls smoothly to the operating model
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
