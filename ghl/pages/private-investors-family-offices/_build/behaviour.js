// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   NODE_PATH=$(npm root -g) node behaviour.js <url>  > trace.txt
// Port classes and ids are normalised by dropping the pfo- prefix. Scrolls are instant: the source sets
// html{scroll-behavior:smooth}, the port leaves the host's <html> alone. Covers: the conversation track lighting up
// once at 40 % visibility (and staying lit), the hover states of the "why" list, relationship cards, architecture
// cards (including the Providence Asset Management card), conversation steps, governance links, text links and the
// contact button, keyboard focus, the impact image drift, live resize across the page's breakpoints, and reduced motion.
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [url] = process.argv.slice(2);
// a source selector and its port equivalent (every class and id carries pfo-)
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.pfo-$1').replace(/#([a-z][\w-]*)/g, '#pfo-$1');

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
  const track = (page) => page.evaluate(([t, s, n]) => {
    const el = document.querySelector(t);
    const cls = String(el.className).split(/\s+/).filter(Boolean).map((x) => x.replace(/^pfo-/, '')).join(' ');
    return {
      cls,
      after: [...document.querySelectorAll(s)].map((e) => getComputedStyle(e, '::after').transform).join(' | '),
      icon: [...document.querySelectorAll(n)].map((e) => getComputedStyle(e).backgroundColor).join(' | '),
    };
  }, [S('.cv-rail'), S('.cv-s'), S('.cv-s .ic')]);
  const styles = (loc, props) => loc.evaluate((e, ps) => ps.map((p) => getComputedStyle(e)[p]).join(' ; '), props);

  // 1. conversation track: lights up once at 40 % visibility, stays lit, at a phone and a desktop size
  for (const [w, h] of [[390, 700], [1440, 900]]) {
    const page = await open(w, h);
    log(w + ' top', await track(page));
    const r = await page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return { top: b.top + scrollY, h: b.height }; }, S('.cv-rail'));
    // 25 % of the track visible, then 60 %
    await page.evaluate(([y]) => window.scrollTo({ top: y, behavior: 'instant' }), [r.top - innerHeightOf(h) + r.h * 0.25]); await page.waitForTimeout(500);
    log(w + ' 25 % visible', await track(page));
    await page.evaluate(([y]) => window.scrollTo({ top: y, behavior: 'instant' }), [r.top - innerHeightOf(h) + r.h * 0.6]); await page.waitForTimeout(500);
    // mid-transition values jitter by a frame between runs, so only the class is compared here
    log(w + ' 60 % visible', (await track(page)).cls);
    await page.waitForTimeout(1500);
    log(w + ' settled', await track(page));
    log(w + ' transitions', await page.evaluate(([s, n]) => [getComputedStyle(document.querySelector(s), '::after').transition, getComputedStyle(document.querySelector(n)).transition], [S('.cv-s'), S('.cv-s .ic')]));
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(500);
    log(w + ' back to top', await track(page));
    await page.close();
  }
  function innerHeightOf(h) { return h; }

  // 2. hover and focus states (desktop, fine pointer)
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
    await hover('why item', '.wy-k li', '.ic', P);
    await hover('relationship card', '.rl-c', '.ic', P);
    await hover('architecture card', '.ac:not(.ac--ft)', null, P);
    await hover('PAM card', '.ac--ft', null, P);
    await hover('PAM link', '.ac--ft a', '.ar', ['color', 'textDecorationLine']);
    await hover('conversation step', '.cv-s', '.ic', P);
    await hover('governance link', '.gt-a:not(.gt-a--v)', '.ar', P);
    await hover('verify link', '.gt-a--v', '.ar', P);
    await hover('text link', '#important .link', '.ar', ['color', 'textDecorationLine', 'borderBottomColor']);
    await hover('card link', '.ac:not(.ac--ft) .link', '.ar', ['color', 'textDecorationLine', 'borderBottomColor']);
    await hover('section link', '#impact .hlink', '.ar', ['color', 'textDecorationLine', 'borderBottomColor']);
    await hover('contact button', '#next .btn', null, P);
    // keyboard: Tab order through the page's own links
    await page.evaluate((s) => { const a = document.querySelector(s); a.scrollIntoView({ block: 'center', behavior: 'instant' }); a.focus(); }, S('.gt-a'));
    const order = [];
    for (let i = 0; i < 4; i++) {
      order.push(await page.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + a.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) + ':' + getComputedStyle(a).outlineStyle; }));
      await page.keyboard.press('Tab');
    }
    log('tab from governance', order);
    await page.close();
  }

  // 3. impact image drift (animation definition and that it moves)
  {
    const page = await open(1440, 900);
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center', behavior: 'instant' }), S('.im-art'));
    const img = S('.im-art img');
    log('drift', await page.evaluate((s) => { const c = getComputedStyle(document.querySelector(s)); return [c.animationName.replace(/^pfo-/, ''), c.animationDuration, c.animationTimingFunction, c.animationIterationCount, c.animationDirection, c.opacity, c.filter]; }, img));
    const a = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, img);
    await page.waitForTimeout(2000);
    const b = await page.evaluate((s) => getComputedStyle(document.querySelector(s)).transform, img);
    log('drift moves', a !== b);
    await page.close();
  }

  // 4. live resize across the breakpoints: grid columns of each section, the track direction, the image box
  {
    const page = await open(1440, 900);
    const grids = ['.wy', '.rl-g', '.ar-g', '.cv-rail', '.gt', '.im-card', '.wy-k'].map(S);
    for (const [w, h] of [[1100, 900], [1024, 900], [1023, 900], [901, 900], [900, 900], [861, 900], [860, 900], [768, 900], [767, 900], [641, 900], [640, 900], [561, 900], [560, 900], [481, 900], [480, 900], [360, 640], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      log('resize ' + w, await page.evaluate((gs) => gs.map((g) => { const e = document.querySelector(g); if (!e) return '-'; const c = getComputedStyle(e); return c.display + ' ' + c.gridTemplateColumns + ' ' + c.flexDirection + ' ' + Math.round(e.getBoundingClientRect().height); }).concat([document.documentElement.scrollWidth]), grids));
    }
    await page.close();
  }

  // 5. reduced motion: no drift, track transitions off, content visible, the track still lights
  {
    const page = await open(1440, 900, 'reduce');
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center', behavior: 'instant' }), S('.cv-rail')); await page.waitForTimeout(600);
    log('reduced', await page.evaluate(([i, s, c, r]) => ({
      img: getComputedStyle(document.querySelector(i)).animationName + ' ' + getComputedStyle(document.querySelector(i)).transform,
      step: getComputedStyle(document.querySelector(s), '::after').transitionDuration + ' ' + getComputedStyle(document.querySelector(s), '::after').transform,
      card: getComputedStyle(document.querySelector(c)).transitionDuration,
      hidden: [...document.querySelectorAll(r + ' *')].filter((e) => getComputedStyle(e).opacity === '0').length,
    }), [S('.im-art img'), S('.cv-s'), S('.rl-c'), 'main']));
    await page.locator(S('.rl-c')).first().hover(); await page.waitForTimeout(400);
    log('reduced hover', await page.evaluate((c) => getComputedStyle(document.querySelector(c)).transform, S('.rl-c')));
    log('reduced track', await track(page));
    await page.close();
  }
  console.log(lines.join('\n').replace(/pfo-/g, ''));
  await browser.close();
})();
