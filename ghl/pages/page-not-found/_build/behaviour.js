// Dev-only: interaction trace of source or port, for a line-by-line diff of the two.
//   NODE_PATH=$(npm root -g) node behaviour.js <url> <src|port>  > trace.txt
// Covers: the entrance / cone animations (names, timing, and sampled frames), reduced motion, hover and keyboard
// focus on the three links, live resize across the 860 / 480 px breakpoints, orientation, and wheel scrolling of a
// page taller than a short viewport. Link targets differ by design (source: .dc.html files) and are covered by
// config-qa.js.
const { chromium } = require('playwright');
const [url, which] = process.argv.slice(2);
const MAIN = which === 'src' ? 'main' : '#bwci-page-not-found > main';
// selectors that hold in both (the source styles most elements inline, without classes)
const LOGO_LINK = 'header a', LOGO = 'header img', CODE = 'h1 > span:first-child', TITLE = 'h1 > span:last-child';
// an animated element, named by tag and position (class names differ between source and port)
const LABEL = "(e) => e.tagName.toLowerCase() + [...e.closest('main').querySelectorAll('.nf-in, .nf-cone')].indexOf(e)";

(async () => {
  const browser = await chromium.launch();
  const lines = [];
  const log = (k, v) => lines.push(k + ' ' + JSON.stringify(v));
  const open = async (w, h, reducedMotion) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: reducedMotion || 'no-preference' });
    page.on('pageerror', (e) => log('ERROR', String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete));
    return page;
  };
  const q = (page, fn, arg) => page.evaluate(fn, Object.assign({ MAIN, LOGO_LINK, LOGO, CODE, TITLE, LABEL }, arg || {}));
  const geom = (page) => q(page, ({ MAIN, LOGO, CODE, TITLE }) => {
    const m = document.querySelector(MAIN); const r = (s) => { const e = (s === ':scope' ? m : m.querySelector(s)).getBoundingClientRect(); return [e.x, e.y, e.width, e.height].map((v) => Math.round(v * 10) / 10); };
    return { main: r(':scope'), cone: r('.nf-cone'), logo: r(LOGO), copy: r('.nf-copy'), code: r(CODE), title: r(TITLE), acts: r('.nf-acts'),
      btn: r('.nf-btn'), ghost: r('.nf-ghost'), dir: getComputedStyle(m.querySelector('.nf-acts')).flexDirection,
      doc: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
  });

  // 1. animations: what runs, with what timing, and sampled frames
  {
    const page = await open(1440, 900);
    log('animations', await q(page, ({ MAIN, LABEL }) => document.getAnimations().map((a) => {
      const t = a.effect.getTiming(); const el = a.effect.target; const label = eval(LABEL);
      return [label(el), a.animationName.replace(/^nf-/, ''), t.duration, t.delay, t.iterations, t.easing, t.fill, el.closest(MAIN) ? 'in' : 'out'];
    })));
    for (const t of [0, 100, 350, 600, 900, 1200, 1500, 3450, 5700, 10200]) {
      log('frame ' + t, await q(page, ({ MAIN, LABEL, t }) => {
        document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; });
        const m = document.querySelector(MAIN);
        const label = eval(LABEL);
        return [...m.querySelectorAll('.nf-in, .nf-cone')].map((e) => { const cs = getComputedStyle(e); return label(e) + ' ' + (+cs.opacity).toFixed(3) + ' ' + cs.transform; });
      }, { t }));
    }
    // the float keeps running after the entrance
    await q(page, () => document.getAnimations().forEach((a) => a.play()));
    await page.waitForTimeout(200);
    log('running', await q(page, () => document.getAnimations().map((a) => a.animationName.replace(/^nf-/, '') + ':' + a.playState)));
    await page.close();
  }
  // 2. reduced motion: no animation, everything visible
  {
    const page = await open(1440, 900, 'reduce');
    log('reduced', await q(page, ({ MAIN }) => {
      const m = document.querySelector(MAIN);
      return { animations: document.getAnimations().length, els: [...m.querySelectorAll('.nf-in, .nf-cone')].map((e) => { const cs = getComputedStyle(e); return cs.opacity + ' ' + cs.transform + ' ' + cs.animationName; }) };
    }));
    await page.close();
  }
  // 3. hover and keyboard focus (animations finished)
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const page = await open(w, h, 'reduce');
    const state = () => q(page, ({ MAIN, LOGO_LINK }) => {
      const m = document.querySelector(MAIN); const cs = (s) => getComputedStyle(m.querySelector(s));
      return { btn: [cs('.nf-btn').backgroundColor, cs('.nf-btn').color, cs('.nf-ar').transform], ghost: [cs('.nf-ghost').borderTopColor, cs('.nf-ghost').backgroundColor, cs('.nf-ghost').color],
        home: cs(LOGO_LINK).color, focus: document.activeElement && m.contains(document.activeElement) ? (document.activeElement.textContent.trim() || document.activeElement.getAttribute('aria-label')) + ' ' + getComputedStyle(document.activeElement).outline + ' ' + getComputedStyle(document.activeElement).outlineOffset : null };
    });
    log(w + ' rest', await state());
    for (const sel of ['.nf-btn', '.nf-ghost', LOGO_LINK]) {
      await page.hover(MAIN + ' ' + sel); await page.waitForTimeout(350);
      log(w + ' hover ' + sel, await state());
    }
    await page.mouse.move(1, h - 2); await page.waitForTimeout(350);
    log(w + ' unhover', await state());
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(60); log(w + ' tab ' + i, (await state()).focus); }
    await page.close();
  }
  // 4. live resize across the breakpoints, and orientation
  {
    const page = await open(1440, 900, 'reduce');
    for (const [w, h] of [[1100, 700], [861, 700], [860, 700], [600, 900], [481, 900], [480, 900], [390, 844], [844, 390], [390, 844], [1600, 1000]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(120);
      log('resize ' + w + 'x' + h, await geom(page));
    }
    await page.close();
  }
  // 5. a short viewport: the page scrolls natively (wheel and keyboard), nothing is trapped
  {
    const page = await open(320, 400, 'reduce');
    log('short', await geom(page));
    await page.mouse.move(160, 200); await page.mouse.wheel(0, 120); await page.waitForTimeout(300);
    log('wheel', await q(page, () => Math.round(scrollY)));
    await page.evaluate(() => window.scrollTo(0, 0)); await page.keyboard.press('End'); await page.waitForTimeout(300);
    log('End key', await q(page, () => Math.round(scrollY)));
    await page.close();
  }
  console.log(lines.join('\n'));
  await browser.close();
})();
