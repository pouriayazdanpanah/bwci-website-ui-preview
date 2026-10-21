// Dev-only QA for a built port: shared-chrome config keys, asset loading, host isolation and the
// GoHighLevel lifecycle (duplicate script execution, widget re-render).
//   NODE_PATH=$(npm root -g) node chrome-lifecycle.js <slug> <prefix> <httpBase>
//   e.g. node chrome-lifecycle.js platforms plt http://localhost:8123/
// The real built blocks are served with edited config blocks, inside a plain host and a hostile host (aggressive
// global CSS, a <section> wrapper, content above and below, and the script executed twice).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const [slug, P, httpBase] = process.argv.slice(2);
const PAGE = path.resolve(__dirname, '../../../pages', slug);
const INLINE = fs.readFileSync(path.join(PAGE, slug + '.inline.ghl.html'), 'utf8');
const HOSTED = fs.readFileSync(path.join(PAGE, slug + '.ghl.html'), 'utf8');
const ROOT = 'bwci-' + slug;
const CFG_RE = new RegExp('(<script type="application/json" id="' + ROOT + '-config">)([\\s\\S]*?)(</script>)');
const base = httpBase.replace(/\/?$/, '/') + 'ghl/pages/' + slug + '/_build/preview/';
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3,h4,h5{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'ul{padding-left:40px;list-style:disc}li{margin-bottom:10px}button{margin:5px;padding:10px;border:2px solid blue;background:yellow}img{border:5px solid lime;max-width:100%;height:auto}' +
  'nav{background:#ccc;padding:20px}header,footer{background:#000;padding:30px}section{padding:40px;background:#eee}.above{height:300px;background:#223}';
const host = (block, hostile) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
  (hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body style="overflow:auto">' +
  (hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (hostile ? '</section><div class="above">below</div>' +
  '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
const withCfg = (html, edit) => html.replace(CFG_RE, (m, a, json, c) => a + '\n' + (typeof edit === 'string' ? edit : JSON.stringify(edit(JSON.parse(json)), null, 2)) + '\n' + c);

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const errors = [];
  async function run(name, html, fn, opts) {
    const page = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    page.on('pageerror', (e) => errors.push(name + ': ' + String(e).slice(0, 140)));
    // the QA proxy cannot serve Google Fonts (certificate error); those console lines are expected here
    page.on('console', (m) => { if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID/.test(m.text())) errors.push(name + ' console: ' + m.text().slice(0, 140)); });
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    page.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push(name + ' failed: ' + r.url().slice(0, 100)); });
    await page.route(base + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await page.goto(base + 'variant.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    out[name] = await fn(page, requests);
    await page.close();
  }
  const R = '#' + ROOT;
  const has = (page, sel) => page.evaluate((s) => !!document.querySelector(s), sel);

  await run('inline: chrome + images', host(INLINE), async (page) => ({
    header: await has(page, R + ' [data-' + P + '-hdr]'), footer: await has(page, R + ' [data-' + P + '-footer]'), breadcrumb: await has(page, R + ' nav[aria-label="Breadcrumb"]'),
    logos: await page.evaluate((p) => [...document.querySelectorAll('[data-' + p + '-asset="logoImage"]')].map((i) => i.naturalWidth + 'x' + i.naturalHeight).join(' '), P),
    images: await page.evaluate((r) => [...document.querySelectorAll(r + ' img')].filter((i) => i.getAttribute('src')).map((i) => i.complete && i.naturalWidth > 0).every(Boolean), R),
    unresolved: await page.evaluate((p) => [...new Set([...document.querySelectorAll('[data-' + p + '-link]')].filter((a) => a.getAttribute('href') === '#').map((a) => a.getAttribute('data-' + p + '-link')))].join(','), P),
  }));
  await run('hosted placeholders', host(HOSTED), async (page, reqs) => ({
    srcless: await page.evaluate((p) => [...document.querySelectorAll('[data-' + p + '-asset]')].filter((i) => !i.getAttribute('src')).length, P),
    placeholderRequested: reqs.some((u) => u.includes('REPLACE-WITH')),
  }));
  await run('hosted real URLs', host(withCfg(HOSTED, (c) => { Object.keys(c).filter((k) => /Image$/.test(k)).forEach((k) => { c[k] = k === 'logoImage' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' : c[k]; }); return c; })), async (page) => ({
    logos: await page.evaluate((p) => [...document.querySelectorAll('[data-' + p + '-asset="logoImage"]')].map((i) => i.naturalWidth).join(' '), P),
  }));
  await run('showHeader/showFooter false', host(withCfg(INLINE, (c) => Object.assign(c, { showHeader: false, showFooter: false }))), async (page) => ({
    header: await has(page, R + ' [data-' + P + '-hdr]'), footer: await has(page, R + ' [data-' + P + '-footer]'),
    vars: await page.evaluate((r) => { const cs = getComputedStyle(document.querySelector(r)); return cs.getPropertyValue('--util-h') + ' ' + cs.getPropertyValue('--nav-h'); }, R),
    firstTop: await page.evaluate((r) => Math.round(document.querySelector(r + ' section').getBoundingClientRect().top), R),
  }), {});
  await run('footer wording', host(withCfg(INLINE, (c) => Object.assign(c, { footer: { regulatoryLine: 'Regulatory line.', registeredJurisdiction: 'England and Wales', companyNumber: '01234567', registeredOffice: '1 Example Street, London' } }))), async (page) => page.evaluate((p) => {
    const legal = document.querySelector('[data-' + p + '-legal]');
    return [legal.firstElementChild.className + ': ' + legal.firstElementChild.textContent, document.querySelector('[data-' + p + '-legal-line]').textContent];
  }, P));
  await run('links override', host(withCfg(INLINE, (c) => { c.links.contact = '/contact'; c.links.home = '/home'; return c; })), async (page) => page.evaluate((p) => ['contact', 'home'].map((k) => k + ':' + [...document.querySelectorAll('[data-' + p + '-link="' + k + '"]')].map((a) => a.getAttribute('href')).join(',')), P));
  await run('broken JSON', host(withCfg(INLINE, '{ not json')), async (page) => {
    await page.locator(R + ' [data-' + P + '-dd-btn]').first().click();
    return { header: await has(page, R + ' [data-' + P + '-hdr]'), ddWorks: await page.evaluate((p) => !document.querySelector('[data-' + p + '-dd-panel]').hidden, P) };
  });

  // hostile host: duplicate script, isolation, overflow restore, re-render
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile ' + w, host(INLINE, true), async (page) => {
      const r = {};
      r.instances = await page.evaluate(([root, p]) => [document.querySelectorAll('#' + root + '[data-' + p + '-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k)).length], [ROOT, P]);
      r.overflowX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      r.hostH2 = await page.evaluate((root) => { const h2 = document.querySelector('#' + root + ' footer h2'); const cs = getComputedStyle(h2); return cs.fontFamily.slice(0, 20) + ' ' + cs.fontSize + ' ' + cs.color; }, ROOT);
      r.logoBorder = await page.evaluate((p) => getComputedStyle(document.querySelector('[data-' + p + '-asset="logoImage"]')).borderTopWidth, P);
      await page.evaluate(() => window.scrollTo(0, 500)); await page.waitForTimeout(150);
      r.stuckAfterHostContent = await page.evaluate((root) => { const h = document.querySelector('#' + root + ' header[class$="-hdr"], #' + root + ' header[class*="-hdr "]'); return [/--stuck/.test(h.className), Math.round(h.getBoundingClientRect().top)]; }, ROOT);
      if (w < 1280) {
        await page.locator('#' + ROOT + ' [data-' + P + '-menu-open]').click(); await page.waitForTimeout(100);
        r.bodyLocked = await page.evaluate(() => document.body.style.overflow);
        await page.keyboard.press('Escape'); await page.waitForTimeout(80);
        r.bodyRestored = await page.evaluate(() => document.body.style.overflow);
      }
      // GHL re-render: the widget root replaced by a copy of the live markup
      await page.evaluate(([root, p]) => { const old = document.getElementById(root); const c = old.cloneNode(true); c.removeAttribute('data-' + p + '-init'); old.replaceWith(c); }, [ROOT, P]);
      await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(250);
      r.reattached = await page.evaluate((root) => { const k = Object.keys(window).find((x) => /^__bwci/.test(x)); const inst = window[k]; return !!inst && inst.root === document.getElementById(root); }, ROOT);
      if (w >= 1280) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.locator('#' + ROOT + ' [data-' + P + '-dd-btn]').nth(1).click(); await page.waitForTimeout(60);
        r.ddAfterRerender = await page.evaluate((p) => [...document.querySelectorAll('[data-' + p + '-dd-panel]')].map((x) => (x.hidden ? 'o' : 'X')).join(''), P);
      }
      await page.waitForTimeout(3200);
      r.hiddenAfterRerender = await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((res) => setTimeout(res, 40)); } await new Promise((res) => setTimeout(res, 1500)); return document.querySelectorAll('[data-bw-rv="wait"]').length; });
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // reduced motion: content and controls visible after a scroll-through
  await run('reduced motion', host(INLINE), async (page) => {
    await page.waitForTimeout(3000);
    return page.evaluate(async (r) => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((res) => setTimeout(res, 40)); }
      await new Promise((res) => setTimeout(res, 900));
      const els = [...document.querySelectorAll(r + ' section *, ' + r + ' footer *')].filter((e) => e.getClientRects().length);
      return { invisible: els.filter((e) => getComputedStyle(e).opacity === '0' && !e.closest('[aria-hidden="true"]')).length, translated: els.filter((e) => getComputedStyle(e).translate !== 'none').length };
    }, R);
  }, { reducedMotion: 'reduce' });

  console.log(JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
