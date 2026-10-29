// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and prints a
// comparable trace (port classes/ids are normalised by dropping the pam- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
// (header, drawer, breadcrumb, footer and the shared scroll motion are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js; this script covers the page's own sections and interactions)
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;
// a source selector and its port equivalent (every class and id carries pam-, except the gv- card classes)
const S = (sel) => sel + ', ' + sel.replace(/\.(?!gv-)([a-z][\w-]*)/g, '.pam-$1').replace(/#([a-z][\w-]*)/g, '#pam-$1');
const norm = (c) => String(c).replace(/\bpam-/g, '');

const STYLE = ([sel, props, pseudo]) => {
  const el = document.querySelector(sel);
  if (!el) return 'missing ' + sel;
  const cs = getComputedStyle(el, pseudo || null);
  const r = el.getBoundingClientRect();
  return props.map((p) => (p === 'box' ? Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) : cs.getPropertyValue(p))).join(' | ');
};
// reach map: reveal / active state, parallax values, canvas size and (optionally) a checksum of its pixels
const MAP = ([withPixels]) => {
  const fig = document.querySelector('figure.cl-map, figure.pam-cl-map');
  const inner = fig.querySelector('.cl-map-in, .pam-cl-map-in');
  const cv = fig.querySelector('canvas');
  const tips = [...fig.querySelectorAll('.cl-tip, .pam-cl-tip')];
  const lines = [...fig.querySelectorAll('polyline')];
  const out = {
    fig: fig.className.replace(/pam-/g, ''),
    on: tips.map((t, i) => (/(^| )(pam-)?on( |$)/.test(t.className) ? i : '')).join('') + '/' + lines.map((l, i) => (/(^| )(pam-)?on( |$)/.test(l.getAttribute('class') || '') ? i : '')).join(''),
    tips: tips.map((t) => { const b = getComputedStyle(t.querySelector('b')); return b.opacity + ' ' + b.transform + ' ' + b.animationName.replace(/^pam-/, ''); }).join(' ; '),
    lines: lines.map((l) => getComputedStyle(l).strokeDashoffset + ' ' + getComputedStyle(l).stroke).join(' ; '),
    vars: inner.style.getPropertyValue('--px') + ',' + inner.style.getPropertyValue('--py'),
    layers: getComputedStyle(fig.querySelector('.cl-dots, .pam-cl-dots')).transform + ' / ' + getComputedStyle(fig.querySelector('.cl-tips, .pam-cl-tips')).transform,
    canvas: cv.width + 'x' + cv.height + ' css ' + Math.round(cv.getBoundingClientRect().width) + 'x' + Math.round(cv.getBoundingClientRect().height),
  };
  if (withPixels) {
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let h = 0, ink = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3]) ink++; h = (h * 31 + d[i] * 7 + d[i + 1] * 13 + d[i + 2] * 17 + d[i + 3]) >>> 0; }
    out.pixels = ink + ' px, sum ' + h.toString(16);
  }
  return out;
};
const CAROUSEL = ([sel]) => {
  const ul = document.querySelector(sel);
  const cs = getComputedStyle(ul);
  const lis = [...ul.children].map((li) => { const r = li.getBoundingClientRect(); return Math.round(r.left) + '+' + Math.round(r.width); }).join(' ');
  return [cs.display, cs.overflowX, cs.scrollSnapType, cs.cursor, 'scroll ' + Math.round(ul.scrollLeft) + '/' + (ul.scrollWidth - ul.clientWidth), 'drag=' + /(^|\s)(pam-)?is-drag(\s|$)/.test(ul.className), lis].join(' | ');
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(28) + ' ' + norm(JSON.stringify(v)));
  const errors = [];
  const open = async (opts) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // after the last scan of the shared scroll motion
    await page.evaluate(() => { window.__clicks = []; document.addEventListener('click', (e) => { if (!window.__clicks) return; const a = e.target.closest('a'); window.__clicks.push(a ? a.getAttribute('aria-label') || a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : e.target.tagName); e.preventDefault(); }); });
    return page;
  };
  const st = (page, sel, props, pseudo) => page.evaluate(STYLE, [S(sel), props, pseudo || null]);
  const scrollTo = (page, sel, off) => page.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: 'instant' }); }, [S(sel), off]).then(() => page.waitForTimeout(1300));
  const mapBox = (page) => page.locator(S('.cl-map-in')).first().boundingBox();

  /* ---- desktop / tablet, reduced motion (deterministic canvas) ---- */
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024]]) {
    const page = await open({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    log('hero ' + w, [await st(page, '.hero', ['box', 'display']), await st(page, '.hero-img', ['box']), await st(page, '.hero-img img', ['box', 'filter', 'mix-blend-mode', 'opacity'])]);
    log('facts ' + w, [await st(page, '.rf-facts', ['box', 'grid-template-columns', 'margin-top']), await st(page, '.rg-p', ['grid-template-columns'])]);
    await page.locator(S('.rf-f')).nth(1).hover(); await page.waitForTimeout(400);
    log('fact hover', [await st(page, '.rf-f:nth-child(2)', ['background-color']), await st(page, '.rf-f:nth-child(2) .ic', ['background-color', 'color', 'transform'])]);
    await page.locator(S('.hero-btn--ghost')).hover(); await page.waitForTimeout(300);
    log('hero ghost hover', await st(page, '.hero-btn--ghost', ['background-color', 'border-top-color']));
    await scrollTo(page, '#services', 0);
    await page.locator(S('.sv-c')).nth(4).hover(); await page.waitForTimeout(600);
    log('service hover', [await st(page, '.sv-c:nth-child(5)', ['transform', 'border-top-color', 'box-shadow']), await st(page, '.sv-c:nth-child(5)', ['transform'], '::before'), await st(page, '.sv-g', ['grid-template-columns'])]);
    await page.mouse.move(5, 5); await page.waitForTimeout(500);
    // reach map: before and after it reaches 25 % visibility
    log('map before ' + w, await page.evaluate(MAP, [false]));
    await scrollTo(page, '#clients .cl-map', 120); await page.waitForTimeout(2500);
    log('map in ' + w, await page.evaluate(MAP, [true]));
    const b = await mapBox(page);
    // near the UK anchor (column 89, row 15.5 of 180 × 71)
    await page.mouse.move(b.x + b.width * 89 / 180 + 6, b.y + b.height * 15.5 / 71 + 4, { steps: 4 }); await page.waitForTimeout(500);
    log('map near UK', await page.evaluate(MAP, [false]));
    // on the Middle East callout itself
    const me = page.locator(S('.cl-tip')).nth(3);
    await me.hover(); await page.waitForTimeout(500);
    log('map on ME tip', await page.evaluate(MAP, [false]));
    await page.mouse.move(5, 5); await page.waitForTimeout(800);
    log('map left', await page.evaluate(MAP, [true]));
    await page.locator(S('.cl-types li')).nth(2).hover(); await page.waitForTimeout(400);
    log('type hover', [await st(page, '.cl-types li:nth-child(3)', ['color']), await st(page, '.cl-types li:nth-child(3)', ['transform'], '::after'), await st(page, '.cl-types', ['grid-template-columns'])]);
    log('engine before ' + w, await page.evaluate((s) => document.querySelector(s).className, S('#engine .lp')));
    await scrollTo(page, '#engine .lp', 200); await page.waitForTimeout(1400);
    log('engine lit ' + w, [await page.evaluate((s) => document.querySelector(s).className, S('#engine .lp')), await st(page, '.lp-n:nth-child(3) .lp-dot', ['border-top-color', 'box-shadow']), await st(page, '.lp-n:nth-child(3) .lp-pam', ['display']), await st(page, '.lp', ['box'])]);
    await scrollTo(page, '#people', 0);
    log('people ' + w, [await page.evaluate(CAROUSEL, [S('.pp-g')]), await st(page, '.pp-g li:nth-child(2) .gv-role span', ['font-size', 'color'])]);
    await page.locator(S('.pp-g a.gv-card')).nth(1).hover(); await page.waitForTimeout(800);
    log('person hover', [await st(page, '.pp-g li:nth-child(2) .gv-card', ['transform', 'border-top-color']), await st(page, '.pp-g li:nth-child(2) .pp-ph', ['transform', 'background-position', 'background-size']), await st(page, '.pp-g li:nth-child(2) .gv-card-ov', ['opacity'])]);
    await page.mouse.move(5, 5); await page.waitForTimeout(700);
    await scrollTo(page, '#history', 0);
    await page.locator(S('.hi-m')).nth(0).hover(); await page.waitForTimeout(400);
    log('history ' + w, [await st(page, '.hi', ['grid-template-columns']), await st(page, '.hi-m:nth-child(1)', ['transform'], '::before'), await st(page, '.hi-tl', ['grid-template-columns'])]);
    await page.close();
  }

  /* ---- motion on: parallax, callout float, magnifier (states only; the canvas animates) ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await scrollTo(page, '#clients .cl-map', 120); await page.waitForTimeout(2600);
    const b = await mapBox(page);
    await page.mouse.move(b.x + b.width * 0.25, b.y + b.height * 0.75, { steps: 4 }); await page.waitForTimeout(900);
    log('motion map hover', await page.evaluate(MAP, [false]));
    await page.mouse.move(b.x + b.width * 115 / 180, b.y + b.height * 29.5 / 71, { steps: 4 }); await page.waitForTimeout(900);
    log('motion near ME', await page.evaluate(MAP, [false]));
    await page.mouse.move(5, 5); await page.waitForTimeout(900);
    log('motion left', await page.evaluate(MAP, [false]));
    await page.close();
  }

  /* ---- anchor: "Regulatory status ↓" ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.evaluate(() => { window.__clicks = null; });
    await page.locator(S('.hero-btn--solid')).click(); await page.waitForTimeout(1500);
    log('anchor regulatory', await page.evaluate((s) => ({ y: Math.round(scrollY), top: Math.round(document.querySelector(s).getBoundingClientRect().top), hash: location.hash.replace('pam-', ''), focus: document.activeElement === document.body ? 'body' : document.activeElement.tagName }), S('#regulatory')));
    await page.close();
  }

  /* ---- phone / narrow, mouse: people carousel drag + snap, map width ---- */
  for (const [w, h] of [[390, 844], [320, 640], [700, 900]]) {
    const page = await open({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    log('hero ' + w, [await st(page, '.hero', ['box']), await st(page, '.hero-img img', ['box', 'opacity']), await st(page, '.hero-actions', ['flex-direction'])]);
    log('facts ' + w, [await st(page, '.rf-facts', ['box', 'grid-template-columns', 'margin-top']), await st(page, '.rf-f:nth-child(2)', ['grid-template-columns'])]);
    await scrollTo(page, '#clients .cl-map', 120); await page.waitForTimeout(2500);
    log('map ' + w, await page.evaluate(MAP, [true]));
    await scrollTo(page, '#people .pp-g', 160);
    log('carousel ' + w, await page.evaluate(CAROUSEL, [S('.pp-g')]));
    const ul = await page.locator(S('.pp-g')).boundingBox();
    const y = ul.y + 120;
    await page.mouse.move(ul.x + 250, y); await page.mouse.down(); await page.mouse.move(ul.x + 160, y, { steps: 6 });
    log('dragging ' + w, await page.evaluate(CAROUSEL, [S('.pp-g')]));
    await page.mouse.move(ul.x + 110, y, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(100);
    log('released ' + w, await page.evaluate(() => window.__clicks.splice(0)));
    await page.waitForTimeout(1000);
    log('snapped ' + w, await page.evaluate(CAROUSEL, [S('.pp-g')]));
    const c = await page.locator(S('.pp-g a.gv-card')).nth(1).boundingBox();
    await page.mouse.click(Math.max(c.x, 0) + 40, c.y + 40); await page.waitForTimeout(100);
    log('click after drag ' + w, await page.evaluate(() => window.__clicks.splice(0)));
    await page.close();
  }

  /* ---- live resize: canvas follows the map box ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await scrollTo(page, '#clients .cl-map', 120); await page.waitForTimeout(2500);
    for (const w of [1100, 800, 600, 1600]) {
      await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(600);
      log('resize ' + w, [(await page.evaluate(MAP, [true])), await st(page, '.sv-g', ['grid-template-columns'])]);
    }
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(28) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
