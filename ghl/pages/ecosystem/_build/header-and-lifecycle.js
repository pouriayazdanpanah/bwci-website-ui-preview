// Dev-only QA for the port: header interactions, duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
// (Ecosystem copy of ghl/pages/financial-engine/_build/header-and-lifecycle.js)
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
      stuck: document.querySelector('.eco-hdr').classList.contains('eco-hdr--stuck'),
      dd: !document.querySelector('[data-eco-dd-panel]').hidden,
      hostTop: Math.round(document.querySelector('.eco-hdr-host').getBoundingClientRect().top),
      utilH: getComputedStyle(document.getElementById('bwci-ecosystem')).getPropertyValue('--util-h').trim(),
    }));
    res.initial = await hdr();
    await page.locator('.eco-hdr__trigger').hover(); await page.waitForTimeout(100);
    res.hoverOpen = (await hdr()).dd;
    await page.mouse.move(700, 600); await page.waitForTimeout(300);
    res.leaveClosed = !(await hdr()).dd;
    await page.locator('.eco-hdr__trigger').click(); await page.waitForTimeout(50);
    await page.mouse.move(10, 890); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(250);
    res.outsideClosed = !(await hdr()).dd;
    await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(200);
    res.scrolled = await hdr();
    // instance count after duplicate script execution
    res.instances = await page.evaluate(() => !!window.__bwciEcosystem && document.querySelectorAll('[data-eco-init="true"]').length);

    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-ecosystem');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-eco-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
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

  /* mobile drawer */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    const d = () => page.evaluate(() => ({
      open: !document.querySelector('.eco-hdr__drawer').hidden,
      bodyOverflow: document.body.style.overflow,
      hiw: !document.querySelector('[data-eco-acc-panel="hiw"]').hidden,
      gov: !document.querySelector('[data-eco-acc-panel="gov"]').hidden,
    }));
    await page.locator('.eco-hdr__burger').tap(); await page.waitForTimeout(350);
    res.drawerOpen = await d();
    await page.locator('[data-eco-acc="gov"]').tap(); await page.locator('[data-eco-acc="hiw"]').tap(); await page.waitForTimeout(100);
    res.accToggled = await d();
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    res.escClosed = await d();
    await page.locator('.eco-hdr__burger').tap(); await page.waitForTimeout(300);
    await page.locator('.eco-hdr__x').tap(); await page.waitForTimeout(100);
    res.xClosed = await d();
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
