// Dev-only behavioural QA. Runs the same interaction script against the source page and the port
// and prints a comparable trace.   NODE_PATH=$(npm root -g) node behaviour.js <url> [label]
const { chromium } = require('playwright');
const url = process.argv[2];
const label = process.argv[3] || url;

async function state(page) {
  return page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.ops-stage-node')];
    const vp = document.querySelector('.ops-viewport');
    const pr = document.querySelector('.pr');
    const cap = [...document.querySelectorAll('.cap-item')].findIndex((c) => c.classList.contains('cap-item--active'));
    const panel = [...document.querySelectorAll('.ops-panel')].findIndex((p) => p.classList.contains('ops-panel--active'));
    return {
      y: Math.round(window.scrollY),
      opsTop: Math.round(vp.getBoundingClientRect().top),
      stage: nodes.findIndex((n) => n.classList.contains('ops-stage-node--active')),
      panel,
      loop: document.querySelector('.ops-loop-note').classList.contains('ops-loop-note--active'),
      pr: pr.getAttribute('data-active'),
      prTitle: document.querySelector('.pr-reading-title').textContent.trim(),
      cap,
    };
  });
}

(async () => {
  const browser = await chromium.launch();
  const out = [];
  const log = (k, v) => out.push(k + ' ' + JSON.stringify(v));
  const errors = [];

  /* ---------- desktop: wheel capture sequence ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.mouse.move(900, 500);
    // scroll down in 100px wheel notches until 7 stages have been walked and released
    let last = null; const seq = [];
    for (let i = 0; i < 80; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(650);
      const s = await state(page);
      const key = s.stage + (s.opsTop === 64 ? 'L' : '');
      if (key !== last) { seq.push(`${s.stage + 1}@top${s.opsTop}`); last = key; }
      if (s.opsTop < -600) break;
    }
    log('down-sequence', seq.join(' '));
    // back up
    last = null; const up = [];
    for (let i = 0; i < 80; i++) {
      await page.mouse.wheel(0, -100);
      await page.waitForTimeout(650);
      const s = await state(page);
      const key = s.stage + (s.opsTop === 64 ? 'L' : '');
      if (key !== last) { up.push(`${s.stage + 1}@top${s.opsTop}`); last = key; }
      if (s.opsTop > 900) break;
    }
    log('up-sequence', up.join(' '));
    const s = await state(page);
    log('after-up', { stage: s.stage, panel: s.panel });

    // keyboard capture: scroll to lock via wheel, then ArrowDown
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 100); await page.waitForTimeout(120);
      const t = await state(page); if (t.opsTop === 64) break;
    }
    await page.waitForTimeout(700);
    const k0 = await state(page);
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(650);
    await page.keyboard.press('ArrowDown'); await page.waitForTimeout(650);
    const k1 = await state(page);
    await page.keyboard.press('ArrowUp'); await page.waitForTimeout(650);
    const k2 = await state(page);
    log('keys', { lockedTop: k0.opsTop, before: k0.stage, afterDown2: k1.stage, afterUp: k2.stage, yStable: k0.y === k1.y });

    // click neighbour node while locked
    await page.evaluate(() => {
      const n = [...document.querySelectorAll('.ops-stage-node')].find((x) => x.style.opacity === '0.7' && [...document.querySelectorAll('.ops-stage-node')].indexOf(x) > [...document.querySelectorAll('.ops-stage-node')].findIndex((y) => y.classList.contains('ops-stage-node--active')));
      if (n) n.click();
    });
    await page.waitForTimeout(700);
    log('node-click', (await state(page)).stage);

    // principle chapters: hover each
    const prs = [];
    for (let i = 0; i < 5; i++) {
      await page.locator('.pr-chapter').nth(i).hover();
      await page.waitForTimeout(80);
      const t = await state(page); prs.push(t.pr + ':' + t.prTitle);
    }
    log('pr-hover', prs);
    // capabilities hover each
    const cs = [];
    for (let i = 0; i < 6; i++) {
      await page.locator('.cap-item').nth(i).hover();
      await page.waitForTimeout(60);
      cs.push((await state(page)).cap);
    }
    log('cap-hover', cs.join(','));
    await page.close();
  }

  /* ---------- mobile rail ---------- */
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const r = [];
    const snap = async () => page.evaluate(() => ({
      num: document.querySelector('.ops-rail-count b').textContent.trim(),
      title: document.querySelector('.ops-rail-title').textContent.trim(),
      prev: document.querySelector('.ops-rail-arrow--prev').disabled,
      next: document.querySelector('.ops-rail-arrow--next').disabled,
      done: document.querySelectorAll('.ops-rail-dot--done').length,
    }));
    r.push(await snap());
    for (let i = 0; i < 7; i++) { await page.locator('.ops-rail-arrow--next').click({ force: true }); await page.waitForTimeout(150); }
    r.push(await snap());
    await page.locator('.ops-rail-dot').nth(2).click(); await page.waitForTimeout(150);
    r.push(await snap());
    await page.locator('.ops-rail-arrow--prev').click(); await page.waitForTimeout(150);
    r.push(await snap());
    log('mobile-rail', r);
    await page.close();
  }

  console.log('== ' + label);
  out.forEach((l) => console.log(l));
  console.log('errors ' + JSON.stringify(errors));
  await browser.close();
})();
