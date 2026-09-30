// Dev-only QA for the port: config block variants and the directory's URL state.
//   NODE_PATH=$(npm root -g) node config-and-url.js <previewBaseUrl>   (e.g. http://localhost:8123/ghl/pages/platforms/_build/preview/)
// Serves preview/plain.html with an edited config block, so every variant runs the real built block.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = process.argv[2];
const PLAIN = fs.readFileSync(path.join(__dirname, 'preview', 'plain.html'), 'utf8');
const HOSTED = fs.readFileSync(path.join(__dirname, '..', 'platforms.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-platforms-config">)([\s\S]*?)(<\/script>)/;

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
  const hrefs = (page) => page.evaluate(() => [...document.querySelectorAll('#bwci-platforms [data-plt-link]')].map((a) => a.getAttribute('data-plt-link') + '=' + a.getAttribute('href')).filter((v, i, s) => s.indexOf(v) === i));
  const url = (page) => page.evaluate(() => location.pathname.replace(/^.*\//, '') + location.search + location.hash);

  /* config variants */
  await run('default (inline image)', PLAIN, async (page) => ({
    header: !!(await page.$('#bwci-platforms .plt-hdr')), footer: !!(await page.$('#bwci-platforms .plt-footer')),
    img: await page.evaluate(() => { const i = document.querySelector('[data-plt-asset]'); return i.src.slice(0, 22) + ' ' + i.naturalWidth + 'x' + i.naturalHeight; }),
    links: (await hrefs(page)).length,
  }));
  await run('hosted placeholder', HOSTED, async (page, reqs) => ({
    imgSrc: await page.evaluate(() => document.querySelector('[data-plt-asset]').getAttribute('src')),
    placeholderRequested: reqs.some((u) => u.includes('REPLACE-WITH')),
  }));
  await run('hosted real URL', withCfg(HOSTED, (c) => Object.assign(c, { platformsHeroImage: base.replace(/_build\/preview\/$/, 'assets/plat-hero-rails.png') })), async (page) => ({
    img: await page.evaluate(() => { const i = document.querySelector('[data-plt-asset]'); return i.getAttribute('src').replace(/^.*\//, '') + ' ' + i.naturalWidth + 'x' + i.naturalHeight; }),
  }));
  await run('showHeader/showFooter false', withCfg(PLAIN, (c) => Object.assign(c, { showHeader: false, showFooter: false })), async (page) => ({
    header: !!(await page.$('#bwci-platforms .plt-hdr')), footer: !!(await page.$('#bwci-platforms .plt-footer')),
    utilH: await page.evaluate(() => getComputedStyle(document.getElementById('bwci-platforms')).getPropertyValue('--util-h')),
    heroTop: await page.evaluate(() => Math.round(document.getElementById('plt-hero').getBoundingClientRect().top)),
  }));
  await run('links override', withCfg(PLAIN, (c) => { c.links.ecosystem = 'https://example.com/eco'; c.links.startConversation = '/contact'; return c; }), async (page) => (await hrefs(page)).filter((h) => /^(ecosystem|startConversation)=/.test(h)));
  await run('broken JSON', withCfg(PLAIN, '{ this is not json'), async (page) => ({
    header: !!(await page.$('#bwci-platforms .plt-hdr')),
    links: (await hrefs(page)).slice(0, 3),
    directoryWorks: await (async () => { await page.locator('[data-plt-mat="Proposed"]').click(); return page.evaluate(() => document.querySelector('[data-plt-res] b').textContent); })(),
  }));

  /* URL state */
  await run('url: initial read keeps URL', PLAIN, async (page) => ({ url: await url(page), res: await page.evaluate(() => document.querySelector('[data-plt-res] b').textContent) }), '?utm_source=a%2Cb&maturity=Operating#plt-directory');
  await run('url: updates own params only', PLAIN, async (page) => {
    await page.evaluate(() => history.replaceState({ host: 'state' }, ''));
    const steps = [];
    await page.locator('[data-plt-rel="Partner Capability"]').click(); steps.push(await url(page));
    await page.locator('[data-plt-mat="All"]').click(); steps.push(await url(page));
    await page.locator('.rx-tile').nth(2).click(); await page.waitForTimeout(300); steps.push(await url(page));
    await page.locator('.jb-btn').nth(1).click(); steps.push(await url(page));
    const histLen = await page.evaluate(() => history.length);
    return { steps, hostState: await page.evaluate(() => history.state), histLen };
  }, '?utm_source=a%2Cb&x=1#top');
  await run('url: unknown values ignored', PLAIN, async (page) => ({ url: await url(page), res: await page.evaluate(() => document.querySelector('[data-plt-res] b').textContent) }), '?maturity=toString&relationship=Group%20Build');
  await run('url: syncUrl false', withCfg(PLAIN, (c) => Object.assign(c, { directory: { syncUrl: false } })), async (page) => {
    await page.locator('[data-plt-mat="Proposed"]').click();
    return { url: await url(page), res: await page.evaluate(() => document.querySelector('[data-plt-res] b').textContent) };
  }, '?relationship=Group%20Build');

  console.log(JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
