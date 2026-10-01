// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port class names are normalised by dropping the sme- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

// snapshot of every interactive section; works on the source and on the port
const STATE = () => {
  const n = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'sc-interp').map((c) => c.replace(/^sme-/, '')).join('.');
  const sits = [...document.querySelectorAll('.sit-card')].map((e) => (e.classList.contains('sit-card--on') ? 'X' : 'o') + e.getAttribute('aria-pressed')[0]).join(',');
  const pr = document.querySelector('#process, #sme-process');
  const steps = [...pr.querySelectorAll('.pr-chapter')].map((b) => (b.getAttribute('aria-pressed') === 'true' ? 'X' : 'o')).join('');
  const caps = [...document.querySelectorAll('.pm-card')].map((b) => (b.classList.contains('pm-card--on') ? 'X' : 'o') + b.getAttribute('aria-pressed')[0]).join(',');
  const d = document.querySelector('.pm-detail');
  const pcs = [...document.querySelectorAll('.pc-row')].map((b) => (b.classList.contains('pc-row--on') ? 'X' : 'o') + b.getAttribute('aria-expanded')[0]).join(',');
  // re-mount check: every new detail element gets the next number
  if (!d.dataset.qa) { window.__qaN = (window.__qaN || 0) + 1; d.dataset.qa = String(window.__qaN); }
  const anim = 'mount#' + d.dataset.qa + (d.getAnimations().length ? '+anim' : '');
  const ae = document.activeElement;
  return {
    sits, steps, active: pr.getAttribute('data-active'), big: getComputedStyle(pr, '::before').content,
    reading: n(pr.querySelector('.pr-reading')).slice(0, 70), caps, detail: n(d).slice(0, 90), detailAnim: anim, pcs,
    pcOpenH: [...document.querySelectorAll('.pc-row__d')].map((e) => Math.round(e.getBoundingClientRect().height)).join(','),
    focus: ae && ae !== document.body ? ae.tagName + ':' + cls(ae) : 'body', hash: location.hash.replace('sme-', ''),
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

  /* ---- desktop ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    log('initial', await snap(page));
    for (const i of [1, 2, 3, 0]) { await page.locator('.sit-card').nth(i).click(); await page.waitForTimeout(80); log('sit ' + i, await snap(page)); }
    await page.locator('.sit-card').nth(2).click(); await page.waitForTimeout(500);
    await page.locator('.sit-card').nth(1).click(); await page.waitForTimeout(40);
    log('sit 2->1 same cap', await snap(page));
    // keyboard on the cards (and Enter on the card's link)
    await page.locator('.sit-card').nth(3).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(60);
    log('Enter on card 4', await snap(page));
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Space'); await page.waitForTimeout(60);
    log('Space on link 3', await snap(page));
    await page.locator('.sit-card__link').nth(0).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    log('Enter on link 1', await snap(page));
    // clicking the link inside a card: selects it and scrolls to the perimeters
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('.sit-card__link').nth(3).click(); await page.waitForTimeout(1500);
    log('click link 4', await snap(page)); log('  perimeters top', await top(page, '#perimeters, #sme-perimeters'));
    // process: hover, focus, click
    for (const i of [1, 2, 3, 4]) { await page.locator('.pr-chapter').nth(i).hover(); await page.waitForTimeout(60); log('hover step ' + (i + 1), await snap(page)); }
    await page.mouse.move(5, 5);
    await page.locator('.pr-chapter').nth(2).focus(); await page.waitForTimeout(60); log('focus step 3', await snap(page));
    await page.locator('.pr-chapter').nth(0).click(); await page.waitForTimeout(60); log('click step 1', await snap(page));
    // capabilities
    for (const i of [3, 1, 1, 2]) { await page.locator('.pm-card').nth(i).click(); await page.waitForTimeout(80); log('cap ' + i, await snap(page)); }
    // principles: hover, click, focus; open row heights after the transition
    await page.locator('.pc-row').nth(2).hover(); await page.waitForTimeout(600); log('hover pc 3', await snap(page));
    await page.locator('.pc-row').nth(4).click(); await page.waitForTimeout(600); log('click pc 5', await snap(page));
    await page.locator('.pc-row').nth(1).focus(); await page.waitForTimeout(600); log('focus pc 2', await snap(page));
    log('sticky pc-head', await page.evaluate(() => { const h = document.querySelector('.pc-head'); h.closest('section').scrollIntoView({ behavior: 'instant' }); window.scrollBy({ top: 200, behavior: 'instant' }); return getComputedStyle(h).position + ' ' + Math.round(h.getBoundingClientRect().top); }));
    await page.close();
  }

  /* ---- tablet + phone ---- */
  for (const [w, h] of [[768, 1024], [390, 844]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await page.locator('.sit-card').nth(2).tap(); await page.waitForTimeout(80);
    await page.locator('.pr-chapter').nth(3).tap(); await page.waitForTimeout(80);
    await page.locator('.pm-card').nth(3).tap(); await page.waitForTimeout(80);
    await page.locator('.pc-row').nth(3).tap(); await page.waitForTimeout(600);
    log('touch ' + w, await snap(page));
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.locator('.pm-card').nth(2).click(); await page.waitForTimeout(80);
    log('reduced motion', [await snap(page), await page.evaluate(() => [...document.querySelectorAll('.rv')].map((e) => getComputedStyle(e).opacity).join(','))]);
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(22) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
