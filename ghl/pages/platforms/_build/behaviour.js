// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (port class names are normalised by dropping the plt- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

// snapshot of the directory state; works on the source and on the port
const STATE = () => {
  const sec = document.querySelector('#directory, #plt-directory');
  const n = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const cls = (el) => (el.getAttribute('class') || '').split(/\s+/).filter((c) => c && c !== 'sc-interp').map((c) => c.replace(/^plt-/, '')).join('.');
  const chips = [...sec.querySelectorAll('.tb-g')].map((g) => [...g.querySelectorAll('button')].map((b) => (b.getAttribute('aria-pressed') === 'true' ? '*' : '') + n(b) + (/chip--zero/.test(b.className) ? '(z)' : '')).join('|'));
  const mix = [...sec.querySelectorAll('.mx-btn')].map((b) => b.getAttribute('aria-pressed')).join(',');
  const bar = [...sec.querySelectorAll('.mx-bar i')].map(cls).join(',');
  const res = sec.querySelector('.tb-res');
  const afs = [...res.querySelectorAll('button')].map((b) => cls(b) + ':' + n(b) + ':' + (b.getAttribute('aria-label') || ''));
  const vt = [...sec.querySelectorAll('.vt button')].map((b) => b.getAttribute('aria-pressed')).join(',');
  const jb = sec.querySelector('.jb');
  const results = sec.querySelector('.dr-results');
  const view = results.querySelector('.dg') ? 'grid' : results.querySelector('.lv') ? 'list' : results.querySelector('.dr-empty') ? 'empty' : 'none';
  const items = [...results.querySelectorAll('.pd, .lv-item')].map((el) => {
    const name = n(el.querySelector('.pd-name, .lv-name b'));
    const x = el.querySelector('.lv-x');
    const row = el.querySelector('.lv-row');
    return cls(el) + '[' + name + ']' + el.style.animationDelay + (row ? ' exp=' + row.getAttribute('aria-expanded') : '') + (x ? ' X{' + n(x).slice(0, 60) + '}' : '');
  });
  const ae = document.activeElement;
  const focus = ae && ae !== document.body ? ae.tagName + ':' + cls(ae) + ':' + n(ae).slice(0, 30) : 'body';
  return { chips, mix, bar, res: n(res.querySelector('b')), afs, vt, jb: jb ? n(jb) : null, view, items, empty: view === 'empty' ? n(results.querySelector('.dr-empty')) : undefined, fn: n(results.querySelector('.dr-fn')).slice(0, 30), focus };
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(20) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts, u) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(u || url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    return page;
  };
  const click = async (page, css, i = 0) => { await page.locator(css).nth(i).click(); await page.waitForTimeout(150); };
  const chip = (g, i) => `.tb-g >> nth=${g} >> button >> nth=${i}`;
  const snap = (page) => page.evaluate(STATE);
  const tbTop = (page) => page.evaluate(() => Math.round(document.querySelector('#directory .tb, #plt-directory .tb').getBoundingClientRect().top));
  // restart check: a card that was re-mounted has a fresh entrance animation
  const anim = (page) => page.evaluate(() => {
    const el = document.querySelector('.dr-results .pd, .dr-results .lv-item');
    if (!el) return null;
    return el.getAnimations().map((a) => a.animationName.replace(/^plt-/, '') + '@' + (a.currentTime < 400 ? 'fresh' : 'old')).join(',');
  });

  /* ---- desktop filters ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    log('initial', await snap(page));
    await click(page, chip(0, 1)); log('mat Operating', await snap(page)); log('  anim', await anim(page));
    await page.waitForTimeout(800);
    await click(page, chip(1, 3)); log('rel Partner', await snap(page)); log('  anim', await anim(page));
    await page.waitForTimeout(800);
    await click(page, chip(1, 3)); log('rel Partner again', await snap(page)); log('  anim (no change)', await anim(page));
    await click(page, '.tb-res .af', 0); log('remove mat af', await snap(page));
    await click(page, '.mx-btn', 1); log('mix In Dev', await snap(page));
    await click(page, '.mx-btn', 1); log('mix In Dev again', await snap(page));
    await click(page, chip(1, 2)); await click(page, chip(0, 1)); log('Operating+Build', await snap(page));
    await click(page, '.dr-empty button'); log('empty -> clear', await snap(page));
    await click(page, chip(0, 3)); await click(page, '.af--clear'); log('clear all', await snap(page));
    // keyboard: Space on a focused chip
    await page.locator(chip(1, 4)).focus(); await page.keyboard.press('Space'); await page.waitForTimeout(150);
    log('kbd Space chip', await snap(page));
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    log('kbd Enter same', await snap(page));
    await page.close();
  }

  /* ---- every maturity x relationship combination, in both views ---- */
  {
    const page = await open({ viewport: { width: 1280, height: 900 } });
    for (const view of [0, 1]) {
      await click(page, '.vt button', view);
      const combos = [];
      for (let m = 0; m < 4; m++) {
        for (let r = 0; r < 5; r++) {
          await page.locator(chip(0, m)).click(); await page.locator(chip(1, r)).click(); await page.waitForTimeout(40);
          const s = await snap(page);
          combos.push(m + '' + r + ':' + s.res + ':' + s.view + ':' + s.items.map((x) => x.replace(/\].*$/, '').replace(/^.*\[/, '').split(' ').map((w) => w[0]).join('')).join(',') + ':' + s.chips.join('/').replace(/[^0-9*z|/]/g, ''));
        }
      }
      log('combos ' + (view ? 'list' : 'grid'), combos);
    }
    await page.close();
  }

  /* ---- register jumps, list view, rows ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.evaluate(() => document.querySelector('#registers, #plt-registers').scrollIntoView());
    await click(page, '.rx-tile', 5); await page.waitForTimeout(1200);
    log('tile Community', await snap(page)); log('  tb top', await tbTop(page));
    await click(page, '.vt button', 1); log('list view', await snap(page)); log('  anim', await anim(page));
    await click(page, '.lv-row', 0); log('open row', await snap(page));
    await click(page, '.lv-row', 0); log('close row', await snap(page));
    await click(page, '.lv-row', 0);
    await click(page, '.jb-btn--x'); log('dismiss jb', await snap(page)); log('  anim (kept)', await anim(page));
    await click(page, '.rx-link', 1); await page.waitForTimeout(1200);
    log('rx-link In Dev', await snap(page)); log('  tb top', await tbTop(page));
    await click(page, '.lv-row', 2); await click(page, '.lv-row', 1); log('rows 2 then 1', await snap(page));
    await click(page, '.jb-btn', 0); await page.waitForTimeout(1200);
    log('back to registers', await page.evaluate(() => Math.round(document.querySelector('#registers, #plt-registers').getBoundingClientRect().top)));
    log('  state', await snap(page));
    await click(page, chip(1, 2)); log('filter keeps open', await snap(page));
    await click(page, '.rx-link', 2); await page.waitForTimeout(1200);
    await click(page, '.jb-btn', 1); log('jb show all', await snap(page));
    await click(page, '.vt button', 0); log('grid again', await snap(page));
    await click(page, '.rx-tile', 0); await page.waitForTimeout(1200);
    await click(page, '.rx-tile', 1); await page.waitForTimeout(1200);
    log('tile, tile', await snap(page)); log('  tb top', await tbTop(page));
    await page.close();
  }

  /* ---- URL initial state ---- */
  for (const qs of ['?maturity=Proposed&relationship=Group%20Build', '?maturity=In+Development&x=1', '?relationship=Enabling%20Layer#top']) {
    const u = url.replace(/[?#].*$/, '') + qs;
    const page = await open({ viewport: { width: 1280, height: 900 } }, u);
    const s = await snap(page);
    log('url ' + qs, [s.chips, s.res, s.view, s.items.length]);
    await page.close();
  }

  /* ---- mobile list ---- */
  {
    const page = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await page.locator('.vt button').nth(1).tap(); await page.waitForTimeout(150);
    await page.locator('.lv-row').nth(3).tap(); await page.waitForTimeout(150);
    log('mobile list open', await snap(page));
    log('mobile row cols', await page.evaluate(() => [...document.querySelectorAll('.lv-item--open .lv-row > span')].map((s) => getComputedStyle(s).display).join(',')));
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(20) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
