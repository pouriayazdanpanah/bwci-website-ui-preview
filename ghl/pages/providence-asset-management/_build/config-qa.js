// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), link availability, image priority/fallbacks (hero and the portrait
// backgrounds), the review badges, repeat execution and a copied root with a changed config.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'providence-asset-management.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'providence-asset-management.inline.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-providence-asset-management-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => a + '\n' + JSON.stringify(edit(JSON.parse(json)), null, 2) + '\n' + c);
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const page = (block, twice, above) => '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0">' +
  (above ? '<div style="height:300px;background:#223"></div>' : '') + block +
  (twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
const ASSET = (f) => httpBase + 'ghl/pages/providence-asset-management/assets/' + f;
const IMAGES = { bwci_img_providence_asset_management_hero: 'pam-hero.png', bwci_img_profile_richard_werner: 'richard-werner.webp',
  bwci_img_profile_farhad_reyazat: 'farhad-reyazat.jpg', bwci_img_profile_gabriella_karlova: 'gabriella-karlova.webp' };
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' : IMAGES[name] ? ASSET(IMAGES[name]) :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-providence-asset-management');
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : ''));
  const img = (i) => (i.hidden ? 'hidden ' : '') + (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  const bg = (el) => { const v = el.style.backgroundImage; return !v ? 'none' : /data:image/.test(v) ? 'data' : /assets\//.test(v) ? 'url' : v.slice(0, 40); };
  return {
    page: a('main a[data-pam-link]').join(' '),
    external: [...r.querySelectorAll('main a[href^="http"]')].map((x) => x.getAttribute('href') + ' ' + x.getAttribute('target')).join(' , '),
    hero: img(r.querySelector('img[data-pam-asset="pamHeroImage"]')),
    portraits: [...r.querySelectorAll('[data-pam-person]')].map(bg).join(', '),
    logo: img(r.querySelector('img[data-pam-asset="logoImage"]')),
    badges: r.querySelectorAll('[data-pam-flag-on]').length,
    roleStyle: getComputedStyle(r.querySelector('.pam-pp-g .gv-role span span')).fontSize,
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('img')].map((x) => x.getAttribute('src') || '').join('') +
      [...r.querySelectorAll('[data-pam-person]')].map((x) => x.style.backgroundImage).join('')),
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
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html', { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await p.close();
  };
  const state = (p) => p.evaluate(STATE);
  const imageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;

  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  await run('hosted configured', page(substitute(HOSTED, URLS)), (p) => state(p));
  await run('inline configured', page(substitute(INLINE, URLS)), (p) => state(p));
  // a JSON-escaped quote in a portrait URL is encoded, so the CSS url("…") stays intact
  await run('portrait URL with a quote', page(substitute(HOSTED, (n) => (n === 'bwci_img_profile_richard_werner' ? ASSET('richard-werner.webp') + '?a=\\"b\\"' : URLS(n)))),
    (p) => p.evaluate(() => { const el = document.querySelector('[data-pam-person="richard-werner"]'); return el.style.backgroundImage.replace(/^.*\?/, '?'); }));
  await run('badges on', page(withCfg(INLINE, (c) => Object.assign(c, { showFlags: true }))), async (p) => {
    const s = await state(p);
    return { badges: s.badges, roleStyle: s.roleStyle, texts: await p.evaluate(() => [...document.querySelectorAll('[data-pam-flag-on]')].map((e) => e.className + ':' + e.textContent).join(' ; ')) };
  });
  await run('badges non-boolean', page(withCfg(INLINE, (c) => Object.assign(c, { showFlags: 'true' }))), async (p) => (await state(p)).badges);
  await run('duplicate + copied root', page(withCfg(substitute(INLINE, URLS), (c) => Object.assign(c, { showFlags: true })), true, true), async (p) => {
    const r = {};
    r.instances = await p.evaluate(() => [document.querySelectorAll('#bwci-providence-asset-management').length, Object.keys(window).filter((k) => /^__bwci/.test(k)), document.querySelectorAll('[data-pam-flag-on]').length]);
    await p.evaluate(() => { const e = document.querySelector('[data-pam-map]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120); });
    await p.waitForTimeout(800);
    r.mapInBefore = await p.evaluate(() => document.querySelector('[data-pam-map]').classList.contains('pam-in'));
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-providence-asset-management-config');
      const cfg = JSON.parse(cfgEl.textContent);
      cfg.links.platforms = '#'; cfg.showFlags = false;
      cfgEl.textContent = JSON.stringify(cfg);
      window.scrollTo(0, 0);
      const old = document.getElementById('bwci-providence-asset-management');
      old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(600);
    r.afterCopy = await p.evaluate(() => {
      const root = document.getElementById('bwci-providence-asset-management');
      return { platforms: [...root.querySelectorAll('main a[data-pam-link="platforms"]')].map((a) => a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
        badges: root.querySelectorAll('[data-pam-flag-on]').length, mapIn: root.querySelector('[data-pam-map]').classList.contains('pam-in'),
        engineLit: root.querySelector('[data-pam-engine]').classList.contains('pam-lit'),
        owner: window.__bwciProvidenceAssetManagement && window.__bwciProvidenceAssetManagement.root === root };
    });
    await p.evaluate(() => { const e = document.querySelector('[data-pam-map]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120); });
    await p.waitForTimeout(800);
    r.mapInAfterScroll = await p.evaluate(() => document.querySelector('[data-pam-map]').classList.contains('pam-in'));
    r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    return r;
  });
  // teardown stops the map's frame loop (motion on, map visible): no further canvas frames on the removed root
  await run('teardown stops the map loop', page(INLINE), async (p) => {
    await p.evaluate(() => { const e = document.querySelector('[data-pam-map]'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120); });
    await p.waitForTimeout(800);
    return p.evaluate(async () => {
      let frames = 0; const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = (f) => { frames++; return raf(f); };
      await new Promise((r) => setTimeout(r, 300)); const running = frames;
      document.getElementById('bwci-providence-asset-management').remove();
      await new Promise((r) => setTimeout(r, 200)); frames = 0;
      await new Promise((r) => setTimeout(r, 500));
      window.requestAnimationFrame = raf;
      return { framesWhileVisible: running > 0, framesAfterRemoval: frames };
    });
  });
  await run('disabled click', page(HOSTED), async (p) => {
    await p.locator('a[data-pam-link="contact"]').first().click({ force: true });
    await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await p.locator('a[data-pam-link="contact"]').first().getAttribute('title') };
  });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
