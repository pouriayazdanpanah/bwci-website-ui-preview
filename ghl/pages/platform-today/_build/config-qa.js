// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), the hero and logo images (priority, fallbacks, no request when unset), link availability (the Providence Asset Management card link and the
// breadcrumb), the guide dialog in a hostile host, repeat execution, a copied root with a changed config while the
// guide is open, and teardown restoring the host's own <html> overflow.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, 'platform-today.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, 'platform-today.inline.ghl.html'), 'utf8');
const CFG_RE = /(<script type="application\/json" id="bwci-platform-today-config">)([\s\S]*?)(<\/script>)/;
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => a + '\n' + JSON.stringify(edit(JSON.parse(json)), null, 2) + '\n' + c);
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;position:static}article{padding:30px;border:3px solid red}small,b,i{font-size:30px}section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"' + (o.htmlOverflow ? ' style="overflow:' + o.htmlOverflow + '"' : '') + '><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' :
  name === 'bwci_img_platform_today_hero' ? httpBase + 'ghl/pages/platform-today/assets/platform-today-hero-arcs.png' :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-platform-today');
  const a = (sel) => [...r.querySelectorAll(sel)].map((x) => x.getAttribute('data-ptd-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' ');
  const img = (i) => (i.complete && i.naturalWidth ? 'ok ' + i.naturalWidth : 'none') + (i.getAttribute('src') ? (i.src.startsWith('data:') ? ' data' : ' url') : ' nosrc');
  return {
    page: a('main a[data-ptd-link]'),
    logo: img(r.querySelector('img[data-ptd-asset="logoImage"]')),
    hero: (r.querySelector('img[data-ptd-asset="platformTodayHeroImage"]').hidden ? 'hidden ' : '') + img(r.querySelector('img[data-ptd-asset="platformTodayHeroImage"]')),
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('img')].map((x) => x.getAttribute('src') || '').join('')),
  };
};
const GUIDE = () => {
  const r = document.getElementById('bwci-platform-today');
  const gd = r.querySelector('[data-ptd-guide]'), panel = r.querySelector('.ptd-gd-panel').getBoundingClientRect();
  return { open: gd.classList.contains('ptd-gd--open') + ' ' + gd.getAttribute('aria-hidden'), panelInView: panel.right <= innerWidth + 1 && panel.left >= -1 && panel.bottom <= innerHeight + 1,
    html: document.documentElement.style.overflow || '-', focus: document.activeElement && (document.activeElement.getAttribute('aria-label') || document.activeElement.tagName),
    fab: r.querySelector('[data-ptd-guide-open]').classList.contains('ptd-gd-fab--on'), lit: r.querySelector('[data-ptd-stages]').classList.contains('ptd-st-on'),
    pairs: [...r.querySelectorAll('article[data-ptd-pair]')].filter((c) => /ptd-pc--(hl|dim)/.test(c.className)).length };
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
  const guide = (p) => p.evaluate(GUIDE);
  const toStages = (p) => p.evaluate(() => document.querySelector('[data-ptd-stages]').scrollIntoView({ block: 'center' }));
  const imageRequests = (reqs) => reqs.filter((u) => /\.(png|jpe?g|webp)(\?|$)/.test(u)).length;

  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline literal', page(INLINE), (p) => state(p));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), async (p, reqs) => Object.assign(await state(p), { imageRequests: imageRequests(reqs) }));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  await run('hosted configured', page(substitute(HOSTED, URLS)), (p) => state(p));
  await run('inline configured', page(substitute(INLINE, URLS)), (p) => state(p));
  // a base URL with its own query and fragment is kept as given
  await run('absolute URL', page(substitute(HOSTED, (n) => (n === 'bwci_url_providence_asset_management' ? ' https://example.com/pam?a=1#top ' : URLS(n)))), (p) => state(p));
  await run('disabled click', page(HOSTED), async (p) => {
    await toStages(p); await p.waitForTimeout(300);
    await p.locator('main a[data-ptd-link="providenceAssetManagement"]').click({ force: true });
    await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await p.locator('main a[data-ptd-link="providenceAssetManagement"]').getAttribute('title') };
  });
  await run('enabled click', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'providence-asset-management?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'pam' }));
    await toStages(p); await p.waitForTimeout(300);
    await Promise.all([p.waitForURL('**/providence-asset-management?v=1'), p.locator('main a[data-ptd-link="providenceAssetManagement"]').click()]);
    return p.url().replace(httpBase, '');
  });

  // the guide in a hostile host (generic CSS, content above and below, the script executed twice), desktop and phone
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile guide ' + w, page(INLINE, { hostile: true, twice: true, htmlOverflow: 'auto' }), async (p) => {
      const r = { owners: await p.evaluate(() => [document.querySelectorAll('[data-ptd-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]) };
      await toStages(p); await p.waitForTimeout(600);
      r.beforeOpen = await guide(p);
      await p.locator('[data-ptd-guide-open]').click(); await p.waitForTimeout(700);
      r.open = await guide(p);
      r.fabStyle = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector('[data-ptd-guide-open]')); return [cs.position, cs.margin, cs.borderTopWidth, cs.backgroundColor].join(' '); });
      await p.keyboard.press('Escape'); await p.waitForTimeout(600);
      r.closed = await guide(p);
      r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // a copied live root (GHL re-render) while the guide is open and a pair is highlighted, with a changed config
  await run('copied root with the guide open', page(substitute(INLINE, URLS), { twice: true, htmlOverflow: 'scroll' }), async (p) => {
    const r = {};
    await toStages(p); await p.waitForTimeout(600);
    await p.locator('article[data-ptd-pair="PAIR A"]').first().hover(); await p.waitForTimeout(200);
    await p.locator('[data-ptd-guide-open]').click(); await p.waitForTimeout(600);
    r.before = await guide(p);
    r.pairsInCopy = await p.evaluate(() => {
      const r0 = {};
      const cfgEl = document.getElementById('bwci-platform-today-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.links.providenceAssetManagement = '#'; cfg.links.platforms = '/new-platforms';
      cfgEl.textContent = JSON.stringify(cfg);
      window.scrollTo(0, 0);
      const old = document.getElementById('bwci-platform-today');
      // the copy also carries a highlighted pair (as if copied mid-hover)
      old.querySelectorAll('article[data-ptd-pair]').forEach((c) => c.classList.add(c.getAttribute('data-ptd-pair') === 'PAIR A' ? 'ptd-pc--hl' : 'ptd-pc--dim'));
      r0.pairsInCopy = old.querySelectorAll('.ptd-pc--hl, .ptd-pc--dim').length;
      old.replaceWith(old.cloneNode(true));
      return r0.pairsInCopy;
    });
    await p.mouse.move(5, 5); await p.waitForTimeout(500);
    r.afterCopy = await guide(p);
    r.afterCopyLinks = await p.evaluate(() => { const root = document.getElementById('bwci-platform-today'); return [...root.querySelectorAll('a[data-ptd-link="providenceAssetManagement"], .ptd-bc-host a[data-ptd-link="platforms"]')].map((a) => a.getAttribute('data-ptd-link') + '=' + a.getAttribute('href') + (a.getAttribute('aria-disabled') ? '(off)' : '')).join(' '); });
    r.owner = await p.evaluate(() => { const a = window.__bwciPlatformToday; return !!a && a.instance && a.instance.root === document.getElementById('bwci-platform-today'); });
    await toStages(p); await p.waitForTimeout(600);
    r.afterScroll = await guide(p);
    await p.locator('[data-ptd-guide-open]').click(); await p.waitForTimeout(600);
    r.reopened = await guide(p);
    return r;
  });
  // teardown while the guide is open restores the host's own <html> overflow and leaves no listener behind
  await run('teardown with the guide open', page(INLINE, { htmlOverflow: 'scroll' }), async (p) => {
    await toStages(p); await p.waitForTimeout(600);
    await p.locator('[data-ptd-guide-open]').click(); await p.waitForTimeout(300);
    const during = await p.evaluate(() => document.documentElement.style.overflow);
    await p.evaluate(() => document.getElementById('bwci-platform-today').remove()); await p.waitForTimeout(200);
    const after = await p.evaluate(() => document.documentElement.style.overflow);
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    return { during, after, afterEscape: await p.evaluate(() => document.documentElement.style.overflow), instance: await p.evaluate(() => window.__bwciPlatformToday && window.__bwciPlatformToday.instance) };
  });
  await run('no IntersectionObserver', page(INLINE).replace('<head>', '<head><script>delete window.IntersectionObserver;</script>'), async (p) => ({ lit: (await guide(p)).lit, fab: (await guide(p)).fab }));

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
