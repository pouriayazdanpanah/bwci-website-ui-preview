// Dev-only behavioural QA for Main. Same interaction script on the source and the port; prints a comparable
// trace (port class names are normalised by dropping the bw- prefix).   NODE_PATH=$(npm root -g) node behaviour.js <url>
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];

const STATE = () => {
  const n = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'sc-interp').map((c) => c.replace(/^bw-/, '')).join('.');
  const id = (el) => { if (!el.dataset.qa) { window.__qaN = (window.__qaN || 0) + 1; el.dataset.qa = String(window.__qaN); } return el.dataset.qa; };
  const hk = document.querySelector('.hk');
  const ae = document.activeElement;
  const tabs = document.querySelector('.pf-tabs');
  return {
    hk: cls(hk) + ' ' + [...document.querySelectorAll('.hk-i')].map((b) => (/(^|\s)(bw-)?on(\s|$)/.test(b.className) ? 'X' : 'o') + b.getAttribute('aria-expanded')[0]).join('') + ' ' + n(document.querySelector('.hk-d')),
    eng: [...document.querySelectorAll('.lp-n')].map((b) => (b.classList.contains('is-on') ? 'X' : b.classList.contains('is-past') ? 'p' : 'o')).join('') + ' p=' + document.querySelector('#engine .lp, #bwci-engine .lp').style.getPropertyValue('--p').trim(),
    tabs: [...document.querySelectorAll('.pf-tab')].map((b) => (/on/.test(cls(b)) ? 'X' : 'o') + b.getAttribute('aria-selected')[0]).join('') + ' ' + cls(tabs.parentElement) + ' sl=' + Math.round(tabs.scrollLeft),
    cards: [...document.querySelectorAll('.pk')].map((c) => id(c) + ':' + cls(c) + ':' + n(c.querySelector('h3')) + ':' + c.getAttribute('style').replace(/\s/g, '') + ':' + c.getAnimations().map((a) => a.playState).join('/')).join(' | '),
    pfx: cls(document.querySelector('.pfx')) + ' ' + cls(document.querySelector('.pf-panel')) + ' ' + n(document.querySelector('.pfx-sum > div')),
    ix: [...document.querySelectorAll('.ix-c')].map((c) => (/on/.test(cls(c)) ? 'X' : 'o') + c.getAttribute('aria-expanded')[0]).join(''),
    focus: ae && ae !== document.body ? ae.tagName + ':' + cls(ae) + ':' + (ae.getAttribute('aria-label') || n(ae).replace(/\s/g, '').slice(0, 18)) : 'body',
  };
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(22) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    return page;
  };
  const snap = (page) => page.evaluate(STATE);
  const toTop = async (page, sel) => { await page.evaluate((s) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sel); await page.waitForTimeout(1300); };

  for (const [w, h] of [[1440, 900], [1024, 768]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('initial ' + w, await snap(page));
    // hero facts: hover / leave / keyboard / click
    await page.locator('.hk-i').nth(1).hover(); await page.waitForTimeout(80); log('hover fact 1', (await snap(page)).hk);
    await page.locator('.hk-i').nth(3).hover(); await page.waitForTimeout(80); log('hover fact 3', (await snap(page)).hk);
    await page.mouse.move(5, 899); await page.waitForTimeout(80); log('leave facts', (await snap(page)).hk);
    await page.locator('.hk-i').nth(2).click(); await page.waitForTimeout(80); log('click fact 2', (await snap(page)).hk);
    await page.locator('.hk-i').nth(2).click(); await page.waitForTimeout(80); log('click fact 2 again', (await snap(page)).hk);
    await page.mouse.move(5, 899); await page.waitForTimeout(50);
    await page.locator('.hk-i').nth(0).focus(); await page.waitForTimeout(50); log('focus() fact 0', (await snap(page)).hk);
    await page.keyboard.press('Tab'); await page.waitForTimeout(50); log('Tab to fact 1', [(await snap(page)).hk, (await snap(page)).focus]);
    // engine
    await toTop(page, '#engine, #bwci-engine');
    await page.locator('.lp-n .lp-dot').nth(3).click(); await page.waitForTimeout(1500); log('node 3', [(await snap(page)).eng, await page.evaluate(() => Math.round(document.querySelector('.lpd').getBoundingClientRect().bottom))]);
    for (let k = 0; k < 3; k++) { await page.locator('.lpd-ctrl button').nth(1).click(); await page.waitForTimeout(40); }
    log('next x3 (wraps)', (await snap(page)).eng);
    await page.locator('.lpd-ctrl button').nth(0).click(); log('prev', (await snap(page)).eng);
    // platforms: tabs + cards
    await toTop(page, '#platforms, #bwci-platforms');
    log('platforms', [(await snap(page)).tabs, (await snap(page)).cards, (await snap(page)).pfx]);
    for (const i of [2, 1, 0, 4, 2, 3]) {
      await page.locator('.pf-tab').nth(i).click(); await page.waitForTimeout(60);
      const s = await snap(page); log('tab ' + i, [s.tabs, s.cards, s.pfx]);
    }
    await page.locator('.pk').first().hover(); await page.waitForTimeout(400);
    log('card hover', await page.evaluate(() => { const c = document.querySelector('.pk'); return getComputedStyle(c).transform + ' ' + getComputedStyle(c.querySelector('.pk-ic')).backgroundColor; }));
    // impact cards
    await toTop(page, '#impact, #bwci-impact');
    await page.locator('.ix-c').nth(2).hover(); await page.waitForTimeout(30); log('ix hover +30ms', (await snap(page)).ix);
    await page.waitForTimeout(120); log('ix hover +150ms', (await snap(page)).ix);
    await page.locator('.ix-c').nth(3).hover(); await page.mouse.move(5, 5); await page.waitForTimeout(150); log('ix pass-through', (await snap(page)).ix);
    await page.locator('.ix-c').nth(1).click(); await page.waitForTimeout(60); log('ix click 1', (await snap(page)).ix);
    await page.locator('.ix-c').nth(0).focus(); await page.waitForTimeout(60); log('ix focus 0', (await snap(page)).ix);
    await page.keyboard.press('Tab'); await page.waitForTimeout(60); log('ix Tab', [(await snap(page)).ix, (await snap(page)).focus]);
    // anchor link to the engine
    await toTop(page, '#problem, #bwci-problem');
    await page.locator('.pb-foot a').click(); await page.waitForTimeout(1500);
    log('anchor', await page.evaluate(() => [Math.round((document.getElementById('engine') || document.getElementById('bwci-engine')).getBoundingClientRect().top), location.hash.replace('bwci-', '')]));
    await page.close();
  }

  /* ---- narrow: tab strip overflows → arrows, drag, tap reveal ---- */
  for (const [w, h, touch] of [[1199, 800, false], [800, 900, false], [390, 844, true], [320, 640, true]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    await toTop(page, '#platforms, #bwci-platforms');
    log('strip ' + w, (await snap(page)).tabs);
    if (!touch) {
      if (await page.evaluate(() => /can-r/.test(document.querySelector('.pft').className))) { await page.locator('.pft-arr--r').click(); await page.waitForTimeout(700); log('arrow right ' + w, (await snap(page)).tabs); }
      const box = await page.locator('.pf-tabs').boundingBox();
      await page.mouse.move(box.x + box.width - 30, box.y + box.height / 2); await page.mouse.down();
      await page.mouse.move(box.x + box.width - 90, box.y + box.height / 2, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
      log('drag ' + w, [(await snap(page)).tabs, (await snap(page)).pfx]);
    } else {
      await page.locator('.pf-tab').nth(4).tap(); await page.waitForTimeout(800); log('tap tab 4 ' + w, [(await snap(page)).tabs, (await snap(page)).cards]);
      await page.locator('.hk-i').nth(1).tap(); await page.waitForTimeout(80); log('tap fact 1 ' + w, (await snap(page)).hk);
      await page.locator('.hk-i').nth(1).tap(); await page.waitForTimeout(80); log('tap fact 1 again ' + w, (await snap(page)).hk);
      await toTop(page, '#engine, #bwci-engine');
      await page.locator('.lp-n').nth(2).tap(); await page.waitForTimeout(600); log('tap node 2 ' + w, [(await snap(page)).eng, await page.evaluate(() => [...document.querySelectorAll('.lp-acc')].map((e) => Math.round(e.getBoundingClientRect().height)).join(','))]);
      await toTop(page, '#impact, #bwci-impact');
      await page.locator('.ix-c').nth(2).tap(); await page.waitForTimeout(80); log('tap ix 2 ' + w, (await snap(page)).ix);
    }
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    log('reduced motion', await page.evaluate(() => [getComputedStyle(document.querySelector('.tk-track')).animationName.replace(/^bw-/, ''), getComputedStyle(document.querySelectorAll('.tk-list')[1]).display, getComputedStyle(document.querySelector('.h-display, .bw-h-display')).animationName, getComputedStyle(document.querySelector('.rv')).transitionDuration]));
    await page.close();
  }

  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(22) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
