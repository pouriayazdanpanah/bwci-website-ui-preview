// Dev-only QA for the port: config block variants.
//   NODE_PATH=$(npm root -g) node config.js <previewBaseUrl>   (e.g. http://localhost:8123/ghl/pages/investors-partners/_build/preview/)
// Serves preview/plain.html with an edited config block, so every variant runs the real built block.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = process.argv[2];
const PLAIN = fs.readFileSync(path.join(__dirname, 'preview', 'plain.html'), 'utf8');
const HOSTED = fs.readFileSync(path.join(__dirname, '..', 'investors-partners.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-investors-partners-config">)([\s\S]*?)(<\/script>)/;

(async () => {
  const browser = await chromium.launch();
  const out = {};
  const errors = [];
  async function run(name, html, fn, query) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', (e) => errors.push(name + ': ' + String(e).slice(0, 120)));
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.route(base + 'variant.html*', (r) => r.fulfill({ contentType: 'text/html', body: html }));
    await page.goto(base + 'variant.html' + (query || ''), { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    out[name] = await fn(page, requests);
    await page.close();
  }
  const withCfg = (html, edit) => html.replace(CFG_RE, (m, a, json, c) => a + '\n' + (typeof edit === 'string' ? edit : JSON.stringify(edit(JSON.parse(json)), null, 2)) + '\n' + c);
  const hrefs = (page) => page.evaluate(() => [...document.querySelectorAll('#bwci-investors-partners [data-inv-link]')].map((a) => a.getAttribute('data-inv-link') + '=' + a.getAttribute('href')).filter((v, i, s) => s.indexOf(v) === i));
  
  /* config variants */
  await run('default (inline image)', PLAIN, async (page) => ({
    header: !!(await page.$('#bwci-investors-partners .inv-hdr')), footer: !!(await page.$('#bwci-investors-partners .inv-footer')),
    img: await page.evaluate(() => { const i = document.querySelector('[data-inv-asset]'); return i.src.slice(0, 22) + ' ' + i.naturalWidth + 'x' + i.naturalHeight; }),
    links: (await hrefs(page)).length,
  }));
  await run('hosted placeholder', HOSTED, async (page, reqs) => ({
    imgSrc: await page.evaluate(() => document.querySelector('[data-inv-asset]').getAttribute('src')),
    placeholderRequested: reqs.some((u) => u.includes('REPLACE-WITH')),
  }));
  await run('hosted real URL', withCfg(HOSTED, (c) => Object.assign(c, { investorsHeroImage: base.replace(/_build\/preview\/$/, 'assets/inv-hero-flow.png') })), async (page) => ({
    img: await page.evaluate(() => { const i = document.querySelector('[data-inv-asset]'); return i.getAttribute('src').replace(/^.*\//, '') + ' ' + i.naturalWidth + 'x' + i.naturalHeight; }),
  }));
  await run('showHeader/showFooter false', withCfg(PLAIN, (c) => Object.assign(c, { showHeader: false, showFooter: false })), async (page) => ({
    header: !!(await page.$('#bwci-investors-partners .inv-hdr')), footer: !!(await page.$('#bwci-investors-partners .inv-footer')),
    utilH: await page.evaluate(() => getComputedStyle(document.getElementById('bwci-investors-partners')).getPropertyValue('--util-h')),
    heroTop: await page.evaluate(() => Math.round(document.getElementById('inv-hero').getBoundingClientRect().top)),
  }));
  await run('links override', withCfg(PLAIN, (c) => { c.links.ecosystem = 'https://example.com/eco'; c.links.startConversation = '/contact'; return c; }), async (page) => (await hrefs(page)).filter((h) => /^(ecosystem|startConversation)=/.test(h)));
  await run('broken JSON', withCfg(PLAIN, '{ this is not json'), async (page) => ({
    header: !!(await page.$('#bwci-investors-partners .inv-hdr')),
    links: (await hrefs(page)).slice(0, 3),
    stillWorks: await (async () => { await page.locator('[data-inv-rt="3"]').click(); return page.evaluate(() => document.querySelector('.rt-p__role').textContent); })(),
  }));

  console.log(JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
