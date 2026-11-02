// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   NODE_PATH=$(npm root -g) node behaviour.js <url>  > trace.txt
// Port classes and ids are normalised by dropping the cnt- prefix. Covers: the five copy buttons (state, label, icon,
// spoken message, clipboard text, the 1.6 s reset, switching between buttons, keyboard), the "Contact details" jump
// (smooth scroll, final position, hash, focus), the sticky registered-office panel, the hover states of the hero
// buttons, enquiry routes, channels, copy buttons, links and the Providence Asset Management button, the hero image
// drift, live resize across the page's breakpoints, and reduced motion.
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [url] = process.argv.slice(2);
// a source selector and its port equivalent (every class and id carries cnt-)
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.cnt-$1').replace(/#([a-z][\w-]*)/g, '#cnt-$1');

(async () => {
  const browser = await chromium.launch();
  const lines = [];
  const log = (k, v) => lines.push(k + ' ' + JSON.stringify(v));
  const open = async (w, h, reducedMotion) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reducedMotion || 'no-preference', permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    await routeReact(page);
    page.on('pageerror', (e) => log('ERROR', String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    // let the shared scroll motion settle first (its scans run 0.3, 1.2 and 2.6 s after the window load event)
    await page.evaluate(() => (document.readyState === 'complete' ? null : new Promise((r) => window.addEventListener('load', r, { once: true }))));
    await page.waitForTimeout(3000);
    return page;
  };
  const styles = (loc, props) => loc.evaluate((e, ps) => ps.map((p) => getComputedStyle(e)[p]).join(' ; '), props);
  const copyState = (page) => page.evaluate((sel) => ({
    btns: [...document.querySelectorAll(sel)].map((b) => b.getAttribute('data-copied') + ':' + b.getAttribute('aria-label') + ':' +
      [...b.querySelectorAll('[data-s]')].map((s) => getComputedStyle(s).opacity).join('/')).join(' | '),
    live: document.querySelector('[aria-live="polite"]').textContent,
  }), 'button.cp, button.cnt-cp');
  const clip = (page) => page.evaluate(() => navigator.clipboard.readText().catch((e) => 'ERR ' + e.name));

  // 1. copy buttons
  {
    const page = await open(1440, 900);
    const btn = (i) => page.locator('button.cp, button.cnt-cp').nth(i);
    log('copy initial', await copyState(page));
    await btn(0).evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(1500);
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => navigator.clipboard.writeText('-'));
      await btn(i).click(); await page.waitForTimeout(400);
      log('copy ' + i, Object.assign(await copyState(page), { clipboard: await clip(page) }));
    }
    // the last one clears 1.6 s after its click (sampled once the 0.2 s icon fade has settled)
    await page.waitForTimeout(1700);
    log('copy reset', await copyState(page));
    // a second click restarts the timer; another button takes over
    await btn(1).click(); await page.waitForTimeout(1000); await btn(1).click(); await page.waitForTimeout(1000);
    log('copy restarted', await copyState(page));
    await btn(3).click(); await page.waitForTimeout(400);
    log('copy switched', await copyState(page));
    await page.waitForTimeout(1800);
    // keyboard: Enter and Space on a focused copy button
    await btn(0).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    log('copy enter', await copyState(page));
    await page.waitForTimeout(1800);
    await btn(2).focus(); await page.keyboard.press('Space'); await page.waitForTimeout(400);
    log('copy space', Object.assign(await copyState(page), { focus: await page.evaluate(() => document.activeElement.getAttribute('aria-label')) }));
    log('copy transitions', await page.evaluate((s) => [...document.querySelector(s).querySelectorAll('[data-s]')].map((e) => getComputedStyle(e).transition), 'button.cp, button.cnt-cp'));
    await page.context().close();
  }

  // 2. "Contact details": smooth scroll to the section, final position, hash and focus
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await open(w, h);
    const a = page.locator('a[href="#details"], a[href="#cnt-details"]').first();
    await a.click();
    await page.waitForTimeout(150);
    const mid = await page.evaluate(() => scrollY);
    await page.waitForTimeout(1600);
    log(w + ' details jump', await page.evaluate(([m, s]) => ({
      moving: m > 0 && m < scrollY, y: Math.round(scrollY),
      top: Math.round(document.querySelector(s).getBoundingClientRect().top),
      hash: location.hash.replace('cnt-', ''), focus: document.activeElement === document.body ? 'body' : document.activeElement.tagName,
    }), [mid, S('#details')]));
    await page.context().close();
  }

  // 3. sticky registered-office panel (≥1024 px), released below
  for (const w of [1440, 1023]) {
    const page = await open(w, 900);
    const r = await page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { top: b.top + scrollY, h: b.height }; }, S('.dir'));
    const out = [];
    for (const f of [0, 0.4, 0.8, 1.2]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(r.top - 100 + r.h * f)); await page.waitForTimeout(200);
      out.push(await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top) + ' ' + getComputedStyle(document.querySelector(s)).position, S('.cd-ro')));
    }
    log(w + ' sticky office', out);
    await page.context().close();
  }

  // 4. hover states (desktop, fine pointer)
  {
    const page = await open(1440, 900);
    const hover = async (label, sel, inner, props) => {
      const loc = page.locator(S(sel)).first();
      // wait out the shared scroll reveal (0.7 s plus its stagger) so the hover does not land mid-reveal
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(1500);
      await page.mouse.move(2, 2); await page.waitForTimeout(500);
      const before = await styles(loc, props);
      const ib = inner ? await styles(loc.locator(S(inner)).first(), ['backgroundColor', 'color', 'borderColor', 'transform']) : '';
      await loc.hover(); await page.waitForTimeout(600);
      log('hover ' + label, { before, after: await styles(loc, props), inner: inner ? [ib, await styles(loc.locator(S(inner)).first(), ['backgroundColor', 'color', 'borderColor', 'transform'])] : null });
    };
    const P = ['backgroundColor', 'color', 'borderTopColor', 'transform', 'boxShadow', 'transition'];
    await hover('hero solid', '.hero-btn--solid', null, P);
    await hover('hero ghost', '.hero-btn--ghost', null, P);
    await hover('route', '.rt-r', '.rt-go', P);
    await hover('route title', '.rt-r', 'b', P);
    await hover('route arrow', '.rt-r', '.rt-go .ar', P);
    await hover('lead button', '.rt-lead .hero-btn', null, P);
    await hover('office copy', '.cd-ro .cp', null, P);
    await hover('channel', '.ch', null, P);
    await hover('channel link', '.ch-t a', null, ['color', 'textDecorationColor', 'transition']);
    await hover('channel copy', '.cp--l', null, P);
    await hover('company information', '.dr-hd .hlink', '.ar', P);
    await hover('pam button', '.cd-ext', 'svg', P);
    await hover('verify link', '.vn .hlink', '.ar', P);
    await hover('next button', '#next .btn', null, P);
    await hover('next link', '.nx-links .hlink', '.ar', P);
    // keyboard: Tab order through the hero and the router
    await page.evaluate((s) => { const a = document.querySelector(s); a.scrollIntoView({ block: 'center', behavior: 'instant' }); a.focus(); }, S('.hero-btn--solid'));
    const order = [];
    for (let i = 0; i < 7; i++) {
      order.push(await page.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)) + ':' + getComputedStyle(a).outlineStyle; }));
      await page.keyboard.press('Tab');
    }
    log('tab from hero', order);
    // the copy buttons in the directory, in order
    await page.evaluate((s) => { const a = document.querySelector(s); a.scrollIntoView({ block: 'center', behavior: 'instant' }); a.focus(); }, S('.cd-ro .cp'));
    const order2 = [];
    for (let i = 0; i < 9; i++) {
      order2.push(await page.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30)); }));
      await page.keyboard.press('Tab');
    }
    log('tab from office', order2);
    await page.context().close();
  }

  // 5. hero image drift (animation definition and that it moves), and none on phones
  for (const w of [1440, 390]) {
    const page = await open(w, 900);
    const img = S('.hero-img img');
    log(w + ' drift', await page.evaluate((s) => { const c = getComputedStyle(document.querySelector(s)); return [c.animationName.replace(/^cnt-/, ''), c.animationDuration, c.animationTimingFunction, c.animationIterationCount, c.animationDirection, c.opacity, c.objectFit, c.objectPosition]; }, img));
    const a = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, img);
    await page.waitForTimeout(2000);
    const b = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, img);
    log(w + ' drift moves', a !== b);
    await page.context().close();
  }

  // 6. live resize across the breakpoints: grids, the hero, the router and directory
  {
    const page = await open(1440, 900);
    const grids = ['.hero', '.hero-img', '.rt-card', '.rt-lead .hero-btn', '.cd-grid', '.dr', '.ch', '.cd-pam', '.vn', '.nx-links'].map(S);
    for (const [w, h] of [[1100, 900], [1024, 900], [1023, 900], [900, 900], [899, 900], [768, 900], [767, 900], [641, 900], [640, 900], [561, 900], [560, 900], [360, 640], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      log('resize ' + w, await page.evaluate((gs) => gs.map((g) => { const e = document.querySelector(g); if (!e) return '-'; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.display + ' ' + c.gridTemplateColumns + ' ' + c.flexDirection + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }).concat([document.documentElement.scrollWidth]), grids));
    }
    await page.context().close();
  }

  // 7. reduced motion: no drift, no hover slide, the copy icons swap without movement, smooth jump off
  {
    const page = await open(1440, 900, 'reduce');
    log('reduced drift', await page.evaluate((s) => getComputedStyle(document.querySelector(s)).animationName, S('.hero-img img')));
    await page.locator(S('.rt-r')).first().hover(); await page.waitForTimeout(500);
    log('reduced route', await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, S('.rt-r b')));
    await page.locator('button.cp, button.cnt-cp').first().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(1500);
    await page.locator('button.cp, button.cnt-cp').first().click(); await page.waitForTimeout(100);
    log('reduced copy', await page.evaluate((s) => [...document.querySelector(s).querySelectorAll('[data-s]')].map((e) => getComputedStyle(e).transform + ' ' + getComputedStyle(e).filter), 'button.cp, button.cnt-cp'));
    await page.context().close();
  }
  console.log(lines.join('\n').replace(/cnt-/g, ''));
  await browser.close();
})();
