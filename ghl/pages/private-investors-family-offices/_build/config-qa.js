// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), the two page images and the logo (priority, fallbacks, no request when
// unset), the source props showFlags and showPamCard, link availability (the Providence Asset Management card link,
// the breadcrumb and the page's other links), a hostile host with the script executed twice, a copied root with a
// changed config, teardown, and a browser without IntersectionObserver.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'private-investors-family-offices.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'private-investors-family-offices.inline.ghl.html'), 'utf8');
const ROOT = 'bwci-private-investors-family-offices';
const CFG_RE = /(<script type="application\/json" id="bwci-private-investors-family-offices-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => { const o = JSON.parse(json); edit(o); return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c; });
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'img{max-width:none!important;border:4px solid lime}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;position:static}article{padding:30px;border:3px solid red}small,b,i{font-size:30px}section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' :
  name === 'bwci_img_private_investors_family_offices_hero' ? httpBase + 'ghl/pages/private-investors-family-offices/assets/pf-hero-threads.png' :
  name === 'bwci_img_private_investors_family_offices_impact' ? httpBase + 'ghl/pages/private-investors-family-offices/assets/pf-impact-scale.png' :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-private-investors-family-offices');
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('data-pfo-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' ');
  const img = (i) => (i.hidden ? 'hidden ' : '') + (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  return {
    page: a('main a[data-pfo-link]'),
    breadcrumb: a('.pfo-bc-host a[data-pfo-link]'),
    logo: img(r.querySelector('img[data-pfo-asset="logoImage"]')),
    hero: img(r.querySelector('img[data-pfo-asset="privateInvestorsHeroImage"]')),
    impact: img(r.querySelector('img[data-pfo-asset="privateInvestorsImpactImage"]')),
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('img')].map((x) => x.getAttribute('src') || '').join('')),
  };
};
const PROPS = () => {
  const r = document.getElementById('bwci-private-investors-family-offices');
  const pam = r.querySelector('[data-pfo-pam]');
  return {
    flags: [...r.querySelectorAll('[data-pfo-flag-on]')].map((b) => b.className + ':' + b.textContent + ':' + b.parentElement.tagName).join(' | ') || 'none',
    pam: pam.hidden ? 'hidden' : 'shown ' + Math.round(pam.getBoundingClientRect().height),
    gridRows: getComputedStyle(r.querySelector('.pfo-ar-g')).gridTemplateRows,
    lit: r.querySelector('[data-pfo-cv]').classList.contains('pfo-lit'),
  };
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const p = await browser.newPage(Object.assign({ viewport: { width: 1440, height: 900 } }, opts || {}));
    p.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(name + ' console: ' + m.text().slice(0, 140)); });
    const requests = [];
    p.on('request', (r) => requests.push(r.url()));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await p.close();
  };
  const state = (p) => p.evaluate(STATE);
  const props = (p) => p.evaluate(PROPS);
  const toTrack = (p) => p.evaluate(() => document.querySelector('[data-pfo-cv]').scrollIntoView({ block: 'center' }));
  const imageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;

  // Custom Values: literal (unsubstituted), '#', empty, configured, in both variants
  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline all #', page(substitute(INLINE, () => '#')), (p) => state(p));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  await run('hosted configured', page(substitute(HOSTED, URLS)), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline configured', page(substitute(INLINE, URLS)), (p) => state(p));
  // a base URL with spaces around it and its own query and fragment is trimmed and kept as given
  await run('absolute URL', page(substitute(HOSTED, (n) => (n === 'bwci_url_providence_asset_management' ? ' https://example.com/pam?a=1#top ' : URLS(n)))), (p) => state(p));
  await run('disabled click', page(HOSTED), async (p) => {
    const a = p.locator('main a[data-pfo-link="providenceAssetManagement"]');
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await a.click({ force: true }); await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await a.getAttribute('title') };
  });
  await run('enabled click', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'providence-asset-management?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'pam' }));
    const a = p.locator('main a[data-pfo-link="providenceAssetManagement"]');
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
    await Promise.all([p.waitForURL('**/providence-asset-management?v=1'), a.click()]);
    return p.url().replace(httpBase, '');
  });

  // the source props: defaults, showFlags true, showFlags non-boolean ("true" string keeps the default), showPamCard false
  await run('props default', page(INLINE), (p) => props(p));
  await run('showFlags true', page(withCfg(INLINE, (c) => { c.showFlags = true; })), (p) => props(p));
  await run('showFlags "true" (string)', page(withCfg(INLINE, (c) => { c.showFlags = 'true'; })), (p) => props(p));
  await run('showPamCard false', page(withCfg(INLINE, (c) => { c.showPamCard = false; })), (p) => props(p));
  await run('showPamCard "false" (string)', page(withCfg(INLINE, (c) => { c.showPamCard = 'false'; })), (p) => props(p));

  // a hostile host (generic CSS, content above and below, the script executed twice), desktop and phone
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile ' + w, page(withCfg(INLINE, (c) => { c.showFlags = true; }), { hostile: true, twice: true }), async (p) => {
      const r = { owners: await p.evaluate(() => [document.querySelectorAll('[data-pfo-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]) };
      r.props = await props(p);
      await toTrack(p); await p.waitForTimeout(1200);
      r.lit = (await props(p)).lit;
      r.images = await p.evaluate(() => [...document.querySelectorAll('#bwci-private-investors-family-offices img[data-pfo-asset]')].map((i) => { const b = i.getBoundingClientRect(); return i.getAttribute('data-pfo-asset') + ' ' + Math.round(b.width) + 'x' + Math.round(b.height) + ' ' + getComputedStyle(i).borderTopWidth; }));
      r.badges = await p.evaluate(() => [...document.querySelectorAll('[data-pfo-flag-on]')].map((b) => getComputedStyle(b).fontSize + ' ' + getComputedStyle(b).fontFamily.split(',')[0]));
      r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // a copied live root (GHL re-render) carrying lit and badge state, with a changed config
  await run('copied root', page(withCfg(substitute(INLINE, URLS), (c) => { c.showFlags = true; }), { twice: true }), async (p) => {
    const r = {};
    await toTrack(p); await p.waitForTimeout(1200);
    r.before = await props(p);
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-private-investors-family-offices-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.showFlags = false; cfg.showPamCard = false; cfg.links.providenceAssetManagement = '#'; cfg.links.platforms = '/new-platforms';
      cfgEl.textContent = JSON.stringify(cfg);
      window.scrollTo(0, 0);
      const old = document.getElementById('bwci-private-investors-family-offices');
      old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(500);
    r.afterCopy = await props(p);
    r.afterCopyLinks = await p.evaluate(() => { const root = document.getElementById('bwci-private-investors-family-offices'); return [...root.querySelectorAll('a[data-pfo-link="providenceAssetManagement"], main a[data-pfo-link="platforms"]')].map((a) => a.getAttribute('data-pfo-link') + '=' + a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '); });
    r.owner = await p.evaluate(() => { const a = window.__bwciPrivateInvestorsFamilyOffices; return !!a && a.instance && a.instance.root === document.getElementById('bwci-private-investors-family-offices'); });
    await toTrack(p); await p.waitForTimeout(1200);
    r.afterScroll = await props(p);
    return r;
  });
  // teardown: removing the root leaves no instance and nothing observed
  await run('teardown', page(INLINE), async (p) => {
    await p.evaluate(() => document.getElementById('bwci-private-investors-family-offices').remove()); await p.waitForTimeout(200);
    return { instance: await p.evaluate(() => !!(window.__bwciPrivateInvestorsFamilyOffices && window.__bwciPrivateInvestorsFamilyOffices.instance)) };
  });
  await run('pagehide', page(INLINE), async (p) => {
    await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))); await p.waitForTimeout(100);
    return { app: await p.evaluate(() => typeof window.__bwciPrivateInvestorsFamilyOffices), init: await p.evaluate(() => document.querySelectorAll('[data-pfo-init]').length) };
  });
  await run('no IntersectionObserver', page(INLINE).replace('<head>', '<head><script>delete window.IntersectionObserver;</script>'), (p) => props(p));

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
