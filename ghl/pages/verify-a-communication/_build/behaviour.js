// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and prints a
// comparable trace (port classes/ids are normalised by dropping the vfc- prefix).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
// (header, drawer, breadcrumb, footer and the shared scroll motion are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js; this script covers the page's own sections and interactions)
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;
// a source selector and its port equivalent (every class and id carries vfc-)
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.vfc-$1').replace(/#([a-z][\w-]*)/g, '#vfc-$1');

const STYLE = ([sel, props, pseudo]) => {
  const el = document.querySelector(sel);
  if (!el) return 'missing ' + sel;
  const cs = getComputedStyle(el, pseudo || null);
  const r = el.getBoundingClientRect();
  return props.map((p) => (p === 'box' ? Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) : cs.getPropertyValue(p))).join(' | ');
};
const COPY = ([sel]) => {
  const b = document.querySelector(sel);
  return [b.getAttribute('data-done'), b.getAttribute('aria-label'), b.textContent.trim(), getComputedStyle(b).backgroundColor, getComputedStyle(b).color, getComputedStyle(b).borderTopColor].join(' | ');
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(28) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts, perms) => {
    const ctx = await browser.newContext(opts);
    if (perms) await ctx.grantPermissions(perms, { origin: new URL(url).origin });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // after the last scan of the shared scroll motion
    page.ctx = ctx;
    return page;
  };
  const close = (page) => page.ctx.close();
  const st = (page, sel, props, pseudo) => page.evaluate(STYLE, [S(sel), props, pseudo || null]);
  const scrollTo = (page, sel, off) => page.evaluate(([s, o]) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - o, behavior: 'instant' }); }, [S(sel), off]).then(() => page.waitForTimeout(1300));
  const CP = S('.cp');

  /* ---- desktop / tablet ---- */
  for (const [w, h] of [[1440, 900], [1024, 768], [768, 1024]]) {
    const page = await open({ viewport: { width: w, height: h } });
    log('hero ' + w, [await st(page, '.vf-hero', ['box', 'padding-bottom']), await st(page, '.vf-shield', ['box', 'border-radius']), await st(page, '.vf-hero h1', ['box', 'font-size'])]);
    log('quick check ' + w, [await st(page, '.qc-card', ['box', 'margin-top']), await st(page, '.qc-list', ['grid-template-columns']), await st(page, '.qc-s:nth-child(2) .qc-mark', ['width'], '::after')]);
    await page.locator(S('.qc-s')).nth(2).hover(); await page.waitForTimeout(400);
    log('step hover', [await st(page, '.qc-s:nth-child(3)', ['background-color']), await st(page, '.qc-s:nth-child(3) .qc-num', ['background-color', 'color', 'border-top-color'])]);
    await page.locator(S('.qc-go')).nth(0).hover(); await page.waitForTimeout(400);
    log('step link hover', [await st(page, '.qc-go', ['color']), await st(page, '.qc-go .ar', ['transform'])]);
    await page.mouse.move(5, 5); await page.waitForTimeout(400);
    await scrollTo(page, '#channels .ch', -40);
    await page.evaluate(() => window.scrollBy(0, 200)); await page.waitForTimeout(300);
    log('channels head ' + w, [await st(page, '.ck-h', ['box', 'position', 'top']), await st(page, '.ck', ['grid-template-columns']), await st(page, '.ch > div:last-child', ['box', 'background-color'])]);
    await page.locator(S('.ch > div')).nth(1).hover(); await page.waitForTimeout(400);
    log('channel row hover', await st(page, '.ch > div:nth-child(2)', ['background-color']));
    await scrollTo(page, '#never', 0);
    await page.locator(S('.nv li')).nth(1).hover(); await page.waitForTimeout(500);
    log('never hover', await st(page, '.nv li:nth-child(2)', ['transform', 'border-top-color']));
    await scrollTo(page, '#regulated', 0);
    await page.locator(S('.rg-links .hlink')).nth(1).hover(); await page.waitForTimeout(400);
    log('regulated link hover', [await st(page, '.rg-links .hlink:nth-child(2)', ['color']), await st(page, '.rg-p', ['grid-template-columns'])]);
    await scrollTo(page, '#report', 0);
    log('report ' + w, [await st(page, '.rp-g', ['grid-template-columns']), await st(page, '.bank', ['box', 'grid-template-columns']), await st(page, '.au li:nth-child(2)', ['box'])]);
    await page.locator(S('.au a')).nth(0).hover(); await page.waitForTimeout(400);
    log('authority link hover', [await st(page, '.au li:nth-child(1) a', ['color']), await st(page, '.au li:nth-child(1) a .ar', ['transform', 'color'])]);
    await page.locator(CP).hover(); await page.waitForTimeout(300);
    log('copy hover', await page.evaluate(COPY, [CP]));
    log('external links', await page.evaluate((s) => [...document.querySelectorAll(s)].map((a) => a.getAttribute('href') + ' ' + a.getAttribute('target') + ' ' + a.getAttribute('rel')).join(' , '), S('a[href^="http"]') + ', ' + S('a[href^="mailto"]')));
    await close(page);
  }

  /* ---- step anchor ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.locator(S('.qc-go')).nth(1).click(); await page.waitForTimeout(1500);
    log('anchor never', await page.evaluate((s) => ({ y: Math.round(scrollY), top: Math.round(document.querySelector(s).getBoundingClientRect().top), hash: location.hash.replace('vfc-', ''), focus: document.activeElement === document.body ? 'body' : document.activeElement.tagName }), S('#never')));
    await close(page);
  }

  /* ---- copy button: clipboard granted, then denied ---- */
  for (const [name, perms] of [['granted', ['clipboard-read', 'clipboard-write']], ['denied', null]]) {
    const page = await open({ viewport: { width: 1440, height: 900 } }, perms);
    await scrollTo(page, '#report', 0);
    log('copy before ' + name, await page.evaluate(COPY, [CP]));
    await page.locator(CP).click(); await page.waitForTimeout(300);
    log('copy after ' + name, await page.evaluate(COPY, [CP]));
    if (perms) log('clipboard ' + name, await page.evaluate(() => navigator.clipboard.readText()));
    await page.waitForTimeout(800);
    await page.locator(CP).click(); await page.waitForTimeout(1200); // a second click restarts the 1.8 s timer
    log('copy 1.2s after 2nd', await page.evaluate(COPY, [CP]));
    await page.waitForTimeout(900);
    log('copy reset ' + name, await page.evaluate(COPY, [CP]));
    await page.locator(CP).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    log('copy keyboard ' + name, [await page.evaluate(COPY, [CP]), await st(page, '.cp', ['outline-style', 'outline-color', 'outline-offset'])]);
    await close(page);
  }

  /* ---- phones ---- */
  for (const [w, h] of [[390, 844], [320, 640]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    log('hero ' + w, [await st(page, '.vf-hero', ['box', 'padding-bottom']), await st(page, '.vf-shield', ['box', 'order']), await st(page, '.vf-hero h1', ['box', 'font-size'])]);
    log('quick check ' + w, [await st(page, '.qc-card', ['box', 'margin-top']), await st(page, '.qc-s:nth-child(2)', ['box', 'grid-template-columns', 'border-top-width']), await st(page, '.qc-go', ['box'])]);
    await scrollTo(page, '#channels', 0);
    log('channel row ' + w, await st(page, '.ch > div:nth-child(2)', ['box', 'grid-template-columns']));
    await scrollTo(page, '#report', 0);
    log('report ' + w, [await st(page, '.rp-c:nth-child(2)', ['box']), await st(page, '.bank', ['grid-template-columns']), await st(page, '.rg-links', ['flex-direction'])]);
    await scrollTo(page, '#next', 0);
    log('next ' + w, [await st(page, '#next .btn', ['box']), await st(page, '#next .nx-links', ['flex-direction'])]);
    await close(page);
  }

  /* ---- live resize ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    for (const w of [1100, 900, 700, 600, 500, 1600]) {
      await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(400);
      log('resize ' + w, [await st(page, '.vf-shield', ['box']), await st(page, '.qc-list', ['grid-template-columns']), await st(page, '.ck', ['grid-template-columns']), await st(page, '.rp-g', ['grid-template-columns'])]);
    }
    await close(page);
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    log('reduced hero', await page.evaluate(() => [...document.querySelectorAll('.pg-hero .wrap > *, .vfc-pg-hero .vfc-wrap > *')].map((e) => getComputedStyle(e).animationName.replace(/^vfc-/, '')).join(' ')));
    await scrollTo(page, '#never', 0);
    await page.locator(S('.nv li')).nth(0).hover(); await page.waitForTimeout(500);
    log('reduced never hover', await st(page, '.nv li:nth-child(1)', ['transform']));
    await close(page);
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(28) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
