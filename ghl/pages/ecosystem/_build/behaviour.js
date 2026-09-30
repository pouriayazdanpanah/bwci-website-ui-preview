// Dev-only behavioural QA. Runs the same interaction script against the source page and the port and
// prints a comparable trace (source and port selectors differ only where the port prefixes classes).
//   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const routeReact = require('./qa-routes');
const url = process.argv[2];
const label = process.argv[3] || url;

// helpers evaluated in the page; they accept both source and port class names
const LOOP = () => {
  const vis = (el) => el && getComputedStyle(el).display !== 'none' && el.offsetParent !== null;
  const sec = document.querySelector('#blueprint, #eco-blueprint');
  const wide = sec.querySelector('.lp-stage');
  const narrow = sec.querySelector('.lp-mob');
  const layout = vis(wide) ? 'wide' : vis(narrow) ? 'narrow' : 'none';
  const scope = layout === 'wide' ? wide : narrow;
  const t = (sel) => { const el = scope.querySelector(sel); return el ? el.textContent.trim() : null; };
  const nodes = [...scope.querySelectorAll(layout === 'wide' ? '.lp-node' : '.lp-mnode')].map((n) => (n.className.match(/is-(on|dim|off)/) || [])[1]);
  const lens = [...sec.querySelectorAll('.lp-lens button')].findIndex((b) => /(^|\s)(eco-)?on(\s|$)/.test(b.className));
  const dots = [...scope.querySelectorAll('.lp-prog__d')].filter(vis).map((d) => (/(^|\s)(eco-)?on(\s|$)/.test(d.className) ? 'X' : 'o')).join('');
  const playBtn = !!vis(scope.querySelector('.lp-play')); // source unmounts, port hides: both = false
  const plat = layout === 'wide' ? null : !!vis(scope.querySelector('.lp-plat'));
  const stage = sec.querySelector('.lp-stage');
  return { layout, lens, eyebrow: t('.lp-cap__eb'), title: t('.lp-cap__t'), who: layout === 'narrow' ? t('.lp-card__who') : null,
    hint: layout === 'narrow' ? t('.lp-ring__h') : null, nodes: nodes.join(','), dots, playBtn, plat,
    stageH: layout === 'wide' ? stage.style.height : null, scale: layout === 'wide' ? sec.querySelector('.lp-canvas').style.transform : null };
};

async function waitChange(page, prev, ms) {
  const t0 = Date.now();
  for (;;) {
    const s = await page.evaluate(LOOP);
    if (s.eyebrow !== prev) return { s, dt: Date.now() - t0 };
    if (Date.now() - t0 > ms) return { s, dt: null };
    await page.waitForTimeout(100);
  }
}

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k.padEnd(18) + ' ' + JSON.stringify(v));
  const errors = [];
  const open = async (opts) => {
    const page = await browser.newPage(opts);
    page.on('pageerror', (e) => errors.push(String(e)));
    await routeReact(page);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    return page;
  };
  const clickLoop = (page, sel, i) => page.evaluate(([sel, i]) => {
    const sec = document.querySelector('#blueprint, #eco-blueprint');
    const all = [...sec.querySelectorAll(sel)].filter((el) => el.offsetParent !== null);
    all[i].click();
  }, [sel, i]);

  /* ---- desktop loop ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 } });
    await page.evaluate(() => document.querySelector('#blueprint, #eco-blueprint').scrollIntoView());
    await page.waitForTimeout(200);
    let s = await page.evaluate(LOOP);
    log('initial', s);
    const seq = [];
    for (let i = 0; i < 3; i++) { const r = await waitChange(page, s.eyebrow, 6000); seq.push(r.s.eyebrow + ' @' + (r.dt === null ? 'none' : Math.round(r.dt / 500) * 500 + 'ms-bucket')); s = r.s; }
    log('autoplay', seq.map((x) => x.split(' @')[0]));
    await clickLoop(page, '.lp-lens button', 2); await page.waitForTimeout(100);
    log('lens investor', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-node', 3); await page.waitForTimeout(100);
    s = await page.evaluate(LOOP); log('click node 4', s);
    const still = await waitChange(page, s.eyebrow, 5000); log('paused 5s', still.dt === null ? 'no change' : 'CHANGED ' + still.s.eyebrow);
    await clickLoop(page, '.lp-play', 0); await page.waitForTimeout(100);
    s = await page.evaluate(LOOP); log('play', s);
    const nx = await waitChange(page, s.eyebrow, 6000); log('after play', nx.s.eyebrow);
    await clickLoop(page, '.lp-prog__d', 1); await page.waitForTimeout(100);
    log('click dot 2', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-play', 0);
    // offscreen: autoplay must hold while the section is scrolled away
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const before = (await page.evaluate(LOOP)).eyebrow;
    await page.waitForTimeout(5500);
    const after = (await page.evaluate(LOOP)).eyebrow;
    log('offscreen 5.5s', before === after ? 'held ' + after : 'ADVANCED ' + before + ' -> ' + after);
    await page.evaluate(() => document.querySelector('#blueprint, #eco-blueprint').scrollIntoView());
    const back = await waitChange(page, after, 6000); log('back onscreen', back.dt === null ? 'no advance' : 'advanced to ' + back.s.eyebrow);
    // lens: partner, then sme
    await clickLoop(page, '.lp-lens button', 3); await page.waitForTimeout(100);
    log('lens partner', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-lens button', 1); await page.waitForTimeout(100);
    log('lens sme', await page.evaluate(LOOP));
    // off-lens node click (is-off node) then play resumes from the lens's first step
    await clickLoop(page, '.lp-node', 2); await page.waitForTimeout(100);
    log('off-lens node', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-play', 0); await page.waitForTimeout(100);
    s = await page.evaluate(LOOP);
    const r2 = await waitChange(page, s.eyebrow, 6000); log('resume from off', r2.s.eyebrow);

    /* mechanics + participants hover */
    const mech = [];
    for (let i = 0; i < 4; i++) {
      await page.locator('.cm-item').nth(i).hover(); await page.waitForTimeout(700); // let the 0.5 s expand settle
      mech.push(await page.evaluate(() => document.querySelector('.cm-diagram').getAttribute('data-mech') + ':' + [...document.querySelectorAll('.cm-item')].map((b) => (b.className.includes('--on') ? 1 : 0)).join('')));
    }
    log('mechanics hover', mech);
    const parts = [];
    for (let i = 0; i < 4; i++) {
      await page.locator('.pt-node').nth(i).hover(); await page.waitForTimeout(60);
      parts.push(await page.evaluate(() => {
        const p = document.querySelector('.pt-panel');
        return [p.querySelector('.pt-panel__c').textContent.trim(), p.querySelector('.pt-panel__t').textContent.trim(), p.querySelector('.pt-rel').className.replace(/\s+/g, ' ').trim(),
          p.querySelector('.pt-rel').textContent.trim(), [...p.querySelectorAll('.pt-f__t')].map((x) => x.textContent.trim().slice(0, 30)).join('|'),
          [...document.querySelectorAll('.pt-spoke')].map((x) => (x.getAttribute('class').includes('--on') ? 1 : 0)).join(''),
          [...document.querySelectorAll('.pt-port')].map((x) => (x.getAttribute('class').includes('--on') ? 1 : 0)).join(''),
          [...document.querySelectorAll('.pt-node')].map((x) => x.getAttribute('aria-pressed')).join(',')].join(' / ');
      }));
    }
    log('participants', parts);
    await page.close();
  }

  /* ---- width threshold of the loop layouts (900 px board = 964 px viewport) ---- */
  for (const w of [963, 964, 1100]) {
    const page = await open({ viewport: { width: w, height: 900 } });
    const s = await page.evaluate(LOOP);
    log('layout @' + w, { layout: s.layout, stageH: s.stageH, scale: s.scale });
    await page.close();
  }
  // live resize wide -> narrow -> wide keeps the step and switches layout
  {
    const page = await open({ viewport: { width: 1200, height: 900 } });
    await clickLoop(page, '.lp-node', 2); await page.waitForTimeout(100);
    await page.setViewportSize({ width: 600, height: 900 }); await page.waitForTimeout(300);
    const a = await page.evaluate(LOOP);
    await page.setViewportSize({ width: 1300, height: 900 }); await page.waitForTimeout(300);
    const b = await page.evaluate(LOOP);
    log('resize', [a.layout, a.eyebrow, a.hint, b.layout, b.eyebrow, b.stageH]);
    await page.close();
  }

  /* ---- mobile loop ---- */
  {
    const page = await open({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    log('mobile initial', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-mnode', 3); await page.waitForTimeout(100);
    log('mobile node 4', await page.evaluate(LOOP));
    await clickLoop(page, '.lp-play', 0); await page.waitForTimeout(100);
    log('mobile play', await page.evaluate(LOOP));
    await page.close();
  }

  /* ---- reduced motion ---- */
  {
    const page = await open({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await page.evaluate(() => document.querySelector('#blueprint, #eco-blueprint').scrollIntoView());
    const s = await page.evaluate(LOOP);
    const r = await waitChange(page, s.eyebrow, 5000);
    log('reduced motion', [s.playBtn, s.dots, r.dt === null ? 'stays ' + s.eyebrow : 'ADVANCED']);
    log('rv visible', await page.evaluate(() => [...document.querySelectorAll('.rv')].map((e) => getComputedStyle(e).opacity).join(',')));
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors'.padEnd(18) + ' ' + JSON.stringify(errors));
  await browser.close();
})();
