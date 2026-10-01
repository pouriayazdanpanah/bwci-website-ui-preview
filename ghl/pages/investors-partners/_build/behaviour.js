// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port class names are normalised by dropping the inv- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

// snapshot of the interactive sections; works on the source and on the port
const STATE = () => {
  const n = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'sc-interp').map((c) => c.replace(/^inv-/, '')).join('.');
  // re-mount check: every new element gets the next number
  const id = (el) => { if (!el.dataset.qa) { window.__qaN = (window.__qaN || 0) + 1; el.dataset.qa = String(window.__qaN); } return '#' + el.dataset.qa; };
  const pp = [...document.querySelectorAll('.pp-item')].map((e) => (e.classList.contains('pp-item--on') ? 'X' : 'o')).join('');
  const nodes = [...document.querySelectorAll('.mt-node')].map((e) => (e.classList.contains('mt-node--on') ? 'X' : 'o')).join('');
  const rail = [...document.querySelectorAll('.mt-rail button')].map((b) => (cls(b) || '-') + ':' + b.getAttribute('aria-selected')[0]).join(',');
  const prog = [...document.querySelectorAll('.mt-prog i')].map((i) => (cls(i) ? 'X' : 'o')).join('');
  const stage = document.querySelector('.mt-anim');
  const tabs = [...document.querySelectorAll('.rt-tab')].map((b) => (b.classList.contains('rt-tab--on') ? 'X' : 'o') + b.getAttribute('aria-selected')[0]).join(',');
  const panel = document.querySelector('.rt-anim');
  const ae = document.activeElement;
  return {
    pp, nodes, rail, prog, focal: document.querySelector('.mt-focal').style.transform, fill: document.querySelector('.mt-rail__fill').style.width,
    stage: n(stage) + ' ' + id(stage), tabs, panel: n(panel).slice(0, 60) + ' ' + id(panel), cta: n(document.querySelector('.rt-p__side a')),
    focus: ae && ae !== document.body ? ae.tagName + ':' + cls(ae) + ':' + (ae.getAttribute('aria-label') || n(ae).slice(0, 20)) : 'body',
    hash: location.hash.replace('inv-', ''),
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
    await page.waitForTimeout(500);
    return page;
  };
  const snap = (page) => page.evaluate(STATE);
  const top = (page, sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), sel);

  /* ---- desktop: proposition, arc, prev/next, routes, participation links ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    log('initial', await snap(page));
    for (const i of [1, 2]) { await page.locator('.pp-item').nth(i).hover(); await page.waitForTimeout(60); log('hover pp ' + i, await snap(page)); }
    await page.locator('.pp-item').nth(0).focus(); await page.waitForTimeout(60); log('focus pp 0', await snap(page));
    for (const i of [1, 2, 3, 4]) { await page.locator('.mt-node').nth(i).hover(); await page.waitForTimeout(60); log('hover node ' + i, await snap(page)); }
    await page.mouse.move(5, 5);
    await page.locator('.mt-node').nth(1).click(); await page.waitForTimeout(60); log('click node 1', await snap(page));
    await page.mouse.move(5, 5);
    const next = '.mt-ctrl button >> nth=1', prev = '.mt-ctrl button >> nth=0';
    for (let k = 0; k < 4; k++) { await page.locator(next).click(); await page.waitForTimeout(40); }
    log('next x4 (wraps)', await snap(page));
    await page.locator(prev).click(); await page.waitForTimeout(40); log('prev', await snap(page));
    await page.locator(prev).focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await page.waitForTimeout(60);
    log('kbd prev x2', await snap(page));
    for (const i of [1, 2]) { await page.locator('.rt-tab').nth(i).hover(); await page.waitForTimeout(60); log('hover tab ' + i, await snap(page)); }
    await page.mouse.move(5, 5);
    await page.locator('.rt-tab').nth(3).click(); await page.waitForTimeout(60); log('click tab 3', await snap(page));
    await page.locator('.rt-tab').nth(3).click(); await page.waitForTimeout(60); log('click tab 3 again', await snap(page));
    await page.locator('.rt-tab').nth(0).focus(); await page.waitForTimeout(60); log('focus tab 0', await snap(page));
    await page.keyboard.press('Tab'); await page.waitForTimeout(60); log('Tab -> tab 1', await snap(page));
    // participation cards that stay on this page
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.pa-card').nth(0).click(); await page.waitForTimeout(1500);
    log('card 1 -> perimeters', [await top(page, '#perimeters, #inv-perimeters'), (await snap(page)).hash, (await snap(page)).focus]);
    await page.locator('.pa-card').nth(3).click(); await page.waitForTimeout(1500);
    log('card 4 -> route', [await top(page, '#route, #inv-route'), (await snap(page)).hash]);
    log('pp-head sticky', await page.evaluate(() => { const h = document.querySelector('.pp-head'); h.closest('section').scrollIntoView({ behavior: 'instant' }); window.scrollBy({ top: 200, behavior: 'instant' }); return getComputedStyle(h).position + ' ' + Math.round(h.getBoundingClientRect().top); }));
    log('node geometry', await page.evaluate(() => [...document.querySelectorAll('.mt-node')].map((e) => { const r = e.getBoundingClientRect(); const w = e.closest('.mt-wheel').getBoundingClientRect(); return Math.round(r.left - w.left) + ',' + Math.round(r.top - w.top); }).join(' ')));
    await page.close();
  }

  /* ---- tablet + phone: rail ---- */
  for (const [w, h] of [[1023, 800], [768, 1024], [390, 844], [320, 640]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await page.locator('.mt-rail button').nth(3).tap(); await page.waitForTimeout(80);
    const a = await snap(page);
    await page.locator('.mt-rail button').nth(1).tap(); await page.waitForTimeout(80);
    await page.locator('.rt-tab').nth(2).tap(); await page.waitForTimeout(80);
    await page.locator('.pp-item').nth(2).tap(); await page.waitForTimeout(80);
    log('touch ' + w, [a, await snap(page), await page.evaluate(() => [getComputedStyle(document.querySelector('.mt-wheel-col')).display, getComputedStyle(document.querySelector('.mt-rail')).display])]);
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.locator('.mt-ctrl button').nth(1).click(); await page.locator('.rt-tab').nth(1).click(); await page.waitForTimeout(80);
    log('reduced motion', [await snap(page), await page.evaluate(() => [...document.querySelectorAll('.rv')].map((e) => getComputedStyle(e).opacity).join(','))]);
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(22) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
