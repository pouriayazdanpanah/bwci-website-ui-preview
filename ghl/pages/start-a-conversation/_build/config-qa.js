// Dev-only QA for the port's configuration: GHL Custom Value substitution (modelled as GHL's text replacement of
// {{ custom_values.x }} in the pasted block), the four form links (iframe src only for an http(s) address, the placeholder
// otherwise), the form heights, the default route and the URL hash, the badges (showFlags), link availability (Home,
// Corporate / IR, Verify, "Contact details"), a hostile host with the script executed twice, a copied root, teardown,
// and a browser without IntersectionObserver.
//   NODE_PATH=$(npm root -g) node config-qa.js <httpBase>      e.g. http://localhost:8123/
// (header, drawer, footer and re-render of the shared chrome: ghl/shared/site-chrome/qa/chrome-lifecycle.js)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const httpBase = (process.argv[2] || 'http://localhost:8123/').replace(/\/?$/, '/');
const SLUG = 'start-a-conversation', ROOT = 'bwci-start-a-conversation', KEY = '__bwciStartAConversation';
const PAGE = path.resolve(__dirname, '..');
const HOSTED = fs.readFileSync(path.join(PAGE, SLUG + '.ghl.html'), 'utf8');
const INLINE = fs.readFileSync(path.join(PAGE, SLUG + '.inline.ghl.html'), 'utf8');
const CFG_RE = new RegExp('(<script type="application/json" id="' + ROOT + '-config">)([\\s\\S]*?)(</script>)');
const withCfg = (block, edit) => block.replace(CFG_RE, (m, a, json, c) => { const o = JSON.parse(json); edit(o); return a + '\n' + JSON.stringify(o, null, 2) + '\n' + c; });
const substitute = (block, value) => block.replace(/\{\{\s*custom_values\.([a-z0-9_]+)\s*\}\}/g, (m, name) => { const v = value(name); return v === undefined ? m : v; });
const HOSTILE_CSS = 'html{font-size:10px}body{margin:0;font-family:Georgia,serif;font-size:20px;line-height:1.1;color:#f00;letter-spacing:.2em}*{box-sizing:content-box}' +
  'h1,h2,h3{font-family:Impact;font-size:50px;color:purple;margin:30px 0;text-transform:uppercase}p{margin:0 0 2em;font-size:22px}a{color:orange;text-decoration:underline}' +
  'button{margin:5px;padding:10px;border:2px solid blue;background:yellow;font-size:22px}iframe{border:6px solid red;height:150px;width:300px}' +
  'nav{display:inline;padding:20px}ol,ul,li{list-style:disc;margin:20px;padding:20px}span{font-size:30px}aside{float:left;width:50%}section{padding:40px;background:#eee}div{line-height:2}.above{height:300px;background:#223}';
const page = (block, opts) => {
  const o = opts || {};
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
    (o.hostile ? '<style>' + HOSTILE_CSS + '</style>' : '<style>body{margin:0}</style>') + '</head><body>' +
    (o.hostile ? '<div class="above">above</div><section style="padding:0">' : '') + block + (o.hostile ? '</section><div class="above">below</div>' : '') +
    (o.twice ? '<script>' + block.slice(block.lastIndexOf('<script>') + 8, block.lastIndexOf('</script>')) + '</script>' : '') + '</body></html>';
};
const FORM = (k) => httpBase + 'ghl/pages/' + SLUG + '/_build/qa-form.html?' + k;
const URLS = (name) => (name === 'bwci_img_logo' ? httpBase + 'ghl/shared/site-chrome/assets/bwci-logo.png' :
  /^bwci_url_form_/.test(name) ? FORM(name.slice(14)) :
  /^bwci_url_/.test(name) ? '/' + name.slice(9).replace(/_/g, '-') + '?v=1' : undefined);

const STATE = () => {
  const r = document.getElementById('bwci-start-a-conversation');
  return {
    links: [...r.querySelectorAll('main a[data-scv-link]')].map((x) => x.getAttribute('data-scv-link') + '=' + x.getAttribute('href') + (x.getAttribute('aria-disabled') ? '(off)' : '')).join(' '),
    forms: ['smes', 'investors', 'banks', 'partners'].map((k) => {
      const f = r.querySelector('[data-scv-form="' + k + '"]'), e = r.querySelector('[data-scv-embed="' + k + '"]'), ph = r.querySelector('[data-scv-ph="' + k + '"]');
      return k + ':' + (f.getAttribute('src') ? 'src=' + f.getAttribute('src').replace(location.origin, '') : 'nosrc') + (e.hidden ? ' embed-hidden' : '') + (ph.hidden ? '' : ' placeholder');
    }).join(' | '),
    open: [...r.querySelectorAll('[data-scv-panel]')].filter((p) => !p.hidden).map((p) => p.getAttribute('data-scv-panel')).join(','),
    flags: [...r.querySelectorAll('[data-scv-flag]')].filter((f) => !f.hidden).length,
    height: (() => { const f = r.querySelector('[data-scv-panel]:not([hidden]) iframe'); const e = r.querySelector('[data-scv-panel]:not([hidden]) [data-scv-embed]'); return e.hidden ? 'n/a' : Math.round(f.getBoundingClientRect().height); })(),
    raw: /\{\{|\}\}/.test([...r.querySelectorAll('a')].map((x) => x.getAttribute('href')).join('') + [...r.querySelectorAll('iframe,img')].map((x) => x.getAttribute('src') || '').join('')),
  };
};

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const res = {};
  const run = async (name, html, fn, opts) => {
    const o = opts || {};
    const p = await browser.newPage({ viewport: o.viewport || { width: 1440, height: 900 } });
    p.on('pageerror', (e) => errors.push(name + ': ' + String(e)));
    p.on('console', (m) => { if (m.type() === 'error') errors.push(name + ' console: ' + m.text().slice(0, 140)); });
    const requests = [];
    p.on('request', (r) => requests.push(r.url()));
    await p.route(httpBase + 'variant.html', (r) => r.fulfill({ contentType: 'text/html; charset=utf-8', body: html }));
    await p.goto(httpBase + 'variant.html' + (o.hash || ''), { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    res[name] = await fn(p, requests);
    await p.close();
  };
  const state = (p) => p.evaluate(STATE);
  const formRequests = (reqs) => reqs.filter((u) => /qa-form\.html/.test(u)).map((u) => u.split('?')[1]).join(',') || 'none';

  // Custom Values: literal (unsubstituted), '#', empty, configured
  await run('hosted literal', page(HOSTED), async (p, reqs) => Object.assign(await state(p), { formRequests: formRequests(reqs) }));
  await run('hosted all #', page(substitute(HOSTED, () => '#')), (p) => state(p));
  await run('inline empty', page(substitute(INLINE, () => '')), (p) => state(p));
  // configured: only the open route's lazy iframe loads; the others load when their route opens
  await run('hosted configured', page(substitute(HOSTED, URLS)), async (p, reqs) => {
    const r = Object.assign(await state(p), { formRequests: formRequests(reqs) });
    await p.locator('[data-scv-tab="banks"]').click(); await p.waitForTimeout(600);
    r.afterBanks = formRequests(reqs);
    return r;
  });
  // unusable form values show the placeholder: a relative path, javascript:, a value with spaces
  await run('unusable form values', page(substitute(HOSTED, (n) => (n === 'bwci_url_form_smes' ? '/forms/smes' : n === 'bwci_url_form_investors' ? 'javascript:alert(1)' : n === 'bwci_url_form_banks' ? 'https://x.test/a b' : n === 'bwci_url_form_partners' ? '  https://forms.test/partners?x=1  ' : URLS(n)))), (p) => state(p));
  // form heights: valid numbers apply, anything else keeps the source's 880 / 1180 px
  await run('form height 1240', page(withCfg(substitute(INLINE, URLS), (c) => { c.formHeight = 1240; })), async (p) => (await state(p)).height);
  await run('form height "abc"', page(withCfg(substitute(INLINE, URLS), (c) => { c.formHeight = 'abc'; })), async (p) => (await state(p)).height);
  await run('form height 50', page(withCfg(substitute(INLINE, URLS), (c) => { c.formHeight = 50; })), async (p) => (await state(p)).height);
  await run('phone height default', page(substitute(INLINE, URLS)), async (p) => (await state(p)).height, { viewport: { width: 390, height: 844 } });
  await run('phone height 1500', page(withCfg(substitute(INLINE, URLS), (c) => { c.formHeightPhone = 1500; })), async (p) => (await state(p)).height, { viewport: { width: 390, height: 844 } });
  // the route at load
  await run('defaultRoute banks', page(withCfg(INLINE, (c) => { c.defaultRoute = 'banks'; })), async (p) => (await state(p)).open);
  await run('defaultRoute "none"', page(withCfg(INLINE, (c) => { c.defaultRoute = 'none'; })), async (p) => (await state(p)).open);
  await run('hash #partners over default banks', page(withCfg(INLINE, (c) => { c.defaultRoute = 'banks'; })), async (p) => (await state(p)).open, { hash: '#partners' });
  // badges
  await run('flags default', page(INLINE), async (p) => (await state(p)).flags);
  await run('flags off', page(withCfg(INLINE, (c) => { c.showFlags = false; })), async (p) => (await state(p)).flags);
  await run('flags "false" (string)', page(withCfg(INLINE, (c) => { c.showFlags = 'false'; })), async (p) => (await state(p)).flags);
  // clicks
  await run('disabled click', page(HOSTED), async (p) => {
    const a = p.locator('main a[data-scv-link="contactDetails"]');
    await a.scrollIntoViewIfNeeded(); await a.click({ force: true }); await p.waitForTimeout(200);
    return { url: p.url().replace(httpBase, ''), title: await a.getAttribute('title') };
  });
  await run('enabled click', page(substitute(HOSTED, URLS)), async (p) => {
    await p.route(httpBase + 'contact?v=1', (r) => r.fulfill({ contentType: 'text/html', body: 'contact' }));
    const a = p.locator('main a[data-scv-link="contactDetails"]');
    await a.scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    await Promise.all([p.waitForURL('**/contact?v=1#cnt-details'), a.click()]);
    return p.url().replace(httpBase, '');
  });

  // a hostile host (generic CSS including button and iframe rules, content above and below, the script executed twice)
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    await run('hostile ' + w, page(substitute(INLINE, URLS), { hostile: true, twice: true }), async (p) => {
      const r = { owners: await p.evaluate(() => [document.querySelectorAll('[data-scv-init]').length, Object.keys(window).filter((k) => /^__bwci/.test(k))]) };
      r.layout = await p.evaluate(() => {
        const root = document.getElementById('bwci-start-a-conversation');
        const pick = (s) => { const e = root.querySelector(s); const c = getComputedStyle(e); const b = e.getBoundingClientRect(); return Math.round(b.width) + 'x' + Math.round(b.height) + ' ' + c.display + ' ' + c.borderTopWidth; };
        return [pick('.scv-sc-tabs'), pick('.scv-sc-tab'), pick('[data-scv-panel]:not([hidden])'), pick('[data-scv-panel]:not([hidden]) iframe'), pick('.scv-sc-back')];
      });
      await p.locator('[data-scv-tab="partners"]').click(); await p.waitForTimeout(500);
      r.afterClick = (await state(p)).open;
      r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      return r;
    }, { viewport: { width: w, height: h } });
  }
  // a copied live root (GHL re-render) after choosing a route, with a changed config
  await run('copied root', page(substitute(INLINE, URLS), { twice: true }), async (p) => {
    const r = {};
    await p.locator('[data-scv-tab="investors"]').click(); await p.waitForTimeout(300);
    r.before = await state(p);
    await p.evaluate(() => {
      const cfgEl = document.getElementById('bwci-start-a-conversation-config');
      const cfg = JSON.parse(cfgEl.textContent); cfg.showFlags = false; cfg.forms.investors = '#'; cfg.links.verify = '/new-verify';
      cfgEl.textContent = JSON.stringify(cfg);
      const old = document.getElementById('bwci-start-a-conversation');
      old.replaceWith(old.cloneNode(true));
    });
    await p.waitForTimeout(400);
    r.after = await state(p);
    r.live = await p.evaluate(() => document.querySelector('[data-scv-live]').textContent);
    r.owner = await p.evaluate((k) => { const a = window[k]; return !!a && a.instance && a.instance.root === document.getElementById('bwci-start-a-conversation'); }, KEY);
    // the old instance's hashchange listener is gone: only the new one reacts
    await p.evaluate(() => { location.hash = '#banks'; }); await p.waitForTimeout(300);
    r.afterHash = (await state(p)).open;
    return r;
  });
  await run('teardown', page(INLINE), async (p) => {
    await p.locator('[data-scv-panel]:not([hidden]) [data-scv-back]').click(); // starts the delayed focus
    await p.evaluate(() => document.getElementById('bwci-start-a-conversation').remove()); await p.waitForTimeout(600);
    await p.evaluate(() => { location.hash = '#banks'; }); await p.waitForTimeout(200);
    return { instance: await p.evaluate((k) => !!(window[k] && window[k].instance), KEY) };
  });
  await run('pagehide', page(INLINE), async (p) => {
    await p.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))); await p.waitForTimeout(100);
    return { app: await p.evaluate((k) => typeof window[k], KEY), init: await p.evaluate(() => document.querySelectorAll('[data-scv-init]').length) };
  });
  await run('no IntersectionObserver', page(substitute(INLINE, URLS)).replace('<head>', '<head><script>delete window.IntersectionObserver;</script>'), async (p) => {
    await p.locator('[data-scv-tab="banks"]').click(); await p.waitForTimeout(300);
    return (await state(p)).open;
  });

  console.log(JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await browser.close();
})();
