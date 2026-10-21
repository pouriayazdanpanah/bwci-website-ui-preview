// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port ids/classes are normalised by dropping the gvb- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
// (header, drawer, breadcrumb, footer and the shared scroll motion are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js; this script covers GovNav, the person cards and the link band)
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;
const SEC = '#board, #gvb-board';
const NAV = 'nav[aria-label="Governance sections"]';

const STATE = ([NAV]) => {
  const nav = document.querySelector(NAV);
  const list = nav.querySelector('ul'), sel = nav.querySelector('select');
  const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none';
  const ae = document.activeElement;
  return {
    nav: Math.round(nav.getBoundingClientRect().top) + ' list=' + vis(list) + ' select=' + vis(sel) + (vis(sel) ? ' value#' + sel.selectedIndex + ':' + sel.options[sel.selectedIndex].text : ''),
    y: Math.round(scrollY),
    focus: ae && ae !== document.body ? ae.tagName + ':' + (ae.getAttribute('aria-label') || ae.textContent.replace(/\s+/g, ' ').trim().slice(0, 24)) : 'body',
  };
};
// card i: lift, shadow, border, portrait zoom, overlay, and the portrait's fitted size inside its frame
const CARD = ([SEC, i]) => {
  const a = document.querySelectorAll(SEC.split(', ').map((s) => s + ' a.gv-card').join(', '))[i];
  const cs = getComputedStyle(a);
  const slot = a.querySelector('image-slot, .gvb-slot');
  const img = slot.shadowRoot ? slot.shadowRoot.querySelector('img') : slot.querySelector('img');
  const ov = getComputedStyle(a.querySelector('.gv-card-ov'));
  const r = img.getBoundingClientRect(), f = slot.getBoundingClientRect();
  return [cs.transform, cs.boxShadow.slice(0, 40), cs.borderTopColor, getComputedStyle(slot).transform, ov.opacity, ov.transform,
    cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineOffset, 'img ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' in ' + Math.round(f.width) + 'x' + Math.round(f.height),
    a.getAttribute('aria-label')].join(' | ');
};
const LINKSTYLE = ([NAV, i]) => {
  const a = document.querySelectorAll(NAV + ' ul a')[i];
  const cs = getComputedStyle(a);
  return [cs.color, cs.borderBottomColor, cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset, cs.fontWeight, a.getAttribute('aria-current')].join(' ');
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(24) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // after the last scan of the shared scroll motion
    return page;
  };
  const snap = (page) => page.evaluate(STATE, [NAV]);
  const toCards = (page) => page.evaluate((s) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 60, behavior: 'instant' }); }, SEC).then(() => page.waitForTimeout(1300));

  /* ---- desktop / tablet ---- */
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('initial ' + w, await snap(page));
    for (const i of [0, 1, 2]) log('nav link ' + i, await page.evaluate(LINKSTYLE, [NAV, i]));
    await page.locator(NAV + ' ul a').nth(1).hover(); await page.waitForTimeout(300);
    log('hover nav 1', await page.evaluate(LINKSTYLE, [NAV, 1]));
    await page.locator(NAV + ' ul a').nth(0).hover(); await page.waitForTimeout(300);
    log('hover nav 0 (current)', await page.evaluate(LINKSTYLE, [NAV, 0]));
    await page.mouse.move(5, 5);
    await page.locator(NAV + ' ul a').nth(0).focus(); await page.waitForTimeout(60);
    log('focus nav 0', await page.evaluate(LINKSTYLE, [NAV, 0]));
    await toCards(page);
    log('scrolled to cards ' + w, await snap(page));
    for (const i of [0, 1, 2]) log('card ' + i, await page.evaluate(CARD, [SEC, i]));
    await page.locator('a.gv-card').nth(1).hover(); await page.waitForTimeout(700);
    log('hover card 1', await page.evaluate(CARD, [SEC, 1]));
    await page.mouse.move(5, 5); await page.waitForTimeout(700);
    log('leave card 1', await page.evaluate(CARD, [SEC, 1]));
    const band = page.locator('#framework-link a, #gvb-framework-link a');
    await band.hover(); await page.waitForTimeout(400);
    log('band link hover', await page.evaluate(() => { const a = document.querySelector('#framework-link a, #gvb-framework-link a'); const cs = getComputedStyle(a); return [cs.color, cs.borderBottomColor, getComputedStyle(a.querySelector('[aria-hidden]')).transform]; }));
    await page.locator('a.gv-card').nth(2).focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(400);
    log('kbd focus card 2', [await page.evaluate(CARD, [SEC, 2]), (await snap(page)).focus]);
    await page.keyboard.press('Tab'); log('tab after cards', (await snap(page)).focus);
    await page.close();
  }

  /* ---- phones (touch: overlay always shown) ---- */
  for (const [w, h] of [[390, 844], [320, 640]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    log('initial ' + w, await snap(page));
    log('options ' + w, await page.evaluate((N) => [...document.querySelectorAll(N + ' option')].map((o) => o.textContent.trim()).join(' | '), NAV));
    await toCards(page);
    for (const i of [0, 2]) log('card ' + i + ' ' + w, await page.evaluate(CARD, [SEC, i]));
    await page.close();
  }

  /* ---- live resize: portraits refit, GovNav switches ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    for (const w of [1100, 700, 500, 1600]) {
      await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(400);
      log('resize ' + w, [(await snap(page)).nav.replace(/^\d+ /, ''), await page.evaluate(CARD, [SEC, 0]), await page.evaluate(CARD, [SEC, 2])]);
    }
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await toCards(page);
    await page.locator('a.gv-card').nth(0).hover(); await page.waitForTimeout(700);
    log('reduced hover card 0', await page.evaluate(CARD, [SEC, 0]));
    log('reduced hero', await page.evaluate(() => [...document.querySelectorAll('.pg-hero .wrap > *, .pg-hero .gvb-wrap > *')].map((e) => getComputedStyle(e).animationName.replace(/^gvb-/, '')).join(' ')));
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(24) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
