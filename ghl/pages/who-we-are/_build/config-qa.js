// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), link availability, image priority/fallbacks, repeat execution,
// a copied root with a changed config, and a hostile host.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'who-we-are.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'who-we-are.inline.ghl.html'), 'utf8');
const ASSET = (f) => httpBase + 'ghl/pages/who-we-are/assets/' + f;
// GHL substitutes every merge field in the block's text; `value(name)` gives each field's value (undefined = left literal)
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const page = (block, twice, above) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' +
  (above ? '<div style="height:300px;background:#223"></div>' : '') + block +
  (twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
// synthetic future destinations: every page value gets a distinct path with a query, so composition is visible
const URLS = (name) => (/^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);
const IMAGES = { bwci_img_who_we_are_hero: 'hero-globe.png',
  bwci_img_profile_alexander_alegria_saif: 'alexander-alegria-saif.jpg', bwci_img_profile_farhad_reyazat: 'farhad-reyazat.jpg',
  bwci_img_profile_gabriella_karlova: 'gabriella-karlova.webp', bwci_img_profile_richard_werner: 'richard-werner.webp' };
const IMG = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' : IMAGES[name] ? ASSET(IMAGES[name]) : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-who-we-are');
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : ''));
  const img = (i) => (i.hidden ? 'hidden' : '') + (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  return {
    page: a('main a[data-who-link]').join(' '),
    cards: a('main a.gv-card').join(' '),
    footerWho: a('footer a').filter((h) => /purpose|role|principles|story/.test(h)).join(' '),
    hero: img(r.querySelector('img[data-who-asset="whoWeAreHeroImage"]')),
    portraits: [...r.querySelectorAll('img[data-who-person]')].map(img).join(', '),
    logo: img(r.querySelector('img[data-who-asset="logoImage"]')),
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('img')].map((x) => x.getAttribute('src') || '').join('')),
  };
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const p = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    p.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    const requests = [];
    p.on('request', (r) => requests.push(r.url()));
    p.on('requestfailed', (r) => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push(name + ' failed: ' + r.url().slice(0, 100)); });
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await p.close();
  };
  const state = (p) => p.evaluate(STATE);
  const noImageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;

  // 1. literal (GHL left the fields as written), as pasted
  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: noImageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  // 2. the current account export: every link value is "#", image values unset
  await run('hosted all #', page(substitute(HOSTED, (n) => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: noImageRequests(reqs) }));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  // 3. configured: synthetic URLs for every link value, hosted images for every image value
  const configured = (block) => substitute(block, (n) => URLS(n) || IMG(n));
  await run('hosted configured', page(configured(HOSTED)), (p) => state(p));
  await run('inline configured', page(configured(INLINE)), (p) => state(p));
  // 4. a page URL with its own fragment: section links replace it; profile links keep ?from= before the hash
  await run('hosted fragments', page(substitute(HOSTED, (n) => (n === 'bwci_url_financial_engine' ? '/fe?x=1#old' : n === 'bwci_url_profile_farhad_reyazat' ? '/people/farhad#bio' : URLS(n) || IMG(n)))),
    async (p) => { const s = await state(p); return { page: s.page, cards: s.cards }; });
  // 5. repeat execution, a hostile host with content above, a copied live root with a changed config
  await run('duplicate + copied root', page(configured(INLINE), true, true), async (p) => {
    const r = {};
    r.instances = await p.evaluate(() => [document.querySelectorAll('#bwci-who-we-are').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]);
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-who-we-are-config');
      const cfg = JSON.parse(cfgEl.textContent);
      cfg.links.ourRole = '/our-role-live';
      cfg.links.contact = '#';
      cfgEl.textContent = JSON.stringify(cfg);
      const old = document.getElementById('bwci-who-we-are');
      const c = old.cloneNode(true); old.replaceWith(c);
    });
    await p.waitForTimeout(500);
    r.afterCopy = await p.evaluate(() => {
      const root = document.getElementById('bwci-who-we-are');
      return { ourRole: [...root.querySelectorAll('a[data-who-link="ourRole"]')].map((a) => a.getAttribute('href')).join(' '),
        contact: [...root.querySelectorAll('a[data-who-link="contact"]')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
        engineLitBeforeScroll: root.querySelector('[data-who-engine]').classList.contains('who-lit'),
        owner: window.__bwciWhoWeAre && window.__bwciWhoWeAre.root === root };
    });
    await p.evaluate(() => { const e = document.querySelector('[data-who-engine]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 200); });
    await p.waitForTimeout(600);
    r.engineLitAfterScroll = await p.evaluate(() => document.querySelector('[data-who-engine]').classList.contains('who-lit'));
    r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    return r;
  });
  // 6. a disabled link is announced and does not navigate
  await run('disabled click', page(HOSTED), async (p) => {
    await p.locator('a[data-who-link="ourRole"]').first().click({ force: true });
    await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await p.locator('a[data-who-link="ourRole"]').first().getAttribute('title') };
  });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
