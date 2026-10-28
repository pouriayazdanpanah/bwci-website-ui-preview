// Dev-only QA: runs the same header / drawer / breadcrumb / footer / scroll-motion script against a
// design page and its GoHighLevel port and prints a comparable trace. Port class names are normalised by
// dropping the page prefix (plt-hdr__item → hdr__item), so the two traces can be diffed line by line.
//   NODE_PATH=$(npm root -g) node chrome-behaviour.js <url> [label]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const VENDOR = path.resolve(__dirname, '../../../../design/vendor');
const url = process.argv[2];
const label = process.argv[3] || url;
async function routeReact(page) {
  await page.route('https://unpkg.com/react@18.3.1/umd/react.production.min.js', (r) => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react.js')) }));
  await page.route('https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js', (r) => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync(path.join(VENDOR, 'react-dom.js')) }));
}

const STATE = () => {
  const vis = (el) => !!(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
  // the source runtime's generated style-hover/style-focus classes (scpN) and the port's classes for the same rules
  // (breadcrumb and GovNav links) are left out, so the trace compares elements, not how their hover is wired
  const norm = (c) => (c || '').split(/\s+/).filter((x) => x && x !== 'sc-interp' && !/^scp[0-9a-z]+$/.test(x)).map((x) => x.replace(/^(plt|sme|inv|eco|fe|gov|gvb|gvl|who|bw|bwci)-/, '')).filter((x) => !/^(bc__a|gn__a|gn__a--off)$/.test(x)).join('.');
  const t = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : null);
  const q = (s) => document.querySelector(s);
  const qa = (s) => [...document.querySelectorAll(s)];
  const hdr = q('header[class*="hdr"]');
  const panels = qa('[class*="hdr__panel"]').filter(vis).map((p) => t(p).slice(0, 24));
  const trig = qa('[class*="hdr__trigger"]').map((b) => b.getAttribute('aria-expanded')[0] + (b.getAttribute('aria-current') ? '*' : '')).join('');
  const drawer = qa('[class*="hdr__drawer"]').find(vis);
  const acc = qa('[class*="hdr__drow"][aria-expanded]').filter(vis).map((b) => b.getAttribute('aria-expanded')[0]).join('');
  const subs = qa('[class*="hdr__sub"]').filter((e) => e.tagName === 'UL' && vis(e)).length;
  const ae = document.activeElement;
  const host = hdr && hdr.parentElement;
  return {
    stuck: hdr && /hdr--stuck/.test(hdr.className), hostTop: host ? getComputedStyle(host).top : null,
    panels: panels.join('|'), trig, drawer: !!drawer, burger: (q('[class*="hdr__burger"]') || {}).getAttribute ? q('[class*="hdr__burger"]').getAttribute('aria-expanded') : null,
    acc, subs, overflow: document.body.style.overflow || '-',
    focus: ae && ae !== document.body ? ae.tagName + ':' + norm(ae.getAttribute('class')) + ':' + (ae.getAttribute('aria-label') || t(ae).replace(/\s/g, '').slice(0, 22)) : 'body',
  };
};

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(26) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts) => {
    const { motionTest, ...pageOpts } = opts;
    const page = await browser.newPage(pageOpts);
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    // after the last scan of the shared scroll motion (~2.6 s after load), so it cannot move things mid-test
    await page.waitForTimeout(motionTest ? 600 : 3200);
    return page;
  };
  const snap = (page) => page.evaluate(STATE);
  const T = '[class*="hdr__trigger"]';

  /* ---- desktop: dropdowns (hover, click, keyboard), stuck state ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    log('initial', await snap(page));
    await page.locator(T).nth(1).hover(); await page.waitForTimeout(80); log('hover hiw', await snap(page));
    log('panel anim', await page.evaluate(() => document.getAnimations().map((a) => (a.animationName || '').replace(/^[a-z]+-/, '') + ' ' + a.effect.getTiming().duration).filter((s) => /hdr/.test(s))));
    await page.locator(T).nth(1).click(); await page.waitForTimeout(80); log('click after hover (keeps)', await snap(page));
    await page.locator(T).nth(1).click(); await page.waitForTimeout(80); log('click again (closes)', await snap(page));
    await page.locator(T).nth(0).hover(); await page.waitForTimeout(80); log('hover who', await snap(page));
    await page.mouse.move(700, 600); await page.waitForTimeout(80); log('leave +80ms', await snap(page));
    await page.waitForTimeout(200); log('leave +280ms', await snap(page));
    // keyboard
    await page.mouse.move(5, 899);
    await page.locator(T).nth(1).focus(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(60); log('ArrowDown', await snap(page));
    await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(40); log('ArrowDown x2', await snap(page));
    await page.keyboard.press('End'); log('End', await snap(page));
    await page.keyboard.press('ArrowDown'); log('ArrowDown (wraps)', await snap(page));
    await page.keyboard.press('ArrowUp'); log('ArrowUp (wraps back)', await snap(page));
    await page.keyboard.press('Home'); log('Home', await snap(page));
    await page.keyboard.press('Escape'); await page.waitForTimeout(40); log('Escape', await snap(page));
    await page.keyboard.press('ArrowUp'); await page.waitForTimeout(40); log('ArrowUp opens at last', await snap(page));
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(40); log('Shift+Tab out (blur)', await snap(page));
    await page.locator(T).nth(2).click(); await page.waitForTimeout(40); log('click inv', await snap(page));
    // outside the header, on empty space (the left page margin; the page body can be a link, e.g. a person card)
    await page.mouse.click(5, 700); await page.waitForTimeout(40); log('mousedown outside', await snap(page));
    await page.locator(T).nth(0).click(); await page.locator(T).nth(1).click(); await page.waitForTimeout(40); log('click who then hiw', await snap(page));
    await page.keyboard.press('Escape');
    // Tab order through the header
    // a click on empty space at the top left (the utility bar has no link there), so Tab starts at the header;
    // the middle of the viewport can be a link, e.g. a person card on the Board page
    await page.mouse.click(5, 5); await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const tabs = [];
    for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); tabs.push((await snap(page)).focus); }
    log('tab order', tabs);
    await page.waitForTimeout(800); // focus scrolling is smooth where the source sets html{scroll-behavior:smooth}
    await page.evaluate(() => window.scrollTo({ top: 39, behavior: 'instant' })); await page.waitForTimeout(80); log('scroll 39', (await snap(page)).stuck);
    await page.evaluate(() => window.scrollTo({ top: 43, behavior: 'instant' })); await page.waitForTimeout(80); log('scroll 43', (await snap(page)).stuck);
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: 'instant' })); await page.waitForTimeout(450);
    log('scroll 3000', await page.evaluate(() => { const h = document.querySelector('header[class*="hdr"]'); const r = h.getBoundingClientRect(); return [/stuck/.test(h.className), Math.round(r.top), Math.round(r.height), getComputedStyle(h.querySelector('[class*="hdr__bar"]')).backgroundColor]; }));
    // breadcrumb + footer links
    log('breadcrumb', await page.evaluate(() => { const n = document.querySelector('nav[aria-label="Breadcrumb"]'); return n ? [...n.querySelectorAll('li')].map((li) => li.textContent.trim() + (li.querySelector('a') ? '(a)' : '') + (li.querySelector('[aria-current]') ? '(cur)' : '')).join(' > ') : null; }));
    const bc = page.locator('nav[aria-label="Breadcrumb"] a').first();
    if (await bc.count()) {
      await page.evaluate(() => window.scrollTo(0, 0)); await bc.hover(); await page.waitForTimeout(260);
      log('breadcrumb hover', await bc.evaluate((a) => getComputedStyle(a).color));
      await bc.focus(); log('breadcrumb focus', await bc.evaluate((a) => { const c = getComputedStyle(a); return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.outlineOffset].join(' '); }));
    }
    log('footer', await page.evaluate(() => [...document.querySelectorAll('footer[class*="sft"] nav')].map((n) => n.getAttribute('aria-label') + ':' + n.querySelectorAll('a').length).join(' ') + ' | ' + document.querySelector('footer[class*="sft"] [class*="sft__bar"] > span').textContent.trim()));
    await page.close();
  }

  /* ---- 1279 / 768 / 390: drawer ---- */
  for (const [w, h, touch] of [[1279, 800, false], [768, 1024, true], [390, 844, true]]) {
    const page = await open({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const click = (sel, i) => (touch ? page.locator(sel).nth(i || 0).tap() : page.locator(sel).nth(i || 0).click());
    await click('[class*="hdr__burger"]'); await page.waitForTimeout(60);
    log('drawer anim ' + w, await page.evaluate(() => document.getAnimations().map((a) => (a.animationName || '').replace(/^[a-z]+-/, '') + ' ' + a.effect.getTiming().duration).filter((s) => /hdr/.test(s)).sort()));
    await page.waitForTimeout(300);
    log('drawer ' + w, await snap(page));
    log('fonts ' + w, await page.evaluate(() => [...document.querySelectorAll('[class*="hdr__drow"], [class*="hdr__dutil"] a, nav[aria-label="Breadcrumb"] li, [class*="sft__bar"] > span')].filter((e) => e.getClientRects().length).map((e) => { const s = e.querySelector('.sc-interp, [class$="-i"]') || e; return getComputedStyle(s).fontSize; }).join(',')));
    await click('[class*="hdr__drow"][aria-expanded]', 0); await page.waitForTimeout(60); log('acc who ' + w, await snap(page));
    await click('[class*="hdr__drow"][aria-expanded]', 1); await page.waitForTimeout(60); log('acc hiw ' + w, await snap(page));
    if (!touch) {
      await page.keyboard.press('Shift+Tab'); log('shift+tab trap ' + w, (await snap(page)).focus);
      await page.keyboard.press('Tab'); log('tab trap ' + w, (await snap(page)).focus);
      await page.keyboard.press('Escape'); await page.waitForTimeout(60); log('Escape ' + w, await snap(page));
      await click('[class*="hdr__burger"]'); await page.waitForTimeout(100); log('reopen (acc kept) ' + w, await snap(page));
      await page.setViewportSize({ width: 1300, height: 800 }); await page.waitForTimeout(150); log('resize 1300 ' + w, await snap(page));
    } else {
      await click('[class*="hdr__x"]'); await page.waitForTimeout(60); log('close ' + w, await snap(page));
      await click('[class*="hdr__burger"]'); await page.waitForTimeout(60);
      await page.locator('[class*="hdr__scrim"]').evaluate((e) => e.click()); await page.waitForTimeout(60); log('scrim ' + w, await snap(page));
    }
    await page.close();
  }

  /* ---- shared scroll motion (motion on, then reduced) ---- */
  for (const rm of ['no-preference', 'reduce']) {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: rm, motionTest: true });
    const tags = () => page.evaluate(() => [...document.querySelectorAll('[data-bw-rv]')].map((e) => e.getAttribute('data-bw-rv')[0] + (e.style.getPropertyValue('--bw-d') || '') + ':' + e.tagName + '.' + (e.getAttribute('class') || '').split(' ')[0].replace(/^(plt|sme|inv|eco|fe|gov|gvb|gvl|who|bw|bwci)-/, '')).join(' '));
    await page.waitForTimeout(2600); log('motion@3.2s ' + rm, await tags());
    log('hero anim ' + rm, await page.evaluate(() => document.getAnimations().map((a) => (a.animationName || '').replace(/^[a-z]+-/, '')).filter((s) => /bw/.test(s)).length));
    log('wait opacity ' + rm, await page.evaluate(() => { const e = document.querySelector('[data-bw-rv="wait"]'); return e ? getComputedStyle(e).opacity + ' ' + getComputedStyle(e).translate : null; }));
    // every element tagged at any point of a scroll-through (tags are removed ~0.9 s after they reveal)
    log('motion scrolled ' + rm, await page.evaluate(async () => {
      const seen = new Set(); const mark = () => document.querySelectorAll('[data-bw-rv]').forEach((e) => seen.add(e));
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); mark(); await new Promise((r) => setTimeout(r, 50)); mark(); }
      return seen.size + ' tagged';
    }));
    await page.waitForTimeout(2600); log('motion done ' + rm, await tags());
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(26) + ' ' + JSON.stringify([...new Set(errors)]));
  await browser.close();
})();
