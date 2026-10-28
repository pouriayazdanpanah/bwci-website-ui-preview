// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and prints a
// comparable trace (port ids/classes are normalised by dropping the who- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
// (header, drawer, breadcrumb, footer and the shared scroll motion are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js; this script covers the page's own sections and interactions)
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;
// source selector, written once; the port's is the same with who- classes/ids (except #purpose/#role/#principles)
const S = (sel) => sel + ', ' + sel.replace(/\.(?!gv-)([a-z][\w-]*)/g, '.who-$1').replace(/#(top|glance|how|explore|leadership|next)\b/g, '#who-$1');

const STYLE = ([sel, props, pseudo]) => {
  const el = document.querySelector(sel);
  if (!el) return 'missing ' + sel;
  const cs = getComputedStyle(el, pseudo || null);
  const r = el.getBoundingClientRect();
  return props.map((p) => (p === 'box' ? Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) : cs.getPropertyValue(p).replace(/who-/g, ''))).join(' | ');
};
const CAROUSEL = ([sel]) => {
  const ul = document.querySelector(sel);
  const cs = getComputedStyle(ul);
  const lis = [...ul.children].map((li) => { const r = li.getBoundingClientRect(); return Math.round(r.left) + '+' + Math.round(r.width); }).join(' ');
  return [cs.display, cs.overflowX, cs.scrollSnapType, cs.cursor, cs.touchAction, 'scroll ' + Math.round(ul.scrollLeft) + '/' + (ul.scrollWidth - ul.clientWidth), 'drag=' + /(^|\s)(who-)?is-drag(\s|$)/.test(ul.className), lis].join(' | ');
};
const CARD = ([i]) => {
  const a = document.querySelectorAll('#leadership a.gv-card, #who-leadership a.gv-card')[i];
  const cs = getComputedStyle(a);
  const slot = a.querySelector('image-slot, .who-slot');
  const img = slot.shadowRoot ? slot.shadowRoot.querySelector('img') : slot.querySelector('img');
  const ov = getComputedStyle(a.querySelector('.gv-card-ov'));
  const r = img.getBoundingClientRect(), f = slot.getBoundingClientRect();
  return [a.getAttribute('aria-label'), cs.transform, cs.boxShadow.slice(0, 40), cs.borderTopColor, getComputedStyle(slot).transform, ov.opacity, ov.transform,
    cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineOffset, 'img ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' in ' + Math.round(f.width) + 'x' + Math.round(f.height)].join(' | ');
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(28) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // after the last scan of the shared scroll motion
    // record clicks that reach the document (and stop them navigating away)
    await page.evaluate(() => { window.__clicks = []; document.addEventListener('click', (e) => { if (!window.__clicks) return; const a = e.target.closest('a'); window.__clicks.push(a ? a.getAttribute('aria-label') || a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : e.target.tagName); e.preventDefault(); }); });
    return page;
  };
  const st = (page, sel, props, pseudo) => page.evaluate(STYLE, [S(sel), props, pseudo || null]);
  const scrollTo = (page, sel, off) => page.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: 'instant' }); }, [S(sel), off]).then(() => page.waitForTimeout(1300));

  /* ---- desktop / tablet ---- */
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('hero ' + w, [await st(page, '.hero', ['box', 'min-height', 'display']), await st(page, '.hero-img', ['box', 'opacity', 'mask-image']), await st(page, '.hero-img img', ['box', 'animation-name', 'animation-duration', 'object-fit'])]);
    log('glance ' + w, [await st(page, '.gl-facts', ['box', 'grid-template-columns']), await st(page, '.gl-f:nth-child(3)', ['box', 'border-top-width', 'border-left-width'])]);
    await page.locator(S('.gl-f')).nth(1).hover(); await page.waitForTimeout(500);
    log('glance hover', [await st(page, '.gl-f:nth-child(2)', ['background-color']), await st(page, '.gl-f:nth-child(2) .gl-ic', ['background-color', 'color', 'transform'])]);
    const solid = page.locator(S('.hero-btn--solid'));
    await solid.hover(); await page.waitForTimeout(300);
    log('hero btn hover', await st(page, '.hero-btn--solid', ['background-color', 'color', 'border-color']));
    await page.mouse.move(5, 5); await page.waitForTimeout(300);
    // the role aside is sticky at ≥ 1024 px
    await scrollTo(page, '#role .ro-list', -20);
    await page.evaluate(() => window.scrollBy(0, 260)); await page.waitForTimeout(300);
    log('role aside ' + w, [await st(page, '.ro-side', ['box', 'position', 'top']), await st(page, '.ro-g', ['grid-template-columns'])]);
    // principles card hover
    await scrollTo(page, '#principles', 0);
    await page.locator(S('.pr-i')).nth(1).hover(); await page.waitForTimeout(600);
    log('principle hover', [await st(page, '.pr-i:nth-child(2)', ['transform', 'border-top-color']), await st(page, '.pr-i:nth-child(2)', ['opacity'], '::before'), await st(page, '.pr-i:nth-child(2) .pr-n', ['color']), await st(page, '.pr-i:nth-child(2) .pr-ic', ['background-color', 'color'])]);
    await page.mouse.move(5, 5); await page.waitForTimeout(600);
    // engine strip lights once 45 % visible
    log('engine before ' + w, await page.evaluate((s) => document.querySelector(s).className.replace(/who-/g, ''), S('#how .lp')));
    await scrollTo(page, '#how .lp', 200); await page.waitForTimeout(1600);
    log('engine lit ' + w, [await page.evaluate((s) => document.querySelector(s).className.replace(/who-/g, ''), S('#how .lp')), await st(page, '.lp-n:nth-child(6) .lp-dot', ['border-top-color']), await st(page, '.lp-n:nth-child(6) .lp-dot', ['background-color', 'transform'], '::after'), await st(page, '.lp', ['box', 'height']), await st(page, '.lp-loopnote', ['display'])]);
    // explore rows
    await scrollTo(page, '#explore', 0);
    await page.locator(S('.ex-c')).nth(0).hover(); await page.waitForTimeout(700);
    log('explore hover', [await st(page, '.ex-c', ['transform'], '::before'), await st(page, '.ex-c h3', ['transform']), await st(page, '.ex-c .ex-go', ['background-color', 'color', 'width']), await st(page, '.ex-c .ex-go .ar', ['transform'])]);
    await page.mouse.move(5, 5); await page.waitForTimeout(700);
    // cards
    await scrollTo(page, '#leadership', 0);
    log('carousel ' + w, await page.evaluate(CAROUSEL, [S('.ld-g')]));
    for (const i of [0, 3]) log('card ' + i, await page.evaluate(CARD, [i]));
    await page.locator('a.gv-card').nth(2).hover(); await page.waitForTimeout(700);
    log('hover card 2', await page.evaluate(CARD, [2]));
    await page.mouse.move(5, 5); await page.waitForTimeout(700);
    await page.locator('a.gv-card').nth(3).focus(); await page.waitForTimeout(400);
    log('focus card 3', await page.evaluate(CARD, [3]));
    // press-move-release on a grid that does not overflow: a plain click
    const box = await page.locator('a.gv-card').nth(0).boundingBox();
    await page.mouse.move(box.x + 60, box.y + 60); await page.mouse.down(); await page.mouse.move(box.x + 20, box.y + 60, { steps: 5 }); await page.mouse.up();
    await page.waitForTimeout(100);
    log('grid press-move-up', [await page.evaluate(CAROUSEL, [S('.ld-g')]), await page.evaluate(() => window.__clicks.splice(0))]);
    log('next ' + w, [await st(page, '#next', ['box']), await st(page, '#next .nx-links', ['flex-direction'])]);
    await page.close();
  }

  /* ---- in-page anchor: "Our role ↓" ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.evaluate(() => { window.__clicks = null; }); // let the anchor through
    await page.locator(S('.hero-btn--solid')).click(); await page.waitForTimeout(1500);
    log('anchor our role', await page.evaluate(() => ({ y: Math.round(scrollY), roleTop: Math.round(document.getElementById('role').getBoundingClientRect().top), hash: location.hash, focus: document.activeElement === document.body ? 'body' : document.activeElement.tagName })));
    await page.close();
  }

  /* ---- phone / narrow, mouse: carousel drag + snap ---- */
  for (const [w, h] of [[390, 844], [320, 640], [700, 900]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('hero ' + w, [await st(page, '.hero', ['box', 'display']), await st(page, '.hero-img', ['box', 'opacity']), await st(page, '.hero-img img', ['box', 'object-fit', 'object-position', 'opacity', 'animation-name'])]);
    log('glance ' + w, [await st(page, '.gl-facts', ['box', 'grid-template-columns', 'margin-top']), await st(page, '.gl-f:nth-child(2)', ['box', 'grid-template-columns'])]);
    await scrollTo(page, '#how .lp', 200); await page.waitForTimeout(1400);
    log('engine ' + w, [await page.evaluate((s) => document.querySelector(s).className.replace(/who-/g, ''), S('#how .lp')), await st(page, '.lp', ['box']), await st(page, '.lp-n:nth-child(3) .lp-in', ['box', 'grid-template-columns'])]);
    await scrollTo(page, '#leadership .ld-g', 160);
    log('carousel ' + w, await page.evaluate(CAROUSEL, [S('.ld-g')]));
    const ul = await page.locator(S('.ld-g')).boundingBox();
    const y = ul.y + 120;
    await page.mouse.move(ul.x + 200, y); await page.mouse.down(); await page.mouse.move(ul.x + 196, y, { steps: 2 }); await page.mouse.up();
    await page.waitForTimeout(100);
    log('short move ' + w, [await page.evaluate(CAROUSEL, [S('.ld-g')]), await page.evaluate(() => window.__clicks.splice(0))]);
    await page.mouse.move(ul.x + 250, y); await page.mouse.down(); await page.mouse.move(ul.x + 160, y, { steps: 6 });
    log('dragging ' + w, await page.evaluate(CAROUSEL, [S('.ld-g')]));
    await page.mouse.move(ul.x + 110, y, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(100);
    log('released ' + w, [await page.evaluate(() => window.__clicks.splice(0))]);
    await page.waitForTimeout(1000);
    log('snapped ' + w, await page.evaluate(CAROUSEL, [S('.ld-g')]));
    const c = await page.locator('a.gv-card').nth(1).boundingBox();
    await page.mouse.click(Math.max(c.x, 0) + 40, c.y + 40); await page.waitForTimeout(100);
    log('click after drag ' + w, await page.evaluate(() => window.__clicks.splice(0)));
    await page.close();
  }

  /* ---- phone, touch: overlay shown, native swipe (no drag handler) ---- */
  {
    const page = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await scrollTo(page, '#leadership .ld-g', 160);
    log('touch carousel', await page.evaluate(CAROUSEL, [S('.ld-g')]));
    log('touch card 0', await page.evaluate(CARD, [0]));
    const c = await page.locator('a.gv-card').nth(0).boundingBox();
    await page.touchscreen.tap(c.x + 40, c.y + 40); await page.waitForTimeout(200);
    log('touch tap card 0', [await page.evaluate(CAROUSEL, [S('.ld-g')]), await page.evaluate(() => window.__clicks.splice(0))]);
    await page.close();
  }

  /* ---- live resize ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    for (const w of [1100, 900, 700, 500, 1600]) {
      await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(400);
      log('resize ' + w, [await st(page, '.hero-img img', ['box']), await st(page, '.gl-facts', ['grid-template-columns']), await page.evaluate(CAROUSEL, [S('.ld-g')]), await st(page, '.pr-g', ['grid-template-columns'])]);
    }
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    log('reduced hero img', await st(page, '.hero-img img', ['animation-name']));
    await scrollTo(page, '#principles', 0);
    await page.locator(S('.pr-i')).nth(0).hover(); await page.waitForTimeout(600);
    log('reduced principle hover', await st(page, '.pr-i:nth-child(1)', ['transform']));
    await scrollTo(page, '#how .lp', 200); await page.waitForTimeout(800);
    log('reduced engine', [await page.evaluate((s) => document.querySelector(s).className.replace(/who-/g, ''), S('#how .lp')), await st(page, '.lp-n:nth-child(6) .lp-dot', ['transition-delay'])]);
    await scrollTo(page, '#explore', 0);
    await page.locator(S('.ex-c')).nth(0).hover(); await page.waitForTimeout(700);
    log('reduced explore hover', await st(page, '.ex-c h3', ['transform']));
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(28) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
