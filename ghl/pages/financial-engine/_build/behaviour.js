// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port class names are normalised by dropping the fe- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

// snapshot of the interactive sections; works on the source and on the port
const STATE = () => {
  const n = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'sc-interp').map((c) => c.replace(/^fe-/, '')).join('.');
  const pr = document.querySelector('.pr');
  const lp = document.querySelector('.lp');
  const nodes = [...document.querySelectorAll('.lp-n')].map((b) => (b.classList.contains('is-on') ? 'X' : b.classList.contains('is-past') ? 'p' : 'o') + b.getAttribute('aria-selected')[0] + b.getAttribute('aria-expanded')[0]).join(',');
  const items = [...document.querySelectorAll('.lp-item')].map((e) => (e.classList.contains('is-on') ? 'X' : 'o')).join('');
  const panes = [...document.querySelectorAll('.lpd-pane')].map((e) => (e.classList.contains('is-on') ? 'X' : 'o') + e.getAttribute('aria-hidden')[0]).join(',');
  const acc = [...document.querySelectorAll('.lp-acc')].map((e) => Math.round(e.getBoundingClientRect().height)).join(',');
  const lpd = document.querySelector('.lpd').getBoundingClientRect();
  const ae = document.activeElement;
  return {
    pr: pr.getAttribute('data-active') + ' ' + document.querySelector('.pr-reading').getAttribute('data-num') + ' ' + [...document.querySelectorAll('.pr-chapter')].map((b) => b.getAttribute('aria-pressed')[0]).join('') + ' ' + n(document.querySelector('.pr-reading-title')),
    p: lp.style.getPropertyValue('--p').trim(), prog: Math.round(document.querySelector('.lp-prog').getBoundingClientRect().width),
    nodes, items, panes, acc,
    cap: [...document.querySelectorAll('.cap-item')].map((c) => (c.classList.contains('cap-item--active') ? 'X' : 'o') + c.getAttribute('aria-pressed')[0]).join(','),
    ops: Math.round(document.querySelector('.ops-model').getBoundingClientRect().top), lpd: Math.round(lpd.top) + '..' + Math.round(lpd.bottom),
    focus: ae && ae !== document.body ? ae.tagName + ':' + cls(ae) + ':' + (ae.getAttribute('aria-label') || n(ae).replace(/\s/g, '').slice(0, 20)) : 'body',
  };
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
    // after the last scan of the shared scroll motion (~2.6 s after load), so it cannot move things mid-test
    await page.waitForTimeout(3200);
    // the source sets html{scroll-behavior:smooth}, which also animates Playwright's own scroll-into-view;
    // switch it off on both sides so pointer actions land on the same element (the port never sets it)
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    return page;
  };
  const snap = (page) => page.evaluate(STATE);
  // jump to a section, then let the shared scroll motion finish revealing what came on screen (0.7 s fade-up)
  const toTop = async (page, sel, off) => { await page.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: 'instant' }); }, [sel, off]); await page.waitForTimeout(1300); };

  /* ---- desktop: principle chapters, loop nodes + reveal scroll, prev/next, capabilities ---- */
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('initial ' + w, await snap(page));
    await toTop(page, '.pr', 0);
    for (const i of [1, 3]) { await page.locator('.pr-chapter').nth(i).hover(); await page.waitForTimeout(60); log('hover chapter ' + i, await snap(page)); }
    await page.locator('.pr-chapter').nth(0).focus(); await page.waitForTimeout(60); log('focus chapter 0', await snap(page));
    // the loop: section head at the top, then pick nodes (source scrolls the detail card into view)
    await toTop(page, '.ops-model', 0);
    // desktop buttons are 0×0 anchors; their visible content (.lp-in) is what a pointer hits
    await page.locator('.lp-n .lp-dot').nth(2).click(); await page.waitForTimeout(1600); log('click node 2 ' + w, await snap(page));
    await page.locator('.lp-n .lp-t').nth(2).click(); await page.waitForTimeout(1600); log('click node 2 again ' + w, await snap(page));
    const next = '.lpd-ctrl button >> nth=1', prev = '.lpd-ctrl button >> nth=0';
    for (let k = 0; k < 4; k++) { await page.locator(next).click(); await page.waitForTimeout(60); }
    await page.waitForTimeout(700); log('next x4 (wraps)', await snap(page));
    await page.locator(prev).click(); await page.waitForTimeout(700); log('prev (wraps)', await snap(page));
    await page.locator(prev).focus(); await page.keyboard.press('Enter'); await page.keyboard.press('Space'); await page.waitForTimeout(700); log('kbd prev x2', await snap(page));
    await page.locator('.lp-n').nth(5).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1600); log('kbd node 5', await snap(page));
    await page.keyboard.press('Shift+Tab'); log('shift+tab', (await snap(page)).focus);
    await page.locator('.lp-n .lp-dot').nth(3).hover(); await page.waitForTimeout(500);
    log('node hover', await page.evaluate(() => { const d = document.querySelectorAll('.lp-dot')[3]; return getComputedStyle(d).transform + ' ' + getComputedStyle(d).borderColor; }));
    // capabilities
    await toTop(page, '.caps-arch', 0);
    for (const i of [0, 3]) { await page.locator('.cap-item').nth(i).hover(); await page.waitForTimeout(60); log('hover cap ' + i, (await snap(page)).cap); }
    await page.locator('.cap-item').nth(5).click(); await page.waitForTimeout(60); log('click cap 5', (await snap(page)).cap);
    await page.close();
  }

  /* ---- tablet + phone: accordion ---- */
  for (const [w, h] of [[1023, 800], [768, 1024], [390, 844], [320, 640]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    await toTop(page, '.ops-model', 0);
    await page.locator('.lp-n').nth(2).tap(); await page.waitForTimeout(600);
    const a = await snap(page);
    await page.locator('.lp-n').nth(2).tap(); await page.waitForTimeout(600);
    const b = await snap(page);
    await page.locator('.lp-n').nth(5).tap(); await page.waitForTimeout(600);
    log('touch ' + w, [a, b, await snap(page), await page.evaluate(() => [getComputedStyle(document.querySelector('.lpd-stack')).display, getComputedStyle(document.querySelector('.lp-loopnote')).display, getComputedStyle(document.querySelector('.lp-ring')).display])]);
    await page.locator('.pr-chapter').nth(2).tap(); await page.locator('.cap-item').nth(4).tap(); await page.waitForTimeout(80);
    log('touch pr/cap ' + w, [(await snap(page)).pr, (await snap(page)).cap]);
    await page.close();
  }

  /* ---- reduced motion: instant reveal scroll, no transitions ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await toTop(page, '.ops-model', 0);
    await page.locator('.lp-n .lp-dot').nth(4).click(); await page.waitForTimeout(150);
    log('reduced motion', [await snap(page), await page.evaluate(() => [getComputedStyle(document.querySelector('.lpd-pane')).transitionDuration, getComputedStyle(document.querySelector('.lp-prog')).transitionDuration])]);
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(24) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
