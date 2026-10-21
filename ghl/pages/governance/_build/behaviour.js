// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port ids/classes are normalised by dropping the gov- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
// (header, drawer, breadcrumb, footer and the shared scroll motion are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js; this script covers the hero, GovNav and the framework cards)
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

const STATE = () => {
  const nav = document.querySelector('nav[aria-label="Governance sections"]');
  const list = nav.querySelector('ul');
  const sel = nav.querySelector('select');
  const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none';
  const ae = document.activeElement;
  return {
    nav: Math.round(nav.getBoundingClientRect().top) + ' list=' + vis(list) + ' select=' + vis(sel) + (vis(sel) ? ' value#' + sel.selectedIndex + ':' + sel.options[sel.selectedIndex].text : ''),
    hdr: Math.round((document.querySelector('header.hdr, header.gov-hdr')).getBoundingClientRect().top),
    hash: location.hash.replace('#gov-', '#'),
    y: Math.round(scrollY),
    fw: Math.round((document.getElementById('framework') || document.getElementById('gov-framework')).getBoundingClientRect().top),
    focus: ae && ae !== document.body ? ae.tagName + ':' + ae.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) : 'body',
  };
};
const LINKSTYLE = (i) => {
  const a = document.querySelectorAll('nav[aria-label="Governance sections"] ul a')[i];
  const cs = getComputedStyle(a);
  return [cs.color, cs.borderBottomColor, cs.outlineStyle, cs.outlineWidth, cs.outlineColor, cs.outlineOffset, cs.fontWeight].join(' ');
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
    // after the last scan of the shared scroll motion (~2.6 s after load)
    await page.waitForTimeout(3200);
    return page;
  };
  const snap = (page) => page.evaluate(STATE);

  /* ---- desktop / tablet: list, sticky bar, hover/focus, anchor, card link ---- */
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('initial ' + w, await snap(page));
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' })); await page.waitForTimeout(300);
    log('scrolled 700 ' + w, await snap(page));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(300);
    const links = page.locator('nav[aria-label="Governance sections"] ul a');
    await links.nth(0).hover(); await page.waitForTimeout(300);
    log('hover link 0', await page.evaluate(LINKSTYLE, 0));
    await page.mouse.move(5, 5); await page.waitForTimeout(300);
    log('leave link 0', await page.evaluate(LINKSTYLE, 0));
    await links.nth(1).focus(); await page.waitForTimeout(60);
    log('focus link 1', [await page.evaluate(LINKSTYLE, 1), (await snap(page)).focus]);
    await page.keyboard.press('Tab'); log('tab', (await snap(page)).focus);
    await page.mouse.move(5, 5);
    // the framework link (an anchor on this page): smooth scroll under the sticky header + bar
    await links.nth(2).click(); await page.waitForTimeout(1600);
    log('framework link ' + w, await snap(page));
    const card = page.locator('.pg-card .link, .pg-card .gov-link').first();
    await card.hover(); await page.waitForTimeout(400);
    log('card link hover', await page.evaluate(() => { const a = document.querySelector('.pg-card .link, .pg-card .gov-link'); const cs = getComputedStyle(a); return [cs.color, cs.borderBottomColor, getComputedStyle(a.querySelector('[aria-hidden]')).transform]; }));
    await page.close();
  }

  /* ---- phones: select, live switch on resize, select navigation ---- */
  for (const [w, h] of [[390, 844], [320, 640]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    log('initial ' + w, await snap(page));
    log('options ' + w, await page.evaluate(() => [...document.querySelectorAll('nav[aria-label="Governance sections"] option')].map((o) => o.textContent.trim()).join(' | ')));
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' })); await page.waitForTimeout(300);
    log('scrolled 900 ' + w, await snap(page));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(300);
    await page.locator('nav[aria-label="Governance sections"] select').selectOption({ index: 3 }); await page.waitForTimeout(1600);
    log('select framework ' + w, await snap(page));
    await page.close();
  }
  {
    const page = await open({ viewport: { width: 1200, height: 800 } });
    await page.setViewportSize({ width: 700, height: 800 }); await page.waitForTimeout(300);
    log('resize 1200→700', (await snap(page)).nav);
    await page.setViewportSize({ width: 767, height: 800 }); await page.waitForTimeout(300);
    log('resize →767', (await snap(page)).nav);
    await page.setViewportSize({ width: 768, height: 800 }); await page.waitForTimeout(300);
    log('resize →768', (await snap(page)).nav);
    await page.close();
  }

  /* ---- hero entrance with motion; reduced motion ---- */
  for (const rm of ['no-preference', 'reduce']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: rm });
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    log('hero ' + rm, await page.evaluate(() => [...document.querySelectorAll('.pg-hero .wrap > *, .pg-hero .gov-wrap > *')].map((e) => { const cs = getComputedStyle(e); return cs.animationName.replace(/^gov-/, '') + '/' + cs.animationDuration + '/' + cs.animationDelay; }).join(' ')));
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(24) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
