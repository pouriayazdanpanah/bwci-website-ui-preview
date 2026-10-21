// Dev-only QA for the port: GovNav and the person cards across configured routes and images, duplicate
// execution, a GHL-style re-render and live resizes.
//   NODE_PATH=$(npm root -g) node header-and-lifecycle.js <previewDirUrl> <httpBase>
// (header, drawer, config, hostile host and re-render of the shared chrome are covered by
//  ghl/shared/site-chrome/qa/chrome-behaviour.js and chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = process.argv[2].replace(/\/?$/, '/');
const httpBase = process.argv[3].replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const INLINE = fs.readFileSync(path.join(PAGE, 'governance-leadership.inline.ghl.html'), 'utf8');
const HOSTED = fs.readFileSync(path.join(PAGE, 'governance-leadership.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-governance-leadership-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (html, edit) => html.replace(CFG_RE, (m, a, json, c) => a + '\n' + JSON.stringify(edit(JSON.parse(json)), null, 2) + '\n' + c);

const STATE = () => {
  const r = document.getElementById('bwci-governance-leadership');
  const n = r.querySelector('nav[aria-label="Governance sections"]');
  return {
    nav: (n.querySelector('ul').hidden ? 'select ' : 'list ') + [...n.querySelectorAll('ul a')].map((a) => a.getAttribute('href')).join(',') + ' | ' + [...n.querySelectorAll('option')].map((o) => o.value).join(','),
    cards: [...r.querySelectorAll('a.gv-card')].map((a) => a.getAttribute('href')).join(' , '),
    crumb: [...r.querySelectorAll('nav[aria-label="Breadcrumb"] a')].map((a) => a.getAttribute('href')).join(','),
    imgs: [...r.querySelectorAll('img[data-gvl-person]')].map((i) => {
      const f = i.parentNode.getBoundingClientRect(), b = i.getBoundingClientRect();
      return (i.complete && i.naturalWidth ? 'ok' : 'none') + ' ' + Math.round(b.width) + 'x' + Math.round(b.height) + '/' + Math.round(f.width) + 'x' + Math.round(f.height);
    }).join(' '),
  };
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const page = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    page.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    page.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push(name + ' failed: ' + r.url().slice(0, 100)); });
    const requests = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.route(base + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await page.goto(base + 'variant.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    res[name] = await fn(page, requests);
    await page.close();
  };
  const host = (block, twice) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' +
    block + (twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';

  await run('defaults (inline)', host(INLINE), (page) => page.evaluate(STATE));
  await run('configured routes', host(withCfg(INLINE, (c) => Object.assign(c, { links: Object.assign(c.links, {
    governance: '/governance', governanceBoard: '/governance-board', leadership: '/leadership', governanceFramework: '/governance#gov-framework',
    profileAlexanderAlegriaSaif: '/people/alex', profileFarhadReyazat: '/people/farhad?lang=en', profileGabriellaKarlova: '/people/gabriella#bio',
    profileRichardWerner: '/people/richard', profileEwaDudek: '/people/ewa', profileAgnesGradzewicz: '/people/agnes', profileChristieOsarenren: '/people/christie',
  }) }))), (page) => page.evaluate(STATE));
  await run('hosted placeholders', host(HOSTED), async (page, reqs) => ({ requested: reqs.some((u) => u.includes('REPLACE-WITH')), imgs: (await page.evaluate(STATE)).imgs }));
  await run('hosted real URLs', host(withCfg(HOSTED, (c) => { Object.keys(c.peopleImages).forEach((k) => { c.peopleImages[k] = httpBase + 'ghl/pages/governance-leadership/assets/' + path.basename(c.peopleImages[k]); }); return c; })), (page) => page.evaluate(STATE).then((s) => s.imgs));
  await run('duplicate + re-render + resize', host(INLINE, true), async (page) => {
    const r = {};
    r.instances = await page.evaluate(() => [document.querySelectorAll('#bwci-governance-leadership[data-gvl-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k)).length]);
    await page.evaluate(() => { const old = document.getElementById('bwci-governance-leadership'); const c = old.cloneNode(true); c.removeAttribute('data-gvl-init'); old.replaceWith(c); });
    await page.evaluate(() => window.scrollBy(0, 5)); await page.waitForTimeout(300);
    r.reattached = await page.evaluate(() => window.__bwciGovernanceLeadership && window.__bwciGovernanceLeadership.root === document.getElementById('bwci-governance-leadership'));
    await page.setViewportSize({ width: 600, height: 900 }); await page.waitForTimeout(300);
    r.at600 = await page.evaluate(STATE);
    await page.setViewportSize({ width: 1100, height: 900 }); await page.waitForTimeout(300);
    r.at1100 = (await page.evaluate(STATE)).imgs;
    return r;
  });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
