// Dev-only QA for the port: header interactions, duplicate init, GHL-style re-render, reduced motion.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <url>
const { chromium } = require('playwright');
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
      stuck: document.querySelector('.fe-hdr').classList.contains('fe-hdr--stuck'),
      dd: !document.querySelector('[data-fe-dd-panel]').hidden,
      hostTop: Math.round(document.querySelector('.fe-hdr-host').getBoundingClientRect().top),
      utilH: getComputedStyle(document.getElementById('bwci-financial-engine')).getPropertyValue('--util-h').trim(),
    }));
    res.initial = await hdr();
    await page.locator('.fe-hdr__trigger').hover(); await page.waitForTimeout(100);
    res.hoverOpen = (await hdr()).dd;
    await page.mouse.move(700, 600); await page.waitForTimeout(300);
    res.leaveClosed = !(await hdr()).dd;
    await page.locator('.fe-hdr__trigger').click(); await page.waitForTimeout(50);
    await page.mouse.move(10, 890); await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(250);
    res.outsideClosed = !(await hdr()).dd;
    await page.evaluate(() => window.scrollTo(0, 400)); await page.waitForTimeout(200);
    res.scrolled = await hdr();
    // instance count after duplicate script execution
    res.instances = await page.evaluate(() => !!window.__bwciFinancialEngine && document.querySelectorAll('[data-fe-init="true"]').length);

    // simulate GHL re-rendering the widget (root replaced by a fresh copy), then scroll
    await page.evaluate(() => {
      const old = document.getElementById('bwci-financial-engine');
      const fresh = old.cloneNode(true);
      fresh.removeAttribute('data-fe-init');
      old.replaceWith(fresh);
    });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(200);
    res.rerender = await page.evaluate(() => {
      const r = document.getElementById('bwci-financial-engine');
      const inst = window.__bwciFinancialEngine;
      return { reattached: !!inst && inst.root === r && r.dataset.feInit === 'true' };
    });
    await page.locator('.cap-item').nth(4).hover(); await page.waitForTimeout(80);
    res.rerenderCapWorks = await page.evaluate(() => document.querySelectorAll('.cap-item')[4].classList.contains('cap-item--active'));
    await page.close();
  }

  /* mobile drawer */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    const d = () => page.evaluate(() => ({
      open: !document.querySelector('.fe-hdr__drawer').hidden,
      bodyOverflow: document.body.style.overflow,
      hiw: !document.querySelector('[data-fe-acc-panel="hiw"]').hidden,
      gov: !document.querySelector('[data-fe-acc-panel="gov"]').hidden,
    }));
    await page.locator('.fe-hdr__burger').tap(); await page.waitForTimeout(350);
    res.drawerOpen = await d();
    await page.locator('[data-fe-acc="gov"]').tap(); await page.locator('[data-fe-acc="hiw"]').tap(); await page.waitForTimeout(100);
    res.accToggled = await d();
    await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    res.escClosed = await d();
    await page.locator('.fe-hdr__burger').tap(); await page.waitForTimeout(300);
    await page.locator('.fe-hdr__x').tap(); await page.waitForTimeout(100);
    res.xClosed = await d();
    // hero anchor scrolls smoothly to the operating model
    await page.locator('.fe-hero-btn--solid').tap(); await page.waitForTimeout(1500);
    res.anchor = await page.evaluate(() => ({ top: Math.round(document.getElementById('fe-ops-model').getBoundingClientRect().top), hash: location.hash }));
    await page.close();
  }

  /* reduced motion: content visible, stages still switch */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.locator('.pr-chapter').nth(3).click();
    res.reducedMotion = await page.evaluate(() => ({
      pr: document.querySelector('.pr').getAttribute('data-active'),
      panelVisible: getComputedStyle(document.querySelector('.ops-panel--active')).opacity,
      nodeTransition: getComputedStyle(document.querySelector('.ops-stage-node')).transitionDuration,
    }));
    await ctx.close();
  }

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
