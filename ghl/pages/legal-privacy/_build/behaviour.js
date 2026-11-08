// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   NODE_PATH=$(npm root -g) node behaviour.js <url>  > trace.txt
// Port classes and ids are normalised by dropping the lpv- prefix. Covers: the "On this page" index (first section
// marked at load, the mark following the reading band while scrolling, a click scrolling smoothly to its section with
// the hash and focus), the sticky index column (≥900 px) and its release, the legal pages switcher (current page,
// hover, scroll position at widths where source and port agree), the hover states of the breadcrumb, index and
// "Contact us" links, keyboard order, live resize across the breakpoints, and reduced motion.
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [url] = process.argv.slice(2);
const P = 'lpv';
// a source selector and its port equivalent (every class and id carries the prefix)
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.' + P + '-$1').replace(/#([a-z][\w-]*)/g, '#' + P + '-$1');
const strip = (s) => String(s).split(P + '-').join('');

(async () => {
  const browser = await chromium.launch();
  const lines = [];
  const log = (k, v) => lines.push(k + ' ' + JSON.stringify(v));
  const open = async (w, h, reducedMotion) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: reducedMotion || 'no-preference' });
    await routeReact(page);
    page.on('pageerror', (e) => log('ERROR', String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    // let the shared scroll motion settle first (its scans run 0.3, 1.2 and 2.6 s after the window load event)
    await page.evaluate(() => (document.readyState === 'complete' ? null : new Promise((r) => window.addEventListener('load', r, { once: true }))));
    await page.waitForTimeout(3000);
    return page;
  };
  const marked = (page) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((a) => a.getAttribute('aria-current')).map((a) => a.getAttribute('aria-current') + ':' + a.textContent.trim()).join(' | ') || 'none', S('.pg-index a'));
  const styles = (loc, props) => loc.evaluate((e, ps) => ps.map((p) => getComputedStyle(e)[p]).join(' ; '), props);

  // 1. the index: first section marked, the mark follows the reading band, a click scrolls smoothly
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await open(w, h);
    log(w + ' index at load', await marked(page));
    const secs = await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => ({ id: e.id, top: Math.round(e.getBoundingClientRect().top + scrollY) })), S('.pg-doc > section[id]'));
    for (const sec of secs) {
      // put the section's top 28 % down the viewport, inside the band the observer watches (25–35 %)
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, sec.top - Math.round(h * 0.28)));
      await page.waitForTimeout(250);
      log(w + ' reading ' + strip(sec.id), await marked(page));
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(300);
    log(w + ' back to top', await marked(page));
    // click the last index link: it scrolls smoothly, lands below the sticky header, updates the hash
    const link = page.locator(S('.pg-index a')).last();
    await link.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
    const before = await page.evaluate(() => scrollY);
    await link.click(); await page.waitForTimeout(120);
    const mid = await page.evaluate(() => scrollY);
    await page.waitForTimeout(1600);
    log(w + ' index click', await page.evaluate(([b, m, sel]) => {
      const t = document.querySelector(sel);
      return { moving: m !== b && m !== scrollY, top: Math.round(t.getBoundingClientRect().top), hash: location.hash.replace(/^#[a-z]{3}-/, '#'), focus: document.activeElement === document.body ? 'body' : document.activeElement.tagName };
    }, [before, mid, S('.pg-doc > section[id]:last-child')]));
    log(w + ' after click', await marked(page));
    await page.close();
  }

  // 2. the sticky index column (≥900 px) and its release below
  for (const w of [1440, 899]) {
    const page = await open(w, 900);
    const r = await page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { top: b.top + scrollY, h: b.height }; }, S('.lg-doc'));
    const out = [];
    for (const f of [0, 0.3, 0.6, 1]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(r.top - 100 + r.h * f)); await page.waitForTimeout(200);
      out.push(await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top) + ' ' + getComputedStyle(document.querySelector(s)).position, S('.lg-side')));
    }
    log(w + ' sticky index', out);
    await page.close();
  }

  // 3. the legal pages switcher: the current page, hover, scroll position (widths where source and port agree)
  for (const w of [1440, 1100, 768, 390]) {
    const page = await open(w, 900);
    log(w + ' switcher', await page.evaluate((s) => {
      const u = document.querySelector(s); const c = u.querySelector('[aria-current="page"]');
      const cs = getComputedStyle(c);
      return { current: c.textContent.trim().slice(0, 14), scroll: Math.round(u.scrollLeft), max: u.scrollWidth - u.clientWidth, display: getComputedStyle(u).display, snap: getComputedStyle(u).scrollSnapType, bg: cs.backgroundImage.slice(0, 60), shadow: cs.boxShadow };
    }, S('.lg-nav ul')));
    await page.close();
  }
  {
    const page = await open(1440, 900);
    const other = page.locator(S('.lg-nav a:not([aria-current])')).first();
    const P2 = ['backgroundColor', 'color', 'transform', 'transition'];
    const before = await styles(other, P2);
    const icBefore = await styles(other.locator(S('.lg-ic')), ['backgroundColor', 'borderTopColor']);
    await other.hover(); await page.waitForTimeout(400);
    log('switcher hover', { before, after: await styles(other, P2), ic: [icBefore, await styles(other.locator(S('.lg-ic')), ['backgroundColor', 'borderTopColor'])] });
    const cur = page.locator(S('.lg-nav a[aria-current]'));
    const cb = await styles(cur, P2); await cur.hover(); await page.waitForTimeout(400);
    log('current hover', { before: cb, after: await styles(cur, P2) });
    // hovers of the breadcrumb, index and "Contact us" links
    for (const [label, sel, props] of [['breadcrumb', '.lg-bc a', ['color']], ['index link', '.pg-index a', ['color', 'borderLeftColor', 'backgroundColor']], ['contact us', '.lg-ask .link', ['color', 'borderBottomColor']]]) {
      const loc = page.locator(S(sel)).last();
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(1500);
      await page.mouse.move(2, 2); await page.waitForTimeout(400);
      const b = await styles(loc, props.concat(['transition'])); await loc.hover(); await page.waitForTimeout(500);
      log('hover ' + label, { before: b, after: await styles(loc, props.concat(['transition'])) });
    }
    // keyboard order from the breadcrumb through the switcher, the index and the "Contact us" link
    await page.evaluate((s) => { const a = document.querySelector(s); a.scrollIntoView({ block: 'center', behavior: 'instant' }); a.focus(); }, S('.lg-bc a'));
    const order = [];
    for (let i = 0; i < 14; i++) {
      order.push(await page.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + a.textContent.replace(/\s+/g, ' ').trim().slice(0, 24) + ':' + getComputedStyle(a).outlineStyle; }));
      await page.keyboard.press('Tab');
    }
    log('tab order', order);
    await page.close();
  }

  // 4. live resize across the breakpoints
  {
    const page = await open(1440, 900);
    const els = ['.lg-hero', '.lg-nav', '.lg-nav ul', '.lg-nav li', '.lg-grid', '.lg-side', '.lg-ask', '.lg-ask .link', '.pg-index'].map(S);
    for (const [w, h] of [[1280, 900], [1101, 900], [1100, 900], [900, 900], [899, 900], [768, 900], [767, 900], [641, 900], [640, 900], [360, 640], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      log('resize ' + w, await page.evaluate((es) => es.map((g) => { const e = document.querySelector(g); const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.display + ' ' + c.gridTemplateColumns + ' ' + c.position + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }).concat([document.documentElement.scrollWidth]), els));
    }
    await page.close();
  }

  // 5. reduced motion: the index click jumps at once, the switcher press does not scale
  {
    const page = await open(1440, 900, 'reduce');
    const link = page.locator(S('.pg-index a')).last();
    // final position only: with reduced motion the port jumps at once while the source still scrolls smoothly
    // (html{scroll-behavior:smooth}), a documented difference
    await link.click(); await page.waitForTimeout(1600);
    log('reduced index click', await page.evaluate((sel) => Math.round(document.querySelector(sel).getBoundingClientRect().top), S('.pg-doc > section[id]:last-child')));
    log('reduced press', await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transitionDuration, S('.lg-nav a')));
    await page.close();
  }
  console.log(strip(lines.join('\n')));
  await browser.close();
})();
