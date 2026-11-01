// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   NODE_PATH=$(npm root -g) node behaviour.js <url> <src|port>  > trace.txt
// Port classes and ids are normalised by dropping the ptd- prefix. Covers: the stages lighting up at 15 % and the
// "How to read" button following them on and off screen, the paired-card highlight (hover and focus), the guide
// dialog (open, focus, scroll lock, Escape, backdrop, close and "Got it" buttons, focus return), the phone bottom
// sheet, card hover, live resize across 1024 / 641 / 640 px, and reduced motion.
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const [url] = process.argv.slice(2);
// a source selector and its port equivalent (every class and id carries ptd-)
const S = (sel) => sel + ', ' + sel.replace(/\.([a-z][\w-]*)/g, '.ptd-$1').replace(/#([a-z][\w-]*)/g, '#ptd-$1');
const norm = (c) => String(c || '').split(/\s+/).filter(Boolean).map((x) => x.replace(/^ptd-/, '')).join(' ');

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
    await page.waitForTimeout(400);
    return page;
  };
  const state = (page) => page.evaluate(([sStages, sFab, sGd, sPanel, sCards]) => {
    const n = (c) => String(c || '').split(/\s+/).filter(Boolean).map((x) => x.replace(/^ptd-/, '')).join(' ');
    const st = document.querySelector(sStages), fab = document.querySelector(sFab), gd = document.querySelector(sGd), panel = document.querySelector(sPanel);
    const pr = panel.getBoundingClientRect();
    const a = document.activeElement;
    return {
      stages: n(st.className), fab: n(fab.className) + ' ' + getComputedStyle(fab).opacity, gd: n(gd.className) + ' ' + gd.getAttribute('aria-hidden') + ' ' + getComputedStyle(gd).visibility,
      panel: [pr.x, pr.y, pr.width, pr.height].map(Math.round).join(','),
      html: document.documentElement.style.overflow || '-',
      cards: [...document.querySelectorAll(sCards)].map((c) => n(c.className)).join(' | '),
      focus: a === document.body ? 'body' : a.tagName + ':' + (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20)),
    };
  }, [S('#stages'), S('.gd-fab'), S('.gd'), S('.gd-panel'), S('.st-box .pc')]);

  // 1. stages and the guide button, on a short viewport. (At 1440x500 the source lights the stages at load: its
  //    observer first fires before the header and breadcrumb mount, while the stages are still on screen. 390x500
  //    has no such race; the port lights them only when they are 15 % visible.)
  {
    const page = await open(390, 500);
    log('top', await state(page));
    const top = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, S('#stages .wrap'));
    await page.evaluate((y) => window.scrollTo(0, y - 300), top); await page.waitForTimeout(500);
    log('stages 200px in (12 %)', await state(page));
    await page.evaluate((y) => window.scrollTo(0, y - 100), top); await page.waitForTimeout(500);
    log('stages 400px in (25 %)', await state(page));
    await page.waitForTimeout(1800);
    log('rail', await page.evaluate(([r, d]) => ({ after: getComputedStyle(document.querySelector(r), '::after').transform, dots: [...document.querySelectorAll(d)].map((e) => getComputedStyle(e).opacity + ' ' + getComputedStyle(e).transform) }), [S('.st-rail'), S('.st-dot')]));
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    log('back to top', await state(page));
    await page.close();
  }
  // 2. paired cards, card hover, focus, guide dialog (desktop)
  {
    const page = await open(1440, 900);
    const card = (name) => page.locator(S('.st-box .pc')).filter({ hasText: name }).first();
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), S('#stages')); await page.waitForTimeout(600);
    for (const name of ['Trade Finance Private Equity', 'Community Bank Private Equity', 'Providence Asset Management', 'Regenerative Economy']) {
      await card(name).hover(); await page.waitForTimeout(400);
      const s = await state(page);
      log('hover ' + name, { cards: s.cards, transform: await card(name).evaluate((e) => getComputedStyle(e).transform), shadow: await card(name).evaluate((e) => getComputedStyle(e).boxShadow) });
    }
    await page.mouse.move(5, 5); await page.waitForTimeout(400);
    log('leave', (await state(page)).cards);
    await page.locator(S('.st-box .pc a')).first().focus(); await page.waitForTimeout(100);
    log('focus PAM view', await state(page));
    // guide: open with the button, focus moves to Close after 60 ms
    // the opening animation (frame timing jitters by a frame between runs, so its definition is compared)
    log('transitions', await page.evaluate(([pa, f, bg]) => [pa, f, bg].map((x) => getComputedStyle(document.querySelector(x)).transition.replace(/ptd-/g, '')), [S('.gd-panel'), S('.gd-fab'), S('.gd-bg')]));
    await page.locator(S('.gd-fab')).click();
    await page.waitForTimeout(600);
    log('open', await state(page));
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    log('escape', await state(page));
    for (const [label, sel] of [['backdrop', S('.gd-bg')], ['close', S('.gd-x')], ['got it', S('.gd-ft .btn')]]) {
      await page.locator(S('.gd-fab')).click(); await page.waitForTimeout(600);
      if (label === 'backdrop') await page.mouse.click(100, 450); else await page.locator(sel).click();
      await page.waitForTimeout(600);
      log('close by ' + label, await state(page));
    }
    // keyboard: Enter on the focused button opens it
    await page.locator(S('.gd-fab')).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
    log('enter opens', await state(page));
    await page.keyboard.press('Tab'); log('tab in guide', (await state(page)).focus);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    await page.close();
  }
  // 3. phone: bottom sheet, touch cards
  for (const [w, h] of [[390, 844], [640, 800], [641, 800]]) {
    const page = await open(w, h);
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), S('#stages')); await page.waitForTimeout(800);
    log(w + ' stages', await state(page));
    await page.locator(S('.gd-fab')).click(); await page.waitForTimeout(700);
    log(w + ' open', await state(page));
    log(w + ' body scroll', await page.evaluate((s) => { const b = document.querySelector(s); return [b.scrollHeight > b.clientHeight, getComputedStyle(b).overscrollBehaviorY]; }, S('.gd-body')));
    await page.locator(S('.gd-x')).click(); await page.waitForTimeout(600);
    log(w + ' closed', await state(page));
    await page.close();
  }
  // 4. live resize: the rail hides below 1024, the grid becomes one column
  {
    const page = await open(1440, 900);
    for (const [w, h] of [[1100, 900], [1024, 900], [1023, 900], [700, 900], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(150);
      log('resize ' + w, await page.evaluate(([r, g, c]) => [getComputedStyle(document.querySelector(r)).display, getComputedStyle(document.querySelector(g)).gridTemplateColumns, [...document.querySelectorAll(c)].map((e) => Math.round(e.getBoundingClientRect().width)).join(',')], [S('.st-rail'), S('.st-grid'), S('.st-c')]));
    }
    await page.close();
  }
  // 5. reduced motion
  {
    const page = await open(1440, 900, 'reduce');
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), S('#stages')); await page.waitForTimeout(500);
    log('reduced', await page.evaluate(([r, d, p, c]) => ({
      railAfter: getComputedStyle(document.querySelector(r), '::after').transitionDuration + ' ' + getComputedStyle(document.querySelector(r), '::after').transform,
      dot: getComputedStyle(document.querySelector(d)).transitionDuration + ' ' + getComputedStyle(document.querySelector(d)).opacity,
      pulse: getComputedStyle(document.querySelector(p), '::after').animationName.replace(/^ptd-/, ''),
      card: getComputedStyle(document.querySelector(c)).transform,
    }), [S('.st-rail'), S('.st-dot'), S('.st-node--op .st-dot'), S('.st-box .pc')]));
    await page.locator(S('.st-box .pc')).nth(1).hover(); await page.waitForTimeout(400);
    log('reduced hover', await page.evaluate((c) => [...document.querySelectorAll(c)].map((e) => getComputedStyle(e).transform).join(' '), S('.st-box .pc')));
    await page.locator(S('.gd-fab')).click(); await page.waitForTimeout(400);
    log('reduced guide', await state(page));
    await page.close();
  }
  console.log(lines.join('\n').replace(/ptd-/g, ''));
  await browser.close();
})();
