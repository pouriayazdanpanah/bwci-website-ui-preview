// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   source: SRC_PROPS=<the four form links> NODE_PATH=$(npm root -g) node behaviour.js <url>  > trace.txt
//   port:   NODE_PATH=$(npm root -g) node behaviour.js <preview/plain-forms.html>  > trace.txt
// Port classes and ids are normalised by dropping the scv- prefix. Covers: the route at load (default and from the URL
// hash), choosing a route by click and by keyboard (selection, tabindex, panel, spoken message, hash), a hash change,
// the tablet scroll to the form, the phone accordion keeping the tapped card in place, "Choose a different route"
// (scroll and focus only: the source then closes the form, the port keeps it open by the owner's decision), the hover
// states, the form frames, live resize across the breakpoints, and reduced motion.
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [url] = process.argv.slice(2);
const P = 'scv';
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.' + P + '-$1').replace(/#([a-z][\w-]*)/g, '#' + P + '-$1');
const strip = (s) => String(s).split(P + '-').join('');
const ROUTES = ['smes', 'investors', 'banks', 'partners'];

(async () => {
  const browser = await chromium.launch();
  const lines = [];
  const log = (k, v) => lines.push(k + ' ' + JSON.stringify(v));
  const open = async (w, h, reducedMotion, hash) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: reducedMotion || 'no-preference' });
    await routeReact(page);
    page.on('pageerror', (e) => log('ERROR', String(e)));
    await page.goto(url + (hash || ''), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.evaluate(() => (document.readyState === 'complete' ? null : new Promise((r) => window.addEventListener('load', r, { once: true }))));
    await page.waitForTimeout(3000);
    return page;
  };
  const state = (page) => page.evaluate((sels) => {
    const tabs = [...document.querySelectorAll(sels[0])], panels = [...document.querySelectorAll(sels[1])];
    const live = document.querySelector(sels[2]);
    const a = document.activeElement;
    return {
      tabs: tabs.map((t) => t.id.replace(/^scv-/, '') + ':' + t.getAttribute('aria-selected') + ':' + t.getAttribute('tabindex')).join(' '),
      panels: panels.map((p) => p.id.replace(/^scv-/, '') + ':' + (p.hidden ? 'hidden' : 'shown')).join(' '),
      live: live ? live.textContent : '',
      hash: location.hash,
      focus: a && a.id ? a.id.replace(/^scv-/, '') : (a ? a.tagName : '-'),
    };
  }, [S('.sc-tab'), S('.sc-panel'), '[aria-live="polite"]']);

  // 1. the route at load: the default, and one named in the URL hash
  {
    const page = await open(1440, 900);
    log('load default', await state(page));
    log('frames', await page.evaluate((s) => [...document.querySelectorAll(s)].map((f) => f.getAttribute('src').split('?')[1] + ' ' + f.title + ' ' + f.getAttribute('loading') + ' ' + Math.round(f.getBoundingClientRect().height)).join(' | '), S('.sc-embed iframe')));
    await page.close();
    const page2 = await open(1440, 900, null, '#banks');
    log('load #banks', await state(page2));
    // a hash change opens that route
    await page2.evaluate(() => { location.hash = '#partners'; }); await page2.waitForTimeout(300);
    log('hashchange #partners', await state(page2));
    await page2.evaluate(() => { location.hash = '#nothing'; }); await page2.waitForTimeout(300);
    log('hashchange #nothing', await state(page2));
    await page2.close();
  }

  // 2. desktop: click and keyboard
  {
    const page = await open(1440, 900);
    const card = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, S('.sc-card'));
    await page.evaluate((y) => window.scrollTo({ top: y - 100, behavior: 'instant' }), Math.round(card)); await page.waitForTimeout(400);
    for (const k of ['investors', 'partners', 'smes']) {
      const y0 = await page.evaluate(() => scrollY);
      await page.locator(S('#tab-' + k)).click(); await page.waitForTimeout(500);
      log('click ' + k, Object.assign(await state(page), { scrolled: (await page.evaluate(() => scrollY)) - y0 }));
    }
    log('panel animation', await page.evaluate((s) => { const c = getComputedStyle(document.querySelector(s)); return c.animationName.replace(/^scv-/, '') + ' ' + c.animationDuration; }, S('.sc-panel:not([hidden])')));
    await page.locator(S('#tab-smes')).focus();
    for (const key of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'End', 'Home', 'ArrowUp']) {
      await page.keyboard.press(key); await page.waitForTimeout(250);
      log('key ' + key, await state(page));
    }
    await page.keyboard.press('Enter'); await page.waitForTimeout(250);
    log('key Enter on open tab', await state(page));
    // hovers
    const P2 = ['backgroundColor', 'borderTopColor', 'boxShadow', 'transform', 'transition'];
    const styles = (loc, ps) => loc.evaluate((e, p) => p.map((x) => getComputedStyle(e)[x]).join(' ; '), ps);
    for (const [label, sel, inner] of [['tab', '#tab-banks', '.sc-ic'], ['open tab', '#tab-partners', '.sc-ic'], ['back', '.sc-panel:not([hidden]) .sc-back', '.ar'], ['breadcrumb', '.sc-bc a', null], ['else card', '.se-g .pg-lc', '.sc-ic']]) {
      const loc = page.locator(S(sel)).first();
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(1500);
      await page.mouse.move(2, 2); await page.waitForTimeout(400);
      const b = await styles(loc, P2.concat(['color']));
      const ib = inner ? await styles(loc.locator(S(inner)).first(), ['backgroundColor', 'color', 'borderTopColor', 'transform']) : '';
      await loc.hover(); await page.waitForTimeout(500);
      log('hover ' + label, { before: b, after: await styles(loc, P2.concat(['color'])), inner: inner ? [ib, await styles(loc.locator(S(inner)).first(), ['backgroundColor', 'color', 'borderTopColor', 'transform'])] : null });
    }
    await page.close();
  }

  // 3. tablet: a tap scrolls the form into view
  {
    const page = await open(900, 900);
    await page.locator(S('#tab-banks')).click(); await page.waitForTimeout(1600);
    log('900 tap banks', Object.assign(await state(page), { panelsTop: await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), S('.sc-panels')) }));
    await page.close();
  }

  // 4. phone: the accordion keeps the tapped card where the finger is
  {
    const page = await open(390, 844);
    for (const k of ['banks', 'investors', 'partners']) {
      const loc = page.locator(S('#tab-' + k));
      await loc.evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'instant' })); await page.waitForTimeout(300);
      const before = await loc.evaluate((e) => Math.round(e.getBoundingClientRect().top));
      await loc.click(); await page.waitForTimeout(600);
      log('390 tap ' + k, Object.assign(await state(page), { cardTop: [before, await loc.evaluate((e) => Math.round(e.getBoundingClientRect().top))], order: await page.evaluate((s) => [...document.querySelector(s).children].map((e) => getComputedStyle(e).order).join(','), S('.sc-card')) }));
    }
    await page.close();
  }

  // 5. "Choose a different route": scrolls back to the route cards and moves focus to a route card (with the first route
  //    open, the source and the port focus the same card; afterwards the source closes the form and the port keeps it)
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await open(w, h);
    const back = page.locator(S('.sc-panel:not([hidden]) .sc-back'));
    await back.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    await back.click(); await page.waitForTimeout(1500);
    log(w + ' back', { cardTop: await page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top), S('.sc-card')), focus: (await state(page)).focus });
    await page.close();
  }

  // 6. live resize across the breakpoints
  {
    const page = await open(1440, 900);
    const els = ['.sc-head', '.sc-tabs', '.sc-tab', '.sc-panel:not([hidden])', '.sc-aside', '.sc-embed', '.se-g', '.sc-promise li'].map(S);
    for (const [w, h] of [[1280, 900], [1024, 900], [1023, 900], [900, 900], [899, 900], [768, 900], [767, 900], [641, 900], [640, 900], [360, 640], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      log('resize ' + w, await page.evaluate((es) => es.map((g) => { const e = document.querySelector(g); const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.display + ' ' + c.gridTemplateColumns + ' ' + c.position + ' ' + Math.round(r.width) + 'x' + Math.round(r.height); }).concat([document.documentElement.scrollWidth]), els));
    }
    await page.close();
  }

  // 7. reduced motion
  {
    const page = await open(1440, 900, 'reduce');
    await page.locator(S('#tab-investors')).click(); await page.waitForTimeout(400);
    log('reduced', await page.evaluate((s) => { const p = getComputedStyle(document.querySelector(s[0])); const t = getComputedStyle(document.querySelector(s[1])); return [p.animationName.replace(/^scv-/, '') + ' ' + p.animationDuration, t.transform, getComputedStyle(document.querySelector(s[2])).transform]; }, [S('.sc-panel:not([hidden])'), S('#tab-investors'), S('#tab-investors .sc-st-on')]));
    await page.close();
  }
  console.log(strip(lines.join('\n')));
  await browser.close();
})();
